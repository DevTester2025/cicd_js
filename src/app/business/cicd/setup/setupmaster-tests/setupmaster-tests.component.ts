import { Component, OnInit } from '@angular/core';
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import *as _ from 'lodash';


@Component({
  selector: 'app-setupmaster-tests',
  templateUrl: './setupmaster-tests.component.html',
  styleUrls: ['./setupmaster-tests.component.css']
})
export class SetupmasterTestsComponent implements OnInit {
  visible: { [key: string]: boolean } = {};
  isVisible: string | null = null;
  userstoragedata = {} as any;
  showTab = 0;
  testsList = [];
  screens = [];
  loading = true;
  totalCount;
  order = ["lastupdateddt", "desc"];
  searchText: string = "";
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  filterSearchModel = "";
  sonarqubetableHeader = [
    { field: "name", header: "Name", datatype: "string", width: "10%", isdefault:true, isfilter:true },
    { field: "organization", header: "Organization", datatype: "string", width: "10%", isdefault:true, isfilter:true },
    { field: "accesstoken", header: "Access Token", datatype: "string", width: "10%", isdefault:true },
    { field: "url", header: "URL", datatype: "string", width: "10%", isdefault:true },
    { field: "createdby", header: "Created By", datatype: "string", width: "10%", isdefault:true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "10%",
      isdefault:true
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", width: "10%", isdefault:true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      width: "10%",
      isdefault:true
    },
    { field: "status", header: "Status", datatype: "string", width: "10%", isdefault:true },
  ] as any;
  sonarqubetableConfig = {
    edit: true,
    delete: true,
    loading: false,
    apisort: true,
    pagination: false,
    columnselection: true,
    frontpagination: false,
    manualpagination: false,
    pageSize: 10,
    count: 0,
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    scroll: { x: "1500px" },
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
    this.testsList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );

    this.routes.queryParams.subscribe((params) => {
      if (params["tabIndex"] == "3") {
        this.getAllList();
      };
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.sonarqubetableHeader.filter((el) => {
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
  }

  addTest(testType: string): void {
    this.router.navigate(["cicd/setup/testtool/create"], {
      queryParams: { type: testType },
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
        if (this.filterKey === "organization") {
          queryParams.set("organization", value);
        } else if (this.filterKey === "name") {
          queryParams.set("name", value);
        }
      });
    }
    if (this.searchText != null) {
      queryParams.set("searchText",this.searchText)
    }
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.TESTTOOL.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.testsList = response.data.SONARQUBE ? response.data.SONARQUBE : [];
        this.sonarqubetableConfig.manualpagination = true;
        this.totalCount = this.testsList.length;
       this.sonarqubetableConfig.count =
        "Total Records" + ":" + " " + this.totalCount;

        _.map(this.testsList, (data: any) => {
          if (data.accesstokenisvariable) {
            data.accesstoken = data.accesstokenvariable
          }
          if (data.urlisvariable) {
            data.url = data.urlvariable
          }
        });
      } else {
        this.loading = false;
        this.testsList = [];
      }
    });
  }

  dataChanged(result) {
    if (result.edit) {
      const testType = result.data.type;
      const testId = result.data.id;
      this.router.navigate(["cicd/setup/testtool/update/", testId], {
        queryParams: { type: testType },
      });
    }
    if (result.delete) {
      this.deleteTest(result.data.id);
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
      if (result.data.field == "name" || result.data.field == "organization") {
        let queryParams = new URLSearchParams();
        queryParams.set("tenantid", this.userstoragedata.tenantid);
        queryParams.set("status", AppConstant.STATUS.ACTIVE);
        let query =
          `${AppConstant.API_END_POINT}${
            AppConstant.API_CONFIG.API_URL.CICD.SETUP.TESTTOOL.FINDALL
          }?${queryParams.toString()}` + `&order=${this.order}`;
        this.httpService.GET(query).subscribe((result) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.filterableValues = response.data.SONARQUBE
              ? response.data.SONARQUBE
              : [];
          } else {
            this.filterableValues = [];
          }
        });
      }
    }
  }

  deleteTest(id: number) {
    this.loading = true;
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.TESTTOOL.DELETE
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
    console.log(event, "event");
    if (event && (this.filterKey === "name" || this.filterKey === "organization")) {
      this.filterableValues = this.testsList.filter((el) => 
        el.name.toLowerCase().includes(event)
      );
    } else {
      this.filterableValues = this.testsList;
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllList();
  }
}
