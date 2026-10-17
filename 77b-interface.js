/* 77B drawing / developer fitout references and dimension provenance. */
(() => {
  const legacyStore = 'floorplan-77b-wall-revision-v2';
  const vrUrl = 'https://infishow.ideamake.cn/icp/guangzhou-nanzhanwan_19664/yangbanjianhuizong_6.html?showmenu=reset&showparam=scene_keting_86bbkic&showpage=vr_tour&timestamp=1754884477395&read_source=2';
  const fitoutPhotos = [
    ['fitout-entry.png','玄关与厨房','玄关整墙木饰面收纳、石材壁龛；厨房入口为独立磨砂玻璃移门。'],
    ['fitout-kitchen.png','厨房台面与隔断','西侧窗下水槽、南侧石材吧台与局部磨砂玻璃；吧台高度和柜体分格按照片拟合。'],
    ['fitout-bathroom.png','公卫','西侧玻璃淋浴、中间马桶、东侧浴室柜；浅灰地砖与下半墙石材。'],
    ['fitout-masterbath.png','主卫','与公卫镜像布置，木纹悬空浴室柜、镜柜与灰白小方拼地面。'],
    ['fitout-bedroom.png','主卧窗与地面','转角窗、独立窗、黑色护栏、石材窗台和浅色直铺木地板；窗分段按照片拟合。'],
  ];
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = './77b.css?v=3'; document.head.append(stylesheet);
  const dialog = document.createElement('dialog');
  dialog.id = 'sourceDialog';
  dialog.setAttribute('aria-labelledby', 'sourceTitle');
  dialog.innerHTML = `
    <div class="source-head"><div><small>77B / DRAWING REFERENCES</small><h2 id="sourceTitle">图纸与尺寸依据</h2></div><button class="btn source-close" aria-label="关闭">✕ 关闭</button></div>
    <p class="source-intro">精装复原 v3：保留开发商标注净尺寸，按精装照片补充厨房、玄关、卫浴、窗栏和饰面。未标注的装饰高度、柜体分格及窗分段为拟合值。第三张错误尺寸图未用于建模。</p>
    <div class="source-tabs" role="tablist" aria-label="参考资料">
      <button class="btn on" role="tab" id="tab-developer" aria-controls="source-developer" aria-selected="true" data-source="developer">开发商尺寸图</button>
      <button class="btn" role="tab" id="tab-layout" aria-controls="source-layout" aria-selected="false" data-source="layout">墙体参考图</button>
      <button class="btn" role="tab" id="tab-fitout" aria-controls="source-fitout" aria-selected="false" data-source="fitout">精装照片</button>
      <button class="btn" role="tab" id="tab-dimensions" aria-controls="source-dimensions" aria-selected="false" data-source="dimensions">尺寸清单与假定</button>
    </div>
    <div class="source-body">
      <div id="source-developer" role="tabpanel" aria-labelledby="tab-developer"><a href="./references/developer-plan.png" target="_blank" rel="noopener"><img src="./references/developer-plan.png" alt="开发商原始尺寸图，红框为77B户型；点击可打开原图放大"></a><p>点击图片可打开原图放大。模型保留图 1 的客厅、阳台分界与卧室飘窗。</p></div>
      <div id="source-layout" role="tabpanel" aria-labelledby="tab-layout" hidden><img class="layout-reference" src="./references/layout-reference.png" alt="用户补充的77B墙体参考图，右侧有玄关内凹和餐厅外凸"><p>本次按该图修正右侧墙体转折，约300mm偏移与转折坐标为按图拟合。阳台暂保留开发商图分界。</p></div>
      <div id="source-fitout" role="tabpanel" aria-labelledby="tab-fitout" hidden>
        <div class="source-note fitout-evidence"><b>开发商精装照片依据</b><p>以下为用户提供的 77B 精装 VR 截图。照片用于确认构件关系与饰面，不提供尺寸标定；房间净尺寸仍取开发商图。厨房南侧吧台上的局部玻璃隔断与玄关侧磨砂移门是两套互相垂直的构件。</p><a class="btn source-vr-link" href="${esc(vrUrl)}" target="_blank" rel="noopener noreferrer">打开开发商 VR · 选择 77B ↗</a></div>
        <div class="fitout-gallery">${fitoutPhotos.map(([file,title,caption]) => `<figure><a href="./references/${file}" target="_blank" rel="noopener"><img loading="lazy" decoding="async" src="./references/${file}" alt="77B 精装参考：${esc(title)}"></a><figcaption><b>${esc(title)}</b><span>${esc(caption)}</span></figcaption></figure>`).join('')}</div>
      </div>
      <div id="source-dimensions" role="tabpanel" aria-labelledby="tab-dimensions" hidden></div>
    </div>
    <div class="source-foot"><span>单位 mm · 平面朝向按原图展示</span><div class="source-actions"><button class="btn" id="exportLegacyPlan" hidden>导出旧版方案备份</button><button class="btn" id="exportGeometry">下载完整户型数据 JSON</button></div></div>`;
  document.body.append(dialog);
  const statuses = {confirmed:'图纸标注',derived:'按图推定',assumed:'模型假定'};
  document.querySelector('#source-dimensions').innerHTML = `
    <div class="dimension-table-wrap"><table class="dimension-table"><thead><tr><th>项目</th><th>数据 / 说明</th><th>依据</th></tr></thead><tbody>${PLAN.evidence.map(e => `<tr><td>${esc(e.label)}</td><td>${esc(e.value)}</td><td><span class="evidence-${e.status}">${statuses[e.status]}</span></td></tr>`).join('')}</tbody></table></div>
    <div class="source-note"><b>读图复原的精度边界</b><p>${esc(PLAN.note)}</p></div>`;
  const legacyButton = dialog.querySelector('#exportLegacyPlan');
  const readLegacy = () => { try { return localStorage.getItem(legacyStore); } catch { return null; } };
  const updateLegacyButton = () => { legacyButton.hidden = readLegacy() === null; };
  legacyButton.onclick = () => {
    const raw = readLegacy();
    if (raw === null) { updateLegacyButton(); return; }
    download('77B-v2-旧版方案备份.json',new Blob([raw],{type:'application/json'}));
  };
  updateLegacyButton();
  const open = () => { updateLegacyButton(); if (!dialog.open) dialog.showModal(); };
  document.querySelector('#sourceInfo').onclick = open;
  dialog.querySelector('.source-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog){ const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.querySelectorAll('[data-source]').forEach(b => b.onclick = () => {
    dialog.querySelectorAll('[data-source]').forEach(t => { t.classList.toggle('on',t===b); t.setAttribute('aria-selected',String(t===b)); });
    dialog.querySelectorAll('[role="tabpanel"]').forEach(p => p.hidden = p.id !== 'source-'+b.dataset.source);
  });
  dialog.querySelector('#exportGeometry').onclick = () => download('77B-户型数据与尺寸依据.json',new Blob([JSON.stringify(PLAN,null,2)],{type:'application/json'}));
  window.sourceSummary77B = () => `<section class="source-card"><div class="source-kicker">77B · 精装复原 v3</div><h3>三室 · 两厅 · 两卫</h3><p>按精装照片补充厨房吧台、独立磨砂移门、玄关壁龛、窗栏和地面饰面。保留开发商净尺寸，未标注细节按照片拟合。</p><button class="btn" id="panelSourceInfo">查看原图、精装照片与尺寸清单 ↗</button></section>`;
  const originalBind = bindOverview;
  bindOverview = function(){ originalBind(); const b = document.querySelector('#panelSourceInfo'); if (b) b.onclick = open; };
  // Give room properties the same provenance context as the overview.
  const originalRoomPanel = roomPanel;
  roomPanel = function(r){ return originalRoomPanel(r) + `<section class="room-source-note"><h3>尺寸依据</h3><p>${esc(r.note || '平面坐标根据图1轴线与房间标注拟合；门窗洞口和局部墙厚为模型推定。')}</p></section>`; };
  renderAll();
})();
