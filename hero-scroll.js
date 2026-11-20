// Hero animado na rolagem (20/11/2026, no estilo da referência do Pinterest).
// Computador: a seção fica presa e a rolagem conduz 6 etapas: título com ícones → texto + "Ecossistema"
// → "Três frentes" com os cartões em órbita → cartões lado a lado → painel roxo com o celular (Status Media)
// → "Status Brand" gigante + botão. Celular: etapas empilhadas que entram ao aparecer na tela.
(() => {
  'use strict';
  const hx = document.querySelector('.hx');
  if (!hx || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const q = s => hx.querySelector(s);
  const cards = gsap.utils.toArray('.hx-card', hx);
  const mm = gsap.matchMedia();
  const vw = v => () => innerWidth * v / 100, vh = v => () => innerHeight * v / 100;

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    hx.classList.add('is-pin');
    const orbit = [
      { x: vw(-12), y: vh(-33), rotation: -8, scale: .8 },
      { x: vw(36), y: vh(12), rotation: 7, scale: .8 },
      { x: vw(-56), y: vh(30), rotation: -5, scale: .8 },
    ];
    const fora = [
      { x: vw(-55), y: vh(-90), rotation: -24 },
      { x: vw(75), y: vh(5), rotation: 24 },
      { x: vw(-95), y: vh(85), rotation: -18 },
    ];
    gsap.set([q('.hx-2'), q('.hx-3'), q('.hx-panel'), q('.hx-5')], { autoAlpha: 0 });
    cards.forEach((c, i) => gsap.set(c, { ...fora[i], autoAlpha: 0 }));

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: hx, start: 'top top', end: '+=500%', pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true },
    });

    // fundo andando o tempo todo
    tl.to(q('.hx-s'), { scale: 1.18, rotation: 6, duration: 11.6, ease: 'none' }, 0)
      .to(q('.hx-fitas-a'), { x: vw(-5), y: vh(6), duration: 11.6, ease: 'none' }, 0)
      .to(q('.hx-fitas-b'), { x: vw(5), y: vh(-6), duration: 11.6, ease: 'none' }, 0)

    // 1 → 2
      .to(q('.hx-1'), { y: vh(-12), scale: .9, autoAlpha: 0, duration: .9 }, .3)
      .set(q('.hx-2'), { autoAlpha: 1 }, 1)
      .fromTo(q('.hx-lead'), { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: 'power3.out' }, 1)
      .fromTo(q('.hx-tag'), { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: 'power3.out' }, 1.1)
      .to(q('.hx-2'), { y: vh(-10), autoAlpha: 0, duration: .7 }, 2.6)

    // 3: frase + cartões chegando em órbita
      .fromTo(q('.hx-3'), { autoAlpha: 0, y: vh(6), scale: .94 }, { autoAlpha: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out' }, 3.1);
    cards.forEach((c, i) => tl.to(c, { ...orbit[i], autoAlpha: 1, duration: 1.2, ease: 'power3.out' }, 3.3 + i * .15));

    // 4: frase sai, cartões se encaixam lado a lado
    tl.to(q('.hx-3'), { autoAlpha: 0, scale: .9, duration: .7 }, 5.2);
    cards.forEach((c, i) => tl.to(c, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, ease: 'power3.inOut' }, 5.2 + i * .08));

    // 5: cartões sobem; o painel roxo sobe de baixo com o celular
    tl.to(cards, { y: vh(-28), autoAlpha: 0, stagger: .06, duration: .8 }, 7)
      .fromTo(q('.hx-panel'), { autoAlpha: 1, y: vh(100), scale: .96 }, { y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }, 7.2)
      .fromTo(q('.hx-phone'), { y: vh(25), rotation: 4 }, { y: 0, rotation: -6, duration: 1.2, ease: 'power3.out' }, 7.5)

    // 6: painel encolhe e sai; a marca gigante aparece
      .to(q('.hx-panel'), { y: vh(-22), scale: .9, autoAlpha: 0, duration: .9 }, 9.3)
      .fromTo(q('.hx-5'), { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power3.out' }, 9.8)
      .to({}, { duration: .7 }, 10.9);

    return () => { hx.classList.remove('is-pin'); };
  });

  // celular / telas menores: cada etapa entra quando aparece
  mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
    [q('.hx-2'), q('.hx-3'), q('.hx-panel'), q('.hx-5')].forEach(el => gsap.from(el, {
      y: 50, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' },
    }));
    gsap.from(cards, { y: 50, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: q('.hx-cards'), start: 'top 85%' } });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
