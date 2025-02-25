import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AlibabaService } from "../../alibaba-service";
import * as _ from "lodash";

@Component({
  selector: "app-cloudmatiq-ali-add-edit-sg",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/sg/add-edit-sg/add-edit-sg.component.html",
})
export class ALIAddEditSgComponent implements OnInit, OnChanges {
  @Input() sgObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  regionList: any = [];
  vpcList: any = [];
  ruleDirectionList: any = [];
  protocolList: any = [];
  loading = false;
  disabled = false;
  defaultRule: any;
  defaultProtocol: any;
  sgForm: FormGroup;
  alisgrules: FormArray;
  removeitem: any = {};
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  sgErrObj = {
    securitygroupname: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.SGNME,
    alisecuritygroupid: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.SGID,
    vpcid: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.VPC,
    region: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.REGION,
    notes: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.NOTES,
    direction: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.RULEDIRECTION,
    ipprotocol: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.IPPROTOCOL,
    portrange: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.PORTRNGE,
    priority: AppConstant.VALIDATIONS.ALIBABA.SECURITYGROUP.PRIORITY,
  };

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private alibabaService: AlibabaService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getVPCList();
    this.getLookupList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.sgObj) &&
      !_.isEmpty(changes.sgObj.currentValue)
    ) {
      this.sgObj = changes.sgObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.sgObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.sgForm = this.fb.group({
      securitygroupname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      alisecuritygroupid: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      vpcid: [null, Validators.required],
      region: [null, Validators.required],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      alisgrules: this.fb.array([]),
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.sgObj = {};
  }
  getFormArray(type): FormArray {
    return this.sgForm.get(type) as FormArray;
  }
  createRule() {
    return this.fb.group({
      direction: [
        this.defaultRule !== undefined ? this.defaultRule.keyvalue : null,
        Validators.required,
      ],
      ipprotocol: [
        this.defaultProtocol !== undefined
          ? this.defaultProtocol.keyvalue
          : null,
        Validators.required,
      ],
      portrange: ["1/65535", Validators.required],
      priority: [1, Validators.required],
      status: [AppConstant.STATUS.ACTIVE],
      createdby: [this.userstoragedata.fullname],
      createddt: [new Date()],
    });
  }
  addRule() {
    this.alisgrules = this.sgForm.get("alisgrules") as FormArray;
    this.alisgrules.push(this.createRule());
  }
  removeRule(index) {
    this.alisgrules = this.sgForm.get("alisgrules") as FormArray;
    if (this.alisgrules.value.length !== 1) {
      let item = {} as any;
      item = this.alisgrules.controls[index].value;
      item.status = "Inactive";
      this.removeitem = item;
      this.alisgrules.removeAt(index);
    }
  }
  generateEditForm(data) {
    this.sgForm = this.fb.group({
      securitygroupname: [
        data.securitygroupname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      alisecuritygroupid: [
        data.alisecuritygroupid,
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      vpcid: [data.vpcid, Validators.required],
      region: [data.region, Validators.required],
      notes: [
        data.notes,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      alisgrules: this.fb.array([]),
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
    });
    this.alisgrules = this.sgForm.get("alisgrules") as FormArray;
    data.alisgrules.forEach((element) => {
      if (element.status === AppConstant.STATUS.ACTIVE) {
        this.alisgrules.push(
          this.fb.group({
            sgrulesid: [element.sgrulesid],
            direction: [element.direction, Validators.required],
            ipprotocol: [element.ipprotocol, Validators.required],
            portrange: [element.portrange, Validators.required],
            priority: [element.priority, Validators.required],
            status: [element.status],
            createdby: [element.createdby],
            createddt: [new Date()],
          })
        );
      }
    });
  }
  getVPCList() {
    this.alibabaService
      .allvpcs({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.vpcList = response.data;
        } else {
          this.vpcList = [];
        }
      });
  }
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.DIRECTION,
        AppConstant.LOOKUPKEY.SG_PROTOCOL,
        AppConstant.LOOKUPKEY.ALI_REGION,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (element.lookupkey === AppConstant.LOOKUPKEY.DIRECTION) {
            this.ruleDirectionList.push(element);
          }
          if (element.lookupkey === AppConstant.LOOKUPKEY.SG_PROTOCOL) {
            this.protocolList.push(element);
          }
          if (element.lookupkey === AppConstant.LOOKUPKEY.ALI_REGION) {
            this.regionList.push(element);
          }
        });
        this.defaultRule = _.find(this.ruleDirectionList, function (item) {
          if (item.defaultvalue === "Y") {
            return item;
          }
        });
        this.defaultProtocol = _.find(this.protocolList, function (item) {
          if (item.defaultvalue === "Y") {
            return item;
          }
        });
        // this.alisgrules = this.sgForm.get('alisgrules') as FormArray;
        // console.log(this.alisgrules);
        // this.alisgrules.controls[0].get('direction').setValue(this.defaultRule.keyvalue);
        // this.alisgrules.controls[0].get('ipprotocol').setValue(this.defaultProtocol.keyvalue);
      }
    });
  }

  saveOrUpdate(data) {
    let errorMessage: any;
    this.loading = true;
    this.disabled = true;
    if (this.sgForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.sgForm,
        this.sgErrObj,
        "alisgrules"
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.status =
      data.status === true
        ? AppConstant.STATUS.ACTIVE
        : AppConstant.STATUS.INACTIVE;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (!_.isEmpty(data.alisgrules)) {
      let self = this;
      _.map(data.alisgrules, function (item: any) {
        if (!_.isEmpty(self.sgObj)) {
          item.securitygroupid = self.sgObj.securitygroupid;
        }
        item.tenantid = data.tenantid;
        item.sgrulename = "allow" + item.ipprotocol;
        item.nictype = "internet";
        item.policy = "accept";
        item.lastupdatedby = data.tenantid;
        item.lastupdateddt = new Date();
      });
    }
    data.alisgrules = !_.isEmpty(this.removeitem)
      ? [...data.alisgrules, this.removeitem]
      : data.alisgrules;
    if (!_.isEmpty(this.sgObj) && !_.isUndefined(this.sgObj.securitygroupid)) {
      data.securitygroupid = this.sgObj.securitygroupid;
      this.alibabaService.updatesecuritygroup(data).subscribe((result) => {
        this.loading = false;
        this.disabled = false;
        response = JSON.parse(result._body);
        if (response.status) {
          response.data.alisgrules = data.alisgrules;
          this.notifyNewEntry.next(response.data);
          this.messageService.success(response.message);
        } else {
          this.messageService.error(response.message);
        }
      });
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.alibabaService.createsecuritygroup(data).subscribe((result) => {
        this.loading = false;
        this.disabled = false;
        response = JSON.parse(result._body);
        if (response.status) {
          this.notifyNewEntry.next(response.data);
          this.clearForm();
          this.messageService.success(response.message);
        } else {
          this.messageService.error(response.message);
        }
      });
    }
  }
}
