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
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../../../app.constant";
import { CommonService } from "../../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { UsersService } from "src/app/business/admin/users/users.service";
@Component({
  selector: "app-create-alerts",
  templateUrl:
    "../../../../../../presentation/web/base/assets/monitoring-dashboard/monitoring-alerts/create-alerts/create-alerts.component.html",
})
export class CreateAlertsComponent implements OnInit, OnChanges {
  @Input() groupObj: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  alertForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  metricList = [
    { label: "Cpu Utilization", value: "CPU_UTIL" },
    { label: "Cpu Speed", value: "CPU_SPEED" },
    { label: "Total Memory", value: "MEM_TOTAL" },
    { label: "Free Memory", value: "MEM_FREE" },
    { label: "Memory Utilization", value: "MEM_USEPERCENT" },
    { label: "Disk Read", value: "DISK_READ" },
    { label: "Disk Write", value: "DISK_WRITE" },
    { label: "Network Received", value: "NET_RECV" },
    { label: "Network Send", value: "NET_SEND" },
  ];
  durationList = [
    { label: "30 Minutes", value: 30 },
    { label: "1 Hour", value: 60 },
    { label: "2 Hour", value: 120 },
    { label: "3 Hour", value: 180 },
    { label: "4 Hour", value: 240 },
    { label: "5 Hour", value: 300 },
    { label: "6 Hour", value: 360 },
    { label: "7 Hour", value: 420 },
    { label: "8 Hour", value: 480 },
    { label: "9 Hour", value: 540 },
    { label: "10 Hour", value: 600 },
    { label: "12 Hour", value: 720 },
    { label: "14 Hour", value: 780 },
    { label: "16 Hour", value: 840 },
    { label: "18 Hour", value: 900 },
    { label: "20 Hour", value: 960 },
    { label: "22 Hour", value: 1020 },
    { label: "24 Hour", value: 1080 },
  ];
  usersList = [];
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private userService: UsersService
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
      !_.isUndefined(changes.groupObj) &&
      !_.isEmpty(changes.groupObj.currentValue)
    ) {
      let data = changes.groupObj.currentValue;
      this.groupObj = data;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.groupObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.alertForm = this.fb.group({
      policyname: [null, Validators.required],
      metric: [null],
      util: [null],
      range: [null],
      duration: [null],
      userids: [null],
      status: [AppConstant.STATUS.ACTIVE, Validators.required],
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
    this.groupObj = {};
  }
  getUserList() {
    this.loading = true;
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.usersList = _.map(response.data, function (i) {
            return {
              fullname: i.fullname,
              userid: i.userid,
            };
          });
          this.loading = false;
        } else {
          this.usersList = [];
          this.loading = false;
        }
      });
  }

  generateEditForm(data) {}
  saveUpdate(value) {}
}
