import { NgModule } from "@angular/core";

import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);

import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { ParametersService } from "./parameters.service";
import { ParametersRoutingModule } from "./parameters.routing";
import { SharedModule } from "../../../modules/shared/shared.module";

@NgModule({
  imports: [ParametersRoutingModule, SharedModule],
  declarations: [],
  providers: [
    HttpHandlerService,
    ParametersService,
    { provide: NZ_I18N, useValue: en_US },
  ],
})
export class ParametersModule {}
