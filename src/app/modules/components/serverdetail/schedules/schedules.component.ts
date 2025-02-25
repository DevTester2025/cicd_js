import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { AppConstant } from 'src/app/app.constant';
import { OrchestrationService } from 'src/app/business/base/orchestration/orchestration.service';
import { DeploymentsService } from 'src/app/business/deployments/deployments.service';
import { HttpHandlerService } from 'src/app/modules/services/http-handler.service';
import { Buffer } from "buffer";
import { LocalStorageService } from 'src/app/modules/services/shared/local-storage.service';
import * as _ from "lodash";

@Component({
  selector: 'app-server-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css']
})
export class ServerSchedulesComponent implements OnInit, OnChanges {
  @Input() assetData: any;
  //schedules
  orchestrationList = [];
  orchLifeCycle = [];
  isVisible = false;
  isLogVisible = false;
  file: any;
  isLifecycleVisible = false;
  selectedOrch = null;
  selectedSchedule = null;
  execOrchModel = null;
  orchestrationSchedulesList = [];
  orchestrationSchedulesHeaders = [
    { field: "title", header: "Title", datatype: "string" },
    { field: "orchname", header: "Orchestration", datatype: "string" },
    { field: "runs", header: "Runs", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    { field: "status", header: "Status", datatype: "string" },
  ];

  orchestrationScheduleTableConfig = {
    edit: false,
    delete: true,
    globalsearch: true,
    pagination: true,
    execute: false,
    loading: false,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };

  orchestrationLogList = [];
  orchestrationLogHeaders = [
    { field: "title", header: "Title", datatype: "string" },
    { field: "orchname", header: "Orchestration", datatype: "string" },
    {
      field: "executed",
      header: "Run on",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    {
      field: "progress",
      header: "Progress",
      datatype: "string",
    },
    { field: "status", header: "Status", datatype: "string" },
  ];
  orchestrationLogTableConfig = {
    edit: false,
    delete: false,
    log: true,
    globalsearch: true,
    pagination: true,
    execute: false,
    loading: false,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };
  buttonText = "Add Schedule";
  userstoragedata: any = {};


  orchestrationTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    pagination: true,
    execute: true,
    loading: false,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
  };

  orchestrationListHeaders = [
    { field: "orchname", header: "Name", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    { field: "status", header: "Status", datatype: "string" },
  ];

  constructor(
    private orchestrationsService: OrchestrationService,
    private httpService: HttpHandlerService,
    private deploysltnService: DeploymentsService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private message: NzMessageService) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getOrchestrationList();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.assetData && !_.isEmpty(changes.assetData.currentValue)) {
      const a = changes.assetData.currentValue;
      this.getScheduledOrchestrations();
      this.getScheduledOrchestrationLogs();
    }
  }
  getScheduledOrchestrations() {
    this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE.LIST + `?instancerefids=[${this.assetData.instancerefid}]`,
        {
          _tenant: this.localStorageService.getItem(
            AppConstant.LOCALSTORAGE.USER
          )["tenantid"],
        }
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        console.log("Scheduled orchestrations response >>>>>");
        console.log(response);
        if (response.status) {
          this.orchestrationSchedulesList = response.data.map((o) => {
            return {
              ...o,
              orchname: o["orchestration"]["orchname"],
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

  dataChanged(result) {
    this.selectedOrch = result.data.orchid;
    this.selectedSchedule = null;
    this.router.navigate(["orchestration/run"], {
      queryParams: { orchid: result.data.orchid },
    });
  }
  dataChangedScheduled(result) {
    if (result.delete) {
      this.deleteScheduledOrchestration(result.data.id, result.data.title);
    }
  }

  getScheduledOrchestrationLogs() {
    this.httpService
      .POST(
        AppConstant.ORCH_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION_SCHEDULE_LOGS.LIST,
        {
          _tenant: this.localStorageService.getItem(
            AppConstant.LOCALSTORAGE.USER
          )["tenantid"],
          _instance: this.assetData.instancerefid
        }
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        console.log("Scheduled orchestrations response >>>>>");
        console.log(response);
        if (response.status) {
          const data = response.data.map((o) => {
            const stat = o["status"];
            let progress = "-";

            if (stat != "Completed" && o["lifecycle"] != null) {
              const l = JSON.parse(o["lifecycle"]);
              const total = Object.keys(l).length;
              let progressed = 0;

              Object.values(l).forEach((v) => {
                if (v != null) {
                  progressed += 1;
                }
              });

              progress = `${progressed} / ${total}`;
            }

            return {
              id: o["id"],
              title: o["schedule"]["title"],
              orchname: o["schedule"]["orchestration"]["orchname"],
              customer: o["customer"] ? o["customer"]["customername"] : "-",
              account: o["account"] ? o["account"]["name"] : "-",
              instance: o["instance"]["instancename"],
              executed: o["execution_start"],
              status: o["status"],
              lifecycle: o["lifecycle"],
              progress,
            };
          });
          this.orchestrationLogList = data;
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

  dataChangedScheduleLog(result) {
    if (result.log) {
      const log = result.data;
      if (log.status == "Completed") {
        this.getLog(result.data);
        return;
      }
      const lifecycle = JSON.parse(log["lifecycle"]);
      this.orchLifeCycle = [];
      for (const key in lifecycle) {
        if (Object.prototype.hasOwnProperty.call(lifecycle, key)) {
          const value = lifecycle[key];
          this.orchLifeCycle.push({
            title: key.split("-###-").reverse()[0],
            status: value != null ? value["state"] : "",
            timestamp: value != null ? value["timestamp"] : "",
          });
        }
      }
      this.isLifecycleVisible = true;
    }
  }

  getLog(data) {
    this.deploysltnService.viewlog({ deploymentid: data.id }).subscribe(
      (res) => {
        const response = JSON.parse(res._body);
        var buffer = Buffer.from(response.data.data);
        if (response.status) {
          this.file = buffer;
          this.isLogVisible = true;
        } else {
          this.isLogVisible = false;
        }
      },
      (err) => {
        this.isLogVisible = false;
        this.message.error("File not found!");
      }
    );
  }

  getOrchestrationList() {
    this.orchestrationsService
      .all({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.orchestrationList = response.data;
        } else {
          this.orchestrationList = [];
        }
      });
  }
}
