import { Component, OnDestroy, OnInit } from "@angular/core";
import { OrchestrationService } from "./orchestration.service";
import { AppConstant } from "../../../app.constant";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import downloadService from "../../../modules/services/shared/download.service";
import * as _ from "lodash";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { DeploymentsService } from "../../deployments/deployments.service";
import { Buffer } from "buffer";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { SrmService } from "../../srm/srm.service";
import * as moment from "moment";

@Component({
  selector: "app-orchestration",
  templateUrl:
    "../../../presentation/web/base/orchestration/orchestration.component.html",
  styles: [
    `
      #assetdetail td,
      #assetdetail th {
        border: 1px solid #dddddd30;
        padding: 8px;
      }

      #assetdetail tr:nth-child(even) {
        background-color: #dddddd1c;
      }

      #assetdetail tr {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      .ant-drawer {
        .ant-drawer-header {
          overflow-y: inherit;
        }
      }
    `,
  ],
})
export class OrchestrationComponent implements OnInit, OnDestroy {
  limit = 10;
  offset = 0;
  totalCount;
  totalHeaderCount;
  orchestrationList = [];
  orchestrationSchedulesList = [];
  categoryList = [];
  scheduleHeaderList = [];
  isVisible = false;
  isdownload = false;
  isVisibleLookup = false;
  isLifecycleVisible = false;
  execOrchModel = false;
  selectedCategory = 0;
  formTitle = "Add Orchestration";
  buttonText = "Add";
  lookupFormTitle = "Add Category";
  orchestrationObj: any = {};
  userstoragedata: any = {};
  updateCtgryObj: any = {};
  screens = [];
  appScreens: any = {};
  visibleadd = false;
  logstartdt = moment().subtract(7, "days").format('YYYY-MM-DD HH:mm:ss');
  logenddt = new Date();
  logstatus = "";
  logorch = "";
  schedulestatus = "Active";
  selectedSchedule = null;
  selectedOrch = null;
  file: any;
  islocal = false;
  headerData: any = {};
  showAlert = false;
  fileloading: any;
  download = false; //#OP_T620
  order = ["lastupdateddt", "desc"];
  formData = {} as any;
  orchLifeCycle = [];
  isShowRecent:boolean = false;
  recentlyUsedArray = [];

  orchestrationListHeaders = [
    { field: "orchname", header: "Name", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];
  orchestrationSchedulesHeaders = [
    { field: "title", header: "Title", datatype: "string", isdefault: true },
    { field: "orchname", header: "Orchestration", datatype: "string", isdefault: true },
    {
      field: "runtimestamp",
      header: "Scheduled On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss a",
      isdefault: true,
    },
    { field: "customername", header: "Customer", datatype: "string", isdefault: true },
    { field: "accountname", header: "Account", datatype: "string", isdefault: true },
    { field: "tagname", header: "Tag", datatype: "string", isdefault: true },
    { field: "tagvalue", header: "Tag Value", datatype: "string", isdefault: true },
    { field: "runs", header: "Runs", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,      
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];
  scheduleHdrHeaders = [
    { field: "title", header: "Title", datatype: "string", width: "200px", isdefault: true },
    {
      field: "orchname",
      header: "Orchestration",
      datatype: "string",
      width: "200px",
      isdefault: true,
    },
    {
      field: "totalrun",
      header: "Total Run",
      datatype: "string",
      width: "100px",
      isdefault: true,
    },
    { field: "pendingrun", header: "Pending", datatype: "string", width: "100px", isdefault: true },
    { field: "inprogress", header: "In progress", datatype: "string", width: "120px", isdefault: true },
    { field: "cmpltdrun", header: "Completed", datatype: "string", width: "100px", isdefault: true },
    { field: "successrun", header: "Success", datatype: "string", width: "100px", isdefault: true },
    { field: "failedrun", header: "Failed", datatype: "string", width: "100px", isdefault: true },
    { field: "duration", header: "Duration", datatype: "string", width: "100px", isdefault: true },
    {
      field: "starttime",
      header: "Started on",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "200px",
      isdefault: true,
    },
    {
      field: "endtime",
      header: "Completed on",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "200px",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", width: "100px", isdefault: true },
    { field: "createdby", header: "Initiated By", datatype: "string", width: "200px", isdefault: true },
  ];

  selectedData = {} as any;
  orchestrationTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    manualpagination: true,
    refresh: true,
    columnselection: true,
    apisort: true,
    execute: false, //#OP_T620
    loading: false,
    clone: false,
    pageSize: 10,
    count: null,
    title: "",
    publish: true,
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };
  orchestrationScheduleTableConfig = {
    edit: false,
    delete: false, //#OP_T620
    view: false, //#OP_T620
    globalsearch: true,
    manualsearch: true,
    pagination: true,
    columnselection: true,
    apisort: true,
    execute: false,
    refresh: true,
    loading: false,
    pageSize: 10,
    count: null,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };
  scheduleHeaderTableConfig = {
    edit: false,
    pagination: false,
    manualpagination: true,
    apisort: true,
    delete: false,
    log: false, //#OP_T620
    download: false, //#OP_T620
    globalsearch: true,
    manualsearch: true,
    columnselection: true,
    refresh: true,
    count: null,
    execute: false,
    loading: false,
    pageSize: 10,
    scroll: { x: "1400px" },
    title: "",
    widthConfig: [
      "200px",
      "200px",
      "100px",
      "100px",
      "120px",
      "120px",
      "100px",
      "100px",
      "100px",
      "200px",
      "200px",
      "100px",
      "200px",
      "100px",
    ],
  };
  searchText = null;
  timer: any;
  isView = false;
  orchObj = {} as any;
  title = "";
  categoryName = "";
  orchid;
  selectedcolumns = [] as any;
  orchData = {}
  catalogList: any[] = [];
  tabIndex = 0  as number;
  constructor(
    private deploysltnService: DeploymentsService,
    private orchestrationsService: OrchestrationService,
    private router: Router,
    private commonService: CommonService,
    private httpService: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private routes: ActivatedRoute,
    private srmService: SrmService,
    private modal: NzModalService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ORCHESTRATION,
    });
    this.getCategoryList();
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.orchestrationTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.orchestrationTableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Clone")) {
      this.orchestrationTableConfig.clone = true;
    }
    //#OP_T620
    if (_.includes(this.appScreens.actions, "Run")) {
      this.orchestrationTableConfig.execute = true;
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.orchestrationScheduleTableConfig.view = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.orchestrationScheduleTableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Show Log")) {
      this.scheduleHeaderTableConfig.log = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.download = true;
      this.scheduleHeaderTableConfig.download = true;
    }
  this.routes.params.subscribe((params)=>{
      this.orchid = params.id
    })
    this.selectedcolumns = [];
    this.selectedcolumns = this.orchestrationSchedulesHeaders.filter((el) => {
      return el.isdefault == true;
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.scheduleHdrHeaders.filter((el) => {
      return el.isdefault == true;
    });
  
  }

  ngOnInit() {
    this.getOrchestrationList();
    // this.getScheduledOrchestrations();
    // this.getscheduleHeader();
    // this.timer = setInterval(() => {
    //   this.getscheduleHeader();
    // }, 15000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }

  orchTabChange(event) {
    this.tabIndex = event.index;
    this.searchText = null;
    this.order = ["lastupdateddt", "desc"];
    switch (this.tabIndex) {
      case 0:
        this.getOrchestrationList();
        break;
      case 1:
        this.getScheduledOrchestrations();
        break;
      case 2:
        this.getscheduleHeader();
        break;
      default:
        break;
    }
    if(this.tabIndex === 0){
      this.isShowRecent = false;
    }
  }
  
  getOrchestrationList(limit?, offset?) {
    let query;
    this.orchestrationTableConfig.loading = true;
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.selectedCategory) condition.categoryid = this.selectedCategory;
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
    if(this.isShowRecent == true)  {
      query = `count=${true}&order=${this.order ? this.order : ""}`
    }else {
      query = `count=${true}&limit=${limit ? limit : 10}&offset=${offset ? offset : 0
    }&order=${this.order ? this.order : ""}`;
    }
    this.orchestrationsService.all(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.orchestrationTableConfig.manualpagination = true;
        this.totalCount = response.data.rows.length;
        this.orchestrationTableConfig.count = "Total Records" + ":" + " " + this.totalCount;
        this.orchestrationList = response.data.rows;
        this.orchestrationTableConfig.loading = false;
        if(this.isShowRecent == true) { // T3687 Show recently used orchestrations
          let filteredOrchestrationList = this.orchestrationList.filter(orch => 
              this.scheduleHeaderList.find(e => e.orchid === orch.orchid)
          );
          this.orchestrationList = filteredOrchestrationList;
          this.orchestrationTableConfig.count = "Total Records" + ":" + " " + filteredOrchestrationList.length;
          this.orchestrationTableConfig.manualpagination = false;
        }
      } else {
        this.totalCount = 0;
        this.orchestrationList = [];
        this.orchestrationTableConfig.loading = false;
        this.orchestrationTableConfig.manualpagination = false;
      }
    });
  }
  getRecentOrch(e){  //T3687 Show recently used orchestrations
   if(this.isShowRecent == true){
    this.getscheduleHeader();
   }
    else{
      this.getOrchestrationList();
    }
  }

  getscheduleHeader(limit?, offset?) {
    let query;
    if(this.isShowRecent == true && this.tabIndex == 0) {
      let condition: any = {
        tenantid: this.userstoragedata.tenantid,
      };
      query = `recentorch=${true}`
      this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE_HDR.LIST + `?${query}`,
        condition
      )
      .subscribe((result) => {
        const response = JSON.parse(result._body);
        if (response.data) {
            this.scheduleHeaderList = response.data.rows.map((o) => {
              o.orchname = o.orchestration ? o.orchestration.orchname : "";
              return o;
            });
            this.totalHeaderCount = response.data.count;
              this.getOrchestrationList();
        } else {
          this.scheduleHeaderList = [];
        }
      });
    }else { 
      this.scheduleHeaderTableConfig.loading = true;
      let condition: any = {
        tenantid: this.userstoragedata.tenantid,
      };
        if (this.tabIndex === 2 && (!this.logstartdt || !this.logenddt))  {
          this.scheduleHeaderTableConfig.loading = false;
          this.message.error("Please select date");
          return
        }
      if (this.logstartdt && this.logenddt) {
        condition.startdate = this.logstartdt;
        condition.enddate = this.logenddt;
      }
      if (this.logstatus) {
        condition.status = this.logstatus;
      }
      if (this.logorch) {
        condition.orchid = this.logorch;
      }
      if (this.searchText != null ) {
        condition["searchText"] = this.searchText;
      }    
        query = `limit=${limit ? limit : 10}&offset=${offset ? offset : 0
        }&order=${this.order ? this.order : ""}`;
      if (this.isdownload) {
        query = `download=${this.isdownload}`;
        condition.scdlid = this.headerData.scdlid;
      }
      this.httpService
        .POST(
          AppConstant.ORCH_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE_HDR.LIST + `?${query}`,
          condition
        )
        .subscribe((result) => {
          const response = JSON.parse(result._body);
          if (response.data) {
            if (this.isdownload) {
              this.scheduleHeaderTableConfig.loading = false;
              this.isdownload = false;
              var buffer = Buffer.from(response.data.result.content.data);
              downloadService(
                buffer,
                `${response.data.title}.xlsx`
              );
            } else {
              this.scheduleHeaderList = response.data.rows.map((o) => {
                o.orchname = o.orchestration ? o.orchestration.orchname : "";
                return o;
              });
              this.scheduleHeaderTableConfig.manualpagination = true;
              this.totalHeaderCount = response.data.count;
              this.scheduleHeaderTableConfig.count = "Total Records" + ":" + " " + response.data.count;
              this.scheduleHeaderTableConfig.loading = false;
            }
          } else {
            this.scheduleHeaderList = [];
            this.scheduleHeaderTableConfig.loading = false;
            this.scheduleHeaderTableConfig.manualpagination = false;
          }
        });
    }
  }

  onChangeCategory(event) {
    this.selectedCategory = event;
    this.getOrchestrationList();
  }
  showLookup(update?) {
    this.updateCtgryObj = {};
    if (update) this.lookupFormTitle = "Update Category";
    if (update) {
      this.updateCtgryObj = this.categoryList.find((el) => {
        return el.lookupid == this.selectedCategory;
      });
    }
    this.categoryName = this.updateCtgryObj.keyvalue;
    this.isVisibleLookup = true;
  }
  saveLookup() {
    let updateObj = {
      tenantid: this.userstoragedata.tenantid,
      lookupkey: AppConstant.LOOKUPKEY.ORCH_CATEGORY,
      keyname: "Category",
      keyvalue: this.categoryName,
      datatype: AppConstant.PARAM_TYPES[0],
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    if (this.updateCtgryObj && this.updateCtgryObj.lookupid) {
      updateObj = this.updateCtgryObj;
      this.httpService
        .POST(AppConstant.ORCH_END_POINT + AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.UPDATE,
          {
            lookupid: this.updateCtgryObj.lookupid,
            keyvalue: this.categoryName,
          }
        )
        .subscribe((result) => {
          this.isVisibleLookup = false;
          this.message.success(`Category updated successfully`);
          this.getCategoryList();
        });
    } else {
      this.httpService
        .POST(AppConstant.ORCH_END_POINT + AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.CREATE,
          updateObj
        )
        .subscribe((result) => {
          this.message.success(`Category created successfully`);
          this.isVisibleLookup = false;
          this.getCategoryList();
        });
    }
  }
  onChanged(val) {
    this.isVisible = val;
  }
  getCategoryList() {
    let condition = {} as any;
    this.categoryList = [{ keyvalue: "All", lookupid: 0 }]
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.ORCH_CATEGORY,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.categoryList = [...this.categoryList, ...response.data];
      } else {
        this.categoryList = [{ keyvalue: "All", lookupid: 0 }]
      }
    });
  }
  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.router.navigate(["orchestration/edit", result.data.orchid]);
    } else if (result.delete) {
      this.deleteRecord(result.data);
    } else if (result.execute) {
      this.selectedOrch = result.data.orchid;
      this.selectedSchedule = null;
      this.router.navigate(["orchestration/run"], {
        queryParams: {
          orchid: result.data.orchid,
          title: result.data.orchname,
        },
      });
    } else if (result.clone) {
      this.isVisible = true;
      this.router.navigate(["orchestration/clone", result.data.orchid]);
    }
    if (result.pagination) {
      this.orchestrationTableConfig.pageSize = result.pagination.limit;
      this.getOrchestrationList(result.pagination.limit, result.pagination.offset);
    }
    if (result.refresh) {
      this.searchText = null;
      this.getOrchestrationList();
    }
    if (result.searchText != "" && result.search) {
      this.searchText = result.searchText;
      this.getOrchestrationList(this.orchestrationTableConfig.pageSize, 0);
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getOrchestrationList(this.orchestrationTableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      let offset = (result.pageNo - 1) * 10;
      this.getOrchestrationList(this.orchestrationTableConfig.pageSize, offset);
    }
    if (result.publish) {
      if (result.data.catalog && result.data.catalog.publishstatus === 'Published') {
        this.modal.confirm({
          nzTitle: 'Are you sure you want to unpublish?',
          nzOkText: 'Yes',
          nzOkType: 'primary',
          nzOnOk: () => {
            const formdata = new FormData();
            this.formData.catalogid = result.data.catalog.catalogid;
            this.formData.publishstatus = AppConstant.STATUS.DELETED;
            this.formData.referenceid = result.data.referenceid;
            this.formData.tenantid = this.userstoragedata.tenantid;
            this.formData.lastupdatedby = this.userstoragedata.fullname;
            this.formData.lastupdateddt = new Date();
            this.formData.status = AppConstant.STATUS.DELETED;
            formdata.append("formData", JSON.stringify(this.formData));
            this.srmService.updateCatalog(formdata).subscribe((result)=> {
              let response =  JSON.parse(result._body);
              if (response.status) {
                this.message.success(response.message);
                this.getOrchestrationList();
              } else {
                this.message.error(response.message);
              }
            })
          },
          nzCancelText: 'No',
          nzOnCancel: () => console.log('Cancel')
        });
      } else {
        this.modal.confirm({
          nzTitle: 'Are you sure you want to publish?',
          nzOkText: 'Yes',
          nzOkType: 'primary',
          nzOnOk: () => {
            this.router.navigate(["srm/catalog/create"], {
              queryParams: {
                referencetype: "Orchestration",
                referenceid: result.data.orchid,
                servicename: result.data.orchname,
              },
            });
          },
          nzCancelText: 'No',
          nzOnCancel: () => console.log('Cancel')
        });
      }
    } 
  }

  unPublishOrchestration(data){
    // let formdata = {} as any;
    // formdata = {
    //   catalogid: data.catalog.catalogid,
    //   publishstatus: AppConstant.STATUS.PENDING,
    //   lastupdatedby: this.userstoragedata.fullname,
    //   lastupdateddt: new Date(),
    // };

    // const formData = new FormData();
    // formData.append("formData", JSON.stringify(formdata));

    // this.srmService.updateCatalog(formData).subscribe((result) => {
    //   let response = {} as any;
    //   response = JSON.parse(result._body);
    //   if (response.status) {
    //     this.message.success(response.message);
    //     this.getOrchestrationList();
    //   } else {
    //     this.message.error(response.message);
    //   }
    //   (error) => {
    //     console.error("Error updating catalog:", error);
    //     this.message.error("Failed to update catalog.");
    //   }
    // })
  }

  dataChangedScheduleHdr(result) {
    this.headerData = result.data;
    if (result.refresh) {
      this.searchText = null;
      this.getScheduledOrchestrations();
      this.getscheduleHeader();
    } if (result.log) {
      this.showAlert = true;
      this.headerData = result.data;
    }
    if (result.pagination) {
      this.scheduleHeaderTableConfig.pageSize = result.pagination.limit;
      this.getscheduleHeader(result.pagination.limit, result.pagination.offset);
    }
    if (result.searchText != '' && result.search) {
      this.searchText = result.searchText;
        this.getscheduleHeader(this.scheduleHeaderTableConfig.pageSize, 0);
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getscheduleHeader(this.scheduleHeaderTableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      let offset = (result.pageNo - 1) * 10;
      this.getscheduleHeader(this.scheduleHeaderTableConfig.pageSize, offset);
    }
    if (result.download) {
      this.isdownload = true;
      this.getscheduleHeader(this.scheduleHeaderTableConfig.pageSize, 0);
    }
  }
  dataChangedScheduled(result) {
    if (result.edit) {
      this.execOrchModel = true;
      this.selectedSchedule = result.data;
    } else if (result.delete) {
      this.deleteScheduledOrchestration(result.data.id, result.data.title);
    } else if (result.refresh) {
      this.searchText = null;
      this.getScheduledOrchestrations();
      this.getscheduleHeader();
    } else if (result.view) {
      this.isView = true;
      this.orchObj = result.data;
      this.orchObj.targetcount = result.data.runs.split("/")[1];
      this.title =
        this.orchObj.title + "-" + this.orchObj.orchestration.orchname;
      this.orchObj.targets = JSON.parse(result.data.instances);
      console.log(this.orchObj);
    }else if (result.searchText != '' && result.search) {
      this.searchText = result.searchText;
      this.getScheduledOrchestrations();
    }else if (result.searchText == "") {
      this.searchText = null;
      this.getScheduledOrchestrations();
    }
  }

  deleteRecord(data) {
    const formdata = {
      orchid: data.orchid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    const formData = new FormData();
    formData.append("formData", JSON.stringify(formdata));
    if (
      data.orchname == "Data collection Windows" ||
      data.orchname == "Data collection Linux"
    ) {
      this.message.error(
        `This is a default orchestration which can't be deleted`
      );
    } else {
      this.orchestrationsService.update(formdata).subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          response.data.status === AppConstant.STATUS.DELETED
            ? this.message.success(
              "#" + response.data.orchid + " Deleted Successfully"
            )
            : this.message.success(response.message);
          this.getOrchestrationList();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }

  getScheduledOrchestrations() {
    let condition = {
      _tenant: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    };
    if (this.schedulestatus != "") {
      condition["schedulestatus"] = this.schedulestatus;
    }
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    this.orchestrationScheduleTableConfig.loading = true;
    this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE.LIST,
        condition
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        this.orchestrationScheduleTableConfig.count = "Total Records" + ":" + " " + response.data.length;
        this.orchestrationScheduleTableConfig.loading = false;
        if (response.status) {
          this.orchestrationSchedulesList = response.data.map((o) => {
            return {
              ...o,
              orchname: o["orchestration"] ? o["orchestration"]["orchname"] : "",
              customername: o["customer"] ? o["customer"]["customername"] : "",
              accountname: o["account"] ? o["account"]["name"] : "",
              tagname: o["tag"] ? o["tag"]["tagname"] : "",
              runs: `${o["totalrun"]} / ${o["expectedrun"]}`,
              status:
                o["totalrun"] == o["expectedrun"] ? "Completed" : o["status"],
            };
          });
        } else {
        }
      });
  }

  deleteScheduledOrchestration(id: string, title: string) {
    this.httpService
      .DELETE(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE.DELETE +
        id +
        "?title=" +
        title
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.getScheduledOrchestrations();
          this.message.info("Schedule removed.");
        } else {
          this.message.info(response.message);
        }
      });
  }
}
