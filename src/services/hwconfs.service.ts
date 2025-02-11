import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UtilsService } from './utils.service';
import { Device, Hwconf } from '../models/data-model';
import { AuthenticationService } from './auth.service';
import { ServerResponse } from '../models/server-models';


export interface CloneCommand {
	deviceIds: number[],
	partitionIds: number[],
	multiCast: boolean,

}

@Injectable()
export class HwconfsService {

	hostname: string;
	url: string = "";

	constructor(
		private utilsS: UtilsService,
		private http: HttpClient,
		private authService: AuthenticationService) {
		this.hostname = this.utilsS.hostName();
	}

	startCloning(clone: CloneCommand, hwconfId: number) {
		this.url = `${this.hostname}/clonetool/${hwconfId}/cloning`;
		return this.http.post<ServerResponse>(this.url, clone, { headers: this.authService.headers });
	};

	//GET Calls

	getMembers(id: number) {
		this.url = `${this.hostname}/devices/byHWConf/${id}`;
		console.log(this.url);
		return this.http.get<Device[]>(this.url, { headers: this.authService.headers });
	}
	getHwconfById(id: number) {
		this.url = `${this.hostname}/clonetool/${id}`;
		console.log(this.url);
		return this.http.get<Hwconf>(this.url, { headers: this.authService.headers });
	}

	getMultiDevs() {
		this.url = `${this.hostname}/clonetool/multicastDevices`;
		console.log(this.url);
		return this.http.get<string[]>(this.url, { headers: this.authService.headers });
	}

	getRunningMulticast() {
		this.url = `${this.hostname}/clonetool/runningMulticast`;
		console.log(this.url);
		return this.http.get<string>(this.url, { headers: this.authService.headers });
	}

	getHWConfs() {
		this.url = `${this.hostname}/clonetool/all`;
		console.log(this.url);
		return this.http.get<Hwconf[]>(this.url, { headers: this.authService.headers });
	}
	//PUT calls

	writeHWToMulti(hwId: number) {
		this.url = `${this.hostname}/clonetool/${hwId}/cloning/1`;
		console.log(this.url);
		return this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers });
	}

	startMultiCast(parId: number, net: string) {
		this.url = `${this.hostname}/clonetool/partitions/${parId}/multicast/${net}`;
		console.log(this.url);
		return this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers });
	}
	//DELETE calls

	deleteHwconfById(hwconfId: number) {
		this.url = this.hostname + `/clonetool/${hwconfId}`;
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}

	deletePartition(hwconfId: number, partName: string) {
		this.url = this.hostname + `/hwconfs/${hwconfId}/${partName}`;
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}

	stopMulticast() {
		this.url = this.hostname + "/clonetool/runningMulticast";
		return this.http.delete<ServerResponse>(this.url, { headers: this.authService.headers });
	}
}
