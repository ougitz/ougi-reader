import { tableSchema } from '@nozbe/watermelondb'
import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import { version } from 'react'

export default schemaMigrations({  
  migrations: [
    {
        toVersion: 2,
        steps: [
            addColumns({
                table: 'manhwas',
                columns: [
                    { name: 'views', type: 'number' }
                ]
            })
        ]
    }
  ],
})