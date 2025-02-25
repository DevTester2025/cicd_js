import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditContainerRegistryComponent } from './add-edit-container-registry.component';

describe('AddEditContainerRegistryComponent', () => {
  let component: AddEditContainerRegistryComponent;
  let fixture: ComponentFixture<AddEditContainerRegistryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditContainerRegistryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditContainerRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
