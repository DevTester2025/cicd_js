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
import { Ecl2Service } from "../../../ecl2/ecl2-service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
@Component({
  selector: "app-add-edit-firewall",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/firewall/add-edit-firewall/add-edit-firewall.component.html",
})
export class AddEditFirewallComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  @Input() firewallObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  edit = false;
  firewallInterfaceObj: any = {};
  userstoragedata: any;
  buttonText: any;
  firewallForm: FormGroup;
  ecl2firewallForm: FormGroup;
  internetserviceList: any = [];
  qosList: any = [];
  formdata: any = {};
  disabled = false;
  loading = false;
  selectedIndex = 0;
  ecl2zoneList: any = [];
  firewallplanList: any = [];
  customerList: any = [];
  firewallErrObj = {
    firewallname: AppConstant.VALIDATIONS.ECL2.FIREWALL.FIREWALLNAME,
    zoneid: AppConstant.VALIDATIONS.ECL2.FIREWALL.ZONE,
    firewallplanid: AppConstant.VALIDATIONS.ECL2.FIREWALL.FIREWALLPLAN,
    customerid: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
    description: AppConstant.VALIDATIONS.ECL2.FIREWALL.DESCRIPTION,
  };
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
  ngOnInit() {
    this.clearForm();
    this.getZoneList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.firewallObj) &&
      !_.isEmpty(changes.firewallObj.currentValue) &&
      !_.isUndefined(changes.firewallObj.currentValue.firewallid)
    ) {
      this.selectedIndex = 0;
      this.firewallObj = changes.firewallObj.currentValue;
      this.firewallInterfaceObj = this.firewallObj;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.firewallObj);
    } else {
      this.edit = false;
      this.selectedIndex = 0;
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  clearForm() {
    this.firewallForm = this.fb.group({
      firewallname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [null, Validators.required],
      customerid: [null, Validators.required],
      firewallplanid: ["", Validators.required],
      availabilityzone: [""],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [""],
    });
  }
  onRegionChange(event) {
    const customerCondition = {
      tenantid: this.userstoragedata.tenantid,
      ecl2region: event.region,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getCustomerList(customerCondition);
  }
  getCustomerList(condition) {
    this.commonService.allCustomers(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.customerList = response.data;
        this.loading = false;
      } else {
        this.customerList = [];
        this.loading = false;
      }
    });
  }
  onCustomerChange(event) {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      region: event.ecl2region,
      customerid: event.customerid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getFirewallPlans(condition);
  }
  generateEditForm(data) {
    this.edit = true;
    this.firewallplanList.push(data.ecl2firewallplans);
    this.ecl2zoneList.push(data.ecl2zones);
    this.customerList.push(data.customer);
    this.ecl2firewallForm = this.fb.group({
      firewallname: [
        data.firewallname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      firewallplanid: [data.ecl2firewallplans, Validators.required],
      availabilityzone: [data.availabilityzone],
      zoneid: [data.ecl2zones, Validators.required],
      customerid: [data.customer, Validators.required],
      description: [
        data.description,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }

  getZoneList() {
    this.ecl2Service
      .allecl2Zones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          this.ecl2zoneList = response.data;
        } else {
          this.ecl2zoneList = [];
        }
      });
  }

  getFirewallPlans(condition) {
    this.ecl2Service.allecl2firewallplans(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.firewallplanList = response.data;
      } else {
        this.firewallplanList = [];
      }
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.firewallForm.status === "INVALID" && this.edit === false) {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.firewallForm,
        this.firewallErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        firewallname: data.firewallname,
        availabilityzone: data.zoneid.zonename.substring(
          4,
          data.zoneid.zonename.length
        ),
        firewallplanid: data.firewallplanid.firewallplanid.toString(),
        ecl2firewallplanid: data.firewallplanid.ecl2firewallplanid,
        description: data.description,
        zoneid: data.zoneid.zoneid,
        region: data.zoneid.region,
        customerid: data.customerid.customerid,
        ecl2tenantid: data.customerid.ecl2tenantid,
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.firewallObj) &&
        !_.isUndefined(this.firewallObj.firewallid) &&
        !_.isEmpty(this.firewallObj)
      ) {
        this.formdata.firewallid = this.firewallObj.firewallid;
        this.formdata.ecl2firewallid = this.firewallObj.ecl2firewallid;
        this.ecl2Service.updateecl2firewall(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.disabled = false;
            response.data.ecl2firewallplans = data.firewallplanid;
            response.data.ecl2zones = data.zoneid;
            this.notifyNewEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            // this.message.error(response.message);
            this.notificationService.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
        });
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.createecl2firewall(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.clearForm();
            this.loading = false;
            this.disabled = false;
            response.data.ecl2firewallplans = data.firewallplanid;
            response.data.ecl2zones = data.zoneid;
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
}
