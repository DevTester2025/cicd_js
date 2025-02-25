import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { AssetRecordService } from "./assetrecords.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as MarkJs from "mark.js";
import * as _ from "lodash";
import { groupBy } from "lodash";
import { TagValueService } from "../tagmanager/tagvalue.service";
import { TagService } from "../tagmanager/tags.service";
import { NzMessageService } from "ng-zorro-antd";
import * as moment from "moment";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AssetsService } from "../assets/assets.service";
import { AssetAttributesConstant } from "./attributes.contant";
import { VMWareService } from "../../deployments/vmware/vmware-service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
interface Inbound {
  id: number;
  crn: string;
  fieldkey: string;
  fieldvalue: string;
  resourceid: string;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: string;
  lastupdateddt: Date;
  tenantid: number;
  meta: string;
  resourcetype: string;
  fieldname: string;
  identifier?: boolean;
  fieldtype: string;
  protected: null;
  defaultval: string;
  showbydefault: number;
  relation: string;
}

@Component({
  selector: "app-cloudmatiq-asset-parent",
  templateUrl:
    "../../../presentation/web/base/assetrecords/asset-parent.component.html",
  styles: [
    `
      #assetdetail td,
      #assetdetail th {
        border: 1px solid #dddddd30;
        padding: 8px;
        color: white;
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

      nz-select {
        width: 92%;
      }
      .ant-calendar-picker {
        width: 96%;
      }
      .ant-table-row-expand-icon-cell {
        text-align: left;
      }
      .ant-radio, .ant-radio-group, .ant-radio-wrapper {
        color: #ffffff !important;
      }
    `,
  ],
})
export class AssetParentComponent implements OnInit {
  @Input() resourceDetails;
  @Input() resourceId;
  @Input() inboundDetails: Inbound[];
  @Input() referringAssetDetails: any[];
  @Input() selectedResource;
  @Input() highlight;
  @Input() isAddForm;
  @Input() recordData = [];
  @Output() onEmitTagClick = new EventEmitter();
  @Output() notifyNewEntry = new EventEmitter();
  @HostListener("window:click", ["$event"])
  handleClick(e: MouseEvent): void {
    if (
      this.editInputId &&
      this.inputElement &&
      this.inputElement.nativeElement !== e.target
    ) {
      this.editInputId = null;
    }
  }
  @ViewChild("NzInputDirective", { read: ElementRef }) inputElement: ElementRef;

  editInputId: string | null = "-";
  editSelectId: string | null = "Unknown";
  updateData: string | any | null;
  rupdateData: string | any | null;
  crnList = [];
  defaultValues = [];
  showDetailedView = false;
  blockUI = false;
  inboundReferences: {
    key: string;
    values: { name: string; resourceid: string }[];
  }[] = [];

  // Tags
  updateTagVisible = false;
  updatingTags = false;
  tags = [];
  tagsClone = [];
  tagsList = [];
  tagActuls = [] as Record<string, any>[];
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
  userstoragedata = {} as any;
  addformloading = false;
  stabIndex = 0;
  edit = false;
  delete = false;
  add = false;
  screens = [];
  appScreens = {} as any;
  selectedField = {} as any;
  attachedResources = {} as any;
  updateDetails = {} as any;
  selectedTagDetails = [] as any;
  updateInstances = [] as any;
  showAttachedTags = false;
  showConfirmation = false;
  assetList = [];
  editTagId = null;
  selectedKeyData;
  inboundData;
  historyData: Record<string, any>[] = [];
  selectedResourceId = null as null | string;
  selectedKeyValue;
  crnData = [];
  resourceData = [];
  assetData = [];
  referringAssets = [];
  editrSelectId = null;
  assetGrps: any[];
  showAsset = true;
  assetMappingList = [];
  pricings = [];
  tagparamList = [];
  tagValues = [];
  tagGroupType = "SOLUTION_ASSET";
  associatedTags = [];
  resourceList = [];
  groupedData = {} as any;
  title = "";
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService,
    private tagValueService: TagValueService,
    private tagService: TagService,
    private httpHandler: HttpHandlerService,
    private message: NzMessageService,
    private commonService: CommonService,
    private assetsService: AssetsService,
    private vmwareService: VMWareService
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
    }
  }
  ngOnInit() {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.highlightSearch();
    this.parseInboundData();
    this.getTagValues();
    this.getAllAssets();
    this.getLookup();
  }
  ngOnChanges(changes: SimpleChanges) {
    this.referringAssets = [];
    if (changes.recordData && changes.isAddForm) {
      this.addformloading = true;
      let crns = [];
      _.filter(this.recordData, (item, idx) => {
        this.resourceData[idx] = [];
        if (item.fieldtype == "REFERENCE") {
          crns.push(item.relation);
          return item;
        }
      });
      this.getAllCRNs(crns);
    }
    if (changes.selectedResource && changes.selectedResource.currentValue.length > 0) {
      let len = changes.selectedResource.currentValue.length;
      _.each(changes.selectedResource.currentValue, (itm, idx: number) => {
        if (itm.fieldtype == "Reference Asset") {
          let details = [];
          let referenceasset = JSON.parse(itm.referenceasset);
          _.map(referenceasset.attribute, (dtl) => {
            let attribute = _.find(
              AssetAttributesConstant.COLUMNS[referenceasset.assettype],
              {
                field: dtl,
              }
            );
            if (attribute) {
              details.push(attribute);
            }
          });
          let obj = {
            ...itm,
            details: details,
            ..._.omit(referenceasset, "attribute"),
            expand: true,
            aexpand: true,
          };
          this.resourceList.push(obj);
        }
        if (itm.fieldtype == "Reference Tag") {
          let tags = JSON.parse(itm.referencetag.replace(/'/g, '"'));
          this.associatedTags = [...this.associatedTags, ...tags];
          _.map(tags, (t) => {
            let tag = {
              tagid: t,
              ...itm,
              tagvalue: "",
              tagname: "",
              resourcerefid: this.resourceId,
              resourcetype: "ASSET_RECORD",
            };
            this.tagparamList.push(tag);
          });
        }
        if (idx == len - 1) {
          this.resourceList = [...this.resourceList];
          this.getTagDetails(this.associatedTags);
        }
      });
      this.checkAssets();
    }
    if (
      changes.referringAssetDetails.currentValue &&
      changes.referringAssetDetails.currentValue.length > 0
    ) {
      _.map(changes.referringAssetDetails.currentValue, (itm, idx: number) => {
        let obj = _.clone(itm);
        obj.asset = itm.cloudprovider + "-" + itm.resourcetype;
        obj.assetid = itm.resourcerefid;
        obj.attributeList = [];
        this.referringAssets.push(obj);
        this.getAssets(obj, idx);
        if (idx == this.referringAssets.length - 1) {
          this.getAssetDetail(this.referringAssets);
        }
        return itm;
      });
    } else {
      this.addRefAsset();
    }
  }
  getTagDetails(tags) {
    let reqObj = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      tagids: tags,
    } as any;

    this.tagService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        _.map(this.tagparamList, (t) => {
          let selectedTag: any = _.find(response.data, {
            tagid: t.tagid,
          });
          t.tagname = selectedTag ? selectedTag.tagname : "";
          return t;
        });
      }
    });
  }
  checkAssets() {
    this.selectedResource.forEach((r) => {
      let key = r.fieldkey;
      let details = this.resourceDetails.details.find((el) => {
        return el.fieldkey == key;
      });
      if (details && details.attached_rsc && details.attached_rsc.length > 0) {
        let tagData = [];
        details.attached_rsc.forEach((element) => {
          let tagObj = {
            tagName: `Tag Name : ${element.tagname}`,
            actual_val: element.tagname,
            active: false,
            instances: [],
          };
          element.tagvalues.forEach((tv) => {
            if (tv.instances) {
              tv.instances.resourcetype = tv.resourcetype;
              tv.instances.resourceid = tv.instances.instanceid;
              tv.instances.resourcerefid = tv.resourcerefid;
              tv.instances.id = tv.instances.instanceid;
              tv.instances.refid = tv.resourcerefid;
              tv.instances.tagid = element.tagid;
              tv.instances.tagname = element.tagname;
              tv.instances.createddt = new Date();
              tv.instances.createdby = this.userstoragedata.fullname;
              tv.instances.status = AppConstant.STATUS.ACTIVE;
              tagObj.instances.push(tv.instances);
            }
          });
          tagData.push(tagObj);
        });
        this.attachedResources[key] = tagData;
      }
    });
  }
  viewAttachedTags(data) {
    this.selectedTagDetails = data;
    this.showAttachedTags = true;
  }
  onTagSelect(tag, idx) {
    let cndtn = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      tagid: tag.tagid,
    };
    let query = "?distinct=tagvalue";
    this.tagValueService.all(cndtn, query).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.tagValues = response.data;
      } else {
        this.tagValues = [];
      }
    });
  }
  getMappingList(crn) {
    this.assetsService
      .listAsset(
        {
          tenantid: this.userstoragedata.tenantid,
          crnresourceid: crn,
        },
        "?list=true"
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          _.map(response.data, (itm, idx) => {
            let obj = _.clone(itm);
            obj.asset = itm.cloudprovider + "-" + itm.resourcetype;
            obj.assetid = itm.resourcerefid;
            obj.attributeList = [];
            this.referringAssets.push(obj);
            this.getAssets(obj, idx);
            return itm;
          });
        } else {
          this.addRefAsset();
        }
      });
  }
  tabChanged(event) {
    this.stabIndex = event.index;
    if (event.index == 1) {
      this.getTagValues();
    }
  }
  parseInboundData() {
    if (this.inboundDetails) {
      const inboudRecords = groupBy(this.inboundDetails, "resourcetype");
      let inbounds = [];

      for (const key in inboudRecords) {
        if (Object.prototype.hasOwnProperty.call(inboudRecords, key)) {
          const element = inboudRecords[key];
          let values = element
            .filter((e) => e.identifier)
            .map((i) => {
              let autoGenData = _.find(element, {
                fieldtype: "AUTOGEN",
                resourceid: i.resourceid,
                fieldname: "Key",
              });
              return {
                name: i.fieldvalue + " (" + autoGenData.fieldvalue + ")",
                resourceid: i.resourceid,
              };
            });
          inbounds.push({
            key,
            values,
          });
        }
      }

      this.inboundReferences = inbounds;
    }
  }
  parseJSON(text: string) {
    try {
      let j = JSON.parse(text);
      return Object.keys(j).length > 0 ? j : null;
    } catch (error) {
      return null;
    }
  }
  viewKeyDetail(selectedData) {
    // call api to get the header and details of the assets
    this.blockUI = true;
    this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
        ],
        selectedData.crn
      )
      .subscribe(
        (d) => {
          let hdrresponse = JSON.parse(d._body);
          this.selectedResourceId =
            selectedData.crn + "/" + selectedData.resourceid;
          this.assetRecordService
            .getResourceValuesById(
              btoa(selectedData.crn + "/" + selectedData.resourceid)
            )
            .subscribe(
              (r) => {
                this.blockUI = false;

                let dtlresponse: {
                  data: Record<string, any>[];
                  inbound: Record<string, any>[];
                  documents: Record<string, any>[];
                } = JSON.parse(r._body);

                let data = {
                  details: [],
                } as any;
                dtlresponse.data.forEach((o) => {
                  data[o["fieldkey"]] = o["fieldvalue"];
                  data["details"].push(o);
                });
                this.selectedKeyValue = hdrresponse;
                this.selectedKeyData = data;
                // this.resourceDetails = data;
                this.showDetailedView = true;
                let identifiercrn: any = _.find(this.selectedKeyValue, { identifier: true });
                let identifier: any = _.find(data.details, { fieldkey: identifiercrn.fieldkey });
                this.title = identifiercrn["resourcetype"] + " > " + identifier.fieldvalue;
                this.inboundData = dtlresponse.inbound;
              },
              (err) => {
                this.blockUI = false;
              }
            );
        },
        (err) => {
          this.blockUI = false;
        }
      );
  }

  highlightSearch() {
    setTimeout(() => {
      if (this.highlight && this.highlight.length > 0) {
        var context = document.getElementById("assetdetail");
        if (context) {
          var instance = new MarkJs(context);
          instance.mark(this.highlight);
        }
      }
    }, 1500);
  }

  // Tags

  getTagValues() {
    try {
      if (this.resourceId) {
        this.tagValueService
          .all({
            resourcetype: "ASSET_RECORD",
            resourcerefid: this.resourceId,
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
                this.tagsList = this.tagService.prepareViewFormat(
                  response.data
                );
                this.tagActuls = response.data;
                this.tagsClone = response.data;
                _.map(this.tagparamList, (t) => {
                  let selectedValue: any = _.find(response.data, {
                    tagid: t.tagid,
                  });
                  t.tagvalue = selectedValue ? selectedValue.tagvalue : "";
                  t.tagvalueid = selectedValue
                    ? selectedValue.tagvalueid
                    : null;
                });
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
      }
    } catch (error) {
      this.tags = [];
      this.tagsList = [];
      this.tagsClone = [];
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
      this.tagsList = this.tagService.prepareViewFormat(e.data); // always return status Active
      this.updateTagVisible = false;
      this.tagsClone = [];
      _.map(e.data, (itm) => {
        if (!itm.ignore) {
          let exist = _.find(this.tagsList, { tagname: itm.tag.tagname });
          if (itm.status == AppConstant.STATUS.ACTIVE && exist != undefined) {
            this.tagsClone.push(itm);
          } else if (itm.status == "Inactive") {
            let tagexist = _.find(this.tagsClone, { tagid: itm.tag.tagid });
            if (tagexist == undefined && itm.tagvalueid != undefined) {
              this.tagsClone.push(itm);
            }
          }
        }
      });
      this.groupTagValues(e.data);
    }
  }
  updateTags() {
    let reqArr = [];
    this.tagsClone.map((o) => {
      o["resourcetype"] = "ASSET_RECORD";
      o["resourcerefid"] = this.resourceId;
      let exist = _.find(this.tagActuls, { tagid: o.tagid });
      if (o["tagvalue"] != (exist ? exist.tagvalue : "")) {
        reqArr.push(o);
      } else if ((exist ? exist.status : "") != o["status"]) {
        reqArr.push(o);
      }
      return o;
    });

    if (reqArr.length > 0) {
      this.updatingTags = true;
      this.tagValueService.bulkupdate(reqArr, `?isCMDB=${true}`).subscribe(
        (result) => {
          this.updatingTags = false;
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
            this.getTagValues();
          } else {
            this.message.error("Tag Update Failed");
          }
        },
        (err) => {
          this.message.error("Tag Update Failed");
          this.updatingTags = false;
        }
      );
    }
  }

  onSideBarTagClick(flag) {
    this.updateTagVisible = flag;
  }

  startTagEdit(field, event: MouseEvent): void {
    if (this.edit) {
      event.preventDefault();
      event.stopPropagation();
      this.editTagId = field.id;
      this.updateData = field.data;
      this.selectedField = field.selectedId;
      this.onTagSelect(field.selectedId, field.id);
    }
  }
  startEdit(field, event: MouseEvent): void {
    if (this.edit && field.selectedId.readonly != 1) {
      event.preventDefault();
      event.stopPropagation();
      this.editSelectId = null;
      this.editInputId = null;
      this.editTagId = null;
      this.updateData = field.data;
      this.selectedField = field.selectedId;
      if (field.selectedId.fieldtype == "Select") {
        this.editSelectId = field.id;
        this.updateData = field.data == undefined ? "Unknown" : field.data;
        this.defaultValues = field.selectedId.defaultval
          ? [...field.selectedId.defaultval.split(",")]
          : ["Unknown"];
      }
      if (field.selectedId.fieldtype == "STATUS") {
        this.editSelectId = field.id;
        this.defaultValues = field.selectedId.defaultval
          ? field.selectedId.defaultval.split(",")
          : ["Unknown", field.data];
      }
      if (field.selectedId.fieldtype == "REFERENCE") {
        this.editSelectId = field.id;
        if (field.data != null) {
          this.updateData = _.map(field.data, (item) => {
            return item.resourceid;
          });
        } else {
          this.updateData = null;
        }
        let crn =
          field.data != null ? field.data[0].crn : field.selectedId.relation;
        this.assetRecordService
          .getAllDetail({
            tenantid: field.selectedId.tenantid,
            status: "Active",
            crn: crn,
            fieldkey: crn + "/fk:name",
          })
          .subscribe((res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.crnList = _.map(response.data, (item) => {
                return {
                  resourceid: Number(item.resourceid.split("/")[1]),
                  name: item.fieldvalue,
                  crn: item.crn,
                };
              });
            } else {
              this.crnList = [
                {
                  resourceid: null,
                  name: "None",
                  crn: "None",
                },
              ];
            }
          });
      } else {
        this.editInputId = field.id;
      }
    }
  }

  getAssets(selectedData, idx?) {
    let asset = selectedData.resourcetype;
    let request = this.assetRecordService.getAssets(
      {
        asset: selectedData.resourcetype,
        provider: selectedData.cloudprovider,
        data: {
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
          cloudprovider: selectedData.cloudprovider,
        },
      },
      "?assetonly=true"
    );

    if (selectedData.resourcetype != "" && asset != null) {
      if (
        selectedData.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA ||
        selectedData.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX
      ) {
        if (asset != "VIRTUAL_MACHINES") {
          request = this.vmwareService.listByFilters({
            assettype: selectedData.resourcetype,
            filters: {
              tenantid: this.userstoragedata.tenantid,
              status: AppConstant.STATUS.ACTIVE,
            },
          });
        }
      }
      request.subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          _.each(response.data.assets, (item) => {
            let obj = {} as any;
            if (
              _.has(item, "instancerefid") &&
              asset == AppConstant.ASSETTYPES.AWS[0].value
            ) {
              obj = {
                assetid: item.instancerefid,
                assetname: item.instancename,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "awsvpcid") &&
              asset == AppConstant.ASSETTYPES.AWS[1].value
            ) {
              obj = {
                assetid: item.awsvpcid,
                assetname: item.vpcname,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "awssubnetd") &&
              asset == AppConstant.ASSETTYPES.AWS[2].value
            ) {
              obj = {
                assetid: item.awssubnetd,
                assetname: item.subnetname,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "awssecuritygroupid") &&
              asset == AppConstant.ASSETTYPES.AWS[3].value
            ) {
              obj = {
                assetid: item.awssecuritygroupid,
                assetname: item.securitygroupname,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "lbid") &&
              asset == AppConstant.ASSETTYPES.AWS[4].value
            ) {
              obj = {
                assetid: item.lbid.toString(),
                assetname: item.lbname,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "awsinternetgatewayid") &&
              asset == AppConstant.ASSETTYPES.AWS[5].value
            ) {
              obj = {
                assetid: item.awsinternetgatewayid,
                assetname: item.gatewayname,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "awsvolumeid") &&
              asset == AppConstant.ASSETTYPES.AWS[6].value
            ) {
              obj = {
                assetid: item.awsvolumeid,
                assetname: item.awsvolumeid,
                provider: selectedData.cloudprovider,
              };
            }
            if (_.has(item, "assetname")) {
              obj = {
                assetid: item.assetid.toString(),
                assetname: item.assetname,
                provider: selectedData.cloudprovider,
              };
            }
            if (_.has(item, "clustername")) {
              obj = {
                assetid: item.clusterrefid,
                assetname: item.clustername,
                provider: selectedData.cloudprovider,
              };
            }
            if (_.has(item, "dcname")) {
              obj = {
                assetid: item.dcrefid,
                assetname: item.dcname,
                provider: selectedData.cloudprovider,
              };
            }
            if (_.has(item, "hostname")) {
              obj = {
                assetid: item.hostrefid,
                assetname: item.hostname,
                provider: selectedData.cloudprovider,
              };
            }
            if (
              _.has(item, "instancename") &&
              asset != AppConstant.ASSETTYPES.AWS[0].value
            ) {
              obj = {
                assetid: item.instancerefid,
                assetname: item.instancename,
                provider: selectedData.cloudprovider,
              };
            }
            this.referringAssets[idx].attributeList.push(obj);
          });
        } else {
          this.assetList = [
            {
              assetid: 0,
              assetname: "No Assets",
              provider: "No Assets",
            },
          ];
        }
      });
    }
  }
  cancelEdit(): void {
    this.editInputId = null;
    this.editSelectId = null;
    this.editTagId = null;
    this.editrSelectId = null;
    this.rupdateData = "";
    this.updateData = "";
  }
  updateTagRecord(tidx, updatedData) {
    let reqObj = this.tagparamList[tidx];
    reqObj.tagvalue = updatedData;
    if (reqObj.tagvalueid != undefined && reqObj.tagvalueid != null) {
      reqObj.lastupdatedby = this.userstoragedata.fullname;
      reqObj.lastupdateddt = new Date();
      this.tagValueService.update(reqObj).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
            this.tagparamList[tidx].tagvalueid = response.data.tagvalueid;
            this.tagparamList[tidx].tagvalue = response.data.tagvalue;
            this.cancelEdit();
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error(err);
        }
      );
    } else {
      reqObj.createdby = this.userstoragedata.fullname;
      reqObj.createddt = new Date();
      reqObj.lastupdatedby = this.userstoragedata.fullname;
      reqObj.lastupdateddt = new Date();
      this.tagValueService.create(reqObj).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
            this.tagparamList[tidx].tagvalueid = response.data.tagvalueid;
            this.tagparamList[tidx].tagvalue = response.data.tagvalue;
            this.cancelEdit();
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error(err);
        }
      );
    }
  }
  confirmUpdate(fieldkey, updatedData) {
    let detailObj: any = _.find(this.resourceDetails.details, {
      fieldkey: fieldkey,
    });
    if (detailObj != undefined && detailObj.id) {
      if (this.attachedResources[fieldkey]) {
        this.updateDetails.fieldkey = fieldkey;
        this.updateDetails.updatedData = updatedData;
        this.attachedResources[fieldkey].forEach((element) => {
          this.updateInstances = [
            ...this.updateInstances,
            ...element.instances,
          ];
        });
        this.showConfirmation = true;
      } else {
        this.updateRecord(fieldkey, updatedData);
      }
    } else {
      this.updateRecord(fieldkey, updatedData);
    }
  }
  updateRecord(fieldkey, updatedData) {
    let detailObj: any = _.find(this.resourceDetails.details, {
      fieldkey: fieldkey,
    });
    let tagValues = "";
    if (detailObj != undefined && detailObj.id) {
      let reqObj = {
        fieldvalue: _.isArray(updatedData)
          ? JSON.stringify(updatedData)
          : updatedData,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        crn: detailObj.crn,
        fieldkey: detailObj.fieldkey,
        id: detailObj.id,
      } as any;
      if (this.selectedField.fieldtype == "REFERENCE") {
        let fieldValues = [];
        _.map(updatedData, (item) => {
          let obj = {} as any;
          if (item != null) {
            obj =
              this.selectedField.fieldtype == "REFERENCE"
                ? _.find(this.crnList, { resourceid: item })
                : _.find(this.assetList, { assetid: item });
            if (obj) tagValues += tagValues ? `, ${obj.name}` : obj.name;
            fieldValues.push(obj);
          }
          return item;
        });
        reqObj.fieldvalue =
          fieldValues.length > 0 ? JSON.stringify(fieldValues) : "";
      }
      if (this.selectedField.fieldtype == "Date") {
        reqObj.fieldvalue = moment(reqObj.fieldvalue).format("DD/MMM/YY");
      }
      if (this.selectedField.fieldtype == "DateTime") {
        reqObj.fieldvalue = moment(reqObj.fieldvalue).format(
          "DD/MMM/YY h:mm A"
        );
      }
      this.assetRecordService.updateDetail(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.resourceDetails[fieldkey] = reqObj.fieldvalue;
          this.showConfirmation = false;
          this.cancelEdit();
          this.updateAttachedRsc(
            this.updateInstances,
            tagValues ? tagValues : reqObj.fieldvalue,
            detailObj.resourceid
          );
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      let reqObj = {
        tenantid: this.resourceDetails.details[0].tenantid,
        fieldvalue: updatedData,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        crn: this.resourceDetails.details[0].crn,
        fieldkey: fieldkey,
        resourceid: this.resourceDetails.details[0].resourceid,
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        status: "Active",
      };
      if (this.selectedField.fieldtype == "REFERENCE") {
        let fieldValues = [];
        _.map(updatedData, (item) => {
          let obj = {} as any;
          if (item != null) {
            obj =
              this.selectedField.fieldtype == "REFERENCE"
                ? _.find(this.crnList, { resourceid: item })
                : _.find(this.assetList, { assetid: item });
            fieldValues.push(obj);
          }
          return item;
        });
        reqObj.fieldvalue =
          fieldValues.length > 0 ? JSON.stringify(fieldValues) : "";
      }
      this.assetRecordService.createDetail(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.resourceDetails[fieldkey] = reqObj.fieldvalue;
          this.resourceDetails.details.push(response.data);
          this.cancelEdit();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
  updateAttachedRsc(data, value, id) {
    data.forEach((element) => {
      element.tagvalue = value;
    });
    let awsResource = data.filter((el) => {
      return el.cloudprovider == AppConstant.CLOUDPROVIDER.AWS;
    });
    let vmWareResource = data.filter((el) => {
      return (
        el.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX ||
        el.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA
      );
    });
    if (vmWareResource.length > 0) {
      vmWareResource.forEach((element) => {
        element.attributerefid = id;
        delete element.refid;
      });
      this.tagValueService
        .bulkupdate(vmWareResource, `?vmware=${true}`)
        .subscribe((result) => {
          let response = JSON.parse(result._body);
        });
    }
    if (awsResource.length > 0) {
      let reqObj = {
        tenantid: this.userstoragedata.tenantid,
        cloudprovider: AppConstant.CLOUDPROVIDER.AWS,
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[8],
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        tagvalues: [
          {
            tagid: awsResource[0].tagid,
            tagname: awsResource[0].tagname,
            tagvalue: value,
            attributerefid: id,
          },
        ],
        assets: awsResource,
      };
      this.httpHandler
        .POST(
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.AWSASSETMETAUPDATE,
          reqObj
        )
        .subscribe((result) => {
          let response = JSON.parse(result._body);
        });
    }
    this.updateInstances = [];
  }
  addRecordDetail() {
    let assetdetails = [];
    this.blockUI = true;
    const resourceTimeStamp = Date.now().toString();
    this.resourceData = _.filter(this.resourceData, (itm) => {
      if (
        itm.fieldtype != "Reference Asset" &&
        itm.fieldtype != "Reference Tag"
      ) {
        return itm;
      }
    });
    if (
      !this.resourceData[0].fieldvalue &&
      this.resourceData[0].fieldtype != "AUTOGEN"
    ) {
      this.message.error(
        "Please enter " + this.resourceData[0].fieldname + " value"
      );
      this.blockUI = false;
      return false;
    }
    if (
      this.resourceData.length > 1 &&
      !this.resourceData[1].fieldvalue &&
      this.resourceData[0].fieldtype != "AUTOGEN"
    ) {
      this.message.error(
        "Please enter " + this.resourceData[1].fieldname + " value"
      );
      this.blockUI = false;
      return false;
    }
    _.map(this.resourceData, (item) => {
      if (item.fieldvalue != undefined) {
        let obj: any = {
          crn: item.crn,
          fieldkey: item.fieldkey,
          fieldtype: item.fieldtype,
          hdrid: item.id,
          fieldvalue: item.fieldvalue,
          resourceid: (item.crn + "/" + resourceTimeStamp).toString(),
          status: "Active",
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
          tenantid: this.userstoragedata.tenantid,
        };
        if (item.fieldtype == "REFERENCE") {
          obj.fieldvalue = _.isArray(obj.fieldvalue)
            ? JSON.stringify(obj.fieldvalue)
            : "";
        }
        if (item.fieldtype == "Date") {
          obj.fieldvalue = moment(obj.fieldvalue).format("DD/MMM/YY");
        }
        if (item.fieldtype == "DateTime") {
          obj.fieldvalue = moment(obj.fieldvalue).format("DD/MMM/YY h:mm A");
        }
        assetdetails.push(obj);
      }
      return item;
    });
    let reqObj = {
      assetdetails: assetdetails,
    };
    this.assetRecordService.bulkcreateDetail(reqObj).subscribe(
      (res) => {
        this.blockUI = false;

        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.isAddForm = false;
          this.assetMapping({ resourceid: assetdetails[0].resourceid });
          this.notifyNewEntry.next(response.data);
        } else {
          this.message.error(response.message);
        }
      },
      (err) => {
        this.blockUI = false;
        this.message.success("Unable to add recrod.");
      }
    );
  }
  getAllCRNs(crns) {
    let reqObj = {
      crns: crns,
      tenantid: this.userstoragedata.tenantid,
      status: "Active",
    };
    this.assetRecordService.getAllDetail(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.crnData = response.data;
        this.formatData();
      } else {
        this.formatData();
      }
    });
  }
  formatData() {
    this.recordData.forEach((o, idx) => {
      let obj: any = _.clone(o);
      if (obj.fieldtype == "Text") {
        obj["fieldvalue"] = "";
      }
      if (obj.fieldtype == "Select" || obj.fieldtype == "STATUS") {
        obj["fieldvalue"] = null;
        obj["defaultValues"] =
          obj["defaultval"] != null && obj["defaultval"] != ""
            ? obj["defaultval"].split(",")
            : ["Unknown"];
      } else if (obj.fieldtype == "REFERENCE") {
        obj["defaultValues"] = [];
        obj["fieldvalue"] = null;
        _.map(this.crnData, (item) => {
          if (item.crn == obj.relation) {
            obj["defaultValues"].push({
              name: item.fieldvalue,
              crn: item.crn,
              resourceid: Number(item.resourceid.split("/")[1]),
            });
          }
          return item;
        });
      } else {
        obj["fieldvalue"] = "";
      }
      this.addformloading = false;
      this.resourceData[idx] = obj;
      return obj;
    });
  }
  getAllAssets() {
    this.assetGrps = [];
    _.each(this.recordData, (element) => {
      if (element.referenceasset != null) {
        let referenceasset: any = JSON.parse(element.referenceasset);
        let exist = _.findIndex(this.assetGrps, {
          provider: referenceasset.provider,
        });
        if (exist == -1 && this.assetGrps.length == 0) {
          this.assetGrps[0] = {
            provider: referenceasset.provider,
            value: [],
          };
          this.assetGrps[0].value.push({
            title: referenceasset.assetname,
            value: referenceasset.asset,
          });
        } else if (exist == -1 && this.assetGrps.length > 0) {
          this.assetGrps.push({
            provider: referenceasset.provider,
            value: [],
          });
          this.assetGrps[this.assetGrps.length - 1].value.push({
            title: referenceasset.assetname,
            value: referenceasset.asset,
          });
        } else {
          let valueExist = _.findIndex(this.assetGrps[exist].value, {
            value: referenceasset.asset,
          });
          if (valueExist == -1) {
            this.assetGrps[exist].value.push({
              title: referenceasset.assetname,
              value: referenceasset.asset,
            });
          }
        }
      }
    });
  }
  onResourceSelect(event, r, i) {
    try {
      let exist = _.find(this.referringAssets, (itm, idx) => {
        if (itm.asset == event && i != idx) {
          return itm;
        }
      });
      if (exist == undefined) {
        this.referringAssets[i].cloudprovider = event.split("-")[0];
        this.referringAssets[i].resourcetype = event.split("-")[1];
        this.referringAssets[i].attributeList = [];
        this.getAssets(r, i);
      } else {
        this.referringAssets[i].asset = "";
        this.message.error("Asset Already Mapped, Please select other");
      }
    } catch (e) { }
  }
  addRefAsset() {
    let obj = {
      tenantid: this.userstoragedata.tenantid,
      cloudprovider: "",
      resourcetype: "",
      resourceid: "",
      resourcerefid: "",
      asset: null,
      assetid: null,
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      status: "Active",
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      attributeList: [],
    };
    this.referringAssets.push(obj);
  }
  deleteAssetMapping(index) {
    let selectedObj = this.referringAssets[index];
    if (
      selectedObj.assetmappingid != null &&
      selectedObj.assetmappingid != undefined
    ) {
      let reqObj = {
        assetmappingid: selectedObj.assetmappingid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        status: "Deleted",
      } as any;
      this.assetsService.updateAssetMapping(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          _.remove(this.referringAssets, function (item, idx) {
            return index == idx;
          });
          if (this.referringAssets.length == 0) {
            this.addRefAsset();
          }
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      _.remove(this.referringAssets, function (item, idx) {
        return index == idx;
      });
      if (this.referringAssets.length == 0) {
        this.addRefAsset();
      }
    }
  }
  updateAssetMapping(event, idx) {
    if (!this.isAddForm) {
      let selectedObj = this.referringAssets[idx];
      console.log(selectedObj);
      let reqObj = {
        tenantid: this.userstoragedata.tenantid,
        resourcerefid: event,
        crnresourceid: this.resourceDetails.details[0].resourceid,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
        isRecord: true,
      } as any;
      if (
        selectedObj.assetmappingid != null &&
        selectedObj.assetmappingid != undefined
      ) {
        reqObj.assetmappingid = selectedObj.assetmappingid;
        this.assetsService.updateAssetMapping(reqObj).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.referringAssets[idx].crnresourceid =
              response.data.crnresourceid;
            this.referringAssets[idx].resourcerefid =
              response.data.resourcerefid;
            this.referringAssets[idx].assetmappingid =
              response.data.assetmappingid;
            this.getAssetDetail(this.referringAssets);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        reqObj.createddt = new Date();
        reqObj.createdby = this.userstoragedata.fullname;
        reqObj.status = "Active";
        reqObj.cloudprovider = selectedObj.asset.split("-")[0];
        reqObj.resourcetype = selectedObj.asset.split("-")[1];

        this.assetsService.createAssetMapping(reqObj).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.message.success(response.message);
            this.referringAssets[idx].crnresourceid =
              response.data.crnresourceid;
            this.referringAssets[idx].resourcerefid =
              response.data.resourcerefid;
            this.referringAssets[idx].assetmappingid =
              response.data.assetmappingid;
            this.getAssetDetail(this.referringAssets);
          } else {
            this.message.error(response.message);
          }
        });
      }
    }
  }
  assetMapping(data) {
    _.map(this.referringAssets, (itm) => {
      itm.resourcerefid = itm.assetid;
      itm.crnresourceid = data.resourceid;
      return _.omit(itm, ["attributeList"]);
    });
    this.assetsService
      .bulkCreate({ mappinglist: this.referringAssets })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
        } else {
        }
      });
  }
  async getAssetDetail(assetMapping) {
    let include = [];
    if (assetMapping.length > 0) {
      _.map(assetMapping, async (itm, idx) => {
        if (itm.resourcetype != "") {
          let linkid = "";
          let reqObj = {
            asset: itm.resourcetype,
            provider: itm.cloudprovider,
            query: {},
            include: include,
            data: {
              tenantid: this.userstoragedata.tenantid,
              status: AppConstant.STATUS.ACTIVE,
            },
          };
          linkid = AssetAttributesConstant.COLUMNS[itm.resourcetype][0].linkid;
          reqObj.query[linkid] = { $in: [itm.resourcerefid] };
          let request = this.assetRecordService.getAssets(
            reqObj,
            "?assetonly=true&instancedata=true"
          );
          if (
            itm.cloudprovider == "AWS" &&
            itm.resourcetype == "ASSET_INSTANCE"
          ) {
            request = this.commonService.getInstance(
              itm.resourcerefid,
              `?asstdtls=${true}&cloudprovider=${itm.cloudprovider
              }&costyn=${true}&getbycolumn=${linkid}&tenantid=${this.userstoragedata.tenantid
              }`
            );
          } else if (
            itm.cloudprovider == AppConstant.CLOUDPROVIDER.SENTIA ||
            itm.cloudprovider == AppConstant.CLOUDPROVIDER.EQUINIX
          ) {
            if (itm.resourcetype != "VIRTUAL_MACHINES") {
              request = this.vmwareService.listByFilters({
                assettype: itm.resourcetype,
                filters: {
                  tenantid: this.userstoragedata.tenantid,
                  status: AppConstant.STATUS.ACTIVE,
                },
              });
            } else {
              request = this.commonService.getInstance(
                itm.resourcerefid,
                `?asstdtls=${true}&cloudprovider=${itm.cloudprovider
                }&costyn=${true}&getbycolumn=${linkid}&tenantid=${this.userstoragedata.tenantid
                }`
              );
            }
          }
          if (itm.resourcerefid) {
            await request.subscribe((res) => {
              const response = JSON.parse(res._body);
              console.log(response.data);
              if (response.status && _.has(response.data, "assets")) {
                this.assetMappingList[idx] = {
                  ...this.assetMappingList[idx],
                  ...response.data.assets[0],
                };
                this.assetMappingList[idx][linkid] =
                  response.data.assets[0][linkid];
                this.assetMappingList[idx].resourcetype = itm.resourcetype;
                this.assetMappingList[idx].cloudprovider = itm.cloudprovider;
                if (_.has(response.data.assets[0], "instancename")) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].instancename;
                }
                if (
                  _.has(response.data.assets[0], "vpcname") &&
                  itm.resourcetype == AppConstant.ASSETTYPES.AWS[1].value
                ) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].vpcname;
                }
                if (
                  _.has(response.data.assets[0], "subnetname") &&
                  itm.resourcetype == AppConstant.ASSETTYPES.AWS[2].value
                ) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].subnetname;
                }
                if (
                  _.has(response.data.assets[0], "securitygroupname") &&
                  itm.resourcetype == AppConstant.ASSETTYPES.AWS[3].value
                ) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].securitygroupname;
                }
                if (
                  _.has(response.data.assets[0], "lbname") &&
                  itm.resourcetype == AppConstant.ASSETTYPES.AWS[4].value
                ) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].lbname;
                }
                if (
                  _.has(response.data.assets[0], "awsinternetgatewayid") &&
                  itm.resourcetype == AppConstant.ASSETTYPES.AWS[5].value
                ) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].gatewayname;
                }
                if (
                  _.has(response.data.assets[0], "awsvolumeid") &&
                  itm.resourcetype == AppConstant.ASSETTYPES.AWS[6].value
                ) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].awsvolumeid;
                }

                if (_.has(response.data.assets[0], "assetid")) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].assetname;
                }
                if (_.has(response.data.assets[0], "clustername")) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].clustername;
                }
                if (_.has(response.data.assets[0], "dcname")) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].dcname;
                }
                if (_.has(response.data.assets[0], "hostname")) {
                  this.assetMappingList[idx].assetname =
                    response.data.assets[0].hostname;
                }
              }
              if (response.status && !_.has(response.data, "assets")) {
                this.assetMappingList[idx] = {
                  ...this.assetMappingList[idx],
                  ...response.data,
                };
                this.assetMappingList[idx][linkid] = response.data[linkid];
                this.assetMappingList[idx].resourcetype = itm.resourcetype;
                this.assetMappingList[idx].cloudprovider = itm.cloudprovider;
                this.assetMappingList[idx].assetname =
                  response.data.instancename;
              }
            });
          }
        }
        return itm;
        // }
      });
    }
  }

  getInstanceObj(r, ridx, idx, data) {
    let selectedData = data;
    let asset: string = selectedData.asset.split("-")[1];
    let provider: string = selectedData.asset.split("-")[0];
    let i: any = _.find(this.assetMappingList, (itm: any) => {
      if (itm && itm.resourcetype == asset && itm.cloudprovider == provider) {
        return itm;
      }
    });
    if (i != undefined) {
      i.costs = 0;
      if (
        i.instance &&
        i.instance.costvisual &&
        i.instance.costvisual.length > 0
      ) {
        i.costs = this.commonService.getMonthlyPrice(
          this.pricings,
          i.instance.costvisual[0].pricingmodel,
          i.instance.costvisual[0].priceperunit,
          i.instance.costvisual[0].currency
        );
      }
      if (
        i.awsinstance &&
        i.awsinstance.costvisual &&
        i.awsinstance.costvisual.length > 0
      ) {
        i.costs = this.commonService.getMonthlyPrice(
          this.pricings,
          i.awsinstance.costvisual[0].pricingmodel,
          i.awsinstance.costvisual[0].priceperunit,
          i.awsinstance.costvisual[0].currency
        );
      }
      if (i.costvisual && i.costvisual.length > 0) {
        i.costs = this.commonService.getMonthlyPrice(
          this.pricings,
          i.costvisual[0].pricingmodel,
          i.costvisual[0].priceperunit,
          i.costvisual[0].currency
        );
      }
      this.resourceList[ridx].details[idx].assetname =
        i != undefined ? i.assetname : "-";
      this.resourceList[ridx].details[idx].assetid =
        i != undefined ? i[r.linkid] : "-";
      let attribute = _.includes(r.field, "[")
        ? JSON.parse(r.field.replace(/'/g, '"'))
        : r.field;
      this.resourceList[ridx].details[idx].linkvalue =
        i != undefined ? _.get(i, attribute) : "-";
      if (r.datatype == "array") {
        let formattedData = "";
        _.map(i[r.arrayname], (itm, index: number) => {
          if (index == 0) {
            formattedData =
              _.get(itm, JSON.parse(r.fkid.replace(/'/g, '"'))) +
              " : " +
              _.get(itm, attribute);
          } else {
            formattedData =
              formattedData +
              "<br/>" +
              _.get(itm, JSON.parse(r.fkid.replace(/'/g, '"'))) +
              " : " +
              _.get(itm, attribute);
          }
          this.resourceList[ridx].details[idx].linkvalue =
            i != undefined ? formattedData : "-";
        });
      }
      return this.resourceList[ridx].details[idx].linkvalue;
    } else {
      return "-";
    }
  }
  getLookup() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.pricings = response.data;
        } else {
          this.pricings = [];
        }
      });
  }
}
