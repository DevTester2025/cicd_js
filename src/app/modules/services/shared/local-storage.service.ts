import { Injectable } from "@angular/core";
import { AppConstant } from "../../../app.constant";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  prefix: string = AppConstant.LOCALSTORAGE.STR_PREFIX;
  private userSessionAdded = new Subject<String>();
  constructor() {}
  addItem(key: string, item: any, notify = false) {
    let sType = localStorage.getItem(AppConstant.LOCALSTORAGE.SESSION_TYPE);

    let sessionHandler: Storage;

    if (sType == "ss") {
      sessionHandler = sessionStorage;
    } else {
      sessionHandler = localStorage;
    }
    sessionHandler = localStorage;
    const olddata = sessionHandler.getItem(this.prefix + key);
    if (olddata != null) {
      sessionHandler.removeItem(this.prefix + key);
    }
    sessionHandler.setItem(this.prefix + key, JSON.stringify(item));
    if (notify) {
      this.userSessionAdded.next(item);
    }
  }

  getItem(key: string) {
    let sType = localStorage.getItem(AppConstant.LOCALSTORAGE.SESSION_TYPE);

    let sessionHandler: Storage;

    if (sType == "ss") {
      sessionHandler = sessionStorage;
    } else {
      sessionHandler = localStorage;
    }
    sessionHandler = localStorage;
    const item = localStorage.getItem(this.prefix + key);

    try {
      return JSON.parse(item);
    } catch (error) {
      return item;
    }
  }

  removeItem(key: string) {
    let sType = localStorage.getItem(AppConstant.LOCALSTORAGE.SESSION_TYPE);

    let sessionHandler: Storage;

    if (sType == "ss") {
      sessionHandler = sessionStorage;
    } else {
      sessionHandler = localStorage;
    }
    sessionHandler = localStorage;
    sessionHandler.removeItem(this.prefix + key);
  }

  clearAllItem() {
    let sType = localStorage.getItem(AppConstant.LOCALSTORAGE.SESSION_TYPE);

    let sessionHandler: Storage;

    if (sType == "ss") {
      sessionHandler = sessionStorage;
    } else {
      sessionHandler = localStorage;
    }
    sessionHandler = localStorage;
    localStorage.clear();
    sessionStorage.clear();

    sessionHandler.clear();
  }

  getUserSessionData(): Observable<any> {
    return this.userSessionAdded.asObservable();
  }
}
