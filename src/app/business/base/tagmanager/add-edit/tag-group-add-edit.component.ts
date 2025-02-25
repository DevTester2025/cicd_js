import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";

import * as _ from "lodash";
import * as moment from "moment";
import { TagService } from "../tags.service";
import { TagGroupsService } from "../tag-groups.service";
import { ActivatedRoute, Router } from "@angular/router";
@Component({
  selector: "app-cloudmatiq-tag-group-add-edit",
  templateUrl:
    "../../../../presentation/web/base/tagmanager/add-edit/tag-group-add-edit.component.html",
})
export class TagGroupAddEditComponent implements OnInit, OnChanges {
  edit = true;
  disabled = false;
  loading = false;
  tagTypes = AppConstant.TAGS.TAG_TYPES;
  tagPickerVisible = false;
  tagPickerTitle = "Add / Edit Tags";
  editableTagValueId = null;
  tagCategoryOptions = [];

  tagGroupForm: FormGroup;
  userstoragedata = {} as any;

  tags = [];
  tagsClone = [];

  tagGroupObj;

  buttonText = AppConstant.BUTTONLABELS.SAVE;
  tagGroupErrObj = {
    groupname: AppConstant.VALIDATIONS.TAGGROUP.GROUPNAME,
    resourcetype: AppConstant.VALIDATIONS.TAGGROUP.RESOURCETYPE,
  };

  tagList = [];

  tableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
    { field: "tagcategory", header: "Category", datatype: "string" },
  ] as any;

  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  iseditTag = false;
  tagObj = {};
  taggroupid;
  constructor(
    private route: ActivatedRoute,
    private message: NzMessageService,
    public router: Router,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private tagGroupService: TagGroupsService,
    private tagService: TagService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      var id = params.get("id");
      if (id) {
        this.taggroupid = id;
        this.edit = true;
        this.getTagGroupDetails(id);
      } else {
        this.edit = false;
      }
    });
    this.tagGroupForm = this.fb.group({
      groupname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ]),
      ],
      resourcetype: [null, Validators.required],
      status: ["Active"],
    });
  }

  getTagGroupDetails(id: string) {
    this.tagGroupService.byId(id).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.tagGroupForm.setValue({
            groupname: response.data.groupname,
            resourcetype: response.data.resourcetype,
            status: AppConstant.STATUS.ACTIVE,
          });
          this.tagGroupObj = response.data;
          let l = [];
          for (let index = 0; index < response.data.tagvalues.length; index++) {
            const element = response.data.tagvalues[index];
            let tagvalue;
            if (element.tag.tagtype == "date" && element.tagvalue != null) {
              tagvalue = moment(element.tagvalue).format("DD-MMM-YYYY");
            } else {
              tagvalue = element.tagvalue;
            }
            l.push({
              tagname: element.tag.tagname,
              tagid: element.tag.tagid,
              tagvalue: tagvalue,
              tagorder: element.tagorder,
              tagvalueid: element.tagvalueid,
              tagcategory: element.category || "",
            });
            this.evaluateTagCategoryOptions();
          }
          this.tagList = l;
          this.tagList.sort(this.compare);
          console.log("TAGS LIST >>>>>>>>>>>>>");
          console.log(this.tagList);
          this.tags = this.tagService.decodeTagValues(
            response.data.tagvalues,
            "maintanance"
          );
          console.log("DEFAULT TAGS:::::::::");
          console.log(this.tags, response.data.tagvalues);
          this.tagsClone = response.data.tagvalues;
          this.tagsClone.sort(this.compare);
        } else {
          this.message.error(response.message);
        }
      },
      (err) => {
        this.disabled = false;
        this.message.error("Unable to get tag group. Try again");
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["tagGroupObj"]) {
      if (this.tagGroupForm) this.tagGroupForm.reset();
      if (Object.keys(changes["tagGroupObj"]["currentValue"]).length > 0) {
        let formData = changes["tagGroupObj"]["currentValue"];

        this.tagGroupForm.setValue({
          groupname: formData.groupname,
          resourcetype: formData.resourcetype,
          tags: formData.tags.map((o) => {
            return o["tagid"];
          }),
          status: formData.status,
        });
      }
    }
  }

  compare(a, b) {
    const valueA = a.tagorder;
    const valueB = b.tagorder;

    let comparison = 0;
    if (valueA < valueB) {
      comparison = -1;
    } else if (valueA > valueB) {
      comparison = 1;
    }
    return comparison;
  }
  changeIndex(arr, old_index, new_index) {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
      new_index += arr.length;
    }
    if (new_index >= arr.length) {
      var k = new_index - arr.length;
      while (k-- + 1) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }

  saveUpdateGroup(data) {
    let formData = data;

    formData["lastupdatedby"] = this.userstoragedata.fullname;
    formData["lastupdateddt"] = new Date();

    let errorMessage: any;
    if (this.tagGroupForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.tagGroupForm,
        this.tagGroupErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      formData["tenantid"] = this.userstoragedata.tenantid;
      formData["status"] = AppConstant.STATUS.ACTIVE;
      formData["createdby"] = this.userstoragedata.fullname;
      formData["createddt"] = new Date();
      formData["lastupdatedby"] = this.userstoragedata.fullname;
      formData["lastupdateddt"] = new Date();
      this.disabled = true;

      formData["tagvalues"] = [];

      if (this.tagGroupObj && Object.keys(this.tagGroupObj).length > 0) {
        this.tagsClone = this.changeOrder(this.tagsClone);
        console.log("TC>>>>", this.tagsClone);
        formData["taggroupid"] = this.tagGroupObj.taggroupid;
        formData["tagvalues"] = this.tagsClone.map((o) => {
          const categoryObj = this.tagList.find(
            (p) => p["tagvalueid"] == o["tagvalueid"]
          );
          o["category"] =
            categoryObj && categoryObj["tagcategory"]
              ? categoryObj["tagcategory"]
              : o["category"]
              ? o["category"]
              : null;
          delete o["resourceid"];
          o["taggroupid"] = this.tagGroupObj.taggroupid;
          return o;
        });

        this.tagGroupService.update(formData).subscribe(
          (result) => {
            this.disabled = false;
            let response = JSON.parse(result._body);
            if (response.status) {
              this.tagGroupForm.reset();
              this.message.success(response.message);
              window.history.go(-1);
            } else {
              this.message.error(response.message);
            }
          },
          (err) => {
            this.disabled = false;
            this.message.error("Unable to add / edit tag. Try again");
          }
        );
      } else {
        formData["tagvalues"] = this.tagsClone;

        this.tagGroupService.create(formData).subscribe(
          (result) => {
            this.disabled = false;

            let response = JSON.parse(result._body);
            if (response.status) {
              this.tagGroupForm.reset();
              this.message.success(response.message);
              window.history.go(-1);
            } else {
              // this.message.error(response.message);
            }
          },
          (err) => {
            this.disabled = false;
            this.message.error("Unable to add / edit tag. Try again");
          }
        );
      }
    }
  }

  evaluateTagCategoryOptions() {
    const options = this.tagList.filter(
      (o) => o["tagcategory"] && o["tagcategory"].length > 0
    );
    this.tagCategoryOptions = _.uniqBy(options, "tagcategory");
  }

  drawerChanges(e) {
    this.tagPickerVisible = false;
  }
  changeOrder(array) {
    array.forEach((element, i) => {
      element.tagorder = i;
    });
    return array;
  }
  changePosition(event) {
    this.tagsClone = this.changeIndex(
      this.tagsClone,
      event.dragIndex,
      event.dropIndex
    );
    this.tagsClone = this.changeOrder(this.tagsClone);
  }
  tagPickerChanges(e: any) {
    this.editableTagValueId = null;
    if (e["mode"] == "standalone") {
      this.tagPickerVisible = false;
      this.route.paramMap.subscribe((params) => {
        var id = params.get("id");
        this.taggroupid = id;
        if (id) this.getTagGroupDetails(id);
      });
    }
    if (e["mode"] == "combined") {
      console.log(e.data);
      this.tagPickerVisible = false;
      this.tagsClone = e.data;
      let l = [];
      for (let index = 0; index < e.data.length; index++) {
        const element = e.data[index];
        if (element.status && element.status == AppConstant.STATUS.ACTIVE) {
          let tagvalue = "";

          if (element.tag.tagtype == "date" && element.tagvalue != null) {
            tagvalue = moment(element.tagvalue).format("DD-MMM-YYYY");
          } else {
            tagvalue = element.tagvalue;
          }
          l.push({
            tagname: element.tag.tagname,
            tagvalue: tagvalue,
            tagcategory: element.category || "",
            tagorder: element.tagorder,
            tagvalueid: element.tagvalueid,
          });
        }
      }
      this.tagList = l;
    }
  }
  editTag(data) {
    this.tagService.byId(data.tagid).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.tagObj = response.data;
        this.iseditTag = true;
      }
    });
  }
  notifyTagEntry(e) {
    this.iseditTag = false;
    this.getTagGroupDetails(this.taggroupid);
  }
}
