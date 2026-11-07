'use strict';
/* Demo notifications: all data is local and simulated. */
if(gate()){
$('#back').onclick=()=>{if(history.length>1&&document.referrer&&new URL(document.referrer).origin===location.origin)history.back();else location.href='index.html'};
if(!S.notifs){S.notifs=[
 {id:'n1',type:'request',kind:'friend',from:'a5',t:6},{id:'n2',type:'request',kind:'comm',from:'a6',t:5},
 {id:'n3',type:'info',from:'a1',text:'أعجبت برسمة من رسوماتك.',t:4},{id:'n4',type:'result',from:'a2',text:'قبل طلب صداقتك، يمكنك الآن التحدث معه.',t:3},
 {id:'n5',type:'info',from:'a2',text:'أضاف تعليقًا على إحدى رسوماتك.',t:2.5},{id:'n6',type:'info',from:'a3',text:'بدأت بمتابعتك.',t:2},
 {id:'n7',type:'result',from:'a7',text:'رفضت طلب صداقتك.',t:1.5},{id:'n8',type:'info',from:'a4',text:'أرسل إليك رسالة جديدة.',t:1},{id:'n9',type:'info',from:'dev',t:0.5}];save()}
const msg={friend:'يطلب منك إرسال طلب صداقة، هل توافق عليه؟',comm:'يطلب الانضمام إلى مجتمعك، هل توافق على طلبه؟'};
const ago=t=>t<1?'منذ دقائق':`منذ ${Math.round(t)} ${t<=2?'ساعة':'ساعات'}`;
function card(n){const dev=n.from==='dev',a=dev?{name:'DevRivo',avatar:IMG+'logo.png'}:artistById(n.from);
 const body=n.type==='request'?`<p><b>${esc(a.name)}</b> ${msg[n.kind]}</p>${n.done?`<div class="fb ${n.done==='accepted'?'ok':''}">${n.done==='accepted'?'تم قبول الطلب ✅':'تم رفض الطلب'}</div>`:'<div class="row"><button class="btn sm" data-do="accepted">قبول</button><button class="btn ghost sm" data-do="rejected">رفض</button></div>'}`
  :`<p><b>${esc(a.name)}</b> ${dev?'أرسل تنبيهًا عامًا لجميع الأعضاء.':esc(n.text)}</p>`;
 return `<article class="n ${n.type==='info'?'info':n.type==='result'?'result':''} ${dev?'ann':''}" data-id="${n.id}">${img(a.avatar,a.name,'round')}<div>${body}<small>${ago(n.t)}</small></div></article>`}
const render=()=>$('#list').innerHTML=[...S.notifs].sort((x,y)=>x.t-y.t).map(card).join('');
$('#list').addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(!b)return;const n=S.notifs.find(x=>x.id===b.closest('.n').dataset.id);if(!n||n.done)return;
 n.done=b.dataset.do;
 if(n.done==='accepted'){if(n.kind==='friend'&&!S.friends.includes(n.from))S.friends.push(n.from);if(n.kind==='comm')S.joinAdd.c1=(S.joinAdd.c1||0)+1}
 save();render();toast(n.done==='accepted'?'تم قبول الطلب':'تم رفض الطلب')});
render()}
