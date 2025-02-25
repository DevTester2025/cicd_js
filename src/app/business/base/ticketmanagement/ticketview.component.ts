import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { IncidentService } from "../../tenants/customers/incidents.service";

@Component({
  selector: "app-cloudmatiq-ticket-view",
  templateUrl:
  "../../../presentation/web/base/ticketmanagement/ticketview.component.html",
  styles: [
    `
      #eventdetail div {
        color: #fff;
        font-size: 13px;
        padding: 10px;
        font-family: "Open Sans", sans-serif;
      }
    `,
  ],
})
export class TicketViewComponent implements OnInit {
  selectedObj = {} as any;
  @Input() id;
  constructor(
    private incidentService: IncidentService
  ) {
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes.id.currentValue != undefined) {
      this.id = changes.id.currentValue;
      this.getData();
    }
  }
  getData() {
    this.incidentService.byId(this.id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.selectedObj = response.data;
      } else {
        this.selectedObj = {};
      }
    });
  }
}
