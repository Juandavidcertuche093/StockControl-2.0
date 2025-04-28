import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMedicationPageComponent } from './list-medication-page.component';

describe('ListMedicationPageComponent', () => {
  let component: ListMedicationPageComponent;
  let fixture: ComponentFixture<ListMedicationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMedicationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMedicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
