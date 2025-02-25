import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../app.constant";
import { Ecl2Service } from "../ecl2-service";
import { NzMessageService } from "ng-zorro-antd";
import { DeploymentsService } from "../../deployments.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";

@Component({
  selector: "app-firewall",
  templateUrl:
    "../../../../presentation/web/deployments/ecl2/firewall/firewall.component.html",
})
export class FirewallComponent implements OnInit {
  userstoragedata: any;
  tableData: any = {};
  loading = false;
  isVisible = false;
  formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDVSRX;
  buttonText = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDVSRX;
  visibleadd = true;
  provider: any;
  type: any = "VSRX";
  firewall = false;
  vsrx = false;
  typeselect = false;
  screens = [];
  appScreens = {} as any;
  firewallList: any[] = [];
  firewallObj: any = {};
  vsrxObj: any = {};
  modalWidth = 320;
  modalname: any;
  providerList: any = [];
  vsrxList: any = [];
  tableHeader = [] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private message: NzMessageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private deploymentsService: DeploymentsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.FIREWALL,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    this.tableHeader = this.deploymentsService.getVSRXHeader();
  }

  ngOnInit() {
    this.getProviderList();
  }

  getProviderList() {
    this.loading = true;
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
          this.typeselect = true;
          this.vsrx = true;
          this.type = "VSRX";
          this.getVSRXList();
        } else {
          this.providerList = [];
        }
      });
  }
  onChangeType(event) {
    if (event === "Firewall") {
      this.firewall = true;
      this.vsrx = false;
      this.buttonText = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDFW;
      this.firewallList = [];
      this.tableHeader = this.deploymentsService.getFWHeader();
      this.getFirewallList();
      this.tableConfig.virtual = false;
    } else if (event === "VSRX") {
      this.buttonText = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDVSRX;
      this.vsrx = true;
      this.firewall = false;
      this.firewallList = [];
      this.tableHeader = this.deploymentsService.getVSRXHeader();
      this.tableConfig.virtual = true;
      this.firewallList = [...this.vsrxList];
    }
  }
  onChangeProvider(event) {
    if (event === AppConstant.CLOUDPROVIDER.ECL2) {
      this.typeselect = true;
      this.type = "VSRX";
      this.firewall = false;
      this.vsrx = true;
      this.buttonText = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDVSRX;
      this.tableHeader = this.deploymentsService.getVSRXHeader();
      this.getVSRXList();
    } else {
      this.firewallList = [];
      this.tableHeader = this.deploymentsService.getFWHeader();
      this.typeselect = false;
      this.firewall = false;
      this.vsrx = false;
    }
  }

  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(event) {
    if (event.edit) {
      this.firewallObj = {};
      this.modalname = event.data.vsrxid ? "VSRX" : "Firewall";
      if (!_.isUndefined(event.data.vsrxid)) {
        this.modalWidth = 820;
        this.isVisible = true;
        this.modalname = "VSRX";
        this.vsrxObj = event.data;
        this.formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.UPDATEVSRX;
      } else {
        this.modalWidth = 820;
        this.firewallObj = event.data;
        this.modalname = "Firewall";
        this.isVisible = true;
        this.formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.UPDATEFW;
      }
    } else if (event.delete) {
      if (!_.isUndefined(event.data.vsrxid)) {
        this.deleteECLRecord(event.data);
      } else {
        this.deleteRecord(event.data);
      }
    } else if (event.virtual) {
      if (!_.isUndefined(event.data.vsrxid)) {
        this.loading = true;
        const formdata = {
          tenantid: this.userstoragedata.tenantid,
          region: event.data.ecl2zones.region,
          consoleid: event.data.ecl2vsrxid,
          ctype: "VSRX",
          ecl2tenantid: event.data.customer.ecl2tenantid,
        };
        this.ecl2Service.vncConsole(formdata).subscribe((result) => {
          this.loading = false;
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            window.open(response.data.console.url, "_blank");
          } else {
            this.notificationService.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
        });
      }
    }
  }
  deleteECLRecord(data) {
    const formdata = {
      vsrxid: data.vsrxid,
      ecl2vsrxid: data.ecl2vsrxid,
      tenantid: this.userstoragedata.tenantid,
      region: data.ecl2zones.region,
      ecl2tenantid: data.customer.ecl2tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service.deleteecl2vsrx(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.vsrxid + " Deleted Successfully"
        );
        this.vsrxList.splice(this.vsrxList.indexOf(data), 1);
        this.firewallList = [...this.vsrxList];
      } else {
        this.notificationService.error("Error", response.message, {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }
  deleteRecord(data) {
    const formdata = {
      firewallid: data.firewallid,
      ecl2firewallid: data.ecl2firewallid,
      tenantid: this.userstoragedata.tenantid,
      region: data.ecl2zones.region,
      ecl2tenantid: data.customer.ecl2tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service.deleteecl2firewall(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.firewallid + " Deleted Successfully"
        );
        this.firewallList.splice(this.firewallList.indexOf(data), 1);
        this.firewallList = [...this.firewallList];
      } else {
        this.notificationService.error("Error", response.message, {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }
  getFirewallList() {
    this.loading = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2firewall(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.firewallList = response.data;
      } else {
        this.loading = false;
        this.firewallList = [];
      }
    });
  }
  getVSRXList() {
    this.loading = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2vsrx(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.vsrxList = response.data;
        this.firewallList = [...this.vsrxList];
      } else {
        this.loading = false;
        this.vsrxList = [];
        this.firewallList = [];
      }
    });
  }
  showModal(event) {
    this.modalname = event;
    if (event === "Firewall") {
      this.firewallObj = {};
      this.modalWidth = 320;
      this.isVisible = true;
      this.formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDFW;
    } else if (event === "VSRX") {
      this.vsrxObj = {};
      this.modalWidth = 820;
      this.isVisible = true;
      this.formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDVSRX;
    }
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    if (!_.isUndefined(event.vsrxid)) {
      this.formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDVSRX;
      let existData = {} as any;
      existData = _.find(this.vsrxList, { vsrxid: event.vsrxid });
      if (existData === undefined) {
        this.firewallList = [event, ...this.vsrxList];
      } else {
        const index = _.indexOf(this.vsrxList, existData);
        this.vsrxList[index] = event;
        this.firewallList = [...this.vsrxList];
      }
    } else if (!_.isUndefined(event.firewallid)) {
      this.formTitle = AppConstant.VALIDATIONS.ECL2.FIREWALL.ADDFW;
      let existData = {} as any;
      existData = _.find(this.firewallList, { firewallid: event.firewallid });
      if (existData === undefined) {
        this.firewallList = [event, ...this.firewallList];
      } else {
        const index = _.indexOf(this.firewallList, existData);
        this.firewallList[index] = event;
        this.firewallList = [...this.firewallList];
      }
    }
  }
}
