import {readFileSync,writeFileSync,mkdirSync,copyFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=process.cwd(),target=path.join(root,'handoff'),files=[];
function copy(rel){const src=path.join(root,rel),dst=path.join(target,rel);mkdirSync(path.dirname(dst),{recursive:true});copyFileSync(src,dst);files.push({path:rel,bytes:readFileSync(src).length,sha256:createHash('sha256').update(readFileSync(src)).digest('hex')});}
for(const rel of ['docs/DESIGN_HANDOFF.md','docs/ANIMATION_SPEC.md','docs/NATIVE_ANIMATION_INTEGRATION.md','docs/GAME_DESIGN.md','docs/CHARACTER.md','docs/figma-state.json','docs/figma-screen-specs.json','docs/figma-foundations.json','docs/figma-components.json','docs/figma-screens-main.json','DESIGN.md','scripts/build-design-review.mjs'])copy(rel);
for(const dir of ['assets/character/taller-pixel','assets/character/pixel-draft','design-review'])for(const file of readdirSync(path.join(root,dir),{withFileTypes:true}))if(file.isFile())copy(dir+'/'+file.name);
const screenshotDir='artifacts/current-design-screens';
if(existsSync(path.join(root,screenshotDir)))for(const file of readdirSync(path.join(root,screenshotDir)))if(file.endsWith('.png')||file==='captures.json')copy(screenshotDir+'/'+file);
for(const name of ['balanced-world-preview.png','running-outfit-preview.png','taller-companion-preview.png','taller-sprite-checks.json'])if(existsSync(path.join(root,'artifacts',name)))copy('artifacts/'+name);
const css=readFileSync(path.join(root,'design-review/game.css'),'utf8');const colors=Object.fromEntries([...css.matchAll(/--([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map(m=>[m[1],m[2]]));
writeFileSync(path.join(target,'palette.json'),JSON.stringify({source:'design-review/game.css',colors,environmentSource:'design-review/world.css',runtimeTokensMigrated:false},null,2));
writeFileSync(path.join(target,'README.md'),'# Mini Me design handoff\n\nStart with docs/DESIGN_HANDOFF.md, then open design-review/index.html in a browser. Screenshots are reference evidence, not editable Figma screens. Figma and Rive remain at their earlier revisions. Native sprite integration is pending. No stale Figma write jobs are included.\n');
writeFileSync(path.join(target,'manifest.json'),JSON.stringify({revision:'2026-10-10-taller-pixel-park',timezone:'Asia/Manila',figma:{fileKey:'1rcTOHudvyrmdTRhuxo1xG',status:'blocked-by-starter-mcp-limit',latestRevisionSynced:false},rive:{latestRevisionExported:false,accountStatusAtLastCheck:'not-logged-in'},native:{spriteIntegration:'proposed-not-implemented'},screenshots:'static sample-data references',files},null,2));
console.log(`Packaged ${files.length} files into handoff/`);
