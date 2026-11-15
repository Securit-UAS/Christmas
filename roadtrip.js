/* Alpine Road Trip V18 — independent of Secret Santa authentication. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const PARTICIPANTS = ['John','Emma','Lee','Sarah','Callum','Holly','Cain','Dexter','Myles'];
  let challenges = [];
  let results = {version:1,updatedAt:null,dailySummary:'The competition has yet to begin. Enjoy the peace while it lasts.',claims:[]};
  let filter = 'all';
  const byId = id => challenges.find(c=>c.id===id);
  const named = value => PARTICIPANTS.some(p=>p.toLowerCase()===String(value).toLowerCase());
  function validate(input){
    if(!input||input.version!==1||!Array.isArray(input.claims)||input.claims.length>1000)throw new Error('Not a supported V18 results file.');
    if(input.dailySummary!=null && (typeof input.dailySummary!=='string'||input.dailySummary.length>1500))throw new Error('Invalid daily summary.');
    const ids=new Set(), firsts=new Set(), personals=new Set();
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
      if(c.status==='approved'){
        const unique=new Set(c.confirmedBy.map(x=>x.toLowerCase()).filter(x=>x!==c.participant.toLowerCase()));
        if(unique.size<2)throw new Error(`Approved claim ${c.id} needs two OTHER participants confirming.`);
        if(challenge.awardMode==='first'){
          if(firsts.has(challenge.id))throw new Error(`Challenge ${challenge.id} already has a first-place winner.`);
          firsts.add(challenge.id);
        } else {
          const personalKey=challenge.id+':'+c.participant.toLowerCase();
          if(personals.has(personalKey))throw new Error(`Participant already credited for ${challenge.id}.`);
          personals.add(personalKey);
        }
      }
    }
    return {version:1,updatedAt:input.updatedAt||null,dailySummary:input.dailySummary||'No daily verdict yet.',claims:input.claims};
  }
  function approved(){return results.claims.filter(c=>c.status==='approved');}
  function totals(){
    const scores=new Map(PARTICIPANTS.map(n=>[n,0]));
    for(const c of approved()){const name=PARTICIPANTS.find(n=>n.toLowerCase()===c.participant.toLowerCase());scores.set(name,scores.get(name)+byId(c.challengeId).points);}
    return [...scores].sort((a,b)=>b[1]-a[1]||PARTICIPANTS.indexOf(a[0])-PARTICIPANTS.indexOf(b[0]));
  }
  function tag(name,text,css){const node=document.createElement(name);if(css)node.className=css;node.textContent=text;return node;}
  function render(){
    el('rtChallengeCount').textContent=challenges.filter(c=>c.active).length;
    el('rtClaimCount').textContent=approved().length;
    el('rtTotalPoints').textContent=approved().reduce((s,c)=>s+byId(c.challengeId).points,0);
    el('rtDailySummary').textContent=results.dailySummary;
    el('rtLastUpdated').textContent=results.updatedAt?'Updated '+new Date(results.updatedAt).toLocaleString('en-GB'):'Awaiting the first result';
    const leaderboard=el('rtLeaderboard');leaderboard.replaceChildren();
    totals().forEach(([name,pts],i)=>{const row=tag('div','','leaderboard-row');row.append(tag('span',String(i+1),'leaderboard-rank'),tag('span',name,'leaderboard-name'),tag('span',pts+' pts','leaderboard-points'));leaderboard.append(row);});
    const claimed=new Set(approved().filter(c=>byId(c.challengeId).awardMode==='first').map(c=>c.challengeId));
    const container=el('rtChallenges');container.replaceChildren();
    challenges.filter(c=>c.active&&(filter==='all'||c.phase===filter)).forEach(c=>{
      const complete=claimed.has(c.id);const card=tag('article','','challenge-card'+(complete?' challenge-complete':''));
      const top=tag('div','','challenge-top');top.append(tag('span',c.id,'challenge-code'),tag('span',c.points+' PTS','challenge-points'));
      card.append(top,tag('h4',c.title),tag('p',c.description));
      const foot=tag('div','','challenge-foot');foot.append(tag('span',complete?'AWARDED':c.awardMode==='first'?'FIRST VALID CLAIM WINS':'ONE PER PERSON','challenge-mode'));
      const button=tag('button',complete?'Already awarded':'Claim on WhatsApp');button.type='button';button.disabled=complete;button.addEventListener('click',()=>shareClaim(c));foot.append(button);card.append(foot);container.append(card);
    });
    const history=el('rtHistory');history.replaceChildren();
    const claims=[...results.claims].sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp));
    if(!claims.length)history.append(tag('p','No claims recorded yet.','road-muted'));
    for(const c of claims.slice(0,35)){
      const row=tag('div','','road-history-item');row.append(tag('span',`${c.participant} — ${byId(c.challengeId).title}`),tag('span',`${c.status.toUpperCase()}${c.status==='approved'?' · '+byId(c.challengeId).points+' pts':''}`));history.append(row);
    }
  }
  function shareClaim(c){
    let name='';try{const raw=JSON.parse(localStorage.getItem('alps2026Session'));if(raw&&raw.displayName&&Date.parse(raw.sessionExpiresUTC)>Date.now())name=raw.displayName;}catch{}
    // The actual sender shown in the exported WhatsApp chat takes precedence over this label.
    const message=`#ALPS26 #${c.id}\nCHALLENGE: ${c.title}\nCLAIMED BY: ${name||'[your name]'}\nEVIDENCE: Photo/video to follow\n\nPlease reply CONFIRMED to this claim if you witnessed it.`;
    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
  }
  function download(){const blob=new Blob([JSON.stringify(results,null,2)+'\n'],{type:'application/json'});const href=URL.createObjectURL(blob);const link=document.createElement('a');link.href=href;link.download='roadtrip-results.json';link.click();setTimeout(()=>URL.revokeObjectURL(href),3000);}
  async function loadJSON(path){const resp=await fetch(path,{cache:'no-store'});if(!resp.ok)throw new Error(`${path} returned ${resp.status}`);return resp.json();}
  async function start(){
    try{
      const config=await loadJSON('roadtrip-challenges.json');
      if(!config||!Array.isArray(config.challenges))throw new Error('Challenge catalogue missing.');
      challenges=config.challenges;
      results=validate(await loadJSON('roadtrip-results.json'));
      render();
    }catch(e){el('rtChallenges').replaceChildren(tag('p','Unable to load challenge data: '+e.message,'road-muted'));el('rtImportMessage').textContent='Run the site through a web server (not file://) and ensure the two roadtrip JSON files are published.';return;}
    el('rtFilters').addEventListener('click',e=>{const b=e.target.closest('button[data-phase]');if(!b)return;filter=b.dataset.phase;el('rtFilters').querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));render();});
    el('rtDownloadResults').addEventListener('click',download);
    el('rtImportFile').addEventListener('change',async e=>{
      const file=e.target.files[0];if(!file)return;
      try{if(file.size>500000)throw new Error('File is unexpectedly large.');results=validate(JSON.parse(await file.text()));render();el('rtImportMessage').textContent='Validated and previewed on this browser only. Download the file and publish it as roadtrip-results.json to update the shared website.';}
      catch(err){el('rtImportMessage').textContent='Import rejected: '+err.message;}
      finally{e.target.value='';}
    });
  }
  start();
})();
