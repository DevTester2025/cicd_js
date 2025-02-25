import { Component, OnInit, SimpleChanges, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SLATemplatesService } from "./slatemplates.service";
import * as _ from "lodash";
import downloadService from "../../../../modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-cloudmatiq-slatemplate",
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
    "../../../../presentation/web/tenant/servicemgmt/slatemplates/slatemplate.component.html",
})
export class SLATemplateComponent implements OnInit {
  screens = [];
  totalCount = null;
  appScreens = {} as any;
  loading = false;
  userstoragedata = {} as any;
  templateList = [];
  isSlaVisible = false;
  isVisible = false;
  tableHeader = [
    { field: "slaname", header: "SLA Name", datatype: "string", isdefault: true },
    { field: "notes", header: "Notes", datatype: "string", isdefault: true },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated Date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
  ] as any;
  tableConfig = {
    refresh: true, //#OP_B632
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    loading: false,
    columnselection:true,
    apisort: true,
    totemplate : false,
    pagination: false,
    pageSize: 10,
    tabledownload: false,
    scroll: { x: "1000px" },
    title: "",
    manualpagination: true,
    frontpagination: false,
    count: null,
    widthConfig: ["30px", "30px", "25px", "25px", "25px"],
  } as any;
  buttonText = "Save";
  slatemplateForm: FormGroup;
  create = false;
  slaObj = {} as any;
  selectedcolumns = [] as any;
  templateObj = {} as any;
  isdownload = false;
  searchText:string = '';
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private slaTemplateService: SLATemplatesService,
    private localStorageService: LocalStorageService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SLA_MGMT,
    } as any);
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "Edit")) {
        this.tableConfig.edit = true;
        this.tableConfig.totemplate = true;
      }
      if (_.includes(this.appScreens.actions, "Delete")) {
        this.tableConfig.delete = true;
      }
      if (_.includes(this.appScreens.actions, "Create")) {
        this.create = true;
      }
      if (this.tableHeader && this.tableHeader.length > 0) {
        this.selectedcolumns = this.tableHeader
      }
      if (_.includes(this.appScreens.actions, "Download")) {
        this.tableConfig.tabledownload = true;
      }
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
    this.clearForm();
    this.getAllList();
  }
  clearForm() {
    this.slatemplateForm = this.fb.group({
      slaname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [true],
    });
    this.slaObj = {};
  }
  dataChanged(event) {
    if (event.delete) {
      let formdata = {
        id: event.data.id,
        status: "Deleted",
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      };
      this.slaTemplateService.update(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success("Deleted Successfully");
          this.getAllList();
        } else {
          this.message.error(response.message);
        }
      });
    } else if (event.edit) {
      this.slaObj = event.data;
      this.slatemplateForm.patchValue(event.data);
      this.slatemplateForm.controls["status"].setValue(
        this.slaObj.status === "Active" ? true : false
      );
      this.isSlaVisible = true;
    } else if (event.totemplate) {
      this.isVisible = true;
      this.templateObj = event.data;
    }
    //#OP_B632
    if(event.refresh){
      this.getAllList();
    }
    if (event.download) {
      this.isdownload = true;
      this.getAllList();
    }
    if (event.searchText != "") {
      this.searchText = event.searchText;
      if (event.search) {
        this.getAllList();
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      this.getAllList();
    }
  }
  saveOrUpdate() {
    if (this.slatemplateForm.status == "INVALID") {
      this.message.error("Please enter sla name");
      return false;
    }
    let formdata = {
      slaname: this.slatemplateForm.value.slaname,
      notes: this.slatemplateForm.value.notes,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      tenantid: this.userstoragedata.tenantid,
      status:
        this.slatemplateForm.value.status == false ? "Inactive" : "Active",
    } as any;
    if (!_.isEmpty(this.slaObj) && this.slaObj.id != null) {
      formdata.id = this.slaObj.id;
      this.slaTemplateService.update(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.getAllList();
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      formdata.createddt = new Date();
      formdata.createdby = this.userstoragedata.fullname;
      this.slaTemplateService.create(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.getAllList();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  getAllList() {
    this.isSlaVisible = false;
    let condition = {} as any;
    condition = {
      tenantid: this.userstoragedata.tenantid,
    };
    let query;
    if (this.isdownload === true) {
      query = `?isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    }else{
      query =`?count=${true}`
    }
    if (this.searchText && this.searchText != null) {
      condition["searchText"] = this.searchText;
    }
    this.slaTemplateService.all(condition,query).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableConfig.manualpagination = true;
          this.tableConfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "SLA.xlsx"
          );
          this.isdownload = false;
        }
        else {
          this.templateList = response.data.rows;
          this.totalCount = response.data.count;
          this.tableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
        }
      } else {
        this.totalCount = 0;
        this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
        this.templateList = [];
      }
    });
  }
  showModal() {
    this.isSlaVisible = true;
  }
  closeDrawer() {
    this.isSlaVisible = false;
    this.slaObj = {};
    this.slatemplateForm.reset(); //#OP_B627
  }
  rightbarChanged(){
    this.isVisible = false;
    this.templateObj = {};
  }
  notifyNewEntry(event){
    this.isVisible = false;
    this.getAllList();
    this.templateObj = {};
  }
}
