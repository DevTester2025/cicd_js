import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "../ssm.service";

@Component({
  selector: "app-cloudmatiq-associationlog",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/statemanager/association-log.component.html",
  styles: [
    `
      #assetdetail td,
      #assetdetail th {
        border: 1px solid #dddddd30;
        padding: 8px;
        color: white;
      }

      #assetdetail th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        color: white;
      }
    `,
  ],
})
export class AssociationLogComponent implements OnInit {
  userstoragedata = {} as any;
  @Input() region;
  @Input() associationid;
  @Input() associationobj;
  @Input() accountid;
  loading = false;
  parameters = {} as any;
  associationExeList = [];
  associationDesc = [];
  targetsList = [];
  totalCount = null;
  tableHeader = [
    { field: "ExecutionId", header: "Execution id", datatype: "string" },
    {
      field: "AssociationVersion",
      header: "Association version",
      datatype: "string",
    },
    { field: "Status", header: "Status", datatype: "string" },
    { field: "DetailedStatus", header: "Detailed status", datatype: "string" },
    {
      field: "ResourceCountByStatus",
      header: "Resource status",
      datatype: "string",
    },
  ];
  tableConfig = {
    refresh: true,
    edit: false,
    delete: false,
    view: false,
    globalsearch: true,
    pagination: true,
    loading: false,
    pageSize: 10,
    title: "",
    tabledownload: false,
  };
  tabIndex = 0;
  constructor(
    private localStorageService: LocalStorageService,
    private ssmService: SSMService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.associationDesc = [
      {
        key: "Document Name",
        value: "-",
      },
      {
        key: "Association Name",
        value: "-",
      },
      {
        key: "Document Version",
        value: "-",
      },
      {
        key: "Association Version",
        value: "-",
      },
      {
        key: "Association Id",
        value: "-",
      },
      {
        key: "Status",
        value: "-",
      },
      {
        key: "Detailed Status",
        value: "-",
      },
      {
        key: "Max Errors",
        value: "-",
      },
      {
        key: "Max Concurrency",
        value: "-",
      },
      {
        key: "Schedule Offset",
        value: "-",
      },
      {
        key: "Apply only at cron interval",
        value: "-",
      },
    ];
  }
  ngOnChanges(changes: SimpleChanges) {
    this.tabIndex = 0;
    this.loading = true;
    this.tabChanged({ index: 0 });
  }
  tabChanged(event) {
    this.tabIndex = event.index;
    if (event.index == 0) {
      this.getAssDesc();
    }
    if (event.index == 1) {
      this.getAssExeList();
    }
  }
  getAssExeList() {
    this.tableConfig.loading = true;
    let condition = {
      region: this.region,
      associationid: this.associationobj.AssociationId,
      tenantid: this.userstoragedata.tenantid,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.ssmService.getAssExeList(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      this.tableConfig.loading = false;
      if (response.status) {
        this.associationExeList = response.data;
        this.totalCount = this.associationExeList.length;
      }
    });
  }
  getAssDesc() {
    this.loading = true;
    let condition = {
      region: this.region,
      associationid: this.associationobj.AssociationId,
      tenantid: this.userstoragedata.tenantid,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.ssmService.getAssDesc(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.parameters = response.data.Parameters;
        this.associationDesc = [
          {
            key: "Document Name",
            value: response.data.Name,
          },
          {
            key: "Association Name",
            value: response.data.AssociationName,
          },
          {
            key: "Document Version",
            value: response.data.DocumentVersion,
          },
          {
            key: "Association Version",
            value: response.data.AssociationVersion,
          },
          {
            key: "Association Id",
            value: response.data.AssociationVersion,
          },
          {
            key: "Status",
            value: response.data.Overview.Status,
          },
          {
            key: "Detailed Status",
            value: response.data.Overview.DetailedStatus,
          },
          {
            key: "Max Errors",
            value: response.data.MaxErrors ? response.data.MaxErrors : "-",
          },
          {
            key: "Max Concurrency",
            value: response.data.MaxConcurrency
              ? response.data.MaxConcurrency
              : "-",
          },
          {
            key: "Schedule Offset",
            value: response.data.ScheduleOffset,
          },
          {
            key: "Apply only at cron interval",
            value: response.data.ApplyOnlyAtCronInterval,
          },
        ];
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }
  dataChanged(event) {
    if (event.refresh) {
      this.tabChanged({ index: this.tabIndex });
    }
  }
}
