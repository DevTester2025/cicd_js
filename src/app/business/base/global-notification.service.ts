import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpHandlerService } from "../../modules/services/http-handler.service";
import { AppConstant } from "../../app.constant";

export interface INotification {
  eventtype: string;
  modeofnotification: string;
  configuration: string;
  notificationid: number;
  tenantid: number;
  solutionid: null;
  userid: number;
  content: string;
  title: string;
  deliverystatus: string;
  notes: string;
  interval: null;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: string;
  lastupdateddt: Date;
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  endpoint: string;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
  }
  all(data, query?): Observable<any> {

    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATIONS.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(
      url,
      data
    );
  }
  createUser(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATIONS.CREATE,
      data
    );
  }
  updateUser(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATIONS.UPDATE,
      data
    );
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATIONS.FINDBYID + id
    );
  }
  updateTxn(id, body): Observable<any> {
    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATIONS.UPDATETXN + id;
    return this.httpHandler.POST(url,body);
  }
  bulkResolve(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATIONS.BULKRESOLVE,
      data
    );
  }
}
