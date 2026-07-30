/* ============ DZEN · Энергия — чат-версия (тема задаётся страницей) ============ */
'use strict';
var T=window.DZEN_THEME,A=window.DZEN_ASSETS;
var MIC_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
 '<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/></svg>';
var STOP_SVG='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.5"/></svg>';

document.getElementById('app').innerHTML=
'<div class="chat-app">'+
' <div class="chat-head">'+
'  <img class="chat-ava" src="'+A+'img/mascot.jpg" alt="">'+
'  <div><div class="chat-head-name">Банка DZEN</div><div class="chat-head-st" id="head-st">онлайн · следит за энергией</div></div>'+
'  <div class="chat-head-btns">'+
'   <button class="chip-ic" id="hb-check" aria-label="Замер дня" title="Замер дня">⚡</button>'+
'   <button class="chip-ic" id="hb-sum" aria-label="Сводка недели" title="Сводка недели">◷</button>'+
'   <button class="chip-ic" id="hb-achv" aria-label="Ачивки" title="Ачивки">🏆</button>'+
'  </div></div>'+
' <div class="chat-scroll" id="scroll"></div>'+
' <div class="chat-input">'+
'  <button class="chat-btn chat-mic" id="mic" hidden aria-label="Наговорить голосом">'+MIC_SVG+'</button>'+
'  <input id="inp" type="text" placeholder="Скажи или напиши…" autocomplete="off">'+
'  <button class="chat-btn chat-send" id="send">↑</button>'+
' </div></div>';

var SCROLL=$('#scroll');
/* прокрутка вниз: сразу + после отрисовки/загрузки картинок (иначе полка прячется под полем ввода) */
function down(){
  SCROLL.scrollTop=SCROLL.scrollHeight;
  requestAnimationFrame(function(){SCROLL.scrollTop=SCROLL.scrollHeight;});
  setTimeout(function(){SCROLL.scrollTop=SCROLL.scrollHeight;},60);
  setTimeout(function(){SCROLL.scrollTop=SCROLL.scrollHeight;},320);
}
function el(html,cls){var d=document.createElement('div');if(cls)d.className=cls;d.innerHTML=html;SCROLL.appendChild(d);down();return d;}
function meMsg(t){el(t,'msg me');}
var typingEl=null;
function typing(on){if(on&&!typingEl){typingEl=el('<i></i><i></i><i></i>','typing');}
  else if(!on&&typingEl){typingEl.remove();typingEl=null;}}
function botMsg(t,cb){typing(true);
  setTimeout(function(){typing(false);el(t,'msg bot');if(cb)cb();},450+Math.min(900,t.length*6));}
function clearChips(){$$('.chips,.chat-shelf,.msg-slider').forEach(function(c){c.remove();});}
function chips(list){ // [{t, fn}]
  var c=document.createElement('div');c.className='chips';
  list.forEach(function(it){var b=document.createElement('button');b.className='chip';b.textContent=it.t;
    b.addEventListener('click',function(){tick();clearChips();it.fn();});c.appendChild(b);});
  SCROLL.appendChild(c);down();}

/* живая подпись под слайдером энергии — ТОЛЬКО для sliderMsg в чате, не трогает energyWord() из core.js */
function chatEnergyWord(v){
  return v<25?'🪫 я тень себя':v<50?'☕ живу на кофе':v<75?'🙂 норм, но не фонтан':'⚡ фонтан';}

/* слайдер в сообщении */
function sliderMsg(onDone){
  var d=document.createElement('div');d.className='msg-slider';
  d.innerHTML='<div class="can-viz"></div><div class="q-word"></div>'+
   '<div class="sld"><div class="sld-track"><div class="sld-fill"></div></div>'+
   '<input type="range" min="0" max="100" step="1" value="0"></div>'+
   '<button class="btn btn-pri" style="padding:12px">Готово</button>';
  var inp=d.querySelector('input'),sld=d.querySelector('.sld'),viz=d.querySelector('.can-viz'),w=d.querySelector('.q-word');
  function paint(){var v=+inp.value;sld.style.setProperty('--fill',v+'%');viz.innerHTML=canSVG(v);w.textContent=chatEnergyWord(v);}
  inp.addEventListener('input',function(){paint();if((+inp.value)%10===0)tick();});paint();
  d.querySelector('button').addEventListener('click',function(){var v=+inp.value;clearChips();onDone(v);});
  SCROLL.appendChild(d);down();}

/* ожидание ответа */
var pending=null; // {parse(text)->bool}
function expect(fn){pending=fn;}

/* ---------- отмена текущего шага: «Назад» ---------- */
function cancelBar(label,onBack){
  var old=$('#cancel-bar'); if(old)old.remove();
  var d=document.createElement('div');
  d.id='cancel-bar'; d.className='cancel-bar';
  d.innerHTML='<span>'+(label||'идёт замер дня')+'</span><button type="button">← Назад</button>';
  d.querySelector('button').addEventListener('click',function(){
    tick(); pending=null; clearChips(); d.remove();
    if(onBack)onBack(); else offerMain();});
  $('.chat-app').insertBefore(d,$('.chat-input'));}
function hideCancel(){var d=$('#cancel-bar'); if(d)d.remove();}
function handleText(text){
  meMsg(text);
  if(pending){var h=pending;pending=null;
    if(h(text))return; /* обработано */
    pending=h; /* не понял — остаёмся в вопросе, но ответим по-человечески */}
  botTalk(text);}
function botTalk(text){typing(true);
  chatAnswer(text,function(ans,closing){typing(false);el(ans,'msg bot');
    if(closing){closeTalk();return;}
    if(pending===null&&S.quiz&&S.habits.length)offerMain();});}
/* мягкое завершение разговора + крючок на завтра */
function closeTalk(){
  clearChips();
  setTimeout(function(){
    var checked=S.lastCheck===todayStr();
    chatReset();
    if(checked){
      el('Завтра вечером отметишься — спрошу, как зашло 🌿','msg bot');
      chips([{t:'🏆 Мои ачивки',fn:showAchv},{t:'⏰ Напоминание на вечер',fn:showRemind}]);}
    else{
      chips([{t:'⚡ Замерить день · 30 сек',fn:startCheck},{t:'⏰ Напомнить вечером',fn:showRemind}]);}
  },1100);}
function num0100(text){
  var t=wordsToNums(text.toLowerCase());
  var m=t.match(/\d{1,3}/);if(!m)return null;var n=+m[0];if(n>100)return null;
  /* ответ цифрой = число + немного слов-паразитов; длинный рассказ = разговор */
  var rest=t.replace(/\d+/g,' ')
    .replace(/(примерно|где\s?то|наверное|навскидку|около|думаю|может|быть|ну|типа|энерги\w*|сейчас|сегодня|вчера|процент\w*|балл\w*|уровень|день|дня|дней|ночи|ночей|раз|раза|у|меня|на|из|по|моему|штук|так|вот|где)/g,' ')
    .replace(/[^а-яёa-z]/g,'');
  return rest.length<=8?n:null;}

/* ---------- сценарии ---------- */
function greet(){
  var t=todayStr();
  if(!S.quiz){
    botMsg('Привет! Я банка DZEN 🥤 Слежу за твоей энергией, пока мир испытывает её на прочность: курс, ставка, новости…',function(){
    botMsg('Давай замерим, насколько ты в ресурсе. Это 5 вопросов, минута. Сколько сейчас энергии, 0–100?',function(){
      askEnergy(function(v){onbAns.energy=v;askSleep();});});});}
  else if(!S.habits.length){botMsg('Мы остановились на выборе привычки. Продолжим?',function(){showShelf();});}
  else if(S.lastCheck!==t){var d=Math.min((S.streak%7)+1,7);
    botMsg('С возвращением! Серия '+d+' из 7 ждёт замера — 30 секунд. Начнём?',function(){
      chips([{t:'⚡ Замерить день',fn:startCheck},{t:'Позже',fn:function(){botMsg('Ок, я тут. Кнопка ⚡ сверху — когда будешь готов.');}}]);});}
  else{botMsg('Сегодня уже засчитано. Вот как идёт сезон:',function(){
    summaryCard();
    setTimeout(function(){
      var ins=bestInsight();
      if(ins)botMsg(ins,offerMain);
      else botMsg('Спроси что угодно про энергию, сон или привычки — отвечу коротко и по делу.',offerMain);
    },900);});}
}
function offerMain(){clearChips();
  var done=S.lastCheck===todayStr();
  var list=done?[{t:'Сводка недели',fn:showSummary},{t:'Ачивки',fn:showAchv}]
               :[{t:'Замерить день',fn:startCheck},{t:'Сводка недели',fn:showSummary}];
  list.push({t:'Напоминание',fn:showRemind});
  chips(list);}

/* онбординг */
var onbAns={};
function askEnergy(done){
  sliderMsg(function(v){meMsg('Энергия: '+v);done(v);});
  expect(function(text){var n=num0100(text);if(n===null)return false;clearChips();done(n);return true;});}
function askSleep(){
  botMsg('Во сколько ты вчера реально уснул?',function(){
    var opts=[
      {t:'До 23',fn:function(){meMsg('До 23');onbAns.sleep=6;
        botMsg('Редкий зверь. Самый жирный кусок восстановления — до полуночи, и он у тебя есть.',askSugar);}},
      {t:'23–00',fn:function(){meMsg('23–00');onbAns.sleep=4;
        botMsg('Почти идеально. Сдвинешь на полчаса раньше — утро станет другим.',askSugar);}},
      {t:'После полуночи',fn:function(){meMsg('После полуночи');onbAns.sleep=2;
        botMsg('Сон после полуночи отдаёт меньше: главная фаза восстановления — в первую половину ночи.',askSugar);}},
      {t:'Не помню, листал ленту',fn:function(){meMsg('Не помню, листал ленту');onbAns.sleep=1;onbAns.screen=6;
        botMsg('Классика. Лента ворует не вечер — она ворует завтрашнее утро.',askSugar);}}
    ];
    chips(opts);});}
function askSugar(){
  botMsg('Чем обычно спасаешься, когда батарейка садится?',function(){
    var opts=[
      {t:'Кофе, много кофе',fn:function(){meMsg('Кофе, много кофе');onbAns.sugar=4;onbAns.doping='coffee';
        botMsg('Кофе после 16:00 к полуночи ещё наполовину в крови — вот откуда „уснул в час".',askCrash);}},
      {t:'Что-то сладкое',fn:function(){meMsg('Что-то сладкое');onbAns.sugar=1;onbAns.doping='sugar';
        botMsg('Сладкое даёт 30 минут подъёма и час обвала. Качели, на которых укачивает.',askCrash);}},
      {t:'Энергетик',fn:function(){meMsg('Энергетик');onbAns.sugar=2;onbAns.doping='energy';
        botMsg('Энергетик — кредит: заряд сейчас, платёж вечером, когда не уснёшь.',askCrash);}},
      {t:'Терплю на силе воли',fn:function(){meMsg('Терплю на силе воли');onbAns.sugar=5;onbAns.doping='will';
        botMsg('Уважаю. Только сила воли — батарейка, а не розетка: её тоже надо заряжать.',askCrash);}}
    ];
    chips(opts);});}
function askCrash(){
  botMsg('В какой момент дня тебя обычно выключает?',function(){
    var opts=[
      {t:'Утром, сразу',fn:function(){meMsg('Утром, сразу');onbAns.crash='morning';
        botMsg('Просадка с утра — почти всегда про сон, а не про характер.',askStress);}},
      {t:'После обеда',fn:function(){meMsg('После обеда');onbAns.crash='afternoon';
        botMsg('Провал после обеда — визитная карточка сахарных качелей. Чинится проще, чем кажется.',askStress);}},
      {t:'К вечеру',fn:function(){meMsg('К вечеру');onbAns.crash='evening';
        botMsg('К вечеру садиться — нормально. Вопрос, насколько глубоко.',askStress);}},
      {t:'Весь день в тумане',fn:function(){meMsg('Весь день в тумане');onbAns.crash='fog';
        botMsg('Туман весь день — значит, утекает сразу в нескольких местах. Сейчас найдём главную дырку.',askStress);}}
    ];
    chips(opts);});}
function askStress(){
  botMsg('И про внешний мир: курс, ставка, новости. Насколько тебя штормит, 0–100?',function(){
    var m={'Штиль ~15':15,'Качает ~50':50,'Шторм ~85':85};
    chips(Object.keys(m).map(function(k){return {t:k,fn:function(){meMsg(k);onbAns.stress=m[k];onbDone();}};}));
    expect(function(t){var n=num0100(t);if(n===null)return false;onbAns.stress=n;onbDone();return true;});});}
function onbDone(){
  var a={energy:onbAns.energy,sleep:onbAns.sleep,sugar:onbAns.sugar,screen:(onbAns.screen||3),move:3,stress:onbAns.stress};
  S.quiz={a:a,index:calcIndex(a),date:todayStr(),doping:onbAns.doping,crash:onbAns.crash};save();
  var v=verdict(S.quiz.index);
  botMsg('Считаю… готово. Твой индекс ресурса: '+S.quiz.index+' из 100.',function(){
  botMsg('«'+v[0]+'» — '+v[1],function(){
  var typ=typeOf(S.quiz.index,a,onbAns.doping,onbAns.crash);
  botMsg('Твой типаж: '+typ.emoji+' '+typ.name+'. '+typ.line,function(){
  showTypeCard(typ);});});});}
/* карточка типажа — по образцу finale(): canvas → картинка в сообщении бота → чипы → продолжение потока */
function showTypeCard(typ){
  var cv=document.createElement('canvas');cv.width=1080;cv.height=1350;
  drawTypeCard(cv,typ,S.quiz.index,null);
  setTimeout(function(){
    var d=document.createElement('div');d.className='msg bot';
    var img=new Image();img.className='msg-img';img.src=cv.toDataURL('image/png');
    d.appendChild(img);SCROLL.appendChild(d);down();
    chips([{t:'📤 Поделиться',fn:function(){shareCard(cv,'Мой типаж: '+typ.emoji+' '+typ.name+'. Индекс ресурса '+S.quiz.index+' из 100. Замерь свой:');afterTypeCard();}},
           {t:'💾 Скачать',fn:function(){saveCard(cv);afterTypeCard();}},
           {t:'Дальше',fn:function(){afterTypeCard();}}]);
    expect(function(text){afterTypeCard();return true;});
  },600);}
function afterTypeCard(){
  var a=S.quiz.a;
  var fs=factors(a),mf=fs[0];fs.forEach(function(f){if(f.v<mf.v)mf=f;});
  S.recommend=LEAK2HABIT[mf.id];save();
  botMsg('Больше всего утекает здесь: '+mf.name.toLowerCase()+'. План простой: одна привычка на 7 дней. День = серия, неделя = сезон. Начни вот с этой 👇',function(){showShelf();});}
function showShelf(){
  clearChips();
  var used=S.habits.map(function(h){return h.id;});
  var sh=document.createElement('div');sh.className='chat-shelf';
  /* при первом выборе привычки рекомендованная идёт первой в списке; в сезоне 2+ порядок не трогаем */
  var list=HABITS;
  if(!S.habits.length&&S.recommend){
    list=[];var rec=null;
    HABITS.forEach(function(h){if(h.id===S.recommend)rec=h;else list.push(h);});
    if(rec)list=[rec].concat(list);}
  list.forEach(function(h){
    if(used.indexOf(h.id)>=0)return;
    var b=document.createElement('button');b.className='poster';
    var badge=(h.id===S.recommend&&!S.habits.length)?'<div class="poster-badge">🎯 твоя главная дырка</div>':'';
    b.innerHTML='<img src="'+A+'img/'+h.img+'.jpg" alt="" loading="eager">'+badge+'<div class="poster-veil"></div>'+
     '<div class="poster-txt"><div class="poster-title">'+h.title+'</div>'+
     '<div class="poster-line">'+h.line+'</div></div>';
    var im=b.querySelector('img');
    if(im)im.addEventListener('load',down);
    b.addEventListener('click',function(){clearChips();pickHabit(h);});
    sh.appendChild(b);});
  /* подсказка над полкой, чтобы она не отжимала карточки вниз */
  var hint=document.createElement('div');
  hint.className='shelf-swipe tiny';
  hint.textContent='листай вбок — их шесть →';
  SCROLL.appendChild(hint);
  SCROLL.appendChild(sh);
  /* гарантированно показываем полку целиком: скроллим так, чтобы её низ был у поля ввода */
  function reveal(){
    var r=sh.getBoundingClientRect(),cr=SCROLL.getBoundingClientRect();
    var over=r.bottom-cr.bottom;
    if(over>0)SCROLL.scrollTop+=over+12;
    else SCROLL.scrollTop=SCROLL.scrollHeight;
  }
  down();reveal();
  [60,260,600,1100].forEach(function(ms){setTimeout(reveal,ms);});
  var imgs=sh.querySelectorAll('img');
  Array.prototype.forEach.call(imgs,function(im){im.addEventListener('load',reveal);});}
function pickHabit(h){
  var add=S.habits.length>0;
  S.habits.push({id:h.id,start:todayStr()});
  if(add&&!S.achv.spin)S.achv.spin=todayStr();
  save();pshh();meMsg(h.title);
  botMsg('Отличный выбор. «'+h.title+'» — '+h.why,function(){
  botMsg('Сезон запущен: 7 серий по 30 секунд. Вечером напомню? Могу через Telegram-бота или календарь.',function(){
    chips([{t:'⏰ Бот в Telegram',fn:function(){openBot();botMsg('Открыл бота — нажми там «Старт». Отключить: /stop.',offerMain);}},
           {t:'📅 В календарь',fn:function(){downloadICS();botMsg('Скинул файл напоминания — открой его, и календарь будет звать каждый вечер.',offerMain);}},
           {t:'Сам зайду',fn:function(){botMsg('Уважаю. Серия 1 — сегодня вечером. Я тут 🌿',offerMain);}}]);});});}

/* ежедневный замер — умеет принимать всё одной фразой на любом шаге */
var chk={};
function comboParse(text){ /* true = что-то принял и продвинулся */
  var p=localParse(text);
  /* «не знаю / нормально всё» — не данные, а разговор: пусть отвечает эксперт */
  if(/(не знаю|незнаю|хз|без понятия|не понимаю|а что|как это)/i.test(text))return false;
  /* вопрос или просьба — это разговор, а не ответ на замер */
  if(/[?？]/.test(text))return false;
  if(/(почему|зачем|как\s|что если|убеди|объясни|расскажи|помоги|а если|не могу|не хочу|не буду|надоел|устал)/i.test(text))return false;
  if(text.trim().split(/\s+/).length>=7)return false; /* длинная фраза = разговор */
  var got=false;
  if(p.energy!=null&&chk.energy==null){chk.energy=p.energy;got=true;}
  if(p.kept!=null){S.habits.forEach(function(h,i){if(chk['k'+i]==null)chk['k'+i]=p.kept;});got=true;}
  if(p.hard!=null&&chk.hard==null){chk.hard=p.hard;got=true;}
  if(!got)return false;
  clearChips();
  var parts=[];
  if(p.energy!=null)parts.push('энергия '+Math.round(p.energy));
  if(p.kept!=null)parts.push('привычка '+(p.kept>=70?'да':p.kept>=40?'наполовину':'срыв'));
  if(p.hard!=null)parts.push(p.hard>=70?'далось тяжело':p.hard>=40?'средне':'легко');
  botMsg('Принял: '+parts.join(' · ')+'.',nextCheckStep);
  return true;}
function nextCheckStep(){
  if(chk.energy==null){askCheckEnergy();return;}
  for(var i=0;i<S.habits.length;i++)if(chk['k'+i]==null){askKept(i);return;}
  if(chk.hard==null){askHard();return;}
  finishCheck();}
function startCheck(){clearChips();
  if(S.lastCheck===todayStr()){botMsg('Сегодня уже засчитано ✓ Возвращайся завтра — серия в безопасности.',offerMain);return;}
  chk={};
  cancelBar('замер дня · '+Math.min((S.streak%7)+1,7)+' из 7',function(){
    chk={};botMsg('Ок, замер отложим. Вернёшься — жми ⚡ сверху.',offerMain);});
  var d=Math.min((S.streak%7)+1,7);
  botMsg('Серия '+d+' из 7. Можно голосом 🎙 всё сразу: «энергия 70, держался, было легко» — или по шагам. Сколько сегодня энергии?',function(){
    askCheckEnergy();});}
function askCheckEnergy(){
  sliderMsg(function(v){meMsg('Энергия: '+v);chk.energy=v;nextCheckStep();});
  expect(comboParse);}
function askKept(i){
  var h=habit(S.habits[i].id);
  botMsg(h.daily,function(){
    chips([{t:'Да, чисто',fn:function(){meMsg('Да');chk['k'+i]=90;nextCheckStep();}},
           {t:'Наполовину',fn:function(){meMsg('Наполовину');chk['k'+i]=55;nextCheckStep();}},
           {t:'Сорвался',fn:function(){meMsg('Сорвался');chk['k'+i]=10;nextCheckStep();}}]);
    expect(comboParse);});}
function askHard(){
  botMsg('И насколько тяжело далось?',function(){
    chips([{t:'Легко',fn:function(){meMsg('Легко');chk.hard=12;finishCheck();}},
           {t:'Нормально',fn:function(){meMsg('Нормально');chk.hard=45;finishCheck();}},
           {t:'На зубах',fn:function(){meMsg('На зубах');chk.hard=85;finishCheck();}}]);
    expect(comboParse);});}
function finishCheck(){
  hideCancel();
  var kept=[];S.habits.forEach(function(h,i){kept.push(chk['k'+i]!=null?chk['k'+i]:70);});
  var rec={energy:chk.energy||0,kept:kept,hard:chk.hard||50};
  var out=checkInDay(rec);chk={};pshh();chatReset();
  if(out.finale){finale(out.finale);return;}
  var dv=dayVerdict(rec);
  botMsg(dv.em+' '+dv.ti+' '+dv.su,function(){
    var left=7-((S.streak-1)%7+1);
    botMsg('🔥 Серия: '+S.streak+' '+plural(S.streak,'день','дня','дней')+
      (left>0?('. До финала сезона: '+left+' '+plural(left,'серия','серии','серий')):''),function(){
      /* персональный совет на завтра по свежим цифрам */
      typing(true);
      var q='Мой сегодняшний замер: энергия '+rec.energy+' из 100, привычку держал на '+
        Math.round(kept.reduce(function(a,b){return a+b;},0)/kept.length)+' из 100, тяжесть '+rec.hard+
        ' из 100. Дай ОДИН короткий совет на завтра под эти цифры и одной строкой позови вернуться завтра. Максимум 3 строки.';
      chatAnswer(q,function(ans){typing(false);el(ans,'msg bot');chatReset();
        chips([{t:'🏆 Мои ачивки',fn:showAchv},{t:'⏰ Напоминание на вечер',fn:showRemind}]);});});});}
function finale(days){
  botMsg('🏆 ФИНАЛ СЕЗОНА! '+days+' дней подряд. Ты правда красавчик.',function(){
    var cv=document.createElement('canvas');cv.width=1080;cv.height=1350;
    drawShareCard(cv,days,null);
    setTimeout(function(){
      var d=document.createElement('div');d.className='msg bot';
      var img=new Image();img.className='msg-img';img.src=cv.toDataURL('image/png');
      d.appendChild(img);SCROLL.appendChild(d);down();
      chips([{t:'📤 Поделиться в Telegram',fn:function(){shareCard(cv,'🏆 Финал сезона: '+days+' дней подряд — «'+habit(S.habits[0].id).title+'». Замерь свою энергию:');offerNext(days);}},
             {t:'💾 Скачать',fn:function(){saveCard(cv);offerNext(days);}},
             {t:'Дальше',fn:function(){offerNext(days);}}]);},600);});}
function offerNext(days){
  if(days===7&&S.habits.length<2){
    botMsg('Открылся сезон 2 — можно добавить вторую привычку. Хочешь?',function(){
      chips([{t:'🌿 Добавить вторую',fn:showShelf},{t:'Пока хватит одной',fn:function(){botMsg('Мудро. Лучше одна живая, чем две мёртвые.',offerMain);}}]);});}
  else offerMain();}

/* ---------- сводка недели: кольцо серии + цифры + график (в стиле Whoop) ---------- */
function summaryCard(){
  var day=S.streak===0?0:((S.streak-1)%7)+1;
  var season=Math.floor((Math.max(S.streak,1)-1)/7)+1;
  var vals=[],labels=['пн','вт','ср','чт','пт','сб','вс'];
  for(var i=6;i>=0;i--){var d=addDays(todayStr(),-i);var r=S.days[d];
    vals.push(r?r.energy:null);
    labels[6-i]=['вс','пн','вт','ср','чт','пт','сб'][new Date(d.split('-')[0],+d.split('-')[1]-1,+d.split('-')[2]).getDay()];}
  var known=vals.filter(function(v){return v!==null;});
  var avg=known.length?Math.round(known.reduce(function(a,b){return a+b;},0)/known.length):null;
  var last=known.length?known[known.length-1]:null;
  /* дельта: свежая половина недели против ранней — честнее, чем «первый против последнего» */
  var delta=null;
  if(known.length>=2){
    var half=Math.max(1,Math.floor(known.length/2));
    var early=known.slice(0,half),late=known.slice(-half);
    var m1=early.reduce(function(a,b){return a+b;},0)/early.length;
    var m2=late.reduce(function(a,b){return a+b;},0)/late.length;
    delta=Math.round(m2-m1);}
  var R=46,C=2*Math.PI*R;
  var bars='',mx=Math.max(60,Math.max.apply(null,known.length?known:[60]));
  vals.forEach(function(v,i){
    var x=8+i*40, h=v===null?4:Math.max(6,(v/mx)*58), y=64-h;
    var isToday=(i===6);
    bars+='<rect x="'+x+'" y="'+y+'" width="22" height="'+h+'" rx="7" fill="'+(v===null?'#E7DFCD':(isToday?'#7EA048':'#A8C96B'))+'"/>'+
      (v!==null?'<text class="bar-val" x="'+(x+11)+'" y="'+(y-5)+'" text-anchor="middle" font-size="10" font-weight="600" font-family="Inter,sans-serif">'+v+'</text>':'')+
      '<text class="bar-day'+(isToday?' now':'')+'" x="'+(x+11)+'" y="79" text-anchor="middle" font-size="9.5" font-family="Inter,sans-serif"'+(isToday?' font-weight="700"':'')+'>'+labels[i]+'</text>';
  });
  var d=document.createElement('div');
  d.className='msg bot summary-msg';
  d.innerHTML=
   '<div class="sum-top">'+
   ' <div class="sum-ring"><svg viewBox="0 0 110 110">'+
   '  <circle cx="55" cy="55" r="'+R+'" fill="none" stroke="#EDF2DC" stroke-width="9"/>'+
   '  <circle cx="55" cy="55" r="'+R+'" fill="none" stroke="#A8C96B" stroke-width="9" stroke-linecap="round"'+
   '   transform="rotate(-90 55 55)" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'" class="sum-arc" style="--to:'+(C*(1-day/7))+'"/>'+
   ' </svg><div class="sum-ring-c"><b>'+day+'</b><span>из 7</span></div></div>'+
   ' <div class="sum-side"><div class="sum-eyebrow">Сезон '+season+'</div>'+
   '  <div class="sum-habit">'+(S.habits[0]?habit(S.habits[0].id).title:'—')+'</div>'+
   '  <div class="sum-note">'+(day===7?'финал сезона':'ещё '+(7-day)+' '+plural(7-day,'серия','серии','серий'))+'</div></div>'+
   '</div>'+
   '<div class="stats-row">'+
   ' <div class="stat"><div class="stat-num">'+(last!==null?last:'—')+'</div><div class="stat-lab">сегодня</div></div>'+
   ' <div class="stat"><div class="stat-num">'+(avg!==null?avg:'—')+'</div><div class="stat-lab">средне</div></div>'+
   ' <div class="stat"><div class="stat-num">'+(delta!==null?((delta>=0?'+':'')+delta):'—')+'</div><div class="stat-lab">неделя</div></div>'+
   '</div>'+
   '<svg class="sum-bars" viewBox="0 0 288 84">'+bars+'</svg>';
  SCROLL.appendChild(d);down();
  setTimeout(function(){var a=d.querySelector('.sum-arc');if(a)a.style.strokeDashoffset=a.style.getPropertyValue('--to');},80);
}
function showSummary(){clearChips();hideCancel();
  if(!S.habits.length){botMsg('Сводка появится, когда выберешь привычку и сделаешь первый замер.',offerMain);return;}
  summaryCard();
  var ins=bestInsight();
  setTimeout(function(){
    if(ins)botMsg(ins,function(){offerMain();});else offerMain();
  },700);}

/* шапка */
$('#hb-check').addEventListener('click',function(){ac();startCheck();});
function showAchv(){clearChips();hideCancel();
  var got=ACHV.filter(function(a){return S.achv[a.id];}),lock=ACHV.filter(function(a){return !S.achv[a.id];});
  var t='Твои ачивки:\n'+(got.length?got.map(function(a){return a.ic+' '+a.t;}).join('\n'):'— пока пусто, всё впереди')+
    (lock.length?('\n\nВпереди:\n'+lock.map(function(a){return '🔒 '+a.t;}).join('\n')):'');
  botMsg(t,offerMain);}
$('#hb-achv').addEventListener('click',showAchv);
function showRemind(){clearChips();
  botMsg('Напомню замерить день каждый вечер в '+(S.remind||'21:30')+'. Как удобнее?',function(){
    chips([{t:'⏰ Бот в Telegram',fn:function(){openBot();botMsg('Открыл бота — нажми «Старт». Отключить: /stop.',offerMain);}},
           {t:'📅 Календарь',fn:function(){downloadICS();botMsg('Скинул файл — открой, и календарь будет звать вечером.',offerMain);}}]);});}
$('#hb-sum').addEventListener('click',function(){ac();showSummary();});

/* ввод */
$('#send').addEventListener('click',function(){var v=$('#inp').value.trim();
  if(!v)return;$('#inp').value='';ac();handleText(v);});
$('#inp').addEventListener('keydown',function(e){if(e.key==='Enter')$('#send').click();});
(function(){var mic=$('#mic');
  var R=makeRecognizer(function(text){handleText(text);},
    function(on){mic.classList.toggle('listening',on);mic.innerHTML=on?STOP_SVG:MIC_SVG;},
    function(n){
      if(n==='thinking'){typing(true);return;}
      typing(false);
      if(n)el(n,'msg bot');
    });
  if(!R)return;mic.hidden=false;
  try{if(!localStorage.getItem('dzen10.micseen'))mic.classList.add('attract');}catch(e){}
  mic.addEventListener('click',function(){ac();
    mic.classList.remove('attract');
    try{localStorage.setItem('dzen10.micseen','1');}catch(e){}
    R.toggle();});})();

greet();
