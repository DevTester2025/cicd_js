import { Component, OnInit, ViewChild } from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { PrometheusService } from "src/app/business/base/prometheus.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexYAxis,
  ApexXAxis,
} from "ng-apexcharts";
import { NzMessageService } from "ng-zorro-antd";
import { EventLogService } from "../../base/eventlog/eventlog.service";
import { IncidentService } from "../customers/incidents.service";
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
};
@Component({
  selector: "app-sla-dashboard",
  styles: [
    `
      .ant-card-body {
        padding: 0px;
      }
      #eventdetail div {
        color: #fff;
        font-size: 13px;
        padding: 10px;
        font-family: "Open Sans", sans-serif;
      }
    `,
  ],
  templateUrl:
    "../../../presentation/web/tenant/sla-dashboard/sla-dashboard.component.html",
})
export class SLADashboardComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  id;
  chartType = "line";
  tabIndex = 0;
  totalCount;
  limit = 10;
  offset = 0;
  order = ["eventdate", "desc"];
  reqObj = {} as any;
  tableHeader = [
    {
      field: "date",
      header: "Timestamp",
      datatype: "string",
      isdefault: true,
      width: "15%",
    },
    {
      field: "severity",
      header: "Severity",
      datatype: "string",
      isdefault: true,
      isfilter: true,
      width: "10%",
    },
    {
      field: "particulars",
      header: "Details",
      datatype: "html",
      isdefault: true,
      width: "65%",
    },
  ];
  tableconfig = {
    edit: false,
    delete: false,
    view: false,
    tabledownload: false, //#OP_T620
    globalsearch: true,
    manualsearch: true,
    refresh: true,
    pagination: false,
    manualpagination: true,
    loading: false,
    pageSize: 10,
    title: "",
    linkasset: true,
    columnselection: true,
    apisort: true,
    count:null,
    widthConfig: ["15%", "10%", "65%"],
  };
  ticketstableconfig = {
    edit: true,
    delete: false,
    view: false,
    columnselection: true,
    tabledownload: false, //#OP_T620
    globalsearch: true,
    manualsearch: true,
    refresh: true,
    pagination: false,
    manualpagination: true,
    loading: false,
    pageSize: 10,
    title: "",
    linkasset: false,
    apisort: true,
    count:null,
    widthConfig: ["15%", "10%", "65%"],
  };
  selectedEvent = {} as any;
  public chartOptions: any;
  userstoragedata = {} as any;
  customerList = [{ customerid: -1, customername: "All" }];
  tagList = [];
  kpiSummary = [];
  filterForm: FormGroup;
  security = {
    label: "Security Alerts",
    value: 0,
    ref: 1,
    severity: AppConstant.ALERT_LEVELS.SECURITY,
  };
  system = {
    label: "System Alerts",
    value: 0,
    ref: 2,
    severity: AppConstant.ALERT_LEVELS.SYSTEM,
  };
  tickets = {
    label: "Tickets",
    value: 0,
    ref: 3,
    severity: [],
  };
  events = {
    label: "Events",
    value: 0,
    ref: 4,
    severity: AppConstant.ALERT_LEVELS.EVENTS,
  };
  ssl = {
    label: "SSL Alerts",
    value: 0,
    ref: 5,
    severity: AppConstant.ALERT_LEVELS.SSL,
  };
  synthetics = {
    label: "Synthetics Alerts",
    value: 0,
    ref: 6,
    severity: AppConstant.ALERT_LEVELS.SYNTHETICS,
  };

  selectedCard = { label: "Security Alerts", value: 0, ref: 1 };
  securityData = [];
  systemData = [];
  ticketData = [];
  eventData = [];
  sslData = [];
  syntheticsData = [];
  countData = [];
  detailList = [];
  isVisible = false;
  securityList = [];
  systemList = [];
  eventsList = [];
  ticketList = [];
  sslList = [];
  syntheticsList = [];
  isDownload = false;
  viewServerDetail = false;
  serverDetail = {} as any;
  xaxis = [];
  screens = [];
  appScreens = {} as any;
  download = false;

  editTicket = false;
  incidentObj = {};
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  systemSeverity = AppConstant.ALERT_LEVELS.SYSTEM;
  securityLevels = AppConstant.ALERT_LEVELS.SECURITY;
  priorities = AppConstant.ALERT_LEVELS.PRIORITY
  ticketsSeverity = [];
  loading = false;
  searchText = null;
  constructor(
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private commonService: CommonService,
    private prometheusService: PrometheusService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private eventlogService: EventLogService,
    private incidentService: IncidentService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    let screenAnalyser: any = AppConstant.SCREENCODES.OPS_ANALYSER;
    this.appScreens = _.find(this.screens, {
      screencode: screenAnalyser,
    });
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableconfig.tabledownload = true;
      this.ticketstableconfig.tabledownload = true;
      this.download = true; //#OP_T620
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableconfig.view = true;
    }
    this.getAllCustomers();
    this.getAllTags();
    this.getTSeverityList();
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      customerid: [-1],
      tagid: [null],
      tagvalue: [""],
      instanceid: [""],
      duration: [[moment().subtract(30, "days").toDate(), moment().toDate()]],
    });
    this.initChart();
  }
  resetData() {
    this.system.value = 0;
    this.events.value = 0;
    this.tickets.value = 0;
    this.security.value = 0;
    this.ssl.value = 0;
    this.synthetics.value = 0;
  }
  getTSeverityList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.TICKET_SEVERITY,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: -1,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.ticketsSeverity = response.data;
        this.tickets.severity = this.ticketsSeverity;
        this.loading = false;
        this.search();
      } else {
        this.ticketsSeverity = [];
        this.loading = false;
        this.search();
      }
    });
  }
  getAllCustomers() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerList = [...this.customerList, ...response.data];
      }
    });
  }
  getAllTags() {
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.tagList = response.data;
      } else {
        this.tagList = [];
      }
    });
  }
  search() {
    if (
      this.filterForm.value.duration[0] == null ||
      this.filterForm.value.duration[1] == null
    ) {
      this.message.success("Please select Date range");
      return false;
    }
    this.reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      filterby: [],
    } as any;
    let filters = this.filterForm.value;
    if (filters.customerid) {
      this.reqObj["customerid"] = filters.customerid;
    }
    if (filters.tagid) {
      this.reqObj["tagid"] = filters.tagid;
    }
    if (filters.tagvalue) {
      this.reqObj["tagvalue"] = filters.tagvalue;
    }
    if (filters.ticketno) {
      this.reqObj["ticketno"] = filters.ticketno;
    }
    if (filters.instanceid) {
      this.reqObj["instanceid"] = filters.instanceid;
    }
    if (filters.duration) {
      this.reqObj["startdate"] = moment(filters.duration[0]).format(
        "YYYY-MM-DD 00:00:00"
      );
      this.reqObj["enddate"] = moment(filters.duration[1]).format(
        "YYYY-MM-DD 23:59:59"
      );
    }
    Object.keys(this.filteredValues).forEach((val) =>
      this.reqObj["filterby"].push({
        key: val,
        value: this.filteredValues[val],
      })
    );
    if (this.isDownload) {
      this.getAllList();
    } else {
      this.getCount(this.reqObj);
      this.getDateWiseCount(this.reqObj);
      this.getAllList();
    }
  }
  getDateWiseCount(reqObj) {
    this.countData = [];
    this.prometheusService.getdatewisecount(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.countData = response.data;
        this.initChart();
      } else {
        this.initChart();
      }
    });
  }
  getCount(reqObj) {
    this.prometheusService.getcount(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.resetData();
      _.map(this.system.severity, (itm: any, i) => {
        itm.count = _.sumBy(response.data, (d: any) => {
          if (d.label == "system_alert" && d.severity == itm.title) {
            return d.value;
          }
        });
        itm.count = itm.count ? itm.count : 0;
        this.system.value = this.system.value + itm.count;
        return itm;
      });
      _.map(this.events.severity, (itm: any, i) => {
        itm.count = _.sumBy(response.data, (d: any) => {
          if (d.label == "events" && d.severity == itm.title) {
            return d.value;
          }
        });
        itm.count = itm.count ? itm.count : 0;
        this.events.value = this.events.value + itm.count;
        return itm;
      });
      _.map(this.tickets.severity, (itm: any, i) => {
        itm.count = _.sumBy(response.data, (d: any) => {
          if (d.label == "tickets" && d.severity == itm.keyname) {
            return d.value;
          }
        });
        itm.count = itm.count ? itm.count : 0;
        this.tickets.value = this.tickets.value + itm.count;
        return itm;
      });

      _.map(this.security.severity, (itm: any, i) => {
        itm.count = _.sumBy(response.data, (d: any) => {
          if (d.label == "security_alert" && d.severity == itm.title) {
            return d.value;
          }
        });
        itm.count = itm.count ? itm.count : 0;
        this.security.value = this.security.value + itm.count;
        return itm;
      });

      _.map(this.ssl.severity, (itm: any, i) => {
        itm.count = _.sumBy(response.data, (d: any) => {
          if (d.label == "ssl_alert" && d.severity == itm.title) {
            return d.value;
          }
        });
        itm.count = itm.count ? itm.count : 0;
        this.ssl.value = this.ssl.value + itm.count;
        return itm;
      });

      _.map(this.synthetics.severity, (itm: any, i) => {
        itm.count = _.sumBy(response.data, (d: any) => {
          if (d.label == "synthetics_alert" && d.severity == itm.title) {
            return d.value;
          }
        });
        itm.count = itm.count ? itm.count : 0;
        this.synthetics.value = this.synthetics.value + itm.count;
        return itm;
      });
    });
  }
  getAllList(event?, limit?, offset?) {
    let reqObj = _.clone(this.reqObj);
    reqObj.tab = this.tabIndex;
    this.tableconfig.loading = true;
    this.ticketstableconfig.loading = true;
    if (this.isDownload) {
      reqObj.download = true;
      reqObj.headers = [
        {
          field: "label",
          header: "Type",
          datatype: "string",
        },
        {
          field: "date",
          header: "Timestamp",
          datatype: "string",
        },
        { field: "severity", header: "Severity", datatype: "string" },
        { field: "particulars", header: "Particulars", datatype: "string" },
      ];
    }
    if (event && event.dataPoint) {
      let date = this.systemData[event.dataPoint][0];
      reqObj["startdate"] = moment(date).format("YYYY-MM-DD 00:00:00");
      reqObj["enddate"] = moment(date).format("YYYY-MM-DD 23:59:59");
    }
    this.securityList = [];
    this.systemList = [];
    this.eventsList = [];
    this.ticketList = [];
    this.sslList = [];
    this.syntheticsList = [];
    if (this.order && this.order != null) {
      reqObj["order"] = this.order;
    } else {
      reqObj["order"] = ["eventdate", "desc"];
    }
    if (this.searchText != null) {
      reqObj["searchText"] = this.searchText;
    }
    let query = `count=${true}&limit=${limit ? limit : this.tableconfig.pageSize}&offset=${
      offset ? offset : 0
    }&order=${this.order ? this.order : ""}`;

    this.prometheusService.getAllList(reqObj, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.tableconfig.loading = false;
      this.ticketstableconfig.loading = false;
      if (response.status) {
        this.totalCount = response.data.count;
        this.tableconfig.count = "Total Records"+":"+" "+ this.totalCount
        this.ticketstableconfig.count = "Total Records"+":"+" "+ this.totalCount
        let result = response.data.rows;
        if (this.totalCount > 0 && this.download) {
          //#OP_T620
          this.tableconfig.manualpagination = true;
          this.tableconfig.tabledownload = true;
          this.ticketstableconfig.manualpagination = true;
          this.ticketstableconfig.tabledownload = true;
        } else {
          this.tableconfig.manualpagination = false;
          this.tableconfig.tabledownload = false;
          this.ticketstableconfig.tabledownload = false;
          this.ticketstableconfig.manualpagination = false;
        }
        if (this.isDownload) {
          var buffer = Buffer.from(response.file.content.data);
          downloadService(
            buffer,
            "Summary_" + moment().format("DD-MM-YYYY") + ".csv"
          );
          this.isDownload = false;
        }

        if (this.tabIndex == 0) {
          this.tableHeader[2].datatype = "html";
          this.systemList = result;
        }
        if (this.tabIndex == 1) {
          this.tableHeader[2].datatype = "link";
          this.securityList = result;
        }
        if (this.tabIndex == 2) {
          this.sslList = result;
        }
        if (this.tabIndex == 3) {
          this.syntheticsList = result;
        }
        if (this.tabIndex == 4) {
          this.ticketList = result;
        }
        if (this.tabIndex == 5) {
          this.eventsList = result;
        }
      }
    });
  }
  initChart() {
    this.securityData = [];
    this.systemData = [];
    this.sslData = [];
    this.syntheticsData = [];
    this.eventData = [];
    this.ticketData = [];
    this.dateArrayFormat();
    this.chartOptions = {
      chart: {
        height: 350,
        type: this.chartType,
        zoom: {
          type: "xy",
        },
        events: {
          click: (event, chartContext, config) => {
            this.tabIndex = config.seriesIndex;
            this.getAllList({
              index: config.seriesIndex,
              dataPoint: config.dataPointIndex,
            });
          },
        },
      },
      stroke: {
        curve: "straight",
      },
      series: [
        {
          name: "System Alerts",
          data: this.systemData,
        },
        {
          name: "Security Alerts",
          data: this.securityData,
        },
        {
          name: "SSL Alerts",
          data: this.sslData,
        },
        {
          name: "Synthetics Alerts",
          data: this.syntheticsData,
        },
        {
          name: "Tickets",
          data: this.ticketData,
        },
        {
          name: "Events",
          data: this.eventData,
        },
      ],
      dataLabels: {
        enabled: true,
        style: {
          colors: [
            "#FFFFFF",
            "#FFFFFF",
            "#FFFFFF",
            "#FFFFFF",
            "#FFFFFF",
            "#FFFFFF",
          ],
        },
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: {
            colors: "#ffffff",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#ffffff",
          },
        },
      },
      legend: {
        position: "top",
        labels: {
          colors: "#f5f5f5",
        },
      },
      tooltip: {
        theme: "dark",
      },
      colors: [
        "#5072A7",
        "#46b65d",
        "#A45C40",
        "#C34A2C",
        "#cb9838",
        "#C86977",
      ],
    };
  }

  dateArrayFormat() {
    this.filterForm.updateValueAndValidity();
    let startdt = this.filterForm.value.duration[0];
    let enddt = this.filterForm.value.duration[1];
    let differnce = moment(enddt).diff(moment(startdt), "days");
    var i = 0;
    let baseval = startdt.getTime();
    while (i <= differnce) {
      var y = 0;
      this.xaxis[i] = baseval;
      this.securityData[i] = [this.xaxis[i], y];
      this.systemData[i] = [this.xaxis[i], y];
      this.eventData[i] = [this.xaxis[i], y];
      this.ticketData[i] = [this.xaxis[i], y];
      this.sslData[i] = [this.xaxis[i], y];
      this.syntheticsData[i] = [this.xaxis[i], y];

      _.map(this.countData, (itm) => {
        if (
          itm.label == "security_alert" &&
          moment(baseval).format("YYYY-MMM-DD") == itm.date
        ) {
          this.securityData[i] = [this.xaxis[i], itm.value];
        }
        if (
          itm.label == "system_alert" &&
          moment(baseval).format("YYYY-MMM-DD") == itm.date
        ) {
          this.systemData[i] = [this.xaxis[i], itm.value];
        }
        if (
          itm.label == "ssl_alert" &&
          moment(baseval).format("YYYY-MMM-DD") == itm.date
        ) {
          this.sslData[i] = [this.xaxis[i], itm.value];
        }
        if (
          itm.label == "synthetics_alert" &&
          moment(baseval).format("YYYY-MMM-DD") == itm.date
        ) {
          this.syntheticsData[i] = [this.xaxis[i], itm.value];
        }
        if (
          itm.label == "tickets" &&
          moment(baseval).format("YYYY-MMM-DD") == itm.date
        ) {
          this.ticketData[i] = [this.xaxis[i], itm.value];
        }
        if (
          itm.label == "events" &&
          moment(baseval).format("YYYY-MMM-DD") == itm.date
        ) {
          this.eventData[i] = [this.xaxis[i], itm.value];
        }
      });
      baseval += 86400000;
      i++;
    }
  }
  getFilterValue(event) {
    if(event){
        this.filterableValues = AppConstant.ALERT_LEVELS.SYSTEM
        this.filterableValues = this.systemSeverity.filter((el) => {
          return el.value.toLowerCase().includes(event);
        })
    }
  }
  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.search();
  }
  tabChange(event) {
    this.filterableValues = [];
    this.filteredValues = {};
    this.filterKey = null;
    this.tabIndex = event.index;
    this.reqObj.filterby = [];
    this.getAllList(event);
  }
  dataChanged(event) {
    if (event.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = "title";
      if (this.tabIndex == 0) {
        this.filterableValues = [...this.system.severity];
      }
      if (this.tabIndex == 1) {
        this.filterableValues = [...this.security.severity];
      }
      if (this.tabIndex == 2) {
        this.filterableValues = [...this.ssl.severity];
      }
      if (this.tabIndex == 3) {
        this.filterableValues = [...this.synthetics.severity];
      }
      if (this.tabIndex == 4) {
        this.filterKey = "keyname";
        this.filterableValues = [...this.tickets.severity];
      }
      if (this.tabIndex == 5) {
        this.filterableValues = [...this.events.severity];
      }
    }
    if (event.view) {
      this.selectedEvent = event.data;
      this.isVisible = true;
    }
    if (event.edit) {
      this.incidentService.byId(event.data.id).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.incidentObj = response.data;
          this.editTicket = true;
        }
      });
    }
    if (event.tabledownload) {
      this.isDownload = true;
      this.getAllList(this.reqObj);
    }
    if (event.toasset) {
      this.serverDetail.cloudprovider = event.data.cloudprovider;
      this.serverDetail.instanceref = event.data.providerrefid;
      this.serverDetail.instancereftype = "instancerefid";
      this.viewServerDetail = true;
    }
    if (event.order) {
      this.order = event.order;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
    if (event.order == null) {
      this.order = null;
    }
    if (event.pagination) {
      this.tableconfig.pageSize = event.pagination.limit
      this.getAllList(event, event.pagination.limit, event.pagination.offset);
    }
    if(event.refresh){
      this.searchText = null;
      this.reqObj.filterby = [];
      this.getAllList();
    }
    if (event.searchText != "") {
      this.searchText = event.searchText;
      if(event.search){
        this.getAllList(this.tableconfig.pageSize, 0);
        this.tableconfig.count = "Total Records"+":"+" "+ event.totalCount;
        this.ticketstableconfig.count = "Total Records"+":"+" "+ event.totalCount;
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
  }
  viewInstance(data) {
    if (data.label != "Tickets") {
      this.eventlogService.byId(data.id).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.selectedEvent = response.data;
          this.isVisible = true;
        }
      });
    } else {
      this.incidentService.byId(data.id).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.selectedEvent = response.data;
          this.selectedEvent.label = data.label;
          this.isVisible = true;
        }
      });
    }
  }
  closeDrawer() {
    this.id = null;
    this.selectedEvent = {};
    this.isVisible = false;
  }
  downloadCsv() {
    this.isDownload = true;
    this.search();
  }
  refresh() {
    this.searchText = null;
    this.getAllList();
  }
}
