import { field, text, date } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'



export default class ManhwaModel extends Model {
  static table = 'manhwas'

  @field('manhwa_id') manhwa_id
  @field('title') title
  @field('descr') descr
  @field('cover_image_url') cover_image_url
  @text('status') status
  @date('created_at') created_at
  @date('updated_at') updated_at
  @text('color') color

}
