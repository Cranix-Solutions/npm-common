import { InterpolatableTranslationObject, TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { ServerResponse } from '../models/server-models';
import { StorageService } from './storage.service';

const LNG_KEY = 'SELECTED_LANGUAGE';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language: string = 'de';
  translations:  Record<string, InterpolatableTranslationObject>= {};
  constructor(
    private translate: TranslateService,
    private storage: StorageService,
  ) {
    this.initializeAppLanguage();
  }

  initializeAppLanguage() {
    let lang = this.translate.getBrowserLang();
    if(lang) {
      this.setLanguage(lang);
    }
    console.log('language is', this.language);
    this.translations = this.translate.translations;
  }

  getLanguages() {
    return [
      { text: 'English', value: 'en' },
      { text: 'German', value: 'de' },
    ];
  }

  setLanguage(lang: string) {
    this.language =  lang.toLowerCase();
    this.translate.use(this.language);
    this.translate.setDefaultLang(this.language);
  }
  saveLanguage(lang: string) {
    this.storage.set(LNG_KEY, lang);
    this.setLanguage(lang);
  }

  setCustomLanguage(){
    this.setLanguage(this.storage.get(LNG_KEY, this.language));
  }

  trans(val: string) {
    if(this.translations[this.language])
    return this.translations[this.language][val] ? this.translations[this.language][val] : val;
  }

  transResponse(resp: ServerResponse) {
    let form = this.trans(resp.value);
    switch (resp.parameters.length) {
      case 0: return form;
     /* case 1: return sprintf(form, resp.parameters[0]);
      case 2: return sprintf(form, resp.parameters[0], resp.parameters[1]);
      case 3: return sprintf(form, resp.parameters[0], resp.parameters[1], resp.parameters[2]);
      case 4: return sprintf(form, resp.parameters[0], resp.parameters[1], resp.parameters[2], resp.parameters[3]);
      default: return sprintf(form, resp.parameters[0], resp.parameters[1], resp.parameters[2], resp.parameters[3], resp.parameters[4]); */
    }
  }
}
