import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";

import * as _ from "lodash";
import { TagService } from "../tags.service";
import { JsonCsvCommonService } from "src/app/modules/services/shared/jsoncsv.service";
import { AssetRecordService } from "../../assetrecords/assetrecords.service";
@Component({
  selector: "app-cloudmatiq-tag-add-edit",
  templateUrl:
    "../../../../presentation/web/base/tagmanager/add-edit/tag-add-edit.component.html",
})
export class TagAddEditComponent implements OnInit, OnChanges, AfterViewInit {
  disabled = false;
  loading = false;
  tagTypes = AppConstant.TAGS.TAG_TYPES;

  @Input() tagObj: any;
  @Output() notifyTagEntry: EventEmitter<any> = new EventEmitter();

  tagForm: FormGroup;
  userstoragedata = {} as any;
  resourceTypesList = [];
  resourceTypeList = [];
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  tagErrObj = {
    tagname: AppConstant.VALIDATIONS.TAG.TAGNAME,
    tagtype: AppConstant.VALIDATIONS.TAG.TAGTYPE,
    description: AppConstant.VALIDATIONS.TAG.DESCRIPTION,
  };
  regexList: any[];

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private assetRecordService: AssetRecordService,
    private commonService: CommonService,
    private jsonCsvService: JsonCsvCommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngAfterViewInit(): void {
    let a = this;
    let ref = document.getElementById("csvpik") as HTMLElement;
    if (ref)
      ref.addEventListener("change", function () {
        let f: any = this;
        if (f.files.length > 0) {
          // a.parseCSV(f.files)
        }
      });
  }

  ngOnInit() {
    this.getAvailableRegex();
    this.tagForm = this.fb.group({
      tagname: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern("^[A-Za-z-_]+$"),
        ]),
      ],
      tagtype: [null, Validators.required],
      attributeid: [""],
      resourceid: [""],
      lookupvalues: [null],
      date: [null],
      rng_from: [null],
      rng_to: [null],
      regex: [null],
      customRegex: [null],
      required: [false],
      description: [
        null,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(1000),
        ]),
      ],
      status: ["Active"],
    });
    this.tagForm.get("tagtype").valueChanges.subscribe((val) => {
      this.tagForm.controls["lookupvalues"].setValue(null);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["tagObj"]) {
      if (this.tagForm) this.tagForm.reset();
      if (Object.keys(changes["tagObj"]["currentValue"]).length > 0) {
        this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
        let formData = changes["tagObj"]["currentValue"];

        if (formData.tagtype == "number" && formData.lookupvalues != null) {
          this.tagForm.controls["tagtype"].setValue("number");
          formData.lookupvalues = Number(formData.lookupvalues);
        }
        if (
          formData.tagtype == "list" &&
          typeof formData.lookupvalues == "string"
        ) {
          this.tagForm.controls["tagtype"].setValue("list");
          formData.lookupvalues = formData.lookupvalues.split(",");
        } else {
          this.tagForm.controls["tagtype"].setValue("list");
        }
        if (formData.tagtype == "date" && formData.lookupvalues != null) {
          this.tagForm.controls["tagtype"].setValue("date");
          formData.lookupvalues = new Date(formData.lookupvalues);
          formData.date = new Date(formData.lookupvalues);
        }
        if (formData.tagtype == "range") {
          this.tagForm.controls["tagtype"].setValue("range");
          formData.rng_from = formData.lookupvalues.split(",")[0];
          formData.rng_to = formData.lookupvalues.split(",")[1];
        }

        this.tagForm.setValue({
          tagname: formData.tagname,
          tagtype: formData.tagtype,
          attributeid: formData.attributeid,
          resourceid: formData.resourceid,
          lookupvalues: formData.lookupvalues,
          rng_from: formData.rng_from || null,
          rng_to: formData.rng_to || null,
          date: formData.date || null,
          regex:
            this.regexList.find((o) => o["keyvalue"] == formData.regex) !=
            undefined
              ? formData.regex
              : formData.regex == null
              ? null
              : "Custom",
          description: formData.description || "",
          customRegex: formData.regex || null,
          required: formData.required || false,
          status: formData.status,
        });
        this.onChangeAttribute();
      }
      else{
        this.buttonText = AppConstant.BUTTONLABELS.SAVE;
      }
    }
    this.getResourceType();
  }

  getAvailableRegex() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.TAG_REGEX,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.regexList = response.data;
        console.log("REGEX LIST::::::::::::::");
        console.log(this.regexList);
      } else {
        this.regexList = [];
      }
    });
  }

  generateEditForm(data) {}
  saveUpdateScript(data) {
    let formData = _.cloneDeep(data);

    formData["lastupdatedby"] = this.userstoragedata.fullname;
    formData["lastupdateddt"] = new Date();
    formData["attributeid"] = formData["attributeid"]
      ? formData["attributeid"]
      : "";
    formData["resourceid"] = formData["resourceid"]
      ? formData["resourceid"]
      : "";

    let errorMessage: any;
    if (this.tagForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.tagForm,
        this.tagErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      if (formData.tagtype == "number" && formData.lookupvalues != null) {
        formData.lookupvalues = formData.lookupvalues.toString();
      }
      if (formData.tagtype == "list") {
        if (formData.lookupvalues != null && formData.lookupvalues.length > 0) {
          formData.lookupvalues = formData.lookupvalues.join(", ");
        } else {
          this.message.error("Default value required.");
          return;
        }
      }
      if (formData.tagtype == "date") {
        if (formData.date) {
          formData.lookupvalues = formData.date.toISOString();
        }
      }
      if (formData.tagtype == "range") {
        if (
          formData.rng_from == null ||
          formData.rng_to == null ||
          formData.rng_from.length <= 0 ||
          formData.rng_to.length <= 0
        ) {
          this.message.error("Default value required.");
          return;
        }
      }
      if (
        formData.tagtype == "range" &&
        Number(formData.rng_from) < Number(formData.rng_to)
      ) {
        formData.lookupvalues = [formData.rng_from, formData.rng_to].join(",");
      }
      if (
        formData.tagtype == "range" &&
        Number(formData.rng_from) > Number(formData.rng_to)
      ) {
        this.message.error("Invalid Range");
        return;
      }
      if (formData.tagtype == "text" && formData.regex) {
        try {
          new RegExp(formData.regex);
        } catch (e) {
          this.message.error("Regex Not Valid");
          return;
        }
      }
      if (formData.regex == "Custom") {
        formData.regex = formData.customRegex;
      }

      delete formData.rng_from;
      delete formData.rng_to;
      delete formData.date;
      if (formData.tagtype != "text") delete formData.regex;
      if (formData.lookupvalues == null) delete formData.lookupvalues;
      if (formData.description == null) delete formData.description;
      if (formData.required == null) formData.required = false;

      this.disabled = true;

      if (Object.keys(this.tagObj).length > 0) {
        formData["tenantid"] = this.userstoragedata.tenantid; //#OP_T913
        formData["tagid"] = this.tagObj.tagid;
        this.tagService.update(formData).subscribe(
          (result) => {
            this.disabled = false;

            let response = JSON.parse(result._body);
            if (response.status) {
              this.tagForm.reset();
              this.notifyTagEntry.emit(true);
              this.message.success(response.message);
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
        formData["tenantid"] = this.userstoragedata.tenantid;
        formData["status"] = AppConstant.STATUS.ACTIVE;
        formData["createdby"] = this.userstoragedata.fullname;
        formData["createddt"] = new Date();
        this.tagService.create(formData).subscribe(
          (result) => {
            this.disabled = false;

            let response = JSON.parse(result._body);
            if (response.status) {
              this.tagForm.reset();
              this.notifyTagEntry.emit(true);
              this.message.success(response.message);
            } else {
              this.message.error(response.message);
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

  downloadSampleData() {
    this.jsonCsvService.downloadCSVfromJson(
      [
        {
          Value: "One",
        },
        {
          Value: "Two",
        },
        {
          Value: "Three",
        },
        {
          Value: "Four",
        },
      ],
      "Tag"
    );
  }
  pickCSV() {
    let ref = document.getElementById("csvpik") as HTMLElement;
    if (ref) {
      ref.click();
    }
  }
  getFile(files: any) {
    let f = files.srcElement.files as File[];

    if (f.length > 0) {
      this.jsonCsvService
        .parseCSV(f[0])
        .then((obj) => {
          let arr = [];
          if (obj["data"].length > 0) {
            for (let index = 0; index < obj["data"].length; index++) {
              const element = obj["data"][index];
              if (element["Value"] && element["Value"].length > 0)
                arr.push(element["Value"]);
            }
          }
          this.tagForm.patchValue({ lookupvalues: arr });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  //CMDB link changes
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
        let response = JSON.parse(d._body);
        console.log("..................................getResourceType");
        this.resourceTypesList = _.orderBy(response, ["resource"], ["asc"]);
      });
  }
  onChangeAttribute() {
    let crn = this.tagForm.value.attributeid;
    console.log(crn);
    this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
        ],
        crn
      )
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        this.resourceTypeList = response;
      });
  }
}
