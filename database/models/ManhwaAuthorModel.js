import { field, text } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class ManhwaAuthorModel extends Model {
  static table = 'manhwa_authors'

  @field('author_id') author_id
  @field('manhwa_id') manhwa_id  

}