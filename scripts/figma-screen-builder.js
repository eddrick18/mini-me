// Figma Plugin API helpers for the review proposal, not application runtime code.
// The caller provides F, C, specs, and the current page; all IDs are returned.
const created = [], screens = {}, links = [];
const V = {};
for (const [name, id] of Object.entries(F.variables)) V[name] = await figma.variables.getVariableByIdAsync(id);
for (const font of [{family:'Inter',style:'Regular'},{family:'Inter',style:'Semi Bold'},{family:'Space Grotesk',style:'Bold'},{family:'Space Grotesk',style:'Medium'}]) await figma.loadFontAsync(font);
const cache = {};
async function component(id) { return cache[id] ||= await figma.getNodeByIdAsync(id); }
function track(n) { created.push(n.id); return n; }
function paint(key) { return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',V['color/'+key]); }
function fill(n,key) { n.fills = [paint(key)]; }
function bind(n,p,key) { n.setBoundVariable(p,V[key]); }
function corners(n,key='control') { for(const p of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) bind(n,p,'radius/'+key); }
function stack(parent,name,width=342,gap='md',direction='VERTICAL') {
  const n = track(figma.createAutoLayout(direction)); parent.appendChild(n); n.name=name;
  n.resize(width,10); n.primaryAxisSizingMode='AUTO'; n.counterAxisSizingMode='FIXED';
  n.fills=[]; bind(n,'itemSpacing','space/'+gap); return n;
}
async function text(parent,value,style='body',color='text',width=342) {
  const n=track(figma.createText()); n.fontName={family:'Inter',style:'Regular'};
  await n.setTextStyleIdAsync(F.styles[style]); n.characters=value; fill(n,color);
  parent.appendChild(n); n.textAutoResize='HEIGHT'; n.resize(width,n.height); n.name=value.slice(0,50); return n;
}
async function instance(parent,family,variant,props={},width) {
  const def=C[family], id=def.variants?def.variants[variant]:def.componentId;
  const n=track((await component(id)).createInstance()); parent.appendChild(n);
  if(Object.keys(props).length)n.setProperties(props);
  if(width)n.resize(width,n.height);
  return n;
}
async function button(parent,label,to,style='Primary',state='Default',width=342) {
  const n=await instance(parent,'Button',`Style=${style}, State=${state}`,{[C.Button.labelProperty]:label},width);
  n.name='Action / '+label; if(to&&state!=='Disabled'&&state!=='Saving')links.push({nodeId:n.id,to,label}); return n;
}
async function notice(parent,title,message,tone='selected') {
  const n=stack(parent,'Notice / '+title,342,'sm'); fill(n,tone); corners(n);
  for(const p of ['paddingLeft','paddingRight','paddingTop','paddingBottom'])bind(n,p,'space/lg');
  await text(n,title,'label',tone==='errorSurface'?'error':'text',310);
  await text(n,message,'caption','muted',310); return n;
}
async function card(parent,title,message,tail,to) {
  const n=stack(parent,'Card / '+title,342,'xs'); fill(n,'surface'); corners(n);
  for(const p of ['paddingLeft','paddingRight','paddingTop','paddingBottom'])bind(n,p,'space/lg');
  await text(n,title,'label','text',310); await text(n,message,'body','muted',310);
  if(tail)await text(n,tail,'caption','primary',310);
  if(to)links.push({nodeId:n.id,to,label:title}); return n;
}
async function room(parent,label='Ready when you are',fallback=false) {
  const n=await instance(parent,'Room',null); n.name='Character room / '+label;
  await text(parent,label,'smallStrong','muted');
  if(fallback)await notice(parent,'Still pose shown','The animation could not load. You can keep using the app.');
}
async function progress(parent,total=80,level=1) {
  await text(parent,'Level '+level+' · '+(level===1?total+'/100':(total-100)+'/200')+' XP','label');
  const rail=stack(parent,'XP progress',342,'zero','HORIZONTAL'); rail.resize(342,8); rail.primaryAxisSizingMode='FIXED';fill(rail,'border');
  const bar=track(figma.createRectangle()); rail.appendChild(bar);bar.resize(level===1?342*total/100:342*(total-100)/200,8);fill(bar,'primary');
  await text(parent,level===1?'Next: clothing palette at level 2':'Next: a room decoration at level 3','caption','muted');
}
async function activity(parent,title,description,to,selected=false) {
  const d=C['Activity row'];const n=await instance(parent,'Activity row','State='+(selected?'Selected':'Default'),{[d.titleProperty]:title,[d.descriptionProperty]:description});
  if(to)links.push({nodeId:n.id,to,label:title});return n;
}
async function field(parent,label,value,help,state='Default') {
  const d=C.Field;return instance(parent,'Field','State='+state,{[d.labelProperty]:label,[d.valueProperty]:value,[d.helpProperty]:help});
}
async function choices(parent,labels,selected,to) {
  const row=stack(parent,'Choices',342,'md','HORIZONTAL');
  for(const label of labels){const n=await instance(row,'Choice','State='+(label===selected?'Selected':'Default'),{[C.Choice.labelProperty]:label});if(to)links.push({nodeId:n.id,to,label});}
}
const wrapper=await figma.getNodeByIdAsync(F.wrapperId);
const row=stack(wrapper,rowName,3824,'xl','HORIZONTAL');
row.counterAxisAlignItems='MIN';
for (const s of specs) {
  if(wrapper.findOne(n=>n.name==='Screen / '+s.key))throw new Error('Screen exists: '+s.key);
  const column=stack(row,'Review / '+s.key,390,'md');
  await text(column,s.label,'smallStrong','muted',390);
  const phone=stack(column,'Screen / '+s.key,390,'md');phone.resize(390,844);phone.primaryAxisSizingMode='FIXED';fill(phone,'background');corners(phone,'room');phone.clipsContent=true;
  for(const p of ['paddingLeft','paddingRight'])bind(phone,p,'space/page');bind(phone,'paddingTop','space/lg');bind(phone,'paddingBottom','space/page');
  screens[s.key]=phone.id;
  const status=stack(phone,'Status bar',342,'md','HORIZONTAL');await text(status,'9:41','smallStrong','text',252);await text(status,'●  ▰','smallStrong','text',78);
  const heading=stack(phone,'Heading',342,'xs');await text(heading,s.title,'display');await text(heading,s.subtitle||'Mini Me · personal activity companion','caption','muted');
  const viewport=track(figma.createFrame());phone.appendChild(viewport);viewport.name='Scrollable content';viewport.resize(342,540);viewport.layoutSizingVertical='FILL';viewport.fills=[];viewport.clipsContent=true;viewport.overflowDirection='VERTICAL';
  const body=stack(viewport,'Content',342,'lg');
  for(const part of s.parts){
    if(part.type==='text')await text(body,part.value,part.style||'body',part.color||'text');
    if(part.type==='room')await room(body,part.label,part.fallback);
    if(part.type==='progress')await progress(body,part.total,part.level);
    if(part.type==='notice')await notice(body,part.title,part.message,part.tone);
    if(part.type==='card')await card(body,part.title,part.message,part.tail,part.to);
    if(part.type==='activity')await activity(body,part.title,part.description,part.to,part.selected);
    if(part.type==='field')await field(body,part.label,part.value,part.help,part.state);
    if(part.type==='choices')await choices(body,part.labels,part.selected,part.to);
    if(part.type==='button')await button(body,part.label,part.to,part.style,part.state);
    if(part.type==='toggle'){const n=await instance(body,'Toggle','State='+part.state,{[C.Toggle.labelProperty]:part.label});if(part.to)links.push({nodeId:n.id,to:part.to,label:part.label});}
  }
  const footer=stack(phone,'Persistent actions',342,'sm');
  for(const a of s.actions||[])await button(footer,a.label,a.to,a.style,a.state);
  if(s.nav){const nav=stack(footer,'Main navigation',342,'zero','HORIZONTAL');for(const [label,key]of [['Home',s.homeTarget||'home'],['History','history'],['Character','character'],['Settings','settings']]){const n=await instance(nav,'Nav item','State='+(label===s.nav?'Selected':'Default'),{[C['Nav item'].labelProperty]:label},85.5);links.push({nodeId:n.id,to:key,label});}}
  await text(column,s.note||'Editable design · sample data','caption','muted',390);
}
return {createdNodeIds:created,screens,links,rowId:row.id,bounds:specs.map(s=>({key:s.key,id:screens[s.key]}))};
