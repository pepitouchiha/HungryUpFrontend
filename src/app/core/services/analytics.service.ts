import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesSummaryDto {
  ingresosTotales: number;
  cantidadOrdenes: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  getSummary(periodo: 'dia' | 'semana' | 'mes'): Observable<SalesSummaryDto> {
    return this.http.get<SalesSummaryDto>(`/api/v1/analytics/sales-summary?periodo=${periodo}`);
  }
}
