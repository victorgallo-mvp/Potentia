/* ==========================================================
   Potentia — configuração
   Troque os valores abaixo antes de publicar.
   ========================================================== */
const CONFIG = {
  // Somente dígitos, com DDI e DDD. Ex.: '5531999999999'
  whatsappNumber: '',
  // Mensagem inicial quando alguém clica no link direto do WhatsApp
  whatsappGreeting: 'Olá, quero marcar uma conversa com a Potentia.',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Links diretos do WhatsApp ---------- */
const waBase = CONFIG.whatsappNumber ? `https://wa.me/${CONFIG.whatsappNumber}` : '';
$$('[data-wa-link]').forEach((a) => {
  if (!waBase) return;
  a.href = `${waBase}?text=${encodeURIComponent(CONFIG.whatsappGreeting)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  if (a.textContent.includes('[NÚMERO]')) {
    a.textContent = a.textContent.replace('[NÚMERO]', formatNumber(CONFIG.whatsappNumber));
  }
});

function formatNumber(n) {
  const m = n.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : n;
}

/* ---------- Revelação única ao entrar na tela ---------- */
function onceVisible(el, cb, threshold = 0.3) {
  if (!el) return;
  if (!('IntersectionObserver' in window) || reduceMotion) { cb(el); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { cb(el); io.disconnect(); } });
  }, { threshold });
  io.observe(el);
}
$$('[data-reveal]').forEach((el) => onceVisible(el, (n) => n.classList.add('is-visible')));

/* ---------- Menu mobile ---------- */
const nav = $('.nav');
const toggle = $('.nav__toggle');
const menu = $('#menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- Navbar compacta + seção atual + WhatsApp flutuante ---------- */
const hero = $('.hero');
const waFloat = $('.wa-float');
const navLinks = $$('.nav__link');
const spied = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const past = hero ? y > hero.offsetHeight * 0.6 : y > 400;
    nav?.classList.toggle('is-compact', y > 80);
    waFloat?.classList.toggle('is-visible', past);
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if ('IntersectionObserver' in window && spied.length) {
  const current = new Map();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => current.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
    let best = null, ratio = 0;
    current.forEach((r, id) => { if (r > ratio) { ratio = r; best = id; } });
    navLinks.forEach((a) => a.classList.toggle('is-active', ratio > 0 && a.getAttribute('href') === `#${best}`));
  }, { threshold: [0.15, 0.4, 0.7], rootMargin: '-20% 0px -40% 0px' });
  spied.forEach((s) => spy.observe(s));
}

/* ---------- Checklist de gargalos ---------- */
const checkItems = $$('.check-item');
const checkResult = $('#checklist-result');
const checkCount = $('.checklist__count');
const recognized = () => checkItems.filter((b) => b.getAttribute('aria-pressed') === 'true');

checkItems.forEach((btn) => btn.addEventListener('click', () => {
  const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(on));
  const n = recognized().length;
  if (n === 0) { checkResult.hidden = true; return; }
  const label = n === 1 ? 'gargalo' : 'gargalos';
  checkCount.innerHTML = `Você reconheceu <strong>${n} de ${checkItems.length}</strong> ${label} na sua operação.`;
  checkResult.hidden = false;
}));

/* ---------- Calculadora do custo da ineficiência ---------- */
const calc = $('#calc');
let calcTouched = false;
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', `${pct}%`);
}

function updateCalc() {
  const horas = +$('#c-horas').value;
  const pessoas = +$('#c-pessoas').value;
  const custo = +$('#c-custo').value;
  $('#o-horas').textContent = `${horas} h`;
  $('#o-pessoas').textContent = String(pessoas);
  $('#o-custo').textContent = brl.format(custo);
  const total = Math.round(horas * pessoas * custo * 4.33);
  const out = $('#calc-value');
  out.textContent = brl.format(total);
  if (!reduceMotion) {
    out.classList.add('is-bumping');
    setTimeout(() => out.classList.remove('is-bumping'), 150);
  }
  return total;
}

if (calc) {
  $$('input[type="range"]', calc).forEach((r) => {
    paintRange(r);
    r.addEventListener('input', () => { calcTouched = true; paintRange(r); updateCalc(); });
  });
  updateCalc();
}

/* ---------- Cards de área: um aberto por vez ---------- */
const areaToggles = $$('.area__toggle');
areaToggles.forEach((btn) => btn.addEventListener('click', () => {
  const card = btn.closest('.area');
  const opening = !card.classList.contains('is-open');
  areaToggles.forEach((b) => {
    b.closest('.area').classList.remove('is-open');
    b.setAttribute('aria-expanded', 'false');
  });
  if (opening) {
    card.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
}));

/* ---------- Segmentos: toque abre no mobile ---------- */
const segs = $$('.seg');
segs.forEach((btn) => btn.addEventListener('click', () => {
  const open = !btn.classList.contains('is-open');
  segs.forEach((b) => b.classList.remove('is-open'));
  if (open) btn.classList.add('is-open');
}));

/* ---------- Cenários: Antes / Com a Potentia ---------- */
const sw = $('.switch');
const cases = $('#cases');
if (sw && cases) {
  $$('.switch__btn', sw).forEach((btn) => btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    sw.dataset.view = view;
    cases.dataset.view = view;
    $$('.switch__btn', sw).forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  }));
}

/* ---------- Formulário: envia a conversa pelo WhatsApp ---------- */
const form = $('#form-conversa');
const submitBtn = $('#form-submit');
if (form && submitBtn) {
  submitBtn.dataset.state = 'idle';
  const label = $('.btn__label', submitBtn);
  const setBtn = (state, text) => { submitBtn.dataset.state = state; label.textContent = text; };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    let valid = true;
    $$('[required]', form).forEach((el) => {
      const ok = el.value.trim() !== '';
      el.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { $('.is-invalid input, .is-invalid select', form)?.focus(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    const lines = [
      'Olá, quero marcar uma conversa com a Potentia.', '',
      `Nome: ${data.nome}`, `Empresa: ${data.empresa}`, `WhatsApp: ${data.whatsapp}`, `Segmento: ${data.segmento}`,
    ];
    if (data.gargalo?.trim()) lines.push('', `Maior gargalo hoje: ${data.gargalo.trim()}`);

    const marked = recognized().map((b) => b.textContent.trim());
    if (marked.length) lines.push('', 'Gargalos que reconheci no site:', ...marked.map((t) => `- ${t}`));

    if (calcTouched) lines.push('', `Estimativa de custo da ineficiência: ${$('#calc-value').textContent}/mês`);

    const text = encodeURIComponent(lines.join('\n'));

    setBtn('sending', 'Abrindo o WhatsApp...');
    setTimeout(() => {
      if (waBase) {
        window.open(`${waBase}?text=${text}`, '_blank', 'noopener');
        setBtn('done', 'Mensagem pronta');
        setStatus('Abrimos o WhatsApp com sua mensagem pronta. É só enviar.');
        form.reset();
      } else {
        setBtn('done', 'Mensagem gerada');
        setStatus('Número do WhatsApp ainda não configurado em script.js. Mensagem gerada no console.');
        console.info(decodeURIComponent(text));
      }
      setTimeout(() => setBtn('idle', 'Marcar uma conversa'), 4000);
    }, 700);
  });

  $$('[required]', form).forEach((el) =>
    el.addEventListener('input', () => el.closest('.field').classList.remove('is-invalid'))
  );
}

function setStatus(msg) {
  let el = $('.form__status', form);
  if (!el) {
    el = document.createElement('p');
    el.className = 'form__status';
    el.setAttribute('role', 'status');
    form.insertBefore(el, $('.form__note', form));
  }
  el.textContent = msg;
}
