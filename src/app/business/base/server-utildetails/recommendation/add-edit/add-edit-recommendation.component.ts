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
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../../app.constant";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { CostSetupService } from "../../../../base/assets/costsetup/costsetup.service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { Ecl2Service } from "src/app/business/deployments/ecl2/ecl2-service";
import { RecommendationService } from "../recommendation.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Component({
  selector: "app-add-edit-recommendation",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/recommendation/add-edit/recommendation-add-edit.component.html",
})
export class AddEditRecommendationComponent implements OnInit {
  @Input() predictionObj: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  predictionForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  predictionErrObj = {
    cloudprovider: {
      required: "Please Select CloudProvider",
    },
    resourcetype: {
      required: "Please Select Resource Type",
    },
    plantype: {
      required: "Please Select Plan type",
    },
    platform: {
      required: "Please Select platform",
    },
    cpuutilmin: {
      required: "Please Enter Minimum CPU Utilization",
      minlength: "Minimum CPU Utilization should be atleast 1",
      maxlength: "Maximum CPU Utilization should be below 100",
    },
    cpuutilmax: {
      required: "Please Enter Maximum CPU Utilization",
      minlength: "Minimum CPU Utilization should be atleast 1",
      maxlength: "Maximum CPU Utilization should be below 100",
    },
    memutilmin: {
      required: "Please Enter Minimum Memory Utilization",
      minlength: "Minimum Memory Utilization should be atleast 1",
      maxlength: "Maximum Memory Utilization should be below 100",
    },
    memutilmax: {
      required: "Please Enter Maximum Memory Utilization",
      minlength: "Minimum Memory Utilization should be atleast 1",
      maxlength: "Maximum Memory Utilization should be below 100",
    },
    // discutilmin: {
    //     required: 'Please Enter Minimum Disk Utilization',
    //     minlength: 'Minimum Disk Utilization should be atleast 1',
    //     maxlength: 'Maximum Disk Utilization should be below 100'
    // },
    // discutilmax: {
    //     required: 'Please Enter Maximum Disk Utilization',
    //     minlength: 'Minimum Disk Utilization should be atleast 1',
    //     maxlength: 'Maximum Disk Utilization should be below 100'
    // },
    // netutilmin: {
    //     required: 'Please Enter Minimum Network Utilization',
    //     minlength: 'Minimum Network Utilization should be atleast 1',
    //     maxlength: 'Maximum Network Utilization should be below 100'
    // },
    // netutilmax: {
    //     required: 'Please Enter Maximum Network Utilization',
    //     minlength: 'Minimum Network Utilization should be atleast 1',
    //     maxlength: 'Maximum Network Utilization should be below 100'
    // },
    // duration: {
    //     required: 'Please Select Duration'
    // },
    recommendationone: {
      required: "Please Enter Recommendation Plan",
    },
  };
  disabled = false;
  editDisabled = false;
  loading = false;
  state = true;
  costVisualList = [];
  assetTypes = [] as any;
  instanceList = [] as any;
  regionList = [] as any;
  priceTypeList = [
    { label: "On Demand", value: "OnDemand" },
    { label: "Reserved", value: "Reserved" },
  ] as any;

  platformsList = [] as any;

  cloudproviderList = [];
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private commonService: CommonService,
    private ecl2Service: Ecl2Service,
    private predictionService: RecommendationService,
    private awsService: AWSService,
    private costService: CostSetupService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getproviderList();
  }
  clearForm() {
    this.predictionForm = this.fb.group({
      cloudprovider: [null, Validators.compose([Validators.required])],
      resourcetype: ["ASSET_INSTANCE", Validators.required],
      plantype: [null, Validators.required],
      // platform: [null, Validators.required],
      cpuutilmin: [null, Validators.required],
      cpuutilmax: [null, Validators.required],
      memutilmin: [null, Validators.required],
      memutilmax: [null, Validators.required],
      discutilmin: [null],
      region: [null],
      pricetype: [null],
      discutilmax: [null],
      netutilmin: [null],
      netutilmax: [null],
      // duration: [null, Validators.required],
      recommendationone: [null, Validators.required],
      recommendationtwo: [null],
      recommendationthree: [null],
      status: [AppConstant.STATUS.ACTIVE, Validators.required],
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
      restartyn: [true],
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
    this.predictionObj = {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (
      !_.isUndefined(changes.predictionObj) &&
      !_.isEmpty(changes.predictionObj.currentValue)
    ) {
      let data = changes.predictionObj.currentValue;
      if (data.editDisabled) this.editDisabled = true;
      data["restartyn"] =
        data["restartyn"] && data["restartyn"] == "Y" ? true : false;
      this.predictionObj = data;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.predictionObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  generateEditForm(data) {
    this.providerChanges(data.cloudprovider);
    this.imageChange(data);
    this.getAWSInstanceTypes(data);
    this.predictionForm = this.fb.group({
      cloudprovider: [
        data.cloudprovider,
        Validators.compose([Validators.required]),
      ],
      recommendationid: [data.recommendationid],
      resourcetype: [data.resourcetype, Validators.required],
      plantype: [data.plantype, Validators.required],
      // platform: [data.platform, Validators.required],
      region: [data.region, Validators.required],
      pricetype: [data.pricetype, Validators.required],
      cpuutilmin: [parseFloat(data.cpuutilmin), Validators.required],
      cpuutilmax: [parseFloat(data.cpuutilmax), Validators.required],
      memutilmin: [parseFloat(data.memutilmin), Validators.required],
      memutilmax: [parseFloat(data.memutilmax), Validators.required],
      // discutilmin: [parseFloat(data.discutilmin)],
      // discutilmax: [parseFloat(data.discutilmax)],
      // netutilmin: [parseFloat(data.netutilmin)],
      // netutilmax: [parseFloat(data.netutilmax)],
      // duration: [data.duration, Validators.required],
      recommendationone: [data.recommendationone, Validators.required],
      recommendationtwo: [data.recommendationtwo],
      recommendationthree: [data.recommendationthree],
      status: [data.status, Validators.required],
      createdby: data.createdby,
      createddt: data.createddt,
      restartyn: data.restartyn,
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
  }
  getproviderList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.cloudproviderList = response.data;
      } else {
        this.loading = false;
        this.cloudproviderList = [];
      }
    });
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
            this.regionList = this.formArrayData(
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

  saveUpdate(data) {
    this.loading = true;
    //  this.disabled = true;
    let errorMessage: any;

    data["restartyn"] = data["restartyn"] ? "Y" : "N";

    let statusData = this.findDuplicate(data);
    if (this.predictionForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.predictionForm,
        this.predictionErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      this.loading = false;
      return false;
    } else if (statusData.status == false) {
      this.message.error(statusData.message);
      this.loading = false;
      return false;
    } else {
      for (var propName in data) {
        if (!data[propName]) {
          delete data[propName];
        }
      }
      data.recommendationone = parseFloat(data.recommendationone);
      data.recommendationtwo
        ? (data.recommendationtwo = parseFloat(data.recommendationtwo))
        : delete data["recommendationtwo"];
      data.recommendationthree
        ? (data.recommendationthree = parseFloat(data.recommendationthree))
        : delete data["recommendationthree"];
      data.plantype = parseFloat(data.plantype);
      if (data.recommendationid) {
        this.predictionService.update(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.notifyEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add script group. Try again");
          }
        );
      } else {
        this.predictionService.create(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.notifyEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add script group. Try again");
          }
        );
      }
    }
  }
  findDuplicate(formData) {
    let data = formData;
    for (var propName in data) {
      if (!data[propName]) {
        delete data[propName];
      }
    }
    let msg;
    if (data.cpuutilmin >= data.cpuutilmax) {
      msg = "Minimum CPU utilization should be less than maximum utilization";
      return { status: false, message: msg };
    } else if (data.memutilmin >= data.memutilmax) {
      msg =
        "Minimum Memory utilization should be less than maximum utilization";
      return { status: false, message: msg };
    }
    //  else if (data.discutilmin >= data.discutilmax) {
    //     msg = 'Minimum Disk utilization should be less than maximum utilization'
    //     return { status: false, message: msg }
    // } else if (data.netutilmin >= data.netutilmax) {
    //     msg = 'Minimum Network utilization should be less than maximum utilization'
    //     return { status: false, message: msg }
    // }
    else if (
      data.plantype == data.recommendationone ||
      data.plantype == data.recommendationtwo ||
      data.plantype == data.recommendationthree
    ) {
      msg = "Recommentation should not be same as Plantype";
      return { status: false, message: msg };
    }
    // else if (data.recommendationone == data.recommendationtwo || data.recommendationone == data.recommendationthree || data.recommendationtwo == data.recommendationthree) {
    //     msg = 'Duplicate recommendation exist'
    //     return { status: false, message: msg }
    // }
    else {
      return { status: true };
    }
  }
  getAWSInstanceTypes(data) {
    if (data.region && data.pricetype) {
      this.loading = true;
      let condition = {} as any;
      condition = {
        status: AppConstant.STATUS.ACTIVE,
        cloudprovider: data.cloudprovider,
        region: data.region,
        pricetype: data.pricetype,
      };
      this.costService.all(condition).subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.loading = false;
          this.costVisualList = this.formArrayData(
            response.data,
            "plantype",
            "costvisualid"
          );
        } else {
          this.loading = false;
          this.costVisualList = [];
        }
      });
    }
  }
  imageChange(data) {
    console.log(data);
    if (data.cloudprovider == "AWS") {
      this.getAwsZone();
    }
    if (data.cloudprovider == "ECL2") {
      this.ecl2Service.allecl2InstanceType({ status: "Active" }).subscribe(
        (data) => {
          let response = JSON.parse(data._body);
          if (response.status) {
            this.loading = false;
            console.log("ECL2 DATA:::::::::::::::::::::::::::");
            console.log(
              this.formArrayData(
                response.data,
                "instancetypename",
                "instancetypeid"
              )
            );
            this.costVisualList = this.formArrayData(
              response.data,
              "instancetypename",
              "instancetypeid"
            );
          } else {
            this.loading = false;
            this.costVisualList = [];
          }
        },
        (err) => {
          this.loading = false;
          this.message.error("Sorry! Something gone wrong");
        }
      );
    }
  }
  providerChanges(provider) {
    this.clearForm();
    this.predictionForm.get("cloudprovider").setValue(provider);
    this.predictionForm.get("region").clearValidators();
    this.predictionForm.get("pricetype").clearValidators();
    this.predictionForm.updateValueAndValidity();
    if (provider == "ECL2") {
      // this.getNttInstance();
      this.assetTypes = [
        { title: "Server", value: "ASSET_INSTANCE" },
        // { title: "Network", value: "ASSET_NETWORK" },
        // { title: "Load Balancer", value: "ASSET_LB" },
        // { title: "Firewall", value: "ASSET_FIREWALL" },
        // // { title: "Internet Gateway", value: "ASSET_IG" },
        // // { title: "CFG", value: "ASSET_CFG" },
        // { title: "Volume", value: "ASSET_VOLUME" },
      ];
    } else if (provider == "AWS") {
      this.predictionForm.get("region").setValidators(Validators.required);
      this.predictionForm.get("pricetype").setValidators(Validators.required);
      this.predictionForm.updateValueAndValidity();
      // this.getAwsImageList();
      this.assetTypes = [
        { title: "Server", value: "ASSET_INSTANCE" },
        // { title: "VPC", value: "ASSET_VPC" },
        // { title: "Subnet", value: "ASSET_SUBNET" },
        // { title: "Security Group", value: "ASSET_SECURITYGROUP" },
        // { title: "Load Balancer", value: "ASSET_LB" },
        // { title: "Volume", value: "ASSET_VOLUME" },
      ];
    }
  }

  getNttInstance() {
    this.loading = true;
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2sami(query, true).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.loading = false;
          this.instanceList = this.formArrayData(
            response.data,
            "platform",
            "platform"
          );
          this.instanceList = _.uniqBy(this.instanceList, "value");
        } else {
          this.loading = false;
          this.instanceList = [];
        }
      },
      (err) => {
        this.loading = false;
        this.message.error("Sorry! Something gone wrong");
      }
    );
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
  getAwsImageList() {
    this.loading = true;
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsami(query, true).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.loading = false;
          this.instanceList = this.formArrayData(
            response.data,
            "platform",
            "platform"
          );
          this.instanceList = _.uniqBy(this.instanceList, "value");
          console.log("INSTANCE LIST::::::::::::::::::::");
          console.log(this.instanceList);
          console.log(this.predictionForm.value);
        } else {
          this.loading = false;
          this.instanceList = [];
        }
      },
      (err) => {
        this.loading = false;
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
}
