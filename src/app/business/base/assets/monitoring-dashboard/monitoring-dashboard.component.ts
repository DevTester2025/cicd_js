import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-monitoring-dashboard",
  templateUrl:
    "../../../../presentation/web/base/assets/monitoring-dashboard/monitoring-dashboard.component.html",
})
export class MonitoringDashboardComponent implements OnInit {
  current = "realtime";
  constructor() {}

  ngOnInit() {}
  changeView(to: string) {
    this.current = to;
  }
}
