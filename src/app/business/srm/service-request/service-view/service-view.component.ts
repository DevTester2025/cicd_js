import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { SrmService } from "../../srm.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { SolutionService } from "src/app/business/tenants/solutiontemplate/solution.service";
import { CommentsService } from "../../../base/comments/comments.service";
import { WorkpackWorkflowService } from "../../../base/workflow/workflow.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { NotificationSetupService } from "src/app/business/tenants/network setup/notificationsetup.service";


@Component({
  selector: "app-srm-service-view",
  templateUrl:
    "../../../../presentation/web/srm/service-request/service-view/service-view.component.html",
})
export class SRMServiceViewComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  userstoragedata = {} as any;
  serviceObj = {} as any;
  catalogObj = {} as any;
  requestid: any;
  previewTitle = "";
  previewVisible = false;
  previewImage: any="";
  loading = true;
  executor = false;
  catalogdownload = false;
  oladownload = false;
  archdownload = false;
  isApprover = false;
  isSolution: boolean = false;
  isOrchestration: boolean = false;
  isWorkpack: boolean = false;
  isCICD: boolean = false;
  isExecutionVisible = false;
  isReject: boolean = false;
  id;
  comments: any = "";
  finalApprover = false;
  srmactions: any;
  module = "Request";
  refid;
  notes = "";
  requestType: any;
  orchid: any;
  rolename: any;
  tabIndexNo = 0;
  approverData = {} as any;
  approverChain = [];
  editMode: boolean = false;
  resourceId = "";
  panelName = AppConstant.VALIDATIONS.DEPLOYMENT.NOTES;
  panels = [
    {
      active: false,
      disabled: false,
      name: AppConstant.VALIDATIONS.DEPLOYMENT.NOTES,
    },
  ];
  notesList = [];
  solutionObj: any = {};
  solutionData = {};
  watchList = [];
  selectedValue: any;
  constructor(
    private router: Router,
    private srmService: SrmService,
    private routes: ActivatedRoute,
    private solutionService: SolutionService,
    private commonService: CommonService,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private commentsService: CommentsService,
    private workpackWorkflowService: WorkpackWorkflowService,
    private assetRecordService: AssetRecordService,
    private notificationService:NotificationSetupService
  ) {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.requestid = params.id;
        this.getServiceDetails(this.requestid);
      }
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.rolename = this.userstoragedata.roles.rolename;
    this.editMode = this.router.url.includes("catalog/view");
  }

  ngOnInit() {
    this.getServiceActions(this.requestid);
    this.getNotificationList();
  }

  getServiceActions(id) {
    this.srmService
      .allSrmActions({ srvrequestid: Number(id) })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.notesList = response.data;
        } else {
          this.notesList = [];
        }
      });
  }

  tabChanged(e) {
    this.tabIndexNo = e.index;
  }

  onCollapse(event) {
    if (event) {
      this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.HIDE;
    } else {
      this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.NOTES;
    }
  }

  getServiceDetails(id) {
    this.resourceId = `crn:ops:request/${id}`;
    this.srmService.byId(id).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.serviceObj = response.data;
        this.catalogObj = response.data.catalog || "";
        this.serviceObj.refid = parseInt(id);
        let ntfcsetupIds =
        response.data.notificationwatchlistSRM &&
        response.data.notificationwatchlistSRM.length > 0
          ? response.data.notificationwatchlistSRM.map((e) => e.ntfcsetupid)
          : [];
        this.selectedValue = ntfcsetupIds;

        this.approverChain = this.serviceObj.workflow.tnapprovers;
          if (this.serviceObj.assignedto == this.userstoragedata.userid) {
            if (
              this.serviceObj.srstatus !== AppConstant.APPROVAL_STATUS[3].value
            ) {
              if (
                this.serviceObj.srstatus == AppConstant.APPROVAL_STATUS[1].value
              ) {
                this.approverChain.forEach((data) => {
                  if (data.approvalstatus == AppConstant.STATUS.COMPLETED) {
                    this.executor = true;
                  }
                });
              }
            }
          }
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
                  this.isApprover = true;
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
                    this.isApprover = true;
                  }
                }
                if (this.approverChain.length == 1) {
                  this.isApprover = true;
                  this.finalApprover = true;
                }
              }
            }
          });
        }
        if(this.catalogObj){
        this.requestType = this.catalogObj.referencetype;
        this.flagCheck(this.requestType);
        this.solutionObj = this.catalogObj.solution;
        this.srmactions = response.data.srmsractions;
        if (this.catalogObj.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[0]){
          // this.readyToDeploy();
          this.getSolutionDetailById(
            this.catalogObj.referenceid,
            // this.catalogObj.solution.cloudprovider
          );
        }
        if (this.catalogObj.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[1]){
          this.orchid = this.catalogObj.referenceid;
          this.refid = this.serviceObj.contactdata.refid;
        }
      }
        if (this.catalogObj.catalogimage) {
          this.catalogdownload =
            this.commonService.getFileType(this.catalogObj.catalogimage) ===
            true
              ? true
              : false;
        }
        if (this.catalogObj.catalogola) {
          this.oladownload =
            this.commonService.getFileType(this.catalogObj.catalogola) === true
              ? true
              : false;
        }
        if (
          this.catalogObj.archdiagram &&
          this.catalogObj.archdiagram.split(".").pop() === "pdf"
        ) {
          this.archdownload =
            this.commonService.getFileType(this.catalogObj.archdiagram) === true
              ? true
              : false;
        }
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }

  flagCheck(data){
    this.isSolution = false;
    this.isCICD= false;
    this.isWorkpack= false;
    this.isOrchestration= false;
    switch (data){
      case data = AppConstant.REQUEST_REFERENCE_TYPES[0]:
        this.isSolution = true;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[1]:
        this.orchid = this.catalogObj.referenceid;
        this.isOrchestration= true;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[2]:
        this.isWorkpack= true;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[3]:
        this.isCICD= true;
        break;
      default:
        break;
    }
  }

  onPreview(file, title) {
    this.previewTitle = title;
    this.previewVisible = true;
    this.previewImage = file;
  }
  close() {
    const url = this.routes.snapshot.queryParams.url;
    switch (url) {
      case "notification":
        this.router.navigate(["srm/notification"]);
        break;
      case "inbox":
        this.router.navigate(["srm/inbox"]);
        break;
      default:
        this.router.navigate(["srm/list"]);
    }
  }
  getSolutionDetailById(val) {
    console.log(
      "trying to get solution data::::::::::::::::::",
      val,
      // cloudprovider
    );
    // cloudprovider = "AWS";
    // if (cloudprovider == "AWS") {
      this.solutionService.byId(val).subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        console.log("solution data::::::::::::::::::");
        console.log(response.data);
        if (response.status) {
          this.solutionData = response.data;
        } else {
          this.messageService.error(response.message);
        }
      });
    // }
    // if (cloudprovider == "ECL2") {
      // this.solutionService.ecl2byId(val).subscribe((result) => {
      //   let response = {} as any;
      //   response = JSON.parse(result._body);
      //   console.log("solution data::::::::::::::::::");
      //   console.log(response.data);
      //   this.solutionData = response.data;
      // });
    // }
  }

  getProgressStatus(srstatus: string): string {
    if (srstatus === 'Rejected') {
      return 'exception';
    } else if (srstatus === 'Completed') {
      return 'success';
    } else {
      return 'normal';
    }
  }

  update(method){
    let reqObj: any = {
      srvrequestid: parseInt(this.requestid),
      requesttype: this.serviceObj.requesttype,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    }
    let query: string;
    if (method == "Approve"){
      if(this.finalApprover){
        reqObj.srstatus = AppConstant.STATUS.APPROVED;
        reqObj.progresspercent = 80;
        query = "approve=true";
      } else {
        const completedApprovers = this.approverChain.filter(approver => approver.approvalstatus === AppConstant.STATUS.COMPLETED).length;
        const totalApprovers = this.approverChain.length;
        const baseProgress = 30;
        reqObj.progresspercent = baseProgress + ((completedApprovers / totalApprovers) * (80 - baseProgress));
        reqObj.srstatus = AppConstant.STATUS.WIP;
        query = "";
      }
    }
    if (method == "Execute"){
      reqObj.progresspercent = 100;
      reqObj.srstatus = AppConstant.STATUS.COMPLETED;
      query = "";
    }
    if (method == "Reject"){
      reqObj.srstatus = AppConstant.STATUS.REJECTED;
      reqObj.progresspercent = 100;
      query = "";
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

  addComment() {
    let reqObj = {
      refid: this.serviceObj.srvrequestid,
      reftype: AppConstant.REFERENCETYPE[0],
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
    let assigneeName = this.serviceObj.assignee.fullname;
    if (type == AppConstant.REQUEST_HISTORY[1]) {
      requestType = AppConstant.REQUEST_HISTORY[3];
      approverName = assigneeName;
    }
    data.tnapprovers.forEach((requestApprover, index) => {
      if (type == AppConstant.REQUEST_HISTORY[0]) {
        if (requestApprover.userid == this.userstoragedata.userid) {
          requestType = AppConstant.REQUEST_HISTORY[2];
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
      this.approveRequest();
      this.addComment();
      this.update("Reject");
      this.isExecutionVisible = false;
    }
  }

  handleCancel() {
    this.isExecutionVisible = false;
  }

  rejectRequest(){
    this.isExecutionVisible = true;
  }

  approveRequest(){
    if (this.isApprover) {
      let reqObj: any = {};
      this.approverChain.forEach((data, index) => {
        let alteredIndex = index + 1;
        if (data.userid == this.userstoragedata.userid && data.aprvrseqid == alteredIndex) {
          reqObj.wrkflowaprvrid = data.wrkflowaprvrid;
          reqObj.aprvrseqid = data.aprvrseqid;
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
                this.serviceObj.workflow,
                AppConstant.REQUEST_HISTORY[0]
              );
            }
            // this.messageService.success(response.message);
            this.router.navigate(["srm/inbox"]);
          } else {
            this.messageService.error(response.message);
          }
        });
    }
  }

  // approve(notes) {
  //   let formData = {} as any;
  //   formData.srmsractions = [this.approverData];
  //   formData.srmsractions[0].notes = notes;
  //   formData.srmsractions[0].apprvstatus = "Approved";
  //   formData.srmsractions[0].lastupdateddt = new Date();
  //   formData.srmsractions[0].lastupdatedby = this.userstoragedata.fullname;
  //   if (this.catalogObj.noofapprovers > 0) {
  //     let dividendPercent = 80 / Number(this.catalogObj.noofapprovers);
  //     formData.progresspercent =
  //       this.serviceObj.progresspercent + dividendPercent;
  //     formData.srstatus = AppConstant.STATUS.WIP;
  //   }
  //   formData.srvrequestid = this.serviceObj.srvrequestid;
  //   formData.lastupdatedby = this.userstoragedata.fullname;
  //   formData.lastupdateddt = new Date();
  //   this.srmService.updateService(formData).subscribe((result) => {
  //     let response = {} as any;
  //     response = JSON.parse(result._body);
  //     if (response.status) {
  //       this.messageService.success(response.message);
  //       this.router.navigate(["/srm/inbox"]);
  //     } else {
  //       this.messageService.error(response.message);
  //     }
  //   });
  // }

  // readyToDeploy() {
  //   if (this.catalogObj.approvalyn == "Y") {
  //     this.approverData = _.find(this.serviceObj.srmsractions, {
  //       touserid: this.userstoragedata.userid,
  //     });
  //     if (
  //       this.approverData != undefined &&
  //       this.approverData.apprvstatus == AppConstant.STATUS.PENDING
  //     ) {
  //       // let approver = {} as any;
  //       // approver = _.find(this.catalogObj.srmcatalogaprvr, { userid: this.approverData.touserid });
  //       if (this.approverData.approverlevel != 1) {
  //         let prevapprover = {} as any;
  //         prevapprover = _.find(this.serviceObj.srmsractions, {
  //           approverlevel: Number(this.approverData.approverlevel - 1),
  //         });
  //         // let status: any = _.find(this.serviceObj.srmsractions, { touserid: prevapprover.userid });
  //         if (
  //           prevapprover != undefined &&
  //           prevapprover.apprvstatus == "Approved"
  //         ) {
  //           this.isApprover = true;
  //         }
  //       } else {
  //         this.isApprover = true;
  //       }
  //     }
  //   }
  // }

  // getNotificationList() {
  //   let reqObj = {
  //     tenantid: this.userstoragedata.tenantid,
  //     txntypes: AppConstant.REQUEST_TXNTYPE,
  //   };
  //   this.notificationService.all(reqObj).subscribe((res) => {
  //     const response = JSON.parse(res._body);
  //     if (response.status) {
  //       let filteredNotificationList = response.data;
  //       this.notificationList = filteredNotificationList.filter((data) => {
  //         return data.txnid == this.id;
  //       });
  //       let receiverNames = [];
  //       this.notificationList.forEach((notification) => {
  //         let matchedUsers = this.usersList.filter((user) => {
  //           return user.userid == notification.userid;
  //         });
  //         if (matchedUsers.length > 0) {
  //           matchedUsers.forEach((user) => {
  //             receiverNames.push(user.fullname);
  //           });
  //         }
  //       });
  //       this.receivername = receiverNames;
  //       this.notificationList.map((notification) => {
  //         if (notification.lastupdateddt !== null) {
  //           notification.lastupdateddt = moment(
  //             notification.lastupdateddt
  //           ).format(AppConstant.DATE_FORMAT);
  //         }
  //       });
  //     }
  //   });
  // }

  executeRequest(){
    this.update("Execute");
  }

  getNotificationList() {
    let obj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      module: AppConstant.REFERENCETYPE[4],
    } as any;
    this.notificationService.all(obj).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.watchList = response.data.map((item: any) => {
            return {
              label: item.module + "(" + item.event + ")",
              value: item.ntfcsetupid,
            };
          });
            this.selectedValue = this.watchList.map((e) => {
              return e.value;
            });
        } else {
          this.watchList = [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
