import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Periodo, SalesSummaryDto } from './api.types';

const BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private http = inject(HttpClient);

  getSalesSummary(periodo: Periodo = 'dia'): Observable<SalesSummaryDto> {
    return this.http.get<SalesSummaryDto>(`${BASE}/analytics/sales-summary`, {
      params: { periodo }
    });
  }
}
