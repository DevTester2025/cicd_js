import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { CostSetupService } from "../../../../base/assets/costsetup/costsetup.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { BudgetService } from "../../budget/budget.service";
import { TagService } from "../../../tagmanager/tags.service";
import * as Apex from "apexcharts";
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTitleSubtitle,
  ApexGrid,
} from "ng-apexcharts";
import * as moment from "moment";
type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis | ApexYAxis[];
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: any;
  stroke: ApexStroke;
  legend: ApexLegend;
  markers: any; //ApexMarkers;
  title: ApexTitleSubtitle;
  grid: ApexGrid;
};
@Component({
  selector: "app-budgetsummary",
  templateUrl:
    "../../../../../presentation/web/base/assets/budget/budgetsummary/budgetsummary.component.html",
})
export class BudgetsummaryComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() budgetObj;
  @Input() budgetFormObj;
  @Input() isPreview = false;
  @ViewChild("chart") chart: ChartComponent;
  userstoragedata = {} as any;
  showSummaryDtl = false;
  showDrillDownDetail = false;
  selectedMonth;
  summaryObj: any = {};
  billingSummary: any = [];
  billingList: any = [];
  loading = false;
  formTitle = "Update Budget";
  showSidebar = false;
  tableHeader = [
    { field: "monthname", header: "Month", datatype: "string" },
    {
      field: "budgetamount",
      header: "Budget",
      datatype: "currency",
      format: "currency",
    },
    {
      field: "amount",
      header: "Bill Amount",
      datatype: "currency",
      format: "currency",
    },
    {
      field: "diffamount",
      header: "Diff. Amount",
      datatype: "currency",
      format: "currency",
    },
    { field: "diffpercentage", header: "Diff. Percentage", datatype: "string" },
  ];
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: true,
    clone: false,
    pageSize: 5,
    // scroll: { x: '1000px' },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px"],
  };
  startdt = null;
  enddt = null;
  budgetamount = null;
  actamt = null;
  cloudprovider = null;
  customername = null;
  resourcetype = null;
  assettyype = null;
  instancenames = [];
  tagid = null;
  tagvalue = null;
  billvalues = [];
  public chartOptions: Partial<ChartOptions>;
  public linechartOptions: Partial<ChartOptions>;
  listType = "card";
  currentTab = 0;
  instanceList: any = [];
  tagList: any = [];
  assetTypes = [
    { title: "Server", value: "ASSET_INSTANCE" },
    { title: "Network", value: "ASSET_NETWORK" },
    { title: "Load Balancer", value: "ASSET_LB" },
    { title: "Firewall", value: "ASSET_FIREWALL" },
    { title: "Internet Gateway", value: "ASSET_IG" },
    { title: "CFG", value: "ASSET_CFG" },
    { title: "Volume", value: "ASSET_VOLUME" },
  ];

  ddoptions: {
    startdate: string;
    enddate: string;
    resourcetype: string;
    filters: { cloudprovider: string };
  } = null;

  constructor(
    private costSetupService: CostSetupService,
    private commonService: CommonService,
    private tagService: TagService,
    private localStorageService: LocalStorageService,
    private budgetService: BudgetService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.initChart();
  }
  ngAfterViewInit(): void {
    // let dc = new Apex(document.getElementById("dailyChart"), this.chartOptions);
    // dc.render();
    // let wc = new Apex(document.getElementById("weeklyChart"), this.chartOptions2);
    // wc.render();
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["budgetObj"] && changes.budgetObj.currentValue) {
      this.budgetObj = changes.budgetObj.currentValue.data;
      console.log("Budget object changes >>>>>>>");
      console.log(changes.budgetObj.currentValue.data);
      if (!_.isUndefined(this.budgetObj)) {
        this.checkBudgetObj();
        // this.getServerList();
        // this.getAllTags();
        if (this.currentTab !== 2) {
          this.initChart();
          // document.getElementById("dailyChart").innerHTML = "";
          // let d = new Apex(
          //   document.getElementById("dailyChart"),
          //   this.chartOptions
          // );
          // d.render();
        }

        // this.getBillingList();
        this.getAllBillingSummary();
      }
      this.initChart();
    }
    if (changes.budgetFormObj && changes.budgetFormObj.currentValue) {
      console.log("Budget form object changes >>>>>>>");
      console.log(changes.budgetFormObj.currentValue);
      this.initChart();
      this.budgetObj = changes.budgetFormObj.currentValue;
      this.budgetObj.startdt = moment(this.budgetObj.startdt).format(
        "YYYY-MM-DD"
      );
      this.budgetObj.budgetamount =
        typeof this.budgetObj.budgetamount == "number"
          ? this.budgetObj.budgetamount
          : Number(this.budgetObj.budgetamount.replaceAll(",", ""));
      this.budgetObj.enddt = moment(this.budgetObj.enddt).format("YYYY-MM-DD");
      this.checkBudgetObj();
      this.getAllBillingSummary();
    }
  }
  moveToBudgetSummaryDetails(e: any, chart, options) {
    if (!this.isPreview) {
      const date = this.billingSummary.map((o) => o["monthname"])[
        options["dataPointIndex"]
      ];
      this.summaryObj = this.billingSummary[options["dataPointIndex"]];
      this.summaryObj.cloudprovider = this.budgetObj.cloudprovider;
      this.summaryObj.customerid = this.budgetObj.customerid;
      if (this.customername) {
        this.summaryObj.customername = this.customername;
      }
      if (this.tagid) {
        this.summaryObj.tagid = this.tagid;
      }
      if (this.tagvalue) {
        this.summaryObj.tagvalue = this.tagvalue;
      }
      if (this.resourcetype) {
        this.summaryObj.resourcetype = this.resourcetype;
      }
      if (this.instancenames) {
        this.summaryObj.instancenames = this.instancenames;
      }
      this.selectedMonth = date;
      this.showSummaryDtl = true;
    }
  }
  getSummaryStyles(data) {
    let myStyles = {
      "background-color": null,
    };
    if (data.diffpercentage < 0 || data.diffpercentage == 0) {
      myStyles["background-color"] = "rgb(253 163 156 / 38%)";
    } else if (data.diffpercentage > 10) {
      myStyles["background-color"] = "rgb(156 253 172 / 39%)";
    } else if (data.diffpercentage > 0 && data.diffpercentage < 10) {
      myStyles["background-color"] = "rgb(251 236 51 / 36%)";
    }
    return myStyles;
  }
  checkBudgetObj() {
    this.startdt = this.budgetObj.startdt;
    this.enddt = this.budgetObj.enddt;
    this.cloudprovider = this.budgetObj.cloudprovider;
    this.customername = this.budgetObj.customer
      ? this.budgetObj.customer.customername
      : "";
    this.assettyype = this.commonService.formatResourceType(
      this.budgetObj.resourcetype,
      this.cloudprovider
    );
    this.resourcetype = this.budgetObj.resourcetype;
    this.tagid = this.budgetObj.tagid != -1 ? this.budgetObj.tagid : null;
    this.tagList = this.budgetObj.tagid != -1 ? [this.budgetObj.tag] : [];
    this.tagvalue = this.budgetObj.tagvalue;
    this.budgetamount = this.budgetObj.currency
      ? this.commonService.formatCurrency(
          AppConstant.CURRENCY[this.budgetObj.currency],
          this.budgetObj.budgetamount
        )
      : this.budgetObj.budgetamount;
    this.instanceList = this.budgetObj.instanceList
      ? this.budgetObj.instanceList
      : [];
    this.instancenames = this.budgetObj.instancenames
      ? this.budgetObj.instancenames
      : [];
  }
  changeTab(index) {
    this.currentTab = index;
    this.initChart();
    if (this.currentTab === 0) {
      setTimeout(() => {
        this.drawChart("BarChart");
      }, 1000);
    }
    if (this.currentTab === 1) {
      setTimeout(() => {
        this.drawChart("LineChart");
      }, 1000);
    }
  }
  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }
  getServerList() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.budgetObj.cloudprovider) {
      condition.cloudprovider = this.budgetObj.cloudprovider;
    }
    this.commonService.allInstances(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = _.map(response.data, function (item) {
          return {
            label: item.instancename,
            value: item.instancerefid,
          };
        });
      } else {
        this.instanceList = [];
      }
    });
  }
  initChart() {
    this.chartOptions = {
      series: [
        {
          name: "Budget",
          type: "column",
          data: [],
        },
        {
          name: "Actual Billing",
          type: "column",
          data: [],
        },
        {
          name: "Budget Forecast",
          type: "line",
          data: [],
        },
      ],
      chart: {
        height: 350,
        type: "line",
        stacked: false,
        events: {
          dataPointSelection: (e, chrt, options) =>
            this.moveToBudgetSummaryDetails(e, chrt, options),
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [1, 1, 4],
      },
      xaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        categories: [],
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
          title: {
            text: "Budget Vs Actual",
            style: {
              color: "#f5f5f5",
            },
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
      tooltip: {
        shared: false,
        intersect: true,
        fixed: {
          enabled: true,
          position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
          offsetY: 30,
          offsetX: 60,
        },
        y: {
          formatter: function (val) {
            return new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
            }).format(val);
          },
        },
      },
      markers: {
        size: 5,
        hover: {
          sizeOffset: 6,
        },
      },
    };

    this.linechartOptions = {
      series: [
        {
          name: "Budget",
          data: [],
        },
        {
          name: "Actual Billing",
          data: [],
        },
        {
          name: "Budget Forecast",
          data: [],
        },
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false,
        },
        events: {
          dataPointSelection: (e, chrt, options) =>
            this.moveToBudgetSummaryDetails(e, chrt, options),
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      xaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        categories: [],
      },
      yaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "Budget Vs Actual",
          style: {
            color: "#f5f5f5",
          },
        },
      },
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
      tooltip: {
        shared: false,
        intersect: true,
        fixed: {
          enabled: true,
          position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
          offsetY: 30,
          offsetX: 60,
        },
        y: {
          formatter: function (val) {
            return new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
            }).format(val);
          },
        },
      },
      markers: {
        size: 5,
        hover: {
          sizeOffset: 6,
        },
      },
    };
  }
  // getBillingList() {
  //   this.billingList = [];
  //   let condition = {} as any;
  //   condition = {
  //     status: AppConstant.STATUS.ACTIVE,
  //     billingdates: [this.budgetObj.startdt, this.budgetObj.enddt]
  //   };
  //   if (this.budgetObj.cloudprovider && this.budgetObj.cloudprovider !== '') {
  //     condition.cloudprovider = this.budgetObj.cloudprovider;
  //   }
  //   if (this.budgetObj.customerid && this.budgetObj.customerid !== -1) {
  //     condition.customerid = this.budgetObj.customerid;
  //   }
  //   if (this.budgetObj.resourcetype && this.budgetObj.resourcetype !== '') {
  //     condition.resourcetype = this.budgetObj.resourcetype;
  //   }
  //   if (this.budgetObj.instancerefid && this.budgetObj.instancerefid !== '') {
  //     condition.instancerefid = this.budgetObj.instancerefid;
  //   }
  //   this.budgetService.billingList(condition).subscribe(result => {
  //     const response = JSON.parse(result._body);
  //     console.log(response);
  //     if (response.status && response.data.length > 0) {
  //       this.billingList = response.data;
  //       let self = this;
  //       this.billingList = _.map(this.billingList, function (i: any) {
  //         i.resourcetype = self.formData(i.resourcetype);
  //         i.billamount = i.currency + ' ' + i.billamount;
  //         return i;
  //       });
  //     } else {
  //       this.billingList = [];
  //     }
  //   });
  // }

  dateRange(startDate, endDate) {
    const start = startDate.split("-");
    const end = endDate.split("-");
    const startYear = parseInt(start[0]);
    const endYear = parseInt(end[0]);
    const dates = [];
    const formateddates = [];

    for (let i = startYear; i <= endYear; i++) {
      const endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
      const startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
      for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
        const month = j + 1;
        const displayMonth = month < 10 ? "0" + month : month;
        dates.push([i, displayMonth, "01"].join("-"));
        formateddates.push(
          moment([i, displayMonth, "01"].join("-")).format("MMM-YYYY")
        );
      }
    }
    return formateddates;
  }
  getAllBillingSummary() {
    this.loading = true;
    this.billingSummary = [];
    let condition = {} as any;
    condition = {
      startdt: this.budgetObj.startdt,
      enddt: this.budgetObj.enddt,
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.budgetObj.cloudprovider && this.budgetObj.cloudprovider !== "") {
      condition.cloudprovider = this.budgetObj.cloudprovider;
    }
    if (this.budgetObj.customerid && this.budgetObj.customerid !== -1) {
      condition.customerid = this.budgetObj.customerid;
    }
    if (this.budgetObj.accountid) {
      condition.accountid = this.budgetObj.accountid;
    }
    if (this.budgetObj.resourcetype && this.budgetObj.resourcetype !== "") {
      if (this.budgetObj.resourcetype == "VIRTUAL_SERVER") {
        condition.resourcetype = "ASSET_INSTANCE";
      } else {
        condition.resourcetype = this.budgetObj.resourcetype;
      }
    }
    if (this.budgetObj.resourceid && this.budgetObj.resourceid.length > 0) {
      let instancenames: any = [];
      this.budgetObj.resourceid.forEach((element) => {
        let obj: any = _.find(this.instanceList, { instanceid: element });
        if (obj != undefined) {
          instancenames.push(obj.value);
        }
      });
      condition.resourceids = instancenames;
    }
    if (this.budgetObj.tagid && this.budgetObj.tagid !== -1) {
      condition.tagid = this.budgetObj.tagid;
    }
    if (this.budgetObj.tagvalue && this.budgetObj.tagvalue !== "") {
      condition.tagvalues = [this.budgetObj.tagvalue];
    }
    // if (this.budgetObj.instancerefid && this.budgetObj.instancerefid !== '') {
    //   condition.instancerefid = this.budgetObj.instancerefid;
    // }
    let datesrange = this.dateRange(
      this.budgetObj.startdt,
      this.budgetObj.enddt
    );
    this.budgetService.summary(condition).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status && response.data.length > 0) {
        this.formatDetails(response.data, datesrange);
      } else {
        this.billingSummary = [];
        this.formatDetails([], datesrange);
      }
      if (this.currentTab === 0) {
        this.drawChart("BarChart");
      }
      if (this.currentTab === 1) {
        this.drawChart("LineChart");
      }
      this.loading = false;
    });
  }
  formatDetails(data, dateranges) {
    for (let i = 0; i < dateranges.length; i++) {
      if (data.length > 0) {
        let summary: any = _.find(data, { monthname: dateranges[i] });
        if (summary != undefined) {
          this.billingSummary.push(summary);
        } else {
          this.billingSummary.push({
            actualamount: 0,
            monthname: dateranges[i],
          });
        }
      } else {
        this.billingSummary.push({
          actualamount: 0,
          monthname: dateranges[i],
        });
      }
    }

    let self = this;
    this.actamt = 0;
    _.map(this.billingSummary, function (item: any) {
      item.currency = self.budgetObj.currency;
      item.budgetamount = Number(
        self.budgetObj.budgetamount / self.billingSummary.length
      ).toFixed(0);
      item.amount = item.actualamount;
      self.actamt += item.actualamount ? parseFloat(item.actualamount) : 0;
      item.diffamount = Number(item.budgetamount) - Number(item.actualamount);
      item.diffpercentage =
        100 -
        Math.round(
          (Number(item.actualamount) / Number(item.budgetamount)) * 100
        );
      return item;
    });
    // this.actamt = this.billingSummary[0]['currency'] + _.sumBy(this.billingSummary, 'amount');
    if (this.billingSummary[0]["currency"])
      this.actamt = this.commonService.formatCurrency(
        AppConstant.CURRENCY[this.billingSummary[0]["currency"]],
        this.actamt
      );
  }
  editBudget(data) {
    this.showSidebar = true;
  }
  onChanged(event) {
    this.showSidebar = false;
  }
  onDtlChanged(event) {
    this.showSummaryDtl = false;
  }
  notifyBudgetEntry(event) {
    console.log(event);
    this.budgetService.byId(this.budgetObj.budgetid).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          response.data.customername = response.data.customer
            ? response.data.customer.customername
            : "All";
          this.budgetObj = response.data;
          this.checkBudgetObj();
          this.getAllBillingSummary();
          this.loading = false;
          this.showSidebar = false;
        } else {
          this.loading = false;
        }
      },
      (err) => {
        console.log(err);
      }
    );
    this.showSidebar = false;
  }
  formData(resourcetype) {
    let value = _.find(this.assetTypes, { value: resourcetype });
    return value.title;
  }

  drawChart(type) {
    this.loading = true;
    if (this.billingSummary && this.billingSummary.length > 0) {
      let dates = [];
      let budgetamounts = [];
      let billingamounts = [];
      let diffamounts = [];
      let billingcurrency = null;
      let avgDiffAmounts = 0;
      let billingcount = 0;
      this.billingSummary.map((o) => {
        dates.push(o.monthname);
        budgetamounts.push(
          Number(
            this.budgetObj.budgetamount / this.billingSummary.length
          ).toFixed(0)
        );
        billingamounts.push(o.actualamount);
        billingcurrency = `Actual Billing (${o.currency})`;
      });
      for (let i = 0; i < billingamounts.length; i++) {
        let c =
          typeof billingamounts[i] == "string"
            ? parseFloat(billingamounts[i])
            : billingamounts[i];
        avgDiffAmounts += c;
        billingcount += c > 0 ? 1 : 0;
      }
      avgDiffAmounts = avgDiffAmounts / billingcount;
      for (let i = 0; i < billingamounts.length; i++) {
        let c =
          typeof billingamounts[i] == "string"
            ? parseFloat(billingamounts[i])
            : billingamounts[i];
        if (c > 0) {
          diffamounts.push(null);
        } else {
          diffamounts.push(avgDiffAmounts ? Math.round(avgDiffAmounts) : null);
        }
      }
      //render chart
      document.getElementById("dailyChart").innerHTML = "";
      //if bar chart
      if (type == "BarChart") {
        this.chartOptions.xaxis.categories = dates;
        this.chartOptions.series[0].data = budgetamounts;
        this.chartOptions.series[0].name = `Budget (${this.budgetObj.currency})`;
        this.chartOptions.series[1].data = billingamounts;
        this.chartOptions.series[1].name = billingcurrency;
        this.chartOptions.series[2].name = `Budget Forecast (${this.budgetObj.currency})`;
        this.chartOptions.series[2].data = diffamounts;
        console.log("BarChart Series >>>>>>>>>>");
        console.log(this.chartOptions.series);
        let d = new Apex(
          document.getElementById("dailyChart"),
          this.chartOptions
        );
        d.render();
      } else if (type == "LineChart") {
        this.linechartOptions.xaxis.categories = dates;
        this.linechartOptions.series[0].data = budgetamounts;
        this.linechartOptions.series[1].name = billingcurrency;
        this.linechartOptions.series[0].name = `Budget (${this.budgetObj.currency})`;
        this.linechartOptions.series[2].name = `Budget Forecast (${this.budgetObj.currency})`;
        this.linechartOptions.series[2].data = diffamounts;
        this.linechartOptions.series[1].data = billingamounts;
        console.log("BarChart Series >>>>>>>>>>");
        console.log(this.linechartOptions.series);
        let d = new Apex(
          document.getElementById("dailyChart"),
          this.linechartOptions
        );
        d.render();
      }
      console.log(JSON.stringify(this.chartOptions));
      this.loading = false;
    }
    this.loading = false;
  }

  drilldown(options: any) {
    this.ddoptions = options;
    this.showDrillDownDetail = true;
  }
}
