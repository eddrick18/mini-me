// Review-only form interactions. These do not persist or modify application data.
let manualCategory='Music', sessionCategory='Studying';
const manualDraft={};
const originalRender=render;
const pristine=new Map(specs.map(s=>[s.key,JSON.stringify(s)]));
const manualKeys=['log','logError','logSaving','saveError'];
function resetSpec(key){Object.assign(byKey.get(key),JSON.parse(pristine.get(key)));}
render=function(key,focus=true){
 const actual=byKey.has(key)?key:'home';resetSpec(actual);const s=byKey.get(actual);
 if(['workSession','gymSession','runSession','musicSession'].includes(actual))sessionCategory=s.title;
 if(manualKeys.includes(actual))for(const p of s.parts){if(p.type==='activity')p.title=manualCategory;if(p.type==='field'&&manualDraft[p.label]!==undefined)p.value=manualDraft[p.label];}
 if(['session','paused','finish','reward','homeAfter','detail','history'].includes(actual))Object.assign(s,JSON.parse(JSON.stringify(s).replaceAll('Studying',sessionCategory).replaceAll('studying',sessionCategory.toLowerCase())));
 if(['logReward','manualHome','manualDetail'].includes(actual)){
  const minutes=Number(manualDraft['Active minutes']||15),xp=minutes>=20?30:minutes>=5?20:0,total=80+xp,level=total>=100?2:1;
  if(actual==='logReward')Object.assign(s,{title:xp?'Your activity is saved.':'A small moment counts.',subtitle:manualCategory+' · '+minutes+' minutes saved',parts:[{type:'room',label:'Your activity is recorded'},{type:'text',value:'+'+xp+' XP',style:'display',color:'primary'},{type:'progress',total,level},{type:'notice',title:level===2?'Clothing palette unlocked':'Saved to your history',message:level===2?'Level 2 brings new shirt colors.':xp?'Every earned point stays yours.':'XP starts at 5 active minutes. Short activities still belong here.'}]});
  if(actual==='manualHome')s.parts=s.parts.map(p=>p.type==='progress'?{...p,total,level}:p.type==='card'?{...p,message:manualCategory+' · '+minutes+' minutes',tail:xp+' / 120 daily XP'}:p);
  if(actual==='manualDetail'){s.title=manualCategory;s.parts[0]={...s.parts[0],title:minutes+' active minutes',message:manualDraft['Note (optional)']||'A favorite album',tail:xp+' XP earned'};}
 }
 originalRender(actual,focus);
 if(manualKeys.includes(actual)){
  const form=document.getElementById('review-form');form.addEventListener('input',e=>{if(e.target.dataset.field)manualDraft[e.target.dataset.field]=e.target.value;});
  const input=form.querySelector('[data-field="Active minutes"]'),save=document.querySelector('.phone-footer [data-to="logReward"]');
  if(save){const help=document.getElementById(input.getAttribute('aria-describedby'));const validate=()=>{const invalid=!Number.isInteger(Number(input.value))||Number(input.value)<1;save.disabled=invalid;input.setAttribute('aria-invalid',String(invalid));input.closest('.field').classList.toggle('error',invalid);help.textContent=invalid?'Enter a whole number of at least 1 active minute.':'Enter active time, excluding pauses';};validate();input.addEventListener('input',validate);}
 }
};
document.addEventListener('click',e=>{
 if(e.target.closest('#restart')){manualCategory='Music';sessionCategory='Studying';for(const key of Object.keys(manualDraft))delete manualDraft[key];}
 const n=e.target.closest('.activity');if(n){const category=n.querySelector('.label')?.textContent;if(current==='logPicker')manualCategory=category;if(current==='picker')sessionCategory=category;}
},true);
for(const key of ['workSession','gymSession','runSession','musicSession']){
 const s=byKey.get(key);s.parts.find(p=>p.style==='timer').value='25:00';s.actions=[{label:'Pause session',to:'paused',style:'Secondary'},{label:'Finish session',to:'finish'}];pristine.set(key,JSON.stringify(s));
}
render(current,false);
