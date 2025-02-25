import {
  Component,
  OnInit,
  Input,
} from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { SrmService } from "src/app/business/srm/srm.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-window-list",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/maintenance-window/list/maintwindow-list.component.html",
})
export class WindowListComponent implements OnInit {
  @Input() utilizationDetailConfigs: any;
  screens = [];
  windowList = [] as any;
  current = "dashboard";
  formTitle = "Setup Maintenance Window";
  currentConfigs = {} as any;
  userstoragedata: any = {};
  windowObj: any = {};
  totalCount = null;
  visibleadd: any = false;
  isVisible: any = false;
  appScreens = {} as any;
  buttonText = "Add";
  customerObj: any = {};
  isdownload = false;
  windowTableHeader = [
    { header: "Provider", field: "cloudprovider", datatype: "string", isdefault: true },
    { header: "Window Name", field: "windowname", datatype: "string", isdefault: true },
    { header: "Region", field: "region", datatype: "string", isdefault: true },
    {
      header: "Start Date",
      field: "startdate",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    {
      header: "End Date",
      field: "enddate",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { header: "Duration", field: "duration", datatype: "string",  isdefault: true },
    { header: "Status", field: "status", datatype: "string", isdefault: true },
    { header: "Updated By", field: "lastupdatedby", datatype: "string", isdefault: true },
    {
      header: "Updated On",
      field: "lastupdateddt",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
  ] as any;
  windowTableConfig = {
    refresh: true, //#OP_B628
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    count: 0,
    loading: false,
    columnselection: true,
    pagination: true,
    pageSize: 10,
    title: "",
    scroll: { x: "1300px" },
    tabledownload: false,
    widthConfig: [
      "94px",
      "140px",
      "70px",
      "90px",
      "90px",
      "80px",
      "80px",
      "80px",
      "80px",
    ],
    apisort: true, // #OP_B627
  } as any;
    order = ["lastupdateddt", "desc"]; // #OP_B627
    selectedcolumns = [] as any;
    searchText:string = "";
  constructor(
    private localStorageService: LocalStorageService,
    private srmService: SrmService,
    private message: NzMessageService,
    private router: Router
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.recomentationList();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.MAINTENANCE_WINDOW,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.windowTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.windowTableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.windowTableConfig.tabledownload = true;
    }
    if (this.windowTableHeader && this.windowTableHeader.length > 0) {
      this.selectedcolumns = this.windowTableHeader
    }
    const isdefault = true;
    this.selectedcolumns = this.windowTableHeader.filter((el) => el.isdefault === isdefault);
  }

  ngOnInit() {}

  showModal(data?) {
    this.windowObj = data;
    this.isVisible = true;
    console.log(data);
  }
  notifyEntry(event) {
    this.recomentationList();
    this.isVisible = false;
  }

  onChanged(event) {
    this.isVisible = false;
    console.log(event);
  }
  recomentationList() {
    this.windowTableConfig.loading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      // tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
      //   "tenantid"
      // ],
    };
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
    // let query = `daterange=${true}&order=${this.order ? this.order : ""}`;
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    }
    else{
      query = `daterange=${true}&order=${this.order ? this.order : ""}&count=${true}`;
    }

    if (this.searchText && this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    this.srmService
      .allMaintwindows(condition, query)
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          if (this.isdownload) {
            this.windowTableConfig.loading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Maintainance_window.xlsx"
            );
            this.isdownload = false;
          }
          else{
          this.windowTableConfig.loading = false;
          this.windowList = response.data.rows;
          this.totalCount = response.data.count;
          this.windowTableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
        }} else {
          this.totalCount = 0;
          this.windowTableConfig.loading = false;
          this.windowList = [];
        }
      });
  }
  dataChanged(event) {
    if (event.edit) {
      this.windowObj = event.data;
      this.windowObj.refid = this.windowObj.maintwindowid; 
      this.windowObj.reftype = AppConstant.REFERENCETYPE[21];
      this.isVisible = true;
    }
    if (event.delete) {
      this.deletePrediction(event.data);
    }
    //#OP_B628
    if (event.refresh) {
      this.recomentationList();
    }
     // #OP_B627
     if (event.order) {
      this.order = event.order;
      this.recomentationList();
    }
    if (event.download) {
      this.isdownload = true;
      this.recomentationList();
    }
    if (event.searchText != "") {
      this.searchText = event.searchText;
      if (event.search) {
        this.recomentationList();
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.recomentationList();
    }
  }
  deletePrediction(data) {
    this.windowTableConfig.loading = true;
    this.srmService
      .updateMaintwindow({
        maintwindowid: data.maintwindowid,
        status: AppConstant.STATUS.INACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.windowTableConfig.loading = false;
            this.recomentationList();
            this.message.success(response.message);
          } else {
            this.windowTableConfig.loading = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.windowTableConfig.loading = false;
          this.message.error(AppConstant.VALIDATIONS.DELETEERRMSG);
        }
      );
  }
}
