import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { PipelineTemplateService } from "../../pipeline-template.service";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-prop-integration",
  templateUrl: "../integrations/integrations.component.html",
})
export class IntegrationsComponent {
  @Input() nodeObj:any;
  @Input() activeTab: string;
  @Output() formDataChange = new EventEmitter<any>();
  @Input() nodeDetails = [];
  integrationForm: FormGroup;
  customerList = [];
  tnsettingList = [];
  userstoragedata = {} as any;
  nodeFormData = {};
  nodeId;
  propertiesobj;
  integrationErrObj = {
    tools: AppConstant.VALIDATIONS.INTEGRATIONMSG.TOOLS,
  };

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private pipelineService: PipelineTemplateService,
    private message: NzMessageService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getTenantSettingsList();
    this.getCustomerList();
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
        if (node.integration) {
          this.integrationForm.patchValue({
            tools: node.integration["tools"],
            title: node.integration["title"],
            impact: node.integration["impact"],
            notes: node.integration["notes"],
            customer: node.integration["customer"] ,
          });
        }
      });
    }
  }

  initForm(){
    this.integrationForm = this.fb.group({
      tools: [null, Validators.required],
      title:[null],
      impact: [null],
      notes: [null],
      customer: [null],
    });
    this.integrationForm.valueChanges.subscribe(() => {
      this.saveNodeFormData();
    });
  }

  loadNodeFormData() {
    const savedData = this.pipelineService.getNodeFormData(this.nodeId, this.activeTab);
    if (savedData && Object.keys(savedData).length > 0) {
      this.integrationForm.patchValue(savedData);
    } else {
      this.initForm();
    }
  }

  saveNodeFormData() {
    const formData = this.integrationForm.value;
    this.pipelineService.setNodeFormData(this.nodeId, this.activeTab, formData);
    this.formDataChange.emit({tab: 'integration', nodeId: this.nodeId, formData });
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
  getTenantSettingsList() {
    this.commonService
      .getTenantSettings({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          const tenantIntegrationSettings = response.data.filter(
            (item: any) =>
              item.setting_ref === AppConstant.TENANTKEYS.INTEGRATION
          );
          this.tnsettingList = this.formArrayData(
            tenantIntegrationSettings,
            "setting_name",
            "tnsettingid"
          );
        } else {
          this.tnsettingList = [];
        }
      });
  }
  getCustomerList() {
    this.commonService
      .allCustomers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.customerList = this.formArrayData(
            response.data,
            "customername",
            "customerid"
          );
        } else {
          this.customerList = [];
        }
      });
  }
  getIntegrationFormData(): any {
    const formData = this.integrationForm.value;
    let obj = {
        tools: formData.tools,
        title: formData.title,
        impact: formData.impact,
        notes: formData.notes,
        customer: formData.customer,
    };
    return obj;
  }
  formValidate() {
    let errorMessage: any;
    if (this.integrationForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.integrationForm,
        this.integrationErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
      this.saveNodeFormData();
  }
}