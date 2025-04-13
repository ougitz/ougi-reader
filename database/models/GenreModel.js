import { text } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class GenreModel extends Model {
  static table = 'genres'

  @text('genre') genre

}