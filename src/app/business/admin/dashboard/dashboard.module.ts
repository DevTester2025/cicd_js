import { NgModule } from "@angular/core";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);

import { DashboardComponent } from "../dashboard/dashboard.component";
import { DashboardRoutingModule } from "../dashboard/dashboard.routing";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { SharedModule } from "../../../modules/shared/shared.module";

@NgModule({
  imports: [DashboardRoutingModule, SharedModule],
  declarations: [DashboardComponent],
  providers: [HttpHandlerService, { provide: NZ_I18N, useValue: en_US }],
  exports: [DashboardComponent],
})
export class DashboardModule {}
