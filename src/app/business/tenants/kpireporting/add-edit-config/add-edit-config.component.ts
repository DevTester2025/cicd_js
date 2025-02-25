import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ChartComponent
} from "ng-apexcharts";
import { AppConstant } from "src/app/app.constant";
import { AssetConstant } from "src/app/asset.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as moment from "moment";
import { IncidentService } from "../../customers/incidents.service";
import * as _ from "lodash";
import { KPIReportingService } from "../kpireporting.service";
import { EventLogService } from "../../../base/eventlog/eventlog.service";
import { NzMessageService } from "ng-zorro-antd";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import * as Papa from "papaparse";

@Component({
  selector: "app-add-edit-config",
  templateUrl:
    "../../../../presentation/web/tenant/kpireporting/add-edit-config/add-edit-config.component.html",
  styles: [
    `
      .ant-card {
        width: 100%;
        background: #1c2e3c;
        border: none;
      }
      .ant-card-head,
      .ant-card-head .ant-tabs-bar {
        border-bottom: none !important;
      }
      .ant-card-head-title {
        color: white !important;
      }
      .t-active {
        margin-left: 7px;
        padding: 3px 10px;
        border-radius: 100px;
        background: #ffeb3b;
        color: black;
        font-weight: 500;
        font-size: 13px;
      }
      /* .ant-tag .ant-tag-checkable {
          color: white !important;
        } */
      #grouptable th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }
      #grouptable td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #grouptable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      nz-select {
        width: 90%;
      }
    `,
  ],
})
export class AddEditConfigComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  loading = false;
  updating = false;
  reporttype;
  reportsettings = {};
  formobj = {
    selectedseries: null,
    seriesname: "Default",
    date: [
      moment().startOf("month").toDate(),
      moment().endOf("month").toDate(),
    ],
    duration: "Daily",
    groupby: "",
    charttype: "line",
    filters: {},
    settings: {},
    resourcetype: null,
    view: 'chart',
    currentTab: 0
  } as any;
  kpireporting = {
    reportname: "",
    description: "",
    tickets: {
      selectedseries: null,
      seriesname: "Default",
      date: [
        moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),
      ],
      duration: "Daily",
      groupby: "",
      charttype: "line",
      filters: {},
      settings: {},
      resourcetype: null,
      view: 'chart',
      currentTab: 0
    } as any,
    monitoring: {
      selectedseries: null,
      seriesname: "Default",
      date: [
        moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),
      ],
      duration: "Daily",
      groupby: "",
      charttype: "line",
      filters: {},
      settings: {},
      resourcetype: null,
      view: 'chart',
      currentTab: 0
    } as any,
    assets: {
      selectedseries: null,
      seriesname: "Default",
      date: [
        moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),
      ],
      duration: "Daily",
      groupby: "",
      charttype: "line",
      filters: {},
      settings: {},
      resourcetype: null,
      view: 'chart',
      currentTab: 0
    } as any,
    cmdb: {
      selectedseries: null,
      seriesname: "Default",
      date: [
        moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),
      ],
      duration: "Daily",
      groupby: "",
      charttype: "line",
      filters: {},
      settings: {},
      resourcetype: null,
      view: 'chart',
      currentTab: 0
    } as any,
  };
  chartType = "line";
  resourceTypes = [];
  chartTypes = AppConstant.CHART_TYPES;
  public ticketChartOptions: any;
  public monitoringChartOptions: any;
  public assetChartOptions: any;
  public cmdbChartOptions: any;

  ticketgroupAndFilterByOptions = AssetConstant.KPI.TICKETSGROUPANDFILTERS;
  assetgroupAndFilterByOptions = AssetConstant.KPI.ASSETGROUPANDFILTERS;
  monitoringgroupAndFilterByOptions = AssetConstant.KPI.MONITORGROUPANDFILTERS;
  cmdbGroupOptions = AssetConstant.KPI.CMDBGROUPANDFILTERS;
  userstoragedata: any;
  _confighdrid = null;
  kpireportObj: any = {};
  filters = {};
  xaxis = [];
  ticketsummary = [];
  monitoringsummary = [];
  assetsummary = [];
  cmdbsummary = [];
  ticketSeries = [];
  monitoringSeries = [];
  assetSeries = [];
  cmdbSeries = [];
  attributemenu = false;
  attributes = [];
  yaxisattributes = [];
  aggregations = [
    { title: "Max", value: "MAX" },
    { title: "Min", value: "MIN" },
    { title: "Avg", value: "AVG" },
    { title: "Sum", value: "Sum" },
    { title: "Count", value: "Count" },
  ];
  tableconfig = {
    edit: false,
    delete: false,
    showasset: false,
    globalsearch: false,
    pagination: true,
    loading: false,
    pageSize: 7,
    title: "",
    // widthConfig: ["25px", "25px"],
  };
  ticketHdr: any = AppConstant.TABLE_HEADERS.tickets;
  monitoringHdr: any = AppConstant.TABLE_HEADERS.monitoring;
  assetHdr: any = AppConstant.TABLE_HEADERS.assets;
  cmdbHdr: any = AppConstant.TABLE_HEADERS.cmdb;
  constructor(
    public router: Router,
    private routes: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private incidentService: IncidentService,
    private kpiReportingService: KPIReportingService,
    private eventLogService: EventLogService,
    private message: NzMessageService,
    private assetRecordService: AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getChartSeries("tickets", AppConstant.KPI_REPORING.TICKETS, []);
    this.getChartSeries("monitoring", AppConstant.KPI_REPORING.MONITORING, []);
    this.getChartSeries("assets", AppConstant.KPI_REPORING.ASSET, []);
    this.getChartSeries("cmdb", AppConstant.KPI_REPORING.CMDB, []);
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this._confighdrid = params.id;
        this.getReportConfig();
        this.getSeries();
      }
    });
  }

  ngOnInit() {
    if (this._confighdrid == null) {
      this.ticketgroupAndFilterByOptions = _.map(
        this.ticketgroupAndFilterByOptions,
        function (e) {
          e.selectedvalues = [];
          return e;
        }
      );
      this.monitoringgroupAndFilterByOptions = _.map(
        this.monitoringgroupAndFilterByOptions,
        function (e) {
          e.selectedvalues = [];
          return e;
        }
      );
      this.assetgroupAndFilterByOptions = _.map(
        this.assetgroupAndFilterByOptions,
        function (e) {
          e.selectedvalues = [];
          return e;
        }
      );
      this.cmdbGroupOptions = _.map(this.cmdbGroupOptions, function (e) {
        e.selectedvalues = [];
        return e;
      });
      this.getTickets();
      this.getMonitoring();
      this.getAssets();
      // this.getCMDB();
    }
    this.getResourceType();
  }

  prepareChartData(series, type?, xlabel?, ylabel?) {
    let obj = {} as any;
    if (type != "rangeBar") {
      obj = {
        series: series,
        chart: {
          type: type ? type : this.chartType,
          height: 380,
          width: "100%",
          zoom: {
            enabled: true,
            type: "xy",
          },
          parentHeightOffset: 0,
          redrawOnParentResize: true,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
          },
        },
        dataLabels: {
          enabled: false,
          style: {
            colors: ["#FFFFFF"],
          },
        },
        stroke: {
          show: true,
          width: 3,
          curve: "smooth",
        },
        xaxis: {
          type: "category",
          labels: {
            rotateAlways: true,
            hideOverlappingLabels: true,
            trim: true,
            style: {
              colors: "#ffffff",
            },
          },
          title: {
            text: xlabel,
            style: {
              color: "#ffffff",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#ffffff",
            },
          },
          title: {
            text: ylabel,
            style: {
              color: "#ffffff",
            },
          },
        },
        fill: {
          opacity: 1,
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        legend: {
          showForSingleSeries: true,
          showForNullSeries: false,
          position: "right",
          labels: {
            colors: "#f5f5f5",
          },
          formatter: function (seriesName, opts) {
            return [
              seriesName,
              " - ",
              _.sum(opts.w.globals.series[opts.seriesIndex]),
            ];
          },
        },
        tooltip: {
          theme: "dark",
          fixed: {
            enabled: true,
            position: "bottomLeft",
            offsetX: 0,
            offsetY: 0,
          },
        },
      };
    }
    if (type == "rangeBar") {
      let xaxiscount = 1200;
      series.map((o) => {
        xaxiscount = xaxiscount + o.data.length;
      });
      obj = {
        style: `{'height': ${xaxiscount}px}`,
        series: series,
        chart: {
          height: xaxiscount,
          type: "rangeBar",
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: "50%",
            rangeBarGroupRows: true,
          },
        },
        title: {
          text: '',
          align: "left",
        },
        colors: [
          "#008FFB",
          "#00E396",
          "#FEB019",
          "#FF4560",
          "#775DD0",
          "#3F51B5",
          "#546E7A",
          "#D4526E",
          "#8D5B4C",
          "#F86624",
          "#D7263D",
          "#1B998B",
          "#2E294E",
          "#F46036",
          "#E2C044",
        ],
        fill: {
          type: "solid",
        },
        xaxis: {
          type: "datetime",
          labels: {
            style: {
              colors: "#f5f5f5",
              cssClass: "apexcharts-xaxis-label",
            },
          }
        },
        yaxis: [
          {
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: "#ffffff",
            },
            labels: {
              style: {
                colors: "#ffffff",
              },
            },
            tooltip: {
              enabled: true,
            },
          },
        ],
        legend: {
          position: "bottom",
          labels: {
            colors: "#f5f5f5",
          },
        },
        tooltip: {
          theme: "dark",
          // custom: function (opts) {
          //   const fromYear = new Date(opts.y1).toISOString();
          //   const toYear = new Date(opts.y2).toISOString();
          //   var data = opts.w.globals.initialSeries[opts.seriesIndex];
          //   return (
          //     '<div class="apexcharts-tooltip-rangebar">' +
          //     '<div>' +
          //     data['data'][opts.dataPointIndex].x +
          //     "</div>" +
          //     '<div> <span class="category">' +
          //     (data.name ? data.name : "") +
          //     ' </span> <span class="value start-value">' +
          //     fromYear +
          //     '</span> <span class="separator">-</span> <span class="value end-value">' +
          //     toYear +
          //     "</span></div>" +
          //     "</div>"
          //   )
          // }
        },
      };
    }
    console.log(obj.tooltip);
    return obj;
  }

  getReportConfig() {
    this.kpiReportingService.byId(this._confighdrid).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.kpireportObj = response.data;
        this.kpireporting.reportname = this.kpireportObj.title;
        this.kpireporting.description = this.kpireportObj.description;
        this.getSeries();
      } else {
        this.kpireportObj = {};
        this.message.error(response.message);
      }
    });
  }

  getSeries() {
    this.ticketSeries = [];
    this.monitoringSeries = [];
    this.kpiReportingService
      .alldetails({
        _confighdrid: Number(this._confighdrid),
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.ticketSeries = _.filter(response.data, function (itm) {
            return itm.reporttype == AppConstant.KPI_REPORING.TICKETS;
          });
          if (this.ticketSeries && this.ticketSeries.length > 0) {
            this.formDetails(this.ticketSeries[0]);
          }
          this.monitoringSeries = _.filter(response.data, function (itm) {
            return itm.reporttype == AppConstant.KPI_REPORING.MONITORING;
          });
          if (this.monitoringSeries && this.monitoringSeries.length > 0) {
            this.formDetails(this.monitoringSeries[0]);
          }
          this.assetSeries = _.filter(response.data, function (itm) {
            return itm.reporttype == AppConstant.KPI_REPORING.ASSET;
          });
          if (this.assetSeries && this.assetSeries.length > 0) {
            this.formDetails(this.assetSeries[0]);
          }

          this.cmdbSeries = _.filter(response.data, function (itm) {
            return itm.reporttype == AppConstant.KPI_REPORING.CMDB;
          });
          if (this.cmdbSeries && this.cmdbSeries.length > 0) {
            this.formDetails(this.cmdbSeries[0]);
          }
        } else {
          this.ticketSeries = [];
          this.monitoringSeries = [];
        }
      });
  }

  refreshFilters(type) {
    if (type == AppConstant.KPI_REPORING.TICKETS) {
      this.ticketgroupAndFilterByOptions = _.map(
        this.ticketgroupAndFilterByOptions,
        function (e) {
          e.selectedvalues = [];
          return e;
        }
      );
    }
    if (type == AppConstant.KPI_REPORING.MONITORING) {
      this.monitoringgroupAndFilterByOptions = _.map(
        this.monitoringgroupAndFilterByOptions,
        function (e) {
          e.selectedvalues = [];
          return e;
        }
      );
    }
    if (type == AppConstant.KPI_REPORING.ASSET) {
      this.assetgroupAndFilterByOptions = _.map(
        this.assetgroupAndFilterByOptions,
        function (e) {
          e.selectedvalues = [];
          return e;
        }
      );
    }
    if (type == AppConstant.KPI_REPORING.CMDB) {
      this.cmdbGroupOptions = _.map(this.cmdbGroupOptions, function (e) {
        e.selectedvalues = [];
        return e;
      });
    }
  }

  formDetails(data) {
    let obj = {
      id: data.id,
      selectedseries: data,
      seriesname: data.seriesname,
      date: [new Date(data.startdate), new Date(data.enddate)],
      duration: data.duration,
      groupby: data.groupby,
      charttype: data.charttype ? data.charttype : this.chartType,
      settings: JSON.parse(data.settings),
      filters: JSON.parse(data.filterby),
      view: 'chart',
      currentTab: 0
    } as any;
    if (data.reporttype == AppConstant.KPI_REPORING.TICKETS) {
      this.kpireporting["tickets"] = {};
      this.kpireporting["tickets"] = _.clone(obj);
      this.refreshFilters(AppConstant.KPI_REPORING.TICKETS);
      this.getTickets();
    }
    if (data.reporttype == AppConstant.KPI_REPORING.MONITORING) {
      this.kpireporting["monitoring"] = {};
      this.kpireporting["monitoring"] = _.clone(obj);
      this.refreshFilters(AppConstant.KPI_REPORING.MONITORING);
      this.getMonitoring();
    }
    if (data.reporttype == AppConstant.KPI_REPORING.ASSET) {
      this.kpireporting["assets"] = {};
      this.kpireporting["assets"] = _.clone(obj);
      this.refreshFilters(AppConstant.KPI_REPORING.ASSET);
      this.getAssets();
    }
    if (data.reporttype == AppConstant.KPI_REPORING.CMDB) {
      this.refreshFilters(AppConstant.KPI_REPORING.CMDB);
      this.kpireporting["cmdb"] = {};
      obj.resourcetype =
        obj.filters && obj.filters.crn ? obj.filters.crn[0] : null;
      this.kpireporting["cmdb"] = _.clone(obj);
      this.getCMDB();
    }
  }

  addSeries(type) {
    if (type == AppConstant.KPI_REPORING.TICKETS) {
      this.kpireporting.tickets = _.clone(this.formobj);
      this.refreshFilters(AppConstant.KPI_REPORING.TICKETS);
      this.getTickets();
    }
    if (type == AppConstant.KPI_REPORING.MONITORING) {
      this.refreshFilters(AppConstant.KPI_REPORING.MONITORING);
      this.kpireporting.monitoring = _.clone(this.formobj);
      this.getMonitoring();
    }
    if (type == AppConstant.KPI_REPORING.ASSET) {
      this.refreshFilters(AppConstant.KPI_REPORING.ASSET);
      this.kpireporting.assets = _.clone(this.formobj);
      this.getAssets();
    }
    if (type == AppConstant.KPI_REPORING.CMDB) {
      this.refreshFilters(AppConstant.KPI_REPORING.CMDB);
      this.kpireporting.cmdb = _.clone(this.formobj);
      this.getChartSeries("cmdb", AppConstant.KPI_REPORING.CMDB, []);
      // this.getCMDB();
    }
  }

  dateArrayFormat(startdate, enddate, data, flag?) {
    let result = [];
    let duration;
    if (flag == AppConstant.KPI_REPORING.MONITORING)
      duration = this.kpireporting.monitoring.duration;
    if (flag == AppConstant.KPI_REPORING.TICKETS)
      duration = this.kpireporting.tickets.duration;
    if (flag == AppConstant.KPI_REPORING.ASSET)
      duration = this.kpireporting.assets.duration;
    if (flag == AppConstant.KPI_REPORING.CMDB)
      duration = this.kpireporting.cmdb.duration;

    if (duration == "Daily") {
      let startdt = startdate;
      let enddt = enddate;
      let differnce = moment(enddt).diff(moment(startdt), "days");
      var i = 0;
      let baseval = startdt.getTime();
      while (i <= differnce) {
        var y = 0;
        this.xaxis[i] = baseval;
        result[i] = { x: moment(baseval).format("DD-MMM-YYYY"), y: y };
        _.map(data, (itm) => {
          if (moment(baseval).format("DD-MMMM-YYYY") == itm.x) {
            result[i] = {
              x: moment(this.xaxis[i]).format("DD-MMM-YYYY"),
              y: itm.y,
            };
          }
        });
        baseval += 86400000;
        i++;
      }
      return result;
    } else {
      let details;
      if (flag == AppConstant.KPI_REPORING.MONITORING)
        details = this.monitoringsummary;
      if (flag == AppConstant.KPI_REPORING.TICKETS)
        details = this.ticketsummary;
      if (flag == AppConstant.KPI_REPORING.ASSET) details = this.assetsummary;
      if (flag == AppConstant.KPI_REPORING.CMDB) details = this.cmdbsummary;
      let xaxis = _.map(details, function (itm) {
        return itm.x;
      });
      xaxis = _.uniq(xaxis);
      for (let i = 0; i < xaxis.length; i++) {
        let y = _.find(data, function (el) {
          return el.x == xaxis[i] ? el.y : 0;
        });
        result.push({
          x: xaxis[i],
          y: y ? y.y : 0,
        });
      }
      return result;
    }
  }

  saveConfig() {
    if (
      this.kpireporting.reportname == "" ||
      this.kpireporting.reportname == null
    ) {
      this.message.error("Please enter the report name");
      return false;
    }

    let formdata = {
      tenantid: this.userstoragedata.tenantid,
      title: this.kpireporting.reportname,
      description: this.kpireporting.description,
      status: AppConstant.STATUS.ACTIVE,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    let configdetailobj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    let tickets = {
      reporttype: AppConstant.KPI_REPORING.TICKETS,
      seriesname: this.kpireporting.tickets.seriesname,
      startdate: moment(this.kpireporting.tickets.date[0]).format("YYYY-MM-DD"),
      enddate: moment(this.kpireporting.tickets.date[1]).format("YYYY-MM-DD"),
      duration: this.kpireporting.tickets.duration,
      groupby: this.kpireporting.tickets.groupby,
      filterby: JSON.stringify(this.kpireporting.tickets.filters),
      charttype: this.kpireporting.tickets.charttype,
      settings: !_.isEmpty(this.kpireporting.tickets.settings)
        ? JSON.stringify(this.kpireporting.tickets.settings)
        : null,
      ...configdetailobj,
    };
    let monitoring = {
      reporttype: AppConstant.KPI_REPORING.MONITORING,
      seriesname: this.kpireporting.monitoring.seriesname,
      startdate: moment(this.kpireporting.monitoring.date[0]).format(
        "YYYY-MM-DD"
      ),
      enddate: moment(this.kpireporting.monitoring.date[1]).format(
        "YYYY-MM-DD"
      ),
      duration: this.kpireporting.monitoring.duration,
      groupby: this.kpireporting.monitoring.groupby,
      charttype: this.kpireporting.monitoring.charttype,
      settings: !_.isEmpty(this.kpireporting.monitoring.settings)
        ? JSON.stringify(this.kpireporting.monitoring.settings)
        : null,
      filterby: JSON.stringify(this.kpireporting.monitoring.filters),
      ...configdetailobj,
    };
    let assets = {
      reporttype: AppConstant.KPI_REPORING.ASSET,
      seriesname: this.kpireporting.assets.seriesname,
      startdate: moment(this.kpireporting.assets.date[0]).format("YYYY-MM-DD"),
      enddate: moment(this.kpireporting.assets.date[1]).format("YYYY-MM-DD"),
      duration: this.kpireporting.assets.duration,
      groupby: this.kpireporting.assets.groupby,
      filterby: JSON.stringify(this.kpireporting.assets.filters),
      charttype: this.kpireporting.assets.charttype,
      settings: !_.isEmpty(this.kpireporting.assets.settings)
        ? JSON.stringify(this.kpireporting.assets.settings)
        : null,
      ...configdetailobj,
    };
    this.kpireporting.cmdb.filters['crn'] = [this.kpireporting.cmdb.resourcetype];
    let cmdb = {
      reporttype: AppConstant.KPI_REPORING.CMDB,
      seriesname: this.kpireporting.cmdb.seriesname,
      startdate: moment(this.kpireporting.cmdb.date[0]).format("YYYY-MM-DD"),
      enddate: moment(this.kpireporting.cmdb.date[1]).format("YYYY-MM-DD"),
      duration: this.kpireporting.cmdb.duration,
      groupby: this.kpireporting.cmdb.groupby,
      filterby: JSON.stringify(this.kpireporting.cmdb.filters),
      charttype: this.kpireporting.cmdb.charttype,
      settings: !_.isEmpty(this.kpireporting.cmdb.settings)
        ? JSON.stringify(this.kpireporting.cmdb.settings)
        : null,
      ...configdetailobj,
    };
    if (this._confighdrid != null) {
      if (this.kpireporting.tickets["id"] != null)
        tickets["id"] = this.kpireporting.tickets["id"];
      tickets["_confighdrid"] = Number(this._confighdrid);
      if (this.kpireporting.monitoring["id"] != null)
        monitoring["id"] = this.kpireporting.monitoring["id"];
      monitoring["_confighdrid"] = Number(this._confighdrid);
      if (this.kpireporting.assets["id"] != null)
        assets["id"] = this.kpireporting.assets["id"];
      assets["_confighdrid"] = Number(this._confighdrid);
      if (this.kpireporting.cmdb["id"] != null)
        cmdb["id"] = this.kpireporting.cmdb["id"];
      cmdb["_confighdrid"] = Number(this._confighdrid);
    }
    formdata["configdetail"] = [tickets, monitoring, assets, cmdb];
    if (this._confighdrid != null) {
      formdata["id"] = Number(this._confighdrid);
      formdata["lastupdateddt"] = new Date();
      formdata["lastupdatedby"] = this.userstoragedata.fullname;
      this.kpiReportingService.update(formdata).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getReportConfig();
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      this.kpiReportingService.create(formdata).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this._confighdrid = response.data.id;
          this.getReportConfig();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }

  getAssets() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      duration: this.kpireporting.assets.duration,
      startdt: moment(this.kpireporting.assets.date[0]).format("YYYY-MM-DD"),
      enddt: moment(this.kpireporting.assets.date[1]).format("YYYY-MM-DD"),
    };
    if (this.kpireporting.assets.groupby) {
      condition["groupby"] = this.kpireporting.assets.groupby;
    }
    if (!_.isEmpty(this.kpireporting.assets.filters)) {
      condition["filters"] = {};
      let self = this;
      _.map(this.kpireporting.assets.filters, function (value, key) {
        if ((!_.isEmpty(value) && value.value != "") || value.value != null) {
          let obj = {};
          obj[key] = _.map(value, function (i) {
            return i.value;
          });
          condition["filters"][key] = _.map(value, function (i) {
            return i.value;
          });
          let groupIndex = _.findIndex(self.assetgroupAndFilterByOptions, {
            value: key,
          });
          if (groupIndex != -1) {
            self.assetgroupAndFilterByOptions[groupIndex]["selectedvalues"] =
              value;
          }
        }
      });
    }
    this.commonService.instancechart(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.assetHdr = _.filter(AppConstant.TABLE_HEADERS.assets, function (i) { return i.show == true })
        this.assetsummary = response.data;
        this.getChartSeries(
          "assets",
          AppConstant.KPI_REPORING.ASSET,
          response.data
        );
      } else {
        this.getChartSeries("cmdb", AppConstant.KPI_REPORING.ASSET, []);
      }
    });
  }

  getCMDB() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      duration: this.kpireporting.cmdb.duration,
      startdt: moment(this.kpireporting.cmdb.date[0]).format("YYYY-MM-DD"),
      enddt: moment(this.kpireporting.cmdb.date[1]).format("YYYY-MM-DD"),
    };
    condition["filters"] = {};
    if (this.kpireporting.cmdb.groupby) {
      condition["groupby"] = this.kpireporting.cmdb.groupby;
    }
    if (this.kpireporting.cmdb.charttype) {
      condition["charttype"] = this.kpireporting.cmdb.charttype;
    }
    if (!_.isEmpty(this.kpireporting.cmdb.filters)) {
      condition["filters"] = {};
      let self = this;
      _.map(this.kpireporting.cmdb.filters, function (value, key) {
        if (key != "attribute") {
          if ((!_.isEmpty(value) && value.value != "") || value.value != null) {
            let obj = {};
            obj[key] = _.map(value, function (i) {
              return i.value;
            });
            condition["filters"][key] = _.map(value, function (i) {
              return i.value;
            });
            let groupIndex = _.findIndex(self.cmdbGroupOptions, {
              value: key,
            });
            if (groupIndex != -1) {
              self.cmdbGroupOptions[groupIndex]["selectedvalues"] = value;
            }
          }
        }
        if (key == 'attribute') {
          condition["attributes"] = value;
          let attributeIndex = _.findIndex(self.cmdbGroupOptions, { value: 'attribute' });
          self.cmdbGroupOptions[attributeIndex].selectedvalues = value;
          self.cmdbGroupOptions = [...self.cmdbGroupOptions];
        }

      });
    }
    condition["filters"]['crn'] = [this.kpireporting.cmdb.resourcetype];
    if (!_.isEmpty(this.kpireporting.cmdb.settings)) {
      condition["settings"] = this.kpireporting.cmdb.settings;
    }
    this.assetRecordService.getResourceKPI(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.cmdbHdr = _.filter(AppConstant.TABLE_HEADERS.cmdb, function (i) { return i.show == true })
        this.cmdbsummary = response.data;
        this.getChartSeries(
          "cmdb",
          AppConstant.KPI_REPORING.CMDB,
          response.data
        );
      } else {
        this.getChartSeries("cmdb", AppConstant.KPI_REPORING.CMDB, []);
      }
    });
  }

  getChartSeries(type, title, data) {
    let series = [
      {
        name: title,
        data: [],
      },
    ];
    if (data && data.length > 0) {
      if (
        this.kpireporting[type]["groupby"] != null &&
        this.kpireporting[type]["groupby"] != ""
      ) {
        series = [];
        let key = this.kpireporting[type]["groupby"];
        if (this.kpireporting[type]["groupby"] == "customerid")
          key = "customername";
        if (this.kpireporting[type].groupby == "_customer")
          key = "customername";
        if (this.kpireporting[type].groupby == "tagid") key = "tagname";
        let groupedItems = _.groupBy(data, key);
        let self = this;
        _.map(groupedItems, function (value, key) {
          if (self.kpireporting[type].groupby == "publishyn") {
            if (key == "Y") key = "Published";
            if (key == "N") key = "Not Published";
          }
          if (self.kpireporting[type].groupby == "level") {
            const selectedlevel = _.find(AppConstant.ALERT_LEVELS.LEVELS, {
              value: Number(key),
            });
            key = selectedlevel != undefined ? selectedlevel["title"] : "";
          }
          if (self.kpireporting[type].groupby == "crn") {
            _.map(value, function (e: any) {
              let resource = _.find(self.resourceTypes, { crn: e.crn });
              if (resource) {
                key = resource.resource;
              }
            });
          }
          series.push({
            name: key,
            data: self.dateArrayFormat(
              self.kpireporting[type].date[0],
              self.kpireporting[type].date[1],
              value,
              title
            ),
          });
        });
      } else {
        series = [
          {
            name: title,
            data: this.dateArrayFormat(
              this.kpireporting[type].date[0],
              this.kpireporting[type].date[1],
              data,
              title
            ),
          },
        ];
      }
    }

    if (title == AppConstant.KPI_REPORING.TICKETS) {
      this.ticketChartOptions = this.prepareChartData(
        series,
        this.kpireporting[type]["charttype"]
      );
      this.ticketChartOptions['tooltip'];
    }
    if (title == AppConstant.KPI_REPORING.MONITORING) {
      this.monitoringChartOptions = this.prepareChartData(
        series,
        this.kpireporting[type]["charttype"]
      );
      this.monitoringChartOptions['tooltip'];
    }
    if (title == AppConstant.KPI_REPORING.ASSET) {
      this.assetChartOptions = this.prepareChartData(
        series,
        this.kpireporting[type]["charttype"]
      );
      this.assetChartOptions['tooltip'];
    }
    if (title == AppConstant.KPI_REPORING.CMDB) {
      let array = [
        {
          name: "CMDB",
          data: [],
        },
      ] as any;
      if (this.kpireporting.cmdb.charttype != "rangeBar") {
        let details = [];
        if (
          this.kpireporting.cmdb.settings &&
          this.kpireporting.cmdb.settings.yaxisList
        ) {
          let resData = data;
          this.kpireporting.cmdb.settings.yaxisList.map((e, i) => {
            let obj = {
              name: e.seriesname,
              data: [],
            };
            resData.map((o) => {
              obj.data.push({
                x: (this.kpireporting.cmdb.settings.xaxis.fieldtype == 'REFERENCE') ? (JSON.parse(o.x)[0].name) : o.x,
                y: o[`y${i}`],
              });
            });
            details.push(obj);
          });
        }
        array = details;
        this.cmdbChartOptions = this.prepareChartData(
          array,
          this.kpireporting[type]["charttype"],
          this.kpireporting.cmdb.settings.xaxis
            ? this.kpireporting.cmdb.settings.xaxis.fieldname
            : ""
        );
        this.cmdbChartOptions['tooltip'];
      } else {
        let label1 = data.map((e) => {
          return e.label1;
        });
        let label2 = data.map((e) => {
          return e.label2;
        });

        let tasks = label1.concat(label2);
        tasks = _.uniq(tasks);
        let dataArr = tasks.map((e) => {
          return {
            name: e,
            data: [],
          };
        });

        let groupedProjects = _.groupBy(data, "x");

        _.map(groupedProjects, function (value, key) {
          let i = 0;
          value.map((e) => {
            let existlabel1 = _.findIndex(dataArr, { name: e.label1 });
            if (existlabel1 != -1) {
              if (value.length > 1 && i > 0) {
                let valIndex = i - 1;
                if (value[valIndex]["y1"] != null && e.y0 != null) {
                  dataArr[existlabel1].data.push({
                    x: key,
                    y: [
                      new Date(value[valIndex]["y1"]).getTime(),
                      new Date(e.y0).getTime(),
                    ],
                  });
                }
              } else {
                if (e.y0 != null) {
                  dataArr[existlabel1].data.push({
                    x: key,
                    y: [new Date(e.y0).getTime(), new Date(e.y0).getTime()],
                  });
                }
              }
            }

            let existlabel2 = _.findIndex(dataArr, { name: e.label2 });
            if (existlabel2 != -1) {
              if (e.y0 != null && e.y1 != null) {
                dataArr[existlabel2].data.push({
                  x: key,
                  y: [new Date(e.y0).getTime(), new Date(e.y1).getTime()],
                });
              }
            }
            i++;
          });
        });

        this.cmdbChartOptions = this.prepareChartData(dataArr, this.kpireporting[type]["charttype"])
      }
    }
  }

  getTickets() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      duration: this.kpireporting.tickets.duration,
      startdate: moment(this.kpireporting.tickets.date[0]).format("YYYY-MM-DD"),
      enddate: moment(this.kpireporting.tickets.date[1]).format("YYYY-MM-DD"),
    };
    if (this.kpireporting.tickets.groupby) {
      condition["groupby"] = this.kpireporting.tickets.groupby;
    }
    if (!_.isEmpty(this.kpireporting.tickets.filters)) {
      condition["filters"] = [];
      let self = this;
      _.map(this.kpireporting.tickets.filters, function (value, key) {
        if ((!_.isEmpty(value) && value.value != "") || value.value != null) {
          let obj = {};
          obj[key] = value;
          condition["filters"].push(obj);
          let groupIndex = _.findIndex(self.ticketgroupAndFilterByOptions, {
            value: key,
          });
          if (groupIndex != -1) {
            self.ticketgroupAndFilterByOptions[groupIndex]["selectedvalues"] =
              value;
          }
        }
      });
    }
    this.incidentService
      .all(condition, `?chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.ticketsummary = response.data;
          this.ticketHdr = _.filter(AppConstant.TABLE_HEADERS.tickets, function (i) { return i.show == true })
          this.getChartSeries(
            "tickets",
            AppConstant.KPI_REPORING.TICKETS,
            response.data
          );
        } else {
          this.getChartSeries("tickets", AppConstant.KPI_REPORING.TICKETS, []);
        }
      });
  }

  getMonitoring() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      duration: this.kpireporting.monitoring.duration,
      startdt: moment(this.kpireporting.monitoring.date[0]).format(
        "YYYY-MM-DD"
      ),
      enddt: moment(this.kpireporting.monitoring.date[1]).format("YYYY-MM-DD"),
    };
    if (this.kpireporting.monitoring.groupby) {
      condition["groupby"] = this.kpireporting.monitoring.groupby;
    }
    if (!_.isEmpty(this.kpireporting.monitoring.filters)) {
      condition["filters"] = [];
      let self = this;
      _.map(this.kpireporting.monitoring.filters, function (value, key) {
        if ((!_.isEmpty(value) && value.value != "") || value.value != null) {
          let obj = {};
          obj[key] = value;
          condition["filters"].push(obj);
          let groupIndex = _.findIndex(self.monitoringgroupAndFilterByOptions, {
            value: key,
          });
          if (groupIndex != -1) {
            self.monitoringgroupAndFilterByOptions[groupIndex][
              "selectedvalues"
            ] = value;
          }
        }
      });
    }
    this.eventLogService
      .all(condition, `chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.monitoringsummary = response.data;
          this.monitoringHdr = _.filter(AppConstant.TABLE_HEADERS.monitoring, function (i) { return i.show == true })
          this.getChartSeries(
            "monitoring",
            AppConstant.KPI_REPORING.MONITORING,
            response.data
          );
        } else {
          this.getChartSeries(
            "monitoring",
            AppConstant.KPI_REPORING.MONITORING,
            []
          );
        }
      });
  }

  close() {
    this.router.navigate(["kpi/reporting"]);
  }

  deleteSeries(type) {
    let id;
    switch (type) {
      case AppConstant.KPI_REPORING.TICKETS:
        id = this.kpireporting.tickets.selectedseries.id;
        break;
      case AppConstant.KPI_REPORING.MONITORING:
        id = this.kpireporting.monitoring.selectedseries.id;
        break;
      case AppConstant.KPI_REPORING.ASSET:
        id = this.kpireporting.tickets.asset.id;
        break;
      case AppConstant.KPI_REPORING.CMDB:
        id = this.kpireporting.cmdb.selectedseries.id;
        break;
    }
    this.kpiReportingService
      .updatedetails({
        id: id,
        status: AppConstant.STATUS.DELETED,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          if (type == AppConstant.KPI_REPORING.TICKETS) {
            _.remove(this.ticketSeries, function (i: any) {
              return i.id == id;
            });
            this.ticketSeries = [...this.ticketSeries];
            this.formDetails(this.ticketSeries[0]);
          }
          if (type == AppConstant.KPI_REPORING.MONITORING) {
            _.remove(this.monitoringSeries, function (i: any) {
              return i.id == id;
            });
            this.monitoringSeries = [...this.monitoringSeries];
            this.formDetails(this.monitoringSeries[0]);
          }
          if (type == AppConstant.KPI_REPORING.ASSET) {
            _.remove(this.assetSeries, function (i: any) {
              return i.id == id;
            });
            this.assetSeries = [...this.assetSeries];
            this.formDetails(this.assetSeries[0]);
          }
          if (type == AppConstant.KPI_REPORING.CMDB) {
            _.remove(this.cmdbSeries, function (i: any) {
              return i.id == id;
            });
            this.cmdbSeries = [...this.cmdbSeries];
            this.formDetails(this.cmdbSeries[0]);
          }
        } else {
          this.message.error(response.message);
        }
      });
  }

  getResourceType() {
    this.assetRecordService
      .getResourceTypes({
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response) {
          response = _.orderBy(response, ["resource"], ["asc"]);
          this.resourceTypes = response;
          this.kpireporting.cmdb.resourcetype = this.resourceTypes[0].crn;
        } else {
          this.resourceTypes = [];
        }
      });
  }

  applyTicketFilter(e) {
    this.kpireporting.tickets.filters = e;
    this.kpireporting.tickets.currentTab = 0;
    this.getTickets();
  }

  applyAssetFilter(e) {
    this.kpireporting.assets.filters = e;
    this.kpireporting.assets.currentTab = 0;
    this.getAssets();
  }
  applyMonitoringFilter(e) {
    this.kpireporting.monitoring.filters = e;
    this.kpireporting.monitoring.currentTab = 0;
    this.getMonitoring();
  }
  applyCMDBFilter(e) {
    this.kpireporting.cmdb.currentTab = 0;
    if (e.data && e.remove) {
      this.kpireporting.cmdb.filters = e.data;
    } else {
      if (e.data.attribute) this.kpireporting.cmdb.filters['attribute'] = e.data.attribute;
      if (e.data.tagid) this.kpireporting.cmdb.filters['tagid'] = e.data.tagid;
      if (e.data.tagvalue) this.kpireporting.cmdb.filters['tagvalue'] = e.data.tagvalue;
    }
    this.getCMDB();
  }
  applyFilter() {
    this.getCMDB();
    this.attributemenu = false;
  }

  applySettings(event) {
    if (event.reporttype == AppConstant.KPI_REPORING.TICKETS) {
      this.kpireporting.tickets.charttype = event.charttype;
      if (!_.isEmpty(event.settings)) {
        this.kpireporting.tickets.settings = event.settings;
        this.kpireporting.tickets.groupby = event.settings.groupby;
      }
      this.kpireporting.tickets.currentTab = 0;
      this.getTickets();
    }
    if (event.reporttype == AppConstant.KPI_REPORING.MONITORING) {
      this.kpireporting.monitoring.charttype = event.charttype;
      if (!_.isEmpty(event.settings)) {
        this.kpireporting.monitoring.settings = event.settings;
        this.kpireporting.monitoring.groupby = event.settings.groupby;
      }
      this.kpireporting.monitoring.currentTab = 0;
      this.getMonitoring();
    }
    if (event.reporttype == AppConstant.KPI_REPORING.ASSET) {
      this.kpireporting.assets.charttype = event.charttype;
      if (!_.isEmpty(event.settings)) {
        this.kpireporting.assets.settings = event.settings;
        this.kpireporting.assets.groupby = event.settings.groupby;
      }
      this.kpireporting.assets.currentTab = 0;
      this.getAssets();
    }
    if (event.reporttype == AppConstant.KPI_REPORING.CMDB) {
      this.kpireporting.cmdb.charttype = event.charttype;
      if (!_.isEmpty(event.settings)) {
        this.kpireporting.cmdb.settings = event.settings;
        this.kpireporting.cmdb.groupby = event.settings.groupby;
      }
      this.kpireporting.cmdb.currentTab = 0;
      this.getCMDB();
    }

    this.attributemenu = false;
  }

  onClickSettings(type, settings) {
    this.reporttype = type;
    this.reportsettings = settings;
    this.attributemenu = true;
  }
  changeTickettab(index, type) {
    this.kpireporting[type].currentTab = index;
    this.kpireporting[type].view = index == 0 ? 'chart' : 'list';
    let headers: any = _.clone(AppConstant.TABLE_HEADERS[type]);
    let key = this.kpireporting[type]["groupby"];
    if (this.kpireporting[type]["groupby"] == "customerid")
      key = "customername";
    if (key) {
      let group = _.findIndex(headers, { field: key });
      if (group != -1) {
        headers[group].show = true;
      }
    }
    this.ticketHdr = _.filter(headers, function (e) {
      if (e.field == 'x' || e.field == 'y' || e.field == key) {
        return e.show == true
      }
    });
  }

  onchangeMonitoring(index, type) {
    this.kpireporting[type].currentTab = index;
    this.kpireporting[type].view = index == 0 ? 'chart' : 'list';
    let headers: any = _.clone(AppConstant.TABLE_HEADERS[type]);
    let key = this.kpireporting[type]["groupby"];
    if (this.kpireporting[type].groupby == "_customer")
      key = "customername";
    if (key) {
      let group = _.findIndex(headers, { field: key });
      if (group != -1) {
        headers[group].show = true;
      }
    }
    this.monitoringHdr = _.filter(headers, function (e) {
      if (e.field == 'x' || e.field == 'y' || e.field == key) {
        return e.show == true
      }
    });
  }

  onchangeAssets(index, type) {
    this.kpireporting[type].currentTab = index;
    this.kpireporting[type].view = index == 0 ? 'chart' : 'list';
    let headers: any = _.clone(AppConstant.TABLE_HEADERS[type]);
    let key = this.kpireporting[type]["groupby"];
    if (this.kpireporting[type]["groupby"] == "customerid")
      key = "customername";
    if (key) {
      let group = _.findIndex(headers, { field: key });
      if (group != -1) {
        headers[group].show = true;
      }
    }
    this.assetHdr = _.filter(headers, function (e) {
      if (e.field == 'x' || e.field == 'y' || e.field == key) {
        return e.show == true
      }
    });
  }
  onchangeCMDB(index, type) {
    this.kpireporting[type].currentTab = index;
    this.kpireporting[type].view = index == 0 ? 'chart' : 'list';
    let headers: any = [];
    if (this.kpireporting.cmdb.settings) {
      headers.push({
        header: this.kpireporting.cmdb.settings.xaxis.fieldname,
        field: 'x',
        datatype: "string",
        show: true
      });
      this.kpireporting.cmdb.settings.yaxisList.map((o, i) => {
        headers.push({
          header: o.yaxis.fieldname + (o.aggregate ? ` (${o.aggregate})` : ''),
          field: `y${i}`,
          datatype: "string",
          show: true
        });
      })
    }
    this.cmdbHdr = headers
  }
  onchangeTimeseries(index, type) {
    this.kpireporting[type].currentTab = index;
    this.kpireporting[type].view = index == 0 ? 'chart' : 'list';
    let headers: any = [];
    if (this.kpireporting.cmdb.settings) {
      headers.push({
        header: this.kpireporting.cmdb.settings.yaxis.fieldname,
        field: 'x',
        datatype: "string",
        show: true
      });
      this.kpireporting.cmdb.settings.xaxisList.map((o, i) => {
        headers.push({
          header: o.xaxis.fieldname,
          field:  i == 0 ? 'timestart' : 'timeend',
          datatype: "timestamp",
          format: "dd-MMM-yyyy HH:mm:ss",
          show: true
        });
      })
      // Temp fix
      this.cmdbsummary = this.cmdbsummary.map((o) => {
        const fromDay = new Date(o['y0']).toISOString();
        const toDay = new Date(o['y1']).toISOString();
        const day1 = fromDay.substring(0, 10);
        const timestamp1 = fromDay.substring(11, 19);
        const day2 = toDay.substring(0, 10);
        const timestamp2 = toDay.substring(11, 19);
        o['timestart'] = moment(day1).format('DD-MMM-YYYY') + ' ' + timestamp1;
        o['timeend'] = moment(day2).format('DD-MMM-YYYY') + ' ' + timestamp2;
        return o;
      })
    }
    this.cmdbHdr = headers;
  }

  downloadCSV(type, hdr, detail) {
    let data: any = [];
    let csvheaders = _.map(hdr, function (o: any) { return o.header });
    let headers = _.map(hdr, function (o: any) { return o.field });
    _.map(detail, function (value) {
      let obj = [];
      headers.map((o) => {
        if (value[o] != undefined) {
          obj.push(value[o])
        } else {
          obj.push('')
        }
      })
      data.push(obj);
    })
    var csv = Papa.unparse([[...csvheaders], ...data]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", `${type}-${moment().format('DD-MMM-YYYY')}.csv`);
    tempLink.click();
  }
}
