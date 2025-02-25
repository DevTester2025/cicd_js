import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConstant } from "src/app/app.constant";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { WazuhConstant } from "src/app/wazuh.constants";
import { CommonFileService } from "src/app/modules/services/commonfile.service";
import { WazuhService } from "../security/wazuh.service";

@Component({
  selector: "app-security-compliance",
  templateUrl: "./security-compliance.component.html",
  styleUrls: ["./security-compliance.component.css"],
})
export class SecurityComplianceComponent implements OnInit {
  @Input() assetData;
  secloading: any = false;
  wazuh_url: any = {};
  agentID: any;
  scaList: any = [];
  scaTotal: any = {
    pass : "-",
    fail : "-",
    invalid : "-"
  };
  dashboard_urls: any = {};
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    refresh:true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;

  scaHeader = [
    { field: "id", header: "ID", datatype: "string" },
    { field: "title", header: "Title", datatype: "string" },
    { field: "registry", header: "Target", datatype: "string" },
    { field: "result", header: "Result", datatype: "string" },
  ] as any;

  pckgTableConfig = {
    edit: false,
    delete: false,
    view: true,
    globalsearch: true,
    refresh:true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;

  detailsObj: any = {};
  showDetails = false;
  // selected_time: any = this.commonFileService.getDateRange();
  availableRange = WazuhConstant.AVAILABLE_RANGE;
  userstoragedata: any = {};
  wazhuToken = {} as any;
  stabIndex = 0;
  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private wazhuService: WazuhService,
    private localStorageService: LocalStorageService,
    private commonFileService: CommonFileService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    if (this.assetData) this.formDashboardURL();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetData && changes.assetData.currentValue) {
      this.assetData = changes.assetData.currentValue;
      this.formDashboardURL();
    }
  }
  getToken() {
    this.wazhuService
      .getToken({
        ipaddr: this.assetData.privateipv4,
        instancename: this.assetData.instancename,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.wazhuToken = response.data;
          this.getSCATotal();
          this.getSCAList();
        }
      });
  }
  formDashboardURL() {
    this.agentID = this.assetData.agentid;
    this.secloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      lookupkey: AppConstant.LOOKUPKEY.WAZUH_CRED,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.wazuh_url = response.data.find((el) => {
          return el.keyname == WazuhConstant.DASHBOARD_KEYNAME;
        });
        // this.getAgent();
        this.commonFileService.wazuh_updateDate(this.wazuh_url, this.agentID);
        let sanitizedURL = this.commonFileService.getWazuhUrl();
        Object.keys(sanitizedURL).forEach((key) => {
          this.dashboard_urls[key] =
            this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedURL[key]);
        });
        this.secloading = false;
      } else {
        this.secloading = false;
      }
    });
  }
  tabChanged(event) {
    this.stabIndex = event.index;
    if (event.index == 5) {
      this.getToken();
    }
  }
  getAgent() {
    this.secloading = true;
    this.wazhuService
      .getAgent({
        ipaddr: this.assetData.privateipv4,
        instancename: this.assetData.instancename,
        tenantid: this.userstoragedata.tenantid,
        wazuhdata: this.wazhuToken
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (
          response.data &&
          response.data.data &&
          response.data.data.affected_items &&
          response.data.data.affected_items[0]
        ) {
          this.agentID = response.data.data.affected_items[0].id;
          this.getSCATotal();
          this.getSCAList();
          this.commonFileService.wazuh_updateDate(this.wazuh_url, this.agentID);
          let sanitizedURL = this.commonFileService.getWazuhUrl();
          Object.keys(sanitizedURL).forEach((key) => {
            this.dashboard_urls[key] =
              this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedURL[key]);
          });
        }
      });
    this.secloading = false;
  }
  getSCATotal() {
    this.secloading = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "SCA_Total",
        wazuhdata: this.wazhuToken
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.data && response.data.data) {
          this.scaTotal = response.data
            ? response.data.data.affected_items[0]
            : {};
        }
      });
    this.secloading = false;
  }
  dataChanged(event) {
    if (event.view) {
      this.detailsObj = event.data;
      this.showDetails = true;
    }
  }
  getSCAList() {
    this.pckgTableConfig.loading = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "SCA_List",
        wazuhdata: this.wazhuToken
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.data && response.data.data) {
          this.scaList = response.data.data.affected_items;
        }
        this.pckgTableConfig.loading = false;
      });
  }
  onChanged(event) {
    this.showDetails = false;
  }

  // changeDateRange(event) {
  //   this.secloading = true;
  //   this.commonFileService.wazuh_updateDate(this.wazuh_url, this.agentID, event);
  //   let sanitizedURL = this.commonFileService.getWazuhUrl();
  //   Object.keys(sanitizedURL).forEach(
  //     (key) => {
  //       this.dashboard_urls[key] = this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedURL[key]);
  //     }
  //   );
  //   this.secloading = false;
  // }
}
