import { DecimalPipe } from "@angular/common";
import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import * as moment from "moment";

@Component({
  selector: "app-cloudmatiq-uptime-calendar",
  styles: [],
  templateUrl: "./uc.component.html",
})
export class UptimeCalendarComponent implements OnInit {
  @Input() month: string | Date;
  @Input() highlights = [];
  @Input() avg: number;
  currentMonth = moment();
  calendar: { week: number; days: moment.Moment[] }[] = [];

  constructor(private _decimalPipe: DecimalPipe) {}
  ngOnInit() {
    this.fillFirstWeek();
    this.currentMonth = moment(this.month);
  }

  fillFirstWeek() {
    const startWeek = moment(this.month).startOf("month").week();
    const endWeek = moment(this.month).endOf("month").week();

    for (var week = startWeek; week <= endWeek; week++) {
      this.calendar.push({
        week: week,
        days: Array(7)
          .fill(0)
          .map((n, i) =>
            moment()
              .week(week)
              .startOf("week")
              .clone()
              .add(n + i, "day")
          ),
      });
    }
  }
  getTooltipMsg(day: moment.Moment) {
    let msg = "";
    if (this.highlights && this.highlights[day.format("DD-MM-YYYY")]) {
      msg = this._decimalPipe.transform(
        this.highlights[day.format("DD-MM-YYYY")]["percentage"],
        "1.2-2"
      );
      switch (this.highlights[day.format("DD-MM-YYYY")]["color"]) {
        case "#f0f5f5":
          msg = msg + "%, No records on " + day.format("DD-MMM-YYYY");
          break;
        case "#A3E798":
          msg = msg + "%, No downtime recorded on " + day.format("DD-MMM-YYYY");
          break;
        case "#ffa64d":
          msg =
            msg +
            "%, Below average uptime recorded on " +
            day.format("DD-MMM-YYYY");
          break;
        case "#FF0000":
          msg = msg + "%, Downtime recorded on " + day.format("DD-MMM-YYYY");
          break;
      }
      return msg;
    }
  }

  getColorOfTheDay(day: moment.Moment) {
    if (day < moment(this.month).startOf("month")) {
      return "transparent";
    }
    return this.highlights && this.highlights[day.format("DD-MM-YYYY")]
      ? this.highlights[day.format("DD-MM-YYYY")]["color"]
      : "rgb(234, 234, 234)";
  }
}
