import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  CategoriaDto, ProductoDto, CreateProductoDto, UpdateProductoDto
} from '../../../../shared/models/product.model';
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

  // ── Products ──────────────────────────────────────────────────────────────
  protected productModalMode   = signal<'create' | 'edit' | null>(null);
  protected editingProductId    = signal<string | null>(null);
  protected editingProductImage = signal<string | null>(null);
  protected selectedFile        = signal<File | null>(null);
  protected uploadingImage      = signal(false);

  protected productForm = this.fb.nonNullable.group({
    nombre:      ['', Validators.required],
    precio:      [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    stock:       [1, [Validators.required, Validators.min(0)]],
    categoriaId: ['', Validators.required],
  });

  // ── Categories ────────────────────────────────────────────────────────────
  protected categoryModalMode  = signal<'create' | 'edit' | null>(null);
  protected editingCategoryId  = signal<string | null>(null);

  protected categoryForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    activo: [true],
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

  // ── Product actions ─────────────────────────────────────────────────────

  protected openCreateProduct(): void {
    const firstCatId = this.categories().find(c => c.activo)?.id ?? '';
    this.productForm.reset({ nombre: '', precio: 0, stock: 1, categoriaId: firstCatId });
    this.editingProductId.set(null);
    this.editingProductImage.set(null);
    this.selectedFile.set(null);
    this.productModalMode.set('create');
  }

  protected openEditProduct(prod: ProductoDto): void {
    this.productForm.reset({
      nombre: prod.nombre, precio: prod.precio, stock: prod.stockActual, categoriaId: prod.categoriaId
    });
    this.editingProductId.set(prod.id);
    this.editingProductImage.set(prod.imagenUrl);
    this.selectedFile.set(null);
    this.productModalMode.set('edit');
  }

  protected saveProduct(): void {
    if (this.productForm.invalid) return;
    const v = this.productForm.getRawValue();

    if (this.productModalMode() === 'create') {
      const dto: CreateProductoDto = {
        nombre: v.nombre, precio: v.precio, stockInicial: v.stock, categoriaId: v.categoriaId,
      };
      this.catalogService.createProduct(dto).subscribe(prod => {
        this.products.update(ps => [...ps, prod]);
        // Pasamos a modo edición para permitir subir la imagen del producto recién creado.
        this.editingProductId.set(prod.id);
        this.editingProductImage.set(prod.imagenUrl);
        this.productModalMode.set('edit');
      });
    } else {
      const id = this.editingProductId()!;
      const dto: UpdateProductoDto = {
        nombre: v.nombre, precio: v.precio, stockActual: v.stock, categoriaId: v.categoriaId,
        imagenUrl: this.editingProductImage(),
      };
      this.catalogService.updateProduct(id, dto).subscribe(updated => {
        this.products.update(ps => ps.map(p => p.id === id ? updated : p));
        this.closeProductModal();
      });
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  protected uploadImage(): void {
    const id = this.editingProductId();
    const file = this.selectedFile();
    if (!id || !file) return;

    this.uploadingImage.set(true);
    this.catalogService.uploadProductImage(id, file).subscribe({
      next: updated => {
        this.products.update(ps => ps.map(p => p.id === id ? updated : p));
        this.editingProductImage.set(updated.imagenUrl);
        this.selectedFile.set(null);
        this.uploadingImage.set(false);
      },
      error: () => this.uploadingImage.set(false),
    });
  }

  protected deleteProduct(prod: ProductoDto): void {
    if (!confirm(`¿Eliminar el producto "${prod.nombre}"?`)) return;
    this.catalogService.deleteProduct(prod.id).subscribe(() =>
      this.products.update(ps => ps.filter(p => p.id !== prod.id))
    );
  }

  protected closeProductModal(): void {
    this.productModalMode.set(null);
    this.selectedFile.set(null);
  }

  protected categoryName(id: string): string {
    return this.categories().find(c => c.id === id)?.nombre ?? '—';
  }

  // ── Category actions ─────────────────────────────────────────────────────

  protected openCreateCategory(): void {
    this.categoryForm.reset({ nombre: '', activo: true });
    this.editingCategoryId.set(null);
    this.categoryModalMode.set('create');
  }

  protected openEditCategory(cat: CategoriaDto): void {
    this.categoryForm.reset({ nombre: cat.nombre, activo: cat.activo });
    this.editingCategoryId.set(cat.id);
    this.categoryModalMode.set('edit');
  }

  protected saveCategory(): void {
    if (this.categoryForm.invalid) return;
    const v = this.categoryForm.getRawValue();

    if (this.categoryModalMode() === 'create') {
      this.catalogService.createCategory({ nombre: v.nombre }).subscribe(cat => {
        this.categories.update(cs => [...cs, cat]);
        this.closeCategoryModal();
      });
    } else {
      const id = this.editingCategoryId()!;
      this.catalogService.updateCategory(id, { nombre: v.nombre, activo: v.activo }).subscribe(updated => {
        this.categories.update(cs => cs.map(c => c.id === id ? updated : c));
        this.closeCategoryModal();
      });
    }
  }

  protected deleteCategory(cat: CategoriaDto): void {
    if (!confirm(`¿Desactivar la categoría "${cat.nombre}"?`)) return;
    this.catalogService.deleteCategory(cat.id).subscribe(() =>
      this.categories.update(cs => cs.map(c => c.id === cat.id ? { ...c, activo: false } : c))
    );
  }

  protected restoreCategory(cat: CategoriaDto): void {
    this.catalogService.updateCategory(cat.id, { nombre: cat.nombre, activo: true }).subscribe(updated =>
      this.categories.update(cs => cs.map(c => c.id === cat.id ? updated : c))
    );
  }

  protected closeCategoryModal(): void {
    this.categoryModalMode.set(null);
  }
}
