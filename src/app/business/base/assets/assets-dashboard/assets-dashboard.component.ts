import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/amchartsdark";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { AssetsService } from "../assets.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
@Component({
  selector: "app-assets-dashboard",
  templateUrl:
    "../../../../presentation/web/base/assets/assets-dashboard.component.html",
  styleUrls: ["./assets-dashboard.component.css"],
})
export class AssetsDashboardComponent
  implements OnInit, AfterViewChecked, AfterViewInit {
  screens = [];
  providerList = [];
  cloudprovider = "AWS";
  appScreens = {} as any;
  userstoragedata;

  assetsList = [
    "ASSET_INSTANCE",
    "ASSET_NETWORK",
    "ASSET_LB",
    "ASSET_FIREWALL",
    "ASSET_IG",
    "ASSET_CFG",
    "ASSET_VOLUME",
  ];
  assetsListNameMap = {
    ASSET_INSTANCE: "Instances",
    ASSET_NETWORK: "Network",
    ASSET_VOLUME: "Volume",
    ASSET_CFG: "CFG",
    ASSET_IG: "Internet Gateway",
    ASSET_LB: "Load Balancer",
    ASSET_FIREWALL: "Firewall",
  };

  assets = {} as any;
  assetsCount = [];
  assetWiseCosts = null;
  loading = false;

  constructor(
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private commonService: CommonService,
    private assetService: AssetsService
  ) {
    am4core.useTheme(am4themes_dark);
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_MANAGEMENT,
    });
    this.getproviderList();
  }
  ngAfterViewInit(): void { }
  ngAfterViewChecked(): void { }

  ngOnInit() {
    this.getCostByCount();
  }
  onProviderChange(event) {
    this.getCostByCount();
  }
  getproviderList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.map((el) => {
          this.providerList.push(el.keyname);
        });
        this.cloudprovider = this.providerList[0];
        this.getAssetsCount();
      } else {
        this.providerList = [];
      }
    });
  }
  getAssetsCount() {
    this.loading = true;
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.BASE.ASSETS.COUNT +
        "?tenantid=" +
        this.userstoragedata.tenantid
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);

          if (response.status) {
            response.data.map((el) => {
              if (this.providerList.includes(el.cloudprovider)) {
                this.assetsCount.push(el);
              }
            });
            this.drawProviderWiseAssetsCountChart();
            this.drawProviderWiseAssetsChart();
            this.drawLocationWiseAssetsChart();
          }
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          console.log(err);
        }
      );
  }

  getCostByCount() {
    this.loading = true;
    this.assetService
      .getCost(
        `?tenantid=${this.userstoragedata.tenantid}&cloudprovider=${this.cloudprovider}`
      )
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);

          this.loading = false;

          if (response.status) {
            let assetWiseCosts = {};
            this.assetWiseCosts = response.data;
          }

          this.drawResourceWiseCostChart();
        },
        (err) => {
          this.loading = false;
          console.log(err);
        }
      );
  }

  getAssetsByType(assetType: string) {
    this.loading = true;
    let f = {
      provider: "ECL2",
      asset: assetType,
      data: {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      },
    };

    this.assetService.listByFilters(f).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.assets[assetType] = response.data.assets;
        } else {
        }

        if (this.assetsList.indexOf(assetType) == this.assetsList.length - 1) {
          this.drawProviderWiseAssetsCountChart();
          this.drawLocationWiseAssetsChart();
          this.drawResourceWiseCostChart();
        }
        this.loading = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  drawProviderWiseAssetsCountChart() {
    let chart = am4core.create("pds", am4charts.PieChart);
    let indicator;

    function showIndicator() {
      if (!indicator) {
        indicator = chart.tooltipContainer.createChild(am4core.Container);
        indicator.width = am4core.percent(100);
        indicator.height = am4core.percent(100);

        var indicatorLabel = indicator.createChild(am4core.Label);
        indicatorLabel.text = "Loading...";
        indicatorLabel.align = "left";
        indicatorLabel.valign = "middle";
        indicatorLabel.dy = 50;
      }

      indicator.show();
    }
    showIndicator();
    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "provider";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeOpacity = 1;

    // Let's cut a hole in our Pie chart the size of 30% the radius
    pieSeries.labels.template.hidden = true;
    pieSeries.ticks.template.disabled = true;
    pieSeries.slices.template.tooltipText = "{category} : {currency}{value}";

    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;

    chart.hiddenState.properties.radius = am4core.percent(0);

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(
      new am4core.DropShadowFilter()
    );
    shadow.opacity = 0;

    // Create hover state
    let hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter());
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // Custom colors
    var colorSet = new am4core.ColorSet();
    colorSet.list = ["#e47911", "#0080B1", "#FF6701", "#008AD7", "#EA4335"].map(
      function (color) {
        return am4core.color(color);
      }
    );
    pieSeries.colors = colorSet;

    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.align = "center";
    chart.legend.position = "right";
    chart.legend.fontSize = "11px";
    chart.legend.scale = 0.8;

    chart.legend.useDefaultMarker = true;
    const marker: any = chart.legend.markers.template.children.getIndex(0);
    marker.cornerRadius(12, 12, 12, 12);

    chart.data = [];

    if (this.assetsCount && this.assetsCount.length > 0) {
      let nttTotal = 0;
      let awsTotal = 0;

      for (let index = 0; index < this.assetsCount.length; index++) {
        const element = this.assetsCount[index];
        if (
          element["assettype"] != "REGION" &&
          element["cloudprovider"] == "ECL2"
        ) {
          nttTotal += parseInt(element["value"]);
        }
        if (
          element["assettype"] != "REGION" &&
          element["cloudprovider"] == "AWS"
        ) {
          awsTotal += parseInt(element["value"]);
        }
      }
      if (this.providerList.includes('AWS')) {
        chart.data.push(
          {
            provider: "AWS",
            count: awsTotal,
          });
      }
      if (this.providerList.includes('ECL2')) {
        chart.data.push(
          {
            provider: "ECL2",
            count: nttTotal,
          });
      }
    } else {
      chart.data = [];
    }
    chart.events.on("ready", function (ev) {
      hideIndicator();
    });
    function hideIndicator() {
      indicator.hide();
    }
  }

  drawLocationWiseAssetsChart() {
    let chart = am4core.create("lwa", am4maps.MapChart);
    let indicator;
    function showIndicator() {
      if (!indicator) {
        indicator = chart.tooltipContainer.createChild(am4core.Container);
        indicator.width = am4core.percent(100);
        indicator.height = am4core.percent(100);

        var indicatorLabel = indicator.createChild(am4core.Label);
        indicatorLabel.text = "Loading...";
        indicatorLabel.align = "left";
        indicatorLabel.valign = "middle";
        indicatorLabel.dy = 50;
      }

      // indicator.hide(0);
      indicator.show();
    }
    showIndicator();
    // Set map definition
    chart.geodata = am4geodata_worldLow;

    // Set projection
    chart.projection = new am4maps.projections.Miller();

    // Create map polygon series
    let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    // Exclude Antartica
    polygonSeries.exclude = ["AQ"];

    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;

    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.polygon.fillOpacity = 0.6;

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = chart.colors.getIndex(0);

    // Add image series
    let imageSeries = chart.series.push(new am4maps.MapImageSeries());
    imageSeries.mapImages.template.propertyFields.longitude = "longitude";
    imageSeries.mapImages.template.propertyFields.latitude = "latitude";
    imageSeries.mapImages.template.tooltipText = "{title}";
    imageSeries.mapImages.template.propertyFields.url = "url";

    let circle = imageSeries.mapImages.template.createChild(am4core.Circle);
    circle.radius = 3;
    circle.propertyFields.fill = "color";

    let circle2 = imageSeries.mapImages.template.createChild(am4core.Circle);
    circle2.radius = 3;
    circle2.propertyFields.fill = "color";

    circle2.events.on("inited", function (event) {
      animateBullet(event.target);
    });

    function animateBullet(circle) {
      let animation = circle.animate(
        [
          { property: "scale", from: 1, to: 5 },
          { property: "opacity", from: 1, to: 0 },
        ],
        1000,
        am4core.ease.circleOut
      );
      animation.events.on("animationended", function (event) {
        animateBullet(event.target.object);
      });
    }

    let colorSet = new am4core.ColorSet();

    imageSeries.data = [];

    let regions = {};

    let regionLocationMap = {
      uk1: {
        title: "United Kingdom",
        latitude: 53.381443,
        longitude: -3.733769,
      },
      jp1: {
        title: "Japan - Saitama",
        latitude: 36.0183003,
        longitude: 138.7452578,
      },
      jp2: {
        title: "Japan - Osaka",
        latitude: 34.6778456,
        longitude: 135.3459777,
      },
      jp3: {
        title: "Japan",
        latitude: 31.7144407,
        longitude: 120.2669839,
      },
      jp4: {
        title: "Japan - Tokyo",
        latitude: 35.6684415,
        longitude: 139.600781,
      },
      jp5: {
        title: "Japan - Tokyo",
        latitude: 35.5911209,
        longitude: 139.7268504,
      },
      jp6: {
        title: "Japan - Kinrakuji",
        latitude: 34.7274644,
        longitude: 135.4227113,
      },
      us1: {
        title: "USA Washington DC",
        latitude: 38.89378,
        longitude: -77.1546623,
      },
      de1: {
        title: "Germany",
        latitude: 52.5069312,
        longitude: 13.1445471,
      },
      fr1: {
        title: "France",
        latitude: 48.8589507,
        longitude: 2.2770198,
      },
      sg1: {
        title: "Singapore",
        latitude: 1.3440852,
        longitude: 103.6839561,
      },
      hk1: {
        title: "Hong Kong",
        latitude: 22.3531176,
        longitude: 113.8474986,
      },
      "us-east-1": {
        title: "Virginia, USA",
        latitude: 37.9863992,
        longitude: -81.6648192,
      },
      "us-east-2": {
        title: "Ohio, USA",
        latitude: 40.3417249,
        longitude: -84.9124694,
      },
      "us-west-1": {
        title: "California, USA",
        latitude: 37.1929956,
        longitude: -123.7997506,
      },
      "us-west-2": {
        title: "Oregon, USA",
        latitude: 44.1274366,
        longitude: -122.8268953,
      },
      "af-south-1": {
        title: "Cape Town, South Africa",
        latitude: -33.9131287,
        longitude: 18.0955908,
      },
      "ap-east-1": {
        title: "Hong Kong",
        latitude: 22.3531176,
        longitude: 113.8474986,
      },
      "ap-south-1": {
        title: "Mumbai, India",
        latitude: 19.0825223,
        longitude: 72.7410978,
      },
      "ap-northeast-2": {
        title: "Seoul, South Korea",
        latitude: 37.5652894,
        longitude: 126.8494635,
      },
      "eu-central-1": {
        title: "Frankfurt, Germany",
        latitude: 50.1213479,
        longitude: 8.4964792,
      },
      "ap-southeast-1": {
        title: "Singapore",
        latitude: 1.3440852,
        longitude: 103.6839561,
      },
      "ap-southeast-2": {
        title: "Sydney, Australia",
        latitude: -33.8473567,
        longitude: 150.651782,
      },
      "ap-northeast-1": {
        title: "Japan - Tokyo",
        latitude: 35.6684415,
        longitude: 139.600781,
      },
      "ca-central-1": {
        title: "Canada",
        latitude: 50.8549217,
        longitude: -130.2094884,
      },
      "eu-west-1": {
        title: "Ireland",
        latitude: 53.3057486,
        longitude: -12.704559,
      },
      "eu-west-2": {
        title: "London, UK",
        latitude: 51.5287352,
        longitude: -0.3817841,
      },
      "eu-south-1": {
        title: "Milan, Europe",
        latitude: 51.5035138,
        longitude: -0.3832302,
      },
      "eu-west-3": {
        title: "Paris, France",
        latitude: 48.8589507,
        longitude: 2.2770198,
      },
      "eu-north-1": {
        title: "Stockholm, Sweden",
        latitude: 59.326242,
        longitude: 17.8419696,
      },
      "me-south-1": {
        title: "Bahrain",
        latitude: 25.9411069,
        longitude: 50.0270766,
      },
      "sa-east-1": {
        title: "Sao Paulo, Brazil",
        latitude: -23.6815314,
        longitude: -46.8754974,
      },
    };

    let assetRegions = this.assetsCount.filter(
      (o) => o["assettype"] == "REGION"
    );

    if (assetRegions) {
      for (let j = 0; j < assetRegions.length; j++) {
        const element = assetRegions[j];
        if (element.value != null) {
          let r = element.value.split(",");
          for (let index = 0; index < r.length; index++) {
            const element = r[index];
            regions[element] = 1;
          }
        }
      }
    }

    for (const key in regions) {
      if (regions.hasOwnProperty(key)) {
        const assetCount = regions[key];
        imageSeries.data.push({
          ...regionLocationMap[key],
          color: "#eeeab5",
        });
      }
    }
    chart.events.on("ready", function (ev) {
      hideIndicator();
    });
    function hideIndicator() {
      indicator.hide();
    }
  }

  drawResourceWiseCostChart() {
    let chart = am4core.create("awc", am4charts.PieChart);
    let indicator;

    function showIndicator() {
      if (!indicator) {
        indicator = chart.tooltipContainer.createChild(am4core.Container);
        // indicator.background.fill = am4core.color('#fff');
        indicator.width = am4core.percent(100);
        indicator.height = am4core.percent(100);

        var indicatorLabel = indicator.createChild(am4core.Label);
        indicatorLabel.text = "Loading...";
        indicatorLabel.align = "left";
        indicatorLabel.valign = "middle";
        indicatorLabel.dy = 50;
      }

      // indicator.hide(0);
      indicator.show();
    }
    showIndicator();
    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "cost";
    pieSeries.dataFields.category = "type";
    let color = "";
    if (this.cloudprovider == "AWS") {
      color = "#e47911";
    }
    if (this.cloudprovider == "ECL2") {
      color = "#0080B1";
    }
    pieSeries.stroke = am4core.color(color);
    pieSeries.fill = am4core.color(color);
    pieSeries.colors.list = [am4core.color(color)];
    // pieSeries.slices.template.stroke = am4core.color("#fff");

    // Let's cut a hole in our Pie chart the size of 30% the radius
    chart.innerRadius = am4core.percent(30);
    pieSeries.labels.template.hidden = true;
    pieSeries.ticks.template.disabled = true;
    pieSeries.slices.template.tooltipText = "{category} : {currency}{value}";

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(
      new am4core.DropShadowFilter()
    );
    shadow.opacity = 0;

    // Create hover state
    let hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter());
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.align = "center";
    chart.legend.position = "right";
    chart.legend.fontSize = "13px";
    chart.legend.scale = 0.8;

    chart.data = [];

    if (this.assetWiseCosts && this.assetWiseCosts.length > 0) {
      this.assetWiseCosts.forEach((element) => {
        chart.data.push({
          type: element.assettype,
          cost: element.actualamount,
          currency: element.currency,
        });
      });
    } else {
      chart.data = [
        {
          type: "Billings not available",
          cost: 100,
          currency: "",
        },
      ];
    }
    chart.events.on("ready", function (ev) {
      hideIndicator();
    });
    function hideIndicator() {
      indicator.hide();
    }
  }

  drawProviderWiseAssetsChart() {
    let chart = am4core.create("pwac", am4charts.XYChart);
    let indicator;
    function showIndicator() {
      if (!indicator) {
        indicator = chart.tooltipContainer.createChild(am4core.Container);
        // indicator.background.fill = am4core.color('#fff');
        indicator.width = am4core.percent(100);
        indicator.height = am4core.percent(100);

        var indicatorLabel = indicator.createChild(am4core.Label);
        indicatorLabel.text = "Loading...";
        indicatorLabel.align = "left";
        indicatorLabel.valign = "middle";
        indicatorLabel.dy = 50;
      }

      // indicator.hide(0);
      indicator.show();
    }
    showIndicator();
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "top";
    chart.legend.paddingBottom = 20;
    chart.legend.labels.template.maxWidth = 95;

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = "category";
    xAxis.renderer.cellStartLocation = 0.1;
    xAxis.renderer.cellEndLocation = 0.9;
    xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.minGridDistance = 50;

    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;

    function createSeries(value, name) {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = value;
      series.dataFields.categoryX = "category";
      series.name = name;
      series.columns.template.tooltipText =
        "Asset: {categoryX}\n Count: {valueY}";
      let color = "";
      if (value == "aws") {
        color = "#e47911";
      }
      if (value == "ntt") {
        color = "#0080B1";
      }
      series.stroke = am4core.color(color);
      series.columns.template.adapter.add("fill", function (fill, target) {
        series.stroke = am4core.color(color);
        return am4core.color(color);
      });

      series.events.on("hidden", arrangeColumns);
      series.events.on("shown", arrangeColumns);

      let bullet = series.bullets.push(new am4charts.LabelBullet());
      bullet.interactionsEnabled = true;
      bullet.dy = 30;
      bullet.label.text = "{valueY}";
      bullet.label.fill = am4core.color("#ffffff");

      return series;
    }

    chart.data = [];

    for (let index = 0; index < this.assetsCount.length; index++) {
      const element = this.assetsCount[index];
      if (
        element["assettype"] != "REGION" &&
        element["cloudprovider"] == "ECL2"
      ) {
        chart.data.push({
          category: element["assettype"],
          ntt: parseInt(element["value"]),
        });
      }
      if (
        element["assettype"] != "REGION" &&
        element["cloudprovider"] == "AWS"
      ) {
        chart.data.push({
          category: element["assettype"],
          aws: parseInt(element["value"]),
        });
      }
    }
    if (this.providerList.includes('AWS')) {
      createSeries("aws", "AWS");
    }
    if (this.providerList.includes('ECL2')) {
      createSeries("ntt", "ECL2");
    }

    function arrangeColumns() {
      let series = chart.series.getIndex(0);

      let w =
        1 -
        xAxis.renderer.cellStartLocation -
        (1 - xAxis.renderer.cellEndLocation);
      if (series.dataItems.length > 1) {
        let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
        let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
        let delta = ((x1 - x0) / chart.series.length) * w;
        if (am4core.isNumber(delta)) {
          let middle = chart.series.length / 2;

          let newIndex = 0;
          chart.series.each(function (series) {
            if (!series.isHidden && !series.isHiding) {
              series.dummyData = newIndex;
              newIndex++;
            } else {
              series.dummyData = chart.series.indexOf(series);
            }
          });
          let visibleCount = newIndex;
          let newMiddle = visibleCount / 2;

          chart.series.each(function (series) {
            let trueIndex = chart.series.indexOf(series);
            let newIndex = series.dummyData;

            let dx = (newIndex - trueIndex + middle - newMiddle) * delta;

            series.animate(
              { property: "dx", to: dx },
              series.interpolationDuration,
              series.interpolationEasing
            );
            series.bulletsContainer.animate(
              { property: "dx", to: dx },
              series.interpolationDuration,
              series.interpolationEasing
            );
          });
        }
      }
    }
    chart.events.on("ready", function (ev) {
      hideIndicator();
    });
    function hideIndicator() {
      indicator.hide();
    }
  }
}
