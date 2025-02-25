import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../../app.constant";
import * as moment from "moment";
import { environment } from "../../../../../environments/environment";
import { HttpHandlerService } from "../../../../modules/services/http-handler.service";
@Injectable({
  providedIn: "root",
})
export class BudgetService {
  endpoint: string;
  serviceURL: typeof AppConstant.API_CONFIG.API_URL.BASE.BUDGETSETUP;
  serviceMappingURL: any;
  billingServiceURL: typeof AppConstant.API_CONFIG.API_URL.BASE.BILLING;
  dailybillingServiceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.BUDGETSETUP;
    this.billingServiceURL = AppConstant.API_CONFIG.API_URL.BASE.BILLING;
    this.dailybillingServiceURL =
      AppConstant.API_CONFIG.API_URL.BASE.DAILYBILLING;
  }
  dailybillings(data, query?): Observable<any> {
    let url = this.endpoint + this.dailybillingServiceURL.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  list(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  billingList(data, query?): Observable<any> {
    let url = this.endpoint + this.billingServiceURL.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  summary(data, query?): Observable<any> {
    let url = this.endpoint + this.billingServiceURL.SUMMARY;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  downloadbudget(data): Observable<any> {
    let url = this.endpoint + this.serviceURL.DOWNLOAD;
    return this.httpHandler.POST(url, data);
  }
}
