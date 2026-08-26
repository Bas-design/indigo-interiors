/* =============================================================
   Indigo Interiors — logo reveal (home page only)
   Vanilla port of the approved design reference
   ("Indigo Logo Reveal.dc.html"). Timing, easing, geometry and
   the runtime-measurement approach are final — do not tweak.
   ============================================================= */
(function () {
  'use strict';

  var SPEED = 1;                       // 0.5–2
  var PLAY_MODE = 'once-per-visitor';  // 'always' | 'once-per-visitor'

  var ovl = document.getElementById('ovl');
  if (!ovl) return;

  var g = function (id) { return document.getElementById(id); };
  var anims = [];
  var m = null;

  /* Refreshing part-way down the page used to replay the reveal over an
     already-scrolled, already-revealed site. Two separate causes:

       1. Browsers restore the previous scroll position on reload, and they
          do it AFTER our scripts run — so setup()'s scrollTo(0,0) was being
          undone a moment later.
       2. main.js's IntersectionObserver then fired for everything on screen,
          so the content underneath was fully faded in before the animation
          had started.

     Deciding this at the top of the file (before layout settles and before
     main.js runs) makes a refresh behave exactly like clicking the navbar
     logo: top of page, nothing revealed, animation from a clean slate.
     `willPlay` duplicates the checks in play() because the decision has to
     happen now; play() re-checks them at its own leisure. */
  var willPlay = (function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (new URLSearchParams(location.search).get('reveal') === '1') return true;
    if (PLAY_MODE !== 'once-per-visitor') return true;
    try { return !localStorage.getItem('indigoRevealSeen'); } catch (e) { return true; }
  })();

  if (willPlay) {
    // Stop the browser restoring the old scroll position over the top of us.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // Belt and braces: a restore can still land in the same frame on some
    // browsers, so hold the top until the first frame has been painted.
    requestAnimationFrame(function () { window.scrollTo(0, 0); });
  }

  function fit() {
    var outer = g('stageOuter');
    if (!outer) return;
    var s = Math.min(window.innerWidth * 0.9 / 1006.75, window.innerHeight * 0.68 / 1097.71) * 0.57;
    outer.style.transform = 'scale(' + s + ')';
  }

  function measure() {
    // overlay must be visible and rows at identity transform while we read geometry
    ovl.style.display = 'flex';
    var rT = g('rowTop'), rB = g('rowBot');
    rT.getAnimations().concat(rB.getAnimations()).forEach(function (a) { try { a.cancel(); } catch (e) {} });
    rT.style.transform = 'none'; rB.style.transform = 'none';
    var tw0 = g('textWrap');
    tw0.style.transform = 'none';
    void rT.offsetWidth;
    var stage = g('stage');
    var st = stage.getBoundingClientRect();
    var sc = st.width / 1006.75;
    var u = function (el) {
      var r = el.getBoundingClientRect();
      return { left: (r.left - st.left) / sc, top: (r.top - st.top) / sc, w: r.width / sc, h: r.height / sc };
    };
    // The wordmark is SVG outlines (tools/build-wordmark.js), so an element's
    // bounding box IS its ink box — no side bearings, no baseline offset, and
    // no font to wait for. The old canvas pixel-scan existed only to recover
    // these numbers from rendered webfont text.
    var i1 = u(g('i1T'));
    var i2 = u(g('i2T'));
    var cx = function (r) { return r.left + r.w / 2; };
    var CX = 503.37;
    var tT = CX - cx(i1);
    var tB = CX - cx(i2);
    // pick merged Y so the shared I lands exactly on the pillar box: no zoom needed
    var targetCY = 1097.71 - 742.72 / 2;
    var inkCY0 = i2.top + i2.h / 2; // ink center at identity
    var yMerge = targetCY - inkCY0;
    var oy = targetCY;
    var S = 742.72 / i1.h; // residual correction, ~1
    // pillar start offsets: overlap so the pillar pair matches the text I's ink width exactly
    var o = Math.max(0, 475.66 - i1.w * S) - 28.6;
    // start positions fully off-screen: viewport half-width in stage coords + row width
    var sFit = Math.min(window.innerWidth * 0.9 / 1006.75, window.innerHeight * 0.68 / 1097.71) * 0.57;
    var halfVW = (window.innerWidth / 2) / sFit;
    var wT = u(rT).w, wB = u(rB).w;
    var startTT = CX - halfVW - wT - 60;
    var startTB = CX + halfVW + 60;
    m = {
      tT: tT, tB: tB, oy: oy, S: S, yMerge: yMerge,
      yT0: yMerge - 430, yB0: yMerge + 430,
      pTL: 265.54 + o / 2, pTR: -265.55 - o / 2,
      startTT: startTT, startTB: startTB
    };
  }

  function setup() {
    ovl.style.display = 'flex'; ovl.style.opacity = '1';
    // page is visible under the transparent overlay — hold scroll until done
    document.body.style.overflow = 'hidden';
    var de = document.documentElement;
    var sb = de.style.scrollBehavior;
    de.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    de.style.scrollBehavior = sb;
    g('rowTop').style.transform = 'translate(' + m.startTT + 'px,' + m.yT0 + 'px)';
    g('rowTop').style.opacity = '0';
    g('rowBot').style.transform = 'translate(' + m.startTB + 'px,' + m.yB0 + 'px)';
    g('rowBot').style.opacity = '0';
    ['i1T', 'ndigoT', 'interT', 'orsT', 'i2T'].forEach(function (i) { g(i).style.opacity = '1'; });
    var tw = g('textWrap');
    tw.style.transformOrigin = '503.37px ' + m.oy + 'px';
    tw.style.transform = 'scale(1)';
    tw.style.opacity = '1';
    g('pillarL').style.opacity = '0';
    g('pillarL').style.transform = 'translateX(' + m.pTL + 'px)';
    g('pillarR').style.opacity = '0';
    g('pillarR').style.transform = 'translateX(' + m.pTR + 'px)';
    g('doorHL').style.transform = 'perspective(649.6px) rotateY(0deg) scaleX(0)';
    g('doorHL').style.opacity = '1';
    g('doorHR').style.transform = 'perspective(649.6px) rotateY(0deg) scaleX(0)';
    g('doorHR').style.opacity = '1';
    g('hndL').style.opacity = '0'; g('hndR').style.opacity = '0';
    g('archP').style.strokeDashoffset = '950';
    g('fanClipR').style.width = '0px';
    g('fanG').style.opacity = '0';
    g('seamR').style.transform = 'scaleY(0)';
    g('doorsOpenG').style.opacity = '0';
  }

  var timers = [];
  var playing = false;

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function finish() {
    playing = false;
    ovl.style.display = 'none';
    document.body.style.overflow = '';
    // hand scroll restoration back so ordinary back/forward navigation
    // returns the visitor to where they were
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    try { localStorage.setItem('indigoRevealSeen', '1'); } catch (e) {}
    document.body.classList.add('nav-revealed');
    document.body.classList.add('revealed');
  }

  /* Click anywhere mid-animation: skip. The overlay is transparent (the
     hero's own background sits underneath), so we just fade the animated
     stage out over 0.3s and let the hero content fade in as usual — no
     jarring cut, no flash. Running animations are left in place while the
     fade plays and only cancelled once the overlay is hidden. */
  function skipReveal() {
    if (!playing) return;
    playing = false;
    clearTimers();
    document.body.classList.add('nav-revealed');
    document.body.classList.add('revealed');
    var a = ovl.animate({ opacity: [getComputedStyle(ovl).opacity, 0] },
      { duration: 300, easing: 'ease-out', fill: 'forwards' });
    anims.push(a);
    a.onfinish = function () {
      anims.forEach(function (x) { try { x.cancel(); } catch (e) {} });
      anims = [];
      ovl.style.opacity = '0';
      finish();
    };
  }
  ovl.addEventListener('click', skipReveal);

  function play() {
    // header logo links here with ?reveal=1 — always play, overriding the
    // once-per-visitor skip (reduced-motion still wins)
    var forced = new URLSearchParams(location.search).get('reveal') === '1';
    var seen = PLAY_MODE === 'once-per-visitor' && (function () {
      try { return localStorage.getItem('indigoRevealSeen'); } catch (e) { return null; }
    })();
    var skip = (seen && !forced) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skip) { finish(); return; }

    // The wordmark is inline SVG — nothing to load before measuring. We still
    // defer one frame so layout has settled (the overlay was just shown).
    Promise.resolve().then(function () {
      return new Promise(function (r) { requestAnimationFrame(function () { r(); }); });
    }).then(function () {
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      anims = [];
      clearTimers();
      measure();
      setup();
      playing = true;
      var f = 0.82 / SPEED;
      // navbar fades in as the opening text glide decelerates
      timers.push(setTimeout(function () {
        document.body.classList.add('nav-revealed');
      }, 3000 * f));
      var EASE = 'cubic-bezier(.45,0,.2,1)';
      var A = function (el, kf, delay, dur, ease) {
        if (!el) return { onfinish: null, cancel: function () {} };
        var a = el.animate(kf, { delay: delay * f, duration: dur * f, easing: ease || EASE, fill: 'forwards' });
        anims.push(a); return a;
      };
      var Y = m.yMerge;
      // 1. words sweep in from far off the sides, at full logo scale
      A(g('rowTop'), { transform: ['translate(' + m.startTT + 'px,' + m.yT0 + 'px)', 'translate(' + m.tT + 'px,' + m.yT0 + 'px)'], opacity: [0, 1, 1] }, 0, 3000, 'cubic-bezier(.25,.6,.2,1)');
      A(g('rowBot'), { transform: ['translate(' + m.startTB + 'px,' + m.yB0 + 'px)', 'translate(' + m.tB + 'px,' + m.yB0 + 'px)'], opacity: [0, 1, 1] }, 0, 3000, 'cubic-bezier(.25,.6,.2,1)');
      // 2. converge vertically onto the shared I
      A(g('rowTop'), { transform: ['translate(' + m.tT + 'px,' + m.yT0 + 'px)', 'translate(' + m.tT + 'px,' + Y + 'px)'] }, 3400, 1600);
      A(g('rowBot'), { transform: ['translate(' + m.tB + 'px,' + m.yB0 + 'px)', 'translate(' + m.tB + 'px,' + Y + 'px)'] }, 3400, 1600);
      A(g('orsT'), { opacity: [1, 0] }, 3400, 1250);
      // 3. fade all letters but the I (tiny residual settle onto exact pillar height)
      A(g('interT'), { opacity: [1, 0] }, 4900, 900);
      A(g('ndigoT'), { opacity: [1, 0] }, 4900, 900);
      A(g('i1T'), { opacity: [1, 0] }, 4900, 900);
      A(g('textWrap'), { transform: ['scale(1)', 'scale(' + m.S + ')'] }, 4900, 1000);
      // 4. split: I becomes the two pillars (post-split runs brisker)
      A(g('pillarL'), { opacity: [0, 1] }, 5900, 320, 'ease-out');
      A(g('pillarR'), { opacity: [0, 1] }, 5900, 320, 'ease-out');
      A(g('textWrap'), { opacity: [1, 0] }, 5980, 360, 'ease-in');
      A(g('pillarL'), { transform: ['translateX(' + m.pTL + 'px)', 'translateX(0px)'] }, 6060, 950, 'cubic-bezier(.65,0,.25,1)');
      A(g('pillarR'), { transform: ['translateX(' + m.pTR + 'px)', 'translateX(0px)'] }, 6060, 950, 'cubic-bezier(.65,0,.25,1)');
      // 5. doors slide out from the seam (start at exactly 0 — a near-zero
      // scale leaves a 1px hairline at full render scale)
      A(g('doorHL'), { transform: ['perspective(649.6px) rotateY(0deg) scaleX(0)', 'perspective(649.6px) rotateY(0deg) scaleX(1)'] }, 7080, 560, 'cubic-bezier(.3,.6,.2,1)');
      A(g('doorHR'), { transform: ['perspective(649.6px) rotateY(0deg) scaleX(0)', 'perspective(649.6px) rotateY(0deg) scaleX(1)'] }, 7080, 560, 'cubic-bezier(.3,.6,.2,1)');
      A(g('hndL'), { opacity: [0, 1] }, 7560, 240);
      A(g('hndR'), { opacity: [0, 1] }, 7560, 240);
      // 6. arch draws from the right, fanlight wipes in left-to-right
      A(g('archP'), { strokeDashoffset: [950, 0] }, 7240, 800, 'cubic-bezier(.5,0,.3,1)');
      A(g('fanG'), { opacity: [0, 1] }, 7240, 120);
      A(g('fanClipR'), { width: ['0px', '418px'] }, 7240, 800, 'cubic-bezier(.5,0,.3,1)');
      // 7. doors open inward (end pose matches the logo exactly), gold seam grows
      A(g('doorHL'), { transform: ['perspective(649.6px) rotateY(0deg) scaleX(1)', 'perspective(649.6px) rotateY(45.73deg) scaleX(1)'] }, 8280, 880, 'cubic-bezier(.65,0,.2,1)');
      A(g('doorHR'), { transform: ['perspective(649.6px) rotateY(0deg) scaleX(1)', 'perspective(649.6px) rotateY(-45.73deg) scaleX(1)'] }, 8280, 880, 'cubic-bezier(.65,0,.2,1)');
      A(g('seamR'), { transform: ['scaleY(0)', 'scaleY(1)'] }, 8360, 800);
      // 8. seamless handoff: the hero's identical static logo fades in
      // underneath (body.revealed) while the animated overlay fades out —
      // a crossfade between two pixel-aligned copies of the same frame.
      timers.push(setTimeout(function () {
        document.body.classList.add('revealed');
      }, 9560 * f));
      var last = A(ovl, { opacity: [1, 0] }, 9560, 700, 'ease-in-out');
      last.onfinish = finish;
    });
  }

  window.addEventListener('resize', fit);
  fit();

  play();
})();
