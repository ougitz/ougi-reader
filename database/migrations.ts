import { tableSchema } from '@nozbe/watermelondb'
import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { version } from 'react'

export default schemaMigrations({  
  migrations: [
    {
        toVersion: 3,
        steps: [
            addColumns({
              table: 'manhwas',
              columns: [
                { name: 'ratings', type: 'number' }
              ]
            })
        ]
    }
  ],
})