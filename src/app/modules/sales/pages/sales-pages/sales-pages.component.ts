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
import { DetalleVenta } from '../../../../core/interface/detalleventa.interface';
import { Venta } from '../../../../core/interface/venta.interface';
import {MedicamentoEmpaque} from '../../../../core/interface/medicamentoEmpaque.interface'

//servicios
import { VentaService } from '../../services/venta.service';
// import { ProductoVentaService } from '../../services/producto-venta.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import { AuthUsuarioService } from '../../../authentication/services/auth-usuario.service';
import { MedicamentoEmpaqueService } from '../../services/medicamento-empaque.service';

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
  selector: 'app-sales-pages',
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
    CardModule,
    AutoCompleteModule,
    ProgressSpinnerModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    FormsModule,
    SelectModule
  ],
  templateUrl: './sales-pages.component.html',
  styleUrl: './sales-pages.component.scss'
})
export class SalesPagesComponent implements OnInit {

  // PROPIEDADES Y VARIABLES
  listaMedicamento: MedicamentoEmpaque[] = []; // Lista de medicametos activos y con stock mayor a 0
  listaMedicamentosFiltro: MedicamentoEmpaque[] = []; // Lista de medicamentos filtrados por búsqueda
  listaMedicamentosParaVenta: DetalleVenta[] = []; // Productos seleccionados para venta
  bloquearBotonRegistro: boolean = false;
  productoSeleccionado!: MedicamentoEmpaque; // medicamento seleccionado para agregar a la venta
  tipoPagoDefecto: string = 'Efectivo';
  totalApagar: number = 0;

  formularioMedicamentosVenta: FormGroup;
  columnasTabla: string[] = ["producto", "cantidad", "precioVenta", "total", "accion"];
  datosDetalleVenta = new MatTableDataSource(this.listaMedicamentosParaVenta);

  // Agrega esta propiedad para los métodos de pago
  metodosPago = [
    { label: 'Efectivo', value: 'Efectivo' },
    { label: 'Tarjeta', value: 'Tarjeta' },
    { label: 'Transferencia', value: 'Transferencia' }
  ];

  constructor(
    private fb: FormBuilder,
    private medicametoVentaService: MedicamentoEmpaqueService,
    private authusuarioService: AuthUsuarioService,
    private ventaService: VentaService,
    private utilidadService: UtilidadService
  ) {
    this.formularioMedicamentosVenta = this.fb.nonNullable.group({
      producto: [null, [Validators.required]],
      cantidad: ["", [Validators.required, Validators.min(1)]],
      presentacion: [{ value: '', disabled: true }],
      metodosPago: [this.tipoPagoDefecto] // Nombre consistente y valor por defecto
    });

    // Cargar lista de productos activos y con stock mayor a 0
    this.medicametoVentaService.lista()
      .subscribe({
        next: (data) => {
          if (data.status) {
            const lista = data.value as MedicamentoEmpaque[];
            this.listaMedicamento = lista.filter(p => p.cantidad > 0 && p.esActivo === 1);
            // console.log('Productos cargados:', this.listaProducto); // Debug
          }
        },
        error: (e) => {
          console.error('Error al cargar medicamentos:', e);
          this.utilidadService.mostrarAlerta('Error al cargar medicamentos', 'error');
        }
      });

    // Filtrar productos por nombre en el formulario
    this.formularioMedicamentosVenta.get('producto')?.valueChanges
      .subscribe(value => {
        this.listaMedicamentosFiltro = this.retornaProductosPorFiltro(value);
      });
  }

  ngOnInit(): void { }

  // BUSCAR MEDICAMENTO POR FILTRO
  retornaProductosPorFiltro(search: string | MedicamentoEmpaque): MedicamentoEmpaque[] {
    const valorBuscado = typeof search === 'string' ? search.toLocaleLowerCase() : search.descripcionMedicamento
    .toLocaleLowerCase();
    return this.listaMedicamento.filter(item => item.descripcionMedicamento.toLocaleLowerCase().includes(valorBuscado));
  }



  // MOSTRAR NOMBRE DEL PRODUCTO EN AUTOCOMPLETE
  mostrarMedicamento = (producto: MedicamentoEmpaque): string => {
    return producto ? producto.descripcionMedicamento : '';
  };

  // ASIGNAR MEDICAMENTO SELECCIONADO
  medicamentoParaVenta(event: MatAutocompleteSelectedEvent) {
    const producto = event.option.value as MedicamentoEmpaque;
    this.productoSeleccionado = { ...producto };
    this.formularioMedicamentosVenta.get('presentacion')?.setValue(producto.descripcionPresentacion);
  }


  // AGREGAR MEDICAMENTO A LA LISTA DE VENTA
  agregarMedicamentoParaVenta() {
    const _cantidad: number = this.formularioMedicamentosVenta.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precioVenta);
    const _total: number = _cantidad * _precio;

    if (_cantidad <= 0 || isNaN(_cantidad)) {
      this.utilidadService.mostrarAlerta('La cantidad debe ser mayor a 0', 'error');
      return;
    }


    // if (this.productoSeleccionado.cantidad < _cantidad) {
    //   this.utilidadService.mostrarAlerta('No hay suficiente stock para este producto', 'warning');
    //   return;
    // }

    this.totalApagar += _total;

    this.listaMedicamentosParaVenta.push({
      idMedicamentoEmpaque: this.productoSeleccionado.idMedicamentoEmpaque,
      descripcionProductoEmpaque: this.productoSeleccionado.descripcionMedicamento,
      cantidad: _cantidad,
      precioTexto: String(_precio),
      totalTexto: String(_total)
    });

    this.datosDetalleVenta = new MatTableDataSource(this.listaMedicamentosParaVenta);

    this.formularioMedicamentosVenta.patchValue({
      producto: "",
      cantidad: ""
    });
  }


  // ELIMINAR PRODUCTO DE LA LISTA DE VENTA
  eliminarMedicamento(detalle: DetalleVenta) {
    this.totalApagar -= parseFloat(detalle.totalTexto);
    this.listaMedicamentosParaVenta = this.listaMedicamentosParaVenta.filter(p => p.idMedicamentoEmpaque !== detalle.idMedicamentoEmpaque);
    this.datosDetalleVenta = new MatTableDataSource(this.listaMedicamentosParaVenta);
  }

  registrarVenta() {
    if (this.listaMedicamentosParaVenta.length === 0) {
      this.utilidadService.mostrarAlerta('No hay medicamentos en la venta', 'info');
      return;
    }

    this.bloquearBotonRegistro = true;

    const usuarioSesion = this.authusuarioService.currentUser();
    const idUsuario = usuarioSesion ? usuarioSesion.idUsuario : '';
    const usuarioDescripcion = usuarioSesion ? usuarioSesion.rolDescripcion : '';

    const request: Venta = {
      tipoPago: this.tipoPagoDefecto,
      totalTexto: String(this.totalApagar.toFixed()),
      IdUsuario: idUsuario,
      usuarioDescripcion: usuarioDescripcion,
      detalleventa: this.listaMedicamentosParaVenta
    };

    this.ventaService.registrar(request).subscribe({
      next: (response) => {
        if (response?.status) {
          this.totalApagar = 0.00;
          this.listaMedicamentosParaVenta = [];
          this.datosDetalleVenta = new MatTableDataSource(this.listaMedicamentosParaVenta);

          Swal.fire({
            icon: 'success',
            title: "Venta Registrada",
            text: `Número de venta: ${response.value.numVenta}`
          });
        } else {
          const mensaje = response?.msg || 'No se pudo registrar la venta';
          this.utilidadService.mostrarAlerta(mensaje, 'warning');
        }
      },
      error: (e) => {
        let mensaje = 'Error al registrar la venta';

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
