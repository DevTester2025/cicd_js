import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { ServerUtilsService } from "src/app/business/base/server-utildetails/services/server-utils.service";
import * as _ from "lodash";
import * as moment from "moment";

import { CommonService } from "src/app/modules/services/shared/common.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-server-utils-main-chart",
  templateUrl:
    "../../../presentation/web/base/server-utils/utils-main-chart.component.html",
})
export class ServerUtilsMainChartComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  screens = [];
  appScreens = {} as any;
  userstoragedata: any = {};
  current = "CPU";
  avgValue = "0.00";
  filters = {
    daterange: [moment().subtract(30, "days").toDate(), new Date()],
    provider: "ECL2",
    customerid: -1,
    instanceid: -1,
    utilkey: "CPU_UTIL",
  } as any;
  providerList: any = [];
  customerList: any = [];
  serverList: any = [];
  chartDataList: any = [];
  utilkeyList: any = [
    {
      label: "Utilization(%)",
      value: "CPU_UTIL",
    },
    {
      label: "Speed(GHz)",
      value: "CPU_SPEED",
    },
  ];
  utilkeyTitle = "Utilization (%)" as any;

  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];

  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private messageService: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private serverUtilsService: ServerUtilsService
  ) {
    console.log("Subtracted date format::::::::::::::");
    console.log(moment().subtract(30, "days").toDate());
  }
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}
  ngOnInit() {
    //this.drawChart();
  }
}
