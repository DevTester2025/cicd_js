import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";

@Component({
  selector: "app-filters",
  templateUrl: "./filters.component.html",
  styleUrls: ["./filters.component.css"],
})
export class FiltersComponent implements OnInit {
  @Input() filterableValues = [];
  @Input() existValues = [];
  @Input() filterKey = "";
  @Input() filterValue = "";
  @Output() getFilterValue: EventEmitter<any> = new EventEmitter();
  @Output() setFilterValue: EventEmitter<any> = new EventEmitter();
  filterSearchModel: any = "";
  loading: any = false;
  selectedValues = {};
  filteredValues: any = [];

  constructor() { }

  ngOnInit() {
    // this.existValues = []; //#OP_768
    if (this.existValues && this.existValues.length > 0) {
      this.existValues.forEach((el) => {
        this.selectedValues[el] = true;
      });
    }
    this.filteredValues = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filterableValues && changes.filterableValues.currentValue) {
      this.filterableValues = changes.filterableValues.currentValue;
    }
    if (changes.filterKey && changes.filterKey.currentValue) {
      this.filterKey = changes.filterKey.currentValue;
    }
  }
  filterDrawerClose() {
    this.setFilterValue.next(this.filteredValues);
    this.filteredValues = [];
  }
  valueSelected(index) {
    let event = this.filterableValues[index];

    this.filteredValues = [];
    _.map(this.selectedValues, (value, key) => {
      if (value == true) {
        if (this.filterValue != '') {
          let obj = _.find(this.filterableValues, (itm) => {
            if (itm[this.filterKey] == key) {
              return itm;
            }
          });
          if (obj) {
            this.filteredValues.push(obj[this.filterValue]);
          }
        } else {
          this.filteredValues.push(key);
        }
      }
    });

    // if (this.filteredValues) {
    //   let isExist = this.filteredValues.findIndex((el) => {
    //     return el == event[this.filterKey];
    //   });
    //   if (isExist != -1) {
    //     this.filteredValues = this.filteredValues.splice(0, index);
    //     return false;
    //   }
    // }
    // this.filteredValues.push(event[this.filterKey]);
  }
  getFieldValues() {
    this.getFilterValue.next(this.filterSearchModel.toLowerCase());
  }
}
