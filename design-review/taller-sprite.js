// Whole-character atlas playback replaces the prototype's individually transformed limbs.
let spritePlayback=0;
const beforeTallerRender=render;
function showTallerFrame(node,state,index){
 if(node.dataset.spriteState===state&&node.dataset.frame===String(index))return;
 const source=state==='running'?runningFrames:tallerFrames;
 const frame=source.states[state][index],scale=state==='running'?189/597:.78;
 node.style.width=frame.width*scale+'px';node.style.height=frame.height*scale+'px';
 node.style.backgroundImage=`url("${state==='running'?runningAtlas:tallerAtlas}")`;
 node.style.backgroundSize=`${source.width*scale}px ${source.height*scale}px`;
 node.style.backgroundPosition=`${-frame.x*scale}px ${-frame.y*scale}px`;
 node.dataset.frame=String(index);node.dataset.spriteState=state;
}
render=function(key,focus=true){
 cancelAnimationFrame(spritePlayback);beforeTallerRender(key,focus);
 const room=document.querySelector('.phone .room');
 if(room){const sprite=room.querySelector('.sprite');sprite.classList.add('taller-sprite');sprite.innerHTML='<span class="sprite-frame" aria-hidden="true"></span>';
  room.insertAdjacentHTML('afterbegin','<span class="world-depth" aria-hidden="true"></span><span class="world-ground-shadow" aria-hidden="true"></span><span class="world-stones" aria-hidden="true"></span>');
  room.querySelectorAll('.scene-spark').forEach(n=>n.remove());
  const frameNode=sprite.firstElementChild;
  let state=room.dataset.motion;if(['paused','fallback'].includes(state))state=current==='paused'?({Studying:'studying',Working:'working',Gym:'gym',Running:'running',Music:'music'})[sessionCategory]:'idle';
  let elapsed=0,last=0;
  showTallerFrame(frameNode,state,0);
  const tick=now=>{const still=preferStill||motionPaused||motionMedia.matches||room.dataset.motion==='paused'||room.dataset.motion==='fallback';const hidden=document.hidden||room.classList.contains('scene-offscreen');if(last&&!still&&!hidden)elapsed+=Math.min(now-last,100);last=now;
   if(state==='celebrating'&&elapsed>=1280){state='idle';elapsed=0;room.dataset.motion='idle';}
   let index=0;if(!still){if(state==='idle'){const phase=elapsed%4440;index=phase<2600?0:phase<2720?1:phase<4320?2:3;}else index=Math.floor(elapsed/({running:140,celebrating:160,gym:300,music:420,studying:650,working:350})[state])%4;}
   if(!hidden)showTallerFrame(frameNode,state,index);
   spritePlayback=requestAnimationFrame(tick);
  };spritePlayback=requestAnimationFrame(tick);
  room.setAttribute('aria-label',state==='running'?'Pixel companion running in a teal windbreaker, running shoes, and headphones':'Taller pixel companion with brown skin, wavy hair, NBA shirt, shorts and flip-flops');
 }
 if(['character','characterEquipped'].includes(current)){
  document.querySelectorAll('.phone .choice').forEach(n=>{n.disabled=true;n.title='New sprite appearance variants are pending';});
  const save=document.querySelector('.phone-footer [data-to="characterEquipped"]');if(save){save.disabled=true;save.textContent='More looks coming next';}
  document.getElementById('form-note').textContent='The new sprite sheet currently has one appearance. Skin, hair, and shirt variants are pending; these choices are temporarily unavailable.';
 }
};
render(current,false);
