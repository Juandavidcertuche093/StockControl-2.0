import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environments';

import { ResponseApi } from '../../../core/interface/response-api';
import { MedicamentoEmpaque } from '../../../core/interface/medicamentoEmpaque.interface';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoEnpaqueService {

  private urlApi:string = environment.API_URL + "MedicamentoEmpaque/"

  private http = inject(HttpClient)

  constructor() { }

  lista(): Observable<ResponseApi> {
      return this.http.get<ResponseApi>(`${this.urlApi}Lista`).pipe(
        catchError((error) => {
          console.error('Error al obtener la lista de medicamentoEmpaque:', error);
          return of({ status: false, msg: 'Error al obtener la lista', value: null });
        })
      );
    }

    guardar(request: MedicamentoEmpaque): Observable<ResponseApi> {
      return this.http.post<ResponseApi>(`${this.urlApi}Guardar`, request).pipe(
        catchError((error) => {
          console.error('Error al guardar el medicamentoEnpaque:', error);
          return of({ status: false, msg: 'Error al guardar el medicamentoEmpaque', value: null });
        })
      );
    }

    editar(request: MedicamentoEmpaque): Observable<ResponseApi> {
      return this.http.put<ResponseApi>(`${this.urlApi}Editar`, request).pipe(
        catchError((error) => {
          console.error('Error al editar el medicamentoEmpaque:', error);
          return of({ status: false, msg: 'Error al editar el medicamentoEmpaque', value: null });
        })
      );
    }

    eliminar(id: number): Observable<ResponseApi> {
      return this.http.delete<ResponseApi>(`${this.urlApi}Eliminar/${id}`).pipe(
        catchError((error) => {
          console.error('Error al eliminar el medicamentoEmpaque:', error);
          return of({ status: false, msg: 'Error al eliminar el medicamentoEmpaque', value: null });
        })
      );
    }


}
