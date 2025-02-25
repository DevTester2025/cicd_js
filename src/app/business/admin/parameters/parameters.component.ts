import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ParametersService } from "./parameters.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../app.constant";
import * as _ from "lodash";
import { SolutionService } from "../../tenants/solutiontemplate/solution.service";
import { AWSService } from "../../deployments/aws/aws-service";
import { Ecl2Service } from "../../deployments/ecl2/ecl2-service";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-parameters",
  styles: [
    `
      //   .ant-form-item {
      //     margin: 0;
      // }
      .mr-1-5 {
        margin-right: 28px;
      }

      .ant-modal-body .ng-star-inserted {
        background: red;
      }

      .pa-half {
        padding: 0.1rem 0.35rem;
      }
    `,
  ],
  templateUrl:
    "../../../presentation/web/admin/parameters/parameters.component.html",
})
export class ParametersComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  @Input() hideSideNav: Boolean = false;
  @Input() tableOnly: Boolean = false;
  @Input() customQuery;

  cQuery: any;

  paramsForm: FormGroup;
  addingparam: Boolean = false;
  updatingparam: Boolean = false;
  rightbar = true;
  isVisible = false;
  parameterlist = true;
  formTitle = "";
  totalCount = 0;
  // Table Component - starts
  paramsList = [];
  paramsHeader: any[] = [];
  updateParamValue;
  searchText = null;
  tableConfig: any = {
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    refresh: true,
    loading: false,
    columnselection: true,
    apisort: true,
    pagination: false,
    manualpagination: true,
    frontpagination: false,
    count: null,
    pageSize: this.hideSideNav == false ? 10 : 5,
    scroll: { x: "1800px" },
    title: "",
    widthConfig: [
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "50px",
    ],
    tabledownload: false,
  };
  customersList = [];
  tenantList = [];
  solutionsList = [];
  scriptsList = [];
  selectedcolumns = [] as any;
  isVisibleTop = false;
  dataTypes = AppConstant.PARAM_TYPES;
  paramtype: any = "Global";
  updateParam: any = {
    status: false,
    title: "",
  };
  buttonText = "";
  userstoragedata = {} as any;
  screens = [];
  appScreens = {} as any;
  createParameter = false;
  awsSolutionsList: any[] = [];
  eclSolutionList: any[] = [];
  awsscriptsList: any[] = [];
  eclscriptList: any[] = [];
  isChangeLog = false;
  // Table Component - ends
  tabIndex = 0 as number;
  isdownload = false;
  tableHeader  =  [
    { field: "paramtype", header: "Type", datatype: "string" },
    { field: "fieldname", header: "Name", datatype: "string" },
    { field: "fieldvalue", header: "Value", datatype: "string" },
    { field: "tenant", header: "Tenant", datatype: "string" },
    { field: "template", header: "Template", datatype: "string" },
    { field: "customer", header: AppConstant.SUBTENANT, datatype: "string" },
    { field: "script", header: "Script", datatype: "string" },
    { field: "notes", header: "Notes", datatype: "string" },
    { field: "createdby", header: "Created By", datatype: "string" },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ];

  constructor(
    private fb: FormBuilder,
    private paramService: ParametersService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private solutionService: SolutionService,
    private ecl2Service: Ecl2Service,
    private awsService: AWSService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PARAMETERS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createParameter = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangeLog = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.paramService.getGlobalHeader().filter((el) => {
      return el.isdefault == true;
    });
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.paramService.getGlobalHeader();
    }
  }

  showModal(): void {
    this.isVisible = true;
    this.formTitle = "";
    this.formTitle = "Add " + this.paramtype + " Parameter";
  }
  ngOnInit() {
    this.paramsHeader = this.paramService.getGlobalHeader();
    this.paramsForm = this.fb.group({
      paramtype: [this.paramtype, Validators.required],
      fieldname: [""],
      fieldlabel: [""],
      fieldvalue: [""],
      defaultvalue: [""],
      rng_from: [null],
      rng_to: [null],
      notes: [""],
      tenantid: [
        _.isEmpty(this.userstoragedata) ? -1 : this.userstoragedata.tenantid,
      ],
      customerid: [-1],
      templateid: [-1],
      scriptid: [-1],
      status: AppConstant.STATUS.ACTIVE,
      orderno: [-1],
      datatype: "string",
      fieldoptions: "",
      fieldwidth: "",
      showinexport: "",
      showinreport: "",
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
    if (_.isEmpty(this.customQuery)) {
      this.buttonText = "Add ";
      this.formTitle = "Add ";
      this.getParams({
        paramtype: "Global",
        status: AppConstant.STATUS.ACTIVE,
      });
      this.getScripts({
        status: AppConstant.STATUS.ACTIVE,
      });
    } else {
      this.paramtype = this.customQuery.paramtype;
      if (this.customQuery.cloudprovider === AppConstant.CLOUDPROVIDER.AWS) {
        this.getInstanceDetails();
      } else if (
        this.customQuery.cloudprovider === AppConstant.CLOUDPROVIDER.ECL2
      ) {
        this.getEclInstanceDetails();
      }

      if (this.customQuery.paramtype == "Template") {
        this.getScripts({
          status: AppConstant.STATUS.ACTIVE,
        });
      }
      this.onParamTypeChange(this.customQuery.paramtype, this.customQuery);
    }
    if (this.tableOnly) {
      this.tableConfig.edit = false;
      this.tableConfig.delete = false;
      this.tableConfig.pagination = false;
    } else {
      this.getTenants();
      this.getSolutions({
        status: AppConstant.STATUS.ACTIVE,
      });
    }
  }
  rightbarChanged(val) {
    this.isVisible = val;
    this.clearForm();
  }
  clearForm() {
    this.paramsForm = this.fb.group({
      paramtype: [this.paramtype, Validators.required],
      fieldname: [""],
      fieldlabel: [""],
      fieldvalue: [""],
      defaultvalue: [""],
      rng_from: [null],
      rng_to: [null],
      notes: [""],
      tenantid: [
        _.isEmpty(this.userstoragedata) ? -1 : this.userstoragedata.tenantid,
      ],
      customerid: [-1],
      templateid: [-1],
      scriptid: [-1],
      status: AppConstant.STATUS.ACTIVE,
      orderno: [-1],
      datatype: "string",
      fieldoptions: "",
      fieldwidth: "",
      showinexport: "",
      showinreport: "",
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
  }
  ngOnChanges(changes: SimpleChanges) {}
  getEclInstanceDetails() {
    let response = {} as any;
    let query = {} as any;
    query = {
      solutionid: this.customQuery.templateid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2solution(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.eclSolutionList = response.data;
          let len = response.data.length;
          for (let i = 0; i < response.data.length; i++) {
            if (response.data[i].scriptid != undefined) {
              this.eclscriptList.push(response.data[i].scriptid);
              len--;
            } else {
              len--;
            }
            if (len == 0) {
              this.getScripts({
                scriptlist: this.eclscriptList,
                status: AppConstant.STATUS.ACTIVE,
              });
            }
          }
        } else {
          this.awsSolutionsList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getInstanceDetails() {
    let response = {} as any;
    let query = {} as any;
    query = {
      solutionid: this.customQuery.templateid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawssolutions(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.awsSolutionsList = response.data;
          let len = response.data.length;
          for (let i = 0; i < response.data.length; i++) {
            if (response.data[i].scriptid != undefined) {
              this.awsscriptsList.push(response.data[i].scriptid);
              len--;
            } else {
              len--;
            }
            if (len == 0) {
              this.getScripts({
                scriptlist: this.awsscriptsList,
                status: AppConstant.STATUS.ACTIVE,
              });
            }
          }
        } else {
          this.awsSolutionsList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  onParamTypeChange(val, cQuery?) {
    this.buttonText = "Add ";
    this.formTitle = "Add ";
    this.resetParamForm(val);
    if (!_.isEmpty(this.customQuery)) {
      if (val == this.subtenantLable) {
        this.paramsForm.patchValue({
          paramtype: val,
          customerid: this.customQuery.customerid,
        });
        this.cQuery = {
          paramtype: val,
          customerid: this.customQuery.customerid,
          status: AppConstant.STATUS.ACTIVE,
        };
        this.getParams(this.cQuery);
      } else if (val == "Template") {
        this.paramsForm.patchValue({
          paramtype: val,
          templateid: this.customQuery.templateid,
        });
        this.cQuery = {
          paramtype: val,
          templateid: this.customQuery.templateid,
          status: AppConstant.STATUS.ACTIVE,
        };
        this.getParams(this.cQuery);
      } else {
        this.paramsForm.patchValue({
          paramtype: val,
        });
        this.cQuery = { paramtype: val, status: AppConstant.STATUS.ACTIVE };
        if (val === "Script" && this.awsscriptsList.length !== 0) {
          this.cQuery.scriptlist = this.awsscriptsList;
        } else if (val === "Script" && this.eclscriptList.length !== 0) {
          this.cQuery.scriptlist = this.eclscriptList;
        }
        this.getParams(this.cQuery);
      }
    } else {
      this.paramsForm.patchValue({
        paramtype: val,
      });
      this.cQuery = { paramtype: val, status: AppConstant.STATUS.ACTIVE };
      this.getParams(this.cQuery);
    }
    switch (val) {
      case "Global":
        this.getParams({
          paramtype: "Global",
          status: AppConstant.STATUS.ACTIVE,
          headers:this.selectedcolumns
        });
        break;
      case "Tenant":
        this.paramsForm.get("tenantid").setValidators(Validators.required);
        break;
      case this.subtenantLable:
        this.paramsForm.get("customerid").setValidators([Validators.required]);
        this.getCustomers({
          tenantid: this.paramsForm.get("tenantid").value,
          status: AppConstant.STATUS.ACTIVE,
        });
        break;
      case "Template":
        this.paramsForm.get("templateid").setValidators(Validators.required);
        this.paramsForm.get("customerid").setValidators(Validators.required);
        break;
      case "Script":
        this.paramsForm.get("fieldname").setValidators(Validators.required);
        this.paramsForm.get("scriptid").setValidators(Validators.required);
        break;
      case "Variable":
        this.paramsForm.get("fieldlabel").setValidators(Validators.required);
        this.paramsForm
          .get("fieldname")
          .setValidators(Validators.pattern(new RegExp("^v_(w)*")));
        break;
    }
    this.paramsHeader = this.paramService.getGlobalHeader();
  }

  onVlaueChange(val) {}

  onTenantChange(val) {
    if (this.paramsForm.get("paramtype").value === this.subtenantLable) {
      this.getCustomers({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: val,
      });
    }
  }

  getTenants() {
    let response = {} as any;
    this.paramService.getTenants().subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.tenantList = response.data;
      } else {
        // this.message.error(response.message);
      }
    });
  }

  getCustomers(params) {
    let response = {} as any;
    params.tenantid = this.userstoragedata.tenantid;
    this.paramService.getCustomers(params).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.customersList = response.data;
      } else {
        this.customersList = [];
        // this.message.error(response.message);
      }
    });
  }

  getSolutions(params) {
    params.tenantid = this.userstoragedata.tenantid;
    let response = {} as any;
    this.solutionService.all(params).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.solutionsList = response.data;
      } else {
        // this.message.error(response.message);
      }
    });
  }

  getScripts(params) {
    let response = {} as any;
    params.tenantid = this.userstoragedata.tenantid;
    this.paramService.getScripts(params).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.scriptsList = response.data;
      } else {
        // this.message.error(response.message);
      }
    });
  }

  addParam() {
    if (this.updateParam.status) {
      this.updateParameter();
    } else {
      if (this.paramsForm.valid) {
        this.addingparam = true;
        let data = {} as any;
        for (const i in this.paramsForm.controls) {
          this.paramsForm.controls[i].markAsDirty();
          this.paramsForm.controls[i].updateValueAndValidity();
        }
        data = this.paramsForm.value;
        data.tenantid = Number(data.tenantid);
        data.customerid = Number(data.customerid);
        data.templateid = Number(data.templateid);
        console.log("Going to save field options::::::::::");
        console.log(data.fieldoptions);
        if (data.datatype == "list")
          data.fieldoptions = JSON.stringify(data.fieldoptions);
        if (data.datatype == "range")
          data.fieldoptions = [data.rng_from, data.rng_to].join(",");
        data.scriptid = Number(data.scriptid);
        data.createddt = new Date();
        data.createdby = _.isEmpty(this.userstoragedata)
          ? -1
          : this.userstoragedata.fullname;
        if (
          !_.isEmpty(this.customQuery) &&
          !_.isUndefined(this.customQuery.templateid)
        ) {
          data.templateid = this.customQuery.templateid;
        }
        this.paramService.addParams(data).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            this.addingparam = false;
            if (response.status) {
              if (this.cQuery) {
                this.getParams(this.cQuery);
              } else {
                this.getParams({
                  paramtype: this.paramsForm.get("paramtype").value,
                  status: AppConstant.STATUS.ACTIVE,
                  tenantid: this.userstoragedata.tenantid,
                });
                this.resetParamForm(this.paramsForm.get("paramtype").value);
              }
              this.message.success(response.message);
              this.clearForm();
              this.rightbar = true;
              this.isVisible = false;
            } else {
              this.message.error(response.message);
              // this.isVisible = false;
            }
          },
          (err) => {}
        );
      } else {
        this.message.error("Please fill in all the required fields");
      }
    }
  }

  getParams(options) {
    let query;
    if (this.isdownload === true) {
      options.headers = this.selectedcolumns
      query = `isdownload=${this.isdownload}`;
      console.log(options,"optionsions")
      options["headers"] = this.selectedcolumns;
    } else{
      query = `count=${true}`;
    }
    if (this.searchText != null) {
      options["searchText"] = this.searchText;
    }

    options.tenantid = this.userstoragedata.tenantid;
    this.paramsList = [];
    let response = {} as any;
    this.parameterlist = true;
    // if (!_.isEmpty(this.customQuery) && !_.isUndefined(this.customQuery.templateid)) {
    //   options.templateid = this.customQuery.templateid;
    // }
    options["tenantid"] = this.userstoragedata.tenantid;
    this.paramService.getParamsList(options, query).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableConfig.loading = false;
          var buffer = Buffer.from(response.data.rows.content.data);
          downloadService(buffer, "Parameters.xlsx");
          this.isdownload = false;
          this.parameterlist = false;
          this.getParams(options);
          return;
        }
        this.tableConfig.manualpagination = true;
        this.paramsList = response.data.rows;
        this.totalCount = response.data.count;
        this.tableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
        this.parameterlist = false;
        if (options.paramtype === "Tenant") {
          response.data.rows = _.filter(response.data.rows, function (item: any) {
              if (item.datatype == "list")
                item.fieldoptions = JSON.parse(item.fieldoptions);
              if (item.datatype == "range") {
                item.rng_from = item.fieldoptions.split(",")[0];
                item.rng_to = item.fieldoptions.split(",")[1];
              }
              if (item.datatype == "password") {
                item.fieldvalue = "*********";
              }
              if (item.fieldlabel !== AppConstant.TENANTKEYS.CLOUDDETAILS) {
                return item;
              }
          });
        }
        response.data.rows = _.filter(response.data.rows, function (item: any) {
          if (item.datatype == "list")
            item.fieldoptions = JSON.parse(item.fieldoptions);
          if (item.datatype == "range") {
            item.rng_from = item.fieldoptions.split(",")[0];
            item.rng_to = item.fieldoptions.split(",")[1];
          }
          return item;
        });
        this.generateTable(options.paramtype, response.data.rows);
      } else {
        // this.message.error(response.message);
        this.parameterlist = false;
        // this.totalCount = 0;
        this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
      }
    });
  }

  generateTable(type, tabledata, hideSearch?) {
    let dataSet: any[] = [];
    let filterList: any[] = [];
    tabledata.forEach((o) => {
      let d = o;
      d.tenant = o.tenant == null ? "ALL" : o.tenant.tenantname;
      d.template = o.template == null ? "ALL" : o.template.solutionname;
      d.customer = o.customer == null ? "ALL" : o.customer.customername;
      d.script = o.script == null ? "ALL" : o.script.scriptname;
      dataSet.push(d);
    });
    if (hideSearch) {
      this.tableConfig.globalsearch = true;
      this.tableConfig.edit = false;
      this.tableConfig.delete = false;
      this.tableConfig.pagination = false;
    }
    switch (type) {
      case "Global":
        this.paramsHeader = this.paramService.getGlobalHeader();
        this.paramsHeader[0].filterList = filterList;
        this.paramsHeader[0].filterList = filterList;
        this.tableConfig.widthConfig = [
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
        ];
        this.tableConfig.scroll = { x: "1300px" };
        this.tableConfig.loading = false;
        this.paramsList = dataSet;
        this.totalCount = this.tenantList.length;
        break;
      case "Tenant":
        this.paramsHeader = this.paramService.getTenantHeader();
        this.tableConfig.widthConfig = [
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
        ];
        this.tableConfig.scroll = { x: "500px" };
        this.tableConfig.loading = false;
        this.paramsList = dataSet;
        this.totalCount = this.paramsList.length;
        break;
      case this.subtenantLable:
        this.paramsHeader = this.paramService.getGlobalHeader();
        this.tableConfig.widthConfig = [
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
        ];
        this.tableConfig.scroll = { x: "500px" };
        this.tableConfig.loading = false;
        this.paramsList = dataSet;
        this.totalCount = this.paramsList.length;
        break;
      case "Template":
        this.paramsHeader = this.paramService.getTemplateHeader();
        this.tableConfig.widthConfig = [
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
          "25px",
        ];
        this.tableConfig.scroll = { x: "500px" };
        this.tableConfig.loading = false;
        this.paramsList = dataSet;
        this.totalCount = this.paramsList.length;
        break;
      case "Script":
        this.paramsHeader = this.paramService.getScriptHeader();
        this.tableConfig.widthConfig = [
          "25px",
          "25px",
          "25px",
          "50px",
          "25px",
          "25px",
          "25px",
        ];
        this.tableConfig.scroll = { x: "500px" };
        this.tableConfig.loading = false;
        this.paramsList = dataSet;
        this.totalCount = this.paramsList.length;
        break;
      case "Variable":
        this.paramsHeader = this.paramService.getVariableHeader();
        this.tableConfig.widthConfig = [
          "25px",
          "25px",
          "25px",
          "50px",
          "25px",
          "25px",
          "25px",
        ];
        this.tableConfig.scroll = { x: "500px" };
        this.tableConfig.loading = false;
        this.paramsList = dataSet;
        this.totalCount = this.paramsList.length;
        break;
    }
  }

  resetParamForm(type) {
    this.paramsForm = this.fb.group({
      paramtype: [type, Validators.required],
      fieldname: [""],
      fieldlabel: [""],
      fieldvalue: [""],
      rng_from: [null],
      rng_to: [null],
      defaultvalue: [""],
      notes: [""],
      tenantid: [
        _.isEmpty(this.userstoragedata) ? -1 : this.userstoragedata.tenantid,
      ],
      customerid: [-1],
      templateid: [-1],
      scriptid: [-1],
      status: AppConstant.STATUS.ACTIVE,
      orderno: [-1],
      datatype: "string",
      fieldoptions: "",
      fieldwidth: "",
      showinexport: "",
      showinreport: "",
      createdby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? ""
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    });
  }

  updateParameter() {
    this.updatingparam = true;
    let response = {} as any;
    let data = {} as any;
    data = this.paramsForm.value;
    data.customfldid = this.updateParamValue.customfldid;
    if (data.datatype == "list")
      data.fieldoptions = JSON.stringify(data.fieldoptions);
    if (data.datatype == "range")
      data.fieldoptions = [data.rng_from, data.rng_to].join(",");
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.localStorageService.getItem("user").fullname;
    data.createddt = this.updateParamValue.createddt || new Date();
    data.createdby = this.updateParamValue.createdby;
    this.paramService.updateParams(data).subscribe((res) => {
      response = JSON.parse(res._body);
      this.updatingparam = false;
      this.isVisible = false;
      if (response.status) {
        this.isVisibleTop = false;
        response.data.status === AppConstant.STATUS.DELETED
          ? this.message.success(
              "#" + response.data.customfldid + " Deleted Successfully"
            )
          : this.message.success(response.message);
        this.updateParam.status = false;
        if (this.cQuery) {
          this.getParams(this.cQuery);
        } else {
          this.getParams({
            paramtype: this.paramsForm.get("paramtype").value,
            status: AppConstant.STATUS.ACTIVE,
          });
          this.resetParamForm(this.paramtype);
        }
        this.updateParam.status = false;
      } else {
        this.message.success(response.message);
      }
    });
  }

  // Event emitted function to get the data from table
  dataChanged(data) {
    if (data.edit) {
      // this.updateParam.title = `Edit ${data.data.paramtype} Paramter`;
      this.updateParam.status = true;
      this.updateParamValue = data.data;
      this.isVisible = true;
      this.paramsForm.patchValue(data.data);
      this.formTitle = `Update`;
      this.updateParamValue.refid = this.updateParamValue.customfldid;
      this.updateParamValue.reftype = AppConstant.REFERENCETYPE[24];
    } else if (data.download) {
      this.isdownload = true;
      this.cQuery["headers"] = this.selectedcolumns;
      console.log(this.cQuery);
      this.getParams(this.cQuery);
    } else if (data.refresh) {
      this.searchText = null;
      delete this.cQuery.searchText;
      this.getParams(this.cQuery);
    } else if (data.searchText != "" && data.search) {
      this.searchText = data.searchText;
      this.getParams(this.cQuery);
    } else if (data.searchText == "") {
      this.searchText = null;
      this.getParams(this.cQuery);
    } else {
      this.updateParamValue = data.data;
      this.updateParamValue.status = AppConstant.STATUS.DELETED;
      this.paramsForm.patchValue(this.updateParamValue);
      this.updateParameter();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
