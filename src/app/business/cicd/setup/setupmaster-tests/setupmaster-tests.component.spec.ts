import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupmasterTestsComponent } from './setupmaster-tests.component';

describe('SetupmasterTestsComponent', () => {
  let component: SetupmasterTestsComponent;
  let fixture: ComponentFixture<SetupmasterTestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupmasterTestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupmasterTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
