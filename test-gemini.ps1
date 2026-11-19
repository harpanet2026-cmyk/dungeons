<#
.SYNOPSIS
  Script de Validação e Healthcheck da Google Gemini API no Windows
  Testa o endpoint v1beta com modelo estável e cascata de fallback automática
#>

param(
  [string]$ApiKey = $env:GEMINI_API_KEY,
  [string]$Model = "gemini-1.5-flash"
)

# Carrega do .env se existir e ApiKey não estiver no ambiente
if (-not $ApiKey -and (Test-Path ".env")) {
  Get-Content ".env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
      $parts = $line.Split("=", 2)
      if ($parts.Length -eq 2 -and ($parts[0].Trim() -eq "GEMINI_API_KEY" -or $parts[0].Trim() -eq "VITE_GEMINI_API_KEY")) {
        $ApiKey = $parts[1].Trim().Trim('"').Trim("'")
      }
    }
  }
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   TESTE DE VALIDAÇÃO DA GOOGLE GEMINI API" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "• Modelo Inicial: $Model"
Write-Host "• Endpoint Base: /v1beta/models/{MODEL}:generateContent"

if (-not $ApiKey) {
  Write-Host "• Chave: NÃO ENCONTRADA" -ForegroundColor Red
  Write-Host "`n[AVISO] Configure GEMINI_API_KEY no arquivo .env ou execute:" -ForegroundColor Yellow
  Write-Host "  .\test-gemini.bat -ApiKey SUA_CHAVE_AQUI`n" -ForegroundColor White
  exit 0
}

$masked = $ApiKey.Substring(0, [Math]::Min(6, $ApiKey.Length)) + "..." + $ApiKey.Substring([Math]::Max(0, $ApiKey.Length - 4))
Write-Host "• Chave configurada: SIM ($masked)" -ForegroundColor Green
Write-Host "----------------------------------------------------"

# Lista de modelos a testar em cascata
$modelsToTest = @(
  $Model.Replace("models/", "").Trim(),
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-2.5-flash",
  "gemini-3.8-flash"
) | Select-Object -Unique

$success = $false
$workingModel = ""

foreach ($currentModel in $modelsToTest) {
  $url = "https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=$ApiKey"
  $body = @{
    contents = @(
      @{
        role = "user"
        parts = @(
          @{ text = "Responda apenas: OK" }
        )
      }
    )
    generationConfig = @{
      temperature = 0.1
      maxOutputTokens = 15
    }
  } | ConvertTo-Json -Depth 5

  Write-Host "Testando modelo '$currentModel'..." -ForegroundColor White

  try {
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    $text = $response.candidates[0].content.parts[0].text.Trim()

    Write-Host "`n✓ Retorno da API: HTTP 200 OK" -ForegroundColor Green
    Write-Host "✓ Modelo ativo: $currentModel" -ForegroundColor Green
    Write-Host "✓ Resposta obtida: `"$text`"" -ForegroundColor Cyan

    Write-Host "`n[SUCESSO] A integração com o modelo $currentModel está 100% operacional!`n" -ForegroundColor Green

    $success = $true
    $workingModel = $currentModel
    break
  } catch {
    $statusCode = 0
    if ($_.Exception.Response) {
      $statusCode = $_.Exception.Response.StatusCode.value__
    }

    if ($statusCode -eq 404) {
      Write-Host "  -> Modelo '$currentModel' não disponível (HTTP 404). Testando próximo..." -ForegroundColor DarkYellow
      continue
    } elseif ($statusCode -eq 429) {
      Write-Host "`n✗ Erro retornado pela Gemini API: HTTP 429 Too Many Requests" -ForegroundColor Red
      Write-Host "Limite de requisições excedido na chave gratuita. Aguarde cerca de 30-60 segundos." -ForegroundColor Yellow
      exit 1
    } elseif ($statusCode -eq 400) {
      Write-Host "`n✗ Erro retornado pela Gemini API: HTTP 400 Bad Request" -ForegroundColor Red
      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $rawError = $reader.ReadToEnd()
        Write-Host "Detalhes JSON: $rawError" -ForegroundColor DarkRed
      } catch {
        Write-Host $_.Exception.Message
      }
      exit 1
    } else {
      Write-Host "  -> Falha no modelo '$currentModel': HTTP $statusCode" -ForegroundColor Red
    }
  }
}

if (-not $success) {
  Write-Host "`n[ERRO] Nenhum dos modelos respondeu com sucesso." -ForegroundColor Red
  exit 1
}

exit 0
