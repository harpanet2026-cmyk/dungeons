<#
.SYNOPSIS
  Script de Validação e Healthcheck da Google Gemini API no Windows
  Testa o endpoint v1beta com o modelo gemini-3.8-flash
#>

param(
  [string]$ApiKey = $env:GEMINI_API_KEY,
  [string]$Model = "gemini-3.8-flash"
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
Write-Host "• Modelo: $Model"
Write-Host "• Endpoint: /v1beta/models/${Model}:generateContent"

if (-not $ApiKey) {
  Write-Host "• Chave: NÃO ENCONTRADA" -ForegroundColor Red
  Write-Host "`n[AVISO] Configure GEMINI_API_KEY no arquivo .env ou execute:" -ForegroundColor Yellow
  Write-Host "  .\test-gemini.ps1 -ApiKey SUA_CHAVE_AQUI`n" -ForegroundColor White
  exit 0
}

$masked = $ApiKey.Substring(0, [Math]::Min(6, $ApiKey.Length)) + "..." + $ApiKey.Substring([Math]::Max(0, $ApiKey.Length - 4))
Write-Host "• Chave configurada: SIM ($masked)" -ForegroundColor Green
Write-Host "----------------------------------------------------"

$cleanModel = $Model.Replace("models/", "").Trim()
$url = "https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=$ApiKey"

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

Write-Host "Enviando prompt de teste: 'Responda apenas: OK'..."

try {
  $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
  $text = $response.candidates[0].content.parts[0].text.Trim()
  Write-Host "`n✓ Retorno da API: HTTP 200 OK" -ForegroundColor Green
  Write-Host "✓ Resposta do modelo: `"$text`"" -ForegroundColor Cyan
  Write-Host "`n[SUCESSO] A integração com o modelo $cleanModel está 100% operacional!`n" -ForegroundColor Green
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  Write-Host "`n✗ Erro retornado pela Gemini API: HTTP $statusCode" -ForegroundColor Red
  try {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $rawError = $reader.ReadToEnd()
    Write-Host "Detalhes JSON:" -ForegroundColor DarkRed
    Write-Host $rawError
  } catch {
    Write-Host $_.Exception.Message
  }
  exit 1
}
