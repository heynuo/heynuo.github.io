[CmdletBinding()]
param(
    [string]$Root = ''
)

if (-not $Root) {
    $Root = if ($PSScriptRoot) { Join-Path $PSScriptRoot '..' } else { '.' }
}

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RelativePath {
    param([string]$BasePath, [string]$Path)
    return $Path.Substring($BasePath.Length).TrimStart([char[]]@('\', '/'))
}

function Get-LineNumber {
    param([string]$Text, [int]$Index)
    if ($Index -le 0) { return 1 }
    return 1 + [System.Text.RegularExpressions.Regex]::Matches($Text.Substring(0, $Index), "`n").Count
}

function Test-LocalReference {
    param(
        [Parameter(Mandatory)][string]$Reference,
        [Parameter(Mandatory)][string]$SourcePath,
        [Parameter(Mandatory)][string]$SiteRoot,
        [Parameter(Mandatory)][string]$Label,
        [Parameter(Mandatory)][AllowEmptyCollection()][System.Collections.Generic.List[string]]$Errors
    )

    $referenceText = [System.Net.WebUtility]::HtmlDecode($Reference.Trim())
    if ([string]::IsNullOrWhiteSpace($referenceText) -or $referenceText.StartsWith('#')) { return }
    if ($referenceText -match '^(?:data:|blob:|javascript:|mailto:|tel:|sms:|intent:)' -or $referenceText.StartsWith('//')) {
        return
    }

    $relativeReference = $referenceText
    if ($referenceText -match '^https?://') {
        $uri = $null
        if (-not [System.Uri]::TryCreate($referenceText, [System.UriKind]::Absolute, [ref]$uri)) { return }
        if ($uri.Host -notin @('heynuo.github.io', 'www.heynuo.github.io')) { return }
        $relativeReference = $uri.AbsolutePath
    } elseif ($referenceText -match '^[a-z][a-z0-9+.-]*:') {
        return
    }

    $relativeReference = ($relativeReference -split '[?#]', 2)[0]
    if ([string]::IsNullOrWhiteSpace($relativeReference)) { return }

    try {
        $decoded = [System.Uri]::UnescapeDataString($relativeReference).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        if ([System.IO.Path]::IsPathRooted($decoded)) {
            $targetPath = [System.IO.Path]::GetFullPath((Join-Path $SiteRoot $decoded.TrimStart([char[]]@('\', '/'))))
        } else {
            $sourceDirectory = [System.IO.Path]::GetDirectoryName($SourcePath)
            $targetPath = [System.IO.Path]::GetFullPath((Join-Path $sourceDirectory $decoded))
        }

        $rootPrefix = $SiteRoot.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar
        $insideRoot = $targetPath.Equals($SiteRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
            $targetPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
        if (-not $insideRoot) {
            $Errors.Add("[$(Get-RelativePath -BasePath $SiteRoot -Path $SourcePath)] $Label escapes the site root: '$Reference'.")
            return
        }

        if ([System.IO.Directory]::Exists($targetPath)) { $targetPath = Join-Path $targetPath 'index.html' }
        if (-not [System.IO.File]::Exists($targetPath)) {
            $Errors.Add("[$(Get-RelativePath -BasePath $SiteRoot -Path $SourcePath)] missing $Label '$Reference'.")
        }
    } catch {
        $Errors.Add("[$(Get-RelativePath -BasePath $SiteRoot -Path $SourcePath)] invalid $Label '$Reference': $($_.Exception.Message)")
    }
}

try {
    $siteRoot = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root -ErrorAction Stop).ProviderPath)
    $htmlFiles = @(Get-ChildItem -LiteralPath $siteRoot -Filter '*.html' -File)
    $cssRoot = Join-Path $siteRoot 'css'
    $cssFiles = if ([System.IO.Directory]::Exists($cssRoot)) { @(Get-ChildItem -LiteralPath $cssRoot -Filter '*.css' -File -Recurse) } else { @() }

    if ($htmlFiles.Count -eq 0) { throw "No HTML pages found in '$siteRoot'." }

    $errors = [System.Collections.Generic.List[string]]::new()
    $warnings = [System.Collections.Generic.List[string]]::new()
    $htmlReferenceRegex = [System.Text.RegularExpressions.Regex]::new(
        '\b(?:href|src|poster)\s*=\s*(?:"([^"]*)"|''([^'']*)'')',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
    $cssUrlRegex = [System.Text.RegularExpressions.Regex]::new(
        'url\(\s*(?:"([^"]+)"|''([^'']+)''|([^\)\s]+))\s*\)',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
    $cssImportRegex = [System.Text.RegularExpressions.Regex]::new(
        '@import\s+(?:"([^"]+)"|''([^'']+)''|url\(\s*["'']?([^"''\)]+)["'']?\s*\))',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
    # Tags and attributes, used to reject duplicated attributes such as two src=
    # on one <img>. Browsers silently keep only the first copy, so the rendered
    # page diverges from the markup and the document fails validation.
    $tagRegex = [System.Text.RegularExpressions.Regex]::new(
        '<[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*)?>',
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    $attributeRegex = [System.Text.RegularExpressions.Regex]::new(
        '\s+([^\s=/>]+)(?:\s*=\s*(?:"[^"]*"|''[^''>]*''|[^\s>]*))?',
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    # Blank comments and inline script/style so example markup inside them is
    # never scanned, while every character offset below stays valid.
    $maskPatterns = @('(?s)<!--.*?-->', '(?is)<script\b[^>]*>.*?</script\s*>', '(?is)<style\b[^>]*>.*?</style\s*>')

    foreach ($file in $htmlFiles) {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $relativeFile = Get-RelativePath -BasePath $siteRoot -Path $file.FullName

        if ($content -notmatch '<title\b[^>]*>\s*[^<]+</title>') { $warnings.Add("[$relativeFile] missing or empty document title.") }
        if ($content -notmatch '<meta\s+[^>]*property="og:image"') { $warnings.Add("[$relativeFile] missing Open Graph image metadata.") }
        if ($content -notmatch 'rel="manifest"') { $warnings.Add("[$relativeFile] missing web app manifest link.") }
        if ($content -notmatch 'type="application/rss\+xml"') { $warnings.Add("[$relativeFile] missing RSS alternate link in <head>.") }
        if ($content -notmatch 'id="shortcutsModal"') { $errors.Add("[$relativeFile] missing shortcuts modal markup.") }
        if ($content -notmatch 'id="toggleSingleShortcuts"') { $errors.Add("[$relativeFile] missing single-key shortcut toggle.") }

        $footerMatch = [System.Text.RegularExpressions.Regex]::Match($content, '<footer\b[^>]*>.*?</footer>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if (-not $footerMatch.Success) {
            $errors.Add("[$relativeFile] missing footer element.")
        } else {
            if ($footerMatch.Value -notmatch 'href="privacy\.html"') { $errors.Add("[$relativeFile] footer is missing the privacy link.") }
            if ($footerMatch.Value -notmatch 'href="rss\.xml"') { $errors.Add("[$relativeFile] footer is missing the RSS link.") }
        }

        $maskedContent = $content
        foreach ($maskPattern in $maskPatterns) {
            $maskedContent = [System.Text.RegularExpressions.Regex]::Replace($maskedContent, $maskPattern, {
                param($maskMatch)
                return New-Object string(' ', $maskMatch.Value.Length)
            })
        }
        foreach ($tagMatch in $tagRegex.Matches($maskedContent)) {
            $seenAttributes = @{}
            foreach ($attributeMatch in $attributeRegex.Matches($tagMatch.Value)) {
                $attributeName = $attributeMatch.Groups[1].Value.ToLowerInvariant()
                if ($seenAttributes.ContainsKey($attributeName)) {
                    $lineNumber = Get-LineNumber -Text $content -Index $tagMatch.Index
                    $errors.Add("[$relativeFile] duplicate attribute '$attributeName' on line $lineNumber.")
                    break
                }
                $seenAttributes[$attributeName] = $true
            }
        }

        foreach ($match in $htmlReferenceRegex.Matches($content)) {
            $reference = if ($match.Groups[1].Success) { $match.Groups[1].Value } else { $match.Groups[2].Value }
            if ([string]::IsNullOrWhiteSpace($reference)) { continue }
            $label = if ($match.Value -match '\bsrc\s*=') { 'asset reference' } elseif ($match.Value -match '\bposter\s*=') { 'poster reference' } else { 'link' }
            Test-LocalReference -Reference $reference -SourcePath $file.FullName -SiteRoot $siteRoot -Label $label -Errors $errors
        }
    }

    foreach ($file in $cssFiles) {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        foreach ($regex in @($cssUrlRegex, $cssImportRegex)) {
            foreach ($match in $regex.Matches($content)) {
                $reference = $null
                foreach ($groupIndex in 1..3) {
                    if ($match.Groups[$groupIndex].Success) { $reference = $match.Groups[$groupIndex].Value; break }
                }
                if ([string]::IsNullOrWhiteSpace($reference)) { continue }
                Test-LocalReference -Reference $reference -SourcePath $file.FullName -SiteRoot $siteRoot -Label 'CSS asset reference' -Errors $errors
            }
        }
    }

    foreach ($requiredFile in @('manifest.json', 'sw.js', 'rss.xml', 'sitemap.xml', 'LICENSE')) {
        if (-not [System.IO.File]::Exists((Join-Path $siteRoot $requiredFile))) {
            $errors.Add("Missing required root file '$requiredFile'.")
        }
    }

    $manifestPath = Join-Path $siteRoot 'manifest.json'
    if ([System.IO.File]::Exists($manifestPath)) {
        try { $null = ConvertFrom-Json -InputObject ([System.IO.File]::ReadAllText($manifestPath, [System.Text.Encoding]::UTF8)) }
        catch { $errors.Add("[manifest.json] invalid JSON: $($_.Exception.Message)") }
    }

    foreach ($xmlName in @('rss.xml', 'sitemap.xml')) {
        $xmlPath = Join-Path $siteRoot $xmlName
        if ([System.IO.File]::Exists($xmlPath)) {
            try { $null = [xml][System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8) }
            catch { $errors.Add("[$xmlName] invalid XML: $($_.Exception.Message)") }
        }
    }

    Write-Host "Validated $($htmlFiles.Count) HTML page(s) and $($cssFiles.Count) CSS file(s) under '$siteRoot'."
    if ($warnings.Count -gt 0) {
        Write-Host "Warnings ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) { Write-Host "  - $warning" -ForegroundColor Yellow }
    }
    if ($errors.Count -gt 0) {
        Write-Host "Validation failed with $($errors.Count) error(s):" -ForegroundColor Red
        foreach ($errorMessage in $errors) { Write-Host "  - $errorMessage" -ForegroundColor Red }
        exit 1
    }

    Write-Host 'Validation passed.' -ForegroundColor Green
    exit 0
} catch {
    Write-Error "Site validation could not complete: $($_.Exception.Message)"
    exit 2
}
