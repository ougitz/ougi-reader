import { tableSchema } from '@nozbe/watermelondb'
import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { version } from 'react'

export default schemaMigrations({  
  migrations: [
    {
        toVersion: 4,
        steps: [
            createTable({
              name: 'daily_manhwa',
              columns: [
                { name: 'manhwa_id', type: 'number', isIndexed: true },
                { name: 'image_url', type: 'string' }
              ]
            })
        ]
    }
  ],
})