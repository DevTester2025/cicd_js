import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SetupmasterService } from "../../setupmaster.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import *as _ from 'lodash';
import { IAssetHdr, IResourceType } from 'src/app/modules/interfaces/assetrecord.interface';
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";

@Component({
  selector: "app-add-edit-custom-variables",
  templateUrl: "./add-edit-custom-variables.component.html",
  styleUrls: ["./add-edit-custom-variables.component.css"],
})
export class AddEditCustomVariablesComponent implements OnInit {
  customvariableForm!: FormGroup;
  isUpdate = false;
  loading = false;
  isComments = false;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  id: any;
  environmentsList = [];
  environmentValues = [];
  variableType = AppConstant.CICD.ENVIRONMENTS.VARIABLETYPE;
  keyType = AppConstant.CICD.ENVIRONMENTS.KEYTYPE;
  formData = {} as any;
  userstoragedata = {} as any;
  pageIndex: number = 0;
  limit: string = "";
  tabIndex = 0 as number;
  resourceTypesList: IResourceType[] = [];
  filteredColumns = [];
  resource = {} as any;
  customvariabledObj: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private httpService: HttpHandlerService,
    private setupService: SetupmasterService,
    private localStorageService: LocalStorageService,
    private routes: ActivatedRoute,
    private commonService: CommonService,
    private assetRecordService: AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.params.subscribe((params) => {
      if (params["id"]) {
        this.isUpdate = true;
        this.id = params["id"];
        this.getcustomvariableById(this.id);
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
    return this.customvariableForm.get("outgoingResources") as FormArray;
  }
  ngOnInit() {
    this.routes.queryParams.subscribe((params) => {
      this.pageIndex = parseInt(params["page"]);
      this.limit = params['limit'];
    });
    this.initForm();
    this.getLookupList();
    this.getResourceType();
    if (!this.isUpdate) {
      this.addRow();
    }
  }

  initForm() {
    this.customvariableForm = this.fb.group({
      keyname: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(45),
        ],
      ],
      description: ["", [Validators.maxLength(500)]],
      resourcetype: [null],
      attributes: [null],
      outgoingResources: this.fb.array([]),
      variabletype: ["CLOUDMATIQ", [Validators.required]],
      keytype: [null, [Validators.required]],
    });
    this.customvariableForm.valueChanges.subscribe((formData) => {
      this.formData = formData;
    });
  }

  createCustomVariable() {
    if (this.customvariableForm.valid) {
      this.loading = true;
      this.formData = this.customvariableForm.value;
      const variableValues = this.environmentsList.map((environment) => {
        const existingValue = this.environmentValues.find(
          (value) => value.environment === environment
        );
        if (existingValue) {
          return {
            environment: environment,
            id: existingValue.id,
            variableid: existingValue.variableid,
            keyvalue: existingValue.keyvalue,
          };
        } else {
          const keyValue = this.getEnvironmentValue(environment);
          return {
            environment: environment,
            keyvalue: keyValue,
          };
        }
      });
      const customvariableData: any = {
        tenantid: this.userstoragedata.tenantid,
        keyname: this.formData.keyname,
        variabletype: this.formData.variabletype,
        keytype: this.formData.keytype,
        description: this.formData.description,
        variablevalues: variableValues,
        attributes: this.formData.attributes,
        crn:this.formData.resourcetype,
        referencetype: AppConstant.CICD_REFERENCE[5]
      };
      if (this.formData.outgoingResources.length > 0) {
        customvariableData.outgoingResources = this.formData.outgoingResources
      }
      if (this.isUpdate) {
        customvariableData.lastupdatedby = this.userstoragedata.fullname;
        this.setupService
          .updateCustomVariable(this.id, customvariableData)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            this.handleResponse(response);
            setTimeout(() => {
              this.loading = false;
            }, 500);
          });
      } else {
        customvariableData.createdby = this.userstoragedata.fullname;
        this.setupService
          .createCustomVariable(customvariableData)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            this.handleResponse(response);
            setTimeout(() => {
              this.loading = false;
            }, 500);
          });
      }
    } else {
      Object.values(this.customvariableForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error("Please fill in the required fields");
    }
  }

  handleResponse(response: any) {
    if (response.status) {
      this.message.info(response.message);
      this.formData = {};
      this.router.navigate(["cicd/setup"], {
        queryParams: {
          page: 1,
          tabIndex: 4,
          mode: 'VARIABLE'
        },
      });
    } else {
      this.message.error(response.message);
    }
    this.loading = false;
  }

  getcustomvariableById(id: number) {
    this.loading = true;
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.GETBYID +
      id +
      `?tenantid=${this.userstoragedata.tenantid}`;
      const incomingResourceTypes = [];
      const outgoingResourceTypes = [];
    this.httpService.GET(query).subscribe((res) => {
      try {
        const response = JSON.parse(res._body);
        if (response.status) {
          if (response.data.variablesCMDB.length > 0 &&response.data.variablesCMDB) {
            response.data.variablesCMDB.forEach((item) => {
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
          const data = response.data;
          this.customvariabledObj = response.data
        this.customvariabledObj.refid = response.data.id;
        this.customvariabledObj.reftype = AppConstant.REFERENCETYPE[12];
          this.customvariableForm.patchValue({
            keyname: data.keyname,
            variabletype: data.variabletype,
            keytype: data.keytype,
            description: data.description,
          });
          if (incomingResourceTypes.length > 0) {
            const { resourceType, fieldName } = incomingResourceTypes[0];
            this.customvariableForm.patchValue({
              resourcetype: resourceType,
              attributes: fieldName
            });
          }
          const outgoingResourceFormArray = this.customvariableForm.get('outgoingResources') as FormArray;
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
          if (data.variablevalues && data.variablevalues.length > 0) {
            data.variablevalues.forEach((value) => {
              this.environmentValues.push({
                id: value.id,
                variableid: value.variableid,
                keyvalue: value.keyvalue,
                environment: value.environment,
                tenantid: value.tenantid,
            });
            });
          }
          this.loading = false;
        } else {
          this.loading = false;
          this.message.error(response.message);
        }
      } catch (error) {
        this.loading = false;
        this.environmentsList = [];
      }
    }, (error) => {
      this.loading = false;
      this.environmentsList = [];
    });
  }

  getEnvironmentValue(environment: string) {
    const value = this.environmentValues.find(
      (item) => item.environment === environment
    );
    return value ? value.keyvalue : "";
  }

  setEnvironmentValue(environment: string, value: string) {
    const index = this.environmentValues.findIndex(
      (item) => item.environment === environment
    );
    if (index !== -1) {
      this.environmentValues[index].keyvalue = value;
    } else {
      this.environmentValues.push({ environment, keyvalue: value });
    }
  }

  discard() {
    this.router.navigate(["cicd/setup"], {
      queryParams: {
        page: this.pageIndex,
        tabIndex: 4,
        mode: 'VARIABLE',
        limit: this.limit
      },
    });
  }

  getLookupList() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        tenantid: this.userstoragedata.tenantid,
        lookupkey: AppConstant.CICD.ENVIRONMENTS.LOOKUPKEY.CICD_ENVIRONMENTS,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((data) => {
        try {
          response = JSON.parse(data._body);
          if (response.status) {
            this.environmentsList = response.data.map((k: any) => k.keyvalue);
          } else {
            this.environmentsList = [];
          }
        }
        catch (error) {
          this.environmentsList = [];
        }
      }, (error) => {
        this.environmentsList = [];
      });
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
        this.customvariableForm.get("attributes").setValue(null);
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
