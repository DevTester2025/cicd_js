import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { NzMessageService } from "ng-zorro-antd";
import { requestManagementService } from "./request-management.service";
import { ActivatedRoute, Router } from "@angular/router";
import { log } from "console";
@Component({
  selector: "app-request-management",
  templateUrl: "./request-management.component.html",
  styleUrls: ["./request-management.component.css"],
})
export class RequestManagementComponent implements OnInit {
  isVisible = false;
  formTitle = "Add Request";
  requestObj: any = {};
  userstoragedata: any;
  searchText = null;
  requestList = [];
  tableHeader = [
    {
      field: "type",
      header: "Type",
      datatype: "string",
    },
    {
      field: "priority",
      header: "Priority",
      datatype: "string",
    },
    {
      field: "customer_notes",
      header: "Customer Notes",
      datatype: "string",
    },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
    },
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
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private requestservice: requestManagementService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.getAllRequest();
  }
  rightbarChanged(val) {
    this.isVisible = val;
  }
  notifyRequestEntry() {
    this.getAllRequest();
  }
  redirectToCreate() {
    this.router.navigate(["request-management/addrequest"]);
  }
  getAllRequest(limit?, offset?) {
    this.requestList = [];

    let reqObj: any = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.requestservice.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.requestList = response.data;
      } else {
        this.requestList = [];
      }
    });
  }
  dataChanged(e) {
    if (e.searchText != "" && e.search) {
      this.searchText = e.searchText;
      this.getAllRequest(10, 0);
    }

    if (e.searchText == "") {
      this.searchText = null;
      this.getAllRequest(10, 0);
    }
    if (e.edit) {
      this.router.navigate(["request-management/editrequest", e.data.reqstid]);
    }
    if (e.refresh) {
      this.getAllRequest();
    }
    if (e.delete) {
      this.requestservice
        .update({
          reqstid: e.data.reqstid,
          status: AppConstant.STATUS.DELETED,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.getAllRequest();
          } else {
            this.message.error(response.message);
          }
        });
    }
  }
}
