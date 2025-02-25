import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { Ecl2Service } from "../../../ecl2/ecl2-service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
@Component({
  selector: "app-add-edit-internetgateway",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/internetgateway/add-edit-internetgateway/add-edit-internetgateway.component.html",
})
export class AddEditInternetgatewayComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  // Standalone
  @Input() tagsOnly: boolean; // If true only tags can be added / edited.
  @Input() gatewayid: string;
  @Input() mode: string;
  @Input() assetData: any;

  @Input() gatewayObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  gettingGateway = false;
  edit = false;
  addTenant: any = false;
  userstoragedata: any;
  buttonText: any;
  gatewayForm: FormGroup;
  internetserviceList: any = [];
  qosList: any = [];
  formdata: any = {};
  disabled = false;
  loading = false;
  ecl2zoneList: any = [];
  interfaceObj: any = {};
  globalIpObj: any = {};
  staticIpObj: any = {};
  selectedIndex = 0;
  customerList: any = [];
  gatewayErrObj = {
    gatewayname: AppConstant.VALIDATIONS.ECL2.GATEWAY.GATEWAYNAME,
    zoneid: AppConstant.VALIDATIONS.ECL2.GATEWAY.ZONE,
    customerid: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
    internetserviceid: AppConstant.VALIDATIONS.ECL2.GATEWAY.INTERNETSERVICE,
    qosoptionid: AppConstant.VALIDATIONS.ECL2.GATEWAY.QOSOPTION,
    description: AppConstant.VALIDATIONS.ECL2.GATEWAY.DESCRIPTION,
  };

  // Tag Picker related
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  tagPickerVisible = false;
  tags = [];
  tagsClone = [];
  tagsList = [];

  constructor(
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private httpService: HttpHandlerService,
    private tagValueService: TagValueService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.buttonText = AppConstant.BUTTONLABELS.SAVE;
  }

  ngOnInit() {
    this.clearForm();
    if (this.assetData) {
      this.addTenant = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.gatewayObj) &&
      !_.isEmpty(changes.gatewayObj.currentValue)
    ) {
      this.gatewayObj = changes.gatewayObj.currentValue;
      this.getTagValues();
      this.edit = true;
      this.selectedIndex = 0;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      const condition = {
        tenantid: this.userstoragedata.tenantid,
        internetserviceid:
          this.gatewayObj.ecl2internetservices.ecl2internetservicesid,
        region: this.gatewayObj.ecl2zones.region,
        status: AppConstant.STATUS.ACTIVE,
      };
      this.getQosOptions(condition);
      this.generateEditForm(this.gatewayObj);
    } else if (
      changes.gatewayid &&
      changes.mode &&
      changes.mode.currentValue == "standalone"
    ) {
      console.log("INSIDE ELSE IF:::::::::");
      this.gettingGateway = true;
      this.getGatewayObject();
    } else {
      this.edit = false;
      this.clearForm();
      this.tagsClone = [];
      this.tagsList = [];
      this.tags = [];
      this.getZoneList();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  getGatewayObject() {
    this.loading = true;
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2GATEWAYGETBYID +
          this.gatewayid
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          this.gatewayObj = response.data;
          this.getTagValues();
          this.edit = true;
          this.selectedIndex = 0;
          this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
          const condition = {
            tenantid: this.userstoragedata.tenantid,
            internetserviceid:
              this.gatewayObj.ecl2internetservices.ecl2internetservicesid,
            region: this.gatewayObj.ecl2zones.region,
            status: AppConstant.STATUS.ACTIVE,
          };
          this.getQosOptions(condition);
          this.generateEditForm(this.gatewayObj);
          this.loading = false;
        } else {
          this.loading = false;
        }
      });
  }

  clearForm() {
    this.gatewayForm = this.fb.group({
      gatewayname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [null, Validators.required],
      customerid: [null, Validators.required],
      internetserviceid: ["", Validators.required],
      qosoptionid: ["", Validators.required],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [""],
    });
  }
  generateEditForm(data) {
    this.internetserviceList.push(data.ecl2internetservices);
    this.ecl2zoneList.push(data.ecl2zones);
    this.customerList.push(data.customer);
    this.gatewayForm = this.fb.group({
      gatewayname: [
        data.gatewayname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      internetserviceid: [data.ecl2internetservices, Validators.required],
      qosoptionid: [
        _.find(this.qosList, { qosoptionid: data.qosoptionid }),
        Validators.required,
      ],
      zoneid: [data.ecl2zones, Validators.required],
      customerid: [data.customer, Validators.required],
      description: [
        data.description,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [data.status],
    });
  }
  getZoneList() {
    this.loading = true;
    this.ecl2Service
      .allecl2Zones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          this.ecl2zoneList = response.data;
        } else {
          this.ecl2zoneList = [];
        }
        this.loading = false;
      });
  }
  onRegionChange(event) {
    const customerCondition = {
      tenantid: this.userstoragedata.tenantid,
      ecl2region: event.region,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getCustomerList(customerCondition);
  }

  getCustomerList(condition) {
    this.loading = true;
    this.commonService.allCustomers(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.customerList = response.data;
        this.loading = false;
      } else {
        this.customerList = [];
        this.loading = false;
      }
      this.loading = false;
    });
  }
  onCustomerChange(event) {
    this.internetserviceList = [];
    this.qosList = [];
    this.gatewayForm.controls["internetserviceid"].reset();
    this.gatewayForm.controls["qosoptionid"].reset();
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      region: event.ecl2region,
      customerid: event.customerid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getInternetServices(condition);
  }
  onServiceChange(event) {
    if (event) {
      this.gatewayForm.controls["qosoptionid"].reset();
      const condition = {
        tenantid: this.userstoragedata.tenantid,
        internetserviceid: event.ecl2internetservicesid,
        region: this.gatewayForm.value.zoneid.region,
        status: AppConstant.STATUS.ACTIVE,
      };
      this.getQosOptions(condition);
    }
  }
  getInternetServices(condition) {
    this.loading = true;
    this.ecl2Service.allecl2internetservices(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.internetserviceList = response.data;
      } else {
        this.internetserviceList = [];
      }
      this.loading = false;
    });
  }
  getQosOptions(condition) {
    this.loading = true;
    this.ecl2Service.allecl2qosoptions(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.qosList = _.map(response.data, function (item: any) {
          item.qosoptionname =
            item.qosoptionname +
            ":(type=" +
            item.qostype +
            ",bandwidth=" +
            item.bandwidth +
            ")";
          return item;
        });
        if (this.edit === true) {
          this.gatewayForm.controls.qosoptionid.setValue(
            _.find(this.qosList, { qosoptionid: this.gatewayObj.qosoptionid })
          );
        }
      } else {
        this.qosList = [];
      }
      this.loading = false;
    });
  }
  SelectedTab(event) {
    if (event === "Global IP") {
      this.globalIpObj = this.gatewayObj;
    } else if (event === "Gateway Interface") {
      this.interfaceObj = this.gatewayObj;
    } else if (event === "Static Route") {
      this.staticIpObj = this.gatewayObj;
    }
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.gatewayForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.gatewayForm,
        this.gatewayErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        gatewayname: data.gatewayname,
        internetservicesid: data.internetserviceid.internetservicesid,
        ecl2internetserviceid: data.internetserviceid.ecl2internetservicesid,
        qosoptionid: data.qosoptionid.qosoptionid,
        ecl2qosoptionid: data.qosoptionid.ecl2qosoptionid,
        description: data.description,
        zoneid: data.zoneid.zoneid,
        customerid: data.customerid.customerid,
        ecl2tenantid: data.customerid.ecl2tenantid,
        region: data.zoneid.region,
        status: data.status,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.gatewayObj) &&
        !_.isUndefined(this.gatewayObj.internetgatewayid) &&
        !_.isEmpty(this.gatewayObj)
      ) {
        this.formdata.internetgatewayid = this.gatewayObj.internetgatewayid;
        this.formdata.ecl2internetgatewayid =
          this.gatewayObj.ecl2internetgatewayid;
        this.ecl2Service.updateecl2gateway(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.disabled = false;
            response.data.ecl2internetservices = data.internetserviceid;
            response.data.ecl2zones = data.zoneid;
            response.data.customer = data.customerid;
            this.notifyNewEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            this.notificationService.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
        });
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.createecl2gateway(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.clearForm();
            this.loading = false;
            this.disabled = false;
            response.data.ecl2internetservices = data.internetserviceid;
            response.data.ecl2zones = data.zoneid;
            response.data.customer = data.customerid;
            this.notifyNewEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            this.notificationService.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
        });
      }
    }
  }

  getTagValues() {
    this.loading = true;
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.gatewayObj.internetgatewayid)
          ? this.gatewayObj.internetgatewayid
          : Number(this.gatewayObj.internetgatewayid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[7],
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.tagsList = this.tagService.prepareViewFormat(response.data);
            this.tags = this.tagService.decodeTagValues(
              response.data,
              "picker"
            );
            this.tagsClone = response.data;
            console.log(this.tagsList);
          } else {
            this.tagsClone = [];
            this.tags = [];
            this.tagsList = [];
            // this.message.error(response.message);
          }
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          // this.message.error('Unable to get tag group. Try again');
        }
      );
  }

  updateTags() {
    this.loading = true;
    this.tagValueService.bulkupdate(this.tagsClone).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.message.info(response.message);
        } else {
          this.loading = false;
          this.message.error(response.message);
        }
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.message.error("Unable to remove tag. Try again");
      }
    );
  }

  tagDrawerChanges(e) {
    this.tagPickerVisible = false;
  }

  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagPickerVisible = false;
      this.tagsClone = e.data;
      this.tagsList = this.tagService.prepareViewFormat(e.data);
    }
  }
}
