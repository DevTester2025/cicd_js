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
  selector: "app-securityzone",
  templateUrl:
    "../../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/securityzone/securityzone.component.html",
})
export class SecurityzoneComponent implements OnInit, OnChanges {
  @Input() securityZoneObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  securityzonesForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  disabled = false;
  formdata: any = {};
  interfaceZoneList: any = [];
  advancedRuleList: any = [];
  interfaceServiceList: any = [];
  formTitle: any;
  index: any;
  sourcenatErr = {};
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
    this.getLookupList();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.securityZoneObj) &&
      !_.isEmpty(changes.securityZoneObj.currentValue)
    ) {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.securityzonesForm = this.fb.group({
      interfacezone: ["trust"],
      services: ["any-service"],
      unit: [0],
    });
  }

  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.INTERFACEZONE,
        AppConstant.LOOKUPKEY.INTERFACESERVICES,
        AppConstant.LOOKUPKEY.SECURITYRULEACTION,
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
            element.lookupkey === AppConstant.LOOKUPKEY.INTERFACESERVICES
          ) {
            this.interfaceServiceList.push(element);
          }
        });
      } else {
        this.interfaceZoneList = [];
      }
    });
  }

  saveConfigure(data, key) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.securityzonesForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.securityzonesForm,
        this.sourcenatErr
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        type: "Security Zone",
        vsrxid: this.securityZoneObj.vsrxid,
        username: this.securityZoneObj.ecl2vsrx.username,
        password: this.securityZoneObj.ecl2vsrx.password,
        fixedip: this.securityZoneObj.ipaddress,
        ipaddress: this.securityZoneObj.urlipaddress,
        vsrxinterfaceslot: this.securityZoneObj.vsrxinterfaceslot,
        vsrxinterfaceunitslot: this.securityZoneObj.vsrxinterfaceunitslot,
        interfacezone: data.interfacezone,
        services: data.services,
        sourcezone: data.sourcezone,
        unit: data.unit,
      };

      this.ecl2Service.rpc(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.disabled = false;
          this.clearForm();
          this.messageService.success(response.message);
          this.notifyNewEntry.next(response.data);
        } else {
          this.loading = false;
          this.disabled = false;
          this.messageService.error(response.message);
        }
      });
    }
  }
}
