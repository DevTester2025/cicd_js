import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../app.constant";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { DeploymentsService } from "../deployments.service";
import { Router } from "@angular/router";
import { Ecl2Service } from "../ecl2/ecl2-service";
import { CommonService } from "../../../modules/services/shared/common.service";
import { element } from "protractor";
import * as _ from "lodash";
import { AlibabaService } from "../alibaba/alibaba-service";
import { AWSService } from "../aws/aws-service";
import { NzMessageService } from "ng-zorro-antd";
@Component({
  selector: "app-lblist",
  templateUrl:
    "../../../presentation/web/deployments/lblist/lblist.component.html",
})
export class LblistComponent implements OnInit {
  userstoragedata = {} as any;
  // Table
  lbList = [];
  lbObj = {} as any;
  loading = true;
  provider: any;
  providerList: any = [];
  formTitle = "";
  buttonText = "Add Load balancer";
  isVisible = false;
  screens = [];
  appScreens = {} as any;
  visibleadd = false;
  tableHeader = [] as any;
  tableConfig = {
    edit: false,
    delete: false,
    view: true,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: [
      "25px",
      "10px",
      "10px",
      "10px",
      "10px",
      "25px",
      "30px",
      "25px",
      "25px",
    ],
  } as any;
  constructor(
    private deploysltnService: DeploymentsService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private ecl2Service: Ecl2Service,
    private commonService: CommonService,
    private alibabaService: AlibabaService,
    private awsService: AWSService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.LOAD_BALANCERS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    this.lbList = [];
  }
  ngOnInit() {
    this.getProviderList();
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
          this.providerList = response.data;
          const defaultprovider = _.find(this.providerList, function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          });
          this.provider = defaultprovider.keyvalue;
          this.getECL2LBList();
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    this.lbList = [];
    switch (this.provider) {
      case AppConstant.CLOUDPROVIDER.AWS:
        this.getAWSLBList();
        break;
      case AppConstant.CLOUDPROVIDER.ECL2:
        this.getECL2LBList();
        break;
      case AppConstant.CLOUDPROVIDER.ALIBABA:
        this.getAlibabaLBList();
        break;
      default:
        this.tableHeader = this.deploysltnService.getAWSLBHeader();
        break;
    }
  }
  getECL2LBList() {
    this.tableHeader = this.deploysltnService.getECLLBHeader();
    this.tableConfig.widthConfig = [
      "25px",
      "25px",
      "25px",
      "25px",
      "25px",
      "25px",
    ];
    this.tableConfig.edit = true;
    this.loading = true;
    this.ecl2Service
      .allecl2loadbalancer({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.lbList = response.data;
        } else {
          this.loading = false;
          this.lbList = [];
        }
      });
  }
  getAWSLBList() {
    this.tableHeader = this.deploysltnService.getAWSLBHeader();
    this.tableConfig.edit = false;
    this.loading = true;
    this.deploysltnService
      .allawsloadbalancers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.lbList = response.data;
        } else {
          this.loading = false;
          this.lbList = [];
        }
      });
  }
  getAlibabaLBList() {
    this.tableHeader = this.deploysltnService.getAlibabaLBHeader();
    this.tableConfig.edit = false;
    this.tableConfig.widthConfig = [
      "25px",
      "25px",
      "25px",
      "25px",
      "25px",
      "25px",
    ];
    this.loading = true;
    this.alibabaService
      .allloadbalancers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.lbList = response.data;
        } else {
          this.loading = false;
          this.lbList = [];
        }
      });
  }

  // Event emitted function to get the data from table
  dataChanged(result) {
    if (result.view) {
      this.lbObj = result.data;
      if (this.lbObj) {
        switch (this.provider) {
          case AppConstant.CLOUDPROVIDER.AWS:
            this.router.navigate(["loadbalancers/view/" + this.lbObj.lbid]);
            break;
          case AppConstant.CLOUDPROVIDER.ECL2:
            this.router.navigate([
              "loadbalancers/ecl2/view/" + this.lbObj.loadbalancerid,
            ]);
            break;
          case AppConstant.CLOUDPROVIDER.ALIBABA:
            this.router.navigate(["loadbalancers/ali/view/" + this.lbObj.lbid]);
            break;
        }
      }
    } else if (result.edit) {
      this.lbObj = result.data;
      console.log("TO EDIT DATA:::::::::::");
      console.log(result.data);
      this.formTitle = "Edit Loadbalancer";
      this.isVisible = true;
    } else if (result.delete) {
      const condition = {
        status: AppConstant.STATUS.DELETED,
        tenantid: this.userstoragedata.tenantid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      switch (this.provider) {
        case AppConstant.CLOUDPROVIDER.AWS:
          this.deleteAWSRecord(result.data, condition);
          break;
        case AppConstant.CLOUDPROVIDER.ECL2:
          this.deleteECLRecord(result.data, condition);
          break;
        case AppConstant.CLOUDPROVIDER.ALIBABA:
          this.deleteALIRecord(result.data, condition);
          break;
      }
    }
  }
  deleteAWSRecord(data, condition) {
    condition.lbid = data.lbid;
    this.awsService.updateawslb(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.lbid + " Deleted Successfully"
        );
        this.getAWSLBList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  deleteECLRecord(data, condition) {
    condition.loadbalancerid = data.loadbalancerid;
    condition.ecl2tenantid = data.customer.ecl2tenantid;
    condition.region = data.lbzones.region;
    this.ecl2Service.updateecl2loadbalancer(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.loadbalancerid + " Deleted Successfully"
        );
        this.getECL2LBList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  deleteALIRecord(data, condition) {
    condition.lbid = data.lbid;
    this.alibabaService.updateloadbalancer(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.lbid + " Deleted Successfully"
        );
        this.getAlibabaLBList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  showModal() {
    this.lbObj = {};
    this.formTitle = "Add Loadbalancer";
    this.isVisible = true;
  }
  onChanged(event) {
    this.isVisible = event;
  }
  continue(event) {
    this.isVisible = false;
    this.getECL2LBList();
  }
}
