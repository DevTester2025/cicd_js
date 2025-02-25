import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../../../app.constant";
import { LocalStorageService } from "../../../../../../modules/services/shared/local-storage.service";
import { Ecl2Service } from "../../../../ecl2/ecl2-service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../../../modules/services/shared/common.service";
import { NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
@Component({
  selector: "app-securitypolicy",
  templateUrl:
    "../../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/securitypolicy/securitypolicy.component.html",
})
export class SecuritypolicyComponent implements OnInit, OnChanges {
  @Input() securityPolicyObj: any;
  @Input() inputdisabled: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  ecl2firewallrules: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  disabled = false;
  formdata: any = {};
  interfaceZoneList: any = [];
  advancedRuleList: any = [];
  securitypolicyList: any = [];
  formTitle: any;
  index: any;
  defaultRule: any;
  defaultservice: any;
  serviceList: any = [];
  securitypolicyErr = {
    rulename: AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.RULENAME,
    sourcezone: AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.FROMZONE,
    sourceaddress:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.SOURCEADDRESS,
    destinationzone:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.TOZONE,
    destinationaddress:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.DESTINATIONADDRESS,
    advancedrule:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.ADVANCEDRULE,
    service: AppConstant.VALIDATIONS.ECL2.FIREWALL.SECURITYPOLICY.SERVICE,
  };
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
  ngOnInit() {
    this.getPolicyList();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.securityPolicyObj) &&
      !_.isEmpty(changes.securityPolicyObj.currentValue)
    ) {
      this.clearForm();
      this.getLookupList();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.ecl2firewallrules = this.fb.group({
      rulename: ["", Validators.required],
      sourcezone: ["untrust", Validators.required],
      sourceaddress: ["any", Validators.required],
      destinationzone: ["trust", Validators.required],
      destinationaddress: [null, Validators.required],
      service: [
        !_.isEmpty(this.defaultservice) ? this.defaultservice.keyvalue : null,
        Validators.required,
      ],
      advancedrule: [
        !_.isEmpty(this.defaultRule) ? this.defaultRule.keyvalue : null,
        Validators.required,
      ],
    });
  }
  getPolicyList() {
    this.ecl2Service
      .vsrxbyId(this.securityPolicyObj.vsrxid)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.securitypolicyList = !_.isEmpty(response.data.securitypolicy)
            ? JSON.parse(response.data.securitypolicy)
            : [];
        } else {
          this.securitypolicyList = [];
        }
      });
  }
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.INTERFACEZONE,
        AppConstant.LOOKUPKEY.INTERFACESERVICES,
        AppConstant.LOOKUPKEY.SECURITYRULEACTION,
        AppConstant.LOOKUPKEY.VSRX_SERVICES,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (element.lookupkey === AppConstant.LOOKUPKEY.INTERFACEZONE) {
            this.interfaceZoneList.push(element);
          } else if (
            element.lookupkey === AppConstant.LOOKUPKEY.SECURITYRULEACTION
          ) {
            this.advancedRuleList.push(element);
            if (element.defaultvalue === "Y") {
              this.defaultRule = element;
            }
          } else if (
            element.lookupkey === AppConstant.LOOKUPKEY.VSRX_SERVICES
          ) {
            this.serviceList.push(element);
            if (element.defaultvalue === "Y") {
              this.defaultservice = element;
            }
          }
        });
        if (this.defaultRule != undefined) {
          this.ecl2firewallrules
            .get("advancedrule")
            .setValue(this.defaultRule.keyvalue);
        }
        if (this.defaultservice != undefined) {
          this.ecl2firewallrules
            .get("service")
            .setValue(this.defaultservice.keyvalue);
        }
      } else {
        this.interfaceZoneList = [];
      }
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2firewallrules.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2firewallrules,
        this.securitypolicyErr
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let ip = _.find(
        this.securityPolicyObj.ecl2vsrxinterface,
        function (item: any) {
          if (item.slotname === "interface_1") {
            return item;
          }
        }
      );
      this.formdata = {
        type: "Security Policy",
        vsrxid: this.securityPolicyObj.vsrxid,
        username: this.securityPolicyObj.username,
        password: this.securityPolicyObj.password,
        ipaddress: ip.ipaddress,
        rulename: data.rulename,
        advancedrule: data.advancedrule,
        sourcezone: data.sourcezone,
        sourceaddress: data.sourceaddress,
        destinationaddress: data.destinationaddress,
        destinationzone: data.destinationzone,
        service: data.service,
      };

      this.ecl2Service.rpc(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.securitypolicyList = [...this.securitypolicyList, this.formdata];
          this.loading = false;
          this.disabled = false;
          this.clearForm();
          this.messageService.success(response.message);
        } else {
          this.loading = false;
          this.disabled = false;
          this.messageService.error(response.message);
        }
      });
    }
  }
}
