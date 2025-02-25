import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocalStorageService } from 'src/app/modules/services/shared/local-storage.service';
import { NotificationService } from '../global-notification.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppConstant } from 'src/app/app.constant';
import * as _ from "lodash";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styles: [
    `
      #ntfid div {
        color: #fff;
        font-size: 13px;
        padding: 10px;
        font-family: "Open Sans", sans-serif;
      }
    `,
  ],
})
export class NotificationsComponent implements OnInit {
  @Input () selectedNotification : any;
  resolutionnotes = "";
  screens = [];
  userstoragedata = {} as any;
  appScreens = {} as any;
  updateAlert = false;
  canResolve = true;
  notificationList = [];
  constructor(
    private localStorageService: LocalStorageService,
    private notificationService: NotificationService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
   }

  ngOnInit() {
    this.getAllNotifications();
  }

  updateNtf() {
    if (this.resolutionnotes == "") {
      this.message.error(AppConstant.VALIDATIONS.NOTIFICATION.notes.required);
      return false;
    }
    this.updateAlert = true;
    this.notificationService
      .updateTxn(this.selectedNotification.txnid, {
        referenceno: this.selectedNotification.referenceno,
        referenceid: this.selectedNotification.referenceid,
        notes: this.resolutionnotes,
        lastupdatedby: this.userstoragedata.fullname,
      })
      .subscribe(
        (result) => {
          this.updateAlert = false;
          this.selectedNotification.txnstatus = AppConstant.TXNSTATUS[0].value;
          this.selectedNotification.noted = this.resolutionnotes;
          this.resolutionnotes = "";
          this.getAllNotifications();
          this.message.success(AppConstant.VALIDATIONS.NOTIFICATION.RESLOVEDMSG);
        },
        (err) => {
          this.updateAlert = false;
          this.message.error(AppConstant.VALIDATIONS.NOTIFICATION.RESLOVEDERRMSG);
        }
      );
  }
  getAllNotifications() {
    let reqObj: any = {
      tenantid: this.userstoragedata.tenantid,
    };
      this.notificationService.all(reqObj).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.notificationList = [];
          this.notificationList = response.data.rows;
        } else {
          this.notificationList = [];
        }
      });
  }
}

