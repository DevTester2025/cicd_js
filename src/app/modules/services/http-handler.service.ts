import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { catchError, map } from 'rxjs/internal/operators';
import { HttpErrorResponse } from '@angular/common/http';
// import 'rxjs/Rx';
import { Observable, of } from "rxjs";
import { AppConstant } from "../../../app/app.constant";
import { LocalStorageService } from "./shared/local-storage.service";
import { Router } from "@angular/router";

@Injectable()
export class HttpHandlerService {
  constructor(
    public route: Router,
    private http: Http,
    private localStorageService: LocalStorageService
  ) { }

  GET(url: string, query?: any): Observable<any> {
    let token = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.TOKEN
    );
    let headers;
    if (token) {
      headers = {
        "x-auth-header": token,
      };
    }

    return this.http.get(url, {
      headers: {
        ...headers,
      },
    }).pipe(
      catchError(this.handleError)
    );
  }

  POST(url: string, data: any, options?: any, query?: any): Observable<any> {
    let token = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.TOKEN
    );
    let headers;
    if (token) {
      headers = {
        "x-auth-header": token,
      };
    }

    if (options) {
      return this.http.post(url, data, { headers: { ...options, ...headers } }).pipe(
        catchError(this.handleError)
      );
    } else {
      return this.http.post(url, data, { headers: { ...headers } }).pipe(
        catchError(this.handleError)
      );
    }
  }
  handleError(error: HttpErrorResponse): any {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
      return of(error);
    } else if (error.status == 403) {
      document.getElementById("sessionExpired").className = "session-expired-class";
      document.getElementById("sessionExpired-dialog").className = "session-expired-class";
    }
  }
  DELETE(url: string, options?: any): Observable<any> {
    let token = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.TOKEN
    );
    let headers;
    if (token) {
      headers = {
        "x-auth-header": token,
      };
    }

    if (options) {
      return this.http.delete(url, { headers: { ...options, ...headers } }).pipe(
        catchError(this.handleError)
      );;
    } else {
      return this.http.delete(url, { headers: { ...headers } }).pipe(
        catchError(this.handleError)
      );;
    }
  }
}
