import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../../app.constant";
import { CommonService } from "../../../../../modules/services/shared/common.service";

import * as _ from "lodash";
import { CostSetupService } from "../../costsetup/costsetup.service";
import { BudgetService } from "../budget.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { Ecl2Service } from "src/app/business/deployments/ecl2/ecl2-service";
import * as moment from "moment";
import { TagService } from "../../../tagmanager/tags.service";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import { UsersService } from "src/app/business/admin/users/users.service";
@Component({
  selector: "app-addeditbudget",
  templateUrl:
    "../../../../../presentation/web/base/assets/budget/addeditbudget/addeditbudget.component.html",
})
export class AddeditbudgetComponent implements OnInit, OnChanges {
  disabled = false;
  loading = false;

  @Input() budgetList: any;
  @Input() instanceObj: any;
  @Output() notifyBudgetEntry: EventEmitter<any> = new EventEmitter();

  budgetForm: FormGroup;
  userstoragedata = {} as any;
  assetTypes: any = [];
  providerList = [];
  currencyList: any = [];
  customerList: any = [];
  referenceList: any = [];
  instanceList: any = [];
  networkList: any = [];
  loadbalancerList: any = [];
  volumeList: any = [];
  imageList: any = [];
  igwList: any = [];
  firewallList: any = [];
  cfgList: any = [];
  tagList = [];
  accountList = [];
  selectedTag = {} as any;
  selectedTagGroupName = "";
  previewText = AppConstant.BUTTONLABELS.SHOW;
  budgetObj = {} as any;
  showPreview = false as any;
  previewData = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  budgetErrObj = AppConstant.VALIDATIONS.BUDGETSETUP;
  usersList: any = [];

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private httpService: HttpHandlerService,
    private awsService: AWSService,
    private localStorageService: LocalStorageService,
    private ecl2Service: Ecl2Service,
    private costService: CostSetupService,
    private commonService: CommonService,
    private userService: UsersService,
    private budgetService: BudgetService,
    private tagService: TagService,
    private customerAccService: CustomerAccountService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getProviderList();
    this.getCustomerList();
    this.getAccountsList();
    this.getLookupLists();
    this.getAllTags();
    this.getUserList();
    this.clearForm();
  }

  ngOnInit() {
    this.assetTypes = [
      { title: "All", value: "All" },
      // { title: 'Server', value: 'ASSET_INSTANCE' },
      // { title: 'Network', value: 'ASSET_NETWORK' },
      // { title: 'Load Balancer', value: 'ASSET_LB' },
      // { title: 'Firewall', value: 'ASSET_FIREWALL' },
      // { title: 'Internet Gateway', value: 'ASSET_IG' },
      // { title: 'CFG', value: 'ASSET_CFG' },
      // { title: 'Volume', value: 'ASSET_VOLUME' }];
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.showPreview = false;
    this.previewText = AppConstant.BUTTONLABELS.SHOW;
    this.clearForm();
    if (
      !_.isEmpty(changes.budgetList) &&
      !_.isEmpty(changes.budgetList.currentValue.data)
    ) {
      this.budgetObj = changes.budgetList.currentValue.data;
      this.editForm();
    } else {
      this.budgetObj = {};
    }

    if (
      !_.isEmpty(changes.instanceObj) &&
      !_.isEmpty(changes.instanceObj.currentValue)
    ) {
      this.budgetObj = changes.instanceObj.currentValue;
      this.editForm();
    }
  }
  clearForm(data?) {
    this.budgetForm = this.fb.group({
      name: ["", Validators.required],
      startdt: [new Date(), Validators.required],
      enddt: [new Date(), Validators.required],
      customerid: [data ? data.customerid : -1],
      accountid: [data ? data._accountid : null],
      cloudprovider: [data ? data.cloudprovider : ""],
      resourcetype: [data ? data.resourcetype : "All"],
      resourceid: [data ? data.resourceid : []],
      instancerefid: [data ? data.instancerefid : ""],
      tagid: [data ? data.tagid : -1],
      tagvalue: [data ? data.tagvalue : ""],
      currency: [null, Validators.required],
      budgetamount: [null, Validators.required],
      notes: [""],
      status: ["Active"],
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
    });
  }
  editForm() {
    this.onProviderChange(this.budgetObj.cloudprovider);
    this.fillNotificationTable();
    switch (this.budgetObj.resourcetype) {
      case "VIRTUAL_SERVER":
        this.getServerList(this.budgetObj.cloudprovider);
        break;
      case "Amazon Elastic Compute Cloud - Compute":
        this.getServerList(this.budgetObj.cloudprovider);
        break;
      case "ASSET_NETWORK":
        this.getNetworkList(this.budgetObj.cloudprovider);
        break;
      case "ASSET_LOADBALANCER":
        this.getLBList(this.budgetObj.cloudprovider);
        break;
      case "ASSET_FIREWALL":
        this.getFirewallList(this.budgetObj.cloudprovider);
        break;
      case "ASSET_VOLUME":
        this.getVolumeList(this.budgetObj.cloudprovider);
        break;
      case "ASSET_INTERNETCONNECTIVITY":
        this.getIgList(this.budgetObj.cloudprovider);
        break;
      case "ASSET_CFG":
        this.getcfgList(this.budgetObj.cloudprovider);
        break;
    }
    this.budgetObj.accountid = this.budgetObj._accountid;
    this.budgetForm.patchValue(this.budgetObj);
    console.log(this.budgetObj);
    this.budgetAmtChange(this.budgetObj.budgetamount);
    if (this.budgetObj.tagid != -1) {
      this.tagChanged(this.budgetObj.tagid);
    }
  }
  onProviderChange(event) {
    this.budgetForm.controls["resourcetype"].setValue(null);
    this.budgetForm.controls["resourceid"].setValue([]);
    this.assetTypes = [];
    this.assetTypes = [{ title: "All", value: "All" }];
    if (event === AppConstant.CLOUDPROVIDER.AWS) {
      AppConstant.AWS_BILLING_RESOURCETYPES.forEach((element) => {
        this.assetTypes.push(element);
      });
    }
    if (event === AppConstant.CLOUDPROVIDER.ECL2) {
      AppConstant.ECL2_BILLING_RESOURCETYPES.forEach((element) => {
        if (element.value !== "ASSET_INSTANCE") {
          this.assetTypes.push(element);
        }
      });
    }
  }
  onCustomerChange(event) {
    this.assetChanges(
      this.budgetForm.value.cloudprovider,
      this.budgetForm.value.resourcetype
    );
  }
  tagChanged(e) {
    if (e != null) {
      let tag = this.tagList.find((o) => o["tagid"] == e);
      let tagClone = _.cloneDeep(tag);

      this.budgetForm.controls["tagvalue"].setValue(null);

      if (tagClone.tagtype == "list") {
        tagClone.lookupvalues = tagClone.lookupvalues.split(",");
      } else if (
        tagClone.tagtype == "range" &&
        typeof tagClone.lookupvalues == "string"
      ) {
        tagClone.min = tagClone.lookupvalues.split(",")[0];
        tagClone.min = tagClone.lookupvalues.split(",")[1];
      }

      if (this.budgetObj.tagvalue != "") {
        this.budgetForm.controls["tagvalue"].setValue(this.budgetObj.tagvalue);
      }
      this.selectedTag = _.cloneDeep(tagClone);
    }
  }
  budgetAmtChange(data) {
    if (data) {
      data = parseFloat(`${data}`.replace(/,/g, ""));
      let newValue = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
      }).format(data);
      this.budgetForm.get("budgetamount").setValue(newValue);
    }
  }
  getAllTags() {
    this.loading = true;
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
      this.loading = false;
    });
  }
  getServerList(provider) {
    this.loading = true;
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (provider != null && provider != undefined && provider != "") {
      condition.cloudprovider = provider;
    }
    if (
      this.budgetForm.value.customerid != null &&
      this.budgetForm.value.customerid != -1
    ) {
      condition.customerid = this.budgetForm.value.customerid;
    }
    this.commonService.allInstances(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = response.data;
        this.referenceList = this.formArrayData(
          response.data,
          "instancename",
          "instanceid"
        );
      } else {
        this.instanceList = [];
        this.referenceList = [];
      }
      this.loading = false;
    });
  }
  getNetworkList(provider) {
    if (provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.loading = true;
      this.awsService
        .allawsvpc({ status: AppConstant.STATUS.ACTIVE })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.networkList = response.data;
            this.referenceList = this.formArrayData(
              response.data,
              "vpcname",
              "vpcid"
            );
          } else {
            this.networkList = [];
            this.referenceList = [];
          }
          this.loading = false;
        });
    }
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.loading = true;
      let condition = {
        status: AppConstant.STATUS.ACTIVE,
      } as any;
      if (
        this.budgetForm.value.customerid != null &&
        this.budgetForm.value.customerid != -1
      ) {
        condition.customerid = this.budgetForm.value.customerid;
      }
      this.ecl2Service.allecl2nework(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.networkList = response.data;
          this.referenceList = this.formArrayData(
            response.data,
            "networkname",
            "networkid"
          );
        } else {
          this.networkList = [];
          this.referenceList = [];
        }
        this.loading = false;
      });
    }
  }
  getLBList(provider) {
    if (provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.loading = true;
      this.awsService
        .allawslb({ status: AppConstant.STATUS.ACTIVE })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loadbalancerList = response.data;
            this.referenceList = this.formArrayData(
              response.data,
              "lbname",
              "lbid"
            );
          } else {
            this.loadbalancerList = [];
            this.referenceList = [];
          }
          this.loading = false;
        });
    }
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.loading = true;
      let condition = {
        status: AppConstant.STATUS.ACTIVE,
      } as any;
      if (
        this.budgetForm.value.customerid != null &&
        this.budgetForm.value.customerid != -1
      ) {
        condition.customerid = this.budgetForm.value.customerid;
      }
      this.ecl2Service.allecl2loadbalancer(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loadbalancerList = response.data;
          this.referenceList = this.formArrayData(
            response.data,
            "lbname",
            "loadbalancerid"
          );
        } else {
          this.loadbalancerList = [];
          this.referenceList = [];
        }
        this.loading = false;
      });
    }
  }
  getFirewallList(provider) {
    this.loading = true;
    if (provider == AppConstant.CLOUDPROVIDER.AWS) {
    }
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      let condition = {
        status: AppConstant.STATUS.ACTIVE,
      } as any;
      if (
        this.budgetForm.value.customerid != null &&
        this.budgetForm.value.customerid != -1
      ) {
        condition.customerid = this.budgetForm.value.customerid;
      }
      this.ecl2Service.allecl2vsrx(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.firewallList = response.data;
          this.referenceList = this.formArrayData(
            response.data,
            "vsrxname",
            "vsrxid"
          );
        } else {
          this.firewallList = [];
          this.referenceList = [];
        }
        this.loading = false;
      });
    }
  }
  getVolumeList(provider) {
    if (provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.loading = true;
      this.awsService
        .allawsvolumes({ status: AppConstant.STATUS.ACTIVE })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.volumeList = response.data;
            response.data = _.map(response.data, function (i: any) {
              i.sizeingb = i.sizeingb + " GB";
              return i;
            });
            this.referenceList = this.formArrayData(
              response.data,
              "sizeingb",
              "volumeid"
            );
          } else {
            this.volumeList = [];
            this.referenceList = [];
          }
          this.loading = false;
        });
    }
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.loading = true;
      let condition = {
        status: AppConstant.STATUS.ACTIVE,
      } as any;
      if (
        this.budgetForm.value.customerid != null &&
        this.budgetForm.value.customerid != -1
      ) {
        condition.customerid = this.budgetForm.value.customerid;
      }
      this.ecl2Service.allecl2volume(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.volumeList = response.data;
          response.data = _.map(response.data, function (i: any) {
            i.size = i.size + " GB";
            return i;
          });
          this.referenceList = this.formArrayData(
            response.data,
            "size",
            "volumeid"
          );
        } else {
          this.volumeList = [];
          this.referenceList = [];
        }
        this.loading = false;
      });
    }
  }
  getIgList(provider) {
    if (provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.loading = true;
      this.awsService
        .allawsigw({ status: AppConstant.STATUS.ACTIVE })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.igwList = response.data;
            this.referenceList = this.formArrayData(
              response.data,
              "gatewayname",
              "internetgatewayid"
            );
          } else {
            this.igwList = [];
            this.referenceList = [];
          }
          this.loading = false;
        });
    }
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.loading = true;
      let condition = {
        status: AppConstant.STATUS.ACTIVE,
      } as any;
      if (
        this.budgetForm.value.customerid != null &&
        this.budgetForm.value.customerid != -1
      ) {
        condition.customerid = this.budgetForm.value.customerid;
      }
      this.ecl2Service.allecl2gateway(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.igwList = response.data;
          this.referenceList = this.formArrayData(
            response.data,
            "gatewayname",
            "internetgatewayid"
          );
        } else {
          this.igwList = [];
          this.referenceList = [];
        }
        this.loading = false;
      });
    }
  }
  getcfgList(provider) {
    this.loading = true;
    if (provider == AppConstant.CLOUDPROVIDER.AWS) {
    }
    if (provider == AppConstant.CLOUDPROVIDER.ECL2) {
      let condition = {
        status: AppConstant.STATUS.ACTIVE,
      } as any;
      if (
        this.budgetForm.value.customerid != null &&
        this.budgetForm.value.customerid != -1
      ) {
        condition.customerid = this.budgetForm.value.customerid;
      }
      this.ecl2Service.alleclcommonfngateway(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.cfgList = response.data;
          this.referenceList = this.formArrayData(
            response.data,
            "cfgatewayname",
            "cfgatewayid"
          );
        } else {
          this.cfgList = [];
          this.referenceList = [];
        }
        this.loading = false;
      });
    }
  }
  assetChanges(provider, asset) {
    this.referenceList = [];
    if (asset != "All") {
      switch (asset) {
        case "VIRTUAL_SERVER":
          this.getServerList(provider);
          break;
        case "Amazon Elastic Compute Cloud - Compute":
          this.getServerList(provider);
          break;
        case "ASSET_NETWORK":
          this.getNetworkList(provider);
          break;
        case "ASSET_LOADBALANCER":
          this.getLBList(provider);
          break;
        case "ASSET_FIREWALL":
          this.getFirewallList(provider);
          break;
        case "ASSET_VOLUME":
          this.getVolumeList(provider);
          break;
        case "ASSET_INTERNETCONNECTIVITY":
          this.getIgList(provider);
          break;
        case "ASSET_CFG":
          this.getcfgList(provider);
          break;
      }
    }
  }

  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }
  getLookupLists() {
    this.loading = true;
    let obj = { status: "Active" } as any;
    obj.keylist = [AppConstant.LOOKUPKEY.CURRENCY];
    this.commonService.allLookupValues(obj).subscribe(
      (data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.currencyList = response.data.filter(
            (x) => x.lookupkey == AppConstant.LOOKUPKEY.CURRENCY
          );
          this.currencyList = this.formArrayData(
            this.currencyList,
            "keyvalue",
            "keyvalue"
          );
        }
        this.loading = false;
      },
      (err) => {
        console.log(err);
        this.loading = false;
      }
    );
  }
  getCustomerList() {
    this.loading = true;
    this.commonService
      .allCustomers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.customerList = this.formArrayData(
            response.data,
            "customername",
            "customerid"
          );
          this.customerList.push({ label: "All", value: -1 });
        } else {
          this.customerList = [];
        }
        this.loading = false;
      });
  }

  getProviderList() {
    this.loading = true;
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = this.formArrayData(
            response.data,
            "keyname",
            "keyvalue"
          );
        } else {
          this.providerList = [];
        }
        this.loading = false;
      });
  }
  enablePreview(data) {
    this.previewData = { ...data };
    this.showPreview = true;
    this.previewText = this.showPreview
      ? AppConstant.BUTTONLABELS.REFRESH
      : AppConstant.BUTTONLABELS.SHOW;
  }

  beforeSave(data: any, saveorcreate?: boolean, notifyEvent?: boolean) {
    if (this.budgetForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessage(
        this.budgetForm,
        this.budgetErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      this.loading = false;
      return false;
    } else {
      if (new Date(data.enddt) <= new Date(data.startdt)) {
        this.message.remove();
        this.message.error("End date should be greater than start date");
        this.loading = false;
        return false;
      }
      if (
        _.isEmpty(data.cloudprovider) &&
        (data.customerid == null || -1) &&
        _.isEmpty(data.resourcetype) &&
        (data.resourceid == null || -1 || []) &&
        (data.tagid == null || -1) &&
        _.isEmpty(data.tagvalue)
      ) {
        this.message.remove();
        this.message.error(
          "Budget should be defined by Provider/Customer/Resource/Tag wise"
        );
        this.loading = false;
        return false;
      }
      // if (data.tagid != null && data.tagvalue == null) {
      //   this.message.remove();
      //   this.message.error("Please enter or select tag value");
      //   this.loading = false;
      //   return false;
      // }
      if (data.tagid == null && data.tagvalue != null) {
        this.message.remove();
        this.message.error("Please select tag");
        this.loading = false;
        return false;
      }
      if (data.resourceid && data.resourceid.length > 0) {
        data.instancerefid = [];
        data.resourceid.forEach((element) => {
          let obj: any = _.find(this.instanceList, { instanceid: element });
          if (obj) {
            data.instancerefid.push(obj.instancerefid);
          }
        });
      }
    }
    if (saveorcreate) {
      this.saveOrUpdate(data, notifyEvent);
    } else {
      this.enablePreview(data);
    }
  }
  saveOrUpdate(data, notifyEvent?: boolean) {
    this.loading = true;
    let formdata = {
      name: data.name,
      startdt: moment(data.startdt).format("YYYY-MM-DD"),
      enddt: moment(data.enddt).format("YYYY-MM-DD"),
      cloudprovider: data.cloudprovider ? data.cloudprovider : "",
      customerid: data.customerid ? data.customerid : -1,
      tenantid: this.userstoragedata.tenantid,
      resourcetype: data.resourcetype ? data.resourcetype : "",
      instancerefid:
        data.instancerefid && data.instancerefid.length > 0
          ? data.instancerefid
          : [],
      resourceid:
        data.resourceid && data.resourceid.length > 0 ? data.resourceid : [],
      tagid: data.tagid ? data.tagid : -1,
      tagvalue: data.tagvalue ? data.tagvalue : "",
      currency: data.currency,
      budgetamount: parseFloat(`${data.budgetamount}`.replace(/,/g, "")),
      notes: data.notes ? data.notes : "",
      status: data.status,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      notifications: this.getConfiguredNotifications(),
    } as any;

    if (data.accountid) {
      formdata["_accountid"] = data.accountid;
    }

    if (this.budgetObj && this.budgetObj.budgetid) {
      formdata.budgetid = this.budgetObj.budgetid;
      this.budgetService.update(formdata).subscribe((result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          setTimeout(() => {
            this.message.success("Updated Succesfully");
            if (notifyEvent == false) {
            } else {
              this.notifyBudgetEntry.emit(response);
            }
          }, 1000);
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      formdata.createdby = this.userstoragedata.fullname;
      formdata.createddt = new Date();
      this.budgetService.create(formdata).subscribe((result) => {
        this.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          setTimeout(() => {
            this.message.success("Saved Succesfully");
            if (notifyEvent == false) {
            } else {
              this.notifyBudgetEntry.emit(response);
            }
          }, 1000);
        } else {
          this.message.error(response.message);
        }
      });
    }

    this.configuredNotifications = [...this.configuredNotifications];
  }
  // deleteCost(status?) {
  //   this.costService.update({
  //     costvisualid: this.budgetList.data.costvisualid,
  //     status: status ? status : AppConstant.STATUS.DELETED
  //   }).subscribe(result => {
  //     let response = JSON.parse(result._body);
  //     if (response.status) {
  //       console.log(response);
  //     } else {
  //       this.message.info(response.message);
  //     }
  //   });
  // }
  getAccountsList(customerid?) {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    if (customerid && customerid != -1) {
      reqObj["customerid"] = customerid;
    }
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountList = this.accountList = this.formArrayData(
          response.data,
          "name",
          "id"
        );
      } else {
        this.accountList = [];
      }
    });
  }

  getUserList() {
    this.loading = true;
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.usersList = this.formArrayData(
            response.data,
            "fullname",
            "userid"
          );
          this.loading = false;
        } else {
          this.usersList = [];
          this.loading = false;
        }
      });
  }

  // Code related to Notifications tab.
  configuredNotifications: {
    duration: "Daily" | "Weekly" | "Monthly";
    mode: "EMAIL" | "SMS" | "APPLICATION";
    receivers: any[];
  }[] = [];
  notificaitonsModel = {
    duration: "Weekly",
    mode: "EMAIL",
    receivers: [],
  };

  fillNotificationTable() {
    this.configuredNotifications =
      this.budgetObj && this.budgetObj.notifications
        ? JSON.parse(this.budgetObj.notifications)
        : [];
  }
  addNotification() {
    this.configuredNotifications.push(_.clone(this.notificaitonsModel as any));
    this.resetNotificationModel();
    this.beforeSave(this.budgetForm.value, true, true);
  }
  resetNotificationModel() {
    this.notificaitonsModel = {
      duration: "Weekly",
      mode: "EMAIL",
      receivers: [],
    };
  }
  getReceiversFor(receivers: { label: string; value: number }[]): string {
    if (receivers && typeof receivers == "object" && receivers.length > 0) {
      return receivers.map((o) => o.label).join(", ");
    }
    return "-";
  }
  getConfiguredNotifications(): string {
    return JSON.stringify(this.configuredNotifications);
  }
}
