import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app/app.constant";
import * as _ from "lodash";
import * as moment from "moment";
import * as Apex from "apexcharts";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
} from "ng-apexcharts";

import { CommonService } from "../../../../modules/services/shared/common.service";
import { ServerUtilsService } from "../services/server-utils.service";
import { any } from "@amcharts/amcharts4/.internal/core/utils/Array";
import * as differenceInCalendarDays from "date-fns/difference_in_calendar_days";
import { RecommendationService } from "../recommendation/recommendation.service";
import { CostSetupService } from "../../assets/costsetup/costsetup.service";
import { ResizeRequestService } from "src/app/business/srm/upgrade-request/resize.service";
import { AssetUtilsService } from "../../assets/asset-Utils/asset-utils.service";

type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: any; // ApexTooltip;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: "app-server-detail-prediction",
  templateUrl:
    "../../../../presentation/web/base/server-utildetails/prediction.component.html",
})
export class ServerDetailPredictionComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() configs: {
    utiltype: string;
    utilkey: string;
    instanceid: number;
    date: string;
    tenantid: number;
    customerid: number;
    utilkeyTitle: string;
    disable: boolean;
  };
  @Input() headers: {
    utype: string;
    provider: string;
    customer: string;
    instance: string;
  };

  screens = [];
  pricings = [];
  appScreens = {} as any;
  userstoragedata: any = {};
  instanceObj: any = {};
  ruleObj: any = {};
  chartObj: any = {};
  utilizationDetailConfigs: any = {};
  adhocResize = false;
  selectedInstance: any = {};
  isVisible = false;
  isUtilVisible = false;
  showDetailedChart = false;
  isRulesVisible = false;
  isSchedulerVisible = false;
  formTitle = "Resize Request";
  @Output() scriptObj: any = {};
  disabled = true;
  chartDataList = [] as any;
  chartDataList2 = [] as any;
  listWeekCPU = [] as any;
  listWeekMem = [] as any;
  currentplan = "-";
  currentplancost: any = 0;
  currentplanccy = "";
  customername = "-";
  cloudprovider = "-";
  currentcustomerid = -1;
  avgCpuUtil = 0;
  avgMemUtil = 0;
  pricingModel = [];
  providerList: any = [];
  customerList: any = [];
  serverList: any = [];
  availableInstances = [];
  current = "CPU";
  filters = {
    daterange: [moment().subtract(30, "days").toDate(), new Date()],
    provider: "ECL2",
    customerid: -1,
    instanceid: -1,
    utilkey: ["CPU_UTIL", "MEM_USEPERCENT"],
  } as any;

  dataSet = [];
  recommendObj = {};
  scheduledObj: any = [];
  chartOptions = {
    series: [
      {
        name: "CPU Usage (%)",
        type: "column",
        data: [],
      },
      {
        name: "Memory Usage (%)",
        type: "line",
        data: [],
      },
    ],
    chart: {
      height: 350,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [0, 4],
    },
    title: {
      text: "Utilization",
      style: {
        color: "#f5f5f5",
      },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
    },
    labels: [],
    legend: {
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          " - <strong>" +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          "</strong>"
        );
      },
      labels: {
        colors: "#f5f5f5",
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: "#f5f5f5",
        },
      },
      // type: "datetime"
    },
    yaxis: [
      {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "CPU Usage (%)",
          style: {
            color: "#f5f5f5",
          },
        },
      },
      {
        opposite: true,
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "Memory Usage",
          style: {
            color: "#f5f5f5",
          },
        },
      },
    ],
    grid: {
      borderColor: "#f1f1f1",
    },
  };
  chartOptions2 = {
    series: [
      {
        name: "CPU Usage (%)",
        type: "column",
        data: [],
      },
      {
        name: "Memory Usage (%)",
        type: "line",
        data: [],
      },
    ],
    chart: {
      height: 350,
      type: "line",
    },
    stroke: {
      width: [0, 4],
    },
    title: {
      text: "Weekly Utilization",
      style: {
        color: "#f5f5f5",
      },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
    },
    labels: [],
    legend: {
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          " - <strong>" +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          "</strong>"
        );
      },
      labels: {
        colors: "#f5f5f5",
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: "#f5f5f5",
        },
      },
      //type: "datetime"
    },
    yaxis: [
      {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "CPU Usage (%)",
          style: {
            color: "#f5f5f5",
          },
        },
      },
      {
        opposite: true,
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "Memory Usage",
          style: {
            color: "#f5f5f5",
          },
        },
      },
    ],
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  currentConfigs = {} as any;
  recommendationList = [];

  today = new Date();
  loading = false;
  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  disabledDate = (current: Date): boolean => {
    // Can not select days befo re today and today
    return differenceInCalendarDays(current, this.today) > 0;
  };

  currentTab = 0;

  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private predictionService: RecommendationService,
    private costService: CostSetupService,
    private serverUtilsService: ServerUtilsService,
    private assetUtilService: AssetUtilsService,
    private costSetupService: CostSetupService,
    private messageService: NzMessageService,
    private resizeService: ResizeRequestService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.currentConfigs = this.serverUtilsService.getItems();
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.RECOMMENDATION,
    } as any);
    if (_.includes(this.appScreens.actions, "Request")) {
      this.disabled = false;
    }

    let c = this.configs;
    if (c && c.instanceid) {
      this.filters["instanceid"] = c.instanceid;
      this.instanceChanges();
    }
    if (c && c.customerid) {
      this.filters["customerid"] = c.customerid;
      this.customerChanges();
    }
    if (c && c.date) {
      this.filters["daterange"] = c.date;
    }
    this.getLookup();
    this.getPricing();
    this.getProviderList();
    this.getCustomerList();
  }
  ngAfterViewInit(): void {
    let dc = new Apex(document.getElementById("dailyChart"), this.chartOptions);
    dc.render();

    // let wc = new Apex(document.getElementById("weeklyChart"), this.chartOptions2);
    // wc.render();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("Changes to input config");
    console.log(changes);
    if (changes && changes.configs) {
      let c = changes.configs.currentValue;

      if (c.instanceid) {
        this.filters.instanceid = c.instanceid;
      }
      if (c.customerid) {
        this.filters["customerid"] = c.customerid;
        //  this.customerChanges();
      }
      if (c.date) {
        this.filters["daterange"] = c.date;
      }
      this.filters["provider"] = this.headers.provider || "ECL2";
      if (c.instanceid) {
        this.filters["instanceid"] = c.instanceid;
        // this.instanceChanges(); console.log("INSTANCE CHANBGES::::,", this.filters)
      }
      if (c.instancerefid) {
        this.filters.instancerefid = c.instancerefid;
      }
      this.filters.range = "7";
      this.filters.groupby = "daily";
      if (c.instanceid && c.customerid) {
        this.getInfluxData();
      }
    }
  }
  ngOnInit() {
    this.filters["daterange"] = [
      moment().subtract(30, "days").toDate(),
      new Date(),
    ];
    this.filters["provider"] = this.filters["provider"]
      ? this.filters["provider"]
      : "ECL2";
  }
  changeTab(index) {
    this.filters.range = index == 0 ? "7" : index == 1 ? "4" : "3";
    this.currentTab = index;
    this.getInfluxData();
  }
  addRequest(data, idx) {
    this.scriptObj = data;
    this.scriptObj.idx = idx;
    this.scriptObj.cloudprovider = this.cloudprovider;
    this.scriptObj.resourcetype = "ASSET_INSTANCE";
    this.scriptObj.resourceid = this.filters.instanceid;
    this.scriptObj.resourcerefid = this.instanceObj.instancerefid;
    this.scriptObj.customerid = this.currentcustomerid;
    this.isVisible = true;
  }
  notifyScriptEntry(data) {
    this.disabled = data.upgraderequestid ? true : false;
    this.isVisible = false;
    this.isSchedulerVisible = false;
    this.findSchedule(this.instanceObj.instanceid);
  }
  notifyAdhocEntry(val) {
    console.log(val);
    this.adhocResize = false;
  }
  notifyEntry(data) {
    this.isRulesVisible = false;
    this.isVisible = false;
    this.isUtilVisible = false;
  }
  closeDrillDown(data) {
    this.showDetailedChart = false;
  }
  onChanged(event) {
    this.isVisible = this.isSchedulerVisible = false;
    this.isRulesVisible = false;
    this.isUtilVisible = false;
    this.showDetailedChart = false;
  }
  showRule(data) {
    data.editDisabled = true;
    this.ruleObj = data;
    this.isRulesVisible = true;
  }
  notifyChartEntry(data) {
    this.currentConfigs = this.serverUtilsService.getItems();
    if (this.currentConfigs) {
      this.utilizationDetailConfigs = {
        utiltype: this.currentConfigs.utiltype,
        utilkey: this.currentConfigs.utilkey,
        instancerefid: this.currentConfigs.instancerefid,
        date: this.currentConfigs.date,
        tenantid: this.currentConfigs.tenantid,
        utilkeyTitle: this.currentConfigs.utilkeyTitle,
      };
    }
    this.showDetailedChart = true;
  }
  showChart() {
    let selectedIns = _.find(this.serverList, {
      instanceid: this.filters.instanceid,
    }) as any;
    if (selectedIns) this.chartObj.instancerefid = selectedIns.instancerefid;
    this.chartObj.utilkey = "CPU_UTIL";
    this.chartObj.customerid = this.filters.customerid;
    this.chartObj.provider = this.filters.provider;
    this.chartObj.daterange = [
      moment().subtract(30, "days").toDate(),
      new Date(),
    ];
    this.isUtilVisible = true;
  }
  getProviderList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = this.formArrayData(
            response.data,
            "keyname",
            "keyvalue"
          );
        } else {
          this.providerList = [];
        }
      });
  }
  getCustomerList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerList = response.data;
        if (this.customerList.length > 0) {
          this.filters.customerid =
            this.filters.customerid == -1
              ? this.customerList[0]["customerid"]
              : this.filters.customerid;
          this.customerChanges();
        }
      } else {
        this.customerList = [];
      }
      this.loading = false;
    });
  }

  getServerList() {
    this.serverList = [];
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (
      undefined != this.filters.customerid &&
      null != this.filters.customerid &&
      -1 != this.filters.customerid
    ) {
      condition.customerid = this.filters.customerid;
    }
    if (undefined != this.filters.provider && null != this.filters.provider) {
      condition.cloudprovider = this.filters.provider;
    }
    this.commonService.allInstances(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.serverList = response.data;
        if (this.serverList.length > 0 && this.filters.instanceid == -1) {
          this.filters.instanceid = this.serverList[0]["instanceid"];
        }
      } else {
        this.serverList = [];
      }
      this.loading = false;
    });
  }

  providerChanges() {
    this.serverList = [];
    if (!this.configs) {
      this.filters.instanceid = null;
    }
    this.getServerList();
  }
  customerChanges() {
    this.serverList = [];
    if (!this.configs) {
      this.filters.instanceid = null;
    }
    this.getServerList();
  }
  instanceChanges() {
    this.configs.instanceid = this.filters.instanceid;
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

  drawChart() {
    this.avgCpuUtil = 0;
    this.avgMemUtil = 0;

    if (this.chartDataList && this.chartDataList.length > 0) {
      let cpulist = [];
      let memlist = [];
      let fullcpulist = [];
      let fullmemlist = [];

      this.chartDataList.map((o) => {
        console.log(o);
        if (o.utilkey == "CPU_UTIL") {
          cpulist.push(parseFloat(o["value"]).toFixed(2));
          fullcpulist.push(o);
        }
        if (o.utilkey == "MEM_USEPERCENT") {
          memlist.push(parseFloat(o["value"]).toFixed(2));
          fullmemlist.push(o);
        }
      });

      if (cpulist.length > 0) {
        this.avgCpuUtil = _.sumBy(cpulist, function (o: any) {
          return Number(o);
        });
        this.avgCpuUtil = Number((this.avgCpuUtil / cpulist.length).toFixed(2));
      }
      if (memlist.length > 0) {
        this.avgMemUtil = _.sumBy(memlist, function (o: any) {
          return Number(o);
        });
        this.avgMemUtil = Number((this.avgMemUtil / memlist.length).toFixed(2));
      }

      this.chartOptions.series[0].data = cpulist;
      this.chartOptions.series[1].data = memlist;
      this.chartOptions.labels = (() => {
        if (this.currentTab == 0) {
          return fullcpulist.map((o) => moment(o["date"]).format("DD-MMM"));
        }
        if (this.currentTab == 1) {
          return this.chartDataList.map((o, index) => `Week ${index + 1}`);
        }
        if (this.currentTab == 2) {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return this.chartDataList.map((o, index) => months[o["month"] - 1]);
        }
      })();
      document.getElementById("dailyChart").innerHTML = "";
      let d = new Apex(
        document.getElementById("dailyChart"),
        this.chartOptions
      );
      d.render();
      // this.buildWeeklyChartData(fullcpulist, 'CPU_UTIL');
      // this.buildWeeklyChartData(fullmemlist, 'MEM_USEPERCENT');
      // setTimeout(() => {
      //     this.drawWeeklyChart();
      // }, 25);
    } else {
      this.chartOptions.series[0].data = [];
      this.chartOptions.series[1].data = [];
      document.getElementById("dailyChart").innerHTML = "";
      let d = new Apex(
        document.getElementById("dailyChart"),
        this.chartOptions
      );
      d.render();
    }
  }

  drawWeeklyChart() {
    console.log("listWeekCPU > ", this.listWeekCPU);
    console.log("listWeekMem > ", this.listWeekMem);
    if (this.listWeekCPU && this.listWeekCPU.length > 0) {
      this.chartOptions2.series[0].data = this.listWeekCPU.map((o) =>
        parseFloat(o["avg"]).toFixed(2)
      );
      this.chartOptions2.series[1].data = this.listWeekMem.map((o) =>
        parseFloat(o["avg"]).toFixed(2)
      );
      this.chartOptions2.labels = this.listWeekCPU.map(
        (o, i) => `Week ${i + 1}`
      );
      console.log(this.chartOptions2.labels);
      document.getElementById("weeklyChart").innerHTML = "";
      let d = new Apex(
        document.getElementById("weeklyChart"),
        this.chartOptions2
      );
      d.render();
    }
  }

  buildWeeklyChartData(inputList: any, inputtype: any) {
    _.map(inputList, function (item: any) {
      item.minvalue = Number(item.minvalue);
      item.maxvalue = Number(item.maxvalue);
      item.avgvalue = Number(item.avgvalue);
      item.date = moment(item.date).isoWeek();
      return item;
    });
    // Calculate the sums and group data (while tracking count)
    const reduced = inputList.reduce(function (m, d) {
      if (!m[d.date]) {
        m[d.date] = { ...d, count: 1 };
        return m;
      }
      m[d.date].minvalue += d.minvalue;
      m[d.date].maxvalue += d.maxvalue;
      m[d.date].avgvalue += d.avgvalue;
      m[d.date].count += 1;
      return m;
    }, {});

    // Create new array from grouped data and compute the average
    const result = Object.keys(reduced).map(function (k) {
      const item = reduced[k];
      return {
        date: item.date,
        min: (item.minvalue / item.count).toFixed(2),
        max: (item.maxvalue / item.count).toFixed(2),
        avg: (item.avgvalue / item.count).toFixed(2),
      };
    });

    if (inputtype == "CPU_UTIL") {
      this.listWeekCPU = result;
    } else {
      this.listWeekMem = result;
    }
  }

  getInfluxData() {
    this.loading = true;
    let selectedIns = _.find(this.serverList, {
      instanceid: this.filters.instanceid,
    }) as any;
    let condition = {
      startdate: new Date("2021-03-01"),
      enddate: new Date(),
      duration: "30d",
      tenantid: this.userstoragedata.tenantid,
      instancerefid: selectedIns ? selectedIns.instancerefid : null,
      utilkey: ["CPU_UTIL", "MEM_USEPERCENT"],
    } as any;
    this.filters.groupby =
      this.currentTab == 0
        ? "daily"
        : this.currentTab == 1
        ? "weekly"
        : "monthly";
    if (this.filters.groupby == "daily") {
      condition.duration = "1d";
      condition.startdate = moment()
        .subtract(this.filters.range, "d")
        .format("YYYY-MM-DD");
    }
    if (this.filters.groupby == "weekly") {
      condition.duration = "7d";
      condition.startdate = moment()
        .subtract(this.filters.range * 7, "d")
        .format("YYYY-MM-DD");
    }
    if (this.filters.groupby == "monthly") {
      condition.duration = "30d";
      condition.startdate = moment()
        .subtract(this.filters.range, "months")
        .format("YYYY-MM-DD");
    }
    this.assetUtilService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.chartDataList = [];
        response.data.forEach((element) => {
          if (element.mean) {
            element.date = new Date(element.time);
            element.value = element.value ? element.value : element.mean;
            if (element.date) {
              element.month = element.date.getMonth() + 1;
            }
            this.chartDataList.push(element);
            this.loading = false;
          }
        });
        if (this.filters.provider == "AWS") {
          this.getAWSRecommandations();
        } else {
          this.getRecommandations();
        }
        this.drawChart();
      } else {
        this.loading = false;
        this.chartDataList = [];
        this.drawChart();
      }
    });
  }
  getAWSRecommandations() {
    this.recommendationList = [];
    this.dataSet = [];
    this.currentplan = "-";
    this.currentplanccy = "-";
    this.currentplancost = 0;
    this.commonService
      .getInstance(this.filters.instanceid)
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        this.instanceObj = response.data;
        this.currentplan = response.data.instancetyperefid;
        this.currentcustomerid = response.data.customerid;
        this.cloudprovider = response.data.cloudprovider;
        let condition = {} as any;
        if (response) {
          condition = {
            status: AppConstant.STATUS.ACTIVE,
            cloudprovider: this.filters.provider,
            plantype: response.data.instancetyperefid,
            region: response.data.region,
            pricetype: response.data.lifecycle,
          };
          this.costService.all(condition).subscribe((data) => {
            let cost = JSON.parse(data._body);
            if (cost.data) {
              cost = cost.data[0];
              this.currentplanccy = cost["currency"];
              this.currentplancost =
                this.commonService.calculateRecommendationPrice(
                  cost["pricingmodel"],
                  cost["priceperunit"],
                  cost["currency"],
                  true
                );
              condition.plantype = cost.costvisualid;
              this.predictionService.all(condition).subscribe((data) => {
                const res = JSON.parse(data._body);
                if (res) {
                  let recommendations = res.data as object[];
                  this.recommendationList = recommendations;
                  this.formRecommendation(response);
                }
              });
            }
          });
        }
      });
  }
  getChartData() {
    if (this.filters.instanceid) {
      this.loading = true;
      this.chartDataList = [];
      let condition = {} as any;
      let startdate = this.filters.daterange
        ? this.filters.daterange[0]
        : moment().subtract(30, "days");
      let enddate = this.filters.daterange
        ? this.filters.daterange[1]
        : new Date();
      let selectedIns = _.find(this.serverList, {
        instanceid: this.filters.instanceid,
      }) as any;
      condition = {
        range: this.filters.range,
        groupby:
          this.currentTab == 0
            ? "daily"
            : this.currentTab == 1
            ? "weekly"
            : "monthly",
        //utiltype: this.current,
        instancerefid: selectedIns ? selectedIns.instancerefid : "",
        utilkey: [this.filters.utilkey],
        tenantid: this.userstoragedata.tenantid,
        detailed: "N",
      };
      if (this.filters.instancerefid) {
        condition.instancerefid = this.filters.instancerefid;
      }
      this.commonService.getServerUtil(condition).subscribe((data) => {
        const response = JSON.parse(data._body);
        // this.getRecommandations();
        if (response.status) {
          this.chartDataList = response.data;
          this.drawChart();
        } else {
          this.chartDataList = [];
          this.drawChart();
          console.log(response.data);
        }
        this.loading = false;
      });
    }
  }
  getLookup() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricings = response.data;
        } else {
          this.pricings = [];
        }
      });
  }

  formRecommendation(response) {
    let d = [];
    this.recommendationList.map((o) => {
      let rec = o;
      let currCostRecords =
        rec[`${response["data"]["cloudprovider"].toLowerCase()}currentplan`];
      let r1 =
        rec[
          `${response["data"]["cloudprovider"].toLowerCase()}recommendedplanone`
        ];
      let r2 =
        rec[
          `${response["data"]["cloudprovider"].toLowerCase()}recommendedplantwo`
        ];
      let r3 =
        rec[
          `${response["data"][
            "cloudprovider"
          ].toLowerCase()}recommendedplanthree`
        ];

      let currPlanType = response["data"]["costvisual"][0]["costvisualid"];

      let d1 = {
        ...o,
        ...response["data"],
        currplantype: currPlanType,
        textColor: "black",
        color: "lightgreen",
        name: r1
          ? response.data.cloudprovider == "AWS"
            ? r1["plantype"]
            : r1["instancetypename"]
          : null,
        price: null,
        index: Math.floor(Math.random() * 19999),
      };
      let d2 = {
        ...o,
        ...response["data"],
        textColor: "black",
        color: "coral",
        currplantype: currPlanType,
        name: r2
          ? response.data.cloudprovider == "AWS"
            ? r2["plantype"]
            : r2["instancetypename"]
          : null,
        price: null,
        index: Math.floor(Math.random() * 19999),
      };
      let d3 = {
        ...o,
        ...response["data"],
        color: "coral",
        textColor: "black",
        currplantype: currPlanType,
        name: r3
          ? response.data.cloudprovider == "AWS"
            ? r3["plantype"]
            : r3["instancetypename"]
          : null,
        price: null,
        index: Math.floor(Math.random() * 19999),
      };

      if (d1 && d1["name"] != null) {
        d.push(d1);
        this.getCostsofRecommendations(
          d1["index"],
          d1["name"],
          response["data"]["region"],
          response["data"]["cloudprovider"]
        );
      }
      if (d2 && d2["name"] != null) {
        d.push(d2);
        this.getCostsofRecommendations(
          d2["index"],
          d2["name"],
          response["data"]["region"],
          response["data"]["cloudprovider"]
        );
      }
      if (d3 && d3["name"] != null) {
        d.push(d3);
        this.getCostsofRecommendations(
          d3["index"],
          d3["name"],
          response["data"]["region"],
          response["data"]["cloudprovider"]
        );
      }
    });
    this.dataSet = d;

    if (this.avgCpuUtil > 0 && this.avgMemUtil > 0) {
      let recArray = [] as any;
      this.dataSet.forEach((element) => {
        if (
          element.cpuutilmin <= this.avgCpuUtil &&
          element.cpuutilmax >= this.avgCpuUtil
        ) {
          if (
            element.memutilmin <= this.avgMemUtil &&
            element.memutilmax >= this.avgMemUtil
          ) {
            recArray.push(element);
          }
        }
      });
      this.dataSet = _.uniqBy(recArray, function (e) {
        return e.name;
      });
    }
  }

  getRecommandations() {
    this.recommendationList = [];
    this.dataSet = [];
    this.currentplan = "-";
    this.currentplanccy = "-";
    this.currentplancost = 0;

    this.commonService
      .getInstance(this.filters.instanceid)
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        let condition = {} as any;
        condition = {
          status: AppConstant.STATUS.ACTIVE,
          cloudprovider: this.filters.provider,
        };
        if (response["data"]) {
          condition["plantype"] = response["data"]["instancetypeid"];
        }
        if (response.status) {
          this.instanceObj = response.data;
          this.currentplan = response.data.instancetyperefid;
          this.currentcustomerid = response.data.customerid;
          this.currentplanccy = response["data"]["costvisual"][0]["currency"];
          this.currentplancost =
            this.commonService.calculateRecommendationPrice(
              response["data"]["costvisual"][0]["pricingmodel"],
              response["data"]["costvisual"][0]["priceperunit"],
              response["data"]["costvisual"][0]["currency"],
              true
            );
          //this.filters.customerid = response.data.customerid;
          this.cloudprovider = response.data.cloudprovider;
          if (this.avgCpuUtil > 0 && this.avgMemUtil > 0) {
            this.predictionService.all(condition).subscribe((data) => {
              const res = JSON.parse(data._body);
              if (res.status) {
                let recommendations = res.data as object[];

                if (recommendations.length > 0) {
                  //recommendations = recommendations.filter(o => o['recommendationid'] == response['data']['recommendationid'])
                  this.recommendationList = recommendations;

                  this.currentplanccy =
                    response["data"]["costvisual"][0]["currency"];
                  this.currentplancost =
                    this.commonService.calculateRecommendationPrice(
                      response["data"]["costvisual"][0]["pricingmodel"],
                      response["data"]["costvisual"][0]["priceperunit"],
                      response["data"]["costvisual"][0]["currency"],
                      true
                    );
                  // this.currentplancost = this.commonService.getMonthlyPrice(this.pricings, response['data']['costvisual'][0]['pricingmodel'],
                  //     response['data']['costvisual'][0]['priceperunit'], response['data']['costvisual'][0]['currency'], true);
                  // this.currentplancost = parseFloat(response['data']['costvisual'][0]['priceperunit']) * moment().daysInMonth();
                  this.formRecommendation(response);
                }
              } else {
                this.recommendationList = [];
              }
            });
          }
          this.findSchedule(this.instanceObj.instanceid);

          this.getCostsofInstances(
            response["data"]["costvisual"][0]["plantype"],
            response["data"]["region"],
            response["data"]["cloudprovider"]
          );

          // if (response.data.cloudprovider == 'ECL2' && response.data.image.costvisual
          //     && response.data.image.costvisual.length > 0
          //     && response.data.image.costvisual[0].recommendation
          //     && response.data.image.costvisual[0].recommendation.length > 0) {
          //     this.currentplancost = this.commonService.getMonthlyPrice(this.pricingModel, response.data.image.costvisual[0].pricingmodel, response.data.image.costvisual[0].priceperunit, response.data.image.costvisual[0].currency, true);
          //     this.currentplanccy = response.data.image.costvisual[0].currency;
          //     this.recommendationList = response.data.image.costvisual[0].recommendation;
          // }
          // else if (response.data.cloudprovider == 'AWS' && response.data.awsimage.costvisual
          //     && response.data.awsimage.costvisual.length > 0
          //     && response.data.awsimage.costvisual[0].recommendation
          //     && response.data.awsimage.costvisual[0].recommendation.length > 0) {
          //     this.currentplancost = response.data.awsimage.costvisual[0].priceperunit;
          //     this.currentplanccy = response.data.awsimage.costvisual[0].currency;
          //     this.recommendationList = response.data.awsimage.costvisual[0].recommendation;
          // }
          // else {
          //     this.recommendationList = [];
          // }
          //console.log(this.recommendationList);
          // this.buildTableData();
        } else {
          console.log(response.data);
        }
      });
  }

  getCostsofRecommendations(
    refid: number,
    plantype: string,
    region: string,
    cloudprovider: string
  ) {
    let condition = {
      cloudprovider,
      region,
      plantype,
      resourcetype: "ASSET_INSTANCE",
      status: "Active",
    };
    this.costSetupService.all(condition).subscribe(
      (result) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          let arr = [...this.dataSet];

          let index = arr.findIndex((o) => o["index"] == refid);
          console.log("Calculate pricing ::::::::::::::");
          console.log(response);
          let price: any = 0;
          price = this.commonService.calculateRecommendationPrice(
            response.data[0]["pricingmodel"],
            response.data[0]["priceperunit"],
            response.data[0]["currency"],
            true
          );
          if (index != -1) {
            arr.splice(index, 1, {
              ...arr[index],
              upgradeplantype: response.data[0]["costvisualid"],
              price: this.commonService.calculateRecommendationPrice(
                response.data[0]["pricingmodel"],
                response.data[0]["priceperunit"],
                response.data[0]["currency"],
                false
              ),
              // price: response.data[0]['currency'] + " " + parseFloat(response.data[0]['priceperunit']) * moment().daysInMonth(),
              savings:
                response.data[0]["currency"] +
                " " +
                (this.currentplancost - price).toFixed(2),
              // savingspercentage: (((this.currentplancost - (parseFloat(response.data[0]['priceperunit']) * moment().daysInMonth())) / this.currentplancost) * 100).toFixed(2) + "%"
              savingspercentage:
                (
                  ((this.currentplancost - price) / this.currentplancost) *
                  100
                ).toFixed(2) + "%",
            });
            this.dataSet = [...arr];
            this.recommendObj = this.dataSet[0];
            console.log(this.dataSet);
          }
        } else {
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  findSchedule(id) {
    let obj = { resourceid: id, status: AppConstant.STATUS.ACTIVE } as any;
    this.resizeService.allSeduleRequest(obj).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.scheduledObj = response.data;
      } else {
        this.scheduledObj = [];
      }
    });
  }

  getCostsofInstances(plantype: string, region: string, cloudprovider: string) {
    let condition = {
      cloudprovider,
      region,
      resourcetype: "ASSET_INSTANCE",
      status: "Active",
    };
    this.costSetupService.all(condition).subscribe(
      (result) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          console.log("INSTANCE COST LISTS:::::::::::::");
          console.log(response.data);
          this.availableInstances = response.data;
        } else {
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  buildTableData() {
    this.dataSet = [];
    if (this.recommendationList.length > 0) {
      this.recommendationList.forEach((element, index) => {
        if (element.recommendedplan) {
          this.buildObject(element, element.recommendedplan, this.dataSet);
        }
        if (element.recommendedplanone) {
          this.buildObject(element, element.recommendedplanone, this.dataSet);
        }
        if (element.recommendedplantwo) {
          this.buildObject(element, element.recommendedplantwo, this.dataSet);
        }
        if (element.recommendedplanthree) {
          this.buildObject(element, element.recommendedplanthree, this.dataSet);
        }
      });
    }
  }

  buildObject(element: any, recommendedplan: any, dataSet: any) {
    let duplicate = _.find(this.dataSet, function (o) {
      return o.upgradeplantype == recommendedplan.costvisualid;
    });
    if (duplicate == undefined || duplicate == null) {
      let cost: any = this.commonService.calculateRecommendationPrice(
        recommendedplan.pricingmodel,
        recommendedplan.priceperunit,
        recommendedplan.currency,
        true
      );
      // let cost = this.commonService.getMonthlyPrice(this.pricingModel, recommendedplan.pricingmodel, recommendedplan.priceperunit, recommendedplan.currency, true);
      let savings =
        recommendedplan.currency + " " + (this.currentplancost - cost);
      let object: any = {
        disable: false,
        currplantype: element.plantype,
        upgradeplantype: recommendedplan.costvisualid,
        restartyn: element.restartyn,
        utilrangemin: element.cpuutilmin,
        utilrangemax: element.cpuutilmax,
        name: recommendedplan.plantype,
        price: recommendedplan.currency + " " + cost,
        savings: savings.length > 6 ? savings.slice(0, 7) : savings,
        color:
          (element.cpuutilmin <= this.avgCpuUtil &&
            element.cpuutilmax >= this.avgCpuUtil) ||
          (element.memutilmin <= this.avgMemUtil &&
            element.memutilmax >= this.avgMemUtil)
            ? "#7def7d"
            : "orange",
      };
      this.dataSet.push(object);
    }
  }

  getPricing() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricingModel = response.data;
        } else {
          this.pricingModel = [];
        }
      });
  }

  onClickAdhocResize() {
    this.selectedInstance = {
      ...this.instanceObj,
      tenantname: this.instanceObj.customer.tenant.tenantname,
      createddt: this.instanceObj.createddt,
      currentplan: this.currentplan,
      currentplanid: this.instanceObj.costvisual[0].costvisualid,
      currentplancost: this.currentplancost,
      currentplanccy: this.currentplanccy,
    };
    this.adhocResize = true;
  }
}
