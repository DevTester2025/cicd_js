import { Component, OnInit } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CustomerAccountService } from "../../business/tenants/customers/customer-account.service";
import { TagService } from "../../business/base/tagmanager/tags.service";
import { TagValueService } from "../../business/base/tagmanager/tagvalue.service";
import * as _ from "lodash";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { MSynthetics } from "../interfaces";
import { AssetConstant } from "src/app/asset.constant";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-monitoring-summary",
  templateUrl: "./synthetics.component.html",
})
export class MonitoringSyntheticsComponent implements OnInit {
  screens = [];
  loading = true;
  appScreens = {} as any;
  showAddEditDrawer = false;

  // RBAC Controls
  canCreate = false;
  canDelete = false;
  monitoringView = false;

  userstoragedata = {} as any;
  tableHeader = AssetConstant.COLUMNS.SYNTHETICS_LIST;
  tableConfig = {
    edit: false,
    delete: false,
    columnselection: true, //#OP_428
    globalsearch: true,
    manualsearch: true,
    manualsorting: false,
    sortbyList: [],
    view: false,//#OP_T620
    refresh: true,
    chart: false,
    loading: false,
    pagination: false,
    rightsize: false,
    frontpagination: false,
    manualpagination: true,
    selection: false,
    taggingcompliance: false,
    apisort: true,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    count: null,
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
    tabledownload: false
  } as any;
  monitoringtableConfig={
    columnselection: true,
    apisort: true,
    globalsearch: true,
    manualsearch: true,
    count: null,
    view: true,
    refresh: true,
    delete: false,
    loading: false,
    pagination: false,
    rightsize: false,
    frontpagination: false,
    manualpagination: true,
    selection: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  }as any;
  monitoringLists = [];
  selectedcolumns = []; //#OP_428
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];
  showFilter = false;
  filterableValues = [];
  filterKey;
  filteredValues = {};
  filterSearchModel = ""; //#OP_T428
  regionList = []; //#OP_T428
  region = 'us-east-1';
  tabindex = 0;
  viewMonitoring = false;
  syntheticObj = {};
  isdownload = false;
  constructor(
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private router: Router,
    private message: NzMessageService,
    private customerAccService: CustomerAccountService,
    private tagValueService: TagValueService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SYNTHETICS as any,
    });
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
    }//#OP_T620
    console.log("APP SCREEENS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(this.appScreens);
    console.log(this.screens);
    if (_.includes(this.appScreens.actions, "Create")) {
      this.canCreate = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.canDelete = true;
      this.tableConfig["delete"] = true;
    }
    if (_.includes(this.appScreens.actions, "Monitoring")) {
      this.monitoringView = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    } 
  }

  ngOnInit() {
    this.loading = false;
    this.selectedcolumns = []; //#OP_428
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    this.getRegions();
  }

  onTabchange(event) {
    this.tabindex = event.index;
    console.log(this.tabindex);
    if (this.tabindex == 0) {
      this.getRegions();
    }
    if (this.tabindex == 1) {
      this.getMonitoringDetails();
    }
  }

  getRegions() {
    this.regionList = [];
    let url =
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES;
    this.httpService
      .POST(url, {
        status: "Active",
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.regionList = response.data;
            this.region = (_.find(this.regionList, function (e) { return e['zonename'] == 'us-east-1' })).zonename; //#OP_428
            this.getMonitors();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getMonitoringDetails(limit?, offset?) {
    this.tableHeader = [
      { field: "url", header: "URL", datatype: "string", isdefault: true },
      { field: "regions", header: "Region count", datatype: "string", isdefault: true },
    ] as any;
    this.monitoringtableConfig.delete = false;
    this.monitoringtableConfig.loading = true;
    this.selectedcolumns = []; //#OP_428
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    let condition: any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    let endpoint = AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.MONITORING_LIST;
    let query = `?count=${true}&limit=${limit ? limit : this.monitoringtableConfig.pageSize}&offset=${offset ? offset : 0
      }&tenantid=${this.userstoragedata.tenantid}`;
    this.httpService
      .POST(
        endpoint + query, condition
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.monitoringtableConfig.manualpagination = true;
            this.monitoringLists = response.data.items;
            this.totalCount = response.data.count;
            this.monitoringtableConfig.count = "Total Records" + ":" + " " + this.totalCount
            this.monitoringtableConfig.loading = false;
          } else {
            this.totalCount = 0;
            this.monitoringtableConfig.count = "Total Records" + ":" + " " + this.totalCount
            this.monitoringLists = [];
            this.monitoringtableConfig.loading = false;
          }
        })
  }

  getMonitors(limit?, offset?) {
    this.tableHeader = AssetConstant.COLUMNS.SYNTHETICS_LIST;
    this.selectedcolumns = []; //#OP_428
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    this.tableConfig.loading = true;
    let condition: any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      region: this.region
    };
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    if (this.filteredValues["zonename"] && this.filteredValues["zonename"].length > 0) {
      condition["regions"] = this.filteredValues["zonename"]
    }
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    }
    let endpoint = AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.GET_LIST;

      let query;
      if (this.isdownload === true) {
        query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
      }
      else{
       query = `count=${true}&limit=${limit ? limit : this.tableConfig.pageSize}&offset=${offset ? offset : 0
      }&order=${this.order ? this.order : ""}`;
      }
    this.httpService
      .POST(
        endpoint + '/list?' + query, condition
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            if (this.isdownload) {
              this.tableConfig.loading = false;
              var buffer = Buffer.from(response.data.content.data);
              downloadService(
                buffer,
                "Synthetics_List.xlsx"
              );
              this.isdownload = false;
            }
            else {
              this.tableConfig.manualpagination = true;
              this.totalCount = response.data.count;
              this.monitoringLists = response.data.rows;
              this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount
              this.tableConfig.loading = false;
            }
          } else {
            this.totalCount = 0;
            this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount
            this.monitoringLists = [];
            this.tableConfig.loading = false;
          }
        })
  }
  //#OP_T428
  getFilterValue(event) {
    let f = {
      status: "Active",
    };
    if (this.filterSearchModel !== "") {
      f["zonename"] = this.filterSearchModel;
    }
    if (event) {
      f["searchText"] = event;
    }
    f["headers"] = [{ field: this.filterKey }];
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
        f
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data;
          this.filterableValues.filter((el) => {
            return el.zonename.includes(event);
          });
        } else {
          this.filterableValues = [];
        }
      });
    this.filterSearchModel = '';
  }
  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getMonitors();
  }
  dataChanged(event) {
    if (event.view) {
      if (this.tabindex == 0) {
        const synthetics = event.data as MSynthetics;
        this.router.navigate(["monitoring-synthetics/" + synthetics.id]);
      } else {
        this.viewMonitoring = true;
        this.syntheticObj = event.data;
      }
    }
    if (event.delete) {
      this.deleteCanary(event.data.id);
    }
    if (event.pagination) {
      if(this.tabindex == 0){
        this.tableConfig.pageSize = event.pagination.limit
        this.getMonitors(event.pagination.limit, event.pagination.offset);
      }
      if(this.tabindex == 1){
        this.monitoringtableConfig.pageSize = event.pagination.limit
        this.getMonitoringDetails(event.pagination.limit, event.pagination.offset)
      }
      }
    if (event.searchText != "") {
      if (this.tabindex == 0) {
        this.searchText = event.searchText;
        if (event.search) {
          this.getMonitors(this.tableConfig.pageSize, 0);
        }
      } 
      if(this.tabindex == 1){
        this.searchText = event.searchText;
        if(event.search){
          this.getMonitoringDetails(this.monitoringtableConfig.pageSize, 0);
          // this.totalCount = event.totalCount;
        }
      }
    }
    if (event.searchText == "") {
      if (this.tabindex == 0) {
        this.searchText = null;
        this.getMonitors(this.tableConfig.pageSize, 0);
      }
      if (this.tabindex == 1) {
        this.searchText = null;
        this.getMonitoringDetails(this.monitoringtableConfig.pageSize, 0);
      }
    }
    if (event.order) {
      this.order = event.order;
      this.getMonitors(this.tableConfig.pageSize, 0);
    }
    if (event.refresh) {
      if (this.tabindex == 0) {
      this.getMonitors();
    }
      if (this.tabindex == 1) {
        this.getMonitoringDetails();
      }
    }
    if (event.download) {
      if (this.tabindex == 0) {
      this.isdownload = true;
        this.getMonitors(this.tableConfig.pageSize, 0);
      }
    }
  }

  deleteCanary(id: number) {
    this.httpService
      .DELETE(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.DELETE_BY_ID +
        id
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          console.log(response);
          this.getMonitors();
        },
        (err) => {
          this.message.error("Error deleting canary.");
          console.log(err);
        }
      );
  }
}
