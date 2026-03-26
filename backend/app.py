from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from services.crypto_service import CryptoService
import os
import time
import threading
import pandas as pd

# Serve Angular static build
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist', 'frontend', 'browser')

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)

crypto_service = CryptoService()

# ── Watchdog: apaga el servidor si el browser se cierra ──────
_last_ping = time.time()
_PING_TIMEOUT = 25  # segundos sin ping → apagar

def _watchdog():
    while True:
        time.sleep(5)
        if time.time() - _last_ping > _PING_TIMEOUT:
            print('[ZenCrypto] Browser desconectado — apagando servidor.')
            os._exit(0)

threading.Thread(target=_watchdog, daemon=True).start()

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

@app.route('/api/keepalive', methods=['GET'])
def keepalive():
    """El frontend hace ping cada 10s. Si deja de llegar, el watchdog apaga el servidor."""
    global _last_ping
    _last_ping = time.time()
    return jsonify({'ok': True})

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

# ── Catch-all: serve Angular app for any non-API route ──────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_angular(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8765))
    app.run(debug=False, threaded=True, host='0.0.0.0', port=port)
