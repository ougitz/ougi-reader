import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Database, Q } from "@nozbe/watermelondb"
import { Platform } from "react-native"
import GenreModel  from './models/GenreModel'
import LastUpdateModel from './models/LastUpdateModel'
import ManhwaModel from './models/ManhwaModel'
import ChapterModel from './models/ChapterModel'
import { Model } from '@nozbe/watermelondb'
import migrations from './migrations'
import { schemas } from "./schemas"
import { Manhwa } from '@/model/Manhwa'
import { spFetchAllManhwas, spFetchGenres } from '@/lib/supabase'
import { Chapter } from '@/model/Chapter'


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
        LastUpdateModel
    ]
})


export async function dbReset() {
    await database.write(async () => {
        await database.unsafeResetDatabase()
        console.log("database reseted")
    }).catch(error => console.log(error))
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

export async function dbGetAll<T extends Model>(table: string): Promise<T[]> {
    return await database
        .collections
        .get<T>(table)
        .query()
        .fetch()
}

export async function dbDeleteItemsFromTable<T extends Model>(table_name: string) {
    await database.write(async () => {        
        const allItems = await database
            .collections
            .get<T>(table_name)
            .query()
            .fetch()                
        const deleteOperations: any = allItems.map(item => item.destroyPermanently());                
        await database.batch(...deleteOperations);        
        console.log("All items have been permanently deleted from table", table_name);        
    }).catch(error => console.log(error))
}


export async function dbCreateLastUpdate(table: string, hours: number ): Promise<void> {
    const ms = hours * 60 * 60 * 1000
    await database.write(async () => {
        const lastUpdates: LastUpdateModel[] | void = await database
            .get<LastUpdateModel>('updates')
            .query(Q.where('table', table))
            .fetch()
            .catch(error => console.log(error))
        
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


export async function dbUpsertGenres() {
    console.log("upserting genres")
    const genres: string[] = await spFetchGenres()

    await database.write(async () => {
    
        const itemsCollection = database
            .collections
            .get<GenreModel>('genres')        
        
        const existingRecords = await itemsCollection
            .query(Q.where('genre', Q.oneOf(genres)))
            .fetch()  
        
        const existingGenres = new Map<string, GenreModel>(
            existingRecords.map(record => [record.genre, record])
        );
            
        const operations = genres.map(genre => {
            
            const existingRecord = existingGenres.get(genre);

            if (existingRecord) {                
                return existingRecord.prepareUpdate(r => {
                    r.genre = genre
                });
            } else {
                return itemsCollection.prepareCreate(r => {
                    r.genre = genre
                });
            }
        });
        
        await database.batch(...operations);

    }).catch(error => console.log(error))

}


export async function dbUpsertChapters(data: Chapter[]) {
    console.log("upserting chapters")
    await database.write(async () => {
    
        const itemsCollection = database
            .collections
            .get<ChapterModel>('chapters')
        
        const uniqueIds = data.map(item => item.chapter_id);
        
        const existingRecords = await itemsCollection
            .query(Q.where('chapter_id', Q.oneOf(uniqueIds)))
            .fetch()  
        
        const existingById = new Map<number, ChapterModel>(
            existingRecords.map(record => [record.chapter_id, record])
        );
            
        const operations = data.map(chapter => {

            const existingRecord = existingById.get(chapter.chapter_id);

            if (existingRecord) {                
                return existingRecord.prepareUpdate(r => {
                    r.chapter_id = chapter.chapter_id
                    r.chapter_num = chapter.chapter_num
                    r.manhwa_id = chapter.manhwa_id
                    r.created_at = chapter.created_at
                });
            } else {
                return itemsCollection.prepareCreate(r => {
                    r.chapter_id = chapter.chapter_id
                    r.chapter_num = chapter.chapter_num
                    r.manhwa_id = chapter.manhwa_id
                    r.created_at = chapter.created_at
                });
            }
        });
        
        await database.batch(...operations);

    }).catch(error => console.log(error))
}


export async function dpUpsertManhwas() {
    console.log("upserting manhwas")
    const data: Manhwa[] = await spFetchAllManhwas()
    const chapters: Chapter[] = []

    await database.write(async () => {
    
        const itemsCollection = database
            .collections
            .get<ManhwaModel>('manhwas')
        
        const uniqueIds = data.map(item => item.manhwa_id);
        
        const existingRecords = await itemsCollection
            .query(Q.where('manhwa_id', Q.oneOf(uniqueIds)))
            .fetch()  
        
        const existingById = new Map<number, ManhwaModel>(
            existingRecords.map(record => [record.manhwa_id, record])
        );
            
        const operations = data.map(manhwa => {

            manhwa.chapters?.forEach(c => chapters.push(c))
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
                });
            }
        });
        
        await database.batch(...operations);

    }).catch(error => console.log(error))

    await dbUpsertChapters(chapters)
}


export async function dbUpsertManhwaViews(manhwa_id: number) {
    await database.write(async () => {
    
        const items: ManhwaModel[] = await database
            .collections
            .get<ManhwaModel>('manhwas')
            .query(Q.where('manhwa_id', manhwa_id))
            .fetch()

        if (items.length > 0) {
            await items[0].update(r => {r.views += 1})
        }
        
    }).catch(error => console.log(error))
}


export async function dbSortManhwas(compareFn: (a: ManhwaModel, b: ManhwaModel) => number) {
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

    const items = await database
        .collections
        .get<ChapterModel>('chapters')
        .query(Q.where('manhwa_id', manhwa_id), Q.sortBy('chapter_num', Q.desc))
        .fetch()
    
    return items.slice(0, 3).map(
        c => {return {
            chapter_id: c.chapter_id,
            chapter_num: c.chapter_num,
            created_at: c.created_at,
            manhwa_id: c.manhwa_id
        }}
    )
    
}