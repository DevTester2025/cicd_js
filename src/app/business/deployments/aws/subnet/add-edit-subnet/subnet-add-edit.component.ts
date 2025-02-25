import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { AWSService } from "../../aws-service";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";

@Component({
  selector: "app-cloudmatiq-subnet-add-edit",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/subnet/add-edit-subnet/subnet-add-edit.component.html",
})
export class SubnetAddEditComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() vpcList: any;
  @Input() noEdit: boolean;
  @Input() subnetObj: any;
  @Output() notifySubnetEntry: EventEmitter<any> = new EventEmitter();
  @Input() assetData: any;
  addTenant: any = false;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  zoneList: any[] = [];
  selectedIndex = 0;
  loading = false;
  subnetErrObj = {
    subnetname: AppConstant.VALIDATIONS.AWS.AWSSUBNET.SUBNETNAME,
    zoneid: AppConstant.VALIDATIONS.AWS.AWSSUBNET.ZONE,
    ipv4cidr: AppConstant.VALIDATIONS.AWS.AWSSUBNET.CIDR,
    notes: AppConstant.VALIDATIONS.AWS.AWSSUBNET.NOTES,
  };
  subnetForm: FormGroup;

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
  isSyncTags = false;
  tags = [];
  tagsClone = [];
  tagsList = [];

  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private httpHandlerService: HttpHandlerService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private httpHandler: HttpHandlerService,
    private awsService: AWSService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (_.isUndefined(this.subnetObj) || _.isEmpty(this.subnetObj)) {
      this.clearForm();
    }
    this.getAllZones();
    if (this.assetData) {
      this.addTenant = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.subnetObj) &&
      !_.isEmpty(changes.subnetObj.currentValue)
    ) {
      this.subnetObj = changes.subnetObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.getTagValues();
      this.generateEditForm(this.subnetObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  getAllZones() {
    this.awsService
      .allawszone({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.zoneList = response.data;
        }
      });
  }
  clearForm() {
    this.subnetForm = this.fb.group({
      subnetname: [null, Validators.required],
      vpcid: [null, Validators.required],
      zoneid: [null, Validators.required],
      ipv4cidr: [
        null,
        [
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ],
      ],
      awssubnetd: [""],
      notes: [""],
      status: ["Active"],
    });
    this.subnetObj = {};
  }

  saveUpdateSubnet(data) {
    let errorMessage: any;
    if (this.subnetForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.subnetForm,
        this.subnetErrObj
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (
      !_.isEmpty(this.subnetObj) &&
      this.subnetObj.subnetid != null &&
      this.subnetObj.subnetid != undefined
    ) {
      data.subnetid = this.subnetObj.subnetid;
      this.awsService.updateawssubnet(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.notifySubnetEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add subnet group. Try again");
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.awsService.createawssubnet(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.notifySubnetEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add subnet group. Try again");
        }
      );
    }
  }
  generateEditForm(data) {
    this.subnetForm = this.fb.group({
      subnetname: [data.subnetname, Validators.required],
      vpcid: [data.vpcid, Validators.required],
      zoneid: [data.zoneid, Validators.required],
      ipv4cidr: [
        data.ipv4cidr,
        [
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ],
      ],
      awssubnetd: [data.awssubnetd],
      notes: [data.notes],
      status: [data.status],
    });
  }

  // Tag related code
  getTagValues() {
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.subnetObj.subnetid)
          ? this.subnetObj.subnetid
          : Number(this.subnetObj.subnetid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[10],
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
      "refid": this.subnetObj.awssecuritygroupid,
      "tnregionid": this.subnetObj.tnregionid,
      "tenantid": this.subnetObj.tenantid,
      "region": this.subnetObj.tenantregion[0].region,
      "username": this.userstoragedata.fullname,
      "id": this.subnetObj.securitygroupid,
      "presourcetype": AppConstant.TAGS.TAG_RESOURCETYPES[10]
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
          id: this.subnetObj.subnetid,
          refid: this.subnetObj.awssubnetd,
          tnregionid: this.subnetObj.tnregionid,
          region: this.subnetObj.tenantregion[0].region,
        },
      ],
      tagvalues: this.tagsClone,
      tenantid: this.userstoragedata.tenantid,
      cloudprovider: "AWS",
      resourcetype: "ASSET_SUBNET",
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
}
