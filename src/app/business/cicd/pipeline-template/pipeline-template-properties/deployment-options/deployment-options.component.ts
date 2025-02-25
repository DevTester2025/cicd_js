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
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { AlertConfigService } from "src/app/business/base/alertconfigs/alertconfig.service";
import { OrchestrationService } from "src/app/business/base/orchestration/orchestration.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { PipelineTemplateService } from "../../pipeline-template.service";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-prop-envnode",
  templateUrl: "./deployment-options.component.html",
  styles: [
    `
      :host ::ng-deep .ant-input-number {
        background: transparent;
      }
    `,
  ],
})
export class DeploymentOptionsComponent implements OnInit, OnChanges {
  @Input() nodeObj: any;
  @Input() activeTab: string;
  @Input() nodeDetails = [];
  @Output() formDataChange = new EventEmitter<any>();
  deploymentForm: FormGroup;
  userstoragedata: any = {};
  orchestrationList = [];
  cloudproviderList = [];
  tagList = [];
  customersList = [];
  accountsList = [];
  instance = [];
  selectedTag = {} as any;
  filters = {
    customers: null,
    accounts: null,
    tagid: null,
    tagvalue: null,
    instancerefid: null,
  } as any;
  regionList = [];
  propertiesobj;
  nodeFormData = {};
  nodeId;
  groupedDeployment = {};
  settingsErrObj = {
    action: AppConstant.VALIDATIONS.SETTINGSMSG.action,
    orchestration: AppConstant.VALIDATIONS.SETTINGSMSG.orchestration,
    type: AppConstant.VALIDATIONS.SETTINGSMSG.type,
    frequency: AppConstant.VALIDATIONS.SETTINGSMSG.frequency,
    username: AppConstant.VALIDATIONS.SETTINGSMSG.username,
    password: AppConstant.VALIDATIONS.SETTINGSMSG.password,
    ip: AppConstant.VALIDATIONS.SETTINGSMSG.ip,
    storagetype: AppConstant.VALIDATIONS.SETTINGSMSG.storagetype,
    provider: AppConstant.VALIDATIONS.SETTINGSMSG.provider,
    endpoint: AppConstant.VALIDATIONS.SETTINGSMSG.endpoint,
    folder: AppConstant.VALIDATIONS.SETTINGSMSG.folder,
    accesskey: AppConstant.VALIDATIONS.SETTINGSMSG.accesskey,
    secretkey: AppConstant.VALIDATIONS.SETTINGSMSG.secretkey,
    customers: AppConstant.VALIDATIONS.SETTINGSMSG.customers,
    accounts: AppConstant.VALIDATIONS.SETTINGSMSG.accounts,
    tag: AppConstant.VALIDATIONS.SETTINGSMSG.tag,
    tagvalue: AppConstant.VALIDATIONS.SETTINGSMSG.tagvalue,
    instance: AppConstant.VALIDATIONS.SETTINGSMSG.instance,
    region: AppConstant.VALIDATIONS.SETTINGSMSG.region,
  };
  constructor(
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private orchestrationsService: OrchestrationService,
    private commonService: CommonService,
    private httpHandler: HttpHandlerService,
    private customerAccService: CustomerAccountService,
    private tagService: TagService,
    private alertConfigService: AlertConfigService,
    private httpService: HttpHandlerService,
    private pipelineService: PipelineTemplateService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.initForm();
  }
  ngOnInit(): void {
    this.getAllCustomers();
    this.getAccountsList();
    this.getAllTags();
    this.getfilteredInstance();
    this.getAllRegions();
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
        if (node.settings) {
          const settings = node.settings;
          if (settings.type === "BG") {
            this.deploymentForm.patchValue({
              type: settings["type"],
              customers: settings["customers"],
              accounts: settings["accounts"],
              tag: settings["tag"] || null,
              tagvalue: settings["tagvalue"],
              instance: settings["instance"],
            });
          } else if (settings.type === "C") {
            this.deploymentForm.patchValue({
              type: settings["type"],
              frequency: settings["frequency"],
            });
          }
          if (settings.storagetype === "FTP") {
            this.deploymentForm.patchValue({
              type: settings["type"],
              username: settings["username"],
              password: settings["password"],
              ip: settings["ip"],
            });
          } else if (settings.storagetype === "Storage_Object") {
            this.deploymentForm.patchValue({
              type: settings["type"],
              provider: settings["provider"],
              accesskey: settings["accesskey"],
              secretkey: settings["secretkey"],
              bucketname: settings["bucketname"],
              endpoint: settings["endpoint"],
              region: settings["region"],
            });
          }
          this.deploymentForm.patchValue({
            autoswitch: settings["autoswitch"],
            action: settings["action"],
            orchestration: settings["orchestration"],
          });
        }
      });
      console.log(this.deploymentForm.value, "Patched Form Value");
    }
  }

  initForm() {
    this.deploymentForm = this.fb.group({
      autoswitch: [true],
      action: ["Yes", [Validators.required]],
      orchestration: [null],
      type: ["C", [Validators.required]],
      frequency: [2],
      username: [null],
      password: [null],
      ip: [null],
      storagetype: ["FTP", [Validators.required]],
      provider: [null],
      endpoint: [null],
      folder: [null],
      accesskey: [null],
      secretkey: [null],
      customers: [null],
      accounts: [null],
      tag: [null],
      tagvalue: [null],
      instance: [null],
      region: [null],
    });
    this.getOrchestrationList();
    this.getproviderList();
    this.deploymentForm.valueChanges.subscribe(() => {
      this.saveNodeFormData();
    });
  }

  loadNodeFormData() {
    const savedData = this.pipelineService.getNodeFormData(
      this.nodeId,
      this.activeTab
    );
    if (savedData && Object.keys(savedData).length > 0) {
      this.deploymentForm.patchValue(savedData);
    } else {
      this.initForm();
    }
  }

  saveNodeFormData() {
    const formData = this.deploymentForm.value;
    this.pipelineService.setNodeFormData(this.nodeId, this.activeTab, formData);
    this.formDataChange.emit({
      tab: "settings",
      nodeId: this.nodeId,
      formData,
    });
  }

  getproviderList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: -1,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.cloudproviderList = response.data;
      } else {
        this.cloudproviderList = [];
      }
    });
  }

  getOrchestrationList() {
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      module: AppConstant.CICD.MODULE.DR,
    };

    this.orchestrationsService.all(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.orchestrationList = response.data;
      } else {
        this.orchestrationList = [];
      }
    });
  }
  getAllCustomers() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.httpHandler
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL,
        cndtn
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.customersList = response.data;
        } else {
          this.customersList = [];
        }
      });
  }

  onCustomerChange(customerid?) {
    this.getfilteredInstance(
      this.deploymentForm.controls["accounts"].value,
      customerid
    );
  }

  getAccountsList() {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountsList = response.data;
      } else {
        this.accountsList = [];
      }
    });
  }

  onAccountChange(accountid?) {
    this.getfilteredInstance(
      accountid,
      this.deploymentForm.controls["customers"].value
    );
  }

  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues =
              Math.floor(Math.random() * (obj.max - obj.min + 1)) + obj.min;
          }
          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }
  tagChanged(e) {
    if (e) {
      let tag = this.tagList.find((o) => o["tagid"] == e);
      let tagClone = _.cloneDeep(tag);
      this.deploymentForm.get("tagvalue").reset();
      if (tagClone && tagClone.tagtype == "list") {
        tagClone.lookupvalues = tagClone.lookupvalues.split(",");
      } else if (
        tagClone.tagtype == "range" &&
        typeof tagClone.lookupvalues == "string"
      ) {
        tagClone.min = tagClone.lookupvalues.split(",")[0];
        tagClone.max = tagClone.lookupvalues.split(",")[1];
      }

      this.selectedTag = _.cloneDeep(tagClone);
    }
  }

  getfilteredInstance(
    selectedData?: number,
    selectedCustomer?: number,
    selectedTag?: number
  ) {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (selectedCustomer !== undefined && selectedCustomer !== null) {
      condition["_customer"] = selectedCustomer;
    }
    if (selectedData !== undefined && selectedData !== null) {
      condition["_account"] = selectedData;
    }
    if (selectedTag !== undefined && selectedTag !== null) {
      condition["_tag"] = selectedTag;
    }
    this.alertConfigService.instanceFilter(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instance = response.data;
      } else {
        this.instance = [];
      }
    });
  }

  getAllRegions() {
    this.regionList = [];
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
        condition
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.regionList = response.data;
        } else {
          this.regionList = [];
        }
      });
  }

  getDeploymentFormData(): any {
    const formValue = this.deploymentForm.value;
    return formValue;
  }

  addConditionalValidators() {
    const storagetypeControl = this.deploymentForm.get("storagetype");
    const actionControl = this.deploymentForm.get("action");
    const typeControl = this.deploymentForm.get("type");

    const usernameControl = this.deploymentForm.get("username");
    const passwordControl = this.deploymentForm.get("password");
    const ipControl = this.deploymentForm.get("ip");
    const providerControl = this.deploymentForm.get("provider");
    const regionControl = this.deploymentForm.get("region");
    const folderControl = this.deploymentForm.get("folder");
    const endpointControl = this.deploymentForm.get("endpoint");
    const accesskeyControl = this.deploymentForm.get("accesskey");
    const secretkeyControl = this.deploymentForm.get("secretkey");
    const orchestrationControl = this.deploymentForm.get("orchestration");
    const frequencyControl = this.deploymentForm.get("frequency");
    const customersControl = this.deploymentForm.get("customers");
    const accountsControl = this.deploymentForm.get("accounts");
    const tagControl = this.deploymentForm.get("tag");
    const tagvalueControl = this.deploymentForm.get("tagvalue");
    const instanceControl = this.deploymentForm.get("instance");

    usernameControl.clearValidators();
    passwordControl.clearValidators();
    ipControl.clearValidators();
    providerControl.clearValidators();
    regionControl.clearValidators();
    endpointControl.clearValidators();
    accesskeyControl.clearValidators();
    secretkeyControl.clearValidators();
    folderControl.clearValidators();
    orchestrationControl.clearValidators();
    frequencyControl.clearValidators();
    customersControl.clearValidators();
    accountsControl.clearValidators();
    tagControl.clearValidators();
    tagvalueControl.clearValidators();
    instanceControl.clearValidators();

    if (storagetypeControl.value === "FTP") {
      usernameControl.setValidators([Validators.required]);
      passwordControl.setValidators([Validators.required]);
      ipControl.setValidators([Validators.required]);
    }
    if (storagetypeControl.value === "StorageObjects") {
      providerControl.setValidators([Validators.required]);
      regionControl.setValidators([Validators.required]);
      endpointControl.setValidators([Validators.required]);
      accesskeyControl.setValidators([Validators.required]);
      secretkeyControl.setValidators([Validators.required]);
      folderControl.setValidators([Validators.required]);
    }
    if (actionControl.value === "Yes") {
      orchestrationControl.setValidators([Validators.required]);
    }
    if (typeControl.value === "C") {
      frequencyControl.setValidators([Validators.required]);
    }
    if (typeControl.value === "BG") {
      customersControl.setValidators([Validators.required]);
      accountsControl.setValidators([Validators.required]);
      tagControl.setValidators([Validators.required]);
      tagvalueControl.setValidators([Validators.required]);
      instanceControl.setValidators([Validators.required]);
    }

    usernameControl.updateValueAndValidity();
    passwordControl.updateValueAndValidity();
    ipControl.updateValueAndValidity();
    providerControl.updateValueAndValidity();
    regionControl.updateValueAndValidity();
    endpointControl.updateValueAndValidity();
    accesskeyControl.updateValueAndValidity();
    secretkeyControl.updateValueAndValidity();
    folderControl.updateValueAndValidity();
    orchestrationControl.updateValueAndValidity();
    frequencyControl.updateValueAndValidity();
    customersControl.updateValueAndValidity();
    accountsControl.updateValueAndValidity();
    tagControl.updateValueAndValidity();
    tagvalueControl.updateValueAndValidity();
    instanceControl.updateValueAndValidity();
  }

  formValidate() {
    this.addConditionalValidators();
    let errorMessage: any;
    if (this.deploymentForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.deploymentForm,
        this.settingsErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.saveNodeFormData();
  }
}
