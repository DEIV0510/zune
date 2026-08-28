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

  /* ---------- Close product modal when navigating via navbar ---------- */
  document.getElementById('navbar').addEventListener('click', function (e) {
    if (e.target.closest('a')) closeProductModal();
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
  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
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

  function cardPriceHTML(p) {
    if (p.type === 'cuadro') return '<span class="catalog-card-price"><small>Desde </small>' + formatCOP(p.priceFrom) + '</span>';
    return '<span class="catalog-card-price">' + formatCOP(p.price) + '</span>';
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
          cardPriceHTML(p) +
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
  var pmodalCrumbs = document.getElementById('pmodalCrumbs');
  var pmodalCat = document.getElementById('pmodalCat');
  var pmodalName = document.getElementById('pmodalName');
  var pmodalDesc = document.getElementById('pmodalDesc');
  var pmodalConfig = document.getElementById('pmodalConfig');
  var pmodalPrice = document.getElementById('pmodalPrice');
  var pmodalWa = document.getElementById('pmodalWa');
  var pmodalRelated = document.getElementById('pmodalRelated');
  var pmodalRelatedRow = document.getElementById('pmodalRelatedRow');
  var pmodalViewAll = document.getElementById('pmodalViewAll');
  var pmodalClose = document.getElementById('pmodalClose');
  var pmodalBackdrop = document.getElementById('pmodalBackdrop');
  var currentProduct = null;
  var configState = {};

  function findProduct(id) {
    return catalogData ? catalogData.products.filter(function (p) { return p.id === id; })[0] : null;
  }

  function optionChipsHTML(mat) {
    return mat.options.map(function (o) {
      return '<button class="pconfig-chip' + (o.id === configState.optionId ? ' is-selected' : '') + '" data-option="' + o.id + '">' + o.label + '</button>';
    }).join('');
  }

  function renderConfig(p) {
    if (p.type === 'cuadro') {
      var mat0 = p.pricing.materials[0];
      configState = { materialId: mat0.id, optionId: mat0.options[0].id, sizeId: p.pricing.sizes[0].id };
      pmodalConfig.innerHTML =
        '<div class="pconfig-group"><span class="pconfig-label">Material</span><div class="pconfig-chips" data-role="material">' +
          p.pricing.materials.map(function (m) {
            return '<button class="pconfig-chip' + (m.id === configState.materialId ? ' is-selected' : '') + '" data-material="' + m.id + '">' + m.label + '</button>';
          }).join('') +
        '</div></div>' +
        '<div class="pconfig-group"><span class="pconfig-label" id="pconfigOptionLabel">' + mat0.finish + '</span><div class="pconfig-chips" data-role="option">' +
          optionChipsHTML(mat0) +
        '</div></div>' +
        '<div class="pconfig-group"><span class="pconfig-label">Tamaño</span><div class="pconfig-chips" data-role="size">' +
          p.pricing.sizes.map(function (s) {
            return '<button class="pconfig-chip' + (s.id === configState.sizeId ? ' is-selected' : '') + '" data-size="' + s.id + '">' + s.label + '</button>';
          }).join('') +
        '</div></div>';
    } else {
      configState = { phone: p.phoneModels[0] };
      pmodalConfig.innerHTML =
        '<div class="pconfig-group"><span class="pconfig-label">Modelo de iPhone</span>' +
          '<select class="pconfig-select" id="pconfigPhone">' +
            p.phoneModels.map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join('') +
          '</select>' +
        '</div>';
    }
  }

  function currentPrice(p) {
    if (p.type === 'cuadro') {
      var mat = p.pricing.materials.filter(function (m) { return m.id === configState.materialId; })[0];
      var opt = mat.options.filter(function (o) { return o.id === configState.optionId; })[0];
      return opt.prices[configState.sizeId];
    }
    return p.price;
  }

  function updatePriceAndWA(p) {
    var price = currentPrice(p);
    pmodalPrice.textContent = formatCOP(price);
    var msg;
    if (p.type === 'cuadro') {
      var mat = p.pricing.materials.filter(function (m) { return m.id === configState.materialId; })[0];
      var opt = mat.options.filter(function (o) { return o.id === configState.optionId; })[0];
      var size = p.pricing.sizes.filter(function (s) { return s.id === configState.sizeId; })[0];
      msg = 'Hola Zune, estoy interesado en cotizar el producto: Cuadro ' + p.name + '. Material: ' + mat.label + ' (' + opt.label + '), Tamaño: ' + size.label + '. Precio: ' + formatCOP(price) + '.';
    } else {
      msg = 'Hola Zune, estoy interesado en cotizar el producto: Funda ' + p.name + '. Modelo: ' + configState.phone + '. Precio: ' + formatCOP(price) + '.';
    }
    pmodalWa.href = waLink(msg);
  }

  if (pmodalConfig) {
    pmodalConfig.addEventListener('click', function (e) {
      var chip = e.target.closest('.pconfig-chip');
      if (!chip || !currentProduct) return;
      if (chip.dataset.material) {
        configState.materialId = chip.dataset.material;
        var mat = currentProduct.pricing.materials.filter(function (m) { return m.id === configState.materialId; })[0];
        configState.optionId = mat.options[0].id;
        document.getElementById('pconfigOptionLabel').textContent = mat.finish;
        pmodalConfig.querySelector('[data-role="option"]').innerHTML = optionChipsHTML(mat);
        pmodalConfig.querySelectorAll('[data-material]').forEach(function (c) { c.classList.toggle('is-selected', c.getAttribute('data-material') === configState.materialId); });
      } else if (chip.dataset.option) {
        configState.optionId = chip.dataset.option;
        pmodalConfig.querySelectorAll('[data-option]').forEach(function (c) { c.classList.toggle('is-selected', c.getAttribute('data-option') === configState.optionId); });
      } else if (chip.dataset.size) {
        configState.sizeId = chip.dataset.size;
        pmodalConfig.querySelectorAll('[data-size]').forEach(function (c) { c.classList.toggle('is-selected', c.getAttribute('data-size') === configState.sizeId); });
      }
      updatePriceAndWA(currentProduct);
    });
    pmodalConfig.addEventListener('change', function (e) {
      if (e.target.id === 'pconfigPhone') {
        configState.phone = e.target.value;
        updatePriceAndWA(currentProduct);
      }
    });
  }

  function openProductModal(id) {
    var p = findProduct(id);
    if (!p || !pmodal) return;
    currentProduct = p;

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

    pmodalCrumbs.innerHTML =
      '<a href="#catalogo" data-close-crumb="1">Catálogo</a><span>/</span>' +
      '<a href="#catalogo" data-crumb-group="' + p.group + '">' + p.groupLabel + '</a><span>/</span>' +
      '<strong>' + p.name + '</strong>';
    pmodalCat.textContent = p.groupLabel;
    pmodalName.textContent = p.name;
    pmodalDesc.textContent = p.description;
    renderConfig(p);
    updatePriceAndWA(p);

    var related = catalogData.products.filter(function (o) { return o.group === p.group && o.id !== p.id; }).slice(0, 6);
    pmodalRelated.hidden = related.length === 0;
    pmodalViewAll.setAttribute('data-view-group', p.group);
    pmodalRelatedRow.innerHTML = related.map(function (r) {
      var priceLabel = r.type === 'cuadro' ? 'Desde ' + formatCOP(r.priceFrom) : formatCOP(r.price);
      return '<button class="pmodal-related-item" data-open="' + r.id + '"><img src="' + r.thumb + '" alt="' + r.name + '" loading="lazy"><span>' + r.name + '</span><small>' + priceLabel + '</small></button>';
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

    function goToCategory(groupId) {
      closeProductModal();
      if (groupId && catalogFilters) {
        activeFilter = groupId;
        visibleCount = PAGE_SIZE;
        renderFilters();
        renderGrid();
      }
      window.setTimeout(function () {
        var target = document.getElementById('catalogo');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }

    pmodalCrumbs.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      goToCategory(a.getAttribute('data-crumb-group'));
    });
    pmodalViewAll.addEventListener('click', function () {
      goToCategory(pmodalViewAll.getAttribute('data-view-group'));
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
