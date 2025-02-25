import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CatalogRequestComponent } from "./catalog-request.component";

describe("CatalogRequestComponent", () => {
  let component: CatalogRequestComponent;
  let fixture: ComponentFixture<CatalogRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CatalogRequestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
