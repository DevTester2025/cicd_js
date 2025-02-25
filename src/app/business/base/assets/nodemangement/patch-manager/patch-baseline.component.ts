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
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
@Component({
  selector: "app-cloudmatiq-patch-baseline",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/patch-manager/patch-baseline.component.html",
  styles: [],
})
export class PatchBaselineComponent implements OnInit {
  loading = false;
  pbForm: FormGroup;
  tagList = [];
  instanceList = [];
  userstoragedata = {} as any;
  @Input() region;
  @Input() accountid: number;
  @Input() baselineObj;
  @Output() notifyBaseLine: EventEmitter<any> = new EventEmitter();
  addingpb = false;
  osList = [
    {
      label: "Windows",
      value: "WINDOWS",
    },
    {
      label: "Amazon Linux",
      value: "AMAZON_LINUX",
    },
    {
      label: "Amazon Linux 2",
      value: "AMAZON_LINUX_2",
    },
    {
      label: "Ubuntu",
      value: "UBUNTU",
    },
    {
      label: "Red Hat Enterprise Linux",
      value: "REDHAT_ENTERPRISE_LINUX",
    },
    {
      label: "SUSE",
      value: "SUSE",
    },
    {
      label: "CentOS",
      value: "CENTOS",
    },
    {
      label: "Oracle Linux",
      value: "ORACLE_LINUX",
    },
    {
      label: "Debian",
      value: "DEBIAN",
    },
    {
      label: "MACOS",
      value: "MACOS",
    },
    {
      label: "Raspberry Pi OS",
      value: "RASPBIAN",
    },
    {
      label: "Rocky Linux",
      value: "ROCKY_LINUX",
    },
  ];
  pbErrObj = {
    pbname: {
      required: "Please Enter Name",
    },
    instances: {
      required: "Please Select instances",
    },
  };
  buttonTxt = "Create";
  constructor(
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private SSMService: SSMService,
    private message: NzMessageService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges) {
    this.resetForm();
    if (
      changes.baselineObj &&
      changes.baselineObj.currentValue &&
      !_.isEmpty(changes.baselineObj.currentValue)
    ) {
      this.baselineObj = changes.baselineObj.currentValue;
      console.log(this.baselineObj);
      this.buttonTxt = "Update";
      this.pbForm.controls["pbname"].setValue(this.baselineObj.BaselineName);
      this.pbForm.controls["osname"].setValue(this.baselineObj.OperatingSystem);
      this.pbForm.controls["osname"].disable();
      this.pbForm.controls["defaultpb"].setValue(
        this.baselineObj.DefaultBaseline
      );
      this.pbForm.controls["defaultpb"].disable();
      this.pbForm.controls["description"].setValue(
        this.baselineObj.BaselineDescription
      );
    }
  }
  resetForm() {
    this.pbForm = this.fb.group({
      pbname: [null, Validators.required],
      osname: ["WINDOWS", Validators.required],
      defaultpb: [""],
      description: [""],
    });
  }
  createOrUpdatePatchbaseline() {
    let errorMessage: any;
    if (this.pbForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.pbForm,
        this.pbErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.addingpb = true;
    let pbFormData = this.pbForm.value;
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      pbname: pbFormData.pbname,
      osname: pbFormData.osname,
      description: pbFormData.description,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    if (this.baselineObj && this.baselineObj.BaselineId) {
      formData.baselineid = this.baselineObj.BaselineId;
      this.SSMService.updatePatchbaseline(formData).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.addingpb = false;
          if (response.status) {
            this.message.success("Patch Baseline Updated Successfully");
            this.notifyBaseLine.next(response.data);
          } else {
            this.message.error("Sorry,Patch Baseline Updation Failed");
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
    } else {
      this.SSMService.createPatchbaseline(formData).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.addingpb = false;
          if (response.status) {
            this.message.success("Patch Baseline Created Successfully");
            this.notifyBaseLine.next(response.data);
          } else {
            this.message.error("Sorry,Patch Baseline Creation Failed");
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
    }
  }
}
