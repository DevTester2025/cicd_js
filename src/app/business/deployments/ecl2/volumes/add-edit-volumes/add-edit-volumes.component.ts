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
import { Ecl2Service } from "../../ecl2-service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-volumes",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/volumes/add-edit-volumes/add-edit-volumes.component.html",
})
export class ECL2AddEditVolumesComponent implements OnInit, OnChanges {
  @Input() volumeObj: any;
  @Output() notifyVolumeEntry: EventEmitter<any> = new EventEmitter();
  ecl2volumeForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = "";
  volumeErrObj = {};
  formdata: any = {};
  ecl2volumeErrObj: any = {};
  volumeSizeList: any = [];
  zoneObj: any = {};
  loading = false;
  disabled = false;
  eclVolumeObj: any = {};
  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private notificationService: NzNotificationService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getVolumeSizeList();
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
      this.volumeObj = changes.volumeObj.currentValue;
      this.zoneObj = !_.isUndefined(changes.volumeObj.currentValue.zone.zoneid)
        ? changes.volumeObj.currentValue.zone
        : {};
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  getVolumeSizeList() {
    const condition = {
      lookupkey: AppConstant.LOOKUPKEY.VOLUMESIZE,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.volumeSizeList = response.data;
        if (!_.isEmpty(this.eclVolumeObj)) {
          const size = this.volumeObj.size.toString();
          this.ecl2volumeForm.controls["sizeingb"].setValue(
            _.find(this.volumeSizeList, function (o: any) {
              if (o.keyvalue === size) {
                return o;
              }
            })
          );
        }
      } else {
        this.volumeSizeList = [];
      }
    });
  }
  clearForm() {
    this.ecl2volumeForm = this.fb.group({
      volumename: [null, Validators.required],
      description: [""],
      sizeingb: [null, Validators.required],
    });
    this.volumeObj = {};
  }
  generateEditForm(data) {
    this.eclVolumeObj = data;
    this.ecl2volumeForm = this.fb.group({
      volumename: [data.volumename, Validators.required],
      description: [data.description],
      sizeingb: [
        _.find(this.volumeSizeList, function (o: any) {
          if (o.keyvalue === data.size.toString()) {
            return o;
          }
        }),
        Validators.required,
      ],
    });
  }
  saveOrUpdate(data) {
    this.disabled = true;
    this.loading = true;
    let errorMessage: any;
    if (this.ecl2volumeForm.status === "INVALID") {
      this.disabled = false;
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2volumeForm,
        this.ecl2volumeErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        volumename: data.volumename,
        description: data.description,
        // sizeingb: data.sizeingb.keyvalue,
        size: Number(data.sizeingb.keyvalue),
        zoneid: !_.isEmpty(this.zoneObj)
          ? this.zoneObj.zoneid
          : this.volumeObj.zoneid,
        region: !_.isEmpty(this.zoneObj)
          ? this.zoneObj.region
          : this.volumeObj.ecl2zones.region,
        customerid: !_.isEmpty(this.volumeObj.client)
          ? this.volumeObj.client.customerid
          : this.volumeObj.customer.customerid,
        notes: data.description,
        status: AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.volumeObj) &&
        !_.isUndefined(this.volumeObj.volumeid) &&
        !_.isEmpty(this.volumeObj)
      ) {
        this.formdata.volumeid = this.volumeObj.volumeid;
        this.formdata.ecl2volumeid =
          this.volumeObj.ecl2volumeid != null
            ? this.volumeObj.ecl2volumeid
            : "";
        this.ecl2Service.updateecl2volume(this.formdata).subscribe((res) => {
          this.loading = false;
          this.disabled = false;
          const response = JSON.parse(res._body);
          if (response.status) {
            response.data.customer = this.volumeObj.client;
            response.data.ecl2zones = this.zoneObj;
            this.notifyVolumeEntry.next(response.data);
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
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.createecl2volume(this.formdata).subscribe((res) => {
          this.loading = false;
          this.disabled = false;
          const response = JSON.parse(res._body);
          if (response.status) {
            response.data.customer = this.volumeObj.client;
            response.data.ecl2zones = this.zoneObj;
            this.notifyVolumeEntry.next(response.data);
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
  }
}
