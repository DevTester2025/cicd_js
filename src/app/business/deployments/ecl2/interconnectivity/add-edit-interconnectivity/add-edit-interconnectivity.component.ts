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
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { Ecl2Service } from "../../ecl2-service";
@Component({
  selector: "app-add-edit-interconnectivity",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/interconnectivity/add-edit-interconnectivity/add-edit-interconnectivity.component.html",
})
export class AddEditInterconnectivityComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() interConnectivityObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata: any = {};
  tenantconnectionObj: any = {};
  interconnecitivityForm: FormGroup;
  approvalForm: FormGroup;
  ecl2tags: FormArray;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  customerList: any = [];
  networkList: any = [];
  loading = false;
  formDisabled = false;
  formdata: any = {};
  removeitem: any = [];
  edit = false;
  isVisible = false;
  admintenantid: any;
  secretkey: any;
  accesskey: any;
  interconnecitivityErrObj = {
    name: AppConstant.VALIDATIONS.ECL2.INTERTENANTCONN.NAME,
    description: AppConstant.VALIDATIONS.ECL2.INTERTENANTCONN.DESCRIPTION,
    ecl2tenantidother:
      AppConstant.VALIDATIONS.ECL2.INTERTENANTCONN.DESTINATIONTENANT,
    ecl2networkid:
      AppConstant.VALIDATIONS.ECL2.INTERTENANTCONN.DESTINATIONNETWORK,
    // sourcecustomerid: AppConstant.VALIDATIONS.ECL2.INTERTENANTCONN.DESTINATIONTENANT,
    // networkid: AppConstant.VALIDATIONS.ECL2.INTERTENANTCONN.DESTINATIONNETWORK
  };
  approvalErrObj = {
    accesskey: AppConstant.VALIDATIONS.ECL2.INTERCONNAPPROVAL.ACCESSKEY,
    secretkey: AppConstant.VALIDATIONS.ECL2.INTERCONNAPPROVAL.SECRETKEY,
    admintenantid: AppConstant.VALIDATIONS.ECL2.INTERCONNAPPROVAL.ADMINTENANTID,
  };
  constructor(
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
    // this.getCustomerList();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.interConnectivityObj) &&
      !_.isEmpty(changes.interConnectivityObj.currentValue) &&
      !_.isUndefined(
        changes.interConnectivityObj.currentValue.tenantconnrequestid
      )
    ) {
      this.interConnectivityObj = changes.interConnectivityObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.interConnectivityObj);
      this.edit = true;
    } else {
      this.clearForm();
      this.interConnectivityObj = changes.interConnectivityObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.interconnecitivityForm = this.fb.group({
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
          Validators.maxLength(500),
        ]),
      ],
      // sourcecustomerid: [null, Validators.required],
      ecl2tenantidother: [null, Validators.required],
      ecl2networkid: [null, Validators.required],
      // networkid: [null, Validators.required],
      ecl2tags: this.fb.array([this.createItem()]),
    });
    this.approvalForm = this.fb.group({
      accesskey: ["", Validators.required],
      secretkey: ["", Validators.required],
      admintenantid: ["", Validators.required],
    });
  }
  generateEditForm(data) {
    // this.customerList.push(data.descustomer);
    // this.networkList.push(data.desnetwork);
    this.interconnecitivityForm = this.fb.group({
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
      // sourcecustomerid: [data.descustomer, Validators.required],
      ecl2tenantidother: [data.ecl2tenantidother, Validators.required],
      ecl2networkid: [data.ecl2networkid, Validators.required],
      // networkid: [data.desnetwork, Validators.required],
      ecl2tags: this.fb.array([this.createItem()]),
    });
    if (!_.isEmpty(data.ecl2tags)) {
      console.log("Tags");
      const ecl2tags = this.interconnecitivityForm.get("ecl2tags") as FormArray;
      ecl2tags.removeAt(0);
      data.ecl2tags.forEach((element) => {
        if (element.resourcetype === "TenantReq") {
          ecl2tags.push(
            this.fb.group({
              tagid: [element.tagid],
              tagkey: [element.tagkey],
              tagvalue: [element.tagvalue],
              resourcetype: [element.resourcetype],
              createdby: [element.createdby],
              createddt: [element.createddt],
              lastupdatedby: [this.userstoragedata.fullname],
              lastupdateddt: [new Date()],
              status: [element.status],
            })
          );
        }
      });
    }
    this.approvalForm = this.fb.group({
      accesskey: ["", Validators.required],
      secretkey: ["", Validators.required],
      admintenantid: ["", Validators.required],
    });
  }
  handleCancel() {
    this.isVisible = false;
    this.saveOrUpdate();
  }
  handleOk() {
    let errorMessage: any;
    if (this.approvalForm.status === AppConstant.FORMSTATUS.INVALID) {
      errorMessage = this.commonService.getFormErrorMessage(
        this.approvalForm,
        this.approvalErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.isVisible = false;
      this.saveOrUpdate();
    }
  }
  SelectedValue() {
    this.tenantconnectionObj = this.interConnectivityObj;
  }
  createItem(value?) {
    return this.fb.group({
      tagkey: [null],
      tagvalue: [null],
      resourcetype: ["TenantReq"],
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      status: [AppConstant.STATUS.ACTIVE],
      tenantid: [this.userstoragedata.tenantid],
    });
  }
  addItem() {
    this.ecl2tags = this.interconnecitivityForm.get("ecl2tags") as FormArray;
    this.ecl2tags.push(this.createItem());
  }
  removeItem(index) {
    this.ecl2tags = this.interconnecitivityForm.get("ecl2tags") as FormArray;
    const currentindex = this.ecl2tags.value.length;
    if (currentindex !== 1) {
      let item = {} as any;
      item = this.ecl2tags.controls[index].value;
      item.status = AppConstant.STATUS.INACTIVE;
      this.removeitem.push(item);
      this.ecl2tags.removeAt(index);
    }
  }
  // getCustomerList() {
  //   this.commonService.allCustomers({ status: AppConstant.STATUS.ACTIVE, tenantid: this.userstoragedata.tenantid }).subscribe((res) => {
  //     const response = JSON.parse(res._body);
  //     if (response.status) {
  //       let customer = this.interConnectivityObj.customerid;
  //       _.remove(response.data, function (obj: any) { if (obj.customerid === customer) { return obj; } });
  //       this.customerList = response.data;
  //     } else {
  //       this.customerList = [];
  //     }
  //   });
  // }

  // onCustomerChange(event) {
  //   const condition = {
  //     status: AppConstant.STATUS.ACTIVE,
  //     tenantid: this.userstoragedata.tenantid,
  //     customerid: event.customerid
  //   };
  //   this.getNetworkList(condition);

  // }

  // getNetworkList(condition) {
  //   this.ecl2Service.allecl2nework(condition).subscribe((res) => {
  //     const response = JSON.parse(res._body);
  //     if (response.status) {
  //       this.networkList = response.data;
  //     } else {
  //       this.networkList = [];
  //     }
  //   });
  // }
  beforeSaveOrUpdate(flag) {
    let errorMessage: any;
    if (this.interconnecitivityForm.status === AppConstant.FORMSTATUS.INVALID) {
      errorMessage = this.commonService.getFormErrorMessage(
        this.interconnecitivityForm,
        this.interconnecitivityErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      if (flag) {
        this.isVisible = true;
      } else {
        this.approvalForm.reset();
        this.saveOrUpdate();
      }
    }
  }

  saveOrUpdate() {
    let data: any;
    data = this.interconnecitivityForm.value;
    this.formDisabled = true;
    this.loading = true;
    this.formdata = {
      tenantid: this.userstoragedata.tenantid,
      // customerid: data.sourcecustomerid.customerid,
      ecl2destinationcustomerid: data.ecl2tenantidother,
      // networkid: data.networkid.networkid,
      // ecl2networkid: data.networkid.ecl2networkid,
      ecl2tenantidother: data.ecl2tenantidother,
      ecl2networkid: data.ecl2networkid,
      name: data.name,
      description: data.description,
      notes: data.description,
      ecl2tenantid: this.interConnectivityObj.ecl2tenantid,
      region: this.interConnectivityObj.ecl2region,
      status:
        data.status === false
          ? AppConstant.STATUS.INACTIVE
          : AppConstant.STATUS.ACTIVE,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };

    this.formdata.tags = {};
    _.remove(data.ecl2tags, function (item: any) {
      if (item.tagkey == null && item.tagvalue == null) {
        return item;
      }
    });
    if (!_.isEmpty(data.ecl2tags)) {
      const result = {};
      const tags = [] as any;
      for (let i = 0; i < data.ecl2tags.length; i++) {
        result[data.ecl2tags[i].tagkey] = data.ecl2tags[i].tagvalue;
        tags.push(data.ecl2tags[i]);
      }
      this.formdata.tags = {
        ...result,
      };
      if (!_.isEmpty(this.removeitem)) {
        this.removeitem.forEach((element) => {
          data.ecl2tags.push(element);
        });
      }
      this.formdata.ecl2tags = data.ecl2tags;
    }

    if (this.approvalForm.status === AppConstant.FORMSTATUS.VALID) {
      this.formdata = _.assign(this.formdata, this.approvalForm.value);
      this.formdata.flag = "APPROVAL";
    }
    if (
      !_.isUndefined(this.interConnectivityObj) &&
      !_.isUndefined(this.interConnectivityObj.tenantconnrequestid) &&
      !_.isEmpty(this.interConnectivityObj)
    ) {
      this.formdata.tenantconnrequestid =
        this.interConnectivityObj.tenantconnrequestid;
      this.formdata.ecltenantconnrequestid =
        this.interConnectivityObj.ecltenantconnrequestid;
      this.formdata.region =
        this.interConnectivityObj.sourcecustomer.ecl2region;
      // this.formdata.ecl2tenantid = this.interConnectivityObj.sourcecustomer.ecl2tenantid;
      // this.formdata.sourcecustomerid = this.interConnectivityObj.sourcecustomerid;
      this.ecl2Service
        .updateECL2TenantConnRequest(this.formdata)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.formDisabled = false;
            // response.data.descustomer = data.sourcecustomerid;
            // response.data.desnetwork = data.networkid;
            // response.data.sourcecustomer = this.interConnectivityObj;
            response.data.ecl2tags = data.ecl2tags;
            this.messageService.success(response.message);
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
      // this.formdata.sourcecustomerid = this.interConnectivityObj.customerid;
      this.ecl2Service
        .createECL2TenantConnRequest(this.formdata)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.formDisabled = false;
            // response.data.descustomer = data.sourcecustomerid;
            // response.data.desnetwork = data.networkid;
            // response.data.sourcecustomer = this.interConnectivityObj;
            this.notifyNewEntry.next(response.data);
            this.messageService.success(response.message);
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
