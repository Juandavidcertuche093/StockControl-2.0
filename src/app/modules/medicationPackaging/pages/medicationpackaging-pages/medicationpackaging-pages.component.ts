import { AfterViewInit, Component, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

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

//compoenente modal
import { ModalProductoempaqueComponent } from '../../components/modal-productoempaque/modal-productoempaque.component';

//interface
import { MedicamentoEmpaque } from '../../../../core/interface/medicamentoEmpaque.interface';

//servicios
import { UtilidadService } from '../../../../services/utilidad.service';
import { PresentacionService } from '../../services/presentacion.service';
import { MedicamentoEnpaqueService } from '../../services/medicamento-enpaque.service';
import { MedicamentoService } from '../../services/medicamento.service';
import Swal from 'sweetalert2';

//PrimeNG
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'; //
import { IconFieldModule } from 'primeng/iconfield'; // <-- Añadir este
import { InputIconModule } from 'primeng/inputicon'; // <-- Añadir este
import { FloatLabelModule } from 'primeng/floatlabel'; // <-- Añadir este

@Component({
  selector: 'app-medicationpackaging-pages',
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    TableModule,
    BadgeModule,
    ButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule
  ],
  templateUrl: './medicationpackaging-pages.component.html',
  styleUrl: './medicationpackaging-pages.component.scss'
})
export class MedicationpackagingPagesComponent implements OnInit {

  columnaTabla: string[] = ['producto', 'presentacion', 'cantidad','precioVenta', 'acciones']
  dataInicio: MedicamentoEmpaque[] = []
  listaMedicamentoEmpaque: MedicamentoEmpaque[] = []
  loading: boolean = false; // Opcional: para el spinner de p-table
  // dataListaProductoEnpaque = new MatTableDataSource(this.dataInicio)

  constructor(
    private dialog: MatDialog,
    private medicamentoEnpaqueService: MedicamentoEnpaqueService,
    private utilidadServicio: UtilidadService,
  ){}


  obtenerMedicamentosEnpaque(){
    this.medicamentoEnpaqueService.lista()
    .subscribe({
      next: (data) => {
        if(data.status){
          // Asigna los datos al array para p-table
          this.listaMedicamentoEmpaque = data.value
        } else {
          this.listaMedicamentoEmpaque = []; // Limpia la lista si no hay datos
          this.utilidadServicio.mostrarAlerta('Error al obtener Empaques. Intente más tarde.', 'error');
        }
        this.loading = false; // Termina carga
      },
      error: (e) => {
        this.loading = false; // Termina carga en caso de error
        // this.utilidadServicio.mostrarAlerta('Error al obtener productos', 'error');
      },
    })
  }

  ngOnInit(): void {
    this.obtenerMedicamentosEnpaque();
  }

  aplicarFiltroTabla(event: Event, dt: any) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dt.filterGlobal(filterValue, 'contains');
  }

  //metodo para el modal de crear productoEmpaque
    nuevoMedicamentoEmpaque(){
      this.dialog.open(ModalProductoempaqueComponent,{
        disableClose: true,
        width: '600px',        // o '90%' para ocupar casi toda la pantalla
        maxHeight: '90vh',     // evita scroll innecesario
        autoFocus: false       // opcional, evita scroll automático al primer input
      }).afterClosed().subscribe(resultado => {
        if(resultado === 'true')this.obtenerMedicamentosEnpaque();
      });
    }

    //metodo para el modal de actualizar productoEmpaque
    editarMedicamentoEmpaque(productoEmpaque:MedicamentoEmpaque){
      this.dialog.open(ModalProductoempaqueComponent,{
        disableClose:true,
        data: productoEmpaque,
        width: '800px', // o '80%' si prefieres relativo a la ventana
      }).afterClosed().subscribe(resultado => {
        if(resultado === 'true')this.obtenerMedicamentosEnpaque();
      });
    }

    //metodo para elimainar un producto
      eliminarProductoEmpaque(productoEmpaque:MedicamentoEmpaque){
        //libreria de alertas personalizadas
        Swal.fire({
          title:'¿Desea eliminar el Medicamento Empaque',
          // text: producto.nombre,
          html: `<p style="font-size: 1.5rem; font-weight: bold;">${productoEmpaque.descripcionMedicamento}</p>`,
          icon:'warning',
          confirmButtonColor:'#3085d6',
          confirmButtonText:'Si, eliminar',
          showCancelButton:true,
          cancelButtonColor: '#d33',
          cancelButtonText:'No, volver'
        }).then((resultado) => {

          if(resultado.isConfirmed){
            this.medicamentoEnpaqueService.eliminar(productoEmpaque.idMedicamentoEmpaque)
            .subscribe({
              next:(data) => {
                if(data.status){
                  this.utilidadServicio.mostrarAlerta("El medicamentoEmpaque fue eliminado","success");
                  this.obtenerMedicamentosEnpaque();
                }else
                this.utilidadServicio.mostrarAlerta("No se pudo eliminar el medicamentoEmpaque","error");
              },
              error:(e) => {}
            })
          }
        })
      }

}
