import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  EventEmitter,
  ViewChild,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { ServerUtilsService } from "src/app/business/base/server-utildetails/services/server-utils.service";
import * as _ from "lodash";
import * as moment from "moment";
import * as differenceInCalendarDays from "date-fns/difference_in_calendar_days";

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
import { Router, ActivatedRoute } from "@angular/router";
import { ResizeRequestService } from "../../srm/upgrade-request/resize.service";
import { TagService } from "../tagmanager/tags.service";
import { AssetsService } from "../assets/assets.service";
import { AssetUtilsService } from "../assets/asset-Utils/asset-utils.service";

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
  selector: "app-server-utils",
  templateUrl:
    "../../../presentation/web/base/server-utils/server-utils.component.html",
  styles: [
    "../../../presentation/web/base/server-utils/server-utils.component.css",
  ],
})
export class ServerUtilsComponent
  implements OnInit, AfterViewChecked, OnChanges, AfterViewInit
{
  @Input() resizeReqObj: any;
  @Output() notifyDetailEntry: EventEmitter<any> = new EventEmitter();
  screens = [];
  appScreens = {} as any;
  userstoragedata: any = {};
  assetData: any = {};
  metaTagsEnabled = true;
  meta = null;
  enableServerResize = false;
  metaSideBarVisible = false;
  subtenantLable = AppConstant.SUBTENANT;
  awssgobj = null;
  metaSideBarTitle = "";
  metaTags = [];
  pricings = [];
  metaTagsList = [];
  isNavigationDrawer = false;
  metaVolumes: any = null;
  current = "CPU";
  avgValue = "0.00";
  rolloverAvg = "0";
  rolloverMinAvg = "0";
  rolloverMaxAvg = "0";
  filters = {
    daterange: [moment().subtract(30, "days").toDate(), new Date()],
    provider: "ECL2",
    customerid: "",
    instancerefid: "",
    instancetyperefid: "",
    utilkey: "CPU_UTIL",
  } as any;
  providerList: any = [];
  customerList: any = [];
  serverList: any = [];
  chartDataList: any = [];
  utilkeyList: any = [
    {
      label: "Utilization (%)",
      value: "CPU_UTIL",
    },
    {
      label: "Speed (GHz)",
      value: "CPU_SPEED",
    },
  ];
  utilkeyTitle = "Utilization (%)" as any;
  loading = false;
  today = new Date();
  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  filteredOptions = [];
  resizeReqList: any = [];
  pricingModel: any = [];
  resizeTableHeader = [
    { field: "plantype", header: "Plan", datatype: "string" },
    { field: "cost", header: "Cost", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Completed On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  resizeTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "30px", "40px"],
  } as any;
  serverLists = [];
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
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;

  disabledDate = (current: Date): boolean => {
    // Can not select days befo re today and today
    return differenceInCalendarDays(current, this.today) > 0;
  };

  @ViewChild("chart") chart: ChartComponent;
  chartOptions: Partial<ChartOptions>;

  // For server detail component.
  viewServerDetail = false;
  serverDetail = null;

  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private resizeService: ResizeRequestService,
    private assetService: AssetsService,
    private assetUtilService: AssetUtilsService,
    private messageService: NzMessageService,
    private tagService: TagService,
    private router: Router,
    private route: ActivatedRoute,
    private serverUtilsService: ServerUtilsService
  ) {
    console.log("Subtracted date format::::::::::::::");
    console.log(moment().subtract(30, "days").toDate());
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SERVER_UTILIZATION,
    } as any);
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getProviderList();
    this.getCustomerList();
    this.getLookup();
  }
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    console.log("Changes to input config");
    console.log(changes);
    console.log(this.resizeReqObj, "From on change");
    if (changes && changes.resizeReqObj && changes.resizeReqObj.currentValue) {
      if (changes.resizeReqObj.currentValue.customerid) {
        this.filters.customerid = changes.resizeReqObj.currentValue.customerid;
        this.filters.instancerefid =
          changes.resizeReqObj.currentValue.instancerefid;
        this.filters.provider = changes.resizeReqObj.currentValue.provider;
        this.filters.range = "7";
        this.filters.groupby = "daily";
        this.customerChanges();
      }
      this.resizeRequestChart();
      this.getServerList();
    }
  }
  ngOnInit() {
    //this.drawChart();
    this.route.queryParams.subscribe((changes) => {
      if (changes && changes.detailes) {
        this.providerChanges();
        this.filters = this.serverUtilsService.getItems();
        this.getServerList();
        this.filters.details = true;
        this.current = this.filters.utiltype;
        this.changeView(this.current);
        // this.getChartData();
        this.getInfluxData();
        this.utilkeyTitle = this.filters.utilkeyTitle;
      }
    });
    this.getPricing();
  }
  onServerChange(event: any): void {
    // this.filteredOptions = this.serverList
    //   .filter(option => option.instancename.toLowerCase().indexOf(value + ''.toLowerCase()) === 0);
    if (event) {
      let selectedIns = _.find(this.serverList, { instancerefid: event });
      console.log(selectedIns);
      if (selectedIns != undefined) {
        this.filters.instancetyperefid = selectedIns["instancetyperefid"];
      }
    }
  }
  resizeRequestChart() {
    this.filters.daterange = this.resizeReqObj.daterange;
    this.filters.instancerefid = this.resizeReqObj.instancerefid;
    this.filters.utilkey = this.resizeReqObj.utilkey;
    this.isNavigationDrawer = true;
    console.log(this.filters);
    // this.getChartData();
    this.getInfluxData();
  }
  getProviderList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = this.formArrayData(
            response.data,
            "keyname",
            "keyvalue"
          );
        } else {
          this.providerList = [];
        }
      });
  }
  getResizeHistory(id) {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: "Active",
      resourceid: id,
      reqstatus: AppConstant.STATUS.CLOSED,
    };
    this.resizeService.allRequest(condition).subscribe(
      (result: any) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          this.resizeReqList = response.data;
          this.calculateResourceCost(this.resizeReqList);
          this.resizeReqList.forEach((element) => {
            element.plantype = element.upgradeplan
              ? element.upgradeplan.plantype
              : null;
            element.cost = element.upgradeplan
              ? element.upgradeplan.cost
              : null;
            return element;
          });
        } else {
          this.resizeReqList = [];
        }
      },
      (err) => {
        this.messageService.error("Sorry! Something gone wrong");
      }
    );
  }
  getPricing() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricingModel = response.data;
        } else {
          this.pricingModel = [];
        }
      });
  }
  calculateResourceCost(data) {
    let self = this;
    if (data && data.length > 0) {
      data.forEach((element) => {
        if (element.currentplan) {
          element.currentplan.currency = element.currentplan.currency;
          if (
            element.currentplan.pricingmodel == AppConstant.LOOKUPKEY.MONTHLY
          ) {
            element.currentplan.cost = element.currentplan.priceperunit;
          } else {
            element.currentplan.cost = self.commonService.getMonthlyPrice(
              self.pricingModel,
              element.currentplan.pricingmodel,
              element.currentplan.priceperunit,
              element.currentplan.currency,
              true
            );
          }
        }
        if (element.upgradeplan) {
          element.upgradeplan.currency = element.upgradeplan.currency;
          if (
            element.upgradeplan.pricingmodel == AppConstant.LOOKUPKEY.MONTHLY
          ) {
            element.upgradeplan.cost = element.upgradeplan.priceperunit;
          } else {
            element.upgradeplan.cost = self.commonService.getMonthlyPrice(
              self.pricingModel,
              element.upgradeplan.pricingmodel,
              element.upgradeplan.priceperunit,
              element.upgradeplan.currency,
              true
            );
          }
        }
        console.log(element);
        return element;
      });
    }
  }
  getCustomerList() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerList = response.data;
      } else {
        this.customerList = [];
      }
    });
  }

  getServerList(customer?) {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.filters.customerid) {
      condition.customerid = this.filters.customerid;
    }
    if (undefined != this.filters.provider && null != this.filters.provider) {
      condition.cloudprovider = this.filters.provider;
    }
    this.commonService.allInstances(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.serverList = response.data;
        this.filteredOptions = this.serverList;
        this.serverLists = this.serverList;
        if (this.filters.instancerefid) {
          let selectedIns = _.find(this.serverList, {
            instancerefid: this.filters.instancerefid,
          });
          if (selectedIns != undefined) {
            this.filters.instancetyperefid = selectedIns["instancetyperefid"];
          }
        }
      } else {
        this.serverList = [];
      }
    });
  }

  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }

  drawChart() {
    // if (this.chartDataList && this.chartDataList.length > 0) {
    this.chartOptions = {
      series: [
        {
          name: "Minimum",
          data: this.chartDataList.map((o) => parseFloat(o["min"]).toFixed(2)),
        },
        {
          name: "Average",
          data: this.chartDataList.map((o) =>
            parseFloat(o["value"]).toFixed(2)
          ),
        },
        {
          name: "Maximum",
          data: this.chartDataList.map((o) => parseFloat(o["max"]).toFixed(2)),
        },
      ],
      chart: {
        height: 350,
        type: "line",
        events: {
          dataPointSelection: (e, chrt, options) =>
            this.moveToServerUtilizationDetails(e, chrt, options),
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
        },
        categories: (() => {
          if (this.filters.groupby == "daily") {
            return this.chartDataList.map((o) =>
              moment(o["date"]).format("DD-MMM")
            );
          }
          if (this.filters.groupby == "weekly") {
            return this.chartDataList.map(
              (o) => `Week ${moment(o["date"]).format("w")}`
            );
          }
          if (this.filters.groupby == "monthly") {
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
            return this.chartDataList.map((o, index) => months[o["month"] - 1]);
          }
        })(),
      },
      yaxis: {
        labels: {
          style: {
            colors: "#f5f5f5",
          },
        },
        title: {
          text: this.utilkeyTitle,
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
    // }
  }

  moveToServerUtilizationDetails(e: any, chart, options) {
    if (this.filters.groupby == "daily") {
      let date = this.chartDataList.map((o) =>
        moment(o["date"]).format("DD-MM-YY")
      )[options["dataPointIndex"]];
      this.filters.utiltype = this.current;
      this.filters.instancerefid = this.filters.instancerefid;
      let instance = this.serverLists.find(
        (o) => o["instancerefid"] == this.filters.instancerefid
      );
      let customer = this.customerList.find(
        (o) => o["customerid"] == parseInt(this.filters.customerid)
      );
      this.filters.instancename = instance ? instance["instancename"] : "";
      this.filters.customername = customer ? customer["customername"] : "";
      this.filters.utiltype = this.current;
      this.filters.date = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
      this.filters.tenantid = this.userstoragedata.tenantid;
      this.filters.utilkeyTitle = this.utilkeyTitle;
      console.log("**********************************", this.filters);
      this.serverUtilsService.addItem(this.filters);
      if (!this.isNavigationDrawer) {
        this.router.navigate(["/serverutilsdtls"]);
      } else {
        this.notifyDetailEntry.next(true);
      }
    }
  }

  buildCardData() {
    //this.getChartData();
    if (this.current == "MEMORY") {
      this.utilkeyList = [
        {
          label: "Used (%)",
          value: "MEM_USEPERCENT",
        },
        {
          label: "Usable (GB)",
          value: "MEM_FREE",
        },
      ];
    } else if (this.current == "CPU") {
      this.utilkeyList = [
        {
          label: "Utilization (%)",
          value: "CPU_UTIL",
        },
        {
          label: "Speed (GHz)",
          value: "CPU_SPEED",
        },
      ];
    } else if (this.current == "DISK") {
      this.utilkeyList = [
        {
          label: "Read (KB/s)",
          value: "DISK_READ",
        },
        {
          label: "Write (KB/s)",
          value: "DISK_WRITE",
        },
      ];
    } else if (this.current == "ETHERNET") {
      this.utilkeyList = [
        {
          label: "Send (Kbps)",
          value: "NET_SEND",
        },
        {
          label: "Receive (Kbps)",
          value: "NET_RECV",
        },
      ];
    }

    if (!this.filters.details) {
      this.filters.utilkey = this.utilkeyList[0]["value"];
    } else {
      delete this.filters.details;
    }
    this.utilkeyTitle = this.utilkeyList[0]["label"];
    this.chartDataList = [];
    // this.getChartData();
    this.getInfluxData();
    this.avgValue = "0.00";
  }
  changeView(to: string) {
    this.current = to;
    this.buildCardData();
  }

  checkIndex(t) {
    if (t == 1 || t == 4 || t == 7) {
      return true;
    }
  }
  providerChanges() {
    this.getServerList();
  }
  customerChanges(event?) {
    this.getServerList(event);
  }
  getLookup() {
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
      });
  }
  // FIXME: Dead Code
  // prepareServerMeta(data: object) {
  //   let details;
  //   this.assetData = data as any;
  //   this.assetData.instancetype = 'ASSET_INSTANCE';
  //   this.assetData.cloudprovider = this.filters.provider;
  //   if (this.filters.provider == 'AWS') {
  //     details = {
  //       'Info': [
  //         { "title": 'Customer Name', "value": data['customer'] != null ? data['customer']['customername'] || "-" : "-" },
  //         { "title": 'Teanant Id', "value": data['customer'] != null ? data['customer']['awsaccountid'] || "-" : "-" },
  //         { "title": 'Instance Name', "value": data['instancename'] },
  //         { "title": 'Instance Id', "value": data['instancerefid'] },
  //         { "title": 'Region', "value": data['region'] },
  //         { "title": 'Zone', "value": data['awszones'] != null ? data['awszones']['zonename'] || "-" : "-" },
  //         { "title": 'Status', "value": 'Active' },
  //       ],
  //       'Image': [
  //         { "title": 'Image Name', "value": data['awsimage'] ? data['awsimage']['aminame'] || "-" : "-" },
  //         { "title": 'Image ID', "value": data['awsimage'] ? data['awsimage']['awsamiid'] || "-" : "-" },
  //         { "title": 'Platform', "value": data['awsimage'] ? data['awsimage']['platform'] || "-" : "-" },
  //         { "title": 'Notes', "value": data['awsimage'] ? data['awsimage']['notes'] || "-" : "-" },
  //       ],
  //       'Specification': [
  //         { "title": 'Instance Type', "value": data['instancetyperefid'] },
  //         { "title": 'CPU', "value": data['awsinstance'] ? data['awsinstance']['vcpu'] || "-" : "-" },
  //         { "title": 'Memory', "value": data['awsinstance'] ? data['awsinstance']['memory'] || "-" : "-" },
  //       ],
  //       'IP Addresses': [
  //         { "title": 'Private IP', "value": data['privateipv4'] },
  //         { "title": 'Public IP', "value": data['publicipv4'] || '-' },
  //       ],
  //       // 'Volume': [
  //       //   { "title": 'Volume Type', "value": data['awsvolume'] ? data['awsvolume']['volumetype'] || '-' : '-' },
  //       //   { "title": 'Volume ID', "value": data['awsvolume'] ? data['awsvolume']['awsvolumeid'] || '-' : '-' },
  //       //   { "title": 'Size (Gb)', "value": data['awsvolume'] ? data['awsvolume']['sizeingb'] || '-' : '-' },
  //       //   { "title": 'Encrypted', "value": data['awsvolume'] ? data['awsvolume']['encryptedyn'] || '-' : '-' },
  //       //   { "title": 'Notes', "value": data['awsvolume'] ? data['awsvolume']['notes'] || '-' : '-' },
  //       // ]
  //     }
  //     this.metaVolumes = {
  //       tagTableConfig: {
  //         edit: false,
  //         delete: false,
  //         globalsearch: false,
  //         loading: false,
  //         pagination: false,
  //         pageSize: 1000,
  //         title: '',
  //         widthConfig: ['30px', '25px', '25px', '25px', '25px']
  //       },
  //       volumeList: [],
  //       'Volume': [
  //         { field: 'volumetype', header: 'Volume Type', datatype: 'string' },
  //         { field: 'awsvolumeid', header: 'Volume ID', datatype: 'string' },
  //         { field: 'sizeingb', header: 'Size (Gb)', datatype: 'string' },
  //         { field: 'encryptedyn', header: 'Encrypted', datatype: 'string' },
  //         { field: 'notes', header: 'Notes', datatype: 'string' }
  //       ]
  //     };
  //     if (data['attachedvolumes'] && data['attachedvolumes'].length > 0) {
  //       data['attachedvolumes'].forEach(element => {
  //         this.metaVolumes.volumeList.push(element.volume);
  //       });
  //     }

  //     this.awssgobj = data['awssgs'];
  //     this.assetData.instancerefid = data['securitygroupid'];
  //   } else {
  //     details = {
  //       'Info': [
  //         { "title": 'Customer Name', "value": data['customer']['customername'] },
  //         { "title": 'Teanant Id', "value": data['customer']['ecl2tenantid'] },
  //         { "title": 'Instance Name', "value": data['instancename'] },
  //         { "title": 'Instance Id', "value": data['instancerefid'] },
  //         { "title": 'Region', "value": data['region'] },
  //         { "title": 'Zone', "value": data['ecl2zones']['zonename'] },
  //         { "title": 'Status', "value": 'Active' },
  //       ],
  //       'Image': [
  //         { "title": 'Image Name', "value": data['image'] ? data['image']['imagename'] : null },
  //         { "title": 'Image ID', "value": data['image'] ? data['image']['ecl2imageid'] : null },
  //         { "title": 'Platform', "value": data['image'] ? data['image']['platform'] : null },
  //         { "title": 'Notes', "value": data['image'] ? data['image']['notes'] : null },
  //       ],
  //       'Specification': [
  //         { "title": 'Instance Type', "value": data['instancerefid'] },
  //         { "title": 'CPU', "value": data['instance']['vcpu'] },
  //         { "title": 'Memory', "value": data['instance']['memory'] },
  //       ],
  //       'IP Addresses': [
  //         { "title": 'Private IP', "value": data['privateipv4'] },
  //         { "title": 'Public IP', "value": data['publicipv4'] || '-' },
  //       ]
  //     }
  //     this.metaVolumes = {
  //       tagTableConfig: {
  //         edit: false,
  //         delete: false,
  //         globalsearch: false,
  //         loading: false,
  //         pagination: false,
  //         pageSize: 1000,
  //         title: '',
  //         widthConfig: ['30px', '25px', '25px', '25px', '25px', '25px']
  //       },
  //       volumeList: [],
  //       'Volume': [
  //         { field: 'volumename', header: 'Volume Name', datatype: 'string' },
  //         { field: 'ecl2volumeid', header: 'Volume ID', datatype: 'string' },
  //         { field: 'size', header: 'Size (Gb)', datatype: 'string' },
  //         { field: 'iopspergb', header: 'I/O Operations', datatype: 'string' },
  //         { field: 'publicipv4', header: 'Public IP', datatype: 'string' },
  //         { field: 'notes', header: 'Notes', datatype: 'string' }
  //       ]
  //     };
  //     if (data['ecl2attachedvolumes'] && data['ecl2attachedvolumes'].length > 0) {
  //       data['ecl2attachedvolumes'].forEach(element => {
  //         this.metaVolumes.volumeList.push(element.volume);
  //       });
  //     }
  //   }
  //   if (data['tagvalues'] && data['tagvalues'].length > 0) {
  //     this.metaTags = this.tagService.decodeTagValues(data['tagvalues']);
  //     this.metaTagsList = this.tagService.prepareViewFormat(data['tagvalues']);
  //   } else {
  //     this.metaTags = [];
  //     this.metaTagsList = [];
  //   }
  //   this.metaSideBarTitle = "Server" + ' (' + data['instancename'] + ') ';
  //   this.meta = details;
  //   this.enableServerResize = true;
  //   this.metaSideBarVisible = true;
  // }
  // getAssets() {
  //   let assetList = [] as any;
  //   let condition = {
  //     "asset": "ASSET_INSTANCE",
  //     "provider": this.filters.provider == "ECL2" ? "ECL2" : this.filters.provider,
  //     "customers": [
  //       this.filters.customerid
  //     ],
  //     "instancerefid": this.filters.instancerefid,
  //     "data": {
  //       "tenantid": this.userstoragedata.tenantid,
  //       "status": "Active"
  //     }
  //   };
  //   this.assetService.listByFilters(condition).subscribe(result => {
  //     let response = JSON.parse(result._body);
  //     if (response.status) {
  //       assetList = response.data.assets;
  //       let ls = _.map(assetList, (i) => {
  //         return {
  //           ...i,
  //           rightsizeyn: this.filters.rightsize && this.filters.rightsize == 'Y' ? "Y" : "N"
  //         }
  //       })
  //       assetList = [...ls]
  //       let self = this;
  //       _.map(assetList, function (i: any) {
  //         i.costs = 0;
  //         if (i.instance && i.instance.costvisual && (i.instance.costvisual).length > 0) {
  //           i.costs = self.commonService.getMonthlyPrice(self.pricings, i.instance.costvisual[0].pricingmodel, i.instance.costvisual[0].priceperunit, i.instance.costvisual[0].currency);
  //         }
  //         if (i.awsinstance && i.awsinstance.costvisual && (i.awsinstance.costvisual).length > 0) {
  //           i.costs = self.commonService.getMonthlyPrice(self.pricings, i.awsinstance.costvisual[0].pricingmodel, i.awsinstance.costvisual[0].priceperunit, i.awsinstance.costvisual[0].currency);
  //         }
  //         if (i.costvisual && (i.costvisual).length > 0) {
  //           i.costs = self.commonService.getMonthlyPrice(self.pricings, i.costvisual[0].pricingmodel, i.costvisual[0].priceperunit, i.costvisual[0].currency);
  //         }
  //         if (i.ecl2vsrxplan && i.ecl2vsrxplan.costvisual && (i.ecl2vsrxplan.costvisual).length > 0) {
  //           i.costs = self.commonService.getMonthlyPrice(self.pricings, i.ecl2vsrxplan.costvisual[0].pricingmodel, i.ecl2vsrxplan.costvisual[0].priceperunit, i.ecl2vsrxplan.costvisual[0].currency);
  //         }
  //         return i;
  //       });
  //       if (assetList[0]) {
  //         this.getInstanceByID(assetList[0]);
  //       }
  //     } else {
  //       assetList = [];
  //     }
  //   }, err => {
  //     console.log(err);
  //   });
  // }
  // getInstanceByID() {
  //   this.commonService.getInstance(data.instanceid, `?asstdtls=${true}&cloudprovider=${data.cloudprovider == 'ECL2' ? 'ECL2' : data.cloudprovider}`).subscribe((res) => {
  //     const response = JSON.parse(res._body);
  //     if (response.status) {
  //       this.prepareServerMeta(response.data);
  //     }
  //   });
  // }

  openServerDetails() {
    this.serverDetail = {
      cloudprovider: this.filters.provider,
      instanceref: this.filters.instancerefid,
      instancereftype: "instancerefid",
    };
    this.viewServerDetail = true;
  }
  checkValidations() {
    if (this.filters.range == undefined || this.filters.range == null) {
      this.messageService.error("Please select range");
      return;
    }
    if (this.filters.groupby == undefined || this.filters.groupby == null) {
      this.messageService.error("Please select group by");
      return;
    }
    if (this.filters.provider == undefined || this.filters.provider == null) {
      this.messageService.error("Please select provider");
      return;
    }
    if (
      this.filters.customerid == -1 ||
      this.filters.customerid == undefined ||
      this.filters.customerid == null
    ) {
      this.messageService.error("Please select customer");
      return;
    }
    if (
      this.filters.instancerefid == "" ||
      this.filters.instancerefid == undefined ||
      this.filters.instancerefid == null
    ) {
      this.messageService.error("Please select instance");
      return;
    }
    if (this.filters.utilkey == undefined || this.filters.utilkey == null) {
      this.messageService.error("Please select utilization type");
      return;
    }
    this.getInfluxData();
    // this.getChartData();
  }
  getInfluxData() {
    this.loading = true;
    let condition = {
      startdate: new Date(),
      enddate: new Date(),
      duration: "30d",
      tenantid: this.userstoragedata.tenantid,
      instancerefid: this.filters.instancerefid,
      utilkey: this.filters.utilkey,
      utiltype: this.current,
    } as any;
    if (this.filters.groupby == "daily") {
      condition.duration = "1d";
      condition.startdate = moment()
        .subtract(this.filters.range, "d")
        .format("YYYY-MM-DD");
    }
    if (this.filters.groupby == "weekly") {
      condition.duration = "7d";
      condition.startdate = moment()
        .subtract(this.filters.range * 7, "d")
        .format("YYYY-MM-DD");
    }
    if (this.filters.groupby == "monthly") {
      condition.duration = "30d";
      condition.startdate = moment()
        .subtract(this.filters.range, "months")
        .format("YYYY-MM-DD");
    }
    this.assetUtilService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.chartDataList = [];
        response.data.forEach((element) => {
          if (element.mean) {
            element.date = new Date(element.time);
            element.value = element.value ? element.value : element.mean;
            if (element.date) {
              element.month = element.date.getMonth() + 1;
            }
            this.chartDataList.push(element);
          }
        });
        let avgofAvg = (
          _.sumBy(response.data, function (o) {
            return parseFloat(o["value"] || "0");
          }) / response.data.length
        )
          .toFixed(2)
          .toString();
        let avgofMin = (
          _.sumBy(response.data, function (o) {
            return parseFloat(o["min"] || "0");
          }) / response.data.length
        )
          .toFixed(2)
          .toString();
        let avgofMax = (
          _.sumBy(response.data, function (o) {
            return parseFloat(o["max"] || "0");
          }) / response.data.length
        )
          .toFixed(2)
          .toString();
        this.rolloverAvg =
          avgofAvg +
          " " +
          (response.data[0]["notation"] || response.data[0]["uom"]);
        this.rolloverMinAvg =
          avgofMin +
          " " +
          (response.data[0]["notation"] || response.data[0]["uom"]);
        this.rolloverMaxAvg =
          avgofMax +
          " " +
          (response.data[0]["notation"] || response.data[0]["uom"]);
        this.loading = false;
        this.drawChart();
      } else {
        this.loading = false;
        this.chartDataList = [];
        this.drawChart();
        this.avgValue = "0.00";
      }
    });
  }

  getChartData() {
    let condition = {} as any;
    console.log(this.filters);
    this.loading = true;
    let startdate = this.filters.daterange[0];
    let enddate = this.filters.daterange[1];
    condition = {
      range: this.filters.range,
      groupby: this.filters.groupby,
      enddate: enddate,
      utiltype: this.current,
      instancerefid: this.filters.instancerefid,
      utilkey: [this.filters.utilkey],
      tenantid: this.userstoragedata.tenantid,
      detailed: "N",
    };
    this.commonService.getServerUtil(condition).subscribe((data) => {
      this.loading = false;
      const response = JSON.parse(data._body);
      if (response.status) {
        this.chartDataList = response.data;
        // this.getResizeHistory(this.filters.instancerefid);

        let totalDays = moment(enddate).diff(moment(startdate), "days");
        // let avgs = response.data.reduce((a, b) => {
        //   return {
        //     ...a,
        //     avg: parseInt(a.avg || "0") + parseInt(b.value || "0"),
        //     avgofMin: parseInt(a.avgofMin || "0") + parseInt(b.minval || "0"),
        //     avgofMax: parseInt(a.avgofMax || "0") + parseInt(b.maxval || "0")
        //   }
        // })

        let avgofAvg = (
          _.sumBy(response.data, function (o) {
            return parseFloat(o["value"] || "0");
          }) / response.data.length
        )
          .toFixed(2)
          .toString();
        let avgofMin = (
          _.sumBy(response.data, function (o) {
            return parseFloat(o["minval"] || "0");
          }) / response.data.length
        )
          .toFixed(2)
          .toString();
        let avgofMax = (
          _.sumBy(response.data, function (o) {
            return parseFloat(o["maxval"] || "0");
          }) / response.data.length
        )
          .toFixed(2)
          .toString();

        this.rolloverAvg =
          avgofAvg +
          " " +
          (response.data[0]["notation"] || response.data[0]["uom"]);
        this.rolloverMinAvg =
          avgofMin +
          " " +
          (response.data[0]["notation"] || response.data[0]["uom"]);
        this.rolloverMaxAvg =
          avgofMax +
          " " +
          (response.data[0]["notation"] || response.data[0]["uom"]);

        this.drawChart();
      } else {
        this.chartDataList = [];
        this.drawChart();
        this.avgValue = "0.00";
      }
    });
  }

  onChange(result: Date[]): void {
    if (result.length > 0) {
      let d1 = result[0];
      let d2 = result[1];
      if (moment(d2).diff(d1, "days") > 31) {
        this.messageService.info("Maximum allowed range 31 Days");
        this.filters.daterange = [
          moment().subtract(31, "days").toDate(),
          new Date(),
        ];
      }
    }
  }
  navDetailPage() {
    const id = this.messageService.loading("Action in progress..", {
      nzDuration: 0,
    }).messageId;
    setTimeout(() => {
      this.messageService.remove(id);
    }, 2500);
  }
  utilkeyChanges() {
    let key = _.find(this.utilkeyList, { value: this.filters.utilkey }) as any;
    if (key) this.utilkeyTitle = key.label;
  }
}
