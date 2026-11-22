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

// Seção 04: cada pilar abre ao clicar/tocar no título (no desktop também abre com o mouse, via CSS).
// No celular vira linha do tempo: a barra enche conforme a rolagem e o pilar abre quando ela chega no ponto dele.
(() => {
  'use strict';
  const mx = document.querySelector('.mx');
  if (!mx) return;
  const nodes = [...mx.querySelectorAll('.mx-node')];
  const track = mx.querySelector('.mx-track');
  const mobile = matchMedia('(max-width: 900px)');

  const setOpen = (node, open) => {
    node.classList.toggle('is-open', open);
    node.querySelector('.mx-head button').setAttribute('aria-expanded', String(open));
  };
  nodes.forEach(node => {
    node.querySelector('.mx-head button').addEventListener('click', () => {
      const open = !node.classList.contains('is-open');
      if (!mobile.matches) nodes.forEach(n => n !== node && setOpen(n, false));
      setOpen(node, open);
    });
  });
  document.addEventListener('click', e => {
    if (!mobile.matches && !mx.contains(e.target)) nodes.forEach(n => setOpen(n, false));
  });

  let ticking = false, busy = false;
  function update() {
    ticking = false;
    if (!mobile.matches) return;
    const box = mx.getBoundingClientRect();
    const dot = n => n.getBoundingClientRect().top + 32 - box.top;  // centro do ponto do pilar
    const start = dot(nodes[0]), end = dot(nodes[nodes.length - 1]);
    track.style.top = start + 'px';
    track.style.height = (end - start) + 'px';
    const line = innerHeight * .62 - box.top;                       // "agulha" a 62% da altura da tela
    track.style.setProperty('--fill', Math.max(0, Math.min(end - start, line - start)) + 'px');
    // abre um pilar por vez: espera o anterior terminar de abrir (ele empurra os de baixo) antes de checar o próximo
    if (busy) return;
    const next = nodes.find(n => !n.classList.contains('is-on'));
    if (next && dot(next) <= line) {
      next.classList.add('is-on'); setOpen(next, true);
      busy = true;
      setTimeout(() => { busy = false; queue(); }, 520);
    }
  }
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  mobile.addEventListener('change', () => {
    nodes.forEach(n => { n.classList.remove('is-on'); setOpen(n, false); });
    queue();
  });
  new ResizeObserver(queue).observe(mx);
  queue();
})();

// Seção 05 (ecossistema): um arco abraça o círculo do S e cada frente se liga, por uma linha parada, a um ponto desse arco.
(() => {
  'use strict';
  const stage = document.querySelector('.ec-stage');
  if (!stage) return;
  const svg = stage.querySelector('.ec-lines'), hub = stage.querySelector('.ec-hub');
  const ports = [...stage.querySelectorAll('.ec-port')];
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return svg.appendChild(n);
  };
  function draw() {
    svg.innerHTML = '';
    if (getComputedStyle(svg).display === 'none') return;
    const box = stage.getBoundingClientRect(), h = hub.getBoundingClientRect();
    const cx = h.left + h.width / 2 - box.left, cy = h.top + h.height / 2 - box.top;
    const ys = ports.map(n => { const r = n.getBoundingClientRect(); return { x: r.right - box.left, y: r.top + r.height / 2 - box.top }; });
    const span = Math.max(...ys.map(p => Math.abs(p.y - cy)));
    const R = Math.max(h.width / 2 + 46, span + 36);              // o arco sempre passa por fora do círculo e alcança todas as frentes
    const pt = a => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    const angles = ys.map(p => Math.PI - Math.asin(Math.max(-1, Math.min(1, (p.y - cy) / R))));
    const a0 = Math.max(...angles) + .38, a1 = Math.min(...angles) - .38;  // passa um pouco das pontas, como na referência
    const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
    el('path', { class: 'arc', d: `M${x0} ${y0} A${R} ${R} 0 0 0 ${x1} ${y1}` });
    [pt(a0), pt(a1)].forEach(([x, y]) => el('circle', { class: 'dot end', cx: x, cy: y, r: 4 }));
    ys.forEach((p, i) => {
      const [dx, dy] = pt(angles[i]);
      const d = `M${p.x} ${p.y} H${dx}`;
      el('path', { class: 'link', d });
      el('circle', { class: 'dot', cx: dx, cy: dy, r: 6 });
    });
  }
  draw();
  addEventListener('resize', draw);
  if (document.fonts) document.fonts.ready.then(draw);
  new ResizeObserver(draw).observe(stage);
})();

// 20/11: esteira automática. Duplica os itens do trilho e o faz andar devagar da direita para a esquerda, sem fim.
// A pessoa ainda pode arrastar/rolar para os lados; o mouse em cima ou o toque pausam e depois ela volta a andar.
const autoRoll = (track, speed = 30) => {
  if (!track || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (track.scrollWidth <= track.clientWidth + 2) return null; // tudo cabe na tela: não precisa andar
  const originals = [...track.children];
  originals.forEach(el => {
    const c = el.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.classList.add('is-clone');
    c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    c.querySelectorAll('[data-count]').forEach(x => x.removeAttribute('data-count'));
    c.querySelectorAll('a,button,[tabindex]').forEach(x => x.setAttribute('tabindex', '-1'));
    track.appendChild(c);
  });
  track.classList.add('is-rolling');
  const period = () => track.children[originals.length].offsetLeft - track.children[0].offsetLeft;
  let pos = track.scrollLeft, last = 0, holdUntil = 0, visible = false;
  const hold = ms => { holdUntil = performance.now() + ms; };
  const frame = t => {
    requestAnimationFrame(frame);
    const dt = last ? Math.min(t - last, 50) : 0; last = t;
    if (!visible || document.hidden || t < holdUntil) return;
    pos += speed * dt / 1000;
    const p = period();
    if (pos >= p) pos -= p;
    track.scrollLeft = pos;
  };
  // rolagem feita pela pessoa: a esteira continua dali, e dá a volta nas pontas
  track.addEventListener('scroll', () => {
    if (Math.abs(track.scrollLeft - pos) < 2) return;
    const p = period();
    pos = track.scrollLeft;
    if (pos >= p) { pos -= p; track.scrollLeft = pos; }
    else if (pos <= 0) { pos += p; track.scrollLeft = pos; }
  }, { passive: true });
  track.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hold(1e9); });
  track.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hold(500); });
  track.addEventListener('touchstart', () => hold(1e9), { passive: true });
  track.addEventListener('touchend', () => hold(2500), { passive: true });
  track.addEventListener('wheel', () => hold(2500), { passive: true });
  track.addEventListener('focusin', () => hold(1e9));
  track.addEventListener('focusout', () => hold(500));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: .1 }).observe(track);
  requestAnimationFrame(frame);
  return { hold, goTo: el => { pos = el.offsetLeft - track.children[0].offsetLeft; track.scrollLeft = pos; } };
};

// 20/11: Cases em vídeo. A esteira passa sozinha; o nome em destaque acompanha o vídeo que está na frente;
// clicar no nome leva até o vídeo; tocar no vídeo abre a versão completa com som.
(() => {
  'use strict';
  const box = document.querySelector('.cs');
  if (!box) return;
  const names = [...box.querySelectorAll('.cs-name')];
  const track = box.querySelector('.cs-track');
  const roll = autoRoll(track, 32);
  const cards = [...track.querySelectorAll('.cs-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mark = i => names.forEach((n, k) => { n.classList.toggle('is-active', k === i); n.setAttribute('aria-pressed', k === i); });
  // o vídeo mais à esquerda (inteiro na tela) define o nome em destaque
  let ticking = false;
  const sync = () => {
    ticking = false;
    const left = track.getBoundingClientRect().left;
    let best = cards[0], d = Infinity;
    cards.forEach(c => { const x = Math.abs(c.getBoundingClientRect().left - left - 8); if (x < d) { d = x; best = c; } });
    mark(+best.dataset.i);
  };
  track.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  mark(0);

  names.forEach((n, i) => n.addEventListener('click', () => {
    const target = cards.find(c => +c.dataset.i === i && !c.classList.contains('is-clone'));
    if (roll) { roll.goTo(target); roll.hold(4000); }
    else track.scrollTo({ left: target.offsetLeft - track.children[0].offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    mark(i);
  }));

  // vídeo curto: só carrega e toca quando está visível
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else v.pause();
    }), { threshold: .2 });
    cards.forEach(c => io.observe(c.querySelector('video')));
  }

  const dialog = document.getElementById('cv-dialog');
  if (!dialog) return;
  const video = dialog.querySelector('video');
  dialog.addEventListener('close', () => { video.pause(); video.removeAttribute('src'); video.load(); });
  dialog.querySelector('.cv-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  track.addEventListener('click', e => {
    const c = e.target.closest('.cs-card');
    if (!c || !e.target.closest('.cs-media')) return;
    if (roll) roll.hold(1e9);
    video.src = c.dataset.video;
    video.poster = c.dataset.poster || '';
    dialog.classList.toggle('is-wide', c.dataset.wide === '1');
    dialog.showModal();
    video.play().catch(() => {});
  });
  dialog.addEventListener('close', () => { if (roll) roll.hold(800); });
})();

// 20/11: Números contam até o valor quando o painel aparece
(() => {
  'use strict';
  const els = [...document.querySelectorAll('.rs [data-count]')];
  if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const fmt = el => n => (el.dataset.prefix || '') + n + (el.dataset.suffix || '');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, f = fmt(el), t0 = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = f(Math.max(1, Math.round(to * ease)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  els.forEach(el => io.observe(el));
})();

// 20/11: carrossel de um cartão por vez, em loop infinito: desliza um cartão, o que saiu vai para o fim da fila.
// Só anda quando os cartões não cabem todos na tela (no computador os 3 cartões de números ficam parados).
function stepLoop(track, ms) {
  if (!track || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let parado = false, visivel = false;
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const passo = () => {
    if (parado || !visivel || document.hidden || track.scrollWidth <= track.clientWidth + 2) return;
    const first = track.firstElementChild, w = first.getBoundingClientRect().width + gap();
    track.classList.add('is-rolling');
    track.scrollTo({ left: track.scrollLeft + w, behavior: 'smooth' });
    setTimeout(() => { track.appendChild(first); track.scrollLeft -= w; }, 750);
  };
  setInterval(passo, ms);
  track.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') parado = true; });
  track.addEventListener('pointerleave', () => { parado = false; });
  track.addEventListener('touchstart', () => { parado = true; }, { passive: true });
  track.addEventListener('touchend', () => setTimeout(() => { parado = false; }, 2500), { passive: true });
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: .3 }).observe(track);
}
stepLoop(document.querySelector('.rs-fotos'), 2600);

// 20/11: esteiras automáticas do portfólio e dos vídeos de resultados (no celular)
autoRoll(document.getElementById('pf-track'), 34);
if (matchMedia('(max-width: 900px)').matches) autoRoll(document.querySelector('.fb-reels'), 28); // no computador fica o leque parado

// 20/11: Nossos Clientes, carrossel de conversas (meio grande, vizinhos menores).
// Troca sozinho a cada 5 s; dá para arrastar para os lados ou tocar nas bolinhas. Mouse em cima ou foco pausam.
(() => {
  'use strict';
  const stage = document.querySelector('.nc-stage');
  if (!stage) return;
  const track = stage.querySelector('.nc-track');
  const slides = [...track.querySelectorAll('.nc-slide')];
  const dots = [...stage.querySelectorAll('.nc-dot')];
  const N = slides.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer = null, paused = false, visible = false;

  const show = i => {
    cur = (i + N) % N;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === cur);
      s.classList.toggle('is-prev', k === (cur - 1 + N) % N);
      s.classList.toggle('is-next', k === (cur + 1) % N);
      s.setAttribute('aria-hidden', k === cur ? 'false' : 'true');
    });
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === cur); d.setAttribute('aria-current', k === cur); });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => { stop(); if (!reduced && !paused && visible && !document.hidden) timer = setInterval(() => show(cur + 1), 5000); };
  const go = i => { show(i); play(); };

  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  slides.forEach((s, k) => s.addEventListener('click', () => { if (k !== cur) go(k); }));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });

  // arrastar com o dedo ou o mouse
  let x0 = null;
  track.addEventListener('pointerdown', e => { x0 = e.clientX; });
  track.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
  });

  stage.addEventListener('mouseenter', () => { paused = true; stop(); });
  stage.addEventListener('mouseleave', () => { paused = false; play(); });
  stage.addEventListener('focusin', () => { paused = true; stop(); });
  stage.addEventListener('focusout', () => { paused = false; play(); });
  document.addEventListener('visibilitychange', play);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }, { threshold: .3 }).observe(stage);
  } else { visible = true; play(); }
  show(0);
})();

// 21/11: Serviços em abas verticais. Passar o mouse (ou tocar) abre uma aba e fecha as outras; uma fica sempre aberta.
(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('.sv-tab')];
  if (!tabs.length) return;
  const abre = t => tabs.forEach(x => {
    const on = x === t;
    x.classList.toggle('is-open', on);
    x.querySelector('.sv-head').setAttribute('aria-expanded', String(on));
  });
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  tabs.forEach(t => {
    // só abre quando o mouse se mexe em cima da aba (se abrisse ao "entrar", a troca de largura das abas faria o mouse cair em outra e ficar trocando sozinho)
    t.addEventListener('pointermove', e => { if (mouse.matches && e.pointerType === 'mouse' && (e.movementX || e.movementY) && !t.classList.contains('is-open')) abre(t); });
    t.querySelector('.sv-head').addEventListener('click', () => abre(t));
    t.addEventListener('focusin', () => abre(t));
  });
})();

// 21/11: crachá dos Serviços inclina acompanhando o mouse (o balanço da fita é CSS)
(() => {
  'use strict';
  const area = document.querySelector('.cr');
  const card = area && area.querySelector('.cr-cartao');
  if (!card || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  area.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
    card.style.setProperty('--ry', (x * 18).toFixed(1) + 'deg');
    card.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
  });
  area.addEventListener('pointerleave', () => { card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
})();

// 21/11: Portfólio, as abas filtram os cards (Todos, Redes sociais, Identidade visual, Sites e páginas)
(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('.pt-tabs button')];
  const cards = [...document.querySelectorAll('.pt-card')];
  if (!tabs.length) return;
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    const f = b.dataset.f;
    cards.forEach(c => {
      const mostra = f === 'todos' || c.dataset.cat === f;
      c.hidden = !mostra;
      if (mostra) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; }
    });
  }));
})();

// 21/11: Portfólio em blocos alternados. Cada linha tem um card grande (3/5) e um pequeno (2/5), invertendo a cada linha.
// A imagem mais "deitada" da dupla vai para o espaço grande; se o formato não combinar com o espaço, ela aparece inteira sobre fundo lilás.
(() => {
  'use strict';
  const grid = document.querySelector('.pt-grid');
  if (!grid) return;
  const desk = matchMedia('(min-width: 701px)');
  const ratio = c => { const i = c.querySelector('img'); return i ? (+i.getAttribute('width') || 4) / (+i.getAttribute('height') || 5) : .8; };
  const montar = () => {
    const cards = [...grid.querySelectorAll('.pt-card')];
    cards.forEach(c => { c.classList.remove('pt-g', 'pt-cheio'); c.style.order = ''; const i = c.querySelector('img'); if (i) i.classList.remove('pt-contem'); });
    if (!desk.matches) return;
    const vis = cards.filter(c => !c.hidden);
    for (let k = 0; k < vis.length; k += 2) {
      const a = vis[k], b = vis[k + 1], linha = k / 2;
      if (!b) { a.classList.add('pt-cheio'); a.style.order = k; continue; }
      const grande = ratio(a) >= ratio(b) ? a : b, pequeno = grande === a ? b : a;
      grande.classList.add('pt-g');
      const grandePrimeiro = linha % 2 === 0;
      grande.style.order = grandePrimeiro ? k : k + 1;
      pequeno.style.order = grandePrimeiro ? k + 1 : k;
    }
    requestAnimationFrame(() => vis.forEach(c => {
      const i = c.querySelector('img'); if (!i || !i.clientHeight) return;
      const caixa = i.clientWidth / i.clientHeight, r = ratio(c);
      if (Math.abs(r - caixa) / caixa > .22) i.classList.add('pt-contem');
    }));
  };
  montar();
  document.querySelectorAll('.pt-tabs button').forEach(b => b.addEventListener('click', () => setTimeout(montar, 0)));
  desk.addEventListener('change', montar);
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(montar, 150); });
})();

// 21/11: Equipe, as abas filtram por frente (Status Brand, Media, Academy)
(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('.eq-tabs button')];
  const cards = [...document.querySelectorAll('.eq-card')];
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    cards.forEach(c => { const m = b.dataset.f === 'todos' || c.dataset.f === b.dataset.f; c.hidden = !m; if (m) { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; } });
  }));
})();

// 21/11: todo botão "Vamos conversar / Quero ser o próximo" leva ao formulário de diagnóstico (no lugar da janela antiga)
document.addEventListener('click', e => {
  const b = e.target.closest('[data-contact]');
  const f = document.getElementById('diagnostico');
  if (!b || !f) return;
  e.preventDefault(); e.stopPropagation();
  f.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}, true);

// 21/11: Diagnóstico. Monta a mensagem com as respostas e abre o WhatsApp da Status.
// WHATSAPP: colocar o número da Status só com dígitos, com 55 e DDD (ex.: '5511999999999').
(() => {
  'use strict';
  const WHATSAPP = '';
  const form = document.getElementById('dg-form');
  if (!form) return;
  const status = form.querySelector('.dg-status');
  const tel = form.elements.whatsapp;
  tel.addEventListener('input', () => {
    const d = tel.value.replace(/[^0-9]/g, '').slice(0, 11);
    tel.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const obrig = ['nome', 'email', 'whatsapp'].map(n => form.elements[n]);
    let ok = true;
    obrig.forEach(i => { const bom = i.checkValidity() && i.value.trim(); i.classList.toggle('is-erro', !bom); if (!bom) ok = false; });
    if (!ok) { status.textContent = 'Preencha nome, e-mail e WhatsApp para enviar.'; obrig.find(i => i.classList.contains('is-erro')).focus(); return; }
    const v = n => form.elements[n].value.trim();
    const servicos = [...form.querySelectorAll('input[name="servicos"]:checked')].map(i => i.value).join(', ') || 'Não informado';
    const prazo = (form.querySelector('input[name="prazo"]:checked') || {}).value || 'Não informado';
    const texto = [
      'Olá, equipe Status! Quero solicitar um orçamento.', '',
      `Nome: ${v('nome')}`, `E-mail: ${v('email')}`, `WhatsApp: ${v('whatsapp')}`,
      v('empresa') && `Empresa: ${v('empresa')}`,
      `Serviços: ${servicos}`, `Prazo: ${prazo}`,
      v('sobre') && `Sobre o negócio: ${v('sobre')}`
    ].filter(x => x !== '' && x !== undefined && x !== false).join('\n');
    if (WHATSAPP) {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      status.textContent = 'Abrimos o WhatsApp com as suas respostas. É só enviar a mensagem.';
    } else {
      try { await navigator.clipboard.writeText(texto); status.textContent = 'Suas respostas foram copiadas. Em breve este formulário envia direto para a equipe Status.'; }
      catch { status.textContent = 'Em breve este formulário envia direto para a equipe Status.'; }
    }
  });
})();
