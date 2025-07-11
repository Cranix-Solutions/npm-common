import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
// own modules
import { ServerResponse } from '../models/server-models';
import { Group, Package, User } from '../models/data-model';
import { UtilsService } from './utils.service';
import { AuthenticationService } from './auth.service';
import { LanguageService } from './language.service';
import { CrxObjectService } from './crx-object-service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class GenericObjectService {
  //allObjects: {} = {};
  allObjects?: any;
  selectedObject: any = null;
  selectedObjectType?: string;
  selection: any[] = [];
  selectedIds: number[] = [];
  selectedRoom: any = null;
  selectedGroup: any = null;
  packagesAvailable: Package[] = [];
  /**
   * The base objects which need to be loaded by the initialisations
   */
  private objectsTemlate: string[] = [
    'education/user',
    'education/group',
    'education/guestUser',
    'user',
    'group',
    'room',
    'device',
    'hwconf',
    'printer',
    'adhocroom',
    'challenge',
    'challenges/todo'
  ]
  objects: string[] = [];
  /**
   * Default.ini for cephalix
   */
  cephalixDefaults: any = {};

  selects: any = {
    'action': ['wol', 'reboot', 'shutdown', 'logout'],
    'agGridThema': ['ag-theme-material', 'ag-theme-alpine', 'ag-theme-balham'],
    'devCount': [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096],
    'identifier': ['sn-gn-bd', 'uuid', 'uid'],
    'lang': ['DE', 'EN'],
    'status': ['N', 'A', 'D'],
    'supporttype': ['Error', 'FeatureRequest', 'Feedback', 'ProductOrder']
  }
  initialized: number = 0;
  enumerates: string[] = [
    'instituteType', 'groupType', 'deviceType', 'roomType', 'roomControl', 'network', 'accessType', 'role', 'noticeType'
  ];

  multivalued: string[] = [
    'softwareVersions', 'softwareFullNames', 'mailAliases'
  ]

  /**
   * Attributes which can not be modified
   */
  readOnlyAttributes: string[] = [
    'id',
    'accessType',
    'classes',
    'counter',
    'devCount',
    'fsQuotaUsed',
    'ip',
    'ignoreNetbios',
    'loggedInName',
    'msQuotaUsed',
    'modified',
    'name',
    'network',
    'netMask',
    'creatorName',
    'created',
    'role',
    'roomId',
    'sourceAvailable',
    'startIP',
    'uid',
    'wlanIp'
  ]
  /**
   * Attributes which we get but need not be shown
   */
  hiddenAttributes: string[] = [
    'accessInRooms',
    'cephalixInstituteId',
    'color',
    'deleted',
    'devices',
    'fullName',
    'loggedInId',
    'network',
    'creatorId',
    'partitions',
    'saveNext',
    'screenShot',
    'users'
  ]
  /**
   * Required attributes
   */
  required: any = {
    'givenName': '*',
    'groupType': '*',
    'identifier': "*",
    'instituteType': '*',
    'importFile': "*",
    'name': '*',
    'regCode': '*',
    'role': '*',
    'surName': '*'
  };

  constructor(
    public alertController: AlertController,
    public authService: AuthenticationService,
    private http: HttpClient,
    private languageS: LanguageService,
    private utilsS: UtilsService,
    private crxObjectService: CrxObjectService,
    public toastController: ToastController,
    private router: Router) {
  }

  initialize(force: boolean) {
    this.objects = []
    this.crxObjectService.getSubjects();
    if (this.authService.isAllowed('cephalix.manage')) {
      this.initializeCephalixObjects();
    }
    if (this.authService.isAllowed('customer.manage')) {
      this.objects.push('customer');
    }
    if (this.authService.isAllowed('cephalix.ticket')) {
      this.objects.push('ticket');
    }
    if (this.authService.isAllowed('2fa.manage')) {
      this.objects.push('2fa');
    }
    for (let obj of this.objectsTemlate) {
      this.objects.push(obj)
    }
    let subs: any = {};
    this.utilsS.log("initialize all objects")
    for (let key of this.objects) {
      this.getAllObject(key);
    }
    for (let key of this.enumerates) {
      let url = this.utilsS.hostName() + "/system/enumerates/" + key;
      subs[key] = this.http.get<string[]>(url, { headers: this.authService.headers }).subscribe({
        next: (val) => { this.selects[key] = val; },
        error: (err) => { },
        complete: () => { subs[key].unsubscribe() }
      });
    }
    if (this.authService.isAllowed('software.download')) {
      this.getSoftwaresToDowload();
    }
    console.log("initialized");
  }


  initializeCephalixObjects() {
    this.objects.push('institute');
    let url = this.utilsS.hostName() + "/institutes/defaults/";
    let sub1 = this.http.get<string[]>(url, { headers: this.authService.headers }).subscribe({
      next: (val) => { this.cephalixDefaults = val; },
      error: (err) => { },
      complete: () => { sub1.unsubscribe() }
    });
    url = this.utilsS.hostName() + "/institutes/ayTemplates/";
    let sub2 = this.http.get<string[]>(url, { headers: this.authService.headers }).subscribe({
      next: (val) => { this.selects['ayTemplate'] = val; },
      error: (err) => { },
      complete: () => { sub2.unsubscribe() }
    });
    url = this.utilsS.hostName() + "/institutes/objects/";
    let sub3 = this.http.get<string[]>(url, { headers: this.authService.headers }).subscribe({
      next: (val) => { this.selects['objects'] = val; },
      error: (err) => { },
      complete: () => { sub3.unsubscribe() }
    });
  }
  getSoftwaresToDowload() {
    let url = this.utilsS.hostName() + "/softwares/available";
    let sub = this.http.get<Package[]>(url, { headers: this.authService.headers }).subscribe({
      next: (val) => { this.packagesAvailable = val; },
      error: (err) => {
        console.log('getSoftwaresToDowload');
        console.log(err)
      },
      complete: () => { sub.unsubscribe() }
    });
  }


  getObjects(objectType: string){
    if(!this.authService.session) return
    let url = this.utilsS.hostName() + "/" + objectType + "s/all";
    //We do not read all challenges only the challenges from the selected
    if (objectType == 'challenge' && this.authService.selectedTeachingSubject) {
      url = this.utilsS.hostName() + "/challenges/subjects/" + this.authService.selectedTeachingSubject.id
    }
    console.log("getObjects " + url)
    return fetch(url, {
      method: 'get', headers: new Headers({
        'Content-Type': "application/json",
        'Accept': "application/json",
        'Authorization': "Bearer " + this.authService.session.token
      })
    })
  }
  /**
   * Loads the object of type 'objectType' from the server
   * @param objectType
   */
  async getAllObject(objectType: string) {
    if (this.objects.indexOf(objectType) == -1) {
      console.error("Unknown object type:", objectType)
      return;
    }
    try {
      let respons = await this.getObjects(objectType)
      if(!respons) {
        console.error("No respons")
        return;
      }
      let val = await respons.json()
      if (objectType == 'ticket') {
        val.sort(this.sortByCreated)
      }
      this.allObjects[objectType] = val;
      this.selects[objectType + 'Id'] = []
      for (let obj of <any[]>val) {
        this.selects[objectType + 'Id'].push(obj.id);
      }this.initialized++;
    } catch (error) {
      if (!this.allObjects[objectType]) {
        this.allObjects[objectType] = [];
        this.selects[objectType + 'Id'] = [];
      }
    }
  }


  getSubscribe(path: string) {
    let url = this.utilsS.hostName() + path
    return this.http.get<any[]>(url, { headers: this.authService.headers })
  }

  isInitialized() {
    if (this.initialized > 0 && this.initialized >= this.objects.length) {
      return true;
    }
    return false;
  }

  applyAction(object: string, objectType: string, action: string) {
    switch (action) {
      case "add": {
        return this.addObject(object, objectType);
      }
      case "modify": {
        return this.modifyObject(object, objectType);
      }
      case "delete": {
        return this.deleteObject(object, objectType);
      }
    }
  }

  getObjectById(objectType: string, objectId: number) {
    if (!objectId) {
      return null;
    }
    if (!objectType) {
      console.log("getObjectById", this);
      return null
    }
    for (let obj of this.allObjects[objectType]) {
      if (obj.id === objectId) {
        return obj;
      }
    }
    return null;
  }

  idToName(objectType: string, objectId: number) {
    objectType = this.idToPipe(objectType)
    for (let obj of this.allObjects[objectType]) {
      if (obj.id === objectId) {
        if (obj.name) {
          return obj.name;
        }
        if (obj.uid) {
          return obj.uid + " (" + obj.givenName + " " + obj.surName + ")";
        }
      }
    }
    return objectId;
  }
  idToUid(objectType: string, objectId: number) {
    for (let obj of this.allObjects[objectType]) {
      if (obj.id == objectId) {
        return obj.uid;
      }
    }
    return objectId;
  }
  idToFulName(objectId: number) {
    for (let obj of this.allObjects['user']) {
      if (obj.id == objectId) {
        return obj.surName + ", " + obj.givenName;
      }
    }
    return objectId;
  }
  /**
   * Converts the id name to the object name:
   *  roomId -> room
   *  roomIds -> room
   * @param idName
   */
  idToPipe(idName: string) {
    if (idName == 'creatorId' || idName == 'loggedInId' || idName.startsWith('owner')) {
      return 'user';
    }
    if (idName == 'cephalixCustomerId') {
      return 'customer';
    }
    if (idName == 'cephalixInstituteId') {
      return 'institute';
    }
    if (idName.substring(idName.length - 2) == 'Id') {
      return idName.substring(0, idName.length - 2)
    }
    if (idName.substring(idName.length - 3) == 'Ids') {
      return idName.substring(0, idName.length - 3)
    }
    return idName;
  }

  addObject(object: any, objectType: string) {
    const body = object;
    let url = this.utilsS.hostName() + "/" + objectType + "s/add";
    return this.http.post<ServerResponse>(url, body, { headers: this.authService.headers });
  }
  modifyObject(object: any, objectType: string) {
    const body = object;
    let url = this.utilsS.hostName() + "/" + objectType + "s/" + object.id;
    return this.http.post<ServerResponse>(url, body, { headers: this.authService.headers })
  }
  deleteObject(object: any, objectType: string) {
    let url = this.utilsS.hostName() + "/" + objectType + "s/" + object.id;
    console.log(url)
    return this.http.delete<ServerResponse>(url, { headers: this.authService.headers })
  }

  async deleteObjectDialog(object: any, objectType: string, route: string) {
    let name = "";
    switch (objectType) {
      case 'user': {
        name = object.uid + " ( " + object.givenName + " " + object.surName + " )";
        break;
      }
      case 'ticket': {
        name = object.title;
        break;
      }
      default: {
        name = object.name;
      }
    }
    const alert = await this.alertController.create({
      header: this.languageS.trans('Confirm!'),
      subHeader: this.languageS.trans('Do you realy want to delete?'),
      message: name,
      buttons: [
        {
          text: this.languageS.trans('Cancel'),
          role: 'cancel',
        }, {
          text: 'OK',
          handler: () => {
            this.requestSent();
            var a = this.deleteObject(object, objectType).subscribe({
              next: (val) => {
                this.responseMessage(val);
                if (val.code == "OK") {
                  this.getAllObject(objectType);
                  if (route != '') {
                    this.router.navigate([route]);
                  }
                }
              },
              error: (err) => {
                this.errorMessage(this.languageS.trans("An error was accoured"));
              },
              complete: () => { a.unsubscribe() }
            })
          }
        }
      ]
    });
    await alert.present();
  }

  async modifyObjectDialog(object: any, objectType: string) {
    let name = "";
    if (objectType == 'user') {
      name = object.uid + " ( " + object.givenName + " " + object.surName + " )";
    } else {
      name = object.name;
    }
    var a = this.modifyObject(object, objectType).subscribe({
      next: (val) => {
        this.responseMessage(val);
        if (val.code == "OK") {
          this.getAllObject(objectType);
        }
      },
      error: (err) => {
        console.log("ERROR: modifyObjectDialog")
        console.log(object)
        console.log(err);
        this.errorMessage(this.languageS.trans("An error was accoured"));
      },
      complete: () => { a.unsubscribe() }
    });
  }

  async errorMessage(message: string) {
    if(!this.authService.settings) return
    const toast = await this.toastController.create({
      position: "middle",
      message: message,
      cssClass: "bar-assertive",
      color: "danger",
      duration: this.authService.settings.errorMessageDuration * 1000,
      buttons: [
        {
          text: "",
          role: "cancel",
          icon: "close",
          handler: () => {
            toast.dismiss();
          }
        }
      ]
    });
    (await toast).present();
  }

  async okMessage(message: string) {
    if(!this.authService.settings) return
    const toast = await this.toastController.create({
      position: "middle",
      message: message,
      cssClass: "bar-assertive",
      color: "success",
      duration: this.authService.settings.okMessageDuration * 1000,
      buttons: [
        {
          text: "",
          role: "cancel",
          icon: "close",
          handler: () => {
            toast.dismiss();
          }
        }
      ]
    });
    (await toast).present();
  }

  async warningMessage(message: string) {
    if(!this.authService.settings) return
    const toast = await this.toastController.create({
      position: "middle",
      message: message,
      cssClass: "bar-assertive",
      color: "warning",
      duration: this.authService.settings.warningMessageDuration * 1000,
      buttons: [
        {
          text: "",
          role: "cancel",
          icon: "close",
          handler: () => {
            toast.dismiss();
          }
        }
      ]
    });
    (await toast).present();
  }

  responseMessage(resp: ServerResponse) {
    if (resp.code == 'OK') {
      return this.okMessage(this.languageS.transResponse(resp));
    } else {
      return this.errorMessage(this.languageS.transResponse(resp));
    }
  }

  selectObject() {
    return this.warningMessage(this.languageS.trans('Please select at last one object!'));
  }
  requestSent() {
    return this.warningMessage(this.languageS.trans('Request was sent. Please be patient!'));
  }
  compareFn(a: string, b: string): boolean {
    return a == b;
  }
  compareObjects(o1: any, o2: any) {
    return o1.id == o2.id;
  }
  sortByName(a: any, b: any) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }
  sortByCreated(a: any, b: any) {
    if (a.created < b.created) {
      return 1;
    }
    if (a.created > b.created) {
      return -1;
    }
    return 0;
  }
  /**
   * Helper script fot the template to detect the type of the variables
   * @param val
   */
  typeOf(key: string, object: any, action: string) {
    let obj = object[key];
    if (key == 'id') {
      return 'numberRO'
    }
    if (key == 'birthDay' || key == 'validity' || key == 'validFrom' || key == 'validUntil') {
      return 'date';
    }
    //if (key == 'reminder' || key == 'created' || key == 'modified') {
    if (key == 'reminder') {
      return 'date-time';
    }
    if (key == 'text' || key == 'domains') {
      return 'text';
    }
    if (typeof obj === 'boolean' && obj) {
      return 'booleanTrue';
    }
    if (typeof obj === 'boolean') {
      return 'booleanFalse';
    }
    if (action == 'modify' && this.hiddenAttributes.indexOf(key) != -1) {
      return 'hidden';
    }
    if (key == 'name' && object.regCode) {
      return 'string';
    }
    if (key.substring(key.length - 2) == 'Id' && this.readOnlyAttributes.indexOf(key) != -1) {
      return 'idPipeRO';
    }
    if (typeof obj == 'number' && action == 'modify' && this.readOnlyAttributes.indexOf(key) != -1) {
      return 'numberRO'
    }
    if (action == 'modify' && this.readOnlyAttributes.indexOf(key) != -1) {
      return 'stringRO';
    }
    if (key.substring(key.length - 2) == 'Id') {
      return 'idPipe';
    }
    if (key.substring(key.length - 3) == 'Ids') {
      return 'idsPipe';
    }
    if (key.substring(key.length - 4) == 'File') {
      return 'file';
    }
    if (this.multivalued.indexOf(key) != -1) {
      return 'multivalued';
    }

    if (typeof obj == 'number') {
      return 'number'
    }
    return 'string';
  }

  convertObject(object: any) {
    //TODO introduce checks
    let output: any = {};
    for (let key in object) {
      if (key == 'birthDay' || key == 'validity' || key == 'created' || key == 'validFrom' || key == 'validUntil' || key == 'modified') {
        console.log(object[key])
        let date = new Date(object[key]);
        output[key] = date.toJSON();
      } else {
        output[key] = object[key];
      }
    }
    return output;
  }

  /*Helper functions for inoic-selectable*/
  formatUsers(users: User[]) {
    return users.map((user) => user.fullName).join(', ');
  }

  formatGroups(groups: Group[]) {
    return groups.map((group) => group.description).join(', ');
  }

  filterObject(objectType: string, filter: string) {
    let rowData = []
    switch (objectType) {
      case "adhocroom": {
        for (let obj of this.allObjects[objectType]) {
          if (
            obj.name.toLowerCase().indexOf(filter) != -1 ||
            obj.description.toLowerCase().indexOf(filter) != -1
          ) {
            rowData.push(obj)
          }
        }
        break
      }
      case "device": {
        for (let dev of this.allObjects[objectType]) {
          if (this.selectedRoom && dev.roomId != this.selectedRoom) {
            continue
          }
          if (
            dev.name.toLowerCase().indexOf(filter) != -1 ||
            dev.ip.indexOf(filter) != -1 ||
            dev.mac.toLowerCase().indexOf(filter) != -1
          ) {
            rowData.push(dev)
          }
        }
        break
      }
      case "education/user":
        {
          for (let obj of this.allObjects[objectType]) {
            if (
              obj.uid.toLowerCase().indexOf(filter) != -1 ||
              obj.givenName.toLowerCase().indexOf(filter) != -1 ||
              obj.surName.toLowerCase().indexOf(filter) != -1
            ) {
              rowData.push(obj)
            }
          }
          break
        }
      case "education/group":
      case "group": {
        for (let obj of this.allObjects[objectType]) {
          if (
            obj.name.toLowerCase().indexOf(filter) != -1 ||
            obj.description.toLowerCase().indexOf(filter) != -1 ||
            this.languageS.trans(obj.groupType).toLowerCase().indexOf(filter) != -1
          ) {
            rowData.push(obj)
          }
        }
        break
      }
      case "institute": {
        for (let obj of this.allObjects[objectType]) {
          if (
            obj.name.toLowerCase().indexOf(filter) != -1 ||
            (obj.regCode && obj.regCode.toLowerCase().indexOf(filter) != -1) ||
            (obj.locality && obj.locality.toLowerCase().indexOf(filter) != -1)
          ) {
            rowData.push(obj)
          }
        }
        break
      }
      case "printer": {
        for (let dev of this.allObjects[objectType]) {
          if (
            dev.name.toLowerCase().indexOf(filter) != -1 ||
            dev.model.indexOf(filter) != -1
          ) {
            rowData.push(dev)
          }
        }
        break
      }
      case "room": {
        for (let obj of this.allObjects[objectType]) {
          if (
            obj.name.toLowerCase().indexOf(filter) != -1 ||
            obj.description.toLowerCase().indexOf(filter) != -1 ||
            this.languageS.trans(obj.roomType).toLowerCase().indexOf(filter) != -1 ||
            this.languageS.trans(obj.roomControl).toLowerCase().indexOf(filter) != -1
          ) {
            rowData.push(obj)
          }
        }
        break
      }
      case "user": {
        for (let obj of this.allObjects[objectType]) {
          if (
            obj.uid.toLowerCase().indexOf(filter) != -1 ||
            obj.givenName.toLowerCase().indexOf(filter) != -1 ||
            obj.surName.toLowerCase().indexOf(filter) != -1 ||
            this.languageS.trans(obj.role).toLowerCase().indexOf(filter) != -1
          ) {
            rowData.push(obj)
          }
        }
        break
      } 
      case "challenge":
        case "challenges/todo": {
          for (let obj of this.allObjects[objectType]) {
            if (
              obj.description.toLowerCase().indexOf(filter) != -1
            ) {
              rowData.push(obj)
            }
          }
          break
        }
      }
      return rowData
    }  
}
