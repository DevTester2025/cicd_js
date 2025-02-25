import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { WorkpackConstant } from "src/app/workpack.constant";
import { AWSAppConstant } from "src/app/aws.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { Router, ActivatedRoute } from "@angular/router";
import {
  ColDef,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
} from "ag-grid-community";
import '../../../../../presentation/web/styling/grid-styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// import 'ag-grid-enterprise';
// import '../styles.css';
import { UsersService } from "src/app/business/admin/users/users.service";
import {
  IResourceType,
  IAssetHdr,
  IAssetDtl,
} from "src/app/modules/interfaces/assetrecord.interface";
@Component({
  selector: "app-workpackselection",
  templateUrl: "./workpackselection.component.html",
})
export class WorkpackSelectiontComponent implements OnInit {
  @Output() notifyTaskSelection = new EventEmitter();
  treeTableSearchbox = "";
  private gridApi: GridApi;
  selectedTreeTableNodes: any;
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

    // { headerName: "Updated By", field: "lastupdatedby",width: 100 },
    // { headerName: "Updated Date", field: "lastupdateddt",width: 100 },
    // {
    //     headerName: "Athlete",
    //     field: "athlete",
    //     headerCheckboxSelection: true,
    //     headerCheckboxSelectionFilteredOnly: true,
    //     checkboxSelection: true
    //   }
  ];
  public gridOptions = {
    rowSelection: "single",
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    suppressAggFuncInHeader: true,
    suppressRowClickSelection: true,
    onCellClicked: (event: CellClickedEvent) => {
      console.log("Cell was clicked", event.data);
      if (event.data) {
        this.selectedTreeTableNodes = event.data;
        this.treeTableSearchbox = event.data.title;
      }
    },
    onRowClicked: (event: any) => {
      console.log("row was clicked");
    },
    // groupRowRendererParams : {
    //   suppressCount: true
    // },
    getNodeChildDetails: function getNodeChildDetails(rowItem) {
      if (rowItem.children) {
        return {
          group: true,
          // open C be default
          expanded: true,
          // provide ag-Grid with the children of this group
          children: rowItem.children,
          // the key is used by the default group cellRenderer
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
  templateTreeList: any;
  constructor(
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    // private workPackService: WorkPackService,
    private commonService: CommonService,
    private router: Router,
    private assetRecordService: AssetRecordService,
    private routes: ActivatedRoute,
    private userService: UsersService
  ) {
    this.getResourceType();
  }

  ngOnInit() {}
  getResourceType(mode?: any, value?: any) {
    let req: any = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      module: AppConstant.RESOURCETYPE_MODULE[1],
    };
    if (mode == "workpack") {
      req.parentcrn = value;
    }
    this.assetRecordService
      .getResourceTypes(req, "treestructure=true")
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.templateTreeList = this.unflattenTree(_.cloneDeep(response));
      });
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
          console.log(mappedElem);
        }
        if (mappedElem["parentcrn"] == "crn:ops:workpack_model_1") {
          console.log(mappedElem);
        }
        if (mappedElem["crn"] == "crn:ops:workpack_model_1") {
          console.log(mappedElem);
        }
        mappedElemTree = null;
        mappedElem["title"] = mappedElem["resource"];
        mappedElem["key"] = mappedElem["crn"];
        mappedElem["createddt"] = mappedElem["createddt"];
        mappedElem["createdby"] = mappedElem["createdby"];
        mappedElem["lastupdatedby"] = mappedElem["lastupdatedby"];
        mappedElem["lastupdateddt"] = mappedElem["lastupdateddt"];
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
              parentnode.children.push(mappedElemTree);
              // parentnode.addChildren([mappedElemTree]);
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
    console.log(tree);
    console.log(TreeNode);
    return TreeNode;
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(
      (document.getElementById("filter-text-box") as HTMLInputElement).value
    );
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }
  onFirstDataRendered(params: any) {
    if (params) {
      params.api.sizeColumnsToFit();
    }
  }
  onTreeSelectionChanged(event) {
    console.log(event);
  }
  onGridClick(event) {
    const selectedRows = this.gridApi.getSelectedRows();

    console.log(selectedRows);
  }
  selectTreeTableNode() {
    if (this.selectedTreeTableNodes) {
      this.notifyTaskSelection.next({
        title : this.selectedTreeTableNodes.title,
        crn : this.selectedTreeTableNodes.key
      });
      // this.selectedWorkpackTitle=this.selectedTreeTableNodes.title;
      // this.modelCrn=this.selectedTreeTableNodes.key;
      // this.selectedTreeNodes = this.selectedTreeTableNodes.key;
      // this.onChangeTree(this.selectedTreeTableNodes.key);
      // this.isTreeVisible=false;
    }
  }
}
