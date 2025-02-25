import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProviderComponent } from './add-edit-provider.component';

describe('AddEditProviderComponent', () => {
  let component: AddEditProviderComponent;
  let fixture: ComponentFixture<AddEditProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
