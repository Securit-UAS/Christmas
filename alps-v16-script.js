const LOGIN_URL = 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/21/workflows/aa29747bcd4e43f498d3f26b11c2b0a7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pjtacklYvcffBqLheD4YaDHNdmoQLLPxTTedIy3h65c';
const STORAGE_KEY = 'alps2026Session';
const SAVE_PROFILE_URL = 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/17/workflows/56de81c9937f4ee3bff437bf9e7675e4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Zqt99YLBM4SFVdksQZV1c0iqlGjYMaqiAjV7d6WpfZE';
const LOAD_PROFILE_URL = 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/06/workflows/d48c302a7ebe4497b00b4ecd8be08648/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PmJo4ptSOxJBb3GSAdMxQywDT4JeWlXjo3FYhf1mYow';
const REVEAL_URL = 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/24/workflows/e3795d2e45e342e686d0f95d968cdadd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NdiORC1AUfoIXoqupv__GQZtJQ8-slU2SEL_SrJqAvc';

const modal = document.getElementById('placeholderModal');
const modalClose = document.getElementById('modalClose');
const modalOk = document.getElementById('modalOk');
const loginModal = document.getElementById('loginModal');
const loginClose = document.getElementById('loginClose');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const loginSubmit = document.getElementById('loginSubmit');
const participantSelect = document.getElementById('participantSelect');
const pinInput = document.getElementById('pinInput');
const userChip = document.getElementById('userChip');
const userChipText = document.getElementById('userChipText');
const loginTitle = document.getElementById('loginTitle');
const loginIntro = document.getElementById('loginIntro');
const signedInActions = document.getElementById('signedInActions');
const logoutBtn = document.getElementById('logoutBtn');
const secretSantaEntry = document.getElementById('secretSantaEntry');
const profileBtn = document.getElementById('profileBtn');
const loginSummary = document.getElementById('loginSummary');
const santaStatusPill = document.getElementById('santaStatusPill');
const profileModal = document.getElementById('profileModal');
const revealModal=document.getElementById('revealModal'), revealBtn=document.getElementById('revealBtn'), revealClose=document.getElementById('revealClose'), revealWait=document.getElementById('revealWait'), revealContent=document.getElementById('revealContent'), revealName=document.getElementById('revealName'), revealDetails=document.getElementById('revealDetails'), revealMessage=document.getElementById('revealMessage');
const profileWait = document.getElementById('profileWait');
const profileClose = document.getElementById('profileClose');
const profileForm = document.getElementById('profileForm');
const profileMessage = document.getElementById('profileMessage');
const profileSubmit = document.getElementById('profileSubmit');

function getSession(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function sessionIsValid(s){ return !!(s?.sessionToken && s?.sessionExpiresUTC && new Date(s.sessionExpiresUTC) > new Date()); }
function saveSession(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function clearSession(){ localStorage.removeItem(STORAGE_KEY); }
function setMessage(text='', type=''){ loginMessage.textContent=text; loginMessage.className='login-message'+(type?' '+type:''); }
function openLogin(){
  const s=getSession();
  loginModal.classList.add('show'); loginModal.setAttribute('aria-hidden','false'); setMessage();
  if(sessionIsValid(s)){
    loginTitle.textContent=`Welcome, ${s.displayName}.`;
    loginIntro.textContent=`Access granted until ${new Date(s.sessionExpiresUTC).toLocaleString('en-GB')}.`;
    loginForm.hidden=true; signedInActions.hidden=false;
  } else {
    if(s) clearSession();
    loginTitle.textContent='Identify yourself.';
    loginIntro.textContent='Select your name and enter your four-digit access PIN. Try not to forget who you are.';
    loginForm.hidden=false; signedInActions.hidden=true;
  }
}
function closeLogin(){ loginModal.classList.remove('show'); loginModal.setAttribute('aria-hidden','true'); }
function renderSession(){
  let s=getSession();
  if(s && !sessionIsValid(s)){ clearSession(); s=null; }
  if(s){
    userChip.classList.add('logged-in'); userChipText.textContent=`${s.displayName.toUpperCase()} // LOGGED IN`;
    santaStatusPill.textContent=s.profileComplete==='Yes'?'PROFILE READY':'PROFILE INCOMPLETE';
    santaStatusPill.classList.toggle('pending', s.profileComplete!=='Yes');
    loginSummary.innerHTML=`<strong>WELCOME, ${escapeHtml(s.displayName).toUpperCase()}</strong><span>Profile: ${s.profileComplete==='Yes'?'complete':'incomplete'} // Gift: ${s.giftSorted==='Yes'?'sorted':'not sorted'}</span>`;
    profileBtn.textContent=s.profileComplete==='Yes'?'View / Update My Profile':'Complete My Profile';
  } else {
    userChip.classList.remove('logged-in'); userChipText.textContent='IDENTIFY YOURSELF'; santaStatusPill.textContent='SIGN IN REQUIRED'; santaStatusPill.classList.add('pending');
    loginSummary.innerHTML='<strong>IDENTIFICATION REQUIRED</strong><span>Sign in to access your Secret Santa profile.</span>'; profileBtn.textContent='Complete My Profile';
  }
}
function escapeHtml(v){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function enterSecretSanta(e){
  if(e){ e.preventDefault(); e.stopPropagation(); }
  if(!sessionIsValid(getSession())){ openLogin(); return; }
  document.getElementById('secret-santa')?.scrollIntoView({behavior:'smooth',block:'start'});
}
window.alpsEnterSanta = enterSecretSanta;
window.alpsOpenProfile = function(e){
  if(e){ e.preventDefault(); e.stopPropagation(); }
  openProfile();
};

// Bind the three important buttons immediately when the script loads.
// Primary Secret Santa controls use direct onclick handlers in index.html for reliability.

loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  if(!/^\d{4}$/.test(pinInput.value)){ setMessage('PIN must be four digits. Even Christmas has standards.','error'); return; }
  loginSubmit.disabled=true; loginSubmit.textContent='CHECKING CREDENTIALS…'; setMessage('Contacting Christmas Operations…');
  try{
    const res=await fetch(LOGIN_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({participantId:participantSelect.value,pin:pinInput.value})});
    let data={}; try{ data=await res.json(); }catch{}
    if(!res.ok || !data.success) throw new Error(data.message || `Login failed (${res.status})`);
    saveSession(data); renderSession(); pinInput.value=''; setMessage(`ACCESS GRANTED // WELCOME ${data.displayName.toUpperCase()}`,'ok'); setTimeout(closeLogin,650);
  }catch(err){
    const corsLike=err instanceof TypeError && /fetch/i.test(err.message);
    setMessage(corsLike?'Browser blocked the API request. Likely CORS — backend itself is still alive.':(err.message || 'Login failed.'),'error');
  }finally{ loginSubmit.disabled=false; loginSubmit.textContent='ENTER CHRISTMAS OPERATIONS'; }
});

userChip.addEventListener('click',openLogin); loginClose.addEventListener('click',closeLogin); loginModal.addEventListener('click',e=>{if(e.target===loginModal)closeLogin();});
logoutBtn.addEventListener('click',()=>{clearSession();renderSession();loginForm.hidden=false;signedInActions.hidden=true;loginTitle.textContent='Identify yourself.';loginIntro.textContent='Session cleared. Select a name and enter the four-digit access PIN.';setMessage('LOGGED OUT. IDENTITY CRISIS COMPLETE.');});

function setProfileMessage(text='',type=''){ profileMessage.textContent=text; profileMessage.className='profile-message'+(type?' '+type:''); }
async function openProfile(){
  const s=getSession();
  if(!sessionIsValid(s)){ openLogin(); return; }
  profileModal.classList.add('show'); profileModal.setAttribute('aria-hidden','false');
  profileForm.reset();
  profileForm.hidden=true;
  profileWait.hidden=false;
  setProfileMessage('');
  profileSubmit.disabled=true;
  try{
    const res=await fetch(LOAD_PROFILE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({participantId:s.participantId,sessionToken:s.sessionToken})});
    let data={}; try{data=await res.json();}catch{}
    if(res.status===401){ clearSession(); renderSession(); closeProfile(); openLogin(); return; }
    if(res.status===404){ profileWait.hidden=true; profileForm.hidden=false; setProfileMessage('No saved profile yet — fill this in and press Save.'); return; }
    if(!res.ok || !data.success) throw new Error(data.message || `Profile load failed (${res.status})`);
    const fields=['interestsNow','hobbies','favouriteFoodDrink','favouriteShopsBrands','collects','giftStyle','definitelyAvoid','wouldQuiteLike','clothingSize','wishlistURL','freeText'];
    fields.forEach(id=>{ const el=document.getElementById(id); if(el) el.value=data[id] ?? ''; });
    profileWait.hidden=true;
    profileForm.hidden=false;
    setProfileMessage('Your saved answers are ready. Change anything you like, then press Save.','ok');
  }catch(err){ profileWait.hidden=true; profileForm.hidden=false; setProfileMessage('LOAD FAILED // ' + (err.message || 'Could not load your profile.'),'error'); }
  finally{ profileSubmit.disabled=false; }
}
function closeProfile(){ profileModal.classList.remove('show'); profileModal.setAttribute('aria-hidden','true'); }

profileClose.addEventListener('click',closeProfile);
profileModal.addEventListener('click',e=>{if(e.target===profileModal)closeProfile();});
profileForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const s=getSession();
  if(!sessionIsValid(s)){ closeProfile(); clearSession(); renderSession(); openLogin(); return; }
  const payload={
    participantId:s.participantId, sessionToken:s.sessionToken,
    interestsNow:document.getElementById('interestsNow').value.trim(),
    hobbies:document.getElementById('hobbies').value.trim(),
    favouriteFoodDrink:document.getElementById('favouriteFoodDrink').value.trim(),
    favouriteShopsBrands:document.getElementById('favouriteShopsBrands').value.trim(),
    collects:document.getElementById('collects').value.trim(),
    giftStyle:document.getElementById('giftStyle').value,
    definitelyAvoid:document.getElementById('definitelyAvoid').value.trim(),
    wouldQuiteLike:document.getElementById('wouldQuiteLike').value.trim(),
    clothingSize:document.getElementById('clothingSize').value.trim(),
    wishlistURL:document.getElementById('wishlistURL').value.trim(),
    freeText:document.getElementById('freeText').value.trim()
  };
  if(!payload.interestsNow && !payload.hobbies && !payload.favouriteFoodDrink && !payload.wouldQuiteLike){ setProfileMessage('Give Santa something to work with — complete at least a few of the useful fields.','error'); return; }
  profileSubmit.disabled=true; profileSubmit.textContent='TRANSMITTING CHRISTMAS INTELLIGENCE…'; setProfileMessage('Updating the classified file…');
  try{
    const res=await fetch(SAVE_PROFILE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    let data={}; try{data=await res.json();}catch{}
    if(res.status===401){ clearSession(); renderSession(); closeProfile(); openLogin(); throw new Error('Session expired. Sign in again and your browser will stop sulking.'); }
    if(!res.ok || !data.success) throw new Error(data.message || `Profile save failed (${res.status})`);
    const updated={...s,profileComplete:'Yes'}; saveSession(updated); renderSession();
    setProfileMessage('PROFILE SAVED // CHRISTMAS INTELLIGENCE ACCEPTED','ok');
    profileSubmit.textContent='PROFILE SAVED';
    setTimeout(closeProfile,900);
  }catch(err){ setProfileMessage(err.message || 'Profile save failed.','error'); }
  finally{ profileSubmit.disabled=false; setTimeout(()=>{profileSubmit.textContent='SAVE MY CHRISTMAS INTELLIGENCE';},1000); }
});

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function openReveal(){
  const s=getSession();
  if(!sessionIsValid(s)){openLogin();return;}
  revealModal.classList.add('show'); revealModal.setAttribute('aria-hidden','false');
  revealWait.hidden=false; revealContent.hidden=true; revealDetails.innerHTML=''; revealMessage.textContent='';
  try{
    const res=await fetch(REVEAL_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({participantId:s.participantId,sessionToken:s.sessionToken})});
    let data={}; try{data=await res.json();}catch{}
    if(res.status===401){clearSession();renderSession();closeReveal();openLogin();return;}
    if(!res.ok||!data.success) throw new Error(data.message||`Reveal failed (${res.status})`);
    revealName.textContent=data.recipientName||'MYSTERY PERSON';
    const fields=[['Things they’re into','interestsNow'],['Hobbies','hobbies'],['Food & drink','favouriteFoodDrink'],['Shops & brands','favouriteShopsBrands'],['Collects','collects'],['Gift style','giftStyle'],['Definitely avoid','definitelyAvoid'],['Would quite like','wouldQuiteLike'],['Clothing size','clothingSize'],['Anything else','freeText']];
    const rows=fields.filter(([,k])=>data[k]&&String(data[k]).trim()).map(([label,k])=>`<div class="reveal-row"><b>${esc(label)}</b><span>${esc(data[k])}</span></div>`);
    if(data.wishlistURL&&String(data.wishlistURL).trim()) rows.push(`<div class="reveal-row"><b>Wishlist</b><a href="${esc(data.wishlistURL)}" target="_blank" rel="noopener">Open wishlist</a></div>`);
    revealDetails.innerHTML=rows.length?rows.join(''):'<div class="reveal-empty">They haven’t filled in their profile yet. You know who you’ve got — intelligence will appear here when they do.</div>';
    revealWait.hidden=true; revealContent.hidden=false;
  }catch(err){revealWait.hidden=true;revealContent.hidden=false;revealName.textContent='NOT SO FAST';revealDetails.innerHTML='';revealMessage.textContent='REVEAL FAILED // '+(err.message||'Could not retrieve your person.');revealMessage.className='profile-message error';}
}
function closeReveal(){revealModal.classList.remove('show');revealModal.setAttribute('aria-hidden','true');}
revealBtn.addEventListener('click',openReveal); revealClose.addEventListener('click',closeReveal); revealModal.addEventListener('click',e=>{if(e.target===revealModal)closeReveal();});

document.querySelectorAll('[data-target]').forEach(btn=>btn.addEventListener('click',()=>{
  // Secret Santa is an authenticated area: every entry point should behave the same way.
  if(btn.dataset.target==='secret-santa'){
    if(!sessionIsValid(getSession())){ openLogin(); return; }
  }
  const target=document.getElementById(btn.dataset.target);
  if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
}));
document.querySelectorAll('.placeholder-action').forEach(btn=>btn.addEventListener('click',()=>{modal.classList.add('show');modal.setAttribute('aria-hidden','false');}));
function closeModal(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
modalClose.addEventListener('click',closeModal);modalOk.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
const soundBtn=document.getElementById('soundBtn');let nonsense=false;soundBtn.addEventListener('click',()=>{nonsense=!nonsense;soundBtn.innerHTML=nonsense?'<span>♫</span>':'<span>♪</span>';soundBtn.title=nonsense?'Festive nonsense armed. No audio file is actually connected.':'Festive nonsense disarmed.';});
renderSession();
