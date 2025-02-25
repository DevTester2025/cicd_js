import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AssetsService } from "src/app/business/base/assets/assets.service";
import { AppConstant } from "src/app/app.constant";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { constants } from "os";
import { element } from "protractor";

@Component({
  selector: "app-mapping-instance",
  templateUrl:
    "../../../../presentation/web/base/assets/assets-mapping.component.html",
})
export class AssetsMappingComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;
  @Input() assetData;
  @Input() readOnly;
  getCustomer = false;
  userstoragedata = {} as any;
  asset = null;
  tenantForm: FormGroup;
  customersList: any = [];
  tenantItems: any = [];
  removedItems: any = [];
  constructor(
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private assetService: AssetsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.tenantForm = this.fb.group({
      customer: [null],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["assetData"]) {
      this.addItam(this.assetData);
    }
    if (changes.readOnly && changes.readOnly.currentValue) {
      this.readOnly = changes.readOnly.currentValue;
    } else {
      this.readOnly = false;
    }
  }
  ngOnInit() {
    this.getAllCustomers();
  }
  // FIXME: Dead Code.
  // formTenant() {
  //   let data = this.assetData;
  //   return this.fb.group({
  //     tenantid: this.userstoragedata.tenantid,
  //     cloudprovider: data ? data.cloudprovider : null,
  //     resourcetype: data ? data.instancetyperefid : null,
  //     resourceid: data ? data.instancetypeid : null,
  //     customerid: [null],
  //     status: AppConstant.STATUS.ACTIVE,
  //     createdby: !_.isEmpty(this.userstoragedata) ? this.userstoragedata.fullname : null,
  //     createddt: new Date(),
  //     lastupdatedby: !_.isEmpty(this.userstoragedata) ? this.userstoragedata.fullname : null,
  //     lastupdateddt: new Date()
  //   });
  // }

  addItam(data) {
    if (data) {
      this.tenantItems = [];
      if (data.assetmapping && data.assetmapping.length > 0) {
        data.assetmapping.forEach((element) => {
          this.tenantItems.push(element.customerid);
        });
      }
    } else {
      this.tenantItems = [];
    }
    this.tenantForm.get("customer").setValue(this.tenantItems);
  }

  removeItem(i) {
    this.tenantItems = this.tenantForm.get("tenant") as FormArray;
    const currentindex = this.tenantItems.value.length;
    if (currentindex !== 1) {
      let item = {} as any;
      item = this.tenantItems.controls[i].value;
      item.status = AppConstant.STATUS.INACTIVE;
      this.removedItems.push(item);
      this.tenantItems.removeAt(i);
    }
  }
  getFormArray(): FormArray {
    return this.tenantForm.get("tenant") as FormArray;
  }
  getAllCustomers() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL,
        cndtn
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.customersList = response.data;
          if (this.assetData) {
            this.addItam(this.assetData);
          }
        } else {
          this.customersList = [];
        }
      });
  }

  checkDuplicate(event, i) {
    if (event != null) {
      this.tenantItems = this.tenantForm.get("tenant") as FormArray;
      const length = this.tenantItems.value.length;
      const valueList: any[] = [];
      if (length > 1) {
        for (const formGroup of this.tenantItems.value) {
          let obj = { customerid: formGroup.customerid } as any;
          valueList.push(obj);
        }
        const isUnique = _.uniqWith(valueList, _.isEqual);
        const duplicateLength = isUnique.length;
        if (duplicateLength !== length) {
          this.message.error("Duplicate record exist");
          this.tenantItems.controls[i].get("customerid").setValue(null);
          return false;
        }
      }
    }
  }
  saveAssetMapping(value) {
    if (value && this.assetData) {
      let formData = [] as any;
      let data = this.assetData;
      let existData = {} as any;
      this.removedItems = this.tenantItems.filter(
        (element) => value.indexOf(element) == -1
      );
      value = value.concat(this.removedItems);
      data.cloudprovider = data.cloudprovider;
      value.forEach((element: any) => {
        existData = data.assetmapping.find((x) => x.customerid === element);
        let obj = {
          assetmappingid: existData ? existData.assetmappingid : null,
          tenantid: this.userstoragedata.tenantid,
          cloudprovider: data ? data.cloudprovider : null,
          resourcetype: data ? data.instancetype : null,
          resourceid: data ? data.instanceid : null,
          resourcerefid: data ? data.instancerefid: null,
          customerid: element,
          status: this.removedItems.includes(element)
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
          createdby: !_.isEmpty(this.userstoragedata)
            ? this.userstoragedata.fullname
            : null,
          createddt: new Date(),
          lastupdatedby: !_.isEmpty(this.userstoragedata)
            ? this.userstoragedata.fullname
            : null,
          lastupdateddt: new Date(),
        };
        formData.push(obj);
      });
      this.assetService.bulkUpdate(formData).subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response && response.status) {
            this.message.success(response.message);
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
}
