# ============================================================
# ZenCrypto Analytics - Startup Script
# Mata instancias previas, arranca backend + frontend,
# espera que estén listos y abre el browser.
# ============================================================

$BasePath    = "C:\Users\fabar\OneDrive\Escritorio\tendencias"
$BackendPath = "$BasePath\backend"
$FrontendPath= "$BasePath\frontend"
$SplashUrl   = "file:///$($BasePath.Replace('\','/'))/zen_splash.html"

# ── 1. MATAR INSTANCIAS PREVIAS ──────────────────────────────

# Matar procesos en los puertos 5000 (backend) y 4200 (Angular)
foreach ($port in @(5000, 4200)) {
    $pids = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
    foreach ($p in $pids) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

# Matar cualquier "python app.py" y proceso "ng serve" / "node" relacionado
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-WmiObject Win32_Process -Filter "CommandLine LIKE '%ng serve%' OR CommandLine LIKE '%npm run start%'" -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1   # Pequena pausa para liberar puertos

# ── 2. SPLASH SCREEN (silencioso, sin barra de tareas) ───────
$splashProc = Start-Process "msedge" -ArgumentList "--app=$SplashUrl", "--window-size=450,320", "--window-position=735,300" -PassThru
Start-Sleep -Milliseconds 500

# ── 3. INICIAR BACKEND (Python Flask) ────────────────────────
Start-Process "python" -ArgumentList "app.py" `
    -WorkingDirectory $BackendPath `
    -WindowStyle Hidden

# ── 4. INICIAR FRONTEND (Angular) ────────────────────────────
Start-Process "cmd" -ArgumentList "/c SET NG_CLI_ANALYTICS=false && npm run start" `
    -WorkingDirectory $FrontendPath `
    -WindowStyle Hidden

# ── 5. ESPERAR A QUE EL BACKEND ESTÉ LISTO (max 30s) ────────
$maxWait = 30
$waited  = 0
while ($waited -lt $maxWait) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:5000/api/ticker" -TimeoutSec 2 -ErrorAction Stop
        break
    } catch {
        Start-Sleep -Seconds 2
        $waited += 2
    }
}

# ── 6. ESPERAR A QUE ANGULAR ESTÉ LISTO (max 120s) ──────────
$maxWait = 120
$waited  = 0
while ($waited -lt $maxWait) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 2 -ErrorAction Stop
        break
    } catch {
        Start-Sleep -Seconds 3
        $waited += 3
    }
}

Start-Sleep -Seconds 1   # Pausa mínima para que Angular renderice

# ── 7. CERRAR SPLASH Y ABRIR EL SISTEMA ──────────────────────
if ($splashProc -and !$splashProc.HasExited) {
    Stop-Process -Id $splashProc.Id -Force -ErrorAction SilentlyContinue
}

# Abrir el dashboard en el browser predeterminado
Start-Process "http://localhost:4200"
