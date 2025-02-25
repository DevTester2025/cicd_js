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
  selector: "app-staticip",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/internetgateway/staticip/staticip.component.html",
})
export class StaticipComponent implements OnInit, OnChanges {
  @Input() inputdisabled: boolean;
  @Input() staticIpObj: any;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  staticIpForm: FormGroup;
  staticIpList: any = [];
  loading = false;
  disabled = false;
  formdata: any = {};
  index: any;
  staticipEditObj: any = {};
  servicetypeList: any = [];
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
    this.getServiceTypeList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.staticIpObj) &&
      !_.isEmpty(changes.staticIpObj.currentValue) &&
      !_.isEmpty(changes.staticIpObj.currentValue.ecl2igstaticip)
    ) {
      this.clearForm();
      this.staticIpList = [...changes.staticIpObj.currentValue.ecl2igstaticip];
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
    } else {
      this.clearForm();
      this.staticIpList = [];
      this.staticIpObj = changes.staticIpObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.staticIpForm = this.fb.group({
      staticipname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      destination: ["", Validators.required],
      nexthop: ["", Validators.required],
      servicetype: [null, Validators.required],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.staticipEditObj = {};
  }
  getServiceTypeList() {
    const condition = {
      lookupkey: AppConstant.LOOKUPKEY.GATEWAYSERVICETYPE,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.servicetypeList = response.data;
      } else {
        this.servicetypeList = [];
      }
    });
  }
  editInterface(data) {
    this.staticipEditObj = data;
    this.index = this.staticIpList.indexOf(data);
    this.staticIpForm = this.fb.group({
      staticipname: [
        data.staticipname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      destination: [data.destination, Validators.required],
      nexthop: [data.nexthop, Validators.required],
      servicetype: [data.servicetype],
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
    if (this.staticIpForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.staticIpForm,
        this.globalipErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        staticipname: data.staticipname,
        internetgatewayid: this.staticIpObj.internetgatewayid,
        ecl2internetgatewayid: this.staticIpObj.ecl2internetgatewayid,
        destination: data.destination,
        nexthop: data.nexthop,
        servicetype: data.servicetype,
        description: data.description,
        zoneid: this.staticIpObj.ecl2zones.zoneid,
        region: this.staticIpObj.ecl2zones.region,
        ecl2tenantid: this.staticIpObj.customer.ecl2tenantid,
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.staticipEditObj) &&
        !_.isUndefined(this.staticipEditObj.igstaticipid) &&
        !_.isEmpty(this.staticipEditObj)
      ) {
        this.formdata.igstaticipid = this.staticipEditObj.igstaticipid;
        this.formdata.ecl2igstaticipid = this.staticipEditObj.ecl2igstaticipid;
        this.ecl2Service
          .updateecl2igstaticip(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.staticIpList[this.index] = response.data;
              this.staticIpList = _.filter(this.staticIpList, function (i) {
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
          .createecl2igstaticip(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.staticIpList = [...this.staticIpList, response.data];
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
      igstaticipid: data.igstaticipid,
      region: this.staticIpObj.ecl2zones.region,
      ecl2tenantid: this.staticIpObj.customer.ecl2tenantid,
      ecl2igstaticipid: data.ecl2igstaticipid,
      status: AppConstant.STATUS.DELETED,
    };
    this.ecl2Service.deleteecl2igstaticip(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.clearForm();
        this.staticIpList.splice(this.staticIpList.indexOf(data), 1);
        this.staticIpList = [...this.staticIpList];
        this.loading = false;
        this.disabled = false;
        this.messageService.success(response.message);
        this.clearForm();
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
