import { Component, OnInit, SimpleChanges, Input } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SLATemplatesService } from "../../../tenants/servicemgmt/slatemplates/slatemplates.service";
import * as _ from "lodash";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TenantsService } from "../../tenants.service";

@Component({
  selector: "app-add-sla",
  templateUrl:
    "../../../../presentation/web/tenant/customers/add-sla/add-sla.component.html",
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
})
export class AddSlaComponent implements OnInit {
  @Input() customerid;
  slatempid = null;
  slatempList = [];
  incidentslaList = [];
  incidentsla = [];
  availabilityslaList = [];
  servicecreditList = [];
  priorityList = [];
  userstoragedata: any;
  tagList: any;
  customerObj = {};
  editmode = false;
  updating = false;
  loading = false;
  constructor(
    private message: NzMessageService,
    private slaTemplateService: SLATemplatesService,
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private tenantsService: TenantsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.customerid && changes.customerid.currentValue) {
      this.customerid = changes.customerid.currentValue;
      this.initForm();
      this.getSLAList();
      this.getAllTags();
    }
  }

  getSLAByCustomer() {
    this.loading = true;
    this.tenantsService
      .customerbyId(this.customerid, `sla=${true}`)
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.customerObj = response.data;
          if (this.customerObj["slatemplateid"] != null) {
            this.editmode = true;
            this.editForm(this.customerObj);
          }
        } else {
          this.customerObj = {};
        }
        this.loading = false;
      });
  }

  editForm(customerObj) {
    this.loading = true;
    this.slatempid = customerObj.slatemplateid;
    let stemplate = _.find(this.slatempList, { id: this.slatempid });
    if (stemplate) {
      this.incidentsla = stemplate.incidentsla;
    }

    if (
      customerObj.customerincidentsla &&
      customerObj.customerincidentsla.length > 0
    ) {
      this.incidentslaList = [];
      customerObj.customerincidentsla.forEach((element) => {
        element.priority = element.incidentsla
          ? element.incidentsla.priority
          : "";
        element.refid = element.id;
        this.incidentslaList.push(
          this.addDataList(AppConstant.CUSTOMER_SLA[0], element)
        );
      });
    }

    if (
      customerObj.customeravailabilitysla &&
      customerObj.customeravailabilitysla.length > 0
    ) {
      this.availabilityslaList = [];
      customerObj.customeravailabilitysla.forEach((element) => {
        element.refid = element.id;
        this.availabilityslaList.push(
          this.addDataList(AppConstant.CUSTOMER_SLA[1], element)
        );
      });
    }

    if (
      customerObj.customerservicecredits &&
      customerObj.customerservicecredits.length > 0
    ) {
      this.servicecreditList = [];
      customerObj.customerservicecredits.forEach((element) => {
        element.refid = element.id;
        this.servicecreditList.push(
          this.addDataList(AppConstant.CUSTOMER_SLA[2], element)
        );
      });
    }
    this.loading = false;
  }

  addDataList(slatype, data?) {
    let obj = {
      tenantid: this.userstoragedata.tenantid,
      customerid: this.customerid,
      slatemplateid: this.slatempid,
      notes: data && data.notes ? data.notes : "",
      tagid: data && data.tagid ? data.tagid : null,
      tagvalue: data && data.tagvalue ? data.tagvalue : "",
      createddt: data && data.createddt ? data.createddt : new Date(),
      createdby: this.userstoragedata.fullname,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt:
        data && data.lastupdateddt ? data.lastupdateddt : new Date(),
    };
    if (this.editmode && data && data.refid) {
      obj["id"] = data.refid;
    }
    if (slatype == AppConstant.CUSTOMER_SLA[0]) {
      obj["priority"] = data && data.priority ? data.priority : null;
      if (this.editmode && data && data.incidentslaid) {
        obj["incidentslaid"] = data.incidentslaid;
      } else {
        obj["incidentslaid"] = data && data.id ? data.id : null;
      }
      obj["responsetime"] =
        data && data.responsetime ? data.responsetime : null;
      obj["resolutiontime"] =
        data && data.resolutiontime ? data.resolutiontime : null;
      obj["resolutiontime"] =
        data && data.resolutiontime ? data.resolutiontime : null;
      return obj;
    }
    if (slatype == AppConstant.CUSTOMER_SLA[1]) {
      obj["uptimeprcnt"] = data && data.uptimeprcnt ? data.uptimeprcnt : null;
      obj["rto"] = data && data.rto ? data.rto : null;
      obj["rpo"] = data && data.rpo ? data.rpo : null;
      obj["slaid"] = data && data.slaid ? data.slaid : null;
      return obj;
    }
    if (slatype == AppConstant.CUSTOMER_SLA[2]) {
      obj["utmin"] = data && data.utmin ? data.utmin : null;
      obj["utmax"] = data && data.utmax ? data.utmax : null;
      obj["servicecredit"] =
        data && data.servicecredit ? data.servicecredit : null;
      obj["servicecreditid"] = data && data.id ? data.id : null;
      if (this.editmode && data && data.servicecreditid) {
        obj["servicecreditid"] = data.servicecreditid;
      }
      return obj;
    }
  }

  initForm() {
    this.incidentslaList.push(this.addDataList(AppConstant.CUSTOMER_SLA[0]));
    this.availabilityslaList.push(
      this.addDataList(AppConstant.CUSTOMER_SLA[1])
    );
    this.servicecreditList.push(this.addDataList(AppConstant.CUSTOMER_SLA[2]));
  }

  onSelect(event) {
    let stemplate = _.find(this.slatempList, { id: this.slatempid });
    this.incidentsla = stemplate.incidentsla;
    this.getTemplate(this.slatempid);
  }

  getSLAList() {
    let condition = {} as any;
    condition = {
      tenantid: this.userstoragedata.tenantid,
    };
    this.slaTemplateService
      .all(condition, `?include=${JSON.stringify(["incidentsla"])}`)
      .subscribe((data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.slatempList = response.data;
          this.getSLAByCustomer();
        } else {
          this.slatempList = [];
        }
      });
  }

  addRow(type) {
    switch (type) {
      case AppConstant.CUSTOMER_SLA[0]:
        this.incidentslaList.push(this.addDataList(type));
        break;
      case AppConstant.CUSTOMER_SLA[1]:
        this.availabilityslaList.push(this.addDataList(type));
        break;
      case AppConstant.CUSTOMER_SLA[2]:
        this.servicecreditList.push(this.addDataList(type));
        break;
    }
  }

  deleteRow(type, i) {
    switch (type) {
      case AppConstant.CUSTOMER_SLA[0]:
        if (this.incidentslaList.length > 1) {
          if (this.incidentslaList[i].id != null) {
            this.deleteSLA(type, this.incidentslaList[i]);
          }
          this.incidentslaList.splice(i, 1);
          this.incidentslaList = [...this.incidentslaList];
        }
        break;
      case AppConstant.CUSTOMER_SLA[1]:
        if (this.availabilityslaList.length > 1) {
          if (this.availabilityslaList[i].id != null) {
            this.deleteSLA(type, this.availabilityslaList[i]);
          }
          this.availabilityslaList.splice(i, 1);
          this.availabilityslaList = [...this.availabilityslaList];
        }
        break;
      case AppConstant.CUSTOMER_SLA[2]:
        if (this.servicecreditList.length > 1) {
          if (this.servicecreditList[i].id != null) {
            this.deleteSLA(type, this.servicecreditList[i]);
          }
          this.servicecreditList.splice(i, 1);
          this.servicecreditList = [...this.servicecreditList];
        }
        break;
    }
  }

  getTemplate(id) {
    this.loading = true;
    let query =
      "?include=" +
      JSON.stringify(["slaparameters", "incidentsla", "servicecredits"]);
    this.slaTemplateService.all({ id: id }, query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.fetchDetails(response.data[0]);
      } else {
        this.message.error(response.message);
      }
      this.loading = false;
    });
  }

  fetchDetails(data) {
    if (data.incidentsla && data.incidentsla.length > 0) {
      this.incidentslaList = [];
      data.incidentsla.forEach((element) => {
        this.incidentslaList.push(
          this.addDataList(AppConstant.CUSTOMER_SLA[0], element)
        );
      });
    }

    if (data.slaparameters && data.slaparameters.length > 0) {
      this.availabilityslaList = [];
      data.slaparameters.forEach((element) => {
        this.availabilityslaList.push(
          this.addDataList(AppConstant.CUSTOMER_SLA[1], element)
        );
      });
    }
    if (data.servicecredits && data.servicecredits.length > 0) {
      this.servicecreditList = [];
      data.servicecredits.forEach((element) => {
        this.servicecreditList.push(
          this.addDataList(AppConstant.CUSTOMER_SLA[2], element)
        );
      });
    }
  }

  getAllTags() {
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.tagList = response.data;
      } else {
        this.tagList = [];
      }
    });
  }

  onTagSelect(tag?, idx?, slatype?) {
    if (tag && tag.tagid != null) {
      let cndtn = {
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
        tagid: tag.tagid,
      };
      let query = "?distinct=tagvalue";
      this.tagValueService.all(cndtn, query).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            if (slatype) {
              switch (slatype) {
                case AppConstant.CUSTOMER_SLA[0]:
                  this.incidentslaList[idx].tagvalue = null;
                  this.incidentslaList[idx].tagValues = response.data;
                  break;
                case AppConstant.CUSTOMER_SLA[1]:
                  this.availabilityslaList[idx].tagvalue = null;
                  this.availabilityslaList[idx].tagValues = response.data;
                  break;
                case AppConstant.CUSTOMER_SLA[2]:
                  this.servicecreditList[idx].tagvalue = null;
                  this.servicecreditList[idx].tagValues = response.data;
                  break;
              }
            }
          } else {
            this.incidentslaList[idx].tagValues = [];
          }
        },
        (err) => {
          this.message.error("Unable to get tag group. Try again");
        }
      );
    } else {
      this.incidentslaList[idx].tagValues = [];
      this.incidentslaList[idx].tagvalue = null;
    }
  }

  saveOrUpdate() {
    // this.updating = true;
    this.loading = true;
    let formdata = {
      customerid: this.customerid,
      slatemplateid: this.slatempid,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    if (
      this.editmode &&
      this.customerObj &&
      this.customerObj["slatemplateid"] != this.slatempid
    ) {
      formdata["prevslatemplateid"] = this.customerObj["slatemplateid"];
    }
    if (this.incidentslaList.length > 0) {
      formdata["incidentsla"] = this.incidentslaList.map((el) => {
        let obj = _.clone(el);
        delete obj["tagValues"];
        return obj;
      });
    }
    if (this.availabilityslaList.length > 0) {
      formdata["availablitysla"] = this.availabilityslaList.map((el) => {
        let obj = _.clone(el);
        delete obj["tagValues"];
        return obj;
      });
    }
    if (this.servicecreditList.length > 0) {
      formdata["servicecredits"] = this.servicecreditList.map((el) => {
        let obj = _.clone(el);
        delete obj["tagValues"];
        return obj;
      });
    }

    this.tenantsService.createcustomersla(formdata).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        setTimeout(() => {
          this.getSLAByCustomer();
        }, 1000);
        this.message.success(response.message);
      } else {
        this.loading = false;
        this.message.success(response.message);
      }
      // this.updating = false;
    });
  }

  deleteSLA(slatype, data) {
    const condition = {
      id: data.id,
      status: AppConstant.STATUS.DELETED,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    if (slatype == AppConstant.CUSTOMER_SLA[0]) {
      this.tenantsService
        .updateCustomerIncidentsla(condition)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success("Deleted Successfully");
          } else {
            this.message.success(response.message);
          }
        });
    }
    if (slatype == AppConstant.CUSTOMER_SLA[1]) {
      this.tenantsService
        .updateCustomerAvailabilitysla(condition)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success("Deleted Successfully");
          } else {
            this.message.success(response.message);
          }
        });
    }
    if (slatype == AppConstant.CUSTOMER_SLA[2]) {
      this.tenantsService
        .updateServicecreditsla(condition)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success("Deleted Successfully");
          } else {
            this.message.success(response.message);
          }
        });
    }
  }
}
