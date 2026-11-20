// Hero "filme na rolagem" (20/11/2026). No computador com animação ligada, a seção fica presa
// e as etapas trocam conforme a rolagem: título → texto → "Três frentes" com os cartões voando em volta
// → cartões lado a lado → "Status Brand" gigante. No celular ou sem animação, fica tudo empilhado (CSS).
(() => {
  'use strict';
  const hx = document.querySelector('.hx');
  if (!hx || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const q = s => hx.querySelector(s);
  const cards = gsap.utils.toArray('.hx-card', hx);
  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    hx.classList.add('is-pin');
    const vw = v => () => innerWidth * v / 100, vh = v => () => innerHeight * v / 100;
    // posições "em órbita" em volta do título (relativas à posição final de cada cartão na grade)
    const orbit = [
      { x: vw(-4), y: vh(-30), rotation: -8, scale: .86 },
      { x: vw(30), y: vh(6), rotation: 7, scale: .86 },
      { x: vw(-50), y: vh(26), rotation: -5, scale: .86 },
    ];
    const fora = [
      { x: vw(-60), y: vh(-80), rotation: -25 },
      { x: vw(70), y: vh(10), rotation: 25 },
      { x: vw(-90), y: vh(80), rotation: -20 },
    ];

    gsap.set([q('.hx-2'), q('.hx-3'), q('.hx-cards'), q('.hx-5')], { autoAlpha: 0 });
    gsap.set(q('.hx-cards'), { autoAlpha: 1 });
    cards.forEach((c, i) => gsap.set(c, { ...fora[i], autoAlpha: 0 }));

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: hx, start: 'top top', end: '+=480%', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
    });

    // fundo anda o filme todo
    tl.to(q('.hx-s'), { scale: 1.35, rotation: 8, opacity: .25, duration: 10, ease: 'none' }, 0)
      .to(q('.hx-fitas-a'), { x: vw(-6), y: vh(8), duration: 10, ease: 'none' }, 0)
      .to(q('.hx-fitas-b'), { x: vw(6), y: vh(-8), duration: 10, ease: 'none' }, 0)
      .to(q('.hx-glow'), { opacity: .55, duration: 5, ease: 'none' }, 0)
      .to(q('.hx-glow'), { opacity: 1, duration: 5, ease: 'none' }, 5)

    // 1 → 2: título sobe e some; texto e "Ecossistema" entram dos lados
      .to(q('.hx-1'), { y: vh(-14), scale: .9, autoAlpha: 0, duration: 1 }, .2)
      .fromTo(q('.hx-lead'), { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, .9)
      .fromTo(q('.hx-tag'), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, .9)
      .set(q('.hx-2'), { autoAlpha: 1 }, .9)
      .to(q('.hx-2'), { y: vh(-10), autoAlpha: 0, duration: .8 }, 2.6)

    // 3: "Três frentes. Um ecossistema." com os cartões chegando em órbita
      .fromTo(q('.hx-3'), { autoAlpha: 0, y: vh(8), scale: .94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, 3.1);
    cards.forEach((c, i) => tl.to(c, { ...orbit[i], autoAlpha: 1, duration: 1.3, ease: 'power3.out' }, 3.3 + i * .15));

    // 4: a frase sai e os cartões se encaixam lado a lado
    tl.to(q('.hx-3'), { autoAlpha: 0, scale: .9, duration: .8 }, 5.4);
    cards.forEach((c, i) => tl.to(c, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.1, ease: 'power3.inOut' }, 5.4 + i * .08));

    // 5: cartões sobem e a marca gigante aparece
    tl.to(cards, { y: vh(-30), autoAlpha: 0, stagger: .06, duration: .9 }, 7.4)
      .fromTo(q('.hx-5'), { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, 7.9)
      .to({}, { duration: .8 }, 9.1);

    return () => hx.classList.remove('is-pin');
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
