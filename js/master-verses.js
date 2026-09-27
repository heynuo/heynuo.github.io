/**
 * HeyNuo — Master Compilation of Quranic Verses (108 Verses from 62 Books)
 * Interactive Controller & Sacred Audio Engine
 *
 * Capabilities:
 * - Dual View: Illuminated Cards Grid & Canonical Master Table (PDF Pages 4-11)
 * - Thematic Taxonomy Filter Matrix (PDF Page 3 Breakdown)
 * - Top 10 Most Cross-Referenced Interactive Showcase (PDF Page 12)
 * - Bonus Verses Showcase (17:82, 24:35, 36:82) with Modal
 * - Full Arabic Uthmani Calligraphy with Dynamic Font Size Resizer (80%–150%)
 * - Audio Playback Engine via Al-Islam CDN with Multi-Reciter Support
 * - Persistent Floating Player with Timeline Scrubber, Speed Control (0.75x–1.5x) & Verse Looping
 * - Instant Live Search (Tolerant & Multi-Lingual) + Surah & Source Filters
 * - Bookmarks / Memorization List with LocalStorage Persistence
 * - Random Ayah Discovery with Golden Aura Pulse Animation
 * - One-Click Copy & Native Social Sharing (WhatsApp, Telegram, Twitter)
 * - Global Keyboard Shortcuts (Space, Arrows, R, F, T, Ctrl+K, +, -)
 */

(function () {
  'use strict';

  // Reciter Configuration (Multi-Provider: EveryAyah & Al-Islam Tilawat CDN)
  const RECITERS = {
    alafasy: { name: 'Mishary Rashid Alafasy', provider: 'everyayah', folder: 'Alafasy_128kbps' },
    abdulbasit: { name: 'Qari Abdul Basit (Murattal)', provider: 'everyayah', folder: 'Abdul_Basit_Murattal_192kbps' },
    ashiq: { name: 'Qari Muhammad Ashiq', provider: 'alislam', folder: 'ashiq' },
    feroz: { name: 'Qari Feroz', provider: 'alislam', folder: 'feroz' },
    rashid: { name: 'Qari Rashid', provider: 'alislam', folder: 'rashid' },
    aiman: { name: 'Qari Aiman', provider: 'alislam', folder: 'aiman' },
    'idir-iken': { name: 'Qari Idir Iken', provider: 'alislam', folder: 'idir-iken' }
  };

  // Additional Top-10 / Cross-Referenced Verses (from publication & review)
  const TOP_CROSS_REFERENCED_ADDITIONAL = [
    {
      id: 'bonus-17-82',
      bonusNumber: 109,
      surah: 17,
      surahName: 'Al-Isra',
      surahNameAr: 'سُورَةُ الإِسۡرَاءِ',
      surahTranslation: 'The Night Journey',
      verseRange: '17:82',
      startAyah: 82,
      endAyah: 82,
      topic: 'Quran as healing (Shifa) and mercy for the believers',
      sourceBook: 'Understanding Ruqyah & Jinn in Islam (Dedication Verse)',
      category: 'Protection & Ruqyah (Healing)',
      crossReferenced: '4+ books',
      isTopCrossReferenced: true,
      isFullSurah: false,
      audioVerses: [82],
      arabic: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌۭ وَرَحْمَةٌۭ لِّلْمُؤْمِنِينَ ۙ وَلَا يَزِيدُ ٱلظَّٰلِمِينَ إِلَّا خَسَارًۭا',
      transliteration: "Wa nunazzilu minal quraani maa huwa shifaaa'unw wa rahmatul lilmu'mineena wa laa yazeeduz zaalimeena illaa khasaaraa",
      translation: 'And We send down of the Qur\'an that which is healing and mercy for the believers, but it does not increase the wrongdoers except in loss.',
      alislamAppUrl: 'https://www.alislam.org/quran/app/17:82'
    },
    {
      id: 'bonus-24-35',
      bonusNumber: 110,
      surah: 24,
      surahName: 'An-Nur',
      surahNameAr: 'سُورَةُ النُّورِ',
      surahTranslation: 'The Light',
      verseRange: '24:35',
      startAyah: 35,
      endAyah: 35,
      topic: 'Ayat an-Nur (The Light Verse) - Parable of Divine Light',
      sourceBook: 'Understanding Ruqyah & Jinn in Islam',
      category: 'Signs & Creation',
      crossReferenced: '4+ books',
      isTopCrossReferenced: true,
      isFullSurah: false,
      audioVerses: [35],
      arabic: '۞ ٱللَّهُ نُورُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ ۚ مَثَلُ نُورِهِۦ كَمِشْكَوٰةٍۢ فِيهَا مِصْبَاحٌ ۖ ٱلْمِصْبَاحُ فِى زُجَاجَةٍ ۖ ٱلزُّجَاجَةُ كَأَنَّهَا كَوْكَبٌۭ دُرِّىٌّۭ يُوقَدُ مِن شَجَرَةٍۢ مُّبَٰرَكَةٍۢ زَيْتُونَةٍۢ لَّا شَرْقِيَّةٍۢ وَلَا غَرْبِيَّةٍۢ يَكَادُ زَيْتُهَا يُضِىٓءُ وَلَوْ لَمْ تَمْسَسْهُ نَارٌۭ ۚ نُّورٌ عَلَىٰ نُورٍۢ ۗ يَهْدِى ٱللَّهُ لِنُورِهِۦ مَن يَشَآءُ ۚ وَيَضْرِبُ ٱللَّهُ ٱلْأَمْثَٰلَ لِلنَّاسِ ۗ وَٱللَّهُ بِكُلِّ شَىْءٍ عَلِيمٌۭ',
      transliteration: "Allahu noorus samaawaati wal ard; masalu noorihee kamishkaatin feehaa misbaah; almisbaahu fee zujaajatin; azzujaajatu ka annahaa kawkabun durriyyuny yooqadu min shajaratim mubaarakatin zaytoonatil laa sharqiyyatinw wa laa gharbiyyatiny yakaadu zaytuhaa yudeee'u wa law lam tamsashu naar; noorun 'alaa noor; yahdillaahu linoorihee may yashaaa'; wa yadribullaahul amsaala linnaas; wallaahu bikulli shai'in 'Aleem",
      translation: 'Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp, the lamp is within glass, the glass as if it were a pearly [white] star lit from [the oil of] a blessed olive tree, neither of the east nor of the west, whose oil would almost glow even if untouched by fire. Light upon light. Allah guides to His light whom He wills. And Allah presents examples for the people, and Allah is Knowing of all things.',
      alislamAppUrl: 'https://www.alislam.org/quran/app/24:35'
    },
    {
      id: 'bonus-36-82',
      bonusNumber: 111,
      surah: 36,
      surahName: 'Ya-Sin',
      surahNameAr: 'سُورَةُ يسٓ',
      surahTranslation: 'Yaseen',
      verseRange: '36:82',
      startAyah: 82,
      endAyah: 82,
      topic: 'Kun Fayakun (Be! And it is) - Divine command of creation',
      sourceBook: 'Understanding Ruqyah & Jinn in Islam',
      category: 'Signs & Creation',
      crossReferenced: '4+ books',
      isTopCrossReferenced: true,
      isFullSurah: false,
      audioVerses: [82],
      arabic: 'إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ',
      transliteration: "Innamaa amruhooo izaaa araada shai'an ai-yaqoola lahoo kun fa-yakoon",
      translation: 'His command is only when He intends a thing that He says to it, "Be," and it is.',
      alislamAppUrl: 'https://www.alislam.org/quran/app/36:82'
    }
  ];

  // Top 10 Accurate Canonical Mappings (PDF Page 12)
  const TOP_10_METADATA = [
    { rank: 1, ref: 'Ayat ul-Kursi (2:255)', count: '8+ books', note: 'Greatest verse in Quran; supreme shield against Jinn', surah: 2, ayah: 255, targetId: 5 },
    { rank: 2, ref: 'Al-Ikhlas (112:1-4)', count: '5+ books', note: 'Pure monotheism (Tawheed); equal to 1/3 of the Quran', surah: 112, ayah: 1, targetId: 106 },
    { rank: 3, ref: 'Al-Fatiha (1:1-7)', count: '4+ books', note: 'The Mother of the Book; foundational Ruqyah healing', surah: 1, ayah: 1, targetId: 1 },
    { rank: 4, ref: 'Al-Baqarah (2:285-286)', count: '4+ books', note: 'Night protection; last two verses of Al-Baqarah', surah: 2, ayah: 285, targetId: 7 },
    { rank: 5, ref: 'Al-Baqarah (2:102)', count: '4+ books', note: 'Sorcery of Harut & Marut; formula for breaking witchcraft', surah: 2, ayah: 102, targetId: 2 },
    { rank: 6, ref: 'An-Nur (24:35)', count: '4+ books', note: 'The Light Verse (Ayat an-Nur); parable of Divine light', surah: 24, ayah: 35, targetId: 'bonus-24-35' },
    { rank: 7, ref: 'Ya-Sin (36:82)', count: '4+ books', note: 'Kun Fayakun ("Be! And it is"); omnipotent decree of creation', surah: 36, ayah: 82, targetId: 'bonus-36-82' },
    { rank: 8, ref: 'Al-Falaq (113:1-5)', count: '3+ books', note: 'Protection from created evil, witchcraft & envy', surah: 113, ayah: 1, targetId: 107 },
    { rank: 9, ref: 'An-Nas (114:1-6)', count: '3+ books', note: 'Protection from the sneaking whisperer of human hearts', surah: 114, ayah: 1, targetId: 108 },
    { rank: 10, ref: "Al-A'raf (7:117-122)", count: '3+ books', note: "Moses' staff swallowing and nullifying Pharaoh's sorcery", surah: 7, ayah: 117, targetId: 15 }
  ];

  // State Management
  let currentReciter = localStorage.getItem('mv_reciter') || 'alafasy';
  let favorites = JSON.parse(localStorage.getItem('mv_favorites') || '[]');
  let activeCategory = 'all';
  let activeSource = 'all';
  let selectedSurah = 'all';
  let currentView = localStorage.getItem('mv_view') || 'cards'; // 'cards' or 'table'
  let searchQuery = '';
  let expandedTableRowId = null;
  let autoAdvanceContinuous = localStorage.getItem('mv_autoadvance') === 'true';
  let arabicFontScale = Number(localStorage.getItem('mv_font_scale')) || 100;
  let currentSpeed = Number(localStorage.getItem('mv_speed')) || 1.0;
  let isLooping = localStorage.getItem('mv_loop') === 'true';
  let displayMode = localStorage.getItem('mv_display_mode') || 'all'; // 'all', 'aren', 'ar', 'en'

  // Audio Engine State
  let currentAudio = null;
  let playingVerseId = null;
  let playingAyahIndex = 0;
  let isAudioPlaying = false;
  let isSeeking = false;
  let isBuffering = false;
  let isMuted = localStorage.getItem('mv_muted') === 'true';
  let currentVolume = parseFloat(localStorage.getItem('mv_volume'));
  if (isNaN(currentVolume)) currentVolume = 1.0;

  // DOM Elements
  const cardsGridEl = document.getElementById('mvCardsGrid');
  const tableBodyEl = document.getElementById('mvTableBody');
  const tableWrapEl = document.getElementById('mvTableWrap');
  const searchInputEl = document.getElementById('mvSearchInput');
  const searchClearBtnEl = document.getElementById('mvSearchClear');
  const filterStripEl = document.getElementById('mvFilterStrip');
  const surahSelectEl = document.getElementById('mvSurahSelect');
  const sourceSelectEl = document.getElementById('mvSourceSelect');
  const displayModeSelect = document.getElementById('mvDisplayModeSelect');
  const autoAdvanceBtnEl = document.getElementById('mvAutoAdvanceBtn');
  const randomBtn = document.getElementById('mvRandomBtn');
  const bookmarksToggleBtn = document.getElementById('mvBookmarksToggleBtn');
  const bookmarksCountLabel = document.getElementById('mvBookmarksCountLabel');
  const shortcutsBtn = document.getElementById('mvShortcutsBtn');
  const shortcutsModalEl = document.getElementById('mvShortcutsModal');
  const shortcutsModalClose = document.getElementById('mvShortcutsModalClose');
  const resultsCountEl = document.getElementById('mvResultsCount');
  const emptyStateEl = document.getElementById('mvEmptyState');
  const reciterSelectEl = document.getElementById('mvReciterSelect');
  const viewCardsBtn = document.getElementById('mvViewCardsBtn');
  const viewTableBtn = document.getElementById('mvViewTableBtn');
  const pdfToggleBtn = document.getElementById('mvPdfToggleBtn');
  const pdfViewerWrap = document.getElementById('mvPdfViewerWrap');
  const top10GridEl = document.getElementById('mvTop10Grid');
  const toastEl = document.getElementById('mvToast');
  const backToTopBtn = document.getElementById('mvBackToTop');
  const fontDecBtn = document.getElementById('mvFontDecrease');
  const fontIncBtn = document.getElementById('mvFontIncrease');
  const fontValEl = document.getElementById('mvFontVal');
  const tocTableJump = document.getElementById('mvTocTableJump');

  // Bonus Modal Elements
  const bonusModalEl = document.getElementById('mvBonusModal');
  const bonusModalContent = document.getElementById('mvBonusModalContent');
  const bonusModalClose = document.getElementById('mvBonusModalClose');

  // Persistent Player Elements
  const audioBarEl = document.getElementById('mvAudioBar');
  const audioBarDiscEl = document.getElementById('mvAudioBarDisc');
  const audioBarTitleEl = document.getElementById('mvAudioBarTitle');
  const audioBarSubEl = document.getElementById('mvAudioBarSub');
  const audioBarPlayBtn = document.getElementById('mvAudioBarPlayBtn');
  const audioBarPrevBtn = document.getElementById('mvAudioBarPrevBtn');
  const audioBarNextBtn = document.getElementById('mvAudioBarNextBtn');
  const audioBarCloseBtn = document.getElementById('mvAudioBarCloseBtn');
  const audioSpeedBtn = document.getElementById('mvAudioSpeedBtn');
  const audioLoopBtn = document.getElementById('mvAudioLoopBtn');
  const audioMuteBtn = document.getElementById('mvAudioMuteBtn');
  const audioVolumeSlider = document.getElementById('mvAudioVolumeSlider');
  const audioVolumePct = document.getElementById('mvAudioVolumePct');
  const audioVolumeCluster = document.getElementById('mvAudioVolumeCluster');
  const audioProgressSlider = document.getElementById('mvAudioProgress');
  const audioCurrentTimeEl = document.getElementById('mvAudioCurrentTime');
  const audioDurationEl = document.getElementById('mvAudioDuration');

  // Helper: Toast Notifications
  let toastTimer = null;
  function showToast(msg, icon = '✓') {
    if (!toastEl) return;
    toastEl.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    toastEl.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  // Format Seconds to M:SS
  function formatTime(s) {
    if (isNaN(s) || s < 0 || !isFinite(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Audio URL Generator (Multi-Provider: EveryAyah & Al-Islam Tilawat CDN)
  function getAudioUrl(surah, ayah, reciterKey = currentReciter) {
    const reciter = RECITERS[reciterKey] || RECITERS.alafasy || RECITERS.ashiq;
    const sPad = String(surah).padStart(3, '0');
    const aPad = String(ayah).padStart(3, '0');
    if (reciter.provider === 'everyayah') {
      return `https://everyayah.com/data/${reciter.folder}/${sPad}${aPad}.mp3`;
    }
    return `https://files.alislam.cloud/audio/tilawat/${reciter.folder}/${sPad}-${aPad}-AR.mp3`;
  }

  // Fallback Audio URL Generator with Dual-CDN Redundancy
  function getFallbackAudioUrl(surah, ayah, reciterKey = currentReciter) {
    const sPad = String(surah).padStart(3, '0');
    const aPad = String(ayah).padStart(3, '0');
    const reciter = RECITERS[reciterKey];
    if (reciter && reciter.provider === 'everyayah') {
      return `https://files.alislam.cloud/audio/tilawat/ashiq/${sPad}-${aPad}-AR.mp3`;
    }
    return `https://everyayah.com/data/Alafasy_128kbps/${sPad}${aPad}.mp3`;
  }

  // Find any verse (canonical or bonus)
  function findVerseItem(idOrRef) {
    if (idOrRef === null || idOrRef === undefined) return null;
    if (typeof idOrRef === 'number' || (!isNaN(Number(idOrRef)) && !String(idOrRef).includes(':') && !String(idOrRef).startsWith('bonus-'))) {
      const numId = Number(idOrRef);
      const found = MASTER_VERSES_DATA.find(v => v.id === numId);
      if (found) return found;
      const bonusByNum = TOP_CROSS_REFERENCED_ADDITIONAL.find(b => b.bonusNumber === numId);
      if (bonusByNum) return bonusByNum;
    }
    const bonus = TOP_CROSS_REFERENCED_ADDITIONAL.find(b => b.id === idOrRef || b.verseRange === idOrRef);
    if (bonus) return bonus;
    return MASTER_VERSES_DATA.find(v => v.verseRange === idOrRef || `${v.surah}:${v.startAyah}` === idOrRef);
  }

  // Cleanup current audio object cleanly without DOM exceptions
  function cleanupAudio() {
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.ontimeupdate = null;
      currentAudio.onerror = null;
      currentAudio.onloadedmetadata = null;
      currentAudio.onloadstart = null;
      currentAudio.onwaiting = null;
      currentAudio.onplaying = null;
      currentAudio.oncanplay = null;
      try {
        currentAudio.pause();
      } catch (e) {}
      currentAudio.removeAttribute('src');
      try {
        currentAudio.load();
      } catch (e) {}
      currentAudio = null;
    }
    isBuffering = false;
  }

  // Stop Current Audio and close player bar
  function stopCurrentAudio() {
    cleanupAudio();
    isAudioPlaying = false;
    isBuffering = false;
    playingVerseId = null;
    playingAyahIndex = 0;
    updateAllAudioUI();
    if (audioBarEl) audioBarEl.classList.remove('is-visible');
    if (audioBarDiscEl) {
      audioBarDiscEl.classList.remove('is-spinning', 'is-buffering');
    }
    if (audioProgressSlider) {
      audioProgressSlider.value = 0;
      audioProgressSlider.style.setProperty('--progress-pct', '0%');
    }
    if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = '0:00';
    if (audioDurationEl) audioDurationEl.textContent = '0:00';
  }

  // Helper to determine list of verses currently in context
  function getActiveVerseList() {
    const filtered = getFilteredItems();
    if (filtered && filtered.length > 0) {
      if (playingVerseId !== null && filtered.some(v => String(v.id) === String(playingVerseId))) {
        return filtered;
      }
      if (!playingVerseId) {
        return filtered;
      }
    }
    return MASTER_VERSES_DATA;
  }

  // Update Media Session (Hardware keys, lock screen & notification controls)
  function updateMediaSession(item) {
    if (!('mediaSession' in navigator) || !item) return;
    try {
      const reciterName = RECITERS[currentReciter]?.name || 'Holy Quran Recitation';
      const ayahNum = item.audioVerses ? item.audioVerses[playingAyahIndex] : item.startAyah;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${item.surahName} (${item.verseRange})`,
        artist: `${reciterName} • Ayah ${ayahNum}`,
        album: 'Master Compilation of Quranic Verses (108 Verses)',
        artwork: [
          { src: 'assets/banners/quran-cover.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (playingVerseId !== null) togglePlayVerse(playingVerseId);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (playingVerseId !== null) togglePlayVerse(playingVerseId);
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrevAyah);
      navigator.mediaSession.setActionHandler('nexttrack', playNextAyah);
    } catch (e) {}
  }

  // Play Ayah Sequence
  function playVerse(verseId, ayahIndex = 0) {
    const item = findVerseItem(verseId);
    if (!item || !item.audioVerses || !item.audioVerses.length) {
      showToast('Verse recitation audio data not found', '⚠️');
      return;
    }

    if (ayahIndex < 0) ayahIndex = 0;
    if (ayahIndex >= item.audioVerses.length) ayahIndex = item.audioVerses.length - 1;

    // Check if resume is possible on same verse and same ayah
    if (String(playingVerseId) === String(verseId) && playingAyahIndex === ayahIndex && currentAudio) {
      if (currentAudio.paused) {
        currentAudio.playbackRate = currentSpeed;
        currentAudio.muted = isMuted;
        currentAudio.volume = isMuted ? 0 : currentVolume;
        currentAudio.play().then(() => {
          isAudioPlaying = true;
          isBuffering = false;
          updateAllAudioUI();
          updateAudioBar(item);
        }).catch(err => {
          if (err && err.name === 'AbortError') return;
          handleAudioError(err);
        });
        return;
      }
    }

    // Clean up existing audio instance without flashing bar
    cleanupAudio();

    // Pause global background quran player if active
    if (window.QuranPlayer && typeof window.QuranPlayer.pause === 'function') {
      try { window.QuranPlayer.pause(); } catch (e) {}
    }

    playingVerseId = verseId;
    playingAyahIndex = ayahIndex;
    isBuffering = true;
    const currentAyahNum = item.audioVerses[ayahIndex];
    const url = getAudioUrl(item.surah, currentAyahNum, currentReciter);
    let triedFallback = false;

    // Immediately present player bar with accurate metadata
    updateAudioBar(item);
    if (audioBarEl) audioBarEl.classList.add('is-visible');
    if (audioProgressSlider) {
      audioProgressSlider.value = 0;
      audioProgressSlider.style.setProperty('--progress-pct', '0%');
    }
    if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = '0:00';
    if (audioDurationEl) audioDurationEl.textContent = '0:00';
    updateAllAudioUI();

    const audio = new Audio();
    audio.preload = 'auto';
    audio.playbackRate = currentSpeed;
    audio.muted = isMuted;
    audio.volume = isMuted ? 0 : currentVolume;
    currentAudio = audio;

    audio.onloadstart = function () {
      if (audio !== currentAudio) return;
      isBuffering = true;
      updateAudioBar(item);
      updateAllAudioUI();
    };

    audio.onwaiting = function () {
      if (audio !== currentAudio) return;
      isBuffering = true;
      updateAudioBar(item);
      updateAllAudioUI();
    };

    audio.oncanplay = function () {
      if (audio !== currentAudio) return;
      isBuffering = false;
      updateAudioBar(item);
      updateAllAudioUI();
    };

    audio.onplaying = function () {
      if (audio !== currentAudio) return;
      isBuffering = false;
      isAudioPlaying = true;
      updateAudioBar(item);
      updateAllAudioUI();
    };

    audio.onloadedmetadata = function () {
      if (audio !== currentAudio) return;
      if (audioDurationEl && !isNaN(audio.duration) && audio.duration > 0) {
        audioDurationEl.textContent = formatTime(audio.duration);
      }
      audio.playbackRate = currentSpeed;
      audio.muted = isMuted;
      audio.volume = isMuted ? 0 : currentVolume;
    };

    audio.ontimeupdate = function () {
      if (audio !== currentAudio || isSeeking || isNaN(audio.duration) || audio.duration <= 0) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (audioProgressSlider) {
        audioProgressSlider.value = pct;
        audioProgressSlider.style.setProperty('--progress-pct', `${pct}%`);
      }
      if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = formatTime(audio.currentTime);
      if (audioDurationEl && (audioDurationEl.textContent === '0:00' || audioDurationEl.textContent === '')) {
        audioDurationEl.textContent = formatTime(audio.duration);
      }
    };

    const tryFallbackOrError = function (err) {
      if (audio !== currentAudio) return;
      if (!triedFallback) {
        triedFallback = true;
        console.warn('Primary recitation stream failed, trying fallback CDN for Surah', item.surah, 'Ayah', currentAyahNum);
        const fallbackUrl = getFallbackAudioUrl(item.surah, currentAyahNum, currentReciter);
        audio.src = fallbackUrl;
        audio.load();
        audio.play().then(() => {
          if (audio !== currentAudio) return;
          isAudioPlaying = true;
          isBuffering = false;
          updateAllAudioUI();
          updateAudioBar(item);
        }).catch(fErr => {
          if (audio !== currentAudio) return;
          if (fErr && fErr.name === 'AbortError') return;
          handleAudioError(fErr);
        });
      } else {
        handleAudioError(err);
      }
    };

    audio.onerror = function (e) {
      if (audio !== currentAudio) return;
      tryFallbackOrError(e);
    };

    audio.onended = function () {
      if (audio !== currentAudio) return;
      if (isLooping) {
        // Repeat this specific verse from first ayah
        playVerse(verseId, 0);
        return;
      }

      if (playingAyahIndex < item.audioVerses.length - 1) {
        // Advance to next Ayah in this verse
        playVerse(verseId, playingAyahIndex + 1);
      } else {
        // Finished all ayahs of this item
        if (autoAdvanceContinuous) {
          const list = getActiveVerseList();
          const currentIdx = list.findIndex(v => String(v.id) === String(playingVerseId));
          if (currentIdx !== -1 && currentIdx < list.length - 1) {
            const nextItem = list[currentIdx + 1];
            playVerse(nextItem.id, 0);
            setTimeout(() => {
              const card = document.getElementById(`verse-${nextItem.id}`);
              if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 140);
            return;
          }
        }
        stopCurrentAudio();
        showToast(`Completed recitation: ${item.surahName} (${item.verseRange})`, '🎵');
      }
    };

    audio.src = url;
    audio.play().then(() => {
      if (audio !== currentAudio) return;
      isAudioPlaying = true;
      isBuffering = false;
      updateAllAudioUI();
      updateAudioBar(item);
    }).catch(err => {
      if (audio !== currentAudio) return;
      if (err && err.name === 'AbortError') return;
      tryFallbackOrError(err);
    });
  }

  function togglePlayVerse(verseId) {
    if (String(playingVerseId) === String(verseId)) {
      if (isAudioPlaying) {
        if (currentAudio) currentAudio.pause();
        isAudioPlaying = false;
        isBuffering = false;
        updateAllAudioUI();
        if (audioBarDiscEl) audioBarDiscEl.classList.remove('is-spinning');
      } else if (currentAudio) {
        currentAudio.playbackRate = currentSpeed;
        currentAudio.muted = isMuted;
        currentAudio.volume = isMuted ? 0 : currentVolume;
        currentAudio.play().then(() => {
          isAudioPlaying = true;
          isBuffering = false;
          updateAllAudioUI();
          const item = findVerseItem(playingVerseId);
          if (item) updateAudioBar(item);
        }).catch(err => {
          if (err && err.name === 'AbortError') return;
          handleAudioError(err);
        });
      } else {
        playVerse(verseId, playingAyahIndex || 0);
      }
    } else {
      playVerse(verseId, 0);
    }
  }

  function playNextAyah() {
    if (playingVerseId === null) {
      const list = getActiveVerseList();
      if (list && list.length) playVerse(list[0].id, 0);
      return;
    }
    const item = findVerseItem(playingVerseId);
    if (!item) return;

    if (playingAyahIndex < item.audioVerses.length - 1) {
      playVerse(playingVerseId, playingAyahIndex + 1);
    } else {
      const list = getActiveVerseList();
      const currentIdx = list.findIndex(v => String(v.id) === String(playingVerseId));
      if (currentIdx !== -1 && currentIdx < list.length - 1) {
        const nextItem = list[currentIdx + 1];
        playVerse(nextItem.id, 0);
        setTimeout(() => {
          const card = document.getElementById(`verse-${nextItem.id}`);
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 140);
      } else if (currentIdx === -1 && typeof playingVerseId === 'number' && playingVerseId < MASTER_VERSES_DATA.length) {
        const nextItem = MASTER_VERSES_DATA.find(v => v.id === playingVerseId + 1);
        if (nextItem) playVerse(nextItem.id, 0);
      } else {
        showToast('Reached the end of the verses collection', '🏁');
      }
    }
  }

  function playPrevAyah() {
    if (playingVerseId === null) return;
    const item = findVerseItem(playingVerseId);
    if (!item) return;

    if (currentAudio && currentAudio.currentTime > 2) {
      currentAudio.currentTime = 0;
      if (audioProgressSlider) {
        audioProgressSlider.value = 0;
        audioProgressSlider.style.setProperty('--progress-pct', '0%');
      }
      if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = '0:00';
      return;
    }

    if (playingAyahIndex > 0) {
      playVerse(playingVerseId, playingAyahIndex - 1);
    } else {
      const list = getActiveVerseList();
      const currentIdx = list.findIndex(v => String(v.id) === String(playingVerseId));
      if (currentIdx > 0) {
        const prevItem = list[currentIdx - 1];
        playVerse(prevItem.id, 0);
        setTimeout(() => {
          const card = document.getElementById(`verse-${prevItem.id}`);
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 140);
      } else if (currentIdx === -1 && typeof playingVerseId === 'number' && playingVerseId > 1) {
        const prevItem = MASTER_VERSES_DATA.find(v => v.id === playingVerseId - 1);
        if (prevItem) playVerse(prevItem.id, 0);
      } else {
        showToast('At the first verse', '⏮');
      }
    }
  }

  function handleAudioError(e) {
    isAudioPlaying = false;
    isBuffering = false;
    updateAllAudioUI();
    showToast('Recitation audio stream temporarily unavailable for this Ayah', '⚠️');
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('mv_muted', String(isMuted));
    if (currentAudio) {
      currentAudio.muted = isMuted;
      currentAudio.volume = isMuted ? 0 : currentVolume;
    }
    updateMuteUI();
    showToast(isMuted ? 'Muted' : `Volume ${Math.round(currentVolume * 100)}%`, isMuted ? '🔇' : '🔊');
  }

  function updateMuteUI() {
    if (audioMuteBtn) {
      if (isMuted || currentVolume === 0) {
        audioMuteBtn.innerHTML = '🔇';
        audioMuteBtn.classList.add('is-muted');
        audioMuteBtn.setAttribute('title', 'Unmute (M)');
        audioMuteBtn.setAttribute('aria-label', 'Unmute');
      } else if (currentVolume < 0.45) {
        audioMuteBtn.innerHTML = '🔈';
        audioMuteBtn.classList.remove('is-muted');
        audioMuteBtn.setAttribute('title', 'Mute (M)');
        audioMuteBtn.setAttribute('aria-label', 'Mute');
      } else if (currentVolume < 0.8) {
        audioMuteBtn.innerHTML = '🔉';
        audioMuteBtn.classList.remove('is-muted');
        audioMuteBtn.setAttribute('title', 'Mute (M)');
        audioMuteBtn.setAttribute('aria-label', 'Mute');
      } else {
        audioMuteBtn.innerHTML = '🔊';
        audioMuteBtn.classList.remove('is-muted');
        audioMuteBtn.setAttribute('title', 'Mute (M)');
        audioMuteBtn.setAttribute('aria-label', 'Mute');
      }
    }
    if (audioVolumeSlider) {
      const displayVal = isMuted ? 0 : currentVolume;
      audioVolumeSlider.value = displayVal;
      const pct = Math.round(displayVal * 100);
      audioVolumeSlider.style.setProperty('--vol-pct', `${pct}%`);
      if (audioVolumePct) audioVolumePct.textContent = `${pct}%`;
    }
  }

  // Update Persistent Bottom Audio Bar
  function updateAudioBar(item) {
    if (!audioBarEl) return;
    audioBarEl.classList.add('is-visible');
    if (audioBarDiscEl) {
      audioBarDiscEl.classList.toggle('is-spinning', isAudioPlaying);
      audioBarDiscEl.classList.toggle('is-buffering', isBuffering);
    }
    if (audioBarTitleEl) {
      audioBarTitleEl.textContent = `${item.surahName} (${item.verseRange})`;
    }
    if (audioBarSubEl) {
      const ayahNum = item.audioVerses[playingAyahIndex];
      const totalAyahs = item.audioVerses.length;
      const reciterName = RECITERS[currentReciter]?.name || 'Qari';
      audioBarSubEl.innerHTML = `<span class="mv-sub-ayah">Ayah ${ayahNum} (${playingAyahIndex + 1}/${totalAyahs})</span> <span class="mv-sub-dot">•</span> <span class="mv-sub-reciter">🎙️ ${reciterName}</span>`;
    }
    if (audioBarPlayBtn) {
      if (isBuffering) {
        audioBarPlayBtn.innerHTML = '⏳';
        audioBarPlayBtn.classList.add('is-loading');
      } else {
        audioBarPlayBtn.innerHTML = isAudioPlaying ? '⏸' : '▶';
        audioBarPlayBtn.classList.remove('is-loading');
      }
      audioBarPlayBtn.setAttribute('title', isAudioPlaying ? 'Pause (Space)' : 'Play (Space)');
      audioBarPlayBtn.setAttribute('aria-label', isAudioPlaying ? 'Pause' : 'Play');
    }
    if (audioSpeedBtn) {
      audioSpeedBtn.textContent = `${currentSpeed}x`;
      audioSpeedBtn.classList.toggle('is-active', currentSpeed !== 1.0);
    }
    if (audioLoopBtn) {
      audioLoopBtn.innerHTML = isLooping ? '🔂 Repeat' : '🔁 Next';
      audioLoopBtn.classList.toggle('is-active', isLooping);
    }
    updateMuteUI();
    updateMediaSession(item);
  }

  // Update UI Elements during Audio Playback
  function updateAllAudioUI() {
    // Card and table drawer buttons
    document.querySelectorAll('.mv-play-recite-btn').forEach(btn => {
      const vId = btn.getAttribute('data-verse-id');
      const match = (String(vId) === String(playingVerseId) && isAudioPlaying);
      const isCardBuffering = (String(vId) === String(playingVerseId) && isBuffering);
      if (match) {
        btn.classList.add('is-active');
        btn.innerHTML = '<span>⏸</span> <span>Pause</span><span class="mv-playing-wave" aria-hidden="true"><span></span><span></span><span></span></span>';
      } else if (isCardBuffering) {
        btn.classList.add('is-active');
        btn.innerHTML = '<span>⏳</span> <span>Loading...</span>';
      } else {
        btn.classList.remove('is-active');
        btn.innerHTML = '<span>▶</span> <span>Listen</span>';
      }
    });

    // Cards highlight
    document.querySelectorAll('.mv-ayah-card').forEach(card => {
      const vId = card.getAttribute('data-id');
      if (String(vId) === String(playingVerseId) && isAudioPlaying) {
        card.classList.add('is-playing');
      } else {
        card.classList.remove('is-playing');
      }
    });

    // Table rows play button & active row highlight
    document.querySelectorAll('.mv-canonical-table tbody tr[data-verse-id]').forEach(row => {
      const vId = row.getAttribute('data-verse-id');
      const isMatch = (String(vId) === String(playingVerseId) && isAudioPlaying);
      row.classList.toggle('is-playing-row', isMatch);
      const btn = row.querySelector('.mv-table-play-btn');
      if (btn) {
        btn.innerHTML = isMatch ? '⏸' : '▶';
        btn.classList.toggle('is-active', isMatch);
      }
    });

    // Persistent bar play button
    if (audioBarPlayBtn) {
      if (isBuffering) {
        audioBarPlayBtn.innerHTML = '⏳';
        audioBarPlayBtn.classList.add('is-loading');
      } else {
        audioBarPlayBtn.innerHTML = isAudioPlaying ? '⏸' : '▶';
        audioBarPlayBtn.classList.remove('is-loading');
      }
      audioBarPlayBtn.setAttribute('title', isAudioPlaying ? 'Pause (Space)' : 'Play (Space)');
      audioBarPlayBtn.setAttribute('aria-label', isAudioPlaying ? 'Pause' : 'Play');
    }

    // Modal play button if open
    const mPlay = document.getElementById('modalPlayBtn');
    if (mPlay && bonusModalEl && bonusModalEl.classList.contains('is-active')) {
      const modalVerseId = mPlay.getAttribute('data-verse-id');
      const match = (String(modalVerseId) === String(playingVerseId) && isAudioPlaying);
      mPlay.classList.toggle('is-active', match);
      mPlay.innerHTML = `<span>${match ? '⏸' : '▶'}</span> <span>${match ? 'Pause' : 'Listen'}</span>`;
    }
  }

  // Favorites Management
  function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    if (idx > -1) {
      favorites.splice(idx, 1);
      showToast('Removed from bookmarks', '☆');
    } else {
      favorites.push(id);
      showToast('Saved to your bookmarks', '★');
    }
    localStorage.setItem('mv_favorites', JSON.stringify(favorites));
    updateBookmarksCountBadge();
    renderCategoryPills();
    render();
  }

  function updateBookmarksCountBadge() {
    if (bookmarksCountLabel) {
      bookmarksCountLabel.textContent = `Saved (${favorites.length})`;
    }
    if (bookmarksToggleBtn) {
      bookmarksToggleBtn.classList.toggle('is-active', activeCategory === 'favorites');
    }
  }

  // Copy to Clipboard
  function copyVerse(item) {
    const text = `【 ${item.surahName} (${item.verseRange}) — ${item.surahNameAr} 】\n${item.arabic}\n\n[Transliteration]\n${item.transliteration}\n\n[Translation]\n${item.translation}\n\n[Reference]\nTopic: ${item.topic} | Source: ${item.sourceBook}\nVia HeyNuo: https://heynuo.github.io/quran-verses.html#verse-${item.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Ayah, translation & citation copied!', '📋');
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Ayah copied to clipboard!', '📋');
    } catch (e) {
      showToast('Unable to copy to clipboard', '⚠️');
    }
    document.body.removeChild(ta);
  }

  // Share Verse (Native Web Share or Formatted Copy)
  function shareVerse(item) {
    const shareData = {
      title: `${item.surahName} (${item.verseRange}) — HeyNuo 108 Quranic Verses`,
      text: `【 ${item.surahName} (${item.verseRange}) — ${item.surahNameAr} 】\n${item.arabic}\n\n"${item.translation}"\n\nTopic: ${item.topic}\nSource: ${item.sourceBook}`,
      url: `https://heynuo.github.io/quran-verses.html#verse-${item.id}`
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      copyVerse(item);
      showToast('Ayah copied ready to share!', '📤');
    }
  }

  // Clean / normalize query string for tolerant search
  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[’'"`\-]/g, '')
      .replace(/[\u064B-\u065F\u0670]/g, '') // strip Arabic diacritics
      .trim();
  }

  // Filter Items
  function getFilteredItems() {
    return MASTER_VERSES_DATA.filter(item => {
      // Category / Theme filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (activeCategory !== 'all') {
        if (item.category !== activeCategory) return false;
      }

      // Surah Filter
      if (selectedSurah !== 'all') {
        if (String(item.surah) !== selectedSurah) return false;
      }

      // Source Book Filter
      if (activeSource !== 'all') {
        if (!item.sourceBook.toLowerCase().includes(activeSource.toLowerCase())) return false;
      }

      // Search Query filter
      if (searchQuery) {
        const rawQ = searchQuery.toLowerCase().trim();
        const normQ = normalizeText(rawQ);

        // Direct reference matches
        if (item.verseRange.includes(rawQ) || item.verseRange.toLowerCase().includes(rawQ)) return true;
        if (String(item.surah) === rawQ) return true;
        if (`${item.surah}:${item.startAyah}` === rawQ) return true;

        // Tolerant text matches
        const normSurah = normalizeText(item.surahName);
        const normTopic = normalizeText(item.topic);
        const normSource = normalizeText(item.sourceBook);
        const normTrans = normalizeText(item.translation);
        const normTr = normalizeText(item.transliteration);
        const normAr = normalizeText(item.arabic);

        // Handle variations (e.g. baqarah vs baqara, fatihah vs faatiha)
        const matchSurah = normSurah.includes(normQ) || (normQ === 'baqarah' && normSurah.includes('baqara')) || (normQ === 'fatihah' && normSurah.includes('faatiha'));
        const matchTopic = normTopic.includes(normQ);
        const matchSource = normSource.includes(normQ);
        const matchTrans = normTrans.includes(normQ);
        const matchTr = normTr.includes(normQ);
        const matchAr = normAr.includes(normQ) || item.arabic.includes(rawQ);

        return matchSurah || matchTopic || matchSource || matchTrans || matchTr || matchAr;
      }

      return true;
    });
  }

  // Open Bonus Verses Modal
  function openBonusModal(item) {
    if (!bonusModalEl || !bonusModalContent) return;

    const isFav = favorites.includes(item.id);
    const isPlaying = (item.id === playingVerseId && isAudioPlaying);

    bonusModalContent.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
        <span class="mv-top10-rank-pill" style="font-size:0.9rem;">⭐ ${item.bonusNumber ? `Bonus Ayah #${item.bonusNumber}` : 'Special Ayah'}</span>
        <span class="mv-theme-tag">${escapeHtml(item.category)}</span>
      </div>

      <h3 style="font-family:var(--font-display); font-size:1.6rem; font-weight:800; color:var(--text); margin-bottom:4px;">
        ${escapeHtml(item.surahName)} (${item.verseRange}) — ${escapeHtml(item.surahNameAr)}
      </h3>
      <p style="font-size:0.88rem; color:var(--muted); margin-bottom:18px;">
        ${escapeHtml(item.topic)} • <em>${escapeHtml(item.sourceBook)}</em>
      </p>

      <div class="mv-sacred-arabic" lang="ar" dir="rtl" style="margin-bottom:16px;">
        ${escapeHtml(item.arabic)}
      </div>

      <div class="mv-phonetic-translit" style="margin-bottom:14px;">
        ${escapeHtml(item.transliteration)}
      </div>

      <div class="mv-english-meaning" style="margin-bottom:26px;">
        ${escapeHtml(item.translation)}
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; border-top:1px solid var(--border); padding-top:18px;">
        <div style="display:flex; gap:10px;">
          <button type="button" class="mv-play-recite-btn ${isPlaying ? 'is-active' : ''}" id="modalPlayBtn" data-verse-id="${item.id}">
            <span>${isPlaying ? '⏸' : '▶'}</span> <span>${isPlaying ? 'Pause' : 'Listen'}</span>
          </button>
          <button type="button" class="mv-action-icon-btn" id="modalCopyBtn" title="Copy Ayah">📋</button>
          <button type="button" class="mv-action-icon-btn" id="modalShareBtn" title="Share Ayah">📤</button>
          <button type="button" class="mv-action-icon-btn ${isFav ? 'is-bookmarked' : ''}" id="modalFavBtn">
            ${isFav ? '★' : '☆'}
          </button>
        </div>
        <a href="${escapeHtml(item.alislamAppUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding:8px 16px; font-size:0.85rem;">
          Al-Islam App ↗
        </a>
      </div>
    `;

    bonusModalEl.classList.add('is-active');

    // Attach modal events
    const mPlay = document.getElementById('modalPlayBtn');
    if (mPlay) {
      mPlay.addEventListener('click', () => {
        togglePlayVerse(item.id);
      });
    }

    const mCopy = document.getElementById('modalCopyBtn');
    if (mCopy) {
      mCopy.addEventListener('click', () => copyVerse(item));
    }

    const mShare = document.getElementById('modalShareBtn');
    if (mShare) {
      mShare.addEventListener('click', () => shareVerse(item));
    }

    const mFav = document.getElementById('modalFavBtn');
    if (mFav) {
      mFav.addEventListener('click', () => {
        toggleFavorite(item.id);
        const isFavNow = favorites.includes(item.id);
        mFav.classList.toggle('is-bookmarked', isFavNow);
        mFav.innerHTML = isFavNow ? '★' : '☆';
      });
    }
  }

  function closeBonusModal() {
    if (bonusModalEl) bonusModalEl.classList.remove('is-active');
  }

  // Discover Random Ayah
  function discoverRandomAyah() {
    const randIdx = Math.floor(Math.random() * MASTER_VERSES_DATA.length);
    const item = MASTER_VERSES_DATA[randIdx];

    // Reset restrictive filters to ensure card is in DOM
    activeCategory = 'all';
    selectedSurah = 'all';
    activeSource = 'all';
    searchQuery = '';
    if (searchInputEl) searchInputEl.value = '';
    if (searchClearBtnEl) searchClearBtnEl.classList.remove('active');
    if (surahSelectEl) surahSelectEl.value = 'all';
    if (sourceSelectEl) sourceSelectEl.value = 'all';
    renderCategoryPills();

    // Switch to Cards View
    if (currentView !== 'cards') {
      currentView = 'cards';
      localStorage.setItem('mv_view', 'cards');
      if (viewCardsBtn) viewCardsBtn.classList.add('active');
      if (viewTableBtn) viewTableBtn.classList.remove('active');
    }

    render();

    setTimeout(() => {
      const card = document.getElementById(`verse-${item.id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.remove('is-highlighted');
        void card.offsetWidth;
        card.classList.add('is-highlighted');
        showToast(`Random Discovery: ${item.surahName} (${item.verseRange})`, '🎲');
      }
    }, 140);
  }

  // Render Top 10 Showcase (Page 12 of PDF)
  function renderTop10() {
    if (!top10GridEl) return;

    top10GridEl.innerHTML = TOP_10_METADATA.map(t => {
      const isTop1 = (t.rank === 1);
      return `
        <div class="mv-top10-card-item ${isTop1 ? 'is-rank-1' : ''}" data-target-id="${t.targetId}" data-ref="${escapeHtml(t.ref)}" title="Click to view and listen to ${escapeHtml(t.ref)}">
          <div class="mv-top10-head-row">
            <span class="mv-top10-rank-pill ${isTop1 ? 'rank-1' : ''}">${isTop1 ? '👑 #1 SUPREME' : '#' + t.rank}</span>
            <span class="mv-top10-frequency">${escapeHtml(t.count)}</span>
          </div>
          <h4>${escapeHtml(t.ref)}</h4>
          <p>${escapeHtml(t.note)}</p>
          <span class="mv-top10-bottom-link">${String(t.targetId).startsWith('bonus-') ? 'Open Showcase ↗' : 'Jump to Ayah ↓'}</span>
        </div>
      `;
    }).join('');

    // Event listener for Top 10 cards: Jump and highlight
    top10GridEl.querySelectorAll('.mv-top10-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-target-id');
        const refName = card.getAttribute('data-ref');

        if (targetId.startsWith('bonus-')) {
          const item = findVerseItem(targetId);
          if (item) openBonusModal(item);
          return;
        }

        const numId = Number(targetId);
        const item = findVerseItem(numId);
        if (!item) return;

        // Reset restrictive filters to ensure card is rendered
        if (activeCategory !== 'all' && activeCategory !== item.category && activeCategory !== 'favorites') {
          activeCategory = 'all';
          renderCategoryPills();
        }
        if (selectedSurah !== 'all' && Number(selectedSurah) !== item.surah) {
          selectedSurah = 'all';
          if (surahSelectEl) surahSelectEl.value = 'all';
        }
        if (activeSource !== 'all') {
          activeSource = 'all';
          if (sourceSelectEl) sourceSelectEl.value = 'all';
        }
        if (searchQuery) {
          searchQuery = '';
          if (searchInputEl) searchInputEl.value = '';
          if (searchClearBtnEl) searchClearBtnEl.classList.remove('active');
        }

        // Switch to Cards view if in Table view
        if (currentView !== 'cards') {
          currentView = 'cards';
          localStorage.setItem('mv_view', 'cards');
          if (viewCardsBtn) viewCardsBtn.classList.add('active');
          if (viewTableBtn) viewTableBtn.classList.remove('active');
        }

        render();

        // Smooth scroll and pulse highlight
        setTimeout(() => {
          const targetCard = document.getElementById(`verse-${numId}`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.classList.remove('is-highlighted');
            void targetCard.offsetWidth;
            targetCard.classList.add('is-highlighted');
            showToast(`Navigated to ${refName}`, '⭐');
          }
        }, 120);
      });
    });
  }

  // Setup Thematic Taxonomy Cards (Page 3 of PDF)
  function setupThematicTaxonomy() {
    document.querySelectorAll('.mv-taxonomy-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-category');
        if (cat) {
          activeCategory = cat;
          renderCategoryPills();
          render();
          const explorer = document.getElementById('explorer');
          if (explorer) {
            explorer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          showToast(`Filtered by ${cat}`, '🗂️');
        }
      });
    });
  }

  // Populate Surah Select Dropdown
  function populateSurahSelect() {
    if (!surahSelectEl) return;

    const surahMap = new Map();
    MASTER_VERSES_DATA.forEach(v => {
      if (!surahMap.has(v.surah)) {
        surahMap.set(v.surah, { id: v.surah, name: v.surahName, ar: v.surahNameAr });
      }
    });

    const options = [
      '<option value="all">✨ All 44 Surahs</option>'
    ];

    Array.from(surahMap.values())
      .sort((a, b) => a.id - b.id)
      .forEach(s => {
        options.push(`<option value="${s.id}">${s.id}. ${s.name} (${s.ar})</option>`);
      });

    surahSelectEl.innerHTML = options.join('');
    surahSelectEl.addEventListener('change', () => {
      selectedSurah = surahSelectEl.value;
      render();
    });
  }

  // Populate Source Select Dropdown
  function setupSourceSelect() {
    if (!sourceSelectEl) return;
    sourceSelectEl.addEventListener('change', () => {
      activeSource = sourceSelectEl.value;
      render();
    });
  }

  // Setup Display Mode Selector
  function setupDisplayMode() {
    if (!displayModeSelect) return;
    displayModeSelect.value = displayMode;
    applyDisplayMode(displayMode);

    displayModeSelect.addEventListener('change', () => {
      displayMode = displayModeSelect.value;
      localStorage.setItem('mv_display_mode', displayMode);
      applyDisplayMode(displayMode);
      showToast(`Display mode updated`, '👁️');
    });
  }

  function applyDisplayMode(mode) {
    if (!cardsGridEl) return;
    cardsGridEl.classList.remove('mv-mode-all', 'mv-mode-aren', 'mv-mode-ar', 'mv-mode-en');
    cardsGridEl.classList.add(`mv-mode-${mode}`);
  }

  // Render Category Filter Chips
  function renderCategoryPills() {
    if (!filterStripEl) return;

    const categories = [
      { key: 'all', label: '✨ All 108 Verses', count: MASTER_VERSES_DATA.length },
      { key: 'Protection & Ruqyah (Healing)', label: '🛡️ Ruqyah & Healing', count: countCat('Protection & Ruqyah (Healing)') },
      { key: 'Anti-Sorcery & Breaking Magic', label: '⚔️ Anti-Sorcery', count: countCat('Anti-Sorcery & Breaking Magic') },
      { key: 'Tawheed (Oneness of Allah)', label: '☝️ Tawheed', count: countCat('Tawheed (Oneness of Allah)') },
      { key: 'Jinn & the Unseen World', label: '🌌 Jinn & The Unseen', count: countCat('Jinn & the Unseen World') },
      { key: 'Evil Eye & Envy', label: '👁️ Evil Eye & Envy', count: countCat('Evil Eye & Envy') },
      { key: 'Ism-e-Azam (Greatest Names of Allah)', label: '👑 Ism-e-Azam', count: countCat('Ism-e-Azam (Greatest Names of Allah)') },
      { key: 'Signs & Creation', label: '🌍 Signs & Creation', count: countCat('Signs & Creation') },
      { key: 'General Exegesis & Faith', label: '📖 Faith & Exegesis', count: countCat('General Exegesis & Faith') },
      { key: 'favorites', label: '★ Bookmarks', count: favorites.length }
    ];

    filterStripEl.innerHTML = categories.map(c => `
      <button
        type="button"
        class="mv-chip ${activeCategory === c.key ? 'active' : ''}"
        data-cat="${escapeHtml(c.key)}"
      >
        <span>${c.label}</span>
        <span class="mv-chip-badge">${c.count}</span>
      </button>
    `).join('');

    filterStripEl.querySelectorAll('.mv-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        renderCategoryPills();
        updateBookmarksCountBadge();
        render();
      });
    });
  }

  function countCat(name) {
    return MASTER_VERSES_DATA.filter(v => v.category === name).length;
  }

  // Render Cards Grid View
  function renderCards(items) {
    if (!cardsGridEl) return;
    cardsGridEl.innerHTML = items.map(item => {
      const isFav = favorites.includes(item.id);
      const isPlaying = (item.id === playingVerseId && isAudioPlaying);

      return `
        <article class="mv-ayah-card ${isPlaying ? 'is-playing' : ''}" id="verse-${item.id}" data-id="${item.id}" data-surah="${item.surah}">
          <div>
            <div class="mv-card-top-row">
              <div class="mv-card-title-lockup">
                <div class="mv-medallion-badge">#${item.id}</div>
                <div class="mv-surah-meta-names">
                  <h3>
                    ${escapeHtml(item.surahName)}
                    <span class="mv-verse-tag">(${item.verseRange})</span>
                  </h3>
                  <div class="mv-surah-arabic-sub">${escapeHtml(item.surahNameAr)} • ${escapeHtml(item.surahTranslation)}</div>
                </div>
              </div>

              <div class="mv-badges-col">
                ${item.isTopCrossReferenced ? `<span class="mv-top10-star-tag" title="Top cross-referenced in analyzed books">★ ${item.crossReferenced || 'Top 10'}</span>` : ''}
                <span class="mv-theme-tag" title="${escapeHtml(item.category)}">${escapeHtml(item.category)}</span>
              </div>
            </div>

            <div class="mv-context-strip">
              <span><strong>Context:</strong> ${escapeHtml(item.topic)}</span>
              <span class="mv-source-ref">${escapeHtml(item.sourceBook)}</span>
            </div>

            <div class="mv-sacred-arabic" lang="ar" dir="rtl">
              ${escapeHtml(item.arabic)}
            </div>

            <div class="mv-phonetic-translit">
              ${escapeHtml(item.transliteration)}
            </div>

            <div class="mv-english-meaning">
              ${escapeHtml(item.translation)}
            </div>
          </div>

          <div class="mv-card-footer">
            <div class="mv-controls-cluster">
              <button
                type="button"
                class="mv-play-recite-btn ${isPlaying ? 'is-active' : ''}"
                data-verse-id="${item.id}"
                aria-label="Play recitation for ${escapeHtml(item.surahName)} ${item.verseRange}"
              >
                <span>${isPlaying ? '⏸' : '▶'}</span>
                <span>${isPlaying ? 'Pause' : 'Listen'}</span>
              </button>

              <button
                type="button"
                class="mv-action-icon-btn mv-copy-action-btn"
                data-verse-id="${item.id}"
                title="Copy Arabic, transliteration & English translation"
                aria-label="Copy verse"
              >
                📋
              </button>

              <button
                type="button"
                class="mv-action-icon-btn mv-share-action-btn"
                data-verse-id="${item.id}"
                title="Share this Ayah"
                aria-label="Share verse"
              >
                📤
              </button>

              <button
                type="button"
                class="mv-action-icon-btn ${isFav ? 'is-bookmarked' : ''} mv-bookmark-action-btn"
                data-verse-id="${item.id}"
                title="${isFav ? 'Remove from bookmarks' : 'Add to bookmarks'}"
                aria-label="Bookmark verse"
              >
                ${isFav ? '★' : '☆'}
              </button>
            </div>

            <a
              href="${escapeHtml(item.alislamAppUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="mv-external-app-link"
              title="Open full commentary and word-by-word on Al-Islam"
            >
              <span>Al-Islam App</span> ↗
            </a>
          </div>
        </article>
      `;
    }).join('');

    attachCardEventListeners();
  }

  // Render Canonical Master Table View (PDF Pages 4–11)
  function renderTable(items) {
    if (!tableBodyEl) return;

    tableBodyEl.innerHTML = items.map(item => {
      const isExpanded = (expandedTableRowId === item.id);
      const isFav = favorites.includes(item.id);
      const isPlaying = (item.id === playingVerseId && isAudioPlaying);

      let rowHtml = `
        <tr data-verse-id="${item.id}" class="${isExpanded ? 'is-expanded-row' : ''}">
          <td class="mv-col-index"><strong>${item.id}</strong></td>
          <td class="mv-col-surah-id">${item.surah}</td>
          <td class="mv-col-surah-title">${escapeHtml(item.surahName)}</td>
          <td class="mv-col-verse-range">${escapeHtml(item.verseRange)}</td>
          <td class="mv-col-topic-content">
            <div style="font-weight:700;">${escapeHtml(item.topic)}</div>
            <div style="font-size:0.78rem; color:var(--muted); margin-top:2px;">${escapeHtml(item.category)}</div>
          </td>
          <td class="mv-col-source-text">${escapeHtml(item.sourceBook)}</td>
          <td class="mv-col-action-btns">
            <button
              type="button"
              class="mv-action-icon-btn mv-table-play-btn"
              data-verse-id="${item.id}"
              title="Listen to recitation"
              style="width:36px; height:36px;"
            >
              ${isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              class="mv-action-icon-btn mv-table-expand-btn"
              data-verse-id="${item.id}"
              title="View full text and translation"
              style="width:36px; height:36px;"
            >
              ${isExpanded ? '▲' : '▼'}
            </button>
          </td>
        </tr>
      `;

      if (isExpanded) {
        rowHtml += `
          <tr class="mv-table-drawer-row">
            <td colspan="7">
              <div class="mv-drawer-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
                  <h4 style="margin:0; font-family:var(--font-display); font-size:1.2rem; font-weight:800;">
                    ${escapeHtml(item.surahName)} (${item.verseRange}) — ${escapeHtml(item.surahNameAr)}
                  </h4>
                  <div style="display:flex; gap:8px;">
                    <button type="button" class="mv-play-recite-btn ${isPlaying ? 'is-active' : ''}" data-verse-id="${item.id}">
                      <span>${isPlaying ? '⏸' : '▶'}</span> <span>${isPlaying ? 'Pause' : 'Listen'}</span>
                    </button>
                    <button type="button" class="mv-action-icon-btn mv-copy-action-btn" data-verse-id="${item.id}" title="Copy">📋</button>
                    <button type="button" class="mv-action-icon-btn mv-share-action-btn" data-verse-id="${item.id}" title="Share">📤</button>
                    <button type="button" class="mv-action-icon-btn ${isFav ? 'is-bookmarked' : ''} mv-bookmark-action-btn" data-verse-id="${item.id}">
                      ${isFav ? '★' : '☆'}
                    </button>
                    <a href="${escapeHtml(item.alislamAppUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding:6px 14px; font-size:0.8rem;">
                      Al-Islam App ↗
                    </a>
                  </div>
                </div>

                <div class="mv-sacred-arabic" lang="ar" dir="rtl" style="margin-bottom:14px; font-size:1.6rem;">
                  ${escapeHtml(item.arabic)}
                </div>

                <div class="mv-phonetic-translit" style="margin-bottom:10px;">
                  ${escapeHtml(item.transliteration)}
                </div>

                <div class="mv-english-meaning" style="margin-bottom:0;">
                  ${escapeHtml(item.translation)}
                </div>
              </div>
            </td>
          </tr>
        `;
      }

      return rowHtml;
    }).join('');

    attachTableEventListeners();
  }

  // Attach Event Listeners to Cards
  function attachCardEventListeners() {
    document.querySelectorAll('.mv-verses-grid-container .mv-play-recite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        togglePlayVerse(id);
      });
    });

    document.querySelectorAll('.mv-verses-grid-container .mv-copy-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        const item = findVerseItem(id);
        if (item) copyVerse(item);
      });
    });

    document.querySelectorAll('.mv-verses-grid-container .mv-share-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        const item = findVerseItem(id);
        if (item) shareVerse(item);
      });
    });

    document.querySelectorAll('.mv-verses-grid-container .mv-bookmark-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        toggleFavorite(id);
      });
    });
  }

  // Attach Event Listeners to Table
  function attachTableEventListeners() {
    document.querySelectorAll('.mv-table-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        togglePlayVerse(id);
      });
    });

    document.querySelectorAll('.mv-table-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        expandedTableRowId = (expandedTableRowId === id) ? null : id;
        render();
      });
    });

    document.querySelectorAll('.mv-master-table-wrapper .mv-copy-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        const item = findVerseItem(id);
        if (item) copyVerse(item);
      });
    });

    document.querySelectorAll('.mv-master-table-wrapper .mv-share-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        const item = findVerseItem(id);
        if (item) shareVerse(item);
      });
    });

    document.querySelectorAll('.mv-master-table-wrapper .mv-bookmark-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        toggleFavorite(id);
      });
    });

    document.querySelectorAll('.mv-master-table-wrapper .mv-play-recite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawId = btn.getAttribute('data-verse-id');
        const id = (rawId && isNaN(Number(rawId))) ? rawId : Number(rawId);
        togglePlayVerse(id);
      });
    });
  }

  // Master Render Loop
  function render() {
    const filtered = getFilteredItems();

    // Results Counter
    if (resultsCountEl) {
      resultsCountEl.textContent = `${filtered.length} of ${MASTER_VERSES_DATA.length}`;
    }

    // Empty State Handling
    if (filtered.length === 0) {
      if (emptyStateEl) emptyStateEl.classList.add('is-visible');
      if (cardsGridEl) cardsGridEl.style.display = 'none';
      if (tableWrapEl) tableWrapEl.style.display = 'none';
      return;
    } else {
      if (emptyStateEl) emptyStateEl.classList.remove('is-visible');
    }

    // View Switching
    if (currentView === 'cards') {
      if (cardsGridEl) cardsGridEl.style.display = 'grid';
      if (tableWrapEl) tableWrapEl.style.display = 'none';
      renderCards(filtered);
    } else {
      if (cardsGridEl) cardsGridEl.style.display = 'none';
      if (tableWrapEl) tableWrapEl.style.display = 'block';
      renderTable(filtered);
    }

    updateBookmarksCountBadge();
    applyArabicFontSize(arabicFontScale);
    applyDisplayMode(displayMode);
  }

  // Arabic Font Size Resizer Controller
  function setupFontSizeController() {
    applyArabicFontSize(arabicFontScale);

    if (fontDecBtn) {
      fontDecBtn.addEventListener('click', () => adjustArabicFontSize(-10));
    }
    if (fontIncBtn) {
      fontIncBtn.addEventListener('click', () => adjustArabicFontSize(10));
    }
  }

  function adjustArabicFontSize(delta) {
    let nextScale = arabicFontScale + delta;
    if (nextScale < 80) nextScale = 80;
    if (nextScale > 150) nextScale = 150;
    arabicFontScale = nextScale;
    localStorage.setItem('mv_font_scale', String(arabicFontScale));
    applyArabicFontSize(arabicFontScale);
    showToast(`Arabic Font: ${arabicFontScale}%`, '🔤');
  }

  function applyArabicFontSize(scale) {
    if (fontValEl) fontValEl.textContent = `${scale}%`;
    const baseRem = 1.85;
    const computedRem = (baseRem * (scale / 100)).toFixed(2);
    document.documentElement.style.setProperty('--mv-arabic-font-size', `${computedRem}rem`);
  }

  // Setup View Mode Switcher
  function setupViewSwitcher() {
    if (viewCardsBtn) {
      viewCardsBtn.addEventListener('click', () => {
        currentView = 'cards';
        localStorage.setItem('mv_view', 'cards');
        viewCardsBtn.classList.add('active');
        if (viewTableBtn) viewTableBtn.classList.remove('active');
        render();
      });
    }

    if (viewTableBtn) {
      viewTableBtn.addEventListener('click', () => {
        currentView = 'table';
        localStorage.setItem('mv_view', 'table');
        viewTableBtn.classList.add('active');
        if (viewCardsBtn) viewCardsBtn.classList.remove('active');
        render();
      });
    }

    if (tocTableJump) {
      tocTableJump.addEventListener('click', (e) => {
        currentView = 'table';
        localStorage.setItem('mv_view', 'table');
        if (viewTableBtn) viewTableBtn.classList.add('active');
        if (viewCardsBtn) viewCardsBtn.classList.remove('active');
        render();
      });
    }
  }

  // Setup Live Instant Search
  function setupSearch() {
    if (!searchInputEl) return;

    searchInputEl.addEventListener('input', () => {
      searchQuery = searchInputEl.value.trim();
      if (searchClearBtnEl) {
        searchClearBtnEl.classList.toggle('active', searchQuery.length > 0);
      }
      render();
    });

    if (searchClearBtnEl) {
      searchClearBtnEl.addEventListener('click', () => {
        searchInputEl.value = '';
        searchQuery = '';
        searchClearBtnEl.classList.remove('active');
        searchInputEl.focus();
        render();
      });
    }
  }

  // Setup Reciter Selector
  function setupReciter() {
    if (!reciterSelectEl) return;
    reciterSelectEl.value = currentReciter;
    reciterSelectEl.addEventListener('change', () => {
      currentReciter = reciterSelectEl.value;
      localStorage.setItem('mv_reciter', currentReciter);
      showToast(`Reciter set to ${RECITERS[currentReciter]?.name || currentReciter}`, '🎙️');
      if (isAudioPlaying && playingVerseId) {
        playVerse(playingVerseId, playingAyahIndex);
      }
    });
  }

  // Setup Autoplay Continuous Switch
  function setupAutoplay() {
    if (!autoAdvanceBtnEl) return;
    autoAdvanceBtnEl.classList.toggle('active', autoAdvanceContinuous);
    autoAdvanceBtnEl.addEventListener('click', () => {
      autoAdvanceContinuous = !autoAdvanceContinuous;
      localStorage.setItem('mv_autoadvance', String(autoAdvanceContinuous));
      autoAdvanceBtnEl.classList.toggle('active', autoAdvanceContinuous);
      showToast(autoAdvanceContinuous ? 'Continuous auto-play enabled' : 'Continuous auto-play disabled', '🔁');
    });
  }

  // Setup PDF Viewer Toggle
  function setupPdfViewer() {
    if (!pdfToggleBtn || !pdfViewerWrap) return;

    pdfToggleBtn.addEventListener('click', () => {
      const isVisible = pdfViewerWrap.classList.contains('active');
      if (isVisible) {
        pdfViewerWrap.classList.remove('active');
        pdfToggleBtn.innerHTML = '<span>📑</span> View PDF In-Browser';
      } else {
        pdfViewerWrap.classList.add('active');
        pdfToggleBtn.innerHTML = '<span>✕</span> Close PDF Preview';
        pdfViewerWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    const closeViewerBtn = document.getElementById('mvCloseViewerBtn');
    if (closeViewerBtn) {
      closeViewerBtn.addEventListener('click', () => {
        pdfViewerWrap.classList.remove('active');
        if (pdfToggleBtn) pdfToggleBtn.innerHTML = '<span>📑</span> View PDF In-Browser';
      });
    }
  }

  // Setup Bottom Audio Bar Controls & Scrubber
  function setupAudioBar() {
    updateMuteUI();

    if (audioBarPlayBtn) {
      audioBarPlayBtn.addEventListener('click', () => {
        if (playingVerseId !== null) {
          togglePlayVerse(playingVerseId);
        } else {
          const list = getActiveVerseList();
          if (list && list.length) {
            playVerse(list[0].id, 0);
          }
        }
      });
    }

    if (audioBarPrevBtn) {
      audioBarPrevBtn.addEventListener('click', playPrevAyah);
    }

    if (audioBarNextBtn) {
      audioBarNextBtn.addEventListener('click', playNextAyah);
    }

    if (audioBarCloseBtn) {
      audioBarCloseBtn.addEventListener('click', stopCurrentAudio);
    }

    if (audioMuteBtn) {
      audioMuteBtn.addEventListener('click', toggleMute);
    }

    // Volume Slider & Flyout Control
    if (audioVolumeSlider) {
      const initialVol = isMuted ? 0 : currentVolume;
      audioVolumeSlider.value = initialVol;
      const initialPct = Math.round(initialVol * 100);
      audioVolumeSlider.style.setProperty('--vol-pct', `${initialPct}%`);
      if (audioVolumePct) audioVolumePct.textContent = `${initialPct}%`;

      audioVolumeSlider.addEventListener('input', () => {
        const val = parseFloat(audioVolumeSlider.value);
        currentVolume = val;
        isMuted = (val === 0);
        localStorage.setItem('mv_volume', String(currentVolume));
        localStorage.setItem('mv_muted', String(isMuted));
        if (currentAudio) {
          currentAudio.volume = isMuted ? 0 : currentVolume;
          currentAudio.muted = isMuted;
        }
        updateMuteUI();
      });
    }

    if (audioSpeedBtn) {
      audioSpeedBtn.textContent = `${currentSpeed}x`;
      audioSpeedBtn.classList.toggle('is-active', currentSpeed !== 1.0);
      audioSpeedBtn.addEventListener('click', () => {
        const speeds = [0.75, 1.0, 1.25, 1.5];
        let idx = speeds.indexOf(currentSpeed);
        currentSpeed = speeds[(idx + 1) % speeds.length];
        localStorage.setItem('mv_speed', String(currentSpeed));
        audioSpeedBtn.textContent = `${currentSpeed}x`;
        audioSpeedBtn.classList.toggle('is-active', currentSpeed !== 1.0);
        if (currentAudio) currentAudio.playbackRate = currentSpeed;
        showToast(`Recitation speed: ${currentSpeed}x`, '⚡');
      });
    }

    if (audioLoopBtn) {
      audioLoopBtn.innerHTML = isLooping ? '🔂 Repeat' : '🔁 Next';
      audioLoopBtn.classList.toggle('is-active', isLooping);
      audioLoopBtn.addEventListener('click', () => {
        isLooping = !isLooping;
        localStorage.setItem('mv_loop', String(isLooping));
        audioLoopBtn.innerHTML = isLooping ? '🔂 Repeat' : '🔁 Next';
        audioLoopBtn.classList.toggle('is-active', isLooping);
        showToast(isLooping ? 'Loop mode: Repeating active verse' : 'Sequence mode: Continuous advance', '🔁');
      });
    }

    if (audioProgressSlider) {
      const onSeekStart = () => {
        isSeeking = true;
      };
      const onSeekInput = () => {
        const val = parseFloat(audioProgressSlider.value);
        audioProgressSlider.style.setProperty('--progress-pct', `${val}%`);
        if (currentAudio && !isNaN(currentAudio.duration) && currentAudio.duration > 0) {
          const previewTime = (val / 100) * currentAudio.duration;
          if (audioCurrentTimeEl) audioCurrentTimeEl.textContent = formatTime(previewTime);
        }
      };
      const onSeekEnd = () => {
        if (currentAudio && !isNaN(currentAudio.duration) && currentAudio.duration > 0) {
          const val = parseFloat(audioProgressSlider.value);
          currentAudio.currentTime = (val / 100) * currentAudio.duration;
          audioProgressSlider.style.setProperty('--progress-pct', `${val}%`);
        }
        isSeeking = false;
      };

      audioProgressSlider.addEventListener('mousedown', onSeekStart);
      audioProgressSlider.addEventListener('touchstart', onSeekStart, { passive: true });
      audioProgressSlider.addEventListener('input', onSeekInput);
      audioProgressSlider.addEventListener('change', onSeekEnd);
      audioProgressSlider.addEventListener('mouseup', onSeekEnd);
      audioProgressSlider.addEventListener('touchend', onSeekEnd, { passive: true });
    }
  }

  // Setup Bookmarks Filter Toggle & Random Discovery
  function setupToolbarExtras() {
    if (randomBtn) {
      randomBtn.addEventListener('click', discoverRandomAyah);
    }

    if (bookmarksToggleBtn) {
      bookmarksToggleBtn.addEventListener('click', () => {
        activeCategory = (activeCategory === 'favorites') ? 'all' : 'favorites';
        renderCategoryPills();
        updateBookmarksCountBadge();
        render();
        showToast(activeCategory === 'favorites' ? 'Showing saved bookmarks' : 'Showing all verses', '★');
      });
    }

    if (shortcutsBtn && shortcutsModalEl) {
      shortcutsBtn.addEventListener('click', () => {
        shortcutsModalEl.classList.add('is-active');
      });
    }

    if (shortcutsModalClose && shortcutsModalEl) {
      shortcutsModalClose.addEventListener('click', () => {
        shortcutsModalEl.classList.remove('is-active');
      });
    }

    if (shortcutsModalEl) {
      shortcutsModalEl.addEventListener('click', (e) => {
        if (e.target === shortcutsModalEl) {
          shortcutsModalEl.classList.remove('is-active');
        }
      });
    }
  }

  // Setup Global Keyboard Hotkeys
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore when typing inside input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (playingVerseId !== null) {
          togglePlayVerse(playingVerseId);
        } else {
          const list = getActiveVerseList();
          if (list && list.length) playVerse(list[0].id, 0);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        playNextAyah();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playPrevAyah();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        let newVol = Math.min(1.0, currentVolume + 0.1);
        currentVolume = Math.round(newVol * 10) / 10;
        isMuted = false;
        localStorage.setItem('mv_volume', String(currentVolume));
        localStorage.setItem('mv_muted', 'false');
        if (currentAudio) {
          currentAudio.volume = currentVolume;
          currentAudio.muted = false;
        }
        updateMuteUI();
        showToast(`Volume: ${Math.round(currentVolume * 100)}%`, '🔊');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        let newVol = Math.max(0.0, currentVolume - 0.1);
        currentVolume = Math.round(newVol * 10) / 10;
        isMuted = (currentVolume === 0);
        localStorage.setItem('mv_volume', String(currentVolume));
        localStorage.setItem('mv_muted', String(isMuted));
        if (currentAudio) {
          currentAudio.volume = currentVolume;
          currentAudio.muted = isMuted;
        }
        updateMuteUI();
        showToast(`Volume: ${Math.round(currentVolume * 100)}%`, isMuted ? '🔇' : '🔉');
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        discoverRandomAyah();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        activeCategory = (activeCategory === 'favorites') ? 'all' : 'favorites';
        renderCategoryPills();
        updateBookmarksCountBadge();
        render();
        showToast(activeCategory === 'favorites' ? 'Showing saved bookmarks' : 'Showing all verses', '★');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        currentView = (currentView === 'cards') ? 'table' : 'cards';
        localStorage.setItem('mv_view', currentView);
        if (viewCardsBtn) viewCardsBtn.classList.toggle('active', currentView === 'cards');
        if (viewTableBtn) viewTableBtn.classList.toggle('active', currentView === 'table');
        render();
      } else if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
        e.preventDefault();
        if (searchInputEl) {
          searchInputEl.focus();
          searchInputEl.select();
        }
      } else if (e.key === 'Escape') {
        if (shortcutsModalEl && shortcutsModalEl.classList.contains('is-active')) {
          shortcutsModalEl.classList.remove('is-active');
        } else if (bonusModalEl && bonusModalEl.classList.contains('is-active')) {
          bonusModalEl.classList.remove('is-active');
        } else if (pdfViewerWrap && pdfViewerWrap.classList.contains('active')) {
          pdfViewerWrap.classList.remove('active');
          if (pdfToggleBtn) pdfToggleBtn.innerHTML = '<span>📑</span> View PDF In-Browser';
        } else if (audioBarEl && audioBarEl.classList.contains('is-visible')) {
          stopCurrentAudio();
        }
      } else if (e.key === '+' || e.key === '=') {
        adjustArabicFontSize(10);
      } else if (e.key === '-' || e.key === '_') {
        adjustArabicFontSize(-10);
      }
    });
  }

  // Setup Floating Back To Top Button
  function setupBackToTop() {
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 450) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Setup Bonus Modal Close
  function setupBonusModal() {
    if (bonusModalClose) {
      bonusModalClose.addEventListener('click', closeBonusModal);
    }
    if (bonusModalEl) {
      bonusModalEl.addEventListener('click', (e) => {
        if (e.target === bonusModalEl) closeBonusModal();
      });
    }
  }

  // Safe HTML Escaping
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Initialization
  document.addEventListener('DOMContentLoaded', () => {
    renderTop10();
    setupThematicTaxonomy();
    populateSurahSelect();
    setupSourceSelect();
    setupDisplayMode();
    renderCategoryPills();
    setupViewSwitcher();
    setupSearch();
    setupReciter();
    setupAutoplay();
    setupToolbarExtras();
    setupFontSizeController();
    setupPdfViewer();
    setupAudioBar();
    setupKeyboardShortcuts();
    setupBackToTop();
    setupBonusModal();
    render();
  });

})();
