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
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AlibabaService } from "../../../alibaba/alibaba-service";
import * as _ from "lodash";

@Component({
  selector: "app-cloudmatiq-ali-add-edit-image",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/image/add-edit-image/add-edit-image.component.html",
})
export class ALIAddEditImageComponent implements OnInit, OnChanges {
  @Input() imageObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  imageForm: FormGroup;
  formdata: any = {};
  buttonText: any = AppConstant.BUTTONLABELS.SAVE;
  edit = false;
  platformList = [];
  zoneList: any = [];
  imageErrObj = {
    imagename: AppConstant.VALIDATIONS.ALIBABA.IMAGE.IMAGENAME,
    aliimageid: AppConstant.VALIDATIONS.ALIBABA.IMAGE.ALIIMAGEID,
    zoneid: AppConstant.VALIDATIONS.ALIBABA.IMAGE.ZONE,
    platform: AppConstant.VALIDATIONS.ALIBABA.IMAGE.PLATFORM,
    notes: AppConstant.VALIDATIONS.ALIBABA.IMAGE.NOTES,
  };
  loading = false;
  disabled = false;
  constructor(
    private localStorageService: LocalStorageService,
    private notificationService: NzNotificationService,
    private commonService: CommonService,
    private alibabaService: AlibabaService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.getAllPlatForms();
    this.getZoneList();
  }
  clearForm() {
    this.imageForm = this.fb.group({
      imagename: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      aliimageid: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [null, Validators.required],
      platform: [null, Validators.required],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [""],
    });
    this.imageObj = {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.imageObj) &&
      !_.isEmpty(changes.imageObj.currentValue) &&
      !_.isUndefined(changes.imageObj.currentValue.imageid)
    ) {
      this.imageObj = changes.imageObj.currentValue;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.imageObj);
    } else {
      this.edit = false;
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  generateEditForm(data) {
    this.imageForm = this.fb.group({
      imagename: [
        this.imageObj.imagename,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      aliimageid: [
        this.imageObj.aliimageid,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [this.imageObj.zoneid, Validators.required],
      platform: [this.imageObj.platform, Validators.required],
      notes: [
        this.imageObj.notes,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [
        this.imageObj.status === AppConstant.STATUS.ACTIVE ? true : false,
      ],
    });
  }
  getZoneList() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.alibabaService.allzones(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.zoneList = response.data;
      } else {
        this.zoneList = [];
      }
    });
  }
  getAllPlatForms() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      lookupkey: AppConstant.LOOKUPKEY.PLATFORM,
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
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.imageForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.imageForm,
        this.imageErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        imagename: data.imagename,
        aliimageid: data.aliimageid,
        zoneid: data.zoneid,
        platform: data.platform,
        notes: data.notes,
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.imageObj) &&
        !_.isUndefined(this.imageObj.imageid) &&
        !_.isEmpty(this.imageObj)
      ) {
        this.formdata.imageid = this.imageObj.imageid;
        this.alibabaService.updateimage(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.loading = false;
          this.disabled = false;
          if (response.status) {
            this.notifyNewEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.alibabaService.createimage(this.formdata).subscribe((res) => {
          this.loading = false;
          this.disabled = false;
          const response = JSON.parse(res._body);
          if (response.status) {
            this.notifyNewEntry.next(response.data);
            this.clearForm();
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
      }
    }
  }
}
