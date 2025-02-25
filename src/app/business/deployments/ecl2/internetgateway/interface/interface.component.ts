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
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { Ecl2Service } from "../../ecl2-service";
@Component({
  selector: "app-interface",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/internetgateway/interface/interface.component.html",
})
export class InterfaceComponent implements OnInit, OnChanges {
  @Input() inputdisabled: boolean;
  @Input() interfaceObj: any;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  interfaceForm: FormGroup;
  interfaceList: any = [];
  networkList: any = [];
  ecl2zoneList: any = [];
  loading = false;
  disabled = false;
  formdata: any = {};
  index: any;
  interFaceEditObj: any = {};
  servicetypeList: any = [];
  interfaceErrObj = {
    interfacename: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.INTERFACENAME,
    networkid: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.NETWORK,
    gwvipv4: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.GATEWAYIPV4,
    primaryipv4: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.PRIMARYIPV4,
    secondaryipv4: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.SECONDARYIPV4,
    vrid: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.VRRPGROUPID,
    description: AppConstant.VALIDATIONS.ECL2.GATEWAYINTERFACE.DESCRIPTION,
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
    this.clearForm();
    this.getServiceTypeList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.interfaceObj) &&
      !_.isEmpty(changes.interfaceObj.currentValue) &&
      !_.isEmpty(changes.interfaceObj.currentValue.ecl2iginterface)
    ) {
      this.clearForm();
      this.interfaceList = [
        ...changes.interfaceObj.currentValue.ecl2iginterface,
      ];
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      if (!_.isUndefined(this.interfaceObj.zoneid)) {
        this.getNetworkList();
      }
    } else {
      this.clearForm();
      this.interfaceList = [];
      this.interfaceObj = changes.interfaceObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
      if (!_.isUndefined(this.interfaceObj.zoneid)) {
        this.getNetworkList();
      }
    }
  }
  clearForm() {
    this.interfaceForm = this.fb.group({
      interfacename: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      networkid: [null, Validators.required],
      gwvipv4: ["", Validators.required],
      primaryipv4: ["", Validators.required],
      secondaryipv4: ["", Validators.required],
      vrid: [1, Validators.required],
      netmask: [null, Validators.required],
      servicetype: ["internet", Validators.required],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.interFaceEditObj = {};
  }
  getNetworkList() {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      zoneid: this.interfaceObj.zoneid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2nework(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.networkList = response.data;
      } else {
        this.networkList = [];
      }
    });
  }
  getServiceTypeList() {
    const condition = {
      lookupkey: AppConstant.LOOKUPKEY.GATEWAYSERVICETYPE,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.servicetypeList = response.data;
      } else {
        this.servicetypeList = [];
      }
    });
  }
  editInterface(data) {
    this.interFaceEditObj = data;
    this.index = this.interfaceList.indexOf(data);
    this.interfaceForm = this.fb.group({
      interfacename: [
        data.interfacename,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      networkid: [
        _.find(this.networkList, { networkid: data.networkid }),
        Validators.required,
      ],
      gwvipv4: [data.gwvipv4, Validators.required],
      primaryipv4: [data.primaryipv4, Validators.required],
      secondaryipv4: [data.secondaryipv4, Validators.required],
      vrid: [data.vrid, Validators.required],
      netmask: [data.netmask, Validators.required],
      servicetype: [data.servicetype],
      description: [
        data.description,
        Validators.compose([Validators.maxLength(500)]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.interfaceForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.interfaceForm,
        this.interfaceErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        interfacename: data.interfacename,
        internetgatewayid: this.interfaceObj.internetgatewayid,
        ecl2internetgatewayid: this.interfaceObj.ecl2internetgatewayid,
        netmask: data.netmask,
        networkid: data.networkid.networkid,
        ecl2networkid: data.networkid.ecl2networkid,
        gwvipv4: data.gwvipv4,
        primaryipv4: data.primaryipv4,
        secondaryipv4: data.secondaryipv4,
        servicetype: data.servicetype,
        vrid: data.vrid,
        description: data.description,
        zoneid: this.interfaceObj.ecl2zones.zoneid,
        region: this.interfaceObj.ecl2zones.region,
        ecl2tenantid: this.interfaceObj.customer.ecl2tenantid,
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      let matchingsubnet: any;
      matchingsubnet = _.find(data.networkid.ecl2subnets, function (item: any) {
        if (item.gatewayip === data.gwvipv4) {
          return item;
        }
      });
      if (!_.isEmpty(matchingsubnet)) {
        let allocationpools: any;
        let startaddress;
        let endadddress;
        allocationpools = JSON.parse(matchingsubnet.allocationpools);
        allocationpools.forEach((element) => {
          startaddress = element.start.split(".");
          endadddress = element.end.split(".");
        });
        let ips;
        const unallocatedips = [];
        for (
          let i = Number(startaddress[3]);
          i <= Number(endadddress[3]);
          i++
        ) {
          ips =
            startaddress[0] +
            "." +
            startaddress[1] +
            "." +
            startaddress[2] +
            "." +
            i;
          unallocatedips.push(ips);
        }
        this.formdata.ecl2subnets = {
          subnetid: matchingsubnet.subnetid,
          unallocatedips: unallocatedips,
        };
      }
      if (
        !_.isUndefined(this.interFaceEditObj) &&
        !_.isUndefined(this.interFaceEditObj.iginterfaceid) &&
        !_.isEmpty(this.interFaceEditObj)
      ) {
        this.formdata.iginterfaceid = this.interFaceEditObj.iginterfaceid;
        this.formdata.ecl2iginterfaceid =
          this.interFaceEditObj.ecl2iginterfaceid;
        this.ecl2Service
          .updateecl2iginterface(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.interfaceList[this.index] = response.data;
              this.interfaceList = _.filter(this.interfaceList, function (i) {
                return i;
              });
              this.loading = false;
              this.disabled = false;
              this.messageService.success(response.message);
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
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service
          .createecl2iginterface(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.interfaceList = [...this.interfaceList, response.data];
              this.loading = false;
              this.disabled = false;
              this.messageService.success(response.message);
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

  deleteInterface(data) {
    this.loading = true;
    this.disabled = true;
    const formdata = {
      tenantid: this.userstoragedata.tenantid,
      iginterfaceid: data.iginterfaceid,
      region: this.interfaceObj.ecl2zones.region,
      ecl2tenantid: this.interfaceObj.customer.ecl2tenantid,
      ecl2iginterfaceid: data.ecl2iginterfaceid,
      status: AppConstant.STATUS.DELETED,
    };
    this.ecl2Service.deleteecl2iginterface(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.clearForm();
        this.interfaceList.splice(this.interfaceList.indexOf(data), 1);
        this.interfaceList = [...this.interfaceList];
        this.loading = false;
        this.disabled = false;
        this.messageService.success(response.message);
        this.clearForm();
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
