import { Component, OnInit } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import * as _ from "lodash";
import { AlertConfigService } from "src/app/business/base/alertconfigs/alertconfig.service";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import * as Papa from "papaparse";
import { SecurityContext } from '@angular/core';

@Component({
  selector: "app-compliance-score-list",
  templateUrl: "./compliance-score-list.component.html",
  styleUrls: ["./compliance-score-list.component.css"],
})
export class ComplianceScoreListComponent implements OnInit {
  gettingAssets = false;
  userstoragedata = {} as any;
  tagList = [];
  customersList = [];
  accountsList = [];
  cloudproviderList = [];
  filters = { provider: "AWS" } as any;
  selectedTag = {} as any;
  screens: any = [];
  appScreens: any = [];
  instanceList = [];
  noData = false;
  currentTab = 0;
  selectedcolumns = [] as any;
  isLoading = false;
  averageSummary: any = {};
  instance = [];
  dashboardURL: SafeUrl; 
  modalData: any = {};
  logsList = [];
  isModalVisible = false;
  isShowVisible = false;
  isRmediationVisible = false;
  formTitle = "";
  iframeSrc: string = `https://wazuhdb.opsmaster.ai/app/dashboards#/view/{:viewId}?embed=true&hide-filter-bar=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))`;
  selectedType = [];
  complianceType: any;
  isView = false;
  instanceData = {};
  compilanceList: any[] = [];
  compilanceReport = AppConstant.COMPLIANCEREPORT;
  isVisible = false;
  compilanceCategoryList: any[] = [];
  totalCount = null;
  totalCompilanceCount = null
  tableHeader = [
    {
      field: "instancename",
      header: "Instance Name",
      datatype: "string",
      isdefault: true,
      isprogressbar: false,
    },
    {
      field: "pcidss",
      header: "PCI DSS",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "gdpr",
      header: "GDPR",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "hipaa",
      header: "HIPAA",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "nist",
      header: "NIST 800-53",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "tsc",
      header: "TSC",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "cis_benchmark",
      header: "CIS-Benchmark",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "riskscore",
      header: "Risk Score",
      datatype: "number",
      isdefault: true,
      isprogressbar: true,
    },
    {
      field: "riskcatagory",
      header: "Risk Catagory",
      datatype: "string",
      isdefault: true,
      isprogressbar: false,
    },
    {
      field: "instancerefid",
      header: "Instance Id",
      datatype: "string",
      isdefault: false,
      isprogressbar: false,
    },
    {
      field: "privateipv4",
      header: "Private IP",
      datatype: "string",
      isdefault: false,
      isprogressbar: false,
    },
    {
      field: "cloudprovider",
      header: "Cloud Provider",
      datatype: "string",
      isdefault: false,
      isprogressbar: false,
    },
    {
      field: "customerid",
      header: "Customer Id",
      datatype: "string",
      isdefault: false,
      isprogressbar: false,
    },
    {
      field: "platform",
      header: "Platform",
      datatype: "string",
      isdefault: false,
      isprogressbar: false,
    },
  ] as any;
  tableConfig = {
    globalsearch: true,
    apisort: true,
    view: true,
    pagination: true,
    frontpagination: true,
    manualpagination: false,
    pageSize: 10,
    loading: false,
    columnselection: true,
    refresh: true,
    count: 0,
  } as any;
  compilanceTableConfig = {
    globalsearch: true,
    apisort: false,
    view: true,
    pagination: true,
    frontpagination: true,
    manualpagination: false,
    pageSize: 10,
    loading: false,
    tabledownload: true,
    refresh: true,
    count: 0,
  } as any;
  compilanceTableHeader = [
    {
      field: "compliancecategory",
      header: "Compliance Type",
      datatype: "string",
    },
    {
      field: "instancename",
      header: "Instance name",
      datatype: "string",
    },
    {
      field: "controlcategory",
      header: "Controls / Rules",
      datatype: "string",
    },
    {
      field: "compliancestatus",
      header: "Status",
      datatype: "string",
      compliancestatus: true,
    },
    {
      field: "values",
      header: "Value",
      datatype: "number",
    },
  ] as any;
  reportData = [
    {
      pcidss: 85,
      gdpr: 78,
      hipaa: 85,
      nist: 85,
      tsc: 88,
      cis_benchmark: 82,
      riskscore: 30,
      riskcatagory: "Low",
    },
    {
      pcidss: 87,
      gdpr: 79,
      hipaa: 90,
      nist: 74,
      tsc: 81,
      cis_benchmark: 77,
      riskscore: 89,
      riskcatagory: "Critical",
    },
    {
      pcidss: 87,
      gdpr: 74,
      hipaa: 79,
      nist: 88,
      tsc: 91,
      cis_benchmark: 80,
      riskscore: 50,
      riskcatagory: "Medium",
    },
    {
      pcidss: 80,
      gdpr: 72,
      hipaa: 91,
      nist: 83,
      tsc: 79,
      cis_benchmark: 85,
      riskscore: 80,
      riskcatagory: "Critical",
    },
    {
      pcidss: 90,
      gdpr: 82,
      hipaa: 88,
      nist: 84,
      tsc: 88,
      cis_benchmark: 82,
      riskscore: 66,
      riskcatagory: "High",
    },
  ];
  constructor(
    private httpHandler: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private customerAccService: CustomerAccountService,
    private tagService: TagService,
    private alertConfigService: AlertConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
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
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter(el => el.isdefault);
  }

  ngOnInit() {
    this.init();
    const savedFilters = this.localStorageService.getItem(
      "complianceScoreFilters"
    );
    if (savedFilters && this.route.snapshot.queryParams["list"]) {
      this.filters = savedFilters;
      this.getfilteredInstance();
    }
  }

  init() {
    this.getAllCustomers();
    this.getAccountsList();
    this.getproviderList();
    this.getAllTags();
    this.getInstanceData();
    this.getComplianceModules();
    this.getCompilanceReport();
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
            obj.lookupvalues = Math.floor(Math.random() * (obj.max - obj.min + 1)) + obj.min;
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

  tagChanged(e) {
    if (e) {
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
        tagClone.max = tagClone.lookupvalues.split(",")[1];
      }

      this.selectedTag = _.cloneDeep(tagClone);
    }
  }

  getproviderList() {
    let condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    } as any;

    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.cloudproviderList = response.data;
      } else {
        this.cloudproviderList = [];
      }
    });
  }

  getfilteredInstance() {
    this.tableConfig.loading = true;
    this.gettingAssets = true;
    let condition = {};
    this.instanceList = [];
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      provider: this.filters.provider,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.filters.customers) {
      condition["_customer"] = this.filters.customers;
    }
    if (this.filters.accounts) {
      condition["_account"] = this.filters.accounts;
    }
    if (this.filters.tagid) {
      condition["_tag"] = this.filters.tagid;
    }
    if (this.filters.tagvalue) {
      condition["tagvalue"] = this.filters.tagvalue;
    }
    if (this.filters.instancerefid && this.filters.instancerefid.length > 0) {
      condition["instancerefid"] = this.filters.instancerefid;
    }
    this.alertConfigService.instanceFilter(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        const instanceData = response.data.slice(-5);
        this.instanceList = instanceData.map((instance: any, index: number) => {
          return {
            ...instance,
            ...this.reportData[index],
          };
        });
        this.calculateAveragesSimple();
        if (this.tableHeader && this.tableHeader.length > 0) {
          this.selectedcolumns = this.tableHeader.filter(el => el.isdefault);
        }
        this.noData = false;
        this.tableConfig.loading = false;
        this.totalCount = this.instanceList.length;
      } else {
        this.noData = true;
        this.tableConfig.loading = false;
        this.totalCount = 0;
      }
      this.gettingAssets = false;
    });
  }

  getInstanceData() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      provider: this.filters.provider,
      tenantid: this.userstoragedata.tenantid,
    };
    this.alertConfigService.instanceFilter(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instance = response.data;
      } else {
        this.instance = [];
      }
    });
  }

  calculateAveragesSimple() {
    const totalRecords = this.instanceList.length;

    if (totalRecords > 0) {
      let totalPcidss = 0,
        totalGdpr = 0,
        totalHipaa = 0,
        totalNist = 0,
        totalSoc2 = 0,
        totalCisBenchmark = 0;
      this.instanceList.forEach((item) => {
        totalPcidss += item.pcidss;
        totalGdpr += item.gdpr;
        totalHipaa += item.hipaa;
        totalNist += item.nist;
        totalSoc2 += item.soc2;
        totalCisBenchmark += item.cis_benchmark;
      });
      this.averageSummary = {
        pcidss: Math.round(totalPcidss / totalRecords),
        gdpr: Math.round(totalGdpr / totalRecords),
        hipaa: Math.round(totalHipaa / totalRecords),
        nist: Math.round(totalNist / totalRecords),
        soc2: Math.round(totalSoc2 / totalRecords),
        cis_benchmark: Math.round(totalCisBenchmark / totalRecords),
      };
    }
  }

  dataChanged(e) {
    if (e.view) {
      this.isView = true;
      this.localStorageService.addItem("complianceScoreFilters", this.filters);
      this.commonService.setInstanceDetails(e.data);
      console.log(e);
      this.instanceData = e.data;
    }
    if (e.refresh) {
      this.getfilteredInstance();
    }
    if(e.search){
      this.totalCount = e.totalCount;
    }
  }
  goToList() {
    this.isView = false;
  }
  onChangeView(i) {
    this.currentTab = i;
    if (this.currentTab === 1) {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }
  getComplianceModules() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.COMPLIANCE_MODULES,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          const keyvalue = JSON.parse(response.data[0].keyvalue);
          this.selectedType = keyvalue[2];
          console.log(this.selectedType, ".........");
        } else {
          this.selectedType = [];
        }
      });
  }
  openModal(event) {
    console.log(event);
    if (
      event.column.header != "CIS-Benchmark" &&
      event.column.header != "Risk Score"
    ) {
      this.isModalVisible = true;
      this.formTitle =
        event.row.instancename +
        " " +
        " - " +
        " " +
        event.record +
        "/" +
        event.column.header;
      this.complianceType = this.selectedType.find(
        (item) => item.title === event.column.header
      );
      if (this.iframeSrc && this.complianceType.viewId) {
        const safeUrl = this.iframeSrc.replace("{:viewId}", this.complianceType.viewId);
        const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, safeUrl);
        if (sanitizedUrl) {
          this.dashboardURL = this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedUrl);
        } else {
          this.dashboardURL = null;
        }
      }
    }
  }
  getCompilanceReport() {
    this.compilanceList = [];
    this.compilanceReport.forEach((report) => {
      report.values.forEach((value) => {
        value.subcontrols.forEach((subcontrol) => {
          this.compilanceList.push({
            compliancecategory: report.title,
            instancename: subcontrol.instancename,
            controlcategory: subcontrol.details,
            compliancestatus: subcontrol.compliancestatus,
            values: subcontrol.number,
            logs: subcontrol.logs,
          });
        });
      });
    });
    this.totalCompilanceCount = this.compilanceList.length || 0;
  }

  downloadCSV(header, data) {
    console.log("To download csv .>>>>");
    let hdr = [];
    _.map(header, (itm) => {
      hdr.push(itm.header);
    });
    let csv = Papa.unparse([[...hdr], ...data]);
    console.log([[...hdr], ...data]);
    let csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    let csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }

  compilanceDataChanged(event) {
    if (event.download) {
      let data = [];
      _.each(this.compilanceList, (m) => {
        data.push([
          m.compliancecategory,
          m.controlcategory,
          m.compliancestatus,
          m.values,
        ]);
      });
      this.downloadCSV(this.compilanceTableHeader, data);
    }
    if (event.view) {
      console.log(event.data);
      this.isShowVisible = true;
      this.modalData = event.data;
    }
    if (event.refresh) {
      this.getCompilanceReport();
    }
    if(event.search){
      this.totalCompilanceCount = event.totalCount;
    }
  }
}
