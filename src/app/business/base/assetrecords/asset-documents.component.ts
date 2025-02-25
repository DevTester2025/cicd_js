import { Component, Input, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetRecordService } from "./assetrecords.service";
import * as _ from "lodash";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-cloudmatiq-asset-docs",
  templateUrl:
    "../../../presentation/web/base/assetrecords/asset-documents.component.html",
})
export class AssetDocsComponent implements OnInit {
  @Input() resourceDetails;
  @Input() resourceId;
  attachmentFile;
  attachmentFileImage;
  comment = "";
  userstoragedata = {} as any;
  buttonText = "Save";
  screens = [];
  appScreens = {} as any;
  edit = false;
  add = false;
  delete = false;
  documentRecords = [];
  download = false;
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService,
    private message: NzMessageService
  ) {}
  ngOnInit() {
    this.getDocumentsList();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_RECORD_MANAGEMENT,
    } as any);
    if (this.appScreens) {
      this.add = this.appScreens.actions.includes("Create");
      this.edit = this.appScreens.actions.includes("Edit");
      this.delete = this.appScreens.actions.includes("Delete");
      this.download = this.appScreens.actions.includes("Download");
    }
  }
  getDocumentsList() {
    let reqObj = {
      tenantid: this.userstoragedata["tenantid"],
      resourceid: this.resourceId,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.assetRecordService.getAllDocuments(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.documentRecords = _.map(response.data, (item) => {
          item.fileurl = JSON.parse(item.meta).Location;
          return item;
        });
      } else {
        this.documentRecords = [];
      }
    });
  }
  onFile(event) {
    const reader = new FileReader();
    this.attachmentFile = event.target.files[0];
    reader.onload = (e) => {
      this.attachmentFileImage = e.target["result"];
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  addDocs() {
    const formdata = new FormData();
    let data = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    data.comment = this.comment;
    data.status = "Active";
    if (this.attachmentFile != undefined && this.attachmentFile != null) {
      formdata.append("file", this.attachmentFile);
    } else {
      this.message.error("Please upload file");
      return false;
    }
    data.createdby = this.userstoragedata["fullname"];
    data.createddt = new Date();
    data.crn = this.resourceDetails.details[0].crn;
    data.resourceid = this.resourceDetails.details[0].resourceid;
    formdata.append("formData", JSON.stringify(data));
    this.assetRecordService.createDocs(formdata).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        this.getDocumentsList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  downloadFile(meta) {
    let response = {} as any;
    let metaData = JSON.parse(meta);
    let key = _.has(metaData, "storage") ? metaData.storage.key : metaData.key;
    this.assetRecordService
      .downloadDocs({
        key: key,
      })
      .subscribe((result) => {
        response = JSON.parse(result._body);
        var buffer = Buffer.from(response.data.content.data);
        const TYPED_ARRAY = new Uint8Array(buffer);
        const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
          return data + String.fromCharCode(byte);
        }, "");
        downloadService(buffer, response.data.filename);
      });
  }
  deleteDocument(data) {
    this.assetRecordService
      .deleteDoc({
        id: data.id,
        key: JSON.parse(data.meta).key,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.getDocumentsList();
          this.message.success("Deleted Successfully");
        } else {
          this.message.error(response.message);
        }
      });
  }
}
