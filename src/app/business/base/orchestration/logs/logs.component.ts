import { Component, Input, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../app.constant";
import { differenceInMinutes } from "date-fns";
import { environment } from "src/environments/environment";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { Buffer } from "buffer";
import { OrchestrationService } from "../orchestration.service";
import { DeploymentsService } from "src/app/business/deployments/deployments.service";
import * as moment from "moment";
import { NzMessageService, NzModalService  } from "ng-zorro-antd";
import { ExptrService } from "../../assets/exptr-mapping/exptr.service";
@Component({
  selector: "app-orchestration-logs",
  templateUrl:
    "../../../../presentation/web/base/orchestration/logs/logs.component.html",
  styleUrls: ["../../../../presentation/web/base/orchestration/logs/logs.component.css"],
})
export class OrchestrationLogsComponent implements OnInit, OnDestroy {
  @Input() instanceObj: any;
  @Input() headerData: any;

  logstartdt = moment().subtract(24,"hours").format('YYYY-MM-DD HH:mm:ss');
  logenddt = new Date();
  logstatus = "";
  download = false;
  isLifecycleVisible = false;
  islocal = false;
  logorch = "";
  orchestrationLogHeaders = [
    { field: "title", header: "Title", datatype: "string", width: "200px" },
    {
      field: "orchname",
      header: "Orchestration",
      datatype: "string",
      width: "200px",
    },
    { field: "status", header: "Status", datatype: "string", width: "200px" },
    {
      field: "progress",
      header: "Progress",
      datatype: "string",
      width: "200px",
      isDisableSort: true,
    },
    {
      field: "duration",
      header: "Duration (Minutes)",
      datatype: "string",
      width: "200px",
      isDisableSort: true,
    },
    {
      field: "execution_start",
      header: "Run on",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss a",
      width: "200px",
    },
    {
      field: "execution_end",
      header: "Completed on",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss a",
      width: "200px",
    },
    {
      field: "createddt",
      header: "Created on",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss a",
      width: "200px",
    },
    {
      field: "createdby",
      header: "Created By",
      datatype: "string",
      width: "200px",
    },
  ];
  orchestrationLogList = [];

  orchestrationLogTableConfig = {
    edit: false,
    delete: false,
    log: false, //#OP_T620
    progress: false, //#OP_T620
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    manualpagination: true,
    apisort: true,
    retry:false,
    refresh: true,
    execute: false,
    loading: false,
    pageSize: 10,
    scroll: { x: "1300px" },
    title: "",
    widthConfig: [
      "200px",
      "200px",
      "200px",
      "200px",
      "200px",
      "200px",
      "200px",
      "200px",
      "200px",
      "150px"
    ],
    count: null,
  };
  order = ["lastupdateddt", "desc"];
  logOrder = ["execution_start", "desc"]
  userstoragedata: any = {};
  updateCtgryObj: any = {};
  screens = [];
  orchestrationList: any = [];
  orchLifeCycle: any = [];
  exptrID: any = [];
  appScreens: any = {};
  selectedData: any = {};
  file: any;
  fileloading: any;
  isLogVisible = false;
  triggerForm = {
    type: null,
    meta: {},
  };
  searchText = null;
  limit = 10;
  offset = 0;
  totalCount;
  constructor(
    private httpService: HttpHandlerService,
    private deploysltnService: DeploymentsService,
    private exptrService: ExptrService,
    private orchestrationsService: OrchestrationService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private modalService: NzModalService
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
    if (_.includes(this.appScreens.actions, "Show Progress")) {
      this.orchestrationLogTableConfig.progress = true;
    }
    if (_.includes(this.appScreens.actions, "Show Log")) {
      this.orchestrationLogTableConfig.log = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.download = true;
    }
    if (_.includes(this.appScreens.actions, "Retry")) {
      this.orchestrationLogTableConfig.retry = true;
    }
  }

  ngOnInit() {
    this.getAllExptrs();
    this.getOrchestrationList();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isEmpty(changes.headerData) &&
      !_.isEmpty(changes.headerData.currentValue)
    ) {
      this.getScheduledOrchestrationLogs();
    }
  }
  ngOnDestroy() {
  }

  getAllExptrs() {
    if (!this.logstartdt || !this.logenddt) {
      this.message.error("Please select date");
      return;
    }
    if (this.instanceObj) {
      let condition = {} as any;
      this.exptrID = [];
      condition = {
        tenantid: this.userstoragedata.tenantid,
        instancerefid: this.instanceObj["instancerefid"]
      };
      this.exptrService.listDashboards(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.data) {
          response.data.forEach(element => {
            if (element.exptrid) {
              this.exptrID.push(element.exptrid);
            }
          });
          this.getScheduledOrchestrationLogs();
        }
      });
    } else {
      this.getScheduledOrchestrationLogs();
    }
  }

  getOrchestrationList(limit?, offset?) {
    let condition: any = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }

    let query = `count=${true}&order=${this.order ? this.order : ""}`;

    this.orchestrationsService.all(condition, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.orchestrationList = response.data.rows;
      } else {
        this.orchestrationList = [];
      }
    });
  }

  getScheduledOrchestrationLogs(limit?, offset?) {
    this.orchestrationLogTableConfig.loading = true;
    let condition = {
      _tenant: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
    } as any;
    if (this.logstartdt && this.logenddt && !this.instanceObj && !this.headerData) {
      condition["startdate"] =
        moment(this.logstartdt).format("YYYY-MM-DD") + " 00:00:00";
      condition["enddate"] =
        moment(this.logenddt).format("YYYY-MM-DD") + " 23:59:59";
    }
    if (this.logstatus != "" && this.logstatus != null) {
      condition["status"] = this.logstatus;
    }
    if (this.logorch != "" && this.logorch != null) {
      condition["orchid"] = this.logorch;
    }
    if (this.exptrID && this.exptrID.length > 0) {
      condition["exptrids"] = this.exptrID;
    }
    if (this.headerData) {
      condition["scdlid"] = this.headerData.scdlid;
    }
    if (this.logOrder && this.logOrder != null) {
      condition["order"] = this.logOrder;
    }else {
      condition["order"] = ["execution_start", "desc"];
    }
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    let query = `limit=${limit ? limit : 10}&offset=${offset ? offset : 0
    }&order=${this.order ? this.order : ""}`;
    this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE_LOGS.LIST +`?${query}`,
        condition
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        this.orchestrationLogTableConfig.loading = false;
        if (response.status) {
          this.totalCount = response.count;
          this.orchestrationLogTableConfig.count = "Total Records" + ":" + " " + this.totalCount;
          this.orchestrationLogTableConfig.manualpagination = true;
          const data = response.data.map((o) => {
            const stat = o["status"];
            let progress = "-";

            if (stat && o["lifecycle"] != null) {
              const l = JSON.parse(o["lifecycle"]);
              const total = Object.keys(l).length;
              let progressed = 0;

              Object.values(l).forEach((v) => {
                if (v != null) {
                  progressed = progressed + 1;
                }
              });
              progressed = progressed - 1;
              progress = `${progressed} / ${l.total_nodes}`;
            }
            return {
              id: o["id"],
              createdby: o["createdby"],
              createddt: o["createddt"],
              title: o["schedule"]["title"],
              orchname: o["schedule"]["orchestration"]["orchname"],
              customer: o["customer"] ? o["customer"]["customername"] : "-",
              account: o["account"] ? o["account"]["name"] : "-",
              instance: "", //o["instance"]["instancename"],
              execution_start: o["execution_start"],
              execution_end: o["execution_end"],
              duration:
                stat == "Inprogress"
                  ? "-"
                  : differenceInMinutes(
                    o["execution_end"],
                    o["execution_start"]
                  ),
              status: o["status"],
              lifecycle: o["lifecycle"],
              progress,
              download: this.download //#OP_T620
                ? stat == "Completed" || stat == "Failed"
                  ? true
                  : false
                : false,
              href: `${environment.baseURL}/base/wazuh/file/${o["id"]}.log?type=Orchestrations`,
              instancelist: o["schedule"]["instances"],
              _orch:o["schedule"]["_orch"],
              _customer: o["schedule"]["_customer"],
              _account:o["schedule"]["_account"],
              _tag:o["schedule"]["_tag"],
              tagvalue:o["schedule"]["tagvalue"],
              recurring:o["schedule"]["recurring"],
              _maintwindow:o["schedule"]["_maintwindow"],
              runtimestamp:o["schedule"]["runtimestamp"],
              scheduled:o["schedule"]["scheduled"],
            };
          });
          this.orchestrationLogList = data;
        } else {
          this.orchestrationLogTableConfig.manualpagination = false;
        }
      });
  }
  retriggerOrchestration(orchdata: any) {
    const runGroup: any = JSON.parse(orchdata.instancelist);
    runGroup.title = orchdata.title;
    let data = {
      _orch: orchdata._orch,
      _tag: orchdata._tag,
      tagvalue: orchdata.tagvalue,
      _customer:orchdata._customer,
      _account: orchdata._account,
      _maintwindow: orchdata._maintwindow,
      runtimestamp: orchdata.runtimestamp,
      recurring:orchdata.recurring,
      cron: null,
      repetition: null,
      description: "",
      scheduled_run: "immediate",
      status: "Active",
      _tenant: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid" 
      ],
      createddt: new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      trigger: this.triggerForm.type,
      trigger_meta: JSON.stringify(this.triggerForm.meta),
      rungroups: [runGroup],
      headers:[],
      params:"{}"
    };
    const headers = {
      title: runGroup.groupname,
      value: [runGroup],
    };
    data.headers.push(headers);
    this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION.RUN,
        data
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          this.message.success(AppConstant.ORCHESTRATION.RETRIGGER_ORCH);
        }
      });
  }
  dataChangedScheduleLog(result) {
    if (result.retry) {
      this.modalService.confirm({
        nzTitle: `Are you sure that you want to rerun this ${result.data.title} orchestration`,
        nzContent: 'Click run button to continue',
        nzClosable: true,
        nzOkText: 'Run',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.orchestrationLogTableConfig.loading = true;
          setTimeout(() => {
            this.retriggerOrchestration(result.data);            
            this.orchestrationLogTableConfig.loading = false;
          }, 1000);
        },
        nzCancelText: 'Cancel',
      });
    }
    if (result.timeline) {
      const log = result.data;
      const lifecycle = JSON.parse(log["lifecycle"]);
      this.orchLifeCycle = [];

      for (const key in lifecycle) {
        if (key !== "total_nodes") {
          if (Object.prototype.hasOwnProperty.call(lifecycle, key)) {
            const value = lifecycle[key];
            this.orchLifeCycle.push({
              title: key.split("-###-").reverse()[0],
              status: value != null ? value["state"] : "",
              timestamp: value != null ? value["timestamp"] : "",
            });
          }
        }
      }
      this.isLifecycleVisible = true;
    } else if (result.refresh) {
      this.searchText = null;
      this.getScheduledOrchestrationLogs();
    } else if (result.log) {
      this.getLog(result.data);
    }
    if (result.pagination) {
      this.orchestrationLogTableConfig.pageSize = result.pagination.limit;
      this.getScheduledOrchestrationLogs(result.pagination.limit, result.pagination.offset);
    }
    if (result.searchText != "" && result.search) {
      this.searchText = result.searchText;
      this.getScheduledOrchestrationLogs(this.orchestrationLogTableConfig.pageSize, 0);
    }
    if (result.searchText == "") {
      this.searchText = null;
      this.getScheduledOrchestrationLogs(this.orchestrationLogTableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      let offset = (result.pageNo - 1) * 10;
      this.getScheduledOrchestrationLogs(this.orchestrationLogTableConfig.pageSize, offset);
    }
  }

  getLog(data?) {
    this.islocal = false;
    let query: string;
    if (data) {
      this.selectedData = data;
    } else {
      data = this.selectedData;
    }
    if (data.status == "Inprogress") {
      this.islocal = true;
      query = `?islocal=${true}`;
    }
    this.deploysltnService
      .viewlog({ deploymentid: data.id, folder: "Orchestrations" }, query)
      .subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          var buffer: any;
          if (this.islocal) {
            buffer = response.data.replace(/\\n/g, "\n");
            let file = buffer.replace(/\\/g, "");
            file = buffer.replace(/\r/g, "");
            this.file = file.replace(/u001b\[.*?m/g, "");
            this.file = this.file.replace(/\[.*?m/g, "");
          } else {
            buffer = Buffer.from(response.data.data);
          }
          if (response.status) {
            this.fileloading = false;
            this.file = buffer;
            this.isLogVisible = true;
          } else {
            this.fileloading = false;
            this.isLogVisible = false;
          }
        },
        (err) => {
          this.isLogVisible = false;
          this.fileloading = false;
          this.message.error("File not found!");
        }
      );
  }
}
