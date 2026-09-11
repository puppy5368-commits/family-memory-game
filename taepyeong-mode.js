// 태평이(5세) 전용 3x3 메모리 모드
players.push({id:'taepyeong',name:'태평',emoji:'👦'});
['scores','best','streak','plays'].forEach(k=>{if(state[k].taepyeong==null) state[k].taepyeong=0;});
if(!state.badges.taepyeong) state.badges.taepyeong=[];

const originalMemoryGame=memoryGame;
memoryGame=function(s){
  if(activePlayer!=='taepyeong') return originalMemoryGame(s);

  const pairIcons=sample(picturePool,4);
  const cards=[...pairIcons,...pairIcons].map(icon=>({icon,matched:false,bonus:false}));
  cards.push({icon:'⭐',matched:false,bonus:true});
  const deck=shuffle(cards).map((card,i)=>({...card,id:i}));
  let first=null,second=null,locked=false,matches=0,moves=0,bonusFound=false;

  s.innerHTML=`<div class="game-panel memory-panel taepyeong-memory"><span class="game-kicker">🐻 태평이 메모리 게임</span><h3>같은 그림 두 장을 찾아보자! 😊</h3><div class="memory-status"><span>찾은 짝 <strong id="matchCount">0 / 4</strong></span><span>시도 <strong id="moveCount">0회</strong></span></div><div class="match-grid taepyeong-grid" id="matchGrid"></div><p class="subtle">⭐ 보너스 카드를 찾으면 행운의 별!</p></div>`;
  const grid=document.getElementById('matchGrid');

  deck.forEach(card=>{
    const b=document.createElement('button');
    b.className='match-card'; b.dataset.id=card.id; b.setAttribute('aria-label','뒤집힌 메모리 카드');
    b.innerHTML=`<span class="card-inner"><span class="card-back">★</span><span class="card-front">${card.icon}</span></span>`;
    b.onclick=()=>flip(card,b); grid.appendChild(b);
  });

  function flip(card,button){
    if(locked||card.matched||button.classList.contains('flipped')||second)return;
    button.classList.add('flipped');
    if(card.bonus){
      card.matched=true; bonusFound=true; button.classList.add('matched','bonus-card');
      toast('와! 행운의 별이다! ⭐');
      checkDone(); return;
    }
    if(!first){first={card,button};return;}
    second={card,button}; moves++; document.getElementById('moveCount').textContent=moves+'회'; locked=true;
    if(first.card.icon===second.card.icon){
      first.card.matched=true; second.card.matched=true;
      first.button.classList.add('matched'); second.button.classList.add('matched');
      matches++; document.getElementById('matchCount').textContent=matches+' / 4';
      setTimeout(()=>{first=null;second=null;locked=false;checkDone();},430);
    }else{
      setTimeout(()=>{first.button.classList.remove('flipped');second.button.classList.remove('flipped');first=null;second=null;locked=false;},850);
    }
  }
  function checkDone(){
    if(matches===4&&bonusFound){
      const score=Math.max(50,100-Math.max(0,moves-4)*5);
      setTimeout(()=>finish(score,moves<=7),450);
    }
  }
};

// 태평이 선택 시 4번 게임 설명도 어린이 버전으로 표시
const originalRenderGames=renderGames;
renderGames=function(){
  originalRenderGames();
  if(activePlayer==='taepyeong'){
    const cards=document.querySelectorAll('.game-card');
    if(cards[3]){
      cards[3].querySelector('h4').textContent='4. 태평이 메모리 게임';
      cards[3].querySelector('p').textContent='3×3 카드에서 같은 그림 4쌍을 찾아요! ⭐도 숨어 있어요.';
    }
  }
};

renderAll();