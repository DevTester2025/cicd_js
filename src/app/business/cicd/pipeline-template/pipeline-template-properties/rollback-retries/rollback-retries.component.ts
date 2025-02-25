import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppConstant } from "src/app/app.constant";
import { OrchestrationService } from "../../../../base/orchestration/orchestration.service";
import { UsersService } from "src/app/business/admin/users/users.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { PipelineTemplateService } from "../../pipeline-template.service";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";

@Component({
  selector: "app-prop-rollback",
  templateUrl: "./rollback-retries.component.html",
  styles: [
    `
      :host ::ng-deep .ant-input-number {
        background: transparent;
      }
    `,
  ],
})
export class RollbackRetriesComponent implements OnInit, OnChanges {
  @Input() nodeObj: any;
  @Input() activeTab: string;
  @Output() formDataChange = new EventEmitter<any>();
  rrForm: FormGroup;
  usersList = [];
  orchestrationList = [];
  @Input() nodeDetails = [];
  userstoragedata: any = {};
  @Input() isShowHideFields = true;
  @Input() propertiesName = "";
  rollbackRetriesErrObj = {
    retryTimeInterval:
      AppConstant.VALIDATIONS.ROLLBACK_RETRIES.RETRYTIMEINTERVAL,
    retryCount: AppConstant.VALIDATIONS.ROLLBACK_RETRIES.RETRYCOUNT,
    notifiers: AppConstant.VALIDATIONS.ROLLBACK_RETRIES.NOTIFIERS,
    rollbackMethod: AppConstant.VALIDATIONS.ROLLBACK_RETRIES.ROLLBACKMETHOD,
    rollbackOption: AppConstant.VALIDATIONS.ROLLBACK_RETRIES.ROLLBACKOPTION,
    orchestrator: AppConstant.VALIDATIONS.ROLLBACK_RETRIES.ORCHESTRATOR,
  };
  nodeFormData = {};
  nodeId;
  propertiesobj;
  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private orchestrationService: OrchestrationService,
    private localStorageService: LocalStorageService,
    private pipelineService: PipelineTemplateService,
    private message: NzMessageService,
    private commonService: CommonService
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
        if (node.rollback_retries) {
          this.rrForm.patchValue({
            rollbackOption: node.rollback_retries["rollbackOption"],
            orchestrator: node.rollback_retries["orchestrator"],
            rollbackMethod: node.rollback_retries["rollbackMethod"],
            notifiers: node.rollback_retries["notifiers"],
            retryTimeInterval: node.rollback_retries["retryTimeInterval"],
            retryCount: node.rollback_retries["retryCount"],
          });
        }
      });
    }
  }

  ngOnInit(): void {
    this.getOrchestrationList();
  }

  initForm() {
    this.rrForm = this.fb.group({
      retryTimeInterval: [
        300,
        [Validators.required, Validators.minLength(300)],
      ],
      retryCount: [2, [Validators.required, Validators.minLength(2)]],
      notifiers: [null],
      rollbackMethod: ["automatic", [Validators.required]],
      rollbackOption: ["snapshot", [Validators.required]],
      orchestrator: [null],
    });
    this.getUsers();
    this.rrForm.valueChanges.subscribe(() => {
      this.saveNodeFormData();
    });
  }

  loadNodeFormData() {
    const savedData = this.pipelineService.getNodeFormData(
      this.nodeId,
      this.activeTab
    );
    if (savedData && Object.keys(savedData).length > 0) {
      this.rrForm.patchValue(savedData);
    } else {
      this.initForm();
    }
  }

  saveNodeFormData() {
    const formData = this.rrForm.value;
    this.pipelineService.setNodeFormData(this.nodeId, this.activeTab, formData);
    this.formDataChange.emit({
      tab: "rollback_retries",
      nodeId: this.nodeId,
      formData,
    });
  }

  getUsers() {
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.usersList = response.data;
        }
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
  getRollbackFormData(): any {
    const formData = this.rrForm.value;
    let obj = {
      rollbackOption: formData.rollbackOption,
      orchestrator: formData.orchestrator,
      rollbackMethod: formData.rollbackMethod,
      notifiers: formData.notifiers,
      retryTimeInterval: formData.retryTimeInterval,
      retryCount: formData.retryCount,
    };
    return obj;
  }

  addConditionalValidators() {
    const rollbackOptionControl = this.rrForm.get("rollbackOption");
    const rollbackMethodControl = this.rrForm.get("rollbackMethod");
    const orchestratorControl = this.rrForm.get("orchestrator");
    const notifiersControl = this.rrForm.get("notifiers");

    rollbackOptionControl.clearValidators();
    rollbackMethodControl.clearValidators();
    orchestratorControl.clearValidators();
    notifiersControl.clearValidators();

    if (rollbackOptionControl.value === "orchestrator") {
      orchestratorControl.setValidators([Validators.required]);
    }
    if (rollbackMethodControl.value === "notify") {
      notifiersControl.setValidators([Validators.required]);
    }
    rollbackOptionControl.updateValueAndValidity();
    rollbackMethodControl.updateValueAndValidity();
    orchestratorControl.updateValueAndValidity();
    notifiersControl.updateValueAndValidity();
  }

  formValidate() {
    this.addConditionalValidators();
    let errorMessage: any;
    if (this.rrForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.rrForm,
        this.rollbackRetriesErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.saveNodeFormData();
  }
}
