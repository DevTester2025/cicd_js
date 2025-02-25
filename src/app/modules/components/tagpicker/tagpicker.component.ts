import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { LocalStorageService } from "../../services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import { TagGroupsService } from "src/app/business/base/tagmanager/tag-groups.service";
import { NzMessageService } from "ng-zorro-antd";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { ParametersService } from "src/app/business/admin/parameters/parameters.service";
import { HttpHandlerService } from "../../services/http-handler.service";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";

interface treeInt {
  name: string;
  id: string;
  children?: treeInt[];
}

@Component({
  selector: "app-cloudmatiq-tag-picker",
  styles: [
    `
      .data-table .ant-input-group-addon {
        cursor: pointer;
      }
    `,
  ],
  templateUrl: "./tagpicker.component.html",
})
export class TagPickerComponent implements OnInit, OnChanges {
  // Mode Either standalone or combined and mandatory
  // standalone => resourceId is mandatory
  // combined => the component just performs the job of getting tags & it's value. Used for create scenerio's

  @Input() disableDelete: boolean;
  @Input() disableAdd: boolean;
  @Input() disableParams: boolean;
  @Input() validateInputs: boolean;

  @Input() tagGroupType: string;
  // 'standalone' || 'combined'
  @Input() pickermode: string;
  // 'maintanance' || 'picker' maintanance ? for tagtype list the view will be dropdown and not tag
  @Input() mode: any;
  @Input() cloudProvider: string;
  @Input() resourceType: string;
  @Input() resourceId: any;
  @Input() refId: any;
  @Input() currentTags: any;

  @Output() tagChanges: EventEmitter<any> = new EventEmitter();

  userstoragedata = {} as any;
  tagGroups = [];
  tagStructure = [];
  paramsList = [];
  selectedGroup;
  selectedTags = [];
  tracks = [];

  loading = false;
  tagList = [];

  tags = [];
  groupTags = [];

  constructor(
    private tagService: TagService,
    private tagValueService: TagValueService,
    private tagGroupService: TagGroupsService,
    private httpService: HttpHandlerService,
    private paramService: ParametersService,
    private assetRecordService: AssetRecordService,
    private message: NzMessageService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    if (this.pickermode == "standalone") {
      this.getAllTags();
      this.getResource();
    }
    if (this.pickermode == "combined") {
      if (
        this.currentTags == undefined ||
        !Array.isArray(this.currentTags) ||
        this.currentTags.length <= 0
      )
        this.getAllTags(true);
      else this.getAllTags();
    }
    if (this.tagGroupType != undefined && this.tagGroupType != null) {
      this.getAllTagGroups();
    }
    this.getAllParams();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currentTags"]) {
      let v = changes["currentTags"]["currentValue"];
      if (v.length > 0) {
        console.log("TAGS VALUE:::::::::::");
        console.log(v);
        let vals = v.map((o) => {
          return {
            ...o,
            displaytype: "default",
          };
        }) as any[];

        let taggroup = vals.find(
          (o) => o.taggroupid && o["status"] == "Active"
        );

        if (
          !this.resourceType ||
          (this.resourceType && this.resourceType != "Group")
        ) {
          console.log("TAG GROUP::::::::::::::::");
          if (taggroup && taggroup.taggroupid) {
            this.groupTags = vals.filter(
              (o) => o["taggroupid"] && o["status"] == "Active"
            );
            if (this.tagStructure.length > 0) {
              let selected = [];
              for (let index = 0; index < this.tagStructure.length; index++) {
                const element = this.tagStructure[index];
                let path = this.searchInTree(element, {
                  value: taggroup.taggroupid,
                }).map((node) => node.value);
                if (path.length > 0) {
                  path.pop();
                  selected = path;
                  break;
                }
              }
              if (selected.length > 0) {
                this.selectedGroup = selected;
              }
            }
            vals.sort(function (a, b) {
              return b.taggroupid - a.taggroupid;
            });
          } else {
            this.selectedGroup = null;
            this.groupTags = [];
          }
          this.tags = vals.filter((o) => !o["taggroupid"]);
          let sTags = this.tags.map((o) => o["tagid"]);
          this.selectedTags = sTags;
        } else {
          this.tags = vals;
          let sTags = this.tags.map((o) => o["tagid"]);
          this.selectedTags = sTags;
        }
      } else {
        this.fillDefaultValues();
      }
    }
  }

  // Handle component level logics => Getting available tags,
  getAllTags(setdefault?: boolean) {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }
          if (obj.tagtype == "cmdb") {
            let reqObj = {
              crns: [obj.attributeid],
              tenantid: this.userstoragedata.tenantid,
              status: "Active",
              fieldkey: obj.resourceid
            };
            this.assetRecordService.getAllDetail(reqObj).subscribe((res) => {
              const response = JSON.parse(res._body);
              if (response.status) {
                obj.cmdb_data = response.data.map((el) => {
                  let fvalue = "";
                  if (this.checkJson(el.fieldvalue)) {
                    const fieldValue = JSON.parse(el.fieldvalue);
                    if (Array.isArray(fieldValue)) {
                      fieldValue.forEach((el) => {
                        fvalue += fvalue ? `, ${el.name}` : el.name;
                      });
                    }
                    el.fieldvalue = fvalue;
                  }
                  return el;
                });
                //cmdb data to existing tag
                this.tags.forEach((et) => {
                  if (et.tag.tagid == obj.tagid) {
                    et.tag.cmdb_data = obj.cmdb_data;
                    et.tagvalue = obj.cmdb_data.find((tv) => { return tv.fieldvalue == et.tagvalue });
                  }
                });
              }
            });
          }
          return obj;
        });
        this.tagList = d;
        if (setdefault) this.fillDefaultValues();
      } else {
        this.loading = false;
        this.tagList = [];
      }
    });
  }
  checkJson(data) {
    try {
      let d = JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }
  // If mode standalone fetch resource,
  getResource() {
    let cndtn = {
      resourceid: this.resourceId,
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    };

    if (this.resourceType) cndtn["resourcetype"] = this.resourceType;

    this.tagValueService.all(cndtn).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status && response.data.length > 0) {
          let vals = this.tagService.decodeTagValues(
            response.data,
            this.mode || "picker"
          );
          let taggroup = vals.find((o) => o.taggroupid);

          this.tags = vals;
        } else {
          this.fillDefaultValues();
          this.message.error(response.message);
        }
      },
      (err) => {
        this.message.error("Unable to get tag group. Try again");
      }
    );
  }

  // if combined and no tags specified fill
  fillDefaultValues() {
    // let l = this.tagList.map(o => {
    //   let d = o;
    //   if (d.tagtype == 'list' && d.lookupvalues != null && typeof d.lookupvalues == 'string') {
    //     d.lookupvalues = d.lookupvalues.split(',')
    //   }
    //   if (d.tagtype == 'date' && d.lookupvalues != null) {
    //     d.lookupvalues = new Date(d.lookupvalues)
    //   }
    //   if (d.tagtype == 'number' && d.lookupvalues != null) {
    //     d.lookupvalues = Number(d.lookupvalues)
    //   }
    //   return {
    //     displaytype: 'default',
    //     tagvalue: d.lookupvalues,
    //     tagid: d.tagid,
    //     resourceid: this.resourceId || null,
    //     resourcetype: this.resourceType || null,
    //     refid: this.refId || null,
    //     cloudprovider: this.cloudProvider || null,
    //     tag: d,
    //     status: AppConstant.STATUS.ACTIVE,
    //     useVar: false
    //   }
    // });
    // this.tags = l;
  }

  selectionChanged(e, index) {
    this.tags.splice(index, 1);
    let tag = this.tagList.find((o) => o.tagid == e);

    let d = _.cloneDeep(tag);

    let exists = this.tags.filter((o) => {
      return (
        o.tagid == d.tagid && o.status && o.status == AppConstant.STATUS.ACTIVE
      );
    });
    let existsInGroupTags = this.groupTags.filter((o) => {
      return (
        o.tagid == d.tagid && o.status && o.status == AppConstant.STATUS.ACTIVE
      );
    });

    if (exists.length > 0 || existsInGroupTags.length > 0) {
      this.message.info("Tag already exists");
    } else {
      if (tag) {
        if (d.tagtype == "list" && typeof d.lookupvalues == "string") {
          d.lookupvalues = d.lookupvalues.split(",");
        }

        let obj = {
          displaytype: "manual",
          tagvalue: d.lookupvalues,
          tagid: d.tagid,
          status: d.status || AppConstant.STATUS.ACTIVE,
          resourceid: this.resourceId || null,
          resourcetype: this.resourceType || null,
          refid: this.refId || null,
          cloudprovider: this.cloudProvider || null,
          tag: d,
        };

        this.tags.push(obj);
      }
    }
  }

  addTag() {
    let d = _.cloneDeep(this.tags[0]);
    d["displaytype"] = "Manual";
    d["tagvalue"] = null;
    d["tag"]["tagid"] = null;
    d["tag"]["tagtype"] = null;
    d["cloudprovider"] = this.cloudProvider;
    d["status"] = AppConstant.STATUS.ACTIVE;

    if (d["tagvalueid"]) delete d["tagvalueid"];

    this.tags.push(d);
  }

  deleteTag(i, type: "TAG" | "GROUPTAG") {
    if (type == "TAG") {
      this.selectedTags.splice(i, 1);
      this.tags[i].status = AppConstant.STATUS.INACTIVE;
    }
    if (type == "GROUPTAG") {
      if (this.groupTags[i].tagvalueid == undefined) {
        this.groupTags[i].ignore = true;
      }
      this.groupTags[i].status = AppConstant.STATUS.INACTIVE;
    }
  }

  prepareTagValues() {
    let tagVals = this.tagService.encodeTagValues(this.tags, this.mode);
    let groupTagVals = this.tagService.encodeTagValues(
      this.groupTags,
      this.mode
    );

    let vals = (tagVals || []).concat(groupTagVals || []);

    let d = vals.map((o) => {
      let obj = o;
      obj["createddt"] = new Date();
      obj["createdby"] = this.userstoragedata.fullname;
      obj["lastupdateddt"] = new Date();
      obj["lastupdatedby"] = this.userstoragedata.fullname;
      obj["tenantid"] = this.userstoragedata.tenantid;

      // To automatically add resourceid && refid for taggroup adds scenerio.
      if (this.tagGroupType) obj["resourceid"] = this.resourceId;
      if (this.refId) obj["refid"] = this.refId;
      if (this.cloudProvider) obj["cloudprovider"] = this.cloudProvider;

      if (obj["resourceid"] !== null && typeof obj["resourceid"] == "string") {
        obj["resourceid"] = Number(obj["resourceid"]);
      }

      if (obj["cloudprovider"] == null) {
        delete obj["cloudprovider"];
      }
      if (obj["taggroupid"] == null) {
        delete obj["taggroupid"];
      }
      if (obj["tagvalue"] == null) {
        delete obj["tagvalue"];
      }
      if (obj["resourceid"] == null) {
        delete obj["resourceid"];
      }
      if (obj["refid"] == null) {
        delete obj["refid"];
      }
      if (obj["tagorder"] == null) {
        delete obj["tagorder"];
      }
      if (obj.tag.tagtype == 'cmdb') {
        obj.attributerefid = obj.tagvalue.resourceid;
        obj.tagvalue = obj.tagvalue.fieldvalue;
      } else {
        obj.attributerefid = "";
      }

      delete obj["displaytype"];

      return obj;
    });

    if (this.validateInputs) {
      this.validateTagValues(d);
    } else {
      this.saveEmitTagValues(d);
    }
  }

  validateTagValues(d) {
    for (let index = 0; index < d.length; index++) {
      const element = d[index];

      if (
        (element.status && element.status == AppConstant.STATUS.ACTIVE) ||
        !element.status
      ) {
        if (
          element.tagvalue == null &&
          element.tag.required != null &&
          element.tag.required == true
        ) {
          this.message.error(`${element.tag.tagname} can't be empty`);
          return;
        }
        console.log(element.tag.tagtype == "text" && element.tag.regex != null);
        if (element.tag.tagtype == "text" && element.tag.regex != null) {
          try {
            let re = new RegExp(element.tag.regex);
            if (!re.test(element.tagvalue)) {
              this.message.error(
                `${element.tag.tagname} doesn't comply with RegExp`
              );
              return;
            }
          } catch (error) {
            this.message.error(
              `${element.tag.tagname} doesn't comply with RegExp`
            );
            return;
          }
        }
      }
    }

    this.saveEmitTagValues(d);
  }

  saveEmitTagValues(d) {
    if (this.pickermode == "standalone") {
      this.tagValueService.bulkupdate(d).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.tagChanges.emit({
              mode: this.pickermode,
              data: d,
              updated: true,
            });
            this.message.info(response.message);
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to remove tag. Try again");
        }
      );
    }

    if (this.pickermode == "combined") {
      this.tagChanges.emit({
        mode: this.pickermode,
        data: d,
        updated: false,
      });
    }
  }

  selectedTagsChanges(c) {
    if (this.selectedTags.length > 0) {
      // Re-evaluate tags should be listed.
      this.selectedTags.forEach((tagid, index) => {
        let tag = this.tagList.find((o) => o.tagid == tagid);

        let d = _.cloneDeep(tag);

        let exists = this.tags.filter((o) => {
          return (
            o.tagid == d.tagid &&
            o.status &&
            o.status == AppConstant.STATUS.ACTIVE
          );
        });
        let existsInGroupTags = this.groupTags.filter((o) => {
          return (
            o.tagid == d.tagid &&
            o.status &&
            o.status == AppConstant.STATUS.ACTIVE
          );
        });

        if (exists.length > 0 || existsInGroupTags.length > 0) {
          // this.selectedTags.splice(index, 1);
          // this.message.info("Tag already exists");
        } else {
          if (tag) {
            if (d.tagtype == "list" && typeof d.lookupvalues == "string") {
              d.lookupvalues = d.lookupvalues.split(",");
            }

            let obj = {
              displaytype: "default",
              tagvalue: d.lookupvalues,
              category: d.category ? d.category : null,
              tagid: d.tagid,
              status: d.status || AppConstant.STATUS.ACTIVE,
              resourceid: this.resourceId || null,
              resourcetype: this.resourceType || null,
              refid: this.refId || null,
              cloudprovider: this.cloudProvider || null,
              tag: d,
            };

            this.tags.push(obj);
          }
        }
      });

      // Re-evaluate selected tags in dropdown.
      this.tags.forEach((tag, index) => {
        if (!this.selectedTags.includes(tag.tagid)) {
          this.tags.splice(index, 1);
        }
        // let inSelectTag = this.selectedTags.includes()
      });
    }
  }

  // Tag Group functionalities

  // Get All taggroups and it's related tags.
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
        let a = this;
        if (response.status) {
          let level = 0;

          if (response.data[0]["keyvalue"] != null) {
            let struct = JSON.parse(response.data[0]["keyvalue"]) as treeInt[];

            let arr = [] as any[];

            struct.forEach((node) => {
              let parent = {
                label: node.name,
                value: node.id,
              };

              if (node.children && node.children.length > 0)
                parent["isLeaf"] = false;
              else parent["isLeaf"] = true;

              function extractChild(pnt: any, nd: treeInt) {
                if (nd.children && nd.children.length > 0) {
                  let childrens = [];
                  nd.children.forEach((childNode) => {
                    let obj = {
                      label: childNode.name,
                      value: childNode.id,
                    };

                    if (childNode.children && childNode.children.length > 0)
                      obj["isLeaf"] = false;
                    else obj["isLeaf"] = true;

                    if (obj["isLeaf"]) {
                      let tg = a.tagGroups.find(
                        (o) => o["taggroupid"] == obj["value"]
                      );
                      if (tg) childrens.push(obj);
                    } else {
                      extractChild(obj, childNode);
                      childrens.push(obj);
                    }
                  });
                  if (childrens.length > 0) pnt["children"] = childrens;
                  else {
                    pnt["disabled"] = true;
                  }
                }
              }

              if (parent["isLeaf"]) {
                let tg = this.tagGroups.find(
                  (o) => o["taggroupid"] == parent["value"]
                );
                if (tg) {
                  arr.push(parent);
                }
                // else { parent['disabled'] = true; arr.push(parent); }
              } else {
                extractChild(parent, node);
                arr.push(parent);
              }
            });

            this.tagStructure = arr;
          }
        } else {
        }
      });
  }

  onChanges(values: any): void {
    this.tagGroupSelectionChanges(values.reverse()[0]);
  }

  searchInTree(departmentTree, category, data = []) {
    const findPath = (node, category) => {
      if (node.value === category.value) {
        return [node];
      } else {
        if (!node.children) {
          node.children = [];
        }
        for (const child of node.children) {
          const childPath = findPath(child, category);
          if (Array.isArray(childPath)) {
            childPath.unshift(child);
            return childPath;
          }
        }
      }
    };

    const foundPath = findPath(departmentTree, category);
    if (Array.isArray(foundPath)) {
      data.push(departmentTree);
      data.push(...foundPath);
    }

    return data;
  }

  getAllTagGroups() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    if (this.tagGroupType) cndtn["resourcetype"] = this.tagGroupType;

    this.tagGroupService.all(cndtn).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.tagGroups = response.data;
          if (this.tagGroups.length > 0) this.getStructure();
        } else {
          this.loading = false;
          this.tagGroups = [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  tagGroupSelectionChanges(e: any) {
    if (e != null) {
      this.groupTags.forEach((o, index) => {
        if (o.taggroupid && o.taggroupid > 0) {
          this.deleteTag(index, "GROUPTAG");
        }
        if (o.tagvalueid == null) {
          this.deleteTag(index, "GROUPTAG");
        }
      });

      let group = this.tagGroups.find((o) => o["taggroupid"] == e);

      let vals = this.tagService
        .decodeTagValues(_.cloneDeep(group.tagvalues), this.mode)
        .map((o) => {
          delete o["tagvalueid"];
          o["resourcetype"] = this.tagGroupType;
          o["displaytype"] = "taggroup";

          if (o["tag"]["tagtype"] == "list")
            o["tagvalue"] = o["tag"]["lookupvalues"][0];

          return o;
        });

      let dTags = _.cloneDeep(this.groupTags);
      dTags.splice(0, 0, ...vals);

      this.groupTags = dTags;
    } else {
      this.tags.forEach((o, index) => {
        if (o.taggroupid && o.taggroupid > 0) {
          this.deleteTag(index, "TAG");
        }
      });
      this.groupTags.forEach((o, index) => {
        if (o.taggroupid && o.taggroupid > 0) {
          this.deleteTag(index, "GROUPTAG");
        }
      });
    }
  }

  // Parameter related functions
  getAllParams() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      paramtypes: ["Variable"],
    } as any;
    this.paramService.getParamsList(cndtn).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.paramsList = response.data;
        } else {
          this.loading = false;
          this.paramsList = [];
        }
      },
      (err) => {
        console.log("ERROR GETTING TAG GROUPS::::::::::");
        console.log(err);
      }
    );
  }
}
