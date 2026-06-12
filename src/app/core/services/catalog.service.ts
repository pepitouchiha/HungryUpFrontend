import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaDto, ProductoDto, CreateProductoDto } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  getCategories(): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>('/api/v1/categories');
  }

  getProducts(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>('/api/v1/products');
  }

  createProduct(data: CreateProductoDto): Observable<ProductoDto> {
    return this.http.post<ProductoDto>('/api/v1/products', data);
  }
}
