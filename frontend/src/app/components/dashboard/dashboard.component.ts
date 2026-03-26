import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TopbarComponent } from '../topbar/topbar.component';
import { LiveTickerComponent } from '../live-ticker/live-ticker.component';
import { WatchlistComponent } from '../watchlist/watchlist.component';
import { TradingChartComponent } from '../trading-chart/trading-chart.component';
import { OscillatorsComponent } from '../oscillators/oscillators.component';
import { PredictionPanelComponent } from '../prediction-panel/prediction-panel.component';
import { CryptoApiService } from '../../services/crypto-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    LiveTickerComponent,
    WatchlistComponent,
    TradingChartComponent,
    OscillatorsComponent,
    PredictionPanelComponent
  ],
  template: `
    <div class="dashboard-wrapper">
      <app-topbar (timeframeChanged)="onTimeframeChange($event)"></app-topbar>
      <app-live-ticker></app-live-ticker>
      
      <div class="main-layout">
        <app-watchlist [selectedCoin]="selectedSymbol" (coinSelected)="onCoinChange($event)"></app-watchlist>
        
        <main class="chart-center">
          <div class="coin-header">
            <span class="coin-title">{{ selectedSymbol }}</span>
            <span class="coin-price" [class.up]="priceChange >= 0" [class.down]="priceChange < 0">
              {{ currentPrice | number:'1.2-2' }}
            </span>
            <span class="coin-change" [class.up]="priceChange >= 0" [class.down]="priceChange < 0">
              {{ priceChange >= 0 ? '▲' : '▼' }} {{ priceChange | number:'1.2-2' }}%
            </span>
            <span class="coin-trend">{{ trendText }}</span>
          </div>
          <div class="primary-chart">
            <app-trading-chart
              [candleData]="candleData"
              [sma20Data]="sma20Data"
              [sma200Data]="sma200Data"
              [predictionData]="predictionData"
            ></app-trading-chart>
          </div>
          <div class="secondary-indicators">
            <app-oscillators [rsiData]="rsiData"></app-oscillators>
          </div>
        </main>
        
          <app-prediction-panel
              [currentPrice]="currentPrice"
              [priceChange]="priceChange"
              [trend]="trendText"
              [supports]="supports"
              [resistances]="resistances"
              [minProjection]="minProjection"
              [maxProjection]="maxProjection"
              [lastRsi]="lastRsi"
          ></app-prediction-panel>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      background: #090c10;
      color: #c9d1d9;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .main-layout {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    /* Coin header bar */
    .coin-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 18px;
      border-bottom: 1px solid #1c2333;
      background: #0d1117;
    }
    .coin-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #e6edf3;
      letter-spacing: -0.02em;
    }
    .coin-price {
      font-size: 1.1rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .coin-price.up, .coin-change.up { color: #3fb950; }
    .coin-price.down, .coin-change.down { color: #f85149; }
    .coin-change {
      font-size: 0.85rem;
      font-weight: 700;
    }
    .coin-trend {
      margin-left: auto;
      font-size: 0.75rem;
      font-weight: 700;
      color: #484f58;
      background: #161b22;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid #21262d;
      letter-spacing: 0.03em;
    }
    
    .chart-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #090c10;
      border-right: 1px solid #21262d;
      border-left: 1px solid #21262d;
    }
    
    .primary-chart {
      flex: 0 0 70%;
      height: 70%;
    }
    
    .secondary-indicators {
      flex: 1;
      background: #090c10;
      min-height: 130px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  selectedSymbol = 'BTC/USDT';
  selectedTimeframe = '1h';

  candleData: any[] = [];
  sma20Data: any[] = [];
  sma200Data: any[] = [];
  predictionData: any[] = [];
  rsiData: any[] = [];
  
  currentPrice = 0;
  priceChange = 0;
  trendText = 'Neutral';
  supports: number[] = [];
  resistances: number[] = [];
  minProjection = 0;
  maxProjection = 0;
  lastRsi = 50;

  constructor(private api: CryptoApiService) {}

  ngOnInit() {
    this.refreshData();
  }

  onCoinChange(symbol: string) {
    this.selectedSymbol = symbol;
    this.refreshData();
  }

  onTimeframeChange(tf: string) {
    this.selectedTimeframe = tf;
    this.refreshData();
  }

  refreshData() {
    this.api.getData(this.selectedSymbol, this.selectedTimeframe).subscribe(res => {
      this.candleData = res.ohlcv;
      this.currentPrice = this.candleData[this.candleData.length - 1].close;
      const lastClose = this.candleData[this.candleData.length - 2].close;
      this.priceChange = ((this.currentPrice - lastClose) / lastClose) * 100;
      this.loadIndicators();
      this.loadPrediction();
    });
  }

  loadIndicators() {
    this.api.getIndicators(this.selectedSymbol, this.selectedTimeframe).subscribe(res => {
      this.sma20Data = res.sma_20;
      this.sma200Data = res.sma_200;
      this.rsiData = res.rsi;
      this.supports = res.levels.supports;
      this.resistances = res.levels.resistances;
      
      const lastRsiObj = this.rsiData[this.rsiData.length - 1];
      this.lastRsi = lastRsiObj ? lastRsiObj.value : 50;

      const lastSma20 = this.sma20Data[this.sma20Data.length - 1].value;
      const lastSma200 = this.sma200Data[this.sma200Data.length - 1].value;

      if (this.currentPrice > lastSma20 && lastSma20 > lastSma200) {
        this.trendText = 'Alcista Fuerte';
      } else if (this.currentPrice < lastSma20 && lastSma20 < lastSma200) {
        this.trendText = 'Bajista Fuerte';
      } else {
        this.trendText = 'En Consolidación';
      }
    });
  }

  loadPrediction() {
    this.api.getPrediction(this.selectedSymbol, this.selectedTimeframe).subscribe(res => {
      this.predictionData = res.predictions;
      const values = this.predictionData.map(p => p.value);
      this.minProjection = Math.min(...values);
      this.maxProjection = Math.max(...values);
    });
  }
}
