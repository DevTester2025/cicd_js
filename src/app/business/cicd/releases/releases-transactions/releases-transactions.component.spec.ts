import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleasesTransactionsComponent } from './releases-transactions.component';

describe('ReleasesTransactionsComponent', () => {
  let component: ReleasesTransactionsComponent;
  let fixture: ComponentFixture<ReleasesTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleasesTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleasesTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
