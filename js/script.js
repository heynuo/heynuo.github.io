/* ============================================
HeyNuo – Global Scripts (Production Final v3)
============================================ */

const CONFIG = Object.freeze({
  siteUrl: 'https://heynuo.github.io',
  searchDebounceMs: 300,
  smoothScrollBehavior: 'smooth',
  mobileMenuBreakpoint: 768,
  debug: false,
  selectors: {
    menuBtn: '#menu-btn',
    navLinks: '#nav-links',
    scrollTop: '#scrollToTop',
    cardsContainer: '#cards-container',
    searchInput: '#searchInput',
    filterButtons: '#filter-buttons',
    contactForm: '#contact-form',
    formStatus: '#form-status'
  },
  messages: {
    emptySearch: 'No articles found. Try a different search or filter.',
    sending: '✓ Sending...',
    sentSuccess: '✅ Thank you! Your message has been sent. I\'ll reply within 24-48 hours.',
    sendError: '❌ Failed to send. Please email me directly at contact@heynuo.com'
  }
});

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  posts: [],
  activeCategory: 'all',
  searchTerm: ''
};

// ✅ REAL ARTICLE LINKS (trimmed, no trailing spaces)
const POSTS = Object.freeze([
  {
    title: "Java OOP Crash Course",
    excerpt: "Learn object-oriented programming with Java – classes, inheritance, polymorphism, and real-world examples.",
    category: "Java",
    link: "java-oop.html",
    date: "2026-06-02",
    readTime: "8 min read",
    tags: ["OOP", "Java", "Beginners"],
    banner: "assets/banners/java-oop.jpg",
    takeaways: [
      "Master classes, objects, constructors, and field encapsulation with getters/setters",
      "Understand the 4 OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction",
      "Real-world code examples and memory model breakdowns (Stack vs. Heap)",
      "Clean code conventions and practical exercises for beginners"
    ]
  },
  {
    title: "Jinn & Islamic Theology",
    excerpt: "Authentic research on Jinn, sihr, and Islamic theology from Quran & Sunnah.",
    category: "Research",
    link: "jinn-islamic-theology.html",
    date: "2026-06-02",
    readTime: "15 min read",
    tags: ["Islam", "Quran", "Research"],
    banner: "assets/banners/ruqyah-theology.jpg",
    takeaways: [
      "Authentic theology of the unseen world rooted strictly in Qur'an & Sahih Hadith",
      "Distinguishing valid Ruqyah Shariyah from prohibited superstitious practices",
      "The foundational healing verses: Ayat al-Kursi, Al-Fatihah, and Al-Mu'awwidhat",
      "Prophetic morning & evening adhkar, daily spiritual protection, and wellness"
    ]
  },
  {
    title: "Modern Web Development Guide",
    excerpt: "Build beautiful websites with HTML, CSS, JavaScript, and deploy for free on GitHub Pages.",
    category: "Web Dev",
    link: "web-dev-guide.html",
    date: "2026-06-02",
    readTime: "10 min read",
    tags: ["HTML", "CSS", "GitHub Pages"],
    banner: "assets/banners/web-dev.jpg",
    takeaways: [
      "Semantic HTML5 architecture and accessible landmark navigation",
      "Modern CSS design system with CSS layers (@layer), custom properties, and fluid typography",
      "Clean Vanilla JavaScript patterns with zero third-party framework bloat",
      "One-click free custom domain hosting and automated deployment on GitHub Pages"
    ]
  }
]);

// DOM utilities
const $ = {
  get: (selector, parent = document) => parent.querySelector(selector),
  getAll: (selector, parent = document) => parent.querySelectorAll(selector),
  on: (el, event, handler, options) => el?.addEventListener(event, handler, options),
  toggleClass: (el, className) => el?.classList.toggle(className),
  hasClass: (el, className) => el?.classList.contains(className),
  setText: (el, text) => { if (el) el.textContent = text; },
  setHtml: (el, html) => { if (el) el.innerHTML = html; }
};

// Page detection
const Page = {
  isHome: () => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return path === '/' || path.endsWith('/index.html');
  },
  getCurrentPage: () => {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '') path = 'index.html';
    return path.includes('#') ? path.split('#')[0] : path;
  }
};

function prefersReducedMotion() {
  return REDUCED_MOTION.matches;
}

function log(type, ...args) {
  if (!CONFIG.debug) return;
  console[type]?.(...args);
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------- Toast Notifications ----------
function showToast(message, icon = '✨', duration = 2800) {
  let container = $.get('#toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span><span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ---------- Bookmarks Management ----------
const Bookmarks = {
  key: 'heynuo-bookmarks',
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  },
  has(url) {
    if (!url) return false;
    const cleanUrl = url.split('#')[0];
    return this.get().some(b => b.url.split('#')[0] === cleanUrl);
  },
  toggle(url, title) {
    let list = this.get();
    const cleanUrl = url.split('#')[0];
    const exists = list.some(b => b.url.split('#')[0] === cleanUrl);
    if (exists) {
      list = list.filter(b => b.url.split('#')[0] !== cleanUrl);
      localStorage.setItem(this.key, JSON.stringify(list));
      showToast('Removed from bookmarks', '🗑️');
      return false;
    } else {
      list.push({ url, title, date: new Date().toISOString() });
      localStorage.setItem(this.key, JSON.stringify(list));
      showToast('Saved to bookmarks ⭐', '⭐');
      return true;
    }
  }
};

// ---------- Theme Management ----------
function initTheme() {
  const saved = localStorage.getItem('heynuo-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('heynuo-theme', theme);
  const btn = $.get('#theme-toggle');
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? '<img src="assets/icons/sun.png" alt="Light mode" width="20" height="20" class="theme-icon">'
      : '<img src="assets/icons/moon.png" alt="Dark mode" width="20" height="20" class="theme-icon">';
  }
}

function initThemeToggle() {
  const btn = $.get('#theme-toggle');
  if (!btn) return;
  $.on(btn, 'click', (e) => {
    btn.classList.add('rotating');
    setTimeout(() => btn.classList.remove('rotating'), 400);
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition || prefersReducedMotion()) {
      applyTheme(next);
      showToast(
        next === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode',
        next === 'dark' ? '<img src="assets/icons/moon.png" width="16" height="16" alt="">' : '<img src="assets/icons/sun.png" width="16" height="16" alt="">'
      );
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      applyTheme(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 480,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });

    showToast(
      next === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode',
      next === 'dark' ? '<img src="assets/icons/moon.png" width="16" height="16" alt="">' : '<img src="assets/icons/sun.png" width="16" height="16" alt="">'
    );
  });
}

// ---------- Mobile Menu ----------
function initMobileMenu() {
  const menuBtn = $.get(CONFIG.selectors.menuBtn);
  const navLinks = $.get(CONFIG.selectors.navLinks);
  if (!menuBtn || !navLinks) return;

  const toggleMenu = (force) => {
    const isOpen = force !== undefined ? force : !navLinks.classList.contains('show');
    navLinks.classList.toggle('show', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // Focus trapping
    if (isOpen) {
      const focusable = navLinks.querySelectorAll('a[href], button');
      if (focusable.length) focusable[0].focus();
    }
  };

  $.on(menuBtn, 'click', () => toggleMenu());

  $.getAll('a', navLinks).forEach(link => {
    $.on(link, 'click', () => toggleMenu(false));
  });

  // Close when clicking outside the menu and the toggle
  $.on(document, 'click', (e) => {
    if (navLinks.classList.contains('show') &&
        !navLinks.contains(e.target) &&
        !menuBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });

  $.on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('show')) {
      toggleMenu(false);
      menuBtn.focus();
    }
    // Tab trapping inside menu
    if (navLinks.classList.contains('show') && e.key === 'Tab') {
      const focusable = navLinks.querySelectorAll('a[href], button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  let resizeTimer;
  $.on(window, 'resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > CONFIG.mobileMenuBreakpoint && navLinks.classList.contains('show')) {
        toggleMenu(false);
      }
    }, 100);
  });
}

// ---------- Active Navigation ----------
function initActiveNav() {
  const currentPath = window.location.pathname;
  $.getAll('.nav-links a').forEach(link => {
    let href = link.getAttribute('href');
    if (!href) return;

    if (href.startsWith('http')) {
      try {
        const url = new URL(href);
        href = url.pathname.split('/').pop() || 'index.html';
      } catch {
        href = href.split('/').pop() || 'index.html';
      }
    }

    const linkPath = new URL(href, window.location.origin).pathname;
    const isActive = linkPath === currentPath ||
      (currentPath === '/' && (linkPath === '/' || linkPath.endsWith('index.html')));

    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function initSmoothScroll() {
  if (prefersReducedMotion()) return;
  $.getAll('a[href^="#"]').forEach(anchor => {
    $.on(anchor, 'click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = $.get(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: CONFIG.smoothScrollBehavior, block: 'start' });
        history.pushState(null, null, targetId);
      }
    });
  });
}

function initScrollToTop() {
  const btn = $.get(CONFIG.selectors.scrollTop);
  if (!btn) return;
  const circle = $.get('#scrollProgressCircle');

  const updateScroll = () => {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    btn.classList.toggle('visible', scrollY > 280);

    if (circle && docH > 0) {
      const scrollPercent = Math.min(Math.max((scrollY / docH) * 100, 0), 100);
      circle.style.strokeDashoffset = (100 - scrollPercent).toFixed(1);
    }
  };

  $.on(window, 'scroll', updateScroll, { passive: true });
  updateScroll();

  $.on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : CONFIG.smoothScrollBehavior });
  });

  $.on(btn, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : CONFIG.smoothScrollBehavior });
    }
  });
}

// ---------- Skip Link ----------
function initSkipLink() {
  const skip = $.get('.skip-link');
  if (!skip) return;
  $.on(skip, 'click', (e) => {
    const target = $.get(skip.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.setAttribute('tabindex', '-1');
    target.focus();
    // Remove tabindex on blur, not synchronously, or focus drops to <body>
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  });
}

// ---------- Search & Filter ----------
const Articles = {
  elements: null,
  debounceTimer: null,

  init() {
    if (!Page.isHome()) return;
    this.elements = {
      container: $.get(CONFIG.selectors.cardsContainer),
      search: $.get(CONFIG.selectors.searchInput),
      filters: $.get(CONFIG.selectors.filterButtons)
    };
    if (!this.elements.container) return;

    // Trim posts data and precompute search text
    state.posts = POSTS.map(p => ({
      ...p,
      title: p.title.trim(),
      excerpt: p.excerpt.trim(),
      category: p.category.trim(),
      link: p.link.trim(),
      searchText: `${p.title} ${p.excerpt} ${p.category}`.toLowerCase()
    }));

    if (state.posts.length === 0) {
      $.setHtml(this.elements.container, '<p class="empty-msg">No articles yet. Check back soon!</p>');
      return;
    }

    this.restoreFromUrl();
    this.renderFilters();
    this.renderCards();
    this.bindEvents();
    // renderCards() already announces the filtered count
  },

  renderFilters() {
    if (!this.elements.filters) return;
    const categories = ['all', ...new Set(state.posts.map(p => p.category)), 'saved'];
    this.elements.filters.innerHTML = categories.map((cat) => {
      let label = cat;
      if (cat === 'all') label = 'All';
      else if (cat === 'saved') label = '⭐ Saved';
      return `
        <button class="filter-btn${cat === state.activeCategory ? ' active' : ''}"
                data-category="${escapeHTML(cat)}"
                role="tab"
                aria-selected="${cat === state.activeCategory}"
                id="tab-${escapeHTML(cat)}"
                tabindex="${cat === state.activeCategory ? 0 : -1}">
          ${escapeHTML(label)}
        </button>
      `;
    }).join('');
  },

  getFilteredPosts() {
    const term = state.searchTerm.toLowerCase().trim();
    return state.posts.filter(post => {
      const tagsStr = (post.tags || []).join(' ').toLowerCase();
      const matchesSearch = !term || post.searchText.includes(term) || tagsStr.includes(term);
      let matchesCategory = false;
      if (state.activeCategory === 'all') {
        matchesCategory = true;
      } else if (state.activeCategory === 'saved') {
        matchesCategory = Bookmarks.has(post.link);
      } else {
        matchesCategory = post.category === state.activeCategory;
      }
      return matchesSearch && matchesCategory;
    });
  },

  highlightMatch(text, query) {
    if (!query || !query.trim()) return escapeHTML(text);
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapeHTML(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  },

  createCardElement(post) {
    const isExternal = post.link.startsWith('http');
    const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer" aria-label="Opens in a new tab"' : '';

    const dateFormatted = post.date
      ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    const highlightedTitle = this.highlightMatch(post.title, state.searchTerm);
    const highlightedExcerpt = this.highlightMatch(post.excerpt, state.searchTerm);

    const tagsHtml = post.tags && post.tags.length ? `
      <div class="card-tags">
        ${post.tags.map(t => `<button type="button" class="tag-pill${state.searchTerm.toLowerCase().includes(t.toLowerCase()) ? ' active' : ''}" data-tag="${escapeHTML(t)}">#${escapeHTML(t)}</button>`).join('')}
      </div>
    ` : '';

    const isBookmarked = Bookmarks.has(post.link);

    let catIcon = '';
    const catLower = (post.category || '').toLowerCase();
    if (catLower.includes('java')) catIcon = '<img src="assets/icons/java.png" alt="" class="badge-icon" width="14" height="14"> ';
    else if (catLower.includes('web')) catIcon = '<img src="assets/icons/html5.png" alt="" class="badge-icon" width="14" height="14"> ';
    else if (catLower.includes('research') || catLower.includes('islam')) catIcon = '<img src="assets/icons/quran.png" alt="" class="badge-icon" width="14" height="14"> ';

    const bannerHtml = post.banner ? `
      <div class="card-banner-box">
        <img src="${escapeHTML(post.banner)}" alt="${escapeHTML(post.title)}" class="card-banner-img" loading="lazy" width="600" height="338">
        <div class="card-banner-overlay"></div>
        <span class="card-banner-category">${catIcon}${escapeHTML(post.category)}</span>
      </div>
    ` : '';

    const article = document.createElement('article');
    article.className = 'card reveal revealed';
    article.innerHTML = `
      ${bannerHtml}
      <div class="card-body">
        ${!post.banner ? `<span class="category">${catIcon}${escapeHTML(post.category)}</span>` : ''}
        ${(dateFormatted || post.readTime) ? `
        <div class="card-meta">
          ${dateFormatted ? `<span><img src="assets/icons/calendar.png" alt="" class="meta-icon" width="14" height="14"> ${escapeHTML(dateFormatted)}</span>` : ''}
          ${post.readTime ? `<span><img src="assets/icons/clock.png" alt="" class="meta-icon" width="14" height="14"> ${escapeHTML(post.readTime)}</span>` : ''}
        </div>` : ''}
        <h3><a href="${escapeHTML(post.link)}" ${targetAttr}>${highlightedTitle}</a></h3>
        <p>${highlightedExcerpt}</p>
        ${tagsHtml}
      </div>
      <div class="card-footer">
        <a href="${escapeHTML(post.link)}" ${targetAttr} class="read-more">Read More →</a>
        <div class="card-actions">
          <button type="button" class="card-preview-btn" data-link="${escapeHTML(post.link)}" title="Quick Key Takeaways" aria-label="Quick Key Takeaways">⚡ Preview</button>
          <button type="button" class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-url="${escapeHTML(post.link)}" data-title="${escapeHTML(post.title)}" title="${isBookmarked ? 'Remove bookmark' : 'Save article'}" aria-label="Bookmark article">
            <img src="assets/icons/bookmark.png" alt="" class="btn-icon" width="14" height="14"> <span>${isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
          <button type="button" class="card-share-btn" data-url="${escapeHTML(post.link)}" title="Copy article link" aria-label="Copy article link"><img src="assets/icons/share.png" alt="" class="btn-icon" width="14" height="14"> Share</button>
        </div>
      </div>
    `;
    return article;
  },

  renderCards() {
    if (!this.elements.container) return;
    const filtered = this.getFilteredPosts();

    if (filtered.length === 0) {
      const msg = state.activeCategory === 'saved'
        ? 'No saved articles yet. Click the ☆ Save button on any article to keep it here for quick reference!'
        : CONFIG.messages.emptySearch;
      $.setHtml(this.elements.container, `<p class="empty-msg" role="status">${escapeHTML(msg)}</p>`);
      this.announceResults(0);
      this.updateCountBadge(0, state.posts.length);
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(post => {
      // Append the element directly to the fragment
      fragment.appendChild(this.createCardElement(post));
    });

    this.elements.container.innerHTML = '';
    this.elements.container.appendChild(fragment);
    this.announceResults(filtered.length);
    this.updateCountBadge(filtered.length, state.posts.length);
  },

  updateCountBadge(shown, total) {
    const badge = $.get('#articleCountBadge');
    if (!badge) return;
    if (shown === total) {
      badge.textContent = `${total} article${total !== 1 ? 's' : ''}`;
    } else {
      badge.textContent = `${shown} of ${total}`;
    }
  },

  setupSearch() {
    if (!this.elements.search) return;

    const wrapper = $.get('#searchWrapper');
    const clearBtn = $.get('#searchClear');
    const matchCount = $.get('#searchMatchCount');
    const dropdown = $.get('#searchDropdown');
    const suggestChips = $.getAll('.search-suggest-chip');
    let selectedIndex = -1;

    const updateMatchCount = (count, hasTerm) => {
      if (!matchCount) return;
      if (hasTerm) {
        matchCount.textContent = `${count} found`;
        matchCount.classList.add('visible');
      } else {
        matchCount.textContent = '';
        matchCount.classList.remove('visible');
      }
    };

    const renderDropdown = (query) => {
      if (!dropdown) return;
      const term = (query || '').trim().toLowerCase();

      if (!term) {
        dropdown.innerHTML = `
          <div class="search-drop-header">⚡ Featured Guides &amp; Research</div>
          ${state.posts.map((p, idx) => `
            <a href="${escapeHTML(p.link)}" class="search-drop-item" data-index="${idx}">
              <img src="${escapeHTML(p.banner || 'assets/banners/hero-banner.jpg')}" alt="" class="search-drop-thumb">
              <div class="search-drop-info">
                <div class="search-drop-title">${escapeHTML(p.title)}</div>
                <div class="search-drop-meta">
                  <span class="search-drop-badge">${escapeHTML(p.category)}</span>
                  <span>${escapeHTML(p.readTime || '')}</span>
                </div>
              </div>
            </a>
          `).join('')}
          <div class="search-drop-footer">
            <span>Tip: Press <kbd>/</kbd> anytime to search</span>
            <span>ESC to close</span>
          </div>
        `;
        dropdown.classList.add('active');
        selectedIndex = -1;
        return;
      }

      const matches = state.posts.filter(p => p.searchText.includes(term));

      if (matches.length === 0) {
        dropdown.innerHTML = `
          <div style="padding: 16px; text-align: center; color: var(--muted); font-size: 13.5px;">
            <p style="margin-bottom: 4px; font-weight: 700; color: var(--text);">No matching articles for "${escapeHTML(query)}"</p>
            <p style="margin: 0; font-size: 12px;">Try searching for <strong>Java</strong>, <strong>Ruqyah</strong>, or <strong>Web Dev</strong>.</p>
          </div>
        `;
        dropdown.classList.add('active');
        selectedIndex = -1;
        return;
      }

      dropdown.innerHTML = `
        <div class="search-drop-header">${matches.length} article${matches.length !== 1 ? 's' : ''} matching "${escapeHTML(query)}"</div>
        ${matches.map((p, idx) => {
          const highlightedTitle = this.highlightMatch(p.title, query);
          return `
            <a href="${escapeHTML(p.link)}" class="search-drop-item" data-index="${idx}">
              <img src="${escapeHTML(p.banner || 'assets/banners/hero-banner.jpg')}" alt="" class="search-drop-thumb">
              <div class="search-drop-info">
                <div class="search-drop-title">${highlightedTitle}</div>
                <div class="search-drop-meta">
                  <span class="search-drop-badge">${escapeHTML(p.category)}</span>
                  <span>${escapeHTML(p.readTime || '')}</span>
                </div>
              </div>
            </a>
          `;
        }).join('')}
        <div class="search-drop-footer">
          <span>↑↓ navigate • ↵ open</span>
          <span>ESC to close</span>
        </div>
      `;
      dropdown.classList.add('active');
      selectedIndex = -1;
    };

    const closeDropdown = () => {
      if (dropdown) dropdown.classList.remove('active');
      selectedIndex = -1;
    };

    // Search input typing with debounce
    $.on(this.elements.search, 'input', (e) => {
      const val = e.target.value;
      const hasVal = !!val.trim();

      if (wrapper) wrapper.classList.toggle('has-query', hasVal);
      if (clearBtn) clearBtn.classList.toggle('visible', hasVal);

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        state.searchTerm = val;
        this.renderCards();
        this.syncUrl();
        const filtered = this.getFilteredPosts();
        updateMatchCount(filtered.length, hasVal);
        renderDropdown(val);
      }, CONFIG.searchDebounceMs);
    });

    // Open dropdown on focus
    $.on(this.elements.search, 'focus', () => {
      renderDropdown(this.elements.search.value);
    });

    // Clear button click
    if (clearBtn) {
      $.on(clearBtn, 'click', () => {
        if (this.elements.search) {
          this.elements.search.value = '';
          state.searchTerm = '';
          clearBtn.classList.remove('visible');
          if (wrapper) wrapper.classList.remove('has-query');
          updateMatchCount(0, false);
          closeDropdown();
          this.renderCards();
          this.syncUrl();
          this.elements.search.focus();
        }
      });
    }

    // Keyboard navigation in search and dropdown
    $.on(this.elements.search, 'keydown', (e) => {
      const items = dropdown?.querySelectorAll('.search-drop-item');

      if (e.key === 'ArrowDown') {
        if (items && items.length) {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          items.forEach((item, idx) => item.classList.toggle('selected', idx === selectedIndex));
          items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        if (items && items.length) {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          items.forEach((item, idx) => item.classList.toggle('selected', idx === selectedIndex));
          items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        if (items && selectedIndex >= 0 && items[selectedIndex]) {
          e.preventDefault();
          items[selectedIndex].click();
        } else {
          closeDropdown();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
        if (this.elements.search.value) {
          this.elements.search.value = '';
          state.searchTerm = '';
          clearBtn?.classList.remove('visible');
          wrapper?.classList.remove('has-query');
          updateMatchCount(0, false);
          this.renderCards();
          this.syncUrl();
        }
        this.elements.search.blur();
      }
    });

    // Close dropdown on click outside
    $.on(document, 'click', (e) => {
      if (wrapper && !wrapper.contains(e.target)) {
        closeDropdown();
      }
    });

    // Trending topic suggestion chips
    suggestChips.forEach(chip => {
      $.on(chip, 'click', () => {
        const query = chip.dataset.search;
        if (!query) return;
        this.elements.search.value = query;
        state.searchTerm = query;
        if (wrapper) wrapper.classList.add('has-query');
        if (clearBtn) clearBtn.classList.add('visible');
        this.renderCards();
        this.syncUrl();
        const filtered = this.getFilteredPosts();
        updateMatchCount(filtered.length, true);
        closeDropdown();

        const articlesSection = $.get('#articles');
        if (articlesSection) {
          articlesSection.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      });
    });

    // Keyboard shortcut: press "/" to focus search
    $.on(document, 'keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.elements.search &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        this.elements.search?.focus();
        this.elements.search?.select();
      }
    });
  },

  bindEvents() {
    if (!this.elements.filters) return;

    // Event delegation for filter buttons
    $.on(this.elements.filters, 'click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      $.getAll('.filter-btn', this.elements.filters).forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
      btn.focus();

      state.activeCategory = btn.dataset.category;
      this.renderCards();
      this.syncUrl();
      localStorage.setItem('activeCategory', state.activeCategory);
      if (typeof updateQuickTopicPills === 'function') updateQuickTopicPills(state.activeCategory);
    });

    // Keyboard navigation for tabs
    const filterBtns = () => $.getAll('.filter-btn', this.elements.filters);
    $.on(this.elements.filters, 'keydown', (e) => {
      const btns = filterBtns();
      const currentIndex = Array.from(btns).findIndex(b => b === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % btns.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + btns.length) % btns.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = btns.length - 1;
      }

      if (nextIndex !== currentIndex) {
        btns[nextIndex].focus();
        btns[nextIndex].click();
      }
    });

    // Delegation for tag pills, bookmark buttons, and card share buttons
    $.on(this.elements.container, 'click', async (e) => {
      const tagBtn = e.target.closest('.tag-pill');
      if (tagBtn) {
        const tag = tagBtn.dataset.tag;
        if (tag) {
          state.searchTerm = tag;
          if (this.elements.search) {
            this.elements.search.value = tag;
            const clearBtn = $.get('#searchClear');
            if (clearBtn) clearBtn.classList.add('visible');
          }
          this.renderCards();
          this.syncUrl();
          showToast(`Filtered by #${tag}`, '🏷️');
        }
        return;
      }

      const bookmarkBtn = e.target.closest('.card-bookmark-btn');
      if (bookmarkBtn) {
        const url = bookmarkBtn.dataset.url;
        const title = bookmarkBtn.dataset.title;
        const isNowBookmarked = Bookmarks.toggle(url, title);
        bookmarkBtn.classList.toggle('bookmarked', isNowBookmarked);
        bookmarkBtn.innerHTML = `<img src="assets/icons/bookmark.png" alt="" class="btn-icon" width="14" height="14"> <span>${isNowBookmarked ? 'Saved' : 'Save'}</span>`;
        bookmarkBtn.title = isNowBookmarked ? 'Remove bookmark' : 'Save article';
        if (state.activeCategory === 'saved') {
          this.renderCards();
        }
        return;
      }

      const shareBtn = e.target.closest('.card-share-btn');
      if (shareBtn) {
        const relUrl = shareBtn.dataset.url;
        const fullUrl = new URL(relUrl, window.location.origin).href;
        try {
          await navigator.clipboard.writeText(fullUrl);
          showToast('Article link copied to clipboard!', '<img src="assets/icons/share.png" width="16" height="16" alt="">');
        } catch {
          showToast('Could not copy link', '⚠️');
        }
      }
    });

    this.setupSearch();
  },

  syncUrl() {
    const url = new URL(window.location);
    if (state.activeCategory !== 'all') {
      url.searchParams.set('category', state.activeCategory);
    } else {
      url.searchParams.delete('category');
    }
    if (state.searchTerm) {
      url.searchParams.set('q', state.searchTerm);
    } else {
      url.searchParams.delete('q');
    }
    history.replaceState(null, '', url);
  },

  restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    // Include saved in valid categories
    const validCategories = new Set(['all', ...new Set(state.posts.map(p => p.category)), 'saved']);
    const requested = params.get('category') || localStorage.getItem('activeCategory');
    state.activeCategory = validCategories.has(requested) ? requested : 'all';
    state.searchTerm = params.get('q') || '';
    if (this.elements.search) this.elements.search.value = state.searchTerm;
    if (typeof updateQuickTopicPills === 'function') updateQuickTopicPills(state.activeCategory);
  },

  announceResults(count) {
    let announcer = $.get('#search-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'search-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(announcer);
    }
    $.setText(announcer, `${count} article${count !== 1 ? 's' : ''} found`);
  },

  setCategory(category) {
    if (!this.elements || !this.elements.filters) return;
    const btn = $.get(`.filter-btn[data-category="${category}"]`, this.elements.filters);
    if (btn) {
      btn.click();
    } else {
      state.activeCategory = category;
      this.renderCards();
      this.syncUrl();
      if (typeof updateQuickTopicPills === 'function') updateQuickTopicPills(state.activeCategory);
    }
  },

  destroy() {
    clearTimeout(this.debounceTimer);
  }
};

// ---------- Contact Form ----------
function initContactForm() {
  const form = $.get(CONFIG.selectors.contactForm);
  const status = $.get(CONFIG.selectors.formStatus);
  if (!form) return;

  const validateField = (field) => {
    if (!field.validity.valid) {
      field.setAttribute('aria-invalid', 'true');
      field.style.borderColor = 'var(--error, #ef4444)';
    } else {
      field.removeAttribute('aria-invalid');
      field.style.borderColor = '';
    }
  };

  $.getAll('input, textarea', form).forEach(field => {
    $.on(field, 'blur', () => validateField(field));
    $.on(field, 'input', () => {
      field.style.borderColor = '';
      field.removeAttribute('aria-invalid');
    });
  });

  $.on(form, 'submit', async (e) => {
    e.preventDefault();

    if (status) {
      status.textContent = CONFIG.messages.sending;
      status.className = 'sending';
    }

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.textContent = CONFIG.messages.sentSuccess;
        status.className = 'success';
        form.reset();
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (err) {
      log('error', 'Form submission failed:', err);
      if (status) {
        status.textContent = CONFIG.messages.sendError;
        status.className = 'error';
      }
    }
  });

  // Handle redirect-based success (Formspree redirect back with ?sent=1)
  if (new URLSearchParams(window.location.search).get('sent') === '1' && status) {
    status.textContent = CONFIG.messages.sentSuccess;
    status.className = 'success';
  }
}

// ---------- Contact Page Enhancements (Subject Pills, Char Counter, FAQ) ----------
function initContactEnhancements() {
  // 1. Topic Pills
  const subjectInput = $.get('#subject');
  const messageInput = $.get('#message');
  const pills = $.getAll('.quick-subject-pill');
  if (pills.length && subjectInput) {
    pills.forEach(pill => {
      $.on(pill, 'click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        subjectInput.value = pill.dataset.topic || pill.textContent.trim();
        subjectInput.style.borderColor = 'var(--primary)';
        setTimeout(() => { subjectInput.style.borderColor = ''; }, 600);
        messageInput?.focus();
        showToast(`Selected topic: ${pill.textContent.trim()}`, '⚡');
      });
    });
  }

  // 2. Live Character Counter
  if (messageInput) {
    const charCount = $.get('#charCount');
    const charBar = $.get('#charBar');
    const maxChars = 500;

    const updateCounter = () => {
      const len = messageInput.value.length;
      if (charCount) charCount.textContent = len;
      if (charBar) {
        const pct = Math.min((len / maxChars) * 100, 100);
        charBar.style.width = `${pct}%`;
        charBar.classList.toggle('warning', len >= 400 && len < 480);
        charBar.classList.toggle('danger', len >= 480);
      }
    };

    $.on(messageInput, 'input', updateCounter);
    updateCounter();
  }

  // 3. FAQ Accordion
  const faqQuestions = $.getAll('.faq-question');
  faqQuestions.forEach(btn => {
    $.on(btn, 'click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isActive = item.classList.contains('active');

      // Close other open items
      $.getAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const q = other.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      item.classList.toggle('active', !isActive);
      btn.setAttribute('aria-expanded', (!isActive).toString());
    });
  });
}

// ---------- About Page Enhancements (Skill Meters & Bio Copy) ----------
function initAboutPage() {
  const skillFills = $.getAll('.skill-meter-fill');
  if (skillFills.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fill = entry.target;
            const pct = fill.dataset.pct || '0';
            fill.style.width = `${pct}%`;
            obs.unobserve(fill);
          }
        });
      }, { threshold: 0.2 });

      skillFills.forEach(fill => observer.observe(fill));
    } else {
      skillFills.forEach(fill => {
        fill.style.width = `${fill.dataset.pct || '0'}%`;
      });
    }
  }

  const copyBioBtn = $.get('#copyBioBtn');
  const bioText = $.get('#bioText');
  if (copyBioBtn && bioText) {
    $.on(copyBioBtn, 'click', async () => {
      const text = bioText.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        showToast('Short bio copied to clipboard!', '📋');
        copyBioBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBioBtn.textContent = '📋 Copy Bio';
        }, 2000);
      } catch {
        showToast('Failed to copy bio', '⚠️');
      }
    });
  }
}

// ---------- IDE-Style Code Blocks & Copy Buttons ----------
function initCodeCopyButtons() {
  const preBlocks = document.querySelectorAll('.prose pre');
  preBlocks.forEach(pre => {
    if (pre.closest('.code-block-wrapper')) return;

    // Detect or infer programming language
    const codeEl = pre.querySelector('code');
    let lang = 'Code';
    if (codeEl) {
      const classList = Array.from(codeEl.classList);
      const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
      if (langClass) {
        lang = langClass.replace(/^(language-|lang-)/, '').toUpperCase();
      } else {
        const text = (codeEl.textContent || '').trim();
        if (text.includes('public class') || text.includes('System.out') || text.includes('void honk()')) lang = 'JAVA';
        else if (text.includes('<article>') || text.includes('<!DOCTYPE') || text.includes('<div>')) lang = 'HTML';
        else if (text.includes('{') && (text.includes('grid-template') || text.includes('display: flex'))) lang = 'CSS';
        else if (text.includes('addEventListener') || text.includes('querySelector') || text.includes('const ')) lang = 'JS';
      }
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);

    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
      <div class="code-block-left">
        <div class="code-block-dots" aria-hidden="true">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="code-block-lang">${escapeHTML(lang)}</span>
      </div>
      <button class="copy-code-btn" type="button" aria-label="Copy code to clipboard">
        <span class="copy-icon">📋</span> <span class="copy-text">Copy</span>
      </button>
    `;
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    const copyBtn = header.querySelector('.copy-code-btn');
    const copyText = header.querySelector('.copy-text');
    const copyIcon = header.querySelector('.copy-icon');

    $.on(copyBtn, 'click', async () => {
      const code = codeEl?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.classList.add('copied');
        if (copyIcon) copyIcon.textContent = '✓';
        if (copyText) copyText.textContent = 'Copied!';
        showToast('Code copied to clipboard!', '📋');
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (copyIcon) copyIcon.textContent = '📋';
          if (copyText) copyText.textContent = 'Copy';
        }, 2000);
      } catch {
        if (copyText) copyText.textContent = 'Failed';
        setTimeout(() => {
          if (copyText) copyText.textContent = 'Copy';
        }, 2000);
      }
    });
  });
}

// ---------- Article Reading Suite (TOC, Font Size, Share, Bookmark) ----------
function initArticleSuite() {
  const articleEnhanced = $.get('.article-enhanced');
  if (!articleEnhanced) return;

  const prose = $.get('.prose', articleEnhanced);
  if (!prose) return;

  // 1. Restore font size if saved
  const savedFontSize = localStorage.getItem('heynuo-font-size');
  if (savedFontSize) {
    prose.style.fontSize = savedFontSize;
  }

  // 2. Inject Article Reading Toolbar if not already in HTML
  let toolbar = $.get('.article-toolbar', articleEnhanced);
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = 'article-toolbar';
    toolbar.innerHTML = `
      <div class="article-toolbar-left">
        <button type="button" class="tool-btn" id="btnShareArticle" title="Copy article link" aria-label="Share article">
          <span>🔗</span> Share
        </button>
        <button type="button" class="tool-btn tool-btn-bookmark" id="btnBookmarkArticle" title="Bookmark article" aria-label="Bookmark article">
          <span class="bookmark-icon">☆</span> <span class="bookmark-text">Bookmark</span>
        </button>
        <button type="button" class="tool-btn" id="btnToggleToc" title="Jump to section" aria-label="Table of contents">
          <span>📖</span> Contents
        </button>
        <button type="button" class="tool-btn" id="btnFocusMode" title="Toggle distraction-free focus mode" aria-label="Focus mode">
          <span>🎯</span> Focus
        </button>
      </div>
      <div class="article-toolbar-right">
        <span class="reading-time-left" id="readingTimeLeft">⏱ reading</span>
        <span class="font-size-label">Text:</span>
        <button type="button" class="tool-btn-sm" id="btnFontDec" title="Decrease font size" aria-label="Smaller text">A−</button>
        <button type="button" class="tool-btn-sm" id="btnFontInc" title="Increase font size" aria-label="Larger text">A+</button>
      </div>
    `;
    const header = $.get('.article-header', articleEnhanced) || prose;
    header.parentNode.insertBefore(toolbar, header.nextSibling);
  }

  // Wire up article bookmark button
  const bookmarkArticleBtn = $.get('#btnBookmarkArticle');
  if (bookmarkArticleBtn) {
    const pagePath = Page.getCurrentPage();
    const pageTitle = $.get('h1', articleEnhanced)?.textContent || document.title;
    const isBookmarked = Bookmarks.has(pagePath);
    bookmarkArticleBtn.classList.toggle('bookmarked', isBookmarked);
    const bIcon = bookmarkArticleBtn.querySelector('.bookmark-icon');
    const bText = bookmarkArticleBtn.querySelector('.bookmark-text');
    if (bIcon) bIcon.textContent = isBookmarked ? '★' : '☆';
    if (bText) bText.textContent = isBookmarked ? 'Saved' : 'Bookmark';

    $.on(bookmarkArticleBtn, 'click', () => {
      const isNow = Bookmarks.toggle(pagePath, pageTitle);
      bookmarkArticleBtn.classList.toggle('bookmarked', isNow);
      if (bIcon) bIcon.textContent = isNow ? '★' : '☆';
      if (bText) bText.textContent = isNow ? 'Saved' : 'Bookmark';
    });
  }

  // Bind font size buttons
  const fontDec = $.get('#btnFontDec');
  const fontInc = $.get('#btnFontInc');
  let currentSize = parseFloat(window.getComputedStyle(prose).fontSize) || 16;

  $.on(fontDec, 'click', () => {
    if (currentSize > 13) {
      currentSize -= 1;
      prose.style.fontSize = `${currentSize}px`;
      localStorage.setItem('heynuo-font-size', `${currentSize}px`);
      showToast(`Text size: ${currentSize}px`, '🔠');
    }
  });

  $.on(fontInc, 'click', () => {
    if (currentSize < 24) {
      currentSize += 1;
      prose.style.fontSize = `${currentSize}px`;
      localStorage.setItem('heynuo-font-size', `${currentSize}px`);
      showToast(`Text size: ${currentSize}px`, '🔠');
    }
  });

  // Bind share button
  const shareBtn = $.get('#btnShareArticle');
  $.on(shareBtn, 'click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard!', '🔗');
    } catch {
      showToast('Could not copy link', '⚠️');
    }
  });

  // Wire up Focus Mode
  const focusBtn = $.get('#btnFocusMode');
  let exitBar = $.get('#focusModeExitBar');
  if (!exitBar) {
    exitBar = document.createElement('div');
    exitBar.id = 'focusModeExitBar';
    exitBar.className = 'focus-mode-exit-bar';
    exitBar.innerHTML = `<button type="button" class="btn btn-primary btn-sm" id="btnExitFocus">✕ Exit Focus Mode</button>`;
    document.body.appendChild(exitBar);

    $.on($.get('#btnExitFocus', exitBar), 'click', () => {
      document.body.classList.remove('reading-focus-mode');
      showToast('Focus Mode exited', '📖');
    });
  }

  $.on(focusBtn, 'click', () => {
    const isFocus = document.body.classList.toggle('reading-focus-mode');
    if (isFocus) {
      showToast('Focus Mode on! Press Esc or Exit button to return.', '🎯');
    } else {
      showToast('Focus Mode exited', '📖');
    }
  });

  $.on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('reading-focus-mode')) {
      document.body.classList.remove('reading-focus-mode');
      showToast('Focus Mode exited', '📖');
    }
  });

  // Calculate and update Reading Time Left dynamically
  const proseText = prose.innerText || prose.textContent || '';
  const totalWords = proseText.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  const totalMinutes = Math.max(1, Math.ceil(totalWords / wordsPerMinute));
  const readingTimeEl = $.get('#readingTimeLeft');
  if (readingTimeEl) {
    readingTimeEl.textContent = `⏱ ~${totalMinutes}m left`;
    const updateTimeRemaining = () => {
      const rect = prose.getBoundingClientRect();
      const proseTop = rect.top + window.scrollY;
      const proseHeight = rect.height;
      const scrollPos = window.scrollY - proseTop + window.innerHeight * 0.4;
      const progress = Math.min(Math.max(scrollPos / proseHeight, 0), 1);
      const remainingMinutes = Math.max(0, Math.ceil(totalMinutes * (1 - progress)));
      if (progress >= 0.95) {
        readingTimeEl.textContent = '🎉 Done!';
      } else {
        readingTimeEl.textContent = `⏱ ~${remainingMinutes || 1}m left`;
      }
    };
    window.addEventListener('scroll', updateTimeRemaining, { passive: true });
    updateTimeRemaining();
  }

  // 3. Generate Table of Contents from h2 and h3 headings in .prose
  const headings = Array.from(prose.querySelectorAll('h2, h3'));
  if (headings.length > 1) {
    let tocBox = $.get('#articleTocBox');
    if (!tocBox) {
      tocBox = document.createElement('aside');
      tocBox.id = 'articleTocBox';
      tocBox.className = 'article-toc-box';
      tocBox.setAttribute('aria-label', 'Table of Contents');

      const itemsHtml = headings.map((h, idx) => {
        let id = h.id;
        if (!id) {
          id = `heading-${idx}-${h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
          h.id = id;
        }
        const isH3 = h.tagName.toLowerCase() === 'h3';
        return `<li class="${isH3 ? 'toc-h3' : 'toc-h2'}"><a href="#${id}" class="toc-link">${escapeHTML(h.textContent.replace(/^[\d\s.\u20E3\uFE0F\uD83D\uDD1F-]+\s*/, ''))}</a></li>`;
      }).join('');

      tocBox.innerHTML = `
        <div class="toc-header">
          <span class="toc-title">📖 Quick Navigation</span>
        </div>
        <ul class="toc-list" id="tocList">
          ${itemsHtml}
        </ul>
      `;

      toolbar.parentNode.insertBefore(tocBox, toolbar.nextSibling);
    }

    // Toggle TOC button
    const toggleTocBtn = $.get('#btnToggleToc');
    if (toggleTocBtn) {
      $.on(toggleTocBtn, 'click', () => {
        if (tocBox) {
          const isHidden = tocBox.style.display === 'none';
          tocBox.style.display = isHidden ? 'block' : 'none';
        }
      });
    }

    // Scrollspy with IntersectionObserver
    const tocLinks = Array.from(document.querySelectorAll('.toc-link'));
    if ('IntersectionObserver' in window && tocLinks.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-80px 0px -65% 0px' });

      headings.forEach(h => observer.observe(h));
    }
  }
}

// ---------- Scroll Reveal ----------
function initScrollReveal() {
  if (prefersReducedMotion()) return;
  const elements = document.querySelectorAll('.card, .about-box, .featured-project, .featured-banner, .hero-stat, .hero-showcase, .article-hero-banner');
  elements.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('revealed'));
  }
}

// ---------- Obfuscated Email & Copy Feature ----------
function getContactEmail(el) {
  if (el?.dataset?.user && el?.dataset?.domain) {
    return `${el.dataset.user}@${el.dataset.domain}`;
  }
  if (el?.dataset?.email) {
    return el.dataset.email;
  }
  try {
    return atob('emFoaXJ1ZGRpbjQ0MDQ0QGdtYWlsLmNvbQ==');
  } catch (_) {
    return '';
  }
}

function initCopyEmail() {
  const emailBtns = document.querySelectorAll('.copy-email-btn');
  emailBtns.forEach(btn => {
    $.on(btn, 'click', (e) => {
      e.preventDefault();
      const email = getContactEmail(btn);
      if (!email) return;
      navigator.clipboard?.writeText(email).then(() => {
        showToast(`Copied ${email} to clipboard!`, '✉️');
      }).catch(() => {
        showToast(`Email: ${email}`, '✉️');
      });
    });
  });

  // Dynamically assemble email mailto links and text to prevent raw bot scraping
  const emailLinks = document.querySelectorAll('.dynamic-email-link');
  emailLinks.forEach(link => {
    const email = getContactEmail(link);
    if (!email) return;
    link.href = `mailto:${email}`;
    const textEl = link.querySelector('.dynamic-email-text');
    if (textEl) {
      textEl.textContent = email;
    }
  });
}

// ---------- Reading Progress Bar ----------
function initReadingProgress() {
  const bar = $.get('#readingProgress');
  if (!bar) return;

  // Only show on article pages, not home
  if (Page.isHome()) return;

  const updateProgress = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    const progress = (window.scrollY / docH) * 100;
    bar.style.width = `${Math.min(progress, 100)}%`;
  };

  $.on(window, 'scroll', updateProgress, { passive: true });
  updateProgress();
}

// ---------- Command Palette (Ctrl+K) ----------
const CommandPalette = {
  backdrop: null,
  input: null,
  resultsContainer: null,
  selectedIndex: 0,
  items: [],

  init() {
    this.createModal();
    this.bindShortcuts();
  },

  createModal() {
    if ($.get('#cmdPalette')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'cmdPalette';
    backdrop.className = 'cmd-palette-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Command Palette and Article Search');

    backdrop.innerHTML = `
      <div class="cmd-palette-modal">
        <div class="cmd-palette-input-wrap">
          <span class="cmd-palette-icon" aria-hidden="true">🔍</span>
          <input type="search" id="cmdPaletteInput" class="cmd-palette-input" placeholder="Search articles, guides, topics... (or press /)" autocomplete="off">
          <kbd class="cmd-palette-esc-badge">ESC</kbd>
        </div>
        <div class="cmd-palette-results" id="cmdPaletteResults" role="listbox"></div>
        <div class="cmd-palette-footer">
          <div class="cmd-palette-hints">
            <span class="cmd-palette-hint"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span class="cmd-palette-hint"><kbd>↵</kbd> Open</span>
            <span class="cmd-palette-hint"><kbd>ESC</kbd> Close</span>
          </div>
          <span class="cmd-palette-badge">HeyNuo Search</span>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.backdrop = backdrop;
    this.input = backdrop.querySelector('#cmdPaletteInput');
    this.resultsContainer = backdrop.querySelector('#cmdPaletteResults');

    // Close when clicking outside modal
    $.on(backdrop, 'click', (e) => {
      if (e.target === backdrop) this.close();
    });

    // Search input typing
    $.on(this.input, 'input', () => {
      this.search(this.input.value);
    });

    // Keyboard navigation within modal
    $.on(this.input, 'keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigate(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigate(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectCurrent();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });
  },

  bindShortcuts() {
    // Global hotkey: Ctrl+K or Cmd+K
    $.on(document, 'keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen()) {
        e.preventDefault();
        this.close();
      }
    });

    // Navbar search button click
    const navSearchBtn = $.get('#navSearchBtn');
    if (navSearchBtn) {
      $.on(navSearchBtn, 'click', (e) => {
        e.preventDefault();
        this.open();
      });
    }
  },

  isOpen() {
    return this.backdrop?.classList.contains('open');
  },

  open() {
    if (!this.backdrop) this.createModal();
    this.backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.input.value = '';
    this.search('');
    setTimeout(() => this.input.focus(), 50);
  },

  close() {
    if (!this.backdrop) return;
    this.backdrop.classList.remove('open');
    document.body.style.overflow = '';
  },

  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  },

  search(query) {
    const q = (query || '').toLowerCase().trim();
    const allPosts = POSTS;

    this.items = allPosts.filter(post => {
      if (!q) return true;
      const text = `${post.title} ${post.excerpt} ${post.category} ${(post.tags || []).join(' ')}`.toLowerCase();
      return text.includes(q);
    });

    this.selectedIndex = 0;
    this.renderResults(q);
  },

  renderResults(query) {
    if (!this.resultsContainer) return;

    if (this.items.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="cmd-palette-empty">
          <p>No results found for "<strong>${escapeHTML(query)}</strong>"</p>
          <p style="font-size:12.5px; margin-top:4px;">Try searching for Java, OOP, Quran, or Web Dev</p>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = this.items.map((post, idx) => {
      const isSelected = idx === this.selectedIndex;
      const titleHighlighted = Articles && Articles.highlightMatch
        ? Articles.highlightMatch(post.title, query)
        : escapeHTML(post.title);
      return `
        <a href="${escapeHTML(post.link)}" class="cmd-palette-item ${isSelected ? 'is-selected' : ''}" data-index="${idx}" role="option" aria-selected="${isSelected}">
          <div class="cmd-palette-item-main">
            <span class="cmd-palette-item-title">${titleHighlighted}</span>
            <span class="cmd-palette-item-desc">${escapeHTML(post.excerpt)}</span>
          </div>
          <span class="cmd-palette-item-tag">${escapeHTML(post.category)}</span>
        </a>
      `;
    }).join('');

    // Click handling on results
    const itemEls = this.resultsContainer.querySelectorAll('.cmd-palette-item');
    itemEls.forEach(el => {
      $.on(el, 'mouseenter', () => {
        const idx = parseInt(el.dataset.index, 10);
        this.selectedIndex = idx;
        this.updateSelection();
      });
      $.on(el, 'click', () => {
        this.close();
      });
    });
  },

  navigate(direction) {
    if (this.items.length === 0) return;
    this.selectedIndex = (this.selectedIndex + direction + this.items.length) % this.items.length;
    this.updateSelection();
    this.scrollToSelected();
  },

  updateSelection() {
    const itemEls = this.resultsContainer.querySelectorAll('.cmd-palette-item');
    itemEls.forEach((el, idx) => {
      const isSel = idx === this.selectedIndex;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-selected', isSel);
    });
  },

  scrollToSelected() {
    const selectedEl = this.resultsContainer.querySelector('.cmd-palette-item.is-selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  },

  selectCurrent() {
    if (this.items.length > 0 && this.items[this.selectedIndex]) {
      const post = this.items[this.selectedIndex];
      this.close();
      window.location.href = post.link;
    }
  }
};

// ---------- Article Next/Previous Navigation ----------
function initArticleNav() {
  const articleEnhanced = $.get('.article-enhanced');
  if (!articleEnhanced) return;

  const currentPath = Page.getCurrentPage();
  const currentIndex = POSTS.findIndex(p => p.link.includes(currentPath));
  if (currentIndex === -1) return;

  if ($.get('#articleNavContainer')) return;

  const prevPost = currentIndex > 0 ? POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < POSTS.length - 1 ? POSTS[currentIndex + 1] : null;

  if (!prevPost && !nextPost) return;

  const navContainer = document.createElement('div');
  navContainer.id = 'articleNavContainer';
  navContainer.className = 'article-nav-container';
  navContainer.innerHTML = `
    <div class="article-nav-title">Continue Reading</div>
    <div class="article-nav-grid">
      ${prevPost ? `
        <a href="${escapeHTML(prevPost.link)}" class="article-nav-card prev">
          <span class="article-nav-label">← Previous Guide</span>
          <span class="article-nav-card-title">${escapeHTML(prevPost.title)}</span>
        </a>
      ` : '<div></div>'}
      ${nextPost ? `
        <a href="${escapeHTML(nextPost.link)}" class="article-nav-card next">
          <span class="article-nav-label">Next Guide →</span>
          <span class="article-nav-card-title">${escapeHTML(nextPost.title)}</span>
        </a>
      ` : '<div></div>'}
    </div>
  `;

  const related = $.get('.related-links', articleEnhanced);
  if (related) {
    related.parentNode.insertBefore(navContainer, related);
  } else {
    const prose = $.get('.prose', articleEnhanced);
    if (prose) prose.parentNode.insertBefore(navContainer, prose.nextSibling);
  }
}

// ---------- Top Announcement Banner ----------
function initAnnouncementBanner() {
  const banner = $.get('#announcementBanner');
  const closeBtn = $.get('#announcementClose');
  if (!banner || !closeBtn) return;

  if (sessionStorage.getItem('heynuo-announcement-dismissed') === 'true') {
    banner.style.display = 'none';
    return;
  }

  $.on(closeBtn, 'click', () => {
    banner.classList.add('dismissed');
    sessionStorage.setItem('heynuo-announcement-dismissed', 'true');
    setTimeout(() => { banner.style.display = 'none'; }, 350);
  });
}

// ---------- Hero Dynamic Canvas Particles ----------
function initHeroParticles() {
  const canvas = $.get('#heroParticlesCanvas');
  if (!canvas) return;

  if (prefersReducedMotion()) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animId = null;
  let isVisible = true;
  const mouse = { x: null, y: null, radius: 110 };

  const PARTICLE_COUNT = 38;
  const CONNECT_DISTANCE = 90;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = -(Math.random() * 0.35 + 0.15);
      this.radius = Math.random() * 1.8 + 1.2;
      this.baseAlpha = Math.random() * 0.35 + 0.25;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.8;
          this.y -= (dy / dist) * force * 1.8;
        }
      }

      if (this.x < -10) this.x = width + 10;
      else if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.reset(false);
    }
    draw(colorRgb) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorRgb}, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function getColorRgb() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '96, 165, 250' : '37, 99, 235';
  }

  function render() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);
    const colorRgb = getColorRgb();

    // Connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${colorRgb}, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw(colorRgb);
    });

    animId = requestAnimationFrame(render);
  }

  const heroSection = canvas.closest('.hero');
  if (heroSection) {
    $.on(heroSection, 'mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    $.on(heroSection, 'mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          render();
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }, { threshold: 0.05 });
      observer.observe(heroSection);
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 150);
  }, { passive: true });

  resize();
  initParticles();
  render();
}

// ---------- Hero Dynamic Rotator / Typewriter ----------
function initHeroRotator() {
  const el = $.get('#heroRotator');
  if (!el) return;

  let phrases = [];
  try {
    phrases = JSON.parse(el.dataset.phrases || '[]');
  } catch {
    phrases = ["Java OOP Architecture", "Authentic Theological Studies", "Modern Vanilla Web Dev"];
  }
  if (!phrases.length) return;

  if (prefersReducedMotion()) return;

  let phraseIdx = 0;
  let charIdx = phrases[0].length;
  let isDeleting = true;
  let typingDelay = 2400;

  function typeStep() {
    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      el.textContent = currentPhrase.substring(0, charIdx);
      if (charIdx <= 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typingDelay = 400;
      } else {
        typingDelay = 26;
      }
    } else {
      charIdx++;
      el.textContent = currentPhrase.substring(0, charIdx);
      if (charIdx >= currentPhrase.length) {
        isDeleting = true;
        typingDelay = 2500;
      } else {
        typingDelay = 55 + Math.random() * 25;
      }
    }

    setTimeout(typeStep, typingDelay);
  }

  setTimeout(typeStep, typingDelay);
}

// ---------- Quick Topic Navigation ----------
function updateQuickTopicPills(category) {
  const pills = $.getAll('.quick-topic-pill');
  if (!pills.length) return;
  pills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === category);
  });
}

function initQuickTopicPills() {
  const pills = $.getAll('.quick-topic-pill');
  if (!pills.length) return;

  pills.forEach(pill => {
    $.on(pill, 'click', () => {
      const category = pill.dataset.category;
      if (!category) return;

      if (Articles && typeof Articles.setCategory === 'function') {
        Articles.setCategory(category);
      }

      const articlesSection = $.get('#articles');
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });
  });
}

// ---------- Digital Dispatch / Newsletter Form ----------
function initDispatchForm() {
  const form = $.get('#dispatchForm');
  const input = $.get('#dispatchEmail');
  if (!form || !input) return;

  const SUB_KEY = 'heynuo-newsletter-subscribed';
  const savedSub = localStorage.getItem(SUB_KEY);
  const submitBtn = form.querySelector('button[type="submit"]');

  if (savedSub && submitBtn) {
    submitBtn.innerHTML = '✓ Subscribed';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.85';
  }

  $.on(form, 'submit', (e) => {
    e.preventDefault();
    const email = (input.value || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', '⚠️');
      input.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.innerHTML = 'Subscribing...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      localStorage.setItem(SUB_KEY, email);
      if (submitBtn) {
        submitBtn.innerHTML = '✓ Subscribed!';
        submitBtn.style.background = 'var(--success, #10b981)';
        submitBtn.style.borderColor = 'var(--success, #10b981)';
      }
      input.value = '';
      showToast('Subscribed! Welcome to the knowledge loop.', '📬');
    }, 450);
  });
}

// ---------- Keyboard Shortcuts Modal & Global Hotkeys ----------
function initShortcutsModal() {
  let backdrop = $.get('#shortcutsModal');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'shortcuts-modal-backdrop';
    backdrop.id = 'shortcutsModal';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'shortcutsTitle');
    backdrop.innerHTML = `
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h3 id="shortcutsTitle">⌨️ Keyboard Shortcuts</h3>
          <button type="button" class="announcement-close" id="shortcutsClose" aria-label="Close shortcuts dialog">✕</button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-row"><span class="shortcut-desc">Search &amp; Command Palette</span><span><kbd class="shortcut-key">Ctrl + K</kbd> or <kbd class="shortcut-key">/</kbd></span></div>
          <div class="shortcut-row"><span class="shortcut-desc">Toggle Dark / Light Mode</span><kbd class="shortcut-key">T</kbd></div>
          <div class="shortcut-row"><span class="shortcut-desc">Go to Home</span><kbd class="shortcut-key">H</kbd></div>
          <div class="shortcut-row"><span class="shortcut-desc">Go to About</span><kbd class="shortcut-key">A</kbd></div>
          <div class="shortcut-row"><span class="shortcut-desc">Go to Contact</span><kbd class="shortcut-key">C</kbd></div>
          <div class="shortcut-row"><span class="shortcut-desc">View Shortcuts</span><kbd class="shortcut-key">?</kbd></div>
          <div class="shortcut-row"><span class="shortcut-desc">Close Any Dialog</span><kbd class="shortcut-key">Esc</kbd></div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  }

  const openBtns = $.getAll('#shortcutHelpBtn');
  const closeBtn = $.get('#shortcutsClose', backdrop);

  function openModal() {
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  }

  function closeModal() {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  openBtns.forEach(btn => $.on(btn, 'click', openModal));
  if (closeBtn) $.on(closeBtn, 'click', closeModal);

  $.on(backdrop, 'click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  $.on(document, 'keydown', (e) => {
    const activeEl = document.activeElement;
    const isInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.tagName === 'SELECT' ||
      activeEl.isContentEditable
    );

    if (e.key === 'Escape') {
      if (backdrop.classList.contains('active')) {
        e.preventDefault();
        closeModal();
        return;
      }
    }

    if (isInput) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      if (backdrop.classList.contains('active')) {
        closeModal();
      } else {
        openModal();
      }
      return;
    }

    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      showToast(
        next === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode',
        next === 'dark' ? '<img src="assets/icons/moon.png" width="16" height="16" alt="">' : '<img src="assets/icons/sun.png" width="16" height="16" alt="">'
      );
      return;
    }

    if (e.key === 'h' || e.key === 'H') {
      if (!Page.isHome()) {
        window.location.href = 'index.html';
      } else {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
      return;
    }

    if (e.key === 'a' || e.key === 'A') {
      if (Page.getCurrentPage() !== 'about.html') {
        window.location.href = 'about.html';
      }
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      if (Page.getCurrentPage() !== 'contact.html') {
        window.location.href = 'contact.html';
      }
      return;
    }
  });
}

// ---------- 3D Tilt Micro-Interaction ----------
function initTiltEffect() {
  if (prefersReducedMotion()) return;
  const boxes = $.getAll('.card-showcase-box, .featured-banner');
  boxes.forEach(box => {
    $.on(box, 'mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      box.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });
    $.on(box, 'mouseleave', () => {
      box.style.transform = '';
    });
  });
}

// ---------- Animated Numbers Counter ----------
function initAnimatedCounters() {
  const counters = $.getAll('.counter-num');
  if (!counters.length) return;

  if (prefersReducedMotion()) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          if (isNaN(target)) return;

          const duration = 1200;
          const start = performance.now();

          function updateCount(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeOut * target);
            el.textContent = current;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = target;
            }
          }

          requestAnimationFrame(updateCount);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  }
}

// ---------- Article Quick Preview Modal ----------
function initArticlePreviewModal() {
  let backdrop = $.get('#previewModalBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'previewModalBackdrop';
    backdrop.className = 'preview-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML = '<div class="preview-modal" id="previewModalContent"></div>';
    document.body.appendChild(backdrop);
  }

  const modalContent = backdrop.querySelector('#previewModalContent');

  function openPreview(post) {
    if (!post) return;

    const takeawaysHtml = (post.takeaways || []).map(t => `<li>${escapeHTML(t)}</li>`).join('');

    modalContent.innerHTML = `
      ${post.banner ? `
        <div class="preview-modal-banner">
          <img src="${escapeHTML(post.banner)}" alt="${escapeHTML(post.title)}" width="600" height="338">
          <button type="button" class="preview-modal-close" id="previewModalClose" aria-label="Close preview">✕</button>
        </div>
      ` : '<button type="button" class="preview-modal-close" id="previewModalClose" style="top:12px;right:12px;" aria-label="Close preview">✕</button>'}
      <div class="preview-modal-content">
        <div class="preview-modal-meta">
          <span class="category">${escapeHTML(post.category)}</span>
          <span style="color:var(--muted); font-size:13px;">${escapeHTML(post.readTime || '')}</span>
        </div>
        <h2 class="preview-modal-title">${escapeHTML(post.title)}</h2>
        <p class="preview-modal-desc">${escapeHTML(post.excerpt)}</p>

        <div class="preview-modal-takeaways-title">⚡ What You'll Learn:</div>
        <ul class="preview-modal-takeaways">
          ${takeawaysHtml}
        </ul>

        <div class="preview-modal-actions">
          <a href="${escapeHTML(post.link)}" class="btn btn-primary">Read Full Guide →</a>
          <button type="button" class="btn btn-secondary preview-bookmark-btn" data-url="${escapeHTML(post.link)}" data-title="${escapeHTML(post.title)}">
            ${Bookmarks.has(post.link) ? '★ Saved' : '☆ Save for Later'}
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    const closeBtn = modalContent.querySelector('#previewModalClose');
    closeBtn?.focus();

    $.on(closeBtn, 'click', closePreview);

    const bkmBtn = modalContent.querySelector('.preview-bookmark-btn');
    if (bkmBtn) {
      $.on(bkmBtn, 'click', () => {
        const added = Bookmarks.toggle(post.link, post.title);
        bkmBtn.textContent = added ? '★ Saved' : '☆ Save for Later';
        if (Articles && typeof Articles.renderCards === 'function') {
          Articles.renderCards();
        }
      });
    }
  }

  function closePreview() {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  $.on(backdrop, 'click', (e) => {
    if (e.target === backdrop) closePreview();
  });

  $.on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      e.preventDefault();
      closePreview();
    }
  });

  $.on(document, 'click', (e) => {
    const btn = e.target.closest('.card-preview-btn');
    if (!btn) return;
    const link = btn.dataset.link;
    const post = POSTS.find(p => p.link === link);
    if (post) {
      openPreview(post);
    }
  });
}

// ---------- Featured Flagship Resource Showcase ----------
function initFeaturedResource() {
  const banner = $.get('#featuredRuqyahBanner');
  if (!banner) return;

  // 1. Mouse-following radial glow spotlight
  $.on(banner, 'mousemove', (e) => {
    const rect = banner.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    banner.style.setProperty('--feat-x', `${x}px`);
    banner.style.setProperty('--feat-y', `${y}px`);
  });

  // 2. Share / Copy Link button
  const shareBtn = $.get('#shareRuqyahBtn');
  if (shareBtn) {
    $.on(shareBtn, 'click', async () => {
      const url = 'https://heynuo.github.io/heynuo.github.io-ruqyah-guide/';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          showToast('Ruqyah Guide link copied to clipboard!', '✨');
        } else {
          const temp = document.createElement('input');
          temp.value = url;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          showToast('Ruqyah Guide link copied to clipboard!', '✨');
        }
      } catch (err) {
        showToast('Link: ' + url, '🔗');
      }
    });
  }

  // 3. Showcase Tab Switching (App Showcase vs Live Audio & Verses)
  const tabApp = $.get('#tabAppPreview');
  const tabSampler = $.get('#tabLiveSampler');
  const panelApp = $.get('#panelAppPreview');
  const panelSampler = $.get('#panelLiveSampler');

  function switchTab(activeTab, activePanel, inactiveTab, inactivePanel) {
    if (!activeTab || !activePanel) return;
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    activePanel.classList.add('active');
    activePanel.removeAttribute('hidden');

    if (inactiveTab && inactivePanel) {
      inactiveTab.classList.remove('active');
      inactiveTab.setAttribute('aria-selected', 'false');
      inactivePanel.classList.remove('active');
      inactivePanel.setAttribute('hidden', '');
    }
  }

  function activateSamplerTab() {
    switchTab(tabSampler, panelSampler, tabApp, panelApp);
  }

  if (tabApp && tabSampler && panelApp && panelSampler) {
    $.on(tabApp, 'click', () => {
      switchTab(tabApp, panelApp, tabSampler, panelSampler);
    });

    $.on(tabSampler, 'click', activateSamplerTab);
  }

  // 4. Live Verse & Audio Sampler Data
  const verses = [
    {
      title: 'Ayat al-Kursi (2:255)',
      meta: 'Surah Al-Baqarah · Greatest Verse of Protection',
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      translit: 'Allāhu lā ilāha illā Huwa, Al-Ḥayyul-Qayyūm. Lā ta\'khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ. Man dhal-ladhī yashfa\'u \'indahū illā bi-idhnih. Ya\'lamu mā bayna aydīhim wa mā khalfahum wa lā yuḥīṭūna bi-shay\'im-min \'ilmihī illā bimā shā\'. Wasi\'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya\'ūduhū ḥifẓuhumā, wa Huwal-\'Aliyyul-\'Aẓīm.',
      translation: '"Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth... And He is the Most High, the Most Great."',
      audio: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3',
      hadithBadge: '🛡️ "Recite it when you go to bed, and you will be protected by Allah till morning." (Bukhari)'
    },
    {
      title: 'Surah Al-Fatihah (1:1-7)',
      meta: 'The Opener · Ash-Shifa (The Ultimate Spiritual Cure)',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      translit: 'Bismillāhir-Raḥmānir-Raḥīm. Al-ḥamdu lillāhi Rabbil-\'ālamīn. Ar-Raḥmānir-Raḥīm. Māliki yawmid-dīn. Iyyāka na\'budu wa iyyāka nasta\'īn. Ihdinaṣ-ṣirāṭal-mustaqīm. Ṣirāṭalladhīna an\'amta \'alayhim, ghayril-maghḍūbi \'alayhim walāḍ-ḍāllīn.',
      translation: '"In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is due to Allah, Lord of the worlds... Guide us to the straight path - The path of those upon whom You have bestowed favor..."',
      audio: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
      hadithBadge: '🌿 "How did you know that it is a Ruqyah (cure)?" (Sahih al-Bukhari 5736)'
    },
    {
      title: 'Surah Al-Ikhlas (112:1-4)',
      meta: 'The Sincerity · Equal to One-Third of the Qur\'an',
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      translit: 'Qul Huwallāhu Aḥad. Allāhuṣ-Ṣamad. Lam yalid wa lam yūlad. Wa lam yakul-lahū kufuwan aḥad.',
      translation: '"Say, \'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.\'"',
      audio: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3',
      hadithBadge: '💎 "By Him in Whose Hand my soul is, it is equivalent to one third of the Qur\'an." (Bukhari)'
    },
    {
      title: 'Surah Al-Falaq & An-Nas (113-114)',
      meta: 'The Mu\'awwidhatayn · Divine Shield from Magic & Evil Eye',
      arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      translit: 'Qul a\'ūdhu bi-Rabbil-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharrin-naffāthāti fil-\'uqad. Wa min sharri ḥāsidin idhā ḥasad.',
      translation: '"Say, \'I seek refuge in the Lord of daybreak from the evil of that which He created... and from the evil of the blowers in knots, and from the evil of an envier when he envies.\'"',
      audio: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
      hadithBadge: '🧿 "No person seeking refuge has sought refuge with anything like these two." (Abu Dawud)'
    }
  ];

  let currentVerseIndex = 0;
  let currentFontSize = 19;
  const audioEl = $.get('#samplerAudioElement');
  const playBtn = $.get('#samplerPlayBtn');
  const playIcon = $.get('#playIcon');
  const playBtnText = $.get('#playBtnText');
  const playerContainer = $.get('#samplerPlayer');
  const titleEl = $.get('#samplerTitle');
  const metaEl = $.get('#samplerMeta');
  const arabicEl = $.get('#samplerArabic');
  const translitEl = $.get('#samplerTranslit');
  const transEl = $.get('#samplerTranslation');
  const chips = $.getAll('.sampler-chip');

  // Scrubber & time elements
  const scrubTrack = $.get('#samplerScrubTrack');
  const scrubFill = $.get('#samplerScrubFill');
  const scrubThumb = $.get('#samplerScrubThumb');
  const curTimeEl = $.get('#samplerCurrentTime');
  const durationEl = $.get('#samplerDuration');
  const loopBtn = $.get('#samplerLoopBtn');
  const muteBtn = $.get('#samplerMuteBtn');

  // Font & translit controls
  const fontDecBtn = $.get('#samplerFontDec');
  const fontIncBtn = $.get('#samplerFontInc');
  const translitToggle = $.get('#samplerTranslitToggle');
  const copyVerseBtn = $.get('#samplerCopyVerseBtn');

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updatePlayState(isPlaying) {
    if (!playBtn) return;
    if (isPlaying) {
      if (playIcon) playIcon.textContent = '⏸';
      if (playBtnText) playBtnText.textContent = 'Pause';
      if (playerContainer) playerContainer.classList.add('is-playing');
    } else {
      if (playIcon) playIcon.textContent = '▶';
      if (playBtnText) playBtnText.textContent = 'Play Recitation';
      if (playerContainer) playerContainer.classList.remove('is-playing');
    }
  }

  function updateScrubber() {
    if (!audioEl || !audioEl.duration) return;
    const progress = (audioEl.currentTime / audioEl.duration) * 100;
    if (scrubFill) scrubFill.style.width = `${progress}%`;
    if (scrubThumb) scrubThumb.style.left = `${progress}%`;
    if (curTimeEl) curTimeEl.textContent = formatTime(audioEl.currentTime);
    if (durationEl) durationEl.textContent = formatTime(audioEl.duration);
  }

  function loadVerse(index, autoPlay = false) {
    if (!verses[index]) return;
    currentVerseIndex = index;
    const v = verses[index];

    if (titleEl) titleEl.textContent = v.title;
    if (metaEl) metaEl.textContent = v.meta;
    if (arabicEl) arabicEl.textContent = v.arabic;
    if (translitEl) translitEl.textContent = v.translit;
    if (transEl) transEl.textContent = v.translation;

    chips.forEach((c, idx) => {
      const isSelected = idx === index;
      c.classList.toggle('active', isSelected);
      c.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    if (scrubFill) scrubFill.style.width = '0%';
    if (scrubThumb) scrubThumb.style.left = '0%';
    if (curTimeEl) curTimeEl.textContent = '0:00';

    if (audioEl) {
      const wasPlaying = !audioEl.paused && !audioEl.ended;
      audioEl.src = v.audio;
      audioEl.load();
      if (autoPlay || wasPlaying) {
        audioEl.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
      } else {
        updatePlayState(false);
      }
    }
  }

  // 5. Verse Chip Selector
  chips.forEach((chip) => {
    $.on(chip, 'click', () => {
      const idx = parseInt(chip.dataset.verse, 10);
      if (!isNaN(idx) && idx !== currentVerseIndex) {
        loadVerse(idx, true);
      }
    });
  });

  // 6. Curated Healing Topic Pills (Left column triggers)
  const topicPills = $.getAll('.featured-topic-pill');
  topicPills.forEach((pill) => {
    $.on(pill, 'click', () => {
      const targetIdx = parseInt(pill.dataset.targetVerse, 10);
      if (!isNaN(targetIdx)) {
        activateSamplerTab();
        loadVerse(targetIdx, true);
        const v = verses[targetIdx];
        if (v && v.hadithBadge) {
          showToast(v.hadithBadge, '✨', 4000);
        }
      }
    });
  });

  // 7. Audio Play / Pause
  if (playBtn && audioEl) {
    $.on(playBtn, 'click', () => {
      if (audioEl.paused || audioEl.ended) {
        audioEl.play()
          .then(() => updatePlayState(true))
          .catch((err) => {
            console.warn('Audio play prevented:', err);
            showToast('Tap again to enable audio playback', '🎧');
          });
      } else {
        audioEl.pause();
        updatePlayState(false);
      }
    });

    $.on(audioEl, 'timeupdate', updateScrubber);
    $.on(audioEl, 'loadedmetadata', () => {
      if (durationEl) durationEl.textContent = formatTime(audioEl.duration);
    });
    $.on(audioEl, 'ended', () => updatePlayState(false));
    $.on(audioEl, 'pause', () => updatePlayState(false));
    $.on(audioEl, 'play', () => updatePlayState(true));
  }

  // 8. Audio Scrubbing
  if (scrubTrack && audioEl) {
    const seekAudio = (e) => {
      const rect = scrubTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (audioEl.duration) {
        audioEl.currentTime = pos * audioEl.duration;
        updateScrubber();
      }
    };

    $.on(scrubTrack, 'click', seekAudio);
  }

  // 9. Loop & Mute Controls
  if (loopBtn && audioEl) {
    $.on(loopBtn, 'click', () => {
      audioEl.loop = !audioEl.loop;
      loopBtn.classList.toggle('active', audioEl.loop);
      loopBtn.setAttribute('aria-pressed', audioEl.loop ? 'true' : 'false');
      showToast(audioEl.loop ? 'Verse repeat enabled 🔁' : 'Verse repeat off', '🔁');
    });
  }

  if (muteBtn && audioEl) {
    $.on(muteBtn, 'click', () => {
      audioEl.muted = !audioEl.muted;
      muteBtn.textContent = audioEl.muted ? '🔇' : '🔊';
      muteBtn.classList.toggle('active', audioEl.muted);
      muteBtn.setAttribute('aria-pressed', audioEl.muted ? 'true' : 'false');
    });
  }

  // 10. Font Size & Transliteration Controls
  if (fontDecBtn && fontIncBtn && arabicEl) {
    $.on(fontDecBtn, 'click', () => {
      if (currentFontSize > 15) {
        currentFontSize -= 2;
        arabicEl.style.fontSize = `${currentFontSize}px`;
      }
    });

    $.on(fontIncBtn, 'click', () => {
      if (currentFontSize < 32) {
        currentFontSize += 2;
        arabicEl.style.fontSize = `${currentFontSize}px`;
      }
    });
  }

  if (translitToggle && translitEl) {
    $.on(translitToggle, 'click', () => {
      const isHidden = translitEl.hasAttribute('hidden');
      if (isHidden) {
        translitEl.removeAttribute('hidden');
        translitToggle.classList.add('active');
      } else {
        translitEl.setAttribute('hidden', '');
        translitToggle.classList.remove('active');
      }
    });
  }

  if (copyVerseBtn) {
    $.on(copyVerseBtn, 'click', async () => {
      const v = verses[currentVerseIndex];
      if (!v) return;
      const textToCopy = `${v.title}\n\n${v.arabic}\n\nTransliteration:\n${v.translit}\n\nTranslation:\n${v.translation}\n\nReference: ${v.meta}\nSource: HeyNuo Ruqyah Guide`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const temp = document.createElement('textarea');
          temp.value = textToCopy;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }
        showToast(`${v.title} copied to clipboard!`, '📋');
      } catch (err) {
        showToast('Could not copy verse', '⚠️');
      }
    });
  }
}

// ---------- Initialization ----------
function init() {
  initTheme();
  initThemeToggle();
  initAnnouncementBanner();
  initMobileMenu();
  initActiveNav();
  initSmoothScroll();
  initScrollToTop();
  initSkipLink();
  initReadingProgress();
  if (Page.isHome()) {
    Articles.init();
    initHeroParticles();
    initHeroRotator();
    initQuickTopicPills();
    initAnimatedCounters();
  }
  if (Page.getCurrentPage() === 'contact.html') initContactForm();
  initContactEnhancements();
  initAboutPage();
  initCodeCopyButtons();
  initArticleSuite();
  initArticleNav();
  CommandPalette.init();
  initScrollReveal();
  initCopyEmail();
  initDispatchForm();
  initShortcutsModal();
  initTiltEffect();
  initArticlePreviewModal();
  initFeaturedResource();

  log('log', `✨ HeyNuo ready – ${Page.getCurrentPage()}`);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  Articles.destroy?.();
});

// Safe initialization
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
} catch (error) {
  console.error('Initialization failed:', error);
}