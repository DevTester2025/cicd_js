import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { OrchestrationService } from "../../../../app/business/base/orchestration/orchestration.service";
import { AppConstant } from "../../../../app/app.constant";
import { LocalStorageService } from "../../services/shared/local-storage.service";
import { CommonService } from "../../services/shared/common.service";
import { ParametersService } from "../../../../app/business/admin/parameters/parameters.service";
import * as _ from "lodash";
import { HttpHandlerService } from "../../services/http-handler.service";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SrmService } from "src/app/business/srm/srm.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { Orchestration } from "src/app/interface";
import { ActivatedRoute, Router } from "@angular/router";
import * as XLSX from "xlsx";
import { ContactpointsService } from "../../services/shared/contactpoints.service"

@Component({
  selector: "app-cloudmatiq-run-orch",
  styles: [
    `
      .desc-textarea {
        min-height: 100px !important;
      }
      .hr-withtext {
        color: #fecc0094;
      }
      .hr-withtext:after,
      .hr-withtext:before {
        content: "------------------";
        text-decoration: line-through;
      }
      .orch-title {
        white-space: nowrap;
        width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ant-table-placeholder {
        display: none;
      }
      .close-run-btn {
        position: fixed; 
        top: 75px; 
        right: 30px;
        border: 1px solid #fecc00;
        color: #fecc00;
      }
      .save-run-btn {
        position: fixed; 
        top: 75px; 
        right: 137px;
        border: 1px solid #fecc00;
        color: #fecc00;
      }
      .add-run-btn{
        color: #fecc00;
        border: 1px solid #fecc00;
        margin-left: 10px;
      }
      .tag-search {
      color: #8D9BA6;
      font-size: 20px;
      position: absolute;
      right: 10px;
      }
    `,
  ],
  templateUrl: "./run-orch.component.html",
})
export class RunOrchestrationComponent implements OnInit, OnChanges {
  @Input()
  schedule: Record<string, any>;
  @Input() orchid: string;
  @Input() assetData: any;
  @Input() isTemplateShowHide = false;
  @Input() isViewMode: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  @Output() notifyCICDEntry: EventEmitter<any> = new EventEmitter();
  @Output() serviceRequestEntry: EventEmitter<any> = new EventEmitter();
  @Input() isEditMode: boolean;
  @Input() isloading: boolean;
  @Input() refid: number;
  @Input() module: string = '';
  userstoragedata: any = {};
  orchestrationList = [];
  instanceList = [];
  variablesToGet = [];
  missingIns: any = [];
  customerList = [];
  loading = false;
  disabled = false;
  show_vm_selection = false;
  accountList = [];
  tagList = [];
  triggerTagsList = [];
  windowList = [];
  selectedTag = {} as any;
  selectedTriggerTag = {} as any;
  orchForm: FormGroup;
  exceltoJson: any = {};

  form = {
    _orch: null,
    instances: [],
    scheduled: false,
  };

  triggerForm = {
    type: null,
    meta: {},
  };

  orchRunGroup = [];
  orchInstancesCount = [];

  duplicateVMs: any = [];
  ShowDuplicateVM = false;

  isFileSelected = false;
  metaData: any = {}
  params: any = {};
  headers;
  rungroups;
  serviceRequest: boolean = false;
  selectedFileName: string = '';
  constructor(
    private orchestrationsService: OrchestrationService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private parameterService: ParametersService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private customerAccService: CustomerAccountService,
    private tagService: TagService,
    private srmService: SrmService,
    private contactpointsService: ContactpointsService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getOrchestrationList();
    this.resetForm();
    this.serviceRequest = this.router.url.includes("/service") || this.router.url.includes("/catalog");
  }
  ngOnInit() {
    this.getServerList();
    this.getCustomerList();
    this.getAccountsList();
    this.getAllTags();
    // this.getMaintenanceWindow();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schedule && !_.isEmpty(changes.schedule.currentValue)) {
      const v = changes.schedule.currentValue;
      this.orchForm.patchValue({
        // title: v["title"],
        _orch: v["_orch"],
        _tag: v["_tag"],
        tagvalue: v["tagvalue"],
        _customer: v["_customer"],
        _account: v["_account"],
        _maintwindow: v["_maintwindow"],
        runtimestamp: v["runtimestamp"],
        scheduled: v["scheduled"],
      });
    } else {
      this.resetForm();
    }
    if (changes.assetData && !_.isEmpty(changes.assetData.currentValue)) {
      const a = changes.assetData.currentValue;
      this.orchForm.patchValue({
        _customer: a["customerid"],
        _account: a["accountid"],
        instances: [a["instanceid"]],
      });
      this.orchForm.updateValueAndValidity();
    }
    if (changes.isEditMode && this.isEditMode) {
      this.editOrchestration();
    }
    if (this.isViewMode) {
      this.orchForm.disable();
    }
  }

  // Orchestration Edit function
  editOrchestration() {
    if (this.refid !== undefined && this.refid !== null) {
      this.orchRunGroup = [];
      this.contactpointsService.byId(this.refid).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          this.metaData = JSON.parse(response.data.meta);
          this.metaData.rungroups.forEach((e) => {
            let orchRecord = { ...e };
            this.orchInstancesCount.forEach(orch => {
              if (e[orch]) {
                let instance = this.instanceList.find(instance => instance.instancerefid === e[orch]);
                orchRecord[orch] = e[orch] ? instance.instancerefid : "";
                orchRecord[orch] = { instancename: instance ? instance.instancename : "", instancerefid: instance.instancerefid };
              } else {
                orchRecord[orch] = { instancename: "" };
              }
            });
            this.orchRunGroup.push(orchRecord);
          });
          this.orchForm.patchValue({
            _orch: this.metaData["_orch"],
            _tag: this.metaData["_tag"],
            tagvalue: this.metaData["tagvalue"],
            _customer: this.metaData["_customer"],
            _account: this.metaData["_account"],
            _maintwindow: this.metaData["_maintwindow"],
            runtimestamp: this.metaData["runtimestamp"],
            scheduled: this.metaData["scheduled"],
            lastupdatedby: this.userstoragedata.fullname,
            lastupdateddt: new Date(),
          });
          this.params = JSON.parse(this.metaData.params);
        }
      });
    }
  }

  addOrchRunGroup() {
    let orgObj = {
      title: "",
      groupname: "",
      runtimestamp: "",
    };
    this.orchInstancesCount.forEach((el) => {
      orgObj[el] = { instancename: "" };
    });
    this.orchRunGroup.push(orgObj);
  }

  resetForm() {
    this.orchForm = this.fb.group({
      // title: [null, Validators.required],
      _orch: [null, Validators.required],
      _tag: [null],
      _customer: [null],
      _account: [null],
      _maintwindow: [null],
      tagvalue: [""],
      description: [""],
      runtimestamp: [null],
      scheduled_run: this.module === AppConstant.MODULE[0] ? "immediate" : ["schedule"],
      scheduled: [false],
      recurring: [false],
      cron: [null],
      repetition: [null],
    });
    this.checkSchedulePattern();
    // this.orchForm.get("_orch").valueChanges.subscribe((x) => {
    //   console.log("Orch id changed >>>>>");
    //   console.log(x);
    // });
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

  showInstances(obj, idx) {
    this.show_vm_selection = true;
    console.log(obj, idx);
  }

  getOrchestrationList() {
    this.orchestrationsService
      .all({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.orchestrationList = response.data;
          this.route.queryParams.subscribe((params) => {
            if (params["orchid"] || this.module === AppConstant.MODULE[0] || this.module === AppConstant.MODULE[1] && !this.isEditMode) {
              const orchId = params["orchid"] || this.orchid;
              this.orchForm.patchValue({ _orch: orchId });
              this.loadOrchParams();
            }
          });
        } else {
          this.orchestrationList = [];
        }
      });
  }

  getServerList() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      attributes: [
        "instanceid",
        "tenantid",
        "customerid",
        "cloudprovider",
        "instancerefid",
        "instancename",
        "zoneid",
        "region",
        "imageid",
        "imagerefid",
        "platform",
        "instancetypeid",
        "instancetyperefid",
        "accountid",
        "publicipv4",
        "privateipv4",
        "tnregionid",
        "cloudstatus",
      ],
    } as any;
    this.commonService
      .allInstances(condition, `acntData=true`)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.instanceList = response.data;
        } else {
          this.instanceList = [];
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

  onFileChange(event: any) {
    this.loading = true;
    this.exceltoJson = {};
    let headerJson = {};
    const target: DataTransfer = <DataTransfer>event.target;
    this.isFileSelected = target.files && target.files.length > 0;
    if (this.isFileSelected) {
      const reader: FileReader = new FileReader();
      if (target.files && target.files[0]) {
        reader.readAsBinaryString(target.files[0]);
        this.exceltoJson["filename"] = target.files[0].name;
        this.selectedFileName = target.files[0].name;
        reader.onload = (e: any) => {
          const binarystr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: "binary" });
          for (var i = 0; i < wb.SheetNames.length; ++i) {
            const wsname: string = wb.SheetNames[i];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            data.forEach((row) => {
              Object.keys(row).forEach((key) => {
                const header = key.trim().replace(/\s+/g, "");
                if (key !== header) {
                  row[header] = row[key];
                }
              });
            });
            this.exceltoJson[`sheet${i + 1}`] = data;
          }
          this.exceltoJson["headers"] = headerJson;
          if (this.exceltoJson.sheet1) {
            let missingSes = "";
            let sheetObj = this.exceltoJson.sheet1[0];
            this.orchInstancesCount.forEach((orch) => {
              if (!sheetObj[orch]) {
                missingSes += ` ${orch}`;
              }
            });
            if (missingSes) {
              this.message.warning(`Session not found in file ${missingSes}`);
              this.loading = false;
              this.formOrchRunner();
            } else {
              this.formOrchRunner();
            }
          } else {
            this.loading = false;
            this.message.warning("Sheet is empty");
          }
        };
      }
    }
    else {
      this.loading = false;
      this.selectedFileName = '';
    }
  }
  formOrchRunner() {
    this.loading = true;
    this.orchRunGroup = [];
    this.missingIns = [];
    this.duplicateVMs = [];
    let index = 1;
    // this.orchForm.get("title").setValue(this.exceltoJson.filename.split(".")[0]);
    this.exceltoJson.sheet1.forEach((element) => {
      let rgObj: any = {
        title: element["Title"],
        runtimestamp: new Date(element["Schedule_time"]),
        groupname: element["Group_name"],
      };
      let missingVM = { title: element["Title"] };
      let isValidData = true;
      this.orchInstancesCount.forEach((orch) => {

        if (!element[orch]) {
          element[orch] = "";
          rgObj[orch] = {};
        }
        else {
          let instance = this.instanceList.filter(
            (o) => o["instancename"].toLowerCase() == element[orch].trim().toLowerCase()
          );
          missingVM[orch] = {};
          missingVM[orch]["instancename"] = element[orch];
          if (instance && instance.length == 1) {
            rgObj[orch] = instance[0];
          } else if (instance && instance.length > 1) {
            let acntData: any;
            if (element["Cloud Provider"]) {
              if (element["Cloud Provider"] === 'AWS') {
                acntData = instance.find((el) => {
                  return el.cloudprovider == element["Cloud Provider"] && el.cloudstatus == 'running';
                });
              }
              if (!acntData && element['Cloud Provider'] != 'AWS') {
                acntData = instance.find((el) => {
                  return el.cloudprovider == element["Cloud Provider"];
                });
              }
            }
            else if (element["Account ID"]) acntData = instance.find((el) => {
              return el.accountdata.accountref == element["Account ID"];
            });
            if (acntData) {
              rgObj[orch] = acntData;
            } else {
              rgObj.valid = false;
              instance.forEach(obj => {
                obj.title = element["Title"];
                obj.runtimestamp = new Date(element["Schedule_time"]);
                obj.groupname = element["Group_name"];
                obj.orch = orch;
                obj.index = index;
                this.duplicateVMs.push({ ...obj });
              });
              index++;
            }
          } else {
            missingVM[orch]["status"] = true;
            isValidData = false;
          }
        }
      });

      if (!isValidData) {
        this.missingIns.push(missingVM);
      } else {
        this.orchRunGroup.push(rgObj);
      }
    });
    if (this.orchRunGroup.length == 0 && this.duplicateVMs.length == 0) {
      this.addOrchRunGroup();
    }
    this.loading = false;
  }
  selectRecord() {
    const selectedVM = [];
    for (const record of this.duplicateVMs) {
      if (record.isSelected && !selectedVM.includes(record.index)) {
        selectedVM.push(record.index);
      }
    }
    for (const index of selectedVM) {
      const selectedCount = this.duplicateVMs.filter(
        (record) => record.index === index && record.isSelected
      ).length;
      if (selectedCount !== 1) {
        this.message.error(`Please select any one of the record from duplicates`);
        return;
      }
    }
    const selectedRecords = this.duplicateVMs.filter((o) => o.isSelected);
    if (selectedRecords.length === 0) {
      this.message.error(`Please select the record`);
      return;
    }
    selectedRecords.forEach((data) => {
      let existingRecord = this.orchRunGroup.find(record =>
        record.title === data.title &&
        new Date(record.runtimestamp).getTime() === new Date(data.runtimestamp).getTime() &&
        record.groupname === data.groupname
      );
      if (existingRecord) {
        this.orchInstancesCount.forEach(item => {
          if (data.orch === item) {
            existingRecord[data.orch] = { instancename: data.instancename, instancerefid: data.instancerefid };
          }
        })
      } else {
        if (data.title && data.runtimestamp && data.groupname && data.instancename) {
          let record = {
            title: data.title,
            runtimestamp: data.runtimestamp,
            groupname: data.groupname,
          };
          this.orchInstancesCount.forEach((orch) => {
            record[orch] = { instancename: "" };
            if (data.orch === orch) {
              record[data.orch] = { instancename: data.instancename, instancerefid: data.instancerefid };
            }
          });
          this.orchRunGroup.push(record);
        }
      }
    });
    this.ShowDuplicateVM = false;
  }
  getAccountsList() {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountList = this.formArrayData(response.data, "name", "id");
      } else {
        this.accountList = [];
      }
    });
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

  getMaintenanceWindow() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      // tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
      //   "tenantid"
      // ],
    };
    this.srmService
      .allMaintwindows(condition, "daterange=true")
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.windowList = this.formArrayData(
            response.data,
            "windowname",
            "maintwindowid"
          );
        } else {
          this.windowList = [];
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

  triggersTagChanged(e) {
    if (e != null) {
      let tag = this.triggerTagsList.find((o) => o["tagid"] == e);
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

      this.selectedTriggerTag = _.cloneDeep(tagClone);

      this.triggerForm.meta["tagname"] = this.selectedTriggerTag.tagname;
    }
  }

  getInstancesWithFilter() {
    const v = this.orchForm.value;
    if (!v._customer && !v._account && !v._tag) {
      this.message.error("Filter is required.");
      return;
    }

    let data = {
      ...v,
      status: "Active",
      _tenant: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };

    this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION.DRYRUN,
        data
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.instanceList = response.data;
          // this.orchForm.patchValue({
          //   instances: this.instanceList.map((i) => i["instanceid"]),
          // });
        } else {
          this.message.warning("No instances matching the filter.");
          this.instanceList = [];
          // this.orchForm.patchValue({
          //   instances: [],
          // });
        }
      });
  }
  loadOrchParams() {
    this.orchRunGroup = [];

    if (!this.orchForm.value["_orch"]) {
      console.log("No orchestration selected.");
      return;
    }

    // Reset data
    this.variablesToGet = [];

    const scriptsList = [];
    const orch = this.orchestrationList.find(
      (o) => o["orchid"] == this.orchForm.get("_orch").value
    ) as {
      params: string;
      orchflow: string;
    };

    const flow = JSON.parse(orch.orchflow) as Orchestration;

    const instances = new Set();
    const sessionNodes = flow.nodes.filter((o) => o["name"] == "SessionNode");

    sessionNodes.forEach((n) => {
      if (n.data && n.data.ipaddress && n.data.ipaddress.includes("{{sys_")) {
        instances.add(n.data.name);
      } else {
        this.message.error(
          "Please provide ip address for the Session node used to run this orchestration"
        );
      }
    });

    this.orchInstancesCount = Array.from(instances.values());
    this.addOrchRunGroup();

    if (orch && orch["params"]) {
      this.variablesToGet = JSON.parse(orch["params"]).filter((v) => {
        if (!v["value"].includes("sys_")) {
          return v;
        }
      });
    }
  }

  loadRunTimeParams(orch: Record<string, any>) {
    const flow = JSON.parse(orch["orchflow"]);
    const nodes = flow["nodes"] as Array<Record<string, any>>;
    console.log("Selected orch details >>>>>");
    console.log(flow["nodes"]);

    let params = [];

    nodes.forEach((n) => {
      for (const key in n["params"]["data"]) {
        if (Object.prototype.hasOwnProperty.call(n["params"]["data"], key)) {
          const element = n["params"]["data"][key] as string;
          if (element.includes("{{v_") && element.includes("}}")) {
            params.push({
              fieldname: key,
              fieldvalue: "",
              datatype: "string",
            });
          }
        }
      }
    });

    this.variablesToGet = [...this.variablesToGet, ...params];
  }

  isCronValid(cron) {
    var cronregex = new RegExp(
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/
    );
    return cronregex.test(cron);
  }

  validateOrch() {
    const v = this.orchForm.value;

    // Validates the fields on primary form.

    if (v["recurring"] && !this.isCronValid(v["cron"])) {
      this.message.error("CRON is not valid.");
      return;
    }
    if (v["recurring"] && v["repetition"] <= 0) {
      this.message.error("Repetition count is not valid.");
      return;
    }
    if (v["scheduled"]) {
      let isvalid = true;
      let invalidEl: any = {};
      this.orchRunGroup.forEach((element) => {
        if (element.runtimestamp < new Date()) {
          isvalid = false;
          invalidEl = element;
        }
      });
      if (!isvalid) {
        this.message.error(
          `Scheduled date is not valid for ${invalidEl.title}`
        );
        return;
      }
    }
    if (!v["_orch"]) {
      this.message.error("All mandatory fields are required.");
      return;
    }

    // Validates the field on triggers form.
    if (
      this.triggerForm.type == "UPDATE-TAG" &&
      (!this.triggerForm.meta["tagid"] || !this.triggerForm.meta["tagvalue"])
    ) {
      this.message.error(
        "Tag and Tagvalue is required for trigger type Tag Update"
      );
      return;
    }
    for (let e of this.orchRunGroup) {
      if (e.title && e.title.length > 100) {
        this.message.error(AppConstant.ORCHRUNVALIDATION.TITLE);
        return;
      }
      if (e.groupname && e.groupname.length > 100) {
        this.message.error(AppConstant.ORCHRUNVALIDATION.GROUP);
        return;
      }
    }
    this.runOrchestration();
  }

  runOrchestration() {
    let query;
    this.disabled = true;
    this.loading = true;
    const v = this.orchForm.value;
    const runGroup = [];
    this.orchRunGroup.forEach((el) => {
      let rgObj = { ...el };
      this.orchInstancesCount.forEach((ins) => {
        rgObj[ins] = el[ins] ? el[ins].instancerefid : "";
      });
      runGroup.push(rgObj);
    });

    let data = {
      ...v,
      status: "Active",
      _tenant: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      instances: JSON.stringify(v["instances"]),
      trigger: this.triggerForm.type,
      trigger_meta: JSON.stringify(this.triggerForm.meta),
      rungroups: runGroup,
    };

    this.variablesToGet.forEach((o) => {
      this.params[o["key"]] = o["value"];
    });

    data["params"] = JSON.stringify(this.params);

    this.headers = _.map(data.rungroups, "groupname");
    if (this.headers) this.headers = _.uniq(this.headers);
    data.headers = this.headers.map((el) => {
      return {
        title: el,
        value: data.rungroups.filter((obj) => {
          return obj.groupname == el;
        }),
      };
    });

    if (this.module === AppConstant.MODULE[0] || this.module === AppConstant.MODULE[1]) {
      this.addEditContactPoints(data)
    } else {
      query = AppConstant.ORCH_END_POINT + AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION.RUN
      this.httpService
        .POST(
          query,
          data
        )
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response) {
            this.disabled = false;
            this.message.success("Orchestration scheduled.");
            this.router.navigate(["/orchestration"]);
          }
        });
    }
  }

  // Create and update function of contact points for run orchestration
  async addEditContactPoints(data) {
    try {
      let reqobj = {
        status: "Active",
        tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)["tenantid"],
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      };
      switch (this.module) {
        case AppConstant.MODULE[0]:
          reqobj["module"] = AppConstant.MODULE[0];
          break;
        case AppConstant.MODULE[1]:
          reqobj["module"] = AppConstant.MODULE[1];
          break;
        default:
          break;
      }
      let req;
      if (this.refid !== undefined && this.refid !== null) {
        req = {
          ...reqobj,
          refid: this.refid,
          meta: JSON.stringify(data),
        };
      } else {
        req = {
          ...reqobj,
          meta: JSON.stringify(data),
          createddt: new Date(),
          createdby: this.userstoragedata.fullname,
        };
      }
      this.notifyEntry.next({ type: AppConstant.EMITTYPE[0], data: true });
      this.serviceRequestEntry.next(req);
      if (this.serviceRequest) {
        this.message.success("Orchestration data fetched")
      }
    } catch (e) {
      console.error(e);
    }
  }


  checkSchedulePattern() {
    const status = this.orchForm.get("scheduled_run").value;
    if (status == "schedule") {
      this.orchForm.get("recurring").setValue(false);
      this.orchForm.get("scheduled").setValue(true);
    } else if (status == "recurring") {
      this.orchForm.get("scheduled").setValue(false);
      this.orchForm.get("recurring").setValue(true);
    } else {
      this.orchForm.get("scheduled").setValue(false);
      this.orchForm.get("recurring").setValue(false);
    }
  }
  removeFileUpload() {
    this.resetTableFields();
    this.selectedFileName = '';
    const fileInput = document.getElementsByName(
      "scriptfile"
    )[0] as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }
  resetTableFields() {
    this.orchRunGroup = [];
    this.duplicateVMs = [];
    this.missingIns = [];
    this.addOrchRunGroup();
    this.isFileSelected = false;
  }

  // Run orchestration close function 
  close() {
    if (this.module === AppConstant.MODULE[0]) {
      this.orchRunGroup = [];
      this.notifyEntry.next({ type: AppConstant.EMITTYPE[1], data: true });
    } else {
      this.router.navigate(["/orchestration"])
    }
  }
}
