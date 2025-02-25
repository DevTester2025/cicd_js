import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CustomerAccountService } from "../../tenants/customers/customer-account.service";
import { TagService } from "../tagmanager/tags.service";
import { TagValueService } from "../tagmanager/tagvalue.service";
import * as _ from "lodash";
import { Router } from "@angular/router";
import * as Papa from "papaparse";

interface InstanceMetrics {
  cpu: number;
  disk: number;
  memory: number;
  instancename: string;
  networkid: null;
  instancerefid: string;
  instanceid: number;
  platform: string;
  promagentstat: string;
  customerid: number;
  accountid: number;
}

@Component({
  selector: "app-monitoring-summary",
  templateUrl: "../../../presentation/web/base/monit-summary.component.html",
})
export class MonitoringSummaryComponent implements OnInit {
  filters = { asset: null } as any;
  viewServerDetail = false;

  customersList = [];
  accountsList = [];
  tagList = [];
  selectedTag = {} as any;

  userstoragedata = {} as any;
  loading = false;
  model = {
    customer: null,
    account: null,
    tag: null,
    tagvalue: null,
    search: null,
    cpu_range: [0, 100],
    memory_range: [0, 100],
    disk_range: [0, 100],
  };
  serverDetail = null;

  metrics = [];
  tableHeader = [
    { field: "instancerefid", header: "Instance Id", datatype: "string" },
    { field: "instancename", header: "Instance Name", datatype: "string" },
    { field: "cloudprovider", header: "Cloud Provider", datatype: "string" },
    { field: "cpu", header: "CPU (%)", datatype: "string" },
    { field: "memory", header: "Memory (%)", datatype: "string" },
    { field: "disk", header: "Disk (%)", datatype: "string" },
    { field: "customer", header: "Customer", datatype: "string" },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    manualsearch: false,
    manualsorting: false,
    sortbyList: [],
    view: true,
    chart: true,
    loading: false,
    pagination: true,
    rightsize: true,
    frontpagination: true,
    manualpagination: true,
    selection: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  pageLimit = 100;
  currentPage = 1;
  totalCount = 0;
  //#OP_T620
  screens = [];
  appScreens = {} as any;
  download = false;
  rolename: any;

  constructor(
    private httpHandler: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private router: Router,
    private customerAccService: CustomerAccountService,
    private tagValueService: TagValueService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    //#OP_T620
    this.rolename = this.userstoragedata.roles.rolename;
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.TACTICAL_OVERVIEW,
    });
    if (_.includes(this.appScreens.actions, "Download")) {
      this.download = true;
    }
  }

  ngOnInit() {
    this.getAllCustomers();
    this.getAllAccountsList();
    this.getAllTags();
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

  getAllAccountsList(customerid?) {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    if (customerid) {
      reqObj[customerid] = customerid;
    }
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountsList = response.data;
      } else {
        this.accountsList = [];
      }
    });
  }

  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }

  tagChanged(e) {
    let tag = this.tagList.find((o) => o["tagid"] == e);
    let tagClone = _.cloneDeep(tag);

    this.filters.tagvalue = null;

    if (tagClone.tagtype == "list") {
      tagClone.lookupvalues = tagClone.lookupvalues.split(",");
    } else if (
      tagClone.tagtype == "range" &&
      typeof tagClone.lookupvalues == "string"
    ) {
      tagClone.min = tagClone.lookupvalues.split(",")[0];
      tagClone.min = tagClone.lookupvalues.split(",")[1];
    }

    this.selectedTag = _.cloneDeep(tagClone);
  }

  tableEvent(e) {
    console.log("Table change event");
    console.log(e);
  }

  checkIsBetween(value: number, range: number[]): boolean {
    var min = Math.min.apply(Math, [range[0], range[1]]),
      max = Math.max.apply(Math, [range[0], range[1]]);

    return value > min && value < max;
  }

  getMetrics() {
    let filters = {
      tenantid: this.userstoragedata.tenantid,
      ...this.model,
      cpu_range: [0, 100],
      memory_range: [0, 100],
      disk_range: [0, 100],
    };
    let f = {};

    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        const value = filters[key];
        if (value) {
          f[key] = value;
        }
      }
    }

    this.loading = true;
    this.metrics = [];

    let url =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.BASE.MONITORING.SUMMARY +
      `?limit=${this.pageLimit}`;

    if (this.currentPage > 1) {
      url += `&offset=${this.pageLimit * (this.currentPage - 1)}`;
    }

    // if (this.model.search) {
    //   url += `&search=${this.model.search}`;
    // }

    this.httpHandler.POST(url, f).subscribe(
      (result) => {
        this.loading = false;

        let response = JSON.parse(result._body);

        const metrics = (response as InstanceMetrics[]).map((i) => {
          i["cpu"] = Math.round(parseFloat(i["cpu"] as any));
          i["disk"] = Math.round(parseFloat(i["disk"] as any));
          i["memory"] = Math.round(parseFloat(i["memory"] as any));
          i["uptime"] = i["uptime"]
            ? parseInt((Math.round(i["uptime"] as any) / 86400).toString())
            : null;
            if(i['up'] && i['up'] == 1){
              i['up'] = 'UP';
            }
          return i;
        });

        // console.log(
        //   "Metrics list >>>>>>>>>>>>>>>>>>>>>> with filters applied."
        // );
        // console.log(
        //   metrics.filter((m) => {
        //     if (
        //       this.checkIsBetween(m.cpu, this.model.cpu_range) &&
        //       this.checkIsBetween(m.memory, this.model.memory_range) &&
        //       this.checkIsBetween(m.disk, this.model.disk_range)
        //     ) {
        //       return m;
        //     }
        //   })
        // );

        // this.metrics = metrics.filter((m) => {
        //   if (
        //     this.checkIsBetween(m.cpu, this.model.cpu_range) &&
        //     this.checkIsBetween(m.memory, this.model.memory_range) &&
        //     this.checkIsBetween(m.disk, this.model.disk_range)
        //   ) {
        //     return m;
        //   }
        // });
        this.metrics = metrics;
        this.totalCount = 10;
      },
      (err) => {
        this.loading = false;

        console.log("Error getting metrics");
        console.log(err);
      }
    );
  }

  downloadCSV() {
    console.log("To download csv .>>>>");
    var csv = Papa.unparse([
      [
        "Instance Name",
        "Instance Id",
        "Cloud Provider",
        "CPU (%)",
        "Memory (%)",
        "Disk (%)",
        "Uptime",
        "Alerts (Last 24 hours)",
      ],
      ...this.metrics.map((m) => {
        return [
          m.instancename,
          m.instancerefid,
          m.cloudprovider,
          m.cpu,
          m.memory,
          m.disk,
          m.uptime,
          m.events_count,
        ];
      }),
    ]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }

  routeToEventLogs(ref: string) {
    this.router.navigate(["eventlog"], {
      queryParams: { module: "Alert Config", ref },
    });
  }
}
