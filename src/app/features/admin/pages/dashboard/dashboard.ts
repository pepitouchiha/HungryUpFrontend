import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { StatCard } from '../../components/stat-card/stat-card';

const TICK   = '#64748b';
const GRID   = 'rgba(51,65,85,0.6)';
const LEGEND = '#94a3b8';

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected stats = [
    { title: 'Monthly Revenue',  value: '$24,580', subtitle: 'June 2026',       icon: '💰', color: 'indigo' as const, trend: '+12% vs last month',  trendUp: true  },
    { title: 'Orders Today',     value: '47',      subtitle: '8 in progress',   icon: '🧾', color: 'green'  as const, trend: '+5 vs yesterday',      trendUp: true  },
    { title: 'Tables Occupied',  value: '5 / 15',  subtitle: 'Right now',       icon: '🪑', color: 'amber'  as const, trend: '33% occupancy',        trendUp: true  },
    { title: 'Avg Ticket Value', value: '$52.30',  subtitle: 'Per order today', icon: '📈', color: 'red'    as const, trend: '−$3.20 vs last week',   trendUp: false },
  ];

  // ── Bar chart: Daily sales ───────────────────────────────
  protected barData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue ($)',
      data: [1250, 980, 1450, 1100, 1680, 2100, 1890],
      backgroundColor: 'rgba(245,158,11,0.8)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  protected barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: LEGEND } } },
    scales: {
      x: { ticks: { color: TICK }, grid: { color: GRID } },
      y: { ticks: { color: TICK }, grid: { color: GRID } },
    }
  };

  // ── Line chart: Weekly revenue ───────────────────────────
  protected lineData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Revenue ($)',
      data: [8200, 9450, 7800, 11200],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.12)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#22c55e',
      pointRadius: 5,
    }]
  };

  protected lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: LEGEND } } },
    scales: {
      x: { ticks: { color: TICK }, grid: { color: GRID } },
      y: { ticks: { color: TICK }, grid: { color: GRID } },
    }
  };
}
