import { spGetCacheUrl } from "@/lib/supabase";
import { fetchJson } from "@/helpers/util";
import { 
    dbListTable, 
    dbReset, 
    dpUpsertManhwas, 
    dbUpsertAuthors, 
    dbUpsertGenres, 
    dbUpsertManhwaAuthors, 
    dbUpsertManhwaGenres 
} from "./db";
import GenreModel from "./models/GenreModel";
import ManhwaGenreModel from "./models/ManhwaGenreModel";
import AuthorModel from "./models/AuthorModel";
import ManhwaAuthorModel from "./models/ManhwaAuthorModel";
import ManhwaModel from "./models/ManhwaModel";



export async function dbTest() {
    const cacheUrls: Map<string, string> = await spGetCacheUrl()
    const db = await fetchJson(cacheUrls.get('db')!)

    await dpUpsertManhwas(db.manhwas)
    await dbUpsertGenres(db.genres)
    await dbUpsertManhwaGenres(db.manhwa_genres)
    await dbUpsertAuthors(db.authors)
    await dbUpsertManhwaAuthors(db.manhwa_authors)

    dbListTable<ManhwaModel>(
        'manhwas',
        (m: ManhwaModel) => console.log(m.manhwa_id, m.title, m.ratings)
    )

}