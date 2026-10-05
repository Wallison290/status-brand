(() => {
  'use strict';
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  $('#year').textContent = new Date().getFullYear();
  const menuButton = $('.menu-toggle'), menu = $('#mobile-menu');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
    menu.hidden = open;
  });
  $$('#mobile-menu a, #mobile-menu button').forEach(a => a.addEventListener('click', () => {
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu');
  }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.focus(); } });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .07 });
    $$('.reveal').forEach(el => observer.observe(el));
  }
  const pillars = [
    ['Um lugar claro no mercado.', 'Definimos o que sua marca representa, para quem ela existe e por que ela merece ser escolhida.'],
    ['Uma conversa que faz sentido.', 'Transformamos sua estratégia em uma comunicação consistente, relevante e reconhecível em cada canal.'],
    ['Cada ação com um objetivo.', 'Planejamos campanhas, acompanhamos indicadores e ajustamos o caminho com base no que o seu negócio precisa.'],
    ['Presença em cada detalhe.', 'Conectamos identidade, conteúdo e experiência digital para tornar cada contato com a marca mais claro e intuitivo.'],
    ['Mais possibilidades. Menos atrito.', 'Sites, automações e inteligência artificial ajudam a aproximar o cliente e simplificar os processos da sua operação.']
  ];
  $$('[data-pillar]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.pillar);
    $$('[data-pillar]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    $('#pillar-number').textContent = `PILAR 0${index + 1}`;
    $('#pillar-title').textContent = pillars[index][0]; $('#pillar-copy').textContent = pillars[index][1];
  }));
  const processCopy = [
    'Começamos pelo seu negócio: contexto, público, desafios e oportunidades. O diagnóstico dá sentido às decisões que vêm depois.',
    'Organizamos prioridades e definimos o plano. Posicionamento, canais, mensagens e objetivos passam a trabalhar na mesma direção.',
    'Transformamos a direção em entregas. Identidade, conteúdo, campanhas e experiências digitais são construídos com alinhamento e intenção.',
    'Acompanhamos o que foi colocado em prática, conversamos sobre os aprendizados e ajustamos os próximos passos. A marca evolui junto com o negócio.'
  ];
  function selectTab(button, group) {
    $$(group).forEach(b => { b.setAttribute('aria-selected', String(b === button)); b.tabIndex = b === button ? 0 : -1; });
  }
  $$('[data-process]').forEach(b => b.addEventListener('click', () => {
    selectTab(b, '[data-process]'); $('#process-panel').setAttribute('aria-labelledby', b.id); $('#process-panel p').textContent = processCopy[Number(b.dataset.process)];
  }));
  function keyboardTabs(group, vertical = false) {
    $$(group).forEach(button => button.addEventListener('keydown', e => {
      const list = $$(group), current = list.indexOf(button); let next;
      if (e.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (current + 1) % list.length;
      else if (e.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (current - 1 + list.length) % list.length;
      else if (e.key === 'Home') next = 0; else if (e.key === 'End') next = list.length - 1;
      if (next !== undefined) { e.preventDefault(); list[next].click(); list[next].focus(); }
    }));
  }
  keyboardTabs('[data-process]'); keyboardTabs('[data-niche]', true);
  const niches = [
    ['SAÚDE.', 'Confiança antes<br>do primeiro <em>contato.</em>', 'Para clínicas e profissionais da saúde que querem comunicar seu valor com clareza, responsabilidade e proximidade.'],
    ['ESTÉTICA.', 'Sua essência.<br>Uma presença <em>singular.</em>', 'Uma comunicação que valoriza sua experiência, traduz seu cuidado e ajuda o público a compreender os diferenciais do seu trabalho.'],
    ['FARMÁCIAS.', 'Cuidado que<br>se transforma em <em>conexão.</em>', 'Conteúdo, presença local e campanhas para aproximar sua farmácia da rotina e das necessidades dos seus clientes.'],
    ['SABOR.', 'Experiências que<br>dão vontade de <em>voltar.</em>', 'Da descoberta à próxima visita: identidade, conteúdo e divulgação para restaurantes e negócios de gastronomia.'],
    ['NEGÓCIOS.', 'Valor percebido.<br>Crescimento com <em>direção.</em>', 'Estratégia e comunicação para empresas que querem profissionalizar sua presença e fortalecer sua posição no mercado.']
  ];
  $$('[data-niche]').forEach(b => b.addEventListener('click', () => {
    const index = Number(b.dataset.niche); selectTab(b, '[data-niche]'); $('#niche-panel').setAttribute('aria-labelledby', b.id);
    $('#niche-word').textContent = niches[index][0]; $('#niche-title').innerHTML = niches[index][1]; $('#niche-desc').textContent = niches[index][2];
    const img = $('.niche-visual img');
    img.src = index < 3 ? 'assets/nichos.png' : 'assets/portfolio.png';
    img.alt = index < 3 ? 'Imagem ilustrativa de uma profissional em uma clínica contemporânea' : 'Apresentação conceitual de marca e papelaria';
  }));
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => {
    $$('[data-filter]').forEach(btn => { btn.classList.toggle('active', b === btn); btn.setAttribute('aria-pressed', String(b === btn)); });
    $$('.project-card').forEach(card => { card.hidden = b.dataset.filter !== 'all' && card.dataset.category !== b.dataset.filter; card.classList.add('visible'); });
  }));
  const contact = $('#contact-dialog'), projectDialog = $('#project-dialog');
  function openDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
  $$('dialog').forEach(d => {
    $('.dialog-close', d).addEventListener('click', () => d.close());
    d.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
    d.addEventListener('click', e => { const r = d.getBoundingClientRect(); if (e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) d.close(); });
  });
  function showContact(service) {
    if (service) { $('#brief-service').value = service; $('#brief-intro').hidden = false; $('#brief-result').hidden = true; }
    openDialog(contact);
  }
  $$('[data-contact]').forEach(button => button.addEventListener('click', () => showContact()));
  $$('[data-service]').forEach(button => button.addEventListener('click', () => showContact(button.dataset.service)));
  const projects = [
    ['STATUS BRAND / IDENTIDADE VISUAL', 'Uma identidade. Um novo status.', 'Apresentação conceitual da identidade Status Brand. A combinação entre o símbolo de linhas contínuas, preto, branco e roxo cria uma linguagem reconhecível para os diferentes pontos de contato da marca.', ['Sistema visual e aplicações', 'Papelaria e presença institucional', 'Consistência de marca']],
    ['STATUS MEDIA / DIREÇÃO DIGITAL', 'Experiências que conectam.', 'Uma direção criativa para experiências digitais dentro do ecossistema Status. Estratégia de conteúdo, navegação clara e identidade trabalham juntas para aproximar marca e público.', ['Arquitetura de informações', 'Design responsivo', 'Jornadas e pontos de contato']],
    ['STATUS BRAND / DIREÇÃO DE CONTEÚDO', 'Presença que permanece.', 'Um conceito de comunicação que organiza a jornada entre ser visto, fazer sentido e ser lembrado. O objetivo é construir uma presença que tenha consistência para além de uma publicação.', ['Pilares de conteúdo', 'Direção criativa', 'Planejamento de comunicação']]
  ];
  $$('[data-project]').forEach(button => button.addEventListener('click', () => {
    const item = projects[Number(button.dataset.project)]; $('#project-eyebrow').textContent = item[0]; $('#project-title').textContent = item[1]; $('#project-description').textContent = item[2];
    $('#project-deliverables').replaceChildren(...item[3].map(text => { const span = document.createElement('span'); span.textContent = text; return span; })); openDialog(projectDialog);
  }));
  $('#project-contact').addEventListener('click', () => { projectDialog.close(); showContact(); });
  let brief = '';
  $('#brief-form').addEventListener('submit', e => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    brief = `BRIEFING — STATUS BRAND\n\nNome: ${String(data.get('name')).trim()}\nEmpresa: ${String(data.get('company')).trim()}\nSolução: ${data.get('service')}\n\nPrincipal desafio:\n${String(data.get('goal')).trim()}`;
    $('#brief-text').textContent = brief; $('#brief-intro').hidden = true; $('#brief-result').hidden = false; contact.scrollTop = 0; $('#copy-brief').focus();
  });
  $('#edit-brief').addEventListener('click', () => { $('#brief-intro').hidden = false; $('#brief-result').hidden = true; $('#brief-form input').focus(); });
  $('#copy-brief').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(brief); $('#copy-status').textContent = 'Briefing copiado. Agora você pode compartilhar com a equipe Status Brand.'; }
    catch { $('#copy-status').textContent = 'Não foi possível copiar automaticamente. Use “Baixar resumo” ou selecione o texto acima.'; }
  });
  $('#download-brief').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([brief], {type:'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = 'meu-briefing-status-brand.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
