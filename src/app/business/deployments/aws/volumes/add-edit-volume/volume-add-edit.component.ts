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
import { NzMessageService } from "ng-zorro-antd";
import { AWSService } from "../../aws-service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-volume-add-edit",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/volumes/add-edit-volume/volume-add-edit.component.html",
})
export class VolumeAddEditComponent implements OnInit, OnChanges {
  @Input() volumeObj: any;
  @Output() notifyVolumeEntry: EventEmitter<any> = new EventEmitter();
  volumeForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  volumeErrObj = {};
  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private awsService: AWSService,
    private commonService: CommonService
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
      !_.isUndefined(changes.volumeObj) &&
      !_.isEmpty(changes.volumeObj.currentValue)
    ) {
      this.volumeObj = changes.volumeObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      // this.generateEditForm(this.volumeObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.volumeForm = this.fb.group({
      volumetype: ["General Purpose SSD ( GP2 )", Validators.required],
      sizeingb: [null, Validators.required],
      delontermination: ["Y", Validators.required],
      encryptedyn: ["Y", Validators.required],
      notes: [""],
    });
  }
  volumesChanged() {
    if (!_.isEmpty(this.volumeObj)) {
      let data = this.volumeForm.value;
      data.volumeid = this.volumeObj.volumeid;
      data.lastupdateddt = new Date();
      data.lastupdatedby = this.userstoragedata.fullname;
      data.status = "Active";
      this.notifyVolumeEntry.next({
        add: false,
        data: data,
      });
    } else {
      let data = this.volumeForm.value;
      data.createdby = this.userstoragedata.fullname;
      data.createddt = new Date();
      data.lastupdateddt = new Date();
      data.lastupdatedby = this.userstoragedata.fullname;
      data.tenantid = this.userstoragedata.tenantid;
      data.status = "Active";
      this.notifyVolumeEntry.next({
        add: true,
        data: data,
      });
      this.clearForm();
    }
  }
  // saveUpdateVolume(data) {
  //     let errorMessage: any;
  //     if (this.volumeForm.status === 'INVALID') {
  //         errorMessage = this.commonService.getFormErrorMessage(this.volumeForm, this.volumeErrObj);
  //         this.messageService.remove();
  //         this.messageService.error(errorMessage);
  //         return false;
  //     }
  //     let response = {} as any;
  //     data.tenantid = this.userstoragedata.tenantid;
  //     data.lastupdateddt = new Date();
  //     data.lastupdatedby = this.userstoragedata.fullname;
  //     if (!_.isEmpty(this.volumeObj) && this.volumeObj.volumeid != null && this.volumeObj.volumeid != undefined) {
  //         data.volumeid = this.volumeObj.volumeid;
  //         this.awsService.updateawsvolumes(data).subscribe(result => {
  //             response = JSON.parse(result._body);
  //             if (response.status) {
  //                 this.notifyVolumeEntry.next(response.data);
  //                 this.messageService.success(response.message);
  //             } else {
  //                 this.messageService.error(response.message);
  //             }
  //         }, err => {
  //             this.messageService.error('Unable to add volume group. Try again');
  //         });
  //     } else {
  //         data.createddt = new Date();
  //         data.createdby = this.userstoragedata.fullname;
  //         data.status = AppConstant.STATUS.ACTIVE;
  //         this.awsService.createawsvolumes(data).subscribe(result => {
  //             response = JSON.parse(result._body);
  //             if (response.status) {
  //                 this.clearForm();
  //                 this.notifyVolumeEntry.next(response.data);
  //                 this.messageService.success(response.message);
  //             } else {
  //                 this.messageService.error(response.message);
  //             }
  //         }, err => {
  //             this.messageService.error('Unable to add volume group. Try again');
  //         });
  //     }
  // }
}
