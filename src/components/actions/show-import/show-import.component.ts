import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
//Own stuff
import { UsersImport } from '../../../models/data-model';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'cranix-show-import',
  templateUrl: './show-import.component.html',
  styleUrls: ['./show-import.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ShowImportComponent implements OnInit {

  alive: boolean = false; 
  @Input() import: UsersImport = new UsersImport();
  constructor(
    public alertController: AlertController,
    private modalController: ModalController,
    public translateService: TranslateService,
    private usersService: UsersService,
  ) {
  }

  ngOnInit() {
    this.alive = true
  }

  ngAfterViewInit() {
      interval(5000).pipe(takeWhile(() => this.alive)).subscribe((func => {
        this.usersService.getUserImport(this.import.startTime).subscribe(
          val => {
            console.log(val)
            this.import = val}
        )
      }))
  }

  ngOnDestroy() {
    this.alive = false
  }

  closeWindow(){
    this.modalController.dismiss();;
  }
}
