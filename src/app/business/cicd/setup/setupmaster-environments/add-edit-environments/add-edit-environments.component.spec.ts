import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEnvironmentsComponent } from './add-edit-environments.component';

describe('AddEditEnvironmentsComponent', () => {
  let component: AddEditEnvironmentsComponent;
  let fixture: ComponentFixture<AddEditEnvironmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditEnvironmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditEnvironmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
