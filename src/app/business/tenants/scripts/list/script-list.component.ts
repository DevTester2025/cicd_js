import { Component, OnInit, Output } from "@angular/core";
import { ScriptService } from "../script.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { query } from "@angular/animations";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-script-list",
  templateUrl:
    "../../../../presentation/web/tenant/scripts/list/script-list.component.html",
})
export class ScriptsListComponent implements OnInit {
  scriptObj: any;
  userstoragedata = {} as any;
  // Table
  scriptList = [];
  isVisible = false;
  formTitle = "Add Script";
  screens = [];
  loading = true;
  appScreens = {} as any;
  createScript = false;
  totalCount;
    limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];
  isdownload = false;
  tableHeader = [
    { field: "scriptname", header: "Script Name", datatype: "string", isdefault: true },
    { field: "scripttype", header: "Script Type", datatype: "string",  isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string",  isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string",  isdefault: true },
  ] as any;
  tableConfig = {
    refresh: true, //#OP_B632
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    manualpagination: true,
    columnselection: true,
    loading: false,
    apisort: true,
    pagination: false,
    pageSize: 10,
    count: 0,
    tabledownload: false,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  selectedcolumns = [] as any;
  constructor(
    private scriptService: ScriptService,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.scriptList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SCRIPTS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createScript = true;
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
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }
  ngOnInit() {
    this.loading = false;
    this.getAllList();
  }
  getAllList(limit?, offset?) {
    this.tableConfig.loading = true;
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
    // let query = `count=${true}&limit=${limit ? limit : 10}&offset=${
    //   offset ? offset : 0
    // }&order=${this.order ? this.order : ""}`;
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
    }
    else{
     query = `count=${true}&limit=${limit ? limit : 10}&offset=${offset ? offset : 0 }&order=${this.order ? this.order : ""}`;
    }
    this.scriptService.all(condition, query).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableConfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "Script.xlsx"
          );
          this.isdownload = false;
        }
        else{
        this.tableConfig.manualpagination = true;
        this.totalCount = response.data.count;
        this.tableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
        this.scriptList = response.data.rows;
      } }
      else {
        this.totalCount = 0;
        this.scriptList = [];
      }
      this.tableConfig.loading = false;
    });
  }
  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.scriptObj = result.data;
      this.scriptObj.refid = this.scriptObj.scriptid;
      this.scriptObj.reftype = AppConstant.REFERENCETYPE[17];
      this.formTitle = "Update Script";
    } else if (result.delete) {
      this.deleteScript(result.data);
    }
    if (result.pagination) {
      this.tableConfig.pageSize = result.pagination.limit;
      this.getAllList(result.pagination.limit, result.pagination.offset);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getAllList(this.tableConfig.pageSize, 0);
      }
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
    if (result.refresh) {
      this.getAllList();
    }
    if (result.download) {
      this.isdownload = true;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
  }
  notifyScriptEntry(event) {
    let existData = {} as any;
    existData = _.find(this.scriptList, { scriptid: event.scriptid });
    if (existData === undefined) {
      this.scriptList = [event, ...this.scriptList];
    } else {
      const index = _.indexOf(this.scriptList, existData);
      this.scriptList[index] = event;
      this.scriptList = [...this.scriptList];
    }
    this.isVisible = false;
    this.formTitle = "Add Script";
  }
  deleteScript(data) {
    const formData = new FormData();
    const inputData = {
      scriptid: data.scriptid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    formData.append("formData", JSON.stringify(inputData));
    this.scriptService.update(formData).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.messageService.success(
              "#" + response.data.scriptid + " Deleted Successfully"
            )
          : this.messageService.success(response.message);
        this.getAllList();
      } else {
        this.messageService.error(response.message);
      }
    });
  }
  showAddForm() {
    this.isVisible = true;
    this.formTitle = "Add Script";
    this.scriptObj = {};
  }
}
