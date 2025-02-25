import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
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
  selector: "app-dailybilling",
  templateUrl:
    "../../../../../presentation/web/base/assets/billing/dailybilling/dailybilling.component.html",
})
export class DailybillingComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild("chart") chart: ChartComponent;
  @Input() instanceObj;
  @Input() budgetObj;
  public chartOptions: Partial<ChartOptions>;
  userstoragedata: any = {};
  dailyBillings = [];
  loading = false;
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
  ngAfterViewInit(): void {
    // let wc = new Apex(document.getElementById("weeklyChart"), this.chartOptions2);
    // wc.render();
  }

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (
      changes.instanceObj &&
      changes.instanceObj.currentValue &&
      changes.budgetObj &&
      changes.budgetObj.currentValue
    ) {
      this.instanceObj = changes.instanceObj.currentValue;
      this.budgetObj = changes.budgetObj.currentValue.data;
      this.budgetObj.budgetamount = this.budgetObj.currency
        ? this.commonService.formatCurrency(
            AppConstant.CURRENCY[this.budgetObj.currency],
            this.budgetObj.budgetamount
          )
        : this.budgetObj.budgetamount;

      // this.initChart();
      document.getElementById("dailybillingChart").innerHTML = "";
      let d = new Apex(
        document.getElementById("dailybillingChart"),
        this.chartOptions
      );
      d.render();
      this.getChart();
    }
  }
  getChart() {
    console.log(this.budgetObj);
    this.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      instancerefid: this.instanceObj.instancerefid,
      billingdates: [this.budgetObj.startdt, this.budgetObj.enddt],
      cloudprovider: this.instanceObj.cloudprovider,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.budgetService.dailybillings(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.dailyBillings = _.map(response.data, function (o) {
          o.billingdt = moment(o.billingdt).format("DD-MMM-YY");
          return o;
        });
        console.log(this.dailyBillings);
        this.drawChart();
      } else {
        this.loading = false;
      }
    });
  }
  drawChart() {
    if (this.dailyBillings && this.dailyBillings.length > 0) {
      let billingamounts = [];
      let dates = [];
      let billingcurrency = null;
      let self = this;
      this.dailyBillings.map((o) => {
        console.log(o.billingdt);
        dates.push(o.billingdt);
        billingamounts.push(o.billamount.toFixed(0));
        billingcurrency = `Actual Billing (${o.currency})`;
      });
      //render chart
      document.getElementById("dailybillingChart").innerHTML = "";

      this.chartOptions.xaxis.categories = dates;
      this.chartOptions.series[0].data = billingamounts;
      this.chartOptions.series[0].name = billingcurrency;
      console.log(this.chartOptions);
      let d = new Apex(
        document.getElementById("dailybillingChart"),
        this.chartOptions
      );
      d.render();
      console.log(d);
      this.loading = false;
    } else {
      let dc = new Apex(
        document.getElementById("dailybillingChart"),
        this.chartOptions
      );
      dc.render();
      this.loading = false;
    }
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
    // let dc = new Apex(document.getElementById("dailybillingChart"), this.chartOptions);
    // dc.render();
    // let dc = new Apex(document.getElementById("dailybillingChart"), this.chartOptions);
    // dc.render();
  }
}
