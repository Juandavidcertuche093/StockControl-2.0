import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationpackagingPagesComponent } from './medicationpackaging-pages.component';

describe('MedicationpackagingPagesComponent', () => {
  let component: MedicationpackagingPagesComponent;
  let fixture: ComponentFixture<MedicationpackagingPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationpackagingPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationpackagingPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
