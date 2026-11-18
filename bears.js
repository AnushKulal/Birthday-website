/* =====================================================================
   Cute animated teddy bears (original characters, drawn in SVG)
   ---------------------------------------------------------------------
   Kajal's bear: pink with a bow.  Anush's bear: caramel brown.
   Bears.make({ color, pose, bow, flip }) builds one bear.
   Poses: sit, wave, heart, peek, sleep, dance, cuddle.
   Bears.decorate() places them around the page.
   ===================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  var PALETTES = {
    brown: { fur: '#C8916A', hi: '#E2B590', shade: '#A16C49', light: '#F5E1CE', ear: '#E9A994', nose: '#4A2C2A', blush: '#F28CA8' },
    pink:  { fur: '#F4C3D0', hi: '#FCE0E8', shade: '#DC94AC', light: '#FFF4F7', ear: '#F48FB1', nose: '#5A2C3E', blush: '#FF6F9F' },
  };

  function n(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function heartD(cx, cy, s) {
    return 'M' + cx + ' ' + (cy + s * 0.42) +
      ' C ' + (cx - s * 0.62) + ' ' + (cy + s * 0.02) + ', ' + (cx - s * 0.42) + ' ' + (cy - s * 0.52) + ', ' + cx + ' ' + (cy - s * 0.2) +
      ' C ' + (cx + s * 0.42) + ' ' + (cy - s * 0.52) + ', ' + (cx + s * 0.62) + ' ' + (cy + s * 0.02) + ', ' + cx + ' ' + (cy + s * 0.42) + ' Z';
  }

  function make(o) {
    o = o || {};
    var p = PALETTES[o.color] || PALETTES.brown;
    var pose = o.pose || 'sit';
    var id = 'bear' + (++uid);
    var peek = pose === 'peek' || pose === 'sleep';
    var svg = n('svg', {
      viewBox: peek ? '0 0 120 98' : '0 0 120 144',
      class: 'bear pose-' + pose + (o.flip ? ' flip' : ''),
      'aria-hidden': 'true',
      focusable: 'false',
    });
    var defs = n('defs', {}, svg);
    var gf = n('radialGradient', { id: id + 'f', cx: '42%', cy: '36%', r: '72%' }, defs);
    n('stop', { offset: '0', 'stop-color': p.hi }, gf);
    n('stop', { offset: '.68', 'stop-color': p.fur }, gf);
    n('stop', { offset: '1', 'stop-color': p.shade }, gf);
    var gh = n('linearGradient', { id: id + 'h', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    n('stop', { offset: '0', 'stop-color': '#FF8DBA' }, gh);
    n('stop', { offset: '1', 'stop-color': '#E0457B' }, gh);
    var FUR = 'url(#' + id + 'f)';

    var all = n('g', { class: 'bear-all' }, svg);

    if (!peek) {
      // feet + body + tummy
      [40, 80].forEach(function (x) {
        n('ellipse', { cx: x, cy: 133, rx: 13.5, ry: 8.5, fill: FUR }, all);
        n('ellipse', { cx: x, cy: 134, rx: 7.5, ry: 4.6, fill: p.light }, all);
      });
      n('ellipse', { cx: 60, cy: 107, rx: 33, ry: 29, fill: FUR }, all);
      n('ellipse', { cx: 60, cy: 112, rx: 19, ry: 16, fill: p.light }, all);
      if (pose === 'heart') {
        n('path', { d: heartD(60, 106, 32), fill: 'url(#' + id + 'h)', class: 'held-heart' }, all);
      }
      // arms
      var al = n('g', { class: 'arm-l' }, all), ar = n('g', { class: 'arm-r' }, all);
      if (pose === 'heart') {
        n('ellipse', { cx: 37, cy: 104, rx: 9.5, ry: 16, fill: FUR, transform: 'rotate(-32 37 104)' }, al);
        n('ellipse', { cx: 83, cy: 104, rx: 9.5, ry: 16, fill: FUR, transform: 'rotate(32 83 104)' }, ar);
      } else if (pose === 'wave') {
        n('ellipse', { cx: 31, cy: 105, rx: 9.5, ry: 17, fill: FUR, transform: 'rotate(18 31 105)' }, al);
        n('ellipse', { cx: 94, cy: 83, rx: 9.5, ry: 17, fill: FUR, transform: 'rotate(32 94 83)' }, ar);
      } else if (pose === 'dance') {
        n('ellipse', { cx: 24, cy: 84, rx: 9.5, ry: 17, fill: FUR, transform: 'rotate(-30 24 84)' }, al);
        n('ellipse', { cx: 96, cy: 84, rx: 9.5, ry: 17, fill: FUR, transform: 'rotate(30 96 84)' }, ar);
      } else {
        n('ellipse', { cx: 31, cy: 105, rx: 9.5, ry: 17, fill: FUR, transform: 'rotate(18 31 105)' }, al);
        n('ellipse', { cx: 89, cy: 105, rx: 9.5, ry: 17, fill: FUR, transform: 'rotate(-18 89 105)' }, ar);
      }
    }

    // head
    var head = n('g', { class: 'head' }, all);
    [31, 89].forEach(function (x) {
      n('circle', { cx: x, cy: 28, r: 15.5, fill: FUR }, head);
      n('circle', { cx: x, cy: 29, r: 8.5, fill: p.ear }, head);
    });
    n('ellipse', { cx: 60, cy: 55, rx: 37, ry: 33, fill: FUR }, head);
    n('path', { d: 'M49 25 Q53 15 58 22 Q62 12 66 22 Q71 16 73 26 Z', fill: p.fur }, head);   // fluffy tuft
    n('ellipse', { cx: 60, cy: 67, rx: 15.5, ry: 11.5, fill: p.light }, head);
    n('ellipse', { cx: 40, cy: 64, rx: 7, ry: 4.2, fill: p.blush, opacity: '.5', class: 'blush' }, head);
    n('ellipse', { cx: 80, cy: 64, rx: 7, ry: 4.2, fill: p.blush, opacity: '.5', class: 'blush' }, head);
    n('ellipse', { cx: 60, cy: 62, rx: 5.6, ry: 4.1, fill: p.nose }, head);
    n('ellipse', { cx: 58.4, cy: 60.7, rx: 1.7, ry: 1, fill: '#fff', opacity: '.65' }, head);
    n('path', { d: 'M54.5 67 Q57.2 71.5 60 67.5 Q62.8 71.5 65.5 67', fill: 'none', stroke: p.nose, 'stroke-width': '1.7', 'stroke-linecap': 'round' }, head);
    var eyes = n('g', { class: 'eyes' }, head);
    if (pose === 'sleep') {
      n('path', { d: 'M40.5 51 Q46 56 51.5 51', fill: 'none', stroke: p.nose, 'stroke-width': '2.3', 'stroke-linecap': 'round' }, eyes);
      n('path', { d: 'M68.5 51 Q74 56 79.5 51', fill: 'none', stroke: p.nose, 'stroke-width': '2.3', 'stroke-linecap': 'round' }, eyes);
    } else {
      [46, 74].forEach(function (x) {
        n('circle', { cx: x, cy: 50, r: 4.7, fill: p.nose }, eyes);
        n('circle', { cx: x + 1.6, cy: 48.3, r: 1.6, fill: '#fff' }, eyes);
      });
    }
    if (o.bow) {
      var bow = n('g', { class: 'bow' }, head);
      n('ellipse', { cx: 24, cy: 19, rx: 8.5, ry: 5.8, fill: '#E0457B', transform: 'rotate(-28 24 19)' }, bow);
      n('ellipse', { cx: 38, cy: 15, rx: 8.5, ry: 5.8, fill: '#E0457B', transform: 'rotate(22 38 15)' }, bow);
      n('circle', { cx: 31, cy: 17.5, r: 3.8, fill: '#C2306B' }, bow);
    }

    if (peek) {
      // paws resting on the edge it peeks over
      [36, 84].forEach(function (x) {
        n('ellipse', { cx: x, cy: 90, rx: 13, ry: 8.5, fill: FUR }, all);
        n('ellipse', { cx: x, cy: 91.5, rx: 6, ry: 3.4, fill: p.light }, all);
      });
    }
    if (pose === 'sleep') {
      var zz = n('g', { class: 'zzz' }, svg);
      [['z', 94, 24, 13], ['z', 101, 14, 10], ['z', 107, 6, 8]].forEach(function (z, i) {
        var t = n('text', { x: z[1], y: z[2], 'font-size': z[3], class: 'zz zz' + i, fill: '#9B5DE5' }, zz);
        t.textContent = z[0];
      });
    }
    return svg;
  }

  function spot(cls, bears, extra) {
    var w = document.createElement('div');
    w.className = cls;
    w.setAttribute('aria-hidden', 'true');
    bears.forEach(function (b) { w.appendChild(b); });
    (extra || []).forEach(function (e) { w.appendChild(e); });
    return w;
  }

  function decorate() {
    var q = function (s) { return document.querySelector(s); };
    var cd = q('#countdown .overlay-card');
    if (cd) cd.appendChild(spot('bear-spot bear-peek bear-right', [make({ color: 'brown', pose: 'sleep' })]));
    var gate = q('#gate .overlay-card');
    if (gate) gate.appendChild(spot('bear-spot bear-peek bear-left', [make({ color: 'pink', pose: 'peek', bow: true })]));
    var ring = q('.hero-ring');
    if (ring) {
      ring.appendChild(spot('bear-spot hero-bear hero-bear-l', [make({ color: 'pink', pose: 'wave', bow: true, flip: true })]));
      ring.appendChild(spot('bear-spot hero-bear hero-bear-r', [make({ color: 'brown', pose: 'heart' })]));
    }
    var quiz = q('.quiz-card');
    if (quiz) quiz.appendChild(spot('bear-spot bear-peek bear-right', [make({ color: 'brown', pose: 'peek' })]));
    var footer = q('.footer');
    if (footer) {
      var hearts = [0, 1, 2].map(function (i) { var h = document.createElement('span'); h.className = 'couple-heart ch' + i; return h; });
      footer.insertBefore(spot('bear-couple', [make({ color: 'pink', pose: 'cuddle', bow: true }), make({ color: 'brown', pose: 'cuddle' })], hearts), footer.firstChild);
    }
  }

  window.Bears = { make: make, decorate: decorate };
})();
