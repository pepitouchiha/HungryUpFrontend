import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CategoriaDto, ProductoDto } from '../../shared/models/product.model';
import { CatalogService } from '../../core/services/catalog.service';
import { OrderService } from '../../core/services/order.service';

interface OrderItem {
  product:  ProductoDto;
  quantity: number;
}

@Component({
  selector: 'app-pos-fastfood',
  imports: [CurrencyPipe],
  templateUrl: './pos-fastfood.html',
  styleUrl: './pos-fastfood.scss'
})
export class PosFastfood implements OnInit {
  private catalogService = inject(CatalogService);
  private orderService   = inject(OrderService);

  protected categories         = signal<CategoriaDto[]>([]);
  protected allProducts        = signal<ProductoDto[]>([]);
  protected selectedCategoryId = signal<string>('');
  protected orderItems         = signal<OrderItem[]>([]);
  protected loading            = signal(true);
  protected searchQuery        = signal('');

  protected filteredProducts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q) return this.allProducts().filter(p => p.nombre.toLowerCase().includes(q));
    return this.allProducts().filter(p => p.categoriaId === this.selectedCategoryId());
  });

  protected orderTotal = computed(() =>
    this.orderItems().reduce((sum, i) => sum + i.product.precio * i.quantity, 0)
  );

  protected orderCount = computed(() =>
    this.orderItems().reduce((sum, i) => sum + i.quantity, 0)
  );

  ngOnInit(): void {
    forkJoin({
      categories: this.catalogService.getCategories(),
      products:   this.catalogService.getProducts()
    }).subscribe(({ categories, products }) => {
      const active = categories.filter(c => c.activo);
      this.categories.set(active);
      if (active.length) this.selectedCategoryId.set(active[0].id);
      this.allProducts.set(products);
      this.loading.set(false);
    });
  }

  protected selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
    this.searchQuery.set('');
  }

  protected addToOrder(product: ProductoDto): void {
    const exists = this.orderItems().find(i => i.product.id === product.id);
    if (exists) {
      this.orderItems.update(items =>
        items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      );
    } else {
      this.orderItems.update(items => [...items, { product, quantity: 1 }]);
    }
  }

  protected increment(productId: string): void {
    this.orderItems.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
    );
  }

  protected decrement(productId: string): void {
    this.orderItems.update(items =>
      items
        .map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  }

  protected clearOrder(): void {
    this.orderItems.set([]);
  }

  protected payAndPrint(): void {
    if (!this.orderItems().length) return;
    this.orderService.createOrder({
      tipoRestaurante: 'FastFood',
      items: this.orderItems().map(i => ({ productoId: i.product.id, cantidad: i.quantity }))
    }).subscribe({
      next: () => this.clearOrder(),
      error: err => console.error('Order creation failed', err)
    });
  }
}
