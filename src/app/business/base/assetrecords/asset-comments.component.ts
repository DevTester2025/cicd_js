import { Component, Input, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetRecordService } from "./assetrecords.service";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";

interface IComment {
  id: number;
  tenantid: number;
  crn: string;
  resourceid: string;
  comment: string;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: string;
  lastupdateddt: Date;
  meta: string;
}
@Component({
  selector: "app-cloudmatiq-asset-comments",
  templateUrl:
    "../../../presentation/web/base/assetrecords/asset-comments.component.html",
})
export class AssetCommentsComponent implements OnInit {
  @Input() resourceDetails;
  @Input() resourceId;
  @Input() isWorkflowNotification:boolean=false;
  commentRecords: IComment[] = [];
  comments: any = {
    id: null,
    comment: "",
    idx: null,
  };
  userstoragedata = {} as any;
  buttonText = "Save";
  screens = [];
  appScreens = {} as any;
  edit = false;
  delete = false;
  add = false;
  constructor(
    private localStorageService: LocalStorageService,
    private assetRecordService: AssetRecordService,
    private message: NzMessageService
  ) {}
  ngOnInit() {
    this.getCommentsList();
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
    }
    if(this.isWorkflowNotification){
      this.add=true;
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
      resourceid: this.resourceId,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.assetRecordService.getAllComments(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.commentRecords = response.data;
      }else{
        this.commentRecords = [];
      }
    });
  }
  editComment(c, idx: number) {
    console.log(c);
    this.comments.id = c.id;
    this.comments.comment = c.comment;
    this.comments.idx = idx;
    this.buttonText = "Update";
    // document.getElementById("ctextarea").scrollIntoView(true);
  }
  deleteComment(c, idx: number) {
    let reqObj = {
      id: c.id,
      lastupdatedby: this.userstoragedata["fullname"],
      lastupdateddt: new Date(),
      status: "Deleted",
    };
    let qry_string = "";
    if(this.isWorkflowNotification == true){
      qry_string = "isWorkflowNotification=true"
    }
    this.assetRecordService.updateComment(reqObj,qry_string).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        this.getCommentsList();
      } else {
        this.message.error(response.message);
      }
    });
  }
  addUpdateComment() {
    if (this.comments.comment == "") {
      this.message.error("Please enter comment and try save");
      return false;
    }
    let reqObj = {
      tenantid: this.resourceDetails.details[0].tenantid,
      crn: this.resourceDetails.details[0].crn,
      resourceid: (this.resourceId && this.isWorkflowNotification) ? this.resourceId : this.resourceDetails.details[0].resourceid,
      comment: this.comments.comment,
      status: "Active",
      lastupdatedby: this.userstoragedata["fullname"],
      lastupdateddt: new Date(),
    } as any;
    if (!_.isNull(this.comments.id)) {
      reqObj.id = this.comments.id;
      let qry_string = "";
      if(this.isWorkflowNotification == true){
        qry_string = "isWorkflowNotification=true"
      }
      this.assetRecordService.updateComment(reqObj,qry_string).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.commentRecords[this.comments.idx] = response.data;
          this.getCommentsList();
        } else {
          this.message.error(response.message);
        }
      });
    } else {
      reqObj.createdby = this.userstoragedata["fullname"];
      reqObj.createddt = new Date();
      let qry_string = "";
      if(this.isWorkflowNotification == true){
        qry_string = "isWorkflowNotification=true"
      }
      this.assetRecordService.createComment(reqObj,qry_string).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.getCommentsList();
        } else {
          this.message.error(response.message);
        }
      });
    }
  }
}
