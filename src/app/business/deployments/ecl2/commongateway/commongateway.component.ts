import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../app.constant";
import { Ecl2Service } from "../ecl2-service";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";

@Component({
  selector: "app-commongateway",
  templateUrl:
    "../../../../presentation/web/deployments/ecl2/commongateway/commongateway.component.html",
})
export class CommongatewayComponent implements OnInit {
  userstoragedata: any;
  loading = false;
  isVisible = false;
  formTitle = "Common Function Gateway";
  buttonText = "Common Function Gateway";
  visibleadd = true;
  screens = [];
  appScreens = {} as any;
  commonfngatewayList: any = [];
  commonfngatewayObj: any = {};
  provider: any = AppConstant.CLOUDPROVIDER.ECL2;
  providerList: any = [];
  tableHeader = [
    { field: "cfgatewayname", header: "Name", datatype: "string" },
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
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.COMMON_FUNCTION_GATEWAY,
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
    this.commonfngatewayList = [];
    if (this.provider !== AppConstant.CLOUDPROVIDER.ECL2) {
      this.tableHeader = [
        { field: "cfgatewayname", header: "Name", datatype: "string" },
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
    } else {
      this.getAllList();
    }
  }
  dataChanged(event) {
    if (event.edit) {
      this.isVisible = true;
      this.commonfngatewayObj = event.data;
      this.formTitle = "Common Function Gateway";
    } else if (event.delete) {
      this.deleteRecord(event.data);
    }
  }
  deleteRecord(data) {
    const formdata = {
      cfgatewayid: data.cfgatewayid,
      ecl2cfgatewayid: data.ecl2cfgatewayid,
      tenantid: this.userstoragedata.tenantid,
      region: data.ecl2zones.region,
      ecl2tenantid: data.customer.ecl2tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service.deleteeclcommonfngateway(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.cfgatewayid + " Deleted Successfully"
        );
        this.commonfngatewayList.splice(
          this.commonfngatewayList.indexOf(data),
          1
        );
        this.commonfngatewayList = [...this.commonfngatewayList];
      } else {
        this.notification.error("Error", response.message, {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }
  getAllList() {
    this.loading = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.alleclcommonfngateway(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.commonfngatewayList = response.data;
      } else {
        this.loading = false;
        this.commonfngatewayList = [];
      }
    });
  }
  showModal() {
    this.isVisible = true;
    this.formTitle = "Common Function Gateway";
    this.commonfngatewayObj = {};
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = "Common Function Gateway";
    let existData = {} as any;
    existData = _.find(this.commonfngatewayList, {
      cfgatewayid: event.cfgatewayid,
    });
    if (existData === undefined) {
      this.commonfngatewayList = [event, ...this.commonfngatewayList];
    } else {
      const index = _.indexOf(this.commonfngatewayList, existData);
      this.commonfngatewayList[index] = event;
      this.commonfngatewayList = [...this.commonfngatewayList];
    }
  }
}
