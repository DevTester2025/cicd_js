import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupmasterContainerRegistryComponent } from './setupmaster-container-registry.component';

describe('SetupmasterContainerRegistryComponent', () => {
  let component: SetupmasterContainerRegistryComponent;
  let fixture: ComponentFixture<SetupmasterContainerRegistryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupmasterContainerRegistryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupmasterContainerRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
