import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Routes } from "@angular/router";
import { LoginComponent } from "./login.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "login", component: LoginComponent },
      { path: "resetpassword", component: LoginComponent },
    ]),
  ],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
