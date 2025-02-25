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
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AlibabaService } from "../../alibaba-service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-ali-add-edit-volume",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/volume/add-edit-volume/add-edit-volume.component.html",
})
export class ALIAddEditVolumeComponent implements OnInit, OnChanges {
  @Input() volumeObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  volumeForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = "";
  volumeErrObj = {};
  formdata: any = {};
  volumeSizeList: any = [];
  zoneObj: any = {};
  loading = false;
  disabled = false;
  diskcategoryList: any = [];
  zoneList: any = [];
  ecl2volumeErrObj: any = {
    name: AppConstant.VALIDATIONS.ALIBABA.VOLUME.VOLUMENAME,
    diskcategory: AppConstant.VALIDATIONS.ALIBABA.VOLUME.DISKCATEGORY,
    zoneid: AppConstant.VALIDATIONS.ALIBABA.VOLUME.ZONE,
    encryptedyn: AppConstant.VALIDATIONS.ALIBABA.VOLUME.ENCRYPTED,
    description: AppConstant.VALIDATIONS.ALIBABA.VOLUME.DESCRIPTION,
  };

  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private notificationService: NzNotificationService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private alibabaService: AlibabaService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getDiskCategoryList();
    this.getZoneList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.volumeObj) &&
      !_.isEmpty(changes.volumeObj.currentValue) &&
      !_.isUndefined(changes.volumeObj.currentValue.volumeid)
    ) {
      this.volumeObj = changes.volumeObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.volumeObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.volumeForm = this.fb.group({
      name: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      diskcategory: ["", Validators.required],
      sizeingb: [40],
      zoneid: [null, Validators.required],
      encryptedyn: ["Y", Validators.required],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [true],
    });
    this.volumeObj = {};
  }
  generateEditForm(data) {
    this.volumeForm = this.fb.group({
      name: [
        data.name,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      diskcategory: [data.diskcategory, Validators.required],
      sizeingb: [data.sizeingb],
      zoneid: [data.zoneid, Validators.required],
      encryptedyn: [data.encryptedyn, Validators.required],
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
  getDiskCategoryList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.DISKSTORAGE,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.diskcategoryList = response.data;
          const defaultvalue = _.find(this.diskcategoryList, function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          });
          this.volumeForm.controls["diskcategory"].setValue(
            defaultvalue.keyvalue
          );
        } else {
          this.diskcategoryList = [];
        }
      });
  }
  getZoneList() {
    this.alibabaService
      .allzones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.data) {
          this.zoneList = response.data;
        } else {
          this.zoneList = [];
        }
      });
  }
  saveOrUpdate(data) {
    this.disabled = true;
    this.loading = true;
    let errorMessage: any;
    if (this.volumeForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.disabled = false;
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.volumeForm,
        this.ecl2volumeErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      data.tenantid = this.userstoragedata.tenantid;
      data.status =
        data.status === true
          ? AppConstant.STATUS.ACTIVE
          : AppConstant.STATUS.INACTIVE;
      data.lastupdatedby = this.userstoragedata.fullname;
      data.lastupdateddt = new Date();
      if (
        !_.isUndefined(this.volumeObj) &&
        !_.isUndefined(this.volumeObj.volumeid) &&
        !_.isEmpty(this.volumeObj)
      ) {
        data.volumeid = this.volumeObj.volumeid;
        data.ecl2volumeid =
          this.volumeObj.ecl2volumeid != null
            ? this.volumeObj.ecl2volumeid
            : "";
        this.alibabaService.updatevolume(data).subscribe((res) => {
          this.loading = false;
          this.disabled = false;
          const response = JSON.parse(res._body);
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
        this.alibabaService.createvolume(data).subscribe((res) => {
          this.loading = false;
          this.disabled = false;
          const response = JSON.parse(res._body);
          if (response.status) {
            response.data.customer = this.volumeObj.client;
            response.data.ecl2zones = this.zoneObj;
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
}
