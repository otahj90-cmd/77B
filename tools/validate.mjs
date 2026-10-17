import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'floorplan-data.js'),'utf8'),sandbox);
const p = sandbox.window.FLOORPLAN77B;
assert.equal(p.id,'77B-wall-revision-v2');
assert.equal(p.units,'mm');
assert.equal(p.windows.length,p.windowHeights.length);
assert.deepEqual(Array.from(p.dimensions.chains[0].segments),[2900,2400,2300,3500]);
assert.equal(p.dimensions.chains[0].segments.reduce((a,b)=>a+b,0),11100);
assert.equal(p.dimensions.chains[2].segments.reduce((a,b)=>a+b,0),10950);
const net = (id,w,d) => {
  const r = p.rooms.find(r=>r.id===id), xs=r.poly.map(p=>p[0]), ys=r.poly.map(p=>p[1]);
  assert.equal(Math.max(...xs)-Math.min(...xs),w,id+' width');
  assert.equal(Math.max(...ys)-Math.min(...ys),d,id+' depth');
};
net('bed2',2200,2800); net('bed1',2200,2700); net('mbath',2450,1550); net('gbath',2450,1550);
net('kitchen',1900,2450); net('living',3200,2800); net('balcony',3200,1450);
assert.equal(p.rooms.find(r=>r.id==='bay-master').elevation,450);
assert.equal(p.rooms.find(r=>r.id==='services').elevation,0);
assert.equal(p.rooms.find(r=>r.id==='services').counted,false);
assert.equal(p.wallRevision.status,'derived');
assert.deepEqual(Array.from(p.wallRevision.innerPath[2]),[10850,1900]);
assert.deepEqual(Array.from(p.wallRevision.innerPath[4]),[11450,3300]);
for (const [name,items] of [['walls',p.walls],['windows',p.windows]]) for(const r of items){
  assert.ok(r.slice(0,4).every(Number.isFinite),name+' finite coordinates');
  assert.ok(r[2]>r[0] && r[3]>r[1],name+' positive rectangle');
}
for (const d of p.doors){
  assert.ok(d.len>0); assert.equal(Math.hypot(...d.c),1); assert.equal(Math.hypot(...d.o),1);
  assert.ok(Math.abs(d.c[0]*d.o[0]+d.c[1]*d.o[1])<1e-9);
  const ex=d.h[0]+d.c[0]*d.len,ey=d.h[1]+d.c[1]*d.len;
  assert.ok(ex>=d.rect[0] && ex<=d.rect[2] && ey>=d.rect[1] && ey<=d.rect[3],d.name+' closed endpoint');
}
const area = poly => Math.abs(poly.reduce((s,a,i)=>{const b=poly[(i+1)%poly.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;
assert.equal(new Set(p.rooms.map(r=>r.id)).size,p.rooms.length);
for(const r of p.rooms){ assert.ok(r.poly.length>=4 && area(r.poly)>0,r.id+' floor'); }
// Verify same-floor rooms do not overlap on a 50 mm raster away from boundaries.
const inside = (x,y,poly) => {
  let yes=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) yes=!yes;
  }
  return yes;
};
const maxX = Math.max(...p.walls.map(w=>w[2]));
for(let y=25;y<10000;y+=50)for(let x=-125;x<maxX;x+=50){
  const hit=p.rooms.filter(r=>inside(x,y,r.poly));
  assert.ok(hit.length<=1,`Floor overlap at ${x},${y}: ${hit.map(r=>r.id)}`);
}
// Regression for the previously missing east recess and projection.
const entry = p.rooms.find(r=>r.id==='entry'), dining = p.rooms.find(r=>r.id==='dining');
assert.ok(!inside(11000,2500,entry.poly),'Entry must follow the recess');
assert.ok(inside(11300,3700,dining.poly),'Dining must include the projection');
assert.ok(!inside(11300,4700,dining.poly),'Dining must return to the main east line');
const eastWalls = p.walls.filter(w=>w[0]>=10850);
for(const r of [entry,dining]) for(let y=175;y<5550;y+=25)for(let x=10675;x<maxX;x+=25){
  if(inside(x,y,r.poly))assert.ok(!eastWalls.some(w=>x>w[0]&&x<w[2]&&y>w[1]&&y<w[3]),r.id+' floor inside east wall');
}
const cabinet = p.furniture.find(f=>f[0]==='shoecab');
assert.ok(cabinet[2]+cabinet[5]/2<=10850,'Default shoe cabinet clears the recessed wall');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/<script(?![^>]*type="(?:module|importmap)")[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
for(const file of ['77b-interface.js','floorplan-data.js']) new vm.Script(fs.readFileSync(path.join(root,file),'utf8'));
for(const file of ['references/developer-plan.png','references/layout-reference.png','vendor/three/build/three.module.js','vendor/three/LICENSE']) assert.ok(fs.existsSync(path.join(root,file)),file);
assert.ok(!html.includes('cdn.jsdelivr.net'));
console.log(`77B validation passed: ${p.rooms.length} floor regions, ${p.walls.length} wall segments, ${p.doors.length} doors, ${p.windows.length} windows.`);
console.log(`Model floor area excluding bays/services: ${(p.rooms.filter(r=>r.counted!==false).reduce((a,r)=>a+area(r.poly),0)/1e6).toFixed(2)} m².`);
