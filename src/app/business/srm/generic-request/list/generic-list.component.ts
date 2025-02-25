import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { SrmService } from "../../srm.service";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { Buffer } from "buffer";
import downloadService from "../../../../modules/services/shared/download.service";
@Component({
  selector: "app-srm-generic-list",
  templateUrl:
    "../../../../presentation/web/srm/generic-request/list/generic-list.component.html",
})
export class SRMGenericListComponent implements OnInit {
  @Output() notfiyEntry: EventEmitter<any> = new EventEmitter();
  subtenantLable = AppConstant.SUBTENANT;
  genericList = [];
  userstoragedata: any = {};
  searchText: string;
  originalData: any = [];
  widthConfig: ["25px", "25px", "25px", "25px", "25px"];
  sortValue = null;
  loading = false;
  sortName = null;
  screens = [];
  appScreens = {} as any;
  addAccess: boolean = false;
  editAccess: boolean = false;
  deleteAccess: boolean = false;
  deployAccess: boolean = false;
  viewAccess: boolean = false;
  progressAccess: boolean = false;
  isdownload = false;
  downloadflag = false;
  totalCount = null;
  pageCount = AppConstant.pageCount;
  pageSize: number = 10;
  selectedcolumns = [
    { field: "subject", header: "Subject", datatype: "string" },
    { field: "requestdate", header: "Request Date", datatype: "timestamp", format: "dd-MMM-yyyy" },
    { field: "duedate", header: "Due Date", datatype: "timestamp", format: "dd-MMM-yyyy" },
    { field: "customer?.customername", header: this.subtenantLable + " Name", datatype: "string" },
    { field: "referenceno", header: "Reference No", datatype: "string" },
    { field: "srstatus", header: "Status", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    { field: "lastupdateddt", header: "Updated On", datatype: "timestamp", format: "dd-MMM-yyyy" },
  ] as any;
  constructor(
    private router: Router,
    private srmService: SrmService,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SERVICE_CATALOG_REQUEST,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.addAccess = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.editAccess = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.deleteAccess = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.deployAccess = true;
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.viewAccess = true;
    }
    if (_.includes(this.appScreens.actions, "Progress Update")) {
      this.progressAccess = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.downloadflag = true;
    }
  }

  ngOnInit() {
    this.getSRMGenericList();
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  navigate(){
    this.router.navigate(["srm/generic/create"]);
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.genericList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.genericList = data;
    }
  }
  edit(data) {
    if (data) {
      this.router.navigate(["srm/generic/request/" + data.srvrequestid]);
    }
  }
  view(data) {
    if (data) {
      this.router.navigate(["srm/generic/view/" + data.srvrequestid]);
    }
  }
  updateProgress(data) {
    if (data) {
      this.router.navigate(["srm/generic/progress/" + data.srvrequestid]);
    }
  }
  globalSearch(searchText: any) {
    if (searchText !== "" && searchText !== undefined && searchText != null) {
      const self = this;
      this.genericList = [];
      this.originalData.map(function (item) {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            const regxExp = new RegExp("\\b" + searchText, "gi");
            if (regxExp.test(element)) {
              if (!_.some(self.genericList, item)) {
                self.genericList.push(item);
              }
            }
          }
        }
      });
      this.totalCount = this.genericList.length;
    } else {
      this.genericList = this.originalData;
      this.totalCount = this.genericList.length;
    }
  }
  getSRMGenericList() {
    this.loading = true;
    let condition = {} as any;

  condition = {
    status: "Active",
    tenantid: this.userstoragedata.tenantid,
    requesttype: "Generic",
  };
  let query;
  if (this.isdownload === true) {
    query = `isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
  }
    this.srmService
      .allService(condition,query)
      .subscribe((result) => {
        this.notfiyEntry.next(false);
        let response = {} as any;
        response = JSON.parse(result._body);
        if (this.isdownload) {
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "SRM_Generic_Request.xlsx"
          );
          this.isdownload = false;
        }
        if (response.status) {
          this.genericList = response.data;
          this.totalCount = this.genericList.length;
          this.originalData = this.genericList;
         this.loading = false;
        } else {
          this.genericList = [];
          this.originalData = [];
          this.totalCount = 0;
          this.loading = false;
        }
      });
  }

  deleteGenericService(data) {
    let formdata = {} as any;
    formdata = {
      srvrequestid: data.srvrequestid,
      status: "Deleted",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.srmService.updateService(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.messageService.success(
              "#" + response.data.srvrequestid + " Deleted Successfully"
            )
          : this.messageService.success(response.message);
        this.getSRMGenericList();
      } else {
        this.messageService.error(response.message);
      }
    });
  }

  download(){
    this.isdownload = true;
    this.getSRMGenericList();
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    if (this.searchText && this.searchText.trim() !== "") {
      this.globalSearch(this.searchText);
    } else {
      this.getSRMGenericList();
      this.pageSize = this.genericList.length;
    }
  }
  refresh() { 
    this.searchText = null;
    this.getSRMGenericList();
  }
}
