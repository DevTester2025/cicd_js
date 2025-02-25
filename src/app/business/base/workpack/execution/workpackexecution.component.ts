import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { WorkflowAddEditComponent } from 'src/app/business/base/workflow/workflow-add-edit/workflowAddEdit.component';
import { IworkflowDetails } from "src/app/monitoring/interfaces";
import { WorkpackWorkflowService } from "src/app/business/base/workflow/workflow.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { WorkpackService } from 'src/app/business/base/workpack/workpack.service';
import { UsersService } from "src/app/business/admin/users/users.service";
import { Router, ActivatedRoute } from '@angular/router';
import downloadService from "src/app//modules/services/shared/download.service";
import * as moment from "moment";
import { Buffer } from "buffer";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { NzMessageService } from "ng-zorro-antd";
@Component({
  selector: "app-workflowexecution",
  templateUrl: "./workpackexecution.component.html",
  styleUrls: ["./workpackexecution.component.css"],
})
export class WorkflowExecutionComponent implements OnInit {
  visibleadd = true;
  screens: any[] = [];
  appScreens = {} as any;
  isAddpermission = false;
  isEditpermission = false;
  isDeletepermission = false;
  taskResource = "crn:ops:hotfix_script_task/1674158326575";
  isVisible = false;
  buttonText = "Add Work Flow";
  userstoragedata: any = {};
  loading: boolean = false;
  showSidebar = false;
  formTitle = "Workflow";
  workflowList: any[] = [];
  addNew = false;
  globalLogHeader = [
    { field: "wrkflowname", header: "Name", datatype: "string" },
    { field: "status", header: "Staius", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    { field: "lastupdateddt", header: "Updated On", datatype: "timestamp", format: "dd-MMM-yyyy", isdefault: true },
  ];
  tableConfig = {
    view: true,
    download: true,
    // edit: true,
    delete: false,
    columnselection: true,
    apisort: true,
    globalsearch: true,
    manualsearch: true,
    count: 0,
    loading: false,
    pagination: true,
    refresh: true,
    pageSize: 10,
    title: "",
    widthConfig: ["30%", "20%", "25%", "25%"],
  } as any;
  workflowDetails: IworkflowDetails;
  filters = { asset: null } as any;
  selectedcolumns = [] as any;
  totalCount;
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
  // exeuction 
  executionHeader = [
    { field: "resource_title", header: "Title", datatype: "string", isdefault: true },
    { field: "fromuser", header: "Installer/Executor", datatype: "string", isdefault: true },
    { field: "tousers", header: "Reviewer(s)", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    { field: "lastupdateddt", header: "Updated On", datatype: "timestamp", format: "dd-MMM-yyyy", isdefault: true },
  ];
  raw_executionList: any[] = [];
  executionList: any[] = [];
  usersList: any[] = [];
  selectedWorkflowTask = "";
  resoruceTitle = "";
  isWorkflowVisible: boolean = false;
  selectedRowData;
  download_loading: boolean = false;
  cmdb_operationtype = AppConstant.CMDB_OPERATIONTYPE;
  searchText: string = "";
  constructor(private workpackWorkflowService: WorkpackWorkflowService, private localStorageService: LocalStorageService,
    private workpackService: WorkpackService, private userService: UsersService, private router: Router,
    private assetRecordService: AssetRecordService, private message: NzMessageService,) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    let workpackexecutionscreen: any = AppConstant.SCREENCODES.WORKPACKEXECUTION;
    this.appScreens = _.find(this.screens, {
      screencode: workpackexecutionscreen
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.isAddpermission = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.isEditpermission = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.isDeletepermission = true;
      this.tableConfig.delete = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }
  ngOnInit() {
    this.getUserList();
    this.loadWorkflowList();
  }
  loadworkpackExecutionList() {
    this.tableConfig.loading = true;
    let req: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      // userid : this.userstoragedata.userid,
      module: this.cmdb_operationtype[5]
    };
    let query;
    query = `count=${true}`;
    if (!this.isAddpermission && !this.isAddpermission) {
      req.userid = this.userstoragedata.userid
    }
    if (this.searchText && this.searchText != null) {
      req["searchText"] = this.searchText;
    }
    this.workpackService.executionList(req, query).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.data) {
        this.raw_executionList = response.data.rows;
        let executionList: any[] = _.map(response.data.rows, (l) => {
          let fromuser = _.find(this.usersList, { userid: l.fromuserid });
          l.fromuser = fromuser ? fromuser.fullname : "";
          let touser = _.find(this.usersList, { userid: l.touserid });
          l.touser = touser ? touser.fullname : "";
          return l;
        });
        let groups = _.groupBy(executionList, (e) => {
          return e.resourceid;
        });
        let keys = Object.keys(groups);
        _.each(keys, (k) => {
          let tousers = '';
          _.each(groups[k], (g: any) => {
            tousers = tousers + g.touser + ",";
          })
          let formaatedObj = {
            resource_title: groups[k][0]["resource_title"],
            fromuser: groups[k][0]["resource_title"],
            tousers: tousers,
            resourceid: groups[k][0]["resourceid"],
            lastupdatedby: groups[k][0]["lastupdatedby"],
            lastupdateddt: groups[k][0]["lastupdateddt"],
          }
          this.executionList.push(formaatedObj);
        });
        this.executionList = [...this.executionList];
        if (this.searchText && this.searchText.trim() !== '') {
          this.executionList = this.executionList.filter((item) =>
            item.resource_title.toLowerCase().includes(this.searchText.toLowerCase())
          );
        }
        this.totalCount = this.executionList.length;
        this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
        this.tableConfig.loading = false;
      } else {
        this.executionList = [];
        this.totalCount = 0;
        this.tableConfig.loading = false;
      }
    });
  }
  getUserList() {
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          // this.usersList = response.data;
          this.usersList = _.map(response.data, (u) => {
            // u.userid = u.userid.toString();
            return u;
          })
        }
        this.loadworkpackExecutionList();
      });
  }
  loadWorkflowList() {
    this.loading = true;
    this.workpackWorkflowService
      .allWorkflow({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE
      })
      .subscribe((result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.workflowList = response.data;
        }
      });
  }
  showModal(): void {
    this.isVisible = true;
    this.formTitle = "Add Work Flow";
    this.addNew = true;
  }
  onChanged(event) {
    this.isVisible = false;
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = "Work Flow";
    this.loadWorkflowList();
  }
  rightbarWorkflowChanged(event) {
    this.selectedWorkflowTask = null;
    this.resoruceTitle = "";
    this.isWorkflowVisible = false;
    this.selectedRowData = null;
  }
  dataChangedExecution(event) {
    this.selectedRowData = event.data;
    if (event.view) {
      this.router.navigate(['workpackmanager/createtemplate'], { queryParams: { resource: this.selectedRowData.resourceid, srcfrom: "executionlist" } });
      return false;
      // this.selectedWorkflowTask = this.selectedRowData.resourceid;
      // this.resoruceTitle=this.selectedRowData.resource_title;
      // this.isWorkflowVisible=true;
    }
    if (event.download) {
      if (event.data) {
        this.downloadPdf(event.data);
      }

    }
    if (event.delete) {
      this.deleteRecord(event.data);
    }
    if (event.refresh) {
      this.searchText = '';
      this.loadworkpackExecutionList();
    }
    if (event.searchText != "") {
      this.searchText = event.searchText;
      if (event.search) {
        this.loadworkpackExecutionList();
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.loadworkpackExecutionList();
    }
  }
  downloadPdf(data) {
    // let formattedData:any={};
    this.tableConfig.loading = true;
    this.workpackService
      .download(
        {
          // formattedData : formattedData,
          resourceid: data.resourceid,
          // tasksFormattedData: tasksFormattedData,
          tenantid: this.userstoragedata.tenantid
        }
      )
      .subscribe((result) => {
        this.download_loading = false;
        if (result.status) {
          let filename = (data.resource_title ? data.resource_title : "workpack") + "_" + moment().format("DD-MM-YYYY") + ".pdf";
          let response = JSON.parse(result._body);
          if (response.data) {
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer, filename
            );
            this.tableConfig.loading = false;
          }
        }

      });
  }
  deleteRecord(data) {
    if (this.tableConfig.delete) {
      this.tableConfig.loading = true;
      this.assetRecordService
        .updateDetail({
          resourceid: data.resourceid,
          status: AppConstant.STATUS.DELETED,
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          this.tableConfig.loading = false;
          if (response.status) {
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
    }
  }
}
