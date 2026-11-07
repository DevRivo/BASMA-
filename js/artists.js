'use strict';
renderChrome();
if(gate()){
const q=$('#q');
const isFriend=id=>S.friends.includes(id),isSent=id=>S.sent.includes(id);
function openArtistChat(a){openChat({key:'dm:'+a.id,name:a.name,avatar:a.avatar,sub:'نشط الآن',seed:CHAT_SEED[a.id]||['أهلًا! نورت بصمة 🌿']})}
function person(a){return `<article class="card person" data-id="${a.id}">${img(a.avatar,a.name,'round open')}<h3 class="open" tabindex="0" role="button">${esc(a.name)}</h3>
 ${isFriend(a.id)?'<button class="btn chat">محادثة معه</button>':`<button class="btn add" ${isSent(a.id)?'disabled':''}>${isSent(a.id)?'تم إرسال الطلب':'أضف صديق'}</button>`}</article>`}
function render(){const t=q.value.trim().toLowerCase(),m=a=>!t||a.name.toLowerCase().includes(t);
 const fr=ARTISTS.filter(a=>isFriend(a.id)&&m(a)),ds=ARTISTS.filter(a=>!isFriend(a.id)&&m(a));
 $('#friends').innerHTML=fr.map(person).join('');$('#disc').innerHTML=ds.map(person).join('');
 $('#friendsSec').hidden=!fr.length;$('#discover').hidden=!ds.length;$('#none').hidden=fr.length+ds.length>0}
function sendRequest(id){if(!S.sent.includes(id)){S.sent.push(id);save()}render()}
function openArtist(id){const a=ARTISTS.find(x=>x.id===id),arts=ARTS.filter(x=>x.owner===id);
 const act=()=>isFriend(id)?'<button class="btn" id="pAct">محادثة معه</button>':`<button class="btn" id="pAct" ${isSent(id)?'disabled':''}>${isSent(id)?'تم إرسال الطلب':'إضافة صديق'}</button>`;
 const m=openModal({cls:'wide flush',label:'ملف '+a.name,html:profileHTML({...a,action:act(),stats:[a.friendsBase,a.followers,arts.length,a.comms],arts})});
 bindArtCards($('.pf-arts',m.el)||m.el);
 const btn=()=>$('#pAct',m.el);
 btn().onclick=()=>{if(isFriend(id))openArtistChat(a);else{sendRequest(id);const b=btn();b.disabled=true;b.textContent='تم إرسال الطلب'}}}
document.addEventListener('click',e=>{const c=e.target.closest('.person');if(!c)return;const id=c.dataset.id,a=ARTISTS.find(x=>x.id===id);
 if(e.target.closest('.chat'))openArtistChat(a);else if(e.target.closest('.add'))sendRequest(id);else if(e.target.closest('.open'))openArtist(id)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('h3.open'))e.target.click()});
q.oninput=render;render();}
