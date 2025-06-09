import { Component, Input, OnInit, Output, EventEmitter, forwardRef } from '@angular/core';
import { GenericObjectService } from '../../services/generic-object.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cranix-search',
  templateUrl: './cranix-search.component.html',
  styleUrl: './cranix-search.component.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CranixSearchComponent),
    multi: true
  }]
})
export class CranixSearchComponent implements ControlValueAccessor, OnInit {
  isCranixSearchModalOpen: boolean = false;
  rowData = []
  selection: any|any[]

  @Output() callback = new EventEmitter<any>();
  @Output() onChange: EventEmitter<{ value: any }> = new EventEmitter();
  @Input({ required: true }) objectType: string
  @Input() context
  @Input() items: any[]
  @Input() itemTextField: string|string[]
  @Input() multiple: boolean
  @Input() emptyLabel: string
  @Input() selectedLabel: string
  constructor(
    private objectService: GenericObjectService
  ) { }

  ngOnInit(): void {
    console.log("CranixSearchComponent")
    if (typeof this.items == "undefined") {
      this.items = this.objectService.allObjects[this.objectType]
    }
    if (typeof this.multiple == "undefined") {
      this.multiple = false;
    }
    if (typeof this.itemTextField == "undefined") {
      this.itemTextField = ["name"];
    }else if( typeof this.itemTextField  == "string") {
      this.itemTextField = [this.itemTextField]
    }
    if( typeof this.emptyLabel == "undefined"){
      this.emptyLabel = 'Select ' + this.objectType
    }
    if( typeof this.selectedLabel == "undefined"){
      this.selectedLabel = this.objectType + ' selected.'
    }
    if (this.multiple) {
      this.selection = []
    }
    this.rowData = this.items
  }

  private propagateOnChange = (_: any) => { };
  private propagateOnTouched = () => { };

  writeValue(value: any) {
    console.log("write value called")
    console.log(value)
    this.selection = value;
  }
  registerOnChange(method: any): void {
    this.propagateOnChange = method;
  }
  registerOnTouched(method: () => void) {
    this.propagateOnTouched = method;
  }
  openModal() {
    this.isCranixSearchModalOpen = true
  }
  closeModal(modal){
    modal.dismiss();
    this.isCranixSearchModalOpen = false
  }
  isSelected(id: number) {
    if (this.selection) {
      return this.selection.filter(o => o.id == id).length == 1
    }
    return false;
  }
  clearSelection(modal){
    if(this.multiple){
      this.selection = []
    }else{
      this.selection = null
    }
    this.propagateOnChange(this.selection);
    if(!this.multiple){
      this.closeModal(modal)
    }
  }
  select(o: any, modal) {
    console.log(o)
    this.selection = o;
    this.propagateOnChange(this.selection);
    if(this.callback){
      this.callback.emit();
    }
    this.onChange.emit({value: this.selection})
    this.closeModal(modal)
  }
  doSelect(o: any) {
    if(this.selection.filter(obj => obj.id == o.id).length == 1){
      this.selection = this.selection.filter(obj => obj.id != o.id)
    } else {
      this.selection.push(o)
    }
    console.log(this.selection)
  }
  returnValues(modal){
    this.propagateOnChange(this.selection);
    this.isCranixSearchModalOpen = false
    if(this.callback){
      this.callback.emit();
    }
    this.onChange.emit({value: this.selection})
    this.closeModal(modal)
  }
  onQuickFilterChanged() {
    let filter = (<HTMLInputElement>document.getElementById('crxSearchFilter')).value.toLowerCase();
    let tmp = []
    for (let o of this.items) {
      //TODO split filter also
      for( let field of this.itemTextField){
        if (o[field] && o[field].indexOf(filter) > -1) {
          tmp.push(o)
          break;
        }
      }
    }
    this.rowData = tmp;
  }
   _emitValueChange() {
    this.propagateOnChange(this.selection);

    this.onChange.emit({
      value: this.selection
    });
  }
}
