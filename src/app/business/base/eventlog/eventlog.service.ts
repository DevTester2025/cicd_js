import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class EventLogService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.EVENTLOG;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url = url + '?' + query;
    console.log(url);
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  delete(id): Observable<any> {
    return this.httpHandler.DELETE(this.endpoint + this.serviceURL.DELETE + id);
  }
}
