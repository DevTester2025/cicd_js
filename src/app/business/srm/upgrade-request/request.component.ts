import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../app.constant";

@Component({
  selector: "app-upgrade-request",
  templateUrl:
    "../../../presentation/web/srm/upgrade-request/request.component.html",
})
export class UpgradeRequestComponent implements OnInit {
  showTab = 1;
  userstoragedata = {} as any;
  rolename = "";
  loading = true;
  constructor(private localStorageService: LocalStorageService) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.rolename = this.userstoragedata.roles.rolename;
  }
  ngOnInit() {}
  onTabChange(event) {
    this.showTab = event;
  }
  notifyEntry(event) {
    this.loading = event;
  }
}
