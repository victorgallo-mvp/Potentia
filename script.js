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

/* ---------- Links diretos do WhatsApp ---------- */
const waBase = CONFIG.whatsappNumber ? `https://wa.me/${CONFIG.whatsappNumber}` : '';
document.querySelectorAll('[data-wa-link]').forEach((a) => {
  if (!waBase) return;
  a.href = `${waBase}?text=${encodeURIComponent(CONFIG.whatsappGreeting)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  if (a.textContent.includes('[NÚMERO]')) {
    a.textContent = a.textContent.replace('[NÚMERO]', formatNumber(CONFIG.whatsappNumber));
  }
});

function formatNumber(n) {
  // 5531999999999 -> +55 (31) 99999-9999
  const m = n.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : n;
}

/* ---------- Menu mobile ---------- */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- Checklist: marca os itens quando entram na tela ---------- */
const checklist = document.querySelector('.checklist');
if (checklist && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          checklist.classList.add('is-visible');
          io.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );
  io.observe(checklist);
} else if (checklist) {
  checklist.classList.add('is-visible');
}

/* ---------- Formulário: envia a conversa pelo WhatsApp ---------- */
const form = document.getElementById('form-conversa');
if (form) {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const field = el.closest('.field');
      const ok = el.value.trim() !== '';
      field.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      form.querySelector('.is-invalid input, .is-invalid select')?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const lines = [
      'Olá, quero marcar uma conversa com a Potentia.',
      '',
      `Nome: ${data.nome}`,
      `Empresa: ${data.empresa}`,
      `WhatsApp: ${data.whatsapp}`,
      `Segmento: ${data.segmento}`,
    ];
    if (data.gargalo && data.gargalo.trim()) {
      lines.push('', `Maior gargalo hoje: ${data.gargalo.trim()}`);
    }
    const text = encodeURIComponent(lines.join('\n'));

    if (waBase) {
      window.open(`${waBase}?text=${text}`, '_blank', 'noopener');
      setStatus('Abrimos o WhatsApp com sua mensagem pronta. É só enviar.');
      form.reset();
    } else {
      // Número ainda não configurado: mostra a mensagem para copiar
      setStatus('Número do WhatsApp ainda não configurado em script.js. Mensagem gerada no console.');
      console.info(decodeURIComponent(text));
    }
  });

  form.querySelectorAll('[required]').forEach((el) =>
    el.addEventListener('input', () => el.closest('.field').classList.remove('is-invalid'))
  );
}

function setStatus(msg) {
  let el = form.querySelector('.form__status');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form__status';
    el.setAttribute('role', 'status');
    form.insertBefore(el, form.querySelector('.form__note'));
  }
  el.textContent = msg;
}
