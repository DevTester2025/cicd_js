import { Component, OnInit } from "@angular/core";
import { RoleService } from "./role.service";
import { AppConstant } from "../../../app.constant";
import { FormBuilder } from "@angular/forms";
import { CommonService } from "../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router } from "@angular/router";
import * as _ from "lodash";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-role",
  templateUrl: "../../../presentation/web/admin/role/role.component.html",
})
export class RoleComponent implements OnInit {
  loading = true;
  roleListHeaders = [
    { field: "rolename", header: "Role Name", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];
  roleTableConfig = {
    refresh: true,
    edit: false,//#OP_T620
    delete: false,//#OP_T620
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    columnselection: true,
    manualpagination: true,
    apisort: true,
    tabledownload: false,
    pageSize: 10,
    count: null,
    loading: false,
    clone: false,//#OP_T620
    view: false,//#OP_T620

    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"],
  };
  widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"];
  roleList = [];
  isdownload = false;
  originalList = [];
  buttonText = "";
  button = "";
  formdata: any = {};
  userstoragedata: any;
  formTitle = "";
  roleObj: any = {};
  appScreens = {} as any;
  screens = [];
  visibleadd = false;
  rolename: any;
  tableData: any[];
  originalData: any[];
  selectedcolumns = [] as any;
  pageSize: any;
  pageIndex: number;
  currentSortColumn: any;
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];

  constructor(
    private roleService: RoleService,
    private router: Router,
    private fb: FormBuilder,
    private commonService: CommonService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.buttonText = "Add";
    this.formTitle = AppConstant.VALIDATIONS.USER.ROLES.ADD;
    this.button = AppConstant.VALIDATIONS.SAVE;
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.rolename = this.userstoragedata.roles.rolename;
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );

    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ACCESS_MANAGEMENT,
    });

    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    //#OP_T620
    if (_.includes(this.appScreens.actions, "View")) {
      this.roleTableConfig.view = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.roleTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.roleTableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Copy")) {
      this.roleTableConfig.clone = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.roleTableConfig.tabledownload = true;
    }
    const isdefault = true;
    this.selectedcolumns = this.roleListHeaders.filter((el) => el.isdefault === isdefault);
    
    if (this.roleListHeaders && this.roleListHeaders.length > 0) {
      this.selectedcolumns = this.roleListHeaders
    }
  }

  ngOnInit() {
    this.getAllRoles();
  }
  getAllRoles(limit?, offset?) {
    this.loading = true;
    let condition: { [key: string]: any } = {
      status: AppConstant.STATUS.ACTIVE,
    };
    let tenantList = [];
    if (
      this.userstoragedata.roles.rolename !=
      AppConstant.VALIDATIONS.USER.ROLES.ADMIN
    ) {
      tenantList = [this.userstoragedata.tenantid, 0];
    } else {
      tenantList = [this.userstoragedata.tenantid, -1, 0];
    }
    condition.tenantList = tenantList;
    if (this.searchText != null && this.searchText != "") {
      condition["searchText"] = this.searchText;
    }
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    }
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    } else {
      query = `count=true&limit=${limit || 10}&offset=${offset || 0}&order=${this.order || ""}`;
    }

    this.roleService.allRoles(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.loading = false;
          this.isdownload = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(buffer, "Roles.xlsx");
        } else {
          this.roleTableConfig.manualpagination = true;
          this.roleList = response.data.rows;
          this.originalList = response.data;
          this.totalCount = response.data.count;
          this.roleTableConfig.count =
            "Total Records" + ":" + " " + this.totalCount;
          this.loading = false;
        }
      } else {
        this.roleList = [];
        this.totalCount = 0;
        this.loading = false;
      }
    });
  }
  dataChanged(result) {
    if (result.pagination) {
      this.roleTableConfig.pageSize = result.pagination.limit;
      this.getAllRoles(result.pagination.limit, result.pagination.offset);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getAllRoles(this.roleTableConfig.pageSize, 0);
      }
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getAllRoles(this.roleTableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      this.getAllRoles(this.roleTableConfig.pageSize, 0);
    }
    if (result.refresh) {
      this.getAllRoles();
    }
    //#OP_T620
    if (result.edit) {
      this.router.navigate(["role/edit/" + result.data.roleid]);
    }
    if (result.clone) {
      this.router.navigate(["role/copy"], {
        queryParams: { id: result.data.roleid, mode: "Copy" },
      });
    }
    if (result.view) {
      this.router.navigate(["role/view"], {
        queryParams: { id: result.data.roleid, mode: "View" },
      });
    }
    if (result.delete) {
      this.deleteRecord(result.data.roleid);
    }
    if (result.download) {
      this.isdownload = true;
      this.getAllRoles(this.roleTableConfig.pageSize, 0);
    }
  }
  deleteRecord(data) {
    const formdata = {
      roleid: data,
      status: "Deleted",
      tenantid: this.userstoragedata.tenantid,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.roleService.updateRole(formdata).subscribe((result) => {

      let response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.message.success(
              "#" + response.data.roleid + " Deleted Successfully"
            )
          : this.message.success(response.message);
        this.getAllRoles();
      } else {
        this.message.error(response.message);
      }
    });
  }
}
