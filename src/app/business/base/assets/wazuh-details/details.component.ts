import * as _ from "lodash";
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, } from "@angular/core";

@Component({
  selector: "app-details",
  templateUrl:
    "./details.component.html",
})
export class AppDetailsComponent implements OnInit, OnChanges {
  @Input() dataObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  loading = false;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.dataObj) &&
      !_.isEmpty(changes.dataObj.currentValue)
    ) {
      this.dataObj = changes.dataObj.currentValue;
      this.loading = true;
      Object.keys(this.dataObj).forEach(
        (key) => {
          if (typeof (this.dataObj[key]) == "object") {
            this.dataObj[key] = JSON.stringify(this.dataObj[key]);
          }
        }
      );
      this.loading = false;
    }
  }
}