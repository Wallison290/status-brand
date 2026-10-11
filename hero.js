// Hero em camadas: fundo, tiles, título e mão andam em velocidades diferentes
// com o scroll e com o mouse. Cada camada usa a propriedade `translate`,
// que se soma aos `transform` das animações do CSS sem brigar com eles.
(() => {
  const hero = document.querySelector(".sx");
  if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const fine = matchMedia("(pointer: fine)").matches;
  // [seletor, profundidade no mouse (px), fator de scroll (+ fica para trás, - vem para frente)]
  const layers = [
    [".sx-glow", -10, 0.45],
    [".sx-kicker", -14, 0.22],
    [".sx-rail", -6, 0.3],
    [".sx-row", -20, 0.2],
    [".sx-title", 10, 0],
    [".sx-hand", 30, -0.32],
  ].map(([sel, m, s]) => [hero.querySelector(sel), m, s]).filter(([el]) => el);

  const amp = innerWidth < 761 ? 0.5 : 1; // celular: metade da amplitude
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let visible = true, raf = 0;

  if (fine) addEventListener("pointermove", (e) => {
    target.x = e.clientX / innerWidth - 0.5;
    target.y = e.clientY / innerHeight - 0.5;
    kick();
  }, { passive: true });
  addEventListener("scroll", kick, { passive: true });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(hero);

  function kick() { if (visible && !raf) raf = requestAnimationFrame(frame); }

  function frame() {
    raf = 0;
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    const sy = Math.min(scrollY, hero.offsetHeight);
    for (const [el, m, s] of layers) {
      el.style.translate = `${(cur.x * m * amp).toFixed(2)}px ${(cur.y * m * 0.6 * amp + sy * s * amp).toFixed(2)}px`;
    }
    // título e mão se dissolvem conforme o hero sai da tela
    hero.style.setProperty("--fade", Math.max(0, 1 - sy / (hero.offsetHeight * 0.7)).toFixed(3));
    if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001) kick();
  }
  kick();
})();
