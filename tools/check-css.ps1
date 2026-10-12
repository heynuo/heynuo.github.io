[CmdletBinding()]
param(
    [string]$CssRoot = (Join-Path $PSScriptRoot '..\css')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-CssBraceIssues {
    param(
        [Parameter(Mandatory)] [string]$Text,
        [Parameter(Mandatory)] [string]$FileName
    )

    $issues = [System.Collections.Generic.List[string]]::new()
    $openBraces = [System.Collections.Generic.List[object]]::new()
    $state = 'code'
    $quote = [char]0
    $line = 1
    $column = 1
    $index = 0

    while ($index -lt $Text.Length) {
        $char = $Text[$index]
        $next = if ($index + 1 -lt $Text.Length) { $Text[$index + 1] } else { [char]0 }

        if ($state -eq 'comment') {
            if ($char -eq '*' -and $next -eq '/') {
                $state = 'code'
                $index += 2
                $column += 2
                continue
            }
        } elseif ($state -eq 'single' -or $state -eq 'double') {
            if ($char -eq '\') {
                if ($index + 1 -lt $Text.Length) {
                    if ($next -eq "`n") { $line++; $column = 1 }
                    else { $column += 2 }
                    $index += 2
                    continue
                }
            } elseif ($char -eq $quote) {
                $state = 'code'
            }
        } else {
            if ($char -eq '/' -and $next -eq '*') {
                $state = 'comment'
                $index += 2
                $column += 2
                continue
            }
            if ($char -eq '"' -or $char -eq "'") {
                $quote = $char
                $state = if ($char -eq '"') { 'double' } else { 'single' }
            } elseif ($char -eq '{') {
                $openBraces.Add([PSCustomObject]@{ Line = $line; Column = $column })
            } elseif ($char -eq '}') {
                if ($openBraces.Count -eq 0) {
                    $issues.Add("$FileName`:$line`:$column unexpected closing brace '}'.")
                } else {
                    $openBraces.RemoveAt($openBraces.Count - 1)
                }
            }
        }

        if ($char -eq "`n") { $line++; $column = 1 }
        else { $column++ }
        $index++
    }

    if ($state -eq 'comment') {
        $issues.Add("$FileName`:$line`:$column unterminated comment.")
    } elseif ($state -eq 'single' -or $state -eq 'double') {
        $issues.Add("$FileName`:$line`:$column unterminated string.")
    }

    foreach ($brace in $openBraces) {
        $issues.Add("$FileName`:$($brace.Line):$($brace.Column) unmatched opening brace '{'.")
    }

    return $issues
}

try {
    $resolvedRoot = Resolve-Path -LiteralPath $CssRoot -ErrorAction Stop
    $cssRootPath = $resolvedRoot.ProviderPath
    $cssFiles = @(Get-ChildItem -LiteralPath $cssRootPath -Filter '*.css' -File -Recurse)

    if ($cssFiles.Count -eq 0) {
        Write-Error "No CSS files found under '$cssRootPath'."
        exit 2
    }

    $issues = [System.Collections.Generic.List[string]]::new()
    foreach ($file in $cssFiles) {
        $relativePath = $file.FullName.Substring($cssRootPath.Length).TrimStart([char[]]@('\', '/'))
        $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        foreach ($issue in (Get-CssBraceIssues -Text $text -FileName $relativePath)) {
            $issues.Add($issue)
        }
    }

    if ($issues.Count -gt 0) {
        Write-Host "CSS structure check failed with $($issues.Count) issue(s):" -ForegroundColor Red
        foreach ($issue in $issues) { Write-Host "  - $issue" -ForegroundColor Red }
        exit 1
    }

    Write-Host "CSS structure check passed for $($cssFiles.Count) file(s)." -ForegroundColor Green
    exit 0
} catch {
    Write-Error "CSS check failed: $($_.Exception.Message)"
    exit 2
}
