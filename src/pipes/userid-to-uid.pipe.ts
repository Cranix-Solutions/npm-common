import { Pipe, PipeTransform } from '@angular/core';
import { GenericObjectService } from '../services/generic-object.service'
import { LanguageService } from '../services/language.service';
@Pipe({
  name: 'userIdToUid'
})
export class UseridToUidPipe implements PipeTransform {
  constructor(private gOS: GenericObjectService,
    private languageService: LanguageService
    ) { }
  transform(value: any, ...args: any[]): any {
    if ( value == 0 ) {
      return this.languageService.trans("nobody");
    }
    for (let obj of this.gOS.allObjects['user'].getValue()) {
      if (obj.id === value) {
        return obj.uid ;
      }
    }
    return value;
  }
}
