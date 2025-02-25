import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import { DeploymentsService } from "../deployments.service";
import { CommonService } from "../../../modules/services/shared/common.service";
import { ParametersService } from "../../admin/parameters/parameters.service";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../app.constant";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
// import { Socket } from 'ngx-socket-io';
import { SrmService } from "../../srm/srm.service";
import { AWSService } from "../aws/aws-service";
import { SolutionService } from "../../tenants/solutiontemplate/solution.service";
import { Ecl2Service } from "../ecl2/ecl2-service";
import { TagValueService } from "../../base/tagmanager/tagvalue.service";
import { TagService } from "../../base/tagmanager/tags.service";
import { TenantsService } from "../../tenants/tenants.service";
@Component({
  selector: "app-deploysolution",
  templateUrl:
    "../../../presentation/web/deployments/deploysolution/deploysolution.component.html",
  styles: [
    `
      .ant-form {
        margin-top: 1rem;
      }
    `,
  ],
})
export class DeploySolutionComponent implements OnInit {
  // Socket
  subtenantLable = AppConstant.SUBTENANT;
  sgList: any[] = [];
  socketmsgs: any[] = [];
  scriptParamsList = {} as any;
  scriptlist: any[] = [];
  isVisible = false;
  deploymentForm: FormGroup;
  solutionList: any[] = [];
  clientList: any[] = [];
  zoneList: any[] = [];
  rightbar: Boolean = true;
  showTable: Boolean = true;
  selectedTemplate: any = {};
  solutionid: number;
  solutionData: any = {};
  ecl2SolutionObj: any = {};
  showparaneters: any = false;
  showSummary: Boolean = false;
  summaryLoading: Boolean = false;
  customerObj = {} as any;
  serviceObj = {} as any;
  service = false;
  virtualipEnabled = false;
  costInput: any = {};
  costList: any = [];
  totalCost: any;
  ecl2ZoneList: any[] = [];
  deploymentErrObj = {
    solution: { required: "Please select solution template" },
    client: { required: "Please select client" },
    zone: { required: "Please select zone" },
    network: { required: "Please select network" },
    servername: { required: "Please enter instance name" },
    fieldvalue: { required: "Please enter parameter value" },
    fielddata: { required: "Please enter parameter value" },
  };
  parameterInput: any = {};
  parameterArray: FormArray;
  labelParams = [];
  userstoragedata = {} as any;
  // Table
  sortValue = null;
  sortName = null;
  originalData = [];
  paramsList = [];
  paramsHeader: any[] = [];
  confirmationWindow: boolean;
  costVisualHeader: any[] = [];
  tableConfig = {} as any;
  costtableConfig = {} as any;
  viewData = [];
  srvrequestid: any;
  loading = false;
  showmessage = false;
  formdata: any = {};
  spinning = false;
  summaryTitle = "Solution Summary";
  panelName = AppConstant.VALIDATIONS.DEPLOYMENT.SHOWMORE;
  costpanelName = AppConstant.VALIDATIONS.DEPLOYMENT.SHOWMORE;
  panels = [
    {
      active: false,
      disabled: false,
      name: AppConstant.VALIDATIONS.DEPLOYMENT.SHOWMORE,
      childPannel: [
        {
          active: false,
          disabled: true,
          name: "Parameters",
        },
      ],
    },
  ];
  costpanel = [
    {
      active: false,
      disabled: false,
      name: AppConstant.VALIDATIONS.DEPLOYMENT.SHOWMORE,
      childPannel: [
        {
          active: false,
          disabled: true,
          name: "Cost Visualisation",
        },
      ],
    },
  ];
  variablesList: any[];
  zoneObj: any = {};
  cloudprovider: any = "AWS";
  networkselection = false;
  networkList: any = [];
  amiList: any = [];
  vsrxList: any = [];
  volumeList: any = [];
  vpcList: any = [];
  loadbalancerList: any = [];
  current = 0;

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

  tagTypes = [];
  selectedTagType;
  tags = [];
  tagsClone = [];
  tagsList = [];

  variablesToGet = [];
  scriptParamsData = [];

  resourceId = null;
  refId = null;
  resourceType = null;
  cloudProvider = null;
  isTemplateValid = true;

  // FIXME: Remove this
  isGroupShare = false;
  modalVisible = false;
  sgObj = {};
  awsvpcList: any[] = [];
  vpcVisible = false;
  vpcObj = {};
  subnetList: any[] = [];
  subnetVisible = false;
  subnetObj = {};
  lbList: any[] = [];
  lbobj = {} as any;
  lbVisible = false;
  regionList: any = [];
  constructor(
    // private socket: Socket,
    public router: Router,
    private notificationService: NzNotificationService,
    private deploysltnService: DeploymentsService,
    private commonService: CommonService,
    private awsService: AWSService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private parameterService: ParametersService,
    private solutionService: SolutionService,
    private localStorageService: LocalStorageService,
    private routes: ActivatedRoute,
    private srmService: SrmService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private ecl2Service: Ecl2Service,
    private tenantsService: TenantsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.solutionList = [];
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.srvrequestid = params.id;
        this.service = true;
        this.getServiceRequestDetail(params.id);
      } else {
        this.getAllTemplates();
      }
    });
    this.clientList = [];
    this.zoneList = [];
    this.tableConfig = {
      edit: false,
      delete: false,
      globalsearch: false,
      loading: false,
      pagination: true,
      pageSize: 4,
      scroll: { x: "1000px" },
      title: "",
      widthConfig: ["25px", "25px", "25px", "30px", "25px", "25px"],
    };
  }
  ngOnInit() {
    this.getSgList();
    this.getAWSVpcList();
    this.getAWSLBList();
    this.getTemplateScriptParameters();
    this.deploymentForm = this.fb.group({
      solution: [null, Validators.required],
      client: [null, Validators.required],
      network: [null],
      imageid: [null],
      ecl2imageid: [null],
      awsamiid: [null],
      volumeid: [null],
      ecl2volumeid: [null],
      networkid: [null],
      ecl2networkid: [null],
      vsrx: [null],
      // autocreatesg: true,
      securitygroupid: [null],
      vpcid: [null],
      subnetid: [null],
      awssecuritygroupid: [null],
      awsvpcid: [null],
      awssubnetd: [null],
      lbid: [null],
      servername: [null, Validators.required],
      arn: [null],
      // serverlogin: [null],
      // serverpwd: [null],
      zone: [null, Validators.required],
      virtualipaddress: [""],
      notes: [""],
      parameterArray: this.fb.array([]),
    });
    this.getAllClients();
    this.paramsHeader = [
      { field: "scriptname", header: "Script", datatype: "string" },
      { field: "fieldname", header: "Name", datatype: "string" },
      { field: "fieldvalue", header: "Value", datatype: "string" },
      { field: "notes", header: "Notes", datatype: "string" },
      { field: "createdby", header: "Created By", datatype: "string" },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
  }
  openForm(flag) {
    let data: any;
    if (flag == "SG") {
      this.modalVisible = true;
      this.sgObj = {};
      data = this.deploymentForm.get("awssecuritygroupid").value;
      if (data != null && data != undefined) {
        this.sgObj = _.find(this.sgList, { awssecuritygroupid: data });
      }
    }
    if (flag == "VPC") {
      this.vpcVisible = true;
      this.vpcObj = {};
      data = this.deploymentForm.get("awsvpcid").value;
      if (data != null && data != undefined) {
        this.vpcObj = _.find(this.awsvpcList, { awsvpcid: data });
      }
    }
    if (flag == "Subnet") {
      this.subnetVisible = true;
      this.subnetObj = {};
      data = this.deploymentForm.get("awssubnetd").value;
      if (data != null && data != undefined) {
        this.subnetObj = _.find(this.subnetList, { awssubnetd: data });
      }
    }
    if (flag == "LB") {
      this.lbVisible = true;
      this.lbobj = {};
      data = this.deploymentForm.get("lbid").value;
      if (data != null && data != undefined) {
        this.lbobj = _.find(this.lbList, { lbid: data });
        this.lbobj.awssolution = [];
        this.lbobj.listeners = JSON.parse(this.lbobj.listeners);
        this.lbobj.awssolution = this.solutionData.awssolutions;
      }
    }
  }
  notifyVpcEntry(event) {
    if (this.vpcObj != undefined && !_.isEmpty(this.vpcObj)) {
      let index = _.indexOf(this.vpcList, this.vpcObj);
      this.vpcList[index] = event;
      this.vpcList = _.filter(this.vpcList, function (i) {
        if (i) {
          return i;
        }
      });
    } else {
      this.vpcList = [...this.vpcList, event];
      this.deploymentForm.controls["vpcid"].setValue(event.vpcid);
      this.deploymentForm.controls["awsvpcid"].setValue(event.awsvpcid);
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
      this.deploymentForm.controls["subnetid"].setValue(event.subnetid);
      this.deploymentForm.controls["awssubnetd"].setValue(event.awssubnetd);
    }
    this.modalVisible = false;
  }
  getAWSLBList() {
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawslb(query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.lbList = response.data;
        } else {
          this.lbList = [];
        }
      },
      (err) => {}
    );
  }
  getAWSVpcList() {
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
          this.awsvpcList = response.data.map((o) => {
            o.vpcname =
              o.tenantregion && o.tenantregion.length > 0
                ? o.vpcname + " (" + o.tenantregion[0].region + ")"
                : o.vpcname;
            return o;
          });
        } else {
          this.awsvpcList = [];
        }
      },
      (err) => {}
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
      let vpc = _.find(this.vpcList, { awsvpcid: id }) as any;
      if (vpc) query.vpcid = vpc.vpcid;
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
        console.log(err);
      }
    );
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
      this.deploymentForm.controls["securitygroupid"].setValue(
        event.securitygroupid
      );
      this.deploymentForm.controls["awssecuritygroupid"].setValue(
        event.awssecuritygroupid
      );
    }
    this.modalVisible = false;
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
      (err) => {}
    );
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.costList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.costList = data;
    }
  }
  clearForm() {
    this.deploymentForm.reset();
    this.labelParams = [];
    this.costList = [];
  }
  getParamsList(options) {
    this.paramsList = [];
    let response = {} as any;
    this.parameterService.getParamsList(options).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        let variableParams = [];
        // let variableParams = response.data.filter(o => {
        //   return o['paramtype'] == 'Variable';
        // });
        console.log(
          "Extracting scripts params data >>>>>>>>>>>>>>>>>>>>>>>>>>"
        );
        console.log(response);
        this.scriptParamsData = response.data.filter((o) => {
          if (
            o["variable"] &&
            o["variable"]["datatype"] &&
            o["variable"]["datatype"] == "list"
          ) {
            o["variable"]["fieldoptions"] = JSON.parse(o.variable.fieldoptions);
          }
          variableParams.push(o["variable"]);
          return o["paramtype"] == "Script";
        });
        if (variableParams.length > 0) {
          this.variablesToGet = _.uniqBy(variableParams, "fieldname");
        } else {
          this.variablesToGet = [];
        }
        console.log("Variables to get >>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(this.variablesToGet);
        if (options.paramtype == "Script") {
          let data = response.data;
          data = _.filter(data, function (item) {
            if (
              _.includes(item.fieldvalue, "{{") &&
              _.includes(item.fieldvalue, "}}")
            ) {
              return item;
            }
          });
          data = _.uniqBy(data, "fieldvalue");
          this.labelParams = [];

          for (let i = 0; i < data.length; i++) {
            let variableObj = {} as any;
            variableObj = _.find(this.variablesList, function (item) {
              if (_.includes(data[i].fieldvalue, item.fieldname)) {
                return item;
              }
            });
            if (variableObj != undefined) {
              this.addArrayItem(variableObj);
            }
          }
          response.data.forEach((item) => {
            if (item.script != null) {
              item.scriptname = item.script.scriptname;
            }
          });
          this.paramsList = response.data;
          this.scriptParamsList = {
            script: _.groupBy(
              _.orderBy(response.data, ["orderno"]),
              "scriptid"
            ),
          };
        } else {
          this.variablesList = response.data;
        }
      } else {
        this.paramsList = [];
        this.variablesList = response.data;
      }
    });
  }
  createArrayItem(data): FormGroup {
    let arrayObj = {} as any;
    arrayObj = {
      fieldname: [data.fieldname],
      fielddata: ["", Validators.required],
    };
    return this.fb.group(arrayObj);
  }
  addArrayItem(data): void {
    this.parameterArray = this.deploymentForm.get(
      "parameterArray"
    ) as FormArray;
    data.label = "fielddata";
    let existingData = {} as any;
    existingData = _.find(this.labelParams, { fieldvalue: data.fieldvalue });
    if (existingData == undefined) {
      this.labelParams.push(data);
      this.parameterArray.push(this.createArrayItem(data));
    }
    // this.labelParams = _.uniqBy(this.labelParams, 'fieldname');
  }
  getAllClients() {
    this.clientList = [];
    this.commonService
      .allCustomerAccount(
        {
          status: AppConstant.STATUS.ACTIVE,
          tenantid: this.userstoragedata.tenantid,
        },
        `?customer=${true}`
      )
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.clientList = response.data.filter((o) => {
            if (o.customer != null) {
              o.customername = o.customer
                ? o.customer.customername + " (" + o.name + ")"
                : "";
              return o;
            }
          });
        }
      });
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
  getAllRegions() {
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.deploymentForm.controls["client"].value) {
      condition["customerid"] =
        this.deploymentForm.controls["client"].value.customerid;
      condition["_accountid"] = this.deploymentForm.controls["client"].value.id;
    }
    this.tenantsService.allRegions(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.regionList = response.data;
      }
    });
  }
  getAllTemplates() {
    this.loading = true;
    this.deploysltnService
      .allTemplates({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.solutionList = response.data;
          this.loading = false;
        } else {
          this.solutionList = [];
          this.loading = false;
        }
      });
  }
  onTemplateChange(data) {
    this.labelParams = [];
    this.paramsList = [];
    this.tagTypes = [];
    this.tags = [];
    this.tagsClone = [];
    this.costList = [];
    this.deploymentForm.controls["zone"].setValue(null);
    if (data) {
      this.selectedTemplate = {};
      this.customerObj = {};
      this.zoneObj = {};
      this.cloudprovider = data.cloudprovider;
      console.log(this.cloudProvider, "**********************");
      this.getTags(data.solutionid);
      this.selectedTemplate = _.find(this.solutionList, {
        solutionid: data.solutionid,
      });
      if (this.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
        const condition = {
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
        } as any;
        this.getVpcList(condition);
        this.getVSRXList(condition);
        this.getlbList(condition);
      }
      this.getAmiList();
      this.getVolumeList({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      });
      if (
        this.selectedTemplate.clientid != null &&
        this.selectedTemplate.clientid != undefined &&
        this.srvrequestid == undefined
      ) {
        this.customerObj = _.find(this.clientList, {
          customerid: this.selectedTemplate.clientid,
        });
        this.deploymentForm.controls["client"].setValue(this.customerObj);
      }
      if (this.cloudprovider == AppConstant.CLOUDPROVIDER.ECL2) {
        this.getECL2Zones(data);
        this.getECl2SolutionById(data.solutionid);
      } else {
        this.getAllZones();
        this.deploymentForm.controls["zone"].setValue(null);
        this.getSolutionDetailById(data.solutionid);
      }
    }
  }
  onCustomerChange(event) {
    this.networkselection = false;
    this.deploymentForm.get("network").clearValidators();
    this.deploymentForm.get("network").setValue(null);
    this.deploymentForm.updateValueAndValidity();
    let data = this.deploymentForm.value;
    this.getAllRegions();
    if (
      data.solution.clientid !== event.customerid &&
      this.cloudprovider === AppConstant.CLOUDPROVIDER.ECL2
    ) {
      const condition = {
        tenantid: this.userstoragedata.tenantid,
        customerid: event.customerid,
        zoneid: this.deploymentForm.controls["solution"].value.zoneid,
        status: AppConstant.STATUS.ACTIVE,
      };
      this.deploymentForm.get("network").setValue(null);
      this.deploymentForm.get("network").setValidators(Validators.required);
      this.deploymentForm.updateValueAndValidity();
      this.getNetworkList(condition);
      this.networkselection = true;
    }
  }

  getNetworkList(condition) {
    this.ecl2Service.allecl2nework(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.networkList = response.data;
      } else {
        this.networkList = [];
      }
    });
  }
  getECL2Zones(data) {
    this.ecl2Service
      .allecl2Zones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.ecl2ZoneList = response.data;
          if (
            data.zoneid != null &&
            data.zoneid != -1 &&
            !_.isNull(data.zone)
          ) {
            this.zoneObj = _.find(this.ecl2ZoneList, {
              zoneid: this.selectedTemplate.zoneid,
            });
            this.deploymentForm.controls["zone"].setValue(this.zoneObj);
          }
        } else {
          this.ecl2ZoneList = [];
        }
      });
  }
  getECl2SolutionById(id) {
    this.spinning = true;
    this.virtualipEnabled = false;
    this.solutionid = id;
    this.summaryLoading = true;
    this.solutionService.ecl2byId(this.solutionid).subscribe((result) => {
      this.spinning = false;
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.solutionData = response.data;
        if (this.solutionData && this.solutionData.ecl2solutions) {
          let data = this.solutionData.ecl2solutions[0];
          console.log(data);
          this.deploymentForm
            .get("ecl2imageid")
            .setValue(data.ecl2images ? data.ecl2images.ecl2imageid : null);
          this.deploymentForm
            .get("ecl2volumeid")
            .setValue(data.ecl2volumeid ? data.ecl2volumeid : null);
          this.deploymentForm
            .get("ecl2networkid")
            .setValue(data.ecl2networks ? data.ecl2networkid : null);
          this.deploymentForm
            .get("vsrx")
            .setValue(data.ecl2vsrx ? data.ecl2vsrx.vsrxid : null);
          this.deploymentForm.updateValueAndValidity();
        }
        this.ecl2SolutionObj = response.data;
        this.tagTypes.push({
          title: "Solution",
          cndtn: {
            resourceid: response.data.solutionid,
            status: AppConstant.STATUS.ACTIVE,
            resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[0],
            cloudprovider: response.data.cloudprovider,
          },
        });
        response.data.ecl2solutions.forEach((element) => {
          this.tagTypes.push({
            title: element.instancename,
            cndtn: {
              resourceid: response.data.solutionid,
              refid: element.ecl2solutionid,
              resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[1],
              cloudprovider: response.data.cloudprovider,
              status: AppConstant.STATUS.ACTIVE,
            },
          });
          // if (element.scriptid != -1) {
          //   this.showparaneters = true;
          // }
        });
        if (
          !_.isEmpty(response.data.ecl2loadbalancers) &&
          _.isEmpty(response.data.ecl2loadbalancers[0].attachedservers)
        ) {
          this.virtualipEnabled = true;
        }
        this.viewData = response.data;
        // if (this.deploymentForm.controls['zone'].value == undefined) {
        //   this.zoneObj = _.find(this.ecl2ZoneList, { zoneid: this.solutionData.zoneid });
        //   this.deploymentForm.controls['zone'].setValue(this.zoneObj);
        // }

        // FIXME: To Be Removed
        // console.log("Solution Details::::::::::");
        // if (this.viewData['tenant']['customfield'] && this.viewData['tenant']['customfield'].length > 0) {
        //   let fields = this.viewData['tenant']['customfield'].find(o => o['fieldoptions'] == 'GROUPSHARE' && o['templateid'] == this.viewData['solutionid']);
        //   if (fields != undefined) {
        //     this.isGroupShare = true;
        //   } else {
        //     this.isGroupShare = false;
        //   }
        // } else {
        //   this.isGroupShare = false;
        // }

        let scriptsList = [];

        response.data.ecl2solutions.forEach((solution) => {
          if (solution && solution["orchestration"]) {
            let s = JSON.parse(solution["orchestration"]["scripts"]);
            s.forEach((script) => {
              scriptsList.push(script["scriptid"]);
            });
          }
        });
        this.scriptlist = _.map(
          response.data.ecl2solutions,
          _.property("scriptid")
        );
        // this.showSummary = true;
        this.summaryLoading = false;
        if (!_.isEmpty(scriptsList)) {
          this.parameterInput = {
            paramtypes: ["Script", "Variable"],
            scriptlist: scriptsList || [],
            status: AppConstant.STATUS.ACTIVE,
            fieldoption: "Optional",
            tenantid: this.userstoragedata.tenantid,
          };
          this.getParamsList(this.parameterInput);
        }
        // else {
        //   this.parameterInput = {
        //     paramtype: 'Variable',
        //     status: AppConstant.STATUS.ACTIVE,
        //     tenantid: this.userstoragedata.tenantid
        //   };
        //   this.getParamsList(this.parameterInput);
        // }
      }
    });
  }
  getTemplateScriptParameters() {
    this.loading = true;
    const options = {
      paramtype: "Variable",
      status: AppConstant.STATUS.ACTIVE,
      fieldoption: "Optional",
      tenantid: this.userstoragedata.tenantid,
    };
    let response = {} as any;
    this.parameterService.getParamsList(options).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.variablesList = response.data;
        this.loading = false;
      } else {
        this.variablesList = [];
        this.loading = false;
      }
    });
  }
  getSolutionDetailById(val) {
    this.solutionid = val;
    this.summaryLoading = true;
    this.solutionService.byId(this.solutionid).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.solutionData = response.data;
        if (this.solutionData && this.solutionData.awssolutions) {
          let data = this.solutionData.awssolutions[0];
          console.log(data);
          console.log(this.amiList);
          let volumeid = _.map(data.volumes, _.property("volumeid"));
          this.deploymentForm
            .get("awsvpcid")
            .setValue(data.awsvpcid ? data.awsvpcid : null);
          this.deploymentForm
            .get("awssubnetd")
            .setValue(data.awssubnetd ? data.awssubnetd : null);
          this.deploymentForm
            .get("awssecuritygroupid")
            .setValue(data.awssecuritygroupid ? data.awssecuritygroupid : null);
          this.deploymentForm
            .get("lbid")
            .setValue(data.lbid ? data.lbid : null);
          this.deploymentForm
            .get("awsamiid")
            .setValue(data.awsamiid ? data.awsamiid : null);
          this.deploymentForm
            .get("volumeid")
            .setValue(volumeid ? volumeid : null);
          this.deploymentForm.updateValueAndValidity();
        }
        this.tagTypes.push({
          title: "Solution",
          cndtn: {
            resourceid: response.data.solutionid,
            status: AppConstant.STATUS.ACTIVE,
            resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[0],
            cloudprovider: response.data.cloudprovider,
          },
        });
        response.data.awssolutions.forEach((element) => {
          this.tagTypes.push({
            title: element.instancename,
            cndtn: {
              resourceid: response.data.solutionid,
              refid: element.awssolutionid,
              resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[1],
              cloudprovider: response.data.cloudprovider,
              status: AppConstant.STATUS.ACTIVE,
            },
          });
          // if (element.scriptid != -1) {
          //   this.showparaneters = true;
          // }
        });
        this.viewData = response.data;
        this.scriptlist = _.map(
          response.data.awssolutions,
          _.property("scriptid")
        );
        // this.showSummary = true;
        this.summaryLoading = false;

        let scriptsList = [];

        response.data.awssolutions.forEach((solution) => {
          if (solution && solution["orchestration"]) {
            let s = JSON.parse(solution["orchestration"]["scripts"]);
            s.forEach((script) => {
              scriptsList.push(script["scriptid"]);
            });
          }
        });
        this.scriptlist = _.map(
          response.data.ecl2solutions,
          _.property("scriptid")
        );
        // this.showSummary = true;
        this.summaryLoading = false;
        if (!_.isEmpty(scriptsList)) {
          this.parameterInput = {
            paramtypes: ["Script", "Variable"],
            fieldoption: "Optional",
            scriptlist: scriptsList || [],
            status: AppConstant.STATUS.ACTIVE,
            tenantid: this.userstoragedata.tenantid,
          };
          this.getParamsList(this.parameterInput);
        }

        this.getCostList("");
      }
    });
  }
  getCostList(inputData) {
    if (
      !_.isEmpty(this.solutionData) &&
      this.solutionData.cloudprovider == "AWS" &&
      !_.isEmpty(this.solutionData.awssolutions)
    ) {
      this.costInput = {
        unit: "Hrs",
        Tenancy: "Shared",
        location: !_.isEmpty(inputData)
          ? inputData.zonename
          : "US West (Oregon)",
        Offering_class: "standard",
        leaseContract_length: "1yr",
        Purchase_option: "No Upfront",
      };
      let instancetypes = [];
      let operatingsystems = [];
      if (!_.isEmpty(this.solutionData.awssolutions)) {
        _.map(this.solutionData.awssolutions, function (obj: any) {
          instancetypes.push(
            !_.isEmpty(obj.awsinsttype) ? obj.awsinsttype.instancetypename : []
          );
          operatingsystems.push(
            !_.isEmpty(obj.awsami) ? obj.awsami.platform : []
          );
          return [instancetypes, operatingsystems];
        });
      }
      this.costInput.instancetypes = !_.isEmpty(instancetypes)
        ? instancetypes
        : [];
      this.costInput.operatingsystems = !_.isEmpty(operatingsystems)
        ? operatingsystems
        : [];

      this.deploysltnService.getCostVisualList(this.costInput).subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          if (!_.isEmpty(this.solutionData.awssolutions)) {
            let length = this.solutionData.awssolutions.length;
          }
          if (response.status) {
            let arr = [];
            let list = [];
            response.data.forEach((element) => {
              _.map(this.solutionData.awssolutions, function (item: any) {
                if (
                  element.Instance_Type === item.awsinsttype.instancetypename &&
                  element.OperatingSystem === item.awsami.platform &&
                  element.Location ===
                    (!_.isEmpty(inputData)
                      ? inputData.zonename
                      : "US West (Oregon)")
                ) {
                  item.instancename = item.instancename;
                  item.costperhour = Number(element.PricePer_Unit);
                  item.costpermonth = (
                    24 *
                    Number(element.PricePer_Unit) *
                    30
                  ).toFixed(4);
                  arr.push(item);
                }
                length--;
                if (length == 0) {
                  return arr;
                }
              });
            });
            let newarr = [];
            let existingList = _.map(arr, function (obj: any) {
              return obj.awssolutionid;
            });
            let awssolutionList = _.map(
              this.solutionData.awssolutions,
              function (obj: any) {
                return obj.awssolutionid;
              }
            );
            let differceList = _.difference(awssolutionList, existingList);
            let newlength = differceList.length;
            if (arr.length != this.solutionData.awssolutions.length) {
              differceList.forEach((item) => {
                _.map(this.solutionData.awssolutions, function (obj: any) {
                  if (obj.awssolutionid == item) {
                    obj.instancename = obj.instancename;
                    obj.costperhour = "";
                    obj.costpermonth = "";
                    newarr.push(obj);
                    newlength--;
                    if (newlength == 0) {
                      return newarr;
                    }
                  }
                });
              });
              let test = [];
              test = arr.concat(newarr);
              list = _.uniqBy(test, function (obj: any) {
                return obj.awssolutionid;
              });
              this.costList = list;
              this.originalData = this.costList;
              this.totalCost = _.sumBy(arr, function (obj: any) {
                return Number(obj.costpermonth);
              });
            }
            if (arr.length == this.solutionData.awssolutions.length) {
              this.costList = arr;
              this.originalData = this.costList;
              this.totalCost = _.sumBy(arr, function (obj: any) {
                return Number(obj.costpermonth);
              });
            }
          } else {
            let array = [];
            let length = this.solutionData.awssolutions.length;
            _.map(this.solutionData.awssolutions, function (item: any) {
              item.instancename = item.instancename;
              item.costperhour = "";
              item.costpermonth = "";
              array.push(item);
              length--;
              if (length == 0) {
                return array;
              }
            });
            this.costList = array;
            this.totalCost = "";
            this.showmessage = true;
          }
        },
        (err) => {
          this.costList = [];
        }
      );
    }
  }
  saveDeployment(data, template) {
    let errorMessage: any;
    if (this.deploymentForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.deploymentForm,
        this.deploymentErrObj,
        "parameterArray"
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    }
    let formData = {} as any;
    if (this.solutionData.ecl2solutions) {
      let vsrxObj = _.find(this.vsrxList, {
        ecl2vsrxid: data.ecl2vsrxid,
      }) as any;
      if (vsrxObj) this.solutionData.ecl2solutions[0].ecl2vsrx = vsrxObj.vsrxid;
      let imageObj = _.find(this.amiList, {
        ecl2imageid: data.ecl2imageid,
      }) as any;
      if (imageObj)
        this.solutionData.ecl2solutions[0].imageid = imageObj.imageid;
      let networks = [] as any;
      if (data.ecl2networkid) {
        data.ecl2networkid.forEach((element) => {
          let obj = this.vpcList.find((o) => o.ecl2networkid == element);
          networks.push(obj);
        });
      }
      this.solutionData.ecl2solutions[0].ecl2images = data.ecl2imageid
        ? this.amiList.find((o) => o.ecl2imageid == data.ecl2imageid)
        : null;
      this.solutionData.ecl2solutions[0].volumeid = [];
      this.solutionData.ecl2solutions[0].ecl2networks = networks;
      this.solutionData.ecl2solutions[0].ecl2vsrx = data.vsrx
        ? this.vsrxList.find((o) => o.vsrxid == data.vsrx)
        : null;
      this.solutionData.ecl2solutions[0].volumes = [];
      if (data.ecl2volumeid) {
        data.ecl2volumeid.forEach((element) => {
          let volume = this.volumeList.find((o) => o.ecl2volumeid == element);
          if (volume) {
            this.solutionData.ecl2solutions[0].volumes.push(volume);
            this.solutionData.ecl2solutions[0].volumeid.push(volume.volumeid);
          }
        });
      }
    }
    if (this.solutionData.awssolutions) {
      let imageObj = _.find(this.amiList, { awsamiid: data.awsamiid }) as any;
      if (imageObj) this.solutionData.awssolutions[0].amiid = imageObj.amiid;
      let vpcObj = _.find(this.vpcList, { awsvpcid: data.awsvpcid }) as any;
      if (vpcObj) this.solutionData.awssolutions[0].vpcid = vpcObj.vpcid;
      let subnetObj = _.find(this.subnetList, {
        awssubnetd: data.awssubnetd,
      }) as any;
      if (subnetObj)
        this.solutionData.awssolutions[0].subnetid = subnetObj.subnetid;
      let sgObj = _.find(this.sgList, {
        awssecuritygroupid: data.awssecuritygroupid,
      }) as any;
      if (sgObj)
        this.solutionData.awssolutions[0].securitygroupid =
          sgObj.securitygroupid;
      this.solutionData.awssolutions[0].awsami = data.awsamiid
        ? this.amiList.find((o) => o.awsamiid == data.awsamiid)
        : null;
      this.solutionData.awssolutions[0].awsvpcid = data.awsvpcid
        ? data.awsvpcid
        : null;
      this.solutionData.awssolutions[0].awssubnetd = data.awssubnetd
        ? data.awssubnetd
        : null;
      this.solutionData.awssolutions[0].awssecuritygroupid =
        data.awssecuritygroupid ? data.awssecuritygroupid : null;
      this.solutionData.awssolutions[0].lbid = data.lbid ? data.lbid : null;
      this.solutionData.awssolutions[0].arn = data.arn ? data.arn : null;
      this.solutionData.awssolutions[0].volumeid = [];
      this.solutionData.awssolutions[0].volumes = [];
      if (data.volumeid) {
        data.volumeid.forEach((element) => {
          let volume = this.volumeList.find((o) => o.volumeid == element);
          if (volume) {
            this.solutionData.awssolutions[0].volumes.push(volume);
            this.solutionData.awssolutions[0].volumeid.push(volume.volumeid);
          }
        });
      }
    }
    formData = {
      solutionid: data.solution.solutionid,
      tenantid: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.tenantid,
      requestid: _.isEmpty(this.srvrequestid) ? -1 : Number(this.srvrequestid),
      zoneid: _.isEmpty(data.zone) ? -1 : data.zone.tnregionid,
      zonename: _.isEmpty(data.zone) ? "" : data.zone.region,
      virtualipaddress: data.virtualipaddress,
      region: _.isEmpty(data.zone) ? "" : data.zone.region,
      clientid: data.client.customerid,
      ecl2tenantid: data.client.ecl2tenantid,
      customername: data.client.customername,
      tenantname: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.tenant.tenantname,
      notes: data.notes,
      status: AppConstant.STATUS.ACTIVE,
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      // parameters: data.parameterArray,
      solution: this.solutionData,
    };
    console.log("scriptParamsData >>>>>>>>>>>>>>>>>>");
    console.log(this.scriptParamsData);
    if (this.scriptParamsData.length > 0) {
      let t = {} as any;
      this.scriptParamsData.map((o) => {
        if (o["fieldvalue"] != null && o["fieldvalue"].includes("v_")) {
          let input = this.variablesToGet.find(
            (v) => v["fieldname"] == o["fieldvalue"]
          );
          if (input && input.fieldvalue) o["fieldvalue"] = input.fieldvalue;
        }
        if (o["script"] && o["script"]["scriptname"]) {
          if (t[o["script"]["scriptname"]]) {
            t[o["script"]["scriptname"]]["scriptparams"][o["orderno"]] =
              o["fieldvalue"];
          } else {
            t[o["script"]["scriptname"]] = {} as any;
            t[o["script"]["scriptname"]]["scriptparams"] = [] as any;
            t[o["script"]["scriptname"]]["scriptparams"][o["orderno"]] =
              o["fieldvalue"];
          }
        }
      });
      formData.solution["scriptparameters"] = _.cloneDeep(t);
      // let obj = this.variablesToGet.find((v) => v["fieldname"] == "v_aduser");
      // let domain = this.variablesToGet.find(
      //   (v) => v["fieldname"] == "v_adname"
      // );
      // if (obj && domain) {
      //   formData.solution["scriptparameters"].domainusername =
      //     obj.fieldvalue + "@" + domain.fieldvalue;
      // }
      // obj = this.variablesToGet.find((v) => v["fieldname"] == "v_adpassword");
      // if (obj) {
      //   formData.solution["scriptparameters"].domainpassword = obj.fieldvalue;
      // }
    }
    formData.solution.implementationname = data.servername;
    // formData.solution.autocreatesg = data.autocreatesg;

    if (this.scriptlist.length != 0) {
      formData.scriptparams = [];
      let len = this.scriptlist.length;
      let self = this;
      _.map(this.scriptlist, function (item) {
        let key = "script." + item;
        let params = _.get(self.scriptParamsList, key);
        let paramString = "";
        paramString =
          AppConstant.TMS_SCRIPT_FILENAME +
          " " +
          _.map(params, _.property("fieldvalue")).join(" ");
        if (data.parameterArray.length != 0) {
          let paramlen = data.parameterArray.length;
          for (let i = 0; i < data.parameterArray.length; i++) {
            paramString = paramString.replace(
              new RegExp(data.parameterArray[i].fieldname, "g"),
              data.parameterArray[i].fielddata
            );
            paramlen--;
            if (paramlen == 0) {
              paramString = paramString.replace(new RegExp("{{", "g"), "");
              paramString = paramString.replace(new RegExp("}}", "g"), "");
              formData.scriptparams.push({
                scriptid: Number(item),
                paramstring: paramString,
              });
              len--;
            }
          }
        } else {
          formData.scriptparams.push({
            scriptid: Number(item),
            paramstring: paramString,
          });
          len--;
        }
        console.log(formData);
        if (len == 0) {
          console.log(formData);
          self.sendRequest(formData, template);
        }
      });
    } else {
      console.log(formData);
      this.sendRequest(formData, template);
    }
  }
  sendRequest(formData, template) {
    if (
      formData.solution.cloudprovider == "ECL2" &&
      formData.solution.ecl2solutions
    ) {
      let self = this;
      let sharingConnections = [] as any;

      if (
        self.deploymentForm.value.customerid !==
        self.deploymentForm.value.solution.clientid
      ) {
        for (let i = 0; i < formData.solution.ecl2solutions.length; i++) {
          if (!_.isEmpty(formData.solution.ecl2solutions[i].sharedtenants)) {
            _.map(
              formData.solution.ecl2solutions[i].sharedtenants,
              function (item) {
                _.map(item, function (value, key) {
                  if (
                    Number(key) === self.deploymentForm.value.client.customerid
                  ) {
                    formData.solution.ecl2solutions[i]["tenantsharing"] = true;
                    formData.solution.ecl2solutions[i]["tenantsharingobj"] =
                      value;
                    sharingConnections.push(
                      formData.solution.ecl2solutions[i].tenantsharingobj[0]
                        .tenantconnrequestid
                    );
                    // formData.solution.ecl2solutions[i]['existnetworks'] = formData.solution.ecl2solutions[i].ecl2networks;
                  }
                });
              }
            );
          } else {
            formData.solution.ecl2solutions[i]["tenantsharing"] = false;
            formData.solution.ecl2solutions[i]["tenantsharingobj"] = [];
          }
        }
      }

      if (
        formData.solution &&
        formData.solution.ecl2solutions &&
        formData.solution.ecl2solutions.length > 0
      ) {
        for (
          let index = 0;
          index < formData.solution.ecl2solutions.length;
          index++
        ) {
          const vm = formData.solution.ecl2solutions[index];
          let ctags = _.cloneDeep(this.tagsClone);
          let vmTags = ctags.filter((o) => {
            return (
              (o["refid"] == vm["ecl2solutionid"] || o["refid"] == null) &&
              o["resourcetype"] != AppConstant.TAGS.TAG_RESOURCETYPES[3]
            );
          });
          let t = vmTags
            .map((o) => {
              if (o["tagvalue"] != null && o["tagvalue"].includes("v_")) {
                let input = this.variablesToGet.find(
                  (v) => v["fieldname"] == o["tagvalue"]
                );
                if (input && input.fieldvalue) o["tagvalue"] = input.fieldvalue;
              }
              return {
                tagvalue: o["tagvalue"],
                tag: {
                  tagname: o["tag"]["tagname"],
                },
              };
            })
            .filter((o) => o["tagvalue"] != null);
          formData.solution.ecl2solutions[index]["tagvalues"] = _.cloneDeep(t);
        }
      }

      if (formData.solution) {
        let solutionTags = this.tagsClone.filter((o) => {
          return o["resourcetype"] == AppConstant.TAGS.TAG_RESOURCETYPES[0];
        });
        let t = solutionTags
          .map((o) => {
            if (o["tagvalue"] != null && o["tagvalue"].includes("v_")) {
              let input = this.variablesToGet.find(
                (v) => v["fieldname"] == o["tagvalue"]
              );
              if (input && input.fieldvalue) o["tagvalue"] = input.fieldvalue;
            }
            return {
              tagvalue: o["tagvalue"],
              tag: {
                tagname: o["tag"]["tagname"],
              },
            };
          })
          .filter((o) => o["tagvalue"] != null);
        formData.solution["tagvalues"] = _.cloneDeep(t);
      }
      this.formdata = formData;

      this.formdata["orchparams"] = this.variablesToGet.map((o) => {
        return {
          key: o["fieldname"],
          value: o["fieldvalue"],
        };
      });

      // Required if we are to keep data collection uname password on instance level.
      // if (this.formdata['orchparams'] && this.formdata['orchparams'].length > 0) {
      //   this.formdata['orchparams'] = [
      //     ...this.formdata['orchparams'],
      //     {
      //       key: 'sys_login',
      //       value: this.deploymentForm.value['serverlogin']
      //     },
      //     {
      //       key: 'sys_password',
      //       value: this.deploymentForm.value['serverpwd']
      //     }
      //   ]
      // }

      // let clonedTags = _.cloneDeep(this.tagsClone);

      // let tags = clonedTags.map(o => {
      //   if (o['tagvalueid']) delete o['tagvalueid'];
      //   if (o['taggroupid'] == null) delete o['taggroupid'];
      //   o['resourcetype'] = AppConstant.TAGS.TAG_RESOURCETYPES[3];
      //   return o;
      // });

      // this.tagValueService.bulkupdate(tags).subscribe(result => {
      //   let response = {} as any;
      //   response = JSON.parse(result._body);
      //   if (response.status) {
      //     console.log("TAG VALUES UDPATED::::::::::::::::");
      //   } else {
      //     console.log("ERROR UPDATING TAG VALUES::::::::");
      //   }
      // });
      if (!_.isEmpty(sharingConnections)) {
        this.ecl2Service
          .getECL2TenantconnRequestList({
            tenantid: this.userstoragedata.tenantid,
            status: AppConstant.STATUS.ACTIVE,
            tenantconnrequestids: sharingConnections,
          })
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              response.data.forEach((element) => {
                if (element.eclstatus == AppConstant.ECLSTATUS.REGISTERING) {
                  this.isTemplateValid = false;
                }
              });
              if (!this.isTemplateValid) {
                this.notificationService.error(
                  "Error",
                  "Sharing connection is not approved",
                  {
                    nzStyle: {
                      right: "460px",
                      background: "#fff",
                    },
                    nzDuration: AppConstant.MESSAGEDURATION,
                  }
                );
              } else {
                this.deploysltnService
                  .ecl2deploy(this.formdata)
                  .subscribe((result) => {
                    let response = {} as any;
                    response = JSON.parse(result._body);
                    if (response.status) {
                      this.router.navigate(["server/list"]);
                    } else {
                      this.messageService.error(response.message);
                    }
                  });
              }
            }
          });
      } else {
        this.deploysltnService.ecl2deploy(this.formdata).subscribe((result) => {
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            this.router.navigate(["server/list"]);
          } else {
            this.messageService.error(response.message);
          }
        });
      }
    } else {
      if (
        formData.solution &&
        formData.solution.awssolutions &&
        formData.solution.awssolutions.length > 0
      ) {
        for (
          let index = 0;
          index < formData.solution.awssolutions.length;
          index++
        ) {
          const vm = formData.solution.awssolutions[index];
          let ctags = _.cloneDeep(this.tagsClone);
          let vmTags = ctags.filter((o) => {
            return (
              (o["refid"] == vm["awssolutionid"] || o["refid"] == null) &&
              o["resourcetype"] != AppConstant.TAGS.TAG_RESOURCETYPES[3]
            );
          });
          let t = vmTags
            .map((o) => {
              if (o["tagvalue"] != null && o["tagvalue"].includes("v_")) {
                let input = this.variablesToGet.find(
                  (v) => v["fieldname"] == o["tagvalue"]
                );
                if (input && input.fieldvalue) o["tagvalue"] = input.fieldvalue;
              }
              return {
                tagvalue: o["tagvalue"],
                tag: {
                  tagname: o["tag"]["tagname"],
                },
              };
            })
            .filter((o) => o["tagvalue"] != null);
          formData.solution.awssolutions[index]["tagvalues"] = _.cloneDeep(t);
        }
      }

      if (formData.solution) {
        let solutionTags = this.tagsClone.filter((o) => {
          return o["resourcetype"] == AppConstant.TAGS.TAG_RESOURCETYPES[0];
        });
        let t = solutionTags
          .map((o) => {
            if (o["tagvalue"] != null && o["tagvalue"].includes("v_")) {
              let input = this.variablesToGet.find(
                (v) => v["fieldname"] == o["tagvalue"]
              );
              if (input && input.fieldvalue) o["tagvalue"] = input.fieldvalue;
            }
            return {
              tagvalue: o["tagvalue"],
              tag: {
                tagname: o["tag"]["tagname"],
              },
            };
          })
          .filter((o) => o["tagvalue"] != null);
        formData.solution["tagvalues"] = _.cloneDeep(t);
      }

      formData["orchparams"] = this.variablesToGet.map((o) => {
        return {
          key: o["fieldname"],
          value: o["fieldvalue"],
        };
      });

      this.deploysltnService.deploy(formData).subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.notificationService.template(template, {
            nzStyle: {
              right: "460px",
              width: "500px",
              height: "100px",
            },
          });
          // let self = this;
          // self.isVisible = true;
          // this.socketmsgs = [];
          // this.socket.on(response.data.deploymentid, function (msg) {
          //   // console.log(msg);
          //   self.isVisible = true;
          //   self.socketmsgs.push(msg);
          // });
          this.router.navigate(["server/list"]);
        } else {
          this.messageService.error(response.message);
        }
      });
    }
  }
  getFormArray(): FormArray {
    return this.deploymentForm.get("parameterArray") as FormArray;
  }
  onCollapse(event, key) {
    if (event) {
      if (key === "") {
        this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.HIDE;
      }
      this.costpanelName = AppConstant.VALIDATIONS.DEPLOYMENT.HIDE;
    } else {
      if (key === "") {
        this.panelName = AppConstant.VALIDATIONS.DEPLOYMENT.SHOWMORE;
      }
      this.costpanelName = AppConstant.VALIDATIONS.DEPLOYMENT.SHOWMORE;
    }
  }
  getServiceRequestDetail(id) {
    this.loading = true;
    let defaultedSolution = {} as any;
    this.srmService.byId(id).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.serviceObj = response.data;
        this.solutionList.push(this.serviceObj.catalog.solution);
        defaultedSolution = this.serviceObj.catalog.solution;
        this.deploymentForm.controls["solution"].setValue(defaultedSolution);
        this.clientList.push(this.serviceObj.customer);
        this.deploymentForm.controls["client"].setValue(
          this.serviceObj.customer
        );
      }
    });
  }
  closeSummary(event) {
    this.showSummary = event;
  }

  tagDrawerChanges(e: any) {
    this.tagPickerVisible = false;
  }

  // Tagging related functionalities
  getTags(id: any) {
    this.tagValueService
      .all({
        resourceid: id,
        resourcetypes: [
          AppConstant.TAGS.TAG_RESOURCETYPES[0],
          AppConstant.TAGS.TAG_RESOURCETYPES[1],
        ],
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.tags = this.tagService.decodeTagValues(
              response.data,
              "picker"
            );
            this.tagsClone = response.data;
          } else {
            this.tags = [];
            this.tagsClone = [];
            this.tagsList = [];
            // this.message.error(response.message);
          }
        },
        (err) => {
          this.messageService.error("Unable to get tag group. Try again");
        }
      );
  }

  tagListChanges(e) {
    let tags = _.filter(this.tagsClone, e);
    this.resourceId = e.resourceid;
    this.resourceType = e.resourcetype;
    this.cloudProvider = e.cloudprovider;

    if (e.refid) this.refId = e.refid;
    else this.refId = null;
    this.tagsList = [];
    if (tags.length > 0) {
      this.tags = this.tagService.decodeTagValues(tags, "picker");
      this.tagsList = this.tagService.prepareViewFormat(tags);
    }
  }

  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagPickerVisible = false;

      if (e.data.length > 0) {
        let resourcetype = e.data[0]["resourcetype"];

        let t = this.tagsClone.filter((o) => {
          if (this.selectedTagType["refid"]) {
            return o["refid"] != this.selectedTagType["refid"];
          } else {
            return o["resourcetype"] != resourcetype;
          }
        });

        let newTags = _.concat(t, e.data);

        this.tagsClone = newTags;
        this.tagListChanges(this.selectedTagType);
      }

      // this.tagValueService.bulkupdate(e.data).subscribe(result => {
      //   let response = JSON.parse(result._body);
      //   if (response.status) {
      //     this.getTags(this.selectedTagType);
      //     this.messageService.info(response.message);
      //   } else {
      //     this.messageService.error(response.message);
      //   }
      // }, err => {
      //   this.messageService.error('Unable to remove tag. Try again');
      // });
    }
  }
  getconfirmation() {
    let errorMessage: any;
    if (this.deploymentForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.deploymentForm,
        this.deploymentErrObj,
        "parameterArray"
      );
      this.messageService.remove();
      this.messageService.error(errorMessage);
      return false;
    } else {
      this.commonService
        .allInstances({
          instancename: this.deploymentForm.value.servername,
          status: AppConstant.STATUS.ACTIVE,
        })
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.messageService.error(
              "Already an instance running with same name"
            );
          } else if (response.code == 201) {
            this.confirmationWindow = true;
          }
        });
    }
  }
  parseData(list: any) {
    try {
      if (list) {
        return JSON.parse(list);
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }
  getAmiList() {
    this.amiList = [];
    let response = {} as any;
    let query = {} as any;
    query = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };
    console.log(this.cloudprovider);
    if (this.cloudprovider == "ECL2") {
      if (this.selectedTemplate.clientid !== -1) {
        query.customerid = this.selectedTemplate.clientid;
      }
      this.ecl2Service.allecl2sami(query).subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.amiList = response.data;
          } else {
            this.amiList = [];
          }
        },
        (err) => {
          this.messageService.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
    } else {
      this.awsService.allawsami(query).subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.amiList = response.data;
            _.map(this.amiList, function (item) {
              item.imagename = item.aminame;
              item.imageid = item.amiid;
            });
          } else {
            this.amiList = [];
          }
        },
        (err) => {
          this.messageService.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
    }
  }
  getVolumeList(condition) {
    if (this.cloudprovider == "ECL2") {
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
          this.messageService.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
    }
    if (this.cloudprovider == "AWS") {
      this.awsService.allawsvolumes(condition).subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.volumeList = response.data;
            _.map(this.volumeList, function (i: any) {
              i.volumename = i.sizeingb + "GB";
            });
          } else {
            this.volumeList = [];
          }
        },
        (err) => {
          this.messageService.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
    }
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
        this.messageService.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
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
  getlbList(condition) {
    this.ecl2Service.allecl2loadbalancer(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loadbalancerList = response.data;
      } else {
        this.loadbalancerList = [];
      }
    });
  }

  validateRegion(flag?) {
    let amimismatch = false;
    let vpcmismatch = false;
    let subnetmismatch = false;
    let sgmismatch = false;

    let ami: any = _.find(this.amiList, {
      awsamiid: this.deploymentForm.value.awsamiid,
    });

    let vpc: any = _.find(this.awsvpcList, {
      awsvpcid: this.deploymentForm.value.awsvpcid,
    });

    let subnet = _.find(this.subnetList, {
      awssubnetd: this.deploymentForm.value.awssubnetd,
    });
    console.log(subnet);
    console.log(this.deploymentForm.value);

    let sg = _.find(this.sgList, {
      awssecuritygroupid: this.deploymentForm.value.awssecuritygroupid,
    });

    if (ami && ami.tnregionid != this.deploymentForm.value.zone.tnregionid) {
      amimismatch = true;
    }
    if (vpc && vpc.tnregionid != this.deploymentForm.value.zone.tnregionid) {
      vpcmismatch = true;
    }
    if (
      subnet &&
      subnet.tnregionid != this.deploymentForm.value.zone.tnregionid
    ) {
      subnetmismatch = true;
    }
    if (sg && sg.tnregionid != this.deploymentForm.value.zone.tnregionid) {
      sgmismatch = true;
    }

    if (flag) {
      switch (flag) {
        case "AMI":
          if (amimismatch == true) {
            this.messageService.warning(
              "Please select the Image in " +
                this.deploymentForm.value.zone.region +
                " region"
            );
          }
          break;
        case "VPC":
          if (vpcmismatch == true) {
            this.messageService.warning(
              "Please select the VPC in " +
                this.deploymentForm.value.zone.region +
                " region"
            );
          }
          break;
        case "SUBNET":
          if (subnetmismatch == true) {
            this.messageService.warning(
              "Please select the Subnet in " +
                this.deploymentForm.value.zone.region +
                " region"
            );
          }
          break;
        case "SG":
          if (sgmismatch == true) {
            this.messageService.warning(
              "Please select the Security Group in " +
                this.deploymentForm.value.zone.region +
                " region"
            );
          }
          break;
      }
    } else {
      if (
        amimismatch == true ||
        vpcmismatch == true ||
        subnetmismatch == true ||
        sgmismatch == true
      ) {
        this.messageService.warning(
          "All configurations should be in " +
            this.deploymentForm.value.zone.region +
            " region"
        );
      }
    }
  }
}
