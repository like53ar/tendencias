import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

interface CoinItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const COIN_NAMES: Record<string, string> = {
  'BTC/USDT': 'Bitcoin',   'ETH/USDT': 'Ethereum',  'BNB/USDT': 'BNB',
  'SOL/USDT': 'Solana',    'XRP/USDT': 'Ripple',     'ADA/USDT': 'Cardano',
  'DOGE/USDT': 'Dogecoin', 'AVAX/USDT': 'Avalanche', 'MATIC/USDT': 'Polygon',
  'DOT/USDT': 'Polkadot',  'LINK/USDT': 'Chainlink', 'UNI/USDT': 'Uniswap',
  'ATOM/USDT': 'Cosmos',   'LTC/USDT': 'Litecoin',   'TRX/USDT': 'TRON',
  'NEAR/USDT': 'NEAR',     'BCH/USDT': 'Bitcoin Cash','APT/USDT': 'Aptos',
  'ICP/USDT': 'Internet Computer','FIL/USDT': 'Filecoin',
  'SHIB/USDT': 'Shiba Inu','OP/USDT': 'Optimism',    'ARB/USDT': 'Arbitrum',
  'SUI/USDT': 'Sui',       'TON/USDT': 'Toncoin',
  'PEPE/USDT': 'Pepe',     'WIF/USDT': 'dogwifhat',  'FLOKI/USDT': 'Floki',
};

const ALL_SYMBOLS = Object.keys(COIN_NAMES);

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="watchlist">

      <!-- ── SEARCH / ADD PANEL ── -->
      <div class="search-area">
        <input
          class="coin-search"
          type="text"
          placeholder="🔍 Buscar y agregar..."
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
        />
        <div class="search-results" *ngIf="showResults && searchResults.length">
          <div class="sr-item" *ngFor="let s of searchResults" (click)="addCoin(s)">
            <span class="sr-symbol">{{ s.replace('/USDT','') }}</span>
            <span class="sr-name">{{ coinName(s) }}</span>
            <span class="sr-add">+</span>
          </div>
        </div>
      </div>

      <!-- ── FAVORITES ── -->
      <div class="section-title">FAVORITOS</div>
      <div class="list">
        <div class="item"
             *ngFor="let coin of favorites; trackBy: trackSym"
             [class.active]="selectedCoin === coin.symbol"
             (click)="onSelect(coin.symbol)">
          <div class="coin-left">
            <div class="coin-badge">{{ coin.symbol.replace('/USDT','') | slice:0:3 }}</div>
            <div class="coin-info">
              <span class="symbol">{{ coin.symbol.replace('/USDT','') }}</span>
              <span class="name">{{ coin.name }}</span>
            </div>
          </div>
          <div class="price-info">
            <span class="price">{{ formatPrice(coin.price) }}</span>
            <span class="change" [class.up]="coin.change >= 0" [class.down]="coin.change < 0">
              {{ coin.change >= 0 ? '▲' : '▼' }} {{ coin.change | number:'1.2-2' }}%
            </span>
          </div>
          <button class="remove-btn" (click)="removeCoin(coin.symbol, $event)" title="Quitar">✕</button>
        </div>
      </div>

      <!-- ── TRENDING ── -->
      <div class="section-title mt">TOP GAINERS 🔥</div>
      <div class="list">
        <div class="item mini"
             *ngFor="let g of gainers"
             (click)="onSelect(g.symbol)">
          <span class="symbol">{{ g.symbol.replace('/USDT','') }}</span>
          <div class="mini-right">
            <span class="mini-price">{{ formatPrice(g.price) }}</span>
            <span class="change up">▲ {{ g.change | number:'1.2-2' }}%</span>
          </div>
        </div>
      </div>

      <!-- refresh indicator -->
      <div class="refresh-info">
        <span class="dot" [class.pulse]="refreshing"></span>
        Actualiza cada 30s
      </div>
    </aside>
  `,
  styles: [`
    .watchlist {
      width: 260px;
      min-width: 220px;
      height: 100%;
      background: #0d1117;
      border-right: 1px solid #21262d;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: #30363d #0d1117;
    }

    /* SEARCH */
    .search-area {
      padding: 12px 10px 8px;
      position: relative;
    }
    .coin-search {
      width: 100%;
      box-sizing: border-box;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 8px 12px;
      color: #e6edf3;
      font-size: 0.82rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .coin-search:focus { border-color: #58a6ff; }

    .search-results {
      position: absolute;
      top: calc(100% - 4px);
      left: 10px; right: 10px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      z-index: 100;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .sr-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; cursor: pointer;
      transition: background 0.15s;
    }
    .sr-item:hover { background: #21262d; }
    .sr-symbol { font-weight: 700; font-size: 0.82rem; color: #f0f6fc; }
    .sr-name   { flex: 1; font-size: 0.75rem; color: #8b949e; }
    .sr-add    { color: #3fb950; font-size: 1rem; font-weight: 700; }

    /* SECTIONS */
    .section-title {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #484f58;
      padding: 0 14px;
      margin-bottom: 6px;
    }
    .mt { margin-top: 16px; }

    /* ITEMS */
    .list { display: flex; flex-direction: column; gap: 2px; padding: 0 6px; }

    .item {
      padding: 9px 10px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }
    .item:hover { background: #161b22; }
    .item:hover .remove-btn { opacity: 1; }
    .item.active { background: #161b22; border: 1px solid #30363d; }

    .coin-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }

    .coin-badge {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #1c2333, #21262d);
      border: 1px solid #30363d;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; font-weight: 800; color: #58a6ff;
      flex-shrink: 0;
    }

    .coin-info { display: flex; flex-direction: column; min-width: 0; }
    .symbol {
      font-weight: 700; color: #e6edf3; font-size: 0.88rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .name { font-size: 0.72rem; color: #484f58; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .price-info { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
    .price { font-weight: 700; font-size: 0.85rem; color: #e6edf3; font-variant-numeric: tabular-nums; }
    .change { font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
    .change.up   { color: #3fb950; }
    .change.down { color: #f85149; }

    .remove-btn {
      opacity: 0; background: none; border: none; color: #484f58;
      cursor: pointer; font-size: 0.7rem; padding: 2px 4px; border-radius: 4px;
      transition: color 0.15s, opacity 0.15s; flex-shrink: 0;
    }
    .remove-btn:hover { color: #f85149; }

    /* MINI (gainers) */
    .item.mini { padding: 7px 10px; }
    .mini-right { display: flex; flex-direction: column; align-items: flex-end; margin-left: auto; }
    .mini-price { font-size: 0.78rem; font-weight: 600; color: #c9d1d9; }

    /* REFRESH */
    .refresh-info {
      margin-top: auto; padding: 12px 14px;
      display: flex; align-items: center; gap: 6px;
      font-size: 0.65rem; color: #484f58;
    }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #484f58;
    }
    .dot.pulse { background: #3fb950; animation: blink 1.5s infinite; }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.2; }
    }
  `]
})
export class WatchlistComponent implements OnInit, OnDestroy {
  @Input() selectedCoin = 'BTC/USDT';
  @Output() coinSelected = new EventEmitter<string>();

  favorites: CoinItem[] = [
    { symbol: 'BTC/USDT',  name: 'Bitcoin',   price: 0, change: 0 },
    { symbol: 'ETH/USDT',  name: 'Ethereum',  price: 0, change: 0 },
    { symbol: 'SOL/USDT',  name: 'Solana',    price: 0, change: 0 },
    { symbol: 'AVAX/USDT', name: 'Avalanche', price: 0, change: 0 },
    { symbol: 'XRP/USDT',  name: 'Ripple',    price: 0, change: 0 },
  ];

  gainers: CoinItem[] = [];
  searchQuery = '';
  searchResults: string[] = [];
  showResults = false;
  refreshing = false;

  private sub!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.sub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get<{ tickers: any[] }>('http://localhost:8765/api/ticker'))
    ).subscribe({
      next: res => {
        this.refreshing = true;
        const map = new Map(res.tickers.map(t => [t.symbol, t]));

        this.favorites = this.favorites.map(f => {
          const live = map.get(f.symbol);
          return live ? { ...f, price: live.price, change: live.change } : f;
        });

        // Top 5 gainers
        this.gainers = [...res.tickers]
          .filter(t => t.change > 0)
          .sort((a, b) => b.change - a.change)
          .slice(0, 5)
          .map(t => ({ symbol: t.symbol, name: this.coinName(t.symbol), price: t.price, change: t.change }));

        setTimeout(() => this.refreshing = false, 1000);
      },
      error: err => console.warn('Watchlist ticker error:', err)
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  onSelect(symbol: string) {
    this.coinSelected.emit(symbol);
  }

  onSearchInput() {
    const q = this.searchQuery.trim().toUpperCase();
    if (q.length < 1) { this.showResults = false; return; }
    this.searchResults = ALL_SYMBOLS.filter(s =>
      s.replace('/USDT','').includes(q) || COIN_NAMES[s]?.toUpperCase().includes(q)
    ).slice(0, 8);
    this.showResults = true;
  }

  addCoin(symbol: string) {
    if (!this.favorites.find(f => f.symbol === symbol)) {
      this.favorites.push({ symbol, name: this.coinName(symbol), price: 0, change: 0 });
    }
    this.searchQuery = '';
    this.showResults = false;
    this.onSelect(symbol);
  }

  removeCoin(symbol: string, e: Event) {
    e.stopPropagation();
    this.favorites = this.favorites.filter(f => f.symbol !== symbol);
    if (this.selectedCoin === symbol && this.favorites.length) {
      this.onSelect(this.favorites[0].symbol);
    }
  }

  coinName(symbol: string): string {
    return COIN_NAMES[symbol] ?? symbol.replace('/USDT', '');
  }

  formatPrice(price: number): string {
    if (!price) return '—';
    if (price >= 1000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (price >= 1)    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return '$' + price.toFixed(6);
  }

  trackSym(_: number, coin: CoinItem) { return coin.symbol; }
}
