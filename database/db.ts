import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { ManhwaGenre, Author, ManhwaAuthor } from '@/helpers/types'
import ManhwaAuthorModel from './models/ManhwaAuthorModel'
import ManhwaGenreModel from './models/ManhwaGenreModel'
import LastUpdateModel from './models/LastUpdateModel'
import { Database, Q } from "@nozbe/watermelondb"
import ChapterModel from './models/ChapterModel'
import ManhwaModel from './models/ManhwaModel'
import { spGetCacheUrl, supabase } from '@/lib/supabase'
import AuthorModel from './models/AuthorModel'
import GenreModel  from './models/GenreModel'
import DailyManhwaModel from './models/DailyManhwaModel'
import { Model } from '@nozbe/watermelondb'
import { fetchJson } from '@/helpers/util'
import { Chapter } from '@/model/Chapter'
import { Manhwa } from '@/model/Manhwa'
import { Platform } from "react-native"
import migrations from './migrations'
import { schemas } from "./schemas"
import { sortBy } from 'lodash'
import { useDailyManhwaState } from '@/store/dailyManhwaStore'


const adapter = new SQLiteAdapter({
    schema: schemas,
    migrations: migrations,
    jsi: Platform.OS === "ios",
    onSetUpError: () => {
        console.log("database not inited")
    }
})


const database = new Database({
    adapter: adapter,
    modelClasses: [
        GenreModel,
        ManhwaModel,
        ChapterModel,
        LastUpdateModel,
        ManhwaGenreModel,
        AuthorModel,
        ManhwaAuthorModel,
        DailyManhwaModel
    ]
})


export async function dbReset() {
    await database.write(async () => {
        await database.unsafeResetDatabase()
        console.log("database reseted")
    }).catch(error => console.log(error))
}

async function dbBatch<T extends Model>(items: T[]) {
    const maxBatchItems = 128
    let i = 0
    
    while (i < items.length) {
        await database.batch(items.slice(i, i + maxBatchItems));
        i += maxBatchItems
    }
}

export async function dbGetAll<T extends Model>(table: string): Promise<T[]> {
    return await database
        .collections
        .get<T>(table)
        .query()
        .fetch()
}

export async function dbListTable<T extends Model>(
    table: string,
    callbackfn: (value: T) => any
) {
    const items = await database
        .collections
        .get<T>(table)
        .query()
        .fetch()
        .catch(error => console.log(error))

    if (items) {
        items.forEach(item => callbackfn(item))
    }
}

export async function dbDeleteItemsFromTable<T extends Model>(table_name: string) {
    const allItems = await database
        .collections
        .get<T>(table_name)
        .query()
        .fetch()

    const deleteOperations: any = allItems.map(item => item.prepareDestroyPermanently());

    await database.write(async () => {
        await dbBatch(deleteOperations)
        console.log("All items have been permanently deleted from table", table_name);        
    }).catch(error => console.log("error dbDeleteItemsFromTable", error))

}


export async function dbCreateLastUpdate(table: string, hours: number ): Promise<void> {
    const ms = hours * 60 * 60 * 1000
    const lastUpdates: LastUpdateModel[] | void = await database
        .get<LastUpdateModel>('updates')
        .query(Q.where('table', table))
        .fetch()
        .catch(error => console.log(error))

    await database.write(async () => {
        if (lastUpdates && lastUpdates.length > 0) {
            await lastUpdates[0]
                .update(l => l.refresh_at = ms)
                .catch(error => console.log(error))
        } else {
            await database
                .collections
                .get<LastUpdateModel>('updates')
                .create(update => {
                    update.table = table
                    update.refresh_at = ms
                    update.updated_at = null
                })
                .catch(error => console.log(error))
        }    
    }).catch(error => console.log(error))
}


export async function dbShouldUpdateTable(table: string, forceUpdate: boolean = false): Promise<boolean> {
    const current = Date.now()
    const r = await database.write(async () => {
        const lastUpdates: LastUpdateModel[] | void = await database
            .get<LastUpdateModel>('updates')
            .query(Q.where('table', table))
            .fetch()
            .catch(error => console.log(error))
        
        if (lastUpdates && lastUpdates.length > 0) {
            const up = lastUpdates[0]
            if (forceUpdate || current - up.updated_at >= up.refresh_at) {
                await up.update(u => u.updated_at = current)
                return true
            }
        }
        return false
    }).catch(error => {console.log(error); return false})
    return r
}


export async function dbUpsertGenres(genres: string[]) {
    console.log("upserting genres")

    await dbDeleteItemsFromTable<GenreModel>('genres')

    const itemsCollection = database
        .collections
        .get<GenreModel>('genres')

    const operations: GenreModel[] = genres.map(genre => 
        itemsCollection.prepareCreate(r => {
            r.genre = genre
        })
    )    

    await database.write(async () => {
        await dbBatch<GenreModel>(operations)
    }).catch(error => console.log("error dbUpsertGenres", error))
}

export async function dbGetDailyManhwa(): Promise<{manhwa: Manhwa, cover_image: string} | null> {
    const { data, error } = await supabase
        .from("daily_manhwa")
        .select("manhwa_id, image_url")
        .range(0, 1)
        .order('created_at', {ascending: false})
        .single()
    
    if (error) {
        console.log("error dgGetDailyManhwa", error)
        return null
    }
    
    const items: ManhwaModel[] = await database
        .collections
        .get<ManhwaModel>("manhwas")
        .query(Q.where("manhwa_id", data.manhwa_id))
        .fetch()

    if (items.length > 0) {
        const m = items[0]
        return {
            manhwa: {
                manhwa_id: m.manhwa_id,
                title: m.title,
                descr: m.descr,
                cover_image_url: m.cover_image_url,
                status: m.status,
                color: m.color,
                updated_at: m.updated_at,
                views: m.views,
                rating: m.ratings,
                chapters: []
            },
            cover_image: data.image_url
        }
    }
    return null
}


export async function dbUpsertChapters(data: Chapter[]) {
    console.log("upserting chapters")

    await dbDeleteItemsFromTable<ChapterModel>('chapters')
    
    const itemsCollection = database
        .collections
        .get<ChapterModel>('chapters')
    
    const operations: any = data.map(chapter => 
        itemsCollection.prepareCreate(r => {
            r.chapter_id = chapter.chapter_id
            r.chapter_num = chapter.chapter_num
            r.manhwa_id = chapter.manhwa_id
            r.created_at = chapter.created_at
        })
    )
    
    await database.write(async () => {
        await database.batch(operations);
    }).catch(error => console.log(error))
}


export async function dpUpsertManhwas(manhwas: Manhwa[]) {
    console.log("upserting manhwas")

    const chapters: Chapter[] = []

    const itemsCollection = database
        .collections
        .get<ManhwaModel>('manhwas')
    
    const uniqueIds = manhwas.map(item => item.manhwa_id);
    
    const existingRecords = await itemsCollection
        .query(Q.where('manhwa_id', Q.oneOf(uniqueIds)))
        .fetch()  
    
    const existingById = new Map<number, ManhwaModel>(
        existingRecords.map(record => [record.manhwa_id, record])
    );    
        
    const operations = manhwas.map(manhwa => {

        manhwa.chapters.forEach(c => chapters.push(c))
        const existingRecord = existingById.get(manhwa.manhwa_id);

        if (existingRecord) {
            return existingRecord.prepareUpdate(r => {
                r.manhwa_id = manhwa.manhwa_id
                r.title = manhwa.title
                r.descr = manhwa.descr
                r.cover_image_url = manhwa.cover_image_url
                r.color = manhwa.color
                r.status = manhwa.status
                r.views = manhwa.views
                r.updated_at = manhwa.updated_at
                r.ratings = manhwa.rating
            });
        } else {
            return itemsCollection.prepareCreate(r => {
                r.manhwa_id = manhwa.manhwa_id
                r.title = manhwa.title
                r.descr = manhwa.descr
                r.cover_image_url = manhwa.cover_image_url
                r.color = manhwa.color
                r.status = manhwa.status
                r.updated_at = manhwa.updated_at
                r.views = manhwa.views
                r.ratings = manhwa.rating
            });
        }
    });
    
    await database.write(async () => {
        await dbBatch(operations)
    }).catch(error => console.log("error dpUpsertManhwas", error))

    await dbUpsertChapters(chapters)
}


export async function dbUpsertManhwaViews(manhwa_id: number) {
    const items: ManhwaModel[] = await database
        .collections
        .get<ManhwaModel>('manhwas')
        .query(Q.where('manhwa_id', manhwa_id))
        .fetch()

    if (items.length > 0) {
        await database.write(async () => {
            await items[0].update(r => {r.views += 1})
        }).catch(error => console.log(error))
    }
}


export async function dbSortManhwas(
    compareFn: (a: ManhwaModel, b: ManhwaModel) => number
): Promise<Manhwa[]> {
    const manhwas: ManhwaModel[] = await dbGetAll<ManhwaModel>('manhwas')
    return manhwas
        .sort(compareFn)
        .map(m => {
            return {
                manhwa_id: m.manhwa_id,
                title: m.title,
                descr: m.descr,
                status: m.status,
                updated_at: m.updated_at,
                color: m.color,
                views: m.views,
                rating: null,
                chapters: [],
                cover_image_url: m.cover_image_url
            }
        })
}

export async function dbSortManhwasByViews(): Promise<Manhwa[]> {
    return await dbSortManhwas(
        (a: ManhwaModel, b: ManhwaModel) => {
            if (a.views < b.views) {
                return 1
            } else if (a.views > b.views) {
                return -1;
            }
            return a.manhwa_id < b.manhwa_id ? 1 : -1
        }
    )
}


export async function dbSortManhwasByLastUpdate(): Promise<Manhwa[]> {
    return await dbSortManhwas(
        (a: ManhwaModel, b: ManhwaModel) => {
            const d1 = new Date(a.updated_at)
            const d2 = new Date(b.updated_at)
            if (d1 < d2) {
                return 1
            } else if (d1 > d2) {
                return -1
            }
            return 0
        }
    )
}


export async function dpFetchLast3Chapters(manhwa_id: number): Promise<Chapter[]> {

    const items: ChapterModel[] = await database
        .collections
        .get<ChapterModel>('chapters')
        .query(Q.where('manhwa_id', manhwa_id), Q.sortBy('chapter_num', Q.desc))
        .fetch()
    
    return items.slice(0, 3).map(c => {return {
            chapter_id: c.chapter_id,
            chapter_num: c.chapter_num,
            created_at: c.created_at,
            manhwa_id: c.manhwa_id
        }}
    )
    
}


export async function dbUpsertManhwaGenres(genres: ManhwaGenre[]) {

    await dbDeleteItemsFromTable<ManhwaGenreModel>('manhwa_genres')
    console.log("upsering manhwa_genres")

    const itemsCollection = database
        .collections
        .get<ManhwaGenreModel>('manhwa_genres')

    const operations: ManhwaGenreModel[] = []
    
    genres.forEach(genre => {
        operations.push(itemsCollection.prepareCreate(r => {
            r.manhwa_id = genre.manhwa_id
            r.genre = genre.genre
        }))
    });

    await database.write(async () => {
        await dbBatch<ManhwaGenreModel>(operations)
    }).catch(error => console.log(error))
}


export async function dbUpsertAuthors(authors: Author[]) {
    console.log("upserting authors")

    const itemsCollection = database
        .collections
        .get<AuthorModel>('authors')
    
    const uniqueIds = authors.map(item => item.author_id);
    
    const existingRecords = await itemsCollection
        .query(Q.where('author_id', Q.oneOf(uniqueIds)))
        .fetch()  
    
    const existingById = new Map<number, AuthorModel>(
        existingRecords.map(record => [record.author_id, record])
    );

    const operations: AuthorModel[] = []
                                            
    authors.forEach(author => {        
        if (!existingById.get(author.author_id)) {
            operations.push(itemsCollection.prepareCreate(r => {
                r.author_id = author.author_id
                r.name = author.name
                r.role = author.role
            }))
        } 
    });

    await database.write(async () => {
        await dbBatch(operations)
    }).catch(error => console.log("error dpUpsertManhwas", error))
}


export async function dbUpsertManhwaAuthors(manhwaAuthors: ManhwaAuthor[]) {
    console.log("upserting manhwa authors")
    
    await dbDeleteItemsFromTable<ManhwaAuthorModel>('manhwa_authors')

    const itemsCollection = database
        .collections
        .get<ManhwaAuthorModel>('manhwa_authors')

    const operations: ManhwaAuthorModel[] = []
    
    manhwaAuthors.forEach(manhwaAuthor => {
        operations.push(itemsCollection.prepareCreate(r => {
            r.manhwa_id = manhwaAuthor.manhwa_id
            r.author_id = manhwaAuthor.author_id
        }))
    });

    await database.write(async () => {
        await dbBatch<ManhwaAuthorModel>(operations)
    }).catch(error => console.log(error))
}


export async function dbInit() {
    await dbCreateLastUpdate('manhwas', 4)
}

export async function dbUpdateDB() {
    const { setDailyManhwa } = useDailyManhwaState()
    console.log("updating db")
    const cacheUrls: Map<string, string> = await spGetCacheUrl()
    const db = await fetchJson(cacheUrls.get('db')!)

    const dailyManhwa = await dbGetDailyManhwa();
    if (dailyManhwa?.manhwa && dailyManhwa.cover_image) {
        setDailyManhwa(dailyManhwa.manhwa, dailyManhwa.cover_image)
        console.log("daily manhwa setted!")
    }

    await dpUpsertManhwas(db.manhwas)
    await dbUpsertGenres(db.genres)
    await dbUpsertManhwaGenres(db.manhwa_genres)
    await dbUpsertAuthors(db.authors)
    await dbUpsertManhwaAuthors(db.manhwa_authors)    
}


export async function dbGetManhwasByGenre(genre: string): Promise<Manhwa[]> {
    
    const items: ManhwaGenreModel[] = await database
        .collections
        .get<ManhwaGenreModel>('manhwa_genres')
        .query(Q.where('genre', genre))
        .fetch()

    const manhwasIds: number[] = items.map(item => item.manhwa_id)

    const manhwas: ManhwaModel[] = await database
        .collections
        .get<ManhwaModel>('manhwas')
        .query(Q.where('manhwa_id', Q.oneOf(manhwasIds)))
        .fetch()

    return manhwas.map(r => {return {
        manhwa_id: r.manhwa_id,
        title: r.title,
        descr: r.descr,
        cover_image_url: r.cover_image_url,
        status: r.status,
        color: r.color,
        updated_at: r.updated_at,
        views: r.views,
        rating: r.ratings,
        chapters: []
    }})

}


export async function dbGetManhwaGenres(manhwa_id: number): Promise<string[]> {
    
    const items: ManhwaGenreModel[] = await database
        .collections
        .get<ManhwaGenreModel>('manhwa_genres')
        .query(Q.where('manhwa_id', manhwa_id))
        .fetch()

    return items.map(item => item.genre)
}


export async function dbGetManhwaAuthors(manhwa_id: number): Promise<Author[]> {

    const items: ManhwaAuthorModel[] = await database
        .collections
        .get<ManhwaAuthorModel>('manhwa_authors')
        .query(Q.where('manhwa_id', manhwa_id))
        .fetch()
    
    const ids = items.map(item => item.author_id)

    const authors: AuthorModel[] = await database
        .collections
        .get<AuthorModel>('authors')
        .query(Q.where('author_id', Q.oneOf(ids)))
    
    return authors.map(item => {return {
        author_id: item.author_id,
        name: item.name,
        role: item.role
    }})
    
}


export async function dbGetManhwasByAuthor(author_id: number): Promise<Manhwa[]> {
    
    const items: ManhwaAuthorModel[] = await database
        .collections
        .get<ManhwaAuthorModel>('manhwa_authors')
        .query(Q.where('author_id', author_id))
        .fetch()
        
    const ids: number[] = items.map(item => item.manhwa_id)

    const manhwas: ManhwaModel[] = await database
        .collections
        .get<ManhwaModel>('manhwas')
        .query(Q.where('manhwa_id', Q.oneOf(ids)))
        .fetch()

    return manhwas.map(r => {return {
        manhwa_id: r.manhwa_id,
        title: r.title,
        descr: r.descr,
        cover_image_url: r.cover_image_url,
        status: r.status,
        color: r.color,
        updated_at: r.updated_at,
        views: r.views,
        rating: r.ratings,
        chapters: []
    }})

    
}
