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
  selector: "app-sourcenat",
  templateUrl:
    "../../../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/nat/sourcenat/sourcenat.component.html",
})
export class SourcenatComponent implements OnInit, OnChanges {
  @Input() inputdisabled: any;
  @Input() sourceNATObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();

  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  disabled = false;
  formdata: any = {};
  interfaceZoneList: any = [];
  interfaceNATTOList: any = [];
  sourcenatForm: FormGroup;
  formTitle: any;
  index: any;
  sourcenatList: any = [];
  sourcenatErr = {
    rulename: AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.RULENAME,
    fromzone: AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.FROMZONE,
    tozone: AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.TOZONE,
    sourceaddress:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.SOURCEADDRESS,
    destinationaddress:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.DESTINATIONADDRESS,
    natto: AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.NATTO,
    ipv4address: AppConstant.VALIDATIONS.ECL2.FIREWALL.SOURCENAT.IPADDRESS,
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
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.sourceNATObj) &&
      !_.isEmpty(changes.sourceNATObj.currentValue)
    ) {
      this.sourcenatList = !_.isEmpty(this.sourceNATObj.sourcenat)
        ? JSON.parse(this.sourceNATObj.sourcenat)
        : [];
      this.getLookupList();
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.sourcenatForm = this.fb.group({
      rulename: ["", Validators.required],
      fromzone: ["trust", Validators.required],
      tozone: ["untrust", Validators.required],
      sourceaddress: ["", Validators.required],
      destinationaddress: ["0.0.0.0", Validators.required],
      natto: ["", Validators.required],
      ipv4address: [""],
    });
  }
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.INTERFACEZONE,
        AppConstant.LOOKUPKEY.SOURCENATTO,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (element.lookupkey === AppConstant.LOOKUPKEY.INTERFACEZONE) {
            this.interfaceZoneList.push(element);
          } else if (element.lookupkey === AppConstant.LOOKUPKEY.SOURCENATTO) {
            this.interfaceNATTOList.push(element);
          }
        });
        let interfaceNATObj = {} as any;
        interfaceNATObj = _.find(this.interfaceNATTOList, function (item) {
          if (item.defaultvalue === "Y") {
            return item;
          }
        });
        this.sourcenatForm.controls["natto"].setValue(interfaceNATObj.keyvalue);
      } else {
        this.interfaceZoneList = [];
        this.interfaceNATTOList = [];
      }
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.sourcenatForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.sourcenatForm,
        this.sourcenatErr
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let ip = _.find(
        this.sourceNATObj.ecl2vsrxinterface,
        function (item: any) {
          if (item.slotname === "interface_1") {
            return item;
          }
        }
      );
      this.formdata = {
        type: "Source NAT",
        vsrxid: this.sourceNATObj.vsrxid,
        username: this.sourceNATObj.username,
        password: this.sourceNATObj.password,
        ipaddress: ip.ipaddress,
        rulename: data.rulename,
        fromzone: data.fromzone,
        tozone: data.tozone,
        sourceaddress: data.sourceaddress,
        destinationaddress: data.destinationaddress,
        natto: data.natto,
      };
      if (data.ipv4address !== "") {
        this.formdata.natto =
          "<pool> <pool-name>" + data.ipv4address + "</pool-name></pool>";
      }
      this.ecl2Service.rpc(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.disabled = false;
          this.clearForm();
          this.messageService.success(response.message);
          this.sourcenatList = [...this.sourcenatList, this.formdata];
          //  this.notifyNewEntry.next(this.formdata);
        } else {
          this.loading = false;
          this.disabled = false;
          this.messageService.error(response.message);
        }
      });
    }
  }
}
