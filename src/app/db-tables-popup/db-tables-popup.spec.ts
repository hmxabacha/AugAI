import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbTablesPopup } from './db-tables-popup';

describe('DbTablesPopup', () => {
  let component: DbTablesPopup;
  let fixture: ComponentFixture<DbTablesPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbTablesPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DbTablesPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
