import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import * as Papa from "papaparse";
import { AppConstant } from "src/app/app.constant";
import { SSMService } from "src/app/business/base/assets/nodemangement/ssm.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-cloudmatiq-patchmanager",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/patch-manager/patch-manager.component.html",
  styles: [],
})
export class PatchManagerComponent implements OnInit {
  @Output() tabChange = new EventEmitter<number>();
  @Input() refresh: boolean;
  @Input() region: string;
  @Input() accountid: number;
  baselineObj = {} as any;
  isVisible = false;
  viewServerDetail = false;
  showConfig = false;
  patchCompliance = [];
  patchbaseLines = [];
  totalCount = null;
  accountValue: any = [];
  pbtableHeader = [
    { field: "BaselineId", header: "Baseline ID", datatype: "string", isdefault: true },
    { field: "BaselineName", header: "Baseline Name", datatype: "string", isdefault: true },
    {
      field: "isdefault",
      header: "Default baseline",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "OperatingSystem",
      header: "Operating System",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "BaselineDescription",
      header: "Description",
      datatype: "string",
      isdefault: true,
    },
  ];
  complaincesummarytableHeader = [
    { field: "BaselineId", header: "Baseline ID", datatype: "string", isdefault: true },
    { field: "InstanceId", header: "Instance ID", datatype: "string", isdefault: true },
    {
      field: "instance.instanceName",
      header: "Instance Name",
      datatype: "string",
      isdefault: true,
    },
   
    {
      field: "Operation",
      header: "Operation",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "platform",
      header: "Operating System",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "OperationEndTime",
      header: "Last Operation Date",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "OperationStartTime",
      header: "Operation Start Time",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "OperationEndTime",
      header: "Operation End Time",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "status",
      header: "Compliance Status",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "CriticalNonCompliantCount",
      header: "Critical noncompliant count",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "SecurityNonCompliantCount",
      header: "Security noncompliant count",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "OtherNonCompliantCount",
      header: "Other noncompliant count",
      datatype: "string",
      isdefault: true,
    },
  ];
  complaincesummarytableConfig = {
    edit: false,
    delete: true,
    view: false,
    refresh: true,
    globalsearch: true,
    columnselection: true,
    apisort: true,
    pagination: true,
    loading: false,
    pageSize: 10,
    title: "",
    linkasset: true,
    tabledownload: false,
    scroll: { x: "1500px" },
    widthConfig: [
      "150px",
      "150px",
      "150px",
      "150px",
      "150px",
      "150px",
      "150px",
      "150px",
      "150px",
      "150px",
      "200px",
      "200px",
      "200px",
      "150px",
    ],
  };
  pbtableConfig = {
    edit: false,
    delete: false,
    view: false,
    refresh: true,
    globalsearch: true,
    columnselection: true,
    apisort: true,
    rollback: true,
    pagination: true,
    loading: false,
    pageSize: 10,
    title: "",
    tabledownload: false,
  };
  userstoragedata = {} as any;
  configpatch = false;
  createpb = false;
  serverDetail = {} as any;
  title = "Create Patch Baseline";
  screens = [];
  appScreens = {} as any;
  selectedcolumns = [] as any;
  loading = false;
  pmtabIndex = 0;
  op_system = null;
  baseline = null;
  osList = [
    "WINDOWS",
    "AMAZON_LINUX",
    "AMAZON_LINUX_2",
    "AMAZON_LINUX_2022",
    "UBUNTU",
    "REDHAT_ENTERPRISE_LINUX",
    "SUSE",
    "CENTOS",
    "ORACLE_LINUX",
    "DEBIAN",
    "MACOS",
    "RASPBIAN",
    "ROCKY_LINUX",
  ];
  options = {
    legend: {
      position: "bottom",
      labels: {
        fontColor: "#ffffff",
        boxWidth: 10,
      },
    },
  };
  card2chart = {
    labels: [
      "Critical noncompliant",
      "High noncompliant",
      "Other noncompliant",
    ],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#e28743",
          "#76b5c5",
          "#063970",
          "#ac07fd",
          "#856b0b",
          "#85280b",
        ],
        hoverBackgroundColor: [
          "#e28743",
          "#76b5c5",
          "#063970",
          "#ac07fd",
          "#856b0b",
          "#85280b",
        ],
      },
    ],
  };
  card3chart = {
    labels: ["Critical compliant", "High compliant", "Other compliant"],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#e28743",
          "#76b5c5",
          "#063970",
          "#ac07fd",
          "#856b0b",
          "#85280b",
        ],
        hoverBackgroundColor: [
          "#e28743",
          "#76b5c5",
          "#063970",
          "#ac07fd",
          "#856b0b",
          "#85280b",
        ],
      },
    ],
  };
  constructor(
    private localStorageService: LocalStorageService,
    private SSMService: SSMService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.NODE_MGMT,
    } as any);
    if (_.includes(this.appScreens.actions, "Config Patch")) {
      this.configpatch = true;
    }
    if (_.includes(this.appScreens.actions, "Create Patch Baseline")) {
      this.createpb = true;
    }
    if (_.includes(this.appScreens.actions, "Edit Patch Baseline")) {
      this.pbtableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete Patch Baseline")) {
      this.pbtableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.pbtableConfig.tabledownload = true;
      this.complaincesummarytableConfig.tabledownload = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.pbtableHeader.filter((el) => {
      return el.isdefault == true;
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.complaincesummarytableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }
  ngOnInit() {}
  ngOnChanges(changes) {
    if (changes.refresh && changes.refresh.currentValue) {
      this.getDashboard();
      this.pmtabIndex = 0;
    }
    
    if (changes.accountid) {
      if (Array.isArray(changes.accountid.currentValue)) {
        this.accountValue = changes.accountid.currentValue;
      } else {
        this.accountValue = [changes.accountid.currentValue];
      }
    }    
  }

  complianceSummary = [];
  getComplianceSummary() { 
    this.complaincesummarytableConfig.loading = true;
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
    } as any;
    this.complianceSummary = [];
    this.accountValue.forEach((accountId) => {
      formData["accountid"] = accountId;
      this.SSMService.getComplianceSummary(formData).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.complaincesummarytableConfig.loading = false;
          if (response && response.length > 0) {
            let accountsData = response.flatMap((instance) =>
              instance.complianceData.data.map((dataItem) => ({
                BaselineId: dataItem.BaselineId,
                InstanceId: dataItem.InstanceId,
                "instance.instanceName": instance.instanceName,
                Operation: dataItem.Operation,
                platform: instance.platform,
                OperationEndTime: dataItem.OperationEndTime,
                Region: instance.region,
                awsAccountID: instance.accountid,
                OperationStartTime: dataItem.OperationStartTime,
                status: dataItem.CriticalNonCompliantCount > 0 ||
                dataItem.OtherNonCompliantCount > 0 ||
                dataItem.SecurityNonCompliantCount > 0
                  ? "Non-compliant"
                  : "Compliant",
                CriticalNonCompliantCount: dataItem.CriticalNonCompliantCount,
                SecurityNonCompliantCount: dataItem.SecurityNonCompliantCount,
                OtherNonCompliantCount: dataItem.OtherNonCompliantCount,
              }))
            );
            this.complianceSummary =
              this.complianceSummary.concat(accountsData);
          }
          this.totalCount = this.complianceSummary.length;
        },
        (err) => {
          this.complaincesummarytableConfig.loading = false;
          console.log(err);
        }
      );
    });
  }
  pmTabChanged(event) {
    this.pmtabIndex = event.index;
    this.tabChange.emit(event.index);
    if (event.index == 0) {
      this.getDashboard();
    }
    if (event.index == 1) {
      this.getComplianceSummary();
    }
    if (event.index == 2) {
      this.getBaselineList();
    }
  }
  getDashboard() {
    this.loading = true;
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.card2chart.datasets[0]["data"] = [];
    this.card3chart.datasets[0]["data"] = [];
    this.SSMService.getPMDashboard(formData).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.data) {
          let NonCompliantSummary =
            response.data.NonCompliantSummary.SeveritySummary;
          this.card2chart.datasets[0]["data"] = [
            NonCompliantSummary.CriticalCount,
            NonCompliantSummary.HighCount,
            NonCompliantSummary.InformationalCount +
              NonCompliantSummary.LowCount +
              NonCompliantSummary.MediumCount +
              NonCompliantSummary.UnspecifiedCount,
          ];
          let CompliantSummary = response.data.CompliantSummary.SeveritySummary;
          this.card3chart.datasets[0]["data"] = [
            CompliantSummary.CriticalCount,
            CompliantSummary.HighCount,
            CompliantSummary.InformationalCount +
              CompliantSummary.LowCount +
              CompliantSummary.MediumCount +
              CompliantSummary.UnspecifiedCount,
          ];
        }
        this.card2chart = { ...this.card2chart };
        this.card3chart = { ...this.card3chart };
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getBaselineList() {
    this.pbtableConfig.loading = true;
    let query = "";
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      limit: 10,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.patchbaseLines = [];
    if (this.op_system) query = `?os=${this.op_system}`;
    this.SSMService.getBaselines(formData, query).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.pbtableConfig.loading = false;
        if (response && response.status) {
          this.patchbaseLines = _.map(response.data, (itm) => {
            itm.AWSBaselineId = itm.BaselineId;
            itm.BaselineId = _.includes(itm.BaselineId, "/")
              ? itm.BaselineId.split("/")[1]
              : itm.BaselineId;
            itm.isdefault = itm.DefaultBaseline ? "Yes" : "No";
            itm.rollback = itm.DefaultBaseline ? "N" : "Y";
            return itm;
          });
          this.totalCount = this.patchbaseLines.length;
        }
      },
      (err) => {
        this.pbtableConfig.loading = false;
        console.log(err);
      }
    );
  }
  dataChanged(event) {
    if (event.delete) {
      let formData = {
        region: this.region,
        tenantid: this.userstoragedata.tenantid,
        baselineid: event.data.BaselineId,
        updateddt: new Date(),
        updatedby: this.userstoragedata.fullname,
      } as any;
      if (this.accountid != null && this.accountid != undefined) {
        formData["accountid"] = this.accountid;
      }
      this.SSMService.deletePatchbaseline(formData).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success("Patch Baseline Deleted Successully");
          } else {
            this.message.error("Failed to Delete Baseline");
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
    } else if (event.refresh) {
      if (this.pmtabIndex == 0) {
        this.getDashboard();
      }
      if (this.pmtabIndex == 1) {
        this.getComplianceSummary();
      }
      if (this.pmtabIndex == 2) {
        this.getBaselineList();
      }
    } else if (event.edit) {
      if (this.pmtabIndex == 2) {
        this.isVisible = true;
        this.baselineObj = event.data;
        this.title = "Update Patch Baseline";
      }
    } else if (event.toasset) {
      this.serverDetail.cloudprovider = event.data.cloudprovider;
      this.serverDetail.instanceref = event.data.providerrefid;
      this.serverDetail.instancereftype = "instancerefid";
      this.viewServerDetail = true;
    } else if (event.rollback) {
      this.baselineObj = event.data;
      this.setDefaultPB();
    } else if (event.download) {
      let data = [];
      if (this.pmtabIndex == 1) {
        _.each(this.complianceSummary, (m) => {
          data.push([
            m.BaselineId,
            m.InstanceId,
            m.instance.instanceName,
            m.Operation,
            m.platform,
            m.OperationEndTime,
            m.Region,
            m.awsAccountID,
            m.OperationStartTime,
            m.Status,
            m.CriticalNonCompliantCount,
            m.SecurityNonCompliantCount,
            m.OtherNonCompliantCount,
          ]);
        });
        this.downloadCSV(this.complaincesummarytableHeader, data);
      }
      if (this.pmtabIndex == 2) {
        _.each(this.patchbaseLines, (m) => {
          data.push([
            m.BaselineId,
            m.BaselineName,
            m.isdefault,
            m.OperatingSystem,
            m.BaselineDescription,
          ]);
        });
        this.downloadCSV(this.pbtableHeader, data);
      }
    } else if(event.search){
      if (this.pmtabIndex == 1) {
      this.totalCount = event.totalCount;
      }
      if (this.pmtabIndex == 2) {
      this.totalCount = event.totalCount;
      }
    }
  }
  setDefaultPB() {
    this.pbtableConfig.loading = true;
    let req = {
      accountid: this.accountid,
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      BaselineId: this.baselineObj.AWSBaselineId,
    };
    this.SSMService.setDefaultPatchbaseline(req).subscribe(
      (result) => {
        this.pbtableConfig.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success("Patch Baseline Updated Successfully");
          this.getBaselineList();
        } else {
          this.message.error("Sorry,Patch Baseline Updation Failed");
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  closeDrawer() {
    this.isVisible = false;
    this.showConfig = false;
  }
  showPatchBaseline() {
    this.isVisible = true;
    this.title = "Create Patch Baseline";
  }
  notifyBaseLine() {
    this.isVisible = false;
    this.getBaselineList();
  }
  notifyConfig() {
    this.showConfig = false;
  }
  downloadCSV(header, data) {
    let hdr = [];
    _.map(header, (itm) => {
      hdr.push(itm.header);
    });
    var csv = Papa.unparse([[...hdr], ...data]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }
}
