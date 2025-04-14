import { field, date, text } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class ManhwaRecommendationModel extends Model {
  static table = 'manhwa_recommendations'

  @field('manhwa_id') manhwa_id
  @text('image_url') image_url
  @field('width') width  
  @field('height') height

}