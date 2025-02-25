import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { Router } from "@angular/router";
import { BillingService } from "./billing.service";
import * as ApexChart from "apexcharts";
import * as moment from "moment";
import * as Papa from "papaparse";
import { ITag, TagService } from "../../tagmanager/tags.service";
import { TagValueService } from "../../tagmanager/tagvalue.service";

interface IAssetBilling {
  billingid: number;
  tenantid: number;
  billingdt: Date;
  cloudprovider: string;
  customerid: number;
  _accountid: number;
  customername: string;
  resourcetype: string;
  cloud_resourceid: string;
  resourceid: null;
  currency: string;
  billamount: string;
  costtype: string;
  notes: string;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: string;
  lastupdateddt: null;
  _account: Account;
  _customer: Account;
}

interface Account {
  title: string;
  value: number;
}

interface groupOptions {
  title: string;
  value: string;
  cangroup: boolean;
  groupattr?: string;
}

interface billingData {
  x: string;
  y: string;
  xy: number | string;
  _account?: { title: string; value: string | number };
  _customer?: { title: string; value: string | number };
}

@Component({
  selector: "app-billing",
  templateUrl:
    "../../../../presentation/web/base/assets/billing/billing.component.html",
  styles: [
    `
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
export class BillingComponent implements OnInit {
  userstoragedata = {} as any;
  loading: boolean = false;

  billingData: billingData[] = [];
  tableHeader = null as string[] | null;
  tableData = null as string[] | number[] | null;
  paginatedTableData = null as string[] | number[] | null;
  tablePageIndex = 1;

  // drillDownTableHeader = null as string[];
  // drillDownTablebody = null as string[][];
  ddStartDate = null;
  ddEndDate = null;
  ddOptions = null;

  chart: ApexChart | null = null;
  stackedChart = true;
  showPreviousData = false;
  totalCost = 0;
  // #OP_B770
  appScreens = {} as any;
  screens = [];
  rolename: any;
  download = false;
  groupAndFilterByOptions: groupOptions[] = [
    {
      title: "Customer",
      value: "customerid",
      cangroup: true,
      groupattr: "_customer",
    },
    {
      title: "Account",
      value: "_accountid",
      cangroup: true,
      groupattr: "_account",
    },
    {
      title: "Resource",
      value: "cloud_resourceid",
      cangroup: false,
      groupattr: null,
    },
    {
      title: "Resource Type",
      value: "resourcetype",
      cangroup: true,
      groupattr: null,
    },
    { title: "Cloud", value: "cloudprovider", cangroup: true, groupattr: null },
    { title: "Cost Type", value: "costtype", cangroup: true, groupattr: null },
  ];
  groupBy = null;
  tagList: ITag[] = [];

  models = {
    date: [
      moment().startOf("month").toDate(),
      moment().endOf("month").toDate(),
    ],
    duration: "Day",
    tag: null,
    tagvalue: null,
  };
  filters = {};
  appliedFilters = {} as Record<
    string,
    { title: string; value: string | number }[]
  >;
  currentFilter = null as null | groupOptions;
  filterableValues: { title: string; value: string }[] = [];
  filterMenuVisible = false;
  selectedTag = null as Record<string, any> | null;

  constructor(
    public router: Router,
    private localStorageService: LocalStorageService,
    private billingService: BillingService,
    private tagValueService: TagValueService,
    private tagService: TagService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    // #OP_B770
    this.rolename = this.userstoragedata.roles.rolename;
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_BILLING,
    });
    if (_.includes(this.appScreens.actions, "Download")) {
      this.download = true;
    }
  }

  ngOnInit() {
    this.getBilling();
    this.getAllTags();
  }

  getOnlyGroupableOptions() {
    return this.groupAndFilterByOptions.filter((o) => o.cangroup == true);
  }

  getBilling(options?: {
    history?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    let filters = {};

    for (const key in this.appliedFilters) {
      if (Object.prototype.hasOwnProperty.call(this.appliedFilters, key)) {
        const element = this.appliedFilters[key];
        if (element.length > 0) {
          filters[key] = element.map((e) => {
            return e.value;
          });
        }
      }
    }

    // Reset drill down chart
    this.ddStartDate = null;
    this.ddEndDate = null;
    this.ddOptions = {
      filters: null,
      resourcetype: null,
    };

    let d = {
      billingdates:
        options && options.history
          ? [options.startDate, options.endDate]
          : [
              moment(this.models.date[0]).format("YYYY-MM-DD"),
              moment(this.models.date[1]).format("YYYY-MM-DD"),
            ],
      duration: this.models.duration,
      groupby: this.groupBy,
      tenantid: this.userstoragedata.tenantid,
      filters,
    };

    if (
      this.appliedFilters &&
      this.appliedFilters["resourcetype"] &&
      this.appliedFilters["resourcetype"].length == 1 &&
      this.appliedFilters["resourcetype"][0]["title"] ==
        "Amazon Elastic Compute Cloud - Compute"
    ) {
      d["tagid"] = this.models.tag;
      d["tagvalue"] = this.models.tagvalue;
    }

    this.billingService.list(d).subscribe(
      (res) => {
        const response: {
          code: number;
          message: string;
          status: boolean;
          data: {
            x: string;
            y: string;
            xy: number | string;
            _account: { title: string; value: string | number };
          }[];
        } = JSON.parse(res._body);

        // To handle logic with loading historical data.
        if (!options) {
          this.totalCost = 0;
          this.billingData = response.data;
          if (this.billingData) {
            this.billingData.forEach((b) => {
              this.totalCost += typeof b.y == "string" ? parseFloat(b.y) : b.y;
            });
            this.totalCost = parseFloat(this.totalCost.toFixed(2));
          }
        }

        this.formTable(
          options
            ? {
                history: true,
                record: response.data,
              }
            : null
        );
      },
      (err) => {
        console.log("Error getting billing details.");
        console.log(err);
      }
    );
  }

  getPreviousBilling() {
    const date1 = this.models.date[0].getTime();
    const date2 = this.models.date[1].getTime();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const oldStart = moment(date1).subtract(diffDays, "days").toDate();
    const oldEnd = this.models.date[0];

    if (this.showPreviousData) {
      this.getBilling({
        history: true,
        startDate: oldStart,
        endDate: oldEnd,
      });
    } else {
      this.drawChart();
    }
  }

  formTable(options?: { history?: boolean; record?: billingData[] }) {
    let dataByX = _.groupBy(
      options && options.history ? options.record : this.billingData,
      "x"
    );
    let dataByXY = _.groupBy(
      options && options.history ? options.record : this.billingData,
      (b) => {
        if (this.groupBy) {
          const refAttr = this.groupBy
            ? this.groupAndFilterByOptions.find((o) => o.value == this.groupBy)[
                "groupattr"
              ]
            : null;
          if (refAttr) {
            return (b[refAttr] as any)["title"];
          } else {
            return b["xy"];
          }
        } else {
          return b["y"];
        }
      }
    );
    let groupX = Object.keys(dataByX);
    let groupXY = Object.keys(dataByXY);

    let setOne: string[] = [];
    setOne.push("", ...groupX);

    let setTwo = [];

    if (this.groupBy) {
      let arr = [];
      groupXY.forEach((g) => {
        arr.push([g]);
      });
      for (let index = 0; index < arr.length; index++) {
        const row = arr[index];

        for (let j = 0; j < setOne.length; j++) {
          const column = setOne[j];
          if (j > 0) {
            const value = dataByXY[row[0]].find((o) => o["x"] == column);
            if (value) {
              row.push(value["y"]);
            } else {
              row.push(null);
            }
          }
        }
      }
      setTwo.push(...arr);
    } else {
      let v = ["Total"];
      for (let index = 0; index < setOne.length; index++) {
        const column = setOne[index];
        if (index > 0) {
          v.push(dataByX[column][0]["y"]);
        }
      }
      setTwo.push(v);
    }

    if (!options || (options && !options.history)) {
      this.tableHeader = setOne;
      this.tableData = setTwo;

      this.tablePageIndex = 1;
      this.paginateTable();

      if (this.tableData && this.tableData.length > 0) {
        this.drawChart();
      }
    } else {
      console.log("Data for history");
      console.log(setOne, setTwo);
      this.drawChart({
        seriestwo: setTwo,
      });
    }
  }

  drawChart(opts?: { seriestwo?: any[] }) {
    const tableData = _.clone(this.tableData) as any;
    const tableHeader = _.clone(this.tableHeader) as any;

    const el = document.querySelector("#billing-chart");

    if (this.chart) {
      this.chart.destroy();
    }

    tableHeader.shift();

    let series = tableData.map((o) => {
      const body = _.clone(o);

      const header = body[0];
      body.shift();

      return {
        name: header,
        type: "column",
        data: body.map((e) => {
          if (typeof e == "string") {
            return parseFloat(e).toFixed(2);
          } else {
            return e;
          }
        }),
      };
    });

    if (opts && opts.seriestwo) {
      let overlappingSeries = opts.seriestwo.map((o) => {
        const body = _.clone(o);

        const header = body[0];
        body.shift();

        return {
          name: header + "-history",
          type: "line",
          data: body.map((e) => {
            if (typeof e == "string") {
              return parseFloat(e).toFixed(2);
            } else {
              return e;
            }
          }),
        };
      });
      series = [...series, ...overlappingSeries];
    }

    if (this.showPreviousData && !opts) {
      this.getPreviousBilling();
    }

    var options = {
      series: series,
      chart: {
        type: "line",
        height: "100%",
        stacked: this.stackedChart,
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
          type: "x",
        },
        events: {
          click: (event, chartContext, config) => {
            // console.log(event);
            // console.log(chartContext);
            // console.log(config);
            // console.log(this.paginatedTableData);
            // console.log(config.seriesIndex);
            // console.log(config.dataPointIndex);
            this.getDrillDownFor(
              this.paginatedTableData[config.seriesIndex] as any,
              config.dataPointIndex + 1
            );
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        categories: tableHeader,
        type: "category",
        labels: {
          show: true,
          style: {
            colors: "#f5f5f5",
            cssClass: "apexcharts-xaxis-label",
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
            text: "Billing Amount",
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

  getFilterValue(group: groupOptions) {
    this.currentFilter = group;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      filters: {},
    };
    if (
      this.currentFilter.value == "customerid" &&
      this.appliedFilters.customerid &&
      this.appliedFilters.customerid.length > 0
    ) {
      condition["filters"]["customerid"] = this.appliedFilters.customerid.map(
        (o) => {
          return o.value;
        }
      );
    } 
    if (
      this.currentFilter.value == "_accountid" &&
      this.appliedFilters._accountid &&
      this.appliedFilters._accountid.length > 0
    ) {
      condition["filters"]["_accountid"] = this.appliedFilters._accountid.map(
        (o) => {
          return o.value;
        }
      );
    }

    this.billingService.getFilterValue(group.value, condition).subscribe(
      (res) => {
        const response: {
          code: number;
          message: string;
          status: boolean;
          data: IAssetBilling[];
        } = JSON.parse(res._body);

        if (this.appliedFilters[group.value]) {
          this.filters[group.value] = {};
          this.appliedFilters[group.value].forEach((o) => {
            this.filters[group.value][o["value"]] = true;
          });
        } else {
          this.filters[group.value] = {};
        }
        if (response && response.data) {
          const filterableValues = response.data.map((d) => {
            if (group.groupattr) {
              return {
                title:
                  d[group.groupattr] && d[group.groupattr]
                    ? d[group.groupattr]["title"]
                    : d[group.value],
                value:
                  d[group.groupattr] && d[group.groupattr]
                    ? d[group.groupattr]["value"]
                    : d[group.value],
              };
            } else {
              return {
                title: d[group.value],
                value: d[group.value],
              };
            }
          });
          this.filterableValues = _.orderBy(filterableValues, ["title"], ["asc"]);
          this.filterMenuVisible = true
        } else {
          this.filterMenuVisible = false
        }
      },
      (err) => {
        console.log("Error getting filter values.");
        console.log(err);
      }
    );
  }

  applyFilter() {
    let values = [];

    for (const key in this.filters[this.currentFilter.value]) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.filters[this.currentFilter.value],
          key
        )
      ) {
        const value = this.filters[this.currentFilter.value][key];
        if (value) {
          const r = this.filterableValues.find((o) => o.value == key);
          values.push({
            title: r.title,
            value: r.value,
          });
        }
      }
    }

    this.appliedFilters[this.currentFilter.value] = values;
    this.filterMenuVisible = false;
    this.getBilling();
  }

  downloadCSV() {
    console.log("To download csv .>>>>");
    var csv = Papa.unparse([[...this.tableHeader], ...this.tableData]);
    console.log([[...this.tableHeader], ...this.tableData]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }

  removeAppliedFilter(g: groupOptions) {
    delete this.appliedFilters[g.value];
    this.getBilling();
  }

  paginateTable() {
    this.paginatedTableData = this.tableData.slice(
      (this.tablePageIndex - 1) * 10,
      10 * this.tablePageIndex
    ) as any;
  }

  getDrillDownFor(i: string[], j: number) {
    console.log("Get drillDown for >>>>", i, j);

    let filter = {};
    let resourcetype = null;
    let startDate = this.tableHeader[j];
    let endDate = this.tableHeader[j];

    if (this.groupBy) {
      switch (this.groupBy) {
        case "customerid": {
          const customerName = i[0];
          const customers = _.uniqBy(
            this.billingData.map((o) => o._customer),
            "title"
          );
          filter["customerid"] = customers.find((o) => o.title == customerName)[
            "value"
          ];
          break;
        }
        case "_accountid": {
          const accountName = i[0];
          const accounts = _.uniqBy(
            this.billingData.map((o) => o._account),
            "title"
          );
          filter["_accountid"] = accounts.find((o) => o.title == accountName)[
            "value"
          ];
          break;
        }
        case "resourcetype": {
          resourcetype = i[0];
        }
        default: {
          filter[this.groupBy] = i[0];
          break;
        }
      }
    }

    // To pass filtered columns too, if removed the chart and drilled fown value won't match.
    for (const key in this.appliedFilters) {
      if (Object.prototype.hasOwnProperty.call(this.appliedFilters, key)) {
        const element = this.appliedFilters[key];
        if (element.length > 0) {
          filter[key] = element.map((e) => {
            return e.value;
          });
        }
      }
    }

    if (this.models.duration == "Week") {
      // const date = getSundayFromWeekNum(this.tableHeader[j], 1, 2022);
      // console.log("Date is>>>>>");
      // console.log(date);
      return;
    }
    if (this.models.duration == "Month") {
      startDate = moment(this.tableHeader[j])
        .startOf("month")
        .toDate()
        .toString();
      endDate = moment(this.tableHeader[j]).endOf("month").toDate().toString();
    }

    this.ddStartDate = startDate;
    this.ddEndDate = endDate;

    this.ddOptions = {
      filters: filter,
      resourcetype,
    };
  }

  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d: ITag[] = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        console.log("TAGS LIST FOR DROPDOWN");
        console.log(d);
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }

  tagChanged(e) {
    if (e == null) {
      this.selectedTag = null;
      return;
    }
    let tag = this.tagList.find((o) => o["tagid"] == e);
    let tagClone = _.cloneDeep(tag) as any;

    this.models.tagvalue = null;

    if (tagClone.tagtype == "list") {
      tagClone.lookupvalues = tagClone.lookupvalues.split(",");
    } else if (
      tagClone.tagtype == "range" &&
      typeof tagClone.lookupvalues == "string"
    ) {
      tagClone.min = tagClone.lookupvalues.split(",")[0];
      tagClone.min = tagClone.lookupvalues.split(",")[1];
    }

    this.selectedTag = _.cloneDeep(tagClone);
  }
}
