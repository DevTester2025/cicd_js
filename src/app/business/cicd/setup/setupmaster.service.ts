import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class SetupmasterService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.CICD.SETUP;
  }

  createProvider(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.PROVIDER.CREATE,
      data
    );
  }
  updateProvider(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.PROVIDER.UPDATE + id,
      data
    );
  }
  createContainerRegistry(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CONTAINER_REGISTRY.CREATE,
      data
    );
  }
  updateContainerRegistry(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CONTAINER_REGISTRY.UPDATE + id,
      data
    );
  }
  createTest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.TESTTOOL.CREATE,
      data
    );
  }
  updateTest(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.TESTTOOL.UPDATE + id,
      data
    );
  }
  createEnvironment(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ENVIRONMENTS.CREATE,
      data
    );
  }
  updateEnvironment(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ENVIRONMENTS.UPDATE + id,
      data
    );
  }
  createCustomVariable(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CUSTOM_VARIABLES.CREATE,
      data
    );
  }
  updateCustomVariable(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CUSTOM_VARIABLES.UPDATE + id,
      data
    );
  }
  syncRepository(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.PROVIDER.SYNCREPO + id,
      data
    );
  }
  createBuild(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BUILD.CREATE,
      data
    );
  }
  updateBuild(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BUILD.UPDATE + id,
      data
    );
  }
}
