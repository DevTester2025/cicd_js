import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, } from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { AppConstant } from "src/app/app.constant";

@Component({
  selector: "app-add-vmasset",
  templateUrl:
    "./add-vm-asset.component.html",
})
export class AddVMAssetsComponent implements OnInit, OnChanges {
  @Input() cloudassetObj: any;
  @Input() assetname: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  edit = false;
  userstoragedata: any;
  cloudassetForm: FormGroup;
  formdata: any = {};
  metaTags: any = {};
  metaVolumes: any = {};
  metaTagsList: any = [];
  disabled = true;
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  loading = false;
  metaTagsSideBarVisible = false;
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private message: NzMessageService,
    private tagService: TagService,
    private tagValueService: TagValueService,
    private fb: FormBuilder
  ) { }
  ngOnInit() {
    this.metaVolumes = {
      tagTableConfig: {
        edit: false,
        delete: false,
        globalsearch: false,
        loading: false,
        pagination: false,
        pageSize: 1000,
        title: "",
        widthConfig: ["30px", "25px", "25px", "25px", "25px"],
      }
    };
  }
  metaTagsChanges(e) {
    if (e["mode"] == "combined") {
      this.metaTagsSideBarVisible = false;
      this.metaTags = e.data;
      // this.tags = e.data;
      this.metaTagsList = this.tagService.prepareViewFormat(e.data);
    }
  }
  syncTags() {
    this.metaTags.forEach((tag) => {
      tag.cloudprovider = this.cloudassetObj.cloudprovider;
      tag.resourcetype = this.assetname;
      tag.resourceid = this.cloudassetObj.id;
      tag.resourcerefid = this.cloudassetObj.assetid;
      tag.tnregionid = this.cloudassetObj._accountid;
    });
    this.tagValueService.bulkupdate(this.metaTags).subscribe((result) => {
      let response = JSON.parse(result._body);
      this.message.info(response.message);
      this.notifyNewEntry.next(response.data);
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.cloudassetObj) &&
      !_.isEmpty(changes.cloudassetObj.currentValue)
    ) {
      this.cloudassetObj = changes.cloudassetObj.currentValue;
      this.metaTags = this.tagService.decodeTagValues(this.cloudassetObj["tagvalues"]);
      this.metaTagsList = this.tagService.prepareViewFormat(this.cloudassetObj["tagvalues"]);
    }
    if (
      !_.isUndefined(changes.assetname) &&
      !_.isEmpty(changes.assetname.currentValue)
    ) {
      console.log(this.assetname);
      this.assetname = changes.assetname.currentValue;
    }
  }
}
