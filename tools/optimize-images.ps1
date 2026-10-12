[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$SourceDirectory = 'assets\banners',
    [int]$Width = 800,
    [int]$Quality = 82,
    [string[]]$Exclude = @('og-banner.jpg')
)

# Generates downscaled JPEG variants (<name>-<width>.jpg) for the responsive
# srcset attributes in the HTML. Originals are never modified, so they remain
# available for Open Graph previews and full-width article heroes.

if (-not $Root) {
    $Root = if ($PSScriptRoot) { Join-Path $PSScriptRoot '..' } else { '.' }
}

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$directory = Join-Path $Root $SourceDirectory
if (-not [System.IO.Directory]::Exists($directory)) {
    Write-Error "Source directory '$directory' was not found."
    exit 2
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
if (-not $jpegCodec) {
    Write-Error 'No JPEG encoder is available on this system.'
    exit 2
}

$suffix = "-$Width"
$totalBefore = 0
$totalAfter = 0
$generated = 0
$skipped = 0

foreach ($file in Get-ChildItem -LiteralPath $directory -Filter '*.jpg' -File) {
    if ($file.BaseName.EndsWith($suffix) -or $Exclude -contains $file.Name) { continue }

    $outputPath = Join-Path $directory ($file.BaseName + $suffix + '.jpg')
    if ([System.IO.File]::Exists($outputPath) -and (Get-Item $outputPath).LastWriteTime -ge $file.LastWriteTime) {
        $skipped++
        continue
    }

    $image = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        if ($image.Width -le $Width) { $skipped++; continue }

        $height = [int][Math]::Round($image.Height * ($Width / $image.Width))
        $bitmap = New-Object System.Drawing.Bitmap($Width, $height)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.DrawImage($image, 0, 0, $Width, $height)
            } finally { $graphics.Dispose() }

            $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)
            $bitmap.Save($outputPath, $jpegCodec, $parameters)
        } finally { $bitmap.Dispose() }
    } finally { $image.Dispose() }

    $before = $file.Length
    $after = (Get-Item $outputPath).Length
    $totalBefore += $before
    $totalAfter += $after
    $generated++
    Write-Host ("  {0,-26} {1,7:N0} B -> {2,7:N0} B ({3:P0})" -f $outputPath, $before, $after, ($after / $before))
}

if ($generated -gt 0) {
    Write-Host ("Generated {0} variant(s) at {1}px: {2:N0} B -> {3:N0} B ({4:P0} of original)." -f $generated, $Width, $totalBefore, $totalAfter, ($totalAfter / $totalBefore)) -ForegroundColor Green
} else {
    Write-Host "No variants generated (nothing to do); $skipped already up to date." -ForegroundColor Yellow
}
exit 0
