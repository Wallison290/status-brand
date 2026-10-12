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
