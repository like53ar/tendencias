Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

Dim ps1Path
ps1Path = "C:\Users\fabar\OneDrive\Escritorio\tendencias\start_zencrypto.ps1"

' Lanzar PowerShell completamente silencioso (sin ventana, sin barra de tareas)
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File """ & ps1Path & """", 0, False

Set WshShell = Nothing
