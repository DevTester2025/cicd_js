import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupmasterProvidersComponent } from './setupmaster-providers.component';

describe('SetupmasterProvidersComponent', () => {
  let component: SetupmasterProvidersComponent;
  let fixture: ComponentFixture<SetupmasterProvidersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupmasterProvidersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupmasterProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
