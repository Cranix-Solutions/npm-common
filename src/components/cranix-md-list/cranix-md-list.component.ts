import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { AuthenticationService } from '../../services/auth.service';
import { ChallengesService } from '../../services/challenges.service';
import { CrxObjectService } from '../../services/crx-object-service';
import { GenericObjectService } from '../../services/generic-object.service';
import { LanguageService } from '../../services/language.service';
import { UtilsService } from '../../services/utils.service';
import { CranixNoticesComponent } from '../cranix-notices/cranix-notices.component'

@Component({
  selector: 'cranix-md-list',
  templateUrl: './cranix-md-list.component.html',
  styleUrls: ['./cranix-md-list.component.scss'],
})
export class CranixMdListComponent implements OnInit {

  min: number = -1;
  step: number = 3;
  max: number = 3;
  rowData = [];
  left1: string = "";
  left2: string = "";
  left3: string = "";
  useNotice: boolean = false;
  @Input() objectType: string = "";
  @Input() context: any = "";
  constructor(
    public authService: AuthenticationService,
    private challengeService: ChallengesService,
    public crxObjectService: CrxObjectService,
    public languageService: LanguageService,
    public objectService: GenericObjectService,
    public utilService: UtilsService,
    private modalController: ModalController
  ) {
    this.utilService.actMdList = this;
    this.useNotice = this.authService.isAllowed('notice.use')
  }

  ngAfterContentInit() {
    console.log(this.objectType)
    this.subjectChanged(null)
    console.log("CranixMdListComponent ngAfterContentInit")
  }

  async ngOnInit() {
    this.objectService.selection = []
    this.objectService.selectedIds = []
    this.initSteps()
    if (!this.min) {
      this.min = -1;
    }
    if (!this.step || this.step < 3) {
      this.step = 3;
    }
    this.left1 = 'name'
    this.left2 = 'description'
    this.left3 = ''
    switch (this.objectType) {
      case "education/user":
      case "user": {
        this.left1 = "uid"
        this.left2 = "surName"
        this.left3 = "givenName"
        break
      }
      case 'device': {
        this.left2 = 'ip'
        break
      }
      case 'institute': {
        this.left2 = "regCode"
        break
      }
      case 'customer': {
        this.left2 = "locality"
        break
      }
    }
    while (!this.objectService.allObjects[this.objectType]) {
      await new Promise(f => setTimeout(f, 1000));
    }
    if (this.objectType == 'device') {
      for (let dev of this.objectService.allObjects[this.objectType]) {
        if (dev.hwconfId == 2) {
          continue
        }
        if (this.objectService.selectedRoom && dev.roomId != this.objectService.selectedRoom) {

        }
        this.rowData.push(dev);
      }
    } else {
      this.rowData = this.objectService.allObjects[this.objectType]
    }
    if (this.max > (this.rowData.length)) {
      this.max = this.rowData.length
    }
  }

  initSteps() {
    this.step = Number(this.authService.settings.lineProPageMD);
    this.min = -1;
    if (!this.step || this.step < 3) {
      this.step = 3;
    }
    this.max = this.min + this.step + 1;
  }

  back() {
    this.min -= this.step;
    if (this.min < -1) {
      this.min = -1
    }
    this.max = this.min + this.step + 1;
    if (this.max > (this.rowData.length)) {
      this.max = this.rowData.length
    }
  }

  forward() {
    this.max += this.step;
    if (this.max < (this.step)) {
      this.max = this.step
    }
    this.min = this.max - this.step - 1;
    if (this.max > (this.rowData.length)) {
      this.max = this.rowData.length
    }
  }

  checkChange(ev, dev) {
    if (ev.detail.checked) {
      this.objectService.selectedIds.push(dev.id)
      this.objectService.selection.push(dev)
    } else {
      this.objectService.selectedIds = this.objectService.selectedIds.filter(id => id != dev.id)
      this.objectService.selection = this.objectService.selection.filter(obj => obj.id != dev.id)
    }
  }

  onQuickFilterChanged() {
    let filter = (<HTMLInputElement>document.getElementById('filterMD')).value.toLowerCase();
    this.min = -1;
    this.max = this.step;
    this.rowData = this.objectService.filterObject(this.objectType,filter)
    if (this.rowData.length < this.step) {
      this.min = -1
      this.max = this.rowData.length
    }
  }

  subjectChanged(event) {
    console.log(event)
    let path = "/" + this.objectType + "s/all";
    //We do not read all challenges only the challenges from the selected
    if (this.objectType == 'challenge' && this.authService.selectedTeachingSubject) {
      path = "/challenges/subjects/" + this.authService.selectedTeachingSubject.id
    }
    this.authService.saveSelectedSubject()
    this.objectService.allObjects[this.objectType] = null
    this.objectService.getSubscribe(path).subscribe(
      (val) => {
        this.rowData = val
        this.objectService.allObjects[this.objectType] = val
        this.objectService.selection = []
        this.objectService.selectedIds = [];
        this.initSteps()
      }
    )
    if (this.context.componentParent.subjectChanged && this.authService.selectedTeachingSubject) {
      this.context.componentParent.subjectChanged(this.authService.selectedTeachingSubject.id)
    }
  }

  getCephalixChallenges() {
    if(!this.authService.selectedTeachingSubject){
      this.objectService.warningMessage(this.languageService.trans("Select one teaching subject"))
      return
    }

    this.objectService.warningMessage(
      this.languageService.trans("Check all questions and answers for accuracy! We do not guarantee that the solutions are correct.")
    )
    this.challengeService.getChallengesFromCephalix(this.authService.selectedTeachingSubject).subscribe({
      next: (val) => {
        this.rowData = val
        console.log(this.rowData)
      },
      error: (error) => { this.objectService.errorMessage(error)}
    })
  }

  async openNotice(object){
    const  modal = await this.modalController.create({
      component: CranixNoticesComponent,
      componentProps: {
        selectedObject: object,
        objectType: this.objectType
      },
      cssClass: 'big-modal'
    })
    modal.present();
  }
}
