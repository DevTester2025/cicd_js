import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { SSLService } from "../ssl/sslservice";
import { AWSAppConstant } from "src/app/aws.constant";
import { HttpClient, HttpRequest, HttpResponse } from "@angular/common/http";
import { filter } from "rxjs/operators";
import { any } from "@amcharts/amcharts4/.internal/core/utils/Array";
import * as moment from "moment";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-ssl",
  templateUrl: "./ssl.component.html",
})
export class SslComponent implements OnInit {
  // RBAC Controls
  isAdd = false;
  isDelete = false;
  showAddEditDrawer = false;
  userstoragedata = {} as any;
  screens = [];
  appScreens = {} as any;
  tableHeader = AWSAppConstant.COLUMNS.SSLMONITORING;
  tableConfig = {
    scroll: { x: "1700px" },
    apisort: true,
    columnselection: true,
    edit: false,
    delete: false,
    view: false, //#OP_T620
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    loading: false,
    pageSize: 10,
    count: 0,
    title: "",
    tabledownload: false,
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  } as any;
  monitoringtableConfig = {
    columnselection: true,
    globalsearch: true,
    manualsearch: true,
    apisort: true,
    view: false,
    refresh: true,
    delete: false,
    loading: false,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    rightsize: false,
    selection: false,
    taggingcompliance: false,
    pageSize: 10,
    count: 0,
    scroll: { x: "1000px" },
    tabledownload: false,
    title: "",
    // widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  monitoringLists = [];
  monitoringData = [];
  selectedcolumns = [];
  fileList: UploadFile[] = [];
  totalCount: any;
  limit = 10;
  offset = 0;
  searchText = null;
  monitorSearch = null;
  uploading = false;
  isVisible = false;
  order = ["lastupdateddt", "desc"];
  isview = false;
  sslData:any = {};
  tabindex = 0;
  loading = true;
  monitortableHeader = [
    { field: "url", header: "URL", datatype: "string", isdefault: true },
    {
      field: "validity_end",
      header: "Expire Date",
      datatype: "html",
      isdefault: true,
    },
  ] as any;
  isdownload = false;
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
    private message: NzMessageService,
    private sslService: SSLService,
    private http: HttpClient
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SSL as any,
    });
    //#OP_T620
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
    }
    console.log("APP SCREEENS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(this.appScreens);
    console.log(this.screens);
    if (_.includes(this.appScreens.actions, "Create")) {
      this.isAdd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig["edit"] = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.isDelete = true;
      this.tableConfig["delete"] = true;
      this.monitoringtableConfig["delete"] = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
      this.monitoringtableConfig.tabledownload = true;
    } 
  }

  ngOnInit() {
    this.loading = false;
    this.getAllList();
  }
  onTabchange(event) {
    this.tabindex = event.index;
    console.log(this.tabindex);
    this.order = ["lastupdateddt", "desc"];
    if (this.tabindex == 0) {
      this.getAllList();
    }
    if (this.tabindex == 1) {
      this.getMonitoringDetails();
    }
  }
  beforeUpload = (file: UploadFile): boolean => {
    console.log(this.fileList.length);
    if (this.fileList.length > 0) {
      this.fileList = [];
      this.fileList.push(file);
    } else {
      this.fileList.push(file);
    }
    return false;
  };
  getAllList(limit?, offset?) {
    this.tableConfig.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.selectedcolumns = [];
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    //#OP_B627
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
  
    let query;
    if (this.isdownload === true) {
      query = `?isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
    }
    else{
     query = `?limit=${limit ? limit : 10}&offset=${
      offset ? offset : 0
    }&order=${this.order ? this.order : ""}`;;
    }

    this.sslService.all(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableConfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "SSL_List.xlsx"
          );
          this.isdownload = false;
        }
        else {
          this.tableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
          this.monitoringLists = response.data.rows;
        }
      } else {
        this.monitoringLists = [];
      }
      this.tableConfig.loading = false;
    });
  }

  getMonitoringDetails(limit?, offset?) {
    this.monitoringtableConfig.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.selectedcolumns = [];
    if (this.monitortableHeader && this.monitortableHeader.length > 0) {
      this.selectedcolumns = this.monitortableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    if (this.monitorSearch != null) {
      condition["searchText"] = this.monitorSearch;
    }
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
    let query;
    if (this.isdownload === true) {
      query = `?isdownloaddetail=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
    }
    else{
     query = `?detail=${true}&limit=${
      limit ? limit : this.monitoringtableConfig.pageSize
    }&offset=${offset ? offset : 0}&order=${this.order ? this.order : ""}`;
    }
    this.sslService.all(condition, query).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response && response.data) {
        if (this.isdownload) {
          this.monitoringtableConfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "SSL_Detail.xlsx"
          );
          this.isdownload = false;
        }
        else { 
        this.monitoringtableConfig.manualpagination = true;
        this.totalCount = response.data.count;
        this.monitoringtableConfig.count = "Total Records" + ":" + " " + this.totalCount;
        this.monitoringData = response.data.rows.map((d) => ({
          ...d,
          validity_end: d.validity_end
            ? moment(d.validity_end).format("DD-MMM-YYYY")
            : "-",
        }));
        console.log(this.monitoringtableConfig.count, ">>>>>>>>>>.........");
        this.monitoringtableConfig.loading = false;
      }
      } else {
        this.monitoringData = [];
        this.monitoringtableConfig.loading = false;
      }
    });
  }
  addSSL() {
    this.isview = false;
    this.sslData = {};
    this.showAddEditDrawer = true;
  }
  dataChanged(e) {
    if (e.edit) {
      this.isview = false;
      this.showAddEditDrawer = true;
      this.sslData = e.data;
      this.sslData.refid = this.sslData.id;
      this.sslData.reftype = AppConstant.REFERENCETYPE[22];
    }
    if (e.pagination) {
      if (this.tabindex == 0) {
        this.tableConfig.pageSize = e.pagination.limit;
        this.getAllList(e.pagination.limit, e.pagination.offset);
      }
    }
    if (e.searchText != "" && e.search) {
      this.searchText = e.searchText;
      if (this.tabindex == 0) {
        this.getAllList(this.tableConfig.pageSize, 0);
      }
    }
    if (e.download) {
      this.isdownload = true;
      this.getAllList(this.tableConfig.pageSize, 0);
    }

    if (e.searchText == "") {
      if (this.tabindex == 0) {
        this.searchText = null;
        this.getAllList(this.tableConfig.pageSize, 0);
      }
    }
    if (e.refresh) {
      if (this.tabindex == 0) {
        this.searchText = null;
        this.getAllList();
      }
    }
    if (e.delete) {
      if (this.tabindex == 0) {
        this.sslService
          .update({
            id: e.data.id,
            status: AppConstant.STATUS.DELETED,
            lastupdatedby: this.userstoragedata.fullname,
            lastupdateddt: new Date(),
          })
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.message.success(response.message);
              this.getAllList();
            } else {
              this.message.error(response.message);
            }
          });
      }
    }
    if (e.view) {
      this.isview = true;
      this.showAddEditDrawer = true;
      this.sslData = e.data;
    }
    //#OP_B627
    if (e.order) {
      if (this.tabindex == 0) {
        this.order = e.order;
        this.getAllList(this.tableConfig.pageSize, 0);
      }
    }
  }

  monitordataChanged(e) {
    if (e.pagination) {
      this.monitoringtableConfig.pageSize = e.pagination.limit;
      this.getMonitoringDetails(e.pagination.limit, e.pagination.offset);
    }
    if (e.searchText != "" && e.search) {
      this.monitorSearch = e.searchText;
      this.getMonitoringDetails(this.monitoringtableConfig.pageSize, 0);
    }
    if (e.searchText == "") {
      this.monitorSearch = null;
      this.getMonitoringDetails(this.monitoringtableConfig.pageSize, 0);
    }
    if (e.refresh) {
      if (this.tabindex == 1) {
        this.monitorSearch = null;
        this.getMonitoringDetails();
      }
    }
    if (e.download) {
      this.isdownload = true;
      this.getMonitoringDetails(this.monitoringtableConfig.pageSize, 0);
    }

    if (e.delete) {
      this.sslService
        .monitoringUpdate({
          id: e.data.id,
          status: AppConstant.STATUS.DELETED,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.getMonitoringDetails();
          } else {
            this.message.error(response.message);
          }
        });
    }
    if (e.order) {
      this.order = e.order;
      this.getMonitoringDetails(this.monitoringtableConfig.pageSize, 0);
    }
  }

  notifyEntry() {
    this.getAllList();
  }
}
