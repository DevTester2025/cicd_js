import { Component, OnInit } from "@angular/core";
import { TenantsService } from "../../tenants/tenants.service";
import { AppConstant } from "../../../app.constant";
import { Router } from "@angular/router";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-tenant",
  templateUrl: "../../../presentation/web/admin/tenant/tenant.component.html",
})
export class TenantComponent implements OnInit {
  tenantList = [];
  totalCount = null;
  isVisible = false;
  formTitle = "Add Tenant";
  buttonText = "Add";
  tenantObj: any = {};
  userstoragedata: any = {};
  screens = [];
  appScreens: any = {};
  visibleadd = false;
  isdownload = false;
  tenantListHeaders = [
    { field: "tenantname", header: "Name", datatype: "string", isdefault: true },
    { field: "contactemail", header: "Email ID", datatype: "string", isdefault: true },
    { field: "pphoneno", header: "Phone No", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string",  isdefault: true },
  ];
  tenantTableConfig = {
    refresh: true,
    edit: false,
    delete: false,
    manualsearch: true,
    globalsearch: true,
    manualpagination: true,
    columnselection: true,
    // loading: false,
    apisort: true,
    pageSize: 10,
    count: null,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"],
    tabledownload: false
  };
  limit = 10;
  offset = 0;
  searchText = null;
  selectedcolumns = [] as any;
  order = ["lastupdateddt", "desc"];
  constructor(
    private tenantsService: TenantsService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.TENANTS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tenantTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tenantTableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tenantTableConfig.tabledownload = true;
    }
    const isdefault = true;
    this.selectedcolumns = this.tenantListHeaders.filter((el) => el.isdefault === isdefault);
    if (this.tenantListHeaders && this.tenantListHeaders.length > 0) {
      this.selectedcolumns = this.tenantListHeaders
    }

  }

  ngOnInit() {
    this.getTenantList();
  }
  getTenantList(limit?, offset?) {
    let condition: any = { status: AppConstant.STATUS.ACTIVE};
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
        if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    } else {
      query = `count=true&limit=${limit || 10}&offset=${offset || 0}&order=${this.order || ""}`;
    }
    this.tenantsService
      .all(condition,query)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          if (this.isdownload) {
            // this.loading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Tenant.xlsx"
            );
            this.isdownload = false;
          }
          else {
          this.tenantTableConfig.manualpagination = true;
          this.tenantList = response.data;
          this.totalCount = response.data.count;
          this.tenantTableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
          this.tenantList = response.data.rows;
        }
        } else {
          this.tenantList = [];
        }
      });
  }
  onChanged(val) {
    this.isVisible = val;
  }

  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.router.navigate(["tenant/edit", result.data.tenantid]);
    } else if (result.delete) {
      this.deleteRecord(result.data);
    }
    else if (result.download) {
      this.isdownload = true;
      this.getTenantList();
    }
    if (result.pagination) {
      this.tenantTableConfig.pageSize = result.pagination.limit;
      this.getTenantList(result.pagination.limit, result.pagination.offset);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getTenantList(this.tenantTableConfig.pageSize, 0);
      }
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getTenantList(this.tenantTableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      this.getTenantList(this.tenantTableConfig.pageSize, 0);
    }
    if (result.refresh) {
      this.getTenantList();
    }
  }
  deleteRecord(data) {
    const formdata = {
      tenantid: data.tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    const formData = new FormData();
    formData.append("formData", JSON.stringify(formdata));
    this.tenantsService.update(formData).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.message.success(
              "#" + response.data.tenantid + " Deleted Successfully"
            )
          : this.message.success(response.message);
        this.getTenantList();
      } else {
        this.message.error(response.message);
      }
    });
  }
}
