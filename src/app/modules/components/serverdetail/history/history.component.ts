import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from "@angular/core";
import * as _ from "lodash";
import { EventLogService } from "src/app/business/base/eventlog/eventlog.service";

@Component({
  selector: "app-cloudmatiq-history",
  styles: [],
  templateUrl: "./history.component.html",
})
export class HistoryComponent implements OnInit, OnChanges {
  @Input() assetData: any;
  @Input() vmaction: any;
  @Input() refresh: boolean;
  historyRecords = [];
  loading = false;
  constructor(private eventlogService: EventLogService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.vmaction && changes.vmaction.currentValue) {
      this.vmaction = changes.vmaction.currentValue;
    }
    if (changes && changes.refresh && changes.refresh.currentValue) {
      this.getLogs();
    }
  }
  ngOnInit() {
    this.getLogs();
  }
  getLogs() {
    this.loading = true;
    let reqObj = {
      tenantid: this.assetData.tenantid,
      providerrefid: this.assetData.instancerefid,
      eventtype: "VM_" + this.vmaction.toUpperCase(),
    };
    this.eventlogService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.loading = false;
      if (response.status) {
        this.historyRecords = response.data;
      } else {
        this.historyRecords = [];
      }
    });
  }
}
