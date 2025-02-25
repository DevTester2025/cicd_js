import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SetupmasterService } from "../../setupmaster.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import * as _ from "lodash";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { IAssetHdr, IResourceType } from 'src/app/modules/interfaces/assetrecord.interface';
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";

@Component({
  selector: "app-add-edit-build",
  templateUrl: "./add-edit-build.component.html",
  styleUrls: ["./add-edit-build.component.css"],
})
export class AddEditBuildComponent implements OnInit {
  buildForm!: FormGroup;
  isUpdate = false;
  loading = false;
  isLoading = false;
  isComments = false;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  tabIndex = 0 as number;
  isInstanceNameInput: boolean = false;
  isDisabled = true;
  id: any;
  searchText: any;
  instanceName: any[] = [];
  instanceList: any = [];
  formData = {} as any;
  userstoragedata = {} as any;
  order = ["lastupdateddt", "desc"];
  passwordVisible = false;
  currentPageIndex: number = 0;
  queryParam: string = "";
  limit: string = "";
  resourceTypesList: IResourceType[] = [];
  filteredColumns = [];
  resource = {} as any;
  buildObj: any;

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
    this.routes.params.subscribe((params) => {
      if (params["id"]) {
        this.isUpdate = true;
        this.id = params["id"];
        this.getbuildById(this.id);
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
    return this.buildForm.get("outgoingResources") as FormArray;
  }
  ngOnInit() {
    this.initForm();
    this.getResourceType();
    this.routes.queryParams.subscribe((params) => {
      this.currentPageIndex = parseInt(params["page"]);
      this.queryParam = params['q'];
      this.limit = params['limit'];
    });
    if (!this.isUpdate) {
      this.addRow();
    }
    this.getServerList();
  }

  initForm() {
    this.buildForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(45),
        ],
      ],
      instancename: [null],
      instancerefid: [null],
      ipaddress: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(45),
        ],
      ],
      username: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(45),
        ],
      ],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],
      buildscript: [null, [Validators.required]],
      description: [null, [Validators.maxLength(500)]],
      resourcetype: [null],
      attributes: [null],
      outgoingResources: this.fb.array([]),
    });
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
      try {
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
      } catch (error) {
        this.instanceName = [];
        this.loading = false;
      }
    }, (error) => {
      this.instanceName = [];
      this.loading = false;
    });
  }
  onInstanceChange(instancerefid: any) {
    if (!instancerefid) {
      this.buildForm.patchValue({
        ipaddress: null,
      });
      this.ipaddressReadOnly();
      return;
    }
    const selectedInstance = this.instanceList.find(
      (instance) => instance.instancerefid === instancerefid
    );
    if (selectedInstance) {
      this.buildForm.patchValue({
        ipaddress: selectedInstance.privateipv4,
      });
      this.ipaddressReadOnly();
    }
  }
  ipaddressReadOnly() {
    const ipv4Control = this.buildForm.get("ipaddress");
    if (ipv4Control.value) {
      ipv4Control.disable();
    } else {
      ipv4Control.enable();
    }
  }

  onIpaddressChange() {
    const ipaddress = this.buildForm.get("ipaddress");
    const instancerefid = this.buildForm.get("instancerefid");
    if (ipaddress.status === "VALID" && instancerefid.value === null) {
      this.isInstanceNameInput = true;
      this.buildForm.get("instancename").setValidators([Validators.minLength(3), Validators.maxLength(45)]);
    } else {
      this.isInstanceNameInput = false;
      this.buildForm.get("instancename").clearValidators();
      this.buildForm.patchValue({ instancename: null });
    }
    this.buildForm.get("instancename").updateValueAndValidity();
  }

  createBuild() {
    if (this.buildForm.valid) {
      this.isLoading = true;
      this.formData = this.buildForm.value;
      this.formData.ipaddress = this.buildForm.get("ipaddress").value;
      const selectedInstance = this.instanceList.find(
        (instance) => instance.instancerefid === this.formData.instancerefid
      );
      let buildData: any = {
        tenantid: this.userstoragedata.tenantid,
        name: this.formData.name,
        instancerefid: this.formData.instancerefid,
        type: AppConstant.CICD.REFERENCETYPE.BUILD_SCRIPT,
        instancename: selectedInstance ? selectedInstance.instancename : this.formData.instancename,
        ipaddress: this.formData.ipaddress,
        username: this.formData.username,
        password: this.formData.password,
        buildscript: this.formData.buildscript,
        description: this.formData.description,    
        attributes: this.formData.attributes,
        crn:this.formData.resourcetype,
        referencetype: AppConstant.CICD_REFERENCE[2]
      };
      if (this.formData.outgoingResources.length > 0) {
        buildData.outgoingResources = this.formData.outgoingResources
      }
      if (this.isUpdate) {
        buildData.lastupdatedby = this.userstoragedata.fullname;
        this.setupService.updateBuild(this.id, buildData).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
      } else {
        buildData.createdby = this.userstoragedata.fullname;
        this.setupService.createBuild(buildData).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
      }
    } else {
      Object.values(this.buildForm.controls).forEach((control) => {
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
          tabIndex: 2,
          page: 1,
          limit: this.limit
        },
      });
    } else {
      this.message.error(response.message);
    }
    this.loading = false;
  }

  getbuildById(id: number) {
    this.loading = true;
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.SETUP.BUILD.GETBYID +
      id +
      `?tenantid=${this.userstoragedata.tenantid}`;
      const incomingResourceTypes = [];
      const outgoingResourceTypes = [];
    this.httpService.GET(query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.buildObj = response.data
        this.buildObj.refid = response.data.id;
        this.buildObj.reftype = AppConstant.REFERENCETYPE[15];
        if (response.data.buildsCMDB.length > 0 &&response.data.buildsCMDB) {
          response.data.buildsCMDB.forEach((item) => {
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
        this.buildForm.patchValue({
          name: response.data.name,
          instancename: response.data.instancename,
          instancerefid: response.data.instancerefid,
          ipaddress: response.data.ipaddress,
          username: response.data.username,
          password: response.data.password,
          buildscript: response.data.buildscript,
          description: response.data.description,
        });
        if (incomingResourceTypes.length > 0) {
          const { resourceType, fieldName } = incomingResourceTypes[0];
          this.buildForm.patchValue({
            resourcetype: resourceType,
            attributes: fieldName
          });
        }
        const outgoingResourceFormArray = this.buildForm.get('outgoingResources') as FormArray;
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
          this.buildForm.patchValue({
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
  discard() {
    this.router.navigate(["cicd/setup"], {
      queryParams: {
        page: this.currentPageIndex,
        tabIndex: 2,
        q: this.queryParam,
        limit: this.limit
      },
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
        this.buildForm.get("attributes").setValue(null);
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
