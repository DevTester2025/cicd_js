import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import {
  IResourceType,
  IAssetHdr,
} from "src/app/modules/interfaces/assetrecord.interface";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import { PipelineTemplateService } from "../../pipeline-template.service";

@Component({
  selector: "app-prop-cmdb",
  templateUrl: "./cmdb.component.html",
  styles: [
    `
      #tableContent th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }

      #tableContent td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #tableContent th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
    `,
  ],
})
export class CMDBTemplateComponent implements OnInit {
  @Input() nodeObj: any;
  @Input() activeTab: string;
  @Input() nodeDetails = [];
  CMDBFrom: FormGroup;
  resourceTypesList: IResourceType[] = [];
  filteredColumns = [];
  incomingFilteredColumns = [];
  outgoingFilteredColumns: any[] = [];
  defaultResourceType = "crn:ops:virtual_machine";
  defaultAttributes = ["Key", "Name"];
  nodeId;
  @Output() formDataChange = new EventEmitter<any>();
  constructor(
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private assetRecordService: AssetRecordService,
    private pipelineService: PipelineTemplateService,
    private message: NzMessageService
  ) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodeObj || changes.activeTab) {
      if (this.nodeObj && this.nodeObj.selectedNode) {
        this.nodeId = this.nodeObj.selectedNode.id;
        this.loadNodeFormData();
      }
    }
    if (changes.nodeDetails && changes.nodeDetails.currentValue) {
      const data = { ...changes.nodeDetails.currentValue };
      Object.values(data).forEach((node: any) => {
        if (node.cmdb) {
          while (this.outgoingResources.length) {
            this.outgoingResources.removeAt(0);
          }
          if (node.cmdb.resourcetype) {
            this.CMDBFrom.get('resourcetype').setValue(node.cmdb.resourcetype);
          }
          if (node.cmdb.attributes) {
            this.CMDBFrom.get('attributes').setValue(node.cmdb.attributes);
          } 
          if (node.cmdb.outgoingResources && node.cmdb.outgoingResources.length > 0) {
            node.cmdb.outgoingResources.forEach((outgoing, index) => {
              const resourceGroup = this.fb.group({
                outgoingResourcetype: [outgoing.outgoingResourcetype, Validators.required],
                outgoingattributes: [outgoing.outgoingattributes, Validators.required],
              });
              this.outgoingResources.push(resourceGroup);
              this.getResourceDetail(outgoing.outgoingResourcetype, 'outgoing', index);
            });
          }
        }
      });
    }
  }

  ngOnInit() {
    this.getResourceType();
    if (this.outgoingResources.length === 0) {
      this.addRow();
    }
  }

  initForm(){
    this.CMDBFrom = this.fb.group({
      resourcetype: [null, [Validators.required]],
      attributes: [null, [Validators.required]],
      outgoingResources: this.fb.array([]),
    });
    this.CMDBFrom.valueChanges.subscribe(() => {
      this.saveNodeFormData();
    });
  }
  get outgoingResources(): FormArray {
    return this.CMDBFrom.get("outgoingResources") as FormArray;
  }
  addRow(): void {
    const resourceGroup = this.fb.group({
      outgoingResourcetype: [null, Validators.required],
      outgoingattributes: [null, Validators.required],
    });
    this.outgoingResources.push(resourceGroup);
    this.outgoingFilteredColumns.push([]);
  }
  deleteRow(index: number): void {
    this.outgoingResources.removeAt(index);
    this.outgoingFilteredColumns.splice(index, 1);
  }
  getResourceType() {
    this.assetRecordService
      .getResourceTypes({
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
      })
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesList = _.orderBy(response, ["resource"], ["asc"]);
        this.CMDBFrom.get("resourcetype").setValue(this.defaultResourceType);
        this.getResourceDetail(this.defaultResourceType, {});
      });
  }

  getResourceDetail(crn: string, type?: any, index?: number) {
    if (!crn) {
      if (type === "incoming") {
        this.CMDBFrom.get("attributes").setValue(null);
        this.incomingFilteredColumns = [];
      } else if (type === "outgoing" && index !== undefined) {
        const outgoing = this.outgoingResources.at(index);
        if (outgoing) {
          outgoing.get("outgoingattributes").setValue(null);
          this.outgoingFilteredColumns[index] = [];
        }
      }
      return;
    }
    this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
        ],
        crn
      )
      .subscribe((d) => {
        let response: IAssetHdr[] = JSON.parse(d._body);
        this.filteredColumns = [];
        _.each(response, (itm: any, idx: number) => {
          itm.isSelected = itm.showbydefault ? true : false;
          if (itm.fieldtype != "Reference Asset") {
            this.filteredColumns.push(itm);
          }
          if (itm.fieldtype == "Reference Asset") {
            let referenceasset = JSON.parse(itm.referenceasset);
            _.map(referenceasset.attribute, (dtl) => {
              let attribute: any = _.find(
                AssetAttributesConstant.COLUMNS[referenceasset.assettype],
                {
                  field: dtl,
                }
              );
              this.filteredColumns.push({
                referencekey: attribute.referencekey,
                fieldname: attribute.header,
                fieldtype: itm.fieldtype,
                fieldkey: attribute.field,
                linkid: attribute.linkid,
                referenceasset: referenceasset,
                assettype: referenceasset.assettype,
              });
            });
          }
        });
        if (type === "incoming") {
          this.incomingFilteredColumns = [
            ..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"]),
          ];
          const defaultAttributeValues = this.defaultAttributes.filter((attr) =>
            this.filteredColumns.find((col) => col.fieldname === attr)
          );
          this.CMDBFrom.get("attributes").setValue(defaultAttributeValues);
        } else if (type === "outgoing" && index !== undefined) {
          this.outgoingFilteredColumns[index] = [
            ..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"]),
          ];
        }
      });
  }
  
  saveNodeFormData() {
    const formData = this.CMDBFrom.value;
    this.pipelineService.setNodeFormData(this.nodeId, this.activeTab, formData);
    this.formDataChange.emit({tab: 'cmdb', nodeId: this.nodeId, formData });
  }

  loadNodeFormData() {
    const savedData = this.pipelineService.getNodeFormData(this.nodeId, this.activeTab);  
    if (savedData) {
      this.setFormData(savedData);
    } else {
      this.initForm();
      this.resetFormArrays();
    }
  }
  
  setFormData(data: any): void {
    this.CMDBFrom.reset();
    this.resetFormArrays();
    if (data.resourcetype) {
      this.CMDBFrom.get('resourcetype').setValue(data.resourcetype);
    }
    if (data.attributes) {
      this.CMDBFrom.get('attributes').setValue(data.attributes);
    }
    if (data.outgoingResources && data.outgoingResources.length > 0) {
      data.outgoingResources.forEach((outgoing, index) => {
        const resourceGroup = this.fb.group({
          outgoingResourcetype: [outgoing.outgoingResourcetype, Validators.required],
          outgoingattributes: [outgoing.outgoingattributes, Validators.required],
        });
        this.outgoingResources.push(resourceGroup);
        this.getResourceDetail(outgoing.outgoingResourcetype, 'outgoing', index);
      });
    } else {
      this.addRow();
    }
  }
  
  resetFormArrays(): void {
    const outgoingResources = this.CMDBFrom.get('outgoingResources') as FormArray;
    while (outgoingResources.length !== 0) {
      outgoingResources.removeAt(0);
    }
    this.outgoingFilteredColumns = [];
  }

  formValidate(){
    if (!this.CMDBFrom.get('resourcetype').valid) {
      this.message.error(AppConstant.VALIDATIONS.CMDBMSG.RESOURCETYPE);
      return;
    }
    if (!this.CMDBFrom.get('attributes').valid) {
      this.message.error(AppConstant.VALIDATIONS.CMDBMSG.ATTRIBUTES);
      return;
    }
    const outgoingResources = this.CMDBFrom.get(
      "outgoingResources"
    ) as FormArray;

    const invalidRows = outgoingResources.controls.findIndex(
      (resourceGroup) =>
        !resourceGroup.get("outgoingResourcetype").valid ||
        !resourceGroup.get("outgoingattributes").valid
    );

    if (invalidRows !== -1) {
      this.message.error(AppConstant.VALIDATIONS.CMDBMSG.OUTGOING);
      return;
    }

  }
}
