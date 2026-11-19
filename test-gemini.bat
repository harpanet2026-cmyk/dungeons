@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0test-gemini.ps1" %*
endlocal
