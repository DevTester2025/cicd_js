import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { AlertConfigService } from "./alertconfig.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { CustomerAccountService } from "../../tenants/customers/customer-account.service";
import { ITag, TagService } from "../tagmanager/tags.service";
import { NzMessageService } from "ng-zorro-antd";
import { UsersService } from "../../admin/users/users.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SSLService } from "src/app/monitoring/ssl/sslservice";
import { NotificationService } from "../global-notification.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-cloudmatiq-alert-config",
  templateUrl:
    "../../../presentation/web/base/alertconfigs/alert.component.html",
})
export class AlertConfigComponent implements OnInit {
  userstoragedata = {} as any;
  loading = true;
  screens = [];
  appScreens = {} as any;
  addAlertModel = false;
  severityList = AppConstant.ALERT_LEVELS.SYSTEM;
  levelsList = AppConstant.ALERT_LEVELS.LEVELS;
  priorityList = AppConstant.ALERT_LEVELS.PRIORITY;
  platformList = AppConstant.PLATFORM;
  alertTypes = [
    { type: "Security Alert", value: "Security Alert" },
    { type: "System Alert", value: "System Alert" },
    { type: "Synthetics Alert", value: "Synthetics Alert" },
    { type: "SSL Alert", value: "SSL Alert" },
  ];
  ntfList = [];
  ntftotalCount = 0;
  ntftableHeader = [
    { field: "eventtype", header: "Type", datatype: "string" },
    { field: "referenceno", header: "#Reference", datatype: "string" },
    { field: "title", header: "Title", datatype: "string" },
    { field: "txnstatus", header: "Status", datatype: "string" },
  ] as any;
  ntftableConfig = {
    refresh: true,
    edit: false,
    view: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    loading: false,
    apisort: true,
    manualpagination: true,
    pagination: false,
    pageSize: 10,
    count: null,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  tableHeader = [
    { field: "title", header: "Title", datatype: "string",  isdefault: true },
    { field: "type", header: "Alert Type", datatype: "string", isfilter: true, isdefault: true },
    { field: "priority", header: "Priority", datatype: "string",  isdefault: true },
    { field: "severity", header: "Severity", datatype: "string",  isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string",  isdefault: true },
    {
      field: "lastupdateddt",
      header: "Last updated",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string",  isdefault: true },
  ] as any;
  tableConfig = {
    refresh: true,
    edit: false, //#OP_T620
    delete: false, //#OP_T620
    manualsearch: true,
    globalsearch: true,
    loading: false,
    columnselection: true,
    pagination: false,
    apisort: true,
    manualpagination: true,
    pageSize: 10,
    tabledownload: false,
    count: null,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  customerList = [];
  usersList = [];
  accountsList = [];
  selectedTag = null as Record<string, any> | null;
  tagList: ITag[] = [];
  alertsList = [];
  selectedcolumns = [] as any;
  monitoringLists = [];
  sslmonitoringLists = [];
  regionList = [];
  instanceList = [];
  durationList = [];
  models = {
    title: "",
    description: "",
    _customer: null,
    _account: null,
    _synthetics: [],
    _ssl: [],
    vm: null,
    _tag: null,
    type: "System Alert",
    tagvalue: null,
    severity: "High",
    priority: "Priority 3",
    metric: null,
    condition: null,
    threshold: null,
    duration: null,
    level: null,
    pagerduty: false,
    poll_strategy: "Time Duration",
    region: "us-east-1",
    instance: null,
    platform: null,
  };
  configuredNotifications: any = [];
  notificaitonsModel = {
    duration: "",
    mode: "EMAIL",
    receivers: [],
  };
  totalCount;
  limit = 10;
  offset = 0;
  tabIndex = 0; 
  isdownload = false;
  filterableValues = [];
  filteredValues = {};
  filterKey = "";
  searchText = null;
  order = ["lastupdateddt", "desc"];
  showFilter = false;
  Trshld_lbl = "Duration (Min)";
  savingAlert = false;
  dataLoading = false;
  pagerduty = false;
  add = false; //#OP_T620
  selectAll = false;
  isChangelogs = false;
  buttonText =AppConstant.VALIDATIONS.SAVE;
  constructor(
    private localStorageService: LocalStorageService,
    private alertConfigService: AlertConfigService,
    private commonService: CommonService,
    private httpService: HttpHandlerService,
    private tagService: TagService,
    private userService: UsersService,
    private customerAccService: CustomerAccountService,
    private message: NzMessageService,
    private sslService: SSLService,
    private notificationService: NotificationService
  ) {
    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }
  ngOnInit() {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ALER_CONFIG, //#OP_T620
    } as any);
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Create")) {
      this.add = true;
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }

    this.getAllAlerts();
    this.getAllCustomers();
    this.getAllAccounts();
    this.getAllTags();
    this.getUserList();
    this.getSSLList();
    this.getAllRegions();
    this.getMonitors(this.models.region);
    this.getLookups();
    this.getfilteredInstance();
  }
  getAllNotifications(limit?, offset?) {
    this.ntfList = [];
    this.ntftableConfig.loading = true;

    let reqObj: any = {
      tenantid: this.userstoragedata.tenantid,
      txnid: this.selectedData.id,
    };
    if (this.searchText != null) {
      reqObj["searchText"] = this.searchText;
      reqObj["headers"] = [
        { field: "title" },
        { field: "eventtype" }
    ];
    }
    if (this.order && this.order != null) {
      reqObj["order"] = this.order;
    } else {
      reqObj["order"] = ["lastupdateddt", "desc"];
    }

    let query = `count=${true}&limit=${limit || 10}&offset=${offset || 0}&order=${this.order || ""}`;

    this.notificationService.all(reqObj, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.ntftableConfig.manualpagination = true;
        this.ntftotalCount = response.data.count;
        this.ntftableConfig.count =
          "Total Records" + ":" + " " + this.ntftotalCount;
        this.ntfList = response.data.rows;
        this.ntftableConfig.loading = false;
      } else {
        this.totalCount = 0;
        this.ntfList = [];
        this.ntftableConfig.loading = false;
      }
    });
  }
  ntftableEventHandler(event) {
    if (event.pagination) {
      this.ntftableConfig.pageSize = event.pagination.limit;
      this.getAllNotifications(event.pagination.limit, event.pagination.offset);
    }
    if (event.searchText != "") {
      this.searchText = event.searchText;
      if (event.search) {
        this.getAllNotifications(this.ntftableConfig.pageSize, 0);
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getAllNotifications(this.ntftableConfig.pageSize, 0);
    }
    if (event.order) {
      this.order = event.order;
      this.getAllNotifications(this.ntftableConfig.pageSize, 0);
    }
    if (event.order == null) {
      this.order = null;
    }
    if (event.refresh) {
      this.getAllNotifications();
    }
   
  }
  getFilterValue(event) {
    if (this.filterKey == "type") {
      if (event) {
        this.filterableValues = this.alertTypes.filter((el) => {
          return el.type.toLowerCase().includes(event);
        });
      } else {
        this.filterableValues = this.alertTypes;
      }
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllAlerts();
  }
  trshld_change(e) {
    if (e == "Free_Space") {
      this.Trshld_lbl = "GB";
    } else {
      this.Trshld_lbl = "Duration (Min)";
    }
  }
  getSSLList() {
    this.sslService
      .all({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.sslmonitoringLists = response.data.rows;
        },
        (err) => {
          this.message.error("Error getting monitoring lists.");
          console.log(err);
        }
      );
  }
  rulesList = [];
  getRules() {
    this.commonService
      .allSystemRules({
        tenantid: this.userstoragedata.tenantid,
        lookupkey: "SYSTEM_RULES",
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          this.rulesList = _.orderBy(response.data, ["displayorder"], ["asc"]);
        },
        (err) => {
          this.rulesList = [];
          console.log(err);
        }
      );
  }
  onRegionChange(selectedRegion: string) {
    this.getMonitors(selectedRegion);
  }
  getMonitors(selectedRegion: string) {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      region: selectedRegion,
    };
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.MONITORING.SYNTHETICS.GET_ALL_LIST,
        condition
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.monitoringLists = _.filter(response.data, function (e) {
              e.name = e.name + ` (${e.region})`;
              return e;
            });
          } else {
            this.monitoringLists = [];
          }
        },
        (err) => {
          this.monitoringLists = [];
          this.message.error("Error getting monitoring lists.");
          console.log(err);
        }
      );
  }

  resetModelData() {
    this.resetNotificationModel();
    this.getfilteredInstance();
    this.models = {
      title: "",
      description: "",
      _customer: null,
      _account: null,
      vm: null,
      _tag: null,
      severity: "High",
      priority: "Priority 3",
      _synthetics: [],
      _ssl: [],
      type: "System Alert",
      tagvalue: null,
      metric: null,
      condition: null,
      threshold: null,
      duration: null,
      level: null,
      pagerduty: false,
      poll_strategy: "Time Duration",
      region: "us-east-1",
      instance: null,
      platform: null,
    };
  }

  addNotification() {
    this.dataLoading = true;
    this.configuredNotifications = [
      { ...this.notificaitonsModel },
      ...this.configuredNotifications,
    ];
    this.dataLoading = false;
    this.notificaitonsModel = {
      duration: "",
      mode: "EMAIL",
      receivers: [],
    };
  }
  deleteNotification(index: number) {
    this.configuredNotifications.splice(index, 1);
    this.configuredNotifications = [...this.configuredNotifications];
  }
  getReceiversFor(receivers: { label: string; value: number }[]): string {
    if (receivers && typeof receivers == "object" && receivers.length > 0) {
      return receivers.map((o) => o.label).join(", ");
    }
    return "-";
  }
  resetNotificationModel() {
    this.notificaitonsModel = {
      duration: "",
      mode: "EMAIL",
      receivers: [],
    };
    this.getRules();
    this.configuredNotifications = [];
  }
  getUserList() {
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
        } else {
          this.usersList = [];
        }
      });
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

  getAllCustomers() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allCustomers(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.customerList = response.data;
      } else {
        this.customerList = [];
      }
    });
  }
  getAllAccounts() {
    let reqObj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    this.customerAccService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.accountsList = response.data;
      } else {
        this.accountsList = [];
      }
    });
  }
  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d: ITag[] = response.data.map((o) => {
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
    });
  }
  tagChanged(e, opt?: { tagvalue?: string }) {
    if (e == null) {
      this.selectedTag = null;
      this.getfilteredInstance();
      return;
    }
    let tag = this.tagList.find((o) => o["tagid"] == e);
    let tagClone = _.cloneDeep(tag) as any;

    this.models.tagvalue = null;

    if (opt && opt.tagvalue) {
      this.models.tagvalue = opt.tagvalue;
    }

    if (tagClone.tagtype == "list") {
      tagClone.lookupvalues = tagClone.lookupvalues.split(",");
    } else if (
      tagClone.tagtype == "range" &&
      typeof tagClone.lookupvalues == "string"
    ) {
      tagClone.min = tagClone.lookupvalues.split(",")[0];
      tagClone.min = tagClone.lookupvalues.split(",")[1];
    }
    if (tag && tag.tagid) {
      this.getfilteredInstance(null, null, tag.tagid);
    }

    this.selectedTag = _.cloneDeep(tagClone);
  }
  getAllAlerts(limit?, offset?) {
    try {
      this.tableConfig.loading = true;
      let condition: any = {
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
        status: "Active",
      };
      if (this.searchText != null) {
        condition["searchText"] = this.searchText;
      }
      if (
        this.filteredValues["type"] &&
        this.filteredValues["type"].length > 0
      ) {
        condition["alerts"] = this.filteredValues[this.filterKey];
      }
      if (this.order && this.order != null) {
        condition["order"] = this.order;
      } else {
        condition["order"] = ["lastupdateddt", "desc"];
      }
      let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    } else {
      query = `count=${true}&limit=${limit || 10}&offset=${offset || 0}&order=${this.order || ""}`;
    }

      this.alertConfigService.all(condition, query).subscribe((d) => {
        let response = JSON.parse(d._body);
        if (response.status) {
          if (this.isdownload) {
            this.tableConfig.loading = false;
            this.isdownload = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(buffer, "Alerts.xlsx");
          } else {
          this.tableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableConfig.count =
            "Total Records" + ":" + " " + this.totalCount;
          this.alertsList = [...response["data"].rows];
          this.tableConfig.loading = false;
        }} else {
          this.totalCount = 0;
          this.alertsList = [];
          this.tableConfig.loading = false;
        }
      });
    } catch (err) {
      this.totalCount = 0;
      this.alertsList = [];
      this.tableConfig.loading = false;
      console.log("Something went wrong", err);
    }
  }
  selectedData = {} as any;
  tableEventHandler(ev, type) {
    if (ev.delete) {
      this.updateAlert(ev.data.id, true);
    }
    if (ev.edit) {
      this.buttonText = AppConstant.VALIDATIONS.UPDATE;
      this.getRules();
      this.selectedData = ev.data;
      this.selectedData.refid = this.selectedData.id;
      this.selectedData.reftype = AppConstant.REFERENCETYPE[20];
      ev.data.level = ev.data.level ? JSON.stringify(ev.data.level) : null;
      this.tabIndex = 0;
      let d = ev.data;

      if (d._synthetics.length > 2) {
        d["_synthetics"] = JSON.parse(d._synthetics) || [];
      }

      if (d._ssl) {
        d["_ssl"] = JSON.parse(d._ssl) || [];
      }
      this.models = d;
      if (typeof d.instance == "string") {
        this.models["instance"] = JSON.parse(d.instance) || [];
      }
      if (typeof d.instance == "object") {
        this.models["instance"] = d.instance || [];
      }
      if (d._tag) {
        this.tagChanged(d._tag, {
          tagvalue: d.tagvalue,
        });
      }
      this.models = d;
      this.configuredNotifications = d.ntf_receivers
        ? JSON.parse(d.ntf_receivers)
        : [];
      this.addAlertModel = true;
    }
    if (ev.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = "title";
      this.filterKey = ev.data.field;

      if (ev.data.field == "type") {
        this.filterableValues = [...this.alertTypes];
      } else {
        this.getFilterValue(null);
      }
    }
    if (ev.pagination) {
      this.getAllAlerts(ev.pagination.limit, ev.pagination.offset);
      this.tableConfig.pageSize = ev.pagination.limit;
    }
    if (ev.searchText != "") {
      this.searchText = ev.searchText;
      if (ev.search) {
        this.getAllAlerts(this.tableConfig.pageSize, 0);
      }
    }
    if (ev.searchText == "") {
      this.searchText = null;
      this.getAllAlerts(this.tableConfig.pageSize, 0);
    }
    if (ev.order) {
      this.order = ev.order;
      this.getAllAlerts(this.tableConfig.pageSize, 0);
    }
    if (ev.refresh) {
      this.filteredValues = {};
      this.getAllAlerts();
    }
    if (ev.download) {
      this.isdownload = true;
      this.getAllAlerts(this.tableConfig.pageSize, 0);
    }
  }
  saveAlert() {
    if (
      this.models.title == "" ||
      this.models.title == null ||
      this.models.title == undefined
    ) {
      this.message.error("Please Enter title");
      return false;
    }
    if (
      this.models.type == "" ||
      this.models.type == null ||
      this.models.type == undefined
    ) {
      this.message.error("Please Select Alert type");
      return false;
    }
    if (
      (this.models.type == this.alertTypes[2].value ||
        this.models.type == this.alertTypes[1].value) &&
      (this.models.metric == "" || this.models.metric == null)
    ) {
      this.message.error("Please Select the Metrics");
      return false;
    }
    if (
      (this.models.type == this.alertTypes[2].value ||
        this.models.type == this.alertTypes[1].value) &&
      (this.models.condition == "" || this.models.condition == null)
    ) {
      this.message.error("Please Select the Condition");
      return false;
    }
    if (
      (this.models.type == this.alertTypes[2].value ||
        this.models.type == this.alertTypes[1].value) &&
      (this.models.threshold == "" || this.models.threshold == null)
    ) {
      this.message.error("Please enter Threshold");
      return false;
    }
    if (
      this.models.type == this.alertTypes[2].value &&
      this.models.metric == "SuccessPercent" &&
      this.models.threshold > 100
    ) {
      this.message.error("Threshold value should be 1 to 100");
      return false;
    }
    if (
      this.models.type == this.alertTypes[2].value &&
      (this.models.region == "" || this.models.region == null)
    ) {
      this.message.error("Please Select the Region");
      return false;
    }
    if (
      this.models.type == this.alertTypes[1].value &&
      (this.models.poll_strategy == "" || this.models.poll_strategy == null)
    ) {
      this.message.error("Please Select the Poll strategy");
      return false;
    }
    if (
      this.models.type == this.alertTypes[1].value &&
      (this.models.duration == "" || this.models.duration == null)
    ) {
      this.message.error("Please enter value for " + this.Trshld_lbl);
      return false;
    }
    if ((this.models as any).id) {
      this.updateAlert((this.models as any).id);
    } else {
      this.savingAlert = true;
      this.alertConfigService
        .create({
          ...this.models,
          createdby: this.userstoragedata.fullname,
          priority: this.models.priority,
          _synthetics:
            this.models._synthetics.length > 0
              ? JSON.stringify(this.models._synthetics)
              : "",
          _ssl:
            this.models._ssl.length > 0 ? JSON.stringify(this.models._ssl) : JSON.stringify([]),
          createddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
          tenantid: this.userstoragedata.tenantid,
          status: "Active",
          ntf_receivers: JSON.stringify(this.configuredNotifications),
          region: this.models.region,
          instance: JSON.stringify(this.models.instance),
          pagerduty: this.models.pagerduty,
          poll_strategy: this.models.poll_strategy,
          platform: this.models.platform,
        })
        .subscribe(
          (result) => {
            this.savingAlert = false;
            let response = JSON.parse(result._body);
            this.models = response;
            this.addAlertModel = false;
            this.message.success("New alert configured.");
            this.getAllAlerts();
          },
          (err) => {
            this.savingAlert = false;
            this.message.error("Unable to save the alerts");
          }
        );
    }
  }
  onTabChange(e) {
    this.tabIndex = e.index;
    if (this.tabIndex == 2) {
      this.getAllNotifications();
    }
  }
  updateAlert(id: number, isdelete?: boolean) {
    this.savingAlert = true;
    let d = {
      ...this.models,
      id,
      lastupdatedby: this.userstoragedata.fullname,
      priority: this.models.priority,
      lastupdateddt: new Date(),
      tenantid: this.userstoragedata.tenantid,
      ntf_receivers: JSON.stringify(this.configuredNotifications),
      region: this.models.region,
      instance: JSON.stringify(this.models.instance),
      pagerduty: this.models.pagerduty,
      poll_strategy: this.models.poll_strategy,
      platform: this.models.platform,
    } as any;

    if (this.models._synthetics) {
      d["_synthetics"] =
        this.models._synthetics.length > 0
          ? JSON.stringify(this.models._synthetics)
          : "";
    }
        if (this.models._ssl) {
      d["_ssl"] = JSON.stringify(this.models._ssl);
    }
    if (isdelete) {
      d = {
        status: "Deleted",
        id,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
    }

    this.alertConfigService.update(d).subscribe(
      (result) => {
        this.savingAlert = false;
        JSON.parse(result._body);
        this.addAlertModel = false;
        this.getAllAlerts();
        this.message.success("Alert updated.");
      },
      (err) => {
        this.savingAlert = false;
        this.message.error("Unable to update the alerts");
      }
    );
  }

  getAllRegions() {
    this.regionList = [];
    let condition = {
      status: "Active",
    };
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES,
        condition
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.regionList = response.data;
        } else {
          this.regionList = [];
        }
      });
  }
  getLookups() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        tenantid: this.userstoragedata.tenantid,
        lookupkey: AppConstant.LOOKUPKEY.DURATION,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.durationList = _.orderBy(response.data, ["lookupid"], ["asc"]);
        } else {
          this.durationList = [];
        }
      });
  }
  onCustomerChange(selectedCustomer: number) {
    this.models._customer = selectedCustomer;
    this.getfilteredInstance(this.models._account, selectedCustomer);
  }

  onAccountChange(selectedData: number) {
    this.models._account = selectedData;
    this.getfilteredInstance(selectedData, this.models._customer);
  }

  getfilteredInstance(
    selectedData?: number,
    selectedCustomer?: number,
    selectedTag?: number
  ) {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (selectedCustomer !== undefined && selectedCustomer !== null) {
      condition["_customer"] = selectedCustomer;
    }
    if (selectedData !== undefined && selectedData !== null) {
      condition["_account"] = selectedData;
    }
    if (selectedTag !== undefined && selectedTag !== null) {
      condition["_tag"] = selectedTag;
    }
    this.alertConfigService.instanceFilter(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.instanceList = response.data;
      } else {
        this.instanceList = [];
      }
    });
  }
  onSelectAllChange() {
    if (this.selectAll) {
      this.models._ssl = this.sslmonitoringLists.map((item) => item.id);
    } else {
      this.models._ssl = [];
    }
  }
}
