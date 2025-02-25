import { Component, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../app.constant";
import * as _ from "lodash";

@Component({
  selector: "app-dashboard",
  templateUrl:
    "../../../presentation/web/admin/dashboard/dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  datalinechart: any;
  datapiechart: any;
  options: any;
  optionsVariable: any;
  userstoragedata: any;
  dashboardList = [];
  sortName = null;
  sortValue = null;
  originalData = [];
  loading = true;
  formatOne = (percent) => `${percent} Days`;
  formatTwo = () => `Done`;
  constructor(
    private messageService: NzMessageService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.options = {
      legend: {
        labels: {
          fontColor: "#ffffff",
        },
      },
    };
  }

  ngOnInit() {
    this.datalinechart = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Server Count",
          backgroundColor: "#42A5F5",
          borderColor: "#1E88E5",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    };
    this.datapiechart = {
      labels: ["AWS", "ECL2"],
      datasets: [
        {
          data: [0, -1],
          backgroundColor: [],
          hoverBackgroundColor: [],
        },
      ],
    };
    this.optionsVariable = {
      scales: {
        yAxes: [
          { ticks: { min: 0, stepValue: 10, max: 50, fontColor: "#ffffff" } },
        ],
        xAxes: [{ ticks: { fontColor: "#ffffff" } }],
      },
      legend: {
        labels: {
          fontColor: "#ffffff",
        },
      },
    };
    this.getDashboardList();
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.dashboardList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.dashboardList = data;
    }
  }
  getDashboardList() {
    let formdata = {} as any;
    formdata = {
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.getDashboard(formdata).subscribe((res: any) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.dashboardList = response.data[0];
        this.originalData = this.dashboardList;

        // Server By provider
        let data = {} as any;
        let datasets: any[] = [
          {
            data: [],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ];
        let aws = _(this.dashboardList)
          .groupBy("cloudprovider")
          .map((items, cloudprovider) => ({
            cloudprovider,
            count: items.length,
          }))
          .value();
        let awscount = 0;
        let googlecount = 0;
        let eclcount = 0;
        if (!_.isEmpty(aws)) {
          aws.map((items: any) => {
            if (items.cloudprovider === "AWS") {
              awscount = items.count;
            }
            if (items.cloudprovider === "GOOGLE") {
              googlecount = items.count;
            }
            if (items.cloudprovider === "ECL2") {
              eclcount = items.count;
            }
            datasets[0].data = [awscount, googlecount, eclcount];
            data.labels = ["AWS", "GOOGLE", "ECL2"];
            data.datasets = datasets;
            this.datapiechart = data;
          });
        }

        // Server Count
        let servers = _(this.dashboardList)
          .groupBy("month")
          .map((items, month) => ({ month, servercount: items.length }))
          .value();
        let lineData = {} as any;
        let labels = [];
        if (!_.isEmpty(servers)) {
          let data: any[] = [
            {
              label: "Server Count",
              backgroundColor: "#42A5F5",
              borderColor: "#1E88E5",
              data: [],
            },
          ];
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          servers.sort(function (a, b) {
            return months.indexOf(a.month) - months.indexOf(b.month);
          });
          _.forEach(servers, (item: any) => {
            labels.push(item.month);
            data[0].data.push(item.servercount);
          });
          lineData.datasets = data;
          lineData.labels = labels;
          var max = _.maxBy(servers, function (obj) {
            return obj.servercount;
          });
          this.optionsVariable = {
            scales: {
              yAxes: [
                {
                  ticks: {
                    min: 0,
                    stepValue: 10,
                    max: max ? max.servercount : 50,
                    fontColor: "#ffffff",
                  },
                },
              ],
              xAxes: [{ ticks: { fontColor: "#ffffff" } }],
            },
            legend: {
              labels: {
                fontColor: "#ffffff",
              },
            },
          };

          this.datalinechart = lineData;
        }
      } else {
        this.dashboardList = [];
        this.datalinechart = {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Server Count",
              backgroundColor: "#42A5F5",
              borderColor: "#1E88E5",
              data: [0, 50, 80, 40, 25, 35, 85, 50, 5, 1, 1, 1],
            },
          ],
        };
        this.datapiechart = {
          labels: ["AWS", "GOOGLE", "ECL2"],
          datasets: [
            {
              data: [300, 50, 100],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
              hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        };
      }
    });
  }
}
