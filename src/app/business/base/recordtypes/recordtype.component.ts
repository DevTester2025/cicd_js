import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { IResourceType } from "src/app/modules/interfaces/assetrecord.interface";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetRecordService } from "../assetrecords/assetrecords.service";

@Component({
  selector: "app-cloudmatiq-recordtype",
  templateUrl:
    "../../../presentation/web/base/recordtypes/recordtypes.component.html",
})
export class AssetRecordTypeComponent implements OnInit {
  assetList = [];
  isVisible = false;
  selectedAsset = {} as any;
  tableHeader = [
    { field: "ordernumber", header: "Order", datatype: "string", isdefault: true },
    { field: "fieldname", header: "Attribute Name", datatype: "string", isdefault: true },
    { field: "fieldtype", header: "Attribute Type", datatype: "string", isdefault: true },
    { field: "isdefault", header: "Show Default", datatype: "string", isdefault: true },
    { field: "createdby", header: "Created by", datatype: "string", isdefault: true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy HH:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];
  tableConfig = {
    refresh: true,  //#OP_B628
    edit: true,
    delete: true,
    view: false,
    manualsearch: true,
    globalsearch: true,
    pagination: true,
    columnselection: true,
    apisort: true,
    loading: false,
    pageSize: 10,
    title: "",
    selection: false,
    rowselection: false,
    reorder: true,
    widthConfig: ["35px", "25px", "25px", "25px", "25px", "25px", "25px"],
  };
  screens = [];
  appScreens = {} as any;
  filterForm: FormGroup;
  resourceForm: FormGroup;
  addEditVisible = false;
  resourceTypesList: any[] = [];
  resourceModuleList = AppConstant.RESOURCETYPE_MODULE;
  formTitle = "";
  selectedcolumns = [] as any;
  addingparam = false;
  button = "";
  userstoragedata = {} as any;
  selectedId;
  selectedResource;
  selectedRefId;
  loading = true;
  selectedRows = [];
  add = false;
  edit = false;
  delete = false;
  download = false;
  visibleadd = false;//#OP_T620
  visibleedit = false;//#OP_T620
  visibledelete = false;//#OP_T620
  recordTypeObj = {
    resourcetype: "Please enter resource type",
  } as any;
  externalRefList = [];
  totalCount = null;
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private commonService: CommonService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.formTitle = "Add Record Attributes";

    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.RECORD_TYPE,
    } as any);
    if (this.appScreens) {
      this.add = this.appScreens.actions.includes("Create");
      this.edit = this.appScreens.actions.includes("Edit");
      //#OP_T620
      this.tableConfig.edit = this.appScreens.actions.includes("Edit");
      this.visibleedit = this.appScreens.actions.includes("Edit");
      this.visibleadd = this.appScreens.actions.includes("Create");
      this.tableConfig.delete = this.appScreens.actions.includes("Delete");
      this.visibledelete = this.appScreens.actions.includes("Delete");
      this.download = this.appScreens.actions.includes("Download");
    }
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }
  ngOnInit() {
    this.filterForm = this.fb.group({
      resourcetype: [null],
      parentcrn: [""]
    });
    this.getResourceType();
    this.clearForm();
    this.getAllExternalRefs();
  }
  clearForm() {
    this.resourceForm = this.fb.group({
      tenantid: [this.userstoragedata.tenantid, Validators.required],
      resourcetype: [null, Validators.required],
      parentcrn: [""],
      module: [AppConstant.RESOURCETYPE_MODULE[0], Validators.required],
      status: [""],
    });
  }
  getResourceType() {
    this.loading = true;
    this.assetRecordService
      .getResourceTypes({
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
      })
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesList = _.orderBy(response, ["resource"], ["asc"]);
        this.loading = false;
      });
  }
  getAllExternalRefs() {
    this.externalRefList = [
      {
        "ref_id": 2,
        "Name": "Workpack Model",
        "parent_id": 0,
        "key": "wp",
        "status": "Active",
        "createdby": "Kumar",
        "createddt": "2022-11-29T02:59:37.000Z",
        "updatedby": "Kumar",
        "updateddt": "2022-11-29T02:59:37.000Z"
      }
    ];
  }
  getAssetHdr(searchkey?, selecteddata?: any) {
    this.tableConfig.loading = true;
    this.selectedId = this.filterForm.value.resourcetype;
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
    };
    let filters = this.filterForm.value;
    if (filters.resourcetype != "" && filters.resourcetype != null) {
      reqObj["crn"] = filters.resourcetype;
      let query = "";
      if (searchkey != "" && searchkey != undefined && searchkey != null) {
        query = "searchtext=" + searchkey;
      }
      if (selecteddata) {
        this.selectedRefId = null;
        this.selectedResource = _.find(this.resourceTypesList, (r: any) => {
          return r.crn == selecteddata
        })
        if (this.selectedResource) {
          this.selectedRefId = this.selectedResource.parentcrn;
        }
      }
      this.assetRecordService.all(reqObj, query).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.assetList = _.map(response.data, (item) => {
            item.isdefault = item.showbydefault == 1 ? "Yes" : "No";
            if (item.fieldtype == "AUTOGEN") item.delete = true;
            item.old_ordernumber = item.ordernumber;
            return item;
          });
          this.assetList = _.orderBy(this.assetList, ['ordernumber']);
          this.totalCount = this.assetList.length;
        } else {
          this.totalCount = 0;
          this.assetList = [];
        }
        this.tableConfig.loading = false;
      });
    } else {
      this.assetList = [];
      this.tableConfig.loading = false;
    }
  }

  dataChanged(event) {
    if (event.searchText != undefined && event.searchText != null) {
      this.getAssetHdr(event.searchText);
    }
    if (event.delete) {
      let reqObj = {
        id: event["data"]["id"],
        status: "Deleted",
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      };
      this.assetRecordService.update(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.getAssetHdr();
        } else {
          this.message.error("Failed to delete the record, try again later");
        }
      });
    } else if (event.edit) {
      this.formTitle = "Update Record Attributes";
      this.selectedAsset = event.data;
      this.addEditVisible = true;
    }
    if (event.rowselection) {
      this.selectedRows = event.data.filter((o) => o["checked"] == true);
    }
    if (event.reorder) {
      console.log(event.reorder, event.mode);
      let reqObj = {
        assetheaders: []
      };
      reqObj.assetheaders.push({
        crn: event.reorder.crn,
        tenantid: event.reorder.tenantid,
        id: event.reorder.id,
        ordernumber: event.reorder.ordernumber
      });
      let destinateData = _.find(this.assetList, (r) => {
        return (r.ordernumber == event.reorder.ordernumber && r.old_ordernumber == event.reorder.ordernumber)
      })
      if (destinateData) {
        reqObj.assetheaders.push({
          crn: destinateData.crn,
          tenantid: destinateData.tenantid,
          id: destinateData.id,
          ordernumber: event.reorder.old_ordernumber
        });
      }
      this.assetRecordService.updateBulk(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.getAssetHdr();
        } else {
          this.message.error("Failed to delete the record, try again later");
        }
      });;
    }
    //#OP_B628
    if (event.refresh) {
      this.getAssetHdr();
    }
  }
  closeDrawer() {
    this.addEditVisible = false;
    this.isVisible = false;
  }
  showAddEditForm() {
    this.formTitle = "Add Record Attributes";
    this.selectedAsset = {};
    this.addEditVisible = true;
  }
  notifyNewEntry(event) {
    this.addEditVisible = false;
    this.formTitle = "Add Record Attributes";
    this.getAssetHdr();
  }
  showrecordData() {
    this.isVisible = true;
    if (this.filterForm.value.resourcetype != null) {
      this.formTitle = "Update Record Type";
      this.button = "Update";
      this.assetRecordService
        .all({
          tenantid: this.localStorageService.getItem(
            AppConstant.LOCALSTORAGE.USER
          )["tenantid"],
          crn: this.selectedId,
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          this.resourceForm.controls["resourcetype"].setValue(
            response.data[0].resourcetype
          );
          this.resourceForm.controls["parentcrn"].setValue(
            response.data[0].parentcrn
          );
          this.resourceForm.controls["module"].setValue(
            response.data[0].module
          );
          this.resourceForm.controls["status"].setValue(
            response.data[0].status === "Active" ? true : false
          );
          this.recordTypeObj = response.data[0];
        });
    } else {
      this.formTitle = "Add Record Type";
      this.clearForm();
      this.button = "Save";
    }
  }
  recorddataChanged(event) {
    if (event.edit) {
      this.formTitle = "Update Record Type";
      this.selectedAsset = event.data;
      this.isVisible = true;
      this.button = "Update";
    }
  }
  resourceFormErrorObj = {};
  saveOrUpdate(data) {
    let errorMessage: any;
    let formdata = {} as any;
    if (this.resourceForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.resourceForm,
        this.resourceFormErrorObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      formdata = {
        tenantid: data.tenantid,
        crn:
          "crn:ops:" +
          data.resourcetype.toLowerCase().replace(/[^A-Z0-9]+/gi, "_"),
        resourcetype: data.resourcetype,
        parentcrn: data.parentcrn,
        module: data.module,
        status:
          data.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        isrecordtype: true,
      };
      if (
        !_.isUndefined(this.recordTypeObj) &&
        !_.isUndefined(this.recordTypeObj.id) &&
        !_.isEmpty(this.recordTypeObj)
      ) {
        formdata.oldcrn = _.clone(this.recordTypeObj.crn);
        formdata.crn =
          "crn:ops:" +
          data.resourcetype.toLowerCase().replace(/[^A-Z0-9]+/gi, "_");
        if (
          ((formdata.crn! = this.recordTypeObj.crn) &&
            this.recordTypeObj.resourcetype != formdata.resourcetype)
          || (formdata.parentcrn != this.recordTypeObj.parentcrn)
          || (formdata.module != this.recordTypeObj.module)
        )
          this.assetRecordService.update(formdata).subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.message.success(response.message);
              this.isVisible = false;
              // this.filterForm.controls["resourcetype"].setValue(null);
              this.getResourceType();
            } else {
              this.message.error(response.message);
            }
          });
      } else {
        formdata.status = AppConstant.STATUS.ACTIVE;
        formdata.createdby = this.userstoragedata.fullname;
        formdata.createddt = new Date();
        formdata.identifier = 0;
        formdata.fieldname = "Key";
        formdata.fieldkey = formdata.crn + "/fk:key";
        formdata.fieldtype = "AUTOGEN";
        formdata.showbydefault = 1;
        formdata.isrecordtype = true;
        formdata.prefix = formdata.fieldname;
        formdata.curseq = "1";
        formdata.ordernumber = 1;
        formdata.defaultattributes = [
          {
            createdby: this.userstoragedata.fullname,
            createddt: new Date(),
            identifier: 1,
            fieldname: "Name",
            fieldkey: formdata.crn + "/fk:name",
            fieldtype: "Text",
            showbydefault: 1,
            status: AppConstant.STATUS.ACTIVE,
            tenantid: formdata.tenantid,
            crn: formdata.crn,
            resourcetype: formdata.resourcetype,
            parentcrn: data.parentcrn,
            ordernumber: 2,
            operationtype: "cmdb"
          },
        ];
        if (formdata.module == "workpack") {
          // this.addworkPackDefaultAttr(formdata,data);
        }
        this.assetRecordService.create(formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.message.success(response.message);
              this.isVisible = false;
              this.filterForm.controls["resourcetype"].setValue(null);
              this.getResourceType();
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
  addworkPackDefaultAttr(formdata, data) {
    let ordernumber = 2;
    _.each(AppConstant.WORKPACK_DEFAULT_ATTR, (rtype: any) => {
      ordernumber = ordernumber + 1;
      rtype.createdby = this.userstoragedata.fullname;
      rtype.fieldkey = formdata.crn + rtype.fieldkey;
      rtype.createddt = new Date();
      rtype.tenantid = formdata.tenantid;
      rtype.crn = formdata.crn;
      rtype.resourcetype = formdata.resourcetype;
      rtype.parentcrn = data.parentcrn;
      rtype.ordernumber = ordernumber;
      formdata.defaultattributes.push(rtype);
    });
  }
  deleteRecordType() {
    let formdata = {};
    let data = this.filterForm.value;
    formdata = {
      tenantid: this.userstoragedata.tenantid,
      crn: data.resourcetype,
      status: "Deleted",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.assetRecordService.update(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.filterForm.controls["resourcetype"].setValue(null);
        this.message.success("Deleted Successfully");
        this.getResourceType();
      } else {
        this.message.error(response.message);
      }
    });
  }

  bulkDelete() {
    let selectedids = [];
    _.map(this.selectedRows, (itm) => {
      selectedids.push(itm.id);
    });
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      ids: { $in: selectedids },
      status: "Deleted",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    if (selectedids.length > 0) {
      this.assetRecordService.update(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success("Deleted Successfully");
          this.getAssetHdr();
          this.selectedRows = [];
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      this.message.error("Please select any one attribute");
    }
  }
}
