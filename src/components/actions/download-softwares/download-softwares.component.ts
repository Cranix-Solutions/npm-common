import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
//Own stuff
import { SoftwareService } from '../../../services/softwares.service';
import { GenericObjectService } from '../../../services/generic-object.service';
import { Package } from '../../..//models/data-model';
import { ServerResponse } from '../../..//models/server-models';
import { LanguageService } from '../../../services/language.service';
import { AuthenticationService } from '../../../services/auth.service';

@Component({
  selector: 'cranix-download-softwares',
  templateUrl: './download-softwares.component.html',
  styleUrls: ['./download-softwares.component.scss'],
})
export class DownloadSoftwaresComponent implements OnInit {
  selected: Package[] = [];
  title = 'app';
  rowData: Package[] = [];
  disabled: boolean = false;
  constructor(
    public authService: AuthenticationService,
    public objectService: GenericObjectService,
    private softwareService: SoftwareService,
    public modalController: ModalController,
    public toastController: ToastController
  ) {
    this.rowData = this.objectService.packagesAvailable;
  }

  ngOnInit() {
  }

  packagFilterChanged() {
    let filter = (<HTMLInputElement>document.getElementById("packageFilter")).value.toLowerCase();
    let tmp: Package[] = [];
    for( let o of this.objectService.packagesAvailable){
      if(
        o.name.toLowerCase().indexOf(filter) != -1 ||
        o.version.toLowerCase().indexOf(filter) != -1
      ){
        tmp.push(o)
      }
    }
    this.rowData = tmp
  }
  closeWindow() {
    this.modalController.dismiss();
  }

  checkChange(ev: any, o: Package) {
    if (ev.detail.checked) {
      this.selected.push(o)
    } else {
      this.selected = this.selected.filter(obj => (obj.name != o.name && obj.version != o.version))
    }
  }

  async startDownload() {
    if (this.selected.length == 0) {
       this.objectService.selectObject();
      return;
    } else {
      this.disabled = true
      let toDownload: string[] = [];
      for( let p of this.selected ) {
        toDownload.push(p.name);
      }
      this.softwareService.downloadSoftwares(toDownload).subscribe({
        next: (val) =>{
          this.objectService.responseMessage(val);
          if( val.code == "OK") {
            this.closeWindow();
          }
          this.disabled = false
        },
        error: (err) => {
           this.objectService.errorMessage(err)
           this.disabled = false
        },
        complete: () => { }
    })
    }
  }
}
