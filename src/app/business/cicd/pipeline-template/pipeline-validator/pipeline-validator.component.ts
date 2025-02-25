import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";

@Component({
  selector: "app-pipeline-validator",
  templateUrl: "./pipeline-validator.component.html",
  styleUrls: ["./pipeline-validator.component.css"],
})
export class PipelineValidatorComponent implements OnInit, OnChanges {
  userstoragedata: any = {};
  @ViewChild("logTextarea") logTextarea: ElementRef;
  @Output() openSidebar = new EventEmitter<CustomEvent>();
  @Output() closeDrawer: EventEmitter<boolean> = new EventEmitter();
  @Input() exportObj = {} as any;
  @Input() nodeValidation:any;
  @Input() defaultPipelineTemplateObj: any;
  isOrchestration: boolean = false;
  orchname = "";
  screens = [];
  nodes: any[] = [];
  constructor(private localStorageService: LocalStorageService) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.exportObj && changes.exportObj.currentValue) {
      if (this.exportObj && this.exportObj.nodes) {
        this.processData(this.exportObj.nodes);
      }
      if (this.exportObj.workflowsettings) {
        this.isOrchestration = true;
        this.orchname = this.exportObj.workflowsettings.name;
      }
    } else if (
      this.defaultPipelineTemplateObj &&
      this.defaultPipelineTemplateObj.nodes
    ) {
      this.processData(this.defaultPipelineTemplateObj.nodes);
    }
  }

  ngOnInit(): void {}

  processData(templateObj: any): void {
    this.nodes = [];
    if (templateObj) {
      templateObj.forEach((item: any) => {
        const nodeValidations = this.nodeValidation ? this.nodeValidation.find((nodeData) => nodeData.id === item.params.id) || {} : {};
        const setupDetails = item.data || {};
        let status = AppConstant.NODE_STATUS[0];
        let passNode = 0;
        let failNode = 0;
        let svgUrl =
          AppConstant.NODE_ICONS[item.name] ||
          AppConstant.NODE_ICONS[setupDetails.name];
        let requiredFields: string[] = [];
        let passFields: string[] = [];
        let failFields: string[] = [];
        
        // orchestration validation fields
        if (item.name === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[0]) {
          if (!setupDetails || Object.keys(setupDetails).length === 0) {
            requiredFields.push(...AppConstant.ORCHNODE_FIELDS.SessionNode);
          } else {
            requiredFields.push(...AppConstant.ORCHNODE_FIELDS[item.name]);
          }
          if (
            !setupDetails.ipaddress &&
            setupDetails.ip_type ===
              AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[3]
          ) {
            requiredFields.push(
              AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[0]
            );
          }
          if (
            setupDetails.authentication_type ===
            AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[3]
          ) {
            if (!setupDetails.userid) {
              requiredFields.push(
                AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[1]
              );
            }
            if (!setupDetails.password) {
              requiredFields.push(
                AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[2]
              );
            }
          } else if (
            setupDetails.authentication_type ===
            AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[4]
          ) {
            if (!setupDetails.userid) {
              requiredFields.push(
                AppConstant.ORCH_SESSIONNODE[0].SESSIONNODE_FIELDS[1]
              );
            }
          }
        } else {
          requiredFields.push(...AppConstant.ORCHNODE_FIELDS[item.name]);
        }
          
        // Pipline validation fields
        if (
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[2]
        ) {
          if (
            setupDetails.urlvariable !== null ||
            setupDetails.accesstokenvariable !== null ||
            setupDetails.usernamevariable !== null
          ) {
            requiredFields.push(
              ...[
                AppConstant.NODE_FIELDS.DOCKERHUB[0],
                AppConstant.NODE_FIELDS.DOCKERHUB[3],
                ...AppConstant.SPECIfIC_NODEFIELD.slice(0, 3),
              ]
            );
          } else {
            requiredFields.push(...AppConstant.NODE_FIELDS.DOCKERHUB);
          }
        }
        if (
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[3]
        ) {
          if (
            setupDetails.urlvariable !== null ||
            setupDetails.accesstokenvariable !== null
          ) {
            requiredFields.push(
              AppConstant.NODE_FIELDS.SONARQUBE[0],
              ...AppConstant.SPECIfIC_NODEFIELD.slice(0, 2)
            );
          } else {
            requiredFields.push(...AppConstant.NODE_FIELDS.SONARQUBE);
          }
        }
        if (
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[4]
        ) {
          if (
            setupDetails.usernamevariable !== null ||
            setupDetails.ipaddressvariable !== null ||
            setupDetails.passwordvariable !== null
          ) {
            requiredFields.push(
              AppConstant.NODE_FIELDS.ENVIRONMENTS[3],
              ...AppConstant.SPECIfIC_NODEFIELD.slice(2, 5)
            );
          } else {
            requiredFields.push(...AppConstant.NODE_FIELDS.ENVIRONMENTS);
          }
        } else if (
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[1]
        ) {
          requiredFields.push(...AppConstant.NODE_FIELDS.GITHUB);
        } else if (item.name === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[5]) {
          requiredFields.push(...AppConstant.NODE_FIELDS.BUILD);
        } else if (
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[6] ||
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[7] ||
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[8] ||
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[9] ||
          setupDetails.type === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[10] ||
          setupDetails.name === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[11] ||
          setupDetails.name === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[12] ||
          setupDetails.name === AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[13]
        ) {
          requiredFields.push(...AppConstant.NODE_FIELDS.COMMON_FIELD);
        }

        requiredFields.forEach((field) => {
          if (field) {
            const value = setupDetails[field];
            const formattedField = field.replace(/([A-Z])/g, " $1").trim();
            if (
              value !== null &&
              value !== undefined &&
              value.toString().trim() !== ""
            ) {
              passFields.push(
                formattedField.charAt(0).toUpperCase() + formattedField.slice(1)
              );
              passNode++;
            } else {
              failFields.push(
                formattedField.charAt(0).toUpperCase() + formattedField.slice(1)
              );
              failNode++;
            }
          }
        });

        if (failNode > 0) {
          status = AppConstant.NODE_STATUS[1];
        }
        this.nodes.push({
          name: item.name === AppConstant.NODE_STATUS[2] ? setupDetails.name : setupDetails.type || item.name,
          nodename: AppConstant.ORCH_SESSIONNODE[0].NODE_NAME[4] ? item.params.label : setupDetails.name,
          status: status,
          passnode: passNode,
          failnode: failNode,
          referenceType:
            setupDetails.name || setupDetails.instancename || item.params.label,
          passfields: passFields,
          failfields: failFields,
          svgImg: svgUrl,
          nodeValid: nodeValidations ? nodeValidations : {},
        });
      });
    }
  }

  showMessage(nodeId: number, status: string) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.status = status;
    }
  }
  onFieldChange(nodeType: string) {
    const nodes = this.exportObj.nodes || [];
    const node = nodes.find(
      (n) =>
        n.data.name === nodeType ||
        n.data.instancename === nodeType ||
        n.params.label === nodeType
    );
    if (node) {
      const selectedDetails = node.data;
      let detail = {
        selectedNode: {
          referenceid: node.referenceid,
          name: node.referencetype,
          _label: selectedDetails.name || selectedDetails.instancename,
          _data: selectedDetails,
        },
      };
      const customEvent = new CustomEvent("openSidebar", { detail });
      this.openSidebar.emit(customEvent);
      this.closeDrawer.emit(false);
    }
  }

  formatNodeName(nodeName: string) {
    return nodeName.replace(/([a-z])([A-Z])/g, "$1 $2");
  }
}
