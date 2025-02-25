import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  Input,
} from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { RightsizegroupService } from "../rightsizegroup.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-rightsizegroup-list",
  templateUrl:
    "../../../../presentation/web/base/rightsizegroup/list/rightsizegroup-list.component.html",
})
export class RightsizeGroupComponent implements OnInit {
  @Input() utilizationDetailConfigs: any;
  screens = [];
  rightsizegroupList = [] as any;
  formTitle = "Setup Rightsize Group";
  setupFormTitle = "Generate Rules";
  userstoragedata: any = {};
  groupObj: any = {};
  visibleadd: any = false;
  isVisible: any = false;
  sortValue = null;
  sortName = null;
  loading: any = false;
  appScreens = {} as any;
  buttonText = "Add";
  rightsizegroupTableHeader = [
    { header: "Group Name", field: "groupname", datatype: "string" },
    { header: "CPU Utilization (%)", field: "cpuutil", datatype: "string" },
    {
      header: "Memory Utilization (%)",
      field: "memoryutil",
      datatype: "string",
    },
    { header: "Duration", field: "duration", datatype: "string" },
    { header: "Status", field: "status", datatype: "string" },
    { header: "Updated By", field: "lastupdatedby", datatype: "string" },
    {
      header: "Updated On",
      field: "lastupdateddt",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  rightsizegroupTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    scroll: { x: "2000px" },
    widthConfig: [
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
    ],
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private groupService: RightsizegroupService,
    private router: Router
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.RIGHTSIZE_GROUPS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.rightsizegroupTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.rightsizegroupTableConfig.delete = true;
    }
    this.getGroupList();
  }

  ngOnInit() {}
  showModal(data?) {
    this.groupObj = data;
    this.isVisible = true;
    console.log(data);
  }
  notifyEntry(event) {
    this.getGroupList();
    this.isVisible = false;
  }
  dataChanged(event) {
    console.log(event);
    this.groupObj = event.data;
    if (event.edit) {
      this.isVisible = true;
    }
    if (event.delete) {
      this.deleteGroup(this.groupObj);
    }
  }
  onChanged(event) {
    this.isVisible = false;
    console.log(event);
  }
  getGroupList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.groupService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.loading = false;
        this.rightsizegroupList = response.data;
      } else {
        this.loading = false;
        this.rightsizegroupList = [];
      }
    });
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.rightsizegroupList.filter((item) => item);
    if (this.sortName) {
      this.rightsizegroupList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.rightsizegroupList = data;
    }
  }
  deleteGroup(data) {
    this.loading = true;
    this.groupService
      .update({
        rightsizegrpid: data.rightsizegrpid,
        status: AppConstant.STATUS.INACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.loading = false;
            this.getGroupList();
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.loading = false;
          this.message.error("Unable to Delete. Please try again");
        }
      );
  }
}
