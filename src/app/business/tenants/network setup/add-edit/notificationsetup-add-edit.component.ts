import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from "@angular/core";
import { RoleService } from "../../../admin/role/role.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { NotificationConstant } from "../../../../notification.constant";
import { NotificationSetupService } from "../notificationsetup.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { UsersService } from "src/app/business/admin/users/users.service";
@Component({
  selector: "app-notification-setup-add-edit",
  templateUrl:
    "../../../../presentation/web/tenant/notificationsetup/add-edit/notification-add-edit.component.html",
})
export class AddEditNotificationComponent
  implements OnInit, OnChanges, AfterViewInit
{
  disabled = false;
  loading = false;
  isPreviewVisible = false;

  @Input() notificationObj: any;
  @Output() notifyTagEntry: EventEmitter<any> = new EventEmitter();

  notificationForm: FormGroup;
  userstoragedata = {} as any;
  moduleList: any = [];
  selectedModuleId: any;
  screenPermissions = [];
  templateList: any = [];
  mode: any;
  eventList: any = [];
  usersList: any = [];
  ntfList: any = [
    { label: "Email", value: "Email" },
    { label: "SMS", value: "SMS" },
    { label: "Application", value: "Application" },
  ];
  buttonText: string ="Save";
  notificationErrObj = AppConstant.VALIDATIONS.NOTIFICATION;
  isEdit = false;
  selectedTemplate: any = {};
  constructor(
    private roleService: RoleService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private userService: UsersService,
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private notificationService: NotificationSetupService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    let obj = {
      tenantid: this.userstoragedata.tenantid,
      templateid: this.userstoragedata.templateid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getUserList();
    this.getAllScreens();
    this.clearForm();
    this.getAlltemplate();
  }
  ngAfterViewInit(): void {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.notificationObj) &&
      !_.isEmpty(changes.notificationObj.currentValue)
    ) {
      this.notificationObj = changes.notificationObj.currentValue;
      this.isEdit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.notificationForm.patchValue({
        ...this.notificationObj,
        status: this.notificationObj["status"] == "Active" ? true : false,
      });
      this.moduleChanges(this.notificationObj.module);
    } else {
      this.isEdit = false;
      this.clearForm(this.notificationObj.data);
    }
  }
  clearForm(data?) {
    if (data) {
      this.moduleChanges(data.module);
    }
    this.notificationForm = this.fb.group({
      module: [data ? data.module : null, Validators.required],
      event: [data ? data.event : null, Validators.required],
      notes: [data ? data.notes : null, Validators.required],
      ntftype: [data ? data.ntftype : null, Validators.required],
      templateid: [data ? data.templateid : null, Validators.required],
      tenantid: this.userstoragedata.tenantid,
      receivers: [
        data ? JSON.parse(data.receivers) : null,
        Validators.required,
      ],
      status: ["Active"],
      createdby: data ? data.createdby : this.userstoragedata.fullname,
      createddt: data ? data.createddt : new Date(),
    });
  }
  getAllScreens() {
    this.roleService
      .allScreens({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        let response = JSON.parse(res._body);
        if (response.status) {
          this.moduleList = response.data;
          this.loading = false;
          this.moduleList.forEach((module) => {
            try {
              module.events = module.events ? JSON.parse(module.events) : [];
            } catch (e) {
              console.error("Failed to parse events JSON:", module.events, e);
              module.events = [];
            }
          });
          if (this.selectedModuleId) {
             this.moduleChanges(this.selectedModuleId);
        }
        } else {
          this.moduleList = [];
          this.loading = false;
        }
      });
  }

  getAlltemplate() {
    this.notificationService
      .templateList({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        let response = JSON.parse(res._body);
        if (response.status) {
          this.notificationObj.templateid;
          this.templateList = response.data;
          this.loading = false;

          this.selectedTemplate = this.templateList.find(
            (template) =>
              template.templateid === this.notificationObj.templateid
          );
        } else {
          this.templateList = [];
          this.loading = false;
        }
      });
  }
  moduleChanges(moduleName: any) {
    this.selectedModuleId = moduleName;
    const selectedModule = this.moduleList.find(
      (m) => m.screenname === this.selectedModuleId
    );

    if (selectedModule && selectedModule.events) {
      this.eventList = selectedModule.events.map((event) => {
        return { keyname: event.keyname, keyvalue: event.keyvalue };
      });
      this.notificationForm
        .get("event")
        .patchValue(
          this.notificationObj.event
        );
    } else {
      this.eventList = [];
    }
  }
  
  eventChanges() {
    let type = this.notificationForm.value.ntftype;
    let mod = this.notificationForm.value.module;
    let event = this.notificationForm.value.event;
    if (NotificationConstant[type] && NotificationConstant[type][mod]) {
      let value = NotificationConstant[type][mod][event];
      if (value) {
        this.notificationForm
          .get("template")
          .setValue(this.selectedTemplate.html);
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
  showPreview(): void {
    this.isPreviewVisible = true;
  }
  handleCancel(): void {
    this.isPreviewVisible = false;
  }

  saveUpdateScript(data) {
    if (this.notificationForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.notificationForm,
        this.notificationErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else if (data.ntftype == "SMS" && data.template.length > 160) {
      this.message.error("The template should be less than 160 charecters");
    } else {
      data.status = AppConstant.STATUS.ACTIVE;
      data.receivers = JSON.stringify(data.receivers);
      data.lastupdatedby = this.userstoragedata.fullname;
      data.lastupdateddt = new Date();
      if (
        this.notificationObj &&
        this.notificationObj.ntfcsetupid
      )
        data.ntfcsetupid = this.notificationObj.ntfcsetupid;
      if (data.ntfcsetupid) {
        this.notificationService.update(data).subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            setTimeout(() => {
              this.message.info("Updated Successfully");
              this.notifyTagEntry.emit(true);
            }, 1000);
          } else {
            this.message.info(response.message);
          }
        });
      } else {
        data.createdby = this.userstoragedata.fullname;
        data.createddt = new Date();
        this.notificationService.create(data).subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            setTimeout(() => {
              this.message.info("Saved Succesfully");
              this.notifyTagEntry.emit(true);
            }, 1000);
          } else {
            this.message.info(response.message);
          }
        });
      }
    }
  }
}
