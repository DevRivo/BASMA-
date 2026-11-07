'use strict';
renderChrome();
if(gate()){
const q=$('#q'),cat=$('#cat'),list=$('#list');
cat.innerHTML=['كل الرسومات',...ART_CATS].map(c=>`<option>${c}</option>`).join('');
bindArtCards(list);
function render(){const t=q.value.trim().toLowerCase(),c=cat.value;
 const r=allArts().filter(a=>(c==='كل الرسومات'||a.cat===c)&&(!t||[a.title,a.desc,artistById(a.owner).name].some(x=>x.toLowerCase().includes(t))));
 list.innerHTML=r.map(artCard).join('');$('#none').hidden=r.length>0}
q.oninput=render;cat.onchange=render;render();
$('#upBtn').onclick=()=>{
 const m=openModal({label:'عرض رسمة',html:`<h2>اعرض رسمتك</h2><form novalidate>
 <div class="field"><label for="u-img">صورة الرسمة</label><input id="u-img" type="file" accept="image/*"><img class="preview" alt="" hidden><span class="err"></span></div>
 <div class="field"><label for="u-t">اسم الرسمة</label><input id="u-t" maxlength="60"><span class="err"></span></div>
 <div class="field"><label for="u-c">التصنيف</label><select id="u-c"><option value="">اختر التصنيف</option>${ART_CATS.map(c=>`<option>${c}</option>`).join('')}</select><span class="err"></span></div>
 <div class="field"><label for="u-d">الوصف</label><textarea id="u-d" maxlength="240"></textarea><span class="err"></span></div>
 <button class="btn" style="width:100%">اعرض رسمتك</button></form>`});
 let data=null;const f=m.el.querySelector('form'),er=id=>$('#'+id,m.el).closest('.field').querySelector('.err');
 $('#u-img',m.el).onchange=async e=>{data=null;const p=$('.preview',m.el);p.hidden=true;er('u-img').textContent='';const file=e.target.files[0];if(!file)return;
  try{data=await readImage(file);p.src=data;p.hidden=false}catch(x){er('u-img').textContent=x.message;e.target.value=''}};
 f.onsubmit=e=>{e.preventDefault();const v=id=>$('#'+id,m.el).value.trim(),E={};
  if(!data)E['u-img']='اختر صورة للرسمة.';if(!v('u-t'))E['u-t']='اكتب اسم الرسمة.';if(!v('u-c'))E['u-c']='اختر تصنيف الرسمة.';if(!v('u-d'))E['u-d']='اكتب وصفًا قصيرًا.';
  ['u-img','u-t','u-c','u-d'].forEach(id=>er(id).textContent=E[id]||'');if(Object.keys(E).length)return;
  S.extraArts.unshift({id:'up'+Date.now(),img:data,owner:'me',title:v('u-t'),cat:v('u-c'),desc:v('u-d'),comments:[],likes:0});save();f.reset();data=null;m.close();render();toast('تم عرض رسمتك ✅')}}}
