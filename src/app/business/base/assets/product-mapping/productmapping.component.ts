import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConstant } from "src/app/app.constant";
import { CommonFileService } from "src/app/modules/services/commonfile.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { WazuhConstant } from "src/app/wazuh.constants";

@Component({
  selector: "app-product-mapping",
  templateUrl: "./productmapping.component.html"
})
export class ProductMappingComponent implements OnInit {
  @Input() assetData;
  userstoragedata:any={};
  sectabIndex=0;
  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private commonFileService: CommonFileService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assetData && changes.assetData.currentValue) {
      
    }
  }
  sectabChange(event) {
    this.sectabIndex = event.index;
  }
}
