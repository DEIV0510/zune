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

  /* ---------- Navbar scroll state + scroll progress + hero parallax ---------- */
  var navbar = document.getElementById('navbar');
  var scrollProgress = document.getElementById('scrollProgress');
  var heroGlow = document.querySelector('.hero-glow');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y > 8) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');

    if (scrollProgress) {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.min(1, y / docH) : 0;
      scrollProgress.style.transform = 'scaleX(' + pct + ')';
    }
    if (heroGlow && !reduceMotion && y < 900) {
      heroGlow.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    }
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link on scroll ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var navSections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && navSections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    navSections.forEach(function (s) { navIO.observe(s); });
  }

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

  /* ---------- Catalog helpers ---------- */
  function normalize(s) {
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function waLink(msg) {
    return 'https://wa.me/573116239284?text=' + encodeURIComponent(msg);
  }

  /* ---------- Catalog ---------- */
  var PAGE_SIZE = 12;
  var catalogData = null;
  var activeFilter = 'todos';
  var searchQuery = '';
  var visibleCount = PAGE_SIZE;

  var catalogGrid = document.getElementById('catalogGrid');
  var catalogFilters = document.getElementById('catalogFilters');
  var catalogSearch = document.getElementById('catalogSearch');
  var catalogCount = document.getElementById('catalogCount');
  var catalogEmpty = document.getElementById('catalogEmpty');
  var catalogMore = document.getElementById('catalogMore');

  function getFiltered() {
    if (!catalogData) return [];
    var q = normalize(searchQuery.trim());
    return catalogData.products.filter(function (p) {
      if (activeFilter !== 'todos' && p.group !== activeFilter) return false;
      if (!q) return true;
      var typeWords = p.type === 'cuadro' ? 'cuadro cuadros' : 'funda fundas';
      var hay = normalize(p.name + ' ' + p.groupLabel + ' ' + (p.context || '') + ' ' + typeWords);
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHTML(p) {
    var countBadge = p.images.length > 1 ? '<span class="catalog-card-count">' + p.images.length + ' fotos</span>' : '';
    return '' +
      '<article class="catalog-card">' +
        '<button class="catalog-card-media" data-open="' + p.id + '" aria-label="Ver detalles de ' + p.name + '">' +
          '<img src="' + p.thumb + '" alt="' + p.name + ' — ' + p.groupLabel + '" loading="lazy" decoding="async" width="420" height="420">' +
          countBadge +
        '</button>' +
        '<div class="catalog-card-body">' +
          '<span class="catalog-card-cat">' + p.groupLabel + '</span>' +
          '<h3>' + p.name + '</h3>' +
          '<p>' + p.description + '</p>' +
          '<div class="catalog-card-actions">' +
            '<button class="btn btn-outline" data-open="' + p.id + '">Ver detalles</button>' +
            '<a class="btn btn-primary" href="' + waLink(p.waMessage) + '" target="_blank" rel="noopener">Cotizar</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderGrid() {
    if (!catalogData) return;
    var filtered = getFiltered();
    var slice = filtered.slice(0, visibleCount);
    catalogGrid.innerHTML = slice.map(cardHTML).join('');
    catalogEmpty.hidden = filtered.length > 0;
    catalogMore.hidden = filtered.length <= visibleCount;
    catalogCount.textContent = filtered.length + (filtered.length === 1 ? ' producto encontrado' : ' productos encontrados');
  }

  function renderFilters() {
    if (!catalogData) return;
    var chips = [{ id: 'todos', label: 'Todos', count: catalogData.products.length }].concat(catalogData.groups);
    catalogFilters.innerHTML = chips.map(function (g) {
      return '<button class="chip' + (g.id === activeFilter ? ' is-active' : '') + '" data-filter="' + g.id + '">' + g.label + ' (' + g.count + ')</button>';
    }).join('');
  }

  if (catalogGrid) {
    fetch('assets/catalog.json').then(function (r) { return r.json(); }).then(function (data) {
      catalogData = data;
      renderFilters();
      renderGrid();
    }).catch(function (e) { console.error('No se pudo cargar el catálogo', e); });

    catalogFilters.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.getAttribute('data-filter');
      visibleCount = PAGE_SIZE;
      renderFilters();
      renderGrid();
    });

    var searchDebounce;
    catalogSearch.addEventListener('input', function () {
      window.clearTimeout(searchDebounce);
      searchDebounce = window.setTimeout(function () {
        searchQuery = catalogSearch.value;
        visibleCount = PAGE_SIZE;
        renderGrid();
      }, 150);
    });

    catalogMore.addEventListener('click', function () {
      visibleCount += PAGE_SIZE;
      renderGrid();
    });

    catalogGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open]');
      if (!btn) return;
      openProductModal(btn.getAttribute('data-open'));
    });
  }

  /* ---------- Product detail modal ---------- */
  var pmodal = document.getElementById('pmodal');
  var pmodalGallery = document.getElementById('pmodalGallery');
  var pmodalDots = document.getElementById('pmodalDots');
  var pmodalPrevImg = document.getElementById('pmodalPrevImg');
  var pmodalNextImg = document.getElementById('pmodalNextImg');
  var pmodalCat = document.getElementById('pmodalCat');
  var pmodalName = document.getElementById('pmodalName');
  var pmodalDesc = document.getElementById('pmodalDesc');
  var pmodalWa = document.getElementById('pmodalWa');
  var pmodalRelated = document.getElementById('pmodalRelated');
  var pmodalRelatedRow = document.getElementById('pmodalRelatedRow');
  var pmodalClose = document.getElementById('pmodalClose');
  var pmodalBackdrop = document.getElementById('pmodalBackdrop');

  function findProduct(id) {
    return catalogData ? catalogData.products.filter(function (p) { return p.id === id; })[0] : null;
  }

  function openProductModal(id) {
    var p = findProduct(id);
    if (!p || !pmodal) return;

    pmodalGallery.innerHTML = p.images.map(function (src, i) {
      return '<img src="' + src + '" alt="' + p.name + ' foto ' + (i + 1) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async">';
    }).join('');
    var multi = p.images.length > 1;
    pmodalDots.innerHTML = multi ? p.images.map(function (_, i) {
      return '<span' + (i === 0 ? ' class="is-active"' : '') + '></span>';
    }).join('') : '';
    pmodalPrevImg.hidden = !multi;
    pmodalNextImg.hidden = !multi;
    pmodalGallery.scrollLeft = 0;

    pmodalCat.textContent = p.groupLabel;
    pmodalName.textContent = p.name;
    pmodalDesc.textContent = p.description;
    pmodalWa.href = waLink(p.waMessage);

    var related = catalogData.products.filter(function (o) { return o.group === p.group && o.id !== p.id; }).slice(0, 8);
    pmodalRelated.hidden = related.length === 0;
    pmodalRelatedRow.innerHTML = related.map(function (r) {
      return '<button class="pmodal-related-item" data-open="' + r.id + '"><img src="' + r.thumb + '" alt="' + r.name + '" loading="lazy"><span>' + r.name + '</span></button>';
    }).join('');

    pmodal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (!pmodal) return;
    pmodal.hidden = true;
    document.body.style.overflow = '';
  }

  function setActiveDot(idx) {
    var dots = pmodalDots.querySelectorAll('span');
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
  }

  function scrollGalleryTo(i) {
    var imgs = pmodalGallery.querySelectorAll('img');
    if (!imgs[i]) return;
    pmodalGallery.scrollTo({ left: imgs[i].offsetLeft, behavior: 'smooth' });
    setActiveDot(i); // update immediately; don't depend solely on the scroll event
  }

  if (pmodal) {
    pmodalClose.addEventListener('click', closeProductModal);
    pmodalBackdrop.addEventListener('click', closeProductModal);
    document.addEventListener('keydown', function (e) {
      if (pmodal.hidden) return;
      if (e.key === 'Escape') closeProductModal();
    });

    pmodalPrevImg.addEventListener('click', function () {
      var idx = Math.round(pmodalGallery.scrollLeft / (pmodalGallery.clientWidth || 1));
      scrollGalleryTo(Math.max(0, idx - 1));
    });
    pmodalNextImg.addEventListener('click', function () {
      var imgs = pmodalGallery.querySelectorAll('img');
      var idx = Math.round(pmodalGallery.scrollLeft / (pmodalGallery.clientWidth || 1));
      scrollGalleryTo(Math.min(imgs.length - 1, idx + 1));
    });
    pmodalGallery.addEventListener('scroll', function () {
      var idx = Math.round(pmodalGallery.scrollLeft / (pmodalGallery.clientWidth || 1));
      setActiveDot(idx);
    }, { passive: true });

    pmodalRelatedRow.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open]');
      if (!btn) return;
      openProductModal(btn.getAttribute('data-open'));
    });
  }

  /* ---------- Gallery strip nav ---------- */
  var galleryStrip = document.getElementById('galleryGrid');
  var galleryPrev = document.getElementById('galleryPrev');
  var galleryNext = document.getElementById('galleryNext');
  if (galleryStrip && galleryPrev && galleryNext) {
    var galStep = function () {
      var item = galleryStrip.querySelector('.gal-item');
      return item ? item.getBoundingClientRect().width + 10 : 200;
    };
    galleryPrev.addEventListener('click', function () { galleryStrip.scrollBy({ left: -galStep() * 3, behavior: 'smooth' }); });
    galleryNext.addEventListener('click', function () { galleryStrip.scrollBy({ left: galStep() * 3, behavior: 'smooth' }); });
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
