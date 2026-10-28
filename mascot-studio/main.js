import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createMascot} from './Mascot.js';
const $=s=>document.querySelector(s);
const poses={idle:'Đứng thư giãn',walk:'Đi bộ',run:'Chạy',jump:'Bật nhảy',duck:'Cúi thấp',left:'Trượt trái',right:'Trượt phải',ceiling:'Leo trần hầm',wall:'Leo tường'};
const cameras={threequarter:{label:'3/4 trước',p:[4,2.8,6.4]},front:{label:'Chính diện',p:[0,2.1,7.7]},rear:{label:'Phía sau',p:[0,2.3,-7.7]},left:{label:'Ngang trái',p:[-7.7,2.2,0]},right:{label:'Ngang phải',p:[7.7,2.2,0]},game:{label:'Camera game',p:[0,3.5,-7.8]}};
function buttons(id,items,attr){$(id).innerHTML=Object.entries(items).map(([k,v])=>`<button data-${attr}="${k}" aria-pressed="false">${typeof v==='string'?v:v.label}</button>`).join('');}
buttons('#poses',poses,'pose');buttons('#cameras',cameras,'camera');
let timeout;function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(timeout);timeout=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
try{
const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.outputColorSpace=T.SRGBColorSpace;$('#viewport').appendChild(renderer.domElement);
const scene=new T.Scene();scene.fog=new T.Fog(0x1b2b21,12,30);
const camera=new T.PerspectiveCamera(34,1,.05,100);camera.position.set(...cameras.threequarter.p);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.55,0);controls.enableDamping=true;controls.minDistance=3.8;controls.maxDistance=13;controls.maxPolarAngle=Math.PI*.78;controls.autoRotateSpeed=1;
const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
scene.add(new T.HemisphereLight(0xe8ffe1,0x354b30,.9));
function light(color,intensity,pos,shadow=false){const l=new T.DirectionalLight(color,intensity);l.position.set(...pos);l.castShadow=shadow;if(shadow){l.shadow.mapSize.set(1024,1024);Object.assign(l.shadow.camera,{left:-5,right:5,top:7,bottom:-5});l.shadow.normalBias=.025;l.shadow.bias=-.0001;}scene.add(l);return l;}
light(0xfff5df,2.2,[-3,6,5],true);light(0xc3f6ff,1.8,[3,3,-4]);light(0xccff76,1.1,[-4,2,-2]);
const mascot=createMascot();scene.add(mascot.root);
const studio=new T.Group();scene.add(studio);
const ground=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color:0x213b2b,roughness:.9}));ground.rotation.x=-Math.PI/2;ground.position.y=-.075;ground.receiveShadow=true;studio.add(ground);
const plate=new T.Mesh(new T.CylinderGeometry(1.48,1.52,.065,96),new T.MeshStandardMaterial({color:0x304a35,roughness:.55,metalness:.1}));plate.position.y=-.04;plate.receiveShadow=true;studio.add(plate);
const ring=new T.Mesh(new T.TorusGeometry(1.42,.009,8,128),new T.MeshBasicMaterial({color:0xa6d66f}));ring.rotation.x=Math.PI/2;ring.position.y=.002;studio.add(ring);
const grid=new T.GridHelper(40,40,0x567650,0x3c5843);grid.position.y=-.067;grid.material.opacity=.25;grid.material.transparent=true;studio.add(grid);
const special=new T.Group();scene.add(special);const specialMat=new T.MeshStandardMaterial({color:0x37493b,roughness:.7,metalness:.15});
const ceiling=new T.Mesh(new T.BoxGeometry(3.9,.12,2.5),specialMat);ceiling.position.set(0,3.19,0);ceiling.receiveShadow=true;special.add(ceiling);
const wall=new T.Mesh(new T.BoxGeometry(.12,4,2.5),specialMat);wall.position.set(-1.55,1.8,0);wall.receiveShadow=true;special.add(wall);
const accent=new T.MeshBasicMaterial({color:0xb4f66a});for(const x of [-1.5,1.5]){const strip=new T.Mesh(new T.BoxGeometry(.015,.015,2.4),accent);strip.position.set(x,3.122,0);ceiling.attach(strip);}
for(const z of [-1.1,1.1]){const strip=new T.Mesh(new T.BoxGeometry(.015,3.9,.015),accent);strip.position.set(-1.481,1.8,z);wall.attach(strip);}
const stats=mascot.stats();$('#stats').innerHTML=Object.entries(stats).map(([k,v])=>`<div><span>${({triangles:'Tam giác',meshes:'Mesh',joints:'Khớp',materials:'Vật liệu'})[k]}</span><b>${v.toLocaleString('vi-VN')}</b></div>`).join('');
let mode='idle',t=1,demo=false,demoElapsed=0,demoIndex=-1,tween=null;
function active(attr,key){document.querySelectorAll(`[data-${attr}]`).forEach(b=>{const yes=b.dataset[attr]===key;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});}
function setPose(k){mode=k;active('pose',k);$('#pose-label').textContent=poses[k].toUpperCase();ceiling.visible=k==='ceiling';wall.visible=k==='wall';}
function stopDemo(){demo=false;$('#demo').classList.remove('running');$('#demo span').textContent='Chạy toàn bộ động tác';}
function setCamera(k){const c=cameras[k];tween={p:camera.position.clone(),q:new T.Vector3(...c.p),elapsed:0};controls.autoRotate=false;$('#rotate').checked=false;active('camera',k);$('#camera-label').textContent=c.label.toUpperCase();}
$('#poses').onclick=e=>{const b=e.target.closest('[data-pose]');if(b){stopDemo();setPose(b.dataset.pose);}};
$('#cameras').onclick=e=>{const b=e.target.closest('[data-camera]');if(b)setCamera(b.dataset.camera);};
$('#demo').onclick=()=>{if(demo)stopDemo();else{demo=true;demoElapsed=0;demoIndex=-1;$('#demo').classList.add('running');$('#demo span').textContent='Dừng trình diễn';}};
$('#rotate').onchange=e=>{tween=null;controls.autoRotate=e.target.checked;};controls.addEventListener('start',()=>{tween=null;active('camera','');$('#camera-label').textContent='TỰ DO';});
$('#wire').onchange=e=>Object.values(mascot.materials).forEach(m=>{m.wireframe=e.target.checked;});$('#floor').onchange=e=>studio.visible=e.target.checked;
$('#speed').oninput=e=>$('#speed-label').textContent=Number(e.target.value).toFixed(1)+'×';
$('#capture').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(blob)save(blob,'lime-mascot-'+mode+'.png');});};
$('#export').onclick=async()=>{try{toast('Đang xuất mô hình…');const buffer=await new GLTFExporter().parseAsync(mascot.root,{binary:true,onlyVisible:true});save(new Blob([buffer],{type:'model/gltf-binary'}),'lime-mascot-'+mode+'.glb');toast('Đã xuất GLB · tư thế hiện tại, không kèm animation');}catch(e){toast('Không xuất được GLB: '+e.message);}};
window.addEventListener('keydown',e=>{if(e.target.matches('input'))return;const key={1:'idle',2:'walk',3:'run',ArrowUp:'jump',ArrowDown:'duck',ArrowLeft:'left',ArrowRight:'right',8:'ceiling',9:'wall'}[e.key];if(key){e.preventDefault();stopDemo();setPose(key);}});
function resize(){const r=$('#viewport').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe($('#viewport'));resize();
setPose('idle');active('camera','threequarter');let previous=performance.now(),fpsTime=0,frames=0;
renderer.setAnimationLoop(now=>{const dt=Math.min((now-previous)/1000,.05);previous=now;if($('#motion').checked)t+=dt*Number($('#speed').value);if(demo){demoElapsed+=dt;const n=Math.floor(demoElapsed/3.6)%Object.keys(poses).length;if(n!==demoIndex){demoIndex=n;setPose(Object.keys(poses)[n]);}}mascot.pose(mode,t);if(tween){tween.elapsed+=dt;const u=Math.min(1,tween.elapsed/.7),v=u*u*(3-2*u);camera.position.lerpVectors(tween.p,tween.q,v);if(u===1)tween=null;}controls.update();renderer.render(scene,camera);frames++;fpsTime+=dt;if(fpsTime>=1){$('#fps').textContent=Math.round(frames/fpsTime)+' FPS';frames=0;fpsTime=0;}});
// Read-only diagnostics used for validating geometry and every pose.
window.mascotStudio={stats,poseNames:Object.keys(poses),setPose,setCamera,mascot,scene,renderer,camera};
}catch(e){$('#error').hidden=false;$('#error').textContent='Không khởi tạo được 3D: '+e.message;console.error(e);}
