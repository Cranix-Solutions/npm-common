import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { AlertController } from '@ionic/angular';
//Own stuff
import { userMenu, groupMenu, roomMenu, deviceMenu, instituteMenu, hwconfMenu, ticketMenu, printerMenu, studentMenu, eduRoomMenu, crx2faMenu } from './objects.menus';
import { CrxActionMap, ServerResponse } from '../../models/server-models';
import { LanguageService } from '../../services/language.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UtilsService } from '../../services/utils.service';
import { AuthenticationService } from '../../services/auth.service';
import { GenericObjectService } from '../../services/generic-object.service';
import { SetpasswordComponent } from './setpassword/setpassword.component';
import { SetquotaComponent } from './setquota/setquota.component'
import { FilesUploadComponent } from './files-upload/files-upload.component';
import { FilesCollectComponent } from './files-collect/files-collect.component';
import { SetContractComponent } from './set-contract/set-contract.component';
import { SetValidityComponent } from './set-validity/set-validity.component';


@Component({
  selector: 'cranix-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit {
  columns: string[] = [];
  count: number = 0;
  menu: any[] = [];

  commonMenu: any[] = [{
    "name": "CSV Export",
    "icon": "download-outline",
    "action": "csv-export",
    "color": "secondary",
    "enabled": true
  }]

  commonLastMenu: any[] = [{
    "name": "Delete",
    "enabled": true,
    "icon": "trash",
    "color": "danger",
    "action": "delete"
  }]

  token?: string;
  hostname: string;
  headers: HttpHeaders;

  @Input() objectType: string = ""
  @Input() objectIds: number[] = []
  @Input() gridApi: any
  constructor(
    public alertController: AlertController,
    public modalController: ModalController,
    private popoverController: PopoverController,
    public translateService: TranslateService,
    private languageService: LanguageService,
    public objectService: GenericObjectService,
    private http: HttpClient,
    private utilsS: UtilsService,
    private authS: AuthenticationService) {
    this.hostname = this.utilsS.hostName();
    this.token = this.authS.getToken();
    this.headers = new HttpHeaders({
      'Content-Type': "application/json",
      'Accept': "application/json",
      'Authorization': "Bearer " + this.token
    });
  }

  ngOnInit() {
    console.log("ActionsComponent")
    if (this.objectIds) {
      this.count = this.objectIds.length;
    } else {
      this.count = this.objectService.selection.length;
    }
    if (this.objectType == "user") {
      this.menu = this.commonMenu.concat(userMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "2fa") {
      this.menu = this.commonMenu.concat(crx2faMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "education/user" || this.objectType == "education/group") {
      this.menu = this.commonMenu.concat(studentMenu);
    } else if (this.objectType == "group") {
      this.menu = this.commonMenu.concat(groupMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "room") {
      this.menu = this.commonMenu.concat(roomMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "device") {
      this.menu = this.commonMenu.concat(deviceMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "institute") {
      this.menu = this.commonMenu.concat(instituteMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "ticket") {
      this.menu = this.commonMenu.concat(ticketMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "hwconf") {
      this.menu = this.commonMenu.concat(hwconfMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "printer") {
      this.menu = this.commonMenu.concat(printerMenu).concat(this.commonLastMenu);
    } else if (this.objectType == "education/room" || this.objectType == "education/device") {
      this.menu = eduRoomMenu;
    } else {
      this.menu = this.commonLastMenu;
    }
    console.log(this.menu);
  }

  ngOnDestroy(){
    if( this.gridApi ) {
      this.gridApi.deselectAll();
    }
  }
  adaptMenu() {
    /*
    * TODO Remove menu points based on acls.
    */
    for (let m of this.menu) {

    }
  }
  closePopover() {
    this.popoverController.dismiss();
  }

  async messages(ev: string) {
    console.log(ev);
    let actionMap = new CrxActionMap;
    actionMap.name = ev;
    actionMap.objectIds = this.objectIds;
    switch (ev) {
      case 'csv-export': {
        let header: string[] = [];
        new AngularCsv(this.objectService.selection, this.objectType, { showLabels: true, headers: Object.getOwnPropertyNames(this.objectService.selection[0]) });
        this.popoverController.dismiss();
        break;
      }
      case 'upload': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: FilesUploadComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true,
          componentProps: {
            objectType: this.objectType,
            actionMap: actionMap
          }
        });
        (await modal).present();
        break;
      }
      case 'collect': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: FilesCollectComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true,
          componentProps: {
            objectType: this.objectType,
            actionMap: actionMap
          }
        });
        (await modal).present();
        break;
      }
      case 'setPassword': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: SetpasswordComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true
        });
        modal.onDidDismiss().then((dataReturned) => {
          this.authS.log(dataReturned.data)
          if (dataReturned.data) {
            actionMap.stringValue = dataReturned.data.password;
            actionMap.booleanValue = dataReturned.data.mustChange;
            this.executeAction(actionMap);
          }
        });
        (await modal).present();
        break;
      }
      case 'setMailsystemQuota': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: SetquotaComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true,
          componentProps: { type: 'mail' }
        });
        modal.onDidDismiss().then((dataReturned) => {
          this.authS.log(dataReturned.data)
          if (dataReturned.data) {
            actionMap.longValue = dataReturned.data;
            this.executeAction(actionMap);
          }
        });
        (await modal).present();
        break;
      }
      case 'setFilesystemQuota': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: SetquotaComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true,
          componentProps: {type: 'file' }
        });
        modal.onDidDismiss().then((dataReturned) => {
          this.authS.log(dataReturned.data)
          if (dataReturned.data) {
            actionMap.longValue = dataReturned.data;
            this.executeAction(actionMap);
          }
        });
        (await modal).present();
        break;
      }
      case 'setContract': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: SetContractComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true,
          componentProps: { objectIds: this.objectIds }
        });
        (await modal).present();
        break;
      }
      case 'setValidity': {
        this.popoverController.dismiss();
        const modal = await this.modalController.create({
          component: SetValidityComponent,
          cssClass: 'small-modal',
          animated: true,
          showBackdrop: true,
          componentProps: { objectIds: this.objectIds }
        });
        (await modal).present();
        break;
      }
      default: {
        const alert = await this.alertController.create({
          header: this.languageService.trans(ev),
          message: this.languageService.trans("Count of selected objects: ") + actionMap.objectIds.length,
          buttons: [
            {
              text: this.languageService.trans('Cancel'),
              role: 'cancel',
              cssClass: 'secondary',
              handler: (blah) => {
                console.log('Confirm Cancel: blah');
              }
            }, {
              text: this.languageService.trans('OK'),
              handler: () => {
                this.executeAction(actionMap);
                console.log('Confirm Okay');
              }
            }
          ]
        });
        alert.onDidDismiss().then(() => this.popoverController.dismiss());
        await alert.present();
        break;
      }
    }
  }

  async executeAction(actionMap: CrxActionMap) {
    this.objectService.requestSent();
    let url = this.hostname + "/" + this.objectType + "s/applyAction"
    console.log("Execute Action")
    console.log(url)
    console.log(actionMap)
    const val: any = await this.http.post<ServerResponse[]>(url, actionMap, { headers: this.headers }).toPromise();
    let response = this.languageService.trans("List of the results:");
    for (let resp of val) {
      response = response + "<br>" + this.languageService.transResponse(resp);
    }
    if (actionMap.name == 'delete') {
      this.objectService.getAllObject(this.objectType);
    }
    this.objectService.okMessage(response)
  }
}

