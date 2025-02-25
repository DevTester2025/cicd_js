import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { SrmService } from "../../srm.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { Buffer } from "buffer";
import downloadService from "../../../../modules/services/shared/download.service";

@Component({
  selector: "app-srm-catalog-list",
  templateUrl:
    "../../../../presentation/web/srm/catalog-request/list/catalog-list.component.html",
})
export class SRMCatalogListComponent implements OnInit {
  @Output() notfiyEntry: EventEmitter<any> = new EventEmitter();

  serviceList = [];
  userstoragedata: any = {};
  searchText: string;
  originalData: any = [];
  widthConfig: ["15px", "25px", "25px", "25px", "25px"];
  sortValue = null;
  sortName = null;
  listType = "card";
  loading =false;
  srvrequestid;
  cardViewList: any = [];
  pageTotal: any = 0;
  srmActionList: any;
  previewVisible = false;
  previewTitle = "";
  previewImage: any="";
  // Actions
  screens = [];
  appScreens = {} as any;
  createGenericFlag = false;
  createServiceFlag = false;
  downloadflag = false
  isdownload = false;
  totalCount = null;
  pageSize = 10;
  pageCount = AppConstant.pageCount;
  selectedcolumns = [
    { field: "catalogname", header: "Service Name", datatype: "string" },
    { field: "group.keyvalue", header: "Group Name", datatype: "string" },
    {
      field: "publishdate",
      header: "Publish Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy"
    },
    {
      field: "enddate",
      header: "End Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy"
    },
    { field: "referencetype", header: "Request Type", datatype: "string" },
    {
      field: "createddt",
      header: "Created Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy"
    }
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
      this.createServiceFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.downloadflag = true;
    }
  }

  ngOnInit() {
    this.getPublishedCatalogList();
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
      this.serviceList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.serviceList = data;
    }
  }
  globalSearch(searchText: any) {
    if (searchText && typeof searchText === 'string') {
      searchText = searchText.toLowerCase();
      this.serviceList = this.originalData.filter((item) => {
        return Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchText)
        );
      });
      this.pageTotal = this.serviceList.length;
      this.onPageChange(1);
    } else {
      this.serviceList = this.originalData;
    }
  }
  
  checkIndex(t) {
    if (t == 1 || t == 4 || t == 7) {
      return true;
    }
  }
  onPageChange(event) {
    let limit = (event - 1) * 9;
    this.cardViewList = this.serviceList.slice(limit, limit + 9);
    console.log(this.cardViewList);
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    if (this.searchText && this.searchText.trim() !== "") {
      this.globalSearch(this.searchText);
    } else {
      this.getPublishedCatalogList();
      this.pageTotal = this.serviceList.length;
    }
  }
 
  getPublishedCatalogList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: "Active",
      tenantid: this.userstoragedata.tenantid,
      publishstatus: AppConstant.STATUS.PUBLISHED,
    };
    let query
    if (this.isdownload === true) {
     query = `isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
    }
    this.srmService.allCatalog(condition,query).subscribe((result) => {
      this.notfiyEntry.next(false);

      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        if (this.isdownload) {
          this.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "SRM_Published.xlsx"
          );
          this.isdownload = false;
        }
        let len = response.data.length;
        response.data.forEach((item) => {
          item.servicename = "";
          item.group_name = "";
          if (item.solution) {
            item.servicename = item.solution.solutionname;
          }
          if (item.group) {
            item.group_name = item.group.keyvalue;
          }
          len--;
          if (len == 0) {
            this.loading = false;
          }
        });
        this.serviceList = response.data;
        this.pageTotal = this.serviceList.length | 0;
        this.onPageChange(1);
        this.originalData = response.data;
      } else {
        this.serviceList = [];
        this.originalData = [];
        this.loading = false;
      }
    });
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
  getSRMServiceList() {
    this.loading = true;
    let query = {} as any;
    query = {
      status: "Active",
      tenantid: this.userstoragedata.tenantid,
      requesttype: "Solution",
    };
    this.srmService.allService(query).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.serviceList = response.data;
        this.originalData = response.data;
      } else {
        this.serviceList = [];
        this.originalData = [];
      }
      this.loading = false;
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
        response.data.status === AppConstant.STATUS.DELETED
          ? this.messageService.success(
              "#" + response.data.catalogid + " Deleted Successfully"
            )
          : this.messageService.success(response.message);
        this.getSRMServiceList();
      } else {
        this.messageService.error(response.message);
      }
    });
  }
  view(data) {
    if (data) {
      this.router.navigate(["srm/catalog/view/" + data.srvrequestid]);
    }
  }
  edit(data) {
    if (data) {
      this.router.navigate(["srm/service/edit/" + data.srvrequestid]);
    }
  }
  updateProgress(data) {
    if (data) {
      this.router.navigate(["srm/progress/" + data.srvrequestid]);
    }
  }
  selected(data) {
    // if (new Date(data.plannedenddate) < new Date()) {
      // this.messageService.error(
      //   data.solution.solutionname + " catalog is expired"
      // );
    //   return;
    // }
    if (data.catalogid) {
      this.router.navigate(["srm/service/create"], {
        queryParams: { catalogid: data.catalogid, type: "Create" },
      });
    }
  }
  onPreview(file, title) {
    this.previewTitle = title;
    this.previewVisible = true;
    this.previewImage = file;
  }

  download(){
    this.isdownload = true;
    this.getPublishedCatalogList();
  }
  refresh() { 
    this.searchText = null;
    this.getPublishedCatalogList();
  }
}
