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
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Component({
  selector: "app-add-edit-commongateway",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/commongateway/add-edit-commongateway/add-edit-commongateway.component.html",
})
export class AddEditCommongatewayComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  // Standalone
  @Input() tagsOnly: boolean; // If true only tags can be added / edited.
  @Input() cfgid: string;
  @Input() mode: string;
  @Input() assetData: any;

  @Input() commonfngatewayObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  gettingcfg = false;
  edit = false;
  userstoragedata: any;
  buttonText: any;
  addTenant: any = false;
  commonfuncForm: FormGroup;
  internetserviceList: any = [];
  qosList: any = [];
  formdata: any = {};
  disabled = false;
  loading = false;
  ecl2zoneList: any = [];
  commonPoolList: any = [];
  customerList: any = [];
  commonfuncErrObj = {
    cfgatewayname: AppConstant.VALIDATIONS.ECL2.COMMONFNGATEWAY.GATEWAYNAME,
    zoneid: AppConstant.VALIDATIONS.ECL2.COMMONFNGATEWAY.ZONE,
    customerid: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
    cfpoolid: AppConstant.VALIDATIONS.ECL2.COMMONFNGATEWAY.COMMONPOOL,
    description: AppConstant.VALIDATIONS.ECL2.COMMONFNGATEWAY.DESCRIPTION,
  };
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private httpService: HttpHandlerService,
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
    this.getZoneList();
    if (this.assetData) {
      this.addTenant = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.commonfngatewayObj) &&
      !_.isEmpty(changes.commonfngatewayObj.currentValue)
    ) {
      this.clearForm();
      this.commonfngatewayObj = changes.commonfngatewayObj.currentValue;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.commonfngatewayObj);
    } else if (changes.cfgid && changes.mode.currentValue == "standalone") {
      console.log("INSIDE ELSE IF:::::::::");
      this.gettingcfg = true;
      this.getCFGObject();
    } else {
      this.edit = false;
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  getCFGObject() {
    this.loading = true;
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2CFGGETBYID +
          this.cfgid
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          this.clearForm();
          this.commonfngatewayObj = response.data;
          this.edit = true;
          this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
          this.generateEditForm(this.commonfngatewayObj);
        } else {
        }
        this.loading = false;
      });
  }

  clearForm() {
    this.commonfuncForm = this.fb.group({
      cfgatewayname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [null, Validators.required],
      customerid: [null, Validators.required],
      cfpoolid: ["", Validators.required],
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
    });
  }
  onCustomerChange(event) {
    this.commonPoolList = [];
    this.commonfuncForm.controls["cfpoolid"].reset();
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      region: event.ecl2region,
      customerid: event.customerid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getCommonpools(condition);
  }
  generateEditForm(data) {
    this.commonPoolList.push(data.ecl2commonfunctionpool);
    this.customerList.push(data.customer);
    this.commonfuncForm = this.fb.group({
      cfgatewayname: [
        data.cfgatewayname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      cfpoolid: [data.ecl2commonfunctionpool, Validators.required],
      zoneid: [
        _.find(this.ecl2zoneList, { zoneid: data.zoneid }),
        Validators.required,
      ],
      customerid: [data.customer, Validators.required],
      description: [
        data.description,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
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

  getCommonpools(condition) {
    this.loading = true;
    this.ecl2Service.alleclcommonfnpool(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.commonPoolList = response.data;
      } else {
        this.commonPoolList = [];
      }
      this.loading = false;
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.commonfuncForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.commonfuncForm,
        this.commonfuncErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        cfgatewayname: data.cfgatewayname,
        cfpoolid: data.cfpoolid.cfpoolid,
        ecl2cfpoolid: data.cfpoolid.ecl2cfpoolid,
        description: data.description,
        zoneid: data.zoneid.zoneid,
        customerid: data.customerid.customerid,
        ecl2tenantid: data.customerid.ecl2tenantid,
        region: data.zoneid.region,
        status:
          data.status === true
            ? AppConstant.STATUS.ACTIVE
            : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (
        !_.isUndefined(this.commonfngatewayObj) &&
        !_.isUndefined(this.commonfngatewayObj.cfgatewayid) &&
        !_.isEmpty(this.commonfngatewayObj)
      ) {
        this.formdata.cfgatewayid = this.commonfngatewayObj.cfgatewayid;
        this.formdata.ecl2cfgatewayid = this.commonfngatewayObj.ecl2cfgatewayid;
        this.ecl2Service
          .updateeclcommonfngateway(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.loading = false;
              this.disabled = false;
              response.data.ecl2commonfunctionpool = data.cfpoolid;
              response.data.ecl2zones = {
                region: data.zoneid.region,
                zoneid: data.zoneid.zoneid,
              };
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
        this.ecl2Service
          .createeclcommonfngateway(this.formdata)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.disabled = false;
              response.data.ecl2commonfunctionpool = data.cfpoolid;
              response.data.ecl2zones = {
                region: data.zoneid.region,
                zoneid: data.zoneid.zoneid,
              };
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
}
