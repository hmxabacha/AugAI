import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalysisAi } from './data-analysis-ai';

describe('DataAnalysisAi', () => {
  let component: DataAnalysisAi;
  let fixture: ComponentFixture<DataAnalysisAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAnalysisAi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAnalysisAi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
