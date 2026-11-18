/* =====================================================================
   "Little Names I Call You": Beluga, Kaju Katli and Little Donkey
   ---------------------------------------------------------------------
   Original characters drawn in SVG. All words live in config.js under
   "nicknames". {her} becomes her name and {me} yours.
   ===================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function n(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function svgRoot(vb, cls) { return n('svg', { viewBox: vb, class: cls, 'aria-hidden': 'true', focusable: 'false' }); }
  function linear(defs, id, stops, vertical) {
    var g = n('linearGradient', vertical ? { id: id, x1: '0', y1: '0', x2: '0', y2: '1' } : { id: id, x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    stops.forEach(function (s) { n('stop', { offset: s[0], 'stop-color': s[1] }, g); });
    return 'url(#' + id + ')';
  }

  /* ---------- Beluga (faces right) ---------- */
  function drawBeluga() {
    var id = 'bel' + (++uid);
    var s = svgRoot('0 0 170 110', 'beluga');
    var defs = n('defs', {}, s);
    var skin = linear(defs, id + 's', [['0', '#FFFFFF'], ['.6', '#E6EEF7'], ['1', '#C9D8E8']], true);
    var all = n('g', { class: 'bel-all' }, s);
    var tail = n('g', { class: 'bel-tail' }, all);
    var line = { stroke: '#AFC2D6', 'stroke-width': '1.4', 'stroke-linejoin': 'round' };
    function withLine(a) { for (var k in line) a[k] = line[k]; return a; }
    n('path', withLine({ d: 'M46 50 Q30 54 18 55 Q30 60 48 67 Z', fill: skin }), tail);
    n('path', withLine({ d: 'M21 55 Q8 41 3 30 Q18 34 27 51 Z', fill: skin }), tail);
    n('path', withLine({ d: 'M21 57 Q8 70 3 81 Q18 77 27 61 Z', fill: skin }), tail);
    n('path', withLine({ d: 'M44 50 C60 36 92 30 110 28 C132 22 152 34 150 50 C157 54 157 62 148 66 C140 74 120 80 96 80 C76 80 58 74 44 66 Z', fill: skin }), all);
    n('ellipse', { cx: 96, cy: 67, rx: 34, ry: 9, fill: '#fff', opacity: '.7' }, all);
    n('ellipse', { cx: 118, cy: 34, rx: 10, ry: 4, fill: '#fff', opacity: '.9', transform: 'rotate(-14 118 34)' }, all);
    var fin = n('g', { class: 'bel-fin' }, all);
    n('ellipse', withLine({ cx: 104, cy: 75, rx: 11, ry: 5, fill: skin, transform: 'rotate(28 104 75)' }), fin);
    n('ellipse', { cx: 127, cy: 57, rx: 6, ry: 3.2, fill: '#FF9EC0', opacity: '.55' }, all);
    var eye = n('g', { class: 'bel-eye' }, all);
    n('circle', { cx: 128, cy: 46, r: 4, fill: '#2E3A4F' }, eye);
    n('circle', { cx: 129.4, cy: 44.6, r: 1.3, fill: '#fff' }, eye);
    n('path', { d: 'M136 61 Q143 66 150 60', fill: 'none', stroke: '#2E3A4F', 'stroke-width': '1.7', 'stroke-linecap': 'round' }, all);
    return s;
  }

  /* ---------- Kaju katli (a smiling diamond with silver varak) ---------- */
  function drawKatli() {
    var id = 'kk' + (++uid);
    var s = svgRoot('0 0 100 84', 'katli');
    var defs = n('defs', {}, s);
    var top = linear(defs, id + 't', [['0', '#FBF4E6'], ['1', '#EAD6B0']]);
    var side = linear(defs, id + 'd', [['0', '#E4CB9C'], ['1', '#C9A877']], true);
    var silver = linear(defs, id + 'v', [['0', '#FFFFFF'], ['.5', '#D9DEE6'], ['1', '#F3F5F8']]);
    var mask = n('mask', { id: id + 'm' }, defs);
    n('rect', { x: 0, y: 0, width: 100, height: 84, fill: '#fff' }, mask);
    var BITES = [[88, 32, 14], [95, 46, 12], [79, 42, 9]];
    var bites = BITES.map(function (b) {
      return n('circle', { cx: b[0], cy: b[1], r: 0, fill: '#000', class: 'bite' }, mask);
    });
    var piece = n('g', { mask: 'url(#' + id + 'm)', class: 'katli-piece' }, s);
    n('polygon', { points: '6,36 50,64 94,36 94,46 50,74 6,46', fill: side }, piece);
    n('polygon', { points: '50,8 94,36 50,64 6,36', fill: top }, piece);
    n('polygon', { points: '50,10 91,36 50,62 9,36', fill: silver, opacity: '.72' }, piece);
    [['M30 30 L36 27', 1], ['M58 18 L64 21', 1], ['M64 46 L70 43', 1], ['M40 48 L45 51', 1]].forEach(function (c) {
      n('path', { d: c[0], stroke: '#fff', 'stroke-width': '1.4', 'stroke-linecap': 'round', opacity: '.9' }, piece);
    });
    n('ellipse', { cx: 36, cy: 41, rx: 4, ry: 2.2, fill: '#FF9EC0', opacity: '.5' }, piece);
    n('ellipse', { cx: 64, cy: 41, rx: 4, ry: 2.2, fill: '#FF9EC0', opacity: '.5' }, piece);
    var eyes = n('g', { class: 'katli-eyes' }, piece);
    n('circle', { cx: 41, cy: 34, r: 2.6, fill: '#5B4636' }, eyes);
    n('circle', { cx: 59, cy: 34, r: 2.6, fill: '#5B4636' }, eyes);
    n('circle', { cx: 41.9, cy: 33.1, r: .9, fill: '#fff' }, eyes);
    n('circle', { cx: 59.9, cy: 33.1, r: .9, fill: '#fff' }, eyes);
    n('path', { d: 'M45 40 Q50 44.5 55 40', fill: 'none', stroke: '#5B4636', 'stroke-width': '1.5', 'stroke-linecap': 'round', class: 'katli-mouth' }, piece);
    s._bite = function () { bites.forEach(function (c, i) { c.setAttribute('r', BITES[i][2]); }); };
    return s;
  }

  /* ---------- Little donkey (playful, never rude) ---------- */
  function drawDonkey() {
    var id = 'dk' + (++uid);
    var s = svgRoot('0 0 130 142', 'donkey');
    var defs = n('defs', {}, s);
    var fur = linear(defs, id + 'f', [['0', '#CFC9DA'], ['.7', '#B6AFC4'], ['1', '#9E97AF']], true);
    var all = n('g', { class: 'dk-all' }, s);
    n('ellipse', { cx: 65, cy: 130, rx: 42, ry: 20, fill: fur }, all);
    n('path', { d: 'M45 112 Q47 86 65 82 Q83 86 85 112 Z', fill: fur }, all);
    n('path', { d: 'M40 104 Q65 118 90 104 L90 113 Q65 127 40 113 Z', fill: '#E0457B' }, all);
    n('path', { d: 'M74 112 L84 134 L72 131 L67 114 Z', fill: '#C2306B' }, all);
    var earL = n('g', { class: 'dk-ear-l' }, all), earR = n('g', { class: 'dk-ear-r' }, all);
    n('ellipse', { cx: 42, cy: 27, rx: 9.5, ry: 25, fill: fur, transform: 'rotate(-20 42 27)' }, earL);
    n('ellipse', { cx: 42, cy: 29, rx: 4.6, ry: 17, fill: '#F6B8CF', transform: 'rotate(-20 42 29)' }, earL);
    n('ellipse', { cx: 88, cy: 27, rx: 9.5, ry: 25, fill: fur, transform: 'rotate(20 88 27)' }, earR);
    n('ellipse', { cx: 88, cy: 29, rx: 4.6, ry: 17, fill: '#F6B8CF', transform: 'rotate(20 88 29)' }, earR);
    var head = n('g', { class: 'dk-head' }, all);
    n('ellipse', { cx: 65, cy: 60, rx: 30, ry: 32, fill: fur }, head);
    n('path', { d: 'M54 31 Q58 18 63 28 Q67 15 71 28 Q76 20 77 33 Q66 30 54 34 Z', fill: '#6F6680' }, head);
    n('ellipse', { cx: 65, cy: 80, rx: 24, ry: 17, fill: '#EDE6E0' }, head);
    n('ellipse', { cx: 57, cy: 81, rx: 2.6, ry: 3.6, fill: '#7C7290', opacity: '.75' }, head);
    n('ellipse', { cx: 73, cy: 81, rx: 2.6, ry: 3.6, fill: '#7C7290', opacity: '.75' }, head);
    n('path', { d: 'M58 89 Q65 94 72 89', fill: 'none', stroke: '#5A5068', 'stroke-width': '1.8', 'stroke-linecap': 'round' }, head);
    n('ellipse', { cx: 46, cy: 69, rx: 6, ry: 3.5, fill: '#FF9EC0', opacity: '.55' }, head);
    n('ellipse', { cx: 84, cy: 69, rx: 6, ry: 3.5, fill: '#FF9EC0', opacity: '.55' }, head);
    var eyes = n('g', { class: 'dk-eyes' }, head);
    [53, 77].forEach(function (x) {
      n('circle', { cx: x, cy: 55, r: 5.2, fill: '#2F2A3A' }, eyes);
      n('circle', { cx: x + 1.8, cy: 53.2, r: 1.7, fill: '#fff' }, eyes);
    });
    var flower = n('g', { class: 'dk-flower' }, head);
    [[0, -6], [6, -2], [4, 5], [-4, 5], [-6, -2]].forEach(function (p) {
      n('circle', { cx: 92 + p[0], cy: 42 + p[1], r: 4.2, fill: '#FFC2DA' }, flower);
    });
    n('circle', { cx: 92, cy: 42, r: 3.4, fill: '#F1D78A' }, flower);
    return s;
  }

  /* =================================================================
     Little sounds, made in the browser (no audio files needed)
     ================================================================= */
  var Sound = (function () {
    var ac = null, on = true;
    function ctx() {
      if (!on) return null;
      if (!ac) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        // iPhones: play even when the ringer switch is on silent (iOS 17+)
        try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older phones */ }
        try { ac = new C(); } catch (e) { return null; }
      }
      if (ac.state === 'suspended') { try { ac.resume(); } catch (e) { /* ignore */ } }
      return ac;
    }
    // one soft note that slides from f0 to f1
    function note(a, o) {
      var t = a.currentTime + (o.at || 0), d = o.dur || 0.2;
      var osc = a.createOscillator(), g = a.createGain(), out = g;
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(o.f0, t);
      osc.frequency.exponentialRampToValueAtTime(o.f1 || o.f0, t + d);
      if (o.vib) {                              // a little wobble, for the donkey
        var lfo = a.createOscillator(), lg = a.createGain();
        lfo.frequency.value = o.vib; lg.gain.value = o.vibDepth || 12;
        lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + d + 0.05);
      }
      if (o.lp) { var f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; osc.connect(f); f.connect(g); }
      else osc.connect(g);
      var peak = o.vol || 0.12;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.03, d / 4));
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      out.connect(a.destination);
      osc.start(t); osc.stop(t + d + 0.05);
    }
    function crunch(a, at, freq) {
      var len = Math.floor(a.sampleRate * 0.07), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
      for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      var src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + at;
      src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.1; g.gain.value = 0.35;
      src.connect(bp); bp.connect(g); g.connect(a.destination); src.start(t);
    }
    return {
      setOn: function (v) { on = v !== false; },
      // belugas are the "canaries of the sea": happy whistles and a few bubbles
      beluga: function () {
        var a = ctx(); if (!a) return;
        note(a, { f0: 1300, f1: 2300, dur: 0.12, vol: 0.08 });
        note(a, { f0: 1500, f1: 2700, dur: 0.12, at: 0.14, vol: 0.08 });
        note(a, { f0: 2400, f1: 1600, dur: 0.18, at: 0.3, vol: 0.07 });
        [0.55, 0.66, 0.8].forEach(function (at, i) { note(a, { f0: 280 + i * 90, f1: 900 + i * 200, dur: 0.06, at: at, vol: 0.09 }); });
      },
      // a crunchy little bite, then a happy "mm!"
      bite: function () {
        var a = ctx(); if (!a) return;
        crunch(a, 0, 2600); crunch(a, 0.09, 1900);
        note(a, { type: 'triangle', f0: 330, f1: 392, dur: 0.22, at: 0.2, vol: 0.07 });
      },
      // a sparkly "ta-da" when the whole box is finished
      yum: function () {
        var a = ctx(); if (!a) return;
        [523, 659, 784, 1047].forEach(function (f, i) { note(a, { type: 'triangle', f0: f, dur: 0.32, at: i * 0.1, vol: 0.08 }); });
      },
      // a cute, soft "hee-haw"
      heehaw: function () {
        var a = ctx(); if (!a) return;
        note(a, { type: 'sawtooth', f0: 600, f1: 760, dur: 0.26, vol: 0.07, vib: 22, vibDepth: 18, lp: 1500 });
        note(a, { type: 'sawtooth', f0: 430, f1: 330, dur: 0.38, at: 0.3, vol: 0.08, vib: 18, vibDepth: 14, lp: 1100 });
      },
    };
  })();

  window.Nicknames = { beluga: drawBeluga, katli: drawKatli, donkey: drawDonkey, init: init, sound: Sound };

  /* =================================================================
     The chapter and the swimming beluga
     ================================================================= */
  function init(ctx) {
    var cfg = ctx.cfg, N = cfg.nicknames || {};
    var el = ctx.el, $ = ctx.$;
    var section = $('#names');
    if (!section) return;
    if (N.enabled === false) { section.remove(); return; }
    function fill(t) { return String(t || '').replace(/\{her\}/g, cfg.herName || 'my love').replace(/\{me\}/g, cfg.yourName || 'me'); }
    function pick(list, last) {
      if (!list || !list.length) return '';
      if (list.length === 1) return 0;
      var i;
      do { i = Math.floor(Math.random() * list.length); } while (i === last);
      return i;
    }
    var B = N.beluga || {}, K = N.sweet || {}, D = N.donkey || {};
    Sound.setOn(N.sound);
    // phones and tablets say "Tap", computers say "Click"
    var TOUCH = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
    var VERB = TOUCH ? 'Tap' : 'Click';
    var SOUND_NOTE = N.sound === false ? '' : (TOUCH ? ' 🔊 volume up!' : ' 🔊');
    function tip(stage, target, text) {        // a little tooltip pill on each character
      var t = el('span', 'tap-tip', text + (N.sound === false ? '' : ' 🔊'));
      t.setAttribute('aria-hidden', 'true');
      stage.appendChild(t);
      if (target) target.setAttribute('title', text + (N.sound === false ? '' : ' (with sound)'));
      return function () { stage.classList.add('tried'); };
    }
    if (N.title) $('#names-title').textContent = N.title;
    var countdownKicker = $('#countdown .kicker');
    if (countdownKicker && B.name) countdownKicker.textContent = 'Patience, my ' + B.name + '…';
    var grid = $('#names-grid');

    function card(cls, stage, title, caption, hint) {
      var c = el('article', 'name-card reveal ' + cls);
      c.appendChild(stage);
      c.appendChild(el('h3', 'name-title', title));
      c.appendChild(el('p', 'name-caption', fill(caption)));
      var h = el('p', 'name-hint', hint);
      c.appendChild(h);
      grid.appendChild(c);
      return { card: c, hint: h };
    }
    function bubble(stage) {
      var b = el('p', 'say');
      b.setAttribute('role', 'status');
      b.setAttribute('aria-live', 'polite');
      stage.appendChild(b);
      var timer = 0;
      return function (text) {
        b.textContent = fill(text);
        b.classList.remove('show');
        void b.offsetWidth;
        b.classList.add('show');
        stage.classList.add('speaking');
        clearTimeout(timer);
        timer = setTimeout(function () { b.classList.remove('show'); stage.classList.remove('speaking'); }, 5200);
      };
    }
    function hearts(stage, x, y, n2, cls) {
      for (var i = 0; i < n2; i++) {
        var h = el('span', cls || 'float-bubble');
        h.style.left = x + '%';
        h.style.top = y + '%';
        h.style.setProperty('--dx', ((Math.random() - 0.5) * 60).toFixed(0) + 'px');
        h.style.animationDelay = (i * 0.12).toFixed(2) + 's';
        h.addEventListener('animationend', function () { this.remove(); });
        stage.appendChild(h);
      }
    }

    /* ----- Beluga card ----- */
    var ocean = el('div', 'name-stage ocean');
    for (var i = 0; i < 7; i++) {
      var bb = el('span', 'sea-bubble');
      bb.style.left = (8 + Math.random() * 84) + '%';
      bb.style.animationDelay = (Math.random() * 6).toFixed(1) + 's';
      bb.style.setProperty('--s', (5 + Math.random() * 8).toFixed(0) + 'px');
      ocean.appendChild(bb);
    }
    var belBtn = el('button', 'beluga-btn');
    belBtn.type = 'button';
    belBtn.setAttribute('aria-label', 'Say hi to ' + (B.name || 'Beluga'));
    belBtn.appendChild(drawBeluga());
    ocean.appendChild(belBtn);
    var belSay = bubble(ocean);
    var belCard = card('name-beluga', ocean, B.name || 'Beluga', B.caption, VERB + ' her to say hi' + SOUND_NOTE);
    var belTried = tip(ocean, belBtn, VERB + ' me to say hi!');
    var lastB = -1;
    belBtn.addEventListener('click', function () {
      Sound.beluga();
      belTried();
      lastB = pick(B.messages, lastB);
      belSay((B.messages || [])[lastB] || 'Blub blub! 💙');
      belBtn.classList.remove('happy');
      void belBtn.offsetWidth;
      belBtn.classList.add('happy');
      var r = belBtn.getBoundingClientRect(), o = ocean.getBoundingClientRect();
      hearts(ocean, ((r.left + r.width * 0.7 - o.left) / o.width) * 100, ((r.top - o.top) / o.height) * 100 + 10, 5, 'heart-bubble');
      belCard.hint.textContent = VERB + ' her again 💙';
    });

    /* ----- Kaju katli card ----- */
    var box = el('div', 'name-stage sweet-box');
    var tray = el('div', 'katli-tray');
    box.appendChild(tray);
    var kSay = bubble(box);
    var kMsgs = (K.messages || []).slice();
    var eaten = 0, total = 9;
    var kCard = card('name-sweet', box, K.name || 'Kaju Katli', K.caption, VERB + ' each piece to take a bite (0 of ' + total + ')' + SOUND_NOTE);
    var kTried = tip(box, null, VERB + ' a piece to take a bite!');
    for (var k = 0; k < total; k++) {
      (function (idx) {
        var b = el('button', 'katli-btn');
        b.type = 'button';
        b.setAttribute('aria-label', 'Take a bite of kaju katli ' + (idx + 1));
        var art = drawKatli();
        b.appendChild(art);
        b.style.animationDelay = (idx * 0.25).toFixed(2) + 's';
        b.setAttribute('title', VERB + ' to take a bite' + (N.sound === false ? '' : ' (with sound)'));
        b.addEventListener('click', function () {
          if (b.classList.contains('bitten')) return;
          kTried();
          b.classList.add('bitten');
          b.setAttribute('aria-label', 'Kaju katli ' + (idx + 1) + ', already tasted');
          art._bite();
          eaten++;
          ctx.burstAt(b, { particleCount: 8, startVelocity: 9, colors: ['#EAD6B0', '#D9DEE6', '#F1D78A', '#FF8DBA'] });
          if (eaten >= total) {
            Sound.bite();
            setTimeout(Sound.yum, 380);
            kSay(K.final || 'Even a whole box of kaju katli isn’t as sweet as you.');
            kCard.hint.textContent = 'You finished the whole box! 🍬';
            ctx.celebrate(1400);
          } else {
            Sound.bite();
            kSay(kMsgs.length ? kMsgs[(eaten - 1) % kMsgs.length] : 'Sweet!');
            kCard.hint.textContent = VERB + ' each piece to take a bite (' + eaten + ' of ' + total + ')';
          }
        });
        tray.appendChild(b);
      })(k);
    }

    /* ----- Donkey card ----- */
    var meadow = el('div', 'name-stage meadow');
    ['m-hill m-hill-1', 'm-hill m-hill-2', 'm-sun'].forEach(function (c) { meadow.appendChild(el('span', c)); });
    for (var f = 0; f < 6; f++) {
      var fl = el('span', 'm-flower');
      fl.style.left = (6 + f * 16 + Math.random() * 6) + '%';
      fl.style.bottom = (4 + Math.random() * 12) + '%';
      meadow.appendChild(fl);
    }
    var dkBtn = el('button', 'donkey-btn');
    dkBtn.type = 'button';
    dkBtn.setAttribute('aria-label', VERB + ' the little donkey');
    dkBtn.appendChild(drawDonkey());
    meadow.appendChild(dkBtn);
    var dkSay = bubble(meadow);
    var dkCard = card('name-donkey', meadow, D.name || 'Little Donkey', D.caption, VERB + ' her for a hee-haw' + SOUND_NOTE);
    var dkTried = tip(meadow, dkBtn, VERB + ' me for a hee-haw!');
    var lastD = -1;
    dkBtn.addEventListener('click', function () {
      Sound.heehaw();
      dkTried();
      lastD = pick(D.messages, lastD);
      dkSay((D.messages || [])[lastD] || 'Hee-haw! 💕');
      dkBtn.classList.remove('hop');
      void dkBtn.offsetWidth;
      dkBtn.classList.add('hop');
      hearts(meadow, 50, 30, 4, 'heart-bubble');
      dkCard.hint.textContent = VERB + ' her again 🫏';
    });

    /* ----- the beluga that swims across the site now and then ----- */
    if (B.swimAcross === false || ctx.reduced) return;
    var buddy = el('button', 'beluga-buddy');
    buddy.type = 'button';
    buddy.setAttribute('aria-label', 'A little beluga swimming by. ' + VERB + ' to say hi.');
    buddy.setAttribute('title', VERB + ' to say hi' + (N.sound === false ? '' : ' (with sound) 🔊'));
    buddy.hidden = true;
    buddy.appendChild(drawBeluga());
    var buddySay = el('span', 'buddy-say');
    buddy.appendChild(buddySay);
    document.body.appendChild(buddy);
    var passes = 0, lastMsg = -1;
    function busy() { return !document.querySelector('#game-modal:not([hidden]), #ow-modal:not([hidden]), #lightbox:not([hidden]), .hunt-intro'); }
    function swim() {
      if (passes >= 5) return;
      if (document.hidden || !busy() || document.body.classList.contains('locked')) { setTimeout(swim, 15000); return; }
      passes++;
      buddy.classList.remove('caught', 'swimming');
      buddySay.textContent = '';
      buddy.style.top = (22 + Math.random() * 46) + 'vh';
      buddy.hidden = false;
      void buddy.offsetWidth;
      buddy.classList.add('swimming');
    }
    buddy.addEventListener('animationend', function (e) {
      if (e.animationName !== 'buddy-swim') return;
      buddy.hidden = true;
      buddy.classList.remove('swimming', 'caught');
      setTimeout(swim, 70000 + Math.random() * 30000);
    });
    buddy.addEventListener('click', function () {
      if (buddy.classList.contains('caught')) return;
      Sound.beluga();
      lastMsg = pick(B.buddyMessages || B.messages, lastMsg);
      buddySay.textContent = fill((B.buddyMessages || B.messages || [])[lastMsg] || 'Blub blub! 💙');
      var br = buddy.getBoundingClientRect();
      buddy.classList.toggle('say-left', br.left < 110);                    // keep the bubble on screen
      buddy.classList.toggle('say-right', br.right > window.innerWidth - 110);
      buddy.classList.add('caught');
      ctx.burstAt(buddy, { particleCount: 12, startVelocity: 12 });
      setTimeout(function () { buddy.classList.remove('caught'); }, 3400);   // then it swims on
    });
    document.addEventListener('site:unlocked', function () { setTimeout(swim, 22000); });
  }
})();
