import { Component, OnInit, TemplateRef } from "@angular/core";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { SrmService } from "../../srm.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { NzNotificationService } from "ng-zorro-antd";
@Component({
  selector: "app-srm-progress-catalog",
  templateUrl:
    "../../../../presentation/web/srm/catalog-request/progress-update/progress-update.component.html",
})
export class SRMProgressRequestComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  catalogList = [];
  statusList = [];
  catalogObj = {} as any;
  userstoragedata: any = {};
  serviceRequestForm: FormGroup;
  srvrequestid: any;
  catalogdownload = false;
  oladownload = false;
  archdownload = false;
  serviceObj = {} as any;
  serviceRequestErrObj = {
    expecteddt: { required: "Please select expected date for delivery" },
    srstatus: { required: "Please select the status" },
    notes: { required: "Please enter notes" },
  };
  previewVisible = false;
  previewTitle = "";
  previewImage: any;
  screens = [];
  appScreens = {} as any;
  deployFlag = false;
  isApproved = false;
  isApprover = false;
  approverData = {} as any;
  approverChain = [];
  constructor(
    private router: Router,
    private srmService: SrmService,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private notification: NzNotificationService,
    private routes: ActivatedRoute
  ) {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.srvrequestid = params.id;
        this.getServiceDetails();
      }
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.serviceRequestForm = this.fb.group({
      notes: ["", Validators.required],
      expecteddt: [null, Validators.required],
      srstatus: ["", Validators.required],
      progresspercent: [],
    });
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, { screencode: "005" });
    if (_.includes(this.appScreens.actions, "Deploy")) {
      this.deployFlag = true;
    }
  }

  ngOnInit() {
    this.getLookupLists();
  }
  getLookupLists() {
    this.commonService
      .allLookupValues({ status: "Active", lookupkey: "SRSTATUS",tenantid: this.userstoragedata.tenantid, })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.statusList = response.data;
          }
        },
        (err) => {
          this.messageService.error("Sorry! Something gone wrong");
        }
      );
  }
  updateCatalog(data) {
    let errorMessage: any;
    let formdata = {} as any;
    if (this.serviceRequestForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.serviceRequestForm,
        this.serviceRequestErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.lastupdateddt = new Date();
    // formdata.notes = data.notes;
    formdata.srstatus = data.srstatus;
    formdata.expecteddt = data.expecteddt;
    formdata.progresspercent = data.progresspercent;
    formdata.srvrequestid = Number(this.srvrequestid);
    formdata.srmsractions = [
      {
        srvrequestid: Number(this.srvrequestid),
        actiontype: "Progress",
        fromuserid: this.userstoragedata.userid,
        srstatus: data.srstatus,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      },
    ];
    // if (this.userstoragedata.roles.rolename == "ops_generic") {
    //   formdata.srmsractions[0].notes = data.notes;
    // }
    this.srmService.updateService(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        const url = this.routes.snapshot.queryParams.url;
        switch (url) {
          case "inbox":
            this.router.navigate(["srm/inbox"]);
            break;
          default:
            this.router.navigate(["srm"]);
        }
      } else {
        this.messageService.error(response.message);
      }
    });
  }

  getServiceDetails() {
    this.srmService.byId(this.srvrequestid).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.serviceObj = response.data;
        this.catalogObj = response.data.catalog;
        if (this.catalogObj.noofapprovers > 0) {
          this.approverChain = _.filter(
            response.data.srmsractions,
            function (item) {
              if (item.touserid != null) {
                return item;
              }
            }
          );
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
        this.readyToDeploy();
        this.generateServiceEditForm(response.data);
      }
    });
  }
  generateServiceEditForm(data) {
    this.serviceRequestForm = this.fb.group({
      notes: ["", Validators.required],
      expecteddt: [data.expecteddt, Validators.required],
      srstatus: [data.srstatus, Validators.required],
      progresspercent: [data.progresspercent],
    });
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

  readyToDeploy() {
    let nonapprovalData = {} as any;
    if (this.catalogObj.approvalyn == "Y") {
      nonapprovalData = _.find(this.serviceObj.srmsractions, {
        apprvstatus: AppConstant.STATUS.PENDING,
      });
      if (nonapprovalData == undefined) {
        this.isApproved = true;
      }
    } else if (this.catalogObj.autodeployyn == "Y") {
      this.isApproved = true;
    }
    if (
      this.catalogObj.autodeployyn == "N" &&
      this.catalogObj.approvalyn == "N" 
    ) {
      this.deployFlag = true;
      this.isApproved = true;
    }
  }
}
