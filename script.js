/* =====================================================================
   Happy Birthday website · behaviour
   You shouldn't need to edit this file. All content lives in config.js.
   ===================================================================== */
(function () {
  'use strict';

  var cfg = window.SITE || {};
  var $ = function (sel) { return document.querySelector(sel); };
  var params = new URLSearchParams(location.search);
  var PREVIEW = params.has('preview');   // ?preview skips the countdown & shows photo file names
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  // "2026-12-01" or "2026-12-01T00:00:00" → Date in the viewer's local time zone
  function parseLocal(str) {
    if (!str) return null;
    var s = String(str).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00';
    var d = new Date(s);
    return isNaN(d) ? null : d;
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9ऀ-ॿ\s]/g, ' ')   // keep letters/numbers (incl. Devanagari)
      .replace(/\s+/g, ' ')
      .trim();
  }

  function storage(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  // A photo box that falls back to a pretty placeholder if the file is missing
  function photoBox(src, alt, extraClass, onLoad, onMissing) {
    var box = el('div', 'photo' + (extraClass ? ' ' + extraClass : ''));
    function placeholder() {
      box.classList.add('is-empty');
      box.textContent = '';
      box.appendChild(el('span', 'photo-ph-heart'));
      if (PREVIEW && src) box.appendChild(el('span', 'photo-ph-name', src));
      if (onMissing) onMissing();
    }
    if (!src) { placeholder(); return box; }
    var img = new Image();
    img.alt = alt || '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.addEventListener('error', placeholder);
    img.addEventListener('load', function () { if (onLoad) onLoad(img); });
    img.src = src;
    box.appendChild(img);
    return box;
  }

  /* ---------- confetti ---------- */
  var heartShape = null;
  try {
    if (window.confetti && confetti.shapeFromPath) {
      heartShape = confetti.shapeFromPath({
        path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z'
      });
    }
  } catch (e) { heartShape = null; }
  var COLORS = ['#F8C8DC', '#B03A5B', '#E9D28A', '#C9557A', '#FFFFFF'];

  function burst(opts) {
    if (!window.confetti || REDUCED) return;
    var o = Object.assign({
      particleCount: 90, spread: 80, startVelocity: 40, origin: { y: 0.6 },
      colors: COLORS, scalar: 1.1, zIndex: 80
    }, opts || {});
    if (heartShape) o.shapes = [heartShape, 'circle'];
    try { confetti(o); } catch (e) { /* ignore */ }
  }

  function celebrate(duration) {
    if (!window.confetti || REDUCED) return;
    var end = Date.now() + (duration || 2600);
    (function frame() {
      burst({ particleCount: 4, angle: 60, spread: 60, startVelocity: 55, origin: { x: 0, y: 0.75 } });
      burst({ particleCount: 4, angle: 120, spread: 60, startVelocity: 55, origin: { x: 1, y: 0.75 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    setTimeout(function () { burst({ particleCount: 140, spread: 110, origin: { y: 0.45 } }); }, 400);
  }

  /* ---------- floating hearts ---------- */
  function startHearts() {
    if (REDUCED) return;
    var box = $('#hearts');
    var shades = ['#F8C8DC', '#F4A6C1', '#E07A9E', '#C9557A', '#E9D28A'];
    function spawn() {
      if (document.hidden || box.childElementCount > 16) return;
      var h = el('span', 'float-heart');
      var size = 10 + Math.random() * 20;
      h.style.left = (Math.random() * 100) + 'vw';
      h.style.setProperty('--s', size + 'px');
      h.style.setProperty('--c', shades[Math.floor(Math.random() * shades.length)]);
      h.style.setProperty('--o', (0.25 + Math.random() * 0.4).toFixed(2));
      h.style.setProperty('--d', (9 + Math.random() * 8).toFixed(1) + 's');
      h.style.setProperty('--x', ((Math.random() - 0.5) * 120).toFixed(0) + 'px');
      h.style.setProperty('--r', ((Math.random() - 0.5) * 60).toFixed(0) + 'deg');
      h.addEventListener('animationend', function () { h.remove(); });
      box.appendChild(h);
    }
    for (var i = 0; i < 5; i++) setTimeout(spawn, i * 400);
    setInterval(spawn, 900);
  }

  /* ---------- hearts that pop wherever she taps ---------- */
  function startTapHearts() {
    if (REDUCED) return;
    var shades = ['#FF7EB3', '#E0457B', '#9B5DE5', '#C59CF5', '#F1D78A', '#FF9A9E'];
    document.addEventListener('pointerdown', function (e) {
      if (!document.body.classList.contains('unlocked')) return;
      for (var i = 0; i < 7; i++) {
        var h = el('span', 'tap-heart');
        var angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
        var dist = 40 + Math.random() * 45;
        h.style.left = e.clientX + 'px';
        h.style.top = e.clientY + 'px';
        h.style.setProperty('--c', shades[i % shades.length]);
        h.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(0) + 'px');
        h.style.setProperty('--dy', (Math.sin(angle) * dist - 20).toFixed(0) + 'px');
        h.style.setProperty('--rot', ((Math.random() - 0.5) * 90).toFixed(0) + 'deg');
        h.addEventListener('animationend', function () { this.remove(); });
        document.body.appendChild(h);
      }
    }, { passive: true });
  }

  /* ---------- gradient scroll-progress bar ---------- */
  function startScrollProgress() {
    var bar = $('#scroll-progress');
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- twinkling sparkles around the opening screen ---------- */
  function addSparkles(container, count) {
    if (REDUCED) return;
    var box = el('div', 'sparkles');
    box.setAttribute('aria-hidden', 'true');
    var kinds = ['', 'pink', 'violet', '', 'pink'];
    for (var i = 0; i < count; i++) {
      var s = el('span', 'sparkle ' + kinds[i % kinds.length]);
      s.style.left = (4 + Math.random() * 92) + '%';
      s.style.top = (6 + Math.random() * 84) + '%';
      s.style.setProperty('--s', (8 + Math.random() * 14).toFixed(0) + 'px');
      s.style.setProperty('--d', (2.2 + Math.random() * 2.4).toFixed(1) + 's');
      s.style.setProperty('--delay', (Math.random() * 3).toFixed(1) + 's');
      box.appendChild(s);
    }
    container.appendChild(box);
  }

  /* ---------- music ---------- */
  var audio = $('#music');
  var musicBtn = $('#music-btn');
  var musicOk = !!(cfg.music && cfg.music.src);

  function setPlaying(on) {
    musicBtn.classList.toggle('playing', on);
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play our song');
  }
  function disableMusic() {
    musicOk = false;
    musicBtn.hidden = true;
  }
  function playMusic(showLabel) {
    if (!musicOk) return;
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () {
        setPlaying(true);
        if (showLabel && cfg.music.title) {
          var np = $('#now-playing');
          np.textContent = '♫ ' + cfg.music.title;
          np.classList.add('show');
          setTimeout(function () { np.classList.remove('show'); }, 3500);
        }
      }).catch(function (err) {
        if (err && err.name === 'NotAllowedError') setPlaying(false);   // autoplay blocked: user can tap ♫
        else disableMusic();                                              // file missing / unsupported
      });
    }
  }
  if (musicOk) {
    audio.src = cfg.music.src;
    audio.addEventListener('error', disableMusic);
    musicBtn.addEventListener('click', function () {
      if (audio.paused) playMusic(false);
      else { audio.pause(); setPlaying(false); }
    });
  }

  /* =====================================================================
     1. Countdown → 2. Lock screen → 3. The site
     ===================================================================== */
  var countdown = $('#countdown');
  var gate = $('#gate');

  function start() {
    if (PREVIEW) {
      var badge = el('div', 'preview-badge', 'Preview mode · countdown skipped');
      document.body.appendChild(badge);
    }
    startHearts();   // hearts float over the countdown/lock screen too
    var bday = parseLocal(cfg.birthday);
    if (!PREVIEW && bday && Date.now() < bday.getTime()) runCountdown(bday);
    else showGate();
  }

  function runCountdown(target) {
    countdown.hidden = false;
    var d = $('#cd-days'), h = $('#cd-hours'), m = $('#cd-mins'), s = $('#cd-secs');
    var timer;
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      clearInterval(timer);
      countdown.classList.add('leaving');
      setTimeout(function () { countdown.hidden = true; }, 900);
      showGate();
    }
    if (cfg.allowSkip !== false) {
      var skip = $('#cd-skip');
      skip.hidden = false;
      skip.addEventListener('click', finish);
    }
    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) { finish(); return; }
      d.textContent = pad(Math.floor(diff / 864e5));
      h.textContent = pad(Math.floor(diff / 36e5) % 24);
      m.textContent = pad(Math.floor(diff / 6e4) % 60);
      s.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  function showGate() {
    var lock = cfg.lock || {};
    var useQuiz = lock.enabled !== false && lock.question && lock.answers && lock.answers.length;
    var returning = !PREVIEW && storage('bday-unlocked') === '1';
    var form = $('#gate-form');
    var input = $('#gate-answer');
    var msg = $('#gate-msg');
    var hintBtn = $('#gate-hint-btn');
    var tries = 0;

    gate.hidden = false;

    if (!useQuiz || returning) {
      $('#gate-quiz').hidden = true;
      $('#gate-kicker').textContent = returning ? 'Welcome back, my love' : 'For your eyes only';
      $('#gate-title').textContent = returning ? 'Your surprise is still here' : 'I made something for you';
      $('#gate-btn').textContent = 'Open your surprise ❤';
    } else {
      $('#gate-question').textContent = lock.question;
      setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 700);
    }

    var wrongLines = [
      'Hmm, not quite, my love 🙈',
      'Try again. You know this one ❤',
      'So close! (Maybe?) Try once more',
    ];

    hintBtn.addEventListener('click', function () {
      msg.innerHTML = '';
      msg.appendChild(el('span', 'gate-hint', lock.hint));
      hintBtn.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (useQuiz && !returning) {
        var given = normalize(input.value);
        var ok = given && lock.answers.some(function (a) {
          var ans = normalize(a);
          return ans && (given === ans || (ans.length >= 3 && given.indexOf(ans) !== -1));
        });
        if (!ok) {
          tries++;
          msg.textContent = wrongLines[(tries - 1) % wrongLines.length];
          form.classList.remove('shake');
          void form.offsetWidth;   // restart animation
          form.classList.add('shake');
          if (lock.hint && tries >= 1) hintBtn.hidden = false;
          input.select();
          return;
        }
      }
      // Success. Start music inside the tap itself (phones require this).
      playMusic(true);
      if (!PREVIEW) storage('bday-unlocked', '1');
      unlock();
    });
  }

  function unlock() {
    if (document.activeElement) document.activeElement.blur();
    gate.classList.add('leaving');
    setTimeout(function () {
      gate.hidden = true;
      document.body.classList.remove('locked');
      document.body.classList.add('unlocked');
      window.scrollTo(0, 0);
      if (musicOk) musicBtn.hidden = false;
      celebrate(2600);
      startScrollProgress();
      startTapHearts();
    }, 750);
  }

  /* =====================================================================
     Build the page from config.js
     ===================================================================== */
  function buildHero() {
    var hero = cfg.hero || {};
    var name = cfg.herName || 'My Love';
    document.title = 'Happy Birthday, ' + name + ' ❤';
    $('#hero-greeting').textContent = cfg.age ? 'Happy ' + ordinal(cfg.age) + ' Birthday' : 'Happy Birthday';
    $('#hero-name').textContent = name;
    $('#hero-msg').textContent = hero.message || '';
    var slot = $('#hero-photo');
    if (hero.photo) {
      var box = photoBox(hero.photo, 'Us');
      box.classList.add('hero-photo');
      box.id = 'hero-photo';
      slot.replaceWith(box);
    } else {
      $('.hero-ring').remove();
    }
    addSparkles($('#hero'), 14);
    $('#footer-title').textContent = 'Happy Birthday, ' + name;
    $('#footer-name').textContent = cfg.yourName || 'me';
  }

  function buildTogether() {
    var since = parseLocal(cfg.togetherSince);
    if (!since) return;
    $('#together').hidden = false;
    var d = $('#tg-days'), h = $('#tg-hours'), m = $('#tg-mins'), s = $('#tg-secs');
    function tick() {
      var diff = Math.max(0, Date.now() - since.getTime());
      d.textContent = Math.floor(diff / 864e5).toLocaleString();
      h.textContent = Math.floor(diff / 36e5) % 24;
      m.textContent = Math.floor(diff / 6e4) % 60;
      s.textContent = Math.floor(diff / 1e3) % 60;
    }
    tick();
    setInterval(tick, 1000);
  }

  function buildStory() {
    var list = cfg.story || [];
    var wrap = $('#timeline');
    if (!list.length) { $('#story .timeline').remove(); return; }
    list.forEach(function (item) {
      var art = el('article', 't-item reveal');
      art.appendChild(el('span', 't-dot'));
      var card = el('div', 't-card');
      if (item.photo) card.appendChild(photoBox(item.photo, item.title));
      var body = el('div', 't-body');
      if (item.date) body.appendChild(el('p', 't-date', item.date));
      if (item.title) body.appendChild(el('h3', null, item.title));
      if (item.text) body.appendChild(el('p', null, item.text));
      card.appendChild(body);
      art.appendChild(card);
      wrap.appendChild(art);
    });
  }

  /* ---------- gallery + lightbox ---------- */
  var gallery = [];   // { src, caption, ok }
  var lbIndex = 0;

  function buildGallery() {
    var list = cfg.gallery || [];
    var grid = $('#gallery-grid');
    if (!list.length) { $('#gallery').remove(); return; }
    list.forEach(function (item, i) {
      var entry = { src: item.photo, caption: item.caption || '', ok: false };
      gallery.push(entry);
      var btn = el('button', 'polaroid reveal');
      btn.type = 'button';
      btn.style.setProperty('--tilt', ((i % 2 ? 1 : -1) * (1 + Math.random() * 2.5)).toFixed(1) + 'deg');
      var lag = (i % 4) * 110 + 'ms';   // photos drop in one after another
      btn.style.transitionDelay = lag + ', ' + lag + ', 0s, 0s, 0s';
      btn.setAttribute('aria-label', 'Open photo: ' + (item.caption || 'photo ' + (i + 1)));
      btn.appendChild(photoBox(item.photo, item.caption,
        null,
        function () { entry.ok = true; },
        function () { entry.ok = false; btn.classList.add('is-empty-photo'); }
      ));
      btn.appendChild(el('span', 'cap', item.caption || ''));
      btn.addEventListener('click', function () { if (entry.ok) openLightbox(i); });
      grid.appendChild(btn);
    });

    var lb = $('#lightbox');
    $('#lb-close').addEventListener('click', closeLightbox);
    $('#lb-prev').addEventListener('click', function () { stepLightbox(-1); });
    $('#lb-next').addEventListener('click', function () { stepLightbox(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
    var startX = null;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) stepLightbox(dx < 0 ? 1 : -1);
      startX = null;
    });
  }

  function showLightbox(i) {
    lbIndex = i;
    var img = $('#lb-img');
    img.src = gallery[i].src;
    img.alt = gallery[i].caption;
    $('#lb-cap').textContent = gallery[i].caption;
    // retrigger the little entrance animation
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
  }
  function openLightbox(i) {
    showLightbox(i);
    var many = gallery.filter(function (g) { return g.ok; }).length > 1;
    $('#lb-prev').hidden = $('#lb-next').hidden = !many;
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lb-close').focus();
  }
  function closeLightbox() {
    $('#lightbox').hidden = true;
    document.body.style.overflow = '';
  }
  function stepLightbox(dir) {
    for (var n = 1; n <= gallery.length; n++) {
      var j = (lbIndex + dir * n + gallery.length) % gallery.length;
      if (gallery[j].ok) { showLightbox(j); return; }
    }
  }

  /* ---------- reasons deck ---------- */
  function buildReasons() {
    var reasons = cfg.reasons || [];
    if (!reasons.length) { $('#reasons').remove(); return; }
    var card = $('#reason-card');
    var label = $('#reason-label');
    var text = $('#reason-text');
    var hint = $('#reason-next-hint');
    var bar = $('#reason-bar');
    var count = $('#reason-count');
    var i = -1;          // index currently shown (-1 = front of card)
    var busy = false;
    var END = reasons.length;   // the "and a million more" card

    function render() {
      if (i >= END) {
        label.textContent = 'Reason #∞';
        text.textContent = '…and a million more that don’t fit on a card. ❤';
        hint.textContent = 'tap to start again ↺';
        count.textContent = 'All ' + reasons.length + ' reasons (and counting)';
        bar.style.width = '100%';
      } else {
        label.textContent = 'Reason #' + (i + 1);
        text.textContent = reasons[i];
        hint.textContent = 'tap for the next one →';
        count.textContent = (i + 1) + ' of ' + reasons.length;
        bar.style.width = ((i + 1) / reasons.length * 100) + '%';
      }
      fitReason();
    }

    // Shrink the text until it fits on the card (long reasons, small or landscape screens).
    // Uses offsetTop/offsetHeight, which ignore the flip/toss animations.
    function fitReason() {
      text.style.fontSize = '';
      var size = parseFloat(getComputedStyle(text).fontSize);
      for (var g = 0; g < 60 && size > 9; g++) {
        var fits = label.offsetTop >= 0 &&
                   text.offsetTop + text.offsetHeight <= hint.offsetTop - 4;
        if (fits) break;
        size -= 0.5;
        text.style.fontSize = size + 'px';
      }
    }
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { if (i >= 0) fitReason(); }, 120);
    });

    count.textContent = reasons.length + ' reasons, and that’s just the start';

    card.addEventListener('click', function () {
      if (busy) return;
      if (i === -1) {            // first tap: flip the card over
        i = 0; render();
        card.classList.add('flipped');
        return;
      }
      busy = true;
      card.classList.add('toss');
      setTimeout(function () {
        i = i >= END ? 0 : i + 1;
        render();
        if (i === END) burst({ particleCount: 70, spread: 70, origin: { y: 0.55 } });
      }, 280);
      setTimeout(function () { card.classList.remove('toss'); busy = false; }, 620);
    });
  }

  /* ---------- make a wish ---------- */
  function buildWish() {
    var wish = cfg.wish || {};
    var n = Math.max(1, Math.min(10, parseInt(wish.candles, 10) || 5));
    var holder = $('#candles');
    var status = $('#wish-status');
    var micBtn = $('#mic-btn');
    var controls = $('#wish-controls');
    var done = $('#wish-done');
    var listening = null;

    $('#wish-msg').textContent = wish.message || 'May all your wishes come true.';

    function makeCandles() {
      holder.textContent = '';
      for (var c = 0; c < n; c++) {
        var b = el('button', 'candle');
        b.type = 'button';
        b.setAttribute('aria-label', 'Blow out candle ' + (c + 1));
        b.appendChild(el('span', 'flame'));
        b.appendChild(el('span', 'smoke'));
        b.addEventListener('click', function () { blowOut(this); });
        holder.appendChild(b);
      }
    }

    function lit() { return holder.querySelectorAll('.candle:not(.out)'); }

    function blowOut(candle) {
      if (!candle || candle.classList.contains('out')) return;
      candle.classList.add('out');
      candle.setAttribute('aria-label', 'Candle blown out');
      var left = lit().length;
      if (left === 0) allOut();
      else status.textContent = left + (left === 1 ? ' candle' : ' candles') + ' to go…';
    }

    function allOut() {
      stopMic();
      $('.cake-stage').classList.add('dark');
      controls.hidden = true;
      done.hidden = false;
      celebrate(1800);
    }

    function stopMic() {
      if (!listening) return;
      listening.stop();
      listening = null;
      micBtn.disabled = false;
      micBtn.textContent = '🎤 Blow into your mic';
      if (musicOk && !audio.paused) audio.volume = 0.6;
    }

    micBtn.addEventListener('click', function () {
      if (listening) { stopMic(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = 'Your browser can’t use the mic here. Tap the flames instead ❤';
        return;
      }
      micBtn.disabled = true;
      status.textContent = 'Allow the microphone, then blow gently…';
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        var ctx = new Ctx();
        var src = ctx.createMediaStreamSource(stream);
        var analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        var data = new Uint8Array(analyser.fftSize);
        var loud = 0, raf = 0, stopped = false;
        if (musicOk && !audio.paused) audio.volume = 0.12;   // so the song doesn't "blow" the candles

        function loop() {
          if (stopped) return;
          analyser.getByteTimeDomainData(data);
          var sum = 0;
          for (var k = 0; k < data.length; k++) { var v = (data[k] - 128) / 128; sum += v * v; }
          var rms = Math.sqrt(sum / data.length);
          if (rms > 0.13) {
            loud++;
            if (loud % 5 === 0) blowOut(lit()[0]);
          } else {
            loud = Math.max(0, loud - 1);
          }
          raf = requestAnimationFrame(loop);
        }

        listening = {
          stop: function () {
            stopped = true;
            cancelAnimationFrame(raf);
            stream.getTracks().forEach(function (t) { t.stop(); });
            try { ctx.close(); } catch (e) {}
          }
        };
        micBtn.disabled = false;
        micBtn.textContent = '✋ Stop listening';
        status.textContent = 'Listening… blow! 🌬️';
        loop();
      }).catch(function () {
        micBtn.disabled = false;
        status.textContent = 'No mic access, so tap each flame instead ❤';
      });
    });

    $('#relight-btn').addEventListener('click', function () {
      makeCandles();
      $('.cake-stage').classList.remove('dark');
      done.hidden = true;
      controls.hidden = false;
      status.textContent = '…or tap each flame to blow it out';
    });

    makeCandles();
  }

  /* ---------- love letter ---------- */
  function buildLetter() {
    var L = cfg.letter || {};
    var paras = L.paragraphs || [];
    var env = $('#envelope');
    var wrap = $('#envelope-wrap');
    var paper = $('#letter-paper');
    var body = $('#letter-body');
    var end = $('#letter-end');
    var skip = $('#letter-skip');
    var typing = null;

    $('#letter-greeting').textContent = L.greeting || '';
    $('#letter-closing').textContent = L.closing || '';
    $('#letter-sign').textContent = cfg.yourName || '';

    function finish() {
      if (typing) { clearTimeout(typing); typing = null; }
      body.textContent = '';
      paras.forEach(function (p) { body.appendChild(el('p', null, p)); });
      end.classList.add('show');
      skip.hidden = true;
    }

    function typeOut() {
      if (REDUCED) { finish(); return; }
      var pi = 0, ci = 0, current = null;
      var cursor = el('span', 'cursor');
      function step() {
        if (pi >= paras.length) { cursor.remove(); finish(); return; }
        if (!current) { current = el('p'); body.appendChild(current); current.appendChild(cursor); }
        var txt = paras[pi];
        ci++;
        current.textContent = txt.slice(0, ci);
        current.appendChild(cursor);
        var ch = txt.charAt(ci - 1);
        var delay = /[.,!?…;:]/.test(ch) ? 260 : 24;
        if (ci >= txt.length) { pi++; ci = 0; current = null; delay = 650; }
        typing = setTimeout(step, delay);
      }
      step();
    }

    env.addEventListener('click', function () {
      if (env.classList.contains('open')) return;
      env.classList.add('open');
      burst({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(function () { wrap.classList.add('fading'); }, 1500);
      setTimeout(function () {
        wrap.hidden = true;
        paper.hidden = false;
        paper.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        setTimeout(typeOut, 700);
      }, 2100);
    });
    skip.addEventListener('click', finish);
  }

  /* ---------- final surprise ---------- */
  function buildSurprise() {
    var S = cfg.surprise || {};
    var gift = $('#gift');
    $('#surprise-teaser').textContent = S.teaser || '';
    $('#surprise-title').textContent = S.title || '';
    $('#surprise-msg').textContent = S.message || '';
    if (S.photo) $('#surprise-photo').appendChild(photoBox(S.photo, S.title));

    gift.addEventListener('click', function () {
      if (gift.classList.contains('open')) return;
      gift.classList.add('open');
      celebrate(2200);
      setTimeout(function () { $('#gift-wrap').style.opacity = '0'; }, 900);
      setTimeout(function () {
        $('#gift-wrap').hidden = true;
        var card = $('#surprise-card');
        card.hidden = false;
        card.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
      }, 1400);
    });
  }

  /* ---------- scroll reveal ---------- */
  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- go! ---------- */
  buildHero();
  buildTogether();
  buildStory();
  buildGallery();
  buildReasons();
  buildWish();
  buildLetter();
  buildSurprise();
  setupReveal();
  start();
})();
