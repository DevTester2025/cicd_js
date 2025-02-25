import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AppConstant } from "src/app/app.constant";
import { SetupmasterService } from "../../setupmaster.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import *as _ from 'lodash';
import { AssetRecordService } from 'src/app/business/base/assetrecords/assetrecords.service';
import { IAssetHdr, IResourceType } from 'src/app/modules/interfaces/assetrecord.interface';
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";

@Component({
  selector: 'app-add-edit-container-registry',
  templateUrl: './add-edit-container-registry.component.html',
  styleUrls: ['./add-edit-container-registry.component.css']
})
export class AddEditContainerRegistryComponent implements OnInit {
  containerForm!: FormGroup;
  isUpdate = false;
  loading = false;
  isLoading = false;
  isComments = false;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  id: any;
  formData = {} as any;
  userstoragedata = {} as any;
  type: string;
  urlIsVariable: boolean = false;
  tabIndex = 0 as number;
  accesstokenIsVariable: boolean = false;
  usernameIsVariable: boolean = false;
  isValidateUrl: boolean = false;
  isValidateAccesstoken: boolean = false;
  isValidateUsername: boolean = false;
  variableList: any[] = [];
  order = ["lastupdateddt", "desc"];
  resourceTypesList: IResourceType[] = [];
  filteredColumns = [];
  resource = {} as any;
  containerObj: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private httpService: HttpHandlerService,
    private setupService: SetupmasterService,
    private localStorageService: LocalStorageService,
    private routes: ActivatedRoute,
    private assetRecordService: AssetRecordService) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.queryParams.subscribe(params => {
      this.type = params['type'];
    });
    this.routes.params.subscribe((params) => {
      if (params["id"]) {
        this.isUpdate = true;
        this.id = params["id"];
        this.getContainerById(this.id);
        this.isValidateUrl = true;
        this.isValidateAccesstoken = true;
        this.isValidateUsername = true;
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
    return this.containerForm.get("outgoingResources") as FormArray;
  }
  ngOnInit() {
    this.initForm();
    this.getResourceType();
    this.getAllCustomVariablesList();
    if (!this.isUpdate) {
      this.addRow();
    }
}
  getAllCustomVariablesList() {
    this.loading = true;
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    queryParams.set("variabletype", AppConstant.CICD.STATUS.VARIABLE_TYPE[0]);
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      try{
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
    }catch(error){
      this.loading = false;
      this.variableList = [];
    }
    },(error)=>{
      this.loading = false;
      this.variableList = [];
    });
  }
  initForm() {
    this.containerForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      usernameisvariable: [
        false
      ],
      usernamevariable: [
        null
      ],
      accesstokenisvariable: [
        false
      ],
      accesstokenvariable: [
        null
      ],
      urlisvariable: [
        null
      ],
      urlvariable: [
        false
      ],
      username: [
        null, [Validators.required, Validators.minLength(3), Validators.maxLength(45)]
      ],
      accesstoken: [
        null, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]
      ],
      description: ["", [Validators.maxLength(500)]],
      resourcetype: [null],
      attributes: [null],
      outgoingResources: this.fb.array([]),
      url: [
        null, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]
      ],
    });
  }

  createContainer() {
    if (this.containerForm.valid) {
      this.isLoading = true;
      this.formData = this.containerForm.value;
      const containerData: any = this.buildContainerObject();
      if (this.isUpdate) {
        containerData.lastupdatedby = this.userstoragedata.fullname;
      } else {
        containerData.createdby = this.userstoragedata.fullname;
      }
      if (this.formData.outgoingResources.length > 0) {
        containerData.outgoingResources = this.formData.outgoingResources
      }
      if (this.isUpdate) {
        this.setupService
          .updateContainerRegistry(this.id, containerData)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            this.handleResponse(response);
            setTimeout(() => {
              this.isLoading = false;
            }, 500);
          });
      } else {
        this.setupService.createContainerRegistry(containerData).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
      }
    } else {
      Object.values(this.containerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error("Please fill in the required fields");
    }
  }

  buildContainerObject() {
    const data: any = {
      tenantid: this.userstoragedata.tenantid,
      name: this.formData.name,
      usernameisvariable: this.formData.usernameisvariable,
      usernamevariable: this.usernameIsVariable ? this.formData.usernamevariable : null,
      username: this.usernameIsVariable ? null : this.formData.username,
      accesstokenisvariable: this.formData.accesstokenisvariable,
      accesstokenvariable: this.accesstokenIsVariable ? this.formData.accesstokenvariable : null,
      accesstoken: this.accesstokenIsVariable ? null : this.formData.accesstoken,
      description: this.formData.description || "",
      urlisvariable: this.formData.urlisvariable,
      urlvariable: this.urlIsVariable ? this.formData.urlvariable : null,
      url: this.urlIsVariable ? null : this.formData.url,
      type: this.type,
      attributes: this.formData.attributes,
      crn:this.formData.resourcetype,
      referencetype:AppConstant.CICD_REFERENCE[1]
    };
    return data
  }

  handleResponse(response: any) {
    if (response.status) {
      this.message.info(response.message);
      this.formData = {};
      this.router.navigate(["cicd/setup"], {
        queryParams: {
          tabIndex: 1,
        },
      });
    } else {
      this.message.error(response.message);
    }
    this.loading = false;
  }
  getContainerById(id: number) {
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.SETUP.CONTAINER_REGISTRY.GETBYID +
      id +
      `?tenantid=${this.userstoragedata.tenantid}`;
      const incomingResourceTypes = [];
      const outgoingResourceTypes = [];
    this.httpService.GET(query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (
          response.data.containerRegistryCMDB.length > 0 &&
          response.data.containerRegistryCMDB
        ) {
          response.data.containerRegistryCMDB.forEach((item) => {
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
        this.urlIsVariable = response.data.urlisvariable;
        this.accesstokenIsVariable = response.data.accesstokenisvariable;
        this.usernameIsVariable = response.data.usernameisvariable;
        this.containerObj = response.data
        this.containerObj.refid = response.data.id;
        this.containerObj.reftype = AppConstant.REFERENCETYPE[14];
        this.containerForm.patchValue({
          name: response.data.name,
          usernameisvariable: response.data.usernameisvariable,
          usernamevariable: response.data.usernamevariable,
          accesstokenisvariable: response.data.accesstokenisvariable,
          accesstokenvariable: response.data.accesstokenvariable,
          urlisvariable: response.data.urlisvariable,
          urlvariable: response.data.urlvariable,
          username: response.data.username,
          accesstoken: response.data.accesstoken,
          description: response.data.description,
          url: response.data.url,
        });
        if (incomingResourceTypes.length > 0) {
          const { resourceType, fieldName } = incomingResourceTypes[0];
          this.containerForm.patchValue({
            resourcetype: resourceType,
            attributes: fieldName
          });
        }
        const outgoingResourceFormArray = this.containerForm.get('outgoingResources') as FormArray;
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
      } else {
        this.message.error(response.message);
      }
      this.loading = false;
    });
  }
  discard() {
    this.router.navigate(["cicd/setup"], {
      queryParams: {
        tabIndex: 1,
      },
    });
  }

  isVariable(variable: string) {
    if (variable == "usernameIsVariable") {
      this.usernameIsVariable = this.isValidateUsername ? this.usernameIsVariable : !this.usernameIsVariable;
      this.formValidator('usernamevariable', 'username', this.usernameIsVariable)
      this.isValidateUsername = false;
    } else if (variable == "accesstokenIsVariable") {
      this.accesstokenIsVariable = this.isValidateAccesstoken ? this.accesstokenIsVariable : !this.accesstokenIsVariable;
      this.formValidator('accesstokenvariable', 'accesstoken', this.accesstokenIsVariable)
      this.isValidateAccesstoken = false;
    } else if (variable == "urlIsVariable") {
      this.urlIsVariable = this.isValidateUrl ? this.urlIsVariable : !this.urlIsVariable;
      this.formValidator('urlvariable', 'url', this.urlIsVariable)
      this.isValidateUrl = false;
    }
  }

  formValidator(variable: string, input: string, isVariable: boolean) {
    if (this.containerForm) {
      if (isVariable) {
        this.containerForm.get(variable).setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(45)]);
        this.containerForm.get(input).clearValidators();
      } else {
        this.containerForm.get(input).setValidators([Validators.required]);
        this.containerForm.get(variable).clearValidators();
      }
      this.containerForm.get(variable).updateValueAndValidity();
      this.containerForm.get(input).updateValueAndValidity();
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
        this.containerForm.get("attributes").setValue(null);
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
