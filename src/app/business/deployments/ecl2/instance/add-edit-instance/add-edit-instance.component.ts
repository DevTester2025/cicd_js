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
import { OrchestrationService } from "../../../../base/orchestration/orchestration.service";
import { Ecl2Service } from "../../../ecl2/ecl2-service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
@Component({
  selector: "app-cloudmatiq-ecl2-add-edit-instance",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/instance/add-edit-instance/add-edit-instance.component.html",
})
export class ECL2AddEditInstanceComponent implements OnInit {
  @Input() solutionObj: any;
  userstoragedata = {} as any;
  instanceForm: FormGroup;
  networkingForm: FormGroup;
  volumeForm: FormGroup;
  tagsForm: FormGroup;
  keysForm: FormGroup;
  approvalForm: FormGroup;
  loading = false;
  // Modal variables
  modalVisible = false;
  modalTitle = "";
  modalWidth = 400;
  isapprovalVisible = false;
  // List Arrays
  scriptsList: any[] = [];
  orchList: any[] = [];
  vpcList: any[] = [];
  amiList: any[] = [];
  keysList: any[] = [];
  instanceList: any[] = [];
  // Drop List Options
  awsSolutionsList: any[] = [];
  tagsItems;
  volumeObj = {} as any;
  // form Obj
  amiObj = {} as any;
  scriptObj = {} as any;
  neworkObj = {} as any;
  keyObj = {} as any;
  eclSolutionObj: any = {};
  volumeList: any = [];
  internetGatewayList: any = [];
  networks: FormArray;
  index;
  zoneList: any = [];
  zoneObj = {} as any;
  removeitem: any = {};
  vsrxList: any = [];
  interconctivityList: any = [];
  interConnectivityObj: any = {};
  selectedInterConnectivity: any = [];
  tenantconnectivity = false;
  spinning = false;
  subtenantList: any = [];
  instanceErrObj = {
    instancename: AppConstant.VALIDATIONS.ECL2.INSTANCE.INSTANCENAME,
    flavorid: AppConstant.VALIDATIONS.ECL2.INSTANCE.INSTANCETYPE,
    ecl2imageid: AppConstant.VALIDATIONS.ECL2.INSTANCE.IMAGE,
  };
  networkErr = {
    ecl2networkid: AppConstant.VALIDATIONS.ECL2.INSTANCE.NETWORKS,
  };
  approvalErrObj = {
    accesskey: AppConstant.VALIDATIONS.ECL2.INTERCONNAPPROVAL.ACCESSKEY,
    secretkey: AppConstant.VALIDATIONS.ECL2.INTERCONNAPPROVAL.SECRETKEY,
    admintenantid: AppConstant.VALIDATIONS.ECL2.INTERCONNAPPROVAL.ADMINTENANTID,
  };

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

  @Output() continue: EventEmitter<any> = new EventEmitter();
  constructor(
    private message: NzMessageService,
    private tagService: TagService,
    private fb: FormBuilder,
    private lsService: LocalStorageService,
    private tagValueService: TagValueService,
    private scriptService: ScriptService,
    private orchService: OrchestrationService,
    private commonService: CommonService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.clearForm();
    if (!_.isUndefined(this.solutionObj.zoneid)) {
      this.getZone();
    }
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      //zoneid: this.solutionObj.zoneid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.solutionObj.clientid !== -1) {
      condition.customerid = this.solutionObj.clientid;
    }
    this.getScriptList();
    this.getOrchList();
    this.getVpcList(condition);
    this.getKeysList(condition);
    this.getInstanceTypeList();
    this.getVolumeList(condition);
    this.getECL2SolutionsList();
    this.getInternetGatewayList(condition);
    this.getVSRXList(condition);
    this.getSubtenantList();
    this.getTenantConnectionList(condition);
  }

  clearForm() {
    this.keysForm = this.fb.group({
      keyid: [-1],
    });
    this.instanceForm = this.fb.group({
      instancename: [null, Validators.required],
      flavorid: [null, Validators.required],
      ecl2imageid: [null, Validators.required],
      imageid: [null],
      ecl2volumeid: [null],
      monitorutilyn: ["Y", Validators.required],
      volumeid: [null],
      shutdownbehaviour: ["terminate", Validators.required],
      scriptid: [null],
      orchid: [null],
      status: [AppConstant.STATUS.ACTIVE],
    });
    this.tagsForm = this.fb.group({
      tags: this.fb.array([this.formTag()]),
    });
    this.networkingForm = this.fb.group({
      internetgatewayid: [-1],
      vsrxid: [-1],
      sharedtenants: [null],
      ecl2internetgatewayid: [null],
      ecl2vsrxid: [null],
      tenantsharing: [false],
      tenantconnectionrequests: [null],
      networks: this.fb.array([this.createNetwork()]),
    });
    this.approvalForm = this.fb.group({
      accesskey: ["", Validators.required],
      secretkey: ["", Validators.required],
      admintenantid: ["", Validators.required],
    });
  }
  createNetwork(value?): FormGroup {
    return this.fb.group({
      networkid: [value || null],
      ecl2networkid: [value || null, Validators.required],
    });
  }
  addNewNetwork() {
    this.networks = this.networkingForm.get("networks") as FormArray;
    this.networks.push(this.createNetwork());
  }
  getFormArray(type): FormArray {
    if (type === "networks") {
      return this.networkingForm.get(type) as FormArray;
    } else {
      return this.tagsForm.get(type) as FormArray;
    }
  }
  removeNetwork(index) {
    this.networks = this.networkingForm.get("networks") as FormArray;
    if (this.networks.value.length !== 1) {
      this.networks.removeAt(index);
    }
  }
  formTag(value?): FormGroup {
    if (!_.isEmpty(value)) {
      return this.fb.group({
        tagid: [value.tagid],
        tagkey: [!_.isEmpty(value) ? value.tagkey : null],
        tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
        resourceid: [
          !_.isEmpty(this.eclSolutionObj)
            ? this.eclSolutionObj.ecl2solutionid
            : null,
        ],
        resourcetype: [AppConstant.CLOUDPROVIDER.ECL2],
        status: [!_.isEmpty(value) ? value.status : "Active"],
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      });
    } else {
      return this.fb.group({
        tagkey: [!_.isEmpty(value) ? value.tagkey : null],
        tagvalue: [!_.isEmpty(value) ? value.tagvalue : null],
        tenantid: this.userstoragedata.tenantid,
        resourceid: [
          !_.isEmpty(this.eclSolutionObj)
            ? this.eclSolutionObj.ecl2solutionid
            : null,
        ],
        resourcetype: [AppConstant.CLOUDPROVIDER.ECL2],
        status: [AppConstant.STATUS.ACTIVE],
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      });
    }
  }

  openForm(val) {
    let data: any;
    this.modalVisible = true;
    this.modalTitle = val;
    switch (val) {
      case "AMI":
        this.amiObj = {};
        data = this.instanceForm.get("ecl2imageid").value;
        if (data != null && data !== undefined) {
          this.amiObj = _.find(this.amiList, { ecl2imageid: data });
        }
        break;
      case "Script":
        this.scriptObj = {};
        data = this.instanceForm.get("scriptid").value;
        if (data != null && data !== undefined && data !== -1) {
          this.scriptObj = _.find(this.scriptsList, { scriptid: data });
        }
        break;
      case "Keys":
        this.keyObj = {};
        data = this.keysForm.get("keyid").value;
        if (data != null && data !== undefined && data !== -1) {
          this.keyObj = _.find(this.keysList, { keyid: data });
        } else {
          this.keyObj = this.solutionObj;
        }
        break;
      case "Volume":
        this.volumeObj = {};
        this.volumeObj = this.solutionObj;
        break;
    }
    this.modalWidth = 320;
  }

  addTag() {
    this.tagsItems = this.tagsForm.get("tags") as FormArray;
    this.tagsItems.push(this.formTag());
  }
  removeTag(index) {
    this.tagsItems = this.tagsForm.get("tags") as FormArray;
    if (this.tagsItems.value.length !== 1) {
      let item = {} as any;
      item = this.tagsItems.controls[index].value;
      item.status = AppConstant.STATUS.INACTIVE;
      this.removeitem = item;
      this.tagsItems.removeAt(index);
    }
  }
  checkedTenantSharing(event) {
    if (event === true) {
      if (this.solutionObj.clientid === -1) {
        //  this.getSubtenantList();
        this.networkingForm.controls["tenantsharing"].setValue(false);
        this.message.error(
          `Please Select ${AppConstant.SUBTENANT} on Basic Details`
        );
      }
    }
  }
  getSubtenantList() {
    this.commonService
      .allCustomers({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          const customer = this.solutionObj.clientid;
          _.remove(response.data, function (obj: any) {
            if (obj.customerid === customer) {
              return obj;
            }
          });
          _.remove(response.data, function (obj: any) {
            if (obj.ecl2tenantid == null) {
              return obj;
            }
          });
          this.subtenantList = response.data;
        } else {
          this.subtenantList = [];
        }
      });
  }
  getECL2SolutionsList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      solutionid: this.solutionObj.solutionid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2solution(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.awsSolutionsList = response.data;
        } else {
          this.awsSolutionsList = [];
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }
  getInternetGatewayList(condition) {
    this.ecl2Service.allecl2gateway(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.internetGatewayList = response.data;
      } else {
        this.internetGatewayList = [];
      }
    });
  }
  getVSRXList(condition) {
    this.ecl2Service.allecl2vsrx(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.vsrxList = response.data;
      } else {
        this.vsrxList = [];
      }
    });
  }

  getTenantConnectionList(condition) {
    this.ecl2Service
      .getECL2TenantconnRequestList(condition)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.interconctivityList = _.map(response.data, function (item: any) {
            item.name = item.name + " (" + item.eclstatus + ")";
            return item;
          });
        } else {
          this.interconctivityList = [];
        }
      });
  }

  getZone() {
    this.ecl2Service.byId(this.solutionObj.zoneid).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.zoneList = response.data;
        this.getAmiList();
      } else {
        this.zoneList = [];
      }
    });
  }
  getInstanceTypeList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.ecl2Service.allecl2InstanceType(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.instanceList = response.data;
        } else {
          this.instanceList = [];
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
  getKeysList(condition) {
    let response = {} as any;
    this.ecl2Service.allecl2keypair(condition).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.keysList = response.data;
        } else {
          this.keysList = [];
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }

  getVpcList(condition) {
    let response = {} as any;
    this.ecl2Service.allecl2nework(condition).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.vpcList = response.data;
        } else {
          this.vpcList = [];
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }

  getAmiList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      // tenantlist: [this.userstoragedata.tenantid, 0],
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    if (this.solutionObj.clientid !== -1) {
      query.customerid = this.solutionObj.clientid;
    }
    this.ecl2Service.allecl2sami(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.amiList = response.data;
          this.amiList = _.uniqBy(this.amiList, "ecl2imageid");
        } else {
          this.amiList = [];
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }
  getVolumeList(condition) {
    this.ecl2Service.allecl2volume(condition).subscribe(
      (data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.volumeList = response.data;
        } else {
          this.volumeList = [];
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }

  onChange(event, selindex) {
    if (event != null) {
      this.networks = this.networkingForm.get("networks") as FormArray;
      const valueList: any[] = [];
      const length = this.networks.value.length;
      if (length > 1) {
        for (const formGroup of this.networks.value) {
          valueList.push(formGroup.ecl2networkid.networkid);
        }
        const isUnique =
          valueList.filter((value: any) => value === event.networkid).length ===
          1;
        if (isUnique === false) {
          this.networks.controls[selindex].setValue({
            ecl2networkid: null,
            networkid: null,
          });
          this.networkingForm.updateValueAndValidity();
          this.message.error("Network already exist");
          return false;
        }
      }
    }
  }

  handleCancel() {
    this.isapprovalVisible = false;
  }
  handleOk() {
    let errorMessage: any;
    if (this.approvalForm.status === AppConstant.FORMSTATUS.INVALID) {
      errorMessage = this.commonService.getFormErrorMessage(
        this.approvalForm,
        this.approvalErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.isapprovalVisible = false;
      this.saveConnectionReq();
    }
  }
  saveConnectionReq() {
    this.spinning = true;
    const formdata = {} as any;
    formdata.tenantconnreqobj = [];
    let self = this;
    let sharingObj: any;
    let tenantreq: any;
    sharingObj = this.networkingForm.value.sharedtenants;
    if (!_.isEmpty(sharingObj) && sharingObj.length > 0) {
      sharingObj.forEach((element) => {
        _.map(this.networkingForm.value.networks, function (item: any) {
          tenantreq = {
            tenantid: self.userstoragedata.tenantid,
            customerid: self.solutionObj.clientid,
            destinationecl2tenantid: self.solutionObj.client.ecl2tenantid,
            networkid: item.networkid.networkid,
            ecl2networkid: item.networkid.ecl2networkid,
            region: self.solutionObj.client.ecl2region,
            sourcecustomerid: element.customerid,
            ecl2tenantid: element.ecl2tenantid,
            createdby: self.userstoragedata.fullname,
            createddt: new Date(),
            lastupdatedby: self.userstoragedata.fullname,
            lastupdateddt: new Date(),
          };
          formdata.tenantconnreqobj.push(tenantreq);
        });
      });
    }
    formdata.accesskey = this.approvalForm.value.accesskey;
    formdata.secretkey = this.approvalForm.value.secretkey;
    formdata.admintenantid = this.approvalForm.value.admintenantid;
    formdata.tenantid = this.userstoragedata.tenantid;
    formdata.region = this.solutionObj.client.ecl2region;
    this.ecl2Service.createconnreq(formdata).subscribe(
      (res) => {
        this.spinning = false;
        const response = JSON.parse(res._body);
        if (response.status) {
          this.interConnectivityObj = response.data;
          this.tenantconnectivity = true;
        } else {
          this.interConnectivityObj = {};
          this.tenantconnectivity = false;
          this.message.error(response.message);
        }
      },
      (err) => {
        this.spinning = false;
        this.tenantconnectivity = false;
        this.message.error(AppConstant.VALIDATIONS.ADDERRMSG);
      }
    );
  }

  tenantConnectionReq() {
    this.networks = this.networkingForm.get("networks") as FormArray;
    let shared = this.networkingForm.get("sharedtenants").value;
    if (_.isNull(this.networks.value[0].networkid)) {
      this.message.error("Please Select Network");
    } else if (_.isEmpty(shared)) {
      this.message.error("Please Select " + AppConstant.SUBTENANT);
    } else {
      this.isapprovalVisible = true;
    }
  }
  splitArray(array, val) {
    let a1 = [] as any;
    if (array) {
      array.forEach((element) => {
        a1.push(element[val]);
      });
    }

    return a1;
  }
  addServer(flag) {
    this.loading = true;
    let errorMessage: any;
    let data = this.instanceForm.value;
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
        this.networkErr,
        "networks"
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }

    if (data && data.ecl2volumeid && data.ecl2volumeid.length > 5) {
      this.loading = false;
      this.message.remove();
      this.message.error("Maximum 5 volumes are allowed");
      return false;
    }
    data.scriptid = data.scriptid == null ? -1 : data.scriptid;
    if (data.scriptid != -1 && data.orchid != null) {
      this.loading = false;
      this.message.remove();
      this.message.error("Choose script or orchestration ");
      return false;
    }
    let formdata = {
      tenantid: this.userstoragedata.tenantid,
      solutionid: this.solutionObj.solutionid,
      ...this.instanceForm.value,
      zoneid: 1,
      noofservers: 1,
      tagvalues: this.tagsClone || [],
      keyid: this.keysForm.get("keyid").value,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    } as any;
    let vsrxObj = _.find(this.vsrxList, {
      ecl2vsrxid: formdata.ecl2vsrxid,
    }) as any;
    if (vsrxObj) formdata.vsrxid = vsrxObj.vsrxid;
    let imageObj = _.find(this.amiList, {
      ecl2imageid: formdata.ecl2imageid,
    }) as any;
    if (imageObj) formdata.imageid = imageObj.imageid;
    formdata.volumeid = this.splitArray(formdata.ecl2volumeid, "volumeid");
    formdata.ecl2volumeid = this.splitArray(
      formdata.ecl2volumeid,
      "ecl2volumeid"
    );
    formdata.networkid = [];
    formdata.ecl2networkid = [];
    this.networkingForm.value.networks.forEach((element) => {
      if (element.ecl2networkid) {
        formdata.networkid.push(element.ecl2networkid.networkid);
        formdata.ecl2networkid.push(element.ecl2networkid.ecl2networkid);
      }
    });
    if (this.tagsForm.value.tags.length > 0) {
      let tagDetails = [] as any;
      _.map(this.tagsForm.value.tags, function (obj: any) {
        if (obj.tagkey !== null && obj.tagvalue !== null) {
          tagDetails.push(obj);
          return tagDetails;
        }
      });
      this.tagsForm.value.tags = tagDetails;
      let tags = [] as any;
      tags = !_.isEmpty(this.removeitem)
        ? [...this.tagsForm.value.tags, this.removeitem]
        : this.tagsForm.value.tags;
      if (!_.isEmpty(tags)) {
        formdata.tags = [];
        formdata.tags = tags;
      }
    }
    if (this.networkingForm.value.networks.length > 0) {
      formdata.ecl2internetgatewayid =
        this.networkingForm.value.ecl2internetgatewayid;
      formdata.ecl2vsrxid = this.networkingForm.value.ecl2vsrxid;
      // if (!_.isEmpty(this.interConnectivityObj)) {
      //   formdata.sharedtenants = [this.interConnectivityObj];
      // }
      formdata.sharedtenants = [];
      if (!_.isEmpty(this.selectedInterConnectivity)) {
        formdata.sharedtenants = this.selectedInterConnectivity;
      }
      Object.keys(formdata).forEach(
        (key) => formdata[key] == null && delete formdata[key]
      );
      // if (this.networkingForm.value.tenantsharing === true && !_.isEmpty(this.networkingForm.value.sharedtenants)) {
      //   formdata.tenantconnreqobj = [];
      //   let self = this;
      //   let sharingObj: any;
      //   let tenantreq: any;
      //   console.log(this.networkingForm.value.sharedtenants);
      //   sharingObj = this.networkingForm.value.sharedtenants;
      //   if (!_.isEmpty(sharingObj) && sharingObj.length > 0) {
      //     sharingObj.forEach(element => {
      //       _.map(this.networkingForm.value.networks, function (item: any) {
      //         tenantreq = {
      //           tenantid: self.userstoragedata.tenantid,
      //           customerid: self.solutionObj.clientid,
      //           destinationecl2tenantid: self.solutionObj.client.ecl2tenantid,
      //           networkid: item.networkid.networkid,
      //           ecl2networkid: item.networkid.ecl2networkid,
      //           region: self.solutionObj.client.ecl2region,
      //           sourcecustomerid: element.customerid,
      //           ecl2tenantid: element.ecl2tenantid,
      //           createdby: self.userstoragedata.fullname,
      //           createddt: new Date(),
      //           lastupdatedby: self.userstoragedata.fullname,
      //           lastupdateddt: new Date()
      //         };
      //         formdata.tenantconnreqobj.push(tenantreq);
      //       });
      //     });
      //   }

      // }
    }
    if (
      !_.isEmpty(this.eclSolutionObj) &&
      !_.isUndefined(this.eclSolutionObj) &&
      !_.isNull(this.eclSolutionObj.ecl2solutionid)
    ) {
      formdata.ecl2solutionid = this.eclSolutionObj.ecl2solutionid;
      this.ecl2Service.updateecl2solution(formdata).subscribe(
        (d) => {
          this.loading = false;
          const response = JSON.parse(d._body);
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
          this.loading = false;
          this.message.error(AppConstant.VALIDATIONS.UPDATEERRMSG);
        }
      );
    } else {
      formdata.createdby = this.userstoragedata.fullname;
      formdata.createddt = new Date();
      this.ecl2Service.createecl2solution(formdata).subscribe(
        (d) => {
          this.loading = false;
          const response = JSON.parse(d._body);
          if (response.status) {
            response.sharedtenants = this.networkingForm.value.sharedtenants;
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
          this.loading = false;
          this.message.error(AppConstant.VALIDATIONS.ADDERRMSG);
        }
      );
    }
    console.log(formdata);
  }
  deleteInstance(data) {
    if (data.solutionid !== undefined && data.ecl2solutionid !== undefined) {
      let response = {} as any;
      let formdata = {
        ecl2solutionid: data.ecl2solutionid,
        status: AppConstant.STATUS.INACTIVE,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      };
      this.ecl2Service.updateecl2solution(formdata).subscribe(
        (d) => {
          response = JSON.parse(d._body);
          if (response.status) {
            this.awsSolutionsList = _.filter(
              this.awsSolutionsList,
              function (item) {
                if (_.isEqual(item, data) === false) {
                  return item;
                }
              }
            );
            this.message.success(
              "#" + response.data.solutionid + " Instance removed successfully"
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
    } else {
    }
  }
  serverChange(changes) {
    let index = this.awsSolutionsList.indexOf(changes.data);
    console.log("INSTANCE DETAILS::::::::::::");
    console.log(changes.data);
    if (changes.edit) {
      this.eclSolutionObj = changes.data;
      this.getTags(changes.data.ecl2solutionid);
      this.instanceForm.patchValue(changes.data);
      if (changes.data.ecl2volumeid) {
        let volumelist = [] as any;
        changes.data.ecl2volumeid.forEach((element) => {
          let volumeobj = _.find(this.volumeList, { ecl2volumeid: element });
          volumelist.push(volumeobj);
        });
        this.instanceForm.get("ecl2volumeid").setValue(volumelist);
      }
      this.keysForm.patchValue(changes.data);
      if (!_.isEmpty(changes.data.tags)) {
        let tags = changes.data.tags;
        this.tagsForm = this.fb.group({
          tags: this.fb.array([]),
        });
        this.tagsItems = this.tagsForm.get("tags") as FormArray;
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].resourcetype === AppConstant.CLOUDPROVIDER.ECL2) {
            this.tagsItems.push(this.formTag(tags[i]));
          }
        }
      }
      if (!_.isEmpty(changes.data.ecl2networkid)) {
        let sharedobj = {} as any;
        if (!_.isEmpty(changes.data.sharedtenants)) {
          this.selectedInterConnectivity = changes.data.sharedtenants;
          _.map(changes.data.sharedtenants, function (item) {
            _.map(item, function (value, key) {
              changes.data.sharedtenants = value;
              return changes.data.sharedtenants;
            });
          });
          if (changes.data.sharedtenants) {
            sharedobj = _.find(this.interconctivityList, {
              ecltenantconnrequestid: changes.data.sharedtenants,
            });
          }
          // changes.data.sharedtenants.forEach(element => {
          //   _.map(this.subtenantList, function (item: any) {
          //     if (element.sourcecustomerid === item.customerid) {
          //       sharedobj.push(item);
          //     }
          //   });
          // });
        }
        this.networkingForm = this.fb.group({
          internetgatewayid: changes.data.internetgatewayid,
          ecl2internetgatewayid: changes.data.ecl2internetgatewayid,
          ecl2vsrxid: changes.data.ecl2vsrxid,
          vsrxid: changes.data.vsrxid,
          tenantsharing: !_.isEmpty(changes.data.sharedtenants) ? true : false,
          sharedtenants: !_.isEmpty(changes.data.sharedtenants)
            ? sharedobj
            : null,
          tenantconnectionrequests: !_.isEmpty(changes.data.sharedtenants)
            ? sharedobj
            : null,
          //sharedtenants: (!_.isEmpty(changes.data.tenantconnectionrequests)) ? sharedobj : null,
          networks: this.fb.array([]),
        });
        let networkList = changes.data.ecl2networkid;
        this.networks = this.networkingForm.get("networks") as FormArray;
        networkList.forEach((obj) => {
          this.networks.push(
            this.createNetwork(_.find(this.vpcList, { ecl2networkid: obj }))
          );
        });
        this.approvalForm = this.fb.group({
          accesskey: ["", Validators.required],
          secretkey: ["", Validators.required],
          admintenantid: ["", Validators.required],
        });
      }
    }
  }
  notifyScriptEntry(event) {
    if (this.scriptObj !== undefined && !_.isEmpty(this.scriptObj)) {
      const index = _.indexOf(this.scriptsList, this.scriptObj);
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
    if (this.amiObj !== undefined && !_.isEmpty(this.amiObj)) {
      const index = _.indexOf(this.amiList, this.amiObj);
      this.amiList[index] = event;
      this.amiList = _.filter(this.amiList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.amiList = [...this.amiList, event];
      this.instanceForm.controls["ecl2imageid"].setValue(event.ecl2imageid);
      this.instanceForm.controls["imageid"].setValue(event.imageid);
    }
    this.modalVisible = false;
  }
  notifyVpcEntry(event) {
    if (
      this.neworkObj !== undefined &&
      !_.isEmpty(this.neworkObj) &&
      !_.isUndefined(this.neworkObj.networkid)
    ) {
      const index = _.indexOf(this.vpcList, this.neworkObj);
      this.vpcList[index] = event;
      this.vpcList = _.filter(this.vpcList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.vpcList = [...this.vpcList, event];
      this.networks = this.networkingForm.get("networks") as FormArray;
      const index = this.networks.value.findIndex(
        (obj) => obj.ecl2networkid == null
      );
      this.networks.controls[index].setValue({
        ecl2networkid: event.ecl2networkid,
      });
    }
  }

  notifyKeysEntry(event) {
    if (
      this.keyObj !== undefined &&
      !_.isEmpty(this.keyObj) &&
      !_.isUndefined(this.keyObj.keyid)
    ) {
      const index = _.indexOf(this.keysList, this.keyObj);
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

  notifyVolumeEntry(event) {
    this.volumeList = [...this.volumeList, event];
    this.modalVisible = false;
  }

  // Tagging Related code
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

  onConnReqChange(event: any) {
    this.selectedInterConnectivity = [];
    let result = {};
    result[event.customerid] = [
      {
        sourcecustomerid: event.customerid,
        networkid: event.networkid,
        ecl2networkid: event.ecl2networkid,
        ecl2tenantid: event.ecl2tenantidother,
        tenantconnrequestid: event.tenantconnrequestid,
        ecltenantconnrequestid: event.ecltenantconnrequestid,
      },
    ];
    this.selectedInterConnectivity.push(result);
  }
}
