import { Component, OnInit, Input, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { SetupmasterService } from "../../../setup/setupmaster.service";
import { CicdService } from "../../../cicd.service";

@Component({
  selector: "app-prop-basic",
  templateUrl: "./properties.component.html",
  styles: [
    `
      .loader {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
    `,
  ],
})
export class TemplatePropertiesComponent implements OnInit {
  @Input() propertiesobj: any;
  @Input() viewMode: boolean;
  providerForm: FormGroup;
  type: any;
  CICDProviderErrObj = {
    name: AppConstant.VALIDATIONS.CICDPROVIDERS.NAME,
    branch: AppConstant.VALIDATIONS.CICDPROVIDERS.BRANCH,
    username: AppConstant.VALIDATIONS.CICDPROVIDERS.USERNAME,
    accesstoken: AppConstant.VALIDATIONS.CICDPROVIDERS.ACCESSTOKEN,
    url: AppConstant.VALIDATIONS.CICDPROVIDERS.URL,
    instancename: AppConstant.VALIDATIONS.CICDPROVIDERS.INSTANCENAME,
    ipaddress: AppConstant.VALIDATIONS.CICDPROVIDERS.IPADDRESS,
    password: AppConstant.VALIDATIONS.CICDPROVIDERS.PASSWORD,
    buildscript: AppConstant.VALIDATIONS.CICDPROVIDERS.BUILDSCRIPT,
    organization: AppConstant.VALIDATIONS.CICDPROVIDERS.ORGANIZATION,
  };
  branchList = [];
  approvalLevel: { label: string; value: string }[] = [];
  isSpinning = false;
  userstoragedata = {} as any;
  variableList: any[] = [];
  order = ["lastupdateddt", "desc"];
  repoloading = false;
  syncdisabled = false;
  repositories: { reponame: string; branches: number }[] = [];
  selectedTemplateData: any;
  taskTemplateList: string[] = [];
  constructor(
    private fb: FormBuilder,
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private setupService: SetupmasterService,
    private cicdService: CicdService
  ) {
    this.initForm();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.cicdService.treeTableTemplate$.subscribe((templateData) => {
      if (templateData) {
        this.selectedTemplateData = templateData;
        this.extractTaskTemplateList();
      }
    });
  }

  extractTaskTemplateList(): void {
    if (this.selectedTemplateData && this.selectedTemplateData.children) {
      this.taskTemplateList = this.selectedTemplateData.children.map(
        (child) => child.title
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.propertiesobj && changes.propertiesobj.currentValue) {
      this.isSpinning = true;
      this.initForm();
      this.patchFormValues(changes.propertiesobj.currentValue);
      this.getBranchlist();
      this.getAllCustomVariablesList();
      setTimeout(() => {
        this.isSpinning = false;
      }, 1000);
    }
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
      instancename: [null, [Validators.minLength(3), Validators.maxLength(45)]],
      ipaddress: [
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
      organization: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(45),
        ],
      ],
      branch: [
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
      accesstoken: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
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
      repositoryname: [null],
      scriptcontent: [null],
      imagename: [null],
      usernamevariable: [null],
      accesstokenvariable: [null],
      urlvariable: [null],
      port: [null],
      ipaddressvariable: [null],
      passwordvariable: [null],
      tasktemplate: [null],
    });
  }
  patchFormValues(properties: any): void {
    if (properties && properties.selectedNode) {
      const data = properties.selectedNode._data;
      this.providerForm.patchValue({
        name: data.name,
        instancename: data.instancename,
        ipaddress: data.ipaddress,
        password: data.password,
        buildscript: data.buildscript,
        branch: data.branch,
        username: data.username,
        accesstoken: data.accesstoken,
        url: data.url,
        organization: data.organization,
        scriptcontent: data.scriptcontent,
        urlvariable: data.urlvariable,
        repositoryname: data.repositoryname,
        imagename: data.imagename,
        usernamevariable: data.usernamevariable,
        accesstokenvariable: data.accesstokenvariable,
        port: data.port,
        ipaddressvariable: data.ipaddressvariable,
        passwordvariable: data.passwordvariable,
      });
      this.approvalLevel = [];
      Object.keys(data).forEach((key) => {
        if (key.startsWith("approverlevel")) {
          const label = key.replace(/_/g, " ");
          this.approvalLevel.push({ label: _.capitalize(label), value: key });
          this.providerForm.addControl(key, new FormControl(data[key]));
        }
      });
      if (this.viewMode) {
        this.branchList.push({
          label: data.branch,
          value: data.branch,
        });
      }
    }
  }

  getBranchlist() {
    if (!this.viewMode) {
      this.branchList = [];
      const filteredBranch: any[] = [];
      if (this.propertiesobj && this.propertiesobj.libraryList) {
        this.propertiesobj.libraryList["PROVIDERS"].forEach((v: any) => {
          v.providerRepositories.forEach((repo: any) => {
            if (repo.repository === this.propertiesobj.selectedNode._label) {
              repo.branches.forEach((branch: any) => {
                filteredBranch.push(branch.branch);
              });
            }
          });
        });
      }
      this.branchList = filteredBranch
        .filter((branch, index, self) => self.indexOf(branch) === index)
        .map((branch) => ({ label: branch, value: branch }));
    }
  }

  getAllCustomVariablesList() {
    this.variableList = [];
    const queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    queryParams.set("variabletype", AppConstant.CICD.STATUS.VARIABLE_TYPE[0]);

    const query = `${AppConstant.API_END_POINT}${
      AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.FINDALL
    }?${queryParams.toString()}&order=${this.order}`;

    this.httpService.GET(query).subscribe(
      (result) => {
        try {
          const response = JSON.parse(result._body);
          if (response.status) {
            response.data.rows.forEach((secret: any) => {
              const variable = {
                label: secret.keyname,
                value: secret.keyname,
              };
              if (
                !this.variableList.find((item) => item.value === secret.keyname)
              ) {
                this.variableList.push(variable);
              }
            });
          } else {
            this.variableList = [];
          }
        } catch (error) {
          this.variableList = [];
        }
      },
      (error) => {
        this.variableList = [];
      }
    );
  }
  syncRepository() {
    const id = this.propertiesobj.selectedNode._data.referenceid;
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
            this.message.success("The branches have been successfully synced");
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
}
