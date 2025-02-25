import * as _ from "lodash";
import { NzFormatEmitEvent, NzTreeNodeOptions, NzTreeNode, NzTreeComponent, NzMessageService, NzModalService } from 'ng-zorro-antd';
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { Component, OnInit, ViewChild } from '@angular/core';
import { ITreeState, ITreeOptions, TreeComponent  } from 'angular-tree-component';
import { IResourceType } from "src/app/modules/interfaces/assetrecord.interface";
import { v4 } from 'uuid';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "src/app/modules/services/shared/common.service";
import {
  ColDef,
  RowDragEndEvent,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  CellClickedEvent
} from 'ag-grid-community';

@Component({
  selector: 'app-workpack-list',
  templateUrl: './workpack-list.component.html',
  styleUrls: ['./workpack-list.component.css']
})
export class WorkpackListComponent implements OnInit {
  @ViewChild('tree') tree: TreeComponent;
  resourceTypesTreeList: any[] = [];
  loading = false;
  isVisible = false;
  formTitle = 'Add Workpack Resource';
  resourceForm: FormGroup;
  userstoragedata = {} as any;
  resourceModuleList=AppConstant.RESOURCETYPE_MODULE;
  buttonText = '';
  isClone: boolean = false;
  resourceFormErrorObj = {
    resourcetype: {
      required: "Please Enter Resource Type",
    },
    module: {
      required: "Please select Module"
    },
  };
  crnValue = '';
  templateTreeList: any;
  private gridApi: GridApi;
  defaultColDef: any = {
    flex: 1,
  };
  state: ITreeState = {
    expandedNodeIds: {
      1: true,
      2: true
    },
    hiddenNodeIds: {},
    activeNodeIds: {}
  };
  options: ITreeOptions = {
    allowDrag: true,
    getNodeClone: (node) => ({
      ...node.data,
      id: v4(),
      name: `copy of ${node.data.name}`
    })
  };

  nodes = [
    {
      id: 1,
      name: 'root1',
      children: [
        { name: 'child1' },
        { name: 'child2' }
      ]
    },
    {
      name: 'root2',
      id: 2,
      children: [
        { name: 'child2.1', children: [] },
        {
          name: 'child2.2', children: [
            { name: 'grandchild2.2.1' }
          ]
        }
      ]
    },
    { name: 'root3' },
    { name: 'root4', children: [] },
    { name: 'root5', children: null }
  ];
  public groupDefaultExpanded = -1;
  public getDataPath: GetDataPath = (data: any) => {
    return data.filePath;
  };
  public getRowId = (params) => {
    return params.data.id;
  };
  treeTableSearchbox = "";
  selectedTreeTableNodes: any;
  public columnDefs: ColDef[] = [

    {
      headerName: "Title", field: 'title', cellRenderer: 'agGroupCellRenderer', cellRendererParams: {
        suppressCount: true,
      }, width: 250, rowDrag: true
    }];
  public gridOptions = {
    rowSelection: 'single',
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    suppressAggFuncInHeader: true,
    suppressRowClickSelection: true,
    onCellClicked: (event: CellClickedEvent) => {
      if (event.data) {
        this.selectedTreeTableNodes = event.data;
        this.treeTableSearchbox = event.data.title;
      }
    },
    onRowClicked: (event: any) => {
    },
    getNodeChildDetails: function getNodeChildDetails(rowItem) {
      if (rowItem.children) {
        return {
          group: true,
          // open C be default
          expanded: true,
          // provide ag-Grid with the children of this group
          children: rowItem.children,
          // the key is used by the default group cellRenderer
          key: rowItem.title
        };
      } else {
        return null;
      }
    },
    onGridReady: (params) => {
      this.gridApi = params.api;
    }
  };
  modelCrn = '';
  isTreeVisible: boolean = false;
  selectedTreeNodes: any;
  resourceTypesList: IResourceType[] = [];
  workpackTemplateList: IResourceType[] = [];
  selectedWorkpackTitle = "";
  isViewVisible = false;
  resourceDetails = {} as any;
  resourceId;
  crnDetails;
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private commonService: CommonService,
    private modalService: NzModalService
  ) { 
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getResourceType('all');
    this.resourceForm = this.fb.group({
      resourcetype: [null, Validators.required],
      parentcrn:[""],
      module:[AppConstant.RESOURCETYPE_MODULE[1], Validators.required],
    });
  }

  expandAllNodes() {
      this.tree.treeModel.expandAll();
  }

  onMoveNode(event) {
    this.modalService.confirm({
      nzTitle: `Are you sure you want to move this ${event.node.name}?`,
      nzContent: '',
      nzOnOk: () => {
        let formData = {
          tenantid: this.userstoragedata.tenantid,
          crn: event.node.key,
          parentcrn: event.to.parent.key,
          status: AppConstant.STATUS.ACTIVE,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        this.assetRecordService.update(formData).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(`${event.node.name}` + "node moved successfully");
            this.addUpdateComment(event);
            this.getResourceType();
          } else {
            this.message.error(response.message);
          }
        });
      },
      nzOnCancel: () => {
        this.getResourceType();
      }
    });
  }

  addUpdateComment(data) {
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      crn: data.node.key,
      resourceid: "",
      comment: `The ${data.node.name} is moved to ${data.to.parent.name}`,
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.userstoragedata["fullname"],
      createddt: new Date(),
      lastupdatedby: this.userstoragedata["fullname"],
      lastupdateddt: new Date(),
    } as any;
      this.assetRecordService.createComment(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
        } else {
          this.message.error(response.message);
        }
      });
  }
  

  clearForm(){
    this.resourceForm = this.fb.group({
      resourcetype: [null, Validators.required],
      parentcrn:[""],
      module:[AppConstant.RESOURCETYPE_MODULE[1], Validators.required],
    });
  }

  nzEvent(event: NzFormatEmitEvent): void {
  }
  onRowDragEnd(event: RowDragEndEvent) {
    // this is the row the mouse is hovering over
    var overNode = event.overNode;
    if (!overNode) {
      return;
    }
    // folder to drop into is where we are going to move the file/folder to
    var folderToDropInto =
      overNode.data.type === 'folder'
        ? // if over a folder, we take the immediate row
        overNode
        : // if over a file, we take the parent row (which will be a folder)
        overNode.parent;
    // the data we want to move
    var movingData = event.node.data;
    // take new parent path from parent, if data is missing, means it's the root node,
    // which has no data.
    var newParentPath = folderToDropInto!.data
      ? folderToDropInto!.data.filePath
      : [];
    var needToChangeParent = !this.arePathsEqual(newParentPath, movingData.filePath);
    // check we are not moving a folder into a child folder
    var invalidMode = this.isSelectionParentOfTarget(event.node, folderToDropInto);
    if (invalidMode) {
    }
    if (needToChangeParent && !invalidMode) {
      var updatedRows: any[] = [];
      this.moveToPath(newParentPath, event.node, updatedRows);
      this.gridApi.clearFocusedCell();
    }
  }
  isSelectionParentOfTarget(
    selectedNode: any,
    targetNode: any | null
  ) {
    let children = [...(selectedNode.childrenAfterGroup || [])];
    if (!targetNode) {
      return false;
    }
    while (children.length) {
      const node = children.shift();
      if (!node) {
        continue;
      }
      if (node.key === targetNode.key) {
        return true;
      }
      if (node.childrenAfterGroup && node.childrenAfterGroup.length) {
        children.push(...node.childrenAfterGroup);
      }
    }
    return false;
  }
  moveToPath(
    newParentPath: string[],
    node: any,
    allUpdatedNodes: any[]
  ) {
    // last part of the file path is the file name
    var oldPath = node.data.filePath;
    var fileName = oldPath[oldPath.length - 1];
    var newChildPath = newParentPath.slice();
    newChildPath.push(fileName);
    node.data.filePath = newChildPath;
    allUpdatedNodes.push(node.data);
    if (node.childrenAfterGroup) {
      node.childrenAfterGroup.forEach((childNode) => {
        this.moveToPath(newChildPath, childNode, allUpdatedNodes);
      });
    }
  }
  arePathsEqual(path1: string[], path2: string[]) {
    if (path1.length !== path2.length) {
      return false;
    }
    var equal = true;
    path1.forEach(function (item, index) {
      if (path2[index] !== item) {
        equal = false;
      }
    });
    return equal;
  }
  getResourceType(mode?: any, value?: any) {
    this.loading = true;
    let req: any = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      status: AppConstant.STATUS.ACTIVE,
      module: AppConstant.RESOURCETYPE_MODULE[1]
    };
    if (mode == AppConstant.RESOURCETYPE_MODULE[1]) {
      req.parentcrn = value;
    }
    this.assetRecordService
      .getResourceTypes(
        req,
        "treestructure=true"
      )
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesTreeList = this.formatTree(_.cloneDeep(response));
        this.templateTreeList = this.unflattenTree(_.cloneDeep(response));
        setTimeout(() => {
          this.expandAllNodes();
        }, 0);
        if (this.modelCrn && this.modelCrn != "") {
          this.selectedTreeNodes = this.modelCrn;
          let selectedwrkpk = _.find(response, (d) => {
            return d.crn == this.modelCrn;
          });
          if (selectedwrkpk) {
            this.selectedWorkpackTitle = selectedwrkpk.resource;
          }
          setTimeout(() => {
            this.onChangeTree(this.selectedTreeNodes);
          }, 1500);
        }
        _.map(response, (d: any) => {
          d.checked = false;
          return d;
        });
        let list = _.orderBy(response, ["id"], ["asc"]);
        if (mode == AppConstant.RESOURCETYPE_MODULE[1]) {
          this.workpackTemplateList = list;
        }
        else
          this.resourceTypesList = _.orderBy(response, ["id"], ["asc"]);
      });
  }
  onFirstDataRendered(params: any) {
    if (params) {
      params.api.sizeColumnsToFit();
    }
  }
  onGridReady(params) {
    this.gridApi = params.api;
  }
  onTreeSelectionChanged(event) {
  }
  onGridClick(event) {
    const selectedRows = this.gridApi.getSelectedRows();
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }
  selectTreeTableNode() {
    if (this.selectedTreeTableNodes) {
      this.selectedWorkpackTitle = this.selectedTreeTableNodes.title;
      this.modelCrn = this.selectedTreeTableNodes.key;
      this.selectedTreeNodes = this.selectedTreeTableNodes.key;
      this.onChangeTree(this.selectedTreeTableNodes.key);
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
        name: mapped["resource"],
        key: mapped["crn"],
        children: [],
        isLeaf: false
      })
    }
    let nodeChecker = (entry, find) => {
      let result;
      for (let el of entry) {
        if (el.key == find) {
          result = el;
          break;
        }
        else if (el.children.length > 0) {
          result = nodeChecker(el.children, find);
        }
      }
      return result;
    }
    // First map the nodes of the array to an object -> create a hash table.
    for (var i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i];
      arrElem["isLeaf"] = false;
      arrElem
      mappedArr[arrElem.crn] = arrElem;
      mappedArr[arrElem.crn]['children'] = [];
      mappedArr[arrElem.crn]['nodechildren'] = [];
    }
    for (var crn in mappedArr) {
      if (mappedArr.hasOwnProperty(crn)) {
        mappedElem = mappedArr[crn];
        mappedElemTree = null;
        mappedElem["title"] = mappedElem["resource"];
        mappedElem["name"] = mappedElem["resource"];
        mappedElem["key"] = mappedElem["crn"];
        mappedElemTree = createNzTreeNode(mappedElem);
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentcrn != null && mappedElem.parentcrn != "") {
          mappedElem.isLeaf = true;
          if (mappedArr[mappedElem['parentcrn']]) {
            mappedElemTree.isLeaf = true;
            mappedArr[mappedElem['parentcrn']]['nodechildren'].push(_.cloneDeep(mappedElemTree));
            let parentnode: any = nodeChecker(TreeNode, mappedElem['parentcrn']);
            if (parentnode) {
              parentnode.addChildren([mappedElemTree]);
            }
          }

          if (mappedArr[mappedElem['parentcrn']])
            mappedArr[mappedElem['parentcrn']]['children'].push(mappedElem);
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
    this.loading = false;
    return TreeNode;
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
        name: mapped["resource"],
        createddt: mapped["createddt"],
        createdby: mapped["createdby"],
        lastupdatedby: mapped["lastupdatedby"],
        lastupdateddt: mapped["lastupdateddt"],
        key: mapped["crn"],
        parentcrn: mapped["parentcrn"],
        module: mapped["module"],
        children: [],
        isLeaf: false
      }
    }
    let nodeChecker = (entry, find) => {
      let result;
      for (let el of entry) {
        if (el.key == find) {
          result = el;
          break;
        }
        else if (el.children.length > 0) {
          result = nodeChecker(el.children, find);
        }
      }
      return result;
    }
    // First map the nodes of the array to an object -> create a hash table.
    for (var i = 0, len = arr.length; i < len; i++) {
      arrElem = arr[i];
      arrElem["isLeaf"] = false;
      arrElem
      mappedArr[arrElem.crn] = arrElem;
      mappedArr[arrElem.crn]['children'] = [];
      mappedArr[arrElem.crn]['nodechildren'] = [];
    }
    for (var crn in mappedArr) {
      if (mappedArr.hasOwnProperty(crn)) {
        mappedElem = mappedArr[crn];
        mappedElemTree = null;
        mappedElem["title"] = mappedElem["resource"];
        mappedElem["name"] = mappedElem["resource"];
        mappedElem["key"] = mappedElem["crn"];
        mappedElem["createddt"] = mappedElem["createddt"];
        mappedElem["createdby"] = mappedElem["createdby"];
        mappedElem["lastupdatedby"] = mappedElem["lastupdatedby"];
        mappedElem["lastupdateddt"] = mappedElem["lastupdateddt"];
        mappedElemTree = createNzTreeNode(mappedElem);
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentcrn != null && mappedElem.parentcrn != "") {
          mappedElem.isLeaf = true;
          if (mappedArr[mappedElem['parentcrn']]) {
            mappedElemTree.isLeaf = true;
            mappedArr[mappedElem['parentcrn']]['nodechildren'].push(_.cloneDeep(mappedElemTree));
            let parentnode: any = nodeChecker(TreeNode, mappedElem['parentcrn']);
            if (parentnode) {
              parentnode.children.push(mappedElemTree);
            }
          }

          if (mappedArr[mappedElem['parentcrn']])
            mappedArr[mappedElem['parentcrn']]['children'].push(mappedElem);
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
  onChangeTree(event) {
  }
  closeDrawer() {
    this.isVisible = false;
    this.isViewVisible = false
    this.clearForm();
  }

  addResourceType(data){
    this.formTitle =  data.name;
    this.resourceForm.controls["parentcrn"].setValue(
      data.key
    );
    this.isVisible = true;
    this.isClone = false;
    this.buttonText = AppConstant.BUTTONLABELS.SAVE;
  }
  
  cloneResource(data){
    this.formTitle =  data.name;
    this.crnValue = data.key
    this.resourceForm.controls["parentcrn"].setValue(
      data.parentcrn
    );
    this.isVisible = true;
    this.isClone = true;
    this.buttonText = AppConstant.BUTTONLABELS.CLONE;
  }

  saveResource(data){
    let formdata = {} as any;
    let errorMessage: any;
    if (!this.resourceForm.valid) {
      errorMessage = this.commonService.getFormErrorMessage(
        this.resourceForm,
        this.resourceFormErrorObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }else {
      if(this.isClone){
        formdata = {
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
          createdby: this.userstoragedata.fullname,
          lastupdatedby: this.userstoragedata.fullname,
          parentcrn:data.parentcrn,
          resourcetype: data.resourcetype,
          crn: this.crnValue,
          newCrn: AppConstant.CRNPREFIX.CRN + data.resourcetype.toLowerCase().replace(/[^A-Z0-9]+/gi, "_"), 
        }
        this.assetRecordService.clone(formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.message.success(AppConstant.MESSAGES.CLONED);
              this.isVisible = false;
              this.getResourceType();
            } else {
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error(err);
            this.message.error(AppConstant.ERRORMESSAGE.ERROR);
          }
        );
     }else{
       formdata = {
         tenantid: this.userstoragedata.tenantid,
         crn:
           AppConstant.CRNPREFIX.CRN +
           data.resourcetype.toLowerCase().replace(/[^A-Z0-9]+/gi, "_"),
         resourcetype: data.resourcetype,
         parentcrn:data.parentcrn,
         module:data.module,
         status:
           data.status === false
             ? AppConstant.STATUS.INACTIVE
             : AppConstant.STATUS.ACTIVE,
         lastupdatedby: this.userstoragedata.fullname,
         lastupdateddt: new Date(),
         isrecordtype: true,
       };
       formdata.status = AppConstant.STATUS.ACTIVE;
           formdata.createdby = this.userstoragedata.fullname;
           formdata.createddt = new Date();
           formdata.identifier = 0;
           formdata.fieldname = AppConstant.FIELDVALUES.FIELDKEY;
           formdata.fieldkey = formdata.crn + AppConstant.CRNPREFIX.KEY;
           formdata.fieldtype = AppConstant.FIELDVALUES.FIELDTYPE;
           formdata.showbydefault = 1;
           formdata.isrecordtype = true;
           formdata.prefix = formdata.fieldname;
           formdata.curseq = "1";
           formdata.ordernumber = 1;
           formdata.defaultattributes = [
             {
               createdby: this.userstoragedata.fullname,
               createddt: new Date(),
               identifier: 1,
               fieldname: AppConstant.FIELDVALUES.FIELDNAME,
               fieldkey: formdata.crn + AppConstant.CRNPREFIX.NAME,
               fieldtype: AppConstant.FIELDVALUES.FIELDTYPETEXT,
               showbydefault: 1,
               status: AppConstant.STATUS.ACTIVE,
               tenantid: formdata.tenantid,
               crn: formdata.crn,
               resourcetype: formdata.resourcetype,
               parentcrn:data.parentcrn,
               ordernumber:2,
               operationtype: AppConstant.RESOURCETYPE_MODULE[0]
             },
           ];
       this.assetRecordService.create(formdata).subscribe(
         (res) => {
           const response = JSON.parse(res._body);
           if (response.status) {
             this.message.success(response.message);
             this.isVisible = false;
             this.getResourceType();
           } else {
             this.message.error(response.message);
           }
         },
         (err) => {
           this.message.error(AppConstant.ERRORMESSAGE.ERROR);
         }
       );
     }
    }
  }

  deleteRecordType(data){
    let formdata = {};
    formdata = {
      tenantid: this.userstoragedata.tenantid,
      crn: data.key,
      status: AppConstant.STATUS.DELETED,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };
    this.assetRecordService.update(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(AppConstant.MESSAGES.DELETED);
        this.getResourceType();
      } else {
        this.message.error(response.message);
      }
    });
  }

  logsView(data){
    this.isViewVisible = true;
    this.formTitle = data.name;
    this.resourceDetails = data;
    this.resourceId = "";
    this.crnDetails = data.key;
  }
}
