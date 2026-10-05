// Seção 03: a luz dentro de cada círculo acompanha o cursor.
(() => {
  'use strict';
  document.querySelectorAll('.eco3-circle').forEach(circle => {
    circle.addEventListener('pointermove', e => {
      const r = circle.getBoundingClientRect();
      circle.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      circle.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });
})();

// Seção 01: clicar na fita do símbolo escolhe o pilar; a fita ativa se desloca para fora junto com o rótulo.
(() => {
  'use strict';
  document.querySelectorAll('.hx6-seg').forEach(seg => {
    const button = document.querySelector(`.hx6-label[data-pillar="${seg.dataset.seg}"]`);
    if (!button) return;
    seg.style.setProperty('--dx', button.style.getPropertyValue('--dx'));
    seg.style.setProperty('--dy', button.style.getPropertyValue('--dy'));
    seg.addEventListener('click', () => button.click());
  });
})();
