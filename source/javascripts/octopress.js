function getNav() {
  var mobileNav = $('nav[role=navigation] fieldset[role=search]').after('<fieldset class="mobile-nav"></fieldset>').next().append('<select></select>');
  mobileNav.children('select').append('<option value="">Navigate&hellip;</option>');
  $('ul[role=main-navigation]').addClass('main-navigation');
  $('ul.main-navigation a').each(function(link) {
    mobileNav.children('select').append('<option value="'+link.href+'">&raquo; '+link.text+'</option>');
  });
  $('ul.subscription a').each(function(link) {
    mobileNav.children('select').append('<option value="'+link.href+'">&raquo; '+link.text+'</option>');
  });
  mobileNav.children('select').bind('change', function(event) {
    if (event.target.value) { window.location.href = event.target.value; }
  });
}

function addSidebarToggler() {
  if(!$('body').hasClass('sidebar-footer')) {
    $('#content').append('<span class="toggle-sidebar"></span>');
    $('.toggle-sidebar').bind('click', function(e) {
      e.preventDefault();
      if ($('body').hasClass('collapse-sidebar')) {
        $('body').removeClass('collapse-sidebar');
      } else {
        $('body').addClass('collapse-sidebar');
      }
    });
  }
  var sections = $('aside.sidebar > section');
  if (sections.length > 1) {
    sections.each(function(section, index){
      if ((sections.length >= 3) && index % 3 === 0) {
        $(section).addClass("first");
      }
      var count = ((index +1) % 2) ? "odd" : "even";
      $(section).addClass(count);
    });
  }
  if (sections.length >= 3){ $('aside.sidebar').addClass('thirds'); }
}

function testFeatures() {
  var features = ['maskImage'];
  $(features).map(function(feature) {
    if (Modernizr.testAllProps(feature)) {
      $('html').addClass(feature);
    } else {
      $('html').addClass('no-'+feature);
    }
  });
  if ("placeholder" in document.createElement("input")) {
    $('html').addClass('placeholder');
  } else {
    $('html').addClass('no-placeholder');
  }
}

$.domReady(function() {
  testFeatures();
  getNav();
  addSidebarToggler();
});

// iOS scaling bug fix
// Rewritten version
// By @mathias, @cheeaun and @jdalton
// Source url: https://gist.github.com/901295
(function(doc) {
  var addEvent = 'addEventListener',
      type = 'gesturestart',
      qsa = 'querySelectorAll',
      scales = [1, 1],
      meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];
  function fix() {
    meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
    doc.removeEventListener(type, fix, true);
  }
  if ((meta = meta[meta.length - 1]) && addEvent in doc) {
    fix();
    scales = [0.25, 1.6];
    doc[addEvent](type, fix, true);
  }
}(document));

