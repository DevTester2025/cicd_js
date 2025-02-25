import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { SSMService } from "src/app/business/base/assets/nodemangement/ssm.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { SrmService } from "src/app/business/srm/srm.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
@Component({
  selector: "app-cloudmatiq-config-patch",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/patch-manager/config-patch.component.html",
  styles: [],
})
export class ConfigPatchComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  configForm: FormGroup;
  configErr = {
    pbname: {
      required: "Please Enter Name",
    },
    instances: {
      required: "Please Select instances",
    },
  };
  tagList = [];
  instanceList = [];
  userstoragedata = {} as any;
  @Input() region;
  @Input() accountid: number;
  @Output() notifyConfig = new EventEmitter();
  addingconfig = false;
  mainWindowList = [];
  selectedTag = null as Record<string, any> | null;
  constructor(
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private tagService: TagService,
    private commonService: CommonService,
    private SSMService: SSMService,
    private message: NzMessageService,
    private httpService: HttpHandlerService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.resetForm();
    this.getMainWindows();
    this.getAllTags();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.region && changes.region.currentValue) {
      this.getServerList();
    }
  }
  tagChanged(e) {
    if (e == null) {
      this.selectedTag = null;
      return;
    }
    let tag = this.tagList.find((o) => o["tagid"] == e);
    let tagClone = _.cloneDeep(tag) as any;

    this.configForm.patchValue({
      tagvalue: null,
    });

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
  getMainWindows() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.SSMService.allMaintwindows(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.mainWindowList = _.map(response.data, (item) => {
          item.label = item.Name + "(ID: " + item.WindowId + ")";
          return item;
        });
      } else {
        this.mainWindowList = [];
      }
    });
  }
  getServerList() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      region: this.region,
      ssmagent: { $ne: null },
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.commonService.allInstances(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = response.data;
      } else {
        this.instanceList = [];
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
      } else {
        this.tagList = [];
      }
    });
  }
  resetForm() {
    this.configForm = this.fb.group({
      tagid: [null],
      tagvalue: [""],
      operation: ["Scan"],
      configtype: ["PATCHNOW"],
      instances: [null, Validators.required],
      maintwindowid: [null],
    });
  }

  getInstancesWithFilter() {
    const v = this.configForm.value;
    if (!v.tagid && v.instances.length <= 0) {
      this.message.error("Tag or Instances filter is required");
      return;
    }

    let data = {
      status: "Active",
      _tenant: this.userstoragedata.tenantid,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      region: this.region,
      _tag: v.tagid,
      ssmagent: { $ne: null },
    } as any;
    if (v.tagvalue != null && v.tagvalue != "") {
      data.tagvalue = v.tagvalue;
    }
    if (this.accountid != null && this.accountid != undefined) {
      data["_account"] = this.accountid;
    }
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
          this.configForm.patchValue({
            instances: this.instanceList.map((i) => i["instancerefid"]),
          });
        } else {
          this.message.warning("No instances matching with the selected tag");
          this.instanceList = [];
          this.configForm.patchValue({
            instances: [],
          });
        }
      });
  }
  configure() {
    let errorMessage: any;
    if (this.configForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.configForm,
        this.configErr
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.addingconfig = true;
    let configFormData = this.configForm.value;
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      instances: configFormData.instances,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      operation:
        configFormData.operation == "SI" ? ["Install"] : ["Scan"],
      configtype: configFormData.configtype,
      tagid: configFormData.tagid,
      tagvalue: configFormData.tagvalue,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    if (configFormData.configtype == "SCHEDULEPATCH") {
      formData["WindowId"] = configFormData.maintwindowid;
    }
    this.SSMService.configurePatch(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.addingconfig = false;
        if (response.status) {
          this.message.success(
            "Successfully configured patching,Patch Manager will use Run Command to patch instances"
          );
          this.notifyConfig.next(response.data);
        } else {
          this.message.error("Failed to configure patching");
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
}
