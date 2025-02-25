import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { TenantsService } from "../tenants.service";
import * as _ from "lodash";
import { KPIReportingService } from "../kpireporting/kpireporting.service";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-kpireporting",
  templateUrl:
    "../../../presentation/web/tenant/kpireporting/kpireporting.component.html",
})
export class KpireportingComponent implements OnInit {
  loading = false;
  visibleadd = false;
  userstoragedata: any;
  screens: any;
  appScreens: any = {};
  tableHeader = [
    {
      field: "title",
      header: "Report Title",
      datatype: "string",
      isdefault: true,
    },
    { field: "description", header: "Description", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];

  tableconfig = {
    refresh: true,
    edit: false,
    delete: false,
    showasset: false,
    manualsearch: true,
    globalsearch: true,
    columnselection: true,
    pagination: false,
    manualpagination: true,
    loading: false,
    pageSize: 10,
    count: null,
    apisort: true, // #OP_B627
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px"],
    tabledownload: false,
  };
  globalSearchModel = "";

  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  isdownload = false;
  kpireportingList = [];
  selectedcolumns = [] as any;

  order = ["lastupdateddt", "desc"]; // #OP_B627
  constructor(
    private router: Router,
    private tenantsService: TenantsService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private kpiReportingService: KPIReportingService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.KPI_REPORTING,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableconfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableconfig.delete = true;
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableconfig.tabledownload = true;
    }

    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }

  ngOnInit() {
    this.getAllList();
  }

  getAllList(limit?, offset?) {
    this.kpireportingList = [];
    this.tableconfig.loading = true;

    let reqObj: any = {
      tenantid: this.userstoragedata.tenantid,
    };

    if (this.searchText != null) {
      reqObj["searchText"] = this.searchText;
      reqObj["headers"] = [
        { field: "title" },
        { field: "description" }];
    }
    // #OP_B627
    if (this.order && this.order != null) {
      reqObj["order"] = this.order;
    } else {
      reqObj["order"] = ["lastupdateddt", "desc"];
    }
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      reqObj["headers"] = this.selectedcolumns;
    }
    else{
     query = `count=true&limit=${limit || 10}&offset=${offset || 0}&order=${this.order || ""}`;
    }

    this.kpiReportingService.all(reqObj, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableconfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
              buffer,
              "KPI_Reporting.xlsx"
          );
          this.isdownload = false;
          this.getAllList(limit, offset);
      } else {
          this.tableconfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableconfig.count = "Total Records" + ":" + " " + this.totalCount;
          this.kpireportingList = response.data.rows;
          this.tableconfig.loading = false;
      }
      
      } else {
        this.totalCount = 0;
        this.tableconfig .loading = false;
        this.kpireportingList = [];
      }
    });
  }

  dataChanged(e) {
    if (e.edit) {
      this.router.navigate(["kpi/reporting/edit/" + e.data.id]);
    }
    if (e.delete) {
      this.deleteConfig(e.data);
    }
    if (e.pagination) {
      this.getAllList(e.pagination.limit, e.pagination.offset);
      this.tableconfig.pageSize = e.pagination.limit;
    }
    if (e.searchText != "") {
      this.searchText = e.searchText;
      if (e.search) {
        this.getAllList(this.tableconfig.pageSize, 0);
      }
    }
    if (e.searchText == "") {
      this.searchText = null;
      this.getAllList(this.tableconfig.pageSize, 0);
    }

    if (e.refresh){
      this.getAllList();
    }
    // #OP_B627
    if (e.order) {
      this.order = e.order;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
    if (e.download) {
      this.isdownload = true;
      this.getAllList(this.tableconfig.pageSize, 0);
    }

  }
  deleteConfig(data) {
    this.kpiReportingService
      .update({
        id: data.id,
        status: AppConstant.STATUS.DELETED,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(data.title + " Deleted successfully");
          this.getAllList();
        } else {
          this.message.error(response.message);
        }
      });
  }

  addConfig() {
    this.router.navigate(["kpi/reporting/create"]);
  }
}
