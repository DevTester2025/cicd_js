import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SetupmasterService } from "../../setupmaster.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import *as _ from 'lodash';
import { IAssetHdr, IResourceType } from 'src/app/modules/interfaces/assetrecord.interface';
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";

@Component({
  selector: 'app-add-edit-environments',
  templateUrl: './add-edit-environments.component.html',
  styleUrls: ['./add-edit-environments.component.css']
})
export class AddEditEnvironmentsComponent implements OnInit {
  environmentForm!: FormGroup;
  isUpdate = false;
  loading = false;
  isLoading = false;
  isDisabled = true;
  isComments = false;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  id: any;
  searchText: any;
  attachmentFile;
  attachmentFileImage;
  authenticationtype = AppConstant.CICD.ENVIRONMENTS.AUTHENTICATIONTYPE;
  instanceName: any[] = [];
  instanceList: any = [];
  formData = {} as any;
  tabIndex = 0 as number;
  userstoragedata = {} as any;
  type: string;
  ipaddressIsVariable: boolean = false;
  usernameIsVariable: boolean = false;
  passwordIsVariable: boolean = false;
  isInstanceNameInput: boolean = false;
  isValidateIpaddress: boolean = false;
  isValidatePassword: boolean = false;
  isValidateUsername: boolean = false;
  variableList: any[] = [];
  order = ["lastupdateddt", "desc"];
  resourceTypesList: IResourceType[] = [];
  filteredColumns = [];
  resource = {} as any;
  environmentObj: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private httpService: HttpHandlerService,
    private setupService: SetupmasterService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private routes: ActivatedRoute,
    private assetRecordService: AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.queryParams.subscribe((params) => {
      this.type = params["type"];
    });
    this.routes.params.subscribe((params) => {
      if (params["id"]) {
        this.isUpdate = true;
        this.id = params["id"];
        this.getenvironmentById(this.id);
        this.isValidateIpaddress = true;
        this.isValidateUsername = true;
        this.isValidatePassword = true;
      }
    });
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SETUP,
    });
    if (_.includes(this.appScreens.actions, "Comments")) {
      this.isComments = true;
    }
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }
  get outgoingResources(): FormArray {
    return this.environmentForm.get("outgoingResources") as FormArray;
  }
  ngOnInit() {
    this.initForm();
    this.getServerList();
    this.passwordprotectorValidility();
    this.isPasswordValidility();
    this.getAllCustomVariablesList();
    this.getResourceType();
    if (!this.isUpdate) {
      this.addRow();
    }
  }

  getAllCustomVariablesList() {
    this.loading = true;
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      try {
        const response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          _.map(response.data.rows, (secret: any) => {
            const variable = {
              label: secret.keyname,
              value: secret.keyname,
            };
            this.variableList.push(variable);
          });

        } else {
          this.loading = false;
          this.variableList = [];
        }
      } catch (error) {
        this.loading = false;
        this.variableList = [];
      }
    },
      (error) => {
        this.loading = false;
        this.variableList = [];
      }
    );
  }

  initForm() {
    if (this.type === 'VIRTUAL_MACHINE') {
      this.environmentForm = this.fb.group({
        instancerefid: [null],
        instancename: [null],
        ipaddressisvariable: [false],
        ipaddressvariable: [null],
        ipaddress: [null, [Validators.required]],
        usernameisvariable: [false],
        usernamevariable: [null],
        username: [null, [Validators.required]],
        passwordisvariable: [false],
        passwordvariable: [null],
        password: [null, [Validators.required]],
        ispasswordprotector: [false],
        passwordprotector: [null],
        description: [null, [Validators.maxLength(500)]],
        resourcetype: [null],
        attributes: [null],
        outgoingResources: this.fb.array([]),
        authenticationtype: ['PASSWORD', [Validators.required]],
      });
    }
  }
  onSearchChange(searchText: string) {
    this.instanceList = [];
    this.getServerList(searchText);
  }
  getServerList(searchText?: string, instancerefid?: string) {
    this.instanceList = [];
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      instancerefid: instancerefid
    } as any;
    if (searchText !== "") {
      condition.searchText = searchText;
    }
    let query = 'order=lastupdateddt,desc';
    this.commonService.allInstances(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = response.data;
        this.instanceName = [];
        const k = new Set();
        if (this.instanceList.length > 0) {
          _.map(this.instanceList, (instance: any) => {
            if (!k.has(instance.instancerefid)) {
              k.add(instance.instancerefid);
              const instances = {
                label: instance.instancename,
                value: instance.instancerefid,
                ipaddress: instance.privateipv4,
              };
              this.instanceName.push(instances);
            }
          });
        }
      } else {
        this.instanceName = [];
      }
    });
  }
  onInstanceChange(instancerefid: any) {
    if (!instancerefid) {
      this.environmentForm.patchValue({
        ipaddress: null,
      });
      this.ipaddressReadOnly();
      return;
    }
    const selectedInstance = this.instanceList.find(instance => instance.instancerefid === instancerefid);
    if (selectedInstance) {
      this.environmentForm.patchValue({
        ipaddress: selectedInstance.privateipv4
      });
      this.ipaddressReadOnly();
    }
  }
  ipaddressReadOnly() {
    const ipv4Control = this.environmentForm.get('ipaddress');
    if (ipv4Control.value) {
      ipv4Control.disable();
    } else {
      ipv4Control.enable();
    }
  }

  onIpaddressChange() {
    const ipaddress = this.environmentForm.get('ipaddress');
    const instancerefid = this.environmentForm.get('instancerefid');
    if (ipaddress.status === 'VALID' && instancerefid.value === null) {
      this.isInstanceNameInput = true;
      this.environmentForm.get('instancename').setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(45)]);
    } else {
      this.isInstanceNameInput = false;
      this.environmentForm.get('instancename').clearValidators();
      this.environmentForm.patchValue({ instancename: null });
    }
    this.environmentForm.get('instancename').updateValueAndValidity();
  }

  passwordprotectorValidility() {
    if (this.type === 'VIRTUAL_MACHINE') {
      this.environmentForm.get("ispasswordprotector").valueChanges.subscribe((k) => {
        const passwordOnControl = this.environmentForm.get("passwordprotector");
        if (k && this.type === 'VIRTUAL_MACHINE') {
          passwordOnControl.setValidators([Validators.minLength(3), Validators.maxLength(45)]);
        } else {
          passwordOnControl.clearValidators();
          passwordOnControl.reset();
        }
        passwordOnControl.updateValueAndValidity();
      });
    }
  }
  passwordValidility() {
    if (this.type === 'VIRTUAL_MACHINE') {
      const passwordControl = this.environmentForm.get("password");
      this.environmentForm.get("authenticationtype").valueChanges.subscribe((i) => {
        if (i === 'PASSWORD') {
          passwordControl.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(45)]);
        } else {
          passwordControl.clearValidators();
          passwordControl.reset();
        }
        passwordControl.updateValueAndValidity();
      });
    }
  }
  isPasswordValidility() {
    if (this.type === 'VIRTUAL_MACHINE') {
      const isPasswordProtectorControl = this.environmentForm.get("ispasswordprotector");
      const passwordProtectorControl = this.environmentForm.get("passwordprotector");
      this.environmentForm.get("authenticationtype").valueChanges.subscribe((n) => {
        if (n === 'PASSWORD') {
          isPasswordProtectorControl.setValue(false);
          passwordProtectorControl.setValue(null);
          isPasswordProtectorControl.disable()
        } else {
          isPasswordProtectorControl.enable();
        }
      });
    }
  }
  createEnvironment() {
    if (this.environmentForm.valid) {
      this.isLoading = true;
      this.formData = this.environmentForm.value;
      this.formData.ipaddress = this.environmentForm.get('ipaddress').value;
      const selectedInstance = this.instanceList.find(instance => instance.instancerefid === this.formData.instancerefid);
      let environmentData: any = this.buildEnvironmentObject(selectedInstance);
      console.log('environmentData', environmentData)
      if (this.formData.outgoingResources.length > 0) {
        environmentData.outgoingResources = this.formData.outgoingResources
      }
      if (this.isUpdate) {
        environmentData.lastupdatedby = this.userstoragedata.fullname;
        this.setupService.updateEnvironment(this.id, environmentData).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
      } else {
        environmentData.createdby = this.userstoragedata.fullname;
        this.setupService.createEnvironment(environmentData).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
      }
    } else {
      Object.values(this.environmentForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error("Please fill in the required fields");
    }
  }

  buildEnvironmentObject(selectedInstance) {
    const data = {
      tenantid: this.userstoragedata.tenantid,
      type: this.type,
      instancerefid: this.ipaddressIsVariable ? null : this.formData.instancerefid,
      instancename: selectedInstance ? selectedInstance.instancename : this.formData.instancename,
      ipaddressisvariable: this.formData.ipaddressisvariable,
      ipaddressvariable: this.ipaddressIsVariable ? this.formData.ipaddressvariable : null,
      ipaddress: this.ipaddressIsVariable ? null : this.formData.ipaddress,
      usernameisvariable: this.formData.usernameisvariable,
      usernamevariable: this.usernameIsVariable ? this.formData.usernamevariable : null,
      username: this.usernameIsVariable ? null : this.formData.username,
      passwordisvariable: this.formData.passwordisvariable,
      passwordvariable: this.passwordIsVariable ? this.formData.passwordvariable : null,
      password: this.passwordIsVariable ? null : this.formData.password,
      authenticationtype: this.formData.authenticationtype,
      description: this.formData.description,   
      attributes: this.formData.attributes,
      crn:this.formData.resourcetype,
      referencetype: AppConstant.CICD_REFERENCE[3]
    };

    return data;
  }

  handleResponse(response: any) {
    if (response.status) {
      this.message.info(response.message);
      this.formData = {};
      this.router.navigate(["cicd/setup"], {
        queryParams: {
          tabIndex: 4,
          mode: 'ENV'
        },
      });
    } else {
      this.message.error(response.message);
    }
    this.loading = false;
  }
  getenvironmentById(id: number) {
    this.loading = true;
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.SETUP.ENVIRONMENTS.GETBYID +
      id +
      `?tenantid=${this.userstoragedata.tenantid}`;
      const incomingResourceTypes = [];
      const outgoingResourceTypes = [];
    this.httpService.GET(query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (response.data.environmentsCMDB.length > 0 &&response.data.environmentsCMDB) {
          response.data.environmentsCMDB.forEach((item) => {
            if (item.resource_type === AppConstant.CICD_RESOUCE_TYPE[0]) {
              const resourceType = item.crn;
              const fieldName = JSON.parse(item.fieldname);
              incomingResourceTypes.push({ resourceType, fieldName });
            } else if (item.resource_type === AppConstant.CICD_RESOUCE_TYPE[1]) {
              const resourceType = item.crn;
              const fieldName = JSON.parse(item.fieldname);
              outgoingResourceTypes.push({ resourceType, fieldName });
            }
          });
        }
        this.ipaddressIsVariable = response.data.ipaddressisvariable;
        this.usernameIsVariable = response.data.usernameisvariable;
        this.passwordIsVariable = response.data.passwordisvariable;
        this.environmentObj = response.data;
        this.environmentObj.refid = response.data.id;
        this.environmentObj.reftype = AppConstant.REFERENCETYPE[11];
        this.environmentForm.patchValue({
          instancerefid: response.data.instancerefid,
          instancename: response.data.instancename,
          ipaddressisvariable: response.data.ipaddressisvariable,
          ipaddressvariable: response.data.ipaddressvariable,
          ipaddress: response.data.ipaddress,
          usernameisvariable: response.data.usernameisvariable,
          usernamevariable: response.data.usernamevariable,
          username: response.data.username,
          passwordisvariable: response.data.passwordisvariable,
          passwordvariable: response.data.passwordvariable,
          password: response.data.password,
          description: response.data.description,
          authenticationtype: response.data.authenticationtype,
        });
        if (incomingResourceTypes.length > 0) {
          const { resourceType, fieldName } = incomingResourceTypes[0];
          this.environmentForm.patchValue({
            resourcetype: resourceType,
            attributes: fieldName
          });
        }
      const outgoingResourceFormArray = this.environmentForm.get('outgoingResources') as FormArray;
      if (outgoingResourceFormArray.controls.length === 0 && outgoingResourceTypes.length === 0) {
        outgoingResourceFormArray.push(this.fb.group({
          outgoingResourcetype: [null, Validators.required],
          outgoingattributes: [null, Validators.required]
        }));
      } 
      outgoingResourceTypes.forEach(outgoing => {
        outgoingResourceFormArray.push(this.fb.group({
          outgoingResourcetype: [outgoing.resourceType],
          outgoingattributes: [outgoing.fieldName]
        }));
        this.getResourceDetail(outgoing.resourceType); 
      });
        if (response.data.instancerefid === null) {
          this.isInstanceNameInput = true;
          this.environmentForm.patchValue({
            instancename: response.data.instancename,
          })
        } else {
          this.isInstanceNameInput = false;
          this.ipaddressReadOnly();
          this.getServerList('', response.data.instancerefid);
        }
      } else {
        this.message.error(response.message);
      }
      this.loading = false;
    });
  }
  onFile(event) {
    const reader = new FileReader();
    this.attachmentFile = event.target.files[0];
    reader.onload = (e) => {
      this.attachmentFileImage = e.target["result"];
    };
    reader.readAsDataURL(event.target.files[0]);
    if (this.isUpdate) {
      this.fileUpload();
    }
  }
  fileUpload() {
    const formdata = new FormData();
    let data = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (this.attachmentFile != undefined && this.attachmentFile != null) {
      formdata.append("file", this.attachmentFile);
    } else {
      this.message.error("Please upload file");
      return false;
    }
    formdata.append("formData", JSON.stringify(data));
  }
  discard() {
    this.router.navigate(["cicd/setup"], {
      queryParams: {
        tabIndex: 4,
        mode: 'ENV'
      },
    });
  }

  isVariable(v: string) {
    if (v == "ipaddressIsVariable") {
      this.ipaddressIsVariable = this.isValidateIpaddress ? this.ipaddressIsVariable : !this.ipaddressIsVariable;
      this.formValidator('ipaddressvariable', 'ipaddress', this.ipaddressIsVariable)
      this.isValidateIpaddress = false;
      if (this.ipaddressIsVariable) {
        this.isInstanceNameInput = true;
        this.environmentForm.get('instancename').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(45)]);
      } else {
        this.isInstanceNameInput = false;
        this.environmentForm.get('instancename').clearValidators();
        this.environmentForm.get('instancename').updateValueAndValidity();
      }
    } else if (v == "usernameIsVariable") {
      this.usernameIsVariable = this.isValidateUsername ? this.usernameIsVariable : !this.usernameIsVariable;
      this.formValidator('usernamevariable', 'username', this.usernameIsVariable)
      this.isValidateUsername = false;
    } else if (v == "passwordIsVariable") {
      this.passwordIsVariable = this.isValidatePassword ? this.passwordIsVariable : !this.passwordIsVariable;
      this.formValidator('passwordvariable', 'password', this.passwordIsVariable)
      this.isValidatePassword = false;
    }
  }

  formValidator(variable: string, input: string, isVariable: boolean) {
    if (this.environmentForm) {
      if (isVariable) {
        this.environmentForm.get(variable).setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(45)]);
        this.environmentForm.get(input).clearValidators();
      } else {
        this.environmentForm.get(input).setValidators([Validators.required]);
        this.environmentForm.get(variable).clearValidators();
      }
      this.environmentForm.get(variable).updateValueAndValidity();
      this.environmentForm.get(input).updateValueAndValidity();
    }
  }
  addRow(): void {
    const resourceGroup = this.fb.group({
      outgoingResourcetype: [null],
      outgoingattributes: [null],
    });
    this.outgoingResources.push(resourceGroup);
  }
  deleteRow(index: number): void {
    this.outgoingResources.removeAt(index);
  }
  getResourceType() {
    this.assetRecordService
      .getResourceTypes({
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
      })
      .subscribe((response: any) => {
        if (response._body) {
          try {
            let data: IResourceType[] = JSON.parse(response._body);
            if (data && Array.isArray(data)) {
              this.resourceTypesList = _.orderBy(data, ["resource"], ["asc"]);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      });
  }
  getResourceDetail(crn: string, type?: any, index?: number) {
    if (!crn) {
      if (type === "input") {
        this.environmentForm.get("attributes").setValue(null);
      } else if (type === "output" && index !== undefined) {
        this.outgoingResources
          .at(index)
          .get("outgoingattributes")
          .setValue(null);
      }
      return;
    }
    let r = this.resource[crn];
    if (!r) {
      this.assetRecordService
        .getResource(
          this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
            "tenantid"
          ],
          crn
        )
        .subscribe((d) => {
          let response: IAssetHdr[] = JSON.parse(d._body);
          this.filteredColumns = [];
          _.each(response, (itm: any, idx: number) => {
            itm.isSelected = itm.showbydefault;
            if (itm.fieldtype != "Reference Asset") {
              this.filteredColumns.push(itm);
            }
            if (itm.fieldtype == "Reference Asset") {
              let referenceasset = JSON.parse(itm.referenceasset);
              _.map(referenceasset.attribute, (dtl) => {
                let attribute: any = _.find(
                  AssetAttributesConstant.COLUMNS[referenceasset.assettype],
                  {
                    field: dtl,
                  }
                );
                this.filteredColumns.push({
                  referencekey: attribute.referencekey,
                  fieldname: attribute.header,
                  fieldtype: itm.fieldtype,
                  fieldkey: attribute.field,
                  linkid: attribute.linkid,
                  referenceasset: referenceasset,
                  assettype: referenceasset.assettype,
                });
              });
            }
          });
          this.filteredColumns = [
            ..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"]),
          ];
        });
    }
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}