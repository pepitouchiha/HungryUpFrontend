import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePedidoDto, EstadoPreparacion, MesaDto, PedidoDto } from './api.types';

const BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private http = inject(HttpClient);

  getPedidos(estadoPrep?: EstadoPreparacion): Observable<PedidoDto[]> {
    if (estadoPrep) {
      return this.http.get<PedidoDto[]>(`${BASE}/orders`, { params: { estadoPrep } });
    }
    return this.http.get<PedidoDto[]>(`${BASE}/orders`);
  }

  getMesas(): Observable<MesaDto[]> {
    return this.http.get<MesaDto[]>(`${BASE}/orders/mesas`);
  }

  createPedido(dto: CreatePedidoDto): Observable<PedidoDto> {
    return this.http.post<PedidoDto>(`${BASE}/orders`, dto);
  }

  updateEstado(id: string, nuevoEstado: EstadoPreparacion): Observable<void> {
    return this.http.put<void>(`${BASE}/orders/${id}/status`, { nuevoEstado });
  }
}
