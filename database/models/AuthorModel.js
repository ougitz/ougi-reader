import { field, text } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class AuthorModel extends Model {
  static table = 'authors'

  @field('author_id') author_id
  @text('name') name
  @text('role') role  

}