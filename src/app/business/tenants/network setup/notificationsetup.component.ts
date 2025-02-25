import { Component, OnInit, ViewChild } from "@angular/core";
import * as _ from "lodash";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { NzMessageService, NzDropdownContextComponent } from "ng-zorro-antd";
import { NotificationSetupService } from "./notificationsetup.service";
import { Router } from "@angular/router";
import { TreeComponent } from "angular-tree-component";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-costsetup",
  templateUrl:
    "../../../presentation/web/tenant/notificationsetup/notificationsetup.component.html",
})
export class NotificationSetupComponent implements OnInit {
  private dropdown: NzDropdownContextComponent;

  screens = [];
  appScreens = {} as any;
  createcost = false;
  isVisible = false;
  showSidebar = false;
  isGroupHierarchyVisible = false;
  loading = true;
  totalCount;
  order = ["lastupdateddt", "desc"];
  userstoragedata = {} as any;
  folderName = "";
  selectedcolumns = [] as any;
  tableHeader = [
    { field: "module", header: "Module", datatype: "string", width: "13%", isdefault: true },
    { field: "event", header: "Event", datatype: "string", width: "13%",  isdefault: true },
    { field: "ntftype", header: "Type", datatype: "string", width: "13%", isdefault: true },
    { field: "notes", header: "Notes", datatype: "string", width: "30%", isdefault: true },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      width: "8%",
      isdefault: true,
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "12%",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ] as any;

  tableConfig = {
    refresh: true, //#OP_B632
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    manualpagination: true,
    loading: false,
    pagination: false,
    columnselection: true,
    apisort: true,
    count: 0,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
    tabledownload: false
  } as any;
  assetTypes: any = [];
  filters = { asset: null } as any;
  notificationList = [];
  zoneList = [];
  limit = 10;
  offset = 0;
  isdownload = false;
  formTitle = "Add Notification";

  notificationObj = {} as any;
  filterableValues = [] as any;
  showFilter = false;
  filterKey = "";
  filteredValues = {};
  ntfList: any = [
    { label: "Email", value: "Email" },
    { label: "SMS", value: "SMS" },
    { label: "Application", value: "Application" },
  ];
  structureId;
  savingStructure = false;
  button: any;
  @ViewChild(TreeComponent)
  private tree: TreeComponent;
  searchText=null;
  constructor(
    private notificationService: NotificationSetupService,
    public router: Router,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.NOTIFICATION_SETUP,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createcost = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    this.getAllList();
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    this.selectedcolumns = []; //#OP_428
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
  }

  ngOnInit() {
    this.loading = false;
  }
  getFilterValue(event) {
    let value = localStorage.getItem("filterValues");
     if ("ntftype" == value) {
      this.filterableValues = this.ntfList;
        this.filterableValues.filter((el) => {
          return el.value.includes(event);
        });
    }
  }
    setFilterValue(event) {
      this.showFilter = false;
      this.filteredValues[this.filterKey] = event;
      this.getAllList();
    }

  dataChanged(d) {
    if (d.edit || d.revise) {
      this.isVisible=true;
      this.showSidebar = true;
      this.notificationObj = d.data;
      this.formTitle = d.edit ? "Update Notification" : "Revise Notification"; 
      this.button = AppConstant.BUTTONLABELS.UPDATE;     
    }
    if (d.delete) {
      this.notificationObj = d.data;      
      this.deleteNotification();
    }
    //#OP_B632
    if (d.refresh) {
      this.getAllList();
    }
    if (d.pagination) {
      this.tableConfig.pageSize = d.pagination.limit;
      this.getAllList(d.pagination.limit, d.pagination.offset);
    }
    if (d.order) {
      this.order = d.order;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
    if (d.searchText != "") {
      this.searchText = d.searchText;
      if (d.search) {
        this.getAllList(this.tableConfig.pageSize, 0);
      }
    }
    if (d.searchText == "") {
      this.searchText = null;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
    if (d.filter) {
      this.showFilter = true;
      this.filterableValues = [];
      this.filterKey = "value";
      localStorage.setItem("filterValues", d.data.field);
      if (d.data.field == "ntftype") {
        this.filterableValues = this.ntfList;
      }
    }
    if (d.download) {
      this.isdownload = true;
      this.getAllList();
    }
    else{
      this.getFilterValue(null);
    }
  }

  showAddForm() {
    this.showSidebar = true;
    this.formTitle = "Add Notification";
    this.notificationObj = {};
  }

  notifyTagEntry(val: boolean) {
    if (val) {
      this.showSidebar = false;
      this.getAllList();
    }
  }
  deleteNotification() {
    this.isVisible = true;
    this.notificationService
      .update({
        ntfcsetupid: this.notificationObj.ntfcsetupid,
        status: AppConstant.STATUS.DELETED,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.getAllList();
          this.message.info("Deleted Succesfully");
          this.isVisible = false;
        } else {
          this.message.info(response.message);
          this.isVisible = false;
        }
      });
  }

  onChanged(val) {
    this.showSidebar = val;
    this.notificationObj = {};
  }
  getAllList(limit?, offset?) {
    this.tableConfig.loading = true;
    let query;
    let obj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    } as any;
    this.isVisible = true;
    if (
      this.filteredValues["value"] &&
      this.filteredValues["value"].length > 0
    ) {
      obj["ntftypes"] = this.filteredValues[this.filterKey];
    }
    if (this.order && this.order != null) {
      obj["order"] = this.order;
    } else {
      obj["order"] = ["lastupdateddt", "desc"];
    }
    if (this.searchText && this.searchText != null) {
      obj["searchText"] = this.searchText;
    }
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      obj["headers"] = this.selectedcolumns;
    }
    else{
      query = `count=${true}&limit=${limit ? limit : 10}&offset=${
      offset ? offset : 0
    }&order=${this.order ? this.order : ""}`;
    }
    this.notificationService.all(obj, query).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          if (this.isdownload) {
            this.loading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Notification_setup.xlsx"
            );
            this.isdownload = false;
          }
          else{
            this.tableConfig.manualpagination = true;
            this.totalCount = response.data.count;
            this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
            this.notificationList = response.data.rows;
          }
        } else {
          this.totalCount = 0;
          this.notificationList = [];
        }
        this.tableConfig.loading = false;
      },
      (err) => {
        console.log(err);
        this.isVisible = false;
      }
    );
    this.isVisible = false;
  }

  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }
}
