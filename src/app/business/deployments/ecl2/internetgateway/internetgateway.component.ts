import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../app.constant";
import { Ecl2Service } from "../ecl2-service";
import { AWSService } from "../../aws/aws-service";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as _ from "lodash";

@Component({
  selector: "app-internetgateway",
  templateUrl:
    "../../../../presentation/web/deployments/ecl2/internetgateway/internetgateway.component.html",
})
export class InternetgatewayComponent implements OnInit {
  gatewayList: any = [];
  userstoragedata: any;
  loading = false;
  gatewayObj: any = {};
  isVisible = false;
  formTitle = "Add Internet Gateway";
  buttonText = "Add Internet Gateway";
  visibleadd = true;
  screens = [];
  appScreens = {} as any;
  modalWidth = 320;
  provider: any = AppConstant.CLOUDPROVIDER.ECL2;
  providerList: any = [];
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["20px", "30px", "25px", "25px", "25px", "25px"],
  } as any;
  tableHeader = [
    { field: "gatewayname", header: "Name", datatype: "string" },
    { field: "description", header: "Description", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    { field: "status", header: "Status", datatype: "string" },
  ] as any;
  constructor(
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private notificationService: NzNotificationService,
    private message: NzMessageService,
    private commonService: CommonService,
    private awsService: AWSService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.INTERNET_GATEWAY,
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
  }

  ngOnInit() {
    this.getProviderList();
    this.getGatewayList();
  }
  onChanged(val) {
    this.isVisible = val;
  }
  getProviderList() {
    this.loading = true;
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
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    this.gatewayList = [];
    if (
      this.provider !== AppConstant.CLOUDPROVIDER.ECL2 &&
      this.provider !== AppConstant.CLOUDPROVIDER.AWS
    ) {
      this.tableHeader = [
        { field: "gatewayname", header: "Name", datatype: "string" },
        { field: "description", header: "Description", datatype: "string" },
        { field: "lastupdatedby", header: "Updated By", datatype: "string" },
        {
          field: "lastupdateddt",
          header: "Updated On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
        { field: "status", header: "Status", datatype: "string" },
      ] as any;
    } else if (this.provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.tableHeader = [
        { field: "gatewayname", header: "Name", datatype: "string" },
        {
          field: "awsinternetgatewayid",
          header: "AWS gateway Id",
          datatype: "string",
        },
        { field: "description", header: "Description", datatype: "string" },
        { field: "lastupdatedby", header: "Updated By", datatype: "string" },
        {
          field: "lastupdateddt",
          header: "Updated On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
        { field: "status", header: "Status", datatype: "string" },
      ] as any;
      this.getAWSgatewayList();
    } else {
      this.getGatewayList();
    }
  }
  dataChanged(event) {
    if (event.edit) {
      this.modalWidth = 820;
      this.isVisible = true;
      this.gatewayObj = event.data;
      this.formTitle = "Update Internet Gateway";
    } else if (event.delete) {
      this.deleteRecord(event.data);
    }
  }
  deleteRecord(data) {
    const formdata = {
      internetgatewayid: data.internetgatewayid,
      ecl2internetgatewayid: data.ecl2internetgatewayid,
      tenantid: this.userstoragedata.tenantid,
      region: data.ecl2zones.region,
      ecl2tenantid: data.customer.ecl2tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service.deleteecl2gateway(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.internetgatewayid + " Deleted Successfully"
        );
        this.gatewayList.splice(this.gatewayList.indexOf(data), 1);
        this.gatewayList = [...this.gatewayList];
      } else {
        this.notificationService.error("Error", response.message, {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }
  getAWSgatewayList() {
    this.loading = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsigw(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.tableConfig.edit = false;
        this.tableConfig.delete = false;
        this.gatewayList = response.data;
      } else {
        this.loading = false;
        this.gatewayList = [];
      }
    });
  }
  getGatewayList() {
    this.loading = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2gateway(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        if (_.includes(this.appScreens.actions, "Edit")) {
          this.tableConfig.edit = true;
        }
        if (_.includes(this.appScreens.actions, "Delete")) {
          this.tableConfig.delete = true;
        }
        this.gatewayList = response.data;
      } else {
        this.loading = false;
        this.gatewayList = [];
      }
    });
  }
  showModal() {
    this.modalWidth = 320;
    this.isVisible = true;
    this.formTitle = "Add Internet Gateway";
    this.gatewayObj = {};
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = "Add Internet Gateway";
    let existData = {} as any;
    existData = _.find(this.gatewayList, {
      internetgatewayid: event.internetgatewayid,
    });
    if (existData === undefined) {
      this.gatewayList = [event, ...this.gatewayList];
    } else {
      const index = _.indexOf(this.gatewayList, existData);
      this.gatewayList[index] = event;
      this.gatewayList = [...this.gatewayList];
    }
  }
}
