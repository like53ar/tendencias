from flask import Flask, jsonify, request
from flask_cors import CORS
from services.crypto_service import CryptoService
import os
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow Angular to talk to Flask

crypto_service = CryptoService()

# Popular symbols for the live ticker
TICKER_SYMBOLS = [
    'BTC/USDT','ETH/USDT','BNB/USDT','SOL/USDT','XRP/USDT',
    'ADA/USDT','DOGE/USDT','AVAX/USDT','MATIC/USDT','DOT/USDT',
    'LINK/USDT','UNI/USDT','ATOM/USDT','LTC/USDT','TRX/USDT',
    'NEAR/USDT','BCH/USDT','APT/USDT','ICP/USDT','FIL/USDT',
    'SHIB/USDT','OP/USDT','ARB/USDT','SUI/USDT','TON/USDT'
]

@app.route('/api/data', methods=['GET'])
def get_crypto_data():
    symbol = request.args.get('symbol', 'BTC/USDT')
    timeframe = request.args.get('timeframe', '1h')
    limit = int(request.args.get('limit', 500))

    try:
        df = crypto_service.fetch_ohlcv(symbol, timeframe, limit=limit)
        if df is None:
            return jsonify({'error': 'Problem fetching data from Binance'}), 500

        # Calculate indicators
        # df = crypto_service.calculate_indicators(df)

        # Convert DF to list of dicts for JSON serialization
        # Lightweight charts expects: {time: timestamp_s, open, high, low, close, volume}
        ohlc_data = []
        for index, row in df.iterrows():
            ohlc_data.append({
                'time': int(row['timestamp'] / 1000),
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': float(row['close']),
                'volume': float(row['volume'])
            })

        return jsonify({'ohlcv': ohlc_data, 'symbol': symbol})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/indicators', methods=['GET'])
def get_indicators():
    symbol = request.args.get('symbol', 'BTC/USDT')
    timeframe = request.args.get('timeframe', '1h')
    limit = int(request.args.get('limit', 500))

    try:
        df = crypto_service.fetch_ohlcv(symbol, timeframe, limit=limit)
        df = crypto_service.calculate_indicators(df)
        
        levels = crypto_service.get_key_levels(df)

        sma_20 = []
        sma_200 = []
        rsi = []

        for index, row in df.iterrows():
            if not pd.isna(row['sma_20']):
                sma_20.append({'time': int(row['timestamp'] / 1000), 'value': float(row['sma_20'])})
            if not pd.isna(row['sma_200']):
                sma_200.append({'time': int(row['timestamp'] / 1000), 'value': float(row['sma_200'])})
            if not pd.isna(row['rsi']):
                rsi.append({'time': int(row['timestamp'] / 1000), 'value': float(row['rsi'])})

        return jsonify({
            'sma_20': sma_20,
            'sma_200': sma_200,
            'rsi': rsi,
            'levels': levels
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['GET'])
def get_prediction():
    symbol = request.args.get('symbol', 'BTC/USDT')
    timeframe = request.args.get('timeframe', '1h')
    limit = int(request.args.get('limit', 200))

    try:
        df = crypto_service.fetch_ohlcv(symbol, timeframe, limit=limit)
        future_prices = crypto_service.project_linear_regression(df)

        # Projection timestamps
        last_timestamp = df['timestamp'].iloc[-1]
        timeframe_ms = (df['timestamp'].iloc[-1] - df['timestamp'].iloc[-2])
        
        predictions = []
        for i, price in enumerate(future_prices):
            next_ts = int((last_timestamp + (i + 1) * timeframe_ms) / 1000)
            predictions.append({'time': next_ts, 'value': price})

        return jsonify({'predictions': predictions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ticker', methods=['GET'])
def get_ticker():
    """Returns live price + 24h change for all ticker symbols."""
    try:
        tickers = crypto_service.fetch_ticker_batch(TICKER_SYMBOLS)
        return jsonify({'tickers': tickers})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_symbols():
    """Search available trading symbols."""
    query = request.args.get('q', '').upper()
    try:
        markets = crypto_service.exchange.load_markets()
        results = [
            s for s in markets.keys()
            if query in s and s.endswith('/USDT')
        ][:30]
        return jsonify({'symbols': sorted(results)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
