import { appSchema } from '@nozbe/watermelondb'
import { lastUpdateSchema } from './schemas/LastUpdateSchema'
import { chapterSchema } from './schemas/ChapterSchema'
import { manhwaSchema } from './schemas/ManhwaSchema'
import { genreSchema } from './schemas/GenreSchema'
import { authorsSchema } from './schemas/authorSchema'
import { manhwaGenreSchema } from './schemas/ManhwaGenreSchema'
import { manhwaAuthorSchema } from './schemas/manhwaAuthorSchema'

export const schemas = appSchema({
  version: 3,
  tables: [
    manhwaSchema,
    chapterSchema,
    genreSchema,
    lastUpdateSchema,
    manhwaGenreSchema,
    authorsSchema,
    manhwaAuthorSchema
  ]
})