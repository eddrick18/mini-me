const gameIcons={
 book:'<path d="M3 5h8l1 2 1-2h8v15h-8l-1 2-1-2H3z"/><path d="M12 7v15M6 9h3M15 9h3M6 13h3M15 13h3"/>',
 work:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 11v4h4v-4"/>',
 gym:'<path d="M2 8h4v8H2zM6 5h4v14H6zM10 11h4v2h-4M14 5h4v14h-4zM18 8h4v8h-4z"/>',
 run:'<path d="m4 3 5 2 1 5 4 3 5 1 2 3v4H3v-6l3-4zM9 11l3-3M12 14l3-3M3 18h18"/>',
 music:'<path d="M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v9H3zM17 12h4v9h-4z"/>',
 home:'<path d="m2 11 10-8 10 8M5 10v11h14V10M9 21v-7h6v7"/>',
 history:'<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h4"/>',
 character:'<path d="m8 3 4 3 4-3 6 5-4 4v9H6v-9L2 8z"/>',
 settings:'<path d="M5 3v18M12 3v18M19 3v18"/><rect x="2" y="6" width="6" height="4" rx="1"/><rect x="9" y="13" width="6" height="4" rx="1"/><rect x="16" y="7" width="6" height="4" rx="1"/>',
 reward:'<path d="M3 9h18v12H3zM2 5h20v5H2zM12 5v16M12 5C4 5 5 0 8 2zM12 5c8 0 7-5 4-3z"/>'
};
function gameIcon(name){return `<svg class="game-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${gameIcons[name]||gameIcons.book}</svg>`;}
const preGameRender=render;
render=function(key,focus=true){
 preGameRender(key,focus);const phone=document.getElementById('phone');phone.classList.toggle('reward-screen',['reward','logReward','capReward','categoryCap','shortReward'].includes(current));
 for(const n of phone.querySelectorAll('.room')){const match=phone.querySelector('.progress .label')?.textContent.match(/Level (\d+)/);const level=match?Number(match[1]):(['home','session','paused','loading','historyEmpty','resetDone'].includes(current)?1:2);n.insertAdjacentHTML('beforeend',`<span class="world-tag">YOUR LITTLE WORLD</span><span class="level-tag">LV. ${level}</span>`);}
 const activityIcons={Studying:'book',Working:'work',Gym:'gym',Running:'run',Music:'music'};
 for(const n of phone.querySelectorAll('.activity')){const title=n.querySelector('.label').textContent;const children=n.innerHTML;n.innerHTML=`<span class="activity-icon">${gameIcon(activityIcons[title])}</span><span class="activity-copy">${children}</span>`;}
 for(const n of phone.querySelectorAll('.nav button')){const label=n.textContent;n.innerHTML=gameIcon(({Home:'home',History:'history',Character:'character',Settings:'settings'})[label])+`<span>${esc(label)}</span>`;}
 for(const n of phone.querySelectorAll('.card')){if(n.querySelector('.label')?.textContent==='Clothing palette unlocked'){n.classList.add('game-unlock');n.innerHTML=gameIcon('reward')+`<span class="unlock-copy">${n.innerHTML}</span>`;}}
 if(['home','homeAfter','manualHome'].includes(current)){document.getElementById('screen-title').textContent='Your day. Your adventure.';const b=phone.querySelector('.phone-footer [data-to="picker"]');if(b)b.textContent='Start an activity';}
 document.querySelector('.review-header h1').textContent='Mini Me · game design review';
 document.querySelector('.inspector h3').textContent='Your pixel companion';
 document.querySelector('.inspector p').textContent='Explore your little world, start an activity, and unlock new looks. This vibrant game proposal keeps earned progress and welcomes rest days.';
};
render(current,false);

