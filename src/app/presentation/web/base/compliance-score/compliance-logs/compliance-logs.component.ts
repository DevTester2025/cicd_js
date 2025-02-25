import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { OrchestrationService } from "src/app/business/base/orchestration/orchestration.service";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-compliance-logs",
  templateUrl: "./compliance-logs.component.html",
  styleUrls: [],
})
export class ComplianceLogsComponent implements OnInit {
  @Input() modalData: any = {};
  ComplianceLogForm: FormGroup;
  userstoragedata = {} as any;
  screens: any = [];
  appScreens: any = [];
  logsList = [];
  isSideBarVisible = false;
  orchestrationList = [];
  order = ["lastupdateddt", "desc"];
  showOrchestrator = false;
  formTitle = '';
  tableConfig = {
    globalsearch: true,
    apisort: true,
    view: false,
    pagination: true,
    frontpagination: true,
    manualpagination: false,
    pageSize: 10,
    loading: false,
    accept: true,
    remediation: true,
  } as any;
  tableHeader = [
    {
      field: "timestamp",
      header: "Time",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "name",
      header: "Instance name",
      datatype: "string",
    },
    {
      field: "rule",
      header: "rule.pci_dss",
      datatype: "string",
    },
    {
      field: "description",
      header: "Description",
      datatype: "string",
      isDescription: true,
    },
    {
      field: "level",
      header: "Severity",
      datatype: "number",
    },
  ] as any;
  constructor(
    private localStorageService: LocalStorageService,
    private orchestrationService: OrchestrationService,
    private fb: FormBuilder,
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.COMPLIANCE_REPORT,
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modalData && changes.modalData.currentValue) {
      this.compilanceLogList();
    }
  }
  ngOnInit() {
    this.ComplianceLogForm = this.fb.group({
        orchestrator: [null],
        description: [null],
    });
    this.getOrchestrationList();
  }

  compilanceLogList() {
    if (this.modalData) {
      if (this.modalData.logs && this.modalData.logs.length > 0) {
        this.tableConfig.loading = true;
        setTimeout(() => {
          this.tableConfig.loading = false;
          this.logsList = this.modalData.logs;
        }, 1000);
      } else {
        this.logsList = [];
      }
    }
  }

  handleOk() {
    this.isSideBarVisible = false;
  }

  getOrchestrationList() {
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }

    let query = `count=${true}&order=${this.order ? this.order : ""}`;

    this.orchestrationService.all(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.orchestrationList = response.data.rows;
      } else {
        this.orchestrationList = [];
      }
    });
  }

  acceptAll() {
    this.formTitle = "Accept";
    this.isSideBarVisible = true;
    this.showOrchestrator = false;
  }
  remediationAll() {
    this.formTitle = "Remediation";
    this.isSideBarVisible = true;
    this.showOrchestrator = true;
  }
  dataChanged (event) {
    if (event.accept) {
        this.acceptAll()
    }
    if (event.remediation) {
       this.remediationAll()
    }
  }
}
