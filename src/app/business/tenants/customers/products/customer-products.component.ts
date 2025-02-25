import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { KPIReportingService } from "../../kpireporting/kpireporting.service";
import * as moment from "moment";
import { AssetsService } from "src/app/business/base/assets/assets.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
@Component({
  selector: "app-customer-products",
  templateUrl: "./customer-products.component.html"
})
export class AddCustomerProductComponent implements OnInit {
  @Input() customerid;
  _reportingid;
  
  userstoragedata: any;
  
  loading = false;
  productList:any[]=[];
  productTableHdr=[
    { field: "productname", header: "Product Name", datatype: "string" },
    { field: "productcode", header: "Product Code", datatype: "string" },
    { field: "createdby", header: "Created By", datatype: "string" },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ];
  producttableConfig: any = {
    edit: true,
    delete: true,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    // scroll: { x: "1800px" },
    title: "",
    widthConfig: [
      "20%",
      "20%",
      "20%",
      "40%"
    ],
  };
  showAddEditPanel:boolean=false;
  addeditForm:FormGroup;
  isedit:Boolean=false;
  buttonText="Save"
  constructor(
    private assetsService: AssetsService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    
    this.addeditForm = this.fb.group({
      productname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      productcode: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      status: [""],
    });
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.customerid && changes.customerid.currentValue) {
      this.customerid = changes.customerid.currentValue;
      this.getProductList()
    }
  }

  getProductList(){
    console.log();
    this.loading=true;
    this.productList=[];
    let req={
      customerid:this.customerid,
      status: AppConstant.STATUS.ACTIVE
    }
    this.assetsService.listProducts(req).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        this.productList= response.data;
        this.loading=false;
      })
  }
  addProduct(){
    this.showAddEditPanel=true;
  }
  AddeditProductChange(event){
    this.showAddEditPanel=false;
  }
  saveOrUpdate(data){

    console.log();
    this.loading=true;
    this.productList=[];
    let req:any={
      productname : data.productname,
      productcode : data.productcode,
      status: AppConstant.STATUS.ACTIVE,
      customerid: this.customerid
    }
    if(!this.isedit)
    {
      req.createddt = new Date();
      req.createdby = this.userstoragedata.fullname;
      this.assetsService.addProducts(req).subscribe(
        (res) => {
          this.showAddEditPanel=false;
          const response = JSON.parse(res._body);
          this.message.success(response.message);
          this.getProductList();
          this.loading=false;
        });
    }
    
  }
}
