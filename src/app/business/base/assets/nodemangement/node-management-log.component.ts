import { Component, Input, OnInit } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "./ssm.service";
@Component({
  selector: "app-cloudmatiq-nodemanager-log",
  templateUrl:
    "../../../../presentation/web/base/assets/nodemangement/node-management-log.component.html",
  styles: [],
})
export class NodeManagementLogComponent implements OnInit {
  logsList = [];
  loading = false;
  @Input() region;
  @Input() accountid;
  @Input() refresh;
  totalCount = 0;
  userstoragedata = {} as any;
  constructor(
    private ssmService: SSMService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}
  ngOnChanges(changes) {
    if (
      (changes.refresh && changes.refresh.currentValue) ||
      (changes.region && changes.region.currentValue) ||
      (changes.accountid && changes.accountid.currentValue)
    ) {
      this.getLogsList();
    }
  }
  onPageChange(event) {
    this.getLogsList(5, (event - 1) * 5);
  }
  getLogsList(limit?, offset?) {
    this.loading = true;
    this.logsList = [];
    let query = `?count=${true}&limit=${limit ? limit : 5}&offset=${
      offset ? offset : 0
    }`;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      region: this.region,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.ssmService.all(condition, query).subscribe(
      (result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          this.totalCount = response.data.count;
          this.logsList = _.map(response.data.rows,(itm)=>{
            itm.instances = itm.instances.replace('[','').replace(']','');
            return itm;
          });
        } else {
          this.totalCount = 0;
          this.logsList = [];
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }
}
