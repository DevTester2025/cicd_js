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
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { RightsizegroupService } from "../rightsizegroup.service";
import { UsersService } from "src/app/business/admin/users/users.service";
import { SrmService } from "src/app/business/srm/srm.service";

@Component({
  selector: "app-add-edit-rightsizegroup",
  templateUrl:
    "../../../../presentation/web/base/rightsizegroup/add-edit/rightsizegroup-add-edit.component.html",
})
export class AddEditRightsizeGroupComponentComponent implements OnInit {
  @Input() groupObj: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  groupForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  predictionErrObj = {
    groupname: {
      required: "Please enter rightsize group name",
    },
  };
  disabled = false;
  editDisabled = false;
  loading = false;
  state = true;
  usersList: any = [];
  durationList: any = [
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
  windowList: any = [];
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private srmService: SrmService,
    private userService: UsersService,
    private groupService: RightsizegroupService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getUserList();
    this.getWindowList();
  }
  clearForm() {
    this.groupForm = this.fb.group({
      groupname: [null, Validators.required],
      maintwindowids: [null],
      cpuutil: [null],
      memoryutil: [null],
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
          this.usersList = this.formArrayData(
            response.data,
            "fullname",
            "userid"
          );
          this.loading = false;
        } else {
          this.usersList = [];
          this.loading = false;
        }
      });
  }

  getWindowList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.srmService.allMaintwindows(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.loading = false;
        this.windowList = this.formArrayData(
          response.data,
          "windowname",
          "maintwindowid"
        );
      } else {
        this.loading = false;
        this.windowList = [];
      }
    });
  }
  generateEditForm(data) {
    this.groupForm = this.fb.group({
      groupname: [data.groupname, Validators.required],
      maintwindowids: [data.maintwindowids],
      cpuutil: [data.cpuutil],
      rightsizegrpid: [data.rightsizegrpid],
      memoryutil: [data.memoryutil],
      duration: [parseFloat(data.duration)],
      userids: [data.userids],
      status: [data.status, Validators.required],
      createdby: data.createdby,
      createddt: data.createddt,
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
  }
  saveUpdate(data) {
    this.loading = true;
    if (this.groupForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.groupForm,
        this.predictionErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      this.loading = false;
      return false;
    } else {
      data.cpuutil = parseFloat(data.cpuutil);
      data.memoryutil = parseFloat(data.memoryutil);
      if (data.rightsizegrpid) {
        this.groupService.update(data).subscribe(
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
            this.message.error("Unable to add rightsize group. Try again");
          }
        );
      } else {
        this.groupService.create(data).subscribe(
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
            this.message.error("Unable to add rightsize group. Try again");
          }
        );
      }
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
}
