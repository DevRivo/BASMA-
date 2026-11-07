'use strict';
renderChrome();
if(gate()){
const q=$('#q'),cat=$('#cat');
cat.innerHTML=['كل الفئات',...COMM_CATS].map(c=>`<option>${c}</option>`).join('');
const members=c=>c.members+(S.joinAdd[c.id]||0),joined=c=>S.joined.includes(c.id);
const card=c=>`<article class="card comm" data-id="${c.id}">${img(c.img,c.name,'cover')}<div class="comm-body"><h3>${esc(c.name)}</h3><span class="tag">${esc(c.cat)}</span><p>${esc(c.desc)}</p><small>${members(c)} عضو</small>
 <button class="btn ${joined(c)?'open':'join'}">${joined(c)?'فتح المحادثة':'انضم للمجتمع'}</button></div></article>`;
function render(){const t=q.value.trim().toLowerCase(),k=cat.value,r=allComms().filter(c=>(k==='كل الفئات'||c.cat===k)&&(!t||[c.name,c.desc,c.cat].some(x=>x.toLowerCase().includes(t))));
 const mine=r.filter(joined),oth=r.filter(c=>!joined(c));
 $('#myList').innerHTML=mine.map(card).join('');$('#newList').innerHTML=oth.map(card).join('');
 $('#mine').hidden=!mine.length;$('#discover').hidden=!oth.length;$('#none').hidden=r.length>0}
function openGroup(c){openChat({key:'grp:'+c.id,name:c.name,avatar:c.img,sub:members(c)+' عضو',desc:c.desc,group:true,
 seed:c.creator?[{from:'بصمة',text:'تم إنشاء المجتمع. ابدأ الحديث مع أعضائه!'}]:[{from:'سارة محمود',text:'أهلًا بالجميع في '+c.name+' 🎨'},{from:'كريم عادل',text:'مين جرّب خامة جديدة الأسبوع ده؟'}]})}
document.addEventListener('click',e=>{const el=e.target.closest('.comm');if(!el)return;const c=allComms().find(x=>x.id===el.dataset.id);
 if(e.target.closest('.join')){if(!joined(c)){S.joined.push(c.id);S.joinAdd[c.id]=(S.joinAdd[c.id]||0)+1;save();render();toast('انضممت إلى '+c.name)}}
 else if(e.target.closest('.open'))openGroup(c)});
q.oninput=render;cat.onchange=render;render();
$('#mkBtn').onclick=()=>{
 const m=openModal({label:'إنشاء مجتمع',html:`<h2>إنشاء مجتمعك</h2><form novalidate>
 <div class="field"><label for="m-img">صورة المجتمع</label><input id="m-img" type="file" accept="image/*"><img class="preview" alt="" hidden><span class="err"></span></div>
 <div class="field"><label for="m-n">اسم المجتمع</label><input id="m-n" maxlength="50"><span class="err"></span></div>
 <div class="field"><label for="m-c">التصنيف</label><select id="m-c">${COMM_CATS.map(c=>`<option>${c}</option>`).join('')}</select><span class="err"></span></div>
 <div class="field"><label for="m-d">وصف المجتمع</label><textarea id="m-d" maxlength="200"></textarea><span class="err"></span></div>
 <button class="btn" style="width:100%">إنشاء مجتمعك</button></form>`});
 let data=null;const er=id=>$('#'+id,m.el).closest('.field').querySelector('.err');
 $('#m-img',m.el).onchange=async e=>{data=null;const p=$('.preview',m.el);p.hidden=true;er('m-img').textContent='';const f=e.target.files[0];if(!f)return;
  try{data=await readImage(f,800);p.src=data;p.hidden=false}catch(x){er('m-img').textContent=x.message;e.target.value=''}};
 $('form',m.el).onsubmit=e=>{e.preventDefault();const v=id=>$('#'+id,m.el).value.trim(),E={};
  if(!data)E['m-img']='اختر صورة للمجتمع.';if(!v('m-n'))E['m-n']='اكتب اسم المجتمع.';if(!v('m-d'))E['m-d']='اكتب وصفًا للمجتمع.';
  ['m-img','m-n','m-c','m-d'].forEach(id=>er(id).textContent=E[id]||'');if(Object.keys(E).length)return;
  const c={id:'u'+Date.now(),name:v('m-n'),cat:v('m-c'),desc:v('m-d'),img:data,members:1,creator:true};S.created.unshift(c);S.joined.push(c.id);save();m.close();render();toast('تم إنشاء مجتمعك ✅')}}}
