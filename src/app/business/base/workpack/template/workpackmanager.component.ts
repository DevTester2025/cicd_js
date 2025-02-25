import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { WorkpackConstant } from "src/app/workpack.constant";
import { AWSAppConstant } from "src/app/aws.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { Router, ActivatedRoute } from '@angular/router';
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Buffer } from "buffer";
import downloadService from "src/app//modules/services/shared/download.service";
import * as MarkJs from "mark.js";
import { NzFormatEmitEvent, NzTreeNodeOptions, NzTreeNode } from 'ng-zorro-antd';
import {
  IResourceType,
  IAssetHdr,
  IAssetDtl,
} from "src/app/modules/interfaces/assetrecord.interface";
import { TreeNode } from 'primeng/api';
import { WorkpackService } from 'src/app/business/base/workpack/workpack.service';
import { DomSanitizer } from '@angular/platform-browser'
import {
  ColDef,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  CellClickedEvent
} from 'ag-grid-community';
import '../../../../presentation/web/styling/grid-styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// import 'ag-grid-enterprise';
// import '../styles.css';
import { UsersService } from "src/app/business/admin/users/users.service";
import { SrmService } from "src/app/business/srm/srm.service";
@Component({
  selector: "app-workpackmanager",
  templateUrl: "./workpackmanager.component.html",
  styleUrls: ["./workpackmanager.component.css"],
})
export class WorkpackManagertComponent implements OnInit {
  @ViewChild('treeCom') treeCom;
  @ViewChild('downloadableDiv') downloadableDiv: ElementRef;
  loading = false;
  visibleadd = false;
  visibleonly = false;
  tableHeader = WorkpackConstant.COLUMNS.WORKPACKTEMPLATE;
  formTitle = "Add Tickets";
  resourceTypesList: IResourceType[] = [];
  resourceTypesTreeList: any[] = [];
  templateTreeList: any;
  treeOptions: any = {
    idField: 'crn',
    displayField: 'resource',
    childrenField: 'children'
  };
  selectedTreeNodes: any;
  externalRefList: IResourceType[] = [];
  workpackTemplateList: IResourceType[] = [];
  selectedModel;
  selectedExternalRef;
  pageIndex = 1;
  pageSize = 10;
  pageCount = AppConstant.pageCount;
  resource = {};
  selectedResourceName = "";
  filteredColumns = [];
  gettingAssets = false;
  assets = [] as Record<string, any>[];
  assetsCount = 0;
  selectedFields = null as null | any[];
  selectedResource = [];
  currentSortColumn = null;
  currentSortColumnOrder = null;
  globalSearchModel = "";
  isdownload = false;
  tableconfig = {
    scroll: { x: "1700px" },
    apisort: true,
    columnselection: true,
    edit: false,
    delete: false,
    workflow: true,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    loading: false,
    pageSize: 10,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px", "25px"],
    refresh: true,
  };
  // templateList = [];
  buttonText = "Add";
  userstoragedata: any;
  screens = [];
  appScreens = {} as any;
  isVisible: boolean = false;
  selectedcolumns: any = {};
  filterValues = {};
  templateObj = {};
  filterForm: FormGroup;
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  assetTypes: any = [];
  customerList: any = [];
  filters = { component: null, customer: null, asset: null } as any;
  componentList: any = [];
  dataloading: boolean = false;
  selectedWorkflowTask;
  resoruceTitle = "";
  isWorkflowVisible: boolean = false;
  workflow_config = {
    assignee_placeholder: "Installer/Executor",
    workflowformTitle: "",
    tabltitle_info: "Info",
    tabltitle_comments: "Comments",
    tabltitle_document: "Documents"
  };
  workflowformTitle = "Workpack Execution";
  modelCrn = '';
  selectedWorkpackTitle = "";
  isTreeVisible: boolean = false;
  searchValue;
  treeData: TreeNode[] = [
    {
      "data": {
        "name": "Documents",
        "size": "75kb",
        "type": "Folder"
      },
      "children": [
        {
          "data": {
            "name": "Work",
            "size": "55kb",
            "type": "Folder"
          },
          "children": [
            {
              "data": {
                "name": "Expenses.doc",
                "size": "30kb",
                "type": "Document"
              }
            },
            {
              "data": {
                "name": "Resume.doc",
                "size": "25kb",
                "type": "Resume"
              }
            }
          ]
        },
        {
          "data": {
            "name": "Home",
            "size": "20kb",
            "type": "Folder"
          },
          "children": [
            {
              "data": {
                "name": "Invoices",
                "size": "20kb",
                "type": "Text"
              }
            }
          ]
        }
      ]
    },
    {
      "data": {
        "name": "Pictures",
        "size": "150kb",
        "type": "Folder"
      },
      "children": [
        {
          "data": {
            "name": "barcelona.jpg",
            "size": "90kb",
            "type": "Picture"
          }
        },
        {
          "data": {
            "name": "primeui.png",
            "size": "30kb",
            "type": "Picture"
          }
        },
        {
          "data": {
            "name": "optimus.jpg",
            "size": "30kb",
            "type": "Picture"
          }
        }
      ]
    }
  ];
  private gridApi: GridApi;
  treeTableSearchbox = "";
  selectedTreeTableNodes: any;
  selectedScript: any[] = [];
  isvisibleCompareScirptpanel: boolean = false;
  isExecutionPanelOpen: boolean = false;
  selectedCRN: string = "";
  selectedResourceID: string = "";
  usersList: any[] = [];
  txnrefList: any = [];
  download_loading: boolean = false;
  cmdb_operationtype = AppConstant.CMDB_OPERATIONTYPE;
  workpack_operationtype = AppConstant.WORKPACK_OPERATIONTYPE;
  catalogList = [];
  catalogStatus = {} as any;
  constructor(
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    // private workPackService: WorkPackService,
    private commonService: CommonService,
    private router: Router,
    private assetRecordService: AssetRecordService,
    private fb: FormBuilder,
    private routes: ActivatedRoute,
    private userService: UsersService,
    private workpackService: WorkpackService,
    private sanitized: DomSanitizer,
    private modal: NzModalService,
    private srmService: SrmService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    let workpack_screencode: any = AppConstant.SCREENCODES.WORKPACKTEMPLATE;
    this.appScreens = _.find(this.screens, {
      screencode: workpack_screencode
    });
    console.log(this.appScreens);
    if (this.appScreens) {
      if (_.includes(this.appScreens.actions, "View")) {
        this.visibleonly = true;
      }
      if (_.includes(this.appScreens.actions, "Create")) {
        this.visibleadd = true;
      }
      if (_.includes(this.appScreens.actions, "Edit")) {
        this.tableconfig.edit = true;
      }
      if (_.includes(this.appScreens.actions, "Delete")) {
        this.tableconfig.delete = true;
      }
    }

    this.selectedcolumns = [];
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    console.log(this.selectedcolumns);
    this.getComponentList();
    this.getCustomerList();
    this.getUserList();
  }
  getUserList() {
    this.userService
      .allUsers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          // this.usersList = response.data;
          this.usersList = _.map(response.data, (u) => {
            u.userid = u.userid.toString();
            return u;
          })
        }
      });
  }
  ngOnInit() {
    this.getSRMCatalogList();
    this.filterForm = this.fb.group({
      crn: [this.selectedResourceName],
      tag: [null],
      tagvalue: [null],
    });
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader.filter((el) => {
        return el.isdefault == true;
      });
    }
    // this.getReferenceList();
    this.getResourceType('all');
    // this.getResourceDetail("crn:ops:workpack_template");
    // this.getAllList();
    this.routes.queryParamMap.subscribe((p: any) => {
      if (p.params) {
        if (p.params.modelcrn != undefined) {
          this.modelCrn = p.params.modelcrn;
        }
      }
    });
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.getAssets();
  }
  getComponentList() { }
  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }
  providerChanges(event) {
    this.filters.asset = null;
    if (event == AppConstant.CLOUDPROVIDER.AWS) {
      this.assetTypes = AppConstant.AWS_BILLING_RESOURCETYPES;
    }
    if (event == AppConstant.CLOUDPROVIDER.ECL2) {
      this.assetTypes = AppConstant.ECL2_BILLING_RESOURCETYPES;
    }
  }
  getCustomerList() {
    this.commonService
      .allCustomers({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        )["tenantid"],
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.customerList = this.formArrayData(
            response.data,
            "customername",
            "customerid"
          );
        } else {
          this.customerList = [];
        }
      });
  }
  getWorkpackTemplateList(event) {
    this.workpackTemplateList = [];
    if (event != "" && event != null) {
      this.getResourceType('workpack', event);
    }

  }
  getReferenceList() {
    this.assetRecordService
      .getReferenceList(
        {
          tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
            "tenantid"
          ],
          keyname: "wp",
          parent_id: 0
        }
      )
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        if (response) {
          this.externalRefList = response.data;
          this.selectedExternalRef = _.find(this.externalRefList, (ref: any) => {
            return ref.parent_id == 0
          });
          if (this.selectedExternalRef) {
            this.getResourceType();
          }
        }

      });
  }
  getResourceType(mode?: any, value?: any) {
    let req: any = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      status: AppConstant.STATUS.ACTIVE,
      module: AppConstant.RESOURCETYPE_MODULE[1]
    };
    if (mode == "workpack") {
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
        // this.templateTreeList = {
        //   data : tree
        // }
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
        if (mode == "workpack") {
          this.workpackTemplateList = list;
        }
        else
          this.resourceTypesList = _.orderBy(response, ["id"], ["asc"]);
      });
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
            console.log("parentnode: ", parentnode);
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
    console.log(tree);
    console.log(TreeNode);
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
        createddt: mapped["createddt"],
        createdby: mapped["createdby"],
        lastupdatedby: mapped["lastupdatedby"],
        lastupdateddt: mapped["lastupdateddt"],
        key: mapped["crn"],
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
          if (mappedArr[mappedElem['parentcrn']]) {
            mappedElemTree.isLeaf = true;
            mappedArr[mappedElem['parentcrn']]['nodechildren'].push(_.cloneDeep(mappedElemTree));
            let parentnode: any = nodeChecker(TreeNode, mappedElem['parentcrn']);
            if (parentnode) {
              parentnode.children.push(mappedElemTree);
              // parentnode.addChildren([mappedElemTree]);
            }
            console.log("parentnode: ", parentnode);
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
    console.log(tree);
    console.log(TreeNode);
    return TreeNode;
  }
  onChangeTree(event) {
    console.log(event);
    this.selectedResourceName = event;
    this.txnrefList = [];
    this.router.navigate([], { queryParams: { modelcrn: event } });
    this.workpackTemplateList = [];
    if (event != "" && event != null) {
      this.getResourceDetail(event);
      // this.getResourceType('workpack',event);
    }
    else {
      this.assets = [];
    }
  }
  getResourceDetail(crn: string) {
    let r = this.resource[crn];
    this.dataloading = true;
    try {
      this.assetRecordService
        .txnrefList(
          {
            // reference : crn,
            notes: crn
          }
        )
        .subscribe((txndata) => {
          console.log(txndata);
          let res = JSON.parse(txndata._body);
          if (res.status) {
            this.txnrefList = res.data || [];
          }
          if (!r) {
            this.selectedcolumns = {};
            this.filterValues = {};
            this.selectedResource = [];
            this.selectedFields = [];
            this.assets = [];
            this.assetRecordService
              .getResource(
                this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
                "tenantid"
                ],
                crn
              )
              .subscribe((d) => {
                this.dataloading = false;
                let response: IAssetHdr[] = JSON.parse(d._body);
                this.selectedResource = response;
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
                  this.filteredColumns = [..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"])];
                  this.pageIndex = 1;
                  this.pageSize = 10;
                  if (idx + 1 == response.length) {
                    this.resource[crn] = {
                      filtered: this.filteredColumns,
                      selected: response,
                    };
                    this.getAssets();
                  }
                });
                this.selectedResourceName = crn;
                // response.forEach((o) => {
                //   if (o.showbydefault) {
                //     this.selectedcolumns[o.fieldkey] = true;
                //   }
                // });
              });
          } else {
            this.dataloading = false;
            this.selectedcolumns = {};
            this.filterValues = {};
            this.selectedFields = [];
            this.assets = [];
            this.selectedResource = r.selected;
            this.selectedResourceName = crn;
            this.pageIndex = 1;
            this.pageSize = 10;
            r.filtered.forEach((o) => {
              o.isSelected = false;
              if (o.showbydefault) {
                o.isSelected = true;
              }
            });
            this.filteredColumns = r.filtered;
            this.getAssets();
          }
        });

    } catch (error) {
      this.dataloading = false;
    }

  }
  getAssets() {
    this.gettingAssets = true;
    let selectedFields = [];
    this.totalCount = this.selectedFields.length;
    let columns = [];
    _.map(this.filteredColumns, (itm: any) => {
      columns.push(
        _.pick(itm, [
          "fieldkey",
          "fieldname",
          "fieldtype",
          "assettype",
          "linkid",
          "isSelected",
          "referencekey",
          "ordernumber",
          "resourcetype",
          "operationtype",
          "crn"
        ])
      );
      if (itm.isSelected) {
        selectedFields.push(
          _.pick(itm, [
            "fieldkey",
            "fieldname",
            "fieldtype",
            "assettype",
            "linkid",
            "isSelected",
            "referencekey",
            "ordernumber",
            "resourcetype",
            "operationtype",
            "crn"
          ])
        );
        return itm;
      }
    });
    // let fields = Object.keys(this.selectedResource).filter((k) => {
    //   if (this.selectedResource[k]) {
    //     return k;
    //   }
    // });

    // // Fallback code. Picks the first column in case no column is selected.
    // if (fields.length <= 0) {
    //   fields = this.selectedResource.slice(0, 1).map((s) => s.crn);
    // }
    let f = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      operationtype: this.workpack_operationtype,
      crn: this.selectedResourceName,
      // dtl_operationtype : this.cmdb_operationtype[3],
      // fields: fields.map((fk) => {
      //   console.log(fk);

      //   const f = this.filteredColumns.find((o) => o["fieldkey"] == fk);
      //   console.log(this.filteredColumns);
      //   if (this.filteredColumns[fk] && f) {
      //     return {
      //       fieldkey: f["fieldkey"],
      //       fieldname: f["fieldname"],
      //       fieldtype: f["fieldtype"],
      //       asset: f["referenceasset"],
      //     };
      //   }
      // }),
      fields: columns,
      // columns : columns,
      filters: this.filterValues,
      limit: this.pageSize,
      offset:
        this.pageIndex == 1
          ? 0
          : this.pageIndex * this.pageSize - this.pageSize,
    };
    f["status"] = AppConstant.STATUS.ACTIVE;
    if (this.currentSortColumn) {
      f["sortkey"] = this.currentSortColumn;
      f["sortorder"] = this.currentSortColumnOrder;
    }

    const tag = this.filterForm.get("tag").value;
    const tagValue = this.filterForm.get("tagvalue").value;
    if (tag) {
      f["tag"] = tag;
    }
    if (tag && tagValue) {
      f["tagvalue"] = tagValue;
    }

    if (this.globalSearchModel.length > 0) {
      // For column level search. Commented out since not required for now.
      // f["search"] = fields.map((fk) => {
      //   const f = this.selectedResource.find((o) => o["fieldkey"] == fk);
      //   if (this.selectedcolumns[fk]) {
      //     return {
      //       fieldkey: f["fieldkey"],
      //       fieldname: f["fieldname"],
      //       value: this.globalSearchModel,
      //     };
      //   }
      // });
      f["search"] = this.globalSearchModel;
      f["limit"] = this.pageSize;
      f["offset"] = 0;
    }
    if (this.isdownload) {
      f["download"] = this.isdownload;
      f["headers"] = this.selectedFields.map((el) => {
        return {
          field: el["fieldname"],
          header: el["fieldname"],
          datatype: "string",
        };
      });
      delete f["offset"];
      delete f["limit"];
    }
    if (selectedFields.length > 0) {
      this.assetRecordService.getResourceAssets(f).subscribe((r) => {
        this.gettingAssets = false;

        let response: { count: number; rows: Record<string, any>[] } =
          JSON.parse(r._body);
        this.selectedFields = selectedFields;
        if (this.isdownload) {
          let res = JSON.parse(r._body);
          var buffer = Buffer.from(res.data.content.data);
          let resourcetype = this.resourceTypesList.find((el) => {
            return el["crn"] == this.filterForm.value.crn;
          });
          downloadService(
            buffer,
            resourcetype.resource + "_" + moment().format("DD-MM-YYYY") + ".csv"
          );
          this.isdownload = false;
        } else {
          this.assets = _.map(response.rows, (r) => {
            r.isExecuteReady = false;
            let filterTxn: any[] = _.filter(this.txnrefList, { refkey: r.resource, module: this.cmdb_operationtype[5], status: AppConstant.STATUS.ACTIVE });
            if (filterTxn.length > 0) {
              r.isExecuteReady = true;
              // _.each(filterTxn,(f)=>{
              //   if(f.notes == "1"){
              //     r.isExecuteReady = true;
              //   }
              //   else{
              //     r.isExecuteReady = false;
              //   }
              // });
            }
            return r;
          });
          // this.assets = response.rows;
          this.assetsCount = response.count;

          setTimeout(() => {
            if (this.globalSearchModel.length > 0) {
              var context = document.getElementById("assetdetails-table");
              if (context) {
                var instance = new MarkJs(context);
                instance.mark(this.globalSearchModel);
              }
            }
          }, 1500);
        }
        for (let data of this.assets) {
          this.catalogStatus = this.catalogList.find((e) => e.referenceid === data.resource)
        }
      });
    } else {
      this.gettingAssets = false;
    }
  }
  parseJSON(text: string) {
    try {
      let j = JSON.parse(text);
      return Object.keys(j).length > 0 ? j : [];
    } catch (error) {
      return [];
    }
  }
  viewResourceDetail(data: Record<string, string>) {
    if (this.visibleonly || this.visibleadd || this.tableconfig.edit) {
      this.router.navigate(['workpackmanager/edittemplate'], { queryParams: { resource: data.resource } });
      return false;
    }

  }
  // redirectToAddWPTemplate(data: any) {
  //   this.router.navigate(['workpackmanager/createtemplate'],{ queryParams: { modelcrn: data.crn,modelresource: data.resource} });
  //     return false;
  // }
  redirectToAddWPTemplate() {
    this.router.navigate(['workpackmanager/createtemplate'], { queryParams: { modelcrn: this.selectedTreeNodes } });
    return false;
  }
  // getAllList(limit?, offset?) {
  //   // this.loading = true;
  //   let condition = {
  //     tenantid: this.userstoragedata.tenantid,
  //     status: AppConstant.STATUS.ACTIVE,
  //   };
  //   if (this.searchText != null) {
  //     condition["searchText"] = this.searchText;
  //     condition["headers"] = this.selectedcolumns.filter((el) => {
  //       return el.field;
  //     });
  //   }
  //   this.workPackService
  //     .all(
  //       condition,
  //       `customer=${true}&limit=${limit ? limit : 10}&offset=${offset ? offset : 0
  //       }`
  //     )
  //     .subscribe((res) => {
  //       const response = JSON.parse(res._body);
  //       if (response.status) {
  //         this.tableconfig.manualpagination = true;
  //         this.totalCount = response.data.count;
  //         this.templateList = response.data.rows.map(function (itm) {
  //           return itm;
  //         });

  //         this.loading = false;
  //       } else {
  //         this.templateList = [];
  //         this.loading = false;
  //       }
  //     });
  // }

  showModal(): void {
    this.templateObj = {};
    this.formTitle = "Add Template";
    this.isVisible = true;
    this.buttonText = this.buttonText;
  }

  rightbarChanged(event) {
    this.isVisible = false;
  }

  notifyNewEntry(event) {
    this.isVisible = false;
    // this.getAllList();
  }
  dataChanged(event: any) {
    console.log(event);
    if (event.edit) {
      // this.formTitle = "Edit Template";
      // this.templateObj = event.data;
      // this.isVisible = true;
      this.router.navigate([`./createtemplate/${event.data.workpack_tid}`]);
      return false;
    }
    if (event.delete) {
      this.deleteIncident(event.data);
    }
    if (event.pagination) {
      // this.getAllList(event.pagination.limit, event.pagination.offset);
    }
    if (event.searchText) {
      this.searchText = event.searchText;
      if (event.search) {
        // this.getAllList(10, 0);
      }
    }
    if (event.searchText == "") {
      this.searchText = null;
      // this.getAllList(10, 0);
    }
    if (event.refresh) {
      this.searchText = null;
      // this.getAllList(10, 0);
    }
  }

  deleteIncident(data) {
    this.loading = true;
    // this.workPackService.delete(data.id).subscribe((res) => {
    //   const response = JSON.parse(res._body);
    //   if (response.status) {
    //     this.message.success(data.incidentno + " Deleted Successfully");
    //     this.getAllList();
    //     this.loading = false;
    //   } else {
    //     this.loading = false;
    //   }
    // });
  }
  downloadFile(data) {
    console.log(data);
  }
  deleteRecord(data) {
    if (this.tableconfig.delete) {
      this.assetRecordService
        .updateDetail({
          resourceid: data.resource,
          status: AppConstant.STATUS.DELETED,
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.getAssets();
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        });

    }
  }
  rightbarWorkflowChanged() {
    this.selectedWorkflowTask = null;
    this.resoruceTitle = "";
    this.isWorkflowVisible = false;
  }
  assignWorkflow(data) {
    if (this.tableconfig.edit || this.visibleadd) {
      if (data) {
        this.selectedWorkflowTask = data.resource;
        this.resoruceTitle = "";
        this.isWorkflowVisible = true;
      }
    }
  }
  notifySelectionEntry(event) {
    console.log(event);
    if (event) {
      this.selectedWorkflowTask = null;
      this.isWorkflowVisible = false;
    }
  }
  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event, this.treeCom.getMatchedNodeList().map(v => v.title));
  }
  cloneScriptTemplate(event) {
    if (this.visibleadd) {
      let req = {
        resourceId: event.resource,
        status: "Active",
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        tenantid: this.userstoragedata.tenantid
      };
      this.assetRecordService
        .copyResourceDetails(req)
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.getAssets();
            this.message.success(response.message);
            this.getResourceType('all');
          } else {
            this.message.error(response.message);
          }
        });
    }
  }

  // grid tree 

  public columnDefs: ColDef[] = [

    {
      headerName: "Title", field: 'title', cellRenderer: 'agGroupCellRenderer', cellRendererParams: {
        suppressCount: true,
      }, width: 250,
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
    rowSelection: 'single',
    groupSelectsChildren: true,
    groupSelectsFiltered: true,
    suppressAggFuncInHeader: true,
    suppressRowClickSelection: true,
    onCellClicked: (event: CellClickedEvent) => {
      console.log('Cell was clicked', event.data)
      if (event.data) {
        this.selectedTreeTableNodes = event.data;
        this.treeTableSearchbox = event.data.title;
      }
    },
    onRowClicked: (event: any) => {
      console.log('row was clicked')
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
  onGridReady(params) {
    this.gridApi = params.api;
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
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
      this.selectedWorkpackTitle = this.selectedTreeTableNodes.title;
      this.modelCrn = this.selectedTreeTableNodes.key;
      this.selectedTreeNodes = this.selectedTreeTableNodes.key;
      this.onChangeTree(this.selectedTreeTableNodes.key);
      this.isTreeVisible = false;

    }
  }
  updateCompareChecked(data) {
    if (data.checked) {
      if (this.selectedScript.length >= 2) {
        setTimeout(() => {
          data.checked = false;
        }, 100);
        this.message.warning("Only two scripts are allowed to compare.");
      }
      else {
        this.selectedScript.push(data);
      }

    }
    else {
      let i = _.findIndex(this.selectedScript, (d) => {
        return d.resource == data.resource
      });
      if (i > -1) {
        this.selectedScript.splice(i, 1);
      }
    }
    console.log(data);
  }
  openCompareScirptpanel() {
    this.isvisibleCompareScirptpanel = true;
  }
  closeCompareScirptpanel() {
    this.isvisibleCompareScirptpanel = false;
  }
  executionPanelChange(data) {
    this.isExecutionPanelOpen = false;
    this.selectedResourceID = '';
  }
  notifyUpdateEntry(data) {
    this.isExecutionPanelOpen = false;
    this.selectedResourceID = '';
    this.getAssets();
    this.getResourceType('all');
    // this.getResourceDetail(event);
    // this.getAssets();
    // this.getResourceType('all');
  }
  executeScript(data) {
    if (this.tableconfig.edit && this.visibleadd) {
      console.log(data);
      this.selectedResourceID = data.resource;
      setTimeout(() => {
        this.isExecutionPanelOpen = true;
      }, 100);
    }
  }
  assignWorkflowExecution(data) {
    if (data && data.dtl_operationtype !== AppConstant.STATUS.DRAFT) {
      this.message.warning("Clone the template before execution.");
      this.selectedResourceID = data.resource;
      this.resoruceTitle = (data["Name"] || data["Title"] || data["Script ID"]) || "";
      this.isWorkflowVisible = true;
    } else {
      this.message.error("Please publish the template before execution.");
    }
  }
  notifyWorkflowSelectionEntry(data) {
    console.log(data);
    this.isWorkflowVisible = false;
    this.workflowExecute(data);
  }
  async workflowExecute(workflowdata: any) {
    workflowdata.resourceid = this.selectedResourceID;
    let req = {
      resourceDetails: {
        resourceId: this.selectedResourceID,
        status: "Active",
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        tenantid: this.userstoragedata.tenantid,
        dtl_operationtype: this.cmdb_operationtype[5]
      },
      workflowDetails: workflowdata
    };
    this.dataloading = true;
    this.workpackService
      .workflowExecute(req)
      .subscribe((res) => {
        this.dataloading = false;
        const response = JSON.parse(res._body);
        if (response.status) {
          this.getAssets();
          this.message.success(response.message);
          this.getResourceType('all');
        } else {
          this.message.error(response.message);
        }
      });
  }
  async downloadPDF(data: any, selectedFields: any[]) {

    // working
    let formattedData = _.map(selectedFields, (f: any) => {
      f.fieldvalue = "";
      if (data[f.fieldname]) {
        f.fieldvalue = data[f.fieldname];
      }
      return f;
    });
    console.log(formattedData);
    this.downloadableDiv.nativeElement.innerHTML = "";
    this.download_loading = true;
    // let tasksFormattedData = await this.workpackService.getAssetDetails(data.resource);
    // download api call
    this.workpackService
      .download(
        {
          // formattedData : formattedData,
          resourceid: data.resource,
          // tasksFormattedData: tasksFormattedData,
          tenantid: this.userstoragedata.tenantid
        }
      )
      .subscribe((result) => {
        this.download_loading = false;
        if (result.status) {
          let headerData = _.find(formattedData, (f) => {
            let fieldname: string = f.fieldname;
            return ((fieldname.toLowerCase() == "name" || fieldname.toLowerCase() == "Title" ||
              fieldname.toLowerCase() == "script id"))
          });
          let filename = "workpack" + "_" + moment().format("DD-MM-YYYY") + ".pdf";
          if (headerData) {
            let fnameraw = headerData.resourcetype + "-" + headerData.fieldvalue;
            fnameraw = fnameraw.replace(/[\s~`!@#$%^&*()_+\-={[}\]|\\:;"'<,>.?/]+/g, '_');
            fnameraw = fnameraw.substring(0, 50);
            filename = fnameraw + "_" + moment().format("DD-MM-YYYY") + ".pdf";
          }
          let response = JSON.parse(result._body);
          if (response.data) {
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer, filename
            );
          }
        }

      });


  }

  listChildChanged = [];
  arr = [
    {
      id: "group_1",
      name: "Group 1",
      items: [
        {
          id: "group_1.abc",
          name: "ABC",
          checked: false,
          expand: true,
          childs: [
            {
              id: "group_1.abc.action_See_List",
              name: "See List",
              checked: false
            },
            {
              id: "group_1.abc.action_Edit",
              name: "Edit",
              checked: false
            },
            {
              id: "group_1.abc.action_Delete",
              name: "Delete",
              checked: false
            },
            {
              id: "group_1.abc.action_Print",
              name: "Print",
              checked: false
            }
          ]
        },
        {
          id: "group_1.def",
          name: "DEF",
          checked: false,
          expand: true,
          childs: [
            {
              id: "group_1.def.action_See_List",
              name: "See List",
              checked: false
            },
            {
              id: "group_1.def.action_Edit",
              name: "Edit",
              checked: false
            },
            {
              id: "group_1.def.action_Delete",
              name: "Delete",
              checked: false
            },
            {
              id: "group_1.def.action_Print",
              name: "Print",
              checked: false
            }
          ]
        }
      ]
    },
    {
      id: "group_2",
      name: "Group 2",
      items: [
        {
          id: "group_2.ghi",
          name: "GHI",
          checked: false,
          expand: true,
          childs: [
            {
              id: "group_2.ghi.action_See_List",
              name: "See List",
              checked: false
            },
            {
              id: "group_2.ghi.action_Edit",
              name: "Edit",
              checked: false
            },
            {
              id: "group_2.ghi.action_Delete",
              name: "Delete",
              checked: false
            }
          ]
        },
        {
          id: "group_2.ijk",
          name: "IJK",
          checked: true,
          expand: true,
          childs: [
            {
              id: "group_2.ijk.action_Funny",
              name: "Funny",
              checked: true
            }
          ]
        },
        {
          id: "group_2.klm",
          name: "KLM",
          checked: false,
          expand: true,
          childs: [
            {
              id: "group_2.klm.action_Edit",
              name: "Edit",
              checked: true
            },
            {
              id: "group_2.klm.action_Delete",
              name: "Delete",
              checked: false
            }
          ]
        }
      ]
    }
  ];

  checkMinusSquare(item) {
    const count = item.childs.filter(x => x.checked == true).length;
    if (count > 0 && count < item.childs.length) {
      return true;
    } else if (count == 0) {
      return false;
    }
  }

  checkParent(group_i, i) {
    this.arr[group_i].items[i].checked = !this.arr[group_i].items[i].checked;
    if (this.arr[group_i].items[i].checked) {
      this.arr[group_i].items[i].childs.map(x => (x.checked = true));
    } else {
      this.arr[group_i].items[i].childs.map(x => (x.checked = false));
    }
    this.arr[group_i].items[i].childs.forEach(x => {
      if (this.listChildChanged.findIndex(el => el.id == x.id) == -1) {
        this.listChildChanged.push(x);
      }
    });
  }

  checkChild(group_i, parent_i, i) {
    this.arr[group_i].items[parent_i].childs[i].checked = !this.arr[group_i]
      .items[parent_i].childs[i].checked;
    const count = this.arr[group_i].items[parent_i].childs.filter(
      el => el.checked == true
    ).length;
    if (count == this.arr[group_i].items[parent_i].childs.length) {
      this.arr[group_i].items[parent_i].checked = true;
    } else {
      this.arr[group_i].items[parent_i].checked = false;
    }
    if (this.listChildChanged.findIndex(el => el.id == this.arr[group_i].items[parent_i].childs[i].id) == -1) {
      this.listChildChanged.push(this.arr[group_i].items[parent_i].childs[i]);
    }
  }

  getListChildChanged() {
    console.log(this.listChildChanged);
  }
  getSRMCatalogList() {
    let query = {} as any;
    query = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.srmService.allCatalog(query).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response.status) {
        this.catalogList = response.data.filter(item => item.referencetype === 'Workpack');
      } else {
        this.catalogList = [];
      }
    });
  }
  publish(data) {
    if (this.catalogStatus && this.catalogStatus.publishstatus === "Published") {
      this.modal.confirm({
        nzTitle: "Are you sure you want to unpublish?",
        nzOkText: "Yes",
        nzOkType: "primary",
        nzOnOk: () => {
          const formdata = new FormData();
          formdata.append(
            "formData",
            JSON.stringify({
              catalogid: this.catalogStatus.catalogid,
              publishstatus: AppConstant.STATUS.DELETED,
              lastupdatedby: this.userstoragedata.fullname,
              lastupdateddt: new Date(),
            })
          );
          this.srmService.updateCatalog(formdata).subscribe((result) => {
            let response = {} as any;
            response = JSON.parse(result._body);
            if (response.status) {
              this.message.success(response.message);
              this.getResourceDetail(this.modelCrn);
            } else {
              this.message.error(response.message);
            }
          });
        },
        nzCancelText: "No",
        nzOnCancel: () => console.log("Cancel"),
      });
    } else {
      this.modal.confirm({
        nzTitle: "Are you sure you want to publish?",
        nzOkText: "Yes",
        nzOkType: "primary",
        nzOnOk: () => {
          this.router.navigate(["srm/catalog/create"], {
            queryParams: {
              referencetype: "Workpack",
              referenceid: data.resource,
              servicename: data.Name,
            },
          });
        },
        nzCancelText: "No",
        nzOnCancel: () => console.log("Cancel"),
      });
    }
  }

}
