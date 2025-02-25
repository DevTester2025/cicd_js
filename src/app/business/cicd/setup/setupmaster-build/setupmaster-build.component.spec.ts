import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupmasterBuildComponent } from './setupmaster-build.component';

describe('SetupmasterBuildComponent', () => {
  let component: SetupmasterBuildComponent;
  let fixture: ComponentFixture<SetupmasterBuildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupmasterBuildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupmasterBuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
