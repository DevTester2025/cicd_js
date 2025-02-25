import { Component, OnInit } from "@angular/core";
import { RoleService } from "../role.service";
import { AppConstant } from "../../../../app.constant";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
@Component({
  selector: "app-view-role",
  templateUrl:
    "../../../../presentation/web/admin/role/view-role/view-role.component.html",
})
export class ViewRoleComponent implements OnInit {
  roleid: any;
  roleObj: any = {};
  screenList: any = [];
  roleForm: FormGroup;
  formdata: any = {};
  roleaccess: any = {};
  actions = [];
  newvalue = [];
  allscreens = [];
  count: any;
  roleErrObj = {
    rolename: AppConstant.VALIDATIONS.USER.ROLENAME,
  };
  userstoragedata: any;
  widthConfig = ["100px", "100px", "100px"];
  constructor(
    private roleService: RoleService,
    private fb: FormBuilder,
    public router: Router,
    private routes: ActivatedRoute,
    private commonService: CommonService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.roleid = params.id;
        this.getRoleDetails(this.roleid);
      }
    });
    this.roleForm = this.fb.group({
      rolename: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(45),
        ]),
      ],
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}
  getRoleDetails(id) {
    this.roleService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.roleObj = response.data;
        this.screenList = _.map(this.roleObj.roleaccess, function (obj: any) {
          return obj.screenactions;
        });
        this.allscreens = _(this.screenList)
          .groupBy("screenid")
          .map(function (items: any, screenid) {
            return {
              screenid: screenid,
              count: items.length,
              actions: _.map(items, function (obj) {
                return obj.actions;
              }),
              screenname: _.uniqBy(items, "screenname"),
            };
          })
          .value();
      }
    });
  }
  create(data) {
    let errorMessage: any;
    if (this.roleForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.roleForm,
        this.roleErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    this.formdata = {
      tenantid: this.userstoragedata.tenantid,
      rolename: data.rolename,
      permissions: "",
      status: this.roleObj.status,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    let arr = [];
    arr = this.roleObj.roleaccess;
    this.roleaccess = arr.map((obj: any) => {
      obj.accessid = "";
      obj.screenactions = "";
      obj.roleid = "";
      obj.screenid = obj.screenid;
      obj.actionid = obj.actionid;
      obj.status = obj.status;
      obj.createdby = this.userstoragedata.fullname;
      obj.createddt = new Date();
      obj.lastupdatedby = this.userstoragedata.fullname;
      obj.lastupdateddt = new Date();
      return obj;
    });
    this.formdata.roleaccess = this.roleaccess;
    this.roleService.createRole(this.formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.data) {
        this.roleForm.reset();
        this.message.success(response.message);
      }
    });
  }
}
