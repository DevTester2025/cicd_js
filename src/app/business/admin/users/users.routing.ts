import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UsersComponent } from "./users.component";
import { AuthGuard } from "../../../modules/services/auth-guard.service";
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "users",
        canActivate: [AuthGuard],
        component: UsersComponent,
        data: {
          title: "Manage Users",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class UserRoutingModule {}
