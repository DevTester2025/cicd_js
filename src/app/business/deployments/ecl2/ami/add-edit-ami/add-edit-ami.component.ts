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
import { Ecl2Service } from "../../ecl2-service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-ami",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/ami/add-edit-ami/add-edit-ami.component.html",
})
export class ECL2AddEditAmiComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() amiObj: any;
  @Output() notifyAmiEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  ecl2amiForm: FormGroup;
  formdata: any = {};
  buttonText: any;
  edit = false;
  platformList = [];
  customerList: any = [];
  ecl2amiErrObj = {
    imagename: AppConstant.VALIDATIONS.ECL2.AMI.IMAGENAME,
    ecl2imageid: AppConstant.VALIDATIONS.ECL2.AMI.ECL2IMAGEID,
    platform: AppConstant.VALIDATIONS.ECL2.AMI.PLATFORM,
    notes: AppConstant.VALIDATIONS.ECL2.AMI.NOTES,
  };
  loading = false;
  disabled = false;
  constructor(
    private localStorageService: LocalStorageService,
    private notificationService: NzNotificationService,
    private commonService: CommonService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    this.ecl2amiForm = this.fb.group({
      imagename: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(200),
        ]),
      ],
      ecl2imageid: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      platform: [null, Validators.required],
      customerid: [null, Validators.required],
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
    this.getCustomerList();
  }
  clearForm() {
    this.ecl2amiForm.reset();
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
    console.log(!_.isUndefined(this.amiObj.customerid));
    this.ecl2amiForm = this.fb.group({
      imagename: [
        this.amiObj.imagename,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(200),
        ]),
      ],
      ecl2imageid: [
        this.amiObj.ecl2imageid,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      platform: [
        !_.isEmpty(this.amiObj.platform) ? this.amiObj.platform : "",
        Validators.required,
      ],
      customerid: [
        !_.isUndefined(this.amiObj.customerid)
          ? _.find(this.customerList, function (item) {
              if (item.customerid === data.customerid) {
                return item;
              }
            })
          : "",
        Validators.required,
      ],
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
  getCustomerList() {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allCustomers(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.customerList = response.data;
      } else {
        this.customerList = [];
      }
    });
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2amiForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2amiForm,
        this.ecl2amiErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        imagename: data.imagename,
        ecl2imageid: !_.isEmpty(data.ecl2imageid) ? data.ecl2imageid : "",
        platform: !_.isEmpty(data.platform) ? data.platform : "",
        customerid: data.customerid.customerid,
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
        !_.isUndefined(this.amiObj.imageid) &&
        !_.isEmpty(this.amiObj)
      ) {
        this.formdata.imageid = this.amiObj.imageid;
        this.ecl2Service.updateecl2ami(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.disabled = false;
            this.notifyAmiEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            // this.message.error(response.message);
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
        this.ecl2Service.createecl2ami(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.clearForm();
            this.loading = false;
            this.disabled = false;
            this.notifyAmiEntry.next(response.data);
            this.message.success(response.message);
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
            //  this.message.error(response.message, { nzDuration: AppConstant.MESSAGEDURATION });
          }
        });
      }
    }
  }
}
