import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { SrmService } from "src/app/business/srm/srm.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as moment from "moment";

@Component({
  selector: "app-maintwindow-mapping",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/maintenance-window/maintwindow-mapping/maintwindow-mapping.component.html",
})
export class MaintwindowMappingComponent implements OnInit {
  @Input() txnDetails: any = {};
  maintwindowMapList = [];
  totalCount = null;
  tableHeader = [
    {
      field: "windowname",
      header: "Maintenance Window Name",
      datatype: "string",
    },
    {
      field: "startdate",
      header: "Start Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "enddate",
      header: "End Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "status",
      header: "Status",
      datatype: "string"
    },
  ];
  tableConfig = {
    edit: false,
    view: true,
    delete: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
  };
  loading = false;
  addmaintwindowmap = false;
  maintwindowid = null;
  maintwindowList = [];
  selectedWindowObj = {};
  metaData = {};
  userstoragedata: any;
  viewMaintwindow = false;
  windowObj = {};
  constructor(
    private srmService: SrmService,
    private msgService: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.txnDetails && changes.txnDetails.currentValue) {
      this.maintwindowid = null;
      this.txnDetails = changes.txnDetails.currentValue;
      this.getAllMappings();
      this.getAllMaintWindow();
    }
  }

  getAllMaintWindow() {
    this.loading = true;
    this.srmService
      .allMaintwindows(
        {
          status: AppConstant.STATUS.ACTIVE,
        },
        `daterange=${true}`
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.maintwindowList = response.data;

        } else {
          this.maintwindowList = [];
        }
        this.loading = false;
      });
  }

  getAllMappings() {
    this.loading = true;
    this.srmService
      .allMaintwindowmapping({
        tenantid: this.userstoragedata.tenantid,
        txntype: this.txnDetails.txntype,
        status: AppConstant.STATUS.ACTIVE,
        txnid: this.txnDetails.txnid,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.maintwindowMapList = response.data.map((el) => {
            el.windowname = el.maintwindow ? el.maintwindow.windowname : "-";
            el.startdate = el.maintwindow ? el.maintwindow.startdate : "-";
            el.enddate = el.maintwindow ? el.maintwindow.enddate : "-";
            return el;
          });
          this.totalCount = this.maintwindowMapList.length;
        } else {
          this.maintwindowMapList = [];
          this.totalCount = this.maintwindowMapList.length;
        }
        this.loading = false;
      });
  }

  onMaintwindowSelect(event) {
    this.srmService.byIdMaintwindow(this.maintwindowid).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.selectedWindowObj = response.data;
        this.metaData["Maintenance Window Name"] = response.data.windowname;
        this.metaData["Provider"] = response.data.cloudprovider;
        this.metaData["Duration"] =
          moment(response.data.startdate).format("DD-MMM-YYYY") +
          " - " +
          moment(response.data.enddate).format("DD-MMM-YYYY");
      } else {
        this.selectedWindowObj = {};
      }
    });
  }

  save() {
    if (this.maintwindowid) {
      let obj = {
        maintwindowid: this.maintwindowid,
        tenantid: this.userstoragedata.tenantid,
        txnid: this.txnDetails.txnid,
        txntype: this.txnDetails.txntype,
        notes: "",
        status: AppConstant.STATUS.ACTIVE,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
      };

      this.srmService.addMaintwindowmapping(obj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.addmaintwindowmap = false;
          this.msgService.success(response.message);
          this.getAllMappings();
        } else {
          this.msgService.error(response.message);
        }
      });
    } else {
      this.msgService.error("Please select maintenance window");
    }
  }

  deleteRecord(data) {
    this.srmService
      .updateMaintwindowmapping({
        id: data.id,
        status: AppConstant.STATUS.DELETED,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.msgService.success(data.windowname + " Deleted successfully");
          this.getAllMappings();
        } else {
          this.msgService.success(response.message);
        }
      });
  }

  dataChanged(e) {
    if (e.delete) {
      this.deleteRecord(e.data);
    }
    if (e.view) {
      this.viewMaintwindow = true;
      this.windowObj = e.data.maintwindow;
    }
  }
}
