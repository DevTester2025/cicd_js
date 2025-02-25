import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConstant } from "src/app/app.constant";
import { CommonFileService } from "src/app/modules/services/commonfile.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { WazuhConstant } from "src/app/wazuh.constants";
import { WazuhService } from "./wazuh.service";

@Component({
  selector: "app-security-monitoring",
  templateUrl: "./security.component.html",
  styleUrls: ["./security.component.css"],
})
export class SecurityComponent implements OnInit {
  @Input() assetData;
  userstoragedata: any = {};
  agentID: any = "";
  gettingData = true;
  packageList: any = [];
  totalPkgCount = 0;
  processList: any = [];
  networkList: any = [];
  portList: any = [];
  settingsList: any = [];
  agentStates: any = {};
  StatesInterval: any = [];
  loading: any = false;
  wazuh_url: any = {};
  dashboard_urls: any = {};
  // selected_time: any = this.commonFileService.getDateRange();
  availableRange = WazuhConstant.AVAILABLE_RANGE;
  StatesGlobal: any = [];
  detailsObj: any = {};
  showDetails = false;
  loadstatistics = false;
  sectabIndex = 0;
  settingHeader = [
    { field: "iface", header: "Interface", datatype: "string" },
    { field: "address", header: "Address", datatype: "string" },
    { field: "netmask", header: "Netmask", datatype: "string" },
    { field: "proto", header: "Protocol", datatype: "string" },
    { field: "broadcast", header: "Broadcast", datatype: "string" },
  ] as any;

  portHeader = [
    { field: "localip", header: "Local IP", datatype: "string" },
    { field: "localport", header: "Local port", datatype: "string" },
    { field: "state", header: "State", datatype: "string" },
    { field: "protocol", header: "Protocol", datatype: "string" },
  ] as any;

  networkHeader = [
    { field: "name", header: "Name", datatype: "string" },
    { field: "mac", header: "MAC", datatype: "string" },
    { field: "state", header: "State", datatype: "string" },
    { field: "mtu", header: "MTU", datatype: "string" },
    { field: "type", header: "Type", datatype: "string" },
  ] as any;

  processHeader = [
    { field: "name", header: "Name", datatype: "string" },
    { field: "euser", header: "Effective user", datatype: "string" },
    { field: "egroup", header: "Effective group", datatype: "string" },
    { field: "pid", header: "PID", datatype: "string" },
    { field: "ppid", header: "Parent PID", datatype: "string" },
    { field: "command", header: "Command", datatype: "string" },
    { field: "argvs", header: "Argvs", datatype: "string" },
    { field: "vm_size", header: "VM size", datatype: "string" },
    { field: "size", header: "Size", datatype: "string" },
    { field: "session", header: "Session", datatype: "string" },
    { field: "priority", header: "Priority", datatype: "string" },
    { field: "state", header: "State", datatype: "string" },
  ] as any;

  packageHeader = [
    { field: "name", header: "Name", datatype: "string" },
    { field: "architecture", header: "Architecture", datatype: "string" },
    { field: "version", header: "Version", datatype: "string" },
    { field: "vendor", header: "Vendor", datatype: "string" },
    { field: "description", header: "Description", datatype: "string" },
  ];

  intervalHeader = [
    { field: "location", header: "Location", datatype: "string" },
    { field: "events", header: "Events", datatype: "string" },
    { field: "bytes", header: "Bytes", datatype: "string" },
  ];

  globalLogHeader = [
    { field: "location", header: "Location", datatype: "string" },
    { field: "events", header: "Events", datatype: "string" },
    { field: "bytes", header: "Bytes", datatype: "string" },
  ];

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
  wazhuToken = {} as any;
  constructor(
    private wazhuService: WazuhService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private commonFileService: CommonFileService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (this.assetData) {
      this.formDashboardURL();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetData && changes.assetData.currentValue) {
      this.assetData = changes.assetData.currentValue;
      this.formDashboardURL();
    }
  }
  sectabChange(event) {
    this.sectabIndex = event.index;
    this.getToken();
  }
  formDashboardURL() {
    this.agentID = this.assetData.agentid;
    this.loading = true;
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
        this.commonFileService.wazuh_updateDate(this.wazuh_url, this.agentID);
        let sanitizedURL = this.commonFileService.getWazuhUrl();
        Object.keys(sanitizedURL).forEach((key) => {
          this.dashboard_urls[key] =
            this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedURL[key]);
        });
        // this.getAgent();
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }
  getToken() {
    this.loadstatistics = true;
    this.wazhuService
      .getToken({
        ipaddr: this.assetData.privateipv4,
        instancename: this.assetData.instancename,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        this.loadstatistics = false;
        if (response.status) {
          this.wazhuToken = response.data;
          if (this.sectabIndex == 1) {
            this.getStatesAgent();
            // this.getStatesLogs();
          }
          if (this.sectabIndex == 2) {
            this.getPackages();
          }
          if (this.sectabIndex == 3) {
            this.getProcesses();
          }
          if (this.sectabIndex == 4) {
            this.getPorts();
            this.getNetwork();
            this.getNetworkSettings();
          }
        }
      });
  }
  getAgent() {
    this.loading = true;
    this.wazhuService
      .getAgent({
        ipaddr: this.assetData.privateipv4,
        instancename: this.assetData.instancename,
        tenantid: this.userstoragedata.tenantid,
        wazuhdata: this.wazhuToken,
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
          this.commonFileService.wazuh_updateDate(this.wazuh_url, this.agentID);
          let sanitizedURL = this.commonFileService.getWazuhUrl();
          Object.keys(sanitizedURL).forEach((key) => {
            this.dashboard_urls[key] =
              this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedURL[key]);
              console.log(this.dashboard_urls[key]);
          });
          this.getPackages();
          this.getProcesses();
          this.getNetwork();
          this.getPorts();
          this.getNetworkSettings();
          // this.getStatesLogs();
          this.getStatesAgent();
          this.loading = false;
        }
      });
    this.loading = false;
  }

  // changeDateRange(event) {
  //   this.loading = true;
  //   this.commonFileService.wazuh_updateDate(this.wazuh_url, this.agentID, event);
  //   let sanitizedURL = this.commonFileService.getWazuhUrl();
  //   Object.keys(sanitizedURL).forEach(
  //     (key) => {
  //       this.dashboard_urls[key] = this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedURL[key]);
  //     }
  //   );
  //   this.loading = false;
  // }

  getPackages(limit?, offset?) {
    this.pckgTableConfig.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      agentid: this.agentID,
      type: "Package",
      wazuhdata: this.wazhuToken,
    };
    this.wazhuService.getData(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status && response.data) {
        this.packageList = response.data.data.affected_items;
      }
      this.pckgTableConfig.loading = false;
    });
  }
  getProcesses() {
    this.tableConfig.loading = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "Process",
        wazuhdata: this.wazhuToken,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.processList = response.data.data.affected_items;
        }
        this.tableConfig.loading = false;
      });
  }
  getNetwork() {
    this.tableConfig.loading = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "Network",
        wazuhdata: this.wazhuToken,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.networkList = response.data.data.affected_items;
        }
        this.tableConfig.loading = false;
      });
  }
  getPorts() {
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "Ports",
        wazuhdata: this.wazhuToken,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.portList = response.data.data.affected_items;
          this.portList.forEach((element) => {
            element.localip = element.local.ip;
            element.localport = element.local.port;
          });
        }
      });
  }
  getNetworkSettings() {
    this.tableConfig.loading = true;
    this.pckgTableConfig.loading = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "NetworkSettings",
        wazuhdata: this.wazhuToken,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.settingsList = response.data.data.affected_items;
        }
      });
    this.tableConfig.loading = false;
    this.pckgTableConfig.loading = false;
  }
  getStatesAgent() {
    this.loadstatistics = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "States_Agent",
        wazuhdata: this.wazhuToken,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.agentStates = response.data.data.affected_items[0];
        }
        this.loadstatistics = false;
        this.getStatesLogs();
      });
  }
  getStatesLogs() {
    this.tableConfig.loading = true;
    this.pckgTableConfig.loading = true;
    this.wazhuService
      .getData({
        tenantid: this.userstoragedata.tenantid,
        agentid: this.agentID,
        type: "States_Interval",
        wazuhdata: this.wazhuToken,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.StatesInterval =
            response.data.data.affected_items[0].interval.files;
          this.StatesGlobal = response.data.data.affected_items[0].global.files;
          this.StatesGlobal.forEach((element) => {
            if (element.files) {
              element.location = element.files.bytes;
              element.events = element.files.events;
              element.bytes = element.files.location;
            }
          });
          this.StatesInterval.forEach((element) => {
            if (element.files) {
              element.location = element.files.bytes;
              element.events = element.files.events;
              element.bytes = element.files.location;
            }
          });
        }
        this.pckgTableConfig.loading = false;
        this.tableConfig.loading = false;
      });
  }
  dataChanged(event) {
    if (event.pagination) {
      this.getPackages(event.pagination.limit, event.pagination.offset);
    } else if (event.view) {
      this.detailsObj = event.data;
      this.showDetails = true;
    }
  }
  onChanged(event) {
    this.showDetails = false;
  }
}
