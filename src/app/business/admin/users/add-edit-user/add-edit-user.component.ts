import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { UsersService } from "../../users/users.service";
import { AppConstant } from "../../../../app.constant";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { Router } from "@angular/router";
import * as _ from "lodash";
@Component({
  selector: "app-add-edit-user",
  templateUrl:
    "../../../../presentation/web/admin/users/add-edit-user/add-edit-user.component.html",
})
export class AddEditUserComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() userObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  loading = false;
  usersList: any = [];
  isVisible = false;
  formTitle = "";
  tenantList = [];
  departmentsList = [];
  tabIndex = 0 as number;
  customerList = [];
  userRoleList = [];
  tenantsettingsList = [];
  formdata: any = {};
  isSuperAdmin = false;
  userForm: FormGroup;
  addingparam: Boolean = false;
  rightbar = true;
  isVisibleTop = false;
  show = false;
  updateParam: any = {
    status: false,
    title: "",
  };
  updateParamValue;
  updatingparam: Boolean = false;
  button: any;
  userstoragedata: any = {};
  edit = false;
  screens = [];
  createFlag = false;
  appScreens = {} as any;
  passwordEdit = true;
  userErrObj = {
    tenantid: AppConstant.VALIDATIONS.USER.TENANT,
    roleid: AppConstant.VALIDATIONS.USER.ROLE,
    fullname: AppConstant.VALIDATIONS.USER.FULLNAME,
    email: AppConstant.VALIDATIONS.USER.EMAIL,
    department: AppConstant.VALIDATIONS.USER.DEPARTMENT,
    phone: AppConstant.VALIDATIONS.USER.PHONENO,
    secondaryphoneno: AppConstant.VALIDATIONS.USER.MOBILENO,
    password: AppConstant.VALIDATIONS.USER.PASSWORD,
    rolename: AppConstant.VALIDATIONS.USER.ROLENAME,
  };
  constructor(
    private userService: UsersService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.isSuperAdmin =
    this.userstoragedata.roles.rolename ==
        AppConstant.VALIDATIONS.USER.ROLES.ADMIN
        ? true
        : false;
  }
  ngOnInit() {
    this.clearForm();
    this.getTenants();
    this.getLookups();
    if (!this.isSuperAdmin) {
      this.getCustomerList();
      this.getUserRoleList(this.userstoragedata.tenantid);
    }
    this.getTenantSettings();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.userObj && 
      changes.userObj.currentValue && 
      !_.isUndefined(changes.userObj.currentValue) &&
      !_.isEmpty(changes.userObj.currentValue)
    ) {
      this.tabIndex = 0;
      this.userObj = changes.userObj.currentValue;
      this.edit = true;
      this.button = AppConstant.BUTTONLABELS.UPDATE;
      this.formTitle = AppConstant.VALIDATIONS.USER.ADD;
      this.userForm.controls["status"].setValue(
        this.userObj.status === "Active" ? true : false
      );
      this.userObj.twofactorauthyn =
        this.userObj.twofactorauthyn === "Y" ? true : false;
      this.userObj = _.omit(this.userObj, 'password');
      this.userForm.patchValue({
        ...this.userObj,
        status: this.userObj["status"] == "Active" ? true : false,
      });
      this.userForm.controls["password"].clearValidators();
      this.userForm.controls["password"].updateValueAndValidity();
      this.userObj.refid = this.userObj.userid;
      this.userObj.reftype = AppConstant.REFERENCETYPE[10];
      this.userObj._tenantid = this.userObj.tenantid
    } else {
      this.edit = false;
      this.clearForm();
      this.button = AppConstant.BUTTONLABELS.SAVE;
      this.formTitle = AppConstant.VALIDATIONS.USER.EDIT;
    }
  }
  clearForm() {
    //Default 2FA check
    const twoFactorSetting = this.tenantsettingsList.find(
      (setting) => setting.setting_name === AppConstant.TENANT_LOGIN.TWOFA
    );
    const isTwoFactorEnabled =
      twoFactorSetting && twoFactorSetting.setting_value === AppConstant.TENANT_LOGIN.TWOFA_VALUE;

    this.userForm = this.fb.group({
      tenantid: [
        this.isSuperAdmin ? null : this.userstoragedata.tenantid,
        Validators.required,
      ],
      roleid: [null, Validators.required],
      customerid: [-1],
      fullname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(45),
        ]),
      ],
      email: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            "([a-z0-9&_.-]*[@][a-z0-9]+((.[a-z]{2,3})?.[a-z]{2,3}))"
          ),
        ]),
      ],
      phone: [
        "",
        Validators.compose([Validators.minLength(8), Validators.maxLength(15)]),
      ],
      secondaryphoneno: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern(new RegExp("^\\+[1-9]{1}[0-9]{3,14}$")),
        ]),
      ],
      password: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(25),
        ]),
      ],
      status: [""],
      department: [""],
      isapproveryn: [""],
      rolename: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(45)]),
      ],
      twofactorauthyn: [isTwoFactorEnabled],
    });
    this.edit = false;
    this.userObj = {};
  }

  saveOrUpdate(data) {
    let errorMessage: any;
    if (this.userForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.userForm,
        this.userErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    //else if (
    //   data.phone !== "" &&
    //   data.secondaryphoneno !== "" 
    //   //data.phone === data.secondaryphoneno
    // ) {
    //   this.message.error("Phone No & Mobile No should be different");
    // } 
    else {
      this.loading = true;
      this.formdata = {
        tenantid: data.tenantid,
        customerid: !_.isNull(data.customerid) ? data.customerid : -1,
        password: data.password,
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        secondaryphoneno: data.secondaryphoneno,
        department: data.department,
        isapproveryn: data.isapproveryn,
        twofactorauthyn: data.twofactorauthyn === false ? "N" : "Y",
        roleid: data.roleid,
        status:
          data.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.userObj) &&
        !_.isUndefined(this.userObj.userid) &&
        !_.isEmpty(this.userObj)
      ) {
        this.formdata.userid = this.userObj.userid;
        this.formdata = _.omit(this.formdata, "password");
        this.userService.updateUser(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.updatingparam = false;
          this.loading = false;
          if (response.status) {
            response.data.status === AppConstant.STATUS.DELETED
              ? this.message.success(
                "#" + response.data.userid + " Deleted Successfully"
              )
              : this.message.success(response.message);
            this.updateParam.status = false;
            this.notifyNewEntry.next(response.data);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.createddt = new Date();
        this.userService.createUser(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            this.loading = false;
            if (response.status) {
              this.message.success(response.message);
              this.notifyNewEntry.next(response.data);
            } else {
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add. Try again");
          }
        );
      }
    }
  }
  getTenants() {
    let response = {} as any;
    this.commonService
      .allTenants({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.tenantList = response.data;
        } else {
          this.tenantList = [];
        }
      });
  }
  getLookups() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        tenantid: this.userstoragedata.tenantid,
        lookupkey: AppConstant.LOOKUPKEY.DEPARTMENT,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.departmentsList = response.data;
        } else {
          this.departmentsList = [];
        }
      });
  }
  onTenantChange(event) {
    this.userForm.controls["customerid"].setValue(-1);
    this.userForm.controls["roleid"].setValue(null);
    this.getCustomerList(event);
    this.getUserRoleList(event);
  }
  getCustomerList(event?) {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (event) {
      condition.tenantid = event;
    }
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerList = response.data;
      } else {
        this.customerList = [];
        this.userForm.controls["customerid"].setValue(-1);
      }
    });
  }
  getUserRoleList(event?) {
    const tenantList = [event, 0];
    this.userService
      .allUserRoles({ status: AppConstant.STATUS.ACTIVE, tenantList })
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.userRoleList = response.data;
        } else {
          this.userRoleList = [];
        }
      });
  }
  resettotp() {
    this.loading = true;
    this.userService
      .updateUser({
        userid: this.userObj.userid,
        totpsecret: null,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        this.updatingparam = false;
        this.loading = false;
        if (response.status) {
          this.message.success(response.message);
          this.updateParam.status = false;
          this.notifyNewEntry.next(response.data);
        } else {
          this.message.error(response.message);
        }
      });
  }
  //Tenant Settings List
  getTenantSettings() {
    let response = {} as any;
    this.commonService
      .getTenantSettings({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.tenantsettingsList = response.data;
        } else {
          this.tenantsettingsList = [];
        }
      });
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
