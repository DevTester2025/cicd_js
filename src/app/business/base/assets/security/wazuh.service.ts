import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpHandlerService } from "../../../../modules/services/http-handler.service";
import { AppConstant } from "../../../../app.constant";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable()
export class WazuhService {
    endpoint: string;
    constructor(private httpHandler: HttpHandlerService, private sanitizer: DomSanitizer) {
        this.endpoint = AppConstant.API_END_POINT;
    }
    getToken(data): Observable<any> {
        return this.httpHandler.POST(
            this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.WAZHU.GETTOKEN,
            data
        );
    }
    getData(data): Observable<any> {
        return this.httpHandler.POST(
            this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.WAZHU.GETDATA,
            data
        );
    }
    getAgent(data): Observable<any> {
        return this.httpHandler.POST(
            this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.WAZHU.GETAGENT,
            data
        );
    }
    updateWazhuAgent(data): Observable<any> {
        return this.httpHandler.POST(
            this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.WAZHU.UPDATEWAZUHAGENT,
            data
        );
}
}
