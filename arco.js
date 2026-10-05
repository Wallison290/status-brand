// Carrossel em meia-lua: os cards giram em volta de um centro abaixo do palco.
// Gira sozinho, pausa com o mouse em cima e pode ser arrastado.
(() => {
  'use strict';
  const section = document.querySelector('.arc-section');
  if (!section) return;
  const stage = section.querySelector('.arc-stage');
  const orbit = section.querySelector('.arc-orbit');
  const content = section.querySelector('.arc-content');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // duplica o conjunto para fechar o círculo sem buracos; as cópias ficam fora da navegação por teclado
  const originals = [...orbit.children];
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    orbit.appendChild(clone);
  });
  const cards = [...orbit.children];
  const step = 360 / cards.length;

  let R = 700, cardH = 200;
  function layout() {
    const w = stage.clientWidth;
    R = Math.min(820, Math.max(380, w * 0.52));
    const cardW = Math.min(200, Math.max(96, R * 0.26));
    cardH = cardW * 1.05;
    section.style.setProperty('--R', R + 'px');
    section.style.setProperty('--card-w', cardW + 'px');
    section.style.setProperty('--card-h', cardH + 'px');
    // o palco precisa caber tanto o arco quanto o texto do meio
    const contentTop = content.offsetTop;
    stage.style.height = Math.max(R * 0.78 + cardH * 0.6, contentTop + content.offsetHeight + 40) + 'px';
  }

  let offset = 0;
  function place() {
    for (let i = 0; i < cards.length; i++) {
      let a = (i * step + offset) % 360;
      if (a > 180) a -= 360;
      if (a < -180) a += 360;
      const abs = Math.abs(a);
      const card = cards[i];
      card.style.setProperty('--a', a.toFixed(2) + 'deg');
      card.style.opacity = abs > 78 ? 0 : abs > 58 ? ((78 - abs) / 20).toFixed(3) : 1;
      card.style.visibility = abs > 78 ? 'hidden' : 'visible';
      card.style.zIndex = String(200 - Math.round(abs));
    }
  }

  // giro automático
  const SPEED = 4; // graus por segundo
  let speed = reduce ? 0 : SPEED, targetSpeed = speed, last = 0, raf = 0, running = false;
  function tick(t) {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    speed += (targetSpeed - speed) * 0.08;
    offset -= speed * dt;
    place();
    raf = requestAnimationFrame(tick);
  }
  function setRunning(on) {
    if (on && !running) { running = true; last = 0; raf = requestAnimationFrame(tick); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }

  stage.addEventListener('mouseenter', () => { targetSpeed = 0; });
  stage.addEventListener('mouseleave', () => { targetSpeed = reduce ? 0 : SPEED; });
  stage.addEventListener('focusin', () => { targetSpeed = 0; });
  stage.addEventListener('focusout', () => { targetSpeed = reduce ? 0 : SPEED; });

  // arrastar para girar
  let dragX = null, moved = 0;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.arc-content')) return;
    dragX = e.clientX; moved = 0;
    stage.classList.add('dragging');
  });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    dragX = e.clientX;
    moved += Math.abs(dx);
    offset += dx * (57.3 / R); // move o arco na mesma distância do dedo/mouse
    if (!running) place();
  });
  addEventListener('pointerup', () => { dragX = null; stage.classList.remove('dragging'); });
  // depois de arrastar, não abre o link do card
  stage.addEventListener('click', e => { if (moved > 6 && e.target.closest('.arc-card')) { e.preventDefault(); moved = 0; } }, true);

  layout();
  place();
  addEventListener('resize', () => { layout(); place(); });
  if (document.fonts) document.fonts.ready.then(layout);

  let visible = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    setRunning(visible && !document.hidden);
  }).observe(section);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
})();
