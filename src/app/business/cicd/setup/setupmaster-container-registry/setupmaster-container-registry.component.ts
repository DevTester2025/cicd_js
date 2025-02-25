import { Component, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import *as _ from 'lodash';


@Component({
  selector: "app-setupmaster-container-registry",
  templateUrl: "./setupmaster-container-registry.component.html",
  styleUrls: ["./setupmaster-container-registry.component.css"],
})
export class SetupmasterContainerRegistryComponent implements OnInit {
  visible: { [key: string]: boolean } = {};
  isVisible: string | null = null;
  userstoragedata = {} as any;
  showTab = 0;
  containerList = [];
  screens = [];
  loading = true;
  totalCount;
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  filterSearchModel = "";
  order = ["lastupdateddt", "desc"];
  dockerhubtableHeader = [
    { field: "name", header: "Name", datatype: "string", isdefault:true, isfilter:true },
    { field: "username", header: "User Name", datatype: "string", isdefault:true, isfilter:true},
    {
      field: "accesstoken",
      header: "Access Token",
      datatype: "string",
      isdefault:true,
    },
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
  dockerhubtableConfig = {
    edit: true,
    delete: true,
    loading: false,
    apisort: true,
    pagination: false,
    columnselection: true,
    frontpagination: false,
    manualpagination: false,
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    pageSize: 10,
    count: 0,
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
    ],
  } as any;
  selectedcolumns = [] as any;
  searchText: string = "";

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
    this.containerList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.routes.queryParams.subscribe((params) => {
      if (params["tabIndex"] == "1") {
        this.getAllList();
      };
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.dockerhubtableHeader.filter((el) => {
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

  addContainer(containerType: string): void {
    this.router.navigate(["cicd/setup/containerregistry/create"], {
      queryParams: { type: containerType },
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
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CONTAINER_REGISTRY.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        if(response.status)
        this.containerList = response.data.DOCKERHUB ? response.data.DOCKERHUB : [];
        this.dockerhubtableConfig.manualpagination = true;
        this.totalCount = this.containerList.length;
       this.dockerhubtableConfig.count =
        "Total Records" + ":" + " " + this.totalCount;
        _.map(this.containerList, (data: any) => {
          if (data.usernameisvariable) {
            data.username = data.usernamevariable
          }
          if (data.accesstokenisvariable) {
            data.accesstoken = data.accesstokenvariable
          }
          if (data.urlisvariable) {
            data.url = data.urlvariable
          }
        });
      } else {
        this.loading = false;
        this.containerList = [];
      }
    });
  }

  dataChanged(result) {
    if (result.edit) {
      const containerType = result.data.type;
      const containerId = result.data.id;
      this.router.navigate(
        ["cicd/setup/containerregistry/update/", containerId],
        {
          queryParams: { type: containerType },
        }
      );
    }
    if (result.delete) {
      this.deleteContainerRegistry(result.data.id);
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
            AppConstant.API_CONFIG.API_URL.CICD.SETUP.CONTAINER_REGISTRY.FINDALL
          }?${queryParams.toString()}` + `&order=${this.order}`;
        this.httpService.GET(query).subscribe((result) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.filterableValues = response.data.DOCKERHUB
              ? response.data.DOCKERHUB
              : [];
          } else {
            this.filterableValues = [];
          }
        });
      }
    }
  }

  deleteContainerRegistry(id: number) {
    this.loading = true;
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CONTAINER_REGISTRY.DELETE
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
      this.filterableValues = this.containerList.filter((el) => 
        el.name.toLowerCase().includes(event)
      );
    } else {
      this.filterableValues = this.containerList;
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllList();
  }
}
