import { appSchema } from '@nozbe/watermelondb'
import { lastUpdateSchema } from './schemas/LastUpdateSchema'
import { chapterSchema } from './schemas/ChapterSchema'
import { manhwaSchema } from './schemas/ManhwaSchema'
import { genreSchema } from './schemas/GenreSchema'


export const schemas = appSchema({
  version: 2,
  tables: [
    manhwaSchema,
    chapterSchema,
    genreSchema,
    lastUpdateSchema
  ]
})