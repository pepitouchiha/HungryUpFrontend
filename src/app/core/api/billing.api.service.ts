import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagoDto, ProcesarPagoDto } from './api.types';

const BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private http = inject(HttpClient);

  procesarPago(dto: ProcesarPagoDto): Observable<PagoDto> {
    return this.http.post<PagoDto>(`${BASE}/billing/pay`, dto);
  }
}
