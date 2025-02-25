import { NgModule } from "@angular/core";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);
import { SolutionRoutingModule } from "./solution.router";
import { SharedModule } from "../../../modules/shared/shared.module";
import { SolutionListComponent } from "./list-solution/solutiontemplatelist.component";
import { SolutionAddEditComponent } from "./add-edit-solution/solution-add-edit.component";
import { SolutionService } from "./solution.service";
import { SolutiongraphComponent } from "./solutiongraph/solutiongraph.component";
// import { CostsummaryComponent } from './costsummary/costsummary.component';
// import { AddeditcostsComponent } from './costsummary/addeditcosts/addeditcosts.component';

@NgModule({
  imports: [SharedModule],
  declarations: [
    SolutionAddEditComponent,
    SolutionListComponent,
    SolutiongraphComponent,
    // CostsummaryComponent,
    // AddeditcostsComponent
  ],
  providers: [SolutionService, { provide: NZ_I18N, useValue: en_US }],
  exports: [SolutionRoutingModule],
})
export class SolutionModule {}
