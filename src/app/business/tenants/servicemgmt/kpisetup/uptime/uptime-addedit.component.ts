import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SLATemplatesService } from "../../slatemplates/slatemplates.service";
import { KPIUptimeService } from "../kpiuptime.service";

@Component({
  selector: "app-cloudmatiq-kpi-uptimeaddedit",
  templateUrl:
    "../../../../../presentation/web/tenant/servicemgmt/kpisetup/uptime/uptime-addedit.component.html",
})
export class KpiUptimeAddEditComponent implements OnInit {
  @Input() selectedObj: any;
  @Output() notifyUptimeEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  customerList = [{ customerid: -1, customername: "All" }];
  tagList = [];
  tagValues = [];
  slaList = [];
  priorityList = [];
  uptimeForm: FormGroup;
  buttonText = "Save";
  slaErrObj = {
    customerid: {
      required: "Please Select Customer",
    },
    tagid: {
      required: "Please Select Tag",
    },
    slaid: {
      required: "Please Select SLA",
    },
    tagvalue: {
      required: "Please Enter Value",
    },
    priority: {
      required: "Please Select Priority",
    },
    uptime: {
      required: "Please Enter uptime",
    },
  };
  constructor(
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private fb: FormBuilder,
    private uptimeService: KPIUptimeService,
    private slaTemplateService: SLATemplatesService
  ) {}
  ngOnInit() {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getAllCustomers();
    this.getAllTags();
    this.getAllSLAs();
    this.clearForm();
  }
  getAllTags() {
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.tagList = response.data;
      } else {
        this.tagList = [];
      }
    });
  }
  onTagSelect() {
    if (this.uptimeForm.value.tagid != null) {
      let cndtn = {
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
        tagid: this.uptimeForm.value.tagid,
      };
      let query = "?distinct=tagvalue";
      this.tagValueService.all(cndtn, query).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.tagValues = response.data;
          } else {
            this.tagValues = [];
          }
        },
        (err) => {
          this.message.error("Unable to get tag group. Try again");
        }
      );
    } else {
      this.tagValues = [];
    }
  }
  getAllCustomers() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerList = [...this.customerList, ...response.data];
      }
    });
  }
  onPrioritySelect(p) {
    if (p != null && p != undefined) {
      let selectedSLA: any = _.find(this.slaList, {
        id: this.uptimeForm.value.slaid,
      });
      let selectedPriority: any = selectedSLA
        ? _.find(selectedSLA.slaparameters, {
            priority: Number(p.split(" ")[1]),
          })
        : { uptimeprcnt: 0 };
      this.uptimeForm.controls["uptime"].setValue(selectedPriority.uptimeprcnt);
      this.uptimeForm.updateValueAndValidity();
    }
  }
  onSLASelect(slaid) {
    let selectedSLA = _.find(this.slaList, { id: slaid });
    this.priorityList = _.map(selectedSLA.slaparameters, (itm) => {
      return {
        label: "Priority " + itm.priority,
        value: "Priority " + itm.priority,
      };
    });
  }
  getAllSLAs() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    let query = "?include=" + JSON.stringify(["slaparameters"]);
    this.slaTemplateService.all(condition, query).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.slaList = response.data;
      } else {
        this.slaList = [];
      }
    });
  }
  clearForm() {
    this.uptimeForm = this.fb.group({
      customerid: [null, Validators.required],
      tenantid: [this.userstoragedata.tenantid, Validators.required],
      tagid: [null],
      tagvalue: [""],
      slaid: [null, Validators.required],
      priority: [null, Validators.required],
      uptime: [null, Validators.required],
    });
    this.selectedObj = {};
  }
  saveOrUpdate() {
    let errorMessage: any;
    if (this.uptimeForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.uptimeForm,
        this.slaErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    let formdata = this.uptimeForm.value;
    formdata.lastupdateddt = new Date();
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.tagid = formdata.tagid ? formdata.tagid : undefined;
    formdata.uptime = Number(formdata.uptime);
    if (_.isEmpty(this.selectedObj)) {
      formdata.createddt = new Date();
      formdata.createdby = this.userstoragedata.fullname;
      this.uptimeService.create(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyUptimeEntry.next(response.data);
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      formdata.id = this.selectedObj.id;
      this.uptimeService.update(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyUptimeEntry.next(response.data);
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.selectedObj) &&
      !_.isEmpty(changes.selectedObj.currentValue)
    ) {
      this.selectedObj = changes.selectedObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.selectedObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  generateEditForm(data) {
    this.uptimeForm.patchValue(data);
  }
}
