import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "../ssm.service";
import * as Papa from "papaparse";

@Component({
  selector: "app-cloudmatiq-association",
  styles: [],
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/statemanager/association.component.html",
})
export class AssociationComponent implements OnInit {
  assList = [];
  userstoragedata = {} as any;
  @Input() region;
  @Input() refresh;
  @Input() associationtype;
  @Input() accountid;
  viewLog = false;
  selectedData = {};
  totalCount = null;
  tableHeader = [
    { field: "AssociationId", header: "Association id", datatype: "string", isdefault: true },
    {
      field: "AssociationName",
      header: "Association name",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "Name",
      header: "Document name",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "AssociationVersion",
      header: "Association version",
      datatype: "string",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];
  tableConfig = {
    edit: false,
    delete: false,
    view: true,
    refresh: true,
    globalsearch: true,
    columnselection: true,
    apisort: true,
    pagination: true,
    loading: false,
    pageSize: 10,
    title: "",
    tabledownload: false,
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
      this.getAssociations();
    }
    if (changes.associationtype && changes.associationtype.currentValue) {
      this.tableHeader = [
        {
          field: "AssociationId",
          header: "Association id",
          datatype: "string",
          isdefault: true,
        },
        {
          field: "AssociationName",
          header: "Association name",
          datatype: "string",
          isdefault: true,
        },
        { field: "targets", header: "Targets", datatype: "string", isdefault: true },
        { field: "status", header: "Status", datatype: "string", isdefault: true },
      ];
    }
  }
  dataChanged(event) {
    if (event.refresh) {
      this.getAssociations();
    }
    if (event.view) {
      this.selectedData = event.data;
      this.viewLog = true;
    }
    if (event.download) {
      let data = [];
      _.each(this.assList, (m) => {
        if (this.associationtype == "INVENTORY") {
          data.push([m.AssociationId, m.AssociationName, m.targets, m.status]);
        } else {
          data.push([
            m.AssociationId,
            m.AssociationName,
            m.Name,
            m.AssociationVersion,
            m.status,
          ]);
        }
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
  getAssociations() {
    this.tableConfig.loading = true;
    let formData = {
      region: this.region,
      tenantid: this.userstoragedata.tenantid,
      type: this.associationtype,
    } as any;
    if (this.accountid != null && this.accountid != undefined) {
      formData["accountid"] = this.accountid;
    }
    this.ssmService.allAssociations(formData).subscribe(
      (result) => {
        this.tableConfig.loading = false;
        let response = JSON.parse(result._body);
        if (response.status && response.data) {
          this.assList = _.map(response.data, (itm) => {
            itm.targets = itm.Targets[0].Values.join(",");
            itm.status = itm.Overview.Status;
            return itm;
          });
          this.totalCount = this.assList.length;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  closeDrawer() {
    this.viewLog = false;
    this.selectedData = {};
  }
}
