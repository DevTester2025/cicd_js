import { Component, OnInit, SimpleChanges, Input } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { KPITicketsService } from "../kpitickets.service";

@Component({
  selector: "app-cloudmatiq-kpi-ticketslist",
  templateUrl:
    "../../../../../presentation/web/tenant/servicemgmt/kpisetup/tickets/tickets-list.component.html",
})
export class KpiTicketListComponent implements OnInit {
  screens = [];
  appScreens = {} as any;
  loading = false;
  userstoragedata = {} as any;
  tableHeader = [
    { field: "customername", header: "Customer", datatype: "string" },
    { field: "tagname", header: "Tag", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
    { field: "sla", header: "SLA", datatype: "string" },
    { field: "priority", header: "Priority", datatype: "string" },
    { field: "response", header: "response", datatype: "string" },
    { field: "resolution", header: "resolution", datatype: "string" },
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px", "25px"],
  } as any;
  isVisibleAddEdit = false;
  title = "Tickets KPI";
  buttonText = "Save";
  selectedObj = {};
  ticketList = [];
  create = false;
  constructor(
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private ticketsService: KPITicketsService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SLA_MGMT,
    } as any);
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "Edit")) {
        this.tableConfig.edit = true;
      }
      if (_.includes(this.appScreens.actions, "Delete")) {
        this.tableConfig.delete = true;
      }
      if (_.includes(this.appScreens.actions, "Create")) {
        this.create = true;
      }
    }
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.getAllList();
  }
  showAddForm() {
    this.isVisibleAddEdit = true;
    this.buttonText = "Save";
  }
  dataChanged(event) {
    if (event.delete) {
      let reqObj = {
        id: event["data"]["id"],
        status: "Deleted",
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      };
      this.ticketsService.update(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
        } else {
          this.message.error("Failed to delete the record, try again later");
        }
      });
    } else if (event.edit) {
      this.selectedObj = event.data;
      this.isVisibleAddEdit = true;
      this.buttonText = "Update";
    }
  }
  closeDrawer() {
    this.isVisibleAddEdit = false;
    this.selectedObj = {};
  }
  getAllList() {
    let condition = {} as any;
    condition = {
      tenantid: this.userstoragedata.tenantid,
    };
    let query = "?include=" + JSON.stringify(["customer", "tag", "sla"]);
    this.ticketsService.all(condition, query).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.ticketList = _.map(response.data, (itm) => {
          itm.customername = itm.customer ? itm.customer.customername : "All";
          itm.tagname = itm.tag ? itm.tag.tagname : "-";
          itm.sla = itm.sla ? itm.sla.slaname : "-";
          return itm;
        });
      } else {
        this.ticketList = [];
      }
    });
  }
  notifyTicketsEntry(event) {
    this.closeDrawer();
    this.getAllList();
  }
}
