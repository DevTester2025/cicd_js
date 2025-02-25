import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AlibabaService } from "../../alibaba-service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-ali-add-edit-vswitch",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/vswitch/add-edit-vswitch/add-edit-vswitch.component.html",
})
export class ALIAddEditVswitchComponent implements OnInit, OnChanges {
  @Input() vswitchObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  zoneList: any = [];
  vpcList: any = [];
  loading = false;
  disabled = false;
  vswitchForm: FormGroup;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  vSwitchErrObj = {
    vswitchname: AppConstant.VALIDATIONS.ALIBABA.VSWITCH.VSWITCHNAME,
    alivswitchid: AppConstant.VALIDATIONS.ALIBABA.VSWITCH.VSWITCHID,
    vpcid: AppConstant.VALIDATIONS.ALIBABA.VSWITCH.VPC,
    zoneid: AppConstant.VALIDATIONS.ALIBABA.VSWITCH.ZONE,
    ipv4cidr: AppConstant.VALIDATIONS.ALIBABA.VSWITCH.CIDR,
    notes: AppConstant.VALIDATIONS.ALIBABA.VSWITCH.NOTES,
  };

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private alibabaService: AlibabaService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getZoneList();
    this.getVPCList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.vswitchObj) &&
      !_.isEmpty(changes.vswitchObj.currentValue)
    ) {
      this.vswitchObj = changes.vswitchObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.vswitchObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  getZoneList() {
    this.alibabaService
      .allzones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.zoneList = response.data;
        } else {
          this.zoneList = [];
        }
      });
  }
  getVPCList() {
    this.alibabaService
      .allvpcs({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.vpcList = response.data;
        } else {
          this.vpcList = [];
        }
      });
  }

  clearForm() {
    this.vswitchForm = this.fb.group({
      vswitchname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      alivswitchid: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      vpcid: [null, Validators.required],
      zoneid: [null, Validators.required],
      ipv4cidr: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ]),
      ],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.vswitchObj = {};
  }
  generateEditForm(data) {
    this.vswitchForm = this.fb.group({
      vswitchname: [
        data.vswitchname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      alivswitchid: [
        data.alivswitchid,
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      vpcid: [data.vpcid, Validators.required],
      zoneid: [data.zoneid, Validators.required],
      ipv4cidr: [data.ipv4cidr, Validators.required],
      notes: [
        data.notes,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }

  saveUpdateSubnet(data) {
    let errorMessage: any;
    this.loading = true;
    this.disabled = true;
    if (this.vswitchForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.vswitchForm,
        this.vSwitchErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.status =
      data.status === true
        ? AppConstant.STATUS.ACTIVE
        : AppConstant.STATUS.INACTIVE;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (
      !_.isEmpty(this.vswitchObj) &&
      !_.isUndefined(this.vswitchObj.vswitchid)
    ) {
      data.vswitchid = this.vswitchObj.vswitchid;
      this.alibabaService.updatevswitch(data).subscribe((result) => {
        this.loading = false;
        this.disabled = false;
        response = JSON.parse(result._body);
        if (response.status) {
          this.notifyNewEntry.next(response.data);
          this.messageService.success(response.message);
        } else {
          this.messageService.error(response.message);
        }
      });
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.alibabaService.createvswitch(data).subscribe((result) => {
        this.loading = false;
        this.disabled = false;
        response = JSON.parse(result._body);
        if (response.status) {
          this.notifyNewEntry.next(response.data);
          this.clearForm();
          this.messageService.success(response.message);
        } else {
          this.messageService.error(response.message);
        }
      });
    }
  }
}
