/* ============ DZEN · Энергия — версия с ползунками (тема задаётся страницей) ============ */
'use strict';
var T=window.DZEN_THEME; // {id, hero, ticker, tag}
var A=window.DZEN_ASSETS;

document.getElementById('app').innerHTML=
'<section class="scr scr-cinema" id="scr-hero">'+
' <div class="cinefade" data-img-a="'+A+'img/'+T.hero+'.jpg" data-img-b="'+A+'img/'+T.hero+'_b.jpg"></div>'+
' <div class="cine-veil"></div>'+
' <div class="cine-content">'+
'  <div class="brandline">DZEN · Энергия</div>'+
'  <h1 class="display">Насколько ты<br><em>в ресурсе?</em></h1>'+
'  <div class="ticker">'+T.ticker+'</div>'+
'  <p class="cine-sub">Мир давит, а жить хочется в радость — и долго. Замерь заряд: 6 ползунков, 90 секунд. Дальше — 30 секунд в день.</p>'+
'  <button class="btn btn-pri" id="btn-start">Замерить энергию</button>'+
'  <div class="tiny center" style="opacity:.7">без регистрации · всё хранится только у тебя</div>'+
' </div></section>'+

'<section class="scr" id="scr-quiz">'+
' <div class="quiz-top"><div class="quiz-progress" id="quiz-progress"></div>'+
' <button class="quiz-back" id="quiz-back" aria-label="Назад">←</button></div>'+
' <div class="quiz-body" id="quiz-body"></div></section>'+

'<section class="scr scr-center" id="scr-calc">'+
' <div class="can-viz" id="calc-can"></div><h2 id="calc-word">Считаем…</h2>'+
' <p class="sub" id="calc-line">Сверяем с внутренней бухгалтерией</p></section>'+

'<section class="scr" id="scr-result"><div class="pad">'+
' <div class="eyebrow">Твой индекс ресурса</div>'+
(T.id==='nf'?'<div class="nf-badge">Сегодня в твоём топе</div>':'')+
' <div class="bignum" id="res-num">0</div>'+
' <div class="res-scaleline"><div class="res-dot" id="res-dot"></div></div>'+
' <h2 id="res-verdict"></h2><p class="sub" id="res-sub"></p>'+
' <div class="factors" id="res-factors"></div>'+
' <div class="leak-card" id="res-leak"></div>'+
' <button class="btn btn-pri" id="btn-to-shelf">Выбрать один фокус</button>'+
' <div class="tiny center">не всё сразу — одна привычка на 7 дней</div></div></section>'+

'<section class="scr" id="scr-shelf">'+
' <div class="pad" style="padding-bottom:8px"><div class="eyebrow">Сезон 1 · 7 серий</div>'+
' <h2>Выбери <em class="serif" style="font-style:italic">одну</em> привычку</h2>'+
' <p class="sub">Одна привычка — как один сериал: смотрят по одному. День = серия по 30 секунд.</p></div>'+
' <div class="shelf" id="shelf"></div>'+
' <div class="shelf-hint" id="shelf-hint"></div>'+
' <div class="pad" style="padding-top:6px"><button class="btn btn-pri" id="btn-pick" disabled>Запустить сезон</button></div></section>'+

'<section class="scr" id="scr-plan"><div class="pad">'+
' <div class="eyebrow">Сезон запущен</div><h2 id="plan-title"></h2>'+
' <p class="sub">Серия 1 — сегодня вечером. Три ползунка, и день засчитан. Сорвался — тоже данные, без самобичевания.</p>'+
' <div class="card">'+
'  <div style="display:flex;gap:12px"><span style="font-size:22px">⏰</span><div><b>Напоминание</b><div class="small">каждый вечер, чтобы серия не сорвалась</div></div></div>'+
'  <div class="remind-time"><label class="small" for="remind-time">Время замера</label><input type="time" id="remind-time" value="21:30"></div>'+
'  <button class="btn btn-sec" id="btn-tg-remind">Напоминание в Telegram</button>'+
'  <button class="btn btn-sec" id="btn-ics">Добавить в календарь</button></div>'+
' <button class="btn btn-pri" id="btn-plan-done">Понял, до вечера</button></div></section>'+

'<section class="scr" id="scr-check"><div class="pad">'+
' <div class="eyebrow" id="check-eyebrow"></div><h2>Замер дня</h2>'+
' <p class="sub">Три ползунка. Тридцать секунд. Честно.</p>'+
' <button class="voice-btn" id="btn-voice" hidden><span>🎙</span> Наговори голосом — ползунки встанут сами</button>'+
' <div class="voice-line small" id="voice-line" hidden></div>'+
' <div id="check-sliders"></div>'+
' <button class="btn btn-pri" id="btn-check-done">День засчитан</button></div></section>'+

'<section class="scr scr-center" id="scr-dayres">'+
' <div class="dayres-emoji" id="dayres-emoji">⚡</div><h2 id="dayres-title"></h2>'+
' <p class="sub center pad-h" id="dayres-sub"></p><div class="streak-pill" id="dayres-streak"></div>'+
' <button class="btn btn-pri" style="width:auto;padding:17px 44px" id="btn-dayres-home">К прогрессу</button></section>'+

'<section class="scr" id="scr-home">'+
' <div class="home-hero"><div class="cinefade" data-img-a="'+A+'img/'+T.hero+'.jpg" data-img-b="'+A+'img/'+T.hero+'_b.jpg"></div>'+
' <div class="cine-veil"></div><div class="home-hero-content">'+
'  <div class="brandline">DZEN · Энергия</div><div class="home-season" id="home-season"></div>'+
'  <div class="ring-wrap"><svg id="ring" viewBox="0 0 120 120"></svg>'+
'  <div class="ring-center"><div class="ring-num" id="ring-num">0</div><div class="ring-label">из 7 серий</div></div></div></div></div>'+
' <div class="pad">'+
'  <button class="btn btn-pri" id="btn-go-check">Замерить день · 30 сек</button>'+
'  <div class="tiny center" id="home-checked"></div>'+
'  <div class="card"><div class="card-title">Энергия по дням</div><svg id="spark" viewBox="0 0 300 90" preserveAspectRatio="none"></svg>'+
'   <div class="spark-legend tiny" id="spark-legend"></div></div>'+
'  <div class="card" id="insight-card" hidden><div class="card-title">Находка</div><p id="insight-text" style="font-size:15px"></p></div>'+
'  <div class="card"><div class="card-title">Ачивки</div><div class="achv-row" id="achv-row"></div></div>'+
'  <div class="card" id="habit-card"></div>'+
'  <div class="dzen-banner"><img src="'+A+'img/poster_drink.jpg" alt="">'+
'   <div><div class="dzen-banner-title">Энергия любит пузырьки</div>'+
'   <p class="small">DZEN — газировка без сахара, с клетчаткой для микробиоты. Польза, которую не надо терпеть. Ищи в Додо Пицце.</p></div></div>'+
'  <div class="home-foot tiny"><a href="#" id="btn-demo">демо: через неделю</a><a href="#" id="btn-ai">ИИ для голоса</a><a href="../" id="btn-hub">другие версии</a><a href="#" id="btn-reset">заново</a></div>'+
' </div></section>'+

'<section class="scr scr-center" id="scr-achieve"><canvas id="confetti"></canvas>'+
' <div class="achieve-wrap"><div class="eyebrow">Финал сезона</div>'+
'  <canvas id="share-card" width="1080" height="1350"></canvas>'+
'  <p class="sub center">Ты правда красавчик. Такое не стыдно показать.</p>'+
'  <div class="share-row"><button class="btn btn-pri" id="btn-share-tg">Поделиться в Telegram</button>'+
'  <button class="btn btn-sec" id="btn-share-save">Скачать картинку</button>'+
'  <button class="btn btn-sec" id="btn-achieve-next" hidden>Сезон 2 · добавить привычку</button>'+
'  <button class="btn btn-ghost" id="btn-achieve-home">К прогрессу</button></div></div></section>'+

'<div class="sheet" id="sheet-tg"><div class="sheet-card"><div class="sheet-grab"></div>'+
' <h3>Напоминание в Telegram</h3>'+
' <p class="small">У нас есть бот <b>@dzen_energy_bot</b>. Жми кнопку, в боте нажми «Старт» — и каждый вечер в выбранное время придёт напоминание. 7 серий, потом бот сам поздравит с финалом.</p>'+
' <button class="btn btn-pri" id="btn-tg-open">Открыть бота</button>'+
' <button class="btn btn-ghost sheet-close">Закрыть</button></div></div>'+

'<div class="sheet" id="sheet-ai"><div class="sheet-card"><div class="sheet-grab"></div>'+
' <h3>Нейронка для голоса</h3>'+
' <p class="small">Голос → текст работает в самом телефоне. Нейронка раскладывает сказанное по ползункам. Без ключа — простой разбор по словам.</p>'+
' <select id="ai-provider"><option value="local">Без нейронки (по словам)</option><option value="groq">Groq (Llama)</option><option value="claude">Claude (Anthropic)</option></select>'+
' <input type="password" id="ai-key" placeholder="Ключ API (хранится только у тебя)" autocomplete="off">'+
' <button class="btn btn-pri" id="btn-ai-save">Сохранить</button>'+
' <button class="btn btn-ghost sheet-close">Закрыть</button></div></div>';

/* ---------- навигация ---------- */
function show(id){$$('.scr').forEach(function(s){s.classList.remove('on');});
  var el=$('#'+id);if(el){el.classList.add('on');window.scrollTo(0,0);}}
function route(){
  if(!S.quiz){show('scr-hero');return;}
  if(!S.habits.length){renderShelf(false);show('scr-shelf');return;}
  renderHome();show('scr-home');}

/* ---------- компонент ползунка ---------- */
function slider(o){var w=document.createElement('div');
  w.innerHTML=(o.canViz?'<div class="can-viz"></div>':'')+
   '<div class="sld"><div class="sld-track"><div class="sld-fill"></div></div>'+
   '<input type="range" min="0" max="'+o.max+'" step="1" value="'+(o.value||0)+'" aria-label="ползунок"></div>'+
   (o.ends?'<div class="sld-ends"><span>'+o.ends[0]+'</span><span>'+o.ends[1]+'</span></div>':'');
  var inp=w.querySelector('input'),sld=w.querySelector('.sld'),viz=w.querySelector('.can-viz');
  function paint(){var v=+inp.value,p=v/o.max*100;sld.style.setProperty('--fill',p+'%');
    if(viz)viz.innerHTML=canSVG(p);if(o.onInput)o.onInput(v);}
  inp.addEventListener('input',function(){paint();if((+inp.value)%Math.max(1,Math.round(o.max/10))===0)tick();});
  paint();
  w.getValue=function(){return +inp.value;};
  w.setValue=function(v){inp.value=Math.max(0,Math.min(o.max,Math.round(v)));paint();};
  return w;}

/* ---------- квиз ---------- */
var QUESTIONS=[
 {id:'energy',max:100,title:'Какой у тебя сейчас уровень энергии?',ends:['на нуле','фонтан'],canViz:true,
  expl:'<b>Что это?</b> Твой внутренний заряд прямо сейчас: хочется ли что-то делать, ясная ли голова — или всё через силу. Первое ощущение — самое честное.',
  words:energyWord},
 {id:'sleep',max:7,title:'Сколько ночей за неделю ты лёг до 23:00?',ends:['0','все 7'],
  words:function(v){return v+' из 7 — '+(v<=1?'сова со стажем':v<=3?'бывает':v<=5?'уже неплохо':'режим железный');}},
 {id:'sugar',max:7,title:'Сколько дней прошло без сладкого?',ends:['0','все 7'],
  words:function(v){return v+' из 7 — '+(v<=1?'печенье побеждает':v<=3?'борьба идёт':v<=5?'сахар отступает':'кремень');}},
 {id:'screen',max:7,title:'Сколько вечеров ты залипал в телефоне перед сном?',ends:['ни одного','каждый'],
  words:function(v){return v+' из 7 — '+(v<=1?'вечер твой':v<=3?'лента подъедает':v<=5?'лента почти выиграла':'телефон живёт твою жизнь');}},
 {id:'move',max:7,title:'Сколько дней было хотя бы 20 минут движения?',ends:['0','все 7'],
  words:function(v){return v+' из 7 — '+(v<=1?'диван доволен':v<=3?'начало есть':v<=5?'тело радуется':'машина');}},
 {id:'stress',max:100,title:'Насколько тебя штормит от внешнего мира?',ends:['штиль','шторм'],
  expl:'<b>Про что это?</b> Курс валют, ставка ЦБ, новости, дедлайны — внешний стресс списывает заряд, как подписка, которую ты не оформлял.',
  words:function(v){return v<15?'почти штиль':v<35?'фоновая рябь':v<60?'заметно качает':v<85?'штормит всерьёз':'девятый вал';}}];
var qIdx=0,qAns={};
function renderQP(){var h='';for(var i=0;i<QUESTIONS.length;i++)h+='<i class="'+(i<=qIdx?'done':'')+'"></i>';
  $('#quiz-progress').innerHTML=h;}
function renderQ(){var q=QUESTIONS[qIdx],b=$('#quiz-body');b.innerHTML='';
  var el=document.createElement('div');el.className='q';
  el.innerHTML='<div class="q-num">ВОПРОС '+(qIdx+1)+' / '+QUESTIONS.length+'</div><h2>'+q.title+'</h2>'+
   (q.expl?'<details class="q-expl"><summary>что это значит</summary><div style="margin-top:8px">'+q.expl+'</div></details>':'')+
   '<div class="q-mid"><div class="q-value" '+(q.canViz?'hidden':'')+'>0</div><div class="q-word"></div><div class="q-sld"></div></div>'+
   '<div class="q-foot"><button class="btn btn-pri q-next">Дальше</button></div>';
  var val=el.querySelector('.q-value'),word=el.querySelector('.q-word');
  var s=slider({max:q.max,value:qAns[q.id]||0,ends:q.ends,canViz:q.canViz,
    onInput:function(v){val.textContent=v;word.textContent=q.words(v);}});
  el.querySelector('.q-sld').appendChild(s);
  el.querySelector('.q-next').addEventListener('click',function(){
    qAns[q.id]=s.getValue();qIdx++;
    if(qIdx>=QUESTIONS.length)finishQuiz();else{renderQP();renderQ();}});
  b.appendChild(el);renderQP();}
$('#quiz-back').addEventListener('click',function(){
  if(qIdx===0){show('scr-hero');return;}qIdx--;renderQP();renderQ();});
function finishQuiz(){
  S.quiz={a:qAns,index:calcIndex(qAns),date:todayStr()};save();
  show('scr-calc');$('#calc-can').innerHTML=canSVG(8);
  var lines=['Сверяем с внутренней бухгалтерией…','Учитываем курс, ставку и печенье…','Отделяем усталость от лени… её нет','Готово.'];
  var i=0,iv=setInterval(function(){i++;
    if(i<lines.length){$('#calc-line').textContent=lines[i];$('#calc-can').innerHTML=canSVG(8+i*25);}
    else{clearInterval(iv);pshh();renderResult();show('scr-result');}},850);}
function renderResult(){
  var idx=S.quiz.index,v=verdict(idx);
  $('#res-verdict').textContent=v[0];$('#res-sub').textContent=v[1];
  var n=0,ne=$('#res-num');
  var iv=setInterval(function(){n+=Math.max(1,Math.round(idx/30));if(n>=idx){n=idx;clearInterval(iv);}ne.textContent=n;},40);
  setTimeout(function(){$('#res-dot').style.left=idx+'%';},100);
  var fs=factors(S.quiz.a),mf=fs[0];fs.forEach(function(f){if(f.v<mf.v)mf=f;});
  var fh='';fs.forEach(function(f){fh+='<div class="factor'+(f===mf?' low':'')+'"><span>'+f.name+'</span>'+
   '<div class="fbar"><i data-w="'+f.v+'"></i></div><span class="fval">'+f.v+'</span></div>';});
  $('#res-factors').innerHTML=fh;
  setTimeout(function(){$$('#res-factors .fbar i').forEach(function(b){b.style.width=b.dataset.w+'%';});},150);
  var rec=habit(LEAK2HABIT[mf.id]);
  $('#res-leak').innerHTML='Больше всего энергии утекает здесь: <b>'+mf.name.toLowerCase()+'</b>. Самый выгодный первый ход — «'+rec.title+'». '+rec.why;
  S.recommend=rec.id;save();}
$('#btn-to-shelf').addEventListener('click',function(){renderShelf(false);show('scr-shelf');});

/* ---------- полка ---------- */
var shelfSel=null,shelfAdd=false;
function renderShelf(add){shelfAdd=!!add;shelfSel=null;
  var used=S.habits.map(function(h){return h.id;});
  var sh=$('#shelf');sh.innerHTML='';
  HABITS.forEach(function(h){
    if(shelfAdd&&used.indexOf(h.id)>=0)return;
    var b=document.createElement('button');b.className='poster';b.dataset.id=h.id;
    var badge=(!shelfAdd&&h.id===S.recommend)?'<div class="poster-badge">⚡ твой лучший ход</div>':'';
    b.innerHTML='<img src="'+A+'img/'+h.img+'.jpg" alt="" loading="lazy"><div class="poster-veil"></div>'+badge+
     '<div class="poster-check">✓</div><div class="poster-txt"><div class="poster-title">'+h.title+'</div>'+
     '<div class="poster-line">'+h.line+'</div></div>';
    b.addEventListener('click',function(){shelfSel=h.id;tick();
      $$('.poster').forEach(function(p){p.classList.toggle('sel',p.dataset.id===h.id);});
      $('#shelf-hint').innerHTML='<b>'+h.title+'</b> · '+h.why;$('#btn-pick').disabled=false;});
    sh.appendChild(b);});
  $('#shelf-hint').textContent=shelfAdd?'Сезон 2: добавь вторую привычку.':'Листай полку — как каталог сериалов.';
  $('#btn-pick').disabled=true;
  $('#btn-pick').textContent=shelfAdd?'Добавить в сезон':'Запустить сезон';}
$('#btn-pick').addEventListener('click',function(){
  if(!shelfSel)return;
  S.habits.push({id:shelfSel,start:todayStr()});
  if(shelfAdd&&!S.achv.spin)S.achv.spin=todayStr();
  save();pshh();
  $('#plan-title').innerHTML='«'+habit(shelfSel).title+'» · <span class="serif" style="font-style:italic">7 серий</span>';
  show('scr-plan');});

/* ---------- план ---------- */
$('#btn-plan-done').addEventListener('click',route);
$('#btn-tg-remind').addEventListener('click',function(){$('#sheet-tg').classList.add('on');});
$('#btn-tg-open').addEventListener('click',function(){
  S.remind=$('#remind-time').value||'21:30';save();openBot();});
$('#btn-ics').addEventListener('click',function(){S.remind=$('#remind-time').value||'21:30';save();downloadICS();});
$$('.sheet-close').forEach(function(b){b.addEventListener('click',function(){this.closest('.sheet').classList.remove('on');});});
$$('.sheet').forEach(function(s){s.addEventListener('click',function(e){if(e.target===s)s.classList.remove('on');});});

/* ---------- замер дня ---------- */
var CS={};
function renderCheck(){
  var box=$('#check-sliders');box.innerHTML='';CS={};
  var vl=$('#voice-line');vl.hidden=true;vl.textContent='';
  $('#check-eyebrow').textContent='Серия '+Math.min((S.streak%7)+1,7)+' из 7 · сезон '+(Math.floor(S.streak/7)+1);
  function block(qt,opts,key){var b=document.createElement('div');b.className='check-block';
    b.innerHTML='<div class="check-q">'+qt+'</div><div class="check-word"></div>';
    var w=b.querySelector('.check-word');opts.onInput=function(v){w.textContent=opts.words(v);};
    var s=slider(opts);b.appendChild(s);box.appendChild(b);CS[key]=s;}
  block('Сколько сегодня энергии?',{max:100,ends:['на нуле','фонтан'],canViz:true,words:energyWord},'energy');
  S.habits.forEach(function(hs,i){block(habit(hs.id).daily,{max:100,ends:['нет, сорвался','да, чисто'],
    words:function(v){return v<20?'не вышло — бывает':v<50?'наполовину':v<80?'почти чисто':'чисто';}},'kept_'+i);});
  block('Насколько тяжело далось?',{max:100,ends:['легко','на зубах'],
    words:function(v){return v<20?'само получилось':v<50?'с усилием':v<80?'пришлось бороться':'подвиг, честно';}},'hard');}
$('#btn-go-check').addEventListener('click',function(){
  if(S.lastCheck===todayStr()){show('scr-home');return;}renderCheck();show('scr-check');});
$('#btn-check-done').addEventListener('click',function(){
  var kept=[];S.habits.forEach(function(h,i){kept.push(CS['kept_'+i].getValue());});
  var rec={energy:CS.energy.getValue(),kept:kept,hard:CS.hard.getValue()};
  var out=checkInDay(rec);pshh();
  if(out.finale){renderAchieve(out.finale);show('scr-achieve');return;}
  var dv=dayVerdict(rec);
  $('#dayres-emoji').textContent=dv.em;$('#dayres-title').textContent=dv.ti;$('#dayres-sub').textContent=dv.su;
  $('#dayres-streak').textContent='🔥 Серия: '+S.streak+' '+plural(S.streak,'день','дня','дней');
  show('scr-dayres');});
$('#btn-dayres-home').addEventListener('click',route);

/* голос */
function applyVoice(res,tr){
  var line=$('#voice-line');line.hidden=false;var parts=[];
  if(res.energy!=null&&CS.energy){CS.energy.setValue(res.energy);parts.push('энергия '+Math.round(res.energy));}
  if(res.kept!=null){S.habits.forEach(function(h,i){if(CS['kept_'+i])CS['kept_'+i].setValue(res.kept);});parts.push('привычка '+Math.round(res.kept));}
  if(res.hard!=null&&CS.hard){CS.hard.setValue(res.hard);parts.push('сложность '+Math.round(res.hard));}
  line.textContent=parts.length?('Понял так: '+parts.join(' · ')+'. Поправь ползунком, если не так.')
   :('«'+tr+'» — не понял значений. Скажи: «энергия 70, держался, далось легко».');
  if(parts.length)pshh();}
window.dzenVoiceApply=function(t){aiParse(t,function(r){applyVoice(r||localParse(t),t);});};
(function(){var btn=$('#btn-voice');
  var R=makeRecognizer(function(text){$('#voice-line').hidden=false;
      $('#voice-line').textContent='«'+text+'» — думаю…';
      aiParse(text,function(r){applyVoice(r,text);});},
    function(on){btn.classList.toggle('listening',on);
      btn.innerHTML=on?'<span>🔴</span> Слушаю… говори (тап — стоп)':'<span>🎙</span> Наговори голосом — ползунки встанут сами';
      if(on){var l=$('#voice-line');l.hidden=false;l.textContent='Например: «энергия 70, сладкое не ел, далось тяжело»';}},
    function(n){var l=$('#voice-line');l.hidden=false;
      l.textContent=n==='thinking'?'Распознаю голос…':(n||'');});
  if(!R){btn.hidden=true;return;}
  btn.hidden=false;btn.addEventListener('click',function(){ac();R.toggle();});})();

/* ---------- дом ---------- */
function renderHome(){initCinefades();
  var season=Math.floor((Math.max(S.streak,1)-1)/7)+1;
  var day=S.streak===0?0:((S.streak-1)%7)+1;
  $('#home-season').textContent='Сезон '+season+(day?' · серия '+day:'');
  $('#ring-num').textContent=day;
  var R2=52,C=2*Math.PI*R2;
  $('#ring').innerHTML='<circle cx="60" cy="60" r="'+R2+'" fill="none" stroke="rgba(244,241,234,.25)" stroke-width="9"/>'+
   '<circle cx="60" cy="60" r="'+R2+'" fill="none" stroke="#A8C96B" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-day/7))+'" style="transition:stroke-dashoffset 1.2s cubic-bezier(.22,.9,.3,1)"/>';
  var ch=S.lastCheck===todayStr();
  $('#btn-go-check').textContent=ch?'Сегодня уже засчитано ✓':'Замерить день · 30 сек';
  $('#home-checked').textContent=ch?'Серия в безопасности. Возвращайся завтра.':'';
  renderSpark();
  var ins=bestInsight();$('#insight-card').hidden=!ins;if(ins)$('#insight-text').textContent=ins;
  var ah='';ACHV.forEach(function(a){ah+='<div class="achv'+(S.achv[a.id]?'':' locked')+'"><div class="a-ic">'+a.ic+'</div><div class="a-t">'+a.t+'</div></div>';});
  $('#achv-row').innerHTML=ah;
  renderHabitCard();}
function renderSpark(){var svg=$('#spark'),pts=[];
  for(var i=13;i>=0;i--){var d=addDays(todayStr(),-i),r=S.days[d];pts.push(r?r.energy:null);}
  if(!pts.some(function(p){return p!==null;})){
    svg.innerHTML='<text x="150" y="50" text-anchor="middle" font-size="12" fill="#8a857a" font-family="Inter,sans-serif">Первый замер появится здесь сегодня вечером</text>';
    $('#spark-legend').innerHTML='';return;}
  var path='',dots='';
  pts.forEach(function(p,i){if(p===null)return;var x=10+i*(280/13),y=80-(p/100)*68;
    path+=(path?' L':'M')+x.toFixed(1)+' '+y.toFixed(1);
    dots+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.4" fill="#A8C96B"/>';});
  svg.innerHTML='<path d="'+path+'" fill="none" stroke="#A8C96B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>'+dots;
  $('#spark-legend').innerHTML='<span>2 недели назад</span><span>сегодня</span>';}
function renderHabitCard(){var c=$('#habit-card');
  var h='<div class="card-title">Твой фокус</div>';
  S.habits.forEach(function(hs){var hb=habit(hs.id);
    h+='<div class="h-title">'+hb.title+'</div><div class="small">с '+hs.start.split('-').reverse().join('.')+' · '+hb.why+'</div>';});
  h+='<div class="h-actions">';
  if(S.achv.d7&&S.habits.length<2)h+='<button class="btn btn-sec" id="btn-add-habit">Добавить вторую привычку</button>';
  if(S.habits.length&&daysBetween(S.habits[0].start,todayStr())>=30)h+='<button class="btn btn-sec" id="btn-swap-habit">Заменить привычку — она уже твоя</button>';
  h+='<button class="btn btn-ghost" id="btn-remind-again">Настроить напоминание</button></div>';
  c.innerHTML=h;
  var ad=$('#btn-add-habit');if(ad)ad.addEventListener('click',function(){renderShelf(true);show('scr-shelf');});
  var sw=$('#btn-swap-habit');if(sw)sw.addEventListener('click',function(){S.habits.shift();save();renderShelf(S.habits.length>0);show('scr-shelf');});
  $('#btn-remind-again').addEventListener('click',function(){
    $('#plan-title').innerHTML='«'+habit(S.habits[0].id).title+'»';show('scr-plan');});}

/* ---------- финал ---------- */
function renderAchieve(days){startConfetti($('#confetti'));
  $('#btn-achieve-next').hidden=!(days===7&&S.habits.length<2);
  drawShareCard($('#share-card'),days);}
$('#btn-achieve-next').addEventListener('click',function(){renderShelf(true);show('scr-shelf');});
$('#btn-achieve-home').addEventListener('click',route);
$('#btn-share-save').addEventListener('click',function(){saveCard($('#share-card'));});
$('#btn-share-tg').addEventListener('click',function(){
  shareCard($('#share-card'),'🏆 Финал сезона: '+S.streak+' дней подряд — «'+habit(S.habits[0].id).title+'». Замерь свою энергию:');});

/* ---------- прочее ---------- */
$('#btn-ai').addEventListener('click',function(e){e.preventDefault();
  var c=aiConf();$('#ai-provider').value=c.provider;$('#ai-key').value=c.key||'';
  $('#sheet-ai').classList.add('on');});
$('#btn-ai-save').addEventListener('click',function(){
  localStorage.setItem(AIK,JSON.stringify({provider:$('#ai-provider').value,key:$('#ai-key').value.trim()}));
  $('#sheet-ai').classList.remove('on');tick();});
$('#btn-demo').addEventListener('click',function(e){e.preventDefault();
  if(S.demo){try{var bak=JSON.parse(localStorage.getItem(KEY+'.bak'));if(bak){S=bak;}}catch(err){}
    S.demo=false;save();route();$('#btn-demo').textContent='демо: через неделю';return;}
  try{localStorage.setItem(KEY+'.bak',JSON.stringify(S));}catch(err){}
  if(!S.quiz)S.quiz={a:{energy:34,sleep:2,sugar:1,screen:5,move:2,stress:70},index:38,date:todayStr()};
  if(!S.habits.length)S.habits=[{id:'sleep',start:addDays(todayStr(),-6)}];
  var t=todayStr(),demo=[38,45,41,55,60,58,72];
  for(var i=0;i<7;i++)S.days[addDays(t,-(6-i))]={energy:demo[i],kept:[i===2?30:80+i*2],hard:70-i*7};
  S.streak=7;S.best=7;S.lastCheck=t;S.achv.d1=S.achv.d1||t;S.achv.d3=S.achv.d3||t;S.achv.d7=S.achv.d7||t;
  S.demo=true;save();$('#btn-demo').textContent='вернуть как было';
  renderAchieve(7);show('scr-achieve');});
$('#btn-reset').addEventListener('click',function(e){e.preventDefault();
  if(confirm('Точно начать заново? История сотрётся.')){localStorage.removeItem(KEY);S=loadState();route();}});
$('#btn-start').addEventListener('click',function(){ac();qIdx=0;qAns={};renderQP();renderQ();show('scr-quiz');});

initCinefades();route();
