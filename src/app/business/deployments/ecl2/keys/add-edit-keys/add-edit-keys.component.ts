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
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AppConstant } from "../../../../../app.constant";
import { Ecl2Service } from "../../ecl2-service";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-keys",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/keys/add-edit-keys/add-edit-keys.component.html",
})
export class ECL2AddEditKeysComponent implements OnInit, OnChanges {
  @Input() keyObj: any;
  @Output() notifyKeysEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  keyErrObj = {
    keyname: AppConstant.VALIDATIONS.ECL2.KEY.KEYNAME,
    publickey: AppConstant.VALIDATIONS.ECL2.KEY.PUBLICKEY,
  };
  keyForm: FormGroup;
  zoneObj: any = {};
  loading = false;
  disabled = false;
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private notificationService: NzNotificationService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (_.isUndefined(this.keyObj) || _.isEmpty(this.keyObj)) {
      this.clearForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.keyObj) &&
      !_.isEmpty(changes.keyObj.currentValue) &&
      !_.isUndefined(changes.keyObj.currentValue.keyid)
    ) {
      this.keyObj = changes.keyObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.keyObj);
    } else {
      this.clearForm();
      this.keyObj = changes.keyObj.currentValue;
      this.zoneObj = !_.isUndefined(changes.keyObj.currentValue.zone.zoneid)
        ? changes.keyObj.currentValue.zone
        : {};
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.keyForm = this.fb.group({
      keyname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      publickey: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: ["Active"],
    });
    this.keyObj = {};
  }

  saveUpdateKeys(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.keyForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.keyForm,
        this.keyErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      this.disabled = false;
      this.loading = false;
      return false;
    }
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    data.zoneid = !_.isEmpty(this.zoneObj)
      ? this.zoneObj.zoneid
      : this.keyObj.zoneid;
    data.region = !_.isEmpty(this.zoneObj)
      ? this.zoneObj.region
      : this.keyObj.ecl2zones.region;
    data.ecl2tenantid = !_.isEmpty(this.keyObj.client)
      ? this.keyObj.client.ecl2tenantid
      : this.keyObj.customer.ecl2tenantid;
    data.customerid = !_.isEmpty(this.keyObj.client)
      ? this.keyObj.client.customerid
      : this.keyObj.customer.customerid;
    if (
      !_.isEmpty(this.keyObj) &&
      this.keyObj.keyid != null &&
      this.keyObj.keyid !== undefined
    ) {
      data.keyid = this.keyObj.keyid;
      this.ecl2Service.updateecl2keypair(data).subscribe((result) => {
        this.loading = false;
        this.disabled = false;
        response = JSON.parse(result._body);
        if (response.status) {
          response.data.customer = this.keyObj.customer;
          response.data.ecl2zones = this.zoneObj;
          this.notifyKeysEntry.next(response.data);
          this.messageService.success(response.message);
        } else {
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
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.ecl2Service.createecl2keypair(data).subscribe((result) => {
        this.loading = false;
        this.disabled = false;
        response = JSON.parse(result._body);
        if (response.status) {
          response.data.ecl2zones = this.zoneObj;
          response.data.customer = this.keyObj.client;
          this.notifyKeysEntry.next(response.data);
          this.clearForm();
          this.messageService.success(response.message);
        } else {
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
  generateEditForm(data) {
    this.keyForm = this.fb.group({
      keyname: [data.keyname, Validators.required],
      publickey: [data.publickey],
      status: [data.status],
    });
  }
}
