import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const F=read('docs/figma-foundations.json'), C=read('docs/figma-components.json').components;
const saved=read('docs/figma-screens-main.json');
const specs=read('docs/figma-screen-specs.json');
for(const s of specs.filter(s=>['workSession','gymSession','runSession','musicSession'].includes(s.key))){s.parts.find(p=>p.style==='timer').value='25:00';s.actions=[{label:'Pause session',to:'paused',style:'Secondary'},{label:'Finish session',to:'finish'}];}
writeFileSync(new URL('../docs/figma-screen-specs.json',import.meta.url),JSON.stringify(specs,null,2)+'\n');
const pending=specs.filter(s=>!saved.screens[s.key]);
const builder=readFileSync(new URL('./figma-screen-builder.js',import.meta.url),'utf8');
const foundations={variables:F.variables,styles:F.styles,wrapperId:F.wrapperId};
const dir=new URL('../design-review/figma-jobs/',import.meta.url);mkdirSync(dir,{recursive:true});
for(let i=0;i<pending.length;i+=6){const batch=pending.slice(i,i+6),index=String(i/6+1).padStart(2,'0');const code=`await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('0:1'));const F=${JSON.stringify(foundations)},C=${JSON.stringify(C)},specs=${JSON.stringify(batch)},rowName=${JSON.stringify('Additional screens / '+index)};\n${builder}`;writeFileSync(new URL(index+'-screens.json',dir),JSON.stringify({fileKey:'1rcTOHudvyrmdTRhuxo1xG',skillNames:'figma-use,figma-generate-design',description:'Compose remaining Mini Me review screens, batch '+index,code},null,2));}
const code=`await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('0:1'));const screens=${JSON.stringify(saved.screens)},links=${JSON.stringify(saved.links)};const mutated=[];const deferred=[];for(const link of links){if(!screens[link.to]){deferred.push(link);continue;}const node=await figma.getNodeByIdAsync(link.nodeId);await node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:screens[link.to],navigation:'NAVIGATE',transition:null}]}]);mutated.push(node.id);}return {mutatedNodeIds:mutated,deferred};`;
writeFileSync(new URL('00-main-links.json',dir),JSON.stringify({fileKey:'1rcTOHudvyrmdTRhuxo1xG',skillNames:'figma-use,figma-generate-design',description:'Connect already-saved main flow; defer destinations not created',code},null,2));
console.log(`Prepared ${Math.ceil(pending.length/6)} sequential screen batches and main-flow link job. These have not been executed.`);
