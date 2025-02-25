import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validator, Validators } from "@angular/forms";

import { LoginService } from "./login.service";
import { Router, Route, ActivatedRoute } from "@angular/router";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../app.constant";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
@Component({
  selector: "app-login",
  templateUrl: "../../../presentation/web/base/login/login.component.html",
})
export class LoginComponent implements OnInit {
  loggingin: Boolean = false;
  // errMessage: String = '';
  // successMessage: String = '';
  showOTP: Boolean = false;
  userData: any;
  resetPassword: any = false;
  token: string = "";
  userParam: any = {};
  labelText: string = "Login";
  qrcode = "";
  licenseExpiredModalVisible: boolean = false; //License Expired modal
  constructor(
    private loginService: LoginService,
    private router: Router,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService
  ) { }
  loginForm = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", [
      Validators.required,
      Validators.pattern(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      ),
    ]),
    otp: new FormControl(""),
    newpassword: new FormControl(
      "",
      Validators.pattern(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      )
    ),
    comfirmPassword: new FormControl(
      "",
      Validators.pattern(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      )
    ),
    remember: new FormControl(),
  });

  ngOnInit() {
    if (
      this.localStorageService.getItem(AppConstant.LOCALSTORAGE.ISAUTHENTICATED)
    ) {
      this.moveToScreen();
    }
    this.userParam = this.route.snapshot.queryParams;
    if (this.userParam.resetpassword) {
      this.labelText = "Reset Password";
      this.resetPassword = true;
    } else {
      this.resetPassword = false;
    }
  }
  logIn() {
    this.loggingin = true;
    let response = {} as any;
    localStorage.setItem(
      AppConstant.LOCALSTORAGE.SESSION_TYPE,
      this.loginForm.value.remember == null ? "ss" : "ls"
    );
    this.loginService.signinUser(this.loginForm.value).subscribe(
      (result) => {
        response = JSON.parse(result._body);
        if (response.status) {
          this.userData = response;
          if (response.data.twofactorauthyn == "Y") {
            this.showOTP = response.data.twofactorauthyn == "Y" ? true : false;
            this.labelText = "Two Factor Authentication";
            if (response.data.qrcode) this.qrcode = response.data.qrcode;
            this.loginForm
              .get("otp")
              .setValidators([
                Validators.pattern("^[0-9]*$"),
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(6),
              ]);
            this.loginForm.updateValueAndValidity();
            this.loggingin = false;
          } else {
            this.redirectToLogin();
          }
        } else {
          //License Expired model view
          if (response.code === 402) {
            this.showLicenseExpiredModal();
          } else {
            this.message.error(response.message);
            this.loggingin = false;
          }
        }
      },
      (err) => {
        console.log("Error is => ");
        this.loggingin = false;
        console.log(err);
      }
    );
  }
  redirectToLogin() {
    let params = this.route.snapshot.queryParams;
    this.localStorageService.addItem(
      AppConstant.LOCALSTORAGE.TOKEN,
      this.userData.data.token
    );
    this.localStorageService.addItem(
      AppConstant.LOCALSTORAGE.TN_LOOKUP,
      this.userData.data.tenant.lookup
    );
    this.localStorageService.addItem(
      AppConstant.LOCALSTORAGE.USER,
      this.userData.data
    );
    this.localStorageService.addItem(
      AppConstant.LOCALSTORAGE.ISAUTHENTICATED,
      this.userData.status
    );
    let screens = [];
    this.loggingin = false;
    if (
      !_.isUndefined(this.userData.data.roles) &&
      !_.isEmpty(this.userData.data.roles.roleaccess)
    ) {
      screens = this.userData.data.roles.roleaccess;
      this.localStorageService.addItem(
        AppConstant.LOCALSTORAGE.SCREENS,
        screens
      );
    } else {
      this.localStorageService.addItem(AppConstant.LOCALSTORAGE.SCREENS, []);
    }
    if (!this.userData.data.lastlogin) {
      this.labelText = "Reset Password";
      this.resetPassword = true;
      // this.router.navigate([params['resetpassword']]);
    } else {
      if (params["redirecturl"]) {
        this.router.navigate(["common-redirect"], {
          queryParams: {
            redirecturl: params["redirecturl"],
          },
        });
      } else if (params["redirect"]) {
        this.router.navigate([params["redirect"]]);
      } else {
        this.moveToScreen();
      }
    }
  }
  verifyOTP() {
    this.loggingin = true;
    let response = {} as any;
    let formdata = this.loginForm.value as any;
    formdata.userid = this.userData.data.userid;
    formdata.qrsecret = this.userData.data.qrsecret;
    this.loginService.verifyOTP(formdata).subscribe(
      (result) => {
        response = JSON.parse(result._body);
        if (response.status) {
          this.redirectToLogin();
          this.message.success(response.message);
        } else {
          this.message.error(response.message);
          this.loggingin = false;
        }
      },
      (err) => {
        console.log("Error is => ");
        this.loggingin = false;
        console.log(err);
      }
    );
  }
  resendOTP() {
    let response = {} as any;
    let formdata = {} as any;
    let userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    formdata.userid = userstoragedata.userid;
    this.loginService.resendOTP(formdata).subscribe(
      (result) => {
        response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
        }
      },
      (err) => {
        console.log("Error is => ");
        this.loggingin = false;
        console.log(err);
      }
    );
  }
  forgotPassword() {
    this.loggingin = true;
    let formdata = this.loginForm.value as any;
    let response = {} as any;
    if (formdata.email) {
      formdata.weburl = AppConstant.WEB_END_POINT;
      this.loginService.forgotPassword(formdata).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          this.loggingin = false;
          if (response.status) {
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.loggingin = false;
          console.log(err);
        }
      );
    } else {
      this.message.error("Please enter Email ID");
    }
  }
  moveToScreen() {
    let rscreens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    const screens = _.orderBy(
      rscreens.map((r) => {
        if (r != undefined && r.actions.length > 0) {
          return {
            order: r["screens"]["displayorder"],
            ...r,
          };
        }
      }),
      "order",
      "asc"
    );
    if (screens.length > 0) {
      this.router.navigate([
        screens.length > 0 ? screens[0]["screens"]["screenurl"] : "login",
      ]);
    }
  }
  resetUserPassword() {
    this.loggingin = true;
    let data = this.loginForm.value;
    let response = {} as any;

    const r = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    );

    if (!data.newpassword || !data.comfirmPassword) {
      this.message.error("Please enter new password and confirm password");
    } else if (data.newpassword !== data.comfirmPassword) {
      this.message.error("New password and confirm password should be same");
    } else if (!r.test(data.newpassword)) {
      this.message.error(
        "Password must contain one lowercase, uppercase, digit and special character."
      );
    } else {
      let formData = data;
      if (this.userData) {
        formData.email = this.userData.data.email;
      } else {
        formData.id = this.userParam.resetpassword;
        formData.forgetpassword = true;
      }
      this.loginService.resetPassword(formData).subscribe(
        (result) => {
          this.loggingin = false;
          response = JSON.parse(result._body);
          if (response.status) {
            this.labelText = "Login";
            this.resetPassword = false;
            if (this.userData) {
              this.moveToScreen();
            } else {
              this.router.navigate(["login"]);
            }
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.loggingin = false;
          console.log(err);
        }
      );
    }
    this.loggingin = false;
  }
  //License Expired modal
  showLicenseExpiredModal() {
    this.licenseExpiredModalVisible = true;
    this.loggingin = false;
  }
  //License Expired close modal
  handleCancel() {
    this.licenseExpiredModalVisible = false;
  }
}
