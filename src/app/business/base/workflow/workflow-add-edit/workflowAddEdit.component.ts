import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { WorkpackConstant } from "src/app/workpack.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { IworkflowDetails } from "src/app/monitoring/interfaces";
import { UsersService } from "src/app/business/admin/users/users.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { WorkpackWorkflowService } from "src/app/business/base/workflow/workflow.service";

@Component({
  selector: "app-workflow-add-edit",
  templateUrl: "./workflowAddEdit.component.html",
  styleUrls: ["./workflowAddEdit.component.css"],
})
export class WorkflowAddEditComponent implements OnInit {
  @Input() operationMode: any;
  @Input() operationRef: any;
  @Input() selectedTaskResourceID: any;
  @Input() addNew: boolean = false;
  @Input() selectMode: boolean = false;
  @Input() resoruceTitle: string = "";
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  @Output() notifyUpdateEntry: EventEmitter<any> = new EventEmitter();
  @Output() notifyWorkflowSelectionEntry: EventEmitter<any> =
    new EventEmitter();
  @Input() selectedWorkflow: any;
  @Input() workflow_config: any = {
    assignee_placeholder: "Assignee",
    tabltitle_info: "Info",
    tabltitle_associations: "Associations",
    tabltitle_comments: "Comments",
    tabltitle_document: "Documents",
    tabltitle_history: "History",
  };
  @Input() mode = "workflow-assign";
  @Input() isView: boolean = true;
  screens = [];
  appScreens = {} as any;
  isAddpermission = false;
  isEditpermission = false;
  isDeletepermission = false;
  taskMapped = false;
  showSidebar = false;
  formTitle = "Workflow";
  fromuser;
  isAssineeLogin = false;
  workflowList: any[] = [];
  workflowActionList: any[] = [];
  globalLogHeader = [
    { field: "workflowname", header: "Name", datatype: "string" },
    { field: "events", header: "Events", datatype: "string" },
    { field: "bytes", header: "Bytes", datatype: "string" },
  ];
  workflowDetails: IworkflowDetails;
  filters = { asset: null } as any;
  loading: boolean = false;
  workflowForm: FormGroup;
  statusList = ["Completed", "Rejected"];
  globalStatus = "";
  modules = AppConstant.WORKFLOW_MODULE;
  globalTitle = "";
  tableHeader = [
    {
      field: "aprvrseqid",
      header: "Level",
      datatype: "number",
      width: "20%",
    },
    {
      field: "user",
      header: "Approver",
      datatype: "string",
      width: "60%",
    },
    // {
    //   field: "completion_status",
    //   header: "Compl. Status",
    //   datatype: "string",
    //   width: "30%",
    // },
    // {
    //   field: "rejection_status",
    //   header: "Rej. Status",
    //   datatype: "string",
    //   width: "30%",
    // },
    // {
    //   field: "to_duedate",
    //   header: "Due on",
    //   datatype: "string",
    //   width: "20%",
    // },
    // {
    //   field: "lastupdatedby",
    //   header: "Updated By",
    //   datatype: "string",
    //   width: "8%",
    // },
    // {
    //   field: "lastupdateddt",
    //   header: "Updated On",
    //   datatype: "timestamp",
    //   format: "dd-MMM-yyyy hh:mm:ss",
    //   width: "12%",
    // },
    // { field: "status", header: "Status", datatype: "string" ,width: "11%"},
  ] as any;
  actiontableHeader = [
    {
      field: "approverlevel",
      header: "Level",
      datatype: "number",
      width: "5%",
    },
    {
      field: "touserid",
      header: "Approver",
      datatype: "string",
      width: "30%",
    },
    {
      field: "workflow_status",
      header: "Status",
      datatype: "string",
      width: "30%",
    },
    {
      field: "duedate",
      header: "Due",
      datatype: "string",
      width: "30%",
    },
    {
      field: "notes",
      header: "Note",
      datatype: "string",
      width: "35%",
    },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  usersList: any = [];
  userstoragedata: any = {};
  newDefaultWorkflow: any = {};
  newDefaultWorkflowApprv: any = {};
  assignee_duedate: any;
  saveloading: boolean = false;
  temptabIndex = 0;
  workflowresourceId;
  workflowresourceDetails: any;
  isExecutorLogin: boolean = false;
  isEdit = false;
  requestData = [];
  workflowApproverData = [];
  constructor(
    private userService: UsersService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private workpackWorkflowService: WorkpackWorkflowService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    let workflow_screencode: any = AppConstant.SCREENCODES.WORKFLOW;
    this.appScreens = _.find(this.screens, {
      screencode: workflow_screencode,
    });
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "Create")) {
        this.isAddpermission = true;
      }
      if (_.includes(this.appScreens.actions, "Edit")) {
        this.isEditpermission = true;
      }
      if (_.includes(this.appScreens.actions, "Delete")) {
        this.isDeletepermission = true;
      }
    }
  }
  ngOnInit() {
    this.getUserList();
    if (this.workflowDetails) this.workflowDetails.module = null;
    this.clearForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.operationMode) &&
      !_.isEmpty(changes.operationMode) &&
      !_.isNull(changes.operationMode)
    ) {
      if (this.operationMode == "WKPACK_MAPPING") {
        this.loadWorkflowList();
        if (this.operationRef) {
          this.loadworkflowActionList();
        }
      }
      if (this.operationMode == "WKPACK_EDIT" || this.operationMode == "WKPACK_VIEW") {
        this.loadWorkflowList();
      }
    }
    if (
      !_.isUndefined(changes.addNew) &&
      !_.isEmpty(changes.addNew) &&
      !_.isNull(changes.addNew)
    ) {
      if (this.addNew) this.loadNewWorkflow();
    }
  }
  loadworkflowActionList() {
    this.loading = true;
    this.workflowActionList = [];
    this.taskMapped = false;
    this.workpackWorkflowService
      .allWorkflowAction({
        resourceid: this.operationRef,
        status: "Active",
      })
      .subscribe((result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.workflowActionList = response.data;
          if (this.workflowActionList.length > 0) {
            this.workflowresourceId =
              this.workflowActionList[0].resourceid + "/wflow";
            let details = _.cloneDeep(this.workflowActionList[0]);
            details.crn = this.workflowActionList[0].resourceid.split("/")[0];
            details.resourceid = this.workflowresourceId;
            this.resoruceTitle = this.workflowActionList[0].resource_title;
            this.workflowresourceDetails = {
              details: [details],
            };
            this.taskMapped = true;
          }
          // this.formatWorkflowAction();
        } else {
        }
        if (this.selectedTaskResourceID) {
          this.workflowresourceId = this.selectedTaskResourceID + "/wflowtasks";
        }
      });
  }
  formatWorkflowAction() {
    // console.log(this.formatWorkflowAction);
    this.workflowActionList = _.map(this.workflowActionList, (a: any) => {
      a.isReviewerLogin = false;
      if (a.touserid == this.userstoragedata.userid) {
        a.isReviewerLogin = true;
      }
      if (a.fromuserid == this.userstoragedata.userid) {
        this.isExecutorLogin = true;
      }
      let user = _.find(this.usersList, (u: any) => {
        return u.userid == a.touserid;
      });
      if (user) {
        a.approver = user;
      }
      return a;
    });
    if (this.workflowActionList.length > 0) {
      this.fromuser = this.workflowActionList[0].fromuserid;
      this.globalStatus = this.workflowActionList[0].assignee_status;
      if (this.fromuser == this.userstoragedata.userid) {
        this.isAssineeLogin = true;
      }
    }
  }
  workflowActionStatusChanges(data) {}
  loadWorkflowList() {
    this.loading = true;
    this.workpackWorkflowService
      .allWorkflow({
        tenantid: this.userstoragedata.tenantid,
        status: "Active",
      })
      .subscribe((result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.workflowList = response.data.filter(item => item.module === "Workpack");
          if (this.operationMode == "WKPACK_EDIT" && this.selectedWorkflow) {
            this.isEdit = true;
            this.workflowChanges(this.selectedWorkflow);
          }
          if (this.operationMode == "WKPACK_VIEW" && this.selectedWorkflow) {
            this.workflowChanges(this.selectedWorkflow);
          }
        }
      });
  }
  clearForm() {
    this.workflowForm = this.fb.group({
      wrkflowname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      module: [null,Validators.required],
      tnapprovers: this.fb.array([]),
    });
    let workflowForm = this.workflowForm.get("tnapprovers") as FormArray;
    workflowForm.push(this.addWorkflowList());
  }
  addWorkflowList() {
    return this.fb.group({
      user: [null, Validators.required],
      aprvrseqid: [null, Validators.required],
      completion_status: ["Completed", Validators.required],
      rejection_status: ["Rejected", Validators.required],
      notes: [],
    });
  }
  loadNewWorkflow() {
    this.newDefaultWorkflowApprv = {
      userid: null,
      username: "",
      user: null,
      aprvrseqid: 1,
      completion_status: AppConstant.STATUS.COMPLETED,
      rejection_status: AppConstant.STATUS.REJECTED,
      notes: null,
      status: AppConstant.STATUS.ACTIVE,
      createdby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.newDefaultWorkflow = {
      wrkflowname: "",
      module: "",
      tenantid: this.userstoragedata.tenantid,
      tnapprovers: [this.newDefaultWorkflowApprv],
      status: AppConstant.STATUS.ACTIVE,
      createdby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };

    this.workflowDetails = _.cloneDeep(this.newDefaultWorkflow);
    if (this.workflowDetails) {
      _.map(this.workflowDetails.tnapprovers, (l: any) => {
        let user = _.find(this.usersList, (u: any) => {
          return u.userid == l.userid;
        });
        if (user) {
          l.user = user;
        }
      });
    }
  }
  onChanged(val) {
    this.showSidebar = val;
  }
  dataChanged(d) {}
  showAddForm() {}
  workflowChanges(data) {
    this.workflowresourceId = `crn:ops:workflow/${data.wrkflowid}`
    this.workflowDetails = data;
    this.workflowDetails.refid = data.wrkflowid;
    this.workflowDetails.reftype = AppConstant.REFERENCETYPE[2];
    let req = {
      wrkflowid: data.wrkflowid,
    };
    this.workpackWorkflowService.allWorkflowApprvl(req).subscribe((result) => {
      this.loading = false;
      let response = JSON.parse(result._body);
      if (response.status) {
        this.workflowDetails.tnapprovers = _.map(response.data, (d: any) => {
          d.to_duedate = new Date();
          return d;
        });
        // this.workflowDetails.tnapprovers = _.map(response.data,(a:any)=>{
        //   let user = _.find(this.usersList, (u: any) => {
        //     return u.userid == a.touserid;
        //   });
        //   if (user) {
        //     a.user = user;
        //   }
        //   return a;
        // })
      }
    });
    this.workpackWorkflowService.byId(data.wrkflowid).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status)
      this.requestData = response.data['RequestManagement'];
      this.workflowApproverData = response.data['tnapprovers'];
    })
  }
  approverChanges(rowData) {
    console.log(rowData);
    let user = _.find(this.usersList, (u: any) => {
      return u.userid == rowData.userid;
    });
    if (user) {
      rowData.user = user;
    }
  }
  changePosition(event) {
    console.log(event.dragIndex, event.dropIndex);
    if (this.workflowDetails) {
      setTimeout(() => {
        this.workflowDetails.tnapprovers = _.orderBy(
          this.workflowDetails.tnapprovers,
          ["ordernumber", "id", "asc"]
        );
      }, 100);
    }
  }
  getUserList() {
    this.loading = true;
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.usersList = response.data;
          if (this.operationMode == "WKPACK_MAPPING")
            this.formatWorkflowAction();
          this.loading = false;
        } else {
          this.usersList = [];
          this.loading = false;
        }
      });
  }
  addNewApprover() {
    let apprver = _.cloneDeep(this.newDefaultWorkflowApprv);
    apprver.aprvrseqid = this.workflowDetails.tnapprovers.length + 1;
    this.workflowDetails.tnapprovers.push(apprver);
  }
  removeApprover(idx) {
    this.workflowDetails.tnapprovers.splice(idx, 1);
    this.workflowDetails.tnapprovers.forEach((approver, index) => {
      approver.aprvrseqid = index + 1;
    });
  }
  Save() {
    if (this.addNew) {
      let valid = true;
      let error_msg = "";
      
      if(this.workflowDetails.module == ""){
        valid = false;
        error_msg = "Module can't be empty.";
      }
      if (this.workflowDetails.wrkflowname == "") {
        valid = false;
        error_msg = "Workflow Name can't be empty.";
      } else {
        let invalid_appr = _.find(this.workflowDetails.tnapprovers, (l) => {
          return (
            l.userid == null ||
            l.completion_status == "" ||
            l.rejection_status == ""
          );
        });
        if (invalid_appr) {
          valid = false;
          error_msg = "Invalid Approver,Completion or Rejection status.";
        }
      }
      if (!valid) {
        this.message.remove();
        this.message.error(error_msg);
        return false;
      } else {
        let req: any = _.cloneDeep(this.workflowDetails);
        // console.log("workflow",req);
        req.tnapprovers = _.map(req.tnapprovers, (d) => {
          delete d.user;
          delete d.username;
          return d;
        });
        this.saveloading = true;
        this.workpackWorkflowService.createWorkflow(req).subscribe((result) => {
          this.saveloading = false;
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
            this.notifyNewEntry.next(response.data);
          } else {
            // this.message.warning(response.error)
          }
        });
      }
    } else if (this.operationMode == "WKPACK_MAPPING") {
      let valid = true;
      let error_msg = "";
      if (
        this.fromuser == undefined ||
        this.fromuser == null ||
        this.fromuser == ""
      ) {
        valid = false;
        error_msg = "Please select an assignee.";
      }
      if (!this.selectedWorkflow && !this.taskMapped) {
        valid = false;
        error_msg = "Please select a workflow.";
      }
      if (!valid) {
        this.message.remove();
        this.message.error(error_msg);
        return false;
      } else {
        if (this.taskMapped) {
          let ownApprvr: any[] = _.filter(this.workflowActionList, (a: any) => {
            return a.touserid == this.userstoragedata.userid;
          });
          if (ownApprvr.length > 0) {
            for (let idx = 0; idx < ownApprvr.length; idx++) {
              const ow = ownApprvr[idx];
              let actiondata = {
                actionsid: ow.actionsid,
                fromuserid: ow.fromuserid,
                touserid: ow.touserid,
                resource_title: this.resoruceTitle,
                workflow_status: ow.workflow_status,
                assignee_status: this.globalStatus,
                duedate: ow.duedate,
                notes: ow.notes,
                tenantid: this.userstoragedata.tenantid,
                lastupdatedby: _.isEmpty(this.userstoragedata)
                  ? ""
                  : this.userstoragedata.fullname,
                lastupdateddt: new Date(),
              };
              this.saveloading = true;
              this.workpackWorkflowService
                .updateWorkflowAction(actiondata)
                .subscribe((result) => {
                  this.saveloading = false;
                  let response = JSON.parse(result._body);
                  if (response.status) {
                    this.message.success(response.message);
                  }
                  if (idx < ownApprvr.length) {
                    this.notifyNewEntry.next(response.data);
                  }
                });
            }
          }
        } else {
          let data: any = _.cloneDeep(this.workflowDetails);
          let reqbody: any = [];
          _.each(data.tnapprovers, (ap) => {
            let actiondata = {
              resourceid: this.operationRef,
              resource_title: this.resoruceTitle,
              actiontype: "workpack-approvel",
              fromuserid: this.fromuser,
              touserid: ap.userid,
              duedate: ap.duedate,
              to_duedate: ap.to_duedate,
              workflow_status: "Pending",
              assignee_status: this.globalStatus,
              approverlevel: ap.aprvrseqid,
              notes: ap.notes || "",
              tenantid: this.userstoragedata.tenantid,
              status: AppConstant.STATUS.ACTIVE,
              createdby: _.isEmpty(this.userstoragedata)
                ? ""
                : this.userstoragedata.fullname,
              createddt: new Date(),
              lastupdatedby: _.isEmpty(this.userstoragedata)
                ? ""
                : this.userstoragedata.fullname,
              lastupdateddt: new Date(),
            };
            reqbody.push(actiondata);
          });
          if (this.mode == "workflow-assign") {
            this.notifyWorkflowSelectionEntry.next(reqbody);
          } else {
            this.saveloading = true;
            this.workpackWorkflowService
              .bulkWorkflowAction(reqbody)
              .subscribe((result) => {
                this.saveloading = false;
                let response = JSON.parse(result._body);
                if (response.status) {
                  this.message.success(response.message);
                  this.notifyNewEntry.next(response.data);
                } else {
                  // this.message.warning(response.error)
                }
              });
          }
        }
      }
    } else if (this.operationMode == "WKPACK_EDIT" || this.operationMode == "WKPACK_VIEW") {
      let req: any = _.cloneDeep(this.workflowDetails);
      req.tnapprovers = _.map(req.tnapprovers, (d) => {
        delete d.user;
        delete d.username;
        return d;
      });
      this.saveloading = true;
      this.workpackWorkflowService.updateWorkflow(req).subscribe((result) => {
        this.saveloading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyNewEntry.next(response.data);
        } else {
          // this.message.warning(response.error)
        }
      });
    }
  }
  assigneeChanges(data) {}
  detachWorkflow() {
    let data: any[] = _.map(_.cloneDeep(this.workflowActionList), (l) => {
      l.lastupdatedby = _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname;
      l.duedate = new Date();
      l.lastupdateddt = new Date();
      l.status = "Deleted";
      return l;
    });
    let actiondata = this.workflowActionList;
    this.workpackWorkflowService
      .bulkupdateWorkflowAction(data)
      .subscribe((result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.operationMode = "WKPACK_MAPPING";
          this.loadWorkflowList();
          this.loadworkflowActionList();
          // this.notifyNewEntry.next(response.data);
        }
      });
  }
  tabChanged(event) {
    this.temptabIndex = event.index;
  }
}
