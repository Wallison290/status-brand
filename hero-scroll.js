// Hero animado na rolagem (20/11/2026, no estilo da referência do Pinterest), versão curta:
// título → texto + "Ecossistema" → "Três frentes. Um ecossistema." com os 3 nomes → "Status Brand" + frase + botão,
// Computador: a seção fica presa durante as etapas. Celular: etapas empilhadas que entram ao aparecer na tela.
(() => {
  'use strict';
  const hx = document.querySelector('.hx');
  if (!hx || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // 22/11: em telas de toque (tablet/celular) a tela para onde o dedo parou: sem encaixe automático,
  // animação colada ao dedo e sem recalcular a página quando a barra do navegador aparece/some
  const TOQUE = matchMedia('(pointer: coarse)').matches || !matchMedia('(hover: hover)').matches;
  if (TOQUE) ScrollTrigger.config({ ignoreMobileResize: true });
  const q = s => hx.querySelector(s);
  const mm = gsap.matchMedia();
  const vw = v => () => innerWidth * v / 100, vh = v => () => innerHeight * v / 100;

  mm.add('(prefers-reduced-motion: no-preference)', () => { // 22/11: computador E celular
    hx.classList.add('is-pin');
    gsap.set([q('.hx-3'), q('.hx-5')], { autoAlpha: 0 });

    // o S sendo construído: quadros do vídeo do Flow (assets/hero/s) desenhados num canvas conforme a rolagem
    const canvas = q('.hx-film'), ctx = canvas.getContext('2d');
    const N = +canvas.dataset.frames || 0;
    const src = i => `assets/hero/s/${String(i + 1).padStart(3, '0')}.webp`;
    const imgs = [];
    let cur = 0;
    const ini = { a: 1 }; // opacidade do S pronto por cima no início
    const ok = im => im && im.complete && im.naturalWidth;
    const load = i => {
      if (imgs[i]) return imgs[i];
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { if (i === cur || i === N - 1) draw(); };
      im.src = src(i);
      return (imgs[i] = im);
    };
    // desenha o quadro atual; se ainda não chegou, usa o mais próximo que já carregou
    function draw() {
      let im = imgs[cur];
      if (!ok(im)) for (let d = 1; d < N; d++) { if (ok(imgs[cur - d])) { im = imgs[cur - d]; break; } if (ok(imgs[cur + d])) { im = imgs[cur + d]; break; } }
      if (!ok(im)) return;
      const cw = canvas.width, ch = canvas.height;
      // tela em pé (celular): o S cabe inteiro na largura; deitada: o vídeo cobre tudo
      const r = cw < ch ? Math.max(cw * 2 / im.naturalWidth, ch * .75 / im.naturalHeight) : Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * r, h = im.naturalHeight * r;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      // 22/11: no topo aparece o S pronto (último quadro); ao começar a rolar ele se dissolve e a construção começa
      const fim = imgs[N - 1];
      if (ini.a > 0 && ok(fim)) { ctx.globalAlpha = ini.a; ctx.drawImage(fim, (cw - w) / 2, (ch - h) / 2, w, h); ctx.globalAlpha = 1; }
    }
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };
    cur = 0;
    load(N - 1);
    load(0);
    let next = 0;
    const pump = () => { for (let k = 0; k < 10 && next < N; k++) load(next++); if (next < N) setTimeout(pump, 40); };
    setTimeout(pump, 200);
    addEventListener('resize', size);
    size();
    const film = { f: 0 }; // 22/11: começa no início do vídeo (só a névoa) e o S se forma com a rolagem

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: hx, start: 'top top', end: '+=110%', pin: true, scrub: TOQUE ? .12 : .3, anticipatePin: 1, invalidateOnRefresh: true,
        // cada gesto de rolagem leva para a próxima etapa
        // com a rolagem suave (Lenis) o encaixe é feito abaixo; sem ela, usa o snap do GSAP
        snap: (window.lenis || TOQUE) ? false : { snapTo: 'labelsDirectional', inertia: false, duration: { min: .25, max: .6 }, delay: .08, ease: 'power1.inOut' } },
    });

    // fundo andando devagar o tempo todo (o S 3D é o foco)
    const mostra = () => { const i = Math.round(film.f); if (i !== cur) { cur = i; load(i); draw(); } };
    tl.addLabel('inicio', 0)
      .to(film, { f: N - 1, duration: 3.6, ease: 'none', onUpdate: mostra }, 0)
      .to(ini, { a: 0, duration: .7, ease: 'power1.out', onUpdate: draw }, 0)
      .to(canvas, { scale: 1.08, duration: 3.6, ease: 'none' }, 0)
      .to(q('.hx-fitas-a'), { x: vw(-3), y: vh(4), duration: 3.6, ease: 'none' }, 0)
      .to(q('.hx-fitas-b'), { x: vw(3), y: vh(-4), duration: 3.6, ease: 'none' }, 0)

    // 22/11: sem a etapa do texto + "Ecossistema" (ele quer mais fluido): título → três frentes → Status Brand
      .to(q('.hx-1'), { y: vh(-12), scale: .9, autoAlpha: 0, duration: .8 }, .2)
      .fromTo(q('.hx-3'), { autoAlpha: 0, y: vh(6), scale: .94 }, { autoAlpha: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out' }, .8)
      .fromTo(gsap.utils.toArray('.hx-names > *', hx), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .12, duration: .5, ease: 'power3.out' }, 1.1)
      .addLabel('frentes', 1.9)
      .to(q('.hx-3'), { y: vh(-10), autoAlpha: 0, duration: .5 }, 2.2)
      .fromTo(q('.hx-5'), { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: .9, ease: 'power3.out' }, 2.7)
      .addLabel('fim', 3.6);

    // encaixe por etapa com o Lenis: parou de rolar dentro da capa, segue até a próxima etapa na direção do gesto
    if (window.lenis) {
      const st = tl.scrollTrigger, lenis = window.lenis;
      let espera, dir = 1;
      lenis.on('scroll', e => {
        if (e.direction) dir = e.direction;
        clearTimeout(espera);
        espera = setTimeout(() => {
          const y = lenis.scroll, a = st.start, b = st.end;
          if (y <= a + 2 || y >= b - 2) return;
          const marcas = Object.values(tl.labels).map(t => a + (b - a) * (t / tl.duration())).sort((m, n) => m - n);
          if (marcas.some(m => Math.abs(m - y) < 3)) return;
          const alvo = dir > 0 ? marcas.find(m => m > y) : [...marcas].reverse().find(m => m < y);
          if (alvo !== undefined) lenis.scrollTo(alvo, { duration: .7, easing: t => 1 - Math.pow(1 - t, 3) });
        }, 90);
      });
    }

    return () => { hx.classList.remove('is-pin'); removeEventListener('resize', size); };
  });


  addEventListener('load', () => ScrollTrigger.refresh());
})();
