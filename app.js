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
function stage(){return document.getElementById('gameStage')}
function renderPlayers(){
  const el=document.getElementById('players');el.innerHTML='';
  players.forEach(p=>{const b=document.createElement('button');b.className='player-btn'+(p.id===activePlayer?' active':'');b.innerHTML=`<span>${p.emoji}</span><span>${p.name}</span>`;b.onclick=()=>{activePlayer=p.id;saveState();renderAll();toast(`${p.name} 차례로 바뀌었어요!`)};el.appendChild(b)})
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
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}

function startGame(id){
  currentGame=id;selected=[];
  const s=stage();s.scrollIntoView({behavior:'smooth',block:'center'});
  const g=games.find(x=>x.id===id);
  let n=3;
  s.innerHTML=`<div class="game-panel"><span class="game-kicker">${g.icon} ${g.title}</span><div class="countdown" id="countdown">${n}</div><div class="countdown-note">준비! 곧 시작해요 👀</div></div>`;
  const timer=setInterval(()=>{
    n--;
    if(n>0){document.getElementById('countdown').textContent=n;}
    else{clearInterval(timer);launchGame(id,s)}
  },650);
}
function launchGame(id,s){if(id==='picture')pictureGame(s);else if(id==='word')wordGame(s);else if(id==='order')orderGame(s);else if(id==='position')positionGame(s);else numberGame(s)}
function revealThenAsk(s,title,items,delay,askFn,isWord=false){
  s.innerHTML=`<div class="game-panel"><span class="game-kicker">기억하는 시간</span><h3>${title}</h3><p>눈으로 보고 머릿속에 꼭 담아보세요!</p><div class="memory-items">${items.map(x=>`<div class="memory-item ${isWord?'word':''}">${x}</div>`).join('')}</div><p class="subtle">곧 가려져요 👀</p></div>`;
  setTimeout(()=>askFn(),delay)
}
function pictureGame(s){
  currentAnswer=sample(picturePool,5);
  revealThenAsk(s,'🖼️ 그림 기억하기',currentAnswer,3200,()=>{
    const opts=shuffle([...currentAnswer,...sample(picturePool.filter(x=>!currentAnswer.includes(x)),3)]);
    s.innerHTML=`<div class="game-panel"><span class="game-kicker">정답 고르기</span><h3>아까 본 그림을 모두 골라보세요!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;bindMulti(s,currentAnswer)
  })
}
function wordGame(s){
  currentAnswer=sample(wordPool,5);
  revealThenAsk(s,'📘 단어 기억하기',currentAnswer,3500,()=>{
    const opts=shuffle([...currentAnswer,...sample(wordPool.filter(x=>!currentAnswer.includes(x)),3)]);
    s.innerHTML=`<div class="game-panel"><span class="game-kicker">정답 고르기</span><h3>아까 본 단어를 모두 골라보세요!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;bindMulti(s,currentAnswer)
  },true)
}
function bindMulti(s,answer){
  s.querySelectorAll('.answer-grid button').forEach(b=>b.onclick=()=>{b.classList.toggle('selected');const v=b.dataset.v;selected=selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]});
  s.querySelector('#submitAnswer').onclick=()=>{const correct=selected.filter(x=>answer.includes(x)).length;const wrong=selected.filter(x=>!answer.includes(x)).length;const score=Math.max(0,(correct-wrong)*20);finish(score,correct===answer.length&&wrong===0)}
}
function orderGame(s){
  currentAnswer=sample(['1','2','3','4','5','6','7','8','9'],5);
  revealThenAsk(s,'🔢 순서 기억하기',currentAnswer,3000,()=>{
    const opts=shuffle(currentAnswer);selected=[];
    s.innerHTML=`<div class="game-panel"><span class="game-kicker">순서대로 누르기</span><h3>같은 순서로 눌러보세요!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><p id="picked">선택: -</p><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;
    s.querySelectorAll('.answer-grid button').forEach(b=>b.onclick=()=>{if(selected.length<5){selected.push(b.dataset.v);document.getElementById('picked').textContent='선택: '+selected.join(' → ')}});
    s.querySelector('#submitAnswer').onclick=()=>{let correct=0;selected.forEach((x,i)=>{if(x===currentAnswer[i])correct++});finish(correct*20,correct===5)}
  })
}
function positionGame(s){
  const target=Math.floor(Math.random()*9);currentAnswer=[target];
  s.innerHTML=`<div class="game-panel"><span class="game-kicker">위치 기억하기</span><h3>⭐의 위치를 기억하세요!</h3><div class="position-grid">${Array.from({length:9},(_,i)=>`<div class="position-cell">${i===target?'⭐':''}</div>`).join('')}</div><p class="subtle">곧 별이 사라져요!</p></div>`;
  setTimeout(()=>{
    s.innerHTML=`<div class="game-panel"><span class="game-kicker">위치 고르기</span><h3>별은 어디에 있었을까요?</h3><div class="position-grid">${Array.from({length:9},(_,i)=>`<button class="position-cell" data-i="${i}"></button>`).join('')}</div></div>`;
    s.querySelectorAll('button').forEach(b=>b.onclick=()=>finish(Number(b.dataset.i)===target?100:0,Number(b.dataset.i)===target))
  },2600)
}
function numberGame(s){
  const num=String(Math.floor(10000+Math.random()*90000));currentAnswer=[num];
  revealThenAsk(s,'7️⃣ 숫자 기억하기',[num],2600,()=>{
    s.innerHTML=`<div class="game-panel"><span class="game-kicker">숫자 입력하기</span><h3>아까 본 숫자를 입력해보세요!</h3><input id="numInput" class="number-input" inputmode="numeric" maxlength="5" autocomplete="off"><br><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;
    const input=document.getElementById('numInput');input.focus();
    const submit=()=>{const v=input.value.trim();let correct=0;[...num].forEach((x,i)=>{if(v[i]===x)correct++});finish(correct*20,v===num)};
    s.querySelector('#submitAnswer').onclick=submit;input.onkeydown=e=>{if(e.key==='Enter')submit()}
  })
}
function celebrate(){
  const wrap=document.createElement('div');wrap.className='celebrate';
  const bits=['🎉','⭐','✨','💛','🎊','🌟'];
  for(let i=0;i<16;i++){const c=document.createElement('span');c.className='confetti';c.textContent=bits[i%bits.length];c.style.left=(Math.random()*96)+'%';c.style.animationDelay=(Math.random()*.35)+'s';wrap.appendChild(c)}
  stage().appendChild(wrap);setTimeout(()=>wrap.remove(),1700)
}
function finish(score,perfect){
  const id=activePlayer;state.scores[id]=(state.scores[id]||0)+score;state.best[id]=Math.max(state.best[id]||0,state.scores[id]);state.plays[id]=(state.plays[id]||0)+1;state.streak[id]=Math.max(1,state.streak[id]||0);
  const badges=new Set(state.badges[id]||[]);badges.add('first');if(perfect)badges.add('perfect');if(state.scores[id]>=100)badges.add('hundred');if(state.plays[id]>=5)badges.add('five');if(state.plays[id]>=10&&state.scores[id]>=500)badges.add('master');state.badges[id]=[...badges];saveState();renderStats();renderBadges();
  stage().innerHTML=`<div class="game-panel perfect-card"><div class="result-icon">${perfect?'🎉':'💪'}</div><h3>${perfect?'딩동댕! 퍼펙트!':'좋아요! 끝까지 도전했어요!'}</h3><div class="score-pop">+${score}점</div><p>${player().name}, 기억을 꺼내보는 연습을 아주 잘했어요.</p><button class="primary-btn" onclick="startGame('${currentGame}')">한 번 더 도전</button></div>`;
  if(perfect)celebrate();toast(`+${score}점! ${player().name} 최고!`)
}

document.getElementById('randomBtn').onclick=()=>startGame(games[Math.floor(Math.random()*games.length)].id);
document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
renderAll();
