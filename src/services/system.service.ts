import { Injectable, OnInit } from '@angular/core';
// import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders, HttpParams, HttpClientModule } from '@angular/common/http';
//Own Stuff
import { UtilsService } from './utils.service';
import { AuthenticationService } from './auth.service';
import { SupportRequest, SystemConfig } from '../models/data-model';
import { ServerResponse, Acl, ServiceStatus, MailAccess } from '../models/server-models';
import { GenericObjectService } from './generic-object.service';
import { LanguageService } from './language.service';

@Injectable()
export class SystemService {

	hostname: string = "";
	url: string = "";
	public addons: string[] = [];
	public addonActions?: any;
	public addonKeys?: any;
	public selectedAddon = "";
	public dnsDomains: string[] = [];

	constructor(
		private http: HttpClient,
		private utilsS: UtilsService,
		public languageS: LanguageService,
		private authService: AuthenticationService,
		private objectService: GenericObjectService) {
		this.initModule();
	}
	initModule() {
		this.hostname = this.utilsS.hostName();
	}

	getStatus() {
		this.url = this.hostname + `/system/status`;
		console.log(this.url);
		return this.http.get(this.url, { headers: this.authService.headers });
	}

	restartJob(jobId: number) {
		this.url = this.hostname + `/system/jobs/${jobId}/restart`;
		console.log(this.url);
		return this.http.put(this.url, null, { headers: this.authService.headers });
	}

	getInstituteName() {
		this.url = this.hostname + `/system/name`;
		console.log(this.url);
		return this.http.get(this.url, { headers: this.authService.textHeaders, responseType: 'text' });
	}

	getRegCode() {
		this.url = this.hostname + `/system/configuration/REG_CODE`;
		console.log(this.url);
		return this.http.get(this.url, { headers: this.authService.textHeaders, responseType: 'text' });
	}

	getInstituteType() {
		this.url = this.hostname + `/system/type`;
		console.log(this.url);
		return this.http.get(this.url, { headers: this.authService.textHeaders, responseType: 'text' });
	}

	update() {
		this.url = this.hostname + `/system/update`;
		console.log(this.url);
		this.objectService.requestSent();
		let sub = this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers }).subscribe({
			next: (val) => {
				this.objectService.responseMessage(val);
			},
			error: (err) => {
				this.objectService.errorMessage(this.languageS.trans("An error was accoured"));
			},
			complete: () => { sub.unsubscribe() }
		});
	}

	restart() {
		this.url = this.hostname + `/system/reboot`;
		console.log(this.url);
		this.objectService.requestSent();
		let sub = this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers }).subscribe({
			next: (val) => {
				this.objectService.responseMessage(val);
			},
			error: (err) => {
				this.objectService.errorMessage(this.languageS.trans("An error was accoured"));
			},
			complete: () => { sub.unsubscribe() }
		});
	}

	shutDown() {
		this.url = this.hostname + `/system/shutDown`;
		console.log(this.url);
		this.objectService.requestSent();
		let sub = this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers }).subscribe({
			next: (val) => {
				this.objectService.responseMessage(val);
			},
			error: (err) => {
				this.objectService.errorMessage(this.languageS.trans("An error was accoured"));
			},
			complete: () => { sub.unsubscribe() }
		});
	}

	getSystemConfiguration() {
		this.url = this.hostname + `/system/configuration`;
		console.log(this.url);
		return this.http.get<SystemConfig[]>(this.url, { headers: this.authService.headers });
	}

	setSystemConfigValue(key: string, value: string) {
		this.url = this.hostname + `/system/configuration`;
		console.log(this.url);
		let tmp = {
			"key": key,
			"value": value
		}
		return this.http.post<ServerResponse>(this.url, tmp, { headers: this.authService.headers });
	}

	getSystemConfigValue(key: string) {
		this.url = this.hostname + `/system/configuration/${key}`;
		console.log(this.url);
		return this.http.get(this.url, { headers: this.authService.textHeaders, responseType: 'text' });
	}

	createSupportRequest(support: SupportRequest) {
		this.url = this.hostname + `/support/create`;
		console.log(this.url);
		return this.http.post<ServerResponse>(this.url, support, { headers: this.authService.headers });
	}

	getServiceStatus() {
		this.url = this.hostname + '/system/services';
		console.log(this.url);
		return this.http.get<ServiceStatus[]>(this.url, { headers: this.authService.headers });
	}

	applyServiceState(name: string, what: string, value: string) {
		this.url = this.hostname + `/system/services/${name}/${what}/${value}`;
		console.log(this.url);
		this.objectService.requestSent();
		let sub = this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers }).subscribe({
			next: (val) => {
				this.objectService.responseMessage(val);
			},
			error: (err) => {
				this.objectService.errorMessage(this.languageS.trans("An error was accoured"));
			},
			complete: () => { sub.unsubscribe() }
		});
	}

	getAclsOfObject(objectType: string, id: number) {
		this.url = this.hostname + `/system/acls/${objectType}s/${id}`;
		console.log(this.url);
		return this.http.get<Acl[]>(this.url, { headers: this.authService.headers });
	}

	getAvailableAclsOfObject(objectType: string, id: number) {
		this.url = this.hostname + `/system/acls/${objectType}s/${id}/available`;
		console.log(this.url);
		return this.http.get<Acl[]>(this.url, { headers: this.authService.headers });
	}

	setAclOfObject(objectType: string, id: number, acl: Acl) {
		this.url = this.hostname + `/system/acls/${objectType}s/${id}`;
		console.log(this.url);
		return this.http.post<ServerResponse>(this.url, acl, { headers: this.authService.headers });
	}

	getAddons() {
		this.url = this.hostname + '/system/addon'
		this.http.get<string[]>(this.url, { headers: this.authService.headers }).subscribe({
			next: (addons) => {
				this.addons = addons;
				for (let addon of this.addons) {
					this.http.get(this.url + `/${addon}/listActions`, { headers: this.authService.textHeaders, responseType: "text" }).subscribe(
						(actions) => { this.addonActions[addon] = actions.split(" ") }
					);
					this.http.get(this.url + `/${addon}/listKeys`, { headers: this.authService.textHeaders, responseType: "text" }).subscribe({
						next: (keys) => { this.addonKeys[addon] = keys.split(" ") },
						error: (err) => { console.log('get Actions', err) },
						complete: () => { this.selectedAddon = this.addons[0] }
					});
				}
			},
			error: (err) => { console.log('get addons', err) }
		})
	}

	applyAction(action: string) {
		this.url = this.hostname + '/system/addon/' + this.selectedAddon + '/' + action;
		console.log(this.url);
		return this.http.put<ServerResponse>(this.url, null, { headers: this.authService.headers });
	}

	getKey(key: string) {
		this.url = this.hostname + '/system/addon/' + this.selectedAddon + '/' + key;
		console.log(this.url);
		return this.http.get(this.url, { headers: this.authService.textHeaders, responseType: "text"  });
	}

	getFile(path: string) {
		this.url = this.hostname + "/system/file";
		console.log(this.url);
		let formData: FormData = new FormData();
		formData.append('path', path);
		return this.http.post(this.url, formData, { headers: this.authService.anyHeaders, responseType: 'text' });
	}

	getDnsDomains() {
		this.url = this.hostname + '/system/dns/domains';
		console.log(this.url);
		this.http.get<string[]>(this.url,{ headers: this.authService.headers }).subscribe({
			next: (res) => { this.dnsDomains = res.filter(obj => !obj.endsWith('.in-addr.arpa')).sort() },
			error: (err) => { console.log('get Actions', err) }
		});
	}

	/**
	 * Mailserver stuff
	 */
	getAllMailAccess(){
		this.url = this.hostname + '/system/mailserver/access';
		console.log(this.url);
		return this.http.get<MailAccess[]>(this.url, { headers: this.authService.headers  });
	}
	addMailAccess(mailAccess: MailAccess){
		this.url = this.hostname + '/system/mailserver/access';
		console.log(this.url);
		return this.http.post<ServerResponse>(this.url, mailAccess, { headers: this.authService.headers  })
	}
	deleteMailAccess(id: string){
		this.url = this.hostname + `/system/mailserver/access/${id}`;
		console.log(this.url);
		this.http.delete<ServerResponse>(this.url,{ headers: this.authService.headers  }).subscribe(
			(val)=>{this.objectService.responseMessage(val)}
		)
	}
}
