import * as THREE from 'three';

// Character faces +Z. Ground is Y=0. Lengths are in metres.
// Public API: createShadowRider(), setPose(), update(), setWireframe(), getStats().
export function createShadowRider() {
  const root = new THREE.Group(); root.name = 'ShadowRider';
  const wheels = [], joints = [], capes = [];
  let seed = 1337;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function fabricTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#50464a'; ctx.fillRect(0,0,512,512);
    for(let i=0;i<55000;i++) { const v = 45 + rand()*50; ctx.fillStyle=`rgba(${v+13},${v+5},${v+9},${.1+rand()*.45})`; const x=rand()*512,y=rand()*512;ctx.fillRect(x,y,.6+rand()*2,rand()*4+.7); }
    ctx.globalAlpha=.13;ctx.lineWidth=.6;
    for(let i=0;i<512;i+=3){ctx.strokeStyle=i%2?'#17151b':'#baaba8';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
    const t = new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const fabric = fabricTexture();
  const cloth = new THREE.MeshStandardMaterial({color:0x97828c,map:fabric,bumpMap:fabric,bumpScale:.065,roughness:.96,side:THREE.DoubleSide});
  const leather = new THREE.MeshStandardMaterial({color:0x201b20,roughness:.62,map:fabric,bumpMap:fabric,bumpScale:.014});
  const trim = new THREE.MeshStandardMaterial({color:0x65504b,roughness:.74});
  const thread = new THREE.MeshStandardMaterial({color:0x958075,roughness:.88});
  const brown = new THREE.MeshStandardMaterial({color:0x503224,roughness:.67,bumpMap:fabric,bumpScale:.014});
  const brownEdge = new THREE.MeshStandardMaterial({color:0x9a7150,roughness:.73});
  const steel = new THREE.MeshStandardMaterial({color:0x7e7771,metalness:.85,roughness:.31});
  const darkSteel = new THREE.MeshStandardMaterial({color:0x27282b,metalness:.68,roughness:.38});
  const rubber = new THREE.MeshStandardMaterial({color:0x111317,roughness:.87});
  const soleMat = new THREE.MeshStandardMaterial({color:0x362e2c,roughness:.86});
  const black = new THREE.MeshBasicMaterial({color:0x050509});
  const wood = new THREE.MeshStandardMaterial({color:0x93633e,roughness:.7});
  const grip = new THREE.MeshStandardMaterial({color:0x242025,map:fabric,bumpMap:fabric,bumpScale:.035,roughness:1});
  const mats = {cloth,leather,trim,thread,brown,brownEdge,steel,darkSteel,rubber,soleMat,black,wood,grip};
  function mesh(geo,mat,parent=root,name='') {const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;m.name=name;parent.add(m);return m;}
  function group(parent,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);joints.push(g);return g;}
  function ellipsoid(parent,mat,x,y,z,sx,sy,sz){const m=mesh(new THREE.SphereGeometry(1,32,24),mat,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;}
  function box(parent,mat,x,y,z,sx,sy,sz,bevel=.025){
    const s=new THREE.Shape(),w=sx/2,h=sy/2,r=Math.min(bevel,w*.4,h*.4);
    s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);
    const geo=new THREE.ExtrudeGeometry(s,{depth:sz,bevelEnabled:true,bevelThickness:r*.4,bevelSize:r*.4,bevelSegments:2,steps:1});geo.translate(0,0,-sz/2);
    const m=mesh(geo,mat,parent);m.position.set(x,y,z);return m;
  }
  function tube(parent,points,radius,mat,segments=50){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,segments,radius,6,false),mat,parent);}
  function cylinder(parent,mat,r1,r2,length,x,y,z){const m=mesh(new THREE.CylinderGeometry(r1,r2,length,32),mat,parent);m.position.set(x,y,z);return m;}
  function stitch(parent,points){for(let i=0;i<points.length-1;i+=2)tube(parent,[points[i],points[i+1]],.0035,thread,2);}
  const motion=group(root,'motion');
  const board=group(motion,'skateboard');
  const outline=new THREE.Shape();
  outline.moveTo(-.29,-.64);outline.bezierCurveTo(-.31,-1.0,.31,-1.0,.29,-.64);outline.lineTo(.29,.64);outline.bezierCurveTo(.31,1.0,-.31,1.0,-.29,.64);outline.closePath();
  const deckGeo=new THREE.ExtrudeGeometry(outline,{depth:.065,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:3,curveSegments:18});
  deckGeo.rotateX(-Math.PI/2);
  const deck=mesh(deckGeo,wood,board,'maple_deck');deck.position.y=.29;
  const deckTop=mesh(new THREE.ShapeGeometry(outline,36),grip,board,'grip_tape');deckTop.rotation.x=-Math.PI/2;deckTop.position.y=.373;
  const railPoints=[];outline.getPoints(100).forEach(p=>railPoints.push([p.x,.375,-p.y]));tube(board,railPoints,.008,trim,110);
  for(const z of [-.58,.58]){
    box(board,darkSteel,0,.265,z,.19,.04,.21);
    const axle=cylinder(board,steel,.033,.033,.76,0,.16,z);axle.rotation.z=Math.PI/2;
    cylinder(board,steel,.055,.04,.10,0,.215,z);
    for(const x of [-.365,.365]){
      const wg=group(board,'wheel',x,.15,z);wheels.push(wg);
      const wheel=cylinder(wg,rubber,.145,.145,.15,0,0,0);wheel.rotation.z=Math.PI/2;
      for(const side of [-1,1]){
        const rim=cylinder(wg,darkSteel,.091,.091,.008,side*.078,0,0);rim.rotation.z=Math.PI/2;
        const bearing=cylinder(wg,steel,.036,.036,.012,side*.084,0,0);bearing.rotation.z=Math.PI/2;
        const ring=mesh(new THREE.TorusGeometry(.112,.003,6,40),soleMat,wg);ring.rotation.y=Math.PI/2;ring.position.x=side*.079;
      }
    }
    for(const x of [-.085,.085])for(const d of [-.065,.065]){const bolt=cylinder(board,steel,.012,.012,.006,x,.378,z+d);bolt.name='deck_bolt';}
  }
  const pelvis=group(motion,'pelvis',0,1.35,0);
  ellipsoid(pelvis,leather,0,.03,0,.37,.25,.26);
  const upper=group(pelvis,'spine',0,.16,0);
  const tunic=cylinder(upper,cloth,.32,.45,.83,0,.38,0);tunic.scale.z=.77;
  for(let i=0;i<3;i++){const edge=mesh(new THREE.TorusGeometry(.42-i*.012,.023,8,64),trim,upper);edge.rotation.x=Math.PI/2;edge.scale.y=.75;edge.position.y=.03+i*.065;}
  const belt=mesh(new THREE.TorusGeometry(.39,.055,10,64),brown,upper);belt.rotation.x=Math.PI/2;belt.scale.y=.76;belt.position.y=.22;
  box(upper,steel,0,.22,.31,.135,.12,.035,.01);box(upper,brown,0,.22,.335,.09,.077,.018,.006);
  // Diagonal leather baldric and a small framed metal buckle.
  const baldric=box(upper,brown,0,.49,.305,.115,.81,.035,.015);baldric.rotation.z=-.63;
  const buckle=box(upper,steel,.09,.59,.338,.16,.145,.025,.014);buckle.rotation.z=-.63;
  const buckleInset=box(upper,brown,.09,.59,.355,.108,.095,.015,.009);buckleInset.rotation.z=-.63;
  for(let i=0;i<7;i++){const yy=.19+i*.085,xx=(yy-.49)*.72;ellipsoid(upper,thread,xx+.035,yy,.332,.004,.009,.003);}
  for(let i=0;i<3;i++){
    const pouch=group(upper,'pouch',-.38-i*.03,.13-i*.025,-.14+i*.16);pouch.rotation.y=-.9;
    box(pouch,brown,0,0,0,.18,.25,.12);box(pouch,brownEdge,0,0,.065,.17,.24,.008,.008);
    box(pouch,brown,0,.074,.08,.19,.11,.04);ellipsoid(pouch,steel,0,.07,.107,.015,.015,.008);
    for(const x of [-.077,.077])tube(pouch,[[x,-.10,.077],[x,.10,.077]],.003,thread,2);
  }
  const head=group(upper,'hood',0,.83,.015);
  // Tailored hood: open front, rounded back and pointed crown, with fabric folds.
  const hoodPos=[],hoodUV=[],hoodIndex=[];const rows=48,cols=80;
  function hoodPoint(t,u){
    const opening=.84*Math.pow(1-t,.42),theta=opening+u*(Math.PI*2-2*opening);
    const radius=Math.pow(Math.max(0,1-t),.68)*(.75+.43*Math.sin(t*Math.PI));
    const fold=1+.036*Math.cos(theta*9+t*13)+.025*Math.sin(theta*15-t*7)+.065*Math.cos(t*20+theta*2)*Math.pow(1-t,3);
    return [Math.sin(theta)*radius*fold,.02+t*1.2+Math.cos(theta)*.09*(1-t),Math.cos(theta)*radius*.79*fold+.10*t];
  }
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,u=i/cols;hoodPos.push(...hoodPoint(t,u));hoodUV.push(u,t);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;hoodIndex.push(a,b,a+1,b,b+1,a+1);}
  const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hoodPos,3));hg.setAttribute('uv',new THREE.Float32BufferAttribute(hoodUV,2));hg.setIndex(hoodIndex);hg.computeVertexNormals();mesh(hg,cloth,head,'tailored_hood');
  ellipsoid(head,black,0,.38,.13,.51,.47,.29);
  const rimL=[],rimR=[],seamL=[],seamR=[];
  for(let i=0;i<=60;i++){let t=i/60;rimL.push(hoodPoint(t,0));rimR.push(hoodPoint(t,1));const p=hoodPoint(t,.5);seamL.push([p[0]-.012,p[1],p[2]-.008]);seamR.push([p[0]+.012,p[1],p[2]-.008]);}
  tube(head,rimL,.018,trim,65);tube(head,rimR,.018,trim,65);tube(head,seamL,.006,trim,65);tube(head,seamR,.006,trim,65);stitch(head,seamL);
  // Soft layered scarf around the neck instead of a visible face.
  for(let i=0;i<4;i++){
    const scarf=mesh(new THREE.TorusGeometry(.43-i*.019,.075,12,64),cloth,head);scarf.rotation.x=Math.PI/2+.12;scarf.position.set(0,-.055+i*.085,-.015);scarf.scale.set(1,.78,.65);
  }
  const shoulder=mesh(new THREE.TorusGeometry(.46,.12,12,70,Math.PI*1.7),cloth,upper);shoulder.rotation.x=Math.PI/2;shoulder.rotation.z=.48;shoulder.scale.set(1.15,.81,.5);shoulder.position.set(0,.75,-.03);
  function capeAlpha(index){const c=document.createElement('canvas');c.width=512;c.height=768;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,512,768);ctx.fillStyle='#000';
    for(let i=0;i<10;i++){const x=rand()*512,y=400+rand()*280;ctx.beginPath();for(let j=0;j<8;j++){let a=j/8*Math.PI*2,r=(7+rand()*18)*(i%3===0?1.8:1);let px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.55;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;return t;}
  for(let layer=0;layer<3;layer++){
    const nx=40,ny=28,positions=[],uvs=[],indices=[];
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
      let u=i/nx,v=j/ny,x=(u-.5)*(1.08+v*(.81-layer*.08))+.34*v*v;
      let y=.83-v*(1.37-layer*.19);y-=Math.pow(v,9)*(.06+.14*Math.sin(u*27+layer*2)+.10*Math.sin(u*51));
      let z=-.30-v*(.28+layer*.08)-.11*Math.cos(u*Math.PI*8+v*4)*(.3+v);
      positions.push(x+(layer-1)*.055,y,z);uvs.push(u,1-v);
    }
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;indices.push(a,a+1,b,a+1,b+1,b);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    const mat=cloth.clone();mat.alphaMap=capeAlpha(layer);mat.alphaTest=.5;mat.color.setHex([0x9b858d,0x7a6974,0x8b737d][layer]);
    const m=mesh(geo,mat,upper,`tattered_cape_${layer}`);m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaMap:mat.alphaMap,alphaTest:.5,side:THREE.DoubleSide});
    capes.push({mesh:m,base:new Float32Array(positions),nx,ny});
    // Hem detail is part of the deforming surface; no static outline to detach in motion.
  }
  const arms=[];
  for(const side of [-1,1]){
    const arm=group(upper,side<0?'right_shoulder':'left_shoulder',side*.40,.72,0);arm.rotation.z=side*.63;
    const sleeve=cylinder(arm,cloth,.20,.16,.42,0,-.19,0);sleeve.scale.z=.9;
    for(let i=0;i<3;i++){const wrinkle=mesh(new THREE.TorusGeometry(.185-i*.008,.028,9,36),cloth,arm);wrinkle.rotation.x=Math.PI/2+.13;wrinkle.scale.z=.65;wrinkle.position.y=-.10-i*.08;}
    const cuff=mesh(new THREE.TorusGeometry(.176,.025,8,36),trim,arm);cuff.rotation.x=Math.PI/2;cuff.position.y=-.36;
    const elbow=group(arm,'elbow',0,-.38,0);elbow.rotation.x=-.23;
    cylinder(elbow,leather,.146,.115,.36,0,-.16,0);
    for(let i=0;i<4;i++){const band=mesh(new THREE.TorusGeometry(.145-i*.006,.018,8,32),leather,elbow);band.rotation.x=Math.PI/2;band.position.y=-.035-i*.075;}
    const hand=group(elbow,'wrist',0,-.39,0);ellipsoid(hand,leather,0,-.035,0,.125,.16,.075);
    for(let i=0;i<4;i++){const finger=ellipsoid(hand,leather,(i-1.5)*.052,-.16,.012,.027,.085-i*.006,.033);finger.rotation.x=-.25;}
    const thumb=ellipsoid(hand,leather,side*.12,-.03,.025,.04,.085,.043);thumb.rotation.z=side*.5;
    arms.push({arm,elbow,hand,side});
  }
  const legs=[];
  for(const side of [-1,1]){
    const hip=group(pelvis,side<0?'right_hip':'left_hip',side*.205,0,side*.19);
    const thigh=cylinder(hip,leather,.215,.175,.49,0,-.23,0);thigh.scale.z=.95;
    for(let i=0;i<4;i++){const fold=mesh(new THREE.TorusGeometry(.19-i*.003,.022,8,36),cloth,hip);fold.rotation.x=Math.PI/2+.1*Math.sin(i);fold.scale.y=.95;fold.position.set(0,-.1-i*.09,.01);}
    const knee=group(hip,'knee',0,-.47,0);ellipsoid(knee,leather,0,0,.02,.18,.18,.18);
    cylinder(knee,leather,.17,.14,.34,0,-.15,0);
    for(let i=0;i<4;i++){const band=mesh(new THREE.TorusGeometry(.17-i*.006,.022,8,36),trim,knee);band.rotation.x=Math.PI/2+.07;band.position.y=-.03-i*.075;}
    const ankle=group(knee,'ankle',0,-.35,0);
    ellipsoid(ankle,leather,0,-.02,.065,.177,.155,.27);
    box(ankle,soleMat,0,-.12,.055,.345,.075,.53,.06);box(ankle,trim,0,-.082,.055,.35,.025,.53,.045);
    for(let i=0;i<4;i++){const strap=box(ankle,leather,0,.015,.16-i*.08,.345,.045,.055,.01);strap.rotation.x=-.12;}
    box(ankle,steel,side*.18,.05,.03,.025,.09,.08,.01);box(ankle,brown,side*.197,.05,.03,.012,.052,.047,.005);
    for(let i=0;i<6;i++)box(ankle,rubber,0,-.16,-.15+i*.075,.31,.017,.023,.003);
    legs.push({hip,knee,ankle,side});
  }
  let pose='ride', elapsed=0, blend={lean:0,duck:0,jump:0,slide:0};
  function setPose(next){if(!['ride','crouch','left','right','jump','slide'].includes(next))throw new Error(`Unknown pose: ${next}`);pose=next;elapsed=0;}
  function update(dt,time,{rolling=true}={}){
    elapsed+=dt;const a=1-Math.exp(-dt*8);
    const targetLean=pose==='left'?-.39:pose==='right'?.39:0;
    const targetDuck=pose==='slide'?1:pose==='crouch'?.67:0;
    const jumpProgress=Math.min(elapsed/1.35,1),jump=pose==='jump'?Math.sin(jumpProgress*Math.PI):0;
    blend.lean=THREE.MathUtils.lerp(blend.lean,targetLean,a);blend.duck=THREE.MathUtils.lerp(blend.duck,targetDuck,a);blend.jump=THREE.MathUtils.lerp(blend.jump,jump,a);
    const lean=blend.lean,duck=blend.duck,j=blend.jump;
    motion.position.y=j*.85;motion.rotation.z=lean;motion.rotation.y=-lean*.58;
    board.rotation.z=-lean*.4;board.rotation.x=pose==='jump'?-.23*Math.sin(jumpProgress*Math.PI*2):0;
    pelvis.position.y=1.35-duck*.43-j*.13;pelvis.position.z=duck*.08;
    upper.rotation.x=duck*.97+.06;upper.rotation.z=-lean*.13;
    head.rotation.x=-duck*.17;
    for(const l of legs){
      // Two-bone sagittal IK keeps each boot on the deck while the pelvis drops.
      const l1=.47,l2=.35,dy=Math.min(.815,Math.max(.22,pelvis.position.y-.54)),dz=-pelvis.position.z;
      const distance=Math.min(.818,Math.hypot(dy,dz));
      const bend=Math.acos(THREE.MathUtils.clamp((distance*distance-l1*l1-l2*l2)/(2*l1*l2),-1,1));
      const hipAngle=Math.atan2(-dz,dy)-Math.acos(THREE.MathUtils.clamp((l1*l1+distance*distance-l2*l2)/(2*l1*distance),-1,1));
      l.hip.rotation.x=hipAngle;l.hip.rotation.z=0;
      l.knee.rotation.x=bend;l.ankle.rotation.x=-hipAngle-bend;
    }
    for(const ar of arms){ar.arm.rotation.z=ar.side*(.95+Math.abs(lean)*.6-duck*.51)-lean*.55;ar.arm.rotation.x=.08+duck*.5-j*.38;ar.elbow.rotation.x=-.40-duck*.65;ar.hand.rotation.x=duck*.1;}
    for(const c of capes){const attr=c.mesh.geometry.attributes.position;for(let i=0;i<attr.count;i++){
      const k=i*3,v=Math.floor(i/(c.nx+1))/c.ny,u=(i%(c.nx+1))/c.nx;
      attr.array[k]=c.base[k]+(Math.sin(time*3.2+u*5-v*3)*.055+lean*.7)*v*v;
      attr.array[k+1]=c.base[k+1]+Math.sin(time*3.5-v*5+u*6)*.035*v+(duck*.43+j*.15)*v;
      attr.array[k+2]=c.base[k+2]-(.15+Math.sin(time*4-v*7+u*3)*.08+duck*.42+j*.20)*v*v;
    }attr.needsUpdate=true;c.mesh.geometry.computeVertexNormals();}
    if(rolling)wheels.forEach(w=>w.rotation.x+=dt*11);
  }
  function setWireframe(enabled){root.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material])m.wireframe=enabled;}});}
  function getStats(){let meshes=0,triangles=0;const materials=new Set();root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});return {meshes,triangles:Math.round(triangles),joints:joints.length,materials:materials.size};}
  update(0,0);
  return {root,setPose,update,setWireframe,getStats,get pose(){return pose;},materials:mats};
}
