import { Manhwa } from '@/model/Manhwa';
import SQLite from 'react-native-sqlite-storage';
import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { UpdateHistoryTable } from './model/UpdateHistoryModel';
import { hasMinutesElapsed } from '@/helpers/util';
import { spGetManhwas } from './supabase';
import { Debug } from '@/constants/Debug';
import { Chapter } from '@/model/Chapter';
import { Genre, ManhwaAuthor } from '@/helpers/types';


SQLite.enablePromise(true);


function openDB() {
  return SQLite.openDatabase({
    name: 'ougi.db',
    location: 'default',
  });
}


export async function dbInitSchema(): Promise<SQLiteDatabase> {
  const db = await openDB();
  console.log("init schema")

  // ative enforcement de FK (opcional, mas recomendado)
  await db.executeSql('PRAGMA foreign_keys = ON;');
  
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS update_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      descr TEXT,
      refresh_cycle INTEGER,
      refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(error => console.log(error));

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS genres (
      genre_id INTEGER PRIMARY KEY,
      genre TEXT NOT NULL
    );
  `).catch(error => console.log(error));

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS authors (
      author_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `).catch(error => console.log(error));

  // Crie manhwas antes de manhwa_authors
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS manhwas (
      manhwa_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      descr TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      status TEXT NOT NULL,
      color TEXT NOT NULL,
      rating DECIMAL(2, 1) DEFAULT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(error => console.log(error));

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS manhwa_authors (
      author_id INTEGER not NULL,
      manhwa_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT manhwa_authors_pkey PRIMARY KEY (author_id, manhwa_id),
      CONSTRAINT manhwa_authors_unique_cstr UNIQUE (manhwa_id, author_id),
      CONSTRAINT manhwa_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors (author_id) ON UPDATE CASCADE ON DELETE CASCADE,
      CONSTRAINT manhwa_authors_manhwa_id_fkey FOREIGN KEY (manhwa_id) REFERENCES manhwas (manhwa_id) ON UPDATE CASCADE ON DELETE CASCADE
    );
  `).catch(error => console.log(error));
    
  await db.executeSql(
    `
      CREATE TABLE IF NOT EXISTS manhwa_genres (
        genre_id INTEGER NOT NULL,
        manhwa_id INTEGER NOT NULL,
        
        CONSTRAINT manhwa_genres_unique_cstr UNIQUE (manhwa_id, genre_id),
        
        CONSTRAINT manhwa_genres_genre_id_fkey 
        FOREIGN KEY (genre_id) 
        REFERENCES genres (genre_id) 
        ON UPDATE CASCADE ON DELETE CASCADE,
        
        CONSTRAINT manhwa_genres_manhwa_id_fkey 
        FOREIGN KEY (manhwa_id) 
        REFERENCES manhwas (manhwa_id) 
        ON UPDATE CASCADE ON DELETE CASCADE
      );
    `
  ).catch(error => console.log(error))

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS chapters (
      chapter_id INTEGER PRIMARY KEY,
      manhwa_id INTEGER,
      chapter_num INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manhwa_id) REFERENCES manhwas(manhwa_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `).catch(error => console.log(error));

  // índices e view
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_id ON chapters(manhwa_id);`).catch(error => console.log(error));
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);`).catch(error => console.log(error));
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_manhwas_status ON manhwas(status);`).catch(error => console.log(error));
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_manhwas_rating ON manhwas(rating);`).catch(error => console.log(error));
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);`).catch(error => console.log(error));
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_num ON chapters(manhwa_id, chapter_num DESC);`).catch(error => console.log(error));


  await db.executeSql(
    `
    INSERT INTO update_history (
      name, descr, refresh_cycle
    ) 
    VALUES    
      ('database', 'last database was updated', 3 * 60)
    ON CONFLICT (name) 
    DO UPDATE SET refresh_cycle = EXCLUDED.refresh_cycle;
    `
  ).catch(error => console.log(error))

  await db.executeSql(
    `
      CREATE TABLE IF NOT EXISTS reading_status (        
        manhwa_id    INTEGER NOT NULL PRIMARY KEY,        
        status       TEXT    NOT NULL,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_reading_status_manhwa
          FOREIGN KEY (manhwa_id)
          REFERENCES manhwas (manhwa_id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      );
    `
  ).catch(error => console.log(error))

  await db.executeSql(
    'CREATE INDEX IF NOT EXISTS idx_reading_status_manhwa_id_status ON reading_status (manhwa_id, status);'
  ).catch(error => console.log(error))

  await db.executeSql("drop table if exists reading_history;").catch(error => console.log(error))

  await db.executeSql(
    `
      CREATE TABLE IF NOT EXISTS reading_history (
        manhwa_id   INTEGER NOT NULL,
        chapter_num  INTEGER NOT NULL,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (manhwa_id, chapter_num),
                
        FOREIGN KEY (manhwa_id)
          REFERENCES manhwas (manhwa_id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
    );`
  ).catch(error => console.log(error))
  
  console.log("schema inited")
  return db;
}


export async function dbListTable(table_name: string) {
  const db = await openDB()
  const [result] = await db.executeSql(
    `SELECT * FROM ${table_name};`
  ); 
  for (let i = 0; i < result.rows.length; i++) {
    console.log(result.rows.item(i));
  }  
}


export async function dbListTables() {
  const db = await openDB()
  const [result] = await db.executeSql(
    `SELECT name 
       FROM sqlite_master 
      WHERE type='table';`
  );
  const tabelas = [];
  for (let i = 0; i < result.rows.length; i++) {
    tabelas.push(result.rows.item(i).name);
  }
  console.log('Tables:', tabelas);
}


async function dbReadUnique<T>(query: string, args: any[] = []): Promise<T | null> {
  const db = await openDB()

  const [result] = await db.executeSql(query, args);

  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows.item(0) as T
}


async function dbReadMany<T>(query: string, args: any[] = []): Promise<T[]> {
  const db = await openDB()
  
  const resp = await db.executeSql(query, args).catch(
    error => console.log(error)
  )
  if (!resp) { return [] }
  

  const [result] = resp

  const r: T[] = []
  for (let i = 0; i < result.rows.length; i++) {
    r.push(result.rows.item(i))
  }

  return r
}


async function dbWrite(query: string, args: any[] = []) {
  const db: SQLiteDatabase = await openDB()
    await db.transaction(async tx => {
      tx.executeSql(
        query,
        args
      );
    }).catch(error => console.log(error))
}

async function dbShouldUpdateDatabase(): Promise<boolean> {

  const update_history: UpdateHistoryTable | null | void = await dbReadUnique<UpdateHistoryTable>(
    `SELECT * FROM update_history WHERE name = 'database';`
  ).catch(error => console.log(error))
  
  if (!update_history) { 
    console.log("could not read updated_history of database")
    return false 
  }

  const shouldUpdate: boolean = hasMinutesElapsed(
    update_history.refreshed_at, 
    update_history.refresh_cycle
  )
  
  if (shouldUpdate) {
    const current_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await dbWrite(
      "UPDATE update_history SET refreshed_at = ? WHERE name = 'database';",
      [current_time]
    )
    return true
  }
  return false
}

export async function dbUpdateDatabase() {
  const db: SQLiteDatabase = await openDB()  
  const shouldUpdate = await dbShouldUpdateDatabase()
  if (!shouldUpdate && !Debug.FORCE_DATABASE_UPDATE) { return }

  console.log("fetching manhwas")
  const manhwas: Manhwa[] = await spGetManhwas()  

  const manhwaGenres: number[][] = []
  console.log("updating database")
  await db.transaction(async tx => {
    for (const m of manhwas) {
        // MANHWA
        tx.executeSql(
          `INSERT OR REPLACE INTO manhwas (
            manhwa_id,
            title, 
            descr, 
            cover_image_url, 
            status, 
            color, 
            rating, 
            views, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
          [
            m.manhwa_id,
            m.title,
            m.descr,
            m.cover_image_url,
            m.status,
            m.color,
            m.rating,
            m.views,
            m.updated_at
          ]
        )

        // GENRES
        for (const g of m.genres) {          
            tx.executeSql(
              "INSERT OR REPLACE INTO genres (genre_id, genre) VALUES (?, ?);",
              [g.genre_id, g.genre]
            )
            
            manhwaGenres.push([m.manhwa_id, g.genre_id])
        }        
        
        // AUTHORS
        for (const a of m.authors) {
          tx.executeSql(
            "INSERT OR REPLACE INTO authors (author_id, name, role) VALUES (?, ?, ?);",
            [a.author_id, a.name, a.role]
          )
          tx.executeSql(
            "INSERT INTO manhwa_authors (manhwa_id, author_id) VALUES (?, ?) ON CONFLICT (manhwa_id, author_id) DO NOTHING;",
            [m.manhwa_id, a.author_id]
          ).catch(error => console.log(error))
        }

        // CHAPTERS
        for (const c of m.chapters) {
          tx.executeSql(
            "INSERT OR REPLACE INTO chapters (chapter_id, manhwa_id, chapter_num, created_at) VALUES (?, ?, ?, ?);",
            [c.chapter_id, m.manhwa_id, c.chapter_num, c.created_at]
          )
        }
                
      }      
    }
  )

  for (let i = 0; i < manhwaGenres.length; i++) {
    const a: number[] = manhwaGenres[i]
    await db.executeSql(
      'INSERT INTO manhwa_genres (manhwa_id, genre_id) VALUES (?, ?) ON CONFLICT (manhwa_id, genre_id) DO NOTHING;',
      [a[0], a[1]]
    ).catch(error => console.log(error))
  }

}


export async function dbReadRandomManhwa(p_limit: number = 1): Promise<Manhwa[]> {
  const manhwas: Manhwa[] = await dbReadMany(
    `
      SELECT 
        *
      FROM 
        manhwas
      ORDER BY RANDOM()
      LIMIT ?;      
    `,
    [p_limit]
  )
  return manhwas
}


export async function dbReadManhwasByGenreName(
  genre: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const manhwas: Manhwa[] = await dbReadMany(
    `
      SELECT m.*
      FROM manhwas m
      JOIN manhwa_genres mg ON m.manhwa_id = mg.manhwa_id
      JOIN genres g ON mg.genre_id = g.genre_id
      WHERE g.genre = ?
      ORDER BY m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre, p_limit, p_offset]
  )
  return manhwas
}

export async function dbReadManhwasByGenreId(
  genre_id: number,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {  
  const manhwas: Manhwa[] = await dbReadMany(
    `
      SELECT m.*
      FROM manhwas m
      JOIN manhwa_genres mg ON m.manhwa_id = mg.manhwa_id
      JOIN genres g ON mg.genre_id = g.genre_id
      WHERE g.genre_id = ?
      ORDER BY m.views DESC
      LIMIT ?
      OFFSET ?;
    `,
    [genre_id, p_limit, p_offset]
  )
  return manhwas
}

export async function dbReadManhwaGenres(manhwa_id: number): Promise<Genre[]> {
  const genres: Genre[] = await dbReadMany(
    `
      SELECT g.*
      FROM genres g
      JOIN manhwa_genres mg ON mg.genre_id = g.genre_id      
      WHERE mg.manhwa_id = ?
      ORDER BY g.genre;
    `,
    [manhwa_id]
  )
  
  return genres
}

export async function dbReadManhwasByAuthorId(author_id: number): Promise<Manhwa[]> {

  const manwhas: Manhwa[] = await dbReadMany(
    `
      SELECT m.*
      FROM manhwas m
      JOIN manhwa_authors ma ON m.manhwa_id = ma.manhwa_id
      WHERE ma.author_id = ?
      ORDER BY m.views DESC;
    `,
    [author_id]
  )

  return manwhas
}


export async function dbReadManhwaAuthors(manhwa_id: number): Promise<ManhwaAuthor[]> {
  const authors: ManhwaAuthor[] = await dbReadMany(
    `
      SELECT a.*
      FROM authors a
      JOIN manhwa_authors ma ON a.author_id = ma.author_id
      WHERE ma.manhwa_id = ?;
    `,
    [manhwa_id]
  )
  return authors
}


export async function dbReadManhwaById(manhwa_id: number): Promise<Manhwa | null> {
  const manhwa: Manhwa | null = await dbReadUnique(
    'SELECT * FROM manhwas WHERE manhwa_id = ?',
    [manhwa_id]
  )

  return manhwa;
}

export async function dbReadManhwasOrderedByUpdateAt(
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  
  const manhwas: Manhwa[] = await dbReadMany(
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
  )

  return manhwas
}

export async function dbReadManhwasOrderedByViews(
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  
  const manhwas: Manhwa[] = await dbReadMany(
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
  )
  
  return manhwas
}

export async function dbReadManhwasOrderedByRating(
  p_offset: number = 0, 
  p_limit: number = 30
): Promise<Manhwa[]> {
  
  const manhwas: Manhwa[] = await dbReadMany(
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
  )
  
  return manhwas
}


export async function dbReadLast3Chapters(manhwa_id: number): Promise<Chapter[]> {
  const chapters: Chapter[] = await dbReadMany(
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
  )

  return chapters
}


export async function dbReadGenres(): Promise<Genre[]> {
  const genres: Genre[] = await dbReadMany('SELECT * FROM genres ORDER BY genre;')
  return genres
}


export async function dbUpdateManhwaViews(manhwa_id: number) {
  const db = await openDB()
  db.transaction(tx => {
    tx.executeSql(
      `
      UPDATE 
          manhwas
        SET
          views = views + 1
        WHERE
          manhwa_id = ?
      `,
      [manhwa_id]
    )
  }).catch(error => console.log(error))   
}


export async function dbUpdateManhwaReadingStatus(manhwa_id: number, status: string) {
  const db = await openDB()
  db.transaction(tx => {
    tx.executeSql(
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
    )
  }).catch(error => console.log(error))
}

export async function dbGetManhwasByReadingStatus(
  status: string,
  p_offset: number = 0,
  p_limit: number = 30
): Promise<Manhwa[]> {
  const manhwas: Manhwa[] = await dbReadMany(
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
  )

  return manhwas
}


export async function dbGetManhwaReadingStatus(manhwa_id: number): Promise<string | null> {
  const r: {status: string} | null = await dbReadUnique<{status: string}>(
    "SELECT status FROM reading_status WHERE manhwa_id = ?", 
    [manhwa_id]
  )

  if (r) { return r.status }
  return null
}


export async function dbUpsertReadingHistory(manhwa_id: number, chapter_num: number) {
  await dbWrite(
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
  )
}
