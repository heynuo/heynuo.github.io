/* ============================================
   HeyNuo – Global Scripts (Production Final)
   ============================================ */

const CONFIG = {
  siteUrl: 'https://heynuo.github.io',
  searchDebounceMs: 300,
  smoothScrollBehavior: 'smooth',
  mobileMenuBreakpoint: 768,
  debug: false
};

const state = {
  posts: [],
  activeCategory: 'all',
  searchTerm: ''
};

// ✅ REAL ARTICLE LINKS (no more #)
const POSTS = [
  {
    title: "Java OOP Crash Course",
    excerpt: "Learn object-oriented programming with Java – classes, inheritance, polymorphism, and real-world examples.",
    category: "Java",
    link: "java-oop.html",
    date: "2026-06-02"
  },
  {
    title: "Jinn & Islamic Theology",
    excerpt: "Authentic research on Jinn, sihr, and Islamic theology from Quran & Sunnah.",
    category: "Research",
    link: "jinn-islamic-theology.html",
    date: "2026-06-02"
  },
  {
    title: "Modern Web Development Guide",
    excerpt: "Build beautiful websites with HTML, CSS, JavaScript, and deploy for free on GitHub Pages.",
    category: "Web Dev",
    link: "web-dev-guide.html",
    date: "2026-06-02"
  }
];

// DOM utilities (same as before)
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
    const path = window.location.pathname;
    return path === '/' || path.endsWith('index.html') || path === '';
  },
  getCurrentPage: () => {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '') path = 'index.html';
    return path.includes('#') ? path.split('#')[0] : path;
  }
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function log(...args) {
  if (CONFIG.debug) console.log(...args);
}

function preloadImages(urls) {
  urls.forEach(url => {
    try { const img = new Image(); img.src = url; } catch(e) {}
  });
}

// ---------- Mobile Menu ----------
function initMobileMenu() {
  const menuBtn = $.get('#menu-btn');
  const navLinks = $.get('#nav-links');
  if (!menuBtn || !navLinks) return;
  const toggleMenu = (force) => {
    const isOpen = force !== undefined ? force : !navLinks.classList.contains('show');
    navLinks.classList.toggle('show', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  $.on(menuBtn, 'click', () => toggleMenu());
  $.getAll('a', navLinks).forEach(link => {
    $.on(link, 'click', () => toggleMenu(false));
  });
  $.on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('show')) {
      toggleMenu(false);
      menuBtn.focus();
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
  const currentPage = Page.getCurrentPage();
  $.getAll('.nav-links a').forEach(link => {
    let href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http')) {
      const url = new URL(href);
      href = url.pathname.split('/').pop() || 'index.html';
    }
    const isActive = href === currentPage || (currentPage === 'index.html' && (href === '/' || href === 'index.html'));
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
  const btn = $.get('#scrollToTop');
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

// ---------- Search & Filter ----------
const Articles = {
  elements: null,
  debounceTimer: null,
  init() {
    if (!Page.isHome()) return;
    this.elements = {
      container: $.get('#cards-container'),
      search: $.get('#searchInput'),
      filters: $.get('#filter-buttons')
    };
    if (!this.elements.container) return;
    state.posts = POSTS;
    if (state.posts.length === 0) {
      $.setHtml(this.elements.container, '<p class="empty-msg">No articles yet. Check back soon!</p>');
      return;
    }
    this.renderFilters();
    this.renderCards();
    this.bindEvents();
    this.announceResults(state.posts.length);
  },
  renderFilters() {
    if (!this.elements.filters) return;
    const categories = ['all', ...new Set(state.posts.map(p => p.category))];
    this.elements.filters.innerHTML = categories.map(cat => `
      <button class="filter-btn${cat === 'all' ? ' active' : ''}" data-category="${cat}" aria-pressed="${cat === 'all'}">
        ${cat === 'all' ? 'All' : cat}
      </button>
    `).join('');
  },
  getFilteredPosts() {
    const term = state.searchTerm.toLowerCase();
    return state.posts.filter(post => {
      const matchesSearch = !term || post.title.toLowerCase().includes(term) || post.excerpt.toLowerCase().includes(term) || post.category.toLowerCase().includes(term);
      const matchesCategory = state.activeCategory === 'all' || post.category === state.activeCategory;
      return matchesSearch && matchesCategory;
    });
  },
  renderCards() {
    if (!this.elements.container) return;
    const filtered = this.getFilteredPosts();
    if (filtered.length === 0) {
      $.setHtml(this.elements.container, '<p class="empty-msg" role="status">No articles found. Try a different search or filter.</p>');
      this.announceResults(0);
      return;
    }
    $.setHtml(this.elements.container, filtered.map(post => {
      const isExternal = post.link.startsWith('http');
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
      return `
        <article class="card">
          <div>
            <span class="category">${post.category}</span>
            <h3><a href="${post.link}" ${targetAttr}>${post.title}</a></h3>
            <p>${post.excerpt}</p>
          </div>
          <a href="${post.link}" ${targetAttr} class="read-more">Read More →</a>
        </article>
      `;
    }).join(''));
    this.announceResults(filtered.length);
  },
  setupSearch() {
    if (!this.elements.search) return;
    $.on(this.elements.search, 'input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        state.searchTerm = e.target.value;
        this.renderCards();
      }, CONFIG.searchDebounceMs);
    });
  },
  bindEvents() {
    if (!this.elements.filters) return;
    $.on(this.elements.filters, 'click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      $.getAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      state.activeCategory = btn.dataset.category;
      this.renderCards();
    });
    const filterBtns = $.getAll('.filter-btn', this.elements.filters);
    filterBtns.forEach((btn, index) => {
      $.on(btn, 'keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = filterBtns[(index + 1) % filterBtns.length];
          next?.focus();
          next?.click();
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = filterBtns[(index - 1 + filterBtns.length) % filterBtns.length];
          prev?.focus();
          prev?.click();
        }
      });
    });
    this.setupSearch();
  },
  announceResults(count) {
    let announcer = $.get('#search-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'search-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;';
      document.body.appendChild(announcer);
    }
    $.setText(announcer, `${count} article${count !== 1 ? 's' : ''} found`);
  }
};

function initContactForm() {
  const form = $.get('#contact-form');
  const status = $.get('#form-status');
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
  $.on(form, 'submit', () => {
    if (status) {
      status.textContent = '✓ Sending... (you\'ll be redirected after submission)';
      status.className = 'sending';
    }
  });
  if (new URLSearchParams(window.location.search).get('sent') === '1' && status) {
    status.textContent = '✅ Thank you! Your message has been sent. I\'ll reply within 24-48 hours.';
    status.className = 'success';
  }
}

function init() {
  initMobileMenu();
  initActiveNav();
  initSmoothScroll();
  initScrollToTop();
  if (Page.isHome()) Articles.init();
  if (window.location.pathname.includes('contact.html')) initContactForm();
  preloadImages([`${CONFIG.siteUrl}/images/favicon.png`, `${CONFIG.siteUrl}/images/og-banner.jpg`]);
  log(`✨ HeyNuo ready – ${Page.getCurrentPage()}`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}