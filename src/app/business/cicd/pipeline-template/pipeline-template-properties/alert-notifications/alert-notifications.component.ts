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
import * as _ from "lodash";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { PipelineTemplateService } from "../../pipeline-template.service";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-alert-notification",
  templateUrl: "../alert-notifications/alert-notifications.component.html",
})
export class AlertsNotificationComponent {
  @Input() nodeObj: any;
  @Input() activeTab: string;
  @Output() formDataChange = new EventEmitter<any>();
  @Input() nodeDetails = [];
  alertNotifyForm: FormGroup;
  usersList = [];
  userstoragedata: any = {};
  orchestrationList = [];
  scriptList = [];
  dataLoading = false;
  levelsList = AppConstant.ALERT_LEVELS.LEVELS;
  alertList: any;
  listOfData: any;
  configuredCompilance = [];
  rulesList = [];
  nodeFormData = {};
  nodeId;
  propertiesobj;
  alertNotificationErrObj = {
    alertType: AppConstant.VALIDATIONS.ALERTNOTIFICATION.ALERTTYPE,
    notifiers: AppConstant.VALIDATIONS.ALERTNOTIFICATION.NOTIFIERS,
    condition: AppConstant.VALIDATIONS.ALERTNOTIFICATION.CONDITION,
    metrics: AppConstant.VALIDATIONS.ALERTNOTIFICATION.METRICS,
    threshold: AppConstant.VALIDATIONS.ALERTNOTIFICATION.THRESHOLD,
    level: AppConstant.VALIDATIONS.ALERTNOTIFICATION.LEVEL,
  };
  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    // private orchestrationService: OrchestrationService,
    // private scriptService: ScriptService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private pipelineService: PipelineTemplateService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.initForm();
  }

  ngOnInit(): void {
    this.levelsList;
    this.getUserList();
    // this.getOrchestrationList();
    // this.getScriptList();
    this.getRules();
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
        if (node.compliances && Array.isArray(node.compliances)) {
          node.compliances.forEach((compliances) => {
            this.configuredCompilance.push(compliances);
          });
        }
      });
    }
  }

  initForm() {
    this.alertNotifyForm = this.fb.group({
      alertTypeMethod: ["alert"],
      alertType: [null, [Validators.required]],
      notifiers: [null, [Validators.required]],
      condition: [null],
      metrics: [null],
      threshold: [null],
      level: [null],
    });
    this.alertNotifyForm.valueChanges.subscribe(() => {
      this.saveNodeFormData();
    });
  }

  loadNodeFormData() {
    const savedData = this.pipelineService.getNodeFormData(
      this.nodeId,
      this.activeTab
    );
    if (savedData && Object.keys(savedData).length > 0) {
      this.configuredCompilance = savedData.configuredCompilance;
      this.alertNotifyForm.patchValue(savedData);
    } else {
      this.initForm();
      this.configuredCompilance = [];
    }
  }

  saveNodeFormData() {
    const formData = {
      ...this.alertNotifyForm.value,
      configuredCompilance: this.configuredCompilance
        ? [...this.configuredCompilance]
        : [],
    };
    this.pipelineService.setNodeFormData(this.nodeId, this.activeTab, formData);
    this.formDataChange.emit({
      tab: "compliances",
      nodeId: this.nodeId,
      formData: formData.configuredCompilance,
    });
  }

  getRules() {
    this.commonService
      .allSystemRules({
        tenantid: this.userstoragedata.tenantid,
        lookupkey: "SYSTEM_RULES",
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.rulesList = _.orderBy(response.data, ["displayorder"], ["asc"]);
        },
        (err) => {
          this.rulesList = [];
          console.log(err);
        }
      );
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
        } else {
          this.usersList = [];
        }
      });
  }

  addConditionalValidators() {
    const alertTypeControl = this.alertNotifyForm.get("alertType");
    const conditionControl = this.alertNotifyForm.get("condition");
    const metricsControl = this.alertNotifyForm.get("metrics");
    const thresholdControl = this.alertNotifyForm.get("threshold");
    const levelControl = this.alertNotifyForm.get("level");

    conditionControl.clearValidators();
    metricsControl.clearValidators();
    thresholdControl.clearValidators();
    levelControl.clearValidators();

    if (alertTypeControl.value === "system") {
      conditionControl.setValidators([Validators.required]);
      metricsControl.setValidators([Validators.required]);
      thresholdControl.setValidators([Validators.required]);
    }
    if (alertTypeControl.value === "security") {
      levelControl.setValidators([Validators.required]);
    }
    conditionControl.updateValueAndValidity();
    metricsControl.updateValueAndValidity();
    thresholdControl.updateValueAndValidity();
    levelControl.updateValueAndValidity();
  }

  addRow() {
    this.addConditionalValidators();
    let errorMessage: any;
    if (this.alertNotifyForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.alertNotifyForm,
        this.alertNotificationErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }

    const formValues = this.alertNotifyForm.value;

    const selectedLevel = this.levelsList.find(
      (level) => level.value === formValues.level
    );
    const selectedMetrics = this.rulesList.find(
      (metrics) => metrics.keyvalue === formValues.metrics
    );
    let conditionLabel = "";
    switch (formValues.condition) {
      case "gt":
        conditionLabel = "Is above";
        break;
      case "lt":
        conditionLabel = "Is below";
        break;
    }
    let configuration = [];
    if (formValues.alertType === "system") {
      if (formValues.condition) {
        configuration.push({
          label: `${conditionLabel}`,
          value: formValues.condition,
        });
      }
      if (formValues.metrics) {
        configuration.push({
          label: `${selectedMetrics.keyname}`,
          value: selectedMetrics.keyvalue,
        });
      }
      if (formValues.threshold) {
        configuration.push({
          label: "Threshold" + ":" + formValues.threshold,
          value: formValues.threshold,
        });
      }
    } else if (formValues.alertType === "security") {
      if (formValues.level) {
        configuration.push({
          label: `${selectedLevel.title}`,
          value: selectedLevel.value,
        });
      }
    }
    this.configuredCompilance.push({
      type: formValues.alertType,
      notifiers: formValues.notifiers,
      configuration: configuration,
    });
    this.configuredCompilance = [...this.configuredCompilance];
    this.saveNodeFormData();
    this.resetForm();
  }
  resetForm() {
    this.alertNotifyForm.reset({
      alertTypeMethod: null,
      alertType: null,
      notifiers: null,
      condition: null,
      metrics: null,
      threshold: null,
      level: null,
    });
  }
  deleteNotification(index: number) {
    this.configuredCompilance.splice(index, 1);
    this.configuredCompilance = [...this.configuredCompilance];
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
}
