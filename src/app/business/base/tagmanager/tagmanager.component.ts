import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import * as _ from "lodash";

import { TagService } from "./tags.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import {
  NzMessageService,
  NzTreeNode,
  NzFormatEmitEvent,
  NzFormatBeforeDropEvent,
  NzDropdownService,
  NzMenuItemDirective,
  NzDropdownContextComponent,
} from "ng-zorro-antd";
import { TagGroupsService } from "./tag-groups.service";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { Observable, of } from "rxjs";
import { delay } from "lodash";
import { setTimeout } from "timers";
import { TreeComponent, TreeNode } from "angular-tree-component";
import { TagValueService } from "./tagvalue.service";
import { CommonFileService } from "../../../modules/services/commonfile.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
interface treeInt {
  name: string;
  id: string;
  children?: treeInt[];
}

@Component({
  selector: "app-tagmanager",
  templateUrl:
    "../../../presentation/web/base/tagmanager/tagmanager.component.html",
  styles: [
    `
      .ant-tree li .ant-tree-node-content-wrapper {
        color: rgba(255, 255, 255, 0.65) !important;
      }
      .ant-tree,
      .ant-tree-checkbox-group {
        color: rgba(255, 255, 255, 0.65) !important;
      }
    `,
  ],
})
export class TagmanagerComponent implements OnInit {
  private dropdown: NzDropdownContextComponent;

  screens = [];
  appScreens = {} as any;
  createTag = false;
  isVisible = false;
  isGroupHierarchyVisible = false;
  isVisibleTagGroup = false;
  loading = true;
  count: 0;
  userstoragedata = {} as any;
  folderName = "";

  tableHeader = [
    { field: "tagname", header: "Tag Name", datatype: "string", isdefault: true },
    { field: "tagtype", header: "Data Type", datatype: "string", isdefault: true },
    // { field: 'tagdescription', header: 'Tag Description', datatype: 'string' },
    // { field: 'resourcetype', header: 'Classification', datatype: 'string' },
    {
      field: "assets",
      header: "Assets",
      datatype: "link",
      linkfield: "assetLink",
      isDisableSort: true,
      isdefault: true,
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ] as any;
  tagGroupableHeader = [
    { field: "groupname", header: "Name", datatype: "string", isdefault: true },
    { field: "resourcetype", header: "Classification", datatype: "string", isdefault: true },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string",  isdefault: true },
  ] as any;

  tableConfig = {
    refresh: true, //#OP_B632
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch:true,
    columnselection: true,
    loading: false,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
    apisort: true, //#OP_B627
    tabledownload: false,
  } as any;

  tagList = [];
  tagGroupList = [];
  selectedcolumns = [] as any;
  tagGroupSelectedColumns = [] as any;
  formTitle = "Add Tag";
  tagGroupFormTitle = "Add Tag Group";

  tagObj = {} as any;
  tagGroupObj = {} as any;
  tabIndex = 0;
  nodes = [];
  treeOptions = {
    allowDrag: true,
    allowDrop: (element, { parent, index }) => {
      // return true / false based on element, to.parent, to.index. e.g.
      return !parent.isLeaf;
    },
  };
  isdownload = false;
  structureId;
  savingStructure = false;
  openassets = false;
  totalCount;
  limit = 10;
  offset = 0;
  searchText = null;
  order = ["lastupdateddt","desc"]; //#OP_B627
  assets:any = [];
  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  constructor(
    private tagService: TagService,
    public router: Router,
    private tagGroupService: TagGroupsService,
    private httpService: HttpHandlerService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private nzDropdownService: NzDropdownService,
    private route: ActivatedRoute,
    private tagValueService: TagValueService,
    private commonFileService: CommonFileService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.TAG_MANAGER,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createTag = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    this.route.params.subscribe((params) => {
      console.log(params);
      if (params.tabIndex) {
        this.tabIndex = params.tabIndex;
      }
    });
    if (this.tableHeader && this.tableHeader.length > 0) {
      if(this.tabIndex === 0 ){
        this.selectedcolumns = this.tableHeader.filter((el) => {
          return el.isdefault == true;
        });
      }  
    }
    if(this.tagGroupableHeader && this.tagGroupableHeader.length > 0){
        this.tagGroupSelectedColumns = this.tagGroupableHeader.filter((el) => el.isdefault);
    }
  }
  ngOnInit() {
    if (this.tabIndex) {
      if (this.tabIndex == 1) {
        this.getAllGroups();
      } else {
        this.getAllTags();
      }
    } else {
      this.getAllTags();
    }
    this.getStructure();
  }

  //#OP_B627
  TagtabChange(event) {
    this.tabIndex = event.index
     if(this.tabIndex === 1){
      this.getAllGroups();
     }else{
      this.getAllTags();
     }
  }

  getStructure() {
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.FINDALL,
        {
          lookupkey: AppConstant.LOOKUPKEY.TAG_GROUP_STRUCTURE,
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
        }
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          let level = 0;

          if (response.data[0]["keyvalue"] != null) {
            this.structureId = response.data[0]["lookupid"];
            let struct = JSON.parse(response.data[0]["keyvalue"]) as treeInt[];

            let arr = [] as treeInt[];

            struct.forEach((node) => {
              let parent = {
                name: node.name,
                id: node.id,
              };

              if (node["hasChildren"]) {
                parent["hasChildren"] = true;
                parent["children"] = [];
              }

              function extractChild(pnt: treeInt, nd: treeInt) {
                if (nd.children && nd.children.length > 0) {
                  let childrens = [];
                  nd.children.forEach((childNode) => {
                    let obj = {
                      name: childNode.name,
                      id: childNode.id,
                    };

                    if (childNode["hasChildren"]) {
                      obj["hasChildren"] = true;
                      obj["children"] = [];
                    }

                    extractChild(obj, childNode);

                    childrens.push(obj);
                  });
                  if (childrens.length > 0) pnt["children"] = childrens;
                }
              }

              extractChild(parent, node);

              arr.push(parent);
            });
            this.nodes = arr;
          }
        } else {
        }
      });
  }

  tagDataChanged(d) {
    //#OP_B627
    if (d.pagination) {
      this.tableConfig.pageSize = d.pagination.limit;
      this.getAllTags(d.pagination.limit, d.pagination.offset);
    }
    if (d.edit) {
      this.formTitle = "Update Tag";
      this.tagObj = d.data;
      this.isVisible = true;
    }
    if (d.delete) {
      this.tagObj = d.data;
      this.deleteTag();
    }
    if (d.assetlink) {
      this.tagValueService
        .all(
          {
            tagid: d.data.tagid,
            status: AppConstant.STATUS.ACTIVE,
          },
          `?assetcount=${true}`
        )
        .subscribe((result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            let assetdtls = response.data.map((o) => {
              const key =
                o.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA ||
                o.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX
                  ? "VMWARE"
                  : o.cloudprovider;
              const assttype = _.find(AppConstant.ASSETTYPES[key], {
                value: o.resourcetype,
              });
              o.label = assttype ? assttype["title"] : o.label;
              return o;
            });
            assetdtls =  _.groupBy(assetdtls, 'cloudprovider');
            this.assets = _.map(assetdtls, function(value, key){
              return {
                key: key,
                value: value
              }
            });
            this.openassets = true;
          }
        });
    }
    if (d.searchText != "") {
      this.searchText = d.searchText;
      if (d.search) {
        this. getAllTags(this.tableConfig.pageSize, 0);
      }
    }
    if (d.searchText == "") {
      this.searchText = null;
      this. getAllTags(this.tableConfig.pageSize, 0);
    }

     //#OP_B627
     if (d.order) {
      this.order = d.order;
      this.getAllTags(this.tableConfig.pageSize, 0);
    }
    //#OP_B632
    if (d.refresh) {
      this.getAllTags();
    }
    if (d.download) {
      this.isdownload = true;
      this.getAllTags(this.tableConfig.pageSize, 0);
    }

  }
  rightbarChanged() {
    this.openassets = false;
  }
  viewAsset(data) {
    this.commonFileService.addAssetItem({
      provider: data.cloudprovider,
      asset: data.resourcetype,
      tagid: data.tagid,
      screencode: AppConstant.SCREENCODES.TAG_MANAGER,
    });
    this.router.navigate(["assets"], {
      queryParams: { mode: "Tag" },
    });
  }
  tagGroupDataChanged(d) {
    //#OP_B627
    if (d.pagination) {
      this.tableConfig.pageSize = d.pagination.limit;
      this.getAllGroups(d.pagination.limit, d.pagination.offset);
    }
    if (d.edit) {
      this.router.navigate([`tagmanager/editgroup/${d.data.taggroupid}`]);
    }
    if (d.searchText != "") {
      this.searchText = d.searchText;
      if (d.search) {
        this. getAllGroups(this.tableConfig.pageSize, 0);
      }
    }
    if (d.searchText == "") {
      this.searchText = null;
      this. getAllGroups(this.tableConfig.pageSize, 0);
    }
    if (d.delete) {
      this.tagGroupObj = d.data;
      this.deleteGroup();
    }
    //#OP_B627
    if (d.order) {
      this.order = d.order;
      this.getAllGroups(this.tableConfig.pageSize, 0);
    }
    //#OP_B627
    if (d.refresh) {
      this.getAllGroups();
    }
    if (d.download) {
      this.isdownload = true;
      this.getAllGroups(this.tableConfig.pageSize, 0);
    }
  }

  deleteTag() {
    this.tagService
      .update({
        tagid: this.tagObj.tagid,
        status: AppConstant.STATUS.DELETED,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.getAllTags();
          this.message.info("Tag Deleted");
          this.loading = false;
        } else {
          this.message.info(response.message);
          this.loading = false;
        }
      });
  }

  getAllTags(limit?, offset?) {
    this.tableConfig.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    }
    // #OP_B627
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }

    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
      condition["headers"] = [{ field: "tagname" }];
    }
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
    condition["headers"] = this.selectedcolumns;
    }
    else{
     query = `assetcount=${true}&limit=${limit ? limit : 10}&offset=${offset ? offset : 0}&order=${this.order ? this.order : ""}`;
    }

    this.tagService
      .all(
        condition,
        query
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          if (this.isdownload) {
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Tag_List.xlsx"
            );
            this.isdownload = false;
            this.tableConfig.loading = false;
          }
  
          this.loading = false;
          this.tableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
          let l = response.data.rows.map((o) => {
            return {
              ...o,
              // assets: o.assetcount,
              // assetLink: window.location.href + "/" + o.assets,
            };
          });
          this.tagList = l;
          this.getAssetsCount();
        } else {
          this.loading = false;
          this.tagList = [];
        }
        this.tableConfig.loading = false;
      });
  }
  getAssetsCount() {
    this.tagValueService
      .all(
        {
          status: AppConstant.STATUS.ACTIVE,
          tagids: _.map(this.tagList, function (i) {
            return i.tagid;
          }),
          group: ["tagid"],
        },
        `?assetcount=${true}`
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
           this.tagList = _.map(this.tagList, function (e) {
             const dtl = _.find(response.data, { tagid: e.tagid });
             e.assets = dtl ? dtl["assetcount"] : 0;
             return e;
          });
          this.tagList = [...this.tagList];
        } else {
          this.tagList = _.map(this.tagList, function (e) {
            e.assets = 0;
            return e;
         });
         this.tagList = [...this.tagList];
        } 
      });
  }
  onChanged(val) {
    this.isVisible = val;
    this.isVisibleTagGroup = val;
    this.isGroupHierarchyVisible = false;
  }
  showAddForm(f: string) {
    if (f == "tag") {
      this.isVisible = true;
      this.formTitle = "Add Tag";
      this.tagObj = {};
    }
    if (f == "taggroup") {
      this.isVisibleTagGroup = true;
      this.tagGroupFormTitle = "Add Tag Group";
      this.tagObj = {};
    }
  }

  notifyTagEntry(val: boolean) {
    if (val) {
      this.getAllTags();
      this.isVisible = false;
    }
  }
  notifyTagGroupEntry(val: boolean) {
    if (val) {
      this.getAllGroups();
      this.isVisibleTagGroup = false;
    }
  }
  // Code related to tag groups
  getAllGroups(limit?, offset?) {
    //#OP_B627
    this.tableConfig.loading = true;
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    }
    //#OP_B627
    if (this.order && this.order != null) {
      condition["order"] = this.order;
    } else {
      condition["order"] = ["lastupdateddt", "desc"];
    }
    if (this.searchText != null) {
      condition["searchText"] = this.searchText;
      condition["headers"] = [{ field: "groupname" }];
      condition["headers"] = [{ field: "lastupdatedby" }];


   
    }
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.tagGroupSelectedColumns;
    }
    else{
     query = `limit=${limit ? limit : 10}&offset=${offset ? offset : 0}&order=${this.order ? this.order : ""}`;
    }

    this.tagGroupService
      .all(condition,query)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        console.log(response);
        if (response.status) {
          if (this.isdownload) {
            this.tableConfig.loading = true;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Tag_Group.xlsx"
            );
            this.isdownload = false;
            this.tableConfig.loading = false;
          }
  
          this.loading = false;
          this.tableConfig.manualpagination = true;
          this.totalCount = response.data.count;
          this.tableConfig.count = "Total Records"+ ":"+ " "+this.totalCount;
          this.tagGroupList = response.data.rows.map((o) => {
            if (o["resourcetype"] == AppConstant.TAGS.TAG_RESOURCETYPES[0]) {
              o["resourcetype"] = "Solution";
            } else {
              o["resourcetype"] = "Asset";
            }
            return o;
          });
        } else {
          this.loading = false;
          this.tagGroupList = [];
        }
        this.tableConfig.loading = false;
      });
  }

  deleteGroup() {
    let n = this.tree.treeModel.getNodeById(
      this.tagGroupObj.taggroupid
    ) as TreeNode;

    let newTree;

    if (n && n instanceof TreeNode) {
      let node = this.nodes.find((o) => o["id"] == n.path[0]);
      let nds = _.cloneDeep(this.nodes);
      nds[this.nodes.findIndex((o) => o["id"] == n.path[0])] =
        this.removeFromTree(node, n.path.reverse()[0], this);
      newTree = nds;
    }

    this.tagGroupService
      .update({
        taggroupid: this.tagGroupObj.taggroupid,
        status: AppConstant.STATUS.INACTIVE,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.savingStructure = true;
          this.httpService
            .POST(
              AppConstant.API_END_POINT +
                AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.UPDATE,
              {
                lookupid: this.structureId,
                keyvalue: JSON.stringify(newTree),
              }
            )
            .subscribe((result) => {
              this.savingStructure = false;
              this.getAllGroups();
              this.getStructure();
              this.message.info("Tag Group Deleted");
              this.loading = false;
            });
        } else {
          this.message.info(response.message);
          this.loading = false;
        }
      });
  }

  // Code related to defining folder hierarchy
  createFolder() {
    if (this.folderName.length > 0 && this.folderName.trim().length > 0) {
      this.nodes = [
        ...this.nodes,
        {
          name: this.folderName,
          id: (Math.floor(Math.random() * 9876543210) + 98765432).toString(),
          children: [],
          hasChildren: true,
        },
      ];
      this.folderName = "";
    } else {
      this.message.error("Please enter folder name");
    }
  }
  saveTree() {
    let arr = this.nodes;

    this.savingStructure = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.UPDATE,
        {
          lookupid: this.structureId,
          keyvalue: JSON.stringify(arr),
        }
      )
      .subscribe((result) => {
        this.savingStructure = false;
        let response = JSON.parse(result._body);
        this.message.info(response.message);
      });
  }

  contextMenu($event: MouseEvent, template: TemplateRef<void>): void {
    this.dropdown = this.nzDropdownService.create($event, template);
  }

  close(e: NzMenuItemDirective): void {
    console.log(e);
    this.dropdown.close();
  }

  removeFromTree(parent, childNameToRemove, v) {
    if (parent.children) {
      parent.children = parent.children
        .filter(function (child) {
          return child.id !== childNameToRemove;
        })
        .map(function (child) {
          return v.removeFromTree(child, childNameToRemove, v);
        });
    }
    return parent;
  }

  deleteTree(d: any) {
    let treeNode = d as TreeNode;
    this.dropdown.close();

    let groups = [];

    let node = this.nodes.find((o) => o["id"] == treeNode.path[0]);

    function splitTagGroups(childrens: TreeNode[]) {
      for (let index = 0; index < childrens.length; index++) {
        const element = childrens[index];

        if (element.hasChildren) {
          splitTagGroups(element.children);
        } else {
          groups.push({
            name: element.data.name,
            id: element.data.id,
          });
        }
      }
    }

    splitTagGroups(treeNode.children);

    this.nodes[this.nodes.findIndex((o) => o["id"] == treeNode.path[0])] =
      this.removeFromTree(node, treeNode.path.reverse()[0], this);
    this.nodes = [...this.nodes, ...groups];
  }
}
