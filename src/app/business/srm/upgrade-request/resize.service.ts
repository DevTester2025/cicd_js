import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { AppConstant } from "../../../app.constant";

@Injectable()
export class ResizeRequestService {
  endpoint: string;
  serviceURL: any;
  SeduleServiceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.RESIZE_REQUEST;
    this.SeduleServiceURL = AppConstant.API_CONFIG.API_URL.SCHEDULE_REQUEST;
  }
  allRequest(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.FINDALL, data);
  }
  createRequest(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  updateRequest(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  bulkUpdateRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BULK_UPDATE,
      data
    );
  }
  bulkCreateRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BULK_CREATE,
      data
    );
  }

  //schedule requests
  allSeduleRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.SeduleServiceURL.FINDALL,
      data
    );
  }
  createSeduleRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.SeduleServiceURL.CREATE,
      data
    );
  }
  updateSeduleRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.SeduleServiceURL.UPDATE,
      data
    );
  }
  bySeduleId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.SeduleServiceURL.FINDBYID + id
    );
  }
}
