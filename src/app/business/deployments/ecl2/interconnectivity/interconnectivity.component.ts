import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { Ecl2Service } from "../ecl2-service";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";

@Component({
  selector: "app-interconnectivity",
  templateUrl:
    "../../../../presentation/web/deployments/ecl2/interconnectivity/interconnectivity.component.html",
})
export class InterconnectivityComponent implements OnInit {
  interConnectivityObj: any = {};
  tenantconnectionObj: any = {};
  loading = false;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: [
      "15px",
      "25px",
      "20px",
      "20px",
      "20px",
      "20px",
      "25px",
      "25px",
    ],
  } as any;
  tableHeader = [
    {
      field: "descustomer.customername",
      header: "Destination Tenant",
      datatype: "string",
    },
    {
      field: "desnetwork.networkname",
      header: "Destination Network",
      datatype: "string",
    },
    {
      field: "approvalrequestid",
      header: "Approval Request ID",
      datatype: "string",
    },
    { field: "eclstatus", header: "Approval Status", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    { field: "status", header: "Status", datatype: "string" },
  ] as any;
  buttonText = "Application for Inter-connectivity";
  providerList: any = [];
  interconnectivityList: any = [];
  screens = [];
  appScreens = {} as any;
  visibleadd = true;
  userstoragedata: any;
  customerList: any = [];
  typeselect = false;
  customerid: any;
  isVisible = false;
  formTitle = "Inter Connection";

  constructor(
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private message: NzMessageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private notification: NzNotificationService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.INTER_CONNECTIVITY,
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
    this.getCustomerList();
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
        this.loading = false;
        if (response.status) {
          this.providerList = response.data;
        } else {
          this.providerList = [];
        }
      });
  }
  getCustomerList() {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allCustomers(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.customerList = response.data;
        this.loading = false;
      } else {
        this.customerList = [];
        this.loading = false;
      }
    });
  }
  onChangeProvider(event) {
    if (event === AppConstant.CLOUDPROVIDER.ECL2) {
      this.typeselect = true;
    } else {
      this.typeselect = false;
    }
  }
  onCustomerChange(event) {
    try {
      if (event.ecl2tenantid != null && event.ecl2region != null) {
        const condition = {
          tenantid: this.userstoragedata.tenantid,
          customerid: event.customerid,
          region: event.ecl2region,
          ecl2tenantid: event.ecl2tenantid,
          status: AppConstant.STATUS.ACTIVE,
        };
        this.getInterConnectivityList(condition);
      } else {
        this.interconnectivityList = [];
        this.notificationService.error("Error", "Incorrect details", {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  getInterConnectivityList(condition, dataSync?) {
    this.loading = true;
    try {
      if (dataSync) {
        condition.dataSync = true;
      }
      this.ecl2Service
        .getECL2TenantconnRequestList(condition)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.interconnectivityList = response.data;
          } else {
            this.loading = false;
            this.interconnectivityList = [];
          }
        });
    } catch (e) {
      console.log(e);
      this.loading = false;
      this.interconnectivityList = [];
    }
  }

  notifyNewEntry(event) {
    this.isVisible = false;
    let existData = {} as any;
    existData = _.find(this.interconnectivityList, {
      tenantconnrequestid: event.tenantconnrequestid,
    });
    if (existData === undefined) {
      this.interconnectivityList = [event, ...this.interconnectivityList];
    } else {
      const index = _.indexOf(this.interconnectivityList, existData);
      this.interconnectivityList[index] = event;
      this.interconnectivityList = [...this.interconnectivityList];
    }
  }
  showModal() {
    this.interConnectivityObj = this.customerid;
    this.isVisible = true;
  }
  onChanged(event) {
    this.isVisible = event;
  }

  dataChanged(event) {
    if (event.edit) {
      this.isVisible = true;
      this.interConnectivityObj = event.data;
      this.formTitle = "Update Inter Connectivity";
    } else if (event.delete) {
      this.deleteRecord(event.data);
    }
  }

  deleteRecord(data) {
    const formdata = {
      tenantconnrequestid: data.tenantconnrequestid,
      ecltenantconnrequestid: data.ecltenantconnrequestid,
      tenantid: this.userstoragedata.tenantid,
      region: this.customerid.ecl2region,
      ecl2tenantid: this.customerid.ecl2tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service
      .deleteECL2TenantConnRequest(formdata)
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(
            "#" + response.data.tenantconnrequestid + " Deleted Successfully"
          );
          this.interconnectivityList.splice(
            this.interconnectivityList.indexOf(data),
            1
          );
          this.interconnectivityList = [...this.interconnectivityList];
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
  dataSync() {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      customerid: this.customerid.customerid,
      region: this.customerid.ecl2region,
      ecl2tenantid: this.customerid.ecl2tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getInterConnectivityList(condition, true);
  }
}
