import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UtilsService } from './utils.service';
import { AuthenticationService } from './auth.service';
import { ParentTeacherMeeting, Room, PTMTeacherInRoom, PTMEvent, ParentRequest, User } from '../models/data-model';
import { ServerResponse } from '../models/server-models';

@Injectable()
export class ParentsService {
	hostname: string;
	url: string = "";
	lastSeen: { [key: number]: number} = {}

	constructor(
		private utils: UtilsService,
		private http: HttpClient,
		private authService: AuthenticationService,
		private utilsService: UtilsService
	) {
		this.hostname = this.utils.hostName();
	}

	addPtm(ptm: ParentTeacherMeeting) {
		this.url = this.hostname + "/parents/ptms";
		return this.http.post<ServerResponse>(this.url, ptm, { headers: this.authService.headers });
	}

	modifyPtm(ptm: ParentTeacherMeeting) {
		this.url = this.hostname + "/parents/ptms";
		return this.http.patch<ServerResponse>(this.url, ptm, { headers: this.authService.headers });
	}

	deletePtm(id: number) {
		this.url = this.hostname + "/parents/ptms/" + id;
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}

	get() {
		this.url = this.hostname + "/parents/ptms";
		return this.http.get<ParentTeacherMeeting[]>(this.url, { headers: this.authService.headers });
	}

	getFormer() {
		this.url = this.hostname + "/parents/ptms/former";
		return this.http.get<ParentTeacherMeeting[]>(this.url, { headers: this.authService.headers });
	}

	getPTMById(id: number) {
		this.lastSeen[id] = new Date().getTime();
		this.url = this.hostname + "/parents/ptms/" + id;
		return this.http.get<ParentTeacherMeeting>(this.url, { headers: this.authService.headers });
	}

	getPTMSettings(){
		this.url = this.hostname + "/parents/ptms/settings";
		return this.http.get<any>(this.url, { headers: this.authService.headers });
	}

	setPTMSettings(settings: { [key:string]: string }){
		this.url = this.hostname + "/parents/ptms/settings";
		return this.http.post<ServerResponse>(this.url, settings, { headers: this.authService.headers });
	}

	getLastChange(id: number){
		this.url = this.hostname + "/parents/ptms/" + id + "/lastChange";
		return this.http.get<Date>(this.url, { headers: this.authService.headers });
	}

	getFreeRooms(id: number) {
		this.url = this.hostname + "/parents/ptms/" + id + '/rooms';
		return this.http.get<Room[]>(this.url, { headers: this.authService.headers });
	}


	getFreeTeachers(id: number) {
		this.url = this.hostname + "/parents/ptms/" + id + '/teachers';
		return this.http.get<User[]>(this.url, { headers: this.authService.headers });
	}

	sendMails(id: number) {
		this.url = this.hostname + "/parents/ptms/" + id;
		return this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers });
	}

	registerRoom(id: number, ptmTiR: PTMTeacherInRoom) {
		this.url = this.hostname + "/parents/ptms/" + id + '/rooms';
		return this.http.post<ServerResponse>(this.url, ptmTiR, { headers: this.authService.headers });
	}

	cancelRoomRegistration(id: number) {
		this.url = this.hostname + '/parents/ptms/rooms/' + id
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}

	registerEvent(ptmEvent: PTMEvent) {
		this.url = this.hostname + '/parents/ptms/events'
		return this.http.post<ServerResponse>(this.url, ptmEvent, { headers: this.authService.headers });
	}

	cancelEvent(id: number) {
		this.url = this.hostname + '/parents/ptms/events/' + id
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}

	blockEvent(id: number, block: boolean){
		this.url = this.hostname + '/parents/ptms/events/' + id + '/' + (block ? 'true' : 'false')
		console.log(this.url)
		return this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers });
	}

	//Functions to handle parents
	getParents() {
		this.url = this.hostname + "/parents/";
		return this.http.get<User[]>(this.url, { headers: this.authService.headers });
	}

	addParent(ptm: User) {
		this.url = this.hostname + "/parents/";
		return this.http.post<ServerResponse>(this.url, ptm, { headers: this.authService.headers });
	}

	modifyParent(ptm: User) {
		this.url = this.hostname + "/parents/";
		return this.http.patch<ServerResponse>(this.url, ptm, { headers: this.authService.headers });
	}

	deleteParent(id: number) {
		this.url = this.hostname + "/parents/" + id;
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}
	setChildren(id: number, children: User[]) {
		this.url = this.hostname + "/parents/" + id +"/children";
		return this.http.post<ServerResponse>(this.url, children, { headers: this.authService.headers });
	}
	getChildren(id: number) {
		this.url = this.hostname + "/parents/" + id +"/children";
		return this.http.get<User[]>(this.url, {headers: this.authService.headers });
	}
	getMyChildren() {
		this.url = this.hostname + "/parents/myChildren";
		return this.http.get<User[]>(this.url, {headers: this.authService.headers });
	}

	//Functions to handle parent requests
	getParentRequests() {
		this.url = this.hostname + "/parents/requests/";
		return this.http.get<ParentRequest[]>(this.url, { headers: this.authService.headers });
	}

	addParentRequest(ptm: ParentRequest) {
		this.url = this.hostname + "/parents/requests/";
		return this.http.post<ServerResponse>(this.url, ptm, { headers: this.authService.headers });
	}

	modifyParentRequest(ptm: ParentRequest) {
		this.url = this.hostname + "/parents/requests/";
		return this.http.patch<ServerResponse>(this.url, ptm, { headers: this.authService.headers });
	}

	deleteParentRequest(id: number) {
		this.url = this.hostname + "/parents/requests/" + id;
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}

	adaptPtmTimes(ptm: ParentTeacherMeeting): ParentTeacherMeeting {
		ptm.start = this.utilsService.toIonISOString(new Date(ptm.start))
		ptm.end = this.utilsService.toIonISOString(new Date(ptm.end))
		ptm.startRegistration = this.utilsService.toIonISOString(new Date(ptm.startRegistration))
		ptm.endRegistration = this.utilsService.toIonISOString(new Date(ptm.endRegistration))
		return ptm
	}


	convertPtmTimes(ptm: ParentTeacherMeeting) {
		ptm.start = new Date(ptm.start).valueOf().toString()
		ptm.end = new Date(ptm.end).valueOf().toString()
		ptm.startRegistration = new Date(ptm.startRegistration).valueOf().toString()
		ptm.endRegistration = new Date(ptm.endRegistration).valueOf().toString()
	}
}
