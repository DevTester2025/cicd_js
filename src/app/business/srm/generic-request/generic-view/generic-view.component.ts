import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { SrmService } from "../../srm.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { CommentsService } from "../../../base/comments/comments.service";
import { WorkpackWorkflowService } from "../../../base/workflow/workflow.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";

@Component({
  selector: "app-generic-view",
  templateUrl:
    "../../../../presentation/web/srm/generic-request/generic-view/generic-view.component.html",
})
export class GenericViewComponent implements OnInit {
  // @Output() notfiyGenericEntry: EventEmitter<any> = new EventEmitter();
  subtenantLable = AppConstant.SUBTENANT;
  userstoragedata: any;
  srvrequestid: any;
  genericObj: any = {};
  loading = true;
  approver = false;
  isExecutionVisible = false;
  isReject: boolean = false;
  resourceId = "";
  id;
  comments: any = "";
  executor = false;
  finalApprover = false;
  inboxScreen = false;
  tabIndexNo = 0;
  approverChain = [];
  operationMode='';
  selectedWorkflow = {} as any;
  showWorkflow:boolean = false;
  constructor(
    private router: Router,
    private srmService: SrmService,
    private routes: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService,
    private commentsService: CommentsService,
    private workpackWorkflowService: WorkpackWorkflowService,
    private assetRecordService: AssetRecordService,
  ) {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.srvrequestid = params.id;
        this.getServiceDetails(this.srvrequestid);
      }
    });
    this.inboxScreen = this.router.url.includes("inbox");
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}
  getServiceDetails(id) {
    this.resourceId = `crn:ops:request/${id}`;
    this.srmService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.genericObj = response.data;
        this.genericObj.refid = this.genericObj.srvrequestid; 
        this.id = this.genericObj.srvrequestid;
        this.approverChain = this.genericObj.workflow.tnapprovers;
        if (this.approverChain) {
          let lastApprover = this.approverChain.length - 1;
          let lastBeforeApprover = this.approverChain.length - 2;
          this.approverChain.forEach((data, index) => {
            let addedIndex = index + 1;
            let subractedIndex = index - 1;
            if (this.approverChain.length > 1) {
              if (
                this.approverChain[lastApprover].approvalstatus ==
                  AppConstant.STATUS.PENDING &&
                this.approverChain[lastBeforeApprover].approvalstatus ==
                  AppConstant.STATUS.COMPLETED
              ) {
                this.finalApprover = true;
              }
            }
            if (data.userid == this.userstoragedata.userid) {
              if (data.approvalstatus == AppConstant.STATUS.PENDING) {
                if (
                  (this.approverChain.length == 2 &&
                    this.approverChain[0].approvalstatus ==
                      AppConstant.STATUS.COMPLETED) ||
                  this.approverChain[0].userid ==
                    this.userstoragedata.userid
                ) {
                  this.approver = true;
                }
                if (
                  this.approverChain.length > 2 &&
                  this.approverChain[0].approvalstatus ==
                    AppConstant.STATUS.COMPLETED
                ) {
                  if (
                    data.aprvrseqid == addedIndex &&
                    this.approverChain[subractedIndex].approvalstatus ==
                      AppConstant.STATUS.COMPLETED
                  ) {
                    this.approver = true;
                  }
                }
                if (this.approverChain.length == 1) {
                  this.approver = true;
                  this.finalApprover = true;
                }
              }
            }
          });
        }
      } else {
        this.loading = false;
        this.genericObj = {};
      }
    });
  }

  tabChanged(e) {
    this.tabIndexNo = e.index;
  }

  update(method){
    let reqObj: any = {
      srvrequestid: parseInt(this.srvrequestid),
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    }
    let query;
    if (method == AppConstant.HISTORY_KEYWORDS.Approve){
      if(this.finalApprover){
        reqObj.srstatus = AppConstant.STATUS.APPROVED;
        reqObj.progresspercent = 80;
        query = "approve=true"
      } else {
        const completedApprovers = this.approverChain.filter(approver => approver.approvalstatus === AppConstant.STATUS.COMPLETED).length;
        const totalApprovers = this.approverChain.length;
        const baseProgress = 20;
        reqObj.progresspercent = baseProgress + ((completedApprovers / totalApprovers) * (80 - baseProgress));
        reqObj.srstatus = AppConstant.STATUS.WIP;
        query="";
      }
    }
    if (method == AppConstant.HISTORY_KEYWORDS.Execute){
      reqObj.srstatus = AppConstant.STATUS.COMPLETED;
      reqObj.progresspercent = 100;
      query="";
    }
    if (method == AppConstant.HISTORY_KEYWORDS.Reject){
      reqObj.srstatus = AppConstant.STATUS.REJECTED;
      reqObj.progresspercent = 100;
      query="";
    }
    this.srmService.updateService(reqObj, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.messageService.success(response.message);
        this.close();
      } else {
        this.messageService.error(response.message);
      }
    })
  }
  close() {
    const url = this.routes.snapshot.queryParams.url;
    switch (url) {
      case "inbox":
        this.router.navigate(["srm/inbox"]);
        break;
      default:
        this.router.navigate(["srm"]);
    }
  }
  addComment() {
    let reqObj = {
      refid: parseInt(this.id),
      reftype: AppConstant.REFERENCETYPE,
      comments: this.comments,
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    } as any;
    this.commentsService.create(reqObj).subscribe((res) => {
      let response = JSON.parse(res._body);
      if (response.status) {
        this.comments = "";
      }
    });
  }

  addUpdateHistory(data, type) {
    let approvedContent;
    let approverName;
    let requestType;
    let assigneeName = this.genericObj.assignee.fullname;
    if (type == "Execution") {
      requestType = "Executed";
      approverName = assigneeName;
    }
    data.tnapprovers.forEach((requestApprover, index) => {
      if (type == "Approval") {
        if (requestApprover.userid == this.userstoragedata.userid) {
          requestType = "Approved";
          approverName = requestApprover.approvers.fullname;
        }
      }
      approvedContent = `Request is ${requestType} by ${approverName}`;
    });
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      type: 4,
      resourceid: this.resourceId,
      new: approvedContent,
      affectedattribute: type,
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    } as any;
    this.assetRecordService.createHistory(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
      } else {
        this.messageService.error(response.message);
      }
    });
  }

  requestRejection() {
    if (
      this.comments == "" ||
      this.comments == null ||
      this.comments == undefined
    ) {
      this.messageService.error("Please add comments to reject the approval");
    } else {
      this.isReject = true;
      this.update("Reject");
      this.approveRequest();
      this.addComment();
      this.isExecutionVisible = false;
    }
  }

  handleCancel() {
    this.isExecutionVisible = false;
  }

  executeRequest(){

  }

  rejectRequest(){
    this.isExecutionVisible = true;
  }

  approveRequest(){
    if (this.approver) {
      let reqObj: any = {};
      this.approverChain.forEach((data, index) => {
        if (data.userid == this.userstoragedata.userid) {
          reqObj.wrkflowaprvrid = data.wrkflowaprvrid;
        }
        reqObj.approvalstatus = AppConstant.STATUS.COMPLETED;
        reqObj.lastupdateddt = new Date();
        reqObj.lastupdatedby = this.userstoragedata.fullname;
      });
      if (this.isReject) {
        reqObj.approvalstatus = AppConstant.STATUS.REJECTED;
      }
      this.workpackWorkflowService
        .updateWorkflowApprvl(reqObj)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            if (!this.isReject) {
              this.update("Approve");
              this.addUpdateHistory(
                this.genericObj.workflow,
                AppConstant.REQUEST_HISTORY[0]
              );
            }
            this.router.navigate(["srm/inbox"]);
          } else {
            this.messageService.error(response.message);
          }
        });
    }
  }
  showWorkflowSummary() {
    this.showWorkflow = true;
    let workflowId = this.genericObj.workflow.wrkflowid;
    this.workpackWorkflowService.byId(workflowId).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status)
      this.selectedWorkflow = response.data;
      this.operationMode = "WKPACK_VIEW";
    })
  }
}
