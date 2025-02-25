import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  AfterViewInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/amchartsdark";
import * as _ from "lodash";

@Component({
  selector: "app-realtime-monitoring",
  templateUrl:
    "../../../../../presentation/web/base/assets/monitoring-dashboard/realtime-monitoring.component.html",
  styleUrls: ["./realtime-monitoring.component.css"],
})
export class RealtimeMonitoringComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  dataList = [];
  timeperiod = "off";
  range = "24";
  instanceList = [
    {
      title: "Brasilia",
      instancename: "DE1-TMS037",
      datacollected: false,
    },
    {
      title: "Copenhagen",
      instancename: "ECL-DE1-LBS023",
      datacollected: false,
    },
    {
      title: "Paris",
      instancename: "AWS-StorageGW",
      datacollected: false,
    },
    {
      title: "Brussels",
      instancename: "ECL-US1-ws016-Restore-OS1",
      datacollected: false,
    },
    {
      title: "Reykjavik",
      instancename: "ECLUS1PROBE04",
      datacollected: true,
    },
    {
      title: "Moscow",
      instancename: "UK1-TMS028",
      datacollected: true,
    },
    {
      title: "Madrid",
      instancename: "UK1-TMS027",
      datacollected: true,
    },
    {
      title: "London",
      instancename: "DE1-TMS038",
      datacollected: true,
    },
    {
      title: "Japan",
      instancename: "ECLDE1PROBE03",
      datacollected: true,
    },
    {
      title: "New Delhi",
      instancename: "DE1VSQLT0009",
      datacollected: true,
    },
    {
      title: "Tokyo",
      instancename: "DE1VSQLT0008",
      datacollected: true,
    },
  ];
  regionLocationMap = {} as any;
  constructor() {
    am4core.useTheme(am4themes_dark);
  }

  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}
  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log(changes);
  //   this.getRealTimeMonitoring();
  // }
  ngOnInit() {
    console.log("reals");
    let self = this;
    setTimeout(function () {
      self.getRealTimeMonitoring();
    }, 1000);
  }
  getSummaryStyles(data) {
    let myStyles = {
      "background-color": null,
    };
    if (data.datacollected == false) {
      myStyles["background-color"] = "rgb(253 163 156 / 38%)";
    } else if (data.datacollected == true) {
      myStyles["background-color"] = "rgb(251 236 51 / 36%)";
    }
    return myStyles;
  }
  getRealTimeMonitoring() {
    // Create map instance
    let chart = am4core.create("rtm", am4maps.MapChart);
    console.log(chart);
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
    console.log(polygonSeries);
    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;

    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.polygon.fillOpacity = 0.6;

    // let london = polygonSeries.getPolygonById("JP");
    // console.log(london);
    // london.isHover = true;
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
    imageSeries.data = [];
    this.regionLocationMap = {
      uk1: {
        title: "United Kingdom",
        latitude: 53.381443,
        longitude: -3.733769,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      jp1: {
        title: "Japan - Saitama",
        latitude: 36.0183003,
        longitude: 138.7452578,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      jp2: {
        title: "Japan - Osaka",
        latitude: 34.6778456,
        longitude: 135.3459777,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      jp3: {
        title: "Japan",
        latitude: 31.7144407,
        longitude: 120.2669839,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      jp4: {
        title: "Japan - Tokyo",
        latitude: 35.6684415,
        longitude: 139.600781,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      jp5: {
        title: "Japan - Tokyo",
        latitude: 35.5911209,
        longitude: 139.7268504,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      jp6: {
        title: "Japan - Kinrakuji",
        latitude: 34.7274644,
        longitude: 135.4227113,
        instancenames: [],
        count: 0,
      },
      us1: {
        title: "USA Washington DC",
        latitude: 38.89378,
        longitude: -77.1546623,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      de1: {
        title: "Germany",
        latitude: 52.5069312,
        longitude: 13.1445471,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      fr1: {
        title: "France",
        latitude: 48.8589507,
        longitude: 2.2770198,
        instancenames: [],
        count: 0,
      },
      sg1: {
        title: "Singapore",
        latitude: 1.3440852,
        longitude: 103.6839561,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      hk1: {
        title: "Hong Kong",
        latitude: 22.3531176,
        longitude: 113.8474986,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "us-east-1": {
        title: "Virginia, USA",
        latitude: 37.9863992,
        longitude: -81.6648192,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "us-east-2": {
        title: "Ohio, USA",
        latitude: 40.3417249,
        longitude: -84.9124694,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "us-west-1": {
        title: "California, USA",
        latitude: 37.1929956,
        longitude: -123.7997506,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "us-west-2": {
        title: "Oregon, USA",
        latitude: 44.1274366,
        longitude: -122.8268953,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "af-south-1": {
        title: "Cape Town, South Africa",
        latitude: -33.9131287,
        longitude: 18.0955908,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "ap-east-1": {
        title: "Hong Kong",
        latitude: 22.3531176,
        longitude: 113.8474986,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "ap-south-1": {
        title: "Mumbai, India",
        latitude: 19.0825223,
        longitude: 72.7410978,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "ap-northeast-2": {
        title: "Seoul, South Korea",
        latitude: 37.5652894,
        longitude: 126.8494635,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "eu-central-1": {
        title: "Frankfurt, Germany",
        latitude: 50.1213479,
        longitude: 8.4964792,
        instancenames: [],
        count: 0,
      },
      "ap-southeast-1": {
        title: "Singapore",
        latitude: 1.3440852,
        longitude: 103.6839561,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "ap-southeast-2": {
        title: "Sydney, Australia",
        latitude: -33.8473567,
        longitude: 150.651782,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "ap-northeast-1": {
        title: "Japan - Tokyo",
        latitude: 35.6684415,
        longitude: 139.600781,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "ca-central-1": {
        title: "Canada",
        latitude: 50.8549217,
        longitude: -130.2094884,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "eu-west-1": {
        title: "Ireland",
        latitude: 53.3057486,
        longitude: -12.704559,
        instancenames: [],
        count: 0,
      },
      "eu-west-2": {
        title: "London, UK",
        latitude: 51.5287352,
        longitude: -0.3817841,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "eu-south-1": {
        title: "Milan, Europe",
        latitude: 51.5035138,
        longitude: -0.3832302,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "eu-west-3": {
        title: "Paris, France",
        latitude: 48.8589507,
        longitude: 2.2770198,
        instancenames: [],
        count: 0,
      },
      "eu-north-1": {
        title: "Stockholm, Sweden",
        latitude: 59.326242,
        longitude: 17.8419696,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "me-south-1": {
        title: "Bahrain",
        latitude: 25.9411069,
        longitude: 50.0270766,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
      "sa-east-1": {
        title: "Sao Paulo, Brazil",
        latitude: -23.6815314,
        longitude: -46.8754974,
        instancenames: [],
        count: 0,
        active: 0,
        inactive: 0,
      },
    };
    let colorSet = new am4core.ColorSet();
    let self = this;
    _.map(this.dataList, function (elemnt) {
      for (const key in self.regionLocationMap) {
        if (self.regionLocationMap.hasOwnProperty(key)) {
          if (key == elemnt.region) {
            self.regionLocationMap[key]["instancenames"].push(
              elemnt.instancename
            );
            self.regionLocationMap[key]["count"] =
              self.regionLocationMap[key]["count"] + 1;
            if (elemnt.datacollected == true) {
              self.regionLocationMap[key]["active"] =
                self.regionLocationMap[key]["active"] + 1;
            }
            if (elemnt.datacollected == false) {
              self.regionLocationMap[key]["inactive"] =
                self.regionLocationMap[key]["inactive"] + 1;
            }
            imageSeries.data.push({
              ...self.regionLocationMap[key],
              // "color": '#eeeab5'
              color: "#52c41a",
            });
          }
        }
      }
    });
    _.map(imageSeries.data, function (o: any) {
      if (o.inactive > 0) {
        o.color = "#f5222d";
      }
      return o;
    });
    imageSeries.data = [...imageSeries.data];
    console.log(imageSeries.data);
    imageSeries.mapImages.template.tooltipText =
      "{title}\n Total Instances:{count}\n Active:{active}\nInactive:{inactive}";
    // imageSeries.data = [{
    //   "title": "Brussels",
    //   "latitude": 50.8371,
    //   "longitude": 4.3676,
    //   "color": '#008000'
    // }, {
    //   "title": "Copenhagen",
    //   "latitude": 55.6763,
    //   "longitude": 12.5681,
    //   "color": '#008000'
    // }, {
    //   "title": "Paris",
    //   "latitude": 48.8567,
    //   "longitude": 2.3510,
    //   "color": '#008000'
    // }, {
    //   "title": "Reykjavik",
    //   "latitude": 64.1353,
    //   "longitude": -21.8952,
    //   "color": '#008000'
    // }, {
    //   "title": "Moscow",
    //   "latitude": 55.7558,
    //   "longitude": 37.6176,
    //   "color": '#008000'
    // }, {
    //   "title": "Madrid",
    //   "latitude": 40.4167,
    //   "longitude": -3.7033,
    //   "color": '#008000'
    // }, {
    //   "title": "London",
    //   "latitude": 51.5002,
    //   "longitude": -0.1262,
    //   "url": "http://www.google.co.uk",
    //   "color": '#008000'
    // }, {
    //   "title": "Peking",
    //   "latitude": 39.9056,
    //   "longitude": 116.3958,
    //   "color": '#FF0000'
    // }, {
    //   "title": "New Delhi",
    //   "latitude": 28.6353,
    //   "longitude": 77.2250,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Tokyo",
    //   "latitude": 35.6785,
    //   "longitude": 139.6823,
    //   "url": "http://www.google.co.jp",
    //   "color": '#FF0000'
    // }, {
    //   "title": "Ankara",
    //   "latitude": 39.9439,
    //   "longitude": 32.8560,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Buenos Aires",
    //   "latitude": -34.6118,
    //   "longitude": -58.4173,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Brasilia",
    //   "latitude": -15.7801,
    //   "longitude": -47.9292,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Ottawa",
    //   "latitude": 45.4235,
    //   "longitude": -75.6979,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Washington",
    //   "latitude": 38.8921,
    //   "longitude": -77.0241,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Kinshasa",
    //   "latitude": -4.3369,
    //   "longitude": 15.3271,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Cairo",
    //   "latitude": 30.0571,
    //   "longitude": 31.2272,
    //   "color": '#FF0000'
    // }, {
    //   "title": "Pretoria",
    //   "latitude": -25.7463,
    //   "longitude": 28.1876,
    //   "color": '#FF0000'
    // }];
    chart.events.on("ready", function (ev) {
      hideIndicator();
    });
    function hideIndicator() {
      indicator.hide();
    }
  }

  notifyEntry(event) {
    console.log(event);
    if (event.data) {
      this.dataList = event.data;
      this.getRealTimeMonitoring();
    }
  }
}
