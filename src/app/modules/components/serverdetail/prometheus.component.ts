import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "../../services/shared/local-storage.service";
import { DomSanitizer } from "@angular/platform-browser";
import { ExptrService } from '../../../business/base/assets/exptr-mapping/exptr.service';
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-cloudmatiq-montioring-detail",
  styles: [],
  templateUrl: "./prometheus.component.html",
})
export class PrometheusComponent implements OnChanges {
  @Input() instanceRef: any;
  @Input() instanceObj: any;
  @Input() metricsPlatform = null as null | string;
  metrics: any = [];
  userstoragedata: any = {};
  exporterList: any = [];
  screens: any = [];
  appScreens: any = [];
  tabIndex = 0;
  runOrch: Boolean = false;
  installExporters: Boolean = false;
  isLoading: Boolean = false;
  showAlert: Boolean = false;
  selectedList: any = [];
  dsbrdData: any = [];
  availDashboards: any = [];
  metricsModel = {
    range: [
      new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
      new Date(),
    ],
    refresh: "10s"
  };
  confirmationWindow = false;
  validationmsg = "";
  exporterName: string = '';
  removeExporter;
  installExporter;
  constructor(
    private localStorageService: LocalStorageService,
    private exptrService: ExptrService,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
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
    if (_.includes(this.appScreens.actions, "Install Exporters")) {
      this.installExporters = true;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.instanceObj) &&
      !_.isEmpty(changes.instanceObj.currentValue)
    ) {
      this.fetchExporters();
    }
  }

  reloadMetricsData() {
    setTimeout(() => {
      const id = this.instanceRef["instanceref"] ? this.instanceRef["instanceref"] : this.instanceRef["instancerefid"];
      const from =
        this.metricsModel.range &&
          this.metricsModel.range.length > 0 &&
          this.metricsModel.range[0]
          ? new Date(this.metricsModel.range[0]).getTime()
          : "now-15m";
      const to =
        this.metricsModel.range &&
          this.metricsModel.range.length > 0 &&
          this.metricsModel.range[1]
          ? new Date(this.metricsModel.range[1]).getTime()
          : "now";
      this.dsbrdData = JSON.parse(JSON.stringify(this.metrics));
      this.dsbrdData.forEach(element => {
        let identifier = `var-job=${id}`;
        if (element.exptrtype == "custom_plugin") {
          identifier = `var-instance=${this.instanceObj.privateipv4}:${element.exptrport}`;
        }
        if (element.exprturl) {
          if (this.isJsonString(element.exprturl)) {
            let temp_url = JSON.parse(element.exprturl);
            element.exprturl = temp_url[this.metricsPlatform] ? temp_url[this.metricsPlatform] : null;
          }
          element.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${element.exprturl}?orgId=1&refresh=${this.metricsModel.refresh}&from=${from}&to=${to}&kiosk&${identifier}`);
        } else {
          alert(`Grafana URL not valid for ${element.exprtrname}`);
        }
      });
      console.log()
    }, 600);
  }

  async fetchExporters() {
    this.isLoading = true;
    let condition = {} as any;
    condition = {
      cloudprovider: this.instanceRef.cloudprovider,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    this.exptrService.listByFilters(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.data) {
        this.exporterList = response.data;
        this.isLoading = false;
        this.getDashboards();
      } else {
        this.isLoading = false;
      }
    });
  }
  tabChange(event) {
    this.tabIndex = event.index;
  }
  async getDashboards() {
    this.isLoading = true;
    this.metrics = [];
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      instancerefid: this.instanceRef["instanceref"] ? this.instanceRef["instanceref"] : this.instanceRef["instancerefid"],
      exptrstatus: 'Installed'
    };
    this.exptrService.listDashboards(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.data) {
        this.availDashboards = response.data;
        this.metrics = _.clone(this.exporterList);
        let tempMetrics = _.clone(this.exporterList);
        let temp_ids = [];
        response.data.forEach(element => {
          if (element.exprtorchid) {
            temp_ids.push(element.exprtorchid);
          }
        });
        tempMetrics.forEach((element, i) => {
          if (!temp_ids.includes(element.exprtorchid)) {
            let index = this.metrics.findIndex(x => x.exprtorchid === element.exprtorchid);
            this.metrics.splice(index, 1);
          }
        });
        // this.metrics = []
        this.selectedList = [...this.metrics];
        this.isLoading = false;
        this.reloadMetricsData();
      } else {
        this.isLoading = false;
      }
    });
  }

  addRemoveExporter(data) {
    this.exporterName = data.map(item => item.exprtrname).join(', ');
    if (this.metrics.length > 0) {
      this.removeExporter = this.metrics.find(item => !data.includes(item))      
    }
    if(this.selectedList.length < data.length) {
      this.validationmsg = `Are you sure you want to install the ${this.exporterName}?`;
    }else if (this.selectedList.length > data.length){
      this.validationmsg = `Are you sure you want to remove the ${this.removeExporter.exprtrname}?`;
    }
    this.confirmationWindow = true;
    this.installExporter = (confirmed: boolean) => {
      if (confirmed) {
        this.runOrch = true;
        let differceList;
        let saveData: any = {
          instancerefid: this.instanceRef["instanceref"]
            ? this.instanceRef["instanceref"]
            : this.instanceRef["instancerefid"],
          exptrstatus: "Pending",
          status: AppConstant.STATUS.ACTIVE,
          createdby: this.userstoragedata.fullname,
          lastupdatedby: this.userstoragedata.fullname,
          createddt: new Date(),
          lastupdateddt: new Date(),
        };
        let isAddExptr = true;

        if (this.selectedList.length > data.length) {
          isAddExptr = false;
          differceList = _.difference(this.selectedList, data);
          saveData.exptrstatus = "Removed";
          saveData.status = AppConstant.STATUS.DELETED;
        } else if (this.selectedList.length < data.length) {
          differceList = _.difference(data, this.selectedList);
        }
        saveData["exprtorchid"] = differceList[0].exprtorchid;
        saveData["tenantid"] = differceList[0].tenantid;
        if (isAddExptr) {
          this.message.success("Installing exporter. Please wait...");
          this.exptrService.createMapping(saveData).subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.data) {
              this.runOrch = false;
              // this.message.success("Exporter successfully installed.");
              this.getDashboards();
            }
          });
        } else {
          this.message.success("Removing exporter. Please wait...");
          let updateData = this.availDashboards.find((el) => {
            return el.exprtorchid == saveData.exprtorchid;
          });
          if (updateData) saveData.exptrid = updateData.exptrid;
          this.exptrService.updateMapping(saveData).subscribe((res) => {
            const response = JSON.parse(res._body);
            // this.message.success("Exporter successfully removed");
            if (response.data) {
              this.runOrch = false;
              this.getDashboards();
            }
          });
        }
        this.selectedList = data;
        this.confirmationWindow = false;
      }
    };
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
