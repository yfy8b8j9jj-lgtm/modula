/* ===== MODULO BASE: PERSONALE ===== */
/* Estratto da ptek. Dipende dal core (S, esc, nav, save, openSheet, fmtQty, segPick...). */

/* ================= PERSONALE ================= */
function renderEmps(){
  const mKey=todayIso().slice(0,7);
  const PI={cal:['📅','Cal.'],man:['🔧','Manut.'],pellet:['🪵','Pellet'],sites:['🏗','Cant.'],notes:['📝','Note'],chat:['💬','Chat'],clients:['👥','Clienti']};
  $('#main').innerHTML=`
  <div class="pagetitle"><span class="accent" style="background:var(--cy)"></span>Personale <span class="subtle">(${S.employees.length})</span></div>
  ${S.employees.map(e=>{
    const tasks=S.maintenances.filter(m=>empIdsOf(m).includes(e.id)&&m.status!=='fatta').length+S.appointments.filter(a=>empIdsOf(a).includes(e.id)&&!a.done).length;
    const sites=S.sites.filter(s=>s.status!=='chiuso'&&s.employees.includes(e.id)).length;
    const hrsM=S.sites.reduce((t,s)=>t+s.log.filter(l=>l.empId===e.id&&l.date&&l.date.startsWith(mKey)).reduce((a,l)=>a+(l.hours||0),0),0);
    const col=e.isOwner?'#5BA02C':e.userId?(e.active?'#2E9E5E':'#D64528'):'#C77F12';
    const badge=e.isOwner?'TITOLARE':e.userId?(e.active?'✓ ATTIVO':'⛔ DISATTIVATO'):'🔑 IN ATTESA';
    const pending=!e.isOwner&&!e.userId&&e.inviteCode;
    return`<div class="card" style="padding:11px;margin-bottom:9px;cursor:pointer" onclick="editEmp('${e.id}')">
      <div style="display:flex;align-items:center;gap:11px">
        <div class="avat" style="width:42px;height:42px;background:${col}22;border:1px solid ${col}55;color:${col};font-size:15px">${esc(cInitials(e.name))}</div>
        <div style="flex:1;min-width:0"><div style="font-size:14px;color:var(--t1);font-weight:600">${esc(e.name)}${e.isOwner?' 👑':''}</div><div class="su" style="font-size:10.5px">${esc(e.role||'—')}</div></div>
        <span class="badge" style="border-color:${col};color:${col};flex-shrink:0">${badge}</span>
      </div>
      ${!e.isOwner&&e.perms&&e.perms.length?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:9px">${e.perms.map(p=>`<span class="badge" style="border-color:var(--line2);color:var(--t2)">${(PI[p]||['','']) [0]} ${(PI[p]||['',p])[1]}</span>`).join('')}</div>`:''}
      ${!e.isOwner?`<div class="mt" style="margin-top:8px">${tasks} incarichi${sites?' · '+sites+' cantieri':''}${hrsM?' · ⏱ '+fmtQty(hrsM)+'h mese':''}</div>`:''}
      ${pending?`<div onclick="event.stopPropagation();if(navigator.clipboard)navigator.clipboard.writeText('${e.inviteCode}');toast('📋 Codice copiato')" style="display:flex;align-items:center;gap:8px;margin-top:9px;background:var(--bg2);border:1px dashed rgba(199,127,18,.4);border-radius:10px;padding:8px 11px"><span style="font-size:9px;color:var(--t2)">CODICE INVITO</span><span style="font-family:var(--mono);font-size:13px;color:var(--amber);letter-spacing:1px">${esc(e.inviteCode)}</span><span style="margin-left:auto;font-size:10px;color:var(--cy)">📋 Copia</span></div>`:''}
    </div>`;
  }).join('')}
  <button class="fab" onclick="editEmp(null)">+</button>`;
}
function editEmp(id){
  const e=id?byId(S.employees,id):{name:'',role:'',phone:'',perms:['cal','man','chat'],isOwner:false};
  const isMe=!!(id&&S.session&&id===S.session.empId);
  const tasks=id?[
    ...S.maintenances.filter(m=>empIdsOf(m).includes(id)&&m.status!=='fatta').map(m=>'🔧 '+(cName(m.clientId)||'')+' '+m.title+(m.date?' — '+fmtD(m.date):'')),
    ...S.appointments.filter(a=>empIdsOf(a).includes(id)&&!a.done).map(a=>'📅 '+a.title+' — '+fmtD(a.date)),
    ...S.sites.filter(s=>s.status!=='chiuso'&&s.employees.includes(id)).map(s=>'🏗 '+s.name)
  ]:[];
  const PERMS=[['cal','📅 Calendario'],['man','🔧 Manutenzioni'],['pellet','🪵 Pellet'],['sites','🏗 Cantieri'],['macchine','⚙️ Macchine'],['notes','📝 Note'],['chat','💬 Chat'],['clients','👥 Clienti']];
  openSheet(`<h3>${id?'Scheda personale':'Nuova persona'} <span class="x" onclick="closeSheet()">✕</span></h3>
  <div class="fld"><label>Nome</label><input id="em-n" value="${esc(e.name)}"></div>
  <div class="frow"><div class="fld"><label>Ruolo</label><input id="em-r" value="${esc(e.role||'')}" placeholder="es. Tecnico"></div>
  <div class="fld"><label>Telefono</label><input id="em-p" inputmode="tel" value="${esc(e.phone||'')}"></div></div>
  <div class="fld"><label>Sezioni assegnate — tocca per attivare</label>
    <div class="seg" id="em-perms" style="gap:7px">${PERMS.map(([v,l])=>`<div class="sg ${(e.perms||[]).includes(v)?'on':''}" data-v="${v}" onclick="this.classList.toggle('on')">${l}</div>`).join('')}</div>
    <div class="subtle" style="margin-top:7px">Definisce cosa vede e riceve questa persona: sezioni nell'app condivisa, notifiche personalizzate e comandi bot Telegram (si attiva con la fase cloud).</div>
  </div>
  ${isOwner()&&!isMe?`<div class="fld"><label>👑 Ruolo titolare</label>
    <div class="seg"><div class="sg ${e.isOwner?'on':''}" id="em-owner" onclick="this.classList.toggle('on')">👑 Titolare — accesso completo</div></div>
    <div class="subtle" style="margin-top:7px">Se attivo, questa persona vede e gestisce <b>tutto</b> come te (clienti, dipendenti, incarichi, prezzi) e le sezioni qui sopra diventano tutte attive. Puoi attivarlo su più persone.</div></div>`:''}
  ${id&&!isMe&&isOwner()?`<div class="fld"><label>🔑 Accesso</label>
    ${e.userId?`<div class="subtle">✓ Registrato — entra con la sua email e password.</div>
      <div style="display:flex;gap:8px;margin-top:7px">
      <button class="btn sm" onclick="const u=byId(S.employees,'${id}');u.userId=null;u.inviteCode=genInvite(u.name);save();editEmp('${id}');toast('Accesso scollegato, nuovo codice generato')">↻ Resetta accesso</button>
      <button class="btn sm danger" onclick="const u=byId(S.employees,'${id}');u.active=!u.active;save();editEmp('${id}');toast(u.active?'Riattivato':'Accesso disattivato')">${e.active?'⛔ Disattiva':'✓ Riattiva'}</button></div>`
    :e.inviteCode?`<div class="subtle">Non ancora registrato. Dagli questo codice:</div>
      <div style="font-family:var(--mono);font-size:19px;letter-spacing:2px;color:var(--cy);background:var(--bg2);border:1px dashed var(--cy);border-radius:10px;padding:11px;text-align:center;margin:8px 0">${e.inviteCode}</div>
      <div style="display:flex;gap:8px">
      <button class="btn sm" onclick="navigator.clipboard&&navigator.clipboard.writeText('${e.inviteCode}');toast('Codice copiato')">📋 Copia</button>
      <button class="btn sm ghost" onclick="const u=byId(S.employees,'${id}');u.inviteCode=genInvite(u.name);save();editEmp('${id}')">↻ Rigenera</button></div>
      <div class="subtle" style="margin-top:7px">Lui apre l'app → si registra con email e password → inserisce questo codice. Il codice è monouso.</div>`
    :''}
  </div>`:''}
  ${tasks.length?`<div class="fld"><label>Incarichi aperti (${tasks.length})</label>${tasks.map(t=>`<div class="subtle" style="padding:3px 0">• ${esc(t)}</div>`).join('')}</div>`:''}
  <div class="actions">
    ${id&&!isMe&&isOwner()?`<button class="btn danger" onclick="delItem('employees','${id}')">Elimina</button>`:''}
    <button class="btn pri" onclick="saveEmp('${id||''}')">Salva</button></div>`);
}
function saveEmp(id){
  const name=$('#em-n').value.trim();if(!name){toast('Manca il nome');return;}
  let perms=[...document.querySelectorAll('#em-perms .sg.on')].map(x=>x.dataset.v);
  const ot=$('#em-owner');
  const makeOwner=(ot&&isOwner())?ot.classList.contains('on'):null; // null = toggle non mostrato → non cambiare
  if(makeOwner===true)perms=['hub','cal','notes','chat','man','pellet','sites','clients','emps']; // titolare = tutte le sezioni
  const data={name,role:$('#em-r').value.trim(),phone:$('#em-p').value.trim(),perms};
  if(makeOwner!==null)data.isOwner=makeOwner;
  if(id){Object.assign(byId(S.employees,id),data);}else{S.employees.push({id:uid(),inviteCode:genInvite(name),userId:null,isOwner:false,active:true,...data});toast('🔑 Codice invito generato — aprilo dalla scheda');}
  save();closeSheet();render();toast('👷 Salvato');
}



