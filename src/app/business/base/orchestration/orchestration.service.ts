import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class OrchestrationService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.ORCH_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.ORCHESTRATION;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  checkConnect(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CHECK_CONNECTION, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data,query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
}
