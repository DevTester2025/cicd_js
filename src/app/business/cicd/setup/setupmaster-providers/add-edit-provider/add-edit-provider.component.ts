import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AppConstant } from "src/app/app.constant";
import { SetupmasterService } from "../../setupmaster.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetRecordService } from 'src/app/business/base/assetrecords/assetrecords.service';
import { IAssetHdr, IResourceType } from 'src/app/modules/interfaces/assetrecord.interface';
import * as _ from "lodash";
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";

@Component({
  selector: "app-add-edit-provider",
  templateUrl: "./add-edit-provider.component.html",
  styleUrls: ["./add-edit-provider.component.css"],
})
export class AddEditProviderComponent implements OnInit {
  providerForm!: FormGroup;
  isUpdate = false;
  id: any;
  loading = false;
  isLoading = false;
  isComments = false;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  tabIndex = 0 as number;
  repoloading = false;
  syncdisabled = false;
  formData = {} as any;
  userstoragedata = {} as any;
  type: string;
  showSyncRepository = false;
  repositories: { reponame: string; branches: number }[] = [];
  resourceTypesList: IResourceType[] = [];
  filteredColumns = [];
  resource = {} as any;
  pipelineObj: any;
  providerObj: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private httpService: HttpHandlerService,
    private setupService: SetupmasterService,
    private localStorageService: LocalStorageService,
    private modalService: NzModalService,
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
        this.getProviderById(this.id);
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
    return this.providerForm.get("outgoingResources") as FormArray;
  }
  ngOnInit() {
    this.initForm();
    this.getResourceType();
    const syncrepositoryControl = this.providerForm.get("syncrepository");
    if (syncrepositoryControl) {
      syncrepositoryControl.valueChanges.subscribe((value: boolean) => {
        if (value) {
          this.syncRepository();
        }
      });
    }
    if (this.isUpdate) {
      this.initSyncRepo();
    } else {
      this.showSyncRepository = false;
      this.addRow();
    }
  }

  initSyncRepo() {
    this.showSyncRepository = true;
    const initialFormValue = JSON.stringify(this.providerForm.value);
    Object.keys(this.providerForm.controls)
      .filter((controlName) => controlName !== "syncrepository")
      .forEach((controlName) => {
        const control = this.providerForm.get(controlName);
        if (control) {
          control.valueChanges.subscribe(() => {
            const currentFormValue = JSON.stringify(this.providerForm.value);
            if (initialFormValue !== currentFormValue) {
              const createButton = document.getElementById("createProvider");
              if (createButton) {
                createButton.removeAttribute("disabled");
              }
            }
          });
        }
      });
  }

  initForm() {
    this.providerForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
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
      accesstoken: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      organizationname: [
        "",
        [Validators.minLength(3), Validators.maxLength(50)],
      ],
      description: ["", [Validators.maxLength(500)]],
      resourcetype: [null],
      attributes: [null],
      outgoingResources: this.fb.array([]),
      url: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
          Validators.pattern(
            "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$"
          ),
        ],
      ],
      syncrepository: [false],
    });
  }

  createProvider() {
    if (this.providerForm.valid) {
      this.isLoading = true;
      this.formData = this.providerForm.value;
      const providerData: any = {
        tenantid: this.userstoragedata.tenantid,
        name: this.formData.name,
        username: this.formData.username,
        accesstoken: this.formData.accesstoken,
        organizationname: this.formData.organizationname,
        description: this.formData.description,
        url: this.formData.url,
        type: this.type,
        syncrepository: this.providerForm.get("syncrepository").value,
        attributes: this.formData.attributes,
        crn:this.formData.resourcetype,
        referencetype:AppConstant.CICD_REFERENCE[0]
      };
      if (this.isUpdate) {
        providerData.lastupdatedby = this.userstoragedata.fullname;
      } else {
        providerData.createdby = this.userstoragedata.fullname;
      }
      if (this.formData.outgoingResources.length > 0) {
        providerData.outgoingResources = this.formData.outgoingResources
      }
      if (this.isUpdate) {
        this.setupService
          .updateProvider(this.id, providerData)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            this.handleResponse(response);
            setTimeout(() => {
              this.isLoading = false;
            }, 500);
          });
      } else {
        this.setupService.createProvider(providerData).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.code === 200) {
            this.id = response.data.id;
          }
          this.handleResponse(response);
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
      }
    } else {
      Object.values(this.providerForm.controls).forEach((control) => {
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
      if (response.code === 200) {
        setTimeout(() => {
          this.showSyncRepoSwitch();
        }, 500);
      }
      this.message.info(response.message);
      this.formData = {};
    } else {
      this.message.error(response.message);
    }
    this.loading = false;
  }
  getProviderById(id: number) {
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.SETUP.PROVIDER.GETBYID +
      id +
      `?tenantid=${this.userstoragedata.tenantid}`;
      const incomingResourceTypes = [];
      const outgoingResourceTypes = [];
    this.httpService.GET(query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.providerObj = response.data
        this.providerObj.refid = response.data.id;
        this.providerObj.reftype = AppConstant.REFERENCETYPE[13];
      if(response.data.providerCMDB.length > 0 && response.data.providerCMDB){
        response.data.providerCMDB.forEach(item => {
          if (item.resource_type === AppConstant.CICD_RESOUCE_TYPE[0]) {
            const resourceType = item.crn;
            const fieldName = JSON.parse(item.fieldname);
              incomingResourceTypes.push({ resourceType, fieldName });
            }else if (item.resource_type === AppConstant.CICD_RESOUCE_TYPE[1]) {
            const resourceType = item.crn;
            const fieldName = JSON.parse(item.fieldname);
            outgoingResourceTypes.push({ resourceType, fieldName });
          }
        });
      }
        this.providerForm.patchValue({
          name: response.data.name,
          username: response.data.username,
          accesstoken: response.data.accesstoken,
          organizationname: response.data.organizationname,
          description: response.data.description,
          url: response.data.url,
          syncrepository: response.data.syncrepository,
        });
        if (incomingResourceTypes.length > 0) {
          const { resourceType, fieldName } = incomingResourceTypes[0];
          this.providerForm.patchValue({
            resourcetype: resourceType,
            attributes: fieldName
          });
        }
        const outgoingResourceFormArray = this.providerForm.get('outgoingResources') as FormArray;
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
  syncRepository() {
    const id = this.id;
    const data = {
      tenantId: this.userstoragedata.tenantid,
      createdBy: this.userstoragedata.fullname,
    };
    this.repoloading = true;
    this.syncdisabled = true;
    this.setupService.syncRepository(id, data).subscribe(
      (res: any) => {
        setTimeout(() => {
          const response = JSON.parse(res._body);
          if (response.status && response.code === 200) {
            this.repositories = response.data.map((repo) => ({
              reponame: repo.reponame,
              branches: repo.branch.length,
            }));
          } else {
            this.repositories = [];
            this.message.error(response.message);
          }
          this.repoloading = false;
          this.syncdisabled = false;
        }, 500);
      },
      (error) => {
        this.repoloading = false;
        this.syncdisabled = false;
        this.message.error("Failed to fetch repositories");
      }
    );
  }
  refresh() {
    this.syncRepository();
  }
  discard() {
    this.router.navigate(["cicd/setup"], {
      queryParams: {
        tabIndex: 0,
      },
    });
  }
  showSyncRepoSwitch() {
    this.modalService.confirm({
      nzTitle: "Confirmation",
      nzContent: "Do you want to sync the repository?",
      nzOnOk: () => {
        this.showSyncRepository = true;
        const syncrepositoryControl = this.providerForm.get("syncrepository");
        if (syncrepositoryControl) {
          syncrepositoryControl.enable();
        }
        this.router.navigate(["cicd/setup"]);
      },
      nzOnCancel: () => {
        this.router.navigate(["cicd/setup"], {
          queryParams: {
            tabIndex: 0,
          },
        });
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
        this.providerForm.get("attributes").setValue(null);
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
