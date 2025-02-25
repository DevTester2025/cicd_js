import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { AssetsService } from "../assets/assets.service";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import * as _ from "lodash";

@Component({
  selector: "app-cloudmatiq-product-add-edit",
  templateUrl: "../../base/product/addedit-product.component.html",
})
export class AddEditProductComponent implements OnInit {
  @Input() productObj: any;
  @Output() notifyProductEntry: EventEmitter<any> = new EventEmitter();
  productForm: FormGroup;
  buttonText = "Save";
  formdata: any = {};
  productData = {} as any;
  productList: any[] = [];
  userstoragedata: any;
  tabIndex = 0 as number;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private assetService: AssetsService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PRODUCTS,
    });
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }

  ngOnInit() {
    this.clearForm();
  }

  clearForm() {
    this.productForm = this.fb.group({
      productname: [null, Validators.required],
      productcode: [null, Validators.required],
      servertype: [null, Validators.required],
      status: [""],
    });
    this.productObj = {};
  }
  initFrom() {
    this.productForm = this.fb.group({
      productname: [null, Validators.required],
      productcode: [null, Validators.required],
      servertype: [null, Validators.required],
      status: [null],
    });
    this.productObj = {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initFrom();
    if (
      !_.isUndefined(changes.productObj) &&
      !_.isEmpty(changes.productObj.currentValue)
    ) {
      this.productObj = changes.productObj.currentValue;
      this.productForm.controls["status"].setValue(
        this.productObj.status === "Active" ? true : false
      );
      this.productForm.patchValue({
        ...this.productObj,
        status: this.productObj["status"] === "Active" ? true : false,
      });
    }
  }

  saveUpdateProduct() {
    if (this.productForm.valid) {
      let response = {} as any;
      if (
        this.productObj &&
        this.productObj.productid != null &&
        this.productObj.productid != undefined
      ) {
        let updateObj: any = {
          productid: this.productObj.productid,
          productname: this.productForm.value.productname,
          productcode: this.productForm.value.productcode,
          servertype: this.productForm.value.servertype,
          status:
            this.productForm.value.status === false
            ? AppConstant.STATUS.INACTIVE
            : AppConstant.STATUS.ACTIVE,
          tenantid: this.userstoragedata.tenantid,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };
        this.assetService.update(updateObj).subscribe((res: any) => {
          if (res.status) {
            this.message.success("Updated successfully");
            this.notifyProductEntry.emit(res.data);
            this.productForm.reset();
          }
        });
      } else {
        let data = {
          productname: this.productForm.controls["productname"].value,
          productcode: this.productForm.controls["productcode"].value,
          servertype: this.productForm.controls["servertype"].value,
          status: this.productForm.controls["status"].value,
          customerid: 0,
          tenantid: this.userstoragedata.tenantid,
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
        };
        this.assetService.addProducts(data).subscribe((result) => {
          response = JSON.parse(result._body);
          if (response.status) {
            this.message.success(response.message);
            this.clearForm();
            this.notifyProductEntry.emit(response.data);
          } else {
            this.message.error(response.message);
          }
        });
      }
    }
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }
}
