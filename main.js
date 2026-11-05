/* Red Tip Automation v3: live mockups, 3D pointer motion, calculator, form. The page reads fully without it. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.documentElement;

  /* ---- colour by chapter: the fixed header takes the ink of the section under it ---- */
  const chapters = $$('[data-ink]');
  const ink = () => {
    const y = 40;
    for (const c of chapters) {
      const r = c.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        root.style.setProperty('--header-ink', c.dataset.ink);
        root.style.setProperty('--tip', c.dataset.tip || '#ff2d2d');
        root.style.setProperty('--header-bg', scrollY > 10 ? getComputedStyle(c).backgroundColor : 'transparent');
        break;
      }
    }
  };
  const bar = $('#top-bar');
  let lastY = scrollY;
  addEventListener('scroll', () => requestAnimationFrame(() => {
    ink();
    const y = scrollY;
    if (bar) bar.classList.toggle('hide', y > lastY && y > 300 && !bar.contains(document.activeElement));
    lastY = y;
  }), { passive: true });
  ink();

  /* ---- run a loop only while its element is on screen ---- */
  const whenVisible = (el, start) => {
    if (!el || !('IntersectionObserver' in window)) return start(() => true);
    let on = false, started = false;
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !started) { started = true; start(() => on && !document.hidden); }
    }, { threshold: 0.25 }).observe(el);
  };

  /* ---- confetti: flat paper squares in the brand colours ---- */
  const cv = $('#confetti');
  const burst = () => {
    if (!cv || reduce) return;
    const ctx = cv.getContext('2d');
    const W = (cv.width = cv.offsetWidth), H = (cv.height = cv.offsetHeight);
    const cols = ['#ff2d2d', '#ffe600', '#0a0a0a', '#ffffff'];
    const ps = Array.from({ length: 110 }, () => ({
      x: W * 0.5, y: H * 0.62, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6,
      w: 6 + Math.random() * 9, h: 4 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: cols[(Math.random() * cols.length) | 0],
    }));
    let t = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (++t < 110) requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);
    };
    tick();
  };

  /* ---- hero phone: a missed call becomes a booked job, on a loop ---- */
  const msgs = $$('#feed .m[data-step]');
  const typing = $('#feed .typing');
  if (msgs.length && !reduce) {
    whenVisible($('.phone'), async (live) => {
      for (;;) {
        msgs.forEach((m) => { m.classList.add('hide'); m.classList.remove('pop'); m.style.display = 'none'; });
        await wait(700);
        for (const m of msgs) {
          while (!live()) await wait(400);
          if (m.classList.contains('in') || m.classList.contains('out')) {
            typing.classList.add('show');
            if (m.classList.contains('out')) typing.style.alignSelf = 'flex-end'; else typing.style.alignSelf = 'flex-start';
            await wait(m.classList.contains('out') ? 900 : 1200);
            typing.classList.remove('show');
          }
          m.style.display = '';
          await wait(30);
          m.classList.remove('hide');
          if (m.classList.contains('booked')) { m.classList.add('pop'); burst(); }
          await wait(m.classList.contains('sys') ? 900 : 1100);
        }
        await wait(4200);
      }
    });
  }

  /* ---- service mockups ---- */
  const loop = (el, items, cls, gap, hold, onStep) => {
    if (!el || !items.length || reduce) return;
    whenVisible(el, async (live) => {
      for (;;) {
        items.forEach((i) => i.classList.add(cls === 'hide' ? 'hide' : 'x'));
        if (cls !== 'hide') items.forEach((i) => i.classList.remove(cls, 'done', 'x'));
        onStep && onStep(0);
        await wait(500);
        for (let k = 0; k < items.length; k++) {
          while (!live()) await wait(400);
          if (cls === 'hide') items[k].classList.remove('hide');
          else { if (k) { items[k - 1].classList.remove(cls); items[k - 1].classList.add('done'); } items[k].classList.add(cls); }
          onStep && onStep(k + 1);
          await wait(gap);
        }
        await wait(hold);
      }
    });
  };
  const calN = $('#cal-n');
  loop($('.cal'), $$('.cal .job'), 'hide', 520, 2600, (n) => { if (calN) calN.textContent = n; });
  loop($('.dash'), $$('.dash-row:not(.hd)'), 'hide', 650, 2600);
  loop($('.feed'), $$('.feed .post'), 'hide', 480, 2400);
  loop($('.ui-steps'), $$('.ui-steps span'), 'on', 900, 1600);
  loop($('.flow'), $$('.flow span'), 'on', 750, 1600);
  const stars = $$('.stars i'), approve = $('.chip b');
  if (stars.length && !reduce) {
    whenVisible($('.ui-stars'), async (live) => {
      for (;;) {
        stars.forEach((s) => s.classList.remove('on')); approve && approve.classList.remove('on');
        await wait(600);
        for (const s of stars) { while (!live()) await wait(400); s.classList.add('on'); await wait(220); }
        await wait(500); approve && approve.classList.add('on');
        await wait(2400);
      }
    });
  } else stars.forEach((s) => s.classList.add('on'));


  /* ---- demo line: pick a business, see how the front desk answers ---- */
  const scripts = {
    hvac: {
      en: ['Quillbrook Heating & Air', 'Thanks for calling Quillbrook Heating and Air. Is your system not cooling, or is this about a tune-up?', "AC quit and it's 88 in the house.", "That counts as urgent. I'm ringing the on-call tech now. If he doesn't pick up in 30 seconds, I'll book the first slot tomorrow at 7.", 'Emergency', 'Rang the on-call phone first'],
      es: ['Quillbrook Heating & Air', 'Gracias por llamar a Quillbrook Heating and Air. ¿Su aire no está enfriando, o llama por un mantenimiento?', 'Se apagó el aire y la casa está a 88 grados.', 'Eso es urgente. Estoy llamando al técnico de guardia ahora. Si no contesta en 30 segundos, le reservo la primera cita mañana a las 7.', 'Emergencia', 'Llamó primero al técnico de guardia'],
    },
    roof: {
      en: ['Tallowmere Roofing', "Thanks for calling Tallowmere Roofing. Are you calling about a leak, storm damage or a new roof quote?", 'Got a leak over the garage. Can someone look this week?', 'We can come Thursday morning or Thursday afternoon. Which works better? I\'ll text you the confirmation.', 'Booked', 'Thursday, leak inspection, text sent'],
      es: ['Tallowmere Roofing', 'Gracias por llamar a Tallowmere Roofing. ¿Llama por una gotera, daños de tormenta o un presupuesto de techo nuevo?', 'Tengo una gotera sobre el garaje. ¿Pueden venir esta semana?', 'Podemos ir el jueves por la mañana o por la tarde. ¿Cuál le queda mejor? Le mando la confirmación por texto.', 'Reservado', 'Jueves, inspección de gotera, texto enviado'],
    },
    salon: {
      en: ['Larkwell Salon', 'Hi, thanks for calling Larkwell. Are you looking to book, or do you have a question about a service?', 'Do you have anything Saturday for a color and cut?', 'Jess has 10:30 or 2:15 on Saturday. Color and cut runs about two hours. Want me to hold 10:30?', 'Booked', 'Saturday 10:30 with Jess'],
      es: ['Larkwell Salon', 'Hola, gracias por llamar a Larkwell. ¿Quiere hacer una cita o tiene una pregunta sobre un servicio?', '¿Tienen algo el sábado para tinte y corte?', 'Jess tiene a las 10:30 o a las 2:15 el sábado. Tinte y corte dura unas dos horas. ¿Le aparto las 10:30?', 'Reservado', 'Sábado 10:30 con Jess'],
    },
    food: {
      en: ['Pennymarsh Grill', 'Thanks for calling Pennymarsh Grill. Are you calling for a reservation, takeout or our hours?', 'Table for six tonight around 7?', "I can do 7:15 on the patio or 7:45 inside. And I'll let the kitchen know if anyone has allergies. Which one?", 'Reserved', 'Tonight 7:15, patio, party of 6'],
      es: ['Pennymarsh Grill', 'Gracias por llamar a Pennymarsh Grill. ¿Llama para una reservación, comida para llevar o nuestro horario?', '¿Mesa para seis esta noche como a las 7?', 'Tengo a las 7:15 en la terraza o a las 7:45 adentro. Y le aviso a la cocina si alguien tiene alergias. ¿Cuál prefiere?', 'Reservado', 'Hoy 7:15, terraza, 6 personas'],
    },
  };
  const pks = $$('.call-pick .pk[data-biz]'), lang = $('#lang');
  const lines = ['#say-1', '#say-2', '#say-3', '#call-tag'].map((s) => $(s));
  if (pks.length && lines.every(Boolean)) {
    let biz = 'hvac', es = false, run = 0, secs = 0;
    const clock = $('#call-t');
    setInterval(() => { if (!document.hidden && clock) { secs++; clock.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'); } }, 1000);
    const show = async () => {
      const id = ++run, t = scripts[biz][es ? 'es' : 'en'];
      $('#call-biz').textContent = t[0];
      lines[0].textContent = t[1]; lines[1].textContent = t[2]; lines[2].textContent = t[3];
      lines[3].innerHTML = '';
      const b = document.createElement('b'); b.textContent = t[4];
      const sp = document.createElement('span'); sp.textContent = t[5];
      lines[3].append(b, ' ', sp);
      secs = 0;
      if (reduce) return;
      lines.forEach((l) => l.classList.add('hide'));
      for (const l of lines) { await wait(l === lines[0] ? 250 : 900); if (id !== run) return; l.classList.remove('hide'); }
    };
    pks.forEach((p) => p.addEventListener('click', () => {
      biz = p.dataset.biz;
      pks.forEach((q) => { q.classList.toggle('on', q === p); q.setAttribute('aria-pressed', q === p ? 'true' : 'false'); });
      show();
    }));
    if (lang) lang.addEventListener('click', () => {
      es = !es; lang.classList.toggle('on', es); lang.setAttribute('aria-pressed', es ? 'true' : 'false');
      lang.textContent = es ? 'English' : 'Español';
      show();
    });
    whenVisible($('.call'), () => show());
  }

  /* ---- AI answer box: the answer types itself out ---- */
  const ask = $('#ask-a');
  if (ask && !reduce) {
    const full = ask.innerHTML;
    whenVisible(ask, async (live) => {
      for (;;) {
        ask.textContent = '';
        await wait(700);
        const tmp = document.createElement('div'); tmp.innerHTML = full;
        for (const node of [...tmp.childNodes]) {
          const text = node.textContent, target = node.nodeType === 3 ? ask.appendChild(document.createTextNode('')) : ask.appendChild(document.createElement(node.nodeName));
          for (let i = 0; i < text.length; i++) { while (!live()) await wait(400); target.textContent += text[i]; await wait(18); }
        }
        await wait(3600);
      }
    });
  }

  /* ---- counters on the proof card (count once) ---- */
  const counts = $$('.count');
  if (counts.length && !reduce) {
    counts.forEach((c) => (c.textContent = (c.dataset.prefix || '') + '0' + (c.dataset.suffix || '')));
    whenVisible($('.counts'), () => {
      const t0 = performance.now();
      const step = (t) => {
        const k = clamp((t - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - k, 3);
        counts.forEach((c) => (c.textContent = (c.dataset.prefix || '') + Math.round(+c.dataset.to * e) + (c.dataset.suffix || '')));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---- 3D pointer motion: the phone, the calculator, the proof card, the hero shapes ---- */
  if (fine && !reduce) {
    const tilt = (area, target, max, base = '') => {
      if (!area || !target) return;
      area.addEventListener('pointermove', (e) => {
        const r = area.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = `${base} rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
      });
      area.addEventListener('pointerleave', () => (target.style.transform = ''));
    };
    tilt($('.hero'), $('.phone'), 22, 'perspective(1100px) rotate(6deg)');
    tilt($('.math'), $('.app'), 10, 'perspective(1200px) rotate(-1.2deg)');
    tilt($('.proof'), $('.card'), 8, 'perspective(1400px) rotate(-1.5deg)');
    const shapes = $$('.shapes i');
    const hero = $('.hero');
    if (hero) hero.addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      shapes.forEach((s) => {
        const d = +s.dataset.depth || 10;
        const rot = s.classList.contains('sh-band') ? -3 : s.classList.contains('sh-sq') ? 14 + x * 30 : 0;
        s.style.transform = `translate(${-x * d}px, ${-y * d}px) rotate(${rot}deg)`;
      });
    });
  }

  /* ---- hero entrance on load (GSAP, pinned 3.12.5 from cdnjs) ---- */
  if (window.gsap && !reduce && $('.hero')) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.sh-sun', { scale: 0.4, duration: 0.9, ease: 'back.out(1.4)' })
      .from('.hero-h span', { yPercent: 40, opacity: 0, duration: 0.7, stagger: 0.09 }, 0.1)
      .from('.phone-wrap', { y: 160, rotation: 14, opacity: 0, duration: 0.9, ease: 'back.out(1.2)' }, 0.25)
      .from('.hero-low > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.45)
      .from('.sh-sq', { scale: 0, rotation: -60, duration: 0.6, ease: 'back.out(2)' }, 0.5);
  }

  /* ---- the missed-call calculator ---- */
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const calls = $('#c-calls'), rate = $('#c-rate'), job = $('#c-job');
  if (calls && rate && job) {
    const big = $('#o-month');
    let shown = 0, raf = 0;
    const tween = (to) => {
      cancelAnimationFrame(raf);
      if (reduce) { shown = to; big.textContent = money(to); return; }
      const from = shown, t0 = performance.now();
      const step = (t) => {
        const k = clamp((t - t0) / 380, 0, 1);
        shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
        big.textContent = money(shown);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      big.classList.remove('bump'); void big.offsetWidth; big.classList.add('bump');
    };
    const out = () => {
      const c = +calls.value, k = +rate.value, j = +job.value;
      $('#o-calls').textContent = c;
      $('#o-rate').textContent = k;
      $('#o-job').textContent = money(j);
      const jobs = c * (52 / 12) * (k / 10);
      $('#o-jobs').textContent = Math.round(jobs);
      tween(Math.round((jobs * j) / 50) * 50);
    };
    [calls, rate, job].forEach((el) => el.addEventListener('input', out));
    shown = 1950; out();
  }
  const nm = $('#c-name'), bn = $('#b-name');
  if (nm && bn) nm.addEventListener('input', () => (bn.textContent = nm.value.trim() || 'Your business'));

  /* ---- book-a-call form ---- */
  const form = $('#book-form');
  if (form) {
    const status = $('#f-status');
    const rules = [
      ['#f-name', '#e-name', (v) => v.trim().length > 1, 'Please add your name.'],
      ['#f-biz', '#e-biz', (v) => v.trim().length > 1, 'Please add your business name.'],
      ['#f-phone', '#e-phone', (v) => v.replace(/\D/g, '').length >= 7, 'Please add a phone number we can call.'],
      ['#f-email', '#e-email', (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'That email looks incomplete.'],
    ];
    const check = ([f, e, ok, msg]) => {
      const el = $(f), er = $(e), good = ok(el.value);
      el.setAttribute('aria-invalid', good ? 'false' : 'true');
      er.textContent = good ? '' : msg;
      if (!good) el.setAttribute('aria-describedby', e.slice(1)); else el.removeAttribute('aria-describedby');
      return good;
    };
    rules.forEach((r) => $(r[0]).addEventListener('blur', () => { if ($(r[0]).value) check(r); }));
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const results = rules.map(check);
      const bad = rules[results.indexOf(false)];
      if (bad) {
        $(bad[0]).focus(); status.textContent = '';
        if (!reduce) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
        return;
      }
      status.textContent = 'Online booking is not open yet, so this was not sent. Please call (843) 633-1794 and we will get you set up.';
    });
  }
})();
