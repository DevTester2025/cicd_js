import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { ReleasesService } from "../releases.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { PipelineTemplateService } from "../../pipeline-template/pipeline-template.service";

@Component({
  selector: "app-add-edit-release",
  templateUrl: "./add-edit-release.component.html",
  styleUrls: ["./add-edit-release.component.css"],
})
export class AddEditReleaseComponent implements OnInit {
  releaseForm!: FormGroup;
  templateForm!: FormGroup;
  userstoragedata = {} as any;
  templateList = [];
  id: any;
  loading = false;
  formData = {} as any;
  isUpdate = false;
  scheduleOptions = AppConstant.CICD.schedule;
  isTemplateSelected: boolean = false;
  pipelineTemplates: any[] = [];
  environmentsList = [];
  providerBranchList = [];
  templateDetails: any = {};
  isPanel: boolean = false;
  activePanelIndex: number = null;
  variableList: any[] = [];
  validateVariableList: any[] = [];
  order = ["lastupdateddt", "desc"];
  customVariable: any = {};
  variablesValues = {};
  releaseData: any = {};
  branches: any[] = [];
  providerBranch = "";
  isUpdateTemplate: boolean = false;
  propertyNames: string[] = [];
  customVariableIds: any = {};
  visible: boolean = false;
  currentPageIndex: number = 0;
  passwordVisible = false;

  orchid: string = "";
  module = AppConstant.CICD.MODULE.cicd;

  queryParam: string = "";
  limit: string = "";
  tabIndex = 0 as number;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private releasesService: ReleasesService,
    private routes: ActivatedRoute,
    private commonService: CommonService,
    private pipelineTemplateService: PipelineTemplateService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );

    this.routes.params.subscribe((params) => {
      if (params["id"]) {
        this.isUpdate = true;
        this.id = params["id"];
        this.getTransactionById(this.id);
        this.isUpdateTemplate = true;
      }
    });
    this.getPropertyNames();
  }

  ngOnInit() {
    this.routes.queryParams.subscribe((params) => {
      this.currentPageIndex = parseInt(params["page"])
      this.queryParam = params['q'];
      this.limit = params['limit'];
    });
    this.initForm();
    this.onScheduleValidility();
    this.getAllTemplateList();
    this.getLookupList();
    this.getAllCustomVariablesList("");
    this.getAllCustomVariablesList(AppConstant.CICD.STATUS.VARIABLE_TYPE[1]);
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
  initForm() {
    this.releaseForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: ["", [Validators.maxLength(500)]],
      template: [null, [Validators.required]],
      schedule: [null, [Validators.required]],
      scheduleOn: [null],
      environment: [null],
    });
  }

  onScheduleValidility() {
    this.releaseForm.get("schedule").valueChanges.subscribe((scheduleValue) => {
      const scheduleOnControl = this.releaseForm.get("scheduleOn");
      if (scheduleValue === "SCHEDULE") {
        scheduleOnControl.setValidators([Validators.required]);
      } else {
        scheduleOnControl.clearValidators();
        scheduleOnControl.reset();
      }
      scheduleOnControl.updateValueAndValidity();
    });
  }

  getPropertyNames() {
    this.propertyNames = [];
    if (this.isUpdateTemplate) {
      this.propertyNames.push(AppConstant.CICD.PROPERTYNAMES[0]);
      this.propertyNames.push(AppConstant.CICD.PROPERTYNAMES[1]);
    } else {
      this.propertyNames.push(AppConstant.CICD.PROPERTYNAMES[2]);
      this.propertyNames.push(AppConstant.CICD.PROPERTYNAMES[3]);
    }
  }

  getAllTemplateList() {
    this.loading = true;
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE.FINDALL +
      `?tenantid=${this.userstoragedata.tenantid}`;
    this.httpService.GET(query).subscribe((result) => {
      try {
        const response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.templateList = response.data;
          if (this.templateList.length > 0) {
            _.map(this.templateList, (template: any) => {
              const pipelineTemplate = {
                label: template.pipelinename,
                value: template.id,
              };
              this.pipelineTemplates.push(pipelineTemplate);
            });
          }
        } else {
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;

      }
    }, (error) => {
      this.loading = false;
    });
  }

  createRelease() {

    if (this.templateForm && !this.templateForm.valid) {
      const invalidControls = this.findInvalidControls(this.templateForm);
      this.message.error(
        'Please enter the ' +
        (invalidControls[0].controlName === 'imagename' ? 'image name' : invalidControls[0].controlName) +
        ' in ' +
        invalidControls[0].jobName +
        '.',
        {
          nzDuration: 3000
        }
      );
    } else if (this.releaseForm.valid) {
      this.loading = true;
      let proName: string = this.isUpdate
        ? AppConstant.CICD.PROPERTYNAMES[0]
        : AppConstant.CICD.PROPERTYNAMES[4];
      this.formData = this.releaseForm.value;
      this.releaseData = this.updateFormattedData(proName);
      _.forEach(this.templateDetails[this.propertyNames[0]], (itm) => {
        const pipelineTemplateDetail = this.updateReleaseTemplateDetail(itm);
        this.releaseData[proName].push(pipelineTemplateDetail);
      });
      if (
        this.formData.scheduleOn !== "" &&
        this.formData.scheduleOn !== null
      ) {
        this.releaseData.scheduleon = this.formData.scheduleOn;
      }
      if (this.isUpdate) {
        this.releaseData.lastupdatedby = this.userstoragedata.fullname;
      } else {
        this.releaseData.createdby = this.userstoragedata.fullname;
      }
      this.createAndUpdateRelease();
      this.loading = false;
      console.log("release", JSON.stringify(this.releaseData));
    } else {
      this.validateForm();
    }
  }
  createAndUpdateRelease() {
    if (this.isUpdate) {
      this.releasesService
        .updateRelease(this.id, this.releaseData)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
        });
    } else {
      this.releasesService
        .createRelease(this.releaseData)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          this.handleResponse(response);
        });
    }
  }
  findInvalidControls(form: FormGroup): any[] {
    const invalid = [];
    const controls: any = form.controls;

    _.forEach(controls.pipelinetemplatedetails.controls, (itm: any) => {
      if (itm.status == 'INVALID') {
        _.forOwn(itm.controls, (value, key) => {
          if (['port', 'imagename'].includes(key) && value.status == 'INVALID') {
            if (itm.controls.hasOwnProperty('name')) {
              invalid.push({ controlName: key, jobName: itm.controls.name.value })
            } else {
              invalid.push({ controlName: key, jobName: itm.controls.instancename.value })
            }
          }
        })
      }
    });

    return invalid;
  }

  validateForm() {
    Object.values(this.releaseForm.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
    this.message.error("Please fill in the required fields");
  }

  updateFormattedData(proName: string) {
    const data = {
      tenantid: this.userstoragedata.tenantid,
      name: this.formData.name,
      templateid: this.formData.template,
      schedule: this.formData.schedule,
      environment: this.formData.environment || null,
      providerrepo: this.templateDetails.providerrepo,
      providerbranch: "",
      filename: this.formData.name,
      runnerid: this.templateDetails.runnerid,
      description: this.formData.description || "",
      [proName]: [],
      status: "Active",
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
    };
    if (this.isUpdate) {
      data.id = Number(this.id);
      data.lastupdatedby = this.userstoragedata.fullname;
      data.lastupdateddt = new Date();
    }
    return data;
  }

  updateReleaseTemplateDetail(itm: any) {
    const formArray: any = this.templateForm.get(
      AppConstant.CICD.PROPERTYNAMES[2]
    ) as FormArray;
    const setupDetails = formArray.value.find((d) => d.id === itm.id);
    if (setupDetails.hasOwnProperty("branch")) {
      this.releaseData.providerbranch = setupDetails.branch;
    }
    let script: any;
    if (setupDetails.hasOwnProperty("scriptcontent")) {
      script = setupDetails.scriptcontent;
    }
    const { branch, id, scriptcontent, ...data } = setupDetails;
    const formattedData: any = {
      tenantid: this.userstoragedata.tenantid,
      position: itm.position,
      referenceid: itm.referenceid,
      referencetype: itm.referencetype,
      providerjobname: itm.providerjobname,
      description: itm.description || "",
      status: "Active",
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      releasesetupdetailconfig: {
        tenantid: this.userstoragedata.tenantid,
        scriptcontent: script,
        setupdetails: data,
        variabledetails: itm[this.propertyNames[1]].variabledetails || null,
        description: itm[this.propertyNames[1]].description || null,
        status: "Active",
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
      },
    };
    if (this.isUpdate) {
      formattedData.id = itm.id;
      formattedData.releaseconfighdrid = itm.releaseconfighdrid;
      formattedData.lastupdatedby = this.userstoragedata.fullname;
      formattedData.lastupdateddt = new Date();
      formattedData.releasesetupdetailconfig.id = itm[this.propertyNames[1]].id;
      formattedData.releasesetupdetailconfig.releaseconfigdetailid =
        itm[this.propertyNames[1]].releaseconfigdetailid;
      formattedData.releasesetupdetailconfig.lastupdatedby =
        this.userstoragedata.fullname;
      formattedData.releasesetupdetailconfig.lastupdateddt = new Date();
    }
    if (setupDetails.referencetype == AppConstant.CICD.TYPE.environment) {
      _.forOwn(this.customVariableIds, (v, k) => {
        formattedData.releasesetupdetailconfig.setupdetails[k] = v;
      });
      const { referencetype, ...data } = formattedData.releasesetupdetailconfig.setupdetails;
      formattedData.releasesetupdetailconfig.setupdetails = data;
    }
    return formattedData;
  }

  handleResponse(response: any) {
    if (response.status) {
      this.message.info(response.message);
      this.formData = {};
      this.router.navigate(["cicd/releases"], {
        queryParams: {
          tabIndex: 1,
          page: this.currentPageIndex,
          q: this.queryParam,
          limit: this.limit
        },
      });
    } else {
      this.message.error(response.message);
    }
    this.loading = false;
  }

  getTransactionById(id: number) {
    this.loading = true;
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.RELEASES.GETBYID +
      id +
      `?tenantid=${this.userstoragedata.tenantid}`;
    this.httpService.GET(query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.templateDetails = response.data;
        this.templateDetails.refid = parseInt(this.id);
        this.templateDetails.reftype = AppConstant.REFERENCETYPE[6];
        this.releaseForm.patchValue({
          name: response.data.name,
          description: response.data.description,
          template: response.data.templateid,
          schedule: response.data.schedule,
          scheduleOn: response.data.scheduleon,
          environment: response.data.environment,
        });
      } else {
        this.message.error(response.message);
      }
      this.loading = false;
    });
  }

  cancel() {
    this.router.navigate(["cicd/releases"], {
      queryParams: {
        page: this.currentPageIndex,
        tabIndex: 1,
        q: this.queryParam,
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
        response = JSON.parse(data._body);
        if (response.status) {
          let lookupData = response.data;
          _.map(lookupData, (lookup: any) => {
            const data = {
              label: lookup.keyname,
              value: lookup.keyvalue,
            };
            this.environmentsList.push(data);
          });
        } else {
          this.environmentsList = [];
        }
      });
  }

  getSetupMastersList(detail: any) {
    const providerdetail = detail[this.propertyNames[0]].find((d) => d.referencetype === AppConstant.CICD.TYPE.provider);
    this.providerBranchList = [];
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      referencetype: AppConstant.CICD.TYPE.provider,
      referenceid: providerdetail.referenceid,
      providerjobname: providerdetail.providerjobname,
      repository: this.templateDetails.providerrepo,
    };
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.CICD.RELEASES.SETUPMASTER,
        condition
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.providerBranchList =
            response.data.PROVIDERS[0].providerRepositories;
          this.filterRepoBranch(
            this.templateDetails.providerrepo,
            this.templateDetails.providerbranch
          );
        } else {
          this.providerBranchList = [];
        }
      });
  }

  onTemplateSelect(id: any) {
    if (!this.isUpdateTemplate) {
      this.getPropertyNames();
      this.variablesValues = {};
      this.loading = true;
      this.pipelineTemplateService.byId(id).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.templateDetails = response.data;
          this.getAllCustomVariablesList(
            AppConstant.CICD.STATUS.VARIABLE_TYPE[1]
          );
          this.getSetupMastersList(this.templateDetails);
          this.filterRepoBranch(
            this.templateDetails.providerrepo,
            this.templateDetails.providerbranch
          );
          this.releaseForm.get(AppConstant.CICD.environments[1]).clearValidators();
          this.createTemplateForm();
          this.isTemplateSelected = true;
        } else {
          this.message.error(response.message, { nzDuration: 3000 });
        }
      });
      this.loading = false;
    } else {
      this.getAllCustomVariablesList(AppConstant.CICD.STATUS.VARIABLE_TYPE[1]);
      this.getSetupMastersList(this.templateDetails);
      this.filterRepoBranch(
        this.templateDetails.providerrepo,
        this.templateDetails.providerbranch
      );
      this.createTemplateForm();
      this.isTemplateSelected = true;
      this.isUpdateTemplate = false;
    }
  }

  filterRepoBranch(repositoryName: string, branch: string) {
    const repository = this.providerBranchList.find(
      (repo) => repo.repository === repositoryName
    );
    this.providerBranch = branch;
    if (repository) {
      _.map(repository.branches, (b: any) => {
        const data = {
          label: b.branch,
          value: b.branch,
        };
        this.branches.push(data);
      });
    } else {
      this.branches = [];
    }
  }

  createTemplateForm() {
    this.templateForm = this.fb.group({
      pipelinetemplatedetails: this.fb.array([]),
    });
    const templateDetailsArray = this.templateForm.get(
      AppConstant.CICD.PROPERTYNAMES[2]
    ) as FormArray;
    if (!this.isUpdate) {
      this.templateDetails.pipelinetemplatedetails.sort(
        (a, b) => a.position - b.position
      );
    }
    this.templateDetails[this.propertyNames[0]].forEach((detail) => {
      if (this.isUpdateTemplate) {
        detail[this.propertyNames[1]].setupdetails = JSON.parse(
          detail[this.propertyNames[1]].setupdetails
        );
      }

      if (detail.referencetype == AppConstant.CICD.TYPE.provider) {
        detail[this.propertyNames[1]].setupdetails.branch =
          this.templateDetails.providerbranch;
      }
      if (detail.referencetype == AppConstant.CICD.TYPE.environment) {
        detail[this.propertyNames[1]].setupdetails.referencetype =
          detail.referencetype;
      }
      if (detail.referencetype == AppConstant.CICD.TYPE.orchestration) {
        detail[this.propertyNames[1]].setupdetails.referencetype =
          detail.referencetype;
        this.orchid = detail.referenceid.toString();
      }
      this.validateIsCustomVariable(detail);
      detail[this.propertyNames[1]].setupdetails.id = detail.id;
      if (
        (detail.providerjobname ==
          AppConstant.CICD.CONTAINER_REGISTRY[0]) ||
        (detail.providerjobname == AppConstant.CICD.TESTING_TOOLS[0])
      ) {
        detail[this.propertyNames[1]].setupdetails.scriptcontent =
          detail[this.propertyNames[1]].scriptcontent;
      }
      templateDetailsArray.push(
        this.createSetupDetailsGroup(detail[this.propertyNames[1]].setupdetails)
      );
    });
    if (templateDetailsArray.length > 0) {
      this.isPanel = true;
    }
  }

  createSetupDetailsGroup(data: any): FormGroup {
    const setupDetailsGroup = this.fb.group(data);
    let controlName: string = '';
    if (setupDetailsGroup.controls.imagename) {
      controlName = 'imagename';
    } else if (setupDetailsGroup.controls.port) {
      controlName = 'port';
    }

    if (controlName !== '') {
      setupDetailsGroup.controls[controlName].setValidators([Validators.required])
    }

    return setupDetailsGroup;
  }

  validateIsCustomVariable(data: any) {
    _.forOwn(data[this.propertyNames[1]].setupdetails, (value, key) => {
      const variableData = this.variableList.find(
        (obj) => obj.keyname == value
      );
      if (variableData) {
        if (
          variableData.variabletype ==
          AppConstant.CICD.STATUS.VARIABLE_TYPE[1] ||
          (variableData.variabletype ==
            AppConstant.CICD.STATUS.VARIABLE_TYPE[0] &&
            variableData.environment !== null)
        ) {
          this.releaseForm
            .get(AppConstant.CICD.environments[1])
            .setValidators([Validators.required]);
        }
      }
    });
    this.releaseForm.get(AppConstant.CICD.environments[1]).updateValueAndValidity();
    if (this.releaseForm.get(AppConstant.CICD.environments[1]).value !== null) {
      this.releaseForm.get(AppConstant.CICD.environments[1]).setValue(null);
    }
  }

  getSetupDetailKeys(detailGroup: FormGroup): string[] {
    let controlArray = Object.keys(detailGroup.value);
    _.forOwn(detailGroup.value, (value, key) => {
      if (AppConstant.CICD.isVariables.includes(key)) {
        if (value) {
          controlArray = controlArray.filter(
            (item) => item !== AppConstant.CICD.variableFields[key][1]
          );
        } else {
          controlArray = controlArray.filter(
            (item) => item !== AppConstant.CICD.variableFields[key][0]
          );
        }
        controlArray = controlArray.filter((item) => item != key);
      }
      if (this.vmCustomVariableId.includes(key) && this.isUpdate) {
        controlArray = controlArray.filter((item) => item != key);
      }
    });
    return controlArray;
  }

  getHeader(data: any): string {
    let header: string = "";
    if (Object.keys(data.value).length > 0) {
      const detail = _.find(
        this.templateDetails[this.propertyNames[0]],
        (detail: any) => {
          return data.value.id === detail.id;
        }
      );
      if (detail) {
        if (detail[this.propertyNames[1]].setupdetails.hasOwnProperty("name")) {
          header = detail[this.propertyNames[1]].setupdetails.name;
        } else if (detail[this.propertyNames[1]].setupdetails.hasOwnProperty("orchname")) {
          header = detail[this.propertyNames[1]].setupdetails.orchname;
        } else {
          header =
            detail[this.propertyNames[1]].setupdetails.instancename ||
            detail[this.propertyNames[1]].setupdetails.ipaddress;
        }
      }
    }
    return header.charAt(0).toUpperCase() + header.slice(1);
  }

  isOrch(data: any): boolean {
    if (data.value.hasOwnProperty('referencetype') && data.value.referencetype == AppConstant.CICD.TYPE.orchestration) {
      return true;
    }
  }

  isOpen(index: number): boolean {
    return this.activePanelIndex === index;
  }

  togglePanel(index: number): void {
    if (this.activePanelIndex === index) {
      this.activePanelIndex = null;
    } else {
      this.activePanelIndex = index;
    }
  }

  capitalizeFirstLetter(srt: string): string {
    return srt.charAt(0).toUpperCase() + srt.slice(1);
  }

  controlNameIsVariable(label: string): string {
    let labelName: string = "";
    if (AppConstant.CICD.variables.includes(label)) {
      labelName = AppConstant.CICD.variablesLabels[label];
    } else if (label == "scriptcontent") {
      labelName = "Script Content";
    } else if (label == "imagename") {
      labelName = "Image Name";
    } else if (label == "jmxfilepath") {
      labelName = "Jmx File Path";
    } else if (label == "jtlfilepath") {
      labelName = "Jtl File Path";
    } else if (label == "jmeterpath") {
      labelName = "Jmeter Path";
    } else {
      labelName = label;
    }
    return this.capitalizeFirstLetter(labelName);
  }

  onSelectEnvironment(env: string) {
    if (this.isTemplateSelected) {
      const formData: FormArray = this.templateForm.get(AppConstant.CICD.PROPERTYNAMES[2]) as FormArray;
      const envIndex = formData.value.findIndex(
        (idx) => idx.referencetype === AppConstant.CICD.TYPE.environment
      );
      if (env !== "" && env !== null) {
        const setupDetailsControl = formData.value[envIndex];
        this.onCustomValueChange(setupDetailsControl, env, formData, envIndex);
      } else {
        _.forOwn(this.variablesValues, (value, key) => {
          formData.at(envIndex).patchValue({
            [this.envChange[key][2]]: this.variablesValues[key],
            [this.envChange[key][1]]: true,
            [this.envChange[key][0]]: null,
          });
        });
      }
    } else if (this.releaseForm.get(AppConstant.CICD.environments[1]).value !== null) {
      this.releaseForm.get(AppConstant.CICD.environments[1]).setValue(null);
      this.message.error("Please select pipeline template", {
        nzDuration: 3000,
      });
    }
  }

  onCustomValueChange(
    setupDetailsControl: any,
    env: string,
    formData: any,
    envIndex: number
  ) {
    _.forOwn(setupDetailsControl, (value, key) => {
      if (this.vmVariables.includes(key)) {
        if (
          this.variablesValues[key] === "" ||
          !this.variablesValues.hasOwnProperty(key)
        ) {
          this.variablesValues[key] = value;
        }
        if (this.variablesValues[key] !== "") {
          let variableData: any = {};
          if (!this.isUpdate) {
            variableData = this.variableList.find(
              (obj) => obj.keyname === this.variablesValues[key]
            );
          } else {
            variableData = this.variableList.find(
              (obj) => obj.id === setupDetailsControl[this.envChange[key][3]]
            );
          }
          if (variableData) {
            this.customVariable = variableData.customVariablesValues.find(
              (obj) => obj.environment === env
            );
            this.patchEnvChangeValues(formData, envIndex, key);
          }
        }
      }
    });
  }

  patchEnvChangeValues(formData: any, envIndex: number, key: string) {
    if (this.customVariable) {
      formData.at(envIndex).patchValue({
        [this.envChange[key][0]]: this.customVariable.keyvalue
          ? this.customVariable.keyvalue
          : this.variablesValues[key],
        [this.envChange[key][1]]: false,
        [this.envChange[key][2]]: null,
      });
      this.customVariableIds[this.envChange[key][3]] =
        this.customVariable.variableid;
    }
  }

  vmVariables = ["usernamevariable", "passwordvariable", "ipaddressvariable"];
  vmCustomVariableId = [
    "customusernameid",
    "custompasswordid",
    "customipaddressid",
  ];

  envChange = {
    usernamevariable: [
      "username",
      "usernameisvariable",
      "usernamevariable",
      "customusernameid",
    ],
    passwordvariable: [
      "password",
      "passwordisvariable",
      "passwordvariable",
      "custompasswordid",
    ],
    ipaddressvariable: [
      "ipaddress",
      "ipaddressisvariable",
      "ipaddressvariable",
      "customipaddressid",
    ],
  };

  getAllCustomVariablesList(variabletype: string) {
    this.loading = true;
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    if (variabletype != "") {
      queryParams.set("variabletype", AppConstant.CICD.STATUS.VARIABLE_TYPE[1]);
    }
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        if (variabletype != "") {
          this.variableList = response.data.rows;
        } else {
          this.validateVariableList = response.data.rows;
        }
      } else {
        this.loading = false;
        if (variabletype != "") {
          this.variableList = [];
        } else {
          this.validateVariableList = [];
        }
      }
    });
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  isOrchVisible(v: boolean) {
    this.visible = v;
  }

  notifyOrchClose(e: boolean) {
    if (e) {
      this.visible = false;
    }
  }

  getTooltip(data: any): string {
    const detail = _.find(
      this.templateDetails[this.propertyNames[0]],
      (detail: any) => {
        return data.value.name === detail[this.propertyNames[1]].setupdetails.name;
      }
    );
    if (detail) {
      return `Please enter ${detail.providerjobname} script properties, or the existing properties will execute.`
    }
  }

}