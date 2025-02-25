import {
  Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter,
} from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { AppConstant } from "src/app/app.constant";
import { VMwareAppConstant } from "src/app/vmware.constant";

@Component({
  selector: "app-add-edit-vmware",
  templateUrl:
    "./add-edit-vm.component.html",
})
export class AddEditVMwareComponent implements OnInit, OnChanges {
  @Input() cloudassetObj: any;
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
    this.cloudassetObj.memorysize =  Number(this.cloudassetObj.metadata.memory.size_MiB) / 1024 + "GB";
    this.cloudassetObj.cpucount = this.cloudassetObj.metadata.cpu.count;
    this.cloudassetObj.powerstate = this.cloudassetObj.metadata.power_state;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.cloudassetObj) &&
      !_.isEmpty(changes.cloudassetObj.currentValue)
    ) {
      this.cloudassetObj = changes.cloudassetObj.currentValue;
      this.cloudassetObj.disks = [];
      this.cloudassetObj.network = [];
      if (typeof (this.cloudassetObj.metadata) == 'string') {
        this.cloudassetObj.metadata = JSON.parse(this.cloudassetObj.metadata);
      }
      let diskdata = this.cloudassetObj.metadata.disks;
      Object.keys(diskdata).forEach((ins) => {
        let disk = diskdata[ins];
        if (disk.value) disk = disk.value;
        this.cloudassetObj.disks.push({
          label: disk.label,
          type: disk.type,
          capacity: this.commonService.convertBytes(disk.capacity)
        });
      });
      let networkData = this.cloudassetObj.metadata.nics;
      Object.keys(networkData).forEach((ins) => {
        let network = networkData[ins];
        if (network.value) network = network.value;
        this.cloudassetObj.network.push({
          label: network.label,
          macaddr: network.mac_address,
          mac_type: network.mac_type,
          state: network.state,
          network: network.backing ? network.backing.network : null,
          networktype: network.backing ? network.backing.type : null,
          network_name: network.backing ? network.backing.network_name : null,
        });
      });
      this.metaTags = this.tagService.decodeTagValues(this.cloudassetObj["tagvalues"]);
      this.metaTagsList = this.tagService.prepareViewFormat(this.cloudassetObj["tagvalues"]);
      console.log(this.cloudassetObj);
    }
  }
  syncTags() {
    this.metaTags.forEach((tag) => {
      tag.cloudprovider = AppConstant.CLOUDPROVIDER.VMWARE;
      tag.resourcetype = VMwareAppConstant.Asset_Types[0];
      tag.resourceid = this.cloudassetObj.instanceid;
      tag.resourcerefid = this.cloudassetObj.instancerefid;
      tag.tnregionid = this.cloudassetObj._accountid;
    });
    this.tagValueService.bulkupdate(this.metaTags).subscribe((result) => {
      let response = JSON.parse(result._body);
      this.notifyNewEntry.next(response.data);
      this.message.info(response.message);
    });
  }
  metaTagsChanges(e) {
    if (e["mode"] == "combined") {
      this.metaTagsSideBarVisible = false;
      this.metaTags = e.data;
      // this.tags = e.data;
      this.metaTagsList = this.tagService.prepareViewFormat(e.data);
    }
  }
}
