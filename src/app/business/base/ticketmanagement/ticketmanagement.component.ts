import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { AWSAppConstant } from "src/app/aws.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { IncidentService } from "../../tenants/customers/incidents.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-ticketmanagement",
  templateUrl:
    "../../../presentation/web/base/ticketmanagement/ticketmanagement.component.html",
})
export class TicketmanagementComponent implements OnInit {
  loading = false;
  visibleadd = false;
  tableHeader = AWSAppConstant.COLUMNS.TICKETMANAGEMENT;
  formTitle = "Add Tickets";
  incidentstartdt = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  incidentenddt = new Date();
  isdownload = false;
  tableconfig = {
    scroll: { x: "1700px" },
    manualsorting: false,
    sortbyList: [],
    apisort: true,
    refresh: true,
    columnselection: true,
    tabledownload: false,
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    loading: false,
    pageSize: 10,
    count: null,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };
  incidentList = [];
  buttonText = "Add";
  userstoragedata: any;
  screens = [];
  appScreens = {} as any;
  isVisible: boolean = false;
  selectedcolumns = [] as any;
  incidentObj: any = {};
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];
  constructor(
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private incidentService: IncidentService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SNOW_TICKETS,
    });
    console.log(this.appScreens);

    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableconfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableconfig.delete = true;
    }
    //#OP_T620
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableconfig.tabledownload = true;
    }
    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }

  ngOnInit() {
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    this.getAllList();
  }

  getAllList(limit?, offset?) {
    this.tableconfig.loading = true;
    let condition: any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.incidentstartdt && this.incidentenddt) {
      condition["startdate"] =
        moment(this.incidentstartdt).format("YYYY-MM-DD") + " 00:00:00";
      condition["enddate"] =
        moment(this.incidentenddt).format("YYYY-MM-DD") + " 23:59:59";
    }
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
      condition["headers"] = this.selectedcolumns.filter((el) => {
        return el.field;
      });
      if (this.order) {
        condition["order"] = this.order;
      } else {
        condition["order"] = ["lastupdateddt", "desc"];
      }
    }
    let query;
    if (this.isdownload === true) {
    query = `?isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    } else {
      query = `?customer=${true}&count=${true}&limit=${
        limit || this.tableconfig.pageSize
      }&offset=${offset || 0}&order=${this.order || ""}`;
  }
    this.incidentService.all(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableconfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "Ticket_Management.xlsx"
          );
          this.isdownload = false;
        }
        else{
        this.tableconfig.manualpagination = true;
        this.totalCount = response.data.count;
        this.tableconfig.count = "Total Records" + ":" + " " + this.totalCount;
        this.incidentList = response.data.rows.map(function (itm) {
          itm.customername = itm.customer ? itm.customer.customername : "";
          itm.dpublishyn = itm.publishyn == "Y" ? "Yes" : "No";
          return itm;
        });

        this.tableconfig.loading = false;
      }}
       else {
        this.incidentList = [];
        this.tableconfig.loading = false;
      }
    });
  }

  showModal(): void {
    this.incidentObj = {};
    this.formTitle = "Add Ticket";
    this.isVisible = true;
    this.buttonText = "Add";
  }

  rightbarChanged(event) {
    this.isVisible = false;
  }

  notifyNewEntry(event) {
    this.isVisible = false;
    this.getAllList();
  }

  dataChanged(event) {
    if (event.edit) {
      this.formTitle = "Edit Ticket";
      this.incidentObj = event.data;
      this.incidentObj.refid = this.incidentObj.id;
      this.incidentObj.reftype = AppConstant.REFERENCETYPE[19];
      this.isVisible = true;
    }
    if (event.delete) {
      this.deleteIncident(event.data);
    }
    if (event.pagination) {
      this.getAllList(event.pagination.limit, event.pagination.offset);
      this.tableconfig.pageSize = event.pagination.limit;
    }
    if (event.searchText) {
      this.searchText = event.searchText;
      if (event.search) {
        this.getAllList(this.tableconfig.pageSize, 0);
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
    if (event.order) {
      this.order = event.order;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
    if (event.refresh) {
      this.searchText = null;
      this.isdownload = false;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
    if (event.download) {
      this.isdownload = true;
      this.getAllList(this.tableconfig.pageSize, 0);
    }
  }

  deleteIncident(data) {
    this.loading = true;
    this.incidentService.delete(data.id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(data.incidentno + " Deleted Successfully");
        this.getAllList();
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }
}
