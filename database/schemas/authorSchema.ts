import { tableSchema } from '@nozbe/watermelondb'


export const authorsSchema = tableSchema({
    name: 'authors',
    columns: [
      { name: 'author_id', type: 'number', isIndexed: true },
      { name: 'name', type: 'string' },
      { name: 'role', type: 'string' }      
    ]
  })