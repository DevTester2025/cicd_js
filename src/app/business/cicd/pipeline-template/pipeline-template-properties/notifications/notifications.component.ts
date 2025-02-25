import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "src/app/business/admin/users/users.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { OrchestrationService } from "../../../../base/orchestration/orchestration.service";
import { ScriptService } from "../../../../tenants/scripts/script.service";
import { PipelineTemplateService } from "../../pipeline-template.service";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";

@Component({
  selector: "app-prop-notification",
  templateUrl: "../notifications/notifications.component.html",
})
export class PropNotificationComponent {
  @Input() nodeObj: any;
  @Input() activeTab: string;
  @Output() formDataChange = new EventEmitter<any>();
  @Input() nodeDetails = [];
  ntfForm: FormGroup;
  usersList = [];
  userstoragedata: any = {};
  orchestrationList = [];
  scriptList = [];
  dataLoading = false;
  configuredNotifications = [];
  notificationErrObj = {
    eventType: AppConstant.VALIDATIONS.NOTIFICATIONSMSG.EVENTTYPE,
    notifiers: AppConstant.VALIDATIONS.NOTIFICATIONSMSG.NOTIFIERS,
    remediationType: AppConstant.VALIDATIONS.NOTIFICATIONSMSG.REMEDIATIONTYPE,
    orchestration:AppConstant.VALIDATIONS.NOTIFICATIONSMSG.ORCHESTRATION,
    script:AppConstant.VALIDATIONS.NOTIFICATIONSMSG.SCRIPT,
  };
  propertiesobj = {};
  nodeFormData = {};
  nodeId;
  groupedNotifications = {};
  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private orchestrationService: OrchestrationService,
    private scriptService: ScriptService,
    private localStorageService: LocalStorageService,
    private pipelineService: PipelineTemplateService,
    private message: NzMessageService,
    private commonService: CommonService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.initForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodeObj || changes.activeTab) {
      if (this.nodeObj && this.nodeObj.selectedNode) {
        this.nodeId = this.nodeObj.selectedNode.id;
        this.loadNodeFormData();
      }
    }
    if (changes.nodeDetails && changes.nodeDetails.currentValue) {
      const data = { ...changes.nodeDetails.currentValue };
      Object.values(data).forEach((node: any) => {
        if (node.notifications && Array.isArray(node.notifications)) {
          node.notifications.forEach((notification) => {
            this.configuredNotifications.push(notification);
          });
        }
      });
    }
  }

  ngOnInit(): void {
    this.getUserList();
    this.getOrchestrationList();
    this.getScriptList();
  }

  initForm() {
    this.ntfForm = this.fb.group({
      notifiers: [null, [Validators.required]],
      remediationType: [null],
      eventType: [null, [Validators.required]],
      script: [null, []],
      orchestration: [null, []],
    });
    this.ntfForm.valueChanges.subscribe(() => {
      this.saveNodeFormData();
    });
  }

  loadNodeFormData() {
    const savedData = this.pipelineService.getNodeFormData(
      this.nodeId,
      this.activeTab
    );
    if (savedData && Object.keys(savedData).length > 0) {
      this.configuredNotifications = savedData.configuredNotifications;
      this.ntfForm.patchValue(savedData);
    } else {
      this.initForm();
      this.configuredNotifications = [];
    }
  }

  saveNodeFormData() {
    const formData = {
      ...this.ntfForm.value,
      configuredNotifications: this.configuredNotifications
        ? [...this.configuredNotifications]
        : [],
    };
    this.pipelineService.setNodeFormData(this.nodeId, this.activeTab, formData);
    this.formDataChange.emit({
      tab: "notifications",
      nodeId: this.nodeId,
      formData: formData.configuredNotifications,
    });
  }

  getOrchestrationList() {
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };

    this.orchestrationService.all(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.orchestrationList = response.data;
      } else {
        this.orchestrationList = [];
      }
    });
  }
  getUserList() {
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
          console.log(this.usersList, "...");
        } else {
          this.usersList = [];
        }
      });
  }
  getScriptList() {
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.scriptService.all(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.scriptList = response.data;
      } else {
        this.scriptList = [];
      }
    });
  }

  addConditionalValidators() {
    const eventTypeControl = this.ntfForm.get('eventType');
    const remediationTypeControl = this.ntfForm.get('remediationType');
    const scriptControl = this.ntfForm.get('script');
    const orchestrationControl = this.ntfForm.get('orchestration');
  
    remediationTypeControl.clearValidators();
    scriptControl.clearValidators();
    orchestrationControl.clearValidators();
  
    if (eventTypeControl.value === 'Failure') {
      remediationTypeControl.setValidators([Validators.required]);
  
      if (remediationTypeControl.value === 'Script') {
        scriptControl.setValidators([Validators.required]);
      }
  
      if (remediationTypeControl.value === 'Orchestration') {
        orchestrationControl.setValidators([Validators.required]);
      }
    }
    remediationTypeControl.updateValueAndValidity();
    scriptControl.updateValueAndValidity();
    orchestrationControl.updateValueAndValidity();
  }

  addRow() {
    this.addConditionalValidators();
    let errorMessage: any;
    if (this.ntfForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.ntfForm,
        this.notificationErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }

    const formValues = this.ntfForm.value;
    
    const selectedScript = this.scriptList.find(
      (script) => script.scriptid === formValues.script
    );
    const selectedOrchestration = this.orchestrationList.find(
      (orch) => orch.orchid === formValues.orchestration
    );
    let configuration = [];
    if (formValues.eventType === "Failure") {
      if (formValues.remediationType) {
        configuration.push({
          label: `${formValues.remediationType}`,
          value: formValues.remediationType,
        });
      }
      if (formValues.script) {
        configuration.push({
          label: `${selectedScript.scriptname}`,
          value: selectedScript.scriptid,
        });
      }
      if (formValues.orchestration) {
        configuration.push({
          label: `${selectedOrchestration.orchname}`,
          value: selectedOrchestration.orchid,
        });
      }
    }
    this.configuredNotifications.push({
      type: formValues.eventType,
      notifiers: formValues.notifiers,
      configuration: configuration,
    });
    this.configuredNotifications = [...this.configuredNotifications];
    this.saveNodeFormData();
    this.resetForm();
  }

  resetForm() {
    this.ntfForm.reset({
      notifiers: null,
      remediationType: null,
      eventType: null,
      script: null,
      orchestration: null,
    });
  }

  deleteNotification(index: number) {
    this.configuredNotifications.splice(index, 1);
    this.configuredNotifications = [...this.configuredNotifications];
    this.saveNodeFormData();
  }

  getReceiversFor(notifiers: number[]): string {
    if (Array.isArray(notifiers) && notifiers.length > 0) {
      return notifiers
        .map((id) => {
          const user = this.usersList.find((user) => user.value === id);
          return user ? user.label : null;
        })
        .filter((label) => label !== null)
        .join(", ");
    }
    return "-";
  }

  getConfigurationLabels(configuration: any[]): string {
    if (!configuration || configuration.length === 0) {
      return "-";
    }
    return configuration.map((config) => config.label).join(", ");
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
  notificationDetails() {
    if (this.ntfForm.value) {
      const formValue = this.ntfForm.value;
      const formattedData = {
        notifiers: formValue.notifiers
          ? formValue.notifiers.map((notifier: any) => notifier.value)
          : [],
        remediationType: formValue.remediationType,
        eventType: formValue.eventType,
        script: formValue.script || null,
        orchestration: formValue.orchestration || null,
      };
      return formattedData;
    }
    return;
  }
  patchFormValues(notification: any): void {
    const data = notification;
    // if (notification) {
    //   const data = notification.pipelinetemplatedetails.templatedetailconfig.meta;
    //   data.forEach((element: any) => {
    //     this.ntfForm.patchValue({
    //     eventType:  element.eventType ? element.eventType : null,
    //     notifiers : element.notifiers.map((notifier: any) => ({
    //       notifier
    //     })),
    //     remediationType: element.remediationType
    //       ? element.remediationType
    //       : null,
    //     script : element.script ? element.script : null,
    //     orchestration : element.orchestration ? element.orchestration : null,
    //    });
    //   })
    // }
  }
}
