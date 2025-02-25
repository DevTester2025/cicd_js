import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { RoleService } from "../role.service";
import { AppConstant } from "../../../../app.constant";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
@Component({
  selector: "app-add-edit-role",
  templateUrl:
    "../../../../presentation/web/admin/role/add-edit-role/add-edit-role.component.html",
})
export class AddEditRoleComponent implements OnInit {
  @Input() roleObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  moduleList = [];
  buttonText = "";
  button = "";
  roleForm: FormGroup;
  tabIndex = 0 as number;
  isVisible = false;
  rightbar = true;
  edit = false;
  updateParam: any = {
    status: false,
    title: "",
  };
  updateParamValue: any;
  formdata: any = {};
  roleaccess: any = {};
  userstoragedata: any;
  formTitle = "";
  screenList: any = [];
  actions: any = [];
  show = false;
  roleActionObj: any = [];
  screenActions: any = [];
  widthConfig = ["20%", "5%", "35%", "30%", "10%"];
  prevvalue = [];
  currentVal = [];
  access: any = [];
  roleAccessList: any = {};
  index: any;
  roleid: any;
  screenPermissions = [];
  changesRoleAccess = [];
  loading = true;
  viewMode = false;
  actionsscreens = [];
  pageCount = AppConstant.pageCount;
  pageSize = 10;
  mode: any;
  screenid;
  originalData: any = [];
  searchText: string = "";
  roleErrObj = {
    rolename: AppConstant.VALIDATIONS.USER.ROLENAME,
    action: AppConstant.VALIDATIONS.USER.ROLES.ACTIONS,
    permissions: AppConstant.VALIDATIONS.USER.ROLES.PERMISSIONS,
  };
  constructor(
    private roleService: RoleService,
    private fb: FormBuilder,
    public router: Router,
    private routes: ActivatedRoute,
    private commonService: CommonService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.formTitle = AppConstant.VALIDATIONS.USER.ROLES.ADD;
    this.buttonText = AppConstant.VALIDATIONS.SAVE;
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.roleid = params.id;
        this.getRoleDetails(this.roleid);
      } else {
        this.getAllScreens();
      }
    });
    this.routes.queryParams.subscribe((params) => {
      if (params.id !== undefined && params.mode == "View") {
        this.roleid = params.id;
        this.viewMode = true;
        this.getRoleDetails(this.roleid);
      }
      if (
        params.id !== undefined &&
        params.mode === AppConstant.VALIDATIONS.MODE.COPY
      ) {
        this.roleid = params.id;
        this.mode = params.mode;
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
      // permissions: ['', Validators.required],
      action: [null],
      status: [""],
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() { 
    // this.getAllScreens();
  }
  clearform() {
    this.roleForm.reset();
    this.roleObj = {};
    this.access = "";
    this.roleAccessList = [];
  }

  generateEditForm(data) {
    this.loading = false;
    this.buttonText =
      this.mode === AppConstant.VALIDATIONS.MODE.COPY
        ? AppConstant.VALIDATIONS.SAVE
        : AppConstant.VALIDATIONS.UPDATE;
    this.roleForm = this.fb.group({
      rolename: [
        this.mode === AppConstant.VALIDATIONS.MODE.COPY
          ? ""
          : this.roleObj.rolename,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(45),
        ]),
      ],
      // permissions: [(!_.isEmpty(this.roleObj.permissions)) ? (this.roleObj.permissions).split(',') : ''],
      //  status: [(this.roleObj.status === AppConstant.STATUS.ACTIVE) ? true : false]
      action: [],
    });
  }
  onPageSizeChange(size:number){
    this.pageSize = size;
    this.getAllScreens()
  }
  globalSearch(searchText: any) {
    if (searchText !== "" && searchText !== undefined && searchText != null) {
      const self = this;
      this.screenList = [];
      this.originalData.map(function (item) {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            const regxExp = new RegExp("\\b" + searchText, "gi");
            if (regxExp.test(element)) {
              if (!_.some(self.screenList, item)) {
                self.screenList.push(item);
              }
            }
          }
        }
      });
    } else {
      this.screenList=this.originalData;
    }
  }
  getAllScreens() {
    this.roleService
      .allScreens({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          response.data.forEach((item) => {
            item.actionsscreens = _.map(
              item.screenactions,
              _.property("actions")
            );
            item.actions = [];
            let assignedData = _.find(this.screenPermissions, {
              screenid: item.screenid,
            });
            if (assignedData != undefined) {
              if (this.mode !== AppConstant.VALIDATIONS.MODE.COPY) {
                item.accessid = assignedData.accessid;
              }
              item.actions = assignedData.actions;
            }
          });
          this.screenList = response.data;
          this.originalData = this.screenList;
          this.loading = false;
        } else {
          this.loading = false;
        }
      });
  }
  getRoleDetails(id) {
    this.roleService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.roleObj = response.data;
        this.roleObj.refid = response.data.roleid;
        this.roleObj.reftype = AppConstant.REFERENCETYPE[9];
        this.roleActions(this.roleObj.roleid);
      }
    });
  }
  roleActions(id) {
    this.roleService.allRoleAccess({ roleid: id }).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.screenPermissions = response.data;
        this.getAllScreens();
        this.generateEditForm(this.screenPermissions);
      }
    });
  }
  viewModal(data) {
    this.screenid = data.screenid;
    this.screenActions = data.actionsscreens;
    this.roleForm.controls.action.setValue(data.actions);
    this.rightbar = false;
    this.isVisible = false;
    this.show = true;
    this.index = _.indexOf(this.screenList, data);
  }
  handleOk() {
    this.roleActionObj = this.roleForm.controls.action.value;
    this.access[this.index] = "Yes";
    this.screenList[this.index].actions = this.roleActionObj;
    this.rightbar = true;
    this.isVisible = true;
    this.show = false;
  }

  handleCancel(): void {
    this.roleForm.controls.action.reset();
    this.rightbar = true;
    this.isVisible = true;
    this.show = false;
  }

  saveOrUpdate(data) {
    console.log("Form submitted", data);
    let errorMessage: any;
    if (this.roleForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.roleForm,
        this.roleErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        rolename: data.rolename,
        accessid: data.actionid,
        status: AppConstant.STATUS.ACTIVE,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (_.isUndefined(this.screenList)) {
        this.message.error("Please fill the screen permissions");
        return;
      }
      console.log('Form Data before API Call', this.formdata);
      let self = this;
      if (!_.isUndefined(this.screenList)) {
        this.formdata.roleaccess = _.map(this.screenList, function (item) {
          item.status = "Active";
          item.createdby = self.userstoragedata.fullname;
          item.createddt = new Date();
          item.lastupdatedby = self.userstoragedata.fullname;
          item.lastupdateddt = new Date();
          if (!_.isUndefined(self.roleObj) && !_.isEmpty(self.roleObj)) {
            item.roleid = self.roleObj.roleid;
          }
          return item;
        });
      }

      if (
        !_.isUndefined(this.roleObj) &&
        !_.isEmpty(this.roleObj) &&
        this.mode !== AppConstant.VALIDATIONS.MODE.COPY
      ) {
        this.formdata.roleid = this.roleObj.roleid;
        this.roleService.updateRole(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.clearform();
            this.router.navigate(["/roles"]);
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.roleService.createRole(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.router.navigate(["/roles"]);
          } else {
            this.message.error(response.message);
          }
        });
        this.clearform();
      }
    }
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
