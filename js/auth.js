'use strict';
/* Demo-only authentication: NOT secure. Real auth needs a backend. */
const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
function authHTML(tab){return `<div class="tabs" role="tablist"><button type="button" data-tab="login" class="${tab==='login'?'on':''}" role="tab">تسجيل الدخول</button><button type="button" data-tab="register" class="${tab==='register'?'on':''}" role="tab">إنشاء حساب</button></div>
<form id="authForm" novalidate>${tab==='register'?`<div class="field"><label for="a-name">اسم المستخدم</label><input id="a-name" autofocus><span class="err"></span></div>`:''}
<div class="field"><label for="a-mail">البريد الإلكتروني</label><input id="a-mail" type="email" dir="ltr" ${tab==='login'?'autofocus':''}><span class="err"></span></div>
<div class="field"><label for="a-pw">كلمة المرور</label><div class="pw"><input id="a-pw" type="password" dir="ltr"><button type="button" class="tgl" aria-label="إظهار كلمة المرور">👁</button></div><span class="err"></span></div>
${tab==='register'?`<div class="field"><label for="a-pw2">تأكيد كلمة المرور</label><div class="pw"><input id="a-pw2" type="password" dir="ltr"><button type="button" class="tgl" aria-label="إظهار كلمة المرور">👁</button></div><span class="err"></span></div>`:''}
<span class="err" id="a-msg" role="alert"></span><button class="btn" style="width:100%">${tab==='login'?'تسجيل الدخول':'إنشاء حساب'}</button></form>
<div class="social"><button type="button" class="btn ghost sm" data-social="Google">Google (تجريبي)</button><button type="button" class="btn ghost sm" data-social="Facebook">Facebook (تجريبي)</button></div>
<p class="note">${tab==='login'?'حساب تجريبي: demo@basma.art / 123456. ':''}الدخول هنا محاكاة محلية على متصفحك فقط، وأزرار Google وFacebook أماكن جاهزة للربط لاحقًا بخدمات حقيقية.</p>`}
function showAuth(tab='login',closable=true){
 const m=openModal({cls:'',label:'الدخول إلى بصمة',closable,html:`<h2>${closable?'أهلًا بيك في بصمة':'ادخل الأول 👋'}</h2><div id="authBody">${authHTML(tab)}</div>`+(closable?'':'<p style="margin-top:.8rem"><a href="index.html" class="btn ghost sm">العودة للرئيسية</a></p>')});
 const draw=t=>{$('#authBody',m.el).innerHTML=authHTML(t);bind()};
 function bind(){
  $$('[data-tab]',m.el).forEach(b=>b.onclick=()=>draw(b.dataset.tab));
  $$('.tgl',m.el).forEach(b=>b.onclick=()=>{const i=$('input',b.parentNode);i.type=i.type==='password'?'text':'password'});
  $$('[data-social]',m.el).forEach(b=>b.onclick=()=>enter({name:'مستخدم '+b.dataset.social+' (تجريبي)',email:b.dataset.social.toLowerCase()+'@demo.basma'}));
  $('#authForm',m.el).onsubmit=e=>{e.preventDefault();const reg=!!$('#a-name',m.el),v=id=>($('#'+id,m.el)||{value:''}).value.trim(),errs={};
   if(reg&&!v('a-name'))errs['a-name']='اكتب اسم المستخدم.';
   if(!v('a-mail'))errs['a-mail']='اكتب بريدك الإلكتروني.';else if(!emailOk(v('a-mail')))errs['a-mail']='صيغة البريد الإلكتروني غير صحيحة.';
   if(!v('a-pw'))errs['a-pw']='اكتب كلمة المرور.';else if(reg&&v('a-pw').length<6)errs['a-pw']='كلمة المرور لازم تكون 6 أحرف على الأقل.';
   if(reg&&v('a-pw2')!==v('a-pw'))errs['a-pw2']='كلمتا المرور غير متطابقتين.';
   $$('.err',m.el).forEach(x=>x.textContent='');Object.entries(errs).forEach(([id,t])=>$('#'+id,m.el).closest('.field').querySelector('.err').textContent=t);
   if(Object.keys(errs).length)return;const mail=v('a-mail').toLowerCase();
   if(reg){if(S.users[mail]){$('#a-msg',m.el).textContent='البريد ده مسجل قبل كده، جرّب تسجيل الدخول.';return}S.users[mail]={name:v('a-name'),pass:v('a-pw')};enter({name:v('a-name'),email:mail})}
   else{const u=S.users[mail];if(!u||u.pass!==v('a-pw')){$('#a-msg',m.el).textContent='البريد أو كلمة المرور غير صحيحة.';return}enter({name:u.name,email:mail})}}}
 bind();return m}
function enter(u){S.session=u;save();toast('تم الدخول بنجاح ✅');setTimeout(()=>location.reload(),500)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-auth]');if(b){e.preventDefault();showAuth(b.dataset.auth)}});
/* protected-page gate: logged-out visitors see the login interface instead of content */
function gate(){const p=document.body.dataset.protected==='true';if(p&&!isAuth()){$$('main,footer').forEach(x=>x.style.visibility='hidden');showAuth('login',false);return false}return true}
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a&&!isAuth()&&/(gallery|artists|communities|notifications|profile)\.html$/.test(a.getAttribute('href'))&&document.body.dataset.page==='home'){e.preventDefault();showAuth('login')}});
