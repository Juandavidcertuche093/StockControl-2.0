import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

//angular/material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

//interfaces
import { Medicamento } from '../../../../core/interface/medicamento.interface';
import { MedicamentoEmpaque } from '../../../../core/interface/medicamentoEmpaque.interface';
import {Presentacion} from '../../../../core/interface/presentacion.interface';

//servicios
import { MedicamentoService } from '../../services/medicamento.service';
import { PresentacionService } from '../../services/presentacion.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import { MedicamentoEnpaqueService } from '../../services/medicamento-enpaque.service';

import { numeroPositivo } from '../../../../core/utility/numeroPositivo';

@Component({
  selector: 'app-modal-productoempaque',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './modal-productoempaque.component.html',
  styleUrl: './modal-productoempaque.component.scss'
})
export class ModalProductoempaqueComponent implements OnInit {

  formularioMedicamentoEnpaque: FormGroup;
  tituloAccion: string = 'Agregar';
  botonAccion: string = 'Guardar';
  listaPresentacion: Presentacion[] = [];
  listaMedicamento: Medicamento[] = []

  constructor(
    private modalActual: MatDialogRef<ModalProductoempaqueComponent>,
    @Inject(MAT_DIALOG_DATA) public datosMedicamentoEmpaque: MedicamentoEmpaque,
    private fb: FormBuilder,
    private utilidadServicio: UtilidadService,
    private presentacionServicio: PresentacionService,
    private medicamentoEnpaqueServicio: MedicamentoEnpaqueService,
    private medicamentoServicio: MedicamentoService
  ){
    this.formularioMedicamentoEnpaque = this.fb.nonNullable.group({
      idMedicamento:    ['', [Validators.required]],
      idPresentacion:   ['', [Validators.required]],
      cantidad:         ['', [Validators.required,]],
      precioVenta:      ['', [Validators.required, Validators.min(1), numeroPositivo]],
      precioCompra:     ['', [Validators.required, Validators.min(1), numeroPositivo]],
      esActivo:         ['1', [Validators.required]],
    });
    if(this.datosMedicamentoEmpaque != null && this.datosMedicamentoEmpaque != undefined){
      this.tituloAccion = 'Editar'
      this.botonAccion = 'Actualizar'
    }
    this.medicamentoServicio.lista()
    .subscribe({
      next: (data) => {
        if (data.status) {
          const lista = data.value as Medicamento[];
          this.listaMedicamento = lista.filter(p => p.esActivo == 1)
        }
      },
      error: (e) => {}
    })

    this.presentacionServicio.lista()
    .subscribe({
      next: (data) => {
        if(data.status) {
          this.listaPresentacion = data.value
        }
      },
      error: (e) => {}
    })
  }

  ngOnInit(): void {
    if(this.datosMedicamentoEmpaque !== null && this.datosMedicamentoEmpaque !== undefined)

      this.formularioMedicamentoEnpaque.patchValue({
        idMedicamento:     this.datosMedicamentoEmpaque.idMedicamento,
        idPresentacion: this.datosMedicamentoEmpaque.idPresentacion,
        cantidad:       this.datosMedicamentoEmpaque.cantidad,
        // precioVenta:    this.datosMedicamentoEmpaque.precioVenta,
        precioVenta:    this.convertirPrecio(this.datosMedicamentoEmpaque.precioVenta),
        // precioCompra:    this.datosMedicamentoEmpaque.precioCompra,
        precioCompra:    this.convertirPrecio(this.datosMedicamentoEmpaque.precioCompra),
        esActivo:       this.datosMedicamentoEmpaque.esActivo,
      })
  }

  private convertirPrecio(valor: string): number {
    // Reemplaza coma por punto y convierte a número
    return parseFloat(valor.replace(',', '.'));
  }

  guardarEditar_MedicamentoEnpaque(){
    const _medicamentoEnpaque: MedicamentoEmpaque = {
      idMedicamentoEmpaque: this.datosMedicamentoEmpaque == null ? 0: this.datosMedicamentoEmpaque.idMedicamentoEmpaque,
      idMedicamento: this.formularioMedicamentoEnpaque.value.idMedicamento,
      descripcionMedicamento: "",
      idPresentacion: this.formularioMedicamentoEnpaque.value.idPresentacion,
      descripcionPresentacion: "",
      cantidad: this.formularioMedicamentoEnpaque.value.cantidad,
      // precioVenta: this.formularioMedicamentoEnpaque.value.precioVenta,
      precioVenta: parseFloat(this.formularioMedicamentoEnpaque.value.precioVenta ?? '0').toString(),
      // precioCompra: this.formularioMedicamentoEnpaque.value.precioCompra,
      precioCompra: parseFloat(this.formularioMedicamentoEnpaque.value.precioCompra ?? '0').toString(),
      esActivo: parseInt(this.formularioMedicamentoEnpaque.value.esActivo)
    }
    if(this.datosMedicamentoEmpaque == null){

      // console.log('Datos a enviar a la API:', _medicamentoEnpaque); // <--- Agrega esto

      this.medicamentoEnpaqueServicio.guardar(_medicamentoEnpaque)
      .subscribe({
        next: (data) => {
          if(data.status){
            this.utilidadServicio.mostrarAlerta('El medicamentoEmpaque se registro con Exito', 'success')
            this.modalActual.close('true')
          } else
            this.utilidadServicio.mostrarAlerta(data.msg, 'error')
        },
        error: (e) => {
          this.utilidadServicio.mostrarAlerta("Ocurrio un error al guardar el medicamentoEmpaque", "error")
        }
      })
    } else
      this.medicamentoEnpaqueServicio.editar(_medicamentoEnpaque)
      .subscribe({
        next: (data) => {
          if(data.status){
            this.utilidadServicio.mostrarAlerta('El medicamentoEmpaque se actualizo', 'success')
            this.modalActual.close(true)
          } else
            this.utilidadServicio.mostrarAlerta('No se puede actualizar el medicamemtoEmpaque', 'error')
        },
        error:(e) => {}
      })
  }

}
