import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MesaDto, CreateMesaDto, UpdateMesaDto } from '../../shared/models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  private http = inject(HttpClient);

  getTables(): Observable<MesaDto[]> {
    return this.http.get<MesaDto[]>('/api/v1/orders/mesas');
  }

  getMesas(): Observable<MesaDto[]> {
    return this.http.get<MesaDto[]>('/api/v1/mesas');
  }

  createMesa(): Observable<MesaDto> {
    return this.http.post<MesaDto>('/api/v1/mesas', {});
  }

  updateMesa(id: string, data: UpdateMesaDto): Observable<MesaDto> {
    return this.http.put<MesaDto>(`/api/v1/mesas/${id}`, data);
  }

  deleteMesa(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/mesas/${id}`);
  }
}
