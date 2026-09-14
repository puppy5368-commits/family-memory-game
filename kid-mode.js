// 태평(5세) 전용 난이도 조절. 다른 가족의 기존 난이도는 그대로 유지합니다.
(function(){
  const originalPictureGame = window.pictureGame;
  const originalWordGame = window.wordGame;
  const originalOrderGame = window.orderGame;

  function kidMultiChoice(s, answer, pool, title, icon){
    const distractors = sample(pool.filter(x=>!answer.includes(x)), 2);
    const opts = shuffle([...answer, ...distractors]);
    selected=[];
    s.innerHTML=`<div class="game-panel"><span class="game-kicker">🐣 태평이 쉬운 단계</span><h3>${icon} ${title}</h3><p>아까 본 것 <strong>${answer.length}개</strong>를 골라보자!</p><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;
    s.querySelectorAll('.answer-grid button').forEach(b=>b.onclick=()=>{
      b.classList.toggle('selected');
      const v=b.dataset.v;
      selected=selected.includes(v)?selected.filter(x=>x!==v):[...selected,v];
    });
    s.querySelector('#submitAnswer').onclick=()=>{
      const correct=selected.filter(x=>answer.includes(x)).length;
      const wrong=selected.filter(x=>!answer.includes(x)).length;
      const score=Math.max(0,Math.round((correct-wrong)/answer.length*100));
      finish(score,correct===answer.length&&wrong===0);
    };
  }

  window.pictureGame=function(s){
    if(activePlayer!=='taepyeong') return originalPictureGame(s);
    currentAnswer=sample(picturePool,3);
    revealThenAsk(s,'🖼️ 태평이 그림 기억하기',currentAnswer,4000,()=>kidMultiChoice(s,currentAnswer,picturePool,'어떤 그림을 봤지?','🖼️'));
  };

  window.wordGame=function(s){
    if(activePlayer!=='taepyeong') return originalWordGame(s);
    currentAnswer=sample(wordPool,3);
    revealThenAsk(s,'📘 태평이 단어 기억하기',currentAnswer,4300,()=>kidMultiChoice(s,currentAnswer,wordPool,'어떤 단어를 봤지?','📘'),true);
  };

  window.orderGame=function(s){
    if(activePlayer!=='taepyeong') return originalOrderGame(s);
    currentAnswer=sample(['1','2','3','4','5','6'],3);
    revealThenAsk(s,'🔢 태평이 순서 기억하기',currentAnswer,3800,()=>{
      const opts=shuffle(currentAnswer);selected=[];
      s.innerHTML=`<div class="game-panel"><span class="game-kicker">🐣 태평이 쉬운 단계</span><h3>숫자 3개를 같은 순서로 눌러보자!</h3><div class="answer-grid">${opts.map(x=>`<button data-v="${x}">${x}</button>`).join('')}</div><p id="picked">선택: -</p><button class="primary-btn" id="submitAnswer">정답 확인</button></div>`;
      s.querySelectorAll('.answer-grid button').forEach(b=>b.onclick=()=>{if(selected.length<3){selected.push(b.dataset.v);document.getElementById('picked').textContent='선택: '+selected.join(' → ')}});
      s.querySelector('#submitAnswer').onclick=()=>{let correct=0;selected.forEach((x,i)=>{if(x===currentAnswer[i])correct++});finish(Math.round(correct/3*100),correct===3)};
    });
  };
})();