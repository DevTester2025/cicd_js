import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "./ssm.service";
import { Buffer } from "buffer";
import { AssetsService } from "../assets.service";

@Component({
  selector: "app-cloudmatiq-nodemanager",
  templateUrl:
    "../../../../presentation/web/base/assets/nodemangement/node-management.component.html",
  styles: [],
})
export class NodeManagementComponent implements OnInit {
  nodesList = [];
  viewNode = false;
  instanceref = {} as any;
  userstoragedata = {} as any;
  showRoleView = false;
  roleList = [];
  assetsList = [];
  addingrole = false;
  roleErrObj = {
    iamrole: {
      required: "Please Select IAM Profile",
    },
    instancerefid: {
      required: "Please Select Instance",
    },
  };
  tableHeader = [
    { field: "instancerefid", header: "Instance ID", datatype: "string", isdefault:true },
    { field: "instancename", header: "Instance Name", datatype: "string", isdefault:true },
    { field: "PlatformType", header: "Platform", datatype: "string", isdefault:true },
    { field: "PlatformName", header: "Operating System", datatype: "string", isdefault:true },
    { field: "AgentVersion", header: "Agent Version", datatype: "string", isdefault:true },
    { field: "ssmagentstatus", header: "Status", datatype: "string", isdefault:true },
  ];
  tableConfig = {
    refresh: true,
    overallsync: false,
    edit: false,
    delete: false,
    view: false,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    frontpagination: false,
    loading: false,
    pageSize: 10,
    title: "",
    manualpagination: true,
    tabledownload: false,
    count: null,
    columnselection: true,
    apisort: true,
  };
  screens = [];
  appScreens = {} as any;
  nodetabIndex = 0;
  loading = false;
  regionList = [];
  region = null;
  totalCount = 0;
  accountsList = [];
  accountid : any;
  ssmagenttype = 'Self';
  title = "";
  roleForm: FormGroup;
  modifyiam = false;
  isdownload = false;
  searchText = null;
  showMultiSelect: boolean = false;
  accountValue: any;
  selectedcolumns = [] as any;
  constructor(
    private localStorageService: LocalStorageService,
    private httpHandler: HttpHandlerService,
    private commonService: CommonService,
    private customerAccService: CustomerAccountService,
    private fb: FormBuilder,
    private ssmService: SSMService,
    private message: NzMessageService,
    private assetService: AssetsService,
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.NODE_MGMT,
    } as any);
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    if (_.includes(this.appScreens.actions, "Sync SSM Agents")) {
      this.tableConfig.overallsync = true;
    }
    if (_.includes(this.appScreens.actions, "Modify IAM Role")) {
      this.modifyiam = true;
    }
    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }
  ngOnInit() {
    this.getRegions();
  }
  nodeTabChanged(event) {
    this.nodetabIndex = event.index;
    if (event.index == 0) {
      this.getNodesList();
    }
  }
 patchTabChange(tabIndex){
    this.showMultiSelect = (tabIndex === 1);
    if (tabIndex !== 1 && this.accountid && Array.isArray(this.accountid)) {
      const selectedAccountId  = this.accountid.length > 0 ? this.accountid[0] : null;
      this.accountid = selectedAccountId ? +selectedAccountId : null;
    }
    }
  resetForm() {
    this.roleForm = this.fb.group({
      instancerefid: [null, Validators.required],
      iamrole: [null, Validators.required],
    });
  }
  getAccountsList(customerid?) {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (customerid) {
      reqObj[customerid] = customerid;
    }
    this.accountsList = [];
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountsList = response.data;
        this.accountid = response.data[0].id;
      }
    });
  }
  getAssetList() {
    if (this.region != null) {
      let condition = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
        region: this.region,
      } as any;
      
      if (this.accountid != null && this.accountid != undefined) {
        condition["accountid"] = this.accountid;
      }
      this.commonService.allInstances(condition).subscribe((result) => {
        this.tableConfig.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          this.assetsList = response.data;
        } else {
          this.assetsList = [];
        }
      });
    }
  }
  changeForm() {
    if (this.accountid != null && this.region != null) {
      this.nodeTabChanged({ index: this.nodetabIndex });
    }
  }
  getNodesList(limit?, offset?) {
    if (this.region == null) {
      this.message.remove();
      this.message.error("Please select region");
      return false;
    }
    if (this.accountid == null) {
      this.message.remove();
      this.message.error("Please select account");
      return false;
    }
    if (this.region != null && this.accountid != null) {
      this.tableConfig.loading = true;
      let query = `count=${true}&limit=${limit ? limit : this.tableConfig.pageSize}&offset=${offset ? offset : 0
        }`;
      let condition = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
        region: this.region,
        ssmagent: { $ne: null },
        accountid: this.accountid,
        ssmagenttype: this.ssmagenttype
      } as any;
      if (this.isdownload) {
        query = `isdownload=${true}`;
        condition["headers"] = this.tableHeader;
      } else {
        this.nodesList = [];
      }
      if (this.searchText != null) {
        condition["searchText"] = this.searchText;
      }
      if (this.accountid != null && this.accountid != undefined) {
        condition["accountid"] = this.accountid;
      }
      // if (this.isdownload) {
      //   condition["headers"] = this.tableHeader;
      //   let req = {
      //     module: "NODEMANAGER",
      //     payload: condition
      //   }
      //   this.assetService.assetDownload(req).subscribe((result) => {
      //     let response = JSON.parse(result._body);
      //     if (response) {
      //       console.log("....", response);
      //       var buffer = Buffer.from(response.data.content.data);
      //       downloadService(
      //         buffer,
      //         "Instances" + "_" + moment().format("DD-MM-YYYY") + ".csv"
      //       );
      //       this.isdownload = false;
      //       this.tableConfig.loading = false;
      //     }
      //   })
      // } else {
      this.commonService.allInstances(condition, query).subscribe(
        (result) => {
          this.tableConfig.loading = false;
          let response = JSON.parse(result._body);
          if (response && response.data) {
            if (this.isdownload) {
              var buffer = Buffer.from(response.data.content.data);
              downloadService(
                buffer,
                "Instances" + "_" + moment().format("DD-MM-YYYY") + ".csv"
              );
              this.isdownload = false;
            } else {
              this.tableConfig.manualpagination = true;
              this.totalCount = response.data.count;
              this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount
              this.nodesList = _.map(response.data.rows, (itm) => {
                itm = _.merge(itm, JSON.parse(itm.ssmagent));
                return itm;
              });
              if (this.nodesList.length == 0) {
                this.tableConfig.manualpagination = false;
              }
            }
          } else {
            this.tableConfig.manualpagination = false;
            this.nodesList = [];
          }
        },
        (err) => {
          this.tableConfig.loading = false;
        }
      );
      // }
    }
  }
  getRegions() {
    this.regionList = [];
    let url =
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES;
    this.httpHandler
      .POST(url, {
        status: "Active",
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.regionList = response.data;
            this.region = response.data[0].zonename;
            this.getAccountsList();
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  dataChanged(event) {
    if (event.pagination) {
      this.tableConfig.pageSize = event.pagination.limit
      this.getNodesList(event.pagination.limit, event.pagination.offset);
    }
    if (event.refresh) {
      this.getNodesList();
    }
    if (event.overallsync) {
      this.sync();
    }
    if (event.download) {
      this.isdownload = true;
      this.getNodesList();
    }
    if (event.searchText != "" && event.search) {
      this.searchText = event.searchText;
      this.getNodesList(this.tableConfig.pageSize, 0);
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getNodesList(this.tableConfig.pageSize, 0);
    }
    if (event.view) {
      this.instanceref = {
        region: this.region,
        instancerefid: event.data.instancerefid,
        cloudprovider: event.data.cloudprovider,
        instancereftype: "instancerefid",
        accountid: event.data.accountid,
      };
      this.title =
        event.data.instancename + "(" + event.data.instancerefid + ")";
      this.viewNode = true;
    }
  }
  closeDrawer() {
    this.viewNode = false;
    this.showRoleView = false;
  }
  showRole() {
    this.showRoleView = true;
    this.getAssetList();
    this.getRoles();
    this.resetForm();
  }
  getRoles() {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      region: this.region,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      reqObj["accountid"] = this.accountid;
    }
    this.roleList = [];
    this.ssmService.getInstanceProfile(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.roleList = response.data;
      }
    });
  }
  updateIAMRole() {
    let errorMessage: any;
    if (this.roleForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.roleForm,
        this.roleErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      ...this.roleForm.value,
    } as any;

    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.ssmService.updateRole(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.addingrole = false;
        if (response.status) {
          this.message.success("Role Modified Successfully");
          this.showRoleView = false;
        } else {
          this.message.error("Sorry,Role Modification Failed");
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  sync() {
    this.message.success("Sync Initiated Successfully")
    let formData = {
      region: this.region,
      ssmagentype : this.ssmagenttype,
      tenantid: this.userstoragedata.tenantid,
      updatedby: this.userstoragedata.fullname,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    
    this.ssmService.sync(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getNodesList();
        } else {
          this.message.error(response.message);
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
}
