// Hero "filme na rolagem" (20/11/2026). O filme (4 vídeos do Veo emendados) virou uma sequência de quadros
// em assets/hero/d (computador) e assets/hero/m (celular). A seção fica presa enquanto a rolagem avança o filme
// quadro a quadro num <canvas>; os textos de cada pilar entram por cima na cena dele.
// Com animação desligada no aparelho: fica o último quadro parado (CSS) e os textos empilhados.
(() => {
  'use strict';
  const hx = document.querySelector('.hx');
  if (!hx || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const q = s => hx.querySelector(s);
  const canvas = q('.hx-film');
  const ctx = canvas.getContext('2d');
  const mm = gsap.matchMedia();

  mm.add({ desk: '(min-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' }, c => {
    if (!c.conditions.motion) return;
    const kind = c.conditions.desk ? 'd' : 'm';
    const N = +canvas.dataset[kind === 'd' ? 'framesD' : 'framesM'] || 0;
    if (!N) return;
    hx.classList.add('is-pin');

    const src = i => `assets/hero/${kind}/${String(i + 1).padStart(4, '0')}.webp`;
    const imgs = new Array(N);
    let cur = 0, alive = true;
    const ok = im => im && im.complete && im.naturalWidth;
    const load = i => {
      if (imgs[i]) return imgs[i];
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { if (alive && i === cur) draw(); };
      im.src = src(i);
      return (imgs[i] = im);
    };
    // desenha o quadro atual; se ainda não chegou, usa o mais próximo que já carregou
    function draw() {
      let im = imgs[cur];
      if (!ok(im)) for (let d = 1; d < N; d++) { if (ok(imgs[cur - d])) { im = imgs[cur - d]; break; } if (ok(imgs[cur + d])) { im = imgs[cur + d]; break; } }
      if (!ok(im)) return;
      const cw = canvas.width, ch = canvas.height, r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * r, h = im.naturalHeight * r;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };
    // primeiro quadro na hora; o resto em lotes pequenos para não travar a página
    load(0);
    let next = 1;
    const pump = () => { if (!alive) return; for (let k = 0; k < 8 && next < N; k++) load(next++); if (next < N) setTimeout(pump, 50); };
    setTimeout(pump, 300);

    const state = { f: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: hx, start: 'top top', end: kind === 'd' ? '+=350%' : '+=300%', pin: true, scrub: .4, anticipatePin: 1, invalidateOnRefresh: true },
    });
    tl.to(state, { f: N - 1, duration: 10, ease: 'none', onUpdate: () => {
      const i = Math.round(state.f);
      if (i !== cur) { cur = i; load(i); draw(); }
    } }, 0);

    // textos: cada vídeo ocupa ~2,5 da linha do tempo; o pilar aparece quando a cena dele chega
    const p1 = q('.hx-p1'), p2 = q('.hx-p2'), p3 = q('.hx-p3'), fim = q('.hx-end');
    tl.to(q('.hx-1'), { autoAlpha: 0, y: -40, duration: .8, ease: 'power2.in' }, .3)
      .fromTo(p1, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .6 }, 1.8)
      .to(p1, { autoAlpha: 0, y: -30, duration: .5, ease: 'power2.in' }, 3.6)
      .fromTo(p2, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .6 }, 4.3)
      .to(p2, { autoAlpha: 0, y: -30, duration: .5, ease: 'power2.in' }, 6.1)
      .fromTo(p3, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .6 }, 6.8)
      .to(p3, { autoAlpha: 0, y: -30, duration: .5, ease: 'power2.in' }, 8.5)
      .fromTo(fim, { autoAlpha: 0, scale: .96 }, { autoAlpha: 1, scale: 1, duration: .7 }, 9.1)
      .to({}, { duration: .5 }, 9.8);

    addEventListener('resize', size);
    size();
    return () => { alive = false; hx.classList.remove('is-pin'); removeEventListener('resize', size); };
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
