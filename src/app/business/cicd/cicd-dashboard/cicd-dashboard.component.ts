import { Component, OnInit } from "@angular/core";
import { CicdDashboardService } from "./cicd-dashboard.service";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { Socket } from "ngx-socket-io";
import * as _ from "lodash";
import { Router } from "@angular/router";
@Component({
  selector: "app-cicd-dashboard",
  templateUrl: "./cicd-dashboard.component.html",
  styleUrls: ["./cicd-dashboard.component.css"],
})
export class CicdDashboardComponent implements OnInit {
  datapiechart: any;
  chartOptions: any; // Add data for Spline Area Chart
  options: any;
  data: any;
  loading = true;
  successcount: any = 0;
  failedcount: any = 0;
  inprogresscount: any = 0;
  cancelledcount: any = 0;
  successcountPercentage: any = 0;
  failedcountPercentage: any = 0;
  inprogresscountPercentage: any = 0;
  cancelledcountPercentage:any = 0;
  pendingcountPercentage: any = 0;
  success: any = 0;
  failed: any = 0;
  inprogress: any = 0;
  cancelled: any = 0;
  userstoragedata = {} as any;
  filterChartOptions = AppConstant.CICD.dashboardChartfilter;
  filterProgressBar = AppConstant.CICD.dashboardProgressBarfilter;
  selectedChartFilter: string = "ALL";
  days: any = "7";
  successstatus: string = "COMPLETED";
  failedstatus: string = "FAILED";
  statusdata: any = 0;
  chart: any;
  allData: any;
  pending: any = 0;
  pendingcount: any = 0;
  lastdays: number = 7;
  successData: any[] = [];
  failedData: any[] = [];
  chartCategories: any[] = [];
  successrate: any = 0;
  selectedFilter: number = 7;
  deploymentFrequency: any = 0;
  pipelineDefaultDays: any = "7";
  socketStatus: any = "";
  selectedStatus: string = null;

  constructor(
    private cicdDashboardservice: CicdDashboardService,
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private socket: Socket,
    private router: Router
  ) {
    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });
    this.socket.on("connectedHrd", (data: any) => {
      if (!_.isEmpty(data)) {
        this.commonsocket();
      }
    });
    this.socket.on("addHookProcessHrd", (data: any) => {
      console.log(data);
      if (!_.isEmpty(data)) {
        if (this.socketStatus == "") {
          this.socketStatus = data.attributes.status;
          this.commonsocket();
        } else if (this.socketStatus !== data.attributes.status) {
          this.socketStatus = data.attributes.status;
          this.commonsocket();
          if ((this.socketStatus == AppConstant.CICD.STATUS.COMPLETED ||this.socketStatus == AppConstant.CICD.STATUS.FAILED||this.socketStatus == AppConstant.CICD.STATUS.CANCELLED) && this.socketStatus != "") {
            this.socketStatus = "";
          }
        }
      }
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.onFilterChange();
    this.filterData(this.days);
    this.initChart();
  }

  ngOnInit() {
    this.getCount(this.userstoragedata.tenantid);
  }
  selectData(event) {
    console.log("");
  }
  getCount(tenantid: number): void {
    this.loading = true;
    this.cicdDashboardservice.getCount(tenantid).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.successcount = response.data.SUCCESS;
        this.failedcount = response.data.FAILED;
        this.deploymentFrequency = response.data.DEPLOYMENTFREQUENCY;
        this.successrate = response.data.SUCCESSRATE;
        console.log("this.successrate", this.successrate);
        this.inprogresscount = response.data.INPROGRESS;
        this.pendingcount = response.data.PENDING;
      }
      this.loading = false;
    });
  }

  onFilterChange() {
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.DASHBOARD.PIPELINE_STATUS_COUNT +
      `?tenantid=${this.userstoragedata.tenantid}`;

    if (this.pipelineDefaultDays) {
      query += `&days=${this.pipelineDefaultDays}`;
    }

    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.success = response.data.SUCCESS;
        this.failed = response.data.FAILED;
        this.inprogress = response.data.INPROGRESS;
        this.pending = response.data.PENDING;
        this.cancelled = response.data.CANCELLED;
        this.successcountPercentage =
          (response.data.SUCCESS / response.data.TOTAL) * 100;
        this.failedcountPercentage =
          (response.data.FAILED / response.data.TOTAL) * 100;
        this.inprogresscountPercentage =
          (response.data.INPROGRESS / response.data.TOTAL) * 100;
        this.pendingcountPercentage =
          (response.data.PENDING / response.data.TOTAL) * 100;
        this.cancelledcountPercentage =
          (response.data.CANCELLED / response.data.TOTAL) * 100;
      }
    });
  }
  getpipelinestatus() {
    this.onFilterChange();
  }

  filterData(filtervalue) {
    this.loading = true;
    if (
      filtervalue == 7 ||
      filtervalue == 30 ||
      filtervalue == 6 ||
      filtervalue == 12
    ) {
      this.days = filtervalue;
      this.selectedFilter = filtervalue;
    }

    let query: string =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.DASHBOARD.PIPELINE_DTATUS_DAILY +
      `?tenantid=${this.userstoragedata.tenantid}`;

    if (this.days == 7 || this.days == 30) {
      query += `&days=${this.days}`;
    } else {
      query += `&months=${this.days}`;
    }
    if (this.selectedChartFilter == AppConstant.CICD.STATUS.COMPLETED) {
      query += `&successstatus=${this.selectedChartFilter}`;
    } else if (this.selectedChartFilter == AppConstant.CICD.STATUS.FAILED) {
      query += `&failedstatus=${this.selectedChartFilter}`;
    } else {
      query += `&successstatus=${this.successstatus}`;

      query += `&failedstatus=${this.failedstatus}`;
    }

    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      this.successData = response.data.map((item) => item.success);
      this.failedData = response.data.map((item) => item.failed);
      this.chartCategories = response.data.map((item) => item.Date);
      this.updateChartOptions();
      this.loading = false;
    });
  }

  updateChartOptions() {
    let seriesData: any[] = [];
    let seriesColor: string[] = [];
    let seriesName: string = "";

    if (this.selectedChartFilter === AppConstant.CICD.STATUS.COMPLETED) {
      seriesData = [this.successData];
      seriesColor = ["#aabb11"]; // Green color for success
      seriesName = "Success";
    } else if (this.selectedChartFilter === AppConstant.CICD.STATUS.FAILED) {
      seriesData = [this.failedData];
      seriesColor = ["#bb1111"]; // Red color for failed
      seriesName = "Failed";
    } else {
      // Show both success and failed data
      seriesData = [this.successData, this.failedData];
      seriesColor = ["#aabb11", "#bb1111"]; // Green for success, Red for failed
      seriesName = "Success";
    }

    this.chartOptions = {
      series: seriesData.map((data, index) => ({
        name: index === 0 ? seriesName : "Failed", // Set series name based on index
        data: data,
        color: seriesColor[index],
      })),
      chart: {
        type: "area",
        height: 280,
        toolbar: {
          show: false, // Hide the toolbar
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { categories: this.chartCategories },
      yaxis: { show: true},
      fill: { colors: seriesColor },
    };
  }
  //socket
  commonsocket() {
    this.getCount(this.userstoragedata.tenantid);
    this.onFilterChange();
    this.filterData(this.days);
  }

  //statusFilter-Dashboard
  statusFilter(status: string) {
    this.router.navigate(["cicd/releases"], {
      queryParams: {
        tabIndex: 0,
        status: status,
      },
    });
  }

  initChart() {
    this.chartOptions = {
      series: [],
      chart: { type: "area", height: 280 },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { categories: [] },
      yaxis: {show: true},
      fill: { colors: ["#aabb11", "#bb1111"] },
    };
  }
}
