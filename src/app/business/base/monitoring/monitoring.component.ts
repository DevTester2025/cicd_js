import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
} from "@angular/core";
import { shuffle } from "lodash";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-monitoring",
  templateUrl: "../../../presentation/web/base/monitoring.component.html",
  styles: ["./monitoring.component.css"],
})
export class MonitoringComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  filters = { asset: null } as any;
  zoneList = [];
  customersList = [];
  userstoragedata = {} as any;

  logs = [];
  tableHeader = [
    { field: "instancerefid", header: "Instance Id", datatype: "string" },
    { field: "instancename", header: "Instance Name", datatype: "string" },
    { field: "instancetyperefid", header: "Asset Plan", datatype: "string" },
    { field: "region", header: "Zone", datatype: "string" },
    // { field: 'cloudprovider', header: 'Cloud Provider', datatype: 'string' },
    { field: "cpu", header: "CPU (%)", datatype: "string" },
    { field: "memory", header: "Memory (%)", datatype: "string" },
    { field: "customer", header: "Customer", datatype: "string" },
    { field: "cost", header: "Monthly Cost", datatype: "string" },
    { field: "bill", header: "Current billing", datatype: "string" },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    manualsorting: false,
    sortbyList: [],
    view: true,
    chart: true,
    loading: false,
    pagination: true,
    rightsize: true,
    frontpagination: false,
    manualpagination: false,
    selection: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  totalCount = 0;

  constructor(
    private httpHandler: HttpHandlerService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}

  ngOnInit() {
    this.createData();
    this.getZone();
    this.getAllCustomers();
  }

  getZone() {
    this.zoneList = [];
    let url =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES;
    if (this.filters.provider === "ECL2") {
      url =
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES;
    }
    if (this.filters.provider === "AWS") {
      url =
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES;
    }
    this.httpHandler
      .POST(url, {
        status: "Active",
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.zoneList = response.data;
          } else {
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getAllCustomers() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.httpHandler
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL,
        cndtn
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.customersList = response.data;
        } else {
          this.customersList = [];
        }
      });
  }

  tableEvent(event) {
    console.log(event);
  }

  createData() {
    for (let index = 0; index < 50; index++) {
      this.logs.push({
        instancerefid: `${Math.floor(Math.random() * 10000) + 5000}-${
          Math.floor(Math.random() * 100000) + 50000
        }`,
        instancename: shuffle([
          "tms-ee-12",
          "tms-ee-011",
          "tms-ee-010",
          "tms-ee-09",
          "tms-ee-08",
          "tms-ee-07",
          "tms-ee-06",
          "tms-ee-05",
          "tms-ee-04",
          "tms-ee-03",
          "tms-ee-02",
          "tms-ee-01",
        ])[0],
        rightsizeyn: "Y",
        instancetyperefid: shuffle([
          "4CPU-8GB",
          "4CPU-8GB",
          "8CPU-16GB",
          "8CPU-16GB",
          "4CPU-8GB",
          "4CPU-8GB",
          "8CPU-16GB",
          "4CPU-8GB",
          "4CPU-8GB",
          "4CPU-8GB",
          "4CPU-8GB",
        ])[0],
        region: shuffle(["us1", "jp5", "eu-central-1", "us-west-2"])[0],
        cloudprovider: shuffle(["AWS", "ECL2"])[0],
        cpu: Math.floor(Math.random() * 100) + 0,
        memory: Math.floor(Math.random() * 100) + 0,
        customer: shuffle([
          "SDL-US1-TMS",
          "SDL-US1-TMS-01",
          "Csdm_dev",
          "SDL-US1-GroupShare",
          "SDL-US1-MultiTrans",
          "SDL-AWS-TMS",
          "SDL-AWS",
          "SDL-US-EAST",
          "AWS_TNT",
          "AWS-Oregon",
        ])[0],
        cost: "$ " + Math.floor(Math.random() * 1000) + 10,
        bill: "$ " + Math.floor(Math.random() * 1000) + 250,
      });
    }
  }
}
