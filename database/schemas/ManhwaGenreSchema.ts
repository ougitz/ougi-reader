import { tableSchema } from '@nozbe/watermelondb'


export const manhwaGenreSchema = tableSchema({
    name: 'manhwa_genres',
    columns: [
        { name: 'manhwa_id', type: 'number', isIndexed: true },
        { name: 'genre', type: 'string' }
    ]
  })