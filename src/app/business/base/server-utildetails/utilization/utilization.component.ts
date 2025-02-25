import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
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

// import * as am4core from "@amcharts/amcharts4/core";
// import * as am4maps from "@amcharts/amcharts4/maps";
// import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
// import * as am4charts from "@amcharts/amcharts4/charts";
// import am4themes_animated from "@amcharts/amcharts4/themes/animated";
// import am4themes_dark from "@amcharts/amcharts4/themes/amchartsdark";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { JsonCsvCommonService } from "src/app/modules/services/shared/jsoncsv.service";
import { ServerUtilsService } from "../services/server-utils.service";
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
  selector: "app-server-detail-utilization",
  templateUrl:
    "../../../../presentation/web/base/server-utildetails/utilization.component.html",
})
export class ServerDetailUtilizationComponent implements OnInit, OnChanges {
  @Input() configs: {
    utiltype: string;
    utilkey: string;
    instancerefid: string;
    instancename: string;
    instancetyperefid: string;
    date: string;
    tenantid: number;
    utilkeyTitle: string;
  };
  @Input() headers: {
    utype: string;
    provider: string;
    customerid: number;
    instancerefid: string;
  };

  userstoragedata: any = {};
  serverObj: any = {};
  customerObj: any = {};
  listType = "chart";
  current = "CPU";
  filters = {
    daterange: [new Date(), new Date()],
    provider: "ECL2",
    customerid: -1,
    instanceid: -1,
    instancename: "",
    utilkey: "CPU_UTIL",
  } as any;
  chartDataList: any = [];

  instancename: "-";
  subtenantname: "-";
  cloudprovider: "-";
  instancetyperefid: "-";
  utiltype: "-";

  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];

  cardViewList: any = [
    {
      label: "Average",
      value: "8.7 GHz",
    },
    {
      label: "Maximum",
      value: "12.5 GHz",
    },
    {
      label: "Minimum",
      value: "5.5 GHz",
    },
  ];

  @ViewChild("chart") chart: ChartComponent;
  chartOptions: Partial<ChartOptions>;

  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private assetUtilService: AssetUtilsService,
    private jsonCsvService: JsonCsvCommonService,
    private messageService: NzMessageService,
    private serverUtilsService: ServerUtilsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getServer(this.serverObj.instancenameid);
    this.getCustomer(this.customerObj.customernameid);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("Changes to input config");
    console.log(changes);
    if (changes && changes.configs) {
      this.filters["daterange"] = [
        this.configs.date + "T00:00:00",
        this.configs.date + "T23:59:59",
      ];
      this.current = this.configs.utiltype;
      this.filters["instancerefid"] = this.configs.instancerefid;
      this.filters["utilkey"] = this.configs.utilkey;
      if (this.configs.instancerefid) {
        this.getInfluxData();
      }
    }
  }
  ngOnInit() {}

  drawChart() {
    console.log("DRAW CHART FOR:::::::::::::::");
    console.log(this.chartDataList);

    if (this.chartDataList && this.chartDataList.length > 0) {
      this.chartOptions = {
        series: [
          {
            name: "Utilization",
            data: this.chartDataList.map((o) =>
              parseFloat(o["mean"]).toFixed(2)
            ),
          },
        ],
        chart: {
          height: 300,
          type: "line",
          toolbar: {
            show: false,
          },
        },
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
            formatter: function (value, timestamp) {
              return value; // The formatter function overrides format property
            },
          },
          categories: this.chartDataList.map((o) => o["time"]),
        },
        yaxis: {
          labels: {
            style: {
              colors: "#f5f5f5",
            },
          },
          title: {
            text: this.configs.utilkeyTitle,
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
          ],
        },
        grid: {
          borderColor: "#f1f1f1",
        },
      };
    }
  }
  getInfluxData() {
    let condition = {} as any;
    let startdate = this.filters.daterange[0];
    let enddate = this.filters.daterange[1];
    condition = {
      startdate: startdate,
      enddate: enddate,
      utiltype: this.current,
      instancerefid: this.filters.instancerefid,
      // instancerefid: 1,
      utilkey: this.filters.utilkey,
      tenantid: this.userstoragedata.tenantid,
      detailed: "Y",
      duration: "1h",
    };
    this.assetUtilService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.chartDataList = [];
        response.data.forEach((asset) => {
          if (asset.mean) {
            asset.on = moment(asset["time"]).format("DD-MMM-YYYY");
            asset.time = moment(asset["time"]).format("HH:mm");
            asset.mean = parseInt(asset.mean).toFixed(2);
            this.chartDataList.push(asset);
          }
        });
        this.drawChart();
      } else {
        this.chartDataList = [];
        this.drawChart();
      }
    });
  }
  getChartData() {
    let condition = {} as any;
    let startdate = this.filters.daterange[0];
    let enddate = this.filters.daterange[1];
    condition = {
      startdate: startdate,
      enddate: enddate,
      utiltype: this.current,
      instancerefid: this.filters.instancerefid,
      utilkey: [this.filters.utilkey],
      tenantid: this.userstoragedata.tenantid,
      detailed: "Y",
    };
    this.commonService.getServerUtil(condition, true).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.chartDataList = response.data;
        this.chartDataList.forEach((asset) => {
          asset.time = moment(asset["date"]).format("HH:mm");
          asset.on = moment(asset["date"]).format("DD-MMM-YYYY");
          return asset;
        });
        this.drawChart();
      } else {
        this.chartDataList = [];
        this.drawChart();
      }
    });
  }
  downloadAssets() {
    if (this.chartDataList) {
      let tableHeader = [
        { field: "on", header: "Date", datatype: "string" },
        { field: "time", header: "Time", datatype: "string" },
        {
          field: "value",
          header: this.configs.utilkeyTitle,
          datatype: "string",
        },
        {
          field: this.customerObj.customername,
          header: "Customer",
          datatype: "string",
        },
        {
          field: this.serverObj.instancename,
          header: "Instance",
          datatype: "string",
        },
        {
          field: this.headers.provider,
          header: "Provider",
          datatype: "string",
        },
      ] as any;
      let columns: any = [];
      let filterList: any = [];
      columns = _.map(tableHeader, function (value) {
        return value.field;
      });

      this.chartDataList.forEach((asset) => {
        let obj = _.pick(asset, columns);
        let subobj: any = {};
        tableHeader.forEach((head) => {
          subobj[head.header] = obj[head.field];
        });
        filterList.push(subobj);
      });
      let filename = this.serverObj.instancename;
      try {
        filename =
          filename +
          "(" +
          moment(this.filters.daterange[0]).format("DD-MMM-YYYY HH:mm:ss") +
          " to " +
          moment(this.filters.daterange[1]).format("DD-MMM-YYYY HH:mm:ss") +
          ")";
      } catch (e) {}

      this.jsonCsvService.downloadCSVfromJson(
        filterList.map((o) => {
          return {
            ...o,
            Customer: this.customerObj.customername,
            Instance: this.serverObj.instancename,
            Provider: this.headers.provider,
            Resource: this.headers.utype,
          };
        }),
        filename
      );
    }
  }

  getServer(id) {
    console.log("Going to get instance detail for:::::::::::");
    console.log(this.serverUtilsService.getItems());
    let instanceData = this.serverUtilsService.getItems();
    if (instanceData) {
      this.instancename = instanceData["instancename"];
      this.cloudprovider = instanceData["provider"];
      this.subtenantname = instanceData["customername"];
      this.utiltype = instanceData["utilkey"];
      this.instancetyperefid = instanceData["instancetyperefid"];
    }
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      instanceid: this.filters.instanceid,
    };
    this.commonService.allInstances(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.serverObj = response.data[0];
      } else {
        this.serverObj = {};
      }
    });
  }
  getCustomer(id) {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      customerid: id,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerObj = response.data[0];
      } else {
        this.customerObj = {};
      }
    });
  }
}
