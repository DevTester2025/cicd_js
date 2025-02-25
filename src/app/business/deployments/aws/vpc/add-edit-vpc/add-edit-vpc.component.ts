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
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { AWSService } from "../../aws-service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
@Component({
  selector: "app-cloudmatiq-vpc-add-edit",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/vpc/add-edit-vpc/add-edit-vpc.component.html",
})
export class VpcAddEditComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() vpcObj: any;
  @Input() noEdit: boolean;
  @Output() notifyVpcEntry: EventEmitter<any> = new EventEmitter();
  @Input() assetData: any;
  addTenant: any = false;
  vpcForm: FormGroup;
  igwForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  selectedIndex = 0;
  loading = false;
  vpcErrObj = {
    vpcname: AppConstant.VALIDATIONS.AWS.AWSVPC.VPCNAME,
    ipv4cidr: AppConstant.VALIDATIONS.AWS.AWSVPC.VPCIP,
    notes: AppConstant.VALIDATIONS.AWS.AWSVPC.NOTES,
    awsvpcid: AppConstant.VALIDATIONS.AWS.AWSVPC.VPCID,
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
  isSyncTags = false;
  tagsList = [];

  constructor(
    private messageService: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private httpHandlerService: HttpHandlerService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private awsService: AWSService,
    private httpHandler: HttpHandlerService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (_.isUndefined(this.vpcObj) || _.isEmpty(this.vpcObj)) {
      this.clearForm();
      this.vpcObj.subnets = [];
      this.vpcObj.tableheader = [
        { field: "subnetname", header: "Subnet", datatype: "string" },
        { field: "awssubnetd", header: "AWS Subnet Id", datatype: "string" },
        { field: "ipv4cidr", header: "IPV4 CIDR", datatype: "string" },
      ];
      this.vpcObj.tagTableConfig = {
        edit: false,
        delete: false,
        globalsearch: false,
        loading: false,
        pagination: false,
        pageSize: 1000,
        title: "",
        widthConfig: ["30px", "25px", "25px"],
      };
    }
    if (this.assetData) {
      this.addTenant = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.clearForm();
    if (
      !_.isUndefined(changes.vpcObj) &&
      !_.isEmpty(changes.vpcObj.currentValue)
    ) {
      this.vpcObj = changes.vpcObj.currentValue;
      if (this.vpcObj.subnets && this.vpcObj.subnets.length > 0) {
        this.vpcObj.tableheader = [
          { field: "subnetname", header: "Subnet", datatype: "string" },
          { field: "awssubnetd", header: "AWS Subnet Id", datatype: "string" },
          { field: "ipv4cidr", header: "IPV4 CIDR", datatype: "string" },
        ];
        this.vpcObj.tagTableConfig = {
          edit: false,
          delete: false,
          globalsearch: false,
          loading: false,
          pagination: false,
          pageSize: 1000,
          title: "",
          widthConfig: ["30px", "25px", "25px"],
        };
      } else {
        this.vpcObj.subnets = [];
        this.vpcObj.tableheader = [
          { field: "subnetname", header: "Subnet", datatype: "string" },
          { field: "awssubnetd", header: "AWS Subnet Id", datatype: "string" },
          { field: "ipv4cidr", header: "IPV4 CIDR", datatype: "string" },
        ];
        this.vpcObj.tagTableConfig = {
          edit: false,
          delete: false,
          globalsearch: false,
          loading: false,
          pagination: false,
          pageSize: 1000,
          title: "",
          widthConfig: ["30px", "25px", "25px"],
        };
      }
      if (this.vpcObj.gateway) {
        this.igwForm = this.fb.group({
          gatewayname: [this.vpcObj.gateway.gatewayname],
          awsinternetgatewayid: [this.vpcObj.gateway.awsinternetgatewayid],
          notes: [this.vpcObj.gateway.notes],
        });
      }
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.getTagValues();
      this.generateEditForm(this.vpcObj);
    } else {
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  clearForm() {
    this.vpcForm = this.fb.group({
      vpcname: [null, Validators.required],
      ipv4cidr: [
        null,
        [
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ],
      ],
      notes: [""],
      awsvpcid: [""],
    });
    this.vpcObj.subnets = [];
    this.vpcObj.tableheader = [
      { field: "subnetname", header: "Subnet", datatype: "string" },
      { field: "awssubnetd", header: "AWS Subnet Id", datatype: "string" },
      { field: "ipv4cidr", header: "IPV4 CIDR", datatype: "string" },
    ];
    this.vpcObj.tagTableConfig = {
      edit: false,
      delete: false,
      globalsearch: false,
      loading: false,
      pagination: false,
      pageSize: 1000,
      title: "",
      widthConfig: ["30px", "25px", "25px"],
    };
    this.igwForm = this.fb.group({
      gatewayname: [""],
      awsinternetgatewayid: [""],
      notes: [""],
    });
  }
  saveUpdateVpc(data) {
    let errorMessage: any;
    if (this.vpcForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.vpcForm,
        this.vpcErrObj
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
      !_.isEmpty(this.vpcObj) &&
      this.vpcObj.vpcid != null &&
      this.vpcObj.vpcid != undefined
    ) {
      data.vpcid = this.vpcObj.vpcid;
      this.awsService.updateawsvpc(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.notifyVpcEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add vpc group. Try again");
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      this.awsService.createawsvpc(data).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.notifyVpcEntry.next(response.data);
            this.messageService.success(response.message);
          } else {
            this.messageService.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to add vpc group. Try again");
        }
      );
    }
  }
  generateEditForm(data) {
    this.vpcForm = this.fb.group({
      vpcname: [data.vpcname, Validators.required],
      ipv4cidr: [
        data.ipv4cidr,
        [
          Validators.required,
          Validators.pattern(
            new RegExp(/(\d){0,3}.(\d){0,3}.(\d){0,3}.(\d){0,3}\/(\d)*/g)
          ),
        ],
      ],
      notes: [data.notes],
      awsvpcid: [data.awsvpcid],
      status: [data.status],
    });
  }

  // Tag related code
  getTagValues() {
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.vpcObj.vpcid)
          ? this.vpcObj.vpcid
          : Number(this.vpcObj.vpcid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[9],
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
      "refid": this.vpcObj.awssecuritygroupid,
      "tnregionid": this.vpcObj.tnregionid,
      "tenantid": this.vpcObj.tenantid,
      "region": this.vpcObj.tenantregion[0].region,
      "username": this.userstoragedata.fullname,
      "id": this.vpcObj.securitygroupid,
      "presourcetype": AppConstant.TAGS.TAG_RESOURCETYPES[9]
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
          id: this.vpcObj.vpcid,
          tnregionid: this.vpcObj.tnregionid,
          refid: this.vpcObj.awsvpcid,
          region: this.vpcObj.tenantregion[0].region,
        },
      ],
      tagvalues: this.tagsClone,
      tenantid: this.userstoragedata.tenantid,
      cloudprovider: "AWS",
      resourcetype: "ASSET_VPC",
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
