import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DeploySolutionComponent } from "./deploysolution/deploysolution.component";
import { DeploymentsListComponent } from "./deploysolution/list/deploysolution-list.component";

import { ALILbViewComponent } from "./alibaba/lb/lb-view/lb-view.component";
import { AuthGuard } from "../../modules/services/auth-guard.service";
import { LbViewComponent } from "./aws/lb/lb-view/lb-view.component";
import { ECL2LbViewComponent } from "./ecl2/lb/lb-view/lb-view.component";
import { InternetgatewayComponent } from "./ecl2/internetgateway/internetgateway.component";
import { FirewallComponent } from "./ecl2/firewall/firewall.component";
import { NetworkComponent } from "./ecl2/network/network.component";
import { AmilistComponent } from "./amilist/amilist.component";
import { LblistComponent } from "./lblist/lblist.component";
import { CloudAssetComponent } from "./cloudassets/cloudasset.component";
import { CommongatewayComponent } from "./ecl2/commongateway/commongateway.component";
import { InterconnectivityComponent } from "./ecl2/interconnectivity/interconnectivity.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "deploysolution",
        canActivate: [AuthGuard],
        component: DeploySolutionComponent,
        data: {
          title: "Deploy Solution",
        },
      },
      {
        path: "deploysolution/:id",
        canActivate: [AuthGuard],
        component: DeploySolutionComponent,
        data: {
          title: "Deploy Solution",
        },
      },
      {
        path: "server/list",
        canActivate: [AuthGuard],
        component: DeploymentsListComponent,
        data: {
          title: "Deployed Systems",
        },
      },
      {
        path: "loadbalancers/list",
        canActivate: [AuthGuard],
        component: LblistComponent,
        data: {
          title: "Load Balancers",
        },
      },
      {
        path: "loadbalancers/view/:id",
        canActivate: [AuthGuard],
        component: LbViewComponent,
        data: {
          title: "Load Balancers",
        },
      },
      {
        path: "ami/list",
        canActivate: [AuthGuard],
        component: AmilistComponent,
        data: {
          title: "Virtual Machine",
        },
      },
      {
        path: "loadbalancers/ecl2/view/:id",
        canActivate: [AuthGuard],
        component: ECL2LbViewComponent,
        data: {
          title: "Load Balancers",
        },
      },
      //other cloud assets
      {
        path: "cloudassets",
        canActivate: [AuthGuard],
        component: CloudAssetComponent,
        data: {
          title: "Other Cloud Assets",
        },
      },
      // Internet Gateway
      {
        path: "internetgateway/list",
        canActivate: [AuthGuard],
        component: InternetgatewayComponent,
        data: {
          title: "Internet Gateway",
        },
      },
      // Firewall
      {
        path: "firewall/list",
        canActivate: [AuthGuard],
        component: FirewallComponent,
        data: {
          title: "Firewall",
        },
      },
      // Networks
      {
        path: "network/list",
        canActivate: [AuthGuard],
        component: NetworkComponent,
        data: {
          title: "Logical Network",
        },
      },
      // Common Function gateway
      {
        path: "gateway/list",
        canActivate: [AuthGuard],
        component: CommongatewayComponent,
        data: {
          title: "Common Function Gateway",
        },
      },
      // Inter-connectivity
      {
        path: "interconnectivity",
        canActivate: [AuthGuard],
        component: InterconnectivityComponent,
        data: {
          title: "Inter Connectivity",
        },
      },
      // Alibaba loadbalancer view
      {
        path: "loadbalancers/ali/view/:id",
        canActivate: [AuthGuard],
        component: ALILbViewComponent,
        data: {
          title: "Load Balancers",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class DeploymentsRoutingModule {}
