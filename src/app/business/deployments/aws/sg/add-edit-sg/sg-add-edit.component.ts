import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AWSService } from "../../aws-service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
@Component({
  selector: "app-cloudmatiq-sg-add-edit",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/sg/add-edit-sg/sg-add-edit.component.html",
})
export class SgAddEditComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Output() notifySgEntry: EventEmitter<any> = new EventEmitter();
  @Input() vpcList: any;
  @Input() noEdit: boolean;
  @Input() sgObj: any;
  @Input() assetData: any;
  addTenant: any = false;
  rulesItems;

  sgForm: FormGroup;
  userstoragedata = {} as any;
  selectedIndex = 0;
  loading = false;
  sgErrObj = {
    securitygroupname: "",
    awssecuritygroupid: "",
  };
  buttonText = AppConstant.BUTTONLABELS.SAVE;

  // Tag Picker related
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  isSyncTags = false;
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
  sgRulesList = [
    { label: "All TCP", value: "tcp" },
    { label: "HTTP", value: "http" },
    { label: "HTTPS", value: "https" },
    { label: "RDP", value: "rdp" },
    { label: "MYSQL", value: "mysql" },
  ];
  protocolList = [
    { label: "TCP", value: "tcp" },
    { label: "HTTP", value: "http" },
    { label: "HTTPS", value: "https" },
    { label: "RDP", value: "rdp" },
    { label: "MYSQL", value: "mysql" },
  ];
  sgRulesArray = [];
  deletedsgRules = [];
  isSG = false;
  sgList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private httpHandlerService: HttpHandlerService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private httpHandler: HttpHandlerService,
    private localStorageService: LocalStorageService,
    private awsService: AWSService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (_.isUndefined(this.sgObj) || _.isEmpty(this.sgObj)) {
      this.clearForm();
    }
    if (this.assetData) {
      this.addTenant = true;
    }
  }
  clearForm() {
    this.sgForm = this.fb.group({
      securitygroupname: [null, Validators.required],
      awssecuritygroupid: [""],
      vpcid: [null, Validators.required],
      awssgrules: this.fb.array([this.ruleGroup()]),
      notes: [""],
      status: ["Active"],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.sgObj) &&
      !_.isEmpty(changes.sgObj.currentValue)
    ) {
      this.sgObj = changes.sgObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.getSgList();
      this.getTagValues();
      this.clearForm();
      this.editForm();
      this.getVpcList();
      // this.sgForm.patchValue(this.sgObj);
      this.getSgRules();
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  getSgList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawssg(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.sgList = response.data;
        } else {
          this.sgList = response.data;
        }
      },
      (err) => { }
    );
  }
  onSourceTypeChange(event) {
    this.rulesItems = this.sgForm.get("awssgrules") as FormArray;
    this.rulesItems.controls["source"].setValue("");
  }
  editForm() {
    this.sgForm = this.fb.group({
      securitygroupname: [this.sgObj.securitygroupname, Validators.required],
      awssecuritygroupid: [this.sgObj.awssecuritygroupid],
      vpcid: [this.sgObj.vpcid, Validators.required],
      awssgrules: this.fb.array([]),
      notes: [this.sgObj.notes],
      status: [this.sgObj.status],
    });
  }
  ruleGroup(): FormGroup {
    return this.fb.group({
      type: ["tcp"],
      protocol: ["tcp"],
      portrange: [80],
      source: ["0.0.0.0/0"],
      sourcetype: [true],
      createdby: [this.userstoragedata.fullname],
      createddt: [new Date()],
    });
  }
  getFormArray(type): FormArray {
    return this.sgForm.get(type) as FormArray;
  }
  addRule() {
    this.rulesItems = this.sgForm.get("awssgrules") as FormArray;
    this.rulesItems.push(this.ruleGroup());
  }

  deleteRule(index) {
    let controls = <FormArray>this.sgForm.controls["awssgrules"];
    this.rulesItems = this.sgForm.get("awssgrules") as FormArray;
    this.rulesItems.value[index].status = "Inactive";
    this.deletedsgRules.push(this.rulesItems.value[index]);
  }
  saveUpdateSg(data) {
    let errorMessage: any;
    if (this.sgForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.sgForm,
        this.sgErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    _.map(data.awssgrules, function (item) {
      item.protocol = "tcp";
      item.sourcetype = item.sourcetype ? "IP" : "SG";
    });
    if (this.deletedsgRules.length > 0) {
      data.awssgrules = data.awssgrules.concat(this.deletedsgRules);
    }
    if (
      !_.isEmpty(this.sgObj) &&
      this.sgObj.securitygroupid != null &&
      this.sgObj.securitygroupid != undefined
    ) {
      data.securitygroupid = this.sgObj.securitygroupid;
      _.map(data.awssgrules, function (item) {
        item.securitygroupid = data.securitygroupid;
      });
      this.awsService.updateawssg(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.notifySgEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add sg group. Try again");
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.awsService.createawssg(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.notifySgEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add sg. Try again");
        }
      );
    }
  }
  getSgRules() {
    let response = {} as any;
    let data = {
      securitygroupid: this.sgObj.securitygroupid,
      status: "Active",
    };
    this.awsService.allawssgrules(data).subscribe(
      (result) => {
        response = JSON.parse(result._body);
        if (response.status) {
          this.sgRulesArray = response.data;
          this.rulesItems = this.sgForm.get("awssgrules") as FormArray;
          for (let i = 0; i < response.data.length; i++) {
            let item = response.data[i];
            let sg =
              item.sourcetype == "SG"
                ? _.find(this.sgList, { awssecuritygroupid: item.source })
                : null;
            this.rulesItems.push(
              this.fb.group({
                sgrulesid: [item.sgrulesid],
                type: [item.type],
                protocol: [item.protocol],
                portrange: [item.portrange],
                source: [sg != null ? sg.awssecuritygroupid : item.source],
                sourcetype: [item.sourcetype == "IP" ? true : false],
              })
            );
          }
        } else {
        }
      },
      (err) => {
        this.messageService.error("Unable to add sg. Try again");
      }
    );
  }

  // Tag related code
  getTagValues() {
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.sgObj.securitygroupid)
          ? this.sgObj.securitygroupid
          : Number(this.sgObj.securitygroupid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[11],
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
            this.isSyncTags = this.commonService.checkTagValidity(this.tags[0]);
            this.tagsClone = response.data;
            console.log(this.tagsList);
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
  syncAssetTags() {
    this.tagTableConfig.loading = true;
    let data = {
      "refid": this.sgObj.awssecuritygroupid,
      "tnregionid": this.sgObj.tnregionid,
      "tenantid": this.sgObj.tenantid,
      "region": this.sgObj.tenantregion[0].region,
      "username": this.userstoragedata.fullname,
      "id": this.sgObj.securitygroupid,
      "presourcetype": AppConstant.TAGS.TAG_RESOURCETYPES[11]
    };
    this.httpHandler
      .POST(
        AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.OTHER.AWSTAGUPDATE,
        data
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.tagsList = this.tagService.prepareViewFormat(response.data);
          this.tags = this.tagService.decodeTagValues(
            response.data,
            "picker"
          );
          this.tagsClone = response.data;
          this.isSyncTags = false;
          this.tagTableConfig.loading = false;
        }
      });
  }

  updateTags() {
    this.tagsClone.forEach((tags) => {
      tags.tagname = tags.tag.tagname;
    });
    let data = {
      assets: [
        {
          id: this.sgObj.securitygroupid,
          refid: this.sgObj.awssecuritygroupid,
          tnregionid: this.sgObj.tnregionid,
          region: this.sgObj.tenantregion[0].region,
        },
      ],
      tagvalues: this.tagsClone,
      tenantid: this.userstoragedata.tenantid,
      cloudprovider: "AWS",
      resourcetype: "ASSET_SECURITYGROUP",
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      region: "",
    };

    this.httpHandlerService
      .POST(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.AWSASSETMETAUPDATE,
        data
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.messageService.info("Tags synced to cloud.");
        } else {
          this.messageService.info(response.message);
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

  getVpcList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsvpc(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.vpcList = response.data;
        } else {
          this.vpcList = [];
        } 
      },
    );
  }
}
