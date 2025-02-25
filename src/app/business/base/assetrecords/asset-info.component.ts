import { Component, OnInit } from "@angular/core";
import { IAssetDtl } from "src/app/modules/interfaces/assetrecord.interface";
import { AssetRecordService } from "./assetrecords.service";

@Component({
  selector: "app-cloudmatiq-asset-info",
  templateUrl:
    "../../../presentation/web/base/assetrecords/asset-info.component.html"
})
export class AssetInfoComponent implements OnInit {
  selectedResourceID = null as null | string;
  resourceDetailMenuVisible = false;
  resourceDetails = {} as Record<string, string>;
  tabIndex=0;
  constructor( private assetRecordService: AssetRecordService,) {

  }
  ngOnInit() {

  }
  viewResourceDetail(data: Record<string, string>) {
    this.tabIndex=0;
    this.selectedResourceID = data["resource"];
    this.assetRecordService
      .getResourceValuesById(btoa(data["resource"]))
      .subscribe(r => {
        let response: IAssetDtl[] = JSON.parse(r._body);

        let data = {};

        response.forEach(o => {
          data[o["fieldkey"]] = o["fieldvalue"];
        });

        this.resourceDetails = data;
        this.resourceDetailMenuVisible = true;
       // this.getTagValues();
      });
  }

  parseJSON(text: string) {
    try {
      let j = JSON.parse(text);
      return Object.keys(j).length > 0 ? j : null;
    } catch (error) {
      return null;
    }
  }
}



