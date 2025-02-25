import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "../ssm.service";
import * as Papa from "papaparse";

@Component({
  selector: "app-cloudmatiq-commandhistory",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/runcommand/command-history.component.html",
  styles: [],
})
export class CommandHistoryComponent implements OnInit {
  commandList = [];
  userstoragedata = {} as any;
  @Input() region;
  @Input() refresh;
  @Input() commandtype;
  @Input() accountid;
  viewInstance = false;
  selectedData = {} as any;
  totalCount = null;
  tableHeader = [
    {
      field: "CommandId",
      header: "Command ID",
      datatype: "string",
      isdefault: true,
    },
    { field: "DocumentName", header: "Document name", datatype: "string", isdefault: true },
    {
      field: "TargetCount",
      header: "#Target",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "CompletedCount",
      header: "Completed",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "ErrorCount",
      header: "Error",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "DeliveryTimedOutCount",
      header: "Delivery TimedOut",
      datatype: "string",
      isdefault: true,
    },
    { field: "Status", header: "Status", datatype: "string", isdefault: true },
  ];
  tableConfig = {
    tabledownload: false,
    refresh: true,
    edit: false,
    delete: false,
    view: true,
    columnselection: true,
    apisort:  true,
    globalsearch: true,
    pagination: true,
    loading: false,
    pageSize: 10,
    title: "",
  };
  appScreens = {} as any;
  screens = {} as any;
  selectedcolumns = [] as any;
  constructor(
    private localStorageService: LocalStorageService,
    private ssmService: SSMService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );

    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.NODE_MGMT,
    } as any);
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.region && changes.region.currentValue) ||
      (changes.accountid && changes.accountid.currentValue)
    ) {
      this.getCommands();
    }
    if (changes.commandtype && changes.commandtype.currentValue) {
      this.tableHeader = [
        { field: "operation", header: "Operation", datatype: "string", isdefault: true },
        {
          field: "CommandId",
          header: "Command ID",
          datatype: "string",
          isdefault: true,
        },
        { field: "DocumentName", header: "Document name", datatype: "string", isdefault: true },
        { field: "targets", header: "Targets", datatype: "string", isdefault: true },
        { field: "Status", header: "Status", datatype: "string", isdefault: true },
      ];
    }
  }
  dataChanged(event) {
    if (event.refresh) {
      this.getCommands();
    }
    if (event.view) {
      this.selectedData = event.data;
      this.viewInstance = true;
    }
    if (event.download) {
      let data = [];
      _.each(this.commandList, (m) => {
        data.push([
          m.operation,
          m.CommandId,
          m.DocumentName,
          m.targets,
          m.Status,
        ]);
      });
      this.downloadCSV(this.tableHeader, data);
    }
    if(event.search){
      this.totalCount = event.totalCount;
    }
  }
  downloadCSV(header, data) {
    let hdr = [];
    _.map(header, (itm) => {
      hdr.push(itm.header);
    });
    var csv = Papa.unparse([[...hdr], ...data]);

    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    csvURL = window.URL.createObjectURL(csvData);

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", "download.csv");
    tempLink.click();
  }
  getCommands() {
    this.tableConfig.loading = true;
    let condition = {
      region: this.region,
      commandtype: this.commandtype,
      tenantid : this.userstoragedata.tenantid
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.ssmService.allCommands(condition).subscribe(
      (result) => {
        this.tableConfig.loading = false;
        let response = JSON.parse(result._body);
        if (response.status) {
          this.commandList = _.map(response.data, (itm) => {
            itm.targets = "-";
            if (itm.Targets != undefined && itm.Targets.length > 0) {
              itm.targets = itm.Targets[0].Values.join(",");
            }
            if (
              itm.Parameters.Operation != undefined &&
              itm.Parameters.Operation.length > 0
            ) {
              itm.operation = itm.Parameters.Operation.join(",");
            }

            return itm;
          });
          this.totalCount = this.commandList.length;
        }
      },
      (err) => {
        this.tableConfig.loading = false;
      }
    );
  }
  closeDrawer() {
    this.viewInstance = false;
    this.selectedData = {};
  }
}
