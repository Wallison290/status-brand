// Seção 02: liga o cilindro à rolagem com GSAP ScrollTrigger.
// Ao entrar na tela a curva "fecha" de mais aberta até a final; rolar rápido dá um impulso no giro.
// Se o GSAP não carregar, o carrossel segue normal com o giro automático.
(() => {
  'use strict';
  const section = document.querySelector('.arc-section');
  if (!section || !section.arcControl || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const ctl = section.arcControl;
  const mm = gsap.matchMedia();

  // desktop: curvatura ligada ao scroll + impulso
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
    const state = { open: 0 };
    ctl.setOpen(0);
    gsap.to(state, {
      open: 1, ease: 'power2.inOut',
      onUpdate: () => ctl.setOpen(state.open),
      scrollTrigger: { trigger: '.arc-view', start: 'top bottom', end: 'center 60%', scrub: 1 },
    });
    ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onUpdate: self => ctl.kick(self.getVelocity() / 60) });
    return () => ctl.setOpen(1);
  });

  // celular: só o impulso, mais leve (a curva fica fixa)
  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => {
    ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onUpdate: self => ctl.kick(self.getVelocity() / 120) });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
