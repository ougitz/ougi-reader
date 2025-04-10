import { tableSchema } from '@nozbe/watermelondb'


export const genreSchema = tableSchema({
    name: 'genres',
    columns: [
      { name: 'genre', type: 'string', isIndexed: true }
    ]
  })