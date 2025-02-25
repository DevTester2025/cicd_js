import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { IAssetHdr } from "../../interfaces/assetrecord.interface";
import { HttpHandlerService } from "../../services/http-handler.service";
import { LocalStorageService } from "../../services/shared/local-storage.service";
import { ScriptService } from "../../../business/tenants/scripts/script.service";
import { CommonService } from "../../services/shared/common.service"
import { CustomValidator } from "src/app/modules/shared/utils/custom-validators";

@Component({
  selector: "app-cloudmatiq-synthetics",
  styles: [
    `
    #grouptable th {
      border: 1px solid #dddddd30;
      padding: 8px;
      border-style: groove;
    }
    #grouptable td {
      border: 1px solid #dddddd30;
      padding: 6px;
      border-style: groove;
    }

    #grouptable th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #1c2e3cb3;
      color: white;
    }`
  ],
  templateUrl: "./synthetics.component.html",
})
export class SyntheticsComponent implements OnInit, OnChanges {
  @Output()
  done = new EventEmitter<boolean>();

  userstoragedata: any = {};
  tagForm: FormGroup;
  resourceForm: FormGroup;
  requestForm: FormGroup;
  tagList = [];
  triggerTagsList = [];
  instanceList = [];
  selectedTag = {} as any;
  showNewReuestDrawer = false;
  instancename: "";

  //#OP_T428 
  validationErrMsg = AppConstant.VALIDATIONS.SYNTHETICS
  // AWS regions
  regionList = [];
  // script list
  scriptList = [];

  currentStep = 0;

  apiConfigListTableHeader = [
    { field: "step", header: "Step", datatype: "string" },
    { field: "endpoint", header: "Endpoint", datatype: "string" },
    { field: "method", header: "Method", datatype: "string" },
  ];
  heartbeatConfigListTableHeader = [
    { field: "endpoint", header: "Endpoint", datatype: "string" }
  ];
  apiList = [];
  //#OP_T428 
  endpointList = [
    {
      endpoint: "",
      instancerefid: null
    }
  ];
  tableConfig = {
    edit: false,
    delete: true,
    globalsearch: false,
    manualsearch: false,
    manualsorting: false,
    sortbyList: [],
    view: false,
    chart: false,
    loading: false,
    pagination: false,
    rightsize: false,
    frontpagination: true,
    manualpagination: false,
    selection: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "450px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;

  // Configuring resource from CMDB
  baseCRN = "crn:ops:virtual_machine";
  baseAttributeKey = this.baseCRN + "/fk:synthetics_url";
  baseAttributeName = "Synthetics URL";
  baseURLs = [];
  resourceFields = [] as IAssetHdr[];
  resources = [];
  primaryResourceAttribute = null as null | IAssetHdr;
  loading = false;
  @ViewChild("scriptfile") scriptfile: ElementRef;
  scriptFile;
  scriptFileImage;
  constructor(
    private tagService: TagService,
    private httpService: HttpHandlerService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private scriptService: ScriptService,
    private commonService: CommonService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.resetForm();
    this.resetTagForm();
    this.resetRequestForm();
  }

  ngOnInit() {
    this.getAllTags();
    this.getResourceDetail();
    this.getAllregions();
    this.getInstances();
  }

  ngOnChanges(changes: SimpleChanges): void { }

  resetForm() {
    this.resourceForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.pattern("^[0-9a-z_-]+$"),
          CustomValidator.cannotContainSpace,
          Validators.minLength(1),
          Validators.maxLength(21),
        ],
      ], //#OP_T428 
      memoryinmb: [960, [Validators.required, Validators.min(960), Validators.max(3008)]],  //#OP_T428 
      timeout: [60, [Validators.required, Validators.min(3), Validators.max(840)]],  //#OP_T428 
      type: ["heartbeat", Validators.required],
      region: [[], Validators.required], //#OP_T428 
      scripttype: ['TEMPLATE_SCRIPT'],
      script: [null], //#OP_T428 
      endpoint: [null],
      screenshot: [false],
      recurring: [false, Validators.requiredTrue], //#OP_T428 
      recurring_type: [null], //#OP_T428 
      rate_in_min: [null,[Validators.min(1), Validators.max(60)]],
      cron: [null,[Validators.pattern(/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$|(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)/)]],
      tag: [null],
      tagvalue: [null],
      instances: [null],
      instancerefid: [null],
    });
  }
  resetTagForm() {
    this.tagForm = this.fb.group({
      tag: [null],
      tagvalue: [null],
      resources: [null, Validators.required],
    });
  }
  resetRequestForm() {
    this.requestForm = this.fb.group({
      title: [null],
      method: [null],
      endpoint: [null],
      headers: ["{}"],
      body: ["{}"],
    });
  }
  onFile(event) {
    const reader = new FileReader();
    if (event.target.files[0] && event.target.files[0].name.indexOf(" ") >= 0) {
      this.scriptfile.nativeElement.value = null;
      this.message.error("Script file should not contain space");
      return false;
    }
    this.scriptFile = event.target.files[0];
    reader.onload = (e) => {
      this.scriptFileImage = e.target["result"];
    };
    reader.readAsDataURL(event.target.files[0]);
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
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
        this.triggerTagsList = d;
      } else {
        this.triggerTagsList = [];
        this.tagList = [];
      }
    });
  }

  tagChanged(e) {
    if (e != null) {
      let tag = this.tagList.find((o) => o["tagid"] == e);
      let tagClone = _.cloneDeep(tag);

      if (tagClone.tagtype == "list") {
        tagClone.lookupvalues = tagClone.lookupvalues.split(",");
      } else if (
        tagClone.tagtype == "range" &&
        typeof tagClone.lookupvalues == "string"
      ) {
        tagClone.min = tagClone.lookupvalues.split(",")[0];
        tagClone.min = tagClone.lookupvalues.split(",")[1];
      }

      this.selectedTag = _.cloneDeep(tagClone);
    }
  }

  getResourceDetail() {
    try {
      this.httpService
        .POST(
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.ASSETRECORDS.RESOURCE.replace(
            "{type}",
            this.baseCRN
          ),
          {
            tenantid: this.localStorageService.getItem(
              AppConstant.LOCALSTORAGE.USER
            )["tenantid"],
          }
        )
        .subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            this.resourceFields = response as IAssetHdr[];
            this.primaryResourceAttribute = this.resourceFields.find(
              (r) => r.identifier != null && r.identifier == true
            );
            this.getInstancesWithFilter();
          },
          (err) => {
            throw err;
          }
        );
    } catch (error) {
      console.log(error);
    }
  }

  getInstancesWithFilter() {
    try {
      const tagForm = this.tagForm.value;

      this.tagForm.patchValue({
        resources: [],
      });

      let params = {
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
        fields: [
          {
            fieldkey: `${this.baseCRN}/fk:key`,
            fieldname: "Key",
            fieldtype: "AUTOGEN",
            isSelected: true,
          },
          {
            fieldkey: this.baseAttributeKey,
            fieldname: this.baseAttributeName,
            fieldtype: "Text",
          },
        ],
        crn: this.baseCRN,
        filters: {},
        limit: 1000,
        offset: 0,
        status: "Active",
      };

      if (
        !params.fields.find(
          (f) => f.fieldkey == this.primaryResourceAttribute.fieldkey
        )
      ) {
        params.fields.push(this.primaryResourceAttribute);
      }

      if (tagForm["tag"]) {
        params["tag"] = tagForm["tag"];
      }
      if (tagForm["tagvalue"]) {
        params["tagvalue"] = tagForm["tagvalue"];
      }

      this.httpService
        .POST(
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.ASSETRECORDS.RESOURCEDETAILS,
          params
        )
        .subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            this.resources = response.rows;
          },
          (err) => {
            throw err;
          }
        );
    } catch (error) {
      console.log(error);
    }
  }

  collectBaseURLS() {
    const resourcesIDs = this.tagForm.value["resources"];

    if (resourcesIDs && resourcesIDs.length > 0) {
      let resources = [];

      resourcesIDs.forEach((element) => {
        resources.push(this.resources.find((r) => r["resource"] == element));
      });
      this.baseURLs = resources.filter(
        (r) => r[this.baseAttributeName] != null
      );
    }
  }

  addRequest() {
    const value = this.requestForm.value;

    // const http = new URL(value.endpoint);

    this.apiList = [
      {
        ...value,
        protocol: null,
        port: null,
        hostname: null,
        path: value.endpoint,
        step: value.title,
      },
      ...this.apiList,
    ];
    this.resetRequestForm();
    this.showNewReuestDrawer = false;
    console.log("New request lists >>>>>>>>>>>>");
    console.log(this.apiList);
  }

  deleteEndPoint(index) {
    this.endpointList.splice(index, 1);
    this.endpointList = [...this.endpointList];
  }

  deleteRequest(event, type?) {
    if (event.delete) {
      const request = event.data;
      if (type == 'api') {
        const index = this.apiList.findIndex((o) => o["step"] == request.step);
        this.apiList.splice(index, 1);
        console.log("After deletion.");
        console.log(this.apiList);
        this.apiList = [...this.apiList];
      }
    }
  }

  addRow() {
    this.endpointList.push({
      endpoint: '',
      instancerefid: null
    })
  }

  save() {
    if (this.resourceForm.valid) {
      this.create();
    }
  }

  create() {
    this.loading = true;
    //#OP_T428 
    if (!this.resourceForm.valid) {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.resourceForm,
        this.validationErrMsg
      )
      this.message.error(errorMessage);
      this.loading = false;
      return;
    }

    const urlValidation = this.endpointList.find((e)=>{ return e['endpoint'] == ''})
    if(urlValidation != undefined) {
      this.message.error("Please Enter Application URL")
      this.loading = false;
      return false;
    }


    const configurationForm = this.resourceForm.value;

    const formHeartbeatMeta = () => {
      return JSON.stringify(
        this.endpointList.map((u) => {
          console.log(u)
          return u.endpoint;
        })
      );
    };

    const formAPIMeta = () => {
      try {
        let requests = [];

        if (this.baseURLs.length > 0) {
          this.baseURLs.forEach((resource) => {
            this.apiList.forEach((api) => {
              const http = new URL(resource[this.baseAttributeName] + api.path);

              requests.push({
                ...api,
                protocol: http.protocol,
                port: http.port,
                hostname: http.hostname,
                path: http.pathname,
              });
            });
          });
        }

        if (this.endpointList.length > 0) {
          this.endpointList.map((u) => {
            const http = new URL(u['endpoint']);
            requests.push({
              path: u['path'],
              method: u['method'] ? u['method'] : 'GET',
              protocol: http.protocol != '' ? http.protocol : 'https:',
              port: http.port != '' ? http.port : '443',
              hostname: http.hostname,
              headers: u['headers'] ? u['headers'] : {},
              body: u['body'] ? u['body'] : "",
            });
          })
        }


        return JSON.stringify(requests);
      } catch (error) {
        this.loading = false;
        this.message.error("Synthetics base url is wrong.");
      }
    };

    console.log('Req', JSON.stringify({
      ...this.resourceForm.value,
      tenantid: this.localStorageService.getItem(
        AppConstant.LOCALSTORAGE.USER
      )["tenantid"],
      status: "Active",
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      meta:
        configurationForm.type == "api"
          ? formAPIMeta()
          : formHeartbeatMeta(),
    }));
    let data = {
      ...this.resourceForm.value,
      // instancerefid: this.instancename,
      tenantid: this.localStorageService.getItem(
        AppConstant.LOCALSTORAGE.USER
      )["tenantid"],
      status: "Active",
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      meta:
        configurationForm.type == "api"
          ? formAPIMeta()
          : formHeartbeatMeta(),
      monitoringdtls: this.endpointList.map((e) => {
        return {
          tenantid: this.localStorageService.getItem(
            AppConstant.LOCALSTORAGE.USER
          )["tenantid"],
          url: configurationForm.type == "api" ? e['endpoint'] + e['path'] : e['endpoint'],
          instancerefid: e['instancerefid'],
          status: "Active",
          createddt: new Date(),
          createdby: this.userstoragedata.fullname,
        }
      })
    };
    const formdata = new FormData();
    if (this.scriptFile != undefined && this.scriptFile != null) {
      formdata.append("file", this.scriptFile);
      data['scriptname'] = this.scriptFile.name;
    }
    formdata.append("formData", JSON.stringify(data));
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.CREATE,
        formdata
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success("Synthetics monitoring added.");
          this.resetForm();
          this.done.emit(true);
        } else {
          this.message.warning("Unable to create monitoring.");
          console.log(response);
          // this.instanceList = [];
          // this.orchForm.patchValue({
          //   instances: [],
          // });
        }
        this.loading = true;
      });
  }

  //#OP_T428 
  getAllregions() {
    this.regionList = [];
    let condition = {
      status: "Active",
    };
    this.httpService
      .POST(AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES, condition)
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.regionList = response.data;
            const default_region = _.find(this.regionList, function (e) { return e.zonename == 'us-east-1' }).zonename;
            this.resourceForm.controls['region'].setValue([default_region]);
          } else {
            this.regionList = [];
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getInstances() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allInstances(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      console.log(response);
      if (response.status) {
        this.instanceList = _.map(response.data, function (e) {
          return {
            instancename: e.instancename,
            instancerefid: e.instancerefid
          }
        });
      } else {
        this.instanceList = [];
      }
    });
  }
}
