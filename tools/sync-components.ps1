# sync-components.ps1
# Component stamping script (PRD R-02, R-31, R-32)
# Stamps canonical header (with SVG icons), footer, and shortcuts modal across all HTML files.
# Automatically applies active-state classes based on current file.

$headerTemplate = [System.IO.File]::ReadAllText("tools\components\header.html", [System.Text.Encoding]::UTF8)
$footerTemplate = [System.IO.File]::ReadAllText("tools\components\footer.html", [System.Text.Encoding]::UTF8)
$modalTemplate = [System.IO.File]::ReadAllText("tools\components\shortcuts-modal.html", [System.Text.Encoding]::UTF8)

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" | Select-Object -ExpandProperty Name
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    $pageKey = $file.Replace(".html", "")

    # Tailor header for current page active state
    $pageHeader = $headerTemplate
    if ($pageKey -eq "index") {
        $pageHeader = $pageHeader.Replace('data-nav="index">Home</a>', 'class="active" aria-current="page">Home</a>')
    } else {
        $pageHeader = $pageHeader.Replace("data-nav=`"$pageKey`">", "class=`"active`" aria-current=`"page`">")
    }

    # Tailor footer for current page active state
    $pageFooter = $footerTemplate
    if ($pageKey -eq "index") {
        $pageFooter = $pageFooter.Replace('data-nav="index">Home</a>', 'class="active" aria-current="page">Home</a>')
    } else {
        $pageFooter = $pageFooter.Replace("data-nav=`"$pageKey`">", "class=`"active`" aria-current=`"page`">")
    }

    # Replace <header>...</header> (singleline to match across newlines)
    $headerRegex = New-Object System.Text.RegularExpressions.Regex('<header\b[^>]*>.*?</header>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($headerRegex.IsMatch($content)) {
        $content = $headerRegex.Replace($content, $pageHeader.Trim(), 1)
    }

    # Replace <footer>...</footer> (singleline to match across newlines) or insert after </main>
    $footerRegex = New-Object System.Text.RegularExpressions.Regex('<footer\b[^>]*>.*?</footer>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($footerRegex.IsMatch($content)) {
        $content = $footerRegex.Replace($content, $pageFooter.Trim(), 1)
    } elseif ($content.Contains('</main>')) {
        $content = $content.Replace('</main>', "</main>`n`n" + $pageFooter.Trim())
    }

    # Canonicalize shortcuts modal cleanly (matches through any trailing divs up to script or toast)
    $modalRegex = New-Object System.Text.RegularExpressions.Regex('<!-- Keyboard Shortcuts Modal.*?(?=\s*(?:<div id="ruqyahToast"|<script))', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($modalRegex.IsMatch($content)) {
        $content = $modalRegex.Replace($content, $modalTemplate.Trim(), 1)
    } elseif (-not $content.Contains('id="shortcutsModal"')) {
        $content = $content.Replace('</body>', $modalTemplate + "`n</body>")
    }

    [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
    Write-Output "Synced components into $file"
}

Write-Output "`nSuccessfully synchronized all components across $($htmlFiles.Count) pages!"
