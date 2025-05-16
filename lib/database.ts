import { Author, ChapterReadLog, Genre, ManhwaAuthor, ManhwaGenre } from '@/helpers/types';
import { spFetchUserReadingStatus, spGetManhwas } from './supabase';
import { convertStringListToSet, secondsSince } from '@/helpers/util';
import { Chapter } from '@/helpers/types';
import { Manhwa } from '@/helpers/types'
import * as SQLite from 'expo-sqlite';


export async function dbMigrate(db: SQLite.SQLiteDatabase) {
  console.log("[DATABASE MIGRATION START]")
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS app_info (
      name TEXT NOT NULL PRIMARY KEY,
      value TEXT NOT NULL
    );
    
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
      manhwa_author_id INTEGER AUTO_INCREMENT,
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
      CONSTRAINT manhwa_genres_pkey PRIMARY KEY (manhwa_id, genre_id),
      CONSTRAINT manhwa_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES genres (genre_id) ON UPDATE CASCADE ON DELETE CASCADE,        
      CONSTRAINT manhwa_genres_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS chapters (
      chapter_id INTEGER PRIMARY KEY,
      manhwa_id INTEGER,
      chapter_num INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manhwa_id) REFERENCES manhwas(manhwa_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS reading_status (        
      manhwa_id INTEGER NOT NULL PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_reading_status_manhwa FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );    
    
    CREATE TABLE IF NOT EXISTS reading_history (
      manhwa_id    INTEGER NOT NULL,      
      chapter_id   INTEGER NOT NULL,
      chapter_num  INTEGER NOT NULL,
      readed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY  (manhwa_id, chapter_id),              
      FOREIGN KEY  (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY  (chapter_id) REFERENCES chapters (chapter_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_id ON chapters(manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);
    CREATE INDEX IF NOT EXISTS idx_manhwas_status ON manhwas(status);
    CREATE INDEX IF NOT EXISTS idx_manhwas_rating ON manhwas(rating);
    CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
    CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_num ON chapters(manhwa_id, chapter_num DESC);
    CREATE INDEX IF NOT EXISTS idx_reading_status_manhwa_id_status ON reading_status (manhwa_id, status);
    CREATE INDEX IF NOT EXISTS idx_reading_history_updated ON reading_history(manhwa_id, chapter_num, readed_at DESC);

    DELETE FROM app_info;

    INSERT INTO 
      app_info (name, value)
    VALUES ('version', 'v1.0');

    INSERT INTO 
      update_history (name, refresh_cycle) 
    VALUES ('database', 60 * 5)
    ON CONFLICT 
      (name) 
    DO UPDATE SET 
      refresh_cycle = EXCLUDED.refresh_cycle;

  `
  ).catch(error => console.log("DATABASE MIGRATION ERROR", error));
  console.log("[DATABASE MIGRATION END]")
}


export async function dbClearTable(db: SQLite.SQLiteDatabase, name: string) {
  await db.runAsync(`DELETE FROM ${name};`, [name]).catch(error => console.log("error dbClearTableerror", error))
}

export async function dbClearDatabase(db: SQLite.SQLiteDatabase) {
  await db.runAsync('DELETE FROM manhwas;').catch(error => console.log("error dbClearDatabase manhwas", error))
  await db.runAsync('DELETE FROM chapters;').catch(error => console.log("error dbClearDatabase chapters", error))
  await db.runAsync('DELETE FROM genres;').catch(error => console.log("error dbClearDatabase genres", error))
  await db.runAsync('DELETE FROM manhwa_genres;').catch(error => console.log("error dbClearDatabase manhwa_genres", error))
  await db.runAsync('DELETE FROM authors;').catch(error => console.log("error dbClearDatabase authors", error))
  await db.runAsync('DELETE FROM manhwa_authors;').catch(error => console.log("error dbClearDatabase manhwa_authors", error))
  console.log("[DATABASE CLEARED]")
}


export async function dbListTables(db: SQLite.SQLiteDatabase) {
  const rows = await db.getAllAsync(
    `
    SELECT 
      name 
    FROM 
      sqlite_master 
    WHERE 
      type='table' AND 
      name NOT LIKE 'sqlite_%';`
  ).catch(error => console.log("error dbListTables", error));
  if (rows) {
    rows.forEach(item => console.log(item))
  }
}

export async function dbReadlAll<T>(db: SQLite.SQLiteDatabase, name: string): Promise<T[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM ${name};`
  ).catch(error => console.log(`error dbReadlAll ${name}`, error));

  return rows ? rows as T[] : []  
}


export async function dbListTable(db: SQLite.SQLiteDatabase, name: string) {
  const rows = await db.getAllAsync(
    `SELECT * FROM ${name};`,
    [name]
  ).catch(error => console.log(`error dbListTable ${name}`, error));

  if (rows) {
    rows.forEach(item => console.log(item))
  }
}


export async function dbCheckSecondsSinceLastRefresh(
  db: SQLite.SQLiteDatabase, 
  name: string
): Promise<number> {
  const row = await db.getFirstAsync<{
    last_refreshed_at: string,
    refresh_cycle: number
  }>(
    `
      SELECT
        refresh_cycle,
        last_refreshed_at
      FROM
        update_history
      WHERE
        name = ?;
    `,
    [name]
  ).catch(error => console.log(`error dbCheckSecondsSinceLastRefresh ${name}`, error));
  
  if (!row) { 
    console.log(`could not read updated_history of ${name}`)
    return -1
  }
  
  const seconds = secondsSince(row.last_refreshed_at)
  return row.refresh_cycle - seconds
}


export async function dbShouldUpdate(db: SQLite.SQLiteDatabase, name: string): Promise<boolean> {
  const row = await db.getFirstAsync<{
    name: string,
    refresh_cycle: number,
    last_refreshed_at: string
  }>(
    `
      SELECT
        name,
        refresh_cycle,
        last_refreshed_at
      FROM
        update_history
      WHERE
        name = ?;
    `,
    [name]
  ).catch(error => console.log(`error dbShouldUpdate ${name}`, error));
  
  if (!row) { 
    console.log(`could not read updated_history of ${name}`)
    return false 
  }

  const seconds = row.last_refreshed_at ?
    secondsSince(row.last_refreshed_at) :
    -1

  const shouldUpdate = seconds < 0 || seconds >= row.refresh_cycle

  if (shouldUpdate) {
    const current_time = new Date().toString()
    await db.runAsync(
      `
        UPDATE 
          update_history 
        SET 
          last_refreshed_at = ? 
        WHERE name = ?;
      `,
      [current_time, name]
    ).catch(error => console.log("error dbShouldUpdate update_historyerror", name, error));
    return true
  }

  return false
}


async function dbUpsertManhwas(db: SQLite.SQLiteDatabase, manhwas: Manhwa[]) {
  const placeholders = manhwas.map(() => '(?,?,?, ?,?,?, ?,?,?)').join(',');  
  const params = manhwas.flatMap(i => [
    i.manhwa_id, 
    i.title, 
    i.descr,
    i.cover_image_url,
    i.status,
    i.color,
    i.views,
    i.rating,
    i.updated_at,
  ]);  
  await db.runAsync(`    
    INSERT OR REPLACE INTO manhwas (
      manhwa_id, 
      title,
      descr,
      cover_image_url,
      status,
      color,
      views,
      rating,
      updated_at
    )
    VALUES ${placeholders};
  `, params).catch(error => console.log("error dbUpsertManhwas", error));
}


async function dbUpsertChapter(db: SQLite.SQLiteDatabase, chapters: Chapter[]) {
  const placeholders = chapters.map(() => '(?,?,?,?)').join(',');  
  const params = chapters.flatMap(i => [
    i.chapter_id, 
    i.manhwa_id, 
    i.chapter_num,
    i.created_at
  ]);
  await db.runAsync(
    `
      INSERT OR REPLACE INTO chapters (
        chapter_id, 
        manhwa_id, 
        chapter_num,
        created_at
      ) 
      VALUES ${placeholders}
      ON CONFLICT (chapter_id)
      DO NOTHING;
    `, 
    params
  ).catch(error => console.log("error dbUpsertChapter", error));
}

async function dbUpsertGenres(db: SQLite.SQLiteDatabase, genres: Genre[]) {
  const placeholders = genres.map(() => '(?,?)').join(',');  
  const params = genres.flatMap(i => [
    i.genre_id, 
    i.genre    
  ]);
  await db.runAsync(
    `
      INSERT INTO genres (
        genre_id, 
        genre
      ) 
      VALUES ${placeholders}
      ON CONFLICT (genre_id)
      DO NOTHING;
    `, 
    params
  ).catch(error => console.log("error dbUpsertGenres", error));
}

async function dbUpsertManhwaGenres(db: SQLite.SQLiteDatabase, manhwaGenres: ManhwaGenre[]) {
  const placeholders = manhwaGenres.map(() => '(?,?)').join(',');  
  const params = manhwaGenres.flatMap(i => [
    i.genre_id,
    i.manhwa_id
  ]);
  await db.runAsync(
    `
      INSERT INTO manhwa_genres (
        genre_id, 
        manhwa_id
      ) 
      VALUES ${placeholders}
      ON CONFLICT (manhwa_id, genre_id)
      DO NOTHING;
    `, 
    params
  ).catch(error => console.log("error dbUpsertManhwaGenres", error));
}


async function dbUpsertAuthors(db: SQLite.SQLiteDatabase, authors: Author[]) {
  const placeholders = authors.map(() => '(?,?,?)').join(',');  
  const params = authors.flatMap(i => [
    i.author_id,
    i.name,
    i.role
  ]);
  await db.runAsync(
    `
      INSERT INTO authors (
        author_id, 
        name,
        role
      ) 
      VALUES ${placeholders}
      ON CONFLICT (author_id)
      DO NOTHING;
    `, 
    params
  ).catch(error => console.log("error dbUpsertAuthors", error));
}


async function dbUpsertManhwaAuthors(db: SQLite.SQLiteDatabase, manhwaAuthors: ManhwaAuthor[]) {
  const placeholders = manhwaAuthors.map(() => '(?,?,?)').join(',');  
  const params = manhwaAuthors.flatMap(i => [
    i.author_id,
    i.manhwa_id,
    i.role
  ]);
  await db.runAsync(
    `
      INSERT INTO manhwa_authors (
        author_id, 
        manhwa_id,
        role
      ) 
      VALUES ${placeholders}
      ON CONFLICT (author_id, manhwa_id, role)
      DO NOTHING;
    `, 
    params
  ).catch(error => console.log("error dbUpsertManhwaAuthors", error));
}


export async function dbUpdateDatabase(db: SQLite.SQLiteDatabase) {
  console.log('[UPDATING DATABASE]')
  const start = Date.now()

  const manhwas: Manhwa[] = await spGetManhwas()
  
  await dbClearDatabase(db)
  await dbUpsertManhwas(db, manhwas)
  
  const chapters: Chapter[] = []
  const authors: Author[] = []
  const manhwaAuthors: ManhwaAuthor[] = []
  const genres: Genre[] = []
  const manhwaGenres: ManhwaGenre[] = []

  manhwas.forEach(i => {
    i.chapters.forEach(c => chapters.push(c)); 
    i.genres.forEach(g => {genres.push(g); manhwaGenres.push({...g, manhwa_id: i.manhwa_id})});
    i.authors.forEach(a => {authors.push(a); manhwaAuthors.push({...a, manhwa_id: i.manhwa_id})});    
  })
  
  await dbUpsertChapter(db, chapters)
  await dbUpsertGenres(db, genres)
  await dbUpsertManhwaGenres(db, manhwaGenres)
  await dbUpsertAuthors(db, authors)
  await dbUpsertManhwaAuthors(db, manhwaAuthors)
  
  const end = Date.now()
  console.log((end - start) / 1000)
  console.log("[DATABASE UPDATED]")
}


export async function dbGetUserReadHistory(
  db: SQLite.SQLiteDatabase,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<ChapterReadLog[]> {
  const rows = await db.getAllAsync(
    `
      SELECT
        m.manhwa_id,
        m.title,
        m.cover_image_url,
        m.color,
        GROUP_CONCAT(rh.chapter_num, ', ') AS chapters,
        MAX(rh.readed_at)        AS last_readed_at
      FROM reading_history AS rh
      JOIN manhwas           AS m
        ON m.manhwa_id = rh.manhwa_id
      GROUP BY
        m.manhwa_id,
        m.title
      ORDER BY
        last_readed_at DESC
      LIMIT ?
      OFFSET ?;
    `,
    [p_limit, p_offset]
  ).catch(error => console.log("error dbUserReadHistory", error));
  
  return rows ? rows.map(
    (item: any) => {
      return {...item, chapters: convertStringListToSet(item.chapters)}
    }) : []
}


export async function dbGetMangaReadChapters(db: SQLite.SQLiteDatabase, manhwa_id: number): Promise<Set<number>> {
    const rows = await db.getAllAsync(
    `
      SELECT
        chapter_num
      FROM 
        reading_history
      WHERE 
        manhwa_id = ?;
    `,
    [manhwa_id]
  ).catch(error => console.log("error dpFetchChapterReadedByManhwa", error));

  
  if (!rows) {
    return new Set<number>()
  }
  
  return new Set<number>(rows.map((item: any) => item.chapter_num))
}

export async function dbReadRandomManhwa(db: SQLite.SQLiteDatabase, p_limit: number = 1): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM manhwas ORDER BY RANDOM() LIMIT ?',
    [p_limit]
  ).catch(error => console.log("error dbReadRandomManhwa", error));
  
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
  ).catch(error => console.log("error dbReadManhwasByGenreName", genre, error));

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
  ).catch(error => console.log("error dbReadManhwasByGenreId", genre_id, error));

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
  ).catch(error => console.log("error dbReadManhwaGenres", manhwa_id, error));

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
  ).catch(error => console.log("error dbReadManhwasByAuthorId", author_id, error));

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
  ).catch(error => console.log("error dbReadManhwaAuthors", manhwa_id, error));

  return rows ? rows as ManhwaAuthor[] : []
}


export async function dbReadManhwaById(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<Manhwa | null> {
  const row = await db.getFirstAsync(
    'SELECT * FROM manhwas WHERE manhwa_id = ?;',
    [manhwa_id]
  ).catch(error => console.log("error dbReadManhwaById", manhwa_id, error));

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
  ).catch(error => console.log("error dbReadManhwasOrderedByUpdateAt", error));

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
  ).catch(error => console.log("error dbReadManhwasOrderedByViews", error));

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
  ).catch(error => console.log("error dbReadLast3Chapters", manhwa_id, error));

  return rows ? rows as Chapter[] : []
}


export async function dbReadGenres(db: SQLite.SQLiteDatabase): Promise<Genre[]> {
  const rows = await db.getAllAsync(
    'SELECT * FROM genres ORDER BY genre;'    
  ).catch(error => console.log("error dbReadGenres", error));
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
  ).catch(error => console.log("error dbUpdateManhwaViews", manhwa_id, error))
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
  ).catch(error => console.log("error dbUpdateManhwaReadingStatus", manhwa_id, status, error))
}

export async function dbPopulateReadingStatusTable(
  db: SQLite.SQLiteDatabase,
  user_id: string
) {
  const sts: {manhwa_id: number, status: string}[] = await spFetchUserReadingStatus(user_id)
  if (sts.length == 0) { return }

  const placeholders = sts.map(() => '(?,?)').join(',');  
  const params = sts.flatMap(i => [
    i.manhwa_id, 
    i.status    
  ]);
  
  await db.runAsync(`    
    INSERT OR REPLACE INTO reading_status (
      manhwa_id, 
      status
    )
    VALUES ${placeholders};
  `, params).catch(error => console.log("error dbPopulateReadingStatusTable", error));
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
  ).catch(error => console.log("error dbGetManhwasByReadingStatus", status, error));

  return rows ? rows as Manhwa[]  : []
}


export async function dbGetManhwaReadingStatus(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number
): Promise<string | null> {
  const row = await db.getFirstAsync<{status: string}>(
    "SELECT status FROM reading_status WHERE manhwa_id = ?", 
    [manhwa_id]
  ).catch(error => console.log("error dbGetManhwaReadingStatus", manhwa_id, error));

  return row ? row.status : null
}


export async function dbUpsertReadingHistory(
  db: SQLite.SQLiteDatabase,
  manhwa_id: number, 
  chapter_id: number,
  chapter_num: number
) {
  await db.runAsync(
    `
      INSERT INTO reading_history (
        manhwa_id,
        chapter_id,
        chapter_num,
        readed_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (manhwa_id, chapter_id)
      DO UPDATE SET readed_at = CURRENT_TIMESTAMP;
    `,
    [manhwa_id, chapter_id, chapter_num]
  ).catch(error => console.log("error dbUpsertReadingHistory", manhwa_id, chapter_id, chapter_num, error))
}


export async function dbSearchManhwas(
  db: SQLite.SQLiteDatabase, 
  searchTerm: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const rows = await db.getAllAsync(
    `
      SELECT *
      FROM manhwas
      WHERE title LIKE ? COLLATE NOCASE
      LIMIT ?
      OFFSET ?;
    `,
    [`%${searchTerm}%`, p_limit, p_offset]
  ).catch(error => console.log("error dbManhwaSearch", searchTerm, error))
  return rows ? rows as Manhwa[] : []
}


export async function dbHasManhwas(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{manhwa_id: number}>(
    `
      SELECT
        manhwa_id
      FROM
        manhwas
      LIMIT 1
      OFFSET 0;
    `    
  ).catch(error => console.log('dbHasManhwas', error)); 
  return row != null
}


export async function dbGetAppVersion(db: SQLite.SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{value: string}>(
    `
      SELECT
        value
      FROM
        app_info
      WHERE
        name = 'version';
    `    
  ).catch(error => console.log('dbGetAppVersion', error)); 

  return row!.value
}