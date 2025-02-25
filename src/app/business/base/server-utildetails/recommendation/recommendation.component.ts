import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  Input,
} from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ServerUtilsService } from "src/app/business/base/server-utildetails/services/server-utils.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "src/app/modules/services/shared/common.service";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-recommendation",
  templateUrl:
    "../../../../presentation/web/base/server-utildetails/recommendation/recommendation.component.html",
})
export class RecommendationComponent implements OnInit {
  @Input() utilizationDetailConfigs: any;
  screens = [];
  current = "dashboard";
  currentConfigs = {} as any;
  userstoragedata: any = {};
  serverObj: any = {};
  customerObj: any = {};
  filters = {
    daterange: [new Date(), new Date()],
    provider: "ECL2",
    customerid: -1,
    instanceid: -1,
    utilkey: "CPU_UTIL",
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private serverUtilsService: ServerUtilsService,
    private messageService: NzMessageService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.currentConfigs = this.serverUtilsService.getItems();
    if (this.currentConfigs) {
      this.getServer(this.currentConfigs.instanceid);
      this.getCustomer(this.currentConfigs.customerid);
      this.utilizationDetailConfigs = {
        utiltype: this.currentConfigs.utiltype,
        utilkey: this.currentConfigs.utilkey,
        instanceid: this.currentConfigs.instanceid,
        date: this.currentConfigs.date,
        tenantid: this.currentConfigs.tenantid,
        utilkeyTitle: this.currentConfigs.utilkeyTitle,
      };
    }
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}

  changeView(to: string) {
    this.current = to;
  }
  closeWindow() {
    this.router.navigate(["/serverutils"], {
      queryParams: {
        detailes: true,
      },
    });
  }

  getServer(id) {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      instanceid: id,
    };
    this.commonService.allInstances(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.serverObj = response.data[0];
      } else {
        this.serverObj = {};
      }
    });
  }
  getCustomer(id) {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      customerid: id,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerObj = response.data[0];
      } else {
        this.customerObj = {};
      }
    });
  }

  onChange(result: Date[]): void {
    if (result.length > 0) {
      let d1 = result[0];
      let d2 = result[1];
      if (moment(d2).diff(d1, "days") > 31) {
        this.messageService.info("Maximum allowed range 31 Days");
        this.filters.daterange = [
          moment().subtract(31, "days").toDate(),
          new Date(),
        ];
      }
    }
  }
}
