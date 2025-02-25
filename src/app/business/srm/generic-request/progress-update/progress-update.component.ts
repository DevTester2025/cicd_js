import { Component, OnInit } from "@angular/core";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { SrmService } from "../../srm.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
@Component({
  selector: "app-progress-update",
  templateUrl:
    "../../../../presentation/web/srm/generic-request/progress-update/progress-update.component.html",
})
export class ProgressUpdateComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  userstoragedata: any;
  srvrequestid: any;
  statusList = [];
  genericReqForm: FormGroup;
  genericObj: any = {};
  formdata: any = {};
  genericReqErrObj = {
    srstatus: { required: "Please select the status" },
    notes: { required: "Please enter notes" },
  };
  constructor(
    private router: Router,
    private srmService: SrmService,
    private routes: ActivatedRoute,
    private fb: FormBuilder,
    private commonService: CommonService,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.srvrequestid = params.id;
        this.getServiceDetails(this.srvrequestid);
      }
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.genericReqForm = this.fb.group({
      notes: ["", Validators.required],
      srstatus: ["", Validators.required],
      progresspercent: [],
    });
  }

  ngOnInit() {
    this.getLookupLists();
  }
  getLookupLists() {
    this.commonService
      .allLookupValues({ status: "Active", lookupkey: "SRSTATUS",tenantid: this.userstoragedata.tenantid })
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
  updateDetails(data) {
    let errorMessage: any;
    if (this.genericReqForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.genericReqForm,
        this.genericReqErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    this.formdata.lastupdatedby = this.userstoragedata.fullname;
    this.formdata.lastupdateddt = new Date();
    this.formdata.notes = data.notes;
    this.formdata.srstatus = data.srstatus;
    this.formdata.expecteddt = data.expecteddt;
    this.formdata.progresspercent = data.progresspercent;
    this.formdata.srvrequestid = Number(this.srvrequestid);
    this.formdata.srmsractions = [
      {
        srvrequestid: Number(this.srvrequestid),
        actiontype: "Progress",
        fromuserid: this.userstoragedata.userid,
        srstatus: data.srstatus,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      },
    ];
    this.srmService.updateService(this.formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.router.navigate(["/srm"]);
      } else {
        this.messageService.error(response.message);
      }
    });
  }
  getServiceDetails(id) {
    this.srmService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.genericObj = response.data;
        this.viewDetails(this.genericObj);
      } else {
        this.genericObj = {};
      }
    });
  }
  viewDetails(data) {
    this.genericReqForm = this.fb.group({
      notes: [data.notes, Validators.required],
      srstatus: [data.srstatus, Validators.required],
      progresspercent: [data.progresspercent],
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
}
