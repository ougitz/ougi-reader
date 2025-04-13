import { tableSchema } from '@nozbe/watermelondb'


export const manhwaAuthorSchema = tableSchema({
    name: 'manhwa_authors',
    columns: [
        { name: 'author_id', type: 'number', isIndexed: true },
        { name: 'manhwa_id', type: 'number' }        
    ]
  })