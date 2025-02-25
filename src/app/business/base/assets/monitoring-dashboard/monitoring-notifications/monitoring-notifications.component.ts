import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-monitoring-notifications",
  templateUrl:
    "../../../../../presentation/web/base/assets/monitoring-dashboard/monitoring-notifications/monitoring-notifications.component.html",
  styleUrls: ["./monitoring-notifications.component.css"],
})
export class MonitoringNotificationsComponent implements OnInit {
  loading = false;
  loadingMore = false;
  showLoadingMore = true;
  ntfList = [
    {
      content:
        "CPU is running high for the instance DE1-TMS037(ID - 13ed312312323)",
      username: "Notified to Nambi",
      modeofnotification: "Email",
      createdby: "SYSTEM",
      createddt: new Date(),
    },
    {
      content:
        "Disk - Write is running high for the instance AWS-StorageGW(ID - 13ed312312323)",
      username: "Notified to CM Admin",
      modeofnotification: "Email",
      createdby: "SYSTEM",
      createddt: new Date(),
    },
    {
      content:
        "Disk - Utilization is running high for the instance ECL-DE1-LBS023(ID - 13ed312312323)",
      username: "Notified to CM Admin",
      modeofnotification: "Email",
      createdby: "SYSTEM",
      createddt: new Date(),
    },
  ];
  ntfTableHeader = [
    { header: "Message", field: "content", datatype: "string" },
    { header: "Notified To", field: "username", datatype: "string" },
    // { header: 'Mode of notification', field: 'modeofnotification', datatype: 'string' },
    // { header: 'Created By', field: 'createdby', datatype: 'string' },
    // { header: 'Created On', field: 'createddt', datatype: 'timestamp', format: 'dd-MMM-yyyy hh:mm:ss' },
  ];
  ntfTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    view: false,
    pageSize: 10,
    title: "",
    // scroll: { x: '2000px' },
    widthConfig: ["80px", "80px", "80px", "80px", "80px"],
  };
  data = [
    "Racing car sprays burning fuel into crowd.",
    "Japanese princess to wed commoner.",
    "Australian walks 100km after outback crash.",
    "Man charged over missing wedding girl.",
    "Los Angeles battles huge wildfires.",
  ];
  constructor() {}

  ngOnInit() {}

  dataChanged(e) {}
  onScroll() {}
  onLoadMore(): void {
    this.loadingMore = true;
    this.ntfList.push({
      content:
        "Memory - Utilization is running high for the instance ECL-DE1-LBS023(ID - 13ed312312323)",
      username: "Notified to CM Admin",
      modeofnotification: "Email",
      createdby: "SYSTEM",
      createddt: new Date(),
    });
    this.loadingMore = false;
  }
}
