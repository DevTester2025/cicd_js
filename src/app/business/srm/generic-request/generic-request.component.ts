import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { AppConstant } from "../../../app.constant";
import { UsersService } from "src/app/business/admin/users/users.service";
import { SrmService } from "../srm.service";
import { AssetRecordService } from '../../base/assetrecords/assetrecords.service';
import { WorkpackWorkflowService } from "../../base/workflow/workflow.service";
import * as _ from "lodash";
@Component({
  selector: "app-generic-request",
  templateUrl:
    "../../../presentation/web/srm/generic-request/generic-request.component.html",
})
export class GenericRequestComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  genericReqForm: FormGroup;
  customersList = [];
  departmentList = [];
  projectList = [];
  statusList = [];
  usersList = [];
  resourceTypesList = [];
  workflowList = [];
  formdata: any = {};
  priority;
  srvrequestid: any;
  resourceId = "";
  userstoragedata: any;
  buttonText: any;
  genericReqObj: any = {};
  loading = true;
  tabIndexNo = 0;
  operationMode='';
  selectedWorkflow = {} as any;
  showWorkflow:boolean = false;
  genericErrObj = {
    subject: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.SUBJECT,
    // requestdescription:
    //   AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.DESCRIPTION,
    // departmentname:
    //   AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.DEPARTMENT,
    // custmorprjyn: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.ICP,
    priority: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.PRIORITY,
    reporter:  AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.REPORTER,
    wrkflowid: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.WORKFLOW,
    assignedto: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.ASSIGNEE,
    // customerid: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.CUSTOMER,
    irn: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.IRN,
    // startdate:
    //   AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.STARTDEPLOYDATE,
    // decommissionindate:
    //   AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.DECOMMISIONDATE,
  };
  constructor(
    private router: Router,
    private routes: ActivatedRoute,
    private fb: FormBuilder,
    private commonService: CommonService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private srmService: SrmService,
    private userService: UsersService,
    private assetRecordService: AssetRecordService, 
    private workpackWorkflowService: WorkpackWorkflowService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.genericReqForm = this.fb.group({
      subject: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      notes: [
        "",
        // Validators.compose([
        //   Validators.required,
        //   Validators.minLength(1),
        //   Validators.maxLength(1000),
        // ]),
      ],
      // budget: [null],
      priority: [Validators.required],
      environment: [null],
      reporter: [Validators.required],
      departmentname: [null],
      custmorprjyn: [null],
      assignedto: [null, Validators.required],
      customerid: [null],
      irn: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      // startdate: [null, Validators.required],
      // decommissionindate: [null, Validators.required],
      // autodeployyn: [null],
      wrkflowid: [null, Validators.required],
      sractionstatus: [null],
    });
    this.buttonText = AppConstant.VALIDATIONS.SAVE;
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.srvrequestid = params.id;
        this.genericReqForm.controls['assignedto'].disable();
        this.resourceId = `crn:ops:request/${params.id}`;
      }
    });
  }

  tabChanged(e) {
    this.tabIndexNo = e.index;
  }

  ngOnInit() {
    this.reset();
    this.getUsers();
    this.getCustomers();
    this.getLookupLists();
    this.getResourceType();
    this.getWorkflowApproverList();
    if (!_.isUndefined(this.srvrequestid) && !_.isEmpty(this.srvrequestid)) {
      this.getRequest(this.srvrequestid);
    }
    this.genericReqForm.controls['reporter'].setValue(this.userstoragedata.userid);
    this.genericReqForm.controls['priority'].setValue(AppConstant.SYSTEM[0].value);
    this.genericReqForm.controls['irn'].setValue((Math.floor(Math.random() * 9999999) + 1111111).toString());

  }
  reset() {
    this.genericReqForm.reset();
    // this.genericReqForm.controls["budget"].setValue("N");
    // this.genericReqForm.controls["autodeployyn"].setValue("N");
  }
  getCustomers() {
    this.loading = true;
    this.commonService
      .allCustomers({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          this.loading = false;
          if (response.status) {
            this.customersList = response.data;
          } else {
            this.customersList = [];
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }

  getUsers(){
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.usersList = response.data;
        }
      });
  }

  getLookupLists() {
    this.commonService.allLookupValues({ status: AppConstant.STATUS.ACTIVE ,tenantid: this.userstoragedata.tenantid }).subscribe(
      (data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.departmentList = _.filter(response.data, function (obj: any) {
            if (obj.lookupkey === AppConstant.LOOKUPKEY.DEPARTMENT) {
              return obj;
            }
          });
          this.projectList = _.filter(response.data, function (obj: any) {
            if (obj.lookupkey === AppConstant.LOOKUPKEY.PROJECTTYPE) {
              return obj;
            }
          });
          this.statusList = _.filter(response.data, function (obj: any) {
            if (obj.lookupkey === AppConstant.LOOKUPKEY.SRSTATUS) {
              return obj;
            }
          });
          this.priority = _.filter(response.data, function (obj: any) {
            if (obj.lookupkey === AppConstant.LOOKUPKEY.PRIORITY) {
              return obj;
            }
          });
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }
  getRequest(id) {
    this.srmService.byId(id).subscribe(
      (data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.genericReqObj = response.data;
        this.genericReqObj.refid = parseInt(id);
          this.viewRequest();
        } else {
          this.genericReqObj = {};
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }
  saveOrUpdate() {
    let errorMessage: any;
    if (this.genericReqForm.status === AppConstant.FORMSTATUS.INVALID) {
      errorMessage = this.commonService.getFormErrorMessage(
        this.genericReqForm,
        this.genericErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.loading = true;
    let data = {} as any;
    data = this.genericReqForm.value;
    this.formdata = {
      tenantid: this.userstoragedata.tenantid,
      userid: this.userstoragedata.userid,
      subject: data.subject,
      priority: data.priority,
      reporter: data.reporter,
      wrkflowid: data.wrkflowid,
      notes: data.notes || "",
      // clientid: data.customerid,
      referenceno: data.irn,
      assignedto: data.assignedto,
      custmorprjyn:
        data.custmorprjyn === this.projectList[0].keyvalue ? "N" : "Y",
      requesttype: AppConstant.GENERIC,
      requestdate: new Date(),
      status: AppConstant.STATUS.ACTIVE,
      srstatus: this.statusList[2].keyvalue,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    if(data.environment){
      this.formdata.environment=data.environment;
    }
    if(data.departmentname){
      this.formdata.department = data.departmentname.toString();
    } else {
      this.formdata.department = "";
    }
    if(data.customerid){
      this.formdata.clientid = data.customerid;
    } else {
      this.formdata.clientid = -1;
    }
    
    if (
      !_.isUndefined(this.genericReqObj.srvrequestid) &&
      !_.isEmpty(this.genericReqObj)
    ) {
      this.formdata.srvrequestid = this.genericReqObj.srvrequestid;
      this.formdata.srstatus = data.sractionstatus;
      this.srmService.updateService(this.formdata).subscribe(
        (result: any) => {
          const response = JSON.parse(result._body);
          this.loading = false;
          if (response.status) {
            this.message.success(response.message);
            this.router.navigate(["/srm"]);
            this.addUpdateHistory(
              this.formdata,
              AppConstant.HISTORY_KEYWORDS.Update
            )
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.loading = false;
          this.message.error(AppConstant.VALIDATIONS.ADDERRMSG);
        }
      );
    } else {
      this.formdata.createdby = this.userstoragedata.fullname;
      this.formdata.createddt = new Date();
      this.srmService.addService(this.formdata).subscribe(
        (result: any) => {
          const response = JSON.parse(result._body);
          this.loading = false;
          if (response.status) {
            this.resourceId = `crn:ops:request/${response.data.srvrequestid}`;
            this.message.success(response.message);
            this.addUpdateHistory(
              this.formdata,
              AppConstant.HISTORY_KEYWORDS.Create
            )
            this.router.navigate(["/srm"]);
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.loading = false;
          this.message.error(AppConstant.VALIDATIONS.ADDERRMSG);
        }
      );
    }
  }
  viewRequest() {
    this.buttonText = AppConstant.VALIDATIONS.UPDATE;
    const custmproject =
      this.genericReqObj.custmorprjyn === "Y"
        ? "Customer Project"
        : "Internal Project";
    const srstaus = this.genericReqObj.srstatus;
    this.genericReqForm = this.fb.group({
      subject: [this.genericReqObj.subject, Validators.required],
      notes: [this.genericReqObj.notes],
      departmentname: [
        Number(this.genericReqObj.department)
      ],
      assignedto: [this.genericReqObj.assignedto, Validators.required],
      reporter: [this.genericReqObj.reporter, Validators.required],
      wrkflowid: [this.genericReqObj.wrkflowid, Validators.required],
      priority: [this.genericReqObj.priority, Validators.required],
      environment: [this.genericReqObj.environment],
      custmorprjyn: [custmproject],
      customerid: [this.genericReqObj.clientid],
      irn: [this.genericReqObj.referenceno, Validators.required],
      sractionstatus: [this.genericReqObj.srstatus],
    });
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

  getResourceType() {
    let f = {
      tenantid: 7,
      crn: "crn:ops:environment",
      fields: AppConstant.ENVIRONMENT_FILTERS,
      filters: {},
      status: AppConstant.STATUS.ACTIVE,
    };
    this.assetRecordService.getResourceAssets(f).subscribe((r) => {
      let response = JSON.parse(r._body);
      this.resourceTypesList = _.orderBy(response.rows, ["resource"], ["asc"]);
    });
  }

  getWorkflowApproverList() {
    this.workpackWorkflowService
      .allWorkflow({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.workflowList = response.data;
        }
        this.workflowList.length;
      });
  }

  addUpdateHistory(data, type) {
    let approvedContent;
    let approverName;
    let requestType;
    if(type == AppConstant.HISTORY_KEYWORDS.Create){
      requestType = AppConstant.HISTORY_KEYWORDS.Create + "d";
      approverName = this.userstoragedata.fullname;
    }
    if(type == AppConstant.HISTORY_KEYWORDS.Update){
      requestType = AppConstant.HISTORY_KEYWORDS.Update + "d";
      approverName = this.userstoragedata.fullname;
    }
    if (type == AppConstant.REQUEST_HISTORY[1]) {
      requestType = AppConstant.REQUEST_HISTORY[3];
      approverName = this.genericReqObj.assignee.fullname;
    }
    if (type == AppConstant.REQUEST_HISTORY[0]) {
      data.tnapprovers.forEach((requestApprover, index) => {
        if (requestApprover.userid == this.userstoragedata.userid) {
          requestType = AppConstant.REQUEST_HISTORY[2];
          approverName = requestApprover.approvers.fullname;
        }
      });
    }
    approvedContent = `Request is ${requestType} by ${approverName}`;

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
        this.message.error(response.message);
      }
    });
  }
  onWorkflowSelect(data) {
    let workflowId = data;
    this.workpackWorkflowService.byId(workflowId).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status)
      this.selectedWorkflow = response.data;
      this.operationMode = "WKPACK_VIEW";
    })
  }
  showWorkflowSummary() {
    this.showWorkflow = true;
    let workflowId = this.genericReqObj.workflow.wrkflowid;
    this.workpackWorkflowService.byId(workflowId).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status)
      this.selectedWorkflow = response.data;
      this.operationMode = "WKPACK_VIEW";
    })
  }
}
