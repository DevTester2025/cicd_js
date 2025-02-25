import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { Ecl2Service } from "../../ecl2-service";
import * as _ from "lodash";

@Component({
  selector: "app-cloudmatiq-ecl2-share-network",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/network/share/share.component.html",
})
export class ShareComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  @Input() shareObj: any;
  userstoragedata = {} as any;
  customerList: any = [];
  sharenetworkForm: FormGroup;
  buttonText = AppConstant.BUTTONLABELS.SHARE;
  sharedList: any = [];
  formdata: any = {};
  loading = false;
  disabled = false;
  sharenetworkErrObj = {
    customer: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
  };
  constructor(
    private message: NzMessageService,
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
    this.clearForm();
    this.getCustomerList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.shareObj) &&
      !_.isEmpty(changes.shareObj.currentValue) &&
      !_.isEmpty(changes.shareObj.currentValue.shared)
    ) {
      this.shareObj = changes.shareObj.currentValue;
      this.sharedList = this.shareObj.shared;
      // this.getSharedList(this.sharedList);
      console.log(this.shareObj);
    }
  }

  clearForm() {
    this.sharenetworkForm = this.fb.group({
      customer: [null, Validators.required],
    });
  }
  // getSharedList(data) {
  //   this.formdata = {
  //     region: this.shareObj.ecl2zones.region,
  //     tenantid: this.userstoragedata.tenantid,
  //     networkid: this.shareObj.networkid,
  //     ecl2tenantid: this.shareObj.customer.ecl2tenantid,
  //     shared: data
  //   };
  //   this.ecl2Service.getsharedList(this.formdata).subscribe((res) => {
  //     const response = JSON.parse(res._body);
  //     if (response.status) {
  //       this.sharedList = response.data;
  //     }
  //   });
  // }
  getCustomerList() {
    this.commonService
      .allCustomers({ tenantid: this.userstoragedata.tenantid })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.customerList = response.data;
        } else {
          this.customerList = [];
        }
      });
  }

  // saveUpdate(data) {
  //   this.loading = true;
  //   this.disabled = true;
  //   let errorMessage: any;
  //   if (this.sharenetworkForm.status === 'INVALID') {
  //     errorMessage = this.commonService.getFormErrorMessage(this.sharenetworkForm, this.sharenetworkErrObj);
  //     this.message.remove();
  //     this.message.error(errorMessage);
  //     return false;
  //   } else {
  //     this.formdata = {
  //       tenantid: this.userstoragedata.tenantid,
  //       customername: data.customer.customername,
  //       networkid: this.shareObj.networkid,
  //       networkname: 'shared_' + this.shareObj.networkname,
  //       ecl2networkid: this.shareObj.ecl2networkid,
  //       ecl2tenantid: data.customer.ecl2tenantid,
  //       region: this.shareObj.ecl2zones.region,
  //       destinationtenantid: this.shareObj.customer.ecl2tenantid
  //     };
  //     this.ecl2Service.tenantrequest(this.formdata).subscribe((res) => {
  //       const response = JSON.parse(res._body);
  //       this.loading = false;
  //       this.disabled = false;
  //       if (response.status) {
  //         this.sharedList = [...this.sharedList, response.data.shared];
  //         this.clearForm();
  //         this.message.success(response.message);
  //       } else {
  //         this.message.error(response.message);

  //       }
  //     });
  //   }
  // }
}
