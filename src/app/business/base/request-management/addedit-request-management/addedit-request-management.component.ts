import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { requestManagementService } from "../request-management.service";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import * as _ from "lodash";
import { UsersService } from "src/app/business/admin/users/users.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { IResourceType } from "src/app/modules/interfaces/assetrecord.interface";

@Component({
  selector: "app-addedit-request-management",
  templateUrl: "./addedit-request-management.component.html",
  styleUrls: ["./addedit-request-management.component.css"],
})
export class AddeditRequestManagementComponent implements OnInit {
  @Input() requestObj: any;
  @Output() notifyRequestEntry: EventEmitter<any> = new EventEmitter();
  requestForm: FormGroup;
  userstoragedata: any;
  requestList: any[] = [];
  resourceDetails: any;
  userdata: any[] = [];
  approverLevels: any = [];
  reqstid: Number;
  request_type = AppConstant.REQUEST_TYPE;
  priority = AppConstant.SYSTEM;
  status = AppConstant.REQUEST_STATUS;
  usersList: any[];
  resourceTypesList: IResourceType[] = [];
  id: any;
  temptabIndex = 0;
  labelParams: any[] = [];
  approversArray: FormArray;
  userid: any;
  constructor(
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private requestservice: requestManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UsersService,
    private assetRecordService: AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.route.params.subscribe((obs) => {
      if (obs["id"]) {
        this.id = obs["id"];
        this.getRequestById();
      }
    });
  }
  ngOnInit() {
    this.clearForm();
    this.getUserList();
    this.getResourceType();
  }
  clearForm() {
    this.requestForm = this.fb.group({
      type: [null, Validators.required],
      priority: [null, Validators.required],
      labels: [""],
      customer_notes: [null, Validators.required],
      environment: [null, Validators.required],
      description: [""],
      assignee: [null, Validators.required],
      reporter: [null, Validators.required],
      resolution_notes: [null, Validators.required],
      noofapprovers: [0, Validators.required],
      approversArray: this.fb.array([]),
    });
    this.requestObj = {};
  }
  close() {
    this.router.navigate([`request-management`]);
  }
  approvalLvlChange(event) {
    this.labelParams = [];
    this.approversArray = this.requestForm.get("approversArray") as FormArray;
    this.approversArray = new FormArray([]);
    this.requestForm.controls["approversArray"] = new FormArray([]);
    const approvers = event;
    for (let i = 0; i < approvers; i++) {
      let data = {} as any;
      data = {
        userid: 0,
        index: i,
      };
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
    if (this.reqstid) {
      arrayObj.reqstid = Number(this.reqstid);
    }
    if (data.userid) {
      arrayObj.userid = [data.userid, Validators.required];
      arrayObj.approvid = data.approvid;
    } else {
      arrayObj.userid = [0, Validators.required];
    }
    return this.fb.group(arrayObj);
  }
  addArrayItem(data, i): void {
    this.approversArray = this.requestForm.get("approversArray") as FormArray;
    this.approversArray.push(this.createArrayItem(data, i));
    data.label = "userid";
    this.labelParams.push(data);
  }
  saveRequest() {
    console.log("requestForm", this.requestForm);
    let response = {} as any;
    if (this.id != null && this.id != undefined) {
      let updateObj: any = {};
      updateObj.reqstid = parseInt(this.id);
      (updateObj.lastupdatedby = this.userstoragedata.fullname),
        (updateObj.lastupdateddt = new Date()),
        (updateObj.type = this.requestForm.value.type),
        (updateObj.priority = this.requestForm.value.priority),
        (updateObj.labels = this.requestForm.value.labels),
        // (updateObj.assignee = this.requestForm.value.assignee),
        (updateObj.noofapprovers = this.requestForm.value.noofapprovers),
        (updateObj.reporter = this.requestForm.value.reporter),
        // (updateObj.approvalStatus = this.requestForm.value.approvalStatus),
        (updateObj.customer_notes = this.requestForm.value.customer_notes),
        (updateObj.resolution_notes = this.requestForm.value.resolution_notes),
        (updateObj.environment = this.requestForm.value.environment),
        (updateObj.description = this.requestForm.value.description),
        (updateObj.tenantid = this.userstoragedata.tenantid),
        this.requestservice.update(updateObj).subscribe((res: any) => {
          if (res.status) {
            this.message.success("Updated successfully");
            this.router.navigate(["request-management"]);
          }
        });
    } else {
      const userData = this.requestForm.get("approversArray").value;

      userData.forEach((data, index) => {
        this.approverLevels.push({
          userid: data.userid,
          tenantid: this.userstoragedata.tenantid,
          approverlevel: index + 1,
          status: AppConstant.STATUS.ACTIVE,
          lastupdateddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
        });
      });

      let data = {
        type: this.requestForm.controls["type"].value,
        priority: this.requestForm.controls["priority"].value,
        labels: this.requestForm.controls["labels"].value,
        customer_notes: this.requestForm.controls["customer_notes"].value,
        environment: this.requestForm.controls["environment"].value,
        description: this.requestForm.controls["description"].value,
        assignee: this.requestForm.controls["assignee"].value,
        // approvalStatus: this.requestForm.controls["approvalStatus"].value,
        noofapprovers: this.requestForm.controls["noofapprovers"].value,
        reporter: this.requestForm.controls["reporter"].value,
        tenantid: this.userstoragedata.tenantid,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        status: AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),

        RequestManagementApprover: this.approverLevels,
      };

      this.requestservice.create(data).subscribe((result) => {
        response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.clearForm();
          this.notifyRequestEntry.emit(response.data);
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  getRequestById() {
    this.requestservice.byId(this.id).subscribe((res) => {
      let data = [] as any;
      const response = JSON.parse(res._body);
      if (response.status) {
        this.requestList = response.data;
        data.push(response.data);
        response.data.crn = "";
        this.requestObj.refid = response.data.reqstid;
        this.requestObj.reftype = "RequestMgmt";
        this.requestForm.patchValue(this.requestList);
      } else {
        this.requestList = [];
        console.error("Error getting request data:");
      }
    });
  }
  tabChanged(e) {
    this.temptabIndex = e.index;
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
          this.usersList = response.data;
        }
      });
  }
  getResourceType() {
    this.assetRecordService
      .getResourceTypes({
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
      })
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesList = _.orderBy(response, ["resource"], ["asc"]);
      });
  }
}
