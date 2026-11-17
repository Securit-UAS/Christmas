/* Alpine Road Trip V24 — independent scoring tracks and organiser-approved entries. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const PARTICIPANTS = ['John','Emma','Lee','Sarah','Callum','Holly','Cain','Dexter','Myles'];
  let challenges = [];
  const EMPTY = {version:1,updatedAt:null,dailySummary:'The competition has yet to begin. Enjoy the peace while it lasts.',claims:[],adjustments:[],awards:[]};
  let results = {...EMPTY};
  let publishedBundle = null;
  let nextRevealMs = 0;
  let currentlyVisibleRelease = null;
  const PARIS_ZONE = 'Europe/Paris';
  const timeParts = now => Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:PARIS_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
  function nextAlpineEight(now=Date.now()) {
    // Find the next 08:00 Europe/Paris using Intl, avoiding assumptions about CET/CEST.
    const t=timeParts(new Date(now));
    const dayUtc=Date.UTC(t.year,t.month-1,t.day)+(t.hour>=8?86400000:0);
    const day=new Date(dayUtc);
    const y=day.getUTCFullYear(), m=day.getUTCMonth()+1, d=day.getUTCDate();
    let guess=Date.UTC(y,m-1,d,7,0,0); // typical winter offset, corrected below
    for(let k=0;k<3;k++){
      const q=timeParts(new Date(guess));
      const observed=Date.UTC(q.year,q.month-1,q.day,q.hour,q.minute,q.second);
      const desired=Date.UTC(y,m-1,d,8);
      guess+=desired-observed;
    }
    return guess;
  }
  function renderCountdown() {
    if(!el('rtCountdown'))return;
    const left=Math.max(0,nextRevealMs-Date.now());
    const hh=Math.floor(left/3600000),mm=Math.floor(left%3600000/60000),ss=Math.floor(left%60000/1000);
    el('rtCountdown').textContent=[hh,mm,ss].map(n=>String(n).padStart(2,'0')).join(':');
    el('rtNextUpdate').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:PARIS_ZONE,weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(nextRevealMs));
  }
  function applyPublished(now=Date.now()) {
    if(!publishedBundle)return;
    if(publishedBundle.version===1){results=validate(publishedBundle);currentlyVisibleRelease='legacy';return;}
    const eligible=publishedBundle.releases.filter(r=>Date.parse(r.publishAt)<=now).sort((a,b)=>Date.parse(a.publishAt)-Date.parse(b.publishAt));
    const latest=eligible.at(-1);
    currentlyVisibleRelease=latest?.publishAt||null;
    results=latest?validate(latest.results):{...EMPTY};
  }
  function validateBundle(input){
    if(input?.version===1)return validate(input);
    if(!input||input.version!==2||!Array.isArray(input.releases)||input.releases.length>120)throw new Error('Expected version 2 scheduled results with releases.');
    const dates=new Set();
    for(const release of input.releases){
      if(!release||typeof release.publishAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\+01:00|\+02:00)$/.test(release.publishAt)||!Number.isFinite(Date.parse(release.publishAt)))throw new Error('Release needs a valid Alpine timestamp.');
      const parts=timeParts(new Date(release.publishAt));
      if(release.releaseType==='manual'){
        if(parts.year!==Number(release.publishAt.slice(0,4))||parts.month!==Number(release.publishAt.slice(5,7))||parts.day!==Number(release.publishAt.slice(8,10)))throw new Error('Invalid Alpine date for manual release.');
      }else if(parts.hour!==8||parts.minute!==0||parts.second!==0)throw new Error('Scheduled release must be 08:00 Europe/Paris.');
      if(dates.has(release.publishAt))throw new Error('Duplicate release time.');
      dates.add(release.publishAt);validate(release.results);
    }
    return input;
  }
  let filter = 'all';
  const FAMILY_MEMBERS = {'Bewsey Wilkinson':['John','Emma','Cain','Dexter','Myles'],Redgwell:['Lee','Sarah','Callum','Holly']};
  const household = name => Object.entries(FAMILY_MEMBERS).find(([_,members])=>members.some(m=>m.toLowerCase()===String(name).toLowerCase()))?.[0]||String(name);
  const byId = id => challenges.find(c=>c.id===id);
  const named = value => PARTICIPANTS.some(p=>p.toLowerCase()===String(value).toLowerCase());
  function validate(input){
    if(!input||input.version!==1||!Array.isArray(input.claims)||input.claims.length>1000)throw new Error('Not a supported V18 results file.');
    if(input.dailySummary!=null && (typeof input.dailySummary!=='string'||input.dailySummary.length>1500))throw new Error('Invalid daily summary.');
    const ids=new Set(), firsts=new Set(), personals=new Set();
    // Optional, explicitly adjudicated daily deductions. Absence of reaction data alone is NEVER sufficient.
    const adjustments=input.adjustments??[];
    if(!Array.isArray(adjustments)||adjustments.length>200)throw new Error('Invalid participation adjustments.');
    const adjustmentIds=new Set(), dailyPenalties=new Set();
    for(const a of adjustments){
      if(!a||typeof a.id!=='string'||!/^[\w-]{1,90}$/.test(a.id)||adjustmentIds.has(a.id))throw new Error('Invalid or duplicate adjustment ID.');
      adjustmentIds.add(a.id);
      if(!named(a.participant)||a.participant.toLowerCase()==='myles')throw new Error('Myles is exempt from participation deductions.');
      if(a.points!==-5||a.reason!=='non-participation')throw new Error('Only reviewed -5 participation deductions are supported.');
      if(typeof a.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(a.date)||Number.isNaN(Date.parse(a.date+'T12:00:00Z')))throw new Error('Adjustment needs a valid YYYY-MM-DD date.');
      if(typeof a.note!=='string'||a.note.trim().length<10||a.note.length>400)throw new Error('Document a clear rationale for every deduction.');
      const key=a.date+':'+a.participant.toLowerCase();
      if(dailyPenalties.has(key))throw new Error('At most one participation deduction per person per day.');
      dailyPenalties.add(key);
    }
    for(const c of input.claims){
      if(!c || typeof c.id!=='string' || !/^[\w-]{1,90}$/.test(c.id) || ids.has(c.id))throw new Error('Every claim needs a unique safe ID.');
      ids.add(c.id);
      const challenge=byId(c.challengeId);
      if(!challenge)throw new Error(`Unknown challenge for claim ${c.id}.`);
      if(!named(c.participant))throw new Error(`Unknown participant for claim ${c.id}.`);
      if(c.status!=='approved' && c.status!=='pending' && c.status!=='rejected')throw new Error(`Invalid status for ${c.id}.`);
      if(typeof c.timestamp!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(c.timestamp)||Number.isNaN(Date.parse(c.timestamp)))throw new Error(`Invalid timestamp for ${c.id}.`);
      if(c.note!=null&&(typeof c.note!=='string'||c.note.length>500))throw new Error(`Invalid note for ${c.id}.`);
      if(!Array.isArray(c.confirmedBy)||c.confirmedBy.some(v=>!named(v)))throw new Error(`Invalid confirmations for ${c.id}.`);
      if(c.recipients!==undefined && (!Array.isArray(c.recipients)||c.recipients.some(v=>!named(v))||new Set(c.recipients.map(v=>v.toLowerCase())).size!==c.recipients.length))throw new Error(`Invalid or duplicate shared recipients for ${c.id}.`);
      if(c.pointsAwarded!==undefined&&(!Number.isInteger(c.pointsAwarded)||c.pointsAwarded<0||c.pointsAwarded>challenge.points))throw new Error('Invalid claim points.');
      if(c.status==='approved'){
        if(c.approvalMethod==='organiser-unchallenged'&&(!c.approvedBy||c.challenged===true))throw new Error('Organiser approval requires an approver and no challenge.');
        if(c.approvalMethod==='context-reviewed'&&(!c.reviewedBy||!c.reviewSource||!c.reviewNotes||c.challenged===true))throw new Error('Context review must identify source, assessor and rationale without unresolved challenge.');
        if(c.challenged===true)throw new Error('Unresolved challenged claims cannot be approved.');
        const unique=new Set(c.confirmedBy.map(x=>x.toLowerCase()).filter(x=>x!==c.participant.toLowerCase()));
        if(unique.size<2&&!['organiser-unchallenged','context-reviewed'].includes(c.approvalMethod))throw new Error(`Claim ${c.id} needs two witnesses or evidenced unchallenged review.`);
        if(challenge.awardMode==='vote' && c.voteConfirmed!==true)throw new Error(`Group-voted claim ${c.id} needs voteConfirmed: true after a documented human vote.`);
        if(challenge.awardMode==='shared' && (!Array.isArray(c.recipients)||!c.recipients.length))throw new Error(`Shared claim ${c.id} needs named photo participants.`);
        if(['first','vote','shared'].includes(challenge.awardMode)){
          if(firsts.has(challenge.id))throw new Error(`Challenge ${challenge.id} already has a winner.`);
          firsts.add(challenge.id);
        } else {
          const personalKey=challenge.id+':'+(challenge.awardMode==='family'?household(c.participant).toLowerCase():c.participant.toLowerCase());
          if(personals.has(personalKey))throw new Error(`Participant already credited for ${challenge.id}.`);
          personals.add(personalKey);
        }
      }
    }
    const awards=input.awards||[];
    if(!Array.isArray(awards)||awards.length>300)throw new Error('Invalid awards.');
    const seen=new Set();
    for(const a of awards){
      if(!a||!a.id||seen.has(a.id))throw new Error('Duplicate award.');
      seen.add(a.id);
      if(!['proposed','approved','rejected'].includes(a.status))throw new Error('Invalid award status.');
      if(!['individual','household'].includes(a.track))throw new Error('Invalid award track.');
      if(a.track==='individual'&&!named(a.recipient))throw new Error('Invalid award person.');
      if(a.track==='household'&&!Object.hasOwn(FAMILY_MEMBERS,a.recipient))throw new Error('Invalid award household.');
      if(!Number.isInteger(a.points)||a.points<0||a.points>100)throw new Error('Invalid award points.');
      if(typeof a.reason!=='string'||a.reason.length<10||typeof a.evidence!=='string'||a.evidence.length<5)throw new Error('Award evidence/rationale missing.');
      if(a.status==='approved'&&!a.approvedBy)throw new Error('Award approver missing.');
    }
    const refereeAdjustments=input.refereeAdjustments||[];
    if(!Array.isArray(refereeAdjustments)||refereeAdjustments.length>100)throw new Error('Invalid referee adjustments.');
    const refereeIds=new Set();
    for(const a of refereeAdjustments){
      if(!a||typeof a.id!=='string'||!/^[a-z0-9-]{1,90}$/i.test(a.id)||refereeIds.has(a.id))throw new Error('Duplicate or invalid referee adjustment.');
      refereeIds.add(a.id);
      if(!named(a.participant)||!Number.isInteger(a.points)||a.points===0||Math.abs(a.points)>20)throw new Error('Invalid referee adjustment points.');
      if(a.points<0&&['Cain','Dexter','Callum','Holly','Myles'].includes(a.participant))throw new Error('Children are exempt from comedy deductions.');
      if(typeof a.reason!=='string'||a.reason.length<10||a.reason.length>300||!a.approvedBy)throw new Error('Referee adjustment requires a rationale and organiser approval.');
    }
    return {version:1,updatedAt:input.updatedAt||null,dailySummary:input.dailySummary||'No daily verdict yet.',claims:input.claims,adjustments,awards,refereeAdjustments};
  }
  function approved(){return results.claims.filter(c=>c.status==='approved');}
  function scoreboards(){
    const personal=new Map(PARTICIPANTS.map(n=>[n,0])),households=new Map(Object.keys(FAMILY_MEMBERS).map(n=>[n,0]));let total=0;
    for(const c of approved()){
      const ch=byId(c.challengeId),points=c.pointsAwarded??ch.points;
      if(ch.awardMode==='family'){households.set(household(c.participant),households.get(household(c.participant))+points);total+=points;}
      else for(const person of ch.awardMode==='shared'?c.recipients:[c.participant]){
        const name=PARTICIPANTS.find(n=>n.toLowerCase()===person.toLowerCase());personal.set(name,personal.get(name)+points);total+=points;
      }
    }
    for(const a of results.adjustments||[]){const name=PARTICIPANTS.find(n=>n.toLowerCase()===a.participant.toLowerCase());personal.set(name,personal.get(name)+a.points);total+=a.points;}
    for(const a of results.awards||[]){if(a.status!=='approved')continue;const board=a.track==='individual'?personal:households;board.set(a.recipient,board.get(a.recipient)+a.points);total+=a.points;}
    for(const a of results.refereeAdjustments||[]){personal.set(a.participant,personal.get(a.participant)+a.points);total+=a.points;}
    return {personal:[...personal].sort((a,b)=>b[1]-a[1]||PARTICIPANTS.indexOf(a[0])-PARTICIPANTS.indexOf(b[0])),families:[...households].sort((a,b)=>b[1]-a[1]),total};
  }
  function renderArchive(){
    const root=el('rtArchive');if(!root)return;root.replaceChildren();
    const releases=(publishedBundle?.releases||[]).filter(r=>Date.parse(r.publishAt)<=Date.now()).sort((a,b)=>Date.parse(b.publishAt)-Date.parse(a.publishAt));
    if(!releases.length){root.append(tag('p','First official results at the next 08:00 Alpine reveal.','road-muted'));return;}
    for(const r of releases){const card=tag('article','','road-archive-item');card.append(tag('strong',new Intl.DateTimeFormat('en-GB',{timeZone:PARIS_ZONE,dateStyle:'full'}).format(new Date(r.publishAt))));card.append(tag('p',r.results.dailySummary||'No report.','road-muted'));root.append(card);}
  }
  function tag(name,text,css){const node=document.createElement(name);if(css)node.className=css;node.textContent=text;return node;}
  function render(){
    el('rtChallengeCount').textContent=challenges.filter(c=>c.active).length;
    el('rtClaimCount').textContent=currentlyVisibleRelease?approved().length:'—';
    const boards=scoreboards();
    el('rtTotalPoints').textContent=currentlyVisibleRelease?boards.total:'—';
    if(el('rtReviewStatus'))el('rtReviewStatus').textContent=currentlyVisibleRelease?((results.awards||[]).filter(a=>a.status==='proposed').length+' historical awards under review; not included in the published standings.'):'Submissions are being adjudicated. Official standings are sealed until the first 08:00 Alpine reveal.';
    el('rtDailySummary').textContent=results.dailySummary;
    el('rtLastUpdated').textContent=results.updatedAt?'Latest published results · '+new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:PARIS_ZONE}).format(new Date(results.updatedAt))+' Alpine time':'Official scores are sealed until the first reveal';
    const leaderboard=el('rtLeaderboard');leaderboard.replaceChildren();
    if(!currentlyVisibleRelease)leaderboard.append(tag('p','Official scores will appear after the first published release.','road-muted'));
    if(currentlyVisibleRelease)boards.personal.forEach(([name,pts],i)=>{const row=tag('div','','leaderboard-row');row.append(tag('span',String(i+1),'leaderboard-rank'),tag('span',name,'leaderboard-name'),tag('span',pts+' pts','leaderboard-points'));leaderboard.append(row);});
    const familiesBoard=el('rtFamilyLeaderboard');familiesBoard.replaceChildren();
    if(!currentlyVisibleRelease)familiesBoard.append(tag('p','Household scores reveal with the individual championship.','road-muted'));
    if(currentlyVisibleRelease)boards.families.forEach(([name,pts],i)=>{const row=tag('div','','leaderboard-row');row.append(tag('span',String(i+1),'leaderboard-rank'),tag('span',name,'leaderboard-name'),tag('span',pts+' pts','leaderboard-points'));familiesBoard.append(row);});
    const claimed=new Set(approved().filter(c=>['first','vote','shared'].includes(byId(c.challengeId).awardMode)).map(c=>c.challengeId));
    const container=el('rtChallenges');container.replaceChildren();
    challenges.filter(c=>c.active&&(filter==='all'||c.phase===filter)).forEach(c=>{
      const complete=claimed.has(c.id);const card=tag('article','','challenge-card'+(complete?' challenge-complete':''));
      const top=tag('div','','challenge-top');top.append(tag('span',c.id,'challenge-code'),tag('span',c.points+' PTS','challenge-points'));
      card.append(top,tag('h4',c.title),tag('p',c.description));
      const foot=tag('div','','challenge-foot');foot.append(tag('span',complete?'AWARDED':c.awardMode==='first'?'FIRST VALID CLAIM WINS':c.awardMode==='shared'?'FIRST PHOTO · SHARED POINTS':c.awardMode==='vote'?'GROUP VOTE DECIDES':c.awardMode==='family'?'ONCE PER HOUSEHOLD':'ONE PER PERSON','challenge-mode'));
      const button=tag('button',complete?'Already awarded':'Claim on WhatsApp');button.type='button';button.disabled=complete;button.addEventListener('click',()=>shareClaim(c));foot.append(button);card.append(foot);container.append(card);
    });
    renderArchive();
    const history=el('rtHistory');history.replaceChildren();
    for(const a of (results.awards||[]).filter(a=>a.status==='approved').slice(-15).reverse()){const row=tag('div','','road-history-item');row.append(tag('span',a.recipient+' — '+a.reason),tag('span','+'+a.points+' pts'));history.append(row);}
    for(const a of (results.refereeAdjustments||[]).slice().reverse()){const row=tag('div','','road-history-item');row.append(tag('span',a.participant+' — Referee: '+a.reason),tag('span',(a.points>0?'+':'')+a.points+' pt'));history.append(row);}
    const claims=[...results.claims].sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp));
    if(!claims.length)history.append(tag('p','No claims recorded yet.','road-muted'));
    for(const a of (results.adjustments||[]).slice(-10).reverse()){const row=tag('div','','road-history-item');row.append(tag('span',`${a.participant} — Participation deduction (${a.date})`),tag('span',`${a.points} pts`));history.append(row);}
    for(const c of claims.slice(0,35)){
      const row=tag('div','','road-history-item');row.append(tag('span',`${c.participant} — ${byId(c.challengeId).title}`),tag('span',`${c.status.toUpperCase()}${c.status==='approved'?' · '+(byId(c.challengeId).awardMode==='shared'?(c.pointsAwarded??byId(c.challengeId).points)+' pts each ('+c.recipients.length+')':(c.pointsAwarded??byId(c.challengeId).points)+' pts'):''}`));history.append(row);
    }
  }
  function shareClaim(c){
    let name='';
    try{
      const raw=JSON.parse(localStorage.getItem('alps2026Session'));
      if(raw?.sessionToken && raw?.displayName && raw?.sessionExpiresUTC && Date.parse(raw.sessionExpiresUTC)>Date.now() && PARTICIPANTS.includes(raw.displayName))name=raw.displayName;
    }catch{}
    if(!name){
      // Reuse the existing four-digit PIN login flow, rather than opening WhatsApp anonymously.
      el('userChip')?.click();
      if(el('loginTitle'))el('loginTitle').textContent='Identify yourself, potential champion.';
      if(el('loginIntro'))el('loginIntro').textContent='Before claiming glory, sign in with your name and PIN. The AI referee will score your evidence, assess your excuses, and may judge your choice of road-trip music. Harshly. Once signed in, tap Claim on WhatsApp again.';
      return;
    }
    // The actual sender shown in the exported WhatsApp chat takes precedence over this label.
    const message=`#ALPS26 #${c.id}\nCHALLENGE: ${c.title}\nCLAIMED BY: ${name||'[your name]'}\nEVIDENCE: Photo or video (under 60 seconds) to follow\nNOTE: AI does not assess sound; voice/music challenges need human confirmation.\n\nPlease reply CONFIRMED if witnessed, or CHALLENGE if incorrect. The organiser may approve unchallenged claims.`;
    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
  }
  function download(){const blob=new Blob([JSON.stringify(publishedBundle||results,null,2)+'\n'],{type:'application/json'});const href=URL.createObjectURL(blob);const link=document.createElement('a');link.href=href;link.download='roadtrip-results.json';link.click();setTimeout(()=>URL.revokeObjectURL(href),3000);}
  async function loadJSON(path){const resp=await fetch(path,{cache:'no-store'});if(!resp.ok)throw new Error(`${path} returned ${resp.status}`);return resp.json();}
  async function start(){
    try{
      const config=await loadJSON('roadtrip-challenges.json');
      if(!config||!Array.isArray(config.challenges))throw new Error('Challenge catalogue missing.');
      challenges=config.challenges;
      publishedBundle=validateBundle(await loadJSON('roadtrip-results.json'));
      applyPublished();
      nextRevealMs=nextAlpineEight();
      render();renderCountdown();
      // Check for a newly published JSON and for the 08:00 Alpine reveal.
      setInterval(async()=>{
        try{
          if(Date.now()>=nextRevealMs){
            publishedBundle=validateBundle(await loadJSON('roadtrip-results.json'));
            applyPublished();nextRevealMs=nextAlpineEight();render();
          }
          renderCountdown();
        }catch(err){console.warn('Road Trip result refresh failed:',err);renderCountdown();}
      },1000);
      // Pick up an admin-published result during the day, without revealing any scheduled releases early.
      setInterval(async()=>{
        try{
          const fresh=validateBundle(await loadJSON('roadtrip-results.json'));
          const old=JSON.stringify(results);
          publishedBundle=fresh;applyPublished();
          if(JSON.stringify(results)!==old)render();
        }catch(err){console.warn('Road Trip poll failed:',err);}
      },60000);
    }catch(e){el('rtChallenges').replaceChildren(tag('p','Unable to load challenge data: '+e.message,'road-muted'));el('rtImportMessage').textContent='Run the site through a web server (not file://) and ensure the two roadtrip JSON files are published.';return;}
    el('rtFilters').addEventListener('click',e=>{const b=e.target.closest('button[data-phase]');if(!b)return;filter=b.dataset.phase;el('rtFilters').querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));render();});
    el('rtDownloadResults').addEventListener('click',download);
    el('rtImportFile').addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      try{if(file.size>1000000)throw new Error('File is unexpectedly large.');publishedBundle=validateBundle(JSON.parse(await file.text()));applyPublished();render();renderCountdown();el('rtImportMessage').textContent='Validated and previewed locally. Future 08:00 Alpine releases stay hidden in this preview. Download and publish as roadtrip-results.json on GitHub.';}
      catch(err){el('rtImportMessage').textContent='Import rejected: '+err.message;}
      finally{e.target.value='';}
    });
  }
  start();
})();
