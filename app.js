//<![CDATA[
(function(){
  'use strict';

  var doc = document;
  function qs(s,sc){ return (sc||doc).querySelector(s); }
  function qsa(s,sc){ return Array.prototype.slice.call((sc||doc).querySelectorAll(s)); }

  /* ===== Ripple effect on .btn ===== */
  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch(e){}

  function addRipple(e){
    if (prefersReduced) return;
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var r = doc.createElement('span');
    r.className = 'ripple';
    var size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = String(size) + 'px';
    var x = (e.clientX || 0) - rect.left - size/2;
    var y = (e.clientY || 0) - rect.top - size/2;
    r.style.left = String(x) + 'px';
    r.style.top = String(y) + 'px';
    btn.appendChild(r);
    window.setTimeout(function(){ if (r && r.parentNode) r.parentNode.removeChild(r); }, 600);
  }
  qsa('.btn').forEach(function(b){
    b.addEventListener('click', addRipple, false);
  });

  /* ===== Search / Filter ===== */
  var searchInput = qs('#searchInput');
  var clearBtn = qs('#clearSearchBtn');
  var cards = qsa('.card');

  function normalize(s){ return (s||'').toLowerCase(); }
  function applyFilter(){
    var q = normalize(searchInput ? searchInput.value : '');
    cards.forEach(function(card){
      var name = normalize(card.getAttribute('data-name'));
      var cats = normalize(card.getAttribute('data-category'));
      var ok = !q || name.indexOf(q) !== -1 || cats.indexOf(q) !== -1;
      card.style.display = ok ? '' : 'none';
    });
  }
  if (searchInput){
    searchInput.addEventListener('input', applyFilter, false);
    searchInput.addEventListener('keydown', function(ev){
      if (ev.key === 'Escape'){ searchInput.value=''; applyFilter(); }
    }, false);
  }
  if (clearBtn){
    clearBtn.addEventListener('click', function(){
      if (!searchInput) return;
      searchInput.value=''; searchInput.focus(); applyFilter();
    }, false);
  }

  /* ===== Off-canvas Menu ===== */
  var offcanvas = qs('#offcanvas');
  var openMenuBtn = qs('#openMenuBtn');
  var closeMenuBtn = qs('#closeMenuBtn');
  var closeMenuOverlay = qs('#closeMenuOverlay');
  var lastFocusMenu = null;

  function openMenu(){
    if (!offcanvas) return;
    lastFocusMenu = doc.activeElement;
    offcanvas.setAttribute('aria-hidden','false');
    var firstBtn = qs('.menu-link', offcanvas);
    if (firstBtn) firstBtn.focus();
  }
  function closeMenu(){
    if (!offcanvas) return;
    offcanvas.setAttribute('aria-hidden','true');
    if (lastFocusMenu) lastFocusMenu.focus();
  }
  if (openMenuBtn) openMenuBtn.addEventListener('click', openMenu, false);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu, false);
  if (closeMenuOverlay) closeMenuOverlay.addEventListener('click', closeMenu, false);

  /* ===== Map Modal ===== */
  var mapModal = qs('#mapModal');
  var openMapBtn = qs('#openMapBtn');
  var closeMapBtn = qs('#closeMapBtn');
  var closeMapOverlay = qs('#closeMapOverlay');
  var lastFocusMap = null;

  function openMap(){
    if (!mapModal) return;
    lastFocusMap = doc.activeElement;
    mapModal.setAttribute('aria-hidden','false');
    if (closeMapBtn) closeMapBtn.focus();
  }
  function closeMap(){
    if (!mapModal) return;
    mapModal.setAttribute('aria-hidden','true');
    if (lastFocusMap) lastFocusMap.focus();
  }
  if (openMapBtn) openMapBtn.addEventListener('click', openMap, false);
  if (closeMapBtn) closeMapBtn.addEventListener('click', closeMap, false);
  if (closeMapOverlay) closeMapOverlay.addEventListener('click', closeMap, false);

  /* ===== Keyboard: ESC close + Focus trap ===== */
  function isOpen(el){ return el && el.getAttribute('aria-hidden') === 'false'; }
  function trapFocus(container, ev){
    if (ev.key !== 'Tab') return;
    var focusables = qsa('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(function(el){ return !el.hasAttribute('disabled'); });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (ev.shiftKey && doc.activeElement === first) { last.focus(); ev.preventDefault(); }
    else if (!ev.shiftKey && doc.activeElement === last) { first.focus(); ev.preventDefault(); }
  }

  doc.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape'){
      if (isOpen(mapModal)) { closeMap(); return; }
      if (isOpen(offcanvas)) { closeMenu(); return; }
    }
    if (isOpen(mapModal)) trapFocus(qs('.modal-dialog', mapModal), ev);
    if (isOpen(offcanvas)) trapFocus(qs('.offcanvas-panel', offcanvas), ev);
  }, false);

  /* ===== Hero click → smooth scroll ===== */
  function smoothScrollTo(sel){
    var target = qs(sel);
    if (!target) return;
    try {
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    } catch(e){
      target.scrollIntoView(true);
    }
  }

  qsa('.js-scroll-to').forEach(function(el){
    var targetSel = el.getAttribute('data-target');
    el.addEventListener('click', function(ev){
      // CTA <a> дээр дарсан бол default навигацийг үл хөндөнө (# линк ажиллана)
      var t = ev.target || ev.srcElement;
      var isLink = t && ((t.tagName && t.tagName.toLowerCase() === 'a') || (t.closest && t.closest('a')));
      if (isLink) return;
      if (targetSel) smoothScrollTo(targetSel);
    }, false);
    el.addEventListener('keydown', function(ev){
      if (ev.key === 'Enter' || ev.key === ' '){
        ev.preventDefault();
        if (targetSel) smoothScrollTo(targetSel);
      }
    }, false);
  });

})();
//]]>