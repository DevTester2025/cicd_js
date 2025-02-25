import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  EventEmitter,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SLATemplatesService } from "./slatemplates.service";
import * as _ from "lodash";
import { TenantsService } from "../../tenants.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { ServiceCreditsService } from "./servicecredits.service";

@Component({
  selector: "app-cloudmatiq-addeditslatemplate",
  styles: [
    `
      #grouptable th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }
      #grouptable td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #grouptable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      nz-select {
        width: 90%;
      }
    `,
  ],
  templateUrl:
    "../../../../presentation/web/tenant/servicemgmt/slatemplates/add-edit-slatemplate.component.html",
})
export class SLAAddEditTemplateComponent implements OnInit {
  screens = [];
  appScreens = {} as any;
  loading = false;
  userstoragedata = {} as any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  slaObj = {} as any;
  slaformObj = {
    slaparameters: [],
    slaname: "",
    slatemplateid: null,
    notes: "",
  } as any;
  buttonText = "Save";
  priorityList = [];
  create = false;
  @Input() id: number;
  constructor(
    private message: NzMessageService,
    private slaTemplateService: SLATemplatesService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private serviceCreditService: ServiceCreditsService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SLA_MGMT,
    } as any);
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "Create")) {
        this.create = true;
      }
    }
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    this.getAllPriority();
  }
  getTemplate(id) {
    this.loading = true;
    let query =
      "?include=" +
      JSON.stringify(["slaparameters", "incidentsla", "servicecredits"]);
    this.slaTemplateService.all({ id: id }, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.onSlaSelect(response.data[0]);
      } else {
        this.message.error(response.message);
        this.loading = false;
      }
    });
  }
  clearForm() {
    this.slaformObj = {
      tenantid: this.userstoragedata.tenantid,
      uptimeprcnt: null,
      rpo: null,
      rto: null,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      slatemplateid: this.id,
      notes: "",
      slaname: "",
    };

    this.slaformObj.servicecredits = [];
    this.slaformObj.incidentsla = [];
    this.slaformObj.slaparameters = [];
    this.addServiceCredits(0);
  }
  onSlaSelect(d) {
    this.slaObj = d;
    this.slaformObj.slatemplateid = d.id;
    this.slaformObj.notes = d.notes;
    this.slaformObj.slaname = d.slaname;
    this.slaformObj.servicecredits = [];
    if (d.slaparameters && d.slaparameters.length > 0) {
      this.slaformObj.uptimeprcnt = d.slaparameters[0].uptimeprcnt;
      this.slaformObj.rpo = d.slaparameters[0].rpo;
      this.slaformObj.rto = d.slaparameters[0].rto;
    }
    this.slaformObj.incidentsla = _.map(this.priorityList, (itm) => {
      let exist: any = _.find(d.incidentsla, { priority: itm.keyname });
      itm.priority = itm.keyname;
      itm.responsetime = exist ? exist.responsetime : null;
      itm.resolutiontime = exist ? exist.resolutiontime : null;
      itm.notes = exist ? exist.notes : "";
      if (exist == undefined) {
        itm.createdby = this.userstoragedata.fullname;
        itm.createddt = new Date();
      } else {
        itm.id = exist.id;
      }
      itm.lastupdatedby = this.userstoragedata.fullname;
      itm.lastupdateddt = new Date();
      itm.slatemplateid = d.id;
      itm.tenantid = this.userstoragedata.tenantid;
      return itm;
    });
    _.map(d.servicecredits, (itm, i) => {
      this.addServiceCredits(i, itm);
    });
    if (d.servicecredits.length == 0) {
      this.addServiceCredits(0);
    }
    this.loading = false;
  }
  addServiceCredits(i?, data?) {
    let obj = {
      utmin: data ? data.utmin : null,
      utmax: data ? data.utmax : null,
      servicecredit: data ? data.servicecredit : null,
      notes: data ? data.notes : "",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      slatemplateid: this.id,
      tenantid: this.userstoragedata.tenantid,
      id: data ? data.id : undefined,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
    } as any;
    if (data) {
      obj.createddt = data.createddt;
      obj.createdby = data.createdby;
    }
    if (i) {
      this.slaformObj.servicecredits[i] = obj;
    } else {
      this.slaformObj.servicecredits.push(obj);
    }
  }
  deleteServiceCredits(i) {
    if (this.slaformObj.servicecredits[i].id != null) {
      this.serviceCreditService
        .delete(this.slaformObj.servicecredits[i].id)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            _.remove(this.slaformObj.servicecredits, function (item, idx) {
              return i == idx;
            });
            if (this.slaformObj.servicecredits.length == 0) {
              this.addServiceCredits(0);
            }
          }
        });
    } else {
      _.remove(this.slaformObj.servicecredits, function (item, idx) {
        return i == idx;
      });
      if (this.slaformObj.servicecredits.length == 0) {
        this.addServiceCredits(0);
      }
    }
  }
  updateSlaTemplate() {
    if (this.slaObj.slaname == "") {
      this.message.error("Please enter sla name");
      return false;
    }
    if (this.slaformObj.uptimeprcnt == null) {
      this.message.error("Please enter uptime percent");
      return false;
    }
    if (this.slaformObj.rpo == null) {
      this.message.error("Please enter RPO");
      return false;
    }
    if (this.slaformObj.rto == null) {
      this.message.error("Please enter RTO");
      return false;
    }
    // let invalid = false;
    // _.each(this.slaformObj.servicecredits, (itm) => {
    //   if (Number(itm.utmin) < Number(itm.utmax)) {
    //     invalid = true;
    //   }
    // });
    // if (invalid) {
    //   this.message.error("From credit value should be greater than To credit");
    //   return false;
    // }
    let formdata = {
      slatemplateid: this.id,
      slaname: this.slaformObj.slaname,
      notes: this.slaformObj.notes == null ? "" : this.slaformObj.notes,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      isParam: true,
      slaparameters: [
        {
          uptimeprcnt: this.slaformObj.uptimeprcnt,
          rpo: this.slaformObj.rpo,
          rto: this.slaformObj.rto,
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
          slatemplateid: this.slaformObj.slatemplateid,
          notes: this.slaformObj.notes,
          tenantid: this.userstoragedata.tenantid,
        },
      ],
      incidentsla: [],

      servicecredits: this.slaformObj.servicecredits,
    } as any;
    _.map(this.slaformObj.incidentsla, (itm) => {
      let obj = _.clone(itm);
      obj.responsetime = obj.responsetime == "" ? null : obj.responsetime;
      obj.resolutiontime = obj.resolutiontime == "" ? null : obj.resolutiontime;
      formdata.incidentsla.push(obj);
    });
    if (this.slaObj.slaparameters && this.slaObj.slaparameters.length > 0) {
      formdata.slaparameters[0].slaid = this.slaObj.slaparameters[0].slaid;
    }
    this.slaTemplateService.update(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        this.notifyNewEntry.next(response.data);
      } else {
        this.message.error(response.message);
      }
    });
  }
  getAllPriority() {
    let condition = {} as any;
    condition = {
      tenantid: -1,
      status: AppConstant.STATUS.ACTIVE,
      lookupkey: "SLA_PRIORITY",
    };
    this.commonService.allLookupValues(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.priorityList = _.map(response.data, (itm) => {
          itm.keyvalue = Number(itm.keyvalue);
          return itm;
        });
        this.getTemplate(this.id);
      } else {
        this.priorityList = [];
        this.getTemplate(this.id);
      }
    });
  }
}
