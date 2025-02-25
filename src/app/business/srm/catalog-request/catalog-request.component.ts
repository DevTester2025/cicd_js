import { Component, OnInit, TemplateRef } from "@angular/core";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { SrmService } from "../srm.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../app.constant";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { NzNotificationService } from "ng-zorro-antd";
import { SolutionService } from "../../tenants/solutiontemplate/solution.service";
import { UsersService } from "src/app/business/admin/users/users.service";
import { WorkpackWorkflowService } from "../../base/workflow/workflow.service";
import { AssetRecordService } from '../../base/assetrecords/assetrecords.service';
import { ParametersService } from "../../admin/parameters/parameters.service";
import { ContactpointsService } from "src/app/modules/services/shared/contactpoints.service";
import { NotificationSetupService } from "../../tenants/network setup/notificationsetup.service";
@Component({
  selector: "app-catalog-request",
  templateUrl:
    "../../../presentation/web/srm/catalog-request/catalog-request.component.html",
})
export class CatalogRequestComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  catalogList = [];
  clientList = [];
  statusList = [];
  usersList = [];
  resourceTypesList = [];
  priority = AppConstant.SYSTEM;
  loading = false;
  solutionData;
  summaryLoading: Boolean = false;
  showSummary: Boolean = false;
  catalogdownload = false;
  oladownload = false;
  archdownload = false;
  isSolution: boolean = false;
  isOrchestration: boolean = false;
  isWorkpack: boolean = false;
  isCICD: boolean = false;
  catalogObj = {} as any;
  userstoragedata: any = {};
  serviceRequestForm: FormGroup;
  departmentList = [];
  srvrequestid: any;
  workflowList = [];
  serviceObj = {} as any;
  orchestartionData = {};
  mode = "add";
  previewVisible = false;
  previewTitle = "";
  previewImage: any="";
  isFromList = false;
  editMode = false;
  buttonDisable = false;
  orchid;
  refid;
  requestType = "";
  module = AppConstant.MODULE[1];
  showWorkflow:boolean = false;
  workflowId: number;
  operationMode='';
  selectedWorkflow = {} as any;
  serviceRequestType;
  serviceRequestErrObj = {
    catalogid: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.SERVICE,
    // emailyn: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.EMAILYN,
    priority: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.PRIORITY,
    assignedto: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.ASSIGNEE,
    reporter: AppConstant.VALIDATIONS.AWS.GENERICREQUEST.ADDEDITFORM.REPORTER,
    urgentyn: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.DEPARTMENT,
    deploystdate: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.DEPLOYSTDATE,
    decommdate: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.DECOMMDATE,
    budgetyn: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.BUDGETYN,
    department: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.DEPARTMENT,
    subject: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.SUBJECT,
    clientid: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.CLIENT,
    referenceno: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.REFERENCENO,
    notes: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.NOTES,
    watchlist: AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.WATCHLIST,
  };
  watchList = [];
  selectedValue: any;
  constructor(
    private router: Router,
    private srmService: SrmService,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private routes: ActivatedRoute,
    private solutionService: SolutionService,
    private userService: UsersService,
    private assetRecordService: AssetRecordService,     
    private workpackWorkflowService: WorkpackWorkflowService,
    private contactpointsService: ContactpointsService,
    private notificationService:NotificationSetupService
  ) {
    this.serviceRequestForm = this.fb.group({
      catalogid: [null, Validators.required],
      // emailyn: ["N", Validators.required],
      urgentyn: ["N", Validators.required],
      deploystdate: [new Date(), Validators.required],
      decommdate: [new Date(), Validators.required],
      priority: [null, Validators.required],
      assignedto: [null, Validators.required],
      environment: [null],
      wrkflowid: [null, Validators.required],
      reporter: [null, Validators.required],
      budgetyn: ["Y", Validators.required],
      notes: ["", Validators.required],
      subject: ["", Validators.required],
      department: [null, Validators.required],
      clientid: [null, Validators.required],
      referenceno: [
        (Math.floor(Math.random() * 9999999) + 1111111).toString(),
        Validators.required,
      ],
      watchlist: [null, [Validators.required]],
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.srvrequestid = params.id;
        this.getServiceDetails();
        this.mode = "edit";
      }
    });
    this.editMode = this.router.url.includes("service/edit/");
    this.routes.queryParams.subscribe((params) => {
    this.serviceRequestType = params.type;
      if (params.catalogid !== undefined) {
        this.isFromList = true;
        this.serviceRequestForm.controls["catalogid"].setValue(
          Number(params.catalogid)
        );
        this.getCatalogDetails(params.catalogid);
      } else {
        this.getSRMCatalogList();
      }
    });
  }

  ngOnInit() {
    this.getAllDept();
    this.getAllClients();
    this.getUsers();
    this.getResourceType();
    this.getWorkflowApproverList();
    this.serviceRequestEntry('');
    this.getNotificationList();

    this.serviceRequestForm.controls['assignedto'].setValue(this.userstoragedata.userid);
    this.serviceRequestForm.controls['priority'].setValue(AppConstant.SYSTEM[1].value);
  }

  clearform() {
    this.serviceRequestForm.reset();
    this.catalogObj = {};
    this.serviceObj = {};
  }

  serviceRequestEntry(data){
    this.orchestartionData = data;
  }

  flagCheck(data){
    this.isSolution = false;
    this.isCICD= false;
    this.isWorkpack= false;
    this.isOrchestration= false;
    switch (data){
      case data = AppConstant.REQUEST_REFERENCE_TYPES[0]:
        this.isSolution = true;
        this.buttonDisable = false;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[1]:
        this.orchid = this.catalogObj.referenceid;
        this.isOrchestration= true;
        this.buttonDisable = true;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[2]:
        this.isWorkpack= true;
        this.buttonDisable = false;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[3]:
        this.isCICD= true;
        this.buttonDisable = false;
        break;
      default:
        break;
    }
  }

  inputClearValidators(){
      // this.serviceRequestForm.controls["priority"].clearValidators();
      this.serviceRequestForm.controls["urgentyn"].clearValidators();
      this.serviceRequestForm.controls["deploystdate"].clearValidators();
      this.serviceRequestForm.controls["decommdate"].clearValidators();
      this.serviceRequestForm.controls["reporter"].clearValidators();
      this.serviceRequestForm.controls["budgetyn"].clearValidators();
      // this.serviceRequestForm.controls["notes"].clearValidators();
      this.serviceRequestForm.controls["department"].clearValidators();
    
      Object.keys(this.serviceRequestForm.controls).forEach(key => {
        this.serviceRequestForm.controls[key].updateValueAndValidity();
      });
  }

  getSolutionDetailById(val) {
    this.summaryLoading = true;
    this.solutionService
      .byId(this.catalogObj.catalogid)
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.solutionData = response.data;
          this.showSummary = true;
          this.summaryLoading = false;
        } else {
          this.summaryLoading = false;
          this.messageService.error(response.message);
        }
      });
  }
  getAllClients() {
    this.commonService
      .allCustomers({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.clientList = response.data;
        }
      });
  }
  getSRMCatalogList() {
    let query = {} as any;
    query = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    query.publishstatus = AppConstant.STATUS.PUBLISHED;
    this.srmService.allCatalog(query).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.catalogList = response.data;
      } else {
        this.catalogList = [];
      }
    });
  }
  selectedCatalog(val) {
    this.getCatalogDetails(val);
  }
  getCatalogDetails(id) {
    this.loading = true;
    this.srmService.getByIdCatalog(id).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.catalogObj = response.data;
        this.requestType = this.catalogObj.referencetype;
        this.flagCheck(this.requestType);
        if(this.catalogObj.wrkflowid){
          this.serviceRequestForm.controls['wrkflowid'].setValue(this.catalogObj.wrkflowid);
          this.serviceRequestForm.controls['wrkflowid'].disable();
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
        if (this.catalogObj.archdiagram) {
          this.archdownload =
            this.commonService.getFileType(this.catalogObj.archdiagram) === true
              ? true
              : false;
        }
      } else {
        this.loading = false;
      }
    });
  }

  getAllDept() {
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.DEPARTMENT,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.departmentList = response.data;
        } else {
          this.departmentList = [];
        }
      });
    this.commonService.allLookupValues({
      status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.PRIORITY,
        tenantid: this.userstoragedata.tenantid,
    }).subscribe((result)=>{
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.priority = response.data;
      } else {
        this.departmentList = [];
      }
    })
  }
  generateCatalogAsRequest(data, status, template) {
    if (this.isOrchestration && !this.editMode || this.isCICD || this.isWorkpack){
      this.inputClearValidators();
    }
    let errorMessage: any;
    this.loading = true;
    if (this.serviceRequestForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.serviceRequestForm,
        this.serviceRequestErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else if (new Date(data.decommdate) < new Date(data.deploystdate)) {
      this.loading = false;
      this.messageService.error(AppConstant.DECOMMISSIONINGERR);
      return false;
    } else {
      let formdata = {} as any;
      formdata.tenantid = this.userstoragedata.tenantid;
      formdata.subject = data.subject;
      formdata.clientid = data.clientid;
      formdata.catalogid = data.catalogid;
      formdata.userid = this.userstoragedata.userid;
      if(data.department){
      formdata.department = data.department.toString() || "";
      }
      formdata.assignedto = data.assignedto;
      formdata.referenceno = data.referenceno;
      formdata.wrkflowid = this.catalogObj.wrkflowid;
      formdata.requesttype = this.requestType;
      formdata.notes = data.notes;
      formdata.priority = data.priority;
      formdata.ntfcsetupid = data.watchlist;
      if(this.requestType == AppConstant.REQUEST_REFERENCE_TYPES[0]){
        formdata.reporter = data.reporter;
        formdata.requestdate = new Date();
        formdata.duedate = new Date();
        formdata.description = this.catalogObj.description;
        formdata.emailyn = data.emailyn;
        formdata.urgentyn = data.urgentyn;
        formdata.deploystdate = data.deploystdate;
        formdata.decommdate = data.decommdate;
        formdata.budgetyn = data.budgetyn;
        formdata.autodeployyn = this.catalogObj.autodeployyn;
      }
      if(this.requestType == AppConstant.REQUEST_REFERENCE_TYPES[1]){
        formdata.contactdata = this.orchestartionData;
        formdata.requesttype = this.requestType;
      }
      formdata.status = AppConstant.STATUS.ACTIVE;
      formdata.requestdate = new Date();
      formdata.createdby = this.userstoragedata.fullname;
      formdata.createddt = new Date();
      formdata.lastupdatedby = this.userstoragedata.fullname;
      formdata.lastupdateddt = new Date();
      formdata.srmsractions = [];
      if(data.environment){
        formdata.environment = data.environment;
      }
      // if (!_.isUndefined(this.srvrequestid)) {
      //   formdata.srmsractions.push(
      //     _.find(this.serviceObj.srmsractions, { touserid: null })
      //   );
      // } else {
        // formdata.srmsractions = [
        //   {
        //     actiontype: "Progress",
        //     notes: data.notes,
        //     fromuserid: this.userstoragedata.userid,
        //     createdby: this.userstoragedata.fullname,
        //     createddt: new Date(),
        //     lastupdatedby: this.userstoragedata.fullname,
        //     lastupdateddt: new Date(),
        //   },
        // ];
      // }
      // if (
      //   this.catalogObj.approvalyn == "Y" &&
      //   _.isUndefined(this.srvrequestid)
      // ) {
      //   let self = this;
        // _.map(this.catalogObj.srmcatalogaprvr, function (item) {
        //   let actdata = {} as any;
        //   actdata = {
        //     actiontype: "Approval",
        //     apprvstatus: AppConstant.STATUS.PENDING,
        //     approverlevel: item.approverlevel,
        //     notes: "Approval Request",
        //     fromuserid: self.userstoragedata.userid,
        //     touserid: item.userid,
        //     duedate: formdata.duedate,
        //     createdby: self.userstoragedata.fullname,
        //     createddt: new Date(),
        //     lastupdatedby: self.userstoragedata.fullname,
        //     lastupdateddt: new Date(),
        //   };
          // if (!_.isUndefined(self.srvrequestid)) {
          //   actdata.srvrequestid = self.srvrequestid;
          // }
          // formdata.srmsractions.push(actdata);
        // });
      // }
      if (status === "") {
        formdata.srstatus = AppConstant.STATUS.PENDING;
        // formdata.srmsractions[0].srstatus = AppConstant.STATUS.WIP;
      } else {
        formdata.srstatus = AppConstant.STATUS.DRAFT;
        // formdata.srmsractions[0].srstatus = AppConstant.STATUS.DRAFT;
      }

      if (
        !_.isUndefined(this.serviceObj) &&
        !_.isEmpty(this.serviceObj) &&
        this.serviceObj.srstatus === "Draft"
      ) {
        // formdata.srmsractions[0].srvrequestid = this.srvrequestid;
        this.update(formdata, template, formdata.contactdata);
      } else {
        this.srmService.addService(formdata).subscribe((result) => {
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            // this.messageService.success(response.message);
            this.clearform();
            const url = this.routes.snapshot.queryParams.url;
            switch (url) {
              case "inbox":
                this.router.navigate(["srm/inbox"]);
                break;
              default:
                this.router.navigate(["srm"]);
            }
            if (status === "") {
              this.viewNotification(template);
              this.srvrequestid = response.data.srvrequestid;
            }
          } else {
            this.messageService.error(response.message);
          }
        });
      }
    }
  }
  update(formdata, template, ContactData) {
    formdata.srvrequestid = Number(this.srvrequestid);
    this.srmService.updateService(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.messageService.success(response.message);
        const url = this.routes.snapshot.queryParams.url;
        switch (url) {
          case "inbox":
            this.router.navigate(["srm/inbox"]);
            break;
          default:
            this.router.navigate(["srm"]);
        }
        if (template !== "") {
          this.viewNotification(template);
        }
      } else {
        this.messageService.error(response.message);
      }
    });
    if (ContactData){
      let reqObj = this.orchestartionData;
      this.contactpointsService.update(reqObj).subscribe((res)=>{
        let response = JSON.parse(res._body);
      })
    }
  }
  viewNotification(template) {
    this.notification.template(template, {
      nzStyle: {
        right: "460px",
        top: "100px",
        width: "500px",
        height: "350px",
      },
    });
  }
  viewDetails(id) {
    this.router.navigate(["srm/catalog/view/" + id]);
  }

  getServiceDetails() {
    this.loading = true;
    this.srmService.byId(this.srvrequestid).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.serviceObj = response.data;
        let ntfcsetupIds =
        response.data.notificationwatchlistSRM &&
        response.data.notificationwatchlistSRM.length > 0
          ? response.data.notificationwatchlistSRM.map((e) => e.ntfcsetupid)
          : [];
        this.serviceRequestForm.patchValue({
          referenceno: this.serviceObj.referenceno,
          clientid:this.serviceObj.customer.customerid,
          subject: this.serviceObj.subject,
          priority:this.serviceObj.priority,
          wrkflowid: this.serviceObj.wrkflowid,
          notes:this.serviceObj.notes,
          watchlist: ntfcsetupIds,
        })
        this.catalogObj = response.data.catalog;
        this.requestType = this.catalogObj.referencetype;
        this.refid = this.serviceObj.contactdata.refid;
        this.serviceRequestEntry(this.serviceObj.contactdata);
        this.flagCheck(this.catalogObj.referencetype)
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
        if (this.catalogObj.archdiagram) {
          this.archdownload =
            this.commonService.getFileType(this.catalogObj.archdiagram) === true
              ? true
              : false;
        }
        this.generateServiceEditForm(response.data);
      } else {
        this.loading = false;
      }
    });
  }
  generateServiceEditForm(data) {
    console.log(data);
  
    this.serviceRequestForm = this.fb.group({
      catalogid: [data.catalogid, Validators.required],
      assignedto: [data.assignedto, Validators.required],
      subject: [data.subject, Validators.required],
      clientid: [data.clientid, Validators.required],
      referenceno: [data.referenceno, Validators.required],
      contactdata: [data.contactdata],
      ntfcsetupid: [data.watchlist, [Validators.required]],

    });

    if(data.wrkflowid){
      this.serviceRequestForm.addControl('wrkflowid', this.fb.control(data.wrkflowid));
      this.serviceRequestForm.get('wrkflowid').disable();
    }
  
    if (data.catalog.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[0]) {
      this.serviceRequestForm.addControl('emailyn', this.fb.control(data.emailyn, Validators.required));
      this.serviceRequestForm.addControl('urgentyn', this.fb.control(data.urgentyn, Validators.required));
      this.serviceRequestForm.addControl('deploystdate', this.fb.control(data.deploystdate, Validators.required));
      this.serviceRequestForm.addControl('decommdate', this.fb.control(data.decommdate, Validators.required));
      this.serviceRequestForm.addControl('budgetyn', this.fb.control(data.budgetyn, Validators.required));
      // this.serviceRequestForm.addControl('notes', this.fb.control(data.notes, Validators.required));
      this.serviceRequestForm.addControl('department', this.fb.control(Number(data.department), Validators.required));
      // this.serviceRequestForm.addControl('priority', this.fb.control(data.priority, Validators.required));
      this.serviceRequestForm.addControl('environment', this.fb.control(data.environment));
      this.serviceRequestForm.addControl('reporter', this.fb.control(data.reporter, Validators.required));
    }
    if (data.catalog.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[1]) {
      this.serviceRequestForm.addControl('contactdata', this.fb.control(data.contactdata));
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
      case "inbox":
        this.router.navigate(["srm/inbox"]);
        break;
      default:
        this.router.navigate(["srm"]);
    }
  }
  closeSummary(event) {
    this.showSummary = event;
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
  onWorkflowSelect(data) {
    this.workflowId = data;
    this.workpackWorkflowService.byId(this.workflowId).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status)
      this.selectedWorkflow = response.data;
      this.operationMode = "WKPACK_VIEW";
    })
  }
  showWorkflowSummary() {
    this.showWorkflow = true;
    let workflowId = this.catalogObj.workflow.wrkflowid;
    this.workpackWorkflowService.byId(workflowId).subscribe((result) => {
      let response = JSON.parse(result._body);
      
      if (response.status)
      this.selectedWorkflow = response.data;
      this.operationMode = "WKPACK_VIEW";
    })
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
