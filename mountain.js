// Map Pendakian Gunung PARKOUR 3D. Dibuat terpisah dari snow.js.
export function buildMountainWorld(THREE, scene, api = {}) {
  const grp = new THREE.Group();
  grp.name = 'MOUNTAIN_WORLD';
  grp.visible = false;
  scene.add(grp);

  const P = [], C = [], cpList = [], route = [];
  const hazards = [], windZones = [], swingPlanks = [], rotators = [];
  const vanish = [], cracks = [], npcs = [], glowCrystals = [];
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...extra });
  const grassMat = mat(0x397b3d), dirtMat = mat(0x795238), stoneMat = mat(0x777b80);
  const darkStoneMat = mat(0x515960), woodMat = mat(0x80502d), leafMat = mat(0x176b38);
  const leafLightMat = mat(0x2c8a45), waterMat = new THREE.MeshStandardMaterial({
    color: 0x369bd0, transparent: true, opacity: 0.62, roughness: 0.22, metalness: 0.08
  });
  const snowMat = mat(0xf4f8fb), cpMat = mat(0x22ddaa, { emissive: 0x0b9b72, emissiveIntensity: 0.45 });
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, roughness: 1 });

  grp.add(new THREE.HemisphereLight(0xe9f7ff, 0x526345, 1.25));
  const sun = new THREE.DirectionalLight(0xfff1d2, 1.35);
  sun.position.set(-35, 75, 28); grp.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), mat(0x587d48));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -9; grp.add(ground);

  // Format platform mengikuti snow.js: permukaan atas berada di y + 0.25.
  function plat(x, y, z, w, d, o = {}) {
    const h = o.h || 0.5, type = o.type || 'static';
    const geometry = o.shape === 'round'
      ? new THREE.CylinderGeometry(w / 2, w / 2, h, 24)
      : new THREE.BoxGeometry(w, h, d);
    const material = o.cp ? cpMat : (o.material || (o.kind === 'grass' ? grassMat :
      o.kind === 'wood' ? woodMat : o.kind === 'snow' ? snowMat : o.kind === 'dirt' ? dirtMat : stoneMat));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + 0.25 - h / 2, z); grp.add(mesh);
    const p = {
      mesh, width: w, depth: d, type, hh: h / 2,
      startX: mesh.position.x, startY: mesh.position.y, startZ: mesh.position.z,
      range: o.range ?? 2.2, speed: o.speed ?? 1.3,
      phase: (P.length * 2.39996) % (Math.PI * 2),
      isFallen: false, tell: 0, revealTimer: 0, dx: 0, r: o.shape === 'round' ? w / 2 : 0,
      grip: [0.85, 0.8]
    };
    if (o.cp) {
      p.checkpoint = true; p.checkpointActivated = false;
      p.checkpointReadyMaterial = cpMat; cpList.push(p);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3, 8), mat(0xd9dedf));
      pole.position.set(x + w / 2 - 0.65, y + 1.75, z + d / 2 - 0.65); grp.add(pole);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.68, 0.06), new THREE.MeshBasicMaterial({ color: 0x22ddaa }));
      flag.position.set(x + w / 2, y + 2.65, z + d / 2 - 0.65); grp.add(flag);
    }
    if (o.route) route.push(p);
    P.push(p); return p;
  }
  const top = p => p.mesh.position.y + p.hh;

  function tree(x, z, scale = 1) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22*scale, 0.34*scale, 2.4*scale, 8), woodMat);
    trunk.position.set(x, 1.2*scale, z); grp.add(trunk);
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry((1.45-i*0.25)*scale, 2.0*scale, 9), i === 2 ? leafLightMat : leafMat);
      cone.position.set(x, (2.1 + i*0.85)*scale, z); grp.add(cone);
    }
  }
  function boulder(x, y, z, scale = 1) {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), stoneMat);
    rock.scale.set(1.2*scale, 0.8*scale, 1.0*scale); rock.position.set(x, y, z); grp.add(rock);
  }
  function checkpointPlatform(x,y,z,w,d) { return plat(x,y,z,w,d,{kind:'grass',cp:true,route:1}); }

  // ZONA 1 — area lapang, hutan pinus, sungai dangkal, dan terowongan.
  plat(0, 0, 0, 18, 18, { kind:'grass', route:1 });
  plat(0, 0, -15, 12, 13, { kind:'grass', route:1 });
  plat(0, 0.15, -27, 5, 8, { kind:'dirt', route:1 });
  plat(0, 0.15, -36, 9, 8, { kind:'dirt', route:1 });
  for (const [x,z,s] of [[-8,-4,1.2],[8,-5,1.1],[-7,-14,1],[7,-17,1.2],[-9,-24,1.1],[9,-25,1.15],[-5,-32,.9],[6,-34,1]]) tree(x,z,s);
  boulder(-5,0.8,-8,1.3); boulder(5,0.65,-19,1.1); boulder(-4,0.8,-31,1.2);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 13), waterMat);
  river.rotation.x = -Math.PI/2; river.position.set(0,0.04,-25); grp.add(river);
  // Batu pijakan melintasi sungai.
  plat(-1.7,0.15,-24,1.7,1.8,{kind:'stone',route:1});
  plat(1.4,0.35,-27,1.7,1.8,{kind:'stone',route:1});
  plat(-1.3,0.55,-30,1.7,1.8,{kind:'stone',route:1});
  // Terowongan batu berbentuk lengkung; lantainya tetap collider platform.
  plat(0,0.2,-43,9,9,{kind:'dirt',route:1});
  const tunnelArch = new THREE.Mesh(new THREE.TorusGeometry(4.1,0.72,10,28,Math.PI), darkStoneMat);
  tunnelArch.position.set(0,0.35,-43); tunnelArch.rotation.z = Math.PI; grp.add(tunnelArch);
  boulder(-4.5,1.2,-43,1.5); boulder(4.5,1.2,-43,1.5);
  checkpointPlatform(0,0.35,-53,12,10); // CP 1 — keluar terowongan

  // ZONA 2 — lereng, pijakan bergerak, jembatan kayu, dan batu bergulir.
  plat(0,1.2,-64,7,7,{kind:'stone',route:1});
  plat(4.7,2.2,-70,3.4,3.4,{kind:'stone',type:'moving_y',range:0.8,speed:1.2,route:1});
  plat(9.2,3.1,-75,3.2,3.2,{kind:'stone',type:'moving_x',range:1.7,speed:1.1,route:1});
  plat(13.8,4.0,-80,3.2,3.2,{kind:'stone',type:'moving_y',range:0.9,speed:1.4,route:1});
  plat(17.8,4.6,-85,5,5,{kind:'stone',route:1});
  // Jembatan statis memanjang dengan papan visual berayun.
  for (let i=0;i<7;i++) {
    const x = 17.8 + (i-3)*1.75;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.62,0.22,2.8),woodMat);
    plank.position.set(x,4.85,-93); grp.add(plank);
    swingPlanks.push({mesh:plank,speed:1.1+i*0.06,phase:i*0.72});
    plat(x,4.6,-93,1.62,2.8,{kind:'wood',route:1});
  }
  const ropeMat = mat(0x4c3828);
  for (const side of [-1,1]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,12.2,8),ropeMat);
    rope.position.set(17.8,6.2,-93+side*1.7); rope.rotation.z=Math.PI/2; grp.add(rope);
  }
  // Batu besar bergerak turun-naik sepanjang jalur. Test memakai jarak bola pemain.
  function rollingRock(x,y,z,axis,range,speed,phase=0) {
    const radius=1.35;
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(radius,2),darkStoneMat);
    mesh.position.set(x,y+radius,z); grp.add(mesh);
    const hazard={
      mesh, radius,
      update(t) {
        const v=Math.sin(t*speed+phase)*range;
        if(axis==='x') mesh.position.x=x+v;
        else mesh.position.z=z+v;
        mesh.rotation.x += 0.035*speed;
        mesh.rotation.z += 0.025*speed;
      },
      test(playerPos) {
        const dx=playerPos.x-mesh.position.x, dy=(playerPos.y+0.8)-mesh.position.y, dz=playerPos.z-mesh.position.z;
        if (dx*dx+dy*dy+dz*dz < (radius+0.72)*(radius+0.72)) {
          const len = Math.hypot(dx, dz) || 1;
          return { x: dx / len, z: dz / len };
        }
        return false;
      }
    };
    hazards.push(hazard);
  }
  rollingRock(17.8,4.9,-88,'z',5.8,1.0,0.5);
  rollingRock(9.0,3.8,-78,'x',3.2,1.3,1.8);
  plat(12,5.2,-103,8,8,{kind:'stone',route:1});
  checkpointPlatform(4,6.1,-111,9,8); // CP 2

  // ZONA 3 — tebing, platform kecil berjauhan, badai dan pendulum.
  plat(4,7.2,-121,4.2,4.2,{kind:'stone',route:1});
  plat(0,8.8,-128,2.5,2.5,{kind:'stone',route:1});
  plat(-5,10.5,-135,2.3,2.3,{kind:'stone',route:1});
  plat(-1,12.3,-142,2.2,2.2,{kind:'stone',type:'moving_x',range:1.3,speed:1.25,route:1});
  plat(5,14.1,-149,2.2,2.2,{kind:'stone',route:1});
  plat(10,16,-156,2.1,2.1,{kind:'stone',type:'moving_y',range:0.75,speed:1.4,route:1});
  checkpointPlatform(14,17.2,-164,8,8); // CP 3 sebelum tanjakan terakhir

  // Wind zone visual dan data dorongan, selaras dengan pola windZones pada snow.js.
  windZones.push({x:5,z:-149,hx:7,hz:7,dx:-7.5,dz:2.0,maxY:24});
  const gustMat=new THREE.MeshBasicMaterial({color:0xbcecff,transparent:true,opacity:0.3});
  for(let i=0;i<8;i++){
    const gust=new THREE.Mesh(new THREE.TorusGeometry(1.1+i*.12,.035,6,20),gustMat);
    gust.position.set(2+(i%3)*2,15+i*.35,-145-i*1.7); gust.rotation.x=Math.PI/2; grp.add(gust);
  }
  // Pendulum kayu berduri di atas lintasan sempit.
  const pivot=new THREE.Group(); pivot.position.set(14,22,-178); grp.add(pivot);
  const beam=new THREE.Mesh(new THREE.BoxGeometry(.42,5.5,.42),woodMat); beam.position.y=-2.5; pivot.add(beam);
  const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,1),darkStoneMat); ball.position.y=-5.2; pivot.add(ball);
  for(let i=0;i<8;i++){
    const spike=new THREE.Mesh(new THREE.ConeGeometry(.22,.8,5),woodMat);
    const a=i*Math.PI/4; spike.position.set(Math.cos(a)*1.1,-5.2,Math.sin(a)*1.1);
    spike.rotation.z=Math.cos(a)*Math.PI/2; spike.rotation.x=Math.sin(a)*Math.PI/2; pivot.add(spike);
  }
  rotators.push({mesh:pivot,speed:1.35,radius:5.5});
  hazards.push({
    mesh:pivot,
    update(t){ pivot.rotation.z=Math.sin(t*1.35)*0.82; },
    test(playerPos){
      const bx=pivot.position.x+Math.sin(pivot.rotation.z)*5.1;
      const by=pivot.position.y-Math.cos(pivot.rotation.z)*5.1;
      const bz=pivot.position.z;
      const dx = playerPos.x - bx, dz = playerPos.z - bz;
      if (Math.hypot(dx, (playerPos.y + 0.8) - by, dz) < 1.9) {
        const len = Math.hypot(dx, dz) || 1;
        return { x: dx / len, z: dz / len };
      }
      return false;
    }
  });

  // ZONA 4 — tanjakan akhir dan puncak bersalju.
  plat(14,18.5,-176,4,4,{kind:'stone',route:1});
  plat(9,20.2,-183,2.4,2.4,{kind:'stone',route:1});
  plat(4,22,-190,2.3,2.3,{kind:'snow',route:1});
  plat(-1,23.8,-197,2.3,2.3,{kind:'snow',type:'moving_x',range:1.1,speed:1.0,route:1});
  const summit=plat(-6,25.5,-204,15,15,{kind:'snow',route:1});
  // Salju dekoratif di bibir puncak.
  for(let i=0;i<12;i++){
    const x=-12+(i%4)*4.0, z=-210+Math.floor(i/4)*4.0;
    const cap=new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),snowMat);
    cap.scale.set(1.5,.45,1.0); cap.position.set(x,26.3,z); grp.add(cap);
  }
  // Bendera finish.
  const flagPole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,6,10),mat(0xe5e5e5));
  flagPole.position.set(-10,29,-204); grp.add(flagPole);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.25),new THREE.MeshStandardMaterial({color:0xffcc33,side:THREE.DoubleSide}));
  flag.position.set(-8.9,31,-204); grp.add(flag);
  // Papan finish dengan CanvasTexture.
  const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=256;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#263b2b'; ctx.fillRect(0,0,1024,256);
  ctx.strokeStyle='#f4d36c'; ctx.lineWidth=14; ctx.strokeRect(10,10,1004,236);
  ctx.fillStyle='#ffffff'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font='bold 68px sans-serif'; ctx.fillText('PUNCAK GUNUNG',512,92);
  ctx.font='bold 62px sans-serif'; ctx.fillText('TERCAPAI',512,177);
  const board=new THREE.Mesh(new THREE.PlaneGeometry(9,2.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide}));
  board.position.set(-6,30,-210); grp.add(board);
  // Awan putih mengelilingi puncak.
  for(let i=0;i<16;i++){
    const a=i/16*Math.PI*2, r=14+(i%3)*2;
    const cloud=new THREE.Mesh(new THREE.SphereGeometry(2.4+(i%3)*.45,12,10),cloudMat);
    cloud.scale.set(1.5,.65,1.0); cloud.position.set(-6+Math.cos(a)*r,24+(i%4)*.8,-204+Math.sin(a)*r); grp.add(cloud);
  }

  // Tambahkan visual bebatuan di sisi tebing dan salju di area tinggi.
  for(let i=0;i<24;i++){
    const x=(i%2?1:-1)*(8+(i%5)*2), y=8+Math.floor(i/6)*4, z=-120-i*3.2;
    boulder(x,y,z,.8+(i%3)*.25);
  }

  const tpOf = p => [p.mesh.position.x, top(p)+0.05, p.mesh.position.z];
  const WINP={x:-6,y:top(summit),z:-204};
  const world = {
    platforms:P, hazards, guards:[], laserBeam:null,
    FIN_Y:top(summit), WIN:WINP, MAZE_H:0, MAZE_Z:0,
    cover:C, cracks, route, npcs, cps:cpList, checkpoint:cpList,
    vanish, rotators, snowballs:[], windZones, swingPlanks, glowCrystals,
    tp:{start:[0,0.25,0],hub:tpOf(cpList[0]),top:tpOf(cpList[2]),maze:tpOf(cpList[2]),finish:[WINP.x,WINP.y,WINP.z]}
  };
  return {world, group:grp};
}
