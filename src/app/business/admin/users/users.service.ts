import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { AppConstant } from "../../../app.constant";
@Injectable()
export class UsersService {
  endpoint: string;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
  }
  allUsers(data, query?): Observable<any> {
    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERS.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(
      url,
      data
    );
  }
  createUser(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERS.CREATE,
      data
    );
  }
  updateUser(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERS.UPDATE,
      data
    );
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERS.FINDBYID + id
    );
  }
  allUserRoles(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERROLES.FINDALL,
      data
    );
  }
  createRole(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERROLES.CREATE,
      data
    );
  }
}
