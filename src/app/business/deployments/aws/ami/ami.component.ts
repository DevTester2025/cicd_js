import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { AWSService } from "../aws-service";
import { Ecl2Service } from "../../ecl2/ecl2-service";
@Component({
  selector: "app-ami",
  templateUrl:
    "../../../../presentation/web/deployments/aws/ami/ami.component.html",
})
export class AmiComponent implements OnInit {
  userstoragedata = {} as any;
  awsamiList = [];
  tableHeader: any[] = [];
  tableConfig = {} as any;
  loading = false;
  isVisible = false;
  formTitle = "Create AMI";
  buttonText = "Create AMI";
  screens = [];
  appScreens = {} as any;
  amiObj: any = {};
  visibleadd = false;
  provider: any = AppConstant.CLOUDPROVIDER.AWS;
  providerList: any = [];
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private message: NzMessageService,
    private awsService: AWSService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.tableConfig = {
      edit: false,
      delete: false,
      globalsearch: true,
      loading: false,
      pagination: true,
      pageSize: 10,
      title: "",
      widthConfig: ["25px", "20px", "25px", "25px", "25px", "30px"],
    };
    this.awsamiList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.VIRTUAL_MACHINE,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
  }

  ngOnInit() {
    this.getProviderList();
    this.getAllList();
  }
  getProviderList() {
    this.loading = true;
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = response.data;
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    if (
      this.provider != AppConstant.CLOUDPROVIDER.ECL2 &&
      this.provider != AppConstant.CLOUDPROVIDER.AWS
    ) {
      this.tableHeader = [
        { field: "awsamiid", header: "AWS AMI Id", datatype: "string" },
        { field: "aminame", header: "AMI Name", datatype: "number" },
        { field: "platform", header: "Platform", datatype: "number" },
        { field: "lastupdatedby", header: "Updated By", datatype: "string" },
        {
          field: "lastupdateddt",
          header: "Updated On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
        { field: "status", header: "Status", datatype: "string" },
      ];
      this.awsamiList = [];
    } else if (this.provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.awsamiList = [];
      this.getECL2AMIList();
    } else if (this.provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.awsamiList = [];
      this.getAllList();
    }
  }
  getECL2AMIList() {
    this.tableHeader = [
      { field: "ecl2imageid", header: "ECL2 AMI Id", datatype: "string" },
      { field: "imagename", header: "AMI Name", datatype: "number" },
      { field: "platform", header: "Platform", datatype: "number" },
      { field: "status", header: "Status", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
    this.loading = true;
    let condition = {} as any;
    condition = {
      tenantlist: [this.userstoragedata.tenantid, 0],
      status: AppConstant.STATUS.ACTIVE,
    };

    this.ecl2Service.allecl2sami(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.tableConfig.scroll = { x: "1000px" };
        this.awsamiList = response.data;
      } else {
        this.loading = false;
        this.awsamiList = [];
      }
    });
  }
  getAllList() {
    this.tableHeader = [
      { field: "awsamiid", header: "AWS AMI Id", datatype: "string" },
      { field: "aminame", header: "AMI Name", datatype: "number" },
      { field: "platform", header: "Platform", datatype: "number" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
    this.loading = true;
    this.awsService
      .allawsami({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.awsamiList = response.data;
        } else {
          this.loading = false;
          this.awsamiList = [];
        }
      });
  }
  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.amiObj = result.data;
      this.formTitle = "Update AMI";
    } else if (result.delete) {
      this.deleteamiRecord(result.data);
    }
  }
  notifyAmiEntry(event) {
    let existData = {} as any;
    existData = _.find(this.awsamiList, { amiid: event.amiid });
    if (existData === undefined) {
      this.awsamiList = [...this.awsamiList, event];
    } else {
      let index = _.indexOf(this.awsamiList, existData);
      this.awsamiList[index] = event;
      this.awsamiList = [...this.awsamiList];
    }
    this.isVisible = false;
    this.formTitle = "Create AMI";
  }
  deleteamiRecord(data) {
    const formdata = {
      amiid: data.amiid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.awsService.updateawsami(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        response.data.status === AppConstant.STATUS.DELETED
          ? this.message.success(
              "#" + response.data.amiid + " Deleted Successfully"
            )
          : this.message.success(response.message);
        this.getAllList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  showModal() {
    this.isVisible = true;
    this.formTitle = "Create AMI";
    this.amiObj = {};
  }
}
