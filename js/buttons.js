/* =========================================================
   HeyNuo Button Runtime — v7.0 (Drop-In)
   Works with existing buttons.css. No other changes needed.
   Load:  <script src="buttons.js" defer></script>
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     0. ENVIRONMENT PROBES
     ========================================================= */
  const env = {
    now: () => performance.now(),
    reducedMotion: () =>
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    online: () => navigator.onLine !== false,
    sleep: (ms, signal) =>
      new Promise((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(t);
            reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );
      }),
  };

  /* =========================================================
     1. AUTO-INJECTED CSS (success / error states)
        Runs once, does not touch your buttons.css.
     ========================================================= */
  const STYLE_ID = 'hn-button-runtime-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .btn[data-btn-state="success"] {
        background: #16a34a !important;
        color: #fff !important;
        transform: translateY(-1px);
      }
      .btn[data-btn-state="success"] > * { opacity: 0; }
      .btn[data-btn-state="success"]::after {
        content: "";
        position: absolute;
        inset: 0; margin: auto;
        width: 20px; height: 20px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") center/contain no-repeat;
        animation: hn-btn-check 320ms cubic-bezier(.34,1.56,.64,1);
        z-index: 3;
      }
      @keyframes hn-btn-check {
        from { opacity: 0; transform: scale(.4) rotate(-12deg); }
        to   { opacity: 1; transform: scale(1)  rotate(0);     }
      }
      .btn[data-btn-state="error"] {
        background: #dc2626 !important;
        color: #fff !important;
        animation: hn-btn-shake 400ms cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes hn-btn-shake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-6px); }
        40%     { transform: translateX(5px);  }
        60%     { transform: translateX(-3px); }
        80%     { transform: translateX(2px);  }
      }
      .btn[data-offline-disable][aria-disabled="true"] {
        opacity: .5; cursor: not-allowed; pointer-events: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .btn[data-btn-state="success"]::after,
        .btn[data-btn-state="error"] { animation: none; }
      }
    `;
    document.head.appendChild(style);
  }

  /* =========================================================
     2. MODULE STATE
     ========================================================= */
  const SELECTOR = {
    pointer: '.btn-ripple, .btn-spotlight',
    spotlight: '.btn-spotlight',
    group: '.btn-group, .btn-segmented',
    toggle: '.btn[data-toggle]',
    popover: '.btn[popovertarget]',
    segmented: '.btn-segmented .btn',
    async: '[data-async]',
  };

  const initializedRoots = new WeakSet();
  const popoverCleanups = new WeakMap();
  const runControllers = new WeakMap();
  const runQueues = new WeakMap();
  const tabLocks = new Map();
  const plugins = new Map();

  /* =========================================================
     3. PLUGIN SYSTEM
     ========================================================= */
  function use(plugin) {
    if (!plugin?.name) throw new Error('Plugin needs a name');
    plugins.set(plugin.name, plugin);
    return () => plugins.delete(plugin.name);
  }
  function runHook(hook, ...args) {
    for (const p of plugins.values()) {
      try { p[hook]?.(...args); } catch (e) { console.error('[hn]', e); }
    }
  }

  /* =========================================================
     4. STATE MACHINE
     ========================================================= */
  function setState(btn, state, detail) {
    btn.dataset.btnState = state;
    btn.toggleAttribute('aria-busy', state === 'loading');
    btn.dispatchEvent(
      new CustomEvent('btn:state', {
        detail: { state, ...detail },
        bubbles: true,
      })
    );
  }

  /* =========================================================
     5. ASYNC RUNNER
     ========================================================= */
  async function runButton(btn, task, opts) {
    opts = opts || {};
    const {
      minDuration = 350,
      timeout,
      retries = 0,
      retryDelay = 500,
      concurrency = 'replace',
      offline = 'disable',
      successDelay = 600,
      errorDelay = 800,
      tabLock,
    } = opts;

    if (!btn || !(btn instanceof HTMLElement)) return;

    /* --- concurrency --- */
    if (btn.matches('[data-btn-state="loading"]')) {
      if (concurrency === 'reject') return;
      if (concurrency === 'queue') {
        const prior = runQueues.get(btn) ?? Promise.resolve();
        const next = prior.then(() => runButton(btn, task, opts));
        runQueues.set(btn, next.catch(() => { }));
        return next;
      }
      runControllers.get(btn)?.abort(new DOMException('Superseded', 'AbortError'));
    }

    /* --- offline --- */
    if (!env.online()) {
      if (offline === 'disable') {
        setState(btn, 'error');
        btn.dispatchEvent(new CustomEvent('btn:offline', { bubbles: true }));
        return;
      }
      if (offline === 'queue') {
        btn.dispatchEvent(new CustomEvent('btn:offline-queued', { bubbles: true }));
        await new Promise((resolve) => {
          const onOnline = () => { window.removeEventListener('online', onOnline); resolve(); };
          window.addEventListener('online', onOnline, { once: true });
        });
      }
    }

    /* --- cross-tab lock --- */
    let releaseLock = () => { };
    if (tabLock && typeof BroadcastChannel !== 'undefined') {
      if (!tabLocks.has(tabLock)) tabLocks.set(tabLock, new BroadcastChannel(tabLock));
      const ch = tabLocks.get(tabLock);
      const claim = `claim:${crypto.randomUUID?.() ?? Date.now()}`;
      let lost = false;
      const onMsg = (e) => {
        if (typeof e.data === 'string' && e.data.startsWith('claim:') && e.data !== claim) {
          lost = true;
        }
      };
      ch.addEventListener('message', onMsg);
      ch.postMessage(claim);
      await env.sleep(30);
      if (lost) {
        ch.removeEventListener('message', onMsg);
        setState(btn, 'error');
        btn.dispatchEvent(new CustomEvent('btn:tab-locked', { bubbles: true }));
        return;
      }
      releaseLock = () => ch.removeEventListener('message', onMsg);
    }

    /* --- abort + a11y label --- */
    const ac = new AbortController();
    runControllers.set(btn, ac);
    const prevLabel = btn.getAttribute('aria-label');
    const text = btn.textContent.trim();
    if (!prevLabel && text) btn.setAttribute('aria-label', `${text}, loading`);

    /* --- plugin hook --- */
    let finalTask = task;
    for (const p of plugins.values()) {
      if (p.beforeRun) {
        try { finalTask = p.beforeRun(btn, finalTask, opts) ?? finalTask; }
        catch (e) { console.error('[hn]', e); }
      }
    }

    if (timeout) {
      setTimeout(
        () => ac.abort(new DOMException('Timeout', 'TimeoutError')),
        timeout
      );
    }

    setState(btn, 'loading');
    const t0 = env.now();

    /* --- retry loop --- */
    let attempt = 0, lastErr;
    while (attempt <= retries) {
      try {
        const result = await finalTask(ac.signal);
        const wait = Math.max(0, minDuration - (env.now() - t0));
        if (wait) await env.sleep(wait, ac.signal);

        if (runControllers.get(btn) !== ac) return result;

        setState(btn, 'success', { result });
        runHook('afterRun', btn, result, opts);
        if (successDelay) await env.sleep(successDelay).catch(() => { });

        if (runControllers.get(btn) === ac) {
          btn.removeAttribute('aria-busy');
          if (prevLabel) btn.setAttribute('aria-label', prevLabel);
          else btn.removeAttribute('aria-label');
          setState(btn, 'idle');
          runControllers.delete(btn);
        }
        releaseLock();
        return result;
      } catch (err) {
        if (err?.name === 'AbortError' && runControllers.get(btn) !== ac) return;
        lastErr = err;
        attempt++;
        if (attempt <= retries) {
          const backoff = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 100;
          btn.dispatchEvent(
            new CustomEvent('btn:retry', {
              detail: { attempt, delay: backoff, error: err },
              bubbles: true,
            })
          );
          try { await env.sleep(backoff, ac.signal); }
          catch { return; }
        }
      }
    }

    /* --- error path --- */
    setState(btn, 'error', { error: lastErr });
    runHook('onError', btn, lastErr, opts);
    btn.dispatchEvent(new CustomEvent('btn:error', { detail: lastErr, bubbles: true }));
    if (errorDelay) await env.sleep(errorDelay).catch(() => { });

    if (runControllers.get(btn) === ac) {
      btn.removeAttribute('aria-busy');
      if (prevLabel) btn.setAttribute('aria-label', prevLabel);
      else btn.removeAttribute('aria-label');
      setState(btn, 'idle');
      runControllers.delete(btn);
    }
    releaseLock();
    throw lastErr;
  }

  /* =========================================================
     6. POINTER / RIPPLE / SPOTLIGHT (delegated)
     ========================================================= */
  function installPointerTracking() {
    if (document.__hnPointerTracked) return;
    document.__hnPointerTracked = true;

    const setXY = (el, e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--btn-x', `${e.clientX - r.left}px`);
      el.style.setProperty('--btn-y', `${e.clientY - r.top}px`);
    };

    document.addEventListener(
      'pointerdown',
      (e) => {
        if (env.reducedMotion()) return;
        const el = e.target.closest(SELECTOR.pointer);
        if (el) setXY(el, e);
      },
      { passive: true, capture: true }
    );

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (env.reducedMotion()) return;
        const el = e.target.closest(SELECTOR.pointer);
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--btn-x', `${r.width / 2}px`);
        el.style.setProperty('--btn-y', `${r.height / 2}px`);
      },
      { passive: true }
    );

    document.addEventListener(
      'pointermove',
      (e) => {
        if (env.reducedMotion()) return;
        const el = e.target.closest(SELECTOR.spotlight);
        if (el) setXY(el, e);
      },
      { passive: true }
    );
  }

  /* =========================================================
     7. ROVING TABINDEX
     ========================================================= */
  function initGroup(group) {
    const btns = Array.from(group.querySelectorAll('.btn'));
    if (btns.length < 2) return;
    if (group.__hnRovingReady) return;
    group.__hnRovingReady = true;

    if (!btns.some((b) => b.hasAttribute('tabindex'))) {
      btns.forEach((b, i) => (b.tabIndex = i === 0 ? 0 : -1));
    }

    const goTo = (idx, focus) => {
      idx = (idx + btns.length) % btns.length;
      btns.forEach((b, i) => (b.tabIndex = i === idx ? 0 : -1));
      if (focus !== false) btns[idx].focus();
    };

    group.__hnRovingKeydown = (e) => {
      const cur = btns.indexOf(document.activeElement);
      if (cur === -1) return;
      let next = -1;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': next = cur + 1; break;
        case 'ArrowLeft':
        case 'ArrowUp': next = cur - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = btns.length - 1; break;
        default: return;
      }
      e.preventDefault();
      goTo(next);
    };
    group.addEventListener('keydown', group.__hnRovingKeydown);
  }

  /* =========================================================
     8. TOGGLE BUTTONS (delegated)
     ========================================================= */
  function initToggleDelegation(root) {
    if (root.__hnToggleDelegated) return;
    root.__hnToggleDelegated = true;

    root.addEventListener('click', (e) => {
      const btn = e.target.closest(SELECTOR.toggle);
      if (!btn || !root.contains(btn)) return;
      const next = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(next));
      btn.dispatchEvent(
        new CustomEvent('btn:toggle', { detail: { pressed: next }, bubbles: true })
      );
    });

    root.querySelectorAll(SELECTOR.toggle).forEach((b) => {
      if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    });
  }

  /* =========================================================
     9. POPOVER SYNC
     ========================================================= */
  function initPopover(btn) {
    if (popoverCleanups.has(btn)) return;
    const id = btn.getAttribute('popovertarget');
    const pop = id && document.getElementById(id);
    if (!pop) return;

    const sync = () => {
      const open = pop.matches(':popover-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.dispatchEvent(
        new CustomEvent(open ? 'btn:opened' : 'btn:closed', { bubbles: true })
      );
    };
    pop.addEventListener('toggle', sync);
    sync();
    popoverCleanups.set(btn, () => pop.removeEventListener('toggle', sync));
  }

  /* =========================================================
     10. SEGMENTED CONTROL
     ========================================================= */
  function initSegmented(root) {
    root.querySelectorAll(SELECTOR.segmented).forEach((btn) => {
      if (btn.__hnSegmented) return;
      btn.__hnSegmented = true;
      if (!btn.hasAttribute('aria-checked')) {
        btn.setAttribute(
          'aria-checked',
          btn.getAttribute('aria-pressed') ?? 'false'
        );
      }
      btn.addEventListener('click', () => {
        const group = btn.closest('.btn-segmented');
        if (!group) return;
        group.querySelectorAll('.btn').forEach((b) => {
          const isSelf = b === btn;
          b.setAttribute('aria-checked', String(isSelf));
          b.setAttribute('aria-pressed', String(isSelf));
        });
      });
    });
  }

  /* =========================================================
     11. ASYNC AUTO-WIRING
     ========================================================= */
  function initAsyncButtons(root) {
    root.querySelectorAll(SELECTOR.async).forEach((btn) => {
      if (btn.__hnAsyncWired) return;
      btn.__hnAsyncWired = true;

      const raw = btn.getAttribute('data-async-options');
      let opts = {};
      if (raw) {
        try { opts = JSON.parse(raw); }
        catch {
          opts = Object.fromEntries(
            raw.split(',').map((p) => p.split('=').map((s) => s.trim()))
          );
        }
      }

      btn.addEventListener('click', (e) => {
        const handler = btn.__hnAsyncHandler;
        if (!handler) return;
        e.preventDefault();
        runButton(btn, handler, opts).catch(() => { });
      });
    });
  }

  function bindAsync(btn, task, opts) {
    btn.__hnAsyncHandler = task;
    if (opts) btn.setAttribute('data-async-options', JSON.stringify(opts));
    initAsyncButtons(btn.parentNode ?? document);
  }

  /* =========================================================
     12. OFFLINE / ONLINE GLOBAL
     ========================================================= */
  function installNetworkListeners() {
    if (document.__hnNetwork) return;
    document.__hnNetwork = true;

    const apply = () => {
      document.querySelectorAll('[data-offline-disable]').forEach((btn) => {
        const isOffline = !navigator.onLine;
        btn.toggleAttribute('aria-disabled', isOffline);
        btn.classList.toggle('is-disabled', isOffline);
      });
    };
    window.addEventListener('online', apply);
    window.addEventListener('offline', apply);
    apply();
  }

  /* =========================================================
     13. PUBLIC API
     ========================================================= */
  function initButtons(root) {
    root = root || document;
    if (initializedRoots.has(root)) return;
    initializedRoots.add(root);

    installPointerTracking();
    installNetworkListeners();
    initToggleDelegation(root);

    const work = () => {
      root.querySelectorAll(SELECTOR.group).forEach(initGroup);
      root.querySelectorAll(SELECTOR.popover).forEach(initPopover);
      initSegmented(root);
      initAsyncButtons(root);
      runHook('onInit', root);
    };

    if (root === document && 'requestIdleCallback' in window) {
      requestIdleCallback(work, { timeout: 500 });
    } else {
      work();
    }
  }

  function destroyButtons(root) {
    root = root || document;
    root.querySelectorAll(SELECTOR.group).forEach((g) => {
      if (g.__hnRovingKeydown) {
        g.removeEventListener('keydown', g.__hnRovingKeydown);
        delete g.__hnRovingKeydown;
        delete g.__hnRovingReady;
      }
    });
    root.querySelectorAll(SELECTOR.popover).forEach((b) => {
      popoverCleanups.get(b)?.();
      popoverCleanups.delete(b);
    });
    runHook('onDestroy', root);
    initializedRoots.delete(root);
  }

  /* =========================================================
     14. BOOT  (auto-runs, no config needed)
     ========================================================= */
  function boot() {
    injectStyles();
    initButtons(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /* =========================================================
     15. GLOBAL EXPOSURE
     ========================================================= */
  window.hnButtons = {
    init: initButtons,
    destroy: destroyButtons,
    run: runButton,
    bindAsync,
    use,
    env,
    version: '7.0.0',
  };
})();
