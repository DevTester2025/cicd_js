import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { ActivatedRoute } from "@angular/router";
import { NotificationService } from "./global-notification.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { interval, Subscription } from "rxjs";
import * as moment from "moment";
import { Buffer } from "buffer";
import downloadService from "../../modules/services/shared/download.service";
import { AssetsService } from "./assets/assets.service";
import * as Papa from "papaparse";
import { CommonService } from "src/app/modules/services/shared/common.service";

@Component({
  selector: "app-global-notifications",
  templateUrl: "../../presentation/web/base/global-notification.component.html",
  styles: [],
})
export class GlobalNotificationComponent implements OnInit {
  screens = [];
  appScreens = {} as any;
  userstoragedata = {} as any;
  current = "dashboard";
  canResolve = false;
  private updateSubscription: Subscription;
  alertTypes = [
    { value: "Security Alert", label: "Security Alert" },
    { value: "GRAFANA_ALERTS", label: "System Alert" },
    { value: "SYNTHETIC_ALERTS", label: "Synthetics Alert" },
    { value: "SSL_ALERTS", label: "SSL Alert" },
  ];
  tagTableHeader = [
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
    },
    {
      field: "configuration",
      header: "Configuration",
      datatype: "string",
      isfilter: true,
    },
    {
      field: "createddt",
      header: "Received On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy HH:mm:ss",
    },
    {
      field: "createdby",
      header: "Created By",
      datatype: "string",
    },
    {
      field: "txnstatus",
      header: "Status",
      datatype: "string",
      isfilter: true,
    },
    // { field: "deliverystatus", header: "Status", datatype: "string" },
  ] as any;
  tagTableConfig = {
    refresh: true,
    edit: false,
    view: true,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    loading: false,
    apisort: true,
    manualpagination: true,
    pagination: false,
    pageSize: 10,
    tabledownload: true,
    selection: true,
    title: "Data as on " + moment().format("DD-MMM-YYYY HH:mm:ss"),
    count: 0,
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  globalSearchModel = "";
  tableData = [];
  selectedRows = [];
  showUnread = true;
  isVisible = false;
  updateAlert = false;
  selectedData = {} as Record<string, any>;
  filterForm: FormGroup;
  notificationsList: any = [];
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["createddt", "desc"];
  reportdt = moment();
  showFilter = false;
  notificationStatus = AppConstant.TXNSTATUS;
  filterableValues = [];
  filteredValues = {};
  filterKey = "";
  viewTitle = "";
  showResolveModal = false;
  resolvedata = [];
  selectedValue: any;
  isdownload = false;
  bulkresolutionnotes = "";
  rulesList = [];
  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_RECORD_MANAGEMENT,
    } as any);
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      showall: [false],
      module: [null],
      severity: [null],
      startdt: [new Date()],
      enddt: [new Date()],
      type: [[]],
    });
    let assetParams = this.route.snapshot.queryParams;
    if (assetParams && assetParams.mode) {
      this.current = "list";
    }
    this.selectedValue = this.alertTypes.map((e) => {
      return e.value;
    });
    this.getAllNotifications();
    this.updateSubscription = interval(120000).subscribe((val) => {
      this.tagTableConfig.title =
        "Data as on " + moment().format("DD-MMM-YYYY HH:mm:ss");
      this.getAllNotifications();
    });
    this.getRules();
  }
  downloadCSV(data) {
    let hdr = [];
    _.map(this.tagTableHeader, (itm) => {
      hdr.push(itm.header);
    });
    console.log(hdr);
    var csv = Papa.unparse([[...hdr], ...data]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }
  getAllNotifications(limit?, offset?) {
    this.tagTableConfig.loading = true;

    let filters = this.filterForm.value;
    let reqObj: any = {
      tenantid: this.userstoragedata.tenantid,
    };
    if (!this.filterForm.value.showall) {
      reqObj["userids"] = this.userstoragedata.userid;
    }
    if (
      this.filterForm.value.type &&
      this.filterForm.value.type != null &&
      this.filterForm.value.type.length > 0
    ) {
      reqObj["txntypes"] = this.filterForm.value.type;
    }
    if (
      this.filteredValues["value"] &&
      this.filteredValues["value"].length > 0
    ) {
      const notificationValues = AppConstant.TXNSTATUS.map(e => e.value);
      this.filteredValues["value"].forEach(value => {
        if (notificationValues.includes(value)) {
          reqObj["notificationstatus"] = this.filteredValues[this.filterKey];
        } else {
          reqObj["configurations"] = this.filteredValues[this.filterKey];
        }
      });
    }
    if (this.searchText != null) {
      reqObj["searchText"] = this.searchText;
      reqObj["headers"] = [{ field: "title" }];
      reqObj["headers"] = [{ field: "eventtype" }];
    }
    let query = `count=${true}&limit=${
      limit ? limit : this.tagTableConfig.pageSize
    }&offset=${offset ? offset : 0}&order=${
      this.order ? this.order : ["createddt", "desc"]
    }`;

    if (filters.startdt) {
      reqObj["startdt"] = _.cloneDeep(filters.startdt);

      if (_.isDate(filters.startdt)) {
        let sDate: Date = _.cloneDeep(filters.startdt);
        sDate.setUTCHours(0);
        sDate.setUTCMinutes(0);
        sDate.setUTCSeconds(1);
        reqObj["startdt"] = sDate;
      }
    }
    if (filters.enddt) {
      reqObj["enddt"] = _.cloneDeep(filters.enddt);
      if (_.isDate(filters.enddt)) {
        let eDate: Date = _.cloneDeep(filters.enddt);
        eDate.setUTCHours(23);
        eDate.setUTCMinutes(59);
        eDate.setUTCSeconds(59);
        reqObj["enddt"] = eDate;
      }
    }
    if (this.isdownload) {
      reqObj["headers"] = this.tagTableHeader;
      let req = {
        module: "NOTIFICATIONS",
        payload: reqObj,
      };
      this.isdownload = false;
      this.tagTableConfig.loading = false;
      query = `order=${this.order ? this.order : ["createddt", "desc"]}`;
      this.notificationService.all(reqObj, query).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          let result = [];
          _.map(response.data, (m, idx: number) => {
            result.push([
              m.referenceno,
              m.title,
              moment(m.createddt).format("DD-MMM-YYYY HH:mm:ss"),
              m.createdby,
              m.txnstatus,
            ]);
            return m;
          });
          this.downloadCSV(result);
        }
      });
      // this.assetService.assetDownload(req).subscribe((result) => {
      //   let response = JSON.parse(result._body);
      //   if (response) {
      //     if(response.data && response.data.content){
      //       var buffer = Buffer.from(response.data.content.data);
      //       downloadService(
      //         buffer,
      //         "Notification" + "_" + moment().format("DD-MM-YYYY") + ".csv"
      //       );
      //     }
      //   }
      // });
    } else {
      this.notificationService.all(reqObj, query).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.tableData = [];
          this.tagTableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tagTableConfig.count =
            "Total Records" + ":" + " " + this.totalCount;
          this.tableData = response.data.rows;
          const checkbox = _.map(this.tableData, (d) => {
            d.disabled = d.txnstatus === "Resolved" ? true : false; //disable checkbox for resolved status
          });
          this.tagTableConfig.loading = false;
        } else {
          this.totalCount = 0;
          this.tableData = [];
          this.tagTableConfig.loading = false;
        }
      });
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
    } else if ("configuration" == value) {
      this.filterableValues = this.rulesList;
        this.filterableValues.filter((el) => {
          return el.value.includes(event);
        });
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllNotifications();
  }

  dataChanged(event) {
    if (event.pagination) {
      this.tagTableConfig.pageSize = event.pagination.limit;
      this.getAllNotifications(event.pagination.limit, event.pagination.offset);
    }
    if (event.searchText != "" && event.search) {
      this.searchText = event.searchText;
      this.getAllNotifications(this.tagTableConfig.pageSize, 0);
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getAllNotifications(this.tagTableConfig.pageSize, 0);
    }
    if (event.order) {
      this.order = event.order;
      let offset = (event.pageNo - 1) * 10;
      this.getAllNotifications(this.tagTableConfig.pageSize, offset);
    }
    if (event.order == null) {
      this.order = null;
    }
    if (event.refresh) {
      this.getAllNotifications(this.tagTableConfig.pageSize, 0);
    }

    if (event.delete) {
      // this.eventlogService.delete(event["data"]["id"]).subscribe((res) => {
      //   const response = JSON.parse(res._body);
      //   if (response.status) {
      //     this.getAllNotifications();
      //   } else {
      //     this.message.error("Failed to delete the record, try again later");
      //   }
      // });
    } else if (event.view) {
      this.selectedData = event.data;
      this.viewTitle = _.isNil(this.selectedData["referenceno"])
        ? "Details"
        : this.selectedData["referenceno"];
      this.selectedData["name"] =
        this.selectedData.name == ""
          ? this.selectedData["referenceno"]
          : this.selectedData.name;
      this.isVisible = true;
    }

    if (event.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = "value";
      console.log("");
      localStorage.setItem("fileterValue", event.data.field);
      if (event.data.field == "txnstatus") {
        this.filterableValues = AppConstant.TXNSTATUS;
      }
      if (event.data.field == "configuration") {
        this.filterableValues = this.rulesList;
      }
    }
    if (event.download) {
      this.isdownload = true;
      this.getAllNotifications();
    }
    if (event.rowselection) {
      this.selectedRows = event.data.filter((o) => o["checked"] == true);
    }
  }
  resolutionnotes = "";
  showResolution = false;

  getRules() {
    let data = {
      tenantid: this.userstoragedata.tenantid,
      lookupkey: "SYSTEM_RULES",
      status: AppConstant.STATUS.ACTIVE,
    }
    this.commonService
      .allSystemRules(data)
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if(response.status){
            this.rulesList = response.data.map((e)=>{
              return {
                title: e.keyname,
                value: e.keyvalue
              }
            })
          }else{
            this.filterableValues = [];
          }
        },
        (err) => {
          this.rulesList = [];
          console.log(err);
        }
      );
  }
  closeDrawer() {
    this.isVisible = false;
  }

  resolve() {
    this.showResolveModal = true;
  }
  btnLoading = false;
  bulkResolve() {
    this.btnLoading = true;
    if (this.bulkresolutionnotes === "") {
      this.message.error("Please enter notes");
      return;
    }
    if (this.selectedRows.length > 0 && this.selectedRows.length <= 25) {
      const referencenoList = this.selectedRows.map((row) => row.referenceno);

      const reqObj = {
        tenantid: this.userstoragedata.tenantid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        notes: this.bulkresolutionnotes,
        referenceno: referencenoList,
      };
      this.notificationService.bulkResolve(reqObj).subscribe(
        (result) => {
          this.bulkresolutionnotes = "";
          this.message.success("Successfully updated the alerts status");
          this.showResolveModal = false;
          this.btnLoading = false;
          this.getAllNotifications();
        },
        (err) => {
          this.btnLoading = false;
          this.message.error(
            "Unable to update the notification. Please try again later."
          );
        }
      );
    } else {
      this.message.error("Warning!!! Please select 25 notification at maximum");
    }
  }
}
