import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { Ecl2Service } from "../../ecl2-service";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";

@Component({
  selector: "app-firewallinterface",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/firewall/firewallinterface/firewallinterface.component.html",
})
export class FirewallinterfaceComponent implements OnInit, OnChanges {
  @Input() firewallInterfaceObj: any = {};
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  firewallInterfaceList: any = [];
  InterfaceObj: any = {};
  userstoragedata: any;
  loading = false;
  isVisible = false;
  screens = [];
  appScreens = {} as any;
  modalWidth = 320;
  childrenVisible = false;
  firewallinterfaceForm: FormGroup;
  networkList: any = [];
  disabled = false;
  formdata: any = {};
  buttonText = "Update";
  formTitle = "Attach Network";
  index: any;
  firewallinterfaceErr = {};
  constructor(
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private notificationService: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.firewallInterfaceObj) &&
      !_.isEmpty(changes.firewallInterfaceObj.currentValue)
    ) {
      this.firewallInterfaceObj = changes.firewallInterfaceObj.currentValue;
      this.getInterfaceList();
      // this.firewallInterfaceList = _.orderBy(this.firewallInterfaceObj.ecl2firewallinterface, 'slotnumber');
      this.clearForm();
      const condition = {
        tenantid: this.userstoragedata.tenantid,
        zoneid: this.firewallInterfaceObj.zoneid,
        status: AppConstant.STATUS.ACTIVE,
      };
      this.getNetworkList(condition);
    } else {
      // this.firewallInterfaceObj = this.firewallInterfaceObj;
    }
  }
  clearForm() {
    this.firewallinterfaceForm = this.fb.group({
      networkid: ["", Validators.required],
      ipaddress: [""],
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
  onChanged(val) {
    this.childrenVisible = val;
  }

  editInterface(event) {
    this.index = this.firewallInterfaceList.indexOf(event);
    this.childrenVisible = true;
    this.InterfaceObj = event;
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.firewallinterfaceForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.firewallinterfaceForm,
        this.firewallinterfaceErr
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        fwinterfaceid: this.InterfaceObj.fwinterfaceid,
        fwinterfacename: this.InterfaceObj.fwinterfacename,
        ecl2fwinterfaceid: this.InterfaceObj.ecl2fwinterfaceid,
        networkid: data.networkid.networkid,
        ecl2networkid: data.networkid.ecl2networkid,
        ipaddress: data.ipaddress,
        description: data.description,
        zoneid: this.firewallInterfaceObj.zoneid,
        region: this.firewallInterfaceObj.ecl2zones.region,
        customerid: this.firewallInterfaceObj.customer.customerid,
        ecl2tenantid: this.firewallInterfaceObj.customer.ecl2tenantid,
        status: AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };

      this.ecl2Service
        .updateecl2firewallinterface(this.formdata)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.disabled = false;
            this.childrenVisible = false;
            this.getInterfaceList();
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

  getInterfaceList() {
    const condition = {
      firewallid: this.firewallInterfaceObj.firewallid,
    };
    this.ecl2Service.allecl2firewallinterface(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.firewallInterfaceList = _.map(response.data, function (item: any) {
          if (
            !_.isEmpty(item.ecl2networks) &&
            !_.isEmpty(item.ecl2networks.ecl2subnets)
          ) {
            item.ecl2networks.networkname =
              item.ecl2networks.networkname +
              "(" +
              _.map(item.ecl2networks.ecl2subnets, function (obj) {
                return obj.subnetcidr;
              }) +
              ")";
          }
          return item;
        });
      } else {
        this.firewallInterfaceList = [];
      }
    });
  }
}
