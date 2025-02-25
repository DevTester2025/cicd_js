import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  Form,
  FormArray,
} from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AWSService } from "../../aws-service";
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { ScriptService } from "../../../../tenants/scripts/script.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { OrchestrationService } from "src/app/business/base/orchestration/orchestration.service";

@Component({
  selector: "app-cloudmatiq-aws-instance-add-edit",
  styles: [
    `
      .ant-tabs-nav .ant-tabs-tab-active {
        color: #ffc107 !important;
        font-weight: 500;
      }
      .ant-tabs-vertical .ant-tabs-left > .ant-tabs-bar .ant-tabs-tab {
        float: none;
        margin: 0 0 16px;
        padding: 8px 24px;
        display: block;
        color: #d6d3d3;
      }
    `,
  ],
  templateUrl:
    "../../../../../presentation/web/deployments/aws/instance/add-edit-instance/add-edit-instance.component.html",
})
export class AWSInstanceAddEditComponent implements OnInit, OnChanges {
  @Input() solutionObj: any;
  userstoragedata = {} as any;
  instanceForm: FormGroup;
  networkingForm: FormGroup;
  volumeForm: FormGroup;
  tagsForm: FormGroup;
  keysForm: FormGroup;
  // Modal variables
  modalVisible = false;
  modalTitle = "";
  modalWidth = 820;
  // List Arrays
  scriptsList: any[] = [];
  orchList: any[] = [];
  vpcList: any[] = [];
  subnetList: any[] = [];
  sgList: any[] = [];
  amiList: any[] = [];
  actualamiList: any[] = [];
  keysList: any[] = [];
  instanceList: any[] = [];
  // Drop List Options
  subnetOptions: any[] = [];
  awsSolutionsList: any[] = [];
  awsVolumesList: any[] = [];
  deletedVolumes: any[] = [];
  tagsItems;
  volumeObj = {} as any;
  // form Obj
  amiObj = {} as any;
  scriptObj = {} as any;
  vpcObj = {} as any;
  subnetObj = {} as any;
  keyObj = {} as any;
  sgObj = {} as any;
  awsSolutionObj = {} as any;
  @Output() continue: EventEmitter<any> = new EventEmitter();

  // Tagging related code
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
  instanceLevelTags = [];

  tags = [];
  tagsClone = [];

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private lsService: LocalStorageService,
    private awsService: AWSService,
    private orchService: OrchestrationService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private scriptService: ScriptService
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.clearForm();
    this.clearNetworkForm();
    this.getSubnetList();
    this.getScriptList();
    this.getSgList();
    this.getAmiList();
    this.getVpcList();
    this.getKeysList();
    this.getAwsInstanceTypeList();
    this.getAwsSolutionsList();
    this.getOrchList();
  }

  ngOnChanges(changes: SimpleChanges) {}
  clearNetworkForm() {
    this.networkingForm = this.fb.group({
      vpcid: [null],
      subnetid: [null],
      awsvpcid: [null, Validators.required],
      awssubnetd: [null, Validators.required],
      awssecuritygroupid: [null, Validators.required],
      securitygroupid: [null],
    });
  }
  clearForm() {
    this.keysForm = this.fb.group({
      keyid: [null, Validators.required],
    });
    this.instanceForm = this.fb.group({
      instancename: [null, Validators.required],
      instancetypeid: [null, Validators.required],
      awsamiid: [null, Validators.required],
      amiid: [null],
      publicipyn: ["Y", Validators.required],
      shutdownbehaviour: ["terminate", Validators.required],
      terminationprotectionyn: ["Y", Validators.required],
      scriptid: [-1],
      orchid: [-1],
      rootvolumesize: [30],
      monitoringyn: ["Y", Validators.required],
      monitorutilyn: ["Y", Validators.required],
      status: ["Active"],
    });
    this.tagsForm = this.fb.group({
      tags: this.fb.array([this.formTag()]),
    });
  }
  formTag(key?, value?): FormGroup {
    return this.fb.group({
      tagkey: [key || null, Validators.required],
      tagvalue: [value || null, Validators.required],
      resourcetype: ["EC2"],
      status: ["Active"],
    });
  }

  openForm(val) {
    let data: any;
    this.modalVisible = true;
    this.modalTitle = val;
    switch (val) {
      case "AMI":
        this.amiObj = {};
        data = this.instanceForm.get("awsamiid").value;
        if (data != null && data != undefined) {
          this.amiObj = _.find(this.actualamiList, { awsamiid: data });
        }
        break;
      case "VPC":
        this.vpcObj = {};
        data = this.networkingForm.get("awsvpcid").value;
        if (data != null && data != undefined) {
          this.vpcObj = _.find(this.vpcList, { awsvpcid: data });
        }
        break;
      case "Subnet":
        this.subnetObj = {};
        data = this.networkingForm.get("awssubnetd").value;
        if (data != null && data != undefined) {
          this.subnetObj = _.find(this.subnetList, { awssubnetd: data });
        }
        break;
      case "Script":
        this.scriptObj = {};
        data = this.instanceForm.get("scriptid").value;
        if (data != null && data != undefined) {
          this.scriptObj = _.find(this.scriptsList, { scriptid: data });
        }
        break;
      case "Security Group":
        this.sgObj = {};
        data = this.networkingForm.get("awssecuritygroupid").value;
        if (data != null && data != undefined) {
          this.sgObj = _.find(this.sgList, { awssecuritygroupid: data });
        }
        break;
      case "Keys":
        this.keyObj = {};
        data = this.keysForm.get("keyid").value;
        if (data != null && data != undefined) {
          this.keyObj = _.find(this.keysList, { keyid: data });
        }
        break;
    }
  
    if(val == "Volume" || val == "Keys"){
      this.modalWidth = 400
    }
    else {
      this.modalWidth = 820;
    }
  }
  onVpcChange(vpcid) {
    this.subnetOptions = _.find(this.subnetList, { vpcid: vpcid });
  }
  getFormArray(type): FormArray {
    return this.tagsForm.get(type) as FormArray;
  }
  addTag() {
    this.tagsItems = this.tagsForm.get("tags") as FormArray;
    this.tagsItems.push(this.formTag());
  }
  removeTag(index) {
    let controls = <FormArray>this.tagsForm.controls["tags"];
    if (controls.value.length !== 1) {
      controls.removeAt(index);
    }
  }
  getAwsSolutionsList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      solutionid: this.solutionObj.solutionid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawssolutions(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.solutionObj.refid = response.data[0].solutionid
          this.solutionObj.reftype = AppConstant.REFERENCETYPE[23];
          this.awsSolutionsList = response.data;
        } else {
          this.awsSolutionsList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getAwsInstanceTypeList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      // tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsinstancetype(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.instanceList = response.data;
        } else {
          this.instanceList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getOrchList() {
    console.log("Getting orch list::::::");
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.orchService.all(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        console.log(response);
        if (response.status) {
          this.orchList = response.data;
        } else {
          this.orchList = [];
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }
  getScriptList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.scriptService.all(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.scriptsList = response.data;
        } else {
          this.scriptsList = response.data;
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getKeysList(options?) {
    let response = {} as any;
    let query = {} as any;
    if (options) {
      query = options;
    } else {
      query = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      };
    }
    this.awsService.allawskeys(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.keysList = response.data.map((o) => {
            o.keyname = o.tnregion
              ? o.keyname + " (" + o.tnregion.region + ")"
              : o.keyname;
            return o;
          });
          console.log(this.keysList);
        } else {
          this.keysList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getSubnetList(options?, id?) {
    let response = {} as any;
    let query = {} as any;
    if (options) {
      query = options;
    }
    query.tenantid = this.userstoragedata.tenantid;
    query.status = AppConstant.STATUS.ACTIVE;
    if (id) {
      let vpc = _.find(this.vpcList, { awsvpcid: id });
      query.vpcid = vpc.vpcid;
    }
    this.awsService.allawssubnet(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.subnetList = response.data.map((o) => {
            o.subnetname =
              o.tenantregion && o.tenantregion.length > 0
                ? o.subnetname + " (" + o.tenantregion[0].region + ")"
                : o.subnetname;
            return o;
          });
        } else {
          this.subnetList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
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
          this.vpcList = response.data.map((o) => {
            o.vpcname =
              o.tenantregion && o.tenantregion.length > 0
                ? o.vpcname + " (" + o.tenantregion[0].region + ")"
                : o.vpcname;
            return o;
          });
        } else {
          this.vpcList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
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
          this.sgList = response.data.map((o) => {
            o.securitygroupname =
              o.tenantregion && o.tenantregion.length > 0
                ? o.securitygroupname + " (" + o.tenantregion[0].region + ")"
                : o.securitygroupname;
            return o;
          });
        } else {
          this.sgList = response.data;
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  getAmiList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsami(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.actualamiList = response.data;
          this.actualamiList = _.uniqBy(this.actualamiList, "awsamiid");
          let groupedImages = _.groupBy(this.actualamiList, function (i) {
            return i.tnregion ? i.tnregion.region : "Others";
          });
          this.amiList = _.map(groupedImages, function (value, key) {
            return {
              label: key,
              groupItem: value,
            };
          });
        } else {
          this.amiList = [];
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
  addServer(flag) {
    let response = {} as any;
    let formdata = {} as any;
    formdata = {
      ...this.instanceForm.value,
      ...this.networkingForm.value,
    };
    let imageObj = _.find(this.actualamiList, {
      awsamiid: formdata.awsamiid,
    }) as any;
    if (imageObj) this.instanceForm.controls["amiid"].setValue(imageObj.amiid);
    let vpcObj = _.find(this.vpcList, { awsvpcid: formdata.awsvpcid }) as any;
    if (vpcObj) this.networkingForm.controls["vpcid"].setValue(vpcObj.vpcid);
    let subnetObj = _.find(this.subnetList, {
      awssubnetd: formdata.awssubnetd,
    }) as any;
    if (subnetObj)
      this.networkingForm.controls["subnetid"].setValue(subnetObj.subnetid);
    let sgObj = _.find(this.sgList, {
      awssecuritygroupid: formdata.awssecuritygroupid,
    }) as any;
    if (sgObj)
      this.networkingForm.controls["securitygroupid"].setValue(
        sgObj.securitygroupid
      );
    if (
      this.instanceForm.valid &&
      this.networkingForm.valid &&
      this.keysForm.valid
    ) {
      formdata = {
        ...this.instanceForm.value,
        ...this.networkingForm.value,
        solutionid: this.solutionObj.solutionid,
        noofservers: 1,
        notes: "",
        keyid: this.keysForm.get("keyid").value,
        createddt: new Date(),
        createdby: this.userstoragedata.fullname,
      };
      if (this.tagsClone.length > 0) {
        formdata.tagvalues = this.tagsClone;
      }
      if (this.awsVolumesList.length > 0 || this.deletedVolumes.length > 0) {
        formdata.volumes = this.awsVolumesList.concat(this.deletedVolumes);
      }
      if (
        this.instanceForm.value.scriptid !== -1 &&
        this.instanceForm.value.orchid != null &&
        this.instanceForm.value.orchid != -1
      ) {
        this.message.remove();
        this.message.error("Choose script or orchestration ");
        return false;
      }

      if (
        !_.isEmpty(this.awsSolutionObj) &&
        !_.isUndefined(this.awsSolutionObj.awssolutionid)
      ) {
        formdata.awssolutionid = this.awsSolutionObj.awssolutionid;
        let self = this;
        _.map(formdata.volumes, function (item) {
          item.awssolutionid = self.awsSolutionObj.awssolutionid;
          return;
        });
        this.awsService.updateawssolutions(formdata).subscribe(
          (d) => {
            response = JSON.parse(d._body);
            if (response.status) {
              this.awsSolutionsList = [...this.awsSolutionsList, response.data];
              if (flag) {
                this.continue.next();
              } else {
                this.clearForm();
              }
              this.message.success(response.message);
            } else {
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to create AWS Solution");
          }
        );
      } else {
        this.awsService.createawssolutions(formdata).subscribe(
          (d) => {
            response = JSON.parse(d._body);
            if (response.status) {
              this.awsSolutionsList = [...this.awsSolutionsList, response.data];
              if (flag) {
                this.continue.next();
              } else {
                this.clearForm();
              }
              this.message.success(response.message);
            } else {
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to create AWS Solution");
          }
        );
      }
    } else {
      this.message.error("Please input all the mandatory fields");
    }
  }
  deleteInstance(data) {
    if (data.awssolutionid != undefined) {
      let response = {} as any;
      let formdata = {
        awssolutionid: data.awssolutionid,
        status: AppConstant.STATUS.INACTIVE,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      };
      this.awsService.updateawssolutions(formdata).subscribe(
        (d) => {
          response = JSON.parse(d._body);
          if (response.status) {
            this.awsSolutionsList = _.filter(
              this.awsSolutionsList,
              function (item) {
                if (_.isEqual(item, data) == false) {
                  return item;
                }
              }
            );
            this.message.success(
              "#" +
                response.data.awssolutionid +
                " Instance removed successfully"
            );
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to create AWS Solution");
        }
      );
    } else {
    }
  }
  serverChange(changes) {
    let index = this.awsSolutionsList.indexOf(changes.data);
    if (changes.edit) {
      this.awsSolutionObj = changes.data;
      this.instanceForm.patchValue(changes.data);
      this.keysForm.patchValue(changes.data);
      this.networkingForm.patchValue(changes.data);
      if (
        changes.data.volumes != undefined &&
        changes.data.volumes.length > 0
      ) {
        this.awsVolumesList = [...changes.data.volumes];
      }
      console.log("AWS INSTANCE DETAIL:::::::::::");
      console.log(this.awsSolutionObj);
      this.getTags(this.awsSolutionObj.awssolutionid);
      // if (changes.data.tags.length > 0) {
      //     let tags = changes.data.tags;
      //     this.tagsItems = this.tagsForm.get('tags') as FormArray;
      //     let controls = <FormArray>this.tagsForm.controls['tags'];
      //     for (let i = 0; i < tags.length; i++) {
      //         controls.removeAt(i);
      //     }
      //     for (let i = 0; i < tags.length; i++) {
      //         this.tagsItems.push(this.formTag(tags[i].tagkey, tags[i].tagvalue))
      //     }
      // }
    } else {
    }
  }
  notifyScriptEntry(event) {
    if (this.scriptObj != undefined && !_.isEmpty(this.scriptObj)) {
      let index = _.indexOf(this.scriptsList, this.scriptObj);
      this.scriptsList[index] = event;
      this.scriptsList = _.filter(this.scriptsList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.scriptsList = [...this.scriptsList, event];
      this.instanceForm.controls["scriptid"].setValue(event.scriptid);
    }
    this.modalVisible = false;
  }
  notifyAmiEntry(event) {
    if (this.amiObj != undefined && !_.isEmpty(this.amiObj)) {
      let index = _.indexOf(this.actualamiList, this.amiObj);
      this.actualamiList[index] = event;
      this.actualamiList = _.filter(this.actualamiList, function (i) {
        if (i) {
          return i;
        }
      });
      let groupedImages = _.groupBy(this.actualamiList, function (i) {
        return i.tnregion ? i.tnregion.region : "Others";
      });
      this.amiList = _.map(groupedImages, function (value, key) {
        return {
          label: key,
          groupItem: value,
        };
      });
    } else {
      this.actualamiList = [...this.actualamiList, event];
      let groupedImages = _.groupBy(this.actualamiList, function (i) {
        return i.tnregion ? i.tnregion.region : "Others";
      });
      this.amiList = _.map(groupedImages, function (value, key) {
        return {
          label: key,
          groupItem: value,
        };
      });
      let images = _.find(this.amiList, function (i) {
        return i.label == "Others";
      });
      let selectedAMI = _.find(images.groupItem, function (itm) {
        return itm.amiid == event.amiid;
      });
      this.instanceForm.controls["amiid"].setValue(event.amiid);
      this.instanceForm.controls["awsamiid"].setValue(selectedAMI.awsamiid);
    }
    this.modalVisible = false;
  }
  notifyVpcEntry(event) {
    console.log(event);
    console.log(this.vpcObj);
    if (this.vpcObj && this.vpcObj.vpcid) {
      let index = _.indexOf(this.vpcList, this.vpcObj);
      this.vpcList[index] = event;
      this.vpcList = _.filter(this.vpcList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.vpcList = [...this.vpcList, event];
      this.networkingForm.controls["vpcid"].setValue(event.vpcid);
      this.networkingForm.controls["awsvpcid"].setValue(event.vpcid);
    }
    this.modalVisible = false;
  }
  notifySubnetEntry(event: any) {
    if (this.subnetObj != undefined && !_.isEmpty(this.subnetObj)) {
      let index = _.indexOf(this.subnetList, this.subnetObj);
      this.subnetList[index] = event;
      this.subnetList = _.filter(this.subnetList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.subnetList = [...this.subnetList, event];
      this.networkingForm.controls["subnetid"].setValue(event.subnetid);
      this.networkingForm.controls["awssubnetd"].setValue(event.awssubnetd);
    }
    this.modalVisible = false;
  }
  notifyKeysEntry(event) {
    if (this.keyObj != undefined && !_.isEmpty(this.keyObj)) {
      let index = _.indexOf(this.keysList, this.keyObj);
      this.keysList[index] = event;
      this.keysList = _.filter(this.keysList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.keysList = [...this.keysList, event];
      this.keysForm.controls["keyid"].setValue(event.keyid);
    }
    this.modalVisible = false;
  }
  notifySgEntry(event) {
    if (this.sgObj != undefined && !_.isEmpty(this.sgObj)) {
      let index = _.indexOf(this.sgList, this.sgObj);
      this.sgList[index] = event;
      this.sgList = _.filter(this.sgList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.sgList = [...this.sgList, event];
      this.networkingForm.controls["securitygroupid"].setValue(
        event.securitygroupid
      );
      this.networkingForm.controls["awssecuritygroupid"].setValue(
        event.awssecuritygroupid
      );
    }
    this.modalVisible = false;
  }
  notifyVolumeEntry(event) {
    if (event.add == true) {
      this.awsVolumesList = [...this.awsVolumesList, event.data];
    } else {
      let index = _.indexOf(this.awsVolumesList, this.volumeObj);
      this.awsVolumesList[index] = event.data;
    }
    this.modalVisible = false;
  }

  deleteVolume(data) {
    data.status = AppConstant.STATUS.INACTIVE;
    this.deletedVolumes.push(data);
    this.awsVolumesList = _.filter(this.awsVolumesList, function (item) {
      if (_.isEqual(item, data) == false) {
        return item;
      }
    });
  }
  editVolume(data) {
    this.volumeObj = data;
    this.modalVisible = true;
  }

  // Tagging related code.
  getTags(refid?: number) {
    let cndtn = {
      resourceid: Number.isInteger(this.solutionObj.solutionid)
        ? this.solutionObj.solutionid
        : Number(this.solutionObj.solutionid),
      resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[1],
      status: AppConstant.STATUS.ACTIVE,
    };

    if (refid) cndtn["refid"] = refid;

    this.tagValueService.all(cndtn).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          let l = [];
          for (let index = 0; index < response.data.length; index++) {
            const element = response.data[index];
            l.push({
              tagname: element.tag.tagname,
              tagvalue: element.tagvalue,
            });
          }
          this.instanceLevelTags = l;
          this.tags = this.tagService.decodeTagValues(response.data, "picker");
          this.tagsClone = response.data;
        } else {
          this.tags = [];
          this.tagsClone = [];
          this.instanceLevelTags = [];
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
  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagPickerVisible = false;
      this.tagsClone = e.data;
      this.instanceLevelTags = this.tagService.prepareViewFormat(e.data);
    }
  }
}
