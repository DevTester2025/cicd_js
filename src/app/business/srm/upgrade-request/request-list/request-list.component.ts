import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from "@angular/core";
import { SrmService } from "../../srm.service";
import { ResizeRequestService } from "../../upgrade-request/resize.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../app.constant";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { WorkflowService } from "src/app/business/base/server-utildetails/workflow-config/workflow.service";

@Component({
  selector: "app-upgrade-request-list",
  templateUrl:
    "../../../../presentation/web/srm/upgrade-request/list/request-list.component.html",
})
export class UpgradeRequestListComponent implements OnInit, OnChanges {
  @Input() showStatus: any;
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  srmInboxList = [];
  inboxList = [];
  originalData: any = [];
  approverList: any = [];
  sortValue = null;
  provider: any = "all";
  sortName = null;
  scriptForm: FormGroup;
  formTitle = "Request for approval";
  workflowTitle = "Add Approver Workflow";
  allChecked = false;
  requestType = "resize";
  disabledButton = true;
  checkedNumber = 0;
  isVisible = false;
  viewWorkflowAdd = false;
  currentValue: any = 1;
  displayData: any = [];
  indeterminate = false;
  workflowList = [] as any;
  loading = false;

  searchText: string;
  condition: any = {};
  userstoragedata: any = {};
  rolename = "";
  widthConfig = ["2%"];
  screens = [];
  usersList: any = [];
  departmentsList = [];
  appScreens = {} as any;
  editFlag = false;
  viewFlag = false;
  progressFlag = false;
  constructor(
    private resizeService: ResizeRequestService,
    private srmService: SrmService,
    private fb: FormBuilder,
    private workflowService: WorkflowService,
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
    this.workflowConfigList();
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.RESIZE_REQUESTS,
    });
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.editFlag = true;
    }
    if (_.includes(this.appScreens.actions, "View")) {
      this.viewFlag = true;
    }
    if (_.includes(this.appScreens.actions, "Progress")) {
      this.progressFlag = true;
    }
    this.clearForm();
  }
  clearForm() {
    this.scriptForm = this.fb.group({
      approvername: [null],
    });
    this.onValueChange(1);
  }
  ngOnInit() {
    this.gerRequestList();
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
  }
  gerRequestList() {
    this.notifyEntry.next(true);
    this.condition = {
      tenantid: this.userstoragedata.tenantid,
      status: "Active",
    };
    if (this.provider && this.provider != "all") {
      this.condition.cloudprovider = this.provider;
    }
    if (this.requestType == "resize") {
      this.resizeService.allRequest(this.condition).subscribe(
        (result: any) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.inboxList = response.data;
            this.inboxList.forEach((e) => {
              e.checked = false;
              return e;
            });
            this.tabChanged();
            this.notifyEntry.next(false);
          } else {
            this.notifyEntry.next(false);
            this.srmInboxList = [];
            this.originalData = [];
            this.inboxList = [];
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
    } else {
      this.resizeService.allSeduleRequest(this.condition).subscribe(
        (result: any) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.inboxList = response.data;
            this.inboxList.forEach((e) => {
              e.checked = false;
              return e;
            });
            this.tabChanged();
            this.notifyEntry.next(false);
          } else {
            this.notifyEntry.next(false);
            this.srmInboxList = [];
            this.originalData = [];
            this.inboxList = [];
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
    }
  }
  saveUpdate(data) {
    let formdata = {} as any;
    let approvers = [];
    if (!data.approvername) {
      this.message.error("Please select approver workflow");
      return false;
    } else {
      this.notifyEntry.next(true);
      if (this.approverList.length > 0) {
        this.approverList.forEach((element, i) => {
          let obj = {} as any;
          obj.actiontype = "Approval";
          obj.fromuserid = this.userstoragedata.userid;
          obj.touserid = element.user.userid;
          obj.apprvstatus = AppConstant.STATUS.PENDING;
          obj.approverlevel = element.aprvseqid;
          obj.createdby = this.userstoragedata.fullname;
          obj.createddt = new Date();
          obj.lastupdatedby = this.userstoragedata.fullname;
          obj.lastupdateddt = new Date();
          approvers.push(obj);
        });
        formdata.srmsractions = approvers;
      }
      formdata.requestList = _.map(this.displayData, (e) => {
        let obj = {} as any;
        if (this.requestType == "resize") {
          obj.upgraderequestid = e.upgraderequestid;
        } else {
          obj.scheduledreqhdrid = e.scheduledreqhdrid;
        }
        obj.srvrequestid = e.srvrequestid;
        obj.reqstatus = AppConstant.STATUS.PENDING;
        obj.lastupdatedby = this.userstoragedata.fullname;
        obj.lastupdateddt = new Date();
        return obj;
      });
      formdata.userid = this.userstoragedata.userid;
      formdata.tenantid = this.userstoragedata.tenantid;
      formdata.requesttype = "Resize";
      formdata.reqstatus = AppConstant.STATUS.PENDING;
      formdata.clientid = this.displayData[0].customerid;
      formdata.createdby = this.userstoragedata.fullname;
      formdata.createddt = new Date();
      formdata.requestdate = new Date();
      formdata.srstatus = AppConstant.STATUS.PENDING;
      formdata.lastupdatedby = this.userstoragedata.fullname;
      formdata.lastupdateddt = new Date();
      formdata.subject = "VM Resize Approval Request";
      formdata.description = "VM Resize Approval Request";
      console.log(formdata);
      this.srmService.addService(formdata).subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.provider = "all";
          this.approverList = [];
          this.clearForm();
          this.gerRequestList();
          this.notifyEntry.next(false);
          this.isVisible = false;
          this.message.success("Successfully requested for approval");
        } else {
          this.notifyEntry.next(false);
          this.message.error(response.message);
        }
      });
    }
  }
  notifyWorkflowEntry(event) {
    this.workflowConfigList(event.aprvalwrkflowid);
    this.viewWorkflowAdd = false;
  }
  onValueChange(approver) {
    let data = _.find(this.workflowList, { aprvalwrkflowid: approver }) as any;
    if (data) {
      this.approverList = data.approvers;
    } else {
      this.approverList = [];
    }
  }

  onChanged(val) {
    this.isVisible = val;
    this.approverList = [];
  }
  onAddChanged(val) {
    this.viewWorkflowAdd = val;
  }
  ngOnChanges(changes: any) {
    this.srmInboxList = [];
    if (changes.showStatus.currentValue === 1) {
      this.currentValue = 1;
    }
    if (changes.showStatus.currentValue === 2) {
      this.currentValue = 2;
    }
    if (changes.showStatus.currentValue === 3) {
      this.currentValue = 3;
    }
    this.tabChanged();
  }

  currentPageDataChange($event: any): void {
    this.displayData = $event;
  }
  tabChanged() {
    if (this.currentValue === 1) {
      this.srmInboxList = _.filter(this.inboxList, function (obj: any) {
        if (obj != null && obj.srvrequestid == null) {
          if (obj.srvrequestid == null) {
            return obj;
          }
        }
      });
      this.originalData = this.srmInboxList;
    }
    if (this.currentValue === 2) {
      this.srmInboxList = _.filter(this.inboxList, function (obj: any) {
        if (obj != null && obj.reqstatus != null) {
          if (obj.reqstatus === AppConstant.STATUS.PENDING) {
            return obj;
          }
        }
      });
      this.originalData = this.srmInboxList;
    }
    if (this.currentValue === 3) {
      this.srmInboxList = _.filter(this.inboxList, function (obj: any) {
        if (obj != null && obj.reqstatus != null) {
          if (obj.reqstatus === AppConstant.STATUS.CLOSED) {
            return obj;
          }
        }
      });
      this.originalData = this.srmInboxList;
    }
  }
  refreshStatus(): void {
    const allChecked = this.displayData.every(
      (value) => value.checked === true
    );
    const allUnChecked = this.displayData.every((value) => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = !allChecked && !allUnChecked;
    this.disabledButton = !this.srmInboxList.some((value) => value.checked);
    this.checkedNumber = this.srmInboxList.filter(
      (value) => value.checked
    ).length;
    this.displayData = this.displayData.filter((data) => data.checked === true);
  }

  checkAll(value: boolean): void {
    this.displayData.forEach((data) => (data.checked = value));
    this.refreshStatus();
  }

  operateData(): void {
    this.isVisible = true;
  }
  providerChanges() {
    if (this.provider) {
      this.gerRequestList();
    }
  }
  workflowConfigList(id?) {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.workflowService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.workflowList = response.data;
        if (id) {
          this.scriptForm.get("approvername").setValue(id);
          this.onValueChange(id);
          this.scriptForm.updateValueAndValidity();
        }
        this.loading = false;
      } else {
        this.loading = false;
        this.workflowList = [];
      }
    });
  }
}
