// Selector de código de país con bandera para el campo de teléfono
(() => {
  const box = document.querySelector('.tel');
  if (!box) return;

  const RAW = 'pa507 us1 co57 cr506 ve58 mx52 es34 ar54 bo591 br55 ca1 cl56 cu53 do1 ec593 sv503 gt502 ht509 hn504 jm1 ni505 py595 pe51 pr1 uy598 tt1 bs1 bb1 bz501 gy592 sr597 aw297 cw599 ' +
    'af93 al355 dz213 ad376 ao244 ag1 am374 au61 at43 az994 bh973 bd880 by375 be32 bj229 bt975 ba387 bw267 bn673 bg359 bf226 bi257 kh855 cm237 cv238 cf236 td235 cn86 km269 cg242 cd243 hr385 cy357 cz420 ' +
    'dk45 dj253 dm1 eg20 gq240 er291 ee372 sz268 et251 fj679 fi358 fr33 ga241 gm220 ge995 de49 gh233 gr30 gd1 gp590 gf594 gn224 gw245 hk852 hu36 is354 in91 id62 ir98 iq964 ie353 il972 it39 ci225 jp81 jo962 ' +
    'kz7 ke254 ki686 kw965 kg996 la856 lv371 lb961 ls266 lr231 ly218 li423 lt370 lu352 mo853 mg261 mw265 my60 mv960 ml223 mt356 mh692 mq596 mr222 mu230 md373 mc377 mn976 me382 ma212 mz258 mm95 na264 np977 ' +
    'nl31 nz64 ne227 ng234 kp850 mk389 no47 om968 pk92 pw680 ps970 pg675 ph63 pl48 pt351 qa974 re262 ro40 ru7 rw250 kn1 lc1 vc1 ws685 sm378 st239 sa966 sn221 rs381 sc248 sl232 sg65 sk421 si386 sb677 so252 ' +
    'za27 kr82 ss211 lk94 sd249 se46 ch41 sy963 tw886 tj992 tz255 th66 tl670 tg228 to676 tn216 tr90 tm993 ug256 ua380 ae971 gb44 uz998 vu678 va39 vn84 ye967 zm260 zw263';

  const lang = document.documentElement.lang.slice(0, 2);
  let names;
  try { names = new Intl.DisplayNames([lang], { type: 'region' }); } catch { names = null; }
  const coll = new Intl.Collator(lang);
  const all = RAW.split(' ').map(s => {
    const iso = s.slice(0, 2), dial = s.slice(2);
    return { iso, dial, name: names?.of(iso.toUpperCase()) || iso.toUpperCase() };
  });
  const TOP = 7; // Panamá y países frecuentes primero, el resto en orden alfabético
  const list = [...all.slice(0, TOP), ...all.slice(TOP).sort((a, b) => coll.compare(a.name, b.name))];

  const flag = iso => `https://flagcdn.com/w40/${iso}.png`;
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const btn = box.querySelector('.cc');
  const btnFlag = btn.querySelector('img');
  const btnDial = btn.querySelector('b');
  const input = box.querySelector('input[type=tel]');
  const hidden = box.parentElement.querySelector('input[name=phone]');
  const panel = box.querySelector('.cc-panel');
  const search = panel.querySelector('input');
  const ul = panel.querySelector('ul');

  let current;
  const sync = () => {
    const num = input.value.trim();
    hidden.value = num ? `+${current.dial} ${num}` : '';
  };
  const select = (c) => {
    current = c;
    btnFlag.src = flag(c.iso); btnFlag.alt = c.name;
    btnDial.textContent = '+' + c.dial;
    btn.setAttribute('aria-label', `${c.name} +${c.dial}`);
    sync();
  };

  const render = (q = '') => {
    const f = fold(q.replace(/^\+/, ''));
    const items = f ? list.filter(c => fold(c.name).includes(f) || c.dial.startsWith(f) || c.iso === f) : list;
    ul.innerHTML = items.map((c, i) =>
      `<li role="option" data-iso="${c.iso}" aria-selected="${c === current}"${!f && i === TOP - 1 ? ' class="sep"' : ''}>` +
      `<img src="${flag(c.iso)}" alt="" ${i < 20 ? '' : 'loading="lazy" '}width="22" height="16"><span>${c.name}</span><em>+${c.dial}</em></li>`
    ).join('') || `<li class="empty">${panel.dataset.empty}</li>`;
  };

  const open = () => {
    if (search.value) { search.value = ''; render(); }
    ul.querySelectorAll('li[data-iso]').forEach(li => li.setAttribute('aria-selected', li.dataset.iso === current.iso));
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
    ul.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' });
    if (matchMedia('(hover:hover)').matches) search.focus();
  };
  const close = (focus) => {
    panel.hidden = true; btn.setAttribute('aria-expanded', 'false');
    if (focus) input.focus();
  };

  btn.addEventListener('click', () => panel.hidden ? open() : close());
  search.addEventListener('input', () => render(search.value));
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); ul.querySelector('li[data-iso]')?.click(); }
  });
  ul.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-iso]');
    if (!li) return;
    select(list.find(c => c.iso === li.dataset.iso)); close(true);
  });
  document.addEventListener('click', (e) => { if (!panel.hidden && !box.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(true); });
  input.addEventListener('input', sync);

  select(list[0]); // Panamá por defecto
  render(); // la lista se arma una sola vez para que las banderas no parpadeen
  // Precarga las banderas más usadas para que la lista abra sin huecos
  const warm = () => list.slice(0, 20).forEach(c => { new Image().src = flag(c.iso); });
  'requestIdleCallback' in window ? requestIdleCallback(warm) : setTimeout(warm, 1500);
  btn.addEventListener('pointerenter', warm, { once: true });
})();
