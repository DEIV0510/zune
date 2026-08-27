(function () {
  'use strict';

  /* ---------- Boot / loader ---------- */
  var boot = document.getElementById('boot');
  function hideBoot() {
    if (!boot) return;
    boot.setAttribute('data-hide', '');
    window.setTimeout(function () { boot.remove(); }, 500);
  }
  if (document.readyState === 'complete') {
    window.setTimeout(hideBoot, 120);
  } else {
    window.addEventListener('load', function () { window.setTimeout(hideBoot, 120); });
  }
  window.setTimeout(hideBoot, 900); // hard cap: never block the UI

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById('navbar');
  function onScroll() {
    if (window.scrollY > 8) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    var open = hamburger.getAttribute('aria-expanded') === 'true';
    if (open) { closeMenu(); }
    else {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }
  hamburger.addEventListener('click', toggleMenu);
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Cuadros carousel ---------- */
  var track = document.getElementById('cuadrosCarousel');
  if (track) {
    document.querySelectorAll('.carousel-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        var card = track.querySelector('.cuadro-item');
        var step = card ? card.getBoundingClientRect().width + 18 : 260;
        track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gal-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    var item = galleryItems[currentIndex];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.getAttribute('aria-label') || '';
    lightboxCaption.textContent = item.getAttribute('data-caption') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }
  function step(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
  });
  var lbClose = document.getElementById('lightboxClose');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { step(-1); });
  if (lbNext) lbNext.addEventListener('click', function () { step(1); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

})();
