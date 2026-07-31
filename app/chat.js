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
'  <div><div class="chat-head-name">Банка DZEN</div><div class="chat-head-st" id="head-st">онлайн · видит тебя насквозь</div></div>'+
'  <div class="chat-head-btns">'+
'   <button class="chip-ic" id="hb-again" aria-label="Замерить заново" title="Замерить заново">🔄</button>'+
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
    if(pending===null&&S.quiz)offerMain();});}
/* мягкое завершение разговора — без крючков на возврат */
function closeTalk(){
  clearChips();
  setTimeout(function(){
    chatReset();
    chips([{t:'🔄 Замерить заново',fn:restartQuiz}]);
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
  /* калькулятор: каждый вход — с чистого листа, без «с возвращением» */
  S.quiz=null;save();onbAns={};chatReset();
  botMsg('Привет! Я банка DZEN 🥤 Слежу за твоим ресурсом, пока мир испытывает его на прочность: курс, ставка, новости…',function(){
  botMsg('Давай сыграем: 4 вопроса — и я угадаю, насколько ты сейчас в ресурсе. Поехали.',function(){askSleep();});});}
function offerMain(){clearChips();
  chips([{t:'🔄 Замерить заново',fn:restartQuiz}]);}
function restartQuiz(){clearChips();hideCancel();S.quiz=null;save();onbAns={};chatReset();askSleep();}

/* онбординг */
var onbAns={};
function askEnergy(done){
  sliderMsg(function(v){meMsg('Энергия: '+v);done(v);});
  expect(function(text){var n=num0100(text);if(n===null)return false;clearChips();done(n);return true;});}
/* ---- универсальный вопрос с кнопками: понимает кнопки, текст и голос ----
   разбор ответа: число (если cfg.num) → ключевые слова → нейронка-классификатор;
   вопрос человека уходит эксперту, анкета не ломается и ждёт дальше */
function choiceQ(cfg){
  botMsg(cfg.q,function(){
    chips(cfg.opts.map(function(o){return {t:o.t,fn:function(){meMsg(o.t);takeOpt(cfg,o);}};}));
    armChoice(cfg);});}
function takeOpt(cfg,o){clearChips();o.apply();botMsg(o.react,cfg.next);}
function armChoice(cfg){
  expect(function(text){
    var t=' '+wordsToNums(text.toLowerCase())+' ';
    if(cfg.num){var n=num0100(text);if(n!==null){clearChips();cfg.num(n);return true;}}
    for(var i=0;i<cfg.opts.length;i++)
      if(cfg.opts[i].rx&&cfg.opts[i].rx.test(t)){takeOpt(cfg,cfg.opts[i]);return true;}
    if(/[?？]/.test(text)||/(почему|зачем|что это|что за|как это|расскажи|объясни|а если|кто ты)/.test(t)){
      botTalk(text);armChoice(cfg);return true;}
    aiPickOpt(cfg,text,function(o){
      if(o)takeOpt(cfg,o);
      else{botMsg('Слышу 🙂 Но для честного расчёта ткни в один из вариантов ниже.');armChoice(cfg);}});
    return true;});}
function aiPickOpt(cfg,text,cb){
  typing(true);
  var sys='Человек отвечает на вопрос анкеты: «'+cfg.q+'». Варианты ответа: '+
    cfg.opts.map(function(o,i){return i+' — «'+o.t+'»';}).join('; ')+
    '. Определи, какому варианту по смыслу соответствует его ответ. Верни ТОЛЬКО JSON {"i":номер} или {"i":null}, если ответ не подходит ни к одному варианту.';
  llm(sys,text,function(raw){typing(false);
    var i=null;
    if(raw){try{var j=JSON.parse((raw.match(/\{[\s\S]*\}/)||['{}'])[0]);if(typeof j.i==='number')i=j.i;}catch(e){}}
    cb(i!=null&&cfg.opts[i]?cfg.opts[i]:null);});}

function askSleep(){
  choiceQ({q:'Во сколько ты вчера реально уснул?',next:askSugar,opts:[
    {t:'До 23',rx:/до ?23|до ?11|десят|одиннадцат| 21 | 22 |рано/,
     apply:function(){onbAns.sleep=6;},
     react:'Редкий зверь. Самый жирный кусок восстановления — до полуночи, и он у тебя есть.'},
    {t:'23–00',rx:/ 23|двенадцат|к полуночи|около полуночи|перед полуночью| 12 /,
     apply:function(){onbAns.sleep=4;},
     react:'Почти идеально. Сдвинешь на полчаса раньше — утро станет другим.'},
    {t:'После полуночи',rx:/полуноч|час ноч| в час | в два | в три |поздно|под утро| ноч/,
     apply:function(){onbAns.sleep=2;},
     react:'Сон после полуночи отдаёт меньше: главная фаза восстановления — в первую половину ночи.'},
    {t:'Не помню, листал ленту',rx:/лент|листал|телефон|не помню|залип|тикток|инстагр|ютуб/,
     apply:function(){onbAns.sleep=1;onbAns.screen=6;},
     react:'Классика. Лента ворует не вечер — она ворует завтрашнее утро.'}]});}
function askSugar(){
  choiceQ({q:'Чем обычно спасаешься, когда батарейка садится?',next:askCrash,opts:[
    {t:'Кофе, много кофе',rx:/кофе|капучино|американо|латте|эспрессо|раф/,
     apply:function(){onbAns.sugar=4;onbAns.doping='coffee';},
     react:'Кофе после 16:00 к полуночи ещё наполовину в крови — вот откуда „уснул в час".'},
    {t:'Что-то сладкое',rx:/сладк|шоколад|конфет|печень|торт|булоч|десерт|сахар/,
     apply:function(){onbAns.sugar=1;onbAns.doping='sugar';},
     react:'Сладкое даёт 30 минут подъёма и час обвала. Качели, на которых укачивает.'},
    {t:'Энергетик',rx:/энергетик|энерджи|редбул|ред ?булл|берн|монстр|red ?bull|monster/,
     apply:function(){onbAns.sugar=2;onbAns.doping='energy';},
     react:'Энергетик — кредит: заряд сейчас, платёж вечером, когда не уснёшь.'},
    {t:'Терплю на силе воли',rx:/сил[аоеы] ?вол|силе воли|терпл|держусь|ничем|никак|не спасаюсь/,
     apply:function(){onbAns.sugar=5;onbAns.doping='will';},
     react:'Уважаю. Только сила воли — батарейка, а не розетка: её тоже надо заряжать.'}]});}
function askCrash(){
  choiceQ({q:'В какой момент дня тебя обычно выключает?',next:askStress,opts:[
    {t:'Утром, сразу',rx:/утр|проснул|подъём|подъем|с самого начала/,
     apply:function(){onbAns.crash='morning';},
     react:'Просадка с утра — почти всегда про сон, а не про характер.'},
    {t:'После обеда',rx:/обед|днём|днем|после еды|полдень| 13 | 14 | 15 /,
     apply:function(){onbAns.crash='afternoon';},
     react:'Провал после обеда — визитная карточка сахарных качелей. Чинится проще, чем кажется.'},
    {t:'К вечеру',rx:/вечер|к ночи|после работы|в конце дня/,
     apply:function(){onbAns.crash='evening';},
     react:'К вечеру садиться — нормально. Вопрос, насколько глубоко.'},
    {t:'Весь день в тумане',rx:/туман|весь день|целый день|всегда|постоянно|не выключает/,
     apply:function(){onbAns.crash='fog';},
     react:'Туман весь день — значит, утекает сразу в нескольких местах. Сейчас найдём главную дырку.'}]});}
function askStress(){
  choiceQ({q:'И про внешний мир: курс, ставка, новости. Насколько тебя штормит, 0–100?',next:onbDone,
   num:function(n){onbAns.stress=n;onbDone();},
   opts:[
    {t:'Штиль ~15',rx:/штиль|спокой|не шторм|не трогает|ровно|пофиг/,
     apply:function(){onbAns.stress=15;},
     react:'Штиль — роскошь по нынешним временам. Беру в расчёт.'},
    {t:'Качает ~50',rx:/качает|средне|так себе|бывает|иногда|местами/,
     apply:function(){onbAns.stress=50;},
     react:'Как большинство. Учёл.'},
    {t:'Шторм ~85',rx:/шторм|сильно|очень|жесть|трясёт|трясет|паник|накрывает/,
     apply:function(){onbAns.stress=85;},
     react:'Держись. Сейчас посчитаю, во что это обходится.'}]});}
function onbDone(){
  /* банка УГАДЫВАЕТ заряд по косвенным ответам — прямого вопроса про энергию больше нет */
  var dopV={coffee:55,sugar:25,energy:30,will:70}[onbAns.doping];if(dopV==null)dopV=50;
  var crV={morning:25,afternoon:45,evening:65,fog:15}[onbAns.crash];if(crV==null)crV=45;
  var idx=Math.round(.35*Math.round(onbAns.sleep/7*100)+.25*dopV+.2*crV+.2*(100-onbAns.stress));
  idx=Math.max(5,Math.min(95,idx));
  var a={energy:idx,sleep:onbAns.sleep,sugar:onbAns.sugar,screen:(onbAns.screen||3),move:3,stress:onbAns.stress};
  S.quiz={a:a,index:idx,date:todayStr(),doping:onbAns.doping,crash:onbAns.crash};save();
  var v=verdict(idx);
  botMsg('Так… сон, допинг, время провала, внешний фон. Складываю картинку.',function(){
  botMsg('Ставлю на то, что ты сейчас примерно на '+idx+' из 100. «'+v[0]+'» — '+v[1],function(){
  botMsg('Угадал?',function(){
    chips([
      {t:'🎯 В точку',fn:function(){meMsg('В точку');
        botMsg('Я же банка. Мне сверху видно 😌',showType);}},
      {t:'У меня повыше',fn:function(){meMsg('У меня повыше');bumpIndex(10);
        botMsg('Принял, поднимаю до '+S.quiz.index+'. Люблю оптимистов.',showType);}},
      {t:'Пониже',fn:function(){meMsg('Пониже');bumpIndex(-10);
        botMsg('Честно. Опускаю до '+S.quiz.index+' — честный замер полезнее красивого.',showType);}}]);
    /* свободный ответ тоже понимаем: «в точку», «у меня выше/ниже», «у меня 70» */
    expect(function(text){
      var t=' '+wordsToNums(text.toLowerCase())+' ';
      var n=num0100(text);
      clearChips();
      if(n!==null){S.quiz.index=Math.max(5,Math.min(95,n));S.quiz.a.energy=S.quiz.index;save();
        botMsg('Принял, записываю '+S.quiz.index+'. Самозамер — тоже замер.',showType);}
      else if(/точку|точно|угадал|похоже|прав | да /.test(t)){botMsg('Я же банка. Мне сверху видно 😌',showType);}
      else if(/выше|больше|получше|повыше|бодрее|лучше/.test(t)){bumpIndex(10);
        botMsg('Принял, поднимаю до '+S.quiz.index+'. Люблю оптимистов.',showType);}
      else if(/ниже|меньше|хуже|пониже|устал/.test(t)){bumpIndex(-10);
        botMsg('Честно. Опускаю до '+S.quiz.index+' — честный замер полезнее красивого.',showType);}
      else showType();
      return true;});});});});}
function bumpIndex(d){S.quiz.index=Math.max(5,Math.min(95,S.quiz.index+d));S.quiz.a.energy=S.quiz.index;save();}
function showType(){
  clearChips();
  var typ=typeOf(S.quiz.index,S.quiz.a,S.quiz.doping,S.quiz.crash);
  botMsg('Диагноз готов. Ты — '+typ.emoji+' «'+typ.name+'». '+typ.line,function(){showTypeCard(typ);});}
/* карточка типажа — по образцу finale(): canvas → картинка в сообщении бота → чипы → продолжение потока */
function showTypeCard(typ){
  var cv=document.createElement('canvas');cv.width=1080;cv.height=1350;
  /* сначала грузим арт-постер (дальше он берётся из кэша), потом рисуем и показываем */
  var started=false;
  function go(){if(started)return;started=true;
  drawTypeCard(cv,typ,S.quiz.index,null);
  setTimeout(function(){
    var d=document.createElement('div');d.className='msg bot';
    var img=new Image();img.className='msg-img';img.src=cv.toDataURL('image/jpeg',.92);
    d.appendChild(img);SCROLL.appendChild(d);down();
    chips([{t:'📤 Поделиться',fn:function(){shareCard(cv,'Мой типаж: '+typ.emoji+' '+typ.name+'. Индекс ресурса '+S.quiz.index+' из 100. Замерь свой:');afterTypeCard();}},
           {t:'💾 Скачать',fn:function(){saveCard(cv);afterTypeCard();}},
           {t:'Дальше',fn:function(){afterTypeCard();}}]);
    expect(function(text){afterTypeCard();return true;});
  },600);}
  var pre=new Image();pre.src=A+'img/'+(TYPE_IMG[typ.id]||'frame_achieve')+'.jpg';
  pre.onload=go;pre.onerror=go;setTimeout(go,3000);}
function afterTypeCard(){
  /* личный разбор: главная утечка + 2 точных совета по ответам, без «вернись завтра» */
  var a=S.quiz.a;
  var fs=factors(a).filter(function(f){return f.id!=='energy'&&f.id!=='move';});
  var mf=fs[0];fs.forEach(function(f){if(f.v<mf.v)mf=f;});
  var tips=[];
  if(a.sleep<=2)tips.push('Сон после полуночи — главный слив. Не героику, а полшага: сегодня отбой на 30 минут раньше вчерашнего.');
  if(S.quiz.doping==='coffee')tips.push('Кофе — ок, но последняя чашка за 8–10 часов до сна. Кофе в 18:00 — это подписка на «уснул в час».');
  if(S.quiz.doping==='sugar')tips.push('Вместо сладкого на просадке — белковый перекус: орехи, творог, яйцо. Держит ровно, без обвала через час.');
  if(S.quiz.doping==='energy')tips.push('Энергетик после 16:00 — обмен вечера на ночь. Утром вместо него: 10 минут дневного света в глаза — разгоняет лучше.');
  if(S.quiz.crash==='afternoon')tips.push('Провал после обеда наполовину снимается прогулкой 10 минут сразу после еды.');
  if(S.quiz.crash==='morning')tips.push('Тяжёлое утро: свет в глаза в первые полчаса после подъёма и стакан воды до первого кофе.');
  if(S.quiz.crash==='fog')tips.push('Туман весь день чинится не подвигом, а ритмом: ложись и вставай в одно время, окно ±30 минут.');
  if(a.stress>=70)tips.push('Новости — один-два захода в день вместо ленты. Фон стихает уже за сутки.');
  if(!tips.length)tips.push('База у тебя в порядке — просто держи сон в одном ритме: окно ±30 минут важнее его длины.');
  tips=tips.slice(0,2);
  botMsg('Теперь по делу. Больше всего у тебя утекает здесь: '+mf.name.toLowerCase()+'.',function(){
  botMsg('На что обратить внимание: '+tips[0],function(){
    if(tips[1]){botMsg('И ещё: '+tips[1],endCalc);}else endCalc();});});}
function endCalc(){
  botMsg('Хочешь копнуть глубже — спроси меня про сон, кофеин, сахар или стресс. Отвечу коротко и по делу.',function(){
    chips([{t:'🔄 Пройти заново',fn:restartQuiz}]);});}
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
$('#hb-again').addEventListener('click',function(){ac();restartQuiz();});
function showAchv(){clearChips();hideCancel();
  var got=ACHV.filter(function(a){return S.achv[a.id];}),lock=ACHV.filter(function(a){return !S.achv[a.id];});
  var t='Твои ачивки:\n'+(got.length?got.map(function(a){return a.ic+' '+a.t;}).join('\n'):'— пока пусто, всё впереди')+
    (lock.length?('\n\nВпереди:\n'+lock.map(function(a){return '🔒 '+a.t;}).join('\n')):'');
  botMsg(t,offerMain);}
function showRemind(){clearChips();
  botMsg('Напомню замерить день каждый вечер в '+(S.remind||'21:30')+'. Как удобнее?',function(){
    chips([{t:'⏰ Бот в Telegram',fn:function(){openBot();botMsg('Открыл бота — нажми «Старт». Отключить: /stop.',offerMain);}},
           {t:'📅 Календарь',fn:function(){downloadICS();botMsg('Скинул файл — открой, и календарь будет звать вечером.',offerMain);}}]);});}

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
