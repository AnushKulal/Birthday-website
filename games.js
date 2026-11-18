/* =====================================================================
   Romantic mini games
   ---------------------------------------------------------------------
   All the words live in config.js under "games". You shouldn't need to
   edit this file. In config text, {her} becomes her name and {me} yours.
   ===================================================================== */
(function () {
  'use strict';

  window.BirthdayGames = { init: init };

  function init(ctx) {
    var cfg = ctx.cfg, G = cfg.games || {};
    var el = ctx.el, $ = ctx.$;
    var grid = $('#games-grid');
    if (!grid) return;

    function fill(s) {
      return String(s || '').replace(/\{her\}/g, cfg.herName || 'my love').replace(/\{me\}/g, cfg.yourName || 'me');
    }
    function opt(id) { return G[id] || {}; }
    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }

    var GAMES = [
      { id: 'memory', icon: '💞', title: 'Match Our Moments', blurb: 'Flip the cards and find every pair.',
        help: 'Tap two cards to turn them over. Find all the matching pairs.', mount: mountMemory },
      { id: 'catch', icon: '🧺', title: 'Catch My Love', blurb: 'Catch the falling hearts, dodge the broken ones.',
        help: 'Drag (or use the arrow keys) to move the basket. Golden hearts are worth 3. Broken hearts take 2 away.', mount: mountCatch },
      { id: 'scratch', icon: '🎟️', title: 'Scratch & See', blurb: 'Scratch the card to reveal a secret.',
        help: 'Rub the card with your finger (or mouse) until the secret shows.', mount: mountScratch },
      { id: 'stars', icon: '✨', title: 'Connect Our Stars', blurb: 'Join the stars in order and see what they draw.',
        help: 'Tap the stars in order, starting from 1.', mount: mountStars },
      { id: 'balloons', icon: '🎈', title: 'Pop the Balloons', blurb: 'Every balloon hides one word of a message.',
        help: 'Pop the balloons. Each one reveals the next word.', mount: mountBalloons },
      { id: 'meter', icon: '💗', title: 'Love Meter', blurb: 'Hold the heart and measure how much I love you.',
        help: 'Press and hold the heart. Don’t let go!', mount: mountMeter },
      { id: 'hunt', icon: '🔍', title: 'Heart Hunt', blurb: 'Little hearts are hidden all over this page.',
        help: '', mount: mountHuntInfo },
    ].filter(function (g) { return opt(g.id).enabled !== false; });

    if (!GAMES.length) { var sec = $('#games'); if (sec) sec.remove(); return; }

    var won = ctx.readList('bday-games-won');
    function markWon(id) {
      if (won.indexOf(id) === -1) { won.push(id); ctx.saveList('bday-games-won', won); }
      refreshTiles();
    }

    /* ---------- heart hunt state (hearts are placed further down) ---------- */
    var hunt = { total: 0, found: ctx.readList('bday-hunt'), enabled: GAMES.some(function (g) { return g.id === 'hunt'; }) };

    /* ---------- the games menu ---------- */
    var tiles = {};
    GAMES.forEach(function (g) {
      var b = el('button', 'game-tile reveal game-' + g.id);
      b.type = 'button';
      var icon = el('span', 'game-icon', g.icon);
      icon.setAttribute('aria-hidden', 'true');
      var text = el('span', 'game-text');
      text.appendChild(el('span', 'game-name', g.title));
      text.appendChild(el('span', 'game-blurb', g.blurb));
      var status = el('span', 'game-status');
      b.appendChild(icon);
      b.appendChild(text);
      b.appendChild(status);
      b.addEventListener('click', function () { openGame(g, b); });
      grid.appendChild(b);
      tiles[g.id] = { btn: b, status: status };
    });
    function refreshTiles() {
      GAMES.forEach(function (g) {
        var t = tiles[g.id];
        if (!t) return;
        var done = g.id === 'hunt' ? (hunt.total && hunt.found.length >= hunt.total) : won.indexOf(g.id) !== -1;
        t.status.textContent = g.id === 'hunt' ? (hunt.found.length + ' of ' + hunt.total + ' found') : (done ? 'Won ❤' : 'Play');
        t.btn.classList.toggle('won', !!done);
      });
    }

    /* ---------- the game window ---------- */
    var modal = $('#game-modal'), area = $('#game-area'), titleEl = $('#game-title'), helpEl = $('#game-help'),
        winBox = $('#game-win'), winMsg = $('#game-win-msg'), againBtn = $('#game-again');
    var current = null, instance = null, lastTile = null;

    function openGame(g, tile) {
      current = g;
      lastTile = tile || null;
      titleEl.textContent = g.title;
      helpEl.textContent = g.help;
      helpEl.hidden = !g.help;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      startGame();
      try { $('#game-close').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    function startGame() {
      stopGame();
      winBox.hidden = true;
      area.textContent = '';
      modal.querySelector('.game-sheet').scrollTop = 0;
      instance = current.mount(area, { win: win, opts: opt(current.id) }) || null;
    }
    function stopGame() {
      if (instance && instance.destroy) { try { instance.destroy(); } catch (e) { /* ignore */ } }
      instance = null;
    }
    function win(message) {
      if (current.id !== 'hunt') markWon(current.id);
      winMsg.textContent = fill(message);
      againBtn.hidden = current.id === 'hunt';
      winBox.hidden = false;
      ctx.celebrate(1800);
      try { $('#game-done').focus(); } catch (e) { /* ignore */ }
    }
    function closeGame() {
      if (modal.hidden) return;
      stopGame();
      modal.hidden = true;
      area.textContent = '';
      document.body.style.overflow = '';
      if (lastTile) { try { lastTile.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    $('#game-close').addEventListener('click', closeGame);
    $('#game-done').addEventListener('click', closeGame);
    againBtn.addEventListener('click', startGame);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeGame(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGame(); });

    /* =================================================================
       1. Match Our Moments (memory)
       ================================================================= */
    function mountMemory(area, api) {
      var syms = (api.opts.symbols || ['❤️', '🌹', '💍', '🧸', '🍫', '💌']).slice(0, 8);
      var deck = shuffle(syms.concat(syms));
      var wrap = el('div', 'mem');
      var info = el('p', 'game-info', 'Moves: 0 · Pairs: 0 of ' + syms.length);
      var board = el('div', 'mem-grid');
      wrap.appendChild(board);
      wrap.appendChild(info);
      area.appendChild(wrap);
      var first = null, lock = false, moves = 0, matched = 0, timers = [];

      deck.forEach(function (s) {
        var c = el('button', 'mem-card');
        c.type = 'button';
        c.dataset.sym = s;
        c.setAttribute('aria-label', 'Hidden card');
        var inner = el('span', 'mem-inner');
        inner.appendChild(el('span', 'mem-face mem-back'));
        inner.appendChild(el('span', 'mem-face mem-front', s));
        c.appendChild(inner);
        c.addEventListener('click', function () { flip(c); });
        board.appendChild(c);
      });
      function flip(c) {
        if (lock || c.classList.contains('up')) return;
        c.classList.add('up');
        c.setAttribute('aria-label', c.dataset.sym);
        if (!first) { first = c; return; }
        moves++;
        if (first.dataset.sym === c.dataset.sym) {
          first.classList.add('done');
          c.classList.add('done');
          first = null;
          matched++;
          ctx.burstAt(c, { particleCount: 8, startVelocity: 10 });
          if (matched === syms.length) {
            timers.push(setTimeout(function () { api.win(api.opts.message || 'Every piece of you matches every piece of me. ❤'); }, 700));
          }
        } else {
          lock = true;
          var a = first;
          first = null;
          timers.push(setTimeout(function () {
            a.classList.remove('up');
            c.classList.remove('up');
            a.setAttribute('aria-label', 'Hidden card');
            c.setAttribute('aria-label', 'Hidden card');
            lock = false;
          }, 850));
        }
        info.textContent = 'Moves: ' + moves + ' · Pairs: ' + matched + ' of ' + syms.length;
      }
      return { destroy: function () { timers.forEach(clearTimeout); } };
    }

    /* =================================================================
       2. Catch My Love (canvas)
       ================================================================= */
    function mountCatch(area, api) {
      var goal = Math.max(5, parseInt(api.opts.goal, 10) || 20);
      var wrap = el('div', 'catch');
      var hud = el('p', 'game-info');
      var box = el('div', 'catch-box');
      var canvas = el('canvas', 'catch-canvas');
      canvas.tabIndex = 0;
      canvas.setAttribute('aria-label', 'Catch the hearts. Drag, or use the left and right arrow keys, to move the basket.');
      var startBtn = el('button', 'btn catch-start', 'Tap to start');
      startBtn.type = 'button';
      box.appendChild(canvas);
      box.appendChild(startBtn);
      wrap.appendChild(box);
      wrap.appendChild(hud);
      area.appendChild(wrap);

      var g = canvas.getContext('2d');
      var W = 0, H = 0, raf = 0, running = false, last = 0, score = 0, items = [], pops = [];
      var spawnIn = 0, bx = 0, target = 0, keys = {}, flash = 0, winTimer = 0;

      function hudText() { hud.textContent = 'Hearts: ' + score + ' of ' + goal; }
      function basketW() { return Math.max(64, Math.min(W * 0.24, 120)); }
      function size() {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var oldW = W || 1;
        W = box.clientWidth;
        H = box.clientHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        bx = bx ? bx * (W / oldW) : W / 2;
        target = target ? target * (W / oldW) : W / 2;
        draw();
      }
      function heartPath(x, y, s) {
        g.beginPath();
        g.moveTo(x, y + s * 0.35);
        g.bezierCurveTo(x - s * 0.62, y - s * 0.02, x - s * 0.36, y - s * 0.58, x, y - s * 0.2);
        g.bezierCurveTo(x + s * 0.36, y - s * 0.58, x + s * 0.62, y - s * 0.02, x, y + s * 0.35);
        g.closePath();
      }
      function spawn() {
        var r = Math.random();
        var type = r < 0.1 ? 'gold' : r < 0.28 ? 'broken' : 'heart';
        var s = type === 'gold' ? 30 : 26 + Math.random() * 8;
        items.push({ x: s + Math.random() * (W - s * 2), y: -s, s: s, type: type,
          vy: H * (0.3 + 0.25 * Math.min(1, score / goal)) * (0.85 + Math.random() * 0.3),
          rot: (Math.random() - 0.5) * 0.4, sway: Math.random() * Math.PI * 2 });
      }
      function step(t) {
        var dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (document.hidden) { raf = requestAnimationFrame(step); return; }
        if (keys.left) target -= 520 * dt;
        if (keys.right) target += 520 * dt;
        var half = basketW() / 2;
        target = Math.max(half, Math.min(W - half, target));
        bx += (target - bx) * Math.min(1, dt * 14);
        spawnIn -= dt;
        if (spawnIn <= 0) { spawn(); spawnIn = 0.7 - 0.3 * Math.min(1, score / goal); }
        var by = H - 30;
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          it.y += it.vy * dt;
          it.sway += dt * 2;
          var hx = it.x + Math.sin(it.sway) * 6;
          if (it.y + it.s * 0.3 >= by - 12 && it.y < by + 8 && Math.abs(hx - bx) < half + it.s * 0.2) {
            var pts = it.type === 'gold' ? 3 : it.type === 'broken' ? -2 : 1;
            score = Math.max(0, score + pts);
            if (pts < 0) flash = 0.35;
            pops.push({ x: hx, y: by - 26, text: (pts > 0 ? '+' : '') + pts, life: 0.9, bad: pts < 0 });
            items.splice(i, 1);
            hudText();
            if (score >= goal) { finish(); return; }
          } else if (it.y > H + it.s) {
            items.splice(i, 1);
          }
        }
        for (var k = pops.length - 1; k >= 0; k--) { pops[k].life -= dt; pops[k].y -= 40 * dt; if (pops[k].life <= 0) pops.splice(k, 1); }
        flash = Math.max(0, flash - dt);
        draw();
        raf = requestAnimationFrame(step);
      }
      function draw() {
        if (!W) return;
        g.clearRect(0, 0, W, H);
        if (flash > 0) { g.fillStyle = 'rgba(155, 93, 229,' + (flash * 0.35) + ')'; g.fillRect(0, 0, W, H); }
        items.forEach(function (it) {
          var hx = it.x + Math.sin(it.sway) * 6;
          g.save();
          g.translate(hx, it.y);
          g.rotate(it.rot);
          heartPath(0, 0, it.s);
          if (it.type === 'broken') {
            g.fillStyle = '#B9A7C9';
            g.fill();
            g.strokeStyle = '#fff';
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(0, -it.s * 0.2); g.lineTo(-it.s * 0.08, -it.s * 0.02); g.lineTo(it.s * 0.07, it.s * 0.1); g.lineTo(0, it.s * 0.3);
            g.stroke();
          } else {
            var grad = g.createLinearGradient(-it.s / 2, -it.s / 2, it.s / 2, it.s / 2);
            if (it.type === 'gold') { grad.addColorStop(0, '#FCE9A6'); grad.addColorStop(1, '#D4AF37'); }
            else { grad.addColorStop(0, '#FF8DBA'); grad.addColorStop(1, '#E0457B'); }
            g.fillStyle = grad;
            g.shadowColor = it.type === 'gold' ? 'rgba(212, 175, 55, .6)' : 'rgba(224, 69, 123, .45)';
            g.shadowBlur = 10;
            g.fill();
          }
          g.restore();
        });
        // basket
        var w = basketW(), by = H - 30;
        g.save();
        g.translate(bx, by);
        var bg = g.createLinearGradient(0, -14, 0, 18);
        bg.addColorStop(0, '#FFB3D1');
        bg.addColorStop(1, '#C2306B');
        g.fillStyle = bg;
        g.beginPath();
        g.moveTo(-w / 2, -12);
        g.lineTo(w / 2, -12);
        g.quadraticCurveTo(w / 2 - 6, 20, w / 2 - 18, 20);
        g.lineTo(-w / 2 + 18, 20);
        g.quadraticCurveTo(-w / 2 + 6, 20, -w / 2, -12);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(255, 255, 255, .85)';
        g.fillRect(-w / 2, -14, w, 5);
        heartPath(0, 3, 14);
        g.fillStyle = '#fff';
        g.fill();
        g.restore();
        pops.forEach(function (p) {
          g.globalAlpha = Math.max(0, p.life / 0.9);
          g.fillStyle = p.bad ? '#7A4A8F' : '#C2306B';
          g.font = '700 18px Poppins, system-ui, sans-serif';
          g.textAlign = 'center';
          g.fillText(p.text, p.x, p.y);
          g.globalAlpha = 1;
        });
      }
      function finish() {
        running = false;
        cancelAnimationFrame(raf);
        draw();
        winTimer = setTimeout(function () {
          api.win(api.opts.message || 'You caught every bit of my love. Don’t worry, there’s plenty more where that came from.');
        }, 400);
      }
      function begin() {
        startBtn.hidden = true;
        running = true;
        last = performance.now();
        spawnIn = 0.3;
        try { canvas.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
        raf = requestAnimationFrame(step);
      }
      function aim(e) {
        var r = box.getBoundingClientRect();
        target = e.clientX - r.left;
      }
      box.addEventListener('pointerdown', function (e) { if (running) aim(e); });
      box.addEventListener('pointermove', function (e) { if (running) aim(e); });
      startBtn.addEventListener('click', begin);
      function onKey(e) {
        var down = e.type === 'keydown';
        if (e.key === 'ArrowLeft') { keys.left = down; e.preventDefault(); }
        if (e.key === 'ArrowRight') { keys.right = down; e.preventDefault(); }
      }
      document.addEventListener('keydown', onKey);
      document.addEventListener('keyup', onKey);
      window.addEventListener('resize', size);
      hudText();
      size();
      return {
        destroy: function () {
          running = false;
          cancelAnimationFrame(raf);
          clearTimeout(winTimer);
          document.removeEventListener('keydown', onKey);
          document.removeEventListener('keyup', onKey);
          window.removeEventListener('resize', size);
        },
      };
    }

    /* =================================================================
       3. Scratch & See
       ================================================================= */
    function mountScratch(area, api) {
      var o = api.opts;
      var wrap = el('div', 'scratch');
      var card = el('div', 'scratch-card');
      var secret = el('p', 'scratch-secret', fill(o.secret || 'Your next date is on me: anywhere you choose. ❤'));
      var canvas = el('canvas', 'scratch-canvas');
      canvas.setAttribute('aria-label', 'Scratch card. Rub it to reveal the secret.');
      card.appendChild(secret);
      card.appendChild(canvas);
      var info = el('p', 'game-info', 'Keep scratching…');
      wrap.appendChild(card);
      wrap.appendChild(info);
      area.appendChild(wrap);

      var c = canvas.getContext('2d', { willReadFrequently: true });
      var W = 0, H = 0, drawing = false, lastPt = null, done = false, strokes = 0, timer = 0;
      function paint() {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        W = card.clientWidth;
        H = card.clientHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalCompositeOperation = 'source-over';
        var gr = c.createLinearGradient(0, 0, W, H);
        gr.addColorStop(0, '#F9C5D8');
        gr.addColorStop(0.5, '#E3C2F5');
        gr.addColorStop(1, '#F6D58A');
        c.fillStyle = gr;
        c.fillRect(0, 0, W, H);
        for (var i = 0; i < 60; i++) {
          c.fillStyle = 'rgba(255, 255, 255,' + (0.3 + Math.random() * 0.5) + ')';
          c.beginPath();
          c.arc(Math.random() * W, Math.random() * H, 0.5 + Math.random() * 1.8, 0, Math.PI * 2);
          c.fill();
        }
        c.fillStyle = 'rgba(122, 31, 61, .78)';
        c.font = '600 ' + Math.round(Math.max(16, Math.min(W / 12, 26))) + 'px Poppins, system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('Scratch here ✨', W / 2, H / 2);
      }
      function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function scratch(p) {
        c.globalCompositeOperation = 'destination-out';
        c.lineWidth = Math.max(28, W * 0.1);
        c.lineCap = 'round';
        c.lineJoin = 'round';
        var from = lastPt || { x: p.x - 0.1, y: p.y };
        c.beginPath();
        c.moveTo(from.x, from.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        lastPt = p;
        if (++strokes % 6 === 0) check();
      }
      function check() {
        if (done || !canvas.width) return;
        var data = c.getImageData(0, 0, canvas.width, canvas.height).data;
        var clear = 0, total = 0;
        for (var i = 3; i < data.length; i += 4 * 23) { total++; if (data[i] < 50) clear++; }
        var pct = clear / total;
        info.textContent = pct > 0.3 ? 'Almost there…' : 'Keep scratching…';
        if (pct > 0.55) reveal();
      }
      function reveal() {
        done = true;
        canvas.classList.add('gone');
        info.textContent = '';
        ctx.burstAt(card);
        timer = setTimeout(function () { api.win(o.message || 'Now you know my secret. 😉'); }, 1600);
      }
      canvas.addEventListener('pointerdown', function (e) {
        if (done) return;
        drawing = true;
        lastPt = null;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        scratch(pos(e));
      });
      canvas.addEventListener('pointermove', function (e) { if (drawing && !done) scratch(pos(e)); });
      ['pointerup', 'pointercancel'].forEach(function (ev) {
        canvas.addEventListener(ev, function () { drawing = false; lastPt = null; check(); });
      });
      function onResize() { if (!done) paint(); }
      window.addEventListener('resize', onResize);
      paint();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!done && !strokes) paint(); });
      return { destroy: function () { clearTimeout(timer); window.removeEventListener('resize', onResize); } };
    }

    /* =================================================================
       4. Connect Our Stars
       ================================================================= */
    function mountStars(area, api) {
      var NS = 'http://www.w3.org/2000/svg';
      var N = 12, pts = [];
      for (var k = 0; k < N; k++) {
        var t = (Math.PI * 2 * k) / N;
        var x = 16 * Math.pow(Math.sin(t), 3);
        var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pts.push({ x: 50 + x * 2.6, y: 47 - y * 2.6 });
      }
      var wrap = el('div', 'stars');
      var sky = el('div', 'stars-sky');
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('class', 'stars-svg');
      function mk(tag, attrs, cls) {
        var n = document.createElementNS(NS, tag);
        for (var a in attrs) n.setAttribute(a, attrs[a]);
        if (cls) n.setAttribute('class', cls);
        return n;
      }
      for (var i = 0; i < 45; i++) {
        var tw = mk('circle', { cx: (Math.random() * 100).toFixed(1), cy: (Math.random() * 100).toFixed(1), r: (0.15 + Math.random() * 0.35).toFixed(2) }, 'twinkle-dot');
        tw.style.animationDelay = (Math.random() * 4).toFixed(1) + 's';
        svg.appendChild(tw);
      }
      var shape = mk('polygon', { points: pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ') }, 'star-shape');
      var lines = mk('g', {}, 'star-lines');
      svg.appendChild(shape);
      svg.appendChild(lines);
      var stars = [];
      pts.forEach(function (p, idx) {
        var gEl = mk('g', { tabindex: '0', role: 'button', 'aria-label': 'Star ' + (idx + 1) }, 'star');
        gEl.appendChild(mk('circle', { cx: p.x, cy: p.y, r: 6.5 }, 'star-hit'));
        gEl.appendChild(mk('circle', { cx: p.x, cy: p.y, r: 1.7 }, 'star-dot'));
        var num = mk('text', { x: p.x, y: p.y - 3.4 }, 'star-num');
        num.textContent = String(idx + 1);
        gEl.appendChild(num);
        gEl.addEventListener('click', function () { tap(idx); });
        gEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(idx); } });
        svg.appendChild(gEl);
        stars.push(gEl);
      });
      var status = el('p', 'game-info', 'Start with star 1');
      sky.appendChild(svg);
      wrap.appendChild(sky);
      wrap.appendChild(status);
      area.appendChild(wrap);

      var next = 0, done = false, timers = [];
      stars[0].classList.add('hint');
      function drawLine(a, b) {
        var ln = mk('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y }, 'star-line');
        var len = Math.hypot(b.x - a.x, b.y - a.y);
        ln.style.strokeDasharray = len;
        ln.style.strokeDashoffset = len;
        lines.appendChild(ln);
        requestAnimationFrame(function () { requestAnimationFrame(function () { ln.style.strokeDashoffset = 0; }); });
      }
      function tap(idx) {
        if (done) return;
        var s = stars[idx];
        if (idx !== next) {
          if (idx < next) return;
          s.classList.remove('nope');
          requestAnimationFrame(function () { s.classList.add('nope'); });
          stars[next].classList.add('hint');
          status.textContent = 'Find star ' + (next + 1);
          return;
        }
        s.classList.remove('hint');
        s.classList.add('lit');
        if (idx > 0) drawLine(pts[idx - 1], pts[idx]);
        next++;
        if (next < N) {
          status.textContent = 'Next: star ' + (next + 1);
        } else {
          drawLine(pts[N - 1], pts[0]);
          done = true;
          status.textContent = '';
          timers.push(setTimeout(function () { svg.classList.add('complete'); }, 500));
          timers.push(setTimeout(function () {
            api.win(api.opts.message || 'Out of all the stars in the sky, you’re the one I’d wish on.');
          }, 2000));
        }
      }
      return { destroy: function () { timers.forEach(clearTimeout); } };
    }

    /* =================================================================
       5. Pop the Balloons
       ================================================================= */
    function mountBalloons(area, api) {
      var words = fill(api.opts.sentence || 'Happy birthday {her}, you make every day of my life brighter').split(/\s+/).filter(Boolean);
      var wrap = el('div', 'balloons');
      var sky = el('div', 'balloon-sky');
      var line = el('p', 'balloon-line');
      line.setAttribute('aria-live', 'polite');
      var info = el('p', 'game-info', 'Popped 0 of ' + words.length);
      wrap.appendChild(sky);
      wrap.appendChild(line);
      wrap.appendChild(info);
      area.appendChild(wrap);
      var colors = [['#FFB3D1', '#E0457B'], ['#E3C8FF', '#9B5DE5'], ['#FFD3A5', '#F08A5D'], ['#FFE9A0', '#D4AF37'], ['#FFC2DA', '#C2306B'], ['#C9B8FF', '#6A3093']];
      var popped = 0, alive = true, spawnTimer = 0, winTimer = 0;

      function setRise() { sky.style.setProperty('--rise', -(sky.clientHeight + 170) + 'px'); }
      function spawn() {
        if (!alive || popped >= words.length) return;
        if (sky.querySelectorAll('.balloon:not(.popped)').length < 5) {
          var b = el('button', 'balloon');
          b.type = 'button';
          b.setAttribute('aria-label', 'Pop this balloon');
          var c = colors[Math.floor(Math.random() * colors.length)];
          b.style.setProperty('--c1', c[0]);
          b.style.setProperty('--c2', c[1]);
          b.style.left = 'calc((100% - 56px) * ' + Math.random().toFixed(3) + ')';
          b.style.setProperty('--dur', (6.5 + Math.random() * 3.5).toFixed(1) + 's');
          b.style.setProperty('--sway', ((Math.random() - 0.5) * 50).toFixed(0) + 'px');
          b.appendChild(el('span', 'balloon-body'));
          b.addEventListener('click', function () { pop(b); });
          b.addEventListener('animationend', function (e) { if (e.animationName === 'balloon-rise') b.remove(); });
          sky.appendChild(b);
        }
        spawnTimer = setTimeout(spawn, 650 + Math.random() * 500);
      }
      function pop(b) {
        if (b.classList.contains('popped') || popped >= words.length) return;
        b.classList.add('popped');
        ctx.burstAt(b, { particleCount: 10, spread: 80, startVelocity: 12 });
        var w = el('span', 'bw', words[popped]);
        line.appendChild(w);
        line.appendChild(document.createTextNode(' '));
        popped++;
        info.textContent = 'Popped ' + popped + ' of ' + words.length;
        setTimeout(function () { b.remove(); }, 450);
        if (popped === words.length) {
          sky.classList.add('done');
          winTimer = setTimeout(function () { api.win(api.opts.message || 'Happy birthday, my love. ❤'); }, 1400);
        }
      }
      setRise();
      window.addEventListener('resize', setRise);
      spawn();
      return {
        destroy: function () {
          alive = false;
          clearTimeout(spawnTimer);
          clearTimeout(winTimer);
          window.removeEventListener('resize', setRise);
        },
      };
    }

    /* =================================================================
       6. Love Meter
       ================================================================= */
    function mountMeter(area, api) {
      var wrap = el('div', 'meter');
      var heart = el('button', 'meter-heart');
      heart.type = 'button';
      heart.setAttribute('aria-label', 'Press and hold to measure my love');
      heart.appendChild(el('span', 'meter-heart-shape'));
      var pct = el('p', 'meter-pct', '0%');
      var bar = el('div', 'meter-bar');
      var fillEl = el('span', 'meter-fill');
      bar.appendChild(fillEl);
      var says = el('p', 'meter-says', 'Press and hold the heart');
      wrap.appendChild(heart);
      wrap.appendChild(pct);
      wrap.appendChild(bar);
      wrap.appendChild(says);
      area.appendChild(wrap);

      var level = 0, holding = false, raf = 0, last = 0, done = false, timers = [];
      var lines = [[0, 'Press and hold the heart'], [3, 'Measuring…'], [25, 'Warming up…'], [50, 'Ooh, getting serious!'], [75, 'Careful, it’s getting hot in here!'], [92, 'Almost… maxed… out…']];
      function render() {
        fillEl.style.width = level + '%';
        pct.textContent = Math.floor(level) + '%';
        var s = lines[0][1];
        lines.forEach(function (l) { if (level >= l[0]) s = l[1]; });
        says.textContent = s;
        heart.style.transform = 'scale(' + (1 + level / 350) + ')';
      }
      function loop(t) {
        var dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        level += holding ? dt * 36 : -dt * 22;
        if (level >= 100) { overflow(); return; }
        if (level <= 0) { level = 0; render(); raf = 0; return; }
        render();
        raf = requestAnimationFrame(loop);
      }
      function overflow() {
        done = true;
        holding = false;
        raf = 0;
        fillEl.style.width = '100%';
        bar.classList.add('over');
        heart.classList.add('burst');
        var seq = ['100%', '150%', '300%', '999%', '∞'], i = 0;
        (function stepSeq() {
          pct.textContent = seq[i];
          if (++i < seq.length) { timers.push(setTimeout(stepSeq, 280)); return; }
          says.textContent = 'Love overflow!';
          timers.push(setTimeout(function () { api.win(api.opts.message || 'Error: love level too high to measure. ❤'); }, 900));
        })();
      }
      function press(e) {
        if (done) return;
        if (e && e.preventDefault) e.preventDefault();
        holding = true;
        heart.classList.add('holding');
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
      }
      function release() {
        holding = false;
        heart.classList.remove('holding');
      }
      heart.addEventListener('pointerdown', function (e) {
        try { heart.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        press(e);
      });
      ['pointerup', 'pointercancel'].forEach(function (ev) { heart.addEventListener(ev, release); });
      heart.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(e); });
      heart.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') release(); });
      heart.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      return { destroy: function () { cancelAnimationFrame(raf); timers.forEach(clearTimeout); } };
    }

    /* =================================================================
       7. Heart Hunt: little hearts hidden around the whole page
       ================================================================= */
    var SPOTS = [
      ['#hero', 'left:5%;bottom:12%'],
      ['#story .section-head', 'right:3%;top:2px'],
      ['#gallery .container', 'left:0;bottom:-30px'],
      ['#reasons .section-head', 'left:5%;top:45%'],
      ['#wish .cake-stage', 'right:4%;top:18%'],
      ['#coupons .section-head', 'right:6%;bottom:4px'],
      ['#letter .section-head', 'left:4%;top:8px'],
      ['.footer', 'right:9%;top:24%'],
    ];
    var chip = null, toast = null, toastTimer = 0;
    function huntMessage() { return opt('hunt').message || 'You found every heart I hid for you. Just like you found your way into mine.'; }
    function updateChip(show) {
      if (!chip) return;
      chip.textContent = '❤ ' + hunt.found.length + ' / ' + hunt.total;
      if (show) chip.hidden = false;
      chip.classList.toggle('complete', hunt.found.length >= hunt.total);
    }
    function showToast(text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    if (hunt.enabled) {
      var want = Math.max(3, Math.min(SPOTS.length, parseInt(opt('hunt').count, 10) || 7));
      var spots = SPOTS.filter(function (s) { return document.querySelector(s[0]); }).slice(0, want);
      hunt.total = spots.length;
      hunt.found = hunt.found.filter(function (k) { return k < hunt.total; });
      chip = el('div', 'hunt-chip');
      chip.hidden = true;
      chip.setAttribute('aria-hidden', 'true');
      toast = el('div', 'hunt-toast');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(chip);
      document.body.appendChild(toast);
      updateChip(hunt.found.length > 0 && hunt.found.length < hunt.total);

      spots.forEach(function (s, k) {
        if (hunt.found.indexOf(k) !== -1) return;
        var host = document.querySelector(s[0]);
        host.classList.add('hunt-host');
        var h = el('button', 'hidden-heart');
        h.type = 'button';
        h.setAttribute('aria-label', 'You found a hidden heart!');
        h.style.cssText = s[1];
        h.style.animationDelay = (k * 0.7).toFixed(1) + 's';
        h.addEventListener('click', function (e) {
          e.stopPropagation();
          if (h.classList.contains('found')) return;
          h.classList.add('found');
          ctx.burstAt(h, { particleCount: 12, startVelocity: 12 });
          setTimeout(function () { h.remove(); }, 900);
          if (hunt.found.indexOf(k) === -1) hunt.found.push(k);
          ctx.saveList('bday-hunt', hunt.found);
          updateChip(true);
          refreshTiles();
          if (hunt.found.length >= hunt.total) {
            showToast('You found all ' + hunt.total + ' hearts! ❤');
            setTimeout(function () {
              var g = GAMES.filter(function (x) { return x.id === 'hunt'; })[0];
              openGame(g, tiles.hunt && tiles.hunt.btn);
              win(huntMessage());
            }, 1100);
          } else {
            showToast('Heart ' + hunt.found.length + ' of ' + hunt.total + ' found! Keep looking…');
          }
        });
        host.appendChild(h);
      });
    }
    function mountHuntInfo(area) {
      var wrap = el('div', 'hunt-info');
      var row = el('div', 'hunt-row');
      row.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < hunt.total; i++) row.appendChild(el('span', hunt.found.indexOf(i) !== -1 ? 'got' : ''));
      var n = hunt.found.length;
      var p1 = el('p', 'hunt-count', n + ' of ' + hunt.total + ' hearts found');
      var p2 = el('p', 'hunt-text', n >= hunt.total
        ? fill(huntMessage())
        : 'I hid ' + hunt.total + ' little hearts all over this page. Keep your eyes open as you scroll, and tap one when you spot it. Find them all for a secret.');
      var go = el('button', 'btn', n >= hunt.total ? 'Close' : 'Start looking');
      go.type = 'button';
      go.addEventListener('click', closeGame);
      wrap.appendChild(row);
      wrap.appendChild(p1);
      wrap.appendChild(p2);
      wrap.appendChild(go);
      area.appendChild(wrap);
    }

    refreshTiles();
  }
})();
