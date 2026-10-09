# check-css.ps1 - Validates CSS braces balance across all CSS files
$cssFiles = Get-ChildItem -Recurse -Path css -Filter *.css
$errorCount = 0

foreach ($file in $cssFiles) {
    $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Strip comments
    $stripped = [regex]::Replace($text, '/\*[\s\S]*?\*/', '')
    
    # Simple brace balance check
    $openBraces = [regex]::Matches($stripped, '\{').Count
    $closeBraces = [regex]::Matches($stripped, '\}').Count
    
    if ($openBraces -ne $closeBraces) {
        Write-Output "[$($file.Name)] MISMATCH: open=$openBraces, close=$closeBraces (diff=$($openBraces - $closeBraces))"
        $errorCount++
    }
}

if ($errorCount -eq 0) {
    Write-Output "All $($cssFiles.Count) CSS files have balanced braces."
} else {
    Write-Output "Found $errorCount files with unbalanced braces."
}
