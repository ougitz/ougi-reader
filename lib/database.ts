import { Manhwa } from '@/model/Manhwa';
import SQLite from 'react-native-sqlite-storage';
import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { UpdateHistoryTable } from './model/UpdateHistoryModel';


SQLite.enablePromise(true);


function openDB() {
  return SQLite.openDatabase({
    name: 'ougi.db',
    location: 'default',
  });
}


async function initSchema(): Promise<SQLiteDatabase> {
  const db = await openDB();

  // ative enforcement de FK (opcional, mas recomendado)
  await db.executeSql('PRAGMA foreign_keys = ON;');

  // 1 comando por executeSql:
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS update_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      descr TEXT,
      refresh_cycle INTEGER,
      refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS genres (
      genre_id INTEGER PRIMARY KEY,
      genre TEXT NOT NULL
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS authors (
      author_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);

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
  `);

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
  `);  
  
  await db.executeSql(`DROP TABLE IF EXISTS manhwa_genres;`);
  await db.executeSql(
    `
      CREATE TABLE IF NOT EXISTS manhwa_genres (
        genre_id INTEGER NOT NULL,
        manhwa_id INTEGER NOT NULL,
        CONSTRAINT manhwa_genres_unique_cstr UNIQUE (manhwa_id, genre_id),
        
        CONSTRAINT 
          manhwa_genres_genre_id_fkey 
        FOREIGN KEY 
          (genre_id) 
        REFERENCES 
          genres (genre_id) 
        ON UPDATE CASCADE ON DELETE CASCADE,
        
        CONSTRAINT 
          manhwa_genres_manhwa_id_fkey 
        FOREIGN KEY 
          (manhwa_id) 
        REFERENCES 
          manhwas (manhwa_id) 
        ON UPDATE CASCADE ON DELETE CASCADE
      );
    `
  )

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS chapters (
      chapter_id INTEGER PRIMARY KEY,
      manhwa_id INTEGER,
      chapter_num INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manhwa_id) REFERENCES manhwas(manhwa_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // índices e view
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_id ON chapters(manhwa_id);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_ma_manhwa_id ON manhwa_authors(manhwa_id);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_manhwas_status ON manhwas(status);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_manhwas_rating ON manhwas(rating);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_chapters_manhwa_num ON chapters(manhwa_id, chapter_num DESC);`);


  await db.executeSql(
    `
    INSERT INTO update_history (
      name, descr, refresh_cycle
    ) 
    VALUES    
      ('manhwas', 'last time manhwa list was updated', 8 * 60),
      ('user_forced_update_db', 'last time user update the local database', 30)
    ON CONFLICT (name) DO NOTHING;
    `
  )

  await db.executeSql(`
    CREATE VIEW IF NOT EXISTS last_3_chapters AS
      SELECT c1.*
        FROM chapters c1
       WHERE (
         SELECT COUNT(*) 
           FROM chapters c2
          WHERE c2.manhwa_id = c1.manhwa_id
            AND c2.chapter_num > c1.chapter_num
       ) < 3;
  `);

  return db;
}

async function withTransaction(callback: (tx: any) => any) {
  const db = await initSchema();
  try {
    await db.transaction(async tx => {
      await callback(tx);
    });
  } catch (err) {
    console.error('Erro na transação:', err);
    throw err;
  }
}


export async function dbAddManhwa(manhwa: Manhwa) {
  console.log("add ", manhwa.title, "to dabatase")
  await withTransaction(tx =>
    tx.executeSql(
      `
        INSERT INTO manhwas (
          title, 
          descr, 
          status,
          color,
          cover_image_url,
          rating,
          views
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [manhwa.title, manhwa.descr, manhwa.status, manhwa.color, manhwa.cover_image_url, manhwa.rating, manhwa.views]
    )
  );  
}

export async function dbListTable(table_name: string) {
  const db = await initSchema();
  const [result] = await db.executeSql(
    `SELECT * FROM ${table_name};`
  ); 
  for (let i = 0; i < result.rows.length; i++) {
    console.log(result.rows.item(i));
  }  
}

export async function dbListTables() {
  const db = await initSchema()
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
  const db = await initSchema();

  const [result] = await db.executeSql(query, args);

  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows.item(0) as T; 
}


export async function dbReadAll<T>(table_name: string): Promise<T[]> {
  const db = await initSchema();

  const [result] = await db.executeSql(
    `SELECT * FROM ${table_name};`
  ); 

  let r: T[] = []
  for (let i = 0; i < result.rows.length; i++) {
    r.push(result.rows.item(i));
  }

  return r
}

export async function dbCheckTableUpdate(table_name: string) {
  const updateInfo = await dbReadUnique<UpdateHistoryTable>(
    'SELECT * FROM update_history WHERE name = ?;',
    [table_name]
  )
  console.log(updateInfo)
}

export async function dbUpsertManhwas(manhwas: Manhwa[]) {
  const db: SQLiteDatabase = await initSchema();
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
          tx.executeSql(
            "INSERT OR REPLACE INTO manhwa_genres (manhwa_id, genre_id) VALUES (?, ?);",
            [m.manhwa_id, g.genre_id]
          )
        }        
        
        // AUTHORS
        for (const a of m.authors) {
          tx.executeSql(
            "INSERT OR REPLACE INTO authors (author_id, name, role) VALUES (?, ?, ?);",
            [a.author_id, a.name, a.role]
          )
          tx.executeSql(
            "INSERT OR REPLACE INTO manhwa_authors (manhwa_id, author_id) VALUES (?, ?);",
            [m.manhwa_id, a.author_id]
          )
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

}