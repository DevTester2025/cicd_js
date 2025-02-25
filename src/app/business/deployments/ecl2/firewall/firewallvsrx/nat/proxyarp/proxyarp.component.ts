import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../../../app.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { Ecl2Service } from "../../../../ecl2-service";
@Component({
  selector: "app-proxyarp",
  templateUrl:
    "../../../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/nat/proxyarp/proxyarp.component.html",
})
export class ProxyarpComponent implements OnInit, OnChanges {
  @Input() inputdisabled: any;
  @Input() proxyNATObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();

  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  disabled = false;
  formdata: any = {};
  interfaceZoneList: any = [];
  interfaceNATTOList: any = [];
  proxynatForm: FormGroup;
  formTitle: any;
  isVisible = false;
  index: any;
  proxynatErr = {
    interface: AppConstant.VALIDATIONS.ECL2.FIREWALL.PROXYARPNAT.INTERFACE,
    fromaddress: AppConstant.VALIDATIONS.ECL2.FIREWALL.PROXYARPNAT.FROMADDRESS,
    toaddress: AppConstant.VALIDATIONS.ECL2.FIREWALL.PROXYARPNAT.TOADDRESS,
  };
  interfaceList: any = [];
  proxynatList: any = [];
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.proxyNATObj) &&
      !_.isEmpty(changes.proxyNATObj.currentValue)
    ) {
      this.clearForm();
      this.interfaceList = changes.proxyNATObj.currentValue.ecl2vsrxinterface;
      this.proxynatList = !_.isEmpty(
        changes.proxyNATObj.currentValue.proxyarpnat
      )
        ? JSON.parse(changes.proxyNATObj.currentValue.proxyarpnat)
        : [];
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.proxynatForm = this.fb.group({
      interface: ["", Validators.required],
      fromaddress: ["", Validators.required],
      toaddress: ["", Validators.required],
    });
  }
  showModal() {
    this.isVisible = true;
  }
  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(event) {}
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.proxynatForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.proxynatForm,
        this.proxynatErr
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let ip = _.find(this.proxyNATObj.ecl2vsrxinterface, function (item: any) {
        if (item.slotname === "interface_1") {
          return item;
        }
      });
      this.formdata = {
        type: "ProxyARP NAT",
        vsrxid: this.proxyNATObj.vsrxid,
        username: this.proxyNATObj.username,
        password: this.proxyNATObj.password,
        ipaddress: ip.ipaddress,
        interface: data.interface,
        fromaddress: data.fromaddress,
        toaddress: data.toaddress,
      };
      this.ecl2Service.rpc(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.disabled = false;
          this.clearForm();
          this.messageService.success(response.message);
          this.proxynatList = [...this.proxynatList, this.formdata];
        } else {
          this.loading = false;
          this.disabled = false;
          this.messageService.error(response.message);
        }
      });
    }
  }
}
