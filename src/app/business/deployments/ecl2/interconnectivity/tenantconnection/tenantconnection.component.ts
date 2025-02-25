import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { DeploymentsService } from "../../../deployments.service";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { Ecl2Service } from "../../ecl2-service";
import * as _ from "lodash";

@Component({
  selector: "app-tenantconnection",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/interconnectivity/tenantconnection/tenantconnection.component.html",
})
export class TenantconnectionComponent implements OnInit, OnChanges {
  @Input() tenantconnectionObj: any;
  instanceList: any = [];
  userstoragedata: any = {};
  tenantConnectionList: any = [];
  tenantconnErrObj: any = {};
  formdata: any = {};
  removeitem: any = {};
  formDisabled = false;
  loading = false;
  index: any;
  tags: FormArray;
  disabled = false;
  tenantConnEditObj: any = {};
  tenantconnectionForm: FormGroup;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  constructor(
    private deploymentsService: DeploymentsService,
    private messageService: NzMessageService,
    private fb: FormBuilder,
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
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.tenantconnectionObj) &&
      !_.isEmpty(changes.tenantconnectionObj.currentValue) &&
      !_.isUndefined(
        changes.tenantconnectionObj.currentValue.tenantconnrequestid
      )
    ) {
      this.tenantconnectionObj = changes.tenantconnectionObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.getConnectionDetails(this.tenantconnectionObj);
      // this.getInstanceList();
    } else {
      this.tenantconnectionObj = changes.tenantconnectionObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  getConnectionDetails(obj) {
    const condition = {
      tenantconnrequestid: obj.tenantconnrequestid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.getECL2TenantConnectionList(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (!_.isEmpty(element.instance)) {
            this.tenantConnectionList.push(element);
            this.instanceList.push(element.instance);
          }
        });
        this.instanceList = [...this.instanceList];
        this.tenantConnectionList = [...this.tenantConnectionList];
      } else {
        this.instanceList = [];
        this.tenantConnectionList = [];
      }
    });
  }
  clearForm() {
    this.tenantconnectionForm = this.fb.group({
      name: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      deviceid: [null, Validators.required],
      tags: this.fb.array([this.createItem()]),
    });
  }
  addItem() {
    this.tags = this.tenantconnectionForm.get("tags") as FormArray;
    this.tags.push(this.createItem());
  }
  getFormArray(type): FormArray {
    return this.tenantconnectionForm.get(type) as FormArray;
  }
  removeItem(index) {
    this.tags = this.tenantconnectionForm.get("tags") as FormArray;
    const currentindex = this.tags.value.length;
    if (currentindex !== 1) {
      let item = {} as any;
      item = this.tags.controls[index].value;
      item.status = "Inactive";
      this.removeitem = item;
      this.tags.removeAt(index);
    }
  }
  createItem(value?) {
    if (!_.isEmpty(value)) {
      return this.fb.group({
        tagid: [value.tagid],
        tagkey: [!_.isEmpty(value) ? value.tagkey : null],
        tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
        resourceid: [!_.isEmpty(value) ? value.resourceid : null],
        resourcetype: ["TenantConn"],
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      });
    } else {
      return this.fb.group({
        tagkey: [value ? value.tagkey : null],
        tagvalue: [value ? value.tagvalue : null],
        status: [AppConstant.STATUS.ACTIVE],
        resourcetype: ["TenantConn"],
        resourceid: [
          !_.isEmpty(this.tenantConnEditObj)
            ? this.tenantConnEditObj.tenantconnectionid
            : null,
        ],
        tenantid: this.userstoragedata.tenantid,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      });
    }
  }
  editConnection(data) {
    this.tenantConnEditObj = data;
    this.instanceList.push(data.instance);
    this.tenantconnectionForm = this.fb.group({
      name: [
        data.name,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      description: [
        data.description,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      deviceid: [data.instance, Validators.required],
      tags: this.fb.array([this.createItem()]),
    });
    if (!_.isEmpty(data.ecl2tags)) {
      this.tags = this.tenantconnectionForm.get("tags") as FormArray;
      this.tags.removeAt(0);
      data.ecl2tags.forEach((element) => {
        if (element.resourcetype === "TenantConn") {
          this.tags.push(this.createItem(element));
        }
      });
    }
  }
  deleteConnection(data) {
    this.loading = true;
    this.disabled = true;
    const condition = {
      tenantid: data.tenantid,
      tenantconnectionid: data.tenantconnectionid,
      region: this.tenantconnectionObj.sourcecustomer.ecl2region,
      ecl2tenantid: this.tenantconnectionObj.sourcecustomer.ecl2tenantid,
      eclttenantconnectionid: data.eclttenantconnectionid,
      status: "Deleted",
    };
    this.ecl2Service.deleteECL2TenantConnection(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.data) {
        this.clearForm();
        this.tenantConnectionList.splice(
          this.tenantConnectionList.indexOf(data),
          1
        );
        this.tenantConnectionList = [...this.tenantConnectionList];
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

  // getInstanceList() {
  // const condition = {
  //   tenantid: this.userstoragedata.tenantid,
  //   cloudprovider: AppConstant.CLOUDPROVIDER.ECL2,
  //   clientid: this.tenantconnectionObj.customerid,
  //   status: AppConstant.STATUS.ACTIVE
  // };
  // this.deploymentsService.allecl2(condition).subscribe((res) => {
  //   const response = JSON.parse(res._body);
  //   if (response.status) {
  //     let ecl2deployments = [] as any;
  //     response.data.forEach(item => {
  //       _.map(item.ecl2deployments, function (obj: any) {
  //         if (obj.status === AppConstant.STATUS.DEPLOYED) {
  //           obj.instancename = obj.instancename;
  //           obj.ecl2serverid = obj.ecl2serverid;
  //           ecl2deployments.push(obj);
  //           return ecl2deployments;
  //         }
  //       });
  //     });
  //     this.instanceList = ecl2deployments;

  //     // if (!_.isEmpty(ecl2deployments) && !_.isEmpty(this.tenantConnectionList)) {
  //     //   const selecteditems = [] as any;
  //     //   this.instanceList = [];
  //     //   ecl2deployments.forEach(element => {
  //     //     _.map(this.tenantConnectionList, function (item) {
  //     //       if (item.deviceid !== element.ecl2deploymentid) {
  //     //         selecteditems.push(element);
  //     //         return selecteditems;
  //     //       }
  //     //     });
  //     //   });
  //     //   this.instanceList = selecteditems;
  //     // }
  //   } else {
  //     this.instanceList = [];
  //   }
  // });
  // }
  saveOrUpdate(data) {
    this.formDisabled = true;
    this.loading = true;
    let errorMessage: any;
    if (this.tenantconnectionForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.tenantconnectionForm,
        this.tenantconnErrObj
      );
      this.loading = false;
      this.formDisabled = false;
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        customerid: this.tenantconnectionObj.customerid,
        tenantconnrequestid: this.tenantconnectionObj.tenantconnrequestid,
        ecltenantconnrequestid: this.tenantconnectionObj.ecltenantconnrequestid,
        deviceid: data.deviceid.ecl2deploymentid,
        ecl2serverid: data.deviceid.ecl2serverid,
        name: data.name,
        description: data.description,
        notes: data.description,
        ecl2tenantid: this.tenantconnectionObj.sourcecustomer.ecl2tenantid,
        region: this.tenantconnectionObj.sourcecustomer.ecl2region,
        status:
          data.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };

      this.formdata.tags = {};
      if (!_.isEmpty(data.tags)) {
        let result = {};
        let tags = [] as any;
        for (let i = 0; i < data.tags.length; i++) {
          if (data.tags[i].tagkey != null && data.tags[i].tagvalue != null) {
            result[data.tags[i].tagkey] = data.tags[i].tagvalue;
            tags.push(data.tags[i]);
          }
        }
        this.formdata.tags = {
          ...result,
        };
        data.ecl2tags = tags;
        if (data.ecl2tags.length !== 0) {
          this.formdata.ecl2tags = !_.isEmpty(this.removeitem)
            ? [...data.tags, this.removeitem]
            : data.tags;
        }
      }
      if (
        !_.isUndefined(this.tenantConnEditObj) &&
        !_.isUndefined(this.tenantConnEditObj.tenantconnectionid) &&
        !_.isEmpty(this.tenantConnEditObj)
      ) {
        this.formdata.tenantconnectionid =
          this.tenantConnEditObj.tenantconnectionid;
        this.formdata.eclttenantconnectionid =
          this.tenantConnEditObj.eclttenantconnectionid;
        this.formdata.region =
          this.tenantconnectionObj.sourcecustomer.ecl2region;
        this.formdata.ecl2tenantid =
          this.tenantconnectionObj.sourcecustomer.ecl2tenantid;
        this.ecl2Service
          .updateECL2TenantConnection(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.loading = false;
              this.formDisabled = false;
              response.data.ecl2deployments = {};
              response.data.ecl2deployments = data.deviceid;
              response.data.ecl2tags = data.ecl2tags;
              this.tenantConnectionList[this.index] = response.data;
              this.tenantConnectionList = _.filter(
                this.tenantConnectionList,
                function (i) {
                  return i;
                }
              );
              this.messageService.success(response.message);
              this.clearForm();
            } else {
              this.loading = false;
              this.formDisabled = false;
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
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.createddt = new Date();
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service
          .createECL2TenantConnection(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.loading = false;
              this.formDisabled = false;
              this.messageService.success(response.message);
              response.data.ecl2deployments = {};
              response.data.ecl2deployments = data.deviceid;
              this.tenantConnectionList = [
                ...this.tenantConnectionList,
                response.data,
              ];
              this.clearForm();
            } else {
              this.loading = false;
              this.formDisabled = false;
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
