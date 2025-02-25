import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import * as Apex from "apexcharts";
import { BudgetService } from "../../budget/budget.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { TagService } from "../../../tagmanager/tags.service";
import * as _ from "lodash";

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
  ApexTooltip,
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
  selector: "app-summarydtl",
  templateUrl:
    "../../../../../presentation/web/base/assets/budget/summarydtl/summarydtl.component.html",
})
export class SummarydtlComponent implements OnInit, OnChanges {
  @ViewChild("chart") chart: ChartComponent;
  @Input() budgetObj: any;
  @Input() month: any;
  @Output() drilldown: EventEmitter<any> = new EventEmitter();

  billingSummary: any = [];
  instanceList: any = [];
  loading = false;
  monthname = "";
  budgetamount;
  public chartOptions: Partial<ChartOptions>;
  public linechartOptions: Partial<ChartOptions>;
  userstoragedata: any = {};
  filters: any = {};
  tagList = [];
  constructor(
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

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.getServerList();
    this.getAllTags();
    if (
      !_.isEmpty(changes.budgetObj) &&
      !_.isEmpty(changes.budgetObj.currentValue)
    ) {
      this.budgetObj = changes.budgetObj.currentValue;
      this.filters = this.budgetObj;
      this.filters.assettype = this.commonService.formatResourceType(
        this.filters.resourcetype,
        this.filters.cloudprovider
      );
      console.log(this.filters);
      this.budgetamount = this.budgetObj.budgetamount;
      this.month = this.filters.monthname;
      this.monthname = this.filters.monthname;
    }

    if (!_.isEmpty(changes.month) && !_.isEmpty(changes.month.currentValue)) {
      this.month = changes.month.currentValue;
    }
    // if (this.budgetObj.resourcetype == 'All') {
    this.getSummaryDtl();
    // } else {
    //   this.monthname = moment(this.month).format('MMM-YYYY');
    //   this.drawChart();
    // }
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
  getSummaryDtl() {
    this.loading = true;

    const startdate = moment("01-" + this.month)
      .startOf("month")
      .format("YYYY-MM-DD");
    const enddate = moment("01-" + this.month)
      .endOf("month")
      .format("YYYY-MM-DD");

    this.billingSummary = [];
    let condition = {} as any;
    condition = {
      startdt: startdate,
      enddt: enddate,
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.budgetObj.cloudprovider && this.budgetObj.cloudprovider !== "") {
      condition.cloudprovider = this.budgetObj.cloudprovider;
    }
    if (this.budgetObj.customerid && this.budgetObj.customerid !== -1) {
      condition.customerid = this.budgetObj.customerid;
    }
    if (this.budgetObj.resourceid && this.budgetObj.resourceid.length > 0) {
      let instancenames: any = [];
      this.budgetObj.resourceid.forEach((element) => {
        let obj: any = _.find(this.instanceList, { instanceid: element });
        if (obj != undefined) {
          instancenames.push(obj.instancerefid);
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
    if (this.budgetObj.instancerefid && this.budgetObj.instancerefid !== "") {
      condition.instancerefid = this.budgetObj.instancerefid;
    }
    if (this.filters.assettype && this.filters.assettype != "All") {
      let rsrcType = {} as any;
      if (condition.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
        rsrcType = _.find(AppConstant.AWS_BILLING_RESOURCETYPES, {
          title: this.filters.assettype,
        });
      } else if (condition.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
        rsrcType = _.find(AppConstant.ECL2_BILLING_RESOURCETYPES, {
          title: this.filters.assettype,
        });
      }
      if (rsrcType) {
        condition.resourcetype = rsrcType.value;
      }
    }

    console.log("Inside get summary details >>>>>>>");

    this.budgetService
      .summary(condition, `?summarydtl=${true}`)
      .subscribe((result) => {
        console.log("Summary detail result >>>>>");
        const response = JSON.parse(result._body);
        console.log(response);
        if (response.status && response.data.length > 0) {
          // let others = _.find(response.data, { assettype: "Others" });
          this.billingSummary = _.filter(response.data, function (item: any) {
            if (item.assettype !== "Others") {
              return item;
            }
          });
          // if (others != undefined) {
          //   this.billingSummary.push(others);
          // }
          let self = this;
          _.map(this.billingSummary, function (item: any) {
            item.currency = self.budgetObj.currency;
            item.budgetamount = Number(self.budgetObj.budgetamount).toFixed(0);
            item.amount = item.actualamount;
            item.resourcetype = item.assettype;
            return item;
          });
          this.budgetamount = this.budgetObj.currency
            ? this.commonService.formatCurrency(
                AppConstant.CURRENCY[this.budgetObj.currency],
                this.budgetObj.budgetamount
              )
            : this.budgetObj.budgetamount;
          this.billingSummary = [...this.billingSummary];

          console.log("The billing summary >>>>>");
          console.log(this.billingSummary);
        } else {
          this.billingSummary = [];
        }
        this.drawChart();
        this.loading = false;
      });
  }
  drawChart() {
    if (this.billingSummary && this.billingSummary.length > 0) {
      let budgetamounts = [];
      let billingamounts = [];
      let diffamounts = [];
      let resourceTypes = [];
      let billingcurrency = null;
      let avgDiffAmounts = 0;
      let self = this;
      this.billingSummary.map((o) => {
        if (self.billingSummary.length > 6) {
          o.resourcetype =
            o.resourcetype.length > 10
              ? o.resourcetype.split(" ")
              : o.resourcetype;
        }
        resourceTypes.push(o.resourcetype);
        budgetamounts.push(Number(this.budgetObj.budgetamount).toFixed(0));
        billingamounts.push(o.actualamount);
        billingcurrency = `Actual Billing (${o.currency})`;
        if (o.actualamount && o.actualamount > 0) {
          avgDiffAmounts += o.diffamount;
        }
      });
      let j = 1;
      if (avgDiffAmounts < 0) {
        avgDiffAmounts = Math.abs(avgDiffAmounts);
        for (let i = 0; i < billingamounts.length; i++) {
          if (billingamounts[i] > 0) {
            diffamounts.push(null);
          } else {
            diffamounts.push(avgDiffAmounts * j);
            j += 1;
          }
        }
      }
      //render chart
      document.getElementById("detailChart").innerHTML = "";
      if (this.billingSummary.length > 6) {
        this.chartOptions.xaxis.labels.rotate = -45;
        this.chartOptions.xaxis.labels.rotateAlways = true;
        this.chartOptions.xaxis.labels.hideOverlappingLabels = true;
        this.chartOptions.xaxis.labels.trim = true;
        this.chartOptions.xaxis.labels.maxHeight = 150;
      }
      //if bar chart
      this.chartOptions.xaxis.categories = resourceTypes;
      this.chartOptions.series[0].data = billingamounts;
      this.chartOptions.series[0].name = billingcurrency;
      let d = new Apex(
        document.getElementById("detailChart"),
        this.chartOptions
      );
      d.render();
      this.loading = false;
    } else {
      let dc = new Apex(
        document.getElementById("detailChart"),
        this.chartOptions
      );
      dc.render();
    }
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
          name: "Billing",
          type: "column",
          data: [],
        },
      ],
      chart: {
        height: 350,
        width: "100%",
        type: "line",
        // stacked: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [1, 1, 4],
      },
      xaxis: {
        labels: {
          show: true,
          style: {
            colors: "#f5f5f5",
            cssClass: "apexcharts-xaxis-label",
          },
        },
        categories: [],
        // title: {
        //   text: "Asset Types",
        //   style: {
        //     color: '#f5f5f5'
        //   }
        // },
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
            text: "Billing Amount",
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
        size: 3,
        hover: {
          sizeOffset: 6,
        },
      },
    };
  }

  getDrillDown(d) {
    this.drilldown.emit({
      startdate: moment(this.monthname).startOf("month").toDate(),
      enddate: moment(this.monthname).endOf("month").toDate(),
      resourcetype: d["assettype"],
      filters: {
        cloudprovider: this.filters.cloudprovider,
      },
    });
  }
}
