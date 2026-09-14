/**
 * QURAN AUTO-LISTENING AUDIO PLAYER (Standalone & Modular) v2.0
 * Continuous Quran Recitation Engine with Material You Docked Bar,
 * Draggable Minimized Pill, Real-time Web Audio Visualizer Modal,
 * Multi-Reciter Support, Sleep Timer, Favorites & Cross-Page Persistence.
 */

(function () {
  'use strict';

  // Prevent duplicate initialization
  if (window.QuranPlayerInstance) return;

  // =========================================================================
  // 1. COMPLETE 114 SURAHS CATALOG METADATA
  // =========================================================================
  const SURAHS = [
    { id: 1, name: "Al-Fatihah", arabic: "الفَاتِحَة", meaning: "The Opening", ayahs: 7, type: "Meccan" },
    { id: 2, name: "Al-Baqarah", arabic: "البَقَرَة", meaning: "The Cow", ayahs: 286, type: "Medinan" },
    { id: 3, name: "Ali 'Imran", arabic: "آل عِمْرَان", meaning: "Family of Imran", ayahs: 200, type: "Medinan" },
    { id: 4, name: "An-Nisa", arabic: "النِّسَاء", meaning: "The Women", ayahs: 176, type: "Medinan" },
    { id: 5, name: "Al-Ma'idah", arabic: "المَائِدَة", meaning: "The Table Spread", ayahs: 120, type: "Medinan" },
    { id: 6, name: "Al-An'am", arabic: "الأَنْعَام", meaning: "The Cattle", ayahs: 165, type: "Meccan" },
    { id: 7, name: "Al-A'raf", arabic: "الأَعْرَاف", meaning: "The Heights", ayahs: 206, type: "Meccan" },
    { id: 8, name: "Al-Anfal", arabic: "الأَنْفَال", meaning: "The Spoils of War", ayahs: 75, type: "Medinan" },
    { id: 9, name: "At-Tawbah", arabic: "التَّوْبَة", meaning: "The Repentance", ayahs: 129, type: "Medinan" },
    { id: 10, name: "Yunus", arabic: "يُونُس", meaning: "Jonah", ayahs: 109, type: "Meccan" },
    { id: 11, name: "Hud", arabic: "هُود", meaning: "Hud", ayahs: 123, type: "Meccan" },
    { id: 12, name: "Yusuf", arabic: "يُوسُف", meaning: "Joseph", ayahs: 111, type: "Meccan" },
    { id: 13, name: "Ar-Ra'd", arabic: "الرَّعْد", meaning: "The Thunder", ayahs: 43, type: "Medinan" },
    { id: 14, name: "Ibrahim", arabic: "إِبْرَاهِيم", meaning: "Abraham", ayahs: 52, type: "Meccan" },
    { id: 15, name: "Al-Hijr", arabic: "الحِجْر", meaning: "The Rocky Tract", ayahs: 99, type: "Meccan" },
    { id: 16, name: "An-Nahl", arabic: "النَّحْل", meaning: "The Bee", ayahs: 128, type: "Meccan" },
    { id: 17, name: "Al-Isra", arabic: "الإِسْرَاء", meaning: "The Night Journey", ayahs: 111, type: "Meccan" },
    { id: 18, name: "Al-Kahf", arabic: "الكَهْف", meaning: "The Cave", ayahs: 110, type: "Meccan" },
    { id: 19, name: "Maryam", arabic: "مَرْيَم", meaning: "Mary", ayahs: 98, type: "Meccan" },
    { id: 20, name: "Ta-Ha", arabic: "طه", meaning: "Ta-Ha", ayahs: 135, type: "Meccan" },
    { id: 21, name: "Al-Anbiya", arabic: "الأَنْبِيَاء", meaning: "The Prophets", ayahs: 112, type: "Meccan" },
    { id: 22, name: "Al-Hajj", arabic: "الحَجّ", meaning: "The Pilgrimage", ayahs: 78, type: "Medinan" },
    { id: 23, name: "Al-Mu'minun", arabic: "المُؤْمِنُون", meaning: "The Believers", ayahs: 118, type: "Meccan" },
    { id: 24, name: "An-Nur", arabic: "النُّور", meaning: "The Light", ayahs: 64, type: "Medinan" },
    { id: 25, name: "Al-Furqan", arabic: "الفُرْقَان", meaning: "The Criterion", ayahs: 77, type: "Meccan" },
    { id: 26, name: "Ash-Shu'ara", arabic: "الشُّعَرَاء", meaning: "The Poets", ayahs: 227, type: "Meccan" },
    { id: 27, name: "An-Naml", arabic: "النَّمْل", meaning: "The Ant", ayahs: 93, type: "Meccan" },
    { id: 28, name: "Al-Qasas", arabic: "القَصَص", meaning: "The Stories", ayahs: 88, type: "Meccan" },
    { id: 29, name: "Al-'Ankabut", arabic: "العَنْكَبُوت", meaning: "The Spider", ayahs: 69, type: "Meccan" },
    { id: 30, name: "Ar-Rum", arabic: "الرُّوم", meaning: "The Romans", ayahs: 60, type: "Meccan" },
    { id: 31, name: "Luqman", arabic: "لُقْمَان", meaning: "Luqman", ayahs: 34, type: "Meccan" },
    { id: 32, name: "As-Sajdah", arabic: "السَّجْدَة", meaning: "The Prostration", ayahs: 30, type: "Meccan" },
    { id: 33, name: "Al-Ahzab", arabic: "الأَحْزَاب", meaning: "The Combined Forces", ayahs: 73, type: "Medinan" },
    { id: 34, name: "Saba", arabic: "سَبَأ", meaning: "Sheba", ayahs: 54, type: "Meccan" },
    { id: 35, name: "Fatir", arabic: "فَاطِر", meaning: "Originator", ayahs: 45, type: "Meccan" },
    { id: 36, name: "Ya-Sin", arabic: "يس", meaning: "Ya-Sin (Heart of Quran)", ayahs: 83, type: "Meccan" },
    { id: 37, name: "As-Saffat", arabic: "الصَّافَّات", meaning: "Those Ranged in Ranks", ayahs: 182, type: "Meccan" },
    { id: 38, name: "Sad", arabic: "ص", meaning: "The Letter Sad", ayahs: 88, type: "Meccan" },
    { id: 39, name: "Az-Zumar", arabic: "الزُّمَر", meaning: "The Troops", ayahs: 75, type: "Meccan" },
    { id: 40, name: "Ghafir", arabic: "غَافِر", meaning: "The Forgiver", ayahs: 85, type: "Meccan" },
    { id: 41, name: "Fussilat", arabic: "فُصِّلَت", meaning: "Explained in Detail", ayahs: 54, type: "Meccan" },
    { id: 42, name: "Ash-Shura", arabic: "الشُّورَى", meaning: "The Consultation", ayahs: 53, type: "Meccan" },
    { id: 43, name: "Az-Zukhruf", arabic: "الزُّخْرُف", meaning: "The Ornaments of Gold", ayahs: 89, type: "Meccan" },
    { id: 44, name: "Ad-Dukhan", arabic: "الدُّخَان", meaning: "The Smoke", ayahs: 59, type: "Meccan" },
    { id: 45, name: "Al-Jathiyah", arabic: "الجَاثِيَة", meaning: "The Crouching", ayahs: 37, type: "Meccan" },
    { id: 46, name: "Al-Ahqaf", arabic: "الأَحْقَاف", meaning: "The Wind-Curved Sandhills", ayahs: 35, type: "Meccan" },
    { id: 47, name: "Muhammad", arabic: "مُحَمَّد", meaning: "Muhammad", ayahs: 38, type: "Medinan" },
    { id: 48, name: "Al-Fath", arabic: "الفَتْح", meaning: "The Victory", ayahs: 29, type: "Medinan" },
    { id: 49, name: "Al-Hujurat", arabic: "الحُجُرَات", meaning: "The Rooms", ayahs: 18, type: "Medinan" },
    { id: 50, name: "Qaf", arabic: "ق", meaning: "The Letter Qaf", ayahs: 45, type: "Meccan" },
    { id: 51, name: "Adh-Dhariyat", arabic: "الذَّارِيَات", meaning: "The Winnowing Winds", ayahs: 60, type: "Meccan" },
    { id: 52, name: "At-Tur", arabic: "الطُّور", meaning: "The Mount", ayahs: 49, type: "Meccan" },
    { id: 53, name: "An-Najm", arabic: "النَّجْم", meaning: "The Star", ayahs: 62, type: "Meccan" },
    { id: 54, name: "Al-Qamar", arabic: "القَمَر", meaning: "The Moon", ayahs: 55, type: "Meccan" },
    { id: 55, name: "Ar-Rahman", arabic: "الرَّحْمَن", meaning: "The Beneficent", ayahs: 78, type: "Medinan" },
    { id: 56, name: "Al-Waqi'ah", arabic: "الوَاقِعَة", meaning: "The Inevitable", ayahs: 96, type: "Meccan" },
    { id: 57, name: "Al-Hadid", arabic: "الحَدِيد", meaning: "The Iron", ayahs: 29, type: "Medinan" },
    { id: 58, name: "Al-Mujadila", arabic: "المُجَادَلَة", meaning: "The Pleading Woman", ayahs: 22, type: "Medinan" },
    { id: 59, name: "Al-Hashr", arabic: "الحَشْر", meaning: "The Exile", ayahs: 24, type: "Medinan" },
    { id: 60, name: "Al-Mumtahanah", arabic: "المُمْتَحَنَة", meaning: "She That is to be Examined", ayahs: 13, type: "Medinan" },
    { id: 61, name: "As-Saff", arabic: "الصَّفّ", meaning: "The Ranks", ayahs: 14, type: "Medinan" },
    { id: 62, name: "Al-Jumu'ah", arabic: "الجُمُعَة", meaning: "The Congregation", ayahs: 11, type: "Medinan" },
    { id: 63, name: "Al-Munafiqun", arabic: "المُنَافِقُون", meaning: "The Hypocrites", ayahs: 11, type: "Medinan" },
    { id: 64, name: "At-Taghabun", arabic: "التَّغَابُن", meaning: "Mutual Disillusion", ayahs: 18, type: "Medinan" },
    { id: 65, name: "At-Talaq", arabic: "الطَّلَاق", meaning: "The Divorce", ayahs: 12, type: "Medinan" },
    { id: 66, name: "At-Tahrim", arabic: "التَّحْرِيم", meaning: "The Prohibition", ayahs: 12, type: "Medinan" },
    { id: 67, name: "Al-Mulk", arabic: "المُلْك", meaning: "The Sovereignty", ayahs: 30, type: "Meccan" },
    { id: 68, name: "Al-Qalam", arabic: "القَلَم", meaning: "The Pen", ayahs: 52, type: "Meccan" },
    { id: 69, name: "Al-Haqqah", arabic: "الحَاقَّة", meaning: "The Inevitable", ayahs: 52, type: "Meccan" },
    { id: 70, name: "Al-Ma'arij", arabic: "المَعَارِج", meaning: "The Ascending Stairways", ayahs: 44, type: "Meccan" },
    { id: 71, name: "Nuh", arabic: "نُوح", meaning: "Noah", ayahs: 28, type: "Meccan" },
    { id: 72, name: "Al-Jinn", arabic: "الجِنّ", meaning: "The Jinn", ayahs: 28, type: "Meccan" },
    { id: 73, name: "Al-Muzzammil", arabic: "المُزَّمِّل", meaning: "The Enshrouded One", ayahs: 20, type: "Meccan" },
    { id: 74, name: "Al-Muddaththir", arabic: "المُدَّثِّر", meaning: "The Cloaked One", ayahs: 56, type: "Meccan" },
    { id: 75, name: "Al-Qiyamah", arabic: "القِيَامَة", meaning: "The Resurrection", ayahs: 40, type: "Meccan" },
    { id: 76, name: "Al-Insan", arabic: "الإِنْسَان", meaning: "Man", ayahs: 31, type: "Medinan" },
    { id: 77, name: "Al-Mursalat", arabic: "المُرْسَلَات", meaning: "The Emissaries", ayahs: 50, type: "Meccan" },
    { id: 78, name: "An-Naba", arabic: "النَّبَأ", meaning: "The Tidings", ayahs: 40, type: "Meccan" },
    { id: 79, name: "An-Nazi'at", arabic: "النَّازِعَات", meaning: "Those Who Drag Forth", ayahs: 46, type: "Meccan" },
    { id: 80, name: "'Abasa", arabic: "عَبَسَ", meaning: "He Frowned", ayahs: 42, type: "Meccan" },
    { id: 81, name: "At-Takwir", arabic: "التَّكْوِير", meaning: "The Overthrowing", ayahs: 29, type: "Meccan" },
    { id: 82, name: "Al-Infitar", arabic: "الانْفِطَار", meaning: "The Cleaving", ayahs: 19, type: "Meccan" },
    { id: 83, name: "Al-Mutaffifin", arabic: "المُطَفِّفِين", meaning: "The Defrauding", ayahs: 36, type: "Meccan" },
    { id: 84, name: "Al-Inshiqaq", arabic: "الانْشِقَاق", meaning: "The Splitting Asunder", ayahs: 25, type: "Meccan" },
    { id: 85, name: "Al-Buruj", arabic: "البُرُوج", meaning: "The Mansions of the Stars", ayahs: 22, type: "Meccan" },
    { id: 86, name: "At-Tariq", arabic: "الطَّارِق", meaning: "The Nightcomer", ayahs: 17, type: "Meccan" },
    { id: 87, name: "Al-A'la", arabic: "الأَعْلَى", meaning: "The Most High", ayahs: 19, type: "Meccan" },
    { id: 88, name: "Al-Ghashiyah", arabic: "الغَاشِيَة", meaning: "The Overwhelming", ayahs: 26, type: "Meccan" },
    { id: 89, name: "Al-Fajr", arabic: "الفَجْر", meaning: "The Dawn", ayahs: 30, type: "Meccan" },
    { id: 90, name: "Al-Balad", arabic: "البَلَد", meaning: "The City", ayahs: 20, type: "Meccan" },
    { id: 91, name: "Ash-Shams", arabic: "الشَّمْس", meaning: "The Sun", ayahs: 15, type: "Meccan" },
    { id: 92, name: "Al-Layl", arabic: "اللَّيْل", meaning: "The Night", ayahs: 21, type: "Meccan" },
    { id: 93, name: "Ad-Duha", arabic: "الضُّحَى", meaning: "The Morning Hours", ayahs: 11, type: "Meccan" },
    { id: 94, name: "Ash-Sharh", arabic: "الشَّرْح", meaning: "The Relief", ayahs: 8, type: "Meccan" },
    { id: 95, name: "At-Tin", arabic: "التِّين", meaning: "The Fig", ayahs: 8, type: "Meccan" },
    { id: 96, name: "Al-'Alaq", arabic: "العَلَق", meaning: "The Clot", ayahs: 19, type: "Meccan" },
    { id: 97, name: "Al-Qadr", arabic: "القَدْر", meaning: "The Night of Decree", ayahs: 5, type: "Meccan" },
    { id: 98, name: "Al-Bayyinah", arabic: "البَيِّنَة", meaning: "The Clear Evidence", ayahs: 8, type: "Medinan" },
    { id: 99, name: "Az-Zalzalah", arabic: "الزَّلْزَلَة", meaning: "The Earthquake", ayahs: 8, type: "Medinan" },
    { id: 100, name: "Al-'Adiyat", arabic: "العَادِيَات", meaning: "The Courser", ayahs: 11, type: "Meccan" },
    { id: 101, name: "Al-Qari'ah", arabic: "القَارِعَة", meaning: "The Calamity", ayahs: 11, type: "Meccan" },
    { id: 102, name: "At-Takathur", arabic: "التَّكَاثُر", meaning: "The Rivalry in World Increase", ayahs: 8, type: "Meccan" },
    { id: 103, name: "Al-'Asr", arabic: "العَصْر", meaning: "The Declining Day", ayahs: 3, type: "Meccan" },
    { id: 104, name: "Al-Humazah", arabic: "الهُمَزَة", meaning: "The Traducer", ayahs: 9, type: "Meccan" },
    { id: 105, name: "Al-Fil", arabic: "الفِيل", meaning: "The Elephant", ayahs: 5, type: "Meccan" },
    { id: 106, name: "Quraysh", arabic: "قُرَيْش", meaning: "Quraysh", ayahs: 4, type: "Meccan" },
    { id: 107, name: "Al-Ma'un", arabic: "المَاعُون", meaning: "Small Kindnesses", ayahs: 7, type: "Meccan" },
    { id: 108, name: "Al-Kawthar", arabic: "الكَوْثَر", meaning: "Abundance", ayahs: 3, type: "Meccan" },
    { id: 109, name: "Al-Kafirun", arabic: "الكَافِرُون", meaning: "The Disbelievers", ayahs: 6, type: "Meccan" },
    { id: 110, name: "An-Nasr", arabic: "النَّصْر", meaning: "The Divine Support", ayahs: 3, type: "Medinan" },
    { id: 111, name: "Al-Masad", arabic: "المَسَد", meaning: "The Palm Fibre", ayahs: 5, type: "Meccan" },
    { id: 112, name: "Al-Ikhlas", arabic: "الإِخْلَاص", meaning: "The Sincerity", ayahs: 4, type: "Meccan" },
    { id: 113, name: "Al-Falaq", arabic: "الفَلَق", meaning: "The Daybreak", ayahs: 5, type: "Meccan" },
    { id: 114, name: "An-Nas", arabic: "النَّاس", meaning: "Mankind", ayahs: 6, type: "Meccan" }
  ];

  // =========================================================================
  // 2. WORLD-RENOWNED RECITERS ROSTER
  // =========================================================================
  const RECITERS = [
    { id: 'afs', name: 'Sheikh Mishary Rashid Alafasy', short: 'Mishary Alafasy', cdn: 'https://server8.mp3quran.net/afs/' },
    { id: 'basit', name: 'Sheikh Abdul Basit (Murattal)', short: 'Abdul Basit', cdn: 'https://server7.mp3quran.net/basit/' },
    { id: 'maher', name: 'Sheikh Maher Al-Muaiqly', short: 'Maher Al-Muaiqly', cdn: 'https://server12.mp3quran.net/maher/' },
    { id: 's_gmd', name: 'Sheikh Saad Al-Ghamdi', short: 'Saad Al-Ghamdi', cdn: 'https://server7.mp3quran.net/s_gmd/' },
    { id: 'yasser', name: 'Sheikh Yasser Al-Dosari', short: 'Yasser Al-Dosari', cdn: 'https://server11.mp3quran.net/yasser/' },
    { id: 'sds', name: 'Sheikh Abdur-Rahman As-Sudais', short: 'As-Sudais', cdn: 'https://server11.mp3quran.net/sds/' }
  ];

  const COVER_ART_URL = "assets/banners/quran-cover.jpg";

  // Category presets
  const CATEGORIES = {
    POPULAR: [1, 2, 18, 36, 55, 56, 67],
    RUQYAH: [1, 112, 113, 114, 109, 2],
    JUZ_AMMA: Array.from({ length: 37 }, (_, i) => 78 + i)
  };

  // =========================================================================
  // 3. STORAGE & STATE
  // =========================================================================
  const STORAGE_KEYS = {
    INDEX: 'qp_track_index',
    TIME: 'qp_current_time',
    IS_PLAYING: 'qp_is_playing',
    MINIMIZED: 'qp_is_minimized',
    VOLUME: 'qp_volume',
    REPEAT: 'qp_repeat_mode', // 'all', 'one', 'off'
    SHUFFLE: 'qp_is_shuffled',
    SPEED: 'qp_playback_speed',
    RECITER: 'qp_reciter_id',
    FAVORITES: 'qp_favorites'
  };

  let currentIndex = parseInt(localStorage.getItem(STORAGE_KEYS.INDEX) || '0', 10);
  if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= SURAHS.length) currentIndex = 0;

  let savedTime = parseFloat(localStorage.getItem(STORAGE_KEYS.TIME) || '0');
  let isPlaying = false;
  let wasPlayingBeforeNav = localStorage.getItem(STORAGE_KEYS.IS_PLAYING) === 'true';
  let isMinimized = localStorage.getItem(STORAGE_KEYS.MINIMIZED) === 'true';
  let volume = parseFloat(localStorage.getItem(STORAGE_KEYS.VOLUME) || '0.85');
  let repeatMode = localStorage.getItem(STORAGE_KEYS.REPEAT) || 'all';
  let isShuffled = localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true';
  let playbackSpeed = parseFloat(localStorage.getItem(STORAGE_KEYS.SPEED) || '1.0');
  let currentReciterId = localStorage.getItem(STORAGE_KEYS.RECITER) || 'afs';
  let favorites = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[1, 36, 55, 67]'));

  // Sleep Timer state
  let sleepTimerMinutes = 0; // 0 = off, 15, 30, 45, 60, -1 = end of surah
  let sleepTimerTimeout = null;
  let sleepTimerInterval = null;
  let sleepTimerEndTime = 0;

  // Active Category Filter in Queue Drawer
  let activeCategory = 'all'; // 'all', 'favorites', 'popular', 'ruqyah', 'juz_amma'

  // Audio Engine
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = volume;
  audio.playbackRate = playbackSpeed;

  // Web Audio Visualizer state
  let audioCtx = null;
  let analyser = null;
  let visualizerSource = null;
  let visualizerAnimId = null;

  function getCurrentReciter() {
    return RECITERS.find(r => r.id === currentReciterId) || RECITERS[0];
  }

  function getAudioUrl(surahId, reciterId) {
    const reciter = RECITERS.find(r => r.id === reciterId) || getCurrentReciter();
    const padded = String(surahId).padStart(3, '0');
    return `${reciter.cdn}${padded}.mp3`;
  }

  // DOM Elements cache
  const dom = {};

  // =========================================================================
  // 4. AUTO-INJECT DOM MARKUP
  // =========================================================================
  function injectPlayerDOM() {
    if (document.getElementById('qpPlayerBar')) return;

    const reciter = getCurrentReciter();

    // 1. Docked Player Bar
    const playerBar = document.createElement('aside');
    playerBar.className = 'qp-player-bar';
    playerBar.id = 'qpPlayerBar';
    playerBar.setAttribute('aria-label', 'Quran Audio Player Controls');
    playerBar.innerHTML = `
      <div class="qp-inner">
        <!-- Left: Surah Cover & Info -->
        <div class="qp-track-block">
          <div class="qp-cover-wrap" id="qpCoverWrap" title="Click to view Fullscreen Visualizer (F)">
            <img src="${COVER_ART_URL}" alt="The Holy Quran Cover" class="qp-cover-img" id="qpCoverImg" />
            <div class="qp-eq-bars" aria-hidden="true">
              <span class="qp-eq-bar"></span>
              <span class="qp-eq-bar"></span>
              <span class="qp-eq-bar"></span>
              <span class="qp-eq-bar"></span>
            </div>
          </div>
          <div class="qp-track-info" id="qpTrackInfo" title="Click for Fullscreen View">
            <div class="qp-surah-title-row">
              <span class="qp-surah-number" id="qpSurahNumber">01</span>
              <span class="qp-surah-title" id="qpSurahTitle">Al-Fatihah</span>
              <span class="qp-surah-arabic" id="qpSurahArabic">الفَاتِحَة</span>
            </div>
            <div class="qp-track-subrow">
              <button class="qp-reciter-chip" id="qpReciterChip" title="Switch Reciter (القراء)" aria-label="Select Reciter">
                <span>🎙️</span>
                <span id="qpReciterChipText">${reciter.short}</span>
                <span style="font-size:0.65rem; opacity:0.6; margin-left:1px;">▾</span>
              </button>
              <span class="qp-auto-badge" id="qpAutoBadge" title="Continuous Auto-Listening">Auto</span>
            </div>
          </div>
          <button class="qp-fav-btn" id="qpFavBtn" title="Favorite this Surah" aria-label="Favorite Surah">
            <svg id="qpFavIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <!-- Center: Controls & Scrubber -->
        <div class="qp-center">
          <div class="qp-controls">
            <!-- Shuffle -->
            <button class="qp-btn" id="qpShuffleBtn" title="Shuffle (S)" aria-label="Toggle shuffle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
              </svg>
              <span class="qp-btn-dot"></span>
            </button>

            <!-- Previous Surah -->
            <button class="qp-btn" id="qpPrevBtn" title="Previous Surah (←)" aria-label="Previous Surah">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="5" width="2.5" height="14" rx="1.25"></rect>
                <polygon points="20,5 8.5,12 20,19"></polygon>
              </svg>
            </button>

            <!-- Play/Pause -->
            <button class="qp-play-btn" id="qpPlayBtn" title="Play / Pause (Space)" aria-label="Play or Pause">
              <svg id="qpPlayIcon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="7,4 20,12 7,20"></polygon>
              </svg>
            </button>

            <!-- Next Surah -->
            <button class="qp-btn" id="qpNextBtn" title="Next Surah (→)" aria-label="Next Surah">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="4,5 15.5,12 4,19"></polygon>
                <rect x="17.5" y="5" width="2.5" height="14" rx="1.25"></rect>
              </svg>
            </button>

            <!-- Repeat Mode -->
            <button class="qp-btn is-active" id="qpRepeatBtn" title="Loop Mode: All (L)" aria-label="Toggle repeat mode">
              <svg id="qpRepeatIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              <span class="qp-btn-dot"></span>
            </button>
          </div>

          <!-- Scrubber Timeline with Hover Tooltip -->
          <div class="qp-progress-wrap" id="qpProgressWrap">
            <span class="qp-time qp-time-curr" id="qpTimeCurr">00:00</span>
            <div class="qp-progress-bar" id="qpProgressBar" role="slider" aria-label="Timeline" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div class="qp-progress-fill" id="qpProgressFill">
                <span class="qp-progress-thumb"></span>
              </div>
            </div>
            <span class="qp-time qp-time-total" id="qpTimeTotal">--:--</span>
            <div class="qp-scrubber-tooltip" id="qpScrubberTooltip">00:00</div>
          </div>
        </div>

        <!-- Right: Tray Actions -->
        <div class="qp-right">
          <!-- Mobile Play button -->
          <button class="qp-play-btn qp-mobile-play-btn" id="qpMobilePlayBtn" aria-label="Play or Pause">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="7,4 20,12 7,20"></polygon>
            </svg>
          </button>

          <!-- Volume Slider -->
          <div class="qp-volume-wrap">
            <button class="qp-icon-btn" id="qpMuteBtn" title="Mute / Unmute (M)" aria-label="Mute or Unmute">
              <svg id="qpMuteIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            <input type="range" class="qp-volume-slider" id="qpVolumeSlider" min="0" max="1" step="0.01" value="${volume}" aria-label="Audio volume" />
          </div>

          <!-- Speed Switcher -->
          <button class="qp-icon-btn qp-speed-btn" id="qpSpeedBtn" title="Recitation Speed" aria-label="Playback speed">1.0x</button>

          <!-- Sleep Timer Button -->
          <button class="qp-icon-btn qp-timer-btn" id="qpTimerBtn" title="Sleep Timer (Tadabbur)" aria-label="Sleep timer">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span class="qp-timer-badge" id="qpTimerBadge">30m</span>
          </button>

          <!-- Queue Drawer Toggle -->
          <button class="qp-icon-btn" id="qpQueueBtn" title="Surah Playlist Queue (Q)" aria-label="Open Surah Playlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line>
              <circle cx="4" cy="6" r="1.5" fill="currentColor"></circle><circle cx="4" cy="12" r="1.5" fill="currentColor"></circle><circle cx="4" cy="18" r="1.5" fill="currentColor"></circle>
            </svg>
            <span class="qp-badge-count">114</span>
          </button>

          <!-- Fullscreen Modal Toggle -->
          <button class="qp-icon-btn" id="qpFullscreenBtn" title="Fullscreen Now Playing (F)" aria-label="Fullscreen view">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>

          <!-- Minimize Player Button -->
          <button class="qp-icon-btn qp-minimize-btn" id="qpMinimizeBtn" title="Minimize Player (V)" aria-label="Minimize player">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Reciter Selection Dropdown Menu -->
      <div class="qp-dropdown-menu" id="qpReciterMenu">
        <div class="qp-dropdown-header">Select Reciter (القراء)</div>
        ${RECITERS.map(r => `
          <div class="qp-dropdown-item ${r.id === currentReciterId ? 'is-selected' : ''}" data-reciter="${r.id}">
            <div>
              <div style="font-weight:600;">${r.name}</div>
              <div style="font-size:0.72rem; color:var(--qp-text-muted);">${r.short}</div>
            </div>
            ${r.id === currentReciterId ? '✓' : ''}
          </div>
        `).join('')}
      </div>

      <!-- Sleep Timer Dropdown Menu -->
      <div class="qp-dropdown-menu" id="qpTimerMenu" style="right: 120px;">
        <div class="qp-dropdown-header">Sleep Timer (إيقاف مؤقت)</div>
        <div class="qp-dropdown-item ${sleepTimerMinutes === 0 ? 'is-selected' : ''}" data-timer="0">Off (إيقاف)</div>
        <div class="qp-dropdown-item ${sleepTimerMinutes === 15 ? 'is-selected' : ''}" data-timer="15">15 Minutes</div>
        <div class="qp-dropdown-item ${sleepTimerMinutes === 30 ? 'is-selected' : ''}" data-timer="30">30 Minutes</div>
        <div class="qp-dropdown-item ${sleepTimerMinutes === 45 ? 'is-selected' : ''}" data-timer="45">45 Minutes</div>
        <div class="qp-dropdown-item ${sleepTimerMinutes === 60 ? 'is-selected' : ''}" data-timer="60">60 Minutes</div>
        <div class="qp-dropdown-item ${sleepTimerMinutes === -1 ? 'is-selected' : ''}" data-timer="-1">End of Current Surah</div>
      </div>
    `;
    document.body.appendChild(playerBar);

    // 2. Floating Minimized Pill / Audio Orb (Draggable)
    const pill = document.createElement('aside');
    pill.className = 'qp-minimized-pill';
    pill.id = 'qpMinimizedPill';
    pill.setAttribute('aria-label', 'Minimized Quran Player');
    pill.innerHTML = `
      <div class="qp-pill-artwork" id="qpPillArtwork" title="Click or Double Click to Restore">
        <img src="${COVER_ART_URL}" alt="Quran Artwork" class="qp-pill-img" />
      </div>
      <div class="qp-pill-info" id="qpPillInfo" title="Click to Restore Player Bar">
        <span class="qp-pill-title" id="qpPillTitle">Al-Fatihah</span>
        <span class="qp-pill-subtitle" id="qpPillSubtitle">
          <span>Surah 1</span> &bull; <span>${reciter.short.split(' ')[0]}</span>
        </span>
      </div>
      <div class="qp-pill-actions">
        <button class="qp-pill-btn qp-pill-btn-play" id="qpPillPlayBtn" title="Play / Pause" aria-label="Play or Pause">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="7,4 20,12 7,20"></polygon>
          </svg>
        </button>
        <button class="qp-pill-btn" id="qpPillNextBtn" title="Next Surah" aria-label="Next Surah">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="4,5 15.5,12 4,19"></polygon>
            <rect x="17.5" y="5" width="2.5" height="14" rx="1.25"></rect>
          </svg>
        </button>
        <button class="qp-pill-btn" id="qpPillExpandBtn" title="Expand Player (V)" aria-label="Restore Player Bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(pill);

    // 3. Fullscreen / Expanded Now-Playing Modal
    const modal = document.createElement('div');
    modal.className = 'qp-modal-overlay';
    modal.id = 'qpNowPlayingModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Now Playing Fullscreen');
    modal.innerHTML = `
      <button class="qp-modal-close" id="qpModalCloseBtn" aria-label="Close fullscreen view (Esc)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="qp-modal-content">
        <div class="qp-modal-art-wrap">
          <img src="${COVER_ART_URL}" alt="The Holy Quran Artwork" class="qp-modal-art" />
        </div>
        <div class="qp-modal-arabic" id="qpModalArabic">سُورَةُ الفَاتِحَةِ</div>
        <h2 class="qp-modal-title" id="qpModalTitle">Al-Fatihah • The Opening</h2>
        <div class="qp-modal-reciter" id="qpModalReciter">${reciter.name}</div>
        <div class="qp-modal-badges">
          <span class="qp-modal-chip" id="qpModalSurahNum">Surah 1 of 114</span>
          <span class="qp-modal-chip" id="qpModalType">Meccan</span>
          <span class="qp-modal-chip" id="qpModalAyahs">7 Ayahs</span>
          <span class="qp-modal-chip" id="qpModalReciterPill" style="cursor:pointer; color:var(--qp-primary-light);">🎙️ Switch Reciter</span>
        </div>

        <!-- Real-Time Web Audio Visualizer Canvas -->
        <canvas class="qp-visualizer-canvas" id="qpVisualizerCanvas" width="460" height="52" aria-hidden="true"></canvas>

        <!-- Modal Center Controls -->
        <div class="qp-modal-controls">
          <div class="qp-progress-wrap" style="max-width: 100%; margin-bottom: 18px;">
            <span class="qp-time qp-time-curr" id="qpModalTimeCurr">00:00</span>
            <div class="qp-progress-bar" id="qpModalProgressBar" role="slider" aria-label="Timeline">
              <div class="qp-progress-fill" id="qpModalProgressFill"></div>
            </div>
            <span class="qp-time qp-time-total" id="qpModalTimeTotal">--:--</span>
          </div>

          <div class="qp-controls" style="justify-content: center; gap: 20px;">
            <button class="qp-btn" id="qpModalShuffleBtn" title="Shuffle" aria-label="Toggle shuffle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
              </svg>
              <span class="qp-btn-dot"></span>
            </button>
            <button class="qp-btn" id="qpModalPrevBtn" title="Previous Surah" aria-label="Previous Surah">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="5" width="2.5" height="14" rx="1.25"></rect>
                <polygon points="20,5 8.5,12 20,19"></polygon>
              </svg>
            </button>
            <button class="qp-play-btn" id="qpModalPlayBtn" style="width: 56px; height: 56px;" title="Play / Pause" aria-label="Play or Pause">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="7,4 20,12 7,20"></polygon>
              </svg>
            </button>
            <button class="qp-btn" id="qpModalNextBtn" title="Next Surah" aria-label="Next Surah">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="4,5 15.5,12 4,19"></polygon>
                <rect x="17.5" y="5" width="2.5" height="14" rx="1.25"></rect>
              </svg>
            </button>
            <button class="qp-btn is-active" id="qpModalRepeatBtn" title="Loop Mode" aria-label="Toggle repeat mode">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              <span class="qp-btn-dot"></span>
            </button>
            <button class="qp-btn" id="qpModalDownloadBtn" title="Download Surah MP3" aria-label="Download Surah MP3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 4. Slide-over Surah Queue Drawer with Filter Tabs
    const drawerOverlay = document.createElement('div');
    drawerOverlay.className = 'qp-drawer-overlay';
    drawerOverlay.id = 'qpDrawerOverlay';
    document.body.appendChild(drawerOverlay);

    const drawer = document.createElement('aside');
    drawer.className = 'qp-drawer';
    drawer.id = 'qpQueueDrawer';
    drawer.setAttribute('aria-label', 'Surah Queue Drawer');
    drawer.innerHTML = `
      <div class="qp-drawer-header">
        <div class="qp-drawer-title-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span class="qp-drawer-title">The Holy Quran Playlist (114)</span>
        </div>
        <button class="qp-icon-btn" id="qpDrawerCloseBtn" aria-label="Close playlist drawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Quick Category Tabs -->
      <div class="qp-queue-tabs">
        <button class="qp-queue-tab is-active" data-category="all">All (114)</button>
        <button class="qp-queue-tab" data-category="favorites">⭐ Favorites</button>
        <button class="qp-queue-tab" data-category="popular">🌟 Popular (7)</button>
        <button class="qp-queue-tab" data-category="ruqyah">🛡️ Ruqyah (6)</button>
        <button class="qp-queue-tab" data-category="juz_amma">📖 Juz 'Amma (37)</button>
      </div>

      <div class="qp-search-wrap">
        <input type="text" class="qp-search-input" id="qpSearchInput" placeholder="Search Surahs (e.g. Yasin, Rahman, Mulk, 36)..." aria-label="Search Surahs" />
      </div>
      <div class="qp-surah-list" id="qpSurahList"></div>
    `;
    document.body.appendChild(drawer);

    // 5. Autoplay Resume Toast
    const toast = document.createElement('div');
    toast.className = 'qp-toast-banner';
    toast.id = 'qpToastBanner';
    toast.innerHTML = `
      <span>📖 Continue listening to <strong><span id="qpToastSurah">Al-Fatihah</span></strong></span>
      <button class="qp-toast-btn" id="qpToastPlayBtn">Resume Recitation</button>
    `;
    document.body.appendChild(toast);

    // 6. Notification Toast
    const notifyToast = document.createElement('div');
    notifyToast.className = 'qp-notify-toast';
    notifyToast.id = 'qpNotifyToast';
    document.body.appendChild(notifyToast);
  }

  // =========================================================================
  // 5. CACHE ELEMENTS
  // =========================================================================
  function cacheElements() {
    dom.playerBar = document.getElementById('qpPlayerBar');
    dom.pill = document.getElementById('qpMinimizedPill');
    dom.modal = document.getElementById('qpNowPlayingModal');
    dom.drawer = document.getElementById('qpQueueDrawer');
    dom.drawerOverlay = document.getElementById('qpDrawerOverlay');
    dom.toast = document.getElementById('qpToastBanner');
    dom.notifyToast = document.getElementById('qpNotifyToast');

    // Menus & Chips
    dom.reciterMenu = document.getElementById('qpReciterMenu');
    dom.timerMenu = document.getElementById('qpTimerMenu');
    dom.reciterChip = document.getElementById('qpReciterChip');
    dom.reciterChipText = document.getElementById('qpReciterChipText');
    dom.reciterBtn = document.getElementById('qpReciterBtn');
    dom.reciterBtnText = document.getElementById('qpReciterBtnText');
    dom.reciterTag = document.getElementById('qpReciterTag');
    dom.timerBtn = document.getElementById('qpTimerBtn');
    dom.timerBadge = document.getElementById('qpTimerBadge');
    dom.modalDownloadBtn = document.getElementById('qpModalDownloadBtn');
    dom.downloadBtn = document.getElementById('qpDownloadBtn') || dom.modalDownloadBtn;
    dom.favBtn = document.getElementById('qpFavBtn');
    dom.favIcon = document.getElementById('qpFavIcon');

    // Player bar elements
    dom.coverWrap = document.getElementById('qpCoverWrap');
    dom.trackInfo = document.getElementById('qpTrackInfo');
    dom.surahNumber = document.getElementById('qpSurahNumber');
    dom.surahTitle = document.getElementById('qpSurahTitle');
    dom.surahArabic = document.getElementById('qpSurahArabic');
    dom.autoBadge = document.getElementById('qpAutoBadge');

    dom.playBtn = document.getElementById('qpPlayBtn');
    dom.playIcon = document.getElementById('qpPlayIcon');
    dom.mobilePlayBtn = document.getElementById('qpMobilePlayBtn');
    dom.prevBtn = document.getElementById('qpPrevBtn');
    dom.nextBtn = document.getElementById('qpNextBtn');
    dom.repeatBtn = document.getElementById('qpRepeatBtn');
    dom.shuffleBtn = document.getElementById('qpShuffleBtn');

    dom.timeCurr = document.getElementById('qpTimeCurr');
    dom.timeTotal = document.getElementById('qpTimeTotal');
    dom.progressBar = document.getElementById('qpProgressBar');
    dom.progressFill = document.getElementById('qpProgressFill');
    dom.progressWrap = document.getElementById('qpProgressWrap');
    dom.scrubberTooltip = document.getElementById('qpScrubberTooltip');

    dom.muteBtn = document.getElementById('qpMuteBtn');
    dom.muteIcon = document.getElementById('qpMuteIcon');
    dom.volumeSlider = document.getElementById('qpVolumeSlider');
    dom.speedBtn = document.getElementById('qpSpeedBtn');
    dom.queueBtn = document.getElementById('qpQueueBtn');
    dom.fullscreenBtn = document.getElementById('qpFullscreenBtn');
    dom.minimizeBtn = document.getElementById('qpMinimizeBtn');

    // Pill elements
    dom.pillArtwork = document.getElementById('qpPillArtwork');
    dom.pillInfo = document.getElementById('qpPillInfo');
    dom.pillTitle = document.getElementById('qpPillTitle');
    dom.pillSubtitle = document.getElementById('qpPillSubtitle');
    dom.pillPlayBtn = document.getElementById('qpPillPlayBtn');
    dom.pillNextBtn = document.getElementById('qpPillNextBtn');
    dom.pillExpandBtn = document.getElementById('qpPillExpandBtn');

    // Modal elements
    dom.modalCloseBtn = document.getElementById('qpModalCloseBtn');
    dom.modalArabic = document.getElementById('qpModalArabic');
    dom.modalTitle = document.getElementById('qpModalTitle');
    dom.modalReciter = document.getElementById('qpModalReciter');
    dom.modalSurahNum = document.getElementById('qpModalSurahNum');
    dom.modalType = document.getElementById('qpModalType');
    dom.modalAyahs = document.getElementById('qpModalAyahs');
    dom.modalReciterPill = document.getElementById('qpModalReciterPill');
    dom.modalTimeCurr = document.getElementById('qpModalTimeCurr');
    dom.modalTimeTotal = document.getElementById('qpModalTimeTotal');
    dom.modalProgressBar = document.getElementById('qpModalProgressBar');
    dom.modalProgressFill = document.getElementById('qpModalProgressFill');
    dom.modalPlayBtn = document.getElementById('qpModalPlayBtn');
    dom.modalPrevBtn = document.getElementById('qpModalPrevBtn');
    dom.modalNextBtn = document.getElementById('qpModalNextBtn');
    dom.modalRepeatBtn = document.getElementById('qpModalRepeatBtn');
    dom.modalShuffleBtn = document.getElementById('qpModalShuffleBtn');
    dom.visualizerCanvas = document.getElementById('qpVisualizerCanvas');

    // Drawer elements
    dom.drawerCloseBtn = document.getElementById('qpDrawerCloseBtn');
    dom.searchInput = document.getElementById('qpSearchInput');
    dom.surahList = document.getElementById('qpSurahList');

    // Toast
    dom.toastSurah = document.getElementById('qpToastSurah');
    dom.toastPlayBtn = document.getElementById('qpToastPlayBtn');
  }

  // =========================================================================
  // 6. NOTIFICATION TOAST
  // =========================================================================
  let notifyTimer = null;
  function showNotification(msg, icon = '✨') {
    if (!dom.notifyToast) return;
    dom.notifyToast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    dom.notifyToast.classList.add('is-visible');
    clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => {
      dom.notifyToast.classList.remove('is-visible');
    }, 2800);
  }

  // =========================================================================
  // 7. DRAGGABLE MINIMIZED PILL
  // =========================================================================
  function makePillDraggable() {
    if (!dom.pill) return;
    let isDragging = false;
    let startX, startY, initX, initY;
    let hasMoved = false;

    function onPointerDown(e) {
      // Don't drag if clicking buttons inside the pill
      if (e.target.closest('.qp-pill-btn')) return;

      isDragging = true;
      hasMoved = false;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = dom.pill.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      initX = rect.left;
      initY = rect.top;

      dom.pill.classList.add('is-dragging');
      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchend', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true;
      }

      const newLeft = Math.max(10, Math.min(window.innerWidth - dom.pill.offsetWidth - 10, initX + dx));
      const newTop = Math.max(10, Math.min(window.innerHeight - dom.pill.offsetHeight - 10, initY + dy));

      dom.pill.style.left = `${newLeft}px`;
      dom.pill.style.top = `${newTop}px`;
      dom.pill.style.right = 'auto';
      dom.pill.style.bottom = 'auto';
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      dom.pill.classList.remove('is-dragging');
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    }

    dom.pill.addEventListener('mousedown', onPointerDown);
    dom.pill.addEventListener('touchstart', onPointerDown, { passive: true });

    // Double click to restore
    dom.pill.addEventListener('dblclick', () => setMinimizedState(false));
  }

  // =========================================================================
  // 8. REAL-TIME WEB AUDIO VISUALIZER
  // =========================================================================
  function initWebAudioVisualizer() {
    if (!dom.visualizerCanvas) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtx) {
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        visualizerSource = audioCtx.createMediaElementSource(audio);
        visualizerSource.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      renderVisualizerFrame();
    } catch (e) {
      // CORS or user gesture restrictions fallback
    }
  }

  function renderVisualizerFrame() {
    if (!dom.visualizerCanvas || !analyser) return;
    const canvas = dom.visualizerCanvas;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      visualizerAnimId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / 40) - 2;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        const val = dataArray[i * 1] || 0;
        const barHeight = Math.max(3, (val / 255) * canvas.height);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(0.6, '#34D399');
        gradient.addColorStop(1, '#F59E0B');

        ctx.fillStyle = isPlaying ? gradient : 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }
    }
    draw();
  }

  // =========================================================================
  // 9. SLEEP TIMER ENGINE
  // =========================================================================
  function setSleepTimer(minutes) {
    clearTimeout(sleepTimerTimeout);
    clearInterval(sleepTimerInterval);
    sleepTimerMinutes = minutes;

    if (minutes === 0) {
      dom.timerBtn.classList.remove('is-active');
      showNotification('Sleep timer turned off', '🌙');
      return;
    }

    if (minutes === -1) {
      dom.timerBtn.classList.add('is-active');
      dom.timerBadge.textContent = 'Surah';
      showNotification('Recitation will pause at the end of this Surah', '🌙');
      return;
    }

    dom.timerBtn.classList.add('is-active');
    sleepTimerEndTime = Date.now() + minutes * 60 * 1000;
    updateTimerBadge();

    sleepTimerInterval = setInterval(updateTimerBadge, 1000);
    sleepTimerTimeout = setTimeout(() => {
      // Fade out volume over 4 seconds then pause
      const initialVol = audio.volume;
      let fadeStep = 0;
      const fadeInterval = setInterval(() => {
        fadeStep++;
        audio.volume = Math.max(0, initialVol * (1 - fadeStep / 8));
        if (fadeStep >= 8) {
          clearInterval(fadeInterval);
          pauseAudio();
          audio.volume = initialVol;
          setSleepTimer(0);
          showNotification('🌙 Sleep timer finished - recitation paused', '😴');
        }
      }, 500);
    }, minutes * 60 * 1000);

    showNotification(`Sleep timer set for ${minutes} minutes`, '🌙');
  }

  function updateTimerBadge() {
    if (sleepTimerMinutes <= 0) return;
    const remainingSec = Math.max(0, Math.floor((sleepTimerEndTime - Date.now()) / 1000));
    const mins = Math.ceil(remainingSec / 60);
    if (dom.timerBadge) {
      dom.timerBadge.textContent = `${mins}m`;
    }
  }

  // =========================================================================
  // 10. RECITERS MANAGEMENT
  // =========================================================================
  function selectReciter(reciterId) {
    const reciter = RECITERS.find(r => r.id === reciterId);
    if (!reciter) return;

    currentReciterId = reciter.id;
    localStorage.setItem(STORAGE_KEYS.RECITER, currentReciterId);

    const seek = audio.currentTime || 0;
    const wasPl = isPlaying;

    loadTrack(currentIndex, wasPl, seek);
    showNotification(`Reciter set to ${reciter.short}`, '🎙️');

    // Update UI tags
    if (dom.reciterChipText) dom.reciterChipText.textContent = reciter.short;
    if (dom.reciterBtnText) dom.reciterBtnText.textContent = reciter.short.split(' ')[1] || reciter.short;
    if (dom.reciterTag) dom.reciterTag.textContent = reciter.short;
    if (dom.modalReciter) dom.modalReciter.textContent = reciter.name;

    // Update Reciter Menu selection
    if (dom.reciterMenu) {
      dom.reciterMenu.querySelectorAll('.qp-dropdown-item').forEach(el => {
        const isSel = el.getAttribute('data-reciter') === reciterId;
        el.classList.toggle('is-selected', isSel);
      });
    }
  }

  // =========================================================================
  // 11. FAVORITES SYSTEM
  // =========================================================================
  function toggleFavoriteCurrent() {
    const surah = SURAHS[currentIndex];
    if (!surah) return;

    if (favorites.has(surah.id)) {
      favorites.delete(surah.id);
      showNotification(`Removed ${surah.name} from Favorites`, '🤍');
    } else {
      favorites.add(surah.id);
      showNotification(`Saved ${surah.name} to Favorites`, '❤️');
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(favorites)));
    updateFavoriteUI();
    if (activeCategory === 'favorites') {
      renderSurahList(dom.searchInput ? dom.searchInput.value : '');
    }
  }

  function updateFavoriteUI() {
    const surah = SURAHS[currentIndex];
    const isFav = surah && favorites.has(surah.id);
    if (dom.favBtn) {
      dom.favBtn.classList.toggle('is-fav', isFav);
      if (dom.favIcon) {
        dom.favIcon.setAttribute('fill', isFav ? 'currentColor' : 'none');
      }
    }
  }

  // =========================================================================
  // 12. SURAH QUEUE RENDERING & CATEGORIES
  // =========================================================================
  function renderSurahList(filterQuery = '') {
    if (!dom.surahList) return;
    dom.surahList.innerHTML = '';

    const query = filterQuery.toLowerCase().trim();
    const filtered = SURAHS.filter(s => {
      // Category filter check
      if (activeCategory === 'favorites' && !favorites.has(s.id)) return false;
      if (activeCategory === 'popular' && !CATEGORIES.POPULAR.includes(s.id)) return false;
      if (activeCategory === 'ruqyah' && !CATEGORIES.RUQYAH.includes(s.id)) return false;
      if (activeCategory === 'juz_amma' && !CATEGORIES.JUZ_AMMA.includes(s.id)) return false;

      // Text query check
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.arabic.includes(query) ||
        s.meaning.toLowerCase().includes(query) ||
        String(s.id).includes(query)
      );
    });

    if (filtered.length === 0) {
      dom.surahList.innerHTML = `
        <div style="text-align:center; padding: 40px 16px; color: var(--qp-text-muted);">
          <p style="font-size: 1.05rem; margin-bottom: 6px;">No Surahs found</p>
          <span style="font-size: 0.82rem;">Try switching categories or clear your search query.</span>
        </div>
      `;
      return;
    }

    filtered.forEach(surah => {
      const idx = surah.id - 1;
      const isCurr = idx === currentIndex;
      const isFav = favorites.has(surah.id);

      const item = document.createElement('div');
      item.className = `qp-surah-item ${isCurr ? 'is-active' : ''}`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
        <span class="qp-item-number">${surah.id}</span>
        <div class="qp-item-info">
          <div class="qp-item-title">${surah.name} (${surah.meaning}) ${isFav ? '⭐' : ''}</div>
          <div class="qp-item-meta">${surah.type} &bull; ${surah.ayahs} Ayahs</div>
        </div>
        <span class="qp-item-arabic">${surah.arabic}</span>
      `;
      item.addEventListener('click', () => {
        loadAndPlay(idx);
        closeDrawer();
      });
      dom.surahList.appendChild(item);
    });

    // Scroll active item into view
    if (!query && activeCategory === 'all') {
      const activeEl = dom.surahList.querySelector('.qp-surah-item.is-active');
      if (activeEl) {
        setTimeout(() => activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 100);
      }
    }
  }

  // =========================================================================
  // 13. DIRECT MP3 DOWNLOAD
  // =========================================================================
  function downloadCurrentSurah() {
    const surah = SURAHS[currentIndex];
    const reciter = getCurrentReciter();
    if (!surah) return;

    const url = getAudioUrl(surah.id, reciter.id);
    const filename = `Surah_${String(surah.id).padStart(3, '0')}_${surah.name}_${reciter.short.replace(/\s+/g, '_')}.mp3`;

    showNotification(`Preparing download: ${surah.name}`, '📥');

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // =========================================================================
  // 14. VIEW MANAGEMENT: DOCKED vs. MINIMIZED
  // =========================================================================
  function setMinimizedState(minimized) {
    isMinimized = !!minimized;
    localStorage.setItem(STORAGE_KEYS.MINIMIZED, isMinimized ? 'true' : 'false');

    if (isMinimized) {
      if (dom.playerBar) dom.playerBar.classList.add('is-hidden');
      if (dom.pill) dom.pill.classList.add('is-active');
      document.body.classList.remove('has-qp-docked');
      document.body.classList.add('has-qp-minimized');
    } else {
      if (dom.playerBar) dom.playerBar.classList.remove('is-hidden');
      if (dom.pill) dom.pill.classList.remove('is-active');
      document.body.classList.add('has-qp-docked');
      document.body.classList.remove('has-qp-minimized');
    }
  }

  function toggleMinimize() {
    setMinimizedState(!isMinimized);
  }

  function openModal() {
    if (dom.modal) dom.modal.classList.add('is-open');
    initWebAudioVisualizer();
    updateModalView();
  }

  function closeModal() {
    if (dom.modal) dom.modal.classList.remove('is-open');
  }

  function openDrawer() {
    if (dom.drawer) dom.drawer.classList.add('is-open');
    if (dom.drawerOverlay) dom.drawerOverlay.classList.add('is-open');
    renderSurahList();
    if (dom.searchInput) {
      setTimeout(() => dom.searchInput.focus(), 150);
    }
  }

  function closeDrawer() {
    if (dom.drawer) dom.drawer.classList.remove('is-open');
    if (dom.drawerOverlay) dom.drawerOverlay.classList.remove('is-open');
  }

  // =========================================================================
  // 15. AUDIO CONTROLS & PLAYBACK ENGINE
  // =========================================================================
  function loadTrack(index, autoPlay = true, seekTo = 0) {
    if (index < 0) index = SURAHS.length - 1;
    if (index >= SURAHS.length) index = 0;

    currentIndex = index;
    localStorage.setItem(STORAGE_KEYS.INDEX, currentIndex);

    const surah = SURAHS[currentIndex];
    const srcUrl = getAudioUrl(surah.id, currentReciterId);

    audio.src = srcUrl;
    audio.currentTime = seekTo;

    updateMetadataUI();
    updateFavoriteUI();
    updateMediaSession();

    if (autoPlay) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function playAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audio.play().then(() => {
      isPlaying = true;
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, 'true');
      updatePlayIcons();
      hideToast();
    }).catch(err => {
      console.warn("Quran player autoplay prevented:", err);
      isPlaying = false;
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, 'true');
      updatePlayIcons();
      showResumeToast();
    });
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    localStorage.setItem(STORAGE_KEYS.IS_PLAYING, 'false');
    updatePlayIcons();
  }

  function togglePlay() {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function loadAndPlay(index) {
    loadTrack(index, true, 0);
    const surah = SURAHS[index];
    if (surah) {
      showNotification(`Now Reciting: Surah ${surah.name} (${surah.arabic})`, '📖');
    }
  }

  function nextTrack() {
    let nextIdx = currentIndex + 1;
    if (isShuffled && SURAHS.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * SURAHS.length);
      } while (nextIdx === currentIndex);
    } else if (nextIdx >= SURAHS.length) {
      if (repeatMode === 'off') {
        pauseAudio();
        return;
      }
      nextIdx = 0;
    }
    loadAndPlay(nextIdx);
  }

  function prevTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = SURAHS.length - 1;
    loadAndPlay(prevIdx);
  }

  function cycleRepeatMode() {
    if (repeatMode === 'all') {
      repeatMode = 'one';
      showNotification('Loop Mode: Current Surah', '🔂');
    } else if (repeatMode === 'one') {
      repeatMode = 'off';
      showNotification('Loop Mode: Off', '➡️');
    } else {
      repeatMode = 'all';
      showNotification('Loop Mode: All Surahs', '🔁');
    }
    localStorage.setItem(STORAGE_KEYS.REPEAT, repeatMode);
    updateRepeatUI();
  }

  function toggleShuffle() {
    isShuffled = !isShuffled;
    localStorage.setItem(STORAGE_KEYS.SHUFFLE, isShuffled ? 'true' : 'false');
    showNotification(isShuffled ? 'Shuffle Mode: ON' : 'Shuffle Mode: OFF', '🔀');
    updateShuffleUI();
  }

  function cycleSpeed() {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    let idx = speeds.indexOf(playbackSpeed);
    idx = (idx + 1) % speeds.length;
    playbackSpeed = speeds[idx];
    audio.playbackRate = playbackSpeed;
    localStorage.setItem(STORAGE_KEYS.SPEED, playbackSpeed);
    if (dom.speedBtn) dom.speedBtn.textContent = `${playbackSpeed}x`;
    showNotification(`Recitation speed: ${playbackSpeed}x`, '⚡');
  }

  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val));
    audio.volume = volume;
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume);
    if (dom.volumeSlider) dom.volumeSlider.value = volume;
    updateMuteIcon();
  }

  function toggleMute() {
    if (audio.volume > 0) {
      audio.dataset.prevVolume = audio.volume;
      setVolume(0);
    } else {
      const prev = parseFloat(audio.dataset.prevVolume || '0.85');
      setVolume(prev > 0 ? prev : 0.85);
    }
  }

  function seekFraction(frac) {
    if (audio.duration && !isNaN(audio.duration)) {
      audio.currentTime = frac * audio.duration;
      updateTimeDisplay();
    }
  }

  // =========================================================================
  // 16. UI SYNCHRONIZATION
  // =========================================================================
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function updateTimeDisplay() {
    const curr = audio.currentTime || 0;
    const total = audio.duration || 0;
    const percent = total > 0 ? (curr / total) * 100 : 0;

    const formattedCurr = formatTime(curr);
    const formattedTotal = total > 0 ? formatTime(total) : '--:--';

    if (dom.timeCurr) dom.timeCurr.textContent = formattedCurr;
    if (dom.timeTotal) dom.timeTotal.textContent = formattedTotal;
    if (dom.progressFill) dom.progressFill.style.width = `${percent}%`;
    if (dom.progressBar) dom.progressBar.setAttribute('aria-valuenow', Math.round(percent));

    // Fullscreen Modal Scrubber
    if (dom.modalTimeCurr) dom.modalTimeCurr.textContent = formattedCurr;
    if (dom.modalTimeTotal) dom.modalTimeTotal.textContent = formattedTotal;
    if (dom.modalProgressFill) dom.modalProgressFill.style.width = `${percent}%`;
  }

  function updateMetadataUI() {
    const surah = SURAHS[currentIndex];
    const reciter = getCurrentReciter();
    if (!surah) return;

    // Player bar
    if (dom.surahNumber) dom.surahNumber.textContent = String(surah.id).padStart(2, '0');
    if (dom.surahTitle) dom.surahTitle.textContent = surah.name;
    if (dom.surahArabic) dom.surahArabic.textContent = surah.arabic;
    if (dom.reciterTag) dom.reciterTag.textContent = reciter.short;
    if (dom.reciterBtnText) dom.reciterBtnText.textContent = reciter.short.split(' ')[1] || reciter.short;

    // Pill
    if (dom.pillTitle) dom.pillTitle.textContent = surah.name;
    if (dom.pillSubtitle) dom.pillSubtitle.innerHTML = `<span>Surah ${surah.id}</span> &bull; <span>${reciter.short.split(' ')[0]}</span>`;

    // Modal
    if (dom.modalArabic) dom.modalArabic.textContent = `سُورَةُ ${surah.arabic}`;
    if (dom.modalTitle) dom.modalTitle.textContent = `${surah.name} • ${surah.meaning}`;
    if (dom.modalReciter) dom.modalReciter.textContent = reciter.name;
    if (dom.modalSurahNum) dom.modalSurahNum.textContent = `Surah ${surah.id} of 114`;
    if (dom.modalType) dom.modalType.textContent = surah.type;
    if (dom.modalAyahs) dom.modalAyahs.textContent = `${surah.ayahs} Ayahs`;

    // Toast
    if (dom.toastSurah) dom.toastSurah.textContent = surah.name;
  }

  function updatePlayIcons() {
    const playSvg = '<polygon points="7,4 20,12 7,20"></polygon>';
    const pauseSvg = '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>';

    // Player bar
    if (dom.playIcon) dom.playIcon.innerHTML = isPlaying ? pauseSvg : playSvg;
    if (dom.mobilePlayBtn) dom.mobilePlayBtn.querySelector('svg').innerHTML = isPlaying ? pauseSvg : playSvg;
    if (dom.playerBar) dom.playerBar.classList.toggle('is-playing', isPlaying);

    // Pill
    if (dom.pill) dom.pill.classList.toggle('is-playing', isPlaying);
    if (dom.pillPlayBtn) dom.pillPlayBtn.querySelector('svg').innerHTML = isPlaying ? pauseSvg : playSvg;

    // Modal
    if (dom.modal) dom.modal.classList.toggle('is-playing', isPlaying);
    if (dom.modalPlayBtn) dom.modalPlayBtn.querySelector('svg').innerHTML = isPlaying ? pauseSvg : playSvg;
  }

  function updateRepeatUI() {
    const btns = [dom.repeatBtn, dom.modalRepeatBtn];
    btns.forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('is-active', repeatMode !== 'off');
      if (repeatMode === 'one') {
        btn.setAttribute('title', 'Loop Mode: Current Surah (L)');
      } else if (repeatMode === 'all') {
        btn.setAttribute('title', 'Loop Mode: All Surahs (L)');
      } else {
        btn.setAttribute('title', 'Loop Mode: Off (L)');
      }
    });
  }

  function updateShuffleUI() {
    const btns = [dom.shuffleBtn, dom.modalShuffleBtn];
    btns.forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('is-active', isShuffled);
    });
  }

  function updateMuteIcon() {
    if (!dom.muteIcon) return;
    if (audio.volume === 0) {
      dom.muteIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
    } else {
      dom.muteIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      `;
    }
  }

  function updateModalView() {
    updateMetadataUI();
    updatePlayIcons();
    updateTimeDisplay();
  }

  function showResumeToast() {
    if (dom.toast) dom.toast.classList.add('is-visible');
    const resumeOnGesture = () => {
      playAudio();
      window.removeEventListener('click', resumeOnGesture);
      window.removeEventListener('keydown', resumeOnGesture);
      window.removeEventListener('touchstart', resumeOnGesture);
    };
    window.addEventListener('click', resumeOnGesture, { once: true });
    window.addEventListener('keydown', resumeOnGesture, { once: true });
    window.addEventListener('touchstart', resumeOnGesture, { once: true });
  }

  function hideToast() {
    if (dom.toast) dom.toast.classList.remove('is-visible');
  }

  // =========================================================================
  // 17. SYSTEM MEDIA SESSION API
  // =========================================================================
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const surah = SURAHS[currentIndex];
    const reciter = getCurrentReciter();
    if (!surah) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Surah ${surah.name} (${surah.arabic})`,
        artist: reciter.name,
        album: `The Holy Quran • ${surah.type} (${surah.ayahs} Ayahs)`,
        artwork: [
          { src: COVER_ART_URL, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => playAudio());
      navigator.mediaSession.setActionHandler('pause', () => pauseAudio());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) audio.currentTime = details.seekTime;
      });
    } catch (e) { }
  }

  // =========================================================================
  // 18. EVENT LISTENERS SETUP
  // =========================================================================
  function setupEventListeners() {
    // Audio engine events
    audio.addEventListener('timeupdate', () => {
      updateTimeDisplay();
      localStorage.setItem(STORAGE_KEYS.TIME, Math.floor(audio.currentTime));
    });

    audio.addEventListener('ended', () => {
      // If sleep timer is set to "End of current Surah"
      if (sleepTimerMinutes === -1) {
        pauseAudio();
        setSleepTimer(0);
        showNotification('🌙 Reached end of Surah - recitation paused', '😴');
        return;
      }

      if (repeatMode === 'one') {
        audio.currentTime = 0;
        playAudio();
      } else {
        nextTrack();
      }
    });

    audio.addEventListener('play', () => {
      isPlaying = true;
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, 'true');
      updatePlayIcons();
      hideToast();
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, 'false');
      updatePlayIcons();
    });

    audio.addEventListener('loadedmetadata', updateTimeDisplay);

    // Player bar buttons
    dom.playBtn.addEventListener('click', togglePlay);
    dom.mobilePlayBtn.addEventListener('click', togglePlay);
    dom.prevBtn.addEventListener('click', prevTrack);
    dom.nextBtn.addEventListener('click', nextTrack);
    dom.repeatBtn.addEventListener('click', cycleRepeatMode);
    dom.shuffleBtn.addEventListener('click', toggleShuffle);
    dom.speedBtn.addEventListener('click', cycleSpeed);
    dom.muteBtn.addEventListener('click', toggleMute);
    dom.favBtn.addEventListener('click', toggleFavoriteCurrent);
    if (dom.downloadBtn) dom.downloadBtn.addEventListener('click', downloadCurrentSurah);
    if (dom.modalDownloadBtn) dom.modalDownloadBtn.addEventListener('click', downloadCurrentSurah);
    dom.volumeSlider.addEventListener('input', (e) => setVolume(parseFloat(e.target.value)));

    // Reciter Selector Dropdown
    if (dom.reciterChip) {
      dom.reciterChip.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.reciterMenu.classList.toggle('is-open');
        dom.timerMenu.classList.remove('is-open');
      });
    }
    if (dom.reciterBtn) {
      dom.reciterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.reciterMenu.classList.toggle('is-open');
        dom.timerMenu.classList.remove('is-open');
      });
    }
    if (dom.reciterTag) {
      dom.reciterTag.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.reciterMenu.classList.toggle('is-open');
        dom.timerMenu.classList.remove('is-open');
      });
    }
    dom.reciterMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.qp-dropdown-item');
      if (!item) return;
      const rId = item.getAttribute('data-reciter');
      selectReciter(rId);
      dom.reciterMenu.classList.remove('is-open');
    });

    // Sleep Timer Dropdown
    dom.timerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.timerMenu.classList.toggle('is-open');
      dom.reciterMenu.classList.remove('is-open');
    });
    dom.timerMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.qp-dropdown-item');
      if (!item) return;
      const mins = parseInt(item.getAttribute('data-timer'), 10);
      setSleepTimer(mins);
      dom.timerMenu.querySelectorAll('.qp-dropdown-item').forEach(el => {
        el.classList.toggle('is-selected', parseInt(el.getAttribute('data-timer'), 10) === mins);
      });
      dom.timerMenu.classList.remove('is-open');
    });

    // Dismiss dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (dom.reciterMenu && !dom.reciterMenu.contains(e.target) && !e.target.closest('#qpReciterChip') && !e.target.closest('#qpReciterBtn') && !e.target.closest('#qpReciterTag')) {
        dom.reciterMenu.classList.remove('is-open');
      }
      if (dom.timerMenu && !dom.timerMenu.contains(e.target) && !e.target.closest('#qpTimerBtn')) {
        dom.timerMenu.classList.remove('is-open');
      }
    });

    // Minimize & Restore
    dom.minimizeBtn.addEventListener('click', () => setMinimizedState(true));
    dom.pillExpandBtn.addEventListener('click', () => setMinimizedState(false));
    dom.pillInfo.addEventListener('click', () => setMinimizedState(false));
    dom.pillArtwork.addEventListener('click', () => setMinimizedState(false));
    dom.pillPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
    dom.pillNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextTrack();
    });

    // Make pill draggable
    makePillDraggable();

    // Fullscreen Modal
    dom.coverWrap.addEventListener('click', openModal);
    dom.trackInfo.addEventListener('click', openModal);
    dom.fullscreenBtn.addEventListener('click', openModal);
    dom.modalCloseBtn.addEventListener('click', closeModal);
    dom.modalPlayBtn.addEventListener('click', togglePlay);
    dom.modalPrevBtn.addEventListener('click', prevTrack);
    dom.modalNextBtn.addEventListener('click', nextTrack);
    dom.modalRepeatBtn.addEventListener('click', cycleRepeatMode);
    dom.modalShuffleBtn.addEventListener('click', toggleShuffle);
    dom.modalReciterPill.addEventListener('click', () => {
      closeModal();
      dom.reciterMenu.classList.add('is-open');
    });

    // Queue Drawer & Category Tabs
    dom.queueBtn.addEventListener('click', openDrawer);
    dom.drawerCloseBtn.addEventListener('click', closeDrawer);
    dom.drawerOverlay.addEventListener('click', closeDrawer);
    dom.searchInput.addEventListener('input', (e) => renderSurahList(e.target.value));

    // Category Tabs in Queue
    const categoryTabs = dom.drawer.querySelectorAll('.qp-queue-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        activeCategory = tab.getAttribute('data-category');
        renderSurahList(dom.searchInput ? dom.searchInput.value : '');
      });
    });

    // Toast resume button
    dom.toastPlayBtn.addEventListener('click', playAudio);

    // Scrubber hover timestamp tooltip
    if (dom.progressBar && dom.scrubberTooltip) {
      dom.progressBar.addEventListener('mousemove', (e) => {
        const rect = dom.progressBar.getBoundingClientRect();
        const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const hoverSec = frac * (audio.duration || 0);
        dom.scrubberTooltip.textContent = formatTime(hoverSec);
        dom.scrubberTooltip.style.left = `${(frac * 100).toFixed(1)}%`;
        dom.scrubberTooltip.classList.add('is-visible');
      });
      dom.progressBar.addEventListener('mouseleave', () => {
        dom.scrubberTooltip.classList.remove('is-visible');
      });
    }

    // Scrubber click & drag handler
    function bindScrubber(barEl) {
      if (!barEl) return;
      let isDragging = false;
      const handleSeek = (e) => {
        const rect = barEl.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        seekFraction(frac);
      };
      barEl.addEventListener('click', handleSeek);
      barEl.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleSeek(e);
        const onMove = (me) => { if (isDragging) handleSeek(me); };
        const onUp = () => {
          isDragging = false;
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });
      barEl.addEventListener('touchstart', handleSeek, { passive: true });
    }
    bindScrubber(dom.progressBar);
    bindScrubber(dom.modalProgressBar);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextTrack();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevTrack();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          cycleRepeatMode();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleShuffle();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          toggleMinimize();
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          if (dom.drawer && dom.drawer.classList.contains('is-open')) closeDrawer();
          else openDrawer();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (dom.modal && dom.modal.classList.contains('is-open')) closeModal();
          else openModal();
          break;
        case 'Escape':
          closeModal();
          closeDrawer();
          if (dom.reciterMenu) dom.reciterMenu.classList.remove('is-open');
          if (dom.timerMenu) dom.timerMenu.classList.remove('is-open');
          break;
      }
    });

    // Cross-page navigation persistence
    window.addEventListener('pagehide', () => {
      localStorage.setItem(STORAGE_KEYS.TIME, audio.currentTime || '0');
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, isPlaying ? 'true' : 'false');
    });
    window.addEventListener('beforeunload', () => {
      localStorage.setItem(STORAGE_KEYS.TIME, audio.currentTime || '0');
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, isPlaying ? 'true' : 'false');
    });
  }

  // =========================================================================
  // 19. INITIALIZATION
  // =========================================================================
  function init() {
    injectPlayerDOM();
    cacheElements();
    setupEventListeners();

    // Restore UI states
    setMinimizedState(isMinimized);
    updateRepeatUI();
    updateShuffleUI();
    updateMuteIcon();
    updateFavoriteUI();
    if (dom.speedBtn) dom.speedBtn.textContent = `${playbackSpeed}x`;

    // Load track
    loadTrack(currentIndex, wasPlayingBeforeNav, savedTime);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Global API
  window.QuranPlayer = {
    surahs: SURAHS,
    reciters: RECITERS,
    getCurrentIndex: () => currentIndex,
    play: playAudio,
    pause: pauseAudio,
    toggle: togglePlay,
    next: nextTrack,
    prev: prevTrack,
    playSurah: (id) => loadAndPlay(id - 1),
    setReciter: selectReciter,
    setSleepTimer: setSleepTimer,
    toggleFavorite: toggleFavoriteCurrent,
    minimize: () => setMinimizedState(true),
    expand: () => setMinimizedState(false),
    openModal: openModal,
    closeModal: closeModal,
    openQueue: openDrawer,
    closeQueue: closeDrawer
  };
  window.QuranPlayerInstance = true;

})();
