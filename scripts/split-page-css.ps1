$root = "c:\Users\Euclecio\S\jornada-analista"
$pagesDir = Join-Path $root "css\pages"
New-Item -ItemType Directory -Force -Path $pagesDir | Out-Null

function Split-PagesCss {
  param($sourceFile, $prefix)
  if (-not (Test-Path $sourceFile)) { return @{} }
  $content = [System.IO.File]::ReadAllText($sourceFile)
  $map = @{}
  $parts = [regex]::Split($content, '/\* --- (.+?) --- \*/')
  for ($i = 1; $i -lt $parts.Length; $i += 2) {
    $fileName = $parts[$i].Trim()
    $css = $parts[$i + 1].Trim()
    if (-not $css) { continue }
    $base = $fileName -replace '\.html$',''
    $outName = "$prefix-$base.css"
    $outPath = Join-Path $pagesDir $outName
    [System.IO.File]::WriteAllText($outPath, "/* $fileName */`n$css")
    $map[$fileName] = "pages/$outName"
    Write-Host "Created $outName"
  }
  return $map
}

$userMap = Split-PagesCss (Join-Path $root "css\ds\pages-user.css") "user"
$adminMap = Split-PagesCss (Join-Path $root "css\ds\pages-admin.css") "admin"

function Add-PageLink {
  param($htmlPath, $cssRel)
  $c = [System.IO.File]::ReadAllText($htmlPath)
  if ($c -match [regex]::Escape($cssRel)) { return }
  $link = "  <link rel=`"stylesheet`" href=`"../css/$cssRel`" />"
  $c = $c -replace '(<link rel="stylesheet" href="\.\./css/bundle-(user|admin)\.css" />)', "`$1`n$link"
  [System.IO.File]::WriteAllText($htmlPath, $c)
}

foreach ($kv in $userMap.GetEnumerator()) {
  $html = Join-Path $root "html usuarios\$($kv.Key)"
  if (Test-Path $html) { Add-PageLink $html $kv.Value }
}

foreach ($kv in $adminMap.GetEnumerator()) {
  $html = Join-Path $root "html adm\$($kv.Key)"
  if (Test-Path $html) { Add-PageLink $html $kv.Value }
}

# Add page body classes
$bodyClasses = @{
  'agenda.html' = 'page-agenda-view'
  'avaliacao-matinal-geral.html' = 'page-matinal'
  'relatorio_mgr.html' = 'page-relatorio'
  'resultados.html' = 'page-resultados'
  'rps-adm.html' = 'page-rps'
  'kpis_cd_mes.html' = 'page-kpi-cd'
  'agenda-dia-adm.html' = 'page-centered'
  'painel-matinal-geral-adm.html' = 'page-matinal'
}

foreach ($kv in $bodyClasses.GetEnumerator()) {
  $paths = @(
    (Join-Path $root "html usuarios\$($kv.Key)"),
    (Join-Path $root "html adm\$($kv.Key)")
  )
  foreach ($p in $paths) {
    if (-not (Test-Path $p)) { continue }
    $c = [System.IO.File]::ReadAllText($p)
    if ($c -match '<body class="([^"]*)">') {
      $cls = $matches[1] -split '\s+' | Where-Object { $_ }
      if ($cls -notcontains $kv.Value) {
        $newCls = ($cls + $kv.Value) -join ' '
        $c = $c -replace '<body class="[^"]*">', "<body class=`"$newCls`">"
        [System.IO.File]::WriteAllText($p, $c)
      }
    }
  }
}

Write-Host "Split complete"
