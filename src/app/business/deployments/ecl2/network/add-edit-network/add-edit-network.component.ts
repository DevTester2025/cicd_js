import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { Ecl2Service } from "../../ecl2-service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-network",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/network/add-edit-network/add-edit-network.component.html",
})
export class ECL2AddEditNetworkComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  // Standalone
  @Input() tagsOnly: boolean; // If true only tags can be added / edited.
  @Input() networkid: string;
  @Input() mode: string;
  @Input() assetData: any;
  @Input() neworkObj: any;
  @Output() notifyVpcEntry: EventEmitter<any> = new EventEmitter();
  gettingNetwork = false;
  neworkForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  ecl2tags: FormArray;
  planeList: any = [];
  selectedIndex = 0;
  addTenant: any = false;
  subnetForm = false;
  portForm = false;
  disabled = true;
  edit = false;
  zoneObj: any = {};
  netWorkList: any = {};
  subnetObj: any = {};
  portObj: any = {};
  shareObj: any = {};
  isSpinning = false;
  removeitem: any = {};
  loading = false;
  formDisabled = false;
  ecl2zoneList: any = [];
  customerList: any = [];
  neworkErrObj = {
    networkname: AppConstant.VALIDATIONS.ECL2.NETWORK.NETWORKNAME,
    plane: AppConstant.VALIDATIONS.ECL2.NETWORK.PLANE,
    adminstateup: AppConstant.VALIDATIONS.ECL2.NETWORK.ADMINSTATE,
    zoneid: AppConstant.VALIDATIONS.ECL2.NETWORK.ZONE,
    customerid: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
    description: AppConstant.VALIDATIONS.ECL2.NETWORK.DESCRIPTION,
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
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {
    this.getPlaneList();
    this.getZoneList();
    if (this.assetData) {
      this.addTenant = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.neworkObj) &&
      !_.isEmpty(changes.neworkObj.currentValue) &&
      !_.isUndefined(changes.neworkObj.currentValue.networkid)
    ) {
      console.log("NETWORK OBJECT:::::::::::;");
      this.neworkObj = changes.neworkObj.currentValue;
      this.getTagValues();
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.edit = true;
      this.generateEditForm(this.neworkObj);
      this.disabled = false;
      this.subnetForm = true;
      this.portForm = true;
      this.selectedIndex = 0;
    } else if (changes.networkid && changes.mode.currentValue == "standalone") {
      console.log("INSIDE ELSE IF:::::::::");
      this.gettingNetwork = true;
      this.getNetworkObject();
    } else {
      console.log("ELSE:::::::::::::::");
      this.clearForm();
      this.tagsClone = [];
      this.tagsList = [];
      this.tags = [];
      this.edit = false;
      this.disabled = true;
      this.selectedIndex = 0;
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  getNetworkObject() {
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2NETWORKGETBYID +
          this.networkid
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          this.neworkObj = response.data;
          this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
          this.edit = true;
          this.getTagValues();
          this.generateEditForm(this.neworkObj);
          this.disabled = false;
          this.subnetForm = true;
          this.portForm = true;
          this.selectedIndex = 0;
          this.gettingNetwork = false;
        } else {
        }
      });
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
  generateEditForm(data) {
    this.customerList.push(data.customer);
    this.ecl2zoneList.push(data.ecl2zones);
    this.neworkForm = this.fb.group({
      networkname: [
        data.networkname,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      plane: [data.plane, Validators.required],
      adminstateup: [data.adminstateup, Validators.required],
      zoneid: [data.ecl2zones, Validators.required],
      customerid: [data.customer, Validators.required],
      description: [!_.isEmpty(data.description) ? data.description : ""],
      status: [data.status === AppConstant.STATUS.ACTIVE ? true : false],
      ecl2tags: this.fb.array([this.createItem()]),
    });
    if (!_.isEmpty(data.ecl2tags)) {
      this.ecl2tags = this.neworkForm.get("ecl2tags") as FormArray;
      this.ecl2tags.removeAt(0);
      data.ecl2tags.forEach((element) => {
        if (element.resourcetype === "Network") {
          this.ecl2tags.push(this.createItem(element));
        }
      });
    }
  }
  clearForm() {
    this.neworkForm = this.fb.group({
      networkname: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      plane: [null, Validators.required],
      adminstateup: [null, Validators.required],
      zoneid: [null, Validators.required],
      customerid: [null, Validators.required],
      status: [AppConstant.STATUS.ACTIVE],
      description: [""],
      ecl2tags: this.fb.array([this.createItem()]),
    });
    this.neworkObj = {};
    this.selectedIndex = 0;
  }
  onZoneChange(event) {
    const customerCondition = {
      tenantid: this.userstoragedata.tenantid,
      ecl2region: event.region,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getCustomerList(customerCondition);
  }

  getCustomerList(condition) {
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

  getPlaneList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.NETWORKPLANE,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          this.planeList = response.data;
        } else {
          this.planeList = [];
        }
      });
  }
  createItem(value?) {
    if (!_.isEmpty(value)) {
      return this.fb.group({
        tagid: [value.tagid],
        tagkey: [!_.isEmpty(value) ? value.tagkey : null],
        tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
        resourceid: [
          !_.isEmpty(this.neworkObj) ? this.neworkObj.networkid : null,
        ],
        status: [!_.isEmpty(value) ? value.status : "Active"],
        resourcetype: ["Network"],
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      });
    } else {
      return this.fb.group({
        tagkey: [null],
        tagvalue: [null],
        resourceid: [
          !_.isEmpty(this.neworkObj) ? this.neworkObj.networkid : null,
        ],
        status: [!_.isEmpty(value) ? value.status : "Active"],
        resourcetype: ["Network"],
        tenantid: this.userstoragedata.tenantid,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      });
    }
  }
  addItem() {
    this.ecl2tags = this.neworkForm.get("ecl2tags") as FormArray;
    this.ecl2tags.push(this.createItem());
  }
  getFormArray(type): FormArray {
    return this.neworkForm.get(type) as FormArray;
  }
  removeItem(index) {
    this.ecl2tags = this.neworkForm.get("ecl2tags") as FormArray;
    let currentindex = this.ecl2tags.value.length;
    if (currentindex != 1) {
      let item = {} as any;
      item = this.ecl2tags.controls[index].value;
      item.status = "Inactive";
      this.removeitem = item;
      this.ecl2tags.removeAt(index);
    }
  }

  SelectedValue(key) {
    if (key === "Subnet") {
      this.subnetObj = !_.isEmpty(this.neworkObj)
        ? this.neworkObj
        : this.netWorkList;
    } else if (key === "Share") {
      this.shareObj = !_.isEmpty(this.neworkObj)
        ? this.neworkObj
        : this.netWorkList;
    } else {
      this.portObj = !_.isEmpty(this.neworkObj)
        ? this.neworkObj
        : this.netWorkList;
    }
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.formDisabled = true;
    let errorMessage: any;
    if (this.neworkForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.neworkForm,
        this.neworkErrObj
      );
      this.loading = false;
      this.formDisabled = false;
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      let formdata = {} as any;
      formdata = {
        networkname: data.networkname,
        tenantid: this.userstoragedata.tenantid,
        adminstateup: data.adminstateup === "UP" ? "Y" : "N",
        description: data.description == null ? "" : data.description,
        plane: data.plane,
        zoneid: data.zoneid.zoneid,
        customerid: data.customerid.customerid,
        ecl2tenantid: data.customerid.ecl2tenantid,
        region: data.zoneid.region,
        status:
          data.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };

      formdata.tags = {};
      if (!_.isEmpty(data.ecl2tags)) {
        let result = {};
        let tags = [] as any;
        for (let i = 0; i < data.ecl2tags.length; i++) {
          if (
            data.ecl2tags[i].tagkey != null &&
            data.ecl2tags[i].tagvalue != null
          ) {
            result[data.ecl2tags[i].tagkey] = data.ecl2tags[i].tagvalue;
            tags.push(data.ecl2tags[i]);
          }
        }
        formdata.tags = {
          ...result,
        };
        data.ecl2tags = tags;
        if (data.ecl2tags.length !== 0) {
          formdata.ecl2tags = !_.isEmpty(this.removeitem)
            ? [...data.ecl2tags, this.removeitem]
            : data.ecl2tags;
        }
      }
      if (
        !_.isUndefined(this.neworkObj) &&
        !_.isUndefined(this.neworkObj.networkid) &&
        !_.isEmpty(this.neworkObj)
      ) {
        formdata.networkid = this.neworkObj.networkid;
        formdata.ecl2networkid = this.neworkObj.ecl2networkid;
        this.ecl2Service.updateecl2network(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.formDisabled = false;
            this.messageService.success(response.message);
          } else {
            this.loading = false;
            this.formDisabled = false;
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
        formdata.createdby = this.userstoragedata.fullname;
        formdata.createddt = new Date();
        formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.createecl2network(formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            response.data.ecl2zones = data.zoneid;
            response.data.adminstateup = data.adminstateup;
            response.data.networkid = response.data.networkid;
            response.data.ecl2networkid = response.data.ecl2networkid;
            response.data.customer = data.customerid;
            this.netWorkList = response.data;
            this.neworkObj = response.data;
            this.getTagValues();
            this.disabled = false;
            this.loading = false;
            this.formDisabled = false;
            this.messageService.success(response.message);
          } else {
            this.loading = false;
            this.formDisabled = false;
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
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.neworkObj.networkid)
          ? this.neworkObj.networkid
          : Number(this.neworkObj.networkid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[4],
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
          } else {
            this.tagsClone = [];
            this.tags = [];
            this.tagsList = [];
            // this.message.error(response.message);
          }
        },
        (err) => {
          // this.message.error('Unable to get tag group. Try again');
        }
      );
  }

  updateTags() {
    let formdata = this.neworkForm.value as any;
    this.loading = true;
    formdata = {
      networkname: formdata.networkname,
      tenantid: this.userstoragedata.tenantid,
      adminstateup: formdata.adminstateup === "UP" ? "Y" : "N",
      description: formdata.description == null ? "" : formdata.description,
      plane: formdata.plane,
      zoneid: formdata.zoneid.zoneid,
      customerid: formdata.customerid.customerid,
      ecl2tenantid: formdata.customerid.ecl2tenantid,
      region: formdata.zoneid.region,
      status:
        formdata.status === false
          ? AppConstant.STATUS.INACTIVE
          : AppConstant.STATUS.ACTIVE,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };

    let tagsobj = {};

    this.tagsClone.forEach((o) => {
      tagsobj[o["tag"]["tagname"]] = o["tagvalue"];
    });

    formdata["tags"] = tagsobj;

    formdata.networkid = this.neworkObj.networkid;
    formdata.ecl2networkid = this.neworkObj.ecl2networkid;
    this.ecl2Service.updateecl2network(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.formDisabled = false;
        this.tagValueService.bulkupdate(this.tagsClone).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.loading = false;
              this.messageService.info(response.message);
            } else {
              this.loading = false;
              this.messageService.error(response.message);
            }
          },
          (err) => {
            this.loading = false;
            this.messageService.error("Unable to remove tag. Try again");
          }
        );
      } else {
        this.loading = false;
        this.formDisabled = false;
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
