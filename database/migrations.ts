import { tableSchema } from '@nozbe/watermelondb'
import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { version } from 'react'

export default schemaMigrations({  
  migrations: [
    {
        toVersion: 6,
        steps: [
            createTable({
              name: 'manhwa_recommendations',
              columns: [
                { name: 'manhwa_id', type: 'number', isIndexed: true },
                { name: 'image_url', type: 'string' },
                { name: 'width', type: 'number' },
                { name: 'height', type: 'number' }
              ]
            })
        ]
    }
  ],
})