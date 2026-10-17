/*
 * Fixed developer fit-out details, interpreted from the user's 77B VR photos.
 * These are fitted display dimensions, not newly surveyed dimensions.
 * No network assets, collision volumes or replacement apartment walls.
 *
 * Context: { THREE, PLAN, archUp, archFloor, top, H, wx, wz, M, box, mat,
 *            glassMat, frameMat, activeWalls? }. top/H are metres, PLAN mm.
 * Optional PLAN.fitout overrides are documented beside the defaults below.
 * The caller clears archUp/archFloor and disposes their geometries on rebuild;
 * materials and deterministic procedural textures are reused per THREE module.
 */

const materialCaches = new WeakMap();

function makeMaterials(THREE) {
  if (materialCaches.has(THREE)) return materialCaches.get(THREE);
  let seed = 77;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const texture = kind => {
    // A canvas is local generated artwork, not a copied VR panorama texture.
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const c = canvas.getContext('2d'); if (!c) return null;
    if (kind === 'stone') {
      c.fillStyle = '#eeeae3'; c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 1600; i++) {
        const v = 190 + Math.floor(random() * 45);
        c.fillStyle = `rgba(${v},${v - 3},${v - 8},.12)`;
        c.fillRect(random() * 512, random() * 512, 1 + random() * 7, 1 + random() * 5);
      }
      // Irregular broad grey-white veins echo the photographed stone counter.
      for (let i = 0; i < 7; i++) {
        const start = i * 90 - 100 + random() * 45;
        for (let branch = 0; branch < 3; branch++) {
          c.beginPath(); c.moveTo(start - branch * 12, -25);
          let x = start;
          for (let y = 0; y < 570; y += 30) {
            x += 10 + random() * 36;
            c.lineTo(x + Math.sin(y / 27 + i) * (12 + branch * 8), y);
          }
          c.strokeStyle = branch === 0 ? 'rgba(87,87,83,.28)' : 'rgba(129,125,116,.16)';
          c.lineWidth = branch === 0 ? 6 + random() * 9 : 1 + random() * 3;
          c.stroke();
        }
      }
    } else if (kind === 'veneer') {
      c.fillStyle = '#bbaa91'; c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2500; i++) {
        c.fillStyle = random() > .5 ? 'rgba(83,65,45,.035)' : 'rgba(255,246,225,.09)';
        const x = random() * 512, y = random() * 512;
        c.fillRect(x, y, 1 + random() * 4, 5 + random() * 70);
      }
      for (let i = 0; i < 44; i++) {
        const x = i * 12 + random() * 8;
        c.strokeStyle = 'rgba(104,85,61,.08)'; c.lineWidth = .7;
        c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 12, 180, x - 8, 340, x + 3, 512); c.stroke();
      }
    } else {
      // Warm grey large-format upper bathroom wall tile.
      c.fillStyle = '#d5d1c9'; c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2000; i++) {
        c.fillStyle = `rgba(255,255,250,${random() * .10})`;
        c.fillRect(random() * 512, random() * 512, 1 + random() * 3, 1 + random() * 3);
      }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const stone = texture('stone'), veneer = texture('veneer'), tile = texture('tile');
  const standard = (color, options = {}) => new THREE.MeshStandardMaterial({ color, ...options });
  const materials = {
    stone: standard('#ffffff', { map: stone, roughness: .26, metalness: .03 }),
    veneer: standard('#ffffff', { map: veneer, roughness: .49 }),
    warmTile: standard('#ffffff', { map: tile, roughness: .45 }),
    cabinet: standard('#ded9ce', { roughness: .40 }),
    chalk: standard('#faf8f2', { roughness: .82 }),
    dark: standard('#383631', { roughness: .58 }),
    shadow: standard('#655b4e', { roughness: .70 }),
    grout: standard('#aaa69e', { roughness: .82 }),
    frame: standard('#3e4140', { roughness: .40, metalness: .52 }),
    steel: standard('#b9c0c2', { roughness: .23, metalness: .86 }),
    black: standard('#1f2527', { roughness: .30, metalness: .12 }),
    mirror: standard('#c3cfce', { roughness: .07, metalness: .92 }),
    glow: standard('#fff7dd', { emissive: '#ffdfad', emissiveIntensity: .75, roughness: .5, side: THREE.FrontSide }),
    frosted: new THREE.MeshPhysicalMaterial({ color: '#d9d4c8', roughness: .72, metalness: 0,
      transparent: true, opacity: .67, depthWrite: false, side: THREE.DoubleSide }),
  };
  materialCaches.set(THREE, materials);
  return materials;
}

/** Reuse the same local textures on the editable base cabinets if desired. */
export function finishMaterial(kind, THREE) {
  return makeMaterials(THREE)[kind] || makeMaterials(THREE).chalk;
}

/**
 * Add fitted fixed details, then return their group for optional UI toggling.
 * Optional PLAN.fitout fields (all millimetres):
 * kitchen.bar {x1,x2,y1,y2,height}; kitchen.glass {x,y1,y2,height};
 * kitchen.stove/sink {cx,cy}; entryCabinet {cx,cy,width,depth,rot};
 * bathrooms [{id,bounds:[x1,y1,x2,y2],vanity:{cx,cy,width,depth,rot},
 *             shower:{cx,cy,width,depth}}]; guardWindowIndices:number[].
 * Individual windowHeights[i].guard=false disables its safety rail.
 */
export function buildDeveloperFinishes(ctx) {
  const { THREE, PLAN, archUp, top, H, wx, wz } = ctx;
  const m = makeMaterials(THREE);
  const group = new THREE.Group(); group.name = '77B developer fit-out';
  group.userData.developerFitout = true;
  archUp.add(group);
  const cut = Math.max(0, Math.min(Number.isFinite(top) ? top : H, H)) * 1000;
  const fit = PLAN.fitout || {};
  // Passing the surviving wall list keeps cladding/skirting in sync with the
  // editor's demolished-wall state; no decorative face resurrects a wall.
  const wallSegments = ctx.activeWalls || PLAN.walls || [];
  const flags = { casts: true };

  // All heights are clipped here before conversion, including tiny details.
  // A removed upper wall therefore never leaves an upper cabinet floating.
  function block(x1, y1, x2, y2, bottom, height, material, name, parent = group, local = false) {
    const end = Math.min(bottom + height, cut), start = Math.max(0, bottom);
    if (!(end > start + .1) || x2 <= x1 || y2 <= y1) return null;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry((x2 - x1) / 1000, (end - start) / 1000, (y2 - y1) / 1000), material);
    mesh.position.set(local ? (x1 + x2) / 2000 : wx((x1 + x2) / 2), (start + end) / 2000, local ? (y1 + y2) / 2000 : wz((y1 + y2) / 2));
    mesh.castShadow = flags.casts; mesh.receiveShadow = true;
    mesh.name = name || 'fit-out detail'; mesh.userData.developerFitout = true;
    parent.add(mesh); return mesh;
  }
  const rect = (x1, y1, x2, y2, bottom, height, material, name) => block(x1, y1, x2, y2, bottom, height, material, name);
  function rod(a, b, radius, material, name) {
    let p = [...a], q = [...b];
    if (p[1] === q[1] && p[1] + radius > cut) return null;
    if (p[1] >= cut && q[1] >= cut) return null;
    if (p[1] < 0 && q[1] < 0) return null;
    if (p[1] > cut || q[1] > cut) {
      const high = p[1] > cut ? p : q, low = p[1] > cut ? q : p;
      const t = (cut - low[1]) / (high[1] - low[1]);
      const clipped = low.map((v, i) => v + (high[i] - v) * t);
      if (p[1] > cut) p = clipped; else q = clipped;
    }
    const A = new THREE.Vector3(wx(p[0]), p[1] / 1000, wz(p[2])), B = new THREE.Vector3(wx(q[0]), q[1] / 1000, wz(q[2]));
    const length = A.distanceTo(B); if (length < .0001) return null;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius / 1000, radius / 1000, length, 8), material);
    mesh.position.copy(A).add(B).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
    mesh.castShadow = flags.casts; mesh.receiveShadow = true; mesh.name = name;
    mesh.userData.developerFitout = true; group.add(mesh); return mesh;
  }
  // One-sided underside shapes remain invisible from the overhead floorplan.
  function underside(x1, y1, x2, y2, level, material, name) {
    if (level > cut || level <= 0 || x2 <= x1 || y2 <= y1) return null;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry((x2 - x1) / 1000, (y2 - y1) / 1000), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(wx((x1 + x2) / 2), level / 1000, wz((y1 + y2) / 2));
    mesh.name = name; mesh.receiveShadow = true; mesh.userData.developerFitout = true;
    group.add(mesh); return mesh;
  }

  // Kitchen: northern cooking wall, western sink, open southern stone bar.
  // The eastern foyer passage is deliberately free of extra fixed furniture.
  const kitchen = fit.kitchen || {};
  const bar = { x1: 7750, x2: 9650, y1: 2000, y2: 2650, height: 850, ...(kitchen.bar || {}) };
  rect(bar.x1 - 12, bar.y1 - 8, bar.x2 + 12, bar.y2 + 12, bar.height - 40, 40, m.stone, 'Kitchen thick stone bar top');
  rect(bar.x1 - 12, bar.y1, bar.x1 + 28, bar.y2 + 12, 0, bar.height - 40, m.stone, 'Kitchen bar west waterfall side');
  rect(bar.x2 - 28, bar.y1, bar.x2 + 12, bar.y2 + 12, 0, bar.height - 40, m.stone, 'Kitchen bar east waterfall side');
  const glass = { x: 7790, y1: 2030, y2: 2630, height: 2400, ...(kitchen.glass || {}) };
  flags.casts = false;
  rect(glass.x - 9, glass.y1, glass.x + 9, glass.y2, bar.height, glass.height - bar.height, m.frosted, 'Kitchen west fixed textured glass');
  flags.casts = true;
  [glass.y1, glass.y2 - 25].forEach(y => rect(glass.x - 18, y, glass.x + 18, y + 25, bar.height, glass.height - bar.height, m.frame, 'Kitchen fixed glass slim upright'));
  [bar.height, glass.height - 25].forEach(h => rect(glass.x - 18, glass.y1, glass.x + 18, glass.y2, h, 25, m.frame, 'Kitchen fixed glass horizontal frame'));
  // Fine vertical ribs suggest the photographed textured/reeded glass.
  for (let y = glass.y1 + 30; y < glass.y2 - 20; y += 16) {
    const rib = rect(glass.x + 9, y, glass.x + 11, y + 2, bar.height + 25, glass.height - bar.height - 50, m.frosted, 'Kitchen textured glass rib');
    if (rib) rib.castShadow = false;
  }
  const stove = { cx: 8700, cy: 450, ...(kitchen.stove || {}) };
  rect(8050, 155, 9650, 169, 850, 750, m.stone, 'Kitchen north stone splashback');
  const upperLeft = Math.max(8050, stove.cx - 450), upperRight = Math.min(9600, stove.cx + 450);
  rect(8050, 160, upperLeft, 470, 1700, 900, m.cabinet, 'Kitchen north left upper cabinet');
  rect(upperRight, 160, 9650, 470, 1700, 900, m.cabinet, 'Kitchen north right upper cabinet');
  // The editable stove already provides its hood and duct up to 2330 mm.
  rect(upperLeft, 160, upperRight, 470, 2340, 260, m.cabinet, 'Kitchen above hood upper cabinet');
  for (let x = 8250; x < 9600; x += 425) {
    const base = x > upperLeft && x < upperRight ? 2345 : 1705;
    rect(x, 471, x + 2, 474, base, 2595 - base, m.shadow, 'Kitchen upper cabinet door joint');
  }
  // Heater sits on the solid wall above the start of the western window.
  // The west window itself (roughly y1100..2250) stays unobstructed.
  rect(7768, 760, 7935, 1080, 1700, 680, m.chalk, 'Kitchen west mounted water heater');
  rect(7936, 805, 7941, 1035, 1760, 80, m.black, 'Kitchen water heater display');
  [835, 1005].forEach(y => {
    rod([7860, 1700, y], [7860, 1500, y], 10, m.steel, 'Kitchen heater pipe');
    rod([7860, 1500, y], [7790, 1500, y], 10, m.steel, 'Kitchen heater wall pipe return');
  });

  // Foyer: only the upper fixed part and recessed niche, above editable base.
  const entry = { cx: 10975, cy: 1000, width: 1600, depth: 350, rot: 90, ...(fit.entryCabinet || {}) };
  // Fill the stepped east-wall recess behind the fitted straight cabinet front.
  // The north end starts beyond the original inward door's 1000 mm sweep.
  if(entry.backFill){ const [x1,y1,x2,y2]=entry.backFill; rect(x1,y1,x2,y2,0,2700,m.veneer,'Foyer fitted rear return'); }
  const eg = new THREE.Group(); eg.name = 'Foyer upper niche cabinet';
  eg.position.set(wx(entry.cx), 0, wz(entry.cy)); eg.rotation.y = -entry.rot * Math.PI / 180; group.add(eg);
  const local = (x1, z1, x2, z2, bottom, height, material, name) => block(x1, z1, x2, z2, bottom, height, material, name, eg, true);
  const ew = entry.width / 2, ed = entry.depth / 2;
  local(-ew, -ed, ew, ed, 1720, 980, m.veneer, 'Foyer tall upper woodgrain cabinet');
  local(-ew, -ed, -ew + 28, ed, 1025, 695, m.veneer, 'Foyer niche left side');
  local(ew - 28, -ed, ew, ed, 1025, 695, m.veneer, 'Foyer niche right side');
  local(-ew + 28, -ed, ew - 28, -ed + 20, 1025, 500, m.stone, 'Foyer stone recessed niche back');
  local(-ew + 28, -ed, ew - 28, ed + 8, 1025, 25, m.stone, 'Foyer stone niche shelf');
  local(-ew + 28, -ed + 10, ew - 28, -ed + 28, 1525, 195, m.dark, 'Foyer recessed control panel band');
  local(-ew + 50, ed - 45, ew - 50, ed - 35, 1710, 10, m.glow, 'Foyer niche warm task strip');
  for (let x = -ew + 400; x < ew; x += 400) local(x, ed, x + 2, ed + 2, 1725, 965, m.shadow, 'Foyer upper panel joint');
  [-290, -70, 120].forEach((x, i) => {
    local(x - 55, -ed + 29, x + 55, -ed + 34, 1555, 94, m.black, i === 2 ? 'Foyer intercom screen' : 'Foyer switch panel');
    if (i === 2) local(x - 43, -ed + 35, x + 43, -ed + 36, 1570, 63, m.mirror, 'Foyer intercom glass');
  });

  const bathrooms = fit.bathrooms || [
    { id: 'mbath', bounds: [2600, 2650, 5050, 4200], vanity: { cx: 3100, cy: 2900, width: 800, depth: 500, rot: 0 }, shower: { cx: 4600, cy: 3425, width: 900, depth: 1550 } },
    { id: 'gbath', bounds: [5250, 2650, 7700, 4200], vanity: { cx: 7150, cy: 2900, width: 800, depth: 500, rot: 0 }, shower: { cx: 5700, cy: 3425, width: 900, depth: 1550 } },
  ];

  // Generate interior wall faces from actual wall segments, not solid boxes
  // across bathroom windows or doors. This also preserves the original plan.
  const near = (a, b) => Math.abs(a - b) < 2;
  function roomFaceSegments(bounds) {
    const [x1, y1, x2, y2] = bounds, segments = [];
    const add = (w, start, end) => {
      if (end <= start) return;
      const [a, b, c, d] = w;
      if (near(d, y1)) { const l = Math.max(a, x1), r = Math.min(c, x2); if (r > l) segments.push([l, y1 + 1, r, y1 + 13, start, end]); }
      if (near(b, y2)) { const l = Math.max(a, x1), r = Math.min(c, x2); if (r > l) segments.push([l, y2 - 13, r, y2 - 1, start, end]); }
      if (near(c, x1)) { const l = Math.max(b, y1), r = Math.min(d, y2); if (r > l) segments.push([x1 + 1, l, x1 + 13, r, start, end]); }
      if (near(a, x2)) { const l = Math.max(b, y1), r = Math.min(d, y2); if (r > l) segments.push([x2 - 13, l, x2 - 1, r, start, end]); }
    };
    wallSegments.forEach(w => add(w, 0, H * 1000));
    (PLAN.windows || []).forEach((w, i) => {
      const levels = PLAN.windowHeights[i];
      add(w, 0, levels.sill); add(w, levels.head, H * 1000);
    });
    (PLAN.doors || []).forEach(d => add(d.rect, 2100, H * 1000));
    return segments;
  }
  bathrooms.forEach(bath => {
    const bounds = bath.bounds || bath.rect;
    if (!bounds) return;
    roomFaceSegments(bounds).forEach(([x1, y1, x2, y2, low, high]) => {
      const split = 1220;
      rect(x1, y1, x2, y2, low, Math.max(0, Math.min(high, split) - low), m.stone, `${bath.id} lower stone wall`);
      const upper = Math.max(low, split);
      rect(x1, y1, x2, y2, upper, high - upper, m.warmTile, `${bath.id} upper warm grey wall`);
      if (low < split && high > split) rect(x1, y1, x2, y2, split - 3, 6, m.grout, `${bath.id} tile division`);
      for (let h = 1820; h < high; h += 600) if (h >= low) rect(x1, y1, x2, y2, h, 2, m.grout, `${bath.id} upper tile horizontal joint`);
    });
    const v = bath.vanity || {}, vw = v.width || 800, vx = v.cx, back = bounds[1] + 18;
    if (Number.isFinite(vx)) {
      // Existing editable vanity supplies the mirror face; this shallow fixed
      // backboard and its glowing edges read as the photographed mirror cabinet.
      rect(vx - vw / 2, back - 5, vx + vw / 2, back + 8, 1135, 835, m.shadow, `${bath.id} mirror cabinet backboard`);
      rect(vx - vw / 2 + 12, back + 10, vx + vw / 2 - 12, back + 20, 1135, 6, m.glow, `${bath.id} mirror lower light`);
      rect(vx - vw / 2 + 12, back + 10, vx + vw / 2 - 12, back + 20, 1964, 6, m.glow, `${bath.id} mirror upper light`);
      [-1, 1].forEach(sign => rect(vx + sign * (vw / 2 - 9) - 3, back + 10, vx + sign * (vw / 2 - 9) + 3, back + 20, 1140, 824, m.glow, `${bath.id} mirror vertical light`));
      rect(vx - vw / 2 + 24, bounds[1] + 30, vx + vw / 2 - 24, bounds[1] + 95, 1010, 20, m.stone, `${bath.id} mirror shallow shelf`);
    }
    const s = bath.shower;
    if (s) {
      // Retain the editable shower model's main glass and fittings. Add only
      // the threshold detail and a simple wall rail in its actual wet zone.
      const west = s.cx < (bounds[0] + bounds[2]) / 2;
      const pipeX = west ? bounds[0] + 50 : bounds[2] - 50, pipeY = s.cy + 50;
      rod([pipeX, 950, pipeY], [pipeX, 1950, pipeY], 8, m.steel, `${bath.id} wall shower rail`);
      rod([pipeX, 1120, pipeY - 60], [pipeX, 1120, pipeY + 60], 14, m.steel, `${bath.id} shower mixer`);
      rect(s.cx - s.width / 2 + 50, bounds[3] - 80, s.cx + s.width / 2 - 50, bounds[3] - 40, 51, 4, m.steel, `${bath.id} slim shower drain`);
    }
  });

  // Bedroom black safety rails sit just inside the real window openings.
  // Indices are optional because root may refine the master corner windows.
  const explicitlyGuarded = Array.isArray(fit.guardWindowIndices) ? new Set(fit.guardWindowIndices) : null;
  (PLAN.windows || []).forEach((r, index) => {
    const levels = PLAN.windowHeights[index] || { sill: 900, head: 2400 };
    const [x1, y1, x2, y2] = r, horizontal = x2 - x1 >= y2 - y1;
    const bedroom = horizontal ? y1 >= 8350 && x2 <= 7900 : x1 < 200 && y1 >= 3900;
    if (levels.guard === false || (explicitlyGuarded ? !explicitlyGuarded.has(index) : !bedroom)) return;
    const length = horizontal ? x2 - x1 : y2 - y1;
    if (length < 250) return;
    // North/east/south/west exterior windows offset toward the room centre.
    const roomCenter = PLAN.center || [5550, 4950];
    const inward = horizontal ? ((y1 + y2) / 2 < roomCenter[1] ? 1 : -1) : ((x1 + x2) / 2 < roomCenter[0] ? 1 : -1);
    const line = horizontal ? (inward < 0 ? y1 - 45 : y2 + 45) : (inward < 0 ? x1 - 45 : x2 + 45);
    const sill = levels.sill, railTop = Math.min(levels.head - 250, Math.max(1150, sill + 780));
    if (horizontal) {
      rect(x1 - 15, line - 42, x2 + 15, line + 42, sill - 18, 30, m.stone, 'Bedroom stone window sill');
      [sill + 45, railTop].forEach(h => rect(x1 + 12, line - 8, x2 - 12, line + 8, h, 18, m.frame, 'Bedroom black safety rail horizontal'));
      const n = Math.max(2, Math.ceil(length / 145));
      for (let k = 0; k <= n; k++) {
        const x = x1 + 15 + (length - 30) * k / n;
        rect(x - 5, line - 5, x + 5, line + 5, sill + 45, railTop - sill - 45, m.frame, 'Bedroom black safety rail vertical');
      }
    } else {
      rect(line - 42, y1 - 15, line + 42, y2 + 15, sill - 18, 30, m.stone, 'Bedroom stone window sill');
      [sill + 45, railTop].forEach(h => rect(line - 8, y1 + 12, line + 8, y2 - 12, h, 18, m.frame, 'Bedroom black safety rail horizontal'));
      const n = Math.max(2, Math.ceil(length / 145));
      for (let k = 0; k <= n; k++) {
        const y = y1 + 15 + (length - 30) * k / n;
        rect(line - 5, y - 5, line + 5, y + 5, sill + 45, railTop - sill - 45, m.frame, 'Bedroom black safety rail vertical');
      }
    }
  });

  // Dark slim skirting follows actual wall edges, so doorway gaps stay open.
  // Bathroom wet walls use their stone lower tile, not wood skirting.
  const bathRooms = bathrooms.map(b => b.bounds || b.rect).filter(Boolean);
  const isBathFace = (x, y) => bathRooms.some(([a, b, c, d]) => x >= a - 15 && x <= c + 15 && y >= b - 15 && y <= d + 15);
  wallSegments.forEach(w => {
    const [a, b, c, d] = w;
    if (w[4] === 'low') return;
    const horizontal = c - a >= d - b;
    const candidates = horizontal ? [[a, b - 5, c, b + 1], [a, d - 1, c, d + 5]] : [[a - 5, b, a + 1, d], [c - 1, b, c + 5, d]];
    candidates.forEach(([x1, y1, x2, y2]) => {
      if (isBathFace((x1 + x2) / 2, (y1 + y2) / 2)) return;
      rect(x1, y1, x2, y2, 0, 65, m.dark, 'Dark slim developer skirting');
    });
  });

  // Public ceiling details use underside-only surfaces. Their return vents,
  // light strips and downlights never paint a roof over the bird's-eye model.
  const ceiling = H * 1000;
  if (cut >= ceiling - 2) {
    const strips = [
      [7960, 2820, 8055, 8260], [11035, 4480, 11125, 8260],
      [8055, 8165, 11035, 8260], [9750, 180, 9820, 2790],
    ];
    strips.forEach(([x1, y1, x2, y2]) => underside(x1, y1, x2, y2, ceiling - 110, m.chalk, 'Public ceiling perimeter underside'));
    [[8005, 2850, 8013, 8190], [11074, 4510, 11082, 8190], [8040, 8190, 11075, 8198]].forEach(r => underside(...r, ceiling - 118, m.glow, 'Public recessed warm cove light'));
    // A narrow return grille across the northern dining ceiling face.
    underside(8130, 2860, 9580, 3030, ceiling - 145, m.chalk, 'Dining return air underside surround');
    for (let y = 2885; y <= 3000; y += 23) underside(8180, y, 9530, y + 7, ceiling - 147, m.dark, 'Dining return air slim slot');
    // Kitchen/foyer ceiling has a clean luminous rectangular line.
    [[7870, 270, 9530, 278], [7870, 2420, 9530, 2428], [7870, 270, 7878, 2428], [9522, 270, 9530, 2428]].forEach(r => underside(...r, ceiling - 90, m.glow, 'Kitchen ceiling rectangular light line'));
    [[10000, 650], [10200, 2000], [8400, 3250], [10400, 3650], [8400, 7900], [10700, 7900]].forEach(([x, y]) => {
      const mesh = new THREE.Mesh(new THREE.CircleGeometry(.045, 16), m.glow);
      mesh.rotation.x = Math.PI / 2; mesh.position.set(wx(x), H - .105, wz(y));
      mesh.name = 'Public ceiling recessed downlight'; mesh.userData.developerFitout = true; group.add(mesh);
    });
  }
  return group;
}
