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
import { AWSService } from "../../aws-service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AppConstant } from "../../../../../app.constant";

@Component({
  selector: "app-cloudmatiq-key-add-edit",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/keys/add-edit-keys/key-add-edit.component.html",
})
export class KeysAddEditComponent implements OnInit, OnChanges {
  @Input() keyObj: any;
  @Output() notifyKeysEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  keyErrObj = {
    keyname: AppConstant.VALIDATIONS.AWS.AWSKEYS.KEYNAME,
  };
  keyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private awsService: AWSService,
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
      !_.isEmpty(changes.keyObj.currentValue)
    ) {
      this.keyObj = changes.keyObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.keyObj);
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
      status: ["Active"],
    });
    this.keyObj = {};
  }

  saveUpdateKeys(data) {
    let errorMessage: any;
    if (this.keyForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.keyForm,
        this.keyErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (
      !_.isEmpty(this.keyObj) &&
      this.keyObj.keyid != null &&
      this.keyObj.keyid != undefined
    ) {
      data.keyid = this.keyObj.keyid;
      this.awsService.updateawskeys(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.notifyKeysEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add key group. Try again");
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.awsService.createawskeys(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.notifyKeysEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add key. Try again");
        }
      );
    }
  }
  generateEditForm(data) {
    this.keyForm = this.fb.group({
      keyname: [data.keyname, Validators.required],
      status: [data.status],
    });
  }
}
