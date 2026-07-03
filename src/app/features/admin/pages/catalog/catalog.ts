import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  CategoriaDto, ProductoDto, CreateProductoDto, UpdateProductoDto
} from '../../../../shared/models/product.model';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Toast, confirmDelete } from '../../../../shared/utils/swal';

@Component({
  selector: 'app-catalog',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog implements OnInit {
  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  private fb             = inject(FormBuilder);
  private catalogService = inject(CatalogService);

  protected activeTab      = signal<'categories' | 'products'>('products');
  protected loading        = signal(true);
  protected categories     = signal<CategoriaDto[]>([]);
  protected products       = signal<ProductoDto[]>([]);
  protected productSearch  = signal('');
  protected categorySearch = signal('');
  protected productPage    = signal(1);
  protected categoryPage   = signal(1);
  readonly  pageSize       = 8;

  protected filteredProducts = computed(() => {
    const q = this.productSearch().trim().toLowerCase();
    return q ? this.products().filter(p => p.nombre.toLowerCase().includes(q)) : this.products();
  });

  protected filteredCategories = computed(() => {
    const q = this.categorySearch().trim().toLowerCase();
    return q ? this.categories().filter(c => c.nombre.toLowerCase().includes(q)) : this.categories();
  });

  protected pagedProducts = computed(() => {
    const p = this.productPage();
    return this.filteredProducts().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  protected pagedCategories = computed(() => {
    const p = this.categoryPage();
    return this.filteredCategories().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  protected productTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize))
  );

  protected categoryTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCategories().length / this.pageSize))
  );

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

  protected setProductSearch(q: string): void { this.productSearch.set(q); this.productPage.set(1); }
  protected setCategorySearch(q: string): void { this.categorySearch.set(q); this.categoryPage.set(1); }

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
        this.editingProductId.set(prod.id);
        this.editingProductImage.set(prod.imagenUrl);
        this.productModalMode.set('edit');
        Toast.fire({ icon: 'success', title: 'Producto creado' });
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
        Toast.fire({ icon: 'success', title: 'Producto actualizado' });
      });
    }
  }

  protected openFilePicker(): void {
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    this.doUpload(file);
  }

  private doUpload(file: File): void {
    const id = this.editingProductId();
    if (!id) return;

    this.uploadingImage.set(true);
    this.toWebP(file).then(webpFile => {
      this.catalogService.uploadProductImage(id, webpFile).subscribe({
        next: updated => {
          this.products.update(ps => ps.map(p => p.id === id ? updated : p));
          this.editingProductImage.set(updated.imagenUrl);
          this.selectedFile.set(null);
          this.uploadingImage.set(false);
          Toast.fire({ icon: 'success', title: 'Imagen actualizada' });
        },
        error: () => {
          this.uploadingImage.set(false);
          Toast.fire({ icon: 'error', title: 'Error al subir la imagen' });
        },
      });
    }).catch(() => {
      this.uploadingImage.set(false);
      Toast.fire({ icon: 'error', title: 'No se pudo convertir la imagen' });
    });
  }

  private toWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('WebP conversion failed')); return; }
          const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
          resolve(new File([blob], name, { type: 'image/webp' }));
        }, 'image/webp', 0.9);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  protected deleteProduct(prod: ProductoDto): void {
    confirmDelete(`Se eliminará el producto "${prod.nombre}".`).then(ok => {
      if (!ok) return;
      this.catalogService.deleteProduct(prod.id).subscribe(() => {
        this.products.update(ps => ps.filter(p => p.id !== prod.id));
        Toast.fire({ icon: 'success', title: 'Producto eliminado' });
      });
    });
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
        Toast.fire({ icon: 'success', title: 'Categoría creada' });
      });
    } else {
      const id = this.editingCategoryId()!;
      this.catalogService.updateCategory(id, { nombre: v.nombre, activo: v.activo }).subscribe(updated => {
        this.categories.update(cs => cs.map(c => c.id === id ? updated : c));
        this.closeCategoryModal();
        Toast.fire({ icon: 'success', title: 'Categoría actualizada' });
      });
    }
  }

  protected deleteCategory(cat: CategoriaDto): void {
    confirmDelete(`Se desactivará la categoría "${cat.nombre}".`).then(ok => {
      if (!ok) return;
      this.catalogService.deleteCategory(cat.id).subscribe(() => {
        this.categories.update(cs => cs.map(c => c.id === cat.id ? { ...c, activo: false } : c));
        Toast.fire({ icon: 'success', title: 'Categoría desactivada' });
      });
    });
  }

  protected restoreCategory(cat: CategoriaDto): void {
    this.catalogService.updateCategory(cat.id, { nombre: cat.nombre, activo: true }).subscribe(updated => {
      this.categories.update(cs => cs.map(c => c.id === cat.id ? updated : c));
      Toast.fire({ icon: 'success', title: 'Categoría restaurada' });
    });
  }

  protected closeCategoryModal(): void {
    this.categoryModalMode.set(null);
  }
}
