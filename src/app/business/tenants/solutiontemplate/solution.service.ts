import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable()
export class SolutionService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.SOLUTIONS;
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
    return this.httpHandler.POST(
      url,
      data
    );
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  graph(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.GRAPH + id);
  }
  ecl2byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.ECL2BYID + id);
  }
  clone(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CLONE, data);
  }
  alibabaById(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ALIBABABYID + id
    );
  }
  allcosts(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.COSTS.FINDALL,
      data
    );
  }
  bulkcreatecosts(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.COSTS.BULKCREATE,
      data
    );
  }
  createcost(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.COSTS.CREATE,
      data
    );
  }
  updatecost(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.COSTS.UPDATE,
      data
    );
  }
}
