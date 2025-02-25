import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { TenantsService } from "../../../tenants/tenants.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { IncidentService } from "../../../tenants/customers/incidents.service";
import * as _ from "lodash";
import { AWSAppConstant } from "src/app/aws.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import * as moment from "moment";

@Component({
  selector: "app-addeditticket",
  templateUrl:
    "../../../../presentation/web/base/ticketmanagement/addeditticket/addeditticket.component.html",
})
export class AddeditticketComponent implements OnInit {
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  @Input() incidentObj: any = {};

  loading = false;
  incidentForm: FormGroup;
  customerList = [];
  categoryList = [];
  subcategoryList = [];
  severityList = [];
  impactList = [];
  urgencyList = [];
  contacttypes = [];
  incidentstatusList = [];
  productList = [];
  assignmentgroups = [];
  tabIndex = 0 as number;
  statusList = [
    AppConstant.STATUS.ACTIVE,
    AppConstant.STATUS.INACTIVE,
    AppConstant.STATUS.DELETED,
  ];
  userstoragedata: any;
  button = "Save";
  addCategory: boolean = false;
  edit = false;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  incidentErrObj = {
    customerid: AWSAppConstant.VALIDATIONS.TICKETS.CUSTOMERNAME,
    category: AWSAppConstant.VALIDATIONS.TICKETS.CATEGORY,
    incidentno: AWSAppConstant.VALIDATIONS.TICKETS.INCIDENTNo,
    title: AWSAppConstant.VALIDATIONS.TICKETS.TITLE,
    displaytitle: AWSAppConstant.VALIDATIONS.TICKETS.DISPLAYTITLE,
    severity: AWSAppConstant.VALIDATIONS.TICKETS.SEVERITY,
    urgency: AWSAppConstant.VALIDATIONS.TICKETS.URGENCY,
    impact: AWSAppConstant.VALIDATIONS.TICKETS.IMPACT,
    notes: AWSAppConstant.VALIDATIONS.TICKETS.NOTES,
  };
  constructor(
    private fb: FormBuilder,
    private tenantsService: TenantsService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private incidentService: IncidentService,
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SNOW_TICKETS,
    });
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
    if (
      !_.isUndefined(changes.incidentObj) &&
      !_.isEmpty(changes.incidentObj.currentValue)
    ) {
      this.edit = true;
      this.button = AppConstant.BUTTONLABELS.UPDATE;
      this.editForm(changes.incidentObj.currentValue);
    } else {
      this.edit = false;
      this.button = AppConstant.BUTTONLABELS.SAVE;
    }
    this.getCustomerList();
    this.getCategoryList();
    this.getSubCategoryList();
  }
  ngOnInit() {
    this.getSeverityList();
  }
  editForm(value) {
    let data = { ...value };
    data.publishyn = value.publishyn == "Y" ? true : false;
    this.incidentForm.patchValue(data);
  }

  disabledDate = (current) => {
    // Can not select days before today
    return moment().add(-1, "days") >= current;
  };

  initForm() {
    this.incidentForm = this.fb.group({
      incidentno: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      caller_id: [""],
      u_environment: [""],
      customerid: [null],
      category: [null],
      subcategory: [null],
      incidentdate: [new Date()],
      incidentclosedt: [null],
      response_ts: [null],
      resolution_ts: [null],
      displaytitle: [null, Validators.compose([Validators.maxLength(200)])],
      severity: [""],
      impact: [null, Validators.required],
      urgency: [null, Validators.required],
      title: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(500),
        ]),
      ],
      contacttype: [null],
      product: [null],
      assignmentgroup: [null],
      assignmentto: [""],
      notes: [""],
      publishyn: [false],
      incidentstatus: ["New"],
      status: [AppConstant.STATUS.ACTIVE],
    });
  }

  saveOrUpdate(data) {
    this.loading = true;
    let errorMessage: any;
    if (this.incidentForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.incidentForm,
        this.incidentErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      this.loading = false;
      return false;
    } else {
      let formdata = {};
      for (let k in data) {
        if (data[k] != null || data[k] != undefined) {
          formdata[k] = data[k];
        }
      }
      formdata["tenantid"] = this.userstoragedata.tenantid;
      formdata["addCategory"] = this.addCategory;
      formdata["publishyn"] = data.publishyn == true ? "Y" : "N";
      formdata["lastupdatedby"] = this.userstoragedata.fullname;
      formdata["lastupdateddt"] = new Date();
      if (formdata["customerid"]) {
        let customerObj = _.find(this.customerList, {
          customerid: data.customerid,
        });
        formdata["u_customer"] = customerObj ? customerObj.customername : "";
      }
      if (
        formdata["customerid"] == undefined ||
        formdata["customerid"] == null
      ) {
        formdata["customerid"] = -1;
      }
      if (!_.isEmpty(this.incidentObj)) {
        formdata["id"] = this.incidentObj.id;
        this.incidentService.update(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.notifyNewEntry.emit(response.data);
          } else {
            this.notification.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
          this.loading = false;
        });
      } else {
        formdata["createdby"] = this.userstoragedata.fullname;
        formdata["createddt"] = new Date();
        this.incidentService.create(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.loading = false;
            this.notifyNewEntry.emit(response.data);
          } else {
            this.loading = false;
            this.notification.error("Error", response.message, {
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

  getCustomerList() {
    this.tenantsService
      .allcustomers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.customerList = response.data;
        } else {
          this.customerList = [];
        }
      });
  }

  getCategoryList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.TICKET_CATEGORY,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: -1,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.categoryList = response.data;
      } else {
        this.categoryList = [];
      }
    });
  }
  getSubCategoryList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.TICKET_SUBCATEGORY,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: -1,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.subcategoryList = response.data;
      } else {
        this.subcategoryList = [];
      }
    });
  }

  getSeverityList() {
    let condition = {} as any;
    condition = {
      keylist: [
        AppConstant.LOOKUPKEY.TICKET_SEVERITY,
        AppConstant.LOOKUPKEY.TICKET_STATUS,
        AppConstant.LOOKUPKEY.TICKET_CONTACTTYPE,
        AppConstant.LOOKUPKEY.TICKET_IMPACT,
        AppConstant.LOOKUPKEY.TICKET_PRODUCT,
        AppConstant.LOOKUPKEY.TICKET_URGENCY,
        AppConstant.LOOKUPKEY.TICKET_ASSIGN_GROUP,
      ],
      status: AppConstant.STATUS.ACTIVE,
      tenantid: -1,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.severityList = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_SEVERITY;
        });
        this.incidentstatusList = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_STATUS;
        });
        this.productList = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_PRODUCT;
        });
        this.contacttypes = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_CONTACTTYPE;
        });
        this.impactList = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_IMPACT;
        });
        this.urgencyList = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_URGENCY;
        });
        this.assignmentgroups = _.filter(response.data, function (i) {
          return i.lookupkey == AppConstant.LOOKUPKEY.TICKET_ASSIGN_GROUP;
        });
        if (_.isEmpty(this.incidentObj)) {
          this.incidentForm.controls["incidentstatus"].setValue(
            _.find(this.incidentstatusList, function (i) {
              return i.keyname == "New";
            })
          );
        }
      } else {
        this.severityList = [];
        this.incidentstatusList = [];
      }
    });
  }

  onCategoryChange(event) {
    console.log(event);
    if (event != "") {
      let existObj = _.find(this.categoryList, { keyvalue: event });
      if (existObj == undefined) {
        console.log("Value not available");
        this.addCategory = true;
      } else {
        this.addCategory = false;
      }
    }
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
