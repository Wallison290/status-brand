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

// Seção 04: destaque automático que percorre as soluções 1 → 2 → 3.
// Desktop/tablet: os 3 cards ficam visíveis e o destaque passa de um para o outro.
// Celular: carrossel de um card por vez que avança sozinho. Mouse em cima, toque ou foco pausam.
(() => {
  'use strict';
  const track = document.querySelector('.svc-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.svc-card')];
  const prev = document.querySelector('.svc-prev'), next = document.querySelector('.svc-next');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 760px)');
  const DELAY = 4500;
  track.style.setProperty('--svc-t', DELAY + 'ms');
  let active = 0, timer = 0, paused = false, visible = false;

  function show(i, fromScroll = false) {
    active = (i + cards.length) % cards.length;
    cards.forEach((c, k) => { c.classList.toggle('is-active', k === active); c.classList.remove('is-timing'); });
    if (mobile.matches && !fromScroll) track.scrollTo({ left: cards[active].offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    restart();
  }
  function restart() {
    clearTimeout(timer);
    if (reduce || paused || !visible) return;
    const card = cards[active];
    void card.offsetWidth; card.classList.add('is-timing'); // reinicia a barra de tempo
    timer = setTimeout(() => show(active + 1), DELAY);
  }
  const pause = on => { paused = on; if (on) { clearTimeout(timer); cards.forEach(c => c.classList.remove('is-timing')); } else restart(); };

  prev.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  cards.forEach((c, k) => c.addEventListener('mouseenter', () => { if (!mobile.matches) show(k); }));
  track.addEventListener('mouseenter', () => pause(true));
  track.addEventListener('mouseleave', () => pause(false));
  track.addEventListener('focusin', () => pause(true));
  track.addEventListener('focusout', () => pause(false));
  track.addEventListener('touchstart', () => pause(true), { passive: true });
  track.addEventListener('touchend', () => setTimeout(() => pause(false), 2500), { passive: true });
  // no celular, o card que para no centro depois de arrastar vira o ativo
  let st = 0;
  track.addEventListener('scroll', () => {
    if (!mobile.matches) return;
    clearTimeout(st);
    st = setTimeout(() => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      const k = cards.reduce((b, c, i) => Math.abs(c.offsetLeft - track.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[b].offsetLeft - track.offsetLeft + cards[b].offsetWidth / 2 - mid) ? i : b, 0);
      if (k !== active) show(k, true);
    }, 120);
  }, { passive: true });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? restart() : clearTimeout(timer); }, { threshold: 0.35 }).observe(track);
  show(0, true);
})();
