import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, LineSeries } from 'lightweight-charts';

@Component({
  selector: 'app-trading-chart',
  standalone: true,
  template: `<div #chartContainer class="chart-container"></div>`,
  styles: [`
    .chart-container {
      width: 100%;
      height: 100%;
      min-height: 480px;
      border-bottom: 2px solid #30363d;
    }
  `]
})
export class TradingChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() candleData: any[] = [];
  @Input() sma20Data: any[] = [];
  @Input() sma200Data: any[] = [];
  @Input() predictionData: any[] = [];

  private chart!: IChartApi;
  private candlestickSeries!: ISeriesApi<'Candlestick'>;
  private sma20Series!: ISeriesApi<'Line'>;
  private sma200Series!: ISeriesApi<'Line'>;
  private predictionSeries!: ISeriesApi<'Line'>;

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      if (changes['candleData']?.currentValue?.length) this.candlestickSeries.setData(this.candleData);
      if (changes['sma20Data']?.currentValue?.length) this.sma20Series.setData(this.sma20Data);
      if (changes['sma200Data']?.currentValue?.length) this.sma200Series.setData(this.sma200Data);
      if (changes['predictionData']?.currentValue?.length) this.predictionSeries.setData(this.predictionData);
    }
  }

  private initChart(): void {
    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: '#090c10' },
        textColor: '#8b949e',
        fontSize: 11
      },
      grid: {
        vertLines: { color: 'rgba(48, 54, 61, 0.3)' },
        horzLines: { color: 'rgba(48, 54, 61, 0.3)' },
      },
      crosshair: { mode: 0 },
      timeScale: { borderColor: '#30363d', timeVisible: true },
    });

    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950', downColor: '#f85149',
      borderVisible: false, wickUpColor: '#3fb950', wickDownColor: '#f85149',
    });

    this.sma20Series = this.chart.addSeries(LineSeries, {
      color: '#388bff', lineWidth: 2, // Azul como pedido
    });

    this.sma200Series = this.chart.addSeries(LineSeries, {
      color: '#f85149', lineWidth: 2, // Roja como pedido (200)
    });

    this.predictionSeries = this.chart.addSeries(LineSeries, {
      color: '#bc8eff', lineWidth: 2, lineStyle: 2,
    });
  }
}
