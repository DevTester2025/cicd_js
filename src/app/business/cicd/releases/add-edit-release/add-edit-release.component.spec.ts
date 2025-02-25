import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditReleaseComponent } from './add-edit-release.component';

describe('AddEditReleaseComponent', () => {
  let component: AddEditReleaseComponent;
  let fixture: ComponentFixture<AddEditReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
