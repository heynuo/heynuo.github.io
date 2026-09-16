/**
 * HeyNuo - Quran Library Page Controller
 * Handles 114 Surahs catalog, live search, category filtering,
 * seamless sync with window.QuranPlayer, and PDF Downloads Modal.
 */

(function () {
  'use strict';

  // Complete 114 Surahs metadata with Arabic, transliteration, meaning, ayahs, and type
  const SURAHS = (window.QuranPlayer && window.QuranPlayer.surahs) ? window.QuranPlayer.surahs : [
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
    { id: 37, name: "As-Saffat", arabic: "الصَّافَّات", meaning: "Those in Ranks", ayahs: 182, type: "Meccan" },
    { id: 38, name: "Sad", arabic: "ص", meaning: "The Letter Sad", ayahs: 88, type: "Meccan" },
    { id: 39, name: "Az-Zumar", arabic: "الزُّمَر", meaning: "The Groups", ayahs: 75, type: "Meccan" },
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
    { id: 51, name: "Adh-Dhariyat", arabic: "الذَّارِيَات", meaning: "The Scatterers", ayahs: 60, type: "Meccan" },
    { id: 52, name: "At-Tur", arabic: "الطُّور", meaning: "The Mount", ayahs: 49, type: "Meccan" },
    { id: 53, name: "An-Najm", arabic: "النَّجْم", meaning: "The Star", ayahs: 62, type: "Meccan" },
    { id: 54, name: "Al-Qamar", arabic: "القَمَر", meaning: "The Moon", ayahs: 55, type: "Meccan" },
    { id: 55, name: "Ar-Rahman", arabic: "الرَّحْمَن", meaning: "The Beneficent", ayahs: 78, type: "Medinan" },
    { id: 56, name: "Al-Waqi'ah", arabic: "الوَاقِعَة", meaning: "The Inevitable", ayahs: 96, type: "Meccan" },
    { id: 57, name: "Al-Hadid", arabic: "الحَدِيد", meaning: "The Iron", ayahs: 29, type: "Medinan" },
    { id: 58, name: "Al-Mujadilah", arabic: "المُجَادَلَة", meaning: "The Pleading Woman", ayahs: 22, type: "Medinan" },
    { id: 59, name: "Al-Hashr", arabic: "الحَشْر", meaning: "The Exile", ayahs: 24, type: "Medinan" },
    { id: 60, name: "Al-Mumtahanah", arabic: "المُمْتَحَنَة", meaning: "She to be Examined", ayahs: 13, type: "Medinan" },
    { id: 61, name: "As-Saff", arabic: "الصَّفّ", meaning: "The Ranks", ayahs: 14, type: "Medinan" },
    { id: 62, name: "Al-Jumu'ah", arabic: "الجُمُعَة", meaning: "The Friday Congregation", ayahs: 11, type: "Medinan" },
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
    { id: 76, name: "Al-Insan", arabic: "الإِنْسَان", meaning: "The Human", ayahs: 31, type: "Medinan" },
    { id: 77, name: "Al-Mursalat", arabic: "المُرْسَلَات", meaning: "The Emissaries", ayahs: 50, type: "Meccan" },
    { id: 78, name: "An-Naba", arabic: "النَّبَأ", meaning: "The Tidings", ayahs: 40, type: "Meccan" },
    { id: 79, name: "An-Nazi'at", arabic: "النَّازِعَات", meaning: "Those Who Drag Forth", ayahs: 46, type: "Meccan" },
    { id: 80, name: "'Abasa", arabic: "عَبَسَ", meaning: "He Frowned", ayahs: 42, type: "Meccan" },
    { id: 81, name: "At-Takwir", arabic: "التَّكْوِير", meaning: "The Overthrowing", ayahs: 29, type: "Meccan" },
    { id: 82, name: "Al-Infitar", arabic: "الانْفِطَار", meaning: "The Cleaving", ayahs: 19, type: "Meccan" },
    { id: 83, name: "Al-Mutaffifin", arabic: "المُطَفِّفِين", meaning: "The Dealers in Fraud", ayahs: 36, type: "Meccan" },
    { id: 84, name: "Al-Inshiqaq", arabic: "الانْشِقَاق", meaning: "The Splitting", ayahs: 25, type: "Meccan" },
    { id: 85, name: "Al-Buruj", arabic: "البُرُوج", meaning: "The Constellations", ayahs: 22, type: "Meccan" },
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
    { id: 102, name: "At-Takathur", arabic: "التَّكَاثُر", meaning: "Rivalry in World Increase", ayahs: 8, type: "Meccan" },
    { id: 103, name: "Al-'Asr", arabic: "العَصْر", meaning: "The Declining Day", ayahs: 3, type: "Meccan" },
    { id: 104, name: "Al-Humazah", arabic: "الهُمَزَة", meaning: "The Slanderer", ayahs: 9, type: "Meccan" },
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

  // Preset groups
  const POPULAR_SURAHS = [1, 2, 18, 36, 55, 56, 67];
  const RUQYAH_SURAHS = [1, 2, 109, 112, 113, 114];
  const JUZ_AMMA = Array.from({ length: 37 }, (_, i) => 78 + i);

  // PDF Copies Catalog (including user's Google Drive Collection)
  const GDRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/14VqEgzWuweEQwh9ufoQihag9dbk4OhRW";

  const QURAN_PDFS = [
    {
      id: 'quran-translit',
      title: 'Quran Complete English Transliteration',
      arabic: 'القرآن الكريم بالحروف اللاتينية والترجمة',
      desc: 'Complete Romanized English phonetic transliteration for pronunciation guidance, tajweed assistance, and non-Arabic readers. Hosted locally for fast 1-click download and mirrored on Google Drive.',
      script: 'English Transliteration',
      pages: 'Complete 114 Surahs',
      size: '1.6 MB',
      badge: '⚡ Local Fast Download',
      downloadUrl: 'assets/pdf/quran_transliteration.pdf',
      mirrorUrl: 'https://drive.google.com/uc?export=download&id=1KopwI6BEB4jckZF7wDHnyGboKKCRd8Qm',
      previewUrl: 'https://drive.google.com/file/d/1KopwI6BEB4jckZF7wDHnyGboKKCRd8Qm/view?usp=sharing',
      publisher: 'HeyNuo Drive Library'
    },
    {
      id: 'quran-tajwid-drive',
      title: 'Color-Coded Tajweed Quran Mushaf',
      arabic: 'مصحف التجويد الملون مع أحكام التلاوة',
      desc: 'Complete high-resolution digital Mushaf with color-coded phonetic Tajweed rules (Ghunnah, Qalqalah, Idgham, Madd, Ikhfa) for beautiful and correct recitation. From your Google Drive collection.',
      script: 'Tajweed Color-Coded',
      pages: 'Complete 30 Juz',
      size: '269 MB',
      badge: '📁 Google Drive Edition',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=1dYY2klWLIV7wEv06ZS6iLm4cOaaCk3O_',
      mirrorUrl: 'https://drive.google.com/file/d/1dYY2klWLIV7wEv06ZS6iLm4cOaaCk3O_/view?usp=sharing',
      previewUrl: 'https://drive.google.com/file/d/1dYY2klWLIV7wEv06ZS6iLm4cOaaCk3O_/view?usp=sharing',
      publisher: 'HeyNuo Google Drive Collection'
    },
    {
      id: 'quran-tajwid-trans-drive',
      title: 'Tajweed Quran + Transliteration + Translation',
      arabic: 'مصحف التجويد مع الترجمة الإنجليزية والنطق الصوتي',
      desc: 'Comprehensive 3-in-1 volume featuring original Arabic with color Tajweed rules, line-by-line phonetic transliteration, and English translation side-by-side. From your Google Drive collection.',
      script: 'Tajweed + Transliteration',
      pages: 'Complete 114 Surahs',
      size: '193 MB',
      badge: '📁 Google Drive Edition',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=1zJBRqPihXcyB4oM2GEa6a1baZcGiOR7k',
      mirrorUrl: 'https://drive.google.com/file/d/1zJBRqPihXcyB4oM2GEa6a1baZcGiOR7k/view?usp=sharing',
      previewUrl: 'https://drive.google.com/file/d/1zJBRqPihXcyB4oM2GEa6a1baZcGiOR7k/view?usp=sharing',
      publisher: 'HeyNuo Google Drive Collection'
    },
    {
      id: 'madinah-std',
      title: 'King Fahd Complex Madinah Mushaf',
      arabic: 'مصحف المدينة المنورة (رواية حفص)',
      desc: 'The official standard Mushaf printed in Madinah under the patronage of the King Fahd Complex. World-renowned authentic Uthmani calligraphy with pristine clarity.',
      script: 'Uthmani Naskh',
      pages: '604 Pages',
      size: '78.7 MB',
      badge: '🏛️ King Fahd Complex',
      downloadUrl: 'https://archive.org/download/quran-madinah/quran-madina.pdf',
      mirrorUrl: 'https://archive.org/download/quran-madinah/quran-madina_text.pdf',
      previewUrl: 'https://archive.org/details/quran-madinah/mode/2up',
      publisher: 'King Fahd Glorious Quran Printing Complex'
    },
    {
      id: 'indopak-16line',
      title: 'South Asian Indo-Pak 16-Line Script',
      arabic: 'مصحف الخط الباكستاني 16 سطراً للمحافظين',
      desc: 'Traditional 16-line Nastaliq Mushaf favored by students, teachers, and Huffaz across South Asia (Pakistan, India, Bangladesh) with large legible letters.',
      script: 'Indo-Pak 16 Lines',
      pages: '548 Pages',
      size: '67.6 MB',
      badge: '🕌 Indo-Pak Script',
      downloadUrl: 'https://archive.org/download/16-line-quran-with-large-font-size/16-line-quran-with-large-font-size_text.pdf',
      mirrorUrl: 'https://archive.org/download/16-line-quran-with-large-font-size/16-line-quran-with-large-font-size.pdf',
      previewUrl: 'https://archive.org/details/16-line-quran-with-large-font-size/mode/2up',
      publisher: 'Taj Company & Subcontinent Presses'
    }
  ];

  // State
  let searchQuery = '';
  let activeFilter = 'all';
  let favorites = new Set(JSON.parse(localStorage.getItem('qp_favorites') || '[1, 36, 55, 67]'));

  // DOM Elements
  const gridEl = document.getElementById('quranGrid');
  const searchInputEl = document.getElementById('quranSearch');
  const searchClearEl = document.getElementById('quranSearchClear');
  const filterRowEl = document.getElementById('quranFilters');
  const statusBarEl = document.getElementById('quranStatusBar');
  const pdfGridEl = document.getElementById('pdfGrid');
  const pdfModalBackdrop = document.getElementById('pdfModalBackdrop');
  const pdfModalTitle = document.getElementById('pdfModalTitle');
  const pdfModalBody = document.getElementById('pdfModalBody');
  const pdfModalClose = document.getElementById('pdfModalClose');
  const pdfModalDirectDownload = document.getElementById('pdfModalDirectDownload');
  const pdfModalOnlineRead = document.getElementById('pdfModalOnlineRead');

  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const heroShuffleBtn = document.getElementById('heroShuffleBtn');
  const heroPlayerTitle = document.getElementById('heroPlayerTitle');
  const heroPlayerSubtitle = document.getElementById('heroPlayerSubtitle');

  // Filters definition
  const FILTERS = [
    { key: 'all', label: 'All Surahs', count: 114 },
    { key: 'meccan', label: 'Meccan', count: 86 },
    { key: 'medinan', label: 'Medinan', count: 28 },
    { key: 'popular', label: 'Popular', count: POPULAR_SURAHS.length },
    { key: 'ruqyah', label: 'Ruqyah', count: RUQYAH_SURAHS.length },
    { key: 'juz_amma', label: "Juz 'Amma", count: JUZ_AMMA.length },
    { key: 'favorites', label: '⭐ Favorites', count: 0 }
  ];

  function getFilteredSurahs() {
    const q = searchQuery.toLowerCase().trim();
    return SURAHS.filter(s => {
      // Category check
      if (activeFilter === 'meccan' && s.type !== 'Meccan') return false;
      if (activeFilter === 'medinan' && s.type !== 'Medinan') return false;
      if (activeFilter === 'popular' && !POPULAR_SURAHS.includes(s.id)) return false;
      if (activeFilter === 'ruqyah' && !RUQYAH_SURAHS.includes(s.id)) return false;
      if (activeFilter === 'juz_amma' && !JUZ_AMMA.includes(s.id)) return false;
      if (activeFilter === 'favorites' && !favorites.has(s.id)) return false;

      // Search check
      if (!q) return true;
      const haystack = [
        s.id.toString(),
        s.name,
        s.arabic,
        s.meaning,
        s.type
      ].join(' ').toLowerCase();

      return haystack.includes(q);
    });
  }

  function renderFilterPills() {
    if (!filterRowEl) return;
    const favCount = favorites.size;
    FILTERS.find(f => f.key === 'favorites').count = favCount;

    filterRowEl.innerHTML = FILTERS.map(f => {
      const isActive = activeFilter === f.key;
      return `
        <button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-filter="${f.key}">
          <span>${f.label}</span>
          <span class="pill-count">${f.count}</span>
        </button>
      `;
    }).join('');
  }

  function getCurrentPlayingSurahId() {
    if (window.QuranPlayer && typeof window.QuranPlayer.getCurrentIndex === 'function') {
      const idx = window.QuranPlayer.getCurrentIndex();
      return (idx >= 0 && idx < SURAHS.length) ? SURAHS[idx].id : 1;
    }
    const saved = parseInt(localStorage.getItem('qp_track_index') || '0', 10);
    return saved + 1;
  }

  function isAudioPlayingCurrently() {
    return localStorage.getItem('qp_is_playing') === 'true';
  }

  function updateHeroPlayerMeta() {
    const currentId = getCurrentPlayingSurahId();
    const surah = SURAHS.find(s => s.id === currentId) || SURAHS[0];
    const isPlaying = isAudioPlayingCurrently();

    if (heroPlayerTitle) {
      heroPlayerTitle.innerHTML = `Surah ${surah.id}. ${escapeHtml(surah.name)} <span style="font-family:'Amiri', serif; font-size:1.15rem; color:#10b981;">${surah.arabic}</span>`;
    }
    if (heroPlayerSubtitle) {
      heroPlayerSubtitle.textContent = `${surah.meaning} • ${surah.ayahs} Ayahs • ${surah.type}`;
    }
    if (heroPlayBtn) {
      heroPlayBtn.innerHTML = isPlaying ? '⏸' : '▶';
      heroPlayBtn.setAttribute('title', isPlaying ? 'Pause Surah' : `Play Surah ${surah.name}`);
    }
  }

  function renderGrid() {
    if (!gridEl) return;
    const list = getFilteredSurahs();
    const currentPlayingId = getCurrentPlayingSurahId();
    const isPlaying = isAudioPlayingCurrently();

    if (statusBarEl) {
      if (searchQuery || activeFilter !== 'all') {
        statusBarEl.innerHTML = `<span>Showing <strong>${list.length}</strong> of 114 Surahs</span><span>Use controls below or click card to play</span>`;
      } else {
        statusBarEl.innerHTML = `<span>Showing all <strong>114 Surahs</strong></span><span>Continuous recitation enabled</span>`;
      }
    }

    if (!list.length) {
      gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; border: 1px dashed var(--border); border-radius: 20px;">
          <h3 style="font-size:1.25rem; margin-bottom:8px;">🔍 No Surahs match "${escapeHtml(searchQuery)}"</h3>
          <p style="color:var(--muted); margin-bottom:14px;">Try searching for a different surah name, meaning, or reset your filters.</p>
          <button type="button" class="btn btn-secondary" id="resetQuranFiltersBtn">Reset Filters</button>
        </div>
      `;
      const btn = document.getElementById('resetQuranFiltersBtn');
      if (btn) {
        btn.onclick = () => {
          searchQuery = '';
          if (searchInputEl) searchInputEl.value = '';
          if (searchClearEl) searchClearEl.classList.remove('visible');
          activeFilter = 'all';
          render();
        };
      }
      return;
    }

    gridEl.innerHTML = list.map(surah => {
      const isCurrent = (surah.id === currentPlayingId);
      const isCardPlaying = (isCurrent && isPlaying);
      const isFav = favorites.has(surah.id);

      return `
        <article class="surah-card ${isCardPlaying ? 'is-playing' : ''}" data-surah="${surah.id}">
          <div class="surah-top">
            <span class="surah-number-badge">${String(surah.id).padStart(2, '0')}</span>
            <div class="surah-badges">
              <span class="type-pill ${surah.type.toLowerCase()}">${surah.type}</span>
              <button type="button" class="card-fav-btn ${isFav ? 'active' : ''}" data-action="toggle-fav" data-id="${surah.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
                ${isFav ? '⭐' : '☆'}
              </button>
            </div>
          </div>

          <div class="surah-arabic" dir="rtl">${surah.arabic}</div>
          <h3>${escapeHtml(surah.name)}</h3>
          <div class="surah-translit">${escapeHtml(surah.meaning)}</div>

          <div class="surah-meta">
            <span>${surah.type}</span>
            <span>${surah.ayahs} Ayahs</span>
          </div>

          <div class="surah-actions">
            <button type="button" class="surah-action-btn primary" data-action="play-surah" data-id="${surah.id}">
              ${isCardPlaying ? `
                <div class="card-soundwave"><span></span><span></span><span></span></div>
                <span>Playing</span>
              ` : `
                <span>▶ Play Audio</span>
              `}
            </button>
            <a class="surah-action-btn secondary" href="https://www.alislam.org/quran/app/?surah=${surah.id}" target="_blank" rel="noopener noreferrer" title="Read in Al-Islam Quran App">
              <span>Al-Islam App ↗</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderPdfSection() {
    if (!pdfGridEl) return;
    pdfGridEl.innerHTML = QURAN_PDFS.map(pdf => {
      return `
        <div class="pdf-card" data-pdf="${pdf.id}">
          <div class="pdf-card-top">
            <div class="pdf-icon-wrap" aria-hidden="true">📖</div>
            <span class="pdf-format-pill">${escapeHtml(pdf.badge || 'PDF Document')}</span>
          </div>

          <div class="pdf-arabic-title">${escapeHtml(pdf.arabic)}</div>
          <h3>${escapeHtml(pdf.title)}</h3>
          <p class="pdf-description">${escapeHtml(pdf.desc)}</p>

          <div class="pdf-specs">
            <span class="pdf-spec-chip">📄 ${escapeHtml(pdf.pages)}</span>
            <span class="pdf-spec-chip">💾 ${escapeHtml(pdf.size)}</span>
            <span class="pdf-spec-chip">✍️ ${escapeHtml(pdf.script)}</span>
          </div>

          <div class="pdf-actions">
            <a href="${pdf.downloadUrl}" target="_blank" rel="noopener noreferrer" class="pdf-download-btn" title="Download official high-resolution PDF copy" download>
              <span>📥 Download PDF</span>
            </a>
            <button type="button" class="pdf-preview-btn" data-action="preview-pdf" data-pdf-id="${pdf.id}" title="Read / Preview online">
              <span>👁️ Preview</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openPdfModal(pdfId) {
    const pdf = QURAN_PDFS.find(p => p.id === pdfId);
    if (!pdf || !pdfModalBackdrop) return;

    if (pdfModalTitle) {
      pdfModalTitle.innerHTML = `📖 ${escapeHtml(pdf.title)} <span style="font-family:'Amiri', serif; font-size:1.1rem; color:#10b981; margin-left:8px;">${pdf.arabic}</span>`;
    }

    if (pdfModalBody) {
      pdfModalBody.innerHTML = `
        <div class="pdf-modal-preview-box">
          <div style="font-size: 2.8rem; margin-bottom: 12px;">🕌</div>
          <h4 style="font-size: 1.2rem; margin-bottom: 6px;">${escapeHtml(pdf.title)}</h4>
          <p style="color:var(--muted); font-size:0.9rem; max-width:540px; margin:0 auto 16px;">
            ${escapeHtml(pdf.desc)}
          </p>
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <span class="pdf-spec-chip">📄 ${escapeHtml(pdf.pages)}</span>
            <span class="pdf-spec-chip">💾 File Size: ${escapeHtml(pdf.size)}</span>
            <span class="pdf-spec-chip">✍️ Script: ${escapeHtml(pdf.script)}</span>
            <span class="pdf-spec-chip">🏛️ ${escapeHtml(pdf.publisher)}</span>
          </div>
        </div>

        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
          <strong style="color:#10b981;">Reading Advice:</strong> You can download the complete high-resolution PDF file directly to your device for offline study, or open the online interactive reader with double-page flip mode.
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <a href="${pdf.downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="justify-content:center; padding:12px 20px;" download>
            <span>📥 Direct Download PDF (${escapeHtml(pdf.size)})</span>
          </a>
          <a href="${pdf.mirrorUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="justify-content:center; padding:10px 20px;" download>
            <span>⚡ Alternative Download Mirror</span>
          </a>
          <a href="${pdf.previewUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="justify-content:center; padding:10px 20px;">
            <span>📖 Open Interactive Online Flip-Book Reader ↗</span>
          </a>
        </div>
      `;
    }

    if (pdfModalDirectDownload) {
      pdfModalDirectDownload.href = pdf.downloadUrl;
    }
    if (pdfModalOnlineRead) {
      pdfModalOnlineRead.href = pdf.previewUrl;
    }

    pdfModalBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closePdfModal() {
    if (!pdfModalBackdrop) return;
    pdfModalBackdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  function toggleFavorite(id) {
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    localStorage.setItem('qp_favorites', JSON.stringify(Array.from(favorites)));
    render();
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

  function render() {
    renderFilterPills();
    renderGrid();
    updateHeroPlayerMeta();
  }

  // Setup Event Handlers
  function setupListeners() {
    // Search
    if (searchInputEl) {
      searchInputEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClearEl) {
          if (searchQuery) searchClearEl.classList.add('visible');
          else searchClearEl.classList.remove('visible');
        }
        render();
      });
    }

    if (searchClearEl) {
      searchClearEl.addEventListener('click', () => {
        searchQuery = '';
        searchInputEl.value = '';
        searchClearEl.classList.remove('visible');
        render();
      });
    }

    // Filter Pills
    if (filterRowEl) {
      filterRowEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        activeFilter = btn.dataset.filter;
        render();
      });
    }

    // Grid Actions
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const playBtn = e.target.closest('[data-action="play-surah"]');
        if (playBtn) {
          const surahId = Number(playBtn.dataset.id);
          const currentId = getCurrentPlayingSurahId();
          if (window.QuranPlayer) {
            if (currentId === surahId && isAudioPlayingCurrently()) {
              window.QuranPlayer.pause();
            } else {
              window.QuranPlayer.playSurah(surahId);
            }
          }
          setTimeout(render, 150);
          return;
        }

        const favBtn = e.target.closest('[data-action="toggle-fav"]');
        if (favBtn) {
          const surahId = Number(favBtn.dataset.id);
          toggleFavorite(surahId);
          return;
        }
      });
    }

    // PDF Preview Actions
    if (pdfGridEl) {
      pdfGridEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="preview-pdf"]');
        if (btn) {
          const pdfId = btn.dataset.pdfId;
          openPdfModal(pdfId);
        }
      });
    }

    // PDF Modal Close
    if (pdfModalClose) {
      pdfModalClose.addEventListener('click', closePdfModal);
    }
    if (pdfModalBackdrop) {
      pdfModalBackdrop.addEventListener('click', (e) => {
        if (e.target === pdfModalBackdrop) closePdfModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pdfModalBackdrop && pdfModalBackdrop.classList.contains('show')) {
        closePdfModal();
      }
    });

    // Hero Play Button
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener('click', () => {
        const currentId = getCurrentPlayingSurahId();
        if (window.QuranPlayer) {
          if (isAudioPlayingCurrently()) {
            window.QuranPlayer.pause();
          } else {
            window.QuranPlayer.playSurah(currentId);
          }
        }
        setTimeout(render, 150);
      });
    }

    // Hero Shuffle Button
    if (heroShuffleBtn) {
      heroShuffleBtn.addEventListener('click', () => {
        const randomId = Math.floor(Math.random() * 114) + 1;
        if (window.QuranPlayer) {
          window.QuranPlayer.playSurah(randomId);
        }
        setTimeout(render, 150);
      });
    }

    // Listen to audio changes from window.QuranPlayer
    window.addEventListener('storage', (e) => {
      if (e.key === 'qp_track_index' || e.key === 'qp_is_playing' || e.key === 'qp_favorites') {
        if (e.key === 'qp_favorites') {
          favorites = new Set(JSON.parse(localStorage.getItem('qp_favorites') || '[]'));
        }
        render();
      }
    });

    // Poll player state periodically while on page to sync playback highlight
    setInterval(() => {
      const currentPlaying = isAudioPlayingCurrently();
      const currentId = getCurrentPlayingSurahId();
      const activeCard = document.querySelector('.surah-card.is-playing');
      const activeCardId = activeCard ? Number(activeCard.dataset.surah) : null;

      if (currentPlaying && activeCardId !== currentId) {
        render();
      } else if (!currentPlaying && activeCard) {
        render();
      }
    }, 1000);
  }

  function init() {
    renderFilterPills();
    renderGrid();
    renderPdfSection();
    updateHeroPlayerMeta();
    setupListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
