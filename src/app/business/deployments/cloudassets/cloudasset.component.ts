import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../modules/services/shared/common.service";
import { NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
import { CloudAssetService } from "./cloudasset.service";

@Component({
  selector: "app-cloudassets",
  templateUrl:
    "../../../presentation/web/deployments/cloudassets/cloudasset.component.html",
})
export class CloudAssetComponent implements OnInit {
  userstoragedata: any;
  loading = false;
  isVisible = false;
  formTitle = "Other Assets";
  buttonText = "Other Assets";
  visibleadd = true;
  screens = [];
  appScreens = {} as any;
  cloudassetList: any = [];
  cloudassetObj: any = {};
  provider: any = AppConstant.CLOUDPROVIDER.AWS;
  assettype: any;
  assetTypeList: any = AppConstant.ASSET_TYPES.AWS;
  providerList: any = [];
  tableHeader = [
    { field: "assetname", header: "Name", datatype: "string" },
    { field: "assettype", header: "Asset Type", datatype: "string" },
    { field: "cloudprovider", header: "Cloud Provider", datatype: "string" },
    { field: "region", header: "Region", datatype: "string" },
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
    view: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"],
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private cloudService: CloudAssetService,
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
      screencode: AppConstant.SCREENCODES.OTHER_CLOUD_ASSETS,
    });
    if (this.appScreens && _.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens && this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
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
    this.assettype = null;
    this.assetTypeList = AppConstant.ASSET_TYPES[this.provider];
    this.cloudassetList = [];
    this.tableHeader = [
      { field: "assetname", header: "Name", datatype: "string" },
      { field: "assettype", header: "Asset Type", datatype: "string" },
      { field: "region", header: "Region", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ] as any;
    this.getAllList();
  }
  dataChanged(event) {
    if (event.view) {
      this.isVisible = true;
      this.cloudassetObj = event.data;
      this.formTitle = "Other Cloud Assets";
    }
  }
  getAllList() {
    this.loading = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.assettype) {
      condition.assettype = this.assettype;
    }
    if (this.provider) {
      condition.cloudprovider = this.provider;
    }
    this.cloudService.all(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        response.data.forEach((element) => {
          element.region = element.tenantregion.region;
          return element;
        });
        this.cloudassetList = response.data;
      } else {
        this.loading = false;
        this.cloudassetList = [];
      }
    });
  }
  showModal() {
    this.isVisible = true;
    this.formTitle = "Other Cloud Assets";
    this.cloudassetObj = {};
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = "Other Cloud Assets";
  }
}
