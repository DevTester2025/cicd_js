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
  selector: "app-lb-ip",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/lb/lb-ip/lb-ip.component.html",
})
export class LbIpComponent implements OnInit, OnChanges {
  @Input() lbIPObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();

  userstoragedata = {} as any;
  ecl2lbipForm: FormGroup;
  formdata: any = {};
  buttonText: any;
  ipTypeList: any = [];
  icmpResponseList: any = [];
  arpResponseList: any = [];
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
      !_.isUndefined(changes.lbIPObj) &&
      !_.isEmpty(changes.lbIPObj.currentValue)
    ) {
      this.getLookupList();
      this.clearForm();
      this.lbIPObj = changes.lbIPObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
    } else {
      this.clearForm();
    }
  }

  clearForm() {
    this.ecl2lbipForm = this.fb.group({
      ipaddress: [
        this.lbIPObj.virtualipaddress ? this.lbIPObj.virtualipaddress : "",
        Validators.required,
      ],
      netmask: ["", Validators.required],
      type: ["Virtual IP", Validators.required],
      vrid: [this.lbIPObj.vrid ? this.lbIPObj.vrid : "", Validators.required],
      icmpresponse: ["NONE", Validators.required],
      arpresponse: ["NONE", Validators.required],
      td: [10, Validators.required],
      state: [true, Validators.required],
      arp: [true, Validators.required],
      icmp: [true, Validators.required],
      vserver: [true, Validators.required],
      // decrementttl: [false, Validators.required],
      hostroute: [false, Validators.required],
      tag: [0, Validators.required],
      mgmtaccess: [true, Validators.required],
      snmp: [true, Validators.required],
    });
  }
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.CITRIX_IPS_IPTYPE,
        AppConstant.LOOKUPKEY.CITRIX_IPS_ICMP_RES,
        AppConstant.LOOKUPKEY.CITRIX_IPS_ARP_RES,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (element.lookupkey === AppConstant.LOOKUPKEY.CITRIX_IPS_IPTYPE) {
            this.ipTypeList.push(element);
          } else if (
            element.lookupkey === AppConstant.LOOKUPKEY.CITRIX_IPS_ICMP_RES
          ) {
            this.icmpResponseList.push(element);
          } else if (
            element.lookupkey === AppConstant.LOOKUPKEY.CITRIX_IPS_ARP_RES
          ) {
            this.arpResponseList.push(element);
          }
        });
      } else {
        this.ipTypeList = [];
        this.icmpResponseList = [];
        this.arpResponseList = [];
      }
    });
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    this.formdata = {
      tenantid: this.userstoragedata.tenantid,
      flag: "Netscaler IP",
      lbinterfaceid: this.lbIPObj.lbinterfaceid,
      ecl2lbinterfaceid: this.lbIPObj.ecl2lbinterfaceid,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    let input = {} as any;
    input = {
      ipaddress: data.ipaddress,
      netmask: data.netmask,
      type: data.type,
      vrid: data.vrid,
      icmpresponse: data.icmpresponse,
      arpresponse: data.arpresponse,
      td: data.td,
      state: data.state === true ? "ENABLED" : "DISABLED",
      arp: data.arp === true ? "ENABLED" : "DISABLED",
      icmp: data.icmp === true ? "ENABLED" : "DISABLED",
      vserver: data.vserver === true ? "ENABLED" : "DISABLED",
      // decrementttl: (data.decrementttl === true) ? 'ENABLED' : 'DISABLED',
      hostroute: data.hostroute === true ? "ENABLED" : "DISABLED",
      tag: data.tag,
      mgmtaccess: data.mgmtaccess === true ? "ENABLED" : "DISABLED",
      snmp: data.snmp === true ? "ENABLED" : "DISABLED",
    };
    this.formdata.ip = JSON.stringify(input);
    this.ecl2Service.updateecl2lbinterface(this.formdata).subscribe((res) => {
      this.loading = false;
      this.disabled = false;
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        this.notifyNewEntry.next(response.data);
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
