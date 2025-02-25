import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
    } from "ng-apexcharts";
import * as moment from "moment";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { ActivatedRoute } from "@angular/router";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as Papa from "papaparse";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  };
@Component({
  selector: 'app-monitoring-chart',
  templateUrl: './monitoring-chart.component.html',
  styleUrls: ['./monitoring-chart.component.css']
})
export class MonitoringChartComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  @Input() synthetic: any = [];
  syntheticsummary = [];
  chartdata = {};
  loading: boolean = false;
  daterange = [new Date(), new Date()];
  region = [];
  availableregions = [];
  currentTab = 0;
  syntheticHeader = [];
  tableConfig = {
    loading: false,
    pagination: true,
    rightsize: false,
    frontpagination: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  userstoragedata: any;
  timerange = '';
  uptimepercent;
  constructor(private httpService: HttpHandlerService, private routes: ActivatedRoute, private localStorageService: LocalStorageService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    // console.log(this.routes);
    // console.log(this.routes.snapshot.queryParams)
    // this.routes.params.subscribe((params) => {
    //   console.log(params);
    //   if (params.id) {
    //     this.getMonitoringDtl(Number(params.id));
    //   }
    // })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.synthetic && changes.synthetic.currentValue) {
      this.synthetic = changes.synthetic.currentValue;
      let regions = this.synthetic.availableregions.split(',');
      this.availableregions = regions;
      this.getSyntheticReport();
      this.getURLUptime();
          }
  }

  ngOnInit() {
  }

  // getMonitoringDtl(id) {
  //   let endpoint = AppConstant.API_END_POINT +
  //     AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.MONITORING_LIST;
  //   let query = `?tenantid=${this.userstoragedata.tenantid}`;
  //   const condition = {
  //     syntheticid: id
  //   }
  //   this.httpService
  //     .POST(
  //       endpoint + query, condition
  //     )
  //     .subscribe(
  //       (result) => {
  //         let response = JSON.parse(result._body);
  //         if (response.status) {
  //           this.synthetic = response.data[0];
  //           let regions = this.synthetic.availableregions.split(',');
  //           this.availableregions = regions;
  //           this.getSyntheticReport();
  //           this.prepareChartData([]);
  //         } else {

  //         }
  //       })
  // }


  getURLUptime(date?) {
    try {
      this.loading = true;
      let condition = {
        url: (this.synthetic.url).replace(/^https?:\/\//, "").split("/")[0],
        startdate: moment().format("YYYY-MM-DD") + ' 00:00:00',
        enddate: moment().format("YYYY-MM-DD") + ' 23:59:59',
      }
      if (date) {
        condition['startdate'] = moment(date[0]).format("YYYY-MM-DD") + ' 00:00:00';
        condition['enddate'] = moment(date[1]).format("YYYY-MM-DD") + ' 23:59:59';
      }
      if(this.region.length > 0){
        condition['region'] = this.region;
      }
      this.httpService
        .POST(
          AppConstant.DashBoardAPIURL +
          '/cloudmatiq/syntheticmetric/uptime',
          condition
        ).subscribe((result) => {
          let response = JSON.parse(result._body);
          console.log(response);
          if (response.status) {
            this.uptimepercent = response.uptime + '%';
          }
          this.loading = true;
        });

    } catch (e) {
      console.log('Error', e)
    }
  }


  getSyntheticReport(date?) {
    try {

      let condition = {
        tenantid: 7,
        status: AppConstant.STATUS.ACTIVE,
        startdate: moment().format("YYYY-MM-DD") + ' 00:00:00',
        enddate: moment().format("YYYY-MM-DD") + ' 23:59:59',
      };
      if (date) {
        condition['startdate'] = moment(date[0]).format("YYYY-MM-DD") + ' 00:00:00';
        condition['enddate'] = moment(date[1]).format("YYYY-MM-DD") + ' 23:59:59';
      }
      const settings = {
        "yaxisList": [
          {
            "yaxis": {
              "fieldname": "Response Time",
              "fieldkey": "responsetime",
              "fieldvalue": "RESPONSETIME"
            },
            "aggregate": "avg",
            "seriesname": "Response Time"
          }
        ],
        "order": "Desc",
        "xaxis": {
          "fieldname": "Date",
          "fieldkey": "createddt"
        },
        "xaxisname": "Date"
      };
      condition["settings"] = settings;
      condition["filters"] = [
        {
          "url": [
            {
              "title": this.synthetic.url,
              "value": (this.synthetic.url).replace(/^https?:\/\//, "").split("/")[0]
            }
          ]
        }
      ];

      if (this.region.length > 0) {
        condition["filters"].push({ region: this.region });
      }

      this.loading = true;
      this.httpService
        .POST(
          AppConstant.DashBoardAPIURL +
          '/cloudmatiq/syntheticmetric/chart',
          condition
        ).subscribe((result) => {
          this.loading = false;
          let response = JSON.parse(result._body);
          if (response) {
            response.chart.map((e) => {
              if (e.name && condition["filters"][0]['url']) {
                let url = _.find(condition["filters"][0]['url'], { value: e.name });
                if (url) {
                  e.name = url['title'];
                }
              }
              return e;
            });
            this.syntheticHeader = [];
            this.syntheticHeader = [{
              field: settings.xaxis.fieldkey,
              header: settings.xaxis.fieldname,
              datatype: "string",
              show: true,
            }];
            if(settings.xaxis.fieldkey == 'createddt'){
              this.syntheticHeader[0]['datatype'] = "timestamp";
              this.syntheticHeader[0]['format'] = "dd-MMM-yyyy HH:mm:ss";

            }
            settings.yaxisList.map((y, i) => {
              this.syntheticHeader.push({
                field: y.yaxis.fieldkey,
                header: y.yaxis.fieldname,
                datatype: "string",
                show: true
              }
              )
            });
            // details.data = [];
            let yaxis_rs = _.find(settings.yaxisList, function (e) { return e.yaxis.fieldkey == 'responsetime' });
            if (yaxis_rs) {
              this.syntheticHeader.push({
                field: 'url',
                header: 'URL',
                datatype: "string",
                show: true,
                fieldname: 'URL',
                fieldkey: 'url'
              }, {
                field: 'region',
                header: 'Region',
                datatype: "string",
                show: true,
                fieldname: 'Region',
                fieldkey: 'region'
              });
            }
            response['details'].map((r) => {
              let obj = {};
              obj[settings.xaxis.fieldkey] = settings.xaxis.fieldkey == 'createddt' ? moment(r['_id'][settings.xaxis.fieldkey]).format('DD-MMM-YYYY HH:mm:ss') : r['_id'][settings.xaxis.fieldkey];
              settings.yaxisList.map((e) => {
                if (e.yaxis.fieldkey == 'responsetime') {
                  obj[e.yaxis.fieldkey] = r['_id'][e.yaxis.fieldkey] + 'ms';
                  obj['url'] = r['_id']['url'];
                }
                else if (e.yaxis.fieldvalue == 'PASSED') obj[e.yaxis.fieldkey] = r[e.yaxis.fieldname];
                else if (e.yaxis.fieldvalue == 'FAILED') obj[e.yaxis.fieldkey] = r[e.yaxis.fieldname];
              });
              obj['region'] = (r['_id']['region']) ? r['_id']['region'] : ''
              this.syntheticsummary.push(obj)
            });
            this.chartdata = this.prepareChartData(response.chart);
          }
        });
    } catch (e) {
      console.log('catch', e)
    }
  }

  prepareChartData(series) {
    let obj = {} as any;
    obj = {
      series: series,
      chart: {
        type: 'line',
        height: 450,
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
        type: "datetime",
        labels: {
          rotateAlways: true,
          hideOverlappingLabels: true,
          trim: false,
          datetimeUTC: false,
          style: {
            colors: "#ffffff",
          },
          formatter: function (value, timestamp) {
            return moment(timestamp).format("DD-MMM-YYYY HH:mm");// The formatter function overrides format property
          },
        },
        title: {
          text: 'Date',
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
          text: 'Response Time (ms)',
          style: {
            color: "#ffffff",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        theme: "dark",
        x: {

        },
        fixed: {
          enabled: true,
          position: "bottomLeft",
          offsetX: 0,
          offsetY: 0,
        },
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
        position: "bottom",
        labels: {
          colors: "#f5f5f5",
        },
        formatter: function (seriesName, opts) {
          return [
            seriesName
          ];
        },
      },
    };
    obj['xaxis']['type'] = 'datetime';
    obj['xaxis']['labels']['datetimeUTC'] = false;
    obj['tooltip']['x']['show'] = true;
    obj['tooltip']['x']['format'] = 'dd-MMM-yyyy HH:mm';
    obj['tooltip']['x']['formatter'] = function (val) {
      return moment(val).format("DD-MMM-YYYY HH:mm")
    }
    // obj['tooltip']['y']['formatter'] = function (val) {
    //   return val + ' ms'
    // };
    // obj['legend']['formatter'] = function (seriesName, opts) {
    //   return seriesName;
    // }
    return obj;
  }

  onChangeView(i) {
    this.currentTab = i;
  }

  downloadCSV() {
    let data: any = [];
    let csvheaders = _.map(this.syntheticHeader, function (o: any) { return o.header });
    let headers = _.map(this.syntheticHeader, function (o: any) { return o.field });
    _.map(this.syntheticsummary, function (value) {
      let obj = [];
      headers.map((o) => {
        if (value[o] != undefined) {
          obj.push(o == 'createddt'? moment(value[o]).format('DD-MMM-YYYY HH:mm:ss') : value[o])
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
    tempLink.setAttribute("download", `${new URL(this.synthetic.url).hostname}-${moment().format('DD-MMM-YYYY')}.csv`);
    tempLink.click();
  }

 }
