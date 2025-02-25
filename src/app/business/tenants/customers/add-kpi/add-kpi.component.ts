import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { KPIReportingService } from "../../kpireporting/kpireporting.service";
import * as moment from "moment";

@Component({
  selector: "app-add-kpi",
  templateUrl:
    "../../../../presentation/web/tenant/customers/add-kpi/add-kpi.component.html",
  styles: [
    `
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
export class AddKpiComponent implements OnInit {
  @Input() customerid;
  _reportingid;
  publishyn = false;
  add = false;
  kpireportList: any = [];
  tableHeader = [
    {
      field: "title",
      header: "Report Name",
      datatype: "string",
    },
    {
      field: "startdt",
      header: "Start Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "enddt",
      header: "End Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "publishyn",
      header: "Customer Dashboard?",
      datatype: "string",
    },
    {
      field: "status",
      header: "Status",
      datatype: "string",
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
  userstoragedata: any;
  customerkpireports = [
    {
      id: null,
      title: "",
      startdt: new Date(),
      enddt: new Date(),
      publishyn: false,
    },
  ];
  loading = false;
  constructor(
    private kpiReportingService: KPIReportingService,
    private msgService: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.customerid && changes.customerid.currentValue) {
      this.customerid = changes.customerid.currentValue;
      this.getKPIreporting();
    }
  }

  getCustomerKPI() {
    this.loading = true;
    this.kpiReportingService
      .customerkpiall({
        tenantid: this.userstoragedata.tenantid,
        _customerid: this.customerid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          let self = this;
          this.customerkpireports = _.map(response.data, function (itm) {
            itm.publishyn = itm.publishyn == "Y" ? true : false;
            itm.title = _.find(self.kpireportList, { id: itm._reportid });
            itm.startdt = new Date(itm.startdt);
            itm.enddt = new Date(itm.enddt);
            return itm;
          });
        } else {
          this.customerkpireports = [];
        }
        this.loading = false;
      });
  }

  dataChanged(e) {}

  getKPIreporting() {
    this.loading = true;
    this.kpiReportingService
      .all({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.kpireportList = response.data;
          this.getCustomerKPI();
        } else {
          this.kpireportList = [];
        }
        this.loading = false;
      });
  }

  addRow() {
    this.customerkpireports.push({
      id: null,
      title: "",
      startdt: new Date(),
      enddt: new Date(),
      publishyn: false,
    });
  }

  deleteRow(i) {
    if (this.customerkpireports[i] && this.customerkpireports[i].id != null) {
      this.kpiReportingService
        .customerkpiupdate({
          id: this.customerkpireports[i].id,
          status: AppConstant.STATUS.DELETED,
          lastupdateddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.customerkpireports.splice(i, 1);
            this.customerkpireports = [...this.customerkpireports];
            this.msgService.success("Deleted Successfully");
          } else {
            this.msgService.error(response.message);
          }
        });
    } else {
      this.customerkpireports.splice(i, 1);
      this.customerkpireports = [...this.customerkpireports];
    }
  }

  onSelectReport(event, i) {
    console.log(event);
    // this.customerkpireports[i].startdt = event.startdt;
    // this.customerkpireports[i].enddt = event.enddt;
  }

  saveOrUpdate() {
    console.log(this.customerkpireports);
    let kpireports = this.customerkpireports.map((el: any) => {
      let obj: any = {};
      obj["tenantid"] = this.userstoragedata.tenantid;
      obj["_customerid"] = this.customerid;
      obj["_reportid"] = el.title.id;
      obj["publishyn"] = el.publishyn == true ? "Y" : "N";
      obj["startdt"] = moment(el.startdt).format("YYYY-MM-DD");
      obj["enddt"] = moment(el.enddt).format("YYYY-MM-DD");
      obj["status"] = AppConstant.STATUS.ACTIVE;
      obj["createddt"] = new Date();
      obj["createdby"] = this.userstoragedata.fullname;
      obj["lastupdatedby"] = this.userstoragedata.fullname;
      obj["lastupdateddt"] = new Date();
      if (el.id != null) obj["id"] = el.id;
      return obj;
    });
    this.kpiReportingService
      .customerkpibulkupdate({ kpireports: kpireports })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.msgService.success(response.message);
          this.getCustomerKPI();
        } else {
          this.msgService.error(response.message);
        }
      });
  }
}
