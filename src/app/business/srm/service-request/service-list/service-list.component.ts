import { Component, OnInit } from "@angular/core";
import { SrmService } from "../../srm.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { Buffer } from "buffer";
import downloadService from "../../../../modules/services/shared/download.service";
@Component({
  selector: "app-srm-service-list",
  templateUrl:
    "../../../../presentation/web/srm/service-request/service-list/service-list.component.html",
})
export class SRMServiceListComponent implements OnInit {
  catalogList = [];
  pendingList = [];
  catalogPublishedList = [];
  catalogPendingList = [];
  cardViewList = [];
  userstoragedata: any = {};
  searchText: string;
  pageTotal: any = 0;
  originalData: any = [];
  widthConfig: ["15px", "15px", "10px", "10px", "15px", "20px", "10px"];
  sortValue = null;
  sortName = null;
  listType = "card";
  loading = false;
  pageSize = 10;
  pageCount = AppConstant.pageCount;
  tab: any = AppConstant.STATUS.PUBLISHED;
  screens = [];
  appScreens = {} as any;
  // Actions
  createFlag = false;
  viewFlag = false;
  editFlag = false;
  deleteFlag = false;
  publishFlag = false;
  unpublishFlag = false;
  isdownload = false;
  downloadflag = false;
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
      screencode: AppConstant.SCREENCODES.SERVICE_CATALOG_MANAGEMENT,
    });

    if (_.includes(this.appScreens.actions, "Create")) {
      this.createFlag = true;
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.viewFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.editFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.deleteFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Publish")) {
      this.publishFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Unpublish")) {
      this.unpublishFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.downloadflag = true;
    }
  }
  selectedcolumns = [
    { field: "catalogname", header: "Service Name", datatype: "string" },
    { field: "description", header: "Characteristics", datatype: "string" },
    { field: "referencetype", header: "Request Type", datatype: "string" },
    { field: "publishdate", header: "Publish Date", datatype: "timestamp", format: "dd-MMM-yyyy" },
    { field: "enddate", header: "End Date", datatype: "timestamp", format: "dd-MMM-yyyy" },
    { field: "publishstatus", header: "Publish Status", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    { field: "lastupdateddt", header: "Updated On", datatype: "timestamp", format: "dd-MMM-yyyy" },
  ] as any;
  ngOnInit() {
    this.getSRMCatalogList();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.catalogList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.catalogList = data;
    }
  }
  imageExists(image_url) {
    try {
      console.log("function called");
      var http = new XMLHttpRequest();
      http.open("HEAD", image_url, false);
      http.send();
      return true;
    } catch (e) {
      return false;
    }
  }
  globalSearch(searchText: any) {
    if (searchText && typeof searchText === 'string') {
      const lowerCaseSearchText = searchText.toLowerCase(); // Normalize case once
      this.catalogList = this.originalData.filter((item) =>
        Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(lowerCaseSearchText)
        ) && item.publishstatus === this.tab
      );
    } else {
      // Directly filter based on publish status if no search text
      this.catalogList = this.originalData.filter(item => item.publishstatus === this.tab);
    }
    this.onPageChange(1); // Ensure pagination is reset outside the condition
  }
  
  
  
  checkIndex(t) {
    if (t == 1 || t == 4 || t == 7) {
      return true;
    }
  }
  tabSelect(event) {
    this.catalogList = _.filter(this.originalData, { publishstatus: event });
    this.onPageChange(1);
    this.tab = event;
    this.searchText = '';
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    if (this.searchText && this.searchText.trim() !== "") {
      this.globalSearch(this.searchText);
    } else {
      this.getSRMCatalogList();
      this.pageTotal = this.catalogList.length;
    }
  }
  
  onPageChange(event) {
    let limit = (event - 1) * 9;
    this.cardViewList = this.catalogList.slice(limit, limit + 9);
    this.pageTotal = this.catalogList.length | 0;
  }
  getSRMCatalogList() {
    this.loading = true;
    let condition = {} as any;
  condition = { status: "Active", tenantid: this.userstoragedata.tenantid };
     let query;
  if (this.isdownload === true) {
    query = `isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
  }
    this.srmService.allCatalog(condition,query).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        if (this.isdownload) {
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "SRM.xlsx"
          );
          this.isdownload = false;
          this.loading = false;
        }
        response.data.forEach((item) => {
          item.solutionname = "";
          if (item.solution) {
            item.solutionname = item.solution.solutionname;
          }
        });
        this.catalogList = response.data;
        this.catalogList = _.filter(this.catalogList, {
          publishstatus: this.tab,
        });
        this.onPageChange(1);
        this.originalData = response.data;
        this.loading = false;
      } else {
        this.catalogList = [];
        this.originalData = [];
        this.loading = false;
      }
    });
  }
  deleteCatalogService(data) {
    let formdata = {} as any;
    formdata = {
      catalogid: data.catalogid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.updateCatalog(formdata);

  }
  updateCatalog(formdata) {
    const formData = new FormData();
    formData.append("formData", JSON.stringify(formdata));
    this.srmService.updateCatalog(formData).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.catalogList = this.catalogList.filter(item => item.catalogid !== formdata.catalogid);
        this.originalData = this.originalData.filter(item => item.catalogid !== formdata.catalogid);
        response.data.status === AppConstant.STATUS.DELETED
          ? this.messageService.success(
              "#" + response.data.catalogid + " Deleted Successfully"
            )
          : this.messageService.success(response.message);
          this.onPageChange(1);
      } else {
        this.messageService.error(response.message);
      }
    });
  }
    
  publish(data) {
    // let formdata = {} as any;
    // formdata = { catalogid: data.catalogid, publishstatus: AppConstant.STATUS.PUBLISHED, lastupdatedby: this.userstoragedata.fullname, lastupdateddt: new Date() };
    // this.updateCatalog(formdata);
    if (data) {
      if (
        data.publishstatus == "Pending" &&
        AppConstant.STATUS.PENDING &&
        new Date(data.publishdate) < new Date()
      ) {
        this.messageService.error("Publish date is expired");
        return;
      }
      // this.router.navigate(['srm/catalog/view/' + data.srvrequestid]);
      this.router.navigate(["srm/catalog/publish"], {
        queryParams: { id: data.catalogid, mode: "Publish" },
      });
    }
  }
  unpublish(data) {
    let formdata = {} as any;
    formdata = {
      catalogid: data.catalogid,
      publishstatus: AppConstant.STATUS.PENDING,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.updateCatalog(formdata);
  }
  edit(data) {
    if (data) {
      this.router.navigate(["srm/catalog/edit/" + data.catalogid]);
    }
  }
  view(data) {
    if (data) {
      this.router.navigate(["srm/catalog/view"], {
        queryParams: { id: data.catalogid, mode: "View" },
      });
    }
  }
  download(){
    this.isdownload = true;
    this.getSRMCatalogList();
  }
  refresh() { 
    this.searchText = null;
    this.getSRMCatalogList();
  }
}
