import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: "app-add-edit-cloudassets",
  templateUrl:
    "../../../../presentation/web/deployments/cloudassets/add-edit-cloudasset/add-edit-cloudasset.component.html",
})
export class AddEditCloudAssetComponent implements OnInit, OnChanges {
  @Input() cloudassetObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  edit = false;
  userstoragedata: any;
  cloudassetForm: FormGroup;
  formdata: any = {};
  disabled = true;
  loading = false;
  constructor(
    private localStorageService: LocalStorageService,
    private fb: FormBuilder
  ) { }
  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.cloudassetObj) &&
      !_.isEmpty(changes.cloudassetObj.currentValue)
    ) {
      this.cloudassetObj = changes.cloudassetObj.currentValue;
      if (typeof (this.cloudassetObj.assetdata) == 'string') {
        this.cloudassetObj.assetdata = JSON.parse(this.cloudassetObj.assetdata);
      }
      this.cloudassetObj.assetdata = JSON.stringify(
        this.cloudassetObj.assetdata,
        undefined,
        4
      );
    }
  }
}
