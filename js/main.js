/**
 * Odonto Company - Script principal
 * Menu mobile, FAQ accordion, controle de destaques por slot, acessibilidade
 */
(function () {
  'use strict';

  var config = window.ODONTO_CONFIG || { showPromo: true };

  // ----- Destaques por slot: exibir/ocultar conforme config (evita ad block) -----
  function initPromoSlots() {
    var wrappers = document.querySelectorAll('.promo-slot-wrap[data-show-promo]');
    var show = !!config.showPromo;
    wrappers.forEach(function (el) {
      el.setAttribute('data-visible', show ? 'true' : 'false');
    });
  }

  // ----- Header: menu mobile -----
  function initHeader() {
    var header = document.getElementById('header');
    var btn = header && header.querySelector('.header__menu-btn');
    var nav = document.getElementById('nav-main');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      nav.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Fechar ao clicar em link (navegação)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Fechar com Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('open')) {
        header.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // ----- FAQ: accordion -----
  function initFaq() {
    var questions = document.querySelectorAll('.faq__question');
    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq__item');
        var answer = item && item.querySelector('.faq__answer');
        if (!item || !answer) return;
        var expanded = item.getAttribute('aria-expanded') === 'true';
        item.setAttribute('aria-expanded', !expanded);
        btn.setAttribute('aria-expanded', !expanded);
        answer.hidden = expanded;
      });
    });
  }

  // ----- Scroll reveal: animação ao entrar na viewport -----
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length || !window.IntersectionObserver) {
      reveals.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ----- Header: sombra ao rolar a página -----
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;
    var scrollY = 0;
    function update() {
      var now = window.scrollY || window.pageYOffset;
      if (now > 60 && scrollY <= 60) {
        header.classList.add('header--scrolled');
      } else if (now <= 60 && scrollY > 60) {
        header.classList.remove('header--scrolled');
      }
      scrollY = now;
    }
    window.addEventListener('scroll', function () {
      if (window.requestAnimationFrame) {
        requestAnimationFrame(update);
      } else {
        update();
      }
    }, { passive: true });
    update();
  }

  // ----- Lazy load: imagens abaixo da dobra (fallback para browsers antigos) -----
  function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) return;
    var images = document.querySelectorAll('img[loading="lazy"]');
    if (!window.IntersectionObserver) {
      images.forEach(function (img) {
        img.src = img.dataset.src || img.src;
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        io.unobserve(img);
      });
    }, { rootMargin: '100px' });
    images.forEach(function (img) {
      io.observe(img);
    });
  }

  // ----- Inicialização -----
  function init() {
    initPromoSlots();
    initHeader();
    initHeaderScroll();
    initScrollReveal();
    initFaq();
    initLazyLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
