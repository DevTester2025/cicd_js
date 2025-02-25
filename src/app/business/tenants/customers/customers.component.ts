import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../app.constant";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { Router } from "@angular/router";
import { TenantsService } from "../tenants.service";
import * as _ from "lodash";
import { AssetsService } from "../../base/assets/assets.service";
import { Ecl2Service } from "../../deployments/ecl2/ecl2-service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import * as moment from "moment";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";
import { CustomerAccountService } from "./customer-account.service";
import { VMwareAppConstant } from "src/app/vmware.constant";
import { VMWareService } from "../../deployments/vmware/vmware-service";
import { AssetRecordService } from "../../base/assetrecords/assetrecords.service";
import {
  IResourceType,
  IAssetHdr,
  IAssetDtl,
} from "src/app/modules/interfaces/assetrecord.interface";
interface ICustomerAccount {
  id: number;
  name: string;
  rolename: string;
  tenantid: number;
  cloudprovider: string;
  customerid: number;
  accountref: string;
  status: string;
  createdby: string;
  createddt: Date;
  regions?: Record<string, any>[];
  lastupdatedby: string;
  lastupdateddt: Date;
  active?: boolean;
}

@Component({
  selector: "app-customers",
  templateUrl:
    "../../../presentation/web/tenant/customers/customers.component.html",
  styles: [
    `
      .ant-collapse-borderless {
        background-color: #1c2e3c !important;
      }
    `,
  ],
})
export class CustomersComponent implements OnInit {
  loading = true;
  customerObj: any = {};
  accountObj: any = {};
  syncVisible = false;
  gettingAssets = false;
  isAddEditVmware = false;
  regionForm: FormGroup;
  awsRegionForm: FormGroup;
  regionList = [];
  cmdbData = [];
  selectedAsset = null;
  awsAssetList: any = [];
  eclAssetList: any = [];
  cloudproviderList: any = [];
  awsZones = [];
  pricingModel: any = [];
  monthlyValue: any = {};
  selectedCMDBData: any = {};
  selectedProvider: any = "";
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];
  tableHeader = [
    {
      field: "customername",
      header: AppConstant.SUBTENANT + " Name",
      datatype: "string",
      isdefault: true,
    },
    { field: "contactemail", header: "Email ID", datatype: "string", isdefault: true, },
    { field: "customercode", header: "Customer Code", datatype: "string", isdefault: true, },
    { field: "phoneno", header: "Mobile No", datatype: "string", isdefault: true, },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true, },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true, },
  ];

  tableconfig = {
    refresh: true,
    edit: false,
    delete: false,
    sync: false,
    cmdbdata: false,
    showasset: false,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    columnselection: true,
    manualpagination: true,
    loading: false,
    count: null,
    pageSize: 10,
    title: "",
    apisort: true,
    tabledownload: false,
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };
  visibleadd = false;
  showAsssets = false;
  customerList: any = [];
  regionItems: any = [];
  awsRegionItems: any = [];
  removeitems: any = [];
  resourceTypes: any = [];
  isVisible = false;
  isAddEditAccountVisible = false;
  formTitle = "";
  buttonText = "";
  panels: any = [];
  awsPanels: any = [];
  vmpanels: any = [];
  eqvmpanels: any = [];
  rightbar = true;
  isVisibleTop = false;
  viewLinkAsset = false;
  showCMDB = false;
  syncAllRegion = false;
  confirmationWindow = false;
  isdownload = false;
  button: any;
  userstoragedata: any = {};
  selectedAccount: any = {};
  syncObj: any = {};
  screens = [];
  createFlag = false;
  appScreens = {} as any;

  sync = {
    ntt: {
      ecl2tenantid: "",
      ecl2region: "",
    },
    aws: {
      awsaccountid: "",
      awszoneid: "",
    },
  };

  savingCustomer = false;
  savingCustomerMessage = "Updating customer detail";
  sentiaAccountList = [];
  equinixAccountList = [];
  customerAccountsList: ICustomerAccount[] = [];
  selectedCustomerAccountId: number = null;
  selectedcolumns = [] as any;

  constructor(
    private router: Router,
    private tenantsService: TenantsService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private httpService: HttpHandlerService,
    private vmwareService: VMWareService,
    private assetRecordService: AssetRecordService,
    private fb: FormBuilder,
    private assetService: AssetsService,
    private commonService: CommonService,
    private customerAccountService: CustomerAccountService,
    private ecl2Service: Ecl2Service
  ) {
    this.formTitle = AppConstant.VALIDATIONS.CUSTOMER.ADD;
    this.resourceTypes = AppConstant.TAGS.TAG_RESOURCETYPES;
    this.buttonText = AppConstant.VALIDATIONS.CUSTOMER.ADD;
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.CUSTOMER,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableconfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableconfig.delete = true;
    }
    //#OP_T620
    if (_.includes(this.appScreens.actions, "Sync Data")) {
      this.tableconfig.sync = true;
    }
    //#OP_T620
    if (_.includes(this.appScreens.actions, "View Records")) {
      this.tableconfig.cmdbdata = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableconfig.tabledownload = true;
    }
    this.regionForm = this.fb.group({
      region: this.fb.array([this.formRegion()]),
    });
    this.awsRegionForm = this.fb.group({
      awsaccountid: [null],
      region: this.fb.array([this.formRegion("aws")]),
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
  }

  ngOnInit() {
    this.getproviderList();
    this.clearForm();
    this.getRegionList();
    this.getAwsRegionList();
    this.getCustomerList();
    this.getPricing();
    this.getCMDBData();
  }
  clearForm() {
    this.regionForm = this.fb.group({
      region: this.fb.array([this.formRegion()]),
    });
    this.awsRegionForm = this.fb.group({
      awsaccountid: [null],
      region: this.fb.array([this.formRegion("aws")]),
    });
    this.awsPanels = [
      {
        active: true,
        filter: "ASSET_INSTANCE",
        name: "Server",
        data: [],
        columns: [
          { name: "Instance Name", value: "instancename" },
          { name: "ID", value: "instancerefid" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
      {
        active: false,
        filter: "ASSET_VPC",
        name: "VPC",
        data: [],
        columns: [
          { name: "VPC", value: "vpcname" },
          { name: "ID", value: "awsvpcid" },
          //{ name: 'Price', value: 'price' },
        ],
      },
      {
        active: false,
        filter: "ASSET_SUBNET",
        name: "Subnet",
        data: [],
        columns: [
          { name: "Subnet", value: "subnetname" },
          { name: "ID", value: "awssubnetd" },
          //{ name: 'Price', value: 'price' },
        ],
      },
      {
        active: false,
        filter: "ASSET_SECURITYGROUP",
        name: "Secuirity Group",
        data: [],
        columns: [
          { name: "Security Group", value: "securitygroupname" },
          { name: "ID", value: "awssecuritygroupid" },
          //{ name: 'Price', value: 'price' },
        ],
      },
      {
        active: false,
        filter: "ASSET_LB",
        name: "Load Balancer",
        data: [],
        columns: [
          { name: "LB Name", value: "lbname" },
          { name: "Policy", value: "securitypolicy" },
          //{ name: 'Price', value: 'price' },
        ],
      },
      {
        active: false,
        filter: "ASSET_VOLUME",
        name: "Volume",
        data: [],
        columns: [
          { name: "ID", value: "ecl2volumeid" },
          { name: "Size (GB)", value: "size" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
    ];

    this.vmpanels = [
      {
        active: true,
        filter: "VIRTUAL_MACHINES",
        name: "Virtual machines",
        data: [],
        columns: [
          { name: "Instance Name", value: "instancename" },
          { name: "Instance Id", value: "instancerefid" },
        ],
      },
      {
        active: false,
        filter: "CLUSTERS",
        name: "Clusters",
        data: [],
        columns: VMwareAppConstant.columns["CLUSTERS"].filter((col) => {
          return col.field !== "lastupdatedby";
        }),
      },
      {
        active: false,
        filter: "DATACENTERS",
        name: "Datacenters",
        data: [],
        columns: VMwareAppConstant.columns["DATACENTERS"].filter((col) => {
          return col.field !== "lastupdatedby";
        }),
      },
      {
        active: false,
        filter: "VM_HOSTS",
        name: "Hosts",
        data: [],
        columns: VMwareAppConstant.columns["VM_HOSTS"].filter((col) => {
          return col.field !== "lastupdatedby";
        }),
      },
    ];
    this.eqvmpanels = [
      {
        active: true,
        filter: "VIRTUAL_MACHINES",
        name: "Virtual machines",
        data: [],
        columns: [
          { name: "Instance Name", value: "instancename" },
          { name: "Instance Id", value: "instancerefid" },
        ],
      },
      {
        active: false,
        filter: "CLUSTERS",
        name: "Clusters",
        data: [],
        columns: VMwareAppConstant.columns["CLUSTERS"].filter((col) => {
          return col.field !== "lastupdatedby";
        }),
      },
      {
        active: false,
        filter: "DATACENTERS",
        name: "Datacenters",
        data: [],
        columns: VMwareAppConstant.columns["DATACENTERS"].filter((col) => {
          return col.field !== "lastupdatedby";
        }),
      },
      {
        active: false,
        filter: "VM_HOSTS",
        name: "Hosts",
        data: [],
        columns: VMwareAppConstant.columns["VM_HOSTS"].filter((col) => {
          return col.field !== "lastupdatedby";
        }),
      },
    ];
    this.panels = [
      {
        active: true,
        filter: "ASSET_INSTANCE",
        name: "Server",
        data: [],
        columns: [
          { name: "Instance Name", value: "instancename" },
          { name: "ID", value: "instancerefid" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
      {
        active: false,
        filter: "ASSET_NETWORK",
        name: "Network",
        data: [],
        columns: [
          { name: "Network Name", value: "networkname" },
          { name: "ID", value: "ecl2networkid" },
          //{ name: 'Price', value: 'price' },
        ],
      },
      {
        active: false,
        filter: "ASSET_LB",
        name: "Load Balancer",
        data: [],
        columns: [
          { name: "Name", value: "lbname" },
          { name: "ID", value: "ecl2loadbalancerid" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
      {
        active: false,
        filter: "ASSET_FIREWALL",
        name: "Firewall",
        data: [],
        columns: [
          { name: "Name ", value: "vsrxname" },
          { name: "Id ", value: "ecl2vsrxid" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
      {
        active: false,
        filter: "ASSET_IG",
        name: "Internet Gateway",
        data: [],
        columns: [
          { name: "Name", value: "gatewayname" },
          { name: "ID", value: "ecl2internetgatewayid" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
      {
        active: false,
        filter: "ASSET_CFG",
        name: "CFG",
        data: [],
        columns: [
          { name: "Name", value: "cfgatewayname" },
          { name: "ID", value: "ecl2cfgatewayid" },
          //{ name: 'Price', value: 'price' }
        ],
      },
      {
        active: false,
        filter: "ASSET_VOLUME",
        name: "Volume",
        data: [],
        columns: [
          { name: "Volume", value: "volumename" },
          { name: "Size", value: "size" },
          { name: "ID", value: "ecl2volumeid" },
          { name: "Price", value: "price" },
          { name: "Pricing Model", value: "pricingmodel" },
          { name: "Cost (Monthly)", value: "cost" },
        ],
      },
    ];
    if (!_.includes(this.appScreens.actions, "Cost")) {
      //Remove price object from awsPanels,panels list

      _.map(this.awsPanels, function (item: any) {
        let removeobj = _.remove(item.columns, function (o: any) {
          if (
            o.value == "price" ||
            o.value == "pricingmodel" ||
            o.value == "cost"
          ) {
            return o;
          }
        });
        return item;
      });

      _.map(this.panels, function (item: any) {
        let removeobj = _.remove(item.columns, function (o: any) {
          if (
            o.value == "price" ||
            o.value == "pricingmodel" ||
            o.value == "cost"
          ) {
            return o;
          }
        });
        return item;
      });
    }
  }
  getReport(provider) {
    this.gettingAssets = true;
    let condition = {
      cloudprovider: provider,
      customerid: this.customerObj.customerid,
      fromdate: moment().format("YYYY-MM-DD") + " 00:00:00",
      todate: moment().format("YYYY-MM-DD") + " 23:59:59",
    };
    this.commonService.getDataCollectionReport(condition).subscribe((res) => {
      this.gettingAssets = false;
      const response = JSON.parse(res._body);
      if (response) {
        var buffer = Buffer.from(response.data.content.data);
        downloadService(
          buffer,
          "Datacollection_" + moment().format("DD-MM-YYYY") + ".csv"
        );
      }
    });
  }
  formRegion(type?): FormGroup {
    if (type) {
      return this.fb.group({
        region: [null],
        awsaccountid: [null],
        lastsyncdt: [null],
        tnregionid: [null],
      });
    } else {
      return this.fb.group({
        customerid: [null],
        region: [null],
        ecl2tenantid: [null],
        lastsyncdt: [null],
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        status: [AppConstant.STATUS.ACTIVE],
        tenantid: [this.userstoragedata.tenantid],
      });
    }
  }
  addRegion() {
    this.regionItems = this.regionForm.get("region") as FormArray;
    let isEmptyExist = false;
    this.regionItems.value.forEach((element) => {
      if (!element.ecl2tenantid || !element.region) {
        isEmptyExist = true;
      }
    });
    if (isEmptyExist) {
      console.log("Empty field exist");
    } else {
      this.regionItems.push(this.formRegion());
    }
  }
  addAwsRegion() {
    this.awsRegionItems = this.awsRegionForm.get("region") as FormArray;
    let isEmptyExist = false;
    this.awsRegionItems.value.forEach((element) => {
      if (!element.region) {
        isEmptyExist = true;
      }
    });
    if (isEmptyExist) {
      console.log("Empty field exist");
    } else {
      this.awsRegionItems.push(this.formRegion("aws"));
    }
  }
  getFormArray(): FormArray {
    return this.regionForm.get("region") as FormArray;
  }
  getAwsFormArray(): FormArray {
    return this.awsRegionForm.get("region") as FormArray;
  }

  getPricing() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        this.loading = false;
        if (response.status) {
          response.data.forEach((element) => {
            if (element.keyname == AppConstant.LOOKUPKEY.MONTHLY) {
              this.monthlyValue = element;
            }
          });
          this.pricingModel = response.data;
        } else {
          this.pricingModel = [];
          this.monthlyValue = {};
        }
      });
  }
  getRegionList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.REGION,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.regionList = response.data;
      } else {
        this.regionList = [];
      }
    });
  }
  getproviderList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.cloudproviderList = response.data;
      } else {
        this.cloudproviderList = [];
      }
    });
  }
  checkPermission(provider) {
    if (this.cloudproviderList.length > 0) {
      let isExist = this.cloudproviderList.find((el) => {
        return el.keyvalue == provider;
      });
      if (isExist) return true;
      return false;
    } else {
      return false;
    }
  }
  getAwsRegionList() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
        condition
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.awsZones = response.data;
        } else {
          this.awsZones = [];
        }
      });
  }

  rightbarChanged(val) {
    this.clearForm();
    this.isVisible = val;
    this.syncVisible = val;
    this.showAsssets = val;
    this.customerObj = {};
  }
  showModal(): void {
    this.customerObj = {};
    this.isVisible = true;
    this.formTitle = AppConstant.VALIDATIONS.CUSTOMER.ADD;
    this.buttonText = AppConstant.VALIDATIONS.CUSTOMER.ADD;
  }
  dataChanged(result) {
    console.log(result)
    if (result.edit) {
      this.isVisible = true;
      this.customerObj = result.data;
      this.customerObj.refid = this.customerObj.customerid;
      this.customerObj.reftype = AppConstant.REFERENCETYPE[25];
      this.button = AppConstant.VALIDATIONS.UPDATE;
      this.formTitle = AppConstant.VALIDATIONS.CUSTOMER.EDIT;
    } else if (result.delete) {
      this.deleteRecord(result.data);
    } else if (result.tocmdb) {
      this.customerObj = result.data;
      if (this.customerObj.resourceid) {
        this.viewKeyDetail(this.customerObj.resourceid);
      } else {
        this.viewLinkAsset = true;
      }
    } else if (result.sync) {
      this.customerObj = result.data;
      if (this.customerObj.ecl2tenantid)
        this.sync.ntt.ecl2tenantid = this.customerObj.ecl2tenantid;
      if (this.customerObj.ecl2region)
        this.sync.ntt.ecl2region = this.customerObj.ecl2region;
      this.tenantsService
        .customerbyId(this.customerObj.customerid)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (this.customerObj.awsregion) {
            this.sync.aws.awszoneid = this.customerObj.awsregion;
          } else {
            this.sync.aws.awszoneid = "";
          }
          if (response.status) {
            this.syncVisible = true;
            if (response.data && response.data.tenantregion) {
              this.regionItems = this.regionForm.get("region") as FormArray;
              this.awsRegionItems = this.awsRegionForm.get(
                "region"
              ) as FormArray;
              this.clearFormArray(this.regionItems);
              this.clearFormArray(this.awsRegionItems);
              response.data.tenantregion.forEach((element, i) => {
                if (element.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
                  this.regionItems.push(
                    this.fb.group({
                      customerid: element.customerid,
                      region: element.region,
                      ecl2tenantid: element.tenantrefid,
                      lastsyncdt: element.lastsyncdt,
                      createdby: element.createdby,
                      tnregionid: element.tnregionid,
                      createddt: element.createddt,
                      lastupdatedby: this.userstoragedata.fullname,
                      lastupdateddt: new Date(),
                      status: [AppConstant.STATUS.ACTIVE],
                      tenantid: [this.userstoragedata.tenantid],
                    })
                  );
                } else if (element.cloudprovider == "AWS") {
                  // this.awsRegionItems.push(
                  //   this.fb.group({
                  //     region: element.region,
                  //     lastsyncdt: element.lastsyncdt,
                  //     tnregionid: element.tnregionid,
                  //   })
                  // );
                }
              });
              this.awsRegionForm
                .get("awsaccountid")
                .setValue(this.customerObj.awsaccountid);
              this.getCustomerAccounts();
              if (this.awsRegionItems.length == 0) {
                this.awsRegionItems.push(this.formRegion("aws"));
              }
              if (this.regionItems.length == 0) {
                this.regionItems.push(this.formRegion());
              }
            }
          }
        });
    } else if (result.showasset) {
      this.customerObj = result.data;
      this.getCustomerAssets(result.data.customerid);
      this.showAsssets = true;
    } else if (result.chart) {
      this.customerObj = result.data;
      const url =
        AppConstant.DashBoradURL + `/dashboard/${this.customerObj.customerid}`;
      window.open(url);
    }
    if (result.pagination) {
      this.tableconfig.pageSize = result.pagination.limit;
      this.getCustomerList(result.pagination.limit, result.pagination.offset);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getCustomerList(this.tableconfig.pageSize, 0);
      }
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getCustomerList(this.tableconfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      this.getCustomerList(this.tableconfig.pageSize, 0);
    }
    if (result.refresh) {
      this.getCustomerList();
    }
    if (result.download) {
      this.isdownload = true;
      this.getCustomerList(this.tableconfig.pageSize, 0);
    }
  }
  linkCustomer(unlink?) {
    this.tenantsService
      .updatecustomer({
        customerid: this.customerObj.customerid,
        resourceid: this.selectedAsset,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(
            "#" + response.data.customername + " updated Successfully"
          );
          this.viewLinkAsset = false;
          this.showCMDB = false;
          this.getCustomerList();
          if (!unlink) this.viewKeyDetail(this.selectedAsset);
          this.selectedAsset = null;
        } else {
          this.message.error(response.message);
        }
      });
  }

  viewKeyDetail(crn) {
    // call api to get the header and details of the assets
    this.loading = true;
    this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
        ],
        "crn:ops:customer"
      )
      .subscribe(
        (d) => {
          let hdrresponse = JSON.parse(d._body);
          this.assetRecordService.getResourceValuesById(btoa(crn)).subscribe(
            (r) => {
              this.loading = false;

              let dtlresponse: {
                data: Record<string, any>[];
                inbound: Record<string, any>[];
                documents: Record<string, any>[];
                referringassets: Record<string, any>[];
              } = JSON.parse(r._body);

              let data = {
                details: [],
              } as any;
              dtlresponse.data.forEach((o) => {
                data[o["fieldkey"]] = o["fieldvalue"];
                data["details"].push(o);
              });
              // this.resourceDetails = data;
              this.selectedCMDBData.resourceid = crn;
              this.selectedCMDBData.keyvalue = hdrresponse;
              this.selectedCMDBData.keydata = data;
              this.selectedCMDBData.inbound = dtlresponse.inbound;
              this.selectedCMDBData.referringassets =
                dtlresponse.referringassets;
              this.showCMDB = true;
            },
            (err) => {
              this.loading = false;
            }
          );
        },
        (err) => {
          this.loading = false;
        }
      );
  }
  getCMDBData() {
    let crn = "crn:ops:customer";
    this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
        ],
        crn
      )
      .subscribe((d) => {
        this.gettingAssets = true;
        let f = {
          tenantid: this.localStorageService.getItem(
            AppConstant.LOCALSTORAGE.USER
          )["tenantid"],
          crn: "crn:ops:customer",
          fields: JSON.parse(d._body),
        };
        f["status"] = AppConstant.STATUS.ACTIVE;
        this.assetRecordService.getResourceAssets(f).subscribe((r) => {
          this.gettingAssets = false;
          let response: { count: number; rows: Record<string, any>[] } =
            JSON.parse(r._body);
          this.cmdbData = response.rows.map((el) => {
            el.Name = el.Name + `  (${el.Key})`;
            return el;
          });
        });
      });
  }
  clearFormArray(formArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  checkDuplicate(event, i) {
    if (event != null) {
      this.regionItems = this.regionForm.get("region") as FormArray;
      const length = this.regionItems.value.length;
      const valueList: any[] = [];
      if (length > 1) {
        for (const formGroup of this.regionItems.value) {
          let obj = { ecl2tenantid: formGroup.ecl2tenantid } as any;
          valueList.push(obj);
        }
        const isUnique = _.uniqWith(valueList, _.isEqual);
        const duplicateLength = isUnique.length;
        if (duplicateLength !== length) {
          this.message.error("Duplicate record exist");
          this.regionItems.controls[i].get("ecl2tenantid").setValue(null);
          this.regionItems.controls[i].get("region").setValue(null);
          return false;
        }
      }
    }
  }
  checkawsDuplicate(event, i) {
    if (event != null) {
      this.awsRegionItems = this.awsRegionForm.get("region") as FormArray;
      const length = this.awsRegionItems.value.length;
      const valueList: any[] = [];
      if (length > 1) {
        for (const formGroup of this.awsRegionItems.value) {
          let obj = { region: formGroup.region } as any;
          valueList.push(obj);
        }
        const isUnique = _.uniqWith(valueList, _.isEqual);
        const duplicateLength = isUnique.length;
        if (duplicateLength !== length) {
          this.message.error("Duplicate record exist");
          this.awsRegionItems.controls[i].get("region").setValue(null);
          return false;
        }
      }
    }
  }
  deleteRecord(data) {
    const formdata = {
      customerid: data.customerid,
      tenantid: data.tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    if (data.ecl2region) formdata["ecl2region"] = data.ecl2region;
    if (data.ecl2tenantid) formdata["ecl2tenantid"] = data.ecl2tenantid;
    this.tenantsService.updatecustomer(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.customerid + " Deleted Successfully"
        );
        this.customerList.splice(this.customerList.indexOf(data), 1);
        this.customerList = [...this.customerList];
      } else {
        this.message.error(response.message);
      }
    });
  }
  getCustomerList(limit?, offset?) {
    this.tableconfig.loading = true;
    let condition: any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }

    let query;
      if (this.isdownload === true) {
        query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
      }
      else{
       query = `count=${true}&limit=${limit ? limit : 10}&offset=${offset ? offset : 0 }&order=${this.order ? this.order : ""}`;
      }
    this.tenantsService.allcustomers(condition, query).subscribe((res) => {
      let response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableconfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "Customer.xlsx"
          );
          this.isdownload = false;
        }
        else{
        this.tableconfig.manualpagination = true;
        this.totalCount = response.data.count;
        this.tableconfig.count = "Total Records"+ ":"+ " "+this.totalCount;
        this.customerList = response.data.rows;
        response.data.rows.map((o) => {
          if (o.dashboardconfig) {
            const dashboardconfig = o.dashboardconfig.find((e) => {
              return e.key == "SHOWDASHBOARD";
            });
            if (dashboardconfig != undefined) {
              o.showdashboard = dashboardconfig.value == true ? true : false;
            }
          } else {
            o.showdashboard = false;
          }
        });
        this.tableconfig.loading = false;
      }
      } else {
        this.totalCount = 0;
        this.customerList = [];
        this.tableconfig.loading = false;
      }
    });
  }

  getCustomer(id) {
    this.loading = true;
    this.tenantsService.customerbyId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.sync = true;
        this.dataChanged(response);
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }

  getconfirmation(provider, index, isdelete?) {
    this.selectedProvider = provider;
    this.syncAllRegion = index || index == 0 ? false : true;
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.regionItems = this.regionForm.get("region") as FormArray;
      if (this.regionItems.value.length > 0) {
        this.syncObj = {} as any;
        this.syncObj = this.regionItems.value[index];
        if (!this.syncObj.ecl2tenantid) {
          this.message.error("Please enter tenant id");
        } else if (!this.syncObj.region) {
          this.message.error("Please select region");
        } else {
          this.syncObj.refid = this.syncObj.ecl2tenantid;
          this.syncObj.title = " Tenant ID";
          this.syncObj.provider = provider;
          if (isdelete) this.syncObj.delete = true;
          this.syncObj.customerid = this.customerObj.customerid;
          this.confirmationWindow = true;
        }
      }
    } else if (provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.awsRegionItems = this.awsRegionForm.get("region") as FormArray;
      let accountid = this.awsRegionForm.get("awsaccountid").value;
      if (this.awsRegionItems.value.length > 0) {
        this.syncObj = {} as any;
        this.syncObj =
          index || index == 0 ? this.awsRegionItems.value[index] : {};
        this.syncObj.refid = accountid;
        this.syncObj.id = this.syncObj._accountid;
        this.syncObj.title = " Account ID";
        this.syncObj.provider = provider;
        if (isdelete) this.syncObj.delete = true;
        this.syncObj.customerid = this.customerObj.customerid;
        if (this.syncAllRegion) this.syncObj.region = "All";
        this.confirmationWindow = true;
      }
    } else if (
      provider == AppConstant.CLOUDPROVIDER.SENTIA ||
      provider == AppConstant.CLOUDPROVIDER.EQUINIX
    ) {
      this.syncObj = {} as any;
      if (provider == AppConstant.CLOUDPROVIDER.EQUINIX) {
        this.syncObj =
          index || index == 0 ? this.equinixAccountList[index] : {};
      }
      if (provider == AppConstant.CLOUDPROVIDER.SENTIA) {
        this.syncObj = index || index == 0 ? this.sentiaAccountList[index] : {};
      }
      this.syncObj.index = index;
      this.syncObj.refid = this.syncObj.name;
      this.syncObj.title = "Domain";
      this.syncObj.provider = provider;
      this.syncObj.customerid = this.customerObj.customerid;
      if (isdelete) this.syncObj.delete = true;
      this.customerAccountService.byId(this.syncObj.id).subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          let credentials = JSON.parse(response.data.accountref);
          this.syncObj.username = credentials.username;
          this.syncObj.password = credentials.password;
          this.syncObj.showpassword = false;
          this.confirmationWindow = true;
        },
        (err) => {
          this.confirmationWindow = true;
        }
      );
    }
  }
  syncData() {
    if (this.syncObj.delete) {
      this.deleteAccount();
    } else {
      if (this.syncObj.provider == AppConstant.CLOUDPROVIDER.ECL2) {
        this.syncCustomerAssets(this.syncObj, this.customerObj.customerid);
      } else if (this.syncObj.provider == AppConstant.CLOUDPROVIDER.AWS) {
        this.syncAWSCustomerAssets(
          this.syncObj,
          this.customerObj.customerid,
          this.awsRegionForm.get("awsaccountid").value
        );
      } else if (
        this.syncObj.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
        this.syncObj.provider == AppConstant.CLOUDPROVIDER.EQUINIX
      ) {
        this.syncVmware();
      }
    }
  }
  notifyNewEntry(event) {
    let existData = {} as any;
    existData = _.find(this.customerList, { customerid: event.customerid });
    if (existData === undefined) {
      this.customerList = [event, ...this.customerList];
    } else {
      const index = _.indexOf(this.customerList, existData);
      if (event.dashboardconfig) {
        const dashboardconfig = event.dashboardconfig.find((e) => {
          return e.key == "SHOWDASHBOARD";
        });
        if (dashboardconfig != undefined) {
          event.showdashboard = dashboardconfig.value == true ? true : false;
        }
      }
      this.customerList[index] = event;
      this.customerList = [...this.customerList];
    }
    this.isVisible = false;
    this.formTitle = AppConstant.VALIDATIONS.CUSTOMER.ADD;
  }

  saveCustomer(sync?: boolean, cloud?: string) {
    this.savingCustomer = true;
    let d = {};
    if (cloud == "ntt") {
      d = this.sync.ntt;
    }
    if (cloud == "aws") {
      d["awsregion"] = this.sync.aws.awszoneid;
    }
    d["tenantid"] = this.userstoragedata.tenantid;
    d["customerid"] = this.customerObj.customerid;
    d["lastupdatedby"] = this.userstoragedata.fullname;
    d["lastupdateddt"] = new Date();
    this.tenantsService.updatecustomer(d).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.loading = false;
      if (response.status) {
        this.savingCustomer = false;
        this.message.success(response.message);
      } else {
        this.savingCustomer = false;
        this.message.error(response.message);
      }
    });
  }
  syncCustomerAssets(data?, id?) {
    this.savingCustomer = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      region: this.sync.ntt.ecl2region,
      customerid: id,
      customername: this.customerObj.customername.substring(0, 5),
      ecl2tenantid: this.sync.ntt.ecl2tenantid,
    } as any;
    if (data) condition = data;
    this.ecl2Service.datasync(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.loading = false;
      if (response.status) {
        this.savingCustomer = false;
        this.message.warning(AppConstant.VALIDATIONS.CUSTOMER.SYNC);
        if (id) {
          setTimeout(() => {
            this.getCustomer(id);
          }, 10000);
        }
      } else {
        this.savingCustomer = false;
        this.message.warning(response.message);
      }
    });
  }
  getCustomerAssets(id) {
    let obj = {
      customerid: id,
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    this.gettingAssets = true;
    this.assetService.listAsset(obj).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.clearForm();
          this.awsAssetList = [];
          this.eclAssetList = [];
          let vmAssetList = [];
          let equnixAssetList = [];
          response.data.forEach((element) => {
            if (element.cloudprovider == "AWS") {
              switch (element.resourcetype) {
                case "ASSET_INSTANCE":
                  if (element.instance[0]) {
                    element.instancename = element.instance[0].instancename;
                    element.instancerefid = element.instance[0].instancerefid;
                    if (
                      element.instance &&
                      element.instance[0].awsimage &&
                      element.instance[0].awsimage.costvisual[0]
                    ) {
                      element.pricingmodel =
                        element.instance[0].awsimage.costvisual[0].pricingmodel;
                      element.price =
                        element.instance[0].awsimage.costvisual[0].currency +
                        " " +
                        element.instance[0].awsimage.costvisual[0].priceperunit;
                      element.cost = this.procPrice(
                        element.instance[0].awsimage.costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.awsAssetList.push(element);
                  }
                  break;
                case "ASSET_VPC":
                  if (element.awsvpc[0]) {
                    element.vpcname = element.awsvpc[0].vpcname;
                    element.awsvpcid = element.awsvpc[0].awsvpcid;
                    element.price = "0";
                    this.awsAssetList.push(element);
                  }
                  break;
                case "ASSET_SUBNET":
                  if (element.awssubnet[0]) {
                    element.subnetname = element.awssubnet[0].subnetname;
                    element.awssubnetd = element.awssubnet[0].awssubnetd;
                    element.price = "0";
                    this.awsAssetList.push(element);
                  }
                  break;
                case "ASSET_SECURITYGROUP":
                  if (element.awssg[0]) {
                    element.securitygroupname =
                      element.awssg[0].securitygroupname;
                    element.awssecuritygroupid =
                      element.awssg[0].awssecuritygroupid;
                    element.price = "0";
                    this.awsAssetList.push(element);
                  }
                  break;
                case "ASSET_LB":
                  if (element.awslb[0]) {
                    element.lbname = element.awslb[0].lbname;
                    element.securitypolicy = element.awslb[0].securitypolicy;
                    element.price = "0";
                    this.awsAssetList.push(element);
                  }
                  break;
                case "ASSET_VOLUME":
                  if (element.awsvolumes[0]) {
                    element.volumename = element.awsvolumes[0].volumetype;
                    element.size = element.awsvolumes[0].sizeingb;
                    element.ecl2volumeid = element.awsvolumes[0].awsvolumeid;
                    if (
                      element.awsvolumes &&
                      element.awsvolumes[0].costvisual &&
                      element.awsvolumes[0].costvisual[0]
                    ) {
                      element.pricingmodel =
                        element.awsvolumes[0].costvisual[0].pricingmodel;
                      element.price =
                        element.awsvolumes[0].costvisual[0].currency +
                        " " +
                        element.awsvolumes[0].costvisual[0].priceperunit;
                      element.cost = this.procPrice(
                        element.awsvolumes[0].costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.awsAssetList.push(element);
                  }
                  break;
                default:
                  break;
              }
            } else if (
              element.cloudprovider === AppConstant.CLOUDPROVIDER.ECL2
            ) {
              switch (element.resourcetype) {
                case "ASSET_INSTANCE":
                  if (element.instance[0]) {
                    element.instancename = element.instance[0].instancename;
                    element.instancerefid = element.instance[0].instancerefid;
                    if (
                      element.instance &&
                      element.instance[0].image &&
                      element.instance[0].image.costvisual[0]
                    ) {
                      element.pricingmodel =
                        element.instance[0].image.costvisual[0].pricingmodel;
                      element.price =
                        element.instance[0].image.costvisual[0].currency +
                        " " +
                        element.instance[0].image.costvisual[0].priceperunit;
                      element.cost = this.procPrice(
                        element.instance[0].image.costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.eclAssetList.push(element);
                  }
                  break;
                case "ASSET_NETWORK":
                  if (element.ecl2networks[0]) {
                    element.networkname = element.ecl2networks[0].networkname;
                    element.ecl2networkid =
                      element.ecl2networks[0].ecl2networkid;
                    element.price = "0";
                    this.eclAssetList.push(element);
                  }
                  break;
                case "ASSET_LB":
                  if (element.ecl2lb[0]) {
                    element.lbname = element.ecl2lb[0].lbname;
                    element.ecl2loadbalancerid =
                      element.ecl2lb[0].ecl2loadbalancerid;
                    if (
                      element.ecl2lb &&
                      element.ecl2lb[0] &&
                      element.ecl2lb[0].ecl2lbplan &&
                      element.ecl2lb[0].ecl2lbplan.costvisual[0]
                    ) {
                      element.pricingmodel =
                        element.ecl2lb[0].ecl2lbplan.costvisual[0].pricingmodel;
                      element.price =
                        element.ecl2lb[0].ecl2lbplan.costvisual[0].currency +
                        " " +
                        element.ecl2lb[0].ecl2lbplan.costvisual[0].priceperunit;
                      element.cost = this.procPrice(
                        element.ecl2lb[0].ecl2lbplan.costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.eclAssetList.push(element);
                  }
                  break;
                case "ASSET_FIREWALL":
                  if (element.ecl2vsrx[0]) {
                    element.vsrxname = element.ecl2vsrx[0].vsrxname;
                    element.ecl2vsrxid = element.ecl2vsrx[0].ecl2vsrxid;
                    if (
                      element.ecl2vsrx[0] &&
                      element.ecl2vsrx[0].ecl2vsrxplan &&
                      element.ecl2vsrx[0].ecl2vsrxplan.costvisual
                    ) {
                      element.pricingmodel =
                        element.ecl2vsrx[0].ecl2vsrxplan.costvisual[0].pricingmodel;
                      element.price =
                        element.ecl2vsrx[0].ecl2vsrxplan.costvisual[0]
                          .currency +
                        " " +
                        element.ecl2vsrx[0].ecl2vsrxplan.costvisual[0]
                          .priceperunit;
                      element.cost = this.procPrice(
                        element.ecl2vsrx[0].ecl2vsrxplan.costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.eclAssetList.push(element);
                  }
                  break;
                case "ASSET_IG":
                  if (element.ecl2ig[0]) {
                    element.gatewayname = element.ecl2ig[0].gatewayname;
                    element.ecl2internetgatewayid =
                      element.ecl2ig[0].ecl2internetgatewayid;
                    if (
                      element.ecl2ig[0] &&
                      element.ecl2ig[0].ecl2qosoptions &&
                      element.ecl2ig[0].ecl2qosoptions.costvisual[0]
                    ) {
                      element.pricingmodel = !_.isEmpty(
                        element.ecl2ig[0].ecl2qosoptions.costvisual
                      )
                        ? element.ecl2ig[0].ecl2qosoptions.costvisual[0]
                            .pricingmodel
                        : "-";
                      element.price = !_.isEmpty(
                        element.ecl2ig[0].ecl2qosoptions.costvisual
                      )
                        ? element.ecl2ig[0].ecl2qosoptions.costvisual[0]
                            .currency +
                          " " +
                          element.ecl2ig[0].ecl2qosoptions.costvisual[0]
                            .priceperunit
                        : 0;
                      element.cost = this.procPrice(
                        element.ecl2ig[0].ecl2qosoptions.costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.eclAssetList.push(element);
                  }
                  break;
                case "ASSET_CFG":
                  if (element.ecl2cfg[0]) {
                    element.cfgatewayname = element.ecl2cfg[0].cfgatewayname;
                    element.ecl2cfgatewayid =
                      element.ecl2cfg[0].ecl2cfgatewayid;
                    element.price = "0";
                    this.eclAssetList.push(element);
                  }
                  break;
                case "ASSET_VOLUME":
                  if (element.ecl2volumes[0]) {
                    element.volumename = element.ecl2volumes[0].volumename;
                    element.size = element.ecl2volumes[0].size;
                    element.ecl2volumeid = element.ecl2volumes[0].ecl2volumeid;
                    if (
                      element.ecl2volumes[0] &&
                      element.ecl2volumes[0].costvisual[0]
                    ) {
                      element.pricingmodel =
                        element.ecl2volumes[0].costvisual[0].pricingmodel;
                      element.price =
                        element.ecl2volumes[0].costvisual[0].currency +
                        "" +
                        element.ecl2volumes[0].costvisual[0].priceperunit;
                      element.cost = this.procPrice(
                        element.ecl2volumes[0].costvisual
                      );
                    } else {
                      element.pricingmodel = "-";
                      element.price = 0;
                      element.cost = 0;
                    }
                    this.eclAssetList.push(element);
                  }
                  break;
                default:
                  break;
              }
            } else if (
              element.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA
            ) {
              switch (element.resourcetype) {
                case VMwareAppConstant.Asset_Types[0]:
                  element.instancename = element.instance[0].instancename;
                  element.instancerefid = element.instance[0].instancerefid;
                  // element.memorysize = element.virmachines.memorysize
                  //   ? Number(element.virmachines.memorysize) / 1024 + "GB"
                  //   : null;
                  // element.cpucount = element.virmachines.cpucount;
                  // element.powerstate = element.virmachines.powerstate;
                  vmAssetList.push(element);
                  break;
                case VMwareAppConstant.Asset_Types[1]:
                  if (element.clusters) {
                    element.clustername = element.clusters.clustername;
                    element.clusterrefid = element.clusters.clusterrefid;
                    element.drsstate = element.clusters.drsstate;
                    element.hastate = element.clusters.hastate;
                    vmAssetList.push(element);
                  }
                  break;
                case VMwareAppConstant.Asset_Types[2]:
                  if (element.datacenter) {
                    element.dcname = element.datacenter.dcname;
                    element.dcrefid = element.datacenter.dcrefid;
                    vmAssetList.push(element);
                  }
                  break;
                case VMwareAppConstant.Asset_Types[3]:
                  if (element.hosts) {
                    element.hostname = element.hosts.hostname;
                    element.hostrefid = element.hosts.hostrefid;
                    element.hoststate = element.hosts.hoststate;
                    element.powerstate = element.hosts.powerstate;
                    vmAssetList.push(element);
                  }
                  break;

                default:
                  break;
              }
            } else if (
              element.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX
            ) {
              switch (element.resourcetype) {
                case VMwareAppConstant.Asset_Types[0]:
                  element.instancename = element.instance[0].instancename;
                  element.instancerefid = element.instance[0].instancerefid;
                  // element.memorysize = element.virmachines.memorysize
                  //   ? Number(element.virmachines.memorysize) / 1024 + "GB"
                  //   : null;
                  // element.cpucount = element.virmachines.cpucount;
                  // element.powerstate = element.virmachines.powerstate;
                  equnixAssetList.push(element);
                  break;
                case VMwareAppConstant.Asset_Types[1]:
                  if (element.clusters) {
                    element.clustername = element.clusters.clustername;
                    element.clusterrefid = element.clusters.clusterrefid;
                    element.drsstate = element.clusters.drsstate;
                    element.hastate = element.clusters.hastate;
                    equnixAssetList.push(element);
                  }
                  break;
                case VMwareAppConstant.Asset_Types[2]:
                  if (element.datacenter) {
                    element.dcname = element.datacenter.dcname;
                    element.dcrefid = element.datacenter.dcrefid;
                    equnixAssetList.push(element);
                  }
                  break;
                case VMwareAppConstant.Asset_Types[3]:
                  if (element.hosts) {
                    element.hostname = element.hosts.hostname;
                    element.hostrefid = element.hosts.hostrefid;
                    element.hoststate = element.hosts.hoststate;
                    element.powerstate = element.hosts.powerstate;
                    equnixAssetList.push(element);
                  }
                  break;

                default:
                  break;
              }
            }
          });
          this.awsPanels.forEach((element: any) => {
            element.data = this.awsAssetList.filter(
              (x) => x.resourcetype == element.filter
            );
          });
          if (vmAssetList.length > 0) {
            this.vmpanels.forEach((element: any) => {
              element.data = vmAssetList.filter(
                (x) => x.resourcetype == element.filter
              );
            });
          }

          if (equnixAssetList.length > 0) {
            this.eqvmpanels.forEach((element: any) => {
              element.data = equnixAssetList.filter(
                (x) => x.resourcetype == element.filter
              );
            });
          }

          this.panels.forEach((element: any) => {
            element.data = this.eclAssetList.filter(
              (x) => x.resourcetype == element.filter
            );
          });
        } else {
          this.awsAssetList = [];
          this.eclAssetList = [];
        }
        this.gettingAssets = false;
      },
      (err) => {
        this.gettingAssets = false;
        console.log(err);
      }
    );
  }
  syncAWSCustomerAssets(data?, id?, account?) {
    let accountData = this.awsRegionItems.value;
    this.savingCustomer = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      regions: [],
      _accountid: this.selectedCustomerAccountId,
      awsaccountid: account ? account : this.sync.aws.awsaccountid,
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.customerObj.customername,
      createddt: new Date(),
      lastupdatedby: this.customerObj.customername,
      lastupdateddt: new Date(),
      customerid: this.customerObj.customerid,
      provider: AppConstant.CLOUDPROVIDER.AWS,
    };
    if (this.syncAllRegion) {
      condition.regions = this.awsZones.map((el) => {
        let isExist = accountData.find((acc) => {
          return acc.region == el.awszoneid;
        });
        return {
          awszoneid: el.awszoneid,
          tnregionid: isExist ? isExist.tnregionid : null,
        };
      });
    } else {
      let regionData = accountData.find((el) => {
        return el.tnregionid == data.tnregionid;
      });
      condition.regions = [
        { awszoneid: regionData.region, tnregionid: data.tnregionid },
      ];
    }
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSASSETSYNC,
        condition
      )
      .subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          this.savingCustomer = false;
          if (response.status) {
            if (id) {
              setTimeout(() => {
                this.getCustomer(id);
              }, 10000);
            }
            this.message.warning(AppConstant.VALIDATIONS.CUSTOMER.SYNC);
          } else {
            this.message.warning(response.message);
            this.awsZones = [];
          }
        },
        (err) => {
          this.savingCustomer = false;
          this.message.warning("Sorry, Ran into error. Try again later.");
        }
      );
  }

  procPrice(element: any) {
    let price = "0";
    try {
      if (element == undefined || element == null || element.length == 0) {
        return price;
      } else {
        if (element[0].pricingmodel == AppConstant.LOOKUPKEY.MONTHLY) {
          price = element[0].currency + " " + element[0].priceperunit;
        } else {
          let obj: any = _.find(this.pricingModel, {
            keyname: element[0].pricingmodel,
          });
          if (obj != undefined) {
            const priceperhour =
              Number(element[0].priceperunit) / Number(obj.keyvalue);
            let baseprice = (
              Number(this.monthlyValue.keyvalue) * Number(priceperhour)
            ).toFixed(2);
            price = element[0].currency + " " + baseprice;
          } else {
            price = element[0].currency + " " + element[0].priceperunit;
          }
        }
        return price;
      }
    } catch (e) {
      console.log(e);
      return price;
    }
  }

  getCustomerAccounts() {
    this.customerAccountsList = [];
    this.sentiaAccountList = [];
    this.equinixAccountList = [];
    this.customerAccountService
      .all({
        status: "Active",
        tenantid: this.userstoragedata.tenantid,
        customerid: this.customerObj.customerid,
      })
      .subscribe(
        (d) => {
          const response = JSON.parse(d._body);
          const accounts = response["data"];
          accounts.forEach((a) => {
            if (a.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
              this.customerAccountsList.push({
                ...a,
                active: false,
              });
            }
            if (a.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX) {
              this.equinixAccountList.push(a);
            }
            if (a.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA) {
              this.sentiaAccountList.push(a);
            }
          });
        },
        (err) => {
          this.message.error("Unable to get customer accounts list");
          console.log(err);
        }
      );
  }

  removeCustomerAccount(id: number) {
    this.customerAccountService
      .update({
        id: id,
        status: "Deleted",
      })
      .subscribe(
        (d) => {
          this.getCustomerAccounts();
          const response = JSON.parse(d._body);
          console.log("Customer account deleted.");
          console.log(response);
          this.message.success("Customer account deleted.");
        },
        (err) => {
          this.message.error("Unable to delete customer account");
          console.log(err);
        }
      );
  }

  syncVmware() {
    let reqData = {
      customerid: this.syncObj.customerid,
      id: this.syncObj.id,
      tenantid: this.syncObj.tenantid,
      provider: this.selectedProvider,
      createdby: this.userstoragedata.fullname,
    };
    this.vmwareService.syncAssets(reqData).subscribe(
      (res) => {
        const response = JSON.parse(res._body);
        this.savingCustomer = false;
        if (response.status) {
          if (this.syncObj.customerid) {
            setTimeout(() => {
              this.getCustomer(this.syncObj.customerid);
            }, 10000);
          }
          this.message.warning(AppConstant.VALIDATIONS.CUSTOMER.SYNC);
        } else {
          this.message.warning(response.message);
          this.awsZones = [];
        }
      },
      (err) => {
        this.savingCustomer = false;
        this.message.warning("Sorry, Ran into error. Try again later.");
      }
    );
  }
  editVMAccount(i, provider) {
    if (provider == AppConstant.CLOUDPROVIDER.SENTIA) {
      this.selectedAccount = this.sentiaAccountList[i];
    }
    if (provider == AppConstant.CLOUDPROVIDER.EQUINIX) {
      this.selectedAccount = this.equinixAccountList[i];
    }
    this.isAddEditVmware = true;
  }
  deleteAccount() {
    this.customerAccountService
      .update({ id: this.syncObj.id, status: AppConstant.STATUS.DELETED })
      .subscribe(
        (d) => {
          this.message.success("Account deleted");
          this.getCustomer(this.syncObj.customerid);
        },
        (err) => {
          console.log(err);
          this.message.error("Unable to delete account.");
        }
      );
  }
  populateCustomerAccountRegions(e: { index: number }) {
    const d = this.customerAccountsList[e.index];

    this.awsRegionForm = null;
    this.selectedCustomerAccountId = d.id;
    if (d.regions && d.regions.length > 0) {
      this.awsRegionForm = this.fb.group({
        awsaccountid: [d.accountref],
        region: this.fb.array(
          d.regions.map((r) => {
            return this.fb.group({
              region: r.region,
              lastsyncdt: r.lastsyncdt,
              tnregionid: r.tnregionid,
            });
          })
        ),
      });
      // this.awsRegionItems = this.awsRegionForm.get("region") as FormArray;
      // this.clearFormArray(this.awsRegionItems);
      // d.regions.forEach((r) => {
      //   this.awsRegionItems.push(
      // this.fb.group({
      //   region: r.region,
      //   lastsyncdt: r.lastsyncdt,
      //   tnregionid: r.tnregionid,
      // })
      //   );
      // });
    } else {
      this.awsRegionForm = this.fb.group({
        awsaccountid: [d.accountref],
        region: this.fb.array([this.formRegion("aws")]),
      });
    }
  }
}
