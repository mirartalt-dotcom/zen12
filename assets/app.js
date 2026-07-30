/* ============ DZEN · Энергия · Версия 10.0 ============ */
'use strict';

/* ---------- утилиты ---------- */
var $ = function(s){ return document.querySelector(s); };
var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
function todayStr(d){ d = d || new Date(); var m=d.getMonth()+1, day=d.getDate();
  return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(day<10?'0':'')+day; }
function addDays(str,n){ var p=str.split('-'); var d=new Date(+p[0],+p[1]-1,+p[2]); d.setDate(d.getDate()+n); return todayStr(d); }
function weekKey(str){ var p=str.split('-'); var d=new Date(+p[0],+p[1]-1,+p[2]);
  var day=(d.getDay()+6)%7; d.setDate(d.getDate()-day+3);
  var y=d.getFullYear(); var jan4=new Date(y,0,4); var wk=1+Math.round(((d-jan4)/864e5-3+((jan4.getDay()+6)%7))/7);
  return y+'-W'+wk; }
function daysBetween(a,b){ var pa=a.split('-'),pb=b.split('-');
  return Math.round((new Date(+pb[0],+pb[1]-1,+pb[2]) - new Date(+pa[0],+pa[1]-1,+pa[2]))/864e5); }
function plural(n,one,few,many){ n=Math.abs(n)%100; var d=n%10;
  if(n>10&&n<20) return many; if(d===1) return one; if(d>1&&d<5) return few; return many; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

/* ---------- звук ---------- */
var AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
var lastTick=0;
function tick(){ var c=ac(); if(!c) return; var t=c.currentTime; if(t-lastTick<0.05) return; lastTick=t;
  var o=c.createOscillator(), g=c.createGain();
  o.frequency.value=880; g.gain.setValueAtTime(0.025,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+0.08); }
function pshh(){ var c=ac(); if(!c) return; var t=c.currentTime;
  var b=c.createBuffer(1,c.sampleRate*0.5,c.sampleRate), d=b.getChannelData(0);
  for(var i=0;i<d.length;i++){ d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.2); }
  var s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain();
  s.buffer=b; f.type='highpass'; f.frequency.value=3000; g.gain.value=0.12;
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); }

/* ---------- данные привычек ---------- */
var HABITS=[
  { id:'sleep', title:'Лечь до 23:00', img:'poster_sleep',
    line:'вместо второго сезона, который сам себя не досмотрит',
    daily:'Вчера-сегодня лёг до 23:00?', why:'Сон — главный завод энергии. Всё остальное — филиалы.' },
  { id:'sugar', title:'День без сладкого', img:'poster_sugar',
    line:'печенье переживёт эту разлуку. а ты станешь ровнее',
    daily:'Сегодня обошёлся без сладкого?', why:'Сахарные качели съедают энергию быстрее, чем дают.' },
  { id:'move', title:'20 минут движения', img:'poster_move',
    line:'прогулка тоже считается. диван подождёт',
    daily:'Сегодня было 20 минут движения?', why:'Движение — самый честный способ разогнать энергию.' },
  { id:'phone', title:'Вечер без ленты', img:'poster_phone',
    line:'лента бесконечна. твой вечер — нет',
    daily:'Вечер прошёл без залипания в телефон?', why:'Лента перед сном ворует и вечер, и завтрашнее утро.' },
  { id:'drink', title:'Без сахарных напитков', img:'poster_drink',
    line:'пузырьки можно оставить. сахар — нет',
    daily:'Сегодня без сладкой газировки?', why:'Жидкий сахар — самый незаметный слив энергии.' },
  { id:'news', title:'Новости 1 раз в день', img:'poster_news',
    line:'мир подождёт. он вообще-то никуда не денется',
    daily:'Заглянул в новости не больше одного раза?', why:'Каждый заход в новости — маленький налог на нервы.' }
];
function habit(id){ for(var i=0;i<HABITS.length;i++) if(HABITS[i].id===id) return HABITS[i]; return HABITS[0]; }

/* ---------- состояние ---------- */
var KEY='dzen10';
var S=load();
function load(){ try{ var s=JSON.parse(localStorage.getItem(KEY)); if(s && s.v===1) return s; }catch(e){}
  return { v:1, quiz:null, habits:[], days:{}, streak:0, best:0, lastCheck:null,
           freezes:{}, achv:{}, remind:'21:30', demo:false }; }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }

/* ---------- роутер ---------- */
function show(id){
  $$('.scr').forEach(function(s){ s.classList.remove('on'); });
  var el=$('#'+id); if(el){ el.classList.add('on'); window.scrollTo(0,0); }
}
function route(){
  if(!S.quiz){ show('scr-hero'); return; }
  if(!S.habits.length){ renderShelf(false); show('scr-shelf'); return; }
  renderHome(); show('scr-home');
}

/* ---------- живые кино-фоны ---------- */
function initCinefades(){
  $$('.cinefade').forEach(function(box){
    if(box.dataset.ready) return; box.dataset.ready='1';
    var a=document.createElement('img'), b=document.createElement('img');
    a.src=box.dataset.imgA; b.src=box.dataset.imgB; a.alt=''; b.alt='';
    a.className='show';
    box.appendChild(a); box.appendChild(b);
    var flip=false;
    setInterval(function(){
      flip=!flip;
      a.classList.toggle('show',!flip);
      b.classList.toggle('show',flip);
    }, 8000);
  });
}

/* ---------- банка энергии (SVG) ---------- */
function canSVG(level){ // level 0..100
  var h=120, y=138-(level/100)*h;
  var bub=''; for(var i=0;i<7;i++){
    var cx=34+((i*23)%44), r=1.6+((i*7)%3), dur=(2.6+(i%4)*0.8).toFixed(1), del=(i*0.6).toFixed(1);
    bub+='<circle cx="'+cx+'" cy="140" r="'+r+'" fill="#FBFAF6" opacity=".75">'+
      '<animate attributeName="cy" values="138;'+(y+6)+'" dur="'+dur+'s" begin="'+del+'s" repeatCount="indefinite"/>'+
      '<animate attributeName="opacity" values=".75;0" dur="'+dur+'s" begin="'+del+'s" repeatCount="indefinite"/></circle>';
  }
  return '<svg viewBox="0 0 112 176" xmlns="http://www.w3.org/2000/svg">'+
    '<defs><clipPath id="canclip"><rect x="20" y="18" width="72" height="140" rx="16"/></clipPath>'+
    '<linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">'+
    '<stop offset="0" stop-color="#C8DC9A"/><stop offset="1" stop-color="#A8C96B"/></linearGradient></defs>'+
    '<rect x="20" y="18" width="72" height="140" rx="16" fill="#FBFAF6" stroke="#2B2A26" stroke-width="3"/>'+
    '<rect x="30" y="10" width="52" height="10" rx="5" fill="none" stroke="#2B2A26" stroke-width="3"/>'+
    '<g clip-path="url(#canclip)">'+
    '<rect x="20" y="'+y+'" width="72" height="150" fill="url(#liq)">'+
    '<animate attributeName="y" values="'+y+';'+(y-2)+';'+y+'" dur="3s" repeatCount="indefinite"/></rect>'+
    (level>2?bub:'')+'</g>'+
    '<text x="56" y="100" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="26" font-style="italic" fill="'+(level>55?'#FBFAF6':'#2B2A26')+'">'+Math.round(level)+'</text>'+
    '</svg>';
}

/* ---------- компонент ползунка ---------- */
function slider(opts){
  // opts: {max, value, tint, words(v), onInput(v), ends:[l,r], canViz}
  var wrap=document.createElement('div');
  wrap.innerHTML=(opts.canViz?'<div class="can-viz"></div>':'')+
    '<div class="sld"><div class="sld-track"><div class="sld-fill"></div></div>'+
    '<input type="range" min="0" max="'+opts.max+'" step="1" value="'+(opts.value||0)+'" aria-label="ползунок"></div>'+
    (opts.ends?'<div class="sld-ends"><span>'+opts.ends[0]+'</span><span>'+opts.ends[1]+'</span></div>':'');
  var input=wrap.querySelector('input'), sld=wrap.querySelector('.sld'), viz=wrap.querySelector('.can-viz');
  if(opts.tint) sld.style.setProperty('--tint',opts.tint);
  function paint(){
    var v=+input.value, p=v/opts.max*100;
    sld.style.setProperty('--fill',p+'%');
    if(viz) viz.innerHTML=canSVG(p);
    if(opts.onInput) opts.onInput(v);
  }
  input.addEventListener('input',function(){ paint(); if((+input.value)%Math.max(1,Math.round(opts.max/10))===0) tick(); });
  paint();
  wrap.getValue=function(){ return +input.value; };
  wrap.setValue=function(v){ input.value=Math.max(0,Math.min(opts.max,Math.round(v))); paint(); };
  return wrap;
}

/* ---------- квиз ---------- */
var QUESTIONS=[
  { id:'energy', max:100, tint:'#56732E', title:'Какой у тебя сейчас уровень энергии?',
    ends:['на нуле','фонтан'],
    canViz:true,
    expl:'<b>Что это такое?</b> Уровень энергии — это твой внутренний заряд прямо сейчас: '+
      'хочется ли что-то делать, ясная ли голова, тянет ли тебя к людям и задачам — '+
      'или ты всё делаешь через силу. Не думай долго: первое ощущение — самое честное.',
    words:function(v){ return v<10?'полный ноль':v<25?'еле тлею':v<45?'на остатках':v<65?'рабочий режим':v<85?'хорошо заряжен':'фонтан энергии'; } },
  { id:'sleep', max:7, tint:'#7A5C93', title:'Сколько ночей за неделю ты лёг до 23:00?',
    ends:['0 ночей','все 7'],
    words:function(v){ return v+' из 7 — '+(v<=1?'сова со стажем':v<=3?'бывает':v<=5?'уже неплохо':'режим железный'); } },
  { id:'sugar', max:7, tint:'#C0563E', title:'Сколько дней прошло без сладкого?',
    ends:['0 дней','все 7'],
    words:function(v){ return v+' из 7 — '+(v<=1?'печенье побеждает':v<=3?'борьба идёт':v<=5?'сахар отступает':'кремень'); } },
  { id:'screen', max:7, tint:'#7A5C93', title:'Сколько вечеров ты залипал в телефоне перед сном?',
    ends:['ни одного','каждый вечер'], invert:true,
    words:function(v){ return v+' из 7 — '+(v<=1?'вечер твой':v<=3?'лента подъедает':v<=5?'лента почти выиграла':'телефон живёт твою жизнь'); } },
  { id:'move', max:7, tint:'#56732E', title:'Сколько дней было хотя бы 20 минут движения?',
    ends:['0 дней','все 7'],
    words:function(v){ return v+' из 7 — '+(v<=1?'диван доволен':v<=3?'начало есть':v<=5?'тело радуется':'машина'); } },
  { id:'stress', max:100, tint:'#C0563E', title:'Насколько тебя штормит от внешнего мира?',
    ends:['штиль','шторм'], invert:true,
    expl:'<b>Про что вопрос?</b> Курс валют, ставка ЦБ, новости, дедлайны — стресс приходит снаружи '+
      'и незаметно списывает заряд. Оцени, насколько сильно этот фон давит именно на тебя.',
    words:function(v){ return v<15?'почти штиль':v<35?'фоновая рябь':v<60?'заметно качает':v<85?'штормит всерьёз':'девятый вал'; } }
];
var qIdx=0, qAns={};
function startQuiz(){ qIdx=0; qAns={}; renderQuizProgress(); renderQuestion(); show('scr-quiz'); }
function renderQuizProgress(){
  var h=''; for(var i=0;i<QUESTIONS.length;i++) h+='<i class="'+(i<=qIdx?'done':'')+'"></i>';
  $('#quiz-progress').innerHTML=h;
}
function renderQuestion(){
  var q=QUESTIONS[qIdx], body=$('#quiz-body'); body.innerHTML='';
  var el=document.createElement('div'); el.className='q';
  el.innerHTML='<div class="q-num">ВОПРОС '+(qIdx+1)+' / '+QUESTIONS.length+'</div>'+
    '<h2>'+q.title+'</h2>'+
    (q.expl?'<details class="q-expl"><summary>что это значит</summary><div style="margin-top:8px">'+q.expl+'</div></details>':'')+
    '<div class="q-mid"><div class="q-value" '+(q.canViz?'hidden':'')+'>0</div><div class="q-word"></div><div class="q-sld"></div></div>'+
    '<div class="q-foot"><button class="btn btn-ink q-next">Дальше</button></div>';
  var valEl=el.querySelector('.q-value'), wordEl=el.querySelector('.q-word');
  var sld=slider({ max:q.max, value:qAns[q.id]||0, tint:q.tint, ends:q.ends, canViz:q.canViz,
    onInput:function(v){ valEl.textContent=v; wordEl.textContent=q.words(v); } });
  el.querySelector('.q-sld').appendChild(sld);
  el.querySelector('.q-next').addEventListener('click',function(){
    qAns[q.id]=sld.getValue(); qIdx++;
    if(qIdx>=QUESTIONS.length){ finishQuiz(); } else { renderQuizProgress(); renderQuestion(); }
  });
  body.appendChild(el);
  renderQuizProgress();
}
$('#quiz-back').addEventListener('click',function(){
  if(qIdx===0){ show('scr-story3'); return; }
  qIdx--; renderQuizProgress(); renderQuestion();
});

/* ---------- расчёт индекса ---------- */
function factors(a){
  return [
    { id:'energy', name:'Заряд сейчас', v:a.energy },
    { id:'sleep',  name:'Сон',          v:Math.round(a.sleep/7*100) },
    { id:'sugar',  name:'Сахар',        v:Math.round(a.sugar/7*100) },
    { id:'screen', name:'Экраны',       v:Math.round((7-a.screen)/7*100) },
    { id:'move',   name:'Движение',     v:Math.round(a.move/7*100) },
    { id:'stress', name:'Внешний фон',  v:100-a.stress }
  ];
}
var WEIGHTS={ energy:.30, sleep:.14, sugar:.12, screen:.10, move:.14, stress:.20 };
function calcIndex(a){
  var fs=factors(a), sum=0;
  fs.forEach(function(f){ sum+=f.v*WEIGHTS[f.id]; });
  return Math.max(0,Math.min(100,Math.round(sum)));
}
var LEAK2HABIT={ energy:'sleep', sleep:'sleep', sugar:'sugar', screen:'phone', move:'move', stress:'news' };
function verdict(idx){
  if(idx<20) return ['Резерв почти на нуле','Ты едешь на честном слове и кофе. Хорошая новость: ниже уже некуда — дальше только вверх.'];
  if(idx<40) return ['Держишься на морали','Заряд утекает быстрее, чем приходит. Пора чинить не всё сразу, а одну дырку.'];
  if(idx<60) return ['Рабочий режим, без запаса','На жизнь хватает, на кайф — впритык. Один точный ход это меняет.'];
  if(idx<80) return ['Ты в ресурсе','Редкий зверь. Осталось сделать так, чтобы это не было случайностью.'];
  return ['Фонтан. Поделись рецептом','Такой заряд надо не тратить, а инвестировать. И защищать.'];
}

function finishQuiz(){
  S.quiz={ a:qAns, index:calcIndex(qAns), date:todayStr() }; save();
  show('scr-calc'); $('#calc-can').innerHTML=canSVG(8);
  var lines=['Сверяем с внутренней бухгалтерией…','Учитываем курс, ставку и печенье…','Отделяем усталость от лени… её нет','Готово.'];
  var i=0, iv=setInterval(function(){
    i++; if(i<lines.length){ $('#calc-line').textContent=lines[i]; $('#calc-can').innerHTML=canSVG(8+i*25); }
    else { clearInterval(iv); pshh(); renderResult(); show('scr-result'); }
  },900);
}

function renderResult(){
  var idx=S.quiz.index, v=verdict(idx);
  $('#res-verdict').textContent=v[0]; $('#res-sub').textContent=v[1];
  var n=0, numEl=$('#res-num');
  var iv=setInterval(function(){ n+=Math.max(1,Math.round(idx/30)); if(n>=idx){ n=idx; clearInterval(iv);} numEl.textContent=n; },40);
  setTimeout(function(){ $('#res-dot').style.left=idx+'%'; },100);
  var fs=factors(S.quiz.a), minF=fs[0];
  fs.forEach(function(f){ if(f.v<minF.v) minF=f; });
  var fh='';
  fs.forEach(function(f){
    fh+='<div class="factor'+(f===minF?' low':'')+'"><span>'+f.name+'</span>'+
        '<div class="fbar"><i data-w="'+f.v+'"></i></div><span class="fval">'+f.v+'</span></div>';
  });
  $('#res-factors').innerHTML=fh;
  setTimeout(function(){ $$('#res-factors .fbar i').forEach(function(b){ b.style.width=b.dataset.w+'%'; }); },150);
  var rec=habit(LEAK2HABIT[minF.id]);
  $('#res-leak').innerHTML='Больше всего энергии утекает здесь: <b>'+minF.name.toLowerCase()+'</b>. '+
    'Самый выгодный первый ход — «'+rec.title+'». '+rec.why;
  S.recommend=rec.id; save();
}

/* ---------- полка ---------- */
var shelfSel=null, shelfAddMode=false;
function renderShelf(addMode){
  shelfAddMode=!!addMode; shelfSel=null;
  var used=S.habits.map(function(h){ return h.id; });
  var sh=$('#shelf'); sh.innerHTML='';
  HABITS.forEach(function(h){
    if(shelfAddMode && used.indexOf(h.id)>=0) return;
    var b=document.createElement('button'); b.className='poster'; b.dataset.id=h.id;
    var badge = (!shelfAddMode && h.id===S.recommend) ? '<div class="poster-badge">⚡ твой лучший ход</div>' : '';
    b.innerHTML='<img src="assets/img/'+h.img+'.jpg" alt="" loading="lazy">'+
      '<div class="poster-veil"></div>'+badge+
      '<div class="poster-check">✓</div>'+
      '<div class="poster-txt"><div class="poster-title">'+h.title+'</div>'+
      '<div class="poster-line">'+h.line+'</div></div>';
    b.addEventListener('click',function(){
      shelfSel=h.id; tick();
      $$('.poster').forEach(function(p){ p.classList.toggle('sel',p.dataset.id===h.id); });
      $('#shelf-hint').innerHTML='<b>'+h.title+'</b> · '+h.why;
      $('#btn-pick').disabled=false;
    });
    sh.appendChild(b);
  });
  $('#shelf-hint').textContent = shelfAddMode ? 'Сезон 2: добавь вторую привычку к текущей.' :
    'Листай полку. Одна привычка — как один сериал: смотрят по одному.';
  $('#btn-pick').disabled=true;
  $('#btn-pick').textContent = shelfAddMode ? 'Добавить в сезон' : 'Запустить сезон';
}
$('#btn-pick').addEventListener('click',function(){
  if(!shelfSel) return;
  S.habits.push({ id:shelfSel, start:todayStr() });
  if(shelfAddMode && !S.achv.spin){ S.achv.spin=todayStr(); }
  save(); pshh();
  var h=habit(shelfSel);
  $('#plan-title').innerHTML='«'+h.title+'» · <span class="serif" style="font-style:italic">7 серий</span>';
  show('scr-plan');
});

/* ---------- план / напоминания ---------- */
$('#btn-plan-done').addEventListener('click',function(){ route(); });
$('#btn-tg-remind').addEventListener('click',function(){ $('#sheet-tg').classList.add('on'); });
$$('.sheet-close').forEach(function(b){ b.addEventListener('click',function(){ this.closest('.sheet').classList.remove('on'); }); });
$$('.sheet').forEach(function(s){ s.addEventListener('click',function(e){ if(e.target===s) s.classList.remove('on'); }); });
$('#btn-tg-open').addEventListener('click',function(){
  var t=($('#remind-time').value||'21:30').replace(':','');
  S.remind=$('#remind-time').value||'21:30'; save();
  window.open('https://t.me/dzen_energy_bot?start=t'+t,'_blank');
});
$('#btn-ics').addEventListener('click',function(){
  var time=($('#remind-time').value||'21:30').replace(':','')+'00';
  S.remind=$('#remind-time').value; save();
  var start=todayStr().replace(/-/g,'');
  var ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DZEN//Energy//RU\r\nBEGIN:VEVENT\r\n'+
    'UID:dzen-energy-'+Date.now()+'@dzen\r\nDTSTART:'+start+'T'+time+'\r\n'+
    'RRULE:FREQ=DAILY\r\nSUMMARY:⚡ DZEN · замер энергии (30 сек)\r\n'+
    'DESCRIPTION:Три ползунка и день засчитан: '+location.href.split('#')[0]+'\r\n'+
    'BEGIN:VALARM\r\nTRIGGER:PT0M\r\nACTION:DISPLAY\r\nDESCRIPTION:Замер энергии\r\nEND:VALARM\r\n'+
    'END:VEVENT\r\nEND:VCALENDAR';
  var a=document.createElement('a');
  a.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(ics);
  a.download='dzen-energy.ics'; document.body.appendChild(a); a.click(); a.remove();
});

/* ---------- ежедневный замер ---------- */
var checkSliders={};
function renderCheck(){
  var box=$('#check-sliders'); box.innerHTML=''; checkSliders={};
  var vl=$('#voice-line'); if(vl){ vl.hidden=true; vl.textContent=''; }
  var seasonDay=Math.min((S.streak%7)+1,7);
  $('#check-eyebrow').textContent='Серия '+seasonDay+' из 7 · сезон '+(Math.floor(S.streak/7)+1);
  // 1. энергия
  var b1=document.createElement('div'); b1.className='check-block';
  b1.innerHTML='<div class="check-q">Сколько сегодня энергии?</div><div class="check-word"></div>';
  var w1=b1.querySelector('.check-word');
  var s1=slider({ max:100, tint:'#56732E', ends:['на нуле','фонтан'], canViz:true,
    onInput:function(v){ w1.textContent=QUESTIONS[0].words(v); } });
  b1.appendChild(s1); box.appendChild(b1); checkSliders.energy=s1;
  // 2. привычки
  S.habits.forEach(function(hs,i){
    var h=habit(hs.id);
    var b=document.createElement('div'); b.className='check-block';
    b.innerHTML='<div class="check-q">'+h.daily+'</div><div class="check-word"></div>';
    var w=b.querySelector('.check-word');
    var s=slider({ max:100, tint:'#56732E', ends:['нет, сорвался','да, чисто'],
      onInput:function(v){ w.textContent=v<20?'не вышло — бывает':v<50?'наполовину':v<80?'почти чисто':'чисто'; } });
    b.appendChild(s); box.appendChild(b); checkSliders['kept_'+i]=s;
  });
  // 3. сложность
  var b3=document.createElement('div'); b3.className='check-block';
  b3.innerHTML='<div class="check-q">Насколько тяжело далось?</div><div class="check-word"></div>';
  var w3=b3.querySelector('.check-word');
  var s3=slider({ max:100, tint:'#C0563E', ends:['легко','на зубах'],
    onInput:function(v){ w3.textContent=v<20?'само получилось':v<50?'с усилием':v<80?'пришлось бороться':'подвиг, честно'; } });
  b3.appendChild(s3); box.appendChild(b3); checkSliders.hard=s3;
}
$('#btn-go-check').addEventListener('click',function(){
  if(S.lastCheck===todayStr()){ show('scr-home'); return; }
  renderCheck(); show('scr-check');
});
$('#btn-check-done').addEventListener('click',function(){
  var t=todayStr();
  var kept=[]; S.habits.forEach(function(h,i){ kept.push(checkSliders['kept_'+i].getValue()); });
  var rec={ energy:checkSliders.energy.getValue(), kept:kept, hard:checkSliders.hard.getValue() };
  S.days[t]=rec;
  // серия
  if(S.lastCheck===t){ /* повторный — ничего */ }
  else if(S.lastCheck===addDays(t,-1)){ S.streak++; }
  else if(S.lastCheck===addDays(t,-2) && !S.freezes[weekKey(t)]){ S.freezes[weekKey(t)]=addDays(t,-1); S.streak++; }
  else { S.streak=1; }
  S.lastCheck=t; if(S.streak>S.best) S.best=S.streak;
  // ачивки
  if(!S.achv.d1) S.achv.d1=t;
  if(S.streak>=3 && !S.achv.d3) S.achv.d3=t;
  var finale=null;
  [[7,'d7'],[14,'d14'],[21,'d21'],[30,'d30']].forEach(function(p){
    if(S.streak>=p[0] && !S.achv[p[1]]){ S.achv[p[1]]=t; finale=p[0]; }
  });
  save(); pshh();
  if(finale){ renderAchieve(finale); show('scr-achieve'); return; }
  renderDayres(rec); show('scr-dayres');
});
function renderDayres(rec){
  var avgKept = rec.kept.length ? rec.kept.reduce(function(a,b){return a+b;},0)/rec.kept.length : 100;
  var em,ti,su;
  if(avgKept>=70){ em='🏆'; ti='Красавчик. Без вариантов.';
    su=rec.hard>=60?'Тяжело — и всё равно сделал. Это и есть характер.':'Сделал и даже не вспотел. Подозрительно хорош.'; }
  else if(avgKept>=40){ em='⚡'; ti='Держишься. Это уже характер.'; su='Наполовину — это не ноль. Завтра дожмёшь.'; }
  else { em='🌱'; ti='Сорвался — тоже данные.'; su='Серия не про идеальность, а про возвращение. Завтра новая серия.'; }
  $('#dayres-emoji').textContent=em; $('#dayres-title').textContent=ti; $('#dayres-sub').textContent=su;
  $('#dayres-streak').textContent='🔥 Серия: '+S.streak+' '+plural(S.streak,'день','дня','дней');
}
$('#btn-dayres-home').addEventListener('click',function(){ route(); });

/* ---------- дом ---------- */
function renderHome(){
  initCinefades();
  var season=Math.floor((Math.max(S.streak,1)-1)/7)+1;
  var day=S.streak===0?0:((S.streak-1)%7)+1;
  $('#home-season').textContent='Сезон '+season+(day?' · серия '+day:'');
  $('#ring-num').textContent=day;
  // кольцо
  var R=52, C=2*Math.PI*R;
  $('#ring').innerHTML='<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="rgba(244,241,234,.25)" stroke-width="9"/>'+
    '<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="#A8C96B" stroke-width="9" stroke-linecap="round" '+
    'stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-day/7))+'" style="transition:stroke-dashoffset 1.2s cubic-bezier(.22,.9,.3,1)"/>';
  var checked=S.lastCheck===todayStr();
  $('#btn-go-check').textContent=checked?'Сегодня уже засчитано ✓':'Замерить день · 30 сек';
  $('#home-checked').textContent=checked?'Серия в безопасности. Возвращайся завтра.':'';
  // спарклайн
  renderSpark();
  // находка
  var ins=bestInsight();
  $('#insight-card').hidden=!ins;
  if(ins) $('#insight-text').textContent=ins;
  // ачивки
  renderAchvRow();
  // карточка привычки
  renderHabitCard();
}
function renderSpark(){
  var svg=$('#spark'); var pts=[], labels=[];
  for(var i=13;i>=0;i--){
    var d=addDays(todayStr(),-i), rec=S.days[d];
    pts.push(rec?rec.energy:null); labels.push(d.slice(8));
  }
  var hasData=pts.some(function(p){ return p!==null; });
  if(!hasData){ svg.innerHTML='<text x="150" y="50" text-anchor="middle" font-size="12" fill="#6E6A5F" font-family="Inter,sans-serif">Первый замер появится здесь сегодня вечером</text>'; $('#spark-legend').innerHTML=''; return; }
  var path='', dots='';
  pts.forEach(function(p,i){
    if(p===null) return;
    var x=10+ i*(280/13), y=80-(p/100)*68;
    path+=(path?' L':'M')+x.toFixed(1)+' '+y.toFixed(1);
    dots+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.4" fill="#56732E"/>';
  });
  svg.innerHTML='<path d="'+path+'" fill="none" stroke="#A8C96B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+dots;
  $('#spark-legend').innerHTML='<span>2 недели назад</span><span>сегодня</span>';
}
function bestInsight(){
  var withH=[], without=[];
  Object.keys(S.days).forEach(function(d){
    var r=S.days[d]; if(!r.kept || !r.kept.length) return;
    var avg=r.kept.reduce(function(a,b){return a+b;},0)/r.kept.length;
    (avg>=60?withH:without).push(r.energy);
  });
  if(withH.length<2 || without.length<1) return null;
  var m1=withH.reduce(function(a,b){return a+b;},0)/withH.length;
  var m2=without.reduce(function(a,b){return a+b;},0)/without.length;
  var diff=Math.round(m1-m2);
  var h=habit(S.habits[0].id);
  if(diff>=5) return 'В дни, когда ты держишь «'+h.title+'», энергия в среднем на '+diff+' пунктов выше. Это не совпадение.';
  if(diff<=-5) return 'Пока в дни срывов энергия даже выше. Дай привычке ещё пару дней — тело медленнее интернета.';
  return 'Разница пока в пределах погрешности. Данные копятся — находка зреет.';
}
var ACHV=[
  { id:'d1', ic:'🎬', t:'Пилотная серия' },
  { id:'d3', ic:'⚡', t:'3 серии подряд' },
  { id:'d7', ic:'🏆', t:'Финал сезона' },
  { id:'spin', ic:'🌿', t:'Спин-офф: 2-я привычка' },
  { id:'d14', ic:'🥈', t:'Сезон 2' },
  { id:'d21', ic:'🥇', t:'Культовый сериал' },
  { id:'d30', ic:'👑', t:'Месяц в ресурсе' }
];
function renderAchvRow(){
  var h=''; ACHV.forEach(function(a){
    var got=!!S.achv[a.id];
    h+='<div class="achv'+(got?'':' locked')+'"><div class="a-ic">'+a.ic+'</div><div class="a-t">'+a.t+'</div></div>';
  });
  $('#achv-row').innerHTML=h;
}
function renderHabitCard(){
  var card=$('#habit-card'); var h='<div class="card-title">Твой фокус</div>';
  S.habits.forEach(function(hs){
    var hb=habit(hs.id);
    h+='<div class="h-title">'+hb.title+'</div><div class="small">с '+hs.start.split('-').reverse().join('.')+' · '+hb.why+'</div>';
  });
  h+='<div class="h-actions">';
  if(S.achv.d7 && S.habits.length<2)
    h+='<button class="btn btn-soft" id="btn-add-habit">Добавить вторую привычку</button>';
  if(S.habits.length && daysBetween(S.habits[0].start,todayStr())>=30)
    h+='<button class="btn btn-soft" id="btn-swap-habit">Заменить привычку — она уже твоя</button>';
  h+='<button class="btn btn-ghost" id="btn-remind-again">Настроить напоминание</button></div>';
  card.innerHTML=h;
  var add=$('#btn-add-habit'); if(add) add.addEventListener('click',function(){ renderShelf(true); show('scr-shelf'); });
  var swap=$('#btn-swap-habit'); if(swap) swap.addEventListener('click',function(){
    S.habits.shift(); save(); renderShelf(S.habits.length>0); show('scr-shelf');
  });
  $('#btn-remind-again').addEventListener('click',function(){
    var hb=habit(S.habits[0].id);
    $('#plan-title').innerHTML='«'+hb.title+'»';
    show('scr-plan');
  });
}

/* ---------- финал сезона: конфетти + карточка ---------- */
function renderAchieve(days){
  startConfetti();
  var unlock=$('#btn-achieve-next');
  unlock.hidden=!(days===7 && S.habits.length<2);
  drawShareCard(days);
}
$('#btn-achieve-next').addEventListener('click',function(){ renderShelf(true); show('scr-shelf'); });
$('#btn-achieve-home').addEventListener('click',function(){ route(); });

var achieveBg=null;
function drawShareCard(days){
  var cv=$('#share-card'), ctx=cv.getContext('2d');
  var h=habit(S.habits[0].id);
  function paint(){
    ctx.clearRect(0,0,1080,1350);
    if(achieveBg){ ctx.drawImage(achieveBg,0,0,1080,1350); }
    else { ctx.fillStyle='#F4F1EA'; ctx.fillRect(0,0,1080,1350); }
    ctx.fillStyle='rgba(244,241,234,.55)'; ctx.fillRect(70,70,940,1210);
    ctx.strokeStyle='#2B2A26'; ctx.lineWidth=3; ctx.strokeRect(70,70,940,1210);
    ctx.textAlign='center'; ctx.fillStyle='#56732E';
    ctx.font='650 34px Inter, sans-serif';
    ctx.fillText('D Z E N  ·  Э Н Е Р Г И Я',540,180);
    ctx.fillStyle='#2B2A26';
    ctx.font='italic 500 110px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(days===7?'Финал сезона':days+' дней',540,350);
    ctx.font='250 300px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(String(days),540,680);
    ctx.font='500 44px Inter, sans-serif';
    ctx.fillText('дней подряд',540,790);
    ctx.font='italic 600 72px "Cormorant Garamond", Georgia, serif';
    wrapText(ctx,'«'+h.title+'»',540,940,860,80);
    // дельта энергии
    var delta=energyDelta();
    ctx.font='500 40px Inter, sans-serif'; ctx.fillStyle='#56732E';
    ctx.fillText(delta!==null?('энергия за неделю: '+(delta>=0?'+':'')+delta+' '+plural(Math.abs(delta),'пункт','пункта','пунктов')):'энергия под контролем',540,1080);
    ctx.fillStyle='#6E6A5F'; ctx.font='400 32px Inter, sans-serif';
    ctx.fillText('замерь свою · dzen энергия',540,1200);
  }
  if(!achieveBg){
    var img=new Image(); img.src='assets/img/frame_achieve.jpg';
    img.onload=function(){ achieveBg=img; paint(); };
    img.onerror=paint;
  }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
  paint();
}
function wrapText(ctx,text,x,y,maxW,lh){
  var words=text.split(' '), line='', yy=y;
  words.forEach(function(w){
    var t=line?line+' '+w:w;
    if(ctx.measureText(t).width>maxW && line){ ctx.fillText(line,x,yy); line=w; yy+=lh; }
    else line=t;
  });
  ctx.fillText(line,x,yy);
}
function energyDelta(){
  var t=todayStr(), first=S.days[addDays(t,-6)], last=S.days[t];
  if(!first||!last) return null;
  return Math.round(last.energy-first.energy);
}
function cardBlob(cb){ $('#share-card').toBlob(cb,'image/png'); }
$('#btn-share-save').addEventListener('click',function(){
  cardBlob(function(b){
    var a=document.createElement('a'); a.href=URL.createObjectURL(b);
    a.download='dzen-energy-achievement.png'; document.body.appendChild(a); a.click(); a.remove();
  });
});
$('#btn-share-tg').addEventListener('click',function(){
  var h=habit(S.habits[0].id);
  var text='🏆 Финал сезона: '+S.streak+' дней подряд — «'+h.title+'». Замерь свою энергию:';
  cardBlob(function(b){
    var file=new File([b],'dzen-energy.png',{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      navigator.share({ files:[file], text:text+' '+location.href.split('#')[0] }).catch(function(){});
    } else {
      window.open('https://t.me/share/url?url='+encodeURIComponent(location.href.split('#')[0])+'&text='+encodeURIComponent(text),'_blank');
    }
  });
});

/* ---------- конфетти ---------- */
function startConfetti(){
  var cv=$('#confetti'), ctx=cv.getContext('2d');
  cv.width=cv.offsetWidth; cv.height=cv.offsetHeight;
  var cols=['#A8C96B','#C2791B','#7A5C93','#C0563E','#FBFAF6'];
  var ps=[]; for(var i=0;i<90;i++) ps.push({
    x:Math.random()*cv.width, y:-20-Math.random()*cv.height*0.5,
    s:4+Math.random()*6, vy:1.5+Math.random()*2.5, vx:(Math.random()-0.5)*1.5,
    c:cols[i%cols.length], r:Math.random()*Math.PI, vr:(Math.random()-0.5)*0.2 });
  var frames=0;
  (function loop(){
    ctx.clearRect(0,0,cv.width,cv.height);
    ps.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle=p.c; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.6); ctx.restore();
    });
    if(++frames<420) requestAnimationFrame(loop); else ctx.clearRect(0,0,cv.width,cv.height);
  })();
}

/* ---------- демо ---------- */
$('#btn-demo').addEventListener('click',function(e){
  e.preventDefault();
  if(S.demo){ // вернуть
    try{ var bak=JSON.parse(localStorage.getItem(KEY+'.bak')); if(bak){ S=bak; save(); } }catch(err){}
    S.demo=false; save(); route(); $('#btn-demo').textContent='показать, как будет через неделю · демо'; return;
  }
  try{ localStorage.setItem(KEY+'.bak',JSON.stringify(S)); }catch(err){}
  if(!S.quiz) S.quiz={ a:{energy:34,sleep:2,sugar:1,screen:5,move:2,stress:70}, index:38, date:todayStr() };
  if(!S.habits.length) S.habits=[{ id:'sleep', start:addDays(todayStr(),-6) }];
  var t=todayStr();
  var demo=[38,45,41,55,60,58,72];
  for(var i=0;i<7;i++){
    S.days[addDays(t,-(6-i))]={ energy:demo[i], kept:[i===2?30:80+i*2], hard:70-i*7 };
  }
  S.streak=7; S.best=7; S.lastCheck=t;
  S.achv.d1=S.achv.d1||t; S.achv.d3=S.achv.d3||t; S.achv.d7=S.achv.d7||t;
  S.demo=true; save();
  $('#btn-demo').textContent='вернуть как было · выйти из демо';
  renderAchieve(7); show('scr-achieve');
});
$('#btn-reset').addEventListener('click',function(e){
  e.preventDefault();
  if(confirm('Точно начать заново? История замеров сотрётся.')){
    localStorage.removeItem(KEY); S=load(); route();
  }
});

/* ---------- голосовой ввод ---------- */
var AI_KEY='dzen10.ai';
function aiConf(){ try{ return JSON.parse(localStorage.getItem(AI_KEY))||{provider:'local',key:''}; }catch(e){ return {provider:'local',key:''}; } }

var NUMWORDS={'ноль':0,'один':1,'одна':1,'два':2,'две':2,'три':3,'четыре':4,'пять':5,'шесть':6,'семь':7,
  'восемь':8,'девять':9,'десять':10,'пятнадцать':15,'двадцать':20,'тридцать':30,'сорок':40,
  'пятьдесят':50,'шестьдесят':60,'семьдесят':70,'восемьдесят':80,'девяносто':90,'сто':100};
function wordsToNums(s){
  // «семьдесят пять» → 75
  return s.replace(/(двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто)\s+(один|два|три|четыре|пять|шесть|семь|восемь|девять)/g,
    function(m,a,b){ return (NUMWORDS[a]+NUMWORDS[b]); })
    .replace(/[а-яё]+/g,function(w){ return (w in NUMWORDS)?NUMWORDS[w]:w; });
}
function localParse(text){
  var t=wordsToNums(text.toLowerCase());
  var out={energy:null,kept:null,hard:null};
  var m=t.match(/энерг[а-яё]*[^0-9]{0,12}(\d{1,3})/); if(m) out.energy=+m[1];
  var nums=(t.match(/\d{1,3}/g)||[]).map(Number).filter(function(n){return n<=100;});
  if(out.energy===null && nums.length) out.energy=nums[0];
  if(/(сорвал|не держал|не смог|съел|нарушил|провалил)/.test(t)) out.kept=10;
  else if(/(наполовину|частично|почти)/.test(t)) out.kept=55;
  else if(/(держал|чисто|не ел|не брал|без сладкого|получилось|справил|удержал|лёг до|лег до)/.test(t)) out.kept=90;
  if(/(очень тяжело|на зубах|еле|адски|с трудом)/.test(t)) out.hard=90;
  else if(/(тяжело|сложно|трудно)/.test(t)) out.hard=75;
  else if(/(нормально|средне|терпимо)/.test(t)) out.hard=45;
  else if(/(легко|само|без проблем|спокойно)/.test(t)) out.hard=12;
  return out;
}
function aiParse(text,cb){
  var c=aiConf();
  var sys='Ты парсер дневного замера. Пользователь наговорил итог дня. Верни ТОЛЬКО JSON вида '+
    '{"energy":число 0-100 или null,"kept":число 0-100 или null,"hard":число 0-100 или null}. '+
    'energy — уровень энергии сегодня. kept — насколько держался привычки («'+(S.habits[0]?habit(S.habits[0].id).title:'привычка')+'»): '+
    'сорвался/нет=5-20, наполовину=50-60, держался/чисто=85-100. hard — насколько тяжело далось: легко=5-20, средне=40-60, тяжело=70-95. '+
    'Если про что-то не сказано — null. Никакого текста кроме JSON.';
  function done(raw){
    try{ var j=JSON.parse((raw.match(/\{[\s\S]*\}/)||['{}'])[0]); cb(j,null); }
    catch(e){ cb(null,'не разобрал ответ нейронки'); }
  }
  if(c.provider==='claude' && c.key){
    fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{
      'x-api-key':c.key,'anthropic-version':'2023-06-01','content-type':'application/json',
      'anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:150,system:sys,
        messages:[{role:'user',content:text}]})})
      .then(function(r){return r.json();})
      .then(function(d){ done(d.content&&d.content[0]?d.content[0].text:''); })
      .catch(function(){ cb(null,'сеть'); });
  } else if(c.provider==='groq' && c.key){
    fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{
      'Authorization':'Bearer '+c.key,'Content-Type':'application/json'},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',temperature:0,
        response_format:{type:'json_object'},
        messages:[{role:'system',content:sys},{role:'user',content:text}]})})
      .then(function(r){return r.json();})
      .then(function(d){ done(d.choices&&d.choices[0]?d.choices[0].message.content:''); })
      .catch(function(){ cb(null,'сеть'); });
  } else { cb(localParse(text),null); }
}
function applyVoice(res,transcript){
  var line=$('#voice-line'); line.hidden=false;
  if(!res){ line.textContent='«'+transcript+'» — нейронка не ответила, разобрал по словам.'; res=localParse(transcript); }
  var parts=[];
  if(res.energy!==null&&res.energy!==undefined&&checkSliders.energy){ checkSliders.energy.setValue(res.energy); parts.push('энергия '+Math.round(res.energy)); }
  if(res.kept!==null&&res.kept!==undefined){ S.habits.forEach(function(h,i){ if(checkSliders['kept_'+i]) checkSliders['kept_'+i].setValue(res.kept); }); parts.push('привычка '+Math.round(res.kept)); }
  if(res.hard!==null&&res.hard!==undefined&&checkSliders.hard){ checkSliders.hard.setValue(res.hard); parts.push('сложность '+Math.round(res.hard)); }
  line.textContent=parts.length?('Понял так: '+parts.join(' · ')+'. Поправь ползунком, если не так.')
    :('«'+transcript+'» — не понял значений. Скажи, например: «энергия 70, держался, далось легко».');
  if(parts.length) pshh();
}
// глобально — для тестов и отладки
window.dzenVoiceApply=function(text){ aiParse(text,function(res){ applyVoice(res||localParse(text),text); }); };
function voiceInit(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var btn=$('#btn-voice'); if(!btn) return;
  if(!SR){ btn.hidden=true; return; }
  btn.hidden=false;
  var rec=null, listening=false;
  btn.addEventListener('click',function(){
    if(listening){ try{rec.stop();}catch(e){} return; }
    rec=new SR(); rec.lang='ru-RU'; rec.interimResults=false; rec.maxAlternatives=1;
    listening=true; btn.classList.add('listening');
    btn.innerHTML='<span class="voice-ic">🔴</span> Слушаю… говори (тап — стоп)';
    var lineEl=$('#voice-line'); lineEl.hidden=false; lineEl.textContent='Например: «энергия 70, сладкое не ел, далось тяжело»';
    function reset(){ listening=false; btn.classList.remove('listening');
      btn.innerHTML='<span class="voice-ic">🎙</span> Наговори голосом — ползунки встанут сами'; }
    rec.onresult=function(e){
      var text=e.results[0][0].transcript; reset();
      lineEl.textContent='«'+text+'» — думаю…';
      aiParse(text,function(res){ applyVoice(res,text); });
    };
    rec.onerror=function(e){ reset(); lineEl.textContent=e.error==='not-allowed'?'Разреши доступ к микрофону в браузере.':'Не расслышал — попробуй ещё раз.'; };
    rec.onend=function(){ if(listening) reset(); };
    try{ rec.start(); }catch(e){ reset(); }
  });
}
$('#btn-ai').addEventListener('click',function(e){
  e.preventDefault();
  var c=aiConf(); $('#ai-provider').value=c.provider; $('#ai-key').value=c.key||'';
  $('#sheet-ai').classList.add('on');
});
$('#btn-ai-save').addEventListener('click',function(){
  localStorage.setItem(AI_KEY,JSON.stringify({provider:$('#ai-provider').value,key:$('#ai-key').value.trim()}));
  $('#sheet-ai').classList.remove('on'); tick();
});

/* ---------- онбординг-навигация ---------- */
$('#btn-start').addEventListener('click',function(){ ac(); show('scr-story1'); });
$$('.story-next').forEach(function(b){
  b.addEventListener('click',function(){
    var cur=this.closest('.scr').id;
    show(cur==='scr-story1'?'scr-story2':'scr-story3');
  });
});
$('#btn-to-quiz').addEventListener('click',startQuiz);
$('#btn-to-shelf').addEventListener('click',function(){ renderShelf(false); show('scr-shelf'); });

/* ---------- старт ---------- */
// «волшебная ссылка» настройки нейронки: #ai=groq:KEY или #ai=claude:KEY
(function(){
  var m=location.hash.match(/^#ai=(groq|claude|local):?(.*)$/);
  if(m){
    localStorage.setItem(AI_KEY,JSON.stringify({provider:m[1],key:decodeURIComponent(m[2]||'')}));
    history.replaceState(null,'',location.pathname+location.search);
    setTimeout(function(){ alert('Нейронка для голоса подключена: '+(m[1]==='groq'?'Groq':m[1]==='claude'?'Claude':'разбор по словам')); },400);
  }
})();
initCinefades();
voiceInit();
route();
