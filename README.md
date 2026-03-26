# 🌌 ZenCrypto Analytics

> Dashboard profesional de análisis de criptomonedas en tiempo real — diseño **Zen**, arranque instantáneo, auto-apagado inteligente.

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
| **Precio objetivo** | Ingresás un precio manualmente y el sistema calcula la probabilidad de alcanzarlo en base a 5 factores técnicos |
| **Múltiples temporalidades** | 15m, 1h, 4h, 1d, 1w |
| **Auto-apagado** | El servidor Flask se apaga automáticamente 30 segundos después de cerrar el browser |

---

## 🏗️ Arquitectura

```
tendencias/
├── backend/                  # API REST (Python / Flask)
│   ├── app.py                # Servidor Flask + API + frontend estático + watchdog
│   ├── requirements.txt
│   └── services/
│       └── crypto_service.py # Fetch OHLCV, indicadores, ticker batch, regresión
│
├── frontend/                 # SPA (Angular 21+)
│   ├── src/app/
│   │   ├── app.component.ts       # Keepalive ping cada 10s al servidor
│   │   ├── components/
│   │   │   ├── topbar/            # Selector de temporalidad
│   │   │   ├── live-ticker/       # Banda de precios en tiempo real
│   │   │   ├── watchlist/         # Lista de monedas con búsqueda
│   │   │   ├── trading-chart/     # Gráfico principal (velas + volumen + SMAs)
│   │   │   ├── oscillators/       # Panel RSI
│   │   │   ├── prediction-panel/  # Proyección + precio objetivo + soporte/resistencia
│   │   │   └── dashboard/         # Compositor principal
│   │   └── services/
│   │       └── crypto-api.service.ts  # URL base centralizada (puerto 8765)
│   └── dist/frontend/browser/    # Build de producción (servido por Flask)
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

La app está optimizada para **arranque instantáneo** sin compilar Angular cada vez.

```
start_zen_analytics.vbs
       │
       └─── start_zencrypto.ps1
                 │
                 ├─ 1. Mata instancias previas (puerto 8765)
                 ├─ 2. Muestra splash screen (Edge en modo app)
                 ├─ 3. Lanza Flask (python app.py) en modo silencioso
                 ├─ 4. Poll cada 500ms hasta que /api/ticker responde (max 20s)
                 ├─ 5. Cierra splash
                 └─ 6. Abre http://localhost:8765 en el browser por defecto
```

**Flask sirve todo:** la API REST en `/api/*` y el build estático de Angular en `/`. No se necesita `ng serve`.

---

## 🔴 Auto-apagado al cerrar el browser

El sistema incluye un mecanismo de watchdog para liberar el puerto automáticamente:

```
Angular (app.component.ts)
  └── GET /api/keepalive  cada 10 segundos

Flask (app.py) — hilo watchdog
  └── Si no recibe keepalive por 30s Y el browser se conectó alguna vez
        └── os._exit(0)  →  puerto 8765 liberado
```

**Comportamiento:**

| Estado | Watchdog |
|---|---|
| Flask arranca, browser no abrió aún | ⏸️ Inactivo — Flask espera indefinidamente |
| Browser abre, Angular envía primer ping | 🟢 Watchdog activado, empieza a contar |
| Browser se cierra, pings se detienen | ⏳ 30 segundos → Flask se apaga solo |

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

### 4. Build de producción *(una sola vez)*

```bash
cd frontend
npm run build
```

> Genera `frontend/dist/frontend/browser/` que Flask sirve automáticamente.
> **Solo hay que repetirlo si se modifica el código Angular.**

### 5. Lanzar

```
Doble clic en start_zen_analytics.vbs
```

O manualmente:

```bash
cd backend
python app.py
# Acceder a http://localhost:8765
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
| `GET` | `/api/keepalive` | Ping del browser — resetea el timer del watchdog |
| `GET` | `/*` | Frontend Angular (archivos estáticos) |

---

## 🎯 Widget de Precio Objetivo

En el panel derecho podés ingresar un precio objetivo y el sistema calcula la probabilidad de alcanzarlo usando 5 factores:

| Factor | Peso |
|---|---|
| Tendencia (SMA20 vs SMA200) | ±18 pts |
| RSI (sobrecompra / sobreventa / zona libre) | ±15 pts |
| Proyección del modelo 24h | ±14 pts |
| Distancia al objetivo | ±20 pts |
| Barreras de soporte/resistencia en el camino | ±10 pts |

El score final se clampea entre **5%** y **95%** (nunca certeza absoluta).

---

## 🎨 Filosofía de diseño

- **Paleta dark**: Fondo `#090c10` / Superficies `#0d1117` / Bordes `#21262d`
- **Tipografía**: Inter · peso 400/700/800
- **Colores funcionales**: Verde `#3fb950` alcista · Rojo `#f85149` bajista · Azul `#388bff` SMA20 · Violeta `#bc8eff` proyección

---

## 🔧 Optimizaciones implementadas

### Arranque rápido
- **Build estático de Angular** → de ~90s a ~3s de arranque
- **Flask sin debug reloader** → `debug=False, threaded=True`
- **Lazy-loading de scikit-learn** → se importa solo al llamar `/api/predict`
- **Poll de 500ms** → detecta Flask listo 4× más rápido

### Gráfico de volumen
- Histograma en el 18% inferior del gráfico, coloreado por dirección de vela
- Escala de volumen invisible para no contaminar el eje de precios
- `setData` aislado en `try/catch` + `fitContent()` al cambiar de moneda

### Auto-apagado inteligente
- Watchdog inactivo hasta que el browser se conecta por primera vez
- Evita falsos positivos durante el arranque
- Puerto 8765 liberado automáticamente a los 30s de cerrar el browser

---

## 📌 Notas de desarrollo

> **Si modificás código Angular**, hay que rebuildar:
> ```bash
> cd frontend
> npm run build
> ```
> Luego reiniciar la app con el `.vbs`.

> **Cambiar el puerto**: editar `PORT` en `backend/app.py`, `crypto-api.service.ts`, `watchlist.component.ts`, `live-ticker.component.ts` y `start_zencrypto.ps1`.

> **Agregar una nueva moneda al ticker**: editar `TICKER_SYMBOLS` en `backend/app.py`.

---

## ⚖️ Licencia

Proyecto privado — uso interno exclusivo.
