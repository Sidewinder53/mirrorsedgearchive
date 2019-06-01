$(document).ready(function() {
  $.getScript('/assets/js/cookie-consent.js');

  if (is_touch_device() == true) {
    $('#touch_device_notice').html(
      '<div class="alert alert-primary" role="alert"><mark>Highlighted</mark> staff has been credited in both titles.</div>'
    );
    $('#touch_device_notice')
      .animate({ height: 100 }, 'slow')
      .fadeTo('slow', 1);
  }

  $(window).on('activate.bs.scrollspy', function() {
    updateBackground();
  });

  pagemap(document.querySelector('#map'), {
    viewport: null,
    styles: {
      'header,footer,section,article': 'rgba(0,0,0,0.08)',
      th: 'rgba(255,0,0,0.35)',
      h1: 'rgba(255,0,0,0.9)',
      '.alert': 'rgba(0,0,0,0.4)',
      '.art_space > img': 'rgba(255,0,0,0.08)',
      tr: 'rgba(0,0,0,0.03)'
    },
    back: '#f8f9fa',
    view: 'rgba(0,0,0,0.05)',
    drag: 'rgba(0,0,0,0.10)',
    interval: null
  });

  $('.int-nav-menu, .int-nav').click(function(e) {
    e.preventDefault();
    anchorScroll($(this), $($(this).attr('href')), 150);
  });

  function anchorScroll(this_obj, that_obj, base_speed) {
    var this_offset = this_obj.offset();
    var that_offset = that_obj.offset();
    var offset_diff = Math.abs(that_offset.top - this_offset.top + 56);

    var speed = offset_diff * base_speed / 900;

    $('html,body').animate(
      {
        scrollTop: that_offset.top - 56
      },
      {
        duration: speed,
        easing: 'easeOutCubic'
      }
    );
  }

  function updateBackground() {
    if (
      $('.me-nav-area').hasClass('active') &&
      $('#cd_me').css('opacity') < '1'
    ) {
      $('#cd_mec').fadeTo('fast', 0);
      $('#cd_me').fadeTo('medium', 1);
    } else if (
      !$('.me-nav-area').hasClass('active') &&
      $('#cd_mec').css('opacity') < '1'
    ) {
      $('#cd_me').fadeTo('fast', 0);
      $('#cd_mec').fadeTo('medium', 1);
    }
  }

  function is_touch_device() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
  }
});
