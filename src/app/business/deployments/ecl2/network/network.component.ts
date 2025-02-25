import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { Ecl2Service } from "../../ecl2/ecl2-service";

@Component({
  selector: "app-network",
  templateUrl:
    "../../../../presentation/web/deployments/ecl2/network/network.component.html",
})
export class NetworkComponent implements OnInit {
  userstoragedata = {} as any;
  vpcList = [];
  loading = false;
  isVisible = false;
  formTitle = "Add Network";
  buttonText = "Add Network";
  screens = [];
  appScreens = {} as any;
  neworkObj: any = {};
  visibleadd = false;
  provider: any = AppConstant.CLOUDPROVIDER.ECL2;
  providerList: any = [];
  index: any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "30px"],
  } as any;
  tableHeader = [
    { field: "networkname", header: "Network Name", datatype: "string" },
    { field: "adminstateup", header: "Admin State", datatype: "string" },
    { field: "plane", header: "Plane", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    { field: "status", header: "Status", datatype: "string" },
  ];

  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private message: NzMessageService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.vpcList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.NETWORK,
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
    this.getAllList();
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
    this.vpcList = [];
    if (this.provider !== AppConstant.CLOUDPROVIDER.ECL2) {
      this.tableHeader = [
        { field: "networkname", header: "Network Name", datatype: "string" },
        { field: "adminstateup", header: "Admin State", datatype: "string" },
        { field: "plane", header: "Plane", datatype: "string" },
        { field: "lastupdatedby", header: "Updated By", datatype: "string" },
        {
          field: "lastupdateddt",
          header: "Updated On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
        { field: "status", header: "Status", datatype: "string" },
      ];
    } else {
      this.getAllList();
    }
  }

  getAllList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    this.ecl2Service.allecl2nework(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.vpcList = _.map(response.data, function (obj: any) {
          obj.adminstateup = obj.adminstateup === "Y" ? "UP" : "DOWN";
          return obj;
        });
      } else {
        this.loading = false;
        this.vpcList = [];
      }
    });
  }
  onChanged(val) {
    this.isVisible = val;
    this.getAllList();
  }
  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.neworkObj = result.data;
      this.formTitle = "Network";
    } else if (result.delete) {
      this.index = this.vpcList.indexOf(result.data);
      this.deleteRecord(result.data);
    }
  }
  // notifyVpcEntry(event) {
  //   let existData = {} as any;
  //   existData = _.find(this.vpcList, { networkid: event.networkid });
  //   if (existData === undefined) {
  //     // _.map(event, function (obj: any) { obj.adminstateup = (obj.adminstateup === 'Y') ? 'UP' : 'DOWN'; return obj; });
  //     this.vpcList = [event, ...this.vpcList];
  //   } else {
  //     let index = _.indexOf(this.vpcList, existData);
  //     this.vpcList[index] = event;
  //     this.vpcList = [...this.vpcList];
  //   }
  // }
  deleteRecord(data) {
    const formdata = {
      networkid: data.networkid,
      tenantid: this.userstoragedata.tenantid,
      ecl2networkid: data.ecl2networkid,
      region: data.ecl2zones.region,
      ecl2tenantid: data.customer.ecl2tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service.deleteecl2network(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.networkid + " Deleted Successfully"
        );
        this.vpcList.splice(this.vpcList.indexOf(data), 1);
        this.vpcList = [...this.vpcList];
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

  showModal() {
    this.neworkObj = {};
    this.isVisible = true;
    this.formTitle = "Add Network";
  }
}
