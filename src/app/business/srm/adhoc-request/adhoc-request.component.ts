import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "../../../../app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CostSetupService } from "../../base/assets/costsetup/costsetup.service";
import { Ecl2Service } from "../../deployments/ecl2/ecl2-service";
import { AWSService } from "../../deployments/aws/aws-service";
import { CommonService } from "../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import { SrmService } from "../srm.service";
import { ResizeRequestService } from "../upgrade-request/resize.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-adhoc-request",
  templateUrl:
    "../../../presentation/web/srm/adhoc-request/adhoc-request.component.html",
})
export class AdhocRequestComponent implements OnInit, OnChanges {
  @Input() selectedInstance: any;
  @Input() recommendPlanId: any;
  @Input() upgradePlan: any;
  @Output() notifyAdhocEntry: EventEmitter<any> = new EventEmitter();
  newplan = null;
  newcost = null;
  notes: any = null;
  userstoragedata = {} as any;
  autoImplementation = false;
  reqday: any = {};
  maintenancewindow: any;
  btnText = "Update";
  weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  adhocResize = false;
  planList = [] as any[];
  mainWindowList = [] as any[];
  windowDays = [] as any[];

  resizing = false;

  constructor(
    private httpHandler: HttpHandlerService,
    private costSetupService: CostSetupService,
    private message: NzMessageService,
    private ecl2Service: Ecl2Service,
    private srmService: SrmService,
    private aWSService: AWSService,
    private localStorageService: LocalStorageService,
    private resizeService: ResizeRequestService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    let planId = null;
    console.log("Changes in adhoc req>>>>>>>>>>>>>>>>>", changes);
    if (changes && changes.recommendPlanId) {
      planId = changes.recommendPlanId.currentValue;
    }
    if (
      !_.isUndefined(changes.selectedInstance) &&
      !_.isEmpty(changes.selectedInstance.currentValue)
    ) {
      this.adhocResize = true;
      this.selectedInstance = changes.selectedInstance.currentValue;
      if (!this.selectedInstance.upgraderequestid) {
        this.btnText = "Save";
      }
    }
    if (
      !_.isUndefined(changes.upgradePlan) &&
      !_.isEmpty(changes.upgradePlan.currentValue)
    ) {
      this.upgradePlan = changes.upgradePlan.currentValue;
      this.newplan = this.upgradePlan;
    }
    this.getAllPlans(planId);
    this.getMainWindows();
  }
  onCancel() {
    this.adhocResize = false;
    this.notifyAdhocEntry.next(false);
  }
  getAllPlans(recommended?: string) {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.selectedInstance.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
      this.aWSService
        .allawsinstancetype(
          condition,
          `?costyn=${true}&region=${this.selectedInstance.region}`
        )
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.planList = response.data;
            if (this.upgradePlan) {
              this.upgradePlan = _.find(this.planList, {
                instancetypename: this.upgradePlan.plantype,
              });
              this.newplan = this.upgradePlan;
              this.newcost = this.commonService.calculateRecommendationPrice(
                this.upgradePlan.costvisual[0].pricingmodel,
                this.upgradePlan.costvisual[0].priceperunit,
                this.upgradePlan.costvisual[0].currency,
                false
              );
            }
          } else {
            this.planList = [];
          }
        });
    }
    if (this.selectedInstance.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.ecl2Service
        .allecl2InstanceType(
          condition,
          `?costyn=${true}&region=${this.selectedInstance.region}`
        )
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            console.log(response.data);
            this.planList = response.data as any[];
            if (this.upgradePlan) {
              this.upgradePlan = _.find(this.planList, {
                instancetypename: this.upgradePlan.plantype,
              });
              this.newplan = this.upgradePlan;
              this.newcost = this.commonService.calculateRecommendationPrice(
                this.upgradePlan.costvisual[0].pricingmodel,
                this.upgradePlan.costvisual[0].priceperunit,
                this.upgradePlan.costvisual[0].currency,
                false
              );
            }
            if (recommended) {
              this.newplan = this.planList.find(
                (o) => o["instancetypename"] == recommended
              );
              console.log(
                "Recommended >>>>>>>>>>>",
                this.planList.find((o) => o["instancetypename"] == recommended)
              );
            }
          } else {
            this.planList = [];
          }
        });
    }
  }

  getMainWindows() {
    let condition = {} as any;
    condition = {
      cloudprovider: this.selectedInstance.cloudprovider,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.srmService.allMaintwindows(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.mainWindowList = response.data;
      } else {
        this.mainWindowList = [];
      }
    });
  }

  windowChanged(event) {
    this.windowDays = [];
    if (event) {
      let mWindow = _.find(this.mainWindowList, {
        maintwindowid: event.maintwindowid,
      });
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
  update() {
    if (this.selectedInstance.upgraderequestid) {
      let obj: any = {
        upgraderequestid: this.selectedInstance.upgraderequestid,
        autoimplementation: "Y",
        maintwindowid: this.maintenancewindow.maintwindowid,
        implstartdt: this.maintenancewindow.startdate,
        implenddt: this.maintenancewindow.enddate,
        requestday: this.reqday.requestday,
        reqstarttime: this.reqday.reqstarttime,
        reqendtime: this.reqday.reqendtime,
        lastupdatedby: _.isEmpty(this.userstoragedata)
          ? ""
          : this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      this.resizeService.updateRequest(obj).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
            this.notifyAdhocEntry.next(true);
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to update resize request. Try again");
        }
      );
    } else {
      if (this.autoImplementation) {
        if (this.maintenancewindow && this.reqday) {
          // let servicerequest: any = {};
          let formdata = {
            tenantid: this.userstoragedata.tenantid,
            customerid: this.selectedInstance.customerid,
            cloudprovider: this.selectedInstance.cloudprovider,
            resourcetype: "ASSET_INSTANCE",
            resourceid: this.selectedInstance.instanceid,
            resourcerefid: this.selectedInstance.instancerefid,
            currplantype: this.selectedInstance.currentplanid,
            upgradeplantype: this.newplan.costvisual[0].costvisualid,
            maintwindowid: this.maintenancewindow.maintwindowid,
            requestday: this.reqday.requestday,
            reqstarttime: this.reqday.reqstarttime,
            reqendtime: this.reqday.reqendtime,
            restartreq: "Y",
            autoimplementation: "Y",
            implstartdt: this.maintenancewindow.startdate,
            implenddt: this.maintenancewindow.enddate,
            reqstatus: "Pending",
            // "notes": this.notes,
            status: AppConstant.STATUS.ACTIVE,
            createdby: this.userstoragedata.fullname,
            createddt: new Date(),
            lastupdatedby: this.userstoragedata.fullname,
            lastupdateddt: new Date(),
          };
          // servicerequest.userid = this.userstoragedata.userid;
          // servicerequest.tenantid = this.userstoragedata.tenantid;
          // servicerequest.requesttype = 'Resize';
          // servicerequest.reqstatus = AppConstant.STATUS.PENDING;
          // servicerequest.clientid = this.selectedInstance.customerid;
          // servicerequest.createdby = this.userstoragedata.fullname;
          // servicerequest.createddt = new Date();
          // servicerequest.requestdate = new Date();
          // servicerequest.srstatus = AppConstant.STATUS.PENDING;
          // servicerequest.lastupdatedby = this.userstoragedata.fullname;
          // servicerequest.lastupdateddt = new Date();
          // servicerequest.subject = 'VM Resize Approval Request';
          // servicerequest.description = 'VM Resize Approval Request';

          this.resizeService.createRequest(formdata).subscribe(
            (result) => {
              let response = JSON.parse(result._body);
              if (response.status) {
                this.message.success(response.message);
                this.notifyAdhocEntry.next(true);
              } else {
                this.message.error(response.message);
              }
            },
            (err) => {
              this.message.error("Unable to update resize request. Try again");
            }
          );
        } else {
          this.message.error(
            "Please select maintenance window and day of the week"
          );
        }
      }
    }
  }
  adhocResizeRequest(formData) {
    let endpoint = "" as any;
    this.resizing = true;
    if (this.selectedInstance.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
      endpoint = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.ECL2INSTANCERESIZE;
    } else if (
      this.selectedInstance.cloudprovider == AppConstant.CLOUDPROVIDER.AWS
    ) {
      endpoint = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.AWSINSTANCERESIZE;
    }
    console.log(formData, endpoint);
    this.httpHandler
      .POST(AppConstant.API_END_POINT + endpoint, formData)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        this.message.info(response.message);
        this.notifyAdhocEntry.next(true);
        this.resizing = false;
      });
  }
  getCostPlans() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      region: this.selectedInstance.region,
      plantypes: [this.selectedInstance.currentplan, this.newplan.name],
    };
    this.costSetupService.all(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        const currentplantype = _.find(response.data, {
          plantype: this.selectedInstance.currentplan,
        });
        const newplantype = _.find(response.data, {
          plantype: this.newplan.name,
        });
        // this.beforeSave(currentplantype, newplantype);
      }
    });
  }
  beforeSave() {
    let formData = [] as any;
    let obj = {} as any;
    obj.region = this.selectedInstance.region;
    obj.tenantid = this.selectedInstance.tenantid;
    obj.instanceid = this.selectedInstance.instanceid;
    obj.instancename = this.selectedInstance.instancename;
    obj.instancerefid = this.selectedInstance.instancerefid;
    obj.resourcerefid = this.selectedInstance.instancerefid;
    obj.customerid = this.selectedInstance.customerid;
    obj.ecl2tenantid = this.selectedInstance.customer.ecl2tenantid;
    obj.instancetype = this.newplan.costvisual[0].plantype;
    // obj.upgraderequestid = this.newplan.upgradeplantype;
    // obj.srvrequestid = data.srvrequestid;
    obj.currplantype = this.selectedInstance.costvisual[0].costvisualid;
    obj.upgradeplantype = this.newplan.costvisual[0].costvisualid;
    obj.revert = true;
    formData.push(obj);
    console.log(formData);
    this.adhocResizeRequest(formData);
  }
  onPlanChanges(event) {
    this.newcost = this.commonService.calculateRecommendationPrice(
      event.costvisual[0].pricingmodel,
      event.costvisual[0].priceperunit,
      event.costvisual[0].currency,
      false
    );
    // this.newcost = event.costvisual[0].currency + ' ' + event.costvisual[0].currency;
    console.log(event);
    console.log(this.newcost);
  }
}
