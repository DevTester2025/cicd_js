import { Component, OnInit } from "@angular/core";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { ReleasesService } from "../releases.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AppConstant } from "src/app/app.constant";
import * as moment from "moment";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { Socket } from "ngx-socket-io";
import * as _ from "lodash";
import { CicdService } from "../../cicd.service";

@Component({
  selector: "app-releases-transactions",
  templateUrl: "./releases-transactions.component.html",
  styleUrls: ["./releases-transactions.component.css"],
})
export class ReleasesTransactionsComponent implements OnInit {
  searchText: string;
  pageTotal: any = 0;
  visible = false;
  screens = [];
  status = AppConstant.CICD.Status;
  provider = AppConstant.CICD.provider;
  pageChangeCount = AppConstant.CICD.pageChangeCount;
  selectedStatus: string = null;
  dateRange: Date[] = null;
  selectedProvider: string = null;
  selectedRepository: string = null;
  filteredBranches: string[] = [];
  selectedBranch: string = null;
  userstoragedata = {} as any;
  txnData = [];
  txnList = [];
  repositories: string[] = [];
  currentPage = 1;
  pageSize = 5;
  totalCount: number = null;
  loading = false;
  updatedDataTxn: any = {};
  updatedDataLog: any;
  isDashboard: boolean = false;
  isLoading: boolean = true;
  tabIndex: number = 0;
  filterValues: any = {};
  isEncrypted: boolean = false;
  isLimitChnaged: boolean = false;

  constructor(
    private httpService: HttpHandlerService,
    private releasesService: ReleasesService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService,
    private socket: Socket,
    private cicdService: CicdService,
  ) {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    this.socket.on('connectedHrd', (data: any) => {
      if (!_.isEmpty(data)) {
        this.updatedDataTxn = data;
        this.isLoading = _.some(this.txnData, (txn: any) => txn.id === data.id);
        this.reload();
      }
    });
    this.socket.on('addHookProcessHrd', (data: any) => {
      if (!_.isEmpty(data)) {
        if (_.isEmpty(this.updatedDataLog) || !_.isEqual(data, (this.updatedDataLog))) {
          this.updatedDataLog = data;
          this.updateWebsocketData(this.updatedDataLog);
        }
      }
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.txnData = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.route.queryParams.subscribe((params) => {
      this.tabIndex = params['tabIndex'];
      if (this.tabIndex == 0) {
        this.handleQueryParams(params);
      };
    });
  };

  handleQueryParams(params: any) {
    this.currentPage = parseInt(params["page"]) || this.currentPage
    if (params['q']) {
      this.filterValues = JSON.parse(this.cicdService.decrypt(params['q']));
      if (this.filterValues.date) {
        this.dateRange = this.filterValues.date;
      }
      if (this.filterValues.status) {
        this.selectedStatus = this.filterValues.status;
      }
      if (this.filterValues.provider) {
        this.selectedProvider = this.filterValues.provider;
      }
      if (this.filterValues.repo) {
        this.selectedRepository = this.filterValues.repo;
      }
      if (this.filterValues.branch) {
        this.selectedBranch = this.filterValues.branch;
      }
      if (this.filterValues.searchtext) {
        this.searchText = this.filterValues.searchtext;
      }
    };
  }

  ngOnInit() {
    const currentUrl = this.router.url;
    if (currentUrl == "/cicd") {
      this.isDashboard = true;
      this.pageSize = 3;
    }

    this.route.queryParams.subscribe(params => {
      if (params.reload && params.reload === "true") {
        this.reload();
      }
      if (params['status']) {
        this.selectedStatus = params['status'];
      }
    });
    this.getAllList();
    this.getAllTxnList();
  }

  getAllTxnList() {
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    let query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.RELEASES.RELEASEWORKFLOW
      }?${queryParams.toString()}`;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        const repositorySet = new Set<string>();
        this.txnList = response.data.rows.map((data) => {
          repositorySet.add(data.reponame);
          return data;
        });
        this.repositories = Array.from(repositorySet);
      } else {
        this.txnList = [];
      }
    });
  }

  updateWebsocketData(data: any) {
    _.forEach(this.txnData, (txn: any) => {
      if (data.where.id == txn.id) {
        if (data.attributes.commitid !== undefined && data.attributes.commitid !== txn.commitid) {
          txn.commitid = data.attributes.commitid;
        }
        if (data.attributes.executionendtime !== undefined && data.attributes.executionendtime !== txn.executionendtime) {
          const executionTime = this.calculateExecutionTime(txn.executionstarttime, data.attributes.executionendtime);
          txn.executiontime = executionTime;
        }
        if (data.attributes.lastupdateddt !== undefined && data.attributes.lastupdateddt !== txn.lastupdateddt) {
          txn.lastupdateddt = data.attributes.lastupdateddt;
        }
        if (data.attributes.status !== undefined && data.attributes.status !== txn.status) {
          txn.status = data.attributes.status;
        }
      }
    });
  }

  calculateExecutionTime(
    startTime: string,
    endTime: string
  ): string {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "-";
    }
    const start = startDate.getTime();
    const end = endDate.getTime();
    const diff = end - start;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case AppConstant.CICD.STATUS.COMPLETED:
      case AppConstant.CICD.STATUS.FAILED:
      case AppConstant.CICD.STATUS.CANCELLED:
        return "Re-run";
      case AppConstant.CICD.STATUS.INPROGRESS:
        return "Abort";
      case AppConstant.CICD.STATUS.PENDING:
        return "Pending";
    }
  }

  getStatusStyles(status: string): { [key: string]: string } {
    const commonStyles = {
      color: "#fff",
      border: "1px solid white",
    };

    switch (status) {
      case AppConstant.CICD.STATUS.COMPLETED:
      case AppConstant.CICD.STATUS.CANCELLED:
      case AppConstant.CICD.STATUS.FAILED:
        return { ...commonStyles, "background-color": "#aabb11" };
      case AppConstant.CICD.STATUS.INPROGRESS:
        return {
          ...commonStyles,
          color: "#BE2E2E",
          "background-color": "#a82e2e42",
          border: "1px solid #BE2E2E",
        };
      default:
        return { ...commonStyles, "background-color": "#B59100" };
    }
  }

  showSuccessIcon(status: string): boolean {
    return status === AppConstant.CICD.STATUS.COMPLETED;
  }

  showFailedIcon(status: string): boolean {
    return (
      status === AppConstant.CICD.STATUS.FAILED ||
      status === AppConstant.CICD.STATUS.CANCELLED
    );
  }

  showErrorIcon(status: string): boolean {
    return status === AppConstant.CICD.STATUS.PENDING;
  }

  showRunningIcon(status: string): boolean {
    return status === AppConstant.CICD.STATUS.INPROGRESS;
  }

  showSyncIcon(status: string): boolean {
    return (
      status === AppConstant.CICD.STATUS.COMPLETED ||
      status === AppConstant.CICD.STATUS.FAILED ||
      status === AppConstant.CICD.STATUS.CANCELLED
    );
  }

  showCloseIcon(status: string): boolean {
    return status === AppConstant.CICD.STATUS.INPROGRESS;
  }

  showPendingIcon(status: string): boolean {
    return status === AppConstant.CICD.STATUS.PENDING;
  }

  showGithubIcon(provider: string): boolean {
    return provider === AppConstant.CICD.PROVIDER.GITHUB;
  }

  showGitlabIcon(provider: string): boolean {
    return provider === AppConstant.CICD.PROVIDER.GITLAB;
  }

  showBitbucketIcon(provider: string): boolean {
    return provider === AppConstant.CICD.PROVIDER.BITBUCKET;
  }

  getAllList() {
    const limit = this.pageSize;
    const offset = (this.currentPage - 1) * this.pageSize;
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("count", "true");
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    if (this.dateRange && this.dateRange.length === 2) {
      queryParams.set(
        "startDate",
        moment(this.dateRange[0]).format("YYYY-MM-DD")
      );
      queryParams.set(
        "endDate",
        moment(this.dateRange[1]).format("YYYY-MM-DD")
      );
      this.filterValues.date = this.dateRange;
    }
    if (this.selectedStatus) {
      queryParams.set("selectedStatus", this.selectedStatus);
      this.filterValues.status = this.selectedStatus;
    }
    if (this.selectedProvider) {
      queryParams.set("selectedProvider", this.selectedProvider);
      this.filterValues.provider = this.selectedProvider;
    }
    if (this.selectedRepository) {
      queryParams.set("selectedRepository", this.selectedRepository);
      this.filterValues.repo = this.selectedRepository;
    }
    if (this.selectedBranch) {
      queryParams.set("selectedBranch", this.selectedBranch);
      this.filterValues.branch = this.selectedBranch;
    }
    if (this.searchText) {
      queryParams.set("searchText", this.searchText);
      this.filterValues.searchtext = this.searchText;
    }
    let query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.RELEASES.RELEASEWORKFLOW
      }?${queryParams.toString()}`;
    if (this.isLoading) {
      this.loading = true;
    }
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.txnData = response.data.rows;
        this.totalCount = response.data.count;
      } else {
        this.loading = false;
        this.txnData = [];
        this.totalCount = 0;
      }
    });
  }

  filterBranchesByRepository(repository: string): string[] {
    if (!repository || !this.txnList || this.txnList.length === 0) {
      return [];
    }
    const branchesSet = new Set<string>();
    this.txnList.forEach((data) => {
      if (data.reponame === repository) {
        branchesSet.add(data.branch);
      }
    });
    return Array.from(branchesSet);
  }

  onRepositoryChange() {
    this.filteredBranches = this.filterBranchesByRepository(
      this.selectedRepository
    );
  }

  globalSearch() {
    this.getAllList();
  }

  showFilter(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  applyFilters() {
    this.visible = false;
    this.currentPage = 1;
    this.getAllList();
  }

  clearFilters() {
    this.selectedStatus = null;
    this.dateRange = null;
    this.selectedProvider = null;
    this.selectedRepository = null;
    this.selectedBranch = null;
    this.filteredBranches = [];
    this.filterValues = {};
    this.getAllList();
  }

  reload() {
    if (this.isDashboard) {
      this.pageSize = 3;
    } else {
      this.pageSize = 5;
    }
    this.searchText = null;
    this.getAllList();
    this.clearFilters();
  }

  viewRelease(id: string): void {
    const queryParams = this.getQueryParams();
    this.router.navigate(["/cicd/release/view", id], {
      queryParams
    }
    );
  }

  runAction(data: any, event: MouseEvent) {
    event.stopPropagation();
    if (
      data.status != AppConstant.CICD.STATUS.PENDING &&
      data.status != AppConstant.CICD.STATUS.INPROGRESS
    ) {
      this.reRunWorkflow(data)
    } else if (data.status == AppConstant.CICD.STATUS.INPROGRESS) {
      this.cancelWorkflow(data)
    }
  }

  reRunWorkflow(data: any) {
    this.modalService.confirm({
      nzTitle: "Confirm",
      nzContent: `Are you sure you want to re-run the workflow?`,
      nzOkText: "OK",
      nzCancelText: "Cancel",
      nzOnOk: () => {
        this.loading = true;
        this.releasesService
          .reRunWorkflow({
            releaseProcessHeaderId: data.id,
            tenantId: data.tenantid,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              const resdata = JSON.parse(result._body);
              if (resdata.code === 200) {
                if (this.isDashboard) {
                  this.pageSize = 3;
                } else {
                  this.pageSize = 5;
                }
                this.currentPage = 1;
                this.getAllList();
                this.message.success(resdata.message);
              } else if (resdata.code === 204) {
                this.message.warning(resdata.message);
              }
            },
            (error) => {
              this.loading = false;
              console.log("Workflow Trigger ERROR", error);
            }
          );
      },
      nzOnCancel: () => {
        console.log("User cancelled the workflow.");
      },
    });
  }

  cancelWorkflow(data: any) {
    this.modalService.confirm({
      nzTitle: "Confirm",
      nzContent: `Are you sure you want to cancel the workflow?`,
      nzOkText: "OK",
      nzCancelText: "Cancel",
      nzOnOk: () => {
        this.loading = true;
        this.releasesService
          .cancelWorkflow({
            releaseProcessHeaderId: data.id,
            tenantId: data.tenantid,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              const resdata = JSON.parse(result._body);
              if (resdata.code === 200) {
                if (this.isDashboard) {
                  this.pageSize = 3;
                } else {
                  this.pageSize = 5;
                }
                this.getAllList();
                this.message.success(resdata.message);
              } else if (resdata.code === 204) {
                this.message.error(resdata.message);
              }
            },
            (error) => {
              this.loading = false;
              console.log("Workflow cancelled ERROR", error);
            }
          );
      },
      nzOnCancel: () => {
        console.log("User cancelled the workflow.");
      },
    });
  }

  onPageChange(event) {
    this.currentPage = event;
    if (this.tabIndex == 0) {
      this.router.navigate([], {
        queryParams: {
          page: this.currentPage,
          tabIndex: this.tabIndex,
        },
      });
    };
    this.getAllList();
  }

  onPageSizeChange(size:number){
    this.pageSize = size;
    this.getAllList();
  }

  getQueryParams(): any {
    let queryParams: any = {
      page: this.currentPage,
      tabIndex: this.tabIndex
    };
    if (!_.isEmpty(this.filterValues)) {
      if (this.isEncrypted) {
        this.filterValues = this.cicdService.decrypt(this.filterValues);
        this.isEncrypted = false;
      } else {
        this.filterValues = this.cicdService.encrypt(JSON.stringify(this.filterValues));
        this.isEncrypted = true;
      }
      queryParams.q = this.filterValues;
    };
    return queryParams;
  }
}
