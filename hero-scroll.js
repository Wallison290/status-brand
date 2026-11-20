// Hero animado na rolagem (20/11/2026, no estilo da referência do Pinterest), versão curta:
// título → texto + "Ecossistema" → "Três frentes. Um ecossistema." com os 3 nomes → "Status Brand" + frase + botão,
// Computador: a seção fica presa durante as etapas. Celular: etapas empilhadas que entram ao aparecer na tela.
(() => {
  'use strict';
  const hx = document.querySelector('.hx');
  if (!hx || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const q = s => hx.querySelector(s);
  const mm = gsap.matchMedia();
  const vw = v => () => innerWidth * v / 100, vh = v => () => innerHeight * v / 100;

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    hx.classList.add('is-pin');
    gsap.set([q('.hx-2'), q('.hx-3'), q('.hx-5')], { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: hx, start: 'top top', end: '+=280%', pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true },
    });

    // fundo andando devagar o tempo todo (o S 3D é o foco)
    tl.to(q('.hx-s'), { scale: 1.12, rotation: 5, duration: 7, ease: 'none' }, 0)
      .to(q('.hx-fitas-a'), { x: vw(-3), y: vh(4), duration: 7, ease: 'none' }, 0)
      .to(q('.hx-fitas-b'), { x: vw(3), y: vh(-4), duration: 7, ease: 'none' }, 0)

    // 1 → 2
      .to(q('.hx-1'), { y: vh(-12), scale: .9, autoAlpha: 0, duration: .8 }, .2)
      .set(q('.hx-2'), { autoAlpha: 1 }, .8)
      .fromTo(q('.hx-lead'), { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: .8, ease: 'power3.out' }, .8)
      .fromTo(q('.hx-tag'), { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: .8, ease: 'power3.out' }, .9)
      .to(q('.hx-2'), { y: vh(-10), autoAlpha: 0, duration: .6 }, 2.1)

    // 3: frase + os 3 nomes, um depois do outro
      .fromTo(q('.hx-3'), { autoAlpha: 0, y: vh(6), scale: .94 }, { autoAlpha: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out' }, 2.5)
      .fromTo(gsap.utils.toArray('.hx-names > *', hx), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .12, duration: .5, ease: 'power3.out' }, 2.9)
      .to(q('.hx-3'), { y: vh(-10), autoAlpha: 0, duration: .6 }, 4.3)

    // 4: "Status Brand" + frase + botão, e a faixa de logos entra embaixo
      .fromTo(q('.hx-5'), { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: .9, ease: 'power3.out' }, 4.7)
      .to({}, { duration: .9 }, 6.1);

    return () => { hx.classList.remove('is-pin'); };
  });

  // celular / telas menores: cada etapa entra quando aparece
  mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
    [q('.hx-2'), q('.hx-3'), q('.hx-5')].forEach(el => gsap.from(el, {
      y: 50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' },
    }));
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
