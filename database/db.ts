import { ManhwaGenre, Author, ManhwaAuthor, Recommendation } from '@/helpers/types'
import ManhwaRecommendationModel from './models/ManhwaRecommendationModel'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import ManhwaAuthorModel from './models/ManhwaAuthorModel'
import ManhwaGenreModel from './models/ManhwaGenreModel'
import { spGetCacheUrl, supabase } from '@/lib/supabase'
import LastUpdateModel from './models/LastUpdateModel'
import { Collection, Database, Q } from "@nozbe/watermelondb"
import ChapterModel from './models/ChapterModel'
import ManhwaModel from './models/ManhwaModel'
import AuthorModel from './models/AuthorModel'
import GenreModel  from './models/GenreModel'
import { Model } from '@nozbe/watermelondb'
import { fetchJson } from '@/helpers/util'
import { Chapter } from '@/model/Chapter'
import { Manhwa } from '@/model/Manhwa'
import { Platform } from "react-native"
import migrations from './migrations'
import { schemas } from "./schemas"


const MAX_NUM_OPERATIONS = 128

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
        ManhwaRecommendationModel
    ]
})


//////////////////////////////// CONVERT ////////////////////////////////
/////////////////////////////////////////////////////////////////////////

function dbManhwaModelToManhwa(manhwaModel: ManhwaModel): Manhwa {
    return  {
        manhwa_id: manhwaModel.manhwa_id,
        title: manhwaModel.title,
        descr: manhwaModel.descr,
        status: manhwaModel.status,
        updated_at: manhwaModel.updated_at,
        color: manhwaModel.color,
        views: manhwaModel.views,
        rating: null,
        chapters: [],
        cover_image_url: manhwaModel.cover_image_url
    }
}

function dbChapterModelToChapter(chapterModel: ChapterModel): Chapter {
    return {
        chapter_id: chapterModel.chapter_id,
        chapter_num: chapterModel.chapter_num,
        created_at: chapterModel.created_at,
        manhwa_id: chapterModel.manhwa_id
    }
}


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

export async function dbReset() {
    await database.write(async () => {
        await database.unsafeResetDatabase()
        console.log("database reseted")
    }).catch(error => console.log(error))
}


async function dbBatch<T extends Model>(items: T[]) {
    let i = 0
    await database.write(async () => {
        while (i < items.length) {
            await database.batch(items.slice(i, i + MAX_NUM_OPERATIONS)).catch(
                error => console.log(`
                    error dbBatch (${i}, ${i + MAX_NUM_OPERATIONS}] ${items.length > 0 ? typeof items[0]: ''}`, 
                    error
                )
            )
            i += MAX_NUM_OPERATIONS
        }
    }).catch(error => console.log("error dbBatch", error))
}


function dbGetCollection<T extends Model>(table: string): Collection<T> {
    return database.collections.get<T>(table)
}

export async function dbGetItems<T extends Model>(table: string): Promise<T[] | void> {
    return await database
        .collections
        .get<T>(table)
        .query()
        .fetch()
        .catch(error => console.log(`error dbGetItems ${table}`, error))
}

export async function dbForEach<T extends Model>(
    table: string,
    callbackfn: (value: T) => any
) {
    const items = await database
        .collections
        .get<T>(table)
        .query()
        .fetch()
        .catch(error => console.log("error dbListTable", error))

    if (items) {
        items.forEach(item => callbackfn(item))
    }
}

export async function dbDeleteItemsFromTable<T extends Model>(table: string) {
    const items: T[] | void = await dbGetItems<T>(table)
    if (!items) { return }

    const operations: T[] = items.map(item => item.prepareDestroyPermanently());
    await dbBatch<T>(operations)
}


async function dbCreateUpdateHistory(table: string, hours: number): Promise<void> {
    const ms = hours * 60 * 60 * 1000

    const collection = dbGetCollection<LastUpdateModel>('updates')

    const lastUpdates: LastUpdateModel[] | void = await collection
        .query(Q.where('table', table))
        .fetch()
        .catch(error => console.log("error dbCreateLastUpdate", error))

    await database.write(async () => {
        if (lastUpdates && lastUpdates.length > 0) {
            await lastUpdates[0]
                .update(l => l.refresh_at = ms)
                .catch(error => console.log("error update dbCreateLastUpdate", error))
        } else {
            await collection
                .create(update => {
                    update.table = table
                    update.refresh_at = ms
                    update.updated_at = null
                })
                .catch(error => console.log("update create dbCreateLastUpdate", error))
        }    
    }).catch(error => console.log("error write dbCreateLastUpdate", error))
}


export async function dbShouldUpdate(table: string, forceUpdate: boolean = false): Promise<boolean> {
    const currentTime = Date.now()

    const r = await database.write(async () => {
        const lastUpdates: LastUpdateModel[] | void = await database
            .get<LastUpdateModel>('updates')
            .query(Q.where('table', table))
            .fetch()
            .catch(error => console.log("error fetch dbShouldUpdate", error))
        
        if (lastUpdates && lastUpdates.length > 0) {
            const up = lastUpdates[0]
            if (forceUpdate || currentTime - up.updated_at >= up.refresh_at) {
                await up.update(u => u.updated_at = currentTime)
                return true
            }
        }
        return false
    }).catch(error => {console.log("error write dbShouldUpdate", error); return false})

    return r
}

/////////////////////////////////////////////////////////////////////////
///////////////////////// UPSERT | INSERT | SET /////////////////////////

async function dbSetGenres(genres: string[]) {
    console.log("upserting genres")

    await dbDeleteItemsFromTable<GenreModel>('genres')

    const collection = dbGetCollection<GenreModel>('genres')

    const operations: GenreModel[] = genres.map(genre => 
        collection.prepareCreate(r => { r.genre = genre })
    )    

    await dbBatch<GenreModel>(operations)
}


async function dbSetChapters(chapters: Chapter[]) {
    console.log("upserting chapters")

    await dbDeleteItemsFromTable<ChapterModel>('chapters')
    
    const collection = dbGetCollection<ChapterModel>('chapters')
    
    const operations: ChapterModel[] = chapters.map(chapter => 
        collection.prepareCreate(r => {
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


async function dpUpsertManhwas(manhwas: Manhwa[]) {
    console.log("upserting manhwas")

    const chapters: Chapter[] = []

    const collection = dbGetCollection<ManhwaModel>('manhwas')
    
    const uniqueIds = manhwas.map(item => item.manhwa_id);
    
    const existingRecords = await collection
        .query(Q.where('manhwa_id', Q.oneOf(uniqueIds)))
        .fetch()  
    
    const existingById = new Map<number, ManhwaModel>(
        existingRecords.map(record => [record.manhwa_id, record])
    );    
        
    const operations = manhwas.map(manhwa => {

        // add chapters to add later
        manhwa.chapters.forEach(c => chapters.push(c))

        const existingRecord: ManhwaModel | undefined = existingById.get(manhwa.manhwa_id);

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
            return collection.prepareCreate(r => {
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
    
    await dbBatch(operations)

    await dbSetChapters(chapters)
}


export async function dbUpsertManhwaViewCount(manhwa_id: number) {
    const items: ManhwaModel[] | void = await database
        .collections
        .get<ManhwaModel>('manhwas')
        .query(Q.where('manhwa_id', manhwa_id))
        .fetch()
        .catch(error => console.log("error fetch dbUpsertManhwaViews", error))

    if (items && items.length > 0) {
        await database.write(async () => {
            await items[0].update(r => {r.views += 1})
        }).catch(error => console.log("error write dbUpsertManhwaViews", error))
    }
}

async function dbInsertAuthors(authors: Author[]) {
    console.log("upserting authors")

    const itemsCollection = dbGetCollection<AuthorModel>('authors')
    
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
    
    await dbBatch(operations)
}


async function dbSetManhwaGenres(genres: ManhwaGenre[]) {
    await dbDeleteItemsFromTable<ManhwaGenreModel>('manhwa_genres')    

    console.log("setting manhwa_genres")
    const collection = dbGetCollection<ManhwaGenreModel>('manhwa_genres')

    const operations: ManhwaGenreModel[] = genres.map(genre => 
        collection.prepareCreate(r => {
            r.manhwa_id = genre.manhwa_id
            r.genre = genre.genre
        }))

    await dbBatch<ManhwaGenreModel>(operations)
}


async function dbSetManhwaAuthors(manhwaAuthors: ManhwaAuthor[]) {
    console.log("upserting manhwa authors")
    
    await dbDeleteItemsFromTable<ManhwaAuthorModel>('manhwa_authors')

    const collection = dbGetCollection<ManhwaAuthorModel>('manhwa_authors')

    const operations: ManhwaAuthorModel[] = manhwaAuthors.map(manhwaAuthor => 
        collection.prepareCreate(r => {
            r.manhwa_id = manhwaAuthor.manhwa_id
            r.author_id = manhwaAuthor.author_id
        }))

    await dbBatch<ManhwaAuthorModel>(operations)
}

async function dbSetManhwaRecommendations(
    recommendations: {
        width: number,
        height: number,
        image_url: string,
        manhwa_id: string
    }[]    
) {
    await dbDeleteItemsFromTable<ManhwaRecommendationModel>('manhwa_recommendations')
    const collection = dbGetCollection<ManhwaRecommendationModel>('manhwa_recommendations')    
            
    const operations: ManhwaRecommendationModel[] = recommendations
        .map(rec => 
            collection.prepareCreate(r => {
                r.width = rec.width
                r.height = rec.height
                r.image_url = rec.image_url,
                r.manhwa_id = rec.manhwa_id
            })
        )

    await dbBatch<ManhwaRecommendationModel>(operations)
}

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


/////////////////////////////// GET /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

export async function dpGetManhwaLastChapters(
    manhwa_id: number, 
    numChapters: number = 3
): Promise<Chapter[]> {

    const items: ChapterModel[] = await database
        .collections
        .get<ChapterModel>('chapters')
        .query(Q.where('manhwa_id', manhwa_id), Q.sortBy('chapter_num', Q.desc))
        .fetch()
    
    return items
        .slice(0, numChapters)
        .map(c => dbChapterModelToChapter(c))   
}


export async function dbGetManhwaRecommendations(): Promise<Recommendation[]> {

    const items: ManhwaRecommendationModel[] | void = await dbGetItems<ManhwaRecommendationModel>('manhwa_recommendations')

    if (!items) { return [] }

    const ids = items.map(item => item.manhwa_id)

    const manhwas = await database
        .collections
        .get<ManhwaModel>('manhwas')
        .query(Q.where('manhwa_id', Q.oneOf(ids)))
        .fetch()

    const manhwaMap = new Map(manhwas.map(r => [r.manhwa_id, r]))

    return items.map(item => {
        const manhwaModel: ManhwaModel = manhwaMap.get(item.manhwa_id)!
        return {
            manhwa: dbManhwaModelToManhwa(manhwaModel),
            width: item.width,
            height: item.height,
            cover_image_url: item.image_url
    }})
    
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

    return manhwas.map(m => dbManhwaModelToManhwa(m))
}


export async function dbGetGenresOfManhwa(manhwaId: number): Promise<string[]> {
    const items: ManhwaGenreModel[] = await database
        .collections
        .get<ManhwaGenreModel>('manhwa_genres')
        .query(Q.where('manhwa_id', manhwaId))
        .fetch()

    return items.map(item => item.genre)
}


export async function dbGetAuthorsOfManhwa(manhwa_id: number): Promise<Author[]> {

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

    return manhwas.map(m => dbManhwaModelToManhwa(m))
}


export async function dbGetManhwasByIds(ids: number[]) {
    const items: ManhwaModel[] = await database
        .collections
        .get<ManhwaModel>('manhwas')
        .query(Q.where('manhwa_id', Q.oneOf(ids)))
        .fetch()

    return items.map(m => dbManhwaModelToManhwa(m))
}


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


/////////////////////////////// SORT ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
async function dbSortManhwas(
    compareFn: (a: ManhwaModel, b: ManhwaModel) => number
): Promise<Manhwa[]> {
    const manhwas: ManhwaModel[] | void = await dbGetItems<ManhwaModel>('manhwas')
    if (!manhwas) { return [] }

    return manhwas
        .sort(compareFn)
        .map(m => { return dbManhwaModelToManhwa(m) })
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

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////



export async function dbInit() {
    await dbCreateUpdateHistory('manhwas', 4)
}

export async function dbUpdateDatabase() {    
    console.log("updating db")
    const cacheUrls: Map<string, string> = await spGetCacheUrl()
    const db = await fetchJson(cacheUrls.get('db')!)
    await dpUpsertManhwas(db.manhwas)
    await dbSetGenres(db.genres)
    await dbSetManhwaGenres(db.manhwa_genres)
    await dbInsertAuthors(db.authors)
    await dbSetManhwaAuthors(db.manhwa_authors)    
    await dbSetManhwaRecommendations(db.recommendations)
}



