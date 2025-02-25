import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { DeploymentsService } from "../../../deployments.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-add-edit-ami",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/ami/add-edit-ami/add-edit-ami.component.html",
})
export class AmiAddEditComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() amiObj: any;
  @Output() notifyAmiEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  amiForm: FormGroup;
  formdata: any = {};
  buttonText: any;
  edit = false;
  platformList = [];
  amiErrObj = {
    aminame: AppConstant.VALIDATIONS.AWS.AWSAMI.AMINAME,
    awsamiid: AppConstant.VALIDATIONS.AWS.AWSAMI.AMIID,
    platform: AppConstant.VALIDATIONS.AWS.AWSAMI.PLATFORM,
    notes: AppConstant.VALIDATIONS.AWS.AWSAMI.NOTES,
  };
  loading = false;
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private deploymentsService: DeploymentsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    this.amiForm = this.fb.group({
      aminame: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      awsamiid: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      platform: ["", Validators.required],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [""],
    });
  }
  ngOnInit() {
    this.getAllPlatForms();
  }
  clearForm() {
    this.amiForm.reset();
    this.amiObj = {};
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.amiObj) &&
      !_.isEmpty(changes.amiObj.currentValue)
    ) {
      this.amiObj = changes.amiObj.currentValue;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.amiObj);
    } else {
      this.edit = false;
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  generateEditForm(data) {
    this.amiForm = this.fb.group({
      aminame: [
        this.amiObj.aminame,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      awsamiid: [
        this.amiObj.awsamiid,
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      platform: [this.amiObj.platform, Validators.required],
      notes: [
        this.amiObj.notes,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [this.amiObj.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }
  getAllPlatForms() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      lookupkey: "PLATFORM",
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.platformList = response.data;
      } else {
        this.platformList = [];
      }
    });
  }
  saveOrUpdate(data) {
    let errorMessage: any;
    if (this.amiForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.amiForm,
        this.amiErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.loading = true;
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        aminame: data.aminame,
        awsamiid: !_.isEmpty(data.awsamiid) ? data.awsamiid : "",
        platform: data.platform,
        notes: !_.isEmpty(data.notes) ? data.notes : "",
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.DELETED,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.amiObj) &&
        !_.isUndefined(this.amiObj.amiid) &&
        !_.isEmpty(this.amiObj)
      ) {
        this.formdata.amiid = this.amiObj.amiid;
        this.deploymentsService.updateami(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.loading = false;
          if (response.status) {
            this.notifyAmiEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.message.success(response.message);
          }
        });
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.deploymentsService.createami(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.clearForm();
            this.notifyAmiEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
      }
    }
  }
}
