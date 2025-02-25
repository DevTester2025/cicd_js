import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { AppConstant } from "../../../app.constant";
@Injectable()
export class RoleService {
  endpoint: string;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
  }
  allRoles(data,query?): Observable<any> {
    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERROLES.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(
      url,
      data
    );
  }
  createRole(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERROLES.CREATE,
      data
    );
  }
  updateRole(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERROLES.UPDATE,
      data
    );
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint +
        AppConstant.API_CONFIG.API_URL.TENANTS.USERROLES.FINDBYID +
        id
    );
  }
  allScreens(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.SCREENS.FINDALL,
      data
    );
  }
  allScreenActions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.SCREENS.FINDALL,
      data
    );
  }
  allRoleAccess(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.ROLEACCESS.FINDALL,
      data
    );
  }
}
