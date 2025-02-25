import { Component, OnInit } from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import * as moment from "moment";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AssetRecordService } from "./assetrecords.service";
import { TagService, ITag } from "../tagmanager/tags.service";
import { TagValueService } from "../tagmanager/tagvalue.service";
import {
  IResourceType,
  IAssetHdr,
  IAssetDtl,
} from "src/app/modules/interfaces/assetrecord.interface";
import { Buffer } from "buffer";
import downloadService from "../../../modules/services/shared/download.service";
import * as MarkJs from "mark.js";
import { AssetAttributesConstant } from "./attributes.contant";

@Component({
  selector: "app-asset-records",
  templateUrl:
    "../../../presentation/web/base/assetrecords/assetrecords.component.html",
  styles: [
    `
      #assetdetail td,
      #assetdetail th {
        border: 1px solid #dddddd30;
        padding: 8px;
      }

      #assetdetail tr:nth-child(even) {
        background-color: #dddddd1c;
      }

      #assetdetail th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
    `,
  ],
})
export class AssetRecordsComponent implements OnInit {
  screens = [];
  appScreens = {} as any;
  userstoragedata = {} as any;
  resource = {} as any;
  selectedResourceName = null as null | string;
  selectedResourceID = null as null | string;
  selectedResource = [];
  selectedFields = null as null | any[];
  selectedcolumns = {};
  pageIndex = 1;
  pageSize = 10;
  assets = [] as Record<string, any>[];
  assetsCount = 0;
  filterMenuVisible = false;
  filterFieldKey = null as null | string;
  filterFieldName = null as null | string;
  filterValues = {};
  filterValuesClone = {}; // Clone to validate the state between filter drawer open and close
  filterSearchModel = "";
  filterableValues = [] as {
    fieldvalue: string;
    fieldkey: string;
    resourceid: string;
  }[];
  blockUI = false;

  resourceDetailMenuVisible = false;
  resourceDetails = {} as Record<string, string>;
  inboudResourceDetails = [] as Record<string, string>[];
  filteredColumns = [];
  updateTagVisible = false;
  tags = [];
  tagsClone = [] as Record<string, any>[];
  tagsList = [];
  groupedTagsList = {} as Record<string, Record<string, any>[]>;
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  globalSearchModel = "";

  // Forms
  filterForm: FormGroup;

  // Dropdown values
  resourceTypesList: IResourceType[] = [];
  tagList: ITag[] = [];

  // Loaders
  gettingAssets = false;
  gettingFilterableValues = false;
  updatingTags = false;

  current = "dashboard";
  currentSortColumn = null;
  currentSortColumnOrder = null;
  selectedTag = null as Record<string, any> | null;
  showDetailedView = false;
  selectedKeyValue = "";
  edit = false;
  delete = false;
  add = false;
  isAddForm = false;
  isdownload = false;
  download = false;
  referringAssetDetails = [];
  openadvfilter = false;
  attrFilters = [];
  title = "";
  pageCount = AppConstant.pageCount;
  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private fb: FormBuilder
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_RECORD_MANAGEMENT,
    } as any);
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    if (this.appScreens) {
      this.add = this.appScreens.actions.includes("Create");
      this.edit = this.appScreens.actions.includes("Edit");
      this.delete = this.appScreens.actions.includes("Delete");
      this.download = this.appScreens.actions.includes("Download");
    }
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      crn: [null, Validators.compose([Validators.required])],
      tag: [null],
      tagvalue: [null],
    });
    let assetParams = this.route.snapshot.queryParams;
    if (assetParams && assetParams.mode) {
      this.current = "list";
    }
    this.getResourceType();
    this.getAllTags();
  }
  onPageSizeChange(size:number){
    this.pageSize = size;
    this.getAssets();
  }
  getResourceType() {
    this.assetRecordService
      .getResourceTypes(
        {
          tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
            "tenantid"
          ]
        }
      )
      .subscribe((d) => {
        let response: IResourceType[] = JSON.parse(d._body);
        this.resourceTypesList = _.orderBy(response, ["resource"], ["asc"]);
      });
  }

  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d: ITag[] = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }
  getResourceDetail(crn: string) {
    let r = this.resource[crn];
    if (!r) {
      this.selectedcolumns = {};
      this.filterValues = {};
      this.selectedResource = [];
      this.selectedFields = [];
      this.assets = [];
      this.assetsCount = 0;
      this.assetRecordService
        .getResource(
          this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
          ],
          crn
        )
        .subscribe((d) => {
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
            this.pageIndex = 1;
            this.pageSize = this.pageSize;
            if (idx + 1 == response.length) {
              this.resource[crn] = {
                filtered: this.filteredColumns,
                selected: response,
              };
              this.getAssets();
            }
          });
          this.filteredColumns = [..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"])];
          this.selectedResourceName = crn;
          // response.forEach((o) => {
          //   if (o.showbydefault) {
          //     this.selectedcolumns[o.fieldkey] = true;
          //   }
          // });
        });
    } else {
      this.selectedcolumns = {};
      this.filterValues = {};
      this.selectedFields = [];
      this.assets = [];
      this.selectedResource = r.selected;
      this.selectedResourceName = crn;
      this.pageIndex = 1;
      this.pageSize = this.pageSize;
      r.filtered.forEach((o) => {
        o.isSelected = false;
        if (o.showbydefault) {
          o.isSelected = true;
        }
      });
      this.filteredColumns = r.filtered;
      this.getAssets();
    }
  }

  tagChanged(e) {
    if (e == null) {
      this.selectedTag = null;
      return;
    }
    let tag = this.tagList.find((o) => o["tagid"] == e);
    let tagClone = _.cloneDeep(tag) as any;

    this.filterForm.patchValue({
      tagvalue: null,
    });

    if (tagClone.tagtype == "list") {
      tagClone.lookupvalues = tagClone.lookupvalues.split(",");
    } else if (
      tagClone.tagtype == "range" &&
      typeof tagClone.lookupvalues == "string"
    ) {
      tagClone.min = tagClone.lookupvalues.split(",")[0];
      tagClone.min = tagClone.lookupvalues.split(",")[1];
    }

    this.selectedTag = _.cloneDeep(tagClone);
  }

  getAssets() {
    this.gettingAssets = true;
    let selectedFields = [];
    let columns = [];
    this.filteredColumns = [..._.orderBy(this.filteredColumns, ["ordernumber", "id", "asc"])];
    _.map(this.filteredColumns, (itm: any) => {

      if (itm.isSelected) {
        columns.push(
          _.pick(itm, [
            "fieldkey",
            "fieldname",
            "fieldtype",
            "assettype",
            "linkid",
            "isSelected",
            "referencekey",
          ])
        );
        selectedFields.push(
          _.pick(itm, [
            "fieldkey",
            "fieldname",
            "fieldtype",
            "assettype",
            "linkid",
            "isSelected",
            "referencekey",
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
      crn: this.filterForm.get("crn").value,
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
    if (this.attrFilters.length > 0) {
      let filters = [];
      _.map(this.attrFilters, function (g, grpIdx) {
        let group = {};
        group[`group${grpIdx}`] = [];
        if (g.attributeList && g.attributeList.length > 0) {
          let obj = {
            groupcondition: g.operator == 0 ? 'AND' : 'OR',
            filters: []
          }
          g.attributeList.map((a) => {
            let f = {
              fieldname: a.type.fieldname,
              fieldvalue: a.value,
              formula: a.formula,
              fieldkey: a.type.fieldkey,
              fieldtype: a.type.fieldtype
            }
            if (a.type.fieldtype == 'DateTime') {
              f['fieldvalue'][0] = moment(a.value[0]).format('YYYY-MM-DD HH:mm:ss');
              f['fieldvalue'][1] = moment(a.value[1]).format('YYYY-MM-DD HH:mm:ss');
            }
            obj.filters.push(f);
          });
          group[`group${grpIdx}`].push(obj);
          filters.push(group)
        }
      });
      f['attrfilters'] = filters;
    }
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
          this.assets = response.rows;
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
      });
    } else {
      this.gettingAssets = false;
    }
  }

  getFieldValues() {
    let f = {
      tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
      ],
      fieldkey: this.filterFieldKey,
    };
    if (this.filterSearchModel.length > 0) {
      f["search"] = this.filterSearchModel;
    }
    this.gettingFilterableValues = true;
    this.assetRecordService.getResourceFieldValues(f).subscribe(
      (d) => {
        let response: {
          fieldvalue: string;
          fieldkey: string;
          resourceid: string;
        }[] = JSON.parse(d._body);
        this.filterableValues = _.orderBy(response, ["fieldvalue"], ["asc"]);
        this.gettingFilterableValues = false;
      },
      (err) => {
        this.gettingFilterableValues = false;
      }
    );
  }

  // @revert: Simply close the filter menu without any changes
  filterDrawerClose(revert: boolean) {
    if (revert == true) {
      this.filterMenuVisible = false;
      this.filterableValues = [];
      this.filterValuesClone = {};
    } else {
      const filtersArray = Object.keys(
        this.filterValuesClone[this.filterFieldName]
      ).filter((o) => {
        if (this.filterValuesClone[this.filterFieldName][o] == true) {
          return o;
        }
      });
      let f = {
        ...this.filterValuesClone,
      };

      if (filtersArray.length > 0) {
        f[this.filterFieldName] = {};
        filtersArray.forEach((o) => {
          f[this.filterFieldName][o] = true;
        });
      }
      // Remove empty filters
      Object.keys(f).forEach(
        (k) => (f[k] == null || Object.keys(f[k]).length <= 0) && delete f[k]
      );
      for (const key in f) {
        _.map(f[key], function (value, k) {
          if (value == false) {
            delete f[key][k];
          }
          if (_.isEmpty(f[key])) delete f[key];
        });
      }

      this.filterValues = f;
      this.filterMenuVisible = false;
      this.filterableValues = [];
      this.filterValuesClone = {};
      this.pageIndex = 1;
      this.pageSize = this.pageSize;
      this.getAssets();
    }
  }
  openFilterFor(hdr: IAssetHdr) {
    this.filterFieldKey = hdr.fieldkey;
    this.filterFieldName = hdr.fieldname;

    this.filterValuesClone = _.cloneDeep(this.filterValues);
    if (!this.filterValuesClone[hdr.fieldname]) {
      this.filterValuesClone[hdr.fieldname] = {};
    }

    this.getFieldValues();
    this.filterSearchModel = "";
    this.filterMenuVisible = true;
  }
  sortByColumn(hdr: IAssetHdr, sortOrder: string) {
    this.currentSortColumn = hdr.fieldname;
    this.currentSortColumnOrder = sortOrder;
    this.getAssets();
  }

  removeFilter(l1: string, l2: string) {
    delete this.filterValues[l1][l2];

    if (Object.keys(this.filterValues[l1]).length <= 0) {
      delete this.filterValues[l1];
    }

    this.pageIndex = 1;
    this.pageSize = this.pageSize;
    this.getAssets();
  }
  viewResourceDetail(data: Record<string, string>) {
    this.blockUI = true;
    this.selectedResourceID = data["resource"];
    this.assetRecordService
      .getResourceValuesById(btoa(data["resource"]), `tagdetails=${true}`) // <<crn>>/<<resourceid>>
      .subscribe(
        (r) => {
          this.blockUI = false;
          let response: {
            data: IAssetDtl[];
            inbound: Record<string, any>[];
            documents: Record<string, any>[];
            referringassets: Record<string, any>[];
          } = JSON.parse(r._body);

          let data: any = {
            details: [],
          };
          response.data.forEach((o) => {
            data[o["fieldkey"]] = o["fieldvalue"];
            data["header"] = this.selectedResource;
            data["details"].push(o);
          });
          this.resourceDetails = data;
          let resource = _.clone(this.selectedResource);
          let identifiercrn: any = _.find(resource, { identifier: true });
          let identifier: any = _.find(data.details, { fieldkey: identifiercrn.fieldkey });
          this.title = identifiercrn["resourcetype"] + " > " + identifier.fieldvalue;
          this.inboudResourceDetails = response.inbound;
          this.referringAssetDetails = response.referringassets;
          this.resourceDetailMenuVisible = true;
          this.isAddForm = false;
          this.getTagValues();
        },
        (err) => {
          this.blockUI = false;
          alert("Unable to fetch details. Try again.");
        }
      );
  }

  parseJSON(text: string) {
    try {
      let j = JSON.parse(text);
      return Object.keys(j).length > 0 ? j : [];
    } catch (error) {
      return [];
    }
  }
  getTagValues() {
    try {
      this.tagValueService
        .all({
          resourcetype: "ASSET_RECORD",
          resourcerefid: this.selectedResourceID,
          status: AppConstant.STATUS.ACTIVE,
        })
        .subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.tags = this.tagService.decodeTagValues(
                response.data,
                "picker"
              );
              this.tagsList = this.tagService.prepareViewFormat(response.data);
              this.tagsClone = response.data;
              this.groupTagValues(response.data);
            } else {
              this.tags = [];
              this.tagsList = [];
              this.tagsClone = [];
              this.groupedTagsList = {};
            }
          },
          (err) => {
            this.groupedTagsList = {};
          }
        );
    } catch (error) {
      this.tags = [];
      this.tagsList = [];
      this.tagsClone = [];
      console.log("ERROR in gettting tag values >>>>>>>>>>");
      console.log(error);
    }
  }
  groupTagValues(data: Record<string, any>) {
    const d = _.groupBy(data, "category");
    let obj = {};

    for (const key in d) {
      if (Object.prototype.hasOwnProperty.call(d, key)) {
        const value = d[key];
        obj[key] = this.tagService.prepareViewFormat(value);
      }
    }
    this.groupedTagsList = obj;
  }
  onTagChangeEmit(e) {
    if (e["mode"] == "combined") {
      console.log(e.data);
      this.updateTagVisible = false;
      this.tagsClone = e.data;
      this.tagsList = this.tagService.prepareViewFormat(e.data);
      this.groupTagValues(e.data);
    }
  }
  updateTags() {
    this.updatingTags = true;
    this.tagValueService
      .bulkupdate(
        this.tagsClone.map((o) => {
          o["resourcetype"] = "ASSET_RECORD";
          o["resourcerefid"] = this.selectedResourceID;
          return o;
        })
      )
      .subscribe(
        (result) => {
          this.updatingTags = false;
          let response = JSON.parse(result._body);

          console.log("Tags updated response <<<<<<", response);
          if (response.status) {
            console.log("Tags updated");
          }
        },
        (err) => {
          console.log("ERR IN TAG UPDATE >>>>>>>>>>>>>>>>>>");
          this.updatingTags = false;
          console.log(err);
        }
      );
  }
  onSideBarTagClick(val) {
    this.updateTagVisible = val;
  }
  openAddView() {
    this.resourceDetailMenuVisible = true;
    this.referringAssetDetails = [];
    this.isAddForm = true;
  }
  notifyNewEntry(data) {
    this.resourceDetailMenuVisible = false;
    this.isAddForm = false;
    this.getAssets();
  }
  downloadAssets() {
    this.isdownload = true;
    this.getAssets();
  }
  deleteRecord(data) {
    this.assetRecordService
      .updateDetail({
        resourceid: data.resource,
        status: AppConstant.STATUS.DELETED,
      })
      .subscribe((d) => {
        if (d.status) {
          this.getAssets();
        }
      });
  }
  getKey(data, r) {
    let fieldkey = _.includes(r.fieldkey, "[")
      ? JSON.parse(r.fieldkey.replace(/'/g, '"')).join(".")
      : r.fieldkey;
    return _.get(data, fieldkey);
  }

  applyAttrFilter(e) {
    this.attrFilters = e;

    this.openadvfilter = false;
    this.getAssets();
  }
  refresh() {
  this.globalSearchModel = "";
  this.getAssets();
  }
}
