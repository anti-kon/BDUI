param(
  [string]$DocxPath = "reports\vkr-part-2-bdui-konopelkin-2026.docx",
  [string]$OutDir = "reports\diploma-render"
)

$ErrorActionPreference = "Stop"

$resolvedDocx = (Resolve-Path -LiteralPath $DocxPath).Path
$resolvedOutDir = Join-Path (Get-Location) $OutDir
New-Item -ItemType Directory -Path $resolvedOutDir -Force | Out-Null

$pdfPath = Join-Path $resolvedOutDir ((Get-Item -LiteralPath $resolvedDocx).BaseName + ".pdf")
$wdExportFormatPDF = 17
$wdStatisticPages = 2

$word = New-Object -ComObject Word.Application
try {
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($resolvedDocx, $false, $false)
  try {
    foreach ($toc in @($document.TablesOfContents)) {
      $toc.Update()
    }
    $document.Fields.Update() | Out-Null
    $pages = $document.ComputeStatistics($wdStatisticPages)
    $document.Save()
    $document.ExportAsFixedFormat($pdfPath, $wdExportFormatPDF)
  } finally {
    $document.Close($false)
  }
} finally {
  $word.Quit()
}

[pscustomobject]@{
  docx = $resolvedDocx
  pdf = $pdfPath
  pages = $pages
} | ConvertTo-Json -Compress
