import { Component, OnInit } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { PatchingConstant } from "src/app/patching.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
export type overallpatch_status = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
}
export type complianceTrend = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
}
export type stackedChart = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
}
export type teamPatchStatus = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};

export type patchWindowCompliance = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
}
export type patchFailure = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  stroke: ApexStroke;
  fill: ApexFill;
};

@Component({
  selector: "app-dashboard-patching",
  templateUrl: "./patching.component.html",
  styleUrls: ["./patching.component.css"],
})
export class DashboardPatchingComponent implements OnInit {
  userstoragedata = {} as any;
  screens: any = [];
  appScreens: any = [];
  chart: any;
  chartOptions: any;
  lineChart: any;
  barChart: any;
  osChart: any;
  ageChart: any;
  stackedChart: any;
  patchFailchart: any;
  teamPatchChart: any;
  patchWindowComplianceChart: any;
  dayChart:any;
  cardsData = PatchingConstant.CARDSDATA;
  overallpatch_status = PatchingConstant.OVERALLPATCH_STATUS;
  complianceTrend = PatchingConstant.COMPLIANCE_TREND;
  patchSeverity = PatchingConstant.PATCH_SEVERITY;
  os_distribution = PatchingConstant.OS_DISTRIBUTION;
  patchAge_distribution = PatchingConstant.AGE_DISTRIBUTION;
  locationBased_compliance = PatchingConstant.LOCATIONBASED_COMPLIANCE;
  patchFailure = PatchingConstant.PATCHFAILURE;
  teamPatchStatus = PatchingConstant.TEAM_PATCH_STATUSES;
  patchWindowCompliance = PatchingConstant.PATCH_WINDOW_COMPLIANCE;
  daywisePatchCompliance = PatchingConstant.DAYWISE_PATCH_COUNT;
  constructor(private localStorageService: LocalStorageService) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PATCHING,
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.overallPatchStatusChart();
    this.complianceTrendChart();
    this.patcheSeverityChart();
    this.distributionChart();
    this.ageDistributionChart();
    this.locationBasedChart();
    this.patchFailureChart();
    this.getTeamPatchStatus();
    this.getPatchWindowCompliance();
    this.daywisepatchStatus();
  }
  // Overall Patch Status
  overallPatchStatusChart() {
    this.chartOptions = {
      series: this.overallpatch_status.map((item) => item.values),
      chart: {
        type: "pie",
        height: 350,
      },
      labels: this.overallpatch_status.map((item) => item.lable),
      colors: ["#10B981", "#F59E0B", "#EF4444", "#6B7280"],
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
          useSeriesColors: false,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number, opts: any) {
          const total = opts.w.globals.seriesTotals.reduce((acc: number, curr: number) => acc + curr, 0);
          const percentage = (opts.w.globals.series[opts.seriesIndex] / total) * 100;
          return percentage.toFixed(1) + "%";
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val;
          },
        },
      },
    };
  }
  // Compliance Trend
  complianceTrendChart() {
    this.lineChart = {
      series: this.complianceTrend.map((value) => ({
        name: value.name,
        data: value.data.map((d) => d.data),
      })),
      chart: {
        type: "line",
        height: 305,
        toolbar: {
          show: false,
        },
      },
      colors: ["#00E396", "#FEB019"],
      stroke: {
        width: 1,
        curve: "smooth",
      },
      xaxis: {
        categories: this.complianceTrend[0].data.map((d) => d.month),
        title: {
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        title: {
          text: "Compliance (%)",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
          formatter: function (value: number) {
            return Math.round(value).toString();
          },
        },
        max: 100,
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
        y: {
          formatter: function (val: number) {
            return val.toFixed(2) + " %";
          },
        },
      },
      markers: {
        size: 3,
        // colors: ["#000000"],
        // strokeColors: "#00E396",
        strokeWidth: 2,
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: {
          colors: "#FFFFFF",
        },
      },
    };
  }
  // Patches by Severity
  patcheSeverityChart() {
    const categories = this.patchSeverity.map((item) => item.label);
    const pendingData = this.patchSeverity.map((item) => item.value.Pending);
    const installedData = this.patchSeverity.map(
      (item) => item.value.Installed
    );

    this.barChart = {
      series: [
        { name: "Pending", data: pendingData },
        { name: "Installed", data: installedData },
      ],
      chart: {
        type: "bar",
        height: 305,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
        },
      },
      colors: ["#FF4560", "#00E396"],
    };
  }
  // OS Distribution
  distributionChart() {
    const categories = this.os_distribution.map((item) => item.name);
    const systemsData = this.os_distribution.map((item) => item.systems);
    this.osChart = {
      series: [{ name: "Systems", data: systemsData }],
      chart: {
        type: "bar",
        height: 305,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
        },
      },
      colors: ["#6366F1"],
    };
  }
  // Patch Age Distribution
  ageDistributionChart() {
    const categories = this.patchAge_distribution.map((item) => item.name);
    const systemsData = this.patchAge_distribution.map((item) => item.systems);
    this.ageChart = {
      series: [{ name: "Systems", data: systemsData }],
      chart: {
        type: "bar",
        height: 305,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
        },
      },
      colors: ["#8B5CF6"],
    };
  }
  // Location-Based Compliance
  locationBasedChart() {
    const categories = this.locationBased_compliance.map((item) => item.label);
    const compliantData = this.locationBased_compliance.map(
      (item) => item.value.Compliant
    );
    const nonCompliantData = this.locationBased_compliance.map(
      (item) => item.value["Non-Compliant"]
    );

    this.stackedChart = {
      series: [
        { name: "Compliant", data: compliantData },
        { name: "Non-Compliant", data: nonCompliantData },
      ],
      chart: {
        type: "bar",
        height: 305,
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
        },
      },
      colors: ["#00E396", "#FF4560"],
    };
  }
  // Patch Failure Reasons
  patchFailureChart() {
    this.patchFailchart = {
      series: this.patchFailure.map((item) => item.values),
      chart: {
        type: "polarArea",
        height: 350,
      },
      labels: this.patchFailure.map((item) => item.lable),
      colors: ["#D92626", "#D9D926", "#26D926", "#26D9D9", "#2626D9"],
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
          useSeriesColors: false,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number, opts: any) {
          return (
            opts.w.globals.series[opts.seriesIndex]
          );
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val;
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 250,
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  // TeamPatchStatus
  getTeamPatchStatus() {
    this.teamPatchChart = {
      series: this.teamPatchStatus,
      chart: {
        type: 'bar',
        height: 305,
        stacked: true,
        // stackType: '100%'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ['Infrastructure', 'Database', 'Application', 'Security', 'DevOps'],
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      fill: {
        opacity: 1
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
        },
      },
      colors: ["#00E396", "#FF8745", "#FF4560"],
    };
  }

  // PatchingWindowCompliance
  getPatchWindowCompliance() {
    this.patchWindowComplianceChart = {
      series: this.patchWindowCompliance,
      chart: {
        type: 'bar',
        height: 305,
        stacked: true,
        // stackType: '100%'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "30%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        // type: 'datetime',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      fill: {
        opacity: 1
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#FFFFFF",
        },
      },
      colors: ["#00E396", "#FF4560"],
    };
  }

  // Day wise patch status
  daywisepatchStatus(){
    this.dayChart = {
      series: [
        {
          name: "Patch Count",
          data: this.daywisePatchCompliance.map((d) => d.value),
        },
      ],
      chart: {
        type: "line",
        height: 304,
        toolbar: {
          show: false,
        },
      },
      colors: ["#00E396"],
      stroke: {
        width: 2,
        curve: "smooth",
      },
      xaxis: {
        categories: this.daywisePatchCompliance.map((d) => d.date),
        title: {
          text: "Date",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
      yaxis: {
        title: {
          text: "Count",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
          formatter: function (value: number) {
            return Math.round(value).toString();
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
        y: {
          formatter: function (val: number) {
            return val + " patches";
          },
        },
      },
      markers: {
        size: 4,
        strokeColors: "#00E396",
        strokeWidth: 2,
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: {
          colors: "#FFFFFF",
        },
      },
    };
  }
}
