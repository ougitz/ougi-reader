import { field, text } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class DailyManhwaModel extends Model {
  static table = 'daily_manhwa'

  @field('manhwa_id') manhwa_id
  @text('image_url') image_url

}