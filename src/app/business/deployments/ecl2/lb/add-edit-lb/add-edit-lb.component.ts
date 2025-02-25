import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AppConstant } from "../../../../../app.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { SolutionService } from "../../../../tenants/solutiontemplate/solution.service";
import { Ecl2Service } from "../../ecl2-service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-lb",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/lb/add-edit-lb/add-edit-lb.component.html",
})
export class ECL2AddEditLbComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  // Standalone
  @Input() tagsOnly: boolean; // If true only tags can be added / edited.
  @Input() lbid: string;
  @Input() mode: string;

  @Input() solutionObj: any;
  @Input() assetData: any;
  @Input() loadbalancerAddObj: any;
  @Output() continue: EventEmitter<any> = new EventEmitter();
  ecl2lbForm: FormGroup;
  gettingLoadbalancer = false;
  selectedIndex = 0;
  addTenant: any = false;
  loadbalancer: any;
  assignlb = [];
  servicegroupname = "";
  virtualservername = "";
  ecl2instancesList = [];
  lbPlanList: any = [];
  userstoragedata = {} as any;
  reponseDetails: any = {};
  lbIPObj: any = {};
  tabdisabled = true;
  lbList: any[] = [];
  formdata: any = {};
  lbObj: any = {};
  zoneList: any = [];
  loading = false;
  disabled = false;
  solutionbased = false;
  lbbased = false;
  ecl2zoneList: any = [];
  buttonText = AppConstant.VALIDATIONS.SAVE;
  lbplanedit: any = false;
  lbInterfaceObj: any = {};
  lbVRRPObj: any = {};
  interfaceList: any = [];
  availablesubnetList: any = [];
  syslogserverList: any = [];
  isVisible = false;
  formTitle = "Attach Network";
  lbSyslogObj: any = {};
  lbsyslogVisible = false;
  modal: any;
  ecl2NetworkObj: any = {};
  loadbalancerList: any = [];
  customerList: any = [];
  ecl2lbErrObj = {
    zoneid: AppConstant.VALIDATIONS.ECL2.COMMONFNGATEWAY.ZONE,
    customerid: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
    loadbalancerplanid: AppConstant.VALIDATIONS.ECL2.LB.LBPLAN,
    description: AppConstant.VALIDATIONS.ECL2.LB.DESCRIPTION,
  };
  ecl2lbSettingsErrObj = AppConstant.VALIDATIONS.ECL2.LB.SETTINGS.SERVICEGROUP;
  index: any;
  // Service Group
  monitorconnectionList = [];
  autoscalemodeList = [];
  traficdomainList = [];
  cachetypeList = [];
  protocolList = [];
  lbipList = [];
  lbmethodList = [];
  backuplbmethodList = [];
  lbsrvrequnitmethodList = [];
  monitorbindList = [];
  lbservicegpForm: FormGroup;
  lbserverForm: FormGroup;
  lbvserverForm: FormGroup;
  lbvservermethodForm: FormGroup;
  lbvsgmemberForm: FormGroup;
  lbvsgmonitorForm: FormGroup;
  panels = [
    {
      active: false,
      disabled: false,
      name: "Additional Parameters",
      childPannel: [
        {
          active: false,
          disabled: true,
          name: "Additional Parameters",
        },
      ],
    },
  ];

  // Tag Picker related
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  tagPickerVisible = false;
  tags = [];
  tagsClone = [];
  tagsList = [];

  constructor(
    private messageService: NzMessageService,
    private lsService: LocalStorageService,
    private fb: FormBuilder,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private httpService: HttpHandlerService,
    private commonService: CommonService,
    private solutionService: SolutionService,
    private ecl2Service: Ecl2Service,
    private notificationService: NzNotificationService
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.clearForm();
  }

  ngOnInit() {
    this.getecl2ZoneList();
    this.getLookups();
    if (this.assetData) {
      this.addTenant = true;
    }
  }
  getLookups() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        keylist: [
          "CITRIX_SG_MONITBIND",
          "CITRIX_VS_LB_METHOD",
          "CITRIX_VS_LB_BKUP",
          "CITRIX_VS_LB_SR",
          "CITRIX_SG_PROTOCOL",
          "CITRIX_VS_LB_IPTYPE",
          "CITRIX_SG_CACHETYPE",
          "CITRIX_SG_AUTOSCALE",
          "CITRIX_SG_MONITCONN",
        ],
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            let len = response.data.length;
            for (let i = 0; i < response.data.length; i++) {
              let item = response.data[i];
              if (item.lookupkey === "CITRIX_SG_PROTOCOL") {
                this.protocolList.push(item);
              }
              if (item.lookupkey === "CITRIX_SG_CACHETYPE") {
                this.cachetypeList.push(item);
              }
              if (item.lookupkey === "CITRIX_SG_AUTOSCALE") {
                this.autoscalemodeList.push(item);
              }
              if (item.lookupkey === "CITRIX_SG_MONITCONN") {
                this.monitorconnectionList.push(item);
              }
              if (item.lookupkey === "CITRIX_VS_LB_IPTYPE") {
                this.lbipList.push(item);
              }
              if (item.lookupkey === "CITRIX_VS_LB_SR") {
                this.lbsrvrequnitmethodList.push(item);
              }
              if (item.lookupkey === "CITRIX_VS_LB_BKUP") {
                this.backuplbmethodList.push(item);
              }
              if (item.lookupkey === "CITRIX_VS_LB_METHOD") {
                this.lbmethodList.push(item);
              }
              if (item.lookupkey === "CITRIX_SG_MONITBIND") {
                this.monitorbindList.push(item);
              }
              len--;
              if (len === 0) {
                let default_protocol = {} as any;
                default_protocol = _.find(this.protocolList, function (itm) {
                  if (itm.defaultvalue === "Y") {
                    return itm;
                  }
                });
                let default_monitorbind = {} as any;
                default_monitorbind = _.find(
                  this.monitorbindList,
                  function (itm) {
                    if (itm.defaultvalue === "Y") {
                      return itm;
                    }
                  }
                );
                let default_lbmethod = {} as any;
                default_lbmethod = _.find(this.lbmethodList, function (itm) {
                  if (itm.defaultvalue === "Y") {
                    return itm;
                  }
                });
                let default_cachetype = {} as any;
                default_cachetype = _.find(this.cachetypeList, function (itm) {
                  if (itm.defaultvalue === "Y") {
                    return itm;
                  }
                });

                let default_monitorconnection = {} as any;
                default_monitorconnection = _.find(
                  this.monitorconnectionList,
                  function (itm) {
                    if (itm.defaultvalue === "Y") {
                      return itm;
                    }
                  }
                );

                let default_backuplbmethod = {} as any;
                default_backuplbmethod = _.find(
                  this.backuplbmethodList,
                  function (itm) {
                    if (itm.defaultvalue === "Y") {
                      return itm;
                    }
                  }
                );

                let default_requnit = {} as any;
                default_requnit = _.find(
                  this.lbsrvrequnitmethodList,
                  function (itm) {
                    if (itm.defaultvalue === "Y") {
                      return itm;
                    }
                  }
                );
                // Service Group Defaults
                this.lbservicegpForm.controls["servicetype"].setValue(
                  default_protocol
                );
                this.lbvserverForm.controls["servicetype"].setValue(
                  default_protocol
                );
                this.lbservicegpForm.controls["cachetype"].setValue(
                  default_cachetype
                );
                this.lbservicegpForm.controls["monconnectionclose"].setValue(
                  default_monitorconnection
                );

                this.lbvsgmonitorForm.controls["monitor_name"].setValue(
                  default_monitorbind
                );
                this.lbvservermethodForm.controls["lbmethod"].setValue(
                  default_lbmethod
                );
                this.lbvservermethodForm.controls["backuplbmethod"].setValue(
                  default_backuplbmethod
                );
                this.lbvservermethodForm.controls[
                  "newservicerequestunit"
                ].setValue(default_requnit);
              }
            }
          } else {
            // this.message.error(response.message);
          }
        },
        (err) => {}
      );
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isEmpty(changes.solutionObj) &&
      !_.isEmpty(changes.solutionObj.currentValue)
    ) {
      if (!_.isUndefined(changes.solutionObj.currentValue.loadbalancerid)) {
        this.loadbalancerAddObj = changes.solutionObj.currentValue;
        this.getTagValues();
        this.selectedIndex = 0;
        this.tabdisabled = false;
        this.lbbased = true;
        this.editLB(this.loadbalancerAddObj);
      } else if (!_.isUndefined(changes.solutionObj.currentValue.solutionid)) {
        this.solutionObj = changes.solutionObj.currentValue;
        this.virtualservername = this.solutionObj.solutionname;
        this.servicegroupname = this.solutionObj.solutionname;
        this.solutionbased = true;
        this.getSolutionData();
        const condition = {
          tenantid: this.userstoragedata.tenantid,
          zoneid: this.solutionObj.zoneid,
        };
        this.getlbList(condition);
      }
    } else if (changes.lbid && changes.mode.currentValue == "standalone") {
      console.log("INSIDE ELSE IF:::::::::");
      this.gettingLoadbalancer = true;
      this.getLbObject();
    } else {
      this.clearForm();
      this.loadbalancerAddObj = {};
      this.tagsClone = [];
      this.tagsList = [];
      this.tags = [];
      this.tabdisabled = true;
      this.lbbased = true;
      this.selectedIndex = 0;
    }
  }

  getLbObject() {
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2LBGETBYID +
          this.lbid
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          this.loadbalancerAddObj = response.data;
          this.getTagValues();
          this.selectedIndex = 0;
          this.tabdisabled = false;
          this.lbbased = true;
          this.gettingLoadbalancer = false;
          this.editLB(this.loadbalancerAddObj);
        } else {
        }
      });
  }

  clearForm() {
    this.ecl2lbForm = this.fb.group({
      lbname: [
        null,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [null, Validators.required],
      customerid: [null, Validators.required],
      loadbalancerplanid: [null, Validators.required],
      description: ["", Validators.compose([Validators.maxLength(500)])],
      availablesubnets: [null],
      defaultgateway: [""],
      status: ["Active"],
    });
    this.lbservicegpForm = this.fb.group({
      // servicegroupname: [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
      servicetype: [null, Validators.required],
      td: [10, Validators.required],
      cachetype: ["SERVER"],
      autoscale: [null],
      cacheable: [false, Validators.required],
      state: [true, Validators.required],
      healthmonitor: [true, Validators.required],
      appflowlog: [true, Validators.required],
      monconnectionclose: [null, Validators.required],
    });
    this.lbserverForm = this.fb.group({
      // name: [null, Validators.compose([Validators.minLength(1), Validators.maxLength(100)])],
      td: [10, Validators.required],
      state: [true, Validators.required],
      ipaddress: [""],
    });
    this.lbvserverForm = this.fb.group({
      // name: [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
      servicetype: [null, Validators.required],
      iptype: [true, Validators.required],
      port: [80, Validators.required],
    });
    this.lbvservermethodForm = this.fb.group({
      lbmethod: [null, Validators.required],
      newservicerequest: [0, Validators.required],
      backuplbmethod: [null, Validators.required],
      newservicerequestunit: [null, Validators.required],
      newservicerequestincrementinterval: [0, Validators.required],
    });
    this.lbvsgmemberForm = this.fb.group({
      port: [80, Validators.required],
      weight: [1, Validators.required],
      customserverid: [""],
      hashid: [1],
      state: [true, Validators.required],
    });
    this.lbvsgmonitorForm = this.fb.group({
      monitor_name: [null, Validators.required],
      weight: [1, Validators.required],
      monstate: [true, Validators.required],
    });
    this.lbplanedit = false;
    this.lbObj = {};
  }

  // Lists

  getPlanList(condition) {
    this.ecl2Service.allecl2lbplans(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.lbPlanList = response.data;
      } else {
        this.lbPlanList = [];
      }
    });
  }
  getlbList(condition) {
    this.ecl2Service.allecl2loadbalancer(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loadbalancerList = response.data;
      } else {
        this.loadbalancerList = [];
      }
    });
  }
  getecl2ZoneList() {
    this.ecl2Service
      .allecl2Zones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.ecl2zoneList = response.data;
        } else {
          this.ecl2zoneList = [];
        }
      });
  }
  getInterfaceList(condition) {
    this.loading = true;
    this.ecl2Service.allecl2lbinterface(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.interfaceList = _.map(response.data, function (item: any) {
          if (
            !_.isEmpty(item.ecl2networks) &&
            !_.isEmpty(item.ecl2networks.ecl2subnets)
          ) {
            item.ecl2networks.networkname =
              item.ecl2networks.networkname +
              "(" +
              _.map(item.ecl2networks.ecl2subnets, function (obj) {
                return obj.subnetcidr;
              }) +
              ")";
          }
          return item;
        });
        this.availablesubnetList = _.compact(
          _.map(this.interfaceList, _.property("ecl2networks"))
        );
        if (!_.isEmpty(this.lbObj) && this.lbObj.availablesubnets != null) {
          this.ecl2lbForm.controls["availablesubnets"].setValue(
            _.find(this.availablesubnetList, {
              networkid: this.lbObj.availablesubnets,
            })
          );
        }
        this.loading = false;
      } else {
        this.interfaceList = [];
        this.loading = false;
      }
    });
  }
  getSyslogServers(condition) {
    this.loading = true;
    this.ecl2Service.allecl2lbsyslogserver(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.syslogserverList = response.data;
        this.loading = false;
      } else {
        this.syslogserverList = [];
        this.loading = false;
      }
    });
  }
  getSolutionData() {
    let response = {} as any;
    this.solutionService
      .ecl2byId(this.solutionObj.solutionid)
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.ecl2instancesList = response.data.ecl2solutions;
          this.ecl2NetworkObj = response.data;
          this.lbList = response.data.ecl2loadbalancers;
        } else {
          this.lbList = [];
        }
      });
  }

  // onCahnge events

  onChangeLB(event) {
    try {
      this.interfaceList = [];
      this.syslogserverList = [];
      this.lbplanedit = true;
      this.lbObj = event;
      this.assignlb = [];
      this.loadbalancer = event;
      let lbsettings = {} as any;
      if (this.ecl2NetworkObj.ecl2lbsettings.length != 0) {
        lbsettings = this.ecl2NetworkObj.ecl2lbsettings[0];
      }
      if (lbsettings != null && lbsettings.servicegroup != null) {
        let servicegroup = lbsettings.servicegroup;
        this.lbservicegpForm = this.fb.group({
          // servicegroupname: [servicegroup.servicegroupname, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
          servicetype: [
            _.find(this.protocolList, { keyvalue: servicegroup.servicetype }),
            Validators.required,
          ],
          td: [servicegroup.td, Validators.required],
          cachetype: [
            _.find(this.cachetypeList, { keyvalue: servicegroup.cachetype }),
          ],
          autoscale: [
            _.find(this.autoscalemodeList, {
              keyvalue: servicegroup.autoscale,
            }),
          ],
          cacheable: [
            servicegroup.cacheable === "YES" ? true : false,
            Validators.required,
          ],
          state: [
            servicegroup.state === "ENABLED" ? true : false,
            Validators.required,
          ],
          healthmonitor: [
            servicegroup.healthmonitor === "YES" ? true : false,
            Validators.required,
          ],
          appflowlog: [
            servicegroup.appflowlog === "ENABLED" ? true : false,
            Validators.required,
          ],
          monconnectionclose: [
            _.find(this.monitorconnectionList, {
              keyvalue: servicegroup.monconnectionclose,
            }),
            Validators.required,
          ],
        });
      }
      if (lbsettings != null && lbsettings.lbserver != null) {
        let lbserver = lbsettings.lbserver;
        this.lbserverForm.patchValue(lbserver);
      }
      if (lbsettings != null && lbsettings.lbvserver != null) {
        let lbvserver = lbsettings.lbvserver;
        this.lbvserverForm = this.fb.group({
          // name: [lbvserver.name, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
          servicetype: [
            _.find(this.protocolList, { keyvalue: lbvserver.servicetype }),
            Validators.required,
          ],
          // iptype: [_.find(this.lbipList, { keyvalue: lbvserver.iptype }), Validators.required],
          port: [lbvserver.port, Validators.required],
        });
      }
      if (lbsettings != null && lbsettings.lbvservermethodbindings != null) {
        let lbvservermethodbindings = lbsettings.lbvservermethodbindings;
        this.lbvservermethodForm = this.fb.group({
          lbmethod: [
            _.find(this.lbmethodList, {
              keyvalue: lbvservermethodbindings.lbmethod,
            }),
            Validators.required,
          ],
          newservicerequest: [
            lbvservermethodbindings.newservicerequest,
            Validators.required,
          ],
          backuplbmethod: [
            _.find(this.backuplbmethodList, {
              keyvalue: lbvservermethodbindings.backuplbmethod,
            }),
            Validators.required,
          ],
          newservicerequestunit: [
            _.find(this.lbsrvrequnitmethodList, {
              keyvalue: lbvservermethodbindings.newservicerequestunit,
            }),
            Validators.required,
          ],
          newservicerequestincrementinterval: [
            lbvservermethodbindings.newservicerequestincrementinterval,
            Validators.required,
          ],
        });
      }
      if (lbsettings != null && lbsettings.servicegroupmemberbindings != null) {
        let sgmemberbindings = lbsettings.servicegroupmemberbindings;
        this.lbvsgmemberForm.patchValue(sgmemberbindings);
      }
      if (
        lbsettings != null &&
        lbsettings.servicegroupmonitorbindings != null
      ) {
        let sgmonitorbindings = lbsettings.servicegroupmonitorbindings;
        this.lbvsgmonitorForm = this.fb.group({
          monitor_name: [
            _.find(this.monitorbindList, {
              keyvalue: sgmonitorbindings.monitor_name,
            }),
            Validators.required,
          ],
          weight: [sgmonitorbindings.weight, Validators.required],
          monstate: [
            sgmonitorbindings.monstate === "ENABLED" ? true : false,
            Validators.required,
          ],
        });
      }
      const condition = {
        tenantid: this.userstoragedata.tenantid,
        loadbalancerid: event.loadbalancerid,
      };
      this.getInterfaceList(condition);
      this.getSyslogServers(condition);
    } catch (e) {
      console.log(e);
    }
  }

  onRegionChange(event) {
    const customerCondition = {
      tenantid: this.userstoragedata.tenantid,
      ecl2region: event.region,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getCustomerList(customerCondition);
  }
  getCustomerList(condition) {
    this.commonService.allCustomers(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.customerList = response.data;
        this.loading = false;
      } else {
        this.customerList = [];
        this.loading = false;
      }
    });
  }
  onCustomerChange(event) {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      region: event.ecl2region,
      customerid: event.customerid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getPlanList(condition);
  }
  onChanged(val) {
    this.isVisible = val;
    this.lbsyslogVisible = val;
    // this.selectedIndex = 0;
  }
  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.formTitle = "Attach Network";
    }
  }
  showModal() {
    this.formTitle = "Syslog Servers";
    this.lbSyslogObj = this.lbObj;
    this.lbsyslogVisible = true;
  }
  editSyslog(event) {
    this.formTitle = "Syslog Servers";
    let selectedData = {} as any;
    selectedData = _.clone(event);
    selectedData.lbzones = {} as any;
    selectedData.lbzones = this.lbObj.lbzones;
    selectedData.customer = this.lbObj.customer;
    this.lbSyslogObj = selectedData;
    this.lbsyslogVisible = true;
  }

  skip() {
    this.continue.next();
  }

  // Save & Update Load Balancer
  saveLb(data, flag) {
    this.loading = true;
    let errorMessage: any;
    if (this.ecl2lbForm.status === "INVALID" && flag === "") {
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2lbForm,
        this.ecl2lbErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      if (flag === "Template") {
        if (
          data == undefined ||
          data.lbname == null ||
          data.lbname == "" ||
          data.lbname == undefined
        ) {
          this.loading = false;
          this.messageService.error("Please select Load balancer");
          return;
        }
        this.formdata = {
          tenantid: this.userstoragedata.tenantid,
          flag: "TEMPLATE",
          // solutionid: this.loadbalancer.solutionid.push(this.solutionObj.solutionid),
          lbname: data.lbname,
          description: data.description,
          zoneid: data.zoneid,
          region: data.lbzones.region,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        if (this.assignlb != null && this.assignlb.length != 0) {
          this.formdata.ecl2solutionid = this.assignlb;
        } else {
          this.loading = false;
          this.messageService.error("Please select servers");
          return;
        }
        if (
          this.servicegroupname != null &&
          this.servicegroupname != "" &&
          this.servicegroupname != undefined
        ) {
          this.formdata.servicegroupname = this.servicegroupname;
        } else {
          this.loading = false;
          this.messageService.error("Please enter service group name");
          return;
        }
        if (
          this.virtualservername != null &&
          this.virtualservername != "" &&
          this.virtualservername != undefined
        ) {
          this.formdata.virtualservername = this.virtualservername;
        } else {
          this.loading = false;
          this.messageService.error("Please enter virtual server name");
          return;
        }
        if (this.assignlb != null && this.assignlb.length != 0) {
          this.formdata.ecl2solutionid = this.assignlb;
        } else {
          this.loading = false;
          this.messageService.error("Please select servers");
          return;
        }
        if (this.lbservicegpForm.status === "INVALID") {
          this.loading = false;
          errorMessage = this.commonService.getFormErrorMessage(
            this.lbservicegpForm,
            this.ecl2lbSettingsErrObj
          );
          this.messageService.remove();
          this.messageService.error(errorMessage);
          return false;
        }
        if (this.lbserverForm.status === "INVALID") {
          this.loading = false;
          errorMessage = this.commonService.getFormErrorMessage(
            this.lbserverForm,
            this.ecl2lbSettingsErrObj
          );
          this.messageService.remove();
          this.messageService.error(errorMessage);
          return false;
        }
        if (this.lbvserverForm.status === "INVALID") {
          this.loading = false;
          errorMessage = this.commonService.getFormErrorMessage(
            this.lbvserverForm,
            this.ecl2lbSettingsErrObj
          );
          this.messageService.remove();
          this.messageService.error(errorMessage);
          return false;
        }
        if (this.lbvservermethodForm.status === "INVALID") {
          this.loading = false;
          errorMessage = this.commonService.getFormErrorMessage(
            this.lbvservermethodForm,
            this.ecl2lbSettingsErrObj
          );
          this.messageService.remove();
          this.messageService.error(errorMessage);
          return false;
        }
        if (this.lbvsgmemberForm.status === "INVALID") {
          this.loading = false;
          errorMessage = this.commonService.getFormErrorMessage(
            this.lbvsgmemberForm,
            this.ecl2lbSettingsErrObj
          );
          this.messageService.remove();
          this.messageService.error(errorMessage);
          return false;
        }
        if (this.lbvsgmonitorForm.status === "INVALID") {
          this.loading = false;
          errorMessage = this.commonService.getFormErrorMessage(
            this.lbvsgmonitorForm,
            this.ecl2lbSettingsErrObj
          );
          this.messageService.remove();
          this.messageService.error(errorMessage);
          return false;
        }
        let lbservicegroup = {} as any;
        let settings = this.lbservicegpForm.value;
        lbservicegroup.servicegroupname = this.servicegroupname;
        lbservicegroup.servicetype = settings.servicetype.keyvalue;
        lbservicegroup.td = settings.td;
        lbservicegroup.cacheable = settings.cacheable === true ? "YES" : "NO";
        if (
          settings.cachetype != null &&
          settings.cachetype.keyvalue !== "SERVER"
        ) {
          lbservicegroup.cachetype = settings.cachetype.keyvalue;
        }
        lbservicegroup.state = settings.state === true ? "ENABLED" : "DISABLED";
        lbservicegroup.healthmonitor =
          settings.healthmonitor === true ? "YES" : "NO";
        lbservicegroup.appflowlog =
          settings.appflowlog === true ? "ENABLED" : "DISABLED";
        lbservicegroup.monconnectionclose =
          settings.monconnectionclose.keyvalue;
        if (!_.isEmpty(settings.autoscale)) {
          lbservicegroup.autoscale = settings.autoscale.keyvalue;
        }
        let lbserver = this.lbserverForm.value;
        let lbvserver = this.lbvserverForm.value;
        let lbvservermethod = this.lbvservermethodForm.value;
        let sgmemberbindings = this.lbvsgmemberForm.value;
        let sgmonitorbindings = this.lbvsgmonitorForm.value;
        this.formdata.lbsettings = {
          loadbalancerid: this.lbObj.loadbalancerid,
          tenantid: this.userstoragedata.tenantid,
          solutionid: this.solutionObj.solutionid,
          servicegroup: lbservicegroup,
          lbserver: {
            name: "",
            td: lbserver.td,
            state: lbserver.state === true ? "ENABLED" : "DISABLED",
            ipaddress: "",
          },
          lbvserver: {
            name: this.virtualservername,
            servicetype: lbvserver.servicetype.keyvalue,
            ipv46: "",
            port: lbvserver.port,
            td: "10",
            m: "IP",
            state: "ENABLED",
            rhistate: "PASSIVE",
            appflowlog: "ENABLED",
            bypassaaaa: "NO",
            retainconnectionsoncluster: "NO",
            comment: "",
          },
          lbvservermethodbindings: {
            name: this.virtualservername,
            lbmethod: lbvservermethod.lbmethod.keyvalue,
            newservicerequest: lbvservermethod.newservicerequest,
            backuplbmethod: lbvservermethod.backuplbmethod.keyvalue,
            newservicerequestunit:
              lbvservermethod.newservicerequestunit.keyvalue,
            newservicerequestincrementinterval:
              lbvservermethod.newservicerequestincrementinterval,
            // serviceType: 'HTTP'
          },
          servicegroupmemberbindings: {
            servername: "",
            servicegroupname: lbservicegroup.servicegroupname,
            port: sgmemberbindings.port,
            weight: sgmemberbindings.weight,
            customserverid: sgmemberbindings.customserverid,
            state: sgmemberbindings.state == true ? "ENABLED" : "DISABLED",
          },
          servicegroupmonitorbindings: {
            servicegroupname: lbservicegroup.servicegroupname,
            monitor_name: sgmonitorbindings.monitor_name.keyvalue,
            weight: sgmonitorbindings.weight,
            monstate: sgmonitorbindings.monstate ? "ENABLED" : "DISABLED",
          },
          lbvserversgbindings: {
            servicegroupname: lbservicegroup.servicegroupname,
            name: this.virtualservername,
          },
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        if (sgmemberbindings.hashid != null) {
          this.formdata.lbsettings.servicegroupmemberbindings.hashid =
            sgmemberbindings.hashid;
        }
        if (!_.isEmpty(this.ecl2NetworkObj.ecl2lbsettings)) {
          let existvalue = this.ecl2NetworkObj.ecl2lbsettings[0];
          this.formdata.lbsettings.lbsettingid = existvalue.lbsettingid;
        }
      } else {
        this.formdata = {
          tenantid: this.userstoragedata.tenantid,
          lbname: data.lbname,
          description: data.description,
          loadbalancerplanid: data.loadbalancerplanid.lbplanid,
          ecl2lbplanid: data.loadbalancerplanid.ecl2lbplanid,
          loadbalancerplan: data.loadbalancerplanid.lbplanname,
          // solutionid: (!_.isEmpty(this.solutionObj)) ? this.solutionObj.solutionid : [],
          zoneid: data.zoneid.zoneid,
          customerid: data.customerid.customerid,
          ecl2tenantid: data.customerid.ecl2tenantid,
          availabilityzone: data.zoneid.zonename.substring(
            4,
            data.zoneid.zonename.length
          ),
          region: data.zoneid.region,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
      }
      if (
        !_.isUndefined(this.lbObj) &&
        !_.isUndefined(this.lbObj.loadbalancerid) &&
        !_.isEmpty(this.lbObj)
      ) {
        if (flag !== "Template") {
          this.formdata.availablesubnets = !_.isEmpty(data.availablesubnets)
            ? data.availablesubnets.networkid
            : -1;
          this.formdata.defaultgateway = !_.isEmpty(data.defaultgateway)
            ? data.defaultgateway
            : "";
        }
        if (flag === "Template") {
          this.formdata.ecl2solutions = [] as any;
          this.formdata.ecl2solutionid.forEach((element) => {
            const eclsolutionobj = {} as any;
            eclsolutionobj.ecl2solutionid = element;
            eclsolutionobj.loadbalancerid = this.lbObj.loadbalancerid;
            eclsolutionobj.lastupdatedby = this.userstoragedata.fullname;
            eclsolutionobj.lastupdateddt = new Date();
            this.formdata.ecl2solutions.push(eclsolutionobj);
          });
        }
        this.formdata.eloadbalancerplanid = this.lbObj.loadbalancerplanid;
        this.formdata.loadbalancerid = this.lbObj.loadbalancerid;
        this.formdata.ecl2loadbalancerid = this.lbObj.ecl2loadbalancerid;
        this.ecl2Service
          .updateecl2loadbalancer(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              response.data.lbzones = data.zoneid;
              this.lbList = [...this.lbList, response.data];
              this.reponseDetails = response.data;
              response.data.customer = data.customerid;
              this.loading = false;
              this.continue.next(response.data);
              this.messageService.success(response.message);
            } else {
              this.loading = false;
              this.notificationService.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          });
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service
          .createecl2loadbalancer(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              response.data.lbzones = data.zoneid;
              this.lbList = [...this.lbList, response.data];
              this.reponseDetails = response.data;
              const condition = {
                tenantid: this.userstoragedata.tenantid,
                loadbalancerid: response.data.loadbalancerid,
              };
              this.getInterfaceList(condition);
              this.getSyslogServers(condition);
              this.tabdisabled = false;
              this.loading = false;
              this.lbplanedit = true;
              this.continue.next(response.data);
              this.notificationService.create(
                "info",
                "Load Balancer Created",
                "Load Balancer (" +
                  response.data.ecl2loadbalancerid +
                  ") has set as username : <b>" +
                  response.data.adminusername +
                  "</b> and password : <b>" +
                  response.data.adminpassword +
                  "</b> Do not forget write down these",
                {
                  nzStyle: {
                    right: "460px",
                  },
                  nzDuration: 0,
                }
              );
              // this.messageService.success(response.message);
            } else {
              this.loading = false;
              this.notificationService.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          });
      }
    }
  }

  editLB(lb) {
    console.log(lb);
    this.lbObj = lb;
    this.loadbalancer = _.find(this.loadbalancerList, {
      loadbalancerid: lb.loadbalancerid,
    });
    let assigneeList = [];
    this.ecl2instancesList.forEach((o) => {
      if (o.loadbalancerid == lb.loadbalancerid) {
        assigneeList.push(o.ecl2solutionid);
      }
    });
    this.assignlb = assigneeList;
    this.lbPlanList.push(this.lbObj.ecl2lbplan);
    this.ecl2zoneList.push(this.lbObj.lbzones);
    this.customerList.push(this.lbObj.customer);
    this.syslogserverList = [];
    this.ecl2lbForm = this.fb.group({
      lbname: [
        this.lbObj.lbname,
        [Validators.required, Validators.pattern(new RegExp(/(\w|-)(?!=\S)/g))],
      ],
      description: [this.lbObj.description],
      zoneid: [this.lbObj.lbzones],
      customerid: [this.lbObj.customer],
      loadbalancerplanid: [this.lbObj.ecl2lbplan, Validators.required],
      availablesubnets: [null],
      defaultgateway: [
        !_.isEmpty(this.lbObj.defaultgateway) ? this.lbObj.defaultgateway : "",
      ],
      status: [this.lbObj.status],
    });
    let lbsettings = {} as any;
    if (!_.isEmpty(this.ecl2NetworkObj.ecl2lbsettings)) {
      lbsettings = this.ecl2NetworkObj.ecl2lbsettings[0];
      this.loadbalancer.lbsettings = lbsettings;
    }
    if (lbsettings != null && lbsettings.servicegroup != null) {
      let servicegroup = lbsettings.servicegroup;
      this.lbservicegpForm = this.fb.group({
        // servicegroupname: [servicegroup.servicegroupname, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
        servicetype: [
          _.find(this.protocolList, { keyvalue: servicegroup.servicetype }),
          Validators.required,
        ],
        td: [servicegroup.td, Validators.required],
        cachetype: [
          _.find(this.cachetypeList, { keyvalue: servicegroup.cachetype }),
        ],
        autoscale: [
          _.find(this.autoscalemodeList, { keyvalue: servicegroup.autoscale }),
        ],
        cacheable: [
          servicegroup.cacheable === "YES" ? true : false,
          Validators.required,
        ],
        state: [
          servicegroup.state === "ENABLED" ? true : false,
          Validators.required,
        ],
        healthmonitor: [
          servicegroup.healthmonitor === "YES" ? true : false,
          Validators.required,
        ],
        appflowlog: [
          servicegroup.appflowlog === "ENABLED" ? true : false,
          Validators.required,
        ],
        monconnectionclose: [
          _.find(this.monitorconnectionList, {
            keyvalue: servicegroup.monconnectionclose,
          }),
          Validators.required,
        ],
      });
    }

    if (lbsettings != null && lbsettings.lbserver != null) {
      let lbserver = lbsettings.lbserver;
      this.lbserverForm.patchValue(lbserver);
    }
    if (lbsettings != null && lbsettings.lbvserver != null) {
      let lbvserver = lbsettings.lbvserver;
      this.lbvserverForm = this.fb.group({
        // name: [lbvserver.name, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
        servicetype: [
          _.find(this.protocolList, { keyvalue: lbvserver.servicetype }),
          Validators.required,
        ],
        // iptype: [_.find(this.lbipList, { keyvalue: lbvserver.iptype }), Validators.required],
        port: [lbvserver.port, Validators.required],
      });
    }
    if (lbsettings != null && lbsettings.lbvservermethodbindings != null) {
      let lbvservermethodbindings = lbsettings.lbvservermethodbindings;
      this.lbvservermethodForm = this.fb.group({
        lbmethod: [
          _.find(this.lbmethodList, {
            keyvalue: lbvservermethodbindings.lbmethod,
          }),
          Validators.required,
        ],
        newservicerequest: [
          lbvservermethodbindings.newservicerequest,
          Validators.required,
        ],
        backuplbmethod: [
          _.find(this.backuplbmethodList, {
            keyvalue: lbvservermethodbindings.backuplbmethod,
          }),
          Validators.required,
        ],
        newservicerequestunit: [
          _.find(this.lbsrvrequnitmethodList, {
            keyvalue: lbvservermethodbindings.newservicerequestunit,
          }),
          Validators.required,
        ],
        newservicerequestincrementinterval: [
          lbvservermethodbindings.newservicerequestincrementinterval,
          Validators.required,
        ],
      });
    }
    if (lbsettings != null && lbsettings.servicegroupmemberbindings != null) {
      let sgmemberbindings = lbsettings.servicegroupmemberbindings;
      this.lbvsgmemberForm.patchValue(sgmemberbindings);
    }
    if (lbsettings != null && lbsettings.servicegroupmonitorbindings != null) {
      let sgmonitorbindings = lbsettings.servicegroupmonitorbindings;
      this.lbvsgmonitorForm = this.fb.group({
        monitor_name: [
          _.find(this.monitorbindList, {
            keyvalue: sgmonitorbindings.monitor_name,
          }),
          Validators.required,
        ],
        weight: [sgmonitorbindings.weight, Validators.required],
        monstate: [
          sgmonitorbindings.monstate === "ENABLED" ? true : false,
          Validators.required,
        ],
      });
    }
    this.lbplanedit = true;
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      loadbalancerid: this.lbObj.loadbalancerid,
    };
    this.getInterfaceList(condition);
    this.getSyslogServers(condition);
  }
  // Attach Network
  editInterface(data, type) {
    this.modal = type;
    this.formTitle = "";
    const networks = [] as any;
    this.formTitle = "Attach Network";
    if (!_.isEmpty(this.ecl2NetworkObj.ecl2solutions)) {
      this.ecl2NetworkObj.ecl2solutions.forEach((element) => {
        networks.push(element.networkid);
      });
    }
    let selectedData = {} as any;
    selectedData = _.clone(data);
    selectedData.zoneid = this.lbObj.zoneid;
    selectedData.networks = networks;
    selectedData.customer = this.lbObj.customer;
    this.lbInterfaceObj = selectedData;
    this.isVisible = true;
  }
  IPEntry(event) {
    this.isVisible = false;
  }
  // Network configuration for VRRP
  editConfiguration(data, type) {
    this.modal = type;
    this.formTitle = "";
    if (this.modal === "VRRP") {
      this.formTitle = "VRRP Configuration";
      data.customer = this.lbObj.customer;
      this.lbVRRPObj = data;
    } else if (this.modal === "IP") {
      this.formTitle = "IP Configuration";
      this.lbIPObj = data;
    }

    this.isVisible = true;
  }
  notifyNewEntry(event) {
    let interfaceData = {} as any;
    let syslogData = {} as any;
    if (!_.isUndefined(event.lbinterfaceid)) {
      interfaceData = _.find(this.interfaceList, {
        lbinterfaceid: event.lbinterfaceid,
      });
      if (interfaceData === undefined) {
        this.interfaceList = [event, ...this.interfaceList];
      } else {
        const index = _.indexOf(this.interfaceList, interfaceData);
        this.interfaceList[index] = event;
        this.interfaceList = [...this.interfaceList];
      }
      this.lbInterfaceObj = {};
      this.isVisible = false;
    } else if (!_.isUndefined(event.lbsyslogserverid)) {
      syslogData = _.find(this.syslogserverList, {
        lbsyslogserverid: event.lbsyslogserverid,
      });
      if (syslogData === undefined) {
        this.syslogserverList = [event, ...this.syslogserverList];
      } else {
        const index = _.indexOf(this.syslogserverList, syslogData);
        this.syslogserverList[index] = event;
        this.syslogserverList = [...this.syslogserverList];
      }
      this.lbsyslogVisible = false;
      this.lbSyslogObj = {};
    }
  }
  // Remove Load Balancer
  removeLB(lb, i) {
    this.loading = true;
    let response = {} as any;
    const formdata = {
      loadbalancerid: lb.loadbalancerid,
      ecl2loadbalancerid: lb.ecl2loadbalancerid,
      tenantid: this.userstoragedata.tenantid,
      region: lb.ecl2zones.region,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      status: AppConstant.STATUS.DELETED,
    };
    this.ecl2Service.deleteecl2loadbalancer(formdata).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.messageService.success(
          "#" + response.data.loadbalancerid + " Load balancer removed"
        );
        this.lbList.splice(i, 1);
        this.loading = false;
      } else {
        this.loading = false;
        this.notificationService.error(response.message, "", {
          nzStyle: {
            right: "460px",
            background: "#fff",
          },
          nzDuration: AppConstant.MESSAGEDURATION,
        });
      }
    });
  }

  getTagValues() {
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.loadbalancerAddObj.loadbalancerid)
          ? this.loadbalancerAddObj.loadbalancerid
          : Number(this.loadbalancerAddObj.loadbalancerid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[5],
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.tagsList = this.tagService.prepareViewFormat(response.data);
            this.tags = this.tagService.decodeTagValues(
              response.data,
              "picker"
            );
            this.tagsClone = response.data;
            console.log(this.tagsList);
          } else {
            this.tagsClone = [];
            this.tags = [];
            this.tagsList = [];
            // this.message.error(response.message);
          }
        },
        (err) => {
          // this.message.error('Unable to get tag group. Try again');
        }
      );
  }

  updateTags() {
    this.tagValueService.bulkupdate(this.tagsClone).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.messageService.info(response.message);
        } else {
          this.loading = false;
          this.messageService.error(response.message);
        }
      },
      (err) => {
        this.loading = false;
        this.messageService.error("Unable to remove tag. Try again");
      }
    );
  }

  tagDrawerChanges(e) {
    this.tagPickerVisible = false;
  }

  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagPickerVisible = false;
      this.tagsClone = e.data;
      this.tagsList = this.tagService.prepareViewFormat(e.data);
    }
  }
}
