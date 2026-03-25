import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar">
      <div class="logo">Zen<span>Crypto</span> <small>Analytics</small></div>
      
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Buscar moneda..." [(ngModel)]="searchQuery">
      </div>

      <div class="timeframes">
        <button *ngFor="let tf of timeframes" 
                [class.active]="selectedTimeframe === tf"
                (click)="onTfChange(tf)">
          {{tf}}
        </button>
      </div>

      <div class="header-right">
        <div class="market-time">UTC {{ currentTime }}</div>
        <div class="avatar">ZC</div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 54px;
      background: #0d1117;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      gap: 1.5rem;
      border-bottom: 1px solid #21262d;
      box-shadow: 0 1px 0 #1c2333;
    }

    .logo {
      font-weight: 800;
      font-size: 1.1rem;
      color: #e6edf3;
      white-space: nowrap;
      letter-spacing: -0.02em;
    }
    .logo span { color: #58a6ff; }
    .logo small {
      font-size: 0.65rem;
      font-weight: 500;
      color: #484f58;
      margin-left: 6px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    
    .search-box {
      flex: 1;
      max-width: 320px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #161b22;
      border: 1px solid #21262d;
      padding: 0 12px;
      border-radius: 8px;
      transition: border-color 0.2s;
    }
    .search-box:focus-within { border-color: #388bfd; }
    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 7px 0;
      color: #e6edf3;
      font-size: 0.82rem;
      outline: none;
    }
    .search-box input::placeholder { color: #484f58; }
    
    .timeframes {
      display: flex;
      background: #161b22;
      border-radius: 8px;
      padding: 3px;
      border: 1px solid #21262d;
      gap: 1px;
    }
    .timeframes button {
      background: transparent;
      border: none;
      color: #484f58;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 700;
      transition: all 0.15s;
    }
    .timeframes button:hover { color: #8b949e; background: #1c2333; }
    .timeframes button.active {
      background: #1c2333;
      color: #58a6ff;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }
    .market-time {
      font-size: 0.75rem;
      color: #484f58;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #58a6ff, #388bfd);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
    }
  `]
})
export class TopbarComponent implements OnInit {
  @Output() timeframeChanged = new EventEmitter<string>();
  timeframes = ['15m', '1h', '4h', '1d', '1w'];
  selectedTimeframe = '1h';
  searchQuery = '';
  currentTime = '';

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toUTCString().slice(17, 22);
  }

  onTfChange(tf: string) {
    this.selectedTimeframe = tf;
    this.timeframeChanged.emit(tf);
  }
}
