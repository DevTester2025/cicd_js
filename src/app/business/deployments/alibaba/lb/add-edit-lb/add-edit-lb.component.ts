import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AlibabaService } from "../../alibaba-service";
import * as _ from "lodash";
import { SolutionService } from "../../../../tenants/solutiontemplate/solution.service";
@Component({
  selector: "app-cloudmatiq-ali-add-edit-lb",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/lb/add-edit-lb/add-edit-lb.component.html",
})
export class ALIAddEditLbComponent implements OnInit {
  @Input() solutionObj: any;
  lbObj = {} as any;
  userstoragedata: any = {};
  @Output() continue: EventEmitter<any> = new EventEmitter();
  lbForm: FormGroup;
  lblistenerForm: FormGroup;
  instanceList: any = [];
  specList: any = [];
  vswitchList: any = [];
  protocolList: any = [];
  healthchecktypeList: any = [];
  defaulthealthcheck: any;
  solutionData: any;
  lbList: any = [];
  formdata: any = {};
  alibabalbObj: any = {};
  loading = false;
  lbErrObj: any = {
    lbname: AppConstant.VALIDATIONS.ALIBABA.LB.NAME,
    attachedservers: AppConstant.VALIDATIONS.ALIBABA.LB.SERVER,
    internet: AppConstant.VALIDATIONS.ALIBABA.LB.INSTYPE,
    vswitchid: AppConstant.VALIDATIONS.ALIBABA.LB.VSWITCH,
  };
  lblistenerErrObj: any = {
    protocol: AppConstant.VALIDATIONS.ALIBABA.LB.PROTOCOL,
    frontendport: AppConstant.VALIDATIONS.ALIBABA.LB.FRONTENDPORT,
    backendport: AppConstant.VALIDATIONS.ALIBABA.LB.BACKENDPORT,
    healthchecktype: AppConstant.VALIDATIONS.ALIBABA.LB.HEALTHCHECKTYPE,
    healthythreshold: AppConstant.VALIDATIONS.ALIBABA.LB.HEALTHCHECKTYPE,
  };
  constructor(
    private messageService: NzMessageService,
    private lsService: LocalStorageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private solutionService: SolutionService,
    private alibabaService: AlibabaService
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.clearForm();
    this.getAlibabaLBList();
    this.getLookupList();
    this.getInstanceList();
  }

  clearForm() {
    this.lbForm = this.fb.group({
      lbname: [null, Validators.required],
      attachedservers: [null, Validators.required],
      internet: ["N", Validators.required],
      specification: [null],
      vswitchid: [null, Validators.required],
      status: [AppConstant.STATUS.ACTIVE],
      notes: [""],
    });
    this.lblistenerForm = this.fb.group({
      protocol: [null, Validators.required],
      frontendport: [80, Validators.required],
      backendport: [80, Validators.required],
      healthcheck: [true],
      healthchecktype: [
        !_.isEmpty(this.defaulthealthcheck)
          ? this.defaulthealthcheck.keyvalue
          : null,
        Validators.required,
      ],
      healthythreshold: [3, Validators.required],
      unhealthythreshold: [3, Validators.required],
      healthchecktimeout: [5, Validators.required],
      healthcheckinterval: [2, Validators.required],
      sslcertificate: [""],
      status: [AppConstant.STATUS.ACTIVE],
    });
  }
  getAlibabaLBList() {
    this.alibabaService
      .allloadbalancers({
        solutionid: this.solutionObj.solutionid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.lbList = response.data;
          } else {
            this.lbList = response.data;
          }
        },
        (err) => {
          this.messageService.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.LB_PROTOCOL,
        AppConstant.LOOKUPKEY.LB_HEALTHCHECK,
        AppConstant.LOOKUPKEY.LB_INS_SPEC,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (element.lookupkey === AppConstant.LOOKUPKEY.LB_PROTOCOL) {
            this.protocolList.push(element);
          }
          if (element.lookupkey === AppConstant.LOOKUPKEY.LB_HEALTHCHECK) {
            this.healthchecktypeList.push(element);
          }
          if (element.lookupkey === AppConstant.LOOKUPKEY.LB_INS_SPEC) {
            this.specList.push(element);
          }
        });
        this.defaulthealthcheck = _.find(
          this.healthchecktypeList,
          function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          }
        );
        this.lblistenerForm
          .get("healthchecktype")
          .setValue(this.defaulthealthcheck.keyvalue);
      }
    });
  }
  getVswitchList() {
    let vswitches = _.map(this.instanceList, function (item: any) {
      return item.vswitchid;
    });
    vswitches = _.uniq(vswitches);
    const condition = {
      status: AppConstant.STATUS.ACTIVE,
      vswitchList: vswitches,
    };
    this.alibabaService.allvswitches(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.vswitchList = response.data;
      } else {
        this.vswitchList = [];
      }
    });
  }
  getInstanceList() {
    let response = {} as any;
    this.solutionService
      .alibabaById(this.solutionObj.solutionid)
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.solutionData = response.data;
          this.instanceList = response.data.alisolution;
          this.lbList = response.data.alilb;
          this.getVswitchList();
        } else {
          this.instanceList = [];
          this.solutionData = {};
          this.lbList = [];
        }
      });
  }

  skip() {
    this.continue.next();
  }
  saveOrUpdate() {
    this.loading = true;
    let errorMessage: any;
    if (this.lbForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.lbForm,
        this.lbErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else if (this.lblistenerForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.lblistenerForm,
        this.lblistenerErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.formdata = this.lbForm.value;
      this.formdata.alilblistener = this.lblistenerForm.value;
      this.formdata.tenantid = this.userstoragedata.tenantid;
      this.formdata.solutionid = this.solutionData.solutionid;
      this.formdata.description = this.formdata.notes;
      this.formdata.internetchargetype = "PayByTraffic";
      this.formdata.lastupdatedby = this.userstoragedata.fullname;
      this.formdata.lastupdateddt = new Date();
      this.formdata.alilblistener.tenantid = this.userstoragedata.tenantid;
      this.formdata.alilblistener.lastupdatedby = this.userstoragedata.fullname;
      this.formdata.alilblistener.lastupdateddt = new Date();
      if (!_.isEmpty(this.lbForm.value.attachedservers)) {
        this.formdata.alisolution = [];
        this.lbForm.value.attachedservers.forEach((element) => {
          const obj: any = {};
          obj.alisolutionid = element;
          obj.lbid = !_.isEmpty(this.alibabalbObj)
            ? this.alibabalbObj.lbid
            : null;
          obj.lastupdatedby = this.userstoragedata.fullname;
          obj.lastupdateddt = new Date();
          obj.createdby = this.userstoragedata.fullname;
          obj.createddt = new Date();
          this.formdata.alisolution.push(obj);
        });
      }
      if (
        !_.isEmpty(this.alibabalbObj) &&
        !_.isUndefined(this.alibabalbObj) &&
        !_.isNull(this.alibabalbObj.lbid)
      ) {
        this.formdata.lbid = this.alibabalbObj.lbid;
        this.formdata.alilblistener.lblistenerid =
          this.alibabalbObj.alilblistener.lblistenerid;
        this.alibabaService
          .updateloadbalancer(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            this.loading = false;
            if (response.status) {
              this.lbList = [...this.lbList, response.data];
              this.continue.next(response.data);
              this.messageService.success(response.message);
            } else {
              this.messageService.error(response.message);
            }
          });
      } else {
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.createddt = new Date();
        this.formdata.alilblistener.createdby = this.userstoragedata.fullname;
        this.formdata.alilblistener.createddt = new Date();
        this.alibabaService
          .createloadbalancer(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            this.loading = false;
            if (response.data) {
              this.lbList = [...this.lbList, response.data];
              this.continue.next(response.data);
              this.messageService.success(response.message);
            } else {
              this.messageService.error(response.message);
            }
          });
      }
    }
  }
  editLB(data) {
    console.log(data);
    this.alibabalbObj = data;
    this.lbForm.patchValue(data);
    this.lblistenerForm.patchValue(data.alilblistener);
  }
  removeLB(data, i) {
    this.loading = true;
    this.formdata = {
      lbid: data.lbid,
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.alibabaService.updateloadbalancer(this.formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.loading = false;
      if (response.status) {
        this.messageService.success(
          "#" + response.data.lbid + " Load balancer removed"
        );
        this.lbList.splice(i, 1);
      } else {
        this.messageService.error(response.message);
      }
    });
  }
}
