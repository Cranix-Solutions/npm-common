import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanDeactivate } from '@angular/router';

//own modules
import { UtilsService } from './utils.service';
import { AuthenticationService } from './auth.service';
import { CrxObjectService } from './crx-object-service';
import { ServerResponse } from '../models/server-models';
import { CrxChallenge, CrxQuestion, TeachingSubject } from '../models/data-model';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class ChallengesService {

  hostname: string;
  modified: boolean = false;

  constructor(
    private http: HttpClient,
    private utilsS: UtilsService,
    private authService: AuthenticationService) {
    this.hostname = this.utilsS.hostName();
  }

  add(challenge: CrxChallenge) {
    let url = this.hostname + "/challenges"
    return this.http.post<ServerResponse>(url, challenge, { headers: this.authService.headers })
  }

  modify(challenge: CrxChallenge) {
    let url = this.hostname + "/challenges"
    return this.http.patch<ServerResponse>(url, challenge, { headers: this.authService.headers })
  }

  startAndAssign(challenge: CrxChallenge) {
    let url = this.hostname + "/challenges/start"
    return this.http.post<ServerResponse>(url, challenge, { headers: this.authService.headers })
  }

  delete(challengeId: number) {
    let url = this.hostname + `/challenges/${challengeId}`
    return this.http.delete<ServerResponse>(url, { headers: this.authService.headers })
  }

  deleteQuestion(challengeId: number, questionId: number) {
    let url = this.hostname + `/challenges/${challengeId}/${questionId}`
    return this.http.delete<ServerResponse>(url, { headers: this.authService.headers })
  }

  deleteAnswer(challengeId: number, questionId: number, answerId: number) {
    let url = this.hostname + `/challenges/${challengeId}/${questionId}/${answerId}`
    return this.http.delete<ServerResponse>(url, { headers: this.authService.headers })
  }

  getQuestions(subjectId: number) {
    let url = this.hostname + "/challenges/questions"
    if( subjectId ) {
      url = this.hostname + `/challenges/subjects/${subjectId}/questions`
    }
    return this.http.get<CrxQuestion[]>(url, { headers: this.authService.anyHeaders })
  }

  saveChallengeAnswers(challengeId: number, answers: {}) {
    let url = this.hostname + `/challenges/todos/${challengeId}`
    return this.http.post<ServerResponse>(url, answers, { headers: this.authService.headers })
  }

  getMyAnswers(challengeId: number) {
    let url = this.hostname + `/challenges/todos/${challengeId}`
    return this.http.get<any>(url, { headers: this.authService.headers })
  }

  evaluate(challengeId: number) {
    let url = this.hostname + `/challenges/${challengeId}/results`
    return this.http.get(url, { headers: this.authService.anyHeaders, responseType: 'text' })
  }

  stopAndArchive(challengeId: number) {
    let url = this.hostname + `/challenges/${challengeId}/archives`
    return this.http.put(url, null, { headers: this.authService.anyHeaders, responseType: 'text' })
  }

  getArchives(challengeId: number) {
    let url = this.hostname + `/challenges/${challengeId}/archives`
    return this.http.get<string[]>(url, { headers: this.authService.anyHeaders })
  }

  downloadArchive(challengeId: number, dateString: string) {
    let url = this.hostname + `/challenges/${challengeId}/archives/${dateString}`
    return this.http.get(url, { headers: this.authService.anyHeaders, observe : 'response', responseType: 'blob' })
  }

  getChallengesFromCephalix(subject: TeachingSubject) {
    let url = this.hostname + '/challenges/cephalix/get'
    return this.http.post<any[]>(url, subject, { headers: this.authService.headers })
  }

  getQuestionsFromCephalix(subject: TeachingSubject) {
    let url = this.hostname + '/challenges/cephalix/getQuestions'
    return this.http.post<any[]>(url, subject, { headers: this.authService.headers })
  }

  addChallengeToCephalix(challenge: CrxChallenge) {
    let url = this.hostname + "/challenges/cephalix/add"
    return this.http.post<ServerResponse>(url, challenge, { headers: this.authService.headers })
  }
}

@Injectable()
export class ChallengeCanDeactivate implements CanDeactivate<ChallengesService> {
  constructor(
    public languageS: LanguageService,
    public challengesService: ChallengesService
  ) { }
  canDeactivate(challengesService: ChallengesService) {
    if (this.challengesService.modified) {
      return window.confirm(
        this.languageS.trans('The changes will be lost if you leave the module.')
      );
    }
    return true;
  }
}