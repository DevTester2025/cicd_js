import { Injectable } from "@angular/core";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";

@Injectable()
export class LoginService {
  // private http: HttpHandlerService,
  constructor(private http: HttpHandlerService) {}

  signinUser(data): Observable<any> {
    return this.http.POST(
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.LOGIN,
      data
    );
  }
  verifyOTP(data): Observable<any> {
    return this.http.POST(
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.VERIFYOTP,
      data
    );
  }
  resendOTP(data): Observable<any> {
    return this.http.POST(
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.RESENDOTP,
      data
    );
  }
  forgotPassword(data): Observable<any> {
    return this.http.POST(
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.FORGOT_PASSWOD,
      data
    );
  }
  resetPassword(data): Observable<any> {
    return this.http.POST(
      AppConstant.API_END_POINT + AppConstant.API_CONFIG.API_URL.RESET_PASSWORD,
      data
    );
  }
}
