import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-monitoring-alerts",
  templateUrl:
    "../../../../../presentation/web/base/assets/monitoring-dashboard/monitoring-alerts/monitoring-alerts.component.html",
})
export class MonitoringAlertsComponent implements OnInit {
  createAlert = false;
  formTitle = "";
  alertList = [
    {
      policyname: "CPU is running high",
      metrics: "CPU",
      util: "is above 80%",
      duration: "5 min",
      status: "Active",
      lastupdatedby: "SYSTEM",
      lastupdateddt: new Date(),
    },
    {
      policyname: "Disk - Write is running high",
      metrics: "Disk",
      util: "is above 70%",
      duration: "5 min",
      status: "Active",
      lastupdatedby: "SYSTEM",
      lastupdateddt: new Date(),
    },
    {
      policyname: "Disk - Utilization is running high",
      metrics: "Disk",
      util: "is above 90%",
      duration: "15 min",
      status: "Active",
      lastupdatedby: "SYSTEM",
      lastupdateddt: new Date(),
    },
    {
      policyname: "Memory Utilization is running high",
      metrics: "Memory",
      util: "is above 75%",
      duration: "5 min",
      status: "Active",
      lastupdatedby: "SYSTEM",
      lastupdateddt: new Date(),
    },
  ];
  alertTableHeader = [
    { header: "Policy Name", field: "policyname", datatype: "string" },
    { header: "Metrics", field: "metrics", datatype: "string" },
    { header: "Utilization", field: "util", datatype: "string" },
    { header: "Duration", field: "duration", datatype: "string" },
    { header: "Status", field: "status", datatype: "string" },
    { header: "Updated By", field: "lastupdatedby", datatype: "string" },
    {
      header: "Updated On",
      field: "lastupdateddt",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ];
  alertTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    view: true,
    pageSize: 10,
    title: "",
    scroll: { x: "2000px" },
    widthConfig: [
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
    ],
  };
  constructor() {}

  ngOnInit() {}

  showModal() {
    this.formTitle = "Add Alert";
    this.createAlert = true;
  }
  onChanged(event) {
    this.createAlert = false;
  }
  dataChanged(e) {}
}
