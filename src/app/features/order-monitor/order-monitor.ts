import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PedidoDto, DetallePedidoDto } from '../../shared/models/order.model';
import { ProductoDto } from '../../shared/models/product.model';
import { MesaDto } from '../../shared/models/table.model';
import { OrderService } from '../../core/services/order.service';
import { CatalogService } from '../../core/services/catalog.service';
import { TableService } from '../../core/services/table.service';

@Component({
  selector: 'app-order-monitor',
  imports: [CurrencyPipe],
  templateUrl: './order-monitor.html',
  styleUrl: './order-monitor.scss'
})
export class OrderMonitor implements OnInit {
  private orderService   = inject(OrderService);
  private catalogService = inject(CatalogService);
  private tableService   = inject(TableService);

  private _orders     = signal<PedidoDto[]>([]);
  private _productMap = signal<Map<string, ProductoDto>>(new Map());
  private _tableMap   = signal<Map<string, number>>(new Map());
  protected loading   = signal(true);

  protected pendingOrders = computed(() => this._orders().filter(o => o.estadoPrep === 'Pendiente'));
  protected inPrepOrders  = computed(() => this._orders().filter(o => o.estadoPrep === 'EnPreparacion'));

  ngOnInit(): void {
    this.load();
  }

  protected elapsed(isoString: string): string {
    const mins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (mins < 1) return 'ahora';
    if (mins === 1) return '1 min';
    return `${mins} min`;
  }

  protected orderNumber(order: PedidoDto): string {
    return `#${order.id.slice(0, 8).toUpperCase()}`;
  }

  protected orderTotal(order: PedidoDto): number {
    return order.detalles.reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0);
  }

  protected locationLabel(order: PedidoDto): string {
    if (order.mesaId) {
      const num = this._tableMap().get(order.mesaId);
      return num !== undefined ? `Mesa ${num}` : `Mesa [${order.mesaId.slice(0, 6)}]`;
    }
    return `Turno #${order.numeroTurno}`;
  }

  protected productName(productoId: string): string {
    return this._productMap().get(productoId)?.nombre ?? `[${productoId.slice(0, 8)}]`;
  }

  protected fireOrder(id: string): void {
    this.orderService.updateStatus(id, 'EnPreparacion').subscribe({
      next: () => this._orders.update(orders =>
        orders.map(o => o.id === id ? { ...o, estadoPrep: 'EnPreparacion' as const } : o)
      ),
      error: err => console.error('State update failed', err)
    });
  }

  protected completeOrder(id: string): void {
    this.orderService.updateStatus(id, 'Entregado').subscribe({
      next: () => this._orders.update(orders => orders.filter(o => o.id !== id)),
      error: err => console.error('State update failed', err)
    });
  }

  private load(): void {
    forkJoin({
      orders:   this.orderService.getOrders(),
      products: this.catalogService.getProducts(),
      tables:   this.tableService.getTables()
    }).subscribe({
      next: ({ orders, products, tables }) => {
        this._orders.set(orders.filter(o => o.estadoPrep !== 'Entregado'));
        this._productMap.set(new Map(products.map(p => [p.id, p])));
        this._tableMap.set(new Map(tables.map(t => [t.id, t.numero])));
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load orders', err);
        this.loading.set(false);
      }
    });
  }
}
