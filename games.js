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
      // the gift comes first, so she can't miss it
      { id: 'scratch', icon: '🎁', title: 'Scratch to Reveal Your Gift',
        blurb: opt('scratch').revealSong ? 'A little gift is hiding under this card, just for you. Turn your sound on 🔊' : 'A little secret is hiding under this card, just for you.',
        help: 'Rub the card with your finger (or mouse) until your gift shows.' + (opt('scratch').revealSong ? ' Sound on! 🔊' : ''),
        mount: mountScratch },
      { id: 'arrow', icon: '🏹', title: 'Cupid’s Arrow', blurb: 'Help my little bear shoot arrows through the floating hearts.',
        help: 'Drag to aim and let go to shoot (a quick tap shoots too). Golden hearts count double.', mount: mountArrow },
      { id: 'memory', icon: '💞', title: 'Match Our Moments', blurb: 'Flip the cards and find every pair.',
        help: 'Tap two cards to turn them over. Find all the matching pairs.', mount: mountMemory },
      { id: 'catch', icon: '🧺', title: 'Catch My Love', blurb: 'Catch the falling hearts, dodge the broken ones.',
        help: 'Drag (or use the arrow keys) to move the basket. Golden hearts are worth 3. Broken hearts take 2 away.', mount: mountCatch },
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
    var winBear = $('#game-win-bear');
    if (winBear && window.Bears) winBear.appendChild(window.Bears.make({ color: 'pink', pose: 'dance', bow: true }));

    function drawHeart(g, x, y, s) {
      g.beginPath();
      g.moveTo(x, y + s * 0.35);
      g.bezierCurveTo(x - s * 0.62, y - s * 0.02, x - s * 0.36, y - s * 0.58, x, y - s * 0.2);
      g.bezierCurveTo(x + s * 0.36, y - s * 0.58, x + s * 0.62, y - s * 0.02, x, y + s * 0.35);
      g.closePath();
    }

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
      clearWinExtra();
      area.textContent = '';
      modal.querySelector('.game-sheet').scrollTop = 0;
      instance = current.mount(area, { win: win, opts: opt(current.id) }) || null;
    }
    function stopGame() {
      if (activeShow) { activeShow.stop(); activeShow = null; }      // the surprise video, if it's on screen
      [].forEach.call(modal.querySelectorAll('video'), function (v) { try { v.pause(); } catch (e) { /* ignore */ } });
      if (instance && instance.destroy) { try { instance.destroy(); } catch (e) { /* ignore */ } }
      instance = null;
    }
    function clearWinExtra() {
      var old = winBox.querySelector('.game-win-extra');
      if (old) old.remove();
      winBox.parentNode.classList.remove('win-tall');
    }
    // extra: something to show under the message (the song's player, for the gift)
    function win(message, extra) {
      if (current.id !== 'hunt') markWon(current.id);
      winMsg.textContent = fill(message);
      clearWinExtra();
      if (extra) {
        var holder = el('div', 'game-win-extra');
        holder.appendChild(extra);
        var actions = winBox.querySelector('.game-win-actions');
        actions.parentNode.insertBefore(holder, actions);
        winBox.parentNode.classList.add('win-tall');     // the screen grows to fit, so nothing is cut off
      }
      againBtn.hidden = current.id === 'hunt';
      winBox.hidden = false;
      ctx.celebrate(1800);
      if (extra) modal.scrollTop = 0;     // a tall screen: start at the top, so nothing is missed
      try { $('#game-done').focus(extra ? { preventScroll: true } : undefined); } catch (e) { /* ignore */ }
    }
    function closeGame() {
      if (modal.hidden) return;
      stopGame();
      modal.hidden = true;
      area.textContent = '';
      clearWinExtra();
      document.body.style.overflow = '';
      if (lastTile) { try { lastTile.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    window.BirthdayGames.open = function (id) {
      var g = GAMES.filter(function (x) { return x.id === id; })[0];
      if (g) openGame(g, tiles[id] ? tiles[id].btn : null);
      return !!g;
    };

    /* ---------- the gift button on the opening screen opens the scratch card ---------- */
    var giftBtn = $('#gift-btn'), giftLabel = $('#gift-label');
    if (giftBtn && tiles.scratch) {
      var scratchGame = GAMES.filter(function (x) { return x.id === 'scratch'; })[0];
      var hasSong = function () { return !!(opt('scratch').revealSong && window.BirthdaySong && window.BirthdaySong.available()); };
      // the same gift, always in reach in the corner, until she has opened it
      var floatBtn = el('button', 'gift-float');
      floatBtn.type = 'button';
      floatBtn.setAttribute('aria-label', 'Your gift: scratch to reveal it');
      floatBtn.title = 'Your gift: scratch to reveal it';
      var fIcon = el('span', 'gift-float-icon', '🎁');
      fIcon.setAttribute('aria-hidden', 'true');
      floatBtn.appendChild(fIcon);
      floatBtn.appendChild(el('span', 'gift-float-label', 'Your gift'));
      document.body.appendChild(floatBtn);
      var giftText = function () {
        var opened = hasSong() ? window.BirthdaySong.revealed() : won.indexOf('scratch') !== -1;
        giftLabel.textContent = opened && won.indexOf('scratch') !== -1 ? 'See your gift again' : 'Scratch to reveal your gift';
        floatBtn.hidden = opened;       // once she's found the song, the ♫ button sits here instead
      };
      giftText();
      giftBtn.hidden = false;
      giftBtn.addEventListener('click', function () { openGame(scratchGame, giftBtn); });
      floatBtn.addEventListener('click', function () { openGame(scratchGame, floatBtn); });
      document.addEventListener('song:revealed', giftText);
      $('#game-done').addEventListener('click', giftText);
      $('#game-close').addEventListener('click', giftText);
    }

    $('#game-close').addEventListener('click', closeGame);
    $('#game-done').addEventListener('click', closeGame);
    againBtn.addEventListener('click', startGame);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeGame(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGame(); });

    /* =================================================================
       0. Cupid's Arrow (canvas): a bear with a bow shoots at floating hearts
       ================================================================= */
    function mountArrow(area, api) {
      var goal = Math.max(3, parseInt(api.opts.goal, 10) || 10);
      var wrap = el('div', 'arrow-game');
      var box = el('div', 'arrow-box');
      var archer = el('div', 'arrow-archer');
      archer.setAttribute('aria-hidden', 'true');
      if (window.Bears) archer.appendChild(window.Bears.make({ color: 'brown', pose: 'peek' }));
      var canvas = el('canvas', 'arrow-canvas');
      canvas.tabIndex = 0;
      canvas.setAttribute('aria-label', 'Cupid’s arrow. Drag to aim and let go to shoot, or use the arrow keys and the space bar.');
      var startBtn = el('button', 'btn arrow-start', 'Tap to start');
      startBtn.type = 'button';
      box.appendChild(archer);
      box.appendChild(canvas);
      box.appendChild(startBtn);
      var hud = el('p', 'game-info');
      wrap.appendChild(box);
      wrap.appendChild(hud);
      area.appendChild(wrap);

      var g = canvas.getContext('2d');
      var W = 0, H = 0, raf = 0, running = false, last = 0, score = 0, cool = 0, spawnIn = 0, winTimer = 0;
      var hearts = [], arrows = [], bits = [], pops = [];
      var angle = -Math.PI / 2, aiming = false, keys = {};
      var MIN_A = -Math.PI + 0.14, MAX_A = -0.14;

      function bowPos() { return { x: W / 2, y: H - 88 }; }
      function hudText() { hud.textContent = 'Hearts hit: ' + score + ' of ' + goal; }
      function size() {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        W = box.clientWidth;
        H = box.clientHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      }
      function spawn() {
        var fromLeft = Math.random() < 0.5;
        var s = 30 + Math.random() * 12;
        var speed = (55 + Math.random() * 55 + score * 5) * (W < 420 ? 0.8 : 1);
        hearts.push({ x: fromLeft ? -s : W + s, y0: Math.max(30, (H - 130) * (0.15 + Math.random() * 0.7)), y: 0, s: s,
          vx: fromLeft ? speed : -speed, t: Math.random() * 6, gold: Math.random() < 0.15 });
      }
      function setAim(px, py) {
        var b = bowPos();
        var a = Math.atan2(py - b.y, px - b.x);
        if (a > MAX_A || a < MIN_A) a = (a > Math.PI / 2 || a < -Math.PI / 2) ? MIN_A : MAX_A;
        angle = a;
      }
      function shoot() {
        if (!running || cool > 0) return;
        var b = bowPos(), sp = Math.max(560, H * 1.6);
        arrows.push({ x: b.x, y: b.y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp });
        cool = 0.32;
      }
      function drawArrow(x, y, ang, len) {
        g.save();
        g.translate(x, y);
        g.rotate(ang);
        g.strokeStyle = '#7A4A2B';
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, 0); g.lineTo(len - 8, 0); g.stroke();
        g.fillStyle = '#D4AF37';
        g.beginPath(); g.moveTo(len, 0); g.lineTo(len - 11, -5); g.lineTo(len - 11, 5); g.closePath(); g.fill();
        g.fillStyle = '#FF8DBA';
        g.beginPath(); g.moveTo(1, 0); g.lineTo(-8, -6); g.lineTo(5, 0); g.lineTo(-8, 6); g.closePath(); g.fill();
        g.restore();
      }
      function draw() {
        if (!W) return;
        g.clearRect(0, 0, W, H);
        hearts.forEach(function (h) {
          drawHeart(g, h.x, h.y, h.s);
          var gr = g.createLinearGradient(h.x - h.s / 2, h.y - h.s / 2, h.x + h.s / 2, h.y + h.s / 2);
          if (h.gold) { gr.addColorStop(0, '#FCE9A6'); gr.addColorStop(1, '#D4AF37'); }
          else { gr.addColorStop(0, '#FF8DBA'); gr.addColorStop(1, '#E0457B'); }
          g.fillStyle = gr;
          g.shadowColor = h.gold ? 'rgba(212, 175, 55, .6)' : 'rgba(224, 69, 123, .45)';
          g.shadowBlur = 10;
          g.fill();
          g.shadowBlur = 0;
        });
        bits.forEach(function (b) {
          g.globalAlpha = Math.max(0, b.life / 0.8);
          drawHeart(g, b.x, b.y, b.s);
          g.fillStyle = b.gold ? '#E9C46A' : '#F48FB1';
          g.fill();
          g.globalAlpha = 1;
        });
        arrows.forEach(function (a) {
          var ang = Math.atan2(a.vy, a.vx);
          drawArrow(a.x - Math.cos(ang) * 22, a.y - Math.sin(ang) * 22, ang, 38);
        });
        var b = bowPos();
        if (running && (aiming || keys.left || keys.right)) {
          g.save();
          g.setLineDash([4, 7]);
          g.strokeStyle = 'rgba(224, 69, 123, .5)';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(b.x, b.y);
          g.lineTo(b.x + Math.cos(angle) * 140, b.y + Math.sin(angle) * 140);
          g.stroke();
          g.restore();
        }
        // the bow, turned toward where she aims
        g.save();
        g.translate(b.x, b.y);
        g.rotate(angle);
        g.strokeStyle = '#8B4A2B';
        g.lineWidth = 4;
        g.lineCap = 'round';
        g.beginPath(); g.arc(-6, 0, 24, -1.4, 1.4); g.stroke();
        var ex = -6 + 24 * Math.cos(1.4), ey = 24 * Math.sin(1.4), pull = cool <= 0 ? -16 : -3;
        g.strokeStyle = 'rgba(122, 31, 61, .75)';
        g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(ex, -ey); g.lineTo(pull, 0); g.lineTo(ex, ey); g.stroke();
        g.restore();
        if (cool <= 0) drawArrow(b.x + Math.cos(angle) * -16, b.y + Math.sin(angle) * -16, angle, 44);
        pops.forEach(function (p) {
          g.globalAlpha = Math.max(0, p.life / 0.9);
          g.fillStyle = '#C2306B';
          g.font = '700 18px Poppins, system-ui, sans-serif';
          g.textAlign = 'center';
          g.fillText(p.text, p.x, p.y);
          g.globalAlpha = 1;
        });
      }
      function step(t) {
        var dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        if (document.hidden) { raf = requestAnimationFrame(step); return; }
        if (keys.left) angle = Math.max(MIN_A, angle - 1.8 * dt);
        if (keys.right) angle = Math.min(MAX_A, angle + 1.8 * dt);
        cool = Math.max(0, cool - dt);
        spawnIn -= dt;
        if (spawnIn <= 0 && hearts.length < 6) { spawn(); spawnIn = 0.8 + Math.random() * 0.6; }
        hearts.forEach(function (h) { h.x += h.vx * dt; h.t += dt; h.y = h.y0 + Math.sin(h.t * 2) * 10; });
        hearts = hearts.filter(function (h) { return h.x > -h.s * 2 && h.x < W + h.s * 2; });
        for (var i = arrows.length - 1; i >= 0; i--) {
          var a = arrows[i];
          a.x += a.vx * dt;
          a.y += a.vy * dt;
          a.vy += 140 * dt;
          var ang = Math.atan2(a.vy, a.vx), tx = a.x + Math.cos(ang) * 16, ty = a.y + Math.sin(ang) * 16;
          var hit = -1;
          for (var k = 0; k < hearts.length; k++) {
            if (Math.hypot(tx - hearts[k].x, ty - hearts[k].y) < hearts[k].s * 0.6) { hit = k; break; }
          }
          if (hit >= 0) {
            var h = hearts.splice(hit, 1)[0];
            arrows.splice(i, 1);
            var pts = h.gold ? 2 : 1;
            score += pts;
            hudText();
            for (var q = 0; q < 10; q++) {
              bits.push({ x: h.x, y: h.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.8) * 200, life: 0.8, s: 6 + Math.random() * 6, gold: h.gold });
            }
            pops.push({ x: h.x, y: h.y - 22, text: '+' + pts, life: 0.9 });
            if (score >= goal) { finish(); return; }
            continue;
          }
          if (a.y < -50 || a.x < -50 || a.x > W + 50 || a.y > H + 50) arrows.splice(i, 1);
        }
        bits.forEach(function (b) { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 400 * dt; b.life -= dt; });
        bits = bits.filter(function (b) { return b.life > 0; });
        pops.forEach(function (p) { p.y -= 40 * dt; p.life -= dt; });
        pops = pops.filter(function (p) { return p.life > 0; });
        draw();
        raf = requestAnimationFrame(step);
      }
      function finish() {
        running = false;
        cancelAnimationFrame(raf);
        draw();
        winTimer = setTimeout(function () {
          api.win(api.opts.message || 'Right through the heart! Don’t worry, it was already yours. ❤');
        }, 500);
      }
      function begin() {
        startBtn.hidden = true;
        running = true;
        spawnIn = 0.2;
        last = performance.now();
        try { canvas.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
        raf = requestAnimationFrame(step);
      }
      function pos(e) { var r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      box.addEventListener('pointerdown', function (e) {
        if (!running) return;
        aiming = true;
        var p = pos(e);
        setAim(p.x, p.y);
        try { box.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      box.addEventListener('pointermove', function (e) {
        if (!running) return;
        if (aiming || e.pointerType === 'mouse') { var p = pos(e); setAim(p.x, p.y); }
      });
      box.addEventListener('pointerup', function () { if (running && aiming) { aiming = false; shoot(); } });
      box.addEventListener('pointercancel', function () { aiming = false; });
      startBtn.addEventListener('click', begin);
      function onKey(e) {
        if (modal.hidden || !running) return;
        var down = e.type === 'keydown';
        if (e.key === 'ArrowLeft') { keys.left = down; e.preventDefault(); }
        if (e.key === 'ArrowRight') { keys.right = down; e.preventDefault(); }
        if (down && (e.key === ' ' || e.key === 'ArrowUp')) { e.preventDefault(); shoot(); }
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
      var song = o.revealSong && window.BirthdaySong && window.BirthdaySong.available();
      var secret;
      if (song) {                      // the secret is a song made for her
        secret = el('div', 'scratch-secret scratch-song');
        secret.appendChild(el('span', 'song-notes', '🎶'));
        secret.appendChild(el('span', 'song-intro', fill(o.songIntro || 'I made you a song')));
        secret.appendChild(el('span', 'song-title', window.BirthdaySong.title()));
        secret.appendChild(el('span', 'song-hint', 'Turn your volume up 🔊'));
      } else {
        secret = el('p', 'scratch-secret', fill(o.secret || 'Your next date is on me: anywhere you choose. ❤'));
      }
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
        if (song) window.BirthdaySong.reveal();      // the song starts as the secret appears
        timer = setTimeout(function () {
          if (song) api.win(o.songMessage || 'That’s your song. Made just for you. 💗', window.BirthdaySong.makePlayer('in-win', { lyrics: true }));
          else api.win(o.message || 'Now you know my secret. 😉');
        }, song ? 4200 : 1600);
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
        var dt = Math.min(0.25, (t - last) / 1000);   // real time, so slow phones fill just as fast
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
    var chip = null, toast = null, toastTimer = 0, intro = null, justFinished = false;

    // The reward for finding every heart. First her message; then a golden movie ticket fades in.
    // Tapping it tears the ticket, her song pauses (the lights dim), a little cinema counts down 3-2-1,
    // and the curtains open on the video. When it ends the curtains close, and her song carries on.
    var activeShow = null;     // the show on screen, so closing the window can tidy it up
    var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.7-6.8c.6-.4.6-1.3 0-1.7L9.6 4.3C8.9 3.9 8 4.4 8 5.2z"/></svg>';
    function makeWishVideo(opts) {
      var v = opt('hunt').video;
      if (!v || !v.src) return null;
      opts = opts || {};
      var song = window.BirthdaySong;
      var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
      var box = el('div', 'wish-video');
      box.appendChild(el('p', 'wish-video-title', fill(v.title || 'But wait… there’s one more surprise 🎬')));

      // 1. the ticket
      var ticket = el('button', 'wish-ticket');
      ticket.type = 'button';
      ticket.setAttribute('aria-label', fill((v.ticket || 'Your surprise video') + '. ' + (touch ? 'Tap' : 'Click') + ' to play.'));
      var body = el('span', 'wish-ticket-body');
      body.setAttribute('aria-hidden', 'true');
      body.appendChild(el('span', 'wish-ticket-stub', 'ADMIT ONE'));
      var main = el('span', 'wish-ticket-main');
      main.appendChild(el('span', 'wish-ticket-kicker', '🎬 Tonight’s feature'));
      main.appendChild(el('span', 'wish-ticket-title', fill(v.ticket || 'Your surprise video')));
      main.appendChild(el('span', 'wish-ticket-for', fill('just for {her}')));
      main.appendChild(el('span', 'wish-ticket-go', (touch ? 'Tap' : 'Click') + ' to play ▶'));
      body.appendChild(main);
      ticket.appendChild(body);

      // 2. the little cinema
      var stage = el('div', 'wish-stage');
      stage.hidden = true;
      var video = document.createElement('video');
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      if (v.poster) video.poster = v.poster;
      video.src = v.src;
      var curtL = el('div', 'wish-curtain left'), curtR = el('div', 'wish-curtain right'), valance = el('div', 'wish-valance');
      var countdown = el('div', 'wish-countdown');
      var dial = el('div', 'wish-dial');
      var num = el('span', 'wish-num', '3');
      dial.appendChild(num);
      countdown.appendChild(dial);
      countdown.appendChild(el('p', 'wish-credit', fill(v.credit || 'A special birthday message for {her}')));
      var end = el('div', 'wish-end');
      end.hidden = true;
      end.appendChild(el('p', 'wish-end-msg', fill(v.endMessage || 'Happy Birthday, {her} 💗')));
      var again = el('button', 'btn wish-again', '↺ Watch again');
      again.type = 'button';
      end.appendChild(again);
      var tapPlay = el('button', 'wish-tap-play');      // only if a phone held the video back
      tapPlay.type = 'button';
      tapPlay.hidden = true;
      tapPlay.setAttribute('aria-label', 'Play the video');
      tapPlay.innerHTML = PLAY_ICON;
      [curtL, curtR, valance, countdown].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); });
      [video, curtL, curtR, valance, countdown, end, tapPlay].forEach(function (n) { stage.appendChild(n); });
      box.appendChild(ticket);
      box.appendChild(stage);

      var state = 'ticket', timers = [], held = false;
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function holdSong(on) {
        if (!song || !song.hold || held === on) return;
        held = on;
        song.hold(on);
      }
      function roll() {                       // the curtains open and the video plays, with sound
        state = 'playing';
        stage.classList.remove('counting');
        stage.classList.add('open');
        video.muted = false;
        video.controls = true;
        var p = video.play();
        if (p && p.catch) p.catch(function () { tapPlay.hidden = false; });
      }
      ticket.addEventListener('click', function () {
        if (state !== 'ticket') return;
        state = 'intro';
        holdSong(true);                       // the lights dim: her song pauses for the show
        // phones only let a video play with sound after a tap: start it silently now, inside the tap
        try {
          video.muted = true;
          var p = video.play();
          if (p && p.then) p.then(function () { if (state === 'intro') { video.pause(); video.currentTime = 0; } }).catch(function () { /* fine */ });
        } catch (e) { /* fine */ }
        ticket.classList.add('torn');
        later(function () {
          ticket.hidden = true;
          stage.hidden = false;
          stage.classList.add('counting');
          try { stage.scrollIntoView({ behavior: ctx.reduced ? 'auto' : 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
          var n = 3;
          num.textContent = n;
          dial.classList.add('tick');
          (function step() {
            later(function () {
              n--;
              if (n > 0) {
                num.textContent = n;
                dial.classList.remove('tick');
                void dial.offsetWidth;            // restart the sweep
                dial.classList.add('tick');
                step();
              } else roll();
            }, 1000);
          })();
        }, 650);
      });
      tapPlay.addEventListener('click', function () { tapPlay.hidden = true; video.play(); });
      video.addEventListener('play', function () { if (state === 'playing') { tapPlay.hidden = true; holdSong(true); } });
      video.addEventListener('pause', function () { if (state === 'playing' && !video.ended) holdSong(false); });
      video.addEventListener('ended', function () {
        if (state !== 'playing') return;
        state = 'end';
        video.controls = false;
        stage.classList.remove('open');      // the curtains close…
        later(function () { end.hidden = false; }, 1000);
        holdSong(false);                     // …and her song carries on
      });
      again.addEventListener('click', function () {
        end.hidden = true;
        try { video.currentTime = 0; } catch (e) { /* ignore */ }
        roll();
      });
      video.addEventListener('error', function () { box.remove(); });   // no file: no broken player
      // on the "You did it!" screen: once she's read the message, bring the ticket into view
      if (opts.nudge) later(function () {
        if (state === 'ticket' && box.isConnected) { try { ticket.scrollIntoView({ behavior: ctx.reduced ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) { /* ignore */ } }
      }, 2400);
      activeShow = {
        stop: function () {
          timers.forEach(clearTimeout);
          timers = [];
          try { video.pause(); } catch (e) { /* ignore */ }
          holdSong(false);
        },
      };
      return box;
    }
    function huntMessage() { return opt('hunt').message || 'You found every heart I hid for you. Just like you found your way into mine.'; }
    function huntDone() { return hunt.total > 0 && hunt.found.length >= hunt.total; }
    function updateChip() {
      if (!chip) return;
      var n = hunt.found.length;
      chip.textContent = '❤ ' + n + ' / ' + hunt.total + (huntDone() ? ' ✓' : '');
      chip.setAttribute('aria-label', 'Hidden hearts found: ' + n + ' of ' + hunt.total + '. Open the heart hunt.');
      chip.classList.toggle('complete', huntDone());
    }
    function showToast(text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    function openHunt() {
      var g = GAMES.filter(function (x) { return x.id === 'hunt'; })[0];
      if (g) openGame(g, tiles.hunt && tiles.hunt.btn);
    }
    // Scroll to the nearest heart she hasn't found yet and make it glow.
    function hintHeart() {
      var left = [].slice.call(document.querySelectorAll('.hidden-heart:not(.found)'));
      if (!left.length) return;
      var mid = window.innerHeight / 2;
      left.sort(function (a, b) { return Math.abs(a.getBoundingClientRect().top - mid) - Math.abs(b.getBoundingClientRect().top - mid); });
      var h = left[0];
      var rv = h.closest('.reveal');
      if (rv) rv.classList.add('in');
      h.scrollIntoView({ behavior: ctx.reduced ? 'auto' : 'smooth', block: 'center' });
      h.classList.remove('hinted');
      void h.offsetWidth;
      h.classList.add('hinted');
      setTimeout(function () { h.classList.remove('hinted'); }, 4500);
    }
    // The little note that tells her about the hidden hearts, shown after the opening animation.
    function closeIntro(remember) {
      if (!intro) return;
      var it = intro;
      intro = null;
      it.classList.add('leaving');
      setTimeout(function () { it.remove(); }, 400);
      if (remember) ctx.saveList('bday-hunt-intro', [1]);
    }
    function showIntro() {
      if (!hunt.enabled || huntDone() || intro) return;
      if (ctx.readList('bday-hunt-intro').length) return;
      if (!document.body.classList.contains('unlocked')) return;
      intro = el('div', 'hunt-intro');
      intro.setAttribute('role', 'dialog');
      intro.setAttribute('aria-label', 'Hidden hearts');
      var pic = el('div', 'hunt-intro-bear');
      pic.setAttribute('aria-hidden', 'true');
      if (window.Bears) pic.appendChild(window.Bears.make({ color: 'brown', pose: 'heart' }));
      var body = el('div', 'hunt-intro-body');
      var msg = el('p');
      var n = hunt.found.length;
      if (n === 0) {
        msg.appendChild(document.createTextNode('Psst… I hid '));
        msg.appendChild(el('strong', null, hunt.total + ' little hearts'));
        msg.appendChild(document.createTextNode(' all over this page. Tap them when you spot them. Find all ' + hunt.total + ' for a secret! 💗'));
      } else {
        msg.textContent = 'You’ve found ' + n + ' of ' + hunt.total + ' hidden hearts. The rest are still out there… 💗';
      }
      var actions = el('div', 'hunt-intro-actions');
      var go = el('button', 'btn', 'Let’s go!');
      go.type = 'button';
      var show = el('button', 'link-btn', 'Show me one');
      show.type = 'button';
      go.addEventListener('click', function () { closeIntro(true); });
      show.addEventListener('click', function () { closeIntro(true); hintHeart(); });
      actions.appendChild(go);
      actions.appendChild(show);
      body.appendChild(msg);
      body.appendChild(actions);
      intro.appendChild(pic);
      intro.appendChild(body);
      document.body.appendChild(intro);
    }
    if (hunt.enabled) {
      var want = Math.max(3, Math.min(SPOTS.length, parseInt(opt('hunt').count, 10) || 7));
      var spots = SPOTS.filter(function (s) { return document.querySelector(s[0]); }).slice(0, want);
      hunt.total = spots.length;
      hunt.found = hunt.found.filter(function (k) { return k < hunt.total; });
      chip = el('button', 'hunt-chip');
      chip.type = 'button';
      chip.addEventListener('click', openHunt);
      toast = el('div', 'hunt-toast');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(chip);
      document.body.appendChild(toast);
      updateChip();
      document.addEventListener('site:unlocked', function () { setTimeout(showIntro, 5200); });

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
          updateChip();
          refreshTiles();
          if (huntDone()) {
            closeIntro(true);
            showToast('You found all ' + hunt.total + ' hearts! ❤');
            setTimeout(function () {
              justFinished = true;           // the video goes on the "You did it!" screen, not twice
              openHunt();
              justFinished = false;
              win(huntMessage(), makeWishVideo({ nudge: true }));
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
        : 'I hid ' + hunt.total + ' little hearts all over this page. They glow softly and wiggle a little. Tap one when you spot it, and find them all for a secret.');
      var actions = el('div', 'hunt-info-actions');
      if (n < hunt.total) {
        var hint = el('button', 'btn', 'Show me a hint');
        hint.type = 'button';
        hint.addEventListener('click', function () { closeGame(); setTimeout(hintHeart, 350); });
        actions.appendChild(hint);
      }
      var go = el('button', n >= hunt.total ? 'btn' : 'link-btn', n >= hunt.total ? 'Close' : 'I’ll find them myself');
      go.type = 'button';
      go.addEventListener('click', closeGame);
      actions.appendChild(go);
      wrap.appendChild(row);
      wrap.appendChild(p1);
      wrap.appendChild(p2);
      if (n >= hunt.total && !justFinished) {   // she can watch the birthday video again any time
        var wv = makeWishVideo();
        if (wv) wrap.appendChild(wv);
      }
      wrap.appendChild(actions);
      area.appendChild(wrap);
    }

    refreshTiles();
  }
})();
