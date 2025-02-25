import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { TagService } from "../../../business/base/tagmanager/tags.service";
import { CommonService } from "../../services/shared/common.service";
import { AppConstant } from "src/app/app.constant";
import { RightsizegroupService } from "src/app/business/base/rightsizegroup/rightsizegroup.service";
import { LocalStorageService } from "../../services/shared/local-storage.service";
import { ResizeRequestService } from "src/app/business/srm/upgrade-request/resize.service";
import { NzMessageService } from "ng-zorro-antd";
import { HttpHandlerService } from "../../services/http-handler.service";
import * as moment from "moment";
import { CommonFileService } from "../../services/commonfile.service";
import { Router } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import axios from "axios";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";


@Component({
  selector: "app-cloudmatiq-server-detail",
  styles: [],
  templateUrl: "./serverdetail.component.html",
})
export class ServerDetailComponent implements OnInit, OnChanges {
  @Input() instanceref: any; // search key instanceref -> 123123-123787 | 123 instancereftype -> instanceid | instancerefid
  @Output() showDrillDown: EventEmitter<any> = new EventEmitter();
  @Input() serverDetails: any;
  metricsPlatform = null as null | string;
  tabIndex = 0;
  instanceObj = {} as any;
  metaVolumes = null as any;
  metaProducts = null as any;
  meta = null as any;
  instanceRes = null as any;
  metaTags = [];
  loading = false;
  metaTagsList = [];
  tags = [];
  userstoragedata = {} as any;
  pricingModel = [];
  subtenantLabel = AppConstant.SUBTENANT;
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;

  // Rightsize Group
  rightsizegroupList = [];
  rightsizegrpid = null;
  resizeReqList = [];
  originalPlan = null;
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
  selectedInstance = null;

  awssgobj = null as any;

  adhocResizeRecommendPlanId = null;
  assetUtilization = {} as any; // For asset utilization sidebat
  utilizationDetailConfigs = null; // For asset drill down.

  // Loaders, Models & sidebars
  gettingDetails = true;
  metaTagsSideBarVisible = false;
  adhocResize = false;
  syncingTagstoCloud = false;
  isSyncTags = false;
  assetUtilizationVisible = false;
  vmware = false;
  resourcetype = "ASSET_INSTANCE";

  screens: any = [];
  appScreens: any = [];
  showbudget = false;
  tagupdate = false;
  showsg = false;
  updatecus = true;
  showOrch = false;
  showMonitoring = false;
  showSytmInfo = false;
  showCompliance = false;
  tabTitle = "Virtual Server Details";
  totalCount;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private httpHandler: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private resizeService: ResizeRequestService,
    private tagService: TagService,
    private groupService: RightsizegroupService,
    private awsService: AWSService,
    private message: NzMessageService,
    private tagValueService: TagValueService,
    private assetRecordService:AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_MANAGEMENT,
    });
    if (_.includes(this.appScreens.actions, "Show Budget & Billing")) {
      this.showbudget = true;
    }
    if (_.includes(this.appScreens.actions, "Tag Update")) {
      this.tagupdate = true;
    }
    if (_.includes(this.appScreens.actions, "Show Security Group")) {
      this.showsg = true;
    }
    if (_.includes(this.appScreens.actions, "Update Customer")) {
      this.updatecus = false;
    }
    if (_.includes(this.appScreens.actions, "Orchestration")) {
      this.showOrch = true;
    }
    if (_.includes(this.appScreens.actions, "Monitoring")) {
      this.showMonitoring = true;
    }
    if (_.includes(this.appScreens.actions, "Compliance")) {
      this.showCompliance = true;
    }
    if (_.includes(this.appScreens.actions, "System Info")) {
      this.showSytmInfo = true;
    }
  }
  ngOnInit() {
    this.getGroupList();
    this.getPricing();
  }
  tabChange(event) {
    this.tabIndex = event.index;
    this.tabTitle = event.tab._title;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.instanceref && changes.instanceref.currentValue) {
      this.getInstanceByID(changes.instanceref.currentValue["instanceref"]);
    }
  }

  // Common functions
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

  // Rightsize group
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
  adhocResizeReq() {
    this.selectedInstance = [
      {
        ...this.instanceObj,
        tenantname: this.instanceObj.customer.tenant.tenantname,
        createddt: this.instanceObj.createddt,
        currentplan: this.instanceObj.instancetyperefid,
        currentplanid: this.instanceObj.costvisual[0].costvisualid,
        currentplancost: this.commonService.calculateRecommendationPrice(
          this.instanceObj.costvisual[0].pricingmodel,
          this.instanceObj.costvisual[0].priceperunit,
          this.instanceObj.costvisual[0].currency,
          true
        ),
        currentplanccy: this.instanceObj.costvisual[0].currency,
      },
    ];
    this.adhocResize = true;
  }
  updateInstanceWithRightSizeGroup() {
    let obj = {
      instanceid: this.instanceref.instanceref,
      rightsizegrpid: this.rightsizegrpid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.rightsizegrpid) {
      this.commonService.updatedInstance(obj)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            // TODO: Need to be emitted for assetlist screens.
            // this.assetList.forEach((i) => {
            //     if (i.instanceid == this.assetData.instanceid) {
            //         i.rightsizegrpid = this.rightsizegrpid;
            //     }
            // });
            this.message.success("Updated Successfully");
          } else {
            this.message.error("Failed to update Rightsize group");
          }
        });
    } else {
      this.message.info("Please select rightsize group");
    }
  }
  resizeDataChanged(event) {
    if (event.rightsize) {
      this.adhocResizeRecommendPlanId = event.data.currentplan["plantype"];
      this.selectedInstance = [
        {
          ...this.instanceObj,
          tenantname: this.instanceObj.customer.tenant.tenantname,
          createddt: this.instanceObj.createddt,
          currentplan: this.instanceObj.instancetyperefid,
          currentplancost: this.commonService.calculateRecommendationPrice(
            this.instanceObj.costvisual[0].pricingmodel,
            this.instanceObj.costvisual[0].priceperunit,
            this.instanceObj.costvisual[0].currency,
            true
          ),
          currentplanccy: this.instanceObj.costvisual[0].currency,
        },
      ];
      this.adhocResize = true;
    }
  }

  // Server Details
  getInstanceByID(id) {
    this.gettingDetails = true;
    this.meta = {};
    this.metaVolumes = {};
    this.metaVolumes.tagTableConfig = {};
    this.metaVolumes.volumeList = [];
    this.commonService
      .getInstance(
        id,
        `?asstdtls=${true}&cloudprovider=${this.instanceref.cloudprovider
        }&costyn=${true}&tagyn=${true}&getbycolumn=${this.instanceref.instancereftype
        }&tenantid=${this.userstoragedata.tenantid}`
      )
      .subscribe((res) => {
        this.gettingDetails = false;
        const response = JSON.parse(res._body);
        if (response.status) {
          if (
            response.data.cloudprovider != AppConstant.CLOUDPROVIDER.AWS
          ) {
            this.vmware = true;
            this.resourcetype = "VIRTUAL_MACHINES";
            this.instanceRes = response.data;
            this.prepareServerMeta(response.data);
          } else {
            this.getSGData(response.data.securitygrouprefid);
            this.rightsizegrpid = response.data["rightsizegrpid"] || null;
            this.getResizeHistory(response.data["instancerefid"].toString());
            this.instanceRes = response.data;
            this.prepareServerMeta(response.data);
            this.getProduct();
          }
          this.selectedInstance = [response.data];
          this.instanceObj = {
            ...response.data,
            instancetype: this.resourcetype,
          };
        }
      });
  }
  getSGData(id) {
    let response = {} as any;
    this.awsService
      .allawssg({
        awssecuritygroupid: id,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.awssgobj = response.data[0];
          } else {
            this.awssgobj = {};
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
  }

  backToDashboard() {
    this.router.navigate(["assets"], { queryParams: { mode: "details" } });
  }
  getResizeHistory(id) {
    this.gettingDetails = true;
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
        this.gettingDetails = false;
      },
      (err) => {
        this.gettingDetails = false;
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  prepareServerMeta(data: object) {
    this.gettingDetails = true;
    this.metaTagsList = [];
    let ssmdata;
    let details;
    this.metricsPlatform = data["platform"];
    try{
      ssmdata = JSON.parse(data["ssmagent"]);
    }catch(e){
      console.log(e);
    }
    if (this.instanceref.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
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
          // { title: "Status", value: "Active" },
          { title: "Cloud Status", value: data["cloudstatus"] },
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
          let data = this.metaVolumes.volumeList.push(element.volume);
        });
      }
      this.metaProducts = {
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
        productList: [],
        Products: [
          { field: "reference", header: "Product Name", datatype: "string" },
          { field: "createddt", header: "Created On", datatype: "timestamp", format: "dd-MMM-yyyy" },
          { field: "lastupdateddt", header: "Updated On", datatype: "timestamp", format: "dd-MMM-yyyy"},
        ],
      };     
    }
    if (this.instanceref.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
      details = {
        Info: [
          {
            title: "Customer Name",
            value: data["customer"] ? data["customer"]["customername"] : "",
          },
          {
            title: "Tenant Id",
            value: data["customer"] ? data["customer"]["ecl2tenantid"] : "",
          },
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
          {
            title: "CPU",
            value: data["instance"] ? data["instance"]["vcpu"] : "",
          },
          {
            title: "Memory",
            value: data["instance"] ? data["instance"]["memory"] : "",
          },
        ],
        "IP Addresses": [
          { title: "Private IP", value: data["privateipv4"] },
          { title: "Public IP", value: data["publicipv4"] || "-" },
        ],
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
      this.metaProducts = {
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
        productList: [],
        Products: [
          { field: "reference", header: "Product Name", datatype: "string" },
          { field: "createddate", header: "Created On", datatype: "timestamp", format: "dd-MMM-yyyy"},
          { field: "updateddate", header: "Updated On", datatype: "timestamp", format: "dd-MMM-yyyy" },
        ],
      };
    }

    if (
      this.instanceref.cloudprovider != AppConstant.CLOUDPROVIDER.AWS
    ) {
      let metadata = JSON.parse(data["metadata"]);
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
            title: "CPU Count",
            value: metadata != null ? (metadata["cpu"] ? metadata["cpu"]["count"] || "-" : "-") : "-",
          },
          {
            title: "Memory Size",
            value: metadata != null ? (metadata["memory"]
              ? Number(metadata["memory"]["size_MiB"]) / 1024 + "GB" || "-"
              : "-") : "-",
          },
        ],
        "IP Addresses": [
          { title: "Private IP", value: data["privateipv4"] },
          { title: "Public IP", value: data["publicipv4"] || "-" },
        ],
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
          widthConfig: ["30px", "25px", "25px", "25px", "25px"],
        },
        diskList: [],
        disk: [
          { field: "type", header: "Hard Disk Type", datatype: "string" },
          { field: "capacity", header: "Capacity", datatype: "string" },
        ],
        networkList: [],
        network: [
          { field: "network", header: "Adapter ID", datatype: "string" },
          { field: "network_name", header: "Adapter Name", datatype: "string" },
          { field: "networktype", header: "Type", datatype: "string" },
          { field: "state", header: "State", datatype: "string" },
          { field: "macaddr", header: "MAC Addr", datatype: "string" },
          { field: "mac_type", header: "MAC Type", datatype: "string" },
        ],
      };
      if (metadata != null && metadata.disks.length > 0) {
        metadata.disks.forEach((element) => {
          this.metaVolumes.diskList.push({
            type: element.value.type,
            capacity: this.commonService.convertBytes(element.value.capacity),
          });
        });
      }
      if (metadata != null && metadata.nics.length > 0) {
        metadata.nics.forEach((network) => {
          network = network.value;
          this.metaVolumes.networkList.push({
            label: network.label,
            macaddr: network.mac_address,
            mac_type: network.mac_type,
            state: network.state,
            network: network.backing ? network.backing.network : null,
            networktype: network.backing ? network.backing.type : null,
            network_name: network.backing ? network.backing.network_name : null,
          });
        });
      }
    }
    console.log(this.instanceref);

    if (data["tagvalues"] && data["tagvalues"].length > 0) {
      this.metaTags = this.tagService.decodeTagValues(data["tagvalues"]);
      this.metaTagsList = this.tagService.prepareViewFormat(data["tagvalues"]);
      this.isSyncTags = this.commonService.checkTagValidity(this.metaTags[0]);
    } else {
      this.metaTags = [];
      this.metaTagsList = [];
    }
    this.totalCount = this.metaTagsList.length

    this.meta = details;
    this.gettingDetails = false;
  }
  checkTagValidity(value) {
    if (value.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
      var date1 = new Date(value.createddt);
      var date2 = new Date();
      var Difference_In_Time = date2.getTime() - date1.getTime();
      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      if (Difference_In_Days > 1) {
        this.isSyncTags = true;
      }
    }
  }
  
  getProduct(){
    let condition = {} as any;
      condition = {
        status: AppConstant.STATUS.ACTIVE,
        module : 'asset-product-map'
      };
    this.assetRecordService.txnrefList(condition).subscribe((data) => {
      const res = JSON.parse(data._body);
      if (res.status) {
        this.metaProducts.productList = res.data;
        this.metaProducts.productList = this.metaProducts.productList.filter((item) => {
          return item.txn === this.instanceObj["instancerefid"];
        }); 
      } else {
        this.metaProducts.productList = [];
      }
          });
  }
  syncAssetTags() {
    this.metaVolumes.tagTableConfig.loading = true;
    let data = {
      refid: this.selectedInstance[0].instancerefid,
      tnregionid: this.selectedInstance[0].tnregionid,
      tenantid: this.selectedInstance[0].tenantid,
      region: this.selectedInstance[0].region,
      username: this.userstoragedata.fullname,
      id: this.selectedInstance[0].instanceid,
      presourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[8],
    };
    this.commonService.syncTags(data)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.metaTags = this.tagService.decodeTagValues(response.data);
          this.metaTagsList = this.tagService.prepareViewFormat(response.data);
          this.isSyncTags = false;
          this.metaVolumes.tagTableConfig.loading = false;
        } else {
          this.message.error(response.message);
          this.metaVolumes.tagTableConfig.loading = false;
          this.isSyncTags = false;
        }
      });
  }
  metaTagsChanges(e) {
    if (e["mode"] == "combined") {
      this.metaTagsSideBarVisible = false;
      this.metaTags = e.data;
      this.tags = e.data;
      this.metaTagsList = this.tagService.prepareViewFormat(e.data);
    }
  }
  vmwareTagUpdate(data) {
    this.tagValueService
      .bulkupdate(data, `?resourceid=${this.selectedInstance[0].instanceid}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.info("Tags synced to cloud.");
          this.syncingTagstoCloud = false;
        } else {
          this.message.error(response.message);
          this.syncingTagstoCloud = false;
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
      const vmPrimaryKeyMaps = {
        VIRTUAL_MACHINES: "instanceid",
      };
      const vmRefKeyMaps = {
        VIRTUAL_MACHINES: "instancerefid",
      };
      let vmwareTagValues = [];
      if (Array.isArray(this.tags) && this.tags.length > 0) {
        this.syncingTagstoCloud = true;
        let assets = [];
        this.selectedInstance.forEach((asset) => {
          if (
            this.instanceref.cloudprovider == "ECL2" ||
            this.instanceref.cloudprovider == "ECL2"
          ) {
            assets.push({
              id: asset[nttPrimaryKeyMaps["ASSET_INSTANCE"]],
              refid: asset[nttRefKeyMaps["ASSET_INSTANCE"]],
              ecl2tenantid: asset["customer"]["ecl2tenantid"],
              region: asset["customer"]["ecl2region"],
            });
          }
          if (this.instanceref.cloudprovider == "AWS") {
            let d = {
              id: asset[awsPrimaryKeyMaps["ASSET_INSTANCE"]],
              refid: asset[awsRefKeyMaps["ASSET_INSTANCE"]],
              region: asset["awszones"]["zonename"],
              tnregionid: asset["tnregionid"],
              customerid: asset["customerid"],
            };

            assets.push(d);
          }
          if (
            this.instanceref.cloudprovider != AppConstant.CLOUDPROVIDER.AWS
          ) {
            this.tags.forEach((element) => {
              let obj = {
                cloudprovider: this.instanceref.cloudprovider,
                resourcetype: "VIRTUAL_MACHINES",
                resourceid: asset[vmPrimaryKeyMaps["VIRTUAL_MACHINES"]],
                resourcerefid: asset[vmRefKeyMaps["VIRTUAL_MACHINES"]],
                tagid: element.tag.tagid,
                tagname: element.tag.tagname,
                attributerefid: element.attributerefid,
                tagvalue: element.tagvalue,
                tenantid: this.userstoragedata.tenantid,
                createddt: new Date(),
                createdby: this.userstoragedata.fullname,
                status: element.status,
              } as any;
              if (element.tagvalueid) obj.tagvalueid = element.tagvalueid;
              vmwareTagValues.push(obj);
            });
          }
        });

        if (
          this.instanceref.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA ||
          this.instanceref.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX
        ) {
          this.vmwareTagUpdate(vmwareTagValues);
          return false;
        }

        let tagValues = [];
        this.tags.forEach((element) => {
          if (element.status && element.status == AppConstant.STATUS.ACTIVE) {
            if (!(element.tag.tagname as string).includes("aws:")) {
              tagValues.push({
                tagid: element.tag.tagid,
                tagname: element.tag.tagname,
                tagvalue: element.tagvalue,
                attributerefid: element.attributerefid,
              });
            }
          }
        });

        let data = {
          assets: assets,
          tagvalues: tagValues,
          tenantid: this.userstoragedata.tenantid,
          cloudprovider: this.instanceref.cloudprovider,
          resourcetype: "ASSET_INSTANCE",
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
        };

        if (this.instanceref.cloudprovider == "AWS") {
          data["region"] = this.selectedInstance[0]["awszones"]["zonename"];
        }
        if (this.instanceref.cloudprovider == "ECL2") {
          data["region"] = this.selectedInstance[0]["customer"]["ecl2region"];
        }

        data["tnregionid"] = this.instanceObj.tnregionid;

        this.httpHandler
          .POST(
            AppConstant.API_END_POINT +
            (this.instanceref.cloudprovider == "ECL2" ||
              this.instanceref.cloudprovider == "ECL2"
              ? AppConstant.API_CONFIG.API_URL.OTHER.ECL2ASSETMETAUPDATE
              : AppConstant.API_CONFIG.API_URL.OTHER.AWSASSETMETAUPDATE +
              "?retain=true"),
            data
          )
          .subscribe((result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.message.info("Tags synced to cloud.");
              this.tags = [];
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
  showUtilChart() {
    this.assetUtilization.instancerefid = this.instanceObj.instancerefid;
    this.assetUtilization.utilkey = "CPU_UTIL";
    this.assetUtilization.customerid = this.instanceObj.customerid;
    this.assetUtilization.provider = this.instanceref.cloudprovider;
    this.assetUtilization.daterange = [
      moment().subtract(30, "days").toDate(),
      new Date(),
    ];
    this.assetUtilizationVisible = true;
  }

  showDrillDownChart() {
    this.assetUtilizationVisible = false;
    this.showDrillDown.next();
  }
}
