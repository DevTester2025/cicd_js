import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../modules/services/auth-guard.service";

import { MonitoringSyntheticsComponent } from "./synthetics/synthetics.component";
import { MonitoringSyntheticsDetailsComponent } from "./synthetics/details/synthetic-details.component";
import { MonitoringChartComponent } from './synthetics/monitoring-chart/monitoring-chart.component';
import { SslComponent } from './ssl/ssl.component';

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "monitoring-synthetics",
        component: MonitoringSyntheticsComponent,
        data: {
          title: "Synthetic monitoring",
        },
      },
      {
        path: "monitoring-synthetics/:id",
        component: MonitoringSyntheticsDetailsComponent,
        data: {
          title: "Synthetic monitoring",
        },
      },
      {
        path: "monitoring-ssl",
        component: SslComponent,
        data: {
          title: "SSL Monitoring"
        }
      },
      {
        path: "monitoring/synthetics/:id",
        component: MonitoringChartComponent,
        data: {
          title: 'Synthetic monitoring'
        }
      }
    ]),
  ],
  exports: [RouterModule],
})
export class MonitoringRoutingModule { }
