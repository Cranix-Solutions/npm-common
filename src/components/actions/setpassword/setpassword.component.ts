import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SystemService } from '../../../services/system.service';

@Component({
  selector: 'cranix-setpassword',
  templateUrl: './setpassword.component.html',
  styleUrls: ['./setpassword.component.scss'],
})
export class SetpasswordComponent implements OnInit {

  setPassword = {
    mustChange: true,
    password: "",
    password2:""
  }

  @Input() type: string = "";
  constructor(
    public modalController: ModalController,
    public systemService: SystemService
  ) {
    console.log('type is:', this.type);
    this.systemService.getSystemConfigValue("DEFAULT_MUST_CHANGE").subscribe(
      (val) => {
        console.log(val)
        if( val == "no"){
        this.setPassword.mustChange = false
      }}
    )
  }

  ngOnInit() {
  }

  onSubmit() {
    this.modalController.dismiss(this.setPassword);
  }

}
