import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { NotificationService } from "src/app/business/base/global-notification.service";

@Component({
  selector: "app-cloudmatiq-alerts",
  styles: [],
  templateUrl: "./alerts.component.html",
})
export class AlertNtfComponent implements OnInit, OnChanges {
  @Input() reference: any;
  @Input() refresh: boolean;
  ntfList = [];
  loading = false;
  tableHeader = [
    {
      field: "referenceno",
      header: "#Reference",
      datatype: "string",
      iWidth: "10%",
    },
    {
      field: "title",
      header: "Title",
      datatype: "string",
      iWidth: "60%",
    },
    {
      field: "createddt",
      header: "Received On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "txnstatus",
      header: "Status",
      datatype: "string",
      isfilter: true,
    },
  ];
  tableConfig = {
    manualsorting: false,
    sortbyList: [],
    apisort: true,
    refresh: true,
    columnselection: false,
    download: false, //#OP_T620
    edit: false,
    view:true,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    loading: false,
    pageSize: 10,
    count: null,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };
  totalCount = 0;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];
  showFilter = false;
  notificationStatus = AppConstant.TXNSTATUS;
  filterableValues = [];
  filteredValues = {};
  filterKey = "";
  viewTitle = "";
  isVisible = false;
  selectedNotification = {} as any;
  constructor(private ntfService: NotificationService) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.getNtf();
  }
  ngOnInit() {}

  getNtf(limit?, offset?) {
    if (
      (this.reference.txnid && this.reference.txntype) ||
      this.reference.instancerefid
    ) {
      this.ntfList = [];
      this.loading = true;
      let reqObj = {
        tenantid: this.reference.tenantid,
      };
      if (this.reference.instancerefid) {
        reqObj["referenceid"] = this.reference.instancerefid;
      }
      if (this.reference.txnid && this.reference.txntype) {
        reqObj["txnid"] = this.reference.txnid;
        reqObj["txntype"] = this.reference.txntype;
      }
      if (this.searchText != null) {
        reqObj["searchText"] = this.searchText;
        reqObj["headers"] = [{ field: "title" }];
        reqObj["headers"] = [{ field: "eventtype" }];
      }
      if (this.order && this.order != null) {
        reqObj["order"] = this.order;
      } else {
        reqObj["order"] = ["lastupdateddt", "desc"];
      }

      if (
        this.filteredValues["value"] &&
        this.filteredValues["value"].length > 0
      ) {
        reqObj["notificationstatus"] = this.filteredValues[this.filterKey];
      }
      let query = `count=${true}&limit=${limit ? limit : 10}&offset=${
        offset ? offset : 0
      }&order=${this.order ? this.order : ""}`;

      this.ntfService.all(reqObj, query).subscribe((res) => {
        const response = JSON.parse(res._body);
        this.loading = false;
        if (response.status) {
          this.tableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableConfig.count =
            "Total Records" + ":" + " " + this.totalCount;
          this.ntfList = response.data.rows;
        } else {
          this.ntfList = [];
          this.totalCount = 0;
        }
      });
    } else {
      return;
    }
  }
  getFilterValue(event) {
    let value = localStorage.getItem("fileterValue");
    if ("txnstatus" == value) {
      if (event) {
        this.filterableValues = AppConstant.TXNSTATUS;
        this.filterableValues = this.notificationStatus.filter((el) => {
          return el.value.includes(event);
        });
      } else {
        this.filterableValues = this.notificationStatus;
      }
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getNtf();
  }
  dataChanged(event) {
    if (event.pagination) {
      this.getNtf(event.pagination.limit, event.pagination.offset);
      this.tableConfig.pageSize = event.pagination.limit;
    }
    if (event.searchText != "" && event.search) {
      this.searchText = event.searchText;
      this.getNtf(this.tableConfig.pageSize, 0);
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getNtf(this.tableConfig.pageSize, 0);
    }
    if (event.order) {
      this.order = event.order;
      this.getNtf(this.tableConfig.pageSize, 0);
    }
    if (event.order == null) {
      this.order = null;
    }
    if (event.refresh) {
      this.searchText = null;
      this.filteredValues = {};
      this.getNtf();
    }
    if (event.view) {
      this.selectedNotification = event.data;
      this.isVisible = true;
    }
    if (event.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = "value";
      localStorage.setItem("fileterValue", event.data.field);
      if (event.data.field == "txnstatus") {
        this.filterableValues = AppConstant.TXNSTATUS;
      }
    }
  }
  closeDrawer(){
    this.isVisible = false;
  }
}
