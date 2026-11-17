@echo off
title Dungeons - Tunel Seguro HTTPS para Ollama
color 0a

echo ========================================================
echo   TUNEL CLOUDFLARE HTTPS PARA OLLAMA (USO NO PAGES/CELULAR)
echo ========================================================
echo.

set OLLAMA_ORIGINS=*
set OLLAMA_HOST=0.0.0.0:11434

echo [1/2] Verificando servico do Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama ativo em http://127.0.0.1:11434!
) else (
    echo [*] Iniciando Ollama em segundo plano...
    start "" /B "C:\Users\guilherme\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 3 >NUL
)

echo.
echo [2/2] Criando endereco HTTPS publico para o Ollama...
echo.
echo ====================================================================
echo   COPIE O LINK "https://....trycloudflare.com" ABAIXO
echo   E COLE NO CAMPO "Endpoint do Ollama" DENTRO DAS CONFIGURACOES DO APP:
echo ====================================================================
echo.

.\cloudflared.exe tunnel --url http://127.0.0.1:11434

pause
