import { Component, OnInit } from "@angular/core";
import { AssetsService } from "../assets/assets.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import downloadService from "../../../modules/services/shared/download.service";
import { Buffer } from "buffer";

@Component({
  selector: "app-product",
  templateUrl: "../../base/product/product.component.html",
})
export class ProductComponent implements OnInit {
  totalCount = null;
  tableHeader = [
    {
      field: "productcode",
      header: "Product Code",
      datatype: "string",
      isdefault: true, 
    },
    {
      field: "productname",
      header: "Product Name",
      datatype: "string",
      isdefault: true, 
    },
    {
      field: "servertype",
      header: "Server Type",
      datatype: "string",
      isdefault: true, 
    },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      isdefault: true, 
    },
    {
      field: "lastupdateddt",
      header: "Updated date",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true, 
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ];

  tableconfig = {
    refresh: true,
    edit: false,
    delete: false,
    manualsearch: true,
    globalsearch: true,
    pagination: true,
    columnselection: true,
    manualpagination: false,
    loading: false,
    pageSize: 10,
    apisort: true,
    tabledownload: false,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px"],
  };
  productObj: any = {};
  globalSearchModel = "";
  limit = 10;
  offset = 0;
  selectedcolumns = [] as any;
  createProduct = false;
  searchText = null;
  productList = [];
  order = ["lastupdateddt", "desc"];
  userstoragedata: any;
  screens: any;
  formTitle = "Add Product";
  isVisible = false;
  appScreens = {} as any;
  isdownload = false;
  constructor(
    private assetService: AssetsService,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PRODUCTS,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createProduct = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.tableconfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.tableconfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableconfig.tabledownload = true;
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }

  ngOnInit() {
    this.getAllProductList();
  }

  getAllProductList(limit?, offset?) {
    this.productList = [];
    this.tableconfig.loading = true;
    let query;
    let reqObj: any = {
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.searchText != null) {
      reqObj["searchText"] = this.searchText;
    }
    if (this.isdownload === true) {
      query = `?isdownload=${this.isdownload}`;
      reqObj["headers"] = this.selectedcolumns;
    }

    this.assetService.listProducts(reqObj,query).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        if (this.isdownload) {
          this.tableconfig.loading = false;
          var buffer = Buffer.from(response.data.content.data);
          downloadService(
            buffer,
            "Products.xlsx"
          );
          this.isdownload = false;
         this.getAllProductList(limit,offset);
        }
        else{
        this.productList = response.data;
        this.totalCount = this.productList.length;
        this.tableconfig.loading = false;
        }
      } else {
        this.totalCount = 0;
        this.tableconfig.loading = false;
        this.productList = [];
      }
    });
  }

  dataChanged(e) {
    if (e.searchText != "" && e.search) {
      this.searchText = e.searchText;
      this.getAllProductList(10, 0);
    }

    if (e.searchText == "") {
      this.searchText = null;
      this.getAllProductList(10, 0);
    }

    if (e.refresh) {
      this.searchText = null;
      this.isdownload = false;
      this.getAllProductList();
    }

    if (e.order) {
      this.order = e.order;
      this.getAllProductList(10, 0);
    }

    if (e.edit) {
      this.isVisible = true;
      this.productObj = e.data;
      this.productObj.refid = this.productObj.productid;
      this.productObj.reftype = AppConstant.REFERENCETYPE[18];
      console.log(this.productObj);
      this.formTitle = "Update Product";
    }
    if (e.download) {
      this.isdownload = true;
      this.getAllProductList(this.tableconfig.pageSize, 0);
    }
  }

  showAddForm() {
    this.isVisible = true;
    this.formTitle = "Add Product";
    this.productObj = {};
  }

  rightbarChanged(val) {
    this.isVisible = val;
    this.getAllProductList();
  }

  notifyProductEntry() {
    this.getAllProductList();
  }
}
