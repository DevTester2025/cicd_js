import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetRecordService } from "../assetrecords/assetrecords.service";
import { IResourceType } from "src/app/modules/interfaces/assetrecord.interface";
import { TagService } from "../tagmanager/tags.service";
import { AssetAttributesConstant } from "../assetrecords/attributes.contant";
@Component({
  selector: "app-addedit-recordtype",
  templateUrl:
    "../../../presentation/web/base/recordtypes/addedit-recordtype.component.html",
})
export class AddEditRecordTypeComponent implements OnInit, OnChanges {
  @Input() resourceObj: any;
  @Input() resourceId: any;
  @Input() selectedRefId:any=null;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  loading = false;
  usersList: any = [];
  isVisible = false;
  formdata: any = {};
  resourceForm: FormGroup;
  addingparam: Boolean = false;
  rightbar = true;
  isVisibleTop = false;
  show = false;
  updateParam: any = {
    status: false,
    title: "",
  };
  mode = "multiple";
  updateParamValue;
  updatingparam: Boolean = false;
  button: any;
  userstoragedata: any = {};
  isEdit = false;
  screens = [];
  createFlag = false;
  appScreens = {} as any;
  attributeList = [];
  resourceFormErrorObj = {
    resourcetype: {
      required: "Please select resource type",
    },
    fieldname: {
      required: "Please enter attribute name",
    },
    fieldtype: {
      required: "Please select attribute type",
    },
  };
  fieldtypes = [
    {
      label: "Text",
      value: "Text",
    },
    {
      label: "Date & Time",
      value: "DateTime",
    },
    {
      label: "Date",
      value: "Date",
    },
    {
      label: "Select",
      value: "Select",
    },
    {
      label: "Textarea",
      value: "Textarea",
    },
    {
      label: "Float",
      value: "Float",
    },
    {
      label: "Integer",
      value: "Integer",
    },
    {
      label: "Boolean",
      value: "Boolean",
    },
    {
      label: "URL",
      value: "URL",
    },
    {
      label: "Reference CMDB",
      value: "REFERENCE",
    },
    {
      label: "Reference Asset",
      value: "Reference Asset",
    },
    {
      label: "Reference Tag",
      value: "Reference Tag",
    },
    {
      label: "Password",
      value: "Password",
    },
    {
      label: "Auto Generate",
      value: "AUTOGEN",
    },
    {
      label: "Document",
      value: "DOCUMENT",
    },
  ];
  resourceTypesList: IResourceType[] = [];
  fieldValuesList = [];
  tagList = [];
  assetList = [];
  constructor(
    private tagService: TagService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private assetRecordService: AssetRecordService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.clearForm();
    this.getAllTags();
    this.getAllAssets();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.resourceObj) &&
      !_.isEmpty(changes.resourceObj.currentValue)
    ) {
      this.resourceObj = changes.resourceObj.currentValue;
      this.isEdit = true;
      this.button = AppConstant.BUTTONLABELS.UPDATE;
      this.resourceForm.controls["status"].setValue(
        this.resourceObj.status === "Active" ? true : false
      );
      this.resourceForm.controls["isdefaultval"].setValue(
        this.resourceObj.showbydefault === 1 ? true : false
      );
      if (this.resourceObj.fieldtype == "Select") {
        this.resourceObj.defaultval = this.resourceObj.defaultval.split(",");
      }
      this.resourceForm.controls["protected"].setValue(
        this.resourceObj.protected === 1 ? true : false
      );
      this.resourceForm.controls["readonly"].setValue(
        this.resourceObj.readonly === 1 ? true : false
      );
      if (this.resourceObj.fieldtype == "REFERENCE") {
        this.getFieldValues(this.resourceObj.relation);
      }
      if (this.resourceObj.fieldtype == "Reference Tag") {
        this.resourceObj.referencetag = JSON.parse(
          this.resourceObj.referencetag
        );
      }
      this.resourceObj.resourcetype = this.resourceObj.crn;
      this.resourceForm.patchValue(this.resourceObj);
      if (this.resourceObj.fieldtype == "Reference Asset") {
        let obj: any = JSON.parse(this.resourceObj.referenceasset);
        this.resourceForm.controls["referenceasset"].setValue(obj.asset);
        this.resourceForm.controls["referenceassetattr"].setValue(
          obj.attribute
        );
        this.setAttribute(obj.asset, true);
      }
    } else {
      this.clearForm();
      this.button = AppConstant.BUTTONLABELS.SAVE;
    }
    this.getResourceType();
  }
  clearForm() {
    this.resourceForm = this.fb.group({
      tenantid: [this.userstoragedata.tenantid, Validators.required],
      resourcetype: [this.resourceId, Validators.required],
      fieldtype: [null, Validators.required],
      fieldname: ["", Validators.required],
      isdefaultval: [false],
      defaultval: [null],
      prefix: [null],
      curseq: [null],
      identifier: [false],
      protected: [false],
      readonly: [false],
      relation: [null],
      status: ["Active"],
      referenceasset: [null],
      referencetag: [null],
      referenceassetattr: [null],
    });
    this.isEdit = false;
    this.resourceObj = {};
  }
  assetGrps = [] as any;
  getAssetTypes() {
    let condition = {} as any;
    condition = {
      keylist: [AppConstant.LOOKUPKEY.VM_ASSET_TYPES],
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        let assetTypes = response.data.filter((el) => {
          return el.lookupkey == AppConstant.LOOKUPKEY.VM_ASSET_TYPES;
        });
        assetTypes.forEach((element) => {
          this.assetGrps[1].value.push({
            title: element.keyname,
            value: "Sentia-" + element.keyvalue,
            attributeList: AssetAttributesConstant.COLUMNS[element.keyvalue],
          });
          this.assetGrps[2].value.push({
            title: element.keyname,
            value: "Equinix-" + element.keyvalue,
            attributeList: AssetAttributesConstant.COLUMNS[element.keyvalue],
          });
        });
      }
    });
  }
  getAllAssets() {
    this.assetGrps = [
      {
        provider: "AWS",
        value: [],
      },
      {
        provider: "Sentia",
        value: [],
      },
      {
        provider: "Equinix",
        value: [],
      },
    ];
    AppConstant.ASSETTYPES.AWS.forEach((element) => {
      this.assetGrps[0].value.push({
        title: element.title,
        value: "AWS-" + element.value,
        attributeList: AssetAttributesConstant.COLUMNS[element.value],
      });
    });
    this.getAssetTypes();
  }
  setAttribute(event, edit?) {
    this.attributeList = [];
    if (!edit) {
      this.resourceForm.controls["referenceassetattr"].setValue(null);
    }
    if (_.includes(event, "-") && !_.includes(event, "asset")) {
      let obj = event.split("-");
      let provider: any = _.find(this.assetGrps, { provider: obj[0] });
      let data: any = _.find(provider.value, (itm: any) => {
        if (itm.value == event) {
          return itm;
        }
      });
      // this.attributeList.push({
      //   field: "All",
      //   header: "All",
      //   datatype: "string",
      //   linkid: data.attributeList[0].linkid,
      // });
      this.attributeList = [...this.attributeList, ...data.attributeList];
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
  getResourceType() {
    this.resourceTypesList = [];
    this.assetRecordService
      .getResourceTypes(
       {
        tenantid:  this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
        ]
       }
      )
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesList = _.orderBy(response, ["resource"], ["asc"]);
      });
  }
  getFieldValues(crn) {
    this.assetRecordService
      .all({
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
        crn: crn,
      })
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        this.fieldValuesList = _.orderBy(response.data, ["fieldname"], ["asc"]);
      });
  }
  onChangeFieldType(event) {
    if (event == "Reference Asset") {
      this.resourceForm.get("fieldname").clearValidators();
      this.resourceForm.get("fieldname").updateValueAndValidity();
    } else {
      this.resourceForm.get("fieldname").setValidators([Validators.required]);
      this.resourceForm.get("fieldname").updateValueAndValidity();
    }
  }
  saveOrUpdate(data) {
    let errorMessage: any;
    if (this.resourceForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.resourceForm,
        this.resourceFormErrorObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else if (data.fieldtype == "AUTOGEN" && !parseInt(data.curseq)) {
      this.message.error("Please enter valid sequence number");
      return false;
    } else if (
      !_.isEmpty(this.resourceObj) &&
      this.resourceObj.curseq &&
      this.resourceObj.curseq != "" &&
      parseInt(data.curseq) < parseInt(this.resourceObj.curseq)
    ) {
      this.message.error("Please enter higher sequence number");
      return false;
    } else if (
      data.fieldtype == "Reference Asset" &&
      (data.referenceasset == null || data.referenceasset == "")
    ) {
      this.message.error("Please select Reference Asset");
      return false;
    } else if (
      data.fieldtype == "Reference Asset" &&
      (data.referenceassetattr == null || data.referenceassetattr == "")
    ) {
      this.message.error("Please select Reference Asset Attribute");
      return false;
    } else {
      this.loading = true;
      this.formdata = {
        tenantid: data.tenantid,
        crn: data.resourcetype,
        resourcetype: _.find(this.resourceTypesList, { crn: data.resourcetype })
          .resource,
        fieldname: data.fieldname,
        prefix: data.prefix ? data.prefix : "",
        curseq: data.curseq ? data.curseq : "",
        fieldtype: data.fieldtype,
        fieldkey:
          data.resourcetype +
          "/fk:" +
          data.fieldname.toLowerCase().replace(/[^A-Z0-9]+/gi, "_"),
        status:
          data.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
        showbydefault: data.isdefaultval === true ? 1 : 0,
        identifier: data.identifier === true ? 1 : 0,
        protected: data.protected == true ? 1 : 0,
        readonly: data.readonly == true ? 1 : 0,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        parentcrn:this.selectedRefId
      };
      if (data.fieldtype == "Select") {
        this.formdata.defaultval = data.defaultval;
      }
      if (this.formdata.fieldtype == "Select") {
        if (data.defaultval != null && data.defaultval.length > 0) {
          this.formdata.defaultval = data.defaultval.join(", ");
        } else {
          this.message.error("Default value required");
          return;
        }
      }
      if (data.fieldtype == "REFERENCE") {
        this.formdata.relation = data.relation;
      }
      if (data.fieldtype == "Reference Tag") {
        this.formdata.referencetag = JSON.stringify(data.referencetag);
      }
      if (data.fieldtype == "Reference Asset") {
        let attributes = [];
        if (_.includes(data.referenceasset, "-")) {
          let obj = data.referenceasset.split("-");
          let provider: any = _.find(this.assetGrps, { provider: obj[0] });
          let odata: any = _.find(provider.value, (itm: any) => {
            if (itm.value == data.referenceasset) {
              return itm;
            }
          });
          if (data.referenceassetattr.length > 0) {
            let fobj = {
              asset: data.referenceasset,
              assettype: obj[1],
              provider: obj[0],
              assetname: odata.title,
              attribute: data.referenceassetattr,
            } as any;
            this.formdata.referenceasset = JSON.stringify(fobj);
          } else {
            this.message.error("Please select Reference Asset Attribute");
            return false;
          }
        }
      }
      if (
        !_.isUndefined(this.resourceObj) &&
        !_.isUndefined(this.resourceObj.id) &&
        !_.isEmpty(this.resourceObj)
      ) {
        this.formdata.id = this.resourceObj.id;
        this.assetRecordService.update(this.formdata).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.updatingparam = false;
          this.loading = false;
          if (response.status) {
            this.message.success(response.message);
            this.updateParam.status = false;
            this.notifyNewEntry.next(response.data);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.createddt = new Date();
        this.assetRecordService.create(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            this.loading = false;
            if (response.status) {
              this.message.success(response.message);
              this.notifyNewEntry.next(response.data);
            } else {
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add. Try again");
          }
        );
      }
    }
  }
}
