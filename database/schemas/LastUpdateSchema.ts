import { tableSchema } from '@nozbe/watermelondb'


export const lastUpdateSchema = tableSchema({
    name: 'updates',
    columns: [
        { name: 'table', type: 'string' },
        { name: 'refresh_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
    ]
  })