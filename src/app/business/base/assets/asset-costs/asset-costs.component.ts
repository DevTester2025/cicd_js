import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CostSetupService } from "../../../base/assets/costsetup/costsetup.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import * as moment from "moment";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { BudgetService } from "../budget/budget.service";
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
import * as Apex from "apexcharts";

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
  selector: "app-asset-costs",
  templateUrl:
    "../../../../presentation/web/base/assets/asset-costs/asset-costs.component.html",
})
export class AssetCostsComponent implements OnInit, OnChanges {
  @Input() assetData;
  @Input() resource;
  @Input() listOnlyActiveCosts = false;

  budgetObj = {} as any;
  userstoragedata = {} as any;
  costLists: any = [];
  instancename = [];
  tagTableHeader: any = [
    // { field: 'assetname', header: 'Particulars', datatype: 'string' },
    // { field: 'pricingmodel', header: 'Pricing Model', datatype: 'string' },
    // { field: 'version', header: 'Version', datatype: 'string' },
    {
      field: "priceperunit",
      header: "Price",
      datatype: "currency",
      format: "currency",
    },
    { field: "pricingmodel", header: "Pricing Model", datatype: "string" },
    { field: "cost", header: "Cost (Monthly)", datatype: "string" },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy",
    },
  ];
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    clone: false,
    pageSize: 10,
    // scroll: { x: '130%' },
    title: "",
    widthConfig: ["10px", "10px", "10px", "10px"],
  };
  resources: any = [
    { label: AppConstant.TAGS.TAG_RESOURCETYPES[8], value: "instancename" },
    { label: AppConstant.TAGS.TAG_RESOURCETYPES[5], value: "lbname" },
    { label: AppConstant.TAGS.TAG_RESOURCETYPES[12], value: "volumename" },
    { label: AppConstant.TAGS.TAG_RESOURCETYPES[6], value: "vsrxname" },
  ];
  pricings: any = [];
  budgetList: any = [];
  billingList: any = [];
  budgettagTableHeader = [
    { field: "cloudprovider", header: "Provider", datatype: "string" },
    { field: "customername", header: "Customer", datatype: "string" },
    { field: "assettype", header: "Resource Type", datatype: "string" },
    {
      field: "startdt",
      header: "Start Dt.",
      datatype: "timestamp",
      format: "dd-MMM-yyyy",
    },
    {
      field: "enddt",
      header: "End Dt.",
      datatype: "timestamp",
      format: "dd-MMM-yyyy",
    },
    {
      field: "budgetamount",
      header: "Budget",
      datatype: "currency",
      format: "currency",
    },
  ];
  billingtagTableHeader = [
    {
      field: "billingdt",
      header: "Billing Dt.",
      datatype: "timestamp",
      format: "dd-MMM-yyyy",
    },
    {
      field: "billamount",
      header: "Bill amount",
      datatype: "currency",
      format: "currency",
    },
  ];
  budgettagTableConfig = {
    view: true,
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: true,
    clone: false,
    selection: true,
    singleselect: true,
    // chart: true,
    pageSize: 5,
    // scroll: { x: '130%' },
    title: "",
    widthConfig: ["10px", "10px", "10px", "10px"],
  };
  billingtagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: true,
    clone: false,
    pageSize: 5,
    // scroll: { x: '130%' },
    title: "",
    widthConfig: ["10px", "10px", "10px", "10px"],
  };
  showView = false;
  assetTypes = [
    { title: "Server", value: "ASSET_INSTANCE" },
    { title: "Network", value: "ASSET_NETWORK" },
    { title: "Load Balancer", value: "ASSET_LB" },
    { title: "Firewall", value: "ASSET_FIREWALL" },
    { title: "Internet Gateway", value: "ASSET_IG" },
    { title: "CFG", value: "ASSET_CFG" },
    { title: "Volume", value: "ASSET_VOLUME" },
  ];
  billingChartView = false;
  public chartOptions: Partial<ChartOptions>;
  addbudgetform = false;
  instanceObj = {};
  dailybilling = false;
  loading = false;
  constructor(
    private costSetupService: CostSetupService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private budgetService: BudgetService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (this.assetData) {
      this.init(this.assetData);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["assetData"]) {
      this.init(changes["assetData"]);
    }
  }
  init(data) {
    if (data) {
        let priceTypeIndex = this.tagTableHeader.findIndex((value) => 
          value.field === "pricetype");
        
        if (this.assetData.cloudprovider === "AWS") {
            if (priceTypeIndex === -1) {
                this.tagTableHeader.splice(2, 0, {
                    field: "pricetype",
                    header: "Pricing Type",
                    datatype: "string",
                });
            }
        } else {
            if (priceTypeIndex > -1) {
                this.tagTableHeader.splice(priceTypeIndex, 1);
            }
        }
      this.getLookup();
      this.getAllCosts();
      this.getAllBudgets();
    }
  }
  getLookup() {
    this.loading = true;
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricings = response.data;
        } else {
          this.pricings = [];
        }
        this.loading = false;
      });
  }
  onChanged(val) {
    this.showView = val;
    this.budgetObj = {};
    this.addbudgetform = false;
    this.dailybilling = false;
  }
  notifyBudgetEntry(event) {
    this.addbudgetform = false;
    this.instanceObj = {};
    this.getAllBudgets();
  }
  addbudget() {
    const date = new Date();
    this.addbudgetform = true;
    this.instanceObj = {};
    this.instanceObj = {
      startdt: new Date(date.getFullYear(), date.getMonth(), 1),
      enddt: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      customerid: this.assetData.customerid,
      cloudprovider: this.assetData.cloudprovider,
      resourceid: [this.assetData.instanceid],
      instancerefid: [this.assetData.instancerefid],
      currency: this.budgetObj.currency,
      budgetamount: null,
      notes: "",
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
    };
    if (this.assetData.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.instanceObj["resourcetype"] =
        AppConstant.ECL2_BILLING_RESOURCETYPES[0].value;
    }
    if (this.assetData.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
      this.instanceObj["resourcetype"] =
        AppConstant.AWS_BILLING_RESOURCETYPES[1].value;
    }
  }
  changeTab(tab: 0 | 1) {
    if (tab == 0) {
      this.billingChartView = false;
      this.billingList = this.sortArray(this.billingList);
    }
    if (tab == 1) {
      this.billingChartView = true;
      this.billingList = this.sortArray(this.billingList, true);
      this.initChart();
    }
  }
  initChart() {
    this.chartOptions = {
      series: [
        {
          name: "Actual Billing",
          type: "column",
          data: [],
        },
      ],
      chart: {
        height: 350,
        type: "bar",
        stacked: false,
        events: {},
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top", // top, center, bottom
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: "11px",
          colors: ["#FFFFFF"],
        },
      },
      stroke: {
        width: [1],
      },
      xaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        categories: [],
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
            text: `Billings (${this.budgetObj.currency})`,
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
        enabled: false,
        y: {
          formatter: function (val) {
            return val;
          },
        },
        x: {
          formatter: function (val) {
            return val;
          },
        },
      },
      markers: {
        size: 5,
        hover: {
          sizeOffset: 6,
        },
      },
    };
    this.chartOptions.xaxis.categories = this.billingList.map((o) =>
      moment(o["x"]).format("DD-MMM-YY")
    );
    this.chartOptions.series[0].data = this.billingList.map((o) =>
      parseFloat(o.y).toFixed(2)
    );
    let d = new Apex(document.getElementById("chart"), this.chartOptions);
    d.render();
  }
  dataChanged(d) {
    if (d.view) {
      this.budgetObj = d;
      this.showView = true;
    }
    if (d.rowselection) {
      this.budgetObj = d.data;
      this.getAllBillings();
    }
    if (d.chart) {
      this.budgetObj = d;
      this.dailybilling = true;
    }
  }
  getAllBillings() {
    this.billingList = [];
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.assetData.tenantid,
      cloud_resourceid: this.assetData.instancerefid,
    };
    if (this.budgetObj && this.budgetObj.startdt && this.budgetObj.enddt) {
      condition.billingdates = [this.budgetObj.startdt, this.budgetObj.enddt];
    }
    // if (this.budgetObj.cloudprovider && this.budgetObj.cloudprovider !== '') {
    //   condition.cloudprovider = this.budgetObj.cloudprovider;
    // }
    // if (this.budgetObj.customerid && this.budgetObj.customerid !== -1) {
    //   condition.customerid = this.budgetObj.customerid;
    // }
    // if (this.budgetObj.resourcetype && this.budgetObj.resourcetype !== '') {
    //   condition.resourcetype = this.budgetObj.resourcetype;
    // }
    // if (this.budgetObj.instancerefid && this.budgetObj.instancerefid !== '') {
    //   condition.instancerefid = this.budgetObj.instancerefid;
    // }
    this.budgetService
      .billingList(condition, `?filterby=${true}`)
      .subscribe((result) => {
        const response = JSON.parse(result._body);
        if (response.status && response.data.length > 0) {
          this.billingList = response.data;
          if (this.billingChartView) {
            document.getElementById("chart").innerHTML = "";
            this.changeTab(1);
          }
        } else {
          this.billingList = [];
        }
      });
  }
  sortArray(array, reverse?) {
    let sortedArray: any = [];
    sortedArray = array.sort(function compare(a, b) {
      try {
        var dateA = new Date(a.billingdt) as any;
        var dateB = new Date(b.billingdt) as any;
        if (reverse) {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      } catch (err) {
        console.log("Err sorting ", err);
      }
    });
    return sortedArray;
  }
  getAllBudgets() {
    this.loading = true;
    this.budgetList = [];
    let condition = {} as any;
    condition = {
      resourcetype: this.resource,
      tenantid: this.userstoragedata.tenantid,
      instancerefid: [this.assetData.instancerefid],
      // resourceid: [this.assetData.instanceid],
      cloudprovider: this.assetData.cloudprovider,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.assetData.customerid != null) {
      condition["customerid"] = this.assetData.customerid;
    }
    this.budgetService
      .list(condition, `?filterbudget=${true}`)
      .subscribe((result) => {
        const response = JSON.parse(result._body);
        if (response.status && response.data.length > 0) {
          this.budgetList = response.data;
          this.budgetList[0].checked = true;
          this.budgetObj = response.data[0];
          let self = this;
          this.budgetList = _.map(this.budgetList, function (i: any) {
            i.assettype = self.commonService.formatResourceType(
              i.resourcetype,
              i.cloudprovider
            );
            i.customername = i.customer ? i.customer.customername : "All";
            return i;
          });
        } else {
          this.budgetList = [];
        }
        if (!_.isEmpty(this.budgetObj)) {
          this.getAllBillings();
        }
        this.loading = false;
      });
  }
  getAllCosts() {
    this.loading = true;
    this.costLists = [];
    let instype: any = _.find(this.resources, {
      label: this.assetData.instancetype,
    });
    if (instype != undefined) {
      this.instancename = this.assetData[instype.value];
    }
    let condition = {
      cloudprovider: this.assetData.cloudprovider,
      region: this.assetData.region,
      resourcetype: this.assetData.instancetype,
      statuses: [AppConstant.STATUS.ACTIVE, AppConstant.STATUS.INACTIVE],
    } as any;

    if (this.listOnlyActiveCosts) {
      condition["statuses"] = [AppConstant.STATUS.ACTIVE];
    }

    if (
      this.assetData.cloudprovider == "AWS" &&
      this.assetData["awszones"] != undefined
    ) {
      condition.region = this.assetData["awszones"]["zonename"];
    }
    if (this.assetData.instancetype == AppConstant.TAGS.TAG_RESOURCETYPES[12]) {
      condition.plantype = this.assetData.size.toString();
    }
    console.log("Assetdata for asset-costs", this.assetData);
    if (this.assetData.instancetype == AppConstant.TAGS.TAG_RESOURCETYPES[8]) {
      condition.plantype = this.assetData.instancetyperefid;
    }
    this.costSetupService.all(condition).subscribe(
      (result) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          let self = this;
          this.costLists = response.data;
          console.log("Costs list response::::::::::::::::", response.data);
          _.map(this.costLists, function (item: any) {
            item.cost = self.commonService.getMonthlyPrice(
              self.pricings,
              item.pricingmodel,
              item.priceperunit,
              item.currency
            );
            return item;
          });
          this.costLists = [...this.costLists];

          console.log("Costs list::::::::::::::::", this.costLists);
        } else {
        }
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        console.log(err);
      }
    );
  }
}
