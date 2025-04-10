import { field, date } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class ChapterModel extends Model {
  static table = 'chapters'

  @field('chapter_id') chapter_id
  @field('manhwa_id') manhwa_id
  @field('chapter_num') chapter_num  
  @date('created_at') created_at

}