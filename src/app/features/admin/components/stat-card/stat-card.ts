import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCard {
  title    = input.required<string>();
  value    = input.required<string>();
  subtitle = input<string>('');
  icon     = input<string>('');
  color    = input<'indigo' | 'green' | 'amber' | 'red'>('indigo');
  trend    = input<string>('');
  trendUp  = input<boolean>(true);
}
