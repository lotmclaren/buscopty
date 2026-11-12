(() => {
  const form = document.getElementById('contact');
  if (!form) return;
  const btn = form.querySelector('.send');
  const label = btn.querySelector('span');
  const errorBox = form.querySelector('.form-error');
  const ok = form.querySelector('.form-ok');
  const original = label.textContent;

  const showError = (msg) => { errorBox.textContent = msg; errorBox.hidden = false; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    const bad = [...form.querySelectorAll('[required]')].filter(el => !el.checkValidity());
    if (bad.length) { bad.forEach(el => el.closest('.f').classList.add('invalid')); bad[0].focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    if (data.botcheck) return;

    // Sin clave configurada todavía: abre el correo del visitante como respaldo
    if (data.access_key === 'WEB3FORMS_ACCESS_KEY') {
      const body = Object.entries(data)
        .filter(([k, v]) => v && !['access_key', 'subject', 'from_name', 'botcheck'].includes(k))
        .map(([k, v]) => `${k}: ${v}`).join('\n');
      location.href = `mailto:info@buscopty.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    btn.disabled = true; label.textContent = form.dataset.sending;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.status);
      form.classList.add('sent'); ok.hidden = false; form.reset();
      form.querySelector('.tel input[type=tel]')?.dispatchEvent(new Event('input'));
    } catch (err) {
      showError(form.dataset.error);
    } finally {
      btn.disabled = false; label.textContent = original;
    }
  });

  form.addEventListener('input', (e) => e.target.closest('.f')?.classList.remove('invalid'));
  form.querySelector('.again').addEventListener('click', () => { form.classList.remove('sent'); ok.hidden = true; });
})();
