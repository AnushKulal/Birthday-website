/* =====================================================================
   Lyrics timing helper: open the site with  ?sync  (e.g. https://…vercel.app/?sync)
   ---------------------------------------------------------------------
   Press Start, then tap the big button the moment each line begins
   (on a laptop: the space bar). Tap "♪ Music only" where nobody sings.
   At the end, copy the timings and paste them into config.js under
   music.lyrics (or send them to whoever looks after the site).
   Only loaded for ?sync links, never for her.
   ===================================================================== */
(function () {
  'use strict';

  var song = window.BirthdaySong;
  var audio = document.querySelector('#music');
  if (!song || !song.available() || !audio) return;
  var lines = song.lyricLines().filter(function (l) { return l && !/^\s*♪/.test(l); });
  if (!lines.length) return;

  var LAG = 0.25;            // people tap a little after a line starts; take that off
  var marks = [];            // { t, text } in the order they were tapped
  var next = 0;              // the next line to time
  var started = false;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function button(cls, text) {
    var b = el('button', cls, text);
    b.type = 'button';
    return b;
  }
  function fmt(t) {
    t = Math.max(0, t);
    var m = Math.floor(t / 60);
    var s = t - m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1);
  }

  /* ---------- the page ---------- */
  var root = el('div', 'sync');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Lyrics timing');
  var card = el('div', 'sync-card');
  card.appendChild(el('h2', 'sync-title', 'Lyrics timing 🎵'));
  card.appendChild(el('p', 'sync-help',
    'Press Start, then tap the big button the moment each line begins (on a laptop: the space bar). ' +
    'Tap “♪ Music only” where nobody is singing. Made a mistake? “Undo” goes back one line and rewinds a few seconds.'));
  card.appendChild(song.makePlayer('in-sync'));

  var now = el('div', 'sync-now');
  var label = el('span', 'sync-label', 'First line');
  var line = el('p', 'sync-line', lines[0]);
  var after = el('p', 'sync-after', lines[1] ? 'then: ' + lines[1] : '');
  now.appendChild(label);
  now.appendChild(line);
  now.appendChild(after);
  card.appendChild(now);

  var tap = button('btn sync-tap', 'Start ▶');
  card.appendChild(tap);
  var row = el('div', 'sync-row');
  var music = button('link-btn', '♪ Music only');
  var undo = button('link-btn', '↶ Undo');
  var over = button('link-btn', 'Start over');
  row.appendChild(music);
  row.appendChild(undo);
  row.appendChild(over);
  card.appendChild(row);
  var count = el('p', 'sync-count');
  card.appendChild(count);

  var done = el('div', 'sync-done');
  done.hidden = true;
  done.appendChild(el('p', 'sync-done-title', 'All ' + lines.length + ' lines timed! 🎉'));
  var previewBox = el('div', 'sync-preview');
  done.appendChild(previewBox);
  var replay = button('link-btn', '▶ Watch them scroll from the start');
  done.appendChild(replay);
  var copy = button('btn', 'Copy the timings');
  done.appendChild(copy);
  var out = el('textarea', 'sync-out');
  out.readOnly = true;
  out.rows = 8;
  out.setAttribute('aria-label', 'Timings');
  done.appendChild(out);
  done.appendChild(el('p', 'sync-note', 'Paste these into config.js (music → lyrics), or send them over in a message.'));
  card.appendChild(done);

  root.appendChild(card);
  document.body.appendChild(root);
  document.body.classList.add('syncing');

  /* ---------- behaviour ---------- */
  function refresh() {
    var finished = next >= lines.length;
    label.textContent = !started ? 'First line' : finished ? 'Done' : 'Tap when this starts';
    line.textContent = finished ? 'That’s every line 💗' : lines[next];
    after.textContent = !finished && lines[next + 1] ? 'then: ' + lines[next + 1] : '';
    count.textContent = next + ' of ' + lines.length + ' lines timed';
    tap.textContent = !started ? 'Start ▶' : 'Tap: next line';
    tap.disabled = started && finished;
    music.disabled = undo.disabled = !started;
    undo.disabled = !marks.length;
  }
  function finish() {
    var text = 'lyrics: [\n' + marks.map(function (m) {
      return '  ["' + fmt(m.t) + '", ' + JSON.stringify(m.text) + '],';
    }).join('\n') + '\n],';
    out.value = text;
    previewBox.textContent = '';
    var lyr = song.makeLyrics(marks.map(function (m) { return { t: m.t, text: m.text }; }));
    if (lyr) previewBox.appendChild(lyr);
    done.hidden = false;
    try { done.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
  }
  function mark(text) {
    marks.push({ t: Math.max(0, (audio.currentTime || 0) - LAG), text: text });
  }
  function begin() {
    marks = [];
    next = 0;
    started = true;
    done.hidden = true;
    try { audio.currentTime = 0; } catch (e) { /* ignore */ }
    song.play();
    refresh();
  }
  tap.addEventListener('click', function () {
    if (!started) { begin(); return; }
    if (next >= lines.length) return;
    mark(lines[next]);
    next++;
    refresh();
    if (next >= lines.length) finish();
  });
  music.addEventListener('click', function () {
    if (!started) return;
    mark('♪');
    refresh();
  });
  undo.addEventListener('click', function () {
    var last = marks.pop();
    if (!last) return;
    if (last.text !== '♪') next = Math.max(0, next - 1);
    done.hidden = true;
    try { audio.currentTime = Math.max(0, last.t - 3); } catch (e) { /* ignore */ }
    refresh();
  });
  over.addEventListener('click', begin);
  replay.addEventListener('click', function () {
    try { audio.currentTime = 0; } catch (e) { /* ignore */ }
    song.play();
  });
  copy.addEventListener('click', function () {
    var ok = function () { copy.textContent = 'Copied ✓'; setTimeout(function () { copy.textContent = 'Copy the timings'; }, 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out.value).then(ok, function () { out.select(); });
    } else {
      out.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* they can copy by hand */ }
    }
  });
  // keyboard: space / enter = next line, M = music only, backspace = undo
  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tap.click(); }
    else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); music.click(); }
    else if (e.key === 'Backspace') { e.preventDefault(); undo.click(); }
  });
  // a focused button would also "click" itself on space: only the line above should count
  document.addEventListener('keyup', function (e) {
    if (e.key === ' ' && e.target && e.target.tagName === 'BUTTON') e.preventDefault();
  });
  refresh();
})();
