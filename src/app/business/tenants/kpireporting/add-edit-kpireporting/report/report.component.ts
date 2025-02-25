import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ChartComponent
} from "ng-apexcharts";
import { AppConstant } from "src/app/app.constant";
import { AssetConstant } from "src/app/asset.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as moment from "moment";
import { IncidentService } from "../../../customers/incidents.service";
import * as _ from "lodash";
import { KPIReportingService } from "../../kpireporting.service";
import { EventLogService } from "../../../../base/eventlog/eventlog.service";
import { NzMessageService } from "ng-zorro-antd";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import * as Papa from "papaparse";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as ApexChart from "apexcharts";
import { UsersService } from "../../../../admin/users/users.service";
import { TenantsService } from "../../../../tenants/tenants.service";
import { SLATemplatesService } from "../../../../tenants/servicemgmt/slatemplates/slatemplates.service";
import { TagService } from '../../../../base/tagmanager/tags.service';
import { SSLService } from '../../../../../monitoring/ssl/sslservice';
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Component({
  selector: 'app-report',
  templateUrl: '../../../../../presentation/web/tenant/kpireporting/add-edit-kpireporting/report/report.component.html',
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
        color: #ffcc00;
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
export class ReportComponent implements OnInit {
  @Input() reporthdrid;
  @Input() selectedfeature;
  @Input() reportname;
  @Input() reportdesc;
  @Output() notifyChanges: EventEmitter<any> = new EventEmitter();
  public chartOptions: any;
  title = 'Report';
  chart: ApexChart | null = null;

  currentTab = 0;
  tableconfig = {
    edit: false,
    delete: false,
    showasset: false,
    globalsearch: false,
    pagination: true,
    loading: false,
    pageSize: 7,
    title: "",
    // widthConfig: ["25px", "25px"],
  };
  reportData = [];
  reportHdr = [];
  chartType = 'bar';
  kpireportObj = {};
  reportForm: FormGroup;
  reportList = [];
  userstoragedata;
  settings: any = {};
  filterby: any = {};
  opensettingmenu: any = false;
  xaxis = [];
  groupandFilterByOptions: any = [];
  ticketgroupAndFilterByOptions = AssetConstant.KPI.TICKETSGROUPANDFILTERS;
  _confighdrid = null;
  resourceTypes = [];
  cardstyle = `{'height': 660px}`;
  addnew = false;
  reportErrObj = {
    seriesname: AppConstant.VALIDATIONS.REPORT.REPORTNAME,
  };
  savedqueries = [];
  syntheticData = [];
  loading = false;
  constructor(
    public fb: FormBuilder,
    public router: Router,
    private routes: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private incidentService: IncidentService,
    private kpiReportingService: KPIReportingService,
    private eventLogService: EventLogService,
    private message: NzMessageService,
    private assetRecordService: AssetRecordService,
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private slaTemplatesService: SLATemplatesService,
    private tagService: TagService,
    private sslService: SSLService,
    private httpService: HttpHandlerService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this._confighdrid = params.id;
      } else {
        this.addnew = true;
      }
    });
  }

  ngOnInit() {
    // this.initForm();
    this.getResourceType();
    this.chartOptions = this.prepareChartData([])
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!_.isUndefined(changes.selectedfeature) && !_.isUndefined(changes.selectedfeature.currentValue)) {
      this.title = 'Report - ' + changes.selectedfeature.currentValue.title;
      this.currentTab = 0;
      if (changes.selectedfeature.currentValue.value == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY) {
        this.getSavedQueries();
      }
      this.initForm();
    } else {
      this.initForm();
    }

    if (this._confighdrid != null) {
      this.getReportConfig();
    }
  }
  getSavedQueries() {
    this.assetRecordService.allqueries({
      tenantid: this.userstoragedata['tenantid'],
      status: AppConstant.STATUS.ACTIVE
    }).subscribe((d) => {
      let response = JSON.parse(d._body);
      if (response.status) {
        this.savedqueries = response.data;
      } else {
        this.savedqueries = [];
      }
    });
  }
  onQueryChange(e) {
    this.settings = {};
  }
  initForm() {
    this.reportForm = this.fb.group({
      id: [null],
      query: [null],
      seriesname: ['', Validators.required],
      reportdate: [
        [moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),]
      ],
      configdtlid: [null],
      duration: ['Daily'],
      resourcetype: [null],
      groupby: [null],
      charttype: ['bar']
    });
    this.settings = {};
    this.filterby = {};
    if (this.selectedfeature.value == AppConstant.KPI_REPORING.CMDB) {
      this.reportForm.get('resourcetype').setValue(this.resourceTypes[0].crn);
      this.reportForm.get('resourcetype').updateValueAndValidity();
      this.reportForm.updateValueAndValidity();
    }
    if (this.selectedfeature.value == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY) {
      this.reportForm.get('query').setValue(null);
      this.reportForm.get('seriesname').setValue('');
      this.reportForm.get('seriesname').clearValidators();
      this.reportForm.get('seriesname').updateValueAndValidity();
      this.reportForm.updateValueAndValidity();
      this.getChartSeries(
        AppConstant.KPI_REPORING.CMDB_SAVEDQUERY,
        []
      );
    }
    if (this.selectedfeature.value == AppConstant.KPI_REPORING.SYNTHETICS) {
      this.reportForm.get('charttype').setValue('line');
      this.reportForm.get('charttype').updateValueAndValidity();
      this.reportForm.updateValueAndValidity();
    }
    this.initiateReports();
  }
  editForm(data) {
    this.reportForm = this.fb.group({
      id: [data.id],
      seriesname: [data.seriesname, Validators.required],
      reportdate: [[new Date(data.startdate), new Date(data.enddate)]],
      configdtlid: [data],
      duration: [data.duration],
      resourcetype: [null],
      groupby: [data.groupby],
      charttype: [data.charttype],
      query: null
    });
    this.settings = JSON.parse(data.settings);
    this.filterby = JSON.parse(data.filterby);
    if (this.selectedfeature.value == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY) {
      this.reportForm.get('query').setValue(_.find(this.savedqueries, { id: data.savedqueryid }));
    } else {
      this.reportForm.get('reportdate').setValue([new Date(data.startdate), new Date(data.enddate)]);
      this.reportForm.get('resourcetype').setValue(this.filterby && this.filterby.crn ? this.filterby.crn[0] : null);
    }
    this.reportForm.updateValueAndValidity();
    this.initiateReports();
  }

  initiateReports(e?) {
    console.log(this.filterby)
    let condition = {};
    condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      duration: this.reportForm.value.duration,
      startdate: moment(this.reportForm.get('reportdate').value[0]).format("YYYY-MM-DD"),
      enddate: moment(this.reportForm.get('reportdate').value[1]).format("YYYY-MM-DD"),
    };
    if (this.reportForm.get('groupby').value != null) {
      condition["groupby"] = this.reportForm.get('groupby').value;
    }
    if (!_.isEmpty(this.filterby)) {
      condition["filters"] = [];
      let self = this;
      _.map(this.filterby, function (value, key) {
        if ((!_.isEmpty(value) && value.value != "") || value.value != null) {
          let obj = {};
          obj[key] = value;
          condition["filters"].push(obj);
          let groupIndex = _.findIndex(self.groupandFilterByOptions, {
            value: key,
          });
          if (groupIndex != -1) {
            self.groupandFilterByOptions[groupIndex]["selectedvalues"] =
              value;
          }
        }
      });
    } else {
      this.groupandFilterByOptions = _.map(this.groupandFilterByOptions, function (e) { e.selectedvalues = []; return e; })
    }
    switch (this.selectedfeature.value) {
      case AppConstant.KPI_REPORING.TICKETS: this.groupandFilterByOptions = AssetConstant.KPI.TICKETSGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.tickets; this.getTickets(condition); break;
      case AppConstant.KPI_REPORING.ASSET: this.groupandFilterByOptions = AssetConstant.KPI.ASSETGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.assets; this.getAssets(condition); break;
      case AppConstant.KPI_REPORING.MONITORING: this.groupandFilterByOptions = AssetConstant.KPI.MONITORGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.monitoring; this.getMonitoring(condition); break;
      case AppConstant.KPI_REPORING.CMDB: this.groupandFilterByOptions = AssetConstant.KPI.CMDBGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.cmdb; this.getCMDB(); break;
      case AppConstant.KPI_REPORING.CMDB_SAVEDQUERY: this.getCMDBSavedQuery(); break;
      case AppConstant.KPI_REPORING.USERS: this.groupandFilterByOptions = AssetConstant.KPI.USERGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.users; this.getUsers(condition); break;
      case AppConstant.KPI_REPORING.CUSTOMERS: this.groupandFilterByOptions = AssetConstant.KPI.CUSTOMERGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.customer; this.getCustomers(condition); break;
      case AppConstant.KPI_REPORING.DATAMANAGEMENT: this.groupandFilterByOptions = AssetConstant.KPI.DATAMANAGEMENTGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.datamanagement; this.getDatamanagementReport(condition); break;
      case AppConstant.KPI_REPORING.SLA: this.groupandFilterByOptions = AssetConstant.KPI.SLAGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.sla; this.getSLA(condition); break;
      case AppConstant.KPI_REPORING.TAGS: this.groupandFilterByOptions = AssetConstant.KPI.TAGSGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.tag; this.getTags(condition); break;
      case AppConstant.KPI_REPORING.SYNTHETICS: this.groupandFilterByOptions = AssetConstant.KPI.SYNTHETICS;
        if (_.isEmpty(this.filterby)) {
          this.groupandFilterByOptions = _.map(AssetConstant.KPI.SYNTHETICS, function (e) { e.selectedvalues = []; return e; })
        } console.log(this.groupandFilterByOptions); this.reportHdr = AppConstant.TABLE_HEADERS.synthetics; this.getSynthetics(condition); break;
      case AppConstant.KPI_REPORING.SSL: this.groupandFilterByOptions = AssetConstant.KPI.SSLGROUPANDFILTERS; this.reportHdr = AppConstant.TABLE_HEADERS.ssl; this.getSSL(condition); break;
    }
  }

  getReportConfig() {
    this.kpiReportingService.byId(this.reporthdrid).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.kpireportObj = response.data;
        this.getSeries();
      } else {
        this.kpireportObj = {};
        this.message.error(response.message);
      }
    });
  }

  getSeries() {
    this.reportList = [];
    this.kpiReportingService
      .alldetails({
        _confighdrid: Number(this.reporthdrid),
        status: AppConstant.STATUS.ACTIVE,
        reporttype: this.selectedfeature.value
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.addnew = false;
          this.reportList = response.data;
          this.editForm(this.reportList[0]);
        } else {
          this.addnew = true;
          this.reportList = [];
        }
      });
  }

  getReport(data) {
    this.currentTab = 0;
    this.getChartSeries(
      AppConstant.KPI_REPORING.CMDB_SAVEDQUERY,
      []
    );
    this.editForm(data);
    // this.initiateReports();
  }

  onchangeTab(index) {
    this.currentTab = index;
    if (index == 0) {
      this.initiateReports();
    }
  }

  getCustomers(condition) {
    this.tenantsService
      .allcustomers(condition, `chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.reportData = response.data;
          let self = this;
          this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
          // this.reportHdr = _.filter(AppConstant.TABLE_HEADERS.tickets, function (i) { return i.show == true })
          this.getChartSeries(
            AppConstant.KPI_REPORING.CUSTOMERS,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.CUSTOMERS, []);
        }
      });
  }
  getDatamanagementReport(condition) {
    this.assetRecordService
      .all(condition, `chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.reportData = response.data;
          let self = this;
          this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
          // this.reportHdr = _.filter(AppConstant.TABLE_HEADERS.tickets, function (i) { return i.show == true })
          this.getChartSeries(
            AppConstant.KPI_REPORING.DATAMANAGEMENT,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.DATAMANAGEMENT, []);
        }
      });
  }


  getResourceType() {
    this.assetRecordService
      .getResourceTypes({
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response) {
          response = _.orderBy(response, ["resource"], ["asc"]);
          this.resourceTypes = response;
        } else {
          this.resourceTypes = [];
        }
      });
  }

  getSLA(condition) {
    this.slaTemplatesService
      .all(condition, `?chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.reportData = response.data;
          // this.reportHdr = _.filter(AppConstant.TABLE_HEADERS.tickets, function (i) { return i.show == true })
          this.getChartSeries(
            AppConstant.KPI_REPORING.SLA,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.SLA, []);
        }
      });
  }

  getTags(condition) {
    this.tagService
      .all(condition, `chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.reportData = response.data;
          // this.reportHdr = _.filter(AppConstant.TABLE_HEADERS.tickets, function (i) { return i.show == true })
          this.getChartSeries(
            AppConstant.KPI_REPORING.TAGS,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.TAGS, []);
        }
      });
  }

  getUsers(condition) {
    this.usersService
      .allUsers(condition, `chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.reportData = response.data;
          let self = this;
          this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
          this.getChartSeries(
            AppConstant.KPI_REPORING.USERS,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.USERS, []);
        }
      });
  }

  getAssets(condition) {
    this.commonService.instancechart(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let self = this;
        this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
        // this.assetHdr = _.filter(AppConstant.TABLE_HEADERS.assets, function (i) { return i.show == true })
        this.reportData = response.data;
        this.getChartSeries(
          AppConstant.KPI_REPORING.ASSET,
          response.data
        );
      } else {
        this.getChartSeries(AppConstant.KPI_REPORING.ASSET, []);
      }
    });
  }

  getMonitoring(condition) {
    this.eventLogService
      .all(condition, `chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          let self = this;
          this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
          this.reportData = response.data;
          // this.monitoringHdr = _.filter(AppConstant.TABLE_HEADERS.monitoring, function (i) { return i.show == true })
          this.getChartSeries(
            AppConstant.KPI_REPORING.MONITORING,
            response.data
          );
        } else {
          this.getChartSeries(
            AppConstant.KPI_REPORING.MONITORING,
            []
          );
        }
      });
  }
  getSSL(condition) {
    this.sslService
      .all(condition, `?chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          let self = this;
          this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
          this.reportData = response.data;
          if (this.reportForm.value.groupby == 'urls') {
            this.reportHdr = [];
            this.reportHdr.push(
              {
                header: "Expiry Date",
                field: 'x',
                datatype: "timestamp",
                format: "dd-MMM-yyyy",
                show: true,
              },
              {
                header: "URL",
                field: "urls",
                datatype: "string",
                showdefault: true
              });
          }
          this.getChartSeries(
            AppConstant.KPI_REPORING.SSL,
            response.data
          );
        } else {
          this.getChartSeries(
            AppConstant.KPI_REPORING.SSL,
            []
          );
        }
      });
  }
  getSynthetics(condition) {
    console.log(this.settings);
    console.log(this.groupandFilterByOptions);
    this.loading = true;
    if (!_.isEmpty(this.settings)) {
      condition["settings"] = this.settings;
      console.log('Synthetic', condition);
      if (condition['filters'] && condition['filters'].length > 0) {
        _.map(condition['filters'], function (e) {
          let obj = {};
          obj = e;
          if (e['zonename']) {
            obj['region'] = _.map(e['zonename'], function (z) { return z.value });
            delete obj['zonename']
          }
          return obj;
        });
      }
      const upTime = this.settings.yaxisList.find((e)=>{ return e.yaxis.fieldkey == 'uptimepercent' })
      if(upTime){
        this.httpService.POST(AppConstant.DashBoardAPIURL + '/cloudmatiq/syntheticmetric/report/uptime',condition)
        .subscribe((result)=>{
          console.log(result);
          let response = JSON.parse(result._body);
          this.syntheticData = response.details;
          console.log(this.syntheticData, "-----");
          let isdatetimechart = false;
          if (this.settings.xaxis.fieldkey == 'createddt') {
            isdatetimechart = true;
          }
          this.reportHdr = [];
          this.reportHdr.push({
            field: this.settings.xaxis.fieldname,
            header: this.settings.xaxis.fieldname,
            datatype: "string",
            show: true,
            fieldname: this.settings.xaxis.fieldname,
            fieldkey: this.settings.xaxis.fieldkey
          });
          this.settings.yaxisList.map((e) => {
            this.reportHdr.push({
              field: (e.yaxis.fieldkey == 'uptimepercent') ? e.yaxis.fieldkey : e.yaxis.fieldname,
              header: e.yaxis.fieldname,
              datatype: "string",
              show: true,
              fieldname: e.yaxis.fieldname,
              fieldkey: e.yaxis.fieldkey
            });
          });
          this.reportData = [];
          response['details'].map((r) => {
            let obj = {};
            obj[this.settings.xaxis.fieldname] = this.settings.xaxis.fieldkey == 'createddt'? moment(r[this.settings.xaxis.fieldkey]).format('DD-MMM-YYYY hh:mm:ss') : r[this.settings.xaxis.fieldkey];
            this.settings.yaxisList.map((e) => {
              if (e.yaxis.fieldkey == 'uptimepercent') {
                obj[e.yaxis.fieldkey] = r[e.yaxis.fieldkey];
                obj['url'] = r['url'];
              }
              obj[e.yaxis.fieldname] = r[e.yaxis.fieldname];
            })
            obj['region'] = (r['region']) ? r['region'] : '';
            this.reportData.push(obj)
          });
          let yaxis_ut = _.find(this.settings.yaxisList, function (e) { return e.yaxis.fieldkey == 'uptimepercent' });
            if (yaxis_ut) {
              this.reportHdr.push({
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
          this.drawChart(
            response.chart, this.reportForm.get('charttype').value,
            this.settings.xaxis.seriesname,
            '',
            true,
            isdatetimechart
          );
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.getChartSeries(AppConstant.KPI_REPORING.SYNTHETICS, []);
        });
      }else{
        this.httpService
        .POST(
          AppConstant.DashBoardAPIURL +
          '/cloudmatiq/syntheticmetric/chart',
          condition
        )
        .subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            this.syntheticData = response.details;
            this.reportHdr = [];
            this.reportHdr.push({
              field: this.settings.xaxis.fieldkey,
              header: this.settings.xaxis.fieldname,
              datatype: "string",
              show: true,
              fieldname: this.settings.xaxis.fieldname,
              fieldkey: this.settings.xaxis.fieldkey
            });
            this.settings.yaxisList.map((e) => {
              this.reportHdr.push({
                field: (e.yaxis.fieldkey == 'responsetime') ? e.yaxis.fieldkey : e.yaxis.fieldname,
                header: e.yaxis.fieldname,
                datatype: "string",
                show: true,
                fieldname: e.yaxis.fieldname,
                fieldkey: e.yaxis.fieldkey
              });
            });
            let isdatetimechart = false;
            if (this.settings.xaxis.fieldkey == 'createddt') {
              isdatetimechart = true;
            }
            this.reportData = [];
            let yaxis_rs = _.find(this.settings.yaxisList, function (e) { return e.yaxis.fieldkey == 'responsetime' });
            if (yaxis_rs) {
              this.reportHdr.push({
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
              obj[this.settings.xaxis.fieldkey] = this.settings.xaxis.fieldkey == 'createddt' ? moment(r['_id'][this.settings.xaxis.fieldkey]).format('DD-MMM-YYYY hh:mm:ss') : r['_id'][this.settings.xaxis.fieldkey];
              this.settings.yaxisList.map((e) => {
                if (e.yaxis.fieldkey == 'responsetime') {
                  obj[e.yaxis.fieldkey] = r['_id'][e.yaxis.fieldkey] + 'ms';
                  obj['url'] = r['_id']['url'];
                }
                obj[e.yaxis.fieldname] = r[e.yaxis.fieldname];
              })
              obj['region'] = (r['_id']['region']) ? r['_id']['region'] : '';
              this.reportData.push(obj)
            });
            this.drawChart(
              response.chart, this.reportForm.get('charttype').value,
              this.settings.xaxis.seriesname,
              '',
              true,
              isdatetimechart
            );
            this.loading = false;
          },
          (err) => {
            this.loading = false;
            this.getChartSeries(AppConstant.KPI_REPORING.SYNTHETICS, []);
          }
        );
      }
    } else {
      this.loading = false;
      this.getChartSeries(AppConstant.KPI_REPORING.SYNTHETICS, []);

    }


  }

  getTickets(condition) {
    this.incidentService
      .all(condition, `?chart=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          let self = this;
          this.reportHdr = _.filter(this.reportHdr, function (i) { return i.field == 'x' || i.field == 'y' || i.field == self.reportForm.get('groupby').value })
          this.reportData = response.data;
          this.getChartSeries(
            AppConstant.KPI_REPORING.TICKETS,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.TICKETS, []);
        }
      });
  }

  getCMDB() {
    if (this.reportForm.get('resourcetype').value != null) {
      let condition = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
        duration: this.reportForm.value.duration,
        startdt: moment(this.reportForm.get('reportdate').value[0]).format("YYYY-MM-DD"),
        enddt: moment(this.reportForm.get('reportdate').value[1]).format("YYYY-MM-DD"),
      };
      condition["filters"] = {};
      if (this.reportForm.get('groupby').value) {
        condition["groupby"] = this.reportForm.get('groupby').value;
      }
      if (this.reportForm.get('charttype').value) {
        condition["charttype"] = this.reportForm.get('charttype').value;
      }
      if (!_.isEmpty(this.filterby)) {
        condition["filters"] = {};
        let self = this;
        _.map(this.filterby, function (value, key) {
          if (key != "attribute") {
            if ((!_.isEmpty(value) && value.value != "") || value.value != null) {
              let obj = {};
              obj[key] = _.map(value, function (i) {
                return i.value;
              });
              condition["filters"][key] = _.map(value, function (i) {
                return i.value;
              });
              let groupIndex = _.findIndex(self.groupandFilterByOptions, {
                value: key,
              });
              if (groupIndex != -1) {
                self.groupandFilterByOptions[groupIndex]["selectedvalues"] = value;
              }
            }
          }
          if (key == 'attribute') {
            condition["attributes"] = value;
            let attributeIndex = _.findIndex(self.groupandFilterByOptions, { value: 'attribute' });
            self.groupandFilterByOptions[attributeIndex].selectedvalues = value;
            self.groupandFilterByOptions = [...self.groupandFilterByOptions];
          }

        });
      }
      condition["filters"]['crn'] = [this.reportForm.get('resourcetype').value];
      if (!_.isEmpty(this.settings)) {
        condition["settings"] = this.settings;
      }
      this.assetRecordService.getResourceKPI(condition).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          let self = this;
          this.reportHdr = _.filter(AppConstant.TABLE_HEADERS.cmdb, function (i) { return i.show == true });
          // this.cmdbHdr = _.filter(AppConstant.TABLE_HEADERS.cmdb, function (i) { return i.show == true })
          this.reportData = _.map(response.data, function (item) {
            if (self.settings.xaxis.fieldtype == "REFERENCE") {
              item['x'] = JSON.parse(item.x)[0].name;
            }
            return item;
          });
          // Temp fix

          if (this.reportForm.value.charttype == 'rangeBar') {
            this.reportHdr = [];
            if (this.settings) {
              this.reportHdr.push({
                header: this.settings.yaxis.fieldname,
                field: 'x',
                datatype: "string",
                showdefault: true
              }, {
                header: 'Task A Name',
                field: 'label1',
                datatype: "string",
                showdefault: true
              }, {
                header: 'Task B Name',
                field: 'label2',
                datatype: "string",
                showdefault: true
              });
              this.settings.xaxisList.map((o, i) => {
                this.reportHdr.push({
                  header: o.xaxis.fieldname,
                  field: i == 0 ? 'timestart' : 'timeend',
                  datatype: "timestamp",
                  format: "dd-MMM-yyyy HH:mm:ss",
                  show: true
                });
              })
            }
            this.reportData = this.reportData.map((o) => {
              const fromDay = new Date(o['y0']).toISOString();
              const toDay = new Date(o['y1']).toISOString();
              const day1 = fromDay.substring(0, 10);
              const timestamp1 = fromDay.substring(11, 19);
              const day2 = toDay.substring(0, 10);
              const timestamp2 = toDay.substring(11, 19);
              o['timestart'] = moment(day1).format('DD-MMM-YYYY') + ' ' + timestamp1;
              o['timeend'] = moment(day2).format('DD-MMM-YYYY') + ' ' + timestamp2;
              return o;
            })
          }

          this.getChartSeries(
            AppConstant.KPI_REPORING.CMDB,
            response.data
          );
        } else {
          this.getChartSeries(AppConstant.KPI_REPORING.CMDB, []);
        }
      });
    } else {
      this.drawChart(
        [],
        this.reportForm.get('charttype').value,
        '',
        '',
        true)
    }
  }

  getCMDBSavedQuery() {
    if (this.reportForm.value.query != null) {
      let selectedq = JSON.parse(this.reportForm.value.query.meta);
      let mainresourcetype = selectedq.primaryresource;
      let mappedresources = selectedq.reference;
      let selectedFields = [];
      let req = {
        tenantid: this.userstoragedata["tenantid"],
        type: mainresourcetype.resourcetype["resource"],
        resourcetype: [mainresourcetype.resourcetype["resource"]],
        fields: [],
      }
      let self = this;
      _.map(mainresourcetype.attributes, function (e) {
        let f = _.find(mainresourcetype['selectedFilters'], function (i) { return i.fieldkey == e.fieldkey });

        if (e != "") {
          selectedFields.push({
            fieldname: e["fieldname"],
            fieldkey: e["fieldkey"],
            fieldtype: e['fieldtype'],
            crn: e['crn'],
            header: req['type'] + '_' + e["fieldname"],
            filters: f && !_.isEmpty(f.fieldvalue) ? { operation: f.formula, value: f.fieldvalue } : [],
            resourcetype: req['type']
          });
        }
      });
      if (mappedresources.length > 0) {
        mappedresources.map((e) => {
          req.resourcetype.push(e.resourcetype['resourcetype']);
          if (e.attributes.length > 0) {
            e.attributes.map((a) => {
              let f = _.find(e.selectedFilters, function (i) { return i.fieldkey == a.fieldkey });
              selectedFields.push({
                fieldname: a["fieldname"],
                fieldkey: a["fieldkey"],
                fieldtype: a['fieldtype'],
                crn: a['crn'],
                header: e.resourcetype['resourcetype'] + '_' + a["fieldname"],
                filters: f && !_.isEmpty(f.fieldvalue) ? { operation: f.formula, value: f.fieldvalue } : [],
                resourcetype: e.resourcetype['resourcetype']
              });
            })
          }
        })
      }
      req['fields'] = selectedFields;
      if (this.reportForm.get('charttype').value) {
        req["charttype"] = this.reportForm.get('charttype').value;
      }
      if (!_.isEmpty(this.settings)) {
        req["settings"] = this.settings;
      }
      if (this.reportForm.get('groupby').value) {
        req["groupby"] = this.reportForm.get('groupby').value;
      }

      this.assetRecordService.getCMDBQueryReport(req).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          // this.reportHdr = _.filter(AppConstant.TABLE_HEADERS.cmdb, function (i) { return i.show == true });
          let header = [];
          header.push({
            field: 'x',
            header: this.settings.xaxis.fieldname,
            datatype: "string",
            show: true,
            fieldname: this.settings.xaxis.fieldname,
            fieldtype: this.settings.xaxis.fieldtype,
            fieldkey: this.settings.xaxis.fieldkey
          });
          this.reportData = response.rows;
          let series = [];

          this.settings.yaxisList.map((y, i) => {
            series.push({
              name: y.seriesname,
              data: _.map(this.reportData, function (e) { return { x: e.x, y: e[`y${i}`] } })
            });
            header.push({
              field: `y${i}`,
              header: y.aggregate + `(${y.yaxis.fieldname})`,
              datatype: "string",
              show: true,
              fieldname: y.yaxis.fieldname,
              fieldtype: y.yaxis.fieldtype,
              fieldkey: y.yaxis.fieldkey
            },
              {
                field: `y${i}value`,
                header: y.yaxis.fieldname,
                fieldname: y.yaxis.fieldname,
                datatype: "string",
                show: true,
                fieldtype: y.yaxis.fieldtype,
                fieldkey: y.yaxis.fieldkey
              },
            )
          });
          console.log('report header', header);
          this.reportHdr = header;
          this.drawChart(
            series,
            this.reportForm.get('charttype').value,
            this.settings.xaxisname,
            '',
            true
          );
          // this.prepareChartData(this.reportData)
        } else {
          this.getChartSeries(
            AppConstant.KPI_REPORING.CMDB_SAVEDQUERY,
            []
          );
        }
      });
    }

  }

  initChart() {
    var options = {
      series: [],
      chart: {
        height: 350,
        type: 'bar',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      xaxis: {
        categories: [],
      }
    };
    this.chart = new ApexChart(document.querySelector("#report-chart"), options)
    this.chart.render();
  }

  drawChart(series, charttype, xlabel?, ylabel?, destroy?, feature?) {
    const el = document.querySelector("#report-chart");
    if(!el){
      return;
    }
    if (this.chart && destroy) {
      this.chart.destroy();
    }
    var options = {} as any;
    if (this.reportForm.get('charttype').value != "rangeBar") {
      let xaxiscount = 660;
      series.map((o) => {
        xaxiscount = xaxiscount + o.data.length;
      });
      this.cardstyle = `{'height': ${xaxiscount}px}`;
      options = {
        series: series,
        chart: {
          type: this.reportForm.get('charttype').value == 'stackedbar' ? 'bar' : this.reportForm.get('charttype').value,
          stacked: (this.reportForm.get('charttype').value == 'stackedbar') ? true : false,
          height: 380,
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
          type: "category",
          labels: {
            // rotateAlways: true,
            hideOverlappingLabels: false,
            maxHeight: 180,
            trim: true,
            style: {
              colors: "#ffffff",
            },
          },
          title: {
            text: xlabel,
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
            text: ylabel,
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
          fixed: {
            enabled: true,
            position: "bottomLeft",
            offsetX: 0,
            offsetY: 0,
          },
          y: {
            formatter: function (val) {
              console.log(val);
              return val
            }
          },
          x: {
            formatter: function (val) {
              console.log(val);
              return val
            }
          }
        },
        // grid: {
        //   row: {
        //     colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        //     opacity: 0.5,
        //   },
        // },
        legend: {
          showForSingleSeries: true,
          showForNullSeries: false,
          position: "bottom",
          labels: {
            colors: "#f5f5f5",
          },
          formatter: function (seriesName, opts) {
            return [
              seriesName,
              " - ",
              _.sum(opts.w.globals.series[opts.seriesIndex]),
            ];
          },
        },
      };
      if (feature) {
        options['xaxis']['type'] = 'datetime';
        options['xaxis']['labels']['datetimeUTC'] = false;
        options['tooltip']['x'] = { format: 'dd-MMM-yyyy hh:mm:ss' };
        options['tooltip']['y']['formatter'] = function (val) {
          return val + ' ms'
        };
        options['legend']['formatter'] = function (seriesName, opts) {
          return seriesName;
        }
      }
      // console.log('count', series)
      // if (series.length > 0 && this.selectedfeature == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY) {
      //   options.noData = {
      //     text: "Loading...",
      //     align: 'center',
      //     verticalAlign: 'middle',
      //     offsetX: 0,
      //     offsetY: 0,
      //     style: {
      //       color: "#ffcc00",
      //       fontSize: '14px',
      //       fontFamily: "Helvetica"
      //     }
      //   };
      // }

    } else {
      let xaxiscount = 1200;
      series.map((o) => {
        xaxiscount = xaxiscount + o.data.length;
      });
      this.cardstyle = `{'height': ${xaxiscount}px}`;
      options = {
        style: `{'height': ${xaxiscount}px}`,
        series: series,
        chart: {
          height: xaxiscount,
          type: "rangeBar",
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: "50%",
            rangeBarGroupRows: true,
          },
        },
        title: {
          text: '',
          align: "left",
        },
        colors: [
          "#008FFB",
          "#00E396",
          "#FEB019",
          "#FF4560",
          "#775DD0",
          "#3F51B5",
          "#546E7A",
          "#D4526E",
          "#8D5B4C",
          "#F86624",
          "#D7263D",
          "#1B998B",
          "#2E294E",
          "#F46036",
          "#E2C044",
        ],
        fill: {
          type: "solid",
        },
        xaxis: {
          type: "datetime",
          labels: {
            style: {
              colors: "#f5f5f5",
              cssClass: "apexcharts-xaxis-label",
            },
          }
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
          position: "bottom",
          labels: {
            colors: "#f5f5f5",
          },
        },
        tooltip: {
          theme: "dark",
          custom: function (opts) {
            const fromYear = new Date(opts.y1).toISOString();
            const toYear = new Date(opts.y2).toISOString();
            var data = opts.w.globals.initialSeries[opts.seriesIndex];
            return (
              '<div class="apexcharts-tooltip-rangebar">' +
              '<div>' +
              data['data'][opts.dataPointIndex].x +
              "</div>" +
              '<div> <span class="category">' +
              (data.name ? data.name : "") +
              ' </span> <span class="value start-value">' +
              fromYear +
              '</span> <span class="separator">-</span> <span class="value end-value">' +
              toYear +
              "</span></div>" +
              "</div>"
            )
          }
        },
      };
    }
    this.chart = new ApexChart(el, options);
    this.chart.render();
  }

  prepareChartData(series, type?, xlabel?, ylabel?) {
    let obj = {};
    if (type != "rangeBar") {
      obj = {
        series: series,
        chart: {
          type: type ? type : this.chartType,
          height: 380,
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
          type: "category",
          labels: {
            rotateAlways: true,
            hideOverlappingLabels: true,
            trim: true,
            style: {
              colors: "#ffffff",
            },
          },
          title: {
            text: xlabel,
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
            text: ylabel,
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
              seriesName,
              " - ",
              _.sum(opts.w.globals.series[opts.seriesIndex]),
            ];
          },
        },
      };
    }
    if (type == "rangeBar") {
      let xaxiscount = 1200;
      series.map((o) => {
        xaxiscount = xaxiscount + o.data.length;
      });
      obj = {
        style: `{'height': ${xaxiscount}px}`,
        series: series,
        chart: {
          height: xaxiscount,
          type: "rangeBar",
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: "50%",
            rangeBarGroupRows: true,
          },
        },
        title: {
          text: '',
          align: "left",
        },
        colors: [
          "#008FFB",
          "#00E396",
          "#FEB019",
          "#FF4560",
          "#775DD0",
          "#3F51B5",
          "#546E7A",
          "#D4526E",
          "#8D5B4C",
          "#F86624",
          "#D7263D",
          "#1B998B",
          "#2E294E",
          "#F46036",
          "#E2C044",
        ],
        fill: {
          type: "solid",
        },
        xaxis: {
          type: "datetime",
          labels: {
            style: {
              colors: "#f5f5f5",
              cssClass: "apexcharts-xaxis-label",
            },
          }
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
          position: "bottom",
          labels: {
            colors: "#f5f5f5",
          },
        },
        tooltip: {
          theme: "dark",
          custom: function (opts) {
            const fromYear = new Date(opts.y1).toISOString();
            const toYear = new Date(opts.y2).toISOString();
            var data = opts.w.globals.initialSeries[opts.seriesIndex];
            return (
              '<div class="apexcharts-tooltip-rangebar">' +
              '<div>' +
              data['data'][opts.dataPointIndex].x +
              "</div>" +
              '<div> <span class="category">' +
              (data.name ? data.name : "") +
              ' </span> <span class="value start-value">' +
              fromYear +
              '</span> <span class="separator">-</span> <span class="value end-value">' +
              toYear +
              "</span></div>" +
              "</div>"
            )
          }
        },
      };
    }
    return obj;
  }

  getChartSeries(title, data) {
    let series = [
      {
        name: title,
        data: [],
      },
    ];
    if (data && data.length > 0) {
      if (
        this.reportForm.get('groupby').value != null &&
        this.reportForm.get('groupby').value != ""
      ) {
        series = [];
        let key = this.reportForm.get('groupby').value;
        if (this.reportForm.get('groupby').value == "customerid")
          key = "customername";
        if (this.reportForm.get('groupby').value == "_customer")
          key = "customername";
        if (this.reportForm.get('groupby').value == "tagid") key = "tagname";
        let groupedItems = _.groupBy(data, key);
        let self = this;
        _.map(groupedItems, function (value, key) {
          if (self.reportForm.get('groupby').value == "publishyn") {
            if (key == "Y") key = "Published";
            if (key == "N") key = "Not Published";
          }
          if (self.reportForm.get('groupby').value == "readonly") {
            if (key == "1") key = "Readonly";
            if (key == "0") key = "Not Readonly";
          }
          if (self.reportForm.get('groupby').value == "level") {
            const selectedlevel = _.find(AppConstant.ALERT_LEVELS.LEVELS, {
              value: Number(key),
            });
            key = selectedlevel != undefined ? selectedlevel["title"] : "";
          }
          if (self.selectedfeature.value == AppConstant.KPI_REPORING.TAGS && self.reportForm.get('groupby').value == "resourcetype") {
            let awsassetname = _.find(AppConstant.ASSETTYPES.AWS, { value: key });
            let vmwareasset = _.find(AppConstant.ASSETTYPES.VMWARE, { value: key });
            if (awsassetname != undefined) {
              key = awsassetname.title
            }
            if (vmwareasset != undefined) {
              key = vmwareasset.title
            }
          }
          if (self.reportForm.get('groupby').value == "crn") {
            _.map(value, function (e: any) {
              let resource = _.find(self.resourceTypes, { crn: e.crn });
              if (resource) {
                key = resource.resource;
              }
            });
          }
          if (key == '') { key = 'Unassigned' };
          if (self.reportForm.get('groupby').value == "cloudprovider") {
            if (key == 'null') {
              key = 'No accounts';
            }
          }
          series.push({
            name: key,
            data: self.dateArrayFormat(
              self.reportForm.get('reportdate').value[0],
              self.reportForm.get('reportdate').value[1],
              value,
              title
            ),
          });
        });
      } else {
        if (title == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY) {
          series = [
            {
              name: title,
              data: data,
            },
          ];
        } else {
          series = [
            {
              name: title,
              data: this.dateArrayFormat(
                this.reportForm.get('reportdate').value[0],
                this.reportForm.get('reportdate').value[1],
                data,
                title
              ),
            },
          ];
        }

      }
    }


    if (title == AppConstant.KPI_REPORING.CMDB) {
      let array = [
        {
          name: "CMDB",
          data: [],
        },
      ] as any;
      if (this.reportForm.get('charttype').value != "rangeBar") {
        let details = [];
        if (
          this.settings &&
          this.settings.yaxisList
        ) {
          let resData = data;
          this.settings.yaxisList.map((e, i) => {
            let obj = {
              name: e.seriesname,
              data: [],
            };
            resData.map((o) => {
              obj.data.push({
                x: o.x,
                y: o[`y${i}`],
              });
            });
            details.push(obj);
          });
        }
        array = details;
        this.drawChart(
          array,
          this.reportForm.get('charttype').value,
          this.settings.xaxis
            ? this.settings.xaxis.fieldname
            : "",
          '',
          true
        );
      } else {
        let label1 = data.map((e) => {
          return e.label1;
        });
        let label2 = data.map((e) => {
          return e.label2;
        });

        let tasks = label1.concat(label2);
        tasks = _.uniq(tasks);
        let dataArr = tasks.map((e) => {
          return {
            name: e,
            data: [],
          };
        });

        let groupedProjects = _.groupBy(data, "x");

        _.map(groupedProjects, function (value, key) {
          let i = 0;
          value.map((e) => {
            let existlabel1 = _.findIndex(dataArr, { name: e.label1 });
            if (existlabel1 != -1) {
              if (value.length > 1 && i > 0) {
                let valIndex = i - 1;
                if (value[valIndex]["y1"] != null && e.y0 != null) {
                  dataArr[existlabel1].data.push({
                    x: key,
                    y: [
                      new Date(value[valIndex]["y1"]).getTime(),
                      new Date(e.y0).getTime(),
                    ],
                  });
                }
              } else {
                if (e.y0 != null) {
                  dataArr[existlabel1].data.push({
                    x: key,
                    y: [new Date(e.y0).getTime(), new Date(e.y0).getTime()],
                  });
                }
              }
            }

            let existlabel2 = _.findIndex(dataArr, { name: e.label2 });
            if (existlabel2 != -1) {
              if (e.y0 != null && e.y1 != null) {
                dataArr[existlabel2].data.push({
                  x: key,
                  y: [new Date(e.y0).getTime(), new Date(e.y1).getTime()],
                });
              }
            }
            i++;
          });
        });

        this.drawChart(dataArr, this.reportForm.get('charttype').value, '',
          '',
          true)
      }
    } else {
      this.drawChart(
        series,
        this.reportForm.get('charttype').value,
        '',
        '',
        true
      );
    }
  }

  dateArrayFormat(startdate, enddate, data, flag?) {
    let result = [];
    let duration = this.reportForm.get('duration').value;

    if (duration == "Daily") {
      let startdt = startdate;
      let enddt = enddate;
      let differnce = moment(enddt).diff(moment(startdt), "days");
      var i = 0;
      let baseval = startdt.getTime();
      while (i <= differnce) {
        var y = 0;
        this.xaxis[i] = baseval;
        result[i] = { x: moment(baseval).format("DD-MMM-YYYY"), y: y };
        _.map(data, (itm) => {
          if (moment(baseval).format("DD-MMMM-YYYY") == itm.x) {
            result[i] = {
              x: moment(this.xaxis[i]).format("DD-MMM-YYYY"),
              y: itm.y,
            };
          }
        });
        baseval += 86400000;
        i++;
      }
      return result;
    } else {
      let details = this.reportData;
      let xaxis = _.map(details, function (itm) {
        return itm.x;
      });
      xaxis = _.uniq(xaxis);
      for (let i = 0; i < xaxis.length; i++) {
        let y = _.find(data, function (el) {
          return el.x == xaxis[i] ? el.y : 0;
        });
        result.push({
          x: xaxis[i],
          y: y ? y.y : 0,
        });
      }
      return result;
    }
  }

  applySettings(event) {
    this.settings = event.settings;
    this.reportForm.get('charttype').setValue(event.charttype);
    this.reportForm.get('groupby').setValue(event.settings.groupby);
    this.opensettingmenu = false;
    this.initiateReports();
  }

  applyFilters(e) {
    this.filterby = e;
    if(!AppConstant.KPI_REPORING.SYNTHETICS){
      this.initiateReports();
    }
  }

  SaveReport() {
    if (
      this.reportname == "" ||
      this.reportname == null || this.reportname == undefined
    ) {
      this.message.error("Please enter the report title");
      return false;
    }
    let errorMessage: any;
    if (this.reportForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.reportForm,
        this.reportErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }

    let formdata = {
      tenantid: this.userstoragedata.tenantid,
      title: this.reportname,
      description: this.reportdesc,
      status: AppConstant.STATUS.ACTIVE,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };

    if (this.selectedfeature.value == AppConstant.KPI_REPORING.CMDB) {
      this.filterby['crn'] = [this.reportForm.get('resourcetype').value];
    }
    let configdetailobj = {
      reporttype: this.selectedfeature.value,
      seriesname: this.reportForm.value.seriesname,
      startdate: moment(this.reportForm.get('reportdate').value[0]).format("YYYY-MM-DD"),
      enddate: moment(this.reportForm.get('reportdate').value[1]).format("YYYY-MM-DD"),
      duration: this.reportForm.value.duration,
      groupby: this.reportForm.value.groupby,
      filterby: JSON.stringify(this.filterby),
      charttype: this.reportForm.value.charttype,
      settings: JSON.stringify(this.settings),
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    if (this.selectedfeature.value == AppConstant.KPI_REPORING.CMDB_SAVEDQUERY) {
      configdetailobj['savedqueryid'] = (this.reportForm.get('query').value).id;
    }
    if (this._confighdrid != null) {
      if (this.reportForm.value.id != null)
        configdetailobj["id"] = this._confighdrid;
      configdetailobj["_confighdrid"] = Number(this._confighdrid);
    }
    formdata["configdetail"] = [configdetailobj];
    if (this._confighdrid != null) {
      formdata["id"] = Number(this._confighdrid);
      formdata["lastupdateddt"] = new Date();
      formdata["lastupdatedby"] = this.userstoragedata.fullname;
      this.kpiReportingService.update(formdata).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getReportConfig();
          this.notifyChanges.next();
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      this.kpiReportingService.create(formdata).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this._confighdrid = response.data.id;
          this.addnew = false;
          // this.getReportConfig();
          this.router.navigate(["kpi/reporting/edit/" + response.data.id]);
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  AddnewReport() {
    this.addnew = true;
    this.initForm();
  }
  deleteReport() {
    this.kpiReportingService
      .updatedetails({
        id: this.reportForm.value.id,
        status: AppConstant.STATUS.DELETED,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getSeries();
          this.notifyChanges.next();
        } else {
          this.message.error(response.message);
        }
      });
  }
  downloadCSV() {
    let data: any = [];
    let csvheaders = _.map(this.reportHdr, function (o: any) { return o.header });
    let headers = _.map(this.reportHdr, function (o: any) { return o.field });
    _.map(this.reportData, function (value) {
      let obj = [];
      headers.map((o) => {
        if (value[o] != undefined) {
          obj.push(value[o])
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
    tempLink.setAttribute("download", `${this.selectedfeature.title}-${moment().format('DD-MMM-YYYY')}.csv`);
    tempLink.click();
  }
}
