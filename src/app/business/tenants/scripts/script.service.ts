import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class ScriptService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.SCRIPTS;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data,query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDBYID + id;
    if (query) url = url + `?` + query;
    return this.httpHandler.GET(url);
  }
}
