/*
 * stamp.js — Reusable hover-to-stamp image effect
 *
 * Usage:
 * 1. Add a trigger element with id="wc-trigger"
 * 2. Add hidden images with class="wc-image":
 *    <img class="wc-image" src="..." style="display:none;">
 * 3. Add a stamp layer div: <div id="stamp-layer"></div>
 * 4. Include this script: <script src="stamp.js"></script>
 */

(function() {
  var trigger = document.getElementById('wc-trigger');
  var stampLayer = document.getElementById('stamp-layer');
  if (!trigger || !stampLayer) return;

  var srcs = Array.from(document.querySelectorAll('.wc-image')).map(function(img) { return img.src; });
  if (srcs.length === 0) return;

  /* Keep first stamp fixed, shuffle the rest */
  var rest = srcs.slice(1);
  for (var i = rest.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = rest[i]; rest[i] = rest[j]; rest[j] = tmp;
  }
  srcs.splice(1, rest.length, ...rest);

  var stampCount = 0, lastTrigger = 0, COOLDOWN = 300;
  var stampW = 320, stampH = 150, maxOverlapFraction = 0.30;
  var placedStamps = [];

  function overlapArea(ax, ay, bx, by) {
    var xO = Math.max(0, Math.min(ax + stampW, bx + stampW) - Math.max(ax, bx));
    var yO = Math.max(0, Math.min(ay + stampH, by + stampH) - Math.max(ay, by));
    return xO * yO;
  }

  function isValidPosition(x, y) {
    var area = stampW * stampH;
    for (var k = 0; k < placedStamps.length; k++) {
      if (overlapArea(x, y, placedStamps[k].x, placedStamps[k].y) / area > maxOverlapFraction) return false;
    }
    return true;
  }

  function findPosition() {
    var docH = document.body.scrollHeight;
    for (var a = 0; a < 100; a++) {
      var x = Math.random() * (window.innerWidth - stampW);
      var y = Math.random() * (docH - stampH);
      if (isValidPosition(x, y)) return { x: x, y: y };
    }
    return { x: Math.random() * (window.innerWidth - stampW), y: Math.random() * (docH - stampH) };
  }

  trigger.addEventListener('mouseenter', function() {
    if (stampCount >= srcs.length) return;
    var now = Date.now();
    if (now - lastTrigger < COOLDOWN) return;
    lastTrigger = now;

    stampLayer.style.height = document.body.scrollHeight + 'px';

    var stamp = document.createElement('img');
    stamp.src = srcs[stampCount];
    stamp.style.position = 'absolute';
    stamp.style.width = stampW + 'px';
    stamp.style.pointerEvents = 'none';
    var x, y;
    if (stampCount === 0) {
      var rect = trigger.getBoundingClientRect();
      x = rect.left + window.scrollX + rect.width / 2 - 160;
      y = rect.top + window.scrollY - 50;
    } else {
      var pos = findPosition();
      x = pos.x; y = pos.y;
    }
    placedStamps.push({ x: x, y: y });
    stamp.style.left = x + 'px';
    stamp.style.top = y + 'px';
    stampCount++;
    stampLayer.appendChild(stamp);
  });
})();
