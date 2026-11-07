(() => {
  'use strict';

  /* ---------- Config & auth guard ----------
     FRONTEND DEMONSTRATION ONLY – this is NOT security. Real access control must be
     enforced by the backend (verify session/token on the server for gallery, upload,
     artists, communities and notifications). Set DEMO_MODE to false in production so
     the page requires the auth token below. */
  const DEMO_MODE = true;
  const AUTH_KEY = 'basma_auth_token';
  const LOGIN_URL = 'login.html';
  const CURRENT_USER = { name: 'فنان بصمة', avatar: 'assets/avatars/user.svg' };

  const isAuthenticated = () => {
    try { return Boolean(localStorage.getItem(AUTH_KEY)); } catch { return false; }
  };
  const hasAccess = () => DEMO_MODE || isAuthenticated();
  const goLogin = (target) => { window.location.href = `${LOGIN_URL}?redirect=${encodeURIComponent(target)}`; };

  if (!hasAccess()) { goLogin('gallery.html'); return; }

  document.querySelectorAll('[data-protected]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (isAuthenticated()) return;
      e.preventDefault();
      goLogin(link.getAttribute('href'));
    });
  });

  /* ---------- Data ---------- */
  const ALL = 'كل الرسومات';
  const CATEGORIES = [
    'رسم رقمي', 'رسم بكسل', 'رسم زيتي', 'رسم أكريليك', 'رسم مائي', 'رسم رصاص', 'رسم فحم', 'رسم باستيل',
    'رسم حبر', 'رسم بالألوان الخشبية', 'رسم بالألوان الشمعية', 'رسم واقعي', 'رسم كرتوني', 'رسم أنمي ومانجا',
    'رسم تجريدي', 'رسم سريالي', 'رسم هندسي', 'فن الخط العربي', 'فن الكولاج', 'فن الجرافيتي', 'فن الماندالا',
    'رسم ثلاثي الأبعاد', 'رسم بالطباشير', 'فن الحفر والطباعة', 'رسم توضيحي', 'فن البورتريه',
    'رسم المناظر الطبيعية', 'رسم الطبيعة الصامتة', 'فن المفاهيم', 'فن القصص المصورة', 'فن الرسم المعماري',
    'فن الرسم العلمي', 'فن الرسم الزخرفي', 'فن الرسم بالفحم الملون', 'فن الرسم على الزجاج', 'فن الرسم على الخشب',
    'فن الرسم على القماش', 'فن النحت', 'فن التصوير الفوتوغرافي', 'فن الخزف', 'فن الطباعة اليدوية'
  ];

  // Sample data (generated demo artwork). Likes/comments live in memory only.
  const artworks = [
    { artist: 'ليلى حسن', title: 'أرض الأحلام الليلية', category: 'رسم رقمي', likes: 128, comments: [{ author: 'سلمى', text: 'ألوان خيالية جدًا!' }],
      description: 'منظر خيالي لجبال تحت قمر مضيء، تتوهج فيه الغابات بألوان هادئة.' },
    { artist: 'يوسف المنصوري', title: 'غروب على البحر', category: 'رسم زيتي', likes: 94, comments: [{ author: 'كريم', text: 'الغروب هنا يخطف الأنفاس.' }],
      description: 'منظر طبيعي يجمع بين هدوء البحر ودفء ألوان الغروب.' },
    { artist: 'مريم عبد الله', title: 'نظرة ساكنة', category: 'رسم رصاص', likes: 76, comments: [],
      description: 'بورتريه بالرصاص يعتمد على التظليل الناعم وتفاصيل الملامح الهادئة.' },
    { artist: 'أحمد سالم', title: 'بطلة المدرسة', category: 'رسم أنمي ومانجا', likes: 142, comments: [{ author: 'نور', text: 'الشخصية جميلة جدًا.' }],
      description: 'شخصية أنمي بعيون كبيرة وألوان باستيل مستوحاة من مانجا المدارس.' },
    { artist: 'نور الهدى', title: 'إيقاع الألوان', category: 'رسم أكريليك', likes: 58, comments: [],
      description: 'تكوين تجريدي بطبقات من الألوان الجريئة وضربات فرشاة حرة.' },
    { artist: 'كريم فؤاد', title: 'حديقة الصباح', category: 'رسم مائي', likes: 87, comments: [],
      description: 'ألوان مائية شفافة لزهور الربيع تتداخل فيها درجات الأخضر والوردي والأزرق.' },
    { artist: 'سلمى رشدي', title: 'جبال الصمت', category: 'رسم فحم', likes: 63, comments: [],
      description: 'مشهد جبلي بالفحم يعكس سكون الليل وتباين الظل والنور.' },
    { artist: 'عمر النجار', title: 'أشكال متداخلة', category: 'رسم هندسي', likes: 71, comments: [],
      description: 'تصميم هندسي من مثلثات ودوائر بألوان دافئة وإيقاع بصري منتظم.' },
    { artist: 'هدى الشريف', title: 'بصمة إبداع', category: 'فن الخط العربي', likes: 109, comments: [{ author: 'يوسف', text: 'تكوين دائري أنيق.' }],
      description: 'لوحة خط عربي تجمع بين الزخرفة والألوان الدافئة في تكوين دائري.' }
  ].map((a, i) => ({
    ...a, id: `s${i + 1}`, liked: false,
    avatar: `assets/avatars/artist-${i + 1}.svg`, image: `assets/art/art-${i + 1}.svg`
  }));

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const grid = $('gallery-grid'), noResults = $('no-results');
  const searchInput = $('search-input'), categoryFilter = $('category-filter');
  const modal = $('upload-modal'), dialog = modal.querySelector('.modal__dialog');
  const form = $('upload-form'), openBtn = $('open-upload'), closeBtn = $('close-upload');
  const fileInput = $('art-image'), uploadArea = $('upload-area'), preview = $('image-preview');
  const titleInput = $('art-title'), categorySelect = $('art-category'), descInput = $('art-description');
  const backgroundParts = ['page-header', 'page-main', 'page-footer'].map($);

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* ---------- Categories ---------- */
  const fillSelect = (select, firstValue, firstLabel, disabledFirst) => {
    const first = new Option(firstLabel, firstValue);
    if (disabledFirst) { first.disabled = true; first.selected = true; }
    select.append(first, ...CATEGORIES.map((c) => new Option(c, c)));
  };
  fillSelect(categoryFilter, ALL, ALL, false);
  fillSelect(categorySelect, '', 'اختر نوع الرسمة', true);

  /* ---------- Cards ---------- */
  const renderComments = (art) => {
    const list = art.node.querySelector('.comments__list');
    list.replaceChildren(...art.comments.map((c) => {
      const li = el('li');
      li.append(el('strong', '', `${c.author}:`), document.createTextNode(c.text));
      return li;
    }));
    art.node.querySelector('.action--comment .count').textContent = art.comments.length;
  };

  const buildCard = (art) => {
    const card = el('article', 'card');
    card.dataset.id = art.id;

    const head = el('header', 'card__head');
    const avatar = el('img', 'avatar');
    Object.assign(avatar, { src: art.avatar, alt: `صورة الفنان ${art.artist}`, width: 48, height: 48 });
    const meta = el('div', 'card__meta');
    meta.append(el('p', 'card__artist', art.artist), el('h3', 'card__title', art.title));
    head.append(avatar, meta);

    const fig = el('figure', 'card__media');
    const img = el('img');
    Object.assign(img, { src: art.image, alt: `${art.title} — ${art.category} للفنان ${art.artist}`, loading: 'lazy', decoding: 'async' });
    fig.append(img);

    const body = el('div', 'card__body');
    const text = el('p', 'card__text');
    text.append(el('strong', '', `نوع الرسمة: ${art.category}`), document.createTextNode(' '), el('span', '', art.description));

    const actions = el('div', 'card__actions');
    const like = el('button', 'action action--like');
    like.type = 'button';
    like.setAttribute('aria-pressed', 'false');
    like.setAttribute('aria-label', `إعجاب بالرسمة ${art.title}`);
    like.append(el('span', 'action__icon', '❤️'), el('span', 'count', art.likes));
    const comment = el('button', 'action action--comment');
    comment.type = 'button';
    comment.setAttribute('aria-expanded', 'false');
    comment.setAttribute('aria-controls', `comments-${art.id}`);
    comment.setAttribute('aria-label', `التعليقات على الرسمة ${art.title}`);
    comment.append(el('span', 'action__icon', '💬'), el('span', 'count', 0));
    actions.append(like, comment);

    const panel = el('div', 'comments');
    panel.id = `comments-${art.id}`;
    panel.hidden = true;
    const list = el('ul', 'comments__list');
    const cform = el('form', 'comments__form');
    const cinput = el('input', 'control');
    Object.assign(cinput, { type: 'text', placeholder: 'اكتب تعليقك...', maxLength: 120 });
    cinput.setAttribute('aria-label', 'اكتب تعليقك');
    const csubmit = el('button', 'btn', 'إرسال');
    csubmit.type = 'submit';
    cform.append(cinput, csubmit);
    panel.append(list, cform);

    body.append(text, actions, panel);
    card.append(head, fig, body);
    art.node = card;
    renderComments(art);
    return card;
  };

  const findArt = (node) => artworks.find((a) => a.id === node.closest('.card').dataset.id);

  grid.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.action--like');
    const commentBtn = e.target.closest('.action--comment');
    if (likeBtn) {
      const art = findArt(likeBtn);
      art.liked = !art.liked;
      art.likes += art.liked ? 1 : -1;
      likeBtn.setAttribute('aria-pressed', String(art.liked));
      likeBtn.querySelector('.count').textContent = art.likes;
    } else if (commentBtn) {
      const panel = $(commentBtn.getAttribute('aria-controls'));
      const open = panel.hidden;
      panel.hidden = !open;
      commentBtn.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('input').focus();
    }
  });

  grid.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const value = input.value.trim();
    if (!value) { input.focus(); return; }
    const art = findArt(e.target);
    art.comments.push({ author: 'أنت', text: value }); // in-memory demo only
    input.value = '';
    renderComments(art);
  });

  artworks.forEach((a) => grid.append(buildCard(a)));

  /* ---------- Search & filter ---------- */
  const normalize = (s) => s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .toLowerCase().trim().replace(/\s+/g, ' ');

  const applyFilters = () => {
    const q = normalize(searchInput.value);
    const cat = categoryFilter.value;
    let visible = 0;
    artworks.forEach((a) => {
      const hay = normalize(`${a.title} ${a.artist} ${a.description}`);
      const match = (!q || hay.includes(q)) && (cat === ALL || a.category === cat);
      a.node.hidden = !match;
      if (match) visible += 1;
    });
    noResults.hidden = visible > 0;
  };
  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);

  /* ---------- Modal ---------- */
  const focusables = () => [...dialog.querySelectorAll('button, input, select, textarea, [href]')].filter((n) => !n.disabled);

  const openModal = () => {
    if (!hasAccess()) { goLogin('gallery.html'); return; }
    modal.hidden = false;
    document.body.classList.add('modal-open');
    backgroundParts.forEach((n) => { n.inert = true; });
    dialog.focus();
  };

  const closeModal = (preventScroll = false) => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    backgroundParts.forEach((n) => { n.inert = false; });
    openBtn.focus({ preventScroll });
  };

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', () => closeModal());
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      const items = focusables();
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Upload form ---------- */
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_BYTES = 5 * 1024 * 1024;
  let previewUrl = null;

  const setError = (field, input, message) => {
    $(`err-${field}`).textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (field === 'image') uploadArea.classList.toggle('is-invalid', Boolean(message));
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    preview.removeAttribute('src');
    uploadArea.classList.remove('has-preview');
  };

  const imageError = () => {
    const file = fileInput.files[0];
    if (!file) return 'اختر صورة الرسمة أولًا.';
    if (!ALLOWED.includes(file.type)) return 'نوع الملف غير مدعوم. اختر صورة بصيغة JPG أو PNG أو WEBP أو GIF.';
    if (file.size > MAX_BYTES) return 'حجم الصورة كبير جدًا. الحد الأقصى 5 ميجابايت.';
    return '';
  };

  fileInput.addEventListener('change', () => {
    clearPreview();
    const message = imageError();
    setError('image', fileInput, fileInput.files[0] ? message : '');
    if (message) { fileInput.value = ''; return; }
    previewUrl = URL.createObjectURL(fileInput.files[0]);
    preview.src = previewUrl;
    uploadArea.classList.add('has-preview');
  });

  const validate = () => {
    const checks = [
      ['image', fileInput, imageError()],
      ['title', titleInput, titleInput.value.trim() ? '' : 'اكتب اسم الرسمة.'],
      ['category', categorySelect, categorySelect.value ? '' : 'اختر نوع الرسمة.'],
      ['description', descInput, descInput.value.trim() ? '' : 'اكتب وصفًا مختصرًا للرسمة.']
    ];
    checks.forEach(([f, input, msg]) => setError(f, input, msg));
    const firstBad = checks.find((c) => c[2]);
    if (firstBad) firstBad[1].focus();
    return !firstBad;
  };

  [titleInput, categorySelect, descInput].forEach((input) => {
    const field = input.id.replace('art-', '');
    input.addEventListener('input', () => setError(field, input, ''));
    input.addEventListener('change', () => setError(field, input, ''));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    const art = {
      id: `u${Date.now()}`, artist: CURRENT_USER.name, avatar: CURRENT_USER.avatar,
      title: titleInput.value.trim(), category: categorySelect.value, description: descInput.value.trim(),
      image: previewUrl, likes: 0, liked: false, comments: []
    };
    previewUrl = null; // the new card now owns this object URL (browser-only, not uploaded anywhere)
    artworks.unshift(art);
    grid.prepend(buildCard(art));

    form.reset();
    clearPreview();
    ['image', 'title', 'category', 'description'].forEach((f) => setError(f, form.elements[f === 'image' ? 'image' : f], ''));
    searchInput.value = '';
    categoryFilter.value = ALL;
    applyFilters();
    closeModal(true);
    art.node.scrollIntoView({ block: 'center' });
  });
})();
