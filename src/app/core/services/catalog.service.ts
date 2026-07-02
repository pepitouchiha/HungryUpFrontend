import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CategoriaDto, CreateCategoriaDto, UpdateCategoriaDto,
  ProductoDto, CreateProductoDto, UpdateProductoDto
} from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  getCategories(): Observable<CategoriaDto[]> {
    return this.http.get<CategoriaDto[]>('/api/v1/categories');
  }

  createCategory(data: CreateCategoriaDto): Observable<CategoriaDto> {
    return this.http.post<CategoriaDto>('/api/v1/categories', data);
  }

  updateCategory(id: string, data: UpdateCategoriaDto): Observable<CategoriaDto> {
    return this.http.put<CategoriaDto>(`/api/v1/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/categories/${id}`);
  }

  getProducts(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>('/api/v1/products');
  }

  getProduct(id: string): Observable<ProductoDto> {
    return this.http.get<ProductoDto>(`/api/v1/products/${id}`);
  }

  createProduct(data: CreateProductoDto): Observable<ProductoDto> {
    return this.http.post<ProductoDto>('/api/v1/products', data);
  }

  updateProduct(id: string, data: UpdateProductoDto): Observable<ProductoDto> {
    return this.http.put<ProductoDto>(`/api/v1/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/products/${id}`);
  }

  uploadProductImage(id: string, file: File): Observable<ProductoDto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ProductoDto>(`/api/v1/products/${id}/image`, form);
  }
}
