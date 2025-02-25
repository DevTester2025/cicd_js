import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { Ecl2Service } from "../../ecl2-service";
@Component({
  selector: "app-globalip",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/internetgateway/globalip/globalip.component.html",
})
export class GlobalipComponent implements OnInit, OnChanges {
  @Input() globalIpObj: any;
  @Input() inputdisabled: boolean;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  globalIpForm: FormGroup;
  globalIpList: any = [];
  loading = false;
  disabled = false;
  formdata: any = {};
  index: any;
  globalipEditObj: any = {};
  globalipErrObj = {
    globalipname: AppConstant.VALIDATIONS.ECL2.GLOBALIP.GLOBALIPNAME,
    description: AppConstant.VALIDATIONS.ECL2.GLOBALIP.DESCRIPTION,
  };
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.clearForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.globalIpObj) &&
      !_.isEmpty(changes.globalIpObj.currentValue) &&
      !_.isEmpty(changes.globalIpObj.currentValue.ecl2igglobalip)
    ) {
      this.clearForm();
      this.globalIpList = [...changes.globalIpObj.currentValue.ecl2igglobalip];
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
    } else {
      this.clearForm();
      this.globalIpList = [];
      this.globalIpObj = changes.globalIpObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.globalIpForm = this.fb.group({
      globalipname: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      submasklength: [32, Validators.required],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.globalipEditObj = {};
  }
  editInterface(data) {
    this.globalipEditObj = data;
    this.index = this.globalIpList.indexOf(data);
    this.globalIpForm = this.fb.group({
      globalipname: [
        data.globalipname,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      submasklength: [data.submasklength, Validators.required],
      description: [
        data.description,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.globalIpForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.globalIpForm,
        this.globalipErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        globalipname: data.globalipname,
        internetgatewayid: this.globalIpObj.internetgatewayid,
        ecl2internetgatewayid: this.globalIpObj.ecl2internetgatewayid,
        submasklength: data.submasklength,
        description: data.description,
        zoneid: this.globalIpObj.ecl2zones.zoneid,
        customerid: this.globalIpObj.customer.customerid,
        ecl2tenantid: this.globalIpObj.customer.ecl2tenantid,
        region: this.globalIpObj.ecl2zones.region,
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.globalipEditObj) &&
        !_.isUndefined(this.globalipEditObj.igglobalipid) &&
        !_.isEmpty(this.globalipEditObj)
      ) {
        this.formdata.igglobalipid = this.globalipEditObj.igglobalipid;
        this.formdata.ecl2igglobalipid = this.globalipEditObj.ecl2igglobalipid;
        this.ecl2Service
          .updateecl2igglobalip(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.globalIpList[this.index] = response.data;
              this.globalIpList = _.filter(this.globalIpList, function (i) {
                return i;
              });
              this.loading = false;
              this.disabled = false;
              this.messageService.success(response.message);
            } else {
              this.loading = false;
              this.disabled = false;
              this.notificationService.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          });
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service
          .createecl2igglobalip(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.globalIpList = [...this.globalIpList, response.data];
              this.loading = false;
              this.disabled = false;
              this.messageService.success(response.message);
            } else {
              this.loading = false;
              this.disabled = false;
              this.notificationService.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          });
      }
    }
  }

  deleteInterface(data) {
    this.loading = true;
    this.disabled = true;
    const formdata = {
      tenantid: this.userstoragedata.tenantid,
      igglobalipid: data.igglobalipid,
      region: this.globalIpObj.ecl2zones.region,
      ecl2tenantid: this.globalIpObj.customer.ecl2tenantid,
      ecl2igglobalipid: data.ecl2igglobalipid,
      status: AppConstant.STATUS.DELETED,
    };
    this.ecl2Service.deleteecl2igglobalip(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.clearForm();
        this.globalIpList.splice(this.globalIpList.indexOf(data), 1);
        this.globalIpList = [...this.globalIpList];
        this.loading = false;
        this.disabled = false;
        this.messageService.success(response.message);
      } else {
        this.loading = false;
        this.disabled = false;
        this.notificationService.error("Error", response.message, {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }
}
