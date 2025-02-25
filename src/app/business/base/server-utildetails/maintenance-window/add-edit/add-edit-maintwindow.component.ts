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
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../../app.constant";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SrmService } from "src/app/business/srm/srm.service";
import * as moment from "moment";

@Component({
  selector: "app-add-edit-window",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/maintenance-window/add-edit/add-edit-maintwindow.component.html",
})
export class AddEditWindowComponent implements OnInit, OnChanges {
  @Input() windowObj: any;
  @Input() view = false;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  predictionForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  predictionErrObj = {
    cloudprovider: {
      required: "Please Select CloudProvider",
    },
    region: {
      required: "Please Select Zone",
    },
    windowname: {
      required: "Please Enter Maintenance Window Name",
    },
    windowdate: {
      required: "Please Enter Start Date",
    },
    duration: {
      required: "Please Enter Duration",
    },
  };
  disabled = false;
  loading = false;
  state = true;
  costVisualList = [];
  assetTypes = [] as any;
  zoneList = [] as any;
  instanceList = [] as any;
  cloudproviderList = [];
  weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  requestItems = [] as any;
  tabIndex = 0 as number;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private httpService: HttpHandlerService,
    private srmService: SrmService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.MAINTENANCE_WINDOW,
    });
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }

  ngOnInit() {
    this.getproviderList();
  }
  clearForm() {
    this.predictionForm = this.fb.group({
      cloudprovider: [null, Validators.compose([Validators.required])],
      region: [null],
      windowname: [null, Validators.required],
      windowdate: [null, Validators.required],
      duration: [null, Validators.required],
      status: [AppConstant.STATUS.ACTIVE, Validators.required],
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      requestdetails: this.fb.array([]),
    });
    this.windowObj = {};
  }
  getFormArray(): FormArray {
    return this.predictionForm.get("requestdetails") as FormArray;
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.view =
      !_.isUndefined(changes.view) && !_.isEmpty(changes.view.currentValue)
        ? changes.view.currentValue
        : false;
    if (
      !_.isUndefined(changes.windowObj) &&
      !_.isEmpty(changes.windowObj.currentValue)
    ) {
      this.windowObj = changes.windowObj.currentValue;
      console.log(this.windowObj);
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.windowObj);
    } else {
      this.clearForm();
      this.weekDays.forEach((element) => {
        this.addSchedules(element);
      });
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  addSchedules(data?) {
    this.requestItems = this.predictionForm.get("requestdetails") as FormArray;
    data
      ? this.requestItems.push(this.formRequests(data))
      : this.requestItems.push(this.formRequests());
  }
  formRequests(day?) {
    return this.fb.group({
      requestday: [day ? day : null],
      reqstarttime: [null],
      reqendtime: [null],
    });
  }

  generateEditForm(data) {
    this.predictionForm = this.fb.group({
      maintwindowid: [data.maintwindowid],
      cloudprovider: [
        data.cloudprovider,
        Validators.compose([Validators.required]),
      ],
      region: [data.region],
      windowname: [data.windowname, Validators.required],
      windowdate: [
        [new Date(data.startdate), new Date(data.enddate)],
        Validators.required,
      ],
      duration: [data.duration, Validators.required],
      status: [data.status, Validators.required],
      createdby: [data.createdby, Validators.required],
      createddt: [data.createddt, Validators.required],
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      requestdetails: this.fb.array([]),
    });
    this.requestItems = this.predictionForm.get("requestdetails") as FormArray;
    this.weekDays.forEach((element) => {
      let field: any = element.toLocaleLowerCase();
      let today = new Date();
      let startTime =
        data[field] != null
          ? data[field]["start"].replace(/(^:)|(:$)/g, "").split(":")
          : null;
      let endTime =
        data[field] != null
          ? data[field]["end"].replace(/(^:)|(:$)/g, "").split(":")
          : null;

      this.requestItems.push(
        this.fb.group({
          requestday: [element ? element : null],
          reqstarttime: [
            data[field] != null
              ? new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                startTime[0],
                startTime[1]
              )
              : null,
          ],
          reqendtime: [
            data[field] != null
              ? new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                endTime[0],
                endTime[1]
              )
              : null,
          ],
        })
      );
    });

    if (this.view) {
      this.predictionForm.disable();
    }

    this.providerChanges(data.cloudprovider);
  }
  getproviderList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.cloudproviderList = response.data;
      } else {
        this.loading = false;
        this.cloudproviderList = [];
      }
    });
  }
  calcDuration(value) {
    var date = [new Date(value[0]), new Date(value[1])] as any;
    var diff_in_ms = date[1] - date[0]; // milliseconds
    var diff_in_minutes = Math.floor(diff_in_ms / 60000);
    this.predictionForm.get("duration").setValue(diff_in_minutes);
  }
  saveUpdate(data) {
    this.loading = true;
    //  this.disabled = true;
    let errorMessage: any;
    console.log(data);
    if (this.predictionForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.predictionForm,
        this.predictionErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      this.loading = false;
      return false;
    } else {
      if (data['requestdetails'].length > 0) {
        let schedule = _.find(data['requestdetails'], function (e) {
          return e['reqstarttime'] != null && e['reqendtime'] != null
        });
        if (_.isUndefined(schedule)) {
          this.message.remove();
          this.message.error('Please enter schedule');
          this.loading = false;
          return false;
        }
      }
      data.startdate = data.windowdate[0];
      data.enddate = data.windowdate[1];
      data.duration = parseFloat(data.duration);
      if (data.region == null) {
        delete data["region"];
      }
      if (data.requestdetails && data.requestdetails.length > 0) {
        _.map(data.requestdetails, function (item: any) {
          if (item.reqstarttime != null && item.reqendtime != null) {
            data[item.requestday.toLowerCase()] = {
              start: moment(item.reqstarttime).format("HH:mm"),
              end: moment(item.reqendtime).format("HH:mm"),
            };
          }
        });
      }
      delete data["requestdetails"];
      if (data.maintwindowid) {
        this.srmService.updateMaintwindow(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.notifyEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add script group. Try again");
          }
        );
      } else {
        this.srmService.addMaintwindow(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.notifyEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add script group. Try again");
          }
        );
      }
    }
  }
  providerChanges(provider) {
    if (provider == "ECL2") {
      this.loading = true;
      this.httpService
        .POST(
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES,
          {
            status: "Active",
          }
        )
        .subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.zoneList = this.formArrayData(
                response.data,
                "region",
                "region"
              );
              this.zoneList = _.uniqBy(this.zoneList, "value");
            }
          },
          (err) => {
            console.log(err);
            this.loading = false;
          }
        );
      this.loading = false;
    } else if (provider == "AWS") {
      this.loading = true;
      this.httpService
        .POST(
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
          {
            status: "Active",
          }
        )
        .subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.zoneList = this.formArrayData(
                response.data,
                "zonename",
                "awszoneid"
              );
              this.zoneList = _.uniqBy(this.zoneList, "value");
            }
          },
          (err) => {
            console.log(err);
            this.loading = false;
          }
        );
      this.loading = false;
    }
  }
  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
