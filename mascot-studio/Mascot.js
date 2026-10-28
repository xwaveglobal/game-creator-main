import * as T from 'three';

// Editable, texture-free volumetric asset. All geometry belongs to the root.
export function createMascot(){
 const root=new T.Group();root.name='GreenMascot';
 const bodyRig=new T.Group();bodyRig.name='BodyRig';root.add(bodyRig);
 const material=(name,color,roughness=.35)=>new T.MeshPhysicalMaterial({name,color,roughness,metalness:0,clearcoat:.35,clearcoatRoughness:.25});
 const mats={skin:material('Lime_skin',0x79db05,.32),white:material('Glove_ivory',0xfffdf2,.48),shoe:material('Shoe_white',0xf6f8ec,.34),sole:material('Sole_warm_gray',0xcad0bd,.66),black:material('Eye_obsidian',0x101a10,.16),shine:new T.MeshBasicMaterial({name:'Eye_catchlight',color:0xffffff}),cheek:material('Cheek_peach',0xff9760,.6),mouth:material('Mouth_inner',0x4d1e1b,.7),tongue:material('Tongue_coral',0xf27356,.6)};
 const sphere=new T.SphereGeometry(1,32,24);
 function ell(parent,name,mat,pos,scale){const m=new T.Mesh(sphere,mat);m.name=name;m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function pivot(parent,name,pos){const p=new T.Group();p.name=name;p.position.set(...pos);parent.add(p);return p;}
 function tube(parent,name,points,r,mat){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(c,32,r,10,false),mat);m.name=name;m.castShadow=true;parent.add(m);return m;}
 ell(bodyRig,'Torso',mats.skin,[0,1.04,0],[.43,.51,.32]);
 ell(bodyRig,'Neck',mats.skin,[0,1.43,0],[.23,.18,.23]);
 const head=pivot(bodyRig,'Head',[0,1.98,0]);ell(head,'Head_surface',mats.skin,[0,0,0],[.77,.675,.64]);
 for(const s of [-1,1]){ell(head,'Ear_'+s,mats.skin,[s*.758,-.04,0],[.123,.19,.14]);}
 const face=pivot(head,'Face',[0,0,0]);
 for(const s of [-1,1]){
  const eye=ell(face,'Eye_'+s,mats.black,[s*.265,.045,.59],[.102,.152,.052]);eye.rotation.y=s*.25;
  ell(face,'Catchlight_'+s,mats.shine,[s*.265-.022,.102,.638],[.025,.038,.012]);
  ell(face,'Catchlight_small_'+s,mats.shine,[s*.265+.025,.008,.641],[.011,.014,.009]);
  const cheek=ell(face,'Cheek_'+s,mats.cheek,[s*.44,-.158,.517],[.112,.071,.017]);cheek.rotation.y=s*.47;
 }
 const mouthShape=new T.Shape();mouthShape.moveTo(-.145,0);mouthShape.quadraticCurveTo(0,-.027,.145,0);mouthShape.bezierCurveTo(.132,-.175,-.13,-.175,-.145,0);
 const mouth=new T.Mesh(new T.ExtrudeGeometry(mouthShape,{depth:.012,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:3,steps:1,curveSegments:24}),mats.mouth);mouth.name='Smile';mouth.position.set(0,-.17,.622);face.add(mouth);
 ell(face,'Tongue',mats.tongue,[0,-.264,.641],[.078,.034,.009]);
 const sprout=pivot(head,'Sprout',[0,.58,-.025]);
 // Tapered swept mesh gives the curl a rounded organic silhouette.
 const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(-.02,.24,0),new T.Vector3(.04,.43,0),new T.Vector3(.22,.48,0),new T.Vector3(.32,.35,.005),new T.Vector3(.25,.28,.01)]);
 const frames=curve.computeFrenetFrames(64,false),verts=[],normals=[],indices=[];
 for(let i=0;i<=64;i++){const u=i/64,p=curve.getPointAt(u),r=.115*(1-.48*u);for(let j=0;j<=16;j++){const a=j/16*Math.PI*2,n=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));verts.push(p.x+n.x*r,p.y+n.y*r,p.z+n.z*r);normals.push(n.x,n.y,n.z);if(i<64&&j<16){const k=i*17+j;indices.push(k,k+17,k+1,k+1,k+17,k+18);}}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setIndex(indices);const curl=new T.Mesh(geo,mats.skin);curl.name='Curled_sprout';sprout.add(curl);curl.castShadow=true;ell(sprout,'Sprout_tip',mats.skin,curve.getPointAt(1).toArray(),[.06,.06,.06]);
 const arms=[],legs=[];
 for(const s of [-1,1]){
  const shoulder=pivot(bodyRig,'Shoulder_'+s,[s*.36,1.36,0]);shoulder.rotation.z=s*.3;
  ell(shoulder,'Upper_arm_'+s,mats.skin,[s*.075,-.14,0],[.145,.235,.143]);
  const elbow=pivot(shoulder,'Elbow_'+s,[s*.10,-.29,0]);ell(elbow,'Forearm_'+s,mats.skin,[0,-.10,0],[.13,.18,.13]);
  const hand=pivot(elbow,'Hand_'+s,[0,-.24,0]);ell(hand,'Glove_cuff_'+s,mats.white,[0,0,0],[.165,.075,.16]);ell(hand,'Glove_palm_'+s,mats.white,[0,-.14,.01],[.17,.16,.13]);
  for(let f=0;f<4;f++){ell(hand,'Finger_'+s+'_'+f,mats.white,[(f-1.5)*.073,-.23-Math.sin(f/3*Math.PI)*.02,.04],[.054,.083,.065]);}
  ell(hand,'Thumb_'+s,mats.white,[-s*.16,-.115,.055],[.08,.105,.08]).rotation.z=-s*.45;
  for(let f=0;f<3;f++)tube(hand,'Glove_stitch_'+s+'_'+f,[[.045*(f-1),-.08,.132],[.045*(f-1),-.135,.143]],.003,mats.sole);
  arms.push({shoulder,elbow,hand});
  const hip=pivot(bodyRig,'Hip_'+s,[s*.235,.74,0]);ell(hip,'Thigh_'+s,mats.skin,[0,-.12,0],[.18,.24,.19]);
  const knee=pivot(hip,'Knee_'+s,[0,-.26,0]);ell(knee,'Shin_'+s,mats.skin,[0,-.10,0],[.147,.21,.145]);
  const ankle=pivot(knee,'Ankle_'+s,[0,-.28,0]);ell(ankle,'Shoe_collar_'+s,mats.shoe,[0,.075,0],[.188,.095,.19]);ell(ankle,'Shoe_upper_'+s,mats.shoe,[0,-.005,.10],[.22,.145,.32]);ell(ankle,'Shoe_sole_'+s,mats.sole,[0,-.105,.105],[.228,.06,.33]);
  tube(ankle,'Sole_piping_'+s,[[ -.19,-.067,.23],[-.13,-.067,.38],[.13,-.067,.38],[.19,-.067,.23]],.012,mats.white);
  for(let k=0;k<5;k++){const tread=new T.Mesh(new T.BoxGeometry(.31,.008,.018),mats.white);tread.name='Sole_tread_'+s+'_'+k;tread.position.set(0,-.161,-.09+k*.10);ankle.add(tread);}
  for(let k=0;k<3;k++)tube(ankle,'Shoe_seam_'+s+'_'+k,[[-.095,.09,.14+k*.055],[0,.121,.14+k*.055],[.095,.09,.14+k*.055]],.009,mats.white);
  legs.push({hip,knee,ankle});
 }
 const joints=[];root.traverse(o=>{if(o.isGroup)joints.push(o);});const rest=new Map(joints.map(o=>[o,{p:o.position.clone(),q:o.quaternion.clone()}]));
 function pose(mode,t){
  for(const j of joints){j.position.copy(rest.get(j).p);j.quaternion.copy(rest.get(j).q);}
  const wave=Math.sin(t*10),run=mode==='run',walk=mode==='walk',moving=run||walk;
  head.rotation.z=Math.sin(t*2)*.025;sprout.rotation.z=Math.sin(t*3+.5)*.055;
  bodyRig.position.y=Math.sin(t*3)*.012;
  if(moving){const w=Math.sin(t*(run?11:6));bodyRig.position.y=Math.abs(w)*(run?.085:.035);bodyRig.rotation.x=run?.12:.035;legs.forEach((l,i)=>{const a=i===0?1:-1;l.hip.rotation.x=a*w*(run?.8:.45);l.knee.rotation.x=Math.max(0,-a*w)*(run?1.05:.45);l.ankle.rotation.x=-l.knee.rotation.x*.35;arms[i].shoulder.rotation.x=-a*w*(run?.7:.4);arms[i].elbow.rotation.x=run?-.65:-.15;});}
  if(mode==='jump'){const h=Math.max(0,Math.sin(t*2.8));bodyRig.position.y=h*.85;legs[0].hip.rotation.x=-.65*h;legs[1].hip.rotation.x=.5*h;legs.forEach(l=>l.knee.rotation.x=.8*h);arms.forEach((a,i)=>{a.shoulder.rotation.z=(i?1:-1)*( .3+.9*h);a.elbow.rotation.x=-.3;});}
  if(mode==='duck'){bodyRig.position.y=-.32;bodyRig.rotation.x=.25;legs.forEach(l=>{l.hip.rotation.x=-.8;l.knee.rotation.x=1.3;l.ankle.rotation.x=-.5;});head.rotation.x=-.16;arms.forEach(a=>a.shoulder.rotation.x=-.65);}
  if(mode==='left'||mode==='right'){const s=mode==='left'?1:-1;bodyRig.rotation.z=s*.38;bodyRig.position.y=-.13;bodyRig.position.x=-s*.18;legs.forEach((l,i)=>{l.hip.rotation.x=i?.5:-.7;l.knee.rotation.x=.45;});arms.forEach((a,i)=>{a.shoulder.rotation.z=(i?1:-1)*1.0;a.elbow.rotation.x=-.25;});}
  if(mode==='ceiling'){bodyRig.rotation.z=Math.PI;bodyRig.position.y=3.14;const w=Math.sin(t*6);legs.forEach((l,i)=>l.hip.rotation.x=(i?1:-1)*w*.25);arms.forEach((a,i)=>a.shoulder.rotation.z=(i?1:-1)*.65);head.rotation.z=Math.sin(t*2)*.04;}
  if(mode==='wall'){bodyRig.rotation.z=-Math.PI/2;bodyRig.position.set(-1.5,1.7,0);legs.forEach((l,i)=>{l.hip.rotation.x=(i?1:-1)*Math.sin(t*6)*.35;l.knee.rotation.x=.25;});arms.forEach((a,i)=>{a.shoulder.rotation.z=(i?1:-1)*.7;a.shoulder.rotation.x=(i?1:-1)*Math.sin(t*6)*.5;});}
  // Blink only eye geometry; highlights follow the lids.
  const blink=Math.pow(Math.max(0,Math.cos(t*1.15)),70);face.children.forEach(m=>{if(m.name.startsWith('Eye_'))m.scale.y=.152*(1-.94*blink);if(m.name.startsWith('Catchlight'))m.visible=blink<.6;});
 }
 function stats(){let triangles=0,meshes=0;const materials=new Set();root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;materials.add(o.material);}});return {triangles,meshes,joints:joints.length,materials:materials.size};}
 pose('idle',1);return{root,pose,stats,materials:mats};
}
