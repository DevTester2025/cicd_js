import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTestsComponent } from './add-edit-tests.component';

describe('AddEditTestsComponent', () => {
  let component: AddEditTestsComponent;
  let fixture: ComponentFixture<AddEditTestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
