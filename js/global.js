'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const FB_IMG="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23EFE3D9%22/%3E%3C/svg%3E'";
const img=(src,alt='',cls='')=>`<img src="${src}" alt="${esc(alt)}" class="${cls}" loading="lazy" onerror="${FB_IMG}">`;
/* ---------- state (frontend-only demo, localStorage) ---------- */
const KEY='basma_v1';
const defaults=()=>({session:null,users:{'demo@basma.art':{name:'لمى حسن',pass:'123456'}},friends:['a1','a2','a3','a4'],sent:[],extraArts:[],likes:{},comments:{},chats:{},joined:['c1','c2'],created:[],joinAdd:{},notifs:null,decided:{}});
let S;try{S=Object.assign(defaults(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=defaults()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('مساحة التخزين المحلية ممتلئة')}}
const isAuth=()=>!!S.session;
const allArts=()=>[...S.extraArts,...ARTS];
const allComms=()=>[...S.created,...COMMS];
const artistById=id=>id==='me'?{...ME,name:S.session?S.session.name:'أنا'}:ARTISTS.find(a=>a.id===id);
function toast(t){const e=document.createElement('div');e.className='toast';e.setAttribute('role','status');e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2400)}
function readImage(file,max=900){return new Promise((res,rej)=>{
 if(!file||!file.type.startsWith('image/'))return rej(new Error('الملف لازم يكون صورة فقط (JPG أو PNG أو WebP).'));
 const fr=new FileReader();fr.onerror=()=>rej(new Error('تعذر قراءة الصورة، جرّب ملفًا آخر.'));
 fr.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('الصورة غير صالحة.'));
  im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.src=fr.result};
 fr.readAsDataURL(file)})}
/* ---------- modal system (stack, scroll lock, focus trap, Esc) ---------- */
const stack=[];let lockY=0;
function openModal({html,cls='',label='',closable=true,onClose,back=false}){
 const ov=document.createElement('div');ov.className='overlay';
 ov.innerHTML=`<div class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1">${closable?`<button class="modal-x" data-close aria-label="${back?'رجوع':'إغلاق'}">${back?'→':'✕'}</button>`:''}${html}</div>`;
 if(!stack.length){lockY=window.scrollY;document.body.style.top=`-${lockY}px`;document.body.classList.add('locked')}
 const prevFocus=document.activeElement;document.body.appendChild(ov);
 const m=ov.firstElementChild,api={el:m,ov,closed:false,
  close(){if(api.closed)return;api.closed=true;const i=stack.indexOf(api);if(i>-1)stack.splice(i,1);ov.remove();
   if(!stack.length){document.body.classList.remove('locked');document.body.style.top='';window.scrollTo(0,lockY)}
   if(prevFocus&&prevFocus.focus&&document.contains(prevFocus))prevFocus.focus();onClose&&onClose()}};
 stack.push(api);requestAnimationFrame(()=>{ov.classList.add('show');(m.querySelector('[autofocus],input,textarea,select')||m).focus()});
 if(closable){ov.addEventListener('mousedown',e=>{if(e.target===ov)api.close()});m.addEventListener('click',e=>{if(e.target.closest('[data-close]'))api.close()})}
 api.closable=closable;return api}
document.addEventListener('keydown',e=>{const top=stack[stack.length-1];if(!top)return;
 if(e.key==='Escape'&&top.closable){top.close();return}
 if(e.key==='Tab'){const f=$$('button:not([disabled]),input:not([disabled]),select,textarea,a[href],[tabindex="0"]',top.el).filter(x=>x.offsetParent!==null);
  if(!f.length)return;const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&(document.activeElement===a||document.activeElement===top.el)){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
/* ---------- shared chrome ---------- */
const PAGE=document.body.dataset.page;
function unread(){return S.notifs?S.notifs.filter(n=>n.type==='request'&&!n.done).length:2}
function renderChrome(){
 const h=$('#site-header');
 if(h){const L=[['index.html','الرئيسية','home'],['gallery.html','رسومات','gallery'],['artists.html','فنانين','artists'],['communities.html','مجتمعات','communities']];
  h.className='site-header';
  h.innerHTML=`<div class="container nav"><a class="brand" href="index.html" aria-label="بصمة - الرئيسية">${img(IMG+'logo.png','شعار بصمة')}<span><b>بصمة</b><small>رؤيتك فن، وبصمتك تميّزك.</small></span></a>
  <nav class="nav-links" id="navlinks" aria-label="التنقل الرئيسي">${L.map(l=>`<a href="${l[0]}" class="${PAGE===l[2]?'active':''}" ${PAGE===l[2]?'aria-current="page"':''}>${l[1]}</a>`).join('')}</nav>
  <div class="nav-actions"><a class="icon-btn" href="notifications.html" aria-label="الإشعارات">🔔${isAuth()&&unread()?`<span class="badge">${unread()}</span>`:''}</a>
  ${isAuth()?`<button class="avatar-btn" id="meBtn" aria-label="ملفي الشخصي">${img(ME.avatar,S.session.name)}</button><button class="btn ghost sm" id="logoutBtn">تسجيل الخروج</button>`:`<button class="btn ghost sm" data-auth="login">تسجيل الدخول</button><button class="btn sm" data-auth="register">إنشاء حساب</button>`}
  <button class="icon-btn menu-toggle" id="menuBtn" aria-label="القائمة" aria-expanded="false">☰</button></div></div>`;
  $('#menuBtn').onclick=e=>{const o=$('#navlinks').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
  const me=$('#meBtn');if(me)me.onclick=()=>openMyProfile();
  const lo=$('#logoutBtn');if(lo)lo.onclick=()=>{S.session=null;save();location.href='index.html'}}
 const f=$('#site-footer');if(f){f.className='site-footer';f.innerHTML='<div>© جميع الحقوق محفوظة لـ بصمة Basma</div><small>Developed by DevRivo</small>'}}
/* ---------- artwork card ---------- */
function artCard(a){
 const o=artistById(a.owner),liked=!!S.likes[a.id],cm=[...a.comments,...(S.comments[a.id]||[])];
 return `<article class="card" data-art="${a.id}"><div class="art-head">${img(o.avatar,o.name)}<div><b>${esc(o.name)}</b><small>${esc(a.title)}</small></div></div>
 ${img(a.img,a.title,'art-img')}<div class="art-foot"><b>${esc(a.cat)}</b><p>${esc(a.desc)}</p>
 <div class="acts"><button class="act like ${liked?'on':''}" aria-pressed="${liked}">❤️ <span>${a.likes+(liked?1:0)}</span></button><button class="act cbtn" aria-expanded="false">💬 <span>${cm.length}</span></button></div>
 <div class="comments" hidden><ul>${cm.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><form><input type="text" placeholder="اكتب تعليقًا..." aria-label="تعليق"><button class="btn sm">إضافة</button></form><span class="err"></span></div></div></article>`}
function bindArtCards(root){
 root.addEventListener('click',e=>{const card=e.target.closest('[data-art]');if(!card)return;const id=card.dataset.art;
  const lk=e.target.closest('.like');if(lk){S.likes[id]=!S.likes[id];save();const a=allArts().find(x=>x.id===id),on=!!S.likes[id];lk.classList.toggle('on',on);lk.setAttribute('aria-pressed',on);$('span',lk).textContent=a.likes+(on?1:0)}
  const cb=e.target.closest('.cbtn');if(cb){const p=$('.comments',card);p.hidden=!p.hidden;cb.setAttribute('aria-expanded',!p.hidden);if(!p.hidden)$('input',p).focus()}});
 root.addEventListener('submit',e=>{const f=e.target.closest('.comments form');if(!f)return;e.preventDefault();const card=f.closest('[data-art]'),id=card.dataset.art,inp=$('input',f),v=inp.value.trim(),er=$('.err',card);
  if(!v){er.textContent='اكتب تعليقك الأول.';return}er.textContent='';
  (S.comments[id]=S.comments[id]||[]).push(`${S.session?S.session.name:'أنا'}: ${v}`);save();
  const li=document.createElement('li');li.textContent=S.comments[id].slice(-1)[0];$('ul',card).appendChild(li);$('.cbtn span',card).textContent=$$('li',card).length;inp.value=''})}
/* ---------- profile view (user + artist) ---------- */
function profileHTML(p){return `${img(p.cover,'',  'pf-cover')}<div class="pf-head">${img(p.avatar,p.name,'round')}<h2 style="padding:0">${esc(p.name)}</h2>${p.action||''}</div>
 <div class="stats"><div><b>${p.stats[0]}</b>عدد الأصدقاء</div><div><b>${p.stats[1]}</b>عدد المتابعين</div><div><b>${p.stats[2]}</b>عدد الرسومات</div><div><b>${p.stats[3]}</b>عدد المجتمعات المنضم إليها</div></div>
 <div class="pf-grid">${p.arts.length?`<div class="grid3 pf-arts">${p.arts.map(artCard).join('')}</div>`:'<div class="empty">لا توجد رسومات منشورة بعد</div>'}</div>`}
function openMyProfile(){
 const arts=allArts().filter(a=>a.owner==='me');
 const m=openModal({cls:'wide flush',label:'ملفي الشخصي',html:profileHTML({...ME,name:S.session.name,stats:[S.friends.length,ME.followers,arts.length,S.joined.length],arts})});
 const g=$('.pf-arts',m.el);if(g)bindArtCards(g);return m}
/* ---------- chat (private + group), text and image attachments only ---------- */
function openChat({key,name,avatar,sub,desc,group,seed=[],onBack}){
 const msgs=S.chats[key]=S.chats[key]||seed.map(t=>typeof t==='string'?{from:name,text:t}:t);
 const m=openModal({cls:'chat flush',label:'محادثة '+name,back:true,onClose:onBack,html:`<div class="chat-head">${img(avatar,name,'round')}<div><b>${esc(name)}</b><small>${esc(sub)}</small>${desc?`<small>${esc(desc)}</small>`:''}</div></div>
 <div class="chat-msgs" aria-live="polite"></div><div class="chat-err"><span class="err" id="cerr"></span></div><div class="chat-pv"><img alt="معاينة"><button class="act" type="button">إزالة ✕</button></div>
 <form class="chat-bar"><button type="button" class="icon-btn" id="att" aria-label="إرفاق صورة">+</button><input type="file" accept="image/*" hidden><input type="text" placeholder="اكتب رسالتك..." aria-label="رسالة" autocomplete="off"><button class="icon-btn" aria-label="إرسال">✈️</button></form>`});
 const box=$('.chat-msgs',m.el),fi=$('input[type=file]',m.el),ti=$('input[type=text]',m.el),pv=$('.chat-pv',m.el),er=$('#cerr',m.el);let pending=null;
 const add=x=>{const d=document.createElement('div');d.className='msg'+(x.from==='me'?' me':'');d.innerHTML=(group&&x.from!=='me'?`<b>${esc(x.from)}</b>`:'')+(x.text?esc(x.text):'')+(x.img?`<img src="${x.img}" alt="صورة مرسلة">`:'');box.appendChild(d);box.scrollTop=box.scrollHeight};
 msgs.forEach(add);
 $('#att',m.el).onclick=()=>fi.click();
 fi.onchange=async()=>{er.textContent='';const f=fi.files[0];fi.value='';if(!f)return;try{pending=await readImage(f,700);$('img',pv).src=pending;pv.classList.add('on')}catch(x){pending=null;er.textContent=x.message}};
 $('button',pv).onclick=()=>{pending=null;pv.classList.remove('on')};
 $('form',m.el).onsubmit=e=>{e.preventDefault();const t=ti.value.trim();if(!t&&!pending){er.textContent='اكتب رسالة أو أرفق صورة قبل الإرسال.';return}er.textContent='';
  const x={from:'me',text:t,img:pending};msgs.push(x);save();add(x);ti.value='';pending=null;pv.classList.remove('on')};
 return m}
