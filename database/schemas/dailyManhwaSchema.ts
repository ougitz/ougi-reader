import { tableSchema } from '@nozbe/watermelondb'


export const dailyManhwaSchema = tableSchema({
    name: 'daily_manhwa',
    columns: [
      { name: 'manhwa_id', type: 'number', isIndexed: true },
      { name: 'image_url', type: 'string' },
      { name: 'width', type: 'number' },
      { name: 'height', type: 'number' }
    ]
  })