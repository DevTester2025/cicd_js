import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  EventEmitter,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { KPITicketsService } from "../kpitickets.service";
import * as _ from "lodash";
import { SLATemplatesService } from "../../slatemplates/slatemplates.service";

@Component({
  selector: "app-cloudmatiq-kpi-ticketsaddedit",
  templateUrl:
    "../../../../../presentation/web/tenant/servicemgmt/kpisetup/tickets/tickets-addedit.component.html",
})
export class KpiTicketAddEditComponent implements OnInit {
  @Input() selectedObj: any;
  @Output() notifyTicketsEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  customerList = [{ customerid: -1, customername: "All" }];
  tagList = [];
  tagValues = [];
  slaList = [];
  priorityList = [];
  ticketForm: FormGroup;
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
    response: {
      required: "Please Enter response minutes",
    },
    resolution: {
      required: "Please Enter resolution minutes",
    },
    working: {
      required: "Please Enter working minutes",
    },
  };
  constructor(
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private fb: FormBuilder,
    private ticketsService: KPITicketsService,
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
  onPrioritySelect(p) {
    if (p != null && p != undefined) {
      let selectedSLA: any = _.find(this.slaList, {
        id: this.ticketForm.value.slaid,
      });
      let selectedPriority: any = _.find(selectedSLA.slaparameters, {
        priority: Number(p.split(" ")[1]),
      });
      this.ticketForm.controls["response"].setValue(
        selectedPriority.responsetimemins
      );
      this.ticketForm.controls["resolution"].setValue(
        selectedPriority.resolutionhrs
      );
      this.ticketForm.updateValueAndValidity();
    }
  }
  onTagSelect() {
    if (this.ticketForm.value.tagid != null) {
      let cndtn = {
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
        tagid: this.ticketForm.value.tagid,
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
        this.customerList = [...this.customerList,...response.data];
      }
    });
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
    this.ticketForm = this.fb.group({
      tenantid: [this.userstoragedata.tenantid, Validators.required],
      customerid: [null, Validators.required],
      tagid: [null],
      tagvalue: [""],
      slaid: [null, Validators.required],
      priority: [null, Validators.required],
      resolution: [null, Validators.required],
      response: [null, Validators.required],
      // working: [null, Validators.required],
    });
    this.selectedObj = {};
  }
  saveOrUpdate() {
    let errorMessage: any;
    if (this.ticketForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.ticketForm,
        this.slaErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    let formdata = this.ticketForm.value;
    formdata.lastupdateddt = new Date();
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.tagid = formdata.tagid ? formdata.tagid : undefined;
    formdata.response = Number(formdata.response);
    formdata.resolution = Number(formdata.resolution);
    // formdata.working = Number(formdata.working);
    if (_.isEmpty(this.selectedObj)) {
      formdata.createddt = new Date();
      formdata.createdby = this.userstoragedata.fullname;
      this.ticketsService.create(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyTicketsEntry.next(response.data);
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      formdata.id = this.selectedObj.id;
      this.ticketsService.update(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyTicketsEntry.next(response.data);
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
    this.ticketForm.patchValue(data);
  }
}
