// import { Component, OnInit } from "@angular/core";
// import * as _ from "lodash";
// import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
// import { AppConstant } from "src/app/app.constant";
// import { NzMessageService } from "ng-zorro-antd";
// import { Router } from "@angular/router";
// import { CommonService } from "src/app/modules/services/shared/common.service";
// import { BudgetService } from "../budget/budget.service";
// import { TagService } from "../../tagmanager/tags.service";
// import { AWSService } from "src/app/business/deployments/aws/aws-service";
// import { Ecl2Service } from "src/app/business/deployments/ecl2/ecl2-service";
// import { AssetsService } from "../assets.service";
// @Component({
//   selector: "app-billing",
//   templateUrl:
//     "../../../../presentation/web/base/assets/billing/billing.component.html",
// })
// export class BillingComponent implements OnInit {
//   budgetObj = {} as any;
//   screens = [];
//   assetData: any = {};
//   metaTagsEnabled = true;
//   meta: any = [];
//   awssgobj = null;
//   metaSideBarTitle = "";
//   metaSideBarVisible = false;
//   subtenantLable = AppConstant.SUBTENANT;
//   metaTags = [];
//   metaVolumes: any = null;
//   enableServerResize = false;
//   metaTagsList = [];
//   appScreens = {} as any;
//   createbudget = false;
//   isVisible = false;
//   showcosts = true;
//   isInstanceVisible = false;
//   awsZoneList: any = [];
//   tagList: any = [];
//   nttZoneList: any = [];
//   pricings: any = [];
//   providerList: any = [];
//   referenceList: any = [];
//   tagTableHeader = [
//     { field: "tagname", header: "Name", datatype: "string" },
//     { field: "tagvalue", header: "Value", datatype: "string" },
//   ] as any;
//   tagTableConfig = {
//     edit: false,
//     delete: false,
//     globalsearch: false,
//     loading: false,
//     pagination: false,
//     pageSize: 1000,
//     title: "",
//     widthConfig: ["30px", "25px", "25px", "25px", "25px"],
//   } as any;
//   resizeTableHeader = [
//     { field: "plantype", header: "Plan", datatype: "string" },
//     { field: "cost", header: "Cost", datatype: "string" },
//     {
//       field: "lastupdateddt",
//       header: "Completed On",
//       datatype: "timestamp",
//       format: "dd-MMM-yyyy hh:mm:ss",
//     },
//   ] as any;
//   resizeTableConfig = {
//     edit: false,
//     delete: false,
//     globalsearch: false,
//     loading: false,
//     pagination: false,
//     pageSize: 1000,
//     title: "",
//     widthConfig: ["30px", "30px", "40px"],
//   } as any;
//   selectedTag = {} as any;
//   showSidebar = false;
//   isGroupHierarchyVisible = false;
//   loading = false;

//   userstoragedata = {} as any;
//   folderName = "";

//   tableHeader = [
//     {
//       field: "billingdt",
//       header: "Billing Dt.",
//       datatype: "timestamp",
//       format: "dd-MMM-yyyy",
//     },
//     { field: "cloudprovider", header: "Provider", datatype: "string" },
//     { field: "resourcetype", header: "Resource Type", datatype: "string" },
//     { field: "customer", header: "Customer", datatype: "string" },
//     {
//       field: "billamount",
//       header: "Bill Amount",
//       datatype: "currency",
//       format: "currency",
//     },
//   ] as any;

//   tableConfig = {
//     globalsearch: true,
//     view: false,
//     loading: false,
//     pagination: true,
//     pageSize: 10,
//     scroll: { x: "1000px" },
//     title: "",
//     widthConfig: ["20px", "20px", "25px", "25spx", "20px", "20px", "20px"],
//   } as any;
//   // assetTypes: any = AppConstant.AWS_BILLING_RESOURCETYPES;
//   assetTypes: any = [];
//   filters = {
//     provider: null,
//     tagid: null,
//     tagvalue: null,
//     resource: null,
//     customer: null,
//     asset: null,
//     startdt: null,
//     enddt: null,
//   } as any;
//   billingList = [];
//   zoneList = [];
//   customerList: any = [];
//   formTitle = "Add Budget";
//   showView = false;

//   structureId;
//   savingStructure = false;
//   serverDetail = null;
//   constructor(
//     public router: Router,
//     private awsService: AWSService,
//     private ecl2Service: Ecl2Service,
//     private assetService: AssetsService,
//     private message: NzMessageService,
//     private localStorageService: LocalStorageService,
//     private commonService: CommonService,
//     private tagService: TagService,
//     private budgetService: BudgetService
//   ) {
//     this.userstoragedata = this.localStorageService.getItem(
//       AppConstant.LOCALSTORAGE.USER
//     );
//     this.screens = this.localStorageService.getItem(
//       AppConstant.LOCALSTORAGE.SCREENS
//     );
//     this.appScreens = _.find(this.screens, {
//       screencode: AppConstant.SCREENCODES.ASSET_BILLING,
//     });
//     this.getProviderList();
//     this.getCustomerList();
//     this.getLookup();
//   }

//   ngOnInit() {
//     // this.getAllBudgets();
//     this.getAllTags();
//   }
//   getProviderList() {
//     this.commonService
//       .allLookupValues({
//         lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
//         status: AppConstant.STATUS.ACTIVE,
//       })
//       .subscribe((res) => {
//         const response = JSON.parse(res._body);
//         if (response.status) {
//           this.providerList = this.formArrayData(
//             response.data,
//             "keyname",
//             "keyvalue"
//           );
//         } else {
//           this.providerList = [];
//         }
//       });
//   }
//   onProviderChanges(event) {
//     if (event == "AWS") {
//       this.assetTypes = AppConstant.AWS_BILLING_RESOURCETYPES;
//     } else {
//       // this.assetTypes = [{ title: 'Server', value: 'ASSET_INSTANCE' },
//       // { title: 'Network', value: 'ASSET_NETWORK' },
//       // { title: 'Load Balancer', value: 'ASSET_LB' },
//       // { title: 'Firewall', value: 'ASSET_FIREWALL' },
//       // { title: 'Internet Gateway', value: 'ASSET_IG' },
//       // { title: 'CFG', value: 'ASSET_CFG' },
//       // { title: 'Volume', value: 'ASSET_VOLUME' }];
//       this.assetTypes = AppConstant.ECL2_BILLING_RESOURCETYPES;
//     }
//   }
//   getCustomerList() {
//     this.commonService
//       .allCustomers({
//         status: AppConstant.STATUS.ACTIVE,
//         tenantid: this.userstoragedata.tenantid,
//       })
//       .subscribe((res) => {
//         const response = JSON.parse(res._body);
//         if (response.status) {
//           this.customerList = this.formArrayData(
//             response.data,
//             "customername",
//             "customerid"
//           );
//         } else {
//           this.customerList = [];
//         }
//       });
//   }
//   getAllBudgets() {
//     let obj = {
//       tenantid: this.userstoragedata.tenantid,
//       status: AppConstant.STATUS.ACTIVE,
//     } as any;
//     if (this.filters.tagid && !this.filters.tagvalue) {
//       this.message.error("Please enter tag value");
//     } else if (!this.filters.tagid && this.filters.tagvalue) {
//       this.message.error("Please select tag");
//     } else if (!this.filters.provider) {
//       this.message.error("Please select Provider");
//     } else {
//       this.loading = true;
//       if (this.filters) {
//         if (this.filters.provider) {
//           obj.cloudprovider = this.filters.provider;
//         }
//         if (this.filters.customer) {
//           obj.customerid = this.filters.customer;
//         }
//         if (this.filters.asset) {
//           obj.resourcetype = this.filters.asset;
//         }
//         if (this.filters.startdt && this.filters.enddt) {
//           obj.billingdates = [this.filters.startdt, this.filters.enddt];
//         }
//         if (this.filters.tagvalue) {
//           obj.tagvalues = this.filters.tagvalue;
//           obj.tagname = this.filters.tagid;
//         }
//         if (this.filters.resource && this.filters.resource.length > 0) {
//           obj.resource = this.filters.resource;
//         }
//       }
//       this.isVisible = true;
//       let service = this.budgetService.billingList(obj);
//       if (this.filters.asset == "ASSET_INSTANCE") {
//         service = this.budgetService.dailybillings(
//           obj,
//           `?customer=${true}&instance=${true}`
//         );
//       }
//       service.subscribe(
//         (result) => {
//           let response = JSON.parse(result._body);
//           if (response.status) {
//             this.billingList = response.data;
//             this.billingList.forEach((x) => {
//               let resourcetype: any = {};
//               if (this.filters.provider == AppConstant.CLOUDPROVIDER.ECL2) {
//                 resourcetype = _.find(AppConstant.ECL2_BILLING_RESOURCETYPES, {
//                   value: x.resourcetype,
//                 });
//                 x.resourcetype = resourcetype
//                   ? resourcetype.title
//                   : "Not Availabe";
//               }
//               x.customer = x.customer
//                 ? x.customer.customername
//                 : "Not Availabe";
//               x.resourcename = x.instance
//                 ? x.instance.instancename
//                 : "Not Availabe";
//               return x;
//             });
//             this.loading = false;
//           } else {
//             this.loading = false;
//             this.billingList = [];
//           }
//         },
//         (err) => {
//           this.isVisible = false;
//         }
//       );
//       this.isVisible = false;
//     }
//   }

//   assetChanges() {
//     this.tableHeader = [
//       {
//         field: "billingdt",
//         header: "Billing Dt.",
//         datatype: "timestamp",
//         format: "dd-MMM-yyyy",
//       },
//       { field: "cloudprovider", header: "Provider", datatype: "string" },
//       { field: "resourcetype", header: "Resource Type", datatype: "string" },
//       { field: "customername", header: "Customer", datatype: "string" },
//       {
//         field: "billamount",
//         header: "Bill Amount",
//         datatype: "currency",
//         format: "currency",
//       },
//     ];
//     this.referenceList = [];
//     switch (this.filters.asset) {
//       case "ASSET_INSTANCE":
//         this.getServerList(this.filters.provider);
//         this.tableConfig.view = true;
//         this.tableHeader = [
//           {
//             field: "billingdt",
//             header: "Billing Dt.",
//             datatype: "timestamp",
//             format: "dd-MMM-yyyy",
//           },
//           { field: "cloudprovider", header: "Provider", datatype: "string" },
//           {
//             field: "resourcetype",
//             header: "Resource Type",
//             datatype: "string",
//           },
//           { field: "resourcename", header: "Name", datatype: "string" },
//           { field: "instancerefid", header: "Instance ID", datatype: "string" },
//           { field: "customer", header: "Customer", datatype: "string" },
//           // { field: 'customername', header: 'Customer ID', datatype: 'string' },
//           {
//             field: "billamount",
//             header: "Bill Amount",
//             datatype: "currency",
//             format: "currency",
//           },
//         ];
//         break;
//       // case 'Amazon Elastic Compute Cloud - Compute':
//       //   this.getServerList(this.filters.provider);
//       //   this.tableConfig.view = true;
//       //   this.tableHeader = [
//       //     { field: 'billingdt', header: 'Billing Dt.', datatype: 'timestamp', format: 'dd-MMM-yyyy' },
//       //     { field: 'cloudprovider', header: 'Provider', datatype: 'string' },
//       //     { field: 'resourcetype', header: 'Resource Type', datatype: 'string' },
//       //     { field: 'resourcename', header: 'Name', datatype: 'string' },
//       //     { field: 'customername', header: 'Customer', datatype: 'string' },
//       //     { field: 'billamount', header: 'Bill Amount', datatype: 'currency', format: 'currency' }
//       //   ];
//       //   break;
//       case "ASSET_NETWORK":
//         this.getNetworkList(this.filters.provider);
//         break;
//       case "ASSET_LB":
//         this.getLBList(this.filters.provider);
//         break;
//       case "ASSET_FIREWALL":
//         this.getFirewallList(this.filters.provider);
//         break;
//       case "ASSET_VOLUME":
//         this.getVolumeList(this.filters.provider);
//         break;
//       case "ASSET_IG":
//         this.getIgList(this.filters.provider);
//         break;
//       case "ASSET_CFG":
//         this.getcfgList(this.filters.provider);
//         break;
//     }
//   }

//   dataChanged(result) {
//     if (result.view) {
//       if (result.data.instance && result.data.customer) {
//         console.log(result.data);
//         // this.getAssets(result.data.instancerefid, result.data.customer.customerid);
//         this.serverDetail = {
//           cloudprovider: result.data.cloudprovider,
//           instanceref: result.data.instance.instanceid,
//           instancereftype: "instanceid",
//           asset: this.filters.asset,
//         };
//         this.metaSideBarVisible = true;
//         this.metaSideBarTitle =
//           "Server" + " (" + result.data.instance["instancename"] + ") ";
//       } else {
//         this.message.info("Details Not Available");
//       }
//     }
//   }

//   getLookup() {
//     this.commonService
//       .allLookupValues({
//         lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
//         status: AppConstant.STATUS.ACTIVE,
//       })
//       .subscribe((res) => {
//         const response = JSON.parse(res._body);
//         if (response.status) {
//           this.pricings = response.data;
//         } else {
//           this.pricings = [];
//         }
//       });
//   }
//   getAssets(instance, customer) {
//     let assetList = [] as any;
//     let condition = {
//       asset: "ASSET_INSTANCE",
//       provider: this.filters.provider,
//       // "customers": [
//       //   customer ? customer : this.filters.customer
//       // ],
//       instancerefid: instance,
//       data: {
//         tenantid: this.userstoragedata.tenantid,
//         status: "Active",
//       },
//     };
//     if (customer != null) {
//       condition["customers"] = [customer ? customer : this.filters.customer];
//     }
//     this.assetService.listByFilters(condition).subscribe(
//       (result) => {
//         let response = JSON.parse(result._body);
//         if (response.status) {
//           assetList = response.data.assets;
//           let ls = _.map(assetList, (i) => {
//             return {
//               ...i,
//               rightsizeyn:
//                 this.filters.rightsize && this.filters.rightsize == "Y"
//                   ? "Y"
//                   : "N",
//             };
//           });
//           assetList = [...ls];
//           if (this.showcosts) {
//             let self = this;
//             _.map(assetList, function (i: any) {
//               i.costs = 0;
//               if (
//                 i.instance &&
//                 i.instance.costvisual &&
//                 i.instance.costvisual.length > 0
//               ) {
//                 i.costs = self.commonService.getMonthlyPrice(
//                   self.pricings,
//                   i.instance.costvisual[0].pricingmodel,
//                   i.instance.costvisual[0].priceperunit,
//                   i.instance.costvisual[0].currency
//                 );
//                 // self.tableHeader[2] = { field: 'costs', header: 'Cost(Monthly)', datatype: 'number' };
//               }
//               if (
//                 i.awsinstance &&
//                 i.awsinstance.costvisual &&
//                 i.awsinstance.costvisual.length > 0
//               ) {
//                 i.costs = self.commonService.getMonthlyPrice(
//                   self.pricings,
//                   i.awsinstance.costvisual[0].pricingmodel,
//                   i.awsinstance.costvisual[0].priceperunit,
//                   i.awsinstance.costvisual[0].currency
//                 );
//                 // self.tableHeader[2] = { field: 'costs', header: 'Cost(Monthly)', datatype: 'number' };
//               }
//               if (i.costvisual && i.costvisual.length > 0) {
//                 i.costs = self.commonService.getMonthlyPrice(
//                   self.pricings,
//                   i.costvisual[0].pricingmodel,
//                   i.costvisual[0].priceperunit,
//                   i.costvisual[0].currency
//                 );
//                 // self.tableHeader[3] = { field: 'costs', header: 'Cost(Monthly)', datatype: 'number' };
//               }
//               if (
//                 i.ecl2vsrxplan &&
//                 i.ecl2vsrxplan.costvisual &&
//                 i.ecl2vsrxplan.costvisual.length > 0
//               ) {
//                 i.costs = self.commonService.getMonthlyPrice(
//                   self.pricings,
//                   i.ecl2vsrxplan.costvisual[0].pricingmodel,
//                   i.ecl2vsrxplan.costvisual[0].priceperunit,
//                   i.ecl2vsrxplan.costvisual[0].currency
//                 );
//                 // self.tableHeader[2] = { field: 'costs', header: 'Cost(Monthly)', datatype: 'number' };
//               }
//               return i;
//             });
//           }
//           if (assetList[0]) {
//             this.loading = false;
//             this.getInstanceByID(assetList[0].instanceid);
//             // this.prepareServerMeta(assetList[0])
//           }
//         } else {
//           this.loading = false;
//           assetList = [];
//         }
//       },
//       (err) => {
//         this.loading = false;
//         console.log(err);
//       }
//     );
//   }
//   getInstanceByID(id) {
//     this.commonService
//       .getInstance(
//         id,
//         `?asstdtls=${true}&cloudprovider=${this.filters.provider}`
//       )
//       .subscribe((res) => {
//         const response = JSON.parse(res._body);
//         if (response.status) {
//           this.metaSideBarVisible = true;
//           this.prepareServerMeta(response.data);
//         }
//       });
//   }

//   onChanged(e) {
//     this.metaSideBarVisible = false;
//   }
//   prepareServerMeta(data: object) {
//     this.meta = [];
//     let details;
//     this.assetData = data as any;
//     this.assetData.instancetype = "ASSET_INSTANCE";
//     this.assetData.cloudprovider = this.filters.provider;
//     if (this.filters.provider == "AWS") {
//       details = {
//         Info: [
//           {
//             title: "Customer Name",
//             value:
//               data["customer"] != null
//                 ? data["customer"]["customername"] || "-"
//                 : "-",
//           },
//           {
//             title: "Teanant Id",
//             value:
//               data["customer"] != null
//                 ? data["customer"]["awsaccountid"] || "-"
//                 : "-",
//           },
//           { title: "Instance Name", value: data["instancename"] },
//           { title: "Instance Id", value: data["instancerefid"] },
//           { title: "Region", value: data["region"] },
//           {
//             title: "Zone",
//             value:
//               data["awszones"] != null
//                 ? data["awszones"]["zonename"] || "-"
//                 : "-",
//           },
//           { title: "Status", value: "Active" },
//         ],
//         Image: [
//           {
//             title: "Image Name",
//             value: data["awsimage"] ? data["awsimage"]["aminame"] || "-" : "-",
//           },
//           {
//             title: "Image ID",
//             value: data["awsimage"] ? data["awsimage"]["awsamiid"] || "-" : "-",
//           },
//           {
//             title: "Platform",
//             value: data["awsimage"] ? data["awsimage"]["platform"] || "-" : "-",
//           },
//           {
//             title: "Notes",
//             value: data["awsimage"] ? data["awsimage"]["notes"] || "-" : "-",
//           },
//         ],
//         Specification: [
//           { title: "Instance Type", value: data["instancetyperefid"] },
//           {
//             title: "CPU",
//             value: data["awsinstance"]
//               ? data["awsinstance"]["vcpu"] || "-"
//               : "-",
//           },
//           {
//             title: "Memory",
//             value: data["awsinstance"]
//               ? data["awsinstance"]["memory"] || "-"
//               : "-",
//           },
//         ],
//         "IP Addresses": [
//           { title: "Private IP", value: data["privateipv4"] },
//           { title: "Public IP", value: data["publicipv4"] || "-" },
//         ],
//       };
//       this.metaVolumes = {
//         tagTableConfig: {
//           edit: false,
//           delete: false,
//           globalsearch: false,
//           loading: false,
//           pagination: false,
//           pageSize: 1000,
//           title: "",
//           widthConfig: ["30px", "25px", "25px", "25px", "25px"],
//         },
//         volumeList: [],
//         Volume: [
//           { field: "volumetype", header: "Volume Type", datatype: "string" },
//           { field: "awsvolumeid", header: "Volume ID", datatype: "string" },
//           { field: "sizeingb", header: "Size (Gb)", datatype: "string" },
//           { field: "encryptedyn", header: "Encrypted", datatype: "string" },
//           { field: "notes", header: "Notes", datatype: "string" },
//         ],
//       };
//       if (data["attachedvolumes"] && data["attachedvolumes"].length > 0) {
//         data["attachedvolumes"].forEach((element) => {
//           this.metaVolumes.volumeList.push(element.volume);
//         });
//       }

//       this.awssgobj = data["awssgs"];
//       this.assetData.instancerefid = data["securitygroupid"];
//     } else {
//       details = {
//         Info: [
//           {
//             title: "Customer Name",
//             value: data["customer"] ? data["customer"]["customername"] : "",
//           },
//           {
//             title: "Teanant Id",
//             value: data["customer"] ? data["customer"]["ecl2tenantid"] : "",
//           },
//           { title: "Instance Name", value: data["instancename"] },
//           { title: "Instance Id", value: data["instancerefid"] },
//           { title: "Region", value: data["region"] },
//           { title: "Zone", value: data["ecl2zones"]["zonename"] },
//           { title: "Status", value: "Active" },
//         ],
//         Image: [
//           {
//             title: "Image Name",
//             value: data["image"] ? data["image"]["imagename"] : "",
//           },
//           {
//             title: "Image ID",
//             value: data["image"] ? data["image"]["ecl2imageid"] : "",
//           },
//           {
//             title: "Platform",
//             value: data["image"] ? data["image"]["platform"] : "",
//           },
//           {
//             title: "Notes",
//             value: data["image"] ? data["image"]["notes"] : "",
//           },
//         ],
//         Specification: [
//           { title: "Instance Type", value: data["instancerefid"] },
//           { title: "CPU", value: data["instance"]["vcpu"] },
//           { title: "Memory", value: data["instance"]["memory"] },
//         ],
//         "IP Addresses": [
//           { title: "Private IP", value: data["privateipv4"] },
//           { title: "Public IP", value: data["publicipv4"] || "-" },
//         ],
//       };
//       this.metaVolumes = {
//         tagTableConfig: {
//           edit: false,
//           delete: false,
//           globalsearch: false,
//           loading: false,
//           pagination: false,
//           pageSize: 1000,
//           title: "",
//           widthConfig: ["30px", "25px", "25px", "25px", "25px", "25px"],
//         },
//         volumeList: [],
//         Volume: [
//           { field: "volumename", header: "Volume Name", datatype: "string" },
//           { field: "ecl2volumeid", header: "Volume ID", datatype: "string" },
//           { field: "size", header: "Size (Gb)", datatype: "string" },
//           { field: "iopspergb", header: "I/O Operations", datatype: "string" },
//           { field: "publicipv4", header: "Public IP", datatype: "string" },
//           { field: "notes", header: "Notes", datatype: "string" },
//         ],
//       };
//       if (
//         data["ecl2attachedvolumes"] &&
//         data["ecl2attachedvolumes"].length > 0
//       ) {
//         data["ecl2attachedvolumes"].forEach((element) => {
//           this.metaVolumes.volumeList.push(element.volume);
//         });
//       }
//     }
//     if (data["tagvalues"] && data["tagvalues"].length > 0) {
//       this.metaTags = this.tagService.decodeTagValues(data["tagvalues"]);
//       this.metaTagsList = this.tagService.prepareViewFormat(data["tagvalues"]);
//     } else {
//       this.metaTags = [];
//       this.metaTagsList = [];
//     }
//     this.metaSideBarTitle = "Server" + " (" + data["instancename"] + ") ";
//     this.meta = details;
//     this.enableServerResize = true;
//     this.loading = false;
//   }
//   getServerList(provider) {
//     let condition = {
//       status: AppConstant.STATUS.ACTIVE,
//     } as any;
//     if (provider != null && provider != undefined && provider != "") {
//       condition.cloudprovider = provider;
//     }
//     this.commonService.allInstances(condition).subscribe((res) => {
//       const response = JSON.parse(res._body);
//       if (response.status) {
//         this.referenceList = this.formArrayData(
//           response.data,
//           "instancename",
//           "instanceid"
//         );
//       } else {
//         this.referenceList = [];
//       }
//     });
//   }
//   getNetworkList(provider) {
//     if (provider == AppConstant.CLOUDPROVIDER.AWS) {
//       this.awsService
//         .allawsvpc({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "vpcname",
//               "vpcid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//     if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
//       this.ecl2Service
//         .allecl2nework({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "networkname",
//               "networkid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//   }
//   getLBList(provider) {
//     if (provider == AppConstant.CLOUDPROVIDER.AWS) {
//       this.awsService
//         .allawslb({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "lbname",
//               "lbid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//     if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
//       this.ecl2Service
//         .allecl2loadbalancer({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "lbname",
//               "loadbalancerid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//   }
//   getFirewallList(provider) {
//     if (provider == AppConstant.CLOUDPROVIDER.AWS) {
//     }
//     if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
//       this.ecl2Service
//         .allecl2vsrx({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "vsrxname",
//               "vsrxid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//   }
//   getVolumeList(provider) {
//     if (provider == AppConstant.CLOUDPROVIDER.AWS) {
//       this.awsService
//         .allawsvolumes({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             response.data = _.map(response.data, function (i: any) {
//               i.sizeingb = i.sizeingb + " GB";
//               return i;
//             });
//             this.referenceList = this.formArrayData(
//               response.data,
//               "sizeingb",
//               "volumeid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//     if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
//       this.ecl2Service
//         .allecl2volume({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             response.data = _.map(response.data, function (i: any) {
//               i.size = i.size + " GB";
//               return i;
//             });
//             this.referenceList = this.formArrayData(
//               response.data,
//               "size",
//               "volumeid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//   }
//   getIgList(provider) {
//     if (provider == AppConstant.CLOUDPROVIDER.AWS) {
//       this.awsService
//         .allawsigw({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "gatewayname",
//               "internetgatewayid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//     if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
//       this.ecl2Service
//         .allecl2gateway({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "gatewayname",
//               "internetgatewayid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//   }
//   getcfgList(provider) {
//     if (provider == AppConstant.CLOUDPROVIDER.AWS) {
//     }
//     if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
//       this.ecl2Service
//         .alleclcommonfngateway({ status: AppConstant.STATUS.ACTIVE })
//         .subscribe((res) => {
//           const response = JSON.parse(res._body);
//           if (response.status) {
//             this.referenceList = this.formArrayData(
//               response.data,
//               "cfgatewayname",
//               "cfgatewayid"
//             );
//           } else {
//             this.referenceList = [];
//           }
//         });
//     }
//   }
//   getAllTags() {
//     let cndtn = {
//       tenantid: this.userstoragedata.tenantid,
//       status: AppConstant.STATUS.ACTIVE,
//     } as any;

//     this.tagService.all(cndtn).subscribe((result) => {
//       let response = JSON.parse(result._body);
//       if (response.status) {
//         let d = response.data.map((o) => {
//           let obj = o;
//           if (obj.tagtype == "range") {
//             let range = obj.lookupvalues.split(",");
//             obj.min = Number(range[0]);
//             obj.max = Number(range[1]);
//             obj.lookupvalues = Math.ceil(
//               Math.random() * (+obj.max - +obj.min) + +obj.min
//             );
//           }

//           return obj;
//         });
//         this.tagList = d;
//       } else {
//         this.tagList = [];
//       }
//     });
//   }
//   tagChanged(e) {
//     let tag = this.tagList.find((o) => o["tagid"] == e);
//     let tagClone = _.cloneDeep(tag);
//     this.filters.tagvalue = null;

//     if (tagClone.tagtype == "list") {
//       tagClone.lookupvalues = tagClone.lookupvalues.split(", ");
//     } else if (
//       tagClone.tagtype == "range" &&
//       typeof tagClone.lookupvalues == "string"
//     ) {
//       tagClone.min = tagClone.lookupvalues.split(",")[0];
//       tagClone.min = tagClone.lookupvalues.split(",")[1];
//     }
//     this.selectedTag = _.cloneDeep(tagClone);
//   }

//   formArrayData(data, label, value) {
//     let array = [] as any;
//     data.forEach((element) => {
//       let obj = {} as any;
//       obj.label = element[label];
//       obj.value = element[value];
//       array.push(obj);
//     });
//     return array;
//   }
// }
