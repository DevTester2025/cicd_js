import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Injectable({
    providedIn: "root",
})
export class CicdDashboardService {
    endpoint: string;
    serviceURL: any;
    constructor(private httpHandler: HttpHandlerService) {
        this.endpoint = AppConstant.API_END_POINT;
        this.serviceURL = AppConstant.API_CONFIG.API_URL.CICD.DASHBOARD.COUNT;
    }
    getCount(tenantid: number): Observable<any> {
        return this.httpHandler.POST(this.endpoint + this.serviceURL, { tenantid });
      }
}
