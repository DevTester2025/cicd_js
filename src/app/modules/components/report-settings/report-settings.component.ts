import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { AssetConstant } from "src/app/asset.constant";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { LocalStorageService } from "../../services/shared/local-storage.service";

@Component({
  selector: "app-report-settings",
  templateUrl: "./report-settings.component.html",
  styles: [
    `
      #grouptable th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }
      #grouptable td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #grouptable tr {
        padding: 5px;
      }

      #grouptable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      nz-select {
        width: 90%;
      }
    `,
  ],
})
export class ReportSettingsComponent implements OnInit {
  @Input() reporttype;
  @Input() reportsettings = {};
  @Input() crn;
  @Input() charttype;
  @Input() assetquery;
  @Output() applySettings: EventEmitter<any> = new EventEmitter();
  @Input() groupOptions = [];
  userstoragedata: any;
  settings = {
    // xaxis: null,
    // yaxis: null,
    // groupby: null,
    // orderby: null,
    // aggregate: null,
    // order: "Desc",
    // limit: 5,
  } as any;
  chartTypes = AppConstant.CHART_TYPES;
  aggregations = [
    { title: "Max", value: "MAX" },
    { title: "Min", value: "MIN" },
    { title: "Avg", value: "AVG" },
    { title: "Sum", value: "Sum" },
    { title: "Cumulative Sum", value: "cum_sum" },
    { title: "Count", value: "Count" },
    { title: "Cumulative Count", value: "cum_count" },
  ];
  iscmdb: boolean = false;
  // groupoptions = [];
  xaxisAttributes = [];
  yaxisAttributes = [];
  rangebarXaxis = [];
  rangebarYaxis = [];
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    console.log("KPI setting");
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('re', changes)
    if(this.reporttype !== AppConstant.KPI_REPORING.SYNTHETICS){
      if (changes.groupOptions && !_.isEmpty(changes.groupOptions.currentValue)) {
        this.iscmdb = false;
        this.groupOptions = _.filter(changes.groupOptions.currentValue, function (e) { return e.cangroup == true });
      }
    }
    if (changes.reportsettings && changes.reportsettings.currentValue) {
      this.reportsettings = changes.reportsettings.currentValue;
      this.settings = changes.reportsettings.currentValue;
    }
    if (changes.charttype && changes.charttype.currentValue) {
      this.charttype = changes.charttype.currentValue;
    }
    if (changes.crn && !_.isEmpty(changes.crn.currentValue) && !_.isNull(changes.crn.currentValue)) {
      this.crn = changes.crn.currentValue;
      this.getAttributes(this.crn);
    }

    if (changes.reporttype && changes.reporttype.currentValue != undefined) {
      this.reporttype = changes.reporttype.currentValue;
      if (this.reporttype == AppConstant.KPI_REPORING.CMDB) {
        this.chartTypes.push({ label: "Timeline", value: "rangeBar" });
      } else {
        this.chartTypes = AppConstant.CHART_TYPES;
      }
      // if (this.reporttype == AppConstant.KPI_REPORING.TICKETS) {
      //   this.iscmdb = false;
      //   this.groupoptions = _.filter(AssetConstant.KPI.TICKETSGROUPANDFILTERS, function (e) { return e.cangroup == true });
      //   this.chartTypes.splice(3, 1);
      // }
      // if (this.reporttype == AppConstant.KPI_REPORING.MONITORING) {
      //   this.iscmdb = false;
      //   this.groupoptions = _.filter(AssetConstant.KPI.MONITORGROUPANDFILTERS, function (e) { return e.cangroup == true });
      //   this.chartTypes.splice(3, 1);
      // }
      // if (this.reporttype == AppConstant.KPI_REPORING.ASSET) {
      //   this.iscmdb = false;
      //   this.groupoptions = _.filter(AssetConstant.KPI.ASSETGROUPANDFILTERS, function (e) { return e.cangroup == true });
      //   this.chartTypes.splice(3, 1);
      // }
      if (this.reporttype == AppConstant.KPI_REPORING.CMDB || this.reporttype == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY || this.reporttype == AppConstant.KPI_REPORING.SYNTHETICS) {
        this.iscmdb = true;
        this.chartTypes = AppConstant.CHART_TYPES;
      } else {
        this.iscmdb = false;
      }
      if (changes.assetquery && !_.isEmpty(changes.assetquery.currentValue)) {
        let query = JSON.parse(changes.assetquery.currentValue.meta);

        if (query != null) {
          this.xaxisAttributes = [];
          query.primaryresource.attributes = query.primaryresource.attributes.map((e) => {
            e.fieldname = query.primaryresource.resourcetype.resource + '_' + e.fieldname;
            e.type = 'parent';
            return {
              title: e.fieldname,
              value: e
            };
          })
          this.xaxisAttributes = this.xaxisAttributes.concat(query.primaryresource.attributes);
          this.yaxisAttributes = [];
          query.reference.map((e) => {
            if (e.attributes) {
              e.attributes = e.attributes.map((a) => {
                a.fieldname = e.resourcetype.resourcetype + '_' + a.fieldname;
                e.type = 'reference';
                return {
                  title: a.fieldname,
                  value: a
                };
              });
              this.yaxisAttributes = this.yaxisAttributes.concat(e.attributes);
              this.xaxisAttributes = this.xaxisAttributes.concat(e.attributes);
            }
          });
          // this.yaxisAttributes = this.yaxisAttributes.concat(this.xaxisAttributes);
        }
        if (!_.isEmpty(this.settings)) {
          this.settings.xaxis = (_.find(this.xaxisAttributes, { title: this.settings.xaxis.fieldname })).value;
          this.settings.yaxisList.map((y) => {
            y.yaxis = (_.find(this.yaxisAttributes, { title: y.yaxis.fieldname })).value
          });
        } else {
          this.settings.yaxisList = [];
          this.settings.yaxisList.push({
            yaxis: null,
            aggregate: null,
            // color: null,
            seriesname: "",
          });
        }
      }

      if (this.reporttype == AppConstant.KPI_REPORING.SYNTHETICS) {
        this.xaxisAttributes = [
          {
            title: 'Synthetic Name',
            value: {
              fieldname: 'Synthetic Name',
              fieldkey: 'canaryname'
            }
          },
          {
            title: 'Application URL',
            value: {
              fieldname: 'Application URL',
              fieldkey: 'url'
            }
          },
          {
            title: 'Date',
            value: {
              fieldname: 'Date',
              fieldkey: 'createddt'
            }
          }
        ];
        this.yaxisAttributes = [
          {
            title: 'Success',
            value: {
              fieldname: 'Success',
              fieldkey: 'executionstatus',
              fieldvalue: 'PASSED'
            }
          },
          {
            title: 'Failed',
            value: {
              fieldname: 'Failed',
              fieldkey: 'executionstatus',
              fieldvalue: 'FAILED'
            }
          },
          {
            title: 'Response Time',
            value: {
              fieldname: 'Response Time',
              fieldkey: 'responsetime',
              fieldvalue: 'RESPONSETIME'
            }
          },
          {
            title: 'Uptime Percent',
            value: {
              fieldname: 'Uptime Percent',
              fieldkey: 'uptimepercent',
              fieldvalue: 'UPTIMEPERCENT'
            }
          }
        ];
        this.aggregations = [
          { title: "Count", value: "count" },
          { title: "Avg", value: "avg" }
        ];
        if (!_.isEmpty(this.settings)) {
          this.settings.xaxis = (_.find(this.xaxisAttributes, { title: this.settings.xaxis.fieldname })).value;
          this.settings.yaxisList.map((y) => {
            y.yaxis = (_.find(this.yaxisAttributes, { title: y.yaxis.fieldname })).value
          });
        } else {
          this.settings.yaxisList = [];
          this.settings.yaxisList.push({
            yaxis: this.yaxisAttributes[2].value,
            aggregate: this.aggregations[1].value,
            // color: null,
            seriesname: this.yaxisAttributes[2].title,
          });
          this.settings.limit = 50;
          this.settings.order = "Desc";
          this.settings.xaxis = this.xaxisAttributes[2].value;
          this.settings.xaxisname = this.xaxisAttributes[2].title;
        }
      }
    }


  }

  ngOnInit() { }

  onYaxischange(i) {
    if (this.reporttype == AppConstant.KPI_REPORING.SYNTHETICS) {
      this.settings.yaxisList[i]['aggregate'] = this.settings.yaxisList[i]['yaxis']['fieldkey'] == 'responsetime' ? this.aggregations[1].value : this.aggregations[0].value;
      this.settings.showOrder = this.settings.yaxisList[i].yaxis.fieldkey === 'uptimepercent';   
    }
  }

  getAttributes(crn) {
    this.xaxisAttributes = [];
    this.yaxisAttributes = [];
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      crn: crn,
    };
    this.assetRecordService.all(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response) {
        response.data.map((el) => {
          let obj = {
            title: el.fieldname,
            value: {
              fieldname: el.fieldname,
              fieldtype: el.fieldtype,
              fieldkey: el.fieldkey,
              identifier: el.identifier,
            },
          };
          if (el.fieldtype == 'Text' || el.identifier == 1) {
            this.rangebarYaxis.push(obj);
          }
          if (el.fieldtype == 'DateTime') {
            this.rangebarXaxis.push(obj);
          }
          if (el.fieldtype == 'Text' || el.fieldtype == 'REFERENCE' || el.fieldtype == 'Select' || el.fieldtype == 'STATUS' || el.fieldtype == 'DateTime') {
            this.xaxisAttributes.push(obj);
          }
          if (el.fieldtype == 'Integer' || el.fieldtype == 'AUTOGEN') {
            this.yaxisAttributes.push(obj);
          }
        });
        if (!_.isEmpty(this.reportsettings)) {
          this.formSetting();
        } else {
          this.otherChartSetting();
        }
      } else {
        this.rangebarYaxis = [];
        this.rangebarXaxis = [];
        this.xaxisAttributes = [];
        this.yaxisAttributes = [];

      }
    });
  }

  timeLinechartSetting() {
    this.settings = {};
    const yaxis = _.find(this.rangebarYaxis, function (e) {
      return e.value.identifier == true;
    });
    this.settings["yaxis"] = yaxis ? yaxis.value : null;
    this.settings["yaxisname"] = yaxis ? yaxis.value.fieldname : "";
    this.settings["xaxisList"] = [{ xaxis: null }];
  }

  otherChartSetting() {
    if (this.reporttype == AppConstant.KPI_REPORING.CMDB && _.isEmpty(this.reportsettings)) {
      this.settings = {};
      const xaxis = _.find(this.xaxisAttributes, function (e) {
        return e.value.identifier == true;
      });
      this.settings["xaxis"] = xaxis.value;
      this.settings["xaxisname"] = xaxis ? xaxis.value.fieldname : "";
      this.settings["order"] = "Desc";
      this.settings["limit"] = 5;
      this.settings["yaxisList"] = [
        {
          yaxis: null,
          aggregate: null,
          seriesname: "",
        },
      ];
    }

    if (this.reporttype == AppConstant.KPI_REPORING.TICKETS && this.reporttype == AppConstant.KPI_REPORING.MONITORING && this.reporttype == AppConstant.KPI_REPORING.ASSET) {
      this.settings = {
        charttype: 'bar',
        groupby: null,
        yaxisList: []
      }
    }

  }

  formSetting() {
    console.log(this.reportsettings);
    let self = this;
    if (this.charttype != "rangeBar") {
      this.settings = this.reportsettings;
      let xaxis = _.find(this.xaxisAttributes, function (e) {
        return e.value.fieldname == self.reportsettings["xaxis"].fieldname;
      });
      this.settings.xaxis = xaxis.value;
      this.settings.xaxisname = this.reportsettings["xaxisname"];
      this.reportsettings["yaxisList"].map((r, i) => {
        let yaxis = _.find(this.yaxisAttributes, function (e) {
          return e.value.fieldname == r["yaxis"].fieldname;
        });
        this.settings.yaxisList[i].yaxis = yaxis.value;
      });
    } else {
      this.settings = this.reportsettings;

      let yaxis = _.find(this.rangebarYaxis, function (e) {
        return e.value.fieldname == self.reportsettings["yaxis"].fieldname;
      });
      this.settings.yaxis = yaxis.value;
      this.settings.yaxisname = this.reportsettings["yaxisname"];

      this.reportsettings["xaxisList"].map((r, i) => {
        let xaxis = _.find(this.rangebarXaxis, function (e) {
          return e.value.fieldname == r["xaxis"].fieldname;
        });
        this.settings.xaxisList[i].xaxis = xaxis.value;
      });
    }
  }

  onChangeChartType(event) {
    console.log(event);
    if (event == "rangeBar") {
      this.timeLinechartSetting();
    } else {
      this.otherChartSetting();
    }
  }

  apply() {
    this.applySettings.next({ settings: this.settings, charttype: this.charttype, reporttype: this.reporttype });
  }

  addRow() {
    console.log(this.settings);
    if (this.charttype == "rangeBar") {
      this.settings.xaxisList.push({
        xaxis: null,
      });
    } else {
      this.settings.yaxisList.push({
        yaxis: null,
        aggregate: null,
        // color: null,
        seriesname: "",
      });
    }
  }

  deleteRow(i) {
    if (this.charttype == "rangeBar") {
      this.settings.xaxisList.splice(i, 1);
    } else {
      this.settings.yaxisList.splice(i, 1);
    }
  }
}
