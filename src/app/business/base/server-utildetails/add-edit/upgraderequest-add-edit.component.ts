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
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { ResizeRequestService } from "src/app/business/srm/upgrade-request/resize.service";
import { SrmService } from "src/app/business/srm/srm.service";
import * as moment from "moment";
import { Ecl2Service } from "src/app/business/deployments/ecl2/ecl2-service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { CostSetupService } from "../../assets/costsetup/costsetup.service";

@Component({
  selector: "app-cloudmatiq-upgraderequest-add-edit",
  templateUrl:
    "../../../../presentation/web/base/server-utildetails/add-edit/upgraderequest-add-edit.component.html",
})
export class UpgradeRequestAddEditComponent implements OnInit, OnChanges {
  @Input() scriptObj: any;
  @Output() notifyScriptEntry: EventEmitter<any> = new EventEmitter();
  scriptForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SUBMIT;
  scriptErrObj = AppConstant.VALIDATIONS.ECL2.RESIZE;
  disabled = false;
  loading = false;
  weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  windowDays: any = [];
  state = true;
  autoimpl = false;
  mainWindowList = [];
  planList = [];
  showComponents = false;
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private ecl2Service: Ecl2Service,
    private costService: CostSetupService,
    private aWSService: AWSService,
    private resizeService: ResizeRequestService,
    private srmService: SrmService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getMainWindows();
  }
  clearForm() {
    this.scriptForm = this.fb.group({
      maintwindowid: [null, Validators.required],
      weekdays: [null, Validators.required],
      newplan: [null, Validators.required],
      currentplan: [null],
      duration: [],
      state: [true],
      autoimpl: [false],
      commandblock: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: ["Active"],
    });
    this.scriptObj = {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (
      !_.isUndefined(changes.scriptObj) &&
      !_.isEmpty(changes.scriptObj.currentValue)
    ) {
      this.scriptObj = changes.scriptObj.currentValue;
      console.log(this.scriptObj);
      this.getAllPlans();
      this.buttonText = AppConstant.BUTTONLABELS.SUBMIT;
      this.generateEditForm(this.scriptObj);
    } else {
      this.clearForm();
      this.buttonText = "Submit";
    }
  }
  generateEditForm(data) {
    this.scriptForm = this.fb.group({
      maintwindowid: [null, Validators.required],
      weekdays: [null, Validators.required],
      newplan: [null, Validators.required],
      currentplan: [data.instancetyperefid],
      commandblock: [
        data.commandblock,
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      duration: [],
      state: [true],
      autoimpl: [false],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [data.status],
    });
  }

  getAllPlans() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.scriptObj.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
      condition.region = this.scriptObj.region;
      condition.pricetype = this.scriptObj.lifecycle;
      condition.cloudprovider = this.scriptObj.cloudprovider;
      this.costService.all(condition).subscribe((data) => {
        let cost = JSON.parse(data._body);
        this.planList = cost.data;
        this.planList.forEach((element) => {
          element.instancetypename = element.plantype;
        });
        let upgradeplan = _.find(this.planList, {
          plantype: this.scriptObj.name,
        });
        this.scriptForm.get("newplan").setValue(upgradeplan);
      });
    }
    if (this.scriptObj.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.ecl2Service
        .allecl2InstanceType(
          condition,
          `?costyn=${true}&region=${this.scriptObj.region}`
        )
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            console.log(response.data);
            this.planList = response.data;
            let upgradeplan = _.find(this.planList, {
              instancetypename: this.scriptObj.name,
            });
            this.scriptForm.get("newplan").setValue(upgradeplan);
          } else {
            this.planList = [];
          }
        });
    }
  }

  saveUpdateScript(data) {
    this.loading = true;
    //  this.disabled = true;
    let errorMessage: any;
    if (this.scriptForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.scriptForm,
        this.scriptErrObj
      );
      this.loading = false;
      this.message.error(errorMessage);
      return false;
    } else {
      let formdata = {
        tenantid: this.userstoragedata.tenantid,
        customerid: this.scriptObj.customerid,
        cloudprovider: this.scriptObj.cloudprovider,
        resourcetype: this.scriptObj.resourcetype,
        resourceid: this.scriptObj.resourceid,
        resourcerefid: this.scriptObj.resourcerefid,
        currplantype: this.scriptObj.currplantype,
        upgradeplantype:
          this.scriptObj.cloudprovider == "AWS"
            ? data.newplan.costvisualid
            : data.newplan.costvisual[0].costvisualid,
        maintwindowid: data.maintwindowid,
        requestday: data.weekdays ? data.weekdays.requestday : null,
        reqstarttime: data.weekdays ? data.weekdays.reqstarttime : null,
        reqendtime: data.weekdays ? data.weekdays.reqendtime : null,
        restartreq: data.state ? "Y" : "N",
        autoimplementation: data.autoimpl ? "Y" : "N",
        implstartdt:
          null != data.duration && data.duration.length > 0
            ? data.duration[0]
            : undefined,
        implenddt:
          null != data.duration && data.duration.length > 0
            ? data.duration[1]
            : undefined,
        reqstatus: "Pending",
        notes: data.notes,
        status: AppConstant.STATUS.ACTIVE,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      this.resizeService.createRequest(formdata).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.loading = false;
            this.disabled = false;
            this.notifyScriptEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to add script group. Try again");
        }
      );
    }
  }
  windowChanged(event) {
    this.windowDays = [];
    if (event) {
      let mWindow = _.find(this.mainWindowList, { maintwindowid: event });
      if (mWindow) {
        this.weekDays.forEach((element) => {
          let mWindowObj = mWindow[element.toLowerCase()];
          if (mWindowObj) {
            let obj = {
              label: `${element} - ${mWindowObj.start} to ${mWindowObj.end}`,
              value: {
                requestday: element,
                reqstarttime: mWindowObj.start,
                reqendtime: mWindowObj.end,
              },
            };
            this.windowDays.push(obj);
          }
        });
        console.log(this.windowDays);
      }
    } else {
    }
  }
  getMainWindows() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.srmService.allMaintwindows(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.mainWindowList = _.map(response.data, function (item) {
          item.duration =
            moment(item.startdate).format("DD-MMM-YYYY HH:mm") +
            " / " +
            moment(item.enddate).format("DD-MMM-YYYY HH:mm");
          return item;
        });
      } else {
        this.mainWindowList = [];
      }
    });
  }
  onSelectRestartReq(value: any) {
    if (value) {
      this.showComponents = false;
      this.scriptForm.controls["duration"].setValue(null);
      this.scriptForm.updateValueAndValidity();
    } else {
      this.showComponents = true;
      this.scriptForm.controls["maintwindowid"].setValue(-1);
      this.scriptForm.controls["weekdays"].setValue(null);
      this.scriptForm.updateValueAndValidity();
    }
  }
}
