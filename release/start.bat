@echo off
rem Bam dup file nay de mo Tro choi Toan 1 (khong can mang).
rem File nay tu chua may chu va tu tim thu muc tro choi, nen de o thu muc nao cung chay duoc.
set "TC_BAT=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$s = [IO.File]::ReadAllText($env:TC_BAT); $m = '#=' + '=PS==#'; Invoke-Expression ($s.Substring($s.IndexOf($m) + $m.Length))"
if errorlevel 1 pause
goto :eof

#==PS==#
# ---- Phan duoi day la PowerShell, cmd khong doc toi ----
# May chu tinh tren localhost: trinh duyet chi cho dung camera tren http://localhost,
# nen khong mo thang file index.html duoc.
$ErrorActionPreference = 'Stop'
$Port = 8080
$LastPort = 8090
$batDir = Split-Path -Parent $env:TC_BAT
$memo = Join-Path $env:LOCALAPPDATA 'TroChoiToan1\thu-muc-game.txt'

# Mot thu muc la tro choi neu co index.html va mo hinh nhan dien ban tay.
function Test-Game([string]$dir) {
  if (-not $dir) { return $false }
  try {
    return (Test-Path -LiteralPath (Join-Path $dir 'index.html') -PathType Leaf) -and
           (Test-Path -LiteralPath (Join-Path $dir 'mediapipe\hand_landmarker.task') -PathType Leaf)
  } catch { return $false }
}

function Find-Game {
  # 1. Canh file start.bat va cac thu muc cha (vd. start.bat o trong release\ hay ngoai TroChoiToan1\)
  $d = $batDir
  for ($i = 0; $i -lt 5 -and $d; $i++) {
    foreach ($c in @('game', 'TroChoiToan1\game', 'dist', '.')) {
      $p = Join-Path $d $c
      if (Test-Game $p) { return $p }
    }
    $d = Split-Path -Parent $d
  }
  # 2. Thu muc da tim thay lan truoc
  if (Test-Path -LiteralPath $memo) {
    $p = (Get-Content -LiteralPath $memo -Encoding UTF8 -TotalCount 1)
    if (Test-Game $p) { return $p }
  }
  # 3. Tim thu muc TroChoiToan1 o Desktop, Documents, Downloads va o cac o dia / USB
  Write-Host '  Dang tim thu muc tro choi TroChoiToan1...'
  $bases = @(
    [Environment]::GetFolderPath('Desktop'),
    [Environment]::GetFolderPath('MyDocuments'),
    (Join-Path $env:USERPROFILE 'Downloads'),
    $env:USERPROFILE
  )
  $bases += [IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady -and ($_.DriveType -eq 'Fixed' -or $_.DriveType -eq 'Removable') } | ForEach-Object { $_.RootDirectory.FullName }
  $skip = '^(Windows|Program Files.*|ProgramData|\$Recycle\.Bin|System Volume Information|AppData|node_modules)$'
  foreach ($b in ($bases | Where-Object { $_ } | Select-Object -Unique)) {
    $p = Join-Path $b 'TroChoiToan1\game'
    if (Test-Game $p) { return $p }
    # tim sau them 2 cap thu muc, vd. D:\Toan1\TroChoiToan1 hay D:\GiaoAn\Tuan10\TroChoiToan1
    $lv1 = @(Get-ChildItem -LiteralPath $b -Directory -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch $skip })
    foreach ($a in $lv1) {
      $p = Join-Path $a.FullName 'TroChoiToan1\game'
      if (Test-Game $p) { return $p }
      foreach ($a2 in @(Get-ChildItem -LiteralPath $a.FullName -Directory -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch $skip })) {
        $p = Join-Path $a2.FullName 'TroChoiToan1\game'
        if (Test-Game $p) { return $p }
      }
    }
  }
  return $null
}

$root = Find-Game
if (-not $root) {
  Write-Host ''
  Write-Host '  Khong tim thay tro choi (thu muc TroChoiToan1\game) tren may.' -ForegroundColor Red
  Write-Host '  - Neu dang mo file .zip: hay giai nen (Extract All) ca thu muc TroChoiToan1 truoc.'
  Write-Host '  - Hay chep ca thu muc TroChoiToan1 vao may (o D:, Desktop hoac USB), roi bam dup start.bat.'
  Write-Host ''
  exit 1
}
$root = (Resolve-Path -LiteralPath $root).Path.TrimEnd('\') + '\'
try {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $memo) | Out-Null
  Set-Content -LiteralPath $memo -Value $root -Encoding UTF8
} catch {}

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

# Tim cong trong tu $Port den $LastPort.
$listener = $null
$lastError = ''
for ($p = $Port; $p -le $LastPort; $p++) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$p/")
  try {
    $l.Start()
    $listener = $l
    $Port = $p
    break
  } catch {
    $lastError = $_.Exception.Message
    $l.Close()
  }
}
if (-not $listener) {
  Write-Host "Khong mo duoc may chu tren cac cong $Port den $LastPort." -ForegroundColor Red
  Write-Host "Loi: $lastError"
  Write-Host 'Hay dong bot chuong trinh (hoac khoi dong lai may) roi chay lai start.bat.'
  exit 1
}

$url = "http://localhost:$Port/"
Write-Host ''
Write-Host '  TRO CHOI TOAN 1 dang chay tai:' -ForegroundColor Green
Write-Host "  $url" -ForegroundColor Yellow
Write-Host "  Thu muc tro choi: $root"
Write-Host '  Dong cua so nay de tat tro choi.'
Write-Host ''

if (-not $env:TC_NO_BROWSER) {
  $edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($edge) { Start-Process $edge -ArgumentList "--app=$url", '--start-maximized' }
  else { Start-Process $url }
}

try {
  while ($listener.IsListening) {
    try { $ctx = $listener.GetContext() } catch { continue }
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '') { $rel = 'index.html' }
      $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
      # chan doc file ngoai thu muc tro choi
      if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $path -PathType Leaf)) {
        $res.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes('Not found')
        $res.ContentType = 'text/plain; charset=utf-8'
      } else {
        $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [IO.File]::ReadAllBytes($path)
      }
      $res.Headers.Add('Cache-Control', 'no-cache')
      $res.ContentLength64 = $bytes.Length
      if ($req.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
    } catch {
      # trinh duyet ngat ket noi giua chung (hay gap khi tai am thanh): bo qua, may chu chay tiep
      try { $res.StatusCode = 500 } catch {}
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
