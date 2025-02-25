import { Router, ActivatedRoute } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { SolutionService } from "../solution.service";
import { AppConstant } from "../../../../app.constant";
import { Component, OnInit, Output } from "@angular/core";
import { Ecl2Service } from "../../../deployments/ecl2/ecl2-service";
import * as _ from "lodash";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
@Component({
  selector: "app-solutiontemplate",
  styleUrls: [
    "../../../../presentation/web/tenant/solutiontemplate/solution.component.less",
  ],
  templateUrl:
    "../../../../presentation/web/tenant/solutiontemplate/add-edit-solution/add-edit-solution.component.html",
})
export class SolutionAddEditComponent implements OnInit {
  subtenantLable = AppConstant.SUBTENANT;
  current = 0;
  solutionObj = {} as any;
  snameForm: FormGroup;
  slaList: any[] = [];
  eventList: any[] = [];
  cloudproviderList: any[] = [];
  configList: any[] = [];
  modeList: any[] = [];
  clientList: any[] = [];
  userstoragedata = {} as any;
  slas: any[] = [];
  deletedSla: any[] = [];
  slaObj = {} as any;
  sladropList: any[] = [];
  // Parameters
  paramQuery = {} as any;
  solutionData = {} as any;
  showSummary = false;
  solutionid;
  // Modal
  showSlaModal = false;
  edit = false;
  loading = false;
  solutionEditObj: any = false;
  ecl2zoneList: any = [];
  defaultprovider: any;
  tabIndex = 0 as number;
  isChangelogs = false;

  tagPickerVisible = false;
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
  solutionLevelTags = [];
  tags = [];
  tagsClone = [];
  screens = [];
  appScreens = {} as any;
  showcosts = false;
  isChangeLog = false;
  constructor(
    public router: Router,
    private routes: ActivatedRoute,
    private tagService: TagService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private tagValueService: TagValueService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private solutionService: SolutionService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SOLUTION_TEMPLATE_MANAGEMENT,
    });
    if (_.includes(this.appScreens.actions, "Cost")) {
      this.showcosts = true;
    }
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangeLog = true;
    }
    this.routes.params.subscribe((params) => {
      if (params.sid !== undefined) {
        this.loading = true;
        this.solutionObj = { solutionid: params.sid };
        this.getTags();
        this.getSolutionData("", false);
        this.edit = true;
      }
    });

    console.log("AVAIL WIDTH::::::::");
    console.log(window.screen.availWidth);
  }

  ngOnInit(): void {
    this.clearForm();
    this.getClients();
    this.getLookups();
    this.getZoneList();
  }
  SolutionTabChange(e) {
    this.tabIndex = e.index;
  }
  clearForm() {
    this.snameForm = this.fb.group({
      solutionname: [null, Validators.required],
      clientid: [-1],
      cloudprovider: [null, Validators.required],
      zoneid: [null, Validators.required],
      eventtype: [null, Validators.required],
      modeofnotification: [null, Validators.required],
      configuration: [null, Validators.required],
      interval: [0, Validators.required],
      slaname: [null, Validators.required],
      notes: [""],
      status: [true],
    });
    this.solutionEditObj = false;
  }
  onChangeProvider(event) {
    if (this.edit === false) {
      if (event === AppConstant.CLOUDPROVIDER.ECL2) {
        this.snameForm.get("zoneid").setValue(null);
        this.snameForm.get("zoneid").setValidators(Validators.required);
        this.snameForm.updateValueAndValidity();
      } else {
        this.snameForm.get("zoneid").clearValidators();
        this.snameForm.updateValueAndValidity();
        this.snameForm.get("zoneid").setValue(-1);
      }
    }
  }
  getZoneList() {
    this.ecl2Service
      .allecl2Zones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          this.ecl2zoneList = response.data;
        } else {
          this.ecl2zoneList = [];
        }
      });
  }
  getLookups() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        keylist: [
          "ST_NTFN_CONFIG",
          "SLA_TYPE",
          "EVENT_TYPE",
          "NOTIFICATION_TYPE",
          "CLOUDPROVIDER",
        ],
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            for (let i = 0; i < response.data.length; i++) {
              let item = response.data[i];
              if (item.lookupkey == "ST_NTFN_CONFIG") {
                this.configList.push(item);
              }
              if (item.lookupkey == "SLA_TYPE") {
                this.sladropList.push(item);
              }
              if (item.lookupkey == "EVENT_TYPE") {
                this.eventList.push(item);
              }
              if (item.lookupkey == "NOTIFICATION_TYPE") {
                this.modeList.push(item);
              }
              if (item.lookupkey == "CLOUDPROVIDER" && item.tenantid == this.userstoragedata.tenantid) {
                this.cloudproviderList.push(item);
              }
            }
            this.defaultprovider = _.find(
              this.cloudproviderList,
              function (item) {
                if (item.defaultvalue === "Y") {
                  return item;
                }
              }
            );
            this.snameForm
              .get("cloudprovider")
              .setValue(
                !_.isEmpty(this.solutionData)
                  ? this.solutionData.cloudprovider
                  : this.defaultprovider.keyvalue
              );
          } else {
            // this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
  }

  getClients() {
    let response = {} as any;
    this.commonService
      .allCustomers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.clientList = response.data;
          } else {
            this.clientList = [];
          }
        },
        (err) => {
          this.message.error("Sorry! Something gone wrong");
        }
      );
  }

  onSelectSla() {
    this.showSlaModal = true;
  }

  saveOrUpdateSolution(formdata) {
    let response = {} as any;
    formdata.notifications = {
      tenantid: this.userstoragedata.tenantid,
      eventtype: formdata.eventtype,
      modeofnotification: formdata.modeofnotification,
      configuration: formdata.configuration,
      interval: formdata.interval,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    formdata.slas = this.slaList;
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.lastupdateddt = new Date();
    formdata.tenantid = this.userstoragedata.tenantid;
    if (formdata.clientid == null) {
      formdata.clientid = -1;
    }
    formdata.zoneid =
      formdata.cloudprovider === AppConstant.CLOUDPROVIDER.ECL2
        ? formdata.zoneid
        : -1;
    formdata.status =
      formdata.status === true
        ? AppConstant.STATUS.ACTIVE
        : AppConstant.STATUS.INACTIVE;
    if (this.snameForm.valid && !_.isEmpty(this.slaList)) {
      if (!_.isUndefined(this.solutionObj) && !_.isEmpty(this.solutionObj)) {
        formdata.solutionid = this.solutionObj.solutionid;
        formdata.notifications.notificationid =
          this.solutionObj.notifications.notificationid;
        formdata.notifications.solutionid = this.solutionObj.solutionid;
        _.map(formdata.slas, function (item) {
          item.solutionid = formdata.solutionid;
        });
        this.solutionService.update(formdata).subscribe((data) => {
          // this.loading.snameForm = false;
          response = JSON.parse(data._body);
          if (response.status) {
            this.current = 1;
            this.paramQuery = {
              templateid: response.data.solutionid,
              customerid: response.data.clientid,
              cloudprovider: response.data.cloudprovider,
              paramtype: "Template",
            };
            if (formdata.clientid !== -1) {
              response.data.client = _.find(this.clientList, {
                customerid: formdata.clientid,
              });
            }
            if (formdata.zoneid !== -1) {
              response.data.zone = _.find(this.ecl2zoneList, {
                zoneid: formdata.zoneid,
              });
            }
            response.data.notifications = this.solutionObj.notifications;
            response.data.slas = this.solutionObj.slas;
            this.solutionObj = response.data;
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        formdata.createdby = this.userstoragedata.fullname;
        formdata.createddt = new Date();
        formdata.notifications.createdby = this.userstoragedata.fullname;
        formdata.notifications.createddt = new Date();
        this.solutionService.create(formdata).subscribe((data) => {
          // this.loading.snameForm = false;
          response = JSON.parse(data._body);
          if (response.status) {
            if (formdata.zoneid !== -1) {
              response.data.zone = _.find(this.ecl2zoneList, {
                zoneid: formdata.zoneid,
              });
            }
            if (formdata.clientid !== -1) {
              response.data.client = _.find(this.clientList, {
                customerid: formdata.clientid,
              });
            }
            response.data.notifications = this.solutionObj.notifications;
            response.data.slas = this.solutionObj.slas;
            this.solutionObj = response.data;
            this.current = 1;
            this.paramQuery = {
              templateid: response.data.solutionid,
              customerid: response.data.clientid,
              cloudprovider: response.data.cloudprovider,
              paramtype: "Template",
            };
            this.slaList = response.data.slas;
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });
      }
    } else {
      // this.loading.snameForm = false;
      this.showSlaModal = true;
      this.message.error("Please fill in all the required fields");
    }
  }
  getSolutionData(str, flag) {
    let response = {} as any;
    this.solutionService.byId(this.solutionObj.solutionid).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.solutionData = response.data;
        this.solutionObj = this.solutionData;
        this.solutionObj.refid = response.data.solutionid;
        this.solutionObj.reftype = AppConstant.REFERENCETYPE[23];
        this.getTags();
        this.slaList = response.data.slas;
        if (flag) {
          this.loading = false;
          this.showSummary = true;
        } else {
          this.loading = false;
          this.generateEditForm();
        }
      }
    });
  }
  getSolutionECL2Data(flag) {
    let response = {} as any;
    this.solutionService
      .ecl2byId(this.solutionObj.solutionid)
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.solutionData = response.data;
          this.solutionObj = this.solutionData;
          this.slaList = response.data.slas;
          if (flag) {
            this.loading = false;
            this.showSummary = true;
          } else {
            this.loading = false;
          }
        }
      });
  }
  generateEditForm() {
    this.snameForm = this.fb.group({
      solutionname: [this.solutionData.solutionname, Validators.required],
      clientid: [this.solutionData.clientid],
      cloudprovider: [this.solutionData.cloudprovider, Validators.required],
      zoneid: [this.solutionData.zoneid ? this.solutionData.zoneid : -1],
      eventtype: [
        this.solutionData.notifications.eventtype,
        Validators.required,
      ],
      modeofnotification: [
        this.solutionData.notifications.modeofnotification,
        Validators.required,
      ],
      configuration: [
        this.solutionData.notifications.configuration,
        Validators.required,
      ],
      interval: [this.solutionData.notifications.interval, Validators.required],
      slaname: [this.solutionData.slaname, Validators.required],
      notes: [this.solutionData.notes],
      status: [this.solutionData.status == "Active" ? true : false],
    });
    this.solutionEditObj = true;
  }
  addSla(event) {
    this.slaList = [];
    this.slaList = event;
    this.showSlaModal = false;
  }
  onChange(event) {
    this.slaList = [];
    if (
      this.solutionObj != undefined &&
      this.solutionObj.slaname == event &&
      this.solutionObj.slas.length > 0
    ) {
      this.slaList = this.solutionObj.slas;
    } else {
      let condition = {} as any;
      condition = {
        lookupkey: event,
        status: AppConstant.STATUS.ACTIVE,
      };

      this.commonService.allLookupValues(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        let arr = [] as any;
        if (response.status) {
          response.data.forEach((element) => {
            let obj = JSON.parse(element.keyvalue);
            obj.slaname = event;
            obj.createdby = this.userstoragedata.fullname;
            obj.createddt = new Date();
            obj.lastupdatedby = this.userstoragedata.fullname;
            obj.lastupdateddt = new Date();
            obj.tenantid = this.userstoragedata.tenantid;
            obj.status = "Active";
            arr.push(obj);
          });
          if (!_.isEmpty(this.slaList)) {
            arr.forEach((element) => {
              _.map(this.slaList, function (obj: any) {
                if (obj.priority == element.priority) {
                  element.slaid = obj.slaid;
                  element.status = obj.status;
                }
              });
            });
          }
          this.slaList = arr;
        } else {
          this.slaList = [];
        }
      });
    }
  }
  show() {
    if (
      this.snameForm.value.slaname != "" &&
      this.snameForm.value.slaname != null &&
      this.snameForm.value.slaname != undefined
    ) {
      this.showSlaModal = true;
    } else {
      this.message.error("Please select sla ");
    }
  }
  closeSummary(event) {
    this.showSummary = event;
  }
  viewSummary() {
    this.loading = true;
    if (this.solutionObj.cloudprovider == "AWS") {
      this.getSolutionData("", true);
    } else {
      this.getSolutionECL2Data(true);
    }
  }

  // Tagging Related code
  getTags() {
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.solutionObj.solutionid)
          ? this.solutionObj.solutionid
          : Number(this.solutionObj.solutionid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[0],
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.solutionLevelTags = this.tagService.prepareViewFormat(
              response.data
            );
            this.tags = this.tagService.decodeTagValues(
              response.data,
              "picker"
            );
            this.tagsClone = response.data;
            console.log("TAGS UPDATED:::::::::");
            console.log(this.tagsClone);
          } else {
            this.tagsClone = [];
            this.tags = [];
            this.solutionLevelTags = [];
            // this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to get tag group. Try again");
        }
      );
  }
  tagDrawerChanges(e) {
    this.tagPickerVisible = false;
  }
  upsertTags() {
    console.log("UPSERT TAGS::::::::::::");
    console.log(this.tagsClone);
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.solutionObj.solutionid)
          ? this.solutionObj.solutionid
          : Number(this.solutionObj.solutionid),
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            let assetLevelTags = response.data.filter((o) => {
              return o.resourcetype == AppConstant.TAGS.TAG_RESOURCETYPES[1];
            });
            let removed = 0;
            for (let index = 0; index < this.tagsClone.length; index++) {
              const element = this.tagsClone[index];
              let exists = assetLevelTags.find(
                (o) => o.tagid == element["tagid"]
              );
              if (
                exists &&
                element.status &&
                element.status == AppConstant.STATUS.ACTIVE
              ) {
                removed += 1;
                this.tagsClone[index]["status"] = AppConstant.STATUS.INACTIVE;
              }
            }

            if (removed > 0) {
              this.message.info(`Auto removed ${removed} duplicate tags.`);
            }

            this.tagValueService.bulkupdate(this.tagsClone).subscribe(
              (result) => {
                let response = JSON.parse(result._body);
                if (response.status) {
                  this.getTags();
                  this.message.info(response.message);
                } else {
                  this.message.error(response.message);
                }
              },
              (err) => {
                this.message.error("Unable to remove tag. Try again",err);
              }
            );
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to get tag group. Try again");
        }
      );
  }
  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagPickerVisible = false;
      this.tagsClone = e.data;
      this.solutionLevelTags = this.tagService.prepareViewFormat(e.data);
    }
  }
}
