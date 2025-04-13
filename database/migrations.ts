import { tableSchema } from '@nozbe/watermelondb'
import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { version } from 'react'

export default schemaMigrations({  
  migrations: [
    {
        toVersion: 5,
        steps: [
            addColumns({
              table: 'daily_manhwa',
              columns: [
                { name: 'width', type: 'number' },
                { name: 'height', type: 'number' }
              ]
            })
        ]
    }
  ],
})