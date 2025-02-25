import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../http-handler.service";
import { FormGroup, FormControl, FormArray } from "@angular/forms";
import * as _ from "lodash";
import * as moment from "moment";
@Injectable({
  providedIn: "root",
})
export class CommonService {
  endpoint: string;
  serviceURL: any;
  private instanceDetails: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
  }
  public allTenants(data) {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.FINDALL,
      data
    );
  }
  public allSystemRules(data) {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.FINDALL,
      data
    );
  }
  public allCustomers(data, query?) {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  public allCustomerAccount(data, query?) {
    let url =
      this.endpoint +
      AppConstant.API_CONFIG.API_URL.TENANTS.CUSTOMER_ACCOUNT.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  public allUsers(data, query?) {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.USERS.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  public allLookupValues(data) {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.LOOKUP.FINDALL,
      data
    );
  }
  public getFormErrorMessage(formGroupObj: FormGroup, errorObj: any) {
    for (const key in formGroupObj.controls) {
      if (formGroupObj.controls.hasOwnProperty(key)) {
        const formControlObj = formGroupObj.controls[key];
        if (formControlObj instanceof FormControl) {
          if (formControlObj.errors) {
            return errorObj[key][Object.keys(formControlObj.errors)[0]];
          }
        }
      }
    }
  }

  getFormErrorMessageWithFormArray(
    formGroupObj: any,
    errorObj: any,
    name: string
  ) {
    let formControlObj = {} as any;
    let pickedData = {} as any;
    for (let i in formGroupObj.controls) {
      if (formGroupObj.controls.hasOwnProperty(i)) {
        formControlObj = formGroupObj.controls[i];
        pickedData = _.get(formGroupObj.controls, name);
        if (
          formControlObj instanceof FormControl &&
          pickedData != formControlObj
        ) {
          if (formControlObj.errors) {
            return errorObj[i][Object.keys(formControlObj.errors)[0]];
          }
        } else if (
          pickedData == formControlObj &&
          formControlObj instanceof FormArray
        ) {
          for (let k = 0; k < formControlObj.controls.length; k++) {
            let newFormControlObj = _.get(
              formControlObj.controls[k],
              "controls"
            );
            for (let j in newFormControlObj) {
              if (newFormControlObj.hasOwnProperty(j)) {
                var newControlObj = newFormControlObj[j];
                if (newControlObj instanceof FormControl) {
                  if (newControlObj.errors) {
                    return errorObj[j][Object.keys(newControlObj.errors)[0]];
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  formatCurrency(currency, value) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  }

  formatResourceType(name, provider) {
    if (name == "All") {
      return name;
    } else {
      if (provider === AppConstant.CLOUDPROVIDER.AWS) {
        let obj: any = _.find(AppConstant.AWS_BILLING_RESOURCETYPES, {
          value: name,
        });
        if (obj !== undefined) {
          return obj.title;
        }
      }
      if (provider === AppConstant.CLOUDPROVIDER.ECL2) {
        let obj: any = _.find(AppConstant.ECL2_BILLING_RESOURCETYPES, {
          value: name,
        });
        if (obj !== undefined) {
          return obj.title;
        }
      }
    }
  }

  getFileType(file) {
    if ((file.match(/\.(jpeg|jpg|gif|png)$/) != null) === false) {
      const isdownload = true;
      return isdownload;
    } else {
      return false;
    }
  }

  getDashboard(data) {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.DASHBOARD,
      data
    );
  }

  getMonthlyPrice(
    pricings,
    pricingmodel,
    priceperunit,
    currency,
    withoutcurrecy?
  ) {
    let totalcosts: any = 0;
    let monthlyValue: any = _.find(pricings, {
      keyname: AppConstant.LOOKUPKEY.MONTHLY,
    });
    let matchingValue: any = _.find(pricings, { keyname: pricingmodel });
    if (matchingValue != undefined) {
      let priceperhour = (
        Number(priceperunit) / Number(matchingValue.keyvalue)
      ).toFixed(2);
      totalcosts = (
        Number(priceperhour) * Number(monthlyValue.keyvalue)
      ).toFixed(2);
    }
    if (withoutcurrecy) {
      return parseFloat(totalcosts).toFixed(2);
    } else {
      totalcosts = currency + " " + parseFloat(totalcosts).toFixed(2);
      return totalcosts;
    }
  }

  calculateRecommendationPrice(
    pricingmodel,
    priceperunit,
    currency,
    withoutcurrecy?
  ) {
    let totalcosts: any = 0;
    if (pricingmodel == "Daily") {
      totalcosts = parseFloat(priceperunit) * 30;
    } else if (pricingmodel == "Hourly") {
      totalcosts = parseFloat(priceperunit) * 24 * 30;
    } else if (pricingmodel == "Monthly") {
      totalcosts = parseFloat(priceperunit);
    }
    if (withoutcurrecy) {
      return parseFloat(totalcosts).toFixed(2);
    } else {
      return currency + " " + parseFloat(totalcosts).toFixed(2);
    }
  }
  public convertBytes(x) {
    const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let l = 0,
      n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
  }
  public allInstances(data, query?) {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.INSTANCE.FINDALL;
    if (query) {
      url = url + "?" + query;
    }
    return this.httpHandler.POST(url, data);
  }
  public instancechart(data, query?) {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.INSTANCE.CHART;
    if (query) {
      url = url + "?" + query;
    }
    return this.httpHandler.POST(url, data);
  }
  public getInstance(id, query?) {
    let url =
      this.endpoint +
      AppConstant.API_CONFIG.API_URL.TENANTS.INSTANCE.FINDBYID +
      id;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.GET(url);
  }

  public getServerUtil(data, asstutldtl?: boolean) {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.NM.SERVER_UTL.REPORT;
    if (asstutldtl) url += "?type=asstutldtl";
    return this.httpHandler.POST(url, data);
  }
  checkTagValidity(value) {
    if (value.cloudprovider == AppConstant.CLOUDPROVIDER.AWS) {
      var date1 = new Date(value.createddt);
      var date2 = new Date();
      var Difference_In_Time = date2.getTime() - date1.getTime();
      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      if (Difference_In_Days > 1) {
        return true;
      }
      return false;
    }
  }
  public getDataCollectionReport(data, asstutldtl?: boolean) {
    let url =
      this.endpoint +
      AppConstant.API_CONFIG.API_URL.NM.SERVER_UTL.DATACOLS_REPORT;
    return this.httpHandler.POST(url, data);
  }

  public updatedInstance(data) {
    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.INSTANCE.UPDATE;
    return this.httpHandler.POST(url, data);
  }
  
  public syncTags(data) {
    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.OTHER.AWSTAGUPDATE;
    return this.httpHandler.POST(url, data);
  }
  getTenantSettings(data) {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.TENANTSETTINGS.FINDALL,
      data
    );
  }

  setInstanceDetails(data){
    this.instanceDetails = data;
  }
  getInstanceDetails(){
    return this.instanceDetails
  }

}
