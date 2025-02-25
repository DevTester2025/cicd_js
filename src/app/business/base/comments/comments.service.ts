import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class CommentsService {
  endpoint: string;
  serviceURL: any;
  historyURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.COMMENTS;
    this.historyURL = AppConstant.API_CONFIG.API_URL.HISTORY
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }

  download(data): Observable<any>{
    return this.httpHandler.POST(this.endpoint + this.serviceURL.DOWNLOAD, data);
  }      
  upload(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPLOAD, data);
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

  historyList(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.historyURL.FINDALL, data);
  }
  historyCreate(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.historyURL.CREATE, data);
  }
  historyUpdate(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.historyURL.UPDATE, data);
  }
}
