import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { PipelineTemplateService } from "../pipeline-template.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { environment } from "src/environments/environment";
import { NotificationSetupService } from "src/app/business/tenants/network setup/notificationsetup.service";
import { SideBarComponent } from "src/app/modules/components/sidebar/sidebar.component";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { IResourceType } from "src/app/modules/interfaces/assetrecord.interface";
import { NzTreeNode } from "ng-zorro-antd";
import { ColDef, GridApi, CellClickedEvent } from "ag-grid-community";
import { CicdService } from "../../cicd.service";
import { PipelineTemplateProperties } from "../pipeline-template-properties/pipeline-settings";
import { PropNotificationComponent } from "../pipeline-template-properties/notifications/notifications.component";
import { DeploymentOptionsComponent } from "../pipeline-template-properties/deployment-options/deployment-options.component";
import { RollbackRetriesComponent } from "../pipeline-template-properties/rollback-retries/rollback-retries.component";
import { IntegrationsComponent } from "../pipeline-template-properties/integrations/integrations.component";

@Component({
  selector: "app-pipeline-template-design",
  templateUrl: "./pipeline-template-design.html",
  styleUrls: ["./pipeline-template-design.css"],
})
export class PipelineTemplateDesign implements OnInit {
  @ViewChild(SideBarComponent) sidebar: SideBarComponent;
  @ViewChild(PipelineTemplateProperties) nodetabProperties!: PipelineTemplateProperties;
  @ViewChild(PropNotificationComponent) notificationComponent!: PropNotificationComponent;
  @ViewChild(DeploymentOptionsComponent) deploymentComponent!: DeploymentOptionsComponent;
  @ViewChild(RollbackRetriesComponent) rollbackComponent!: RollbackRetriesComponent;
  @ViewChild(IntegrationsComponent) integrationsComponent!: IntegrationsComponent;
  userstoragedata: any;
  pipelineTemplateForm: FormGroup;
  orchestrationErrObj = {};
  pipelineflowObj: any = {};
  flowrigamiObj;
  formData: any = {};
  loading = false;
  pipelineObj;
  isclone = false;
  exportObj: any = {};
  positions = [];
  isUpdate = false;
  findPosition = false;
  isView = false;
  isComments = false;
  isChangelogs = false;
  isDocuments = false;
  isNotifications = false;
  screens = [];
  appScreens = {} as any;
  options: any = {};
  templateId: number = 0;
  updatePipelineData = [];
  formattedUpdatedData: any = {};
  runnerList: any = [];
  currentPageIndex: number = 0;
  queryParam: string = "";
  limit: string = "";
  showValidateDrawer = false;
  tabIndex = 0 as number;
  watchList = [];
  selectedValue: any;
  formTitle = "";
  propertiesobj:any;
  workpackList: any[] = [];
  isTreeVisible: boolean = false;
  treeTableSearchbox: string;
  selectedTreeTableNodes: any;
  selectedWorkpackTitle = "";
  private gridApi: GridApi;
  resourceTypesTreeList: any[] = [];
  workpackTemplateList: IResourceType[] = [];
  templateTreeList: any;
  selectedResourceName = "";
  txnrefList: any = [];
  resourceTypesList: IResourceType[] = [];
  selectedTreeNodes: any;
  modelCrn = "";
  isServicesCatalog = false;
  isdefault = false;
  selectedWorkpackName = "";
  selectedWorkpackCrn = "";
  allNodesData = {};
  templateTabIndex = 0 as number;
  templateTabTitle = "Properties";
  nodeDetails = [];
  templateNodeId: string;
  currentTab: string;
  notificationData: any = {};
  integrationData: any = {};
  deploymentformData: any = {};
  rollbackData: any = {};
  nodes: any;
  validationNodes: any[] = [];
  templateObj;
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private pipelineTemplateService: PipelineTemplateService,
    private routes: ActivatedRoute,
    private router: Router,
    private httpService: HttpHandlerService,
    private modalService: NzModalService,
    private notificationService: NotificationSetupService,
    private assetRecordService: AssetRecordService,
    private cicdService: CicdService
  ) {
    this.loadOrchestration();
    this.pipelineTemplateForm = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      workpackid: [""],
      description: [null, [Validators.maxLength(500)]],
      runner: [null, [Validators.required]],
      watchlist: [null, [Validators.required]],
    });

    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );

    this.options = { baseURL: environment.baseURL };

    this.routes.params.subscribe((params) => {
      if (params) {
        if (params["id"]) {
          this.templateId = Number(params["id"]);
          if (params["mode"] == "update") {
            this.isUpdate = true;
            this.options.update = true;
            this.getPipelineTemplateDetails(params["id"]);
          } else if (params["mode"] == "defaulttemplate") {
            this.getPipelineTemplateDetails(params["id"]);
            this.isdefault = true;
            this.loadOrchestration();
          } else if (params["mode"] == "copy") {
            this.isclone = true;
            this.isdefault = false;
            this.options.update = true;
            this.getPipelineTemplateDetails(params["id"]);
          } else {
            this.isView = true;
            this.options.viewMode = true;
            this.getPipelineTemplateDetails(params["id"]);
          }
        }
      }
    });
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PIPELINE_TEMPLATE,
    });
    if (_.includes(this.appScreens.actions, "Comments")) {
      this.isComments = true;
    }
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
    if (_.includes(this.appScreens.actions, "Documents")) {
      this.isDocuments = true;
    }
    if (_.includes(this.appScreens.actions, "Notifications")) {
      this.isNotifications = true;
    }
  }

  ngOnInit() {
    this.getRunnersList();
    this.getNotificationList();
    this.routes.queryParams.subscribe((params) => {
      this.currentPageIndex = parseInt(params["page"]);
      this.queryParam = params["q"];
      this.limit = params["limit"];
    });
  }
  templateTabChange(event) {
    this.tabIndex = event.index;
  }

  loadOrchestration() {
    this.loading = true;
    const script = document.createElement("script");
    script.src = "assets/libs/flowrigami-cicd.js";
    script.onload = (e) => {
      let container = document.getElementById("flowrigami");
      let Flowrigami = (window as any).Flowrigami;
      this.flowrigamiObj = new Flowrigami(container, this.options);

      if (!_.isEmpty(this.pipelineflowObj)) {
        this.flowrigamiObj.diagramApi.import(
          JSON.stringify(this.pipelineflowObj)
        );
      }
    };
    script.async = false;
    document.head.appendChild(script);
    this.getWorkpackList();
    window.addEventListener("openSidebar", (event: CustomEvent) =>
      this.handleOpenSidebar(event)
    );
    this.loading = false;
  }
  handleOpenSidebar(event: CustomEvent) {
    if (this.sidebar) {
      this.sidebar.isVisible = true;
      this.templateTabIndex = 0;
      this.formTitle = event.detail.selectedNode._label;
      const selectedNodeId = event.detail.selectedNode.id;
      if (this.isUpdate) {
        const nodeDetails = this.pipelineObj.pipelinetemplatedetails.find(
          (detail: { nodeid: any }) => {
            return detail.nodeid === selectedNodeId;
          }
        );
        this.propertiesobj = {
          ...event.detail,
          pipelinetemplatedetails: nodeDetails,
        };
        this.getNodeDtlsById(
          this.propertiesobj.pipelinetemplatedetails.templatedetailconfig.id
        );
      } else if (this.isclone) {
        const nodeDetails = this.pipelineObj.pipelinetemplatedetails.find(
          (detail: { nodeid: any }) => {
            return detail.nodeid === selectedNodeId;
          }
        );
        this.propertiesobj = {
          ...event.detail,
          pipelinetemplatedetails: nodeDetails,
        };
        this.getNodeDtlsById(
          this.propertiesobj.pipelinetemplatedetails.templatedetailconfig.id
        );
      } else {
        this.propertiesobj = {
          ...event.detail,
        };
      }
    }
  }
  closeSideBar() {
    if (this.sidebar) {
      this.sidebar.isVisible = false;
    }
  }
  createPipelineTemplate() {
    if (this.isView) {
      this.isView = false;
      this.router.navigate(["cicd/pipelinetemplate"], {
        queryParams: {
          page: this.currentPageIndex,
          q: this.queryParam,
          limit: this.limit,
        },
      });
    } else if (!this.isView && this.pipelineTemplateForm.valid) {
      this.formData = this.pipelineTemplateForm.value;
      if (!_.isEmpty(this.flowrigamiObj.diagramApi.export())) {
        this.exportObj =
          JSON.parse(this.flowrigamiObj.diagramApi.export()) || {};
        this.findPosition = true;
      }

      if (this.formData["name"] != "" && !_.isEmpty(this.exportObj)) {
        this.savePipelineTemplate();
      }
    } else {
      this.validateRunner();
    }
  }

  validateRunner() {
    if (this.pipelineTemplateForm.get("name").hasError("required")) {
      this.message.error(AppConstant.CICD.ERRORMSG.createpipeline, {
        nzDuration: 3000,
      });
      return;
    } else if (this.pipelineTemplateForm.get("runner").hasError("required")) {
      this.message.error(AppConstant.CICD.ERRORMSG.selectRunner, {
        nzDuration: 3000,
      });
      return;
    } else if (
      this.pipelineTemplateForm.get("watchlist").hasError("required")
    ) {
      this.message.error(AppConstant.CICD.ERRORMSG.WatchList, {
        nzDuration: 3000,
      });
      return;
    }
  }

  savePipelineTemplate() {
    const nodeId = this.exportObj.nodes.find(
      (node: any) => node.name === AppConstant.CICD.TYPE.provider
    );
    this.findPositions(nodeId.params.id, 1);

    let pipelineTemplateData: any = {};
    let updatedData: any = {};
    if (this.isUpdate) {
      updatedData = this.formatUpdatedData();
    } else {
      const NodetabData = this.allNodesData;
      pipelineTemplateData = this.formatTemplateData(this.exportObj, NodetabData);
    }

    if (this.isUpdate) {
      const data = updatedData.pipelinetemplatedetails.sort(
        (a, b) => a.position - b.position
      );
      updatedData.pipelinetemplatedetails = data;
      this.updatePipeline(updatedData);
    } else {
      this.createPipeline(pipelineTemplateData);
    }
  }

  // Create Template
  formatTemplateData(input: any, nodeFormData) {
    try {
      let data: any = input;
      let providerInfo: any = _.find(data.nodes, {
        name: AppConstant.CICD.TYPE.provider,
      });
      let formattedData = {
        tenantid: this.userstoragedata.tenantid,
        pipelinename: this.formData.name,
        runnerid: this.formData.runner,
        description: this.formData.description || "",
        providerrepo: providerInfo.params.label,
        providerbranch: providerInfo.params.data.branch,
        filename: this.formData.name,
        pipelineflow: data,
        pipelinedetails: [],
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        ntfcsetupid: this.formData.watchlist,
        isdefault: 0,
        crn: this.selectedTreeTableNodes
          ? this.selectedTreeTableNodes.key || ''
          : this.selectedWorkpackCrn || '',
      } as any;
      _.map(data.nodes, (itm) => {
        const position = this.positions.find((pos) => pos.id === itm.params.id);
        const {
          branch,
          referenceid,
          type,
          Params,
          scriptcontent,
          ...setupDetails
        } = itm.data;

        const nodeData = data.nodes.find((d) => d.params.id === position.id);
        if (itm.data.type == AppConstant.CICD.CONTAINER_REGISTRY[0]) {
          if (
            !setupDetails.hasOwnProperty("imagename") ||
            setupDetails.imagename == ""
          ) {
            setupDetails.imagename = providerInfo.params.label;
            nodeData.params.data.imagename = providerInfo.params.label;
            nodeData.data.imagename = providerInfo.params.label;
          }
        }

        if (itm.data.type == AppConstant.CICD.environments[0]) {
          if (!setupDetails.hasOwnProperty("port") || setupDetails.port == "") {
            const port = null;
            setupDetails.port = port;
            nodeData.params.data.port = port;
            nodeData.data.port = port;
          }
        }
        let metaDetails;
        if (this.isclone) {
          metaDetails = this.pipelineObj.pipelinetemplatedetails.find(
            (detail) => detail.nodeid === itm.params.id
          );
        }
        const metaData = this.isclone ? metaDetails.templatedetailconfig.meta : nodeFormData[itm.params.id] || {};
        formattedData.pipelinedetails.push({
          referencetype: itm.name,
          referenceid: itm.data.referenceid,
          position: position.position,
          providerjobname: itm.data.type,
          setupdetails: setupDetails,
          scriptcontent: itm.data.scriptcontent,
          meta: this.isclone ? metaData : [metaData],
        });
        return itm;
      });
      return formattedData;
    } catch (e) {
      console.log(e);
    }
  }

  // Update Template
  formatUpdatedData() {
    try {
      let providerInfo: any = _.find(this.exportObj.nodes, {
        name: AppConstant.CICD.TYPE.provider,
      });
      this.updateFormattedData(providerInfo);
      _.forEach(this.exportObj.nodes, (itm) => {
        const position = this.positions.find((pos) => pos.id === itm.params.id);
        const data = this.updatePipelineData.find(
          (d) => d.nodeid === itm.params.id
        );
        const pipelineTemplateDetail = this.updatePipelineTemplateDetail(
          itm,
          position,
          data
        );
        this.formattedUpdatedData.pipelinetemplatedetails.push(
          pipelineTemplateDetail
        );
      });
      if (this.exportObj.deletedNode.length > 0) {
        this.handleDeletedNodes();
      }
      return this.formattedUpdatedData;
    } catch (e) {
      console.log(e);
    }
  }

  updateFormattedData(providerInfo) {
    this.formattedUpdatedData = {
      id: this.templateId,
      tenantid: this.userstoragedata.tenantid,
      pipelinename: this.formData.name,
      runnerid: this.formData.runner,
      description: this.formData.description || "",
      providerrepo: providerInfo.params.label,
      providerbranch: providerInfo.params.data.branch,
      filename: this.formData.name,
      pipelineflow: this.exportObj,
      pipelinetemplatedetails: [],
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.pipelineObj.createdby,
      createddt: this.pipelineObj.createddt,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      ntfcsetupid: this.formData.watchlist,
      crn: this.selectedTreeTableNodes
        ? this.selectedTreeTableNodes.key
        : this.selectedWorkpackCrn,
    };
  }

  updatePipelineTemplateDetail(itm, position, data) {
    const {
      branch,
      referenceid,
      type,
      Params,
      scriptcontent,
      ...setupDetails
    } = itm.data;

    const pipelineTemplateDetail: any = {
      tenantid: this.userstoragedata.tenantid,
      position: position.position,
      referencetype: itm.name,
      referenceid: itm.data.referenceid,
      templateid: this.templateId,
      providerjobname: itm.data.type,
      description: this.formData.description || "",
      status: AppConstant.STATUS.ACTIVE,
      createdby: data ? data.createdby : this.userstoragedata.fullname,
      createddt: data ? data.createddt : new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      templatedetailconfig: {
        tenantid: this.userstoragedata.tenantid,
        scriptcontent: itm.data.scriptcontent,
        setupdetails: setupDetails,
        variabledetails: data ? data.templatedetailconfig.variabledetails : "",
        description: this.formData.description || "",
        status: AppConstant.STATUS.ACTIVE,
        createdby: data
          ? data.templatedetailconfig.createdby
          : this.userstoragedata.fullname,
        createddt: data ? data.templatedetailconfig.createddt : new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      },
    };

    if (data) {
      pipelineTemplateDetail.templatedetailconfig.templatedetailid = data.id;
      pipelineTemplateDetail.templatedetailconfig.id =
        data.templatedetailconfig.id;
      pipelineTemplateDetail.id = data.id;
    }

    return pipelineTemplateDetail;
  }

  handleDeletedNodes() {
    _.forEach(this.exportObj.deletedNode, (d) => {
      const deletedData = _.find(
        this.updatePipelineData,
        (pipelineData) => pipelineData.nodeid == d.nodeid
      );
      if (deletedData) {
        deletedData.status = AppConstant.STATUS.INACTIVE;
        deletedData.lastupdatedby = this.userstoragedata.fullname;
        deletedData.lastupdateddt = new Date();
        deletedData.templatedetailconfig.status = AppConstant.STATUS.INACTIVE;
        deletedData.templatedetailconfig.lastupdatedby =
          this.userstoragedata.fullname;
        deletedData.templatedetailconfig.lastupdateddt = new Date();
        const { nodeid, ...data } = deletedData;
        this.formattedUpdatedData.pipelinetemplatedetails.push(data);
      }
    });
  }

  createPipeline(pipelineTemplateData) {
    if (pipelineTemplateData) {
      this.loading = true;
      this.pipelineTemplateService
        .create(pipelineTemplateData)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.info(response.message, { nzDuration: 3000 });
            if (response.code == 200) {
              this.formData = {};
              this.exportObj = {};
              this.router.navigate(["cicd/pipelinetemplate"], {
                queryParams: {
                  page: 1,
                  limit: this.limit,
                },
              });
            }
            this.loading = false;
          } else {
            this.message.error(response.message, { nzDuration: 3000 });
            this.loading = false;
          }
        });
    }
  }

  updatePipeline(updatedData) {
    this.modalService.confirm({
      nzTitle: "Confirm",
      nzContent: `Are you sure you want to update the pipeline template`,
      nzOkText: "OK",
      nzCancelText: "Cancel",
      nzOnOk: () => {
        this.loading = true;
        this.pipelineTemplateService
          .update(this.templateId, updatedData)
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.message.info(response.message, { nzDuration: 3000 });
              if (response.code == 200) {
                this.formData = {};
                this.exportObj = {};
                this.router.navigate(["cicd/pipelinetemplate"], {
                  queryParams: {
                    page: 1,
                    q: this.queryParam,
                    limit: this.limit,
                  },
                });
              }
              this.loading = false;
            } else {
              this.message.error(response.message, { nzDuration: 3000 });
              this.loading = false;
            }
          });
      },
      nzOnCancel: () => {
        this.exportObj = {};
        this.loading = false;
      },
    });
  }

  findPositions(
    nodeId: string,
    currentPosition: number,
    visitedNodes: Set<string> = new Set()
  ) {
    this.loading = true;
    let nodes;
    let links;
    if (this.isUpdate || this.isclone && !this.findPosition) {
      nodes = this.pipelineflowObj.nodes;
      links = this.pipelineflowObj.links;
    } else {
      nodes = this.exportObj.nodes;
      links = this.exportObj.links;
    }
    const node: any = nodes.find((node: any) => {
      if (node) {
        return node.params.id === nodeId;
      }
      return false;
    });
    if (!node || visitedNodes.has(node.params.id)) return;
    visitedNodes.add(node.params.id);
    if (
      this.isUpdate || this.isclone &&
      this.pipelineObj.pipelinetemplatedetails &&
      !this.findPosition
    ) {
      const data = this.pipelineObj.pipelinetemplatedetails.find(
        (detail: any) => detail.position === currentPosition
      );
      data.nodeid = node.params.id;
      this.updatePipelineData.push(data);
    }

    this.positions.push({ id: node.params.id, position: currentPosition });
    const connectedLinks = links.filter((link: any) => {
      return link.from === node.params.id || link.to === node.params.id;
    });
    connectedLinks.forEach((link: any) => {
      const connectedNode = nodes.find(
        (node: any) => node.params.id === link.to
      );
      if (!connectedNode) {
        this.loading = false;
        return
      };
      this.findPositions(
        connectedNode.params.id,
        currentPosition + 1,
        visitedNodes
      );
    });
  }

  getPipelineTemplateDetails(id: string) {
    this.loading = true;
    this.pipelineTemplateService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.pipelineObj = response.data;
        console.log(this.pipelineObj, "this.pipelineObj");
        this.pipelineObj.refid = response.data.id;
        this.pipelineObj.reftype = AppConstant.REFERENCETYPE[3];
        this.pipelineflowObj = response.data.pipelineflow;
        let ntfcsetupIds =
          response.data.notificationwatchlist &&
          response.data.notificationwatchlist.length > 0
            ? response.data.notificationwatchlist.map((e) => e.ntfcsetupid)
            : [];
        let workpackDtls =
          response.data.pipelineassethdr &&
          response.data.pipelineassethdr.length > 0
            ? response.data.pipelineassethdr[0]
            : [];
        this.selectedWorkpackName = workpackDtls.resourcetype;
        this.selectedWorkpackCrn = response.data.crn;
        this.loadOrchestration();
        this.pipelineTemplateForm.patchValue({
          name:
            this.isclone || this.isdefault ? "" : response.data.pipelinename,
          description: response.data.description,
          runner: response.data.runnerid,
          watchlist: ntfcsetupIds,
          workpackid: this.selectedWorkpackName,
        });
        const nodeId = this.pipelineflowObj.nodes.find(
          (node: any) => node.name === AppConstant.CICD.TYPE.provider
        );
        if (this.isUpdate || this.isclone) {
          this.findPositions(nodeId.params.id, 1);
        }
        this.positions = [];
        this.loading = false;
      } else {
        this.message.error(response.message, { nzDuration: 3000 });
        this.loading = false;
        this.loadOrchestration();
      }
    });
  }

  getRunnersList() {
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE.RUNNER +
      `?tenantid=${this.userstoragedata.tenantid}`;
    this.loading = true;
    this.httpService.GET(query).subscribe(
      (result) => {
        try {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.loading = false;
            this.runnerList = [];
            _.map(response.data, (runner: any) => {
              const instances = {
                label: runner.name,
                value: runner.id,
              };
              if (
                runner.name == "ubuntu-latest" &&
                this.pipelineTemplateForm.get("runner").value == null
              ) {
                this.pipelineTemplateForm.get("runner").setValue(runner.id);
              }
              this.runnerList.push(instances);
            });
          } else {
            this.runnerList = [];
            this.loading = false;
          }
        } catch (error) {
          this.runnerList = [];
          this.loading = false;
        }
      },
      (error) => {
        this.runnerList = [];
        this.loading = false;
      }
    );
  }

  cancel() {
    this.router.navigate(["cicd/pipelinetemplate"], {
      queryParams: {
        page: this.currentPageIndex || 1,
        q: this.queryParam,
        limit: this.limit,
      },
    });
  }

  // Notification watch list
  getNotificationList() {
    let obj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      module: AppConstant.REFERENCETYPE[3],
    } as any;
    this.notificationService.all(obj).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.watchList = response.data.map((item: any) => {
            return {
              label: item.module + "(" + item.event + ")",
              value: item.ntfcsetupid,
            };
          });
          if (!this.isUpdate || !this.isView) {
            this.selectedValue = this.watchList.map((e) => {
              return e.value;
            });
          }
        } else {
          this.watchList = [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  validate() {
    const exprtObj = JSON.parse(this.flowrigamiObj.diagramApi.export()) || {};
    if (!exprtObj.nodes || !exprtObj.links) {
      this.message.error("No nodes or links found in the workflow.");
      return;
    }
    const reorderedNodes = this.reorderNodes(exprtObj.nodes, exprtObj.links);
    const reorderedTemplateObj = {
      ...exprtObj,
      nodes: reorderedNodes,
    };
    this.templateObj = reorderedTemplateObj;
    this.updateSequence(this.templateObj);
  }

  reorderNodes(nodes, links): any[] {
    const nodeMap = new Map(nodes.map((node) => [node.params.id, node]));
    const connectedLinks = new Map<string, number>();
    nodes.forEach((node) => connectedLinks.set(node.params.id, 0));

    links.forEach((link) => {
      const targetId = link.to;
      connectedLinks.set(
        targetId,
        (connectedLinks.get(targetId) || 0) + 1
      );
    });

    const NodeEntry = Array.from(connectedLinks.entries()).find(
      ([_, count]) => count === 0
    );

    if (!NodeEntry) throw new Error("No start node found!");
    const nodeId = NodeEntry[0];

    const orderedNodes: any[] = [];
    const nodeSet = new Set<string>();

    const nodelinks = (nodeId: string) => {
      if (nodeSet.has(nodeId)) return;
      nodeSet.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (node) orderedNodes.push(node);

      const outgoingLinks = links.filter((link) => link.from === nodeId);
      outgoingLinks.forEach((link) => nodelinks(link.to));
    };

    nodelinks(nodeId);
    return orderedNodes;
  }

  updateSequence(templateObj) {
    this.exportObj = templateObj || {};
    if (!templateObj.nodes || templateObj.nodes.length === 0) {
      this.message.warning(AppConstant.CICD.ERRORMSG.Piplinevalidation);
      return;
    }
    const validationResult = this.validateNodeConnection(templateObj);

    if (validationResult.isValid) {
      this.validationNodes = [];
      this.nodes = [];
      this.message.success(AppConstant.NODES_VALIDATION_MSG.VALIDATION_PASS);
    } else {
      this.message.error(AppConstant.NODES_VALIDATION_MSG.VALIDATION_FAIL);
      this.nodes = validationResult.validationNodes;
    }
    this.showValidateDrawer = true;
  }

  validateNodeConnection(exportObj: any): {
    isValid: boolean;
    validationNodes: any[];
  } {
    const nodes = exportObj.nodes;
    const links = exportObj.links;
    let isValid = true;

    this.nodes = [];
    this.validationNodes = [];

    const nodeIds = nodes.map((node) => node.params.id);

    nodes.forEach((node: any) => {
      // Testing Tools
      if (node.name === AppConstant.CICD_NODES[2]) {
        const nodeLinks = links.filter((link) => link.to === node.params.id);
        const nodevalid = nodeLinks.every((link) => {
          const sourceNode = nodes.find((n) => n.params.id === link.from);
          return (
            sourceNode &&
            [
              AppConstant.CICD_NODES[6],
              AppConstant.CICD_NODES[5],
              AppConstant.CICD_NODES[2],
            ].includes(sourceNode.name)
          );
        });
        if (!nodevalid) {
          this.validationNodes.push({
            name: node.name,
            id: node.params.id,
            error: AppConstant.NODES_VALIDATION_MSG.TESTING_TOOL,
            status: AppConstant.NODE_STATUS[1],
          });
          isValid = false;
        }
      }
      // Build
      if (node.name === AppConstant.CICD_NODES[6]) {
        const nodeLinks = links.filter((link) => link.to === node.params.id);
        const nodevalid = nodeLinks.every((link) => {
          const sourceNode = nodes.find((n) => n.params.id === link.from);
          return (
            sourceNode &&
            [AppConstant.CICD_NODES[0], AppConstant.CICD_NODES[5]].includes(
              sourceNode.name
            )
          );
        });
        if (!nodevalid) {
          this.validationNodes.push({
            name: node.name,
            id: node.params.id,
            error: AppConstant.NODES_VALIDATION_MSG.BUILD,
            status: AppConstant.NODE_STATUS[1],
          });
          isValid = false;
        }
      }
      // Docker Container
      if (node.name === AppConstant.CICD_NODES[1]) {
        const nodeLinks = links.filter((link) => link.to === node.params.id);
        const nodevalid = nodeLinks.every((link) => {
          const sourceNode = nodes.find((n) => n.params.id === link.from);
          return (
            sourceNode &&
            [
              AppConstant.CICD_NODES[6],
              AppConstant.CICD_NODES[2],
              AppConstant.CICD_NODES[5],
            ].includes(sourceNode.name)
          );
        });
        if (!nodevalid) {
          this.validationNodes.push({
            name: node.name,
            id: node.params.id,
            error: AppConstant.NODES_VALIDATION_MSG.CONTAINER_REGISTRY,
            status: AppConstant.NODE_STATUS[1],
          });
          isValid = false;
        }
      }
      // Environment
      if (node.name === AppConstant.CICD_NODES[3]) {
        const nodeLinks = links.filter((link) => link.to === node.params.id);
        const nodevalid = nodeLinks.every((link) => {
          const sourceNode = nodes.find((n) => n.params.id === link.from);
          return (
            sourceNode &&
            [
              AppConstant.CICD_NODES[1],
              AppConstant.CICD_NODES[4],
              AppConstant.CICD_NODES[5],
            ].includes(sourceNode.name)
          );
        });
        if (!nodevalid) {
          this.validationNodes.push({
            name: node.name,
            id: node.params.id,
            error: AppConstant.NODES_VALIDATION_MSG.ENVIRONMENT,
            status: AppConstant.NODE_STATUS[1],
          });
          isValid = false;
        }
      }
      // Orchestration
      if (node.name === AppConstant.CICD_NODES[4]) {
        const nodeLinks = links.filter((link) => link.to === node.params.id);
        const nodevalid = nodeLinks.every((link) => {
          const sourceNode = nodes.find((n) => n.params.id === link.from);
          return (
            sourceNode && [AppConstant.CICD_NODES[5]].includes(sourceNode.name)
          );
        });
        if (!nodevalid) {
          this.validationNodes.push({
            name: node.name,
            id: node.params.id,
            error: AppConstant.NODES_VALIDATION_MSG.ORCHESTRATION,
            status: AppConstant.NODE_STATUS[1],
          });
          isValid = false;
        }
      }
      // Others
      if (node.name === AppConstant.CICD_NODES[7]) {
        const nodeLinks = links.filter((link) => link.to === node.params.id);
        const nodevalid = nodeLinks.every((link) => {
          const sourceNode = nodes.find((n) => n.params.id === link.from);
          return (
            sourceNode &&
            [
              AppConstant.CICD_NODES[3],
              AppConstant.CICD_NODES[4],
              AppConstant.CICD_NODES[5],
            ].includes(sourceNode.name)
          );
        });
        if (!nodevalid) {
          this.validationNodes.push({
            name: node.name,
            id: node.params.id,
            error: AppConstant.NODES_VALIDATION_MSG.OTHERS,
            status: AppConstant.NODE_STATUS[1],
          });
          isValid = false;
        }
      }
    });

    this.validationNodes = this.validationNodes.filter((validation) =>
      nodeIds.includes(validation.id)
    );

    return { isValid, validationNodes: this.validationNodes };
  }

  onChanged(e) {
    this.showValidateDrawer = e;
  }
  public gridOptions = {
    rowSelection: "single",
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    suppressAggFuncInHeader: true,
    suppressRowClickSelection: true,
    onCellClicked: (event: CellClickedEvent) => {
      if (event.data) {
        this.selectedTreeTableNodes = event.data;
        this.treeTableSearchbox = event.data.title;
        this.isTreeVisible = false;
        this.cicdService.setTreeTableTemplateData(event.data);
      }
    },
    onTreeSelectionChanged(event) {},
    onGridClick(event) {
      const selectedRows = this.gridApi.getSelectedRows();
    },
    getNodeChildDetails: function getNodeChildDetails(rowItem) {
      if (rowItem.children) {
        return {
          group: true,
          expanded: true,
          children: rowItem.children,
          key: rowItem.title,
        };
      } else {
        return null;
      }
    },
    onGridReady: (params) => {
      this.gridApi = params.api;
    },
  };

  public columnDefs: ColDef[] = [
    {
      headerName: "Title",
      field: "title",
      cellRenderer: "agGroupCellRenderer",
      cellRendererParams: {
        suppressCount: true,
      },
      width: 250,
    },
  ];
  onFirstDataRendered(params: any) {
    if (params) {
      params.api.sizeColumnsToFit();
    }
  }
  onGridReady(params) {
    this.gridApi = params.api;
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(
      (document.getElementById("filter-text-box") as HTMLInputElement).value
    );
  }
  selectTreeTableNode() {
    if (this.selectedTreeTableNodes) {
      this.selectedWorkpackTitle = this.selectedTreeTableNodes.title;
      this.isTreeVisible = false;
    }
  }
  formatTree(resourceType: any[]) {
    let arr: any[] = _.clone(resourceType);
    var tree = [],
      TreeNode = [],
      mappedArr = {},
      arrElem,
      mappedElem;
    let mappedElemTree: any;
    let createNzTreeNode = (data: any) => {
      let mapped = _.cloneDeep(data);
      return new NzTreeNode({
        title: mapped["resource"],
        key: mapped["crn"],
        children: [],
        isLeaf: false,
      });
    };
    let nodeChecker = (entry, find) => {
      let result;
      for (let el of entry) {
        if (el.key == find) {
          result = el;
          break;
        } else if (el.children.length > 0) {
          result = nodeChecker(el.children, find);
        }
      }
      return result;
    };
    // First map the nodes of the array to an object -> create a hash table.
    for (var i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i];
      arrElem["isLeaf"] = false;
      arrElem;
      mappedArr[arrElem.crn] = arrElem;
      mappedArr[arrElem.crn]["children"] = [];
      mappedArr[arrElem.crn]["nodechildren"] = [];
    }
    for (var crn in mappedArr) {
      if (mappedArr.hasOwnProperty(crn)) {
        mappedElem = mappedArr[crn];
        if (mappedElem["crn"] == "crn:ops:hotfix_workpack_template") {
        }
        if (mappedElem["parentcrn"] == "crn:ops:workpack_model_1") {
        }
        if (mappedElem["crn"] == "crn:ops:workpack_model_1") {
        }
        mappedElemTree = null;
        mappedElem["title"] = mappedElem["resource"];
        mappedElem["key"] = mappedElem["crn"];
        mappedElemTree = createNzTreeNode(mappedElem);
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentcrn != null && mappedElem.parentcrn != "") {
          mappedElem.isLeaf = true;
          if (mappedArr[mappedElem["parentcrn"]]) {
            mappedElemTree.isLeaf = true;
            mappedArr[mappedElem["parentcrn"]]["nodechildren"].push(
              _.cloneDeep(mappedElemTree)
            );
            let parentnode: any = nodeChecker(
              TreeNode,
              mappedElem["parentcrn"]
            );
            if (parentnode) {
              parentnode.addChildren([mappedElemTree]);
            }
          }

          if (mappedArr[mappedElem["parentcrn"]])
            mappedArr[mappedElem["parentcrn"]]["children"].push(mappedElem);
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          if (mappedElem.nodechildren) {
            if (mappedElem.nodechildren.length > 0) {
              mappedElemTree.addChildren(_.cloneDeep(mappedElem.nodechildren));
            }
          }
          tree.push(mappedElem);
          TreeNode.push(_.cloneDeep(mappedElemTree));
        }
      }
    }
    return TreeNode;
  }
  getWorkpackList(mode?: any, value?: any) {
    let req: any = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      status: AppConstant.STATUS.ACTIVE,
      module: AppConstant.RESOURCETYPE_MODULE[1],
    };
    if (mode == "workpack") {
      req.parentcrn = value;
    }
    this.assetRecordService
      .getResourceTypes(req, "treestructure=true")
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesTreeList = this.formatTree(_.cloneDeep(response));
        this.templateTreeList = this.unflattenTree(_.cloneDeep(response));
        _.map(response, (d: any) => {
          d.checked = false;
          return d;
        });
        let list = _.orderBy(response, ["id"], ["asc"]);
        if (mode == "workpack") {
          this.workpackTemplateList = list;
        }
      });
  }

  onChangeTree(event) {
    this.selectedResourceName = event;
    this.txnrefList = [];
    this.router.navigate([], { queryParams: { modelcrn: event } });
    this.workpackTemplateList = [];
  }

  unflattenTree(resourceType: any[]) {
    let arr: any[] = _.clone(resourceType);
    var tree = [],
      TreeNode = [],
      mappedArr = {},
      arrElem,
      mappedElem;
    let mappedElemTree: any;
    let createNzTreeNode = (data: any) => {
      let mapped = _.cloneDeep(data);
      return {
        title: mapped["resource"],
        createddt: mapped["createddt"],
        createdby: mapped["createdby"],
        lastupdatedby: mapped["lastupdatedby"],
        lastupdateddt: mapped["lastupdateddt"],
        key: mapped["crn"],
        children: [],
        isLeaf: false,
      };
    };
    let nodeChecker = (entry, find) => {
      let result;
      for (let el of entry) {
        if (el.key == find) {
          result = el;
          break;
        } else if (el.children.length > 0) {
          result = nodeChecker(el.children, find);
        }
      }
      return result;
    };
    for (var i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i];
      arrElem["isLeaf"] = false;
      arrElem;
      mappedArr[arrElem.crn] = arrElem;
      mappedArr[arrElem.crn]["children"] = [];
      mappedArr[arrElem.crn]["nodechildren"] = [];
    }
    for (var crn in mappedArr) {
      if (mappedArr.hasOwnProperty(crn)) {
        mappedElem = mappedArr[crn];
        mappedElemTree = null;
        mappedElem["title"] = mappedElem["resource"];
        mappedElem["key"] = mappedElem["crn"];
        mappedElem["createddt"] = mappedElem["createddt"];
        mappedElem["createdby"] = mappedElem["createdby"];
        mappedElem["lastupdatedby"] = mappedElem["lastupdatedby"];
        mappedElem["lastupdateddt"] = mappedElem["lastupdateddt"];
        mappedElemTree = createNzTreeNode(mappedElem);
        if (mappedElem.parentcrn != null && mappedElem.parentcrn != "") {
          mappedElem.isLeaf = true;
          if (mappedArr[mappedElem["parentcrn"]]) {
            mappedElemTree.isLeaf = true;
            mappedArr[mappedElem["parentcrn"]]["nodechildren"].push(
              _.cloneDeep(mappedElemTree)
            );
            let parentnode: any = nodeChecker(
              TreeNode,
              mappedElem["parentcrn"]
            );
            if (parentnode) {
              parentnode.children.push(mappedElemTree);
            }
          }

          if (mappedArr[mappedElem["parentcrn"]])
            mappedArr[mappedElem["parentcrn"]]["children"].push(mappedElem);
        } else {
          if (mappedElem.nodechildren) {
            if (mappedElem.nodechildren.length > 0) {
              mappedElemTree.addChildren(_.cloneDeep(mappedElem.nodechildren));
            }
          }
          tree.push(mappedElem);
          TreeNode.push(_.cloneDeep(mappedElemTree));
        }
      }
    }
    return TreeNode;
  }

  // Tabs changes
  templateChange(event: any) {
    this.templateTabIndex = event.index;
    this.templateTabTitle = event['tab']['_title'];
    this.currentTab = event['tab']['_title'];
  }
  onTabDataChange(event: { tab: string; nodeId: string; formData: any }) {
    const { tab, nodeId, formData } = event;
    if (!this.allNodesData[nodeId]) {
      this.allNodesData[nodeId] = {};
    }
    this.allNodesData[nodeId][tab] = formData;
  }

  getNodeDtlsById(templateNodeId) {
    if (!templateNodeId) {
      console.error("Node ID is missing");
      return;
    }
    this.pipelineTemplateService.nodeById(templateNodeId).subscribe(
      (res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.nodeDetails = JSON.parse(response.data.meta);
        } else {
          this.message.error(response.message);
        }
      },
      (error) => {
        console.error("Error fetching node details", error);
      }
    );
  }

  updateNodeDetails() {
    if (this.notificationComponent) {
      this.notificationData = this.notificationComponent.notificationDetails();
    }
    if (this.deploymentComponent) {
      this.deploymentformData = this.deploymentComponent.getDeploymentFormData();
    }
    if(this.rollbackComponent){
      this.rollbackData = this.rollbackComponent.getRollbackFormData();
    }
    if (this.integrationsComponent) {
      this.integrationData = this.integrationsComponent.getIntegrationFormData();
    }
    const meta = [
      {
        notifications: this.notificationData,
        settings: this.deploymentformData,
        rollback_retry: this.rollbackData,
        integration: this.integrationData
      },
    ];
    const nodeDetails = {
      ...this.propertiesobj.pipelinetemplatedetails.templatedetailconfig,
      meta: meta,
      scriptcontent: this.propertiesobj.pipelinetemplatedetails
        .templatedetailconfig.scriptcontent
        ? this.propertiesobj.pipelinetemplatedetails.templatedetailconfig
            .scriptcontent
        : "",
      variabledetails: JSON.parse(this.propertiesobj.pipelinetemplatedetails.templatedetailconfig.variabledetails) || {},
      description: this.propertiesobj.pipelinetemplatedetails
        .templatedetailconfig.description
        ? this.propertiesobj.pipelinetemplatedetails.templatedetailconfig
            .description
        : "",
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.pipelineTemplateService.updateNode(nodeDetails).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
      } else {
        this.message.error(response.message);
      }
    });
  }  

}
