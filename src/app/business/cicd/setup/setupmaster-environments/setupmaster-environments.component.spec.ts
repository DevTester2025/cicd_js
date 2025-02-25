import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupmasterEnvironmentsComponent } from './setupmaster-environments.component';

describe('SetupmasterEnvironmentsComponent', () => {
  let component: SetupmasterEnvironmentsComponent;
  let fixture: ComponentFixture<SetupmasterEnvironmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupmasterEnvironmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupmasterEnvironmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
