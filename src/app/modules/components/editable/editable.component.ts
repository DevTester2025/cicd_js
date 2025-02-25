import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-cloudmatiq-editable-text",
  styles: [],
  templateUrl: "./editable.component.html",
})
export class EditableTextComponent implements OnInit {
  @Input()
  text: string;

  @Output()
  textChange = new EventEmitter<string>();

  editMode: boolean = false;

  constructor() {}
  ngOnInit() {}
}
