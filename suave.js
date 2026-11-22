// 22/11: rolagem suave no computador (Lenis), ligada ao GSAP/ScrollTrigger. Celular e "reduzir movimento" ficam com a rolagem nativa.
(() => {
  'use strict';
  const ok = matchMedia('(pointer: fine) and (min-width: 901px) and (prefers-reduced-motion: no-preference)').matches;
  if (!ok || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
  window.lenis = lenis;
  document.documentElement.classList.add('rolagem-suave');
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // links internos (#secao) com a mesma rolagem suave, descontando o cabeçalho
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-orcamento') || a.getAttribute('href') === '#') return;
    const alvo = document.querySelector(a.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    lenis.scrollTo(alvo, { offset: -90, duration: 1.2 });
  });

  // janela do formulário aberta: a página atrás não rola
  const dlg = document.getElementById('diagnostico');
  if (dlg) {
    new MutationObserver(() => (dlg.open ? lenis.stop() : lenis.start())).observe(dlg, { attributes: true, attributeFilter: ['open'] });
  }
})();
