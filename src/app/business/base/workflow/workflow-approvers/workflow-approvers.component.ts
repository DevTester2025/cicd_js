import { Component, OnInit, Input } from '@angular/core';
// import { requestManagementService } from '../request-management.service';
import { AppConstant } from 'src/app/app.constant';
import * as moment from "moment";
import { SrmService } from 'src/app/business/srm/srm.service';

@Component({
  selector: 'app-workflow-approvers',
  templateUrl: './workflow-approvers.component.html',
  styleUrls: ['./workflow-approvers.component.css']
})
export class ApprovalFlowComponent implements OnInit {
  @Input() id: any;
  requestList: any;
  workflowApprovers: any;
  isLoading: boolean = false;

  constructor(
    private srService: SrmService,
  ) {  }

  ngOnInit() {
    this.getRequestById();
  }

  getRequestById() {
    this.isLoading = true;
    this.srService.byId(this.id).subscribe((res) => {
      this.isLoading = false;
      const response = JSON.parse(res._body);
      if (response.status) {
        this.requestList = response.data;        
        this.workflowApprovers = this.requestList.workflow.tnapprovers;
        this.workflowApprovers.forEach((data)=>{
          data.lastupdateddt = moment(data.lastupdateddt).format(AppConstant.DATE_FORMAT)
        })
      } else {
        this.requestList = [];
      }
    });
  }

}
