// Seção 04 (método): desenha as conexões entre a logo central e cada pilar.
(() => {
  'use strict';
  const mx = document.querySelector('.mx');
  if (!mx) return;
  const svg = mx.querySelector('.mx-lines'), core = mx.querySelector('.mx-core');
  const nodes = [...mx.querySelectorAll('.mx-node')];
  const NS = 'http://www.w3.org/2000/svg';
  function draw() {
    svg.innerHTML = '';
    if (getComputedStyle(svg).display === 'none') return;
    const box = mx.getBoundingClientRect(), c = core.getBoundingClientRect();
    const cx = c.left + c.width / 2 - box.left, cy = c.top + c.height / 2 - box.top;
    nodes.forEach(node => {
      const r = node.getBoundingClientRect();
      const ny = r.top + r.height / 2 - box.top;
      let d;
      if (r.top > c.bottom) {
        // pilar de baixo: desce da logo até o topo do card
        d = `M${cx} ${c.bottom - box.top} V${r.top - box.top}`;
      } else {
        // pilares laterais: sai da lateral da logo, faz um cotovelo e entra no card
        const left = r.right < c.left;
        const sx = left ? c.left - box.left : c.right - box.left;
        const ex = left ? r.right - box.left : r.left - box.left;
        const mid = (sx + ex) / 2;
        d = `M${sx} ${cy} H${mid} V${ny} H${ex}`;
      }
      ['base', 'flow'].forEach(cls => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d);
        p.setAttribute('class', cls);
        svg.appendChild(p);
      });
    });
  }
  draw();
  addEventListener('resize', draw);
  if (document.fonts) document.fonts.ready.then(draw);
  new ResizeObserver(draw).observe(mx);
})();

// Seção 06 (cases): o card em foco abre; a estrutura já aceita vídeo (data-video no .cv-item) com reprodução em modal.
(() => {
  'use strict';
  const list = document.querySelector('.cv-list');
  if (!list) return;
  const items = [...list.querySelectorAll('.cv-item')];
  const activate = item => items.forEach(i => i.classList.toggle('is-active', i === item));
  items.forEach(item => {
    item.addEventListener('mouseenter', () => activate(item));
    item.addEventListener('focus', () => activate(item));
    item.addEventListener('click', e => { if (!e.target.closest('a,button')) activate(item); });
  });

  const dialog = document.getElementById('cv-dialog');
  const video = dialog && dialog.querySelector('video');
  items.filter(i => i.dataset.video).forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'cv-play';
    btn.type = 'button';
    btn.innerHTML = 'Assistir <span aria-hidden="true">▶</span>';
    btn.setAttribute('aria-label', 'Assistir vídeo do case ' + item.querySelector('h3').textContent);
    item.querySelector('.cv-card h3').after(btn);
    btn.addEventListener('click', () => {
      // carrega o vídeo só quando a pessoa pede; sem autoplay com som
      video.src = item.dataset.video;
      if (item.dataset.poster) video.poster = item.dataset.poster;
      dialog.showModal();
      video.play().catch(() => {});
    });
  });
  if (dialog) {
    // ao fechar por qualquer caminho (botão, Esc ou clique fora), o vídeo para e descarrega
    dialog.addEventListener('close', () => { video.pause(); video.removeAttribute('src'); video.load(); });
    dialog.querySelector('.cv-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  }
})();

// Seção 03: esteira de imagens. A cada passo, a imagem do card grande desce para o próximo card,
// a do quinto some e uma nova entra no card grande. Ao fim da lista, a sequência recomeça.
(() => {
  'use strict';
  const stage = document.querySelector('.lt-stage');
  if (!stage) return;
  const slots = [stage.querySelector('.lt-slot-hero'), ...stage.querySelectorAll('.lt-row .lt-slot')];
  const cards = [...stage.querySelectorAll('.lt-card')];
  const S = slots.length, N = cards.length;
  if (N < S + 1) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = 0, timer = null, visible = false, hover = false;

  const rectOf = el => {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  };
  const place = (card, r, scale = 1) => {
    card.style.width = r.w + 'px';
    card.style.height = r.h + 'px';
    card.style.transform = `translate(${r.x}px, ${r.y}px) scale(${scale})`;
  };
  // card que ocupa o slot i no passo t
  const at = (t, i) => ((t - i) % N + N) % N;

  function layout(instant) {
    const rects = slots.map(rectOf);
    const shown = new Set(slots.map((_, i) => at(step, i)));
    cards.forEach((c, k) => {
      if (shown.has(k)) return;
      c.classList.remove('is-in', 'is-hero');
      c.setAttribute('tabindex', '-1'); c.setAttribute('aria-hidden', 'true');
    });
    for (let i = 0; i < S; i++) {
      const c = cards[at(step, i)];
      if (instant) c.classList.add('no-anim');
      place(c, rects[i]);
      c.classList.add('is-in');
      c.classList.toggle('is-hero', i === 0);
      c.removeAttribute('tabindex'); c.removeAttribute('aria-hidden');
    }
    if (instant) { stage.offsetWidth; cards.forEach(c => c.classList.remove('no-anim')); }
  }

  function advance() {
    const rects = slots.map(rectOf);
    const leaving = cards[at(step, S - 1)];
    const entering = cards[at(step + 1, 0)];
    // a que sai encolhe e some no lugar do quinto card
    place(leaving, rects[S - 1], .86);
    // a que entra nasce já no card grande, um pouco ampliada, e assenta
    entering.classList.add('no-anim');
    place(entering, rects[0], 1.06);
    entering.offsetWidth;
    entering.classList.remove('no-anim');
    step++;
    layout(false);
  }

  const run = () => {
    clearInterval(timer); timer = null;
    if (!reduced && visible && !hover && !document.hidden) timer = setInterval(advance, 3000);
  };

  layout(true);
  new ResizeObserver(() => layout(true)).observe(stage);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }, { threshold: .2 }).observe(stage);
  stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; run(); } });
  stage.addEventListener('pointerleave', () => { hover = false; run(); });
  stage.addEventListener('focusin', () => { hover = true; run(); });
  stage.addEventListener('focusout', () => { hover = false; run(); });
  document.addEventListener('visibilitychange', run);
})();
