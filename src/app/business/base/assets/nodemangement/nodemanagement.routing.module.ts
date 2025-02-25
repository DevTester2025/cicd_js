import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "src/app/modules/services/auth-guard.service";
import { NodeManagementComponent } from "./node-management.component";
const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "nodemanager",
        canActivate: [AuthGuard],
        component: NodeManagementComponent,
        data: {
          title: "Node Manager",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class NodeManagementRoutingModule {}
