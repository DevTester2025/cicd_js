import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { SrmService } from "../../srm.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import * as moment from "moment";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { ServerUtilsService } from "src/app/business/base/server-utildetails/services/server-utils.service";

@Component({
  selector: "app-srm-resize-request-view",
  templateUrl:
    "../../../../presentation/web/srm/upgrade-request/view/resize-request-view.component.html",
})
export class ResizeRequestViewComponent implements OnInit {
  userstoragedata = {} as any;
  serviceObj = {} as any;
  requestList = [] as any;
  requestPanels = [] as any;
  requestid: number;
  upgradePlan: number;
  resizeObj: any = {};
  previewTitle = "";
  previewVisible = false;
  previewImage: any;
  formTitle = "Resource Utilization Chart";
  loading = true;
  catalogdownload = false;
  confirmationWindow = false;
  selectedInstance: any = {};
  isVisible = false;
  showDetailedChart = false;
  isApprover = false;
  isApproved = false;
  srmactions: any;
  notes = "";
  currentConfigs = {} as any;
  utilizationDetailConfigs = {} as any;
  rolename: any;
  approverData = {} as any;
  approverChain = [];
  pricingModel = [];
  panelName = AppConstant.VALIDATIONS.DEPLOYMENT.NOTES;
  panels = [
    {
      active: true,
      disabled: false,
      name: AppConstant.VALIDATIONS.DEPLOYMENT.NOTES,
    },
  ];
  notesList = [];
  columns = [
    { name: "Request Day", value: "requestday" },
    { name: "Resize Plan", value: "plantype" },
    { name: "Start Time", value: "reqstarttime" },
    { name: "End Time", value: "reqendtime" },
  ];
  solutionObj: any = {};
  constructor(
    private router: Router,
    private srmService: SrmService,
    private routes: ActivatedRoute,
    private commonService: CommonService,
    private httpService: HttpHandlerService,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private serverUtilsService: ServerUtilsService
  ) {
    this.getPricing();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.rolename = this.userstoragedata.roles.rolename;
    this.onCollapse(true);
  }

  ngOnInit() {}

  getRequestDetails() {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.requestid = params.id;
        this.getServiceDetails(this.requestid);
      }
    });
    this.getServiceActions(this.requestid);
  }

  getServiceActions(id) {
    this.srmService
      .allSrmActions({ srvrequestid: Number(id) })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.notesList = response.data;
        } else {
          this.notesList = [];
        }
      });
  }
  onCollapse(event) {
    if (event) {
      this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.HIDE;
    } else {
      this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.NOTES;
    }
  }
  selectUpgrade(data) {
    console.log(data);
    this.selectedInstance = data;
    this.selectedInstance.tenantname = data.tenant.tenantname;
    this.selectedInstance.instancename = data.instance.instancename;
    this.selectedInstance.currentplanccy = data.currentplan.currency;
    this.selectedInstance.region = data.instance.region;
    this.selectedInstance.currentplanid = data.currentplan.currplantype;
    this.selectedInstance.currentplancost = data.currentplan.cost;
    this.selectedInstance.currentplan = data.currentplan.plantype;
    this.upgradePlan = data.upgradeplan;
    this.confirmationWindow = true;
  }
  getServiceDetails(id) {
    this.srmService.byId(id).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.serviceObj = response.data;
        if (this.serviceObj.schedulerequest) {
          this.serviceObj.schedulerequest.forEach((element, i) => {
            let obj = {} as any;
            element.requestdetails.forEach((data) => {
              data.plantype = data.upgradeplan
                ? data.upgradeplan.plantype
                : null;
              return data;
            });
            obj.active = i == 0 ? true : false;
            obj.name = element.instance
              ? element.instance.instancename
              : "instance" + i + 1;
            obj.data = element.requestdetails;
            obj.columns = this.columns;
            this.requestPanels.push(obj);
          });
        }
        this.requestList = response.data.resizerequest;
        this.calculateResourceCost(this.requestList);
        this.srmactions = response.data.srmsractions;
        this.readyToDeploy();
        this.readyToResize();
        if (response.data && response.data.srmsractions) {
          this.approverChain = _.filter(
            response.data.srmsractions,
            function (item) {
              // if (item.touserid != null) {
              return item;
              // }
            }
          );
        }
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }
  onPreview(file, title) {
    this.previewTitle = title;
    this.previewVisible = true;
    this.previewImage = file;
  }
  close() {
    const url = this.routes.snapshot.queryParams.url;
    switch (url) {
      case "notification":
        this.router.navigate(["srm/notification"]);
        break;
      case "inbox":
        this.router.navigate(["srm/inbox"]);
        break;
      default:
        this.router.navigate(["srm/list"]);
    }
  }
  approve(notes) {
    let formData = {} as any;
    this.loading = true;
    formData.srmsractions = [this.approverData];
    formData.srmsractions[0].notes = notes;
    formData.srmsractions[0].apprvstatus = "Approved";
    formData.srmsractions[0].lastupdateddt = new Date();
    formData.srmsractions[0].lastupdatedby = this.userstoragedata.fullname;
    formData.srmsractions[0].touserid = this.userstoragedata.userid;
    if (this.requestList && this.approverChain.length > 0) {
      let dividendPercent = 80 / Number(this.approverChain.length);
      formData.progresspercent =
        this.serviceObj.progresspercent + dividendPercent;
      formData.srstatus = AppConstant.STATUS.WIP;
    }
    formData.srvrequestid = this.serviceObj.srvrequestid;
    formData.lastupdatedby = this.userstoragedata.fullname;
    formData.lastupdateddt = new Date();
    this.srmService.updateService(formData).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.messageService.success(response.message);
        this.loading = false;
        this.router.navigate(["/srm/inbox"]);
      } else {
        this.loading = false;
        this.messageService.error(response.message);
      }
    });
  }
  readyToDeploy() {
    console.log("USER DATA::::::::::::::::::::", this.userstoragedata);
    this.approverData = _.find(this.serviceObj.srmsractions, {
      touserid: this.userstoragedata.userid,
    });
    if (
      this.approverData != undefined &&
      this.approverData.apprvstatus == AppConstant.STATUS.PENDING
    ) {
      console.log("Service obj:::::::::::::::", this.approverData);
      if (this.approverData.approverlevel != 1) {
        let prevapprover = {} as any;
        prevapprover = _.find(this.serviceObj.srmsractions, {
          approverlevel: Number(this.approverData.approverlevel - 1),
        });
        if (
          prevapprover != undefined &&
          prevapprover.apprvstatus == "Approved"
        ) {
          this.isApprover = true;
        }
      } else {
        this.isApprover = true;
      }
    }
  }

  onDetailedChanged(e) {
    this.showDetailedChart = false;
  }
  notifyResizeEntry(event) {
    console.log(event);
    if (event == true) {
      this.router.navigate(["/srm/inbox"]);
    }
    this.confirmationWindow = false;
  }
  notifyDetailEntry(event) {
    this.currentConfigs = this.serverUtilsService.getItems();
    if (this.currentConfigs) {
      this.utilizationDetailConfigs = {
        utiltype: this.currentConfigs.utiltype,
        utilkey: this.currentConfigs.utilkey,
        instanceid: this.currentConfigs.instanceid,
        date: this.currentConfigs.date,
        tenantid: this.currentConfigs.tenantid,
        utilkeyTitle: this.currentConfigs.utilkeyTitle,
      };
    }
    this.showDetailedChart = true;
  }
  onChanged(val) {
    this.isVisible = val;
  }

  readyToResize() {
    let nonapprovalData = {} as any;
    nonapprovalData = _.find(this.serviceObj.srmsractions, {
      apprvstatus: AppConstant.STATUS.PENDING,
    });
    if (
      nonapprovalData == undefined &&
      this.serviceObj.userid == this.userstoragedata.userid &&
      this.serviceObj.srstatus !== AppConstant.STATUS.CLOSED
    ) {
      this.isApproved = true;
    }
  }
  getPricing() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricingModel = response.data;
          this.getRequestDetails();
        } else {
          this.pricingModel = [];
        }
      });
  }
  calculateResourceCost(data) {
    let self = this;
    if (data && data.length > 0) {
      data.forEach((element) => {
        if (element.currentplan) {
          element.currentplan.currency = element.currentplan.currency;
          if (
            element.currentplan.pricingmodel == AppConstant.LOOKUPKEY.MONTHLY
          ) {
            element.currentplan.cost = element.currentplan.priceperunit;
          } else {
            element.currentplan.cost = self.commonService.getMonthlyPrice(
              self.pricingModel,
              element.currentplan.pricingmodel,
              element.currentplan.priceperunit,
              element.currentplan.currency,
              true
            );
          }
        }
        if (element.upgradeplan) {
          element.upgradeplan.currency = element.upgradeplan.currency;
          if (
            element.upgradeplan.pricingmodel == AppConstant.LOOKUPKEY.MONTHLY
          ) {
            element.upgradeplan.cost = element.upgradeplan.priceperunit;
          } else {
            element.upgradeplan.cost = self.commonService.getMonthlyPrice(
              self.pricingModel,
              element.upgradeplan.pricingmodel,
              element.upgradeplan.priceperunit,
              element.upgradeplan.currency,
              true
            );
          }
        }
        console.log(element);
        return element;
      });
    }
  }
  resizeInstance(data) {
    let formData = [] as any;
    let endpoint = "" as any;
    // this.requestList.forEach(element => {
    if (this.getApproval(data) == true) {
      this.loading = true;
      let obj = {} as any;
      obj.region = data.instance.region;
      obj.tenantid = data.tenantid;
      obj.instanceid = data.instance.instanceid;
      obj.instancename = data.instance.instancename;
      obj.instancerefid = data.instance.instancerefid;
      obj.customerid = data.customerid;
      obj.ecl2tenantid = this.serviceObj.customer.ecl2tenantid;
      obj.instancetype = data.upgradeplan.plantype;
      obj.upgraderequestid = data.upgraderequestid;
      obj.srvrequestid = data.srvrequestid;
      formData.push(obj);
      // });
      if (data.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
        endpoint =
          AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.ECL2INSTANCERESIZE;
      } else if (data.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
        endpoint = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.AWSINSTANCERESIZE;
      }
      console.log(formData, endpoint);
      this.httpService
        .POST(AppConstant.API_END_POINT + endpoint, formData)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          this.messageService.info(response.message);
          this.router.navigate(["/srm/inbox"]);
          this.loading = false;
        });
    } else {
      let msg =
        `The selected maintenance window is ` +
        moment(data.maintwindow.startdate).format("DD-MMM-YYYY") +
        " to " +
        moment(data.maintwindow.enddate).format("DD-MMM-YYYY") +
        `,${data.requestday} ${data.reqstarttime}-${data.reqendtime}`;
      this.messageService.error(msg);
    }
  }
  viewChart(data) {
    this.resizeObj.instancerefid = data.instance
      ? data.instance.instancerefid
      : null;
    this.resizeObj.customerid = data.customerid;
    this.resizeObj.provider = data.cloudprovider;
    this.resizeObj.utilkey = "CPU_UTIL";
    this.resizeObj.daterange = [moment().startOf("month").toDate(), new Date()];
    this.isVisible = true;
  }
  getApproval(data) {
    let now = new Date();
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let today = days[now.getDay()];
    if (data.autoimplementation == "N") {
      if (data.restartreq == "Y" && data.maintwindow) {
        let D1 = new Date(data.maintwindow.startdate) as any;
        let D2 = new Date(data.maintwindow.enddate) as any;
        let D3 = new Date() as any;
        if (D3.getTime() <= D2.getTime() && D3.getTime() >= D1.getTime()) {
          if (data.requestday == today) {
            let startTime = data.reqstarttime
              .replace(/(^:)|(:$)/g, "")
              .split(":");
            let endTime = data.reqendtime.replace(/(^:)|(:$)/g, "").split(":");
            if (
              now.getHours() >= parseFloat(startTime[0]) &&
              now.getHours() <= parseFloat(endTime[0])
            ) {
              return true;
            }
          }
        }
      } else {
        return false;
      }
      console.log(data);
    } else {
      return false;
    }
  }
}
