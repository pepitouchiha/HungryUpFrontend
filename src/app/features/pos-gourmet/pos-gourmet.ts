import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CategoriaDto, ProductoDto } from '../../shared/models/product.model';
import { PedidoDto } from '../../shared/models/order.model';
import { MesaDto } from '../../shared/models/table.model';
import { CatalogService } from '../../core/services/catalog.service';
import { TableService } from '../../core/services/table.service';
import { OrderService } from '../../core/services/order.service';

interface OrderItem {
  product:  ProductoDto;
  quantity: number;
}

interface GourmetTable extends MesaDto {
  activeOrder?: PedidoDto;
}

@Component({
  selector: 'app-pos-gourmet',
  imports: [CurrencyPipe],
  templateUrl: './pos-gourmet.html',
  styleUrl: './pos-gourmet.scss'
})
export class PosGourmet implements OnInit {
  private catalogService = inject(CatalogService);
  private tableService   = inject(TableService);
  private orderService   = inject(OrderService);

  protected tables              = signal<GourmetTable[]>([]);
  protected selectedTable       = signal<GourmetTable | null>(null);
  protected isPanelOpen         = signal(false);
  protected categories          = signal<CategoriaDto[]>([]);
  protected allProducts         = signal<ProductoDto[]>([]);
  protected selectedCategoryId  = signal<string>('');
  protected panelOrderItems     = signal<OrderItem[]>([]);
  protected searchQuery         = signal('');
  private   _productMap         = signal<Map<string, ProductoDto>>(new Map());

  protected filteredProducts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q) return this.allProducts().filter(p => p.nombre.toLowerCase().includes(q));
    return this.allProducts().filter(p => p.categoriaId === this.selectedCategoryId());
  });

  protected panelTotal = computed(() =>
    this.panelOrderItems().reduce((sum, i) => sum + i.product.precio * i.quantity, 0)
  );

  protected existingTotal = computed(() =>
    (this.selectedTable()?.activeOrder?.detalles ?? [])
      .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0)
  );

  protected grandTotal    = computed(() => this.existingTotal() + this.panelTotal());
  protected freeCount     = computed(() => this.tables().filter(t => t.estado === 'Libre').length);
  protected occupiedCount = computed(() => this.tables().filter(t => t.estado === 'Ocupada').length);

  protected openTabItems = computed(() => {
    const order = this.selectedTable()?.activeOrder;
    if (!order) return [];
    const map = this._productMap();
    return order.detalles.map(d => ({
      nombre:   map.get(d.productoId)?.nombre ?? `[${d.productoId.slice(0, 8)}]`,
      cantidad: d.cantidad,
      total:    d.precioUnitario * d.cantidad
    }));
  });

  ngOnInit(): void {
    forkJoin({
      tables:     this.tableService.getTables(),
      orders:     this.orderService.getOrders(),
      products:   this.catalogService.getProducts(),
      categories: this.catalogService.getCategories()
    }).subscribe(({ tables, orders, products, categories }) => {
      this._productMap.set(new Map(products.map(p => [p.id, p])));
      this.allProducts.set(products);

      const active = categories.filter(c => c.activo);
      this.categories.set(active);
      if (active.length) this.selectedCategoryId.set(active[0].id);

      this.tables.set(this.buildTables(tables, orders));
    });
  }

  // ── Table interactions ───────────────────────────────────

  protected openTable(table: GourmetTable): void {
    this.selectedTable.set(table);
    this.panelOrderItems.set([]);
    if (this.categories().length) this.selectedCategoryId.set(this.categories()[0].id);
    this.isPanelOpen.set(true);
  }

  protected closePanel(): void {
    this.isPanelOpen.set(false);
    setTimeout(() => this.selectedTable.set(null), 320);
  }

  // ── Panel catalog ────────────────────────────────────────

  protected selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
  }

  protected addToPanel(product: ProductoDto): void {
    const exists = this.panelOrderItems().find(i => i.product.id === product.id);
    if (exists) {
      this.panelOrderItems.update(items =>
        items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      );
    } else {
      this.panelOrderItems.update(items => [...items, { product, quantity: 1 }]);
    }
  }

  protected incrementPanel(productId: string): void {
    this.panelOrderItems.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
    );
  }

  protected decrementPanel(productId: string): void {
    this.panelOrderItems.update(items =>
      items
        .map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  }

  // ── CTAs ─────────────────────────────────────────────────

  protected sendToKitchen(): void {
    const table = this.selectedTable();
    if (!table || !this.panelOrderItems().length) return;
    this.orderService.createOrder({
      tipoRestaurante: 'Gourmet',
      mesaId: table.id,
      items: this.panelOrderItems().map(i => ({ productoId: i.product.id, cantidad: i.quantity }))
    }).subscribe({
      next: () => { this.reload(); this.closePanel(); },
      error: err => console.error('Failed to create order', err)
    });
  }

  protected addToTab(): void {
    const table = this.selectedTable();
    if (!table || !this.panelOrderItems().length) return;
    this.orderService.createOrder({
      tipoRestaurante: 'Gourmet',
      mesaId: table.id,
      items: this.panelOrderItems().map(i => ({ productoId: i.product.id, cantidad: i.quantity }))
    }).subscribe({
      next: () => { this.reload(); this.closePanel(); },
      error: err => console.error('Failed to add to tab', err)
    });
  }

  protected requestBill(): void {
    const table   = this.selectedTable();
    const orderId = table?.activeOrder?.id;
    if (!orderId) return;
    this.orderService.payOrder(orderId).subscribe({
      next: () => { this.reload(); this.closePanel(); },
      error: err => console.error('Failed to process payment', err)
    });
  }

  // ── Helpers ──────────────────────────────────────────────

  protected tableTotal(table: GourmetTable): number {
    return (table.activeOrder?.detalles ?? [])
      .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0);
  }

  protected elapsedTime(isoString?: string): string {
    if (!isoString) return '';
    const mins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  private buildTables(tables: MesaDto[], orders: PedidoDto[]): GourmetTable[] {
    return tables.map(t => ({
      ...t,
      activeOrder: orders.find(o => o.mesaId === t.id && o.estadoFin === 'PorPagar')
    }));
  }

  private reload(): void {
    forkJoin({
      tables: this.tableService.getTables(),
      orders: this.orderService.getOrders()
    }).subscribe(({ tables, orders }) => {
      this.tables.set(this.buildTables(tables, orders));
    });
  }
}
