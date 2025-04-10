import { tableSchema } from '@nozbe/watermelondb'


export const chapterSchema = tableSchema({
    name: 'chapters',
    columns: [
      { name: 'chapter_id', type: 'number', isIndexed: true },
      { name: 'manhwa_id', type: 'number' },
      { name: 'chapter_num', type: 'number' },
      { name: 'created_at', type: 'number' },
    ]
  })