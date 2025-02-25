import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-usage-monitoring",
  templateUrl:
    "../../../../../presentation/web/base/assets/monitoring-dashboard/usage-monitoring.component.html",
  styleUrls: ["./usage-monitoring.component.css"],
})
export class UsageMonitoringComponent implements OnInit {
  timeperiod = "off";
  range = "24";
  filters = { asset: null, utildt: new Date() } as any;
  showSidebar = true;
  zoneList = [];
  customersList = [];
  instanceList = [
    {
      title: "Brasilia",
      instancerefid: "07b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "DE1-TMS037",
      region: "us1",
      datacollected: false,
    },
    {
      title: "Copenhagen",
      instancerefid: "09b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "ECL-DE1-LBS023",
      region: "de1",
      datacollected: false,
    },
    {
      title: "Paris",
      instancerefid: "01b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "AWS-StorageGW",
      region: "us1",
      datacollected: false,
    },
    {
      title: "Brussels",
      instancerefid: "06b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "ECL-US1-ws016-Restore-OS1",
      region: "de1",
      datacollected: false,
    },
    {
      title: "Reykjavik",
      instancerefid: "08b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "ECLUS1PROBE04",
      region: "us1",
      datacollected: true,
    },
    {
      title: "Moscow",
      instancerefid: "07b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "UK1-TMS028",
      region: "us1",
      datacollected: true,
    },
    {
      title: "Madrid",
      instancerefid: "03b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "UK1-TMS027",
      region: "us1",
      datacollected: true,
    },
    {
      title: "London",
      instancerefid: "02b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "DE1-TMS038",
      region: "us1",
      datacollected: true,
    },
    {
      title: "Peking",
      instancerefid: "07b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "ECLDE1PROBE03",
      region: "us1",
      datacollected: true,
    },
    {
      title: "New Delhi",
      instancerefid: "01b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "DE1VSQLT0009",
      region: "us1",
      datacollected: true,
    },
    {
      title: "Tokyo",
      instancerefid: "09b2955f-0e69-4d34-9a6b-fdc4229c6596",
      instancename: "DE1VSQLT0008",
      region: "us1",
      datacollected: true,
    },
  ];
  constructor() {}

  ngOnInit() {}

  dataChanged(e) {
    if (e.view) {
      this.showSidebar = true;
    }
  }

  onChanged(e) {
    this.showSidebar = e;
  }

  notifyEntry() {
    this.showSidebar = true;
  }
}
