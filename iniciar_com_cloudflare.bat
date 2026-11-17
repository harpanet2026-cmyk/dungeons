@echo off
title Dungeons - Servidor Local + Cloudflare Tunnel
color 0b

echo ========================================================
echo   DUNGEONS & DRAGONS 5E - SERVIDOR + CLOUDFLARE TUNNEL
echo ========================================================
echo.

set OLLAMA_ORIGINS=*
set OLLAMA_HOST=0.0.0.0:11434

echo [1/3] Verificando servico do Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama ja esta em execucao com suporte a CORS!
) else (
    echo [*] Iniciando Ollama em segundo plano...
    start "" /B "C:\Users\guilherme\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 3 >NUL
)

echo.
echo [2/3] Verificando servidor web do Dungeons...
netstat -ano | find "5173" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Servidor Vite ativo em http://localhost:5173!
) else (
    echo [*] Iniciando Vite dev server...
    start "" /B node ./node_modules/vite/bin/vite.js --config vite.config.js
    timeout /t 3 >NUL
)

echo.
echo [3/3] Criando link publico seguro no Cloudflare...
echo.
echo ====================================================================
echo   COPIE O LINK "https://....trycloudflare.com" ABAIXO:
echo   (Ele permite acessar o jogo E o Ollama de qualquer lugar!)
echo ====================================================================
echo.

.\cloudflared.exe tunnel --url http://localhost:5173

pause
