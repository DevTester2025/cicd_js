import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../http-handler.service";
import * as _ from "lodash";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AccessControlCommonService {
  constructor() {}

  getPageAccess(pageID: Number) {
    console.log(pageID);
  }
}
