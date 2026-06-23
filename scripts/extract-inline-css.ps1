$root = "c:\Users\Euclecio\S\jornada-analista"
$outUser = Join-Path $root "css\ds\pages-user.css"
$outAdmin = Join-Path $root "css\ds\pages-admin.css"

$userFiles = Get-ChildItem (Join-Path $root "html usuarios\*.html")
$adminFiles = Get-ChildItem (Join-Path $root "html adm\*.html")

function Extract-Styles {
  param($files, $outPath, $scope)
  $lines = @()
  $lines += "/* Jornada page styles: $scope */"
  $lines += ""

  foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8
    if ($c -match '(?s)<style>(.*?)</style>') {
      $css = $matches[1].Trim()
      $lines += "/* --- $($f.Name) --- */"
      $lines += $css
      $lines += ""
      $c = $c -replace '(?s)\s*<style>.*?</style>\s*', "`n"
      [System.IO.File]::WriteAllText($f.FullName, $c)
      Write-Host "Extracted: $($f.Name)"
    }
  }
  [System.IO.File]::WriteAllText($outPath, ($lines -join "`n"))
}

Extract-Styles $userFiles $outUser "user"
Extract-Styles $adminFiles $outAdmin "admin"

$pa = Join-Path $root "css\ds\pages-user.css"
$c = [System.IO.File]::ReadAllText($pa)
$c = $c -replace 'body\.page-agenda\.bg', 'body.page-agenda'
[System.IO.File]::WriteAllText($pa, $c)

Write-Host "Done"
