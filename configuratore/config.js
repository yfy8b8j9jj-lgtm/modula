/* ===== CONFIGURATORE — logica (4 step + anteprima + invio) ===== */
const $ = (s,r=document)=>r.querySelector(s);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const byId = (arr,id)=>arr.find(x=>x.id===id);
const ALL_MODS = [...MODULI_BASE, ...MODULI_EXTRA];
const modById = id => byId(ALL_MODS, id);

const STEPS = ['Azienda','Settore','Moduli','Anteprima'];
const S = { step:1, azienda:'', settore:null, extra:new Set(), previewView:'hub', device:'phone' };

/* ---------------- render router ---------------- */
function render(){
  $('#steps').innerHTML = STEPS.map((t,i)=>{
    const n=i+1; const cls = n===S.step?'on':(n<S.step?'done':'');
    return `<div class="s ${cls}">${n}. ${t}</div>`;
  }).join('');
  const v = $('#view');
  if(S.step===1) v.innerHTML = step1();
  else if(S.step===2) v.innerHTML = step2();
  else if(S.step===3) v.innerHTML = step3();
  else v.innerHTML = step4();
  window.scrollTo({top:0,behavior:'smooth'});
  if(S.step===1){ const inp=$('#az'); if(inp){ inp.focus(); inp.addEventListener('keydown',e=>{if(e.key==='Enter')next();}); } }
}

/* ---------------- STEP 1 — nome azienda ---------------- */
function step1(){
  return `
  <div class="h1"><span class="accent"></span>Crea la tua app</div>
  <div class="lead">In pochi passi componi il gestionale della tua attività. Iniziamo dal nome: comparirà nella tua app.</div>
  <div class="card">
    <div class="bigfield">
      <label>Nome dell'azienda</label>
      <input id="az" value="${esc(S.azienda)}" placeholder="es. La Mia Azienda S.r.l." oninput="S.azienda=this.value" maxlength="48">
    </div>
  </div>
  <div class="navbar">
    <div class="sp"></div>
    <button class="btn pri" onclick="next()">Continua →</button>
  </div>`;
}

/* ---------------- STEP 2 — settore ---------------- */
function step2(){
  return `
  <div class="h1"><span class="accent"></span>Che attività fai?</div>
  <div class="lead">Scegli il settore più vicino al tuo: ti proporremo i moduli più utili. Potrai comunque aggiungere tutti gli altri.</div>
  <div class="grid">
    ${SETTORI.map(s=>`
      <div class="tile ${S.settore===s.id?'on':''}" onclick="pickSettore('${s.id}')">
        <span class="ic">${s.ic}</span>
        <div class="nm">${esc(s.nome)}</div>
        <div class="ds">${esc(s.desc)}</div>
      </div>`).join('')}
  </div>
  <div class="navbar">
    <button class="btn ghost" onclick="back()">← Indietro</button>
    <div class="sp"></div>
    <button class="btn pri" id="nx2" onclick="next()" ${S.settore?'':'disabled'}>Continua →</button>
  </div>`;
}
function pickSettore(id){
  S.settore=id;
  // pre-seleziona i moduli proposti del settore
  const st=byId(SETTORI,id);
  if(st) st.proposti.forEach(m=>S.extra.add(m));
  render();
}

/* ---------------- STEP 3 — moduli ---------------- */
function step3(){
  const st = byId(SETTORI, S.settore) || {proposti:[]};
  const proposti = MODULI_EXTRA.filter(m=>st.proposti.includes(m.id));
  const altri    = MODULI_EXTRA.filter(m=>!st.proposti.includes(m.id));
  const tile = (m,extra=true)=>`
    <div class="tile ${extra?(S.extra.has(m.id)?'on':''):'locked'} ${extra&&m.stato==='arrivo'?'dim':''}" ${extra?`onclick="toggleExtra('${m.id}')"`:''}>
      <span class="ic">${m.ic}</span>
      <div class="nm">${esc(m.nome)}</div>
      <div class="ds">${esc(m.desc)}</div>
      ${extra&&st.proposti.includes(m.id)?'<span class="tag">consigliato</span>':''}${extra&&m.stato==='arrivo'?'<span class="soon">in arrivo</span>':''}
    </div>`;
  return `
  <div class="h1"><span class="accent"></span>Componi la tua app</div>
  <div class="lead">I moduli <b>base</b> ci sono sempre. Aggiungi quelli che ti servono: i <b style="color:var(--amber)">consigliati</b> sono pensati per il tuo settore.</div>

  <div class="section-label first">Inclusi sempre — la base</div>
  <div class="grid">${MODULI_BASE.map(m=>tile(m,false)).join('')}</div>

  ${proposti.length?`<div class="section-label">Consigliati per il tuo settore</div>
  <div class="grid">${proposti.map(m=>tile(m)).join('')}</div>`:''}

  <div class="section-label">Tutti gli altri moduli</div>
  <div class="grid">${altri.map(m=>tile(m)).join('')}</div>

  <div class="navbar">
    <button class="btn ghost" onclick="back()">← Indietro</button>
    <div class="sp"></div>
    <span class="count">${MODULI_BASE.length + S.extra.size} moduli</span>
    <button class="btn pri" onclick="next()">Vedi l'anteprima →</button>
  </div>`;
}
function toggleExtra(id){ S.extra.has(id)?S.extra.delete(id):S.extra.add(id); render(); }

/* ---------------- STEP 4 — anteprima + invio ---------------- */
function chosenMods(){ return [...MODULI_BASE, ...MODULI_EXTRA.filter(m=>S.extra.has(m.id))]; }

function step4(){
  const nome = S.azienda.trim() || 'La tua app';
  const settore = byId(SETTORI,S.settore);
  const extraChosen = MODULI_EXTRA.filter(m=>S.extra.has(m.id));
  // assicura una schermata valida selezionata
  const validi = new Set([...chosenMods().map(m=>m.id),'altro']);
  if(!validi.has(S.previewView)) S.previewView='hub';

  return `
  <div class="h1"><span class="accent"></span>Ecco la tua app</div>
  <div class="lead"><b>Tocca i moduli</b> nell'anteprima per vederne le schermate. Ecco come si presenterebbe <b>${esc(nome)}</b>.</div>

  <div id="preview-area">${previewArea()}</div>

  <div class="summary" style="margin-top:18px">
    <h3>Riepilogo</h3>
    <div class="rowl"><span class="k">AZIENDA</span><span>${esc(nome)}</span></div>
    <div class="rowl"><span class="k">SETTORE</span><span>${settore?esc(settore.ic+' '+settore.nome):'—'}</span></div>
    <div class="rowl"><span class="k">BASE</span><div class="chips">${MODULI_BASE.map(m=>`<span class="chip b">${m.ic} ${esc(m.nome)}</span>`).join('')}</div></div>
    <div class="rowl"><span class="k">EXTRA</span><div class="chips">${extraChosen.length?extraChosen.map(m=>`<span class="chip">${m.ic} ${esc(m.nome)}${m.stato==='arrivo'?' · in arrivo':''}</span>`).join(''):'<span class="cs" style="color:var(--t3)">nessuno</span>'}</div></div>

    <div class="send-box">
      <h3>📨 Invia la tua configurazione</h3>
      <p>Te la prepariamo e ti ricontattiamo. Nessun dato viene salvato online.</p>
      <div class="send-actions">
        <button class="btn pri" onclick="sendEmail()">✉️ Invia via Email</button>
        ${CONTATTO.whatsapp?`<button class="btn" onclick="sendWhatsApp()">💬 WhatsApp</button>`:''}
        <button class="btn ghost" onclick="copyConfig()">⧉ Copia configurazione</button>
      </div>
      <div class="code" id="code">${esc(buildText())}</div>
    </div>
  </div>

  <div class="navbar">
    <button class="btn ghost" onclick="back()">← Modifica i moduli</button>
    <div class="sp"></div>
  </div>`;
}

/* ---- anteprima navigabile (telefono / pc) ---- */
const _short = n => esc(n.split(/[\s\/]/)[0]);
function previewArea(){
  return `
  <div class="device-toggle">
    <button class="${S.device==='phone'?'on':''}" onclick="setDevice('phone')">📱 Telefono</button>
    <button class="${S.device==='pc'?'on':''}" onclick="setDevice('pc')">💻 Computer</button>
  </div>
  <div class="mock-wrap">${S.device==='pc'?pcMockup():phoneMockup()}</div>`;
}
function refreshPreview(){ const a=$('#preview-area'); if(a) a.innerHTML=previewArea(); }
function setPreviewView(id){ S.previewView=id; refreshPreview(); }
function setDevice(d){ S.device=d; if(d==='pc'&&S.previewView==='altro') S.previewView='hub'; refreshPreview(); }

function altroScreen(){
  const mods = chosenMods();
  return `<div class="ph-title"><span class="a"></span>Tutti i moduli</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    ${mods.map(m=>`<div onclick="setPreviewView('${m.id}')" style="background:var(--bg1);border:1px solid var(--line);border-radius:11px;padding:12px 6px;text-align:center;cursor:pointer"><div style="font-size:23px">${m.ic}</div><div style="font-size:9.5px;color:var(--t2);margin-top:5px;line-height:1.2">${esc(m.nome)}</div></div>`).join('')}
  </div>`;
}
function phoneMockup(){
  const nome = S.azienda.trim()||'La tua app';
  const mods = chosenMods();
  const first = mods.slice(0,5);
  let nav = first.map(m=>`<div class="nb ${S.previewView===m.id?'on':''}" onclick="setPreviewView('${m.id}')"><span class="i">${m.ic}</span>${_short(m.nome)}</div>`).join('');
  if(mods.length>5) nav += `<div class="nb ${S.previewView==='altro'?'on':''}" onclick="setPreviewView('altro')"><span class="i">☰</span>Altro</div>`;
  const body = S.previewView==='altro' ? altroScreen() : schermataDi(S.previewView);
  return `<div class="phone">
    <div class="notch"></div>
    <div class="ph-top"><span class="dot"></span><div><div class="nm">${esc(nome)}</div><div class="sub">GESTIONALE</div></div></div>
    <div class="ph-body">${body}</div>
    <div class="ph-nav">${nav}</div>
  </div>`;
}
function pcMockup(){
  const nome = S.azienda.trim()||'La tua app';
  const mods = chosenMods();
  const view = S.previewView==='altro' ? 'hub' : S.previewView;
  const slug = (nome.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'la-tua-app');
  return `<div class="pc">
    <div class="pc-bar"><span class="b r"></span><span class="b y"></span><span class="b g"></span><span class="url">${esc(slug)}.app</span></div>
    <div class="pc-app">
      <div class="pc-side">
        <div class="pc-brand"><span class="dot"></span>${esc(nome)}</div>
        <div class="pc-brand-sub">GESTIONALE</div>
        ${mods.map(m=>`<div class="pc-ni ${view===m.id?'on':''}" onclick="setPreviewView('${m.id}')"><span class="i">${m.ic}</span>${esc(m.nome)}</div>`).join('')}
      </div>
      <div class="pc-main">${schermataDi(view)}</div>
    </div>
  </div>`;
}

/* ---------------- invio / export ---------------- */
function buildConfig(){
  return {
    azienda: S.azienda.trim(),
    settore: S.settore,
    moduli_base: MODULI_BASE.map(m=>m.id),
    moduli_extra: [...S.extra],
    generato: 'configuratore'
  };
}
function buildText(){
  const c = buildConfig();
  const settore = byId(SETTORI,S.settore);
  const nm = id => (modById(id)||{nome:id}).nome;
  return [
    `NUOVA APP — configurazione`,
    `Azienda: ${c.azienda||'(da indicare)'}`,
    `Settore: ${settore?settore.nome:'—'}`,
    `Moduli base: ${c.moduli_base.map(nm).join(', ')}`,
    `Moduli extra: ${c.moduli_extra.length?c.moduli_extra.map(nm).join(', '):'nessuno'}`,
    ``,
    `--- config (per l'assemblaggio) ---`,
    JSON.stringify(c)
  ].join('\n');
}
function sendEmail(){
  const sub = `Nuova app — ${S.azienda.trim()||'configurazione'}`;
  window.location.href = `mailto:${CONTATTO.email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(buildText())}`;
}
function sendWhatsApp(){
  window.open(`https://wa.me/${CONTATTO.whatsapp}?text=${encodeURIComponent(buildText())}`,'_blank');
}
function copyConfig(){
  const t = buildText();
  (navigator.clipboard?.writeText(t) || Promise.reject()).then(()=>toast('Configurazione copiata ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');toast('Configurazione copiata ✓');}catch(e){toast('Copia non riuscita');}
    ta.remove();
  });
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------------- navigazione step ---------------- */
function next(){
  if(S.step===1 && !S.azienda.trim()){ $('#az')?.focus(); toast('Scrivi il nome dell\'azienda'); return; }
  if(S.step===2 && !S.settore){ toast('Scegli un settore'); return; }
  if(S.step<4){ S.step++; if(S.step===4){ S.previewView='hub'; S.device='phone'; } render(); }
}
function back(){ if(S.step>1){ S.step--; render(); } }

render();
