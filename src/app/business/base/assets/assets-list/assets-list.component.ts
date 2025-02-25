import { Component, OnInit, Output } from "@angular/core";
import { TagService } from "../../tagmanager/tags.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { AssetsService } from "../assets.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { JsonCsvCommonService } from "src/app/modules/services/shared/jsoncsv.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { ResizeRequestService } from "src/app/business/srm/upgrade-request/resize.service";
import { ServerUtilsService } from "../../server-utildetails/services/server-utils.service";
import { TagGroupsService } from "../../tagmanager/tag-groups.service";
import { Ecl2Service } from "../../../deployments/ecl2/ecl2-service";
import { RightsizegroupService } from "../../rightsizegroup/rightsizegroup.service";
import { AWSService } from "../../../deployments/aws/aws-service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonFileService } from "../../../../modules/services/commonfile.service";
import { VMWareService } from "src/app/business/deployments/vmware/vmware-service";
import { VMwareAppConstant } from "src/app/vmware.constant";
import { AssetConstant } from "src/app/asset.constant";
import { AWSAppConstant } from "src/app/aws.constant";
import { AssetRecordService } from "../../assetrecords/assetrecords.service";
import { Buffer } from "buffer";
import downloadService from "../../../../modules/services/shared/download.service";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import { PrometheusService } from "src/app/business/base/prometheus.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { Subject } from "rxjs";
import { OrchestrationService } from "../../orchestration/orchestration.service";
import { WazuhService } from "../security/wazuh.service";

@Component({
  selector: "app-assets-list",
  templateUrl:
    "../../../../presentation/web/base/assets/assets-list.component.html",
  styleUrls: ["./assets-list.component.css"],
})
export class AssetsListComponent implements OnInit {
  private pendingHTTPRequests$ = new Subject<void>();
  subtenantLable = AppConstant.SUBTENANT;
  @Output() assetData: any;
  instanceref = {} as any;
  syncingTagstoCloud = false;
  gettingAssets = false;
  isdownload = false;
  title = "Monitoring - ";
  tagManager = false;
  serverResize = false;
  showFilters = true;
  rightSizeWindow = false;
  enableServerResize = false;
  networkDetailVisible = false;
  viewVMDetails = false;
  viewVMAssetDetails = false;
  showFilter = false;
  isVisible = false;
  filterKey = "";
  assetname = {};
  showDetailedChart = false;
  lbDetailVisible = false;
  gatewayDetailVisible = false;
  awsgatewayDetailVisible = false;
  firewallDetailVisible = false;
  cfgDetailVisible = false;
  showOtherAssets = false;
  metaSideBarVisible = false;
  metaTagsSideBarVisible = false;
  bulkTagsVisible = false;
  selectedResizeInstance = null;
  viewResizeInstance = false;
  confirmationWindow = false;
  showCMDBDialog = false;
  awsvpcDetailVisible = false;
  awsvpcid = null;
  awsvpcobj = null;
  adhocResize = false;
  selectedInstance = {} as any;
  instanceObj = {} as any;
  originalPlan = null;

  currentConfigs = {} as any;
  utilizationDetailConfigs = {} as any;

  awssubnetDetailVisible = false;
  awssubnetid = null;
  awssubnetobj = null;

  awssgDetailVisible = false;
  awssgid = null;
  awssgobj = null;

  awslbDetailVisible = false;
  awslbid = null;
  awslbobj = null;

  metaSideBarTitle = "";
  metaTagsEnabled = false;
  showTagFilter = true;
  showCompliance = true;

  resizeinstancerefid = null;

  userstoragedata = {} as any;
  tagList = [];
  filterableValues = [];
  filteredValues = {};
  customersList = [];
  rightsizegroupList: any = [];
  rightsizegrpid: any;
  resizeReqList: any = [];
  pricingModel: any = [];
  zoneList = [];
  instanceTypeList = [];

  networkid = null;
  gatewayid = null;
  awsgatewayid = null;
  firewallid = null;
  cfgid = null;
  lbid = null;
  meta = null;

  metaTags = [];
  resizeObj: any = {};
  metaTagsList = [];
  metaVolumes: any = null;

  assetTypes = [];
  totalCount: any;
  selectedcolumns = [] as any;
  tableHeader = [
    { field: "insid", header: "Asset Id", datatype: "string" },
    { field: "instype", header: "Asset Type", datatype: "string" },
    { field: "zone", header: "Zone", datatype: "string" },
    {
      field: "status",
      header: "Status",
      datatype: "link",
      linkfield: "assetLink",
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    manualsorting: false,
    sortbyList: [],
    apisort: true,
    view: false, //#OP_T620
    chart: false,
    loading: false,
    checkconn: false,
    cmdbdata: false,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    columnselection: true,
    monitoring: false,
    sync: false,
    selection: true,
    rightsize: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "1700px" },
    title: "",
    widthConfig: [
      // "30px",
      // "25px",
      // "25px",
      // "25px",
      // "25px",
      // "25px",
      // "25px",
      // "25px",
      // "25px",
    ],
    count: null,
  } as any;
  assetList = [];
  accountsList = [];
  sortbyList = [];
  cloudproviderList = [];
  region = null;
  accountid = null;
  selectedRows = [];

  features = [];
  tags = [];
  tagsList = [];
  selectedAsset = null;

  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  resizeTableHeader = [
    { field: "originalplan", header: "Original Plan", datatype: "string" },
    { field: "previousplan", header: "Previous Plan", datatype: "string" },
    { field: "plantype", header: "Current Plan", datatype: "string" },
    { field: "notes", header: "Notes", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Completed On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
    count: null
  } as any;
  resizeTableConfig = {
    edit: false,
    rightsize: true,
    view: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["16%", "16%", "16%", "16%", "25%", "16%"],
  } as any;

  searchText = null;
  filterText = null;
  filters = { asset: null, agentstatus: 0,  tagcompliance: false } as any;
  selectedTag = {} as any;
  showcosts = false;
  showCMDB = false;
  selectedCMDBData: any = {};
  showrightsize = false;
  screens: any = [];
  appScreens: any = [];
  pricings: any = [];
  tagGroupList: any = [];
  dcTypes: any = [
    { title: "Yes", value: "Y" },
    { title: "No", value: "N" },
  ];
  utilizationConfigs: {
    utiltype?: string;
    utilkey?: string;
    instanceid?: number;
    instancerefid?: string;
    date?: Date[];
    tenantid?: number;
    customerid?: number;
    utilkeyTitle?: string;
    disable?: boolean;
  } = {};

  taggingComplianceComparison = false;
  taggingComplianceForVm: any = null;
  complainceTags: any[] = [];
  complianceTagDiff: any[] = [];
  selectedTagGroupName = "";
  order = ["lastupdateddt", "desc"];

  viewServerDetail = false;
  serverDetail = null as any;
  download = false;
  tagupdate = false;
  showMonitoring = false;
  showcmdbdata = false;
  showsync = false;
  showmonitor = false;
  agentTypes = [
    { label: "All", value: 0 },
    { label: "VM without Monitoring agent", value: 1 },
    { label: "VM with Monitoring agent", value: 2 },
    { label: "VM without Compliance agent", value: 3 },
    { label: "VM with Compliance agent", value: 4 },
    { label: "VM with Connectivity", value: 5 },
    { label: "VM without Connectivity", value: 6 },
    { label: "VM with SSM", value: 7 },
    { label: "VM without SSM", value: 8 },
  ];
  isenableProductmapping: boolean = true;
  isProductmappingVisible: boolean = false;
  productList: any[] = [];
  selectedProduct: any;
  cmdb_operationtype = AppConstant.CMDB_OPERATIONTYPE;
  instancename: any;
  constructor(
    private tagService: TagService,
    private assetService: AssetsService,
    private httpHandler: HttpHandlerService,
    private router: Router,
    private commonFileService: CommonFileService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private tagGroupService: TagGroupsService,
    private groupService: RightsizegroupService,
    private resizeService: ResizeRequestService,
    private vmwareService: VMWareService,
    private localStorageService: LocalStorageService,
    private jsonCsvService: JsonCsvCommonService,
    private commonService: CommonService,
    private serverUtilsService: ServerUtilsService,
    private orchService: OrchestrationService,
    private assetRecordService: AssetRecordService,
    private awsService: AWSService,
    private ecl2Service: Ecl2Service,
    private customerAccService: CustomerAccountService,
    private prometheusService: PrometheusService,
    private tagValueService: TagValueService,
    private WazuhService: WazuhService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_MANAGEMENT,
    });
    if (_.includes(this.appScreens.actions, "Cost")) {
      this.showcosts = true;
    }
    if (_.includes(this.appScreens.actions, "Right Size")) {
      this.showrightsize = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.download = true;
    }
    if (_.includes(this.appScreens.actions, "Tag Update")) {
      this.tagupdate = true;
    }
    if (_.includes(this.appScreens.actions, "View CMDB")) {
      this.showcmdbdata = true;
      this.tableConfig.cmdbdata = this.showcmdbdata;
    }
    if (_.includes(this.appScreens.actions, "Check Connectivity")) {
      this.tableConfig.checkconn = true;
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
    } //#OP_T620
    if (_.includes(this.appScreens.actions, "Sync Data")) {
      this.showsync = true;
      this.tableConfig.sync = this.showsync;
    }
    if (_.includes(this.appScreens.actions, "Monitoring")) {
      this.showmonitor = true;
      this.tableConfig.monitoring = this.showmonitor;
    }
    if (_.includes(this.appScreens.actions, "Tag Compliance")) {
      this.tableConfig.taggingcompliance = true;
    }
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.init();
    let assetParams = this.route.snapshot.queryParams;
    if (
      assetParams &&
      assetParams.mode &&
      !_.isEmpty(this.commonFileService.getAssetItem())
    ) {
      this.filters = this.commonFileService.getAssetItem();
      this.filteredValues = this.commonFileService.getFilters();
      this.serverDetail = this.filters;
      this.filters = _.omit(this.filters, [
        "cloudprovider",
        "instanceref",
        "instancerefid",
      ]);
      this.providerChanges();
      this.assetChanges(assetParams.mode);
    } else if (
      this.filters.provider != undefined &&
      this.filters.asset != undefined
    ) {
      this.assetChanges();
    }
  }
  public cancelPendingRequests() {
    // this.pendingHTTPRequests$.next();
  }
  init() {
    this.cancelPendingRequests();
    this.getproviderList();
    this.getAllTags();
    this.getAllCustomers();
    this.getAccountsList();
    this.getLookup();
    this.getGroupList();
    this.getAllGroups();
    this.getPricing();
  }
  openServerDetail(provider: string, instancerefid: number) {
    let obj = { ...this.filters } as any;
    obj.cloudprovider = provider;
    obj.instanceref = instancerefid;
    obj.instancereftype = "instancerefid";
    obj.asset = this.filters.asset;
    this.commonFileService.addAssetItem(obj);
    this.commonFileService.addFilters(this.filteredValues);
    this.router.navigate(["assets/details"]);
    // this.viewServerDetail = true;
    this.metaSideBarTitle =
      "Server" + " (" + this.assetData["instancename"] + ") ";
  }

  getTaggingComplianceStyles(t) {
    let myStyles = {
      "background-color": null,
    };
    if (t.exval.length == 0 && t.required) {
      myStyles["background-color"] = "rgb(253 163 156 / 38%)";
    } else if (
      t.exval.length > 0 &&
      t.compval.length > 0 &&
      t.compval.toUpperCase().toString().includes(t.exval.toUpperCase())
    ) {
      myStyles["background-color"] = "rgb(156 253 172 / 39%)";
    } else if (
      t.exval.length > 0 &&
      t.compval.length > 0 &&
      t.exval != t.compval
    ) {
      myStyles["background-color"] = "rgb(156 253 172 / 39%)";
    }
    return myStyles;
  }
  getLookup() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricings = response.data;
        } else {
          this.pricings = [];
        }
      });
  }
  providerChanges(e?) {
    this.assetList = [];
    if (e) {
      this.assetTypes = [];
      this.filters.asset = null;
    }
    this.showFilters = true;
    if (this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.assetTypes = AppConstant.ASSETTYPES.ECL2;
      this.getZone();
      this.getInstanceType();
    }
    if (this.filters.provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.assetTypes = AppConstant.ASSETTYPES.AWS;
      this.getZone();
      this.getInstanceType();
    }
    if (
      this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
    ) {
      // this.showFilters = false;
      this.tableConfig.selection = false;
      this.getAssetTypes();
    }
    if (!this.serverDetail) {
      this.filters.asset = null;
      this.filters.zone = null;
      this.filters.customers = null;
      this.filters.accounts = null;
      this.filters.tagid = null;
      this.filters.tagvalue = null;
      this.filters.agentstatus = 0;
    }
    this.searchText = null;
    this.order = null;
  }
  assetChanges(mode?) {
    this.searchText = null;
    this.order = null;
    if (mode == undefined) this.filters.tagid = null;
    this.filters.tagvalue = null;
    this.filters.agentstatus = 0;
    this.filteredValues = {};

    if (this.filters.asset == AWSAppConstant.AWS.TAG_ASSETS[0]) {
      this.showCompliance = true;
      this.tableConfig.cmdbdata = this.showcmdbdata;
    } else if (this.filters.asset == VMwareAppConstant.Asset_Types[0]) {
      this.tableConfig.cmdbdata = this.showcmdbdata;
    } else {
      this.tableConfig.cmdbdata = false;
      this.showCompliance = false;
      this.tableConfig.monitoring = false;
      this.filters.tagcompliance = false;
    }
    if (AWSAppConstant.AWS.TAG_ASSETS.includes(this.filters.asset)) {
      this.showTagFilter = true;
    } else {
      this.showTagFilter = false;
    }
    if (this.filters.provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.tableHeader = AssetConstant.COLUMNS[this.filters.asset];
    }
    if (
      this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
    ) {
      this.tableHeader = VMwareAppConstant.columns[this.filters.asset];
      if (this.filters.asset == AWSAppConstant.AWS.TAG_ASSETS[5]) {
        this.showFilters = true;
      }
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    this.getAssets();
  }
  getAssetTypes() {
    let condition = {} as any;
    condition = {
      keylist: [
        AppConstant.LOOKUPKEY.VM_ASSET_TYPES,
        AppConstant.LOOKUPKEY.VMWARE_REGIONS,
      ],
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.assetTypes = [];
        let assetTypes = response.data.filter((el) => {
          return el.lookupkey == AppConstant.LOOKUPKEY.VM_ASSET_TYPES;
        });
        this.zoneList = response.data.filter((el) => {
          return el.lookupkey == AppConstant.LOOKUPKEY.VMWARE_REGIONS;
        });
        assetTypes.forEach((element) => {
          this.assetTypes.push({
            title: element.keyname,
            value: element.keyvalue,
          });
        });
        this.zoneList.forEach((el) => {
          el.zonename = el.keyvalue;
        });
      } else {
        this.cloudproviderList = [];
      }
    });
  }
  getZone() {
    this.zoneList = [];
    let url =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES;
    if (this.filters.provider === AppConstant.CLOUDPROVIDER.ECL2) {
      url =
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES;
    }
    if (this.filters.provider === AppConstant.CLOUDPROVIDER.AWS) {
      url =
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES;
    }
    this.httpHandler
      .POST(url, {
        status: "Active",
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.zoneList = response.data;
            this.zoneList.forEach((el) => {
              el.zone = el.zonename;
            });
          } else {
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }

  getAllCustomers() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.httpHandler
      .POST(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL,
        cndtn
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.customersList = response.data;
        } else {
          this.customersList = [];
        }
      });
  }
  getAccountsList(customerid?) {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    if (customerid) {
      reqObj[customerid] = customerid;
    }
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountsList = response.data;
      } else {
        this.accountsList = [];
      }
    });
  }
  updateInstance() {
    let obj = {
      instanceid: this.assetData.instanceid,
      rightsizegrpid: this.rightsizegrpid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.rightsizegrpid) {
      this.httpHandler
        .POST(
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.TENANTS.INSTANCE.UPDATE,
          obj
        )
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.assetList.forEach((i) => {
              if (i.instanceid == this.assetData.instanceid) {
                i.rightsizegrpid = this.rightsizegrpid;
              }
            });
            this.message.success("Updated Successfully");
          } else {
            this.message.error("Failed to update Rightsize group");
          }
        });
    } else {
      this.message.info("Please select rightsize group");
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.filterKey = null;
    this.getAssets(this.tableConfig.pageSize, 0);
  }

  closeWindow() {
    this.viewVMAssetDetails = false;
    this.viewVMDetails = false;
    this.getAssets(this.tableConfig.pageSize, 0);
  }

  getVMStatus() {
    let instances = "";
    this.assetList.map((o) => {
      if (o.instancerefid) {
        if (instances != "") instances = instances + "|" + o.instancerefid;
        if (instances == "") instances = o.instancerefid;
      }
    });
    if (instances != "") {
      this.prometheusService
        .getVMStatus({
          tenantid: this.userstoragedata.tenantid,
          instances: instances,
        })
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.data) {
            this.assetList.map((element) => {
              let existtarget = response.data.result.find((e) => {
                if(e.metric.instance && e.metric.instance.split(':')[0] === element.privateipv4){
                  return e;
                }
                else if(e.metric.job === element.instancerefid ||
                  e.metric.job === element.instancename){
                  return e;
                }
              });
              if (existtarget != undefined) {
                // element.vmstatus = existtarget.health;
                if (existtarget.value[1] == 1) element.promagentstat = "up";
                if (existtarget.value[1] == 0) element.promagentstat = "N/A";
              } else {
                element.promagentstat = "N/A";
              }
              return element;
            });
            this.assetList = [...this.assetList];
          }
        });
    }
  }

  getAssets(limit?, offset?) {
    this.tableConfig.selection = true;
    if (
      limit == undefined &&
      offset == undefined &&
      this.searchText == null &&
      this.order == null
    ) {
      this.gettingAssets = true;
    } else {
      this.tableConfig.loading = true;
    }
    // this.gettingAssets = true;
    // this.tableConfig.loading = true;
    // if (!this.isdownload) this.assetList = [];
    if (this.filters.provider == undefined || this.filters.provider == null) {
      this.message.error("Please select provider");
      this.gettingAssets = false;
      this.tableConfig.loading = false;
    } else if (this.filters.asset == undefined || this.filters.asset == null) {
      this.message.error("Please select asset");
      this.gettingAssets = false;
      this.tableConfig.loading = false;
    } else {
      if (
        this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
        this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
        this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
      ) {
        if (this.filters.asset != "VIRTUAL_MACHINES") {
          this.getVMAssets(limit ? limit : this.tableConfig.pageSize, offset ? offset : 0);
          return false;
        }
      }
      if (
        this.filters.datacollection == null ||
        this.filters.datacollection == undefined
      ) {
        delete this.filters["datacollection"];
      }
      if (this.filters.asset != "ASSET_INSTANCE") {
        delete this.filters["datacollection"];
      }

      let f = {
        ...this.filters,
        data: {
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
          cloudprovider: this.filters.provider,
        },
      };
      if (this.filters.agentstatus == 2) {
        f["promagentstat"] = { $ne: null };
      }
      if (this.filters.agentstatus == 4) {
        f["agentid"] = { $ne: null };
      }
      if (this.filters.agentstatus == 1) {
        f["promagentstat"] = { $eq: null };
      }
      if (this.filters.agentstatus == 3) {
        f["agentid"] = { $eq: null };
      }
      if (this.filters.agentstatus == 8) {
        f["ssmagentstatus"] = { $ne: "Online" };
      }
      if (this.filters.agentstatus == 6) {
        f["orchstatus"] = { $ne: "Connected" };
      }
      if (this.filters.agentstatus == 7) {
        f["ssmagentstatus"] = { $eq: "Online" };
      }
      if (this.filters.agentstatus == 5) {
        f["orchstatus"] = { $eq: "Connected" };
      }
      delete f["agentstatus"];
      if (this.searchText != null) {
        f["searchText"] = this.searchText;
        f["headers"] = this.selectedcolumns.filter((el) => {
          return el.field != "vmstatus";
        });
      }
      f["filterby"] = [];
      Object.keys(this.filteredValues).forEach((val) => {
        if (this.filteredValues[val].length > 0) {
          f["filterby"].push({
            key: val == "zone" ? "zonename" : val,
            value: this.filteredValues[val],
          });
        }
      });
      if (this.order) {
        f["order"] = this.order;
      } else {
        f["order"] = ["lastupdateddt", "desc"];
      }

      if (f["zone"]) f["zone"] = [f["zone"]];
      if (f["customers"]) f["customers"] = [f["customers"]];
      if (f["accounts"]) f["accounts"] = [f["accounts"]];
      if (this.selectedTag.tagtype == "date" && this.filters.tagvalue != null) {
        f["tagvalue"] = moment(this.filters.tagvalue).format("YYYY-MM-DD");
      }

      if (f["tagid"] == null) delete f["tagid"];
      if (f["tagvalue"] == null) delete f["tagvalue"];
      if (f["customers"] == null) delete f["customers"];
      if (f["accounts"] == null) delete f["accounts"];
      if (f["zone"] == null) delete f["zone"];
      let query = `?limit=${limit ? limit : this.tableConfig.pageSize}&offset=${offset ? offset : 0}`;
      // if (this.isdownload) {
      //   f["headers"] = this.selectedcolumns.filter((el) => {
      //     return el.field != "vmstatus";
      //   });
      //   let req = {
      //     module: "ASSET",
      //     payload: f,
      //   };
      //   this.assetService.assetDownload(req).subscribe((result) => {
      //     let response = JSON.parse(result._body);

      //     if (response) {
      //       console.log("///", response);
      //       if (this.isdownload) {
      //         var buffer = Buffer.from(response.data.content.data);
      //         downloadService(
      //           buffer,
      //           this.getDownloadLabel() +
      //           "_" +
      //           moment().format("DD-MM-YYYY") +
      //           ".csv"
      //         );
      //         this.isdownload = false;
      //       }
      //     }
      //   });
      // } else {
      if (this.isdownload) {
        query = `?download=${this.isdownload}`;
        f["headers"] = this.selectedcolumns.filter((el) => {
          return el.field != "vmstatus";
        });
      }
      this.assetService.listByFilters(f, query).subscribe(
        (result) => {
          this.gettingAssets = false;
          this.tableConfig.loading = false;
          let response = JSON.parse(result._body);
          if (response.status) {
            if (this.isdownload) {
              var buffer = Buffer.from(response.data.content.data);
              downloadService(
                buffer,
                this.getDownloadLabel() +
                "_" +
                moment().format("DD-MM-YYYY") +
                ".csv"
              );
              this.isdownload = false;
            } else {
              // this.tableConfig.manualsorting = true;
              this.tableConfig.manualpagination = true;
              this.totalCount = response.data.count;
              this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
              this.assetList = response.data.assets;
              if (this.assetList.length == 0) {
                this.tableConfig.manualpagination = false;
              }
              if (this.assetList.length > 0) {
                this.assetList.map((el) => {
                  el.promagentstat = "NA";
                  return el;
                });
                this.getVMStatus();
              }
              if (this.filters.asset == "ASSET_INSTANCE") {
                // this.tableConfig.chart = true;
                this.tableConfig.rightsize = true;
              } else {
                this.tableConfig.chart = false;
                this.tableConfig.rightsize = false;
              }
              if (this.filters.asset == "ASSET_INSTANCE") {
                this.tableConfig.monitoring = this.showmonitor;
              } else {
                this.tableConfig.monitoring = false;
              }
              if (this.filters.asset == "ASSET_INSTANCE") {
                this.tableConfig.sync = this.showsync;
              } else {
                this.tableConfig.sync = false;
              }
              // if (response.data.headers.length > 0) this.tableHeader = response.data.headers;
              this.tableConfig.sortbyList = [];
              this.tableHeader.forEach((element) => {
                if (element.field != "customer" && element.field != "zone") {
                  this.tableConfig.sortbyList.push(element);
                }
              });
              if (this.filters.asset == "VIRTUAL_MACHINES") {
                this.tableConfig.monitoring = this.showmonitor;
              }

              if (this.filters.rightsize) {
                let ls = _.map(this.assetList, (i) => {
                  return {
                    ...i,
                    rightsizeyn:
                      this.filters.rightsize && this.filters.rightsize == "Y"
                        ? "Y"
                        : "N",
                  };
                });
                this.assetList = [...ls];
              }
              if (this.showcosts) {
                let self = this;
                _.map(this.assetList, function (i: any) {
                  i.costs = 0;
                  if (
                    i.instance &&
                    i.instance.costvisual &&
                    i.instance.costvisual.length > 0
                  ) {
                    i.costs = self.commonService.getMonthlyPrice(
                      self.pricings,
                      i.instance.costvisual[0].pricingmodel,
                      i.instance.costvisual[0].priceperunit,
                      i.instance.costvisual[0].currency
                    );
                    self.tableHeader[2] = {
                      field: "costs",
                      header: "Cost (Monthly)",
                      datatype: "number",
                    };
                  }
                  if (
                    i.awsinstance &&
                    i.awsinstance.costvisual &&
                    i.awsinstance.costvisual.length > 0
                  ) {
                    i.costs = self.commonService.getMonthlyPrice(
                      self.pricings,
                      i.awsinstance.costvisual[0].pricingmodel,
                      i.awsinstance.costvisual[0].priceperunit,
                      i.awsinstance.costvisual[0].currency
                    );
                    // self.tableHeader[2] = { field: 'costs', header: 'Cost (Monthly)', datatype: 'number' };
                  }
                  if (i.costvisual && i.costvisual.length > 0) {
                    i.costs = self.commonService.getMonthlyPrice(
                      self.pricings,
                      i.costvisual[0].pricingmodel,
                      i.costvisual[0].priceperunit,
                      i.costvisual[0].currency
                    );
                    // self.tableHeader[3] = { field: 'costs', header: 'Cost (Monthly)', datatype: 'number' };
                  }
                  if (
                    i.ecl2vsrxplan &&
                    i.ecl2vsrxplan.costvisual &&
                    i.ecl2vsrxplan.costvisual.length > 0
                  ) {
                    i.costs = self.commonService.getMonthlyPrice(
                      self.pricings,
                      i.ecl2vsrxplan.costvisual[0].pricingmodel,
                      i.ecl2vsrxplan.costvisual[0].priceperunit,
                      i.ecl2vsrxplan.costvisual[0].currency
                    );
                    self.tableHeader[2] = {
                      field: "costs",
                      header: "Cost (Monthly)",
                      datatype: "number",
                    };
                  }
                  return i;
                });
              }
              if (
                this.filters.tagcompliance &&
                this.filters.selectedtaggroup
              ) {
                this.tagGroupChanged(this.filters.selectedtaggroup);
              }
            }
          } else {
            this.tableConfig.manualsorting = false;
            this.tableConfig.manualpagination = false;
            this.assetList = [];
          }
          this.filterKey = null;
        },
        (err) => {
          this.tableConfig.loading = false;
          this.gettingAssets = false;
        }
      );
      // }
    }
  }
  getVMAssets(limit?, offset?) {
    this.showFilters = false;
    this.tableConfig.selection = false;
    this.tableConfig.loading = true;
    let query = "";
    let condition: any = {
      assettype: this.filters.asset,
      filters: {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      },
    };
    if (this.filters.agentstatus == 0) {
      delete condition.filters["promagentstat"];
      delete condition.filters["agentid"];
    }
    if (this.filters.provider) {
      condition.filters["region"] = this.filters.provider;
    }
    if (this.filters.agentstatus == 2) {
      condition.filters["promagentstat"] = { $ne: null };
    }
    if (this.filters.agentstatus == 4) {
      condition.filters["agentid"] = { $ne: null };
    }
    if (this.filters.agentstatus == 1) {
      condition.filters["promagentstat"] = { $eq: null };
    }
    if (this.filters.agentstatus == 3) {
      condition.filters["agentid"] = { $eq: null };
    }
    if (this.filters.agentstatus == 7) {
      condition.filters["ssmagentstatus"] = { $ne: "Online" };
    }
    if (this.filters.agentstatus == 5) {
      condition.filters["orchstatus"] = { $ne: "Connected" };
    }
    if (this.filters.agentstatus == 8) {
      condition.filters["ssmagentstatus"] = { $eq: "Online" };
    }
    if (this.filters.agentstatus == 6) {
      condition.filters["orchstatus"] = { $eq: "Connected" };
    }
    if (this.filters.customers)
      condition.filters.customerid = this.filters.customers;
    if (this.filters.zone) condition.filters.region = this.filters.zone;
    if (this.searchText != null) {
      condition.searchText = this.searchText;
      condition.headers = this.selectedcolumns;
    }
    if (this.order) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }

    condition["filterby"] = [];
    if (!this.filterKey) {
      Object.keys(this.filteredValues).forEach((val) => {
        if (this.filteredValues[val] && this.filteredValues[val].length > 0) {
          condition["filterby"].push({
            key: val == "zone" ? "zonename" : val,
            value: this.filteredValues[val],
          });
        }
      });
    }
    if (this.filterKey && this.filterText)
      condition["headers"] = [{ field: this.filterKey }];
    if (this.filterText) condition["searchText"] = this.filterText;
    if (limit) query = `?limit=${limit}&offset=${offset}`;
    if (this.isdownload) {
      query = query + `&download=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    }
    this.vmwareService.listByFilters(condition, query).subscribe((result) => {
      //disable loading
      this.gettingAssets = false;
      this.tableConfig.loading = false;
      this.tableConfig.manualpagination = true;
      //form data for table
      let response = JSON.parse(result._body);
      if (response.status) {
        if (this.isdownload) {
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            this.getDownloadLabel() +
            "_" +
            moment().format("DD-MM-YYYY") +
            ".csv"
          );
          this.isdownload = false;
        } else {
          if (this.filterText || this.filterKey) {
            this.filterableValues = response.data.assets;
            this.filterText = null;
          } else {
            this.totalCount = response.data.count;
            this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
            this.assetList = response.data.assets;
            if (this.assetList.length == 0) {
              this.tableConfig.manualpagination = false;
            }
            if (this.filters.asset == VMwareAppConstant.Asset_Types[0]) {
              this.assetList.forEach((asset) => {
                asset.memorysize = asset.memorysize
                  ? Number(asset.memorysize) / 1024 + "GB"
                  : null;
              });
            }
            // this.tableHeader = VMwareAppConstant.columns[this.filters.asset];
          }
        }
      }
    });
  }
  tagChanged(e) {
    let tag = this.tagList.find((o) => o["tagid"] == e);
    let tagClone = _.cloneDeep(tag);

    this.filters.tagvalue = null;

    if (tagClone.tagtype == "list") {
      tagClone.lookupvalues = tagClone.lookupvalues.split(",");
    } else if (
      tagClone.tagtype == "range" &&
      typeof tagClone.lookupvalues == "string"
    ) {
      tagClone.min = tagClone.lookupvalues.split(",")[0];
      tagClone.min = tagClone.lookupvalues.split(",")[1];
    }

    this.selectedTag = _.cloneDeep(tagClone);
  }

  tagGroupChanged(e) {
    let tagGroup = this.tagGroupList.find((o) => o["taggroupid"] == e);
    let tags = [];

    if (tagGroup) {
      this.selectedTagGroupName = tagGroup["groupname"];
      tagGroup.tagvalues.forEach((element) => {
        if (element.tag) {
          element.tag["tagvalue"] = element["tagvalue"];
          element.tag["tagvalueid"] = element["tagvalueid"];
          tags.push(element.tag);
        }
      });
      this.complainceTags = tags;
      let ls = this.assetList.map(function (asset) {
        // if (
        //   asset["tagvalues"] &&
        //   asset["tagvalues"].length > 0 &&
        //   asset["tagvalues"].length == tags.length
        // ) {
        //   let tv = asset["tagvalues"];
        //   let comp = false;
        //   tv.forEach((element) => {
        //     let exists = tags.find(
        //       (o) => o["tagname"] == element["tag"]["tagname"]
        //     );
        //     if (!exists) {
        //       comp = true;
        //     }
        //   });
        //   if (comp) {
            asset["taggingcompliance"] = "Y";
            return asset;
        //   } else {
        //     return asset;
        //   }
        // } else {
        //   asset["taggingcompliance"] = "Y";
        //   return asset;
        // }
      });
      this.assetList = [...ls];
    } else {
      this.removeTaggingCompliance();
    }
  }

  removeTaggingCompliance() {
    this.filters.tagcompliance = !this.filters.tagcompliance;
    let ls = this.assetList.map((o) => {
      o["taggingcompliance"] = "N";
      return o;
    });
    this.assetList = [...ls];
    this.getAssets();
  }

  dataChanged(e) {
    if (e.searchText) {
      this.searchText = e.searchText;
      if (e.search) {
        this.getAssets(this.tableConfig.pageSize, 0);
      }
      // this.getAssets(10, 0);
    }
    if (e.searchText == "") {
      this.searchText = null;
      this.getAssets(this.tableConfig.pageSize, 0);
    }
    if (e.order) {
      this.order = e.order;
      this.getAssets(this.tableConfig.pageSize, 0);
    }
    if (e.order == null) {
      this.order = null;
    }
    if (e.pagination) {
      this.getAssets(e.pagination.limit, e.pagination.offset);
      this.tableConfig.pageSize = e.pagination.limit;
    }
    if (e.pagination) {
      this.getAssets(e.pagination.limit, e.pagination.offset);
    }
    if (e.rowselection) {
      this.selectedRows = e.data.filter((o) => o["checked"] == true);
    }
    if (e.tocmdb) {
      this.assetData = e.data as any;
      this.getInstanceByID(e.data.instanceid);
      this.redirectData(e.data);
    }
    if (e.taggingcompliance) {
      this.taggingComplianceForVm = e.data;
      this.assetData = e.data;
      this.getInstanceByID(e.data.instanceid);
      this.prepareTaggingComparison();
    }
    if (e.checkConn) {
      this.checkConnectivity(e.data);
    }
    if (e.view) {
      this.assetData = e.data as any;
      this.assetData.instancetype = this.filters.asset;
      this.assetData.cloudprovider = this.filters.provider;
      if (
        this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
        this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
        this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
      ) {
        switch (this.filters.asset) {
          case VMwareAppConstant.Asset_Types[0]:
            // this.viewVMDetails = true;
            this.openServerDetail(this.filters.provider, e.data.instancerefid);
            break;
          case VMwareAppConstant.Asset_Types[1]:
            this.viewVMAssetDetails = true;
            this.assetname = {
              label: "Cluster",
              value: VMwareAppConstant.Asset_Types[1],
            };
            this.assetData.assetname = this.assetData.clustername;
            this.assetData.assetid = this.assetData.clusterrefid;
            this.assetData.id = this.assetData.clusterid;
            this.assetData.cloudprovider = this.filters.provider;
            break;
          case VMwareAppConstant.Asset_Types[2]:
            this.viewVMAssetDetails = true;
            this.assetname = {
              label: "Data Center",
              value: VMwareAppConstant.Asset_Types[2],
            };
            this.assetData.assetname = this.assetData.dcname;
            this.assetData.assetid = this.assetData.dcrefid;
            this.assetData.id = this.assetData.dcid;
            this.assetData.cloudprovider = this.filters.provider;
            break;
          case VMwareAppConstant.Asset_Types[3]:
            this.viewVMAssetDetails = true;
            this.assetname = {
              label: "Host",
              value: VMwareAppConstant.Asset_Types[3],
            };
            this.assetData.assetname = this.assetData.hostname;
            this.assetData.assetid = this.assetData.hostrefid;
            this.assetData.id = this.assetData.hostid;
            this.assetData.cloudprovider = this.filters.provider;
            break;
          default:
            break;
        }
      } else {
        if (this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2) {
          if (this.filters.asset == "ASSET_NETWORK") {
            this.networkid = e.data.networkid;
            this.assetData.instanceid = e.data.networkid;
            this.networkDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_LB") {
            this.lbid = e.data.loadbalancerid;
            this.assetData.instanceid = e.data.loadbalancerid;
            this.lbDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_IG") {
            this.gatewayid = e.data.internetgatewayid;
            this.assetData.instanceid = e.data.internetgatewayid;
            this.gatewayDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_FIREWALL") {
            this.firewallid = e.data.vsrxid;
            this.assetData.instanceid = e.data.vsrxid;
            this.firewallDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_CFG") {
            this.cfgid = e.data.cfgatewayid;
            this.assetData.instanceid = e.data.cfgatewayid;
            this.cfgDetailVisible = true;
          }
        }
        if (this.filters.provider == AppConstant.CLOUDPROVIDER.AWS) {
          if (this.filters.asset == "ASSET_VPC") {
            this.awsvpcid = e.data.vpcid;
            this.awsvpcobj = e.data;
            this.assetData.instanceid = e.data.vpcid;
            this.awsvpcDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_SUBNET") {
            this.awssubnetid = e.data.subnetid;
            this.awssubnetobj = e.data;
            this.assetData.instanceid = e.data.subnetid;
            this.awssubnetDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_SECURITYGROUP") {
            this.awssgid = e.data.securitygroupid;
            this.awssgobj = e.data;
            this.assetData.instanceid = e.data.securitygroupid;
            this.awssgDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_LB") {
            this.awslbid = e.data.lbid;
            this.awslbobj = e.data;
            this.awslbobj.listeners = JSON.parse(e.data.listeners);
            this.awslbobj.awssolution = e.data.awssolution;
            this.assetData.instanceid = e.data.lbid;
            this.awslbDetailVisible = true;
          }
          if (this.filters.asset == "ASSET_IG") {
            this.awsgatewayid = e.data.internetgatewayid;
            this.assetData.instanceid = e.data.internetgatewayid;
            this.awsgatewayDetailVisible = true;
          }
          if (
            this.filters.asset == "ASSET_S3" ||
            this.filters.asset == "ASSET_RDS" ||
            this.filters.asset == "ASSET_ECS" ||
            this.filters.asset == "ASSET_EKS"
          ) {
            this.showOtherAssets = true;
          }
        }
        if (this.filters.asset == "ASSET_VOLUME") {
          if (this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2) {
            this.getECL2VolumeByID(e.data.volumeid);
          }
          if (this.filters.provider == AppConstant.CLOUDPROVIDER.AWS) {
            this.getAWSVolumeByID(e.data.volumeid);
          }
          this.assetData.instanceid = e.data.volumeid;
        }
        if (this.filters.asset == "ASSET_INSTANCE") {
          this.rightsizegrpid = e.data.rightsizegrpid;
          this.openServerDetail(this.filters.provider, e.data.instancerefid);
          // this.getInstanceByID(e.data.instanceid);
        }
        this.getResizeHistory(e.data.instancerefid);
      }
    }
    if (e.chart) {
      this.showUtilChart(e.data);
    }
    if (e.filter) {
      this.filterableValues = [];
      this.filterKey = e.data.field;
      if (
        this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
        this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
        this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
      ) {
        if (this.filters.asset != "VIRTUAL_MACHINES") {
          this.getVMAssets();
        } else {
          if (e.data.field == "instancetyperefid") {
            this.filterableValues = [...this.instanceTypeList];
          } else {
            this.getFilterValue(null);
          }
        }
      } else {
        if (e.data.field == "zone") {
          this.filterableValues = [...this.zoneList];
        } else if (e.data.field == "instancetyperefid") {
          this.filterableValues = [...this.instanceTypeList];
        } else {
          this.getFilterValue(null);
        }
      }
      this.showFilter = true;
    }
    if (e.rightsize) {
      this.utilizationConfigs = {
        instanceid: e.data.instanceid,
        instancerefid: e.data.instancerefid,
        tenantid: e.data.tenantid,
        customerid: e.data.customerid,
        date: [moment().subtract(30, "days").toDate(), new Date()],
        disable: true,
      };
      this.rightSizeWindow = true;
    }
    if (e.applycolumnfilter) {
      this.selectedcolumns = [...e.selectedcolumns];
    }
    if (e.monitoring) {
      this.showMonitoring = true;
      this.instanceref = e.data;
      this.title = "Monitoring - " + e.data.instancename;
    }
    if (e.sync) {
      this.sync(e.data);
    }
  }
  checkConnectivity(data) {
    let obj = {
      tenantid: data.tenantid,
      instancename: data.instancename,
      privateipv4: data.privateipv4,
      cloudprovider: data.cloudprovider,
      platform: data.platform,
      instancerefid: data.instancerefid,
    };
    this.tableConfig.loading = true;
    this.orchService.checkConnect(obj).subscribe(
      (resp) => {
        this.tableConfig.loading = false;
        let response = JSON.parse(resp._body);
        if (response.status) {
          this.message.success(
            "Connection established Successfully for the instance " +
            data.instancename
          );
        } else {
          this.message.error("Error while connecting " + data.instancename);
        }
      },
      (err) => {
        this.tableConfig.loading = false;
        this.message.error("Error while connecting " + data.instancename);
      }
    );
  }
  getInstanceType() {
    let response = {} as any;
    let query = {} as any;
    query = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsinstancetype(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.instanceTypeList = response.data.map((el) => {
            el.instancetyperefid = el.instancetypename;
            return el;
          });
        }
      },
      (err) => { }
    );
  }
  resetFilters() {
    this.filters = { asset: null };
    this.filteredValues = {};
    this.searchText = "";
    this.assetList = [];
    this.assetTypes = [];
    this.tableConfig.manualpagination = false;
    this.totalCount = 0;
    this.tableConfig.count = "Total Records: " + this.totalCount;
  }
  getFilterValue(event) {
    if (
      this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
    ) {
      if (this.filters.asset != "VIRTUAL_MACHINES") {
        this.filterText = event;
        this.getVMAssets();
        return false;
      }
    }

    if (this.filterKey == "zone") {
      if (event) {
        this.filterableValues = this.zoneList.filter((el) => {
          return el.zonename.includes(event);
        });
      } else {
        this.filterableValues = this.zoneList;
      }
    } else if (this.filterKey == "instancetyperefid") {
      if (event) {
        this.filterableValues = this.instanceTypeList.filter((el) => {
          return el.instancetyperefid.includes(event);
        });
      } else {
        this.filterableValues = this.instanceTypeList;
      }
    } else {
      let f = {
        ...this.filters,
        data: {
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
        },
      };

      if (event) {
        f["searchText"] = event;
      }
      f["group"] = true;
      f["headers"] = [{ field: this.filterKey }];

      if (f["zone"]) f["zone"] = [f["zone"]];
      if (f["customers"]) f["customers"] = [f["customers"]];
      if (f["accounts"]) f["accounts"] = [f["accounts"]];
      if (f["tagid"] == null) delete f["tagid"];
      if (f["tagvalue"] == null) delete f["tagvalue"];
      if (f["customers"] == null) delete f["customers"];
      if (f["accounts"] == null) delete f["accounts"];

      if (f["zone"] == null) delete f["zone"];
      this.assetService.listByFilters(f).subscribe((result) => {
        let response = JSON.parse(result._body);
        this.filterableValues = response.data.assets;
      });
    }
  }
  getECL2VolumeByID(id) {
    this.ecl2Service.getByVolume(id, `?asstdtls=${true}`).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.prepareVolumeMeta(response.data);
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
  getAWSVolumeByID(id) {
    this.awsService
      .awsgetVolume(id, `?plantype=${this.assetData.sizeingb}`)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.prepareVolumeMeta(response.data);
        }
      });
  }
  getInstanceByID(id) {
    this.commonService
      .getInstance(
        id,
        `?asstdtls=${true}&cloudprovider=${this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2
          ? AppConstant.CLOUDPROVIDER.ECL2
          : this.filters.provider
        }&costyn=${true}&tagyn=${true}`
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.instanceObj = response.data;
          // this.prepareServerMeta(response.data);
        }
      });
  }
  showUtilChart(data) {
    this.metaSideBarVisible = false;
    this.resizeObj.instancerefid = data.instancerefid;
    this.resizeObj.utilkey = "CPU_UTIL";
    this.resizeObj.customerid = data.customerid;
    this.resizeObj.provider =
      this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2
        ? AppConstant.CLOUDPROVIDER.ECL2
        : this.filters.provider;
    this.resizeObj.daterange = [
      moment().subtract(30, "days").toDate(),
      new Date(),
    ];
    this.isVisible = true;
  }
  getGroupList() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.groupService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.rightsizegroupList = response.data;
      } else {
        this.rightsizegroupList = [];
      }
    });
  }

  prepareTaggingComparison() {
    let tags = [];

    let existingTags = this.taggingComplianceForVm["tagvalues"];
    if (existingTags && existingTags.length > 0) {
      existingTags.forEach((element) => {
        let t1 = element;
        let t2 = this.complainceTags.find(
          (o) => o["tagname"] == t1["tag"]["tagname"]
        );
        tags.push({
          title: t1["tag"]["tagname"],
          exval: t1["tagvalue"],
          compval: t2 && t2["tagvalue"] ? t2["tagvalue"] : "",
          tagid: t1["tagid"],
          tagvalueid: t1["tagvalueid"],
          required: t1.tag.required ? true : false,
        });
      });
    }
    this.complainceTags.forEach((o) => {
      let t = tags.find((tag) => tag["title"] == o["tagname"]);

      if (!t) {
        tags.push({
          title: o["tagname"],
          exval: "",
          compval: o["tagvalue"] || "",
          tagid: o["tagid"],
          tagvalueid: o["tagvalueid"],
          required: o.required,
        });
      }
    });

    this.complianceTagDiff = tags;
    this.taggingComplianceComparison = true;
  }
  getAllGroups() {
    this.tagGroupService
      .all({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.tagGroupList = response.data.rows.map((o) => {
            if (o["resourcetype"] == AppConstant.TAGS.TAG_RESOURCETYPES[0]) {
              o["resourcetype"] = "Solution";
            } else {
              o["resourcetype"] = "Asset";
            }
            return o;
          });
        } else {
          this.tagGroupList = [];
        }
      });
  }
  tagComplianceDrawerChanges(e) {
    this.taggingComplianceComparison = false;
  }
  closeDrillDown() {
    this.showDetailedChart = false;
  }
  resizeDataChanged(data) {
    if (data.view) {
      this.viewResizeInstance = true;
    } else {
      this.viewResizeInstance = false;
    }
    this.selectedResizeInstance = data.data;
    this.confirmationWindow = true;
  }
  getResizeHistory(id) {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: "Active",
      resourcerefid: id,
      reqstatus: AppConstant.STATUS.CLOSED,
    };
    this.resizeService.allRequest(condition).subscribe(
      (result: any) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          this.resizeReqList = response.data;
          this.originalPlan = this.resizeReqList[0].currentplan.plantype;
          this.calculateResourceCost(this.resizeReqList);
          this.resizeReqList.forEach((element) => {
            element.plantype = element.upgradeplan
              ? element.upgradeplan.plantype
              : null;
            element.rightsizeyn = "Y";
            element.originalplan = this.originalPlan;
            element.previousplan = element.currentplan
              ? element.currentplan.plantype
              : null;
            // element.cost = element.upgradeplan ? element.upgradeplan.cost : null;
            return element;
          });
        } else {
          this.resizeReqList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  adhocResizeReq() {
    this.adhocResize = true;
    this.selectedInstance = {
      ...this.instanceObj,
      tenantname: this.instanceObj.customer.tenant.tenantname,
      createddt: this.instanceObj.createddt,
      currentplanid: this.instanceObj.costvisual[0].costvisualid,
      currentplan: this.instanceObj.instancetyperefid,
      currentplancost: this.commonService.calculateRecommendationPrice(
        this.instanceObj.costvisual[0].pricingmodel,
        this.instanceObj.costvisual[0].priceperunit,
        this.instanceObj.costvisual[0].currency,
        true
      ),
      currentplanccy: this.instanceObj.costvisual[0].currency,
    };
  }
  notifyAdhocEntry(val) {
    this.adhocResize = false;
  }
  resizeInstance(data) {
    this.gettingAssets = true;
    let formData = [] as any;
    let endpoint = "" as any;
    let obj = {} as any;
    obj.region = data.instance.region;
    obj.tenantid = data.tenantid;
    obj.instanceid = data.instance.instanceid;
    obj.instancename = data.instance.instancename;
    obj.instancerefid = data.instance.instancerefid;
    obj.customerid = data.customerid;
    obj.ecl2tenantid = data.customer.ecl2tenantid;
    obj.instancetype = data.currentplan.plantype;
    obj.upgraderequestid = data.upgraderequestid;
    obj.srvrequestid = data.srvrequestid;
    obj.currplantype = data.currplantype;
    obj.upgradeplantype = data.upgradeplantype;
    obj.revert = true;
    formData.push(obj);
    // });
    if (data.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
      endpoint = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.ECL2INSTANCERESIZE;
    } else if (data.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
      endpoint = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.AWSINSTANCERESIZE;
    }
    // this.httpHandler.POST(AppConstant.API_END_POINT + endpoint, formData).subscribe((res) => {
    //   this.gettingAssets = false;
    //   const response = JSON.parse(res._body);
    //   this.message.info(response.message);
    //   this.onChanged(false);
    // });
    this.gettingAssets = false;
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
        return element;
      });
    }
  }
  prepareServerMeta(data: object) {
    this.metaTagsEnabled = true;

    let details = {} as any;
    let ssmdata = JSON.parse(data["ssmdata"]);
    if (this.filters.provider == AppConstant.CLOUDPROVIDER.AWS) {
      details = {
        Info: [
          {
            title: "Customer Name",
            value:
              data["customer"] != null
                ? data["customer"]["customername"] || "-"
                : "-",
          },
          {
            title: "Tenant Id",
            value:
              data["customer"] != null
                ? data["customer"]["awsaccountid"] || "-"
                : "-",
          },
          { title: "Instance Name", value: data["instancename"] },
          { title: "Instance Id", value: data["instancerefid"] },
          { title: "Region", value: data["region"] },
          {
            title: "Zone",
            value:
              data["awszones"] != null
                ? data["awszones"]["zonename"] || "-"
                : "-",
          },
          { title: "Status", value: "Active" },
        ],
        Image: [
          {
            title: "Image Name",
            value: data["awsimage"] ? data["awsimage"]["aminame"] || "-" : "-",
          },
          {
            title: "Image ID",
            value: data["awsimage"] ? data["awsimage"]["awsamiid"] || "-" : "-",
          },
          {
            title: "Platform",
            value: data["awsimage"] ? data["awsimage"]["platform"] || "-" : "-",
          },
          {
            title: "Notes",
            value: data["awsimage"] ? data["awsimage"]["notes"] || "-" : "-",
          },
        ],
        Specification: [
          { title: "Instance Type", value: data["instancetyperefid"] },
          {
            title: "CPU",
            value: data["awsinstance"]
              ? data["awsinstance"]["vcpu"] || "-"
              : "-",
          },
          {
            title: "Memory",
            value: data["awsinstance"]
              ? data["awsinstance"]["memory"] || "-"
              : "-",
          },
        ],
        "IP Addresses": [
          { title: "Private IP", value: data["privateipv4"] },
          { title: "Public IP", value: data["publicipv4"] || "-" },
        ],
        // 'Volume': [
        //   { "title": 'Volume Type', "value": data['awsvolume'] ? data['awsvolume']['volumetype'] || '-' : '-' },
        //   { "title": 'Volume ID', "value": data['awsvolume'] ? data['awsvolume']['awsvolumeid'] || '-' : '-' },
        //   { "title": 'Size (Gb)', "value": data['awsvolume'] ? data['awsvolume']['sizeingb'] || '-' : '-' },
        //   { "title": 'Encrypted', "value": data['awsvolume'] ? data['awsvolume']['encryptedyn'] || '-' : '-' },
        //   { "title": 'Notes', "value": data['awsvolume'] ? data['awsvolume']['notes'] || '-' : '-' },
        // ]
      };
      if (ssmdata != null) {
        details["SSM Agent"] = [
          { title: "Agent Version", value: ssmdata["AgentVersion"] || "-" },
          { title: "Platform", value: ssmdata["PlatformType"] || "-" },
          {
            title: "Operating System",
            value: ssmdata["PlatformName"] || "-",
          },
          { title: "Status", value: data["ssmagentstatus"] || "-" },
        ];
      }
      this.metaVolumes = {
        tagTableConfig: {
          edit: false,
          delete: false,
          globalsearch: false,
          loading: false,
          pagination: false,
          pageSize: 1000,
          title: "",
          widthConfig: ["30px", "25px", "25px", "25px", "25px"],
        },
        volumeList: [],
        Volume: [
          { field: "volumetype", header: "Volume Type", datatype: "string" },
          { field: "awsvolumeid", header: "Volume ID", datatype: "string" },
          { field: "sizeingb", header: "Size (Gb)", datatype: "string" },
          { field: "encryptedyn", header: "Encrypted", datatype: "string" },
          { field: "notes", header: "Notes", datatype: "string" },
        ],
      };
      if (data["attachedvolumes"] && data["attachedvolumes"].length > 0) {
        data["attachedvolumes"].forEach((element) => {
          this.metaVolumes.volumeList.push(element.volume);
        });
      }

      this.awssgobj = data["awssgs"];
      this.assetData.instanceid = data["securitygroupid"];
    } else {
      details = {
        Info: [
          { title: "Customer Name", value: data["customer"]["customername"] },
          { title: "Teanant Id", value: data["customer"]["ecl2tenantid"] },
          { title: "Instance Name", value: data["instancename"] },
          { title: "Instance Id", value: data["instancerefid"] },
          { title: "Region", value: data["region"] },
          { title: "Zone", value: data["ecl2zones"]["zonename"] },
          { title: "Status", value: "Active" },
        ],
        Image: [
          {
            title: "Image Name",
            value: data["image"] ? data["image"]["imagename"] : null,
          },
          {
            title: "Image ID",
            value: data["image"] ? data["image"]["ecl2imageid"] : null,
          },
          {
            title: "Platform",
            value: data["image"] ? data["image"]["platform"] : null,
          },
          {
            title: "Notes",
            value: data["image"] ? data["image"]["notes"] : null,
          },
        ],
        Specification: [
          { title: "Instance Type", value: data["instancerefid"] },
          { title: "CPU", value: data["instance"]["vcpu"] },
          { title: "Memory", value: data["instance"]["memory"] },
        ],
        "IP Addresses": [
          { title: "Private IP", value: data["privateipv4"] },
          { title: "Public IP", value: data["publicipv4"] || "-" },
        ],
        // 'Volume': [
        //   { "title": 'Volume Name', "value": data['volume'] ? data['volume']['volumename'] || '-' : '-' },
        //   { "title": 'Volume ID', "value": data['volume'] ? data['volume']['ecl2volumeid'] || '-' : '-' },
        //   { "title": 'Size (Gb)', "value": data['volume'] ? data['volume']['size'] || '-' : '-' },
        //   { "title": 'I/O Operations', "value": data['volume'] ? data['volume']['iopspergb'] || '-' : '-' },
        //   { "title": 'Notes', "value": data['volume'] ? data['volume']['notes'] || '-' : '-' },
        //   { "title": 'Public IP', "value": data['publicipv4'] || '-' },
        // ]
      };
      this.metaVolumes = {
        tagTableConfig: {
          edit: false,
          delete: false,
          globalsearch: false,
          loading: false,
          pagination: false,
          pageSize: 1000,
          title: "",
          widthConfig: ["30px", "25px", "25px", "25px", "25px", "25px"],
        },
        volumeList: [],
        Volume: [
          { field: "volumename", header: "Volume Name", datatype: "string" },
          { field: "ecl2volumeid", header: "Volume ID", datatype: "string" },
          { field: "size", header: "Size (Gb)", datatype: "string" },
          { field: "iopspergb", header: "I/O Operations", datatype: "string" },
          { field: "publicipv4", header: "Public IP", datatype: "string" },
          { field: "notes", header: "Notes", datatype: "string" },
        ],
      };
      if (
        data["ecl2attachedvolumes"] &&
        data["ecl2attachedvolumes"].length > 0
      ) {
        data["ecl2attachedvolumes"].forEach((element) => {
          this.metaVolumes.volumeList.push(element.volume);
        });
      }
    }

    if (data["tagvalues"] && data["tagvalues"].length > 0) {
      this.metaTags = this.tagService.decodeTagValues(data["tagvalues"]);
      this.metaTagsList = this.tagService.prepareViewFormat(data["tagvalues"]);
    } else {
      this.metaTags = [];
      this.metaTagsList = [];
    }

    this.selectedRows = [data];

    this.metaSideBarTitle = "Server" + " (" + data["instancename"] + ") ";
    this.meta = details;
    // if (this.filters.provider == 'ECL2') {
    this.resizeinstancerefid = data["instancerefid"];
    this.enableServerResize = true;
    // }
    this.metaSideBarVisible = true;
  }

  prepareVolumeMeta(data: object) {
    this.metaTagsEnabled = false;
    this.enableServerResize = false;
    if (this.filters.provider == AppConstant.CLOUDPROVIDER.AWS) {
      data["volumename"] = data["volumetype"];
      data["cloudid"] = data["awsvolumeid"];
      data["size"] = data["sizeingb"];
      data["region"] = data["tenantregion"]["region"];
      data["zonename"] = data["tenantregion"]["region"];
    }
    if (this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2) {
      data["cloudid"] = data["ecl2volumeid"];
      data["region"] = data["ecl2zones"]
        ? data["ecl2zones"]["region"] || "-"
        : "-";
      data["zonename"] = data["ecl2zones"]
        ? data["ecl2zones"]["zonename"] || "-"
        : "-";
    }
    let details = {
      Info: [
        { title: "Volume Name", value: data["volumename"] || "-" },
        { title: "Volume ID", value: data["cloudid"] || "-" },
        { title: "Size (Gb)", value: data["size"] || "-" },
        { title: "I/O Operations", value: data["iopspergb"] || "-" },
        { title: "Notes", value: data["notes"] || "-" },
      ],
      Region: [
        { title: "Region", value: data["region"] },
        { title: "Zone", value: data["zonename"] },
      ],
      Attachments: [
        {
          title: "Instance Name",
          value: data["instance"]
            ? data["instance"]["instancename"] || "-"
            : "-",
        },
        {
          title: "Instance Type",
          value: data["instance"]
            ? data["instance"]["instancetyperefid"] || "-"
            : "-",
        },
      ],
    };

    if (data["tagvalues"] && data["tagvalues"].length > 0) {
      this.metaTags = this.tagService.decodeTagValues(data["tagvalues"]);
      this.metaTagsList = this.tagService.prepareViewFormat(data["tagvalues"]);
    } else {
      this.metaTags = [];
      this.metaTagsList = [];
    }

    this.selectedRows = [data];

    this.metaSideBarTitle = "Volume";
    this.meta = details;
    this.metaSideBarVisible = true;
  }

  metaTagsChanges(e) {
    if (e["mode"] == "combined") {
      this.metaTagsSideBarVisible = false;
      this.metaTags = e.data;
      this.tags = e.data;
      this.metaTagsList = this.tagService.prepareViewFormat(e.data);
    }
  }

  onChanged(e) {
    this.tagManager = false;
    this.serverResize = false;
    this.networkDetailVisible = false;
    this.isVisible = false;
    this.rightSizeWindow = false;
    this.lbDetailVisible = false;
    this.gatewayDetailVisible = false;
    this.awsgatewayDetailVisible = false;
    this.firewallDetailVisible = false;
    this.cfgDetailVisible = false;
    this.showOtherAssets = false;
    this.metaSideBarVisible = false;
    this.bulkTagsVisible = false;
    this.awsvpcDetailVisible = false;
    this.awssubnetDetailVisible = false;
    this.awssgDetailVisible = false;
    this.awslbDetailVisible = false;
    this.showFilter = false;
    this.filterKey = null;
    this.showMonitoring = false;
    this.tagsList = [];
    this.tags = [];
    // this.getAssets();
  }

  notifyDetailEntry(event) {
    this.currentConfigs = this.serverUtilsService.getItems();
    if (this.currentConfigs) {
      this.utilizationDetailConfigs = {
        utiltype: this.currentConfigs.utiltype,
        utilkey: this.currentConfigs.utilkey,
        instancerefid: this.currentConfigs.instancerefid,
        date: this.currentConfigs.date,
        tenantid: this.currentConfigs.tenantid,
        utilkeyTitle: this.currentConfigs.utilkeyTitle,
      };
    }
    this.showDetailedChart = true;
  }
  tagDrawerChanges(e) {
    this.tagManager = false;
  }

  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagManager = false;
      this.tags = e.data;
      this.tagsList = this.tagService.prepareViewFormat(e.data);
    }
  }

  vmwareTagUpdate(data) {
    this.tagValueService
      .bulkupdate(data, `?vmware=${true}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.info("Tags synced to cloud.");
          this.syncingTagstoCloud = false;
          this.bulkTagsVisible = false;
          this.tagsList = [];
          this.tags = [];
          this.getAssets();
        } else {
          this.message.error(response.message);
          this.syncingTagstoCloud = false;
          this.bulkTagsVisible = false;
        }
      });
  }

  syncTags() {
    try {
      const nttPrimaryKeyMaps = {
        ASSET_LB: "loadbalancerid",
        ASSET_FIREWALL: "vsrxid",
        ASSET_NETWORK: "networkid",
        ASSET_IG: "internetgatewayid",
        ASSET_CFG: "cfgatewayid",
        ASSET_VOLUME: "volumeid",
        ASSET_INSTANCE: "instanceid",
      };
      const nttRefKeyMaps = {
        ASSET_LB: "ecl2loadbalancerid",
        ASSET_FIREWALL: "ecl2vsrxid",
        ASSET_NETWORK: "ecl2networkid",
        ASSET_IG: "ecl2internetgatewayid",
        ASSET_CFG: "cfgatewayid",
        ASSET_VOLUME: "ecl2volumeid",
        ASSET_INSTANCE: "instancerefid",
      };
      const awsPrimaryKeyMaps = {
        ASSET_INSTANCE: "instanceid",
        ASSET_VOLUME: "volumeid",
        ASSET_VPC: "vpcid",
        ASSET_SUBNET: "subnetid",
        ASSET_SECURITYGROUP: "securitygroupid",
        ASSET_LB: "lbid",
      };
      const awsRefKeyMaps = {
        ASSET_INSTANCE: "instancerefid",
        ASSET_VPC: "awsvpcid",
        ASSET_SUBNET: "awssubnetd",
        ASSET_SECURITYGROUP: "awssecuritygroupid",
        ASSET_LB: "lbid",
      };
      const vmwarePrimaryKeys = {
        VIRTUAL_MACHINES: "instanceid",
      };
      const vmwareRefKeys = {
        VIRTUAL_MACHINES: "instancerefid",
      };
      let vmwareTagValues = [];

      if (Array.isArray(this.tags) && this.tags.length > 0) {
        this.syncingTagstoCloud = true;
        let assets = [];
        this.selectedRows.forEach((asset) => {
          if (this.filters["provider"] == AppConstant.CLOUDPROVIDER.ECL2) {
            assets.push({
              id: asset[nttPrimaryKeyMaps[this.filters["asset"]]],
              refid: asset[nttRefKeyMaps[this.filters["asset"]]],
              ecl2tenantid: asset["customerdetail"]["ecl2tenantid"],
              region: asset["customerdetail"]["ecl2region"],
            });
          }
          if (this.filters["provider"] == AppConstant.CLOUDPROVIDER.AWS) {
            let d = {
              id: asset[awsPrimaryKeyMaps[this.filters["asset"]]],
              refid: asset[awsRefKeyMaps[this.filters["asset"]]],
              region:
                asset["tenantregion"] && asset["tenantregion"][0]
                  ? asset["tenantregion"][0].region
                  : asset["zone"],
              customerid: asset["customerid"],
              tnregionid: asset["tnregionid"],
            };

            assets.push(d);
          }

          if (
            this.filters["provider"] == AppConstant.CLOUDPROVIDER.SENTIA ||
            this.filters["provider"] == AppConstant.CLOUDPROVIDER.EQUINIX ||
            this.filters["provider"] == AppConstant.CLOUDPROVIDER.NUTANIX
          ) {
            this.tags.forEach((element) => {
              if (
                element.status &&
                element.status == AppConstant.STATUS.ACTIVE
              ) {
                vmwareTagValues.push({
                  cloudprovider: this.filters.provider,
                  resourcetype: this.filters.asset,
                  resourceid: asset[vmwarePrimaryKeys[this.filters["asset"]]],
                  resourcerefid: asset[vmwareRefKeys[this.filters["asset"]]],
                  tagid: element.tag.tagid,
                  tagname: element.tag.tagname,
                  tagvalue: element.tagvalue,
                  attributerefid: element.attributerefid,
                  tenantid: this.userstoragedata.tenantid,
                  createddt: new Date(),
                  createdby: this.userstoragedata.fullname,
                  status: AppConstant.STATUS.ACTIVE,
                });
              }
            });
          }
        });

        if (
          this.filters["provider"] == AppConstant.CLOUDPROVIDER.SENTIA ||
          this.filters["provider"] == AppConstant.CLOUDPROVIDER.EQUINIX ||
          this.filters["provider"] == AppConstant.CLOUDPROVIDER.NUTANIX
        ) {
          this.vmwareTagUpdate(vmwareTagValues);
          return false;
        }

        let tagValues = [];
        this.tags.forEach((element) => {
          if (element.status && element.status == AppConstant.STATUS.ACTIVE) {
            tagValues.push({
              tagid: element.tag.tagid,
              tagname: element.tag.tagname,
              tagvalue: element.tagvalue,
              attributerefid: element.attributerefid,
            });
          }
        });

        let data = {
          assets: assets,
          tagvalues: tagValues,
          tenantid: this.userstoragedata.tenantid,
          cloudprovider:
            this.filters["provider"] == AppConstant.CLOUDPROVIDER.ECL2
              ? AppConstant.CLOUDPROVIDER.ECL2
              : this.filters["provider"],
          resourcetype: this.filters["asset"],
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
        };

        this.httpHandler
          .POST(
            AppConstant.API_END_POINT +
            (this.filters["provider"] == AppConstant.CLOUDPROVIDER.ECL2
              ? AppConstant.API_CONFIG.API_URL.OTHER.ECL2ASSETMETAUPDATE
              : AppConstant.API_CONFIG.API_URL.OTHER.AWSASSETMETAUPDATE),
            data
          )
          .subscribe((result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.message.info("Tags synced to cloud.");
              this.tagsList = [];
              this.tags = [];
              this.bulkTagsVisible = false;
              this.getAssets();
            } else {
              this.message.error(response.message);
            }
            this.syncingTagstoCloud = false;
          });
      }
    } catch (e) {
      this.syncingTagstoCloud = false;
      this.message.error("Sorry! Something gone wrong");
    }
  }

  downloadAssets() {
    this.isdownload = true;
    // if (
    //   this.filters.provider == AppConstant.CLOUDPROVIDER.AWS ||
    //   this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
    //   this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX
    // ) {
    //   if (this.filters.asset != "VIRTUAL_MACHINES") {
    //     this.getVMAssets(10, 0);
    //   } else {
    //     this.getAssets(10, 0);
    //   }
    // }
    if (
      this.filters.provider == AppConstant.CLOUDPROVIDER.SENTIA ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.EQUINIX ||
      this.filters.provider == AppConstant.CLOUDPROVIDER.NUTANIX
    ) {
      if (this.filters.asset != "VIRTUAL_MACHINES") {
        this.getVMAssets(10, 0);
      } else {
        this.getAssets(10, 0);
      }
    } else {
      this.getAssets(10, 0);
    }
    // if (this.assetList) {
    //   let avaltags: any = [];
    //   this.assetList.forEach((asset) => {
    //     if (asset.tagvalues && asset.tagvalues.length > 0) {
    //       asset.tagvalues.forEach((tagvalue) => {
    //         avaltags.push(tagvalue.tag.tagname);
    //       });
    //     }
    //   });
    //   avaltags = _.uniqWith(avaltags, _.isEqual); //removed duplicates;

    //   let columns: any = [];
    //   let filterList: any = [];
    //   columns = _.map(this.tableHeader, function (value) {
    //     return value.field;
    //   });

    //   this.assetList.forEach((asset) => {
    //     let obj = _.pick(asset, columns);
    //     let subobj: any = {};

    //     this.tableHeader.forEach((head) => {
    //       subobj[head.header] = obj[head.field];
    //     });
    //     if (avaltags && avaltags.length > 0) {
    //       avaltags.forEach((tagvalue) => {
    //         if (asset.tagvalues && asset.tagvalues.length > 0) {
    //           let object = _.find(asset.tagvalues, function (o) {
    //             if (o.tag.tagname == tagvalue) {
    //               return o;
    //             }
    //           });
    //           if (object) {
    //             subobj[tagvalue] = object.tagvalue;
    //           } else {
    //             subobj[tagvalue] = "-";
    //           }
    //         } else {
    //           subobj[tagvalue] = "-";
    //         }
    //       });
    //     }
    //     filterList.push(subobj);
    //   });

    //   this.jsonCsvService.downloadCSVfromJson(filterList, this.filters.asset);
    // }
  }
  redirectData(data) {
    this.getResourceID(data, data.cloudprovider);
  }
  getResourceID(data, provider) {
    this.tableConfig.loading = true;
    this.assetService
      .listAsset(
        {
          tenantid: this.userstoragedata.tenantid,
          resourcerefid: data.instancerefid,
          cloudprovider: provider,
          status: "Active",
          crnresourceid: { $ne: null },
          // crn:
          //   provider == AppConstant.CLOUDPROVIDER.AWS
          //     ? AssetConstant.AWS_CRN
          //     : AssetConstant.VM_CRN,
        },
        "?list=true"
      )
      .subscribe(
        (d) => {
          this.tableConfig.loading = false;
          let response = JSON.parse(d._body);
          if (
            response.status &&
            response.data &&
            response.data[0].crnresourceid
          ) {
            this.viewKeyDetail({
              crn: response.data[0].crnresourceid.split("/")[0],
              resourceid: response.data[0].crnresourceid.split("/")[1],
            });
          } else {
            this.showCMDBDialog = true;
          }
        },
        (err) => {
          this.tableConfig.loading = false;
        }
      );
  }
  viewKeyDetail(selectedData) {
    // call api to get the header and details of the assets
    this.tableConfig.loading = true;
    this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
        ],
        selectedData.crn
      )
      .subscribe(
        (d) => {
          let hdrresponse = JSON.parse(d._body);
          this.selectedCMDBData.resourceid =
            selectedData.crn + "/" + selectedData.resourceid;
          this.assetRecordService
            .getResourceValuesById(
              btoa(selectedData.crn + "/" + selectedData.resourceid)
            )
            .subscribe(
              (r) => {
                this.tableConfig.loading = false;

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
                this.selectedCMDBData.keyvalue = hdrresponse;
                this.selectedCMDBData.keydata = data;
                this.selectedCMDBData.inbound = dtlresponse.inbound;
                this.selectedCMDBData.referringassets =
                  dtlresponse.referringassets;
                this.showCMDB = true;
              },
              (err) => {
                this.tableConfig.loading = false;
              }
            );
        },
        (err) => {
          this.tableConfig.loading = false;
        }
      );
  }
  getDownloadLabel() {
    let assetType = this.assetTypes.find((el) => {
      return el.value == this.filters.asset;
    });
    if (assetType != undefined) return assetType.title;
  }
  createCMDBdata() {
    this.tableConfig.loading = true;
    let assetdetails = [];
    const resourceTimeStamp = Date.now().toString();
    let crn =
      this.assetData.cloudprovider == AppConstant.CLOUDPROVIDER.AWS
        ? AssetConstant.AWS_CRN
        : AssetConstant.VM_CRN;
    let crnresourceid = (crn + "/" + resourceTimeStamp).toString();
    let detailObj: any = {
      crn: crn,
      fieldkey: "",
      fieldvalue: "",
      resourceid: crnresourceid,
      status: "Active",
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      tenantid: this.userstoragedata.tenantid,
    };

    AssetConstant.ASSET_DTL_KEYS.forEach((key, i) => {
      let detailData = { ...detailObj };
      detailData.fieldkey = crn + key;
      if (i == 0 || i == 1) detailData.fieldvalue = this.assetData.instancename;
      if (i == 2 || i == 3)
        detailData.fieldvalue = moment().format("DD/MMM/YY h:mm A");
      if (i == 4) detailData.fieldvalue = this.assetData.privateipv4;
      if (i == 5) detailData.fieldvalue = this.assetData.publicipv4;
      if (i == 6) detailData.fieldvalue = this.assetData.instancerefid;
      assetdetails.push(detailData);
    });
    if (this.instanceObj.attachedvolumes) {
      this.instanceObj.attachedvolumes.forEach((vol, i) => {
        let volObj = { ...detailObj };
        volObj.fieldkey = crn + "/fk:hdd" + (i + 1);
        volObj.fieldvalue = vol.volume.sizeingb;
        assetdetails.push(volObj);
      });
    }
    if (this.instanceObj.instancetyperefid) {
      this.assetRecordService
        .getResourceByFilter({
          filters: [
            { key: "fieldvalue", value: this.instanceObj.instancetyperefid },
          ],
          tenantid: this.userstoragedata.tenantid,
          crn: AssetConstant.ASSET_TYPE_CRN,
        })
        .subscribe((d) => {
          let hdrresponse = JSON.parse(d._body);
          if (
            hdrresponse.status &&
            hdrresponse.data &&
            hdrresponse.data.fieldvalue
          ) {
            let resourceid = hdrresponse.data.resourceid.split("/")[1];
            let typeObj = { ...detailObj };
            typeObj.fieldkey = crn + AssetConstant.ASSET_TYPE_KEY;
            typeObj.fieldvalue = JSON.stringify([
              {
                resourceid,
                name: this.assetData.instancetyperefid,
                crn: AssetConstant.ASSET_TYPE_VALUE,
              },
            ]);
            assetdetails.push(typeObj);
            this.createAssetDetail(assetdetails, crn, resourceTimeStamp);
            this.createAssetCMDBMapping(crnresourceid);
          } else {
            this.createAssetCMDBMapping(crnresourceid);
            this.createAssetDetail(assetdetails, crn, resourceTimeStamp);
          }
        });
    } else {
      this.createAssetCMDBMapping(crnresourceid);
      this.createAssetDetail(assetdetails, crn, resourceTimeStamp);
    }
  }
  createAssetCMDBMapping(crnresourceid) {
    try {
      let reqObj = {
        tenantid: this.userstoragedata.tenantid,
        resourcerefid: this.assetData.instancerefid,
        crnresourceid: crnresourceid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        isRecord: true,
      } as any;
      reqObj.createddt = new Date();
      reqObj.createdby = this.userstoragedata.fullname;
      reqObj.status = "Active";
      reqObj.cloudprovider = this.assetData.cloudprovider;
      reqObj.resourcetype = this.filters.asset;
      this.assetService.createAssetMapping(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
      });
    } catch (e) {
      console.error("Error");
    }
  }
  createAssetDetail(assetdetails, crn, resourceTimeStamp) {
    let reqObj = {
      assetdetails: assetdetails,
    };
    this.assetRecordService.bulkcreateDetail(reqObj).subscribe(
      (res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          if (this.instanceObj.tagvalues) {
            let tagvalues = this.instanceObj.tagvalues;
            tagvalues.forEach((tag) => {
              tag.resourcerefid = (crn + "/" + resourceTimeStamp).toString();
              tag.createdby = this.userstoragedata.fullname;
              tag.createddt = new Date();
              tag.lastupdatedby = this.userstoragedata.fullname;
              tag.lastupdateddt = new Date();
              tag.resourcetype = "ASSET_RECORD";
              delete tag["tagvalueid"];
              Object.keys(tag).forEach((key) => {
                if (!tag[key]) delete tag[key];
              });
            });
            if (tagvalues.length > 0) {
              this.tagValueService.bulkcreate(tagvalues).subscribe((res) => {
                this.getResourceID(
                  this.assetData,
                  this.assetData.cloudprovider
                );
              });
            } else {
              this.getResourceID(this.assetData, this.assetData.cloudprovider);
            }
          } else {
            this.getResourceID(this.assetData, this.assetData.cloudprovider);
          }
          this.message.success(response.message);
        } else {
          this.message.error(response.message);
        }
      },
      (err) => {
        this.message.success("Unable to add recrod.");
      }
    );
  }
  onchangeCustomerSelection(event) {
    console.log();
    let req = {
      customerid: event,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.assetService.listProducts(req).subscribe((result) => {
      this.gettingAssets = false;
      let response = JSON.parse(result._body);
      this.productList = response.data;
    });
  }
  updateProductMapping() {
    console.log(this.selectedRows);
    console.log(this.selectedProduct);
    if (this.selectedRows.length > 0) {
      let list: any[] = [];
      _.each(this.selectedRows, (r) => {
        list.push({
          txn: r.instancerefid,
          txnid: r.instanceid,
          reference: this.selectedProduct.productname,
          refkey: this.selectedProduct.productid,
          module: this.cmdb_operationtype[8],
          status: AppConstant.STATUS.ACTIVE,
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
          updatedby: this.userstoragedata.fullname,
          updateddt: new Date(),
        });
      });
      let req = {
        list: list,
      };
      this.assetRecordService.bulkcreateTxnRef(req).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  sync(instanceobj) {
    let formData = {
      tenantid: this.userstoragedata.tenantid,
      updatedby: this.userstoragedata.fullname,
      instancename: instanceobj.instancename,
      ipaddr: instanceobj.privateipv4,
    } as any;
    this.WazuhService.updateWazhuAgent(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getAssets();
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
