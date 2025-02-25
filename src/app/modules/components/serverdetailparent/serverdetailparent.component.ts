import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonFileService } from "../../services/commonfile.service";
@Component({
  selector: "app-cloudmatiq-server-detail-holder",
  styles: [],
  templateUrl: "./serverdetailparent.component.html",
})
export class ServerDetailHolderComponent implements OnInit {
  serverDetail: any;
  constructor(
    private commonFileService: CommonFileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.serverDetail = this.commonFileService.getAssetItem();
    this.route.paramMap.subscribe((p: any) => {
      if (p.params && p.params.hostid) {
        let data: any = atob(p.params.hostid);
        if (data != undefined) {
          this.serverDetail = {
            cloudprovider: data.split('CMP')[0],
            instanceref: data.split('CMP')[1],
            instancereftype: 'instancerefid'
          };
        }
      }
    });
  }
  ngOnInit() {
    if (Object.keys(this.serverDetail).length == 0) {
      this.router.navigate(["assets"]);
    }
  }
}
