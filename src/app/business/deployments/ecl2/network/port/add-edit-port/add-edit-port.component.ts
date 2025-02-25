import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../../app.constant";
import { Ecl2Service } from "../../../ecl2-service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-port",
  templateUrl:
    "../../../../../../presentation/web/deployments/ecl2/network/port/add-edit-port/add-edit-port.component.html",
})
export class ECL2AddEditPortComponent implements OnInit, OnChanges {
  @Input() inputdisabled: boolean;
  @Input() portObj: any;
  networkObj: any = {};
  segmentaionTypeList: any = [];
  stateupList: any = [];
  ecl2portForm: FormGroup;
  fixedIp: FormArray;
  addresspair: FormArray;
  porttags: FormArray;
  subnetList: any = [];
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  portList: any = [];
  ecl2portErrObj = {
    portname: AppConstant.VALIDATIONS.ECL2.PORT.PORTNAME,
    segmentationtype: AppConstant.VALIDATIONS.ECL2.PORT.SEGMENTATIONTYPE,
    adminstateup: AppConstant.VALIDATIONS.ECL2.PORT.ADMINSTATE,
  };
  index: any;
  zoneList: any = {};
  removeitem: any = {};
  disabled = false;
  loading = false;
  ecl2PortObj: any = {};
  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private notificationService: NzNotificationService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    if (_.isUndefined(this.portObj) || _.isEmpty(this.portObj)) {
      this.clearForm();
    }
    this.getSegmentationList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.portObj) &&
      !_.isEmpty(changes.portObj.currentValue) &&
      !_.isEmpty(changes.portObj.currentValue.ecl2ports)
    ) {
      this.clearForm();
      this.portObj = changes.portObj.currentValue.ecl2ports;
      this.networkObj = changes.portObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.portList = this.portObj;
      this.getSubnetList();
    } else {
      this.clearForm();
      this.portList = [];
      this.networkObj = changes.portObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
      this.getSubnetList();
    }
    if (!_.isUndefined(this.networkObj.networkid)) {
      this.getZone();
    }
  }
  clearForm() {
    this.ecl2portForm = this.fb.group({
      portid: [null],
      portname: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      segmentationtype: [null, Validators.required],
      segmentationid: [""],
      adminstateup: [null, Validators.required],
      description: [""],
      fixedIp: this.fb.array([this.createItem("IP")]),
      addresspair: this.fb.array([this.createItem("Address")]),
      porttags: this.fb.array([this.createItem("Tag")]),
    });
    this.portObj = {};
    this.ecl2PortObj = {};
  }
  editPort(data) {
    this.ecl2PortObj = data;
    this.index = this.portList.indexOf(data);
    this.ecl2portForm = this.fb.group({
      portid: [data.portid],
      portname: [data.portname],
      segmentationtype: [
        !_.isEmpty(data.segmentationtype) ? data.segmentationtype : "",
      ],
      segmentationid: [data.segmentationid],
      adminstateup: [data.adminstateup === "Y" ? "UP" : "DOWN"],
      description: [data.description],
      fixedIp: !_.isEmpty(data.fixedips)
        ? this.fb.array([])
        : this.fb.array([this.createItem("IP")]),
      addresspair: !_.isEmpty(data.allowedaddresspairs)
        ? this.fb.array([])
        : this.fb.array([this.createItem("Address")]),
      porttags: this.fb.array([this.createItem("Tag")]),
    });
    if (!_.isEmpty(data.allowedaddresspairs)) {
      const address = JSON.parse(data.allowedaddresspairs);
      this.addresspair = this.ecl2portForm.get("addresspair") as FormArray;
      address.forEach((element) => {
        this.addresspair.push(
          this.fb.group({
            ip_address: [element.ip_address],
            mac_address: [element.mac_address],
          })
        );
      });
    }
    if (!_.isEmpty(data.fixedips)) {
      const fixedipData = JSON.parse(data.fixedips);
      this.fixedIp = this.ecl2portForm.get("fixedIp") as FormArray;
      fixedipData.forEach((element) => {
        this.fixedIp.push(
          this.fb.group({
            ip_address: [{ value: element.ip_address, disabled: true }],
            subnet_id: [{ value: element.subnet_id, disabled: true }],
          })
        );
      });
    }
    if (!_.isEmpty(data.porttags)) {
      this.porttags = this.ecl2portForm.get("porttags") as FormArray;
      this.porttags.removeAt(0);
      data.porttags.forEach((element) => {
        if (element.resourcetype === "Port") {
          this.porttags.push(this.createItem("Tag", element));
        }
      });
    }
  }
  getFormArray(type): FormArray {
    return this.ecl2portForm.get(type) as FormArray;
  }
  addItem(type) {
    switch (type) {
      case "IP":
        this.fixedIp = this.ecl2portForm.get("fixedIp") as FormArray;
        this.fixedIp.push(this.createItem(type));
        break;
      case "Address":
        this.addresspair = this.ecl2portForm.get("addresspair") as FormArray;
        this.addresspair.push(this.createItem(type));
        break;
      case "Tag":
        this.porttags = this.ecl2portForm.get("porttags") as FormArray;
        this.porttags.push(this.createItem(type));
        break;
    }
  }
  createItem(type, value?): FormGroup {
    if (type === "Address") {
      return this.fb.group({
        ip_address: [null],
        mac_address: [null],
      });
    } else if (type === "IP") {
      return this.fb.group({
        subnet_id: [null],
        ip_address: [null],
      });
    } else if (type === "Tag") {
      if (!_.isEmpty(value)) {
        return this.fb.group({
          tagid: [value.tagid],
          tagkey: [!_.isEmpty(value) ? value.tagkey : null],
          tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
          resourceid: [!_.isEmpty(value) ? value.resourceid : null],
          resourcetype: ["Port"],
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        });
      } else {
        return this.fb.group({
          tagkey: [!_.isEmpty(value) ? value.tagkey : null],
          tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
          tenantid: this.userstoragedata.tenantid,
          resourceid: [
            !_.isEmpty(this.ecl2PortObj) ? this.ecl2PortObj.portid : null,
          ],
          resourcetype: ["Port"],
          status: ["Active"],
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        });
      }
    }
  }
  removeItem(index, type) {
    switch (type) {
      case "IP":
        this.fixedIp = this.ecl2portForm.get("fixedIp") as FormArray;
        if (this.fixedIp.value.length != 1) {
          this.fixedIp.removeAt(index);
        }
        break;
      case "Address":
        this.addresspair = this.ecl2portForm.get("addresspair") as FormArray;
        if (this.addresspair.value.length != 1) {
          this.addresspair.removeAt(index);
        }
        break;
      case "Tag":
        this.porttags = this.ecl2portForm.get("porttags") as FormArray;
        if (this.porttags.value.length != 1) {
          let item = {} as any;
          item = this.porttags.controls[index].value;
          item.status = "Inactive";
          this.removeitem = item;
          this.porttags.removeAt(index);
        }
        break;
    }
  }

  getSegmentationList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.SEGMENTATIONTYPE,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          this.segmentaionTypeList = response.data;
        } else {
          this.segmentaionTypeList = [];
        }
      });
  }
  getSubnetList() {
    const condition = {
      networkid: this.networkObj.networkid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2subnet(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.subnetList = _.map(response.data, function (item: any) {
          item.subnetname = item.subnetname + "(" + item.subnetcidr + ")";
          return item;
        });
      } else {
        this.subnetList = [];
      }
    });
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
  saveUpdatePort(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2portForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2portForm,
        this.ecl2portErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let formdata = {} as any;
      formdata = {
        tenantid: this.userstoragedata.tenantid,
        portname: data.portname,
        networkid: this.networkObj.networkid,
        ecl2networkid: this.networkObj.ecl2networkid,
        segmentationtype: !_.isNull(data.segmentationtype)
          ? data.segmentationtype
          : "",
        segmentationid: data.segmentationid,
        adminstateup: data.adminstateup == "UP" ? "Y" : "N",
        description: data.description,
        zoneid: this.zoneList.zoneid,
        region: this.zoneList.region,
        customerid: this.networkObj.customer.customerid,
        ecl2tenantid: this.networkObj.customer.ecl2tenantid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (!_.isEmpty(data.addresspair)) {
        data.addresspair.forEach((element) => {
          if (element.ip_address != null && element.mac_address != null) {
            formdata.allowedaddresspairs = JSON.stringify(data.addresspair);
          } else {
            formdata.allowedaddresspairs = "";
          }
        });
      }
      if (!_.isEmpty(data.fixedIp)) {
        data.fixedIp.forEach((element) => {
          if (element.ip_address != null && element.subnet_id != null) {
            formdata.fixedips = JSON.stringify(data.fixedIp);
          } else {
            formdata.fixedips = "";
          }
        });
      }
      formdata.tags = {};
      if (!_.isEmpty(data.porttags)) {
        let result = {};
        for (let i = 0; i < data.porttags.length; i++) {
          if (
            data.porttags[i].tagkey != null &&
            data.porttags[i].tagvalue != null
          ) {
            result[data.porttags[i].tagkey] = data.porttags[i].tagvalue;
          }
        }
        formdata.tags = {
          ...result,
        };
        let tags = [] as any;
        _.map(data.porttags, function (obj) {
          if (obj.tagkey !== null && obj.tagvalue !== null) {
            tags.push(obj);
            return obj;
          }
        });
        data.porttags = tags;
        if (data.porttags.length != 0) {
          formdata.porttags = !_.isEmpty(this.removeitem)
            ? [...data.porttags, this.removeitem]
            : data.porttags;
        }
      }

      if (
        !_.isUndefined(this.ecl2PortObj) &&
        !_.isEmpty(this.ecl2PortObj) &&
        !_.isNull(this.ecl2PortObj.portid)
      ) {
        formdata.portid = this.ecl2PortObj.portid;
        formdata.ecl2portid = this.ecl2PortObj.ecl2portid;
        formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.updateecl2port(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.portList[this.index] = response.data;
            this.portList = _.filter(this.portList, function (i) {
              return i;
            });
            this.clearForm();
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
        this.ecl2Service.createecl2port(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.portList = [...this.portList, response.data];
            this.clearForm();
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

  deletePort(data) {
    this.loading = true;
    this.disabled = true;
    const formdata = {
      tenantid: data.tenantid,
      portid: data.portid,
      region: this.zoneList.region,
      ecl2tenantid: this.networkObj.customer.ecl2tenantid,
      ecl2portid: data.ecl2portid,
      status: "Deleted",
    };
    this.ecl2Service.deleteecl2port(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.clearForm();
        this.portList.splice(this.portList.indexOf(data), 1);
        this.portList = [...this.portList];
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
