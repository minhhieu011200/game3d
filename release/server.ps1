# Máy chủ tĩnh chạy trên máy (localhost) cho trò chơi Toán 1, không cần cài thêm phần mềm.
# Trình duyệt chỉ cho dùng camera trên http://localhost, nên không mở thẳng file index.html được.
param(
  [int]$Port = 8080,
  [int]$LastPort = 8090,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot 'game'
if (-not (Test-Path (Join-Path $root 'index.html'))) {
  Write-Host "Khong tim thay thu muc game\index.html canh file nay." -ForegroundColor Red
  Read-Host 'Bam Enter de dong'
  exit 1
}
$root = (Resolve-Path $root).Path

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json'
  '.wasm' = 'application/wasm'
  '.glb'  = 'model/gltf-binary'
  '.gltf' = 'model/gltf+json'
  '.task' = 'application/octet-stream'
  '.bin'  = 'application/octet-stream'
  '.hdr'  = 'application/octet-stream'
  '.ktx2' = 'image/ktx2'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.svg'  = 'image/svg+xml'
  '.mp3'  = 'audio/mpeg'
  '.wav'  = 'audio/wav'
  '.woff2' = 'font/woff2'
  '.woff' = 'font/woff'
  '.ico'  = 'image/x-icon'
}

# Tìm cổng trống từ $Port đến $LastPort.
$listener = $null
for ($p = $Port; $p -le $LastPort; $p++) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$p/")
  try {
    $l.Start()
    $listener = $l
    $Port = $p
    break
  } catch {
    $l.Close()
  }
}
if (-not $listener) {
  Write-Host "Cac cong tu $Port den $LastPort deu dang ban. Hay dong bot chuong trinh roi chay lai." -ForegroundColor Red
  Read-Host 'Bam Enter de dong'
  exit 1
}

$url = "http://localhost:$Port/"
Write-Host ''
Write-Host '  TRO CHOI TOAN 1 dang chay tai:' -ForegroundColor Green
Write-Host "  $url" -ForegroundColor Yellow
Write-Host '  Dong cua so nay de tat tro choi.'
Write-Host ''

if (-not $NoBrowser) {
  $edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($edge) { Start-Process $edge -ArgumentList "--app=$url", '--start-maximized' }
  else { Start-Process $url }
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '') { $rel = 'index.html' }
      $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
      # chặn đọc file ngoài thư mục game
      if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf)) {
        $res.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
        $res.ContentType = 'text/plain; charset=utf-8'
      } else {
        $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [IO.File]::ReadAllBytes($path)
      }
      $res.Headers.Add('Cache-Control', 'no-cache')
      if ($req.HttpMethod -eq 'HEAD') {
        $res.ContentLength64 = $bytes.Length
      } else {
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } catch {
      $res.StatusCode = 500
    } finally {
      $res.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
}
