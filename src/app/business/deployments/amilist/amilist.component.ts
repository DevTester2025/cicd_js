import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../app.constant";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { CommonService } from "../../../modules/services/shared/common.service";
import { AWSService } from "../aws/aws-service";
import { Ecl2Service } from "../ecl2/ecl2-service";
import { DeploymentsService } from "../deployments.service";
import { AlibabaService } from "../alibaba/alibaba-service";
@Component({
  selector: "app-amilist",
  templateUrl:
    "../../../presentation/web/deployments/amilist/amilist.component.html",
})
export class AmilistComponent implements OnInit {
  userstoragedata = {} as any;
  amiList = [];
  loading = false;
  isVisible = false;
  formTitle = AppConstant.VALIDATIONS.AWS.AWSAMI.ADD;
  buttonText = AppConstant.VALIDATIONS.AWS.AWSAMI.ADD;
  screens = [];
  appScreens = {} as any;
  amiObj: any = {};
  visibleadd = false;
  selectedProvider: any;
  provider: any;
  providerList: any = [];
  tableHeader: any = [];
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "20px", "25px", "25px", "25px", "30px"],
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private deploymentsService: DeploymentsService,
    private message: NzMessageService,
    private awsService: AWSService,
    private ecl2Service: Ecl2Service,
    private alibabaService: AlibabaService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
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
          const defaultprovider = _.find(this.providerList, function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          });
          this.provider = defaultprovider.keyvalue;
          this.getECL2AMIList();
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    switch (this.provider) {
      case AppConstant.CLOUDPROVIDER.AWS:
        this.formTitle = AppConstant.VALIDATIONS.AWS.AWSAMI.ADD;
        this.buttonText = AppConstant.VALIDATIONS.AWS.AWSAMI.ADD;
        this.amiList = [];
        this.getAllList();
        break;
      case AppConstant.CLOUDPROVIDER.ECL2:
        this.formTitle = AppConstant.VALIDATIONS.ECL2.AMI.ADD;
        this.buttonText = AppConstant.VALIDATIONS.ECL2.AMI.ADD;
        this.amiList = [];
        this.getECL2AMIList();
        break;
      case AppConstant.CLOUDPROVIDER.ALIBABA:
        this.formTitle = AppConstant.VALIDATIONS.ALIBABA.IMAGE.ADD;
        this.buttonText = AppConstant.VALIDATIONS.ALIBABA.IMAGE.ADD;
        this.amiList = [];
        this.getALIImageList();
        break;
      default:
        this.amiList = [];
        this.tableHeader = this.deploymentsService.getCommonImageHeader();
    }
  }
  getALIImageList() {
    this.tableHeader = this.deploymentsService.getALIImageHeader();
    this.loading = true;
    this.alibabaService
      .allimages({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.amiList = response.data;
        } else {
          this.loading = false;
          this.amiList = [];
        }
      });
  }
  getECL2AMIList() {
    this.tableHeader = this.deploymentsService.getECL2ImageHeader();
    this.tableConfig.scroll = { x: "1000px" };
    this.tableConfig.widthConfig = [
      "10px",
      "10px",
      "20px",
      "20px",
      "20px",
      "20px",
    ];
    this.loading = true;
    let condition = {} as any;
    condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    this.ecl2Service.allecl2sami(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.amiList = response.data;
      } else {
        this.loading = false;
        this.amiList = [];
      }
    });
  }
  getAllList() {
    this.tableHeader = this.deploymentsService.getAWSImageHeader();
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
          this.amiList = response.data;
        } else {
          this.loading = false;
          this.amiList = [];
        }
      });
  }
  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(result) {
    if (result.edit) {
      this.amiObj = result.data;
      this.selectedProvider = this.provider;
      this.isVisible = true;
      this.formTitle =
        this.selectedProvider === AppConstant.CLOUDPROVIDER.AWS
          ? AppConstant.VALIDATIONS.AWS.AWSAMI.UPDATE
          : AppConstant.VALIDATIONS.ALIBABA.IMAGE.UPDATE;
    } else if (result.delete) {
      switch (this.selectedProvider) {
        case AppConstant.CLOUDPROVIDER.AWS:
          this.deleteamiRecord(result.data);
          break;
        case AppConstant.CLOUDPROVIDER.ECL2:
          this.deleteeclamiRecord(result.data);
          break;
        case AppConstant.CLOUDPROVIDER.ALIBABA:
          this.deletealiimageRecord(result.data);
          break;
      }
    }
  }
  notifyNewEntry(event) {
    let existData = {} as any;
    existData =
      this.provider === AppConstant.CLOUDPROVIDER.AWS
        ? _.find(this.amiList, { amiid: event.amiid })
        : _.find(this.amiList, { imageid: event.imageid });
    if (existData === undefined) {
      this.amiList = [event, ...this.amiList];
    } else {
      const index = _.indexOf(this.amiList, existData);
      this.amiList[index] = event;
      this.amiList = [...this.amiList];
    }
    this.isVisible = false;
    this.formTitle = AppConstant.VALIDATIONS.AWS.AWSAMI.ADD;
  }

  deletealiimageRecord(data) {
    const formdata = {
      imageid: data.imageid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.alibabaService.updateimage(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.imageid + " Deleted Successfully"
        );
        this.getALIImageList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  deleteeclamiRecord(data) {
    const formdata = {
      imageid: data.imageid,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.ecl2Service.updateecl2ami(formdata).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.message.success(
          "#" + response.data.imageid + " Deleted Successfully"
        );
        this.getECL2AMIList();
      } else {
        this.message.error(response.message);
      }
    });
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
        this.message.success(
          "#" + response.data.amiid + " Deleted Successfully"
        );
        this.getAllList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  showModal() {
    this.selectedProvider = this.provider;
    this.isVisible = true;
    this.amiObj = {};
    switch (this.selectedProvider) {
      case AppConstant.CLOUDPROVIDER.AWS:
        this.formTitle = AppConstant.VALIDATIONS.AWS.AWSAMI.ADD;
        break;
      case AppConstant.CLOUDPROVIDER.ECL2:
        this.formTitle = AppConstant.VALIDATIONS.ECL2.AMI.ADD;
        break;
      case AppConstant.CLOUDPROVIDER.ALIBABA:
        this.formTitle = AppConstant.VALIDATIONS.ALIBABA.IMAGE.ADD;
        break;
    }
  }
}
