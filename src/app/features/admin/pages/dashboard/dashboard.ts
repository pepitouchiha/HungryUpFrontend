import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { StatCard } from '../../components/stat-card/stat-card';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { TableService } from '../../../../core/services/table.service';

const TICK   = '#64748b';
const GRID   = 'rgba(51,65,85,0.6)';
const LEGEND = '#94a3b8';

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, StatCard, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private tableService     = inject(TableService);

  protected loading = signal(true);
  protected today   = new Date();

  // ── Raw data signals ─────────────────────────────────────
  private _dia    = signal({ ingresosTotales: 0, cantidadOrdenes: 0 });
  private _semana = signal({ ingresosTotales: 0, cantidadOrdenes: 0 });
  private _mes    = signal({ ingresosTotales: 0, cantidadOrdenes: 0 });
  private _totalMesas = signal(0);

  // ── Stat cards ───────────────────────────────────────────
  protected stats = computed(() => {
    const dia   = this._dia();
    const mes   = this._mes();
    const mesas = this._totalMesas();
    const ticket = dia.cantidadOrdenes > 0
      ? dia.ingresosTotales / dia.cantidadOrdenes
      : 0;

    return [
      {
        title:    'Ingresos hoy',
        value:    this.formatCOP(dia.ingresosTotales),
        subtitle: 'Pedidos pagados hoy',
        icon:     '💰',
        color:    'indigo' as const,
        trend:    `${dia.cantidadOrdenes} pedido${dia.cantidadOrdenes !== 1 ? 's' : ''}`,
        trendUp:  dia.cantidadOrdenes > 0,
      },
      {
        title:    'Pedidos hoy',
        value:    String(dia.cantidadOrdenes),
        subtitle: 'Completados y pagados',
        icon:     '🧾',
        color:    'green' as const,
        trend:    dia.cantidadOrdenes > 0 ? 'Con ventas hoy' : 'Sin ventas aún',
        trendUp:  dia.cantidadOrdenes > 0,
      },
      {
        title:    'Ingresos del mes',
        value:    this.formatCOP(mes.ingresosTotales),
        subtitle: 'Mes en curso',
        icon:     '📅',
        color:    'amber' as const,
        trend:    `${mes.cantidadOrdenes} pedido${mes.cantidadOrdenes !== 1 ? 's' : ''} en el mes`,
        trendUp:  mes.ingresosTotales > 0,
      },
      {
        title:    'Ticket promedio',
        value:    ticket > 0 ? this.formatCOP(ticket) : '—',
        subtitle: 'Por pedido hoy',
        icon:     '📈',
        color:    'red' as const,
        trend:    `${mesas} mesas configuradas`,
        trendUp:  true,
      },
    ];
  });

  // ── Bar chart: ingresos por período ─────────────────────
  protected barData = computed<ChartData<'bar'>>(() => ({
    labels: ['Hoy', 'Esta semana', 'Este mes'],
    datasets: [{
      label: 'Ingresos (COP)',
      data: [
        this._dia().ingresosTotales,
        this._semana().ingresosTotales,
        this._mes().ingresosTotales,
      ],
      backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(99,102,241,0.8)', 'rgba(34,197,94,0.8)'],
      borderColor:     ['#f59e0b', '#6366f1', '#22c55e'],
      borderWidth: 2,
      borderRadius: 6,
    }]
  }));

  protected barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: LEGEND } } },
    scales: {
      x: { ticks: { color: TICK }, grid: { color: GRID } },
      y: { ticks: { color: TICK, callback: v => this.formatCOP(Number(v)) }, grid: { color: GRID } },
    }
  };

  // ── Bar chart: pedidos por período ───────────────────────
  protected ordersData = computed<ChartData<'bar'>>(() => ({
    labels: ['Hoy', 'Esta semana', 'Este mes'],
    datasets: [{
      label: 'Pedidos pagados',
      data: [
        this._dia().cantidadOrdenes,
        this._semana().cantidadOrdenes,
        this._mes().cantidadOrdenes,
      ],
      backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(99,102,241,0.8)', 'rgba(34,197,94,0.8)'],
      borderColor:     ['#f59e0b', '#6366f1', '#22c55e'],
      borderWidth: 2,
      borderRadius: 6,
    }]
  }));

  protected ordersOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: LEGEND } } },
    scales: {
      x: { ticks: { color: TICK }, grid: { color: GRID } },
      y: { ticks: { color: TICK, stepSize: 1 }, grid: { color: GRID } },
    }
  };

  ngOnInit(): void {
    forkJoin({
      dia:    this.analyticsService.getSummary('dia'),
      semana: this.analyticsService.getSummary('semana'),
      mes:    this.analyticsService.getSummary('mes'),
      mesas:  this.tableService.getMesas(),
    }).subscribe({
      next: ({ dia, semana, mes, mesas }) => {
        this._dia.set(dia);
        this._semana.set(semana);
        this._mes.set(mes);
        this._totalMesas.set(mesas.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(value);
  }
}
