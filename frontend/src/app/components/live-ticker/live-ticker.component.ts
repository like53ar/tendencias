import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

@Component({
  selector: 'app-live-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticker-wrap">
      <div class="ticker-label">EN VIVO</div>
      <div class="ticker-track">
        <div class="ticker-content" [style.animationDuration]="animDuration">
          <ng-container *ngFor="let item of tickers">
            <span class="ticker-item">
              <span class="t-symbol">{{ item.symbol.replace('/USDT','') }}</span>
              <span class="t-price">{{ item.price | number:'1.2-6' }}</span>
              <span class="t-change" [class.up]="item.change >= 0" [class.down]="item.change < 0">
                {{ item.change >= 0 ? '▲' : '▼' }} {{ item.change | number:'1.2-2' }}%
              </span>
            </span>
          </ng-container>
          <!-- duplicate for seamless loop -->
          <ng-container *ngFor="let item of tickers">
            <span class="ticker-item">
              <span class="t-symbol">{{ item.symbol.replace('/USDT','') }}</span>
              <span class="t-price">{{ item.price | number:'1.2-6' }}</span>
              <span class="t-change" [class.up]="item.change >= 0" [class.down]="item.change < 0">
                {{ item.change >= 0 ? '▲' : '▼' }} {{ item.change | number:'1.2-2' }}%
              </span>
            </span>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ticker-wrap {
      width: 100%;
      height: 34px;
      background: #060a0f;
      border-bottom: 1px solid #1c2333;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .ticker-label {
      flex-shrink: 0;
      padding: 0 14px;
      font-size: 0.65rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      color: #00d4aa;
      background: #060a0f;
      border-right: 1px solid #1c2333;
      height: 100%;
      display: flex;
      align-items: center;
      z-index: 2;
    }

    .ticker-track {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }

    .ticker-content {
      display: inline-flex;
      align-items: center;
      animation: tickerScroll linear infinite;
      will-change: transform;
    }

    @keyframes tickerScroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .ticker-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 20px;
      border-right: 1px solid #1c2333;
      height: 34px;
      white-space: nowrap;
    }

    .t-symbol {
      font-size: 0.75rem;
      font-weight: 700;
      color: #c9d1d9;
      letter-spacing: 0.03em;
    }

    .t-price {
      font-size: 0.75rem;
      font-weight: 600;
      color: #e6edf3;
      font-variant-numeric: tabular-nums;
    }

    .t-change {
      font-size: 0.7rem;
      font-weight: 700;
    }
    .t-change.up   { color: #00d4aa; }
    .t-change.down { color: #f85149; }
  `]
})
export class LiveTickerComponent implements OnInit, OnDestroy {
  tickers: TickerItem[] = [];
  animDuration = '60s';
  private sub!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.sub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<{ tickers: TickerItem[] }>('http://localhost:8765/api/ticker'))
    ).subscribe({
      next: res => {
        this.tickers = res.tickers;
        // Adjust speed based on number of items
        this.animDuration = `${Math.max(30, this.tickers.length * 3)}s`;
      },
      error: err => console.warn('Ticker error:', err)
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
