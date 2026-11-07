'use strict';
renderChrome();
const items=$$('.faq details');
items.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)items.forEach(o=>{if(o!==d)o.open=false})}));
