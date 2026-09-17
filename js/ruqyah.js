/**
 * HeyNuo - Ruqyah & Quranic Healing Guide Controller
 * Features:
 * - Direct Al-Islam Quran Cloud Audio Streaming
 * - Sequential multi-verse playback with auto-advance
 * - Reciter switcher (Qari Ashiq, Qari Feroz, Qari Rashid, Qari Aiman)
 * - Search with keyword scoring
 * - Category filter and Favorites system
 * - Copy to clipboard (Arabic, Transliteration, Translation)
 * - URL state synchronization
 */

(function () {
  'use strict';

  // Reciters configuration from Al-Islam Quran App
  const RECITERS = {
    ashiq: { name: 'Qari Muhammad Ashiq', folder: 'ashiq' },
    feroz: { name: 'Qari Feroz', folder: 'feroz' },
    rashid: { name: 'Qari Rashid', folder: 'rashid' },
    aiman: { name: 'Qari Aiman', folder: 'aiman' },
    'idir-iken': { name: 'Qari Idir Iken', folder: 'idir-iken' }
  };

  // State
  let currentReciter = localStorage.getItem('ruqyah_reciter') || 'ashiq';
  let favorites = JSON.parse(localStorage.getItem('ruqyah_favorites') || '[]');
  let activeCategory = 'all';
  let searchQuery = '';

  // Audio Engine State
  let currentAudio = null;
  let playingCardId = null;
  let playingAyahIndex = 0; // index inside audioVerses array
  let isAudioPlaying = false;

  // DOM Elements
  const gridEl = document.getElementById('ruqyahGrid');
  const searchInputEl = document.getElementById('ruqyahSearch');
  const searchClearBtnEl = document.getElementById('searchClearBtn');
  const filterStripEl = document.getElementById('ruqyahFilters');
  const statsDashboardEl = document.getElementById('ruqyahStats');
  const resultStatsEl = document.getElementById('resultStats');
  const reciterSelectEl = document.getElementById('reciterSelect');
  const toastEl = document.getElementById('ruqyahToast');

  // Helper: show toast
  let toastTimer = null;
  function showToast(msg, icon = '✓') {
    if (!toastEl) return;
    toastEl.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // Audio URL Helper
  function getAlIslamAudioUrl(surah, ayah, reciterKey = currentReciter) {
    const folder = (RECITERS[reciterKey] || RECITERS.ashiq).folder;
    const sPad = String(surah).padStart(3, '0');
    const aPad = String(ayah).padStart(3, '0');
    return `https://files.alislam.cloud/audio/tilawat/${folder}/${sPad}-${aPad}-AR.mp3`;
  }

  // Audio Control Engine
  function stopCurrentAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.onended = null;
      currentAudio.ontimeupdate = null;
      currentAudio.onerror = null;
      currentAudio = null;
    }
    isAudioPlaying = false;
    updateAllCardPlayerUI();
  }

  function playAyah(cardId, ayahIndex = 0) {
    const item = RUQYAH_VERSES.find(v => v.id === cardId);
    if (!item || !item.audioVerses || !item.audioVerses.length) return;

    if (ayahIndex < 0) ayahIndex = 0;
    if (ayahIndex >= item.audioVerses.length) ayahIndex = item.audioVerses.length - 1;

    // If same card and same ayah, and paused, resume
    if (playingCardId === cardId && playingAyahIndex === ayahIndex && currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play().then(() => {
          isAudioPlaying = true;
          updateCardPlayerUI(cardId);
        }).catch(handleAudioError);
        return;
      }
    }

    // Otherwise stop and create new audio
    stopCurrentAudio();
    if (window.QuranPlayer && typeof window.QuranPlayer.pause === 'function') {
      try { window.QuranPlayer.pause(); } catch (e) {}
    }

    playingCardId = cardId;
    playingAyahIndex = ayahIndex;
    const currentAyahNumber = item.audioVerses[ayahIndex];
    const url = getAlIslamAudioUrl(item.surah, currentAyahNumber, currentReciter);

    currentAudio = new Audio(url);
    currentAudio.preload = 'auto';

    currentAudio.onplay = () => {
      isAudioPlaying = true;
      updateCardPlayerUI(cardId);
    };

    currentAudio.onpause = () => {
      isAudioPlaying = false;
      updateCardPlayerUI(cardId);
    };

    currentAudio.ontimeupdate = () => {
      updateCardProgressUI(cardId);
    };

    currentAudio.onended = () => {
      // If there are more verses in this sequence, auto-advance!
      if (playingAyahIndex + 1 < item.audioVerses.length) {
        playAyah(cardId, playingAyahIndex + 1);
      } else {
        stopCurrentAudio();
        showToast(`Completed recitation of ${item.reference}`, '✨');
      }
    };

    currentAudio.onerror = () => {
      handleAudioError();
    };

    currentAudio.play().then(() => {
      isAudioPlaying = true;
      updateCardPlayerUI(cardId);
    }).catch(handleAudioError);
  }

  function togglePlayCard(cardId) {
    if (playingCardId === cardId && isAudioPlaying) {
      if (currentAudio) currentAudio.pause();
    } else {
      playAyah(cardId, playingCardId === cardId ? playingAyahIndex : 0);
    }
  }

  function handleAudioError() {
    const item = RUQYAH_VERSES.find(v => v.id === playingCardId);
    const ref = item ? item.reference : 'verse';
    showToast(`Audio stream unavailable. Opening Al-Islam App...`, '⚠️');
    if (item && item.alislamAppUrl) {
      window.open(item.alislamAppUrl, '_blank', 'noopener');
    }
    stopCurrentAudio();
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updateCardPlayerUI(cardId) {
    const cardEl = document.querySelector(`.ruqyah-card[data-id="${cardId}"]`);
    if (!cardEl) return;

    const playBtn = cardEl.querySelector('.play-toggle-btn');
    const trackTitle = cardEl.querySelector('.player-track-title');
    const prevBtn = cardEl.querySelector('.prev-ayah-btn');
    const nextBtn = cardEl.querySelector('.next-ayah-btn');

    const item = RUQYAH_VERSES.find(v => v.id === cardId);
    const totalAyahs = item ? item.audioVerses.length : 1;
    const isThisCardActive = (playingCardId === cardId);

    if (isThisCardActive && isAudioPlaying) {
      cardEl.classList.add('is-playing');
      if (playBtn) playBtn.innerHTML = '⏸';
      if (trackTitle) {
        const currentAyah = item.audioVerses[playingAyahIndex];
        trackTitle.innerHTML = `Ayah ${currentAyah} (${playingAyahIndex + 1}/${totalAyahs}) <div class="soundwave-bars"><span></span><span></span><span></span></div>`;
      }
    } else {
      cardEl.classList.remove('is-playing');
      if (playBtn) playBtn.innerHTML = '▶';
      if (trackTitle) {
        trackTitle.innerHTML = totalAyahs > 1 ? `Recite ${totalAyahs} Ayahs` : `Recite Ayah`;
      }
    }

    if (prevBtn) prevBtn.disabled = !isThisCardActive || playingAyahIndex === 0;
    if (nextBtn) nextBtn.disabled = !isThisCardActive || playingAyahIndex >= totalAyahs - 1;
  }

  function updateAllCardPlayerUI() {
    document.querySelectorAll('.ruqyah-card').forEach(c => {
      const id = Number(c.dataset.id);
      updateCardPlayerUI(id);
      const fill = c.querySelector('.audio-progress-fill');
      const timeDisplay = c.querySelector('.player-time-display');
      if (fill && playingCardId !== id) fill.style.width = '0%';
      if (timeDisplay && playingCardId !== id) timeDisplay.textContent = '0:00';
    });
  }

  function updateCardProgressUI(cardId) {
    if (playingCardId !== cardId || !currentAudio) return;
    const cardEl = document.querySelector(`.ruqyah-card[data-id="${cardId}"]`);
    if (!cardEl) return;

    const fill = cardEl.querySelector('.audio-progress-fill');
    const timeDisplay = cardEl.querySelector('.player-time-display');

    const current = currentAudio.currentTime || 0;
    const total = currentAudio.duration || 0;
    const pct = total > 0 ? (current / total) * 100 : 0;

    if (fill) fill.style.width = `${pct}%`;
    if (timeDisplay) {
      timeDisplay.textContent = `${formatTime(current)} / ${formatTime(total)}`;
    }
  }

  // Favorites management
  function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    const item = RUQYAH_VERSES.find(v => v.id === id);
    if (idx > -1) {
      favorites.splice(idx, 1);
      showToast(`Removed ${item ? item.reference : 'verse'} from favorites`, '☆');
    } else {
      favorites.push(id);
      showToast(`Saved ${item ? item.reference : 'verse'} to favorites`, '⭐');
    }
    localStorage.setItem('ruqyah_favorites', JSON.stringify(favorites));
    render();
  }

  // Copy helpers
  function copyText(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${label} to clipboard!`, '📋');
      }).catch(() => fallbackCopy(text, label));
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${label}!`, '📋');
    } catch (e) {
      showToast('Could not copy', '⚠️');
    }
    document.body.removeChild(ta);
  }

  // Search & Filtering
  function getFilteredVerses() {
    const q = searchQuery.toLowerCase().trim();
    return RUQYAH_VERSES.filter(item => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Search match
      if (!q) return true;
      const matchIn = [
        item.reference,
        item.surahName,
        item.category,
        item.purpose,
        item.source,
        item.transliteration,
        item.translation,
        item.arabic
      ].join(' ').toLowerCase();

      return matchIn.includes(q);
    });
  }

  // Render Stats
  function updateStatsDashboard() {
    const total = RUQYAH_VERSES.length;
    const categoriesCount = new Set(RUQYAH_VERSES.map(v => v.category)).size;
    const favCount = favorites.length;

    if (statsDashboardEl) {
      statsDashboardEl.innerHTML = `
        <div class="ruqyah-stat-chip">📖 <strong>${total}</strong> Ruqyah Verses</div>
        <div class="ruqyah-stat-chip">🏷️ <strong>${categoriesCount}</strong> Categories</div>
        <div class="ruqyah-stat-chip">⭐ <strong>${favCount}</strong> Favorites</div>
        <div class="ruqyah-stat-chip">🎙️ <strong>${RECITERS[currentReciter]?.name || 'Al-Islam Audio'}</strong></div>
      `;
    }
  }

  // Render Filter Pills
  function renderFilterPills() {
    if (!filterStripEl) return;
    const categories = [
      'all',
      'Foundational',
      'Protection & Silencing',
      'Subduing Enemies',
      'Love & Harmony',
      'Breaking Knots',
      'Jinn Expulsion',
      'Victory & Authority',
      'Special Purposes',
      'Spiritual Strength',
      'favorites'
    ];

    const counts = {};
    RUQYAH_VERSES.forEach(v => counts[v.category] = (counts[v.category] || 0) + 1);

    filterStripEl.innerHTML = categories.map(cat => {
      const isActive = activeCategory === cat;
      let label = cat;
      let count = 0;

      if (cat === 'all') {
        label = '✨ All';
        count = RUQYAH_VERSES.length;
      } else if (cat === 'favorites') {
        label = '⭐ Favorites';
        count = favorites.length;
      } else {
        count = counts[cat] || 0;
      }

      return `
        <button type="button" class="ruqyah-filter-pill ${isActive ? 'active' : ''}" data-category="${cat}">
          <span>${label}</span>
          <span class="filter-count-badge">${count}</span>
        </button>
      `;
    }).join('');
  }

  // Render Verse Cards
  function renderCards() {
    if (!gridEl) return;
    const list = getFilteredVerses();

    if (resultStatsEl) {
      if (searchQuery || activeCategory !== 'all') {
        resultStatsEl.innerHTML = `Showing <strong>${list.length}</strong> of ${RUQYAH_VERSES.length} verses`;
      } else {
        resultStatsEl.innerHTML = `Showing all <strong>${list.length}</strong> Ruqyah verses`;
      }
    }

    if (!list.length) {
      gridEl.innerHTML = `
        <div class="ruqyah-empty-state">
          <h3>🔍 No matching Ruqyah verses found</h3>
          <p>Try searching for a different term like "Kursi", "Fatiha", "Jinn", or reset your category filter.</p>
          <button type="button" class="ruqyah-filter-pill active" id="resetFiltersBtn" style="margin-top:14px;">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          searchQuery = '';
          if (searchInputEl) searchInputEl.value = '';
          if (searchClearBtnEl) searchClearBtnEl.classList.remove('visible');
          activeCategory = 'all';
          render();
        };
      }
      return;
    }

    gridEl.innerHTML = list.map(item => {
      const isFav = favorites.includes(item.id);
      const isPlaying = (playingCardId === item.id && isAudioPlaying);
      const isMultiVerse = item.audioVerses.length > 1;

      return `
        <article class="ruqyah-card ${isPlaying ? 'is-playing' : ''}" data-id="${item.id}">
          <header class="card-header-row">
            <div class="card-tags">
              <span class="card-category-pill">${escapeHtml(item.category)}</span>
              <span class="card-source-pill">📜 ${escapeHtml(item.source)}</span>
            </div>
            <div class="card-header-actions">
              <button type="button" class="card-icon-btn favorite-btn ${isFav ? 'active' : ''}" data-action="favorite" data-id="${item.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
                ${isFav ? '⭐ Saved' : '☆ Save'}
              </button>

              <div class="copy-menu-wrapper">
                <button type="button" class="card-icon-btn copy-menu-trigger" data-action="copy-menu" data-id="${item.id}" title="Copy verse options">
                  📋 Copy
                </button>
                <div class="copy-dropdown" id="copyDropdown-${item.id}">
                  <button type="button" class="copy-item" data-copy-type="all" data-id="${item.id}">📋 Copy Full Card</button>
                  <button type="button" class="copy-item" data-copy-type="arabic" data-id="${item.id}">🌙 Copy Arabic Text</button>
                  <button type="button" class="copy-item" data-copy-type="translit" data-id="${item.id}">🔤 Copy Transliteration</button>
                  <button type="button" class="copy-item" data-copy-type="translation" data-id="${item.id}">📖 Copy English Meaning</button>
                </div>
              </div>
            </div>
          </header>

          <div class="card-title-group">
            <h3 class="card-reference">${escapeHtml(item.reference)}</h3>
          </div>

          <div class="card-purpose-callout">
            <strong>Spiritual Purpose:</strong> ${escapeHtml(item.purpose)}
          </div>

          <!-- Arabic Text Box -->
          <div class="arabic-box">
            <div class="arabic-text" dir="rtl">${escapeHtml(item.arabic)}</div>
          </div>

          <!-- English Transliteration -->
          <div class="translit-box">
            <span class="translit-label">Transliteration (Pronunciation)</span>
            <div class="translit-text">${escapeHtml(item.transliteration)}</div>
          </div>

          <!-- English Translation -->
          <div class="trans-box">
            <span class="trans-label">English Meaning</span>
            <div class="trans-text">${escapeHtml(item.translation)}</div>
          </div>

          ${item.isFullSurahNote ? `
            <div class="surah-note-alert">
              💡 <strong>Note:</strong> ${escapeHtml(item.isFullSurahNote)}
            </div>
          ` : ''}

          <!-- Verse Audio Player Component -->
          <div class="card-audio-player">
            <div class="player-main-row">
              <div class="player-left-group">
                <button type="button" class="play-toggle-btn" data-action="play" data-id="${item.id}" aria-label="Play recitation of ${escapeHtml(item.reference)}">
                  ${isPlaying ? '⏸' : '▶'}
                </button>
                <div class="player-track-info">
                  <div class="player-track-title">
                    ${isMultiVerse ? `Recite ${item.audioVerses.length} Ayahs` : `Recite Ayah`}
                  </div>
                  <span class="player-source-note">Al-Islam Quran Stream (${RECITERS[currentReciter]?.name || 'Qari Ashiq'})</span>
                </div>
              </div>

              <div class="player-right-group">
                <a href="${item.alislamAppUrl}" target="_blank" rel="noopener noreferrer" class="alislam-app-link" title="Open in official Al-Islam Quran app">
                  <span>Al-Islam App</span> ↗
                </a>
              </div>
            </div>

            <div class="player-timeline-row">
              <div class="audio-progress-bar" data-action="seek" data-id="${item.id}">
                <div class="audio-progress-fill"></div>
              </div>
              <span class="player-time-display">0:00</span>
            </div>

            ${isMultiVerse ? `
              <div class="multiverse-controls">
                <button type="button" class="multiverse-btn prev-ayah-btn" data-action="prev-ayah" data-id="${item.id}" disabled>← Prev Ayah</button>
                <span>${item.audioVerses.length} Verses in Passage</span>
                <button type="button" class="multiverse-btn next-ayah-btn" data-action="next-ayah" data-id="${item.id}">Next Ayah →</button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    // Reconnect active player state if currently playing
    if (playingCardId) {
      updateCardPlayerUI(playingCardId);
      updateCardProgressUI(playingCardId);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return m;
      }
    });
  }

  function syncUrl() {
    const url = new URL(window.location);
    if (searchQuery) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }
    if (activeCategory !== 'all') {
      url.searchParams.set('category', activeCategory);
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url);
  }

  function render() {
    updateStatsDashboard();
    renderFilterPills();
    renderCards();
    syncUrl();
  }

  // Attach Global Event Listeners
  function initListeners() {
    // Search input
    if (searchInputEl) {
      searchInputEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClearBtnEl) {
          if (searchQuery) searchClearBtnEl.classList.add('visible');
          else searchClearBtnEl.classList.remove('visible');
        }
        render();
      });
    }

    if (searchClearBtnEl) {
      searchClearBtnEl.addEventListener('click', () => {
        searchQuery = '';
        searchInputEl.value = '';
        searchClearBtnEl.classList.remove('visible');
        render();
      });
    }

    // Reciter change
    if (reciterSelectEl) {
      reciterSelectEl.value = currentReciter;
      reciterSelectEl.addEventListener('change', (e) => {
        currentReciter = e.target.value;
        localStorage.setItem('ruqyah_reciter', currentReciter);
        showToast(`Reciter set to ${RECITERS[currentReciter]?.name}`, '🎙️');
        if (isAudioPlaying && playingCardId) {
          playAyah(playingCardId, playingAyahIndex);
        } else {
          render();
        }
      });
    }

    // Filter pill click
    if (filterStripEl) {
      filterStripEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-category]');
        if (!btn) return;
        activeCategory = btn.dataset.category;
        render();
      });
    }

    // Grid delegate actions (Play, Favorite, Copy, Seek, Prev/Next)
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        // Close other open copy dropdowns
        if (!e.target.closest('.copy-menu-wrapper')) {
          document.querySelectorAll('.copy-dropdown.show').forEach(d => d.classList.remove('show'));
        }

        const actionTrigger = e.target.closest('[data-action]');
        if (!actionTrigger) return;

        const action = actionTrigger.dataset.action;
        const cardId = Number(actionTrigger.dataset.id);
        const item = RUQYAH_VERSES.find(v => v.id === cardId);

        if (action === 'play') {
          togglePlayCard(cardId);
        } else if (action === 'favorite') {
          toggleFavorite(cardId);
        } else if (action === 'copy-menu') {
          const dropdown = document.getElementById(`copyDropdown-${cardId}`);
          if (dropdown) {
            const isShown = dropdown.classList.contains('show');
            document.querySelectorAll('.copy-dropdown.show').forEach(d => d.classList.remove('show'));
            if (!isShown) dropdown.classList.add('show');
          }
        } else if (action === 'prev-ayah') {
          if (playingCardId === cardId && playingAyahIndex > 0) {
            playAyah(cardId, playingAyahIndex - 1);
          }
        } else if (action === 'next-ayah') {
          if (playingCardId === cardId && item && playingAyahIndex + 1 < item.audioVerses.length) {
            playAyah(cardId, playingAyahIndex + 1);
          }
        }
      });

      // Handle copy item click
      gridEl.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-item');
        if (!copyBtn) return;
        const cardId = Number(copyBtn.dataset.id);
        const copyType = copyBtn.dataset.copyType;
        const item = RUQYAH_VERSES.find(v => v.id === cardId);
        if (!item) return;

        if (copyType === 'arabic') {
          copyText(item.arabic, `${item.reference} (Arabic)`);
        } else if (copyType === 'translit') {
          copyText(item.transliteration, `${item.reference} (Transliteration)`);
        } else if (copyType === 'translation') {
          copyText(item.translation, `${item.reference} (English Meaning)`);
        } else {
          // Copy full card
          const fullText = `📜 ${item.reference} [${item.category}]
Purpose: ${item.purpose}
Scholarly Source: ${item.source}

Arabic:
${item.arabic}

Transliteration:
${item.transliteration}

Translation:
${item.translation}

Reference via HeyNuo Ruqyah Guide: https://heynuo.github.io/ruqyah.html`;
          copyText(fullText, `${item.reference} (Complete)`);
        }

        document.querySelectorAll('.copy-dropdown.show').forEach(d => d.classList.remove('show'));
      });

      // Progress bar click to seek
      gridEl.addEventListener('click', (e) => {
        const bar = e.target.closest('.audio-progress-bar');
        if (!bar) return;
        const cardId = Number(bar.dataset.id);
        if (playingCardId !== cardId || !currentAudio || !currentAudio.duration) return;

        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        currentAudio.currentTime = pct * currentAudio.duration;
      });
    }

    // Global audio control (play first or stop)
    const globalPlayBtn = document.getElementById('globalPlayBtn');
    if (globalPlayBtn) {
      globalPlayBtn.addEventListener('click', () => {
        if (isAudioPlaying) {
          stopCurrentAudio();
        } else {
          const list = getFilteredVerses();
          if (list.length > 0) {
            playAyah(list[0].id, 0);
          }
        }
      });
    }

    // Close copy dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.copy-menu-wrapper')) {
        document.querySelectorAll('.copy-dropdown.show').forEach(d => d.classList.remove('show'));
      }
    });
  }

  // Load URL params on initial load
  function loadUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('category');
    if (q) {
      searchQuery = q;
      if (searchInputEl) searchInputEl.value = q;
      if (searchClearBtnEl) searchClearBtnEl.classList.add('visible');
    }
    if (cat) {
      activeCategory = cat;
    }
  }

  // Init
  function init() {
    loadUrlParams();
    initListeners();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
