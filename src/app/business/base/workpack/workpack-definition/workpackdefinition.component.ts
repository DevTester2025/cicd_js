import { Component, ViewChild, Output, EventEmitter,ElementRef,HostListener } from "@angular/core";
import { TreeComponent } from "angular-tree-component";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { Router, ActivatedRoute } from "@angular/router";
import { IResourceType } from "src/app/modules/interfaces/assetrecord.interface";
import * as _ from "lodash";

@Component({
  selector: "workpackdefinition",
  templateUrl: "./workpackdefinition.component.html",
  styleUrls: ["./workpackdefinition.component.css"],
  // encapsulation: ViewEncapsulation.None
})
export class WorkpackDefinitionComponent {
  @Output() notifyTaskSelection = new EventEmitter();
  @ViewChild("tree")
  private tree: TreeComponent;
  loading = false;
  templateTreeList: any;
  nodes = [
    {
      id: 11,
      uid: "sjpc000002",
      categoryId: 2,
      name: "tree 1",
      isExpanded: true,
      parentId: 0,
      children: [
        {
          id: 12,
          uid: "sjpc000003",
          categoryId: 3,
          name: "tree",
          parentId: 2,
          children: [],
        },
        {
          id: 13,
          uid: "sjpc000004",
          categoryId: 4,
          name: "tree",
          parentId: 2,
          children: [
            {
              id: 14,
              uid: "sjpt000010",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 15,
              uid: "sjpt000011",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 16,
              uid: "sjpt000012",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 17,
              uid: "sjpt000013",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 18,
              uid: "sjpt000014",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 19,
              uid: "sjpt000015",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 20,
              uid: "sjpt000016",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 21,
              uid: "sjpt000017",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 22,
              uid: "sjpt000018",
              categoryUid: "sjpc000004",
              name: "tree",
            },
            {
              id: 23,
              uid: "sjpt000019",
              categoryUid: "sjpc000004",
              name: "tree",
            },
          ],
        },
        {
          id: 24,
          uid: "sjpc000005",
          categoryId: 5,
          name: "tree",
          parentId: 2,
          children: [
            {
              id: 25,
              uid: "sjpt000020",
              categoryUid: "sjpc000005",
              name: "tree",
            },
            {
              id: 26,
              uid: "sjpt000021",
              categoryUid: "sjpc000005",
              name: "tree",
            },
            {
              id: 27,
              uid: "sjpt000022",
              categoryUid: "sjpc000005",
              name: "tree",
            },
          ],
        },
      ],
    },
  ];
  options = {
    allowDrag: true,
    allowDrop: true,

  };
  contextMenuitems = [{
    label: 'File',
    items: [
        {label: 'New', icon: 'pi pi-fw pi-plus'},
        {label: 'Download', icon: 'pi pi-fw pi-download'}
    ]
},
{
    label: 'Edit',
    items: [
        {label: 'Add User', icon: 'pi pi-fw pi-user-plus'},
        {label: 'Remove User', icon: 'pi pi-fw pi-user-minus'}
    ]
}];
@ViewChild('contextMenu')
contextMenu: ElementRef;
contextmenuSelectedItem=null;
isVisible=false;
addEditVisible = false;
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService
  ) {
    this.getResourceType();
  }
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
      .workpackrelationList(req)
      .subscribe((d) => {
        let response: any = JSON.parse(d._body);
        if(response.data){
            this.templateTreeList = this.treeify(_.cloneDeep(response.data),{
                id: "ref_key",
                parentId: "parentref_key",
                children: "children",
                root: null,
                multi: true, // If the 'multi' is set to TRUE, it can have multiple roots, FALSE can only have one.
                deepClone: true, // Whether deep clone all elements of data in convert.
              });
              console.log(this.templateTreeList);
              this.templateTreeList=_.map(this.templateTreeList,(t)=>{
                t.onDrop=this.onDrop;
                return t;
              })
        }
        
      });
  }
  closeDrawer() {
    this.isVisible = false;
  }
  notifyNewEntry(event) {
    this.addEditVisible = false;
    this.getResourceType();
  }
  onDrop(event){
    console.log(event);
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // const node = this.tree.treeModel.getNodeBy(node => node.data.uid === "sjpc000002");
    // node.expand();
    // console.log(node);
  }
  treeify(data, configure) {
    const config = Object.assign(
      {
        id: "id",
        parentId: "parentId",
        children: "children",
        root: null,
        multi: false, // If the 'multi' is set to TRUE, it can have multiple roots, FALSE can only have one.
        deepClone: false, // Whether deep clone all elements of data in convert.
      },
      configure
    );

    const disposable = {}; // an object which is temp used.

    let roots = []; // Root node
    const setRoots = (el) => {
      if (config.multi) {
        roots.push(el);
      } else {
        roots = el;
      }
    };

    let id; // ID of current element
    let parentId; // parent ID of current element

    for (let el of data) {
      if (config.deepClone) {
        el = this.deepClone(el);
      }

      const f = this.executeIfFunction.bind(el);

      id = el[f(config.id)];
      parentId = el[f(config.parentId)];

      if (!(id in disposable)) {
        disposable[id] = [];
      }

      if (!(parentId in disposable)) {
        disposable[parentId] = [];
      }

      el[f(config.children)] = disposable[id];

      const root = f(config.root);

      do {
        if (config.root || !parentId) {
          if (config.root) {
            if (
              (typeof root == "boolean" && root) ||
              (Array.isArray(root) && root.includes(parentId)) ||
              parentId === root
            ) {
              setRoots(el);
              break;
            }
          } else if (!parentId) {
            setRoots(el);
            break;
          }
        }

        disposable[parentId].push(el);
      } while (false);
    }

    return roots;
  }
  deepClone(o) {
    return Object.keys(o).reduce(
      (target, key) => {
        let value = o[key];
        target[key] = value instanceof Object ? this.deepClone(value) : value;
        return target;
      },
      Array.isArray(o) ? [] : {}
    );
  }
  executeIfFunction(f) {
    return typeof f === "function" ? f(this) : f;
  }
  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    this.hideCotextMenu()
  }
  onContextMenu(event: MouseEvent,data){
    this.hideCotextMenu();
    this.contextmenuSelectedItem=data;
    console.log("onContextMenu",this.contextMenu);
    event.preventDefault();
    this.contextMenu.nativeElement.style.top = (event.offsetY + 10 ) + "px";
    this.contextMenu.nativeElement.style.left  = (event.offsetX + 10) + "px";
    this.contextMenu.nativeElement.style.display="block";
  }
  hideCotextMenu(){
    this.contextMenu.nativeElement.style.display="none";
    this.contextmenuSelectedItem=null;
  }
  addNewNode(){
        this.isVisible = true;
  }
  deleteNode(){

  }
  onMoveNode(event){
    console.log(event);
  }
}
