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
    tags: ["OOP", "Java", "Beginners"]
  },
  {
    title: "Jinn & Islamic Theology",
    excerpt: "Authentic research on Jinn, sihr, and Islamic theology from Quran & Sunnah.",
    category: "Research",
    link: "jinn-islamic-theology.html",
    date: "2026-06-02",
    readTime: "15 min read",
    tags: ["Islam", "Quran", "Research"]
  },
  {
    title: "Modern Web Development Guide",
    excerpt: "Build beautiful websites with HTML, CSS, JavaScript, and deploy for free on GitHub Pages.",
    category: "Web Dev",
    link: "web-dev-guide.html",
    date: "2026-06-02",
    readTime: "10 min read",
    tags: ["HTML", "CSS", "GitHub Pages"]
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
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initThemeToggle() {
  const btn = $.get('#theme-toggle');
  if (!btn) return;
  $.on(btn, 'click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
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

  const toggleVisibility = () => btn.classList.toggle('visible', window.scrollY > 400);
  $.on(window, 'scroll', toggleVisibility, { passive: true });
  toggleVisibility();

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
    const categories = ['all', ...new Set(state.posts.map(p => p.category))];
    this.elements.filters.innerHTML = categories.map((cat, i) => `
      <button class="filter-btn${cat === state.activeCategory ? ' active' : ''}"
              data-category="${escapeHTML(cat)}"
              role="tab"
              aria-selected="${cat === state.activeCategory}"
              id="tab-${escapeHTML(cat)}"
              tabindex="${cat === state.activeCategory ? 0 : -1}">
        ${cat === 'all' ? 'All' : escapeHTML(cat)}
      </button>
    `).join('');
  },

  getFilteredPosts() {
    const term = state.searchTerm.toLowerCase().trim();
    return state.posts.filter(post => {
      const matchesSearch = !term || post.searchText.includes(term);
      const matchesCategory = state.activeCategory === 'all' || post.category === state.activeCategory;
      return matchesSearch && matchesCategory;
    });
  },

  // ✅ TWEAK 2 APPLIED: Direct element creation (no wrapper div needed)
  createCardElement(post) {
    const isExternal = post.link.startsWith('http');
    const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer" aria-label="Opens in a new tab"' : '';

    // Format date
    const dateFormatted = post.date
      ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="card-body">
        <span class="category">${escapeHTML(post.category)}</span>
        ${(dateFormatted || post.readTime) ? `
        <div class="card-meta">
          ${dateFormatted ? `<span>📅 ${escapeHTML(dateFormatted)}</span>` : ''}
          ${post.readTime ? `<span>⏱ ${escapeHTML(post.readTime)}</span>` : ''}
        </div>` : ''}
        <h3><a href="${escapeHTML(post.link)}" ${targetAttr}>${escapeHTML(post.title)}</a></h3>
        <p>${escapeHTML(post.excerpt)}</p>
      </div>
      <a href="${escapeHTML(post.link)}" ${targetAttr} class="read-more">Read More →</a>
    `;
    return article;
  },

  renderCards() {
    if (!this.elements.container) return;
    const filtered = this.getFilteredPosts();

    if (filtered.length === 0) {
      $.setHtml(this.elements.container, `<p class="empty-msg" role="status">${CONFIG.messages.emptySearch}</p>`);
      this.announceResults(0);
      this.updateCountBadge(0, state.posts.length);
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(post => {
      // ✅ TWEAK 2 APPLIED: Append the element directly to the fragment
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
    // Ignore unknown categories from URLs or stale localStorage
    const validCategories = new Set(['all', ...new Set(state.posts.map(p => p.category))]);
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

// ---------- Code Block Copy Buttons ----------
function initCodeCopyButtons() {
  const preBlocks = document.querySelectorAll('.prose pre');
  preBlocks.forEach(pre => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    wrapper.appendChild(btn);

    $.on(btn, 'click', async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
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

// ---------- Initialization ----------
function init() {
  initTheme();
  initThemeToggle();
  initMobileMenu();
  initActiveNav();
  initSmoothScroll();
  initScrollToTop();
  initSkipLink();
  initReadingProgress();
  if (Page.isHome()) Articles.init();
  if (Page.getCurrentPage() === 'contact.html') initContactForm();
  initCodeCopyButtons();

  // ✅ TWEAK 1 APPLIED: Removed preloadImages entirely since there's no LCP image to preload.

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