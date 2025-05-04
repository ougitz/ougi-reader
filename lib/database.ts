import { Manhwa } from '@/model/Manhwa';
import * as SQLite from 'expo-sqlite';
import { UpdateHistorySchema } from './model/UpdateHistorySchema';
import { ManhwaSchema } from './model/ManhwaSchema';
import { ChapterSchema } from './model/ChapterSchema';
import { GenreSchema } from './model/GenreSchema';
import { ManhwaAuthorSchema } from './model/ManhwaAuthorSchema';
import { hasMinutesElapsed } from '@/helpers/util';
import { spFetchChapterList, spGetManhwas } from './supabase';
import { Debug } from '@/constants/Debug';
import { Chapter } from '@/model/Chapter';
import { Genre, ManhwaAuthor } from '@/helpers/types';
import { ReadingStatusSchema } from './model/ReadingStatusSchema';



export async function dbMigrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS update_history (
      name TEXT NOT NULL PRIMARY KEY,
      refresh_cycle INTEGER,
      last_refreshed_at TIMESTAMP DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS genres (
      genre_id INTEGER PRIMARY KEY,
      genre TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS authors (
      author_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manhwas (
      manhwa_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      descr TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      status TEXT NOT NULL,
      color TEXT NOT NULL,
      rating DECIMAL(2, 1) DEFAULT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manhwa_authors (
      manhwa_author_id INTEGER NOT NULL AUTO_INCREMENT,
      author_id INTEGER NOT NULL,
      manhwa_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      CONSTRAINT manhwa_authors_unique unique (manhwa_id, author_id, role),
      CONSTRAINT manhwa_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors (author_id) ON UPDATE CASCADE ON DELETE CASCADE,
      CONSTRAINT manhwa_authors_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS manhwa_genres (
      genre_id INTEGER NOT NULL,
      manhwa_id INTEGER NOT NULL,
      CONSTRAINT manhwa_genres_pkey KEY (manhwa_id, genre_id),
      CONSTRAINT manhwa_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES genres (genre_id) ON UPDATE CASCADE ON DELETE CASCADE,        
      CONSTRAINT manhwa_genres_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chapters (
      chapter_id INTEGER PRIMARY KEY,
      manhwa_id INTEGER,
      chapter_num INTEGER NOT NULL,      
      FOREIGN KEY (manhwa_id) REFERENCES manhwas(manhwa_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reading_status (        
      manhwa_id INTEGER NOT NULL PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_reading_status_manhwa FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reading_history (
      manhwa_id   INTEGER NOT NULL,
      chapter_num  INTEGER NOT NULL,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      
      PRIMARY KEY (manhwa_id, chapter_num),              
      FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_id ON chapters(manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_manhwas_status ON manhwas(status);
    CREATE INDEX IF NOT EXISTS idx_manhwas_rating ON manhwas(rating);
    CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
    CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_num ON chapters(manhwa_id, chapter_num DESC);
    CREATE INDEX IF NOT EXISTS idx_reading_status_manhwa_id_status ON reading_status (manhwa_id, status);


    INSERT INTO 
      update_history (name, refresh_cycle) 
    VALUES ('database', 3 * 60)
    ON CONFLICT 
      (name) 
    DO UPDATE SET 
      refresh_cycle = EXCLUDED.refresh_cycle;
  `
  ).catch(error => console.log(error));
}

export async function dbShouldUpdate(db: SQLite.SQLiteDatabase, name: string): Promise<boolean> {
  const row = await db.getFirstAsync<UpdateHistorySchema>(
    'SELECT * FROM update_history WHERE name = ?', 
    [name]
  ).catch(error => console.log(error));
  
  if (!row) { 
    console.log(`could not read updated_history of ${name}`)
    return false 
  }  

  const shouldUpdate: boolean = !row.last_refreshed_at || hasMinutesElapsed(row.last_refreshed_at, row.refresh_cycle)

  if (shouldUpdate) {
    const current_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.runAsync(
      'UPDATE update_history SET last_refreshed_at = ? WHERE name = ?',
      [current_time, name]
    ).catch(error => console.log(error));
    return true
  }

  return false
}

export async function dbUpdateDatabase(db: SQLite.SQLiteDatabase) {
  
  const shouldUpdate = await dbShouldUpdate(db, 'database')

  if (!shouldUpdate && !Debug.FORCE_DATABASE_UPDATE) { return }

  console.log("fetching manhwas")
  const manhwas: Manhwa[] = await spGetManhwas()

  const insertManhwaStatement = await db.prepareAsync(
    `INSERT ON REPLACE INTO manhwas (
        manhwa_id, 
        title,
        descr,
        cover_image_url,
        status,
        color,
        views,
        rating,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
  );

  const insertChapterStatement = await db.prepareAsync(
    `
      INSERT INTO chapters (
        chapter_id, 
        manhwa_id, 
        chapter_num
      ) VALUES (?, ?, ?)
      ON CONFLICT (chapter_id)
      DO NOTHING;
    `
  )

  const insertGenreStatement = await db.prepareAsync(
    `
      INSERT INTO genres (
        genre_id, 
        genre
      ) VALUES (?, ?)
      ON CONFLICT (genre_id)
      DO NOTHING;`
  )

  const insertManhwaGerneStatement = await db.prepareAsync(
    `
      INSERT INTO manhwa_genres (
        manhwa_id,
        genre_id
      )
      VALUES (?, ?)
      ON CONFLICT (manhwa_id, genre_id)
      DO NOTHING;
    `
  )

  const insertAuthorStatement = await db.prepareAsync(
    `
      INSERT INTO authors (
       author_id,
       name,
       role 
      ) VALUES (?, ?, ?)
       ON CONFLICT (author_id)
       DO NOTHING;
    `
  )


  const insertManhwaAuthorStatement = await db.prepareAsync(
    `
      INSERT INTO manhwa_authors (
        author_id,
        manhwa_id,
        role
      ) VALUES (?, ?, ?)
       ON CONFLICT (author_id, manhwa_id, role)
       DO NOTHING;
    `
  )

  console.log("updating database")
  
    try {

      // MANHWAS
      for (const m of manhwas) {
        await insertManhwaStatement
          .executeAsync([
            m.manhwa_id, m.title, m.descr, 
            m.cover_image_url, m.status, m.color, 
            m.views, m.rating, m.updated_at
          ]).catch(error => console.log(error));

        // CHAPTERS
        for (const c of m.chapters) {
          await insertChapterStatement.executeAsync([
            c.chapter_id, c.manhwa_id, c.chapter_num
          ]).catch(error => console.log(error));
        }
      
        // GENRES
        for (const g of m.genres) {
          await insertGenreStatement.executeAsync([
            g.genre_id, g.genre
          ]).catch(error => console.log(error));

          await insertManhwaGerneStatement.executeAsync([
            m.manhwa_id,
            g.genre_id
          ]).catch(error => console.log(error));
        }

        // AUTHORS
        for (const a of m.authors) {
          await insertAuthorStatement.executeAsync([
            a.author_id,
            a.name,
            a.role
          ]).catch(error => console.log(error));

          await insertManhwaAuthorStatement.executeAsync([
            a.author_id,
            m.manhwa_id,
            a.role
          ]).catch(error => console.log(error));
        }
      }
    } finally {
      await insertManhwaStatement.finalizeAsync().catch(error => console.log(error));
      await insertChapterStatement.finalizeAsync().catch(error => console.log(error));
      await insertGenreStatement.finalizeAsync().catch(error => console.log(error));
      await insertManhwaGerneStatement.finalizeAsync().catch(error => console.log(error));
      await insertAuthorStatement.finalizeAsync().catch(error => console.log(error));
      await insertManhwaAuthorStatement.finalizeAsync().catch(error => console.log(error));
    }
  
}

export async function dbUpsertUpdateHistory(
  db: SQLite.SQLiteDatabase,
  name: string, 
  minutes: number = 60
) {
  await db.runAsync(
    `
    INSERT INTO update_history (
      name,
      refresh_cycle
    ) VALUES (?, ?)
    ON ONFLICT (name)
    DO UPDATE SET  
      refresh_cycle = EXCLUDED.refresh_cycle;
    `,
    [name, minutes]
  ).catch(error => console.log(error));    
}

export async function dbReadRandomManhwa(db: SQLite.SQLiteDatabase, p_limit: number = 1): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM manhwas ORDER BY RANDOM() LIMIT ?',
    [p_limit]
  ).catch(error => console.log(error));
  
  return rows ? rows as Manhwa[]  : []
}


export async function dbReadManhwasByGenreName(
  db: SQLite.SQLiteDatabase,
  genre: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        manhwas m
      JOIN manhwa_genres mg ON m.manhwa_id = mg.manhwa_id
      JOIN genres g ON mg.genre_id = g.genre_id
      WHERE 
        g.genre = ?
      ORDER BY m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre, p_limit, p_offset]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}

export async function dbReadManhwasByGenreId(
  db: SQLite.SQLiteDatabase,
  genre_id: number,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {  
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        manhwas m
      JOIN manhwa_genres mg ON m.manhwa_id = mg.manhwa_id
      JOIN genres g ON mg.genre_id = g.genre_id
      WHERE 
        g.genre_id = ?
      ORDER BY m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre_id, p_limit, p_offset]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}

export async function dbReadManhwaGenres(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        g.*
      FROM 
        genres g
      JOIN manhwa_genres mg ON mg.genre_id = g.genre_id      
      WHERE 
        mg.manhwa_id = ?
      ORDER BY g.genre;
    `,
    [manhwa_id]
  ).catch(error => console.log(error));

  return rows ? rows as Genre[] : []
}

export async function dbReadManhwasByAuthorId(
  db: SQLite.SQLiteDatabase,
  author_id: number
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        m.*
      FROM 
        manhwas m
      JOIN manhwa_authors ma ON m.manhwa_id = ma.manhwa_id
      WHERE 
        ma.author_id = ?
      ORDER BY m.views DESC;
    `,
    [author_id]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}


export async function dbReadManhwaAuthors(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<ManhwaAuthor[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        a.*
      FROM 
        authors a
      JOIN manhwa_authors ma ON a.author_id = ma.author_id
      WHERE 
        ma.manhwa_id = ?;
    `,
    [manhwa_id]
  ).catch(error => console.log(error));

  return rows ? rows as ManhwaAuthor[] : []
}


export async function dbReadManhwaById(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Manhwa | null> {
  const row = await db.getFirstAsync(
    'SELECT * FROM manhwas WHERE manhwa_id = ?;',
    [manhwa_id]
  ).catch(error => console.log(error));

  return row ? row as Manhwa : null
}

export async function dbReadManhwasOrderedByUpdateAt(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT 
        * 
      FROM 
        manhwas
      ORDER BY updated_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}

export async function dbReadManhwasOrderedByViews(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        *
      FROM
        manhwas
      ORDER BY views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}

export async function dbReadManhwasOrderedByRating(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        *
      FROM
        manhwas
      ORDER BY rating DESC
      OFFSET ?
      LIMIT ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}


export async function dbReadLast3Chapters(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Chapter[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        *
      FROM
        chapters
      WHERE
        manhwa_id = ?
      ORDER BY chapter_num DESC
      LIMIT 3;
    `,
    [manhwa_id]
  ).catch(error => console.log(error));

  return rows ? rows as Chapter[] : []
}


export async function dbReadGenres(db: SQLite.SQLiteDatabase): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM genres ORDER BY genre;'    
  ).catch(error => console.log(error));
  return rows ? rows as Genre[] : []
}


export async function dbUpdateManhwaViews(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
) {
  await db.runAsync(
    `
      UPDATE 
        manhwas
      SET
        views = views + 1
      WHERE
        manhwa_id = ?
    `,
    [manhwa_id]
  ).catch(error => console.log(error))
}


export async function dbUpdateManhwaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number, 
  status: string
) {
  await db.runAsync(
    `
      INSERT INTO reading_status (
        manhwa_id,
        status
      )
      VALUES (?, ?)
      ON CONFLICT
        (manhwa_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP;
    `,
    [manhwa_id, status]
  ).catch(error => console.log(error))
}

export async function dbGetManhwasByReadingStatus(
  db: SQLite.SQLiteDatabase,
  status: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        m.*
      FROM
        manhwas m
      JOIN
        reading_status r
        on r.manhwa_id = m.manhwa_id
      WHERE
        r.status = ?
      ORDER BY r.updated_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [status, p_limit, p_offset]
  ).catch(error => console.log(error));

  return rows ? rows as Manhwa[]  : []
}


export async function dbGetManhwaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<string | null> {
  const row = await db.getFirstAsync<ReadingStatusSchema>(
    "SELECT status FROM reading_status WHERE manhwa_id = ?", 
    [manhwa_id]
  ).catch(error => console.log(error));

  return row ? row.status : null
}


async function dbUpsertChapters(
  db: SQLite.SQLiteDatabase,
  chapters: Chapter[]
) {
  const insertChapterStatement = await db.prepareAsync(
    `
      INSERT INTO chapters (
        manhwa_id,
        chapter_id,
        chapter_num
      ) VALUES (?, ?, ?)
      ON CONFLICT (chapter_id)
      DO NOTHING;
    `
  )

  try {
    for (const chapter of chapters) {
      await insertChapterStatement.executeAsync([
        chapter.manhwa_id, chapter.chapter_id, chapter.chapter_num
      ]).catch(error => console.log(error))
    }
  } finally {
    await insertChapterStatement.finalizeAsync().catch(error => console.log(error))
  }

}


async function dbReadManhwaChapters(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Chapter[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM chapters WHERE manhwa_id = ? ORDER BY chapter_num`,
    [manhwa_id]
  ).catch(error => console.log(error));
  return rows ? rows as Chapter[] : []
}


export async function dbFetchManwaChapterList(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Chapter[]> {
  const manhwa_key: string = manhwa_id.toString()
  await dbUpsertUpdateHistory(db, manhwa_key, 60)
  const shouldUpdate = await dbShouldUpdate(db, manhwa_key);

  if (shouldUpdate) {
    const chapters: Chapter[] = await spFetchChapterList(manhwa_id)
    await dbUpsertChapters(db, chapters)
    return chapters
  }

  const chapters: Chapter[] = await dbReadManhwaChapters(db, manhwa_id)
  return chapters
}


export async function dbUpsertReadingHistory(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number, 
  chapter_num: number
) {
  await db.runAsync(
    `
      INSERT INTO reading_history (
        manhwa_id,
        chapter_num,
        updated_at
      )
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (manhwa_id, chapter_num)
      DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    `,
    [manhwa_id, chapter_num]
  ).catch(error => console.log(error))
}
