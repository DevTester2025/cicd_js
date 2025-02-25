import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { NotificationService } from "src/app/business/base/global-notification.service";
import { Observable, Subscription, timer } from "rxjs";

@Component({
  selector: "app-notification-banner",
  styleUrls: ["../customer-dashboard.component.css"],
  templateUrl:
    "../../../../../presentation/web/tenant/customers/customer-dashboard/notification-banner/notification-banner.component.html",
})
export class NtfBannerComponent implements OnInit {
  @Input() customerid;
  userstoragedata = {} as any;
  ntfList = [];
  ntfObj = {} as any;
  isSpinning = true;
  everySecond: Observable<number> = timer(1000, 2000);
  private subscription: Subscription;

  constructor(
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.subscription = this.everySecond.subscribe((seconds) => {
      this.updateCounter();
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getNtfList();
  }
  getNtfList() {
    let reqObj: any = {
      customerid: this.customerid,
    };
    this.notificationService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);

      if (response.status) {
        this.ntfList = response.data;
        this.ntfObj = response.data.length > 0 ? response.data[0] : {};
        if (!_.isEmpty(this.ntfList)) {
          this.updateCounter();
        }
      }
    });
  }
  updateCounter() {
    // setTimeout(() => {
    let difference = 0;
    _.map(this.ntfList, (itm) => {
      if (itm.implementationdt != null) {
        difference = moment(itm.implementationdt).diff(moment());
        var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((difference % (1000 * 60)) / 1000);

        itm.timer =
          days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
      }
      if (difference < 0) {
        itm.timer = "EXPIRED";
      }
      return itm;
    });
    this.ntfList = [...this.ntfList];
    // }, 1);
  }
}
