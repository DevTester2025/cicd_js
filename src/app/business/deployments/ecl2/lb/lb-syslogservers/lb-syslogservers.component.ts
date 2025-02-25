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
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { Ecl2Service } from "../../ecl2-service";
import * as _ from "lodash";

@Component({
  selector: "app-lb-syslogservers",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/lb/lb-syslogservers/lb-syslogservers.component.html",
})
export class LbSyslogserversComponent implements OnInit, OnChanges {
  @Input() lbSyslogObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  userstoragedata = {} as any;
  ecl2lbsyslogForm: FormGroup;
  formdata: any = {};
  buttonText: any;
  edit = false;
  platformList = [];
  networkList: any = [];
  networks: any = [];
  interfaceObj: any = {};
  transportList: any[] = [];
  loglevelList: any[] = [];
  logFacilityList: any[] = [];
  dateFormatList: any[] = [];
  timeZoneList: any[] = [];
  tcpLoggingList: any[] = [];
  aclLoggingList: any[] = [];
  ecl2InterfaceErrObj = {
    lbsyslogservername:
      AppConstant.VALIDATIONS.ECL2.SYSLOGSERVER.SYSLOGSERVERNAME,
    ipaddress: AppConstant.VALIDATIONS.ECL2.SYSLOGSERVER.IPADDRESS,
  };
  loading = false;
  disabled = false;
  constructor(
    private localStorageService: LocalStorageService,
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
    this.getDefaultList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.lbSyslogObj) &&
      !_.isUndefined(changes.lbSyslogObj.currentValue.lbsyslogserverid)
    ) {
      this.clearForm();
      this.lbSyslogObj = changes.lbSyslogObj.currentValue;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.lbSyslogObj);
    } else {
      this.clearForm();
      this.lbSyslogObj = changes.lbSyslogObj.currentValue;
      this.edit = false;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  clearForm() {
    this.ecl2lbsyslogForm = this.fb.group({
      lbsyslogservername: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      ipaddress: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30),
        ]),
      ],
      transporttype: ["UDP"],
      portnumber: [512],
      loglevel: ["ALL"],
      logfacility: ["LOCAL0"],
      description: [""],
      dateformat: ["MMDDYYYY"],
      timezone: ["GMT_TIME"],
      priority: [0],
      tcplogging: ["NONE"],
      acllogging: ["DISABLED"],
    });
  }

  generateEditForm(data) {
    // this.ecl2lbsyslogForm.patchValue(data);
    this.ecl2lbsyslogForm = this.fb.group({
      lbsyslogservername: [data.lbsyslogservername, Validators.required],
      ipaddress: [data.ipaddress, Validators.required],
      transporttype: [data.transporttype],
      portnumber: [data.portnumber],
      loglevel: [data.loglevel],
      logfacility: [data.logfacility],
      description: [data.description],
      dateformat: [data.dateformat],
      timezone: [data.timezone],
      priority: [data.priority],
      tcplogging: [data.tcplogging],
      acllogging: [data.acllogging],
    });
  }

  getDefaultList() {
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    condition.keylist = [
      AppConstant.LOOKUPKEY.TRANSPORTTTYPE,
      AppConstant.LOOKUPKEY.LOGLEVEL,
      AppConstant.LOOKUPKEY.LOGFACILITY,
      AppConstant.LOOKUPKEY.DATEFORMAT,
      AppConstant.LOOKUPKEY.TIMEZONE,
      AppConstant.LOOKUPKEY.TCPLOGGING,
      AppConstant.LOOKUPKEY.ACLLOGGING,
    ];
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((item) => {
          switch (item.lookupkey) {
            case AppConstant.LOOKUPKEY.TRANSPORTTTYPE:
              this.transportList.push(item);
              break;
            case AppConstant.LOOKUPKEY.LOGLEVEL:
              this.loglevelList.push(item);
              break;
            case AppConstant.LOOKUPKEY.LOGFACILITY:
              this.logFacilityList.push(item);
              break;
            case AppConstant.LOOKUPKEY.DATEFORMAT:
              this.dateFormatList.push(item);
              break;
            case AppConstant.LOOKUPKEY.TIMEZONE:
              this.timeZoneList.push(item);
              break;
            case AppConstant.LOOKUPKEY.TCPLOGGING:
              this.tcpLoggingList.push(item);
              break;
            case AppConstant.LOOKUPKEY.ACLLOGGING:
              this.aclLoggingList.push(item);
              break;
          }
        });
      } else {
        this.transportList = [];
        this.loglevelList = [];
        this.dateFormatList = [];
        this.timeZoneList = [];
        this.tcpLoggingList = [];
        this.aclLoggingList = [];
      }
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.ecl2lbsyslogForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.ecl2lbsyslogForm,
        this.ecl2InterfaceErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        loadbalancerid: this.lbSyslogObj.loadbalancerid,
        ecl2loadbalancerid: this.lbSyslogObj.ecl2loadbalancerid,
        lbinterfacename: this.lbSyslogObj.lbinterfacename,
        lbsyslogservername: data.lbsyslogservername,
        ipaddress: data.ipaddress,
        description: data.description,
        acllogging: data.acllogging,
        loglevel: data.loglevel,
        logfacility: data.logfacility,
        portnumber: data.portnumber,
        priority: data.priority,
        tcplogging: data.tcplogging,
        dateformat: data.dateformat,
        timezone: data.timezone,
        transporttype: data.transporttype,
        zoneid: this.lbSyslogObj.lbzones.zoneid,
        region: this.lbSyslogObj.lbzones.region,
        customerid: this.lbSyslogObj.customer.customerid,
        ecl2tenantid: this.lbSyslogObj.customer.ecl2tenantid,
        status: AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };

      if (
        !_.isUndefined(this.lbSyslogObj) &&
        !_.isUndefined(this.lbSyslogObj.lbsyslogserverid) &&
        !_.isEmpty(this.lbSyslogObj)
      ) {
        this.formdata.lbsyslogserverid = this.lbSyslogObj.lbsyslogserverid;
        this.formdata.ecl2lbsyslogserverid =
          this.lbSyslogObj.ecl2lbsyslogserverid;
        this.ecl2Service.updateecl2lbsyslogserver(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.loading = false;
              this.disabled = false;
              this.message.success(response.message);
              this.notifyNewEntry.next(response.data);
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
          },
          (err) => {
            this.loading = false;
            this.disabled = false;
            this.message.error("Sorry! Something gone wrong");
          }
        );
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.createecllbsyslogserver(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.disabled = false;
              this.message.success(response.message);
              this.notifyNewEntry.next(response.data);
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
          },
          (err) => {
            this.loading = false;
            this.disabled = false;
            this.message.error("Sorry! Something gone wrong");
          }
        );
      }
    }
  }
}
