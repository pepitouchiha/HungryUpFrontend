import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MesaDto } from '../../shared/models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  private http = inject(HttpClient);

  getTables(): Observable<MesaDto[]> {
    return this.http.get<MesaDto[]>('/api/v1/orders/mesas');
  }
}
