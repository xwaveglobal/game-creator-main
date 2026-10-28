import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createShadowRider } from './ShadowRider.js';

const $ = s => document.querySelector(s);
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}

try {
  const viewport=$('#viewport');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
  viewport.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x141a1e,.033);
  const camera=new THREE.PerspectiveCamera(36,1,.05,80);camera.position.set(.3,2.75,-8.6);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.65,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=2.2;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.23;controls.autoRotateSpeed=.8;
  const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xc8d8ee,0x44372e,1.2));
  const key=new THREE.DirectionalLight(0xe5e5dc,2.1);key.position.set(-3.5,7,-4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;key.shadow.bias=-.00015;scene.add(key);
  const orange=new THREE.DirectionalLight(0xff883b,4.8);orange.position.set(3,2.8,1);scene.add(orange);
  const blue=new THREE.DirectionalLight(0x4e94ff,5);blue.position.set(-3,3,2);scene.add(blue);
  const front=new THREE.DirectionalLight(0xcbded4,1.1);front.position.set(0,4,-5);scene.add(front);
  const character=createShadowRider();scene.add(character.root);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x070b0b,roughness:.94,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;scene.add(floor);
  const grid=new THREE.GridHelper(100,100,0x3b4844,0x2c3834);grid.position.y=.002;grid.material.transparent=true;grid.material.opacity=.28;scene.add(grid);
  const road=new THREE.Group();scene.add(road);
  const laneMaterial=new THREE.MeshStandardMaterial({color:0xadb29b,roughness:.85,transparent:true,opacity:.35});
  for(const x of [-1.25,1.25])for(let z=-18;z<20;z+=2.6){const dash=new THREE.Mesh(new THREE.PlaneGeometry(.025,1.25),laneMaterial);dash.rotation.x=-Math.PI/2;dash.position.set(x,.007,z);road.add(dash);}
  // A subtle circular presentation plate anchors the model without a fake backdrop.
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.65,1.66,128),new THREE.MeshBasicMaterial({color:0x9aaa85,transparent:true,opacity:.22,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.009;scene.add(ring);
  const stats=character.getStats();for(const k of ['triangles','meshes','joints','materials'])$('#'+k).textContent=stats[k].toLocaleString('vi-VN');
  const poseLabels={ride:'LƯỚT THẲNG',crouch:'CÚI THẤP',left:'RẼ TRÁI',right:'RẼ PHẢI',jump:'BẬT NHẢY',slide:'TRƯỢT THẤP'};
  let demo=false,demoTime=0,demoIndex=-1,rolling=true,cameraTween=null;
  function selectPose(pose,manual=true){if(manual)stopDemo();character.setPose(pose);document.querySelectorAll('[data-pose]').forEach(b=>{const selected=b.dataset.pose===pose;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',selected);});$('#pose-label').textContent=poseLabels[pose];}
  function stopDemo(){demo=false;$('#demo').classList.remove('running');$('#demo').children[1].textContent='Chạy toàn bộ động tác';$('#demo').children[0].textContent='▶';}
  $('#poses').addEventListener('click',e=>{const b=e.target.closest('[data-pose]');if(b)selectPose(b.dataset.pose);});
  $('#demo').addEventListener('click',()=>{if(demo){stopDemo();selectPose('ride',false);}else{demo=true;demoTime=0;demoIndex=-1;$('#demo').classList.add('running');$('#demo').children[1].textContent='Dừng trình diễn';$('#demo').children[0].textContent='Ⅱ';}});
  const cameras={game:{pos:[.3,2.75,-8.6],target:[0,1.65,0],label:'CAMERA GAME'},rear:{pos:[0,2.4,-6.4],target:[0,1.85,0],label:'SAU · CẬN CẢNH'},threequarter:{pos:[-5.2,3.1,6.4],target:[0,1.65,0],label:'3/4 PHÍA TRƯỚC'},front:{pos:[0,2.45,8.4],target:[0,1.7,0],label:'CHÍNH DIỆN'},left:{pos:[8,2.7,0],target:[0,1.65,0],label:'NGANG TRÁI'},right:{pos:[-8,2.7,0],target:[0,1.65,0],label:'NGANG PHẢI'}};
  function selectCamera(name){const c=cameras[name];cameraTween={from:camera.position.clone(),to:new THREE.Vector3(...c.pos),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(...c.target),t:0};controls.autoRotate=false;$('#rotate').checked=false;$('#view-label').textContent=c.label;document.querySelectorAll('[data-camera]').forEach(b=>{const active=b.dataset.camera===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});}
  $('#cameras').addEventListener('click',e=>{const b=e.target.closest('[data-camera]');if(b)selectCamera(b.dataset.camera);});
  controls.addEventListener('start',()=>{cameraTween=null;$('#view-label').textContent='GÓC TỰ DO';document.querySelectorAll('[data-camera]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});});
  $('#road').addEventListener('change',e=>{rolling=e.target.checked;road.visible=rolling;});
  $('#rotate').addEventListener('change',e=>{cameraTween=null;controls.autoRotate=e.target.checked;if(controls.autoRotate)$('#view-label').textContent='XOAY 360°';});
  $('#wireframe').addEventListener('change',e=>character.setWireframe(e.target.checked));
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.stage').requestFullscreen();}catch{toast('Trình duyệt không hỗ trợ toàn màn hình ở đây.');}});
  $('#screenshot').addEventListener('click',()=>{renderer.render(scene,camera);renderer.domElement.toBlob(b=>{if(b)download(b,'shadow-rider-preview.png');});});
  $('#export-model').addEventListener('click',async()=>{
    const b=$('#export-model');b.disabled=true;b.textContent='Đang xuất…';
    try{const result=await new GLTFExporter().parseAsync(character.root,{binary:true,onlyVisible:true});download(new Blob([result],{type:'model/gltf-binary'}),'shadow-rider.glb');toast('Đã xuất mesh GLB ở tư thế hiện tại.');}
    catch(err){console.error(err);toast('Không xuất được GLB. Hãy thử lại.');}
    finally{b.disabled=false;b.textContent='↓ Xuất GLB';}
  });
  const keyMap={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowDown:'slide',s:'slide',ArrowUp:'jump',' ':'jump',c:'crouch',w:'ride'};
  const held=new Set();
  window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)||e.ctrlKey||e.metaKey)return;const p=keyMap[e.key];if(p){e.preventDefault();if(!e.repeat){held.add(e.key);selectPose(p);}}});
  window.addEventListener('keyup',e=>{if(!held.has(e.key))return;held.delete(e.key);if(keyMap[e.key]!=='jump'&&!held.size)selectPose('ride');});
  window.addEventListener('blur',()=>{held.clear();if(!demo)selectPose('ride',false);});
  const resize=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(viewport);
  let last=performance.now(),time=0,frameCount=0,fpsTime=0;const demoPoses=['ride','left','ride','right','crouch','slide','jump','ride'];
  function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
    if(demo){demoTime+=dt;const idx=Math.floor(demoTime/2.2)%demoPoses.length;if(idx!==demoIndex){demoIndex=idx;selectPose(demoPoses[idx],false);}}
    character.update(dt,time,{rolling});
    if(rolling){road.children.forEach(d=>{d.position.z-=dt*2.7;if(d.position.z<-18)d.position.z+=39;});grid.position.z=-(time*2.7)%1;}
    if(cameraTween){cameraTween.t=Math.min(1,cameraTween.t+dt*1.65);const t=cameraTween.t*cameraTween.t*(3-2*cameraTween.t);camera.position.lerpVectors(cameraTween.from,cameraTween.to,t);controls.target.lerpVectors(cameraTween.targetFrom,cameraTween.targetTo,t);if(t>=1)cameraTween=null;}
    controls.update();renderer.render(scene,camera);frameCount++;fpsTime+=dt;if(fpsTime>1){$('#fps').textContent=`${Math.round(frameCount/fpsTime)} FPS`;frameCount=0;fpsTime=0;}
  }
  selectPose('ride',false);requestAnimationFrame(animate);$('#loading').hidden=true;
  // Deliberately exposed integration/debug surface; no application state is hidden in UI components.
  window.shadowRiderDemo={character,scene,camera,renderer,selectPose,selectCamera,getStats:()=>character.getStats()};
} catch(err){console.error(err);$('#loading').hidden=true;$('#error').hidden=false;}
