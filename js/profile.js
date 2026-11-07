'use strict';
renderChrome();
if(gate()){
const arts=allArts().filter(a=>a.owner==='me');
$('#acct').innerHTML=`${img(ME.avatar,S.session.name,'round')}<h1>${esc(S.session.name)}</h1><p style="color:var(--mut)" dir="ltr">${esc(S.session.email)}</p>
<div class="row"><button class="btn" id="view">عرض ملفي الشخصي</button><button class="btn ghost" id="out">تسجيل الخروج</button></div>
<p class="note">${arts.length} رسومات · ${S.friends.length} أصدقاء · ${S.joined.length} مجتمعات. الحساب هنا محاكاة محلية، والحفظ الدائم يتطلب خادمًا.</p>`;
$('#view').onclick=openMyProfile;$('#out').onclick=()=>{S.session=null;save();location.href='index.html'};}
