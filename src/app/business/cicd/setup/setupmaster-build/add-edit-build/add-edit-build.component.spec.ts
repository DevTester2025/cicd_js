import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBuildComponent } from './add-edit-build.component';

describe('AddEditBuildComponent', () => {
  let component: AddEditBuildComponent;
  let fixture: ComponentFixture<AddEditBuildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditBuildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditBuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
