# 🌌 ZenCrypto Analytics

> Dashboard profesional de análisis de criptomonedas en tiempo real — diseño **Zen**, arranque instantáneo.

---

## 📸 Vista General

ZenCrypto Analytics es un dashboard de trading personal con interfaz oscura premium, datos en vivo desde Binance y análisis técnico integrado. El sistema está optimizado para arrancar en segundos desde un doble clic en el escritorio.

---

## ✨ Características

| Módulo | Descripción |
|---|---|
| **Live Ticker** | Banda deslizante con 25+ pares en tiempo real (precio + cambio 24h) |
| **Watchlist dinámica** | Lista personalizable con búsqueda de monedas y precios en vivo |
| **Gráfico de velas** | Velas japonesas interactivas con SMA20, SMA200 y proyección lineal |
| **Histograma de volumen** | Volumen superpuesto en el gráfico, coloreado según vela alcista/bajista |
| **Indicadores técnicos** | RSI en panel secundario con zonas de sobrecompra/sobreventa |
| **Niveles clave** | Soporte y resistencia automáticos detectados por ventana deslizante |
| **Proyección predictiva** | Estimación de precio a 24h por regresión lineal |
| **Múltiples temporalidades** | 15m, 1h, 4h, 1d, 1w |

---

## 🏗️ Arquitectura

```
tendencias/
├── backend/                  # API REST (Python / Flask)
│   ├── app.py                # Servidor Flask + rutas API + sirviendo frontend estático
│   ├── requirements.txt
│   └── services/
│       └── crypto_service.py # Fetch OHLCV, indicadores, ticker batch, regresión
│
├── frontend/                 # SPA (Angular 21+)
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── topbar/            # Selector de temporalidad
│   │   │   ├── live-ticker/       # Banda de precios en tiempo real
│   │   │   ├── watchlist/         # Lista de monedas con búsqueda
│   │   │   ├── trading-chart/     # Gráfico principal (velas + volumen + SMAs)
│   │   │   ├── oscillators/       # Panel RSI
│   │   │   ├── prediction-panel/  # Proyección + soporte/resistencia
│   │   │   └── dashboard/         # Compositor principal
│   │   └── services/
│   │       └── crypto-api.service.ts
│   └── dist/frontend/browser/ # Build de producción (servido por Flask)
│
├── start_zencrypto.ps1       # Script de arranque optimizado
├── start_zen_analytics.vbs   # Lanzador silencioso (doble clic en escritorio)
└── zen_splash.html           # Pantalla de carga mientras levanta el backend
```

**Stack:**

- **Frontend**: Angular 21 · TypeScript · lightweight-charts v5 · RxJS
- **Backend**: Python 3.10+ · Flask · Flask-CORS · ccxt · Pandas · NumPy · scikit-learn
- **Datos de mercado**: Binance (via `ccxt`)

---

## ⚡ Modelo de arranque (Fast Mode)

La app está optimizada para **arranque instantáneo** sin necesidad de compilar Angular cada vez.

```
start_zen_analytics.vbs
       │
       └─── start_zencrypto.ps1
                 │
                 ├─ 1. Mata instancias previas (puerto 5000)
                 ├─ 2. Muestra splash screen (Edge en modo app)
                 ├─ 3. Lanza Flask (python app.py) en modo silencioso
                 ├─ 4. Poll cada 500ms hasta que /api/ticker responde (max 20s)
                 ├─ 5. Cierra splash
                 └─ 6. Abre http://localhost:5000 en el browser por defecto
```

**Flask sirve todo:** la API REST en `/api/*` y el build estático de Angular en `/`. No se necesita `ng serve`.

---

## 🛠️ Instalación

### Requisitos

- Python 3.10+
- Node.js 18+ con npm
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/like53ar/tendencias.git
cd tendencias
```

### 2. Configurar el backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install flask flask-cors pandas numpy scikit-learn ccxt statsmodels pandas-ta
```

### 3. Configurar el frontend

```bash
cd frontend
npm install
```

### 4. Build de producción (una sola vez)

```bash
cd frontend
npm run build
```

> Esto genera `frontend/dist/frontend/browser/` que Flask sirve automáticamente.
> **Solo hay que repetirlo si se modifica el código del frontend.**

### 5. Lanzar

```
Doble clic en start_zen_analytics.vbs
```

O manualmente:

```bash
cd backend
python app.py
# Acceder a http://localhost:5000
```

---

## 🔌 Endpoints API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/data` | OHLCV de una moneda (`symbol`, `timeframe`, `limit`) |
| `GET` | `/api/indicators` | SMA20, SMA200, RSI, soporte/resistencia |
| `GET` | `/api/predict` | Proyección por regresión lineal (next 24 velas) |
| `GET` | `/api/ticker` | Precios en vivo de 25 pares para el live ticker |
| `GET` | `/api/search` | Búsqueda de símbolos disponibles en Binance |
| `GET` | `/*` | Frontend Angular (archivos estáticos) |

---

## 🎨 Filosofía de diseño

- **Paleta dark**: Fondo `#090c10` / Superficies `#0d1117` / Bordes `#21262d`
- **Tipografía**: Inter · peso 400/700/800
- **Colores funcionales**: Verde `#3fb950` alcista · Rojo `#f85149` bajista · Azul `#388bff` SMA20 · Violeta `#bc8eff` proyección
- **Sin distracciones**: Sin animaciones innecesarias, datos que hablan solos

---

## 🔧 Optimizaciones implementadas

### Arranque rápido
- **Build estático de Angular** → Flask sirve el build en vez de `ng serve`. Tiempo de inicio: de ~90s a ~3s.
- **Flask sin debug reloader** → `debug=False, threaded=True` evita el doble proceso del Werkzeug reloader.
- **Lazy-loading de scikit-learn** → `LinearRegression` se importa solo al llamar `/api/predict`, no al arrancar el servidor.
- **Poll de 500ms** → El script detecta cuando Flask está listo 4× más rápido que antes.

### Gráfico de volumen
- Histograma superpuesto en el 18% inferior del gráfico de velas.
- Color por barra según dirección de la vela (verde/rojo semitransparente).
- Escala de volumen invisible (`visible: false`) para no contaminar el eje de precios.
- `setData` del volumen aislado en `try/catch` para que un error no bloquee la actualización de las velas.
- `fitContent()` automático al cambiar de moneda.

---

## 📌 Notas de desarrollo

> **Si modificás código Angular**, hay que rebuildar:
> ```bash
> cd frontend
> npm run build
> ```
> Luego reiniciar Flask (o usar el `.vbs`).

> **Agregar una nueva moneda al ticker**: editar `TICKER_SYMBOLS` en `backend/app.py`.

> **Cambiar el puerto**: variable de entorno `PORT` o editar el último bloque de `app.py`.

---

## ⚖️ Licencia

Proyecto privado — uso interno exclusivo.
