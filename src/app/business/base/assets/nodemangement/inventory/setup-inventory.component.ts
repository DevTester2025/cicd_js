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
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-cloudmatiq-setup-inventory",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/inventory/setup-inventory.component.html",
  styles: [],
})
export class SetupInventoryComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  invForm: FormGroup;
  tagList = [];
  instanceList = [];
  userstoragedata = {} as any;
  selectedTag = null as Record<string, any> | null;
  @Input() region;
  @Input() accountid: number;
  @Output() notifyIV = new EventEmitter();
  addinginv = false;
  invErrObj = {
    inventoryname: {
      required: "Please Enter Inventory Name",
    },
    instances: {
      required: "Please Select instances",
    },
  };
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
    this.getAllTags();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.region && changes.region.currentValue) ||
      (changes.accountid && changes.accountid.currentValue)
    ) {
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

    this.invForm.patchValue({
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
    this.invForm = this.fb.group({
      inventoryname: [null, Validators.required],
      tagid: [null],
      tagvalue: [""],
      applicationyn: [true],
      awscomponentyn: [true],
      networkconfigyn: [true],
      windownsupdateyn: [true],
      instancedtlinfoyn: [true],
      servicesyn: [true],
      windowsroleyn: [true],
      custominventoryyn: [true],
      billinginfoyn: [true],
      instances: [null, Validators.required],
    });
  }
  createInventory() {
    let errorMessage: any;
    if (this.invForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.invForm,
        this.invErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.addinginv = true;
    let invFormData = this.invForm.value;
    let formData = {
      region: this.region,
      accountid: this.accountid,
      tenantid: this.userstoragedata.tenantid,
      inventoryname: invFormData.inventoryname,
      applicationyn: invFormData.applicationyn ? "Enabled" : "Disabled",
      awscomponentyn: invFormData.awscomponentyn ? "Enabled" : "Disabled",
      networkconfigyn: invFormData.networkconfigyn ? "Enabled" : "Disabled",
      windownsupdateyn: invFormData.windownsupdateyn ? "Enabled" : "Disabled",
      instancedtlinfoyn: invFormData.instancedtlinfoyn ? "Enabled" : "Disabled",
      servicesyn: invFormData.servicesyn ? "Enabled" : "Disabled",
      windowsroleyn: invFormData.windowsroleyn ? "Enabled" : "Disabled",
      custominventoryyn: invFormData.custominventoryyn ? "Enabled" : "Disabled",
      billinginfoyn: invFormData.billinginfoyn ? "Enabled" : "Disabled",
      instances: invFormData.instances,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      tagid: invFormData.tagid,
      tagvalue: invFormData.tagvalue,
    } as any;
    this.SSMService.createInventory(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.addinginv = false;
        if (response.status) {
          this.message.success("Inventory Setup success");
          this.notifyIV.next(response.data);
        } else {
          this.message.error("Failed to setup inventory");
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getInstancesWithFilter() {
    const v = this.invForm.value;
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
          this.invForm.patchValue({
            instances: this.instanceList.map((i) => i["instancerefid"]),
          });
        } else {
          this.message.warning("No instances matching with the selected tag");
          this.instanceList = [];
          this.invForm.patchValue({
            instances: [],
          });
        }
      });
  }
}
