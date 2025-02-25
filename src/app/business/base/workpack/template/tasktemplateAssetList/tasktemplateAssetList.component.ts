import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { WorkpackConstant } from "src/app/workpack.constant";
import { AWSAppConstant } from "src/app/aws.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { Router } from '@angular/router';
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import downloadService from "src/app//modules/services/shared/download.service";
import * as MarkJs from "mark.js";
import {
  IResourceType,
  IAssetHdr,
  IAssetDtl,
} from "src/app/modules/interfaces/assetrecord.interface";
@Component({
  selector: "app-takstemplateList",
  templateUrl: "./tasktemplateAssetList.component.html",
})
export class tasktemplateAssetListComponent implements OnInit {
  @Input() selectedTaskResourceId;
  @Input() selectedTaskResourceName = "";
  @Output() notifyTaskEditEntry = new EventEmitter();
  @Input() isExecutableVersion: boolean = false;
  loading = false;
  isVisible = false;
  workflowformTitle = "Workflow Selection";
  tableHeader = WorkpackConstant.COLUMNS.WORKPACKTEMPLATE;
  formTitle = "Add Tickets";
  resourceTypesList: IResourceType[] = [];
  pageIndex = 1;
  pageSize = 10;
  resource = {};
  filteredColumns = [];
  gettingAssets = false;
  assets = [] as Record<string, any>[];
  assetsCount = 0;
  selectedFields = null as null | any[];
  selectedResource = [];
  currentSortColumn = null;
  currentSortColumnOrder = null;
  globalSearchModel = "";
  isdownload = false;
  selectedcolumns: any = {};
  filterValues: any = {};
  templateObj = {};
  filterForm: FormGroup;
  selectedWorkflowTask;
  executionStatusList = AppConstant.WORKPACK_EXECUTIONSTATUS;
  userstoragedata: any;
  screens = [];
  appScreens = {} as any;
  visibleonly: boolean = false;
  visibleadd: boolean = false;
  visibleEdit: boolean = false;
  visibleDelete: boolean = false;
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
    private assetRecordService: AssetRecordService,
    private message: NzMessageService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    let workpack_screencode: any = AppConstant.SCREENCODES.WORKPACKTEMPLATE;
    this.appScreens = _.find(this.screens, {
      screencode: workpack_screencode
    });
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "View")) {
        this.visibleonly = true;
      }
      if (_.includes(this.appScreens.actions, "Create")) {
        this.visibleadd = true;
      }
      if (_.includes(this.appScreens.actions, "Edit")) {
        this.visibleEdit = true;
      }
      if (_.includes(this.appScreens.actions, "Delete")) {
        this.visibleDelete = true;
      }
    }

  }

  ngOnInit() {
    // this.getResourceDetail("crn:ops:workpack_taskstemplate");
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedTaskResourceId) {
      this.getResourceDetail();
      // this.getAssets();
    }
  }
  getResourceDetail() {
    if (this.selectedTaskResourceName && this.selectedTaskResourceId) {
      let r = this.resource[this.selectedTaskResourceName];
      if (!r) {
        this.selectedcolumns = {};
        this.filterValues = {};
        this.selectedResource = [];
        this.selectedFields = [];
        this.assets = [];
        this.assetRecordService
          .getResource(
            this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
            "tenantid"
            ],
            this.selectedTaskResourceName
          )
          .subscribe((d) => {
            let response: IAssetHdr[] = JSON.parse(d._body);
            this.selectedResource = response;
            this.filteredColumns = [];
            _.each(response, (itm: any, idx: number) => {
              itm.isSelected = itm.showbydefault ? true : false;
              if (itm.fieldtype != "Reference Asset") {
                this.filteredColumns.push(itm);
              }
              if (itm.fieldtype == "Reference Asset") {
                let referenceasset = JSON.parse(itm.referenceasset);
                _.map(referenceasset.attribute, (dtl) => {
                  let attribute: any = _.find(
                    AssetAttributesConstant.COLUMNS[referenceasset.assettype],
                    {
                      field: dtl,
                    }
                  );
                  this.filteredColumns.push({
                    referencekey: attribute.referencekey,
                    fieldname: attribute.header,
                    fieldtype: itm.fieldtype,
                    fieldkey: attribute.field,
                    linkid: attribute.linkid,
                    referenceasset: referenceasset,
                    assettype: referenceasset.assettype,
                  });
                });
              }
              this.pageIndex = 1;
              this.pageSize = 10;
              if (idx + 1 == response.length) {
                this.resource[this.selectedTaskResourceName] = {
                  filtered: this.filteredColumns,
                  selected: response,
                };
                if (this.selectedTaskResourceId.length > 0) {
                  this.getAssets();
                }
              }
            });
            this.filteredColumns = [..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"])];
            this.selectedTaskResourceName = this.selectedTaskResourceName;
            // response.forEach((o) => {
            //   if (o.showbydefault) {
            //     this.selectedcolumns[o.fieldkey] = true;
            //   }
            // });
          });
      } else {
        this.selectedcolumns = {};
        this.filterValues = {};
        this.selectedFields = [];
        this.assets = [];
        this.selectedResource = r.selected;
        this.selectedTaskResourceName = this.selectedTaskResourceName;
        this.pageIndex = 1;
        this.pageSize = 10;
        r.filtered.forEach((o) => {
          o.isSelected = false;
          if (o.showbydefault) {
            o.isSelected = true;
          }
        });
        this.filteredColumns = r.filtered;
        if (this.selectedTaskResourceId.length > 0) {
          this.getAssets();
        }
      }
    }
    else {
      this.selectedFields = [];
      this.assets = [];
      this.assetsCount = 0;
    }
  }
  getAssets() {
    this.gettingAssets = true;
    let selectedFields = [];
    let columns = [];
    _.map(this.filteredColumns, (itm: any) => {
      columns.push(
        _.pick(itm, [
          "fieldkey",
          "fieldname",
          "fieldtype",
          "assettype",
          "linkid",
          "isSelected",
          "referencekey",
          "ordernumber"
        ])
      );
      if (itm.isSelected) {
        selectedFields.push(
          _.pick(itm, [
            "fieldkey",
            "fieldname",
            "fieldtype",
            "assettype",
            "linkid",
            "isSelected",
            "referencekey",
            "ordernumber"
          ])
        );
        return itm;
      }
    });
    // let fields = Object.keys(this.selectedResource).filter((k) => {
    //   if (this.selectedResource[k]) {
    //     return k;
    //   }
    // });

    // // Fallback code. Picks the first column in case no column is selected.
    // if (fields.length <= 0) {
    //   fields = this.selectedResource.slice(0, 1).map((s) => s.crn);
    // }
    let resource = {};
    this.selectedTaskResourceId = _.uniq(this.selectedTaskResourceId);
    _.each(this.selectedTaskResourceId, (rs) => {
      resource[rs] = true;
    });
    this.filterValues.resource = resource;
    let f = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      crn: this.selectedTaskResourceName,
      fields: columns,
      // columns : columns,
      filters: this.filterValues,
    };
    f["status"] = AppConstant.STATUS.ACTIVE;
    if (selectedFields.length > 0) {

      this.assetRecordService.getResourceAssets(f).subscribe((r) => {
        this.gettingAssets = false;

        let response: { count: number; rows: Record<string, any>[] } =
          JSON.parse(r._body);
        this.selectedFields = selectedFields;
        this.selectedFields = [..._.orderBy(this.selectedFields, ["ordernumber", "id", "asc"])];
        this.assets = _.map(response.rows, (tt: any) => {
          tt.isExecutionCompleted = false;
          if (tt.dtl_operationtype == this.executionStatusList[0]) {
            tt.isExecutionCompleted = true;
          }
          return tt;
        });
        try {
          let sortedArr = _.orderBy(this.assets, (o) => +o.Key.split("Key")[1], ["asc"]);
          this.assets = [...sortedArr];
        } catch (e) {
          console.log(e);
        }
        let lidx = _.findLastIndex(this.assets, (tt: any) => {
          return (tt.isExecutionCompleted == true)
        });
        //  lidx = (lidx > -1) ? lidx : 0;

        this.assetsCount = response.count;
        this.assets = _.map(this.assets, (tt, idx) => {
          if (0 > lidx && idx == 0) {
            tt.isNextExecution = true;
          }
          else if (lidx > -1 && idx == (lidx + 1)) {
            tt.isNextExecution = true;
          }
          else {
            tt.isNextExecution = false;
          }
          return tt;
        });
        setTimeout(() => {
          if (this.globalSearchModel.length > 0) {
            var context = document.getElementById("assetdetails-table");
            if (context) {
              var instance = new MarkJs(context);
              instance.mark(this.globalSearchModel);
            }
          }
        }, 1500);

      });

    } else {
      this.gettingAssets = false;
    }
  }
  changePosition(event) {
    console.log("Position changed -------------------");
    console.log(event);
  }
  parseJSON(text: string) {
    try {
      let j = JSON.parse(text);
      return Object.keys(j).length > 0 ? j : [];
    } catch (error) {
      return [];
    }
  }
  viewResourceDetail(data: any) {
    this.notifyTaskEditEntry.next(data);
    //   this.router.navigate([`./createtemplate?data=${data["resource"]}`]);
    //     return false;
  }
  displayPreviewList(rowdata): any[] {
    let returnValue: any[] = [];
    try {
      let parse = rowdata.fieldvalue;
      try {
        if (typeof rowdata.fieldvalue == "string") {
          parse = JSON.parse(rowdata.fieldvalue);
        }
      } catch (error) {
        parse = rowdata.fieldvalue;
      }
      if (Array.isArray(parse)) {
        _.each(parse, (data, k) => {
          if (_.isObject(data)) {
            returnValue.push(data);
          }
        });
      }
      return returnValue;
    } catch (error) {
      return [];
    }
  }
  removeImage(rawData, idx) {
    if (Array.isArray(rawData.fieldvalue)) {
      rawData.fieldvalue.splice(idx, 1);
      rawData.fieldvalue = [...rawData.fieldvalue];
    }
  }
  deleteRecord(data) {
    if (data.isNextExecution) {
      this.assetRecordService
        .updateDetail({
          resourceid: data.resource,
          status: AppConstant.STATUS.DELETED,
        })
        .subscribe((d) => {
          if (d.status) {
            this.getAssets();
          }
        });
    }
  }
  onChanged(event) {
    this.selectedWorkflowTask = null;
    this.isVisible = false;
  }
  assignWorkflow(data) {
    if (data) {
      this.selectedWorkflowTask = data.resource;
      this.isVisible = true;
    }
  }
  notifySelectionEntry(event) {
    console.log(event);
    if (event) {
      this.selectedWorkflowTask = null;
      this.isVisible = false;
    }
  }
  executeTaskCompletion(event, rowData) {
    console.log(event);
    let reqObj = {
      resourceid: rowData.resource,
      dtl_operationtype:
        event == true
          ? this.executionStatusList[0]
          : this.executionStatusList[1],
    }
    this.assetRecordService
      .updateDetail(reqObj, "skipApproval=true")
      .subscribe((d) => {
        let result = JSON.parse(d._body);
        if (d.status) {
          if (d.status === 203) {
            this.message.error(result.message);
            this.getAssets();
          }
          this.getAssets();
        }
      });
  }

  // Dynamic Table width 
  tableColumnWidth(fieldtype: string): string {
    switch (fieldtype) {
      case 'AUTOGEN':
        return '75px';
      case 'Boolean':
        return '100px';
      case 'Date':
      case 'DateTime':
        return '150px';
      case 'Float':
      case 'Integer':
        return '75px';
      case 'REFERENCE':
      case 'Reference Asset':
        return '200px';
      case 'STATUS':
      case 'Select':
        return '150px';
      case 'Textarea':
        return '350px';
      case 'Text':
        return '250px';
      case 'URL':
        return '250px';
      default:
        return '175px';
    }
  }
  
}
