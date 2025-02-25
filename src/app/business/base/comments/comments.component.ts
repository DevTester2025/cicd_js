import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { CommentsService } from "src/app/business/base/comments/comments.service";
import { AssetRecordService } from '../../base/assetrecords/assetrecords.service';
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-comments",
  templateUrl:
    "../../../presentation/web/base/comments/comments.component.html",
})
export class CommentsComponent implements OnInit {
  @Input() resourceDetails;
  @Input() resourceId;
  @Input() documentType;
  @Input() refType;
  attachmentFile;
  attachmentFileImage;
  commentRecords = [];
  comments: any = {
    id: null,
    comment: "",
    idx: null,
  };
  userstoragedata = {} as any;
  buttonText = "Save";
  screens = [];
  appScreens = {} as any;
  historyList = [];
  order = ["lastupdateddt", "desc"];
  constructor(
    private localStorageService: LocalStorageService,
    private commentsService: CommentsService,
    private assetRecordService: AssetRecordService, 
    private message: NzMessageService
  ) {}
  ngOnInit() {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    if (this.documentType){
      this.buttonText = "Upload";
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.resourceDetails && changes.resourceDetails.currentValue) {
      if(this.refType != "history") {
        this.getCommentsList();
      }
      if(this.refType == "history"){
        this.getHistoryList();
      }
    }
  }
  getCommentsList() {
    this.comments = {
      id: null,
      comment: "",
      idx: null,
    };
    let reqObj = {
      tenantid: this.userstoragedata["tenantid"],
      refid: this.resourceId,
      status: AppConstant.STATUS.ACTIVE,
      reftype: this.resourceDetails.reftype,
    };
    this.commentsService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.map((list, index)=>{
          this.commentRecords = [];
          if(this.documentType){
          this.commentRecords = [];
          this.commentRecords = response.data.filter((data) => {
              return data.docpath != null;
          });
          } else {
          this.commentRecords = [];
          this.commentRecords = response.data.filter((data) => {
              return data.docpath == null;
          });
          }
        })
      } else {
        this.commentRecords = [];
      }
    });
  }
  editComment(c, idx: number) {
    this.comments.id = c.id;
    this.comments.comment = c.comments;
    this.comments.idx = idx;
    this.buttonText = "Update";
  }
  deleteComment(c, idx: number) {
    let reqObj = {
      id: c.id,
      lastupdatedby: this.userstoragedata["fullname"],
      lastupdateddt: new Date(),
      status: "Deleted",
    };
    this.commentsService.update(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        if(c.docpath == null){
          this.addUpdateHistory(AppConstant.HISTORY_KEYWORDS.Delete, c.comments);
        } else {
          this.addUpdateHistory(AppConstant.HISTORY_KEYWORDS.DeleteDoc, c.docpath);
        }
        this.getCommentsList();
      } else {
        this.message.error(response.message);
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
  uploadFile(){
    const formData = new FormData();
    const reqObj: any = {
      tenantid: this.resourceDetails.tenantid,
      refid: this.resourceDetails.refid,
      reftype: this.resourceDetails.reftype,
      comments: this.comments.comment,
      customerid: this.resourceDetails.customerid
        ? this.resourceDetails.customerid
        : -1,
      status: AppConstant.STATUS.ACTIVE,
      createdby: this.userstoragedata["fullname"],
      createddt: new Date(),
      lastupdatedby: this.userstoragedata["fullname"],
      lastupdateddt: new Date(),
    }
    if (this.attachmentFile != undefined && this.attachmentFile != null) {
      formData.append("file", this.attachmentFile);
    } else {
      this.message.error("Please upload file");
      return false;
    }
    let splitedName = this.attachmentFile.name.split(".");
    reqObj.docpath = this.attachmentFile.name;
    reqObj.docname = splitedName[0];
    formData.append("formData", JSON.stringify(reqObj));
    this.commentsService.upload(formData).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        this.getCommentsList();
        this.addUpdateHistory(AppConstant.HISTORY_KEYWORDS.Upload, reqObj.docname);
      } else {
        this.message.error(response.message);
      }
    });
  }
  downloadFile(meta) {
    let response = {} as any;
    // let metaData = JSON.parse(meta);
    let metaData = AppConstant.REQUEST_DOCUMENT + meta;
    let key = metaData;
    this.commentsService
      .download({
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
        this.addUpdateHistory(AppConstant.HISTORY_KEYWORDS.Download, meta);
      });
  }
  addUpdateComment() {
    if (this.comments.comment == "") {
      this.message.error("Please enter comment and try save");
      return false;
    }
    let reqObj = {
      tenantid: this.resourceDetails.tenantid,
      refid: this.resourceDetails.refid,
      reftype: this.resourceDetails.reftype,
      comments: this.comments.comment,
      customerid: this.resourceDetails.customerid
        ? this.resourceDetails.customerid
        : -1,
      status: "Active",
      lastupdatedby: this.userstoragedata["fullname"],
      lastupdateddt: new Date(),
    } as any;
    if (!_.isNull(this.comments.id)) {
      reqObj.id = this.comments.id;
      this.commentsService.update(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.addUpdateHistory(AppConstant.HISTORY_KEYWORDS.Update, response.data.comments);
          this.commentRecords[this.comments.idx] = response.data;
        this.buttonText = "Save";
          this.getCommentsList();
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      reqObj.createdby = this.userstoragedata["fullname"];
      reqObj.createddt = new Date();
      this.commentsService.create(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.addUpdateHistory(AppConstant.HISTORY_KEYWORDS.Add, reqObj.comments);
          this.getCommentsList();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }

  addUpdateHistory(type, comment?) {
      // let approvedContent;
      // let approverName = this.userstoragedata.fullname;
      // let requestType;
      let reqObj = {
        _tenantid: this.resourceDetails.tenantid,
        resourcetypeid: JSON.stringify(this.resourceDetails.refid),
        resourcetype: this.resourceDetails.reftype,
        old: '',
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      } as any;

      switch (type) {
        case AppConstant.HISTORY_KEYWORDS.Add:
          reqObj.affectedattribute = AppConstant.HISTORY_KEYWORDS.Add;
          reqObj.new = comment;
          break;
        case AppConstant.HISTORY_KEYWORDS.Update:
          reqObj.affectedattribute = AppConstant.HISTORY_KEYWORDS.Update;
          reqObj.new = comment;
          break;
        case AppConstant.HISTORY_KEYWORDS.Upload:
          reqObj.affectedattribute = AppConstant.HISTORY_KEYWORDS.Upload;
          reqObj.new = `File added: ${comment}`;
          break;
        case AppConstant.HISTORY_KEYWORDS.Download:
          reqObj.affectedattribute = AppConstant.HISTORY_KEYWORDS.Download;
          reqObj.new = `File Downloaded: ${comment}`;
          break;
        case AppConstant.HISTORY_KEYWORDS.Delete:
          reqObj.affectedattribute = AppConstant.HISTORY_KEYWORDS.Delete;
          reqObj.new = `Notes: ${comment}`;
          break;
          case AppConstant.HISTORY_KEYWORDS.DeleteDoc: 
          reqObj.affectedattribute = AppConstant.HISTORY_KEYWORDS.Delete;
          reqObj.new = `File Deleted: ${comment}`;
          break;
        default:
          return;
      }
        this.commentsService.historyCreate(reqObj).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
          } else {
            this.message.error(response.message);
          }
        });
    }

    getHistoryList(){
      let reqObj = {
        _tenantid:
        this.resourceDetails.reftype === AppConstant.REFERENCETYPE[18]
          ? Number(this.resourceDetails.tenantid)
          : this.resourceDetails.tenantid,
        resourcetypeid:  JSON.stringify(this.resourceDetails.refid),
        resourcetype: this.resourceDetails.reftype,
      }
      this.commentsService.historyList(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.historyList = response.data;
        }else {
          this.historyList = [];
        }
      })
    }
}
