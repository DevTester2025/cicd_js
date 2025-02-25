import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NgZorroAntdModule, NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);

import { LoginComponent } from "./login.component";
import { LoginService } from "./login.service";
import { LoginRoutingModule } from "./login.routing";

import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { AutofocusDirective } from "./login.directive";

@NgModule({
  imports: [
    LoginRoutingModule,
    CommonModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [LoginComponent, AutofocusDirective],
  providers: [
    LoginService,
    HttpHandlerService,
    AutofocusDirective,
    { provide: NZ_I18N, useValue: en_US },
  ],
})
export class LoginModule {}
