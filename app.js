import * as THREE from 'three';

const MAX_ITEMS = 20;
const STORAGE = {
  last: 'aritmeticaLastTableV01',
  configs: 'aritmeticaConfigsV01',
  theme: 'aritmeticaTheme',
  sound: 'aritmeticaSound',
  magnet: 'aritmeticaMagnet'
};

const CATALOG = [
  {section:'DADI', type:'die20fraction', name:'D20 Frazioni', hint:'20 frazioni', preview:'¾', kind:'die', values:['1/2','1/3','1/4','1/5','1/6','2/3','2/5','3/2','3/4','3/5','4/3','4/5','5/2','5/4','5/6','6/5','7/2','7/4','7/5','7/6'], color:'#2865a8'},
  {section:'DADI', type:'die6ops', name:'D6 Operazioni', hint:'+ − × : ^ √', preview:'×', kind:'die', values:['+','−','×',':','^','√'], color:'#e77821'},
  {section:'DADI', type:'die6compare', name:'D6 Confronti', hint:'+ − × : > <', preview:'>', kind:'die', values:['+','−','×',':','>','<'], color:'#23805a'},
  {section:'DADI', type:'die8mixed', name:'D8 Misto', hint:'+ − × : ^ √ > <', preview:'√', kind:'die', values:['+','−','×',':','^','√','>','<'], color:'#704ba8'},
  {section:'DADI', type:'die12math', name:'D12 Matematico', hint:'+ − × : ^ √ = > < ≈ ≠ ★ (Jolly)', preview:'★', kind:'die', values:['+','−','×',':','^','√','=','>','<','≈','≠','★'], color:'#b34f73'},
  {section:'CILINDRI', type:'cylDigits', name:'Cifre', hint:'0 → 9', preview:'7', kind:'cyl', values:['0','1','2','3','4','5','6','7','8','9']},
  {section:'CILINDRI', type:'cylOps', name:'Operazioni', hint:'+ − × :', preview:'×', kind:'cyl', values:['+','−','×',':']},
  {section:'CILINDRI', type:'cylCompare3', name:'Confronto', hint:'= > <', preview:'=', kind:'cyl', values:['=','>','<']},
  {section:'CILINDRI', type:'cylRelations5', name:'Relazioni', hint:'= ≈ ≠ > <', preview:'≈', kind:'cyl', values:['=','≈','≠','>','<']},
  {section:'CILINDRI', type:'cylRelations7', name:'Relazioni complete', hint:'= ≠ ≈ > ≥ < ≤', preview:'≥', kind:'cyl', values:['=','≠','≈','>','≥','<','≤']},
  {section:'ELEMENTI GRAFICI', type:'fractionLine', name:'Linea di frazione', hint:'lunghezza regolabile', preview:'━', kind:'line', values:[]},
  {section:'ELEMENTI GRAFICI', type:'answerPrompt', name:'Risultato da trovare', hint:'simbolo luminoso =?', preview:'=?', kind:'symbol', values:[]}
];
const BY_TYPE = Object.fromEntries(CATALOG.map(x=>[x.type,x]));

const $ = s => document.querySelector(s);
const els = {
  home: $('#homeScreen'), work: $('#workScreen'), workspace: $('#workspace'), domLayer: $('#domLayer'), canvas: $('#diceCanvas'), empty: $('#emptyHint'),
  homeTheme: $('#homeThemeBtn'), homeInfo: $('#homeInfoBtn'), info: $('#infoBtn'), infoDialog: $('#infoDialog'), theme: $('#themeBtn'), sound: $('#soundBtn'), magnet: $('#magnetBtn'), mode: $('#modeBtn'), modeLabel: $('#modeLabel'),
  newTable: $('#newTableBtn'), lastTable: $('#lastTableBtn'), configs: $('#configsBtn'), backHome: $('#backHomeBtn'),
  addElements: $('#addElementsBtn'), autoLayout: $('#autoLayoutBtn'), selectedActions: $('#selectedActions'), duplicate: $('#duplicateBtn'), delete: $('#deleteBtn'),
  elementCounter: $('#elementCounter'), compositionActions: $('#compositionActions'), gameActions: $('#gameActions'), shuffleAll: $('#shuffleAllBtn'), unpinAll: $('#unpinAllBtn'),
  catalogPanel: $('#catalogPanel'), panelShade: $('#panelShade'), closeCatalog: $('#closeCatalogBtn'), catalogList: $('#catalogList'), catalogCounter: $('#catalogCounter'), catalogAdd: $('#catalogAddBtn'),
  save: $('#saveBtn'), load: $('#loadBtn'), export: $('#exportBtn'), importBtn: $('#importBtn'), importInput: $('#importInput'),
  saveDialog: $('#saveDialog'), configName: $('#configNameInput'), confirmSave: $('#confirmSaveBtn'), loadDialog: $('#loadDialog'), configList: $('#configList'),
  timerBtn: $('#timerBtn'), timerDialog: $('#timerDialog'), customMinutes: $('#customMinutes'), customSeconds: $('#customSeconds'), timerApply: $('#timerApplyBtn'), timerWidget: $('#timerWidget'), timerReadout: $('#timerReadout'), timerPlay: $('#timerPlayBtn'), timerReset: $('#timerResetBtn'), timerClose: $('#timerCloseBtn'),
  fullscreen: $('#fullscreenBtn'), toast: $('#toast')
};

const state = {
  items: [], selectedId: null, mode: 'composition',
  theme: localStorage.getItem(STORAGE.theme) || 'day',
  soundOn: localStorage.getItem(STORAGE.sound) !== 'off',
  magnetOn: localStorage.getItem(STORAGE.magnet) !== 'off',
  catalogCounts: {},
  timerInitial: 60, timerRemaining: 60, timerRunning: false, timerHandle: null, lastTimerSecond: null
};

let audioCtx = null;
function ensureAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume(); }
function tone(freq=500,dur=.07,type='sine',gain=.045,when=0){
  if(!state.soundOn) return; ensureAudio(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,audioCtx.currentTime+when);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+when+dur);o.connect(g).connect(audioCtx.destination);o.start(audioCtx.currentTime+when);o.stop(audioCtx.currentTime+when+dur+.01);
}
function soundClick(){ tone(520,.045,'square',.025); }
function soundTick(){ tone(390,.035,'triangle',.018); }
function soundPin(){ tone(740,.06,'sine',.04); tone(980,.08,'sine',.025,.045); }
function soundRoll(){ if(!state.soundOn)return; ensureAudio(); const n=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*.16),audioCtx.sampleRate); const d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length); const s=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();s.buffer=n;f.type='bandpass';f.frequency.value=900;f.Q.value=.8;g.gain.value=.055;s.connect(f).connect(g).connect(audioCtx.destination);s.start(); }
function soundEnd(){ tone(660,.12,'sine',.055);tone(880,.16,'sine',.055,.12);tone(1100,.24,'sine',.05,.26); }

function toast(msg){ els.toast.textContent=msg; els.toast.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>els.toast.classList.remove('show'),1700); }
function uid(){ return 'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function deepCopy(v){ return JSON.parse(JSON.stringify(v)); }

function applyTheme(theme){ state.theme=theme; document.body.classList.toggle('dark',theme==='night'); els.theme.textContent=theme==='night'?'🌙':'☀️'; els.homeTheme.textContent=els.theme.textContent; localStorage.setItem(STORAGE.theme,theme); saveLast(); }
function toggleTheme(){ applyTheme(state.theme==='night'?'day':'night'); }
function updateSound(){ els.sound.textContent=state.soundOn?'🔊':'🔇'; localStorage.setItem(STORAGE.sound,state.soundOn?'on':'off'); }
function updateMagnet(){ els.magnet.classList.toggle('active-tool',state.magnetOn); els.magnet.style.opacity=state.magnetOn?'1':'.55'; localStorage.setItem(STORAGE.magnet,state.magnetOn?'on':'off'); saveLast(); }

function serializeState(){ return {version:1,items:deepCopy(state.items),mode:state.mode,theme:state.theme,magnetOn:state.magnetOn}; }
function saveLast(){ if(!els.work.classList.contains('active')) return; try{ localStorage.setItem(STORAGE.last,JSON.stringify(serializeState())); updateLastAvailability(); }catch{} }
function loadState(obj){
  if(!obj || !Array.isArray(obj.items)) return false;
  state.items=obj.items.slice(0,MAX_ITEMS).map(it=>({...it,id:it.id||uid(),x:clamp(Number(it.x)||.5,.03,.97),y:clamp(Number(it.y)||.5,.05,.95),pinned:!!it.pinned}));
  state.mode=obj.mode==='game'?'game':'composition'; state.selectedId=null;
  if(obj.theme) applyTheme(obj.theme); if(typeof obj.magnetOn==='boolean'){state.magnetOn=obj.magnetOn;updateMagnet();}
  rebuildAll(); return true;
}
function updateLastAvailability(){ const has=!!localStorage.getItem(STORAGE.last); els.lastTable.disabled=!has; els.lastTable.style.opacity=has?'1':'.45'; }
function getConfigs(){ try{return JSON.parse(localStorage.getItem(STORAGE.configs)||'[]')}catch{return[]} }
function setConfigs(v){ localStorage.setItem(STORAGE.configs,JSON.stringify(v)); }

function showScreen(which){ els.home.classList.toggle('active',which==='home'); els.work.classList.toggle('active',which==='work'); if(which==='work') setTimeout(()=>{resizeRenderer();saveLast();},40); }
function newTable(){ state.items=[];state.selectedId=null;state.mode='composition';state.catalogCounts={};rebuildAll();showScreen('work');openCatalog();saveLast(); }

// ---------------- Three.js: un'unica scena per tutti i dadi ----------------
const renderer = new THREE.WebGLRenderer({canvas:els.canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-500,500,250,-250,-1000,1000);camera.position.set(0,0,300);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x4a321f,2.1));
const dl=new THREE.DirectionalLight(0xffffff,2.2);dl.position.set(-1.5,2.2,4);scene.add(dl);
const dl2=new THREE.DirectionalLight(0xffc991,.7);dl2.position.set(3,-2,2);scene.add(dl2);
const diceMeshes = new Map();
const diceAnimations = new Map();
let lastFrame=performance.now();

function labelTexture(label,color,isFraction=false){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const g=x.createLinearGradient(20,15,230,240);g.addColorStop(0,lighten(color,25));g.addColorStop(1,color);x.fillStyle=g;x.fillRect(0,0,256,256);
  x.strokeStyle='rgba(255,255,255,.23)';x.lineWidth=8;x.strokeRect(7,7,242,242);
  x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=3;x.textAlign='center';x.textBaseline='middle';x.font='900 92px system-ui, sans-serif';
  if(isFraction && label.includes('/')){const [a,b]=label.split('/');x.font='900 70px system-ui,sans-serif';x.strokeText(a,128,84);x.fillText(a,128,84);x.fillRect(72,123,112,7);x.strokeText(b,128,174);x.fillText(b,128,174);}
  else {x.strokeText(label,128,134);x.fillText(label,128,134);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
function lighten(hex,p){const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;const q=p/100;return `rgb(${Math.round(r+(255-r)*q)},${Math.round(g+(255-g)*q)},${Math.round(b+(255-b)*q)})`;}
function makeMaterials(def){
  if(def.type==='die12math') return def.values.map(()=>new THREE.MeshStandardMaterial({color:def.color||'#b34f73',roughness:.46,metalness:.08}));
  return def.values.map(v=>new THREE.MeshStandardMaterial({map:labelTexture(v,def.color||'#2865a8',def.type==='die20fraction'),roughness:.42,metalness:.08}));
}
function symbolTexture(label){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.clearRect(0,0,256,256);
  x.textAlign='center';x.textBaseline='middle';x.font=label==='★'?'900 120px system-ui,sans-serif':'900 112px system-ui,sans-serif';
  x.lineWidth=10;x.strokeStyle='rgba(0,0,0,.34)';x.fillStyle='#fff';x.strokeText(label,128,134);x.fillText(label,128,134);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
function faceBasisFromNormal(normal){
  const n=normal.clone().normalize();
  let up=new THREE.Vector3(0,1,0);up.addScaledVector(n,-up.dot(n));
  if(up.lengthSq()<.05){up.set(1,0,0);up.addScaledVector(n,-up.dot(n));}
  up.normalize();const right=new THREE.Vector3().crossVectors(up,n).normalize();up=new THREE.Vector3().crossVectors(n,right).normalize();
  return {right,up,normal:n};
}
function quaternionToFrontFromBasis(basis){const m=new THREE.Matrix4().makeBasis(basis.right,basis.up,basis.normal);return new THREE.Quaternion().setFromRotationMatrix(m).invert();}
function dodecaFaces(geom){
  const pos=geom.attributes.position, tris=[];
  for(let i=0;i<pos.count;i+=3){
    const a=new THREE.Vector3().fromBufferAttribute(pos,i),b=new THREE.Vector3().fromBufferAttribute(pos,i+1),c=new THREE.Vector3().fromBufferAttribute(pos,i+2);
    const normal=new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(b,a),new THREE.Vector3().subVectors(c,a)).normalize();
    const center=a.clone().add(b).add(c).multiplyScalar(1/3);tris.push({start:i,normal,center});
  }
  const faces=[];
  for(const tri of tris){let f=faces.find(q=>q.normal.dot(tri.normal)>.9999);if(!f){f={normal:tri.normal.clone(),tris:[],center:new THREE.Vector3(),vertices:[]};faces.push(f);}f.tris.push(tri);
    for(let k=0;k<3;k++){const v=new THREE.Vector3().fromBufferAttribute(pos,tri.start+k);if(!f.vertices.some(q=>q.distanceToSquared(v)<1e-10))f.vertices.push(v);}
  }
  faces.forEach(f=>{f.center.set(0,0,0);f.vertices.forEach(v=>f.center.add(v));f.center.multiplyScalar(1/f.vertices.length);});return faces;
}
function setDieFaceHighlight(obj,faceIndex){
  if(obj.userData.type!=='die20fraction') return;
  const mats=obj.userData.faceMaterials||[];
  mats.forEach((m,i)=>{m.color.setHex(i===faceIndex?0xffffff:0x777777);m.roughness=i===faceIndex?.38:.66;m.emissive?.setHex(i===faceIndex?0x102033:0x000000);m.emissiveIntensity=i===faceIndex?.16:0;});
}
function resetDieFaceHighlight(obj){
  if(obj.userData.type!=='die20fraction') return;(obj.userData.faceMaterials||[]).forEach(m=>{m.color.setHex(0xffffff);m.roughness=.42;m.emissive?.setHex(0x000000);m.emissiveIntensity=0;});
}
function faceQuaternionFromGroup(geometry,groupIndex){
  const group=geometry.groups[groupIndex];
  if(!group) return new THREE.Quaternion();
  const pos=geometry.attributes.position, uv=geometry.attributes.uv, idx=geometry.index;
  const ids=[]; for(let k=0;k<3;k++) ids.push(idx?idx.getX(group.start+k):group.start+k);
  const p0=new THREE.Vector3().fromBufferAttribute(pos,ids[0]);
  const p1=new THREE.Vector3().fromBufferAttribute(pos,ids[1]);
  const p2=new THREE.Vector3().fromBufferAttribute(pos,ids[2]);
  const normal=new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(p1,p0),new THREE.Vector3().subVectors(p2,p0)).normalize();

  // Ricava il "verso alto" della texture sulla faccia. In questo modo, dopo il lancio,
  // non basta avere la faccia davanti: numeri e simboli arrivano anche perfettamente diritti.
  let up=new THREE.Vector3(0,1,0);
  if(uv){
    const uv0=new THREE.Vector2().fromBufferAttribute(uv,ids[0]);
    const uv1=new THREE.Vector2().fromBufferAttribute(uv,ids[1]);
    const uv2=new THREE.Vector2().fromBufferAttribute(uv,ids[2]);
    const e1=new THREE.Vector3().subVectors(p1,p0), e2=new THREE.Vector3().subVectors(p2,p0);
    const du1=uv1.x-uv0.x, dv1=uv1.y-uv0.y, du2=uv2.x-uv0.x, dv2=uv2.y-uv0.y;
    const det=du1*dv2-du2*dv1;
    if(Math.abs(det)>1e-8){
      // dP/dv = (-du2*e1 + du1*e2) / det
      up=e1.clone().multiplyScalar(-du2).add(e2.clone().multiplyScalar(du1)).multiplyScalar(1/det);
      up.addScaledVector(normal,-up.dot(normal));
      if(up.lengthSq()>1e-8) up.normalize(); else up.set(0,1,0);
    }
  }
  // Base destrorsa della faccia: X=destra, Y=alto, Z=normale.
  const right=new THREE.Vector3().crossVectors(up,normal).normalize();
  up=new THREE.Vector3().crossVectors(normal,right).normalize();
  const sourceBasis=new THREE.Matrix4().makeBasis(right,up,normal);
  return new THREE.Quaternion().setFromRotationMatrix(sourceBasis).invert();
}
function remapTriangleUVs(geom,faces){
  const uv=geom.attributes.uv; if(!uv) return;
  for(let i=0;i<faces;i++){uv.setXY(i*3,0.08,0.08);uv.setXY(i*3+1,0.92,0.08);uv.setXY(i*3+2,0.5,0.94);} uv.needsUpdate=true;
}
function createDieMesh(item){
  const def=BY_TYPE[item.type]; let geom, root, faceQuaternions=[];
  if(item.type.startsWith('die6')) geom=new THREE.BoxGeometry(1,1,1,1,1,1);
  else if(item.type==='die8mixed'){ geom=new THREE.OctahedronGeometry(1,0); if(geom.index) geom=geom.toNonIndexed(); remapTriangleUVs(geom,8); geom.clearGroups(); for(let i=0;i<8;i++) geom.addGroup(i*3,3,i); }
  else if(item.type==='die12math'){
    geom=new THREE.DodecahedronGeometry(1,0);if(geom.index)geom=geom.toNonIndexed();
    const faces=dodecaFaces(geom);geom.clearGroups();faces.forEach((f,fi)=>f.tris.forEach(t=>geom.addGroup(t.start,3,fi)));
    const mats=makeMaterials(def), solid=new THREE.Mesh(geom,mats);root=new THREE.Group();root.add(solid);
    faceQuaternions=faces.map(f=>quaternionToFrontFromBasis(faceBasisFromNormal(f.normal)));
    faces.forEach((f,i)=>{
      const basis=faceBasisFromNormal(f.normal), tex=symbolTexture(def.values[i]);
      const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide});
      const plane=new THREE.Mesh(new THREE.PlaneGeometry(.72,.72),mat);
      plane.position.copy(f.center.clone().add(f.normal.clone().multiplyScalar(.018)));
      plane.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(basis.right,basis.up,basis.normal));root.add(plane);
    });
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geom,15),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.42}));root.add(edges);
    root.userData.faceMaterials=mats;
  }
  else { geom=new THREE.IcosahedronGeometry(1,0); if(geom.index) geom=geom.toNonIndexed(); remapTriangleUVs(geom,20); geom.clearGroups(); for(let i=0;i<20;i++) geom.addGroup(i*3,3,i); }
  if(!root){
    const mats=makeMaterials(def),mesh=new THREE.Mesh(geom,mats);root=mesh;root.userData.faceMaterials=mats;
    faceQuaternions=def.values.map((_,i)=>faceQuaternionFromGroup(geom,i));
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geom,15),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.42}));root.add(edges);
  }
  root.userData.id=item.id;root.userData.type=item.type;root.userData.faceQuaternions=faceQuaternions;
  scene.add(root);diceMeshes.set(item.id,root);
  const idx=Number.isInteger(item.value)?item.value:0;orientDie(root,idx,false);return root;
}
function orientDie(mesh,faceIndex,animate=true,duration=900,delay=0){
  // La faccia estratta termina sempre frontale e con il testo parallelo alla base dello schermo.
  // La casualità resta nella rotazione durante il lancio, non nell'orientamento finale.
  const target=(mesh.userData.faceQuaternions?.[faceIndex]||new THREE.Quaternion()).clone();
  if(!animate){mesh.quaternion.copy(target);setDieFaceHighlight(mesh,faceIndex);return;}
  resetDieFaceHighlight(mesh);
  diceAnimations.set(mesh.userData.id,{start:performance.now()+delay,duration,startQ:mesh.quaternion.clone(),targetQ:target,faceIndex,axis:new THREE.Vector3(Math.random()+.2,Math.random()+.2,Math.random()+.2).normalize()});
}
function syncDiceMeshes(){
  const wanted=new Set(state.items.filter(i=>BY_TYPE[i.type]?.kind==='die').map(i=>i.id));
  for(const [id,m] of diceMeshes){if(!wanted.has(id)){scene.remove(m);disposeObject(m);diceMeshes.delete(id);diceAnimations.delete(id);}}
  for(const it of state.items){if(BY_TYPE[it.type]?.kind==='die'&&!diceMeshes.has(it.id))createDieMesh(it);}
  resizeRenderer();
}
function disposeObject(obj){obj.traverse(n=>{if(n.geometry)n.geometry.dispose?.();if(n.material){const arr=Array.isArray(n.material)?n.material:[n.material];arr.forEach(m=>{m.map?.dispose?.();m.dispose?.();});}})}
function itemSize(){const n=Math.max(1,state.items.length),w=els.workspace.clientWidth||900,h=els.workspace.clientHeight||450;return clamp(Math.sqrt((w*h)/n)*.44,50,108);}
function resizeRenderer(){
  const w=Math.max(1,els.workspace.clientWidth),h=Math.max(1,els.workspace.clientHeight);renderer.setSize(w,h,false);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();updateVisualPositions();
}
function updateVisualPositions(){
  const w=els.workspace.clientWidth||1,h=els.workspace.clientHeight||1,size=itemSize();
  for(const it of state.items){const def=BY_TYPE[it.type];if(def.kind==='die'){const m=diceMeshes.get(it.id);if(!m)continue;m.position.set(it.x*w-w/2,h/2-it.y*h,0);const scale=it.type.startsWith('die6')?size:it.type==='die8mixed'?size*.67:it.type==='die12math'?size*.62:size*.60;m.scale.setScalar(scale);}
    const el=els.domLayer.querySelector(`[data-id="${it.id}"]`);if(el){el.style.left=(it.x*100)+'%';el.style.top=(it.y*100)+'%';if(def.kind==='die'){el.style.width=size+'px';el.style.height=size+'px';}else if(def.kind==='cyl'){el.style.width=(size*.72)+'px';el.style.height=(size*1.05)+'px';el.style.setProperty('--cyl-font',Math.max(26,size*.46)+'px');}else if(def.kind==='line'){el.style.width=(it.width||Math.max(110,size*1.7))+'px';}else if(def.kind==='symbol'){el.style.width=(size*1.14)+'px';el.style.height=(size*.76)+'px';el.style.setProperty('--prompt-font',Math.max(28,size*.48)+'px');}}}
}
function animationLoop(now){
  const dt=now-lastFrame;lastFrame=now;
  for(const [id,a] of [...diceAnimations]){const m=diceMeshes.get(id);if(!m){diceAnimations.delete(id);continue;}if(now<a.start)continue;const raw=clamp((now-a.start)/a.duration,0,1);const t=1-Math.pow(1-raw,3);const q=a.startQ.clone().slerp(a.targetQ,t);const spin=new THREE.Quaternion().setFromAxisAngle(a.axis,Math.PI*10*raw*(1-raw));m.quaternion.copy(spin.multiply(q));if(raw>=1){m.quaternion.copy(a.targetQ);setDieFaceHighlight(m,a.faceIndex);diceAnimations.delete(id);}}
  renderer.render(scene,camera);requestAnimationFrame(animationLoop);
}
requestAnimationFrame(animationLoop);

// ---------------- DOM degli oggetti ----------------
function renderItems(){
  els.domLayer.innerHTML='';
  for(const item of state.items){const def=BY_TYPE[item.type];let el=document.createElement('div');el.dataset.id=item.id;el.className='workspace-item '+(item.pinned?'pinned ':'');
    if(def.kind==='die'){el.classList.add('die-hit');el.innerHTML='<span class="item-pin">📌</span>';}
    else if(def.kind==='cyl'){el.classList.add('cylinder');el.innerHTML='<span class="item-pin">📌</span><div class="cyl-window"><div class="cyl-track"><div class="cyl-cell prev"></div><div class="cyl-cell current"></div><div class="cyl-cell next"></div></div><div class="cyl-guide"></div><div class="cyl-shine"></div></div>';setCylinderCells(el,item);}
    else if(def.kind==='line'){el.classList.add('fraction-line');el.innerHTML='<div class="line-core"></div><span class="resize-handle left" data-resize="left"></span><span class="resize-handle right" data-resize="right"></span>';}
    else if(def.kind==='symbol'){el.classList.add('answer-prompt');el.innerHTML='<span>=?</span>';}
    if(item.id===state.selectedId)el.classList.add('selected');els.domLayer.appendChild(el);
  }
  els.empty.classList.toggle('hidden',state.items.length>0); updateCounter(); updateSelectionUI(); updateVisualPositions();
}
function setCylinderCells(el,item){const def=BY_TYPE[item.type],vals=def.values,n=vals.length,idx=((item.value??0)%n+n)%n;item.value=idx;el.querySelector('.prev').textContent=vals[(idx-1+n)%n];el.querySelector('.current').textContent=vals[idx];el.querySelector('.next').textContent=vals[(idx+1)%n];}
function updateItemPin(id){const el=els.domLayer.querySelector(`[data-id="${id}"]`),it=state.items.find(x=>x.id===id);if(el&&it)el.classList.toggle('pinned',it.pinned);}
function updateSelectionUI(){
  els.selectedActions.classList.toggle('hidden',!state.selectedId||state.mode!=='composition');
  els.domLayer.querySelectorAll('.workspace-item').forEach(el=>el.classList.toggle('selected',el.dataset.id===state.selectedId));
}
function updateCounter(){els.elementCounter.textContent=`${state.items.length} / ${MAX_ITEMS}`;updateCatalogCounter();}

function rebuildAll(){syncDiceMeshes();renderItems();applyModeUI();saveLast();}
function applyModeUI(){
  const game=state.mode==='game';els.work.classList.toggle('game-mode',game);els.work.classList.toggle('composition-mode',!game);els.mode.textContent=game?'🔒':'🔓';els.mode.title=game?'Sblocca tavolo':'Blocca tavolo';els.modeLabel.textContent=game?'GIOCO':'COMPOSIZIONE';els.compositionActions.classList.toggle('hidden',game);els.gameActions.classList.toggle('hidden',!game);if(game){state.selectedId=null;closeCatalog();}updateSelectionUI();
}

// ---------------- Catalogo ----------------
function renderCatalog(){
  const sections=[...new Set(CATALOG.map(x=>x.section))];els.catalogList.innerHTML=sections.map(sec=>`<div class="cat-section"><div class="cat-section-title">${sec}</div>${CATALOG.filter(x=>x.section===sec).map(d=>`<div class="cat-row" data-type="${d.type}"><div class="cat-preview ${d.kind==='cyl'?'cyl':d.kind==='line'?'line':d.kind==='symbol'?'symbol':''}">${d.preview}</div><div class="cat-info"><b>${d.name}</b><small>${d.hint}</small></div><div class="stepper"><button data-delta="-1">−</button><span>${state.catalogCounts[d.type]||0}</span><button data-delta="1">+</button></div></div>`).join('')}</div>`).join('');updateCatalogCounter();
}
function catalogPending(){return Object.values(state.catalogCounts).reduce((a,b)=>a+b,0)}
function updateCatalogCounter(){const p=catalogPending();els.catalogCounter.textContent=`${state.items.length+p} / ${MAX_ITEMS}`;els.catalogAdd.disabled=p===0||state.items.length+p>MAX_ITEMS;els.catalogAdd.style.opacity=els.catalogAdd.disabled?'.45':'1';}
function openCatalog(){if(state.mode!=='composition')return;renderCatalog();els.catalogPanel.style.pointerEvents='auto';els.catalogPanel.setAttribute('aria-hidden','false');requestAnimationFrame(()=>{els.catalogPanel.classList.add('open');els.panelShade.classList.add('show');});}
function closeCatalog(){els.catalogPanel.classList.remove('open');els.catalogPanel.setAttribute('aria-hidden','true');els.panelShade.classList.remove('show');setTimeout(()=>{if(!els.catalogPanel.classList.contains('open'))els.catalogPanel.style.pointerEvents='none';},260);}
function addPending(){const total=catalogPending();if(!total)return;if(state.items.length+total>MAX_ITEMS){toast('Massimo 20 elementi');return;}for(const [type,count] of Object.entries(state.catalogCounts)){for(let k=0;k<count;k++)addItem(type,false);}state.catalogCounts={};autoLayout(true);renderCatalog();closeCatalog();rebuildAll();soundClick();}
function addItem(type,render=true){const def=BY_TYPE[type];const item={id:uid(),type,x:.5+(Math.random()-.5)*.08,y:.5+(Math.random()-.5)*.08,pinned:false,value:def.values?.length?Math.floor(Math.random()*def.values.length):0};if(def.kind==='line')item.width=150;state.items.push(item);if(render)rebuildAll();return item;}

// ---------------- Drag / tap / long press ----------------
let interaction=null;
function pointFraction(e){const r=els.workspace.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,.025,.975),y:clamp((e.clientY-r.top)/r.height,.04,.96),px:e.clientX-r.left,py:e.clientY-r.top,w:r.width,h:r.height};}
function snapPosition(item,x,y){if(!state.magnetOn)return{x,y};const w=els.workspace.clientWidth,h=els.workspace.clientHeight,th=15;for(const o of state.items){if(o.id===item.id)continue;if(Math.abs((o.x-x)*w)<th)x=o.x;if(Math.abs((o.y-y)*h)<th)y=o.y;}return{x,y};}
function selectItem(id){state.selectedId=id;updateSelectionUI();}
function togglePin(item){if(!['die','cyl'].includes(BY_TYPE[item.type].kind))return;item.pinned=!item.pinned;updateItemPin(item.id);soundPin();toast(item.pinned?'Risultato congelato 📌':'Risultato sbloccato');saveLast();}

els.domLayer.addEventListener('pointerdown',e=>{
  const el=e.target.closest('.workspace-item');if(!el)return;const item=state.items.find(x=>x.id===el.dataset.id);if(!item)return;ensureAudio();
  const p=pointFraction(e); el.setPointerCapture?.(e.pointerId);
  if(state.mode==='composition'){
    selectItem(item.id);
    const handle=e.target.closest('[data-resize]');
    interaction={kind:handle?'resize':'move',item,el,startX:e.clientX,startY:e.clientY,startItemX:item.x,startItemY:item.y,startWidth:item.width||150,side:handle?.dataset.resize,moved:false};
  } else {
    if(!['die','cyl'].includes(BY_TYPE[item.type].kind))return;
    interaction={kind:'game',item,el,startX:e.clientX,startY:e.clientY,lastStepY:e.clientY,moved:false,long:false};
    interaction.longTimer=setTimeout(()=>{if(interaction&&interaction.item.id===item.id&&!interaction.moved){interaction.long=true;togglePin(item);}},620);
  }
  e.preventDefault();
});
window.addEventListener('pointermove',e=>{
  if(!interaction)return;const it=interaction.item;
  if(interaction.kind==='move'){
    const p=pointFraction(e);let s=snapPosition(it,p.x,p.y);it.x=s.x;it.y=s.y;interaction.moved=true;interaction.el.style.left=(it.x*100)+'%';interaction.el.style.top=(it.y*100)+'%';const m=diceMeshes.get(it.id);if(m){m.position.x=it.x*p.w-p.w/2;m.position.y=p.h/2-it.y*p.h;}
  } else if(interaction.kind==='resize'){
    const dx=e.clientX-interaction.startX;const sign=interaction.side==='left'?-1:1;it.width=clamp(interaction.startWidth+sign*dx,65,Math.max(100,els.workspace.clientWidth*.75));interaction.el.style.width=it.width+'px';interaction.moved=true;
  } else if(interaction.kind==='game' && BY_TYPE[it.type].kind==='cyl'){
    const dy=e.clientY-interaction.startY;if(Math.abs(dy)>9){interaction.moved=true;clearTimeout(interaction.longTimer);}if(!it.pinned&&Math.abs(e.clientY-interaction.lastStepY)>=18){const dir=e.clientY<interaction.lastStepY?1:-1;stepCylinder(it,dir);interaction.lastStepY=e.clientY;}
  } else if(interaction.kind==='game' && Math.hypot(e.clientX-interaction.startX,e.clientY-interaction.startY)>9){interaction.moved=true;clearTimeout(interaction.longTimer);}
});
window.addEventListener('pointerup',e=>{
  if(!interaction)return;const x=interaction;clearTimeout(x.longTimer);if(x.kind==='move'||x.kind==='resize'){saveLast();updateVisualPositions();}
  else if(x.kind==='game'&&!x.long&&!x.moved&&!x.item.pinned){randomizeItem(x.item);}
  interaction=null;
});
window.addEventListener('pointercancel',()=>{if(interaction)clearTimeout(interaction.longTimer);interaction=null;});

function stepCylinder(item,dir){const def=BY_TYPE[item.type],n=def.values.length;item.value=(item.value+dir+n)%n;const el=els.domLayer.querySelector(`[data-id="${item.id}"]`);if(el)setCylinderCells(el,item);soundTick();saveLast();}
function spinCylinder(item,delay=0,duration=750){
  if(item.pinned)return;const el=els.domLayer.querySelector(`[data-id="${item.id}"]`);if(!el)return;setTimeout(()=>{soundRoll();el.classList.add('spinning');let steps=0;const target=Math.floor(Math.random()*BY_TYPE[item.type].values.length);const iv=setInterval(()=>{stepCylinder(item,Math.random()>.5?1:-1);steps++;},70);setTimeout(()=>{clearInterval(iv);item.value=target;setCylinderCells(el,item);el.classList.remove('spinning');soundClick();saveLast();},duration);},delay);
}
function rollDie(item,delay=0,duration=900){if(item.pinned)return;const def=BY_TYPE[item.type],idx=Math.floor(Math.random()*def.values.length);item.value=idx;setTimeout(soundRoll,delay);const m=diceMeshes.get(item.id);if(m)orientDie(m,idx,true,duration,delay);setTimeout(()=>soundClick(),delay+duration*.9);saveLast();}
function randomizeItem(item){const k=BY_TYPE[item.type].kind;if(k==='die')rollDie(item,0,900+Math.random()*250);else if(k==='cyl')spinCylinder(item,0,650+Math.random()*300);}
function shuffleAll(){const active=state.items.filter(i=>!i.pinned&&['die','cyl'].includes(BY_TYPE[i.type].kind));if(!active.length){toast('Nessun elemento da mescolare');return;}active.forEach((it,i)=>{const delay=Math.random()*180,dur=720+Math.random()*520;if(BY_TYPE[it.type].kind==='die')rollDie(it,delay,dur);else spinCylinder(it,delay,dur);});}

function autoLayout(silent=false){const n=state.items.length;if(!n)return;const w=els.workspace.clientWidth||900,h=els.workspace.clientHeight||450,aspect=w/h;let cols=Math.ceil(Math.sqrt(n*aspect));cols=clamp(cols,1,n);const rows=Math.ceil(n/cols);state.items.forEach((it,i)=>{const c=i%cols,r=Math.floor(i/cols);it.x=(c+1)/(cols+1);it.y=(r+1)/(rows+1);});updateVisualPositions();saveLast();if(!silent)toast('Elementi disposti automaticamente');}

// ---------------- Comandi ----------------
els.homeTheme.addEventListener('click',toggleTheme);els.theme.addEventListener('click',toggleTheme);
els.homeInfo.addEventListener('click',()=>els.infoDialog.showModal());els.info.addEventListener('click',()=>els.infoDialog.showModal());
els.sound.addEventListener('click',()=>{state.soundOn=!state.soundOn;updateSound();if(state.soundOn)soundClick();});
els.magnet.addEventListener('click',()=>{state.magnetOn=!state.magnetOn;updateMagnet();toast(state.magnetOn?'Magnete attivo':'Magnete disattivato');});
els.mode.addEventListener('click',()=>{state.mode=state.mode==='composition'?'game':'composition';applyModeUI();saveLast();soundClick();});
els.newTable.addEventListener('click',newTable);
els.lastTable.addEventListener('click',()=>{try{const o=JSON.parse(localStorage.getItem(STORAGE.last)||'null');if(o){loadState(o);showScreen('work');}}catch{}});
els.configs.addEventListener('click',()=>{renderConfigList();els.loadDialog.showModal();});
els.backHome.addEventListener('click',()=>{saveLast();showScreen('home');});
els.addElements.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();openCatalog();});els.closeCatalog.addEventListener('click',closeCatalog);els.panelShade.addEventListener('click',closeCatalog);
els.catalogList.addEventListener('click',e=>{const b=e.target.closest('button[data-delta]');if(!b)return;const row=b.closest('[data-type]'),type=row.dataset.type,d=Number(b.dataset.delta),current=state.catalogCounts[type]||0;const next=Math.max(0,current+d);if(d>0&&state.items.length+catalogPending()>=MAX_ITEMS){toast('Massimo 20 elementi');return;}state.catalogCounts[type]=next;renderCatalog();});
els.catalogAdd.addEventListener('click',addPending);els.autoLayout.addEventListener('click',()=>autoLayout(false));
els.duplicate.addEventListener('click',()=>{const it=state.items.find(x=>x.id===state.selectedId);if(!it)return;if(state.items.length>=MAX_ITEMS){toast('Massimo 20 elementi');return;}const c=deepCopy(it);c.id=uid();c.x=clamp(it.x+.045,.03,.97);c.y=clamp(it.y+.05,.05,.95);c.pinned=false;state.items.push(c);state.selectedId=c.id;rebuildAll();soundClick();});
els.delete.addEventListener('click',()=>{const id=state.selectedId;if(!id)return;state.items=state.items.filter(x=>x.id!==id);state.selectedId=null;rebuildAll();soundClick();});
els.shuffleAll.addEventListener('click',shuffleAll);els.unpinAll.addEventListener('click',()=>{let n=0;state.items.forEach(i=>{if(i.pinned){i.pinned=false;n++;}});renderItems();saveLast();toast(n?`${n} elementi sbloccati`:'Nessun elemento congelato');});
els.fullscreen.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{}});

// ---------------- Salvataggi / import export ----------------
els.save.addEventListener('click',()=>{els.configName.value='';els.saveDialog.showModal();setTimeout(()=>els.configName.focus(),100);});
els.confirmSave.addEventListener('click',()=>{const name=els.configName.value.trim()||`Tavolo ${new Date().toLocaleDateString('it-IT')}`;const arr=getConfigs();arr.unshift({id:uid(),name,updated:new Date().toISOString(),state:serializeState()});setConfigs(arr.slice(0,60));els.saveDialog.close();toast('Configurazione salvata');});
els.load.addEventListener('click',()=>{renderConfigList();els.loadDialog.showModal();});
function renderConfigList(){const arr=getConfigs();els.configList.innerHTML=arr.length?arr.map(c=>`<div class="config-entry" data-cid="${c.id}"><div><b>${escapeHtml(c.name)}</b><small>${new Date(c.updated).toLocaleString('it-IT')}</small></div><button data-act="open">APRI</button><button data-act="delete" class="delete-config">×</button></div>`).join(''):'<p>Nessuna configurazione salvata.</p>';}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
els.configList.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;const id=b.closest('[data-cid]').dataset.cid,arr=getConfigs(),c=arr.find(x=>x.id===id);if(b.dataset.act==='open'&&c){loadState(c.state);showScreen('work');els.loadDialog.close();toast(`Aperto: ${c.name}`);}else if(b.dataset.act==='delete'){setConfigs(arr.filter(x=>x.id!==id));renderConfigList();}});
els.export.addEventListener('click',()=>{const payload={app:'ARITMETICA!',format:1,exportedAt:new Date().toISOString(),state:serializeState()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='aritmetica-configurazione.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Configurazione esportata');});
els.importBtn.addEventListener('click',()=>els.importInput.click());els.importInput.addEventListener('change',async()=>{const f=els.importInput.files?.[0];if(!f)return;try{const o=JSON.parse(await f.text()),data=o.state||o;if(loadState(data)){showScreen('work');toast('Configurazione importata');}else throw 0;}catch{toast('File non valido');}els.importInput.value='';});

// ---------------- Timer ----------------
els.timerBtn.addEventListener('click',()=>els.timerDialog.showModal());
els.timerDialog.querySelectorAll('[data-seconds]').forEach(b=>b.addEventListener('click',()=>setTimer(Number(b.dataset.seconds))));
els.timerApply.addEventListener('click',()=>{const s=clamp((Number(els.customMinutes.value)||0)*60+(Number(els.customSeconds.value)||0),1,5999);setTimer(s);});
function setTimer(seconds){stopTimer();state.timerInitial=state.timerRemaining=seconds;state.lastTimerSecond=null;updateTimerDisplay();els.timerWidget.classList.remove('hidden','urgent');els.timerDialog.close();toast('Timer impostato');}
function updateTimerDisplay(){const s=Math.max(0,Math.ceil(state.timerRemaining)),m=Math.floor(s/60),ss=s%60;els.timerReadout.textContent=`${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;els.timerPlay.textContent=state.timerRunning?'⏸':'▶';els.timerWidget.classList.toggle('urgent',state.timerRunning&&s<=5&&s>0);}
function startTimer(){if(state.timerRemaining<=0)state.timerRemaining=state.timerInitial;state.timerRunning=true;const start=performance.now(),from=state.timerRemaining;state.timerHandle=setInterval(()=>{state.timerRemaining=Math.max(0,from-(performance.now()-start)/1000);const sec=Math.ceil(state.timerRemaining);if(sec<=5&&sec>0&&sec!==state.lastTimerSecond){state.lastTimerSecond=sec;tone(720+sec*35,.06,'sine',.035);}if(state.timerRemaining<=0){stopTimer();state.timerRemaining=0;updateTimerDisplay();soundEnd();return;}updateTimerDisplay();},100);updateTimerDisplay();}
function stopTimer(){state.timerRunning=false;if(state.timerHandle){clearInterval(state.timerHandle);state.timerHandle=null;}updateTimerDisplay();}
els.timerPlay.addEventListener('click',()=>state.timerRunning?stopTimer():startTimer());els.timerReset.addEventListener('click',()=>{stopTimer();state.timerRemaining=state.timerInitial;state.lastTimerSecond=null;updateTimerDisplay();});els.timerClose.addEventListener('click',()=>{stopTimer();els.timerWidget.classList.add('hidden');});

// resize line handles have precedence over generic drag
new ResizeObserver(()=>resizeRenderer()).observe(els.workspace);
window.addEventListener('resize',resizeRenderer);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveLast();});
window.addEventListener('beforeunload',saveLast);

// Init
applyTheme(state.theme);updateSound();updateMagnet();renderCatalog();applyModeUI();renderItems();resizeRenderer();updateLastAvailability();showScreen('home');
