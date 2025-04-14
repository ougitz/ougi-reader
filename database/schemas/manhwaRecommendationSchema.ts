import { tableSchema } from '@nozbe/watermelondb'


export const manhwaRecommendationSchema = tableSchema({
    name: 'manhwa_recommendations',
    columns: [
        { name: 'manhwa_id', type: 'number', isIndexed: true },
        { name: 'image_url', type: 'string' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' }
    ]
  })