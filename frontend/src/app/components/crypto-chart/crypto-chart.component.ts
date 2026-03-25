import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';

@Component({
  selector: 'app-crypto-chart',
  standalone: true,
  template: `<div #chartContainer class="chart-container"></div>`,
  styles: [`
    .chart-container {
      width: 100%;
      height: 500px;
      border: 1px solid #30363d;
      border-radius: 8px;
    }
  `]
})
export class CryptoChartComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() candleData: any[] = [];
  @Input() sma20Data: any[] = [];
  @Input() sma50Data: any[] = [];
  @Input() predictionData: any[] = [];
  @Input() volumeData: any[] = [];

  private chart!: IChartApi;
  private candlestickSeries!: ISeriesApi<'Candlestick'>;
  private sma20Series!: ISeriesApi<'Line'>;
  private sma50Series!: ISeriesApi<'Line'>;
  private predictionSeries!: ISeriesApi<'Line'>;
  private volumeSeries!: ISeriesApi<'Histogram'>;

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      if (changes['candleData'] && this.candleData && this.candleData.length) {
        this.candlestickSeries.setData(this.candleData);
      }
      if (changes['sma20Data'] && this.sma20Data && this.sma20Data.length) {
        this.sma20Series.setData(this.sma20Data);
      }
      if (changes['sma50Data'] && this.sma50Data && this.sma50Data.length) {
        this.sma50Series.setData(this.sma50Data);
      }
      if (changes['predictionData'] && this.predictionData && this.predictionData.length) {
        this.predictionSeries.setData(this.predictionData);
      }
      if (changes['volumeData'] && this.volumeData && this.volumeData.length) {
        this.volumeSeries.setData(this.volumeData);
      }
    }
  }

  private initChart(): void {
    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: '#0d1117' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: 'rgba(48, 54, 61, 0.5)' },
        horzLines: { color: 'rgba(48, 54, 61, 0.5)' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
      },
    });

    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950',
      downColor: '#f85149',
      borderVisible: false,
      wickUpColor: '#3fb950',
      wickDownColor: '#f85149',
    });

    this.sma20Series = this.chart.addSeries(LineSeries, {
      color: 'rgba(56, 139, 253, 0.8)',
      lineWidth: 2,
    });

    this.sma50Series = this.chart.addSeries(LineSeries, {
      color: 'rgba(210, 153, 34, 0.8)',
      lineWidth: 2,
    });

    this.predictionSeries = this.chart.addSeries(LineSeries, {
      color: 'rgba(188, 142, 255, 0.8)',
      lineWidth: 2,
      lineStyle: 1, // Dotted
    });

    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      color: '#238636',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay on the main scale
    });

    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
  }
}
