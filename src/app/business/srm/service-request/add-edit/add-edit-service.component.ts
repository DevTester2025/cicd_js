import { Component, Input, OnInit } from "@angular/core";
import { SrmService } from "../../srm.service";
import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { AppConstant } from "../../../../app.constant";
import { DeploymentsService } from "../../../deployments/deployments.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { SolutionService } from "../../../tenants/solutiontemplate/solution.service";
import * as moment from "moment";
import { WorkpackWorkflowService } from "../../../base/workflow/workflow.service";
import { NgSwitchCase } from "@angular/common";
import { OrchestrationService } from "src/app/business/base/orchestration/orchestration.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { ReleasesService } from "src/app/business/cicd/releases/releases.service";

@Component({
  selector: "app-srm-add-edit-service",
  templateUrl:
    "../../../../presentation/web/srm/service-request/add-edit/add-edit-service.component.html",
})
export class SRMAddEditServiceComponent implements OnInit {
  previewVisible = false;
  previewTitle = "";
  previewImage: any="";
  solutionList: any[] = [];
  groupNamesList: any[] = [];
  userstoragedata = {} as any;
  serviceRequestForm: FormGroup;
  formData = {} as any;
  archictectureimgfile: any;
  solutionData;
  workpackData = {} as any;
  summaryLoading: Boolean = false;
  showSummary: Boolean = false;
  solutionName = {} as any;
  olaimgfile: any;
  serviceimgfile: any;
  archfile: any;
  olafile: any;
  servicefile: any;
  approversArray: FormArray;
  catalogObj = {} as any;
  serviceRequestErrObj = {
    service: { required: "Please select service" },
    groupname: { required: "Please select group name" },
    startdate: { required: "Please enter start date" },
    publishdate: { required: "Please enter publish date" },
    enddate: { required: "Please enter end date" },
    ha: { required: "Please enter high availability" },
    description: { required: "Please enter description" },
    estimatedcost: { required: "Please enter estimated cost" },
    setupcost: { required: "Please enter setup cost" },
    runningcost: { required: "Please enter running cost" },
    othercost: { required: "Please enter other cost" },
    serviceimage: { required: "Please upload service image" },
    servicecatalogimg: { required: "Please upload service catalog image" },
    archviewimg: { required: "Please upload architectural view image" },
    // noofapprovers: { required: "Please select Number of approvers" },
    // approversArray: { required: "Please select the approver" },
  };
  labelParams: any[] = [];
  usersList: any[] = [];
  catalogid: number;
  catalogdownload = false;
  oladownload = false;
  archdownload = false;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  isShowDetail: boolean;
  loading = false;
  CreatedBy: string = '';
  CreatedDate;
  orchData = {} as any;
  cicdData = {} as any;
  workpackName = {} as any;
  workflowList = [];
  referenceid: any;
  referencetype: any;
  servicename: string = '';
  isSolution: boolean = false;
  isOrchestration: boolean = false;
  isWorkpack: boolean = false;
  isCICD: boolean = false;
  showWorkflow:boolean = false;
  workflowId: number;
  selectedWorkflow = {} as any;
  operationMode='';
  constructor(
    public router: Router,
    private srmService: SrmService,
    private deploysltnService: DeploymentsService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private solutionService: SolutionService,
    private commonService: CommonService,
    private routes: ActivatedRoute,
    private workpackWorkflowService: WorkpackWorkflowService,
    private orchestrationsService: OrchestrationService,
    private assetRecordService: AssetRecordService,
    private releasesService: ReleasesService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.queryParams.subscribe(params => {
      this.referenceid = params['referenceid'];
      this.referencetype = params['referencetype'];
      this.servicename = params['servicename'];
    });
  }

  formatterDollar = (value) => `$ ${value}`;
  parserDollar = (value) => value.replace("$ ", "");
  ngOnInit() {
    this.loading = true;
    this.serviceRequestForm = this.fb.group({
      service: [null, Validators.required],
      groupname: [null, Validators.required],
      startdate: [null, Validators.required],
      publishdate: [null, Validators.required],
      enddate: [null, Validators.required],
      wrkflowid: [null, Validators.required],
      ha: [100, Validators.required],
      description: [null, Validators.required],
      estimatedcost: [0, Validators.required],
      setupcost: [0, Validators.required],
      runningcost: [0, Validators.required],
      othercost: [0, Validators.required],
      autodeployyn: ["N", Validators.required],
      serviceimage: [null, Validators.required],
      servicecatalogimg: [null, Validators.required],
      archviewimg: [null, Validators.required],
      // approvalyn: ["N", Validators.required],
      // noofapprovers: [0, Validators.required],
      // notes: [""],
      // approversArray: this.fb.array([]),
    });
    this.getAllTemplates();
    this.getAllUsers();
    this.getAllGroupNames();
    this.getWorkflowApproverList();
    this.getCatalog();
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.catalogid = params.id;
        this.getCatalogDetails();
      }
    });
    this.solutionList = [];
    this.labelParams = []; 
    this.flagCheck(this.referencetype);
  }
  getCatalog() {
    switch(this.referencetype) {
      case "Orchestration":
        this.orchestrationsService.byId(this.referenceid).subscribe((data) => {
          let response = JSON.parse(data._body);
          if (response.status) {
            this.orchData = response.data;
            this.serviceRequestForm.patchValue({
              service: this.orchData.orchname,
            });
            this.CreatedBy = this.orchData.createdby;
            this.CreatedDate = this.orchData.createddt
              ? moment(this.orchData.createddt).format("DD-MMM-YYYY HH:mm:ss")
              : "";
          }
        })
        break;
      case "Solution":
        this.solutionService.byId(this.referenceid).subscribe((data) => {
          let response = JSON.parse(data._body);
          if (response.status) {
            this.solutionData = response.data;
            this.serviceRequestForm.patchValue({
              service: this.solutionData.solutionname,
            });
            this.CreatedBy = this.solutionData.createdby;
            this.CreatedDate = this.solutionData.createddt
              ? moment(this.solutionData.createddt).format("DD-MMM-YYYY HH:mm:ss")
              : "";
          }
        })
        break;
      case "Workpack":
        this.assetRecordService
        .getResourceValuesById(btoa(this.referenceid))
        .subscribe((data) => {
          console.log(this.referenceid,"referenceid")
          this.workpackName = JSON.parse(data._body);
          console.log(this.workpackName,"workpackName");
          
            this.serviceRequestForm.patchValue({
              service: this.workpackName.data[1].fieldvalue,
            });
            this.CreatedBy = this.workpackName.data[1].createdby;
            this.CreatedDate = this.workpackName.data[1].createddt
              ? moment(this.workpackName.data[1].createddt).format("DD-MMM-YYYY HH:mm:ss")
              : "";
        })
      break;
      case "CICD":
        this.releasesService.byId(this.referenceid +
          `?tenantid=${this.userstoragedata.tenantid}`).subscribe((data) => {
          let response = JSON.parse(data._body);
          if (response.status) {
            this.cicdData = response.data;
            console.log(this.cicdData,"cicdData");
            
            this.serviceRequestForm.patchValue({
              service: this.cicdData.name,
            });
            this.CreatedBy = this.cicdData.createdby;
            this.CreatedDate = this.cicdData.createddt
              ? moment(this.cicdData.createddt).format("DD-MMM-YYYY HH:mm:ss")
              : "";
          }
        })
        break;
      default:
      break;
    }
  }
  showSolutionSummary() {
    this.isShowDetail = true;
    this.showSummary = true;
    this.summaryLoading = false;
  }
  clearform() {
    this.serviceRequestForm.reset();
    this.catalogObj = {};
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
          // console.log('this.solutionData >>');
          // console.log(this.solutionData);
          let description =
            "This is a standard deployment of " +
            this.solutionData.solutionname +
            " with the following characteristics\n";
          description =
            description +
            this.solutionData.solutionname +
            " consists of " +
            this.solutionData.awssolutions.length +
            " Virtual Machines with " +
            _.uniqBy(this.solutionData.awssolutions, "lbid").length +
            " Load Balancers and " +
            _.uniqBy(this.solutionData.awssolutions, "securitygroupid").length +
            " Security Group. It also has " +
            _.uniqBy(this.solutionData.awssolutions, "slaname").length +
            " SLA along with the notification of " +
            this.solutionData.notifications.modeofnotification.join(", ");

          this.serviceRequestForm.controls["description"].setValue(description);
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
          // console.log('this.solutionData >>');
          // console.log(this.solutionData);
          let description =
            "This is a standard deployment of " +
            this.solutionData.solutionname +
            " with the following characteristics\n";
          description =
            description +
            this.solutionData.solutionname +
            " consists of " +
            this.solutionData.ecl2solutions.length +
            " Virtual Machines with " +
            _.uniqBy(this.solutionData.ecl2solutions, "lbid").length +
            " Load Balancers and " +
            _.uniqBy(this.solutionData.ecl2solutions, "networkid").length +
            " Networks. It also has " +
            _.uniqBy(this.solutionData.ecl2solutions, "slaname").length +
            " SLA along with the notification of " +
            this.solutionData.notifications.modeofnotification.join(", ");

          this.serviceRequestForm.controls["description"].setValue(description);
        } else {
          this.messageService.error(response.message);
        }
      });
    }
  }
  getAllTemplates() {
    this.deploysltnService
      .allTemplates({
        tenantid: this.userstoragedata.tenantid,
        status: "Active",
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        this.loading = false;
        if (response.status) {
          this.solutionList = response.data;
        } else {
          this.solutionList = [];
        }
      });
  }
  getAllGroupNames() {
    this.commonService
      .allLookupValues({ status: "Active", lookupkey: "GROUPNAME",tenantid: this.userstoragedata.tenantid })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        this.loading = false;
        if (response.status) {
          this.groupNamesList = response.data;
        } else {
          this.groupNamesList = [];
        }
      });
  }
  getAllUsers() {
    this.loading = true;
    this.commonService
      .allUsers({ status: "Active", tenantid: this.userstoragedata.tenantid })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        this.loading = false;
        if (response.status) {
          this.usersList = response.data;
        } else {
          this.usersList = [];
        }
      });
  }
  createServiceReq(data) {
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[1]){
      this.inputClearValidators();
    }
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[2]){
      this.inputClearValidators();
    }
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[3]){
      this.inputClearValidators();
    }
    let errorMessage: any;
    if (this.serviceRequestForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.serviceRequestForm,
        this.serviceRequestErrObj,
        "approversArray"
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else if (new Date(data.startdate) > new Date(data.enddate)) {
      this.messageService.error(
        "Start date should be less than or equal to end date"
      );
      return false;
    } else if (new Date(data.startdate) > new Date(data.publishdate)) {
      this.messageService.error(
        "Start date should be less than or equal to publish date"
      );
      return false;
    } else if (new Date(data.publishdate) > new Date(data.enddate)) {
      this.messageService.error(
        "Publish date should be less than or equal to end date"
      );
      return false;
    } else {
      const formdata = new FormData();
      // this.formData.solutionid = data.service;
      this.formData.groupname = data.groupname;
      this.formData.startdate = data.startdate;
      this.formData.publishdate = data.publishdate;
      this.formData.enddate = data.enddate;
      this.formData.wrkflowid = data.wrkflowid;
      this.formData.description = data.description;
      if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[0]) {
        this.formData.ha = data.ha;
        this.formData.estimatedcost = data.estimatedcost;
        this.formData.setupcost = data.setupcost;
        this.formData.runningcost = data.runningcost;
        this.formData.othercost = data.othercost;
        this.formData.autodeployyn = data.autodeployyn;
      }
      // this.formData.approvalyn = data.approvalyn;
      // this.formData.noofapprovers = data.noofapprovers;
      this.formData.tenantid = this.userstoragedata.tenantid;
      this.formData.lastupdatedby = this.userstoragedata.fullname;
      this.formData.lastupdateddt = new Date();
      if (data.approvalyn == "Y") {
        this.formData.srmcatalogaprvr = [];
        if (this.catalogid) {
          this.formData.srmcatalogaprvr =
            this.serviceRequestForm.get("approversArray").value;
          let self = this;
          _.map(this.catalogObj.srmcatalogaprvr, function (item) {
            let index = _.indexOf(self.formData.srmcatalogaprvr, item);
            let existData = {} as any;
            existData = _.find(
              self.serviceRequestForm.get("approversArray").value,
              { userid: item.userid }
            );
            if (existData == undefined) {
              item = _.omit(item, "catalogapprovid");
              item.status = "Inactive";
              item.catalogid = self.catalogid;
              item.lastupdateddt = new Date();
              item.lastupdatedby = self.userstoragedata.fullname;
              self.formData.srmcatalogaprvr.push(item);
            }
          });
        } else {
          this.formData.srmcatalogaprvr =
            this.serviceRequestForm.get("approversArray").value;
        }
      }
      formdata.append("olaimgfile", this.olaimgfile);
      formdata.append("archictectureimgfile", this.archictectureimgfile);
      formdata.append("serviceimgfile", this.serviceimgfile);
      if (this.catalogid) {
        this.formData.catalogid = this.catalogid;
        formdata.append("formData", JSON.stringify(this.formData));
        this.srmService.updateCatalog(formdata).subscribe((result) => {
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            this.messageService.success(response.message);
            this.router.navigate(["/srm/list"]);
          } else {
            this.messageService.error(response.message);
          }
        });
      } else {
        switch(this.referencetype){
          case "Orchestration":
            this.formData.catalogname = this.servicename;
            this.formData.referenceid = this.orchData.orchid;
            this.formData.referencetype = AppConstant.REQUEST_REFERENCE_TYPES[1]
            break;
          case "Solution":
            this.formData.catalogname = this.servicename;
            this.formData.referenceid = this.solutionData.solutionid;
            this.formData.solutionid = this.solutionData.solutionid;
            this.formData.referencetype = AppConstant.REQUEST_REFERENCE_TYPES[0];
            break;
          case "Workpack":
            this.formData.catalogname = this.workpackName.data[1].fieldvalue,
            this.formData.referenceid = this.referenceid;
            this.formData.referencetype = AppConstant.REQUEST_REFERENCE_TYPES[2];
            break;
          case "CICD":
            this.formData.catalogname = this.servicename,
            this.formData.referenceid = this.cicdData.id;
            this.formData.referencetype = AppConstant.REQUEST_REFERENCE_TYPES[3];
            break;
          default:
            break;  
        }
        this.formData.createdby = this.userstoragedata.fullname;
        this.formData.createddt = new Date();
        this.formData.tenantid = this.userstoragedata.tenantid;
        this.formData.publishstatus = AppConstant.STATUS.PUBLISHED;
        formdata.append("formData", JSON.stringify(this.formData));
        this.srmService.createCatalog(formdata).subscribe((result) => {
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            this.messageService.success(response.message);
            this.router.navigate(["/srm/list"]);
            this.srmService.getCatalog(response.data);
          } else {
            this.messageService.error(response.message);
          }
        });
        // this.clearform();
      }
    }
  }
  onFile(event, type) {
    const reader = new FileReader();
    if (type === "ServiceImg") {
      this.serviceimgfile = event.target.files[0];
      reader.onload = (e) => {
        this.servicefile = e.target["result"];
      };
      reader.readAsDataURL(event.target.files[0]);
      if (this.serviceimgfile) {
        this.catalogdownload =
          this.commonService.getFileType(this.serviceimgfile.name) === true
            ? true
            : false;
      }
    } else if (type === "olaImg") {
      this.olaimgfile = event.target.files[0];
      reader.onload = (e) => {
        this.olafile = e.target["result"];
      };
      reader.readAsDataURL(event.target.files[0]);
      if (this.olaimgfile) {
        this.oladownload =
          this.commonService.getFileType(this.olaimgfile.name) === true
            ? true
            : false;
      }
    } else if (type === "ArchImg") {
      this.archictectureimgfile = event.target.files[0];

      reader.onload = (e) => {
        this.archfile = e.target["result"];
      };
      reader.readAsDataURL(event.target.files[0]);
      if (this.archictectureimgfile) {
        this.archdownload =
          this.commonService.getFileType(this.archictectureimgfile.name) ===
          true
            ? true
            : false;
      }
    }
  }
  onPreview(file, title) {
    this.previewTitle = title;
    this.previewVisible = true;
    this.previewImage = file;
  }
  handleChange({ file, fileList }, type): void {
    if (type === "ServiceImg") {
      this.serviceimgfile = file.originFileObj;
    } else if (type === "olaImg") {
      this.olaimgfile = file.originFileObj;
    } else if (type === "ArchImg") {
      this.archictectureimgfile = file.originFileObj;
    }
  }
  beforeUpload = (file: UploadFile): boolean => {
    return false;
  };
  approvalChange(event) {
    if (event == "Y") {
      this.serviceRequestForm.controls["noofapprovers"].setValue(3);
      const approvers = this.serviceRequestForm.get("noofapprovers").value;
      for (let i = 0; i < approvers; i++) {
        this.addArrayItem({ userid: 0, index: i }, i);
      }
    } else {
      this.serviceRequestForm.controls["approversArray"] = new FormArray([]);
      this.labelParams = [];
    }
  }
  approvalLvlChange(event) {
    this.labelParams = [];
    this.approversArray = this.serviceRequestForm.get(
      "approversArray"
    ) as FormArray;
    this.approversArray = new FormArray([]);
    this.serviceRequestForm.controls["approversArray"] = new FormArray([]);
    const approvers = event;
    for (let i = 0; i < approvers; i++) {
      let data = {} as any;
      data = {
        userid: 0,
        index: i,
      };
      if (!_.isEmpty(this.catalogObj.srmcatalogaprvr)) {
        if (!_.isUndefined(this.catalogObj.srmcatalogaprvr[i])) {
          data.userid = Number(this.catalogObj.srmcatalogaprvr[i].userid);
          data.status = "Inactive";
          data.catalogapprovid = Number(
            this.catalogObj.srmcatalogaprvr[i].catalogapprovid
          );
        }
      }
      this.addArrayItem(data, i);
    }
  }
  createArrayItem(data, i): FormGroup {
    let arrayObj = {} as any;
    arrayObj = {
      approverlevel: [i + 1, Validators.required],
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    if (this.catalogid) {
      arrayObj.catalogid = Number(this.catalogid);
    }
    if (data.userid) {
      arrayObj.userid = [data.userid, Validators.required];
      arrayObj.catalogapprovid = data.catalogapprovid;
    } else {
      arrayObj.userid = [0, Validators.required];
    }
    return this.fb.group(arrayObj);
  }
  addArrayItem(data, i): void {
    this.approversArray = this.serviceRequestForm.get(
      "approversArray"
    ) as FormArray;
    this.approversArray.push(this.createArrayItem(data, i));
    data.label = "userid";
    this.labelParams.push(data);
  }
  getSolutionName(data) {
    let solution = {} as any;
    solution = _.find(this.solutionList, { solutionid: data });
    this.solutionName = solution.solutionname;
    this.getSolutionDetailById(solution.solutionid, solution.cloudprovider);
  }
  generateEditForm(data) {
    this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
    this.solutionName = data.solution.solutionname;
    this.serviceRequestForm = this.fb.group({
      // service: [Number(data.solutionid), Validators.required],
      groupname: [Number(data.groupname), Validators.required],
      startdate: [data.startdate, Validators.required],
      publishdate: [data.publishdate, Validators.required],
      enddate: [data.enddate, Validators.required],
      // ha: [data.ha, Validators.required],
      // description: [data.description, Validators.required],
      // estimatedcost: [data.estimatedcost, Validators.required],
      // setupcost: [data.setupcost, Validators.required],
      // runningcost: [data.runningcost, Validators.required],
      // othercost: [data.othercost, Validators.required],
      // autodeployyn: [data.autodeployyn, Validators.required],
      // approvalyn: [data.approvalyn, Validators.required],
      // noofapprovers: [data.noofapprovers, Validators.required],
      // notes: [""],
      // approversArray: this.fb.array([]),
    });
    if (this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[0]) {
      this.serviceRequestForm.addControl('ha', this.fb.control(data.ha, Validators.required));
      // this.serviceRequestForm.addControl('description', this.fb.control(data.description, Validators.required));
      this.serviceRequestForm.addControl('estimatedcost', this.fb.control(data.estimatedcost, Validators.required));
      this.serviceRequestForm.addControl('setupcost', this.fb.control(data.setupcost, Validators.required));
      this.serviceRequestForm.addControl('runningcost', this.fb.control(data.runningcost, Validators.required));
      this.serviceRequestForm.addControl('othercost', this.fb.control(data.othercost, Validators.required));
      this.serviceRequestForm.addControl('autodeployyn', this.fb.control(data.autodeployyn, Validators.required));
    }
    if (data.catalogimage) {
      this.servicefile = data.catalogimage;
      this.catalogdownload =
        this.commonService.getFileType(this.servicefile) === true
          ? true
          : false;
    }
    if (data.catalogola) {
      this.olafile = data.catalogola;
      this.oladownload =
        this.commonService.getFileType(this.olafile) === true ? true : false;
    }
    if (data.archdiagram) {
      this.archfile = data.archdiagram;
      this.archdownload =
        this.commonService.getFileType(this.archfile) === true ? true : false;
    }
    if (data.noofapprovers > 0) {
      this.approvalLvlChange(data.noofapprovers);
    }
  }
  inputClearValidators(){
    this.serviceRequestForm.controls["ha"].clearValidators();
    // this.serviceRequestForm.controls["description"].clearValidators();
    this.serviceRequestForm.controls["estimatedcost"].clearValidators();
    this.serviceRequestForm.controls["setupcost"].clearValidators();
    this.serviceRequestForm.controls["runningcost"].clearValidators();
    this.serviceRequestForm.controls["othercost"].clearValidators();
    this.serviceRequestForm.controls["autodeployyn"].clearValidators();

    Object.keys(this.serviceRequestForm.controls).forEach(key => {
      this.serviceRequestForm.controls[key].updateValueAndValidity();
    });
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
      this.isOrchestration = false;
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
      this.isOrchestration= false;
      this.isWorkpack= false;
      this.isCICD = false;
      break;
  }
}
  getCatalogDetails() {
    this.srmService.getByIdCatalog(this.catalogid).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.catalogObj = response.data;
        if (this.catalogObj.noofapprovers > 0) {
          this.catalogObj.srmcatalogaprvr = _.filter(
            this.catalogObj.srmcatalogaprvr,
            { status: "Active" }
          );
        }
        this.generateEditForm(response.data);
      }
    });
  }
  closeSummary(event) {
    this.showSummary = event;
  }
  getWorkflowApproverList() {
    let requestObj : any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    }
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[0]){
      requestObj.module = AppConstant.REQUEST_REFERENCE_TYPES[0];
    }
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[1]){
      requestObj.module = AppConstant.REQUEST_REFERENCE_TYPES[1];
    }
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[2]){
      requestObj.module = AppConstant.REQUEST_REFERENCE_TYPES[2];
    }
    if(this.referencetype == AppConstant.REQUEST_REFERENCE_TYPES[3]){
      requestObj.module = AppConstant.REQUEST_REFERENCE_TYPES[3];
    }
    this.workpackWorkflowService
      .allWorkflow(requestObj)
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
    })
  }
  showWorkflowSummary() {
    this.operationMode = "WKPACK_VIEW";
    this.showWorkflow = true;
  }
  closeModal(): void {
    switch (this.referencetype) {
      case AppConstant.REQUEST_REFERENCE_TYPES[0]:
        this.router.navigate(["/solutiontemplate"]);
        break;
        case AppConstant.REQUEST_REFERENCE_TYPES[1]:
        this.router.navigate(["/orchestration"])
        break;
        case AppConstant.REQUEST_REFERENCE_TYPES[2]:
          this.router.navigate([`/workpackmanager`],{ queryParams: { modelcrn: this.workpackName.data[1].crn } });
        break;
        case AppConstant.REQUEST_REFERENCE_TYPES[3]:
        this.router.navigate(["/cicd/releases"])
        break;
      default:
       break;
      }
  }
}
