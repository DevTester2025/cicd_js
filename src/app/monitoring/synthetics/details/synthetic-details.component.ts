import { Component, OnInit, SecurityContext } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as ApexChart from "apexcharts";
import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { Canary, CanaryReport, CanaryRun, MSynthetics } from "../../interfaces";
import * as moment from "moment";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: "app-monitoring-synthetic-detail",
  templateUrl: "./synthetic-details.component.html",
  styles: [
    `
      .hdr-title {
        font-size: 12px;
      }
      .hdr-value {
        font-size: 20px;
        font-weight: 400;
      }
      .ant-card {
        width: 100%;
        background: #1c2e3c;
        color: white;
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
    `,
  ],
})
export class MonitoringSyntheticsDetailsComponent implements OnInit {
  userstoragedata = {} as any;
  tableHeader = [
    { field: "type", header: "Type", datatype: "string" },
    { field: "name", header: "Name", datatype: "string" },
    { field: "endpoint", header: "Endpoint", datatype: "string" },
    { field: "recurring", header: "Recurring", datatype: "string" },
    { field: "status", header: "Status", datatype: "string" },
    { field: "lastupdatedby", header: "Updated by", datatype: "string" },
    { field: "lastupdateddt", header: "Updated Date", datatype: "timestamp" },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    manualsearch: false,
    manualsorting: false,
    sortbyList: [],
    view: true,
    chart: true,
    loading: false,
    pagination: true,
    rightsize: true,
    frontpagination: true,
    manualpagination: true,
    selection: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  monitoringLists = [];
  loading = true;
  chart: ApexChart | null = null;
  currentStep = 1;

  selectedDuration = 1;
  record = null as null | MSynthetics;
  canaryRecord = null as null | Canary;
  canaryRuns = null as null | CanaryRun[];
  selectedRun = null as null | CanaryRun;

  runReport = null as null | CanaryReport;
  logReport = null as null | string;
  har = null as null | SafeUrl;
  screenshots = null as null | Record<string, string>;

  constructor(
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getDetails();
  }

  getDetails() {
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.GET_BY_ID +
          this.route.snapshot.paramMap.get("id") +
          "?start=" +
          this.selectedDuration
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.record = response["record"];
          this.canaryRecord = response["$meta"];
          this.canaryRuns = response["$runs"];
          this.loading = false;
          setTimeout(() => {
            this.drawChart();
          }, 500);
        },
        (err) => {
          this.loading = false;
          this.message.error("Error getting monitoring lists.");
          console.log(err);
        }
      );
  }

  drawChart() {
    const el = document.querySelector("#chart");

    if (this.chart) {
      this.chart.destroy();
    }

    var options = {
      series: [
        {
          name: "Success",
          data: [
            ...this.canaryRuns
              .filter((c) => c.Status.State == "PASSED")
              .map((c) => {
                return [new Date(c.Timeline.Completed).getTime(), 1];
              }),
          ],
        },
        {
          name: "Unknown",
          data: [
            ...this.canaryRuns
              .filter(
                (c) => c.Status.State != "FAILED" && c.Status.State != "PASSED"
              )
              .map((c) => {
                return [new Date(c.Timeline.Completed).getTime(), 0.5];
              }),
          ],
        },
        {
          name: "Failed",
          data: [
            ...this.canaryRuns
              .filter((c) => c.Status.State == "FAILED")
              .map((c) => {
                return [new Date(c.Timeline.Completed).getTime(), 0];
              }),
          ],
        },
      ],
      chart: {
        type: "scatter",
        height: "350",
        toolbar: {
          show: true,
          tools: {
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
          },
        },
        zoom: {
          enabled: true,
          type: "xy",
        },
        events: {
          click: (event, chartContext, config) => {
            if (config.seriesIndex == 2) {
              this.selectedRun = this.canaryRuns.filter(
                (c) => c.Status.State == "FAILED"
              )[config.dataPointIndex];
            } else if (config.seriesIndex == 0) {
              this.selectedRun = this.canaryRuns.filter(
                (c) => c.Status.State == "PASSED"
              )[config.dataPointIndex];
            }
            this.getArtifacts();
          },
        },
      },
      colors: ["#247BA0", "#FFFFFF", "#FF1654"],
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          show: true,
          style: {
            colors: "#f5f5f5",
            cssClass: "apexcharts-xaxis-label",
          },
          formatter: function (val) {
            const diff = moment
              .duration(moment(new Date()).diff(moment(new Date(val))))
              .asHours();
            return diff < 24
              ? moment(new Date(val)).format("hh:mm:ss A")
              : moment(new Date(val)).format("dd-MMM");
          },
        },
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
            text: "",
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
      tooltip: {
        theme: "dark",
      },
      legend: {
        position: "right",
        offsetY: 40,
        labels: {
          colors: "#f5f5f5",
        },
      },
      fill: {
        opacity: 1,
      },
    } as any;

    this.chart = new ApexChart(el, options);
    this.chart.render();
  }

  sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getArtifacts() {
    let path = this.selectedRun["ArtifactS3Location"];
    let pathArr = path.split("/");
    pathArr.shift();

    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.GET_ARTIFACTS_BY_ID.replace(
            "{id}",
            this.route.snapshot.paramMap.get("id")
          ),
        {
          path: pathArr.join("/") + "/",
        }
      )
      .subscribe(
        async (result) => {
          let response = JSON.parse(result._body);

          if (response["message"]) {
            this.message.error(response["message"]);
            return;
          }

          this.runReport = response["json"];
          this.logReport = response["log"];
          this.screenshots = response["screenshots"];
          this.har = this.sanitizeURL(response["har_url"]);
        },
        (err) => {
          this.loading = false;
          this.message.error("Error getting details.");
          console.log(err);
        }
      );
  }

  getScreenShot(
    screenshots: {
      fileName: string;
      pageUrl: string;
    }[]
  ) {
    const images = screenshots.map((s) => {
      return {
        source: this.sanitizeURL(this.screenshots[s.fileName]),
        alt: s.fileName,
        title: s.fileName,
      };
    });
    return images;
  }

  getDuration(start: string, end: string) {
    return new Date(end).getTime() - new Date(start).getTime();
  }
  refresh(){ //#OP_428
    this.getDetails();  
  }
}
