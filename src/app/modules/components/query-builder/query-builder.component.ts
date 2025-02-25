import { Component, OnInit } from "@angular/core";
import { AssetRecordService } from "../../../business/base/assetrecords/assetrecords.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";
import downloadService from "../../services/shared/download.service";
import * as moment from "moment";
import { Buffer } from "buffer";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-query-builder",
  templateUrl: "./query-builder.component.html",
  // styleUrls: ["./query-builder.component.css"],
  styles: [
    `
    #grouptable th {
      // border: 1px solid #dddddd30;
      padding: 8px;
      border-style: none;
    }
    #grouptable td {
      border: 1px solid #dddddd30;
      padding: 6px;
      border-style: none;
    }

    #grouptable th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      
      color: white;
    }
    nz-select {
      width: 90%;
    }
  `,
  ]
})
export class QueryBuilderComponent implements OnInit {
  selectedresourcetype = { resourcetype: '', attributes: [], filters: [], attributesList: [] };
  mappedresources = [];
  mainresourcetype = [{ resourcetype: "", attribute: "" }];
  userstoragedata = {};
  resourcetypelist = [];
  associatedresources = [];
  assets = [];
  assetsCount = 0;
  gettingAssets = false;
  pageIndex = 1;
  pageSize = 10;
  headers = [];
  attributes = [];
  tableHeader = [];
  limit = 10;
  offset = 0;
  isdownload: boolean;
  selectattributes = false;
  filterSearchModel = '';
  resourcetype;
  filterableValues = [];
  openadvfilter = false;
  advFilterObj = {};
  filterIdx;
  mainfilterIdx;
  selectedcrn;
  selectedquery;
  savedqueries = [];
  queryname = '';
  show = false;
  formdata = {};
  selectedsavedq: any = {};
  indicatorTemplate = false;
  searchText = '';
  totalCount;
  pageCount = AppConstant.pageCount;
  constructor(
    private assetRecordService: AssetRecordService,
    private localStorageService: LocalStorageService,
    private messageService: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getSavedQueries();
    this.getResourceType();
  }
  onchangeQuery(e) {
    this.selectedsavedq = JSON.parse(this.selectedquery.meta);
    this.selectedsavedq.primaryresource.resourcetype = _.find(this.resourcetypelist, { resource: this.selectedsavedq.primaryresource.resourcetype.resource })
    this.selectedresourcetype = { ...this.selectedsavedq.primaryresource };
    this.onchangResource(this.selectedsavedq.primaryresource.resourcetype, 0);
  }
  onchangResource(e, i) {
    this.mappedresources = [];
    this.assets = [];
    this.assetsCount = 0;
    this.tableHeader = [];
    this.getAttributes(e, i, true);
    this.getResourceType(true, i)
  }
  
  onPageSizeChange(size:number){
    this.pageSize = size;
    this.getAssets()
  }

  getSavedQueries() {
    this.gettingAssets = true;
    this.assetRecordService.allqueries({
      tenantid: this.userstoragedata['tenantid'],
      status: AppConstant.STATUS.ACTIVE
    }).subscribe((d) => {
      let response = JSON.parse(d._body);
      if (response.status) {
        this.savedqueries = response.data;
        this.gettingAssets = false;
      } else {
        this.savedqueries = [];
        this.gettingAssets = false;
      }
    });
  }

  saveQuery(update?) {
    let d = {
      tenantid: this.userstoragedata['tenantid'],
      status: AppConstant.STATUS.ACTIVE,
      title: this.queryname,
      createdby: this.userstoragedata['fullname'],
      createddt: new Date(),
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata['fullname'],
    }
    console.log(this.selectedresourcetype);
    console.log(this.mappedresources);
    console.log(this.selectedquery);
    d['meta'] = JSON.stringify({ primaryresource: this.selectedresourcetype, reference: this.mappedresources });
    this.show = false;
    if (update) {
      d['id'] = this.selectedquery.id;
      d['title'] = this.selectedquery.title;
      this.assetRecordService.updatequery(d).subscribe((d) => {
        let response = JSON.parse(d._body);
        if (response.status) {
          this.getSavedQueries();
          this.formFilters(10, 0);
        } else {
          this.messageService.error('Error on save query')
        }
      });
    } else {
      this.assetRecordService.createquery(d).subscribe((d) => {
        let response = JSON.parse(d._body);
        if (response.status) {
          this.getSavedQueries();
          this.formFilters(10, 0);
        } else {
          this.messageService.error('Error on save query')
        }
      });
    }

  }
  getResourceType(relation?, i?) {
    let arg = {
      tenantid: this.userstoragedata["tenantid"],
      status: AppConstant.STATUS.ACTIVE,
      module: 'cmdb',
      operationtype: 'cmdb'
    };
    if (relation) {
      arg["crn"] = this.selectedresourcetype['resourcetype']["crn"];
    }
    this.assetRecordService
      .getResourceTypes(
        arg,
        relation ? `relation=${true}` : `relation=${false}`
      )
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        if (relation) {
          this.associatedresources = _.orderBy(response, ["resourcetype"], ["asc"]);
          if (!_.isEmpty(this.selectedsavedq)) {
            let self = this;
            _.map(this.selectedsavedq.reference, function (f) {
              f.resourcetype = _.find(self.associatedresources, { resourcetype: f.resourcetype.resourcetype });
            });
            this.mappedresources = [...this.selectedsavedq.reference];
            this.formFilters(this.pageSize, this.offset);
          }

        } else {
          this.resourcetypelist = _.orderBy(response, ["resource"], ["asc"]);
        }
      });
  }


  addRow() {
    this.mappedresources.push({
      resourcetype: '', attributes: [], filters: [], attributesList: [],
    });
  }
  deleteRow(i) {
    this.mappedresources.splice(i, 1);
    this.mappedresources = [...this.mappedresources];
  }
  onPageChange(event) {
    this.pageIndex = event;
    this.formFilters(this.pageSize, (event - 1) * this.pageSize);
  }
  log(e) {

  }
  advFilter(i, type?) {
    this.openadvfilter = true;
    if (type) {
      this.mainfilterIdx = true;
      this.selectedcrn = this.selectedresourcetype.resourcetype['crn'];
      if (this.selectedresourcetype['attrFilters']) {
        this.advFilterObj = this.selectedresourcetype['attrFilters'];
      } else {
        this.advFilterObj = {
          crn: this.selectedresourcetype.resourcetype['crn'],
          resourcetype: this.selectedresourcetype.resourcetype['resourcetype']
        }
      }

    } else {
      this.filterIdx = i;
      this.mainfilterIdx = false;
      this.selectedcrn = this.mappedresources[i].resourcetype['crn'];
      if (this.mappedresources[i]['attrFilters']) {
        this.advFilterObj = this.mappedresources[i]['attrFilters'];
      } else {
        this.advFilterObj = {
          crn: this.mappedresources[i].resourcetype['crn'],
          resourcetype: this.mappedresources[i].resourcetype['resourcetype'],
          querybuilder: true
        };
      }
    }

  }
  applyAttrFilter(e) {
    if (this.mainfilterIdx == false) {
      this.mappedresources[this.filterIdx]['selectedFilters'] = [];
      if (e[0].attributeList && e[0].attributeList.length > 0) {
        e[0].attributeList.map((e) => {
          this.mappedresources[this.filterIdx]['selectedFilters'].push({
            fieldkey: e.type.fieldkey,
            fieldname: e.type.fieldname,
            fieldtype: e.type.fieldtype,
            crn: e.type.crn,
            fieldvalue: e.value,
            formula: e.formula
          })
        });
      }
      this.mappedresources[this.filterIdx]['attrFilters'] = e;
    } else {
      this.selectedresourcetype['selectedFilters'] = [];
      if (e[0].attributeList && e[0].attributeList.length > 0) {
        e[0].attributeList.map((e) => {
          this.selectedresourcetype['selectedFilters'].push({
            fieldkey: e.type.fieldkey,
            fieldname: e.type.fieldname,
            fieldtype: e.type.fieldtype,
            crn: e.type.crn,
            fieldvalue: e.value,
            formula: e.formula
          })
        });
        this.selectedresourcetype['attrFilters'] = e;
      }
    }
    this.openadvfilter = false;
  }
  getAttributes(e, i, flag) {
    console.log(this.mappedresources)

    let condition = {
      tenantid: this.userstoragedata["tenantid"],
      crn: e["crn"],
    };
    this.assetRecordService.all(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response) {
        this.attributes = [];
        response.data.map((el) => {
          if (el.fieldtype != 'REFERENCE') {
            let obj = {
              fieldname: el.fieldname,
              fieldkey: el.fieldkey,
              fieldtype: el.fieldtype,
              crn: el.crn,
              selected: false,
              identifier: el.identifier
            };
            this.attributes.push(obj);
          }
        });
        if (flag) {
          // this.mappedresources = [];
          this.assets = [];
          // this.tableHeader = [];
          if (this.selectedquery == null) {
            this.selectedresourcetype['attributes'] = [];
            this.selectedresourcetype['selectedFilters'] = [];
            this.selectedresourcetype['attrFilters'] = [];
            this.selectedresourcetype.attributesList = this.attributes;
            this.selectedresourcetype['attributes'] = _.filter(this.attributes, function (e) { return e.identifier });
          }
        } else {
          this.mappedresources[i]['attributes'] = [];
          this.mappedresources[i]['selectedFilters'] = [];
          this.mappedresources[i]['attrFilters'] = [];
          this.mappedresources[i].attributesList = this.attributes;
          this.mappedresources[i]['attributes'] = _.filter(this.attributes, function (e) { return e.identifier == true });
        }
      } else {
        this.attributes = [];
        this.selectedresourcetype['attributes'] = [];
        this.selectedresourcetype['selectedFilters'] = [];
        this.selectedresourcetype['attrFilters'] = [];
        this.mappedresources[i]['attributes'] = [];
        this.mappedresources[i]['selectedFilters'] = [];
        this.mappedresources[i]['attrFilters'] = [];
      }
    });
  }

  onSelectMappedResource(e, i) {
    let isExist = _.map(this.mappedresources, function (e) { return e.resourcetype });
    if ((_.uniq(isExist)).length != isExist.length) {
      this.messageService.error('Please remove duplicate resource type');
      return false;
    } else {
      this.getAttributes(e, i, false)
    }

  }

  applyFilter() {
    if (this.selectedresourcetype.resourcetype != '' && this.selectedresourcetype.attributes.length > 0) {
      this.formFilters(this.pageSize, this.offset);
    } else {
      this.messageService.error("Please select resource type");
    }
  }

  formFilters(limit?, offset?) {
    let selectedFields = [];
    this.tableHeader = [];
    let condition = {
      tenantid: this.userstoragedata["tenantid"],
      type: this.selectedresourcetype.resourcetype["resource"],
      resourcetype: [this.selectedresourcetype.resourcetype["resource"]],
      fields: [],
    }
    let self = this;
    _.map(this.selectedresourcetype.attributes, function (e) {
      let f = _.find(self.selectedresourcetype['selectedFilters'], function (i) { return i.fieldkey == e.fieldkey });

      if (e != "") {
        selectedFields.push({
          fieldname: e["fieldname"],
          fieldkey: e["fieldkey"],
          fieldtype: e['fieldtype'],
          crn: e['crn'],
          header: condition['type'] + '_' + e["fieldname"],
          filters: f && !_.isEmpty(f.fieldvalue) ? { operation: f.formula, value: f.fieldvalue } : [],
          resourcetype: condition['type']
        });
      }
    });
    if (this.mappedresources.length > 0) {
      this.mappedresources.map((e) => {
        condition.resourcetype.push(e.resourcetype['resourcetype']);
        if (e.attributes.length > 0) {
          e.attributes.map((a) => {
            let f = _.find(e.selectedFilters, function (i) { return i.fieldkey == a.fieldkey });
            selectedFields.push({
              fieldname: a["fieldname"],
              fieldkey: a["fieldkey"],
              fieldtype: a['fieldtype'],
              crn: a['crn'],
              header: e.resourcetype['resourcetype'] == this.selectedresourcetype.resourcetype["resource"] ? this.selectedresourcetype.resourcetype["resource"] + '_' + e.resourcetype['resourcetype'] + '_' + a["fieldname"] : e.resourcetype['resourcetype'] + '_' + a["fieldname"],
              filters: f && !_.isEmpty(f.fieldvalue) ? { operation: f.formula, value: f.fieldvalue } : [],
              resourcetype: e.resourcetype['resourcetype']
            });
          })
        }
      })
    }
    if (this.isdownload) {
      condition['headers'] = selectedFields.map((e) => {
        return {
          field: e.header,
          header: e.header,
          datatype: e.fieldtype,
          fieldkey: e["fieldkey"]
        }
      });
    }
    condition['fields'] = selectedFields;
    if (this.searchText != null && this.searchText != '') condition['searchText'] = this.searchText;
    this.tableHeader = selectedFields;
    this.gettingAssets = true;
    this.formdata = condition;
    this.getAssets(limit, offset)
  }

  getAssets(limit?, offset?) {
    this.gettingAssets = true;
    let q = `limit=${limit ? limit : this.pageSize}&offset=${offset ? offset : this.offset}`;
    if (this.isdownload) q = q + `&isdownload=${true}`;
    this.assetRecordService
      .getBuilder(this.formdata, q)
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        if (this.isdownload) {
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            moment().format("DD-MM-YYYY") + ".csv"
          );
          this.isdownload = false;
          this.gettingAssets = false;
        } else {
          this.assets = response.rows;
          // this.assetsCount = response.count;
          if (this.pageIndex == 1) {
            this.getAssetCount();
          }
        }
        this.gettingAssets = false;
      });
  }

  getAssetCount() {
    this.indicatorTemplate = true;
    this.assetRecordService
      .getBuilder(this.formdata, `count=${true}`)
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        if (response) {
          console.log(response);
          this.assetsCount = response.count;
          this.indicatorTemplate = false;
        }
      });
  }
  resetFilter() {
    this.selectedresourcetype = { resourcetype: '', attributes: [], filters: [], attributesList: [] };
    this.selectedquery = null;
    this.selectedsavedq = {};
    this.mappedresources = [];
    this.assets = [];
    this.tableHeader = [];
    this.assetsCount = 0;
    this.searchText = '';
  }
  downloadAssets() {
    this.isdownload = true;
    this.formFilters();
  }
  attrSelected() {
    this.selectedresourcetype['attributes'] = this.attributes.filter((e) => { return e.selected });
    this.selectattributes = false;
  }
  reportSearch(searchText, flag?) {
    console.log('flag', flag)
    this.formFilters(this.pageSize, 0);
  }
  refresh() {
    this.searchText = null;
    this.getSavedQueries();
  }
}
