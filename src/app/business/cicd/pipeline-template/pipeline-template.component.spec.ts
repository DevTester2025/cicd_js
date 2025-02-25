import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineTemplateComponent } from './pipeline-template.component';

describe('PipelineTemplateComponent', () => {
  let component: PipelineTemplateComponent;
  let fixture: ComponentFixture<PipelineTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipelineTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
