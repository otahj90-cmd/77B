/* 77B source references and dimension provenance. No network requests. */
(() => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet'; stylesheet.href = './77b.css'; document.head.append(stylesheet);
  const dialog = document.createElement('dialog');
  dialog.id = 'sourceDialog';
  dialog.setAttribute('aria-labelledby', 'sourceTitle');
  dialog.innerHTML = `
    <div class="source-head"><div><small>77B / DRAWING REFERENCES</small><h2 id="sourceTitle">图纸与尺寸依据</h2></div><button class="btn source-close" aria-label="关闭">✕ 关闭</button></div>
    <p class="source-intro">尺寸以开发商图为准；右侧内凹、外凸按本次补充图修正。第三张错误尺寸图未用于建模。</p>
    <div class="source-tabs" role="tablist" aria-label="参考资料">
      <button class="btn on" role="tab" id="tab-developer" aria-controls="source-developer" aria-selected="true" data-source="developer">开发商尺寸图</button>
      <button class="btn" role="tab" id="tab-layout" aria-controls="source-layout" aria-selected="false" data-source="layout">墙体参考图</button>
      <button class="btn" role="tab" id="tab-dimensions" aria-controls="source-dimensions" aria-selected="false" data-source="dimensions">尺寸清单与假定</button>
    </div>
    <div class="source-body">
      <div id="source-developer" role="tabpanel" aria-labelledby="tab-developer"><a href="./references/developer-plan.png" target="_blank" rel="noopener"><img src="./references/developer-plan.png" alt="开发商原始尺寸图，红框为77B户型；点击可打开原图放大"></a><p>点击图片可打开原图放大。模型保留图 1 的客厅、阳台分界与卧室飘窗。</p></div>
      <div id="source-layout" role="tabpanel" aria-labelledby="tab-layout" hidden><img class="layout-reference" src="./references/layout-reference.png" alt="用户补充的77B墙体参考图，右侧有玄关内凹和餐厅外凸"><p>本次按该图修正右侧墙体转折，约300mm偏移与转折坐标为按图拟合。阳台暂保留开发商图分界。</p></div>
      <div id="source-dimensions" role="tabpanel" aria-labelledby="tab-dimensions" hidden></div>
    </div>
    <div class="source-foot"><span>单位 mm · 平面朝向按原图展示</span><button class="btn" id="exportGeometry">下载完整户型数据 JSON</button></div>`;
  document.body.append(dialog);
  const statuses = {confirmed:'图纸标注',derived:'按图推定',assumed:'模型假定'};
  document.querySelector('#source-dimensions').innerHTML = `
    <div class="dimension-table-wrap"><table class="dimension-table"><thead><tr><th>项目</th><th>数据 / 说明</th><th>依据</th></tr></thead><tbody>${PLAN.evidence.map(e => `<tr><td>${esc(e.label)}</td><td>${esc(e.value)}</td><td><span class="evidence-${e.status}">${statuses[e.status]}</span></td></tr>`).join('')}</tbody></table></div>
    <div class="source-note"><b>读图复原的精度边界</b><p>${esc(PLAN.note)}</p></div>`;
  const open = () => { if (!dialog.open) dialog.showModal(); };
  document.querySelector('#sourceInfo').onclick = open;
  dialog.querySelector('.source-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog){ const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.querySelectorAll('[data-source]').forEach(b => b.onclick = () => {
    dialog.querySelectorAll('[data-source]').forEach(t => { t.classList.toggle('on',t===b); t.setAttribute('aria-selected',String(t===b)); });
    dialog.querySelectorAll('[role="tabpanel"]').forEach(p => p.hidden = p.id !== 'source-'+b.dataset.source);
  });
  dialog.querySelector('#exportGeometry').onclick = () => download('77B-户型数据与尺寸依据.json',new Blob([JSON.stringify(PLAN,null,2)],{type:'application/json'}));
  window.sourceSummary77B = () => `<section class="source-card"><div class="source-kicker">77B · 右墙修订 v2</div><h3>三室 · 两厅 · 两卫</h3><p>右侧玄关内凹、餐厅外凸已按补充图修正。偏移为拟合值，面积由模型计算。</p><button class="btn" id="panelSourceInfo">查看原图与尺寸清单 ↗</button></section>`;
  const originalBind = bindOverview;
  bindOverview = function(){ originalBind(); const b = document.querySelector('#panelSourceInfo'); if (b) b.onclick = open; };
  // Give room properties the same provenance context as the overview.
  const originalRoomPanel = roomPanel;
  roomPanel = function(r){ return originalRoomPanel(r) + `<section class="room-source-note"><h3>尺寸依据</h3><p>${esc(r.note || '平面坐标根据图1轴线与房间标注拟合；门窗洞口和局部墙厚为模型推定。')}</p></section>`; };
  renderAll();
})();
