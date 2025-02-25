import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { AppConstant } from 'src/app/app.constant';
import * as _ from "lodash";
import { CustomerAccountService } from 'src/app/business/tenants/customers/customer-account.service';
import { LocalStorageService } from 'src/app/modules/services/shared/local-storage.service';
import { CommonService } from 'src/app/modules/services/shared/common.service';

@Component({
  selector: 'app-add-edit-vm-account',
  templateUrl: './add-edit-vm-account.component.html',
  styleUrls: ['./add-edit-vm-account.component.css']
})
export class AddEditVmAccountComponent implements OnInit {
  @Input() selectedAccount: any = {};
  @Input() customer: Record<string, any>;
  @Input() provider: Record<string, any>;
  @Output() done: EventEmitter<any> = new EventEmitter();
  userstoragedata: any = {};

  accountForm: FormGroup;
  savingAccount: boolean = false;
  showPassword = false;
  versionList = [];
  regionList = [];
  constructor(
    private localStorageService: LocalStorageService,
    private customerAccountService: CustomerAccountService,
    private commonService: CommonService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.getLookups();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.accountForm = this.fb.group({
      domain: [null, Validators.required],
      apiversion: [null, Validators.required],
      region: [null, Validators.required],
      password: [null, Validators.required],
      username: [null, Validators.required],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.customerObj) &&
      !_.isEmpty(changes.customerObj.currentValue)
    ) {
      this.customer = changes.customerObj.currentValue;
    }
    if (
      !_.isUndefined(changes.selectedAccount) &&
      !_.isEmpty(changes.selectedAccount.currentValue)
    ) {
      this.selectedAccount = changes.selectedAccount.currentValue;
      this.getAccount(this.selectedAccount.id);
    }
  }

  getLookups() {
    let response = {} as any;
    this.commonService
      .allLookupValues({
        status: AppConstant.STATUS.ACTIVE,
        keylist: [AppConstant.LOOKUPKEY.VMWARE_VERSION],
      })
      .subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            this.versionList = response.data.filter((el) => { return el.lookupkey == AppConstant.LOOKUPKEY.VMWARE_VERSION });
            // this.regionList = response.data.filter((el) => { return el.lookupkey == AppConstant.LOOKUPKEY.VMWARE_REGIONS });
            this.accountForm.get('apiversion').setValue(this.versionList[0].keyvalue);
          } else {
            this.versionList = [];
          }
        }
      );
  }
  getAccount(id) {
    this.customerAccountService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      let credentials = JSON.parse(response.data.accountref);
      this.accountForm = this.fb.group({
        domain: [response.data.name, Validators.required],
        apiversion: [response.data.apiversion, Validators.required],
        region: [credentials.region, Validators.required],
        password: [credentials.password, Validators.required],
        username: [credentials.username, Validators.required]
      });
    });
  }
  saveAccount() {
    let formdata = this.accountForm.value;
    if (this.accountForm.valid) {
      const data: any = {
        tenantid: this.customer.tenantid,
        name: formdata.domain,
        cloudprovider: this.provider,
        customerid: this.customer.customerid,
        apiversion: formdata.apiversion,
        accountref: JSON.stringify({ username: formdata.username, password: formdata.password, domain: formdata.domain, region: formdata.region }),
        status: "Active",
        createdby: this.userstoragedata.fullname,
        createddt: new Date(),
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };

      this.savingAccount = true;
      if (this.selectedAccount && this.selectedAccount.id) {
        data.id = this.selectedAccount.id;
        this.customerAccountService.update(data, 'encryption="accountref"').subscribe(
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
        this.customerAccountService.create(data, 'encryption="accountref"').subscribe(
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
