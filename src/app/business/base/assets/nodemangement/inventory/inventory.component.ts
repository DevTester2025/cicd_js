import { Component, Input, OnInit } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { SSMService } from "src/app/business/base/assets/nodemangement/ssm.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-cloudmatiq-inventory",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/inventory/inventory.component.html",
  styles: [],
})
export class InventoryComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() region: string;
  @Input() accountid: number;
  isVisible = false;
  screens = [];
  appScreens = {} as any;
  userstoragedata = {} as any;
  oschartOps = {} as any;
  servicechartOps = {} as any;
  appschartOps = {} as any;
  rolechartOps = {} as any;
  mgmtchartOps = {} as any;
  showSetup = false;
  invtabIndex = 0;
  setupinv = false;

  chartloading = {
    servicechartOps: false,
    appschartOps: false,
    rolechartOps: false,
    mgmtchartOps: false,
    oschartOps: false,
  };

  constructor(
    private localStorageService: LocalStorageService,
    private SSMService: SSMService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.NODE_MGMT,
    } as any);
    if (_.includes(this.appScreens.actions, "Setup Inventory")) {
      this.setupinv = true;
    }
  }
  initChart() {
    return {
      legend: {
        position: "top",
        labels: {
          colors: "#f5f5f5",
        },
      },
      tooltip: {
        theme: "dark",
      },
      fill: {
        opacity: 1,
      },
      series: [
        {
          name: "Total",
          data: [],
        },
      ],
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ["#FFFFFF"],
        },
      },
      colors: ["#5DADE2", "#FF5733"],
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: "#ffffff",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#ffffff",
          },
        },
      },
    };
  }
  ngOnInit() {}
  ngOnChanges(changes) {
    if (
      (changes.refresh && changes.refresh.currentValue) ||
      (changes.region && changes.region.currentValue) ||
      (changes.accountid && changes.accountid.currentValue)
    ) {
      this.getInvStatus();
      this.getTopOsVersion();
      this.getTopServices();
      this.getTopRoles();
      this.getTopApps();
    }
  }
  invTabChanged(event) {
    this.invtabIndex = event.index;
    if (event.index == 0) {
      this.getInvStatus();
      this.getTopOsVersion();
      this.getTopServices();
      this.getTopRoles();
      this.getTopApps();
    }
  }
  getInvStatus() {
    this.chartloading.mgmtchartOps = true;
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      type: "MANAGED_NODES",
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.SSMService.getInventoryDashboard(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.chartloading.mgmtchartOps = false;
        this.mgmtchartOps = {
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "bottom",
                  labels: {
                    colors: "#f5f5f5",
                  },
                },
              },
            },
          ],
          legend: {
            position: "bottom",
            labels: {
              colors: "#f5f5f5",
            },
          },
          colors: ["#5DADE2", "#FF5733"],
          series: [],
          plotOptions: {
            pie: {
              expandOnClick: false,
            },
          },
          chart: {
            type: "donut",
            height: 395,
          },
          labels: [],
          tooltip: {
            theme: "dark",
          },
        };

        this.mgmtchartOps.labels = ["Enabled", "Disabled"];
        if (response.status && response.data) {
          let content = "";
          if (
            _.has(
              response.data.Entities[0]["Data"],
              "InventoryEnabledORDisabled"
            )
          ) {
            content =
              response.data.Entities[0]["Data"]["InventoryEnabledORDisabled"][
                "Content"
              ];
            this.mgmtchartOps.series = [
              Number(content[1]["matchingCount"]),
              Number(content[0]["notMatchingCount"]),
            ];
          } else {
            content =
              response.data.Entities[0]["Data"]["inventoryType"]["Content"];
            this.mgmtchartOps.series = [
              Number(content[0]["filtersCount"]),
              Number(content[0]["filtersCount"]),
            ];
          }
          this.mgmtchartOps = { ...this.mgmtchartOps };
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getTopApps() {
    this.chartloading.appschartOps = true;
    let formData = {
      region: this.region,
      limit: 5,
      tenantid: this.userstoragedata.tenantid,
      type: "APPLICATION",
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.SSMService.getInventoryDashboard(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.appschartOps = this.initChart();
        this.chartloading.appschartOps = false;
        if (response.status && response.data) {
          let content =
            response.data.Entities[0]["Data"]["AWS:Application"]["Content"];
          _.map(content, (item) => {
            this.appschartOps.xaxis.categories.push(item.Name);
            this.appschartOps.series[0].data.push(Number(item.Count));
            this.appschartOps = { ...this.appschartOps };
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getTopServices() {
    this.chartloading.servicechartOps = true;
    let formData = {
      region: this.region,
      limit: 5,
      tenantid: this.userstoragedata.tenantid,
      type: "SERVICES",
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.SSMService.getInventoryDashboard(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.servicechartOps = this.initChart();
        this.chartloading.servicechartOps = false;
        if (response.status && response.data) {
          let content =
            response.data.Entities[0]["Data"]["AWS:Service"]["Content"];
          _.map(content, (item) => {
            this.servicechartOps.xaxis.categories.push(item.DisplayName);
            this.servicechartOps.series[0].data.push(Number(item.Count));
            this.servicechartOps = { ...this.servicechartOps };
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getTopOsVersion() {
    this.chartloading.oschartOps = true;
    let formData = {
      region: this.region,
      limit: 5,
      tenantid: this.userstoragedata.tenantid,
      type: "OS_VERSION",
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.SSMService.getInventoryDashboard(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.oschartOps = this.initChart();
        this.chartloading.oschartOps = false;
        if (response.status && response.data) {
          let content =
            response.data.Entities[0]["Data"]["AWS:InstanceInformation"][
              "Content"
            ];
          _.map(content, (item) => {
            this.oschartOps.xaxis.categories.push(item.PlatformName);
            this.oschartOps.series[0].data.push(Number(item.Count));
            this.oschartOps = { ...this.oschartOps };
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getTopRoles() {
    this.chartloading.rolechartOps = true;
    let formData = {
      region: this.region,
      limit: 5,
      tenantid: this.userstoragedata.tenantid,
      type: "SERVER_ROLES",
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.SSMService.getInventoryDashboard(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.rolechartOps = this.initChart();
        this.chartloading.rolechartOps = false;
        if (response.status && response.data) {
          let content =
            response.data.Entities[0]["Data"]["AWS:WindowsRole"]["Content"];
          _.map(content, (item) => {
            this.rolechartOps.xaxis.categories.push(item.DisplayName);
            this.rolechartOps.series[0].data.push(Number(item.Count));
            this.rolechartOps = { ...this.rolechartOps };
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  setupInv() {
    this.showSetup = true;
  }
  closeDrawer(event) {
    this.showSetup = false;
  }
  notifyIV() {
    this.showSetup = false;
  }
  dataChanged(event) {
    if (event.refresh) {
      this.invTabChanged({ index: this.invtabIndex });
    }
  }
}
