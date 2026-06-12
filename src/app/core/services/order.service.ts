import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDto, CreatePedidoDto, EstadoPrep } from '../../shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  getOrders(estadoPrep?: EstadoPrep): Observable<PedidoDto[]> {
    if (estadoPrep) {
      return this.http.get<PedidoDto[]>('/api/v1/orders', { params: { estadoPrep } });
    }
    return this.http.get<PedidoDto[]>('/api/v1/orders');
  }

  createOrder(data: CreatePedidoDto): Observable<PedidoDto> {
    return this.http.post<PedidoDto>('/api/v1/orders', data);
  }

  updateStatus(id: string, nuevoEstado: EstadoPrep): Observable<void> {
    return this.http.put<void>(`/api/v1/orders/${id}/status`, { nuevoEstado });
  }

  payOrder(pedidoId: string): Observable<void> {
    return this.http.post<void>('/api/v1/billing/pay', {
      pedidoId,
      metodo: 'Efectivo',
      montoPagado: 0
    });
  }
}
