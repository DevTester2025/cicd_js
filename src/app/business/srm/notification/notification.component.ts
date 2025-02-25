import { Component, OnInit } from "@angular/core";
import { SrmService } from "../../../business/srm/srm.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { AppConstant } from "../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-notification",
  templateUrl:
    "../../../presentation/web/srm/notification/notification.component.html",
})
export class NotificationComponent implements OnInit {
  notificationList = [];
  userstoragedata: any;
  searchText: string;
  originalData: any = [];
  sortValue = null;
  sortName = null;
  loading = false;
  constructor(
    private srmService: SrmService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getSRMActionList();
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.notificationList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.notificationList = data;
    }
  }
  globalSearch(searchText: any) {
    if (searchText !== "" && searchText !== undefined && searchText != null) {
      const self = this;
      this.notificationList = [];
      this.originalData.map(function (item) {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            const regxExp = new RegExp("\\b" + searchText, "gi");
            if (regxExp.test(element)) {
              if (!_.some(self.notificationList, item)) {
                self.notificationList.push(item);
              }
            }
          }
        }
      });
    } else {
      this.notificationList = this.originalData;
    }
  }
  getSRMActionList() {
    this.loading = true;
    const condition = {
      actiontype: "Progress",
      // tenantid: this.userstoragedata.tenantid
    };
    this.srmService.allSrmActions(condition).subscribe((res) => {
      this.loading = false;
      const response = JSON.parse(res._body);
      if (response.status) {
        this.notificationList = _.filter(response.data, function (data) {
          if (data.srstatus !== "Read") {
            return data;
          }
        });
        // this.notificationList = response.data;
        this.originalData = this.notificationList;
      } else {
        this.notificationList = [];
        this.originalData = [];
      }
    });
  }
  view(data) {
    let formdata = {} as any;
    formdata = {
      sractionsid: data.sractionsid,
      srstatus: "Read",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.srmService.updateSrmAction(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.router.navigate(["srm/catalog/view/" + data.srvrequestid], {
          queryParams: { url: "notification" },
        });
      } else {
        this.messageService.error(response.message);
      }
    });
  }
}
