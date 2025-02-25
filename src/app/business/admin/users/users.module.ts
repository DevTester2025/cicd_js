import { NgModule } from "@angular/core";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);

import { AddEditUserComponent } from "./add-edit-user/add-edit-user.component";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { SharedModule } from "../../../modules/shared/shared.module";
import { UsersComponent } from "../users/users.component";
import { UserRoutingModule } from "../users/users.routing";
import { UsersService } from "../users/users.service";

@NgModule({
  imports: [SharedModule, UserRoutingModule],
  declarations: [AddEditUserComponent, UsersComponent],
  providers: [
    HttpHandlerService,
    UsersService,
    { provide: NZ_I18N, useValue: en_US },
  ],
  exports: [AddEditUserComponent, UsersComponent],
})
export class UserModule {}
