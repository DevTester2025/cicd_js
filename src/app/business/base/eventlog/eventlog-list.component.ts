import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { EventLogService } from "./eventlog.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-cloudmatiq-eventlog-list",
  templateUrl:
    "../../../presentation/web/base/eventlog/eventlog-list.component.html",
  styles: [
    `
      #eventdetail div {
        color: #fff;
        font-size: 13px;
        padding: 10px;
        font-family: "Open Sans", sans-serif;
      }
    `,
  ],
})
export class EventLogListComponent implements OnInit {
  loading = true;
  logList = [];
  isVisible = false;
  selectedEvent = {} as any;
  tableHeader = [
    { field: "module", header: "Module", datatype: "string", isfilter: true, isdefault: true },
    { field: "eventtype", header: "Event Type", datatype: "string", isdefault: true },
    {
      field: "eventdate",
      header: "Event Date",
      datatype: "date",
      format: "dd-MMM-yyyy",
      isdefault: true,
    },
    { field: "severity", header: "Severity", datatype: "string", isfilter: true, isdefault: true },
    { field: "createdby", header: "Created by", datatype: "string", isdefault: true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy HH:mm:ss",
      isdefault: true,
    },
  ];
  tableConfig = {
    edit: false,
    delete: false,
    view: false, //#OP_T620
    globalsearch: true,
    manualsearch: true,
    manualpagination: true,
    pagination: false,
    refresh: true,
    loading: false,
    count: null,
    columnselection: true,
    pageSize: 10,
    tabledownload: false,
    apisort: true,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"],
  };
  //#OP_768
  moduleList = AppConstant.MODULES_LIST; //#OP_768
  severityList = AppConstant.SYSTEM; //#OP_768
  filterForm: FormGroup;
  screens = [];
  appScreens = {} as any;
  totalCount;
  limit = 10;
  offset = 0;
  selectedcolumns = [] as any;
  searchText = null;
  order = ["createddt", "desc"];
  editReferences = false;
  reference = "";
  referencesList = [];
  filterableValues = {};
  filteredValues = {};
  filterKey = "";
  showFilter = false; //#OP_T768
  additionalParams = {};
  isdownload = false;

  constructor(
    private localStorageService: LocalStorageService,
    private eventlogService: EventLogService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private route: ActivatedRoute
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.EVENTLOG,
    } as any);
    //#OP_T620
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }
  ngOnInit() {
    this.filterForm = this.fb.group({
      module: [null],
      severity: [null],
      startdt: [new Date(new Date().setDate(new Date().getDate() - 28))],
      enddt: [new Date()],
    });
    this.route.queryParams.subscribe((params) => {
      if (params["module"]) {
        this.filterForm.patchValue({
          module: params["module"],
        });
      }
      if (params["ref"]) {
        this.additionalParams = {
          providerrefid: params["ref"],
        };
      }
      this.getEventsList();
    });
  }

  getEventsList(limit?, offset?) {

    try {
      this.tableConfig.loading = true;
      let reqObj = {
        tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
        ],
        status: AppConstant.STATUS.ACTIVE,
      };
      if (this.searchText != null) {
        reqObj["searchText"] = this.searchText;
      }

      let filters = this.filterForm.value;

      if (filters.startdt) {
        reqObj["startdt"] = filters.startdt;
      }
      if (filters.enddt) {
        reqObj["enddt"] = filters.enddt;
      }
      // if (filters.module) {
      //   reqObj["module"] = filters.module;
      // }
      // if (filters.severity) {
      //   reqObj["severity"] = filters.severity;
      // }
      if (this.additionalParams) {
        reqObj = {
          ...reqObj,
          ...this.additionalParams,
        };
      }

      //#OP_768
      if (this.filteredValues["value"] && Array.isArray(this.filteredValues["value"]) && this.filteredValues["value"].length > 0) {
        const moduleValues = AppConstant.MODULES_LIST.map(module => module.value);

        this.filteredValues["value"].forEach(value => {
          if (moduleValues.includes(value)) {
            reqObj["modules"] = this.filteredValues[this.filterKey];
          } else {
            reqObj["severities"] = this.filteredValues[this.filterKey];
          }
        });
      }

      if (this.order && this.order != null) {
        reqObj["order"] = this.order;
      } else {
        reqObj["order"] = ["createddt", "DESC"];
      }

      let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      reqObj["headers"] = this.selectedcolumns;
    } else {
      query = `count=${true}&limit=${limit || this.tableConfig.pageSize}&offset=${offset || 0}`;
    }


      this.eventlogService.all(reqObj, query).subscribe((res) => {

        const response = JSON.parse(res._body);
        if (response.status) {
          if (this.isdownload) {
            this.loading = false;
            this.isdownload = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(buffer, "EventLog.xlsx");
          } else {
          this.tableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
          this.logList = response.data.rows;
          this.loading = false;
        } }else {
          this.totalCount = 0;
          this.loading = false;
          this.logList = [];
        }
        this.tableConfig.loading = false;
      });
    } catch (error) {
      this.totalCount = 0;
      this.logList = [];
      this.tableConfig.loading = false;
      console.log("Something went wrong", error);
    }

  }
  //#OP_768

  getFilterValue(event) {
    let value = localStorage.getItem("fileterValue")
    if ("module" == value) {
      if (event) {
        this.filterableValues = AppConstant.MODULES_LIST;
        this.filterableValues = this.moduleList.filter((el) => {
          return el.value.toLowerCase().includes(event);
        })
      } else {
        this.filterableValues = this.moduleList;
      }
    } else {
      this.filterableValues = AppConstant.SYSTEM;
      this.filterableValues = this.severityList.filter((el) => {
        return el.value.toLowerCase().includes(event);
      })
    }
  }
  //#OP_768
  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getEventsList();
  }

  dataChanged(event) {
    //#OP_768
    if (event.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = 'value';

      localStorage.setItem("fileterValue", event.data.field);
      if (event.data.field == 'module') {
        this.filterableValues = AppConstant.MODULES_LIST;
      } else {
        this.filterableValues = AppConstant.SYSTEM;
      }
    }
    //#OP_768
    if (event.delete) {
      this.eventlogService.delete(event["data"]["id"]).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.getEventsList();
        } else {
          this.message.error("Failed to delete the record, try again later");
        }
      });
    } else if (event.view) {
      this.selectedEvent = event.data;
      if (event.data && event.data.references) {
        this.referencesList = JSON.parse(event.data.references);
      } else {
        this.referencesList = [];
      }
      this.isVisible = true;
    }
    if (event.pagination) {
      this.tableConfig.pageSize = event.pagination.limit;
      this.getEventsList(event.pagination.limit, event.pagination.offset);
    }
    if (event.searchText != "") {
      this.searchText = event.searchText;
      if (event.search) {
        this.getEventsList(this.tableConfig.pageSize, 0);
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getEventsList(this.tableConfig.pageSize, 0);
    }
    if (event.order) {
      this.order = event.order;
      this.getEventsList(this.tableConfig.pageSize, 0);
    }
    if (event.order == null) {
      this.order = null;
    }
    if (event.refresh) {
      this.filteredValues = {};
      this.filterForm.reset();
      this.getEventsList();
    }
    if (event.download) {
      this.isdownload = true;
      this.getEventsList(this.tableConfig.pageSize, 0);
    }
  }
  closeDrawer() {
    this.isVisible = false;
  }

  async updateEventLog() {
    this.eventlogService
      .update({
        id: this.selectedEvent.id,
        references: JSON.stringify(this.referencesList),
      })
      .subscribe(
        (res) => {
          console.log("References attached >>>>");
        },
        (err) => {
          console.log("Error attaching references >>>>");
          console.log(err);
        }
      );
  }

  openURL(url: string) {
    window.open(url, "_blank");
  }

}
