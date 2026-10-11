// Seção 03: a luz dentro de cada círculo acompanha o cursor.
(() => {
  'use strict';
  document.querySelectorAll('.eco3-circle').forEach(circle => {
    circle.addEventListener('pointermove', e => {
      const r = circle.getBoundingClientRect();
      circle.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      circle.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });
})();

// Seção 01: passar o mouse (ou focar) numa parte do anel escolhe o pilar e abre a seta com o card de informações.
(() => {
  'use strict';
  const symbol = document.querySelector('.hx6-symbol');
  if (!symbol) return;
  const open = index => symbol.querySelectorAll('.hx6-line, .hx6-call').forEach(el => el.classList.toggle('open', el.dataset.call === String(index)));
  const pick = index => {
    // a luz do núcleo se inclina na direção da parte escolhida
    const seg = symbol.querySelector(`.hx6-seg[data-seg="${index}"]`);
    if (seg) { symbol.style.setProperty('--cx', seg.style.getPropertyValue('--dx')); symbol.style.setProperty('--cy', seg.style.getPropertyValue('--dy')); }
    const button = symbol.querySelector(`.hx6-label[data-pillar="${index}"]`);
    if (button && button.getAttribute('aria-pressed') !== 'true') button.click();
    open(index);
  };
  symbol.querySelectorAll('.hx6-seg, .hx6-label, [data-part]').forEach(el => {
    const index = el.dataset.seg ?? el.dataset.pillar ?? el.dataset.part;
    el.addEventListener('mouseenter', () => pick(index));
    if (el.matches('.hx6-seg')) el.addEventListener('click', () => pick(index));
  });
  symbol.querySelectorAll('.hx6-label').forEach(button => {
    button.addEventListener('focus', () => open(button.dataset.pillar));
    button.addEventListener('blur', () => open(-1));
  });
  symbol.addEventListener('mouseleave', () => open(-1));
})();

// Seção 04: setas do carrossel de soluções (o trilho também rola com o dedo e a roda do mouse)
(() => {
  'use strict';
  const track = document.querySelector('.svc-track');
  if (!track) return;
  const prev = document.querySelector('.svc-prev'), next = document.querySelector('.svc-next');
  const stepSize = () => { const card = track.querySelector('.svc-card'); return card ? card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 20) : 300; };
  const update = () => {
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -stepSize() }));
  next.addEventListener('click', () => track.scrollBy({ left: stepSize() }));
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();
