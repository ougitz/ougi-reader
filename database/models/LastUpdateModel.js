import { field } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'


export default class LastUpdateModel extends Model {
  static table = 'updates'
  
  @field('table') table
  @field('refresh_at') refresh_at
  @field('updated_at') updated_at  

}