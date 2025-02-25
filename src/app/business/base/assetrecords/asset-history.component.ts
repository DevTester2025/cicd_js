import { Component, Input, OnInit } from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetRecordService } from "./assetrecords.service";

@Component({
  selector: "app-cloudmatiq-asset-history",
  templateUrl:
    "../../../presentation/web/base/assetrecords/asset-history.component.html",
})
export class AssetHistoryComponent implements OnInit {
  @Input() resourceDetails;
  @Input() resourceId;
  @Input() crnDetails;
  historyRecords: any[] = [];
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService
  ) {}
  ngOnInit() {
    this.getList();
  }
  getList() {
    this.historyRecords = [];
    let reqObj = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      resourceid: this.resourceId,
      crn: this.crnDetails,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.assetRecordService.getAllHistory(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.historyRecords = _.map(response.data, (itm) => {
          itm.oldIsHtml=false;
          itm.newIsHtml=false;
          if (itm.old != null && itm.old.includes("[")) {
            _.each(JSON.parse(itm.old), (t, i: number) => {
              if (i == 0) {
                itm.old = t.name;
              } else {
                itm.old = itm.old + "," + t.name;
              }
              return t;
            });
          }
          if (itm.new != null && itm.new.includes("[")) {
            _.each(JSON.parse(itm.new), (t, i: number) => {
              if (i == 0) {
                itm.new = t.name;
              } else {
                itm.new = itm.new + "," + t.name;
              }
              return t;
            });
          }
          if(itm.old != null){
            itm.oldIsHtml=false;
            itm.oldIsHtml = /<.+>/g.exec( itm.old ) ? true : false
          }
          if(itm.new != null){
            itm.newIsHtml=false;
            itm.newIsHtml = /<.+>/g.exec( itm.old ) ? true : false
          }
          return itm;
        });
      }
    });
  }
}
