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
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AlibabaService } from "../../alibaba-service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AppConstant } from "../../../../../app.constant";
@Component({
  selector: "app-cloudmatiq-ali-add-edit-keypair",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/keypair/add-edit-keypair/add-edit-keypair.component.html",
})
export class ALIAddEditKeypairComponent implements OnInit, OnChanges {
  @Input() keypairObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  keyErrObj = {
    keyname: AppConstant.VALIDATIONS.ALIBABA.KEYPAIR.KEYNAME,
  };
  keyForm: FormGroup;
  disabled = false;
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

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.keypairObj) &&
      !_.isEmpty(changes.keypairObj.currentValue)
    ) {
      this.keypairObj = changes.keypairObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.keypairObj);
    } else {
      this.clearForm();
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
      status: [true],
    });
    this.keypairObj = {};
  }
  generateEditForm(data) {
    this.keyForm = this.fb.group({
      keyname: [
        data.keyname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }

  saveUpdateKeys(data) {
    let errorMessage: any;
    this.disabled = true;
    if (this.keyForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.keyForm,
        this.keyErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let response = {} as any;
    data.status =
      data.status === true
        ? AppConstant.STATUS.ACTIVE
        : AppConstant.STATUS.INACTIVE;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (!_.isEmpty(this.keypairObj) && !_.isUndefined(this.keypairObj.keyid)) {
      data.keyid = this.keypairObj.keyid;
      this.alibabaService.updatekey(data).subscribe(
        (result) => {
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
          this.disabled = false;
          this.messageService.error(AppConstant.VALIDATIONS.UPDATEERRMSG);
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.alibabaService.createkey(data).subscribe(
        (result) => {
          this.disabled = false;
          response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.notifyNewEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.disabled = false;
          this.messageService.error(AppConstant.VALIDATIONS.ADDERRMSG);
        }
      );
    }
  }
}
