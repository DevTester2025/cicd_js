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
import { WorkflowService } from "../workflow.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-workflow-list",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/workflow-config/list/workflow-list.component.html",
})
export class WorkflowListComponent implements OnInit {
  @Input() utilizationDetailConfigs: any;
  screens = [];
  workflowList = [] as any;
  originalData = [] as any;
  current = "dashboard";
  formTitle = "Setup Approval Workflow";
  currentConfigs = {} as any;
  userstoragedata: any = {};
  workflowObj: any = {};
  visibleadd: any = false;
  isVisible: any = false;
  sortValue = null;
  sortName = null;
  loading: any = false;
  appScreens = {} as any;
  buttonText = "Add";
  customerObj: any = {};
  workflowTableHeader = [
    { header: "Workflow Name", field: "aprvalwrkflowname", datatype: "string" },
    { header: "Status", field: "status", datatype: "string" },
    { header: "Updated By", field: "lastupdatedby", datatype: "string" },
    {
      header: "Updated On",
      field: "lastupdateddt",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  workflowTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private workflowService: WorkflowService,
    private message: NzMessageService,
    private router: Router
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.workflowConfigList();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.APPROVAL_WORKFLOW,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.workflowTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.workflowTableConfig.delete = true;
    }
  }

  ngOnInit() {}
  showModal(data?) {
    this.workflowObj = data;
    this.isVisible = true;
    console.log(data);
  }
  notifyWorkflowEntry(event) {
    this.isVisible = false;
    this.workflowConfigList();
  }

  onChanged(event) {
    this.isVisible = false;
    console.log(event);
  }
  dataChanged(event) {
    if (event.edit) {
      this.workflowObj = event.data;
      this.isVisible = true;
    }
    if (event.delete) {
      this.deletePrediction(event.data);
    }
  }
  workflowConfigList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.workflowService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.loading = false;
        this.workflowList = response.data;
      } else {
        this.loading = false;
        this.workflowList = [];
      }
    });
  }
  deletePrediction(data) {
    this.loading = true;
    this.workflowService
      .update({
        aprvalwrkflowid: data.aprvalwrkflowid,
        status: AppConstant.STATUS.INACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.loading = false;
            this.workflowConfigList();
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
