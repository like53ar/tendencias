import ccxt
import pandas as pd
import numpy as np

class CryptoService:
    def __init__(self):
        self.exchange = ccxt.binance()

    def fetch_ohlcv(self, symbol='BTC/USDT', timeframe='1h', limit=500):
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            print(f"Error fetching OHLCV: {e}")
            return None

    def calculate_indicators(self, df):
        # SMA 20 and SMA 200
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_200'] = df['close'].rolling(window=200).mean()

        # RSI Calculation (Manual)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))

        # Basic Supports & Resistances (Local Min/Max)
        # Using a window to find pivot points
        window = 20
        df['support'] = df['low'].rolling(window=window, center=True).min()
        df['resistance'] = df['high'].rolling(window=window, center=True).max()

        return df

    def get_key_levels(self, df):
        # Get unique values near current price
        current_price = df['close'].iloc[-1]
        levels = df[['support', 'resistance']].tail(100).melt()['value'].dropna().unique()
        levels = sorted(levels)
        
        supports = [l for l in levels if l < current_price][-3:] # Last 3 below
        resistances = [l for l in levels if l > current_price][:3] # First 3 above
        
        return {
            'supports': sorted(supports, reverse=True),
            'resistances': resistances
        }

    def fetch_ticker_batch(self, symbols):
        """Fetch live price and 24h % change for a list of symbols."""
        try:
            tickers = self.exchange.fetch_tickers(symbols)
            result = []
            for symbol, data in tickers.items():
                result.append({
                    'symbol': symbol,
                    'price': float(data['last']) if data.get('last') else 0,
                    'change': float(data['percentage']) if data.get('percentage') else 0,
                })
            return result
        except Exception as e:
            print(f"Error fetching tickers: {e}")
            return []

    def project_linear_regression(self, df, periods_to_predict=24):
        # Lazy import to avoid loading scikit-learn at server startup
        from sklearn.linear_model import LinearRegression
        df = df.dropna(subset=['close'])
        x = np.array(range(len(df))).reshape(-1, 1)
        y = df['close'].values.reshape(-1, 1)

        model = LinearRegression()
        model.fit(x, y)

        future_x = np.array(range(len(df), len(df) + periods_to_predict)).reshape(-1, 1)
        future_y = model.predict(future_x)

        return future_y.flatten().tolist()
