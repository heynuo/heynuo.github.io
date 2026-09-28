# validate-site.ps1
# Comprehensive validation of site integrity, internal links, assets, and metadata

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" | Select-Object -ExpandProperty Name
$errors = @()
$warnings = @()
$successCount = 0

Write-Output "--- Starting Full Site Validation across $($htmlFiles.Count) HTML files ---"

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    
    # 1. Check og:image banner
    if ($content -match 'property="og:image"\s+content="([^"]+)"') {
        $ogImg = $matches[1]
        if ($ogImg.StartsWith("https://heynuo.github.io/")) {
            $localImg = $ogImg.Replace("https://heynuo.github.io/", "").TrimStart("/")
            if (-not (Test-Path $localImg)) {
                $errors += "[$file] Broken og:image URL '$ogImg' -> local file '$localImg' not found!"
            }
        }
    }
    
    # 2. Check Shortcuts modal
    if (-not $content.Contains('id="shortcutsModal"')) {
        $errors += "[$file] Missing shortcutsModal markup!"
    }
    
    # 3. Check single key shortcut toggle
    if (-not $content.Contains('id="toggleSingleShortcuts"')) {
        $errors += "[$file] Missing toggleSingleShortcuts checkbox in shortcuts modal!"
    }
    
    # 4. Check footer links
    if (-not $content.Contains('privacy.html')) {
        $errors += "[$file] Missing privacy.html link in footer!"
    }
    if (-not $content.Contains('rss.xml')) {
        $errors += "[$file] Missing rss.xml link in footer!"
    }
    
    # 5. Check manifest & RSS link in head
    if (-not $content.Contains('rel="manifest"')) {
        $warnings += "[$file] Missing <link rel=`"manifest`"> in <head>."
    }
    if (-not $content.Contains('type="application/rss+xml"')) {
        $warnings += "[$file] Missing RSS alternate link in <head>."
    }
    
    # 6. Check internal HTML links
    $matches = [regex]::Matches($content, 'href="([^"#:]+\.html)"')
    foreach ($m in $matches) {
        $target = $m.Groups[1].Value
        if (-not (Test-Path $target)) {
            $errors += "[$file] Broken internal link href='$target'!"
        }
    }
    
    # 7. Check local icons and images
    $imgMatches = [regex]::Matches($content, 'src="([^"#:]+\.(?:png|jpg|jpeg|svg|webp))"')
    foreach ($m in $imgMatches) {
        $target = $m.Groups[1].Value
        if (-not (Test-Path $target)) {
            $errors += "[$file] Broken image src='$target'!"
        }
    }
    
    $successCount++
}

# Check Service Worker & Manifest & RSS files
if (-not (Test-Path "manifest.json")) { $errors += "manifest.json missing at root!" }
if (-not (Test-Path "sw.js")) { $errors += "sw.js missing at root!" }
if (-not (Test-Path "rss.xml")) { $errors += "rss.xml missing at root!" }
if (-not (Test-Path "sitemap.xml")) { $errors += "sitemap.xml missing at root!" }
if (-not (Test-Path "LICENSE")) { $errors += "LICENSE missing at root!" }

Write-Output "`nValidated $successCount files."
if ($warnings.Count -gt 0) {
    Write-Output "`n[WARNINGS] ($($warnings.Count)):"
    $warnings | ForEach-Object { Write-Output "  - $_" }
}

if ($errors.Count -eq 0) {
    Write-Output "`n[SUCCESS] All checks passed with 0 errors! All internal links, banners, footer links, shortcuts modals, and assets are 100% verified."
} else {
    Write-Output "`n[FAILED] Found $($errors.Count) errors:"
    $errors | ForEach-Object { Write-Output "  - $_" }
}
