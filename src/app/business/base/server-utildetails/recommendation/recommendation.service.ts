import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../../app.constant";
import * as moment from "moment";
import { environment } from "../../../../../environments/environment";
import { HttpHandlerService } from "../../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class RecommendationService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.PREDICTIONSETUP;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.FINDALL, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
}
