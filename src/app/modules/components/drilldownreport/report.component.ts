import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { BillingService } from "src/app/business/base/assets/billing/billing.service";
import * as Papa from "papaparse";
import * as moment from "moment";
import { AppConstant } from "src/app/app.constant";

@Component({
  selector: "app-cloudmatiq-resource-billing",
  styles: [],
  templateUrl: "./report.component.html",
})
export class ResourceBilling implements OnInit, OnChanges {
  @Input() groupby: "resourceid" | "resourcetype";
  @Input() tenantid: number;

  @Input() startdate: string;
  @Input() enddate: string;
  @Input() options: {
    resourcetype?: string;
    filters?: Record<string, any>;
  };

  hidden: boolean = true;
  drillDownTableHeader = null as string[];
  drillDownTablebody = null as string[][];
  drillDownDuration = null as null | string;
  order;
  // #OP_B770
  userstoragedata = {} as any;
  appScreens = {} as any;
  screens = [];
  rolename: any;
  download = false;

  constructor(private billingService: BillingService,
    private localStorageService: LocalStorageService,){
      this.userstoragedata = this.localStorageService.getItem(
        AppConstant.LOCALSTORAGE.USER
      );
      // #OP_B770
      this.rolename = this.userstoragedata.roles.rolename;
      this.screens = this.localStorageService.getItem(
        AppConstant.LOCALSTORAGE.SCREENS
      );
      this.appScreens = _.find(this.screens, {
        screencode: AppConstant.SCREENCODES.ASSET_BILLING,
      });
      if (_.includes(this.appScreens.actions, "Download")) {
        this.download = true;
      }
    }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.startdate && this.enddate && this.groupby) {
      this.getResourceLevelData(this.startdate, this.enddate, this.options);
    } else {
      this.drillDownTableHeader = null;
      this.drillDownTablebody = null;
    }
  }
  ngOnInit() {
    if (this.startdate && this.enddate && this.groupby) {
      this.getResourceLevelData(this.startdate, this.enddate, this.options);
    }
  }

  downloadCSV() {
    console.log("To download csv .>>>>");
    var csv = Papa.unparse([
      [...this.drillDownTableHeader],
      ...this.drillDownTablebody,
    ]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }

  getResourceLevelData(
    startdate: string,
    enddate: string,
    options?: {
      resourcetype?: string;
      filters?: Record<string, any>;
    }
  ) {
    let o = {
      startdate,
      enddate,
      tenantid: this.tenantid,
    };

    if (this.order) o["order"] = this.order;

    if (options.resourcetype) {
      o["resourcetype"] = options.resourcetype;
    }
    if (options.filters) {
      o["filters"] = options.filters;
    }

    if (startdate == enddate) {
      this.drillDownDuration = moment(startdate).format("DD-MMM-YYYY");
    } else {
      this.drillDownDuration = ` ${moment(startdate).format(
        "DD-MMM-YYYY"
      )} to ${moment(enddate).format("DD-MMM-YYYY")}`;
    }

    this.billingService.getDrillDown(o).subscribe(
      (r) => {
        const res: {
          code: number;
          data: {
            resourcetype: string;
            resourceid: null;
            date: Date;
            cost: string;
          }[];
          message: string;
          status: string;
        } = JSON.parse(r._body);

        const headers = ["Service / Resource ID"];
        let body = [];

        const dates = _.groupBy(res.data, "date");
        const resources = _.groupBy(res.data, this.groupby);

        for (const key in dates) {
          if (Object.prototype.hasOwnProperty.call(dates, key)) {
            headers.push(moment(key).format("DD-MMM-YYYY"));
          }
        }

        for (const key in resources) {
          if (Object.prototype.hasOwnProperty.call(resources, key)) {
            const element = resources[key];

            const row = [key];

            element.forEach((el) => {
              if (dates[el.date as any as string]) {
                row.push(el.cost);
              } else {
                row.push("");
              }
            });
            body.push(row);
          }
        }

        this.drillDownTableHeader = headers;
        this.drillDownTablebody = body;

        console.log(body);
      },
      (err) => {
        console.log("Error in getting drill down data.");
        console.log(err);
      }
    );
  }

  sort(sortName: string, value: string): void {
    if (value != null) {
      this.order = [sortName, value == "ascend" ? "ASC" : "DESC"];
      this.getResourceLevelData(this.startdate, this.enddate, this.options);
    }
  }
}
