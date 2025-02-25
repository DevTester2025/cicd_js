import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { SrmService } from "../../srm.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";

@Component({
  selector: "app-inbox-list",
  templateUrl:
    "../../../../presentation/web/srm/inbox/list/inbox-list.component.html",
})
export class InboxListComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() showStatus: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  srmInboxList = [];
  inboxList = [];
  totalCount = null;
  pageCount = AppConstant.pageCount;
  originalData: any = [];
  sortValue = null;
  sortName = null;
  searchText: string;
  condition: any = {};
  userstoragedata: any = {};
  pageSize = 10;
  rolename = "";
  loading = false;
  widthConfig = [
    "7%",
    "15%",
    "15%",
    "9%",
    "8%",
    "10%",
    "10%",
    "8%",
    "13%",
    "5%",
  ];
  screens = [];
  appScreens = {} as any;
  editFlag = false;
  viewFlag = false;
  progressFlag = false;
  delete = false;
  constructor(
    private srmService: SrmService,
    private router: Router,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.rolename = this.userstoragedata.roles.rolename;
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.INBOX,
    });
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "Edit")) {
        this.editFlag = true;
      }
      if (_.includes(this.appScreens.actions, "View")) {
        this.viewFlag = true;
      }
      if (_.includes(this.appScreens.actions, "Progress")) {
        this.progressFlag = true;
      }
      if (_.includes(this.appScreens.actions, "Delete")) {
        this.delete = true;
      }
    }
  }

  ngOnInit() {
    setTimeout(()=>{
      this.getInboxList();
    },500)
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
      this.srmInboxList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
            ? 1
            : -1
      );
    } else {
      this.srmInboxList = data;
    }
  }
  onPageSizeChange(size:number){
    this.pageSize = size;
    this.getInboxList()
    this.totalCount = this.srmInboxList.length;   
  }
  globalSearch(searchText: any) {
    if (searchText !== "" && searchText !== undefined && searchText != null) {
      const self = this;
      this.srmInboxList = [];
      this.originalData.map(function (item) {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            const regxExp = new RegExp("\\b" + searchText, "gi");
            if (regxExp.test(element)) {
              if (!_.some(self.srmInboxList, item)) {
                self.srmInboxList.push(item);
              }
            }
          }
        }
      });
    } else {
      this.srmInboxList = this.originalData;
    }
    this.totalCount = this.srmInboxList.length;
  }
  getInboxList() {
    this.loading = true;
    this.condition = {
      tenantid: this.userstoragedata.tenantid,
      status: "Active",
    };
    this.srmService.allService(this.condition).subscribe(
      (result: any) => {
        this.notifyEntry.next(false);
        const response = JSON.parse(result._body);
        if (response.status) {
          this.inboxList = response.data;
          switch (this.showStatus) {
            case 1:
              this.srmInboxList = _.filter(this.inboxList, (obj: any) =>
                obj.srstatus &&
                [AppConstant.STATUS.WIP, AppConstant.STATUS.PENDING, AppConstant.STATUS.APPROVED].includes(obj.srstatus)
              );
              break;
            case 2:
              this.srmInboxList = _.filter(this.inboxList, (obj: any) =>
                obj.srstatus &&
                [
                  AppConstant.STATUS.DEPLOYED,
                  AppConstant.STATUS.CLOSEREQ,
                  AppConstant.STATUS.CLOSED,
                  AppConstant.STATUS.REJECTED,
                  AppConstant.STATUS.NOC,
                  AppConstant.STATUS.COMPLETED,
                ].includes(obj.srstatus)
              );
              break;
            case 3:
              this.srmInboxList = _.filter(this.inboxList, (obj: any) =>
                obj.srstatus === AppConstant.STATUS.DRAFT
              );
              break;
            default:
              this.srmInboxList = [];
              break;
          }
          this.originalData = this.srmInboxList;
          this.totalCount = this.originalData.length;
          this.loading = false;
        } else {
          this.srmInboxList = [];
          this.originalData = [];
          this.inboxList = [];
          this.loading = false;
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  view(data) {
    console.log(data);
    if (data.requesttype == "Resize") {
      this.router.navigate(["resize/view/" + data.srvrequestid], {
        queryParams: { url: "inbox" },
      });
    } else {
      if (!_.isNull(data.catalogid)) {
        this.router.navigate(["srm/catalog/view/" + data.srvrequestid], {
          queryParams: { url: "inbox" },
        });
      } else {
        this.router.navigate(["srm/generic/view/" + data.srvrequestid], {
          queryParams: { url: "inbox" },
        });
      }
    }
  }
  edit(data) {
    if (!_.isNull(data.catalogid)) {
      this.router.navigate(["srm/service/edit/" + data.srvrequestid], {
        queryParams: { url: "inbox" },
      });
    } else {
      this.router.navigate(["srm/generic/edit/" + data.srvrequestid], {
        queryParams: { url: "inbox" },
      });
    }
  }
  updateProgress(data) {
    if (!_.isNull(data.catalogid)) {
      this.router.navigate(["srm/progress/" + data.srvrequestid], {
        queryParams: { url: "inbox" },
      });
    } else {
      this.router.navigate(["srm/generic/progress/" + data.srvrequestid], {
        queryParams: { url: "inbox" },
      });
    }
  }

  getProgressStatus(srstatus: string): string {
    if (srstatus === 'Rejected') {
      return 'exception';
    } else if (srstatus === 'Completed') {
      return 'success';
    } else {
      return 'normal';
    }
  }

  deleteGenericService(data) {
    let formdata = {} as any;
    formdata = {
      srvrequestid: data.srvrequestid,
      status: "Deleted",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.srmService.updateService(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.message.success(
            "#" + response.data.srvrequestid + " Deleted Successfully"
          )
          : this.message.success(response.message);
        this.getInboxList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  ngOnChanges(changes: any) {
    this.srmInboxList = [];
    if (changes.showStatus.currentValue === 1) {
      this.srmInboxList = _.filter(this.inboxList, function (obj: any) {
        if (obj != null && obj.srstatus != null) {
          if (
            obj.srstatus === AppConstant.STATUS.WIP ||
            obj.srstatus === AppConstant.STATUS.PENDING ||
            obj.srstatus === AppConstant.STATUS.APPROVED
          ) {
            return obj;
          }
        }
      });
      this.originalData = this.srmInboxList;
      this.totalCount = this.originalData.length;
    }
    if (changes.showStatus.currentValue === 2) {
      this.srmInboxList = _.filter(this.inboxList, function (obj: any) {
        if (obj != null && obj.srstatus != null) {
          if (
            obj.srstatus === AppConstant.STATUS.DEPLOYED ||
            obj.srstatus === AppConstant.STATUS.CLOSEREQ ||
            obj.srstatus === AppConstant.STATUS.CLOSED ||
            obj.srstatus === AppConstant.STATUS.REJECTED ||
            obj.srstatus === AppConstant.STATUS.NOC ||
            obj.srstatus === AppConstant.STATUS.COMPLETED
          ) {
            return obj;
          }
        }
      });
      this.originalData = this.srmInboxList;
      this.totalCount = this.originalData.length;
    }
    if (changes.showStatus.currentValue === 3) {
      this.srmInboxList = _.filter(this.inboxList, function (obj: any) {
        if (obj != null && obj.srstatus != null) {
          if (obj.srstatus === AppConstant.STATUS.DRAFT) {
            return obj;
          }
        }
      });
      this.originalData = this.srmInboxList;
      this.totalCount = this.originalData.length;
    }
  }
  refresh() {
    this.searchText = null;
     this.getInboxList();
  }
}
