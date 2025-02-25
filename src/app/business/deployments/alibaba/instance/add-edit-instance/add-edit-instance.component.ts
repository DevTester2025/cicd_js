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
import { AppConstant } from "../../../../../app.constant";
import * as _ from "lodash";
import { ScriptService } from "../../../../tenants/scripts/script.service";
import { AlibabaService } from "../../alibaba-service";
import { OrchestrationService } from "src/app/business/base/orchestration/orchestration.service";
@Component({
  selector: "app-cloudmatiq-ali-add-edit-instance",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/instance/add-edit-instance/add-edit-instance.component.html",
})
export class ALIAddEditInstanceComponent implements OnInit, OnChanges {
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
  modalWidth = 400;
  // List Arrays
  scriptsList: any[] = [];
  vpcList: any[] = [];
  imageList: any[] = [];
  volumeList: any[] = [];
  keyList: any[] = [];
  instanceTypeList: any = [];
  // Drop List Options
  alibabaSolutionsList: any = [];
  tagsItems;
  volumeObj = {} as any;
  // form Obj
  imageObj = {} as any;
  scriptObj = {} as any;
  vpcObj = {} as any;
  keypairObj = {} as any;
  sgObj = {} as any;
  vswitchObj: any = {};
  vswitchList: any = [];
  orchList: any[] = [];
  sgList: any = [];
  noofvolumes = 1 as any;
  loading = false;
  instancechargeTypeList: any = [];
  netchargeTypeList: any = [];
  removeitems: any = [];
  alibabaSolutionObj: any = {};
  defaultinstancecharge: any = {};
  defaultnetcharge: any = {};
  instanceErrObj = {
    instancename: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.INSTANCENAME,
    instancetypeid: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.INSTANCETYPE,
    instancechargetype:
      AppConstant.VALIDATIONS.ALIBABA.INSTANCE.INSTANCECHARGETYPE,
    internetchargetype: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.NETCHARGETYPE,
    internetmaxbandwidthin: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.BANDWITHIN,
    internetmaxbandwidthout:
      AppConstant.VALIDATIONS.ALIBABA.INSTANCE.BANDWITHOUT,
    imageid: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.IMAGE,
  };
  networkErrObj = {
    vpcid: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.VPC,
    vswitchid: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.VSWITCH,
    securitygroupid: AppConstant.VALIDATIONS.ALIBABA.INSTANCE.SECURITYGROUP,
  };

  @Output() continue: EventEmitter<any> = new EventEmitter();

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private lsService: LocalStorageService,
    private scriptService: ScriptService,
    private orchService: OrchestrationService,
    private alibabaService: AlibabaService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.clearForm();
    this.getAlibabaSolutions();
    this.getLookupList();
    this.getScriptList();
    this.getImageList();
    this.getOrchList();
    this.getVolumeList();
    this.getVPCList();
    this.getVSwitchList();
    this.getSecurityGroupList();
    this.getKeyList();
    this.getInstanceTypeList();
  }

  ngOnChanges(changes: SimpleChanges) {}

  clearForm() {
    this.instanceForm = this.fb.group({
      instancename: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      instancetypeid: [null, Validators.required],
      instancechargetype: [
        this.defaultinstancecharge !== undefined
          ? this.defaultinstancecharge.keyvalue
          : null,
        Validators.required,
      ],
      internetchargetype: [
        this.defaultnetcharge !== undefined
          ? this.defaultnetcharge.keyvalue
          : null,
        Validators.required,
      ],
      internetmaxbandwidthin: [200, Validators.required],
      internetmaxbandwidthout: [0, Validators.required],
      imageid: [null, Validators.required],
      scriptid: [-1],
      orchid: [null],
      deletionprotectionyn: ["Y", Validators.required],
      volumeid: [-1],
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.networkingForm = this.fb.group({
      vpcid: [null, Validators.required],
      vswitchid: [null, Validators.required],
      securitygroupid: [null, Validators.required],
    });
    this.keysForm = this.fb.group({
      keyid: [-1, Validators.required],
    });
    this.tagsForm = this.fb.group({
      tags: this.fb.array([this.formTag()]),
    });
  }
  getFormArray(type): FormArray {
    return this.tagsForm.get(type) as FormArray;
  }
  formTag(): FormGroup {
    return this.fb.group({
      tagkey: [null],
      tagvalue: [null],
      resourcetype: [AppConstant.CLOUDPROVIDER.ALIBABA],
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      status: [AppConstant.STATUS.ACTIVE],
      tenantid: [this.userstoragedata.tenantid],
    });
  }
  addTag() {
    this.tagsItems = this.tagsForm.get("tags") as FormArray;
    this.tagsItems.push(this.formTag());
  }
  removeTag(index) {
    this.tagsItems = this.tagsForm.get("tags") as FormArray;
    if (this.tagsItems.value.length !== 1) {
      let removalObj = {} as any;
      removalObj = this.tagsItems.value[index];
      removalObj.status = AppConstant.STATUS.INACTIVE;
      this.removeitems.push(removalObj);
      this.tagsItems.removeAt(index);
    }
  }

  openForm(val) {
    let data: any;
    this.modalVisible = true;
    this.modalTitle = val;
    this.modalWidth = 320;
    switch (val) {
      case "Image":
        this.imageObj = {};
        data = this.instanceForm.get("imageid").value;
        if (data != null && data !== undefined) {
          this.imageObj = _.find(this.imageList, { imageid: data });
        }
        break;
      case "Script":
        this.scriptObj = {};
        data = this.instanceForm.get("scriptid").value;
        if (data != null && data !== undefined) {
          this.scriptObj = _.find(this.scriptsList, { scriptid: data });
        }
        break;
      case "Volume":
        this.volumeObj = {};
        data = this.instanceForm.get("volumeid").value;
        if (data != null && data !== undefined) {
          this.volumeObj = _.find(this.volumeList, { volumeid: data });
        }
        break;
      case "VPC":
        this.vpcObj = {};
        data = this.networkingForm.get("vpcid").value;
        if (data != null && data !== undefined) {
          this.vpcObj = _.find(this.vpcList, { vpcid: data });
        }
        break;
      case "VSwitch":
        this.vswitchObj = {};
        data = this.networkingForm.get("vswitchid").value;
        if (data != null && data !== undefined) {
          this.vswitchObj = _.find(this.vswitchList, { vswitchid: data });
        }
        break;
      case "Security Group":
        this.sgObj = {};
        this.modalWidth = 820;
        data = this.networkingForm.get("securitygroupid").value;
        if (data != null && data !== undefined) {
          this.sgObj = _.find(this.sgList, { securitygroupid: data });
        }
        break;
      case "Key Pair":
        this.keypairObj = {};
        data = this.keysForm.get("keyid").value;
        if (data != null && data !== undefined) {
          this.keypairObj = _.find(this.keyList, { keyid: data });
        }
        break;
    }
  }
  getAlibabaSolutions() {
    this.alibabaService
      .allsolutions({
        solutionid: this.solutionObj.solutionid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.alibabaSolutionsList = response.data;
          } else {
            this.alibabaSolutionsList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getOrchList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.orchService.all(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
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
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.INSTANCE_CHARGE_TYPE,
        AppConstant.LOOKUPKEY.NETCHARGE_TYPE,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (
            element.lookupkey === AppConstant.LOOKUPKEY.INSTANCE_CHARGE_TYPE
          ) {
            this.instancechargeTypeList.push(element);
          }
          if (element.lookupkey === AppConstant.LOOKUPKEY.NETCHARGE_TYPE) {
            this.netchargeTypeList.push(element);
          }
        });
        this.defaultinstancecharge = _.find(
          this.instancechargeTypeList,
          function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          }
        );
        this.defaultnetcharge = _.find(this.netchargeTypeList, function (item) {
          if (item.defaultvalue === "Y") {
            return item;
          }
        });
        this.instanceForm
          .get("instancechargetype")
          .setValue(this.defaultinstancecharge.keyvalue);
        this.instanceForm
          .get("internetchargetype")
          .setValue(this.defaultnetcharge.keyvalue);
      }
    });
  }
  getInstanceTypeList() {
    this.alibabaService
      .allinstancetypes({ status: AppConstant.STATUS.ACTIVE })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.instanceTypeList = response.data;
          } else {
            this.instanceTypeList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }

  getImageList() {
    this.alibabaService
      .allimages({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.imageList = response.data;
          } else {
            this.imageList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getScriptList() {
    this.scriptService
      .all({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.scriptsList = response.data;
          } else {
            this.scriptsList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getVolumeList() {
    this.alibabaService
      .allvolumes({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.volumeList = response.data;
          } else {
            this.volumeList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getVPCList() {
    this.alibabaService
      .allvpcs({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.vpcList = response.data;
          } else {
            this.vpcList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getVSwitchList() {
    this.alibabaService
      .allvswitches({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.vswitchList = response.data;
          } else {
            this.vswitchList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getSecurityGroupList() {
    this.alibabaService
      .allsecuritygroups({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.sgList = response.data;
          } else {
            this.sgList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  getKeyList() {
    this.alibabaService
      .allkeys({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.keyList = response.data;
          } else {
            this.keyList = response.data;
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
  }
  editInstance(event) {
    event = event.data;
    this.alibabaSolutionObj = event;
    this.instanceForm.patchValue(event);
    this.networkingForm.patchValue(event);
    this.keysForm.patchValue(event);
    if (!_.isEmpty(event.alitags)) {
      this.tagsItems = this.tagsForm.get("tags") as FormArray;
      this.tagsItems.removeAt(0);
      event.alitags.forEach((element) => {
        this.tagsItems.push(
          this.fb.group({
            tagid: [element.tagid],
            tagkey: [element.tagkey],
            tagvalue: [element.tagvalue],
            resourcetype: [element.resourcetype],
            createdby: [element.createdby],
            createddt: [element.createddt],
            lastupdatedby: [this.userstoragedata.fullname],
            lastupdateddt: [new Date()],
            status: [element.status],
          })
        );
      });
    }
  }

  addServer(flag) {
    this.loading = true;
    let errorMessage: any;
    let formdata: any = {};
    if (this.instanceForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.instanceForm,
        this.instanceErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    if (this.networkingForm.status === AppConstant.FORMSTATUS.INVALID) {
      this.loading = false;
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.networkingForm,
        this.networkErrObj,
        "networks"
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }
    if (
      this.instanceForm.value.scriptid !== -1 &&
      this.instanceForm.value.orchid != null
    ) {
      this.loading = false;
      this.message.remove();
      this.message.error("Choose script or orchestration ");
      return false;
    }

    formdata = _.assign(
      this.instanceForm.value,
      this.networkingForm.value,
      this.keysForm.value
    );
    formdata.tenantid = this.userstoragedata.tenantid;
    formdata.solutionid = this.solutionObj.solutionid;
    formdata.lastupdatedby = this.userstoragedata.fullname;
    formdata.lastupdateddt = new Date();
    const keydata = this.tagsForm.value.tags;
    _.remove(keydata, function (item: any) {
      if (item.tagkey == null && item.tagvalue == null) {
        return item;
      }
    });
    if (!_.isEmpty(this.removeitems)) {
      this.removeitems.forEach((element) => {
        keydata.push(element);
      });
    }
    if (!_.isEmpty(keydata)) {
      formdata.alitags = keydata;
    }
    if (
      !_.isEmpty(this.alibabaSolutionObj) &&
      !_.isUndefined(this.alibabaSolutionObj) &&
      !_.isNull(this.alibabaSolutionObj.ecl2solutionid)
    ) {
      formdata.alisolutionid = this.alibabaSolutionObj.alisolutionid;
      formdata.alitags = _.map(formdata.alitags, function (item) {
        item.resourceid = formdata.alisolutionid;
        return item;
      });
      this.alibabaService.updatesolution(formdata).subscribe(
        (d) => {
          this.loading = false;
          const response = JSON.parse(d._body);
          if (response.status) {
            response.data.alitags = !_.isEmpty(formdata.alitags)
              ? formdata.alitags
              : [];
            this.alibabaSolutionsList = [
              ...this.alibabaSolutionsList,
              response.data,
            ];
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
          this.loading = false;
          this.message.error(AppConstant.VALIDATIONS.UPDATEERRMSG);
        }
      );
    } else {
      formdata.createdby = this.userstoragedata.fullname;
      formdata.createddt = new Date();
      this.alibabaService.createsolution(formdata).subscribe(
        (d) => {
          this.loading = false;
          const response = JSON.parse(d._body);
          if (response.status) {
            this.alibabaSolutionsList = !_.isEmpty(this.alibabaSolutionsList)
              ? [...this.alibabaSolutionsList, response.data]
              : [response.data];
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
          this.loading = false;
          this.message.error(AppConstant.VALIDATIONS.ADDERRMSG);
        }
      );
    }
  }

  deleteInstance(data) {
    let response = {} as any;
    const formdata = {
      alisolutionid: data.alisolutionid,
      status: AppConstant.STATUS.INACTIVE,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    this.alibabaService.updatesolution(formdata).subscribe(
      (d) => {
        response = JSON.parse(d._body);
        if (response.status) {
          this.alibabaSolutionsList = _.filter(
            this.alibabaSolutionsList,
            function (item) {
              if (_.isEqual(item, data) === false) {
                return item;
              }
            }
          );
          this.message.success(
            "#" + response.data.alisolutionid + " Instance removed successfully"
          );
          this.clearForm();
        } else {
          this.message.error(response.message);
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.DELETEERRMSG);
      }
    );
  }

  notifyVolumeEntry(event) {
    if (
      this.volumeObj !== undefined &&
      !_.isEmpty(this.volumeObj) &&
      !_.isUndefined(this.volumeObj.volumeid)
    ) {
      const index = _.indexOf(this.volumeList, this.volumeObj);
      if (event.status !== AppConstant.STATUS.INACTIVE) {
        this.volumeList[index] = event;
        this.volumeList = _.filter(this.volumeList, function (i) {
          if (i) {
            return i;
          }
        });
      } else {
        this.volumeList.splice(this.volumeList.indexOf(this.volumeObj), 1);
        this.volumeList = [...this.volumeList];
        this.instanceForm.controls["volumeid"].setValue(null);
      }
    } else {
      this.volumeList = !_.isEmpty(this.volumeList)
        ? [...this.volumeList, event]
        : [event];
      this.instanceForm.controls["volumeid"].setValue(event.volumeid);
    }
    this.modalVisible = false;
  }
  notifyImageEntry(event) {
    if (
      this.imageObj !== undefined &&
      !_.isEmpty(this.imageObj) &&
      !_.isUndefined(this.imageObj.imageid)
    ) {
      const index = _.indexOf(this.imageList, this.imageObj);
      if (event.status !== AppConstant.STATUS.INACTIVE) {
        this.imageList[index] = event;
        this.imageList = _.filter(this.imageList, function (i) {
          if (i) {
            return i;
          }
        });
      } else {
        this.imageList.splice(this.imageList.indexOf(this.imageObj), 1);
        this.imageList = [...this.imageList];
        this.instanceForm.controls["imageid"].setValue(null);
      }
    } else {
      this.imageList = !_.isEmpty(this.imageList)
        ? [...this.imageList, event]
        : [event];
      this.instanceForm.controls["imageid"].setValue(event.imageid);
    }
    this.modalVisible = false;
  }

  notifyVpcEntry(event) {
    if (
      this.vpcObj !== undefined &&
      !_.isEmpty(this.vpcObj) &&
      !_.isUndefined(this.vpcObj.vpcid)
    ) {
      const index = _.indexOf(this.vpcList, this.vpcObj);
      if (event.status !== AppConstant.STATUS.INACTIVE) {
        this.vpcList[index] = event;
        this.vpcList = _.filter(this.vpcList, function (i) {
          if (i) {
            return i;
          }
        });
      } else {
        this.vpcList.splice(this.vpcList.indexOf(this.vpcObj), 1);
        this.vpcList = [...this.vpcList];
        this.networkingForm.controls["vpcid"].setValue(null);
      }
    } else {
      this.vpcList = !_.isEmpty(this.vpcList)
        ? [...this.vpcList, event]
        : [event];
      this.networkingForm.controls["vpcid"].setValue(event.vpcid);
    }
    this.modalVisible = false;
  }

  notifyVSwitchEntry(event) {
    if (
      this.vswitchObj !== undefined &&
      !_.isEmpty(this.vswitchObj) &&
      !_.isUndefined(this.vswitchObj.vswitchid)
    ) {
      const index = _.indexOf(this.vswitchList, this.vswitchObj);
      if (event.status !== AppConstant.STATUS.INACTIVE) {
        this.vswitchList[index] = event;
        this.vswitchList = _.filter(this.vswitchList, function (i) {
          if (i) {
            return i;
          }
        });
      } else {
        this.vswitchList.splice(this.vswitchList.indexOf(this.vswitchObj), 1);
        this.vswitchList = [...this.vswitchList];
        this.networkingForm.controls["vswitchid"].setValue(null);
      }
    } else {
      this.vswitchList = !_.isEmpty(this.vswitchList)
        ? [...this.vswitchList, event]
        : [event];
      this.networkingForm.controls["vswitchid"].setValue(event.vswitchid);
    }
    this.modalVisible = false;
  }
  notifySgEntry(event) {
    if (
      this.sgObj !== undefined &&
      !_.isEmpty(this.sgObj) &&
      !_.isUndefined(this.sgObj.securitygroupid)
    ) {
      const index = _.indexOf(this.sgList, this.sgObj);
      if (event.status !== AppConstant.STATUS.INACTIVE) {
        this.sgList[index] = event;
        this.sgList = _.filter(this.sgList, function (i) {
          if (i) {
            return i;
          }
        });
      } else {
        this.sgList.splice(this.sgList.indexOf(this.sgObj), 1);
        this.sgList = [...this.sgList];
        this.networkingForm.controls["securitygroupid"].setValue(null);
      }
    } else {
      this.sgList = !_.isEmpty(this.sgList) ? [...this.sgList, event] : [event];
      this.networkingForm.controls["securitygroupid"].setValue(
        event.securitygroupid
      );
    }
    this.modalVisible = false;
  }
  notifyKeyPairEntry(event) {
    if (
      this.keypairObj !== undefined &&
      !_.isEmpty(this.keypairObj) &&
      !_.isUndefined(this.keypairObj.keyid)
    ) {
      const index = _.indexOf(this.keyList, this.keypairObj);
      if (event.status !== AppConstant.STATUS.INACTIVE) {
        this.keyList[index] = event;
        this.keyList = _.filter(this.keyList, function (i) {
          if (i) {
            return i;
          }
        });
      } else {
        this.keyList.splice(this.keyList.indexOf(this.keypairObj), 1);
        this.keyList = [...this.keyList];
        this.keysForm.controls["keyid"].setValue(null);
      }
    } else {
      this.keyList = !_.isEmpty(this.keyList)
        ? [...this.keyList, event]
        : [event];
      this.keysForm.controls["keyid"].setValue(event.keyid);
    }
    this.modalVisible = false;
  }
}
