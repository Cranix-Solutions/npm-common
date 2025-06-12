import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GenericObjectService } from '../../../services/generic-object.service';
import { SystemService } from '../../../services/system.service';
import { SupportRequest } from '../../../models/data-model'


@Component({
  selector: 'create-support-page',
  templateUrl: 'create-support.html'
})
export class CreateSupport implements OnInit {

  disabled: boolean = false;
  files: any[] = [];
  @Input() support: SupportRequest = new SupportRequest()
  constructor(
    public modalController: ModalController,
    public systemService: SystemService,
    public objectService: GenericObjectService
  ) { }

  ngOnInit() { }
  onFilesAdded(event: any) {
    this.files = event.target.files;
  }

  addAttachment() {
    console.log("addP")
    for (let file of this.files) {
      this.support.attachmentName = file.name;
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target && e.target.result) {
          let index = e.target.result.toString().indexOf("base64,") + 7;
          this.support.attachment = e.target.result.toString().substring(index);
        }
      }
      fileReader.readAsDataURL(file);
    }
  }
  onSubmit() {
    console.log(this.support)
    this.systemService.createSupportRequest(this.support).subscribe(
      (val) => {
        this.objectService.responseMessage(val);
        this.modalController.dismiss("OK")
      }
    )
  };
}
