import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class KPIReportingService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.KPITREPORTING;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url =url + '?' + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  delete(id): Observable<any> {
    return this.httpHandler.DELETE(this.endpoint + this.serviceURL.DELETE + id);
  }
  alldetails(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.DETAILS.FINDALL;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  detailsbyId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.DETAILS.FINDBYID + id
    );
  }
  updatedetails(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.DETAILS.UPDATE,
      data
    );
  }

  // customer kpi

  customerkpiall(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CUSTOMER.FINDALL;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }

  customerkpiupdate(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CUSTOMER.UPDATE,
      data
    );
  }

  customerkpibulkcreate(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CUSTOMER.BULKCREATE,
      data
    );
  }

  customerkpibulkupdate(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CUSTOMER.BULKUPDATE,
      data
    );
  }
}
