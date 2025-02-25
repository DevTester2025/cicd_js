import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GenericRequestComponent } from "./generic-request.component";

describe("GenericRequestComponent", () => {
  let component: GenericRequestComponent;
  let fixture: ComponentFixture<GenericRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GenericRequestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
