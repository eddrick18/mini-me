// Shared animated-scene controller for the design review. No timers or app records are changed.
let preferStill=false, motionPaused=false;
let sceneObserver;
const motionMedia=matchMedia('(prefers-reduced-motion: reduce)');
const motionProps={
 studying:'<path fill="#FFFDF7" stroke="#6941D9" stroke-width="1" d="M9 38h10l1 2 1-2h10v12H21l-1 2-1-2H9z"/><path stroke="#6941D9" d="M20 40v10M12 42h4M24 42h4M12 45h4M24 45h4"/>',
 working:'<path fill="#6941D9" stroke="#282348" d="M9 38h22v13H9z"/><path fill="#93DDF1" d="M11 40h18v8H11z"/><path fill="#282348" d="M7 51h26v3H7z"/>',
 gym:'<path fill="#282348" d="M4 42h32v3H4zM3 38h4v11H3zM8 36h4v15H8zM28 36h4v15h-4zM33 38h4v11h-4z"/>',
 music:'<path fill="none" stroke="#6941D9" stroke-width="3" d="M8 23v-6c0-14 24-14 24 0v6"/><path fill="#6941D9" stroke="#282348" d="M6 19h5v10H6zM29 19h5v10h-5z"/>',
 running:''
};
function rigPixel(svg){
 const groups={head:[],body:[],leftArm:[],rightArm:[],leftLeg:[],rightLeg:[]};
 // Existing raster-like SVG runs are partitioned at the shoulder/hip joints.
 for(const node of [...svg.querySelectorAll('rect')]){
  const x=Number(node.getAttribute('x')),y=Number(node.getAttribute('y')),width=Number(node.getAttribute('width'));
  // Split runs crossing a joint: one run can contain both torso and sleeve pixels.
  const cuts=[x,...[12,20,y>=47?29:28].filter(v=>v>x&&v<x+width).sort((a,b)=>a-b),x+width];
  for(let i=0;i<cuts.length-1;i++){const left=cuts[i],piece=node.cloneNode();piece.setAttribute('x',String(left));piece.setAttribute('width',String(cuts[i+1]-left));const part=y<30?'head':y>=52?(left<20?'leftLeg':'rightLeg'):y>=31&&left<12?'leftArm':y>=31&&left>=(y>=47?29:28)?'rightArm':'body';groups[part].push(piece);}
  node.remove();
 }
 // Keep the collar on the torso and overlap the neck behind the moving chin.
 const neck=document.createElementNS('http://www.w3.org/2000/svg','rect');
 for(const [name,value]of Object.entries({x:16,y:28,width:8,height:5,fill:({Warm:'#C98B5C',Golden:'#D59C68',Deep:'#975F42'})[selectedSkin]}))neck.setAttribute(name,String(value));
 svg.prepend(neck);
 const shirt=({Navy:'#293747',Gold:'#B7802E',Rust:'#A5553D'})[selectedShirt];
 // Overlapping shoulder caps and hip band keep rotating limbs attached to the torso.
 const joints=document.createElementNS('http://www.w3.org/2000/svg','g');joints.setAttribute('class','rig-joints');
 joints.innerHTML=`<path fill="${shirt}" d="M9 31h6v8H9zM25 31h6v8h-6z"/><path fill="#777169" d="M12 49h16v5H12z"/>`;
 svg.append(joints);
 for(const [name,nodes]of Object.entries(groups)){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','rig-'+name);for(const n of nodes)g.append(n);svg.append(g);}
 const blink=document.createElementNS('http://www.w3.org/2000/svg','g');blink.setAttribute('class','rig-blink');blink.innerHTML='<path fill="#C98B5C" d="M13 21h3v4h-3zM24 21h3v4h-3z"/><path fill="#352C2A" d="M13 23h3v1h-3zM24 23h3v1h-3z"/>';svg.querySelector('.rig-head').append(blink);
 // Match closed eyelids to the selected skin rather than painting over it with the default.
 blink.firstElementChild.setAttribute('fill',({Warm:'#C98B5C',Golden:'#D59C68',Deep:'#975F42'})[selectedSkin]);
}
function syncMotion(){document.body.classList.toggle('scene-still',preferStill||motionPaused||motionMedia.matches);document.body.classList.toggle('scene-hidden',document.hidden);const b=document.getElementById('scene-motion');if(b){b.textContent=motionPaused?'Play animations':'Pause animations';b.setAttribute('aria-pressed',String(motionPaused));}}
const beforeMotionRender=render;
render=function(key,focus=true){beforeMotionRender(key,focus);
 sceneObserver?.disconnect();
 if(current==='settingsStill')preferStill=true;
 if(current==='settings'){const toggle=document.querySelector('.phone [role="switch"]');toggle.setAttribute('aria-checked',String(preferStill));toggle.dataset.to=preferStill?'settings':'settingsStill';toggle.querySelector('.small-strong').textContent=preferStill?'ON · Still poses':'OFF · Follow device';}
 for(const room of document.querySelectorAll('.phone .room')){
  let state='idle';if(['session','workSession','gymSession','runSession','musicSession','interrupted'].includes(current))state=({Studying:'studying',Working:'working',Gym:'gym',Running:'running',Music:'music'})[sessionCategory]||'studying';if(['reward','logReward','capReward','categoryCap'].includes(current))state='celebrating';if(current==='paused')state='paused';if(current==='assetFallback')state='fallback';
  room.dataset.motion=state;const svg=room.querySelector('.sprite svg');rigPixel(svg);
  const propState=state==='paused'?({Studying:'studying',Working:'working',Gym:'gym',Running:'running',Music:'music'})[sessionCategory]:state;
  if(motionProps[propState]){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','rig-prop');g.innerHTML=motionProps[propState];svg.append(g);}
  if(state==='celebrating'){room.insertAdjacentHTML('beforeend','<span class="scene-spark spark-one" aria-hidden="true">✦</span><span class="scene-spark spark-two" aria-hidden="true">✦</span>');room.querySelector('.sprite').addEventListener('animationend',e=>{if(e.animationName==='celebrate-hop'){room.dataset.motion='idle';room.querySelectorAll('.scene-spark').forEach(n=>n.remove());}});}
  const label=room.nextElementSibling;if(label)label.textContent=({idle:'Ready when you are',paused:'Taking a breather',fallback:'Still pose shown',celebrating:'A little celebration for your progress'})[state]||sessionCategory+' · animated companion';
 }
 sceneObserver=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('scene-offscreen',!entry.isIntersecting);});
 document.querySelectorAll('.phone .room').forEach(room=>sceneObserver.observe(room));
 if(['session','workSession','gymSession','runSession','musicSession'].includes(current))document.getElementById('screen-note').textContent='Live character and background animation. The timer remains sample data.';
 if(['character','characterEquipped'].includes(current))document.getElementById('form-note').textContent='Skin and shirt colors preview live. Alternative hair artwork is still pending.';
 syncMotion();
};
const motionControl=document.createElement('button');motionControl.id='scene-motion';motionControl.className='tool';motionControl.type='button';document.querySelector('.review-tools').append(motionControl);motionControl.addEventListener('click',()=>{motionPaused=!motionPaused;syncMotion();});
document.addEventListener('click',e=>{const toggle=e.target.closest('.phone [role="switch"]');if(toggle&&preferStill){preferStill=false;toggle.dataset.to='settings';}},true);
document.getElementById('restart').addEventListener('click',()=>{preferStill=false;motionPaused=false;render('home',false);});
motionMedia.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncMotion);
render(current,false);
