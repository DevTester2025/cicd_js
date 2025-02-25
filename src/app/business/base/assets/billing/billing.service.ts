import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../../app.constant";
import * as moment from "moment";
import { environment } from "../../../../../environments/environment";
import { HttpHandlerService } from "../../../../modules/services/http-handler.service";
@Injectable({
  providedIn: "root",
})
export class BillingService {
  endpoint: string;
  serviceURL: typeof AppConstant.API_CONFIG.API_URL.BASE.BILLING;
  serviceMappingURL: any;
  billingServiceURL: any;
  dailybillingServiceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.BILLING;
  }
  list(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getFilterValue(query, data?): Observable<any> {
    let body = {};
    let url = this.endpoint + this.serviceURL.FILTER_VALUES + "?key=";
    if (query) {
      url += query;
    }
    if(data){
      body = data;
    }
    return this.httpHandler.POST(url, body);
  }
  getDrillDown(body: Record<string, any>): Observable<any> {
    let url = this.endpoint + this.serviceURL.RESOURCE_BILLING;

    return this.httpHandler.POST(url, body);
  }
}
