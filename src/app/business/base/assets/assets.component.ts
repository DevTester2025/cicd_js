import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
} from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-assets",
  templateUrl: "../../../presentation/web/base/assets/assets.component.html",
})
export class AssetsComponent implements OnInit {
  screens = [];
  appScreens = {} as any;

  current = "list";

  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_MANAGEMENT,
    } as any);
  }

  ngOnInit() {
    let assetParams = this.route.snapshot.queryParams;
    if (assetParams && assetParams.mode) {
      this.current = "list";
    }
  }

  changeView(to: string) {
    this.current = to;
  }
}
