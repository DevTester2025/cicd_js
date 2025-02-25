import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../app.constant";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../modules/services/shared/common.service";

@Component({
  selector: "app-cloudmatiq-tco",
  templateUrl: "../../../presentation/web/base/tco/tco.component.html",
})
export class TCOComponent implements OnInit {
  tcoForm: FormGroup;
  userstoragedata = {} as any;
  data: any;
  options: any;
  realestate = 0;
  elecricity = 0;
  ssalary = 0;
  bandwidth = 0;
  storage = 0;
  premisetco = 0;
  payment = 0;
  cloudtco = 0;
  totalcTco = 0;
  public show: Boolean = false;
  public hide: Boolean = true;
  public calculating: Boolean = false;
  dataChart: any = [];
  zero = 0;
  totalotco = 0;
  color: any;
  tcounit: number;
  diffper: any = 0;
  data1: any;
  constructor(private localStorageService: LocalStorageService) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  formatterDollar = (value) => `$ ${value}`;
  parserDollar = (value) => value.replace("$ ", "");
  ngOnInit() {
    this.calculating = false;
    this.data = {
      labels: ["", "On Premise TCO", "Cloud TCO"],

      datasets: [
        {
          label: "$",
          backgroundColor: ["", "#7dbb2e", "#e44b48"],
          borderColor: ["", "#22c15d", "#FECC00"],
          data: [0, 0, 0],
        },
      ],
    };
    this.options = {
      scales: {
        yAxes: [{ ticks: { fontColor: "#ffffff" } }],
        xAxes: [
          {
            ticks: { fontColor: "#ffffff" },
            scaleLabel: {
              display: true,
              labelString: "Cost (USD)",
              fontColor: "#ffffff",
            },
          },
        ],
      },
      legend: { display: false },
    };
  }
  calculate() {
    this.hide = false;
    this.show = true;
    this.calculating = false;
    this.data = {
      labels: ["", "On Premise TCO", "Cloud TCO"],

      datasets: [
        {
          label: "$",
          backgroundColor: ["", "#7dbb2e", "#e44b48"],
          borderColor: ["", "#22c15d", "#FECC00"],
          data: [0, 0, 0],
        },
      ],
    };

    this.dataChart.length = 0;
    if (this.dataChart.length === 0) {
      this.zero = 0;
      this.totalotco =
        12 *
        (+this.realestate +
          +this.elecricity +
          +this.ssalary +
          +this.bandwidth +
          +this.storage);
      this.totalcTco = 12 * this.payment;

      this.dataChart.push(this.zero);
      this.dataChart.push(this.totalotco);
      this.dataChart.push(this.totalcTco);

      this.data.datasets[0].data = this.dataChart;

      setTimeout(() => {
        this.calculating = true;
      });
      if (this.totalotco != 0 && this.totalcTco != 0) {
        if (this.totalotco >= this.totalcTco) {
          this.tcounit = Number(
            ((100 * this.totalcTco) / this.totalotco).toFixed(2)
          );
          this.diffper = Number(100 - Number(this.tcounit)) + " %";
        } else {
          this.tcounit = Number(
            ((100 * this.totalotco) / this.totalcTco).toFixed(2)
          );
          this.diffper = Number(100 - Number(this.tcounit)) + " % (loss)";
        }
      }
    }
  }
}
