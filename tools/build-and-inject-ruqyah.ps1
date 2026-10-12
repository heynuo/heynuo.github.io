[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [string]$Root = (Join-Path $PSScriptRoot '..'),
    [string]$DataFile = 'js/data/ruqyah-data.js',
    [string]$HtmlFile = 'ruqyah.html'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Escape-Html {
    param([AllowNull()][object]$Value)
    if ($null -eq $Value) { return '' }
    return [System.Net.WebUtility]::HtmlEncode([string]$Value)
}

function Get-RuqyahArrayJson {
    param([Parameter(Mandatory)][string]$Source)

    $assignment = [regex]::Match($Source, '(?m)^\s*const\s+RUQYAH_VERSES\s*=\s*\[')
    if (-not $assignment.Success) { throw 'Could not find the RUQYAH_VERSES array declaration in the data file.' }

    $start = $assignment.Index + $assignment.Length - 1
    $depth = 0
    $inString = $false
    $escaped = $false
    for ($index = $start; $index -lt $Source.Length; $index++) {
        $char = $Source[$index]
        if ($inString) {
            if ($escaped) { $escaped = $false; continue }
            if ($char -eq '\') { $escaped = $true; continue }
            if ($char -eq '"') { $inString = $false }
            continue
        }

        if ($char -eq '"') { $inString = $true; continue }
        if ($char -eq '[') { $depth++ }
        elseif ($char -eq ']') {
            $depth--
            if ($depth -eq 0) { return $Source.Substring($start, $index - $start + 1) }
        }
    }

    throw 'The RUQYAH_VERSES JSON array is unterminated.'
}

function Replace-OnePattern {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][string]$Pattern,
        [Parameter(Mandatory)][string]$Replacement,
        [Parameter(Mandatory)][string]$Description,
        [System.Text.RegularExpressions.RegexOptions]$Options = [System.Text.RegularExpressions.RegexOptions]::Singleline
    )

    $regex = [regex]::new($Pattern, $Options)
    $matches = $regex.Matches($Text)
    if ($matches.Count -ne 1) { throw "Expected one $Description match, found $($matches.Count)." }
    $evaluator = [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $Replacement }.GetNewClosure()
    return $regex.Replace($Text, $evaluator, 1)
}

function Replace-ElementById {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][string]$TagName,
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Replacement
    )

    $escapedId = [regex]::Escape($Id)
    $openingPattern = '<' + $TagName + '\b(?=[^>]*\bid=["'']' + $escapedId + '["''])[^>]*>'
    $openingRegex = [regex]::new($openingPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $openings = $openingRegex.Matches($Text)
    if ($openings.Count -ne 1) { throw "Expected one <$TagName id='$Id'> element, found $($openings.Count)." }

    $opening = $openings[0]
    $tokenRegex = [regex]::new('</?' + $TagName + '\b[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $depth = 1
    $endIndex = -1
    foreach ($token in $tokenRegex.Matches($Text, $opening.Index + $opening.Length)) {
        if ($token.Value -match '^</') { $depth-- }
        elseif ($token.Value -notmatch '/\s*>$') { $depth++ }
        if ($depth -eq 0) { $endIndex = $token.Index + $token.Length; break }
    }
    if ($endIndex -lt 0) { throw "Could not find the matching closing </$TagName> for id '$Id'." }

    return $Text.Substring(0, $opening.Index) + $Replacement + $Text.Substring($endIndex)
}

function Write-Utf8TextAtomically {
    param([string]$Path, [string]$Text, [bool]$HasBom)
    $temporaryPath = "$Path.$([guid]::NewGuid().ToString('N')).tmp"
    try {
        [System.IO.File]::WriteAllText($temporaryPath, $Text, [System.Text.UTF8Encoding]::new($HasBom))
        Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
    } finally {
        if ([System.IO.File]::Exists($temporaryPath)) { Remove-Item -LiteralPath $temporaryPath -Force }
    }
}

$rootPath = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root -ErrorAction Stop).ProviderPath)
$dataPath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $DataFile))
$htmlPath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $HtmlFile))
$footerPath = Join-Path $rootPath 'tools/components/footer.html'
$modalPath = Join-Path $rootPath 'tools/components/shortcuts-modal.html'
foreach ($requiredPath in @($dataPath, $htmlPath, $footerPath, $modalPath)) {
    if (-not [System.IO.File]::Exists($requiredPath)) { throw "Required build input is missing: $requiredPath" }
}

$dataSource = [System.IO.File]::ReadAllText($dataPath, [System.Text.Encoding]::UTF8)
$jsonText = Get-RuqyahArrayJson -Source $dataSource
$verses = ConvertFrom-Json -InputObject $jsonText
if ($null -eq $verses -or $verses.Count -eq 0) { throw 'The Ruqyah dataset is empty.' }

$seenIds = @{}
$categoryOrder = [System.Collections.Generic.List[string]]::new()
$categoryCounts = [ordered]@{}
$requiredTextFields = @('reference', 'category', 'source', 'purpose', 'arabic', 'transliteration', 'translation', 'alislamAppUrl')
foreach ($item in $verses) {
    if ($null -eq $item.id -or [string]::IsNullOrWhiteSpace([string]$item.id)) { throw 'Every Ruqyah record must have an id.' }
    $idKey = [string]$item.id
    if ($seenIds.ContainsKey($idKey)) { throw "Duplicate Ruqyah record id '$idKey'." }
    $seenIds[$idKey] = $true

    foreach ($field in $requiredTextFields) {
        $property = $item.PSObject.Properties[$field]
        if ($null -eq $property -or [string]::IsNullOrWhiteSpace([string]$property.Value)) {
            throw "Ruqyah record '$idKey' is missing required field '$field'."
        }
    }
    if ($null -eq $item.audioVerses -or $item.audioVerses.Count -eq 0) { throw "Ruqyah record '$idKey' needs an audio verse." }
    if ([string]$item.alislamAppUrl -notmatch '^https://') { throw "Ruqyah record '$idKey' has a non-HTTPS Al-Islam URL." }

    $category = [string]$item.category
    if (-not $categoryCounts.Contains($category)) {
        $categoryCounts[$category] = 0
        $categoryOrder.Add($category)
    }
    $categoryCounts[$category]++
}

$totalVerseCount = $verses.Count
$categoryCount = $categoryOrder.Count
$cardsBuilder = [System.Text.StringBuilder]::new()
foreach ($item in $verses) {
    $id = $item.id
    $ref = Escape-Html $item.reference
    $cat = Escape-Html $item.category
    $src = Escape-Html $item.source
    $purp = Escape-Html $item.purpose
    $arab = Escape-Html $item.arabic
    $translit = Escape-Html $item.transliteration
    $transl = Escape-Html $item.translation
    $url = Escape-Html $item.alislamAppUrl
    $isMulti = $item.audioVerses.Count -gt 1
    $vCount = $item.audioVerses.Count
    $note = ""
    if ($item.isFullSurahNote) {
        $noteEsc = Escape-Html $item.isFullSurahNote
        $note = @"
          <div class="surah-note-alert">
            &#128161; <strong>Note:</strong> $noteEsc
          </div>
"@
    }

    $multiControls = ""
    if ($isMulti) {
        $multiControls = @"
            <div class="multiverse-controls">
              <button type="button" class="multiverse-btn prev-ayah-btn" data-action="prev-ayah" data-id="$id" disabled>&larr; Prev Ayah</button>
              <span>$vCount Verses in Passage</span>
              <button type="button" class="multiverse-btn next-ayah-btn" data-action="next-ayah" data-id="$id">Next Ayah &rarr;</button>
            </div>
"@
    }

    $trackTitle = if ($isMulti) { "Recite $vCount Ayahs" } else { "Recite Ayah" }

    $card = @"
        <article class="ruqyah-card" data-id="$id">
          <header class="card-header-row">
            <div class="card-tags">
              <span class="card-category-pill">$cat</span>
              <span class="card-source-pill">&#128220; $src</span>
            </div>
            <div class="card-header-actions">
              <button type="button" class="card-icon-btn favorite-btn" data-action="favorite" data-id="$id" title="Add to favorites" aria-label="Favorite">
                &#9734; Save
              </button>
              <div class="copy-menu-wrapper">
                <button type="button" class="card-icon-btn copy-menu-trigger" data-action="copy-menu" data-id="$id" title="Copy verse options">
                  &#128203; Copy
                </button>
                <div class="copy-dropdown" id="copyDropdown-$id">
                  <button type="button" class="copy-item" data-copy-type="all" data-id="$id">&#128203; Copy Full Card</button>
                  <button type="button" class="copy-item" data-copy-type="arabic" data-id="$id">&#127769; Copy Arabic Text</button>
                  <button type="button" class="copy-item" data-copy-type="translit" data-id="$id">&#128292; Copy Transliteration</button>
                  <button type="button" class="copy-item" data-copy-type="translation" data-id="$id">&#128214; Copy English Meaning</button>
                </div>
              </div>
            </div>
          </header>

          <div class="card-title-group">
            <h3 class="card-reference">$ref</h3>
          </div>

          <div class="card-purpose-callout">
            <strong>Spiritual Purpose:</strong> $purp
          </div>

          <!-- Arabic Text Box -->
          <div class="arabic-box">
            <div class="arabic-text" dir="rtl" lang="ar">$arab</div>
          </div>

          <!-- English Transliteration -->
          <div class="translit-box">
            <span class="translit-label">Transliteration (Pronunciation)</span>
            <div class="translit-text">$translit</div>
          </div>

          <!-- English Translation -->
          <div class="trans-box">
            <span class="trans-label">English Meaning</span>
            <div class="trans-text">$transl</div>
          </div>
$note
          <!-- Verse Audio Player Component -->
          <div class="card-audio-player">
            <div class="player-main-row">
              <div class="player-left-group">
                <button type="button" class="play-toggle-btn" data-action="play" data-id="$id" aria-label="Play recitation of $ref">
                  &#9654;
                </button>
                <div class="player-track-info">
                  <div class="player-track-title">$trackTitle</div>
                  <span class="player-source-note">Al-Islam Quran Stream (Qari Muhammad Ashiq)</span>
                </div>
              </div>
              <div class="player-right-group">
                <a href="$url" target="_blank" rel="noopener noreferrer" class="alislam-app-link" title="Open in official Al-Islam Quran app">
                  <span>Al-Islam App</span> &#8599;
                </a>
              </div>
            </div>

            <div class="player-timeline-row">
              <div class="audio-progress-bar" data-action="seek" data-id="$id">
                <div class="audio-progress-fill"></div>
              </div>
              <span class="player-time-display">0:00</span>
            </div>
$multiControls
          </div>
        </article>

"@
    [void]$cardsBuilder.Append($card)
}

$cardsHtml = $cardsBuilder.ToString()

# Load the target page and keep its original UTF-8 BOM choice when writing.
$ruqyahBytes = [System.IO.File]::ReadAllBytes($htmlPath)
$hasBom = $ruqyahBytes.Length -ge 3 -and $ruqyahBytes[0] -eq 0xEF -and $ruqyahBytes[1] -eq 0xBB -and $ruqyahBytes[2] -eq 0xBF
$textOffset = if ($hasBom) { 3 } else { 0 }
$ruqyahHtml = [System.Text.Encoding]::UTF8.GetString($ruqyahBytes, $textOffset, $ruqyahBytes.Length - $textOffset)
$originalHtml = $ruqyahHtml

$statsPre = @"
      <div class="ruqyah-stats-dashboard" id="ruqyahStats" aria-label="Ruqyah statistics">
        <div class="ruqyah-stat-chip">&#128214; <strong>$totalVerseCount</strong> Ruqyah Verses</div>
        <div class="ruqyah-stat-chip">&#127991;&#65039; <strong>$categoryCount</strong> Categories</div>
        <div class="ruqyah-stat-chip">&#11088; <strong id="statFavCount">0</strong> Favorites</div>
        <div class="ruqyah-stat-chip">&#127897;&#65039; <strong id="statReciterName">Qari Muhammad Ashiq</strong></div>
      </div>
"@
$ruqyahHtml = Replace-ElementById -Text $ruqyahHtml -TagName 'div' -Id 'ruqyahStats' -Replacement $statsPre.Trim()

$filtersBuilder = [System.Text.StringBuilder]::new()
[void]$filtersBuilder.AppendLine('      <div class="ruqyah-filter-strip" id="ruqyahFilters" aria-label="Ruqyah categories">')
$allFilter = '        <button type="button" class="ruqyah-filter-pill active" data-category="all" aria-pressed="true"><span>&#10024; All</span> <span class="filter-count-badge">' + $totalVerseCount + '</span></button>'
[void]$filtersBuilder.AppendLine($allFilter)
foreach ($category in $categoryOrder) {
    $categoryHtml = Escape-Html $category
    $count = $categoryCounts[$category]
    $categoryFilter = '        <button type="button" class="ruqyah-filter-pill" data-category="' + $categoryHtml + '" aria-pressed="false"><span>' + $categoryHtml + '</span> <span class="filter-count-badge">' + $count + '</span></button>'
    [void]$filtersBuilder.AppendLine($categoryFilter)
}
[void]$filtersBuilder.AppendLine('        <button type="button" class="ruqyah-filter-pill" data-category="favorites" aria-pressed="false"><span>&#11088; Favorites</span> <span class="filter-count-badge">0</span></button>')
[void]$filtersBuilder.AppendLine('      </div>')
$filtersPre = $filtersBuilder.ToString().TrimEnd()
$ruqyahHtml = Replace-ElementById -Text $ruqyahHtml -TagName 'div' -Id 'ruqyahFilters' -Replacement $filtersPre

$resultStats = '<span id="resultStats" aria-live="polite" aria-atomic="true">Showing all <strong>' + $totalVerseCount + '</strong> Ruqyah verses</span>'
$ruqyahHtml = Replace-OnePattern -Text $ruqyahHtml -Pattern '<span\b(?=[^>]*\bid="resultStats")[^>]*>.*?</span>' -Replacement $resultStats -Description 'result count'
$audioNote = '<span class="audio-stream-note">Audio streams from Al-Islam Quran Cloud, with EveryAyah as a fallback.</span>'
$ruqyahHtml = Replace-OnePattern -Text $ruqyahHtml -Pattern '<span\b(?=[^>]*\bclass="audio-stream-note")[^>]*>.*?</span>' -Replacement $audioNote -Description 'audio stream note'

# Replace only the matching section; nested card markup remains intact.
$newGrid = @"
    <!-- Verse Cards Container (Pre-rendered for complete No-JS Resilience and Instant SEO) -->
    <section id="ruqyahGrid" class="ruqyah-grid" aria-live="polite" aria-label="Ruqyah verse cards">
$cardsHtml
    </section>
"@
$ruqyahHtml = Replace-ElementById -Text $ruqyahHtml -TagName 'section' -Id 'ruqyahGrid' -Replacement $newGrid.Trim()

# Synchronize the canonical footer and modal without regex replacement expansion.
$footerTemplate = [System.IO.File]::ReadAllText($footerPath, [System.Text.Encoding]::UTF8).Trim()
$ruqyahFooter = $footerTemplate.Replace('data-nav="ruqyah">', 'class="active" aria-current="page">')
$ruqyahHtml = Replace-OnePattern -Text $ruqyahHtml -Pattern '<footer\b[^>]*>.*?</footer>' -Replacement $ruqyahFooter -Description 'footer'

$modalTemplate = [System.IO.File]::ReadAllText($modalPath, [System.Text.Encoding]::UTF8).Trim()
$modalPattern = '<!-- Keyboard Shortcuts Modal.*?(?=\s*(?:<div id="ruqyahToast"|<script))'
$modalRegex = [regex]::new($modalPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($modalRegex.Matches($ruqyahHtml).Count -eq 1) {
    $ruqyahHtml = Replace-OnePattern -Text $ruqyahHtml -Pattern $modalPattern -Replacement $modalTemplate -Description 'shortcuts modal'
} elseif (-not $ruqyahHtml.Contains('id="shortcutsModal"')) {
    $bodyClose = [regex]::Match($ruqyahHtml, '</body>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if (-not $bodyClose.Success -or [regex]::Matches($ruqyahHtml, '</body>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Count -ne 1) {
        throw 'Could not find exactly one </body> insertion point for the shortcuts modal.'
    }
    $ruqyahHtml = $ruqyahHtml.Insert($bodyClose.Index, $modalTemplate + [Environment]::NewLine)
} else {
    Write-Warning 'Shortcuts modal exists without its canonical marker; left its markup untouched.'
}

# Ensure manifest and RSS in head
if (-not $ruqyahHtml.Contains('rel="manifest"')) {
    $headAdditions = @"
  <link rel="manifest" href="manifest.json">
  <link rel="alternate" type="application/rss+xml" title="HeyNuo RSS Feed" href="https://heynuo.github.io/rss.xml">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
"@
    $ruqyahHtml = $ruqyahHtml.Replace('<!-- Google Fonts Preconnect & Stylesheets -->', $headAdditions + "`n`n  <!-- Google Fonts Preconnect & Stylesheets -->")
}

$missingHeadItems = [System.Text.StringBuilder]::new()
if ($ruqyahHtml -notmatch 'rel="manifest"') { [void]$missingHeadItems.AppendLine('  <link rel="manifest" href="manifest.json">') }
if ($ruqyahHtml -notmatch 'type="application/rss\+xml"') { [void]$missingHeadItems.AppendLine('  <link rel="alternate" type="application/rss+xml" title="HeyNuo RSS Feed" href="https://heynuo.github.io/rss.xml">') }
if ($ruqyahHtml -notmatch 'property="og:image:width"') { [void]$missingHeadItems.AppendLine('  <meta property="og:image:width" content="1200">') }
if ($ruqyahHtml -notmatch 'property="og:image:height"') { [void]$missingHeadItems.AppendLine('  <meta property="og:image:height" content="630">') }
if ($missingHeadItems.Length -gt 0) {
    $headClose = [regex]::Match($ruqyahHtml, '</head>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if (-not $headClose.Success -or [regex]::Matches($ruqyahHtml, '</head>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Count -ne 1) {
        throw 'Could not find exactly one </head> insertion point for missing metadata.'
    }
    $ruqyahHtml = $ruqyahHtml.Insert($headClose.Index, $missingHeadItems.ToString())
}

if ($ruqyahHtml -ceq $originalHtml) {
    Write-Host "Ruqyah page is already current ($totalVerseCount verse cards, $categoryCount categories)."
} elseif ($PSCmdlet.ShouldProcess($htmlPath, "Generate $totalVerseCount pre-rendered Ruqyah cards")) {
    Write-Utf8TextAtomically -Path $htmlPath -Text $ruqyahHtml -HasBom $hasBom
    Write-Host "Built $totalVerseCount Ruqyah cards across $categoryCount categories in '$htmlPath'." -ForegroundColor Green
}
