import { Component, OnInit } from "@angular/core";
import { DeploymentsService } from "../../deployments.service";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { DomSanitizer } from "@angular/platform-browser";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { Ecl2Service } from "../../ecl2/ecl2-service";
import { Buffer } from "buffer";
import downloadService from "../../../../modules/services/shared/download.service";

@Component({
  selector: "app-cloudmatiq-deployments-list",
  templateUrl:
    "../../../../presentation/web/deployments/deploysolution/list/deploysolution-list.component.html",
})
export class DeploymentsListComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  userstoragedata = {} as any;
  // Table
  deployList = [];
  serverLog: any = {};
  isVisible = false;
  loading = false;
  sortValue = null;
  sortName = null;
  originalData: any = [];
  searchText: string;
  fileUrl: any;
  file: any;
  screens = [];
  appScreens = {} as any;
  logFlag = false;
  fileloading: Boolean = false;
  provider: any;
  providerList: any = [];
  ecl2ServerList: any = [];
  isdownload = false;
  downloadflag = false;
  totalCount = null;
  pageCount = AppConstant.pageCount;
  pageSize: number = 10;
  selectedcolumns = [
    { field: "instancename", header: "Server", datatype: "string", isdefault:true },
    { field: "deploystatus", header: "Status", datatype: "number", isdefault:true },
    { field: "solutionname", header: "Template Name", datatype: "number", isdefault:true },
    {
      field: "customername",
      header: AppConstant.SUBTENANT + " Name",
      datatype: "number",
      isdefault:true
    },
    { field: "zonename", header: "Data Center", datatype: "string", isdefault:true},
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault:true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true
    },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    view: false,
    globalsearch: false,
    loading: false,
    pagination: true,
    columnselection: true,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"],
  };
  tableHeader: any;
  constructor(
    private deploysltnService: DeploymentsService,
    private localStorageService: LocalStorageService,
    private domSanitizer: DomSanitizer,
    private messageService: NzMessageService,
    private commonService: CommonService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.deployList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SERVER_LIST,
    });
    if (_.includes(this.appScreens.actions, "Log")) {
      this.logFlag = true;
    }    
    if (_.includes(this.appScreens.actions, "Download")) {
      this.downloadflag = true;
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
      }  
    }
  ngOnInit() {
    this.getProviderList();
  }
  getProviderList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = response.data;
          const defaultprovider = _.find(this.providerList, function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          });
          this.provider = defaultprovider.keyvalue;
          // this.getEcl2DeploymentList();
          this.onChange(defaultprovider.keyvalue);
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    if (this.provider === AppConstant.CLOUDPROVIDER.ECL2) {
      this.deployList = [];
      this.getEcl2DeploymentList();
    } else if (this.provider === AppConstant.CLOUDPROVIDER.AWS) {
      this.deployList = [];
      this.getAllList();
    } else {
      this.tableHeader = [
        { field: "instancename", header: "Server", datatype: "string" },
        { field: "deploystatus", header: "Status", datatype: "number" },
        { field: "solutionname", header: "Template Name", datatype: "number" },
        {
          field: "customername",
          header: AppConstant.SUBTENANT + " Name",
          datatype: "number",
        },
        { field: "zonename", header: "Data Center", datatype: "string" },
        { field: "lastupdatedby", header: "Updated By", datatype: "string" },
        {
          field: "createddt",
          header: "Created On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
        {
          field: "lastupdateddt",
          header: "Updated On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
      ];
      if (this.tableHeader && this.tableHeader.length > 0) {
        this.selectedcolumns = this.tableHeader
      }
      this.deployList = [];
      this.getAllList();
    }
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.deployList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.deployList = data;
    }
  }
  globalSearch(searchText: any) {
    if (searchText !== "" && searchText !== undefined && searchText != null) {
      const self = this;
      this.deployList = [];
      this.originalData.map(function (item) {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            const regxExp = new RegExp("\\b" + searchText, "gi");
            if (regxExp.test(element)) {
              if (!_.some(self.deployList, item)) {
                self.deployList.push(item);
              }
            }
          }
        }
      });
    } else {
      this.deployList = this.originalData;
    }
    this.totalCount = this.deployList.length;
  }
  getEcl2DeploymentList() {
    this.fileloading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      cloudprovider: this.provider,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.deploysltnService.allecl2(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.fileloading = false;
        let ecl2deployments = [] as any;
        this.ecl2ServerList = response.data;
        response.data.forEach((item) => {
          _.map(item.ecl2deployments, function (obj: any) {
            obj.instancename = obj.instancename;
            if (!_.isNull(item.solution)) {
              obj.cloudprovider = item.solution.cloudprovider;
              obj.solutionname = item.solution.solutionname;
            }
            obj.zonename = item.ecl2zone.zonename;
            obj.customername = item.client ? item.client.customername : null;
            obj.deploystatus = obj.status;
            obj.lastupdatedby = item.lastupdatedby;
            obj.createddt = obj.createddt;
            obj.lastupdateddt = obj.lastupdateddt;
            var diff_in_ms =
              Date.parse(obj.lastupdateddt) - Date.parse(obj.createddt); // milliseconds
            var diff_in_minutes = (diff_in_ms / 60000).toFixed(1); // minutes
            obj.duration = diff_in_minutes;
            obj.ecl2serverid = obj.ecl2serverid;
            obj.ecl2serverpwd = obj.ecl2serverpwd;
            obj.fwconflictstatus = obj.fwconflictstatus;
            obj.lbconflictstatus = obj.lbconflictstatus;
            obj.publicipv4 = obj.publicipv4;
            ecl2deployments.push(obj);
            return ecl2deployments;
          });
        });
        this.deployList = ecl2deployments;
        this.originalData = this.deployList;
      } else {
        this.fileloading = false;
        this.deployList = [];
        this.originalData = [];
      }
    });
  }
  refresh() {
    this.searchText = null;
    if (this.provider === AppConstant.CLOUDPROVIDER.ECL2) {
      this.getEcl2DeploymentList();
    } else if (this.provider === AppConstant.CLOUDPROVIDER.AWS) {
      this.getAllList();
    }
  }
  getAllList() {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      cloudprovider: this.provider,
    } as any;
    let query
    if (this.isdownload === true) {
     query = `?isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
    }
    this.fileloading = true;
    this.deploysltnService
      .all(condition,query)
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.fileloading = false;
          if (this.isdownload) {
            this.fileloading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Deployments.xlsx"
            );
            this.isdownload = false;
          }
          let awsdeplyments = [] as any;
          response.data.forEach((item) => {
            _.map(item.awsdeployments, function (obj: any) {
              if (!_.isNull(item.solution)) {
                obj.cloudprovider = item.solution.cloudprovider;
                obj.solutionname = item.solution.solutionname;
              }
              if (!_.isNull(obj.awssg)) {
                obj.securitygroupname = obj.awssg.securitygroupname;
                obj.awssecuritygroupid = obj.awssg.awssecuritygroupid;
              }
              if (!_.isNull(obj.awssubnet)) {
                obj.subnetname = obj.awssubnet.subnetname;
                obj.awssubnetd = obj.awssubnet.awssubnetd;
              }
              if (!_.isNull(obj.awsvpc)) {
                obj.vpcname = obj.awsvpc.vpcname;
                obj.awsvpcid = obj.awsvpc.awsvpcid;
              }
              obj.zonename = item.tnregion ?  item.tnregion.region : '';
              obj.createddt = obj.createddt;
              obj.lastupdateddt = obj.lastupdateddt;
              var diff_in_ms =
                Date.parse(obj.lastupdateddt) - Date.parse(obj.createddt); // milliseconds
              var diff_in_minutes = (diff_in_ms / 60000).toFixed(1); // minutes
              obj.duration = diff_in_minutes;
              obj.customername = item.client.customername;
              if (!_.isNull(obj.awssolution) && !_.isNull(obj.awssolution.lb)) {
                obj.lbname = obj.awssolution.lb.lbname;
                obj.lbdns = obj.lbdns;
              }
              if (!_.isNull(obj.publicipv4)) {
                obj.fileUrl = obj.publicipv4;
              }
              if (!_.isNull(obj.instancename)) {
                obj.instancename = obj.instancename;
              }
              if (!_.isNull(obj.status)) {
                obj.deploystatus = obj.status;
              }
              if (!_.isNull(obj.publicdns)) {
                obj.publicdns = obj.publicdns;
              }
              if (!_.isNull(obj.publicipv4)) {
                obj.publicipv4 = obj.publicipv4;
              }
              if (!_.isNull(obj.privateipv4)) {
                obj.privateipv4 = obj.privateipv4;
              }
              awsdeplyments.push(obj);
              return obj;
            });
          });
          this.deployList = awsdeplyments;
          this.totalCount = this.deployList.length;
          this.originalData = this.deployList;
        } else {
          this.fileloading = false;
          this.deployList = [];
          this.originalData = [];
          this.totalCount = 0;
        }
      });
  }
  // Event emitted function to get the data from table
  dataChanged(result) {
    this.fileloading = true;
    this.deploysltnService
      .viewlog({ deploymentid: result.deploymentid })
      .subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          var buffer = Buffer.from(response.data.data);
          if (response.status) {
            this.fileloading = false;
            // this.serverLog = response.data.replace(/\\n/g, "\n");
            // let file = this.serverLog.replace(/\\/g, "");
            // this.file = file.replace(/u001b\[.*?m/g, "");
            // this.file = this.file.replace(/\[.*?m/g, "");
            this.file = buffer;
            this.isVisible = true;
          } else {
            this.fileloading = false;
            this.isVisible = false;
          }
        },
        (err) => {
          this.isVisible = false;
          this.fileloading = false;
          this.messageService.error("File not found!");
        }
      );
  }
  viewConsole(data) {
    this.fileloading = true;
    const matchsolution = _.find(this.ecl2ServerList, function (item: any) {
      if (item.deploymentid === data.deploymentid) {
        return item;
      }
    });
    const formdata = {
      tenantid: this.userstoragedata.tenantid,
      region: data.zonename.split("-")[0],
      consoleid: data.ecl2serverid,
      ecl2tenantid: matchsolution.client.ecl2tenantid,
      ctype: "SERVER",
    };
    this.ecl2Service.vncConsole(formdata).subscribe((result) => {
      this.fileloading = false;
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        window.open(response.data.console.url, "_blank");
      } else {
        this.messageService.error(response.message);
      }
    });
  }

  retryvsrx(data) {
    let formdata = {} as any;
    const matchsolution = _.find(this.ecl2ServerList, function (item: any) {
      if (item.deploymentid === data.deploymentid) {
        return item;
      }
    });
    formdata = {
      serveraddresses: data.serveraddresses,
      ecl2deploymentid: data.ecl2deploymentid,
      ecl2serverid: data.ecl2serverid,
      deploymentid: data.deploymentid,
      solutionid: data.solutionid,
      ecl2solutionid: data.ecl2solutionid,
      region: matchsolution.client.ecl2region,
      tenantid: this.userstoragedata.tenantid,
      ecl2tenantid: matchsolution.client.ecl2tenantid,
      instancename: data.instancename,
    };
    let index = _.indexOf(this.deployList, data);
    this.deployList[index].vsrxstatus = true;
    this.ecl2Service.vsrxcall(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.deployList[index].vsrxstatus = false;
      if (response.status) {
        this.deployList[index].fwconflictstatus = AppConstant.STATUS.ACTIVE;
        this.messageService.success(response.message);
      } else {
        this.deployList[index].fwconflictstatus = AppConstant.STATUS.FAILED;
        this.messageService.error(response.message);
      }
      this.deployList = [...this.deployList];
    });
  }
  retryLb(data) {
    let formdata = {} as any;
    const matchsolution = _.find(this.ecl2ServerList, function (item: any) {
      if (item.deploymentid === data.deploymentid) {
        return item;
      }
    });
    formdata = {
      serveraddresses: data.serveraddresses,
      ecl2deploymentid: data.ecl2deploymentid,
      deploymentid: data.deploymentid,
      solutionid: data.solutionid,
      ecl2solutionid: data.ecl2solutionid,
      instancename: data.instancename,
      tenantid: this.userstoragedata.tenantid,
      ecl2networks: data.ecl2solution.networkid,
      virtualipaddress: data.virtualipaddress,
      ecl2serverid: data.ecl2serverid,
      region: matchsolution.client.ecl2region,
      ecl2tenantid: matchsolution.client.ecl2tenantid,
    };
    let index = _.indexOf(this.deployList, data);
    this.deployList[index].lbstatus = true;
    this.ecl2Service.lbcall(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.deployList[index].lbstatus = false;
      if (response.status) {
        this.deployList[index].lbconflictstatus = AppConstant.STATUS.ACTIVE;
        this.messageService.success(response.message);
      } else {
        this.deployList[index].lbconflictstatus = AppConstant.STATUS.FAILED;
        this.messageService.error(response.message);
      }
      this.deployList = [...this.deployList];
    });
  }

  download(){
    this.isdownload = true;
    this.getAllList();
  }
  onPageSizeChange(size:number){
    this.pageSize = size;
    this.getAllList();
    this.totalCount = this.deployList.length;
  }
}
