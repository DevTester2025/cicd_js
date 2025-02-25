import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../app.constant";
import { HttpHandlerService } from "../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class TenantsService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.TENANTS;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint +  this.serviceURL.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(
      url,
      data
    );
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  createSla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.SLA.CREATE,
      data
    );
  }
  updateSla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.SLA.UPDATE,
      data
    );
  }
  allSla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.SLA.FINDALL,
      data
    );
  }
  byIdSla(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.SLA.FINDBYID + id
    );
  }

  // Customers
  allcustomers(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CLIENT.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(
      url,
      data
    );
  }
  customerbyId(id, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CLIENT.FINDBYID + id;
    if (query) {
      url = url + `?` + query;
    }
    return this.httpHandler.GET(url);
  }
  createcustomer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.CREATE,
      data
    );
  }
  updatecustomer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.UPDATE,
      data
    );
  }
  createcustomersla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.SLA,
      data
    );
  }
  updatecustomerlogo(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.UPLOAD,
      data
    );
  }
  // Regions
  allRegions(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.REGIONS.FINDALL;
    if (query) {
      url = url + `?` + query;
    }
    return this.httpHandler.POST(url, data);
  }

  updateCustomerIncidentsla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.INCIDENTSLA.UPDATE,
      data
    );
  }
  updateCustomerAvailabilitysla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.AVAILABILITYSLA.UPDATE,
      data
    );
  }
  updateServicecreditsla(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CLIENT.SERVICECREDITS.UPDATE,
      data
    );
  }
  integrationCreate(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.TENANTSETTINGS.CREATE, data);
  }
  integrationUpdate(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.TENANTSETTINGS.UPDATE, data);
  }
}
