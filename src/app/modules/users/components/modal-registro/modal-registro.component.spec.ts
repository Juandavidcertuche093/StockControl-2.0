import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegistroComponent } from './modal-registro.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ModalRegistroComponent', () => {
  let component: ModalRegistroComponent;
  let fixture: ComponentFixture<ModalRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRegistroComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: {} }, // Mock data if needed
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
