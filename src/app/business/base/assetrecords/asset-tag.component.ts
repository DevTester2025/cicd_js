import { Component, OnInit, SimpleChanges, Input } from "@angular/core";

@Component({
  selector: "app-cloudmatiq-asset-tags",
  templateUrl:
    "../../../presentation/web/base/assetrecords/asset-tags.component.html"
})
export class AssetTagsComponent implements OnInit {
  @Input() assetId: any;
  constructor() {}
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    if(changes.assetId){
      // this.getTags
    }
  }
}
