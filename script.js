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

  // her age on this birthday: from "age", or worked out from "bornOn" and "birthday"
  var AGE = (function () {
    if (cfg.age) return cfg.age;
    var born = parseLocal(cfg.bornOn), bday = parseLocal(cfg.birthday);
    if (!born || !bday) return null;
    var a = bday.getFullYear() - born.getFullYear();
    if (bday.getMonth() < born.getMonth() || (bday.getMonth() === born.getMonth() && bday.getDate() < born.getDate())) a--;
    return a > 0 ? a : null;
  })();

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
  function photoBox(src, alt, extraClass, onLoad, onMissing, look) {
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
    if (look && look.focus) { img.style.objectPosition = look.focus; img.style.transformOrigin = look.focus; }
    if (look && look.zoom) img.style.transform = 'scale(' + look.zoom + ')';
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
  var COLORS = ['#FF7EB3', '#E0457B', '#F8C8DC', '#C59CF5', '#F1D78A'];

  // a small, soft puff of hearts (for little moments)
  function burst(opts) {
    if (!window.confetti || REDUCED) return;
    var o = Object.assign({
      particleCount: 26, spread: 70, startVelocity: 22, gravity: 0.6, decay: 0.92, ticks: 260,
      origin: { y: 0.6 }, colors: COLORS, scalar: 1.25, zIndex: 80
    }, opts || {});
    if (heartShape) o.shapes = [heartShape];
    try { confetti(o); } catch (e) { /* ignore */ }
  }

  // hearts drifting slowly down from the top of the screen (for the big moments)
  function celebrate(duration) {
    if (!window.confetti || REDUCED) return;
    var end = Date.now() + (duration || 2600);
    var t = setInterval(function () {
      if (Date.now() > end) { clearInterval(t); return; }
      burst({
        particleCount: 2, angle: 270, spread: 60, startVelocity: 5, gravity: 0.5, decay: 0.95,
        drift: (Math.random() - 0.5) * 0.8, ticks: 480, scalar: 1.4,
        origin: { x: Math.random(), y: -0.06 }
      });
    }, 110);
  }

  /* ---------- rose petals drifting down ---------- */
  function startPetals() {
    if (REDUCED) return;
    var box = $('#hearts');
    var shades = [['#FFD1E3', '#F48FB1'], ['#FBC2EB', '#E0457B'], ['#FFE3EC', '#F7A1C4'], ['#F3E6FF', '#C59CF5'], ['#FFE6D5', '#FF9EAA']];
    function spawn() {
      if (document.hidden || box.childElementCount > 9) return;
      var p = el('span', 'petal');
      var c = shades[Math.floor(Math.random() * shades.length)];
      p.style.left = (Math.random() * 96) + 'vw';
      p.style.setProperty('--s', (11 + Math.random() * 9).toFixed(0) + 'px');
      p.style.setProperty('--c1', c[0]);
      p.style.setProperty('--c2', c[1]);
      p.style.setProperty('--o', (0.55 + Math.random() * 0.3).toFixed(2));
      p.style.setProperty('--d', (14 + Math.random() * 8).toFixed(1) + 's');
      p.style.setProperty('--x', ((Math.random() - 0.5) * 140).toFixed(0) + 'px');
      p.style.setProperty('--r', (80 + Math.random() * 120).toFixed(0) + 'deg');
      p.addEventListener('animationend', function () { p.remove(); });
      box.appendChild(p);
    }
    for (var i = 0; i < 3; i++) setTimeout(spawn, i * 1200);
    setInterval(spawn, 1700);
  }

  /* ---------- a single heart floats up wherever she taps ---------- */
  function startTapHearts() {
    if (REDUCED) return;
    var shades = ['#FF7EB3', '#E0457B', '#C59CF5', '#F48FB1'];
    document.addEventListener('pointerdown', function (e) {
      if (!document.body.classList.contains('unlocked')) return;
      if (e.target.closest && e.target.closest('button, a, input, canvas, .lightbox, .ow-modal, .game-modal')) return;
      var h = el('span', 'tap-heart');
      h.style.left = e.clientX + 'px';
      h.style.top = e.clientY + 'px';
      h.style.setProperty('--c', shades[Math.floor(Math.random() * shades.length)]);
      h.addEventListener('animationend', function () { h.remove(); });
      document.body.appendChild(h);
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
      s.style.setProperty('--d', (3.5 + Math.random() * 3).toFixed(1) + 's');
      s.style.setProperty('--delay', (Math.random() * 4).toFixed(1) + 's');
      box.appendChild(s);
    }
    container.appendChild(box);
  }

  /* ---------- music ---------- */
  var audio = $('#music');
  var musicBtn = $('#music-btn');
  var musicOk = !!(cfg.music && cfg.music.src);
  // music.reveal = "scratch": the song stays a surprise until Scratch & See (or the love letter) reveals it
  var songHidden = !!(cfg.music && cfg.music.reveal === 'scratch');
  if (songHidden && !PREVIEW && storage('bday-song') === '1') songHidden = false;   // already revealed on this phone

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
  // phones only let a page play sound after a tap: play muted for an instant during the unlock tap
  function primeMusic() {
    if (!musicOk) return;
    try {
      audio.muted = true;
      var p = audio.play();
      var done = function () { audio.pause(); audio.currentTime = 0; audio.muted = false; };
      if (p && p.then) p.then(done).catch(function () { audio.muted = false; });
      else done();
    } catch (e) { audio.muted = false; }
  }
  // used by Scratch & See (games.js) and the love letter
  window.BirthdaySong = {
    available: function () { return musicOk; },
    title: function () { return (cfg.music && cfg.music.title) || 'Our Song'; },
    revealed: function () { return !songHidden; },
    reveal: function () {
      if (!musicOk) return false;
      var first = songHidden;
      songHidden = false;
      if (!PREVIEW) storage('bday-song', '1');
      musicBtn.hidden = false;
      if (first || audio.paused) { if (first) audio.currentTime = 0; playMusic(true); }
      return true;
    },
  };

  if (musicOk) {
    // pick the first copy of the song this browser can play
    var srcs = [].concat(cfg.music.src);
    var TYPES = { m4a: 'audio/mp4; codecs="mp4a.40.2"', mp4: 'audio/mp4', aac: 'audio/aac', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav' };
    audio.src = srcs.filter(function (s) {
      var t = TYPES[(String(s).split('.').pop() || '').toLowerCase()];
      return !t || (audio.canPlayType && audio.canPlayType(t) !== '');
    })[0] || srcs[0];
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
      document.body.classList.add('preview');
    }
    startPetals();   // petals drift over the countdown/lock screen too
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
    // The skip button shows only while allowSkip is on and the skipUntil moment hasn't passed.
    var skip = $('#cd-skip');
    var skipEnd = parseLocal(cfg.skipUntil);
    function skipAllowed() { return cfg.allowSkip !== false && (!skipEnd || Date.now() < skipEnd.getTime()); }
    skip.hidden = !skipAllowed();
    skip.addEventListener('click', function () { if (skipAllowed()) finish(); });
    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff <= 0) { finish(); return; }
      if (!skip.hidden && !skipAllowed()) skip.hidden = true;   // switches off live at skipUntil
      d.textContent = pad(Math.floor(diff / 864e5));
      h.textContent = pad(Math.floor(diff / 36e5) % 24);
      m.textContent = pad(Math.floor(diff / 6e4) % 60);
      s.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- the lock screen's date picker (Day / Month / Year) ---------- */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function setupDatePicker(lock) {
    $('#gate-answer').hidden = true;
    $('#gate-date').hidden = false;
    $('#gate-question').setAttribute('for', 'gate-day');
    var day = $('#gate-day'), month = $('#gate-month'), year = $('#gate-year');
    function opt(sel, value, text) { var o = document.createElement('option'); o.value = value; o.textContent = text; sel.appendChild(o); }
    opt(day, '', 'Day');
    for (var d = 1; d <= 31; d++) opt(day, String(d), String(d));
    opt(month, '', 'Month');
    MONTHS.forEach(function (m, i) { opt(month, String(i + 1), m); });
    opt(year, '', 'Year');
    var years = lock.years && lock.years.length ? lock.years : [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()];
    years.forEach(function (y) { opt(year, String(y), String(y)); });
    [day, month, year].forEach(function (sel) {
      sel.addEventListener('change', function () {
        sel.classList.toggle('chosen', !!sel.value);
        $('#gate-msg').textContent = '';
      });
    });
  }
  function pickedDate() {
    var d = $('#gate-day').value, m = $('#gate-month').value, y = $('#gate-year').value;
    if (!d || !m || !y) return '';
    return y + '-' + pad(m) + '-' + pad(d);
  }

  function showGate() {
    var lock = cfg.lock || {};
    var dateMode = lock.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(lock.answer || '');
    var useQuiz = lock.enabled !== false && lock.question && (dateMode || (lock.answers && lock.answers.length));
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
      if (dateMode) setupDatePicker(lock);
      else setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 700);
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
        var ok, special = '';
        if (dateMode) {
          var picked = pickedDate();
          if (!picked) {
            msg.textContent = 'Pick a day, a month and a year 💕';
            return;
          }
          special = (lock.nearMisses || {})[picked] || '';
          ok = !special && (picked === lock.answer ||
               (lock.anyYear && picked.slice(5) === lock.answer.slice(5) && picked > lock.answer));
          if (!ok) {
            if (!special && picked.slice(5) === lock.answer.slice(5)) special = 'Right day, wrong year 😄 Try once more!';
            else if (!special && picked.slice(0, 7) === lock.answer.slice(0, 7)) special = 'Right month! Now the exact day… 💭';
          }
        } else {
          var given = normalize(input.value);
          ok = given && lock.answers.some(function (a) {
            var ans = normalize(a);
            return ans && (given === ans || (ans.length >= 3 && given.indexOf(ans) !== -1));
          });
        }
        if (!ok) {
          tries++;
          msg.textContent = special || wrongLines[(tries - 1) % wrongLines.length];
          form.classList.remove('shake');
          void form.offsetWidth;   // restart animation
          form.classList.add('shake');
          if (lock.hint && tries >= 1) hintBtn.hidden = false;
          if (!dateMode) input.select();
          return;
        }
      }
      // Success. Start music inside the tap itself (phones require this).
      if (songHidden) primeMusic();   // silently "unlock" audio now, so the reveal can play it later
      else playMusic(true);
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
      if (musicOk && !songHidden) musicBtn.hidden = false;
      celebrate(2600);
      startScrollProgress();
      startTapHearts();
      try { document.dispatchEvent(new CustomEvent('site:unlocked')); } catch (e) { /* very old browser */ }
    }, 750);
  }

  /* =====================================================================
     Build the page from config.js
     ===================================================================== */
  function buildHero() {
    var hero = cfg.hero || {};
    var name = cfg.herName || 'My Love';
    document.title = 'Happy Birthday, ' + name + ' ❤';
    $('#hero-greeting').textContent = AGE ? 'Happy ' + ordinal(AGE) + ' Birthday' : 'Happy Birthday';
    $('#hero-name').textContent = name;
    $('#hero-msg').textContent = hero.message || '';
    var slot = $('#hero-photo');
    if (hero.photo) {
      var box = photoBox(hero.photo, 'Us', null, null, null, { focus: hero.photoFocus, zoom: hero.photoZoom });
      box.classList.add('hero-photo');
      box.id = 'hero-photo';
      slot.replaceWith(box);
    } else {
      $('.hero-ring').remove();
    }
    addSparkles($('#hero'), 7);
    $('#footer-title').textContent = 'Happy ' + (AGE ? ordinal(AGE) + ' ' : '') + 'Birthday, ' + name;
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
      if (item.photo) card.appendChild(photoBox(item.photo, item.title, null, null, null, { focus: item.photoFocus, zoom: item.photoZoom }));
      var body = el('div', 't-body');
      if (item.date) body.appendChild(el('p', 't-date', item.date));
      if (item.title) body.appendChild(el('h3', null, item.title));
      if (item.text) body.appendChild(el('p', null, item.text));
      card.appendChild(body);
      art.appendChild(card);
      wrap.appendChild(art);
    });
  }

  /* ---------- our dates: a little scrapbook ---------- */
  function buildDates() {
    var list = cfg.dates || [];
    if (!list.length) { $('#dates').remove(); return; }
    var grid = $('#dates-grid'), tally = $('#date-tally');
    var cells = list.length + (cfg.nextDate ? 1 : 0);
    // pick a layout where every row is full; the "next date" ticket only spans a whole row when it must
    var nextWide = !(cells % 3 === 0 || cells % 2 === 0);
    grid.classList.add(cells % 3 === 0 && cells > 2 ? 'three-up' : 'two-up');
    var counts = {}, order = [];
    list.forEach(function (d) {
      var c = d.category || 'Date';
      if (!counts[c]) { counts[c] = { n: 0, emoji: d.emoji || '💕' }; order.push(c); }
      counts[c].n++;
    });
    order.forEach(function (c) {
      tally.appendChild(el('span', 'tally-chip', counts[c].emoji + ' ' + c + (counts[c].n > 1 ? ' × ' + counts[c].n : '')));
    });
    tally.appendChild(el('span', 'tally-chip soon', '✨ More to come'));
    list.forEach(function (d, i) {
      var card = el('article', 'date-card reveal' + (d.first ? ' first' : ''));
      var pic = el('div', 'date-photo');
      var shots = (d.photos && d.photos.length ? d.photos : [d.photo]).map(function (p) {
        return typeof p === 'string' || !p ? { src: p, focus: d.photoFocus, zoom: d.photoZoom } : p;
      });
      var main = photoBox(shots[0].src, d.title, null, null, null, { focus: shots[0].focus, zoom: shots[0].zoom });
      pic.appendChild(main);
      var stamp = el('span', 'date-stamp', d.emoji || '💕');
      stamp.setAttribute('aria-hidden', 'true');
      pic.appendChild(stamp);
      var body = el('div', 'date-body');
      if (shots.length > 1) {           // a little strip of photos she can tap through
        var strip = el('div', 'date-thumbs');
        strip.setAttribute('role', 'group');
        strip.setAttribute('aria-label', 'Photos from this date');
        shots.forEach(function (sh, k) {
          var t = el('button', 'date-thumb' + (k === 0 ? ' active' : ''));
          t.type = 'button';
          t.setAttribute('aria-label', 'Show photo ' + (k + 1) + ' of ' + shots.length);
          var ti = new Image();
          ti.alt = '';
          ti.loading = 'lazy';
          ti.src = sh.src;
          if (sh.focus) ti.style.objectPosition = sh.focus;
          t.appendChild(ti);
          t.addEventListener('click', function () {
            var fresh = photoBox(sh.src, d.title, 'swap-in', null, null, { focus: sh.focus, zoom: sh.zoom });
            pic.replaceChild(fresh, main);
            main = fresh;
            strip.querySelectorAll('.date-thumb').forEach(function (x) { x.classList.toggle('active', x === t); });
          });
          strip.appendChild(t);
        });
        body.appendChild(strip);
      }
      body.appendChild(el('p', 'date-no', 'Date No. ' + String(i + 1).padStart(2, '0')));
      body.appendChild(el('h3', 'date-title', d.title || 'A date'));
      var meta = el('p', 'date-meta');
      if (d.date) meta.appendChild(el('span', null, d.date));
      if (d.category) meta.appendChild(el('span', 'date-cat', (d.emoji ? d.emoji + ' ' : '') + d.category));
      body.appendChild(meta);
      if (d.place) body.appendChild(el('p', 'date-place', '📍 ' + d.place));
      if (d.first) body.appendChild(el('p', 'date-badge', 'Our first date 💕'));
      if (d.note) body.appendChild(el('p', 'date-note', d.note));
      card.appendChild(pic);
      card.appendChild(body);
      grid.appendChild(card);
    });
    if (cfg.nextDate) {
      var next = el('article', 'date-card next reveal' + (nextWide ? ' wide' : ''));
      next.appendChild(el('span', 'date-next-icon', '🎟️'));
      next.appendChild(el('p', 'date-next-text', String(cfg.nextDate).replace('{next}', String(list.length + 1).padStart(2, '0'))));
      grid.appendChild(next);
    }
  }

  /* ---------- chapter numbers follow the order of the sections ---------- */
  function numberChapters() {
    var words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
    var k = 0;
    document.querySelectorAll('main .chapter .section-head .kicker').forEach(function (kick) {
      if (!/^Chapter/.test(kick.textContent.trim())) return;
      kick.textContent = 'Chapter ' + (words[k] || String(k + 1));
      k++;
    });
  }

  /* ---------- gallery + lightbox ---------- */
  var gallery = [];   // { src, caption, ok }
  var lbIndex = 0;

  function buildGallery() {
    var list = cfg.gallery || [];
    var grid = $('#gallery-grid');
    if (!list.length) { $('#gallery').remove(); return; }
    if (list.length % 2 === 1) grid.classList.add('odd');
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
        function () { entry.ok = false; btn.classList.add('is-empty-photo'); },
        { focus: item.focus, zoom: item.zoom }
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
      // if she hasn't found the song in Scratch & See yet, it starts with the letter
      if (window.BirthdaySong && !window.BirthdaySong.revealed()) window.BirthdaySong.reveal();
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

  /* ---------- small helpers for things her phone remembers ---------- */
  function readList(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function saveList(key, arr) {
    if (PREVIEW) return;   // previews don't leave traces on the owner's phone
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) { /* storage blocked */ }
  }
  function burstAt(elm, opts) {
    var r = elm.getBoundingClientRect();
    burst(Object.assign({ particleCount: 14, spread: 55, startVelocity: 14,
      origin: { x: (r.left + r.width / 2) / innerWidth, y: Math.max(0, r.top) / innerHeight } }, opts || {}));
  }

  /* ---------- "how well do you know us?" quiz ---------- */
  function buildQuiz() {
    var Q = cfg.quiz || {};
    var qs = (Q.questions || []).filter(function (q) { return q && q.question && q.options && q.options.length; });
    if (!qs.length) { $('#quiz').remove(); return; }
    var dots = $('#quiz-dots'), count = $('#quiz-count'), qEl = $('#quiz-q'), opts = $('#quiz-options'),
        note = $('#quiz-note'), next = $('#quiz-next'), stage = $('#quiz-stage'), result = $('#quiz-result');
    var i = 0, score = 0;
    function pick(arr, fallback) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : fallback; }

    function drawDots() {
      dots.textContent = '';
      qs.forEach(function (_, k) { dots.appendChild(el('span', k < i ? 'done' : (k === i ? 'now' : ''))); });
    }
    function show() {
      var q = qs[i];
      drawDots();
      count.textContent = 'Question ' + (i + 1) + ' of ' + qs.length;
      qEl.textContent = q.question;
      note.textContent = '';
      next.hidden = true;
      opts.textContent = '';
      q.options.forEach(function (text, k) {
        var b = el('button', 'quiz-opt', text);
        b.type = 'button';
        b.addEventListener('click', function () { answer(k, b); });
        opts.appendChild(b);
      });
      stage.classList.remove('fade-in'); void stage.offsetWidth; stage.classList.add('fade-in');
    }
    function answer(k, btn) {
      var q = qs[i], buttons = opts.querySelectorAll('.quiz-opt');
      buttons.forEach(function (b) { b.disabled = true; });
      if (k === q.answer) {
        score++;
        btn.classList.add('right');
        note.textContent = pick(Q.right, 'Correct! ❤');
        burstAt(btn);
      } else {
        btn.classList.add('wrong');
        if (buttons[q.answer]) buttons[q.answer].classList.add('right');
        note.textContent = pick(Q.wrong, 'Not quite!');
      }
      next.textContent = i < qs.length - 1 ? 'Next question →' : 'See my score ❤';
      next.hidden = false;
    }
    next.addEventListener('click', function () {
      i++;
      if (i < qs.length) { show(); return; }
      drawDots();
      stage.hidden = true;
      result.hidden = false;
      var R = Q.results || {};
      $('#quiz-score').textContent = score + ' / ' + qs.length;
      $('#quiz-result-msg').textContent = score === qs.length ? (R.perfect || 'Perfect score!')
        : score >= Math.ceil(qs.length / 2) ? (R.good || 'So close!') : (R.low || 'We need more dates to study!');
      if (score === qs.length) celebrate(1800); else burstAt($('#quiz-score'));
    });
    $('#quiz-again').addEventListener('click', function () {
      i = 0; score = 0;
      result.hidden = true;
      stage.hidden = false;
      show();
    });
    show();
  }

  /* ---------- love coupons ---------- */
  /* ---------- printable coupon picture (drawn on a canvas, 8 × 4 inches at 300 dpi) ---------- */
  function heartPath(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * 0.35);
    g.bezierCurveTo(x - s * 0.62, y - s * 0.02, x - s * 0.36, y - s * 0.58, x, y - s * 0.2);
    g.bezierCurveTo(x + s * 0.36, y - s * 0.58, x + s * 0.62, y - s * 0.02, x, y + s * 0.35);
    g.closePath();
  }
  function wrapLines(g, text, maxW) {
    var words = String(text || '').split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }
  function drawCoupon(c, k, when) {
    var W = 2400, H = 1200, STUB = 620, R = 70, N = 64, SX = W - STUB;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d');
    var serif = '"Playfair Display", Georgia, serif', sans = 'Poppins, "Segoe UI", Arial, sans-serif', script = '"Dancing Script", "Brush Script MT", cursive';
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, H);
    // ticket shape with two notches at the tear line
    function ticket() {
      g.beginPath();
      g.moveTo(R, 0); g.lineTo(SX - N, 0); g.arc(SX, 0, N, Math.PI, 0, true); g.lineTo(W - R, 0);
      g.quadraticCurveTo(W, 0, W, R); g.lineTo(W, H - R); g.quadraticCurveTo(W, H, W - R, H);
      g.lineTo(SX + N, H); g.arc(SX, H, N, 0, Math.PI, true); g.lineTo(R, H);
      g.quadraticCurveTo(0, H, 0, H - R); g.lineTo(0, R); g.quadraticCurveTo(0, 0, R, 0); g.closePath();
    }
    ticket();
    g.save();
    g.clip();
    var bg = g.createLinearGradient(0, 0, SX, H);
    bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(0.55, '#FFF1F7'); bg.addColorStop(1, '#F4EAFF');
    g.fillStyle = bg; g.fillRect(0, 0, SX, H);
    var st = g.createLinearGradient(SX, 0, W, H);
    st.addColorStop(0, '#FF94BE'); st.addColorStop(0.6, '#E0457B'); st.addColorStop(1, '#A3367A');
    g.fillStyle = st; g.fillRect(SX, 0, STUB, H);
    // soft hearts in the background
    [[1500, 170, 54], [1650, 1020, 70], [880, 120, 40], [760, 650, 46]].forEach(function (h) {
      heartPath(g, h[0], h[1], h[2]); g.fillStyle = 'rgba(224, 69, 123, .08)'; g.fill();
    });
    g.restore();
    // borders
    ticket();
    g.setLineDash([]); g.lineWidth = 10; g.strokeStyle = '#D4AF37'; g.stroke();
    g.save(); g.setLineDash([22, 16]); g.lineWidth = 4; g.strokeStyle = 'rgba(224, 69, 123, .45)';
    g.strokeRect(60, 60, SX - 140, H - 120); g.restore();
    g.save(); g.setLineDash([26, 20]); g.lineWidth = 6; g.strokeStyle = 'rgba(255, 255, 255, .9)';
    g.beginPath(); g.moveTo(SX, N + 30); g.lineTo(SX, H - N - 30); g.stroke(); g.restore();
    // main text
    var x = 140, maxW = SX - 300;
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.fillStyle = '#B8901C'; g.font = '500 46px ' + sans;
    g.fillText('LOVE COUPON  ·  NO. ' + String(k + 1).padStart(2, '0'), x, 210);
    g.fillStyle = '#7A1F3D'; g.font = '700 124px ' + serif;
    var tl = wrapLines(g, c.title || 'A little something', maxW).slice(0, 2), y = 350;
    if (tl.length > 1) { g.font = '700 100px ' + serif; tl = wrapLines(g, c.title, maxW).slice(0, 2); }
    tl.forEach(function (l) { g.fillText(l, x, y); y += tl.length > 1 ? 112 : 130; });
    g.fillStyle = '#5E4350'; g.font = '400 56px ' + sans;
    wrapLines(g, c.text, maxW).slice(0, 3).forEach(function (l) { g.fillText(l, x, y + 20); y += 76; });
    g.fillStyle = '#E0457B'; g.font = '700 84px ' + script;
    g.fillText('For ' + (cfg.herName || 'you') + '   ·   From ' + (cfg.yourName || 'me'), x, H - 200);
    g.fillStyle = '#8A6A73'; g.font = '400 40px ' + sans;
    g.fillText('Redeemed on ' + when + '   ·   Valid forever   ·   No expiry date on love', x, H - 120);
    // stub: a big heart
    var hx = SX + STUB / 2;
    heartPath(g, hx, 470, 300); g.fillStyle = 'rgba(255, 255, 255, .95)'; g.fill();
    g.fillStyle = '#E0457B'; g.font = '700 64px ' + serif; g.textAlign = 'center';
    g.fillText(String(k + 1).padStart(2, '0'), hx, 500);
    g.fillStyle = '#ffffff'; g.font = '700 76px ' + script;
    g.fillText('Valid', hx, 790); g.fillText('forever', hx, 880);
    g.font = '500 34px ' + sans; g.fillText('Admit one cuddle', hx, 1000);
    // "Redeemed" stamp
    g.save();
    g.translate(SX - 430, 700); g.rotate(-0.24);
    g.globalAlpha = 0.85; g.strokeStyle = '#C2306B'; g.fillStyle = '#C2306B';
    g.font = '700 72px ' + serif; g.textAlign = 'left'; g.textBaseline = 'middle';
    var tw = g.measureText('REDEEMED').width, bw = tw + 150, left = -bw / 2;
    g.lineWidth = 8; g.strokeRect(left - 30, -86, bw + 60, 172);
    g.lineWidth = 3; g.strokeRect(left - 12, -68, bw + 24, 136);
    g.fillText('REDEEMED', left + 20, 6);
    heartPath(g, left + 20 + tw + 62, 6, 56); g.fill();
    g.restore();
    return cv;
  }
  function slug(t) { return String(t || 'coupon').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'coupon'; }
  function downloadCoupon(c, k, when) {
    try {
      var url = drawCoupon(c, k, when).toDataURL('image/png');
      var a = document.createElement('a');
      a.href = url;
      a.download = 'love-coupon-' + String(k + 1).padStart(2, '0') + '-' + slug(c.title) + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    } catch (e) { return false; }
  }
  var toastEl = null, toastTimer = 0;
  function toast(text) {
    if (!toastEl) {
      toastEl = el('div', 'hunt-toast');
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3600);
  }

  function buildCoupons() {
    var list = cfg.coupons || [];
    if (!list.length) { $('#coupons').remove(); return; }
    var me = cfg.yourName || 'me';
    $('#coupons-sub').textContent = 'Yours to use whenever you like. Tap Redeem and your coupon is saved as a picture: print it and hand it to ' + me + '. ❤';
    var used = readList('bday-coupons');
    var dates = {};
    try { dates = JSON.parse(localStorage.getItem('bday-coupon-dates') || '{}') || {}; } catch (e) { dates = {}; }
    function today() { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    var grid = $('#coupons-grid');
    list.forEach(function (c, k) {
      var wrap = el('div', 'coupon-wrap reveal');
      var card = el('article', 'coupon');
      var main = el('div', 'coupon-main');
      main.appendChild(el('p', 'coupon-label', 'Love coupon · ' + String(k + 1).padStart(2, '0')));
      main.appendChild(el('h3', 'coupon-title', c.title || 'A little something'));
      if (c.text) main.appendChild(el('p', 'coupon-text', c.text));
      var stub = el('div', 'coupon-stub');
      var btn = el('button', 'coupon-btn', 'Redeem');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Redeem: ' + (c.title || 'coupon'));
      stub.appendChild(btn);
      var stamp = el('span', 'coupon-stamp', 'Redeemed ❤');
      stamp.setAttribute('aria-hidden', 'true');
      card.appendChild(main);
      card.appendChild(stub);
      card.appendChild(stamp);
      wrap.appendChild(card);
      grid.appendChild(wrap);

      function markUsed(animate) {
        card.classList.add('redeemed');
        if (animate) card.classList.add('just-redeemed');
        btn.textContent = 'Save';
        btn.classList.add('save-again');
        btn.setAttribute('aria-label', 'Download the ' + (c.title || 'coupon') + ' coupon again');
      }
      if (used.indexOf(k) !== -1) markUsed(false);
      btn.addEventListener('click', function () {
        var first = used.indexOf(k) === -1;
        if (first) {
          used.push(k);
          saveList('bday-coupons', used);
          dates[k] = today();
          if (!PREVIEW) { try { localStorage.setItem('bday-coupon-dates', JSON.stringify(dates)); } catch (e) { /* storage blocked */ } }
          markUsed(true);
          burstAt(card);
        }
        var ok = downloadCoupon(c, k, dates[k] || today());
        toast(ok ? 'Coupon saved to your downloads 💌 Print it and hand it to ' + me + '!' : 'Couldn’t save the picture on this browser. Take a screenshot instead 💌');
      });
    });
  }

  /* ---------- "open when…" letters ---------- */
  function buildOpenWhen() {
    var list = cfg.openWhen || [];
    if (!list.length) { $('#open-when').remove(); return; }
    var grid = $('#ow-grid'), modal = $('#ow-modal'), body = $('#ow-body'), title = $('#ow-modal-title');
    var opened = readList('bday-open-when');
    var lastBtn = null;
    $('#ow-sign').textContent = 'Always yours, ' + (cfg.yourName || 'me');

    list.forEach(function (item, k) {
      var b = el('button', 'ow-card reveal');
      b.type = 'button';
      var env = el('span', 'ow-env');
      env.setAttribute('aria-hidden', 'true');
      env.appendChild(el('span', 'ow-flap'));
      env.appendChild(el('span', 'ow-seal', '❤'));
      var label = el('span', 'ow-label');
      label.appendChild(el('small', null, 'Open when'));
      label.appendChild(el('span', 'ow-what', item.when));
      b.appendChild(env);
      b.appendChild(label);
      b.appendChild(el('span', 'ow-state', 'opened'));
      if (opened.indexOf(k) !== -1) b.classList.add('opened');
      b.addEventListener('click', function () { openLetter(k, b); });
      grid.appendChild(b);
    });

    function openLetter(k, btn) {
      var item = list[k];
      lastBtn = btn;
      title.textContent = item.when;
      body.textContent = '';
      [].concat(item.message || []).forEach(function (p) { body.appendChild(el('p', null, p)); });
      modal.hidden = false;
      modal.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      try { $('#ow-close').focus({ preventScroll: true }); } catch (e) { $('#ow-close').focus(); }
      if (!btn.classList.contains('opened')) {
        btn.classList.add('opened');
        opened.push(k);
        saveList('bday-open-when', opened);
      }
    }
    function closeLetter() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.style.overflow = '';
      if (lastBtn) { try { lastBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    $('#ow-close').addEventListener('click', closeLetter);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeLetter(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLetter(); });
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
  buildDates();
  buildGallery();
  buildReasons();
  buildQuiz();
  buildWish();
  buildCoupons();
  buildOpenWhen();
  buildLetter();
  buildSurprise();
  if (window.Nicknames) {       // Beluga, Kaju Katli and Little Donkey live in nicknames.js
    try {
      window.Nicknames.init({ cfg: cfg, el: el, $: $, reduced: REDUCED, burstAt: burstAt, celebrate: celebrate });
    } catch (e) { if (window.console) console.error('Nicknames failed to load:', e); }
  } else { var ns = $('#names'); if (ns) ns.remove(); }
  numberChapters();
  if (window.Bears) {           // cute animated teddy bears live in bears.js
    try { window.Bears.decorate(); } catch (e) { if (window.console) console.error('Bears failed to load:', e); }
  }
  if (window.BirthdayGames) {   // mini games live in games.js
    try {
      window.BirthdayGames.init({ cfg: cfg, el: el, $: $, reduced: REDUCED, preview: PREVIEW,
        burst: burst, burstAt: burstAt, celebrate: celebrate, readList: readList, saveList: saveList });
    } catch (e) { if (window.console) console.error('Games failed to load:', e); }
  }
  setupReveal();
  start();
})();
