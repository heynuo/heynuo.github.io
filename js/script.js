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
    banner: "assets/banners/java-oop.jpg"
  },
  {
    title: "Jinn & Islamic Theology",
    excerpt: "Authentic research on Jinn, sihr, and Islamic theology from Quran & Sunnah.",
    category: "Research",
    link: "jinn-islamic-theology.html",
    date: "2026-06-02",
    readTime: "15 min read",
    tags: ["Islam", "Quran", "Research"],
    banner: "assets/banners/ruqyah-theology.jpg"
  },
  {
    title: "Modern Web Development Guide",
    excerpt: "Build beautiful websites with HTML, CSS, JavaScript, and deploy for free on GitHub Pages.",
    category: "Web Dev",
    link: "web-dev-guide.html",
    date: "2026-06-02",
    readTime: "10 min read",
    tags: ["HTML", "CSS", "GitHub Pages"],
    banner: "assets/banners/web-dev.jpg"
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
  $.on(btn, 'click', () => {
    btn.classList.add('rotating');
    setTimeout(() => btn.classList.remove('rotating'), 400);
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
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

    // Search input with debounce
    $.on(this.elements.search, 'input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        state.searchTerm = e.target.value;
        this.renderCards();
        this.syncUrl();
        // Show/hide clear button
        const clearBtn = $.get('#searchClear');
        if (clearBtn) clearBtn.classList.toggle('visible', !!e.target.value);
      }, CONFIG.searchDebounceMs);
    });

    // Clear button
    const clearBtn = $.get('#searchClear');
    if (clearBtn) {
      $.on(clearBtn, 'click', () => {
        if (this.elements.search) {
          this.elements.search.value = '';
          state.searchTerm = '';
          clearBtn.classList.remove('visible');
          this.renderCards();
          this.syncUrl();
          this.elements.search.focus();
        }
      });
    }

    // Keyboard shortcut: press "/" to focus search
    $.on(document, 'keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.elements.search &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        this.elements.search?.focus();
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
      </div>
      <div class="article-toolbar-right">
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
  if (Page.isHome()) Articles.init();
  if (Page.getCurrentPage() === 'contact.html') initContactForm();
  initCodeCopyButtons();
  initArticleSuite();
  initArticleNav();
  CommandPalette.init();
  initScrollReveal();
  initCopyEmail();

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