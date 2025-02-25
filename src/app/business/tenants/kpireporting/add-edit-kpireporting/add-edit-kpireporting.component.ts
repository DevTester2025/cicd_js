import {
  ChartComponent
} from "ng-apexcharts";
import { AppConstant } from "src/app/app.constant";
import { AssetConstant } from "src/app/asset.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as moment from "moment";
import { IncidentService } from "../../customers/incidents.service";
import * as _ from "lodash";
import { KPIReportingService } from "../kpireporting.service";
import { EventLogService } from "../../../base/eventlog/eventlog.service";
import { NzMessageService } from "ng-zorro-antd";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import * as Papa from "papaparse";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-add-edit-kpireporting',
  templateUrl: '../../../../presentation/web/tenant/kpireporting/add-edit-kpireporting/add-edit-kpireporting.component.html',
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
export class AddEditKpireportingComponent implements OnInit {
  loading = false;
  reportname = '';
  reportdesc = '';
  isCollapsed = false;
  menuItems = [
    {
      title: 'User / User roles',
      value: 'USERS'
    },
    {
      title: 'Customers',
      value: 'CUSTOMERS'
    },
    {
      title: 'Data Management',
      value: 'DATAMANAGEMENT'
    },
    {
      title: 'Monitoring',
      value: 'MONITORING'
    },
    {
      title: 'Service Level Management',
      value: 'SLA'
    },
    {
      title: 'Tags',
      value: 'TAGS'
    },
    {
      title: 'Ticket Management',
      value: 'TICKETS'
    },
    {
      title: 'Asset Management',
      value: 'ASSET'
    },
    {
      title: 'CMDB',
      value: 'CMDB'
    },
    {
      title: 'CMDB - Saved Queries',
      value: 'CMDB_SAVEDQUERY'
    },
    {
      title: 'Synthetics',
      value: 'SYNTHETICS'
    },
    {
      title: 'SSL',
      value: 'SSL'
    }
  ];
  selectedfeature;
  _confighdrid;
  kpireportObj: any = {};
  ticketgroupAndFilterByOptions = AssetConstant.KPI.TICKETSGROUPANDFILTERS;
  constructor(
    public router: Router,
    private routes: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private incidentService: IncidentService,
    private kpiReportingService: KPIReportingService,
    private eventLogService: EventLogService,
    private message: NzMessageService,
    private assetRecordService: AssetRecordService
  ) {
    this.selectedfeature = this.menuItems[0];
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this._confighdrid = params.id;
        this.getReportConfig();
      }
    });
  }

  ngOnInit() {
  }

  getReportConfig() {
    this.kpiReportingService.byId(this._confighdrid).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.kpireportObj = response.data;
        this.reportname = this.kpireportObj.title;
        this.reportdesc = this.kpireportObj.description;
        if (this.kpireportObj.configdetail && this.kpireportObj.configdetail.length > 0) {
          let self = this;
          let groupedReports = _.groupBy(this.kpireportObj.configdetail, 'reporttype');
          _.map(groupedReports, function (value, key) {
            console.log(key)
            let feature = _.findIndex(self.menuItems, { value: key });
            if (feature != -1) {
              self.menuItems[feature]['totalreports'] = value.length;
            }
          });
          console.log(this.menuItems);
        }
      } else {
        this.kpireportObj = {};
        this.message.error(response.message);
      }
    });
  }

  saveConfig() {

  }
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  close() {
    this.router.navigate(["kpi/reporting"]);
  }

  onClickFeature(e) {
    this.selectedfeature = e;
  }

  notifyChanges(e) {
    console.log('Notify')
    this.getReportConfig();
  }

}
