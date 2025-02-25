import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import * as _ from "lodash";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CustomerAccountService } from "../customer-account.service";
import { NzMessageService } from "ng-zorro-antd";
@Component({
  selector: "app-add-edit-customer-account",
  templateUrl:
    "../../../../presentation/web/tenant/customers/add-edit-customer-account/add-edit-customer-account.html",
})
export class AddEditCustomerAccountComponent implements OnInit, OnChanges {
  @Input() accountObj: any = {};
  @Input() customer: Record<string, any>;
  @Output() done: EventEmitter<any> = new EventEmitter();
  userstoragedata: any = {};

  accountForm: FormGroup;
  savingAccount: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private customerAccountService: CustomerAccountService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.initForm();
  }

  ngOnInit() {}
  initForm() {
    this.accountForm = this.fb.group({
      name: [null, Validators.required],
      rolename: [null, Validators.required],
      accountref: [null, Validators.required],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.accountObj) &&
      !_.isEmpty(changes.accountObj.currentValue)
    ) {
      this.accountForm = this.fb.group({
        name: [changes.accountObj.currentValue.name, Validators.required],
        rolename: [
          changes.accountObj.currentValue.rolename,
          Validators.required,
        ],
        accountref: [
          changes.accountObj.currentValue.accountref,
          Validators.required,
        ],
      });
    } else {
    }
  }

  saveAccount() {
    if (this.accountForm.valid) {
      let data = {
        tenantid: this.customer.tenantid,
        name: this.accountForm.get("name").value,
        rolename: this.accountForm.get("rolename").value,
        cloudprovider: "AWS",
        customerid: this.customer.customerid,
        accountref: this.accountForm.get("accountref").value,
        status: "Active",
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      } as any;

      console.log(this.userstoragedata);
      console.log(data);

      this.savingAccount = true;

      if (this.accountObj && this.accountObj.id) {
        this.customerAccountService
          .update({
            id: this.accountObj.id,
            ...data,
          })
          .subscribe(
            (d) => {
              this.savingAccount = false;
              this.done.emit(true);
            },
            (err) => {
              this.savingAccount = false;
              console.log(err);
              this.message.error("Unable to save account.");
            }
          );
      } else {
        data = {
          ...data,
          createdby: this.userstoragedata.fullname,
          createddt: new Date(),
        };
        this.customerAccountService.create(data).subscribe(
          (d) => {
            this.savingAccount = false;
            this.done.emit(true);
          },
          (err) => {
            this.savingAccount = false;
            console.log(err);
            this.message.error("Unable to save account.");
          }
        );
      }
    } else {
      this.message.error("Form not valid.");
    }
  }
}
