import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { LocalStorageService } from "../../services/shared/local-storage.service";
import * as _ from "lodash";
import * as moment from "moment";
import { AssetAttributesConstant } from "src/app/business/base/assetrecords/attributes.contant";

@Component({
  selector: "app-attributefilters",
  templateUrl: "./attributefilters.component.html",
  styles: [
    `
      .ant-card {
        width: 100%;
        background: #1c2e3c;
        color: white;
        border: none;
      }
      .ant-card-head,
      .ant-card-head .ant-tabs-bar {
        border-bottom: none !important;
      }
      .ant-card-head-title {
        color: white !important;
      }
      .t-active {
        margin-left: 7px;
        padding: 3px 10px;
        border-radius: 100px;
        background: #ffeb3b;
        color: black;
        font-weight: 500;
        font-size: 13px;
      }
      /* .ant-tag .ant-tag-checkable {
          color: white !important;
        } */
      #grouptable th {
        border: 1px solid #dddddd30;
        padding: 8px;
        border-style: groove;
      }
      #grouptable td {
        border: 1px solid #dddddd30;
        padding: 6px;
        border-style: groove;
      }

      #grouptable tr {
        padding: 5px;
      }

      #grouptable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #1c2e3cb3;
        color: white;
      }
      nz-select {
        width: 90%;
      }
    `,
  ],
})
export class AttributefiltersComponent implements OnInit {
  @Input() crn;
  @Input() querybuilder;
  @Input() selectedFilters = [];
  @Output() applyAttrFilter: EventEmitter<any> = new EventEmitter();
  attributeList: any = [];
  operator = 0;
  dataloading = false;
  attributes = [];
  operations = [
    {
      label: "Less than",
      value: "<",
      datatypes: ["Integer", "Float", "Date", "DateTime"],
    },
    {
      label: "Greater than",
      value: ">",
      datatypes: ["Integer", "Float", "Date", "DateTime"],
    },
    {
      label: "Equal to",
      value: "=",
      datatypes: [
        // "AUTOGEN",
        "Integer",
        "Float",
        "Date",
        "DateTime",
        "Boolean",
      ],
    },
    {
      label: "in",
      value: "in",
      datatypes: [
        "AUTOGEN",
        "Text",
        "Textarea",
        "Select",
        "STATUS",
        "REFERENCE",
        "URL"
      ],
    },
    { label: "Between", value: "BETWEEN", datatypes: ["Date", "DateTime"] },
  ];
  groups: any = [
    {
      id: 1,
      attributeList: [
        {
          type: null,
          formula: null,
          value: "",
        },
      ],
      operator: 0,
    },
  ];
  userstoragedata: any;
  constructor(
    private assetRecordService: AssetRecordService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.operator = 0;
    if (changes.crn && changes.crn.currentValue) {
      this.crn = changes.crn.currentValue;
      this.getAttributes(this.crn);
    }
    if (
      changes.selectedFilters &&
      changes.selectedFilters.currentValue.length > 0
    ) {
      this.selectedFilters = changes.selectedFilters.currentValue;
    }
  }

  getAttributes(crn) {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      crn: crn,
    };
    this.assetRecordService.all(condition).subscribe((result) => {
      let response = {} as any;
      response = JSON.parse(result._body);
      if (response) {
        this.attributes = [];
        response.data.map((el) => {
          if (el.fieldtype == "Reference Asset") {
            let referenceasset = JSON.parse(el.referenceasset);
            referenceasset.attribute.map((attr) => {
              let attribute: any = _.find(
                AssetAttributesConstant.COLUMNS[referenceasset.assettype],
                {
                  field: attr,
                }
              );
              let obj = {
                title: attribute.header,
                value: {
                  referencekey: attribute.referencekey,
                  fieldname: attribute.header,
                  fieldtype: el.fieldtype,
                  fieldkey: attribute.field,
                  linkid: attribute.linkid,
                  referenceasset: referenceasset,
                  assettype: referenceasset.assettype,
                }
              }
              this.attributes.push(obj);
            });
          } else {
            let obj = {
              title: el.fieldname,
              value: el
            }
            this.attributes.push(obj);
          }
        });
        // console.log(this.selectedFilters);
        if (this.selectedFilters && this.selectedFilters.length > 0) {
          this.groups = this.selectedFilters;
          this.groups.map((g) => {
            let attrfilters = [];
            g.attributeList.map((e) => {
              let obj = {
                type: _.find(this.attributes, function (i) {
                  return i.title == e.type.fieldname;
                }).value,
                formula: e.formula,
                operations: e.operations,
                possibleValues: e.possibleValues,
                value: e.value,
              };
              attrfilters.push(obj);
            });
            g.attributeList = attrfilters;
          });
        }
      } else {
        this.attributes = [];
      }
    });
  }

  applyFilter() {
    this.applyAttrFilter.next(this.groups);
  }

  deleteGroup(grpIdx) {
    this.groups.splice(grpIdx, 1);
    this.groups = [...this.groups];
  }

  addRow(i) {
    this.groups[i].attributeList.push({
      type: null,
      formula: null,
      value: "",
    });
  }
  deleteRow(grpIdx, i) {
    this.groups[grpIdx].attributeList.splice(i, 1);
  }
  onAttributeSelect(event, i, grpIdx, flag?) {
    console.log(event);
    if (event) {
      if (flag) {
        this.groups[grpIdx].attributeList[i].value = "";
        this.groups[grpIdx].attributeList[i].formula = null;
      }

      // if (event.fieldtype == "AUTOGEN") {
      //   this.attributeList[i].maxseqno = Number(event.curseq) - 1;
      // }
      this.groups[grpIdx].attributeList[i].operations = _.filter(
        this.operations,
        function (e) {
          return _.includes(e.datatypes, event.fieldtype);
        }
      );
      this.groups[grpIdx].attributeList[i].formula =
        this.groups[grpIdx].attributeList[i].operations[0].value;
      this.assetRecordService
        .getAllDetail({
          crn: event.crn,
          status: AppConstant.STATUS.ACTIVE,
          tenantid: this.userstoragedata.tenantid,
          fieldkey: event.fieldkey,
        })
        .subscribe((result) => {
          let response = {} as any;
          response = JSON.parse(result._body);
          if (response.status) {
            let self = this;
            let grouped = _.groupBy(response.data, 'fieldvalue');
            if (this.querybuilder) {
              this.groups[grpIdx].attributeList[i].possibleValues = [];
              Object.entries(grouped).forEach(([key, value]) => {
                let keyObj =
                  event.fieldtype === "REFERENCE"
                    ? JSON.parse(key)
                        .map((item) => item.name)                      
                    : key;

                this.groups[grpIdx].attributeList[i].possibleValues.push({
                  label: keyObj,
                  value: {
                    fieldvalue: key,
                     resourceids: _.map(value, function (v) { return v.resourceid }),
                  }
                })
              });
            } else {
              this.groups[grpIdx].attributeList[i].possibleValues =
                response.data.map((el) => {
                  return {
                    label:
                      event.fieldtype == "REFERENCE"
                        ? JSON.parse(el.fieldvalue)[0].name
                        : el.fieldvalue,
                    value: el.fieldvalue,
                  };
                });
              this.groups[grpIdx].attributeList[i].possibleValues = _.unionBy(
                this.groups[grpIdx].attributeList[i].possibleValues,
                "label"
              );
            }
          }
        });
    }
  }
  onchangeTab(index, grpIdx) {
    this.groups[grpIdx].operator = index;
  }

  addGroup() {
    this.groups.push({
      id: this.groups.length + 1,
      attributeList: [
        {
          type: null,
          formula: null,
          value: "",
        },
      ],
      operator: 0,
    });
  }
}
