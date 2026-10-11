// Carrossel em cilindro visto por dentro (tela curva): os cards ficam na parede interna,
// a câmera fica perto da parede da frente. Gira sozinho e pode ser arrastado.
(() => {
  'use strict';
  const section = document.querySelector('.arc-section');
  if (!section) return;
  const stage = section.querySelector('.arc-stage');
  const ring = section.querySelector('.arc-ring');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // capas de site mostram o domínio na barra de navegador desenhada no CSS
  ring.querySelectorAll('a.arc-shot').forEach(a => { a.dataset.host = new URL(a.href).hostname.replace(/^www\./, ''); });

  // duplica o conjunto para fechar o cilindro sem buracos; as cópias ficam fora da navegação por teclado
  [...ring.children].forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    ring.appendChild(clone);
  });
  const cards = [...ring.children];
  const step = 360 / cards.length;

  // K: quanto a câmera avança para dentro do cilindro (fração do raio); P: perspectiva (fração do raio).
  // Com P - K negativo, os cards das bordas chegam perto da câmera e crescem, e os do centro ficam longe.
  // EDGE: ângulo do card que cai na borda do palco. No celular é menor: o cilindro fica maior e os cards também.
  // K_FULL é a curvatura final; arco-scroll.js anima K de mais aberto até ela conforme a seção entra na tela
  const K_FULL = 0.68, P = 0.5;
  const deg = Math.PI / 180;
  let K = K_FULL, R = 400, EDGE = 58, LIMIT = 64;
  function layout() {
    // no celular o cilindro é calculado para uma largura maior que a tela: cards grandes, pontas saindo pelas laterais
    const mobile = stage.clientWidth < 700;
    const W = stage.clientWidth * (mobile ? 1.9 : 1);
    [EDGE, LIMIT] = mobile ? [50, 60] : [58, 64];
    // o card no ângulo EDGE cai na borda do palco
    const d = P - K_FULL, sEdge = P / (d + Math.cos(EDGE * deg));
    R = W / (2 * Math.sin(EDGE * deg) * sEdge);
    const w = (2 * Math.PI * R / cards.length) * 0.84, h = w * 1.3;
    stage.style.setProperty('--P', (P * R).toFixed(1) + 'px');
    stage.style.setProperty('--w', w.toFixed(1) + 'px');
    stage.style.setProperty('--h', h.toFixed(1) + 'px');
    ring.style.setProperty('--R', R.toFixed(1) + 'px');
    // no celular os cards das pontas saem pela lateral, então o palco não precisa da altura deles
    stage.style.height = Math.round(h * P / (d + Math.cos(EDGE * deg)) * (mobile ? 0.8 : 1.08)) + 'px';
  }

  // só a posição da câmera muda com K (o raio fica fixo), então abrir a curva não mexe na altura do palco
  function applyK() { ring.style.transform = `translateZ(${(K * R).toFixed(1)}px)`; }

  let offset = 0, boost = 0;
  function place() {
    for (let i = 0; i < cards.length; i++) {
      let a = (i * step + offset) % 360;
      if (a > 180) a -= 360;
      if (a < -180) a += 360;
      const abs = Math.abs(a), card = cards[i];
      const show = abs <= LIMIT;
      card.style.visibility = show ? 'visible' : 'hidden';
      if (!show) continue;
      card.style.setProperty('--a', a.toFixed(2) + 'deg');
      card.style.setProperty('--dim', (0.55 * Math.max(0, 1 - abs / 45)).toFixed(3));
    }
  }

  const SPEED = 5; // graus por segundo
  let speed = reduce ? 0 : SPEED, targetSpeed = speed, last = 0, raf = 0, running = false;
  function tick(t) {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    speed += (targetSpeed - speed) * 0.08;
    offset -= (speed + boost) * dt;
    boost *= 0.94;
    place();
    raf = requestAnimationFrame(tick);
  }
  function setRunning(on) {
    if (on && !running) { running = true; last = 0; raf = requestAnimationFrame(tick); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }

  // só pausa quando alguém navega pelos cards com o teclado
  stage.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) targetSpeed = 0; });
  stage.addEventListener('focusout', () => { targetSpeed = reduce ? 0 : SPEED; });

  // arrastar para girar
  let dragX = null, moved = 0;
  stage.addEventListener('pointerdown', e => { dragX = e.clientX; moved = 0; stage.classList.add('dragging'); });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    dragX = e.clientX;
    moved += Math.abs(dx);
    offset += dx * (40 / stage.clientWidth) * 2;
    if (!running) place();
  });
  addEventListener('pointerup', () => { dragX = null; stage.classList.remove('dragging'); });
  // depois de arrastar, não abre o link do card
  stage.addEventListener('click', e => { if (moved > 6 && e.target.closest('.arc-card')) { e.preventDefault(); moved = 0; } }, true);

  layout();
  applyK();
  place();
  addEventListener('resize', () => { layout(); applyK(); place(); });

  // controles usados por arco-scroll.js (rolagem): curvatura e impulso no giro
  section.arcControl = {
    setOpen(v) { K = K_FULL * (0.55 + 0.45 * v); applyK(); if (!running) place(); },
    kick(v) { boost = Math.max(-40, Math.min(40, v)); },
  };

  let visible = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    setRunning(visible && !document.hidden);
  }).observe(section);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
})();
