import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileHistoryComponent } from './file-history-table';

describe('FileHistoryTable', () => {
  let component: FileHistoryComponent;
  let fixture: ComponentFixture<FileHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
