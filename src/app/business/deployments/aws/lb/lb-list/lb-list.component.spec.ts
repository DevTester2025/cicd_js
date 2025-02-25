import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AWSLbListComponent } from "./lb-list.component";

describe("AWSLbListComponent", () => {
  let component: AWSLbListComponent;
  let fixture: ComponentFixture<AWSLbListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AWSLbListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AWSLbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
