import { tableSchema } from '@nozbe/watermelondb'


export const manhwaSchema = tableSchema({
    name: 'manhwas',
    columns: [
        { name: 'manhwa_id', type: 'number', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'descr', type: 'string' },
        { name: 'cover_image_url', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'color', type: 'string' },
        { name: 'views', type: 'number' },
        { name: 'ratings', type: 'number' }
    ]
})