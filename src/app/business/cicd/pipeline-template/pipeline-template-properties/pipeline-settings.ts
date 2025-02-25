import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PipelineTemplateService } from "../pipeline-template.service";
import { AppConstant } from "src/app/app.constant";
import { PropNotificationComponent } from "./notifications/notifications.component";
import {DeploymentOptionsComponent} from '../pipeline-template-properties/deployment-options/deployment-options.component';
import { RollbackRetriesComponent } from "./rollback-retries/rollback-retries.component";
import { IntegrationsComponent } from "./integrations/integrations.component";

@Component({
  selector: "app-pipeline-settings",
  templateUrl: "./pipeline-settings.html",
})
export class PipelineTemplateProperties implements OnInit {
  @ViewChild(PropNotificationComponent) notificationComponent!: PropNotificationComponent;
  @ViewChild(DeploymentOptionsComponent) deploymentComponent!: DeploymentOptionsComponent;
  @ViewChild(RollbackRetriesComponent) rollbackComponent!: RollbackRetriesComponent;
  @ViewChild(IntegrationsComponent) integrationsComponent!: IntegrationsComponent;
  @Input() propertiesobj: any;
  @Input() mode: boolean;
  @Output() propertiesChange = new EventEmitter<any>();
  @Input() templateNodeId;
  @Input() isUpdate: boolean = false;
  @Output() propertiesTabChange = new EventEmitter<any>();
  @Output() tabChange = new EventEmitter<any>();
  @Input()templateTabIndex = 0 as number;
  templateTabTitle = "Properties";
  notificationData: any = {};
  integrationData: any = {};
  userstoragedata: any;
  deploymentformData: any = {};
  rollbackData: any = {};
  nodeDetails = [];
  currentTab: string;
  allNodesData = {};
  constructor(
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private pipelineService: PipelineTemplateService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertiesobj && changes.propertiesobj.currentValue) {
      this.propertiesobj = { ...changes.propertiesobj.currentValue };
    }
    if (changes.templateNodeId && changes.templateNodeId.currentValue) {
      const nodeid = changes.templateNodeId.currentValue
      this.getNodeDtlsById(nodeid);
    }
  }

  templateChange(event: any) {
    this.templateTabIndex = event.index;
    this.templateTabTitle = event['tab']['_title'];
    this.currentTab = event['tab']['_title'];
    this.tabChange.emit(event.index);
    if (this.templateTabIndex === 0) {
      this.propertiesChange.emit(this.propertiesobj);
    }
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
    this.pipelineService.updateNode(nodeDetails).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
      } else {
        this.message.error(response.message);
      }
    });
  }  

  onTabDataChange(event: { tab: string; nodeId: string; formData: any }) {
    const { tab, nodeId, formData } = event;
    if (!this.allNodesData[nodeId]) {
      this.allNodesData[nodeId] = {};
    }
    this.allNodesData[nodeId][tab] = formData;
    this.propertiesTabChange.emit(this.allNodesData);
  }

  getNodeDtlsById(nodeid) {
    if (!nodeid) {
      console.error('Node ID is missing');
      return;
    }
    this.pipelineService.nodeById(nodeid).subscribe(
      (res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.nodeDetails = JSON.parse(response.data.meta);
        } else {
          this.message.error(response.message);
        }
      },
      (error) => {
        console.error('Error fetching node details', error);
      }
    );
  }
  
}
