import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { TenantsService } from "../../../tenants/tenants.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Ecl2Service } from "../../../deployments/ecl2/ecl2-service";
import { ParametersService } from "../../parameters/parameters.service";
import * as _ from "lodash";
@Component({
  selector: "app-add-edit-tenant",
  templateUrl:
    "../../../../presentation/web/admin/tenant/add-edit-tenant/add-edit-tenant.component.html",
})
export class AddEditTenantComponent implements OnInit {
  @Input() tenantObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  tenantForm: FormGroup;
  integrationForm: FormGroup;
  edit = false;
  isconfirmed = false;
  tabIndex = 0 as number;
  buttonText = "Save";
  loadermessage = "Synchronizing your cloud details.Please wait.....";
  formdata: any = {};
  userstoragedata: any = {};
  tenantid: any;
  previewVisible = false;
  previewTitle = "";
  previewImage: any;
  logofile: any;
  FileImage: any;
  showAccountType: any = false;
  cloud: FormArray;
  tools: FormArray;
  parameterObj: any = {};
  fieldValues: any = [];
  providerData: any = [];
  accountType: any = ["Root Account", "IAM Account"];
  parameterList: any = [];
  cloudproviderList: any = [];
  regionList: any = [];
  tenantsettingsList = [];
  loading = false;
  toolsList = [
    { id: 1, value: "Servicenow" },
    { id: 2, value: "JIRA" },
    { id: 3, value: "PagerDuty" },
    { id: 4, value: "Salesforce" },
  ];
  tenantErrObj = {
    tenantname: AppConstant.VALIDATIONS.TENANT.TENANTNAME,
    contactemail: AppConstant.VALIDATIONS.TENANT.EMAIL,
    pphoneno: AppConstant.VALIDATIONS.TENANT.MOBILENO,
    sphoneno: AppConstant.VALIDATIONS.TENANT.SECPHONENO,
    tenantaddress: AppConstant.VALIDATIONS.TENANT.ADDRESS,
    contactperson: AppConstant.VALIDATIONS.TENANT.CONTACTPERSON,
    designation: AppConstant.VALIDATIONS.TENANT.DESIGNATION,
    postcode: AppConstant.VALIDATIONS.TENANT.POSTCODE,
    frommail: AppConstant.VALIDATIONS.TENANT.SMTPMAIL,
  };
  integrationErrObj = {
    cloud: AppConstant.VALIDATIONS.INTEGRATION.CLOUD,
  };
  constructor(
    private tenantsService: TenantsService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    public router: Router,
    private routes: ActivatedRoute,
    private ecl2Service: Ecl2Service,
    private parametersService: ParametersService,
    private notification: NzNotificationService
  ) {
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.tenantid = params.id;
        this.getTenantById(this.tenantid);
      }
    });
    this.tenantForm = fb.group({
      tenantname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      contactemail: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(
            "([a-z0-9&_.-]*[@][a-z0-9]+((.[a-z]{2,3})?.[a-z]{2,3}))"
          ),
        ]),
      ],
      pphoneno: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(20),
        ]),
      ],
      sphoneno: [
        "",
        Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(20),
        ]),
      ],
      tenantaddress: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(2000),
        ]),
      ],
      postcode: [
        "",
        Validators.compose([Validators.minLength(3), Validators.maxLength(11)]),
      ],
      contactperson: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(30)]),
      ],
      designation: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(45)]),
      ],
      status: [""],
      mailhostname: [""],
      port: [""],
      frommail: [
        "",
        Validators.compose([
          Validators.pattern(
            "([a-z0-9&_.-]*[@][a-z0-9]+((.[a-z]{2,3})?.[a-z]{2,3}))"
          ),
        ]),
      ],
      mailpassword: [""],
      gatewayurl: [""],
      smsuserid: [""],
      smspassword: [""],
      smstoken: [""],
      ldaphostname: [""],
      ldapuserid: [""],
      ldappassword: [""],
      cerssl: [""],
      cerntls: [""],
      cloud: this.fb.array([this.createArrayItem()]),
    });
    this.integrationForm = fb.group({
      tools: this.fb.array([this.createToolsArray()]),
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.providerData = [];
    this.getproviderList();
    this.getTenantSettings();
  }

  clearForm() {
    this.tenantForm.reset();
  }
  onPreview(file) {
    this.previewTitle = "Logo";
    this.previewVisible = true;
    this.previewImage = file;
  }
  onFile(event) {
    const reader = new FileReader();
    this.logofile = event.target.files[0];
    reader.onload = (e) => {
      this.FileImage = e.target["result"];
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  createArrayItem(): FormGroup {
    return this.fb.group({
      cloudprovider: [null],
      //  region: [null],
      cloudauthkey: [""],
      lookupid: [null],
      cloudseckey: [""],
      referenceid: [""],
      accounttype: [""],
      //   datasync: [false]
    });
  }
  getFormArray(type): FormArray {
    return this.tenantForm.get(type) as FormArray;
  }
  addArrayItem() {
    this.cloud = this.tenantForm.get("cloud") as FormArray;
    this.cloud.push(this.createArrayItem());
  }
  gettoolsFormArray(type): FormArray {
    return this.integrationForm.get(type) as FormArray;
  }
  addTools() {
    this.tools = this.integrationForm.get("tools") as FormArray;
    this.tools.push(this.createToolsArray());
  }
  createToolsArray(): FormGroup {
    return this.fb.group({
      cloud: [null, [Validators.required]],
      endpoint: [""],
      username: [""],
      password: [""],
      accesskey: [""],
      secretkey: [""],
    });
  }
  removeItem(i) {
    this.cloud = this.tenantForm.get("cloud") as FormArray;
    let cloudObj = this.cloud.controls[i].value;
    let existIndex = this.providerData.findIndex((el) => {
      return el.keyvalue == cloudObj.cloudprovider;
    });
    if (this.providerData[existIndex]) {
      if (this.providerData[existIndex].lookupid) {
        this.providerData[existIndex].status = AppConstant.STATUS.DELETED;
      } else {
        this.providerData.splice(existIndex, 1);
      }
    }
    this.checkAWSexist();
    const currentindex = this.cloud.value.length;
    this.cloud.removeAt(i);
    if (currentindex !== 1) {
      this.addArrayItem();
    }
  }
  // dataSync(i) {
  //   this.loading = true;
  //   this.cloud = this.tenantForm.get('cloud') as FormArray;
  //   if (this.cloud.controls[i].get('region').value != null) {
  //     const condition = {
  //       tenantid: this.tenantObj.tenantid,
  //       region: this.cloud.controls[i].get('region').value
  //     };
  //     this.ecl2Service.datasync(condition).subscribe((res) => {
  //       const response = JSON.parse(res._body);
  //       if (response.status) {
  //         this.loading = false;
  //         if (i !== null) {
  //           this.cloud.controls[i].get('datasync').setValue(true);
  //         }
  //         if (!_.isEmpty(this.cloud.value)) {
  //           const formdata = {} as any;
  //           const custmid = (!_.isEmpty(this.parameterObj)) ? _.find(this.parameterObj, function (obj) { if (obj.fieldlabel === 'CLOUD_DETAILS') { return obj; } }) : null;
  //           if (custmid != null) {
  //             formdata.customfldid = custmid.customfldid;
  //           }
  //           formdata.fieldname = AppConstant.TENANTKEYS.CLOUDDETAILS;
  //           formdata.fieldlabel = AppConstant.TENANTKEYS.CLOUDDETAILS;
  //           const cloudfields = _.map(this.cloud.value, function (item: any) { if (item.cloudprovider != null && item.region != null) { return item; } });
  //           formdata.fieldvalue = JSON.stringify(cloudfields);
  //           this.parametersService.updateParams(formdata).subscribe((data: any) => {
  //             const params = JSON.parse(data._body);
  //             if (params.status) {
  //               this.loading = false;
  //               this.message.success(params.message);
  //             } else {
  //               this.loading = false;
  //               this.notification.error('Error', response.message, {
  //                 nzStyle: {
  //                   right: '460px',
  //                   background: '#fff'
  //                 }, nzDuration: AppConstant.MESSAGEDURATION
  //               });

  //             }
  //           });
  //         }

  //       } else {
  //         this.loading = false;
  //         this.notification.error('Error', response.message, {
  //           nzStyle: {
  //             right: '460px',
  //             background: '#fff'
  //           }, nzDuration: AppConstant.MESSAGEDURATION
  //         });

  //       }
  //     });
  //   } else {
  //     this.loading = false;
  //     this.message.error('Sorry! Something gone wrong');
  //   }

  // }
  // getRegionList() {
  //   let condition = {} as any;
  //   condition = {
  //     lookupkey: AppConstant.LOOKUPKEY.REGION,
  //     status: AppConstant.STATUS.ACTIVE
  //   };
  //   this.commonService.allLookupValues(condition).subscribe((res) => {
  //     const response = JSON.parse(res._body);
  //     if (response.status) {
  //       this.regionList = response.data;
  //     } else {
  //       this.regionList = [];
  //     }
  //   });
  // }
  getproviderList() {
    let condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: -1,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.cloudproviderList = response.data;
      } else {
        this.cloudproviderList = [];
      }
    });
  }
  getTenantById(id) {
    this.tenantsService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.tenantObj = response.data;
        this.tenantObj.refid = response.data.tenantid;
        this.tenantObj.reftype = AppConstant.REFERENCETYPE[8];
        this.providerData = response.data.providers;
        this.parameterObj = !_.isEmpty(response.data.parameters)
          ? response.data.parameters
          : [];
        this.edit = true;
        this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
        this.generateEditForm(this.tenantObj);
      } else {
        this.tenantObj = {};
      }
    });
  }
  onChange(event, index) {
    // if (event != null && event !== AppConstant.CLOUDPROVIDER.ECL2) {
    //   this.cloud = this.tenantForm.get('cloud') as FormArray;
    //   this.cloud.controls[index].get('region').setValue('All');
    //   const valueList: any[] = [];
    //   const length = this.cloud.value.length;
    //   if (length > 1) {
    //     for (const formGroup of this.cloud.value) {
    //       valueList.push(formGroup.cloudprovider);
    //     }
    //     const isUnique = valueList.filter((value: any) => value === event).length === 1;
    //     if (isUnique === false) {
    //       this.message.error('Provider already exist');
    //       this.cloud.controls[index].get('cloudprovider').setValue(null);
    //       this.cloud.controls[index].get('region').setValue(null);
    //       return false;
    //     }
    //   }
    // }
    this.checkAWSexist();
    if (event != null) {
      this.cloud = this.tenantForm.get("cloud") as FormArray;
      const length = this.cloud.value.length;
      const valueList: any[] = [];
      const regions: any[] = [];
      if (length > 0) {
        for (const formGroup of this.cloud.value) {
          valueList.push({ cloudprovider: formGroup.cloudprovider });
        }
        const isUnique = _.uniqWith(valueList, _.isEqual);
        const duplicateLength = isUnique.length;
        if (duplicateLength !== length) {
          this.message.error("Provider already exist");
          this.cloud.controls[index].get("cloudprovider").setValue(null);
          return false;
        } else {
          let cloudObj = this.cloud.controls[index].value;
          let existIndex = this.providerData.findIndex((el) => {
            return el.lookupid == cloudObj.lookupid;
          });
          if (this.providerData[existIndex]) {
            this.providerData[existIndex].keyname = cloudObj.cloudprovider;
            this.providerData[existIndex].keyvalue = cloudObj.cloudprovider;
          }
        }
      }
    }
  }
  checkAWSexist() {
    this.cloud = this.tenantForm.get("cloud") as FormArray;
    if (this.cloud) {
      let isAWSexist = _.find(this.cloud.value, { cloudprovider: "AWS" });
      if (isAWSexist) {
        this.showAccountType = true;
      } else {
        this.showAccountType = false;
      }
    }
  }
  // onChangeEvent(event, i) {
  //   if (event != null) {
  //     this.cloud = this.tenantForm.get('cloud') as FormArray;
  //     const length = this.cloud.value.length;
  //     const valueList: any[] = [];
  //     const regions: any[] = [];
  //     if (length > 1) {
  //       for (const formGroup of this.cloud.value) {
  //         valueList.push({ cloudprovider: formGroup.cloudprovider, region: formGroup.region });
  //       }
  //       const isUnique = _.uniqWith(valueList, _.isEqual);
  //       const duplicateLength = isUnique.length;
  //       if (duplicateLength !== length) {
  //         this.message.error('Provider with same region already exist');
  //         this.cloud.controls[i].get('region').setValue(null);
  //         return false;
  //       }
  //     }
  //   }
  // }
  generateEditForm(data) {
    this.FileImage = this.tenantObj.tenant_logo;
    let len = this.parameterObj.length;
    _.map(this.parameterObj, function (obj) {
      if (obj.fieldlabel === AppConstant.TENANTKEYS.EMAILHOST) {
        data.mailhostname = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.EMAILPORT) {
        data.port = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.EMAILID) {
        data.frommail = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.EMAILPASSWORD) {
        data.mailpassword = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.SMSGATEWAYURL) {
        data.gatewayurl = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.SMSUSERID) {
        data.smsuserid = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.SMSPASSWORD) {
        data.smspassword = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.SMSACCESSTOKEN) {
        data.smstoken = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.LDAPHOST) {
        data.ldaphostname = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.LDAPUSERID) {
        data.ldapuserid = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.LDAPPASSWORD) {
        data.ldappassword = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.CERSSL) {
        data.cerssl = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.CERTLS) {
        data.cerntls = obj.fieldvalue;
      }
      if (obj.fieldlabel === AppConstant.TENANTKEYS.CLOUDDETAILS) {
        if (obj.fieldvalue) {
          data.cloud = JSON.parse(obj.fieldvalue);
        }
      }
      len--;
      if (len === 0) {
        return data;
      }
    });

    this.tenantForm = this.fb.group({
      tenantname: [
        data.tenantname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      contactemail: [
        data.contactemail,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            "([a-z0-9&_.-]*[@][a-z0-9]+((.[a-z]{2,3})?.[a-z]{2,3}))"
          ),
        ]),
      ],
      pphoneno: [
        data.pphoneno,
        Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(20),
        ]),
      ],
      sphoneno: [
        data.sphoneno,
        Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(20),
        ]),
      ],
      tenantaddress: [
        data.tenantaddress,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(2000),
        ]),
      ],
      postcode: [
        data.postcode,
        Validators.compose([Validators.minLength(1), Validators.maxLength(12)]),
      ],
      contactperson: [
        data.contactperson,
        Validators.compose([Validators.minLength(1), Validators.maxLength(30)]),
      ],
      designation: [
        data.designation,
        Validators.compose([Validators.minLength(1), Validators.maxLength(45)]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
      mailhostname: [data.mailhostname],
      port: [data.port],
      frommail: [data.frommail],
      mailpassword: [data.mailpassword],
      gatewayurl: [data.gatewayurl],
      smsuserid: [data.smsuserid],
      smspassword: [data.smspassword],
      smstoken: [data.smstoken],
      ldaphostname: [data.ldaphostname],
      ldappassword: [data.ldappassword],
      ldapuserid: [data.ldapuserid],
      cerssl: [data.cerssl],
      cerntls: [data.cerntls],
      cloud: this.fb.array([]),
    });
    this.cloud = this.tenantForm.get("cloud") as FormArray;
    if (data.cloud !== undefined) {
      data.cloud.forEach((element) => {
        let lookupData = this.providerData.find((el) => {
          return el.keyvalue == element.cloudprovider;
        });
        this.cloud.push(
          this.fb.group({
            cloudprovider: element.cloudprovider,
            lookupid: lookupData ? lookupData.lookupid : null,
            //    region: element.region,
            cloudauthkey: element.cloudauthkey,
            cloudseckey: element.cloudseckey,
            referenceid: element.referenceid,
            accounttype: element.accounttype,
            //    datasync: element.datasync
          })
        );
        this.checkAWSexist();
      });
    } else {
      this.cloud.push(this.createArrayItem());
    }
  }
  isConfirm() {
    this.isconfirmed = true;
    this.notification.remove();
    this.saveOrUpdate(this.tenantForm.value, "");
  }
  createBasicNotification(template: TemplateRef<{}>): void {
    this.notification.template(template, {
      nzStyle: {
        right: "460px",
      },
      nzDuration: AppConstant.MESSAGEDURATION,
    });
  }
  saveOrUpdate(data, template) {
    let errorMessage: any;
    if (this.tabIndex === 0) {
      if (this.tenantForm.status === "INVALID") {
        errorMessage = this.commonService.getFormErrorMessage(
          this.tenantForm,
          this.tenantErrObj
        );
        this.message.remove();
        this.message.error(errorMessage);
        return false;
      } else {
        const formData = new FormData();
        this.formdata = {
          isconfirmed: this.isconfirmed,
          tenantname: data.tenantname,
          tenantaddress: data.tenantaddress,
          postcode: data.postcode,
          pphoneno: data.pphoneno,
          sphoneno: data.sphoneno,
          contactperson: data.contactperson,
          designation: data.designation,
          contactemail: data.contactemail,
          status:
            data.status === true
              ? AppConstant.STATUS.ACTIVE
              : AppConstant.STATUS.INACTIVE,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        let userList = {};
        userList = {
          fullname: AppConstant.TENANTKEYS.PREFIX + data.tenantname,
          email: data.contactemail,
          phone: data.pphoneno,
          roleid: 2,
          status: AppConstant.STATUS.ACTIVE,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        this.parameterList = {
          paramtype: "Tenant",
          tenantid: !_.isEmpty(this.tenantObj) ? this.tenantObj.tenantid : null,
          customerid: -1,
          datatype: "string",
          status: AppConstant.STATUS.ACTIVE,
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        this.fieldValues = [
          { key: AppConstant.TENANTKEYS.EMAILHOST, value: data.mailhostname },
          { key: AppConstant.TENANTKEYS.EMAILPORT, value: data.port },
          { key: AppConstant.TENANTKEYS.EMAILID, value: data.frommail },
          {
            key: AppConstant.TENANTKEYS.EMAILPASSWORD,
            value: data.mailpassword,
          },
          { key: AppConstant.TENANTKEYS.SMSGATEWAYURL, value: data.gatewayurl },
          { key: AppConstant.TENANTKEYS.SMSUSERID, value: data.smsuserid },
          { key: AppConstant.TENANTKEYS.SMSPASSWORD, value: data.smspassword },
          { key: AppConstant.TENANTKEYS.SMSACCESSTOKEN, value: data.smstoken },
          { key: AppConstant.TENANTKEYS.LDAPHOST, value: data.ldaphostname },
          { key: AppConstant.TENANTKEYS.LDAPUSERID, value: data.ldapuserid },
          {
            key: AppConstant.TENANTKEYS.LDAPPASSWORD,
            value: data.ldappassword,
          },
          { key: AppConstant.TENANTKEYS.CERSSL, value: data.cerssl },
          { key: AppConstant.TENANTKEYS.CERTLS, value: data.cerntls },
        ];

        let parameters = [] as any;
        let arr = [] as any;
        this.fieldValues.forEach((element) => {
          arr = _.clone(this.parameterList);
          if (!_.isEmpty(this.parameterObj)) {
            _.map(this.parameterObj, function (obj: any) {
              if (element.key === obj.fieldlabel) {
                arr.customfldid = obj.customfldid;
                arr.fieldname = !_.isEmpty(element) ? element.key : "";
                arr.fieldlabel = !_.isEmpty(element) ? element.key : "";
                arr.fieldvalue = !_.isEmpty(element) ? element.value : "";
                parameters.push(arr);
                arr = [];
              }
            });
          } else {
            arr.fieldname = !_.isEmpty(element) ? element.key : "";
            arr.fieldlabel = !_.isEmpty(element) ? element.key : "";
            arr.fieldvalue = !_.isEmpty(element) ? element.value : "";
            parameters.push(arr);
            arr = [];
          }
        });
        if (!_.isEmpty(data.cloud)) {
          let custmid = !_.isEmpty(this.parameterObj)
            ? _.find(this.parameterObj, function (obj) {
                if (obj.fieldlabel === "CLOUD_DETAILS") {
                  return obj;
                }
              })
            : null;
          data.cloud.forEach((element) => {
            let isexist = this.providerData.find((el) => {
              return el.keyvalue == element.cloudprovider;
            });
            if (!isexist && element.cloudprovider) {
              this.providerData.push({
                tenantid: this.tenantObj ? this.tenantObj.tenantid : null,
                lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
                keyname: element.cloudprovider,
                keyvalue: element.cloudprovider,
                datatype: "string",
                status: AppConstant.STATUS.ACTIVE,
                createdby: this.userstoragedata.fullname,
                createddt: new Date(),
                lastupdatedby: this.userstoragedata.fullname,
                lastupdateddt: new Date(),
              });
            }
          });
          arr = _.clone(this.parameterList);
          if (custmid != null) {
            arr.customfldid = custmid.customfldid;
          }
          arr.fieldname = AppConstant.TENANTKEYS.CLOUDDETAILS;
          arr.fieldlabel = AppConstant.TENANTKEYS.CLOUDDETAILS;
          const cloudfields = _.map(data.cloud, function (item: any) {
            if (item.cloudprovider != null) {
              return item;
            } else {
              return [];
            }
          });
          arr.fieldvalue = !_.isEmpty(cloudfields)
            ? JSON.stringify(cloudfields)
            : [];
          parameters.push(arr);
        }
        this.formdata.user = userList;
        this.formdata.parameters = parameters;
        this.formdata.providers = this.providerData;
        if (this.logofile !== undefined && this.logofile != null) {
          formData.append("logofile", this.logofile);
        }
        if (
          !_.isUndefined(this.tenantObj) &&
          !_.isUndefined(this.tenantObj.tenantid) &&
          !_.isEmpty(this.tenantObj)
        ) {
          this.formdata.tenantid = this.tenantObj.tenantid;
          formData.append("formData", JSON.stringify(this.formdata));
          this.tenantsService.update(formData).subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.message.success(response.message);
              this.isconfirmed = false;
              this.router.navigate(["tenants"]);
            } else if (
              response.status === false &&
              response.message === "Warning"
            ) {
              this.createBasicNotification(template);
            } else {
              this.notification.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
              this.isconfirmed = false;
            }
          });
        } else {
          this.formdata.createddt = new Date();
          this.formdata.createdby = this.userstoragedata.fullname;
          this.formdata.status = AppConstant.STATUS.ACTIVE;
          this.formdata.user.createddt = new Date();
          this.formdata.user.createdby = this.userstoragedata.fullname;
          this.formdata.user.status = AppConstant.STATUS.ACTIVE;
          formData.append("formData", JSON.stringify(this.formdata));
          this.tenantsService.create(formData).subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.message.success(response.message);
              setTimeout(() => {
                this.isconfirmed = false;
                this.router.navigate(["tenants"]);
              }, 2000);
            } else if (
              response.status === false &&
              response.message === "Warning"
            ) {
              this.createBasicNotification(template);
            } else {
              this.notification.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
              this.isconfirmed = false;
            }
          });
        }
      }
    } else {
      if (this.tabIndex === 1) {
        if (this.integrationForm.status === "INVALID") {
          errorMessage = this.commonService.getFormErrorMessage(
            this.integrationForm,
            this.integrationErrObj
          );
          this.message.remove();
          this.message.error(errorMessage);
          return false;
        } else {
          const toolsArray = this.integrationForm.get("tools").value;

        toolsArray.forEach((tool) => {
          const { cloud, ...otherFields } = tool;
          const integrationData = {
            tenantid: this.userstoragedata.tenantid,
            setting_name: cloud,
            setting_ref: AppConstant.TENANTKEYS.INTEGRATION,
            createddt: new Date(),
            createdby: this.userstoragedata.fullname,
            status: AppConstant.STATUS.ACTIVE,
            setting_value: {
              ...otherFields,
            },
          };

          if (tool.id) {
            integrationData["tnsettingid"] = tool.id;
            this.tenantsService
              .integrationUpdate(integrationData)
              .subscribe((res) => {
                const response = JSON.parse(res._body);
              });
          } else {
            this.tenantsService
              .integrationCreate(integrationData)
              .subscribe((res) => {
                const response = JSON.parse(res._body);
                this.message.success(response.message);
              });
          }
        });
        }
      }
    }
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
  getTenantSettings() {
    this.commonService
      .getTenantSettings({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((data) => {
        const response = JSON.parse(data._body);

        if (response.status) {
          const integrationSettings = response.data.filter(
            (item: any) =>
              item.setting_ref === AppConstant.TENANTKEYS.INTEGRATION
          );

          this.populateData(integrationSettings);
        } else {
          this.tenantsettingsList = [];
        }
      });
  }
  populateData(settingsData: any) {
    const toolsFormArray = this.integrationForm.get("tools") as FormArray;
    while (toolsFormArray.length !== 0) {
      toolsFormArray.removeAt(0);
    }
    settingsData.forEach((setting: any) => {
      const settingValue = setting.setting_value
        ? JSON.parse(setting.setting_value)
        : {};
      const newTool = this.fb.group({
        id: setting.tnsettingid || null,
        cloud: setting.setting_name || "",
        endpoint: settingValue.endpoint || "",
        username: settingValue.username || "",
        password: settingValue.password || "",
        accesskey: settingValue.accesskey || "",
        secretkey: settingValue.secretkey || "",
      });
      toolsFormArray.push(newTool);
    });
  }
  deleteIntegration(index: number) {
    const tool = this.integrationForm.get("tools").value[index];
    if (tool.id) {
      const updatedToolData = {
        ...tool,
        tnsettingid: tool.id,
        status: AppConstant.STATUS.DELETED,
      };
      this.tenantsService
        .integrationUpdate(updatedToolData)
        .subscribe((response) => {
        this.getTenantSettings(); 
        });
    } else {
      const toolsFormArray = this.integrationForm.get("tools") as FormArray;
      toolsFormArray.removeAt(index);
  }
  }
}
