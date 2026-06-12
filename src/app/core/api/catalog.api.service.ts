import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProductoDto, ProductoDto } from './api.types';

const BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private http = inject(HttpClient);

  getProductos(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(`${BASE}/products`);
  }

  createProducto(dto: CreateProductoDto): Observable<ProductoDto> {
    return this.http.post<ProductoDto>(`${BASE}/products`, dto);
  }
}
