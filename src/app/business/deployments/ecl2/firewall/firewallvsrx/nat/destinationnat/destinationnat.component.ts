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
  selector: "app-destinationnat",
  templateUrl:
    "../../../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/nat/destinationnat/destinationnat.component.html",
})
export class DestinationnatComponent implements OnInit, OnChanges {
  @Input() inputdisabled: any;
  @Input() destinationNATObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();

  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  disabled = false;
  formdata: any = {};
  interfaceZoneList: any = [];
  interfaceNATTOList: any = [];
  destinationnatList: any = [];
  destinationnatForm: FormGroup;
  formTitle: any;
  index: any;
  destinationnatErr = {
    rulename: AppConstant.VALIDATIONS.ECL2.FIREWALL.DESTINATIONNAT.RULENAME,
    fromzone: AppConstant.VALIDATIONS.ECL2.FIREWALL.DESTINATIONNAT.FROMZONE,
    pooladdress:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.DESTINATIONNAT.POOLADDRESS,
    matchaddress:
      AppConstant.VALIDATIONS.ECL2.FIREWALL.DESTINATIONNAT.DESTINATIONADDRESS,
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
      !_.isUndefined(changes.destinationNATObj) &&
      !_.isEmpty(changes.destinationNATObj.currentValue)
    ) {
      this.destinationnatList = !_.isEmpty(
        changes.destinationNATObj.currentValue.destinationnat
      )
        ? JSON.parse(changes.destinationNATObj.currentValue.destinationnat)
        : [];
      this.clearForm();
      this.getLookupList();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.destinationnatForm = this.fb.group({
      rulename: ["", Validators.required],
      fromzone: ["untrust", Validators.required],
      pooladdress: ["", Validators.required],
      matchaddress: ["", Validators.required],
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
    if (this.destinationnatForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.destinationnatForm,
        this.destinationnatErr
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let ip = _.find(
        this.destinationNATObj.ecl2vsrxinterface,
        function (item: any) {
          if (item.slotname === "interface_1") {
            return item;
          }
        }
      );
      this.formdata = {
        type: "Destination NAT",
        vsrxid: this.destinationNATObj.vsrxid,
        username: this.destinationNATObj.username,
        password: this.destinationNATObj.password,
        ipaddress: ip.ipaddress,
        rulename: data.rulename,
        fromzone: data.fromzone,
        pooladdress: data.pooladdress,
        matchaddress: data.matchaddress,
      };
      let unusedips: any;
      unusedips = ip.ecl2networks.ecl2subnets[0].unallocatedips;
      let remainingunallocatedips: any;
      remainingunallocatedips = _.remove(unusedips, function (o: any) {
        if (o === data.matchaddress) {
          return o;
        }
      });
      let allocatedips = [] as any;
      allocatedips = ip.ecl2networks.ecl2subnets[0].allocatedips;
      allocatedips.push(data.matchaddress);
      this.formdata.ecl2subnetparams = {
        subnetid: ip.ecl2networks.ecl2subnets[0].subnetid,
        unallocatedips: unusedips,
        allocatedips: allocatedips,
      };

      this.ecl2Service.rpc(this.formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.disabled = false;
          this.clearForm();
          this.messageService.success(response.message);
          this.destinationnatList = [...this.destinationnatList, this.formdata];
          // this.notifyNewEntry.next(this.formdata);
        } else {
          this.loading = false;
          this.disabled = false;
          this.messageService.error(response.message);
        }
      });
    }
  }
}
