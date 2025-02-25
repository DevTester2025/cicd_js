import { NgModule } from "@angular/core";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);

import { AddEditRoleComponent } from "./add-edit-role/add-edit-role.component";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { RoleComponent } from "../role/role.component";
import { RoleRoutingModule } from "../role/role.routing";
import { RoleService } from "../role/role.service";
import { SharedModule } from "../../../modules/shared/shared.module";
import { ViewRoleComponent } from "./view-role/view-role.component";

@NgModule({
  imports: [RoleRoutingModule, SharedModule],
  declarations: [AddEditRoleComponent, RoleComponent, ViewRoleComponent],
  providers: [
    HttpHandlerService,
    RoleService,
    { provide: NZ_I18N, useValue: en_US },
  ],
  exports: [RoleComponent],
})
export class RoleModule {}
