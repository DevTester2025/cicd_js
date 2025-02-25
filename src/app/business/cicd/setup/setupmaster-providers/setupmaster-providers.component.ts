import { Component, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import *as _ from 'lodash';

@Component({
  selector: "app-setupmaster-providers",
  templateUrl: "./setupmaster-providers.component.html",
  styleUrls: ["./setupmaster-providers.component.css"],
})
export class SetupmasterProvidersComponent implements OnInit {
  visible: { [key: string]: boolean } = {};
  isVisible: string | null = null;
  userstoragedata = {} as any;
  showTab = 0;
  providerList = [];
  screens = [];
  loading = true;
  totalCount;
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  filterSearchModel = "";
  order = ["lastupdateddt", "desc"];
  searchText: string = "";
  githubtableHeader = [
    { field: "name", header: "Name", datatype: "string", isdefault:true, isfilter:true },
    { field: "username", header: "User Name", datatype: "string", isdefault:true, isfilter:true },
    { field: "accesstoken", header: "Access Token", datatype: "string", isdefault:true },
    { field: "organizationname", header: "Organization Name", datatype: "string", isdefault:true },
    { field: "url", header: "URL", datatype: "string", isdefault:true },
    { field: "createdby", header: "Created By", datatype: "string", isdefault:true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault:true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true
    },
    { field: "status", header: "Status", datatype: "string", isdefault:true },
  ] as any;
  githubtableConfig = {
    edit: true,
    delete: true,
    loading: false,
    apisort: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    columnselection: true,
    pageSize: 10,
    count: 0,
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    scroll: { x: "1300px" },
    title: "",
    widthConfig: [
      "100px",
      "200px",
      "100px",
      "200px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
    ],
  } as any;
  selectedcolumns = [] as any;

  constructor(
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private httpService: HttpHandlerService,
    private routes: ActivatedRoute
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.providerList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.routes.queryParams.subscribe((params) => {
      if (params["tabIndex"] == "0") {
        this.getAllList();
      };
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.githubtableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }

  showTable(tableId: string): void {
    if (this.visible[tableId]) {
      this.visible[tableId] = false;
    } else {
      _.forOwn(this.visible, (value, key) => {
        this.visible[key] = false;
      });
      this.visible[tableId] = true;
    }
  }

  ngOnInit() {
    this.loading = false;
    this.routes.queryParams.subscribe((params) => {
      if (!params["tabIndex"] && params["tabIndex"] !== '0') {
        this.getAllList();
      };
    });
  }

  addProvider(providerType: string): void {
    this.router.navigate(["cicd/setup/provider/create"], {
      queryParams: { type: providerType },
    });
  }

  getAllList() {
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    if (
      Array.isArray(this.filteredValues[this.filterKey]) &&
      this.filteredValues[this.filterKey].length > 0
    ) {
      this.filteredValues[this.filterKey].forEach((value) => {
        if (this.filterKey === "username") {
          queryParams.set("username", value);
        } else if (this.filterKey === "name") {
          queryParams.set("name", value);
        }
      });
    }
    if (this.searchText != null) {
      queryParams.set("searchText",this.searchText)
    }
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.PROVIDER.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.providerList = response.data.GITHUB ? response.data.GITHUB: [];
        this.githubtableConfig.manualpagination = true;
        this.totalCount = this.providerList.length;
       this.githubtableConfig.count =
        "Total Records" + ":" + " " + this.totalCount;
      } else {
        this.loading = false;
        this.providerList = [];
      }
    });
  }

  dataChanged(result) {
    if (result.edit) {
      const providerType = result.data.type;
      const providerId = result.data.id;
      this.router.navigate(["cicd/setup/provider/update/", providerId], {
        queryParams: { type: providerType },
      });
    }
    if (result.delete) {
      this.deleteProvider(result.data.id);
    }
    if (result.order) {
      this.order = result.order;
      this.getAllList();
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getAllList();
      }
    }
    if(result.refresh){
      this.filteredValues = {};
      this.searchText = null;
      this.getAllList();
    }
    if (result.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = result.data.field;
      if (result.data.field == "name" || result.data.field == "username") {
        let queryParams = new URLSearchParams();
        queryParams.set("tenantid", this.userstoragedata.tenantid);
        queryParams.set("status", AppConstant.STATUS.ACTIVE);
        let query =
          `${AppConstant.API_END_POINT}${
            AppConstant.API_CONFIG.API_URL.CICD.SETUP.PROVIDER.FINDALL
          }?${queryParams.toString()}` + `&order=${this.order}`;
        this.httpService.GET(query).subscribe((result) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.filterableValues = response.data.GITHUB
              ? response.data.GITHUB
              : [];
          } else {
            this.filterableValues = [];
          }
        });
      }
    }
  }

  deleteProvider(id: number) {
    this.loading = true;
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.PROVIDER.DELETE
      }${id}?lastUpdatedBy=${encodeURIComponent(this.userstoragedata.fullname)}`;
    this.httpService.DELETE(query).subscribe(
      (result) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllList();
        this.message.success(JSON.parse(result._body).message);
      },
      (error) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllList();
        console.log("Error, Try again later", error);
      }
    );
  }

  getFilterValue(event) {
    if (event && (this.filterKey === "name" || this.filterKey === "username")) {
      this.filterableValues = this.providerList.filter((el) => 
        el.name.toLowerCase().includes(event)
      );
    } else {
      this.filterableValues = this.providerList;
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllList();
  }
}