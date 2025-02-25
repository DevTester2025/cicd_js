import { Component, OnInit } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CustomerAccountService } from "../../../../business/tenants/customers/customer-account.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { TagService } from "../../../../business/base/tagmanager/tags.service";
import * as _ from "lodash";
import { WazuhConstant } from "src/app/wazuh.constants";
import { AlertConfigService } from "src/app/business/base/alertconfigs/alertconfig.service";

@Component({
  selector: "app-report-list",
  templateUrl: "./compliance-report.component.html",
  styleUrls: ["./compliance-report.component.css"],
})
export class ComplianceReportComponent implements OnInit {
  loading = false;
  gettingAssets = false;
  userstoragedata = {} as any;
  tagList = [];
  customersList = [];
  accountsList = [];
  cloudproviderList = [];
  selectedAsset = null;
  filters = { provider: "AWS" } as any;
  selectedTag = {} as any;
  screens: any = [];
  appScreens: any = [];
  nodetabIndex;
  wazhuURL: string = "";
  domainURL: string = "";
  baseUrl: string = "";
  mainURL = `/app/dashboards#/view/{:viewId}?embed=true&show-time-filter=true&hide-filter-bar=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))`;
  constructor(
    private httpHandler: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private customerAccService: CustomerAccountService,
    private tagService: TagService,
    private alertConfigService: AlertConfigService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.COMPLIANCE_REPORT,
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.init();
  }
  init() {
    this.getAllCustomers();
    this.getAccountsList();
    this.getproviderList();
    this.getAllTags();
    this.formDashboardURL();
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
      tenantid: this.userstoragedata.tenantid,
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
  instanceList = [];
  search = false;
  noData = false;
  getfilteredInstance() {
    this.gettingAssets = true;
    let condition = {} as any;
    this.instanceList = [];
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      provider: this.filters.provider,
      tenantid: this.userstoragedata.tenantid,
      agentid: true,
    };
    if (
      this.filters.customers !== undefined &&
      this.filters.customers !== null
    ) {
      condition["_customer"] = this.filters.customers;
    }
    if (this.filters.accounts !== undefined && this.filters.accounts !== null) {
      condition["_account"] = this.filters.accounts;
    }
    if (this.filters.tagid !== undefined && this.filters.tagid !== null) {
      condition["_tag"] = this.filters.tagid;
    } if (this.filters.tagvalue !== undefined && this.filters.tagvalue !== null) {
      condition["tagvalue"] = this.filters.tagvalue;
    }
    this.alertConfigService.instanceFilter(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = response.data;
        let agendIds = response.data
          .map((itm) => `(match_phrase:(agent.id:'${itm.agentid}'))`)
          .join(",");
        let agents = response.data
          .map((itm) => `"${itm.agentid}"`)
          .join(",");
        let query = (`&_a=(description:'',filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'wazuh-alerts-*',key:agent.id,negate:!f,params:!(${agents})),query:(bool:(minimum_should_match:1,should:!(${agendIds}))))))`);
        this.wazhuURL = this.domainURL + query;
        this.noData = false;
      } else {
        this.noData = true;
      }

      this.gettingAssets = false;
    });
  }
  tagChanged(e) {
    if (e && e != null && e != "" && e != "") {
      let tag = this.tagList.find((o) => o["tagid"] == e);
      let tagClone = _.cloneDeep(tag);

      this.filters.tagvalue = null;

      if (tagClone && tagClone.tagtype == "list") {
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
  formDashboardURL() {
    this.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      lookupkey: AppConstant.LOOKUPKEY.WAZUH_CRED,
      keyname: WazuhConstant.DASHBOARD_KEYNAME,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.baseUrl = response.data[0]["keyvalue"] + this.mainURL;
        this.domainURL = this.baseUrl;
        this.wazhuURL = this.baseUrl;
        this.nodeTabChanged({ index: 0 });
      }
      this.loading = false;
    });
  }
  nodeTabChanged(event) {
    this.nodetabIndex = event.index;
  }
  tabs = [
    {
      title: "Security Information Management",
    },
    {
      title: "Auditing and Policy Management",
    },
    {
      title: "Regulatory Compliance",
    },
    {
      title: "Threat Detection and Response",
    },
  ];
  resetFilters() {
    this.filters = { provider: "AWS" };
  }
}
