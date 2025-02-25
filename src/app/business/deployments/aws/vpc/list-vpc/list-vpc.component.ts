import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { AWSService } from "../../aws-service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
@Component({
  selector: "app-cloudmatiq-vpc-list",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/vpc/vpc-list/list-vpc.component.html",
})
export class VpcListComponent implements OnInit {
  vpcObj: any;
  userstoragedata = {} as any;
  // Table
  vpcList = [];
  tableHeader: any[] = [];
  tableConfig = {} as any;
  isVisible = false;
  formTitle = "Add VPC";
  loading = false;
  screens = [];
  appScreens = {} as any;
  createScript = false;
  constructor(
    private awsService: AWSService,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.vpcList = [];
    this.tableConfig = {
      edit: false,
      delete: false,
      globalsearch: true,
      loading: false,
      pagination: true,
      pageSize: 10,
      scroll: { x: "1000px" },
      title: "",
      widthConfig: ["30px", "25px", "25px", "25px", "25px"],
    };
  }
  ngOnInit() {
    this.getAllList();
    this.tableHeader = [
      { field: "vpcname", header: "VPC Name", datatype: "string" },
      { field: "awsvpcid", header: "AWS VPC ID", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }
  getAllList() {
    this.loading = true;
    this.awsService
      .allawsvpc({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.vpcList = response.data;
        } else {
          this.loading = false;
          this.vpcList = [];
        }
      });
  }
  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.vpcObj = result.data;
      this.formTitle = "Update VPC";
    } else if (result.delete) {
      this.deleteVpc(result.data);
    }
  }
  notifyScriptEntry(event) {
    let existData = {} as any;
    existData = _.find(this.vpcList, { vpcid: event.vpcid });
    if (existData == undefined) {
      this.vpcList = [...this.vpcList, event];
    } else {
      let index = _.indexOf(this.vpcList, existData);
      this.vpcList[index] = event;
    }
    this.isVisible = false;
    this.formTitle = "Add Script";
  }
  deleteVpc(data) {
    const inputData = {
      vpcid: data.vpcid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.awsService.updateawsvpc(inputData).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.messageService.success(
              "#" + response.data.vpcid + " Deleted Successfully"
            )
          : this.messageService.success(response.message);
        this.getAllList();
      } else {
        this.messageService.error(response.message);
      }
    });
  }
  showAddForm() {
    this.isVisible = true;
    this.formTitle = "Add Script";
    this.vpcObj = {};
  }
}
