import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "app-cloudmatiq-side-bar",
  templateUrl: "./sidebar.component.html",
})
export class SideBarComponent implements OnInit, OnChanges {
  @Input() title: String;
  @Input() isVisible: Boolean;
  @Input() width: Number = 350;
  @Output() dataChanged: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    this.width = this.width;
    if (changes['isVisible']) {
      console.log('Sidebar visibility changed:', this.isVisible);
    }
  }

  changeState() {
    this.dataChanged.next();
  }
}
