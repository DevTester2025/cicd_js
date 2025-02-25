import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { Router } from "@angular/router";
import { TenantsService } from "../../tenants.service";
import { ParametersService } from "../../../admin/parameters/parameters.service";
import { Ecl2Service } from "../../../deployments/ecl2/ecl2-service";
import { NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
import * as moment from "moment";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { DashboardConfigService } from "../dashboard-config.service";
import { NotificationService } from "src/app/business/base/global-notification.service";
import { AssetsService } from "src/app/business/base/assets/assets.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
import { DomSanitizer } from "@angular/platform-browser";
import { NzTreeNode } from "ng-zorro-antd";
import { KPIReportingService } from "../../kpireporting/kpireporting.service";
import { Data } from '../../../../interface';
import {
  ColDef,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  ICellRendererComp,
  ICellRendererParams
} from 'ag-grid-community';
import '../../../../presentation/web/styling/grid-styles/ag-grid.css';
@Component({
  selector: "app-add-edit-customer",
  templateUrl:
    "../../../../presentation/web/tenant/customers/add-edit-customer/add-edit-customer.component.html",
  styles: [
    `
      #grouptable th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }
      #grouptable td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #grouptable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      nz-select {
        width: 90%;
      }
    `,
  ],
})
export class AddEditCustomerComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() customerObj: any = {};
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  loading = false;
  formdata: any = {};
  customerForm: FormGroup;
  addingparam: Boolean = false;
  userstoragedata: any = {};
  ntfObj: any = {
    notificationid: null,
    daterange: "",
    content: "",
    implementationdt: null,
    bgcolor: "#faad14",
    textcolor: "#000000",
  };
  ntfList = [];
  selectedComponents = [];
  nodes = [];
  button = "";
  formTitle = "";
  edit = false;
  regionList: any = [];
  contractIDList: any = [];
  loadermessage = "";
  permission = "Public";
  enabledashboard = false;
  enableauth = false;
  iscomparedailyreport = false
  defaultuptime = 100;
  usersList = [];
  users = [];
  customerErrObj = {
    customername: AppConstant.VALIDATIONS.CUSTOMER.CUSTOMERNAME,
    customercode: AppConstant.VALIDATIONS.CUSTOMER.CUSTOMERCODE,
    contactemail: AppConstant.VALIDATIONS.CUSTOMER.EMAIL,
    phoneno: AppConstant.VALIDATIONS.CUSTOMER.PHONENO,
    secondaryphoneno: AppConstant.VALIDATIONS.CUSTOMER.MOBILENO,
    contactperson: AppConstant.VALIDATIONS.CUSTOMER.CONTACTPERSON,
    customeraddress: AppConstant.VALIDATIONS.CUSTOMER.ADDRESS,
    postcode: AppConstant.VALIDATIONS.CUSTOMER.POSTCODE,
    ecl2contractid: AppConstant.VALIDATIONS.CUSTOMER.CONTRACT,
  };

  groupList: any[] = [];
  dashboardConfig: any[] = [];
  tagList = [];

  attachmentFile;
  attachmentFileImage;
  attachmentUrl;
  tabIndex = 0;
  cols = [];
  isDailyReportavail: boolean = false;
  dailyreportWidgetList: any[] = [];
  tempWidgetList: any[] = [];
  selecteddailyreportWidge: any[] = [];
  isWidgetSelectionVisible = false;
  loadWidgetMapping = false;
  selectedinnerrowData;
  selectedWidgetsInstance:any[]=[];
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  public gridOptions = {
    // rowSelection: 'single',
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    suppressAggFuncInHeader: true,
    suppressRowClickSelection: true,
    onCellClicked: (event: CellClickedEvent) =>{ 
      console.log('Cell was clicked',event.data )
      if(event.data){
        // this.selectedTreeTableNodes=event.data;
        // this.treeTableSearchbox=event.data.title;
      }
    },
    onRowClicked :(event: any) =>{ 
      console.log('row was clicked' )
    },
    // groupRowRendererParams : {
    //   suppressCount: true
    // },
    getNodeChildDetails: function getNodeChildDetails(rowItem) {
      if (rowItem.children) {
        return {
          group: true,
          // open C be default
          expanded: true,
          // provide ag-Grid with the children of this group
          children: rowItem.children,
          // the key is used by the default group cellRenderer
          key: rowItem.keyname
        };
      } else {
        return null;
      }
    },
    onGridReady:  (params)=> {
      this.gridApi = params.api;
    }
  };
  public columnDefs : ColDef[] = [
    { headerName: "Daily report widgets", field: 'keyname', cellRenderer: 'agGroupCellRenderer',cellRendererParams: {
      checkbox: true,
      suppressCount: true,
      innerRenderer:this.getFileCellRenderer()
    },width: 250, },
  ];
  treeFormattedWidget:any[]=[];
  private gridApi: GridApi;
  constructor(
    private router: Router,
    private tenantsService: TenantsService,
    private ecl2Service: Ecl2Service,
    private notification: NzNotificationService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private parametersService: ParametersService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private dashboardConfigService: DashboardConfigService,
    private notificationService: NotificationService,
    private domsanitizer: DomSanitizer,
    private kpiReportingService: KPIReportingService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.CUSTOMER,
    });
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }

  ngOnInit() {
    this.clearForm();
    this.getRegionList();
    this.getAllTags();
  }
  resetDashboardConfig() {
    this.groupList = [];
    this.groupList[0] = {
      confighdrid: null,
      tenantid: this.userstoragedata.tenantid,
      customerid: null,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      tagid: null,
      tagvalue: "",
      reportyn: false,
      downtimeyn: false,
      dailyreportyn: false,
      show: false,
      uptime: null,
      dashboardconfigdetails: [],
    };
    this.cols = [
      {
        field: "sectionname",
        header: "Title",
      },
      {
        field: "tagid",
        header: "Tag",
      },
      {
        field: "tagvalue",
        header: "Value",
      },
      {
        field: "downtimeyn",
        header: "Downtime Bearing?",
      },
      {
        field: "reportyn",
        header: "Report?",
      },
      {
        field: "dailyreportyn",
        header: "Daily Report?",
      },
      {
        field: "uptime",
        header: "Uptime",
      },
    ];
    this.groupList[0].customerid = this.customerObj.customerid;
    this.getDashboardConfig();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.customerObj) &&
      !_.isEmpty(changes.customerObj.currentValue)
    ) {
      this.nodes = [
        new NzTreeNode({
          title: "Home",
          key: JSON.stringify({ key: "summary" }),
        }),
        new NzTreeNode({
          title: "Historical Data",
          key: JSON.stringify({ key: "historical_uptime" }),
          children: [
            {
              title: "Uptime",
              key: JSON.stringify({ key: "uptime" }),
            },
            {
              title: "Incidents",
              key: JSON.stringify({ key: "incidents" }),
            },
          ],
        }),
        new NzTreeNode({
          title: "KPI Reporting",
          key: JSON.stringify({ key: "reporting" }),
          children: [],
        }),
        new NzTreeNode({
          title: "Business KPI Report",
          key: JSON.stringify({ key: "businesskpireport" }),
        }),
        // new NzTreeNode({
        //   title: "Daily Report",
        //   key: JSON.stringify({ key: "dailyreport" })
        // }),
      ];
      this.getCustomerKPI();
      this.ntfObj = {
        notificationid: null,
        daterange: "",
        content: "",
        implementationdt: null,
        bgcolor: "#faad14",
        textcolor: "#808080",
      };
      this.customerObj = changes.customerObj.currentValue;
      this.customerObj.refid = this.customerObj.customerid;
      this.customerObj.reftype = "CUSTOMER";

      this.edit = true;
      this.button = AppConstant.BUTTONLABELS.UPDATE;
      this.formTitle = AppConstant.VALIDATIONS.CUSTOMER.ADD;
      this.getContractIDList();
      this.getDailyReportWidgetconfigs();
      this.generateEditForm(this.customerObj);
      if (
        this.customerObj.ecl2region != null &&
        this.customerObj.ecl2contractid != null &&
        this.customerObj.ecl2region != "" &&
        this.customerObj.ecl2contractid != ""
      ) {
        this.customerForm.controls["ecl2flag"].setValue(true);
      }
    } else {
      this.edit = false;
      this.clearForm();
      this.button = AppConstant.BUTTONLABELS.SAVE;
      this.formTitle = AppConstant.VALIDATIONS.CUSTOMER.EDIT;
    }
  }
  getCustomerKPI() {
    this.loading = true;
    let kpireports = [];
    this.kpiReportingService
      .customerkpiall({
        tenantid: this.userstoragedata.tenantid,
        _customerid: this.customerObj.customerid,
        publishyn: "Y",
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          response.data.map((e, j) => {
            if (e.kpiconfighdr) {
              if (e.kpiconfighdr.configdetail) {
                _.map(e.kpiconfighdr.configdetail, function (r, i) {
                  let obj = {
                    title: `${e.kpiconfighdr.title} - ${r.reporttype} - ${r.seriesname}`,
                    key: JSON.stringify({ id: r.id, key: "reporting" }),
                  };
                  kpireports.push(obj);
                });
              }
            }
          });
        } else {
        }
        this.nodes = [
          new NzTreeNode({
            title: "Home",
            key: JSON.stringify({ key: "summary" }),
          }),
          new NzTreeNode({
            title: "Historical Data",
            key: JSON.stringify({ key: "historical_uptime" }),
            children: [
              {
                title: "Uptime",
                key: JSON.stringify({ key: "uptime" }),
              },
              {
                title: "Incidents",
                key: JSON.stringify({ key: "incidents" }),
              },
            ],
          }),
          new NzTreeNode({
            title: "KPI Reporting",
            key: JSON.stringify({ key: "reporting" }),
            children: kpireports,
          }),
          new NzTreeNode({
            title: "Business KPI Report",
            key: JSON.stringify({ key: "businesskpireport" }),
          }),
          // new NzTreeNode({
          //   title: "Daily Report",
          //   key: JSON.stringify({ key: "dailyreport" }),
          //   children:[]
          // }),
        ];
        this.addDailyReportNodes();
        this.loading = false;
      });
  }
  generateEditForm(data) {
    this.customerForm = this.fb.group({
      customername: [
        data.customername,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      customercode: [
        data.customercode,
        Validators.compose([
          // Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ]),
      ],
      contactemail: [
        data.contactemail,
        Validators.compose([
          Validators.pattern(
            "([a-z0-9&_.-]*[@][a-z0-9]+((.[a-z]{2,3})?.[a-z]{2,3}))"
          ),
        ]),
      ],
      phoneno: [
        data.phoneno,
        Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(12),
        ]),
      ],
      secondaryphoneno: [
        data.secondaryphoneno,
        Validators.compose([
          Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),
          Validators.minLength(10),
          Validators.maxLength(12),
        ]),
      ],
      contactperson: [
        data.contactperson,
        Validators.compose([Validators.minLength(1), Validators.maxLength(30)]),
      ],
      customeraddress: [
        data.customeraddress,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      postcode: [
        data.postcode,
        Validators.compose([Validators.minLength(1), Validators.maxLength(12)]),
      ],
      ecl2flag: [false],
      ecl2contractid: [{ value: data.ecl2contractid, disabled: true }],
      admintenantid: [""],
      accesspermissionid: [""],
      status: [data.status],
    });
    this.selectedComponents = [];
    if (data.allowedusers != null) {
      let users = data.allowedusers != "" ? JSON.parse(data.allowedusers) : [];
      this.users = users;
    }
    if (data.dashboardconfig != null && data.dashboardconfig.length > 0) {
      let self = this;
      _.map(data.dashboardconfig, (item) => {
        if (item.key == "AUTHREQUIRED") {
          self.enableauth = item.value;
        }
        if (item.key == "SHOWDASHBOARD") {
          self.enabledashboard = item.value;
        }
        if (item.key == "LOGO") {
          self.attachmentUrl = item.value;
        }
        if (item.key == "COMPONENTS") {
          self.selectedComponents = item.value;
        }
        if (item.key == "COMPAREDAILYREPORT") {
          self.iscomparedailyreport = item.value;
        }
      });
    } else {
      this.enabledashboard = false;
    }
    this.checkisDailyReportavail(this.selectedComponents);
  }
  checkisDailyReportavail(selectedComponents) {
    let dailyReportavail = _.find(selectedComponents, (d: any) => {
      try {
        let p = JSON.parse(d);
        let exist = false;
        if (p.key == "dailyreport") {
          exist = true;
        }
        _.each(this.dailyreportWidgetList, (w) => {
          if (w.keyname == p.key) {
            exist = true;
          }
        })
        return exist;
      } catch (error) {
        return false;
      }
    });
    if (dailyReportavail) {
      this.isDailyReportavail = true;
    } else {
      this.isDailyReportavail = false;
    }
  }
  getDailyReportWidgetconfigs() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.DREPORT_WGT,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.dailyreportWidgetList = [];
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.dailyreportWidgetList = _.orderBy(response.data, ["displayorder","lookupid"], ["asc"]);
        this.dailyreportWidgetList = _.map(this.dailyreportWidgetList,(w)=>{
          let group="";
          try {
            let config = JSON.parse(w.keyvalue);
            if(config){
              group=config.group;
            }
          } catch (error) {
            console.error(error);
          }
          w.group=group;
          return w;
        });
        this.addDailyReportNodes();
      }
    });
  }
  addDailyReportNodes() {
    if (this.nodes.length && this.dailyreportWidgetList.length) {
      let dailyr = _.find(this.nodes, (n: any) => {
        return n.title == "dailyreport"
      });
      if (!dailyr) {
        let children = [];
        _.each(this.dailyreportWidgetList, (c) => {
          let t = {
            title: c.keyname,
            key: JSON.stringify({ key: c.keyname, lookupid: c.lookupid }),
          };
          children.push(t);
        });
        let dailyreportNode = new NzTreeNode({
          title: "Daily Report",
          key: JSON.stringify({ key: "dailyreport" }),
          children: children,
        })
        this.nodes.push(dailyreportNode);
      }
    }
    this.checkisDailyReportavail(this.selectedComponents);
  }
  clearForm() {
    this.customerForm = this.fb.group({
      customername: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      customercode: [
        null,
        Validators.compose([
          // Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ]),
      ],
      contactemail: [
        "",
        Validators.compose([
          Validators.pattern(
            "([a-z0-9&_.-]*[@][a-z0-9]+((.[a-z]{2,3})?.[a-z]{2,3}))"
          ),
        ]),
      ],
      phoneno: [
        "",
        Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(12),
        ]),
      ],
      secondaryphoneno: [
        "",
        Validators.compose([
          Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),
          Validators.minLength(10),
          Validators.maxLength(12),
        ]),
      ],
      contactperson: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(30)]),
      ],
      customeraddress: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      postcode: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(12)]),
      ],
      ecl2flag: [false],
      ecl2contractid: [""],
      admintenantid: ["57a529062f954c27af73e4c9e7701430"],
      accesspermissionid: ["ecid1000738003"],
      status: [""],
    });
    this.edit = false;
    this.customerObj = {};
  }
  getRegionList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.REGION,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.regionList = response.data;
      } else {
        this.regionList = [];
      }
    });
  }

  onFile(event) {
    const reader = new FileReader();
    this.attachmentFile = event.target.files[0];
    reader.onload = (e) => {
      this.attachmentFileImage = e.target["result"];
    };
    reader.readAsDataURL(event.target.files[0]);
    if (this.edit) {
      this.logoupload();
    }
  }

  downloadFile() {
    let response = {} as any;
    this.tenantsService
      .customerbyId(this.customerObj.customerid, `download=${true}`)
      .subscribe((result) => {
        response = JSON.parse(result._body);
        var buffer = Buffer.from(response.data.content.data);
        const TYPED_ARRAY = new Uint8Array(buffer);
        const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, "");
        let base64String = btoa(STRING_CHAR);
        this.customerObj.logo = this.domsanitizer.bypassSecurityTrustUrl(
          "data:image/jpg;base64, " + base64String
        );
        downloadService(buffer, response.data.filename);
      });
  }
  logoupload() {
    const formdata = new FormData();
    let data = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.customerid = this.customerObj.customerid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    data.filename =
      this.customerObj.customerid +
      "." +
      this.attachmentFile.name.split(".")[1];
    if (this.customerObj.dashboardconfig == null) {
      data.dashboardconfig = [
        {
          key: "AUTHREQUIRED",
          value: this.enableauth,
        },
        {
          key: "SHOWDASHBOARD",
          value: this.enabledashboard,
        },
        {
          key: "LOGO",
          value: data.filename,
        },
      ];
    } else {
      data.dashboardconfig = this.customerObj.dashboardconfig;
      let existConfigIdx = _.findIndex(data.dashboardconfig, { key: "LOGO" });
      data.dashboardconfig[existConfigIdx].value = data.filename;
    }
    if (this.attachmentFile != undefined && this.attachmentFile != null) {
      formdata.append("file", this.attachmentFile);
    } else {
      this.message.error("Please upload file");
      return false;
    }
    formdata.append("formData", JSON.stringify(data));
    this.tenantsService.updatecustomerlogo(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.edit) {
          this.message.success(response.message);
        }
      } else {
        this.message.error(response.message);
      }
    });
  }
  saveOrUpdate(data) {
    let errorMessage: any;
    if (this.customerForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.customerForm,
        this.customerErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else if (
      data.phoneno !== "" &&
      data.secondaryphoneno !== "" &&
      data.phoneno === data.secondaryphoneno
    ) {
      this.message.error("Phone No & Mobile No should be different");
    } else {
      this.loading = true;
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        customername: data.customername,
        customercode: data.customercode,
        contactemail: data.contactemail,
        phoneno: data.phoneno,
        secondaryphoneno: data.secondaryphoneno,
        contactperson: data.contactperson,
        customeraddress: data.customeraddress,
        postcode: data.postcode,
        ecl2flag: data.ecl2flag,
        ecl2contractid: data.ecl2flag === true ? data.ecl2contractid : "",
        // ecl2userid: 'ecid1000738003',
        // ecl2tenantid: '57a529062f954c27af73e4c9e7701430',
        ecl2userid: data.ecl2flag === true ? data.accesspermissionid : "",
        status:
          data.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.customerObj) &&
        !_.isUndefined(this.customerObj.customerid) &&
        !_.isEmpty(this.customerObj)
      ) {
        this.formdata.customerid = this.customerObj.customerid;
        this.formdata = _.omit(this.formdata, ["ecl2userid", "ecl2contractid"]);
        this.tenantsService.updatecustomer(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.loading = false;
          if (response.status) {
            this.message.success(response.message);
            this.notifyNewEntry.next(response.data);
          } else {
            this.notification.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
        });
      } else {
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.createddt = new Date();
        this.tenantsService.createcustomer(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            this.loading = false;
            if (response.status) {
              if (
                this.attachmentFile != null &&
                this.attachmentFile != undefined
              ) {
                this.customerObj = response.data;
                this.logoupload();
              }
              this.message.success(response.message);
              this.notifyNewEntry.next(response.data);
            } else {
              this.notification.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          },
          (err) => {
            this.loading = false;
            this.message.error("Unable to add. Try again");
          }
        );
      }
    }
  }
  onChangeEcl2Flag(event) {
    if (this.customerForm.get("ecl2flag").value) {
      this.customerForm
        .get("ecl2contractid")
        .setValidators(Validators.required);
      this.customerForm.updateValueAndValidity();
      this.getContractIDList();
    } else {
      this.customerForm.get("ecl2contractid").clearValidators();
      this.customerForm.get("ecl2contractid").setValue(null);
      this.customerForm.get("ecl2contractid").updateValueAndValidity();
      this.customerForm.updateValueAndValidity();
    }
  }
  getContractIDList() {
    this.parametersService
      .getParamsList({
        tenantid: this.userstoragedata.tenantid,
        paramtype: "Tenant",
        fieldlabel: AppConstant.TENANTKEYS.CLOUDDETAILS,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.contractIDList = [];
          if (
            this.customerForm.controls["ecl2flag"].value == true &&
            response.data[0].fieldvalue
          ) {
            JSON.parse(response.data[0].fieldvalue).forEach((element) => {
              if (element.cloudprovider === AppConstant.CLOUDPROVIDER.ECL2) {
                this.contractIDList.push(element);
              }
            });
          }
        } else {
          this.contractIDList = [];
        }
      });
  }

  dataSync() {
    this.loading = true;
    this.loadermessage = "Synchronizing your cloud details.Please wait.....";
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      region: this.customerObj.ecl2region,
      customerid: this.customerObj.customerid,
      customername: this.customerObj.customername.substring(0, 5),
      ecl2tenantid: this.customerObj.ecl2tenantid,
    };
    this.ecl2Service.datasync(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      this.loading = false;
      if (response.status) {
        this.message.success(response.message);
      } else {
        this.notification.error("Error", response.message, {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }
  openDashboard() {
    const url =
      AppConstant.DashBoradURL + `/dashboard/${this.customerObj.customerid}`;
    window.open(url);
  }
  updateCustomer(flag?) {
    let formdata = {
      customerid: this.customerObj.customerid,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      dashboardconfig: [
        {
          key: "AUTHREQUIRED",
          value: this.enableauth,
        },
        {
          key: "SHOWDASHBOARD",
          value: this.enabledashboard,
        },
        {
          key: "LOGO",
          value: this.customerObj.dashboardconfig
            ? this.customerObj.dashboardconfig[2].value
            : null,
        },
        {
          key: "COMPONENTS",
          value: this.selectedComponents,
        },
        {
          key: 'COMPAREDAILYREPORT',
          value: this.iscomparedailyreport
        },
      ],
    } as any;
    if (flag) {
      if (this.users.length <= 0) {
        this.message.error("Please select users");
        return false;
      }
      formdata = {
        customerid: this.customerObj.customerid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        allowedusers:
          this.users.length > 0 ? JSON.stringify(this.users) : undefined,
      };
    }
    this.tenantsService.updatecustomer(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        let data: any = response.data;
        if (data.dashboardconfig) {
          _.each(data.dashboardconfig, (item) => {
            if (item.key == "COMPONENTS") {
              this.checkisDailyReportavail(item.value);
            }
          })
        }
        // this.notifyNewEntry.next(response.data);
        this.message.success(response.message);
      } else {
        this.message.error(response.message);
      }
    });
  }
  addGroup() {
    this.groupList.push({
      confighdrid: null,
      sectionname: "",
      tenantid: this.userstoragedata.tenantid,
      customerid: this.customerObj.customerid,
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      tagid: null,
      tagvalue: "",
      reportyn: false,
      downtimeyn: false,
      dailyreportyn: false,
      show: false,
      uptime: null,
      dashboardconfigdetails: [],
    });
  }

  deleteGroup(index) {
    if (this.groupList[index].confighdrid != null) {
      this.dashboardConfigService
        .delete(this.groupList[index].confighdrid)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            _.remove(this.groupList, function (item, idx) {
              return index == idx;
            });
            if (this.groupList.length == 0) {
              this.addGroup();
            }
          }
        });
    } else {
      _.remove(this.groupList, function (item, idx) {
        return index == idx;
      });
      if (this.groupList.length == 0) {
        this.addGroup();
      }
    }
  }
  getDashboardConfig() {
    this.groupList = [];
    this.loading = true;
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      customerid: this.customerObj.customerid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    let query = "?include=detail";
    this.dashboardConfigService.all(reqObj, query).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.dashboardConfig = response.data;
        this.groupList = [];
        this.dashboardConfig = _.sortBy(this.dashboardConfig, ["displayorder"]);
        _.map(this.dashboardConfig, (item, idx) => {
          let obj = {
            sectionname: item.sectionname,
            confighdrid: item.confighdrid,
            tenantid: this.userstoragedata.tenantid,
            customerid: this.customerObj.customerid,
            tagid: item.tagid,
            tagvalue: item.tagvalue,
            reportyn: item.reportyn == "Y" ? true : false,
            downtimeyn: item.downtimeyn == "Y" ? true : false,
            uptime: item.uptime,
            dailyreportyn: item.dailyreportyn == "Y" ? true : false,
            status: item.status,
            lastupdatedby: this.userstoragedata.fullname,
            lastupdateddt: new Date(),
            dashboardconfigdetails: [],
          };
          item.dashboardconfigdetails = _.sortBy(item.dashboardconfigdetails, [
            "displayorder",
          ]);
          if (item.assets && item.assets.length > 0) {
            let dashboardconfigList = item.dashboardconfigdetails;
            let tagmappedAssets = item.assets;
            const results = tagmappedAssets.filter(({ resourcerefid: id1 }) => !dashboardconfigList.some(({ instancerefid: id2 }) => id2 === id1));
            if (results.length > 0) {
              item.dashboardconfigdetails = item.dashboardconfigdetails.concat(results);
            }
          }
          obj.dashboardconfigdetails = _.map(
            item.dashboardconfigdetails,
            (itm, i) => {
              let dailyreportconfig = null;
              try {
                if (itm.dailyreportconfig != null && itm.dailyreportconfig != "" && itm.dailyreportconfig != undefined) {
                  dailyreportconfig = JSON.parse(itm.dailyreportconfig);
                }
              } catch (error) {
                dailyreportconfig = null;
              }
              itm.label = itm.instances.instancename;
              itm.referenceid = itm.instances.instanceid;
              itm.instancerefid = itm.instances.instancerefid;
              itm.instancename = itm.instances.instanceancename;
              itm.confighdrid = obj.confighdrid;
              itm.displayname =
                itm.displayname == null
                  ? itm.instances.instancename
                  : itm.displayname;
              itm.uptime = itm.uptime;
              itm.reportyn = itm.reportyn == "Y" ? true : false;
              itm.downtimeyn = itm.downtimeyn == "Y" ? true : false;
              itm.dailyreportyn = itm.dailyreportyn == "Y" ? true : false;
              itm.dailyreportconfig = dailyreportconfig;
              itm.lastupdatedby = this.userstoragedata.fullname;
              itm.lastupdateddt = new Date();
              return itm;
            }
          );
          this.groupList.push(obj);
          this.loading = false;
        });
      } else {
        this.dashboardConfig = [];
        this.loading = false;
      }
    });
  }
  getAllTags() {
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.tagList = response.data;
      } else {
        this.tagList = [];
      }
    });
  }
  onTagSelect(tag?, idx?) {
    if (tag && tag.tagid != null) {
      let cndtn = {
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
        tagid: tag.tagid,
      };
      let query = "?distinct=tagvalue";
      this.tagValueService.all(cndtn, query).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.groupList[idx].tagvalue = null;
            this.groupList[idx].tagValues = response.data;
            this.groupList[idx].dashboardconfigdetails = [];
          } else {
            this.groupList[idx].tagValues = [];
          }
        },
        (err) => {
          this.message.error("Unable to get tag group. Try again");
        }
      );
    } else {
      this.groupList[idx].tagValues = [];
      this.groupList[idx].tagvalue = null;
      this.groupList[idx].dashboardconfigdetails = [];
    }
  }
  onTagValue(tag?, idx?) {
    let existTag = false;
    if (tag.tagvalue == "") {
      this.onTagSelect(tag, idx);
      this.groupList[idx].dashboardconfigdetails = [];
    } else {
      _.map(this.groupList, (item, i) => {
        if (
          i != idx &&
          item.tagid == tag.tagid &&
          item.tagvalue == tag.tagvalue &&
          item.sectionname == this.groupList[idx].sectionname
        ) {
          existTag = true;
        }
      });
      if (this.groupList.length > 0 && existTag) {
        this.message.error("Tag duplicate found");
        this.groupList[idx].tagvalue = null;
        return;
      }
      let cndtn = {
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
        tagid: tag.tagid,
        tagvalue: tag.tagvalue,
        resourcetype: "ASSET_INSTANCE",
      };
      let query =
        "?include=assetmapping&customerid=" + this.customerObj.customerid;
      this.tagValueService.all(cndtn, query).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.groupList[idx].reportyn = true;
            this.groupList[idx].downtimeyn = false;
            this.groupList[idx].uptime = this.defaultuptime;
            this.groupList[idx].dashboardconfigdetails = _.map(
              response.data,
              (itm) => {
                itm.confighdrid = this.groupList[idx].confighdrid;
                itm.reportyn = true;
                itm.downtimeyn = false;
                itm.dailyreportyn = false;
                itm.uptime = this.defaultuptime;
                itm.label = itm.instances.instancename;
                itm.displayname = itm.instances.instancename;
                itm.referenceid = itm.instances.instanceid;
                itm.instancerefid = itm.instances.instancerefid;
                itm.instancename = itm.instances.instancename;
                itm.customerid = this.customerObj.customerid;
                return itm;
              }
            );
          } else {
            this.groupList[idx].dashboardconfigdetails = [];
          }
        },
        (err) => {
          this.message.error("Unable to get tag group. Try again");
        }
      );
    }
  }

  saveDashboardConfig(idx) {
    if (
      this.groupList[idx].tagid == null ||
      this.groupList[idx].tagvalue == null
    ) {
      this.message.error("Please select tag and value");
      return;
    }
    let instancereport: any = _.find(
      this.groupList[idx].dashboardconfigdetails,
      {
        reportyn: true,
      }
    );
    // if (instancereport == undefined) {
    //   this.message.error("Atleast one instance should be reported");
    //   return;
    // }
    if (
      this.groupList.length == 1 &&
      instancereport != undefined &&
      instancereport.uptime == ""
    ) {
      this.message.error("Please enter uptime");
      return;
    }
    this.loading = true;
    let formdata = {} as any;
    formdata = _.clone(this.groupList[idx]);
    formdata.displayorder = idx + 1;
    formdata.reportyn = this.groupList[idx].reportyn ? "Y" : "N";
    formdata.downtimeyn = this.groupList[idx].downtimeyn ? "Y" : "N";
    formdata.dailyreportyn = this.groupList[idx].dailyreportyn ? "Y" : "N";
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.lastupdateddt = new Date();
    formdata.uptime =
      formdata.uptime != null && formdata.uptime != "" ? formdata.uptime : null;
    let details: any[] = [];
    _.each(formdata.dashboardconfigdetails, (itm, i) => {
      let dailyreportconfig = null;
      if (_.isArray(itm.dailyreportconfig)) {
        dailyreportconfig = JSON.stringify(itm.dailyreportconfig);
      }
      let obj = {} as any;
      if (itm.confighdrid) obj.confighdrid = itm.confighdrid;
      if (itm.configdtlid) obj.configdtlid = itm.configdtlid;
      obj.tenantid = this.userstoragedata.tenantid;
      obj.displayorder = i + 1;
      obj.customerid = this.groupList[idx].customerid;
      obj.referenceid = itm.referenceid;
      obj.instancerefid = itm.instancerefid;
      obj.instancename = itm.instancename;
      obj.displayname = itm.displayname;
      obj.uptime = itm.uptime != null && itm.uptime != "" ? itm.uptime : null;
      obj.status = AppConstant.STATUS.ACTIVE;
      obj.lastupdatedby = this.userstoragedata.fullname;
      obj.lastupdateddt = new Date();
      obj.reportyn = itm.reportyn ? "Y" : "N";
      obj.downtimeyn = itm.downtimeyn ? "Y" : "N";
      obj.dailyreportyn = itm.dailyreportyn ? "Y" : "N";
      obj.dailyreportconfig = dailyreportconfig;
      details.push(obj);
    });
    let reqObj = { grouplist: formdata };
    reqObj.grouplist.dashboardconfigdetails = details;
    delete reqObj.grouplist.deletedconfigdetails;
    if (this.groupList[idx].confighdrid == null) {
      this.dashboardConfigService.create(reqObj).subscribe((result) => {
        let response = JSON.parse(result._body);
        this.loading = false;
        if (response.status) {
          this.resetDashboardConfig();
          this.message.success(response.message);
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      this.dashboardConfigService.update(reqObj).subscribe((result) => {
        let response = JSON.parse(result._body);
        this.loading = false;
        if (response.status) {
          this.message.success(response.message);
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  onReportSelect(event, i, flag?) {
    this.groupList[i].dashboardconfigdetails.map((i) => {
      switch (flag) {
        case 'downtimeyn':
          i.downtimeyn = event == true ? true : false;
          break;
        case 'reportyn':
          i.reportyn = event == true ? true : false;
          break;
        case 'dailyreportyn':
          i.dailyreportyn = event == true ? true : false;
          break;
        default:
          break;
      }
    });
    this.groupList[i].dashboardconfigdetails = [
      ...this.groupList[i].dashboardconfigdetails,
    ];
  }
  onEnterUptime(event, i, t) {
    if (event == "" || event == null || (event > 0 && event < 100.1)) {
      this.groupList[i].dashboardconfigdetails.map((i) => {
        i.uptime = event;
      });
    }
  }
  addNotification() {
    let reqObj: any = {
      title: "Customer Notifications",
      customerid: this.customerObj.customerid,
      tenantid: this.userstoragedata.tenantid,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      content: this.ntfObj.content,
      implementationdt: moment(this.ntfObj.implementationdt).format(
        "YYYY-MM-DD HH:mm"
      ),
      ntfstartdate: moment(this.ntfObj.daterange[0]).format("YYYY-MM-DD HH:mm"),
      ntfenddate: moment(this.ntfObj.daterange[1]).format("YYYY-MM-DD HH:mm"),
      bgcolor: this.ntfObj.bgcolor,
      textcolor: this.ntfObj.textcolor,
    };
    if (this.ntfObj.notificationid != null) {
      reqObj.notificationid = this.ntfObj.notificationid;
      this.notificationService.updateUser(reqObj).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getNtfList();
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      reqObj.createddt = new Date();
      reqObj.createdby = this.userstoragedata.fullname;
      this.notificationService.createUser(reqObj).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.message.success(response.message);
          this.getNtfList();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  getNtfList() {
    let reqObj: any = {
      customerid: this.customerObj.customerid,
      tenantid: this.userstoragedata.tenantid,
    };
    this.notificationService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);

      if (response.status) {
        this.ntfList = response.data;
      } else {
        this.ntfList = [];
      }
    });
  }
  deleteNtf(data, i) {
    let reqObj: any = {
      customerid: this.customerObj.customerid,
      tenantid: this.userstoragedata.tenantid,
      notificationid: data.notificationid,
      status: "Deleted",
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    this.notificationService.updateUser(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);

      if (response.status) {
        this.message.success(response.message);
        this.getNtfList();
      } else {
        this.message.error(response.message);
      }
    });
  }

  editNtf(ntfObj) {
    this.ntfObj = ntfObj;
    this.ntfObj.daterange = [this.ntfObj.ntfstartdate, this.ntfObj.ntfenddate];
  }

  onTabChange(e) {
    this.tabIndex = e.index;
    if (this.tabIndex == 1) {
      this.resetDashboardConfig();
      this.getAllUsers();
    }
    if (this.tabIndex == 5) {
      this.getNtfList();
    }
  }
  saveReorderedDetails(event, index) {
    let configdetails = [];
    if (event.dragIndex > event.dropIndex) {
      let rowindex = event.dropIndex;
      for (let i = event.dropIndex; i <= event.dragIndex; i++) {
        if (
          this.groupList[index].dashboardconfigdetails[rowindex].configdtlid
        ) {
          let obj = {
            configdtlid:
              this.groupList[index].dashboardconfigdetails[rowindex]
                .configdtlid,
            displayorder: rowindex + 1,
            lastupdateddt: new Date(),
            lastupdatedby: this.userstoragedata.fullname,
          };
          configdetails.push(obj);
        }

        rowindex = rowindex + 1;
      }
    }
    if (event.dropIndex > event.dragIndex) {
      let rowindex = event.dragIndex;
      for (let i = event.dragIndex; i < event.dropIndex; i++) {
        if (
          this.groupList[index].dashboardconfigdetails[rowindex].configdtlid
        ) {
          let obj = {
            configdtlid:
              this.groupList[index].dashboardconfigdetails[rowindex]
                .configdtlid,
            displayorder: rowindex + 1,
            lastupdateddt: new Date(),
            lastupdatedby: this.userstoragedata.fullname,
          };
          configdetails.push(obj);
        }
        rowindex = rowindex + 1;
      }
    }
    if (configdetails.length > 0) {
      this.dashboardConfigService
        .bulkupdatedetails({
          configdetail: configdetails,
        })
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
    }
  }

  savereorderedheader(event) {
    let configheader = [];

    let minIndex =
      event.dragIndex > event.dropIndex ? event.dropIndex : event.dragIndex;
    let maxIndex =
      event.dragIndex > event.dropIndex ? event.dragIndex : event.dropIndex;
    let rowindex = minIndex;
    for (
      let i = minIndex;
      event.dragIndex > event.dropIndex ? i <= maxIndex : i < maxIndex;
      i++
    ) {
      if (this.groupList[rowindex].confighdrid) {
        let obj = {
          confighdrid: this.groupList[rowindex].confighdrid,
          displayorder: rowindex + 1,
          lastupdateddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
        };
        configheader.push(obj);
      }

      rowindex = rowindex + 1;
    }
    if (configheader.length > 0) {
      this.dashboardConfigService
        .bulkupdate({
          grouplist: configheader,
        })
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
    }
  }
  onExpandChange(e) {
    console.log("expand", e);
  }

  getAllUsers() {
    let attributes = JSON.stringify(["userid", "email", "fullname"]);
    this.commonService
      .allUsers(
        { status: "Active", tenantid: this.userstoragedata.tenantid },
        `?attributes=${attributes}`
      )
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.usersList = response.data;
        } else {
          this.usersList = [];
        }
      });
  }
  CheckGroupWidget() {

  }
  viewWidgetDetails(rowData, innerrowData) {
    this.selectedinnerrowData = innerrowData;
    this.tempWidgetList = [];
    this.treeFormattedWidget=[];
    this.selectedWidgetsInstance=null;
    this.tempWidgetList = _.map(_.cloneDeep(this.dailyreportWidgetList), (w: any) => {
      w.isEnabled = false;
      return w;
    });
    this.tempWidgetList = [..._.orderBy(this.tempWidgetList, ["displayorder","lookupid","asc"])];
    this.treeFormattedWidget=this.gettreeFormattedWidget(this.tempWidgetList);
    let all = false;
    if (rowData.dailyreportyn == false) {
      if (_.isArray(rowData.dashboardconfigdetails)) {
        rowData.dashboardconfigdetails = _.map(rowData.dashboardconfigdetails, (r) => {
          r.dailyreportconfig = null;
          return r;
        })
      }
    }
    else {

      // if(!innerrowData.dailyreportconfig){
      //   _.each(this.selectedComponents,(d:any)=>{
      //     try {
      //       let p=JSON.parse(d);
      //       let exist=false;
      //       if(p.key == "dailyreport"){
      //         all = true;
      //         innerrowData.dailyreportconfig=[];
      //         _.each(this.dailyreportWidgetList,(w)=>{
      //           let widget={ key: w.keyname,lookupid : w.lookupid };
      //           innerrowData.dailyreportconfig.push(widget);
      //         });
      //       }
      //       _.each(this.dailyreportWidgetList,(w)=>{
      //         if(w.keyname == p.key){
      //           let widget={ key: w.keyname,lookupid : w.lookupid };
      //         innerrowData.dailyreportconfig.push(widget);
      //         }
      //       })
      //     } catch (error) {
      //     }
      //   });
      // }
      if (_.isArray(innerrowData.dailyreportconfig)) {
        _.each(innerrowData.dailyreportconfig, (dc) => {
          this.tempWidgetList = _.map(this.tempWidgetList, (wl: any) => {
            if (wl.keyname == dc.key) {
              wl.isEnabled = true;
            }
            return wl;
          });
        });
      }
      else {
        this.tempWidgetList = _.map(_.cloneDeep(this.dailyreportWidgetList), (w: any) => {
          w.isEnabled = true;
          return w;
        });
      }
    }
    this.isWidgetSelectionVisible = true;
  }
  gettreeFormattedWidget(widgets:any[]){
    let groupkeys=_.groupBy(widgets,'group');
    let formattedTree:any[] = [];
    Object.keys(groupkeys).forEach(function(key) {
      let children = _.map(groupkeys[key],(c)=>{
        c.isLeaf=true;
        return c;
      });
      let g={
        keyname : key,
        isLeaf : false,
        children:children
      }
      formattedTree.push(g);
    });
    return formattedTree;
  }
  onFirstDataRendered(params: any) {
    if(params){
      const nodesToSelect = [];
    params.api.forEachNode((node) => {
      if (node.data) {
        if(node.data.isEnabled){
          node.setSelected(true);
          // nodesToSelect.push(node);
        }
      }
    });
      params.api.sizeColumnsToFit();
    }
  }
  onTreeSelectionChanged(event){
    console.log(this.gridApi.getSelectedRows());
    this.selectedWidgetsInstance=this.gridApi.getSelectedRows();
  }
  onGridClick(event){
    const selectedRows = this.gridApi.getSelectedRows();
    
    console.log(selectedRows);
  }
  onGridReady (params) {
    this.gridApi = params.api;
  }
  getFileCellRenderer() {
    class FileCellRenderer implements ICellRendererComp {
      eGui: any;
      init(params: ICellRendererParams) {
        var tempDiv = document.createElement('div');
        var value = params.value;
        var icon = 'fa fa-folder';
        tempDiv.innerHTML = value;
        // tempDiv.innerHTML = icon
        //   ? '<span><i class="' +
        //     icon +
        //     '"></i>' +
        //     '<span class="filename"></span>' +
        //     value +
        //     '</span>'
        //   : value;
        this.eGui = tempDiv.firstChild;
      }
      getGui() {
        return this.eGui;
      }
      refresh() {
        return false;
      }
    }
    return FileCellRenderer;
  }
  
  onChangedWidgetselection(event) {
    this.isWidgetSelectionVisible = false;
  }
  saveMapwidget() {
    this.selectedinnerrowData.dailyreportconfig = [];
    // _.each(this.tempWidgetList, (w) => {
    //   if (w.isEnabled) {
    //     let widget = { key: w.keyname, lookupid: w.lookupid };
    //     this.selectedinnerrowData.dailyreportconfig.push(widget);
    //   }
    // });
    if(this.selectedWidgetsInstance){
      _.each(this.selectedWidgetsInstance,(w)=> {
        if(w.lookupid){
          let widget = { key: w.keyname, lookupid: w.lookupid };
          this.selectedinnerrowData.dailyreportconfig.push(widget);
        }
      });
    }
    this.isWidgetSelectionVisible = false;
  }
}