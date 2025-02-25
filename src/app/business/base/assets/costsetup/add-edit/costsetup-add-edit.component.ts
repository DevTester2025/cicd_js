import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../../app.constant";
import { CommonService } from "../../../../../modules/services/shared/common.service";

import * as _ from "lodash";
import { CostSetupService } from "../costsetup.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { Ecl2Service } from "src/app/business/deployments/ecl2/ecl2-service";
import { BaseObject } from "@amcharts/amcharts4/core";
@Component({
  selector: "app-cloudmatiq-costsetup-add-edit",
  templateUrl:
    "../../../../../presentation/web/base/costsetup/add-edit/costsetup-add-edit.component.html",
})
export class AddEditCostComponent implements OnInit, OnChanges, AfterViewInit {
  disabled = false;
  loading = false;

  @Input() costList: any;
  @Output() notifyTagEntry: EventEmitter<any> = new EventEmitter();

  costForm: FormGroup;
  userstoragedata = {} as any;
  assetTypes: any = [];
  selectPlan = true;
  zoneList = [];
  providerList = [];
  imageList = [];
  planList = [];
  awsZoneList: any = [];
  volumeSizeList: any = [];
  eclInstanceList: any = [];
  eclImageList: any = [];
  qosList: any = [];
  ecllbPlanList: any = [];
  eclfirewallplanList: any = [];
  awsImageList: any = [
    { label: "Windows", value: "windows" },
    { label: "Linux", value: "linux" },
  ];
  awsInstanceList: any = [];
  eclZoneList: any = [];
  currencyList: any = [];
  unitList: any = [];
  pricingList: any = [];

  buttonText = AppConstant.BUTTONLABELS.SAVE;
  costErrObj = AppConstant.VALIDATIONS.COSTSETUP;

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private httpService: HttpHandlerService,
    private awsService: AWSService,
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private costService: CostSetupService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getProviderList();
    this.getZone();
    this.getAwsZone();
    this.getNttInstance();
    this.getAwsInstance();
    this.geteclImageList();
    // this.getAwsImageList();
    this.getLookupLists();
    let obj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getPlanList(obj);
    this.getFirewallPlans(obj);
    this.getQosOptions(obj);
    this.getVolumeSizeList();
  }
  ngAfterViewInit(): void {}

  ngOnInit() {
    this.clearForm();
    this.assetTypes = [];
    this.zoneList = [];
    this.imageList = [];
    this.planList = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["costList"]) {
      this.clearForm();
      this.assetTypes = [];
      this.zoneList = [];
      this.imageList = [];
      this.planList = [];
      if (this.costList && this.costList.data) this.editData(this.costList);
      this.selectPlan = true;
    }
  }
  clearForm(data?) {
    this.costForm = this.fb.group({
      cloudprovider: [data ? data.cloudprovider : null, Validators.required],
      region: [
        data && data.resourcetype ? this.costForm.value.region : null,
        Validators.required,
      ],
      resourcetype: [data ? data.resourcetype : null, Validators.required],
      plantype: [null, Validators.required],
      unit: [null, Validators.required],
      priceperunit: [null, Validators.required],
      image: [null],
      currency: [null, Validators.required],
      version: [1],
      pricingmodel: [null, Validators.required],
      status: ["Active"],
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
    });
  }
  assetChanges(provider, asset) {
    this.selectPlan = true;
    this.planList = [];
    this.clearForm({ resourcetype: asset, cloudprovider: provider });
    if (provider && asset) {
      switch (provider) {
        case "ECL2":
          switch (asset) {
            case "ASSET_INSTANCE":
              this.planList = this.eclInstanceList;
              this.imageList = this.eclImageList;
              break;
            // case 'ASSET_NETWORK':
            //     this.selectPlan = false;
            //     break;
            case "ASSET_LB":
              this.planList = this.ecllbPlanList;
              break;
            case "ASSET_FIREWALL":
              this.planList = this.eclfirewallplanList;
              break;
            // case 'ASSET_IG':
            //     this.planList = this.qosList;
            //     break;
            // case 'ASSET_CFG':
            //     this.selectPlan = false;
            //     break;
            case "ASSET_VOLUME":
              this.planList = this.volumeSizeList;
              break;
            default:
              break;
          }
          break;
        case "AWS":
          switch (asset) {
            case "ASSET_INSTANCE":
              this.planList = this.awsInstanceList;
              this.imageList = this.awsImageList;
              break;
            // case 'ASSET_VPC':
            //     this.selectPlan = false;
            //     break;
            // case 'ASSET_SUBNET':
            //     this.selectPlan = false;
            //     break;
            // case 'ASSET_SECURITYGROUP':
            //     this.selectPlan = false;
            //     break;
            // case 'ASSET_LB':
            //     this.selectPlan = false;
            //     break;
            case "ASSET_VOLUME":
              this.planList = this.volumeSizeList;
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
  }
  providerChanges(provider) {
    this.clearForm({ cloudprovider: provider });
    if (provider == "ECL2") {
      this.assetTypes = [
        { title: "Server", value: "ASSET_INSTANCE" },
        // { title: "Network", value: "ASSET_NETWORK" },
        { title: "Load Balancer", value: "ASSET_LB" },
        { title: "Firewall", value: "ASSET_FIREWALL" },
        // { title: "Internet Gateway", value: "ASSET_IG" },
        // { title: "CFG", value: "ASSET_CFG" },
        { title: "Volume", value: "ASSET_VOLUME" },
      ];
      this.zoneList = this.eclZoneList;
    } else if (provider == "AWS") {
      this.assetTypes = [
        { title: "Server", value: "ASSET_INSTANCE" },
        // { title: "VPC", value: "ASSET_VPC" },
        // { title: "Subnet", value: "ASSET_SUBNET" },
        // { title: "Security Group", value: "ASSET_SECURITYGROUP" },
        // { title: "Load Balancer", value: "ASSET_LB" },
        { title: "Volume", value: "ASSET_VOLUME" },
      ];
      this.zoneList = this.awsZoneList;
    } else {
      this.zoneList = [];
    }
  }

  editData(costObj) {
    let data = costObj.data;
    this.providerChanges(data.cloudprovider);
    this.assetChanges(data.cloudprovider, data.resourcetype);
    this.costForm = this.fb.group({
      costvisualid: [costObj.revise ? null : data.costvisualid],
      cloudprovider: [data.cloudprovider, Validators.required],
      region: [data.region, Validators.required],
      resourcetype: [data.resourcetype, Validators.required],
      plantype: [data.plantype, Validators.required],
      unit: [data.unit, Validators.required],
      priceperunit: [data.priceperunit, Validators.required],
      image: [data.image],
      currency: [data.currency, Validators.required],
      version: [costObj.revise ? data.version + 1 : data.version],
      pricingmodel: [data.pricingmodel, Validators.required],
      status: ["Active"],
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
  }

  getNttInstance() {
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2INSTANCETYPELIST,
        {
          status: "Active",
        }
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          if (response.data && response.data.length > 0) {
            this.eclInstanceList = this.formArrayData(
              response.data,
              "instancetypename",
              "instancetypename"
            );
          } else {
            this.message.info("Server not found !");
          }
        } else {
          this.message.info(response.message);
        }
      });
  }
  getAwsInstance() {
    let response = {} as any;
    let query = {} as any;
    query = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsinstancetype(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.awsInstanceList = this.formArrayData(
            response.data,
            "instancetypename",
            "instancetypename"
          );
        } else {
          this.awsInstanceList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  // getAwsImageList() {
  //     let response = {} as any;
  //     let query = {} as any;
  //     query = {
  //         tenantid: this.userstoragedata.tenantid,
  //         status: AppConstant.STATUS.ACTIVE
  //     };
  //     this.awsService.allawsami(query).subscribe(data => {
  //         response = JSON.parse(data._body);
  //         if (response.status) {
  //             this.awsImageList = this.formArrayData(response.data, 'notes', 'aminame');
  //             this.awsImageList = _.uniqBy(this.awsImageList, 'value');
  //         } else {
  //             this.awsImageList = [];
  //         }
  //     }, err => {
  //         this.message.error('Sorry! Something gone wrong');
  //     });
  // }
  geteclImageList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2sami(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.eclImageList = this.formArrayData(
            response.data,
            "imagename",
            "imagename"
          );
          this.eclImageList = _.uniqBy(this.eclImageList, "value");
        } else {
          this.eclImageList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }

  getZone() {
    this.loading = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES,
        {
          status: "Active",
        }
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.eclZoneList = this.formArrayData(
              response.data,
              "region",
              "region"
            );
            this.eclZoneList = _.uniqBy(this.eclZoneList, "value");
          }
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
    this.loading = false;
  }
  getAwsZone() {
    this.loading = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
        {
          status: "Active",
        }
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.awsZoneList = [];
            this.awsZoneList = this.formArrayData(
              response.data,
              "zonename",
              "awszoneid"
            );
          }
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
    this.loading = false;
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
  getLookupLists() {
    let obj = { status: "Active" } as any;
    obj.keylist = [
      AppConstant.LOOKUPKEY.CURRENCY,
      AppConstant.LOOKUPKEY.PRICING_MODEL,
      AppConstant.LOOKUPKEY.ASSET_UNIT,
    ];
    this.commonService.allLookupValues(obj).subscribe(
      (data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.currencyList = response.data.filter(
            (x) => x.lookupkey == AppConstant.LOOKUPKEY.CURRENCY
          );
          this.unitList = response.data.filter(
            (x) => x.lookupkey == AppConstant.LOOKUPKEY.ASSET_UNIT
          );
          this.pricingList = response.data.filter(
            (x) => x.lookupkey == AppConstant.LOOKUPKEY.PRICING_MODEL
          );
          this.currencyList = this.formArrayData(
            this.currencyList,
            "keyvalue",
            "keyvalue"
          );
          this.unitList = this.formArrayData(
            this.unitList,
            "keyvalue",
            "keyvalue"
          );
          this.pricingList = this.formArrayData(
            this.pricingList,
            "keyname",
            "keyname"
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getProviderList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = this.formArrayData(
            response.data,
            "keyname",
            "keyvalue"
          );
          console.log(this.providerList);
        } else {
          this.providerList = [];
        }
      });
  }
  getPlanList(condition) {
    this.ecl2Service.allecl2lbplans(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.ecllbPlanList = this.formArrayData(
          response.data,
          "lbplanname",
          "lbplanname"
        );
      } else {
        this.ecllbPlanList = [];
      }
    });
  }
  getFirewallPlans(condition) {
    this.ecl2Service.allecl2firewallplans(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.eclfirewallplanList = this.formArrayData(
          response.data,
          "firewallplanname",
          "firewallplanname"
        );
      } else {
        this.eclfirewallplanList = [];
      }
    });
  }
  getQosOptions(condition) {
    this.ecl2Service.allecl2qosoptions(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.qosList = _.map(response.data, function (item: any) {
          item.qosoptionname =
            item.qosoptionname +
            ":(type=" +
            item.qostype +
            ",bandwidth=" +
            item.bandwidth +
            ")";
          return item;
        });
        this.qosList = this.formArrayData(
          this.qosList,
          "qosoptionname",
          "qosoptionname"
        );
      } else {
        this.qosList = [];
      }
    });
  }
  getVolumeSizeList() {
    const condition = {
      lookupkey: AppConstant.LOOKUPKEY.VOLUMESIZE,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.volumeSizeList = _.map(response.data, function (item: any) {
          item.keyname = item.keyname + " GB";
          return item;
        });
        this.volumeSizeList = this.formArrayData(
          this.volumeSizeList,
          "keyname",
          "keyname"
        );
      } else {
        this.volumeSizeList = [];
      }
    });
  }
  saveUpdateScript(data) {
    if (this.costForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.costForm,
        this.costErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      data.lastupdatedby = this.userstoragedata.fullname;
      data.lastupdateddt = new Date();
      if (data.costvisualid) {
        this.costService.update(data).subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            setTimeout(() => {
              this.message.info("Updated Succesfully");
              this.notifyTagEntry.emit(true);
            }, 1000);
          } else {
            this.message.info(response.message);
          }
        });
      } else {
        data.createdby = this.userstoragedata.fullname;
        data.createddt = new Date();
        if (!data.image) delete data["image"];
        delete data["costvisualid"];
        this.costService.create(data).subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            if (this.costList.revise)
              this.deleteCost(AppConstant.STATUS.INACTIVE);
            setTimeout(() => {
              this.message.info("Saved Succesfully");
              this.notifyTagEntry.emit(true);
            }, 1000);
          } else {
            this.message.info(response.message);
          }
        });
      }
    }
  }
  deleteCost(status?) {
    this.costService
      .update({
        costvisualid: this.costList.data.costvisualid,
        status: status ? status : AppConstant.STATUS.DELETED,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          console.log(response);
        } else {
          this.message.info(response.message);
        }
      });
  }
}
