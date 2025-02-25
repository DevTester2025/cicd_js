import { Component, OnInit } from "@angular/core";
import { UsersService } from "../users/users.service";
import { AppConstant } from "../../../app.constant";
import { FormBuilder } from "@angular/forms";
import { CommonService } from "../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { Router } from "@angular/router";
import * as _ from "lodash";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-users",
  templateUrl: "../../../presentation/web/admin/users/users.component.html",
})
export class UsersComponent implements OnInit {
  loading = false;
  userObj: any = {};
  userListHeaders = [
    { field: "tenant.tenantname", header: "Tenant Name", datatype: "string", isdefault: true },
    { field: "fullname", header: "User Name", datatype: "string", isdefault: true },
    { field: "email", header: "Email ID", datatype: "string", isdefault: true },
    { field: "secondaryphoneno", header: "Mobile No", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    { field: "roles.rolename", header: "Role Name", datatype: "string", isfilter: true, isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];

  userTableConfig = {
    refresh: true,
    edit: false,
    delete: false,
    manualsearch: true,
    globalsearch: true,
    pagination: false,
    manualpagination: true,
    loading: false,
    apisort: true,
    columnselection: true,
    pageSize: 10,
    count: null,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px", "25px"],
    tabledownload: false
  };
  visibleadd = false;
  usersList: any = [];
  isVisible = false;
  isSuperAdmin = false;
  formTitle = "";
  buttonText = "";

  rightbar = true;
  isVisibleTop = false;
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt", "desc"];
  button: any;
  userstoragedata: any = {};
  screens = [];
  createFlag = false;
  appScreens = {} as any;
  selectedcolumns = [] as any;
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  filterSearchModel = "";  //#OP_B770
  isdownload = false;

  constructor(
    private userService: UsersService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {
    this.formTitle = AppConstant.VALIDATIONS.USER.ADD;
    this.buttonText = AppConstant.VALIDATIONS.USER.ADD;
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.MANAGE_USERS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.userTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.userTableConfig.delete = true;
    }   
     if (_.includes(this.appScreens.actions, "Download")) {
      this.userTableConfig.tabledownload = true;
    }
    this.isSuperAdmin = this.userstoragedata.roles.rolename === AppConstant.VALIDATIONS.USER.ROLES.ADMIN;
    if (!this.isSuperAdmin) {
      this.userListHeaders = this.userListHeaders.slice(1);
    }    
    const isdefault = true;
    this.selectedcolumns = this.userListHeaders.filter((el) => el.isdefault === isdefault);
  }

  ngOnInit() {
    this.getUserList();
    if (this.userListHeaders && this.userListHeaders.length > 0) {
      this.selectedcolumns = this.userListHeaders
    }
  }

  rightbarChanged(val) {
    this.isVisible = val;
    this.getUserList();
  }
  showModal(): void {
    this.userObj = {};
    this.formTitle = AppConstant.VALIDATIONS.USER.ADD;
    this.buttonText = AppConstant.VALIDATIONS.USER.ADD;
    this.isVisible = true;
  }
  //  #OP_B770
  getFilterValue(event) {
    let f = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.filterSearchModel !== "") {
      f["rolename"] = this.filterSearchModel;
    }
    if (event) {
      f["searchText"] = event;
    }
    f["headers"] = [{ field: this.filterKey }];
    this.userService
      .allUserRoles(f)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.filterableValues = response.data;
          this.filterableValues.filter((el) => {
            return el.rolename.includes(event);
          });
        } else {
          this.filterableValues = [];
        }
      });
    this.filterSearchModel = '';
  }
  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getUserList();
  }
  dataChanged(result) {
    if (result.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = result.data.field;
      if (result.data.field == 'roles.rolename') {

        this.filterKey = 'rolename';
        const tenantList = [this.userstoragedata.tenantid, 0];
        this.userService
          .allUserRoles({ status: AppConstant.STATUS.ACTIVE, tenantList })
          .subscribe((data) => {
            const response = JSON.parse(data._body);
            if (response.status) {
              this.filterableValues = response.data;
            } else {
              this.filterableValues = [];
            }
          });
      }
      else {
        this.getFilterValue(null);
      }
    }
    if (result.edit) {
      this.isVisible = true;
      this.userObj = result.data;
      this.button = AppConstant.VALIDATIONS.UPDATE;
      this.formTitle = AppConstant.VALIDATIONS.USER.EDIT;
    } else if (result.delete) {
      this.deleteRecord(result.data);
    }
    if (result.pagination) {
      this.userTableConfig.pageSize = result.pagination.limit;
      this.getUserList(result.pagination.limit, result.pagination.offset);
    }
    if (result.download) {
      this.isdownload = true;
      this.getUserList(this.userTableConfig.pageSize, 0);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getUserList(this.userTableConfig.pageSize, 0);
      }
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getUserList(this.userTableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      this.getUserList(this.userTableConfig.pageSize, 0);
    }
    if (result.refresh) {
      this.filteredValues["rolename"] = [];
      this.getUserList();
    }
  }
  deleteRecord(data) {
    const formdata = {
      userid: data.userid,
      tenantid: data.tenantid,
      status: AppConstant.STATUS.DELETED,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    this.userService.updateUser(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.userid + " Deleted Successfully"
        );
        this.getUserList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  getUserList(limit?, offset?) {
    this.userTableConfig.loading = true;
    let condition: any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    if (this.filteredValues["rolename"] && this.filteredValues["rolename"].length > 0) {
      condition["roleids"] = this.filteredValues["rolename"];
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
    }
    else{
      query = `count=${true}&limit=${limit || 10}&offset=${offset || 0}&order=${this.order || ""}`;
    }
    this.userService.allUsers(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.userTableConfig.loading = false;
          this.isdownload = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            `Users.xlsx`
          );
          this.isdownload = false;
        }
        else{
        this.userTableConfig.manualpagination = true;
        this.totalCount = response.data.count;
        this.userTableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
        this.usersList = response.data.rows;
        this.userTableConfig.loading = false;
        }
      } else {
        this.totalCount = 0;
        this.usersList = [];
        this.userTableConfig.loading = false;
      }
    });
  }

  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = AppConstant.VALIDATIONS.USER.EDIT;
    this.getUserList();
  }
}
