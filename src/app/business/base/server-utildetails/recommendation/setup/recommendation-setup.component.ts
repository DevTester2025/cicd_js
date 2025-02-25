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
import { RecommendationSetupService } from "./recommendation-setup.service";
import { Ecl2Service } from "src/app/business/deployments/ecl2/ecl2-service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Component({
  selector: "app-recommendation-setup",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/recommendation/setup/recommendation-setup.component.html",
})
export class SetupRecommendationComponent implements OnInit {
  @Input() predictionObj: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  predictionForm: FormGroup;
  userstoragedata = {} as any;
  regionList = [] as any;
  priceTypeList = [
    { label: "On Demand", value: "OnDemand" },
    { label: "Reserved", value: "Reserved" },
  ] as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  predictionErrObj = {
    cloudprovider: {
      required: "Please Select CloudProvider",
    },
    notes: { required: "Please enter notes" },
    action: { required: "Please select action" },
    platform: {
      required: "Please Select platform",
    },
    region: {
      required: "Please Select region",
    },
    pricetype: {
      required: "Please Select pricetype",
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
  };
  disabled = false;
  editDisabled = false;
  loading = false;
  state = true;

  platformsList = [] as any;
  instanceList = [] as any;

  cloudproviderList = [];
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private ecl2Service: Ecl2Service,
    private awsService: AWSService,
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private predictionService: RecommendationSetupService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.clearForm();
  }

  ngOnInit() {
    this.getproviderList();
  }
  clearForm() {
    this.predictionForm = this.fb.group({
      cloudprovider: [null, Validators.compose([Validators.required])],
      // platform: [null, Validators.required],
      cpuutilmin: [null, Validators.required],
      cpuutilmax: [null, Validators.required],
      memutilmin: [null, Validators.required],
      region: [null],
      pricetype: [null],
      memutilmax: [null, Validators.required],
      action: [null, Validators.required],
      notes: [null, Validators.required],
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
    this.predictionForm = this.fb.group({
      cloudprovider: [
        data.cloudprovider,
        Validators.compose([Validators.required]),
      ],
      recommendsetupid: [data.recommendsetupid],
      // platform: [data.platform, Validators.required],
      cpuutilmin: [parseFloat(data.cpuutilmin), Validators.required],
      cpuutilmax: [parseFloat(data.cpuutilmax), Validators.required],
      memutilmin: [parseFloat(data.memutilmin), Validators.required],
      memutilmax: [parseFloat(data.memutilmax), Validators.required],
      region: [data.region, Validators.required],
      pricetype: [data.pricetype, Validators.required],
      notes: [data.notes, Validators.required],
      action: [data.action, Validators.required],
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
  saveUpdate(data: any) {
    this.loading = true;
    //  this.disabled = true;
    let errorMessage: any;
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
    } else {
      for (var propName in data) {
        if (!data[propName]) {
          delete data[propName];
        }
      }
      if (data.recommendsetupid) {
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
            this.message.error("Unable to add recommendation. Try again");
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
            this.message.error("Unable to add recommendation. Try again");
          }
        );
      }
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
  providerChanges(provider) {
    this.clearForm();
    this.predictionForm.get("cloudprovider").setValue(provider);
    this.predictionForm.get("region").clearValidators();
    this.predictionForm.get("pricetype").clearValidators();
    this.predictionForm.updateValueAndValidity();
    if (provider == "ECL2") {
      // this.getNttInstance();
    } else if (provider == "AWS") {
      this.getAwsZone();
      this.predictionForm.get("region").setValidators(Validators.required);
      this.predictionForm.get("pricetype").setValidators(Validators.required);
      this.predictionForm.updateValueAndValidity();
      // this.getAwsImageList();
    }
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
}
