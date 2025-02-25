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
import { LocalStorageService } from "../../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../../app.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { Ecl2Service } from "../../../ecl2-service";

@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-subnet",
  templateUrl:
    "../../../../../../presentation/web/deployments/ecl2/network/subnet/add-edit-subnet/add-edit-subnet.component.html",
})
export class ECL2AddEditSubnetComponent implements OnInit, OnChanges {
  @Input() inputdisabled: boolean;
  @Input() subnetObj: any;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  zoneList: any = {};
  ecl2subnetForm: FormGroup;
  subnetList: any = [];
  allocationpool: FormArray;
  hostroute: FormArray;
  subnettags: FormArray;
  index;
  values: string[];
  networkObj: any = {};
  zoneObj: any = {};
  ecl2SubnetObj: any = {};
  removeitem: any = {};
  disabled = false;
  loading = false;
  ecl2subnetErrObj = {
    subnetname: AppConstant.VALIDATIONS.ECL2.SUBNET.SUBNETNAME,
    subnetcidr: AppConstant.VALIDATIONS.ECL2.SUBNET.CIDR,
    description: AppConstant.VALIDATIONS.ECL2.SUBNET.DESCRIPTION,
    start: AppConstant.VALIDATIONS.ECL2.SUBNET.STARTADDRESS,
    end: AppConstant.VALIDATIONS.ECL2.SUBNET.ENDADDRESS,
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
    if (_.isUndefined(this.subnetObj) || _.isEmpty(this.subnetObj)) {
      this.clearForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.subnetObj) &&
      !_.isEmpty(changes.subnetObj.currentValue) &&
      !_.isEmpty(changes.subnetObj.currentValue.ecl2subnets)
    ) {
      this.clearForm();
      this.subnetObj = changes.subnetObj.currentValue.ecl2subnets;
      this.networkObj = changes.subnetObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.subnetList = this.subnetObj;
    } else {
      this.clearForm();
      this.subnetList = [];
      this.networkObj = changes.subnetObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
    if (!_.isUndefined(changes.subnetObj.currentValue.zoneid)) {
      this.getZone();
    }
  }
  getZone() {
    this.ecl2Service.byId(this.networkObj.zoneid).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.zoneList = response.data;
      } else {
        this.zoneList = {};
      }
    });
  }
  editSubnet(data) {
    this.ecl2SubnetObj = data;
    this.index = this.subnetList.indexOf(data);
    this.ecl2subnetForm = this.fb.group({
      subnetid: [data.subnetid],
      subnetname: [
        data.subnetname,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      gatewayip: [data.gatewayip],
      subnetcidr: [{ value: data.subnetcidr, disabled: true }],
      enabledhcp: [data.enabledhcp === "Y" ? true : false],
      dnsnameservers: [
        _.isEmpty(data.dnsnameservers) ? [] : JSON.parse(data.dnsnameservers),
      ],
      ntpservers: [
        _.isEmpty(data.ntpservers) ? [] : JSON.parse(data.ntpservers),
      ],
      description: [data.description],
      status: [data.status],
      allocationpool: !_.isEmpty(data.allocationpools)
        ? this.fb.array([])
        : this.fb.array([this.createItem("Pools")]),
      hostroute: !_.isEmpty(data.hostroutes)
        ? this.fb.array([])
        : this.fb.array([this.createItem("Routes")]),
      subnettags: this.fb.array([this.createItem("Tag")]),
    });
    if (!_.isEmpty(data.hostroutes)) {
      const hostrouteDate = JSON.parse(data.hostroutes);
      this.hostroute = this.ecl2subnetForm.get("hostroute") as FormArray;
      hostrouteDate.forEach((element) => {
        this.hostroute.push(
          this.fb.group({
            destination: [element.destination],
            nexthop: [element.nexthop],
          })
        );
      });
    }
    if (!_.isEmpty(data.allocationpools)) {
      const allocationpoolData = JSON.parse(data.allocationpools);
      this.allocationpool = this.ecl2subnetForm.get(
        "allocationpool"
      ) as FormArray;
      allocationpoolData.forEach((element) => {
        this.allocationpool.push(
          this.fb.group({
            end: [{ value: element.end, disabled: true }, Validators.required],
            start: [
              { value: element.start, disabled: true },
              Validators.required,
            ],
          })
        );
      });
    }
    if (!_.isEmpty(data.subnettags)) {
      this.subnettags = this.ecl2subnetForm.get("subnettags") as FormArray;
      this.subnettags.removeAt(0);
      data.subnettags.forEach((element) => {
        if (element.resourcetype === "Subnet") {
          this.subnettags.push(this.createItem("Tag", element));
        }
      });
    }
  }
  clearForm() {
    this.ecl2subnetForm = this.fb.group({
      subnetid: [null],
      subnetname: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      gatewayip: [""],
      subnetcidr: [
        null,
        [
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ],
      ],
      enabledhcp: [true],
      dnsnameservers: [],
      ntpservers: [],
      description: ["", Validators.compose([Validators.maxLength(500)])],
      status: ["Active"],
      allocationpool: this.fb.array([this.createItem("Pools")]),
      hostroute: this.fb.array([this.createItem("Routes")]),
      subnettags: this.fb.array([this.createItem("Tag")]),
    });
    this.subnetObj = {};
    this.ecl2SubnetObj = {};
  }
  addItem(type) {
    switch (type) {
      case "Pools":
        this.allocationpool = this.ecl2subnetForm.get(
          "allocationpool"
        ) as FormArray;
        this.allocationpool.push(this.createItem("Pools"));
        break;
      case "Routes":
        this.hostroute = this.ecl2subnetForm.get("hostroute") as FormArray;
        this.hostroute.push(this.createItem("Routes"));
        break;
      case "Tag":
        this.subnettags = this.ecl2subnetForm.get("subnettags") as FormArray;
        this.subnettags.push(this.createItem("Tag"));
        break;
    }
  }
  createItem(type, value?): FormGroup {
    if (type === "Pools") {
      return this.fb.group({
        start: [null, Validators.required],
        end: [null, Validators.required],
      });
    } else if (type === "Routes") {
      return this.fb.group({
        destination: [null],
        nexthop: [null],
      });
    } else if (type === "Tag") {
      if (!_.isEmpty(value)) {
        return this.fb.group({
          tagid: [value.tagid],
          tagkey: [!_.isEmpty(value) ? value.tagkey : null],
          tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
          resourceid: [!_.isEmpty(value) ? value.resourceid : null],
          resourcetype: ["Subnet"],
          status: [!_.isEmpty(value) ? value.status : "Active"],
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        });
      } else {
        return this.fb.group({
          tagkey: [!_.isEmpty(value) ? value.tagkey : null],
          tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
          tenantid: this.userstoragedata.tenantid,
          resourceid: [
            !_.isEmpty(this.ecl2SubnetObj) ? this.ecl2SubnetObj.subnetid : null,
          ],
          resourcetype: ["Subnet"],
          status: ["Active"],
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        });
      }
    }
  }
  getFormArray(type): FormArray {
    return this.ecl2subnetForm.get(type) as FormArray;
  }
  removeItem(index, type) {
    switch (type) {
      case "Pools":
        this.allocationpool = this.ecl2subnetForm.get(
          "allocationpool"
        ) as FormArray;
        if (this.allocationpool.value.length !== 1) {
          this.allocationpool.removeAt(index);
        }
        break;
      case "Routes":
        this.hostroute = this.ecl2subnetForm.get("hostroute") as FormArray;
        if (this.hostroute.value.length !== 1) {
          this.hostroute.removeAt(index);
        }
        break;
      case "Tag":
        this.subnettags = this.ecl2subnetForm.get("subnettags") as FormArray;
        if (this.subnettags.value.length !== 1) {
          let item = {} as any;
          item = this.subnettags.controls[index].value;
          item.status = "Inactive";
          this.removeitem = item;
          this.subnettags.removeAt(index);
        }
        break;
    }
  }
  saveUpdateSubnet(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2subnetForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.ecl2subnetForm,
        this.ecl2subnetErrObj,
        "allocationpool"
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let formdata = {} as any;
      formdata = {
        tenantid: this.userstoragedata.tenantid,
        subnetname: data.subnetname,
        gatewayip: !_.isEmpty(data.gatewayip) ? data.gatewayip : "",
        subnetcidr: data.subnetcidr,
        enabledhcp: data.enabledhcp === true ? "Y" : "N",
        dnsnameservers: !_.isEmpty(data.dnsnameservers)
          ? JSON.stringify(data.dnsnameservers)
          : "",
        ntpservers: !_.isEmpty(data.ntpservers)
          ? JSON.stringify(data.ntpservers)
          : "",
        description: data.description,
        status: AppConstant.STATUS.ACTIVE,
        ecl2networkid: !_.isEmpty(this.ecl2SubnetObj)
          ? this.ecl2SubnetObj.ecl2networkid
          : this.networkObj.ecl2networkid,
        networkid: !_.isEmpty(this.ecl2SubnetObj)
          ? this.ecl2SubnetObj.networkid
          : this.networkObj.networkid,
        zoneid: this.zoneList.zoneid,
        region: this.zoneList.region,
        customerid: this.networkObj.customer.customerid,
        ecl2tenantid: this.networkObj.customer.ecl2tenantid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };

      if (!_.isEmpty(data.allocationpool)) {
        data.allocationpool.forEach((element) => {
          if (element.end != null && element.start != null) {
            formdata.allocationpools = JSON.stringify(data.allocationpool);
          } else {
            formdata.allocationpools = "";
          }
        });
      }

      if (!_.isEmpty(data.hostroute)) {
        data.hostroute.forEach((element) => {
          if (element.destination != null && element.nexthop != null) {
            formdata.hostroutes = JSON.stringify(data.hostroute);
          } else {
            formdata.hostroutes = "";
          }
        });
      }
      formdata.tags = {};
      if (!_.isEmpty(data.subnettags)) {
        let result = {};
        let tags = [] as any;
        for (let i = 0; i < data.subnettags.length; i++) {
          if (
            data.subnettags[i].tagkey != null &&
            data.subnettags[i].tagvalue != null
          ) {
            result[data.subnettags[i].tagkey] = data.subnettags[i].tagvalue;
            tags.push(data.subnettags[i]);
          }
        }
        formdata.tags = {
          ...result,
        };
        data.subnettags = tags;
        if (data.subnettags.length !== 0) {
          formdata.subnettags = !_.isEmpty(this.removeitem)
            ? [...data.subnettags, this.removeitem]
            : data.subnettags;
        }
      }
      if (
        !_.isUndefined(this.ecl2SubnetObj) &&
        !_.isEmpty(this.ecl2SubnetObj) &&
        !_.isNull(this.ecl2SubnetObj.subnetid)
      ) {
        formdata.subnetid = this.ecl2SubnetObj.subnetid;
        formdata.ecl2subnetid = this.ecl2SubnetObj.ecl2subnetid;
        this.ecl2Service.updateecl2subnet(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.clearForm();
            this.subnetList[this.index] = response.data;
            this.subnetList = _.filter(this.subnetList, function (i) {
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
        formdata.createdby = this.userstoragedata.fullname;
        formdata.createddt = new Date();
        this.ecl2Service.createecl2subnet(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.clearForm();
            this.subnetList = [...this.subnetList, response.data];
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

  deleteSubnet(data) {
    this.loading = true;
    this.disabled = true;
    const formdata = {
      tenantid: this.userstoragedata.tenantid,
      subnetid: data.subnetid,
      region: this.zoneList.region,
      ecl2tenantid: this.networkObj.customer.ecl2tenantid,
      ecl2subnetid: data.ecl2subnetid,
      status: AppConstant.STATUS.DELETED,
    };
    this.ecl2Service.deleteecl2subnet(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.clearForm();
        this.subnetList.splice(this.subnetList.indexOf(data), 1);
        this.subnetList = [...this.subnetList];
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
