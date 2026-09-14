'use strict';

// This demonstration uses fictional, undirected edges with nonnegative weights.
const demoEdges = [['A','B',3],['A','C',2],['B','D',2],['C','D',5],['C','E',9],['D','E',3]];
function shortestRoute(start, end, edges) {
  const nodes = new Set(edges.flatMap(([a,b]) => [a,b]));
  nodes.add(start); nodes.add(end);
  const remaining = new Set(nodes), distances = {}, previous = {};
  nodes.forEach(n => distances[n] = Infinity);
  distances[start] = 0;
  while (remaining.size) {
    let current = null;
    for (const n of remaining) if (current === null || distances[n] < distances[current]) current = n;
    if (!Number.isFinite(distances[current])) break;
    remaining.delete(current);
    if (current === end) break;
    for (const [a,b,weight] of edges) {
      const neighbor = a === current ? b : b === current ? a : null;
      if (neighbor === null || !remaining.has(neighbor)) continue;
      const candidate = distances[current] + weight;
      if (candidate < distances[neighbor]) { distances[neighbor] = candidate; previous[neighbor] = current; }
    }
  }
  if (!Number.isFinite(distances[end])) return {path:[], cost:Infinity};
  const path = [];
  for (let at = end; at !== undefined; at = previous[at]) path.unshift(at);
  return {path, cost:distances[end]};
}

if (typeof document !== 'undefined') {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('motion-toggle');
  let pauseRequested = false;
  function updateMotion() {
    const paused = pauseRequested || reducedMotion.matches;
    root.classList.toggle('motion-enabled', !paused);
    root.classList.toggle('motion-paused', paused);
    motionButton.hidden = reducedMotion.matches;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Enable motion' : 'Pause motion';
  }
  updateMotion();
  motionButton.addEventListener('click', () => { pauseRequested = !pauseRequested; updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);
  document.getElementById('year').textContent = new Date().getFullYear();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('arrived'); observer.unobserve(entry.target);
      }
    }, {threshold:0.08});
    document.querySelectorAll('.case, .experience-row, .about').forEach(el => observer.observe(el));
  }
  const explanations = {
    collect: 'Collect papers and source records while recording where each item came from and how it may be used.',
    structure: 'Extract text, tables, and formulas into structured content. Reliable extraction is an active focus of my work.',
    review: 'Retain source references so extractions and research claims can be checked before they inform later experiments.'
  };
  document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-stage]').forEach(b => {
      b.classList.toggle('selected', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    document.getElementById('stage-description').textContent = explanations[button.dataset.stage];
    document.querySelector('.argos-visual').dataset.current = button.dataset.stage;
  }));
  const scanButton = document.getElementById('scan-button');
  scanButton.addEventListener('click', () => {
    const panel = document.querySelector('.ocr-visual'), output = document.getElementById('extracted');
    scanButton.disabled = true;
    output.hidden = true;
    document.getElementById('scan-status').textContent = 'Illustrating the extraction step…';
    panel.classList.add('scanning');
    setTimeout(() => {
      output.hidden = false;
      panel.classList.remove('scanning');
      scanButton.disabled = false;
      scanButton.textContent = 'Replay the extraction ↗';
      document.getElementById('scan-status').textContent = 'The sample is now organized into fields. In the real workflow, extracted values still need review.';
    }, root.classList.contains('motion-paused') ? 0 : 1050);
  });
  function updateRoute() {
    const start = document.getElementById('route-start').value;
    const end = document.getElementById('route-end').value;
    const closed = document.getElementById('close-edge').checked;
    const edges = demoEdges.filter(([a,b]) => !(closed && a === 'B' && b === 'D'));
    const result = shortestRoute(start,end,edges);
    document.querySelectorAll('.edges path').forEach(p => p.classList.remove('active','closed'));
    document.getElementById('edge-BD').classList.toggle('closed',closed);
    for (let i=1; i<result.path.length; i++) {
      const a=result.path[i-1], b=result.path[i];
      (document.getElementById('edge-'+a+b) || document.getElementById('edge-'+b+a)).classList.add('active');
    }
    document.getElementById('route-result').textContent = result.path.length ? result.path.join(' → ')+' / Total weight: '+result.cost : 'No route available.';
  }
  ['route-start','route-end','close-edge'].forEach(id => document.getElementById(id).addEventListener('change',updateRoute));
  updateRoute();
}
if (typeof module !== 'undefined') module.exports = {shortestRoute, demoEdges};
