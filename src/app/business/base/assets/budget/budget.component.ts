import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import * as _ from "lodash";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { NzMessageService, NzDropdownService } from "ng-zorro-antd";
import { Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { BudgetService } from "./budget.service";
import { CustomerAccountService } from "src/app/business/tenants/customers/customer-account.service";
import * as Papa from "papaparse";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-budget",
  templateUrl:
    "../../../../presentation/web/base/assets/budget/budget.component.html",
})
export class BudgetComponent implements OnInit {
  budgetObj = {} as any;
  screens = [];
  appScreens = {} as any;
  createbudget = false;
  isVisible = false;
  awsZoneList: any = [];
  nttZoneList: any = [];
  providerList: any = [];
  showSidebar = false;
  isGroupHierarchyVisible = false;
  loading = true;
  downloadflag = false
  userstoragedata = {} as any;
  folderName = "";

  tableHeader = [
    {
      field: "name",
      header: "Name",
      datatype: "string",
      width: "10%",
      isdefault: true,
    },
    {
      field: "startdt",
      header: "Start Dt.",
      datatype: "timestamp",
      format: "dd-MMM-yyyy",
      width: "10%",
      isdefault: true,
    },
    {
      field: "enddt",
      header: "End Dt.",
      datatype: "timestamp",
      format: "dd-MMM-yyyy",
      width: "10%",
      isdefault: true,
    },
    {
      field: "cloudprovider",
      header: "Provider",
      datatype: "string",
      width: "10%",
      isdefault: true,
    },
    {
      field: "customername",
      header: "Customer ID",
      datatype: "string",
      width: "10%",
      isdefault: true,
    },
    // {
    //   field: "accountname",
    //   header: "Account ID",
    //   datatype: "string",
    //   width: "10%",
    // },
    // {
    //   field: "assettype",
    //   header: "Resource Type",
    //   datatype: "string",
    //   width: "10%",
    // },
    {
      field: "budgetamount",
      header: "Budget",
      datatype: "currency",
      width: "10%",
      format: "currency",
      isdefault: true,
    },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      width: "10%",
      isdefault: true,
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "12%",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ] as any;

  tableConfig = {
    refresh: true,  //#OP_B632
    edit: false,
    delete: false,
    download: false,//#OP_T620
    globalsearch: true,
    loading: false,
    columnselection: true,
    apisort: true,
    pagination: true,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  assetTypes: any = [];
  filters = { provider: null, customer: null, asset: null } as any;
  budgetList = [];
  zoneList = [];
  selectedcolumns = [] as any;
  customerList: any = [];
  instanceList: any = [];
  accountList: any = [];
  formTitle = "Add Budget";
  showView = false;
  isdownload = false;
  structureId;
  savingStructure = false;
  totalCount = null;
  constructor(
    public router: Router,
    private httpService: HttpHandlerService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private nzDropdownService: NzDropdownService,
    private commonService: CommonService,
    private budgetService: BudgetService,
    private customerAccService: CustomerAccountService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.BUDGET,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createbudget = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.tableConfig.view = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
    //#OP_T620
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.download = true;
      this.downloadflag = true;
    }
    this.getProviderList();
    this.getCustomerList();
    this.getAccountsList();
    this.getServerList();
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }

  }

  ngOnInit() {
    this.getAllBudgets();
  }
  providerChanges(event) {
    this.filters.asset = null;
    if (event == AppConstant.CLOUDPROVIDER.AWS) {
      this.assetTypes = AppConstant.AWS_BILLING_RESOURCETYPES;
    }
    if (event == AppConstant.CLOUDPROVIDER.ECL2) {
      this.assetTypes = AppConstant.ECL2_BILLING_RESOURCETYPES;
    }
  }
  getServerList() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.filters.provider) {
      condition.cloudprovider = this.filters.provider;
    }
    this.commonService.allInstances(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = response.data;
      } else {
        this.instanceList = [];
      }
    });
  }
  getProviderList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
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
      });
  }
  getCustomerList() {
    this.commonService
      .allCustomers({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.customerList = this.formArrayData(
            response.data,
            "customername",
            "customerid"
          );
        } else {
          this.customerList = [];
        }
      });
  }
  getAccountsList(customerid?) {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    if (customerid) {
      reqObj[customerid] = customerid;
    }
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountList = this.formArrayData(response.data, "name", "id");
      } else {
        this.accountList = [];
      }
    });
  }
  dataChanged(d) {
    if (d.edit) {
      this.formTitle = "Update Budget";
      this.budgetObj = d;
      this.showSidebar = true;
    }
    if (d.view) {
      this.formTitle = "Budget vs Actual";
      this.budgetObj = d;
      if (
        this.budgetObj.data.resourceid &&
        this.budgetObj.data.resourceid.length > 0
      ) {
        let instancenames: any = [];
        let instanceList: any = [];
        this.budgetObj.data.resourceid.forEach((element) => {
          let obj: any = _.find(this.instanceList, { instanceid: element });
          if (obj != undefined) {
            instanceList.push({
              label: obj.instancename,
              instanceid: obj.instanceid,
              value: obj.instancerefid,
            });
            instancenames.push(obj.instancerefid);
          }
          this.budgetObj.data.instancenames = instancenames;
          this.budgetObj.data.instanceList = instanceList;
        });
      }

      this.showView = true;
    }
    if (d.download) {
      const data: {
        instancerefid: any[];
        resourceid: any[];
        budgetid: number;
        startdt: Date;
        enddt: Date;
        cloudprovider: string;
        customerid: number;
        _accountid: null;
        tenantid: number;
        resourcetype: string;
        tagid: number;
        tagvalue: string;
        currency: string;
        budgetamount: number;
        notes: string;
        status: string;
        createdby: string;
        createddt: Date;
        lastupdatedby: string;
        lastupdateddt: Date;
        customer: null;
        account: null;
        tag: null;
        customername: string;
        accountname: string;
      } = d.data;

      this.downloadBudgetReport({
        startdt: data.startdt,
        enddt: data.enddt,
        cloudprovider: data.cloudprovider,
        tenantid: data.tenantid,
        budgetvalue: data.budgetamount,
      });
    }
    if (d.delete) {
      // this.budgetObj = d.data;
      this.deleteBudget(d.data);
    }
    //#OP_B632
    if (d.refresh) {
      this.getAllBudgets();
    }
    if(d.search){
      this.totalCount = d.totalCount;
    }
  }
  download(){
    this.isdownload = true;
    this.getAllBudgets();
  }
  deleteBudget(data) {
    let condition = {
      budgetid: data.budgetid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.budgetService.update(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.message.success("Deleted Successfully");
        this.getAllBudgets();
      } else {
        this.message.info(response.message);
      }
    });
  }
  notifyBudgetEntry(val: boolean) {
    if (val) {
      this.showSidebar = false;
      // if (this.filters.provider && this.filters.zone && this.filters.asset) {
      this.getAllBudgets();
      // }
    }
  }
  showAddForm() {
    this.showSidebar = true;
    this.formTitle = "Add Budget";
    this.budgetObj = {};
  }
  onChanged(val) {
    this.showSidebar = val;
    this.showView = val;
    this.budgetObj = {};
  }
  getAllBudgets() {
    this.loading = true;
    let obj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.filters) {
      if (this.filters.provider) {
        obj.cloudprovider = this.filters.provider;
      }
      if (this.filters.customer) {
        obj.customerid = this.filters.customer;
      }
      if (this.filters.asset) {
        obj.resourcetype = this.filters.asset;
      }
      if (this.filters.accountid) {
        obj._accountid = this.filters.accountid;
      }
      // if (this.filters.startdt) {
      //   obj.startdt = moment(this.filters.startdt).format('YYYY-MM-DD');
      // }
      // if (this.filters.enddt) {
      //   obj.enddt = moment(this.filters.enddt).format('YYYY-MM-DD');
      // }
    }
    let query;
    if (this.isdownload === true) {
      query = `?isdownload=${this.isdownload}`;
      obj["headers"] = this.selectedcolumns;
    }

    this.isVisible = true;
    this.budgetService.list(obj,query).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          if (this.isdownload) {
            this.loading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Budget.xlsx"
            );
            this.isdownload = false;
          }
  
          this.budgetList = response.data;
          this.budgetList.forEach((x) => {
            x.customername = "";
            x.assettype = this.commonService.formatResourceType(
              x.resourcetype,
              x.cloudprovider
            );
            // find customer details
            // let self = this;
            // if (x.customerid.length > 0) {
            //   _.map(x.customerid, function(item) {
            //     let customerObj: any = _.find(self.customerList, {
            //       value: item
            //     });
            //     if (x.customername == "") {
            //       x.customername = customerObj ? customerObj.label : "";
            //     } else {
            //       x.customername = _.concat(
            //         x.customername,
            //         customerObj ? customerObj.label : ""
            //       );
            //     }
            //     return item;
            //   });
            // }
            x.customername = x.customer ? x.customer.customername : "All";
            x.accountname = x.account ? x.account.name : "All";
            return x;
          });
          this.totalCount = this.budgetList.length;
          this.loading = false;
        } else {
          this.loading = false;
          this.budgetList = [];
          this.totalCount = 0;
        }
      },
      (err) => {
        console.log(err);
        this.isVisible = false;
      }
    );
    this.isVisible = false;
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
  downloadBudgetReport(data: {
    startdt: Date;
    enddt: Date;
    tenantid: number;
    cloudprovider: string;
    budgetvalue: number;
  }) {
    this.loading = true;
    this.budgetService.downloadbudget(data).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response) {
        var csv = Papa.unparse(response);

        var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        var csvURL = null;
        csvURL = window.URL.createObjectURL(csvData);

        const tempLink = document.createElement("a");
        tempLink.href = csvURL;
        tempLink.setAttribute("download", "download.csv");
        tempLink.click();
        this.loading = false;
      } else {
        this.loading = false;
        console.log("Err getting CSV DATA");
        console.log(response);
      }
    });
  }
}
