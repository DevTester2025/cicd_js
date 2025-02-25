import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AWSService } from "../../aws-service";
import * as _ from "lodash";
import { SolutionService } from "../../../../tenants/solutiontemplate/solution.service";
@Component({
  selector: "app-cloudmatiq-lb-add-edit",
  styles: [
    `
      .hover-pointer:hover {
        cursor: pointer;
      }
      .ant-breadcrumb-separator {
        color: white;
      }
      form .ant-input-group .ant-cascader-picker,
      form .ant-input-group .ant-select {
        width: 100%;
      }
      .ant-form-item-control .ant-select .ant-select-selection,
      .ant-input-number {
        width: 100%;
      }
    `,
  ],
  templateUrl:
    "../../../../../presentation/web/deployments/aws/lb/lb-add-edit/lb-add-edit.component.html",
})
export class LbAddEditComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() solutionObj: any;
  @Input() loadBalancerObj: any;
  @Input() noEdit: boolean;

  lbObj = {} as any;
  @Output() continue: EventEmitter<any> = new EventEmitter();
  @Input() assetData: any;
  addTenant: any = false;
  lbForm: FormGroup;
  subnetList: any[] = [];
  sgList: any[] = [];
  policiesList: any[] = [];
  certificationList: any[] = [];
  protocolList: any[];
  listenerItems: any;
  lbList: any[] = [];
  vpcList: any[] = [];
  instanceList: any[] = [];
  userstoragedata = {} as any;
  awssgobj = {} as any;
  size: any;
  awssgDetailVisible: boolean;
  lbErrObj = {
    lbname: AppConstant.VALIDATIONS.AWS.LB.LBNAME,
    listeners: AppConstant.VALIDATIONS.AWS.LB.LISTENERS,
    subnetid: AppConstant.VALIDATIONS.AWS.LB.SUBNET,
    securitypolicy: AppConstant.VALIDATIONS.AWS.LB.POLICY,
    securitygroupid: AppConstant.VALIDATIONS.AWS.LB.SG,
    hcunhealthythreshold: AppConstant.VALIDATIONS.AWS.LB.HCUNHEALTHYTHERSHOLD,
    hchealthythreshold: AppConstant.VALIDATIONS.AWS.LB.HCHEALTHYTHERSHOLD,
    certificatearn: AppConstant.VALIDATIONS.AWS.LB.ARN,
    hcport: AppConstant.VALIDATIONS.AWS.LB.PORT,
    hcinterval: AppConstant.VALIDATIONS.AWS.LB.INTERVAL,
    hctimeout: AppConstant.VALIDATIONS.AWS.LB.TIMEOUT,
  };
  solutionData = {} as any;
  constructor(
    private messageService: NzMessageService,
    private lsService: LocalStorageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private solutionService: SolutionService,
    private awsService: AWSService
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.clearForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!_.isEmpty(changes.loadBalancerObj)) {
      console.log("LOADBALANCER OBJECT CHANGES::::::::::::::");
      console.log(changes);
      if (changes.loadBalancerObj.currentValue.awssolution) {
        this.instanceList = changes.loadBalancerObj.currentValue.awssolution;
      }
      this.editLB(changes.loadBalancerObj.currentValue);
    }
  }

  ngOnInit(): void {
    this.getLookups();
    this.getLBProtocols();
    this.getLBCertificate();
    this.getSgList();
    this.getVpcList();
    this.getSubnetList();
    this.getSolutionData();
    if (this.loadBalancerObj) this.editLB(this.loadBalancerObj);
    if (this.assetData) {
      this.addTenant = true;
    }
  }
  getSolutionData() {
    let response = {} as any;
    if (this.solutionObj) {
      this.solutionService
        .byId(this.solutionObj.solutionid)
        .subscribe((data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.solutionData = response.data;
            this.instanceList = response.data.awssolutions;
            this.lbList = response.data.lb;
            this.solutionObj.refid = response.data.solutionid;
            this.solutionObj.reftype = AppConstant.REFERENCETYPE[23];
          } else {
            this.instanceList = [];
          }
        });
    }
  }
  listnerGroup(): FormGroup {
    return this.fb.group({
      InstancePort: [""],
      InstanceProtocol: [""],
      LoadBalancerPort: [""],
      Protocol: [""],
    });
  }
  getFormArray(type): FormArray {
    return this.lbForm.get(type) as FormArray;
  }
  addListener() {
    this.listenerItems = this.lbForm.get("listeners") as FormArray;
    this.listenerItems.push(this.listnerGroup());
  }
  deleteListener(index) {
    let controls = <FormArray>this.lbForm.controls["listeners"];
    controls.removeAt(index);
  }
  clearForm() {
    this.lbForm = this.fb.group({
      lbname: [
        null,
        [Validators.required, Validators.pattern(new RegExp(/(\w|-)(?!=\S)/g))],
      ],
      listeners: this.fb.array([this.listnerGroup()]),
      subnetid: [null, Validators.required],
      securitypolicy: [null, Validators.required],
      securitygroupid: [null, Validators.required],
      certificatearn: [null, Validators.required],
      hcport: [
        null,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(65535),
        ]),
      ],
      hcinterval: [
        30,
        Validators.compose([
          Validators.required,
          Validators.min(5),
          Validators.max(300),
        ]),
      ],
      hctimeout: [
        5,
        Validators.compose([
          Validators.required,
          Validators.min(2),
          Validators.max(60),
        ]),
      ],
      hchealthythreshold: [
        10,
        Validators.compose([
          Validators.required,
          Validators.min(2),
          Validators.max(10),
        ]),
      ],
      hcunhealthythreshold: [
        2,
        Validators.compose([
          Validators.required,
          Validators.min(2),
          Validators.max(10),
        ]),
      ],
      assignlb: [null, Validators.required],
      status: ["Active"],
      notes: [""],
    });
  }

  getSubnetList(options?) {
    let response = {} as any;
    let query = {} as any;
    if (options) {
      query = options;
    } else {
      query = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      };
    }
    this.awsService.allawssubnet(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.subnetList = response.data.map((o) => {
            if (o.tenantregion && o.tenantregion.length > 0) {
              o.subnetname =
                o.subnetname + " (" + o.tenantregion[0].region + ")";
            }
            return o;
          });
        } else {
          this.subnetList = [];
        }
      },
      (err) => {
        this.messageService.error("Sorry! Something gone wrong");
      }
    );
  }

  getSgList() {
    let response = {} as any;
    this.awsService
      .allawssg({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.sgList = response.data.map((o) => {
              if (o.tenantregion && o.tenantregion.length > 0) {
                o.securitygroupname =
                  o.securitygroupname + " (" + o.tenantregion[0].region + ")";
              }
              return o;
            });
          } else {
            this.sgList = [];
          }
        },
        (err) => {
          this.messageService.error("Sorry! Something gone wrong");
        }
      );
  }

  getLookups() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: "AWS_SECURITY_POLICY",
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.policiesList = response.data;
          } else {
            this.policiesList = [];
          }
        },
        (err) => {
          this.messageService.error("Sorry! Something gone wrong");
        }
      );
  }
  getLBCertificate() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.LB_CERTIFICATE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.certificationList = response.data;
          } else {
            this.certificationList = [];
          }
        },
        (err) => {
          this.messageService.error("Sorry! Something gone wrong");
        }
      );
  }
  getLBProtocols() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.LB_PROTOCOL,
        tenantid: -1,
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.protocolList = response.data;
          } else {
            this.protocolList = [];
          }
        },
        (err) => {
          this.messageService.error("Sorry! Something gone wrong");
        }
      );
  }
  skip() {
    this.continue.next();
  }
  saveLb() {
    let data = {} as any;
    data = this.lbForm.value;
    let errorMessage: any;
    if (this.lbForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.lbForm,
        this.lbErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    if (Number(data.hctimeout) > Number(data.hcinterval)) {
      this.messageService.remove();
      this.messageService.error(
        "Health Check timeout must be less than interval"
      );
      return false;
    }
    let response = {} as any;
    let lbresponse = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.solutionid = this.solutionObj.solutionid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (
      !_.isEmpty(this.lbObj) &&
      this.lbObj.lbid != null &&
      this.lbObj.lbid != undefined
    ) {
      data.lbid = this.lbObj.lbid;
      this.awsService.updateawslb(data).subscribe(
        (result) => {
          lbresponse = JSON.parse(result._body);
          if (lbresponse.status) {
            this.clearForm();
            let index = _.indexOf(this.lbList, this.lbObj);
            this.lbList[index] = lbresponse.data;
            const self = this;
            const awsSolutionData: any[] = [];
            _.map(data.assignlb, function (item) {
              const obj = {} as any;
              obj.awssolutionid = item;
              obj.lastupdatedby = self.userstoragedata.fullname;
              obj.lastupdateddt = new Date();
              obj.islbupdate = "Y";
              obj.lbid = lbresponse.data.lbid;
              obj.solutionid = lbresponse.data.solutionid
              awsSolutionData.push(obj);
              if (awsSolutionData.length == data.assignlb.length) {
                self.awsService
                  .bulkupdateawssolutions(awsSolutionData)
                  .subscribe(
                    (result) => {
                      response = JSON.parse(result._body);
                      if (response.status) {
                        self.messageService.success(lbresponse.message);
                      } else {
                        self.messageService.error(response.message);
                      }
                    },
                    (err) => {
                      self.messageService.error(
                        "Unable to add lb group. Try again"
                      );
                    }
                  );
              }
            });
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add lb group. Try again");
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;

      this.awsService.createawslb(data).subscribe(
        (result) => {
          lbresponse = JSON.parse(result._body);
          if (lbresponse.status) {
            this.clearForm();
            const self = this;
            const awsSolutionData: any[] = [];
            _.map(data.assignlb, function (item) {
              const obj = {} as any;
              obj.awssolutionid = item;
              obj.lastupdatedby = self.userstoragedata.fullname;
              obj.lastupdateddt = new Date();
              obj.islbupdate = "Y";
              obj.lbid = lbresponse.data.lbid;
              awsSolutionData.push(obj);
              if (awsSolutionData.length == data.assignlb.length) {
                self.awsService
                  .bulkupdateawssolutions(awsSolutionData)
                  .subscribe(
                    (result) => {
                      response = JSON.parse(result._body);
                      if (response.status) {
                        self.lbList.push(lbresponse.data);
                        self.messageService.success(lbresponse.message);
                      } else {
                        self.messageService.error(response.message);
                      }
                    },
                    (err) => {
                      self.messageService.error(
                        "Unable to add lb group. Try again"
                      );
                    }
                  );
              }
            });
            // this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add lb. Try again");
        }
      );
    }
  }
  openSGForm() {
    this.awssgobj = _.find(this.sgList, {
      securitygroupid: this.lbForm.value.securitygroupid,
    });
    this.awssgDetailVisible = true;
  }
  notifySgEntry(event) {
    this.sgList = [...this.sgList, event];
    this.lbForm.controls["securitygroupid"].setValue(event.securitygroupid);
    this.awssgDetailVisible = false;
  }
  getVpcList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsvpc(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.vpcList = response.data;
        } else {
          this.vpcList = [];
        }
      },
      (err) => {
        this.messageService.error("Sorry! Something gone wrong");
      }
    );
  }
  onChanged(val) {
    this.awssgDetailVisible = val;
    this.awssgobj = {};
  }
  editLB(lb) {
    console.log(lb);
    this.lbObj = lb;
    let assigneeList = [];
    this.instanceList.forEach((o) => {
      if (o.lbid == lb.lbid) {
        assigneeList.push(o.awssolutionid);
      }
    });
    console.log(assigneeList);
    lb.assignlb = assigneeList;
    console.log(lb);
    const { listeners, ...additionalAttributes  } = lb;
    this.lbForm.patchValue(additionalAttributes );
    this.listenerItems = this.lbForm.get("listeners") as FormArray;
    this.clearFormArray(this.listenerItems);
    if (Array.isArray(listeners)) {
        listeners.forEach((item) => {
            this.listenerItems.push(
                this.fb.group({
                    InstancePort: [item.InstancePort],
                    InstanceProtocol: [item.InstanceProtocol],
                    LoadBalancerPort: [item.LoadBalancerPort],
                    Protocol: [item.Protocol],
                })
            );
        });
    } else {
        console.error("Listeners is not an array", listeners);
    }
}

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  };
  removeLB(lb, i) {
    let response = {} as any;
    let formdata = {
      lbid: lb.lbid,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      status: AppConstant.STATUS.DELETED,
    };
    this.awsService.updateawslb(formdata).subscribe((data) => {
      response = JSON.parse(data._body);
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
