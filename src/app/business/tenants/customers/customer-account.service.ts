import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class CustomerAccountService {
  endpoint: string;
  serviceURL: typeof AppConstant.API_CONFIG.API_URL.TENANTS.CUSTOMER_ACCOUNT;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.TENANTS.CUSTOMER_ACCOUNT;
  }
  create(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CREATE;
    if (query) url += `?${query}`;
    return this.httpHandler.POST(url, data);
  }
  update(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.UPDATE;
    if (query) url += `?${query}`;
    return this.httpHandler.POST(url, data);
  }
  all(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.FINDALL, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
}
