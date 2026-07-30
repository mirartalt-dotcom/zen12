'use strict';
/* интеграция с Telegram Mini App: шапка/фон, кнопка «Назад», хаптика, безопасные ссылки */
(function(){
  var tg = window.Telegram && window.Telegram.WebApp;
  var IS_TG = !!(tg && tg.platform && tg.platform !== 'unknown');
  window.DZEN_TG = IS_TG;
  if (!IS_TG) return;

  try { tg.ready(); } catch(e){}
  try { tg.expand(); } catch(e){}
  try { if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes(); } catch(e){}

  try {
    var metaColor = document.querySelector('meta[name="theme-color"]');
    if (metaColor && metaColor.content) {
      try { tg.setHeaderColor(metaColor.content); } catch(e){}
      try { tg.setBackgroundColor(metaColor.content); } catch(e){}
    }
  } catch(e){}

  var path = location.pathname;
  var inSubpage = /\/(nf-chat|dk-chat|nf|dk|classic)(\/|$)/.test(path);

  try {
    if (inSubpage) {
      tg.BackButton.show();
      tg.BackButton.onClick(function(){ location.href = '../'; });
    } else {
      tg.BackButton.hide();
    }
  } catch(e){}

  if (/\/(nf-chat|dk-chat)(\/|$)/.test(path)) {
    try { tg.enableClosingConfirmation(); } catch(e){}
  }

  var origOpen = window.open;
  window.open = function(url){
    try {
      if (typeof url === 'string') {
        if (url.indexOf('https://t.me/') === 0) {
          tg.openTelegramLink(url);
          return null;
        }
        if (/^https?:\/\//i.test(url)) {
          tg.openLink(url);
          return null;
        }
      }
    } catch(e){}
    return origOpen.apply(window, arguments);
  };

  document.addEventListener('DOMContentLoaded', function(){
    if (!inSubpage) {
      var links = document.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href') || '';
        if (href.indexOf('github.io/zenkino') !== -1) {
          links[i].setAttribute('href', 'nf/');
        } else if (href.indexOf('github.io/zentalk') !== -1) {
          links[i].setAttribute('href', 'nf-chat/');
        } else if (href.indexOf('github.io/zenfresh') !== -1) {
          links[i].setAttribute('href', 'dk/');
        } else if (href.indexOf('github.io/zenbuddy') !== -1) {
          links[i].setAttribute('href', 'dk-chat/');
        }
      }
    }
  });

  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('a,button');
    if (t) {
      try { tg.HapticFeedback.impactOccurred('light'); } catch(e){}
    }
  });

  document.addEventListener('change', function(e){
    if (e.target && e.target.matches && e.target.matches('input[type=range]')) {
      try { tg.HapticFeedback.selectionChanged(); } catch(e){}
    }
  }, true);
})();
