import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/amchartsdark";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { AssetsService } from "../assets.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { ChartComponent } from "ng-apexcharts";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTheme,
  ApexTitleSubtitle,
  ApexFill,
  ApexStroke,
  ApexYAxis,
  ApexLegend,
  ApexPlotOptions,
} from "ng-apexcharts";

type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  theme: ApexTheme;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: "app-rightsize-dashboard",
  templateUrl:
    "../../../../presentation/web/base/assets/rightsize-dashboard.component.html",
  styleUrls: ["./rightsize-dashboard.component.css"],
})
export class RightsizeDashboardComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  screens = [];
  potentialduration = [
    { label: "Next Month", value: "1" },
    { label: "Next 3 Months", value: "3" },
    { label: "Next 6 Months", value: "6" },
    { label: "Next 12 Months", value: "12" },
  ];
  savingLostduration = [
    { label: "Last 1 Month", value: "1" },
    { label: "Last 3 Months", value: "3" },
    { label: "Last 6 Months", value: "6" },
    { label: "Last 12 Months", value: "12" },
  ];
  selectedpotentialperiod = null;
  selectedlostperoid = null;
  providerList = [
    { label: "ECL2", value: "ECL2" },
    { label: "AWS", value: "AWS" },
  ];
  providerLists = [
    { label: "ECL2", value: "ECL2" },
    { label: "AWS", value: "AWS" },
  ];
  cloudprovider = null;
  cloudprovider1 = null;
  appScreens = {} as any;
  userstoragedata;

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  assets = {} as any;
  potentialSave = [];
  savingslost = [];
  lostdefaultData = [
    {
      month: "Jan-21",
      low: 10000,
      medium: 10000,
      high: 16800,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Jan-21",
      low: 4000,
      medium: 5000,
      high: 10000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Dec-20",
      low: 10000,
      medium: 22000,
      high: 15000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Dec-20",
      low: 6000,
      medium: 11000,
      high: 10000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Nov-20",
      low: 13000,
      medium: 16000,
      high: 16000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Nov-20",
      low: 7000,
      medium: 5000,
      high: 14000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Oct-20",
      low: 9000,
      medium: 10000,
      high: 18000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Oct-20",
      low: 5000,
      medium: 6000,
      high: 9000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Sep-20",
      low: 14000,
      medium: 20000,
      high: 30000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Sep-20",
      low: 10000,
      medium: 4000,
      high: 10000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Aug-20",
      low: 11000,
      medium: 12000,
      high: 15000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Aug-20",
      low: 6000,
      medium: 16000,
      high: 10000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Jul-20",
      low: 6000,
      medium: 18000,
      high: 8000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Jul-20",
      low: 2000,
      medium: 8000,
      high: 7000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Jun-20",
      low: 19000,
      medium: 16000,
      high: 16000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Jun-20",
      low: 7000,
      medium: 5000,
      high: 4000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "May-20",
      low: 9000,
      medium: 10000,
      high: 8000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "May-20",
      low: 5000,
      medium: 6000,
      high: 9000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Apr-20",
      low: 4000,
      medium: 7000,
      high: 10000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Apr-20",
      low: 2000,
      medium: 4000,
      high: 10000,
      provider: "ECL2",
      currency: "€",
    },
  ];
  defaultData = [
    {
      month: "Mar-21",
      low: 25000,
      medium: 50000,
      high: 96800,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Mar-21",
      low: 14000,
      medium: 35000,
      high: 70000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Apr-21",
      low: 21000,
      medium: 52000,
      high: 85000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Apr-21",
      low: 16000,
      medium: 36000,
      high: 60000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "May-21",
      low: 16000,
      medium: 48000,
      high: 78000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "May-21",
      low: 12000,
      medium: 38000,
      high: 50000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Jun-21",
      low: 29000,
      medium: 36000,
      high: 76000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Jun-21",
      low: 17000,
      medium: 25000,
      high: 54000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Jul-21",
      low: 19000,
      medium: 20000,
      high: 68000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Jul-21",
      low: 15000,
      medium: 16000,
      high: 59000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Aug-21",
      low: 24000,
      medium: 40000,
      high: 80000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Aug-21",
      low: 20000,
      medium: 34000,
      high: 50000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Sep-21",
      low: 25000,
      medium: 50000,
      high: 96800,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Sep-21",
      low: 14000,
      medium: 35000,
      high: 70000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Oct-21",
      low: 21000,
      medium: 52000,
      high: 85000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Oct-21",
      low: 16000,
      medium: 36000,
      high: 60000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Nov-21",
      low: 16000,
      medium: 48000,
      high: 78000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Nov-21",
      low: 12000,
      medium: 38000,
      high: 50000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Dec-21",
      low: 29000,
      medium: 36000,
      high: 76000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Dec-21",
      low: 17000,
      medium: 25000,
      high: 54000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Jan-22",
      low: 19000,
      medium: 20000,
      high: 68000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Jan-22",
      low: 15000,
      medium: 16000,
      high: 59000,
      provider: "ECL2",
      currency: "€",
    },
    {
      month: "Feb-22",
      low: 24000,
      medium: 40000,
      high: 80000,
      provider: "AWS",
      currency: "$",
    },
    {
      month: "Feb-22",
      low: 20000,
      medium: 34000,
      high: 50000,
      provider: "ECL2",
      currency: "€",
    },
  ];
  // assetsCount = [
  //   {
  //     "cloudprovider": "ECL2",
  //     "assettype": "Low",
  //     "value": "50000"
  //   },
  //   {
  //     "cloudprovider": "ECL2",
  //     "assettype": "Medium",
  //     "value": "25000"
  //   },
  //   {
  //     "cloudprovider": "ECL2",
  //     "assettype": "High",
  //     "value": "28000"
  //   },
  //   {
  //     "cloudprovider": "AWS",
  //     "assettype": "Low",
  //     "value": "75000"
  //   },
  //   {
  //     "cloudprovider": "AWS",
  //     "assettype": "Medium",
  //     "value": "52000"
  //   },
  //   {
  //     "cloudprovider": "AWS",
  //     "assettype": "High",
  //     "value": "8000"
  //   }
  // ];
  // savingsLost = [
  //   {
  //     "cloudprovider": "ECL2",
  //     "assettype": "Low",
  //     "value": "10000"
  //   },
  //   {
  //     "cloudprovider": "ECL2",
  //     "assettype": "Medium",
  //     "value": "18000"
  //   },
  //   {
  //     "cloudprovider": "ECL2",
  //     "assettype": "High",
  //     "value": "50000"
  //   },
  //   {
  //     "cloudprovider": "AWS",
  //     "assettype": "Low",
  //     "value": "15000"
  //   },
  //   {
  //     "cloudprovider": "AWS",
  //     "assettype": "Medium",
  //     "value": "21000"
  //   },
  //   {
  //     "cloudprovider": "AWS",
  //     "assettype": "High",
  //     "value": "18000"
  //   }
  // ];
  assetWiseCosts = null;

  constructor(
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private assetService: AssetsService
  ) {
    am4core.useTheme(am4themes_dark);
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_MANAGEMENT,
    });
    this.cloudprovider = this.providerList[0].value;
    this.cloudprovider1 = this.providerLists[0].value;
    this.selectedpotentialperiod = this.potentialduration[0].value;
    this.selectedlostperoid = this.savingLostduration[0].value;
    // this.potentialSave = [this.defaultData[0]];

    // this.savingslost = [this.lostdefaultData[0]];
  }
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}

  ngOnInit() {
    this.onPotentialChange();
    this.onSavingsChange();
    // this.getAssetsCount();
  }
  onSavingProviderChange(event) {
    if (event == "AWS") {
    }
    if (event == "ECL2") {
    }
  }
  onPotentialChange() {
    this.potentialSave = [];
    let details: any = _.filter(this.defaultData, {
      provider: this.cloudprovider,
    });
    if (this.selectedpotentialperiod == 1) {
      this.potentialSave.push(details[0]);
    }
    if (this.selectedpotentialperiod == 3) {
      this.potentialSave.push(details[0], details[1], details[2]);
    }
    if (this.selectedpotentialperiod == 6) {
      this.potentialSave.push(
        details[0],
        details[1],
        details[2],
        details[3],
        details[4],
        details[5]
      );
    }
    if (this.selectedpotentialperiod == 12) {
      this.potentialSave = details;
    }
    this.drawProviderWiseAssetsChart();
  }
  onSavingsChange() {
    this.savingslost = [];
    let details: any = _.filter(this.lostdefaultData, {
      provider: this.cloudprovider1,
    });
    if (this.selectedlostperoid == 1) {
      this.savingslost.push(details[0]);
    }
    if (this.selectedlostperoid == 3) {
      this.savingslost.push(details[0], details[1], details[2]);
    }
    if (this.selectedlostperoid == 6) {
      this.savingslost.push(
        details[0],
        details[1],
        details[2],
        details[3],
        details[4],
        details[5]
      );
    }
    if (this.selectedlostperoid == 12) {
      this.savingslost = details;
    }
    this.drawSavingsLostChart();
  }
  getAssetsCount() {
    // this.httpService.GET(AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.BASE.ASSETS.COUNT + '?tenantid=' + this.userstoragedata.tenantid).subscribe(result => {
    //   let response = JSON.parse(result._body);

    //   if (response.status) {
    //     this.assetsCount = response.data;
    //     console.log(response);
    // this.drawProviderWiseAssetsCountChart();
    this.drawProviderWiseAssetsChart();
    this.drawSavingsLostChart();
    // this.drawLocationWiseAssetsChart();
    //   }

    // }, err => {
    //   console.log(err);
    // });
  }

  drawSavingsLostChart() {
    let chart = am4core.create("swac", am4charts.XYChart);
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "top";
    chart.legend.paddingBottom = 20;
    chart.legend.labels.template.maxWidth = 95;

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = "month";
    xAxis.renderer.cellStartLocation = 0.1;
    xAxis.renderer.cellEndLocation = 0.9;
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.minGridDistance = 50;
    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.title.text = "Savings";
    yAxis.min = 0;

    function createSeries(value, name) {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = value;
      series.dataFields.categoryX = "month";
      series.name = name;
      // series.stacked = true;
      series.columns.template.tooltipText =
        "{name}\n Savings: {currency}{valueY}";

      series.events.on("hidden", arrangeColumns);
      series.events.on("shown", arrangeColumns);

      let bullet = series.bullets.push(new am4charts.LabelBullet());
      bullet.interactionsEnabled = false;
      bullet.dy = 30;
      bullet.label.text = "{currency}{valueY}";
      bullet.label.fill = am4core.color("#ffffff");

      return series;
    }

    chart.data = [];
    for (let i = 0; i < this.savingslost.length; i++) {
      if (this.cloudprovider1 == this.savingslost[i].provider) {
        chart.data.push(this.savingslost[i]);
      }
    }

    createSeries("low", "Low");
    createSeries("medium", "Medium");
    createSeries("high", "High");

    function arrangeColumns() {
      let series = chart.series.getIndex(0);

      let w =
        1 -
        xAxis.renderer.cellStartLocation -
        (1 - xAxis.renderer.cellEndLocation);
      if (series.dataItems.length > 1) {
        let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
        let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
        let delta = ((x1 - x0) / chart.series.length) * w;
        if (am4core.isNumber(delta)) {
          let middle = chart.series.length / 2;

          let newIndex = 0;
          chart.series.each(function (series) {
            if (!series.isHidden && !series.isHiding) {
              series.dummyData = newIndex;
              newIndex++;
            } else {
              series.dummyData = chart.series.indexOf(series);
            }
          });
          let visibleCount = newIndex;
          let newMiddle = visibleCount / 2;

          chart.series.each(function (series) {
            let trueIndex = chart.series.indexOf(series);
            let newIndex = series.dummyData;

            let dx = (newIndex - trueIndex + middle - newMiddle) * delta;

            series.animate(
              { property: "dx", to: dx },
              series.interpolationDuration,
              series.interpolationEasing
            );
            series.bulletsContainer.animate(
              { property: "dx", to: dx },
              series.interpolationDuration,
              series.interpolationEasing
            );
          });
        }
      }
    }
    // chart.colors.step = 2;

    // chart.data = this.savingslost;
    // // Create axes
    // var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "month";
    // // categoryAxis.title.text = "Months";
    // categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.minGridDistance = 20;
    // categoryAxis.renderer.cellStartLocation = 0.1;
    // categoryAxis.renderer.cellEndLocation = 0.9;

    // var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.min = 0;
    // valueAxis.title.text = "Savings";

    // // Create series
    // function createSeries(field, name, stacked) {
    //   var series = chart.series.push(new am4charts.ColumnSeries());
    //   series.dataFields.valueY = field;
    //   series.dataFields.categoryX = "month";
    //   series.name = name;
    //   if (stacked) {
    //     series.stroke = am4core.color("rgb(238,234,181)");
    //     series.columns.template.tooltipText = "{name}: €[bold]{valueY}[/]";
    //   } else {
    //     series.stroke = am4core.color("rgb(9,117,218)");
    //     series.columns.template.tooltipText = "{name}: $[bold]{valueY}[/]";
    //   }

    //   series.stacked = stacked;
    //   series.columns.template.width = am4core.percent(95);
    //   series.columns.template.adapter.add("fill", function (fill, target) {
    //     if (stacked) {
    //       series.stroke = am4core.color("rgb(238,234,181)");
    //       return am4core.color("rgb(238,234,181)");
    //     } else {
    //       series.stroke = am4core.color("rgb(9,117,218)");
    //       return am4core.color("rgb(9,117,218)");
    //     }
    //   });

    //   return series;
    // }

    // createSeries("awslow", "Low", false);
    // createSeries("nttlow", "Low", true);
    // createSeries("awsmedium", "Medium", false);
    // createSeries("nttmedium", "Medium", true);
    // createSeries("awshigh", "High", false);
    // createSeries("ntthigh", "High", true);
    // // Add legend
    // chart.legend = new am4charts.Legend();
    // chart.legend.parent = chart.chartContainer;
    // chart.legend.data = [{ 'name': 'AWS', 'fill': 'rgb(9,117,218)' }, { 'name': 'ECL2', 'fill': 'rgb(238,234,181)' }]
  }

  drawProviderWiseAssetsChart() {
    let chart = am4core.create("pwsg", am4charts.XYChart);

    chart.colors.step = 2;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "top";
    chart.legend.paddingBottom = 20;
    chart.legend.labels.template.maxWidth = 95;

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = "month";
    xAxis.renderer.cellStartLocation = 0.1;
    xAxis.renderer.cellEndLocation = 0.9;
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.minGridDistance = 50;
    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.title.text = "Savings";
    yAxis.min = 0;

    function createSeries(value, name) {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = value;
      series.dataFields.categoryX = "month";
      series.name = name;
      // series.stacked = true;
      series.columns.template.tooltipText =
        "{name}\n Savings: {currency}{valueY}";

      series.events.on("hidden", arrangeColumns);
      series.events.on("shown", arrangeColumns);

      let bullet = series.bullets.push(new am4charts.LabelBullet());
      bullet.interactionsEnabled = false;
      bullet.dy = 30;
      bullet.label.text = "{currency}{valueY}";
      bullet.label.fill = am4core.color("#ffffff");

      return series;
    }

    chart.data = [];
    for (let i = 0; i < this.potentialSave.length; i++) {
      if (this.cloudprovider == this.potentialSave[i].provider) {
        chart.data.push(this.potentialSave[i]);
      }
    }

    createSeries("low", "Low");
    createSeries("medium", "Medium");
    createSeries("high", "High");

    function arrangeColumns() {
      let series = chart.series.getIndex(0);

      let w =
        1 -
        xAxis.renderer.cellStartLocation -
        (1 - xAxis.renderer.cellEndLocation);
      if (series.dataItems.length > 1) {
        let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
        let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
        let delta = ((x1 - x0) / chart.series.length) * w;
        if (am4core.isNumber(delta)) {
          let middle = chart.series.length / 2;

          let newIndex = 0;
          chart.series.each(function (series) {
            if (!series.isHidden && !series.isHiding) {
              series.dummyData = newIndex;
              newIndex++;
            } else {
              series.dummyData = chart.series.indexOf(series);
            }
          });
          let visibleCount = newIndex;
          let newMiddle = visibleCount / 2;

          chart.series.each(function (series) {
            let trueIndex = chart.series.indexOf(series);
            let newIndex = series.dummyData;

            let dx = (newIndex - trueIndex + middle - newMiddle) * delta;

            series.animate(
              { property: "dx", to: dx },
              series.interpolationDuration,
              series.interpolationEasing
            );
            series.bulletsContainer.animate(
              { property: "dx", to: dx },
              series.interpolationDuration,
              series.interpolationEasing
            );
          });
        }
      }
    }

    // chart.colors.step = 2;

    // chart.data = this.potentialSave;
    // // Create axes
    // var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "month";
    // // categoryAxis.title.text = "Months";
    // categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.minGridDistance = 20;
    // categoryAxis.renderer.cellStartLocation = 0.1;
    // categoryAxis.renderer.cellEndLocation = 0.9;

    // var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.min = 0;
    // valueAxis.title.text = "Savings";

    // // Create series
    // function createSeries(field, name, stacked) {
    //   var series = chart.series.push(new am4charts.ColumnSeries());
    //   series.dataFields.valueY = field;
    //   series.dataFields.categoryX = "month";
    //   series.name = name;
    //   if (stacked) {
    //     series.stroke = am4core.color("rgb(238,234,181)");
    //     series.columns.template.tooltipText = "{name}: €[bold]{valueY}[/]";
    //   } else {
    //     series.stroke = am4core.color("rgb(9,117,218)");
    //     series.columns.template.tooltipText = "{name}: $[bold]{valueY}[/]";
    //   }

    //   series.stacked = stacked;
    //   series.columns.template.width = am4core.percent(95);
    //   series.columns.template.adapter.add("fill", function (fill, target) {
    //     if (stacked) {
    //       series.stroke = am4core.color("rgb(238,234,181)");
    //       return am4core.color("rgb(238,234,181)");
    //     } else {
    //       series.stroke = am4core.color("rgb(9,117,218)");
    //       return am4core.color("rgb(9,117,218)");
    //     }
    //   });

    //   return series;
    // }

    // createSeries("awslow", "Low", false);
    // createSeries("nttlow", "Low", true);
    // createSeries("awsmedium", "Medium", false);
    // createSeries("nttmedium", "Medium", true);
    // createSeries("awshigh", "High", false);
    // createSeries("ntthigh", "High", true);

    // // Add legend
    // chart.legend = new am4charts.Legend();
    // chart.legend.parent = chart.chartContainer;
    // chart.legend.data = [{ 'name': 'AWS', 'fill': 'rgb(9,117,218)' }, { 'name': 'ECL2', 'fill': 'rgb(238,234,181)' }]
  }
}
