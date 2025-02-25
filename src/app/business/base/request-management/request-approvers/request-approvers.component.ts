import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { RequestApproversService } from "./request-approvers.service";
@Component({
  selector: "app-request-approvers",
  templateUrl: "./request-approvers.component.html",
  styleUrls: ["./request-approvers.component.css"],
})
export class RequestApproversComponent implements OnInit {
  isVisible = false;
  buttonText = "Add request";
  formTitle: string;
  visibleadd = true;
  screens = [];
  appScreens = {} as any;
  isAddpermission = false;
  isEditpermission = false;
  isDeletepermission = false;
  userstoragedata: any = {};
  loading: boolean = false;
  showSidebar = false;
  approverList: any[] = [];
  addNew = false;
  isEdit = false;
  totalCount;
  operationMode = "";
  selectedApprovers: null;
  globalLogHeader = [
    { field: "approverlevel", header: "Approver Level", datatype: "string" },
    { field: "lastupdatedby", header: "Updated By", datatype: "string" },
    {
      field: "lastupdateddt",
      header: "Updated date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
    { field: "status", header: "Status", datatype: "string" },
  ];

  tableconfig = {
    refresh: true,
    edit: true,
    delete: true,
    manualsearch: true,
    globalsearch: true,
    pagination: true,
    manualpagination: false,
    loading: false,
    pageSize: 10,
    apisort: true,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px"],
  };
  constructor(
    private RequestApproversService: RequestApproversService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.loadApproverList();
  }

  loadApproverList() {
    this.loading = true;
    this.RequestApproversService.all({
      tenantid: this.userstoragedata.tenantid,
      status: "Active",
    }).subscribe((result) => {
      this.loading = false;
      let response = JSON.parse(result._body);
      if (response.status) {
        this.approverList = response.data;
        this.totalCount = this.approverList.length;
      }
    });
  }
  showModal(): void {
    this.isVisible = true;
    this.formTitle = "Add Approvers";
    this.operationMode = null;
    this.selectedApprovers = null;
    this.addNew = true;
    this.isEdit = false;
  }
  onChanged(event) {
    this.isVisible = false;
  }
  notifyNewEntry(event) {
    this.isVisible = false;
    this.formTitle = "Request Approval";
    this.loadApproverList();
  }
  dataChanged(event) {
    if (event.edit) {
      this.isEdit = true;
      this.addNew = false;
      this.formTitle = "Edit Approver";
      this.operationMode = "APPROVER_EDIT";
      this.selectedApprovers = event.data;
      this.isVisible = true;
    }
    if (event.delete) {
      this.deleteApproval(event.data);
    }
    //#OP_B632
    if (event.refresh) {
      this.loadApproverList();
    }
  }
  deleteApproval(data) {
  
  }
}
