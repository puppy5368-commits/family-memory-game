const STORAGE_KEY='family-memory-game-v1';
const players=[{id:'heeyoon',name:'희윤',emoji:'👧'},{id:'mom',name:'엄마',emoji:'👩'},{id:'dad',name:'아빠',emoji:'👨'}];
const games=[
{id:'picture',title:'그림 기억하기',icon:'🖼️',desc:'그림을 잠깐 보고 기억해요!'},
{id:'word',title:'단어 기억하기',icon:'📘',desc:'단어를 보고 가린 뒤 떠올려요!'},
{id:'order',title:'순서 기억하기',icon:'🔢',desc:'순서를 그대로 기억해요!'},
{id:'position',title:'위치 기억하기',icon:'📍',desc:'어디에 있었는지 기억해요!'},
{id:'number',title:'숫자 기억하기',icon:'7️⃣',desc:'숫자를 보고 기억해요!'}
];
const picturePool=['🍎','🐶','🚲','🌙','🎈','🍓','🐰','🚗','⭐','🍕','🌳','🐱'];
const wordPool=['바다','우산','기차','피자','토끼','별','사과','자동차','고양이','모자','책','구름'];
let state=loadState();
let activePlayer=state.activePlayer||'heeyoon';
let currentGame=null;
let currentAnswer=[];
let selected=[];

function loadState(){
  const base={activePlayer:'heeyoon',scores:{heeyoon:0,mom:0,dad:0},best:{heeyoon:0,mom:0,dad:0},streak:{heeyoon:0,mom:0,dad:0},plays:{heeyoon:0,mom:0,dad:0},badges:{heeyoon:[],mom:[],dad:[]}};
  try{return Object.assign(base,JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch(e){return base}
}
function saveState(){state.activePlayer=activePlayer;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function sample(arr,n){return shuffle(arr).slice(0,n)}
function player(){return players.find(p=>p.id===activePlayer)}
function renderPlayers(){
  const el=document.getElementById('players');el.innerHTML='';
  players.forEach(p=>{const b=document.createElement('button');b.className='player-btn'+(p.id===activePlayer?' active':'');b.innerHTML=`<span>${p.emoji}</span><span>${p.name}</span>`;b.onclick=()=>{activePlayer=p.id;saveState();renderAll();};el.appendChild(b)})
}
function renderGames(){
  const el=document.getElementById('gameGrid');el.innerHTML='';
  games.forEach((g,i)=>{const c=document.createElement('div');c.className='game-card';c.innerHTML=`<div><div class="icon">${g.icon}</div><h4>${i+1}. ${g.title}</h4><p>${g.desc}</p></div><button>시작하기 →</button>`;c.querySelector('button').onclick=()=>startGame(g.id);el.appendChild(c)})
}
function renderStats(){
  const ranking=[...players].sort((a,b)=>(state.scores[b.id]||0)-(state.scores[a.id]||0));
  const max=Math.max(100,...ranking.map(p=>state.scores[p.id]||0));
  document.getElementById('rankingList').innerHTML=ranking.map((p,i)=>`<div class="rank-row"><strong>${['🥇','🥈','🥉'][i]}</strong><span>${p.emoji} ${p.name}</span><div class="bar"><span style="width:${((state.scores[p.id]||0)/max)*100}%"></span></div><strong>${state.scores[p.id]||0}점</strong></div>`).join('');
  document.getElementById('recordPlayer').textContent=player().name;
  document.getElementById('todayScore').textContent=(state.scores[activePlayer]||0)+'점';
  document.getElementById('bestScore').textContent=(state.best[activePlayer]||0)+'점';
  document.getElementById('streak').textContent=(state.streak[activePlayer]||0)+'일';
  document.getElementById('cheerText').textContent=(state.plays[activePlayer]||0)>0?'와! 오늘도 기억력이 조금 더 강해졌어요! 💪':'오늘의 첫 도전을 시작해봐요! 💪';
  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('ko-KR');
}
function renderBadges(){
  const all=[['first','🌟','첫 도전'],['perfect','💯','퍼펙트'],['hundred','🏆','100점 돌파'],['five','🔥','5회 도전'],['master','🧠','기억력 마스터']];
  const owned=state.badges[activePlayer]||[];
  document.getElementById('badgeList').innerHTML=all.map(([id,icon,name])=>`<div class="badge ${owned.includes(id)?'unlocked':''}"><div class="badge-icon">${icon}</div><span>${name}</span></div>`).join('');
}
function renderAll(){renderPlayers();renderGames();renderStats();renderBadges()}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
function startGame(id){currentGame=id;selected=[];const stage=document.getElementById('gameStage');stage.scrollIntoView({behavior:'smooth',block:'center'}); if(id==='picture') pictureGame(stage); else if(id==='word') wordGame(stage); else if(id==='order') orderGame(stage); else if(id==='position') positionGame(stage); else numberGame(stage);}
function revealThenAsk(stage,title,items,delay,askFn){stage.innerHTML=`<div><h3>${title}</h3><p>잠깐 보고 기억해보세요!</p><div class="memory-items">${items.map(x=>`<div class="memory-item">${x}</div>`).join('')}</div><p>곧 가려져요 👀</p></div>`;setTimeout(()=>askFn(),delay)}
function pictureGame(stage){currentAnswer=sample(picturePool,5);revealThenAsk(stage,'🖼️ 그림 기억하기',currentAnswer,3200,()=>{const opts=shuffle([...currentAnswer,...sample(picturePool.filter(x=>!currentAnswer.includes(x)),3)]);stage.innerHTML=`<div><h3>아까 본 그림을 모두 골라보세요!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;bindMulti(stage,currentAnswer)})}
function wordGame(stage){currentAnswer=sample(wordPool,5);revealThenAsk(stage,'📘 단어 기억하기',currentAnswer,3500,()=>{const opts=shuffle([...currentAnswer,...sample(wordPool.filter(x=>!currentAnswer.includes(x)),3)]);stage.innerHTML=`<div><h3>아까 본 단어를 모두 골라보세요!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;bindMulti(stage,currentAnswer)})}
function bindMulti(stage,answer){stage.querySelectorAll('.answer-grid button').forEach(b=>b.onclick=()=>{b.classList.toggle('selected');const v=b.dataset.v;selected=selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]});stage.querySelector('#submitAnswer').onclick=()=>{const correct=selected.filter(x=>answer.includes(x)).length;const wrong=selected.filter(x=>!answer.includes(x)).length;const score=Math.max(0,(correct-wrong)*20);finish(score,correct===answer.length&&wrong===0)}}
function orderGame(stage){currentAnswer=sample(['1','2','3','4','5','6','7','8','9'],5);revealThenAsk(stage,'🔢 순서 기억하기',currentAnswer,3000,()=>{const opts=shuffle(currentAnswer);selected=[];stage.innerHTML=`<div><h3>같은 순서로 눌러보세요!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><p id="picked">선택: -</p><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;stage.querySelectorAll('.answer-grid button').forEach(b=>b.onclick=()=>{if(selected.length<5){selected.push(b.dataset.v);document.getElementById('picked').textContent='선택: '+selected.join(' → ')}});stage.querySelector('#submitAnswer').onclick=()=>{let correct=0;selected.forEach((x,i)=>{if(x===currentAnswer[i])correct++});finish(correct*20,correct===5)}})}
function positionGame(stage){const target=Math.floor(Math.random()*9);currentAnswer=[target];stage.innerHTML=`<div><h3>📍 위치 기억하기</h3><p>⭐의 위치를 기억하세요!</p><div class="position-grid" style="display:grid;grid-template-columns:repeat(3,72px);gap:10px;justify-content:center;margin:22px">${Array.from({length:9},(_,i)=>`<div class="memory-item" style="min-width:72px;height:72px;display:grid;place-items:center">${i===target?'⭐':''}</div>`).join('')}</div></div>`;setTimeout(()=>{stage.innerHTML=`<div><h3>별은 어디에 있었을까요?</h3><div class="position-grid" style="display:grid;grid-template-columns:repeat(3,72px);gap:10px;justify-content:center;margin:22px">${Array.from({length:9},(_,i)=>`<button data-i="${i}" style="height:72px;border:1px solid #e7ebf2;border-radius:14px;background:white;cursor:pointer"></button>`).join('')}</div></div>`;stage.querySelectorAll('button').forEach(b=>b.onclick=()=>finish(Number(b.dataset.i)===target?100:0,Number(b.dataset.i)===target))},2600)}
function numberGame(stage){const num=String(Math.floor(10000+Math.random()*90000));currentAnswer=[num];revealThenAsk(stage,'7️⃣ 숫자 기억하기',[num],2600,()=>{stage.innerHTML=`<div><h3>아까 본 숫자를 입력해보세요!</h3><input id="numInput" inputmode="numeric" maxlength="5" style="font-size:30px;text-align:center;padding:12px;border:1px solid #dfe4ec;border-radius:14px;width:220px;margin:22px"><br><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;stage.querySelector('#submitAnswer').onclick=()=>{const v=document.getElementById('numInput').value.trim();let correct=0;[...num].forEach((x,i)=>{if(v[i]===x)correct++});finish(correct*20,v===num)}})}
function finish(score,perfect){const id=activePlayer;state.scores[id]=(state.scores[id]||0)+score;state.best[id]=Math.max(state.best[id]||0,state.scores[id]);state.plays[id]=(state.plays[id]||0)+1;state.streak[id]=Math.max(1,state.streak[id]||0);const badges=new Set(state.badges[id]||[]);badges.add('first');if(perfect)badges.add('perfect');if(state.scores[id]>=100)badges.add('hundred');if(state.plays[id]>=5)badges.add('five');if(state.plays[id]>=10&&state.scores[id]>=500)badges.add('master');state.badges[id]=[...badges];saveState();renderStats();renderBadges();document.getElementById('gameStage').innerHTML=`<div><div class="big-icon">${perfect?'🎉':'💪'}</div><h3>${perfect?'퍼펙트! 정말 잘했어요!':'도전 성공!'}</h3><p><strong>${score}점</strong>을 얻었어요.</p><button class="primary-btn" onclick="startGame('${currentGame}')">한 번 더 도전</button></div>`;toast(`+${score}점! ${player().name} 최고!`)}

document.getElementById('randomBtn').onclick=()=>startGame(games[Math.floor(Math.random()*games.length)].id);
document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
renderAll();
