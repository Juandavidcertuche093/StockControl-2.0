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
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';

//interfaces
import {Categoria} from '../../../../core/interface/categoria.interface';
import { Medicamento } from '../../../../core/interface/medicamento.interface';
import {Proveedor} from '../../../../core/interface/proveedor.interface';
import { ImagenMedicamento } from '../../../../core/interface/imagenMedicamento.interface'

//servicios
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../../category/services/categoria.service';
import { ProveedorService } from '../../../supplier/services/proveedor.service';
import { ImagenesproductoService } from '../../../images/services/imagenesproducto.service';
import { UtilidadService } from '../../../../services/utilidad.service';

import moment from 'moment';

import { numeroPositivo } from '../../../../core/utility/numeroPositivo';

//Define el formato de fecha que se usará en el componente (DD/MM/YYYY).
export const MY_DATA_FORMATS={
  parse:{
    dateInput: 'DD/MM/YYYY'
  },
  display:{
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY'
  }
}

@Component({
  selector: 'app-modal-producto',
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
    // MatNativeDateModule,
    MatMomentDateModule,
  ],
  templateUrl: './modal-producto.component.html',
  styleUrl: './modal-producto.component.scss',
  providers: [ // <--- ¡AÑADE ESTO!
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }, // Opcional: Establece el idioma (ej. Español)
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATA_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } } // Opcional: Configura si usar UTC o no
  ]
})
export class ModalProductoComponent implements OnInit {

  //PROPIEDADES
  formularioMedicamento: FormGroup;
  tituloAccion: string = 'Agregar';
  botonAccion: string = 'Guardar';
  listaCategoria: Categoria[] = []//nos muestra las lista de las catgorias que se obtinen desde la base de datos
  listaProveedor: Proveedor[] = []//nos muestra las lista de las proveedores que se obtinen desde la base de datos
  listaImagenProducto: ImagenMedicamento[] = []//nos muestra la lista de imagenes y nombre que se obtienen desde la base de datos


  constructor(
    private modalActual: MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosMedicamento: Medicamento,
    private fb: FormBuilder,
    private categoriaServicio: CategoriaService,
    private produnctoServicio: ProductoService,
    private utilidadServicio: UtilidadService,
    private proveedorServicio: ProveedorService,
    private imagenProductoServicio: ImagenesproductoService

  ){
    this.formularioMedicamento = this.fb.nonNullable.group({
      nombre:       ['', [Validators.required]],
      idCategoria:  ['', [Validators.required]],
      idProveedor:  ['', [Validators.required]],
      idImagen:     ['', [Validators.required]],
      stock:        [{ value: 0, disabled: true }, [Validators.required]], // Bloqueado y con valor predete
      fechaVencimiento:['', [Validators.required]],
      esActivo:     ['1', [Validators.required]],
    });
    if (this.datosMedicamento != null && this.datosMedicamento != undefined){
      this.tituloAccion = 'Editar'
      this.botonAccion = 'Actualizar'
    }
    //traemos la lista de categorias
    this.categoriaServicio.lista()
    .subscribe({
      next: (data) => {
        if (data.status) {
          const lista = data.value as Categoria[];
          this.listaCategoria = lista.filter(c => c.esActivo == 1)
        }
      },
      error: (e) => {}
    })

    //traemos la lista de proveedores
    this.proveedorServicio.lista()
    .subscribe({
      next: (data) => {
        if (data.status) {
          const lista = data.value as Proveedor[];
          this.listaProveedor = lista.filter(p => p.esActivo == 1)
        }
      },
      error: (e) => {}
    })

    //traemos la lista de imagenes del producto
    this.imagenProductoServicio.lista()
    .subscribe({
      next: (data) => {
        if(data.status)
          this.listaImagenProducto = data.value
      }
    })
  }

  ngOnInit(): void {
    if(this.datosMedicamento !== null && this.datosMedicamento !== undefined)

      this.formularioMedicamento.patchValue({
        nombre:       this.datosMedicamento.nombre,
        idCategoria:  this.datosMedicamento.idCategoria,
        idProveedor:  this.datosMedicamento.idProveedor,
        idImagen:     this.datosMedicamento.idImagen,
        stock:        this.datosMedicamento.stock,
        fechaVencimiento: moment(this.datosMedicamento.fechaVencimiento, 'DD/MM/YYYY').toDate(), // Convierte el string a Date
        esActivo:     this.datosMedicamento.esActivo
      })
  }

  GuardarEditar_Medicamento(){

    const fechaVenc = this.formularioMedicamento.value.fechaVencimiento instanceof moment
    ? this.formularioMedicamento.value.fechaVencimiento.format('DD/MM/YYYY')
    : moment(this.formularioMedicamento.value.fechaVencimiento).format('DD/MM/YYYY'); // Convierte Date a string

    //LOGICA PARA CREEAR Y ACTUALIAR EL PRODUCTO
    const _productos: Medicamento = {
      idMedicamento: this.datosMedicamento == null ? 0: this.datosMedicamento.idMedicamento,
      nombre: this.formularioMedicamento.value.nombre,
      idCategoria: this.formularioMedicamento.value.idCategoria,
      descripcionCategoria: "",//lo puedes dejar bacio si no se requiere
      idProveedor: this.formularioMedicamento.value.idProveedor,
      nombreProveedor:"",
      idImagen: this.formularioMedicamento.value.idImagen,
      nombreImagen:"",
      rutaImagen: "",
      fechaVencimiento: fechaVenc,// Aquí la fecha convertida a string
      stock: this.datosMedicamento ? this.datosMedicamento.stock : 0,
      esActivo: parseInt(this.formularioMedicamento.value.esActivo)
    }
    if (this.datosMedicamento == null){
      //LOGICA PARA CREEAR EL PRODUCTO
      this.produnctoServicio.guardar(_productos)
      .subscribe({
        next: (data) => {
          if(data.status) {
            this.utilidadServicio.mostrarAlerta('El medicamento se registro con exito','success')
            this.modalActual.close('true')
          } else
            this.utilidadServicio.mostrarAlerta(data.msg,'error')
        },
        error: (e) => {
          this.utilidadServicio.mostrarAlerta("Ocurrio un error al guardar el medicamento", "error")
        }
      })
    } else
      //LOGICA PARA ACTUALIZAR EL PRODUCTO
      this.produnctoServicio.editar(_productos)
      .subscribe({
        next: (data) => {
          if(data.status) {
            this.utilidadServicio.mostrarAlerta("EL medicamento se actualizo", "success")
            this.modalActual.close('true')
          } else
            this.utilidadServicio.mostrarAlerta("No se puede actualizar el medicamento","error")
        },
        error:(e) => {
        }
      })

  }

}
