import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityGroup } from './security-group';

describe('SecurityGroup', () => {
  let component: SecurityGroup;
  let fixture: ComponentFixture<SecurityGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
