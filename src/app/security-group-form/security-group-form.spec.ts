import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityGroupForm } from './security-group-form';

describe('SecurityGroupForm', () => {
  let component: SecurityGroupForm;
  let fixture: ComponentFixture<SecurityGroupForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityGroupForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityGroupForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
