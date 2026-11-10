/* =============================================================
   Indigo Interiors — main.js
   Shared behaviour: header, mobile nav, scroll reveals,
   gallery filter + lightbox, contact form.
   ============================================================= */
(function () {
  'use strict';

  /* ---------- Header ---------- */
  var header = document.querySelector('.site-header');

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Custom cursor ----------
     Gold triangle that morphs into a circle over clickables. Follower div
     (cursor: url() images can't animate between shapes). Fine pointers only. */
  if (window.matchMedia('(pointer: fine)').matches) {
    var cur = document.createElement('div');
    cur.className = 'cursor';
    cur.innerHTML =
      '<svg class="cursor__tri" width="34" height="34" viewBox="0 0 34 34">' +
        '<path d="M3.5 2.5 L12 30 L30 17.5 Z" fill="none" stroke="#ccbb92" stroke-width="1.6"/>' +
        '<path d="M8.8 9.4 L13.6 24.7 L23.6 17.7 Z" fill="#ccbb92"/>' +
      '</svg>' +
      '<svg class="cursor__circ" width="34" height="34" viewBox="0 0 34 34">' +
        '<circle cx="17" cy="17" r="13.5" fill="none" stroke="#ccbb92" stroke-width="1.6"/>' +
        '<circle cx="17" cy="17" r="8" fill="#ccbb92"/>' +
      '</svg>';
    document.body.appendChild(cur);
    document.documentElement.classList.add('has-cursor');

    var CLICKABLE = 'a, button, label, select, input, textarea, [role="button"]';
    document.addEventListener('mousemove', function (e) {
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      cur.classList.add('is-visible');
      cur.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(CLICKABLE)));
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-visible'); });
    document.addEventListener('mouseenter', function () { cur.classList.add('is-visible'); });
  }

  /* ---------- Hero: background slideshow ----------
     The strip fades in ~3s after load (also the backdrop of the logo
     reveal). Slides then crossfade; the interval only starts counting
     once the strip is visible, so the first image gets a full stay. */
  var heroSec = document.querySelector('.hero');
  var slides = document.querySelectorAll('.hero__slide');
  if (heroSec && slides.length) {
    var SLIDE_MS = 12000;
    var slideIdx = 0;
    var slideTimer = null;

    var goTo = function (idx) {
      slides[slideIdx].classList.remove('is-active');
      slideIdx = (idx + slides.length) % slides.length;
      slides[slideIdx].classList.add('is-active');
    };
    var startAuto = function () {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(function () { goTo(slideIdx + 1); }, SLIDE_MS);
    };

    /* The 3s hold exists so the logo reveal opens on a clean white stage.
       reveal.js decides synchronously before this script runs: if it
       skipped (already seen / reduced motion), body.revealed is already
       set — show the slideshow immediately. */
    var startSlides = function () {
      heroSec.classList.add('slides-on');
      if (slides.length > 1) startAuto();
    };
    if (document.body.classList.contains('revealed')) {
      startSlides();
    } else {
      setTimeout(startSlides, 3000);
    }

    // arrows (tablet/desktop): manual step also restarts the auto timer,
    // so the chosen image gets a full stay
    var stepBtn = function (sel, dir) {
      var btn = document.querySelector(sel);
      if (btn) btn.addEventListener('click', function () { goTo(slideIdx + dir); startAuto(); });
    };
    stepBtn('.hero__arrow--prev', -1);
    stepBtn('.hero__arrow--next', 1);
  }

  /* ---------- Hero: typewriter word ---------- */
  var typedEl = document.getElementById('typedWord');
  if (typedEl) {
    var WORDS = ['elegant', 'bespoke', 'timeless', 'personal'];
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      var wIdx = 0, len = WORDS[0].length, deleting = false;
      var tick = function () {
        var word = WORDS[wIdx];
        var delay;
        if (deleting) {
          len--;
          delay = 45;
          if (len === 0) {
            deleting = false;
            wIdx = (wIdx + 1) % WORDS.length;
            word = WORDS[wIdx];
            delay = 500;
          }
        } else {
          len++;
          delay = 95 + Math.random() * 70;
          if (len >= word.length) { len = word.length; deleting = true; delay = 2600; }
        }
        typedEl.textContent = word.slice(0, len);
        setTimeout(tick, delay);
      };
      // start by deleting the pre-rendered word, then cycle
      deleting = true;
      setTimeout(tick, 2600);
    }
  }

  /* ---------- Scroll-triggered reveals ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // let projects.js hook its dynamically-created tiles into the same observer
    window.INDIGO_OBSERVE = function (el) { io.observe(el); };
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Contact form ----------
     Delivery via Formspree (form's data-endpoint), spam protection via a
     honeypot field + Cloudflare Turnstile captcha (data-turnstile-key).
     With either attribute empty the form runs in demo mode: validates and
     shows success without sending. Setup steps: FORM-SETUP.md. */
  var form = document.getElementById('contactForm');
  if (form) {
    var endpoint = form.getAttribute('data-endpoint');
    var tsKey = form.getAttribute('data-turnstile-key');
    var live = !!endpoint;
    var submitBtn = form.querySelector('button[type="submit"]');
    var successBox = form.querySelector('.form-success');
    var errorBox = form.querySelector('.form-error');

    // Turnstile: load the script only when a site key is configured
    if (live && tsKey) {
      var ts = document.createElement('script');
      ts.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=indigoTsInit';
      ts.async = true;
      window.indigoTsInit = function () {
        window.turnstile.render('#captchaBox', { sitekey: tsKey, theme: 'light' });
      };
      document.head.appendChild(ts);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (successBox) successBox.classList.remove('is-visible');
      if (errorBox) errorBox.classList.remove('is-visible');

      // honeypot: humans never see this field; bots that fill it get a
      // silent fake success
      var trap = form.querySelector('input[name="website"]');
      if (trap && trap.value) {
        form.reset();
        if (successBox) successBox.classList.add('is-visible');
        return;
      }

      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var ok = field.value.trim() !== '';
        if (ok && field.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        field.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      // captcha must be solved before sending (only when configured)
      if (live && tsKey && window.turnstile) {
        var token = window.turnstile.getResponse();
        if (!token) {
          var box = document.getElementById('captchaBox');
          if (box) box.classList.add('is-missing');
          return;
        }
      }

      if (!live) { // demo mode
        form.reset();
        if (successBox) {
          successBox.classList.add('is-visible');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset();
        if (window.turnstile) window.turnstile.reset();
        if (successBox) {
          successBox.classList.add('is-visible');
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }).catch(function () {
        if (errorBox) {
          errorBox.classList.add('is-visible');
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Enquiry'; }
      });
    });
  }

  /* ---------- Testimonials (home) ----------
     The words live in assets/content/testimonials.json so they can be
     edited in Indigo Studio without touching index.html — the Studio is
     deliberately not allowed to write hand-authored pages.

     index.html ships the current three as static markup. They render
     immediately and remain if this fetch fails (no JavaScript, or the
     page opened from the file system), so the section is never blank;
     the JSON replaces them when it loads. */
  var tgrid = document.querySelector('[data-testimonials]');
  if (tgrid && window.fetch) {
    fetch('assets/content/testimonials.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var list = (data && data.testimonials) || [];
        if (!list.length) return;               // keep the fallback markup

        var frag = document.createDocumentFragment();
        list.forEach(function (t, i) {
          if (!t || !String(t.quote || '').trim()) return;
          var q = document.createElement('blockquote');
          q.className = 'testimonial';
          q.setAttribute('data-reveal', '');
          q.style.setProperty('--d', (i * 0.12) + 's');

          var p = document.createElement('p');
          // Curly quotes are added here so Mia never has to type them.
          p.textContent = '“' + String(t.quote).trim() + '”';
          q.appendChild(p);

          var who = [t.name, t.location].map(function (s) {
            return String(s || '').trim();
          }).filter(Boolean).join(' · ');
          if (who) {
            var cite = document.createElement('cite');
            cite.textContent = who;
            q.appendChild(cite);
          }
          frag.appendChild(q);
        });

        if (!frag.childNodes.length) return;    // nothing usable; keep fallback
        tgrid.innerHTML = '';
        tgrid.appendChild(frag);

        /* The reveal observer in this file ran before these existed, so
           show them directly rather than leaving them faded out. */
        tgrid.querySelectorAll('.testimonial').forEach(function (el) {
          el.classList.add('in-view');
        });
      })
      .catch(function () { /* keep the markup already on the page */ });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
