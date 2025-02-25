import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { AlibabaService } from "../../alibaba-service";
@Component({
  selector: "app-cloudmatiq-ali-add-edit-vpc",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/vpc/add-edit-vpc/add-edit-vpc.component.html",
})
export class ALIAddEditVpcComponent implements OnInit, OnChanges {
  @Input() vpcObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  vpcForm: FormGroup;
  userstoragedata = {} as any;
  regionList: any = [];
  loading = false;
  disabled = false;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  vpcErrObj = {
    vpcname: AppConstant.VALIDATIONS.ALIBABA.VPC.VPCNAME,
    awsvpcid: AppConstant.VALIDATIONS.ALIBABA.VPC.VPCID,
    ipv4cidr: AppConstant.VALIDATIONS.ALIBABA.VPC.CIDR,
    region: AppConstant.VALIDATIONS.ALIBABA.VPC.REGION,
    notes: AppConstant.VALIDATIONS.ALIBABA.VPC.NOTES,
  };
  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private alibabaService: AlibabaService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getRegionList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.vpcObj) &&
      !_.isEmpty(changes.vpcObj.currentValue)
    ) {
      this.vpcObj = changes.vpcObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.vpcObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.vpcForm = this.fb.group({
      vpcname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      alivpcid: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      ipv4cidr: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ]),
      ],
      region: ["", Validators.required],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [true],
    });
    this.vpcObj = {};
  }
  getRegionList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.ALI_REGION,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.regionList = response.data;
        } else {
          this.regionList = [];
        }
      });
  }
  generateEditForm(data) {
    this.vpcForm = this.fb.group({
      vpcname: [
        data.vpcname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      alivpcid: [
        data.alivpcid,
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      ipv4cidr: [data.ipv4cidr, Validators.compose([Validators.required])],
      region: [data.region, Validators.required],
      notes: [
        data.notes,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }
  saveUpdateVpc(data) {
    let errorMessage: any;
    this.loading = true;
    this.disabled = true;
    if (this.vpcForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.vpcForm,
        this.vpcErrObj
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
      !_.isUndefined(this.vpcObj) &&
      !_.isUndefined(this.vpcObj.vpcid) &&
      !_.isEmpty(this.vpcObj)
    ) {
      data.vpcid = this.vpcObj.vpcid;
      this.alibabaService.updatevpc(data).subscribe(
        (result) => {
          this.loading = false;
          this.disabled = false;
          response = JSON.parse(result._body);
          if (response.status) {
            this.notifyNewEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error(AppConstant.VALIDATIONS.UPDATEERRMSG);
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      this.alibabaService.createvpc(data).subscribe(
        (result) => {
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
        },
        (err) => {
          this.messageService.error(AppConstant.VALIDATIONS.ADDERRMSG);
        }
      );
    }
  }
}
