(() => {
  'use strict';

  /* ---------- Config & auth guard ----------
     FRONTEND DEMONSTRATION ONLY – not real security. Access control, friend requests and
     chat delivery must be enforced/handled by a backend. Set DEMO_MODE to false in
     production so the page requires the auth token below. */
  const DEMO_MODE = true;
  const AUTH_KEY = 'basma_auth_token';
  const LOGIN_URL = 'login.html';

  const isAuthenticated = () => { try { return Boolean(localStorage.getItem(AUTH_KEY)); } catch { return false; } };
  const goLogin = (target) => { window.location.href = `${LOGIN_URL}?redirect=${encodeURIComponent(target)}`; };
  if (!DEMO_MODE && !isAuthenticated()) { goLogin('artists.html'); return; }

  document.querySelectorAll('[data-protected]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (DEMO_MODE || isAuthenticated()) return;
      e.preventDefault();
      goLogin(link.getAttribute('href'));
    });
  });

  /* ---------- Sample data (in-memory demo) ---------- */
  const friends = [
    { id: 'f1', name: 'سارة الجمال', friends: 184, followers: 962, works: 42, communities: 7 },
    { id: 'f2', name: 'آدم خليل', friends: 129, followers: 540, works: 28, communities: 4 },
    { id: 'f3', name: 'رنا القباني', friends: 212, followers: 1380, works: 17, communities: 9 },
    { id: 'f4', name: 'طارق منصور', friends: 96, followers: 410, works: 36, communities: 3 },
    { id: 'f5', name: 'دينا فاروق', friends: 158, followers: 835, works: 23, communities: 6 },
    { id: 'f6', name: 'مصطفى عزت', friends: 74, followers: 305, works: 15, communities: 2 }
  ].map((a) => ({ ...a, friend: true }));

  const discover = [
    { id: 'n1', name: 'جميلة السيد', friends: 143, followers: 720, works: 31, communities: 5 },
    { id: 'n2', name: 'إبراهيم الحداد', friends: 88, followers: 366, works: 48, communities: 3 },
    { id: 'n3', name: 'ياسمين عادل', friends: 201, followers: 1104, works: 12, communities: 8 },
    { id: 'n4', name: 'حسام الدين', friends: 67, followers: 289, works: 26, communities: 2 },
    { id: 'n5', name: 'آية مراد', friends: 175, followers: 903, works: 39, communities: 6 },
    { id: 'n6', name: 'زياد البنا', friends: 54, followers: 214, works: 9, communities: 1 }
  ].map((a) => ({ ...a, friend: false }));

  const artists = [...friends, ...discover].map((a) => ({
    ...a,
    avatar: `assets/artists/avatar-${a.id}.svg`,
    cover: `assets/artists/cover-${a.id}.svg`,
    gallery: Array.from({ length: 5 }, (_, k) => `assets/artists/art/${a.id}-${k + 1}.svg`) // five sample artworks per artist
  }));
  const byId = Object.fromEntries(artists.map((a) => [a.id, a]));
  const requested = new Set();

  const chats = {
    f1: [
      { from: 'them', text: 'أهلاً! شفت لوحتك الأخيرة، الألوان فيها رائعة.', time: '١٠:١٢ ص' },
      { from: 'me', text: 'شكرًا يا سارة، اشتغلت عليها أسبوع كامل.', time: '١٠:١٤ ص' },
      { from: 'them', text: 'تحب نعمل مشروع مشترك عن المناظر الطبيعية؟', time: '١٠:١٥ ص' }
    ],
    f2: [
      { from: 'them', text: 'صباح الخير، جربت الفرش الجديدة اللي حكيتلك عنها؟', time: '٩:٠٢ ص' },
      { from: 'me', text: 'أيوه جربتها، ملمس الخطوط مختلف تمامًا.', time: '٩:١٠ ص' }
    ],
    f3: [
      { from: 'me', text: 'مساء الخير يا رنا، ممكن رأيك في تكوين لوحتي؟', time: '٧:٣٠ م' },
      { from: 'them', text: 'بالتأكيد، التكوين متوازن جدًا، وأنصحك بزيادة التباين في الخلفية.', time: '٧:٤٢ م' },
      { from: 'me', text: 'ملاحظة ممتازة، هعدّلها الليلة.', time: '٧:٤٤ م' }
    ],
    f4: [
      { from: 'them', text: 'إيه أخبار اللوحة الزيتية الجديدة؟', time: '٥:٢٠ م' },
      { from: 'me', text: 'لسه بتجف، هبعتلك صورة لما تخلص.', time: '٥:٢٥ م' },
      { from: 'them', text: 'تمام، متشوق أشوفها.', time: '٥:٢٦ م' }
    ],
    f5: [
      { from: 'them', text: 'الخط العربي في عملك الأخير مبهر!', time: '٨:٠٥ م' },
      { from: 'me', text: 'شكرًا يا دينا، قضيت وقتًا طويلًا في ضبط الحروف.', time: '٨:١٠ م' }
    ],
    f6: [
      { from: 'me', text: 'أهلاً مصطفى، أرسلت لك مرجعًا عن الظل والنور.', time: '٢:١٥ م' },
      { from: 'them', text: 'وصلني، مفيد جدًا، شكرًا لك.', time: '٢:٣٠ م' }
    ]
  };

  /* ---------- Helpers & DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const fmt = (n) => n.toLocaleString('ar-EG');
  const nowTime = () => new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' });
  const normalize = (s) => s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .toLowerCase().trim().replace(/\s+/g, ' ');

  const friendsGrid = $('friends-grid'), discoverGrid = $('discover-grid');
  const friendsSection = $('friends-section'), discoverSection = $('discover');
  const noResults = $('no-results'), searchInput = $('artist-search'), main = $('page-main');
  const backgroundParts = ['page-header', 'page-main', 'page-footer'].map($);

  /* ---------- Artist cards ---------- */
  const nodes = {}; // id -> { card, btn }
  const syncAddButton = (btn, id) => {
    const sent = requested.has(id);
    btn.textContent = sent ? 'تم إرسال الطلب' : 'أضف صديق';
    btn.disabled = sent;
    btn.classList.toggle('btn--sent', sent);
  };

  const buildCard = (a) => {
    const card = el('article', 'artist-card');
    const pic = el('button', 'artist-card__pic');
    pic.type = 'button';
    pic.tabIndex = -1; // keyboard users use the name button; the picture is a pointer shortcut
    pic.dataset.profile = a.id;
    const img = el('img', 'artist-card__avatar');
    Object.assign(img, { src: a.avatar, alt: `صورة ${a.name} الشخصية`, width: 92, height: 92, loading: 'lazy' });
    pic.append(img);
    const name = el('button', 'artist-name', a.name);
    name.type = 'button';
    name.dataset.profile = a.id;
    name.setAttribute('aria-haspopup', 'dialog');
    const btn = el('button', 'btn');
    btn.type = 'button';
    if (a.friend) { btn.textContent = 'محادثة معه'; btn.dataset.chat = a.id; }
    else { btn.dataset.add = a.id; syncAddButton(btn, a.id); }
    const info = el('div', 'artist-card__info');
    info.append(name, btn);
    card.append(pic, info);
    nodes[a.id] = { card, btn };
    return card;
  };
  friendsGrid.append(...friends.map((a) => buildCard(byId[a.id])));
  discoverGrid.append(...discover.map((a) => buildCard(byId[a.id])));

  /* ---------- Search (both sections) ---------- */
  const applySearch = () => {
    const q = normalize(searchInput.value);
    let total = 0;
    [[friends, friendsSection], [discover, discoverSection]].forEach(([list, section]) => {
      let count = 0;
      list.forEach((a) => {
        const match = !q || normalize(a.name).includes(q);
        nodes[a.id].card.hidden = !match;
        if (match) count += 1;
      });
      section.hidden = count === 0;
      total += count;
    });
    noResults.hidden = total > 0;
  };
  searchInput.addEventListener('input', applySearch);

  /* ---------- Modal layer manager ---------- */
  const profileModal = $('profile-modal'), chatModal = $('chat-modal');
  const dialogOf = (m) => m.querySelector('.modal__dialog');
  let active = null;       // 'profile' | 'chat' | null
  let pageTrigger = null;  // element on the page that started the flow
  let savedY = 0;

  const lockPage = (trigger) => {
    pageTrigger = trigger;
    savedY = window.scrollY;
    document.body.classList.add('modal-open');
    backgroundParts.forEach((n) => { n.inert = true; });
  };

  const unlockPage = () => {
    document.body.classList.remove('modal-open');
    backgroundParts.forEach((n) => { n.inert = false; });
    window.scrollTo(0, savedY);
    if (pageTrigger && pageTrigger.isConnected) pageTrigger.focus({ preventScroll: true });
    pageTrigger = null;
  };

  const closeActive = () => {
    if (!active) return;
    (active === 'profile' ? profileModal : chatModal).hidden = true;
    active = null;
    unlockPage();
  };

  /* ---------- Profile modal ---------- */
  let profileArtist = null;
  const profileAction = $('profile-action');

  const syncProfileAction = () => {
    const a = profileArtist;
    profileAction.disabled = false;
    profileAction.classList.remove('btn--sent');
    if (a.friend) profileAction.textContent = 'محادثة معه';
    else if (requested.has(a.id)) { profileAction.textContent = 'تم إرسال الطلب'; profileAction.disabled = true; profileAction.classList.add('btn--sent'); }
    else profileAction.textContent = 'إضافة صديق';
  };

  const openProfile = (a, trigger) => {
    if (!active) lockPage(trigger);
    profileArtist = a;
    const cover = $('profile-cover'), avatar = $('profile-avatar');
    cover.src = a.cover; cover.alt = `صورة غلاف ملف ${a.name}`;
    avatar.src = a.avatar; avatar.alt = `صورة ${a.name} الشخصية`;
    $('profile-name').textContent = a.name;
    $('stat-friends').textContent = fmt(a.friends);
    $('stat-followers').textContent = fmt(a.followers);
    $('stat-works').textContent = fmt(a.works);
    $('stat-communities').textContent = fmt(a.communities);
    $('profile-grid').replaceChildren(...(a.gallery.length ? a.gallery.map((src, k) => {
      const fig = el('figure');
      const img = el('img');
      Object.assign(img, { src, alt: `عمل فني رقم ${fmt(k + 1)} للفنان ${a.name}`, width: 800, height: 600, loading: 'lazy' });
      fig.append(img);
      return fig;
    }) : [el('p', 'profile__empty', 'لا توجد رسومات لهذا الفنان حتى الآن.')]));
    syncProfileAction();
    profileModal.hidden = false;
    active = 'profile';
    const dlg = dialogOf(profileModal);
    dlg.scrollTop = 0;
    dlg.focus();
  };

  profileAction.addEventListener('click', () => {
    if (profileArtist.friend) openChat(profileArtist);
    else sendRequest(profileArtist.id);
  });
  $('profile-close').addEventListener('click', closeActive);

  /* ---------- Friend requests ---------- */
  const sendRequest = (id) => {
    if (requested.has(id)) return;
    requested.add(id); // in-memory demo only – nothing is sent anywhere
    syncAddButton(nodes[id].btn, id);
    if (active === 'profile' && profileArtist.id === id) syncProfileAction();
  };

  main.addEventListener('click', (e) => {
    const profileBtn = e.target.closest('[data-profile]');
    const chatBtn = e.target.closest('[data-chat]');
    const addBtn = e.target.closest('[data-add]');
    if (profileBtn) openProfile(byId[profileBtn.dataset.profile], profileBtn);
    else if (chatBtn) openChat(byId[chatBtn.dataset.chat], chatBtn);
    else if (addBtn) sendRequest(addBtn.dataset.add);
  });

  /* ---------- Chat ---------- */
  const messagesEl = $('chat-messages'), chatForm = $('chat-form'), chatInput = $('chat-input');
  let chatArtist = null;

  const renderMessage = (m) => {
    const bubble = el('div', `msg msg--${m.from}`);
    bubble.append(el('p', '', m.text), el('span', 'msg__time', m.time));
    return bubble;
  };
  const scrollBottom = () => { messagesEl.scrollTop = messagesEl.scrollHeight; };

  const openChat = (a, trigger) => {
    if (!active) lockPage(trigger);
    if (active === 'profile') profileModal.hidden = true; // never two backdrops at once
    chatArtist = a;
    $('chat-avatar').src = a.avatar;
    $('chat-avatar').alt = `صورة ${a.name} الشخصية`;
    $('chat-name').textContent = a.name;
    messagesEl.replaceChildren(...(chats[a.id] || []).map(renderMessage));
    chatInput.value = '';
    chatModal.hidden = false;
    active = 'chat';
    dialogOf(chatModal).focus();
    scrollBottom();
  };

  $('chat-close').addEventListener('click', closeActive);
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) { chatInput.value = ''; return; } // empty / whitespace-only messages are ignored
    const m = { from: 'me', text, time: nowTime() };
    (chats[chatArtist.id] || (chats[chatArtist.id] = [])).push(m); // in-memory demo only
    messagesEl.append(renderMessage(m));
    chatInput.value = '';
    chatInput.focus();
    scrollBottom();
  });

  /* ---------- Global modal behaviour ---------- */
  [profileModal, chatModal].forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeActive(); }));

  document.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'Escape') { closeActive(); return; }
    if (e.key !== 'Tab') return;
    const dlg = dialogOf(active === 'profile' ? profileModal : chatModal);
    const items = [...dlg.querySelectorAll('button, input, [href]')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
