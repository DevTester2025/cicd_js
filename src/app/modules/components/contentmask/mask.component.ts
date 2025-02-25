import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-cloudmatiq-mask-text",
  styles: [],
  templateUrl: "./mask.component.html",
})
export class MaskTextComponent implements OnInit {
  @Input() maskable: boolean | number;

  hidden: boolean = true;

  constructor() {}
  ngOnInit() {
    if (this.maskable == false) {
      this.hidden = false;
    }
  }
}
