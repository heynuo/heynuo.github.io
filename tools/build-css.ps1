[CmdletBinding()]
param(
    [string]$CssRoot = '',
    [string]$Entry = 'style.css',
    [string]$OutputName = 'heynuo.css',
    [switch]$NoMinify
)

if (-not $CssRoot) {
    $CssRoot = if ($PSScriptRoot) { Join-Path $PSScriptRoot '..\css' } else { 'css' }
}

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-CssFile {
    param([Parameter(Mandatory)][string]$Path)
    $text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    # Normalise line endings and drop any byte-order mark so concatenation stays clean.
    $text = $text.Replace("`r`n", "`n").Replace("`r", "`n")
    return $text.TrimStart([char]0xFEFF)
}

function Expand-CssImports {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][string]$BaseDir
    )

    # Matches: @import url("x"); @import url('x'); @import url(x); @import "x"; @import 'x';
    $importPattern = [System.Text.RegularExpressions.Regex]::new(
        '@import\s+(?:url\(\s*(?:"([^"]+)"|''([^'']+)''|([^)"'']+))\s*\)|"([^"]+)"|''([^'']+)'')\s*;',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    $result = $importPattern.Replace($Text, {
        param($match)
        $reference = $null
        foreach ($groupIndex in 1..5) {
            if ($match.Groups[$groupIndex].Success) { $reference = $match.Groups[$groupIndex].Value.Trim(); break }
        }
        if ([string]::IsNullOrWhiteSpace($reference)) { return $match.Value }
        if ($reference -match '^(?:data:|https?:|//)') { return $match.Value }

        $decoded = [System.Uri]::UnescapeDataString(($reference -split '[?#]', 2)[0]).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $importPath = [System.IO.Path]::GetFullPath((Join-Path $BaseDir $decoded))
        if (-not [System.IO.File]::Exists($importPath)) {
            throw "Unable to resolve CSS import '$reference' from '$BaseDir'."
        }

        $nested = [System.IO.File]::ReadAllText($importPath, [System.Text.Encoding]::UTF8)
        $nested = $nested.Replace("`r`n", "`n").Replace("`r", "`n").TrimStart([char]0xFEFF)
        # Recurse so nested @import statements also resolve.
        return (Expand-CssImports -Text $nested -BaseDir ([System.IO.Path]::GetDirectoryName($importPath)))
    })

    return $result
}

function Compress-Css {
    param([Parameter(Mandatory)][string]$Text)

    $sb = [System.Text.StringBuilder]::new($Text.Length)
    $length = $Text.Length
    $index = 0
    $pendingWhitespace = $false
    $punctuation = [char[]]@('{', '}', ';', ',')

    while ($index -lt $length) {
        $char = $Text[$index]

        # Comments: drop them (keeping /*! ... */ "important" banners).
        if ($char -eq '/' -and ($index + 1) -lt $length -and $Text[$index + 1] -eq '*') {
            $end = $Text.IndexOf('*/', $index + 2)
            if (($index + 2) -lt $length -and $Text[$index + 2] -eq '!') {
                if ($end -lt 0) { [void]$sb.Append($Text.Substring($index)); $index = $length; continue }
                [void]$sb.Append($Text.Substring($index, $end + 2 - $index))
                $index = $end + 2
            } else {
                $index = if ($end -lt 0) { $length } else { $end + 2 }
            }
            $pendingWhitespace = $true
            continue
        }

        # Strings: emit verbatim so commas, braces and escapes survive untouched.
        if ($char -eq '"' -or $char -eq "'") {
            if ($pendingWhitespace) {
                if ($sb.Length -gt 0 -and -not $punctuation.Contains($sb[$sb.Length - 1])) { [void]$sb.Append(' ') }
                $pendingWhitespace = $false
            }
            $quote = $char
            [void]$sb.Append($char)
            $index++
            while ($index -lt $length) {
                $inner = $Text[$index]
                [void]$sb.Append($inner)
                if ($inner -eq '\') {
                    if (($index + 1) -lt $length) { [void]$sb.Append($Text[$index + 1]); $index += 2; continue }
                } elseif ($inner -eq $quote) {
                    $index++
                    break
                }
                $index++
            }
            continue
        }

        if ([char]::IsWhiteSpace($char)) {
            $pendingWhitespace = $true
            $index++
            continue
        }

        if ($pendingWhitespace) {
            $lastEmitted = if ($sb.Length -gt 0) { $sb[$sb.Length - 1] } else { [char]0 }
            $dropSpace = $punctuation.Contains($char) -or $punctuation.Contains($lastEmitted) -or $sb.Length -eq 0
            if (-not $dropSpace) { [void]$sb.Append(' ') }
            $pendingWhitespace = $false
        }

        [void]$sb.Append($char)
        $index++
    }

    return $sb.ToString().Trim()
}

try {
    $resolvedRoot = (Resolve-Path -LiteralPath $CssRoot -ErrorAction Stop).ProviderPath
    $entryPath = Join-Path $resolvedRoot $Entry
    if (-not [System.IO.File]::Exists($entryPath)) {
        throw "Entry stylesheet '$entryPath' was not found."
    }

    $entryDirectory = [System.IO.Path]::GetDirectoryName($entryPath)
    $expanded = Expand-CssImports -Text (Read-CssFile -Path $entryPath) -BaseDir $entryDirectory

    # Count how many partial files feed the bundle so we can report it.
    $partialRoot = Join-Path $resolvedRoot 'partials'
    $partialCount = if ([System.IO.Directory]::Exists($partialRoot)) {
        @(Get-ChildItem -LiteralPath $partialRoot -Filter '*.css' -File -Recurse).Count
    } else { 0 }

    $banner = "/*! HeyNuo bundle - generated by tools/build-css.ps1 from css/$Entry ($partialCount partial(s)). Do not edit directly. */`n"
    $final = if ($NoMinify) { $banner + $expanded } else { $banner + (Compress-Css -Text $expanded) }

    $outputPath = Join-Path $resolvedRoot $OutputName
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($outputPath, $final, $utf8NoBom)

    $rawBytes = (Get-Item -LiteralPath $outputPath).Length
    Write-Host ("Bundled {0} stylesheet(s) into '{1}' ({2:N0} bytes{3})." -f ($partialCount + 1), $OutputName, $rawBytes, $(if ($NoMinify) { ', minify skipped' } else { '' })) -ForegroundColor Green
    exit 0
} catch {
    Write-Error "CSS bundling failed: $($_.Exception.Message)"
    exit 2
}
