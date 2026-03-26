# ============================================================
# ZenCrypto Analytics - Startup Script (FAST MODE)
# Build estático de Angular + Flask sirve todo desde :5000
# ============================================================

$BasePath    = "C:\Users\fabar\OneDrive\Escritorio\tendencias"
$BackendPath = "$BasePath\backend"
$FrontendPath= "$BasePath\frontend"
$SplashUrl   = "file:///$($BasePath.Replace('\','/'))/zen_splash.html"

# ── 1. MATAR INSTANCIAS PREVIAS ──────────────────────────────

foreach ($port in @(8765)) {
    $pids = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
    foreach ($p in $pids) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Milliseconds 500

# ── 2. SPLASH SCREEN ─────────────────────────────────────────
$splashProc = Start-Process "msedge" -ArgumentList "--app=$SplashUrl", "--window-size=450,320", "--window-position=735,300" -PassThru
Start-Sleep -Milliseconds 300

# ── 3. INICIAR BACKEND (Flask sirve Angular + API) ───────────
Start-Process "python" -ArgumentList "app.py" `
    -WorkingDirectory $BackendPath `
    -WindowStyle Hidden

# ── 4. ESPERAR AL BACKEND (max 20s, poll cada 500ms) ─────────
$maxWait = 20
$waited  = 0
$ready   = $false
while ($waited -lt $maxWait) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8765/api/ticker" -TimeoutSec 1 -ErrorAction Stop
        $ready = $true
        break
    } catch {
        Start-Sleep -Milliseconds 500
        $waited += 0.5
    }
}

# ── 5. CERRAR SPLASH Y ABRIR EL DASHBOARD ────────────────────
if ($splashProc -and !$splashProc.HasExited) {
    Stop-Process -Id $splashProc.Id -Force -ErrorAction SilentlyContinue
}

if ($ready) {
    Start-Process "http://localhost:8765"
} else {
    # Si tardó más de lo esperado, abrir igual
    Start-Process "http://localhost:8765"
}
