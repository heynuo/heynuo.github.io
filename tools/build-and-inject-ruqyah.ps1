# build-and-inject-ruqyah.ps1
# Generates pristine pre-rendered HTML for all 60 Ruqyah cards and injects into ruqyah.html
# Uses HTML character entities for all icons/emojis to avoid any encoding mismatches.

Add-Type -AssemblyName System.Web

$content = [System.IO.File]::ReadAllText("js\data\ruqyah-data.js", [System.Text.Encoding]::UTF8)
$jsonStart = $content.IndexOf("[")
$jsonEnd = $content.LastIndexOf("]")
$jsonStr = $content.Substring($jsonStart, $jsonEnd - $jsonStart + 1)
$verses = ConvertFrom-Json $jsonStr

function Escape-Html($str) {
    if (-not $str) { return "" }
    return [System.Web.HttpUtility]::HtmlEncode($str)
}

$cardsHtml = ""
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
    $cardsHtml += $card
}

# Now load ruqyah.html and inject stats, filters, cards, standard footer, shortcuts modal, and manifest
$ruqyahHtml = [System.IO.File]::ReadAllText("ruqyah.html", [System.Text.Encoding]::UTF8)

# Pre-render Stats Dashboard
$statsPre = @"
      <div class="ruqyah-stats-dashboard" id="ruqyahStats" aria-label="Ruqyah statistics">
        <div class="ruqyah-stat-chip">&#128214; <strong>60</strong> Ruqyah Verses</div>
        <div class="ruqyah-stat-chip">&#127991;&#65039; <strong>9</strong> Categories</div>
        <div class="ruqyah-stat-chip">&#11088; <strong>0</strong> Favorites</div>
        <div class="ruqyah-stat-chip">&#127897;&#65039; <strong>Qari Muhammad Ashiq</strong></div>
      </div>
"@

# Pre-render Filter Strip
$filtersPre = @"
      <div class="ruqyah-filter-strip" id="ruqyahFilters" aria-label="Ruqyah categories">
        <button type="button" class="ruqyah-filter-pill active" data-category="all"><span>&#10024; All</span> <span class="filter-count-badge">60</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Foundational"><span>Foundational</span> <span class="filter-count-badge">5</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Protection &amp; Silencing"><span>Protection &amp; Silencing</span> <span class="filter-count-badge">6</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Subduing Enemies"><span>Subduing Enemies</span> <span class="filter-count-badge">5</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Love &amp; Harmony"><span>Love &amp; Harmony</span> <span class="filter-count-badge">5</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Breaking Knots"><span>Breaking Knots</span> <span class="filter-count-badge">5</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Jinn Expulsion"><span>Jinn Expulsion</span> <span class="filter-count-badge">12</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Victory &amp; Authority"><span>Victory &amp; Authority</span> <span class="filter-count-badge">10</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Special Purposes"><span>Special Purposes</span> <span class="filter-count-badge">7</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="Spiritual Strength"><span>Spiritual Strength</span> <span class="filter-count-badge">5</span></button>
        <button type="button" class="ruqyah-filter-pill" data-category="favorites"><span>&#11088; Favorites</span> <span class="filter-count-badge">0</span></button>
      </div>
"@

$ruqyahHtml = [System.Text.RegularExpressions.Regex]::Replace(
    $ruqyahHtml,
    '<div class="ruqyah-stats-dashboard" id="ruqyahStats"[^>]*>.*?</div>',
    $statsPre,
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

$ruqyahHtml = [System.Text.RegularExpressions.Regex]::Replace(
    $ruqyahHtml,
    '<div class="ruqyah-filter-strip" id="ruqyahFilters"[^>]*>.*?</div>',
    $filtersPre,
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

$ruqyahHtml = $ruqyahHtml.Replace('<span id="resultStats">Loading verses...</span>', '<span id="resultStats">Showing all <strong>60</strong> Ruqyah verses</span>')
$ruqyahHtml = $ruqyahHtml.Replace('Audio streams directly from Al-Islam Quran Cloud', 'Audio streams directly from Al-Islam Quran Cloud with EveryAyah fallback')

# Replace grid with pre-rendered cards
$newGrid = @"
    <!-- Verse Cards Container (Pre-rendered for complete No-JS Resilience and Instant SEO) -->
    <section id="ruqyahGrid" class="ruqyah-grid" aria-live="polite" aria-label="Ruqyah verse cards">
$cardsHtml
    </section>
"@

$ruqyahHtml = [System.Text.RegularExpressions.Regex]::Replace(
    $ruqyahHtml,
    '<section id="ruqyahGrid" class="ruqyah-grid"[^>]*>.*?</section>',
    $newGrid,
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

# Standard Shared Footer
$standardFooter = @"
  <!-- Footer -->
  <footer>
    <div class="footer-inner">
      <div class="footer-links">
        <a href="index.html">Home</a>
        <a href="quran.html">Quran</a>
        <a href="quran-verses.html">108 Verses</a>
        <a href="ruqyah.html" class="active" aria-current="page">Ruqyah</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
        <a href="privacy.html">Privacy &amp; Sources</a>
        <a href="rss.xml">RSS</a>
        <a href="https://github.com/heynuo" target="_blank" rel="noopener noreferrer"><img src="assets/icons/github.png" alt="" width="15" height="15" class="footer-icon"> GitHub</a>
        <button type="button" class="footer-shortcut-btn" id="shortcutHelpBtn" title="View keyboard shortcuts">&#9000;&#65039; Shortcuts</button>
      </div>
      <p>© 2026 HeyNuo · Built with pure HTML, CSS &amp; JS · Free &amp; Open Knowledge</p>
    </div>
  </footer>
"@

$ruqyahHtml = [System.Text.RegularExpressions.Regex]::Replace(
    $ruqyahHtml,
    '<!-- Footer -->\s*<footer>.*?</footer>',
    $standardFooter,
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

# Ensure shortcuts modal markup is present
$shortcutsModalMarkup = @"

  <!-- Keyboard Shortcuts Modal (WCAG 2.1.4 compliant) -->
  <div class="shortcuts-modal-backdrop" id="shortcutsModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="shortcutsTitle">
    <div class="shortcuts-modal">
      <div class="shortcuts-header">
        <h3 id="shortcutsTitle">&#9000;&#65039; Keyboard Shortcuts</h3>
        <button type="button" class="announcement-close" id="shortcutsClose" aria-label="Close shortcuts dialog">✕</button>
      </div>
      <div class="shortcuts-toggle-row">
        <label for="toggleSingleShortcuts" class="shortcuts-toggle-label">
          <span>Enable Single-Key Shortcuts (T, H, A, C, ?, Space)</span>
          <small>Turn off if using speech-to-text or screen readers (WCAG 2.1.4)</small>
        </label>
        <input type="checkbox" id="toggleSingleShortcuts" class="shortcuts-checkbox" checked>
      </div>
      <div class="shortcuts-list">
        <div class="shortcut-row"><span class="shortcut-desc">Search &amp; Command Palette</span><span><kbd class="shortcut-key">Ctrl + K</kbd> or <kbd class="shortcut-key">/</kbd></span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Toggle Dark / Light Mode</span><kbd class="shortcut-key">T</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Go to Home</span><kbd class="shortcut-key">H</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Go to About</span><kbd class="shortcut-key">A</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Go to Contact</span><kbd class="shortcut-key">C</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">View Shortcuts</span><kbd class="shortcut-key">?</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Quran Play / Pause</span><kbd class="shortcut-key">Space</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Next / Previous Surah</span><span><kbd class="shortcut-key">→</kbd> / <kbd class="shortcut-key">←</kbd></span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Minimize / Restore Player</span><kbd class="shortcut-key">V</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Surah Playlist Queue</span><kbd class="shortcut-key">Q</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Fullscreen Player Modal</span><kbd class="shortcut-key">F</kbd></div>
        <div class="shortcut-row"><span class="shortcut-desc">Close Any Dialog</span><kbd class="shortcut-key">Esc</kbd></div>
      </div>
    </div>
  </div>
"@

if (-not $ruqyahHtml.Contains('id="shortcutsModal"')) {
    $ruqyahHtml = $ruqyahHtml.Replace('<div id="ruqyahToast"', $shortcutsModalMarkup + "`n`n  <div id=`"ruqyahToast`"")
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

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText("ruqyah.html", $ruqyahHtml, $utf8NoBom)
Write-Output "Successfully built and injected pristine UTF-8 60 Ruqyah cards, footer, shortcuts, and metadata into ruqyah.html!"
