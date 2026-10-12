[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [string]$Root = (Join-Path $PSScriptRoot '..')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-Utf8Text {
    param([Parameter(Mandatory)][string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Utf8TextAtomically {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][bool]$HasBom
    )

    $temporaryPath = "$Path.$([guid]::NewGuid().ToString('N')).tmp"
    $encoding = [System.Text.UTF8Encoding]::new($HasBom)
    try {
        [System.IO.File]::WriteAllText($temporaryPath, $Text, $encoding)
        Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
    } finally {
        if ([System.IO.File]::Exists($temporaryPath)) {
            Remove-Item -LiteralPath $temporaryPath -Force
        }
    }
}

function Replace-OneRegion {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][string]$Pattern,
        [Parameter(Mandatory)][string]$Replacement,
        [Parameter(Mandatory)][string]$Label,
        [switch]$AllowMissing
    )

    $regex = [System.Text.RegularExpressions.Regex]::new(
        $Pattern,
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    $matches = $regex.Matches($Text)
    if ($matches.Count -eq 0 -and $AllowMissing) { return $Text }
    if ($matches.Count -ne 1) {
        throw "Expected one $Label region, found $($matches.Count)."
    }

    return $regex.Replace($Text, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $Replacement }, 1)
}

function Set-PageActiveLink {
    param([Parameter(Mandatory)][string]$Template, [Parameter(Mandatory)][string]$PageKey)

    if ($PageKey -eq 'index') {
        return $Template.Replace('data-nav="index">Home</a>', 'class="active" aria-current="page">Home</a>')
    }

    $marker = 'data-nav="' + $PageKey + '">'
    return $Template.Replace($marker, 'class="active" aria-current="page">')
}

try {
    $rootPath = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root -ErrorAction Stop).ProviderPath)
    $componentPath = Join-Path $rootPath 'tools/components'
    $headerPath = Join-Path $componentPath 'header.html'
    $footerPath = Join-Path $componentPath 'footer.html'
    $modalPath = Join-Path $componentPath 'shortcuts-modal.html'

    foreach ($requiredPath in @($headerPath, $footerPath, $modalPath)) {
        if (-not [System.IO.File]::Exists($requiredPath)) { throw "Required component template is missing: $requiredPath" }
    }

    $headerTemplate = (Read-Utf8Text -Path $headerPath).Trim()
    $footerTemplate = (Read-Utf8Text -Path $footerPath).Trim()
    $modalTemplate = (Read-Utf8Text -Path $modalPath).Trim()
    $htmlFiles = @(Get-ChildItem -LiteralPath $rootPath -Filter '*.html' -File)
    if ($htmlFiles.Count -eq 0) { throw "No HTML pages found in '$rootPath'." }

    $headerRegex = '<header\b[^>]*>.*?</header>'
    $footerRegex = '<footer\b[^>]*>.*?</footer>'
    $modalRegex = '<!-- Keyboard Shortcuts Modal.*?(?=\s*(?:<div id="ruqyahToast"|<script))'
    $writtenCount = 0
    $unchangedCount = 0

    foreach ($file in $htmlFiles) {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
        $offset = if ($hasBom) { 3 } else { 0 }
        $content = [System.Text.Encoding]::UTF8.GetString($bytes, $offset, $bytes.Length - $offset)
        $pageKey = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $pageHeader = Set-PageActiveLink -Template $headerTemplate -PageKey $pageKey
        $pageFooter = Set-PageActiveLink -Template $footerTemplate -PageKey $pageKey

        $content = Replace-OneRegion -Text $content -Pattern $headerRegex -Replacement $pageHeader -Label 'header' -AllowMissing
        if ($content -notmatch '<header\b') {
            throw "[$($file.Name)] No header found to synchronize."
        }

        if ($content -match '<footer\b') {
            $content = Replace-OneRegion -Text $content -Pattern $footerRegex -Replacement $pageFooter -Label 'footer'
        } elseif ($content.Contains('</main>')) {
            $content = $content.Replace('</main>', "</main>`r`n`r`n$pageFooter")
        } else {
            throw "[$($file.Name)] No footer or </main> insertion point found."
        }

        if ($content -match '<!-- Keyboard Shortcuts Modal') {
            $content = Replace-OneRegion -Text $content -Pattern $modalRegex -Replacement $modalTemplate -Label 'shortcuts modal'
        } elseif (-not $content.Contains('id="shortcutsModal"')) {
            if ($content -notmatch '</body>') { throw "[$($file.Name)] No </body> insertion point for shortcuts modal." }
            $content = [System.Text.RegularExpressions.Regex]::Replace(
                $content,
                '</body>',
                [System.Text.RegularExpressions.MatchEvaluator]{ param($match) "$modalTemplate`r`n</body>" },
                [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
            )
        }

        $originalContent = [System.Text.Encoding]::UTF8.GetString($bytes, $offset, $bytes.Length - $offset)
        if ($content -ceq $originalContent) {
            $unchangedCount++
            continue
        }

        if ($PSCmdlet.ShouldProcess($file.FullName, 'Synchronize header, footer, and shortcuts modal')) {
            Write-Utf8TextAtomically -Path $file.FullName -Text $content -HasBom $hasBom
            $writtenCount++
            Write-Host "Updated $($file.Name)" -ForegroundColor Green
        }
    }

    Write-Host "Component sync complete: $writtenCount updated, $unchangedCount already current, $($htmlFiles.Count) page(s) scanned." -ForegroundColor Cyan
} catch {
    Write-Error "Component sync failed: $($_.Exception.Message)"
    exit 1
}
