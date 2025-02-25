import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ParametersComponent } from "./parameters.component";
import { AuthGuard } from "../../../modules/services/auth-guard.service";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "parameters",
        canActivate: [AuthGuard],
        component: ParametersComponent,
        data: {
          title: "Parameters",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ParametersRoutingModule {}
