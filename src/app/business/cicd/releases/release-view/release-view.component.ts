import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ReleasesService } from "../releases.service";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { Socket } from "ngx-socket-io";
import * as _ from "lodash";

@Component({
  selector: "app-release-view",
  templateUrl: "./release-view.component.html",
  styleUrls: ["./release-view.component.css"],
})
export class ReleaseViewComponent implements OnInit {
  @ViewChild('logTextarea') logTextarea: ElementRef;

  userstoragedata = {} as any;
  screens = [];
  loading = true;
  txnLog = [];
  id: any;
  releaseName: string | null = null;
  selectedJob: string | null = null;
  selectedLogIdx: number = 0;
  selectedLog: any = {};
  nodes: any[] = [];
  lines: any[] = [];
  currentPageIndex: number = 0;
  queryParam: string = "";
  limit: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private releasesService: ReleasesService,
    private localStorageService: LocalStorageService,
    private socket: Socket
  ) {
    this.socket.on('addHookProcessDtl', (data: any) => {
      if (!_.isEmpty(data)) {
        this.updateWebsocketData(data);
      }
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.txnLog = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );

    this.route.params.subscribe((params: any) => {
      if (params["id"]) {
        this.id = params["id"];
        this.getById();
      }
    });
  }

  ngOnInit() {
    this.loading = false;
    this.route.queryParams.subscribe((params) => {
      this.currentPageIndex = parseInt(params["page"]);
      this.queryParam = params['q'];
      this.limit = params['limit'];
    });
  }

  updateWebsocketData(data: any) {
    data.forEach((v: any) => {
      const updateNode = this.nodes.findIndex((node: any) => node.id === v.id);
      if (updateNode !== -1 && this.nodes[updateNode].status !== AppConstant.CICD.STATUS.COMPLETED) {
        if (v.status !== this.nodes[updateNode].status) {
          this.nodes[updateNode].status = v.status;
        }
        if (v.log !== undefined && v.log !== null) {
          this.nodes[updateNode].log = v.log;
          setTimeout(() => {
            this.scrollToBottom();
          });
        }
      }
    });
  }

  getById() {
    this.releasesService.logbyId(this.id).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.txnLog = response.data.processdetail;
        this.releaseName = response.data.releaseName;
        this.processData();
        if (this.nodes.length > 0) {
          this.viewLog(this.nodes[0]);
        }
        this.loading = false;
      } else {
        this.loading = false;
        this.txnLog = [];
      }
    });
  }

  scrollToBottom() {
    if (this.logTextarea) {
      if (this.logTextarea.nativeElement) {
        const textarea = this.logTextarea.nativeElement as HTMLElement;
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }

  viewLog(data: any) {
    this.selectedLog = {
      id: data.id,
      isSelected: true
    };
    this.selectedLogIdx = _.findIndex(this.nodes, (node: any) => node.id === data.id);
    this.loading = true;
    this.selectedJob = data.name;

    this.releasesService.logdetailsbyId(data.id).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        let updatedLogDetail = this.nodes.map((log: any) => {
          if (log.id === data.id) {
            return {
              ...log,
              log: this.removeAnsiCodes(response.data.log),
              status: response.data.status,
            };
          } else {
            return log;
          }
        });
        this.nodes = updatedLogDetail;
      }
      this.loading = false;
      setTimeout(() => {
        this.scrollToBottom();
      });
    });
  }

  processData(): void {
    this.txnLog.forEach((item) => {
      this.nodes.push({
        id: item.id,
        name: item.jobName,
        status: item.status,
        position: item.position,
        referenceType: item.referenceType
      });
    });

    for (let i = 0; i < this.nodes.length - 1; i++) {
      const currentNode = this.nodes[i];
      const nextNode = this.nodes[i + 1];

      this.lines.push({
        from: currentNode.id,
        to: nextNode.id
      });
    }
  }


  getNodePosition(id: number): { x: number, y: number } {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };
    const spacing = this.getNodeSpace(this.nodes.length);
    const startEndSpacing = 20;

    let xPosition = (100 * node.position) + ((node.position - 1) * spacing) + startEndSpacing;

    const nodePosition: any = {
      6: 5,
      7: 4,
      8: 3,
      9: 2,
      10: 1,
    };

    let yPosition = 100;
    if (node.position >= 6) {
      const job = this.nodes.find(n => n.position === nodePosition[node.position]);
      if (job) {
        xPosition = (100 * job.position) + ((job.position - 1) * spacing) + startEndSpacing;
        yPosition = this.getNodePosition(job.id).y + 60;
      }
    }
    return { x: xPosition, y: yPosition };
  }

  getNodeSpace(length: number): number {
    switch (length) {
      case 2: return 230;
      case 3: return 280;
      case 4: return 177;
      default: return 120;
    }
  }

  getWidth(length: number): number {
    switch (length) {
      case 2: return 250;
      case 3: return 300;
      case 4: return 230;
      default: return 180;
    }
  }

  getNodeColor(status: string): string {
    if (status === AppConstant.CICD.STATUS.PENDING) {
      return '#393E46'
    } else {
      return 'rgb(71, 85, 96)'
    }
  }

  back(): void {
    this.router.navigate(["/cicd/releases"], {
      queryParams: {
        page: this.currentPageIndex,
        tabIndex: 0,
        q: this.queryParam,
        limit: this.limit
      },
    });
  }

  removeAnsiCodes(text: string): string {
    if (text !== null && text !== undefined) {
      const ansiRegex = AppConstant.CICD.ANSIREGEX;
      return text.replace(ansiRegex, '');
    } else {
      return "Waiting for the log..."
    }
  }

  getWidthAndHeight(status: string): number {
    if (status === AppConstant.CICD.STATUS.INPROGRESS) {
      return 28;
    } else {
      return 26;
    }
  }

  getShowLogPosition(length: number): number {
    switch (length) {
      case 2: return 172;
      case 3: return 220;
      case 4: return 147;
      default: return 100;
    }
  }

}
