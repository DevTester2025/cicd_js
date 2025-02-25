import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { NzMessageService } from "ng-zorro-antd";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { SolutionService } from "../../../solutiontemplate/solution.service";
import { Router } from "@angular/router";
import * as _ from "lodash";
@Component({
  selector: "app-addeditcosts",
  templateUrl:
    "../../../../../presentation/web/tenant/solutiontemplate/costsummary/addeditcosts/addeditcosts.component.html",
})
export class AddeditcostsComponent implements OnInit, OnChanges {
  @Input() solutionObj: any;
  @Input() costObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  loading = false;
  costtypelist: any = [];
  isVisible = false;
  formTitle = "";
  costForm: FormGroup;
  button: any = AppConstant.BUTTONLABELS.SAVE;
  userstoragedata: any = {};
  edit = false;
  screens = [];
  appScreens = {} as any;
  costErrObj = {
    costtype: AppConstant.SOLUTIONCOSTS.VALIDATIONS.COSTTYPE,
    baseprice: AppConstant.SOLUTIONCOSTS.VALIDATIONS.PRICE,
  } as any;
  disableCosttype = false;
  constructor(
    private router: Router,
    private solutionService: SolutionService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getCostTypes();
    this.clearForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.costObj) &&
      !_.isEmpty(changes.costObj.currentValue)
    ) {
      this.costObj = changes.costObj.currentValue;
      this.edit = true;
      this.button = AppConstant.BUTTONLABELS.UPDATE;
      this.formTitle = AppConstant.VALIDATIONS.USER.ADD;
      this.costForm.patchValue(this.costObj);
      if (this.costObj.costtype == "Asset") {
        this.disableCosttype = true;
      } else {
        this.disableCosttype = false;
      }
    } else {
      this.disableCosttype = false;
      this.edit = false;
      this.clearForm();
      this.button = AppConstant.BUTTONLABELS.SAVE;
      this.formTitle = AppConstant.VALIDATIONS.USER.EDIT;
    }
  }

  clearForm() {
    this.costForm = this.fb.group({
      assetname: [null],
      costtype: [null, Validators.required],
      baseprice: [null, Validators.required],
    });
    this.edit = false;
    this.costObj = {};
  }

  getCostTypes() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.COST_TYPES,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        this.loading = false;
        if (response.status) {
          response.data.forEach((element) => {
            if (element.keyname != "Asset") {
              this.costtypelist.push(element);
            }
          });
          this.costtypelist = [...this.costtypelist];
        } else {
          this.costtypelist = [];
        }
      });
  }
  saveOrUpdate(data) {
    let errorMessage: any;
    if (this.costForm.status === "INVALID") {
      errorMessage = this.commonService.getFormErrorMessage(
        this.costForm,
        this.costErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      let data = {
        tenantid: this.solutionObj.tenantid,
        solutionid: this.solutionObj.solutionid,
        costtype: this.costForm.value.costtype,
        baseprice: this.costForm.value.baseprice,
        status: AppConstant.STATUS.ACTIVE,
        lastupdateddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
      } as any;
      if (
        !_.isEmpty(this.costObj) &&
        this.costObj.solutioncostid != undefined
      ) {
        data.solutioncostid = this.costObj.solutioncostid;
        this.solutionService.updatecost(data).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.loading = false;
          if (response.status) {
            this.message.success(response.message);
            this.notifyNewEntry.next(response.data);
          } else {
            this.message.error(response.message);
          }
        });
      } else {
        data.createddt = new Date();
        data.createdby = this.userstoragedata.fullname;
        this.solutionService.bulkcreatecosts([data]).subscribe((res) => {
          const response = JSON.parse(res._body);
          this.loading = false;
          if (response.status) {
            this.message.success(response.message);
            this.notifyNewEntry.next(response.data);
          } else {
            this.message.error(response.message);
          }
        });
      }
    }
  }
}
