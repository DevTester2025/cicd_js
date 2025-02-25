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
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../app.constant";
import * as _ from "lodash";
import { ResizeRequestService } from "src/app/business/srm/upgrade-request/resize.service";
import * as moment from "moment";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { SrmService } from "src/app/business/srm/srm.service";
import { toLower } from "lodash";

@Component({
  selector: "app-scheduledresize-request-add-edit",
  templateUrl:
    "../../../../presentation/web/base/server-utildetails/schedule-resize/add-edit/scheduled-resize-add-edit.component.html",
})
export class ScheduledRequestAddEditComponent implements OnInit, OnChanges {
  @Input() requestData: any;
  @Input() instanceObj: any;
  @Input() recommendObj: any;
  @Output() notifyrequestEntry: EventEmitter<any> = new EventEmitter();
  requestForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SUBMIT;
  requestErrObj = {
    upgradeplantype: { required: "Please select plan type" },
    reqstarttime: { required: "Please select time" },
    reqendtime: { required: "Please select end Time" },
    maintwindowid: { required: "Please select Maintenance Window" },
  };
  requestObj = {} as any;
  requestItems = [] as any;
  mainWindowList = [] as any;
  deletedItems = [] as any;
  plantype: any;
  schedulingTime = [] as any;
  weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  loading = false;
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private srmService: SrmService,
    private resizeService: ResizeRequestService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.clearForm();
    this.weekDays.forEach((element) => {
      this.addApprover(element);
    });
    this.getScheduleTimes();
  }

  ngOnInit() {}
  clearForm() {
    this.requestForm = this.fb.group({
      tenantid: [this.userstoragedata.tenantid],
      customerid: [null],
      cloudprovider: [null],
      resourceid: [null],
      maintwindowid: [null, Validators.required],
      reqstatus: [AppConstant.STATUS.PENDING],
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      status: [AppConstant.STATUS.ACTIVE],
      requestdetails: this.fb.array([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.requestData) &&
      !_.isEmpty(changes.requestData.currentValue)
    ) {
      this.requestData = changes.requestData.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.SUBMIT;
      this.getRequest(this.instanceObj.instanceid);
    } else {
      this.buttonText = "Submit";
    }

    if (
      !_.isUndefined(changes.recommendObj) &&
      !_.isEmpty(changes.recommendObj.currentValue)
    ) {
      this.recommendObj = changes.recommendObj.currentValue;
      this.plantype = this.recommendObj.upgradeplantype;
      this.updatePlantype();
    }
    this.getMainWindows();
  }
  getScheduleTimes() {
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.SCHEDULE_TIME,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          response.data.forEach((element, i) => {
            if (response.data[i + 1]) {
              let nxtElement = response.data[i + 1];
              this.schedulingTime.push({
                label: `${element.keyname} to ${nxtElement.keyname}`,
                value: { start: element.keyvalue, end: nxtElement.keyvalue },
              });
            }
          });
        } else {
          this.schedulingTime = [];
        }
      });
  }
  updatePlantype() {
    if (_.isEmpty(this.requestObj)) {
      this.requestItems = this.requestForm.get("requestdetails") as FormArray;
      for (let i = 0; i < this.requestItems.value.length; i++) {
        for (const key in this.requestItems.value[i]) {
          if (key === "upgradeplantype") {
            this.requestItems.controls[i]
              .get("upgradeplantype")
              .setValue(this.plantype);
          }
        }
      }
    }
  }
  getMainWindows() {
    let condition = {} as any;
    condition = {
      cloudprovider: this.recommendObj.cloudprovider,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.srmService.allMaintwindows(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.mainWindowList = response.data;
      } else {
        this.mainWindowList = [];
      }
    });
  }
  windowChanged(id) {
    if (id) {
      let window = _.find(this.mainWindowList, { maintwindowid: id });
      if (window) {
        this.requestItems = this.requestForm.get("requestdetails") as FormArray;
        this.requestItems.controls.forEach((element) => {
          let windowDate = window[toLower(element.value.requestday)];
          if (windowDate != null) {
            let windowvalue;
            let windowStartTime = windowDate.start
              .replace(/(^:)|(:$)/g, "")
              .split(":");
            this.schedulingTime.forEach((element) => {
              let startTime = element.value.start
                .replace(/(^:)|(:$)/g, "")
                .split(":");
              if (startTime[0] == windowStartTime[0])
                windowvalue = element.value;
            });
            console.log(windowDate, element.value);
            element.get("reqstarttime").setValue(windowvalue);
            element.get("execute").setValue(true);
          } else {
            element.get("reqstarttime").setValue(null);
            element.get("execute").setValue(false);
          }
        });
        this.requestForm.updateValueAndValidity();
      }
    }
  }
  formRequests(day?) {
    return this.fb.group({
      scheduledreqhdrid: [null],
      upgradeplantype: [null, Validators.required],
      requestday: [day ? day : null],
      reqstarttime: [null],
      reqendtime: [null],
      execute: [true],
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      status: [AppConstant.STATUS.ACTIVE],
    });
  }
  generateEditForm(data) {
    this.requestForm = this.fb.group({
      scheduledreqhdrid: [data.scheduledreqhdrid],
      tenantid: [data.tenantid],
      customerid: [data.customerid],
      cloudprovider: [data.cloudprovider],
      resourceid: [data.resourceid],
      maintwindowid: [data.maintwindowid],
      reqstatus: [data.reqstatus],
      createdby: data.createdby,
      createddt: data.createddt,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      status: [AppConstant.STATUS.ACTIVE],
      requestdetails: this.fb.array([]),
    });
    this.requestItems = this.requestForm.get("requestdetails") as FormArray;
    if (data.requestdetails !== undefined) {
      data.requestdetails.forEach((element) => {
        // let startTime = element.reqstarttime.replace(/(^:)|(:$)/g, '').split(":");
        // let endTime = element.reqendtime.replace(/(^:)|(:$)/g, '').split(":");
        let today = new Date();
        let windowvalue;
        if (element.reqstarttime != null) {
          let windowStartTime = element.reqstarttime
            .replace(/(^:)|(:$)/g, "")
            .split(":");
          this.schedulingTime.forEach((item: any) => {
            let startTime = item.value.start
              .replace(/(^:)|(:$)/g, "")
              .split(":");
            if (startTime[0] == windowStartTime[0]) {
              windowvalue = item.value;
            }
          });
        }

        this.requestItems.push(
          this.fb.group({
            scheduledreqdtlid: [element.scheduledreqdtlid],
            scheduledreqhdrid: [element.scheduledreqhdrid],
            upgradeplantype: [element.upgradeplantype],
            requestday: [element.requestday],
            reqstarttime: [windowvalue ? windowvalue : null],
            reqendtime: [windowvalue ? windowvalue : null],
            execute: [element.execute == "Y" ? true : false],
            // reqstarttime: [new Date(today.getFullYear(), today.getMonth(), today.getDate(), startTime[0], startTime[1])],
            // reqendtime: [new Date(today.getFullYear(), today.getMonth(), today.getDate(), endTime[0], endTime[1])],
            createdby: [element.createdby],
            createddt: [element.createddt],
            lastupdatedby: this.userstoragedata.fullname,
            lastupdateddt: new Date(),
            status: [element.status],
          })
        );
      });
    } else {
      this.requestItems.push(this.formRequests());
    }
    if (data.maintwindowid) this.windowChanged(data.maintwindowid);
  }
  addApprover(data?) {
    this.requestItems = this.requestForm.get("requestdetails") as FormArray;
    data
      ? this.requestItems.push(this.formRequests(data))
      : this.requestItems.push(this.formRequests());
  }
  removeItem(i) {
    this.requestItems = this.requestForm.get("requestdetails") as FormArray;
    const currentindex = this.requestItems.value.length;
    if (currentindex !== 1) {
      if (this.requestItems.value[i].scheduledreqdtlid) {
        this.requestItems.value[i].status = AppConstant.STATUS.INACTIVE;
        this.deletedItems.push(this.requestItems.value[i]);
      }
      this.requestItems.removeAt(i);
    }
  }
  getFormArray(): FormArray {
    return this.requestForm.get("requestdetails") as FormArray;
  }
  saveOrUpdate(data) {
    let errorMessage: any;
    if (this.requestForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.requestForm,
        this.requestErrObj,
        "requestdetails"
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.loading = true;
      data.cloudprovider = this.instanceObj.cloudprovider;
      data.customerid = this.instanceObj.customerid;
      data.resourceid = this.instanceObj.instanceid;
      data.resourcerefid = this.instanceObj.instancerefid;
      data.requestdetails.forEach((element) => {
        element.reqendtime = element.reqstarttime
          ? element.reqstarttime.end
          : null;
        element.reqstarttime = element.reqstarttime
          ? element.reqstarttime.start
          : null;
        element.execute = element.execute == true ? "Y" : "N";
        // element.reqstarttime = moment(element.reqstarttime).format('HH:mm');
        // element.reqendtime = moment(element.reqendtime).format('HH:mm');
      });
      if (this.requestObj && this.requestObj.scheduledreqhdrid) {
        this.resizeService.updateSeduleRequest(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.notifyrequestEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.loading = false;
            this.message.error("Unable to add request group. Try again");
          }
        );
      } else {
        this.resizeService.createSeduleRequest(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.notifyrequestEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.loading = false;
            this.message.error("Unable to add request group. Try again");
          }
        );
      }
    }
  }
  checkValididty(array) {
    let isValidated = true;
    array.forEach((element) => {
      if (element.reqstarttime > element.reqendtime) {
        this.message.error(
          "Start time should be less than time for" + element.requestday
        );
        isValidated = false;
        return false;
      } else {
        return true;
      }
    });
    if (isValidated) {
      return true;
    } else {
      return false;
    }
  }
  getRequest(id) {
    this.loading = true;
    let obj = { resourceid: id, status: AppConstant.STATUS.ACTIVE } as any;
    this.resizeService.allSeduleRequest(obj).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.requestObj = response.data[0];
        this.generateEditForm(this.requestObj);
      } else {
        this.requestObj = {};
      }
      this.loading = false;
    });
  }
}
