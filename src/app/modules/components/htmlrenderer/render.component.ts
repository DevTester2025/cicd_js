import { Component, Input, OnInit, ViewEncapsulation, } from "@angular/core";

@Component({
    selector: "app-cloudmatiq-html-render",
    styles: [],
    templateUrl: "./render.component.html",
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class HTMLRenderComponent implements OnInit {

    @Input()
    html: string;

    constructor() { }
    ngOnInit() {
    }

}
