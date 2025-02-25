import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { SrmService } from "../../srm.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";

import * as _ from "lodash";
import { SolutionService } from "src/app/business/tenants/solutiontemplate/solution.service";
import { WorkpackWorkflowService } from "src/app/business/base/workflow/workflow.service";

@Component({
  selector: "app-srm-catalog-view",
  templateUrl:
    "../../../../presentation/web/srm/catalog-request/view/catalog-view.component.html",
})
export class SRMCatalogViewComponent implements OnInit {
  catalogObj = {} as any;
  userstoragedata: any = {};
  catalogRequestForm: FormGroup;
  isPublishMode = false;
  catalogRequestErrObj = {
    plannedenddate:
      AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.PLANNED_END_DATE,
    plannedpublishdate:
      AppConstant.VALIDATIONS.AWS.SOLUTIONREQUEST.PLANNED_PUBLISH_DATE,
  };
  previewVisible = false;
  solutionData;
  isShowDetail: boolean;
  summaryLoading: Boolean = false;
  showSummary: Boolean = false;
  previewTitle = "";
  previewImage: any="";
  loading = true;
  catalogdownload = false;
  oladownload = false;
  archdownload = false;
  panelName = AppConstant.VALIDATIONS.DEPLOYMENT.NOTES;
  panels = [
    {
      active: false,
      disabled: false,
      name: AppConstant.VALIDATIONS.DEPLOYMENT.NOTES,
    },
  ];
  notesList = [];
  requestid: any;
  show = false;
  isSolution: boolean = false;
  isOrchestration: boolean = false;
  isWorkpack: boolean = false;
  isCICD: boolean = false;
  tabIndexNo = 0;
  operationMode='';
  selectedWorkflow = {} as any;
  showWorkflow:boolean = false;
  constructor(
    public router: Router,
    private srmService: SrmService,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private solutionService: SolutionService,
    private commonService: CommonService,
    private routes: ActivatedRoute,
    private workpackWorkflowService: WorkpackWorkflowService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.catalogRequestForm = this.fb.group({
      plannedpublishdate: [null, Validators.required],
      plannedenddate: [null, Validators.required],
    });
    this.routes.queryParams.subscribe((params) => {
      if (params.id !== undefined && params.mode == "Publish") {
        this.isPublishMode = true;
        this.getCatalogDetails(params.id);
        this.requestid = params.id;
      }
      if (params.id !== undefined && params.mode == "View") {
        this.isPublishMode = false;
        this.requestid = params.id;
        this.getCatalogDetails(params.id);
      }
    });
  }

  ngOnInit() {
    this.getServiceActions(this.requestid);
  }
  getServiceActions(id) {
    this.srmService
      .allSrmActions({ srvrequestid: Number(id) })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.notesList = response.data;
          this.show = true;
        } else {
          this.notesList = [];
        }
      });
  }
  onCollapse(event) {
    if (event) {
      this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.HIDE;
    } else {
      this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.NOTES;
    }
  }

  getCatalogDetails(id) {
    this.srmService.getByIdCatalog(id).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.catalogObj = response.data;
        this.catalogObj.refid = this.catalogObj.catalogid;
        this.catalogObj.reftype = AppConstant.REFERENCETYPE[1];
        this.flagCheck(this.catalogObj.referencetype);
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
        this.getSolutionName();
      } else {
        this.loading = false;
      }
    });
  }
  showSolutionSummary() {
    this.isShowDetail = true;
    this.showSummary = true;
    this.summaryLoading = false;
  }
  closeSummary(event) {
    this.showSummary = event;
  }
  getSolutionName() {
    this.getSolutionDetailById(
      this.catalogObj.solution.solutionid,
      this.catalogObj.solution.cloudprovider
    );
  }
  getSolutionDetailById(val, cloudprovider) {
    if (cloudprovider == "AWS") {
      this.solutionService.byId(val).subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (this.isShowDetail) {
          this.summaryLoading = false;
          this.isShowDetail = false;
        }
        if (response.status) {
          this.solutionData = response.data;
        } else {
          this.messageService.error(response.message);
        }
      });
    }
    if (cloudprovider == "ECL2") {
      this.solutionService.ecl2byId(val).subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (this.isShowDetail) {
          this.summaryLoading = false;
          this.isShowDetail = false;
        }
        if (response.status) {
          this.solutionData = response.data;
        } else {
          this.messageService.error(response.message);
        }
      });
    }
  }
  updateCatalog(data) {
    let errorMessage: any;
    let formdata = {} as any;
    if (this.catalogRequestForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.catalogRequestForm,
        this.catalogRequestErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    if (new Date(data.plannedpublishdate) > new Date(data.plannedenddate)) {
      this.messageService.error(
        "Publish date should be less than or equal to end date"
      );
      return false;
    }
    formdata.catalogid = this.catalogObj.catalogid;
    formdata.plannedenddate = data.plannedenddate;
    formdata.plannedpublishdate = data.plannedpublishdate;
    formdata.publishstatus = AppConstant.STATUS.PUBLISHED;
    formdata.tenantid = this.userstoragedata.tenantid;
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.lastupdateddt = new Date();
    const formData = new FormData();
    formData.append("formData", JSON.stringify(formdata));
    this.srmService.updateCatalog(formData).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.messageService.success(response.message);
        this.router.navigate(["/srm/list"]);
      } else {
        this.messageService.error(response.message);
      }
    });
  }
  onPreview(file, title) {
    this.previewTitle = title;
    this.previewVisible = true;
    this.previewImage = file;
  }
  flagCheck(data){
    switch (data){
      case data = AppConstant.REQUEST_REFERENCE_TYPES[0]:
        this.isSolution = true;
        this.isOrchestration = false;
        this.isWorkpack = false;
        this.isCICD = false;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[1]:
        this.isSolution = false;
        this.isOrchestration = true;
        this.isWorkpack = false;
        this.isCICD = false;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[2]:
        this.isSolution = false;
        this.isOrchestration= false;
        this.isWorkpack = true;
        this.isCICD = false;
        break;
      case data = AppConstant.REQUEST_REFERENCE_TYPES[3]:
        this.isSolution = false;
        this.isOrchestration = false;
        this.isWorkpack = false;
        this.isCICD = true;
        break;
      default:
        this.isSolution = false;
        this.isOrchestration = false;
        this.isWorkpack = false;
        this.isCICD = false;
        break;
    }
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
  tabChanged(e) {
    this.tabIndexNo = e.index;
  }
}
