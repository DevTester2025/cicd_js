import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RequestApproversComponent } from "./request-approvers.component";

describe("RequestApproversComponent", () => {
  let component: RequestApproversComponent;
  let fixture: ComponentFixture<RequestApproversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestApproversComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestApproversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
