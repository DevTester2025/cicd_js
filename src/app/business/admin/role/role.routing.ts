import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RoleComponent } from "../role/role.component";
import { AuthGuard } from "../../../modules/services/auth-guard.service";
import { AddEditRoleComponent } from "../role/add-edit-role/add-edit-role.component";
import { ViewRoleComponent } from "../role/view-role/view-role.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "roles",
        canActivate: [AuthGuard],
        component: RoleComponent,
        data: {
          title: "Access Management",
        },
      },
      {
        path: "role/create",
        canActivate: [AuthGuard],
        component: AddEditRoleComponent,
        data: {
          title: "Access Management",
        },
      },
      {
        path: "role/edit/:id",
        canActivate: [AuthGuard],
        component: AddEditRoleComponent,
        data: {
          title: "Access Management",
        },
      },
      {
        path: "role/view",
        canActivate: [AuthGuard],
        component: AddEditRoleComponent,
        data: {
          title: "Access Management",
        },
      },
      {
        path: "role/copy",
        canActivate: [AuthGuard],
        component: AddEditRoleComponent,
        data: {
          title: "Access Management",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class RoleRoutingModule {}
