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
  selector: "app-lb-interface",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/lb/lb-interface/lb-interface.component.html",
})
export class LbInterfaceComponent implements OnInit, OnChanges {
  @Input() lbInterfaceObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  ecl2lbInterfacceForm: FormGroup;
  formdata: any = {};
  buttonText: any;
  edit = false;
  platformList = [];
  networkList: any = [];
  networks: any = [];
  interfaceObj: any = {};
  ecl2InterfaceErrObj = {
    networkid: AppConstant.VALIDATIONS.ECL2.LBINTERFACE.NETWORK,
    ipaddress: AppConstant.VALIDATIONS.ECL2.LBINTERFACE.IPADDRESS,
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
      !_.isUndefined(changes.lbInterfaceObj) &&
      !_.isEmpty(changes.lbInterfaceObj.currentValue)
    ) {
      this.clearForm();
      this.lbInterfaceObj = changes.lbInterfaceObj.currentValue;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      let condition = {} as any;
      condition = {
        tenantid: this.userstoragedata.tenantid,
        zoneid: this.lbInterfaceObj.zoneid,
        status: AppConstant.STATUS.ACTIVE,
      };
      if (!_.isEmpty(this.lbInterfaceObj.networks)) {
        condition.networklist = this.lbInterfaceObj.networks;
      }
      this.getNetworkList(condition);
    } else {
      this.clearForm();
      this.edit = false;
    }
  }

  clearForm() {
    this.ecl2lbInterfacceForm = this.fb.group({
      networkid: ["", Validators.required],
      ipaddress: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(30)]),
      ],
    });
  }

  getNetworkList(condition) {
    this.ecl2Service.allecl2nework(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.networkList = response.data;
      } else {
        this.networkList = [];
      }
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2lbInterfacceForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2lbInterfacceForm,
        this.ecl2InterfaceErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        lbinterfaceid: this.lbInterfaceObj.lbinterfaceid,
        ecl2lbinterfaceid: this.lbInterfaceObj.ecl2lbinterfaceid,
        lbinterfacename: this.lbInterfaceObj.lbinterfacename,
        networkid: data.networkid.networkid,
        ecl2networkid: data.networkid.ecl2networkid,
        ipaddress: data.ipaddress,
        description: data.description,
        zoneid: this.lbInterfaceObj.zoneid,
        region: this.lbInterfaceObj.region,
        customerid: this.lbInterfaceObj.customer.customerid,
        ecl2tenantid: this.lbInterfaceObj.customer.ecl2tenantid,
        status: AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      this.ecl2Service.updateecl2lbinterface(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.disabled = false;
          this.interfaceObj = response.data;
          this.interfaceObj.ecl2networks = data.networkid;
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
