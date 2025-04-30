import { AfterViewInit, Component, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { forkJoin, timer, Observable, of } from 'rxjs'; // Importar operadores RxJS
import { catchError, finalize, map, tap } from 'rxjs/operators'; // Importar operadores RxJS

//angular Material
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {DialogModule} from '@angular/cdk/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import { CdkTableModule } from '@angular/cdk/table';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

//compoenente modal
import { ModalProductoComponent } from '../../components/modal-producto/modal-producto.component';

//interface
import { Medicamento } from '../../../../core/interface/medicamento.interface';

//servicios
import { ProductoService } from '../../services/producto.service';
import { UtilidadService } from '../../../../services/utilidad.service';
import Swal from 'sweetalert2';

//PrimeNG
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {OrderByPipe} from '../../../../shared/pipes/order-by.pipe'

@Component({
  selector: 'app-list-medication-page',
  imports: [
    MatTableModule,
    CdkTableModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatMomentDateModule,
    TableModule,
    BadgeModule,
    ButtonModule,
    OrderByPipe,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    ProgressSpinnerModule
  ],
  templateUrl: './list-medication-page.component.html',
  styleUrl: './list-medication-page.component.scss'
})
export class ListMedicationPageComponent implements OnInit {

  columnaTabla: string[] = ['nombre', 'categoria', 'imgProducto', 'stock', 'fechaVencimiento', 'estado', 'acciones'];
  dataInicio:Medicamento[]=[];
  listaMedicamentos: Medicamento[] = []; // Usar un array simple para p-table
  loading: boolean = false; // Opcional: para el spinner de p-table
  // dataListaMProductos = new MatTableDataSource(this.dataInicio);


  constructor(
    private dialog: MatDialog,
    private productoServicio: ProductoService,
    private utilidadServicio: UtilidadService
  ){}

  obtenerProductos(): void {
    this.loading = true; // Mostrar spinner
    this.listaMedicamentos = []; // Opcional: Limpiar datos previos inmediatamente

    const minLoadingTime = 1000; // 1 segundos de tiempo mínimo de carga

    // Observable que emite los datos o un array vacío en caso de error/status false
    const data$: Observable<Medicamento[]> = this.productoServicio.lista().pipe(
        map(response => {
            if (response.status) {
                return response.value;
            } else {
                // Mostrar alerta si no hay datos, pero continuar con array vacío
                this.utilidadServicio.mostrarAlerta('No se encontraron datos', 'warning');
                return [];
            }
        }),
        catchError(error => {
            console.error('Error al obtener medicamentos:', error); // Es bueno loguear el error real
            // Mostrar alerta de error y continuar con array vacío
            this.utilidadServicio.mostrarAlerta('Error al obtener productos', 'error');
            return of([]); // Devuelve un observable con un array vacío para que forkJoin no falle
        })
    );
    // Observable que emite un valor después de 2 segundos
    const delay$ = timer(minLoadingTime);

    // forkJoin espera a que AMBOS observables (datos y timer) completen
    forkJoin({ data: data$, delay: delay$ })
        .pipe(
            // finalize se ejecuta siempre, ya sea que forkJoin complete o falle (aunque catchError previene fallos aquí)
            finalize(() => {
                this.loading = false; // Ocultar spinner SIEMPRE al finalizar todo
            })
        )
        .subscribe(results => {
            // Este bloque se ejecuta DESPUÉS de que los datos llegaron Y pasaron los 2 segundos
            this.listaMedicamentos = results.data;
        });
}

  ngOnInit(): void {
    this.obtenerProductos();
  }

   //metodo para filtrar
   aplicarFiltroTabla(event: Event, dt: any) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dt.filterGlobal(filterValue, 'contains');
  }

  //metodo para el valor del stock
  // getStockClass(stock: number): string {
  //   if (stock > 10) return 'stock-alto';
  //   if (stock > 0) return 'stock-bajo';
  //   return '';
  // }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'bg-red-100 text-red-800';
    if (stock <= 10) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-900';
  }

  //metodo para el modal de crear producto
  nuevoMedicamento(){
    this.dialog.open(ModalProductoComponent,{
      disableClose: true,
      width: '600px',        // o '90%' para ocupar casi toda la pantalla
      maxHeight: '90vh',     // evita scroll innecesario
      autoFocus: false       // opcional, evita scroll automático al primer input
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    });
  }

  //metodo para el modal de actualizar producto
  editarMedicamento(producto:Medicamento){
    this.dialog.open(ModalProductoComponent,{
      disableClose:true,
      data: producto
    }).afterClosed().subscribe(resultado => {
      if(resultado === 'true')this.obtenerProductos();
    });
  }

  //metodo para elimainar un producto
  eliminarProducto(producto:Medicamento){
    //libreria de alertas personalizadas
    Swal.fire({
      title:'¿Desea eliminar el Medicamento?',
      // text: producto.nombre,
      html: `<p style="font-size: 1.5rem; font-weight: bold;">${producto.nombre}</p>`,
      icon:'warning',
      confirmButtonColor:'#3085d6',
      confirmButtonText:'Si, eliminar',
      showCancelButton:true,
      cancelButtonColor: '#d33',
      cancelButtonText:'No, volver'
    }).then((resultado) => {

      if(resultado.isConfirmed){
        this.productoServicio.eliminar(producto.idMedicamento)
        .subscribe({
          next:(data) => {
            if(data.status){
              this.utilidadServicio.mostrarAlerta("El medicamento fue eliminado","success");
              this.obtenerProductos();
            }else
            this.utilidadServicio.mostrarAlerta("No se pudo eliminar el medicamento","error");
          },
          error:(e) => {}
        })
      }
    })
  }


}
