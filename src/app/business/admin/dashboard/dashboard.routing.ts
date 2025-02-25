import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { AuthGuard } from "../../../modules/services/auth-guard.service";
@NgModule({
  imports: [
    RouterModule.forChild([
      // {
      //     path: 'dashboard', canActivate: [AuthGuard], component: DashboardComponent, data: {
      //         title: 'Dashboard'
      //     }
      // }
    ]),
  ],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
