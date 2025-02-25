import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from "@angular/router";
import { LocalStorageService } from "./shared/local-storage.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private lsService: LocalStorageService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.lsService.getItem("isAuthenticated")) {
      return true;
    } else {
      this.router.navigate(["login"], {
        queryParams: {
          redirect: state.url,
        },
      });
    }
  }
}
