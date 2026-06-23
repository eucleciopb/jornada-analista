# Jornada — Atualiza HTMLs para Design System
$root = "c:\Users\Euclecio\S\jornada-analista"

$fontBlock = @'
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
'@

function Set-HeadBundle {
  param($path, $cssHref, $bundleName)
  $c = Get-Content $path -Raw -Encoding UTF8
  # Remove old stylesheet links
  $c = $c -replace '<link rel="stylesheet" href="(\.\./)?css/styles\.css"\s*/>\s*', ''
  $c = $c -replace '<link rel="stylesheet" href="(\.\./)?css/page-specific\.css"\s*/>\s*', ''
  $c = $c -replace '<link rel="stylesheet" href="css/styles\.css"\s*/>\s*', ''
  # Remove duplicate font blocks if re-running
  $c = $c -replace '(?s)<link rel="preconnect" href="https://fonts\.googleapis\.com">.*?</link>\s*', ''
  $insert = "$fontBlock`n  <link rel=`"stylesheet`" href=`"$cssHref`" />"
  if ($c -match '</title>') {
    $c = $c -replace '</title>', "</title>`n$insert"
  }
  Set-Content $path $c -Encoding UTF8 -NoNewline
}

function Remove-StyleBlock {
  param($path)
  $c = Get-Content $path -Raw -Encoding UTF8
  $c = $c -replace '(?s)\s*<style>.*?</style>\s*', "`n"
  Set-Content $path $c -Encoding UTF8 -NoNewline
}

function Add-BodyTheme {
  param($path, $theme, $extra = @())
  $c = Get-Content $path -Raw -Encoding UTF8
  $classes = @($theme, 'app-shell') + $extra
  $classStr = ($classes | Select-Object -Unique) -join ' '
  if ($c -match '<body class="([^"]*)">') {
    $existing = $matches[1] -split '\s+' | Where-Object { $_ -and $_ -ne 'bg' }
    $all = (@($theme, 'app-shell') + $existing) | Select-Object -Unique
    $c = $c -replace '<body class="[^"]*">', "<body class=`"$($all -join ' ')`">"
  } elseif ($c -match '<body>') {
    $c = $c -replace '<body>', "<body class=`"$classStr`">"
  }
  Set-Content $path $c -Encoding UTF8 -NoNewline
}

# User pages
$userPages = @(
  'html usuarios\treinamentos.html',
  'html usuarios\resultados.html',
  'html usuarios\criar-agenda.html',
  'html usuarios\biblioteca-treinamentos.html',
  'html usuarios\avaliacao-matinal-geral.html',
  'html usuarios\agenda.html',
  'html usuarios\relatorio_mgr.html'
)
foreach ($f in $userPages) {
  Set-HeadBundle (Join-Path $root $f) '../css/bundle-user.css'
  Add-BodyTheme (Join-Path $root $f) 'theme-user'
}

# Admin pages with bg
$adminBg = @(
  'html adm\dedo-duro.html','html adm\cadastro-treinamento.html',
  'html adm\treinos-resumo-adm.html','html adm\responsaveis-cd-adm.html',
  'html adm\metas-analistas-adm.html','html adm\kpis-supervisores-importar.html',
  'html adm\corrigir-tipo-treinamento.html','html adm\apuracao.html',
  'html adm\agenda-mensal-adm.html'
)
foreach ($f in $adminBg) {
  Set-HeadBundle (Join-Path $root $f) '../css/bundle-admin.css'
  Add-BodyTheme (Join-Path $root $f) 'theme-admin'
}

# Admin pages without bg
$adminOther = @(
  'html adm\rps-adm.html','html adm\processar-correlacao-treinamentos.html',
  'html adm\painel-matinal-geral-adm.html','html adm\kpis_cd_mes.html',
  'html adm\importar-kpis-cd.html','html adm\efetividade_treinamentos.html',
  'html adm\agenda-dia-adm.html','html adm\Cobertura_treinamentos.html',
  'html adm\Cadastro_grc_por_cd.html'
)
foreach ($f in $adminOther) {
  Set-HeadBundle (Join-Path $root $f) '../css/bundle-admin.css'
  Add-BodyTheme (Join-Path $root $f) 'theme-admin'
}

# Logins
Set-HeadBundle (Join-Path $root 'index.html') 'css/bundle-login-user.css'
$c = Get-Content (Join-Path $root 'index.html') -Raw -Encoding UTF8
$c = $c -replace '<body class="[^"]*">', '<body class="login-page theme-user">'
Set-Content (Join-Path $root 'index.html') $c -Encoding UTF8 -NoNewline
Remove-StyleBlock (Join-Path $root 'index.html')

Set-HeadBundle (Join-Path $root 'index2.html') 'css/bundle-login-admin.css'
$c = Get-Content (Join-Path $root 'index2.html') -Raw -Encoding UTF8
$c = $c -replace '<body>', '<body class="login-page theme-admin">'
Set-Content (Join-Path $root 'index2.html') $c -Encoding UTF8 -NoNewline
Remove-StyleBlock (Join-Path $root 'index2.html')

# Menus
Set-HeadBundle (Join-Path $root 'html menus\menu.html') '../css/bundle-portal-user.css'
Add-BodyTheme (Join-Path $root 'html menus\menu.html') 'theme-user' @('portal-page')
Remove-StyleBlock (Join-Path $root 'html menus\menu.html')

Set-HeadBundle (Join-Path $root 'html menus\menuadm.html') '../css/bundle-portal-admin.css'
Add-BodyTheme (Join-Path $root 'html menus\menuadm.html') 'theme-admin' @('portal-page')
Remove-StyleBlock (Join-Path $root 'html menus\menuadm.html')

# Remove small inline blocks from pages covered by DS
$stripInline = @(
  'html usuarios\treinamentos.html',
  'html adm\cadastro-treinamento.html'
)
foreach ($f in $stripInline) {
  Remove-StyleBlock (Join-Path $root $f)
}

Write-Host "Done."
