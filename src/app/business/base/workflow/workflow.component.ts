import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { WorkflowAddEditComponent } from "src/app/business/base/workflow/workflow-add-edit/workflowAddEdit.component";
import { IworkflowDetails } from "src/app/monitoring/interfaces";
import { WorkpackWorkflowService } from "src/app/business/base/workflow/workflow.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-workflow",
  templateUrl: "./workflow.component.html",
  styleUrls: ["./workflow.component.css"],
})
export class WorkflowManagertComponent implements OnInit {
  visibleadd = true;
  screens = [];
  appScreens = {} as any;
  isAddpermission = false;
  isEditpermission = false;
  isDeletepermission = false;
  taskResource = "crn:ops:hotfix_script_task/1674158326575";
  isVisible = false;
  buttonText = "Add";
  userstoragedata: any = {};
  loading: boolean = false;
  showSidebar = false;
  formTitle = "Workflow";
  workflowList: any[] = [];
  addNew=false;
  searchText = null;
  totalCount = 0;
  operationMode='';
  selectedWorkflow:null;
  currentModule: any = AppConstant.WORKFLOW_MODULE[0].value;
  module = AppConstant.WORKFLOW_MODULE;
  globalLogHeader = [
    { field: "wrkflowname", header: "Name", datatype: "string", isdefault: true },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
  ];
  tableConfig = {
    edit: true,
    delete: true,
    globalsearch: true,
    manualsearch: true,
    loading: false,
    columnselection: true,
    apisort: true,
    pagination: false,
    refresh: true, //#OP_B632
    pageSize: 10,
    title: "",
    widthConfig: ["30%", "20%", "25%", "25%"],
    tabledownload: false,
    manualpagination: true,
    frontpagination: false,
    count: 0,
  } as any;
  workflowDetails: IworkflowDetails;
  filters = { asset: null } as any;
  isdownload = false;
  selectedcolumns = [] as any;

  tableHeader = [
    {
      field: "aprvrseqid",
      header: "Approval Level",
      datatype: "number",
      width: "20%",
    },
    {
      field: "user",
      header: "Approver",
      datatype: "string",
      width: "20%",
    },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      width: "8%",
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "12%",
    },
    { field: "status", header: "Status", datatype: "string" },
  ] as any;
  constructor(
    private workpackWorkflowService: WorkpackWorkflowService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    let workflow_screen: any = AppConstant.SCREENCODES.WORKFLOW;
    this.appScreens = _.find(this.screens, {
      screencode: workflow_screen,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.isAddpermission = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.isEditpermission = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.isDeletepermission = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    if (this.globalLogHeader && this.globalLogHeader.length > 0) {
      this.selectedcolumns = this.globalLogHeader
    }

    this.selectedcolumns = [];
    this.selectedcolumns = this.globalLogHeader.filter((el) => {
      return el.isdefault == true;
    });
  }
  ngOnInit() {
    this.loadWorkflowList();
    // this.currentModule = AppConstant.WORKFLOW_MODULE[0].value
  }
  loadWorkflowList() {
    this.tableConfig.loading = true;
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      module: this.currentModule,
    };
    if (this.searchText != null) {
      reqObj["searchText"] = this.searchText;
    }
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      reqObj["headers"] = this.selectedcolumns;
    } else {
      query = `count=${true}`;
    }

    this.workpackWorkflowService
      .allWorkflow(reqObj, query)
      .subscribe((result) => {
        this.tableConfig.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          if (this.isdownload) {
            this.tableConfig.manualpagination = true;
            this.tableConfig.loading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(buffer, "Workflow.xlsx");
            this.isdownload = false;
          } else {
            this.workflowList = response.data.rows;
            this.totalCount = response.data.count;
            this.tableConfig.count =
              "Total Records" + ":" + " " + response.data.count;
          }
        } else {
          this.workflowList = [];
          this.totalCount = 0;
          this.tableConfig.count =
            "Total Records" + ":" + " " + this.totalCount;
        }
      });
  }

  handleDropdownClick(selectedModule: any) {
    this.loading = true;
    let query =`count=${true}`
    let reqobj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      module: selectedModule,
    }
    this.workpackWorkflowService
    .allWorkflow(reqobj,query)
    .subscribe((result) => {
      this.loading=false;
      let response = JSON.parse(result._body);
      if (response.status && response.data) {
        this.workflowList = response.data.rows
        this.totalCount = response.data.count
        this.tableConfig.count = "Total Records"+ ":"+ " "+ this.totalCount
      } else {
        this.workflowList = [];
        this.totalCount = 0;
        this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
      }
    });
  }

  showModal(): void {
    this.isVisible = true;
    this.formTitle = "Add Workflow";
    this.operationMode = null;
    this.selectedWorkflow = null;
    this.addNew = true;
  }
  onChanged(event) {
    this.isVisible = false;
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = "Workflow";
    this.loadWorkflowList();
  }
  dataChanged(event) {
    if (event.edit) {
      this.addNew = false;
      this.formTitle = "Edit Workflow";
      this.operationMode = "WKPACK_EDIT";
      this.selectedWorkflow = event.data;
      this.isVisible = true;
    }
    if (event.delete) {
      this.deleteWorkpack(event.data);
    }
    //#OP_B632
    if (event.refresh) {
      this.searchText = null;
      this.loadWorkflowList();
    }
    if (event.searchText != "" && event.search) {
      this.searchText = event.searchText;
      this.loadWorkflowList();
    }

    if (event.searchText == "") {
      this.searchText = null;
      this.loadWorkflowList();
    }
    if (event.download) {
      this.isdownload = true;
      this.loadWorkflowList();
    }

  }
  deleteWorkpack(data) {
    let req = {
      wrkflowid: data.wrkflowid,
      status: AppConstant.STATUS.DELETED,
    }
    this.workpackWorkflowService.updateWorkflow(req).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.loadWorkflowList();
      }
    });
  }
}
