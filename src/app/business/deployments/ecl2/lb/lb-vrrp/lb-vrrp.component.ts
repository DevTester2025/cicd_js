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
  selector: "app-lb-vrrp",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/lb/lb-vrrp/lb-vrrp.component.html",
})
export class LbVrrpComponent implements OnInit, OnChanges {
  @Input() lbVRRPObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  ecl2lbvrrpForm: FormGroup;
  formdata: any = {};
  buttonText: any;
  trackingList: any = [];
  ecl2LBErrObj = {
    virtualipaddress: AppConstant.VALIDATIONS.ECL2.LBVRRPCONFIG.VIRTUALIP,
    vrid: AppConstant.VALIDATIONS.ECL2.LBVRRPCONFIG.VRID,
  };
  loading = false;
  disabled = false;
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.buttonText = AppConstant.BUTTONLABELS.SAVE;
  }
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.lbVRRPObj) &&
      !_.isEmpty(changes.lbVRRPObj.currentValue)
    ) {
      this.clearForm();
      this.getLookupList();
      this.lbVRRPObj = changes.lbVRRPObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.ecl2lbvrrpForm = this.fb.group({
      virtualipaddress: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30),
        ]),
      ],
      vrid: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(11),
        ]),
      ],
      priority: [255],
      tracking: ["NONE"],
      preemption: [true],
      preemptiondelaytimer: [1],
      trackifnumpriority: [0],
      sharing: [false],
    });
  }
  getLookupList() {
    const condition = {
      lookupkey: AppConstant.LOOKUPKEY.CITRIX_VMAC_TRACKING,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.trackingList = response.data;
      } else {
        this.trackingList = [];
      }
    });
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2lbvrrpForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2lbvrrpForm,
        this.ecl2LBErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        lbinterfaceid: this.lbVRRPObj.lbinterfaceid,
        ecl2lbinterfaceid: this.lbVRRPObj.ecl2lbinterfaceid,
        virtualipaddress: data.virtualipaddress,
        protocol: "vrrp",
        vrid: data.vrid,
        description: data.description,
        zoneid: this.lbVRRPObj.zoneid,
        region: this.lbVRRPObj.region,
        customerid: this.lbVRRPObj.customer.customerid,
        ecl2tenantid: this.lbVRRPObj.customer.ecl2tenantid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      let vmac = {} as any;
      vmac = {
        id: data.vrid,
        priority: data.priority,
        tracking: data.tracking,
        preemption: data.preemption === true ? "ENABLED" : "DISABLED",
        preemptiondelaytimer: data.preemptiondelaytimer,
        trackifnumpriority: data.trackifnumpriority,
        sharing: data.sharing === true ? "ENABLED" : "DISABLED",
      };
      this.formdata.vmac = JSON.stringify(vmac);
      this.ecl2Service.updateecl2lbinterface(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.disabled = false;
          response.data.ecl2networks = this.lbVRRPObj.ecl2networks;
          this.notifyNewEntry.next(response.data);
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
        }
      });
    }
  }
}
