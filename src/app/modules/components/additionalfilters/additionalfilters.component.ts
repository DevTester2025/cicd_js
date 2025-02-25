import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { TenantsService } from "../../../business/tenants/tenants.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { CommonService } from "../../services/shared/common.service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import * as _ from "lodash";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { UsersService } from '../../../business/admin/users/users.service';
import { RoleService } from '../../../business/admin/role/role.service';
import { SSLService } from '../../../monitoring/ssl/sslservice';
import { HttpHandlerService } from "../../services/http-handler.service";
import { SLATemplatesService } from "src/app/business/tenants/servicemgmt/slatemplates/slatemplates.service";
@Component({
  selector: "app-additionalfilters",
  templateUrl: "./additionalfilters.component.html",
  styles: [
    `
      .ant-card {
        width: 100%;
        background: #1c2e3c;
        color: white;
        border: none;
      }
      .ant-card-head,
      .ant-card-head .ant-tabs-bar {
        border-bottom: none !important;
      }
      .ant-card-head-title {
        color: white !important;
      }
      .t-active {
        margin-left: 7px;
        padding: 3px 10px;
        border-radius: 100px;
        background: #ffeb3b;
        color: black;
        font-weight: 500;
        font-size: 13px;
      }
      /* .ant-tag .ant-tag-checkable {
          color: white !important;
        } */
      #grouptable th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }
      #grouptable td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #grouptable tr {
        padding: 5px;
      }

      #grouptable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      nz-select {
        width: 90%;
      }
    `,
  ],
})
export class AdditionalFiltersComponent implements OnInit {
  @Input() possibleFilters = [];
  @Input() assetFilters = [];
  @Input() monitoringFilters = [];
  @Input() cmdbFilters = [];
  @Input() ticketFilters = [];
  @Input() crn;
  @Output() applyTicketFilter: EventEmitter<any> = new EventEmitter();
  @Output() applyAssetFilter: EventEmitter<any> = new EventEmitter();
  @Output() applyMonitoringFilter: EventEmitter<any> = new EventEmitter();
  @Output() applyCMDBFilter: EventEmitter<any> = new EventEmitter();
  @Output() applyFilters: EventEmitter<any> = new EventEmitter();
  @Input() reporttype;
  @Input() attributemenu;

  @Input() selectedFilters = {};
  groups: any = [];
  currentFilter: any;
  filterableValues: any[];
  filterMenuVisible: boolean = false;
  dataloading: boolean = false;
  filters = {};
  userstoragedata: any;
  filterSearchModel: any = "";
  // attributemenu: boolean = false;
  attributeList: any = [];
  attributes = [
    {
      fieldname: "",
      formula: "",
      value: "",
    },
  ];
  operations = [
    {
      label: "Less than",
      value: "<",
      datatypes: ["AUTOGEN", "Integer", "Float", "Date", "DateTime"],
    },
    {
      label: "Greater than",
      value: ">",
      datatypes: ["AUTOGEN", "Integer", "Float", "Date", "DateTime"],
    },
    {
      label: "Equal to",
      value: "=",
      datatypes: [
        "AUTOGEN",
        "Integer",
        "Float",
        "Date",
        "DateTime",
      ]
    },
    {
      label: "in",
      value: "in",
      datatypes: [
        // "AUTOGEN",
        "Text",
        "Textarea",
        "Select",
        "Boolean",
        "STATUS",
        "REFERENCE",
      ],
    },
    { label: "Between", value: "BETWEEN", datatypes: ["Date", "DateTime"] },
  ];
  synthetics = [];
  constructor(
    private tenantsService: TenantsService,
    private localStorageService: LocalStorageService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private commonService: CommonService,
    private awsService: AWSService,
    private assetRecordService: AssetRecordService,
    private usersService: UsersService,
    private roleService: RoleService,
    private sslService: SSLService,
    private httpService: HttpHandlerService,
    private slaTemplateService: SLATemplatesService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes.possibleFilters && changes.possibleFilters.currentValue) {
      this.groups = changes.possibleFilters.currentValue;
    }
    if (changes.attributemenu && changes.attributemenu.currentValue) {
      this.attributemenu = changes.attributemenu.currentValue;
      this.filterMenuVisible = true;
      this.getAttributes(changes.crn.currentValue);
    } else {
      this.attributemenu = false;
    }
    // if (changes.ticketFilters && changes.ticketFilters.currentValue) {
    //   this.groups = changes.ticketFilters.currentValue;
    // }
    // if (changes.assetFilters && changes.assetFilters.currentValue) {
    //   this.groups = changes.assetFilters.currentValue;
    // }
    // if (changes.monitoringFilters && changes.monitoringFilters.currentValue) {
    //   this.groups = changes.monitoringFilters.currentValue;
    // }
    // if (changes.cmdbFilters && changes.cmdbFilters.currentValue) {
    //   this.groups = changes.cmdbFilters.currentValue;
    // }
  }

  getFilterValue(group) {
    this.currentFilter = group;
    this.filterableValues = [];
    this.attributemenu = false;
    switch (group.value) {
      case "userid":
        this.getUsers(); break;
      case 'roleid':
        this.getRoles(); break;
      case 'department':
        this.getLookupValues(AppConstant.LOOKUPKEY.DEPARTMENT); break;
      case 'resourcetype':
        this.getResourceType(); break;
      case 'readonly':
        this.filterableValues = [
          {
            title: "Readonly",
            value: "1",
          },
          {
            title: "Not Readonly",
            value: "0",
          },
        ];
        break;
      case 'fieldtype':
        this.filterableValues = [
          {
            title: "Text",
            value: "Text",
          },
          {
            title: "Date & Time",
            value: "DateTime",
          },
          {
            title: "Date",
            value: "Date",
          },
          {
            title: "Select",
            value: "Select",
          },
          {
            title: "Textarea",
            value: "Textarea",
          },
          {
            title: "Float",
            value: "Float",
          },
          {
            title: "Integer",
            value: "Integer",
          },
          {
            title: "Boolean",
            value: "Boolean",
          },
          {
            title: "URL",
            value: "URL",
          },
          {
            title: "Reference CMDB",
            value: "REFERENCE",
          },
          {
            title: "Reference Asset",
            value: "Reference Asset",
          },
          {
            title: "Reference Tag",
            value: "Reference Tag",
          },
          {
            title: "Password",
            value: "Password",
          },
          {
            title: "Auto Generate",
            value: "AUTOGEN",
          },
        ]; break;
      case "customerid":
        this.getAllCustomers();
        break;
      case "_customer":
        this.getAllCustomers();
        break;
      case "tagid":
        this.getAllTags();
        break;
      case "tagvalue":
        let tagid = _.find(this.groups, function (e) {
          return e.type == group.type && e.value == "tagid";
        });
        this.getTagValues(tagid);
        break;
      case "tagtype":
        let response = AppConstant.TAGS.TAG_TYPES;
        response.map((data) => {
          this.filterableValues.push({
            title: data,
            value: data,
          })
        })
        break;
      case "resource":
        this.getTagResourcetype();
        break;
      case "referencetype":
        this.filterableValues = [
          {
            title: "System",
            value: "System",
          },
          {
            title: "Security",
            value: "Security",
          },
          {
            title: "SSL",
            value: "SSL",
          },
          {
            title: "Synthetics",
            value: "Synthetics",
          },
        ];
        break;
      case "severity":
        if (group.type == AppConstant.KPI_REPORING.TICKETS) {
          this.getLookupValues(AppConstant.LOOKUPKEY.TICKET_SEVERITY);
        }
        if (group.type == AppConstant.KPI_REPORING.MONITORING) {
          this.filterableValues = AppConstant.ALERT_LEVELS.SYSTEM;
        }
        break;
      case "incidentstatus":
        this.getLookupValues(AppConstant.LOOKUPKEY.TICKET_STATUS);
        break;
      case "category":
        this.getLookupValues(AppConstant.LOOKUPKEY.TICKET_CATEGORY);
        break;
      case "publishyn":
        this.filterableValues = [
          {
            title: "Published",
            value: "Y",
          },
          {
            title: "Not Published",
            value: "N",
          },
        ];
        break;
      case "metric":
        this.filterableValues = AppConstant.METRICS;
        break;
      case "level":
        // this.filterableValues = AppConstant.ALERT_LEVELS.LEVELS;
        this.getLookupValues(AppConstant.LOOKUPKEY.MONITORING_LEVELS);
        break;
      case "cloudprovider":
        this.filterableValues = AppConstant.ACT_CLOUDPROVIDER;
        break;
      case "region":
        this.getAllRegions();
        break;
      case "instancename":
        this.getAllInstances(group.value);
        break;
      case "instancerefid":
        this.getAllInstances(group.value);
        break;
      case "instancetyperefid":
        this.getAllAWSinstancetype();
        break;
      case "cloudstatus":
        this.filterableValues = AppConstant.AWS_CLOUDSTATUS;
        break;
      case "crn":
        this.getResourceType();
        break;
      case "attribute":
        this.attributemenu = true;
        this.attributeList = [...this.attributeList];
        this.getAttributes(this.crn);
        break;
      case "canaryname":
        this.getSynthetics('canary');
        break;
      case "url":
        // let selected_synthetics = _.find(this.groups, function (e) {
        //   return e.type == group.type && e.value == "canaryname";
        // });
        // let ids = [];
        // if (selected_synthetics && selected_synthetics.selectedvalues.length > 0) {
        //   selected_synthetics.selectedvalues.map((e) => {
        //     ids.push(e.value);
        //   });
        // }
        // this.getSynthetics('url', ids)
        this.getSyntheticDtl();
        break;
      case "name":
        this.getAllSSL();
        break;
      case "urls":
        this.getSSLUrls();
        break;
      case "zonename":
        this.getRegions();
        break;
      case "customername":
        this.getSla();
        break;
      case "slaname":
        this.getSlaName();
        break;
    }

    this.filterMenuVisible = true;
    if (group.value != 'attribute' && group.selectedvalues && group.selectedvalues.length > 0) {
      this.filters[group.value] = {};
      group.selectedvalues.forEach((o) => {
        this.filters[group.value][o["value"]] = true;
      });
    } else {
      this.filters[group.value] = {};
      // if (group.value == 'attribute') {
      //   let i = _.findIndex(this.groups, { value: 'attribute' });
      //   this.filters[group.value] = this.groups[i].selectedvalues.length > 0 ? this.groups[i].selectedvalues : [];
      // } else {
      //   this.filters[group.value] = {};
      // }
    }
  }

  addRow() {
    this.attributeList.push({
      type: null,
      formula: null,
      value: "",
    });
  }
  deleteRow(i) {
    this.attributeList.splice(i, 1);
    this.attributeList = [...this.attributeList];
  }
  onAttributeSelect(event, i, flag?) {
    if (event) {
      if (flag) {
        this.attributeList[i].value = "";
        this.attributeList[i].formula = null;
      }

      if (event.fieldtype == "AUTOGEN") {
        this.attributeList[i].maxseqno = Number(event.curseq) - 1;
      }
      this.attributeList[i].operations = _.filter(this.operations, function (e) {
        return _.includes(e.datatypes, event.fieldtype);
      });
      this.assetRecordService
        .getAllDetail({
          crn: event.crn,
          status: AppConstant.STATUS.ACTIVE,
          tenantid: this.userstoragedata.tenantid,
          fieldkey: event.fieldkey,
        })
        .subscribe((result) => {
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            this.attributeList[i].possibleValues = response.data.map((el) => {
              return {
                label: (event.fieldtype == 'REFERENCE') ? (JSON.parse(el.fieldvalue)[0].name) : el.fieldvalue,
                value: el.fieldvalue,
              };
            });
            this.attributeList[i].possibleValues = _.unionBy(this.attributeList[i].possibleValues, 'value');
          }
        });
    }
  }
  getAttributes(crn) {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      crn: crn,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
    }
    this.assetRecordService.all(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response) {
        this.attributes = response.data.map((el) => {
          return {
            title: el.fieldname,
            value: el,
          };
        });

        // Edit form
        let attribute: any = _.find(this.groups, { value: "attribute" });
        if (attribute != undefined && attribute.selectedvalues.length > 0) {
          this.attributeList = [];
          attribute.selectedvalues.map((o, i) => {
            let type = _.find(this.attributes, { title: o.fieldname });
            let obj = {
              type: type['value'],
              formula: o.operation,
              operations: _.filter(this.operations, function (e) {
                return _.includes(e.datatypes, o.fieldtype);
              }),
              value: o.value
            };
            this.attributeList.push(obj);
            this.onAttributeSelect(o, i);
          });
        }
      } else {
        this.attributes = [];
      }
      this.dataloading = false;
    });
  }
  getResourceType() {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
    }
    this.assetRecordService.getResourceTypes(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response) {
        response = _.orderBy(response, ["resource"], ["asc"]);
        this.filterableValues = response.map((el) => {
          return {
            title: el.resource,
            value: el.crn,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getUsers() {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "fullname" }];
    }
    this.usersService.allUsers(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.fullname,
            value: el.userid,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getRoles() {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "rolename" }];
    }
    this.roleService.allRoles(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.rolename,
            value: el.roleid,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getAllCustomers() {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "customername" }];
    }
    this.tenantsService.allcustomers(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.customername,
            value: el.customerid,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }

  getSla() {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "customername" }];
    }
    this.tenantsService.allcustomers(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.customername,
            value: el.customerid,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getSlaName() {
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "slaname" }];
    }
    this.slaTemplateService.all(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.slaname,
            value: el.slaname,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  applyFilter(attribute?) {
    let values = [];
    for (const key in this.filters[this.currentFilter.value]) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.filters[this.currentFilter.value],
          key
        )
      ) {
        const value = this.filters[this.currentFilter.value][key];
        if (this.currentFilter.value != 'attribute') {
          const r = this.filterableValues.find((o) => o.value == key);
          values.push({
            title: r.title,
            value: r.value,
          });
        }
      }
    }


    this.filters[this.currentFilter.value] = values;
    if (this.reporttype != 'CMDB') {
      this.selectedFilters[this.reporttype] = this.filters;
      let existIndex = _.findIndex(this.groups, {
        value: this.currentFilter.value,
      });
      if (existIndex != -1) this.groups[existIndex].selectedvalues = values;
      this.applyFilters.next(
        this.selectedFilters[this.reporttype]
      );
    }

    // if (this.currentFilter.type == AppConstant.KPI_REPORING.TICKETS) {
    //   this.selectedFilters[AppConstant.KPI_REPORING.TICKETS] = this.filters;
    //   let existIndex = _.findIndex(this.groups, {
    //     value: this.currentFilter.value,
    //   });
    //   if (existIndex != -1) this.groups[existIndex].selectedvalues = values;
    //   this.applyTicketFilter.next(
    //     this.selectedFilters[AppConstant.KPI_REPORING.TICKETS]
    //   );
    // }
    // if (this.currentFilter.type == AppConstant.KPI_REPORING.ASSET) {
    //   this.selectedFilters[AppConstant.KPI_REPORING.ASSET] = this.filters;
    //   let existIndex = _.findIndex(this.groups, {
    //     value: this.currentFilter.value,
    //   });
    //   if (existIndex != -1) this.groups[existIndex].selectedvalues = values;
    //   this.applyAssetFilter.next(
    //     this.selectedFilters[AppConstant.KPI_REPORING.ASSET]
    //   );
    // }
    // if (this.currentFilter.type == AppConstant.KPI_REPORING.MONITORING) {
    //   this.selectedFilters[AppConstant.KPI_REPORING.MONITORING] = this.filters;
    //   let existIndex = _.findIndex(this.groups, {
    //     value: this.currentFilter.value,
    //   });
    //   if (existIndex != -1) this.groups[existIndex].selectedvalues = values;
    //   this.applyMonitoringFilter.next(
    //     this.selectedFilters[AppConstant.KPI_REPORING.MONITORING]
    //   );
    // }
    if (this.reporttype == AppConstant.KPI_REPORING.CMDB) {
      this.selectedFilters[AppConstant.KPI_REPORING.CMDB] = this.filters;
      let existIndex = _.findIndex(this.groups, {
        value: this.currentFilter.value,
      });
      if (existIndex != -1) this.groups[existIndex].selectedvalues = values;
      if (attribute) {
        this.selectedFilters[AppConstant.KPI_REPORING.CMDB].attribute =
          this.attributeList.map((o) => {
            return {
              fieldkey: o.type.fieldkey,
              fieldname: o.type.fieldname,
              fieldtype: o.type.fieldtype,
              value: o.value,
              operation: o.formula,
            };
          });
      }
      this.applyFilters.next(
        this.selectedFilters[AppConstant.KPI_REPORING.CMDB]
      );
    }
    this.filterMenuVisible = false;
    this.filterSearchModel = "";
  }
  getAllSeverity() {
    this.dataloading = true;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.TICKET_SEVERITY,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data.map((el) => {
            return {
              title: el.keyname,
              value: el.keyvalue,
            };
          });
        } else {
          this.filterableValues = [];
        }
        this.dataloading = false;
      });
  }
  getAllTicketCategory() {
    this.dataloading = true;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        lookupkey: AppConstant.LOOKUPKEY.TICKET_CATEGORY,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data.map((el) => {
            return {
              title: el.keyname,
              value: el.keyvalue,
            };
          });
        } else {
          this.filterableValues = [];
        }
        this.dataloading = false;
      });
  }
  getTagValues(group) {
    let tagids = [];
    this.dataloading = true;
    let cndtn = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      tagids: tagids,
    };
    if (this.filterSearchModel != "") {
      cndtn["searchText"] = this.filterSearchModel;
      cndtn["headers"] = [{ field: "tagvalue" }];
    }
    if (group && group.selectedvalues && group.selectedvalues.length > 0) {
      tagids = _.map(group.selectedvalues, function (itm) {
        return itm.value;
      });
      if (tagids.length > 0) {
        cndtn["tagids"] = tagids;
      }
    }
    let query = "?distinct=tagvalue";
    this.tagValueService.all(cndtn, query).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data.map((el) => {
            return {
              title: el.tagvalue == null ? "" : el.tagvalue,
              value: el.tagvalue,
            };
          });
        } else {
          this.filterableValues = [];
        }
        this.dataloading = false;
      },
      (err) => {
        this.dataloading = false;
      }
    );
  }
  getAllTags() {
    this.dataloading = true;
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.filterSearchModel != "") {
      reqObj["searchText"] = this.filterSearchModel;
      reqObj["headers"] = [{ field: "tagname" }];
    }

    this.tagService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.tagname,
            value: el.tagid,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getTagResourcetype() {
    let tagids = [];
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      tagids: tagids,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "resourcetype" }];
    }
    let query = "?distinct=resourcetype";
    this.tagValueService.all(condition, query).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data.map((el) => {
            return {
              title: el.resourcetype == null ? "" : el.resourcetype,
              value: el.resourcetype,
            };
          });
        } else {
          this.filterableValues = [];
        }
        this.dataloading = false;
      },
      (err) => {
        this.dataloading = false;
      }
    );
  }
  getAllSSL() {
    this.filterableValues = [];
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "name" }];
      this.filterSearchModel = '';
    }
    this.sslService.all(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.rows.map((data) => {
          return {
            title: data.name,
            value: data.id,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getSSLUrls() {
    this.filterableValues = [];
    this.dataloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "url" }];
      this.filterSearchModel = '';
    }
    this.sslService.all(condition, `?detail=${true}`).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response && response.data) {
        response.data.map((data: any) => {
          this.filterableValues.push({
            title: data.url,
            value: data.url,
          });
        });
      }
      else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getLookupValues(key) {
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      lookupkey: key,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "keyname" }];
    }
    this.commonService.allLookupValues(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.keyname,
            value:
              key == AppConstant.LOOKUPKEY.MONITORING_LEVELS
                ? Number(el.keyvalue)
                : el.keyvalue,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getAllRegions() {
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "region" }];
    }
    this.tenantsService.allRegions(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.region,
            value: el.region,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }

  getAllInstances(group) {
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] =
        this.currentFilter.value == "instancerefid"
          ? [{ field: "instancerefid" }]
          : [{ field: "instancename" }];
    }
    this.commonService.allInstances(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: group == "instancename" ? el.instancename : el.instancerefid,
            value: el.instanceid,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }
  getSynthetics(flag, ids?) {
    this.filterableValues = [];
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    let endpoint = AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.GET_ALL_LIST + `?cloudmatiq=${true}`;
    if (this.filterSearchModel != '') {
      condition["searchText"] = this.filterSearchModel;
      if (flag == 'canary') {
        condition["headers"] = [{ field: "name" }];
      }
      if (flag == 'url') {
        condition["headers"] = [{ field: "meta" }];
      }
    }
    if (ids && ids.length > 0) {
      condition['ids'] = ids;
    }

    this.httpService
      .POST(
        endpoint, condition
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.synthetics = response;
          if (flag == 'canary') {
            this.filterableValues = response.data.map((el) => {
              return {
                title: el.name,
                value: el.id,
              };
            });
          }
          if (flag == 'url') {
            response.data.map((el) => {
              let urls = JSON.parse(el.meta);
              if (urls && urls.length > 0) {
                urls.map((e) => {
                  this.filterableValues.push({
                    title: e,
                    value: (e.replace(/^https?:\/\//, '')).split('/')[0],
                  })
                })
              }
            });
          }
          this.dataloading = false;
        },
        (err) => {
          this.filterableValues = [];
          this.dataloading = false;
        }
      );
  }

  getSyntheticDtl() {
    this.filterableValues = [];
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      // this.filterSearchModel = '';
    }
    let endpoint = AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.GET_DETAIL_LIST + `?distinct=${true}`;
    this.httpService
      .POST(endpoint, condition)
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data.map((el) => {
            return {
              title: el.url,
              value: (el.url.replace(/^https?:\/\//, '')).split('/')[0],
            };
          });
        }  else {
          this.filterableValues = [];
        }
        this.dataloading = false;
      })
  }
  //#OP_T428 
  getRegions() {
    this.filterableValues = [];
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    let endpoint = AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES;
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "zonename" }];
      this.filterSearchModel = '';
    }
    this.httpService
      .POST(endpoint, condition)
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data.map((el) => {
            return {
              title: el.zonename,
              value: el.zonename,
            };
          });
        } else {
          this.filterableValues = [];
        }
        this.dataloading = false;
      })
  }
  getAllAWSinstancetype() {
    this.dataloading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.filterSearchModel != "") {
      condition["searchText"] = this.filterSearchModel;
      condition["headers"] = [{ field: "instancetypename" }];
    }
    this.awsService.allawsinstancetype(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.filterableValues = response.data.map((el) => {
          return {
            title: el.instancetypename,
            value: el.instancetypename,
          };
        });
      } else {
        this.filterableValues = [];
      }
      this.dataloading = false;
    });
  }

  removeAppliedFilter(data) {
    delete this.filters[data.value];
    let existgrp = _.findIndex(this.groups, { value: data.value });
    if (existgrp != -1) {
      this.groups[existgrp]["selectedvalues"] = [];
    }
    this.groups[existgrp].selectedvalues = [];
    let d = {};
    this.groups.forEach((el) => {
      if (el.selectedvalues.length > 0) {
        d[el.value] = el.selectedvalues;
      }
    });
    this.applyFilters.next(d);

    if (data.type == AppConstant.KPI_REPORING.TICKETS) {
      this.applyTicketFilter.next(d);
    }
    if (data.type == AppConstant.KPI_REPORING.MONITORING) {
      this.applyMonitoringFilter.next(d);
    }
    if (data.type == AppConstant.KPI_REPORING.ASSET) {
      this.applyAssetFilter.next(d);
    }
    if (data.type == AppConstant.KPI_REPORING.CMDB) {
      this.applyCMDBFilter.next({ data: d, remove: true });
    }
  }

  getFieldValues() {
    this.getFilterValue(this.currentFilter);
  }
}
