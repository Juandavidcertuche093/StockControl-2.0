import { Component, computed, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2'

//angular/material
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableModule } from '@angular/material/table';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

//interfaces
import { DetalleCompra } from '../../../../core/interface/detallecompra.interface';
import { Compra } from '../../../../core/interface/compra.interface';
import {MedicamentoEmpaque} from '../../../../core/interface/medicamentoEmpaque.interface';
import {Proveedor} from '../../../../core/interface/proveedor.interface'

//servicios
import { CompraService } from '../../services/compra.service';
// import { ProductoVentaService } from '../../services/producto-venta.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import { AuthUsuarioService } from '../../../authentication/services/auth-usuario.service';
import { MedicamentoCompraService } from '../../services/medicamento-compra.service';
import {ProveedorCompraService} from '../../services/proveedor-compra.service'

//PrimeNG
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms'; // <-- Añade este import
import { SelectModule } from 'primeng/select'; // Para p-select

@Component({
  selector: 'app-buys-pages',
  imports: [
    CommonModule,
    MatDialogModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    CdkTableModule,
    MatTableModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    InputNumberModule,
    SelectModule

  ],
  templateUrl: './buys-pages.component.html',
  styleUrl: './buys-pages.component.scss'
})
export class BuysPagesComponent {

    listaMedicamento: MedicamentoEmpaque[] = []; // Lista de productos activos y con stock mayor a 0
    listaMedicamentoFiltro: MedicamentoEmpaque[] = []; // Lista de productos filtrados por nombre
    listaMedicamentosParaCompra: DetalleCompra[] = []; // Productos seleccionados para venta

    listaProveedores: Proveedor[]=[]
    listaProveedorFiltro:Proveedor[]=[]
    proveedorSeleccionado!: Proveedor//Almacena el proveedor seleccionado.

    bloquearBotonRegistro: boolean = false;
    productoSeleccionado!: MedicamentoEmpaque; // Producto seleccionado para agregar a la venta
    tipoPagoDefecto: string = 'Efectivo';
    totalApagar: number = 0;

    formularioMedicamentosCompra: FormGroup;
    columnasTabla: string[] = ["producto", "cantidad", "precioVenta", "total", "accion"];
    datosDetalleCompra = new MatTableDataSource(this.listaMedicamentosParaCompra);

    metodosPago = [
      { label: 'Efectivo', value: 'Efectivo' },
      { label: 'Tarjeta', value: 'Tarjeta' },
      { label: 'Transferencia', value: 'Transferencia' }
    ];


    constructor(
      private fb: FormBuilder,
      private medicamentoService: MedicamentoCompraService,
      private proveedorService: ProveedorCompraService,
      private compraService: CompraService,
      private utilidadService: UtilidadService,
      private authusuarioService: AuthUsuarioService
    ) {
      this.formularioMedicamentosCompra = this.fb.group({
        producto: ["", Validators.required],
        cantidad: ["", [Validators.required, Validators.min(1)]],
        proveedor: ["", Validators.required],
        presentacion: [{ value: "", disabled: true }]
      });

      // Obtener medicamentos
      this.medicamentoService.lista()
      .subscribe({
        next: (data) => {
          if (data.status) {
            const lista = data.value as MedicamentoEmpaque[];
            this.listaMedicamento = lista.filter(p => p.cantidad > 0 && p.esActivo == 1);
          }
        },
        error: (e) => { }
      });

    // Filtrar medicamentos por nombre en el formulario
    this.formularioMedicamentosCompra.get('producto')?.valueChanges
      .subscribe(value => {
        this.listaMedicamentoFiltro = this.retornaMedicamentosPorFiltro(value);
      });

      // Obtener proveedores
      this.proveedorService.lista()
      .subscribe({
        next: (data) => {
          if (data.status) {
            const lista = data.value as Proveedor[]
            this.listaProveedores = lista.filter(p => p.esActivo == 1)
            this.listaMedicamentoFiltro = data.value
          }
        },
        error: (e) => {
          console.error('Error al cargar el proveedor', e)
        }
      })
      this.formularioMedicamentosCompra.get('proveedor')?.valueChanges
        .subscribe(value => {
        this.listaProveedorFiltro = this.retornaProveedoresPorFiltro(value);
    });

  }

  retornaMedicamentosPorFiltro(search: string | MedicamentoEmpaque): MedicamentoEmpaque[] {
    const valorBuscado = typeof search === 'string' ? search.toLocaleLowerCase() : search.descripcionMedicamento.toLocaleLowerCase();
    return this.listaMedicamento.filter(item => item.descripcionMedicamento.toLocaleLowerCase().includes(valorBuscado));
  }

  retornaProveedoresPorFiltro(search: string | Proveedor): Proveedor[] {
    const valorBuscado = typeof search === 'string' ? search.toLocaleLowerCase() : search.nombre.toLocaleLowerCase();
    return this.listaProveedores.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado));
  }

  // MOSTRAR NOMBRE DEL PRODUCTO EN AUTOCOMPLETE
  mostrarMedicamentos(producto: MedicamentoEmpaque): string {
    return producto.descripcionMedicamento;
  }

  // MOSTRAR NOMBRE DEL PRODUCTO EN AUTOCOMPLETE
  mostrarProveedor(proveedor: Proveedor): string {
    return proveedor.nombre;
  }

  // ASIGNAR PRODUCTO SELECCIONADO
  medicamentosParaCompra(event: MatAutocompleteSelectedEvent) {
    const producto = event.option.value as MedicamentoEmpaque;
    this.productoSeleccionado = { ...producto };
    this.formularioMedicamentosCompra.get('presentacion')?.setValue(producto.descripcionPresentacion);
  }

  proveedorParaCompra(event: MatAutocompleteSelectedEvent){
    this.proveedorSeleccionado = event.option.value as Proveedor
 }

   // AGREGAR PRODUCTO A LA LISTA DE VENTA
   agregarMedicamentosParaCompra() {
    const _cantidad: number = this.formularioMedicamentosCompra.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precioCompra);
    const _total: number = _cantidad * _precio;

    if (_cantidad <= 0 || isNaN(_cantidad)) {
      this.utilidadService.mostrarAlerta('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    this.totalApagar += _total;

    this.listaMedicamentosParaCompra.push({
      idMedicamentoEmpaque: this.productoSeleccionado.idMedicamentoEmpaque,
      descripcionMedicamentoEmpaque: this.productoSeleccionado.descripcionMedicamento,
      cantidad: _cantidad,
      precioTexto: String(_precio),
      totalTexto: String(_total)
    });

    this.datosDetalleCompra = new MatTableDataSource(this.listaMedicamentosParaCompra);

    this.formularioMedicamentosCompra.patchValue({
      producto: "",
      cantidad: ""
    });
  }

  // ELIMINAR PRODUCTO DE LA LISTA DE VENTA
    eliminarMedicamento(detalle: DetalleCompra) {
      this.totalApagar -= parseFloat(detalle.totalTexto);
      this.listaMedicamentosParaCompra = this.listaMedicamentosParaCompra.filter(p => p.idMedicamentoEmpaque !== detalle.idMedicamentoEmpaque);
      this.datosDetalleCompra = new MatTableDataSource(this.listaMedicamentosParaCompra);
    }

  registrarCompra() {
      if (this.listaMedicamentosParaCompra.length === 0) {
        this.utilidadService.mostrarAlerta('No hay productos en la venta', 'info');
        return;
      }

      this.bloquearBotonRegistro = true;

      const request: Compra = {
        tipoPago: this.tipoPagoDefecto,
        totalTexto: String(this.totalApagar.toFixed()),
        idProveedor: this.proveedorSeleccionado.idProveedor,
        nombreProveedor: this.proveedorSeleccionado.nombre,
        fechaCompra: new Date().toISOString(), // ✅ Aquí agregas la fecha
        detalleCompras: this.listaMedicamentosParaCompra
      };

      this.compraService.registrar(request).subscribe({
        next: (response) => {
          if (response?.status) {
            this.totalApagar = 0.00;
            this.listaMedicamentosParaCompra = [];
            this.datosDetalleCompra = new MatTableDataSource(this.listaMedicamentosParaCompra);

            Swal.fire({
              icon: 'success',
              title: "Compra Registrada",
              text: `Número de venta: ${response.value.numCompra}`
            });
          } else {
            const mensaje = response?.msg || 'No se pudo registrar la compra';
            this.utilidadService.mostrarAlerta(mensaje, 'warning');
          }
        },
        error: (e) => {
          let mensaje = 'Error al registrar la compra';

          if (e.error) {
            if (e.error.msg) {
              mensaje = e.error.msg;
            } else if (typeof e.error === 'string') {
              mensaje = e.error;
            }
          }

          this.utilidadService.mostrarAlerta(mensaje, 'error');
        },
        complete: () => {
          this.bloquearBotonRegistro = false;
        }
      });
    }
}
