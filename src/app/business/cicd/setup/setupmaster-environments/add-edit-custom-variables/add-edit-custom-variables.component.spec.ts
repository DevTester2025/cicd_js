import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCustomVariablesComponent } from './add-edit-custom-variables.component';

describe('AddEditCustomVariablesComponent', () => {
  let component: AddEditCustomVariablesComponent;
  let fixture: ComponentFixture<AddEditCustomVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditCustomVariablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCustomVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
