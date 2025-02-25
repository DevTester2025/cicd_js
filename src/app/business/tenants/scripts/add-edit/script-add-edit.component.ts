import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { ScriptService } from "../../scripts/script.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../app.constant";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { Buffer } from "buffer";

import * as _ from "lodash";
import downloadService from "src/app/modules/services/shared/download.service";
import { CustomValidator } from "src/app/modules/shared/utils/custom-validators";
@Component({
  selector: "app-cloudmatiq-script-add-edit",
  templateUrl:
    "../../../../presentation/web/tenant/scripts/add-edit/script-add-edit.component.html",
})
export class ScriptAddEditComponent implements OnInit, OnChanges {
  @Input() scriptObj: any;
  @Output() notifyScriptEntry: EventEmitter<any> = new EventEmitter();
  scriptFile;
  scriptFileImage;
  scriptForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  scriptUrl;
  @ViewChild("scriptfile") scriptfile: ElementRef;
  scriptErrObj = {
    scriptname: AppConstant.VALIDATIONS.SCRIPT.SCRIPTNAME,
    scripttype: AppConstant.VALIDATIONS.SCRIPT.SCRIPTTYPE,
    commandblock: AppConstant.VALIDATIONS.SCRIPT.COMMENTBLOACK,
    notes: AppConstant.VALIDATIONS.SCRIPT.NOTES,
  };
  disabled = false;
  loading = false;
  tabIndex = 0 as number;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private scriptService: ScriptService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SCRIPTS,
    });
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }

  ngOnInit() {
    // this.scriptForm = this.fb.group({
    //     scriptname: [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50)])],
    //     scripttype: [null, Validators.required],
    //     commandblock: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(50)])],
    //     notes: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(100)])],
    //     status: ['Active']
    // });
  }
  clearForm() {
    this.scriptForm = this.fb.group({
      scriptname: [
        null,
        [
          Validators.required,
          CustomValidator.cannotContainSpace,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      scripttype: [null, Validators.required],
      commandblock: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      notes: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: ["Active"],
    });
    this.scriptObj = {};  
  }
  scripttypechange(event) {
    if (event == "Command") {
      this.scriptForm.controls["commandblock"].setValidators([
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.required,
      ]);
    } else {
      this.scriptForm.controls["commandblock"].clearValidators();
    }
    this.scriptForm.updateValueAndValidity();
  }
  onFile(event) {
    const reader = new FileReader();
    if (event.target.files[0] && event.target.files[0].name.indexOf(" ") >= 0) {
      this.scriptfile.nativeElement.value = null;
      this.message.error("Script file should not contain space");
      return false;
    }
    this.scriptFile = event.target.files[0];
    reader.onload = (e) => {
      this.scriptFileImage = e.target["result"];
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.scriptObj) &&
      !_.isEmpty(changes.scriptObj.currentValue)
    ) {
      this.scriptObj = changes.scriptObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.scriptObj);
    } else {
      this.clearForm();
      if(this.scriptfile && this.scriptfile.nativeElement){
        this.scriptfile.nativeElement.value = null;
      }
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  generateEditForm(data) {
    this.scriptForm = this.fb.group({
      scriptname: [
        data.scriptname,
        [
          Validators.required,
          CustomValidator.cannotContainSpace,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      scripttype: [data.scripttype, Validators.required],
      commandblock: [
        data.commandblock,
        Validators.compose([Validators.minLength(1), Validators.maxLength(50)]),
      ],
      notes: [
        data.notes,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [data.status],
    });
    if (data.filename != null && data.filename != undefined) {
      this.scriptUrl = data.filename;
    }
  }
  downloadFile() {
    let response = {} as any;
    this.scriptService
      .byId(this.scriptObj.scriptid, `download=${true}`)
      .subscribe((result) => {
        response = JSON.parse(result._body);
        var buffer = Buffer.from(response.data.content.data);
        downloadService(buffer, response.data.filename);
      });
  }

  saveUpdateScript(data) {
    let errorMessage: any;
    if (this.scriptForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.scriptForm,
        this.scriptErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    }

    this.loading = true;
    this.disabled = false;
    const formdata = new FormData();
    let response = {} as any;
    data.tenantid = this.userstoragedata.tenantid;
    data.lastupdateddt = new Date();
    data.lastupdatedby = this.userstoragedata.fullname;
    if (this.scriptFile != undefined && this.scriptFile != null) {
      formdata.append("file", this.scriptFile);
    }
    if (
      !_.isEmpty(this.scriptObj) &&
      this.scriptObj.scriptid != null &&
      this.scriptObj.scriptid != undefined
    ) {
      data.scriptid = this.scriptObj.scriptid;
      formdata.append("formData", JSON.stringify(data));
      this.scriptService.update(formdata).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.loading = false;
            this.disabled = false;
            this.notifyScriptEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to add script group. Try again");
        }
      );
    } else {
      data.createddt = new Date();
      data.createdby = this.userstoragedata.fullname;
      data.status = AppConstant.STATUS.ACTIVE;
      if (
        (this.scriptFile == undefined || this.scriptFile == null) &&
        data.scripttype != "Command"
      ) {
        this.message.error("Please select the script");
        this.loading = false;
        return false;
      }
      formdata.append("formData", JSON.stringify(data));
      this.scriptService.create(formdata).subscribe(
        (result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.clearForm();
            this.loading = false;
            this.disabled = false;
            this.notifyScriptEntry.next(response.data);
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to add script group. Try again");
        }
      );
    }
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
