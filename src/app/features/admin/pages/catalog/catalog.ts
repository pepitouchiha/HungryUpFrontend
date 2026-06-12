import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CategoriaDto, ProductoDto, CreateProductoDto } from '../../../../shared/models/product.model';
import { CatalogService } from '../../../../core/services/catalog.service';

@Component({
  selector: 'app-catalog',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {
  private fb             = inject(FormBuilder);
  private catalogService = inject(CatalogService);

  protected activeTab  = signal<'categories' | 'products'>('products');
  protected loading    = signal(true);
  protected categories = signal<CategoriaDto[]>([]);
  protected products   = signal<ProductoDto[]>([]);
  protected showModal  = signal(false);

  protected productForm = this.fb.nonNullable.group({
    nombre:       ['', Validators.required],
    precio:       [0.01, [Validators.required, Validators.min(0.01)]],
    stockInicial: [1,    [Validators.required, Validators.min(0)]],
    categoriaId:  ['',   Validators.required],
  });

  ngOnInit(): void {
    forkJoin({
      categories: this.catalogService.getCategories(),
      products:   this.catalogService.getProducts()
    }).subscribe(({ categories, products }) => {
      this.categories.set(categories);
      this.products.set(products);
      this.loading.set(false);
    });
  }

  protected openCreateProduct(): void {
    const firstCatId = this.categories().find(c => c.activo)?.id ?? '';
    this.productForm.reset({ nombre: '', precio: 0.01, stockInicial: 1, categoriaId: firstCatId });
    this.showModal.set(true);
  }

  protected saveProduct(): void {
    if (this.productForm.invalid) return;
    const v = this.productForm.getRawValue() as CreateProductoDto;
    this.catalogService.createProduct(v).subscribe(prod => {
      this.products.update(ps => [...ps, prod]);
      this.closeModal();
    });
  }

  protected closeModal(): void { this.showModal.set(false); }

  protected categoryName(id: string): string {
    return this.categories().find(c => c.id === id)?.nombre ?? '—';
  }
}
