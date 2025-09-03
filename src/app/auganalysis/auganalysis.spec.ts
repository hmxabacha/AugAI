import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AUGAnalysis } from './auganalysis';

describe('AUGAnalysis', () => {
  let component: AUGAnalysis;
  let fixture: ComponentFixture<AUGAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AUGAnalysis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AUGAnalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
