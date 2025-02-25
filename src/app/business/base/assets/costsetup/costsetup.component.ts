import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import * as _ from "lodash";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import {
  NzMessageService,
  NzTreeNode,
  NzFormatEmitEvent,
  NzFormatBeforeDropEvent,
  NzDropdownService,
  NzMenuItemDirective,
  NzDropdownContextComponent,
} from "ng-zorro-antd";
import { CostSetupService } from "./costsetup.service";
import { Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { TreeComponent, TreeNode } from "angular-tree-component";
import { CommonService } from "src/app/modules/services/shared/common.service";

@Component({
  selector: "app-costsetup",
  templateUrl:
    "../../../../presentation/web/base/costsetup/costsetup.component.html",
})
export class CostSetupComponent implements OnInit {
  private dropdown: NzDropdownContextComponent;

  screens = [];
  appScreens = {} as any;
  createcost = false;
  isVisible = false;
  awsZoneList: any = [];
  nttZoneList: any = [];
  providerList: any = [];
  showSidebar = false;
  isGroupHierarchyVisible = false;
  loading = true;

  userstoragedata = {} as any;
  folderName = "";

  tableHeader = [
    // { field: 'cloudprovider', header: 'Provider', datatype: 'string', width: "10%" },
    // { field: 'resourcetype', header: 'Asset', datatype: 'string', width: "15%" },
    // { field: 'region', header: 'Region', datatype: 'string', width: "8%" },
    {
      field: "plantype",
      header: "Plan Type",
      datatype: "string",
      width: "20%",
    },
    { field: "image", header: "Image", datatype: "string", width: "20%" },
    { field: "unit", header: "Unit", datatype: "string", width: "6%" },
    {
      field: "pricingmodel",
      header: "Pricing Model",
      datatype: "string",
      width: "11%",
    },
    { field: "price", header: "Price", datatype: "number", width: "10%" },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      width: "8%",
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "12%",
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
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  assetTypes: any = [];
  filters = { asset: null } as any;
  costList = [];
  zoneList = [];

  formTitle = "Add Price";

  costObj = {} as any;

  structureId;
  savingStructure = false;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  constructor(
    private costService: CostSetupService,
    public router: Router,
    private httpService: HttpHandlerService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private nzDropdownService: NzDropdownService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PRICE_SETUP,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createcost = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Revise")) {
      this.tableConfig.revise = true;
    }
  }

  ngOnInit() {
    this.getZone();
    this.getAwsZone();
    this.getProviderList();
  }

  dataChanged(d) {
    if (d.edit || d.revise) {
      this.formTitle = d.edit ? "Update Price" : "Revise Price";
      this.costObj = d;
      this.showSidebar = true;
    }
    if (d.delete) {
      this.costObj = d.data;
      this.deleteCost();
    }
  }

  showAddForm() {
    this.showSidebar = true;
    this.formTitle = "Add Price";
    this.costObj = {};
  }

  notifyTagEntry(val: boolean) {
    if (val) {
      this.showSidebar = false;
      if (this.filters.provider && this.filters.zone && this.filters.asset) {
        this.getAllCost();
      }
    }
  }
  deleteCost() {
    this.isVisible = true;
    this.costService
      .update({
        costvisualid: this.costObj.costvisualid,
        status: AppConstant.STATUS.DELETED,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.getAllCost();
          this.message.info("Deleted Succesfully");
          this.isVisible = false;
        } else {
          this.message.info(response.message);
          this.isVisible = false;
        }
      });
  }

  onChanged(val) {
    this.showSidebar = val;
    this.costObj = {};
  }
  providerChanges() {
    if (this.filters.provider == "ECL2") {
      this.assetTypes = [
        { title: "Server", value: "ASSET_INSTANCE" },
        // { title: "Network", value: "ASSET_NETWORK" },
        { title: "Load Balancer", value: "ASSET_LB" },
        { title: "Firewall", value: "ASSET_FIREWALL" },
        // { title: "Internet Gateway", value: "ASSET_IG" },
        // { title: "CFG", value: "ASSET_CFG" },
        { title: "Volume", value: "ASSET_VOLUME" },
      ];
      this.filters.zone = null;
      this.filters.asset = null;
      this.zoneList = this.nttZoneList;
    }
    if (this.filters.provider == "AWS") {
      this.assetTypes = [
        { title: "Server", value: "ASSET_INSTANCE" },
        // { title: "VPC", value: "ASSET_VPC" },
        // { title: "Subnet", value: "ASSET_SUBNET" },
        // { title: "Security Group", value: "ASSET_SECURITYGROUP" },
        // { title: "Load Balancer", value: "ASSET_LB" },
        { title: "Volume", value: "ASSET_VOLUME" },
      ];
      this.filters.zone = null;
      this.filters.asset = null;
      this.zoneList = this.awsZoneList;
    }
  }
  getAllCost() {
    let obj = {
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (!this.filters.provider) {
      this.message.error("Please select the provider");
    } else if (!this.filters.asset) {
      this.message.error("Please select the asset");
    } else if (!this.filters.zone) {
      this.message.error("Please select the region");
    } else {
      obj.region = this.filters.zone;
      obj.resourcetype = this.filters.asset;
      obj.cloudprovider = this.filters.provider;
      this.isVisible = true;
      this.costService.all(obj).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.costList = response.data;
            this.costList.forEach((x) => {
              x.price = x.currency + " " + x.priceperunit;
              return x;
            });
            this.loading = false;
          } else {
            this.loading = false;
            this.costList = [];
            this.message.error(response.message);
          }
        },
        (err) => {
          console.log(err);
          this.isVisible = false;
        }
      );
      this.isVisible = false;
    }
  }

  getZone() {
    this.loading = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES,
        {
          status: "Active",
        }
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.nttZoneList = this.formArrayData(
              response.data,
              "region",
              "region"
            );
            this.nttZoneList = _.uniqBy(this.nttZoneList, "value");
          }
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
    this.loading = false;
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
          this.providerList = this.formArrayData(
            response.data,
            "keyname",
            "keyvalue"
          );
        } else {
          this.providerList = [];
        }
      });
  }
  getAwsZone() {
    this.loading = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
        {
          status: "Active",
        }
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.awsZoneList = this.formArrayData(
              response.data,
              "zonename",
              "awszoneid"
            );
          }
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
    this.loading = false;
  }

  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }
}
