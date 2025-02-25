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
import * as _ from "lodash";
import * as moment from "moment";

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
  selector: "app-usage-chart",
  templateUrl:
    "../../../../../../presentation/web/base/assets/monitoring-dashboard/usage-chart.component.html",
  styleUrls: ["./usage-chart.component.css"],
})
export class UsageChartComponent implements OnInit, OnChanges {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public memchartOptions: Partial<ChartOptions>;
  public diskchartOptions: Partial<ChartOptions>;
  public netchartOptions: Partial<ChartOptions>;
  loading = false;
  hasMore = true;
  utilizations = [];
  cpuDataList = [
    {
      date: "2021-03-17 01:00:00",
      minval: "2.3000",
      value: "2.3000",
      maxval: "2.3000",
    },
    {
      date: "2021-03-17 02:00:00",
      minval: "2.0900",
      value: "2.0933",
      maxval: " 2.1000",
    },
    {
      date: "2021-03-17 03:00:00",
      minval: "1.1700",
      value: "15.6267",
      maxval: "36.7200",
    },
    {
      date: "2021-03-17 04:00:00",
      minval: "0.1000",
      value: "3.2267",
      maxval: "0.1000",
    },
  ];
  memoryUtilList = [
    {
      date: "2021-03-17 01:00:00",
      minval: "8.0000",
      value: "8.0000",
      maxval: "8.0000",
    },
    {
      date: "2021-03-17 01:30:00",
      minval: "3.6400",
      value: "3.7600",
      maxval: "3.8300",
    },
    {
      date: "2021-03-17 02:00:00",
      minval: "3.9600",
      value: "4.0333",
      maxval: "4.0700",
    },
    {
      date: "2021-03-17 02:30:00",
      minval: "51.0400",
      value: "51.4133",
      maxval: "51.6600",
    },
  ];
  diskUtilList = [
    {
      date: "2021-03-17 01:00:00",
      minval: "65.4700",
      value: "130.2900",
      maxval: "189.3100",
    },
    {
      date: "2021-03-17 01:30:00",
      minval: "0.0000",
      value: "21.8167",
      maxval: "65.4500",
    },
    {
      date: "2021-03-17 02:00:00",
      minval: "0.0000",
      value: "43.6700",
      maxval: "131.0100",
    },
    {
      date: "2021-03-17 02:30:00",
      minval: "51.0400",
      value: "51.4133",
      maxval: "51.6600",
    },
  ];
  netUtilList = [
    {
      date: "2021-03-17 01:00:00",
      minval: "39.9100",
      value: "39.9100",
      maxval: "39.9100",
    },
    {
      date: "2021-03-17 01:30:00",
      minval: "19.5900",
      value: "49.8167",
      maxval: "64.9800",
    },
    {
      date: "2021-03-17 02:00:00",
      minval: "0.0000",
      value: "26.6033",
      maxval: "131.0100",
    },
    {
      date: "2021-03-17 02:30:00",
      minval: "51.0400",
      value: "366.7567",
      maxval: "971.6000",
    },
  ];
  constructor() {
    this.chartOptions = {
      series: [] as any,
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false,
        },
      } as any,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: "smooth",
        dashArray: [0, 0, 0],
      },
      title: {
        align: "left",
        style: {
          color: "#f5f5f5",
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
      markers: {
        size: 1,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        labels: {
          trim: false,
          style: {
            colors: "#f5f5f5",
          },
        },
        categories: (() => {})(),
      },
      yaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "",
          style: {
            color: "#f5f5f5",
          },
        },
      },
      tooltip: {
        shared: false,
        intersect: true,
        y: [
          {
            title: {
              formatter: function (val) {
                return val;
              },
            },
          },
          {
            title: {
              formatter: function (val) {
                return val + " per session";
              },
            },
          },
          {
            title: {
              formatter: function (val) {
                return val;
              },
            },
          },
        ],
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    } as any;
  }

  ngOnInit() {
    this.getCPUUsage();
    this.getMemoryUsage();
    this.getDiskUsage();
    this.networkUsage();
    this.utilizations = [
      {
        title: "CPU Utilization",
        list: this.cpuDataList,
        option: this.chartOptions,
      },
      {
        title: "Memory Utilization",
        list: this.memoryUtilList,
        option: this.memchartOptions,
      },
      {
        title: "Disk Utilization",
        list: this.diskUtilList,
        option: this.diskchartOptions,
      },
      {
        title: "Network Utilization",
        list: this.netUtilList,
        option: this.netchartOptions,
      },
    ];
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getCPUUsage();
  }
  onScroll() {}
  networkUsage() {
    this.netchartOptions = {
      ...this.chartOptions,
    };
    this.netchartOptions.series = [
      {
        name: "Minimum",
        data: this.netUtilList.map((o) => parseFloat(o["minval"]).toFixed(2)),
      },
      {
        name: "Average",
        data: this.netUtilList.map((o) => parseFloat(o["value"]).toFixed(2)),
      },
      {
        name: "Maximum",
        data: this.netUtilList.map((o) => parseFloat(o["maxval"]).toFixed(2)),
      },
    ] as any;
    this.netchartOptions.xaxis.categories = this.netUtilList.map((o) =>
      moment(o["date"]).format("HH:mm")
    );
    this.netchartOptions.yaxis.title.text = "Network Utilization(%)";
  }
  getDiskUsage() {
    this.diskchartOptions = {
      ...this.chartOptions,
    };
    this.diskchartOptions.series = [
      {
        name: "Minimum",
        data: this.diskUtilList.map((o) => parseFloat(o["minval"]).toFixed(2)),
      },
      {
        name: "Average",
        data: this.diskUtilList.map((o) => parseFloat(o["value"]).toFixed(2)),
      },
      {
        name: "Maximum",
        data: this.diskUtilList.map((o) => parseFloat(o["maxval"]).toFixed(2)),
      },
    ] as any;
    this.diskchartOptions.xaxis.categories = this.diskUtilList.map((o) =>
      moment(o["date"]).format("HH:mm")
    );
    this.diskchartOptions.yaxis.title.text = "";
    this.diskchartOptions.yaxis.title.text = "Disk Utilization(%)";
  }
  getMemoryUsage() {
    this.memchartOptions = {
      ...this.chartOptions,
    };
    this.memchartOptions.series = [
      {
        name: "Minimum",
        data: this.memoryUtilList.map((o) =>
          parseFloat(o["minval"]).toFixed(2)
        ),
      },
      {
        name: "Average",
        data: this.memoryUtilList.map((o) => parseFloat(o["value"]).toFixed(2)),
      },
      {
        name: "Maximum",
        data: this.memoryUtilList.map((o) =>
          parseFloat(o["maxval"]).toFixed(2)
        ),
      },
    ] as any;
    this.memchartOptions.xaxis.categories = this.memoryUtilList.map((o) =>
      moment(o["date"]).format("HH:mm")
    );
    console.log(this.memchartOptions.xaxis.categories);
    this.memchartOptions.yaxis.title.text = "Memory Utilization(%)";
    this.memchartOptions.chart.toolbar.show = false;
    this.memchartOptions = {
      ...this.memchartOptions,
    };
  }
  getCPUUsage() {
    this.chartOptions = {
      series: [
        {
          name: "Minimum",
          data: this.cpuDataList.map((o) => parseFloat(o["minval"]).toFixed(2)),
        },
        {
          name: "Average",
          data: this.cpuDataList.map((o) => parseFloat(o["value"]).toFixed(2)),
        },
        {
          name: "Maximum",
          data: this.cpuDataList.map((o) => parseFloat(o["maxval"]).toFixed(2)),
        },
      ] as any,
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false,
        },
      } as any,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 5,
        curve: "smooth",
        dashArray: [0, 0, 0],
      },
      title: {
        align: "left",
        style: {
          color: "#f5f5f5",
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
      markers: {
        size: 1,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        labels: {
          trim: false,
          style: {
            colors: "#f5f5f5",
          },
        },
        categories: (() => {
          return this.cpuDataList.map((o) => moment(o["date"]).format("HH:mm"));
        })(),
      },
      yaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: "CPU Utilization(%)",
          style: {
            color: "#f5f5f5",
          },
        },
      },
      tooltip: {
        shared: false,
        intersect: true,
        y: [
          {
            title: {
              formatter: function (val) {
                return val;
              },
            },
          },
          {
            title: {
              formatter: function (val) {
                return val + " per session";
              },
            },
          },
          {
            title: {
              formatter: function (val) {
                return val;
              },
            },
          },
        ],
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    };
  }
}
