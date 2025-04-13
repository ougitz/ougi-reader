import { field, text } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class ManhwaGenreModel extends Model {
  static table = 'manhwa_genres'
  
  @field('manhwa_id') manhwa_id
  @text('genre') genre

}